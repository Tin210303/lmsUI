import Header from '../components/Header'; // Header riêng nếu có
import TeacherSidebar from '../components/Sidebar';
import Footer from '../components/Footer';

const TeacherLayout = ({ children }) => (
  <>
    <Header />
    <div className="d-flex">
      <TeacherSidebar />
      {children}
    </div>
    <Footer />
  </>
);

export default TeacherLayout;
