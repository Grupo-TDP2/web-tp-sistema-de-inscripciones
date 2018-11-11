import React, { Component } from "react";
import {Glyphicon, Button, Row, Col, FormControl, Modal, Alert} from 'react-bootstrap';
import Select from 'react-select';
import { ToastContainer } from "react-toastr";
import "../components/Toastr.css";
import API_URI from "../config/GeneralConfig.js";
import axios from 'axios'

import './ImportData.css';

let container;

export default class ImportData extends Component {

  constructor(props) {
    super(props);

    this.state = {
        fileType: "student",
        fileName: "",
        file: "",
        inputFileName: "",
        alertModal: "",
        result: "Archivo cargado: Alumnos_2018.csv \n\nCargados correctamente: 1800 \nCargados incorrectamente: 5 \n- Linea 128 \n- Linea 282"
    };

    if (!this.props.isAuthenticated) {
      this.props.history.push("/login") 
    }

    this.handleImportsHistoryRoute = this.handleImportsHistoryRoute.bind(this);
    this.handleFileTypeChange = this.handleFileTypeChange.bind(this);
    this.handleStartLoad = this.handleStartLoad.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);
    this.displayErrorToastr = this.displayErrorToastr.bind(this);
    this.displaySuccessToastr = this.displaySuccessToastr.bind(this);
  }

  displayErrorToastr(message) {
    container.error(<div></div>, <em>{message}</em>, 
        {closeButton: true, timeOut: 3000}
      );
  }

  displaySuccessToastr(message) {
    container.success(<div></div>, <em>{message}</em>, 
        {closeButton: true, timeOut: 3000}
      );
  }

  handleImportsHistoryRoute() {
    this.props.history.push("/importsHistory");
  }

  async handleStartLoad() {
    const errorToastr = message => this.displayErrorToastr(message);
    const showAlertModal = () => this.setState({
        alertModal: 
            <Modal show={true}>
                <Modal.Body>
                    <Alert bsStyle="info">
                        <div className="alertFlex">
                            <Glyphicon className="bigGlyph" glyph="info-sign" />
                            <h4 className="alertTitle">El archivo esta siendo procesado.</h4>
                        </div>
                    </Alert>
                </Modal.Body>
            </Modal>
    });
    const hideAlertModal = () => this.setState({ alertModal: "" });

    const payload = {
        model: this.state.fileType,
        file: this.state.file,
        filename: this.state.fileName
    }

    showAlertModal();

    await axios({
      method:'post',
      data: payload,
      url: API_URI + '/import_files',
      headers: {'Authorization': this.props.token}
      })
        .then(function(response) {
            console.log(response);
            hideAlertModal();
        })
        .catch(function (error) {
          console.log(error);
          hideAlertModal();
          errorToastr("Ha ocurrido un error. No se pudo importar los datos.");
        });
  }

  handleFileChange(e) {
    const mInputFileName = e.target.value;
    const fileNameSplit = e.target.value.split("\\");
    const mFileName = fileNameSplit[fileNameSplit.length - 1];
    const setFile = mFileContent => this.setState({ file: mFileContent });

    let file = e.target.files[0];
    
    if (!file) {
        return;
    }

    let reader = new FileReader();
    let fileContent;

    reader.onload = function(e) {
        setFile(e.target.result);
    };
    reader.readAsText(file);

    this.setState({ fileName: mFileName, inputFileName: mInputFileName });
  }

  handleFileTypeChange(e) {
    this.setState({ fileType: e.value });
  }

  render() {

    const possibleFileTypes = [
        {label: "Alumnos", value: "student"},
        {label: "Docentes", value: "teacher"}
    ];

    return (
      this.props.isAuthenticated &&
      <div>
        {this.state.alertModal}

        <ToastContainer
          ref={ref => container = ref}
          className="toast-top-right"
        />
        
        <div className="importerMainFlex">
            <h1>Carga de Datos</h1>
            <Button className="recordsButton" bsStyle="primary" onClick={this.handleImportsHistoryRoute}>
                <Glyphicon glyph="calendar" /> Ver Historial
            </Button>
        </div>
        <br />
        <Row>
            <Col xs={12} md={4}>
                <div className="subFlex">
                    <p className="controlLabel"><strong>Datos a Cargar</strong></p>
                    <Select
                        className="subFlexSelect"
                        classNamePrefix="select"
                        placeholder="Seleccione..."
                        defaultValue={possibleFileTypes[possibleFileTypes.findIndex(fileType => fileType.value === this.state.fileType)]}
                        onChange={this.handleFileTypeChange}
                        name="grade"
                        options={possibleFileTypes}
                    />
                </div>
            </Col>
            <Col xs={12} md={8}>
                <div className="subFlex">
                    <p className="controlLabel"><strong>Archivo</strong></p>
                    <FormControl className="fileSelector" type="file" accept=".csv"
                        onChange={this.handleFileChange} value={this.state.inputFileName}/>
                </div>
            </Col>
        </Row>
        <br />
        <div className="loadButtonFlex">
            <Button disabled={this.state.file === ""} className="loadButton" bsStyle="success" onClick={this.handleStartLoad}>
                <Glyphicon glyph="upload" /> Comenzar Carga
            </Button>
        </div>
        <br/>
        <p className="resultsLabel"><strong>Resultados</strong></p>
        <FormControl componentClass="textarea" style={{ height: 320 }}
            readOnly value={this.state.result}/>
      </div>
    );
  }
}