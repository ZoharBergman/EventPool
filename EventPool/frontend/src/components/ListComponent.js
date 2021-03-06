/**
 * Created by Zohar on 20/03/2019.
 */
import React from "react";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

const getNestedAttributeValue = function (item, attribute) {
    return attribute.split(".").reduce((obj, key) => (obj && obj[key] !== 'undefined') ? obj[key] : undefined, item);
};

const ListComponent = function(listItems, keyAttribute, ...attributes) {
    return(
        listItems.map((item) => {
        return (
            <List dense={false}>
                <ListItem key={item[keyAttribute]}>
                    {attributes.map(attribute => <ListItemText primary={getNestedAttributeValue(item, attribute)}/>)}
                </ListItem>
            </List>
        );
    }));
};

export default ListComponent;
