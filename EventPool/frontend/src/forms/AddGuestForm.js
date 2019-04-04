/**
 * Created by Zohar on 05/12/2018.
 */
import React from "react";
import { reduxForm, Field } from 'redux-form';
import renderField from './RenderedField';
import Grid from '@material-ui/core/Grid';

const validate = val => {
    const errors = {};
    if (!val.name || val.name.trim().length === 0) {
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
    <form className="form" onSubmit={handleSubmit} >
        <Grid container spacing={24}>
            <Grid item>
                <Field name="name" component={renderField} type="text" label="Full name" />
            </Grid>

            <Grid item>
                <Field name="phoneNumber" component={renderField} type="Number" label="Phone number" />
            </Grid>

            <Grid item>
                <button disabled={!valid}>Add</button>
            </Grid>
        </Grid>
    </form>
    );
};

AddGuestForm = reduxForm({
    form: 'addGuest',
    validate
})(AddGuestForm);

export default AddGuestForm;