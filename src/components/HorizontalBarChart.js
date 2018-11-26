import React, { Component } from "react";
import {HorizontalBar} from 'react-chartjs-2';

export default class HorizontalBarChart extends Component {

    render() {
        return (
            <div>
                <HorizontalBar
                    data={this.props.barChartProps.chartData}
                    options={{
                        scales: {
                            xAxes: [{
                                ticks: {
                                    beginAtZero: true
                                }
                            }]
                        }
                    }}
                    getElementAtEvent={this.props.barChartProps.handleCourseClick}
                />
            </div>
        );
    }
}