import React, { Component, Fragment } from "react";
import { LinkContainer } from "react-router-bootstrap";
import { Link, withRouter } from "react-router-dom";
import { Nav, Navbar, NavItem } from "react-bootstrap";
import Routes from "./Routes";
import "./App.css";

class App extends Component {

  constructor(props) {
    super(props);
  
    this.state = {
      isAuthenticated: false,
      isAuthenticating: true,
      token: null
    };
  }

  componentDidMount() {
    const authenticated = localStorage.getItem('isAuthenticated');
    const storedToken = localStorage.getItem('token');

    if (authenticated === "true") {
      this.setState({
        isAuthenticated: true,
        token: storedToken
      });
    }

    this.setState({ isAuthenticating: false });
  }
  
  userHasAuthenticated = (authenticated, token) => {
    this.setState({ isAuthenticated: authenticated });
    this.setState({ token: token});
    localStorage.setItem('isAuthenticated', authenticated);
    localStorage.setItem('token', token);
  }

  handleLogout = event => {
    this.userHasAuthenticated(false, null);
    this.props.history.push("/login");
  }

  render() {
    const childProps = {
      isAuthenticated: this.state.isAuthenticated,
      token: this.state.token,
      userHasAuthenticated: this.userHasAuthenticated,
      handleLogout: this.handleLogout
    };

    return (
      !this.state.isAuthenticating &&
      <div className="App container">
        <Navbar fluid collapseOnSelect>
          <Navbar.Header>
            <Navbar.Brand>
              <Link to="/">FIUBA Inscripciones</Link>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav pullLeft>
            {this.state.isAuthenticated
              ? <Fragment>
                  <LinkContainer to="/teacherCourses" activeClassName="">
                    <NavItem>Mis Cursos</NavItem>
                  </LinkContainer>
                </Fragment>
              : <Fragment/>
            }
            </Nav>
            <Nav pullRight>
            {this.state.isAuthenticated
              ? <NavItem onClick={this.handleLogout}>Cerrar Sesión</NavItem>
              : <Fragment>
                  <LinkContainer to="/login" activeClassName="">
                    <NavItem>Iniciar Sesión</NavItem>
                  </LinkContainer>
                </Fragment>
            }
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <Routes childProps={childProps} />
      </div>
    );
  }
}

export default withRouter(App);