import React, { Component } from "react";
import { Redirect } from 'react-router-dom';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import axios from 'axios'
import {Glyphicon, Button, ToggleButton, ToggleButtonGroup} from 'react-bootstrap';
import { ToastContainer } from "react-toastr";
import "./Toastr.css";
import "./CoursesTable.css";
import API_URI from "../config/GeneralConfig.js";

let container;

export default class CoursesTable extends Component {

  constructor(props) {
    super(props);

    this.state = {
        courses: [],
        loaderMsg: 'Cargando la informacion...',
        redirect: false,
        redirectTo: '',
        toggles: []
    };

    this.customTitle = this.customTitle.bind(this);
    this.displayErrorToastr = this.displayErrorToastr.bind(this);
    this.displaySuccessToastr = this.displaySuccessToastr.bind(this);
    this.handleStudentsClick = this.handleStudentsClick.bind(this);
    this.handleExamsClick = this.handleExamsClick.bind(this);
    this.handleAcceptFreeClick = this.handleAcceptFreeClick.bind(this);
  }

  async componentDidMount() {
    const errorToastr = message => this.displayErrorToastr(message);
    const setLoaderMsg = mLoaderMsg => this.setState({ loaderMsg: mLoaderMsg });
    const setCourses = mCourses => this.setState({courses: mCourses});

    await axios({
      method:'get',
      url: API_URI + '/teachers/me/courses',
      headers: {'Authorization': this.props.childProps.token}
      })
        .then(function(response) {
          console.log(response);

          if (response.data.length === 0) {
            setLoaderMsg("No hay datos disponibles.");
          }

          let mCourses = [];
    
          response.data.forEach(course => {
            let mCourse = {
              id: course.id,
              courseID: course.name,
              subject: course.subject.name
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
      redirectTo: '/courseStudents/' + row.id + '/' + row.subject
    });
  }

  handleExamsClick(cell, row) {
    this.setState({
      redirect: true,
      redirectTo: '/courseExams/' + row.id + '/' + row.subject
    });
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

    await axios({
      method:'patch',
      data: {
        course: {
          accept_free_condition_exam: mAcceptFree
        }
      },
      url: API_URI + '/teachers/me/courses/' + row.id,
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
      return (
        <AcceptFreeToggle acceptFree={ cell } handleChange={handleAcceptFreeClick} row={ row } />
      );
    }

    return (
      <div>
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
        </BootstrapTable>
      </div>
    );
  }
}

class AcceptFreeToggle extends React.Component {
  render() {
    return (
      <ToggleButtonGroup 
        type="radio" 
        name="options"
        value={this.props.acceptFree}
        onChange={(e) => this.props.handleChange(e,this.props.row)}>
          <ToggleButton value={1}>Si</ToggleButton>
          <ToggleButton value={2}>No</ToggleButton>
      </ToggleButtonGroup>
    );
  }
}