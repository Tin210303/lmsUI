import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, GET_STUDENT_TEST_RESULT } from '../../services/apiService';
import { ArrowLeft, AlertCircle, CheckCircle, Circle, X, CheckSquare } from 'lucide-react';
import '../../assets/css/test-result-detail.css';

const TestResultDetail = () => {
    const { id } = useParams(); // id của kết quả bài kiểm tra
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const testId = queryParams.get('testId');
    const studentId = queryParams.get('studentId');
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [testResult, setTestResult] = useState(null);
    const [studentAvatar, setStudentAvatar] = useState(null);
    
    // Tải chi tiết kết quả bài kiểm tra
    useEffect(() => {
        const fetchTestResultDetail = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('No authentication token found');
                }
                
                // Tạo URL với query parameters
                const params = new URLSearchParams();
                params.append('testId', testId);
                params.append('studentId', studentId);
                
                const response = await axios.get(
                    `${GET_STUDENT_TEST_RESULT}?${params.toString()}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                
                if (response.data && response.data.code === 0) {
                    setTestResult(response.data.result);
                    
                    // Tải avatar sinh viên nếu có
                    if (response.data.result.student?.avatar) {
                        fetchStudentAvatar(response.data.result.student.avatar);
                    }
                } else {
                    throw new Error(response.data?.message || 'Không thể tải chi tiết bài kiểm tra');
                }
            } catch (error) {
                console.error('Error fetching test result detail:', error);
                setError('Không thể tải thông tin chi tiết bài làm. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };
        
        if (testId && studentId) {
            fetchTestResultDetail();
        }
    }, [testId, studentId, id]);
    
    // Tải avatar sinh viên
    const fetchStudentAvatar = async (avatarPath) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;
            
            const response = await axios.get(
                `${API_BASE_URL}${avatarPath}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    responseType: 'blob'
                }
            );
            
            const imageUrl = URL.createObjectURL(response.data);
            setStudentAvatar(imageUrl);
        } catch (error) {
            console.error('Error fetching student avatar:', error);
        }
    };
    
    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'Không có thông tin';
        
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${hours}:${minutes} - ${day}/${month}/${year}`;
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
    
    // Kiểm tra xem một lựa chọn có phải là câu trả lời của sinh viên không
    const isStudentAnswer = (answerStr, optionLabel) => {
        if (!answerStr) return false;
        
        if (answerStr.includes(',')) {
            return answerStr.split(',').includes(optionLabel);
        } else {
            return answerStr === optionLabel;
        }
    };
    
    // Kiểm tra xem một lựa chọn có phải là đáp án đúng không
    const isCorrectAnswer = (correctAnswersStr, optionLabel) => {
        if (!correctAnswersStr) return false;
        
        if (correctAnswersStr.includes(',')) {
            return correctAnswersStr.split(',').includes(optionLabel);
        } else {
            return correctAnswersStr === optionLabel;
        }
    };
    
    // Quay lại trang trước đó
    const goBack = () => {
        navigate(-1);
    };
    
    if (loading) {
        return (
            <div className="test-result-detail-loading">
                <div className="test-result-detail-spinner"></div>
                <p>Đang tải thông tin chi tiết bài làm...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="test-result-detail-error">
                <AlertCircle size={32} />
                <p>{error}</p>
                <button onClick={goBack}>Quay lại</button>
            </div>
        );
    }
    
    if (!testResult) {
        return (
            <div className="test-result-detail-error">
                <AlertCircle size={32} />
                <p>Không tìm thấy thông tin chi tiết bài làm</p>
                <button onClick={goBack}>Quay lại</button>
            </div>
        );
    }
    
    return (
        <div className="test-result-detail-container">
            <div className="test-result-detail-header">
                <button className="back-button" onClick={goBack}>
                    <ArrowLeft size={20} /> Quay lại
                </button>
                <h1 className="test-result-detail-title">
                    Chi tiết bài làm: {testResult.testInGroup.title}
                </h1>
            </div>
            
            <div className="test-result-detail-content">
                <div className="student-info-card">
                    <div className="student-info-header">
                        <div className="student-avatar-container">
                            {studentAvatar ? (
                                <img 
                                    src={studentAvatar} 
                                    alt="Avatar" 
                                    className="student-avatar" 
                                />
                            ) : (
                                <div className="student-avatar-placeholder">
                                    {testResult.student.fullName.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="student-basic-info">
                            <h2>{testResult.student.fullName}</h2>
                            <p>{testResult.student.email}</p>
                            <p>Ngành: {testResult.student.major.name}</p>
                        </div>
                    </div>
                    
                    <div className="score-summary">
                        <div className="score-box">
                            <span className="score-label">Kết quả</span>
                            <span className="score-label">
                                <span className="score-value">{testResult.score}</span> / {testResult.testStudentAnswer.reduce((sum, item) => sum + item.testQuestion.point, 0)}
                            </span>
                        </div>
                        <div className="score-box">
                            <span className="score-label">Câu đúng</span>
                            <span className="score-label">
                                <span className="score-value">{testResult.totalCorrect}</span> / {testResult.testStudentAnswer.length}
                            </span>
                        </div>
                        <div className="submission-time">
                            <div><strong>Thời gian bắt đầu:</strong> {formatDate(testResult.startedAt)}</div>
                            <div><strong>Thời gian nộp bài:</strong> {formatDate(testResult.submittedAt)}</div>
                        </div>
                    </div>
                </div>
                
                <div className="answers-list">
                    <h2 className="answers-list-title">Chi tiết bài làm</h2>
                    
                    {testResult.testStudentAnswer.map((item, index) => (
                        <div 
                            key={item.id}
                            className={`answer-card ${item.correct ? 'correct-answer' : 'incorrect-answer'}`}
                        >
                            <div className="answer-header">
                                <div className="question-number">Câu {index + 1}</div>
                                <div className="question-content">{item.testQuestion.content}</div>
                                <div className="question-points">{item.testQuestion.point} điểm</div>
                                <div className="question-result">
                                    {item.correct ? (
                                        <div className="correct-badge">
                                            <CheckCircle size={18} /> Đúng
                                        </div>
                                    ) : (
                                        <div className="incorrect-badge">
                                            <X size={18} /> Sai
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="answer-content">
                                {item.testQuestion.type === 'SINGLE_CHOICE' && (
                                    <div className="options-list">
                                        {parseOptions(item.testQuestion.options).map((option, optionIndex) => {
                                            const isStudentSelected = isStudentAnswer(item.answer, option.label);
                                            const isCorrect = isCorrectAnswer(item.testQuestion.correctAnswers, option.label);
                                            
                                            return (
                                                <div 
                                                    key={optionIndex}
                                                    className={`option-item ${isStudentSelected ? 'student-selected' : ''} ${isCorrect ? 'correct-option' : ''}`}
                                                >
                                                    <div className="option-marker">
                                                        {isStudentSelected && isCorrect ? (
                                                            <CheckCircle size={20} className="correct-icon" />
                                                        ) : isStudentSelected ? (
                                                            <X size={20} className="incorrect-icon" />
                                                        ) : isCorrect ? (
                                                            <CheckCircle size={20} className="correct-icon" />
                                                        ) : (
                                                            <Circle size={20} />
                                                        )}
                                                    </div>
                                                    <div className="option-label">{option.label}</div>
                                                    <div className="option-text">{option.text}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                
                                {item.testQuestion.type === 'MULTIPLE_CHOICE' && (
                                    <div className="options-list">
                                        {parseOptions(item.testQuestion.options).map((option, optionIndex) => {
                                            const isStudentSelected = isStudentAnswer(item.answer, option.label);
                                            const isCorrect = isCorrectAnswer(item.testQuestion.correctAnswers, option.label);
                                            
                                            return (
                                                <div 
                                                    key={optionIndex}
                                                    className={`option-item ${isStudentSelected ? 'student-selected' : ''} ${isCorrect ? 'correct-option' : ''}`}
                                                >
                                                    <div className="option-marker checkbox">
                                                        {isStudentSelected && isCorrect ? (
                                                            <CheckSquare size={20} className="correct-icon" />
                                                        ) : isStudentSelected ? (
                                                            <X size={20} className="incorrect-icon" />
                                                        ) : isCorrect ? (
                                                            <CheckSquare size={20} className="correct-icon" />
                                                        ) : (
                                                            <div className="empty-checkbox"></div>
                                                        )}
                                                    </div>
                                                    <div className="option-label">{option.label}</div>
                                                    <div className="option-text">{option.text}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                
                                {item.testQuestion.type === 'text' && (
                                    <div className="text-answer">
                                        <div className="text-answer-label">Câu trả lời của sinh viên:</div>
                                        <div className="text-answer-content">
                                            {item.answer || 'Không có câu trả lời.'}
                                        </div>
                                        
                                        {item.testQuestion.correctAnswers && (
                                            <>
                                                <div className="text-answer-label correct-answer-label">Đáp án đúng:</div>
                                                <div className="text-answer-content correct-answer-content">
                                                    {item.testQuestion.correctAnswers}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TestResultDetail; 