import React, { Component } from "react";

export default class ChartInfo extends Component {

    render() {
        const infoElements = this.props.infoProps.elements.map(function(element) {
            return element;
        });

        return (
            <div>
                <h4>{this.props.infoProps.title}</h4>
                {infoElements}
            </div>
        );
    }
}