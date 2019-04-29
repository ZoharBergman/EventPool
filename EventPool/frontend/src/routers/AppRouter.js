/**
 * Created by Zohar on 12/11/2018.
 */
import React, { Fragment, Component } from 'react';
import { BrowserRouter, Route, Switch, Redirect  } from 'react-router-dom';

import { HomePage } from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import { CreateEventPage } from '../pages/CreateEventPage';
import AppHeader from '../headers/AppHeader';
import { MyEventsPage } from '../pages/MyEventsPage';
import { EventPage } from '../pages/EventPage/EventPage';
import { NewGuestPage } from '../pages/NewGuestPage';
import { CarpoolGroupPage } from '../pages/CarpoolGroupPage';
import ImportDataPage from '../pages/ImportDataPage';
import auth from '../config/auth';

class AppRouter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isAppHeader: !!localStorage.getItem(auth.appTokenKey)
        };

        this.showHeader = this.showHeader.bind(this);
        this.hideHeader = this.hideHeader.bind(this);
    }

    showHeader() {
        this.setState({isAppHeader: true});
    }

    hideHeader() {
        this.setState({isAppHeader: false});
    }

    render() {
        return (
            <BrowserRouter>
                <Fragment>
                    {this.state.isAppHeader && <AppHeader onLogout={this.hideHeader}/>}
                    <Switch>
                        <Route path="/login" render={(props) => <LoginPage {...props} onAuthenticate={this.showHeader}/>} />
                        <Route path='/home' component={HomePage}/>
                        <Route path='/events/create' component={CreateEventPage} />
                        <Route path='/events' component={MyEventsPage} />
                        <Route path='/event/:id' exact={true} component={EventPage}/>
                        <Route path='/event/:eventId/newGuest/:guestId' component={NewGuestPage}/>
                        <Route path='/event/:eventId/carpoolGroup/:groupId' component={CarpoolGroupPage}/>
                        <Route path='/importData' component={ImportDataPage}/>
                        <Redirect from="/" to="/login" />
                    </Switch>
                </Fragment>
            </BrowserRouter>
        );
    }
}

export { AppRouter };