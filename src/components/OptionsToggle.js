import React, { Component } from "react";
import {ToggleButton, ToggleButtonGroup} from 'react-bootstrap';

export default class OptionsToggle extends Component {
    render() {
        var toggleOptions = this.props.childProps.options.map(function(option) {
            return (
                <ToggleButton key={option.value} value={option.value}>{option.label}</ToggleButton>
            );
        });

        return (
        <ToggleButtonGroup 
            type="radio" 
            name="options"
            value={this.props.childProps.valueProp}
            onChange={(e) => this.props.childProps.handleChange(e,this.props.childProps.row)}>
            {toggleOptions}
        </ToggleButtonGroup>
        );
    }
}