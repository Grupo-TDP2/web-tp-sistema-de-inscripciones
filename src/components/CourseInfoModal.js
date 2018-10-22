import React, { Component } from "react";
import {Modal, Button, Glyphicon, Table, Row, Col, FormControl} from 'react-bootstrap';
import './CourseInfoModal.css';
import './TeachersModal.css';
import Select from 'react-select';
import API_URI from "../config/GeneralConfig.js";
import axios from 'axios'

export default class CourseInfoModal extends Component {
    constructor(props, context) {
      super(props, context);
  
      this.positions = [
        { label: "Titular", value: "course_chief" },
        { label: "Jefe Trabajos Prácticos", value: "practice_chief" },
        { label: "Asistente Primero", value: "first_assistant" },
        { label: "Asistente Segundo", value: "second_assistant" },
        { label: "Ayudante Ad-Honorem", value: "ad_honorem" }
      ];

      this.positionMappings = {
        'course_chief': 'Titular',
        'practice_chief': 'Jefe Trabajos Prácticos',
        'first_assistant': 'Asistente Primero',
        'second_assistant': 'Asistente Segundo',
        'ad_honorem': 'Ayudante Ad-Honorem'
      }

      this.daysList = [
        { label: "Lunes", value: "monday", order: 1 },
        { label: "Martes", value: "tuesday", order: 2 },
        { label: "Miercoles", value: "wednesday", order: 3 },
        { label: "Jueves", value: "thursday", order: 4 },
        { label: "Viernes", value: "friday", order: 5 },
        { label: "Sabado", value: "saturday", order: 6 }
      ];

      this.state = {
        show: true,
        subjectList: [],
        subject: "",
        location: "",
        classroomList: [],
        classroom: "",
        schedules: [],
        day: "",
        startHour: "",
        endHour: "",
        lessonType: "",
        teacherList: [],
        currentTeachers: [],
        schoolTermList: [],
        schoolTerm: "",
        vacancies: "",
        courseName: "",
        addTeacherPosition: "",
        addTeacherID: ""
      };

      this.handleSubjectChange = this.handleSubjectChange.bind(this);
      this.handleLocationChange = this.handleLocationChange.bind(this);
      this.handleClassroomChange = this.handleClassroomChange.bind(this);
      this.handleDayChange = this.handleDayChange.bind(this);
      this.handleStartHourChange = this.handleStartHourChange.bind(this);
      this.handleEndHourChange = this.handleEndHourChange.bind(this);
      this.handleAddSchedule = this.handleAddSchedule.bind(this);
      this.handleTeacherChange = this.handleTeacherChange.bind(this);
      this.handlePositionChange = this.handlePositionChange.bind(this);
      this.handleVacanciesChange = this.handleVacanciesChange.bind(this);
      this.handleCourseNameChange = this.handleCourseNameChange.bind(this);
      this.handleSchoolTermChange = this.handleSchoolTermChange.bind(this);
      this.handleSubmitNewTeacher = this.handleSubmitNewTeacher.bind(this);
      this.handleLessonType = this.handleLessonType.bind(this);
      this.handleRemoveSchedule = this.handleRemoveSchedule.bind(this);
      this.handleRemoveTeacher = this.handleRemoveTeacher.bind(this);
      this.submitNewCourse = this.submitNewCourse.bind(this);
    }

