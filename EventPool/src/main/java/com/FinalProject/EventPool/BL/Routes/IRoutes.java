package com.FinalProject.EventPool.BL.Routes;

import com.google.maps.model.LatLng;

import java.util.List;

/**
 * Created by Zohar on 27/12/2018.
 */
public interface IRoutes {
    List<LatLng> calcRoute(String origin, String destination);
    void calcAndSaveRoute(String origin, String destination, String driverId, String eventId);
}
