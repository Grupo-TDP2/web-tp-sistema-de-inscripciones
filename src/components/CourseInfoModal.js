import React, { Component } from "react";
import {Modal, Popover, Tooltip, OverlayTrigger, Button, Form, FormGroup, ControlLabel, FormControl, Glyphicon} from 'react-bootstrap';
import './CourseInfoModal.css';

export default class CourseInfoModal extends React.Component {
    constructor(props, context) {
      super(props, context);
  
      this.state = {
        show: true
      };

      console.log(props);
    }
  
    render() {
  
      return (
        <div>
          <Modal bsSize="large" show={this.state.show} onHide={this.props.childProps.handleClose}>
            <Modal.Header closeButton>
                {this.props.childProps.mode === 'new'
                ? <Modal.Title className="modalTitle">
                    Crear Nuevo Curso
                    </Modal.Title>
                : <Modal.Title className="modalTitle">
                    Editar Curso
                    </Modal.Title>
                }
            </Modal.Header>
            <Modal.Body>
            <Form className="formFlex">
                <FormGroup className="formGroupFlex" controlId="main">
                    <ControlLabel className="controlLabel formGroupFlexItem noMarginBottom">Materia</ControlLabel>{' '}
                    <FormControl className="formControl formGroupFlexItem" componentClass="select" placeholder="select">
                        <option value="select">select</option>
                        <option value="other">...</option>
                    </FormControl>
                    <ControlLabel className="controlLabel formGroupFlexItem noMarginBottom">Sede</ControlLabel>{' '}
                    <FormControl className="formControl formGroupFlexItem" componentClass="select" placeholder="select">
                        <option value="lasHeras">Las Heras</option>
                        <option value="paseoColon">Paseo Colon</option>
                    </FormControl>
                    <ControlLabel className="controlLabel formGroupFlexItem noMarginBottom">Aula</ControlLabel>{' '}
                    <FormControl
                        className="formControl formGroupFlexItem"
                        type="text"
                        placeholder="Aula"
                    />
                </FormGroup>{' '}
                <FormGroup className="formGroupFlex">
                    <div className="formGroupHalf">
                        <ControlLabel className="controlLabel flexItem formGroupHalfItem">Horarios</ControlLabel>{' '}
                        <div className="formGroupHalfItem flexRow">
                            <FormControl className="flexRowItem" type="text" placeholder="Ingrese un horario..." />
                            <Button className="flexRowItem" bsStyle="primary">
                                <Glyphicon glyph="plus" />
                            </Button>
                        </div>
                        <ul className="formGroupHalfItem itemList">
                            <li>Lunes 19.00 - 22.00</li>
                            <li>Miercoles 19.00 - 22.00</li>
                        </ul>
                    </div>
                </FormGroup>{' '}
                {this.props.childProps.mode === 'new'
                ? <Button className="formFlexItem" type="submit">Crear Curso</Button>
                : <Button className="formFlexItem" type="submit">Guardar</Button>
                }
            </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={this.props.childProps.handleClose}>Close</Button>
            </Modal.Footer>
          </Modal>
        </div>
      );
    }
  }