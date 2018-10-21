import React, { Component } from "react";
import { Redirect } from 'react-router-dom';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import axios from 'axios'
import {Glyphicon, Button} from 'react-bootstrap';
import { ToastContainer } from "react-toastr";
import moment from 'moment';
import "./Toastr.css";
import "./SchoolTermsTable.css";
import API_URI from "../config/GeneralConfig.js";

let container;

export default class SchoolTermsTable extends Component {

  constructor(props) {
    super(props);

    this.state = {
        schoolTerms: [],
        loaderMsg: 'Cargando la informacion...',
        redirect: false,
        redirectTo: ''
    };

    this.displayErrorToastr = this.displayErrorToastr.bind(this);
  }

  async componentDidMount() {
    const errorToastr = message => this.displayErrorToastr(message);
    const setLoaderMsg = mLoaderMsg => this.setState({ loaderMsg: mLoaderMsg });
    const setSchoolTerms = mSchoolTerms => this.setState({schoolTerms: mSchoolTerms});

    await axios({
      method:'get',
      url: API_URI + '/school_terms',
      headers: {'Authorization': this.props.childProps.token}
      })
        .then(function(response) {
          console.log(response);

          if (response.data.length === 0) {
            setLoaderMsg("No hay datos disponibles.");
          }

          let mSchoolTerms = [];

          response.data.forEach(schoolTerm => {
            let mSchoolTerm = {
                year: schoolTerm.year,
                date_start: moment(schoolTerm.date_start).format('DD/MM/YYYY'),
                date_end: moment(schoolTerm.date_end).format('DD/MM/YYYY'),
            }

            if (schoolTerm.term === "first_semester") {
                mSchoolTerm.term = "Primer Cuatrimestre";
            } else {
                mSchoolTerm.term = "Segundo Cuatrimestre";
            }

            mSchoolTerms.push(mSchoolTerm);
          });

          setSchoolTerms(mSchoolTerms);
        })
        .catch(function (error) {
          console.log(error);
          errorToastr("No se pudieron cargar los datos.");
          setLoaderMsg("No se pudieron cargar los datos.");
        });
  }

  displayErrorToastr(message) {
    container.error(<div></div>, <em>{message}</em>, 
        {closeButton: true, timeOut: 3000}
      );
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
          text: 'Todos', value: this.state.schoolTerms.length
        } ], // you can change the dropdown list for size per page
        sizePerPage: 10
    };

    function buttonFormatter(cell, row){
      return (
        <Button className="submitButton">
            <Glyphicon glyph="education" />&nbsp;
        </Button>
      );
    }

    return (
      <div>
        <ToastContainer
          ref={ref => container = ref}
          className="toast-top-right"
        />

        <div className="flexParent">
            <h1 className="tableTitle">Períodos Lectivos</h1>

            <Button className="outTableButton" bsStyle="success">
                <Glyphicon glyph="plus" /> Nuevo Período Lectivo
            </Button>
        </div>

        <BootstrapTable ref='schoolTermsTable' data={ this.state.schoolTerms } options={ options }
                    headerStyle={ { background: '#f8f8f8' } } pagination={ true } search={ true } searchPlaceholder={'Buscar'}>
            <TableHeaderColumn dataField='id' hidden={ true }>ID</TableHeaderColumn>
            <TableHeaderColumn dataField='term' width='250' isKey={ true } headerAlign='center' dataAlign='center'>Cuatrimestre</TableHeaderColumn>
            <TableHeaderColumn dataField='year' width='130' headerAlign='center' dataAlign='center'>Año</TableHeaderColumn>
            <TableHeaderColumn dataField='date_end' headerAlign='center' dataAlign='center' tdStyle={ { whiteSpace: 'normal' } }>Fecha de inicio</TableHeaderColumn>
            <TableHeaderColumn dataField='date_start' headerAlign='center' dataAlign='center' tdStyle={ { whiteSpace: 'normal' } }>Fecha de finalización</TableHeaderColumn>
        </BootstrapTable>
      </div>
    );
  }
}