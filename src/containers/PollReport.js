import React, { Component } from "react";
import {Row, Col} from 'react-bootstrap';
import Select from 'react-select';
import API_URI from "../config/GeneralConfig.js";
import axios from 'axios';
import { ToastContainer } from "react-toastr";
import "../components/Toastr.css";
import HorizontalBarChart from "../components/HorizontalBarChart";
import CommentSection from "../components/CommentSection";

import "./PollReport.css";

let container;

export default class PollReport extends Component {

  constructor(props) {
    super(props);

    this.state = {
        departmentList: [],
        departmentID: "",
        schoolTermList: [],
        schoolTermID: "",
        polls: [],
        comments: []
    };

    if (!this.props.isAuthenticated) {
      this.props.history.push("/login") 
    }    

    this.displayErrorToastr = this.displayErrorToastr.bind(this);
    this.loadReport = this.loadReport.bind(this);
    this.handleTermChange = this.handleTermChange.bind(this);
    this.handleDepartmentChange = this.handleDepartmentChange.bind(this);
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
    const setPolls = mPolls => this.setState({ polls: mPolls, comments: [] });

    await axios({
        method:'get',
        url: API_URI + "/reports/polls?department_id=" + departmentID + "&school_term_id=" + schoolTermID,
        headers: {'Authorization': this.props.token}
        })
            .then(function(response) {
              console.log(response);
              setPolls(response.data);
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

  handleCourseClick(elems) {
    this.setState({ comments: this.state.polls.sort((a,b) => b.mean_rate - a.mean_rate)[elems[0]._index].comments });
  }

  render() {
    const chartColors = {
      "red": {
        "background": 'rgba(210,3,44,0.2)',
        "border": 'rgba(210,3,44,1)',
        "hoverBackground": 'rgba(210,3,44,0.4)',
        "hoverBorder": 'rgba(210,3,44,1)'
      },
      "yellow": {
        "background": 'rgba(207,210,3,0.2)',
        "border": 'rgba(207,210,3,1)',
        "hoverBackground": 'rgba(207,210,3,0.4)',
        "hoverBorder": 'rgba(207,210,3,1)'
      },
      "green": {
        "background": 'rgba(13,210,3,0.2)',
        "border": 'rgba(13,210,3,1)',
        "hoverBackground": 'rgba(13,210,3,0.4)',
        "hoverBorder": 'rgba(13,210,3,1)'
      }
    }

    const setColor = (meanRate, type) => {
      if (meanRate < 5) {
        return chartColors["red"][type];
      } else if (meanRate >= 5 && meanRate < 7) {
        return chartColors["yellow"][type];
      } else {
        return chartColors["green"][type];
      }
    };

    const mData = {
        labels: this.state.polls.sort((a,b) => b.mean_rate - a.mean_rate).map(poll => poll.course + " - " + poll.subject),
        datasets: [
            {
            label: "Puntuación promedio (Curso)",
            backgroundColor: this.state.polls.sort((a,b) => b.mean_rate - a.mean_rate).map(poll => setColor(poll.mean_rate, "background")),
            borderColor: this.state.polls.sort((a,b) => b.mean_rate - a.mean_rate).map(poll => setColor(poll.mean_rate, "border")),
            borderWidth: 1,
            hoverBackgroundColor: this.state.polls.sort((a,b) => b.mean_rate - a.mean_rate).map(poll => setColor(poll.mean_rate, "hoverBackground")),
            hoverBorderColor: this.state.polls.sort((a,b) => b.mean_rate - a.mean_rate).map(poll => setColor(poll.mean_rate, "hoverBorder")),
            data: this.state.polls.sort((a,b) => b.mean_rate - a.mean_rate).map(poll => poll.mean_rate)
            }
        ]
    };

    const barChartProps = {
      chartData: mData,
      handleCourseClick: this.handleCourseClick
    };

    const commentSectionProps = {
      comments: this.state.comments.map(commentElement => { 
        return {
          commentID: commentElement.poll_id,
          comment: commentElement.comment,
          date: commentElement.date
        }
      })
    }

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
                    <h3 className="subtitle">Encuestas</h3>
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
        <Row>
          <Col xs={12} md={7}>
            <HorizontalBarChart barChartProps={barChartProps} />
          </Col>
          <Col xs={12} md={5}>
            <CommentSection commentSectionProps={commentSectionProps} />
          </Col>
        </Row>
      </div>
    );
  }
}
