/**
 * Created by Zohar on 27/12/2018.
 */
import RequestsService from './RequestsService';

class RoutesService {

    static calcAndSaveRoute(origin, destination, driverId, eventId, freeSeatsNum) {
        return RequestsService.request(`calcAndSaveRoute/${origin}/${destination}/${driverId}/${eventId}/${freeSeatsNum}`);
    }
}

export default RoutesService;