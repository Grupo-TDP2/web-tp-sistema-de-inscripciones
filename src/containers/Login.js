import React, { Component } from "react";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import "./Login.css";
import axios from 'axios';
import { ToastContainer } from "react-toastr";
import "../components/Toastr.css";

let container;

export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      username: "",
      password: ""
    };

    this.displayErrorToastr = this.displayErrorToastr.bind(this);
  }

  validateForm() {
    return this.state.username.length > 0 && this.state.password.length > 0;
  }

  displayErrorToastr(message) {
    container.error(<div></div>, <em>{message}</em>, 
        {closeButton: true, timeOut: 3000}
      );
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleSubmit = async event => {
    event.preventDefault();

    const authFunction = (token, role) => this.props.userHasAuthenticated(true, token, role);
    const goToRoute = route => this.props.history.push(route);
    const setIsLoadingFlag = flag => this.setState({ isLoading: flag});
    const errorToastr = message => this.displayErrorToastr(message);

    this.setState({ isLoading: true });
    
    //ESTO SE USA PARA AUTH
    /*try {
      axios.post(AUTH_ENDPOINT, {
        username: this.state.username,
        password: this.state.password
      })
        .then(function (response) {
          setIsLoadingFlag(false);
          authFunction(response.data.access_token);
          goToRoute("/");
        })
        .catch(function (error) {
          setIsLoadingFlag(false);
          errorToastr("Hubo un error al iniciar sesion. Intente nuevamente.");
          console.log(error);
        });
    } catch (e) {
      alert(e.message);
    }*/

    setIsLoadingFlag(false);

    if (this.state.username === "departamento") {
      authFunction("123", "departamento");
      goToRoute("/departmentCourses");
    } else if (this.state.username === "docente") {
      authFunction("123", "docente");
      goToRoute("/teacherCourses");
    } else {
      errorToastr("Hubo un error al iniciar sesion. Intente nuevamente.");
    }
  }

  render() {
    return (
      <div className="Login">
        <ToastContainer
            ref={ref => container = ref}
            className="toast-top-right"
          />
        <form onSubmit={this.handleSubmit}>
          <FormGroup controlId="username" bsSize="large">
            <ControlLabel>Usuario</ControlLabel>
            <FormControl
              autoFocus
              type="username"
              value={this.state.username}
              onChange={this.handleChange}
            />
          </FormGroup>
          <FormGroup controlId="password" bsSize="large">
            <ControlLabel>Contraseña</ControlLabel>
            <FormControl
              value={this.state.password}
              onChange={this.handleChange}
              type="password"
            />
          </FormGroup>
          <LoaderButton
            block
            bsSize="large"
            disabled={!this.validateForm()}
            type="submit"
            isLoading={this.state.isLoading}
            text="Iniciar sesión"
            loadingText="Ingresando..."
          />
        </form>
      </div>
    );
  }
}