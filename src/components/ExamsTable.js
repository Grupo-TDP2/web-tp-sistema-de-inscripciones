import React, { Component } from "react";
import { Redirect } from 'react-router-dom';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import axios from 'axios'
import {Glyphicon, Button} from 'react-bootstrap';
import { ToastContainer } from "react-toastr";
import "./Toastr.css";
import API_URI from "../config/GeneralConfig.js";
import './ExamsTable.css';

let container;
 
export default class StudentsTable extends Component {

  constructor(props) {
    super(props);
    
    this.state = {
        exams: [],
        loaderMsg: 'Cargando la informacion...',
        redirect: false,
        redirectTo: ''
    };

    this.customTitle = this.customTitle.bind(this);
    this.displayErrorToastr = this.displayErrorToastr.bind(this);
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
    this.handleGoBack = this.handleGoBack.bind(this);
  }

  async componentDidMount() {
    const errorToastr = message => this.displayErrorToastr(message);
    const setLoaderMsg = mLoaderMsg => this.setState({ loaderMsg: mLoaderMsg });
    const setExams = mExams => this.setState({exams: mExams});

    await axios({
      method:'get',
      url: API_URI + '/teachers/me/courses/' + this.props.childProps.courseID + '/exams',
      headers: {'Authorization': this.props.childProps.token}
      })
        .then(function(response) {
          console.log(response);

          if (response.data.length === 0) {
            setLoaderMsg("No hay datos disponibles.");
          }
          
          let mExams = [];

          response.data.forEach(exam => {
            let mDate = exam.date_time.split("T")[0].split("-");
            mDate = mDate[2] + "/" + mDate[1] + "/" + mDate[0];

            let mExam = {
              examID: exam.id,
              date: mDate,
              time: exam.date_time.split("T")[1].split(".")[0].substr(0,5),
              building: exam.classroom.building.name,
              classroom: exam.classroom.floor + exam.classroom.number
            }

            if (exam.course.accept_free_condition_exam === true) {
                mExam.free = "Si";
            } else {
                mExam.free = "No";
            }

            mExams.push(mExam);
          });

          setExams(mExams);
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

  handleDeleteClick(cell, row) {
    this.displayErrorToastr("Funcion habilitada proximamente.")
  }

  handleGoBack() {
    this.setState({
        redirect: true,
        redirectTo: '/teacherCourses'
    });
  }

  render() {
    if (this.state.redirect) {
      return <Redirect push to={`${this.state.redirectTo}`} />;
    }

    const handleDeleteClick = (cell,row) => this.handleDeleteClick(cell,row);
    const handleGoBack = (cell,row) => this.handleGoBack(cell,row);

    const options = {
        noDataText: this.state.loaderMsg,
        beforeShowError: (type, msg) => {
          return false;
        }
    };

    function buttonFormatter(cell, row){
      return (
        <Button className="submitButton" bsStyle="danger" onClick={() => handleDeleteClick(cell,row)}>
            <Glyphicon glyph="trash" />&nbsp;
        </Button>
      );
    }

    /*function customSortFunction(a, b, order) {   // order is desc or asc
      if (order === 'desc') {
        return a.name.split(' ')[1].localeCompare(b.name.split(' ')[1]);
      } else {
        return b.name.split(' ')[1].localeCompare(a.name.split(' ')[1]);
      }
    }*/

    return (
      <div>
        <ToastContainer
          ref={ref => container = ref}
          className="toast-top-right"
        />
        <BootstrapTable ref='examsTable' data={ this.state.exams } options={ options }
                    headerStyle={ { background: '#f8f8f8' } } search={ true } searchPlaceholder={'Buscar'}>
            <TableHeaderColumn dataField='examID' hidden={ true } width='80' isKey={ true } headerAlign='center' dataAlign='center'>ID Examen</TableHeaderColumn>
            <TableHeaderColumn dataField='date' headerAlign='center' dataAlign='center'>Fecha</TableHeaderColumn>
            <TableHeaderColumn dataField='time' width='180' headerAlign='center' dataAlign='center'>Hora</TableHeaderColumn>
            <TableHeaderColumn dataField='building' width='160' headerAlign='center' dataAlign='center'>Sede</TableHeaderColumn>
            <TableHeaderColumn dataField='classroom' width='160' headerAlign='center' dataAlign='center'>Aula</TableHeaderColumn>
            <TableHeaderColumn dataField="free" width='140' headerAlign='center' dataAlign='center'>Libres</TableHeaderColumn>
            <TableHeaderColumn dataField="button" width='140' headerAlign='center' dataAlign='center' dataFormat={buttonFormatter}></TableHeaderColumn>
        </BootstrapTable>
        <Button className="submitButton goBackBtn" onClick={this.handleGoBack}>
            <Glyphicon glyph="chevron-left" /> Volver a Mis Cursos
        </Button>
      </div>
    );
  }
}