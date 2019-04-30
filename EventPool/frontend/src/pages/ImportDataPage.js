/**
 * Created by Zohar on 29/04/2019.
 */
import React, { Component } from 'react';
import { eventsRef } from '../config/firebase';
import {ExcelRenderer} from 'react-excel-renderer';
import routesService from '../services/EventPoolService';
import Loader from '../components/Loader';
import geocoding from '../util/Geocoding';
import './ImportDataPage.css';

class ImportDataPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            eventId: ""
        };

        this.loader = React.createRef();

        this.handleImportGuestsExcelFile = this.handleImportGuestsExcelFile.bind(this);
        this.saveToDb = this.saveToDb.bind(this);
        this.handleEventIdChange = this.handleEventIdChange.bind(this);
        this.geoCodeAddress = this.geoCodeAddress.bind(this);
    }

    saveToDb(newGuest) {
        eventsRef.child(this.state.eventId).child('guests').child(newGuest.id).update(newGuest);
    }

    handleEventIdChange(event) {
        this.setState({eventId: event.target.value});
    }

    geoCodeAddress(guest, address) {
       geocoding.codeAddress(address,
           (err, geocodeResponse) => {
               if (err || geocodeResponse.json.results.length === 0) {
                   console.log(guest.name + " error geocoding: " + err);
               } else {
                   guest.startAddress = {
                       name: geocodeResponse.json.results[0].formatted_address,
                       location: geocodeResponse.json.results[0].geometry.location
                   };

                   if (!guest.isCar) {
                       // The guest is a passenger
                       this.saveToDb(guest);
                   } else {
                       // The guest is a driver
                       // Calculate and save the route of the driver
                       routesService.calcAndSaveRoute(
                           `${guest.startAddress.location.lat},${guest.startAddress.location.lng}`,
                           `${this.state.eventLocation.lat},${this.state.eventLocation.lng}`,
                           guest.id,
                           this.state.eventId,
                           guest.freeSeatsNum)
                           .then(() => {
                               this.saveToDb(guest);
                           })
                           .catch(() => {
                               console.log("Error while trying to calculate and save the route of guest: " + guest.name);
                           });
                   }
               }
           }
       );
    }

    handleImportGuestsExcelFile(e) {
        this.loader.current.openLoader();
        let fileObj = e.target.files[0];

        ExcelRenderer(fileObj, (err, resp) => {
            if(err){
                this.loader.current.closeLoader();
                alert(err);
            } else {
                if (resp.rows.length > 0) {
                    const nameIndex = resp.rows[0].indexOf("Name");
                    const phoneNumberIndex = resp.rows[0].indexOf("Phone");
                    const addressIndex = resp.rows[0].indexOf("Address");
                    let counter = 0;

                    if (nameIndex >= 0 && phoneNumberIndex >= 0 && addressIndex >= 0) {
                        let newGuestsFromExcel = {};

                        // Getting the address of the event
                        eventsRef.child(this.state.eventId).child('address').child('location').once('value')
                            .then((eventLocationSnapshot) => {
                                if (eventLocationSnapshot.exists()) {
                                    this.setState({eventLocation: eventLocationSnapshot.val()});

                                    // Going over the imported guests
                                    resp.rows.slice(1).forEach(guestData => {
                                        if (guestData.length >= Math.max(nameIndex, phoneNumberIndex) + 1) {
                                            if (guestData[nameIndex].toLocaleLowerCase() !== "example") {
                                                let phoneNumber = guestData[phoneNumberIndex].replace(/[()-]+/g, "");

                                                if (phoneNumber[0] === "0" && !isNaN(phoneNumber) && phoneNumber.length === 10) {
                                                    const guestId = eventsRef.child(this.state.eventId + '/guests').push().key;
                                                    const isComing = (counter % 10 !== 0);
                                                    const isCar = (counter % 3 === 0);
                                                    const freeSeatsNum = Math.floor(Math.random() * 5); // Free seats between 0 to 4

                                                    newGuestsFromExcel[guestId] = {
                                                        id: guestId,
                                                        name: guestData[nameIndex],
                                                        phoneNumber: phoneNumber,
                                                        isComing: isComing
                                                    };

                                                    if (!isComing) {
                                                        this.saveToDb(newGuestsFromExcel[guestId]);
                                                    } else {
                                                        newGuestsFromExcel[guestId].isCar = isCar;

                                                        if (isCar) {
                                                            newGuestsFromExcel[guestId].freeSeatsNum = freeSeatsNum;
                                                        }

                                                        if (isCar && freeSeatsNum === 0) {
                                                            this.saveToDb(newGuestsFromExcel[guestId]);
                                                        } else {
                                                            // Geocoding the start location of the guest
                                                            this.geoCodeAddress(newGuestsFromExcel[guestId], guestData[addressIndex]);

                                                        }
                                                    }
                                                }
                                            }
                                        }

                                        counter++;
                                    });
                                }
                        });
                    }
                }
            }

            this.loader.current.closeLoader();
        });
    }

    render() {
        return (
          <div className="import-data-container">
              <Loader ref={this.loader}/>
              <h2>Import data page</h2>
              <div className="import-data-content">
                  <input className="import-data-field" type="text" placeholder="Event id"
                         value={this.state.eventId} onChange={this.handleEventIdChange}/>
                  <div className="import-data-field">
                      <label>Guests' excel</label>
                      <input type="file" onChange={this.handleImportGuestsExcelFile} />
                  </div>
              </div>
          </div>
        );
    }
}

export default ImportDataPage;
