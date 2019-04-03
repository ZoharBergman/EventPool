/**
 * Created by Zohar on 05/12/2018.
 */
import React from "react";
import TextField from "@material-ui/core/es/TextField/TextField";

const renderField = ({input, label, meta: { touched, error }, ...custom}) => (
    <TextField
        variant="outlined"
        label={label}
        floatinglabeltext={label}
        errortext={touched && error ? error : ""}
        {...input}
        {...custom}
    />
);

export default renderField;