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
import './MyEventsPage.css'

class MyEventsPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            asOrganizer: [],
            asGuest: [],
            isLoaded: false,
            initMode: true
        };

        this.loader = React.createRef();
    }

    componentDidMount() {
        this.loader.current.openLoader();
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

                        this.setState({...userEvents, isLoaded: true, initMode: false}, this.loader.current.closeLoader);
                    }
                } else {
                    this.setState({
                        initMode: false
                    }, this.loader.current.closeLoader);
                }
            });
    }

    buildEventsList(events) {
        return (
        <div className="events-container">
            <h2 className="title">My Events</h2>
            <List className="events-list" component="nav">
                {events.map((event) => (
                    <ListItem>
                        <div className="event-clickable" onClick={() =>{
                            this.props.history.push(`/event/${event.eventId}`)
                        }}>
                            <i className="material-icons event-icon">stars</i>
                            <div>{event.eventName}</div>
                        </div>
                    </ListItem>
                ))}
            </List>
        </div>
        );
    }

    render() {

        const hasEvents = this.state.asOrganizer.length > 0;
        let asOrganizer = this.buildEventsList(this.state.asOrganizer);
        return (
            <div className="my-events-container">
                <Loader ref={this.loader}/>
                {hasEvents && this.state.isLoaded && !this.state.initMode && asOrganizer}
                {!hasEvents && !this.state.initMode && (
                    <div className="empty-state">
                        No events yet, feel free to create one.
                    </div>
                )}
                {this.state.initMode && (<div className="loading">
                    Waiting for events...
                </div>)}
            </div>
        );
    }
}

export { MyEventsPage };
