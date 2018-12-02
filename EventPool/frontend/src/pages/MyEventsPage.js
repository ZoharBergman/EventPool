/**
 * Created by Zohar on 30/11/2018.
 */
import React, { Component } from 'react';
import { userEventsRef } from '../config/firebase';

class MyEventsPage extends Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        // userEventsRef('/' + )
    }

    render() {
        return (
            <div>
                <div>
                    <h1>As organizer</h1>
                </div>
                <div>
                    <h1>As guest</h1>
                </div>
            </div>
        );
    }
}

export { MyEventsPage };
