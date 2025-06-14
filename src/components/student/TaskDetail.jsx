import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TEST_GROUP_DETAIL, TEST_RESULT_DETAIL, START_TEST_API, SUBMIT_TEST_API } from '../../services/apiService';
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

    // State để theo dõi thời gian và hiển thị thông báo
    const [remainingTime, setRemainingTime] = useState(null);
    const [showTimeWarning, setShowTimeWarning] = useState(false);
    const [isTimeUp, setIsTimeUp] = useState(false);
    const timerRef = useRef(null);

    // Alert state
    const [alert, setAlert] = useState(null);
    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
    };
    
    // Thêm state để theo dõi nếu đang trong quá trình nộp bài tự động
    const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);

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
                let url = TEST_GROUP_DETAIL;
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
                // Create form data with testId and studentId parameters
                const params = new URLSearchParams();
                params.append('testId', testId);
                
                // Call API to get test result
                const resultResponse = await axios.get(
                    `${TEST_RESULT_DETAIL}?${params.toString()}`,
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

        // Cleanup
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [id]);

    // Thêm useEffect để theo dõi thời gian khi showQuestions = true
    useEffect(() => {
        if (showQuestions && test && test.expiredAt) {
            // Tính toán thời gian còn lại khi bắt đầu làm bài
            updateRemainingTime();

            // Thiết lập interval để cập nhật thời gian còn lại mỗi giây
            timerRef.current = setInterval(() => {
                updateRemainingTime();
            }, 1000);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [showQuestions, test]);

    // Hàm tính toán thời gian còn lại
    const updateRemainingTime = () => {
        if (!test || !test.expiredAt) return;

        const expiredDate = new Date(test.expiredAt);
        const currentDate = new Date();
        
        // Tính thời gian còn lại tính bằng mili giây
        const timeLeft = expiredDate - currentDate;
        
        // Cập nhật state thời gian còn lại
        setRemainingTime(timeLeft);
        
        // Hiển thị thông báo khi còn 5 phút
        if (timeLeft <= 5 * 60 * 1000 && timeLeft > 0 && !showTimeWarning) {
            setShowTimeWarning(true);
            showAlert('warning', 'Cảnh báo', 'Còn 5 phút nữa là hết thời gian làm bài!');
        }
        
        // Xử lý khi hết thời gian
        if (timeLeft <= 0 && !isTimeUp) {
            setIsTimeUp(true);
            clearInterval(timerRef.current);
            
            showAlert('warning', 'Hết thời gian', 'Thời gian làm bài đã hết. Bài làm của bạn sẽ được tự động nộp.');
            
            // Tự động nộp bài khi hết thời gian
            setIsAutoSubmitting(true);
            setTimeout(() => {
                submitTest(true); // Truyền tham số true để chỉ ra rằng đây là nộp tự động
            }, 1500); // Chờ 1.5 giây để người dùng đọc thông báo
        }
    };

    // Hàm định dạng thời gian còn lại
    const formatRemainingTime = () => {
        if (remainingTime === null || remainingTime <= 0) return '00:00';
        
        // Chuyển đổi thời gian từ mili giây sang phút và giây
        const minutes = Math.floor(remainingTime / (60 * 1000));
        const seconds = Math.floor((remainingTime % (60 * 1000)) / 1000);
        
        // Định dạng số: thêm 0 ở đầu nếu cần
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(seconds).padStart(2, '0');
        
        return `${formattedMinutes}:${formattedSeconds}`;
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

    // Kiểm tra xem bài kiểm tra đã hết hạn chưa
    const isTestExpired = () => {
        if (!test || !test.expiredAt) return false;
        
        const expiredDate = new Date(test.expiredAt);
        const currentDate = new Date();
        
        return currentDate > expiredDate;
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
            
            // Kiểm tra xem bài kiểm tra đã hết hạn chưa
            if (isTestExpired()) {
                throw new Error('Bài kiểm tra đã hết hạn');
            }
            
            // Tạo FormData để gửi testId
            const formData = new FormData();
            formData.append('testId', id);
            
            // Gọi API để bắt đầu bài kiểm tra
            const response = await axios.post(
                START_TEST_API,
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
                
                // Reset các trạng thái thời gian
                setRemainingTime(null);
                setShowTimeWarning(false);
                setIsTimeUp(false);
                
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
    const submitTest = async (isAutoSubmit = false) => {
        try {
            // Chỉ kiểm tra thời gian đã hết nếu không phải là nộp bài tự động
            if (isTimeUp && !isAutoSubmit && !isAutoSubmitting) {
                showAlert('error', 'Lỗi', 'Thời gian làm bài đã hết. Không thể nộp bài thủ công.');
                return;
            }
            
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
                SUBMIT_TEST_API,
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
                // Dừng bộ đếm thời gian nếu đang chạy
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }
                
                const message = isAutoSubmit ? 
                    'Bài kiểm tra đã được nộp tự động do hết thời gian' : 
                    'Nộp bài kiểm tra thành công';
                
                showAlert('success', 'Thành công', message);
                setTimeout(() => {
                    // Reload the page to get the results
                    window.location.reload();
                }, 1500);
            } else {
                showAlert('error', 'Lỗi', `${response.data?.message}`);
                throw new Error(response.data?.message || 'Failed to submit test');
            }
        } catch (error) {
            console.error('Error submitting test:', error);
            showAlert('error', 'Lỗi', `Không thể nộp bài kiểm tra. Lỗi: ${error}`);
            
            // Nếu là nộp tự động nhưng bị lỗi, sau 3 giây sẽ trở về trang nhóm
            if (isAutoSubmit || isAutoSubmitting) {
                setTimeout(() => {
                    setShowQuestions(false);
                    navigate('/groups');
                }, 3000);
            }
        } finally {
            setSubmitLoading(false);
            setIsAutoSubmitting(false);
        }
    };
    
    
    // Render test result
    const renderTestResult = () => {
        if (!testResult) return null;
        
        // Tính tổng điểm của bài kiểm tra
        const totalPoints = test.questions?.reduce((sum, q) => sum + (q.point || 0), 0) || 0;
        
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
                            <div className="score-label">Kết quả</div>
                            <div className="correct-value"><span className='score-value'>{testResult.score || 0}</span>/{totalPoints}</div>
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
                                            <span className="correct-text"><CheckCircle size={16} /> Đúng ({question.point} điểm)</span>
                                        ) : (
                                            <span className="incorrect-text"><X size={16} /> Sai (0 điểm)</span>
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
                
                {/* Thêm phần tổng kết ở cuối bài kiểm tra */}
                <div className="test-result-footer">
                    <div className="test-info">
                        <p><strong>Lưu ý:</strong> Kết quả đã được lưu lại và gửi cho giáo viên.</p>
                    </div>
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
                                    <li>Nộp bài trước khi hết thời gian.</li>
                                    <li>Chuẩn bị thời gian làm bài hợp lý, không thoát ra khỏi trang trong khi đang làm bài.</li>
                                    <li>Bài kiểm tra sẽ bị tự động nộp khi hết thời gian.</li>
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
                                    className={`start-test-button ${isTestExpired() ? 'expired-test-button' : ''}`}
                                    onClick={startTestAttempt}
                                    disabled={startLoading || isTestExpired()}
                                >
                                    {startLoading ? (
                                        <>
                                            <div className="button-spinner"></div>
                                            Đang bắt đầu...
                                        </>
                                    ) : isTestExpired() ? (
                                        <>
                                            Bài kiểm tra đã hết hạn <ClockAlert size={20} />
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
                                <>
                                    <div className="countdown-timer">
                                        <div className="time-remaining">
                                            <ClockAlert size={18} />
                                            <span className={remainingTime <= 5 * 60 * 1000 ? 'time-warning' : ''}>
                                                Thời gian còn lại: {formatRemainingTime()}
                                            </span>
                                        </div>
                                    </div>
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
                                </>
                            ) : (
                                <div className="no-questions">
                                    <FileText size={32} />
                                    <p>Không có câu hỏi trong bài kiểm tra này</p>
                                </div>
                            )}
                            
                            <div className="test-submit-actions">
                                <button 
                                    className="submit-test-button" 
                                    onClick={() => submitTest(false)}
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