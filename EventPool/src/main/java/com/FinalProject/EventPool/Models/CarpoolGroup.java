package com.FinalProject.EventPool.Models;

import com.google.firebase.database.DatabaseReference;

import java.util.List;
import java.util.Set;

/**
 * Created by Zohar on 21/03/2019.
 */
public class CarpoolGroup {
    // Consts
    public static final String COLLECTION_NAME = "carpoolGroups";

    // Properties
    private Driver driver;
    private String eventName;
    private List<Passenger> passengers;
    private List<String> pickupOrder;
    private String id;

    // Ctor
    public CarpoolGroup() {

    }

    // Methods
    public static DatabaseReference getReference(String eventId, String groupId) {
        return Event.getReference().child(eventId).child(COLLECTION_NAME).child(groupId);
    }

    public Driver getDriver() {
        return driver;
    }

    public void setDriver(Driver driver) {
        this.driver = driver;
    }

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }

    public List<Passenger> getPassengers() {
        return passengers;
    }

    public void setPassengers(List<Passenger> passengers) {
        this.passengers = passengers;
    }

    public List<String> getPickupOrder() {
        return pickupOrder;
    }

    public void setPickupOrder(List<String> pickupOrder) {
        this.pickupOrder = pickupOrder;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }
}
