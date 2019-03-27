/**
 * Created by Zohar on 11/12/2018.
 */
class event {
    constructor(event) {
        this.id = event.id;
        this.name = event.name;
        this.address = event.address;
        this.date = event.date;
        this.maxRadiusInKm = event.maxRadiusInKm;
        this.organizersIds = event.organizersIds;
        this.carpoolGroups = event.carpoolGroups ? event.carpoolGroups : {};
        this.notApprovedGuests = event.notApprovedGuests ? event.notApprovedGuests : {};
        this.approvedGuests = event.approvedGuests ? event.approvedGuests : {};
    }

    static collectionName () {
        return 'events';
    };
}

export default event;
