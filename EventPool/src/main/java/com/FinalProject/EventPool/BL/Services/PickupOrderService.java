package com.FinalProject.EventPool.BL.Services;

import com.FinalProject.EventPool.BL.PickupOrder.IPickupOrder;
import com.FinalProject.EventPool.Models.Event;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.ValueEventListener;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.concurrent.TimeUnit;

/**
 * Created by Zohar on 24/03/2019.
 */
public class PickupOrderService implements IScheduleService, Runnable{
    @Autowired
    private IPickupOrder PickupOrder;

    @Override
    public long getDelay() {
        return 1;
    }

    @Override
    public TimeUnit getTimeUnit() {
        return TimeUnit.DAYS;
    }

    @Override
    public void runService() {
        // Getting all the today events
        Event.getReference().orderByChild(Event.DATE)
                .endAt(LocalDateTime.of(LocalDate.now(), LocalTime.MIDNIGHT).plusDays(1).toString())
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
                    }

                    @Override
                    public void onCancelled(DatabaseError databaseError) {

                    }
                });
    }

    @Override
    public void run() {
        runService();
    }
}
