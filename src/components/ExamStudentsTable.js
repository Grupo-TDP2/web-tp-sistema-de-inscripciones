import React, { Component } from "react";
import { Redirect } from 'react-router-dom';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import axios from 'axios'
import {Glyphicon, Button} from 'react-bootstrap';
import { ToastContainer } from "react-toastr";
import "./Toastr.css";
import API_URI from "../config/GeneralConfig.js";
import OptionsToggle from "./OptionsToggle";
import SetGradeModal from "./SetGradeModal";

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

    this.displayErrorToastr = this.displayErrorToastr.bind(this);
    this.loadStudents = this.loadStudents.bind(this);
    this.handleChangeApproval = this.handleChangeApproval.bind(this);
    this.handleStudentModalClose = this.handleStudentModalClose.bind(this);
    this.handleSetGrade = this.handleSetGrade.bind(this);
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

          response.data.forEach(studentExam => {
            let mStudent = {
              studentID: studentExam.student.id,
              name: studentExam.student.last_name + ', ' + studentExam.student.first_name,
              studentNumber: studentExam.student.school_document_number,
              schoolTerm: '2º 2018', //Tomar del endpoint
              approved: 3, //Tomar del endpoint
              grade: studentExam.qualification
            }

            if (studentExam.condition === "regular") {
              mStudent.condition = "Regular";
            } else {
              mStudent.condition = "Libre";
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

  handleStudentModalClose() {
    //this.setState({ setGradeModal: '' });
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

  async handleChangeApproval(e, row) {
    /*if (e === 1) {
      const modalProps = {
        handleClose: this.handleStudentModalClose,
        handleSetGrade: this.handleSetGrade,
        studentInfo: row
      }

      this.setState({ setGradeModal: <SetGradeModal modalProps={modalProps}/>});
    } else {
      const errorToastr = message => this.displayErrorToastr(message);

      const mEnrolment = {
        partial_qualification: null
      };

      let mURL;

      if (this.props.childProps.role === "Admin") {
        mURL = "/departments/" + this.props.childProps.departmentID + "/courses/" + this.props.childProps.courseID + "/enrolments/" + row.studentID;
      } else {
        mURL = "/teachers/me/courses/" + this.props.childProps.courseID + "/enrolments/" + row.studentID;
      }

      if (e === 2) {
        mEnrolment.status = "disapproved";
      } else {
        mEnrolment.status = "not_evaluated";
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
    }*/
  }

  render() {
    if (this.state.redirect) {
      return <Redirect push to={`${this.state.redirectTo}`} />;
    }

    const handleChangeApproval = (cell,row) => this.handleChangeApproval(cell,row);

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

    function approvedCheckboxFormatter(cell, row){
      const childProps = {
        valueProp: cell,
        handleChange: handleChangeApproval,
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
        <BootstrapTable ref='coursesTable' data={ this.state.students } options={ options }
                    headerStyle={ { background: '#f8f8f8' } } pagination={ true } search={ true } searchPlaceholder={'Buscar'}>
            <TableHeaderColumn dataField='studentID' hidden={ true } width='80' isKey={ true } headerAlign='center' dataAlign='center'>ID Alumno</TableHeaderColumn>
            <TableHeaderColumn dataField='name' dataSort={ true } headerAlign='center' dataAlign='center'>Nombre</TableHeaderColumn>
            <TableHeaderColumn dataField='studentNumber' dataSort={ true } width='180' headerAlign='center' dataAlign='center'>Padron</TableHeaderColumn>
            <TableHeaderColumn dataField='condition' width='160' headerAlign='center' dataAlign='center'>Condición</TableHeaderColumn>
            <TableHeaderColumn dataField='schoolTerm' width='160' headerAlign='center' dataAlign='center'>Cuatrimestre</TableHeaderColumn>
            <TableHeaderColumn dataField='approved' width='210' headerAlign='center' dataAlign='center' dataFormat={(cell, row) => approvedCheckboxFormatter(cell, row)}>Aprobado</TableHeaderColumn>
            <TableHeaderColumn dataField='grade' dataSort={ true } width='90' headerAlign='center' dataAlign='center'>Nota</TableHeaderColumn>
        </BootstrapTable>
      </div>
    );
  }
}