/**
 * Created by Zohar on 25/02/2019.
 */
import React from "react";
import { reduxForm, Field } from 'redux-form';
import { connect } from 'react-redux';
import './NewDeviationRadiusForm.css';

function mapStateToProps(state, ownProps) {
    return {
        initialValues: {
            maxRadiusInKm: Number(ownProps.maxRadiusInKm)
        }
    };
}

const validate = val => {
    const errors = {};

    if (!val.maxRadiusInKm) {
        errors.maxRadiusInKm = 'Required';
    } else {
        if (val.maxRadiusInKm <= 0) {
            errors.maxRadiusInKm = 'Must be higher than 0';
        }
    }

    return errors;
};

let NewDeviationRadiusForm = (props) => {
    let { handleSubmit, valid  } = props;

    return (
        <div className="new-radius-popup-container">
            <h1>Deviation radius</h1>
            <div>Deviation radius is the maximum air distance that the drivers are allowed to deviate from their original path.</div>
            <form className="form" onSubmit={handleSubmit}>
                <div className="field new-radius-form-field">
                    <label>Max deviation radius in KM:</label>
                    <Field className="form-control" name="maxRadiusInKm" id="maxRadiusInKm" component="input" type="number"/>
                </div>
                <div className="field">
                    <button className="new-radius-form-btn" disabled={!valid}>Calculate Carpool Groups</button>
                </div>
            </form>
        </div>
    );
};

NewDeviationRadiusForm = reduxForm({
    form: 'NewDeviationRadius',
    validate
})(NewDeviationRadiusForm);

NewDeviationRadiusForm = connect(
    mapStateToProps
)(NewDeviationRadiusForm);

export default NewDeviationRadiusForm;