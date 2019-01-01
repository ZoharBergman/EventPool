package com.FinalProject.EventPool.BL.CarpoolMatching;

import com.FinalProject.EventPool.Config.Firebase;
import com.FinalProject.EventPool.Models.ApprovedGuest;
import com.FinalProject.EventPool.Models.Geofire;
import com.FinalProject.EventPool.Models.Passenger;
import com.FinalProject.EventPool.Models.Route;
import com.firebase.geofire.GeoFire;
import com.firebase.geofire.GeoLocation;
import com.firebase.geofire.GeoQueryDataEventListener;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.ValueEventListener;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Semaphore;

/**
 * Created by Zohar on 31/12/2018.
 */
@Service
public class CarpoolMatchingBL implements ICarpoolMatching {

    @Override
    public void calcCarpoolMatching(String eventId, Double deviationRadius) throws InterruptedException {
        // Getting the passengers
        List<Passenger> lstPassengers = getPassengers(eventId);

        // Calc potential matching
        calcPotentialMatching(deviationRadius, lstPassengers, eventId);

        // Calc matching
        calcMatching();
    }

    public void calcPotentialMatching(Double deviationRadius, List<Passenger> lstPassengers, String eventId) {
        lstPassengers.forEach(passenger -> {
            // Find the drivers that are driving near the current passenger
            Geofire.getInstance(eventId).queryAtLocation(new GeoLocation(passenger.getStartLocation().lat, passenger.getStartLocation().lng),
                            deviationRadius)
                    .addGeoQueryDataEventListener(new GeoQueryDataEventListener() {
                        @Override
                        public void onDataEntered(DataSnapshot dataSnapshot, GeoLocation geoLocation) {
                            dataSnapshot.getValue();
                        }

                        @Override
                        public void onDataExited(DataSnapshot dataSnapshot) {
                        }

                        @Override
                        public void onDataMoved(DataSnapshot dataSnapshot, GeoLocation geoLocation) {
                        }

                        @Override
                        public void onDataChanged(DataSnapshot dataSnapshot, GeoLocation geoLocation) {
                        }

                        @Override
                        public void onGeoQueryReady() {
                        }

                        @Override
                        public void onGeoQueryError(DatabaseError databaseError) {
                        }
                    });
        });
    }

    private List<Route> getRoutesByEventId(String eventId) throws InterruptedException {
        // For synchronize against Firebase
        final Semaphore semaphore = new Semaphore(0);

        List<Route> lstDriversRoutes = new ArrayList<>();
        Route.getReference().orderByChild(Route.EVENT_ID).equalTo(eventId)
                .getRef()
                .addListenerForSingleValueEvent(new ValueEventListener() {
                    @Override
                    public void onDataChange(DataSnapshot dataSnapshot) {
                        dataSnapshot.getChildren().forEach(routeSnapshot -> {
                            lstDriversRoutes.add(routeSnapshot.getValue(Route.class));
                        });

                        semaphore.release();
                    }

                    @Override
                    public void onCancelled(DatabaseError databaseError) {
                        semaphore.release();
                    }
        });

        // Wait until Firebase responses
        semaphore.acquire();

        return lstDriversRoutes;
    }

    private List<Passenger> getPassengers(String eventId) throws InterruptedException {
        // For synchronize against Firebase
        final Semaphore semaphore = new Semaphore(0);

        List<Passenger> lstPassengers = new ArrayList<>();
        ApprovedGuest.getReference(eventId)
                .orderByChild(ApprovedGuest.IS_CAR).equalTo(false)
                .addListenerForSingleValueEvent(new ValueEventListener() {
                    @Override
                    public void onDataChange(DataSnapshot dataSnapshot) {
                        dataSnapshot.getChildren().forEach(passengerSnapshot -> {
                            lstPassengers.add(passengerSnapshot.getValue(Passenger.class));
                        });

                        semaphore.release();
                    }

                    @Override
                    public void onCancelled(DatabaseError databaseError) {
                        semaphore.release();
                    }
                });

        semaphore.acquire();

        return lstPassengers;
    }

    private void calcMatching() {

    }
}
