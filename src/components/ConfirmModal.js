import React, { Component } from "react";
import {Modal, Button, Table, Glyphicon} from 'react-bootstrap';
import Select from 'react-select';
import './TeachersModal.css';

export default class ConfirmModal extends Component {
    constructor(props, context) {
      super(props, context);

      this.state = {
        show: true
      };
    }
  
    render() {

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
                    {this.props.modalProps.type === 'confirmDelete'
                    ? <Button bsStyle="danger" onClick={this.props.modalProps.handleConfirmAction}>
                        <Glyphicon glyph="trash" /> Eliminar
                        </Button>
                    : <Button onClick={this.props.modalProps.handleConfirmAction}>Confirmar</Button>
                    }
                    <Button onClick={this.props.modalProps.handleClose}>Cancelar</Button>
                </div>
            </Modal.Footer>
          </Modal>
        </div>
      );
    }
  }