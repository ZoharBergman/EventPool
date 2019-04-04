package com.FinalProject.EventPool.BL.Routes;

import com.FinalProject.EventPool.Config.Keys;
import com.FinalProject.EventPool.Config.Log;
import com.FinalProject.EventPool.Models.Geofire;
import com.FinalProject.EventPool.Models.GeofireToDriver;
import com.firebase.geofire.GeoFire;
import com.firebase.geofire.GeoLocation;
import com.google.firebase.database.DatabaseError;
import com.google.maps.DirectionsApi;
import com.google.maps.GeoApiContext;
import com.google.maps.errors.ApiException;
import com.google.maps.model.DirectionsResult;
import com.google.maps.model.LatLng;
import com.google.maps.model.TravelMode;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Semaphore;
import java.util.logging.Level;

/**
 * Created by Zohar on 27/12/2018.
 */
@Service
public class RoutesBL implements IRoutes{
    @Override
    public List<LatLng> calcRoute(String origin, String destination) throws InterruptedException, ApiException, IOException {
        GeoApiContext context = new GeoApiContext.Builder().apiKey(Keys.DIRECTIONS_API_KEY).build();

            // Getting the directions
            DirectionsResult directionsResult =
                    DirectionsApi.getDirections(context, origin, destination).mode(TravelMode.DRIVING).await();

            // Validating that we got a route
            if (directionsResult != null &&
                directionsResult.routes != null &&
                directionsResult.routes[0] != null &&
                directionsResult.routes[0].overviewPolyline != null) {
                // Getting the points of the calculated route
                return directionsResult.routes[0].overviewPolyline.decodePath();
            }

        return null;
    }

    @Override
    public void calcAndSaveRoute(String origin, String destination, String driverId, String eventId, Integer freeSeatsNum) throws InterruptedException, ApiException, IOException {
        List<LatLng> lstRoutePoints = calcRoute(origin, destination);

        if (lstRoutePoints.size() > 0) {
            saveRoute(lstRoutePoints, driverId, eventId, freeSeatsNum);
        }
    }

    private void saveRoute(List<LatLng> lstRoutePoints, String driverId, String eventId, Integer freeSeatsNum) throws InterruptedException {
        final Semaphore semaphore = new Semaphore(0);
        final Integer[] numOfHandledPoints = {lstRoutePoints.size()};

        lstRoutePoints.forEach(latLng -> {
            // Save the LatLng as a geolocation object in the DB
            GeoLocation geoLocation = new GeoLocation(latLng.lat, latLng.lng);
            String geoLocationKey = Geofire.getGeoLocationKey(geoLocation);
            Geofire.getInstance(eventId).setLocation(geoLocationKey, geoLocation, (s, databaseError) -> {
                synchronized (numOfHandledPoints[0]) {
                    numOfHandledPoints[0]--;

                    if (numOfHandledPoints[0] == 0) {
                        semaphore.release();
                    }
                }
            });

            // Map the geolocation to the driver
            Map<String, Object> mapDriver = new HashMap<>();
            mapDriver.put(driverId, freeSeatsNum);
            GeofireToDriver.getReference().child(eventId).child(geoLocationKey).updateChildren(mapDriver, null);
        });

        semaphore.acquire();
    }
}
