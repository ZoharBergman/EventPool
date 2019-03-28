/**
 * Created by Zohar on 28/03/2019.
 */
class message {
    constructor(message, phoneNumber) {
        this.message = message;
        this.phoneNumber = phoneNumber;
    }

    static collectionName () {
        return 'messages';
    };
}

export default message;
