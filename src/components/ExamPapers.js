import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../assets/css/document-pages.css';

function ExamPapers() {
    const { departmentId, courseId } = useParams();
    const [searchTerm, setSearchTerm] = useState('');
    
    // Sample data
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
    const courses = [
        { 
            id: 1, 
            name: 'Lập trình Python', 
            documents: [
                { id: 1, type: 'Tài Liệu Ôn Tập', icon: 'description', path: 'study-materials' },
                { id: 2, type: 'Đề Thi', icon: 'assignment', path: 'exam-papers' }
            ]
        },
        { 
            id: 2, 
            name: 'Nhập môn lập trình', 
            documents: [
                { id: 3, type: 'Tài Liệu Ôn Tập', icon: 'description', path: 'study-materials' },
                { id: 4, type: 'Đề Thi', icon: 'assignment', path: 'exam-papers' }
            ]
        },
        { 
            id: 3, 
            name: 'Nhập môn cơ sở dữ liệu', 
            documents: [
                { id: 5, type: 'Tài Liệu Ôn Tập', icon: 'description', path: 'study-materials' },
                { id: 6, type: 'Đề Thi', icon: 'assignment', path: 'exam-papers' }
            ]
        },
        { 
            id: 4, 
            name: 'Lập trình nâng cao', 
            documents: [
                { id: 7, type: 'Tài Liệu Ôn Tập', icon: 'description', path: 'study-materials' },
                { id: 8, type: 'Đề Thi', icon: 'assignment', path: 'exam-papers' }
            ]
        },
        { 
            id: 5, 
            name: 'Lập trình Front - End', 
            documents: [
                { id: 9, type: 'Tài Liệu Ôn Tập', icon: 'description', path: 'study-materials' },
                { id: 10, type: 'Đề Thi', icon: 'assignment', path: 'exam-papers' }
            ]
        },
        { 
            id: 6, 
            name: 'Nguyên lý hệ điều hành', 
            documents: [
                { id: 11, type: 'Tài Liệu Ôn Tập', icon: 'description', path: 'study-materials' },
                { id: 12, type: 'Đề Thi', icon: 'assignment', path: 'exam-papers' }
            ]
        },
        { 
            id: 7, 
            name: 'Kỹ thuật lập trình', 
            documents: [
                { id: 13, type: 'Tài Liệu Ôn Tập', icon: 'description', path: 'study-materials' },
                { id: 14, type: 'Đề Thi', icon: 'assignment', path: 'exam-papers' }
            ]
        },
        { 
            id: 8, 
            name: 'Lập trình hướng đối tượng', 
            documents: [
                { id: 15, type: 'Tài Liệu Ôn Tập', icon: 'description', path: 'study-materials' },
                { id: 16, type: 'Đề Thi', icon: 'assignment', path: 'exam-papers' }
            ]
        },
        { 
            id: 9, 
            name: 'Ngôn ngữ truy vấn có cấu trúc (SQL)', 
            documents: [
                { id: 17, type: 'Tài Liệu Ôn Tập', icon: 'description', path: 'study-materials' },
                { id: 18, type: 'Đề Thi', icon: 'assignment', path: 'exam-papers' }
            ]
        },
        { 
            id: 10, 
            name: 'Ngôn ngữ mô hình hóa UML', 
            documents: [
                { id: 19, type: 'Tài Liệu Ôn Tập', icon: 'description', path: 'study-materials' },
                { id: 20, type: 'Đề Thi', icon: 'assignment', path: 'exam-papers' }
            ]
        },
        { 
            id: 11, 
            name: 'Java nâng cao', 
            documents: [
                { id: 21, type: 'Tài Liệu Ôn Tập', icon: 'description', path: 'study-materials' },
                { id: 22, type: 'Đề Thi', icon: 'assignment', path: 'exam-papers' }
            ]
        },
        { 
            id: 12, 
            name: 'Thiết kế cơ sở dữ liệu', 
            documents: [
                { id: 23, type: 'Tài Liệu Ôn Tập', icon: 'description', path: 'study-materials' },
                { id: 24, type: 'Đề Thi', icon: 'assignment', path: 'exam-papers' }
            ]
        },
        { 
            id: 13, 
            name: 'Mạng máy tính', 
            documents: [
                { id: 23, type: 'Tài Liệu Ôn Tập', icon: 'description', path: 'study-materials' },
                { id: 24, type: 'Đề Thi', icon: 'assignment', path: 'exam-papers' }
            ]
        },
        { 
            id: 14, 
            name: 'Cấu trúc dữ liệu và thuật toán', 
            documents: [
                { id: 23, type: 'Tài Liệu Ôn Tập', icon: 'description', path: 'study-materials' },
                { id: 24, type: 'Đề Thi', icon: 'assignment', path: 'exam-papers' }
            ]
        },
        { 
            id: 15, 
            name: 'Các hệ quản trị cơ sở dữ liệu', 
            documents: [
                { id: 23, type: 'Tài Liệu Ôn Tập', icon: 'description', path: 'study-materials' },
                { id: 24, type: 'Đề Thi', icon: 'assignment', path: 'exam-papers' }
            ]
        },
        { 
            id: 16, 
            name: 'Java cơ bản', 
            documents: [
                { id: 23, type: 'Tài Liệu Ôn Tập', icon: 'description', path: 'study-materials' },
                { id: 24, type: 'Đề Thi', icon: 'assignment', path: 'exam-papers' }
            ]
        },
        { 
            id: 17, 
            name: 'Đồ họa máy tính', 
            documents: [
                { id: 23, type: 'Tài Liệu Ôn Tập', icon: 'description', path: 'study-materials' },
                { id: 24, type: 'Đề Thi', icon: 'assignment', path: 'exam-papers' }
            ]
        },
        { 
            id: 18, 
            name: 'Trí tuệ nhân tạo', 
            documents: [
                { id: 23, type: 'Tài Liệu Ôn Tập', icon: 'description', path: 'study-materials' },
                { id: 24, type: 'Đề Thi', icon: 'assignment', path: 'exam-papers' }
            ]
        },
        { 
            id: 19, 
            name: 'Quản trị dữ án phần mềm', 
            documents: [
                { id: 23, type: 'Tài Liệu Ôn Tập', icon: 'description', path: 'study-materials' },
                { id: 24, type: 'Đề Thi', icon: 'assignment', path: 'exam-papers' }
            ]
        },
        { 
            id: 20, 
            name: 'Kiểm định phần mềm', 
            documents: [
                { id: 23, type: 'Tài Liệu Ôn Tập', icon: 'description', path: 'study-materials' },
                { id: 24, type: 'Đề Thi', icon: 'assignment', path: 'exam-papers' }
            ]
        },
        { 
            id: 21, 
            name: 'Web ngữ nghĩa', 
            documents: [
                { id: 23, type: 'Tài Liệu Ôn Tập', icon: 'description', path: 'study-materials' },
                { id: 24, type: 'Đề Thi', icon: 'assignment', path: 'exam-papers' }
            ]
        },
        { 
            id: 22, 
            name: 'Mẫu thiết kế', 
            documents: [
                { id: 23, type: 'Tài Liệu Ôn Tập', icon: 'description', path: 'study-materials' },
                { id: 24, type: 'Đề Thi', icon: 'assignment', path: 'exam-papers' }
            ]
        },
        { 
            id: 23, 
            name: 'XML và ứng dụng', 
            documents: [
                { id: 23, type: 'Tài Liệu Ôn Tập', icon: 'description', path: 'study-materials' },
                { id: 24, type: 'Đề Thi', icon: 'assignment', path: 'exam-papers' }
            ]
        },
        { 
            id: 24, 
            name: 'Lập trình ứng dụng Web', 
            documents: [
                { id: 23, type: 'Tài Liệu Ôn Tập', icon: 'description', path: 'study-materials' },
                { id: 24, type: 'Đề Thi', icon: 'assignment', path: 'exam-papers' }
            ]
        },
        { 
            id: 25, 
            name: 'Phân tích và thiết kế hệ thống thông tin', 
            documents: [
                { id: 23, type: 'Tài Liệu Ôn Tập', icon: 'description', path: 'study-materials' },
                { id: 24, type: 'Đề Thi', icon: 'assignment', path: 'exam-papers' }
            ]
        },
        { 
            id: 26, 
            name: 'Kỹ nghệ phần mềm', 
            documents: [
                { id: 23, type: 'Tài Liệu Ôn Tập', icon: 'description', path: 'study-materials' },
                { id: 24, type: 'Đề Thi', icon: 'assignment', path: 'exam-papers' }
            ]
        }
    ];
    
    // Sample exam papers data
    const examPapers = [
        { id: 1, name: 'Đề Thi Nhập môn lập trình năm 2023 - 2024', icon: 'picture_as_pdf' },
        { id: 2, name: 'Đề Thi Nhập môn lập trình năm 2022 - 2023', icon: 'picture_as_pdf' },
        { id: 3, name: 'Đề Thi Nhập môn lập trình năm 2021 - 2022', icon: 'picture_as_pdf' },
        { id: 4, name: 'Đề Thi Nhập môn lập trình năm 2020 - 2021', icon: 'picture_as_pdf' },
        { id: 5, name: 'Đề Thi Nhập môn lập trình năm 2019 - 2020', icon: 'picture_as_pdf' }
    ];

    // Tìm tên khoa theo `departmentId`
    const selectedDepartment = departments.find(dept => dept.id.toString() === departmentId);
    const departmentName = selectedDepartment ? selectedDepartment.name : 'Không tìm thấy khoa';

    // Tìm tên môn học theo `departmentId`
    const selectedCourse = courses.find(dept => dept.id.toString() === courseId);
    const courseName = selectedCourse ? selectedCourse.name : 'Không tìm thấy Môn học';

    // Filter exam papers by search term
    const filteredExamPapers = searchTerm
        ? examPapers.filter(paper => 
            paper.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : examPapers;

    return (
        <div className="document-container">
            <div className="document-content">
                <div className="document-header">
                    <h1 className="document-breadcrumb">
                        <Link to="/document" className="breadcrumb-link">KHO TÀI LIỆU</Link> &gt; 
                        <Link to={`/document/${departmentId}`} className="breadcrumb-link">{departmentName}</Link> &gt; 
                        <span className="breadcrumb-link">{courseName}</span> &gt; 
                        <span style={{marginLeft: '8px'}}>Đề Thi</span>
                    </h1>
                </div>
                
                <div className="filter-section">
                    <div className="filter-group">
                        <label>Khoa</label>
                        <select>
                            <option>( Tất cả )</option>
                        </select>
                    </div>
                    
                    <div className="filter-group">
                        <label>Môn học</label>
                        <select>
                            <option>( Tất cả )</option>
                        </select>
                    </div>
                    
                    <div className="filter-group">
                        <label>Loại tài liệu</label>
                        <select>
                            <option>( Tất cả )</option>
                        </select>
                    </div>
                </div>
                
                <div className="materials-list">
                    {filteredExamPapers.map(paper => (
                        <div key={paper.id} className="material-item">
                            <span className="material-icons pdf-icon">{paper.icon}</span>
                            <span className="material-name">{paper.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ExamPapers;