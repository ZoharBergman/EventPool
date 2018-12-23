/**
 * Created by Zohar on 06/11/2018.
 */
import { combineReducers  } from "redux";
import data from './dataReducer';
import newGuest from './newGuestReducer';
import { reducer as form } from 'redux-form';

export default combineReducers({
    data,
    newGuest,
    form
});
