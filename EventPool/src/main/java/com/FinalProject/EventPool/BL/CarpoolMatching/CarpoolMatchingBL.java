package com.FinalProject.EventPool.BL.CarpoolMatching;

import android.view.GestureDetector;
import com.FinalProject.EventPool.Models.*;
import com.firebase.geofire.GeoLocation;
import com.firebase.geofire.GeoQueryDataEventListener;
import com.google.common.collect.HashBasedTable;
import com.google.common.collect.Table;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.ValueEventListener;
import org.jgrapht.alg.flow.DinicMFImpl;
import org.jgrapht.alg.interfaces.MaximumFlowAlgorithm;
import org.jgrapht.graph.DirectedWeightedMultigraph;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.Semaphore;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Created by Zohar on 31/12/2018.
 */
@Service
public class CarpoolMatchingBL implements ICarpoolMatching {
    public static final String SOURCE = "SOURCE";
    public static final String TARGET = "TARGET";

    @Override
    public Collection<Match> calcCarpoolMatching(String eventId, Double deviationRadius) throws InterruptedException {
        // Getting the passengers
        List<Passenger> lstPassengers = getPassengers(eventId);

        // Calc potential matching
        Table<Driver, Passenger, Double> potentialMatches = calcPotentialMatching(deviationRadius, lstPassengers, eventId);

        // Calc matching
        Map<String, Match> matches = calcMatching(potentialMatches);
        return matches.values();
    }

