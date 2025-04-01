import logo from '../assets/imgs/logo.png';
import { Link, useLocation } from 'react-router-dom';
import '../assets/css/header.css';

function Header() {
    // Get the current location from React Router
    const location = useLocation();
    
    // Check if the current path starts with '/document'
    // This will keep the link active for all document-related routes and sub-routes
    const isDocumentActive = location.pathname.startsWith('/document');
    const isStatisticActive = location.pathname.startsWith('/statistic');
    const isProcessActive = location.pathname.startsWith('/process');
    
    return (
        <header className="header grid grid-12 ipx-30">
            <div className="span-2 d-flex align-items-center">
                <Link to='/homepage'>
                    <img src={logo} className="header-logo" alt="Logo" />
                </Link>
            </div>
            <div className="span-6 d-flex align-items-center justify-content-around">
                <Link 
                    className={`header-link ${isDocumentActive ? 'active' : ''}`} 
                    to='/document'
                >
                    <p>Kho Tài Liệu</p>
                </Link>
                <Link 
                    className={`header-link ${isStatisticActive ? 'active' : ''}`} 
                    to='/statistic'
                >
                    <p>Thống Kê Học Tập</p>
                </Link>
                <Link 
                    className={`header-link ${isProcessActive ? 'active' : ''}`} 
                    to='/process'
                >
                    <p>Lộ Trình Học Tập</p>
                </Link>
            </div>
        </header>
    )
}

export default Header