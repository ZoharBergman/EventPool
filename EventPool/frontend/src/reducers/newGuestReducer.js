/**
 * Created by Zohar on 23/12/2018.
 */
import { NEW_GUEST } from '../actions/types';

export default (state = {}, action) => {
    switch (action.type) {
        case NEW_GUEST:
            debugger;
            return {
                data: action.data.newGuest
            };
        default:
            return state;
    }
}
