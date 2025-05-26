import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../assets/css/course-management.css';
import * as LucideIcons from 'lucide-react';
import logo from '../../logo.svg';
import Alert from '../common/Alert';
import { API_BASE_URL, GET_PROGRESS_PERCENT, GET_JOINCLASS_REQUEST, GET_STUDENT_COURSE, JOINCLASS_APPROVED_API, JOINCLASS_REJECTED_API, DELETE_STUDENT_COURSE, UPDATE_COURSE_API, GET_MAJOR_API, DELETE_MULTIPLE_STUDENTS_COURSE, ADD_LESSON_API } from '../../services/apiService';

const CourseManagementPage = () => {
    const { courseId } = useParams();
    
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('info');
    const [course, setCourse] = useState(null);
    const [students, setStudents] = useState([]);
    const [avatarUrl, setAvatarUrl] = useState({});
    const [teacherAvatarUrl, setTeacherAvatarUrl] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    console.log(registrations);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [completionPercentages, setCompletionPercentages] = useState({});
    const [majors, setMajors] = useState([]);

    // Thêm state để quản lý việc chọn sinh viên
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [actionMenuOpen, setActionMenuOpen] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
    const [selectAll, setSelectAll] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        type: 'Khóa học chung',
        major: '',
        majorName: '',
        startDate: '',
        endDate: '',
        description: '',
        image: null,
        imageUrl: null,
        learningDurationType: 'Không thời hạn',
        feeType: 'FREE',
        price: 0,
        newImageSelected: false,
    });

    const [alert, setAlert] = useState(null);

    // States for course content management
    const [chapters, setChapters] = useState([]);
    const [expandedChapters, setExpandedChapters] = useState({});
    const [menuOpen, setMenuOpen] = useState({ type: null, id: null });
    const [showDeleteLessonConfirm, setShowDeleteLessonConfirm] = useState(false);
    const [showDeleteChapterConfirm, setShowDeleteChapterConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // States for modals
    const [showEditChapterModal, setShowEditChapterModal] = useState(false);
    const [editChapterData, setEditChapterData] = useState({
        idLesson: '',
        description: '',
        order: 1
    });
    const [editChapterLoading, setEditChapterLoading] = useState(false);
    
    // State cho modal thêm chương
    const [showAddChapterModal, setShowAddChapterModal] = useState(false);
    const [newChapter, setNewChapter] = useState({
        description: '',
        order: 1
    });
    const [addChapterLoading, setAddChapterLoading] = useState(false);

    // States for lesson (chapter in API) modals
    const [showEditLessonModal, setShowEditLessonModal] = useState(false);
    const [editLessonData, setEditLessonData] = useState({
        chapterId: '',
        name: '',
        order: 1,
        type: 'video',
    });
    const [editLessonLoading, setEditLessonLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    // Thêm states cho quản lý bài kiểm tra và tài liệu học tập
    const [showDeleteQuizConfirm, setShowDeleteQuizConfirm] = useState(false);
    const [showDeleteMaterialConfirm, setShowDeleteMaterialConfirm] = useState(false);

    // Thêm state để theo dõi lỗi tải ảnh
    const [imageLoadError, setImageLoadError] = useState(false);

    // Xử lý lỗi khi tải ảnh
    const handleImageError = (e) => {
        console.error("Không thể tải ảnh đại diện khóa học:", e);
        setImageLoadError(true);
    };

    // Xử lý đóng menu khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Xử lý menu thao tác hàng loạt
            if (actionMenuOpen) {
                // Kiểm tra xem click có phải là nút thao tác không
                const isActionButton = event.target.closest('.action-menu-button');
                if (isActionButton) {
                    return;
                }
                
                // Kiểm tra xem click có trong menu không
                const isInsideMenu = event.target.closest('.action-menu');
                if (!isInsideMenu) {
                    setActionMenuOpen(false);
                }
            }
            
            // Handle course content menus
            if (menuOpen.type && menuOpen.id) {
                const isMenuButton = event.target.closest('.menu-trigger-button');
                if (isMenuButton) {
                    return;
                }
                
                const isInsideMenu = event.target.closest('.item-menu');
                if (!isInsideMenu) {
                    setMenuOpen({ type: null, id: null });
                }
            }
        };
        
        // Thêm event listener khi component mount
        document.addEventListener('mousedown', handleClickOutside);
        
        // Cleanup khi component unmount
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [actionMenuOpen, menuOpen]);

    // Reset selected students when component mounts or when tab changes
    useEffect(() => {
        if (activeTab === 'members') {
            setSelectedStudents([]);
            setSelectAll(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchData();
        fetchMajors();
        if (activeTab === 'content') {
            fetchCourseContent();
        }
    }, [courseId, activeTab]);

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
            fetchTeacherAvatar(courseResponse.data.result.teacher.avatar)
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
            studentsList.forEach(student => {
                if (student.avatar) {
                    fetchAvatar(student.avatar, student.id);
                }
            });

            
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
            if(registrationsResponse.data.result.content) {
                registrationsResponse.data.result.content.forEach(registration => {
                    if (registration.avatar) {
                        fetchAvatar(registration.avatar, registration.id);
                    }
                });
            }

            // Map feeType từ backend sang frontend
            const feeTypeMapping = {
                'NON_CHARGEABLE': 'FREE',
                'CHARGEABLE': 'PAID'
            };

            // Lưu giữ trạng thái ảnh và URL hiện tại
            const currentImageUrl = formData.imageUrl;
            const currentImage = formData.image;
            const wasImageError = imageLoadError;

            // Cập nhật formData với thông tin khóa học
            setFormData({
                name: courseResponse.data.result.name,
                type: courseResponse.data.result.status,
                major: courseResponse.data.result.majorId || '',
                majorName: courseResponse.data.result.major || '',
                startDate: courseResponse.data.result.startDate,
                endDate: courseResponse.data.result.endDate,
                description: courseResponse.data.result.description,
                image: courseResponse.data.result.image || currentImage,
                imageUrl: currentImageUrl, // Giữ nguyên URL đã tạo trước đó nếu có
                learningDurationType: mapLearningDurationType(courseResponse.data.result.learningDurationType),
                feeType: feeTypeMapping[courseResponse.data.result.feeType] || 'FREE',
                price: courseResponse.data.result.price || 0,
                newImageSelected: false,
            });
            
            // Log để kiểm tra thông tin ảnh đại diện
            console.log("Thông tin ảnh đại diện khóa học:", courseResponse.data.result.image);
            console.log("Thông tin loại phí khóa học:", courseResponse.data.result.feeType);
            
            // Chỉ reset lỗi tải ảnh khi đang trong trạng thái lỗi và API trả về ảnh
            if (wasImageError && courseResponse.data.result.image) {
                setImageLoadError(false);
            } else {
                // Giữ nguyên trạng thái lỗi tải ảnh hiện tại
                setImageLoadError(wasImageError);
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'An error occurred');
            console.error("Error fetching course management data:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTeacherAvatar = async (avatarPath) => {
        if (!avatarPath) return;

        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            // Fetch avatar with authorization header
            const response = await axios.get(`${API_BASE_URL}${avatarPath}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'blob' // Important: we want the image as a blob
            });

            // Create a URL for the blob data
            const imageUrl = URL.createObjectURL(response.data);
            setTeacherAvatarUrl(imageUrl);

            // Tạo và dispatch một custom event
            const avatarEvent = new CustomEvent('avatar_updated', { 
                detail: { avatarUrl: imageUrl } 
            });
            window.dispatchEvent(avatarEvent);
        } catch (err) {
            console.error('Error fetching avatar:', err);
        }
    };

    // Hàm gọi API để lấy ra ảnh đại diện của sinh viên
    const fetchAvatar = async (avatarPath, studentId) => {
        
        if (!avatarPath) return;

        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            // Fetch avatar with authorization header
            const response = await axios.get(`${API_BASE_URL}${avatarPath}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'blob' 
            });

            // Create a URL for the blob data
            const imageUrl = URL.createObjectURL(response.data);
            setAvatarUrl(prev => ({
                ...prev,
                [studentId]: imageUrl
            }));
        } catch (err) {
            console.error('Error fetching avatar:', err);
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

    // Thêm hàm upload ảnh đại diện khóa học
    const uploadCoursePhoto = async (courseId, imageFile) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token found');
            
            console.log(`Uploading image for course ${courseId}, file:`, imageFile);
            
            // Tạo FormData để gửi file ảnh
            const formData = new FormData();
            formData.append('file', imageFile);
            
            // Gọi API upload ảnh đại diện cho khóa học
            const response = await axios.post(
                `${API_BASE_URL}/lms/course/${courseId}/upload-photo`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        // Quan trọng: Không set Content-Type trong headers, để axios tự xác định
                        // khi sử dụng FormData với file upload
                    }
                }
            );
            
            if (response.data && response.data.code === 0) {
                console.log('Upload ảnh đại diện thành công:', response.data.result);
                return response.data.result;
            } else {
                throw new Error(response.data?.message || 'Không thể upload ảnh đại diện');
            }
        } catch (error) {
            console.error('Error uploading course photo:', error);
            if (error.response && error.response.status === 415) {
                console.error('Lỗi kiểu dữ liệu không được hỗ trợ. Vui lòng kiểm tra định dạng file.');
            }
            throw error;
        }
    };

    // Thêm hàm xóa ảnh đại diện khóa học
    const deleteCoursePhoto = async (courseId) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token found');
            
            console.log(`Deleting image for course ${courseId}`);
            
            // Gọi API xóa ảnh đại diện cho khóa học
            // Tùy thuộc vào API, có thể cần gửi dưới dạng FormData hoặc JSON
            const response = await axios({
                method: 'DELETE',
                url: `${API_BASE_URL}/lms/course/${courseId}/remove-photo`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data && response.data.code === 0) {
                console.log('Xóa ảnh đại diện thành công');
                return true;
            } else {
                throw new Error(response.data?.message || 'Không thể xóa ảnh đại diện');
            }
        } catch (error) {
            console.error('Error deleting course photo:', error);
            if (error.response) {
                console.error(`Server returned status: ${error.response.status}`);
                console.error('Response data:', error.response.data);
            }
            throw error;
        }
    };

    const handleUpdateCourse = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token found');
            
            // Chuyển đổi feeType từ frontend sang backend
            const backendFeeType = mapFeeTypeToBackend(formData.feeType);
            
            console.log('------ THÔNG TIN CẬP NHẬT KHÓA HỌC ------');
            console.log('Frontend feeType:', formData.feeType);
            console.log('Backend feeType:', backendFeeType);
            
            // Tạo đối tượng cơ bản cho dữ liệu cập nhật
            const baseUpdateData = {
                idCourse: courseId,
                name: formData.name,
                description: formData.description,
                startDate: formData.startDate,
                endDate: formData.learningDurationType === 'Có thời hạn' ? formData.endDate : '',
                majorId: formData.major,
                status: formData.type,
                learningDurationType: mapLearningDurationTypeToBackend(formData.learningDurationType),
                feeType: backendFeeType,
            };
            
            // Thêm trường price chỉ khi khóa học có phí
            const courseUpdateData = formData.feeType === 'FREE' 
                ? baseUpdateData 
                : { ...baseUpdateData, price: formData.price };
                
            console.log('Loại phí:', formData.feeType === 'FREE' ? 'Miễn phí (không gửi giá tiền)' : `Có phí (${formData.price})`);
            console.log('Sending course update data:', courseUpdateData);
            
            // Cập nhật thông tin khóa học (không bao gồm ảnh)
            const updateResponse = await axios.put(`${UPDATE_COURSE_API}`, courseUpdateData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            let uploadResult = null;
            let needRefresh = false;
            
            // Chỉ upload ảnh mới nếu đã chọn ảnh mới
            if (formData.newImageSelected && formData.image instanceof File) {
                try {
                    console.log("Tiến hành upload ảnh đại diện mới");
                    uploadResult = await uploadCoursePhoto(courseId, formData.image);
                    if (uploadResult) {
                        console.log("Upload thành công, đường dẫn mới:", uploadResult);
                        
                        // Cập nhật formData với đường dẫn ảnh mới từ server
                        setFormData(prev => ({
                            ...prev,
                            image: uploadResult,  // Lưu đường dẫn ảnh mới từ server
                            newImageSelected: false  // Reset trạng thái ảnh mới
                        }));
                        
                        // Đã upload ảnh mới, không cần tải lại dữ liệu
                        needRefresh = false;
                        setImageLoadError(false);
                    }
                } catch (uploadError) {
                    showAlert('warning', 'Lưu ý', 'Thông tin khóa học đã được cập nhật nhưng không thể upload ảnh đại diện.');
                    console.error("Lỗi upload ảnh:", uploadError);
                    // Nếu upload thất bại, cần tải lại dữ liệu
                    needRefresh = true;
                }
            } else {
                console.log("Không upload ảnh mới vì không có thay đổi");
                // Nếu không thay đổi ảnh, cần tải lại dữ liệu để cập nhật các thông tin khác
                needRefresh = true;
            }
            
            showAlert('success', 'Thành công', 'Cập nhật thông tin khóa học thành công!');
            
            if (needRefresh) {
                // Lưu lại trạng thái ảnh hiện tại trước khi gọi fetchData()
                const currentImageUrl = formData.imageUrl;
                const currentImage = formData.image;
                const wasImageError = imageLoadError;
                
                // Tải lại dữ liệu
                await fetchData();
                
                // Nếu không phải là ảnh mới và không có lỗi, giữ nguyên thông tin ảnh hiện tại
                if (!formData.newImageSelected && !wasImageError && currentImageUrl) {
                    setFormData(prev => ({
                        ...prev,
                        imageUrl: currentImageUrl,
                        image: currentImage
                    }));
                }
            }
        } catch (err) {
            showAlert('error', 'Lỗi', 'Có lỗi xảy ra khi cập nhật thông tin khóa học');
            console.error("Error updating course:", err);
            if (err.response) {
                console.error("Response status:", err.response.status);
                console.error("Response data:", err.response.data);
            }
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

            // Tạo FormData và thêm courseId
            const formData = new FormData();
            formData.append('courseId', courseId);

            // Gọi API xóa khóa học với endpoint mới
            const response = await axios.delete(`${API_BASE_URL}/lms/course/delete`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                data: formData // Truyền formData trong data khi sử dụng method DELETE
            });
            
            // Kiểm tra kết quả trả về
            if (response.data && response.data.code === 0) {
                showAlert('success', 'Thành công', 'Đã xóa khóa học thành công!');
                setTimeout(() => {
                    navigate('/teacher/dashboard');
                }, 2000);
            } else {
                throw new Error(response.data?.message || 'Không thể xóa khóa học');
            }
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

    // Thêm hàm xử lý chọn/bỏ chọn tất cả sinh viên
    const handleSelectAllStudents = (e) => {
        const isChecked = e.target.checked;
        setSelectAll(isChecked);
        
        if (isChecked) {
            // Chọn tất cả sinh viên hiển thị trên trang hiện tại
            const allStudentIds = students.map(student => student.id);
            setSelectedStudents(allStudentIds);
        } else {
            // Bỏ chọn tất cả
            setSelectedStudents([]);
        }
    };

    // Thêm hàm xử lý chọn/bỏ chọn một sinh viên
    const handleSelectStudent = (studentId, isChecked) => {
        if (isChecked) {
            // Thêm sinh viên vào danh sách đã chọn
            setSelectedStudents(prev => [...prev, studentId]);
        } else {
            // Xóa sinh viên khỏi danh sách đã chọn
            setSelectedStudents(prev => prev.filter(id => id !== studentId));
            // Đảm bảo trạng thái "Chọn tất cả" được cập nhật chính xác
            setSelectAll(false);
        }
    };

    // Thêm hàm xử lý khi nhấn vào nút "Thao tác"
    const toggleActionMenu = () => {
        setActionMenuOpen(prev => !prev);
    };

    // Thêm hàm xử lý khi nhấn vào nút "Xóa" trong menu thao tác
    const openDeleteConfirmation = () => {
        setConfirmDialogOpen(true);
        setActionMenuOpen(false); // Đóng menu thao tác
    };

    // Thêm hàm xử lý khi xác nhận xóa nhiều sinh viên
    const handleDeleteMultipleStudents = async () => {
        if (bulkDeleteLoading || selectedStudents.length === 0) return;
        
        try {
            setBulkDeleteLoading(true);
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            // Gọi API xóa nhiều sinh viên
            const response = await axios.delete(
                DELETE_MULTIPLE_STUDENTS_COURSE,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    data: {
                        baseId: courseId,
                        studentIds: selectedStudents
                    }
                }
            );
            
            // Kiểm tra kết quả trả về
            if (response.data && response.data.code === 0) {
                showAlert('success', 'Thành công', `Đã xóa ${selectedStudents.length} sinh viên khỏi khóa học`);
                // Cập nhật lại danh sách sinh viên
                fetchData();
                // Reset các state liên quan
                setSelectedStudents([]);
                setSelectAll(false);
            } else {
                showAlert('error', 'Lỗi', response.data?.message || 'Không thể xóa sinh viên');
            }
        } catch (error) {
            console.error('Error deleting multiple students:', error);
            showAlert('error', 'Lỗi', 'Không thể xóa sinh viên. Vui lòng thử lại sau.');
        } finally {
            setBulkDeleteLoading(false);
            setConfirmDialogOpen(false);
        }
    };

    // New function to fetch course content
    const fetchCourseContent = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token found');

            // Fetch course with all content
            const response = await axios.get(`${API_BASE_URL}/lms/course/${courseId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data && response.data.code === 0) {
                // Set course data
                setCourse(response.data.result);
                
                // Lưu ý: trong API, 'lesson' thực chất là các chương và 'chapter' trong lesson là các bài học
                const lessons = response.data.result.lesson || [];
                
                // Sort lessons by order
                const sortedLessons = [...lessons].sort((a, b) => (a.order || 0) - (b.order || 0));
                setChapters(sortedLessons);
                
                // Initialize expanded state for lessons/chapters
                const expanded = {};
                sortedLessons.forEach(lesson => {
                    expanded[lesson.id] = false;
                });
                setExpandedChapters(expanded);
            } else {
                throw new Error(response.data?.message || 'Failed to fetch course content');
            }
        } catch (err) {
            console.error('Error fetching course content:', err);
            setError(err.response?.data?.message || err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Toggle chapter expansion
    const toggleChapter = (chapterId) => {
        setExpandedChapters(prev => ({
            ...prev,
            [chapterId]: !prev[chapterId]
        }));
    };

    // Toggle menu for chapter or lesson
    const toggleMenu = (e, type, id) => {
        e.stopPropagation();
        if (menuOpen.type === type && menuOpen.id === id) {
            setMenuOpen({ type: null, id: null });
        } else {
            setMenuOpen({ type, id });
        }
    };

    // Handle edit chapter (lesson in API) button click
    const handleEditChapter = (e, lesson) => {
        e.stopPropagation();
        setMenuOpen({ type: null, id: null });
        setEditChapterData({
            idLesson: lesson.id,
            description: lesson.description || '',
            order: lesson.order || 1
        });
        setShowEditChapterModal(true);
    };

    // Handle update chapter (lesson in API)
    const handleUpdateChapter = async (e) => {
        e.preventDefault();
        setEditChapterLoading(true);
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token found');

            // API call to update lesson (which is a chapter in the UI)
            const response = await axios.put(`${API_BASE_URL}/lms/lesson/update`, editChapterData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && response.data.code === 0) {
                showAlert('success', 'Thành công', 'Đã cập nhật chương học thành công!');
                fetchCourseContent();
                setShowEditChapterModal(false);
            } else {
                throw new Error(response.data?.message || 'Failed to update chapter');
            }
        } catch (err) {
            console.error('Error updating chapter:', err);
            showAlert('error', 'Lỗi', 'Không thể cập nhật chương học. Vui lòng thử lại sau.');
        } finally {
            setEditChapterLoading(false);
        }
    };

    // Handle delete chapter (lesson in API)
    const handleDeleteChapter = async () => {
        if (!itemToDelete) return;
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token found');

            // API call to delete lesson (which is a chapter in the UI)
            const response = await axios.delete(`${API_BASE_URL}/lms/lesson/${itemToDelete.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data && response.data.code === 0) {
                showAlert('success', 'Thành công', 'Đã xóa chương học thành công!');
                fetchCourseContent();
            } else {
                throw new Error(response.data?.message || 'Failed to delete chapter');
            }
        } catch (err) {
            console.error('Error deleting chapter:', err);
            showAlert('error', 'Lỗi', 'Không thể xóa chương học. Vui lòng thử lại sau.');
        } finally {
            setShowDeleteChapterConfirm(false);
            setItemToDelete(null);
        }
    };

    // Handle edit lesson (chapter in API)
    const handleEditLesson = (e, chapter) => {
        e.stopPropagation();
        setMenuOpen({ type: null, id: null });
        setEditLessonData({
            chapterId: chapter.id,
            name: chapter.name || '',
            order: chapter.order || 1,
            type: chapter.type || 'video'
        });
        setShowEditLessonModal(true);
    };

    // Handle update lesson (chapter in API)
    const handleUpdateLesson = async (e) => {
        e.preventDefault();
        setEditLessonLoading(true);
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token found');

            if (!selectedFile) {
                showAlert('error', 'Lỗi', 'Vui lòng chọn file cho bài học');
                setEditLessonLoading(false);
                return;
            }

            // Create FormData
            const formData = new FormData();
            formData.append('chapterId', editLessonData.chapterId);
            formData.append('name', editLessonData.name);
            formData.append('order', editLessonData.order);
            formData.append('type', editLessonData.type);
            formData.append('file', selectedFile);

            // API call to update chapter (lesson in UI)
            const response = await axios.put(`${API_BASE_URL}/lms/chapter/update`, formData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data && response.data.code === 0) {
                showAlert('success', 'Thành công', 'Đã cập nhật bài học thành công!');
                fetchCourseContent();
                setShowEditLessonModal(false);
                setSelectedFile(null);
            } else {
                throw new Error(response.data?.message || 'Failed to update lesson');
            }
        } catch (err) {
            console.error('Error updating lesson:', err);
            showAlert('error', 'Lỗi', 'Không thể cập nhật bài học. Vui lòng thử lại sau.');
        } finally {
            setEditLessonLoading(false);
        }
    };

    // Handle delete lesson (chapter in API)
    const handleDeleteLesson = async () => {
        if (!itemToDelete) return;
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token found');

            // Create FormData for the delete request
            const formData = new FormData();
            formData.append('chapterId', itemToDelete.id);

            // API call to delete chapter (lesson in UI)
            const response = await axios.delete(`${API_BASE_URL}/lms/chapter/delete`, {
                headers: { 
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    chapterId: itemToDelete.id
                }
            });

            if (response.data && response.data.code === 0) {
                showAlert('success', 'Thành công', 'Đã xóa bài học thành công!');
                fetchCourseContent();
            } else {
                throw new Error(response.data?.message || 'Failed to delete lesson');
            }
        } catch (err) {
            console.error('Error deleting lesson:', err);
            showAlert('error', 'Lỗi', 'Không thể xóa bài học. Vui lòng thử lại sau.');
        } finally {
            setShowDeleteLessonConfirm(false);
            setItemToDelete(null);
        }
    };

    // Handle file change
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    // Reset file input
    const resetFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setSelectedFile(null);
    };

    // Function to get file extension
    const getFileExtension = (filename) => {
        return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
    }

    // Function to handle adding a new chapter (lesson in API)
    const handleAddChapter = () => {
        setShowAddChapterModal(true);
    };
    
    // Function to handle submitting new chapter
    const handleAddChapterSubmit = async () => {
        if (!newChapter.description.trim()) return;
        
        setAddChapterLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token found');

            // Tính order mới là max hiện tại + 1
            const currentMaxOrder = Math.max(...chapters.map(chapter => chapter.order || 0), 0);
            const newOrder = currentMaxOrder + 1;

            const response = await axios.post(ADD_LESSON_API, {
                courseId,
                description: newChapter.description,
                order: newOrder
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data && response.data.code === 0) {
                showAlert('success', 'Thành công', 'Thêm chương mới thành công!');
                fetchCourseContent();
                setShowAddChapterModal(false);
                setNewChapter({ description: '', order: 1 });
            } else {
                throw new Error(response.data?.message || 'Failed to add chapter');
            }
        } catch (err) {
            console.error('Error adding chapter:', err);
            showAlert('error', 'Lỗi', 'Không thể thêm chương mới. Vui lòng thử lại sau.');
        } finally {
            setAddChapterLoading(false);
        }
    };

    // Function to handle adding a new lesson (chapter in API)
    const handleAddLesson = (lessonId) => {
        navigate('/teacher/add-lesson', {
            state: { 
                courseId,
                lessonId: lessonId,
                lessonName: `${chapters.find(lesson => lesson.id === lessonId)?.description || ''}`,
                type: 'content'
            }
        });
    };

    // Function to handle adding material
    const handleAddMaterial = (lessonId) => {
        navigate('/teacher/add-material', {
            state: { 
                courseId,
                lessonId: lessonId,
                lessonName: `${chapters.find(lesson => lesson.id === lessonId)?.description || ''}`,
                type: 'material'
            }
        });
    };

    // Function to handle adding quiz
    const handleAddQuiz = (lessonId) => {
        navigate('/teacher/add-quiz', {
            state: { 
                courseId,
                lessonId: lessonId,
                lessonName: `${chapters.find(lesson => lesson.id === lessonId)?.description || ''}`,
                type: 'quiz'
            }
        });
    };

    // Handle delete lesson (chapter in API) confirmation
    const handleDeleteLessonConfirm = (e, chapter) => {
        e.stopPropagation();
        setItemToDelete(chapter);
        setShowDeleteLessonConfirm(true);
        setMenuOpen({ type: null, id: null });
    };

    // Handle delete quiz
    const handleDeleteQuiz = async () => {
        if (!itemToDelete) return;
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token found');

            // API call to delete quiz
            const response = await axios.delete(`${API_BASE_URL}/lms/lessonquiz/${itemToDelete.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data && response.data.code === 0) {
                showAlert('success', 'Thành công', 'Đã xóa bài kiểm tra thành công!');
                fetchCourseContent();
            } else {
                throw new Error(response.data?.message || 'Failed to delete quiz');
            }
        } catch (err) {
            console.error('Error deleting quiz:', err);
            showAlert('error', 'Lỗi', 'Không thể xóa bài kiểm tra. Vui lòng thử lại sau.');
        } finally {
            setShowDeleteQuizConfirm(false);
            setItemToDelete(null);
        }
    };

    // Handle delete material
    const handleDeleteMaterial = async () => {
        if (!itemToDelete) return;
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token found');

            // API call to delete material
            const response = await axios.delete(`${API_BASE_URL}/lms/lessonmaterial/${itemToDelete.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data && response.data.code === 0) {
                showAlert('success', 'Thành công', 'Đã xóa tài liệu học tập thành công!');
                fetchCourseContent();
            } else {
                throw new Error(response.data?.message || 'Failed to delete material');
            }
        } catch (err) {
            console.error('Error deleting material:', err);
            showAlert('error', 'Lỗi', 'Không thể xóa tài liệu học tập. Vui lòng thử lại sau.');
        } finally {
            setShowDeleteMaterialConfirm(false);
            setItemToDelete(null);
        }
    };

    // Handle delete quiz confirmation
    const handleDeleteQuizConfirm = (e, quiz) => {
        e.stopPropagation();
        const quizToDelete = {
            id: quiz.id,
            question: quiz.question
        };
        setItemToDelete(quizToDelete);
        setShowDeleteQuizConfirm(true);
        setMenuOpen({ type: null, id: null });
    };

    // Handle delete material confirmation
    const handleDeleteMaterialConfirm = (e, material) => {
        e.stopPropagation();
        const materialToDelete = {
            id: material.id,
            fileName: material.fileName || 'Tài liệu không tên'
        };
        setItemToDelete(materialToDelete);
        setShowDeleteMaterialConfirm(true);
        setMenuOpen({ type: null, id: null });
    };

    // Hàm chuyển đổi learningDurationType từ backend sang frontend
    const mapLearningDurationType = (type) => {
        const typeMapping = {
            'UNLIMITED': 'Không thời hạn',
            'LIMITED': 'Có thời hạn'
        };
        return typeMapping[type] || 'Không thời hạn';
    };

    // Hàm chuyển đổi learningDurationType từ frontend sang backend
    const mapLearningDurationTypeToBackend = (type) => {
        const typeMapping = {
            'Không thời hạn': 'UNLIMITED',
            'Có thời hạn': 'LIMITED'
        };
        return typeMapping[type] || 'UNLIMITED';
    };

    // Hàm chuyển đổi feeType từ frontend sang backend
    const mapFeeTypeToBackend = (type) => {
        const typeMapping = {
            'FREE': 'NON_CHARGEABLE',
            'PAID': 'CHARGEABLE'
        };
        return typeMapping[type] || 'NON_CHARGEABLE';
    };

    // Thêm useEffect để theo dõi và cleanup URL ảnh khi unmount
    useEffect(() => {
        // Cleanup function để giải phóng URL object khi component unmount hoặc imageUrl thay đổi
        return () => {
            if (formData.imageUrl && formData.imageUrl.startsWith('blob:')) {
                URL.revokeObjectURL(formData.imageUrl);
            }
        };
    }, [formData.imageUrl]);

    // Hàm để tải ảnh đại diện dưới dạng blob
    const fetchImageWithAuth = async (url) => {
        if (!url) return null;
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return null;
            
            let fullUrl;
            // Xử lý URL - hỗ trợ nhiều loại URL khác nhau từ backend
            if (url.startsWith('http')) {
                // URL đầy đủ
                fullUrl = url;
            } else if (url.startsWith('/')) {
                // URL bắt đầu bằng / - thêm API_BASE_URL
                fullUrl = `${API_BASE_URL}${url}`;
            } else {
                // URL không bắt đầu bằng / - thêm API_BASE_URL và /
                fullUrl = `${API_BASE_URL}/${url}`;
            }
            
            console.log(`Đang tải ảnh khóa học từ: ${fullUrl}`);
            
            const response = await axios({
                method: 'GET',
                url: fullUrl,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'blob', // Quan trọng: yêu cầu response dạng blob
                timeout: 10000 // Timeout sau 10 giây
            });
            
            if (response.status !== 200) {
                console.error(`Lỗi tải ảnh: HTTP status ${response.status}`);
                setImageLoadError(true);
                return null;
            }
            
            if (response.data.size === 0) {
                console.error('Lỗi tải ảnh: Kích thước file = 0');
                setImageLoadError(true);
                return null;
            }
            
            // Kiểm tra loại tệp
            const contentType = response.headers['content-type'];
            if (!contentType || !contentType.startsWith('image/')) {
                console.error(`Lỗi: File không phải hình ảnh (${contentType})`);
                setImageLoadError(true);
                return null;
            }
            
            // Tạo URL object từ blob
            const imageObjectUrl = URL.createObjectURL(response.data);
            console.log("Đã tạo blob URL:", imageObjectUrl);
            return imageObjectUrl;
        } catch (error) {
            console.error("Error fetching image:", error);
            setImageLoadError(true);
            return null;
        }
    };

    // Use effect để tải ảnh sau khi có URL
    useEffect(() => {
        if (formData.image && !formData.newImageSelected) {
            const loadCourseImage = async () => {
                try {
                    console.log("Tải ảnh khóa học:", formData.image);
                    // Đối với ảnh mới đã chọn, đã có URL blob nên không cần tải lại
                    const blobUrl = await fetchImageWithAuth(formData.image);
                    if (blobUrl) {
                        console.log("Đã tải ảnh thành công, cập nhật imageUrl");
                        setFormData(prev => ({...prev, imageUrl: blobUrl}));
                        setImageLoadError(false);
                    } else {
                        console.error("Không thể tải được ảnh");
                        setImageLoadError(true);
                    }
                } catch (error) {
                    console.error("Error loading image:", error);
                    setImageLoadError(true);
                }
            };
            
            loadCourseImage();
        }
    }, [formData.image, formData.newImageSelected]);

    // Tạo màu nền dựa trên ID khóa học (để luôn cố định cho mỗi khóa học)
    const getConsistentColor = (id) => {
        const colors = [
            'linear-gradient(to right, #4b6cb7, #182848)',
            'linear-gradient(to right, #1d75fb, #3e60ff)',
            'linear-gradient(to right, #ff416c, #ff4b2b)',
            'linear-gradient(to right, #11998e, #38ef7d)',
            'linear-gradient(to right, #8e2de2, #4a00e0)',
            'linear-gradient(to right, #fc4a1a, #f7b733)',
            'linear-gradient(to right, #5433ff, #20bdff)',
            'linear-gradient(to right, #2b5876, #4e4376)'
        ];
        if (!id) return colors[0]; 
        // Đảm bảo ID là chuỗi trước khi xử lý
        const idStr = String(id);
        const sum = idStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[sum % colors.length];
    };

    const renderCourseInfo = () => (
        <div className="course-info-form">
            <div className="section-header-with-back">
                <button 
                    className="course-back-btn" 
                    onClick={() => {
                        navigate('/teacher/course', {
                            state: { courseId: course.id }
                        })
                    }}
                >
                    &lt;
                </button>
                <h2>Thông tin khóa học</h2>
            </div>
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
                        onChange={(e) => {
                            const selectedMajor = majors.find(m => m.id === e.target.value);
                            setFormData({
                                ...formData, 
                                major: e.target.value,
                                majorName: selectedMajor ? selectedMajor.name : ''
                            });
                        }}
                    >
                        <option value="">-- Chọn chuyên ngành --</option>
                        {majors.map((major) => (
                            <option key={major.id} value={major.id}>{major.name}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group-manage">
                    <label>Loại học phí</label>
                    <select
                        value={formData.feeType}
                        onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => ({
                                ...prev,
                                feeType: val,
                                price: val === 'FREE' ? 0 : prev.price
                            }));
                        }}
                    >
                        <option value="FREE">Miễn phí</option>
                        <option value="PAID">Có phí</option>
                    </select>
                </div>
                {formData.feeType === 'PAID' && (
                    <div className="form-group-manage">
                        <label>Giá (USD)</label>
                        <input
                            type="number"
                            min="0"
                            step="10"
                            value={formData.price}
                            onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                        />
                    </div>
                )}
                <div className="form-group-manage">
                    <label>Ngày bắt đầu khóa học</label>
                    <input
                        type="date"
                        value={formData.startDate ? formData.startDate.split('T')[0] : ''}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    />
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
                    <div className="course-image-upload-container">
                        <div className="course-image-preview-box">
                            {formData.imageUrl && !imageLoadError ? (
                                <img 
                                    src={formData.imageUrl} 
                                    alt="Ảnh đại diện khóa học" 
                                    className="course-image-preview" 
                                    onError={handleImageError}
                                />
                            ) : (
                                <div className="course-auto-generated-wrapper">
                                    <div 
                                        className="course-auto-generated-image" 
                                        style={{ 
                                            background: getConsistentColor(courseId),
                                            width: '100%',
                                            height: '200px',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#fff',
                                            fontWeight: 'bold',
                                            padding: '20px',
                                        }}
                                    >
                                        <div className="course-initial">{formData.name ? formData.name.charAt(0).toUpperCase() : 'C'}</div>
                                        <div className="course-name-display">{formData.name || 'Course'}</div>
                                    </div>
                                </div>
                            )}
                            {formData.imageUrl && formData.newImageSelected && (
                                <div className="course-image-filename">
                                    Ảnh mới đã được chọn
                                    <span className="course-image-size">
                                        ({Math.round(formData.image.size / 1024)} KB)
                                    </span>
                                </div>
                            )}
                            <div className="course-image-actions">
                                <button 
                                    type="button" 
                                    className="course-change-image-btn"
                                    onClick={() => document.getElementById('courseImageInput').click()}
                                >
                                    Thay đổi ảnh
                                </button>
                            </div>
                            <input 
                                id="courseImageInput"
                                type="file" 
                                accept="image/*" 
                                style={{display: 'none'}} 
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        // Kiểm tra kích thước file (tối đa 5MB)
                                        if (file.size > 5 * 1024 * 1024) {
                                            showAlert('error', 'Lỗi', 'Kích thước ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB.');
                                            return;
                                        }
                                        
                                        // Kiểm tra loại file
                                        if (!file.type.startsWith('image/')) {
                                            showAlert('error', 'Lỗi', 'Vui lòng chỉ chọn file ảnh.');
                                            return;
                                        }

                                        const imageUrl = URL.createObjectURL(file);
                                        console.log("Đã chọn ảnh mới, tạo URL:", imageUrl);
                                        setFormData({
                                            ...formData, 
                                            image: file,
                                            imageUrl: imageUrl,
                                            newImageSelected: true
                                        });
                                        setImageLoadError(false); // Reset lỗi tải ảnh khi chọn ảnh mới
                                        
                                        // Hiển thị thông báo thành công
                                        showAlert('info', 'Ảnh mới', 'Đã chọn ảnh mới. Nhấn "Xác nhận" để lưu thay đổi.');
                                    }
                                }} 
                            />
                        </div>
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
            <div className="section-header-with-back">
                <button 
                    className="course-back-btn" 
                    onClick={() => {
                        navigate('/teacher/course', {
                            state: { courseId: course.id }
                        })
                    }}
                >
                    &lt;
                </button>
                <h2>Thông tin khóa học</h2>
            </div>
            <div className="members-list">
                <div className="members-section">
                    <h3>Giáo Viên</h3>
                    <div className="course-teacher-item d-flex">
                        {teacherAvatarUrl ? (
                            <img src={teacherAvatarUrl} alt="Avatar"/>
                        ) : (
                            <img src='https://randomuser.me/api/portraits/men/1.jpg'/>
                        )}
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
                            <LucideIcons.UserPlus size={20} enableBackground={0}/>
                        </button>
                    </h3>
                    
                    {/* Chỉ hiển thị select-all container khi có sinh viên */}
                    {students.length > 0 && (
                        <div className="select-all-container">
                            <label className="select-all-checkbox">
                                <input 
                                    type="checkbox" 
                                    checked={selectAll}
                                    onChange={handleSelectAllStudents}
                                />
                                {selectedStudents.length > 0 && (
                                    <div className="action-menu-container">
                                        <button 
                                            className="action-menu-button" 
                                            onClick={toggleActionMenu}
                                            disabled={selectedStudents.length === 0}
                                        >
                                            Thao tác
                                        </button>
                                        {actionMenuOpen && (
                                            <div className="action-menu">
                                                <button 
                                                    className="action-menu-item delete-action"
                                                    onClick={openDeleteConfirmation}
                                                >
                                                    <LucideIcons.Trash2 size={16} />
                                                    <span>Xóa</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </label>
                        </div>
                    )}
                    
                    {students.length > 0 ? (
                        students.map(student => {
                            const isSelected = selectedStudents.includes(student.id);
                            return (
                                <div key={student.id} className={`member-item ${isSelected ? 'selected-member' : ''}`}>
                                    <div className='d-flex align-center' style={{width: '44%'}}>
                                        <div className="member-checkbox">
                                            <input 
                                                type="checkbox" 
                                                checked={isSelected}
                                                onChange={(e) => handleSelectStudent(student.id, e.target.checked)}
                                            />
                                        </div>
                                        <div className='d-flex'>
                                            {avatarUrl[student.id] ? (
                                                <img src={avatarUrl[student.id]} alt="Avatar" className='course-management-student-avatar'/>
                                            ) : (
                                                <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className='course-management-student-avatar'>
                                                    <circle cx="100" cy="100" r="100" fill="#ff4757" />
                                                    <path d="M100,40 C60,40 40,70 40,110 C40,150 60,180 100,180 C140,180 160,150 160,110 C160,70 140,40 100,40 Z" fill="#2f3542" />
                                                    <path d="M65,90 C65,80 75,70 85,70 C95,70 100,80 100,90 C100,80 105,70 115,70 C125,70 135,80 135,90 C135,100 125,110 115,110 C105,110 100,100 100,90 C100,100 95,110 85,110 C75,110 65,100 65,90 Z" fill="#f1f2f6" />
                                                    <path d="M70,75 C70,70 75,65 80,65 C85,65 90,70 90,75 C90,80 85,85 80,85 C75,85 70,80 70,75 Z" fill="#3742fa" />
                                                    <path d="M110,75 C110,70 115,65 120,65 C125,65 130,70 130,75 C130,80 125,85 120,85 C115,85 110,80 110,75 Z" fill="#3742fa" />
                                                    <path d="M65,120 C65,140 80,160 100,160 C120,160 135,140 135,120 C135,110 120,100 100,100 C80,100 65,110 65,120 Z" fill="#f1f2f6" />
                                                    <path d="M70,110 C80,120 90,125 100,125 C110,125 120,120 130,110 C120,105 110,100 100,100 C90,100 80,105 70,110 Z" fill="#2f3542" />
                                                </svg>
                                            )}
                                            <div>
                                                <div>{student.fullName}</div>
                                                <div className="course-student-email">{student.email}</div>
                                            </div>
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
                                        <LucideIcons.Trash2 size={16}/>
                                    </button>
                                </div>
                            );
                        })
                    ) : (
                        <div className="no-students-message">
                            <p>Không có sinh viên trong khóa học</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderRegistrations = () => (
        <div className="course-registrations">
            <div className="section-header-with-back">
                <button 
                    className="course-back-btn" 
                    onClick={() => {
                        navigate('/teacher/course', {
                            state: { courseId: course.id }
                        })
                    }}
                >
                    &lt;
                </button>
                <h2>Thông tin khóa học</h2>
            </div>
            <div className="registrations-table">
                {registrations.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Sinh viên đăng ký</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {registrations.map((registration, index) => (
                                <tr key={registration.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <div className="student-info">
                                            {avatarUrl[registration.id] ? (
                                                <img src={avatarUrl[registration.id]} alt="Avatar" className='course-management-student-avatar'/>
                                            ) : (
                                                <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className='course-management-student-avatar'>
                                                    <circle cx="100" cy="100" r="100" fill="#ff4757" />
                                                    <path d="M100,40 C60,40 40,70 40,110 C40,150 60,180 100,180 C140,180 160,150 160,110 C160,70 140,40 100,40 Z" fill="#2f3542" />
                                                    <path d="M65,90 C65,80 75,70 85,70 C95,70 100,80 100,90 C100,80 105,70 115,70 C125,70 135,80 135,90 C135,100 125,110 115,110 C105,110 100,100 100,90 C100,100 95,110 85,110 C75,110 65,100 65,90 Z" fill="#f1f2f6" />
                                                    <path d="M70,75 C70,70 75,65 80,65 C85,65 90,70 90,75 C90,80 85,85 80,85 C75,85 70,80 70,75 Z" fill="#3742fa" />
                                                    <path d="M110,75 C110,70 115,65 120,65 C125,65 130,70 130,75 C130,80 125,85 120,85 C115,85 110,80 110,75 Z" fill="#3742fa" />
                                                    <path d="M65,120 C65,140 80,160 100,160 C120,160 135,140 135,120 C135,110 120,100 100,100 C80,100 65,110 65,120 Z" fill="#f1f2f6" />
                                                    <path d="M70,110 C80,120 90,125 100,125 C110,125 120,120 130,110 C120,105 110,100 100,100 C90,100 80,105 70,110 Z" fill="#2f3542" />
                                                </svg>
                                            )}
                                            <div>
                                                <div>{registration.fullName}</div>
                                                <div className="course-student-email">{registration.email}</div>
                                            </div>
                                        </div>
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
                ) : (
                    <div className="no-students-message">
                        <p>Không có yêu cầu đăng ký nào</p>
                    </div>
                )}
            </div>
        </div>
    );

    // Helper function to determine progress bar color based on completion percentage
    const getProgressColor = (percentage) => {
        if (percentage < 30) return '#ff4d4f'; // Red for low progress
        if (percentage < 70) return '#faad14'; // Yellow for medium progress
        return '#52c41a'; // Green for high progress
    };

    // Format giá tiền
    const formatPrice = (price) => {
        if (!price && price !== 0) return 'Miễn phí';
        if (price === 0) return 'Miễn phí';
        return `${price.toLocaleString('vi-VN')} VND`;
    };

    // Xác định nội dung hiển thị cho phí khóa học
    const renderCourseFee = () => {
        if (!course) return null;
        
        // Lưu ý giá trị feeType từ backend có thể là NON_CHARGEABLE hoặc CHARGEABLE
        if (course.feeType === 'NON_CHARGEABLE' || !course.feeType) {
            return <span className="status-badge free">Miễn phí</span>;
        } else if (course.feeType === 'CHARGEABLE') {
            return <span className="status-badge price">{formatPrice(course.price)}</span>;
        }
        return null;
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
                                className="btn-cancel-delete"
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                Hủy
                            </button>
                            <button 
                                className="btn-confirm-delete"
                                onClick={() => {
                                    handleDeleteCourse();
                                    setShowDeleteConfirm(false);
                                }}
                            >
                                <LucideIcons.Trash2 size={16} /> Xác nhận xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal chỉnh sửa chương */}
            {showEditChapterModal && (
                <div className="chapter-edit-modal-overlay">
                    <div className="chapter-edit-modal-container">
                        <div className="chapter-edit-modal-header">
                            <h2>Chỉnh sửa chương</h2>
                            <button 
                                className="chapter-edit-close-button"
                                onClick={() => setShowEditChapterModal(false)}
                            >
                                <LucideIcons.X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateChapter}>
                            <div className="chapter-edit-form-group">
                                <label htmlFor="chapterDescription">Tên chương:</label>
                                <input
                                    id="chapterDescription"
                                    type='text'
                                    value={editChapterData.description}
                                    onChange={(e) => setEditChapterData({
                                        ...editChapterData,
                                        description: e.target.value
                                    })}
                                    required
                                    rows={3}
                                />
                            </div>
                            <div className="chapter-edit-form-group">
                                <label htmlFor="chapterOrder">Thứ tự:</label>
                                <input
                                    id="chapterOrder"
                                    type="number"
                                    min="1"
                                    value={editChapterData.order}
                                    onChange={(e) => setEditChapterData({
                                        ...editChapterData,
                                        order: parseInt(e.target.value) || 1
                                    })}
                                    required
                                />
                            </div>
                            <div className="chapter-edit-modal-actions">
                                <button 
                                    type="button" 
                                    className="chapter-edit-cancel-button"
                                    onClick={() => setShowEditChapterModal(false)}
                                    disabled={editChapterLoading}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="chapter-edit-confirm-button"
                                    disabled={editChapterLoading}
                                >
                                    {editChapterLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmation dialog for chapter deletion */}
            {showDeleteChapterConfirm && (
                <div className="delete-modal-overlay">
                    <div className="delete-modal-container">
                        <h2>Xác nhận xóa chương</h2>
                        <p>Bạn có chắc chắn muốn xóa chương "{itemToDelete?.description}" không?</p>
                        <p>Tất cả bài học, bài kiểm tra và tài liệu trong chương này cũng sẽ bị xóa. Hành động này không thể hoàn tác.</p>
                        <div className="delete-modal-actions">
                            <button 
                                className="btn-cancel-delete"
                                onClick={() => {
                                    setShowDeleteChapterConfirm(false);
                                    setItemToDelete(null);
                                }}
                            >
                                Hủy
                            </button>
                            <button 
                                className="btn-confirm-delete"
                                onClick={handleDeleteChapter}
                            >
                                <LucideIcons.Trash2 size={16} /> Xác nhận xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal chỉnh sửa bài học (chapter trong API) */}
            {showEditLessonModal && (
                <div className="lesson-edit-modal-overlay">
                    <div className="lesson-edit-modal-container">
                        <div className="lesson-edit-modal-header">
                            <h2>Chỉnh sửa bài học</h2>
                            <button 
                                className="lesson-edit-close-button"
                                onClick={() => {
                                    setShowEditLessonModal(false);
                                    resetFileInput();
                                }}
                            >
                                <LucideIcons.X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateLesson}>
                            <div className="lesson-edit-form-group">
                                <label htmlFor="lessonName">Tên bài học:</label>
                                <input
                                    id="lessonName"
                                    type="text"
                                    value={editLessonData.name}
                                    onChange={(e) => setEditLessonData({
                                        ...editLessonData,
                                        name: e.target.value
                                    })}
                                    required
                                />
                            </div>
                            <div className="lesson-edit-form-group">
                                <label htmlFor="lessonOrder">Thứ tự:</label>
                                <input
                                    id="lessonOrder"
                                    type="number"
                                    min="1"
                                    value={editLessonData.order}
                                    onChange={(e) => setEditLessonData({
                                        ...editLessonData,
                                        order: parseInt(e.target.value) || 1
                                    })}
                                    required
                                />
                            </div>
                            <div className="lesson-edit-form-group">
                                <label htmlFor="lessonType">Loại bài học:</label>
                                <select
                                    id="lessonType"
                                    value={editLessonData.type}
                                    onChange={(e) => setEditLessonData({
                                        ...editLessonData,
                                        type: e.target.value
                                    })}
                                    required
                                >
                                    <option value="video">Video</option>
                                    <option value="file">Tài liệu</option>
                                </select>
                            </div>
                            <div className="lesson-edit-form-group">
                                <label htmlFor="lessonFile">File bài học:</label>
                                <input
                                    id="lessonFile"
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    required
                                    accept={editLessonData.type === 'video' ? 'video/*' : '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx'}
                                />
                                <small className="file-hint">
                                    {editLessonData.type === 'video' 
                                        ? "Chấp nhận các định dạng video phổ biến (MP4, MOV, AVI, etc.)" 
                                        : "Chấp nhận các định dạng tài liệu phổ biến (PDF, DOC, DOCX, PPT, etc.)"}
                                </small>
                                {selectedFile && (
                                    <div className="selected-file">
                                        <span>Đã chọn: {selectedFile.name}</span>
                                        <button 
                                            type="button" 
                                            className="clear-file-btn"
                                            onClick={resetFileInput}
                                        >
                                            <LucideIcons.X size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="lesson-edit-modal-actions">
                                <button 
                                    type="button" 
                                    className="lesson-edit-cancel-button"
                                    onClick={() => {
                                        setShowEditLessonModal(false);
                                        resetFileInput();
                                    }}
                                    disabled={editLessonLoading}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="lesson-edit-confirm-button"
                                    disabled={editLessonLoading || !selectedFile}
                                >
                                    {editLessonLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmation dialog for lesson deletion */}
            {showDeleteLessonConfirm && (
                <div className="delete-modal-overlay">
                    <div className="delete-modal-container">
                        <h2>Xác nhận xóa bài học</h2>
                        <p>Bạn có chắc chắn muốn xóa bài học "{itemToDelete?.name}" không?</p>
                        <p>Hành động này không thể hoàn tác.</p>
                        <div className="delete-modal-actions">
                            <button 
                                className="btn-cancel-delete"
                                onClick={() => {
                                    setShowDeleteLessonConfirm(false);
                                    setItemToDelete(null);
                                }}
                            >
                                Hủy
                            </button>
                            <button 
                                className="btn-confirm-delete"
                                onClick={handleDeleteLesson}
                            >
                                <LucideIcons.Trash2 size={16} /> Xác nhận xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation dialog for quiz deletion */}
            {showDeleteQuizConfirm && (
                <div className="delete-modal-overlay">
                    <div className="delete-modal-container">
                        <h2>Xác nhận xóa bài kiểm tra</h2>
                        <p>Bạn có chắc chắn muốn xóa bài kiểm tra "{itemToDelete?.question}" không?</p>
                        <p>Hành động này không thể hoàn tác.</p>
                        <div className="delete-modal-actions">
                            <button 
                                className="btn-cancel-delete"
                                onClick={() => {
                                    setShowDeleteQuizConfirm(false);
                                    setItemToDelete(null);
                                }}
                            >
                                Hủy
                            </button>
                            <button 
                                className="btn-confirm-delete"
                                onClick={handleDeleteQuiz}
                            >
                                <LucideIcons.Trash2 size={16} /> Xác nhận xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation dialog for material deletion */}
            {showDeleteMaterialConfirm && (
                <div className="delete-modal-overlay">
                    <div className="delete-modal-container">
                        <h2>Xác nhận xóa tài liệu học tập</h2>
                        <p>Bạn có chắc chắn muốn xóa tài liệu học tập "{itemToDelete?.fileName}" không?</p>
                        <p>Hành động này không thể hoàn tác.</p>
                        <div className="delete-modal-actions">
                            <button 
                                className="btn-cancel-delete"
                                onClick={() => {
                                    setShowDeleteMaterialConfirm(false);
                                    setItemToDelete(null);
                                }}
                            >
                                Hủy
                            </button>
                            <button 
                                className="btn-confirm-delete"
                                onClick={handleDeleteMaterial}
                            >
                                <LucideIcons.Trash2 size={16} /> Xác nhận xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for adding a new chapter */}
            {showAddChapterModal && (
                <div className="teacher-modal-overlay">
                    <div className="teacher-modal">
                        <h3>Thêm chương mới</h3>
                        <div className="teacher-modal-content">
                            <div className="form-group">
                                <label>Tiêu đề chương</label>
                                <input
                                    type="text"
                                    value={newChapter.description}
                                    onChange={(e) => setNewChapter({...newChapter, description: e.target.value})}
                                    placeholder="Nhập tên chương"
                                />
                            </div>
                        </div>
                        <div className="teacher-modal-actions">
                            <button 
                                onClick={() => {
                                    setShowAddChapterModal(false);
                                    setNewChapter({ description: '', order: 1 });
                                }} 
                                className="teacher-modal-cancel"
                            >
                                Hủy
                            </button>
                            <button 
                                onClick={handleAddChapterSubmit}
                                className="teacher-modal-confirm" 
                                disabled={addChapterLoading || !newChapter.description.trim()}
                            >
                                {addChapterLoading ? 'Đang xử lý...' : 'Thêm chương'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseManagementPage; 