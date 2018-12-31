package com.FinalProject.EventPool.Models;

import com.google.type.LatLng;

/**
 * Created by Zohar on 31/12/2018.
 */
public class Passenger {
    private String fullName;
    private LatLng startLocation;
    private String id;

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public LatLng getStartLocation() {
        return startLocation;
    }

    public void setStartLocation(LatLng startLocation) {
        this.startLocation = startLocation;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }
}
