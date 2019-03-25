package com.FinalProject.EventPool.BL.Services;

import com.FinalProject.EventPool.BL.PickupOrder.IPickupOrder;
import com.FinalProject.EventPool.BL.PickupOrder.PickupOrderBL;
import com.FinalProject.EventPool.Models.Event;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.ValueEventListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.concurrent.Semaphore;

/**
 * Created by Zohar on 24/03/2019.
 */
@Service
public class PickupOrderService implements IScheduleService, Runnable{
    // Properties
    @Autowired
    private IPickupOrder PickupOrder;

    // Methods
    @Override
    public long getDelayInMillis() {
        // One day
        return 24 * 60 * 60 * 1000;
    }

    @Override
    public String getName() {
        return "PickupOrderService";
    }

    @Override
    public ZonedDateTime getTimeToRun() {
        return ZonedDateTime.of(LocalDateTime.now(), ZoneId.of(Scheduler.ZONE)).withHour(2).withMinute(0).withSecond(0);
    }

    @Override
    public void runService() {
        final Semaphore semaphore = new Semaphore(0);

        // Getting all the today events
        Event.getReference().orderByChild(Event.DATE)
                .startAt(LocalDateTime.of(LocalDate.now(), LocalTime.MIDNIGHT)
                        .atZone(ZoneId.of(Scheduler.ZONE)).toInstant().toEpochMilli())
                .endAt(LocalDateTime.of(LocalDate.now(), LocalTime.MIDNIGHT).plusDays(1)
                        .atZone(ZoneId.of(Scheduler.ZONE)).toInstant().toEpochMilli())
                .addListenerForSingleValueEvent(new ValueEventListener() {
                    @Override
                    public void onDataChange(DataSnapshot dataSnapshot) {
                        dataSnapshot.getChildren().forEach(eventSnapshot -> {
                            try {
                                PickupOrder.calcAndSavePickupOrders(eventSnapshot.getKey());
                            } catch (InterruptedException e) {
                                e.printStackTrace();
                            }
                        });

                        semaphore.release();
                    }

                    @Override
                    public void onCancelled(DatabaseError databaseError) {
                        semaphore.release();
                    }
                });

        try {
            semaphore.acquire();
            Scheduler.saveServiceRuntimeDetails(this);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void run() {
        runService();
    }
}
