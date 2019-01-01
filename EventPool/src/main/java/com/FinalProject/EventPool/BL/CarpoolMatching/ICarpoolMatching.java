package com.FinalProject.EventPool.BL.CarpoolMatching;

/**
 * Created by Zohar on 31/12/2018.
 */
public interface ICarpoolMatching {
    void calcCarpoolMatching(String eventId, Double deviationRadius) throws InterruptedException;
}
