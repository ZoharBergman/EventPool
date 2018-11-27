/**
 * Created by Zohar on 27/11/2018.
 */
import React from "react";
// import {FontIcon, RaisedButton} from "material-ui";
import {loginWithGoogle} from "../config/auth";
import {firebaseAuth} from "../config/firebase";


const firebaseAuthKey = "firebaseAuthInProgress";
const appTokenKey = "appToken";

export default class LoginPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            splashScreen: false
        };

        this.handleGoogleLogin = this.handleGoogleLogin.bind(this);
    }

    handleGoogleLogin() {
        loginWithGoogle()
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
        if (localStorage.getItem(appTokenKey)) {
            // this.props.history.push("/home");
            // return;
        }

        firebaseAuth().onAuthStateChanged(user => {
            if (user) {
                console.log("User signed in: ", JSON.stringify(user));

                localStorage.removeItem(firebaseAuthKey);

                // here you could authenticate with you web server to get the
                // application specific token so that you do not have to
                // authenticate with firebase every time a user logs in
                localStorage.setItem(appTokenKey, user.uid);

                // store the token
                this.props.history.push("/home");
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
const SplashScreen = () => (<p>Loading...</p>)
