/**
 * Created by Zohar on 02/04/2019.
 */
import MaterialTable from 'material-table';
import React from 'react';

const GuestsTableComponent = (props) => {
    const columns= [
        {
            title: "Name",
            field: "name",
            filtering: false,
            cellStyle: data => {
                return {
                    textAlign: 'center'
                }
            }
        },
        {
            title: "Is coming",
            field: "isComing",
            emptyValue: "Pending",
            type: 'boolean',
            cellStyle: data => {
                let color = 'black';

                if (data === true) {
                    color = 'green';
                } else if (data === false) {
                    color = 'red';
                }

                return {
                    color: color,
                    textAlign: 'center'
                }
            }
        },
        {
            title: "Is driving",
            field: "isCar",
            emptyValue: "",
            type: 'boolean',
            cellStyle: data => {
                return {
                    textAlign: 'center'
                }
            }
        },
        {
            title: "Num of free seats",
            field: "freeSeatsNum",
            filtering: false,
            emptyValue: "",
            type: 'numeric',
            cellStyle: data => {
                return {
                    textAlign: 'center'
                }
            }
        },
        {
            title: "Phone number",
            field: "phoneNumber",
            filtering: false,
            cellStyle: data => {
                return {
                    textAlign: 'center'
                }
            }
        }
    ];

    const data = props.guests;

    return (
        <MaterialTable
            columns={columns}
            title=""
            options={{
                filtering: true,
                headerStyle: {"textAlign": "center"},
                pageSizeOptions: [25, 50, 100],
                pageSize: 25,
                // paginationType: 'stepped'
            }}
            data={data}
            onRowClick={props.onGuestClicked}
        />
    );
};

export default GuestsTableComponent;