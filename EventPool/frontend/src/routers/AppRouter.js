/**
 * Created by Zohar on 12/11/2018.
 */
import React, { Fragment, Component } from 'react';
import { BrowserRouter, Route, Switch, Redirect  } from 'react-router-dom';

import { HomePage } from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import { CreateEventPage } from '../pages/CreateEventPage';
import { AppHeader } from '../headers/AppHeader';
import { MyEventsPage } from '../pages/MyEventsPage';
import { EventPage } from '../pages/EventPage';
import { NewGuestPage } from '../pages/NewGuestPage';
import auth from '../config/auth';

class AppRouter extends Component {
    constructor(props) {
        super(props);
        this.state = {isAppHeader: true};
    }

    showHeader() {
        this.setState({isAppHeader: true});
    }

    hideHeader() {
        this.setState({isAppHeader: true});
    }

    render() {
        // let isAppHeader = this.state.isAppHeader ? <AppHeader onLogout={this.hideHeader}/> : undefined;
        return (
            <BrowserRouter>
                <Fragment>
                    <AppHeader/>
                    <Switch>
                        <Route path="/login" component={LoginPage} />
                        <Route path='/home' component={HomePage}/>
                        <Route path='/events/create' component={CreateEventPage} />
                        <Route path='/events' component={MyEventsPage} />
                        <Route path='/event/:id' exact={true} component={EventPage}/>
                        <Route path='/event/:eventId/newGuest/:guestId' component={NewGuestPage}/>
                        {/*<Route path='/event/:eventId/guest/:guestId' component={}/>*/}
                        <Redirect from="/" to="/login" />
                    </Switch>
                </Fragment>
            </BrowserRouter>
        );
    }
}

export { AppRouter };