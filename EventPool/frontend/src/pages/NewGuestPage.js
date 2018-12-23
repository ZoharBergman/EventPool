/**
 * Created by Zohar on 11/12/2018.
 */
import React, { Component } from 'react';
import CarpoolGuestDetailsForm from '../forms/CarpoolGuestDetailsForm';
import { eventsRef } from '../config/firebase';
import event from '../classes/event';
import geocoding from '../util/Geocoding';

class NewGuestPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            eventId: props.match.params.eventId,
            guestId: props.match.params.guestId,
            event: {},
            newGuest: {}
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.afterGeocode = this.afterGeocode.bind(this);
    }

    afterGeocode = function(err, geocodeResponse) {
        if (!err) {
            // Setting the geocoded address on the guest detail
            let guestDetails = this.state.newGuest;
            guestDetails.startLocation = geocodeResponse.json.results[0].geometry.location;
            delete guestDetails.startAddress;

            // Checking if the guest is a driver
            if (!guestDetails.isCar) {
                // Save the guest's details in the DB


            } else { // The guest is a driver
                // Getting the route from the driver's starting point to the event's point
                geocoding.calcRoute(guestDetails.startLocation, this.state.event.address.location).then(function (result) {
                    debugger;
                    // geocoding.decodePolyline(result)
                })
            }
        }
    }

    handleSubmit(guestDetails) {
        this.setState({newGuest: guestDetails});

        if (!guestDetails.isComing) {
            // Save the guest's details in the DB

        } else {
            // Geocoding the start address of the guest
            geocoding.codeAddress(guestDetails.startAddress, this.afterGeocode);
        }
    }

    componentWillMount() {
        eventsRef.child(this.state.eventId).once('value').then((snapshot) => {
            if (snapshot.exists()) {
                this.setState({event: new event(snapshot.val())});

                if (this.state.event.notApprovedGuests[this.state.guestId]) {
                    this.setState({newGuest: this.state.event.notApprovedGuests[this.state.guestId]})
                }
            }
        });
    }

    render() {
        return (
            <div>
                <CarpoolGuestDetailsForm isDisabled={false} guest={this.state.newGuest} event={this.state.event}
                                         onSubmit={this.handleSubmit}/>
            </div>
        );
    }
}

export { NewGuestPage };
