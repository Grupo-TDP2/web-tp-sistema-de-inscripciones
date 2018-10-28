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
import Select from 'react-select';

let container;

export default class DepartmentCoursesTable extends Component {

  constructor(props) {
    super(props);

    this.positions = {
      'course_chief': 'Titular',
      'practice_chief': 'Jefe Trabajos Prácticos',
      'first_assistant': 'Asistente Primero',
      'second_assistant': 'Asistente Segundo'
    }
    
    this.state = {
        courses: [],
        loaderMsg: 'Cargando la informacion...',
        redirect: false,
        redirectTo: '',
        showCourseModal: false,
        courseModalProps: null,
        showTeachersModal: false,
        teachersModalProps: null,
        getURL: "/departments/me/courses",
        departmentList: [],
        department: ""
    };

    this.displayErrorToastr = this.displayErrorToastr.bind(this);
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
    this.handleNewCourseClick = this.handleNewCourseClick.bind(this);
    this.handleCourseModalClose = this.handleCourseModalClose.bind(this);
    this.handleTeachersModalClose = this.handleTeachersModalClose.bind(this);
    this.handleTeachersMoreInfoClick = this.handleTeachersMoreInfoClick.bind(this);
    this.addNewCourse = this.addNewCourse.bind(this);
    this.handleAddTeacher = this.handleAddTeacher.bind(this);
    this.loadCourses = this.loadCourses.bind(this);
    this.handleDepartmentChange = this.handleDepartmentChange.bind(this);
  }

  async componentDidMount() {
    let mGetURL = this.state.getURL;

    if (this.props.childProps.role === "Admin") {
      const setDepartments = (mDepartments, mGetURL, mDepartmentID) => this.setState({ departmentList: mDepartments, getURL: mGetURL, department: mDepartmentID });
      const errorToastr = message => this.displayErrorToastr(message);

      await axios({
        method:'get',
        url: API_URI + '/departments',
        headers: {'Authorization': this.props.childProps.token}
        })
          .then(function(response) {
            console.log(response);

            let mDepartments = [];
            let mDepartmentID;

            if (response.data.length > 0) {
              mGetURL = "/departments/" + response.data[0].id + "/subjects";
              mDepartmentID = response.data[0].id;
            }

            response.data.forEach(department => {
              mDepartments.push({
                label: department.name,
                value: department.id
              });
            });

            setDepartments(mDepartments, mGetURL, mDepartmentID);
          })
          .catch(function (error) {
            console.log(error);
            errorToastr("No se pudieron cargar los datos.");
          });
    }

    this.loadCourses(mGetURL);

  }

  async loadCourses(newURL) {
    const errorToastr = message => this.displayErrorToastr(message);
    const setLoaderMsg = mLoaderMsg => this.setState({ loaderMsg: mLoaderMsg });
    const setCourses = mCourses => this.setState({courses: mCourses});
    const getPositionMappings = () => this.positions;
    const getRole = () => this.props.childProps.role;
    
    const mURL = API_URI + newURL;

    console.log(mURL);

    await axios({
      method:'get',
      url: mURL,
      headers: {'Authorization': this.props.childProps.token}
      })
        .then(function(response) {
          console.log(response);

          setLoaderMsg("No hay datos disponibles.");

          let mCourses = [];
    
          response.data.forEach(subject => {
            subject.courses.forEach(course => {
              let mCourse = {
                id: course.id,
                courseID: course.name,
                subject: subject.name,
                subjectID: subject.id
              }

              let mTeachers = [];

              course.teacher_courses.forEach(teacherCourse => {
                mTeachers.push({
                  position: teacherCourse.teaching_position,
                  id: teacherCourse.teacher.id,
                  first_name: teacherCourse.teacher.first_name,
                  last_name: teacherCourse.teacher.last_name,
                  positionMapped: getPositionMappings()[teacherCourse.teaching_position]
                })
              });

              mCourse.teachers = mTeachers;

              if (course.lesson_schedules.length > 0) {
                let mSchedule = '';
                let mLocation = '';
                let mClassroom = '';
                
                let mSchedules = [];

                course.lesson_schedules.forEach(schedule => {
                  mSchedules.push({
                    startHour: schedule.hour_start.split('T')[1].substr(0,5),
                    endHour: schedule.hour_end.split('T')[1].substr(0,5),
                    day: schedule.day,
                    location: schedule.classroom.building.name,
                    classroom: schedule.classroom.floor + schedule.classroom.number
                  });
                });

                const dayMappings = {
                  "Lunes": 1,
                  "Martes": 2,
                  "Miércoles": 3,
                  "Jueves": 4,
                  "Viernes": 5,
                  "Sábado": 6
                };

                mSchedules.sort((a,b) => {
                  if (dayMappings[a.day] !== dayMappings[b.day]) {
                    return dayMappings[a.day] - dayMappings[b.day];
                  } else {
                    return a.startHour.split(":")[0] - b.startHour.split(":")[0];
                  }
                });

                mSchedules.forEach(lessonSchedule => {
                  mSchedule = mSchedule + lessonSchedule.day + ' ' + lessonSchedule.startHour + ' - ' + lessonSchedule.endHour;
                  mLocation = mLocation + lessonSchedule.location + '\n';
                  mClassroom = mClassroom + lessonSchedule.classroom + '\n';
  
                  mSchedule = mSchedule + '\n';
                });
  
                mCourse.schedule = mSchedule;
                mCourse.location = mLocation;
                mCourse.classroom = mClassroom;
              } else {
                mCourse.schedule = '';
              }

              mCourses.push(mCourse);
            })
          });

          setLoaderMsg("No hay datos disponibles.");

          setCourses(mCourses);
        })
        .catch(function (error) {
          console.log(error);
          if (getRole() === "Admin") {
            setLoaderMsg("Elija un departamento para cargar los datos.");
          } else {
            errorToastr("No se pudieron cargar los datos.");
            setLoaderMsg("No se pudieron cargar los datos.");
          }
        });
  }

