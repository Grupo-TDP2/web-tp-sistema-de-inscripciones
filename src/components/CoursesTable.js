import React, { Component } from "react";
import { Redirect } from 'react-router-dom';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import axios from 'axios'
import {Glyphicon, Button} from 'react-bootstrap';
import { ToastContainer } from "react-toastr";
import "./Toastr.css";
import "./CoursesTable.css";
import API_URI from "../config/GeneralConfig.js";

let container;

export default class CoursesTable extends Component {

  constructor(props) {
    super(props);
    
    this.state = {
        courses: [
          {
            courseID: '508',
            subject: '75.12 Análisis Númerico I',
            schedule: 'Lunes 19.00 - 22.00\nJueves 19.00 - 22.00',
            location: 'Las Heras',
            classroom: '203'
          },
          {
            courseID: '510',
            subject: '75.40 Introducción a los Sistemas Distribuidos',
            schedule: 'Martes 19.00 - 22.00\nMiercoles 19.00 - 22.00',
            location: 'Paseo Colon',
            classroom: '208'
          }
        ],
        loaderMsg: 'Cargando la informacion...',
        redirect: false,
        redirectTo: ''
    };

    this.customTitle = this.customTitle.bind(this);
    this.displayErrorToastr = this.displayErrorToastr.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    this.setState({loaderMsg: 'No hay datos disponibles.'});
  }

  displayErrorToastr(message) {
    container.error(<div></div>, <em>{message}</em>, 
        {closeButton: true, timeOut: 3000}
      );
  }

  customTitle(cell, row, rowIndex, colIndex) {
    return `Doble click para editar`;
  }

  handleClick(cell, row) {
    this.setState({
      redirect: true,
      redirectTo: '/courseStudents'
    });
  }

  render() {
    if (this.state.redirect) {
      return <Redirect push to={`${this.state.redirectTo}`} />;
    }

    const handleClick = (cell,row) => this.handleClick(cell,row);

    const options = {
        noDataText: this.state.loaderMsg,
        beforeShowError: (type, msg) => {
          return false;
        }
    };

    function buttonFormatter(cell, row){
      return (
        <Button className="submitButton" bsStyle="primary" onClick={() => handleClick(cell,row)}>
            <Glyphicon glyph="education" />&nbsp;
        </Button>
      );
    }

    return (
      <div>
        <ToastContainer
          ref={ref => container = ref}
          className="toast-top-right"
        />
        <BootstrapTable ref='coursesTable' data={ this.state.courses } options={ options }
                    headerStyle={ { background: '#f8f8f8' } } pagination search={ true }>
            <TableHeaderColumn dataField='courseID' width='80' isKey={ true } headerAlign='center' dataAlign='center'>Curso</TableHeaderColumn>
            <TableHeaderColumn dataField='subject' headerAlign='center' dataAlign='center'>Materia</TableHeaderColumn>
            <TableHeaderColumn dataField='schedule' width='180' headerAlign='center' dataAlign='center' tdStyle={ { whiteSpace: 'normal' } }>Horario</TableHeaderColumn>
            <TableHeaderColumn dataField='location' width='120' headerAlign='center' dataAlign='center'>Sede</TableHeaderColumn>
            <TableHeaderColumn dataField='classroom' width='80' headerAlign='center' dataAlign='center'>Aula</TableHeaderColumn>
            <TableHeaderColumn dataField="button" width='100' headerAlign='center' dataAlign='center' dataFormat={buttonFormatter}>Alumnos</TableHeaderColumn>
        </BootstrapTable>
      </div>
    );
  }
}