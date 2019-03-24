package com.FinalProject.EventPool.BL.PickupOrder;

/**
 * Created by Zohar on 21/03/2019.
 */
public interface IPickupOrder {
    String[] calcPickupOrder(String eventId, String groupId) throws InterruptedException;
    void calcAndSavePickupOrders(String eventId) throws InterruptedException;
}
