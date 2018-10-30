import React, { Component } from "react";
import { Redirect } from 'react-router-dom';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import axios from 'axios'
import {Glyphicon, Button, ToggleButton, ToggleButtonGroup} from 'react-bootstrap';
import { ToastContainer } from "react-toastr";
import "./Toastr.css";
import "./CoursesTable.css";
import API_URI from "../config/GeneralConfig.js";
import OptionsToggle from "./OptionsToggle";
import Select from 'react-select';

let container;

export default class CoursesTable extends Component {

  constructor(props) {
    super(props);

    this.state = {
        courses: [],
        loaderMsg: 'Cargando la informacion...',
        redirect: false,
        redirectTo: '',
        toggles: [],
        teacherList: [],
        teacherID: ""
    };

    this.customTitle = this.customTitle.bind(this);
    this.displayErrorToastr = this.displayErrorToastr.bind(this);
    this.displaySuccessToastr = this.displaySuccessToastr.bind(this);
    this.handleStudentsClick = this.handleStudentsClick.bind(this);
    this.handleExamsClick = this.handleExamsClick.bind(this);
    this.handleAcceptFreeClick = this.handleAcceptFreeClick.bind(this);
    this.handleTeacherChange = this.handleTeacherChange.bind(this);
    this.loadCourses = this.loadCourses.bind(this);
  }

  async componentDidMount() {
    let mTeacherID = "me";

    const errorToastr = message => this.displayErrorToastr(message);
    const setLoaderMsg = mLoaderMsg => this.setState({ loaderMsg: mLoaderMsg });
    const setCourses = mCourses => this.setState({courses: mCourses});

    if (this.props.childProps.role === "Admin") {
      const setTeachers = (mTeachers, mTeacherID) => this.setState({ teacherList: mTeachers, teacherID: mTeacherID });
      const errorToastr = message => this.displayErrorToastr(message);

      await axios({
          method:'get',
          url: API_URI + '/teachers',
          headers: {'Authorization': this.props.childProps.token}
          })
            .then(function(response) {
              console.log(response);

              let mTeachers = [];

              if (response.data.length > 0) {
                mTeacherID = response.data[0].id;
              }

              response.data.forEach(teacher => {
                mTeachers.push({
                  label: teacher.first_name + " " + teacher.last_name,
                  value: teacher.id
                });
              });

              setTeachers(mTeachers, mTeacherID);
            })
            .catch(function (error) {
              console.log(error);
              errorToastr("No se pudieron cargar los datos.");
            });
      }

    this.loadCourses(mTeacherID);
  }

