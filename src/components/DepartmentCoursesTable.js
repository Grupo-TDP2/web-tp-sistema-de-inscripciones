import React, { Component } from "react";
import { Redirect } from 'react-router-dom';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import axios from 'axios'
import {Glyphicon, Button} from 'react-bootstrap';
import { ToastContainer } from "react-toastr";
import "./Toastr.css";
import "./DepartmentCoursesTable.css";
import API_URI from "../config/GeneralConfig.js";
import CourseInfoModal from "./CourseInfoModal";

let container;

export default class DepartmentCoursesTable extends Component {

  constructor(props) {
    super(props);
    
    this.state = {
        courses: [
          {
            courseID: '508',
            subject: '75.12 Análisis Númerico I',
            schedule: 'Lunes 19.00 - 22.00\nJueves 19.00 - 22.00',
            location: 'Las Heras',
            classroom: '203',
            teachers: []
          },
          {
            courseID: '510',
            subject: '75.40 Introducción a los Sistemas Distribuidos',
            schedule: 'Martes 19.00 - 22.00\nMiercoles 19.00 - 22.00',
            location: 'Paseo Colon',
            classroom: '208',
            teachers: []
          },
          {
            courseID: '614',
            subject: '75.40 Introducción a los Sistemas Distribuidos',
            schedule: '',
            location: 'Paseo Colon',
            classroom: '208',
            teachers: []
          },
          {
            courseID: '383',
            subject: '75.12 Análisis Númerico I',
            schedule: '',
            location: 'Paseo Colon',
            classroom: '208',
            teachers: []
          }
        ],
        loaderMsg: 'Cargando la informacion...',
        redirect: false,
        redirectTo: '',
        showModal: false,
        modalProps: null
    };

    this.customTitle = this.customTitle.bind(this);
    this.displayErrorToastr = this.displayErrorToastr.bind(this);
    this.handleEditClick = this.handleEditClick.bind(this);
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
    this.handleNewCourseClick = this.handleNewCourseClick.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
    this.addNewCourse = this.addNewCourse.bind(this);
  }

  componentDidMount() {
    this.setState({loaderMsg: 'No hay datos disponibles.'});
  }

  displayErrorToastr(message) {
    container.error(<div></div>, <em>{message}</em>, 
        {closeButton: true, timeOut: 3000}
      );
  }

  customTitle(cell, row, rowIndex, colIndex) {
    return `Doble click para editar`;
  }

  handleEditClick(cell, row) {
    this.setState({ 
        showModal: true,
        modalProps: {
            mode: 'edit',
            handleClose: this.handleModalClose,
            courseInfo: row
        }
    });
  }

  handleDeleteClick(cell, row) {
    this.displayErrorToastr("Funcionalidad habilitada proximamente.")
  }

  addNewCourse(course) {
    //ASD
  }

  handleNewCourseClick() {
    this.setState({ 
        showModal: true,
        modalProps: {
            mode: 'new',
            handleClose: this.handleModalClose,
            addNewCourse: this.addNewCourse
        } 
    });
  }

  handleModalClose() {
    this.setState({ 
        showModal: false,
        modalProps: null
    });
  }

  render() {
    if (this.state.redirect) {
      return <Redirect push to={`${this.state.redirectTo}`} />;
    }

    let modal;

    if (this.state.showModal) {
        modal = <CourseInfoModal childProps={this.state.modalProps} />;
    } else {
        modal = <div />
    }

    const handleEditClick = (cell,row) => this.handleEditClick(cell,row);
    const handleDeleteClick = (cell,row) => this.handleDeleteClick(cell,row);

    const options = {
        noDataText: this.state.loaderMsg,
        beforeShowError: (type, msg) => {
          return false;
        }
    };

    function buttonFormatter(cell, row){
      return (
        <div>
            <Button className="action-button" bsStyle="primary" onClick={() => handleEditClick(cell,row)}>
                <Glyphicon glyph="pencil" />&nbsp;
            </Button>
            <Button className="action-button" bsStyle="danger" onClick={() => handleDeleteClick(cell,row)}>
                <Glyphicon glyph="trash" />&nbsp;
            </Button>
        </div>
      );
    }

    return (
        <div>
            {modal}

            <ToastContainer
            ref={ref => container = ref}
            className="toast-top-right"
            />
            <div className="flex-parent">
                <h1 className="table-title">Cursos</h1>

                <Button className="out-table-button" bsStyle="success" onClick={this.handleNewCourseClick}>
                    <Glyphicon glyph="plus" /> Nuevo Curso
                </Button>
            </div>

            <BootstrapTable ref='coursesTable' data={ this.state.courses } options={ options }
                        headerStyle={ { background: '#f8f8f8' } } pagination search={ true }>
                <TableHeaderColumn dataField='courseID' width='80' isKey={ true } headerAlign='center' dataAlign='center'>ID</TableHeaderColumn>
                <TableHeaderColumn dataField='subject' headerAlign='center' dataAlign='center'>Materia</TableHeaderColumn>
                <TableHeaderColumn dataField='schedule' width='180' headerAlign='center' dataAlign='center' tdStyle={ { whiteSpace: 'normal' } }>Horario</TableHeaderColumn>
                <TableHeaderColumn dataField='location' width='120' headerAlign='center' dataAlign='center'>Sede</TableHeaderColumn>
                <TableHeaderColumn dataField='classroom' width='80' headerAlign='center' dataAlign='center'>Aula</TableHeaderColumn>
                <TableHeaderColumn dataField='teachers' width='200' headerAlign='center' dataAlign='center'>Docentes</TableHeaderColumn>
                <TableHeaderColumn dataField="buttons" width='130' headerAlign='center' dataAlign='center' dataFormat={buttonFormatter}>Acciones</TableHeaderColumn>
            </BootstrapTable>
        </div>
    );
  }
}