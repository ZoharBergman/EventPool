/**
 * Created by Zohar on 12/11/2018.
 */
import React, { Component } from 'react';
import logo from '../images/EventpoolLogo.png';

class HomePage extends Component {
    render() {
        return (
            <img src={logo} style={{ width: '100%', height: '100%' }}/>
        );
    }
}

export { HomePage };
