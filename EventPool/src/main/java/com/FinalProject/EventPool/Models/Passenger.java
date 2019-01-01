package com.FinalProject.EventPool.Models;

import com.google.maps.model.LatLng;

/**
 * Created by Zohar on 31/12/2018.
 */
public class Passenger {
    // Properties
    private String guestId;
    private LatLng startLocation;

    // Ctor
    public Passenger() {}

    // Getters & Setters
    public LatLng getStartLocation() {
        return startLocation;
    }

    public void setStartLocation(LatLng startLocation) {
        this.startLocation = startLocation;
    }

    public String getGuestId() {
        return guestId;
    }

    public void setGuestId(String guestId) {
        this.guestId = guestId;
    }
}
