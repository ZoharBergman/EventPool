/**
 * Created by Zohar on 31/03/2019.
 */
import React from 'react';
import PlacesAutocomplete from 'react-places-autocomplete';

const renderFunc = ({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
    <div>
        <input
            {...getInputProps({
                placeholder: 'Search place ...',
                className: 'form-control',
            })}
        />
        <div className="autocomplete-dropdown-container">
            {loading && <div>Loading...</div>}
            {suggestions.map(suggestion => {
                const className = suggestion.active
                    ? 'suggestion-item--active'
                    : 'suggestion-item';
                // inline style for demonstration purpose
                const style = suggestion.active
                    ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                    : { backgroundColor: '#ffffff', cursor: 'pointer' };
                return (
                    <div
                        {...getSuggestionItemProps(suggestion, {
                            className,
                            style,
                        })}
                    >
                        <span>{suggestion.description}</span>
                    </div>
                );
            })}
        </div>
    </div>
);

const PlaceField = ({ input: { onChange, value }, label, placeholder, meta: { touched, error, warning } }) =>
{
    return (
        <PlacesAutocomplete onChange={onChange} value={value} placeholder="Search Places...">
            {renderFunc}
        </PlacesAutocomplete>
    );
};

export default PlaceField;