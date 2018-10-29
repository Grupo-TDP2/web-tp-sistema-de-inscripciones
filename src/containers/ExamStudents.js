import React, { Component } from "react";
import ExamStudentsTable from "../components/ExamStudentsTable"

export default class ExamStudents extends Component {

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
      examID: this.props.match.params.examID,
      departmentID: this.props.match.params.department,
      role: this.props.role
    };

    let mDateSplit = this.props.match.params.date.split('-');
    const mDate = mDateSplit[0] + '/' + mDateSplit[1] + '/' + mDateSplit[2];

    return (
      this.props.isAuthenticated &&
      <div>
        <h1>{this.props.match.params.subject + " - " + mDate}</h1>
        <br />
        <ExamStudentsTable childProps={childProps}/>
      </div>
    );
  }
}