/**
 * Created by Zohar on 12/11/2018.
 */
import React, { Component } from 'react';
import { withRouter, NavLink } from 'react-router-dom';

class HomePage extends Component {
    nextPath(path) {
        this.props.history.push(path);
    }

    render() {
        return (
            <nav className="navbar navbar-expand-lg navbar-light alert-dark">
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
                                <NavLink to='/' activeClassName='menu selected' exact={true}>HOME</NavLink>
                            </div>
                        </li>
                        <li className="nav-item">
                            <div className="nav-link">
                                <NavLink to='/events/create' activeClassName='menu selected'>CREATE NEW EVENT</NavLink>
                            </div>
                        </li>
                        <li className="nav-item">
                            <div className="nav-link">
                                <NavLink to='//events/create' activeClassName='menu selected'>MY EVENTS</NavLink>
                            </div>
                        </li>
                    </ul>
                </div>
            </nav>
            // <main>
            //     <button onClick={() => this.nextPath('events/create')}>Create new event</button>
            // </main>
        );
    }
}

export { HomePage };
