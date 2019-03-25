package com.FinalProject.EventPool.Models;

import com.FinalProject.EventPool.Config.Firebase;
import com.google.firebase.database.DatabaseReference;

import java.time.LocalDateTime;

/**
 * Created by Zohar on 25/03/2019.
 */
public class Service {
    // Consts
    public static final String COLLECTION_NAME = "services";
    public static final String RUN_TIME = "runtime";

    // Properties
    LocalDateTime runtime;

    // Ctors
    public Service(LocalDateTime runtime) {
        this.runtime = runtime;
    }

    public Service() {
    }

    // Methods
    public static DatabaseReference getReference() {
        return Firebase.getDbInstance().getReference(COLLECTION_NAME);
    }

    public LocalDateTime getRuntime() {
        return runtime;
    }

    public void setRuntime(LocalDateTime runtime) {
        this.runtime = runtime;
    }
}
