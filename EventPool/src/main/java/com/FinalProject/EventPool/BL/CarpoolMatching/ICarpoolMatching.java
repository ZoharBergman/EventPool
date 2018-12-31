package com.FinalProject.EventPool.BL.CarpoolMatching;

import com.FinalProject.EventPool.Models.Passenger;
import com.FinalProject.EventPool.Models.Route;

import java.util.List;

/**
 * Created by Zohar on 31/12/2018.
 */
public interface ICarpoolMatching {
    void calcCarpoolMatching(String eventId, Double deviationRadius);
    void calcPotentialMatching(Double deviationRadius, List<Route> lstDriversRoutes, List<Passenger> lstPassengers);
    List<Route> getRoutesByEventId(String eventId);
    List<Passenger> getPassengers(String eventId);
    void calcMatching();
}
