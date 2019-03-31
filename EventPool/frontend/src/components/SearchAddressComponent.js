/**
 * Created by Zohar on 28/03/2019.
 */
import React, { Component } from 'react';
import googleApiKeys from '../config/keys';
import Script from 'react-load-script';

class SearchAddressComponent extends Component {

    constructor(props) {
        super(props);

        this.GOOGLE_PLACES_URL = `https://maps.googleapis.com/maps/api/js?key=${googleApiKeys.GOOGLE_PLACES_API_KEY}&libraries=places`;

        this.state = {
            location: {lat: "", lng: ""},
            name: ""
        };

        this.handleScriptLoad = this.handleScriptLoad.bind(this);
        this.handlePlaceSelect = this.handlePlaceSelect.bind(this);
    }

    handleScriptLoad() {
        // let options = { types: ['address'] };

        // Initialize Google Autocomplete
        /*global google*/
        this.autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'));

        // Fire Event when a suggested name is selected
        this.autocomplete.addListener('place_changed', this.handlePlaceSelect);
    }


    handlePlaceSelect() {
        let addressObject = this.autocomplete.getPlace();

        // Check if address is valid
        if (addressObject.address_components) {
            this.setState(
                {
                    location: {
                        lat: addressObject.geometry.location.lat(),
                        lng: addressObject.geometry.location.lng()
                    },
                    name: addressObject.formatted_address,
                }
            );

            this.props.onAddressSelected(this.state);
        }
    }

    render() {
        return (
            <div>
                <Script url={this.GOOGLE_PLACES_URL} onLoad={this.handleScriptLoad} />
                <input className="input" id="autocomplete" placeholder="Search address"/>
                <h1 hidden={true} id="addressLocationLat">{this.state.location.lat}</h1>
                <h1 hidden={true} id="addressLocationLng">{this.state.location.lng}</h1>
            </div>
        );
    }
}

export default SearchAddressComponent;
//
// // GoogleAutocomplete.js
// import React from 'react';
// import PropTypes from 'prop-types';
// import { FormControl } from '@material-ui/core/FormControl';
// import { InputLabel } from '@material-ui/core/InputLabel';
// import PlacesAutocomplete from 'react-places-autocomplete';
//
// class SearchAddressComponent extends React.Component {
//     constructor(props) {
//         super(props);
//         this.state = { address: '' };
//         this.onAddressChange = this.onAddressChange.bind(this);
//     }
//
//     onAddressChange(address) {
//         const { input } = this.props;
//         const { onChange } = input;
//         this.setState({ address });
//         onChange(address);
//     }
//
//     render() {
//         const { classes } = this.props;
//         const inputProps = {
//             value: this.state.address,
//             type: 'search',
//             placeholder: 'Search Places...',
//             onChange: this.onAddressChange,
//         };
//
//         return (
//             <div>
//                 <PlacesAutocomplete value={this.state.address} placeholder="Search Places..." onChange={this.onAddressChange}>
//                 </PlacesAutocomplete>
//             </div>
//         );
//     }
// }
//
// SearchAddressComponent.defaultProps = {
//     input: {},
//     classes: {},
// };
//
// SearchAddressComponent.propTypes = {
//     input: PropTypes.object,
//     classes: PropTypes.object,
// };
//
// export default SearchAddressComponent;