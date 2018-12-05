/**
 * Created by Zohar on 12/11/2018.
 */
import React, { Fragment } from 'react';
import { BrowserRouter, Route, Switch, Redirect  } from 'react-router-dom';

import { HomePage } from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import { CreateEventPage } from '../pages/CreateEventPage';
import { AppHeader } from '../headers/AppHeader';
import { MyEventsPage } from '../pages/MyEventsPage';
import { EventPage } from '../pages/EventPage';

export const AppRouter = () => (
    <BrowserRouter>
        <Fragment>
            <AppHeader />
            <Switch>
                <Route path="/login" component={LoginPage}/>
                <Route path='/home' component={HomePage}/>
                <Route path='/events/create' component={CreateEventPage} />
                <Route path='/events' component={MyEventsPage} />
                <Route path='/event/:id' component={EventPage}/>
                <Redirect from="/" to="/login" />
            </Switch>
        </Fragment>
    </BrowserRouter>
);