    async componentDidMount() {
        const errorToastr = message => this.displayErrorToastr(message);
        const setLoaderMsg = mLoaderMsg => this.setState({ loaderMsg: mLoaderMsg });
        const setSchoolTerms = mSchoolTerms => this.setState({ schoolTermList: mSchoolTerms });
        const setSubjects = mSubjects => this.setState({ subjectList: mSubjects });
        const setTeachers = mTeachers => this.setState({ teacherList: mTeachers });
        const setClassrooms = mClassrooms => this.setState({ classroomList: mClassrooms });

        await axios({
            method:'get',
            url: API_URI + '/departments/me/courses',
            headers: {'Authorization': this.props.childProps.token}
            })
              .then(function(response) {
                //console.log(response);
      
                let mSubjects = [];
      
                response.data.forEach(subject => {
                  mSubjects.push({
                    label: subject.name,
                    value: subject.id
                  });
                });
      
                setSubjects(mSubjects);
              })
              .catch(function (error) {
                console.log(error);
                errorToastr("No se pudieron cargar los datos.");
                setLoaderMsg("No se pudieron cargar los datos.");
              });

        await axios({
            method:'get',
            url: API_URI + '/school_terms',
            headers: {'Authorization': this.props.childProps.token}
            })
              .then(function(response) {
                //console.log(response);
      
                let mSchoolTerms = [];

                const termMapping = {
                    "first_semester": "Primer Cuatrimestre",
                    "second_semester": "Segundo Cuatrimestre",
                    "summer_school": "Curso de Verano"
                };
      
                response.data.forEach(schoolTerm => {
                  mSchoolTerms.push({
                    label: termMapping[schoolTerm.term] + " " + schoolTerm.year,
                    value: schoolTerm.id
                  });
                });
      
                setSchoolTerms(mSchoolTerms);
              })
              .catch(function (error) {
                console.log(error);
                errorToastr("No se pudieron cargar los datos.");
                setLoaderMsg("No se pudieron cargar los datos.");
              });

        await axios({
            method:'get',
            url: API_URI + '/teachers',
            headers: {'Authorization': this.props.childProps.token}
            })
                .then(function(response) {
                //console.log(response);
        
                let mTeachers = [];
        
                response.data.forEach(teacher => {
                    mTeachers.push({
                        label: teacher.first_name + " " + teacher.last_name,
                        value: teacher.id
                    });
                });
        
                setTeachers(mTeachers);
                })
                .catch(function (error) {
                    console.log(error);
                    errorToastr("No se pudieron cargar los datos.");
                    setLoaderMsg("No se pudieron cargar los datos.");
                });

        await axios({
            method:'get',
            url: API_URI + '/classrooms',
            headers: {'Authorization': this.props.childProps.token}
            })
                .then(function(response) {
                //console.log(response);
        
                let mClassrooms = [];
        
                response.data.forEach(classroom => {
                    mClassrooms.push({
                        label: classroom.floor + classroom.number,
                        value: classroom.id,
                        link: classroom.building.name
                    });
                });
        
                setClassrooms(mClassrooms);
                })
                .catch(function (error) {
                console.log(error);
                errorToastr("No se pudieron cargar los datos.");
                setLoaderMsg("No se pudieron cargar los datos.");
                });
    }
  
    handleSubjectChange(e) {
        this.setState({ subject: e.value });
    }

    handleLocationChange(e) {
        this.setState({ location: e.value });
    }

    handleClassroomChange(e) {
        this.setState({ classroom: e.value });
    }

    handleDayChange(e) {
        this.setState({ day: e.value });
    }

    handleStartHourChange(e) {
        this.setState({ startHour: e.value });
    }

    handleEndHourChange(e) {
        this.setState({ endHour: e.value });
    }

    handleLessonType(e) {
        this.setState({ lessonType: e.value });
    }

    handleAddSchedule() {
        let mSchedules = this.state.schedules;
        mSchedules.push({
            id: this.state.schedules.length + 1,
            day: this.state.day, 
            startHour: this.state.startHour, 
            endHour: this.state.endHour,
            lessonType: this.state.lessonType,
            classroom: this.state.classroom,
            location: this.state.location
        });
        mSchedules.sort((a,b) => this.daysList.find((day) => day.value === a.day).order - this.daysList.find((day) => day.value === b.day).order);
        this.setState({ schedules: mSchedules });
    }

    handleTeacherChange(e) {
        this.setState({ addTeacherID: e.value });
    }

    handlePositionChange(e) {
        this.setState({ addTeacherPosition: e.value });
    }

    handleSchoolTermChange(e) {
        this.setState({ schoolTerm: e.value });
    }

    handleVacanciesChange(e) {
        this.setState({ vacancies: e.target.value});
    }

    handleCourseNameChange(e) {
        this.setState({ courseName: e.target.value});
    }

    handleRemoveSchedule(scheduleID) {
        let mSchedules = this.state.schedules;
        mSchedules = mSchedules.filter(schedule => schedule.id !== scheduleID);
        this.setState({ schedules: mSchedules });
    }

    handleRemoveTeacher(teacherID) {
        let mTeachers = this.state.currentTeachers;
        mTeachers = mTeachers.filter(teacher => teacher.id !== teacherID);
        this.setState({ currentTeachers: mTeachers });
    }

    handleSubmitNewTeacher() {
        if (this.state.currentTeachers.every(teacher => teacher.id !== this.state.addTeacherID)) {
            let mCurrentTeachers = this.state.currentTeachers;
            mCurrentTeachers.push({
                id: this.state.addTeacherID,
                first_name: this.state.teacherList.find(teacher => teacher.value === this.state.addTeacherID).label.split(" ")[0],
                last_name: this.state.teacherList.find(teacher => teacher.value === this.state.addTeacherID).label.split(" ")[1],
                position: this.state.addTeacherPosition,
                positionMapped: this.positionMappings[this.state.addTeacherPosition]
            });
            this.setState({currentTeachers: mCurrentTeachers});
          } else {
            this.props.childProps.displayErrorToastr("El docente ya esta asociado con este curso.");
          }
    }

