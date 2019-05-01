/**
 * Created by Zohar on 01/05/2019.
 */
import React from "react";
import auth from '../config/auth';
import { Redirect, Route } from 'react-router-dom';

const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={(props) => (
        auth.isUserAuthenticated()
            ? <Component {...props} />
            : <Redirect from="/" to='/login' />
    )} />
);

export default PrivateRoute;