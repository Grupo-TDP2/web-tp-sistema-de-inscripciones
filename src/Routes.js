import React from "react";
import { Route, Switch } from "react-router-dom";
import Home from "./containers/Home";
import NotFound from "./containers/NotFound";
import AppliedRoute from "./components/AppliedRoute";
import Login from "./containers/Login";
import TeacherCourses from "./containers/TeacherCourses";
import CourseStudents from "./containers/CourseStudents";
import CourseExams from "./containers/CourseExams";
import DepartmentCourses from "./containers/DepartmentCourses";
import SchoolTerms from "./containers/SchoolTerms";
import ExamStudents from "./containers/ExamStudents";
import ImportData from "./containers/ImportData";
import ImportsHistory from "./containers/ImportsHistory";
import PollReport from "./containers/PollReport";

export default ({ childProps }) =>
  <Switch>
    <AppliedRoute path="/" exact component={Home} props={childProps} />
    <AppliedRoute path="/login" exact component={Login} props={childProps} />
    <AppliedRoute path="/teacherCourses" exact component={TeacherCourses} props={childProps} />
    <AppliedRoute path="/courseStudents/:courseID/:subject/:department" exact component={CourseStudents} props={childProps} />
    <AppliedRoute path="/courseExams/:courseID/:subject/:department" exact component={CourseExams} props={childProps} />
    <AppliedRoute path="/examStudents/:courseID/:subject/:department/:date/:examID" exact component={ExamStudents} props={childProps} />
    <AppliedRoute path="/departmentCourses" exact component={DepartmentCourses} props={childProps} />
    <AppliedRoute path="/schoolTerms" exact component={SchoolTerms} props={childProps} />
    <AppliedRoute path="/importData" exact component={ImportData} props={childProps} />
    <AppliedRoute path="/importsHistory" exact component={ImportsHistory} props={childProps} />
    <AppliedRoute path="/pollReport" exact component={PollReport} props={childProps} />
    { /* Finally, catch all unmatched routes */ }
    <Route component={NotFound} />
  </Switch>;