/**
 * Created by Zohar on 06/11/2018.
 */
import { eventsRef } from '../config/firebase';
import { FETCH_EVENTS } from './types';

export const fetchEvents = () => async dispatch => {
    eventsRef.on("value", snapshot => {
        debugger;
        dispatch({
            type: FETCH_EVENTS,
            payload: snapshot.val()
        });
    });
};
