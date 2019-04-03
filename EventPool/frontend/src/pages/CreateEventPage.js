/**
 * Created by Zohar on 30/11/2018.
 */
import React, { Component } from 'react';
import CreateEventForm from '../forms/CreateEventForm';
import { eventsRef, userEventsRef } from '../config/firebase';
import geocoding from '../util/Geocoding';
import auth from '../config/auth';
import userEvent from '../classes/userEvent';
import Loader from '../components/Loader';

class CreateEventPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false
        };

        this.loader = React.createRef();

        this.saveNewEvent = this.saveNewEvent.bind(this);
        this.saveEventToUser = this.saveEventToUser.bind(this);
        this.handleCreateEvent = this.handleCreateEvent.bind(this);
    }

    saveNewEvent (user, geocodeResponse, newEvent) {
        // Setting the fields of the new event
        newEvent.date = newEvent.date.getTime();
        newEvent.organizersIds = [user];
        newEvent.address = {
            name: newEvent.addressName,
            location: geocodeResponse.json.results[0].geometry.location,
        };
        delete newEvent.addressName;

        // Saving the new event to the DB
        const eventId = eventsRef.push().key;
        newEvent.id = eventId;
        const eventObject = {};
        eventObject[eventId] = newEvent;
        eventsRef.update(eventObject);

        return eventId;
    }

    saveEventToUser (user, eventId, newEvent) {
        // Trying to get the events of the current user
        userEventsRef.orderByChild("userId").equalTo(user).once('value')
            .then((snapshot) => {
                const newUserEventAsOrganizer = {eventId: eventId, eventName: newEvent.name};

                if (!snapshot.exists() || !snapshot.val()) {
                    // Creating a new user events object and save it to the DB
                    userEventsRef.push().set(new userEvent(user, [], [newUserEventAsOrganizer]));
                } else {
                    const userEvents = snapshot.val();
                    for (let key in userEvents) {
                        userEvents[key].asOrganizer.push(newUserEventAsOrganizer);
                    }
                    userEventsRef.update(userEvents);
                }
            });
    }

    handleCreateEvent(newEvent) {
        this.loader.current.openLoader();
        let that = this;
        geocoding.codeAddress(newEvent.addressName, (err, response) => {
            if (!err) {
                const user = localStorage.getItem(auth.appTokenKey);
                const eventId = that.saveNewEvent(user, response, newEvent);
                that.saveEventToUser(user, eventId, newEvent);
                that.props.history.push("/event/" + eventId);
            }

            that.loader.current.closeLoader();
        });
    }

    render() {
        return (
            <div>
                <Loader ref={this.loader}/>
                <CreateEventForm onSubmit={this.handleCreateEvent}/>
            </div>
        );
    }
}

export { CreateEventPage };

