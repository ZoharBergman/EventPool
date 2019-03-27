package com.FinalProject.EventPool;

import com.FinalProject.EventPool.BL.CarpoolMatching.ICarpoolMatching;
import com.FinalProject.EventPool.BL.PickupOrder.IPickupOrder;
import com.FinalProject.EventPool.Models.Event;
import com.FinalProject.EventPool.Models.Match;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import com.FinalProject.EventPool.BL.Routes.IRoutes;

import java.util.Collection;
import java.util.List;

/**
 * Created by Zohar on 31/10/2018.
 */
@RestController
public class Controller {
    // Services
    @Autowired
    private IRoutes Routes;
    @Autowired
    private ICarpoolMatching CarpoolMatching;
    @Autowired
    private IPickupOrder PickupOrder;

    // Const
    public final static String SUPPORTED_URL = "http://localhost:3000";

    // Rest controller methods
    @CrossOrigin(origins = SUPPORTED_URL)
    @GetMapping("/calcAndSaveRoute/{origin}/{destination}/{driverId}/{eventId}/{freeSeatsNum}")
    public void calcAndSaveRoute(@PathVariable String origin, @PathVariable String destination,
                                 @PathVariable String driverId, @PathVariable String eventId,
                                 @PathVariable Integer freeSeatsNum) {
        Routes.calcAndSaveRoute(origin, destination, driverId, eventId, freeSeatsNum);
    }

    @CrossOrigin(origins = SUPPORTED_URL)
    @GetMapping("/calcCarpoolMatching/{eventId}/{deviationRadius}")
    public Collection<Match> calcCarpoolMatching(@PathVariable String eventId, @PathVariable Double deviationRadius) {
        try {
            return CarpoolMatching.calcCarpoolMatching(eventId, deviationRadius);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        return null;
    }

    @CrossOrigin(origins = SUPPORTED_URL)
    @GetMapping("/calcAndSavePickupOrder/{eventId}/{groupId}")
    public List<String> calcAndSavePickupOrder(@PathVariable String eventId, @PathVariable String groupId) {
        try {
            return PickupOrder.calcAndSavePickupOrder(eventId, groupId);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        return null;
    }

    @CrossOrigin(origins = SUPPORTED_URL)
    @GetMapping("/calcAndSavePickupOrders/{eventId}")
    public void calcAndSavePickupOrders(@PathVariable String eventId) {
        try {
            PickupOrder.calcAndSavePickupOrders(eventId);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
