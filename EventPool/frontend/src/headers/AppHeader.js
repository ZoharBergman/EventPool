/**
 * Created by Zohar on 30/11/2018.
 */
import React, { Component } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import auth from '../config/auth';
import './AppHeader.css'

class AppHeader extends Component {
    constructor(props) {
        super(props);

        this.handleLogout = this.handleLogout.bind(this);
    }

    handleLogout() {
        let that = this;
        auth.logout().then(() => {
            localStorage.removeItem(auth.appTokenKey);
            that.props.history.push("/login");
            that.props.onLogout();
        });
    }

    render() {
        return (
            <nav className="navbar navbar-expand-lg navbar-light app-header">
                <a className="navbar-brand" href="/">
                    <i className="fab fa-react fa-2x" style={{color: 'dodgerblue'}}></i>
                </a>
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#menu">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="menu">
                    <ul className="navbar-nav mr-auto">
                        <li className="nav-item">
                            <div className="nav-link">
                                <NavLink to='/home' activeClassName='menu selected'>Home</NavLink>
                            </div>
                        </li>
                        <li className="nav-item">
                            <div className="nav-link">
                                <NavLink to='/events/create' activeClassName='menu selected'>Create New Event</NavLink>
                            </div>
                        </li>
                        <li className="nav-item">
                            <div className="nav-link">
                                <NavLink to='/events/' activeClassName='menu selected' exact={true}>My Events</NavLink>
                            </div>
                        </li>
                        <li className="nav-item log-out-li">
                            <div className="nav-link">
                                <NavLink to='/login'
                                         activeClassName='menu selected'
                                         onClick={this.handleLogout}>Log Out
                                </NavLink>
                            </div>
                        </li>
                    </ul>
                </div>
            </nav>
        );
    }
}

export default withRouter (AppHeader);

