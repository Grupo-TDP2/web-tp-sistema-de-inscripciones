import React, { Component } from "react";
import { Redirect } from 'react-router-dom';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import axios from 'axios'
import {Glyphicon, Button, Row, Col} from 'react-bootstrap';
import { ToastContainer } from "react-toastr";
import moment from 'moment';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import "./Toastr.css";
import 'react-datepicker/dist/react-datepicker.css';
import "./SchoolTermsTable.css";
import API_URI from "../config/GeneralConfig.js";
import ConfirmModal from './ConfirmModal';

let container;

export default class SchoolTermsTable extends Component {

  constructor(props) {
    super(props);

    this.state = {
        schoolTerms: [],
        loaderMsg: 'Cargando la informacion...',
        redirect: false,
        redirectTo: '',
        confirmModal: '',
        newTerm: '',
        newYear: '',
        newStartDate: null,
        newEndDate: null,
        startRange: '',
        endRange: '',
        weeks: 8
    };

    this.displayErrorToastr = this.displayErrorToastr.bind(this);
    this.displaySuccessToastr = this.displaySuccessToastr.bind(this);
    this.handleTermChange = this.handleTermChange.bind(this);
    this.handleYearChange = this.handleYearChange.bind(this);
    this.handleStartDateChange = this.handleStartDateChange.bind(this);
    this.addNewSchoolTerm = this.addNewSchoolTerm.bind(this);
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
  }

  async componentDidMount() {
    this.loadSchoolTerms();
  }

