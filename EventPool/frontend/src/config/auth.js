/**
 * Created by Zohar on 27/11/2018.
 */
import {firebaseAuth, googleProvider} from "./firebase";

// ------------------------- Consts ------------------------- //
const appTokenKey = "appToken";

// ------------------------- Functions ------------------------- //
function loginWithFirebase(provider) {
    return firebaseAuth().signInWithRedirect(provider);
}

function loginWithGoogle() {
    return loginWithFirebase(googleProvider);
}

function logout() {
    return firebaseAuth().signOut();
}

function isUserAuthenticated() {
    return !!localStorage.getItem(appTokenKey);
}

export default {
    appTokenKey: appTokenKey,
    loginWithGoogle : loginWithGoogle,
    logout: logout,
    isUserAuthenticated: isUserAuthenticated
};