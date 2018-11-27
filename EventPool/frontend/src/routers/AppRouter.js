/**
 * Created by Zohar on 12/11/2018.
 */
import React, { Fragment } from 'react';
import { BrowserRouter, Route, Switch, Redirect  } from 'react-router-dom';

import { HomePage } from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import CreateEventForm from '../forms/CreateEventForm';
import handlers from '../forms/FormsHandler';

export const AppRouter = () => (
    <BrowserRouter>
        <Fragment>
            <Switch>
                <Route path="/login" component={LoginPage}/>
                {/*<Route path='/home' component={HomePage}/>*/}
                <Route path='/events/create' component={() => <CreateEventForm onSubmit={handlers.handleCreateEvent}/>} />
                <Redirect from="/" to="/login" />
            </Switch>
        </Fragment>
    </BrowserRouter>
);