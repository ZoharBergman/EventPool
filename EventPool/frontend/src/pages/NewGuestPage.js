/**
 * Created by Zohar on 11/12/2018.
 */
import React, { Component } from 'react';
import CarpoolGuestDetailsForm from '../forms/CarpoolGuestDetailsForm';
import { eventsRef } from '../config/firebase';
import event from '../classes/event';
import geocoding from '../util/Geocoding';
import routesService from '../services/EventPoolService';
import Loader from '../components/Loader';

class NewGuestPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            eventId: props.match.params.eventId,
            id: props.match.params.guestId,
            event: {},
            newGuest: {}
        };

        this.loader = React.createRef();

        this.handleSubmit = this.handleSubmit.bind(this);
        this.afterGeocode = this.afterGeocode.bind(this);
        this.saveToDB = this.saveToDB.bind(this);
    }

    componentWillMount() {
        eventsRef.child(this.state.eventId).once('value').then((snapshot) => {
            if (snapshot.exists()) {
                this.setState({event: new event(snapshot.val())});

                if (this.state.event.notApprovedGuests[this.state.id]) {
                    this.setState({
                        newGuest: this.state.event.notApprovedGuests[this.state.id]
                    }, this.loader.current.closeLoader);
                }
            } else {
                this.loader.current.closeLoader();
            }
        });
    }

    componentDidMount() {
        // Checking if the event data from the DB have not loaded yet
        if (Object.keys(this.state.event) <= 0) {
            this.loader.current.openLoader();
        }
    }

    saveToDB() {
        // Save guest as approved
        eventsRef.child(this.state.eventId).child('approvedGuests').child(this.state.id).set(this.state.newGuest);

        // Delete guest as not approved
        eventsRef.child(this.state.eventId).child('notApprovedGuests').child(this.state.id).remove();
    }

    afterGeocode(err, geocodeResponse) {
        if (!err) {
            // Setting the geocoded address on the guest detail
            const guestDetails = this.state.newGuest;
            guestDetails.startAddress = {
                name: geocodeResponse.json.results[0].formatted_address,
                location: geocodeResponse.json.results[0].geometry.location
            };

            // Checking if the guest is a driver
            if (!guestDetails.isCar) { // The guest is a passenger
                guestDetails.isCar = false;
                this.setState({newGuest: guestDetails}, this.saveToDB);
            } else { // The guest is a driver
                // Calculate and save the route of the driver
                routesService.calcAndSaveRoute(
                    `${guestDetails.startAddress.location.lat},${guestDetails.startAddress.location.lng}`,
                    `${this.state.event.address.location.lat},${this.state.event.address.location.lng}`,
                    this.state.id,
                    this.state.eventId,
                    guestDetails.freeSeatsNum);

                this.saveToDB();
            }
        }
    };

    handleSubmit(guestDetails) {
        Object.assign(guestDetails, guestDetails, this.state.newGuest);
        guestDetails.id = this.state.id;

        if (!guestDetails.isComing) {
            // Save the guest's details in the DB
            this.saveToDB();
        } else if (guestDetails.isComing && guestDetails.isCar && guestDetails.freeSeatsNum === "0") {
            this.setState({newGuest: guestDetails}, this.saveToDB);
        } else {
            this.setState({newGuest: guestDetails}, () => {
                // Geocoding the start location of the guest
                geocoding.codeAddress(guestDetails.startAddress, this.afterGeocode);
            });
        }
    }

    render() {
        return (
            <div>
                <Loader ref={this.loader}/>
                <CarpoolGuestDetailsForm isDisabled={false} guest={this.state.newGuest} event={this.state.event}
                                         onSubmit={this.handleSubmit}/>
            </div>
        );
    }
}

export { NewGuestPage };