    submitNewCourse() {
        let mSchedules = [];
        this.state.schedules.forEach(schedule => {
            mSchedules.push({
                type: schedule.lessonType,
                day: schedule.day,
                hour_start: schedule.startHour,
                hour_end: schedule.endHour,
                classroom_id: schedule.classroom
            });
        });

        let mTeachers = [];
        this.state.currentTeachers.forEach(teacher => {
            mTeachers.push({
                teacher_id: teacher.id,
                teaching_position: teacher.position
            });
        });

        let newCourse = {
            name: this.state.courseName,
            vacancies: parseInt(this.state.vacancies, 10),
            subject_id: this.state.subject,
            school_term_id: this.state.schoolTerm,
            lesson_schedules: mSchedules,
            teacher_courses: mTeachers
        };

        this.props.childProps.addNewCourse(newCourse);
    }

    render() {

        const daysList = this.daysList;
        const handleRemoveSchedule = this.handleRemoveSchedule;
        const handleRemoveTeacher = this.handleRemoveTeacher;

        const locationList = [
            { label: "Las Heras", value: "LH" },
            { label: "Paseo Colon", value: "PC" }
        ]

        const hoursList = [
            {value: "7:00", label: '7:00', day: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]},
            {value: "7:30", label: '7:30', day: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]},
            {value: "8:00", label: '8:00', day: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]},
            {value: "8:30", label: '8:30', day: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]},
            {value: "9:00", label: '9:00', day: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]},
            {value: "9:30", label: '9:30', day: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]},
            {value: "10:00", label: '10:00', day: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]},
            {value: "10:30", label: '10:30', day: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]},
            {value: "11:00", label: '11:00', day: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]},
            {value: "11:30", label: '11:30', day: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]},
            {value: "12:00", label: '12:00', day: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]},
            {value: "12:30", label: '12:30', day: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]},
            {value: "13:00", label: '13:00', day: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]},
            {value: "13:30", label: '13:30', day: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]},
            {value: "14:00", label: '14:00', day: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]},
            {value: "14:30", label: '14:30', day: ["monday", "tuesday", "wednesday", "thursday", "friday"]},
            {value: "15:00", label: '15:00', day: ["monday", "tuesday", "wednesday", "thursday", "friday"]},
            {value: "15:30", label: '15:30', day: ["monday", "tuesday", "wednesday", "thursday", "friday"]},
            {value: "16:00", label: '16:00', day: ["monday", "tuesday", "wednesday", "thursday", "friday"]},
            {value: "16:30", label: '16:30', day: ["monday", "tuesday", "wednesday", "thursday", "friday"]},
            {value: "17:00", label: '17:00', day: ["monday", "tuesday", "wednesday", "thursday", "friday"]},
            {value: "17:30", label: '17:30', day: ["monday", "tuesday", "wednesday", "thursday", "friday"]},
            {value: "18:00", label: '18:00', day: ["monday", "tuesday", "wednesday", "thursday", "friday"]},
            {value: "18:30", label: '18:30', day: ["monday", "tuesday", "wednesday", "thursday", "friday"]},
            {value: "19:00", label: '19:00', day: ["monday", "tuesday", "wednesday", "thursday", "friday"]},
            {value: "19:30", label: '19:30', day: ["monday", "tuesday", "wednesday", "thursday", "friday"]},
            {value: "20:00", label: '20:00', day: ["monday", "tuesday", "wednesday", "thursday", "friday"]},
            {value: "20:30", label: '20:30', day: ["monday", "tuesday", "wednesday", "thursday", "friday"]},
            {value: "21:00", label: '21:00', day: ["monday", "tuesday", "wednesday", "thursday", "friday"]},
            {value: "21:30", label: '21:30', day: ["monday", "tuesday", "wednesday", "thursday", "friday"]},
            {value: "22:00", label: '22:00', day: ["monday", "tuesday", "wednesday", "thursday", "friday"]},
            {value: "22:30", label: '22:30', day: ["monday", "tuesday", "wednesday", "thursday", "friday"]},
            {value: "23:00", label: '23:00', day: ["monday", "tuesday", "wednesday", "thursday", "friday"]}
        ];

        const filteredClassrooms = this.state.classroomList.filter((classroom) => classroom.link === this.state.location );

        var schedulesList = this.state.schedules.map(function(schedule) {
            const id = schedule.id;

            const dayMapping = {
                "monday": "Lunes",
                "tuesday": "Martes",
                "wednesday": "Miercoles",
                "thursday": "Jueves",
                "friday": "Viernes",
                "saturday": "Sábado"
            };

            const typeMapping = {
                "theory": "Teoría",
                "practice": "Práctica"
            };

            return (
              <tr key={schedule.id}>
                <td>{typeMapping[schedule.lessonType]}</td>
                <td>{dayMapping[schedule.day]}</td>
                <td>{schedule.startHour}</td>
                <td>{schedule.endHour}</td>
                <td>{schedule.location}</td>
                <td>{schedule.classroom}</td>
                <td>
                    <Button className="submitButton" bsStyle="danger" onClick={() => handleRemoveSchedule(id)}>
                        <Glyphicon glyph="trash" />&nbsp;
                    </Button>
                </td>
              </tr>
            );
        });

        var currentTeachersList = this.state.currentTeachers.map(function(teacher) {
            const id = teacher.id;
            return (
              <tr key={teacher.id}>
                <td>{teacher.first_name + " " + teacher.last_name}</td>
                <td>{teacher.positionMapped}</td>
                <td>
                    <Button className="submitButton" bsStyle="danger" onClick={() => handleRemoveTeacher(id)}>
                        <Glyphicon glyph="trash" />&nbsp;
                    </Button>
                </td>
              </tr>
            );
        });

        const filteredStartHoursList = hoursList.filter((hour) => {
            if (hour.day.includes(this.state.day) && 
            Date.parse('01/01/2011 ' + hour.value + ":00") < Date.parse('01/01/2011 21:30:00')) {
                return true;
            } else {
                return false;
            }
        });
        const filteredEndHoursList = hoursList.filter((hour) => {
            if (Date.parse('01/01/2011 ' + hour.value + ":00") > Date.parse('01/01/2011 ' + this.state.startHour + ":00") &&
                parseInt(hour.value.split(":")[0] ,10) < parseInt(this.state.startHour.split(":")[0], 10) + 4) {
                    if (this.state.day === "Saturday" && parseInt(hour.value.split(":")[0] ,10) > 15) {
                        return false;
                    }
                    return true;
                } else {
                    return false;
                }
        });

        const lessonTypes = [
            {label: "Teoría", value: "theory"},
            {label: "Práctica", value: "practice"}
        ];

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
            <div className="formFlex">
                <div className="formGroupFlex">
                    <p className="controlLabel formGroupFlexItem noMarginBottom">Materia</p>{' '}
                    <Select
                        className="formControl formGroupFlexItem courseModalSelect"
                        classNamePrefix="select"
                        placeholder="Seleccione..."
                        noOptionsMessage={() => "No hay opciones."}
                        onChange={this.handleSubjectChange}
                        defaultValue={""}
                        isSearchable={true}
                        name="name"
                        options={this.state.subjectList}
                    />
                    <p className="controlLabel formGroupFlexItem noMarginBottom">Período</p>{' '}
                    <Select
                        className="formControl formGroupFlexItem courseModalSelectSmall"
                        classNamePrefix="select"
                        placeholder="Seleccione..."
                        noOptionsMessage={() => "No hay opciones."}
                        onChange={this.handleSchoolTermChange}
                        defaultValue={""}
                        isSearchable={true}
                        name="name"
                        options={this.state.schoolTermList}
                    />
                    <p className="controlLabel formGroupFlexItem noMarginBottom">Código</p>{' '}
                    <FormControl
                        className="formControl formGroupFlexItem courseModalSelectSmall"
                        type="number"
                        value={this.state.courseName}
                        placeholder="Código"
                        onChange={this.handleCourseNameChange}
                    />
                </div>{' '}
                <div>
                    <div className="formGroupHalf">
                        <p className="controlLabel flexItem formGroupHalfItem">Horarios</p>{' '}
                        <div className="formGroupHalfItem flexRow">
                            <Select
                                className="flexRowItem daySelect"
                                classNamePrefix="select"
                                placeholder="Dia"
                                noOptionsMessage={() => "No hay opciones."}
                                onChange={this.handleDayChange}
                                defaultValue={""}
                                isSearchable={true}
                                name="name"
                                options={this.daysList}
                            />
                            <Select
                                className="flexRowItem hourSelect"
                                classNamePrefix="select"
                                placeholder="Inicio"
                                noOptionsMessage={() => "No hay opciones."}
                                onChange={this.handleStartHourChange}
                                defaultValue={""}
                                isSearchable={true}
                                name="name"
                                options={filteredStartHoursList}
                            />
                            <Select
                                className="flexRowItem hourSelect"
                                classNamePrefix="select"
                                placeholder="Fin"
                                noOptionsMessage={() => "No hay opciones."}
                                onChange={this.handleEndHourChange}
                                defaultValue={""}
                                isSearchable={true}
                                name="name"
                                options={filteredEndHoursList}
                            />
                            <Select
                                className="formControl formGroupFlexItem courseModalSelectSmall"
                                classNamePrefix="select"
                                placeholder="Sede"
                                noOptionsMessage={() => "No hay opciones."}
                                onChange={this.handleLocationChange}
                                defaultValue={""}
                                isSearchable={true}
                                name="name"
                                options={locationList}
                            />
                            <Select
                                className="formControl formGroupFlexItem courseModalSelectSmall"
                                classNamePrefix="select"
                                placeholder="Aula"
                                noOptionsMessage={() => "No hay opciones."}
                                onChange={this.handleClassroomChange}
                                defaultValue={""}
                                isSearchable={true}
                                name="name"
                                options={filteredClassrooms}
                            />
                            <Select
                                className="formControl formGroupFlexItem courseModalSelectSmall"
                                classNamePrefix="select"
                                placeholder="Tipo"
                                noOptionsMessage={() => "No hay opciones."}
                                onChange={this.handleLessonType}
                                defaultValue={""}
                                isSearchable={true}
                                name="name"
                                options={lessonTypes}
                            />
                            <Button className="flexRowItem" bsStyle="primary" onClick={this.handleAddSchedule}>
                                <Glyphicon glyph="plus" />
                            </Button>
                        </div>
                        <Table className="teachers-modal-main-item current-teachers-list teacherFlexMarginLeft tableMargin" striped bordered condensed>
                            <thead>
                                <tr>
                                <th>Tipo</th>
                                <th>Día</th>
                                <th>Inicio</th>
                                <th>Fin</th>
                                <th>Sede</th>
                                <th>Aula</th>
                                <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedulesList}
                            </tbody>
                        </Table>
                    </div>
                    <div className="formGroupHalf">
                        <p className="controlLabel flexItem formGroupHalfItem">Docentes</p>{' '}
                        <div className="teachers-modal-main-item subFlex">
                            <Select
                                className="basic-single modal-select sub-flex-item selectMargin"
                                classNamePrefix="select"
                                placeholder="Seleccione..."
                                noOptionsMessage={() => "No hay opciones."}
                                onChange={this.handleTeacherChange}
                                defaultValue={""}
                                isSearchable={true}
                                name="name"
                                options={this.state.teacherList}
                            />
                            <Select
                                className="basic-single modal-select sub-flex-item selectMargin"
                                classNamePrefix="select"
                                placeholder="Seleccione..."
                                noOptionsMessage={() => "No hay opciones."}
                                onChange={this.handlePositionChange}
                                defaultValue={""}
                                name="position"
                                options={this.positions}
                            />
                            <Button className="sub-flex-item" onClick={this.handleSubmitNewTeacher}>Asociar</Button>
                            <p className="controlLabel formGroupFlexItem noMarginBottom marginLeft">Vacantes</p>{' '}
                            <FormControl
                                className="formControl formGroupFlexItem courseModalSelectSmall"
                                type="number"
                                value={this.state.vacancies}
                                placeholder="Vacantes"
                                onChange={this.handleVacanciesChange}
                            />
                        </div>
                        <Table className="teachers-modal-main-item current-teachers-list teacherFlexMarginLeft tableMargin" striped bordered condensed>
                            <thead>
                                <tr>
                                <th>Nombre</th>
                                <th>Posición</th>
                                <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentTeachersList}
                            </tbody>
                        </Table>
                    </div>
                </div>{' '}
            </div>
            </Modal.Body>
            <Modal.Footer>
                <div className="footerFlex">
                    {this.props.childProps.mode === 'new'
                        ? <Button className="footerFlexItem" bsStyle="success" onClick={this.submitNewCourse}
                            disabled={this.state.subject === '' || this.state.schoolTerm === '' || this.state.courseName === '' 
                            || this.state.schedules.length === 0 || this.state.vacancies === ''}>Crear Curso</Button>
                        : <Button className="footerFlexItem">Guardar</Button>
                    }
                    <Button className="footerFlexItem" bsStyle="danger" onClick={this.props.childProps.handleClose}>Cancelar</Button>
                </div>
            </Modal.Footer>
            </Modal>
        </div>
        );
    }
  }