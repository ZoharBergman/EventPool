/**
 * Created by Zohar on 27/12/2018.
 */
class RequestsService {
    static getServerUrl() {
        return 'http://localhost:8080/';
    }

    static request(url) {
        return fetch(this.getServerUrl() + url);
    }
}

export default RequestsService;