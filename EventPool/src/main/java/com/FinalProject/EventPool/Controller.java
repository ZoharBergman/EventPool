package com.FinalProject.EventPool;

import com.fasterxml.jackson.databind.node.ArrayNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.FinalProject.EventPool.BL.Routes.IRoutes;

import java.util.Date;

/**
 * Created by Zohar on 31/10/2018.
 */
@RestController
public class Controller {
    @Autowired
    private IRoutes Routes;

    public final static String SUPPORTED_URL = "http://localhost:3000";

    @GetMapping("/api/hello")
    public String hello() {
        return "Hello, the time at the server is now  " + new Date() + "\n";
    }

    @CrossOrigin(origins = SUPPORTED_URL)
    @GetMapping("/calcAndSaveRoute/{origin}/{destination}/{driverId}/{eventId}")
    public String calcAndSaveRoute(@PathVariable String origin, @PathVariable String destination, @PathVariable String driverId, @PathVariable String eventId) {
        return Routes.calcAndSaveRoute(origin, destination, driverId, eventId);
    }


}
