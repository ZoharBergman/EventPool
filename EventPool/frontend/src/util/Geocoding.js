/**
 * Created by Zohar on 20/11/2018.
 */
import { createClient } from '@google/maps';

let googleMapsClient;

function initialize() {
    googleMapsClient = createClient({key: ''});
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
