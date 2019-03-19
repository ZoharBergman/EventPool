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
    public static final String GUEST_ID = "guestId";
    public static final String FREE_SEATS_NUM = "freeSeatsNum";

    // Properties
    private String guestId;
    private String fullName;
    private String phoneNumber;
    private Boolean isComing;
    private Boolean isCar;
    private LatLng startLocation;
    private Integer freeSeatsNum;
    private String routeId;

    // Ctor
    public ApprovedGuest() {}

    // Methods
    public static DatabaseReference getReference(String eventId) {
        return Event.getReference().child(eventId).getRef().child(COLLECTION_NAME);
    }

    public String getGuestId() {
        return guestId;
    }

    public void setGuestId(String guestId) {
        this.guestId = guestId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
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

    public Integer getFreeSeatsNum() {
        return freeSeatsNum;
    }

    public void setFreeSeatsNum(Integer freeSeatsNum) {
        this.freeSeatsNum = freeSeatsNum;
    }

    public String getRouteId() {
        return routeId;
    }

    public void setRouteId(String routeId) {
        this.routeId = routeId;
    }
}
