/**
 * Created by Zohar on 05/12/2018.
 */
import React from "react";
import TextField from "@material-ui/core/es/TextField/TextField";

// const renderField = ({input, label, meta: { touched, error }, ...custom}) => (
//     <TextField
//         variant="outlined"
//         label={label}
//         floatinglabeltext={label}
//         errortext={touched && error ? error : ""}
//         {...input}
//         {...custom}
//     />
// );

const renderField = ({ input, label, type, meta: { touched, error, warning } }) => (
    <div>
        <div className="control">
            <input className="form-control" {...input} placeholder={label} type={type}/>
            {touched && ((error && <span>{error}</span>) || (warning && <span>{warning}</span>))}
        </div>
    </div>
);

export default renderField;