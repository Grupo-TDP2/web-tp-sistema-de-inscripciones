import React, { Component } from "react";
import {Modal, Button, Glyphicon} from 'react-bootstrap';
import Select from 'react-select';
import API_URI from "../config/GeneralConfig.js";
import axios from 'axios';

import './EnrolmentModal.css';

export default class EnrolmentModal extends Component {
    constructor(props, context) {
      super(props, context);

      this.state = {
        show: true,
        availableStudents: [],
        newStudent: ""
      };

      this.handleStudentChange = this.handleStudentChange.bind(this);
    }

    async componentDidMount() {
      const errorToastr = message => this.props.childProps.displayErrorToastr(message);
      const setAvailableStudents = mStudents => this.setState({ availableStudents: mStudents });

      await axios({
        method:'get',
        url: API_URI + "/students",
        headers: {'Authorization': this.props.modalProps.token}
        })
          .then(function(response) {
            console.log(response);

            let mAvailableStudents = [];

            response.data.forEach(student => {
              let mStudent = {
                value: student.id,
                label: student.first_name + " " + student.last_name + " - " + student.school_document_number
              }

              mAvailableStudents.push(mStudent);
            });

            setAvailableStudents(mAvailableStudents);
          })
          .catch(function (error) {
            console.log(error);
            errorToastr("No se pudieron cargar los datos.");
          });
    }

    handleStudentChange(e) {
      this.setState({ newStudent: e.value });
    }
  
    render() {

      return (
        <div>
          <Modal show={this.state.show} onHide={this.props.modalProps.handleClose}>
            <Modal.Header closeButton>
               <Modal.Title className="modalTitle">
                    Inscribir Alumno
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="enrolmentModalFlex">
                  <p className="enrolmentModalFlexItem">Seleccione un alumno para inscribir:</p>
                  <Select
                    className="basic-single enrolmentModalFlexItem enrolmentModalSelect"
                    classNamePrefix="select"
                    placeholder="Seleccione..."
                    noOptionsMessage={() => "No hay opciones."}
                    onChange={this.handleStudentChange}
                    defaultValue={""}
                    isSearchable={true}
                    name="name"
                    options={this.state.availableStudents}
                  />
                </div>
            </Modal.Body>
            <Modal.Footer>
                <div className="enrolmentModalFooterFlex">
                    <Button bsStyle="success" onClick={() => this.props.modalProps.handleNewStudent(this.state.newStudent)}>
                        <Glyphicon glyph="edit" /> Inscribir
                    </Button>
                    <Button onClick={this.props.modalProps.handleClose}>Cancelar</Button>
                </div>
            </Modal.Footer>
          </Modal>
        </div>
      );
    }
  }