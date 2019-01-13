package com.FinalProject.EventPool;

import com.FinalProject.EventPool.BL.CarpoolMatching.CarpoolMatchingBL;
import com.FinalProject.EventPool.BL.Routes.RoutesBL;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class EventPoolApplication {

	public static void main(String[] args) {
		SpringApplication.run(EventPoolApplication.class, args);
		CarpoolMatchingBL carpoolMatchingBL = new CarpoolMatchingBL();
//		try {
//			carpoolMatchingBL.calcCarpoolMatching("-LV882x6D6ijGyox7K1I", 5.0);
//		} catch (InterruptedException e) {
//			e.printStackTrace();
//		}
	}
}
