package com.FinalProject.EventPool.BL.Routes;

import com.FinalProject.EventPool.Models.Route;
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
    public List<LatLng> calcRoute(String origin, String destination) {
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
    public String calcAndSaveRoute(String origin, String destination, String driverId, String eventId) {
        List<LatLng> lstRoutePoints = calcRoute(origin, destination);

        if (lstRoutePoints.size() <= 0) {
            return null;
        } else {
            Route route = new Route(lstRoutePoints, eventId, driverId, generateRouteKey());
            saveRoute(route);
            return route.getId();
        }
    }

    public void saveRoute(Route route) {
        Route.getReference().child(route.getId()).setValueAsync(route);
    }

    private String generateRouteKey() {
        return Route.getReference().push().getKey();
    }
}
