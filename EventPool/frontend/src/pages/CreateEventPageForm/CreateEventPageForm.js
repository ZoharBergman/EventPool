/**
 * Created by Zohar on 12/11/2018.
 */
import React, { Component } from 'react';
import './Style.css';
import logo from '../../images/EventpoolLogo.png';

class CreateEventPageForm extends Component {
    render() {
        return (
            <div class="container contact-form" style={{background: '#fee870'}}>
                <div class="contact-image">
                    <img src={logo}/>
                </div>
                <form method="post">
                    <h3>Create new event</h3>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <input type="text" name="txtName" class="form-control" placeholder="Event Name *" value="" />
                            </div>
                            <div class="form-group">
                                <input type="date" name="txtEmail" class="form-control" placeholder="Event date *" value="" />
                            </div>
                            <div class="form-group">
                                <input type="text" name="txtPhone" class="form-control" placeholder="Your Phone Number *" value="" />
                            </div>
                            <div class="form-group">
                                <input type="submit" name="btnSubmit" class="btnContact" value="Send Message" />
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <textarea name="txtMsg" class="form-control" placeholder="Your Message *" style={{width: '100%', height: '150px'}}></textarea>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

export { CreateEventPageForm };