import React, { Component } from "react";
import { Redirect } from 'react-router-dom';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import axios from 'axios'
import {Glyphicon, Button} from 'react-bootstrap';
import { ToastContainer } from "react-toastr";
import "./Toastr.css";
import API_URI from "../config/GeneralConfig.js";

let container;

export default class StudentsTable extends Component {

  constructor(props) {
    super(props);
    
    this.state = {
        students: [
          {
            studentID: '100',
            name: 'Tobias Bianchi',
            studentNumber: '93888',
            status: 'Regular'
          },
          {
            studentID: '101',
            name: 'Juan Costamagna',
            studentNumber: '93383',
            status: 'Regular'
          },
          {
            studentID: '102',
            name: 'Leandro Masello',
            studentNumber: '93391',
            status: 'Regular'
          },
          {
            studentID: '103',
            name: 'Gonzalo Merino',
            studentNumber: '93952',
            status: 'Condicional'
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
    this.displayErrorToastr("Funcion habilitada proximamente.")
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
            <Glyphicon glyph="user" />&nbsp;
        </Button>
      );
    }

    return (
      <div>
        <ToastContainer
          ref={ref => container = ref}
          className="toast-top-right"
        />
        <BootstrapTable ref='coursesTable' data={ this.state.students } options={ options }
                    headerStyle={ { background: '#f8f8f8' } } pagination search={ true } searchPlaceholder={'Buscar'}>
            <TableHeaderColumn dataField='studentID' hidden={ true } width='80' isKey={ true } headerAlign='center' dataAlign='center'>ID Alumno</TableHeaderColumn>
            <TableHeaderColumn dataField='name' headerAlign='center' dataAlign='center'>Nombre</TableHeaderColumn>
            <TableHeaderColumn dataField='studentNumber' width='180' headerAlign='center' dataAlign='center'>Padron</TableHeaderColumn>
            <TableHeaderColumn dataField='status' width='160' headerAlign='center' dataAlign='center'>Condición</TableHeaderColumn>
            <TableHeaderColumn dataField="button" width='140' headerAlign='center' dataAlign='center' dataFormat={buttonFormatter}>Acciones</TableHeaderColumn>
        </BootstrapTable>
      </div>
    );
  }
}