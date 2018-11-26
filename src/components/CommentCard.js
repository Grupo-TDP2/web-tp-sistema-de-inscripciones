import React, { Component } from "react";
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import moment from 'moment';

import "./CommentCard.css";

export default class CommentCard extends Component {
    /*
        Component works with comments that have the following attributes:
            *commentID
            *comment
            *date
    */
    
    render() {
        const formattedDate = moment(this.props.comment.date).format("DD/MM/YYYY HH:MM");

        return (
            <Card className="commentCard">
                <Typography className="dateTitle" component="h5">
                    {formattedDate}
                </Typography>
                <Typography className="comment" component="h5">
                    {this.props.comment.comment}
                </Typography>
            </Card>
        );
    }
}