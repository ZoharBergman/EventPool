package com.FinalProject.EventPool.BL.Services;

import java.util.concurrent.TimeUnit;

/**
 * Created by Zohar on 24/03/2019.
 */
public interface IScheduleService {
    long getDelay();
    TimeUnit getTimeUnit();
    void runService();
}
