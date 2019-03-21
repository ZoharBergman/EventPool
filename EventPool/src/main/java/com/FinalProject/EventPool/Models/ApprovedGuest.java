package com.FinalProject.EventPool.Models;

import com.google.firebase.database.DatabaseReference;
import com.google.maps.model.LatLng;

/**
 * Created by Zohar on 01/01/2019.
 */
public class ApprovedGuest {
    // Consts
    public static final String COLLECTION_NAME = "approvedGuests";
    public static final String IS_COMING = "isComing";
    public static final String IS_CAR = "isCar";
    public static final String ID = "id";

    // Properties
    private String id;
    private String name;
    private String phoneNumber;
    private Boolean isComing;
    private Boolean isCar;
    private LatLng startLocation;

    // Ctor
    public ApprovedGuest() {}

    public ApprovedGuest(String id, Boolean isComing, Boolean isCar) {
        this.id = id;
    }

    // Methods
    public static DatabaseReference getReference(String eventId) {
        return Event.getReference().child(eventId).getRef().child(COLLECTION_NAME);
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public Boolean getComing() {
        return isComing;
    }

    public void setComing(Boolean coming) {
        isComing = coming;
    }

    public Boolean getCar() {
        return isCar;
    }

    public void setCar(Boolean car) {
        isCar = car;
    }

    public LatLng getStartLocation() {
        return startLocation;
    }

    public void setStartLocation(LatLng startLocation) {
        this.startLocation = startLocation;
    }
}
