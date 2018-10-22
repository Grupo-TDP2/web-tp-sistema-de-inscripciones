import React, { Component } from "react";
import SchoolTermsTable from "../components/SchoolTermsTable"

export default class SchoolTerms extends Component {

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
        <h1>Períodos Lectivos</h1>
        <SchoolTermsTable childProps={childProps}/>
      </div>
    );
  }
}
