import React, { Component } from "react";
import { Redirect } from 'react-router-dom';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import Select from 'react-select';
import axios from 'axios'
import {Glyphicon, Button, Row, Col} from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import { ToastContainer } from "react-toastr";
import "./Toastr.css";
import 'react-datepicker/dist/react-datepicker.css';
import API_URI from "../config/GeneralConfig.js";
import './ExamsTable.css';

let container;
 
export default class ExamsTable extends Component {

  constructor(props) {
    super(props);

    this.state = {
        exams: [],
        loaderMsg: 'Cargando la informacion...',
        redirect: false,
        redirectTo: '',
        availableClassrooms: [],
        availableExamWeeks: [],
        newBuilding: '',
        newClassroomID: '',
        newExamWeekID: '',
        newExamWeekDate: '',
        newDate: null,
        newHour: ''
    };

    this.customTitle = this.customTitle.bind(this);
    this.displayErrorToastr = this.displayErrorToastr.bind(this);
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
    this.handleGoBack = this.handleGoBack.bind(this);
    this.handleBuildingChange = this.handleBuildingChange.bind(this);
    this.handleClassroomChange = this.handleClassroomChange.bind(this);
    this.handleExamWeekChange = this.handleExamWeekChange.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleHourChange = this.handleHourChange.bind(this);
    this.addNewExamDate = this.addNewExamDate.bind(this);
    this.loadExamDates = this.loadExamDates.bind(this);
    this.handleShowExamStudents = this.handleShowExamStudents.bind(this);
  }

  async componentDidMount() {
    const errorToastr = message => this.displayErrorToastr(message);
    const setLoaderMsg = mLoaderMsg => this.setState({ loaderMsg: mLoaderMsg });
    const setClassrooms = mClassrooms => this.setState({availableClassrooms: mClassrooms});
    const setExamWeeks = mExamWeeks => this.setState({availableExamWeeks: mExamWeeks});

    this.loadExamDates();

    await axios({
      method:'get',
      url: API_URI + '/classrooms',
      headers: {'Authorization': this.props.childProps.token}
      })
        .then(function(response) {
          //console.log(response);

          let mClassrooms = [];

          response.data.forEach(classroom => {
            mClassrooms.push({
              label: classroom.floor + classroom.number,
              value: classroom.id,
              link: classroom.building.name
            });
          });

          setClassrooms(mClassrooms);
        })
        .catch(function (error) {
          console.log(error);
          errorToastr("No se pudieron cargar los datos.");
          setLoaderMsg("No se pudieron cargar los datos.");
        });

    await axios({
      method:'get',
      url: API_URI + '/final_exam_weeks',
      headers: {'Authorization': this.props.childProps.token}
      })
        .then(function(response) {
          console.log(response);

          let mExamWeeks = [];

          response.data.forEach(examWeek => {
            const splitStartDate = examWeek.date_start_week.split("-");
            mExamWeeks.push({
              label: splitStartDate[2] + "/" + splitStartDate[1] + "/" + splitStartDate[0],
              value: examWeek.id,
              date: examWeek.date_start_week
            });
          });

          mExamWeeks.sort((a,b) => Date.parse(a.date) - Date.parse(b.date));

          setExamWeeks(mExamWeeks);
        })
        .catch(function (error) {
          console.log(error);
          errorToastr("No se pudieron cargar los datos.");
          setLoaderMsg("No se pudieron cargar los datos.");
        });
  }

