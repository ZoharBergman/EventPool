/**
 * Created by Zohar on 20/11/2018.
 */
import { createClient } from '@google/maps';
import googleApiKeys from '../config/keys';
import polylineDecoder from 'decode-google-map-polyline';

let googleMapsClient;

function initialize() {
    googleMapsClient = createClient({key: googleApiKeys.GOOGLE_GEOCODE_API_KEY});
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
    return getGoogleMapsClient().directions({
        origin: origin,
        destination: destination,
        mode: 'driving',
    });
    // const directionsService = new google.maps.DirectionsService();
    //
    // directionsService.route({
    //     origin: origin,
    //     destination: destination,
    //     travelMode: 'DRIVING'
    // }, function(response, status) {
    //     if (status === 'OK') {
    //         debugger;
    //         console.log(response)
    //     } else {
    //         window.alert('Directions request failed due to ' + status);
    //     }
    // });
}

function decodePolyline(polyline) {
    return polylineDecoder(polyline);
}

export default {
    codeAddress: codeAddress,
    calcRoute: calcRoute,
    decodePolyline: decodePolyline
};

