import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/Document.css';

function Document() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    // Sample department data
    const departments = [
      { id: 1, name: 'Khoa Công nghệ Thông tin', icon: 'computer' },
      { id: 2, name: 'Khoa Báo Chí Truyền Thông', icon: 'announcement' },
      { id: 3, name: 'Khoa Địa Lý - Địa Chất', icon: 'public' },
      { id: 4, name: 'Khoa Điện, Điện Tử Và Công Nghệ Vật Liệu', icon: 'electrical_services' },
      { id: 5, name: 'Khoa Hóa Học', icon: 'science' },
      { id: 6, name: 'Khoa Sinh Học', icon: 'biotech' },
      { id: 7, name: 'Khoa Kiến Trúc', icon: 'architecture' },
      { id: 8, name: 'Khoa Lịch Sử', icon: 'history' },
      { id: 9, name: 'Khoa Lý Luận Chính Trị', icon: 'gavel' },
      { id: 10, name: 'Khoa Môi Trường', icon: 'eco' },
      { id: 11, name: 'Khoa Ngữ Văn', icon: 'menu_book' },
      { id: 12, name: 'Khoa Xã hội học và Công tác xã hội', icon: 'people' },
      { id: 13, name: 'Khoa Toán', icon: 'calculate' },
      { id: 14, name: 'Môn Học Đại Cương', icon: 'school' },
  ];

    const handleDepartment = (departmentId) => {
        navigate(`/document/${departmentId}`);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e?.target?.value);
    };

    // Filter courses by search term
    const filteredDepartments = searchTerm
        ? departments.filter(department => 
          department.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : departments;

    return (
        <div className="document-container">
            <div className="document-content">
                <h1 className="document-title">KHO TÀI LIỆU</h1>
                <div className='d-flex justify-content-between align-items-center'>
                    <div className="filter-section">
                        <div className="filter-group">
                            <label>Khoa</label>
                            <select>
                                <option>Tất cả</option>
                            </select>
                        </div>
                        
                        <div className="filter-group">
                            <label>Môn học</label>
                            <select>
                                <option>Tất cả</option>
                            </select>
                        </div>
                        
                        <div className="filter-group">
                            <label>Loại tài liệu</label>
                            <select>
                                <option>Tất cả</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="search-box">
                        <span className="material-icons search-icon">search</span>
                        <input 
                            type="text" 
                            placeholder="Nhập tên Khoa cần tìm" 
                            value={searchTerm} 
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>
                
                <div className="departments-grid">
                    {filteredDepartments.map(department => (
                        <div 
                            key={department.id} 
                            className="department-card" 
                            onClick={() => handleDepartment(department.id)}
                        >
                            <span className="material-icons department-icon">{department.icon}</span>
                            <span className="department-name">{department.name}</span>
                            <span className="material-icons card-arrow">arrow_forward</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Document;