package com.FinalProject.EventPool;

import com.FinalProject.EventPool.BL.CarpoolMatching.ICarpoolMatching;
import com.FinalProject.EventPool.BL.PickupOrder.IPickupOrder;
import com.FinalProject.EventPool.Config.Log;
import com.FinalProject.EventPool.Models.Event;
import com.FinalProject.EventPool.Models.Match;
import com.google.maps.errors.ApiException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import com.FinalProject.EventPool.BL.Routes.IRoutes;

import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.logging.Level;

/**
 * Created by Zohar on 31/10/2018.
 */
@RestController
public class Controller {
    // Services
    private final IRoutes Routes;
    private final ICarpoolMatching CarpoolMatching;
    private final IPickupOrder PickupOrder;

    // Const
    public final static String SUPPORTED_URL = "http://localhost:3000";

    @Autowired
    public Controller(IRoutes Routes, ICarpoolMatching CarpoolMatching, IPickupOrder PickupOrder) {
        this.Routes = Routes;
        this.CarpoolMatching = CarpoolMatching;
        this.PickupOrder = PickupOrder;
    }

    // Rest controller methods
    @CrossOrigin(origins = SUPPORTED_URL)
    @GetMapping("/calcAndSaveRoute/{origin}/{destination}/{driverId}/{eventId}/{freeSeatsNum}")
    public void calcAndSaveRoute(@PathVariable String origin, @PathVariable String destination,
                                 @PathVariable String driverId, @PathVariable String eventId,
                                 @PathVariable Integer freeSeatsNum) throws InterruptedException, ApiException, IOException {
        Routes.calcAndSaveRoute(origin, destination, driverId, eventId, freeSeatsNum);
    }

    @CrossOrigin(origins = SUPPORTED_URL)
    @GetMapping("/calcCarpoolMatching/{eventId}/{deviationRadius}")
    public Collection<Match> calcCarpoolMatching(@PathVariable String eventId, @PathVariable Double deviationRadius) throws InterruptedException {
        return CarpoolMatching.calcCarpoolMatching(eventId, deviationRadius);
    }

    @CrossOrigin(origins = SUPPORTED_URL)
    @GetMapping("/calcAndSavePickupOrder/{eventId}/{groupId}")
    public List<String> calcAndSavePickupOrder(@PathVariable String eventId, @PathVariable String groupId) throws IOException, ApiException {
        try {
            return PickupOrder.calcAndSavePickupOrder(eventId, groupId);
        } catch (InterruptedException e) {
            Log.getInstance().log(Level.SEVERE, e.getMessage(), e);
        }

        return null;
    }

    @CrossOrigin(origins = SUPPORTED_URL)
    @GetMapping("/calcAndSavePickupOrders/{eventId}")
    public void calcAndSavePickupOrders(@PathVariable String eventId) throws InterruptedException {
        PickupOrder.calcAndSavePickupOrders(eventId);
    }

    @ExceptionHandler({InterruptedException.class, ApiException.class, IOException.class, RuntimeException.class})
    @ResponseStatus(value= HttpStatus.INTERNAL_SERVER_ERROR)
    public void handleException (Exception e) {
        e.printStackTrace();
        Log.getInstance().log(Level.SEVERE, e.getMessage(), e);
    }
}
