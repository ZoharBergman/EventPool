/**
 * Created by Zohar on 25/02/2019.
 */
import React from "react";
import { reduxForm, Field } from 'redux-form';
import { connect } from 'react-redux';

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
        <div>
            <form className="form" onSubmit={handleSubmit}>
                <div className="field">
                    <label>Enter max deviation radius in KM:</label>
                    <Field className="input" name="maxRadiusInKm" id="maxRadiusInKm" component="input" type="number"/>
                </div>

                <div className="field">
                    <button disabled={!valid}>Calculate Carpool Groups Again</button>
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