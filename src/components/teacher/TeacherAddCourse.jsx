import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/css/teacher-add-course.css';

const TeacherAddCourse = () => {
    const navigate = useNavigate();
    const [isEndDateEnabled, setIsEndDateEnabled] = React.useState(false);
    const today = new Date().toISOString().split('T')[0];

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here
        console.log('Course added');
        navigate('/teacher/dashboard');
    };

    return (
        <div className="teacher-add-course-container">
            <h2>Thêm khóa học mới</h2>
            <form onSubmit={handleSubmit} className="teacher-add-course-form">
                <div className="teacher-form-group">
                    <label>Tên khóa học <span style={{color: '#f00', marginLeft: '20px'}}>*</span></label>
                    <input type="text" required />
                </div>
                <div className="teacher-form-group">
                    <label>Loại <span style={{color: '#f00', marginLeft: '20px'}}>*</span></label>
                    <select required>
                        <option value="">Chọn loại</option>
                        <option value="public">Khóa học chung</option>
                        <option value="private">Khóa học riêng tư</option>
                    </select>
                </div>
                <div className="teacher-form-group">
                    <label>Ngày bắt đầu khóa học <span style={{color: '#f00', marginLeft: '20px'}}>*</span></label>
                    <input type="date" required defaultValue={today} />
                </div>
                <div className="teacher-form-group">
                    <label>
                        Ngày kết thúc khóa học
                        <input className='teacher-form-group-checkbox' type="checkbox" onChange={() => setIsEndDateEnabled(!isEndDateEnabled)} />
                    </label>
                    <input type="date" required disabled={!isEndDateEnabled} />
                </div>
                <div className="teacher-form-group">
                    <label>Ảnh đại diện cho khóa học<span style={{color: '#f00', marginLeft: '26px'}}></span></label>
                    <input type="file" />
                </div>
                <div className="teacher-form-group">
                    <label>Mô tả về khóa học<span style={{color: '#f00', marginLeft: '26px'}}></span></label>
                    <textarea rows="4"></textarea>
                </div>
                <div className="teacher-form-actions">
                    <button type="submit" className="teacher-confirm-button">Xác nhận</button>
                    <button type="button" className="teacher-cancel-button" onClick={() => navigate('/teacher/dashboard')}>Hủy</button>
                </div>
            </form>
        </div>
    );
};

export default TeacherAddCourse; 