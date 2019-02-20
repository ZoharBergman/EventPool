import React, { Component } from 'react';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

class CarpoolGroupComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            id: "",
            driverId: "",
            driverName: "",
            passengers: []
        };
    }

    generate(listItems, attribute) {
        return listItems.map(item => {
            <ListItem>
                <ListItemText primary={item[attribute]}/>
            </ListItem>
        });
    }

    render() {
        return (
            <Card>
                <CardHeader title={"Driver: " + this.state.driverName}/>
                <CardContent>
                    <List dense=false>
                        {this.generate(this.state.passengers, "name")}
                    </List>
                </CardContent>
            </Card>
        );
    }
}

export default CarpoolGroupComponent;
