package com.FinalProject.EventPool;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;

/**
 * Created by Zohar on 31/10/2018.
 */
@RestController
public class Controller {
    @GetMapping("/api/hello")
    public String hello() {
        return "Hello, the time at the server is now  " + new Date() + "\n";
    }
}
