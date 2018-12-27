package com.FinalProject.EventPool.BL.Routes;

import com.FinalProject.EventPool.Models.Route;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.maps.DirectionsApi;
import com.google.maps.GeoApiContext;
import com.google.maps.errors.ApiException;
import com.google.maps.model.DirectionsResult;
import com.google.maps.model.LatLng;
import com.google.maps.model.TravelMode;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

/**
 * Created by Zohar on 27/12/2018.
 */
@Service
public class RoutesBL implements IRoutes{
    private final static String DIRECTIONS_API_KEY = "AIzaSyBGVHjFRQulDD1p49Hjl6HNBnPaLFDghbo";

    @Override
    public String calcRoute(String origin, String destination) {
        GeoApiContext context = new GeoApiContext.Builder().apiKey(DIRECTIONS_API_KEY).build();

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
                List<LatLng> lstRoutePoints = directionsResult.routes[0].overviewPolyline.decodePath();

                if (lstRoutePoints.size() > 0) {
                    saveRoute(new Route(lstRoutePoints, null, null));
                }
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

    public void saveRoute(Route route) {
        String routeId = Route.getReference().push().getKey();
    }
}
