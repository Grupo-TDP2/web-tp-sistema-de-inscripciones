import React, { Component } from "react";
import {Modal, Button, Table} from 'react-bootstrap';
import Select from 'react-select';
import './TeachersModal.css';
import API_URI from "../config/GeneralConfig.js";
import axios from 'axios'

export default class TeachersModal extends Component {
    constructor(props, context) {
      super(props, context);
  
      this.positions = [
        {
          label: "Titular",
          value: "course_chief"
        },
        {
          label: "Jefe Trabajos Prácticos",
          value: "practice_chief"
        },
        {
          label: "Asistente Primero",
          value: "first_assistant"
        },
        {
          label: "Asistente Segundo",
          value: "second_assistant"
        },
        {
          label: "Ayudante Ad-Honorem",
          value: "ad_honorem"
        }
      ];

      this.positionMappings = {
        'course_chief': 'Titular',
        'practice_chief': 'Jefe Trabajos Prácticos',
        'first_assistant': 'Asistente Primero',
        'second_assistant': 'Asistente Segundo',
        'ad_honorem': 'Ayudante Ad-Honorem'
      }

      this.state = {
        show: true,
        availableTeachers: [],
        currentTeachers: this.props.childProps.teachers,
        newTeacherPosition: "course_chief",
        newTeacherID: ''
      };

      this.handlePositionChange = this.handlePositionChange.bind(this);
      this.handleTeacherChange = this.handleTeacherChange.bind(this);
      this.handleSubmitNewTeacher = this.handleSubmitNewTeacher.bind(this);
    }

    async componentDidMount() {
      const errorToastr = message => this.props.childProps.displayErrorToastr(message);
      const setAvailableTeachers = mTeachers => this.setState({
        availableTeachers: mTeachers,
        newTeacherID: mTeachers[0].id
      });

      await axios({
        method:'get',
        url: API_URI + "/teachers",
        headers: {'Authorization': this.props.childProps.token}
        })
          .then(function(response) {
            console.log(response);

            let mAvailableTeachers = [];

            response.data.forEach(teacher => {
              let mTeacher = {
                value: teacher.id,
                label: teacher.first_name + " " + teacher.last_name
              }

              mAvailableTeachers.push(mTeacher);
            });

            setAvailableTeachers(mAvailableTeachers);
          })
          .catch(function (error) {
            console.log(error);
            errorToastr("No se pudieron cargar los datos.");
          });
    }

    handlePositionChange(e) {
      this.setState({ newTeacherPosition: e.value });
    }

    handleTeacherChange(e) {
      this.setState({ newTeacherID: parseInt(e.value, 10) });
    }

    handleSubmitNewTeacher() {
      if (this.state.currentTeachers.every(teacher => teacher.id !== this.state.newTeacherID)) {
        const teacherAddResponse = this.props.childProps.handleAddTeacher({
          id: this.state.newTeacherID,
          position: this.state.newTeacherPosition
        }, this.props.childProps.courseInfo.id, this.props.childProps.courseInfo.subjectID);
        
        if (teacherAddResponse === true) {
          let mCurrentTeachers = this.state.currentTeachers;
          mCurrentTeachers.push({
            id: this.state.newTeacherID,
            first_name: this.state.availableTeachers.find(teacher => teacher.value === this.state.newTeacherID).label.split(" ")[0],
            last_name: this.state.availableTeachers.find(teacher => teacher.value === this.state.newTeacherID).label.split(" ")[1],
            position: this.state.newTeacherPosition,
            positionMapped: this.positionMappings[this.state.newTeacherPosition]
          });
          this.setState({currentTeachers: mCurrentTeachers});
        }
      } else {
        this.props.childProps.displayErrorToastr("El docente ya esta asociado con este curso.");
      }
    }

  
    render() {

      var currentTeachersList = this.state.currentTeachers.map(function(teacher) {
          return (
            <tr key={teacher.id}>
              <td>{teacher.first_name + " " + teacher.last_name}</td>
              <td>{teacher.positionMapped}</td>
            </tr>
          );
      });

      return (
        <div>
          <Modal show={this.state.show} onHide={this.props.childProps.handleClose}>
            <Modal.Header closeButton>
               <Modal.Title className="modalTitle">
                    Docentes
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="teachers-modal-main-flex">
                <div className="teachers-modal-main-item sub-flex">
                  <p className="sub-flex-item">Nombre</p>
                  <Select
                    className="basic-single modal-select sub-flex-item"
                    classNamePrefix="select"
                    placeholder="Seleccione..."
                    onChange={this.handleTeacherChange}
                    defaultValue={""}
                    isSearchable={true}
                    name="name"
                    options={this.state.availableTeachers}
                  />
                  <p className="sub-flex-item">Posición</p>
                  <Select
                    className="basic-single modal-select sub-flex-item"
                    classNamePrefix="select"
                    placeholder="Seleccione..."
                    onChange={this.handlePositionChange}
                    defaultValue={""}
                    name="position"
                    options={this.positions}
                  />
                  <Button className="sub-flex-item" onClick={this.handleSubmitNewTeacher}>Asociar</Button>
                </div>
                <Table className="teachers-modal-main-item current-teachers-list" striped bordered condensed>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Posición</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTeachersList}
                  </tbody>
                </Table>
              </div>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={this.props.childProps.handleClose}>OK</Button>
            </Modal.Footer>
          </Modal>
        </div>
      );
    }
  }