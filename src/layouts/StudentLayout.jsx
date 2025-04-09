import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

const StudentLayout = ({ children }) => (
  <>
    <Header />
    <div className="d-flex">
      <Sidebar />
      {children}
    </div>
    <Footer />
  </>
);

export default StudentLayout;
