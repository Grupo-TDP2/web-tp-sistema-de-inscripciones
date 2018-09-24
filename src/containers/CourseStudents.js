import React, { Component } from "react";

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
      handleLogout: this.props.handleLogout
    };

    return (
      this.props.isAuthenticated &&
      <div>
        <h1>75.12 Análisis Númerico I</h1>
      </div>
    );
  }
}