    private Table<Driver, Passenger, Double> calcPotentialMatching(Double deviationRadius, List<Passenger> lstPassengers, String eventId) {
        Table<Driver, Passenger, Double> potentialMatches = HashBasedTable.create();
        ConcurrentMap<String, Driver> mapDriversById = new ConcurrentHashMap<>();

        // Going over the passengers
        lstPassengers.forEach(passenger -> {
//            final Semaphore semaphore = new Semaphore(0);
//
//            // Find the locations of the drivers that are driving near the current passenger
//            Geofire.getInstance(eventId).queryAtLocation(new GeoLocation(passenger.getStartLocation().lat, passenger.getStartLocation().lng),
//                    deviationRadius)
//                    .addGeoQueryDataEventListener(new GeoQueryDataEventListener() {
//                        @Override
//                        public void onDataEntered(DataSnapshot locationSnapshot, GeoLocation geoLocation) {
//                            // Get the drivers that are driving through the location
//                            GeofireToDriver.getReference().child(eventId).child(locationSnapshot.getKey())
//                                    .addListenerForSingleValueEvent(new ValueEventListener() {
//                                        @Override
//                                        public void onDataChange(DataSnapshot driversSnapshot) {
//                                            // Going over the drivers
//                                            ((Map)driversSnapshot.getValue()).forEach((driverId, freeSeatsNum) -> {
//                                                Driver driver;
//                                                if (mapDriversById.containsKey(driverId)) {
//                                                    driver = mapDriversById.get(driverId);
//                                                } else {
//                                                    driver = new Driver(driverId.toString(), new Integer(freeSeatsNum.toString()));
//                                                    mapDriversById.put(driver.getDriverId(), driver);
//                                                }
//
//                                                Double distance = distanceInKm(
//                                                        passenger.getStartLocation().lat,
//                                                        passenger.getStartLocation().lng,
//                                                        geoLocation.latitude,
//                                                        geoLocation.longitude);
//
//                                                synchronized (potentialMatches) {
//                                                    if (potentialMatches.contains(driver, passenger)) {
//                                                        potentialMatches.put(
//                                                                driver,
//                                                                passenger,
//                                                                Math.min(distance, potentialMatches.get(driver, passenger)));
//                                                    } else {
//                                                        potentialMatches.put(driver, passenger, distance);
//                                                    }
//                                                }
//                                            });
//                                        }
//
//                                        @Override
//                                        public void onCancelled(DatabaseError databaseError) {
//
//                                        }
//                                    });
//                        }
//
//                        @Override
//                        public void onDataExited(DataSnapshot dataSnapshot) {
//                        }
//
//                        @Override
//                        public void onDataMoved(DataSnapshot dataSnapshot, GeoLocation geoLocation) {
//                        }
//
//                        @Override
//                        public void onDataChanged(DataSnapshot dataSnapshot, GeoLocation geoLocation) {
//                        }
//
//                        @Override
//                        public void onGeoQueryReady() {
//                            semaphore.release();
//                        }
//
//                        @Override
//                        public void onGeoQueryError(DatabaseError databaseError) {
//                        }
//                    });
//
//            try {
//                semaphore.acquire();
//            } catch (InterruptedException e) {
//                e.printStackTrace();
//            }
        });

        return potentialMatches;
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

    private DirectedWeightedMultigraph<String, Edge> buildFlowNetwork(Table<Driver, Passenger, Double> potentialMatches) {
        DirectedWeightedMultigraph<String, Edge> flowNet = new DirectedWeightedMultigraph<>(Edge.class);

        // Adding source and target vertices
        flowNet.addVertex(SOURCE);
        flowNet.addVertex(TARGET);

        // Creating a vertex for each passenger and adding edges between the source and the passengers' vertices
        potentialMatches.columnKeySet().forEach(passenger -> {
            flowNet.addVertex(passenger.getGuestId());
            Edge<String> e = new Edge<>(SOURCE, passenger.getGuestId(), 1);
            flowNet.addEdge(SOURCE, passenger.getGuestId(), e);
            flowNet.setEdgeWeight(e, e.getWeight());
        });

        // Creating a vertex for each driver and adding edges between the drivers' vertices and the target
        potentialMatches.rowKeySet().forEach(driver -> {
            flowNet.addVertex(driver.getDriverId());
            Edge<String> e = new Edge<>(driver.getDriverId(), TARGET, driver.getFreeSeatsNum());
            flowNet.addEdge(driver.getDriverId(), TARGET, e);
            flowNet.setEdgeWeight(e, e.getWeight());
        });

        // Adding edges between the passengers and the drivers that have a potential match
        potentialMatches.columnKeySet().forEach(passenger ->
                potentialMatches.column(passenger).keySet().forEach(driver -> {
                    Edge<String> e = new Edge<>(passenger.getGuestId(), driver.getDriverId(),1);
                    flowNet.addEdge(passenger.getGuestId(), driver.getDriverId(), e);
                    flowNet.setEdgeWeight(e, e.getWeight());
                        }
                )
        );

        return flowNet;
    }

    private Map<String, Match> calcMatching(Table<Driver, Passenger, Double> potentialMatches) {
        Map<String, Match> matches = new HashMap<>();

        // Building the flow network and calculating the max flow
        DirectedWeightedMultigraph<String, Edge> flowNet = buildFlowNetwork(potentialMatches);
        MaximumFlowAlgorithm<String, Edge> solver = new DinicMFImpl<>(flowNet);
        MaximumFlowAlgorithm.MaximumFlow<Edge> maximumFlow = solver.getMaximumFlow(SOURCE, TARGET);

        // Building a map of the passengers
        Map<String, Passenger> mapPassengers = potentialMatches.columnKeySet().stream().collect(
                Collectors.toMap(Passenger::getGuestId, Function.identity()));

        //Building the matches
        maximumFlow.getFlowMap().forEach((edge, flow) -> {
            // Getting the saturated edges between the passengers and the drivers vertices
            if (flow > 0 && !edge.getSource().equals(SOURCE) && !edge.getTarget().equals(TARGET)) {
                String driverId = edge.getTarget().toString();
                Passenger passenger = mapPassengers.get(edge.getSource().toString());

                // Adding the match to the matches map
                if (matches.containsKey(driverId)) {
                    matches.put(driverId, matches.get(driverId).addPassenger(passenger));
                } else {
                    matches.put(driverId, new Match(driverId, passenger));
                }
            }
        });

        return matches;
    }
}
