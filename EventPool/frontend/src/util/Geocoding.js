/**
 * Created by Zohar on 20/11/2018.
 */
import { createClient } from '@google/maps';
import { GOOGLE_GEOCODE_API_KEY } from '../config/keys';
import polylineDecoder from 'decode-google-map-polyline';

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

function calcRoute(origin, destination) {
    getGoogleMapsClient().directions({
        origin: origin,
        destination: destination,
        mode: 'driving',
    });
}

function decodePolyline(polyline) {
    return polylineDecoder(polyline);
}

export default {
    codeAddress: codeAddress,
    calcRoute: calcRoute,
    decodePolyline: decodePolyline
};
