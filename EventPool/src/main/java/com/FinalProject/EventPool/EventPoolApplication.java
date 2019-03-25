package com.FinalProject.EventPool;

import com.FinalProject.EventPool.BL.Services.Scheduler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class EventPoolApplication implements CommandLineRunner{
	@Autowired
	private Scheduler schedulerService;

	public static void main(String[] args) {
		SpringApplication.run(EventPoolApplication.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		schedulerService.schedule();
	}
}
