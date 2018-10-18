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
        newDate: ''
    };

    this.customTitle = this.customTitle.bind(this);
    this.displayErrorToastr = this.displayErrorToastr.bind(this);
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
    this.handleGoBack = this.handleGoBack.bind(this);
    this.handleBuildingChange = this.handleBuildingChange.bind(this);
    this.handleClassroomChange = this.handleClassroomChange.bind(this);
    this.handleExamWeekChange = this.handleExamWeekChange.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
  }

  async componentDidMount() {
    const errorToastr = message => this.displayErrorToastr(message);
    const setLoaderMsg = mLoaderMsg => this.setState({ loaderMsg: mLoaderMsg });
    const setExams = mExams => this.setState({exams: mExams});
    const setClassrooms = mClassrooms => this.setState({availableClassrooms: mClassrooms});
    const setExamWeeks = mExamWeeks => this.setState({availableExamWeeks: mExamWeeks});

    await axios({
      method:'get',
      url: API_URI + '/teachers/me/courses/' + this.props.childProps.courseID + '/exams',
      headers: {'Authorization': this.props.childProps.token}
      })
        .then(function(response) {
          //console.log(response);

          if (response.data.length === 0) {
            setLoaderMsg("No hay datos disponibles.");
          }
          
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
    this.setState({ newExamWeekID: e.value });
  }

  handleDateChange(date) {
    this.setState({ newDate: date });
  }

  handleDeleteClick(cell, row) {
    this.displayErrorToastr("Funcion habilitada proximamente.")
  }

  handleGoBack() {
    this.setState({
        redirect: true,
        redirectTo: '/teacherCourses'
    });
  }

  render() {
    if (this.state.redirect) {
      return <Redirect push to={`${this.state.redirectTo}`} />;
    }

    const handleDeleteClick = (cell,row) => this.handleDeleteClick(cell,row);

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

    const filteredClassrooms = this.state.availableClassrooms.filter((classroom) => classroom.link === this.state.newBuilding );

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

    /*function customSortFunction(a, b, order) {   // order is desc or asc
      if (order === 'desc') {
        return a.name.split(' ')[1].localeCompare(b.name.split(' ')[1]);
      } else {
        return b.name.split(' ')[1].localeCompare(a.name.split(' ')[1]);
      }
    }*/

    return (
      <div>
        <Row>
          <Col xs={12} sm={3}>
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
          <Col xs={12} sm={3}>
            <p>Fecha</p>
            <DatePicker
                selected={this.state.newDate}
                onChange={this.handleDateChange}
            />
          </Col>
          <Col xs={12} sm={3}>
            <p>Hora</p>
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
          <Col xs={12} sm={2}>
            <Button className="sub-flex-item" onClick={this.handleSubmitNewTeacher}>Asociar</Button>
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
            <TableHeaderColumn dataField="button" width='140' headerAlign='center' dataAlign='center' dataFormat={buttonFormatter}></TableHeaderColumn>
        </BootstrapTable>
        <Button className="submitButton goBackBtn" onClick={this.handleGoBack}>
            <Glyphicon glyph="chevron-left" /> Volver a Mis Cursos
        </Button>
      </div>
    );
  }
}