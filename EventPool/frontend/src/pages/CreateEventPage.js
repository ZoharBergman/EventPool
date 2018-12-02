/**
 * Created by Zohar on 30/11/2018.
 */
import React, { Component } from 'react';
import CreateEventForm from '../forms/CreateEventForm';
import handlers from '../forms/FormsHandler';

class CreateEventPage extends Component {
    render() {
        return (
            <CreateEventForm onSubmit={handlers.handleCreateEvent}/>
        );
    }
}

export { CreateEventPage };

