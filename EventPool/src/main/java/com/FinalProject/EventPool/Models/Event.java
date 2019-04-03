package com.FinalProject.EventPool.Models;

import com.FinalProject.EventPool.Config.Firebase;
import com.google.firebase.database.DatabaseReference;

import java.util.List;
import java.util.Map;

/**
 * Created by Zohar on 01/01/2019.
 */
public class Event {
    //Consts
    public static final String COLLECTION_NAME = "events";
    public static final String ADDRESS = "address";
    public static final String LOCATION = "location";
    public static final String CARPOOL_GROUPS = "carpoolGroups";
    public static final String DATE = "date";

    // Properties
    private String id;
    private Address address;
    private Map<String, ApprovedGuest> guests;
    private Map<String, CarpoolGroup> carpoolGroups;
    private Long date;
    private Double maxRadiusInKm;
    private String name;
    private List<String> organizersIds;

    // Ctor
    public Event() {}

    // Methods
    public static DatabaseReference getReference() {
        return Firebase.getDbInstance().getReference(COLLECTION_NAME);
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Address getAddress() {
        return address;
    }

    public void setAddress(Address address) {
        this.address = address;
    }

    public Map<String, ApprovedGuest> getGuests() {
        return guests;
    }

    public void setGuests(Map<String, ApprovedGuest> guests) {
        this.guests = guests;
    }

    public Map<String, CarpoolGroup> getCarpoolGroups() {
        return carpoolGroups;
    }

    public void setCarpoolGroups(Map<String, CarpoolGroup> carpoolGroups) {
        this.carpoolGroups = carpoolGroups;
    }

    public Long getDate() {
        return date;
    }

    public void setDate(Long date) {
        this.date = date;
    }

    public Double getMaxRadiusInKm() {
        return maxRadiusInKm;
    }

    public void setMaxRadiusInKm(Double maxRadiusInKm) {
        this.maxRadiusInKm = maxRadiusInKm;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<String> getOrganizersIds() {
        return organizersIds;
    }

    public void setOrganizersIds(List<String> organizersIds) {
        this.organizersIds = organizersIds;
    }
}
