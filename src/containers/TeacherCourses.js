import React, { Component } from "react";
import CoursesTable from "../components/CoursesTable"

export default class TeacherCourses extends Component {

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
      role: this.props.role
    };

    return (
      this.props.isAuthenticated &&
      <div>
        <CoursesTable childProps={childProps}/>
      </div>
    );
  }
}
