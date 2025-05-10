import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../services/apiService';
import { ArrowLeft, ClockAlert, FileText, AlertCircle, CheckCircle, Circle, ChevronRight, X, CheckSquare } from 'lucide-react';
import '../../assets/css/student-task-detail.css';
import Alert from '../common/Alert';

const TaskDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [startLoading, setStartLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState(null);
    const [startError, setStartError] = useState(null);
    const [test, setTest] = useState(null);
    console.log(test);
    
    const [testResult, setTestResult] = useState(null);
    const [resultLoading, setResultLoading] = useState(false);
    const [showQuestions, setShowQuestions] = useState(false);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [textAnswers, setTextAnswers] = useState({});

    // Alert state
    const [alert, setAlert] = useState(null);
    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
    };
    
    // Fetch test details and attempt to get result
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
                            if (q.type === 'MULTIPLE_CHOICE') {
                                answers[q.id] = [];
                            } else if (q.type === 'SINGLE_CHOICE') {
                                answers[q.id] = '';
                            } else if (q.type === 'text') {
                                textAns[q.id] = '';
                            }
                        });
                        setSelectedAnswers(answers);
                        setTextAnswers(textAns);
                    }

                    // After getting test details, try to fetch the test result
                    fetchTestResult(id, token);
                } else {
                    throw new Error(response.data?.message || 'Failed to fetch test details');
                }
            } catch (error) {
                console.error('Error fetching test details:', error);
                setError('Không thể tải thông tin bài kiểm tra. Vui lòng thử lại sau.');
                setLoading(false);
            }
        };
        
        // Fetch test result
        const fetchTestResult = async (testId, token) => {
            setResultLoading(true);
            try {
                // Create form data with testId parameter
                const params = new URLSearchParams();
                params.append('testId', testId);
                
                // Call API to get test result
                const resultResponse = await axios.get(
                    `${API_BASE_URL}/lms/teststudentresult/gettestdetail?${params.toString()}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                
                if (resultResponse.data && resultResponse.data.code === 0) {
                    setTestResult(resultResponse.data.result);
                }
            } catch (error) {
                console.log('No test result found or not yet submitted');
                // Not setting error state as this is expected if student hasn't taken the test
            } finally {
                setResultLoading(false);
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
        
        const day = date.getUTCDate();
        const month = date.getUTCMonth() + 1;
        const year = date.getUTCFullYear();
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        
        return `${hours}:${minutes} - ${day}/${month}/${year}`;
    };

    const formatDateSubmit = (dateString) => {
        if (!dateString) return 'Chưa hoàn thành trong thời gian cho phép';
        
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
    
    // Start taking the test API call
    const startTestAttempt = async () => {
        setStartLoading(true);
        setStartError(null);
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            // Tạo FormData để gửi testId
            const formData = new FormData();
            formData.append('testId', id);
            
            // Gọi API để bắt đầu bài kiểm tra
            const response = await axios.post(
                `${API_BASE_URL}/lms/teststudentresult/starttest`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            // Kiểm tra kết quả trả về
            if (response.data && response.data.code === 0) {
                console.log('Test started successfully:', response.data);
                // Hiển thị câu hỏi sau khi API trả về thành công
                setShowQuestions(true);
            } else {
                throw new Error(response.data?.message || 'Failed to start test');
            }
        } catch (error) {
            console.error('Error starting test:', error);
            setStartError('Không thể bắt đầu bài kiểm tra. Vui lòng thử lại sau.');
        } finally {
            setStartLoading(false);
        }
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
        const textarea = document.getElementById(`textarea-${questionId}`);
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };
    
    // Submit test
    const submitTest = async () => {
        try {
            setSubmitLoading(true);
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            const answerRequests = [];
            
            // Prepare answers
            if (test && test.questions) {
                test.questions.forEach(question => {
                    let answer = '';
                    
                    if (question.type === 'SINGLE_CHOICE') {
                        answer = selectedAnswers[question.id] || '';
                    } else if (question.type === 'MULTIPLE_CHOICE') {
                        answer = (selectedAnswers[question.id] || []).join(',');
                    } else if (question.type === 'text') {
                        answer = textAnswers[question.id] || '';
                    }
                    
                    answerRequests.push({
                        questionId: question.id,
                        answer: answer
                    });
                });
            }
            
            // Submit the test with the new API endpoint and format
            const response = await axios.post(
                `${API_BASE_URL}/lms/teststudentresult/submitTest`,
                {
                    testId: id,
                    answerRequests: answerRequests
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (response.data && response.data.code === 0) {
                showAlert('success', 'Thành công', `Nộp bài kiểm tra thành công`);
                setTimeout(() => {
                    // Reload the page to get the results
                    window.location.reload();
                }, 1000)
            } else {
                showAlert('error', 'Lỗi', `${response.data?.message}`);
                throw new Error(response.data?.message || 'Failed to submit test');
            }
        } catch (error) {
            console.error('Error submitting test:', error);
            showAlert('error', 'Lỗi', `Không thể nộp bài kiểm tra. Lỗi: ${error}`);
        } finally {
            setSubmitLoading(false);
        }
    };
    
    
    // Render test result
    const renderTestResult = () => {
        if (!testResult) return null;
        
        return (
            <div className="test-result-container">
                <div className="test-result-header">
                    <h2>Kết Quả Bài Kiểm Tra</h2>
                    <div className="test-result-summary">
                        <div className="test-result-info">
                            <p><strong>Sinh viên:</strong> {testResult.student?.fullName}</p>
                            <p><strong>Email:</strong> {testResult.student?.email}</p>
                        </div>
                        <div className="test-result-score">
                            <div className="score-label">Điểm số</div>
                            <div className="score-value">{testResult.score || 0}</div>
                        </div>
                        <div className="test-result-correct">
                            <div className="correct-label">Đúng</div>
                            <div className="correct-value"><span className='score-value'>{testResult.totalCorrect || 0}</span>/{test.questions?.length || 0}</div>
                        </div>
                        <div className="test-result-time">
                            <p><strong>Thời gian bắt đầu:</strong> {formatDate(testResult.startedAt)}</p>
                            <p><strong>Thời gian nộp bài:</strong> {formatDateSubmit(testResult.submittedAt)}</p>
                        </div>
                    </div>
                </div>
                
                <div className="test-result-questions">
                    {testResult.testStudentAnswer && testResult.testStudentAnswer.map((answer, index) => {
                        const question = answer.testQuestion;
                        return (
                            <div className="question-result-card" key={question.id || index}>
                                <div className="question-result-header">
                                    <div className="student-question-number">Câu {index + 1}: {question.content}</div>
                                    <div className={`question-result ${answer.correct ? 'correct' : 'incorrect'}`}>
                                        {answer.correct ? (
                                            <span className="correct-text"><CheckCircle size={16} /> Đúng</span>
                                        ) : (
                                            <span className="incorrect-text"><X size={16} /> Sai</span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="question-result-content">
                                    {question.type === 'SINGLE_CHOICE' && (
                                        <div className="question-options-result">
                                            {parseOptions(question.options).map((option, idx) => (
                                                <div 
                                                    key={idx} 
                                                    className={`question-option-result 
                                                        ${answer.answer === option.label ? 'selected' : ''}
                                                        ${question.correctAnswers.includes(option.label) ? 'correct' : ''}
                                                        ${answer.answer === option.label && !question.correctAnswers.includes(option.label) ? 'incorrect' : ''}`
                                                    }
                                                >
                                                    <div className="option-result-marker">
                                                        {answer.answer === option.label && question.correctAnswers.includes(option.label) ? (
                                                            <CheckCircle size={18} className="option-correct-icon" />
                                                        ) : answer.answer === option.label ? (
                                                            <X size={18} className="option-incorrect-icon" />
                                                        ) : question.correctAnswers.includes(option.label) ? (
                                                            <CheckCircle size={18} className="option-correct-icon" />
                                                        ) : (
                                                            <Circle size={18} />
                                                        )}
                                                    </div>
                                                    <div className="option-result-label">{option.label}</div>
                                                    <div className="option-result-text">{option.text}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {question.type === 'MULTIPLE_CHOICE' && (
                                        <div className="question-options-result">
                                            {parseOptions(question.options).map((option, idx) => {
                                                const studentSelectedThis = answer.answer.split(',').includes(option.label);
                                                const isCorrectOption = question.correctAnswers.split(',').includes(option.label);
                                                
                                                return (
                                                    <div 
                                                        key={idx} 
                                                        className={`question-option-result
                                                            ${studentSelectedThis ? 'selected' : ''}
                                                            ${isCorrectOption ? 'correct' : ''}
                                                            ${studentSelectedThis && !isCorrectOption ? 'incorrect' : ''}`
                                                        }
                                                    >
                                                        <div className="option-result-marker checkbox">
                                                            {studentSelectedThis && isCorrectOption ? (
                                                                <CheckSquare size={18} className="option-correct-icon" />
                                                            ) : studentSelectedThis ? (
                                                                <X size={18} className="option-incorrect-icon" />
                                                            ) : isCorrectOption ? (
                                                                <CheckSquare size={18} className="option-correct-icon" />
                                                            ) : (
                                                                <div className="empty-result-checkbox"></div>
                                                            )}
                                                        </div>
                                                        <div className="option-result-label">{option.label}</div>
                                                        <div className="option-result-text">{option.text}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    
                                    {question.type === 'text' && (
                                        <div className="text-answer-result">
                                            <div className="text-answer-label">Câu trả lời của bạn:</div>
                                            <div className="text-answer-content">
                                                {answer.answer || 'Không có câu trả lời.'}
                                            </div>
                                            
                                            {question.correctAnswers && (
                                                <>
                                                    <div className="text-answer-label correct-answer">Đáp án đúng:</div>
                                                    <div className="text-answer-content correct-answer-content">
                                                        {question.correctAnswers}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                {question.explanation && (
                                    <div className="question-explanation">
                                        <div className="explanation-label">Giải thích:</div>
                                        <div className="explanation-content">{question.explanation}</div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };
    
    if (loading || resultLoading) {
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
            <div className="student-test-detail-header">
                <button className="back-button" onClick={goBack}>
                    <ArrowLeft size={20} /> Quay lại
                </button>
                <h1 className="student-test-title">{test.title}</h1>
                <div className="student-test-meta">
                    <div className="student-test-meta-item">
                        <ClockAlert size={18} />
                        <span>Hạn nộp: {formatDate(test.expiredAt)}</span>
                    </div>
                </div>
                <p className="student-test-description">{test.description || ''}</p>
            </div>
            
            <div className="student-test-content">
                {/* Nếu có kết quả bài kiểm tra, hiển thị kết quả */}
                {testResult ? (
                    renderTestResult()
                ) : (
                    /* Nếu không có kết quả và đang không hiển thị câu hỏi, hiển thị tổng quan */
                    !showQuestions ? (
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
                                    <span className="summary-label">Thời gian bắt đầu:</span>
                                    <span className="summary-value">{formatDate(test.startedAt)}</span>
                                </div>
                            </div>
                            
                            <div className="test-instructions">
                                <h2>Hướng dẫn</h2>
                                <ul>
                                    <li>Đọc kỹ từng câu hỏi trước khi trả lời.</li>
                                    <li>Với câu hỏi trắc nghiệm, chọn một hoặc nhiều đáp án đúng.</li>
                                    <li>Nhấn nút "Nộp bài" khi hoàn thành tất cả các câu hỏi.</li>
                                    <li>Nộp bài trước khi hết thời gian</li>
                                    <li>Bài kiểm tra sẽ bị vô hiệu hóa khi hết thời gian.</li>
                                </ul>
                            </div>
                            
                            {startError && (
                                <div className="test-start-error">
                                    <AlertCircle size={18} />
                                    <span>{startError}</span>
                                </div>
                            )}
                            
                            <div className="test-start-actions">
                                <button 
                                    className="start-test-button" 
                                    onClick={startTestAttempt}
                                    disabled={startLoading}
                                >
                                    {startLoading ? (
                                        <>
                                            <div className="button-spinner"></div>
                                            Đang bắt đầu...
                                        </>
                                    ) : (
                                        <>
                                            Làm bài kiểm tra <ChevronRight size={20} />
                                        </>
                                    )}
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
                                                {question.type === 'SINGLE_CHOICE' && (
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
                                                
                                                {question.type === 'MULTIPLE_CHOICE' && (
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
                                <button 
                                    className="submit-test-button" 
                                    onClick={submitTest}
                                    disabled={submitLoading}
                                >
                                    {submitLoading ? (
                                        <>
                                            <div className="button-spinner"></div>
                                            Đang nộp bài...
                                        </>
                                    ) : (
                                        'Nộp bài'
                                    )}
                                </button>
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default TaskDetail;