/**
 * Created by Zohar on 20/11/2018.
 */
import { createClient } from '@google/maps';
import { GOOGLE_GEOCODE_API_KEY } from '../config/keys';

let googleMapsClient;

function initialize() {
    googleMapsClient = createClient({key: GOOGLE_GEOCODE_API_KEY});
}

function getGoogleMapsClient() {
    if (!googleMapsClient) {
        initialize();
    }

    return googleMapsClient;
}

function codeAddress(address, callback) {
    getGoogleMapsClient().geocode(
        {address: address},
        callback
    );
}

export default {
    codeAddress: codeAddress
};
