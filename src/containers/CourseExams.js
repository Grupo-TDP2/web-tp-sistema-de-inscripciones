import React, { Component } from "react";
import ExamsTable from "../components/ExamsTable"

export default class CourseExams extends Component {

  constructor(props) {
    super(props);

    if (!this.props.isAuthenticated) {
      this.props.history.push("/login") 
    }
  }

  render() {
    const childProps = {
      token: this.props.token,
      handleLogout: this.props.handleLogout,
      courseID: this.props.match.params.courseID
    };

    return (
      this.props.isAuthenticated &&
      <div>
        <h1>{this.props.match.params.subject}</h1>
        <ExamsTable childProps={childProps}/>
      </div>
    );
  }
}