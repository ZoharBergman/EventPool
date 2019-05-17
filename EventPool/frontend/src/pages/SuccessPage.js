/**
 * Created by Zohar on 17/05/2019.
 */
import React, { Component } from 'react';
import logo from '../images/EventpoolLogo.png';
import './SuccessPage.css';

class SuccessPage extends Component {
    render() {
        return (
           <div className="success-container">
               <div className="success-text">
                   Your details submitted successfully!
               </div>
               <img src={logo} className="success-logo"/>
           </div>
        );
    }
}

export default SuccessPage;
