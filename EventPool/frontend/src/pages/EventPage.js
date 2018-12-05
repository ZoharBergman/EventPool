/**
 * Created by Zohar on 05/12/2018.
 */
import React, { Component } from 'react';
import { eventsRef } from '../config/firebase';
import AddGuestForm from '../forms/AddGuestForm';

class EventPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            eventId: props.match.params.id,
            event: {
                name: ""
            }
        };

        this.handleAddGuest = this.handleAddGuest.bind(this);
    }

    componentWillMount() {
     eventsRef.child(this.state.eventId).once('value').then((snapshot) => {
         if (snapshot.exists()) {
             this.setState({event: snapshot.val()});
         }
     });
    }

    handleAddGuest(newGuest) {
        // Saving the new guest in the DB
        const newGuestId = eventsRef.child(this.state.eventId + '/newGuests').push().key;
        eventsRef.child(this.state.eventId + '/newGuests/' + newGuestId).update(newGuest);

        // Updating the state
        let event = this.state.event;
        if (!event.newGuests) {
            event.newGuests = {};
        }

        event.newGuests[newGuestId] = newGuest;
        this.setState({event: event});
    }

    render() {
        return (
            <div>
                <h1>{this.state.event.name}</h1>
                <div>
                    <h2>Details</h2>
                </div>
                <div>
                    <h2>Guests</h2>
                    <AddGuestForm onSubmit={this.handleAddGuest}/>
                </div>
            </div>
        );
    }
}

export { EventPage };
