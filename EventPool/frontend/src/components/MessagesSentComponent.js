/**
 * Created by Zohar on 17/05/2019.
 */
import React, { Component } from 'react';
import Popup from 'reactjs-popup';
import './MessagesSentComponent.css';

class MessagesSentComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false
        };

        this.closeMessagesSentPopup= this.closeMessagesSentPopup.bind(this);
        this.openMessagesSentPopup = this.openMessagesSentPopup.bind(this);
    }

    closeMessagesSentPopup() {
        this.setState({open: false});
    }

    openMessagesSentPopup() {
        this.setState({open: true});
    }

    render() {
        return (
            <Popup open={this.state.open} modal className="messages-sent-popup-container">
                <div>
                    <a className="close" onClick={this.closeMessagesSentPopup}>
                        &times;
                    </a>
                    <h4>Messages sent successfully!</h4>
                </div>
            </Popup>
        );
    }
}

export default MessagesSentComponent;
