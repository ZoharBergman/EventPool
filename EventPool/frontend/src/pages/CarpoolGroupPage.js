/**
 * Created by Zohar on 20/03/2019.
 */
import React, { Component } from 'react';
import { eventsRef } from '../config/firebase';
import EventPoolService from '../services/EventPoolService';
import Stepper from 'react-stepper-horizontal/lib/index';
import Loader from '../components/Loader';
import ErrorPopupComponent from '../components/ErrorPopupComponent';

import Grid from '@material-ui/core/Grid';
import TextField from "@material-ui/core/es/TextField/TextField";
import Button from '@material-ui/core/Button';

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
            errorMessage: ""
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
                            eventLocation: eventLocationSnapshot.val()
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
            <div>
                Click on a passenger to get directions.
                <Stepper steps={steps} activeStep={pickupOrder.length}/>
            </div>
        )
    }

    buildGuestDetails(guest) {
        return (
            <Grid container spacing={24} id={guest.id}>
                <Grid item sm={4} xs={12}>
                    <TextField type="text" label="Name:" value={guest.name}/>
                </Grid>
                <Grid item sm={4} xs={12}>
                    <TextField type="text" label="Phone number:" value={guest.phoneNumber}/>
                </Grid>
                <Grid item sm={4} xs={12}>
                    <TextField type="text" fullWidth label="Start address:" value={guest.startAddress.name}/>
                </Grid>
            </Grid>
        );
    }

    render() {
        let pickupOrderDiv = this.state.pickupOrder.length === 0 ? (
            <Button variant="contained" onClick={this.calcPickupOrder}>Calculate pickup order</Button>
        ) : this.buildPickupOrderStepper(this.state.passengers, this.state.pickupOrder, this.state.eventLocation);

        return (
            <div>
                <Loader ref={this.loader}/>
                <ErrorPopupComponent ref={this.errorPopup} errorMessage={this.state.errorMessage}/>
                <h1 style={{textAlign: 'center'}}>{this.state.eventName}</h1>
                <div className="container">
                    <Grid container spacing={24}>
                        {Object.keys(this.state.driver).length > 0 &&
                            <Grid item xs={12}>
                                <h2>Driver:</h2>
                                {this.buildGuestDetails(this.state.driver)}
                            </Grid>
                        }
                        {Object.keys(this.state.passengers).length > 0 &&
                            <Grid item xs={12}>
                                <h2>Passengers:</h2>
                                {Object.values(this.state.passengers).map(passenger => this.buildGuestDetails(passenger))}
                            </Grid>
                        }
                    </Grid>
                </div>
                <div className="container">
                    <h2>Pickup Order</h2>
                    {pickupOrderDiv}
                </div>
            </div>
        );
    }
}

export { CarpoolGroupPage };