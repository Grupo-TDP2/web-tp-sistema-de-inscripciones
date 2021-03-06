import React, { Component, Fragment } from "react";
import { LinkContainer } from "react-router-bootstrap";
import { Link, withRouter } from "react-router-dom";
import { Nav, Navbar, NavItem, NavDropdown, MenuItem, Glyphicon } from "react-bootstrap";
import Routes from "./Routes";
import "./App.css";

class App extends Component {

  constructor(props) {
    super(props);
  
    this.state = {
      isAuthenticated: false,
      isAuthenticating: true,
      token: null,
      role: null,
      departmentID: null
    };
  }

  componentDidMount() {
    const authenticated = localStorage.getItem('isAuthenticated');
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    const storedDepartmentID = localStorage.getItem('departmentID');

    if (authenticated === "true") {
      this.setState({
        isAuthenticated: true,
        token: storedToken,
        role: storedRole,
        departmentID: storedDepartmentID
      });
    }

    this.setState({ isAuthenticating: false });
  }
  
  userHasAuthenticated = (authenticated, token, role, departmentID) => {
    this.setState({ 
      isAuthenticated: authenticated,
      token: token,
      role: role,
      departmentID: departmentID
    });
    localStorage.setItem('isAuthenticated', authenticated);
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('departmentID', departmentID);
  }

  handleLogout = event => {
    this.userHasAuthenticated(false, null, null, null);
    this.props.history.push("/login");
  }

  render() {
    const childProps = {
      isAuthenticated: this.state.isAuthenticated,
      token: this.state.token,
      role: this.state.role,
      departmentID: this.state.departmentID,
      userHasAuthenticated: this.userHasAuthenticated,
      handleLogout: this.handleLogout
    };

    return (
      !this.state.isAuthenticating &&
      <div className="App container">
        <Navbar className="customNavbar" fluid collapseOnSelect>
          <Navbar.Header>
            <Navbar.Brand>
              <Link to="/">FIUBA Inscripciones</Link>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav pullLeft>
            {this.state.isAuthenticated && this.state.role === 'Teacher'
              ? <Fragment>
                  <LinkContainer to="/teacherCourses" activeClassName="">
                    <NavItem>Mis Cursos</NavItem>
                  </LinkContainer>
                </Fragment>
              : <Fragment/>
            }
            {this.state.isAuthenticated && this.state.role === 'DepartmentStaff'
              ? <Fragment>
                  <LinkContainer to="/departmentCourses" activeClassName="">
                    <NavItem>Cursos - Departamento</NavItem>
                  </LinkContainer>
                  <LinkContainer to="/teacherCourses" activeClassName="">
                    <NavItem>Cursos - Docente</NavItem>
                  </LinkContainer>
                  <NavDropdown eventKey={3} title="Reportes" id="report-dropdown" className="navDropDown">
                    <LinkContainer to="/pollReport" activeClassName="">
                      <MenuItem eventKey={3.1}>Encuestas</MenuItem>
                    </LinkContainer>
                    <LinkContainer to="/subjectReport" activeClassName="">
                      <MenuItem eventKey={3.2}>Alumnos / Docentes</MenuItem>
                    </LinkContainer>
                  </NavDropdown>
                </Fragment>
              : <Fragment/>
            }
            {this.state.isAuthenticated && this.state.role === 'Admin'
              ? <Fragment>
                  <LinkContainer to="/schoolTerms" activeClassName="">
                    <NavItem>Períodos Lectivos</NavItem>
                  </LinkContainer>
                  <LinkContainer to="/teacherCourses" activeClassName="">
                    <NavItem>Cursos - Docente</NavItem>
                  </LinkContainer>
                  <LinkContainer to="/departmentCourses" activeClassName="">
                    <NavItem>Cursos - Departamento</NavItem>
                  </LinkContainer>
                  <LinkContainer to="/importData" activeClassName="">
                    <NavItem>Carga de Datos</NavItem>
                  </LinkContainer>
                  <NavDropdown eventKey={3} title="Reportes" id="report-dropdown" className="navDropDown">
                    <LinkContainer to="/pollReport" activeClassName="">
                      <MenuItem eventKey={3.1}>Encuestas</MenuItem>
                    </LinkContainer>
                    <LinkContainer to="/subjectReport" activeClassName="">
                      <MenuItem eventKey={3.2}>Alumnos / Docentes</MenuItem>
                    </LinkContainer>
                  </NavDropdown>
                </Fragment>
              : <Fragment/>
            }
            </Nav>
            <Nav pullRight>
            {this.state.isAuthenticated
              ? <NavItem onClick={this.handleLogout}>
                  <Glyphicon glyph="log-out" />
                </NavItem>
              : <Fragment>
                  <LinkContainer to="/login" activeClassName="">
                    <NavItem>
                      <Glyphicon glyph="log-in" />
                    </NavItem>
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