package com.FinalProject.EventPool.BL.CarpoolMatching;

import com.FinalProject.EventPool.Models.*;
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

        // Optimize the matches
        optimizeMatches(matches, potentialMatches);

        return matches.values();
    }

    private void optimizeMatches(Map<String, Match> matches, Table<Driver, Passenger, Double> potentialMatches) {
        // Creating a set of all the passengers that were matched
        Set<Passenger> setMatchedPassengers = matches.values().stream().map(Match::getSetPassengers)
                .flatMap(Collection::stream).collect(Collectors.toSet());

        if (setMatchedPassengers.size() == potentialMatches.columnKeySet().size()) {
            return;
        }

        // Creating a map of drivers by id
        Map<String, Driver> mapDrivers = potentialMatches.rowKeySet().stream()
                .collect(Collectors.toMap(Driver::getId, Function.identity()));

        // Optimize the matches according to the distance between the drivers and the passengers
        matches.forEach((driverId, match) -> {
            Driver driver = mapDrivers.get(driverId);

            // Getting the potential passengers of the current driver that has no match
            List<Passenger> lstPassengersWithoutMatch = potentialMatches.row(driver).keySet().stream()
                    .filter(passenger -> !setMatchedPassengers.contains(passenger)).collect(Collectors.toList());

            lstPassengersWithoutMatch.forEach(passengerWithoutMatch -> {
                Double maxDistanceBetweenDriverAndMatchedPassenger = match.getSetPassengers().stream()
                        .map(passenger -> potentialMatches.get(driver, passenger))
                        .reduce(Math::max).get();

                Optional<Passenger> farthestMatchedPassengerOpt = potentialMatches.row(driver).keySet().stream()
                        .filter(passenger -> potentialMatches.get(driver, passenger)
                                        .equals(maxDistanceBetweenDriverAndMatchedPassenger))
                        .findFirst();

                farthestMatchedPassengerOpt.ifPresent(farthestMatchedPassenger -> {
                    // In case the current 'without match passenger' is closer to the
                    // driver than the farthest matched passengers - switch them
                    if (maxDistanceBetweenDriverAndMatchedPassenger > potentialMatches.get(driver, passengerWithoutMatch)) {
                        // Add the not matched passenger to the match
                        match.getSetPassengers().add(passengerWithoutMatch);
                        setMatchedPassengers.add(passengerWithoutMatch);

                        // Remove the matched passenger from the match
                        match.getSetPassengers().remove(farthestMatchedPassenger);
                        setMatchedPassengers.remove(farthestMatchedPassenger);
                    }
                });
            });
        });
    }

    private Table<Driver, Passenger, Double> calcPotentialMatching(Double deviationRadius, List<Passenger> lstPassengers, String eventId) {
        Table<Driver, Passenger, Double> potentialMatches = HashBasedTable.create();
        ConcurrentMap<String, Driver> mapDriversById = new ConcurrentHashMap<>();
        List<PotentialMatchThread> lstPotentialMatchThreads = new LinkedList<>();

        // Calculating for each passenger his potential matches
        lstPassengers.forEach(passenger ->
            lstPotentialMatchThreads.add(
                    new PotentialMatchThread(potentialMatches, deviationRadius, passenger, eventId, mapDriversById))
        );

        lstPotentialMatchThreads.forEach(Thread::start);
        lstPotentialMatchThreads.forEach(potentialMatchThread -> {
            try {
                potentialMatchThread.join();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        });

        getDriversFreeSeatsNum(eventId, mapDriversById);

        return potentialMatches;
    }

    private static void getDriversFreeSeatsNum(String eventId, ConcurrentMap<String, Driver> mapDriversById) {
        if (mapDriversById.size() == 0) {
            return;
        }

        // For synchronize against Firebase
        final Semaphore semaphore = new Semaphore(0);

        // Get drivers
        ApprovedGuest.getReference(eventId)
                .orderByChild(ApprovedGuest.IS_CAR).equalTo(true)
                .addListenerForSingleValueEvent(new ValueEventListener() {
                    @Override
                    public void onDataChange(DataSnapshot dataSnapshot) {
                        dataSnapshot.getChildren().forEach(driverSnapshot -> {
                            if (mapDriversById.containsKey(((Map)driverSnapshot.getValue()).get(ApprovedGuest.ID))) {
                                mapDriversById.get(((Map) driverSnapshot.getValue()).get(ApprovedGuest.ID))
                                        .setFreeSeatsNum(
                                                Integer.parseInt(((Map) driverSnapshot.getValue())
                                                        .get(Driver.FREE_SEATS_NUM).toString())
                                        );
                            }
                        });

                        semaphore.release();
                    }

                    @Override
                    public void onCancelled(DatabaseError databaseError) {
                        semaphore.release();
                    }
                });

        try {
            semaphore.acquire();
        } catch (InterruptedException e) {
            e.printStackTrace();
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
                        dataSnapshot.getChildren().forEach(passengerSnapshot ->
                            lstPassengers.add(passengerSnapshot.getValue(Passenger.class))
                        );

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
            flowNet.addVertex(passenger.getId());
            Edge<String> e = new Edge<>(SOURCE, passenger.getId(), 1);
            flowNet.addEdge(SOURCE, passenger.getId(), e);
            flowNet.setEdgeWeight(e, e.getWeight());
        });

        // Creating a vertex for each driver and adding edges between the drivers' vertices and the target
        potentialMatches.rowKeySet().forEach(driver -> {
            flowNet.addVertex(driver.getId());
            Edge<String> e = new Edge<>(driver.getId(), TARGET, driver.getFreeSeatsNum());
            flowNet.addEdge(driver.getId(), TARGET, e);
            flowNet.setEdgeWeight(e, e.getWeight());
        });

        // Adding edges between the passengers and the drivers that have a potential match
        potentialMatches.columnKeySet().forEach(passenger ->
                potentialMatches.column(passenger).keySet().forEach(driver -> {
                    Edge<String> e = new Edge<>(passenger.getId(), driver.getId(),1);
                    flowNet.addEdge(passenger.getId(), driver.getId(), e);
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
                Collectors.toMap(Passenger::getId, Function.identity()));

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
