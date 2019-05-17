/**
 * Created by Zohar on 02/12/2018.
 */
class userEvent {
    constructor(userId) {
        this.userId = userId;
        this.asOrganizer = {};
    }

    static collectionName () {
        return 'userEvents';
    };
}

export default userEvent;
