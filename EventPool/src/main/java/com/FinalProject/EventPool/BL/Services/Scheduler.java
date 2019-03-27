package com.FinalProject.EventPool.BL.Services;

import com.FinalProject.EventPool.Models.Service;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.ValueEventListener;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.*;
import java.time.chrono.ChronoLocalDateTime;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;

/**
 * Created by Zohar on 24/03/2019.
 */
@org.springframework.stereotype.Service
public class Scheduler {
    // Consts
    public final static String ZONE = "Israel";

    // Properties
    @Autowired
    private PickupOrderService pickupOrderService;
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    // Methods
    public void schedule() {
        Duration duration;
        LocalDateTime localNow = LocalDateTime.now();
        ZoneId localZone = ZoneId.of(ZONE);
        ZonedDateTime zonedNow = ZonedDateTime.of(localNow, localZone);

        // ------------------------------ PickupOrderService ------------------------------ //
        LocalDateTime pickupOrderServiceLastRuntime = getServiceLastRuntimeDetails(pickupOrderService);

        // Checking if the service ran today
        if (pickupOrderServiceLastRuntime != null &&
                pickupOrderServiceLastRuntime.isAfter(
                        ChronoLocalDateTime.from(LocalDateTime.of(LocalDate.now(), LocalTime.MIDNIGHT)
                                .atZone(localZone)))) {
            // Schedule on the next day in the chosen time
            duration = Duration.between(zonedNow, pickupOrderService.getTimeToRun().plusDays(1));
        } else {
            // Checking if the time to schedule has not passed yet
            if (pickupOrderService.getTimeToRun().compareTo(zonedNow) > 0) {
                // Schedule today on the chosen time
                duration = Duration.between(zonedNow, pickupOrderService.getTimeToRun());
            } else { // The time to schedule has already passed and the service didn't run today
                // Schedule once now
                pickupOrderService.runService();

                // Schedule on the next day in the chosen time
                duration = Duration.between(zonedNow, pickupOrderService.getTimeToRun().plusDays(1));
            }
        }

        // Schedule the pickupOrderService to work periodically
        scheduler.scheduleAtFixedRate(
                pickupOrderService,
                duration.toMillis(),
                pickupOrderService.getDelayInMillis(),
                TimeUnit.MILLISECONDS);
    }

    public static void saveServiceRuntimeDetails(IScheduleService service) {
        Service.getReference().child(service.getName()).setValue(
                new Service(LocalDateTime.now()),
                (databaseError, databaseReference) -> {});
    }

    private LocalDateTime getServiceLastRuntimeDetails(IScheduleService service) {
        final Semaphore semaphore = new Semaphore(0);
        final LocalDateTime[] localDateTime = new LocalDateTime[1];

        Service.getReference().child(service.getName()).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                if (dataSnapshot.exists()) {
                    Map runtime = (Map) ((Map) dataSnapshot.getValue()).get("runtime");
                    localDateTime[0] = LocalDateTime.of(
                            Integer.parseInt(runtime.get("year").toString()),
                            Integer.parseInt(runtime.get("monthValue").toString()),
                            Integer.parseInt(runtime.get("dayOfMonth").toString()),
                            Integer.parseInt(runtime.get("hour").toString()),
                            Integer.parseInt(runtime.get("minute").toString()),
                            Integer.parseInt(runtime.get("second").toString()),
                            Integer.parseInt(runtime.get("nano").toString())
                            );

                }
                semaphore.release();
            }

            @Override
            public void onCancelled(DatabaseError databaseError) {
                semaphore.release();
            }
        });

        try {
            semaphore.acquire();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        return localDateTime[0];
    }
}
