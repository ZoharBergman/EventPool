/**
 * Created by Zohar on 05/12/2018.
 */
import React, { Component } from 'react';
import { eventsRef } from '../../config/firebase';
import AddGuestForm from '../../forms/AddGuestForm';
import { Link } from 'react-router-dom';
import Popup from 'reactjs-popup';

import event from '../../classes/event';
import EventPoolService from '../../services/EventPoolService';
import CarpoolGroupComponent from '../../components/CarpoolGroupComponent';
import NewDeviationRadiusForm from '../../forms/NewDeviationRadiusForm';
import Messaging from '../../util/Messaging';
import message from '../../classes/message';
import Loader from '../../components/Loader';

import TextField from "@material-ui/core/es/TextField/TextField";
import Grid from '@material-ui/core/Grid';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import MaterialTable from 'material-table';

import Formatters from '../../util/Formatters';
import {OutTable, ExcelRenderer} from 'react-excel-renderer';
import GuestsExcelTemplateComponent from '../../components/GuestsExcelTemplateComponent';

import './Style.css'


class EventPage extends Component {
    constructor(props) {
        super(props);

        this.loader = React.createRef();

        this.state = {
            eventId: props.match.params.id,
            event: {
                name: "",
                notApprovedGuests: {},
                approvedGuests: {},
                carpoolGroups: {},
                id:""
            },
            isCarpoolGroupsConfirmed: false,
            isCalcCarpoolGroupsAgain: false,
            open: false,
            oldCarpoolGroups: {},
            oldRadius: ""
        };

        this.handleAddGuest = this.handleAddGuest.bind(this);
        this.handleCalcCarpoolGroups = this.handleCalcCarpoolGroups.bind(this);
        this.saveCarpoolGroups = this.saveCarpoolGroups.bind(this);
        this.calcCarpoolGroupsAgain = this.calcCarpoolGroupsAgain.bind(this);
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.cancelNewCarpoolGroups = this.cancelNewCarpoolGroups.bind(this);
        this.calcPickupOrders = this.calcPickupOrders.bind(this);
        this.sendMessagesAfterCarpoolGroupsSaved = this.sendMessagesAfterCarpoolGroupsSaved.bind(this);
        this.handleImportGuestsExcelFile = this.handleImportGuestsExcelFile.bind(this);
    }

    componentWillMount() {
        eventsRef.child(this.state.eventId).once('value').then((snapshot) => {
            if (snapshot.exists()) {
                const val = snapshot.val();

                this.setState({
                    event: new event(val),
                    isCarpoolGroupsConfirmed: val.hasOwnProperty("carpoolGroups") && Object.keys(val.carpoolGroups).length > 0
                }, this.loader.current.closeLoader);
            } else {
                this.loader.current.closeLoader();
            }
        });
    }

    componentDidMount() {
        // Checking if the event data from the DB have not loaded yet
        if (this.state.event.id === "") {
            this.loader.current.openLoader();
        }
    }

    handleAddGuest(newGuest) {
        this.loader.current.openLoader();

        // Saving the new guest in the DB
        const newGuestId = eventsRef.child(this.state.eventId + '/notApprovedGuests').push().key;
        newGuest["id"] = newGuestId;
        eventsRef.child(this.state.eventId + '/notApprovedGuests/' + newGuestId).update(newGuest);

        // Send message to the new guest
        Messaging.sendMessage(this.state.eventId,
            new message(`You have been invited to the event '${this.state.event.name}'. 
            Please fill your details in the following link: /event/${this.state.eventId}/newGuest/${newGuestId}`,
                newGuest.phoneNumber));

        // Updating the state
        let event = this.state.event;
        if (!event.notApprovedGuests) {
            event.notApprovedGuests = {};
        }

        event.notApprovedGuests[newGuestId] = newGuest;
        this.setState({event: event}, this.loader.current.closeLoader);
    }

    buildGuestsList(guests, guestsType) {
        return Object.keys(guests).map((guestId) => {
            return (
                <li key={guestId}>
                    <Link to={`/event/${this.state.eventId}/${guestsType}/${guestId}`}>{guests[guestId].name}</Link>
                </li>
            );
        });
    }

    buildCarpoolGroupsList(carpoolGroups) {
        return Object.values(carpoolGroups).map(carpoolGroup => {
           return (
               <li key={carpoolGroup.driver.id}>
                   <CarpoolGroupComponent eventId={this.state.eventId} driver={carpoolGroup.driver} passengers={Object.values(carpoolGroup.passengers)}/>
               </li>
           );
        });
    }

