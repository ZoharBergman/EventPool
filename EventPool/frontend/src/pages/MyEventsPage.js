/**
 * Created by Zohar on 30/11/2018.
 */
import React, { Component } from 'react';
import { userEventsRef } from '../config/firebase';
import auth from '../config/auth';
import { Link } from 'react-router-dom';

class MyEventsPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            asOrganizer: [],
            asGuest: []
        };
    }

    componentWillMount() {
        const user = localStorage.getItem(auth.appTokenKey);

        userEventsRef.orderByChild("userId").equalTo(user).once('value')
            .then((snapshot) => {
                const userEvents = {
                    asOrganizer: [],
                    asGuest: []
                };

                if (snapshot.exists()) {
                    if (Object.values(snapshot.val())[0]) {
                     if (Object.values(snapshot.val())[0].asOrganizer) {
                         userEvents.asOrganizer = Object.values(Object.values(snapshot.val())[0].asOrganizer);
                     }

                     if (Object.values(snapshot.val())[0].asGuest) {
                         userEvents.asGuest = Object.values(Object.values(snapshot.val())[0].asGuest);
                     }

                     this.setState(userEvents);
                    }
                }
            });
    }

    buildEventsList(events) {
        return events.map((event, i) => {
            return (
                <li key={i}>
                    <Link to={`/event/${event.eventId}`}>{event.eventName}</Link>
                </li>
            );
        });
    }

    render() {
        let asOrganizer;
        let asGuest;

        if (this.state.asOrganizer.length > 0) {
            asOrganizer = this.buildEventsList(this.state.asOrganizer);
        } else {
            asOrganizer = "No events as organizer.";
        }

        if (this.state.asGuest.length > 0) {
            asOrganizer = this.buildEventsList(this.state.asGuest);
        } else {
            asGuest = "No events as guest.";
        }

        return (
            <div>
                <div>
                    <h1>As organizer</h1>
                    {asOrganizer}
                </div>
                <div>
                    <h1>As guest</h1>
                    {asGuest}
                </div>
            </div>
        );
    }
}

export { MyEventsPage };
