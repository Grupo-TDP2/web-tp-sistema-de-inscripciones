import React, { Component } from "react";
import { Redirect } from 'react-router-dom';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import axios from 'axios'
import {Glyphicon, Button} from 'react-bootstrap';
import { ToastContainer } from "react-toastr";
import "./Toastr.css";
import API_URI from "../config/GeneralConfig.js";
import OptionsToggle from "./OptionsToggle";

let container;
 
export default class ExamStudentsTable extends Component {

  constructor(props) {
    super(props);
    
    this.state = {
        students: [],
        loaderMsg: 'Cargando la informacion...',
        redirect: false,
        redirectTo: ''
    };

    this.displayErrorToastr = this.displayErrorToastr.bind(this);
    this.loadStudents = this.loadStudents.bind(this);
  }

  async loadStudents() {
    const errorToastr = message => this.displayErrorToastr(message);
    const setLoaderMsg = mLoaderMsg => this.setState({ loaderMsg: mLoaderMsg });
    const setStudents = mStudents => this.setState({students: mStudents});

    let mURL;

    if (this.props.childProps.role === "Admin") {
        mURL = "/teachers/me/courses/" + this.props.childProps.courseID + "/exams/" + this.props.childProps.examID + "/student_exams";
    } else {
        mURL = "/departments/" + this.props.childProps.departmentID + "/courses/" + this.props.childProps.courseID + "/exams/" + this.props.childProps.examID + "/student_exams";
    }

    await axios({
      method:'get',
      url: API_URI + mURL,
      headers: {'Authorization': this.props.childProps.token}
      })
        .then(function(response) {
          console.log(response);

          let mStudents = [];

          response.data.forEach(student => {
            let mStudent = {
              studentID: student.id,
              name: student.student.last_name + ', ' + student.student.first_name,
              studentNumber: student.student.school_document_number
            }

            /*if (student.status === 'approved') {
              mStudent.approved = 1;
            } else if (student.status === 'not_evaluated') {
              mStudent.approved = 3;
            } else {
              mStudent.approved = 2;
            }*/

            mStudents.push(mStudent);
          });

          setStudents(mStudents);
          setLoaderMsg("No hay datos disponibles.");
        })
        .catch(function (error) {
          console.log(error);
          errorToastr("No se pudieron cargar los datos.");
          setLoaderMsg("No se pudieron cargar los datos.");
        });
  }

  async componentDidMount() {
    this.loadStudents();
  }

  displayErrorToastr(message) {
    container.error(<div></div>, <em>{message}</em>, 
        {closeButton: true, timeOut: 3000}
      );
  }

  render() {
    if (this.state.redirect) {
      return <Redirect push to={`${this.state.redirectTo}`} />;
    }

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
        sizePerPage: 10,
        defaultSortName: 'studentID',  // default sort column name
        defaultSortOrder: 'asc'  // default sort order
    };

    /*function approvedCheckboxFormatter(cell, row){
      const childProps = {
        valueProp: cell,
        handleChange: handleChangeApproval,
        row: row,
        options: [
          {value: 1, label: "Si"},
          {value: 2, label: "No"},
          {value: 3, label: "En Curso"}
        ]
      };

      return (
        <OptionsToggle childProps={ childProps } />
      );
    }*/

    return (
      <div>
        <ToastContainer
          ref={ref => container = ref}
          className="toast-top-right"
        />
        <BootstrapTable ref='coursesTable' data={ this.state.students } options={ options }
                    headerStyle={ { background: '#f8f8f8' } } pagination={ true } search={ true } searchPlaceholder={'Buscar'}>
            <TableHeaderColumn dataField='studentID' hidden={ true } width='80' isKey={ true } headerAlign='center' dataAlign='center'>ID Alumno</TableHeaderColumn>
            <TableHeaderColumn dataField='name' dataSort={ true } headerAlign='center' dataAlign='center'>Nombre</TableHeaderColumn>
            <TableHeaderColumn dataField='studentNumber' dataSort={ true } width='180' headerAlign='center' dataAlign='center'>Padron</TableHeaderColumn>
            <TableHeaderColumn dataField='status' width='160' headerAlign='center' dataAlign='center'>Condición</TableHeaderColumn>
            <TableHeaderColumn dataField='grade' dataSort={ true } width='90' headerAlign='center' dataAlign='center'>Nota</TableHeaderColumn>
        </BootstrapTable>
      </div>
    );
  }
}