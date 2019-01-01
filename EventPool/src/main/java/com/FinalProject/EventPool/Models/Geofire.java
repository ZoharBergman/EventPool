package com.FinalProject.EventPool.Models;

import com.FinalProject.EventPool.Config.Firebase;
import com.firebase.geofire.GeoFire;
import com.firebase.geofire.GeoLocation;
import com.google.firebase.database.DatabaseReference;

/**
 * Created by Zohar on 01/01/2019.
 */
public class Geofire {
    // Consts
    public static final String COLLECTION_NAME = "geofire";

    // Properties
    private static GeoFire geoFire;

    // Ctor
    private Geofire(){}

    // Methods
    private static DatabaseReference getReference() {
        return Firebase.getDbInstance().getReference(COLLECTION_NAME);
    }

    public static GeoFire getInstance(String eventId) {
        if (geoFire == null) {
            geoFire = new GeoFire(getReference().child(eventId));
        }

        return geoFire;
    }

    public static String getGeoLocationKey(GeoLocation geoLocation) {
        return geoLocation.toString().replace('.', '*');
    }
}
