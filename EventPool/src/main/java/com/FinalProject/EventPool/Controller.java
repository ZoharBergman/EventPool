package com.FinalProject.EventPool;

import org.springframework.beans.factory.annotation.Autowired;
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

    @GetMapping("/api/hello")
    public String hello() {
        return "Hello, the time at the server is now  " + new Date() + "\n";
    }

    @GetMapping("/calcRoute/{origin}/{destination}")
    public String calcRoute(@PathVariable String origin, @PathVariable String destination) {
        return Routes.calcRoute(origin, destination);
    }
}
