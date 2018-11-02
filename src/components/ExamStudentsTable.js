import React, { Component } from "react";
import { Redirect } from 'react-router-dom';
import {BootstrapTable, TableHeaderColumn, ExportCSVButton} from 'react-bootstrap-table';
import axios from 'axios'
import {Glyphicon, Button} from 'react-bootstrap';
import moment from 'moment';
import { ToastContainer } from "react-toastr";
import "./Toastr.css";
import API_URI from "../config/GeneralConfig.js";
import OptionsToggle from "./OptionsToggle";
import SetGradeModal from "./SetGradeModal";

const FileDownload = require('js-file-download');

let container;
 
export default class ExamStudentsTable extends Component {

  constructor(props) {
    super(props);
    
    this.state = {
        students: [],
        loaderMsg: 'Cargando la informacion...',
        redirect: false,
        redirectTo: '',
        setGradeModal: ''
    };

    this.URL = {
      "Admin": {
        students: "/departments/" + this.props.childProps.departmentID + "/courses/" + this.props.childProps.courseID + "/exams/" + this.props.childProps.examID + "/student_exams",
        export: "/departments/" + this.props.childProps.departmentID + "/courses/" + this.props.childProps.courseID + "/exams/" + this.props.childProps.examID + "/student_exams/csv_format"
      },
      "Teacher": {
        students: "/teachers/me/courses/" + this.props.childProps.courseID + "/exams/" + this.props.childProps.examID + "/student_exams",
        export: "/teachers/me/courses/" + this.props.childProps.courseID + "/exams/" + this.props.childProps.examID + "/student_exams/csv_format"
      }
    }

    this.displayErrorToastr = this.displayErrorToastr.bind(this);
    this.displaySuccessToastr = this.displaySuccessToastr.bind(this);
    this.loadStudents = this.loadStudents.bind(this);
    this.handleChangeExamApproval = this.handleChangeExamApproval.bind(this);
    this.handleStudentModalClose = this.handleStudentModalClose.bind(this);
    this.handleSetGrade = this.handleSetGrade.bind(this);
    this.exportStudentList = this.exportStudentList.bind(this);
  }