    handleCalcCarpoolGroups() {
        this.loader.current.openLoader();
        EventPoolService.calcCarpoolMatching(this.state.eventId, this.state.event.maxRadiusInKm)
            .then(response => response.json())
            .then(data => {
                const carpoolGroups = Object.values(data).map(carpoolGroup => {
                    const groupDetails = {
                        id: carpoolGroup.driverId,
                        driver: {
                            id: carpoolGroup.driverId,
                            name: this.state.event.approvedGuests[carpoolGroup.driverId].name,
                            phoneNumber: this.state.event.approvedGuests[carpoolGroup.driverId].phoneNumber,
                            startAddress: this.state.event.approvedGuests[carpoolGroup.driverId].startAddress
                        },
                        passengers: {}
                    };

                    carpoolGroup.setPassengers.forEach(passenger => {
                        passenger.name = this.state.event.approvedGuests[passenger.id].name;
                        passenger.phoneNumber = this.state.event.approvedGuests[passenger.id].phoneNumber;
                        groupDetails.passengers[passenger.id] = passenger;
                    });

                    groupDetails.eventName = this.state.event.name;

                    return groupDetails;
                });

                this.setState((prevState) => ({
                    event: {
                        ...prevState.event,
                        carpoolGroups: carpoolGroups
                    }
                }), this.loader.current.closeLoader);
            });
    }

    saveCarpoolGroups() {
        this.setState({isCarpoolGroupsConfirmed: true});
        const groupObjects = {};
        this.state.event.carpoolGroups.forEach(carpoolGroup => {
           groupObjects[carpoolGroup.driver.id] = carpoolGroup;
        });

        eventsRef.child(this.state.eventId + '/carpoolGroups').set(groupObjects);

        this.sendMessagesAfterCarpoolGroupsSaved();

        if (this.state.isCalcCarpoolGroupsAgain) {
            eventsRef.child(this.state.eventId).update({maxRadiusInKm: this.state.event.maxRadiusInKm});
            this.setState({
                isCalcCarpoolGroupsAgain: false,
                oldCarpoolGroups: {}
            });
        }
    }

    sendMessagesAfterCarpoolGroupsSaved() {
        let messages = [];
        let setMatchedPassengersIds = new Set();

        this.state.event.carpoolGroups.forEach(carpoolGroup => {
            const messageText = `You were matched to a carpool group for the event '${this.state.event.name}'. Watch your carpool group's details in the following link: /event/${this.state.eventId}/carpoolGroup/${carpoolGroup.driver.id}`;

            messages.push(new message(messageText, carpoolGroup.driver.phoneNumber));
            setMatchedPassengersIds.add(carpoolGroup.driver.id);

            Object.values(carpoolGroup.passengers).forEach(passenger => {
                messages.push(new message(messageText, passenger.phoneNumber));
                setMatchedPassengersIds.add(passenger.id);
            });
        });

        Object.values(this.state.event.approvedGuests).forEach(approvedGuest => {
            if (approvedGuest.id && approvedGuest.isComing && !setMatchedPassengersIds.has(approvedGuest.id)) {
                messages.push(new message(`you were not matched to a carpool group for the event '${this.state.event.name}'.`,
                approvedGuest.phoneNumber));
            }
        });

        Messaging.sendMessages(this.state.eventId, messages);
    }

    calcCarpoolGroupsAgain(data) {
        this.closeModal();

        if (Object.keys(this.state.oldCarpoolGroups).length === 0) {
            this.setState({
                oldCarpoolGroups: this.state.event.carpoolGroups,
                oldRadius: this.state.event.maxRadiusInKm
            });
        }

        // Update the new radius and then calculate the carpool groups
        this.setState((prevState) => ({
            event: {
                ...prevState.event,
                maxRadiusInKm: data.maxRadiusInKm
            },
            isCalcCarpoolGroupsAgain: true,
            isCarpoolGroupsConfirmed: false,
        }), this.handleCalcCarpoolGroups);
    }

    cancelNewCarpoolGroups() {
        this.setState((prevState) => ({
           event: {
               ...prevState.event,
               carpoolGroups: prevState.oldCarpoolGroups,
               maxRadiusInKm: prevState.oldRadius
           },
            isCalcCarpoolGroupsAgain: false,
            isCarpoolGroupsConfirmed: true,
            oldCarpoolGroups: {},
            oldRadius: ""
        }));
    }

    calcPickupOrders() {
        this.loader.current.openLoader();
        EventPoolService.calcAndSavePickupOrders(this.state.eventId).then(() => {
            this.loader.current.closeLoader();
        });
    }

    handleImportGuestsExcelFile(event) {
        this.loader.current.openLoader();
        let fileObj = event.target.files[0];
        //just pass the fileObj as parameter
        ExcelRenderer(fileObj, (err, resp) => {
            if(err){
                console.log(err);
            } else {
                if (resp.rows.length > 0) {
                    const nameIndex = resp.rows[0].indexOf("Name");
                    const phoneNumberIndex = resp.rows[0].indexOf("Phone Number");

                    if (nameIndex >= 0 && phoneNumberIndex >= 0) {
                        let newGuestsFromExcel = {};

                        resp.rows.slice(1).forEach(guestData => {
                            if (guestData.length >= Math.max(nameIndex, phoneNumberIndex) + 1) {
                                if (guestData[nameIndex].toLocaleLowerCase() !== "example") {
                                    let phoneNumber = guestData[phoneNumberIndex].replace(/[()-]+/g, "");

                                    if (phoneNumber[0] === "0" && !isNaN(phoneNumber) && phoneNumber.length === 10) {
                                        const guestId = eventsRef.child(this.state.eventId + '/notApprovedGuests').push().key;
                                        newGuestsFromExcel[guestId] = {
                                            id: guestId,
                                            name: guestData[nameIndex],
                                            phoneNumber: phoneNumber
                                        }
                                    }
                                }
                            }
                        });

                        // Save the new guests in the DB
                        eventsRef.child(this.state.eventId + '/notApprovedGuests/').update(newGuestsFromExcel);

                        this.setState((prevState) => ({
                            event: {
                                ...prevState.event,
                                notApprovedGuests: {
                                    ...prevState.event.notApprovedGuests,
                                    ...newGuestsFromExcel
                                }
                            }
                        }));
                    }
                }
            }

            this.loader.current.closeLoader();
        });
    }

