package com.FinalProject.EventPool.Models;

import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Set;

/**
 * Created by Zohar on 02/01/2019.
 */
public class Match {
    // Properties
    private String driverId;
    private Set<Passenger> setPassengers;

    // Ctor
    public Match(String driverId) {
        this.driverId = driverId;
        this.setPassengers = new HashSet<>();
    }

    public Match(String driverId, @NotNull Set<Passenger> setPassengers) {
        this.driverId = driverId;
        this.setPassengers = setPassengers;
    }

    public Match(String driverId, Passenger passenger) {
        this.driverId = driverId;
        this.setPassengers = new HashSet<>();
        addPassenger(passenger);
    }

    // Methods
    public Match addPassengers(Set<Passenger> setPassengers) {
        this.setPassengers.addAll(setPassengers);
        return this;
    }

    public Match addPassenger(Passenger passenger) {
        this.setPassengers.add(passenger);
        return this;
    }

    // Getters & Setters
    public String getDriverId() {
        return driverId;
    }

    public void setDriverId(String driverId) {
        this.driverId = driverId;
    }

    public Set<Passenger> getSetPassengers() {
        return setPassengers;
    }

    public void setSetPassengers(Set<Passenger> setPassengers) {
        this.setPassengers = setPassengers;
    }
}
