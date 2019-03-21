package com.FinalProject.EventPool.Models;

/**
 * Created by Zohar on 02/01/2019.
 */
public class Driver extends ApprovedGuest{
    // Consts
    public static final String FREE_SEATS_NUM = "freeSeatsNum";

    // Properties
    private Integer freeSeatsNum;

    // Ctor
    public Driver() {super();}

    public Driver(String id) {
        super(id, true, true);
        this.freeSeatsNum = 0;
    }

    public Driver(String id, Integer freeSeatsNum) {
        super(id, true, true);
        this.freeSeatsNum = freeSeatsNum;
    }

    // Getters & Setters
    public Integer getFreeSeatsNum() {
        return freeSeatsNum;
    }

    public void setFreeSeatsNum(Integer freeSeatsNum) {
        this.freeSeatsNum = freeSeatsNum;
    }
}
