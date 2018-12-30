package com.FinalProject.EventPool.Models;

import com.FinalProject.EventPool.Config.Firebase;
import com.google.firebase.database.DatabaseReference;
import com.google.maps.model.LatLng;

import java.util.List;

/**
 * Created by Zohar on 27/12/2018.
 */
public class Route {
    // Properties
    private List<LatLng> points;
    private String eventId;
    private String driverId;
    private String id;

    public Route(List<LatLng> points, String eventId, String driverId, String id) {
        this.points = points;
        this.eventId = eventId;
        this.driverId = driverId;
        this.id = id;
    }

    // Methods
    public static DatabaseReference getReference() {
        return Firebase.getDbInstance().getReference("routes");
    }

    public List<LatLng> getPoints() {
        return points;
    }

    public void setPoints(List<LatLng> points) {
        this.points = points;
    }

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public String getDriverId() {
        return driverId;
    }

    public void setDriverId(String driverId) {
        this.driverId = driverId;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }
}
