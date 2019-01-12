/**
 * Created by Zohar on 05/12/2018.
 */
import React, { Component } from 'react';
import { eventsRef } from '../config/firebase';
import AddGuestForm from '../forms/AddGuestForm';
import { Link } from 'react-router-dom';
import event from '../classes/event';

class EventPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            eventId: props.match.params.id,
            event: {
                name: "",
                notApprovedGuests: {},
                approvedGuests: {}
            }
        };

        this.handleAddGuest = this.handleAddGuest.bind(this);
    }

    componentWillMount() {
     eventsRef.child(this.state.eventId).once('value').then((snapshot) => {
         if (snapshot.exists()) {

             this.setState({event: new event(snapshot.val())});
         }
     });
    }

    handleAddGuest(newGuest) {
        // Saving the new guest in the DB
        const newGuestId = eventsRef.child(this.state.eventId + '/notApprovedGuests').push().key;
        eventsRef.child(this.state.eventId + '/notApprovedGuests/' + newGuestId).update(newGuest);

        // Updating the state
        let event = this.state.event;
        if (!event.notApprovedGuests) {
            event.notApprovedGuests = {};
        }

        event.notApprovedGuests[newGuestId] = newGuest;
        this.setState({event: event});
    }

    buildGuestsList(guests, guestsType) {
        return Object.keys(guests).map((guestId, i) => {
            return (
                <li key={i}>
                    <Link to={`/event/${this.state.eventId}/${guestsType}/${guestId}`}>{guests[guestId].fullName}</Link>
                </li>
            );
        });
    }

    render() {
        let approvedGuests;
        let notApprovedGuests;

        if (Object.keys(this.state.event.notApprovedGuests).length > 0) {
            notApprovedGuests = this.buildGuestsList(this.state.event.notApprovedGuests, 'newGuest');
        } else {
            notApprovedGuests = "No Not Approved guests.";
        }

        if (Object.keys(this.state.event.approvedGuests).length > 0) {
            approvedGuests = this.buildGuestsList(this.state.event.approvedGuests, 'guest');
        } else {
            approvedGuests = "No Approved guests.";
        }

        return (
            <div>
                <h1>{this.state.event.name}</h1>
                <div>
                    <h2>Details</h2>
                </div>
                <button>Calculate Carpool groups</button>
                <div>
                    <h2>Guests</h2>
                    <AddGuestForm onSubmit={this.handleAddGuest}/>
                    <span style={{textDecoration: 'underline'}}>Not approved guests</span>
                    <div>{notApprovedGuests}</div>
                    <span style={{textDecoration: 'underline'}}>Approved guests</span>
                    <div>{approvedGuests}</div>
                </div>
            </div>
        );
    }
}

export { EventPage };
