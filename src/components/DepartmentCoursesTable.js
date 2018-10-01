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
        courses: [],
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
    this.handleAddTeacher = this.handleAddTeacher.bind(this);
    this.loadCoursesForTeacher = this.loadCoursesForTeacher.bind(this);
    this.loadCourses = this.loadCourses.bind(this);
  }

  async componentDidMount() {
    this.setState({loaderMsg: 'No hay datos disponibles.'});
    const setLoaderMsg = mLoaderMsg => this.setState({ loaderMsg: mLoaderMsg });
    
    //ARGERICH
    //const authTokenArgerich = 'eyJhbGciOiJIUzI1NiJ9.eyJkYXRhIjp7ImlkIjo1fSwiZXhwIjoxNTQzNjA1ODg0fQ.vYf2ZbJumUyTNcEtL-b5A2dWS03i6RYRL-EZWZ7VmOs';
    //FONTELA
    //const authTokenFontela = 'eyJhbGciOiJIUzI1NiJ9.eyJkYXRhIjp7ImlkIjo0fSwiZXhwIjoxNTQzNjA1ODY5fQ.pr8t3BjjIXttgRXSZWGcrN8iFpxPmVzD-6E1JIry44I';

    //this.loadCoursesForTeacher(authTokenArgerich);
    //this.loadCoursesForTeacher(authTokenFontela);

    this.loadCourses();


    if (this.state.courses.length === 0) {
      setLoaderMsg("No hay datos disponibles.");
    }
  }

  async loadCourses() {
    const errorToastr = message => this.displayErrorToastr(message);
    const setLoaderMsg = mLoaderMsg => this.setState({ loaderMsg: mLoaderMsg });
    const setCourses = mCourses => this.setState({courses: mCourses});

    await axios({
      method:'get',
      url: API_URI + '/departments/me/courses',
      headers: {'Authorization': 'eyJhbGciOiJIUzI1NiJ9.eyJkYXRhIjp7ImlkIjoyfSwiZXhwIjoxNTQzNjA1NjI2fQ.BJBTtcwN6-s_vT3zVz_NFBykRr8ZhrtkRSRAn_2bNmo'}
      })
        .then(function(response) {
          console.log(response);

          let mCourses = [];
    
          response.data.forEach(subject => {
            subject.courses.forEach(course => {
              let mCourse = {
                id: course.id,
                courseID: course.name,
                subject: subject.name,
                teachers: course.teachers,
                subjectID: subject.id
              }

              mCourses.push(mCourse);
            })
          });

          setCourses(mCourses);
        })
        .catch(function (error) {
          console.log(error);
          errorToastr("No se pudieron cargar los datos.");
          setLoaderMsg("No se pudieron cargar los datos.");
        });
  }

  async loadCoursesForTeacher(authToken) {
    const errorToastr = message => this.displayErrorToastr(message);
    const setLoaderMsg = mLoaderMsg => this.setState({ loaderMsg: mLoaderMsg });
    const setCourses = mCourses => {
      let updatedCourses = this.state.courses;
      mCourses.forEach(course => {
        if (this.state.courses.every(currentCourse => currentCourse.id !== course.id)) {
          updatedCourses.push(course);
        }  
      });
      this.setState({ courses: updatedCourses });
    };

    await axios({
      method:'get',
      url: API_URI + '/teachers/me/courses',
      headers: {'Authorization': authToken}
      })
        .then(function(response) {
          console.log(response);

          let mCourses = [];
    
          response.data.forEach(course => {
            let mCourse = {
              id: course.id,
              courseID: course.name,
              subject: course.subject.name,
              teachers: course.teachers,
              subjectID: course.subject.id
            }

            if (course.lesson_schedules.length > 0) {
              let mSchedule = '';
              let mLocation = '';
              let mClassroom = '';
              
              course.lesson_schedules.forEach(lessonSchedule => {
                let mStartHour = lessonSchedule.hour_start.split('T')[1].substr(0,5);
                let mEndHour = lessonSchedule.hour_end.split('T')[1].substr(0,5);

                mSchedule = mSchedule + lessonSchedule.day + ' ' + mStartHour + ' - ' + mEndHour;
                mLocation = mLocation + lessonSchedule.classroom.building.name + '\n';
                mClassroom = mClassroom + lessonSchedule.classroom.floor + lessonSchedule.classroom.number + '\n';

                mSchedule = mSchedule + '\n';
              });

              mCourse.schedule = mSchedule;
              mCourse.location = mLocation;
              mCourse.classroom = mClassroom;
            } else {
              mCourse.schedule = '';
            }
            
            mCourses.push(mCourse);
          });

          setCourses(mCourses);
        })
        .catch(function (error) {
          console.log(error);
          errorToastr("No se pudieron cargar los datos.");
          setLoaderMsg("No se pudieron cargar los datos.");
        });
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
    /*this.setState({ 
        showCourseModal: true,
        courseModalProps: {
            mode: 'edit',
            handleClose: this.handleCourseModalClose,
            courseInfo: row
        }
    });*/
    this.displayErrorToastr("Funcionalidad habilitada proximamente.");
  }

  handleDeleteClick(cell, row) {
    this.displayErrorToastr("Funcionalidad habilitada proximamente.");
  }

  addNewCourse(course) {
    //ASD
  }

  handleNewCourseClick() {
    /*this.setState({ 
        showCourseModal: true,
        courseModalProps: {
            mode: 'new',
            handleClose: this.handleCourseModalClose,
            addNewCourse: this.addNewCourse
        } 
    });*/
    this.displayErrorToastr("Funcionalidad habilitada proximamente.");
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
            handleClose: this.handleTeachersModalClose,
            handleAddTeacher: this.handleAddTeacher,
            teachers: row.teachers,
            displayErrorToastr: this.displayErrorToastr,
            courseInfo: row
        } 
    });
  }

  async handleAddTeacher(teacher, courseID, subjectID) {
    const errorToastr = message => this.displayErrorToastr(message);

    //DEPTO INFORMATICA
    const staffToken = 'eyJhbGciOiJIUzI1NiJ9.eyJkYXRhIjp7ImlkIjoyfSwiZXhwIjoxNTQzNjA1NjI2fQ.BJBTtcwN6-s_vT3zVz_NFBykRr8ZhrtkRSRAn_2bNmo';

    const teacherCourse = {
      teacher_id: teacher.id,
      teaching_position: teacher.position
    };

    await axios({
      method:'post',
      data: {
          teacher_course: teacherCourse
      },
      url: API_URI + "/departments/me/subjects/" + subjectID + "/courses/" + courseID + "/teachers",
      headers: {'Authorization': staffToken}
      })
        .then(function(response) {
          console.log(response);
        })
        .catch(function (error) {
          console.log(error);
          errorToastr("No se pudieron cargar los datos.");
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
    } else if (this.state.showTeachersModal) {
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
        },
        sizePerPageList: [ {
          text: '2', value: 2
        }, {
          text: '10', value: 10
        }, {
          text: 'Todos', value: this.state.courses.length
        } ], // you can change the dropdown list for size per page
        sizePerPage: 10
    };

    function buttonFormatter(cell, row){
      return (
        <div>
            <Button className="action-button" onClick={() => handleEditClick(cell,row)}>
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

        teacherLastName = teacher.last_name;

        teacherNames = teacherNames + teacherLastName + ', ';
      });

      teacherNames = teacherNames.substr(0, teacherNames.length - 2);

      return (
        <div className="teacher-flex-aux">
          <div className="teacher-flex-aux-item">{teacherNames}</div>
          <Button className="teacher-flex-aux-item teacher-more-btn" onClick={() => handleTeachersMoreInfoClick(row)}>
              <Glyphicon glyph="user" /> Ver
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
                        headerStyle={ { background: '#f8f8f8' } } pagination={ true } search={ true } searchPlaceholder={'Buscar'}>
                <TableHeaderColumn dataField='id' hidden={ true }>ID</TableHeaderColumn>
                <TableHeaderColumn dataField='courseID' width='80' isKey={ true } headerAlign='center' dataAlign='center'>ID</TableHeaderColumn>
                <TableHeaderColumn dataField='subject' headerAlign='center' dataAlign='center' tdStyle={ { whiteSpace: 'normal' } }>Materia</TableHeaderColumn>
                <TableHeaderColumn dataField='schedule' width='180' headerAlign='center' dataAlign='center' tdStyle={ { whiteSpace: 'normal' } }>Horario</TableHeaderColumn>
                <TableHeaderColumn dataField='location' width='55' headerAlign='center' dataAlign='center' tdStyle={ { whiteSpace: 'normal' } }>Sede</TableHeaderColumn>
                <TableHeaderColumn dataField='classroom' width='60' headerAlign='center' dataAlign='center' tdStyle={ { whiteSpace: 'normal' } }>Aula</TableHeaderColumn>
                <TableHeaderColumn dataField='teachers' width='280' headerAlign='center' dataAlign='center' tdStyle={ { whiteSpace: 'normal' } } dataFormat={teachersFormatter}>Docentes</TableHeaderColumn>
                <TableHeaderColumn dataField="buttons" width='130' headerAlign='center' dataAlign='center' dataFormat={buttonFormatter}>Acciones</TableHeaderColumn>
                <TableHeaderColumn dataField='subjectID' hidden={ true }>ID Materia</TableHeaderColumn>
            </BootstrapTable>
        </div>
    );
  }
}