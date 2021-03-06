import React, { Component, Fragment } from "react";
import { Redirect } from 'react-router-dom';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import axios from 'axios'
import {Glyphicon, Button} from 'react-bootstrap';
import { ToastContainer } from "react-toastr";
import "./Toastr.css";
import API_URI from "../config/GeneralConfig.js";
import SetGradeModal from "./SetGradeModal";
import OptionsToggle from "./OptionsToggle";
import ConfirmModal from './ConfirmModal';
import EnrolmentModal from './EnrolmentModal';

let container;
 
export default class StudentsTable extends Component {

  constructor(props) {
    super(props);
    
    this.state = {
        students: [],
        loaderMsg: 'Cargando la informacion...',
        redirect: false,
        redirectTo: '',
        modal: ''
    };

    this.customTitle = this.customTitle.bind(this);
    this.displayErrorToastr = this.displayErrorToastr.bind(this);
    this.displaySuccessToastr = this.displaySuccessToastr.bind(this);
    this.handleClickAcceptStudent = this.handleClickAcceptStudent.bind(this);
    this.handleAcceptStudent = this.handleAcceptStudent.bind(this);
    this.handleChangeApproval = this.handleChangeApproval.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
    this.handleSetGrade = this.handleSetGrade.bind(this);
    this.loadStudents = this.loadStudents.bind(this);
    this.customInsertButton = this.customInsertButton.bind(this);
    this.handleAddNewStudent = this.handleAddNewStudent.bind(this);
    this.handleClickNewStudent = this.handleClickNewStudent.bind(this);
  }

