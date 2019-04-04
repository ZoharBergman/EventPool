/**
 * Created by Zohar on 13/11/2018.
 */
import React from "react";
import { reduxForm, Field } from 'redux-form';
import DateTimePicker from 'react-widgets/lib/DateTimePicker'
import moment from "moment";
import momentLocalizer from 'react-widgets-moment';
import renderField from './RenderedField';
import PlaceField from './PlaceField';

import 'react-widgets/dist/css/react-widgets.css'

momentLocalizer(moment)

const renderDateTimePicker = ({ input: { onChange, value }, label, showTime, placeholder, meta: { touched, error, warning } }) => (
    <div>
        <div className="control">
            <label className="field">{label}</label>
            <DateTimePicker
                onChange={onChange}
                format="DD MMM YYYY HH:mm"
                time={showTime}
                value={!value ? null : new Date(value)}
                placeholder={placeholder}
            />
            {((error && <span>{error}</span>) || (warning && <span>{warning}</span>))}
        </div>
    </div>
);

const validate = val => {
    const errors = {};
     if (!val.name || val.name.trim().length === 0) {
         errors.name = 'Required';
     }

     if (!val.date) {
         errors.date = 'Required';
     } else {
         if (val.date <= new Date()) {
             errors.date = 'The date must be in the future';
         }
     }

     if (!val.addressName || val.addressName.trim().length === 0) {
         errors.addressName = 'Required';
     }

     if (!val.maxRadiusInKm) {
         errors.maxRadiusInKm = 'Required';
     } else {
         if (val.maxRadiusInKm <= 0) {
             errors.maxRadiusInKm = 'Must be higher than 0';
         }
     }

     return errors;
};

let CreateEventForm = props => {
    let { handleSubmit, valid  } = props;

    return (
        <form className="form" onSubmit={handleSubmit}>
            <div className="field">
                <Field className="input" name="name" component={renderField} type="text" label="Event Name" />
            </div>

            <div className="field">
                <Field name="date"
                       showTime={true}
                       component={renderDateTimePicker}
                       placeholder="Event date"/>
            </div>

            <div className="field">
                <Field name="addressName" component={PlaceField}/>
            </div>

            <div className="field">
                <Field className="input" name="maxRadiusInKm" component={renderField} type="Number" label="Max deviation radius in KM"/>
            </div>

            <div className="field">
                <button variant="contained" disabled={!valid}>Create event</button>
            </div>
        </form>
    );
};

CreateEventForm = reduxForm({
    form: 'createEvent',
    validate
})(CreateEventForm);

export default CreateEventForm;
