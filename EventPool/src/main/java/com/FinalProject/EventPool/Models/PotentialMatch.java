package com.FinalProject.EventPool.Models;

import java.util.HashSet;
import java.util.Set;

/**
 * Created by Zohar on 02/01/2019.
 */
public class PotentialMatch {
    // Properties
    private String driverId;
    private Integer freeSeatsNum;
    private Set<Passenger> setPassengers;

    // Ctor
    public PotentialMatch(String driverId, Integer freeSeatsNum) {
        this.driverId = driverId;
        this.freeSeatsNum = freeSeatsNum;
        this.setPassengers = new HashSet<>();
    }

    // Methods
    public void addPassenger(Passenger passenger) {
        this.setPassengers.add(passenger);
    }

    // Getters & Setters
    public String getDriverId() {
        return driverId;
    }

    public void setDriverId(String driverId) {
        this.driverId = driverId;
    }

    public Integer getFreeSeatsNum() {
        return freeSeatsNum;
    }

    public void setFreeSeatsNum(Integer freeSeatsNum) {
        this.freeSeatsNum = freeSeatsNum;
    }

    public Set<Passenger> getSetPassengers() {
        return setPassengers;
    }

    public void setSetPassengers(Set<Passenger> setPassengers) {
        this.setPassengers = setPassengers;
    }
}