  async loadCourses(mTeacherID) {
    const errorToastr = message => this.displayErrorToastr(message);
    const setLoaderMsg = mLoaderMsg => this.setState({ loaderMsg: mLoaderMsg });
    const setCourses = mCourses => this.setState({courses: mCourses});
    
    await axios({
      method:'get',
      url: API_URI + '/teachers/' + mTeacherID + '/courses',
      headers: {'Authorization': this.props.childProps.token}
      })
        .then(function(response) {
          console.log(response);

          setLoaderMsg("No hay datos disponibles.");

          let mCourses = [];
    
          response.data.forEach(course => {
            let mCourse = {
              id: course.id,
              courseID: course.name,
              subject: course.subject.name,
              department: course.subject.department.id
            }

            if (course.accept_free_condition_exam === true) {
              mCourse.acceptFree = 1;
            } else {
              mCourse.acceptFree = 2;
            }

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

  displaySuccessToastr(message) {
    container.success(<div></div>, <em>{message}</em>, 
        {closeButton: true, timeOut: 3000}
      );
  }

  customTitle(cell, row, rowIndex, colIndex) {
    return `Doble click para editar`;
  }

  handleStudentsClick(cell, row) {
    this.setState({
      redirect: true,
      redirectTo: '/courseStudents/' + row.id + '/' + row.subject + '/' + row.department
    });
  }

  handleExamsClick(cell, row) {
    this.setState({
      redirect: true,
      redirectTo: '/courseExams/' + row.id + '/' + row.subject + '/' + row.department
    });
  }

  handleTeacherChange(e) {
    this.setState({ teacherID: e.value });

    this.loadCourses(e.value);
  }

  async handleAcceptFreeClick(e, row) {
    const errorToastr = message => this.displayErrorToastr(message);
    const successToastr = message => this.displaySuccessToastr(message);
    const getCourses = () => this.state.courses;
    const setCourses = mCourses => this.setState({ courses: mCourses });

    let mAcceptFree;

    if (e === 1) {
      mAcceptFree = true;
    } else {
      mAcceptFree = false;
    }

    let mURL;

    if (this.props.childProps.role === "Admin") {
      mURL = "/departments/" + row.department + "/courses/" + row.id;
    } else {
      mURL = '/teachers/me/courses/' + row.id;
    }

    await axios({
      method:'patch',
      data: {
        course: {
          accept_free_condition_exam: mAcceptFree
        }
      },
      url: API_URI + mURL,
      headers: {'Authorization': this.props.childProps.token}
      })
        .then(function(response) {
          console.log(response);

          let mCourses = getCourses();
          const courseIndex = mCourses.findIndex((course) => course.id === row.id);
          mCourses[courseIndex].acceptFree = e;
          setCourses(mCourses);

          successToastr("La operación se realizo con exito.");
        })
        .catch(function (error) {
          console.log(error);
          errorToastr("No se pudo realizar la operación. Intente nuevamente.");
        });
  }

  render() {
    if (this.state.redirect) {
      return <Redirect push to={`${this.state.redirectTo}`} />;
    }

    const handleStudentsClick = (cell,row) => this.handleStudentsClick(cell,row);
    const handleExamsClick = (cell,row) => this.handleExamsClick(cell,row);
    const handleAcceptFreeClick = (cell,row) => this.handleAcceptFreeClick(cell,row);

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

    function studentsButtonFormatter(cell, row){
      return (
        <Button className="submitButton" onClick={() => handleStudentsClick(cell,row)}>
            <Glyphicon glyph="education" />&nbsp;
        </Button>
      );
    }

    function examsButtonFormatter(cell, row){
      return (
        <Button className="submitButton" onClick={() => handleExamsClick(cell,row)}>
            <Glyphicon glyph="calendar" />&nbsp;
        </Button>
      );
    }

    function freeCheckboxFormatter(cell, row){
      const childProps = {
        valueProp: cell,
        handleChange: handleAcceptFreeClick,
        row: row,
        options: [
          {value: 1, label: "Si"},
          {value: 2, label: "No"}
        ]
      };

      return (
        <OptionsToggle childProps={ childProps } />
      );
    }

    let mTeacherName;
    if (this.state.teacherID !== '') {
      mTeacherName = ": " + this.state.teacherList.find(teacher => teacher.value === this.state.teacherID).label;
    } else {
      mTeacherName = "";
    }

    return (
      <div>
        <div className="flexParent">
          {this.props.childProps.role === 'Admin'
            ? <div>
                <h1>Cursos</h1>
                <h4><strong>Docente</strong>{mTeacherName}</h4>
              </div>
            : <div>
                <h1>Mis Cursos</h1>
              </div>
          }

          {this.props.childProps.role === 'Admin'
            ? <Select
                className="departmentSelect"
                classNamePrefix="select"
                placeholder="Seleccione un docente..."
                noOptionsMessage={() => "No hay opciones."}
                onChange={this.handleTeacherChange}
                name="name"
                options={this.state.teacherList}
              />
            : <div/>
          }
        </div>
        <ToastContainer
          ref={ref => container = ref}
          className="toast-top-right"
        />
        <BootstrapTable ref='coursesTable' data={ this.state.courses } options={ options }
                    headerStyle={ { background: '#f8f8f8' } } pagination={ true } search={ true } searchPlaceholder={'Buscar'}>
            <TableHeaderColumn dataField='id' hidden={ true }>ID</TableHeaderColumn>
            <TableHeaderColumn dataField='courseID' width='80' isKey={ true } headerAlign='center' dataAlign='center'>Curso</TableHeaderColumn>
            <TableHeaderColumn dataField='subject' headerAlign='center' dataAlign='center'>Materia</TableHeaderColumn>
            <TableHeaderColumn dataField='schedule' width='180' headerAlign='center' dataAlign='center' tdStyle={ { whiteSpace: 'normal' } }>Horario</TableHeaderColumn>
            <TableHeaderColumn dataField='location' width='55' headerAlign='center' dataAlign='center' tdStyle={ { whiteSpace: 'normal' } }>Sede</TableHeaderColumn>
            <TableHeaderColumn dataField='classroom' width='60' headerAlign='center' dataAlign='center' tdStyle={ { whiteSpace: 'normal' } }>Aula</TableHeaderColumn>
            <TableHeaderColumn dataField="students" width='100' headerAlign='center' dataAlign='center' dataFormat={studentsButtonFormatter}>Alumnos</TableHeaderColumn>
            <TableHeaderColumn dataField="exams" width='100' headerAlign='center' dataAlign='center' dataFormat={examsButtonFormatter}>Exámenes</TableHeaderColumn>
            <TableHeaderColumn dataField="acceptFree" width='100' headerAlign='center' dataAlign='center' dataFormat={(cell, row) => freeCheckboxFormatter(cell, row)}>Libres</TableHeaderColumn>
            <TableHeaderColumn dataField='department' hidden={ true }>Departamento</TableHeaderColumn>
        </BootstrapTable>
      </div>
    );
  }
}