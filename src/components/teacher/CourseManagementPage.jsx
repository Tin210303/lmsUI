import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../assets/css/course-management.css';
import { Trash2 } from 'lucide-react';
import logo from '../../logo.svg';
import Alert from '../common/Alert';

const CourseManagementPage = () => {
    const { courseId } = useParams();
    console.log(courseId);
    
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('info');
    const [course, setCourse] = useState(null);
    const [students, setStudents] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        type: 'Khóa học chung',
        major: '',
        endDate: '',
        description: '',
        image: null
    });

    const [alert, setAlert] = useState(null);

    useEffect(() => {
        fetchData();
    }, [courseId]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token found');

            // Fetch course details
            const courseResponse = await axios.get(`http://localhost:8080/lms/course/${courseId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setCourse(courseResponse.data.result);

            // Fetch enrolled students using the specific API
            const studentsResponse = await axios.get(`http://localhost:8080/lms/studentcourse/studentofcourse/${courseId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setStudents(studentsResponse.data.result || []);

            // Fetch course registration requests using the new API
            const registrationsResponse = await axios.get(`http://localhost:8080/lms/joinclass/studentrequest/${courseId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setRegistrations(registrationsResponse.data.result || []);

            setFormData({
                name: courseResponse.data.result.name,
                type: courseResponse.data.result.status === 'PUBLIC' ? 'Khóa học chung' : 'Khóa học riêng',
                major: courseResponse.data.result.major,
                endDate: courseResponse.data.result.endDate,
                description: courseResponse.data.result.description,
                image: courseResponse.data.result.image
            });
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'An error occurred');
            console.error("Error fetching course management data:", err);
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
    };

    const handleUpdateCourse = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token found');

            // Xác định learningDurationType dựa trên endDate
            const learningDurationType = formData.endDate ? 'Có thời hạn' : 'Không thời hạn';

            await axios.put(`http://localhost:8080/lms/course/update`, {
                idCourse: courseId,
                name: formData.name,
                description: formData.description,
                endDate: formData.endDate,
                major: formData.major,
                status: formData.type === 'Khóa học chung' ? 'PUBLIC' : 'PRIVATE',
                learningDurationType: learningDurationType
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            showAlert('success', 'Thành công', 'Cập nhật thông tin khóa học thành công!');
            fetchData();

        } catch (err) {
            showAlert('error', 'Lỗi', 'Có lỗi xảy ra khi cập nhật thông tin khóa học');
        }
    };

    const handleRegistrationAction = async (studentId, action) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            showAlert('error', 'Lỗi', 'Không tìm thấy token xác thực');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('courseId', courseId);
            formData.append('studentId', studentId);

            let apiUrl = '';
            let successMessage = '';

            if (action === 'accept') {
                apiUrl = `http://localhost:8080/lms/joinclass/approved`;
                successMessage = 'Đã chấp nhận sinh viên vào khóa học.';
            } else if (action === 'reject') {
                apiUrl = `http://localhost:8080/lms/joinclass/rejected`;
                successMessage = 'Đã từ chối yêu cầu của sinh viên.';
            } else {
                throw new Error('Invalid action specified');
            }

            await axios.post(apiUrl, formData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                }
            });
            showAlert('success', 'Thành công', successMessage);
            fetchData();
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data?.error || `Có lỗi xảy ra khi ${action === 'accept' ? 'chấp nhận' : 'từ chối'} sinh viên.`;
            showAlert('error', 'Lỗi', errorMsg);
            console.error(`Error ${action === 'accept' ? 'accepting' : 'rejecting'} registration:`, err.response?.data || err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCourse = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token found');

            await axios.delete(`http://localhost:8080/lms/course/${courseId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            showAlert('success', 'Thành công', 'Đã xóa khóa học thành công!');
            setTimeout(() => {
                navigate('/teacher/dashboard');
            }, 2000);
        } catch (err) {
            showAlert('error', 'Lỗi', 'Có lỗi xảy ra khi xóa khóa học. Vui lòng thử lại sau.');
            console.error('Error deleting course:', err);
        }
    };

    const renderCourseInfo = () => (
        <div className="course-info-form">
            <h2>Thông tin khóa học</h2>
            <form onSubmit={handleUpdateCourse}>
                <div className="form-group-manage">
                    <label>Tên khóa học</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                </div>

                <div className="form-group-manage">
                    <label>Loại</label>
                    <select 
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                        <option value="PUBLIC">Khóa học chung</option>
                        <option value="PRIVATE">Khóa học riêng tư</option>
                    </select>
                </div>

                <div className="form-group-manage">
                    <label>Chuyên ngành</label>
                    <input
                        type="text"
                        value={formData.major}
                        onChange={(e) => setFormData({...formData, major: e.target.value})}
                    />
                </div>

                <div className="form-group-manage">
                    <label>Ngày kết thúc khóa học</label>
                    <input
                        type="date"
                        value={formData.endDate ? formData.endDate.split('T')[0] : ''}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    />
                </div>

                <div className="form-group-manage">
                    <label>Ảnh đại diện cho khóa học</label>
                    <div className="image-upload">
                        <input type="file" accept="image/*" onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                                setFormData({...formData, image: URL.createObjectURL(file)});
                            }
                        }} />
                    </div>
                </div>

                <div className="form-group-manage">
                    <label>Mô tả về khóa học</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        rows={4}
                    />
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-confirm">Xác nhận</button>
                </div>
            </form>
        </div>
    );

    const renderMembers = () => (
        <div className="course-members">
            <h2>Thành viên khóa học</h2>
            <div className="members-list">
                <div className="members-section">
                    <h3>Giáo Viên</h3>
                    <div className="teacher-item d-flex">
                        <img src={logo} alt='Ava' />
                        <div>
                            <div>{course.teacher.fullName}</div>
                            <div className="student-email">{course.teacher.email}</div>
                        </div>
                    </div>
                </div>
                
                <div className="members-section">
                    <h3>Sinh Viên</h3>
                    {students.map(student => (
                        <div key={student.id} className="member-item">
                            <div className='d-flex'>
                                <img src={student.avatar || logo} alt='Ava' />
                                <div>
                                    <div>{student.fullName}</div>
                                    <div className="student-email">{student.email}</div>
                                </div>
                            </div>
                            <button className="remove-member-btn"><Trash2 size={16}/></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderRegistrations = () => (
        <div className="course-registrations">
            <h2>Đơn đăng ký khóa học của sinh viên</h2>
            <div className="registrations-table">
                <table>
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Sinh viên đăng ký</th>
                            <th>Ngày đăng ký</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {registrations.map((registration, index) => (
                            <tr key={registration.id}>
                                <td>{index + 1}</td>
                                <td>
                                    <div className="student-info">
                                        <img src={registration.avatar || logo} alt={registration.fullName} />
                                        <div>
                                            <div>{registration.fullName}</div>
                                            <div className="student-email">{registration.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    {registration.registrationDate ? 
                                     new Date(registration.registrationDate).toLocaleDateString('vi-VN') : 'N/A'}
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button 
                                            className="accept-btn"
                                            onClick={() => handleRegistrationAction(registration.id, 'accept')}
                                        >
                                            Chấp nhận
                                        </button>
                                        <button 
                                            className="reject-btn"
                                            onClick={() => handleRegistrationAction(registration.id, 'reject')}
                                        >
                                            Từ chối
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    if (loading) return <div className="loading">Đang tải...</div>;
    if (error) return <div className="error">Lỗi: {error}</div>;

    return (
        <div className="course-management-container">
            {alert && (
                <div className="alert-container">
                    <Alert
                        type={alert.type}
                        title={alert.title}
                        message={alert.message}
                        onClose={() => setAlert(null)}
                    />
                </div>
            )}
            <div className="course-management-content">
                <div className="content-left">
                    {activeTab === 'info' && renderCourseInfo()}
                    {activeTab === 'members' && renderMembers()}
                    {activeTab === 'registrations' && renderRegistrations()}
                </div>
                
                <div className="content-right">
                    <div className="admin-section">
                        <h3>Khu vực quản trị</h3>
                        <ul>
                            <li>
                                <a 
                                    href="#" 
                                    className={activeTab === 'info' ? 'active' : ''}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setActiveTab('info');
                                    }}
                                >
                                    Chỉnh sửa thông tin khóa học
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="#" 
                                    className={activeTab === 'members' ? 'active' : ''}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setActiveTab('members');
                                    }}
                                >
                                    Quản lý thành viên khóa học
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="#" 
                                    className={activeTab === 'registrations' ? 'active' : ''}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setActiveTab('registrations');
                                    }}
                                >
                                    Quản lý yêu cầu đăng ký của sinh viên
                                </a>
                            </li>
                            <li>
                                <a href="#">Quản lý hỏi đáp của sinh viên</a>
                            </li>
                            <li>
                                <button  
                                    className="delete-link" 
                                    onClick={(e) => {
                                        e.preventDefault(); 
                                        setShowDeleteConfirm(true);
                                    }}
                                >
                                    Xóa khóa học
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {showDeleteConfirm && (
                <div className="delete-modal-overlay">
                    <div className="delete-modal-container">
                        <h2>Xác nhận xóa</h2>
                        <p>Bạn có chắc chắn muốn xóa khóa học này không? Hành động này không thể hoàn tác.</p>
                        <div className="delete-modal-actions">
                            <button 
                                className="btn-confirm-delete"
                                onClick={() => {
                                    handleDeleteCourse();
                                    setShowDeleteConfirm(false);
                                }}
                            >
                                <Trash2 size={16} /> Xác nhận xóa
                            </button>
                            <button 
                                className="btn-cancel-delete"
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseManagementPage; 