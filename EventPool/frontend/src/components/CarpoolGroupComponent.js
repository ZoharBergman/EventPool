import React, { Component } from 'react';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import { Link } from 'react-router-dom';
import ListComponent from './ListComponent';

class CarpoolGroupComponent extends Component {
    render() {
        return (
            <Card>
                <Link to={`/event/${this.props.eventId}/carpoolGroup/${this.props.driver.id}`}>
                    <CardHeader title={"Driver: " + this.props.driver.name}/>
                </Link>
                <CardContent>
                    {ListComponent(this.props.passengers, "guestId", "name")}
                </CardContent>
            </Card>
        );
    }
}

export default CarpoolGroupComponent;
