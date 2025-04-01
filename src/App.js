import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header'
import Nav from './components/Nav'
import Content from './components/Content';
import Login from './components/Login'
import StudentPortal from './components/StudentPortal';
import CoursesPage from './components/CoursesPage';
import AcademicResults from './components/AcademicResults';
import Calendar from './components/Calendar'
import Forum from './components/Forums'
import Setting from './components/Setting'
import Document from './components/Document';
import DepartmentDocument from './components/DepartmentDocument';
import ExamPapers from './components/ExamPapers';
import StudyMaterials from './components/StudyMaterials';
import Statistics from './components/Statistics'
import ProcessPlan from './components/ProcessPlan';
import StudyPlan from './components/StudyPlan';
import CustomPlan from './components/CustomPlan';
import RightSideBar from './components/RightSideBar';
import { UserProvider } from './context/userContext';


function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/homepage" element={<Layout />}>
            <Route index element={<StudentPortal />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="results" element={<AcademicResults />} />
            <Route path="calendars" element={<Calendar />} />
            <Route path="forums" element={<Forum />} />
            <Route path="settings" element={<Setting />} />
          </Route>
          <Route path="/document" element={
            <div className="flex flex-col min-h-screen bg-gray-100">
              <Header/>
              <div className="d-flex flex-1">
                <Nav/>
                <Document />
              </div>
            </div>
          } />
          <Route path="/document/:departmentId" element={
            <div className="flex flex-col min-h-screen bg-gray-100">
              <Header/>
              <div className="d-flex flex-1">
                <Nav/>
                <DepartmentDocument />
              </div>
            </div>
          } />
          <Route path="/document/:departmentId/:courseId/exam-papers" element={
            <div className="flex flex-col min-h-screen bg-gray-100">
              <Header/>
              <div className="d-flex flex-1">
                <Nav/>
                <ExamPapers />
              </div>
            </div>
          } />
          <Route path="/document/:departmentId/:courseId/study-materials" element={
            <div className="flex flex-col min-h-screen bg-gray-100">
              <Header/>
              <div className="d-flex flex-1">
                <Nav/>
                <StudyMaterials />
              </div>
            </div>
          } />
          <Route path="/statistic" element={
            <div className="flex flex-col min-h-screen bg-gray-100">
              <Header/>
              <div className="d-flex flex-1">
                <Nav/>
                <Statistics />
              </div>
            </div>
          } />
          <Route path="/process" element={
            <div className="flex flex-col min-h-screen bg-gray-100">
              <Header/>
              <div className="d-flex flex-1">
                <Nav/>
                <ProcessPlan />
              </div>
            </div>
          } /> 
          <Route path="/process/:year" element={
            <div className="flex flex-col min-h-screen bg-gray-100">
              <Header/>
              <div className="d-flex flex-1">
                <Nav/>
                <StudyPlan />
              </div>
            </div>
          } />
          <Route path="/process/customplan" element={
            <div className="flex flex-col min-h-screen bg-gray-100">
              <Header/>
              <div className="d-flex flex-1">
                <Nav/>
                <CustomPlan />
              </div>
            </div>
          } />
        </Routes>
      </Router>
    </UserProvider>
  );
}

function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header/>
      <div className="d-flex flex-1">
        <Nav/>
        <Content />
        <RightSideBar />
      </div>
    </div>
  )
}

export default App;