  async loadStudents() {
    const errorToastr = message => this.displayErrorToastr(message);
    const setLoaderMsg = mLoaderMsg => this.setState({ loaderMsg: mLoaderMsg });
    const setStudents = mStudents => this.setState({students: mStudents});

    await axios({
      method:'get',
      url: API_URI + this.URL[this.props.childProps.role].students,
      headers: {'Authorization': this.props.childProps.token}
      })
        .then(function(response) {
          console.log(response);

          let mStudents = [];

          const schoolTermMappings = {
            "first_semester": "1º",
            "second_semester": "2º",
            "summer_school": "Curso Verano"
          };

          response.data.forEach(studentExam => {
            let mStudent = {
              studentID: studentExam.student.id,
              name: studentExam.student.last_name + ', ' + studentExam.student.first_name,
              studentNumber: studentExam.student.school_document_number
            }

            if (studentExam.qualification === null) {
              mStudent.approvedExam = 3;
              mStudent.examGrade = "";
            } else if (studentExam.qualification > 4) {
              mStudent.approvedExam = 1;
              mStudent.examGrade = studentExam.qualification;
            } else {
              mStudent.approvedExam = 2;
              mStudent.examGrade = "";
            }

            if (studentExam.approved_school_term !== null) {
              mStudent.schoolTerm = schoolTermMappings[studentExam.approved_school_term.term] + " " + studentExam.approved_school_term.year;
            } else {
              mStudent.schoolTerm = "";
            }

            if (studentExam.condition === "regular") {
              mStudent.condition = "Regular";
              mStudent.partialGrade = studentExam.approved_course.partial_qualification;
            } else {
              mStudent.condition = "Libre";
              mStudent.partialGrade = "";
            }

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

  async exportStudentList(e) {
    e.preventDefault();

    const errorToastr = message => this.displayErrorToastr(message);
    const setLoaderMsg = mLoaderMsg => this.setState({ loaderMsg: mLoaderMsg });
    
    const filename = 'examen-de-' + this.props.childProps.examDate + '-' + this.props.childProps.subject + '-fecha-' + moment().format('DD-MM-YYYY') + '.csv';

    await axios({
      method:'get',
      url: API_URI + this.URL[this.props.childProps.role].export,
      headers: {'Authorization': this.props.childProps.token}
      })
        .then(function(response) {
          console.log(response);
          FileDownload(response.data, filename);
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

  displaySuccessToastr(message) {
    container.success(<div></div>, <em>{message}</em>, 
        {closeButton: true, timeOut: 3000}
      );
  }

  handleStudentModalClose() {
    this.setState({ setGradeModal: '' });
  }

  async handleSetGrade(grade, studentID) {
    /*const errorToastr = message => this.displayErrorToastr(message);

    const mEnrolment = {
      status: "approved",
      partial_qualification: grade
    };

    let mURL;

    if (this.props.childProps.role === "Admin") {
      mURL = "/departments/" + this.props.childProps.departmentID + "/courses/" + this.props.childProps.courseID + "/enrolments/" + studentID;
    } else {
      mURL = "/teachers/me/courses/" + this.props.childProps.courseID + "/enrolments/" + studentID;
    }

    await axios({
      method:'put',
      data: {
          enrolment: mEnrolment
      },
      url: API_URI + mURL,
      headers: {'Authorization': this.props.childProps.token}
      })
        .then(function(response) {
          console.log(response);
        })
        .catch(function (error) {
          console.log(error);
          errorToastr("No se pudo editar la información del alumno. Intente nuevamente.");
        });

    this.loadStudents();

    this.setState({ setGradeModal: '' });*/
  }

  async handleChangeExamApproval(e, row) {
    if (e === 1) {
      const modalProps = {
        handleClose: this.handleStudentModalClose,
        handleSetGrade: this.handleSetGrade,
        studentInfo: row
      }

      this.setState({ setGradeModal: <SetGradeModal modalProps={modalProps}/>});
    } else {
      const errorToastr = message => this.displayErrorToastr(message);
      const successToastr = message => this.displaySuccessToastr(message);

      let mGrades;

      if (e === 2) {
        mGrades = {
          qualification: 2,
          final_qualification: null
        };
      } else {
        mGrades = {
          qualification: null,
          final_qualification: null
        };
      }  

      let mURL;

      if (this.props.childProps.role === "Admin") {
        mURL = "/departments/" + this.props.childProps.departmentID + "/courses/" + this.props.childProps.courseID + "/exams/" + this.props.childProps.examID + "/student_exams/" + row.studentID;
      } else {
        mURL = "/teachers/me/courses/" + this.props.childProps.courseID + "/exams/" + this.props.childProps.examID + "/student_exams/" + row.studentID;
      }

      await axios({
        method:'patch',
        data: mGrades,
        url: API_URI + mURL,
        headers: {'Authorization': this.props.childProps.token}
        })
          .then(function(response) {
            console.log(response);
            successToastr("La operación se realizó con exito.");
          })
          .catch(function (error) {
            console.log(error);
            errorToastr("No se pudo editar la información del alumno. Intente nuevamente.");
          });

      this.loadStudents();
    }
  }

  render() {
    if (this.state.redirect) {
      return <Redirect push to={`${this.state.redirectTo}`} />;
    }

    const handleChangeExamApproval = (cell,row) => this.handleChangeExamApproval(cell,row);

    const customCSVBtn = (onClick) => {
      return (
        <ExportCSVButton
          btnText='Exportar Lista'
          btnContextual='btn-primary'
          btnGlyphicon='glyphicon-export'
          onClick={ e => this.exportStudentList(e) }/>
      );
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
        defaultSortName: 'studentID',
        defaultSortOrder: 'asc',
        exportCSVBtn: customCSVBtn
    };

    function approvedCheckboxFormatter(cell, row){
      const childProps = {
        valueProp: cell,
        handleChange: handleChangeExamApproval,
        row: row,
        options: [
          {value: 1, label: "Si"},
          {value: 2, label: "No"},
          {value: 3, label: "No Evaluado"}
        ]
      };

      return (
        <OptionsToggle childProps={ childProps } />
      );
    }

    return (
      <div>
        {this.state.setGradeModal}

        <ToastContainer
          ref={ref => container = ref}
          className="toast-top-right"
        />
        <BootstrapTable ref='coursesTable' data={ this.state.students } options={ options } exportCSV={ true }
                    headerStyle={ { background: '#f8f8f8' } } pagination={ true } search={ true } searchPlaceholder={'Buscar'}>
            <TableHeaderColumn dataField='studentID' hidden={ true } width='80' isKey={ true } headerAlign='center' dataAlign='center'>ID Alumno</TableHeaderColumn>
            <TableHeaderColumn dataField='name' dataSort={ true } headerAlign='center' dataAlign='center'>Nombre</TableHeaderColumn>
            <TableHeaderColumn dataField='studentNumber' dataSort={ true } width='120' headerAlign='center' dataAlign='center'>Padron</TableHeaderColumn>
            <TableHeaderColumn dataField='condition' width='130' headerAlign='center' dataAlign='center'>Condición</TableHeaderColumn>
            <TableHeaderColumn dataField='schoolTerm' width='130' headerAlign='center' dataAlign='center'>Cuatrimestre</TableHeaderColumn>
            <TableHeaderColumn dataField='partialGrade' dataSort={ true } width='90' headerAlign='center' dataAlign='center'>Cursada</TableHeaderColumn>
            <TableHeaderColumn dataField='approvedExam' width='210' headerAlign='center' dataAlign='center' dataFormat={(cell, row) => approvedCheckboxFormatter(cell, row)}>Examen</TableHeaderColumn>
            <TableHeaderColumn dataField='examGrade' dataSort={ true } width='90' headerAlign='center' dataAlign='center'>Nota Examen</TableHeaderColumn>
        </BootstrapTable>
      </div>
    );
  }
}