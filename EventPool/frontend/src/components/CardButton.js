/**
 * Created by Zohar on 25/04/2019.
 */
import React, { Component } from 'react';
import './CardButton.css';
import Button from '@material-ui/core/Button';

class CardButton extends Component {
    constructor(props) {
        super(props);

        this.state = {
          isIcon: true
        };

        this.showText = this.showText.bind(this);
        this.showIcon = this.showIcon.bind(this);
    }

    showText() {
        this.setState({isIcon: false});
    }

    showIcon() {
        this.setState({isIcon: true});
    }

    render() {
        const { icon, text } = this.props;
        const buttonContent = this.state.isIcon ? (<i className="material-icons card-button-icon">{icon}</i>) : text;

        return(
            <Button variant="contained" className="card-button" {...this.props}
                    onMouseOver={this.showText}
                    onMouseOut={this.showIcon}>
                {buttonContent}
            </Button>
        );
    }
}

export default CardButton;