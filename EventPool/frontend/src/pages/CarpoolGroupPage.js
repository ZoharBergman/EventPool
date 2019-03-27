/**
 * Created by Zohar on 20/03/2019.
 */
import React, { Component } from 'react';
import { eventsRef } from '../config/firebase';
import ListComponent from '../components/ListComponent';
import EventPoolService from '../services/EventPoolService';
import Stepper from 'react-stepper-horizontal/lib/index';

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
            eventLocation: {}
        };

        this.check = this.check.bind(this);
        this.calcPickupOrder = this.calcPickupOrder.bind(this);
        this.buildPickupOrderStepper = this.buildPickupOrderStepper.bind(this);
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
                        });
                    }
                    });
            }
        });
    }

    calcPickupOrder() {
        EventPoolService.calcAndSavePickupOrder(this.state.eventId, this.state.groupId)
            .then(response => response.json())
            .then(pickupOrder => {
                this.setState({pickupOrder: pickupOrder});
            });
    }

    buildPickupOrderStepper(passengers, pickupOrder, eventLocation) {
        let steps = [];

        pickupOrder.forEach(curr => {
           steps.push({
               title: passengers[curr].name,
               href: `${this.WAZE_URL}${passengers[curr].startLocation.lat},${passengers[curr].startLocation.lng}`
           })
        });

        steps.push({
            title: "Event",
            href: `${this.WAZE_URL}${eventLocation.lat},${eventLocation.lng}`
        });

        return (
            <Stepper steps={steps} activeStep={pickupOrder.length}/>
        )
    }

    render() {
        let pickupOrderDiv = this.state.pickupOrder.length === 0 ? (
            <button onClick={this.calcPickupOrder}>Calculate pickup order</button>
        ) : this.buildPickupOrderStepper(this.state.passengers, this.state.pickupOrder, this.state.eventLocation);

        return (
            <div>
                <h1>{this.state.eventName}</h1>
                <div>
                    <h2>Carpool Group Details</h2>
                    <div>
                        <div>
                            <h3>Driver:</h3>
                            {ListComponent([this.state.driver], "id", "name", "phoneNumber")}
                        </div>
                        <div>
                            <h3>Passengers:</h3>
                            {ListComponent(Object.values(this.state.passengers), "id", "name", "phoneNumber")}
                        </div>
                    </div>
                </div>
                <div>
                    <h2>Pickup Order</h2>
                    {pickupOrderDiv}
                </div>
            </div>
        );
    }
}

export { CarpoolGroupPage };