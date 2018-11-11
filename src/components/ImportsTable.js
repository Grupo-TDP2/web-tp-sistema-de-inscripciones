import React, { Component } from "react";
import { Redirect } from 'react-router-dom';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import axios from 'axios'
import {Glyphicon, Button, ToggleButton, ToggleButtonGroup} from 'react-bootstrap';
import { ToastContainer } from "react-toastr";
import "./Toastr.css";
import moment from 'moment';
import API_URI from "../config/GeneralConfig.js";
import "./ImportsTable.css";

let container;
 
export default class ImportsTable extends Component {

  constructor(props) {
    super(props);
    
    this.state = {
        imports: [],
        loaderMsg: 'Cargando la informacion...',
        redirect: false,
        redirectTo: ''
    };

    this.displayErrorToastr = this.displayErrorToastr.bind(this);
    this.displaySuccessToastr = this.displaySuccessToastr.bind(this);
    this.handleGoBack = this.handleGoBack.bind(this);
  }

  async loadImports() {
    const errorToastr = message => this.displayErrorToastr(message);
    const setLoaderMsg = mLoaderMsg => this.setState({ loaderMsg: mLoaderMsg });
    const setImports = mImports => this.setState({ imports: mImports });

    await axios({
        method:'get',
        url: API_URI + '/import_files',
        headers: {'Authorization': this.props.childProps.token}
    })
        .then(function(response) {
            console.log(response);

            setLoaderMsg("No hay datos disponibles.");

            let mImports = [];

            response.data.forEach(responseImport => {
                mImports.push({
                    importID: responseImport.id,
                    filename: responseImport.filename,
                    correct: responseImport.rows_successfuly_processed,
                    incorrect: responseImport.rows_unsuccessfuly_processed,
                    date: moment(responseImport.created_at).format("DD/MM/YYYY")
                });
            });

            setImports(mImports);
        })
        .catch(function (error) {
            console.log(error);
            errorToastr("No se pudieron cargar los datos.");
            setLoaderMsg("No se pudieron cargar los datos.");
        });
  }

  async componentDidMount() {
    this.loadImports();
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

  handleGoBack() {
    this.setState({
        redirect: true,
        redirectTo: '/importData'
    });
  }

  render() {
    if (this.state.redirect) {
      return <Redirect push to={`${this.state.redirectTo}`} />;
    }

    const options = {
        noDataText: this.state.loaderMsg,
        beforeShowError: (type, msg) => {
          return false;
        },
        sizePerPageList: [ {
          text: '2', value: 2
        }, {
          text: '10', value: 10
        }, {
          text: 'Todos', value: this.state.imports.length
        } ], // you can change the dropdown list for size per page
        sizePerPage: 10
    };

    return (
      <div>
        <ToastContainer
          ref={ref => container = ref}
          className="toast-top-right"
        />
        <BootstrapTable ref='importsTable' data={ this.state.imports } options={ options }
                    headerStyle={ { background: '#f8f8f8' } } pagination={ true } search={ true } searchPlaceholder={'Buscar'}>
            <TableHeaderColumn dataField='importID' hidden={ true } width='80' isKey={ true } headerAlign='center' dataAlign='center'>ID Importación</TableHeaderColumn>
            <TableHeaderColumn dataField='filename' headerAlign='center' dataAlign='center'>Archivo</TableHeaderColumn>
            <TableHeaderColumn dataField='correct' width='120' headerAlign='center' dataAlign='center'>Correctas</TableHeaderColumn>
            <TableHeaderColumn dataField='incorrect' width='130' headerAlign='center' dataAlign='center'>Incorrectas</TableHeaderColumn>
            <TableHeaderColumn dataField='date' width='150' headerAlign='center' dataAlign='center'>Fecha de Carga</TableHeaderColumn>
        </BootstrapTable>
        <Button className="importsGoBackBtn" onClick={this.handleGoBack}>
            <Glyphicon glyph="chevron-left" /> Volver a Carga de Datos
        </Button>
        <br />
      </div>
    );
  }
}