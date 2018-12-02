/**
 * Created by Zohar on 02/12/2018.
 */
class userEvent {
    constructor(userId, asGuest, asOrganizer) {
        this.userId = userId;
        this.asGuest = asGuest;
        this.asOrganizer = asOrganizer;
    }

    static collectionName () {
        return 'userEvents';
    };
}

export default userEvent;
