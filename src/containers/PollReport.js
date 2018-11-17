import React, { Component } from "react";
import {Row, Col} from 'react-bootstrap';
import Select from 'react-select';
import API_URI from "../config/GeneralConfig.js";
import axios from 'axios';
import { ToastContainer } from "react-toastr";
import "../components/Toastr.css";

import "./PollReport.css";

let container;

export default class PollReport extends Component {

  constructor(props) {
    super(props);

    this.state = {
        departmentList: [],
        departmentID: "",
        schoolTermList: [],
        schoolTermID: ""
    };

    if (!this.props.isAuthenticated) {
      this.props.history.push("/login") 
    }    

    this.displayErrorToastr = this.displayErrorToastr.bind(this);
    this.loadReport = this.loadReport.bind(this);
    this.handleTermChange = this.handleTermChange.bind(this);
    this.handleDepartmentChange = this.handleDepartmentChange.bind(this);
  }

  async componentDidMount() {
    const setDepartments = (mDepartments, mDepartmentID) => this.setState({ departmentList: mDepartments, departmentID: mDepartmentID });
    const setSchoolTerms = (mSchoolTerms, mSchoolTermID) => this.setState({ schoolTermList: mSchoolTerms, schoolTermID: mSchoolTermID });
    const errorToastr = message => this.displayErrorToastr(message);

    let mDepartmentID;
    let mSchoolTermID;

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

    await axios({
        method:'get',
        url: API_URI + "/reports/polls?department_id=" + departmentID + "&school_term_id=" + schoolTermID,
        headers: {'Authorization': this.props.token}
        })
            .then(function(response) {
            console.log(response);
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

  render() {
    const childProps = {
      token: this.props.token,
      handleLogout: this.props.handleLogout
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
                    <h3 className="subtitle">Encuestas</h3>
                </div>
            </Col>
            <Col xs={12} md={4}>
                <div className="selectFlex">
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
            </Col>
            <Col xs={12} md={4}>
                <div className="selectFlex">
                    <p><strong>Período Lectivo</strong></p>
                    <Select
                        classNamePrefix="select"
                        placeholder="Seleccione un período lectivo..."
                        noOptionsMessage={() => "No hay opciones."}
                        onChange={this.handleTermChange}
                        defaultValue={this.state.schoolTermList.find(schoolTerm => schoolTerm.value === this.state.schoolTermID)}
                        name="name"
                        options={this.state.schoolTermList}
                    />
                </div>
            </Col>
        </Row>
      </div>
    );
  }
}
