package com.FinalProject.EventPool;

import com.FinalProject.EventPool.BL.Services.Scheduler;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class EventPoolApplication {

	public static void main(String[] args) {
		SpringApplication.run(EventPoolApplication.class, args);

		// Start scheduler service
		Scheduler schedulerService = new Scheduler();
		schedulerService.schedule();
	}
}
