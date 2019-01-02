package com.FinalProject.EventPool.BL.Routes;

import com.FinalProject.EventPool.Config.Keys;
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

/**
 * Created by Zohar on 27/12/2018.
 */
@Service
public class RoutesBL implements IRoutes{
    @Override
    public List<LatLng> calcRoute(String origin, String destination) {
        GeoApiContext context = new GeoApiContext.Builder().apiKey(Keys.DIRECTIONS_API_KEY).build();

        try {
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
        } catch (ApiException e) {
            e.printStackTrace();
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }

        return null;
    }

    @Override
    public void calcAndSaveRoute(String origin, String destination, String driverId, String eventId, Integer freeSeatsNum) {
        List<LatLng> lstRoutePoints = calcRoute(origin, destination);

        if (lstRoutePoints.size() > 0) {
            saveRoute(lstRoutePoints, driverId, eventId, freeSeatsNum);
        }
    }

    private void saveRoute(List<LatLng> lstRoutePoints, String driverId, String eventId, Integer freeSeatsNum) {
        lstRoutePoints.forEach(latLng -> {
            // Save the LatLng as a geolocation object in the DB
            GeoLocation geoLocation = new GeoLocation(latLng.lat, latLng.lng);
            String geoLocationKey = Geofire.getGeoLocationKey(geoLocation);
            Geofire.getInstance(eventId).setLocation(geoLocationKey, geoLocation, new GeoFire.CompletionListener() {
                @Override
                public void onComplete(String s, DatabaseError databaseError) {

                }
            });

            // Map the geolocation to the driver
            Map<String, Object> mapDriver = new HashMap<>();
            mapDriver.put(driverId, freeSeatsNum);
            GeofireToDriver.getReference().child(eventId).child(geoLocationKey).updateChildren(mapDriver, null);
        });
    }
}
