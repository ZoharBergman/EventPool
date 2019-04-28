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
import './CreateEventForm.css'
import Grid from '@material-ui/core/Grid';
import Popup from 'reactjs-popup';

import 'react-widgets/dist/css/react-widgets.css'

momentLocalizer(moment)

const renderDateTimePicker = ({input: { onChange, value }, label, showTime, placeholder, meta: { touched, error, warning, dirty }}) => {
    return (
        <div>
            <DateTimePicker
                onChange={onChange}
                format="DD MMM YYYY HH:mm"
                time={showTime}
                value={!value ? null : new Date(value)}
                placeholder={placeholder}
            />
            {dirty && ((error && <span>{error}</span>) || (warning && <span>{warning}</span>))}
        </div>
    );
};

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
    let { handleSubmit, valid } = props;
    const btnDisabledClass = "event-pool-btn " + (!valid ? 'disabled' : '');
    return (
        <form className="form" onSubmit={handleSubmit}>
            <div className="container new-event-container">
                <h2>Create new event</h2>
                <Grid className="fields-container" container spacing={24} justify="center">
                    <Grid item xs={12} sm={6}>
                        <Field className="input" name="name" component={renderField} type="text" label="Event name" />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Field name="date"
                               showTime={true}
                               component={renderDateTimePicker}
                               placeholder="Event date"/>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Field name="addressName" component={PlaceField}/>
                    </Grid>

                    <Grid item xs={12} sm={6} className="radius-field-container">
                        <Field className="input" name="maxRadiusInKm" component={renderField} type="Number" label="Max deviation radius in KM"/>
                        <Popup
                            trigger={<button className="radius-info-btn">i</button>}
                            position='bottom right'
                            on={['click', 'hover']}
                            closeOnDocumentClick
                            mouseEnterDelay={0}
                            contentStyle={{ padding: '10px', border: '1px solid var(--gray)' }}
                            arrow={true}
                        >
                            Deviation radius is the maximum air distance that the drivers are allowed to deviate from their original path.
                        </Popup>
                    </Grid>

                    <Grid item className="submit-container">
                        <button className={btnDisabledClass} disabled={!valid}>Create</button>
                    </Grid>
                </Grid>
            </div>
        </form>
    );
};

CreateEventForm = reduxForm({
    form: 'createEvent',
    validate
})(CreateEventForm);

export default CreateEventForm;
