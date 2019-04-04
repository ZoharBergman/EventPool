package com.FinalProject.EventPool.Config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.database.FirebaseDatabase;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.logging.Level;

/**
 * Created by Zohar on 30/12/2018.
 */
public class Firebase {
    private static FirebaseApp app;

    private static void initialize() {
        FileInputStream serviceAccount;

        try {
            serviceAccount = new
                    FileInputStream("C:/Users/Zuzu/Desktop/GitProjects/EventPool1/1/EventPool/src/main/java/com/FinalProject/EventPool/Config/eventpool-65e23-firebase-adminsdk-g22cq-0ec653ce16.json");
            FirebaseOptions options = new FirebaseOptions.Builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .setDatabaseUrl("https://eventpool-65e23.firebaseio.com")
                    .build();

            app = FirebaseApp.initializeApp(options);
        } catch (IOException e) {
            e.printStackTrace();
            Log.getInstance().log(Level.SEVERE, e.getMessage(), e);
        }
    }

    public static FirebaseApp getAppInstance() {
        if (app == null) {
            initialize();
        }

        return app;
    }

    public static FirebaseDatabase getDbInstance() {
        return FirebaseDatabase.getInstance(getAppInstance());
    }
}
