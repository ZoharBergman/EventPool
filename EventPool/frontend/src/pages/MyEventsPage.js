/**
 * Created by Zohar on 30/11/2018.
 */
import React, { Component } from 'react';
import { userEventsRef } from '../config/firebase';
import auth from '../config/auth';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
import List from '@material-ui/core/List/List';
import ListItem from '@material-ui/core/ListItem/ListItem';

class MyEventsPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            asOrganizer: [],
            asGuest: [],
            isLoaded: false
        };

        this.loader = React.createRef();
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

                     this.setState({...userEvents, isLoaded: true}, this.loader.current.closeLoader);
                    }
                } else {
                    this.loader.current.closeLoader();
                }
            });
    }

    componentDidMount() {
        // Checking if the event data from the DB have not loaded yet
        if (!this.state.isLoaded) {
            this.loader.current.openLoader();
        }
    }

    buildEventsList(events) {
        return (
            <List component="nav">
                {events.map((event) => (
                    <ListItem>
                        <Link to={`/event/${event.eventId}`}>{event.eventName}</Link>
                    </ListItem>
                ))}
            </List>
        );
    }

    render() {
        let asOrganizer = this.state.asOrganizer.length > 0 ?
            this.buildEventsList(this.state.asOrganizer) : "No events as organizer.";

        return (
            <div>
                <Loader ref={this.loader}/>
                <div>
                    {asOrganizer}
                </div>
            </div>
        );
    }
}

export { MyEventsPage };
