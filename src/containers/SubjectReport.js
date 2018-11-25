import React, { Component } from "react";
import {Row, Col} from 'react-bootstrap';
import Select from 'react-select';
import API_URI from "../config/GeneralConfig.js";
import axios from 'axios';
import { ToastContainer } from "react-toastr";
import "../components/Toastr.css";
import PieChart from "../components/PieChart";
import ChartInfo from "../components/ChartInfo";

import "./SubjectReport.css";

let container;

function setChartColors(array) {
    return array.map(element => {
        const r = Math.floor(Math.random() * 200);
        const g = Math.floor(Math.random() * 200);
        const b = Math.floor(Math.random() * 200);

        const color = 'rgb(' + r + ', ' + g + ', ' + b + ', ';

        return {
            "background": color + '0.2)',
            "border": color + '1)',
            "hoverBackground": color + '0.4)',
            "hoverBorder": color + '1)'
        };  
    })
}

export default class PollReport extends Component {

  constructor(props) {
    super(props);

    this.state = {
        departmentList: [],
        departmentID: "",
        schoolTermList: [],
        schoolTermID: "",
        reportData: [],
        subjectInfo: {},
        subjectChartData: {},
        courseInfo: {}
    };

    if (!this.props.isAuthenticated) {
      this.props.history.push("/login") 
    }    

    this.displayErrorToastr = this.displayErrorToastr.bind(this);
    this.loadReport = this.loadReport.bind(this);
    this.handleTermChange = this.handleTermChange.bind(this);
    this.handleDepartmentChange = this.handleDepartmentChange.bind(this);
    this.handleSubjectClick = this.handleSubjectClick.bind(this);
    this.handleCourseClick = this.handleCourseClick.bind(this);
  }

  async componentDidMount() {
    const setDepartments = (mDepartments, mDepartmentID) => this.setState({ departmentList: mDepartments, departmentID: mDepartmentID });
    const setSchoolTerms = (mSchoolTerms, mSchoolTermID) => this.setState({ schoolTermList: mSchoolTerms, schoolTermID: mSchoolTermID });
    const errorToastr = message => this.displayErrorToastr(message);

    let mDepartmentID;
    let mSchoolTermID;

    if (this.props.role === "Admin") {
        await axios({
        method:'get',
        url: API_URI + '/departments',
        headers: {'Authorization': this.props.token}
        })
            .then(function(response) {
            console.log(response);

            let mDepartments = [];

            response.data.forEach(department => {
                mDepartments.push({
                label: department.name,
                value: department.id
                });
            });

            if (mDepartments.length > 0) {
                mDepartmentID = mDepartments[0].value;
            }

            setDepartments(mDepartments, mDepartmentID);
            })
            .catch(function (error) {
            console.log(error);
            errorToastr("No se pudieron cargar los datos.");
            });
    } else {
        mDepartmentID = this.props.departmentID;
        this.setState({ departmentID: mDepartmentID });
    }

    await axios({
        method:'get',
        url: API_URI + '/school_terms',
        headers: {'Authorization': this.props.token}
        })
            .then(function(response) {
            console.log(response);
    
            let mSchoolTerms = [];

            const termMapping = {
                "first_semester": "Primer Cuatrimestre",
                "second_semester": "Segundo Cuatrimestre",
                "summer_school": "Curso de Verano"
            };
    
            response.data.forEach(schoolTerm => {
                mSchoolTerms.push({
                label: termMapping[schoolTerm.term] + " " + schoolTerm.year,
                value: schoolTerm.id
                });
            });

            if (mSchoolTerms.length > 0) {
                mSchoolTermID = mSchoolTerms[0].value;
            }
    
            setSchoolTerms(mSchoolTerms, mSchoolTermID);
            })
            .catch(function (error) {
            console.log(error);
            errorToastr("No se pudieron cargar los datos.");
            });

    this.loadReport(mDepartmentID, mSchoolTermID);
  }

  async loadReport(departmentID, schoolTermID) {
    const errorToastr = message => this.displayErrorToastr(message);
    const setReportData = mReportData => this.setState({ reportData: mReportData, subjectInfo: {}, subjectChartData: {}, courseInfo: {} });

    await axios({
        method:'get',
        url: API_URI + "/reports/subject_enrolments?department_id=" + departmentID + "&school_term_id=" + schoolTermID,
        headers: {'Authorization': this.props.token}
        })
            .then(function(response) {
              console.log(response);
              setReportData(response.data);
            })
            .catch(function (error) {
              console.log(error);
              errorToastr("No se pudieron cargar los datos.");
            });
  }

  handleTermChange(e) {
    this.setState({ schoolTermID: e.value });

    this.loadReport(this.state.departmentID, e.value);
  }

  handleDepartmentChange(e) {
    this.setState({ departmentID: e.value });

    this.loadReport(e.value, this.state.schoolTermID);
  }

  displayErrorToastr(message) {
    container.error(<div></div>, <em>{message}</em>, 
        {closeButton: true, timeOut: 3000}
      );
  }

