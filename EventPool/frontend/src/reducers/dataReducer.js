import { FETCH_EVENTS } from '../actions/types';

export default (state = {}, action) => {
    switch (action.types) {
        case FETCH_EVENTS:
            debugger;
            return action.payload;
        default:
            return state;
    }
}
