import React, { Component } from "react";
import {Glyphicon, Button, Row, Col, FormControl} from 'react-bootstrap';
import Select from 'react-select';

import './ImportData.css';

export default class ImportData extends Component {

  constructor(props) {
    super(props);

    this.state = {
        fileType: "student",
        fileName: "",
        file: ""
    };

    if (!this.props.isAuthenticated) {
      this.props.history.push("/login") 
    }

    this.handleRecordsRoute = this.handleRecordsRoute.bind(this);
    this.handleFileTypeChange = this.handleFileTypeChange.bind(this);
    this.handleStartLoad = this.handleStartLoad.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);
  }

  handleRecordsRoute() {

  }

  handleStartLoad() {

  }

  handleFileChange(e) {
    const mFileName = e.target.value;
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

    this.setState({ fileName: mFileName });
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
        <div className="importerMainFlex">
            <h1>Carga de Datos</h1>
            <Button className="recordsButton" bsStyle="primary" onClick={() => this.handleRecordsRoute}>
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
                        onChange={this.handleFileChange} value={this.state.fileName}/>
                </div>
            </Col>
        </Row>
        <br />
        <div className="loadButtonFlex">
            <Button disabled={this.state.file === ""} className="loadButton" bsStyle="success" onClick={() => this.handleStartLoad}>
                <Glyphicon glyph="upload" /> Comenzar Carga
            </Button>
        </div>
        <br/>
      </div>
    );
  }
}