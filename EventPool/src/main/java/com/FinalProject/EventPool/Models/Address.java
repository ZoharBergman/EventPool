package com.FinalProject.EventPool.Models;

import com.google.maps.model.LatLng;

/**
 * Created by Zohar on 27/03/2019.
 */
public class Address {
    // Properties
    private LatLng location;
    private String name;

    // Ctor
    public Address() {

    }

    // Methods

    public LatLng getLocation() {
        return location;
    }

    public void setLocation(LatLng location) {
        this.location = location;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
