package com.FinalProject.EventPool.BL.PickupOrder;

import com.FinalProject.EventPool.Config.Keys;
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

import java.io.IOException;
import java.util.LinkedList;
import java.util.List;
import java.util.concurrent.Semaphore;
import java.util.stream.Collectors;

/**
 * Created by Zohar on 21/03/2019.
 */
public class PickupOrderBL implements IPickupOrder{
    @Override
    public String[] calcPickupOrder(String eventId, String groupId) throws InterruptedException {
        CarpoolGroup carpoolGroup = getCarpoolGroup(eventId, groupId);
        LatLng eventLocation = getEventLocation(eventId);
        return getPickupOrder(carpoolGroup, eventLocation);
    }

    @Override
    public void calcAndSavePickupOrders(String eventId) throws InterruptedException {
        LatLng eventLocation = getEventLocation(eventId);
        List<CarpoolGroup> lstCarpoolGroups = getCarpoolGroups(eventId);
        calcPickupOrder(lstCarpoolGroups, eventLocation);
        savePickupOrders(lstCarpoolGroups);
    }

    private void savePickupOrders(List<CarpoolGroup> lstCarpoolGroups) {

    }

    private void calcPickupOrder(List<CarpoolGroup> lstCarpoolGroups, LatLng eventLocation) {
        List<Thread> lstThreadsCalcPickupOrder = new LinkedList<>();

        lstCarpoolGroups.forEach(carpoolGroup ->
            lstThreadsCalcPickupOrder.add(new Thread(() -> {
                String[] pickupOrder = getPickupOrder(carpoolGroup, eventLocation);
                carpoolGroup.setPickupOrder(pickupOrder);
            }))
        );

        lstThreadsCalcPickupOrder.forEach(Thread::start);
        lstThreadsCalcPickupOrder.forEach(thread -> {
            try {
                thread.join();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        });
    }

    private List<CarpoolGroup> getCarpoolGroups(String eventId) throws InterruptedException {
        final Semaphore semaphore = new Semaphore(0);
        List<CarpoolGroup> lstCarpoolGroups = new LinkedList<>();

        Event.getReference().child(Event.CARPOOL_GROUPS).addListenerForSingleValueEvent(new ValueEventListener() {
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

    private String[] getPickupOrder(CarpoolGroup carpoolGroup, LatLng eventLocation) {
        GeoApiContext context = new GeoApiContext.Builder().apiKey(Keys.DIRECTIONS_API_KEY).build();
        String[] pickupOrder = new String[carpoolGroup.getPassengers().size()];

        try {
            // Getting the directions
            DirectionsResult directionsResult = DirectionsApi
                    .getDirections(context, carpoolGroup.getDriver().getStartLocation().toString(), eventLocation.toString())
                    .mode(TravelMode.DRIVING)
                    .waypoints(carpoolGroup.getPassengers().stream()
                            .map(Passenger::getStartLocation)
                            .collect(Collectors.toList())
                            .toArray(new LatLng[carpoolGroup.getPassengers().size()]))
                    .optimizeWaypoints(true)
                    .await();

            // Validating that we got a route
            if (directionsResult != null &&
                    directionsResult.routes != null &&
                    directionsResult.routes[0] != null &&
                    directionsResult.routes[0].overviewPolyline != null) {
                // Getting the pickup order
                for (Integer curr : directionsResult.routes[0].waypointOrder) {
                    pickupOrder[curr] = carpoolGroup.getPassengers().get(curr).getId();
                }
            }
        } catch (ApiException | InterruptedException | IOException e) {
            e.printStackTrace();
        }

        return pickupOrder;
    }

    private LatLng getEventLocation(String eventId) throws InterruptedException {
        final Semaphore semaphore = new Semaphore(0);
        final LatLng[] eventLocation = {null};

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
