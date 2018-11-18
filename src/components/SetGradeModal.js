import React, { Component } from "react";
import {Modal, Button} from 'react-bootstrap';
import Select from 'react-select';
import './TeachersModal.css';
import './SetGradeModal.css';

export default class SetGradeModal extends Component {
    constructor(props, context) {
      super(props, context);

      this.state = {
        show: true,
        grade: this.props.modalProps.currentGrade,
        fullGrade: this.props.modalProps.currentFullGrade
      };

      this.handleGradeChange = this.handleGradeChange.bind(this);
      this.handleFullGradeChange = this.handleFullGradeChange.bind(this);
    }

    handleGradeChange(e) {
      this.setState({ grade: e.value });
    }

    handleFullGradeChange(e) {
      this.setState({ fullGrade: e.value });
    }
  
    render() {
      const possibleGrades = [
        {label: "4", value: 4},
        {label: "5", value: 5},
        {label: "6", value: 6},
        {label: "7", value: 7},
        {label: "8", value: 8},
        {label: "9", value: 9},
        {label: "10", value: 10},
      ];

      return (
        <div>
          <Modal show={this.state.show} onHide={this.props.modalProps.handleClose}>
            <Modal.Header closeButton>
               <Modal.Title className="modalTitle">
                    {this.props.modalProps.studentInfo.name + " - " + this.props.modalProps.studentInfo.studentNumber}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="teachers-modal-main-flex">
                    <div className="teachers-modal-main-item subFlex">
                        <p className="subFlexItem">Ingrese la nota del alumno:</p>
                        <Select
                            className="basic-single modal-select sub-flex-item"
                            classNamePrefix="select"
                            placeholder="Seleccione..."
                            defaultValue={possibleGrades[possibleGrades.findIndex(grade => grade.value === this.state.grade)]}
                            onChange={this.handleGradeChange}
                            name="grade"
                            options={possibleGrades}
                        />
                    </div>
                    {this.props.modalProps.setFullGrade || this.props.modalProps.currentFullGrade !== null
                      ? <div className="teachers-modal-main-item subFlex extra-grade">
                            <p className="subFlexItem">Ingrese la nota de cierre del alumno:</p>
                            <Select
                                className="basic-single modal-select sub-flex-item"
                                classNamePrefix="select"
                                placeholder="Seleccione..."
                                defaultValue={possibleGrades[possibleGrades.findIndex(grade => grade.value === this.state.fullGrade)]}
                                onChange={this.handleFullGradeChange}
                                name="grade"
                                options={possibleGrades}
                            />
                        </div>
                      : <div />
                    }
                </div>
            </Modal.Body>
            <Modal.Footer>
                <div className="footerFlex">
                    {this.props.modalProps.setFullGrade
                      ? <Button disabled={this.state.grade === null || this.state.fullGrade === null} onClick={() => this.props.modalProps.handleSetGrade(this.state.grade, this.state.fullGrade, this.props.modalProps.studentInfo.studentID)}>Guardar</Button>
                      : <Button disabled={this.state.grade === null} onClick={() => this.props.modalProps.handleSetGrade(this.state.grade, this.props.modalProps.studentInfo.studentID)}>Guardar</Button>
                    }
                    <Button onClick={this.props.modalProps.handleClose}>Cancelar</Button>
                </div>
            </Modal.Footer>
          </Modal>
        </div>
      );
    }
  }