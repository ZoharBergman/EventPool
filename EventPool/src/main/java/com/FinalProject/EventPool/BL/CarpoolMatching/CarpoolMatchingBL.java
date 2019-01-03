package com.FinalProject.EventPool.BL.CarpoolMatching;

import com.FinalProject.EventPool.Models.*;
import com.firebase.geofire.GeoLocation;
import com.firebase.geofire.GeoQueryDataEventListener;
import com.google.common.collect.ArrayTable;
import com.google.common.collect.HashBasedTable;
import com.google.common.collect.Table;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.ValueEventListener;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Semaphore;
import java.util.stream.Collectors;

/**
 * Created by Zohar on 31/12/2018.
 */
@Service
public class CarpoolMatchingBL implements ICarpoolMatching {
    @Override
    public void calcCarpoolMatching(String eventId, Double deviationRadius) throws InterruptedException {
        // Getting the passengers
        List<Passenger> lstPassengers = getPassengers(eventId);

        Table<Driver, Passenger, Double> potentialMatches = HashBasedTable.create();

        // Calc potential matching
        Map<String, PotentialMatch> mapPotentialMatch = calcPotentialMatching(deviationRadius, lstPassengers, eventId);

        // Calc matching
        calcMatching(mapPotentialMatch);
    }

    private Map<String, PotentialMatch> calcPotentialMatching(Double deviationRadius, List<Passenger> lstPassengers, String eventId) {
        Map<String, PotentialMatch> mapPotentialMatches = new HashMap<>();
        Table<Driver, Passenger, Double> potentialMatches = HashBasedTable.create();

        // Going over the passengers
        lstPassengers.forEach(passenger -> {
            final Semaphore semaphore = new Semaphore(0);

            // Find the locations of the drivers that are driving near the current passenger
            Geofire.getInstance(eventId).queryAtLocation(new GeoLocation(passenger.getStartLocation().lat, passenger.getStartLocation().lng),
                            deviationRadius)
                    .addGeoQueryDataEventListener(new GeoQueryDataEventListener() {
                        @Override
                        public void onDataEntered(DataSnapshot locationSnapshot, GeoLocation geoLocation) {
                            // Get the drivers that are driving through the location
                            GeofireToDriver.getReference().child(eventId).child(locationSnapshot.getKey())
                                    .addListenerForSingleValueEvent(new ValueEventListener() {
                                        @Override
                                        public void onDataChange(DataSnapshot driversSnapshot) {
                                            // Going over the drivers
                                            ((Map)driversSnapshot.getValue()).forEach((driverId, freeSeatsNum) -> {
                                                Driver driver = new Driver(driverId.toString(), new Integer(freeSeatsNum.toString()));
                                                Double distance = distanceInKm(
                                                        passenger.getStartLocation().lat,
                                                        passenger.getStartLocation().lng,
                                                        geoLocation.latitude,
                                                        geoLocation.longitude);

                                                if (potentialMatches.contains(driver, passenger)) {
                                                    potentialMatches.put(
                                                            driver,
                                                            passenger,
                                                            Math.min(distance, potentialMatches.get(driver, passenger)));
                                                } else {
                                                    potentialMatches.put(driver, passenger, distance);

                                                }
                                            });
                                        }

                                        @Override
                                        public void onCancelled(DatabaseError databaseError) {

                                        }
                                    });
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
                            semaphore.release();
                        }

                        @Override
                        public void onGeoQueryError(DatabaseError databaseError) {
                        }
                    });

            try {
                semaphore.acquire();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        });

        return mapPotentialMatches;
    }

    private static double distanceInKm(double lat1, double lon1, double lat2, double lon2) {
        if ((lat1 == lat2) && (lon1 == lon2)) {
            return 0;
        }
        else {
            double theta = lon1 - lon2;
            double dist = Math.sin(Math.toRadians(lat1)) * Math.sin(Math.toRadians(lat2)) + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) * Math.cos(Math.toRadians(theta));
            dist = Math.acos(dist);
            dist = Math.toDegrees(dist);
            dist = dist * 60 * 1.1515;
            // Make the dist in KM
            dist = dist * 1.609344;

            return (dist);
        }
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

    private void calcMatching(Map<String, PotentialMatch> mapPotentialMatch) {

    }

    private List<PotentialMatch> passengersEqualFreeSeatsNumCondition(Map<String, PotentialMatch> mapPotentialMatch) {
        return mapPotentialMatch.values().stream()
                .filter(potentialMatch -> potentialMatch.getFreeSeatsNum().equals(potentialMatch.getSetPassengers().size()))
                .collect(Collectors.toList());
    }

    private List<PotentialMatch> passengersWithOneDriverMatchCondition() {
        return null;
    }

//    private List<PotentialMatch>
}
