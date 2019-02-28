/**
 * Created by Zohar on 11/12/2018.
 */
import React from "react";
import { reduxForm, Field, formValueSelector } from 'redux-form';
import { connect } from 'react-redux';

const validate = (val)=> {
    const errors = {};

    if (val.isComing) {
        if (!val.startAddress) {
            errors.startAddress = 'Required';
        }
    }

    if (val.isCar) {
        if (!val.freeSeatsNum) {
            errors.freeSeatsNum = 'Required';
        } else if (val.freeSeatsNum < 0) {
            errors.phoneNumber = 'Must be higher than 0';
        }
    }

    return errors;
};

let CarpoolGuestDetailsForm = (props) => {
    let { handleSubmit, valid, isComingValue, isCarValue } = props;

    return (
        <div>
            <h2>{props.guest.fullName}</h2>
            <form className="form" onSubmit={handleSubmit}>
                 <div className="field">
                     <label>Is coming?</label>
                    <Field className="input" name="isComing" id="isComing" component="input" type="checkbox"
                           input={{ disabled: props.isDisabled}}/>
                </div>

                {isComingValue &&
                <div>
                    <div className="field">
                        <label>Start address</label>
                        <Field className="input" name="startAddress" component="input" type="text"
                               input={{ disabled: props.isDisabled}}/>
                    </div>

                    <div className="field">
                        <label>Is coming with car?</label>
                        <Field className="input" name="isCar" id="isCar" component="input" type="checkbox"
                               input={{disabled: props.isDisabled}}/>
                    </div>

                    {isCarValue &&
                        <div>
                            <div className="field">
                                <label>Number of free seats</label>
                                <Field className="input" name="freeSeatsNum" component="input" type="Number"
                                       input={{disabled: props.isDisabled}}/>
                            </div>


                        </div>
                    }
                </div>}

                <div className="field">
                    <button disabled={!valid}>Submit</button>
                </div>
            </form>
        </div>
    );
};

CarpoolGuestDetailsForm = reduxForm({
    form: 'carpoolGuestDetails',
    // validate
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
