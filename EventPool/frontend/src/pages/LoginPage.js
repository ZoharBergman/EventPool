/**
 * Created by Zohar on 27/11/2018.
 */
import React from "react";
// import {FontIcon, RaisedButton} from "material-ui";
import auth from "../config/auth";
import {firebaseAuth} from "../config/firebase";
import Loader from '../components/Loader';

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

const iconStyles = {
    color: "#ffffff"
};

const Login = ({handleGoogleLogin}) => (
    <div>
        <h1>Login</h1>
        <div>
            <button onClick={handleGoogleLogin}>Sign in with google</button>
            {/*<RaisedButton*/}
                {/*label="Sign in with Google"*/}
                {/*labelColor={"#ffffff"}*/}
                {/*backgroundColor="#dd4b39"*/}
                {/*icon={<FontIcon className="fa fa-google-plus" style={iconStyles}/>}*/}
                {/*onClick={handleGoogleLogin}*/}
            {/*/>*/}
        </div>
    </div>
);

const SplashScreen = () => (<Loader open={true}/>);
