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
import ErrorPopupComponent from '../components/ErrorPopupComponent';

class NewGuestPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            eventId: props.match.params.eventId,
            id: props.match.params.guestId,
            event: {},
            newGuest: {},
            errorMessage: "",
            initMode: true
        };

        this.loader = React.createRef();
        this.errorPopup = React.createRef();

        this.handleSubmit = this.handleSubmit.bind(this);
        this.afterGeocode = this.afterGeocode.bind(this);
        this.saveToDB = this.saveToDB.bind(this);
    }

    componentWillMount() {
        eventsRef.child(this.state.eventId).once('value').then((snapshot) => {
            if (snapshot.exists()) {
                this.setState({event: new event(snapshot.val())});

                if (this.state.event.guests[this.state.id]) {
                    this.setState({
                        newGuest: this.state.event.guests[this.state.id],
                        initMode: false
                    }, this.loader.current.closeLoader);
                }
            } else {
                this.setState({
                    initMode: false
                }, this.loader.current.closeLoader);
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
        eventsRef.child(this.state.eventId).child('guests').child(this.state.id).update(this.state.newGuest);
    }

    afterGeocode(err, geocodeResponse) {
        if (err || geocodeResponse.json.results.length === 0) {
            this.loader.current.closeLoader();
            this.setState({errorMessage: "Error while geocoding the address."}, this.errorPopup.current.openErrorPopup);
        } else {
            const startAddress = {
                name: geocodeResponse.json.results[0].formatted_address,
                location: geocodeResponse.json.results[0].geometry.location
            };

            this.setState((prevState) => ({
                ...prevState,
                newGuest: {
                    ...prevState.newGuest,
                    startAddress: startAddress
                }
            }), () => {
                if (!this.state.newGuest.isCar) { // The guest is a passenger
                    this.saveToDB();
                    this.loader.current.closeLoader();
                    this.props.history.push('/event/newGuest/success');
                } else { // The guest is a driver
                    // Calculate and save the route of the driver
                    routesService.calcAndSaveRoute(
                        `${this.state.newGuest.startAddress.location.lat},${this.state.newGuest.startAddress.location.lng}`,
                        `${this.state.event.address.location.lat},${this.state.event.address.location.lng}`,
                        this.state.id,
                        this.state.eventId,
                        this.state.newGuest.freeSeatsNum)
                        .then(() => {
                            this.saveToDB();
                            this.loader.current.closeLoader();
                            this.props.history.push('/event/newGuest/success');
                        })
                        .catch(() => {
                            this.loader.current.closeLoader();
                            this.setState({errorMessage: "Error while trying to calculate and save the route."},
                                this.errorPopup.current.openErrorPopup);
                        });
                }
            });
        }
    }

    handleSubmit(guestDetails) {
        this.loader.current.openLoader();

        if (guestDetails.hasOwnProperty("isComing")) {
            guestDetails.isComing = (guestDetails.isComing === "true");
        } else {
            guestDetails.isComing = false;
        }

        if (guestDetails.hasOwnProperty("isCar")) {
            guestDetails.isCar = (guestDetails.isCar === "true");
        }

        Object.assign(guestDetails, guestDetails, this.state.newGuest);

        this.setState({newGuest: guestDetails}, () => {
            if(!guestDetails.isComing ||
               (guestDetails.isComing && guestDetails.isCar && guestDetails.freeSeatsNum === "0")) {
                this.saveToDB();
                this.loader.current.closeLoader();
                this.props.history.push('/event/newGuest/success');
            } else {
                // Geocoding the start location of the guest
                geocoding.codeAddress(guestDetails.startAddress, this.afterGeocode);
            }
        });
    }

    render() {
        return (
            <div>
                <Loader ref={this.loader}/>
                <ErrorPopupComponent ref={this.errorPopup} errorMessage={this.state.errorMessage}/>
                {!this.state.initMode &&
                <CarpoolGuestDetailsForm isDisabled={false} guest={this.state.newGuest} event={this.state.event}
                                         onSubmit={this.handleSubmit}/>
                }
            </div>
        );
    }
}

export { NewGuestPage };
