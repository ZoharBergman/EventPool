/**
 * Created by Zohar on 28/03/2019.
 */
import { messagesRef } from '../config/firebase';

const sendMessage = function (eventId, message) {
    messagesRef.child(eventId).push(message);
};

const sendMessages = function (eventId, messages) {
    let messagesObject = {};
    messages.forEach(message => {
        messagesObject[messagesRef.child(eventId).push().key] = message;
    });

    messagesRef.child(eventId).update(messagesObject);
};

export default {
    sendMessage: sendMessage,
    sendMessages: sendMessages
};
