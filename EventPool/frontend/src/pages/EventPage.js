/**
 * Created by Zohar on 05/12/2018.
 */
import React, { Component } from 'react';
import { eventsRef } from '../config/firebase';
import AddGuestForm from '../forms/AddGuestForm';
import { Link } from 'react-router-dom';
import Popup from 'reactjs-popup';

import event from '../classes/event';
import EventPoolService from '../services/EventPoolService';
import CarpoolGroupComponent from '../components/CarpoolGroupComponent';
import NewDeviationRadiusForm from '../forms/NewDeviationRadiusForm';

class EventPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            eventId: props.match.params.id,
            event: {
                name: "",
                notApprovedGuests: {},
                approvedGuests: {},
                carpoolGroups: {}
            },
            isCarpoolGroupsConfirmed: false,
            isCalcCarpoolGroupsAgain: false,
            open: false
        };

        this.handleAddGuest = this.handleAddGuest.bind(this);
        this.handleCalcCarpoolGroups = this.handleCalcCarpoolGroups.bind(this);
        this.saveCarpoolGroups = this.saveCarpoolGroups.bind(this);
        this.calcCarpoolGroupsAgain = this.calcCarpoolGroupsAgain.bind(this);
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    componentWillMount() {
        eventsRef.child(this.state.eventId).once('value').then((snapshot) => {
            if (snapshot.exists()) {
                const val = snapshot.val();

                this.setState({
                    event: new event(val),
                    isCarpoolGroupsConfirmed: val.hasOwnProperty("carpoolGroups") && Object.keys(val.carpoolGroups).length > 0
                });

                // this.setState({carpoolGroups: [
                //     {
                //         driverId:"-LW1RlfHY-q2Um4OyR7Y",
                //         setPassengers:[{guestId:"-LVi4cRp_PYDq6QTAGuI",startLocation:{lat:32.1178669,lng:34.8298462}}]
                //     }, {
                //         driverId:"-LW1Rjad_92PS227eHuK",
                //         setPassengers:[{guestId:"-LW1HK2EOFt-voAMnZKz",startLocation:{lat:32.0726562,lng:34.8294233}}]
                //     }, {
                //         driverId:"-LW1RhQ7H0jKFr6JzlX2",
                //         setPassengers:[{guestId:"-LVClp-ZVtX1rqkcEzIj",startLocation:{lat:32.1168559,lng:34.8297932}},{guestId:"-LVClgQvUz4DMI_RIEHf",startLocation:{lat:32.0564395,lng:34.8732652}}]
                //     }
                // ]});
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
        return Object.keys(carpoolGroups).map((groupId, i) => {
            const groupDetails = {
                driver: {
                    id: carpoolGroups[groupId].driverId,
                    name: this.state.event.approvedGuests[carpoolGroups[groupId].driverId].fullName},
                passengers: []
            };

            carpoolGroups[groupId].setPassengers.forEach(passenger => {
                passenger.name = this.state.event.approvedGuests[passenger.guestId].fullName;
                groupDetails.passengers.push(passenger);
            });

           return (
               <li key={groupId}>
                   <CarpoolGroupComponent driver={groupDetails.driver} passengers={groupDetails.passengers}/>
               </li>
           );
        });
    }

    handleCalcCarpoolGroups() {
        EventPoolService.calcCarpoolMatching(this.state.eventId, this.state.event.maxRadiusInKm)
            .then(response => response.json())
            .then(data => {
                this.setState((prevState) => ({
                    event: {
                        ...prevState.event,
                        carpoolGroups: data
                    }
                }));
            });
    }

    saveCarpoolGroups() {
        this.setState({isCarpoolGroupsConfirmed: true});
        const groupObjects = {};
        this.state.event.carpoolGroups.forEach(group => {
           groupObjects[group.driverId] = group;
        });

        eventsRef.child(this.state.eventId + '/carpoolGroups').set(groupObjects);

        if (this.state.isCalcCarpoolGroupsAgain) {
            eventsRef.child(this.state.eventId).update({maxRadiusInKm: this.state.event.maxRadiusInKm});
            this.setState({isCalcCarpoolGroupsAgain: false});
        }
    }

    calcCarpoolGroupsAgain(data) {
        this.closeModal();

        // Update the new radius and then calculate the carpool groups
        this.setState((prevState) => ({
            event: {
                ...prevState.event,
                maxRadiusInKm: data.maxRadiusInKm
            },
            isCalcCarpoolGroupsAgain: true,
            isCarpoolGroupsConfirmed: false
        }), this.handleCalcCarpoolGroups);
    }

    openModal(){
        this.setState({ open: true })
    }
    closeModal() {
        this.setState({ open: false })
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

        if (Object.keys(this.state.event.carpoolGroups).length > 0) {
            carpoolGroups = this.buildCarpoolGroupsList(this.state.event.carpoolGroups);
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
                    <button onClick={this.handleCalcCarpoolGroups} hidden={this.state.isCarpoolGroupsConfirmed || Object.keys(this.state.event.carpoolGroups).length > 0}>Calculate Carpool Groups</button>
                    <button onClick={this.saveCarpoolGroups} hidden={this.state.isCarpoolGroupsConfirmed || Object.keys(this.state.event.carpoolGroups).length <= 0}>Save Carpool Groups</button>
                    <div>
                        <button onClick={this.openModal} hidden={Object.keys(this.state.event.carpoolGroups).length <= 0}>
                            Calculate Carpool Groups Again
                        </button>
                        <Popup open={this.state.open} onClose={this.closeModal} closeOnDocumentClick modal>
                            <NewDeviationRadiusForm maxRadiusInKm={this.state.event.maxRadiusInKm} onSubmit={this.calcCarpoolGroupsAgain}/>
                        </Popup>
                    </div>
                    {carpoolGroups}
                </div>
            </div>
        );
    }
}

export { EventPage };
