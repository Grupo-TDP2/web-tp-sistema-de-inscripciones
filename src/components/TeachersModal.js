import React, { Component } from "react";
import {Modal, Button, Form, FormGroup, ControlLabel, FormControl, Glyphicon} from 'react-bootstrap';

export default class TeachersModal extends React.Component {
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
               <Modal.Title className="modalTitle">
                    Docentes
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
            
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={this.props.childProps.handleClose}>Cerrar</Button>
            </Modal.Footer>
          </Modal>
        </div>
      );
    }
  }