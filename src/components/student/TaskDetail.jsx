import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../services/apiService';
import { ArrowLeft, ClockAlert, FileText, AlertCircle, CheckCircle, Circle, ChevronRight } from 'lucide-react';
import '../../assets/css/student-task-detail.css';

const TaskDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [test, setTest] = useState(null);
    const [showQuestions, setShowQuestions] = useState(false);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [textAnswers, setTextAnswers] = useState({});
    
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
                
                // Tạo FormData để gửi tham số
                const formData = new FormData();
                formData.append('testId', id);
                
                // Tạo URL với query parameters từ FormData
                let url = `${API_BASE_URL}/lms/testingroup/testdetails`;
                let searchParams = new URLSearchParams();
                searchParams.append('testId', id);
                url = `${url}?${searchParams.toString()}`;
                
                const response = await axios.get(
                    url,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                
                if (response.data && response.data.code === 0) {
                    setTest(response.data.result);
                    
                    // Initialize selected answers
                    if (response.data.result.questions) {
                        const answers = {};
                        const textAns = {};
                        response.data.result.questions.forEach(q => {
                            if (q.type === 'multiple_choice') {
                                answers[q.id] = [];
                            } else if (q.type === 'single_choice') {
                                answers[q.id] = '';
                            } else if (q.type === 'text') {
                                textAns[q.id] = '';
                            }
                        });
                        setSelectedAnswers(answers);
                        setTextAnswers(textAns);
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
    
    // Start taking the test
    const startTest = () => {
        setShowQuestions(true);
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
    
    // Handle single choice selection
    const handleSingleChoiceSelect = (questionId, optionLabel) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: optionLabel
        }));
    };
    
    // Handle multiple choice selection
    const handleMultipleChoiceSelect = (questionId, optionLabel) => {
        setSelectedAnswers(prev => {
            const currentSelections = prev[questionId] || [];
            
            if (currentSelections.includes(optionLabel)) {
                // If already selected, remove it
                return {
                    ...prev,
                    [questionId]: currentSelections.filter(label => label !== optionLabel)
                };
            } else {
                // If not selected, add it
                return {
                    ...prev,
                    [questionId]: [...currentSelections, optionLabel]
                };
            }
        });
    };
    
    // Handle text answer change
    const handleTextAnswerChange = (questionId, value) => {
        setTextAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
        const textarea = document.getElementById(`textarea-${id}`);
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };
    
    // Submit test
    const submitTest = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            const answers = [];
            
            // Prepare answers
            if (test && test.questions) {
                test.questions.forEach(question => {
                    let answer = null;
                    
                    if (question.type === 'single_choice') {
                        answer = selectedAnswers[question.id] || '';
                    } else if (question.type === 'multiple_choice') {
                        answer = (selectedAnswers[question.id] || []).join(',');
                    } else if (question.type === 'text') {
                        answer = textAnswers[question.id] || '';
                    }
                    
                    answers.push({
                        questionId: question.id,
                        answer: answer
                    });
                });
            }
            
            // Submit the test
            const response = await axios.post(
                `${API_BASE_URL}/lms/testingroup/submit`,
                {
                    testId: id,
                    answers: answers
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (response.data && response.data.code === 0) {
                alert('Nộp bài kiểm tra thành công!');
                navigate(-1); // Go back after submission
            } else {
                throw new Error(response.data?.message || 'Failed to submit test');
            }
        } catch (error) {
            console.error('Error submitting test:', error);
            alert('Lỗi khi nộp bài kiểm tra. Vui lòng thử lại sau.');
        }
    };
    
    if (loading) {
        return (
            <div className="student-test-detail-loading">
                <div className="student-test-detail-spinner"></div>
                <p>Đang tải thông tin bài kiểm tra...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="student-test-detail-error">
                <AlertCircle size={32} />
                <p>{error}</p>
                <button onClick={goBack}>Quay lại</button>
            </div>
        );
    }
    
    if (!test) {
        return (
            <div className="student-test-detail-error">
                <AlertCircle size={32} />
                <p>Không tìm thấy thông tin bài kiểm tra</p>
                <button onClick={goBack}>Quay lại</button>
            </div>
        );
    }
    
    return (
        <div className="student-test-detail-container">
            <div className="student-test-detail-header">
                <button className="back-button" onClick={goBack}>
                    <ArrowLeft size={20} /> Quay lại
                </button>
                <h1 className="test-title">{test.title}</h1>
                <div className="test-meta">
                    <div className="test-meta-item">
                        <ClockAlert size={18} />
                        <span>Hạn nộp: {formatDate(test.expiredAt)}</span>
                    </div>
                </div>
                <p className="test-description">{test.description || ''}</p>
            </div>
            
            <div className="student-test-content">
                {!showQuestions ? (
                    <div className="test-overview">
                        <div className="test-summary">
                            <h2>Tổng quan</h2>
                            <div className="summary-item">
                                <span className="summary-label">Số câu hỏi:</span>
                                <span className="summary-value">{test.questions?.length || 0}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Tổng điểm:</span>
                                <span className="summary-value">
                                    {test.questions?.reduce((sum, q) => sum + (q.point || 0), 0) || 0}
                                </span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Thời gian:</span>
                                <span className="summary-value">{formatDate(test.expiredAt)}</span>
                            </div>
                        </div>
                        
                        <div className="test-instructions">
                            <h2>Hướng dẫn</h2>
                            <ul>
                                <li>Đọc kỹ từng câu hỏi trước khi trả lời.</li>
                                <li>Với câu hỏi trắc nghiệm, chọn một hoặc nhiều đáp án đúng.</li>
                                <li>Với câu hỏi tự luận, nhập câu trả lời đầy đủ vào ô văn bản.</li>
                                <li>Nhấn nút "Nộp bài" khi hoàn thành tất cả các câu hỏi.</li>
                                <li>Bài kiểm tra sẽ tự động nộp khi hết thời gian (nếu có).</li>
                            </ul>
                        </div>
                        
                        <div className="test-start-actions">
                            <button className="start-test-button" onClick={startTest}>
                                Làm bài kiểm tra <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="test-questions-container">
                        {test.questions && test.questions.length > 0 ? (
                            <div className="questions-list">
                                {test.questions.map((question, index) => (
                                    <div className="question-card" key={question.id || index}>
                                        <div className="student-question-header">
                                            <div className="student-question-number">Câu {index + 1}: {question.content}</div>
                                            <div className="question-points">{question.point || 0} điểm</div>
                                        </div>
                                        
                                        <div className="student-question-content">
                                            {question.type === 'single_choice' && (
                                                <div className="question-options-list">
                                                    {parseOptions(question.options).map((option, idx) => (
                                                        <div 
                                                            key={idx} 
                                                            className={`question-option ${selectedAnswers[question.id] === option.label ? 'selected-option' : ''}`}
                                                            onClick={() => handleSingleChoiceSelect(question.id, option.label)}
                                                        >
                                                            <div className="option-marker">
                                                                {selectedAnswers[question.id] === option.label ? (
                                                                    <CheckCircle size={20} className="selected-icon" />
                                                                ) : (
                                                                    <Circle size={20} />
                                                                )}
                                                            </div>
                                                            <div className="option-label">{option.label}</div>
                                                            <div className="option-text">{option.text}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            {question.type === 'multiple_choice' && (
                                                <div className="question-options-list">
                                                    {parseOptions(question.options).map((option, idx) => (
                                                        <div 
                                                            key={idx} 
                                                            className={`question-option ${selectedAnswers[question.id]?.includes(option.label) ? 'selected-option' : ''}`}
                                                            onClick={() => handleMultipleChoiceSelect(question.id, option.label)}
                                                        >
                                                            <div className="option-marker checkbox">
                                                                {selectedAnswers[question.id]?.includes(option.label) ? (
                                                                    <CheckCircle size={20} className="selected-icon" />
                                                                ) : (
                                                                    <div className="empty-checkbox"></div>
                                                                )}
                                                            </div>
                                                            <div className="option-label">{option.label}</div>
                                                            <div className="option-text">{option.text}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            {question.type === 'text' && (
                                                <div className="student-text-answer-field">
                                                    <textarea 
                                                        id={`textarea-${question.id}`}
                                                        value={textAnswers[question.id] || ''}
                                                        onChange={(e) => handleTextAnswerChange(question.id, e.target.value)}
                                                        placeholder="Nhập câu trả lời của bạn tại đây..."
                                                        rows={1}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-questions">
                                <FileText size={32} />
                                <p>Không có câu hỏi trong bài kiểm tra này</p>
                            </div>
                        )}
                        
                        <div className="test-submit-actions">
                            <button className="back-to-overview" onClick={() => setShowQuestions(false)}>
                                <ArrowLeft size={20} /> Quay lại tổng quan
                            </button>
                            <button className="submit-test-button" onClick={submitTest}>
                                Nộp bài
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskDetail;
