import React, { Component } from "react";
import {Modal, Button, Glyphicon, Table, Row, Col} from 'react-bootstrap';
import './CourseInfoModal.css';
import './TeachersModal.css';
import Select from 'react-select';

export default class CourseInfoModal extends Component {
    constructor(props, context) {
      super(props, context);
  
      this.positions = [
        {
          label: "Titular",
          value: "course_chief"
        },
        {
          label: "Jefe Trabajos Prácticos",
          value: "practice_chief"
        },
        {
          label: "Asistente Primero",
          value: "first_assistant"
        },
        {
          label: "Asistente Segundo",
          value: "second_assistant"
        },
        {
            label: "Ayudante Ad-Honorem",
            value: "ad_honorem"
        }
      ];

      this.positionMappings = {
        'course_chief': 'Titular',
        'practice_chief': 'Jefe Trabajos Prácticos',
        'first_assistant': 'Asistente Primero',
        'second_assistant': 'Asistente Segundo',
        'ad_honorem': 'Ayudante Ad-Honorem'
      }

      this.daysList = [
        { label: "Lunes", value: "Monday", order: 1 },
        { label: "Martes", value: "Tuesday", order: 2 },
        { label: "Miercoles", value: "Wednesday", order: 3 },
        { label: "Jueves", value: "Thursday", order: 4 },
        { label: "Viernes", value: "Friday", order: 5 },
        { label: "Sabado", value: "Saturday", order: 6 }
      ];

      this.state = {
        show: true,
        subjectList: [
            {
                label: "75.12 Analisis de la Informacion",
                value: "aninfo"
            },
            {
                label: "75.40 Computacion",
                value: "compu"
            }
        ],
        subject: "",
        location: "",
        classroomList: [
            {
                label: "324",
                value: 324
            },
            {
                label: "316",
                value: 316
            }
        ],
        classroom: "",
        schedules: [],
        day: "",
        startHour: "",
        endHour: "",
        teacherList: [
            {
                value: "1",
                label: "Carlos Fontela"
            },
            {
                value: "2",
                label: "Luis Argerich"
            }
        ],
        currentTeachers: [],
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
      this.handleSubmitNewTeacher = this.handleSubmitNewTeacher.bind(this);
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

    handleAddSchedule() {
        let mSchedules = this.state.schedules;
        mSchedules.push({day: this.state.day, startHour: this.state.startHour, endHour: this.state.endHour});
        mSchedules.sort((a,b) => this.daysList.find((day) => day.value === a.day).order - this.daysList.find((day) => day.value === b.day).order);
        this.setState({ schedules: mSchedules });
    }

    handleTeacherChange(e) {
        this.setState({ addTeacherID: e.value });
    }

    handlePositionChange(e) {
        this.setState({ addTeacherPosition: e.value });
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

    render() {

        const daysList = this.daysList;

        const locationList = [
            { label: "Las Heras", value: "LH" },
            { label: "Paseo Colon", value: "PC" }
        ]

        const hoursList = [
            {value: "7:00", label: '7:00', day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]},
            {value: "7:30", label: '7:30', day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]},
            {value: "8:00", label: '8:00', day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]},
            {value: "8:30", label: '8:30', day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]},
            {value: "9:00", label: '9:00', day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]},
            {value: "9:30", label: '9:30', day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]},
            {value: "10:00", label: '10:00', day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]},
            {value: "10:30", label: '10:30', day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]},
            {value: "11:00", label: '11:00', day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]},
            {value: "11:30", label: '11:30', day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]},
            {value: "12:00", label: '12:00', day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]},
            {value: "12:30", label: '12:30', day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]},
            {value: "13:00", label: '13:00', day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]},
            {value: "13:30", label: '13:30', day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]},
            {value: "14:00", label: '14:00', day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]},
            {value: "14:30", label: '14:30', day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]},
            {value: "15:00", label: '15:00', day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]},
            {value: "15:30", label: '15:30', day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]},
            {value: "16:00", label: '16:00', day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]},
            {value: "16:30", label: '16:30', day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]},
            {value: "17:00", label: '17:00', day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]},
            {value: "17:30", label: '17:30', day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]},
            {value: "18:00", label: '18:00', day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]},
            {value: "18:30", label: '18:30', day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]},
            {value: "19:00", label: '19:00', day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]},
            {value: "19:30", label: '19:30', day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]},
            {value: "20:00", label: '20:00', day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]},
            {value: "20:30", label: '20:30', day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]},
            {value: "21:00", label: '21:00', day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]},
            {value: "21:30", label: '21:30', day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]},
            {value: "22:00", label: '22:00', day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]},
            {value: "22:30", label: '22:30', day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]},
            {value: "23:00", label: '23:00', day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]}
        ];

        var schedulesList = this.state.schedules.map(function(schedule) {
            const days = daysList;
            return (
              <li key={schedule.day + " " + schedule.startHour + " - " + schedule.endHour}>
                {days.find((day) => day.value === schedule.day).label + " " + schedule.startHour + " - " + schedule.endHour}
              </li>
            );
        });

        var currentTeachersList = this.state.currentTeachers.map(function(teacher) {
            return (
              <tr key={teacher.id}>
                <td>{teacher.first_name + " " + teacher.last_name}</td>
                <td>{teacher.positionMapped}</td>
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
                    <p className="controlLabel formGroupFlexItem noMarginBottom">Sede</p>{' '}
                    <Select
                        className="formControl formGroupFlexItem courseModalSelectSmall"
                        classNamePrefix="select"
                        placeholder="Seleccione..."
                        noOptionsMessage={() => "No hay opciones."}
                        onChange={this.handleLocationChange}
                        defaultValue={""}
                        isSearchable={true}
                        name="name"
                        options={locationList}
                    />
                    <p className="controlLabel formGroupFlexItem noMarginBottom">Aula</p>{' '}
                    <Select
                        className="formControl formGroupFlexItem courseModalSelectSmall"
                        classNamePrefix="select"
                        placeholder="Seleccione..."
                        noOptionsMessage={() => "No hay opciones."}
                        onChange={this.handleClassroomChange}
                        defaultValue={""}
                        isSearchable={true}
                        name="name"
                        options={this.state.classroomList}
                    />
                </div>{' '}
                <Row>
                    <Col xs={12} md={5} className="formGroupHalf">
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
                            <Button className="flexRowItem" bsStyle="primary" onClick={this.handleAddSchedule}>
                                <Glyphicon glyph="plus" />
                            </Button>
                        </div>
                        <ul className="formGroupHalfItem itemList">
                            {schedulesList}
                        </ul>
                    </Col>
                    <Col xs={12} md={7} className="formGroupHalf">
                        <p className="controlLabel flexItem formGroupHalfItem teacherFlexMarginLeft">Docentes</p>{' '}
                        <div className="teachers-modal-main-item sub-flex">
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
                        </div>
                        <Table className="teachers-modal-main-item current-teachers-list teacherFlexMarginLeft tableMargin" striped bordered condensed>
                            <thead>
                                <tr>
                                <th>Nombre</th>
                                <th>Posición</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentTeachersList}
                            </tbody>
                        </Table>
                    </Col>
                </Row>{' '}
            </div>
            </Modal.Body>
            <Modal.Footer>
                <div className="footerFlex">
                    {this.props.childProps.mode === 'new'
                        ? <Button className="footerFlexItem" onClick={this.props.childProps.addNewCourse}>Crear Curso</Button>
                        : <Button className="footerFlexItem">Guardar</Button>
                    }
                    <Button className="footerFlexItem" onClick={this.props.childProps.handleClose}>Cancelar</Button>
                </div>
            </Modal.Footer>
            </Modal>
        </div>
        );
    }
  }