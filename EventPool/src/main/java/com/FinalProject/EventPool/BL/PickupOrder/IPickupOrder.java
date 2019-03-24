package com.FinalProject.EventPool.BL.PickupOrder;

import java.util.List;

/**
 * Created by Zohar on 21/03/2019.
 */
public interface IPickupOrder {
    List<String> calcPickupOrder(String eventId, String groupId) throws InterruptedException;
    void calcAndSavePickupOrders(String eventId) throws InterruptedException;
}
