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
import ConfirmModal from "./ConfirmModal";

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
        setGradeModal: '',
        confirmModal: ''
    };

    this.URL = {
      "Admin": {
        students: "/departments/" + this.props.childProps.departmentID + "/courses/" + this.props.childProps.courseID + "/exams/" + this.props.childProps.examID + "/student_exams",
        export: "/departments/" + this.props.childProps.departmentID + "/courses/" + this.props.childProps.courseID + "/exams/" + this.props.childProps.examID + "/student_exams/csv_format"
      },
      "DepartmentStaff": {
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
    this.handleModalClose = this.handleModalClose.bind(this);
    this.handleSetGrade = this.handleSetGrade.bind(this);
    this.exportStudentList = this.exportStudentList.bind(this);
    this.handleEditGrades = this.handleEditGrades.bind(this);
    this.sendGrades = this.sendGrades.bind(this);
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
              studentID: studentExam.id,
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
              if (studentExam.condition === "regular") {
                mStudent.examGrade = studentExam.qualification;
              } else {
                mStudent.examGrade = "";
              }
            }

            if (studentExam.approved_school_term !== null) {
              mStudent.schoolTerm = schoolTermMappings[studentExam.approved_school_term.term] + " " + studentExam.approved_school_term.year;
            } else {
              mStudent.schoolTerm = "";
            }

            if (studentExam.condition === "regular") {
              mStudent.condition = "Regular";
            } else {
              mStudent.condition = "Libre";
            }

            if (studentExam.approved_course !== null) {
              mStudent.partialGrade = studentExam.approved_course.partial_qualification;
              mStudent.fullGrade = studentExam.approved_course.final_qualification;
            } else {
              mStudent.partialGrade = "";
              mStudent.fullGrade = "";
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

  handleModalClose() {
    this.setState({ 
      setGradeModal: '',
      confirmModal: '' 
    });
  }

  handleSetGrade(examGrade, fullGrade, studentID) {
    this.sendGrades(examGrade, fullGrade, studentID);

    this.setState({ setGradeModal: '' });
  }

  async handleDisapproval(row) {
    let mQualification;
    let mFinalQualification;
    
    if (row.condition === "Libre") {
      mQualification = 2;
      mFinalQualification = 2;
    } else {
      mQualification = 2;
      mFinalQualification = null;
    }

    this.sendGrades(mQualification, mFinalQualification, row.studentID);

    this.setState({ confirmModal: '' });
  }

  async handleChangeExamApproval(e, row) {
    if (e === 1) {
      const modalProps = {
        handleClose: this.handleModalClose,
        handleSetGrade: this.handleSetGrade,
        setFullGrade: true,
        currentGrade: null,
        currentFullGrade: null,
        studentInfo: row
      }

      this.setState({ setGradeModal: <SetGradeModal modalProps={modalProps}/>});
    } else if (e === 2) {
      const modalProps = {
        message: 'Estás seguro que deseas desaprobar a ' + row.name + " (" + row.studentNumber + ")?",
        messageTitle: 'Desaprobar Alumno?',
        type: 'confirmDisapproval',
        handleClose: this.handleModalClose,
        handleConfirmAction: () => this.handleDisapproval(row)
      };
  
      this.setState({ confirmModal: <ConfirmModal modalProps={modalProps}/> });
    } else {
      this.sendGrades(null, null, row.studentID);
    }
  }

  async sendGrades(mQualification, mFinalQualification, studentID) {
    const errorToastr = message => this.displayErrorToastr(message);
    const successToastr = message => this.displaySuccessToastr(message);

    const mGrades = {
      qualification: mQualification,
      final_qualification: mFinalQualification
    };

    let mURL;

    if (this.props.childProps.role === "Admin" || this.props.childProps.role === "DepartmentStaff") {
      mURL = "/departments/" + this.props.childProps.departmentID + "/courses/" + this.props.childProps.courseID + "/exams/" + this.props.childProps.examID + "/student_exams/" + studentID;
    } else {
      mURL = "/teachers/me/courses/" + this.props.childProps.courseID + "/exams/" + this.props.childProps.examID + "/student_exams/" + studentID;
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

  handleEditGrades(cell, row) {
    const modalProps = {
      handleClose: this.handleModalClose,
      handleSetGrade: this.handleSetGrade,
      setFullGrade: true,
      currentGrade: row.examGrade,
      currentFullGrade: row.fullGrade,
      studentInfo: row
    }

    this.setState({ setGradeModal: <SetGradeModal modalProps={modalProps}/>});
  }

  render() {
    if (this.state.redirect) {
      return <Redirect push to={`${this.state.redirectTo}`} />;
    }

    const handleChangeExamApproval = (cell,row) => this.handleChangeExamApproval(cell,row);
    const handleEditGrades = (cell,row) => this.handleEditGrades(cell,row);

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

    function editGradesButtonFormatter(cell, row){
      return (
        <div>
            <Button disabled={row.approvedExam !== 1} className="action-button" onClick={() => handleEditGrades(cell,row)}>
                <Glyphicon glyph="pencil" />&nbsp;
            </Button>
        </div>
      );
    }

    return (
      <div>
        {this.state.setGradeModal}

        {this.state.confirmModal}

        <ToastContainer
          ref={ref => container = ref}
          className="toast-top-right"
        />
        <BootstrapTable ref='coursesTable' data={ this.state.students } options={ options } exportCSV={ true }
                    headerStyle={ { background: '#f8f8f8' } } pagination={ true } search={ true } searchPlaceholder={'Buscar'}>
            <TableHeaderColumn dataField='studentID' hidden={ true } width='80' isKey={ true } headerAlign='center' dataAlign='center'>ID Alumno</TableHeaderColumn>
            <TableHeaderColumn dataField='name' dataSort={ true } headerAlign='center' dataAlign='center'>Nombre</TableHeaderColumn>
            <TableHeaderColumn dataField='studentNumber' dataSort={ true } width='100' headerAlign='center' dataAlign='center'>Padron</TableHeaderColumn>
            <TableHeaderColumn dataField='condition' width='100' headerAlign='center' dataAlign='center'>Condición</TableHeaderColumn>
            <TableHeaderColumn dataField='schoolTerm' width='105' headerAlign='center' dataAlign='center'>Cuatrimestre</TableHeaderColumn>
            <TableHeaderColumn dataField='partialGrade' dataSort={ true } width='90' headerAlign='center' dataAlign='center'>Cursada</TableHeaderColumn>
            <TableHeaderColumn dataField='approvedExam' width='210' headerAlign='center' dataAlign='center' dataFormat={(cell, row) => approvedCheckboxFormatter(cell, row)}>Examen</TableHeaderColumn>
            <TableHeaderColumn dataField='examGrade' dataSort={ true } width='120' headerAlign='center' dataAlign='center'>Nota Examen</TableHeaderColumn>
            <TableHeaderColumn dataField='fullGrade' dataSort={ true } width='110' headerAlign='center' dataAlign='center'>Nota Cierre</TableHeaderColumn>
            <TableHeaderColumn dataField='actions' width='90' headerAlign='center' dataAlign='center' dataFormat={editGradesButtonFormatter}>Acciones</TableHeaderColumn>
        </BootstrapTable>
      </div>
    );
  }
}