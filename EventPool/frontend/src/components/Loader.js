/**
 * Created by Zohar on 31/03/2019.
 */
import React, { Component } from 'react';
import Popup from 'reactjs-popup';
import ClipLoader from 'react-spinners/ClipLoader';

class Loader extends Component {
  constructor(props) {
      super(props);

      this.state = {
          open: props.hasOwnProperty("open") ? props.open : false
      };

      this.closeLoader = this.closeLoader.bind(this);
      this.openLoader = this.openLoader.bind(this);
  }

  closeLoader() {
      this.setState({open: false});
  }

  openLoader() {
      this.setState({open: true});
  }

  render() {
      return (
          <Popup open={this.state.open} closeOnDocumentClick={false} closeOnEscape={false}
                 contentStyle={{
                     "background": "none",
                     "border": "none",
                     "width": "fit-content"}}>
              <ClipLoader sizeUnit={"px"} size={80} color={'#123abc'} loading={true} />
          </Popup>
      );
  }
}

export default Loader;