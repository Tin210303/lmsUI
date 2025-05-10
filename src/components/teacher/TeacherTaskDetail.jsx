import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../services/apiService';
import { ArrowLeft, Clock, ClockAlert, Users, FileText, Download, CheckCircle, 
         Circle, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import '../../assets/css/teacher-task-detail.css';

const TaskDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [test, setTest] = useState(null);
    const [expandedQuestions, setExpandedQuestions] = useState({});
    
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
                    `${API_BASE_URL}/lms/testingroup/testdetails?testId=${id}`,
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
                        <Clock size={18} />
                        <span>Ngày tạo: {formatDate(test.createdAt)}</span>
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
                            <button className="action-button view-submissions">
                                Xem bài đã nộp
                            </button>
                            <button className="action-button edit-test">
                                Chỉnh sửa
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetail; 