  async loadSchoolTerms() {
    const errorToastr = message => this.displayErrorToastr(message);
    const setLoaderMsg = mLoaderMsg => this.setState({ loaderMsg: mLoaderMsg });
    const setSchoolTerms = mSchoolTerms => this.setState({schoolTerms: mSchoolTerms});
    const getTermMappings = () => this.termMappings;

    await axios({
      method:'get',
      url: API_URI + '/school_terms',
      headers: {'Authorization': this.props.childProps.token}
      })
        .then(function(response) {
          console.log(response);

          setLoaderMsg("No hay datos disponibles.");

          let mSchoolTerms = [];

          response.data.forEach(schoolTerm => {
            let mSchoolTerm = {
                id: schoolTerm.id,
                year: schoolTerm.year,
                date_start: moment(schoolTerm.date_start).format('DD/MM/YYYY'),
                date_end: moment(schoolTerm.date_end).format('DD/MM/YYYY'),
            }

            if (schoolTerm.term === 'first_semester') {
              mSchoolTerm.term = 'Primer Cuatrimestre';
            } else if (schoolTerm.term === 'second_semester') {
              mSchoolTerm.term = 'Segundo Cuatrimestre';
            } else {
              mSchoolTerm.term = 'Curso de Verano';
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

  handleTermChange(e) {
    this.setState({ newTerm: e.value });

    let mSplitStartRange = this.state.startRange.split("-");

    if (e.value === 'first_semester') {
      mSplitStartRange[1] = "3";
      this.setState({ weeks: 15});
    } else if (e.value === 'second_semester') {
      mSplitStartRange[1] = "8";
      this.setState({ weeks: 15});
    } else {
      mSplitStartRange[1] = "1";
      this.setState({ weeks: 7});
    }

    this.setState({ startRange: mSplitStartRange.join('-') });
  }

  handleYearChange(e) {
    this.setState({ newYear: e.value });

    if (this.state.startRange === '') {
      this.setState({ startRange: e.value + '-1-1' });
    } else {
      let splitDate = this.state.startRange.split('-');
      splitDate[0] = e.value;
      this.setState({ startRange: splitDate.join('-') });
    }
  }

  handleStartDateChange(date) {
    this.setState({ newStartDate: date });

    let mEndDate = moment(date);

    if (this.state.newTerm === 'summer_school') {
      mEndDate = mEndDate.add(8, "weeks").day("Monday");
      this.setState({ newEndDate: mEndDate});
    } else {
      mEndDate = mEndDate.add(16, "weeks").day("Monday");
      this.setState({ newEndDate: mEndDate});
    }
    
  }

  async handleDelete(row) {
    const errorToastr = message => this.displayErrorToastr(message);
    const successToastr = message => this.displaySuccessToastr(message);
    const loadSchoolTerms = () => this.loadSchoolTerms();

    await axios({
      method:'delete',
      url: API_URI + "/school_terms/" + row.id,
      headers: {'Authorization': this.props.childProps.token}
      })
        .then(function(response) {
          console.log(response);
          successToastr("La operación se realizó con exito.");

          loadSchoolTerms();
        })
        .catch(function (error) {
          console.log(error);
          errorToastr("No se pudo eliminar el período lectivo. Intente nuevamente.");
        });

    this.setState({ confirmModal: '' });
  }

  handleModalClose() {
    this.setState({ confirmModal: '' });
  }

  handleDeleteClick(cell, row) {
    const modalProps = {
      message: 'Estás seguro que deseas eliminar este período lectivo? Esta operación no se puede deshacer.',
      messageTitle: 'Eliminar Período Lectivo?',
      type: 'confirmDelete',
      handleClose: this.handleModalClose,
      handleConfirmAction: () => this.handleDelete(row)
    };

    this.setState({ confirmModal: <ConfirmModal modalProps={modalProps}/> });
  }

  async addNewSchoolTerm() {
    const errorToastr = message => this.displayErrorToastr(message);
    const successToastr = message => this.displaySuccessToastr(message);
    const loadSchoolTerms = () => this.loadSchoolTerms();

    const payload = {
      term: this.state.newTerm,
      year: this.state.newYear,
      date_start: this.state.newStartDate.format("YYYY-MM-DD"),
      date_end: this.state.newEndDate.format("YYYY-MM-DD")
    };

    console.log(payload);

    await axios({
      method:'post',
      data: {
          school_term: payload
      },
      url: API_URI + "/school_terms",
      headers: {'Authorization': this.props.childProps.token}
      })
        .then(function(response) {
          console.log(response);
          successToastr("La operación se realizó con exito.");

          loadSchoolTerms();
        })
        .catch(function (error) {
          console.log(error);
          errorToastr("No se pudo crear el período lectivo. Intente nuevamente.");
        });
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

  render() {
    if (this.state.redirect) {
      return <Redirect push to={`${this.state.redirectTo}`} />;
    }

    const handleDeleteClick = (cell,row) => this.handleDeleteClick(cell,row);

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
        sizePerPage: 10,
        defaultSortName: 'date_start',  // default sort column name
        defaultSortOrder: 'desc'  // default sort order
    };

    function buttonFormatter(cell, row){
      return (
        <Button className="submitButton" bsStyle="danger" onClick={() => handleDeleteClick(cell,row)}>
            <Glyphicon glyph="trash" />&nbsp;
        </Button>
      );
    }

    function dateSortFunction(a, b, order) {   // order is desc or asc
      console.log(a);
      console.log(b);

      const splitA = a.date_start.split("/");
      const splitB = b.date_start.split("/");

      const newA = parseInt(splitA[2])*10000 + parseInt(splitA[1])*100 + parseInt(splitA[0]);
      const newB = parseInt(splitB[2])*10000 + parseInt(splitB[1])*100 + parseInt(splitB[0]);
      
      if (order === 'desc') {
        return newA - newB;
      } else {
        return newB - newA;
      }
    }

    const availableTerms = [
      {label: 'Primer Cuatrimestre', value: 'first_semester'},
      {label: 'Segundo Cuatrimestre', value: 'second_semester'},
      {label: 'Curso de Verano', value: 'summer_school'}
    ];

    const availableYears = [
      {label: '2018', value: '2018'},
      {label: '2019', value: '2019'},
      {label: '2020', value: '2020'}
    ];

    const isMonday = date => {
      const day = date.day();
      return day === 1;
    };

    return (
      <div>
        {this.state.confirmModal}

        <ToastContainer
          ref={ref => container = ref}
          className="toast-top-right"
        />

        <Row className="addDateRow">
          <Col xs={12} sm={3}>
            <p>Año</p>
            <Select
              classNamePrefix="select"
              placeholder="Seleccione..."
              noOptionsMessage={() => "No hay opciones."}
              onChange={this.handleYearChange}
              defaultValue={""}
              name="name"
              options={availableYears}
            />
          </Col>
          <Col xs={12} sm={3}>
            <p>Cuatrimestre</p>
            <Select
              classNamePrefix="select"
              placeholder="Seleccione..."
              noOptionsMessage={() => "No hay opciones."}
              onChange={this.handleTermChange}
              isDisabled={this.state.newYear === ''}
              defaultValue={""}
              name="name"
              options={availableTerms}
            />
          </Col>
          <Col xs={12} sm={2}>
            <p>Fecha de inicio</p>
            <DatePicker
                dateFormat="DD/MM/YYYY"
                selected={this.state.newStartDate}
                onChange={this.handleStartDateChange}
                className="datepicker"
                placeholderText="Seleccione..."
                filterDate={isMonday}
                minDate={moment(this.state.startRange)}
                maxDate={moment(this.state.startRange).endOf("month")}
                showDisabledMonthNavigation 
                disabled={this.state.newTerm === ''}
            />
          </Col>
          <Col xs={12} sm={3} className="addDateButtonContainer">
            <Button className="flexCenterItem" bsStyle="success" onClick={this.addNewSchoolTerm}
              disabled={this.state.newYear === '' || this.state.newTerm === '' || this.state.newStartDate === null
                || this.state.newEndDate === null}>
              <Glyphicon glyph="plus" />&nbsp;Nuevo Período Lectivo
            </Button>
          </Col>
        </Row>

        <BootstrapTable ref='schoolTermsTable' data={ this.state.schoolTerms } options={ options }
                    headerStyle={ { background: '#f8f8f8' } } pagination={ true } search={ true } searchPlaceholder={'Buscar'}>
            <TableHeaderColumn dataField='id' isKey={ true } hidden={ true }>ID</TableHeaderColumn>
            <TableHeaderColumn dataField='term' width='250' headerAlign='center' dataAlign='center'>Cuatrimestre</TableHeaderColumn>
            <TableHeaderColumn dataField='year' width='130' headerAlign='center' dataAlign='center'>Año</TableHeaderColumn>
            <TableHeaderColumn dataField='date_start' headerAlign='center' dataAlign='center' dataSort sortFunc={ dateSortFunction } tdStyle={ { whiteSpace: 'normal' } }>Fecha de inicio</TableHeaderColumn>
            <TableHeaderColumn dataField='date_end' headerAlign='center' dataAlign='center' tdStyle={ { whiteSpace: 'normal' } }>Fecha de finalización</TableHeaderColumn>
            <TableHeaderColumn dataField="button" width='100' headerAlign='center' dataAlign='center' dataFormat={buttonFormatter}>Acciones</TableHeaderColumn>
        </BootstrapTable>
      </div>
    );
  }
}