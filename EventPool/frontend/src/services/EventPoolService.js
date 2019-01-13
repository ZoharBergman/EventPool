/**
 * Created by Zohar on 27/12/2018.
 */
import RequestsService from './RequestsService';

class EventPoolService {

    static calcAndSaveRoute(origin, destination, driverId, eventId, freeSeatsNum) {
        return RequestsService.request(`calcAndSaveRoute/${origin}/${destination}/${driverId}/${eventId}/${freeSeatsNum}`);
    }

    static calcCarpoolMatching(eventId, deviationRadius) {
        return RequestsService.request(`calcCarpoolMatching/${eventId}/${deviationRadius}`);
    }
}

export default EventPoolService;