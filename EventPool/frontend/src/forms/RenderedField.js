/**
 * Created by Zohar on 05/12/2018.
 */
import React from "react";

const renderField = ({ input, label, type, meta: { touched, error, warning } }) => (
    <div className="control">
            <input className="form-control" {...input} placeholder={label} type={type}/>
            {touched && ((error && <span>{error}</span>) || (warning && <span>{warning}</span>))}
    </div>
);

export default renderField;