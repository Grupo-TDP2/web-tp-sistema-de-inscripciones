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
      handleLogout: this.props.handleLogout
    };

    return (
      this.props.isAuthenticated &&
      <div>
        <h1>Mis Cursos</h1>
        <CoursesTable childProps={childProps}/>
      </div>
    );
  }
}
