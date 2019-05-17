/**
 * Created by Zohar on 27/11/2018.
 */
import React from "react";
import GoogleButton from 'react-google-button'
import auth from "../config/auth";
import {firebaseAuth} from "../config/firebase";
import Loader from '../components/Loader';
import logo from '../images/EventpoolLogo.png';
import './LoginPage.css';

const firebaseAuthKey = "firebaseAuthInProgress";

export default class LoginPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            splashScreen: false
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
        this.setState({splashScreen: true});
    }

    componentWillMount() {
        /**
         * We have appToken relevant for our backend API
         */
        if (localStorage.getItem(auth.appTokenKey) && !localStorage.getItem(firebaseAuthKey)) {
            this.props.history.push("/home");
            this.props.onAuthenticate();
            return;
        } else {
            this.setState({splashScreen: true});
        }

        let that = this;
        let unsubscribe = firebaseAuth().onAuthStateChanged((user) => {
            if (user) {
                localStorage.removeItem(firebaseAuthKey);
                that.setState({splashScreen: false});

                // here you could authenticate with you web server to get the
                // application specific token so that you do not have to
                // authenticate with firebase every time a user logs in

                // store the token
                localStorage.setItem(auth.appTokenKey, user.uid);
                this.props.history.push("/home");
                this.props.onAuthenticate();
                unsubscribe();
            } else {
                that.setState({splashScreen: false});
            }
        });
    }

    render() {
        console.log(firebaseAuthKey + "=" + localStorage.getItem(firebaseAuthKey));

        if (this.state.splashScreen) {
            return <SplashScreen />;
        }

        return <Login handleGoogleLogin={this.handleGoogleLogin}/>;
    }
}

const Login = ({handleGoogleLogin}) => (
    <div className="login-container">
        <img className="login-logo" src={logo}/>
        <GoogleButton className="login-btn" onClick={handleGoogleLogin} style={{
            marginLeft: "auto",
            marginRight: "auto",
            marginTop: "20px",
            bottom: "80px"
        }}/>
    </div>
);

const SplashScreen = () => (<Loader open={true}/>);
