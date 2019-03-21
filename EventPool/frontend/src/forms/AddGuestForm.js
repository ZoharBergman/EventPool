/**
 * Created by Zohar on 05/12/2018.
 */
import React from "react";
import { reduxForm, Field } from 'redux-form';
import renderField from './RenderedField';

const validate = val => {
    const errors = {};
    if (!val.name) {
        errors.name= 'Required';
    }

    if (!val.phoneNumber) {
        errors.phoneNumber = 'Required';
    } else {
        const phoneNumber = val.phoneNumber.toString();
        if (phoneNumber.length != 10 || phoneNumber[0] != '0') {
            errors.phoneNumber = 'Invalid phone number';
        }
    }

    return errors;
};

let AddGuestForm = (props) => {
    let { handleSubmit, valid  } = props;

    return (
    <div>
        <label style={{textDecoration: 'underline'}}>Add new guest</label>
        <br />
        <form className="form" onSubmit={handleSubmit} >{/*style={{display: 'inline-flex'}}*/}
            <div className="field">
                <Field className="input" name="name" component={renderField} type="text" label="Full name" />
            </div>

            <div className="field">
                <Field className="input" name="phoneNumber" component={renderField} type="Number" label="Phone number" />
            </div>

            <div className="field">
                <button disabled={!valid}>Add</button>
            </div>
        </form>
    </div>
    );
};

AddGuestForm = reduxForm({
    form: 'addGuest',
    validate
})(AddGuestForm);

export default AddGuestForm;