package com.FinalProject.EventPool.BL.Services;

import java.time.ZonedDateTime;

/**
 * Created by Zohar on 24/03/2019.
 */
public interface IScheduleService {
    long getDelayInMillis();
    void runService();
    String getName();
    ZonedDateTime getTimeToRun();
}
