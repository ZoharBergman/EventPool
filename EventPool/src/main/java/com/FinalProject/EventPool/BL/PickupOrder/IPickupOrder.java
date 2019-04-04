package com.FinalProject.EventPool.BL.PickupOrder;

import com.FinalProject.EventPool.Models.Event;
import com.google.maps.errors.ApiException;

import java.io.IOException;
import java.util.List;

/**
 * Created by Zohar on 21/03/2019.
 */
public interface IPickupOrder {
    List<String> calcAndSavePickupOrder(String eventId, String groupId) throws InterruptedException, IOException, ApiException;
    void calcAndSavePickupOrders(Event event) throws InterruptedException;
    void calcAndSavePickupOrders(String eventId) throws InterruptedException;
}
