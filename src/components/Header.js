import logo from '../assets/imgs/logo.png';
import '../assets/css/header.css';
function Header() {
    return (
        <header className="header grid grid-12 ipx-30">
            <div className="span-2 d-flex align-items-center">
                <a href='#'>
                    <img src={logo} className="header-logo" />
                </a>
            </div>
            <div className="span-4 d-flex align-items-center justify-content-around">
                <a className='header-link' href='#'>
                    <p>Kho Tài Liệu</p>
                </a>
                <a className='header-link' href='#'>
                    <p>Các Chứng Chỉ Bắt Buộc</p>
                </a>
            </div>
        </header>
    )
}

export default Header