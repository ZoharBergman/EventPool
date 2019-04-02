/**
 * Created by Zohar on 02/04/2019.
 */
import MaterialTable from 'material-table';
import React from 'react';

const GuestTableComponent = (props) => {
    const columns= [
        {
            title: "Name",
            field: "name",
            filtering: false
        }, {
        title: "Is coming",
            field: "isComing"
    }, {
        title: "Is driving",
            field: "isCar"
    }, {
        title: "Num of free seats",
            field: "name",
            filtering: false
    }, {
        title: "Phone number",
            field: "phoneNumber",
            filtering: false
    }];

    return (
        <MaterialTable
            columns={columns}
            title="Guests"
            options={{
                filtering: true
            }}
            data={}
        />
    );
};

export default GuestTableComponent;