    openModal() {
        this.setState({ open: true })
    }

    closeModal() {
        this.setState({ open: false })
    }

    render() {
        let eventDetails;
        let approvedGuests;
        let notApprovedGuests;
        let carpoolGroups;

        if (Object.keys(this.state.event.notApprovedGuests).length > 0) {
            notApprovedGuests = this.buildGuestsList(this.state.event.notApprovedGuests, 'newGuest');
        } else {
            notApprovedGuests = "No Not Approved guests.";
        }

        if (Object.keys(this.state.event.approvedGuests).length > 0) {
            approvedGuests = this.buildGuestsList(this.state.event.approvedGuests, 'guest');
        } else {
            approvedGuests = "No Approved guests.";
        }

        if (Object.keys(this.state.event.carpoolGroups).length > 0) {
            carpoolGroups = this.buildCarpoolGroupsList(this.state.event.carpoolGroups);
        }

        if (this.state.event.hasOwnProperty("id") && this.state.event.id !== "") {
            eventDetails = (
                <Grid container spacing={24}>
                    <Grid item sm={4} xs={12}>
                        <TextField type="text" label="Date:" value={Formatters.dateFormatter(this.state.event.date)}/>
                    </Grid>
                    <Grid item sm={4} xs={12}>
                        <TextField type="text" label="Location:" value={this.state.event.address.name}/>
                    </Grid>
                    <Grid item xs={4}>
                        <TextField type="text" label="Max deviation radius in KM:"
                                   value={this.state.event.maxRadiusInKm}/>
                    </Grid>
                </Grid>
            );
        }

        return (
            <div>
                <Loader ref={this.loader}/>
                <div className="container">
                    <h1 style={{"textAlign": "center"}}>{this.state.event.name}</h1>
                    {eventDetails}
                </div>
                <AppBar position="relative" style={{"width": "fit-content", "margin": "auto"}}>
                    <Tabs onChange={this.handleChange}>
                        <Tab value="one" label="Manage guests" centered/>
                        <Tab value="two" label="Manage carpool groups" centered/>
                    </Tabs>
                </AppBar>
                <div>
                    <h2>Guests</h2>
                    <AddGuestForm onSubmit={this.handleAddGuest}/>
                    <div>
                        Download guests' template sheet
                        <GuestsExcelTemplateComponent/>
                        <br/>
                        Import guests' excel file
                        <input type="file" onChange={this.handleImportGuestsExcelFile} style={{"padding":"10px"}}/>
                    </div>

                    <div>
                        <span style={{textDecoration: 'underline'}}>Not approved guests</span>
                        <div>{notApprovedGuests}</div>
                        <span style={{textDecoration: 'underline'}}>Approved guests</span>
                        <div>{approvedGuests}</div>
                    </div>
                </div>
                <div>
                    <h2>Carpool Groups</h2>
                    <button onClick={this.handleCalcCarpoolGroups} hidden={Object.keys(this.state.event.approvedGuests).length <= 0 || this.state.isCarpoolGroupsConfirmed || Object.keys(this.state.event.carpoolGroups).length > 0}>Calculate Carpool Groups</button>
                    <button onClick={this.saveCarpoolGroups} hidden={this.state.isCarpoolGroupsConfirmed || Object.keys(this.state.event.carpoolGroups).length <= 0}>Save Carpool Groups</button>
                    <button onClick={this.cancelNewCarpoolGroups} hidden={Object.keys(this.state.oldCarpoolGroups).length <= 0}>Cancel new groups calculation</button>
                    <button onClick={this.calcPickupOrders} hidden={!this.state.isCarpoolGroupsConfirmed}>Calculate pickup order of carpool groups</button>
                    <div>
                        <button onClick={this.openModal} hidden={Object.keys(this.state.event.carpoolGroups).length <= 0}>
                            Calculate Carpool Groups Again
                        </button>
                        <Popup open={this.state.open} onClose={this.closeModal} closeOnDocumentClick modal>
                            <NewDeviationRadiusForm maxRadiusInKm={this.state.event.maxRadiusInKm} onSubmit={this.calcCarpoolGroupsAgain}/>
                        </Popup>
                    </div>
                    {carpoolGroups}
                </div>
            </div>
        );
    }
}

export { EventPage };