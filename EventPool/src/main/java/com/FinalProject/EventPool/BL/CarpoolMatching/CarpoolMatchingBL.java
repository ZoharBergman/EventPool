package com.FinalProject.EventPool.BL.CarpoolMatching;

import com.FinalProject.EventPool.Models.*;
import com.firebase.geofire.GeoLocation;
import com.firebase.geofire.GeoQueryDataEventListener;
import com.google.common.collect.HashBasedTable;
import com.google.common.collect.Table;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.ValueEventListener;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.Semaphore;
import java.util.function.BinaryOperator;
import java.util.function.Function;
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

        // Calc potential matching
        Table<Driver, Passenger, Double> potentialMatches = calcPotentialMatching(deviationRadius, lstPassengers, eventId);

        // Calc matching
        Map<String, Match> matches = calcMatching(potentialMatches);
    }

    private Table<Driver, Passenger, Double> calcPotentialMatching(Double deviationRadius, List<Passenger> lstPassengers, String eventId) {
        Table<Driver, Passenger, Double> potentialMatches = HashBasedTable.create();
        Map<String, Driver> mapDriversById = new HashMap<>();

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
                                                Driver driver;
                                                if (mapDriversById.containsKey(driverId)) {
                                                    driver = mapDriversById.get(driverId);
                                                } else {
                                                    driver = new Driver(driverId.toString(), new Integer(freeSeatsNum.toString()));
                                                    mapDriversById.put(driver.getDriverId(), driver);
                                                }

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

        return potentialMatches;
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

    private Map<String, Match> calcMatching(Table<Driver, Passenger, Double> potentialMatches) {
        Map<String, Match> matches = new HashMap<>();

        // Building the constraints list
        List<Function<Table<Driver, Passenger, Double>, Match>> prioritizedConstraints = new ArrayList();
        prioritizedConstraints.add(driverWithOnePassengerMatchCondition);
        prioritizedConstraints.add(passengersNumLessOrEqualToFreeSeatsNumCondition);
        prioritizedConstraints.add(passengersWithOneDriverMatchCondition);

        while (matchesExist(potentialMatches)) {
            Integer currConstraintIndex = 0;

            while (currConstraintIndex < prioritizedConstraints.size()) {
                Match match = prioritizedConstraints.get(currConstraintIndex).apply(potentialMatches);

                if (match == null) {
                    currConstraintIndex++;
                } else {
                    // Adding the match to the matches map
                    if (matches.containsKey(match.getDriverId())) {
                        matches.put(match.getDriverId(),
                                matches.get(match.getDriverId()).addPassengers(match.getSetPassengers()));
                    } else {
                        matches.put(match.getDriverId(), match);
                    }

                    removeMatchFromPotentialMatches(match, potentialMatches);
                    currConstraintIndex = 0;
                }
            }
        }

        return matches;
    }

    Function<Table<Driver, Passenger, Double>, Match> driverWithOnePassengerMatchCondition =
            (Table<Driver, Passenger, Double> potentialMatches) -> {
                Optional<Driver> optDriver = potentialMatches.rowKeySet().stream()
                        .filter(driver -> potentialMatches.row(driver).keySet().size() == 1)
                        .findFirst();

                return optDriver
                        .map(driver -> new Match(driver.getDriverId(), potentialMatches.row(driver).keySet()))
                        .orElse(null);
            };

    Function<Table<Driver, Passenger, Double>, Match> passengersNumLessOrEqualToFreeSeatsNumCondition =
            (Table<Driver, Passenger, Double> potentialMatches) -> {
        Optional<Driver> optDriver = potentialMatches.rowKeySet().stream()
                .filter(driver -> driver.getFreeSeatsNum() >= potentialMatches.row(driver).size()).findFirst();

        return optDriver
                .map(driver -> new Match(driver.getDriverId(), potentialMatches.row(driver).keySet()))
                .orElse(null);

    };

    Function<Table<Driver, Passenger, Double>, Match> passengersWithOneDriverMatchCondition =
            (Table<Driver, Passenger, Double> potentialMatches) -> {
        // Getting a driver that for his passenger, he is the only potential match of them
        Optional<Driver> optDriver = potentialMatches.rowKeySet().stream().filter(driver ->
            potentialMatches.row(driver).keySet().stream()
                    .anyMatch(passenger -> potentialMatches.column(passenger).keySet().size() == 1)
        ).findFirst();

        if (optDriver.isPresent()) {
            Driver driver = optDriver.get();

            // Getting the passenger with one driver match that is the closest to the driver
            Optional<Passenger> optPassenger = potentialMatches.row(driver).keySet().stream()
                    .filter(passenger -> potentialMatches.column(passenger).keySet().size() == 1)
                    .reduce((passenger1, passenger2) -> {
                        if (potentialMatches.get(driver, passenger1) > potentialMatches.get(driver, passenger2)) {
                            return passenger2;
                        } else {
                            return passenger1;
                        }
                    });

            optPassenger
                    .map(passenger -> new Match(driver.getDriverId(), passenger))
                    .orElse(null);
        }

        return null;
    };

    private void removeDriversWithNoFreeSeats(Table<Driver, Passenger, Double> potentialMatches) {
        potentialMatches.rowKeySet().stream()
                .filter(driver -> driver.getFreeSeatsNum().equals(0))
                .forEach(driver -> potentialMatches.row(driver).keySet()
                        .forEach(passenger -> potentialMatches.remove(driver, passenger)));
    }

    private void removeMatchFromPotentialMatches(Match match, Table<Driver, Passenger, Double> potentialMatches) {
        // Getting the driver
        Optional<Driver> optDriver = potentialMatches.rowKeySet().stream()
                .filter(driver -> driver.getDriverId().equals(match.getDriverId())).findFirst();

        // Remove the matches
        optDriver.ifPresent(
                driver -> {
                    driver.setFreeSeatsNum(driver.getFreeSeatsNum() - match.getSetPassengers().size());
                    match.getSetPassengers().forEach(passenger -> potentialMatches.remove(driver, passenger));
                });
    }

    private Boolean matchesExist(Table<Driver, Passenger, Double> potentialMatches) {
        return potentialMatches.rowKeySet().stream()
                .anyMatch(driver -> driver.getFreeSeatsNum() > 0 && potentialMatches.row(driver).keySet().size() > 0);
    }
}
