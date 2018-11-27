/**
 * Created by Zohar on 20/11/2018.
 */
import { eventsRef } from '../config/firebase';
import geocoding from '../util/Geocoding';

const handleCreateEvent = newEvent => {
    const afterGeocode = function(err, response) {
        if (!err) {
            // Setting the fields of the new event
            newEvent.address = {
                name: response.json.results[0].formatted_address,
                location: response.json.results[0].geometry.location,
            };
            newEvent.date = newEvent.date.getTime();

            // Saving the new event to the DB
            eventsRef.push().set(newEvent);
        }
    };

    geocoding.codeAddress(newEvent.address, afterGeocode);
};

export default {
    handleCreateEvent: handleCreateEvent
};