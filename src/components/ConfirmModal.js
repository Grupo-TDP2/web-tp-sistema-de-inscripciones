import React, { Component } from "react";
import {Modal, Button, Glyphicon} from 'react-bootstrap';
import './TeachersModal.css';

export default class ConfirmModal extends Component {
    constructor(props, context) {
      super(props, context);

      this.state = {
        show: true
      };
    }
  
    render() {

      let confirmButton;
      switch(this.props.modalProps.type) {
        case 'confirmDelete':
          confirmButton =
            <Button bsStyle="danger" onClick={this.props.modalProps.handleConfirmAction}>
              <Glyphicon glyph="trash" /> Eliminar
            </Button>;
        break;
        case 'confirmDisapproval':
          confirmButton = 
            <Button bsStyle="danger" onClick={this.props.modalProps.handleConfirmAction}>
              <Glyphicon glyph="thumbs-down" /> Desaprobar
            </Button>;
          break;
        case 'confirmAccept':
          confirmButton = 
            <Button bsStyle="success" onClick={this.props.modalProps.handleConfirmAction}>
              <Glyphicon glyph="ok" /> Aceptar
            </Button>;
          break;
        default:
          confirmButton = <div />;
          break;
      }

      return (
        <div>
          <Modal show={this.state.show} onHide={this.props.modalProps.handleClose}>
            <Modal.Header closeButton>
                <Modal.Title className="modalTitle">
                    {this.props.modalProps.messageTitle}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{this.props.modalProps.message}</p>
            </Modal.Body>
            <Modal.Footer>
                <div className="footerFlex">
                    {confirmButton}
                    <Button onClick={this.props.modalProps.handleClose}>Cancelar</Button>
                </div>
            </Modal.Footer>
          </Modal>
        </div>
      );
    }
  }