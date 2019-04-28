/**
 * Created by Zohar on 20/03/2019.
 */
import React, { Component } from 'react';
import { eventsRef } from '../config/firebase';
import EventPoolService from '../services/EventPoolService';
import Stepper from 'react-stepper-horizontal/lib/index';
import Loader from '../components/Loader';
import ErrorPopupComponent from '../components/ErrorPopupComponent';
import './CarpoolGroupPage.css';

class CarpoolGroupPage extends Component {
    constructor(props) {
        super(props);

        this.WAZE_URL = "https://www.waze.com/he/livemap?navigate=yes&zoom=17&ll=";

        this.state = {
            eventId: props.match.params.eventId,
            groupId: props.match.params.groupId,
            driver: {},
            passengers: {},
            eventName: "",
            pickupOrder: [],
            eventLocation: {},
            errorMessage: "",
            initMode: true
        };

        this.loader = React.createRef();
        this.errorPopup = React.createRef();

        this.check = this.check.bind(this);
        this.calcPickupOrder = this.calcPickupOrder.bind(this);
        this.buildPickupOrderStepper = this.buildPickupOrderStepper.bind(this);
        this.buildGuestDetails = this.buildGuestDetails.bind(this);
    }

    check() {
        debugger;
    }

    componentWillMount() {
        eventsRef.child(this.state.eventId).child('carpoolGroups').child(this.state.groupId).once('value')
            .then((snapshot) => {
            if (snapshot.exists()) {
                const val = snapshot.val();

                eventsRef.child(this.state.eventId).child('address').child('location').once('value')
                    .then((eventLocationSnapshot) => {
                    if (eventLocationSnapshot.exists()) {
                        this.setState({
                            ...val,
                            eventLocation: eventLocationSnapshot.val(),
                            initMode: false
                        }, this.loader.current.closeLoader);
                    }
                    });
            } else {
                this.loader.current.closeLoader();
            }
        });
    }

    componentDidMount() {
        // Checking if the event data from the DB have not loaded yet
        if (Object.keys(this.state.driver).length <= 0) {
            this.loader.current.openLoader();
        }
    }

    calcPickupOrder() {
        this.loader.current.openLoader();
        EventPoolService.calcAndSavePickupOrder(this.state.eventId, this.state.groupId)
            .then(response => response.json())
            .then(pickupOrder => {
                this.setState({pickupOrder: pickupOrder}, this.loader.current.closeLoader);
            })
            .catch(() => {
                this.loader.current.closeLoader();
                this.setState({errorMessage: "Error while trying to calculate the pickup order."},
                    this.errorPopup.current.openErrorPopup);
        });
    }

    buildPickupOrderStepper(passengers, pickupOrder, eventLocation) {
        let steps = [];

        pickupOrder.forEach(curr => {
           steps.push({
               title: passengers[curr].name,
               href: `${this.WAZE_URL}${passengers[curr].startAddress.location.lat},${passengers[curr].startAddress.location.lng}`
           })
        });

        steps.push({
            title: "Event",
            href: `${this.WAZE_URL}${eventLocation.lat},${eventLocation.lng}`
        });

        return (
            <div className="stepper">
                Click on a passenger to get directions.
                <Stepper steps={steps} activeStep={pickupOrder.length}/>
            </div>
        )
    }

    buildGuestDetails(guest) {
        return (
        <div className="guests-details-content">
            <div>
                <i className="material-icons guests-details-icon">
                    person
                </i>
                {guest.name}
            </div>
            <div>
                <i className="material-icons guests-details-icon">
                    phone
                </i>
                {guest.phoneNumber}
            </div>
            <div>
                <i className="material-icons guests-details-icon">
                    location_on
                </i>
                {guest.startAddress.name}
            </div>
        </div>
        );
    }

    render() {
        let pickupOrderDiv = this.state.pickupOrder.length === 0 ? (
            <button className="event-pool-btn" onClick={this.calcPickupOrder}>Calculate pickup order</button>
        ) : this.buildPickupOrderStepper(this.state.passengers, this.state.pickupOrder, this.state.eventLocation);

        return (
            <div className="carpool-group-container">
                <Loader ref={this.loader}/>
                <ErrorPopupComponent ref={this.errorPopup} errorMessage={this.state.errorMessage}/>
                {!this.state.initMode && (
                    <div>
                        <h2 className="title">{this.state.eventName}</h2>
                        <div className="carpool-group-details-container">
                            {Object.keys(this.state.driver).length > 0 &&
                                <div className="guests-details-container">
                                    <h4 className="sub-title">Driver:</h4>
                                    {this.buildGuestDetails(this.state.driver)}
                                </div>
                            }
                            {Object.keys(this.state.passengers).length > 0 &&
                                <div className="guests-details-container">
                                    <h4 className="sub-title">Passengers:</h4>
                                    {Object.values(this.state.passengers).map(passenger => this.buildGuestDetails(passenger))}
                                </div>
                            }
                        </div>
                        <div className="pickup-order-container">
                            <h4 className="sub-title">Pickup Order</h4>
                            {pickupOrderDiv}
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export { CarpoolGroupPage };