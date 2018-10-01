import React, { Component } from "react";
import {Modal, Button, Form, FormGroup, ControlLabel, FormControl, Table} from 'react-bootstrap';
import './TeachersModal.css';
import API_URI from "../config/GeneralConfig.js";
import axios from 'axios'

export default class TeachersModal extends Component {
    constructor(props, context) {
      super(props, context);
  
      this.positions = [
        {
          name: "Titular",
          mapping: "course_chief"
        },
        {
          name: "Jefe Trabajos Prácticos",
          mapping: "practice_chief"
        },
        {
          name: "Asistente Primero",
          mapping: "first_assistant"
        },
        {
          name: "Asistente Segundo",
          mapping: "second_assistant"
        }
      ];

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
        })
          .then(function(response) {
            console.log(response);

            setAvailableTeachers(response.data);
          })
          .catch(function (error) {
            console.log(error);
            errorToastr("No se pudieron cargar los datos.");
          });
    }

    handlePositionChange(e) {
      this.setState({ newTeacherPosition: e.target.value });
    }

    handleTeacherChange(e) {
      this.setState({ newTeacherID: parseInt(e.target.value) });
    }

    handleSubmitNewTeacher() {
      if (this.state.currentTeachers.every(teacher => teacher.id !== this.state.newTeacherID)) {
        let mCurrentTeachers = this.state.currentTeachers;
        mCurrentTeachers.push({
          id: this.state.newTeacherID,
          first_name: this.state.availableTeachers.find(teacher => teacher.id === this.state.newTeacherID).first_name,
          last_name: this.state.availableTeachers.find(teacher => teacher.id === this.state.newTeacherID).last_name,
          position: this.state.newTeacherPosition
        });
        this.setState({currentTeachers: mCurrentTeachers});
        this.props.childProps.handleAddTeacher({
          id: this.state.newTeacherID,
          position: this.state.newTeacherPosition
        }, this.props.childProps.courseInfo.id, this.props.childProps.courseInfo.subjectID);
      } else {
        this.props.childProps.displayErrorToastr("El docente ya esta asociado con este curso.");
      }
    }

  
    render() {
      var positionsList = this.positions.map(function(position) {
          return (
              <option key={position.name} value={position.mapping}>{position.name}</option>
          );
      });

      var teachersList = this.state.availableTeachers.map(function(teacher) {
          return (
              <option key={teacher.id} value={teacher.id}>{teacher.first_name + " " + teacher.last_name}</option>
          );
      });

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
                <Form className="teachers-modal-main-item" inline>
                  <FormGroup className="item-margin" controlId="formInlineName">
                    <ControlLabel className="form-label">Nombre</ControlLabel>{' '}
                    <FormControl 
                        componentClass="select" 
                        placeholder="Seleccione una posición"
                        onChange={this.handleTeacherChange} >
                            {teachersList}
                    </FormControl>
                  </FormGroup>{' '}
                  <FormGroup className="item-margin" controlId="formInlinePosition">
                    <ControlLabel className="form-label">Posición</ControlLabel>{' '}
                    <FormControl 
                        componentClass="select" 
                        placeholder="Seleccione una posición"
                        onChange={this.handlePositionChange} >
                            {positionsList}
                    </FormControl>
                  </FormGroup>{' '}
                  <Button className="item-margin" onClick={this.handleSubmitNewTeacher}>Asociar</Button>
                </Form>
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
                <Button onClick={this.props.childProps.handleClose}>Cerrar</Button>
            </Modal.Footer>
          </Modal>
        </div>
      );
    }
  }