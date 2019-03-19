package com.FinalProject.EventPool.Models;

/**
 * Created by Zohar on 02/01/2019.
 */
public class Driver {
    // Properties
    private String driverId;
    private Integer freeSeatsNum;

    // Ctor
    public Driver(String driverId) {
        this.driverId = driverId;
        this.freeSeatsNum = 0;
    }

    public Driver(String driverId, Integer freeSeatsNum) {
        this.driverId = driverId;
        this.freeSeatsNum = freeSeatsNum;
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
}
