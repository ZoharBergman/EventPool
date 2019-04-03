/**
 * Created by Zohar on 03/04/2019.
 */
import Typography from '@material-ui/core/Typography';
import React from 'react';
import PropTypes from 'prop-types';

const TabContainer = (props) => {
    return (
        <Typography component="div" style={{ padding: 8 * 3 }}>
            {props.children}
        </Typography>
    );
};

TabContainer.propTypes = {
    children: PropTypes.node.isRequired,
};

export default TabContainer;
