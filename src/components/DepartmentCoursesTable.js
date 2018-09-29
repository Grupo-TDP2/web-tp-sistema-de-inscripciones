import React, { Component } from "react";
import { Redirect } from 'react-router-dom';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import axios from 'axios'
import {Glyphicon, Button} from 'react-bootstrap';
import { ToastContainer } from "react-toastr";
import "./Toastr.css";
import "./DepartmentCoursesTable.css";
import API_URI from "../config/GeneralConfig.js";
import CourseInfoModal from "./CourseInfoModal";
import TeachersModal from "./TeachersModal";

let container;

export default class DepartmentCoursesTable extends Component {

  constructor(props) {
    super(props);
    
    this.state = {
        courses: [
          {
            courseID: '508',
            subject: '75.12 Análisis Númerico I',
            schedule: 'Lunes 19.00 - 22.00\nJueves 19.00 - 22.00',
            location: 'Las Heras',
            classroom: '203',
            teachers: [
              {
                name: 'Gonzalo Merino',
                type: 'Titular'
              },
              {
                name: 'Leandro Masello',
                type: 'Ayudante TP'
              }
            ]
          },
          {
            courseID: '510',
            subject: '75.40 Introducción a los Sistemas Distribuidos',
            schedule: 'Martes 19.00 - 22.00\nMiercoles 19.00 - 22.00',
            location: 'Paseo Colon',
            classroom: '208',
            teachers: [
              {
                name: 'Gonzalo Merino',
                type: 'Titular'
              },
              {
                name: 'Tobias Bianchi',
                type: 'Colaborador'
              },
              {
                name: 'Leandro Masello',
                type: 'Ayudante TP'
              },
              {
                name: 'Juan Costamagna',
                type: 'Colaborador'
              }
            ]
          },
          {
            courseID: '614',
            subject: '75.40 Introducción a los Sistemas Distribuidos',
            schedule: '',
            location: 'Paseo Colon',
            classroom: '208',
            teachers: [
              {
                name: 'Gonzalo Merino',
                type: 'Titular'
              },
              {
                name: 'Leandro Masello',
                type: 'Ayudante TP'
              }
            ]
          },
          {
            courseID: '383',
            subject: '75.12 Análisis Númerico I',
            schedule: '',
            location: 'Paseo Colon',
            classroom: '208',
            teachers: []
          }
        ],
        loaderMsg: 'Cargando la informacion...',
        redirect: false,
        redirectTo: '',
        showCourseModal: false,
        courseModalProps: null,
        showTeachersModal: false,
        teachersModalProps: null
    };

    this.customTitle = this.customTitle.bind(this);
    this.displayErrorToastr = this.displayErrorToastr.bind(this);
    this.handleEditClick = this.handleEditClick.bind(this);
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
    this.handleNewCourseClick = this.handleNewCourseClick.bind(this);
    this.handleCourseModalClose = this.handleCourseModalClose.bind(this);
    this.handleTeachersModalClose = this.handleTeachersModalClose.bind(this);
    this.handleTeachersMoreInfoClick = this.handleTeachersMoreInfoClick.bind(this);
    this.addNewCourse = this.addNewCourse.bind(this);
    this.handleTeacherDeleteClick = this.handleTeacherDeleteClick.bind(this);
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

  handleEditClick(cell, row) {
    this.setState({ 
        showCourseModal: true,
        courseModalProps: {
            mode: 'edit',
            handleClose: this.handleCourseModalClose,
            courseInfo: row
        }
    });
  }

  handleDeleteClick(cell, row) {
    this.displayErrorToastr("Funcionalidad habilitada proximamente.")
  }

  addNewCourse(course) {
    //ASD
  }

  handleNewCourseClick() {
    this.setState({ 
        showCourseModal: true,
        courseModalProps: {
            mode: 'new',
            handleClose: this.handleCourseModalClose,
            addNewCourse: this.addNewCourse
        } 
    });
  }

  handleCourseModalClose() {
    this.setState({ 
        showCourseModal: false,
        courseModalProps: null
    });
  }

  handleTeachersMoreInfoClick(row) {
    this.setState({ 
      showTeachersModal: true,
      teachersModalProps: {
          handleClose: this.handleTeachersModalClose
      } 
  });
  }

  handleTeachersModalClose() {
    this.setState({ 
        showTeachersModal: false,
        teachersModalProps: null
    });
  }

  handleTeacherDeleteClick(row, teacherName) {
    console.log(row);
    console.log(teacherName);
  }

  render() {
    if (this.state.redirect) {
      return <Redirect push to={`${this.state.redirectTo}`} />;
    }

    let modal;

    if (this.state.showCourseModal) {
        modal = <CourseInfoModal childProps={this.state.courseModalProps} />;
    } else {
        modal = <div />
    }

    if (this.state.showTeachersModal) {
      modal = <TeachersModal childProps={this.state.teachersModalProps} />;
    } else {
      modal = <div />
    }

    const handleEditClick = (cell,row) => this.handleEditClick(cell,row);
    const handleDeleteClick = (cell,row) => this.handleDeleteClick(cell,row);
    const handleTeacherDeleteClick = (row, teacherName) => this.handleTeacherDeleteClick(row, teacherName);
    const handleTeachersMoreInfoClick = (row) => this.handleTeachersMoreInfoClick(row);

    const options = {
        noDataText: this.state.loaderMsg,
        beforeShowError: (type, msg) => {
          return false;
        }
    };

    function buttonFormatter(cell, row){
      return (
        <div>
            <Button className="action-button" bsStyle="primary" onClick={() => handleEditClick(cell,row)}>
                <Glyphicon glyph="pencil" />&nbsp;
            </Button>
            <Button className="action-button" bsStyle="danger" onClick={() => handleDeleteClick(cell,row)}>
                <Glyphicon glyph="trash" />&nbsp;
            </Button>
        </div>
      );
    }

    function teachersFormatter(cell, row) {
      /*var teacherItems = row.teachers.map(function(teacher) {
        return (
            <div className="teacher-flex" key={teacher.name}>
              <p className="teacher-flex-item teacher-name">{teacher.name + ' [' + teacher.type + '] '}</p>
              <Button className="teacher-flex-item teacher-btn" onClick={() => handleTeacherDeleteClick(row, teacher.name)}>
                  <Glyphicon glyph="remove" />&nbsp;
              </Button>
            </div>
        );
      });

      return (
        <div>{teacherItems}</div>
      );*/

      let teacherNames = "";

      row.teachers.forEach(teacher => {
        let teacherLastName;

        teacherLastName = teacher.name.split(' ')[1];

        teacherNames = teacherNames + teacherLastName + ', ';
      });

      teacherNames = teacherNames.substr(0, teacherNames.length - 2);

      return (
        <div className="teacher-flex-aux">
          <div className="teacher-flex-aux-item">{teacherNames}</div>
          <Button className="teacher-flex-aux-item teacher-more-btn" bsStyle="primary" onClick={() => handleTeachersMoreInfoClick(row)}>
              <Glyphicon glyph="eye-open" /> Ver
          </Button>
        </div>
      );
    }

    return (
        <div>
            {modal}

            <ToastContainer
            ref={ref => container = ref}
            className="toast-top-right"
            />
            <div className="flex-parent">
                <h1 className="table-title">Cursos</h1>

                <Button className="out-table-button" bsStyle="success" onClick={this.handleNewCourseClick}>
                    <Glyphicon glyph="plus" /> Nuevo Curso
                </Button>
            </div>

            <BootstrapTable ref='coursesTable' data={ this.state.courses } options={ options }
                        headerStyle={ { background: '#f8f8f8' } } pagination search={ true } searchPlaceholder={'Buscar'}>
                <TableHeaderColumn dataField='courseID' width='80' isKey={ true } headerAlign='center' dataAlign='center'>ID</TableHeaderColumn>
                <TableHeaderColumn dataField='subject' headerAlign='center' dataAlign='center' tdStyle={ { whiteSpace: 'normal' } }>Materia</TableHeaderColumn>
                <TableHeaderColumn dataField='schedule' width='180' headerAlign='center' dataAlign='center' tdStyle={ { whiteSpace: 'normal' } }>Horario</TableHeaderColumn>
                <TableHeaderColumn dataField='location' width='120' headerAlign='center' dataAlign='center'>Sede</TableHeaderColumn>
                <TableHeaderColumn dataField='classroom' width='80' headerAlign='center' dataAlign='center'>Aula</TableHeaderColumn>
                <TableHeaderColumn dataField='teachers' width='280' headerAlign='center' dataAlign='center' tdStyle={ { whiteSpace: 'normal' } } dataFormat={teachersFormatter}>Docentes</TableHeaderColumn>
                <TableHeaderColumn dataField="buttons" width='130' headerAlign='center' dataAlign='center' dataFormat={buttonFormatter}>Acciones</TableHeaderColumn>
            </BootstrapTable>
        </div>
    );
  }
}