import React, { Component } from "react";
import { Redirect } from 'react-router-dom';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import axios from 'axios'
import {Glyphicon, Button} from 'react-bootstrap';
import { ToastContainer } from "react-toastr";
import "./Toastr.css";
import API_URI from "../config/GeneralConfig.js";

import StudentJSONResponse from "../config/StudentJSONResponse";

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

  async componentDidMount() {
    this.setState({loaderMsg: 'No hay datos disponibles.'});
    const errorToastr = message => this.displayErrorToastr(message);
    const setLoaderMsg = mLoaderMsg => this.setState({ loaderMsg: mLoaderMsg });
    const setStudents = mStudents => this.setState({students: mStudents});

    await axios({
      method:'get',
      url: API_URI + '/teachers/me/courses/' + this.props.childProps.courseID + '/enrolments',
      headers: {'Authorization': 'eyJhbGciOiJIUzI1NiJ9.eyJkYXRhIjp7ImlkIjoyfSwiZXhwIjoxNTQzNTMyMDkyfQ.snEe9NZkCDdKsB9HNJrWAuXg-Q92vnSW4EImXXQIfCE'}
      })
        .then(function(response) {
          console.log(response);

          let mStudents = [];

          response.data.forEach(student => {
            let mStudent = {
              studentID: student.id,
              name: student.student.first_name + ' ' + student.student.last_name,
              studentNumber: student.student.school_document_number
            }

            if (student.type === 'normal') {
              mStudent.status = 'Regular';
            } else {
              mStudent.status = 'Condicional';
            }

            mStudents.push(mStudent);
          });

          setStudents(mStudents);
        })
        .catch(function (error) {
          console.log(error);
          errorToastr("No se pudieron cargar los datos.");
          setLoaderMsg("No se pudieron cargar los datos.");
        });

    /*let mStudents = [];

    StudentJSONResponse.data.forEach(student => {
      let mStudent = {
        studentID: student.id,
        name: student.student.first_name + ' ' + student.student.last_name,
        studentNumber: student.student.school_document_number
      }

      if (student.type === 'normal') {
        mStudent.status = 'Regular';
      } else {
        mStudent.status = 'Condicional';
      }

      mStudents.push(mStudent);
    });

    this.setState({ students: mStudents });*/
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
        },
        sizePerPageList: [ {
          text: '2', value: 2
        }, {
          text: '10', value: 10
        }, {
          text: 'Todos', value: this.state.students.length
        } ], // you can change the dropdown list for size per page
        sizePerPage: 10
    };

    function buttonFormatter(cell, row){
      return (
        <Button className="submitButton" onClick={() => handleClick(cell,row)}>
            <Glyphicon glyph="user" />&nbsp;
        </Button>
      );
    }

    function customSortFunction(a, b, order) {   // order is desc or asc
      if (order === 'desc') {
        return a.name.split(' ')[1].localeCompare(b.name.split(' ')[1]);
      } else {
        return b.name.split(' ')[1].localeCompare(a.name.split(' ')[1]);
      }
    }

    return (
      <div>
        <ToastContainer
          ref={ref => container = ref}
          className="toast-top-right"
        />
        <BootstrapTable ref='coursesTable' data={ this.state.students } options={ options }
                    headerStyle={ { background: '#f8f8f8' } } pagination={ true } search={ true } searchPlaceholder={'Buscar'}>
            <TableHeaderColumn dataField='studentID' hidden={ true } width='80' isKey={ true } headerAlign='center' dataAlign='center'>ID Alumno</TableHeaderColumn>
            <TableHeaderColumn dataField='name' dataSort sortFunc={ customSortFunction } headerAlign='center' dataAlign='center'>Nombre</TableHeaderColumn>
            <TableHeaderColumn dataField='studentNumber' dataSort={ true } width='180' headerAlign='center' dataAlign='center'>Padron</TableHeaderColumn>
            <TableHeaderColumn dataField='status' width='160' headerAlign='center' dataAlign='center'>Condición</TableHeaderColumn>
            <TableHeaderColumn dataField="button" width='140' headerAlign='center' dataAlign='center' dataFormat={buttonFormatter}>Acciones</TableHeaderColumn>
        </BootstrapTable>
      </div>
    );
  }
}