/**
 * Created by Zohar on 11/12/2018.
 */
class event {
    constructor(event) {
        this.name = event.name;
        this.address = event.address;
        this.date = event.date;
        this.organizersIds = event.organizersIds;
        this.notApprovedGuests = event.notApprovedGuests ? event.notApprovedGuests : {};
        this.approvedGuests = event.approvedGuests ? event.approvedGuests : {};
    }

    static collectionName () {
        return 'events';
    };
}

export default event;