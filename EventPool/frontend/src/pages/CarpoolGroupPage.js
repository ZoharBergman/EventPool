/**
 * Created by Zohar on 20/03/2019.
 */
import React, { Component } from 'react';
import { eventsRef } from '../config/firebase';
import ListComponent from '../components/ListComponent';

class CarpoolGroupPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            eventId: props.match.params.eventId,
            groupId: props.match.params.groupId,
            driver: {},
            passengers: {},
            eventName: "",
            pickupOrder: []
        }

        this.check = this.check.bind(this);
    }

    check() {
        debugger;
    }

    componentWillMount() {
        eventsRef.child(this.state.eventId).child('carpoolGroups').child(this.state.groupId).once('value')
            .then((snapshot) => {
            if (snapshot.exists()) {
                const val = snapshot.val();

                this.setState(val);
            }
        });
    }

    render() {
        let pickupOrderDiv = this.state.pickupOrder.length === 0 ? "" : (
                <div>
                    <h2>Pickup Order</h2>
                </div>
        );

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
                {pickupOrderDiv}
            </div>
        );
    }
}

export { CarpoolGroupPage };