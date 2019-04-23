/**
 * Created by Zohar on 05/12/2018.
 */
import React, { Component } from 'react';
import { eventsRef } from '../../config/firebase';
import AddGuestForm from '../../forms/AddGuestForm';
import { Link } from 'react-router-dom';
import Popup from 'reactjs-popup';
import {ExcelRenderer} from 'react-excel-renderer';

import event from '../../classes/event';
import EventPoolService from '../../services/EventPoolService';
import CarpoolGroupComponent from '../../components/CarpoolGroupComponent';
import NewDeviationRadiusForm from '../../forms/NewDeviationRadiusForm';
import Messaging from '../../util/Messaging';
import message from '../../classes/message';
import Loader from '../../components/Loader';
import GuestsTableComponent from '../../components/GuestsTableComponent';
import TabContainer from '../../components/TabContainer';
import Formatters from '../../util/Formatters';
import GuestsExcelTemplateComponent from '../../components/GuestsExcelTemplateComponent';
import ErrorPopupComponent from '../../components/ErrorPopupComponent';

import TextField from "@material-ui/core/es/TextField/TextField";
import Grid from '@material-ui/core/Grid';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Button from '@material-ui/core/Button';

import './Style.css'


class EventPage extends Component {
    constructor(props) {
        super(props);

        this.loader = React.createRef();
        this.errorPopup = React.createRef();

        this.MANAGE_GUESTS = "Manage guests";
        this.MANAGE_CARPOOL_GROUPS = "Manage carpool groups";

        this.state = {
            eventId: props.match.params.id,
            event: {
                name: "",
                guests: {},
                carpoolGroups: {},
                id:""
            },
            isCarpoolGroupsConfirmed: false,
            isCalcCarpoolGroupsAgain: false,
            isOpenNewRadiusPopup: false,
            isOpenImportGuestsPopup:false,
            oldCarpoolGroups: {},
            oldRadius: "",
            manageTabsValue: this.MANAGE_GUESTS,
            errorMessage: ""
        };

        this.handleAddGuest = this.handleAddGuest.bind(this);
        this.handleCalcCarpoolGroups = this.handleCalcCarpoolGroups.bind(this);
        this.saveCarpoolGroups = this.saveCarpoolGroups.bind(this);
        this.calcCarpoolGroupsAgain = this.calcCarpoolGroupsAgain.bind(this);
        this.openNewRadiusModal = this.openNewRadiusModal.bind(this);
        this.closeNewRadiusModal = this.closeNewRadiusModal.bind(this);
        this.openImportGuestsModal = this.openImportGuestsModal.bind(this);
        this.closeImportGuestsModal = this.closeImportGuestsModal.bind(this);
        this.cancelNewCarpoolGroups = this.cancelNewCarpoolGroups.bind(this);
        this.calcPickupOrders = this.calcPickupOrders.bind(this);
        this.sendCarpoolMatchingMessagesToGuests = this.sendCarpoolMatchingMessagesToGuests.bind(this);
        this.handleImportGuestsExcelFile = this.handleImportGuestsExcelFile.bind(this);
        this.handleGuestClicked = this.handleGuestClicked.bind(this);
        this.handleManageTabsChange = this.handleManageTabsChange.bind(this);
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
        const newGuestId = eventsRef.child(this.state.eventId + '/guests').push().key;
        newGuest["id"] = newGuestId;
        eventsRef.child(this.state.eventId + '/guests/' + newGuestId).update(newGuest);

        // Send message to the new guest
        Messaging.sendMessage(this.state.eventId,
            new message(`You have been invited to the event '${this.state.event.name}'. 
            Please fill your details in the following link: /event/${this.state.eventId}/newGuest/${newGuestId}`,
                newGuest.phoneNumber));

        // Updating the state
        let guestObj = {};
        guestObj[newGuestId] = newGuest;

        this.setState((prevState) => ({
            event: {
                ...prevState.event,
                guests: {
                    ...prevState.event.guests,
                    ...guestObj
                }
            }
        }), this.loader.current.closeLoader);
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
        return (
            <ul className="cars-details-container">
                {Object.values(carpoolGroups).map(carpoolGroup => {
                   return (
                       <li className="group-details-container" key={carpoolGroup.driver.id}>
                           <CarpoolGroupComponent eventId={this.state.eventId} driver={carpoolGroup.driver} passengers={Object.values(carpoolGroup.passengers)}/>
                       </li>
                   );
                })}
            </ul>
        );
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
                            name: this.state.event.guests[carpoolGroup.driverId].name,
                            phoneNumber: this.state.event.guests[carpoolGroup.driverId].phoneNumber,
                            startAddress: this.state.event.guests[carpoolGroup.driverId].startAddress
                        },
                        passengers: {}
                    };

                    carpoolGroup.setPassengers.forEach(passenger => {
                        passenger.name = this.state.event.guests[passenger.id].name;
                        passenger.phoneNumber = this.state.event.guests[passenger.id].phoneNumber;
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
            })
            .catch(() => {
                this.loader.current.closeLoader();
                this.setState({errorMessage: "Error while trying to calculate the carpool groups."},
                    this.errorPopup.current.openErrorPopup);
            });
    }

    saveCarpoolGroups() {
        this.setState({isCarpoolGroupsConfirmed: true});
        const groupObjects = {};
        this.state.event.carpoolGroups.forEach(carpoolGroup => {
           groupObjects[carpoolGroup.driver.id] = carpoolGroup;
        });

        eventsRef.child(this.state.eventId + '/carpoolGroups').set(groupObjects);

        if (this.state.isCalcCarpoolGroupsAgain) {
            eventsRef.child(this.state.eventId).update({maxRadiusInKm: this.state.event.maxRadiusInKm});
            this.setState({
                isCalcCarpoolGroupsAgain: false,
                oldCarpoolGroups: {}
            });
        }
    }

    sendCarpoolMatchingMessagesToGuests() {
        this.loader.current.openLoader();
        let messages = [];
        let setMatchedPassengersIds = new Set();

        Object.values(this.state.event.carpoolGroups).forEach(carpoolGroup => {
            const messageText = `You were matched to a carpool group for the event '${this.state.event.name}'. Watch your carpool group's details in the following link: /event/${this.state.eventId}/carpoolGroup/${carpoolGroup.driver.id}`;

            messages.push(new message(messageText, carpoolGroup.driver.phoneNumber));
            setMatchedPassengersIds.add(carpoolGroup.driver.id);

            Object.values(carpoolGroup.passengers).forEach(passenger => {
                messages.push(new message(messageText, passenger.phoneNumber));
                setMatchedPassengersIds.add(passenger.id);
            });
        });

        Object.values(this.state.event.guests).forEach(guest => {
            if (guest.isComing && !setMatchedPassengersIds.has(guest.id)) {
                messages.push(new message(`You were not matched to a carpool group for the event '${this.state.event.name}'.`,
                guest.phoneNumber));
            }
        });

        Messaging.sendMessages(this.state.eventId, messages);
        this.loader.current.closeLoader();
    }

    calcCarpoolGroupsAgain(data) {
        this.closeNewRadiusModal();

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
        EventPoolService.calcAndSavePickupOrders(this.state.eventId)
        .then(() => {
            this.loader.current.closeLoader();
        })
        .catch(() => {
            this.loader.current.closeLoader();
            this.setState({errorMessage: "Error while trying to calculate the pickup orders."},
                this.errorPopup.current.openErrorPopup);
        });
    }

    handleImportGuestsExcelFile(e) {
        this.closeImportGuestsModal();
        this.loader.current.openLoader();
        let fileObj = e.target.files[0];

        ExcelRenderer(fileObj, (err, resp) => {
            if(err){
                this.loader.current.closeLoader();
                this.setState({errorMessage: "Error while importing the guests' file. The error is: " + err},
                    this.errorPopup.current.openErrorPopup);
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
                                        const guestId = eventsRef.child(this.state.eventId + '/guests').push().key;
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
                        eventsRef.child(this.state.eventId + '/guests/').update(newGuestsFromExcel);

                        this.setState((prevState) => ({
                            event: {
                                ...prevState.event,
                                guests: {
                                    ...prevState.event.guests,
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

    handleGuestClicked(event, rowData) {
        if (!rowData.hasOwnProperty('isComing')) {
            this.props.history.push(`/event/${this.state.eventId}/newGuest/${rowData.id}`);
        }
    }

    handleManageTabsChange(event, value) {
        this.setState({manageTabsValue: value});
    }

    openNewRadiusModal() {
        this.setState({ isOpenNewRadiusPopup: true });
    }

    closeNewRadiusModal() {
        this.setState({ isOpenNewRadiusPopup: false });
    }

    openImportGuestsModal() {
        this.setState({ isOpenImportGuestsPopup: true });
    }

    closeImportGuestsModal() {
        this.setState({ isOpenImportGuestsPopup: false });
    }

    render() {
        let eventDetails;
        let carpoolGroups;
        let carpoolGroupsSummary;

        if (Object.keys(this.state.event.carpoolGroups).length > 0) {
            carpoolGroups = this.buildCarpoolGroupsList(this.state.event.carpoolGroups);
            carpoolGroupsSummary = (
                <div className="car-group-container">
                    <h2>Participating guests in carpool</h2>
                    <Grid container spacing={24}>
                        <Grid item xs={6}>
                            <TextField type="text" label="Passengers:" value={
                                `${Object.values(this.state.event.carpoolGroups).map((carpoolGroup) => {
                                    return Object.keys(carpoolGroup.passengers).length
                                }).reduce((l1, l2) => l1 + l2)} of ${
                                    Object.values(this.state.event.guests)
                                        .filter((guest) => guest.isComing && !guest.isCar).length
                                }`
                            }/>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField type="text" label="Drivers:" value={
                                `${Object.keys(this.state.event.carpoolGroups).length} of ${
                                    Object.values(this.state.event.guests)
                                        .filter((guest) => guest.isComing && guest.isCar).length
                                    }`
                            }/>
                        </Grid>
                    </Grid>
                </div>
            );
        }

        if (this.state.event.hasOwnProperty("id") && this.state.event.id !== "") {
            eventDetails = (
                <div className="event-details-container">
                    <h2>{this.state.event.name}</h2>
                    <div className="event-metadata">
                        <div>
                            <i class="material-icons event-metadata-icon">schedule</i>
                            When: {Formatters.dateFormatter(this.state.event.date)}
                        </div>
                        <div>
                            <i class="material-icons event-metadata-icon">room</i>
                            <div>Where: {this.state.event.address.name}</div>
                        </div>
                        <div>
                            <i class="material-icons event-metadata-icon">call_made</i>
                            Radius: {this.state.event.maxRadiusInKm} Km
                        </div>
                    </div>
                </div>
            );
        }

        // Checking if there is at least one driver and one passenger
        const isCarpoolGroupsCalcAvailable =
            Object.values(this.state.event.guests).find(guest => guest.isCar === true) !== undefined &&
            Object.values(this.state.event.guests).find(guest => guest.isComing === true && guest.isCar === false) !== undefined;

        return (
            <div className="event-container">
                <Loader ref={this.loader}/>
                <ErrorPopupComponent ref={this.errorPopup} errorMessage={this.state.errorMessage}/>
                {eventDetails}
                <div className="event-tabs-container">
                    <AppBar className="tabs">
                        <Tabs value={this.state.manageTabsValue} onChange={this.handleManageTabsChange}>
                            <Tab value={this.MANAGE_GUESTS} label={this.MANAGE_GUESTS} />
                            <Tab value={this.MANAGE_CARPOOL_GROUPS} label={this.MANAGE_CARPOOL_GROUPS} />
                        </Tabs>
                    </AppBar>
                </div>
                <div className="event-tab-content-container">
                    {this.state.manageTabsValue === this.MANAGE_GUESTS &&
                    <TabContainer>
                        <div className="add-guest-container">
                            <Grid container spacing={24}>
                                <Grid item>
                                    <h4>Add guests</h4>
                                </Grid>
                                <Grid item>
                                    <AddGuestForm onSubmit={this.handleAddGuest}/>
                                </Grid>
                                <Grid item>
                                    <button  className="import-btn event-pool-btn" onClick={this.openImportGuestsModal}>Import</button>
                                    <Popup modal open={this.state.isOpenImportGuestsPopup}>
                                        <div className="import-popup-container">
                                            <h1>Import guests from excel</h1>
                                            <div className="template-form">
                                                <div className="download-template-form">
                                                    Download guests' template sheet
                                                    <GuestsExcelTemplateComponent/>
                                                </div>
                                                <div className="import-template">
                                                    Import guests' excel file
                                                    <input type="file"
                                                           onChange={this.handleImportGuestsExcelFile} />
                                                </div>
                                            </div>
                                        </div>
                                    </Popup>
                                </Grid>
                            </Grid>
                        </div>
                        <div className="guests-table-container" style={{"padding": "1%"}}>
                            <GuestsTableComponent guests={Object.values(this.state.event.guests)}
                                                  onGuestClicked={this.handleGuestClicked}/>
                        </div>
                    </TabContainer>
                    }

                    {this.state.manageTabsValue === this.MANAGE_CARPOOL_GROUPS &&
                    <TabContainer>
                        <div className="carpool-groups-container">
                            <Button variant="contained"
                                    className="event-pool-btn"
                                    onClick={this.handleCalcCarpoolGroups}
                                    hidden={
                                        !isCarpoolGroupsCalcAvailable ||
                                        this.state.isCarpoolGroupsConfirmed ||
                                        Object.keys(this.state.event.carpoolGroups).length > 0
                                    }>Calculate Carpool Groups
                            </Button>
                            <Button variant="contained"
                                    className="event-pool-btn"
                                    onClick={this.saveCarpoolGroups}
                                    hidden={
                                        this.state.isCarpoolGroupsConfirmed ||
                                        Object.keys(this.state.event.carpoolGroups).length <= 0
                                    }>Save Carpool Groups
                            </Button>
                            <Button variant="contained"
                                    className="event-pool-btn"
                                    onClick={this.cancelNewCarpoolGroups}
                                    hidden={
                                        Object.keys(this.state.oldCarpoolGroups).length <= 0
                                    }>Cancel new groups calculation
                            </Button>
                            <Button variant="contained"
                                    className="event-pool-btn"
                                    onClick={this.sendCarpoolMatchingMessagesToGuests}
                                    hidden={
                                        !this.state.isCarpoolGroupsConfirmed
                                    }>Send carpool matching messages to guests
                            </Button>
                            <Button variant="contained"
                                    className="event-pool-btn"
                                    onClick={this.calcPickupOrders}
                                    hidden={!this.state.isCarpoolGroupsConfirmed}>
                                Calculate pickup order of carpool groups
                            </Button>
                            <Button variant="contained"
                                    className="event-pool-btn"
                                    onClick={this.openNewRadiusModal}
                                    hidden={Object.keys(this.state.event.carpoolGroups).length <= 0}>
                                Calculate Carpool Groups Again
                            </Button>
                            <Popup open={this.state.isOpenNewRadiusPopup} onClose={this.closeNewRadiusModal} closeOnDocumentClick modal>
                                <NewDeviationRadiusForm
                                    maxRadiusInKm={this.state.event.maxRadiusInKm}
                                    onSubmit={this.calcCarpoolGroupsAgain}/>
                            </Popup>
                            {carpoolGroupsSummary}
                            {carpoolGroups}
                        </div>
                    </TabContainer>
                    }
                </div>
            </div>
        );
    }
}

export { EventPage };
