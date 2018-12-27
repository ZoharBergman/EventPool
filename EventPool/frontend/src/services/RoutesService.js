/**
 * Created by Zohar on 27/12/2018.
 */
import RequestsService from './RequestsService';

class RoutesService {

    static calcRoute(origin, destination) {
        return RequestsService.request(`calcRoute/${origin}/${destination}`);
    }
}

export default RoutesService;