import React, { Component } from "react";
import StudentsTable from "../components/StudentsTable"

export default class CourseStudents extends Component {

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
      courseID: this.props.match.params.courseID,
      departmentID: this.props.match.params.departmentID,
      role: this.props.role
    };

    return (
      this.props.isAuthenticated &&
      <div>
        <h1>{this.props.match.params.subject}</h1>
        <StudentsTable childProps={childProps}/>
      </div>
    );
  }
}