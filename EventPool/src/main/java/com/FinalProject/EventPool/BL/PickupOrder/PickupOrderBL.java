package com.FinalProject.EventPool.BL.PickupOrder;

import com.FinalProject.EventPool.Config.Keys;
import com.FinalProject.EventPool.Config.Log;
import com.FinalProject.EventPool.Models.Address;
import com.FinalProject.EventPool.Models.CarpoolGroup;
import com.FinalProject.EventPool.Models.Event;
import com.FinalProject.EventPool.Models.Passenger;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.ValueEventListener;
import com.google.maps.DirectionsApi;
import com.google.maps.GeoApiContext;
import com.google.maps.errors.ApiException;
import com.google.maps.model.DirectionsResult;
import com.google.maps.model.LatLng;
import com.google.maps.model.TravelMode;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedList;
import java.util.List;
import java.util.concurrent.Semaphore;
import java.util.function.Function;
import java.util.logging.Level;
import java.util.stream.Collectors;

/**
 * Created by Zohar on 21/03/2019.
 */
@Service
public class PickupOrderBL implements IPickupOrder{
    @Override
    public List<String> calcAndSavePickupOrder(String eventId, String groupId) throws InterruptedException, IOException, ApiException {
        CarpoolGroup carpoolGroup = getCarpoolGroup(eventId, groupId);
        LatLng eventLocation = getEventLocation(eventId);
        List<String> lstPickupOrder = getPickupOrder(carpoolGroup, eventLocation);
        savePickupOrder(groupId, eventId, lstPickupOrder);
        return lstPickupOrder;
    }

    @Override
    public void calcAndSavePickupOrders(Event event) throws InterruptedException {
        calcPickupOrder(event.getCarpoolGroups().values(), event.getAddress().getLocation());
        savePickupOrders(event.getCarpoolGroups().values(), event.getId());
    }

    @Override
    public void calcAndSavePickupOrders(String eventId) throws InterruptedException {
        LatLng eventLocation = getEventLocation(eventId);
        List<CarpoolGroup> lstCarpoolGroups = getCarpoolGroups(eventId);
        calcPickupOrder(lstCarpoolGroups, eventLocation);
        savePickupOrders(lstCarpoolGroups, eventId);
    }

    private void savePickupOrders(Collection<CarpoolGroup> carpoolGroups, String eventId) {
        Event.getReference().child(eventId).child(Event.CARPOOL_GROUPS).setValue(
                carpoolGroups.stream().collect(Collectors.toMap(CarpoolGroup::getId, Function.identity())),
                (databaseError, databaseReference) -> {
                });
    }

    private void savePickupOrder(String groupId, String eventId, List<String> lstPickupOrder) {
        CarpoolGroup.getReference(eventId, groupId).child(CarpoolGroup.PICKUP_ORDER)
                .setValue(lstPickupOrder, (databaseError, databaseReference) -> {});
    }

    private void calcPickupOrder(Collection<CarpoolGroup> carpoolGroups, LatLng eventLocation) {
        List<Thread> lstThreadsCalcPickupOrder = new LinkedList<>();

        carpoolGroups.forEach(carpoolGroup -> {
            if ((carpoolGroup.getPickupOrder() == null ) ||
                (carpoolGroup.getPickupOrder() != null && carpoolGroup.getPickupOrder().size() == 0)) {
                lstThreadsCalcPickupOrder.add(new Thread(() -> {
                    try {
                        carpoolGroup.setPickupOrder(getPickupOrder(carpoolGroup, eventLocation));
                    } catch (InterruptedException | ApiException | IOException e) {
                        e.printStackTrace();
                        Log.getInstance().log(Level.SEVERE, e.getMessage(), e);
                    }
                }));
            }
        });

        lstThreadsCalcPickupOrder.forEach(Thread::start);
        lstThreadsCalcPickupOrder.forEach(thread -> {
            try {
                thread.join();
            } catch (InterruptedException e) {
                e.printStackTrace();
                Log.getInstance().log(Level.SEVERE, e.getMessage(), e);
            }
        });
    }

    private List<CarpoolGroup> getCarpoolGroups(String eventId) throws InterruptedException {
        final Semaphore semaphore = new Semaphore(0);
        List<CarpoolGroup> lstCarpoolGroups = new LinkedList<>();

        Event.getReference().child(eventId).child(Event.CARPOOL_GROUPS).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                dataSnapshot.getChildren().forEach(carpoolGroupSnapshot ->
                        lstCarpoolGroups.add(carpoolGroupSnapshot.getValue(CarpoolGroup.class))
                );

                semaphore.release();
            }

            @Override
            public void onCancelled(DatabaseError databaseError) {
                semaphore.release();
            }
        });

        semaphore.acquire();
        return lstCarpoolGroups;
    }

    private List<String> getPickupOrder(CarpoolGroup carpoolGroup, LatLng eventLocation) throws InterruptedException, ApiException, IOException {
        GeoApiContext context = new GeoApiContext.Builder().apiKey(Keys.DIRECTIONS_API_KEY).build();
        List<Passenger> lstPassengers = new ArrayList<>(carpoolGroup.getPassengers().values());
        List<String> pickupOrder = new ArrayList<>(lstPassengers.size());
        lstPassengers.forEach(passenger -> pickupOrder.add(""));

        // Getting the directions
        DirectionsResult directionsResult = DirectionsApi
                .getDirections(context, carpoolGroup.getDriver().getStartAddress().getLocation().toString(), eventLocation.toString())
                .mode(TravelMode.DRIVING)
                .waypoints(lstPassengers.stream()
                        .map(passenger -> passenger.getStartAddress().getLocation())
                        .collect(Collectors.toList())
                        .toArray(new LatLng[lstPassengers.size()]))
                .optimizeWaypoints(true)
                .await();

        // Validating that we got a route
        if (directionsResult != null &&
                directionsResult.routes != null &&
                directionsResult.routes[0] != null &&
                directionsResult.routes[0].overviewPolyline != null) {
            // Getting the pickup order
            for (int curr = 0; curr < directionsResult.routes[0].waypointOrder.length; curr++) {
                pickupOrder.set(curr, lstPassengers.get(directionsResult.routes[0].waypointOrder[curr]).getId());
            }
        }

        return pickupOrder;
    }

    private LatLng getEventLocation(String eventId) throws InterruptedException {
        final Semaphore semaphore = new Semaphore(0);
        final LatLng[] eventLocation = new LatLng[1];

        Event.getReference().child(eventId).child(Event.ADDRESS).child(Event.LOCATION)
                .addListenerForSingleValueEvent(new ValueEventListener() {
                    @Override
                    public void onDataChange(DataSnapshot dataSnapshot) {
                        eventLocation[0] = dataSnapshot.getValue(LatLng.class);
                        semaphore.release();
                    }

                    @Override
                    public void onCancelled(DatabaseError databaseError) {
                        semaphore.release();
                    }
                });

        semaphore.acquire();

        return eventLocation[0];
    }

    private CarpoolGroup getCarpoolGroup(String eventId, String groupId) throws InterruptedException {
        final Semaphore semaphore = new Semaphore(0);
        final CarpoolGroup[] carpoolGroup = new CarpoolGroup[1];

        CarpoolGroup.getReference(eventId, groupId).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                carpoolGroup[0] = dataSnapshot.getValue(CarpoolGroup.class);
                semaphore.release();
            }

            @Override
            public void onCancelled(DatabaseError databaseError) {
                semaphore.release();
            }
        });

        semaphore.acquire();

        return carpoolGroup[0];
    }
}
