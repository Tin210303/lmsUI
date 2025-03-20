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
import RightSideBar from './components/RightSideBar';

function App() {
  return (
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
      </Routes>
    </Router>
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
