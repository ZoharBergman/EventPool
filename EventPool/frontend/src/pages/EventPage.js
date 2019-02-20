/**
 * Created by Zohar on 05/12/2018.
 */
import React, { Component } from 'react';
import { eventsRef } from '../config/firebase';
import AddGuestForm from '../forms/AddGuestForm';
import { Link } from 'react-router-dom';
import event from '../classes/event';
import EventPoolService from '../services/EventPoolService';
import CarpoolGroupComponent from '../components/CarpoolGroupComponent';

class EventPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            eventId: props.match.params.id,
            event: {
                name: "",
                notApprovedGuests: {},
                approvedGuests: {}
            },
            carpoolGroups: {}
        };

        this.handleAddGuest = this.handleAddGuest.bind(this);
        this.handleCalcCarpoolGroups = this.handleCalcCarpoolGroups.bind(this);
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

    buildCarpoolGroupsList(carpoolGroups) {
        debugger;
    }

    // syntaxHighlight(json) {
    // json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    //     var cls = 'number';
    //     if (/^"/.test(match)) {
    //         if (/:$/.test(match)) {
    //             cls = 'key';
    //         } else {
    //             cls = 'string';
    //         }
    //     } else if (/true|false/.test(match)) {
    //         cls = 'boolean';
    //     } else if (/null/.test(match)) {
    //         cls = 'null';
    //     }
    //     return '<span class="' + cls + '">' + match + '</span>';
    // });
    // }

    handleCalcCarpoolGroups() {
        EventPoolService.calcCarpoolMatching(this.state.eventId, this.state.event.maxRadiusInKm)
            .then(response => response.json())
            .then(data => {
                debugger;
                this.setState({carpoolGroups: JSON.stringify(data)});
            });
    }

    render() {
        let approvedGuests;
        let notApprovedGuests;
        let carpoolGroups;

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

        if (Object.keys(this.state.carpoolGroups).length > 0) {
            carpoolGroups = this.buildCarpoolGroupsList(this.state.carpoolGroups);
        }

        return (
            <div>
                <h1>{this.state.event.name}</h1>
                <div>
                    <h2>Details</h2>
                </div>
                <div>
                    <h2>Guests</h2>
                    <AddGuestForm onSubmit={this.handleAddGuest}/>
                    <span style={{textDecoration: 'underline'}}>Not approved guests</span>
                    <div>{notApprovedGuests}</div>
                    <span style={{textDecoration: 'underline'}}>Approved guests</span>
                    <div>{approvedGuests}</div>
                </div>
                <div>
                    <h2>Carpool Groups</h2>
                    <button onClick={this.handleCalcCarpoolGroups}>Calculate Carpool groups</button>
                    {carpoolGroups}
                </div>
            </div>
        );
    }
}

export { EventPage };
