import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, TEST_GROUP_DETAIL, GET_ALL_RESULTS } from '../../services/apiService';
import { ArrowLeft, Clock, ClockAlert, Users, FileText, Download, CheckCircle, 
         Circle, ChevronDown, ChevronUp, AlertCircle, ClockArrowUp, X, Search } from 'lucide-react';
import '../../assets/css/teacher-task-detail.css';

const TaskDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [test, setTest] = useState(null);
    const [expandedQuestions, setExpandedQuestions] = useState({});
    
    // Submission states
    const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
    const [submissions, setSubmissions] = useState([]);
    console.log(submissions);
    
    const [submissionsLoading, setSubmissionsLoading] = useState(false);
    const [submissionsError, setSubmissionsError] = useState(null);
    const [submissionsPagination, setSubmissionsPagination] = useState({
        pageNumber: 0,
        pageSize: 10,
        totalPages: 0,
        totalElements: 0
    });

    const [avatarUrl, setAvatarUrl] = useState({});
    
    
    // Fetch test details
    useEffect(() => {
        const fetchTestDetails = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('No authentication token found');
                }
                
                const response = await axios.get(
                    `${TEST_GROUP_DETAIL}?testId=${id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                
                if (response.data && response.data.code === 0) {
                    setTest(response.data.result);
                    
                    // Initialize expanded state for all questions
                    if (response.data.result.questions) {
                        const expanded = {};
                        response.data.result.questions.forEach((q, index) => {
                            // By default, expand first question only
                            expanded[q.id] = index === 0;
                        });
                        setExpandedQuestions(expanded);
                    }
                } else {
                    throw new Error(response.data?.message || 'Failed to fetch test details');
                }
            } catch (error) {
                console.error('Error fetching test details:', error);
                setError('Không thể tải thông tin bài kiểm tra. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };
        
        if (id) {
            fetchTestDetails();
        }
    }, [id]);

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
    
    // Fetch submissions
    const fetchSubmissions = async () => {
        setSubmissionsLoading(true);
        setSubmissionsError(null);
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            // Create URL with query parameters
            const params = new URLSearchParams();
            params.append('testId', id);
            params.append('pageSize', submissionsPagination.pageSize);
            params.append('pageNumber', submissionsPagination.pageNumber);
            
            const response = await axios.get(
                `${GET_ALL_RESULTS}?${params.toString()}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            if (response.data && response.data.code === 0) {
                console.log(response.data);
                
                setSubmissions(response.data.result.content);
                setSubmissionsPagination({
                    ...submissionsPagination,
                    totalPages: response.data.result.page.totalPages,
                    totalElements: response.data.result.page.totalElements
                });
                setShowSubmissionsModal(true);

                response.data.result.content.forEach(responseData => {
                    if (responseData.student.avatar) {
                        fetchAvatar(responseData.student.avatar, responseData.student.id);
                    }
                });
            } else {
                throw new Error(response.data?.message || 'Failed to fetch submissions');
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
            setSubmissionsError('Không thể tải danh sách bài đã nộp. Vui lòng thử lại sau.');
        } finally {
            setSubmissionsLoading(false);
        }
    };
    
    // Toggle question expansion
    const toggleQuestion = (questionId) => {
        setExpandedQuestions(prev => ({
            ...prev,
            [questionId]: !prev[questionId]
        }));
    };
    
    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'Không có ngày đến hạn';
        
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${hours}:${minutes} - ${day}/${month}/${year}`;
    };
    
    // Go back to group page
    const goBack = () => {
        navigate(-1);
    };
    
    // Handle submissions pagination change
    const handlePageChange = (newPage) => {
        setSubmissionsPagination({
            ...submissionsPagination,
            pageNumber: newPage
        });
        
        // Re-fetch with new page
        fetchSubmissions();
    };
    
    // Parse options from string (A. Option1;B. Option2;...)
    const parseOptions = (optionsString) => {
        if (!optionsString) return [];
        
        return optionsString.split(';').map(option => {
            const match = option.match(/^([A-Z])\.\s(.+)$/);
            if (match) {
                return {
                    label: match[1],
                    text: match[2]
                };
            }
            return { label: '', text: option };
        });
    };
    
    // Check if an option is correct
    const isCorrectOption = (question, optionLabel) => {
        if (!question.correctAnswers) return false;
        
        if (question.type === 'SINGLE_CHOICE') {
            return question.correctAnswers === optionLabel;
        } else if (question.type === 'MULTIPLE_CHOICE') {
            return question.correctAnswers.split(',').includes(optionLabel);
        }
        
        return false;
    };

    // Render question content based on type
    const renderQuestionContent = (question) => {
        const options = parseOptions(question.options);
        
        switch (question.type) {
            case 'SINGLE_CHOICE':
                return (
                    <div className="question-options-list">
                        {options.map((option, idx) => (
                            <div 
                                key={idx} 
                                className={`question-option ${isCorrectOption(question, option.label) ? 'correct-option' : ''}`}
                            >
                                <div className="option-marker">
                                    {isCorrectOption(question, option.label) ? (
                                        <CheckCircle size={20} className="correct-icon" />
                                    ) : (
                                        <Circle size={20} />
                                    )}
                                </div>
                                <div className="option-label">{option.label}</div>
                                <div className="option-text">{option.text}</div>
                            </div>
                        ))}
                    </div>
                );
                
            case 'MULTIPLE_CHOICE':
                return (
                    <div className="question-options-list">
                        {options.map((option, idx) => (
                            <div 
                                key={idx} 
                                className={`question-option ${isCorrectOption(question, option.label) ? 'correct-option' : ''}`}
                            >
                                <div className="option-marker checkbox">
                                    {isCorrectOption(question, option.label) ? (
                                        <CheckCircle size={20} className="correct-icon" />
                                    ) : (
                                        <div className="empty-checkbox"></div>
                                    )}
                                </div>
                                <div className="option-label">{option.label}</div>
                                <div className="option-text">{option.text}</div>
                            </div>
                        ))}
                    </div>
                );
                
            case 'text':
                return (
                    <div className="text-answer-field">
                        <div className="text-answer-placeholder">
                            <FileText size={18} />
                            <span>Câu trả lời tự luận</span>
                        </div>
                    </div>
                );
                
            default:
                return <div>Loại câu hỏi không được hỗ trợ</div>;
        }
    };
    
    // Submissions Modal Component
    const SubmissionsModal = () => {
        if (!showSubmissionsModal) return null;
        
        return (
            <div className="submissions-modal-overlay">
                <div className="submissions-modal">
                    <div className="submissions-modal-header">
                        <h3>Danh sách bài đã nộp</h3>
                        <button className="close-modal-btn" onClick={() => setShowSubmissionsModal(false)}>
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="submissions-modal-content">
                        {submissionsLoading ? (
                            <div className="submissions-loading">
                                <div className="submissions-spinner"></div>
                                <p>Đang tải danh sách bài đã nộp...</p>
                            </div>
                        ) : submissionsError ? (
                            <div className="submissions-error">
                                <AlertCircle size={24} />
                                <p>{submissionsError}</p>
                                <button onClick={fetchSubmissions}>Thử lại</button>
                            </div>
                        ) : (
                            <>
                                {submissions.length > 0 ? (
                                    <div className="submissions-table-container">
                                        <table className="submissions-table">
                                            <thead>
                                                <tr>
                                                    <th>STT</th>
                                                    <th>Họ và tên</th>
                                                    <th>Email</th>
                                                    <th>Điểm số</th>
                                                    <th>Số câu đúng</th>
                                                    <th>Thời gian nộp</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {submissions.map((submission, index) => (
                                                    <tr key={submission.id}>
                                                        <td>{submissionsPagination.pageNumber * submissionsPagination.pageSize + index + 1}</td>
                                                        <td>
                                                            <div className="student-name-cell">
                                                                {avatarUrl[submission.student.id] ? (
                                                                    <img src={avatarUrl[submission.student.id]} alt="Avatar" className='result-student-avatar'/>
                                                                ) : (
                                                                    <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className='result-student-avatar'>
                                                                        <circle cx="100" cy="100" r="100" fill="#ff4757" />
                                                                        <path d="M100,40 C60,40 40,70 40,110 C40,150 60,180 100,180 C140,180 160,150 160,110 C160,70 140,40 100,40 Z" fill="#2f3542" />
                                                                        <path d="M65,90 C65,80 75,70 85,70 C95,70 100,80 100,90 C100,80 105,70 115,70 C125,70 135,80 135,90 C135,100 125,110 115,110 C105,110 100,100 100,90 C100,100 95,110 85,110 C75,110 65,100 65,90 Z" fill="#f1f2f6" />
                                                                        <path d="M70,75 C70,70 75,65 80,65 C85,65 90,70 90,75 C90,80 85,85 80,85 C75,85 70,80 70,75 Z" fill="#3742fa" />
                                                                        <path d="M110,75 C110,70 115,65 120,65 C125,65 130,70 130,75 C130,80 125,85 120,85 C115,85 110,80 110,75 Z" fill="#3742fa" />
                                                                        <path d="M65,120 C65,140 80,160 100,160 C120,160 135,140 135,120 C135,110 120,100 100,100 C80,100 65,110 65,120 Z" fill="#f1f2f6" />
                                                                        <path d="M70,110 C80,120 90,125 100,125 C110,125 120,120 130,110 C120,105 110,100 100,100 C90,100 80,105 70,110 Z" fill="#2f3542" />
                                                                    </svg>
                                                                )}
                                                                <span>{submission.student.fullName}</span>
                                                            </div>
                                                        </td>
                                                        <td>{submission.student.email}</td>
                                                        <td>{submission.score}</td>
                                                        <td>{submission.totalCorrect} / {test?.questions?.length || 0}</td>
                                                        <td>{formatDate(submission.submittedAt)}</td>
                                                        <td>
                                                            <button 
                                                                className="view-detail-btn"
                                                                onClick={() => viewStudentTestDetail(submission.testInGroup.id, submission.student.id, submission.id)}
                                                            >
                                                                <Search size={16} />
                                                                Chi tiết
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="no-submissions">
                                        <p>Chưa có bài nộp nào</p>
                                    </div>
                                )}
                                
                                {/* Pagination */}
                                {submissionsPagination.totalPages > 1 && (
                                    <div className="submissions-pagination">
                                        <button 
                                            className="pagination-btn"
                                            disabled={submissionsPagination.pageNumber === 0}
                                            onClick={() => handlePageChange(submissionsPagination.pageNumber - 1)}
                                        >
                                            Trước
                                        </button>
                                        <span className="pagination-info">
                                            Trang {submissionsPagination.pageNumber + 1} / {submissionsPagination.totalPages}
                                        </span>
                                        <button 
                                            className="pagination-btn"
                                            disabled={submissionsPagination.pageNumber >= submissionsPagination.totalPages - 1}
                                            onClick={() => handlePageChange(submissionsPagination.pageNumber + 1)}
                                        >
                                            Sau
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };
    
    // Function to view student test details
    const viewStudentTestDetail = async (testId, studentId, resultId) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            // Create URL with query parameters
            const params = new URLSearchParams();
            params.append('testId', testId);
            params.append('studentId', studentId);
            
            // Navigate to result detail page with necessary parameters
            navigate(`/teacher/test-results/${resultId}?${params.toString()}`);
            
        } catch (error) {
            console.error('Error navigating to test result detail:', error);
        }
    };
    
    if (loading) {
        return (
            <div className="test-detail-loading">
                <div className="test-detail-spinner"></div>
                <p>Đang tải thông tin bài kiểm tra...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="test-detail-error">
                <AlertCircle size={32} />
                <p>{error}</p>
                <button onClick={goBack}>Quay lại</button>
            </div>
        );
    }
    
    if (!test) {
        return (
            <div className="test-detail-error">
                <AlertCircle size={32} />
                <p>Không tìm thấy thông tin bài kiểm tra</p>
                <button onClick={goBack}>Quay lại</button>
            </div>
        );
    }
    
    return (
        <div className="test-detail-container">
            <div className="test-detail-header">
                <button className="back-button" onClick={goBack}>
                    <ArrowLeft size={20} /> Quay lại
                </button>
                <h1 className="test-title">{test.title}</h1>
                <div className="test-meta">
                    <div className="test-meta-item">
                        <ClockArrowUp size={18} />
                        <span>Ngày tạo: {formatDate(test.createdAt)}</span>
                    </div>
                    <div className="test-meta-item">
                        <Clock size={18} />
                        <span>Thời gian bắt đầu: {formatDate(test.startedAt)}</span>
                    </div>
                    <div className="test-meta-item">
                        <ClockAlert size={18} />
                        <span>Hạn nộp: {formatDate(test.expiredAt)}</span>
                    </div>
                </div>
                <p className="test-description">{test.description || ''}</p>
            </div>
            
            <div className="test-content">
                <div className="test-questions">
                    {test.questions && test.questions.length > 0 ? (
                        <div className="teacher-questions-list">
                            {test.questions.map((question, index) => (
                                <div className="teacher-question-card" key={question.id || index}>
                                    <div 
                                        className="teacher-question-header" 
                                        onClick={() => toggleQuestion(question.id)}
                                    >
                                        <div className="question-number">Câu {index + 1}</div>
                                        <div className="question-title">{question.content}</div>
                                        <div className="question-points">{question.point || 0} điểm</div>
                                        <button className="toggle-button">
                                            {expandedQuestions[question.id] ? (
                                                <ChevronUp size={20} />
                                            ) : (
                                                <ChevronDown size={20} />
                                            )}
                                        </button>
                                    </div>
                                    
                                    {expandedQuestions[question.id] && (
                                        <div className="teacher-question-content">
                                            {renderQuestionContent(question)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-questions">
                            <FileText size={32} />
                            <p>Không có câu hỏi trong bài kiểm tra này</p>
                        </div>
                    )}
                </div>
                
                <div className="test-actions">
                    <div className="test-summary-card">
                        <h3 className="summary-title">Tổng quan</h3>
                        <div className="summary-item">
                            <span className="summary-label">Tổng số câu hỏi:</span>
                            <span className="summary-value">{test.questions?.length || 0}</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Tổng điểm:</span>
                            <span className="summary-value">
                                {test.questions?.reduce((sum, q) => sum + (q.point || 0), 0) || 0}
                            </span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Số sinh viên nộp bài:</span>
                            <span className="summary-value">{test.submittedCount || 0}</span>
                        </div>
                        <div className="summary-actions">
                            <button 
                                className="action-button view-submissions" 
                                onClick={fetchSubmissions}
                                disabled={submissionsLoading}
                            >
                                {submissionsLoading ? 'Đang tải...' : 'Xem bài đã nộp'}
                            </button>
                            <button className="action-button edit-test">
                                Chỉnh sửa
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Submissions Modal */}
            <SubmissionsModal />
        </div>
    );
};

export default TaskDetail; 