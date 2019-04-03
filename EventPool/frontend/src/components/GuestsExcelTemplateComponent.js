/**
 * Created by Zohar on 02/04/2019.
 */
import React from "react";
import ReactExport from "react-export-excel";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const dataSet1 = [
    {
        name: "Example",
        phoneNumber: "0521234567"
    }
];

class GuestsExcelTemplateComponent extends React.Component {
    render() {
        return (
            <ExcelFile element={<button>Download</button>} filename="Guests">
                <ExcelSheet data={dataSet1} name="Guests">
                    <ExcelColumn label="Name" value="name"/>
                    <ExcelColumn label="Phone Number" value="phoneNumber"/>
                </ExcelSheet>
            </ExcelFile>
        );
    }
}

export default GuestsExcelTemplateComponent;
