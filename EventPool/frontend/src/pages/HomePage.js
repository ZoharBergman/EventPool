/**
 * Created by Zohar on 12/11/2018.
 */
import React, { Component } from 'react';
import logo from '../images/EventpoolLogo3.png';
import './HomePage.css';

class HomePage extends Component {
    render() {
        return (
            <div className="home-page">
                <img src={logo} style={{ width: "35%", display: "block", marginLeft: "auto", marginRight: "auto", marginTop: "5%" }}/>
                <div className="status-container">
                   {/* <div className="item my-events">
                        <div className="title">My Events</div>
                        <div className="value">3</div>
                    </div>*/}
                    <div className="item">
                        <button className="new-event-btn event-pool-btn" onClick={() => {
                            this.props.history.push('/events/create');
                        }}>Create New Event</button>
                    </div>
                    {/*<div className="item upcoming-events">
                        <div className="title">Upcoming Events</div>
                        <div className="value">4</div>
                    </div>*/}
                </div>

            </div>
        );
    }
}

export { HomePage };
