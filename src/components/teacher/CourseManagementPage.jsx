import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../assets/css/course-management.css';
import { Trash2, UserPlus } from 'lucide-react';
import logo from '../../logo.svg';
import Alert from '../common/Alert';
import { API_BASE_URL, GET_PROGRESS_PERCENT, GET_JOINCLASS_REQUEST, GET_STUDENT_COURSE, JOINCLASS_APPROVED_API, JOINCLASS_REJECTED_API, DELETE_STUDENT_COURSE, UPDATE_COURSE_API, GET_MAJOR_API } from '../../services/apiService';

const CourseManagementPage = () => {
    const { courseId } = useParams();
    
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('info');
    const [course, setCourse] = useState(null);
    const [students, setStudents] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [completionPercentages, setCompletionPercentages] = useState({});
    const [majors, setMajors] = useState([]);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        type: 'Khóa học chung',
        major: '',
        endDate: '',
        description: '',
        image: null,
        learningDurationType: 'Không thời hạn',
    });

    const [alert, setAlert] = useState(null);

    useEffect(() => {
        fetchData();
        fetchMajors();
    }, [courseId]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token found');

            // Fetch course details
            const courseResponse = await axios.get(`${API_BASE_URL}/lms/course/${courseId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setCourse(courseResponse.data.result);

            // Fetch enrolled students using the specific API
            const studentsResponse = await axios.get(`${GET_STUDENT_COURSE}`, {
                params: {
                    courseId: courseId,
                    pageSize: 10,
                    pageNumber: 0
                },
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const studentsList = studentsResponse.data.result.content || [];
            setStudents(studentsList);
            
            // Fetch completion percentages for each student
            if (studentsList.length > 0) {
                await fetchCompletionPercentages(studentsList, token);
            }

            // Fetch course registration requests using the new API
            const registrationsResponse = await axios.get(`${GET_JOINCLASS_REQUEST}`, {
                params: {
                    courseId: courseId,
                    pageSize: 10,
                    pageNumber: 0
                },
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setRegistrations(registrationsResponse.data.result.content || []);

            setFormData({
                name: courseResponse.data.result.name,
                type: courseResponse.data.result.status === 'PUBLIC' ? 'Khóa học chung' : 'Khóa học riêng',
                major: courseResponse.data.result.majorId || '',
                endDate: courseResponse.data.result.endDate,
                description: courseResponse.data.result.description,
                image: courseResponse.data.result.image,
                learningDurationType: courseResponse.data.result.learningDurationType || 'Không thời hạn',
            });
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'An error occurred');
            console.error("Error fetching course management data:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCompletionPercentages = async (studentsList, token) => {
        try {
            const percentageData = {};
            
            // Fetch completion percentage for each student
            await Promise.all(
                studentsList.map(async (student) => {
                    try {
                        const response = await axios.get(`${GET_PROGRESS_PERCENT}`, {
                            params: {
                                courseId: courseId,
                                studentId: student.id
                            },
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        
                        if (response.data && response.data.result !== undefined) {
                            percentageData[student.id] = response.data.result;
                        } else {
                            percentageData[student.id] = 0; // Default to 0% if no data available
                        }
                    } catch (error) {
                        console.error(`Error fetching completion percentage for student ${student.id}:`, error);
                        percentageData[student.id] = 0; // Default to 0% on error
                    }
                })
            );
            
            setCompletionPercentages(percentageData);
        } catch (error) {
            console.error("Error fetching completion percentages:", error);
        }
    };

    const fetchMajors = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token found');
            const res = await axios.get(GET_MAJOR_API, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMajors(res.data.result || []);
        } catch (err) {
            setMajors([]);
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
            await axios.put(`${UPDATE_COURSE_API}`, {
                idCourse: courseId,
                name: formData.name,
                description: formData.description,
                endDate: formData.learningDurationType === 'Có thời hạn' ? formData.endDate : '',
                majorId: formData.major,
                status: formData.type,
                learningDurationType: formData.learningDurationType
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
                apiUrl = `${JOINCLASS_APPROVED_API}`;
                successMessage = 'Đã chấp nhận sinh viên vào khóa học.';
            } else if (action === 'reject') {
                apiUrl = `${JOINCLASS_REJECTED_API}`;
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

            await axios.delete(`${API_BASE_URL}/lms/course/${courseId}`, {
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

    const handleRemoveStudent = async (studentId, courseId) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token found');
            const formData = new FormData();
            formData.append('courseId', courseId);
            formData.append('studentId', studentId);

            const response = await axios.request({
                url: `${DELETE_STUDENT_COURSE}`,
                method: 'delete',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                },
                data: formData
            });

            if (response.data.code === 0) {
                showAlert('success', 'Thành công', 'Đã xóa sinh viên khỏi khóa học.');
                fetchData();
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Có lỗi xảy ra khi xóa sinh viên khỏi khóa học.';
            showAlert('error', 'Lỗi', errorMsg);
            console.error('Error removing student:', err);
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
                        <option value="PUBLIC">Khóa học miễn phí</option>
                        <option value="REQUEST">Khóa học yêu cầu đăng ký</option>
                        <option value="PRIVATE">Khóa học riêng tư</option>
                    </select>
                </div>
                <div className="form-group-manage">
                    <label>Chuyên ngành</label>
                    <select
                        value={formData.major}
                        onChange={(e) => setFormData({...formData, major: e.target.value})}
                    >
                        <option value="">-- Chọn chuyên ngành --</option>
                        {majors.map((major) => (
                            <option key={major.id} value={major.id}>{major.name}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group-manage">
                    <label>Kiểu thời lượng</label>
                    <select
                        value={formData.learningDurationType}
                        onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => ({
                                ...prev,
                                learningDurationType: val,
                                endDate: val === 'Có thời hạn' ? prev.endDate : ''
                            }));
                        }}
                    >
                        <option value="Không thời hạn">Không thời hạn</option>
                        <option value="Có thời hạn">Có thời hạn</option>
                    </select>
                </div>
                <div className="form-group-manage">
                    <label>Ngày kết thúc khóa học</label>
                    <input
                        type="date"
                        value={formData.endDate ? formData.endDate.split('T')[0] : ''}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        disabled={formData.learningDurationType !== 'Có thời hạn'}
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
                    <div className="course-teacher-item d-flex">
                        <img src={logo} alt='Ava' />
                        <div>
                            <div>{course.teacher.fullName}</div>
                            <div className="course-student-email">{course.teacher.email}</div>
                        </div>
                    </div>
                </div>
                
                <div className="members-section">
                    <h3 className="course-section-title">
                        Sinh Viên
                        <button className="add-student-btn" onClick={() => navigate(`/teacher/course/${courseId}/add-students`)}>
                            <UserPlus size={20} enableBackground={0}/>
                        </button>
                    </h3>
                    {students.map(student => (
                        <div key={student.id} className="member-item">
                            <div className='d-flex' style={{width: '40%'}}>
                                <img src={student.avatar || logo} alt='Ava' />
                                <div>
                                    <div>{student.fullName}</div>
                                    <div className="course-student-email">{student.email}</div>
                                </div>
                            </div>
                            <div className="student-progress">
                                <div className="progress-bar-container">
                                    <div 
                                        className="progress-bar" 
                                        style={{ 
                                            width: `${completionPercentages[student.id] || 0}%`,
                                            backgroundColor: getProgressColor(completionPercentages[student.id] || 0)
                                        }}
                                    ></div>
                                </div>
                                <span className="progress-text">{completionPercentages[student.id] || 0}%</span>
                            </div>
                            <button className="remove-member-btn" onClick={() => handleRemoveStudent(student.id, courseId)}>
                                <Trash2 size={16}/>
                            </button>
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
                                            <div className="course-student-email">{registration.email}</div>
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

    // Helper function to determine progress bar color based on completion percentage
    const getProgressColor = (percentage) => {
        if (percentage < 30) return '#ff4d4f'; // Red for low progress
        if (percentage < 70) return '#faad14'; // Yellow for medium progress
        return '#52c41a'; // Green for high progress
    };

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