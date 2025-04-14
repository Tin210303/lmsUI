import TeacherHeader from '../components/teacher/TeacherHeader';
import TeacherSidebar from '../components/teacher/TeacherSidebar';
import Footer from '../components/Footer';

const TeacherLayout = ({ children }) => (
  <>
    <TeacherHeader />
    <div className="d-flex">
      <TeacherSidebar />
      {children}
    </div>
    <Footer />
  </>
);

export default TeacherLayout;
