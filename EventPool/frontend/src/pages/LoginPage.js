/**
 * Created by Zohar on 27/11/2018.
 */
import React from "react";
import GoogleButton from 'react-google-button'
import auth from "../config/auth";
import {firebaseAuth} from "../config/firebase";
import Loader from '../components/Loader';
import logo from '../images/EventpoolLogo.png';

const firebaseAuthKey = "firebaseAuthInProgress";

export default class LoginPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            splashScreen: true
        };

        this.handleGoogleLogin = this.handleGoogleLogin.bind(this);
    }

    handleGoogleLogin() {
        auth.loginWithGoogle()
            .catch(function (error) {
                alert(error);
                localStorage.removeItem(firebaseAuthKey);
            });
        localStorage.setItem(firebaseAuthKey, "1");
    }

    componentWillMount() {
        /**
         * We have appToken relevant for our backend API
         */
        if (localStorage.getItem(auth.appTokenKey)) {
            this.props.history.push("/home");
            this.props.onAuthenticate();
            return;
        }

        firebaseAuth().onAuthStateChanged(user => {
            if (user) {
                localStorage.removeItem(firebaseAuthKey);

                // here you could authenticate with you web server to get the
                // application specific token so that you do not have to
                // authenticate with firebase every time a user logs in

                // store the token
                localStorage.setItem(auth.appTokenKey, user.uid);
                this.props.history.push("/home");
                this.props.onAuthenticate();
            }
        });
    }

    render() {
        console.log(firebaseAuthKey + "=" + localStorage.getItem(firebaseAuthKey));

        if (localStorage.getItem(firebaseAuthKey) === "1") {
            return <SplashScreen />;
        }

        return <Login handleGoogleLogin={this.handleGoogleLogin}/>;
    }
}

const Login = ({handleGoogleLogin}) => (
    <div style={{margin: "0", position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%)"}}>
        <img src={logo} style={{width: "70%", display: "block", marginLeft: "auto", marginRight: "auto"}}/>
        <GoogleButton onClick={handleGoogleLogin} style={{marginLeft: "auto", marginRight: "auto", bottom: "80px"}}/>
    </div>
);

const SplashScreen = () => (<Loader open={true}/>);
