package com.FinalProject.EventPool.BL.Services;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;

/**
 * Created by Zohar on 24/03/2019.
 */
public class Scheduler {
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    // Services
    private PickupOrderService pickupOrderService;

    // Ctor
    public Scheduler() {
        pickupOrderService = new PickupOrderService();
    }

    public void schedule() {
        scheduler.schedule(pickupOrderService, pickupOrderService.getDelay(), pickupOrderService.getTimeUnit());
    }
}
