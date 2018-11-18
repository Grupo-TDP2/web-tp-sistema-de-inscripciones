import React, { Component } from "react";
import CommentCard from "./CommentCard";

import "./CommentSection.css";

export default class CommentSection extends Component {
    /*
        Component works with comments that have the following attributes:
            *commentID
            *comment
            *date
    */
    
    render() {
        let currentComments = this.props.commentSectionProps.comments.map(function(comment) {
            return (
              <CommentCard key={comment.commentID} comment={comment} />
            );
        });

        return (
            <div className="commentSection">
                <h3 className="title">Comentarios</h3>
                {currentComments}
            </div>
        );
    }
}