  displayErrorToastr(message) {
    container.error(<div></div>, <em>{message}</em>, 
        {closeButton: true, timeOut: 3000}
      );
  }

  async handleDeleteClick(cell, row) {
    const errorToastr = message => this.displayErrorToastr(message);
    const loadCourses = () => this.loadCourses(this.state.getURL);

    await axios({
      method:'delete',
      url: API_URI + "/departments/me/courses/" + row.id,
      headers: {'Authorization': this.props.childProps.token}
      })
        .then(function(response) {
          console.log(response);

          loadCourses();
        })
        .catch(function (error) {
          console.log(error);
          errorToastr("No se pudo eliminar el curso. Intente nuevamente.");
        });
  }

  async addNewCourse(course) {
    const errorToastr = message => this.displayErrorToastr(message);
    const loadCourses = () => this.loadCourses(this.state.getURL);
    const closeCourseModal = () => this.setState({ showCourseModal: false });

    let mDepartmentID;

    if (this.props.childProps.role === "Admin") {
      mDepartmentID = this.state.department;
    } else {
      mDepartmentID = "me";
    }

    await axios({
      method:'post',
      data: {
        name: course.name,
        vacancies: course.vacancies,
        subject_id: course.subject_id,
        school_term_id: course.school_term_id,
        lesson_schedules: course.lesson_schedules,
        teacher_courses: course.teacher_courses
      },
      url: API_URI + "/departments/" + mDepartmentID + "/courses",
      headers: {'Authorization': this.props.childProps.token}
      })
        .then(function(response) {
          console.log(response);

          closeCourseModal();

          loadCourses();
        })
        .catch(function (error) {
          console.log(error);
          errorToastr("No se pudo crear el curso. Intente nuevamente.");
        });
  }

  handleNewCourseClick() {
    this.setState({ 
        showCourseModal: true,
        courseModalProps: {
            mode: 'new',
            handleClose: this.handleCourseModalClose,
            addNewCourse: this.addNewCourse,
            displayErrorToastr: this.displayErrorToastr,
            token: this.props.childProps.token,
            role: this.props.childProps.role,
            departmentID: this.state.department
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
            handleClose: this.handleTeachersModalClose,
            handleAddTeacher: this.handleAddTeacher,
            teachers: row.teachers,
            displayErrorToastr: this.displayErrorToastr,
            courseInfo: row,
            token: this.props.childProps.token,
            role: this.props.childProps.role,
            departmentID: this.state.department
        } 
    });
  }

  async handleAddTeacher(teacher, courseID, subjectID) {
    const errorToastr = message => this.displayErrorToastr(message);

    let mURL;

    if (this.props.childProps.role === "Admin") {
      mURL = "/departments/" + this.state.department + "/courses/" + courseID + "/teachers";
    } else {
      mURL = "/departments/me/courses/" + courseID + "/teachers";
    }

    const teacherCourse = {
      teacher_id: teacher.id,
      teaching_position: teacher.position
    };

    let response = true;

    await axios({
      method:'post',
      data: {
          teacher_course: teacherCourse
      },
      url: API_URI + mURL,
      headers: {'Authorization': this.props.childProps.token}
      })
        .then(function(response) {
          console.log(response);
        })
        .catch(function (error) {
          console.log(error);
          response = false;
          if (error.toString().includes("422")) {
            errorToastr("El docente ya se encuentra asociado con otro curso de esta materia.");  
          } else {
            errorToastr("No se pudo asociar al docente. Intente nuevamente.");
          }
        });

    return response;
  }

  handleTeachersModalClose() {
    this.setState({ 
        showTeachersModal: false,
        teachersModalProps: null
    });
  }

  handleDepartmentChange(e) {
    this.setState({getURL: "/departments/" + e.value + "/subjects", department: e.value});

    this.loadCourses("/departments/" + e.value + "/subjects");
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

    const handleDeleteClick = (cell,row) => this.handleDeleteClick(cell,row);
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
        sizePerPage: 10,
        defaultSortName: 'id',  // default sort column name
        defaultSortOrder: 'asc'  // default sort order
    };

    function buttonFormatter(cell, row){
      return (
        <div>
            <Button className="action-button" bsStyle="danger" onClick={() => handleDeleteClick(cell,row)}>
                <Glyphicon glyph="trash" />&nbsp;
            </Button>
        </div>
      );
    }

    function teachersFormatter(cell, row) {
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
              <Glyphicon glyph="user" />
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

                {this.props.childProps.role === 'Admin'
                  ? <Select
                      className="department-select"
                      classNamePrefix="select"
                      placeholder="Seleccione un departamento..."
                      noOptionsMessage={() => "No hay opciones."}
                      onChange={this.handleDepartmentChange}
                      name="name"
                      options={this.state.departmentList}
                    />
                  : <div/>
                }
                
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