  async loadStudents() {
    const errorToastr = message => this.displayErrorToastr(message);
    const setLoaderMsg = mLoaderMsg => this.setState({ loaderMsg: mLoaderMsg });
    const setStudents = mStudents => this.setState({students: mStudents});

    await axios({
      method:'get',
      url: API_URI + '/teachers/me/courses/' + this.props.childProps.courseID + '/enrolments',
      headers: {'Authorization': this.props.childProps.token}
      })
        .then(function(response) {
          console.log(response);

          let mStudents = [];

          response.data.forEach(student => {
            let mStudent = {
              studentID: student.id,
              name: student.student.last_name + ', ' + student.student.first_name,
              studentNumber: student.student.school_document_number,
              grade: student.partial_qualification,
              finalGrade: student.final_qualification
            }

            if (student.type === 'normal') {
              mStudent.status = 'Regular';
            } else {
              mStudent.status = 'Condicional';
            }

            if (student.status === 'approved') {
              mStudent.approved = 1;
            } else if (student.status === 'not_evaluated') {
              mStudent.approved = 3;
            } else {
              mStudent.approved = 2;
            }

            if (student.exam_qualification !== null) {
              mStudent.examGrade = student.exam_qualification.qualification;
            } else {
              mStudent.examGrade = "";
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

  customTitle(cell, row, rowIndex, colIndex) {
    return `Doble click para editar`;
  }

  handleModalClose() {
    this.setState({ modal: '' });
  }

  async handleSetGrade(grade, studentID) {
    const errorToastr = message => this.displayErrorToastr(message);
    const successToastr = message => this.displaySuccessToastr(message);

    const mEnrolment = {
      status: "approved",
      partial_qualification: grade
    };

    let mURL;

    if (this.props.childProps.role === "Admin" || this.props.childProps.role === "DepartmentStaff") {
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
          successToastr("La operación se realizó con exito.");
        })
        .catch(function (error) {
          console.log(error);
          errorToastr("No se pudo editar la información del alumno. Intente nuevamente.");
        });

    this.loadStudents();

    this.setState({ modal: '' });
  }

  async handleChangeApproval(e, row) {
    if (e === 1) {
      const modalProps = {
        handleClose: this.handleModalClose,
        handleSetGrade: this.handleSetGrade,
        setFullGrade: false,
        currentGrade: null,
        currentFullGrade: null,
        studentInfo: row
      }

      this.setState({ modal: <SetGradeModal modalProps={modalProps}/>});
    } else {
      const errorToastr = message => this.displayErrorToastr(message);
      const successToastr = message => this.displaySuccessToastr(message);

      const mEnrolment = {
        partial_qualification: null
      };

      let mURL;

      if (this.props.childProps.role === "Admin" || this.props.childProps.role === "DepartmentStaff") {
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
            successToastr("La operación se realizó con exito.");
          })
          .catch(function (error) {
            console.log(error);
            errorToastr("No se pudo editar la información del alumno. Intente nuevamente.");
          });

      this.loadStudents();
    }
  }

  customInsertButton() {
    const handleClickNewStudent = () => this.handleClickNewStudent();
    return (
      <Button className="categories-table-button" bsStyle="success" onClick={handleClickNewStudent}>
        <Glyphicon glyph="edit" /> Inscribir Alumno
      </Button>
    );
  }

  async handleAddNewStudent(studentID) {
    const errorToastr = message => this.displayErrorToastr(message);
    const successToastr = message => this.displaySuccessToastr(message);
    const handleModalClose = () => this.handleModalClose();

    let mURL;

    if (this.props.childProps.role === "Admin" || this.props.childProps.role === "DepartmentStaff") {
      mURL = "/departments/" + this.props.childProps.departmentID + "/courses/" + this.props.childProps.courseID + "/enrolments";
    } else {
      mURL = "/teachers/me/courses/" + this.props.childProps.courseID + "/enrolments";
    }
    
    const mEnrolment = {
      enrolment: {
        student_id: studentID
      }
    }

    await axios({
      method:'post',
      data: mEnrolment,
      url: API_URI + mURL,
      headers: {'Authorization': this.props.childProps.token}
      })
        .then(function(response) {
          console.log(response);
          successToastr("La operación se realizó con éxito.");
          handleModalClose();
        })
        .catch(function (error) {
          console.log(error.response);
          if (error.response.data.error.length > 0 && error.response.data.error[0].startsWith("Student")) {
            errorToastr("El alumno ya se encuentra inscripto a este curso o a un curso de esta misma materia. Intente nuevamente.");  
          } else if (error.response.data.error.length > 0 && error.response.data.error[0].startsWith("Created at must be in the previous week")) {
            errorToastr("No se encuentra en un período válido para inscribir alumnos (una semana antes del comienzo de cursada). Vuelva a intentar en un período válido.");
          } else {
            errorToastr("Ocurrió un inconveniente al inscribir al alumno. Intente nuevamente.");
          }
        });

    this.loadStudents();
  }

  handleClickNewStudent() {
    const modalProps = {
      token: this.props.childProps.token,
      handleClose: this.handleModalClose,
      handleNewStudent: this.handleAddNewStudent
    };

    this.setState({ modal: <EnrolmentModal modalProps={modalProps}/> }); 
  }

  async handleAcceptStudent(row) {
    const errorToastr = message => this.displayErrorToastr(message);
    const successToastr = message => this.displaySuccessToastr(message);
    const handleModalClose = () => this.handleModalClose();

    let mURL;

    if (this.props.childProps.role === "Admin" || this.props.childProps.role === "DepartmentStaff") {
      mURL = "/departments/" + this.props.childProps.departmentID + "/courses/" + this.props.childProps.courseID + "/enrolments/" + row.studentID;
    } else {
      mURL = "/teachers/me/courses/" + this.props.childProps.courseID + "/enrolments/" + row.studentID;
    }
    
    const mEnrolment = {
      enrolment: {
        type: "normal"
      }
    }

    await axios({
      method:'put',
      data: mEnrolment,
      url: API_URI + mURL,
      headers: {'Authorization': this.props.childProps.token}
      })
        .then(function(response) {
          console.log(response);
          successToastr("La operación se realizó con éxito.");
          handleModalClose();
        })
        .catch(function (error) {
          console.log(error);
          errorToastr("No se pudo editar la información del alumno. Intente nuevamente.");
        });

    this.loadStudents();
  }

  handleClickAcceptStudent(cell, row) {
    const modalProps = {
      message: 'Estás seguro que deseas aceptar a ' + row.name + '? IMPORTANTE: Esta operación no se puede deshacer.',
      messageTitle: 'Aceptar Alumno?',
      type: 'confirmAccept',
      handleClose: this.handleModalClose,
      handleConfirmAction: () => this.handleAcceptStudent(row)
    };

    this.setState({ modal: <ConfirmModal modalProps={modalProps}/> }); 
  }

  render() {
    if (this.state.redirect) {
      return <Redirect push to={`${this.state.redirectTo}`} />;
    }

    const handleClickAcceptStudent = (cell,row) => this.handleClickAcceptStudent(cell,row);
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
        defaultSortOrder: 'asc',
        insertBtn: this.customInsertButton
    };

    function statusFormatter(cell, row){
      return (
        <div>
          <p>{cell}</p>
          {cell === "Condicional"
            ? <Button bsStyle="success" className="submitButton" onClick={() => handleClickAcceptStudent(cell,row)}>
                <Glyphicon glyph="ok" /> Aceptar
              </Button>
            : <Fragment />
          }
        </div>
      );
    }

    function approvedCheckboxFormatter(cell, row){
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
    }

    return (
      <div>
        {this.state.modal}

        <ToastContainer
          ref={ref => container = ref}
          className="toast-top-right"
        />
        <BootstrapTable ref='coursesTable' data={ this.state.students } options={ options } insertRow
                    headerStyle={ { background: '#f8f8f8' } } pagination={ true } search={ true } searchPlaceholder={'Buscar'}>
            <TableHeaderColumn dataField='studentID' hidden={ true } width='80' isKey={ true } headerAlign='center' dataAlign='center'>ID Alumno</TableHeaderColumn>
            <TableHeaderColumn dataField='name' dataSort={ true } headerAlign='center' dataAlign='center'>Nombre</TableHeaderColumn>
            <TableHeaderColumn dataField='studentNumber' dataSort={ true } width='100' headerAlign='center' dataAlign='center'>Padron</TableHeaderColumn>
            <TableHeaderColumn dataField='status' width='120' headerAlign='center' dataAlign='center' dataFormat={(cell, row) => statusFormatter(cell, row)}>Condición</TableHeaderColumn>
            <TableHeaderColumn dataField='approved' width='210' headerAlign='center' dataAlign='center' dataFormat={(cell, row) => approvedCheckboxFormatter(cell, row)}>Aprobado</TableHeaderColumn>
            <TableHeaderColumn dataField='grade' dataSort={ true } width='120' headerAlign='center' dataAlign='center'>Nota Cursada</TableHeaderColumn>
            <TableHeaderColumn dataField='examGrade' dataSort={ true } width='120' headerAlign='center' dataAlign='center'>Nota Examen</TableHeaderColumn>
            <TableHeaderColumn dataField='finalGrade' dataSort={ true } width='100' headerAlign='center' dataAlign='center'>Nota Cierre</TableHeaderColumn>
        </BootstrapTable>
      </div>
    );
  }
}