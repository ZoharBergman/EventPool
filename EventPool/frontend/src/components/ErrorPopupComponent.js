/**
 * Created by Zohar on 04/04/2019.
 */
import React, { Component } from 'react';
import Popup from 'reactjs-popup';
import './ErrorPopupComponent.css';

class ErrorPopupComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false
        };

        this.closeErrorPopup = this.closeErrorPopup.bind(this);
        this.openErrorPopup = this.openErrorPopup.bind(this);
    }

    closeErrorPopup() {
        this.setState({open: false});
    }

    openErrorPopup() {
        this.setState({open: true});
    }

    render() {
        return (
            <Popup open={this.state.open} modal>
                <div className="error-popup-container">
                    <a className="close" onClick={this.closeErrorPopup}>
                        &times;
                    </a>
                    <h1>Ho No!</h1>
                    {this.props.errorMessage}
                </div>
            </Popup>
        );
    }
}

export default ErrorPopupComponent;