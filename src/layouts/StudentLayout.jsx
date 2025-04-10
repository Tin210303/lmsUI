import StudentHeader from '../components/student/StudentHeader';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

const StudentLayout = ({ children }) => (
  <>
    <StudentHeader />
    <div className="d-flex">
      <Sidebar />
      {children}
    </div>
    <Footer />
  </>
);

export default StudentLayout;
