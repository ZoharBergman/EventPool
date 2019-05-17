package com.FinalProject.EventPool.BL.CarpoolMatching;

import com.FinalProject.EventPool.Config.Log;
import com.FinalProject.EventPool.Models.*;
import com.firebase.geofire.GeoLocation;
import com.firebase.geofire.GeoQueryDataEventListener;
import com.google.common.collect.Table;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.ValueEventListener;

import java.util.Map;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.Semaphore;
import java.util.logging.Level;

/**
 * Created by Zohar on 17/03/2019.
 */
public class PotentialMatchThread extends Thread{
    // Properties
    final Table<Driver, Passenger, Double> potentialMatches;
    Double deviationRadius;
    Passenger passenger;
    String eventId;
    Integer numOfHandledGeoLocations;
    ConcurrentMap<String, Driver> mapDriversById;

    // Ctor
    public PotentialMatchThread(Table<Driver, Passenger, Double> potentialMatches, Double deviationRadius, Passenger passenger, String eventId, ConcurrentMap<String, Driver> mapDriversById) {
        super();
        this.potentialMatches = potentialMatches;
        this.deviationRadius = deviationRadius;
        this.passenger = passenger;
        this.eventId = eventId;
        this.mapDriversById = mapDriversById;
        this.numOfHandledGeoLocations = 0;
    }

    @Override
    public void run() {
        Semaphore geoLocationQuery = new Semaphore(0);
        Semaphore counterIsZero = new Semaphore(0);

        // Find the locations of the drivers that are driving near the passenger
        Geofire.getInstance(eventId).queryAtLocation(
                new GeoLocation(passenger.getStartAddress().getLocation().lat, passenger.getStartAddress().getLocation().lng),
                deviationRadius)
                .addGeoQueryDataEventListener(new GeoQueryDataEventListener() {
                    @Override
                    public void onDataEntered(DataSnapshot locationSnapshot, GeoLocation geoLocation) {
                        synchronized (numOfHandledGeoLocations) {
                            numOfHandledGeoLocations++;
                        }

                        // Get the drivers ids' that are driving through the location
                        GeofireToDriver.getReference().child(eventId).child(locationSnapshot.getKey())
                                .addListenerForSingleValueEvent(new ValueEventListener() {
                                    @Override
                                    public void onDataChange(DataSnapshot driversSnapshot) {
                                        // Going over the drivers
                                        ((Map)driversSnapshot.getValue()).keySet().forEach(driverId -> {
                                            Driver driver;
                                            synchronized (mapDriversById) {
                                                if (mapDriversById.containsKey(driverId)) {
                                                    driver = mapDriversById.get(driverId);
                                                } else {
                                                    driver = new Driver(driverId.toString());
                                                    mapDriversById.put(driver.getId(), driver);
                                                }
                                            }

                                            Double distance = distanceInKm(
                                                    passenger.getStartAddress().getLocation().lat,
                                                    passenger.getStartAddress().getLocation().lng,
                                                    geoLocation.latitude,
                                                    geoLocation.longitude);

                                            synchronized (potentialMatches) {
                                                if (potentialMatches.contains(driver, passenger)) {
                                                    potentialMatches.put(
                                                            driver,
                                                            passenger,
                                                            Math.min(distance, potentialMatches.get(driver, passenger)));
                                                } else {
                                                    potentialMatches.put(driver, passenger, distance);
                                                }
                                            }
                                        });

                                        synchronized (numOfHandledGeoLocations) {
                                            numOfHandledGeoLocations--;

                                            if (numOfHandledGeoLocations <= 0) {
                                                counterIsZero.release();
                                            }
                                        }
                                    }

                                    @Override
                                    public void onCancelled(DatabaseError databaseError) {
                                        synchronized (numOfHandledGeoLocations) {
                                            numOfHandledGeoLocations--;

                                            if (numOfHandledGeoLocations == 0) {
                                                counterIsZero.release();
                                            }
                                        }
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
                        geoLocationQuery.release();
                    }

                    @Override
                    public void onGeoQueryError(DatabaseError databaseError) {
                    }
                });

        try {
            geoLocationQuery.acquire();

            if (numOfHandledGeoLocations > 0) {
                counterIsZero.acquire();
            }
        } catch (InterruptedException e) {
            Log.getInstance().log(Level.SEVERE, e.getMessage(), e);
        }
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
}
