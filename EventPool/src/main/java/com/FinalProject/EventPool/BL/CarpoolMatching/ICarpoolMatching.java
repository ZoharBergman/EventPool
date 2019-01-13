package com.FinalProject.EventPool.BL.CarpoolMatching;

import com.FinalProject.EventPool.Models.Match;

import java.util.Collection;

/**
 * Created by Zohar on 31/12/2018.
 */
public interface ICarpoolMatching {
    Collection<Match> calcCarpoolMatching(String eventId, Double deviationRadius) throws InterruptedException;
}
