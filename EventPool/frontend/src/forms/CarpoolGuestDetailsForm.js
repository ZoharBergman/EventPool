/**
 * Created by Zohar on 11/12/2018.
 */
import React from "react";
import { reduxForm, Field, formValueSelector } from 'redux-form';
import { connect } from 'react-redux';
import PlaceField from './PlaceField';
import Formatters from '../util/Formatters';
import './CarpoolGuestDetailsForm.css';

const validate = (val)=> {
    const errors = {};

    if (val.isComing) {
        if (!val.startAddress) {
            errors.startAddress = 'Required';
        }
    } else {
        errors.isComing = 'Required';
    }

    if (val.isCar) {
        if (!val.freeSeatsNum) {
            errors.freeSeatsNum = 'Required';
        } else if (val.freeSeatsNum < 0) {
            errors.phoneNumber = 'Must be higher than 0';
        }
    } else {
        errors.isCar = 'Required';
    }

    return errors;
};

let CarpoolGuestDetailsForm = (props) => {
    let { handleSubmit, valid, isComingValue, isCarValue, event } = props;
    const btnDisabledClass = "event-pool-btn " + (!valid ? 'disabled' : '');

    return (
        <div className="guest-carpool-details-container">
            <h2 className="title">Hi {props.guest.name}!</h2>
            <h5 className="invite-text">
                You were invited to the event '{event.name}' on {Formatters.dateFormatter(event.date)}.
            </h5>
            <form className="form" onSubmit={handleSubmit}>
                 <div className="guest-carpool-detail-field-container">
                     <label>Are you coming?</label>
                     <Field name="isComing" id="isComing" component="select" input={{ disabled: props.isDisabled}}>
                        <option></option>
                        <option value={true}>Yes</option>
                        <option value={false}>No</option>
                     </Field>
                </div>

                {isComingValue === "true" &&
                <div>
                    <div className="field guest-carpool-detail-field-container">
                        <label>Start address</label>
                        <Field name="startAddress" component={PlaceField}/>
                    </div>

                    <div className="field guest-carpool-detail-field-container">
                        <label>Are you coming with car?</label>
                        <Field name="isCar" id="isCar" component="select"
                               input={{disabled: props.isDisabled}}>
                            <option></option>
                            <option value={true}>Yes</option>
                            <option value={false}>No</option>
                        </Field>
                    </div>

                    {isCarValue === "true" &&
                        <div>
                            <div className="guest-carpool-detail-field-container">
                                <label>Number of free seats in your car</label>
                                <Field className="input" name="freeSeatsNum" component="input" type="Number"
                                       input={{disabled: props.isDisabled}}/>
                            </div>


                        </div>
                    }
                </div>}

                <div className="field guest-carpool-detail-submit-container">
                    <button type="submit" disabled={!valid} className={btnDisabledClass}>Submit</button>
                </div>
            </form>
        </div>
    );
};

CarpoolGuestDetailsForm = reduxForm({
    form: 'carpoolGuestDetails',
    validate
})(CarpoolGuestDetailsForm);

const selector = formValueSelector('carpoolGuestDetails');

CarpoolGuestDetailsForm = connect(
    state => {
        const isComingValue = selector(state, 'isComing');
        const isCarValue = selector(state, 'isCar');

        return {
            isComingValue,
            isCarValue
        };
    }
)(CarpoolGuestDetailsForm);

export default CarpoolGuestDetailsForm;
