import React from "react";
import { Route, Switch } from "react-router-dom";
import Home from "./containers/Home";
import NotFound from "./containers/NotFound";
import AppliedRoute from "./components/AppliedRoute";
import Login from "./containers/Login";
import TeacherCourses from "./containers/TeacherCourses";
import CourseStudents from "./containers/CourseStudents";
import DepartmentCourses from "./containers/DepartmentCourses";
import SchoolTerms from "./containers/SchoolTerms";

export default ({ childProps }) =>
  <Switch>
    <AppliedRoute path="/" exact component={Home} props={childProps} />
    <AppliedRoute path="/login" exact component={Login} props={childProps} />
    <AppliedRoute path="/teacherCourses" exact component={TeacherCourses} props={childProps} />
    <AppliedRoute path="/courseStudents/:courseID/:subject" exact component={CourseStudents} props={childProps} />
    <AppliedRoute path="/departmentCourses" exact component={DepartmentCourses} props={childProps} />
    <AppliedRoute path="/schoolTerms" exact component={SchoolTerms} props={childProps} />
    { /* Finally, catch all unmatched routes */ }
    <Route component={NotFound} />
  </Switch>;