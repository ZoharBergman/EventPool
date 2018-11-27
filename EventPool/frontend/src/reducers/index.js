/**
 * Created by Zohar on 06/11/2018.
 */
import { combineReducers  } from "redux";
import data from './dataReducer';
import { reducer as form } from 'redux-form';

export default combineReducers({
    data,
    form
});
