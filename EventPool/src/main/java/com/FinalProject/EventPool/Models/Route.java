package com.FinalProject.EventPool.Models;

import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
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

    public Route(List<LatLng> points, String eventId, String driverId) {
        this.points = points;
        this.eventId = eventId;
        this.driverId = driverId;
    }

    // Methods
    public static DatabaseReference getReference() {
        FirebaseDatabase db = FirebaseDatabase.getInstance();
        return db.getReference("https://eventpool-65e23.firebaseio.com/routes");
    }
}
