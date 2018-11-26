import React, { Component } from "react";
import {Pie} from 'react-chartjs-2';

export default class PieChart extends Component {

    render() {
        return (
            <div>
                <Pie
                    data={this.props.chartProps.chartData}
                    options={{
                        maintainAspectRatio: false,
                        legend: {
                            display: false
                        }
                    }}
                    height={300}
                    getElementAtEvent={this.props.chartProps.handleElementClick}
                />
            </div>
        );
    }
}