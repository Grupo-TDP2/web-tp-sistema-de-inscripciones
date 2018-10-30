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
      courseID: this.props.match.params.courseID,
      departmentID: this.props.match.params.department,
      role: this.props.role
    };

    return (
      this.props.isAuthenticated &&
      <div>
        <h1>Fechas de Examen</h1>
        <h4>Matería: {this.props.match.params.subject}</h4>
        <br />
        <ExamsTable childProps={childProps}/>
      </div>
    );
  }
}