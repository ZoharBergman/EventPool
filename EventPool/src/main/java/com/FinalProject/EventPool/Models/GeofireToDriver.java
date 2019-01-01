package com.FinalProject.EventPool.Models;

import com.FinalProject.EventPool.Config.Firebase;
import com.google.firebase.database.DatabaseReference;

/**
 * Created by Zohar on 01/01/2019.
 */
public class GeofireToDriver {
    // Consts
    public static final String COLLECTION_NAME = "geofireToDriver";

    // Methods
    public static DatabaseReference getReference() {
        return Firebase.getDbInstance().getReference(COLLECTION_NAME);
    }
}
