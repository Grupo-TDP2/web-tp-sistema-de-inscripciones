import React, { Component } from "react";
import { Redirect } from 'react-router-dom';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import axios from 'axios'
import {Glyphicon, Button} from 'react-bootstrap';
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
        redirectTo: ''
    };

    this.customTitle = this.customTitle.bind(this);
    this.displayErrorToastr = this.displayErrorToastr.bind(this);
    this.handleClick = this.handleClick.bind(this);
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

  handleClick(cell, row) {
    this.setState({
      redirect: true,
      redirectTo: '/courseStudents/' + row.id + '/' + row.subject
    });
  }

  render() {
    if (this.state.redirect) {
      return <Redirect push to={`${this.state.redirectTo}`} />;
    }

    const handleClick = (cell,row) => this.handleClick(cell,row);

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
        <Button className="submitButton" onClick={() => handleClick(cell,row)}>
            <Glyphicon glyph="education" />&nbsp;
        </Button>
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
            <TableHeaderColumn dataField="button" width='100' headerAlign='center' dataAlign='center' dataFormat={buttonFormatter}>Alumnos</TableHeaderColumn>
        </BootstrapTable>
      </div>
    );
  }
}