  async loadExamDates() {
    const errorToastr = message => this.displayErrorToastr(message);
    const setLoaderMsg = mLoaderMsg => this.setState({ loaderMsg: mLoaderMsg });
    const setExams = mExams => this.setState({exams: mExams});

    let mURL;

    if (this.props.childProps.role === "Admin") {
      mURL = "/departments/" + this.props.childProps.departmentID + "/courses/" + this.props.childProps.courseID + "/exams";
    } else {
      mURL = '/teachers/me/courses/' + this.props.childProps.courseID + '/exams';
    }

    await axios({
      method:'get',
      url: API_URI + mURL,
      headers: {'Authorization': this.props.childProps.token}
      })
        .then(function(response) {
          //console.log(response);

          setLoaderMsg("No hay datos disponibles.");
          
          let mExams = [];

          response.data.forEach(exam => {
            let mDate = exam.date_time.split("T")[0].split("-");
            mDate = mDate[2] + "/" + mDate[1] + "/" + mDate[0];

            let mExam = {
              examID: exam.id,
              date: mDate,
              time: exam.date_time.split("T")[1].split(".")[0].substr(0,5),
              building: exam.classroom.building.name,
              classroom: exam.classroom.floor + exam.classroom.number
            }

            if (exam.course.accept_free_condition_exam === true) {
                mExam.free = "Si";
            } else {
                mExam.free = "No";
            }

            mExams.push(mExam);
          });

          setExams(mExams);
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

  handleBuildingChange(e) {
    this.setState({ newBuilding: e.value });
  }

  handleClassroomChange(e) {
    this.setState({ newClassroomID: e.value });
  }

  handleExamWeekChange(e) {
    this.setState({ 
      newExamWeekID: e.value, 
      newExamWeekDate: e.date,
      newDate: moment(e.date)
    });
  }

  handleDateChange(date) {
    this.setState({ newDate: date });
  }

  handleHourChange(e) {
    this.setState({ newHour: e.value });
  }  

  async handleDeleteClick(cell, row) {
    const errorToastr = message => this.displayErrorToastr(message);

    let mURL;

    if (this.props.childProps.role === "Admin") {
      mURL = "/departments/" + this.props.childProps.departmentID + "/courses/" + this.props.childProps.courseID + "/exams/" + row.examID;
    } else {
      mURL = '/teachers/me/courses/' + this.props.childProps.courseID + '/exams/' + row.examID;
    }

    await axios({
      method:'delete',
      url: API_URI + mURL,
      headers: {'Authorization': this.props.childProps.token}
      })
        .then(function(response) {
          console.log(response);
        })
        .catch(function (error) {
          console.log(error);
          errorToastr("No se pudo eliminar la fecha de examen. Intente nuevamente.");
        });

    this.loadExamDates();
  }

  async addNewExamDate() {
    const errorToastr = message => this.displayErrorToastr(message);
    const loadExamDates = () => this.loadExamDates();

    const payload = {
      classroom_id: this.state.newClassroomID,
      final_exam_week_id: this.state.newExamWeekID,
      date_time: this.state.newDate.format('YYYY-MM-DD') + " " + this.state.newHour
    };

    let mURL;

    if (this.props.childProps.role === "Admin") {
      mURL = "/departments/" + this.props.childProps.departmentID + "/courses/" + this.props.childProps.courseID + "/exams";
    } else {
      mURL = '/teachers/me/courses/' + this.props.childProps.courseID + '/exams';
    }

    await axios({
      method:'post',
      data: {
          exam: payload
      },
      url: API_URI + "/teachers/me/courses/" + this.props.childProps.courseID + "/exams",
      headers: {'Authorization': this.props.childProps.token}
      })
        .then(function(response) {
          console.log(response);

          loadExamDates();
        })
        .catch(function (error) {
          console.log(error);
          if (error.toString().includes("422")) {
            errorToastr("Ya existe una fecha de examen esa semana.");  
          } else {
            errorToastr("No se pudo agregar la fecha de examen. Intente nuevamente.");
          }
        });
  }

  handleGoBack() {
    this.setState({
        redirect: true,
        redirectTo: '/teacherCourses'
    });
  }

  handleShowExamStudents(cell, row) {
    let mDateSplit = row.date.split('/');
    const mDate = mDateSplit[0] + '-' + mDateSplit[1] + '-' + mDateSplit[2];

    this.setState({
        redirect: true,
        redirectTo: '/examStudents/' + this.props.childProps.courseID + '/' + this.props.childProps.subject + '/' + this.props.childProps.departmentID + '/' + mDate + '/' + row.examID
    });
  }

  render() {
    if (this.state.redirect) {
      return <Redirect push to={`${this.state.redirectTo}`} />;
    }

    const handleDeleteClick = (cell,row) => this.handleDeleteClick(cell,row);
    const handleShowExamStudents = (cell,row) => this.handleShowExamStudents(cell,row);

    const availableBuildings = [
      {
        label: "Paseo Colon",
        value: "PC"
      },
      {
        label: "Las Heras",
        value: "LH"
      }
    ]

    const hoursList = [
        {value: "8:00", label: '8:00', day: ["Week","Saturday"]},
        {value: "8:30", label: '8:30', day: ["Week","Saturday"]},
        {value: "9:00", label: '9:00', day: ["Week","Saturday"]},
        {value: "9:30", label: '9:30', day: ["Week","Saturday"]},
        {value: "10:00", label: '10:00', day: ["Week","Saturday"]},
        {value: "10:30", label: '10:30', day: ["Week","Saturday"]},
        {value: "11:00", label: '11:00', day: ["Week","Saturday"]},
        {value: "11:30", label: '11:30', day: ["Week","Saturday"]},
        {value: "12:00", label: '12:00', day: ["Week","Saturday"]},
        {value: "12:30", label: '12:30', day: ["Week","Saturday"]},
        {value: "13:00", label: '13:00', day: ["Week"]},
        {value: "13:30", label: '13:30', day: ["Week"]},
        {value: "14:00", label: '14:00', day: ["Week"]},
        {value: "14:30", label: '14:30', day: ["Week"]},
        {value: "15:00", label: '15:00', day: ["Week"]},
        {value: "15:30", label: '15:30', day: ["Week"]},
        {value: "16:00", label: '16:00', day: ["Week"]},
        {value: "16:30", label: '16:30', day: ["Week"]},
        {value: "17:00", label: '17:00', day: ["Week"]},
        {value: "17:30", label: '17:30', day: ["Week"]},
        {value: "18:00", label: '18:00', day: ["Week"]},
        {value: "18:30", label: '18:30', day: ["Week"]},
        {value: "19:00", label: '19:00', day: ["Week"]},
        {value: "19:30", label: '19:30', day: ["Week"]},
        {value: "20:00", label: '20:00', day: ["Week"]},
        {value: "20:30", label: '20:30', day: ["Week"]}
    ];

    const filteredClassrooms = this.state.availableClassrooms.filter((classroom) => classroom.link === this.state.newBuilding );

    const filteredHours = hoursList.filter((hour) => {
      let mDay;

      if (this.state.newDate === null) {
        mDay = "null";
      } else if (this.state.newDate.day() === 6) {
        mDay = "Saturday";
      } else {
        mDay = "Week";
      }

      return hour.day.includes(mDay);
    });

    const options = {
        noDataText: this.state.loaderMsg,
        beforeShowError: (type, msg) => {
          return false;
        }
    };

    function buttonFormatter(cell, row){
      return (
        <Button className="submitButton" bsStyle="danger" onClick={() => handleDeleteClick(cell,row)}>
            <Glyphicon glyph="trash" />&nbsp;
        </Button>
      );
    }

    function studentsBtnFormatter(cell, row){
      return (
        <Button className="submitButton" onClick={() => handleShowExamStudents(cell,row)}>
            <Glyphicon glyph="education" />&nbsp;
        </Button>
      );
    }

    /*function customSortFunction(a, b, order) {   // order is desc or asc
      if (order === 'desc') {
        return a.name.split(' ')[1].localeCompare(b.name.split(' ')[1]);
      } else {
        return b.name.split(' ')[1].localeCompare(a.name.split(' ')[1]);
      }
    }*/

    return (
      <div>
        <Row className="addDateRow">
          <Col xs={12} sm={2}>
            <p>Semana</p>
            <Select
              classNamePrefix="select"
              placeholder="Seleccione..."
              noOptionsMessage={() => "No hay opciones."}
              onChange={this.handleExamWeekChange}
              defaultValue={""}
              name="name"
              options={this.state.availableExamWeeks}
            />
          </Col>
          <Col xs={12} sm={2}>
            <p>Fecha</p>
            <DatePicker
                dateFormat="DD/MM/YYYY"
                selected={this.state.newDate}
                onChange={this.handleDateChange}
                className="datepicker"
                placeholderText="Seleccione..."
                minDate={moment(this.state.newExamWeekDate)}
                maxDate={moment(this.state.newExamWeekDate).add(5, "days")}
                showDisabledMonthNavigation 
                disabled={this.state.newExamWeekID === ''}
            />
          </Col>
          <Col xs={12} sm={2}>
            <p>Hora</p>
            <Select
              classNamePrefix="select"
              placeholder="Seleccione..."
              noOptionsMessage={() => "No hay opciones."}
              onChange={this.handleHourChange}
              defaultValue={""}
              name="name"
              options={filteredHours}
            />
          </Col>
          <Col xs={12} sm={2}>
            <p>Sede</p>
            <Select
              classNamePrefix="select"
              placeholder="Seleccione..."
              noOptionsMessage={() => "No hay opciones."}
              onChange={this.handleBuildingChange}
              defaultValue={""}
              name="name"
              options={availableBuildings}
            />
          </Col>
          <Col xs={12} sm={2}>
            <p>Aula</p>
            <Select
              classNamePrefix="select"
              placeholder="Seleccione..."
              noOptionsMessage={() => "No hay opciones."}
              onChange={this.handleClassroomChange}
              defaultValue={""}
              isSearchable={true}
              name="name"
              options={filteredClassrooms}
            />
          </Col>
          <Col xs={12} sm={2} className="addDateButtonContainer">
            <Button className="flexCenterItem" bsStyle="success" onClick={this.addNewExamDate}
              disabled={this.state.newExamWeekID === '' || this.state.newDate === null || this.state.newHour === ''
                || this.state.newBuilding === '' || this.state.newClassroomID === ''}>
              <Glyphicon glyph="plus" />&nbsp;Nueva Fecha
            </Button>
          </Col>
        </Row>
        <ToastContainer
          ref={ref => container = ref}
          className="toast-top-right"
        />
        <BootstrapTable ref='examsTable' data={ this.state.exams } options={ options }
                    headerStyle={ { background: '#f8f8f8' } } search={ true } searchPlaceholder={'Buscar'}>
            <TableHeaderColumn dataField='examID' hidden={ true } width='80' isKey={ true } headerAlign='center' dataAlign='center'>ID Examen</TableHeaderColumn>
            <TableHeaderColumn dataField='date' headerAlign='center' dataAlign='center'>Fecha</TableHeaderColumn>
            <TableHeaderColumn dataField='time' width='180' headerAlign='center' dataAlign='center'>Hora</TableHeaderColumn>
            <TableHeaderColumn dataField='building' width='160' headerAlign='center' dataAlign='center'>Sede</TableHeaderColumn>
            <TableHeaderColumn dataField='classroom' width='160' headerAlign='center' dataAlign='center'>Aula</TableHeaderColumn>
            <TableHeaderColumn dataField="free" width='140' headerAlign='center' dataAlign='center'>Libres</TableHeaderColumn>
            <TableHeaderColumn dataField="students" width='140' headerAlign='center' dataAlign='center' dataFormat={studentsBtnFormatter}>Alumnos</TableHeaderColumn>
            <TableHeaderColumn dataField="button" width='140' headerAlign='center' dataAlign='center' dataFormat={buttonFormatter}>Acciones</TableHeaderColumn>
        </BootstrapTable>
        <Button className="submitButton goBackBtn" onClick={this.handleGoBack}>
            <Glyphicon glyph="chevron-left" /> Volver a Mis Cursos
        </Button>
      </div>
    );
  }
}