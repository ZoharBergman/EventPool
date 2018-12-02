/**
 * Created by Zohar on 06/11/2018.
 */
import * as firebase from "firebase";
import { DB_COLLECTIONS } from '../util/dbCollections';
import userEvenet from '../classes/userEvent';

const config = {
    apiKey: "AIzaSyBMZVAJEOouJVnrgaE6VKi_ajW_V0Mpomc",
    authDomain: "eventpool-65e23.firebaseapp.com",
    databaseURL: "https://eventpool-65e23.firebaseio.com",
    projectId: "eventpool-65e23",
    storageBucket: "eventpool-65e23.appspot.com",
    messagingSenderId: "130712267499"
};

firebase.initializeApp(config);

const databaseRef = firebase.database().ref();

export const googleProvider = new firebase.auth.GoogleAuthProvider();
export const firebaseAuth = firebase.auth;
export const database = firebase.database();

export const eventsRef = databaseRef.child(DB_COLLECTIONS.EVENTS);
export const userEventsRef = databaseRef.child(userEvenet.collectionName());