  handleSubjectClick(elems) {
    if (elems.length > 0) {
        const subject = this.state.reportData[elems[0]._index];

        const chartColors = setChartColors(subject.courses);

        this.setState({ 
            subjectChartData: {
                labels: subject.courses.map(course => course.course),
                datasets: [
                    {
                    label: "Inscriptos (Curso)",
                    backgroundColor: chartColors.map(color => color["background"]),
                    borderColor: chartColors.map(color => color["border"]),
                    borderWidth: 1,
                    hoverBackgroundColor: chartColors.map(color => color["hoverBackground"]),
                    hoverBorderColor: chartColors.map(color => color["hoverBorder"]),
                    data: subject.courses.map(course => course.enrolments)
                    }
                ]
            },
            subjectInfo: {
                name: subject.subject,
                enrolments: "Inscriptos: " + subject.enrolments,
                teachers: "Docentes: " + subject.teachers,
                coursesQuantity: "Cursos: " + subject.courses.length,
                courses: subject.courses
            },
            courseInfo: {}
        });
    }
  }

  handleCourseClick(elems) {
    if (elems.length > 0) {
        this.setState({ courseInfo: {
            course: this.state.subjectInfo.courses[elems[0]._index].course,
            enrolments: "Inscriptos: " + this.state.subjectInfo.courses[elems[0]._index].enrolments,
            teachersTitle: "Docentes: ",
            teachers: this.state.subjectInfo.courses[elems[0]._index].teachers
        }});
    }
  }

  render() {

    const chartColors = setChartColors(this.state.reportData);

    const mData = {
        labels: this.state.reportData.map(subject => subject.subject),
        datasets: [
            {
            label: "Inscriptos (Materia)",
            backgroundColor: chartColors.map(color => color["background"]),
            borderColor: chartColors.map(color => color["border"]),
            borderWidth: 1,
            hoverBackgroundColor: chartColors.map(color => color["hoverBackground"]),
            hoverBorderColor: chartColors.map(color => color["hoverBorder"]),
            data: this.state.reportData.map(subject => subject.enrolments)
            }
        ]
    };

    const chartProps = {
        chartData: mData,
        handleElementClick: this.handleSubjectClick
    };

    const subChartProps = {
        chartData: this.state.subjectChartData,
        handleElementClick: this.handleCourseClick
    };

    let courseTeacherList = <div />
    if (this.state.courseInfo.teachers !== undefined) {
        courseTeacherList = this.state.courseInfo.teachers.map(function(teacher) {
            return (
            <li key={teacher.id}>
                {teacher.first_name + " " + teacher.last_name}
            </li>
            );
        });
    }  

    const subjectInfoProps = {
        title: this.state.subjectInfo.name,
        elements: [
            <h5 key="1">{this.state.subjectInfo.enrolments}</h5>,
            <h5 key="2">{this.state.subjectInfo.teachers}</h5>,
            <h5 key="3">{this.state.subjectInfo.coursesQuantity}</h5>
        ]
    }

    const courseInfoProps = {
        title: this.state.courseInfo.course,
        elements: [
            <h5 key="1">{this.state.courseInfo.enrolments}</h5>,
            <h5 key="2">{this.state.courseInfo.teachersTitle}</h5>,
            <ul key="3">
                {courseTeacherList}
            </ul>
        ]
    };

    return (
      this.props.isAuthenticated &&
      <div>
        <ToastContainer
          ref={ref => container = ref}
          className="toast-top-right"
        />

        <Row>
            <Col xs={12} md={4}>
                <div className="titleFlex">
                    <h1 className="mainTitle">Reporte</h1>
                    <h3 className="subtitle">Materias / Cursos</h3>
                </div>
            </Col>
            <Col xs={12} md={4}>
                {this.props.role === "Admin"
                    ? <div className="selectFlex">
                        <p><strong>Departamento</strong></p>
                        <Select
                        classNamePrefix="select"
                        placeholder="Seleccione un departamento..."
                        noOptionsMessage={() => "No hay opciones."}
                        onChange={this.handleDepartmentChange}
                        name="name"
                        options={this.state.departmentList}
                        />
                    </div>
                    : <div />
                }
            </Col>
            <Col xs={12} md={4}>
                <div className="selectFlex">
                    <p><strong>Período Lectivo</strong></p>
                    <Select
                        classNamePrefix="select"
                        placeholder="Seleccione un período lectivo..."
                        noOptionsMessage={() => "No hay opciones."}
                        onChange={this.handleTermChange}
                        defaultValue={this.state.schoolTermList[this.state.schoolTermList.findIndex(schoolTerm => schoolTerm.value === this.state.schoolTermID)]}
                        name="name"
                        options={this.state.schoolTermList}
                    />
                </div>
            </Col>
        </Row>
        <br />
        <Row className="chartRow">
          <Col xs={12} md={4}>
            <PieChart chartProps={chartProps} />
          </Col>
          <Col xs={12} md={2}>
            {this.state.subjectInfo !== {}
            ? <ChartInfo infoProps={subjectInfoProps} />
            : <div />
            }
          </Col>
          <Col xs={12} md={4}>
            <PieChart chartProps={subChartProps} />
          </Col>
          <Col xs={12} md={2}>
            {this.state.courseInfo !== {}
            ? <ChartInfo infoProps={courseInfoProps} />
            : <div />
            }
          </Col>
        </Row>
      </div>
    );
  }
}
