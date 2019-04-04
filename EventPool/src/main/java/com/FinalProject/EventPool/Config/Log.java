package com.FinalProject.EventPool.Config;

import java.io.IOException;
import java.util.logging.FileHandler;
import java.util.logging.Formatter;
import java.util.logging.Logger;
import java.util.logging.SimpleFormatter;

/**
 * Created by Zohar on 04/04/2019.
 */
public class Log {
    private static Logger theLogger;
    private static FileHandler theFileHandler;

    private static void initialize() throws IOException {
        theLogger  = Logger.getLogger("EventPoolLogger");
        theFileHandler = new FileHandler("EventPoolLog.txt", true);
        theFileHandler.setFormatter(new SimpleFormatter());
        theLogger.addHandler(theFileHandler);

    }

    public static Logger getInstance() {
        if (theLogger == null) {
            try {
                initialize();
            } catch (IOException e) {
                e.printStackTrace();
                throw new RuntimeException("Problems with creating the log files");
            }
        }

        return theLogger;
    }
}
