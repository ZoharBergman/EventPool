/**
 * Created by Zohar on 20/11/2018.
 */
import React from "react";
import { eventsRef, userEventsRef } from '../config/firebase';
import geocoding from '../util/Geocoding';
import auth from '../config/auth';
import userEvent from '../classes/userEvent';

const handleCreateEvent = (newEvent) => {
    const saveNewEvent = function (user, geocodeResponse) {
        // Setting the fields of the new event
        newEvent.date = newEvent.date.getTime();
        newEvent.organizersIds = [user];
        newEvent.address = {
            name: geocodeResponse.json.results[0].formatted_address,
            location: geocodeResponse.json.results[0].geometry.location,
        };

        // Saving the new event to the DB
        const eventId = eventsRef.push().key;
        const eventObject = {};
        eventObject[eventId] = newEvent;
        eventsRef.update(eventObject);

        return eventId;
    };

    const saveEventToUser = function (user, eventId) {
        // Trying to get the events of the current user
        userEventsRef.orderByChild("userId").equalTo(user).once('value')
            .then((snapshot) => {
                const newUserEventAsOrganizer = {eventId: eventId, eventName: newEvent.name};

                if (!snapshot.exists() || !snapshot.val()) {
                    // Creating a new user events object ans save it to the DB
                    userEventsRef.push().set(new userEvent(user, [], [newUserEventAsOrganizer]));
                } else {
                    const userEvents = snapshot.val();
                    for (let key in userEvents) {
                        userEvents[key].asOrganizer.push(newUserEventAsOrganizer);
                    }
                    userEventsRef.update(userEvents);
                }
            });
    };

    geocoding.codeAddress(newEvent.address, function(err, response) {
        if (!err) {
            const user = localStorage.getItem(auth.appTokenKey);
            const eventId = saveNewEvent(user, response);
            saveEventToUser(user, eventId);
            this.props.history.push("/event/" + eventId);
        }
    });
};

export default {
    handleCreateEvent: handleCreateEvent
};