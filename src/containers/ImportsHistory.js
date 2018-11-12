import React, { Component } from "react";
import ImportsTable from "../components/ImportsTable"

export default class ImportsHistory extends Component {

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
        <h1>Carga de Datos</h1>
        <h4>Historial</h4>
        <ImportsTable childProps={childProps}/>
      </div>
    );
  }
}
