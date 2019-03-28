/**
 * Created by Zohar on 28/03/2019.
 */
// Imports
import React, { Component } from 'react';
import googleApiKeys from '../config/keys';

// Import Search Bar Components
import SearchBar from 'material-ui-search-bar';

//Import React Scrit Libraray to load Google object
import Script from 'react-load-script';

class SearchAddressComponent extends Component {

    // Define Constructor
    constructor(props) {
        super(props);

        this.GOOGLE_PLACES_URL = `https://maps.googleapis.com/maps/api/js?key=${googleApiKeys.GOOGLE_PLACES_API_KEY}&libraries=places`;

        this.state = {
            address: '',
            query: ''
        };

    }

    handleScriptLoad() {
        // // Declare Options For Autocomplete
        // let options = { types: [‘(cities)’] };
        //
        // // Initialize Google Autocomplete
        // /*global google*/
        // this.autocomplete = new google.maps.places.Autocomplete(
        //     document.getElementById(‘autocomplete’),
        // options );
        // // Fire Event when a suggested name is selected
        // this.autocomplete.addListener(‘place_changed’,
        // this.handlePlaceSelect);
    }

    render() {
        return (
            <div>
                <Script url={this.GOOGLE_PLACES_URL} onLoad={this.handleScriptLoad} />
                <SearchBar id="autocomplete" placeholder="" hintText="Search address" value={this.state.query}
                       style={{
                           margin: '0 auto',
                           maxWidth: 800,
                       }}
                />
            </div>
        );
    }
}

export default SearchAddressComponent;