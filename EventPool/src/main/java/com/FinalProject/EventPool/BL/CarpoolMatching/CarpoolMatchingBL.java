package com.FinalProject.EventPool.BL.CarpoolMatching;

import com.FinalProject.EventPool.Models.Passenger;
import com.FinalProject.EventPool.Models.Route;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Created by Zohar on 31/12/2018.
 */
@Service
public class CarpoolMatchingBL implements ICarpoolMatching {

    @Override
    public void calcCarpoolMatching(String eventId, Double deviationRadius) {
        // Getting the routes of the drivers
        List<Route> lstDriversRoutes = getRoutesByEventId(eventId);

        // Getting the passengers
        List<Passenger> lstPassengers = getPassengers(eventId);

        // Calc potential matching
        calcPotentialMatching(deviationRadius, lstDriversRoutes, lstPassengers);

        // Calc matching
        calcMatching();
    }

    @Override
    public void calcPotentialMatching(Double deviationRadius, List<Route> lstDriversRoutes, List<Passenger> lstPassengers) {

    }

    @Override
    public List<Route> getRoutesByEventId(String eventId) {
        return null;
    }

    @Override
    public List<Passenger> getPassengers(String eventId) {
        return null;
    }

    @Override
    public void calcMatching() {

    }
}
