import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { X, ChevronDown, Copy, Plus, CircleCheck, SquareCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import { CREATE_TEST_API, TEST_GROUP_DETAIL, UPDATE_TEST_API, DELETE_TEST_API } from '../../services/apiService';
import '../../assets/css/create-task.css';
import Select from 'react-select';
import Alert from '../common/Alert';

const QUESTION_TYPES = [
    { value: 'SINGLE_CHOICE', label: 'Trắc nghiệm 1 đáp án', icon: <CircleCheck size={16}/> },
    { value: 'MULTIPLE_CHOICE', label: 'Trắc nghiệm nhiều đáp án', icon: <SquareCheck size={16}/> }
];

const DEFAULT_QUESTION = () => ({
    title: '',
    type: 'SINGLE_CHOICE',
    options: [''],
    correctAnswer: null,
    correctAnswers: [],
    required: false,
    points: 0,
});

const CreateTask = () => {
    const { id: groupId, testId: testInGroupId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Kiểm tra xem đang ở chế độ chỉnh sửa hay không
    const isEditMode = location.pathname.includes('edit-test') && testInGroupId;

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEditMode);
    const [groupName, setGroupName] = useState('');
    const [error, setError] = useState(null);

    // Alert state
    const [alert, setAlert] = useState(null);
    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
    };
    
    // Form state
    const [title, setTitle] = useState('');
    const [instructions, setInstructions] = useState('');
    const [points, setPoints] = useState('100');
    
    // Khởi tạo ngày hôm nay
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayFormatted = `${yyyy}-${mm}-${dd}`;

    const currentHour = String(today.getHours()).padStart(2, '0');
    const currentMinute = String(today.getMinutes()).padStart(2, '0');
    const currentTime = `${currentHour}:${currentMinute}`;

    // Due date state
    const [dueDate, setDueDate] = useState(todayFormatted);
    const [dueDateText, setDueDateText] = useState(formatDueDateTime(todayFormatted, '23:59'));
    const [dueTime, setDueTime] = useState('23:59');
    const [showDueDatePicker, setShowDueDatePicker] = useState(false);
    
    // Start date state
    const [startDate, setStartDate] = useState(todayFormatted);
    const [startTime, setStartTime] = useState(currentTime);
    const [startDateText, setStartDateText] = useState(formatDueDateTime(todayFormatted, currentTime));
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    
    // Dropdowns state
    const [showPointsDropdown, setShowPointsDropdown] = useState(false);
    const [showDueDateDropdown, setShowDueDateDropdown] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTopicDropdown, setShowTopicDropdown] = useState(false);
    
    // Points options
    const pointsOptions = ['100', '50', '20', '10', '5', 'Không có điểm'];
    
    // Instructions editor ref
    const editorRef = useRef(null);
    
    const [questions, setQuestions] = useState([DEFAULT_QUESTION()]);
    
    // Validation state
    const [dateTimeError, setDateTimeError] = useState('');

    // Fetch group name when component mounts
    useEffect(() => {
        const fetchGroupName = () => {
            try {
                const groupData = localStorage.getItem(`group_${groupId}`);
                if (groupData) {
                    const parsedData = JSON.parse(groupData);
                    setGroupName(parsedData.name || 'Nhóm học');
                }
            } catch (error) {
                console.error('Error fetching group data:', error);
                setGroupName('Nhóm học');
            }
        };
        
        fetchGroupName();
    }, [groupId]);

    // Fetch test details if in edit mode
    useEffect(() => {
        if (isEditMode && testInGroupId) {
            const fetchTestDetails = async () => {
                setInitialLoading(true);
                setError(null);
                
                try {
                    const token = localStorage.getItem('authToken');
                    if (!token) {
                        throw new Error('No authentication token found');
                    }
                    
                    const response = await axios.get(
                        `${TEST_GROUP_DETAIL}?testId=${testInGroupId}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        }
                    );
                    
                    if (response.data && response.data.code === 0) {
                        const testData = response.data.result;
                        
                        // Điền thông tin bài kiểm tra vào form
                        setTitle(testData.title || '');
                        setInstructions(testData.description || '');
                        
                        // Xử lý thời gian bắt đầu
                        if (testData.startedAt) {
                            const startDateTime = new Date(testData.startedAt);
                            const startDateFormatted = startDateTime.toISOString().split('T')[0];
                            const startTimeFormatted = `${String(startDateTime.getHours()).padStart(2, '0')}:${String(startDateTime.getMinutes()).padStart(2, '0')}`;
                            
                            setStartDate(startDateFormatted);
                            setStartTime(startTimeFormatted);
                            setStartDateText(formatDueDateTime(startDateFormatted, startTimeFormatted));
                        }
                        
                        // Xử lý thời gian kết thúc/hạn nộp
                        if (testData.expiredAt) {
                            const dueDateTime = new Date(testData.expiredAt);
                            const dueDateFormatted = dueDateTime.toISOString().split('T')[0];
                            const dueTimeFormatted = `${String(dueDateTime.getHours()).padStart(2, '0')}:${String(dueDateTime.getMinutes()).padStart(2, '0')}`;
                            
                            setDueDate(dueDateFormatted);
                            setDueTime(dueTimeFormatted);
                            setDueDateText(formatDueDateTime(dueDateFormatted, dueTimeFormatted));
                        }
                        
                        // Xử lý câu hỏi
                        if (testData.questions && testData.questions.length > 0) {
                            const formattedQuestions = testData.questions.map(q => {
                                const questionData = {
                                    title: q.content || '',
                                    type: q.type || 'SINGLE_CHOICE',
                                    points: q.point || 0,
                                    options: [],
                                    correctAnswer: null,
                                    correctAnswers: []
                                };
                                
                                // Xử lý các lựa chọn
                                if (q.options) {
                                    // Format: "A. Option1;B. Option2;C. Option3"
                                    const optionsArray = q.options.split(';').map(opt => {
                                        // Loại bỏ phần chữ cái và dấu chấm ở đầu (A., B., etc.)
                                        return opt.replace(/^[A-Z]\.\s/, '');
                                    });
                                    
                                    questionData.options = optionsArray;
                                    
                                    // Xử lý đáp án
                                    if (q.correctAnswers) {
                                        if (q.type === 'SINGLE_CHOICE') {
                                            // Lấy vị trí của đáp án đúng (A -> 0, B -> 1, etc.)
                                            const correctIndex = q.correctAnswers.charCodeAt(0) - 'A'.charCodeAt(0);
                                            questionData.correctAnswer = correctIndex;
                                        } else if (q.type === 'MULTIPLE_CHOICE') {
                                            // Chuyển đổi chuỗi đáp án (A,B,C) thành mảng các vị trí (0,1,2)
                                            const correctIndices = q.correctAnswers.split(',').map(
                                                letter => letter.charCodeAt(0) - 'A'.charCodeAt(0)
                                            );
                                            questionData.correctAnswers = correctIndices;
                                        }
                                    }
                                } else {
                                    questionData.options = [''];
                                }
                                
                                return questionData;
                            });
                            
                            setQuestions(formattedQuestions);
                        }
                        
                    } else {
                        throw new Error(response.data?.message || 'Failed to fetch test details');
                    }
                } catch (error) {
                    console.error('Error fetching test details:', error);
                    setError('Không thể tải thông tin bài kiểm tra. Vui lòng thử lại sau.');
                    showAlert('error', 'Lỗi', 'Không thể tải thông tin bài kiểm tra');
                } finally {
                    setInitialLoading(false);
                }
            };
            
            fetchTestDetails();
        }
    }, [isEditMode, testInGroupId]);

    // Kiểm tra thời gian bắt đầu phải là tương lai
    const validateStartDateTime = () => {
        const startDateTime = new Date(`${startDate}T${startTime}`);
        const currentDateTime = new Date();
        
        if (startDateTime <= currentDateTime) {
            setDateTimeError('Thời gian bắt đầu phải là thời điểm trong tương lai');
            return false;
        }
        
        // Kiểm tra ngày hạn nộp phải sau ngày bắt đầu
        if (dueDate) {
            const dueDateTime = new Date(`${dueDate}T${dueTime}`);
            if (dueDateTime <= startDateTime) {
                setDateTimeError('Hạn nộp phải sau thời gian bắt đầu');
                return false;
            }
        }
        
        setDateTimeError('');
        return true;
    };
    
    // Cập nhật state khi thay đổi thời gian bắt đầu
    useEffect(() => {
        if (startDate && startTime) {
            setStartDateText(formatDueDateTime(startDate, startTime));
            validateStartDateTime();
        }
    }, [startDate, startTime]);
    
    // Cập nhật state khi thay đổi hạn nộp
    useEffect(() => {
        if (dueDate && dueTime) {
            setDueDateText(formatDueDateTime(dueDate, dueTime));
            validateStartDateTime();
        }
    }, [dueDate, dueTime]);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!title.trim()) {
            showAlert('error', 'Lỗi', 'Vui lòng nhập tiêu đề bài kiểm tra');
            return;
        }

        if (questions.length === 0) {
            showAlert('error', 'Lỗi', 'Vui lòng thêm ít nhất một câu hỏi');
            return;
        }

        if (questions.some(q => !q.title.trim())) {
            showAlert('error', 'Lỗi', 'Vui lòng nhập nội dung cho tất cả câu hỏi');
            return;
        }
        
        // Kiểm tra thời gian bắt đầu và hạn nộp
        if (!validateStartDateTime()) {
            return;
        }
        
        setLoading(true);
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token found');
            
            // Format startedAt date
            const startDateTime = new Date(`${startDate}T${startTime}`);
            // Format date with timezone offset
            const startedAt = `${startDate}T${startTime}:00+07:00`;
            
            // Format expiredAt date if provided
            let expiredAt = null;
            if (dueDate) {
                expiredAt = `${dueDate}T${dueTime}:00+07:00`;
            }
            
            
            // Format questions for API
            const listQuestionRequest = questions.map(q => {
                let formattedQuestion = {
                    point: parseInt(q.points || 0),
                    content: q.title,
                    type: q.type
                };
                
                // For single and multiple choice questions
                if (q.type === 'SINGLE_CHOICE' || q.type === 'MULTIPLE_CHOICE') {
                    // Format options as "A. Option1;B. Option2;C. Option3"
                    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
                    const options = q.options.map((opt, idx) => `${letters[idx]}. ${opt}`).join(';');
                    formattedQuestion.options = options;
                    
                    // Format correct answers
                    if (q.type === 'SINGLE_CHOICE' && q.correctAnswer !== null) {
                        formattedQuestion.correctAnswers = letters[q.correctAnswer];
                    } else if (q.type === 'MULTIPLE_CHOICE' && q.correctAnswers.length > 0) {
                        formattedQuestion.correctAnswers = q.correctAnswers.map(idx => letters[idx]).join(',');
                    }
                }
                
                return formattedQuestion;
            });
            
            // Prepare request body
            const requestBody = {
                groupId: groupId,
                title: title,
                description: instructions,
                startedAt: startedAt,
                expiredAt: expiredAt,
                listQuestionRequest: listQuestionRequest
            };
            
            let response;
            
            if (isEditMode) {
                // Sử dụng tên trường testInGroupId thay cho testId khi chỉnh sửa, phù hợp với API
                requestBody.testInGroupId = testInGroupId;
                
                // Call API to update test
                response = await axios.put(
                    UPDATE_TEST_API,
                    requestBody,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            } else {
                // Call API to create new test
                response = await axios.post(
                    CREATE_TEST_API,
                    requestBody,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            }
            
            if (response.data && response.data.code === 0) {
                showAlert('success', 'Thành công', isEditMode ? 'Cập nhật bài kiểm tra thành công' : 'Tạo bài kiểm tra thành công');
                setTimeout(() => {
                    // Navigate back to group detail page
                    navigate(`/teacher/groups/${groupId}`);
                }, 1000);
            } else {
                showAlert('error', 'Lỗi', `${response.data?.message || 'Đã xảy ra lỗi'}`);
                throw new Error(response.data?.message || 'Failed to process test');
            }
        } catch (error) {
            console.error(isEditMode ? 'Error updating test:' : 'Error creating test:', error);
            setError(isEditMode ? 'Có lỗi xảy ra khi cập nhật bài kiểm tra.' : 'Có lỗi xảy ra khi tạo bài kiểm tra.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleCancel = () => {
        navigate(`/teacher/groups/${groupId}`);
    };
    
    // Xử lý xóa bài kiểm tra
    const handleDeleteTest = async () => {
        if (!isEditMode || !testInGroupId) return;
        
        // Hiển thị xác nhận trước khi xóa
        if (!window.confirm('Bạn có chắc chắn muốn xóa bài kiểm tra này không?')) {
            return;
        }
        
        setLoading(true);
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token found');
            
            // Tạo FormData để gửi testId
            const formData = new FormData();
            formData.append('testId', testInGroupId);
            
            // Gọi API xóa bài kiểm tra với form-data
            const response = await axios.delete(
                DELETE_TEST_API,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    data: formData // Truyền formData trong data khi sử dụng method DELETE
                }
            );
            
            if (response.data && response.data.code === 0) {
                showAlert('success', 'Thành công', 'Xóa bài kiểm tra thành công');
                setTimeout(() => {
                    // Quay về trang danh sách
                    navigate(`/teacher/groups/${groupId}`);
                }, 1000);
            } else {
                showAlert('error', 'Lỗi', `${response.data?.message || 'Đã xảy ra lỗi khi xóa bài kiểm tra'}`);
            }
        } catch (error) {
            console.error('Error deleting test:', error);
            showAlert('error', 'Lỗi', 'Không thể xóa bài kiểm tra. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };
    
    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showPointsDropdown && !event.target.closest('.dropdown-container.points')) {
                setShowPointsDropdown(false);
            }
            if (showDueDateDropdown && !event.target.closest('.dropdown-container.due-date')) {
                setShowDueDateDropdown(false);
            }
            if (showTopicDropdown && !event.target.closest('.dropdown-container.topic')) {
                setShowTopicDropdown(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showPointsDropdown, showDueDateDropdown, showTopicDropdown]);
    
    // Thêm/xóa/cập nhật câu hỏi
    const addQuestion = () => setQuestions([...questions, DEFAULT_QUESTION()]);
    const removeQuestion = (idx) => setQuestions(questions.filter((_, i) => i !== idx));
    const duplicateQuestion = (idx) => setQuestions([
        ...questions.slice(0, idx + 1),
        { ...questions[idx], options: [...questions[idx].options] },
        ...questions.slice(idx + 1),
    ]);
    const updateQuestion = (idx, newData) => setQuestions(
        questions.map((q, i) => {
            if (i !== idx) return q;
            // Reset correctAnswer/correctAnswers if type changes
            if (newData.type && newData.type !== q.type) {
                if (newData.type === 'SINGLE_CHOICE') {
                    return { ...q, ...newData, correctAnswer: null, correctAnswers: [] };
                } else if (newData.type === 'MULTIPLE_CHOICE') {
                    return { ...q, ...newData, correctAnswers: [], correctAnswer: null };
                }
            }
            return { ...q, ...newData };
        })
    );
    const updateOption = (qIdx, optIdx, value) => setQuestions(
        questions.map((q, i) =>
            i === qIdx
                ? { ...q, options: q.options.map((opt, j) => (j === optIdx ? value : opt)) }
                : q
        )
    );
    const addOption = (qIdx) => setQuestions(
        questions.map((q, i) =>
            i === qIdx ? { ...q, options: [...q.options, ''] } : q
        )
    );
    const removeOption = (qIdx, optIdx) => setQuestions(
        questions.map((q, i) =>
            i === qIdx ? { ...q, options: q.options.filter((_, j) => j !== optIdx) } : q
        )
    );
    const setCorrectAnswer = (qIdx, optIdx) => setQuestions(
        questions.map((q, i) =>
            i === qIdx ? { ...q, correctAnswer: optIdx } : q
        )
    );
    const toggleCorrectAnswerMulti = (qIdx, optIdx) => setQuestions(
        questions.map((q, i) => {
            if (i !== qIdx) return q;
            const exists = q.correctAnswers.includes(optIdx);
            return {
                ...q,
                correctAnswers: exists
                    ? q.correctAnswers.filter(idx => idx !== optIdx)
                    : [...q.correctAnswers, optIdx],
            };
        })
    );
    const setQuestionPoints = (qIdx, value) => setQuestions(
        questions.map((q, i) =>
            i === qIdx ? { ...q, points: value } : q
        )
    );
    
    function formatDueDateTime(dateStr, timeStr) {
        if (!dateStr) return 'Không có ngày đến hạn';
        const date = new Date(dateStr + 'T' + (timeStr || '23:59'));
        const days = ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7'];
        const day = days[date.getDay()];
        const d = date.getDate();
        const m = date.getMonth() + 1;
        return `${timeStr || '23:59'} ${day}, ${d} thg ${m}`;
    }
    
    return (
        <div className="create-task-container">
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
            
            <div className="create-task-header">
                <button className='back-button' onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} /> Quay lại
                </button>
                <h1>{isEditMode ? 'Chỉnh sửa bài kiểm tra' : 'Bài kiểm tra'}</h1>
            </div>
            
            {initialLoading ? (
                <div className="initial-loading">
                    <div className="test-detail-spinner"></div>
                    <p>Đang tải thông tin bài kiểm tra...</p>
                </div>
            ) : (
                <div className="create-task-content">
                    <div className="create-task-form-container">
                        <form onSubmit={handleSubmit} className="create-task-form">
                            <div className="tasks-form-group">
                                <input
                                    type="text"
                                    placeholder="Tiêu đề"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="title-input"
                                    required
                                />
                            </div>
                            
                            <div className="tasks-form-group">
                                <textarea
                                    ref={editorRef}
                                    placeholder="Mô tả (không bắt buộc)"
                                    value={instructions}
                                    onChange={(e) => setInstructions(e.target.value)}
                                    className="instructions-input"
                                    rows={5}
                                />
                            </div>
                            
                            {/* Question section */}
                            <div className="questions-section">
                                {questions.map((q, idx) => (
                                    <div className="question-card" key={idx}>
                                        <div className="question-header">
                                            <input
                                                className="question-title-input"
                                                placeholder="Untitled Question"
                                                value={q.title}
                                                onChange={e => updateQuestion(idx, { title: e.target.value })}
                                            />
                                            <div className="question-type-dropdown">
                                                <Select
                                                    value={QUESTION_TYPES.find(t => t.value === q.type)}
                                                    onChange={selected => updateQuestion(idx, { type: selected.value })}
                                                    options={QUESTION_TYPES}
                                                    isSearchable={false}
                                                    getOptionLabel={e => (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        {e.icon} {e.label}
                                                        </div>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                        {q.type === 'SINGLE_CHOICE' && (
                                            <div className="question-options">
                                                {q.options.map((opt, optIdx) => (
                                                    <div className="option-row" key={optIdx}>
                                                        <input
                                                            type="radio"
                                                            name={`correct-${idx}`}
                                                            checked={q.correctAnswer === optIdx}
                                                            onChange={() => setCorrectAnswer(idx, optIdx)}
                                                        />
                                                        <input
                                                            className="option-input"
                                                            placeholder={`Option ${optIdx + 1}`}
                                                            value={opt}
                                                            onChange={e => updateOption(idx, optIdx, e.target.value)}
                                                        />
                                                        {q.options.length > 1 && (
                                                            <button type="button" className="remove-option-btn" onClick={() => removeOption(idx, optIdx)}><X size={16} /></button>
                                                        )}
                                                    </div>
                                                ))}
                                                <div className="add-option-row">
                                                    <button type="button" className="add-option-btn" onClick={() => addOption(idx)}>
                                                        <Plus size={16} /> Thêm tùy chọn
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        {q.type === 'MULTIPLE_CHOICE' && (
                                            <div className="question-options">
                                                {q.options.map((opt, optIdx) => (
                                                    <div className="option-row" key={optIdx}>
                                                        <input
                                                            type="checkbox"
                                                            name={`correct-multi-${idx}-${optIdx}`}
                                                            checked={q.correctAnswers.includes(optIdx)}
                                                            onChange={() => toggleCorrectAnswerMulti(idx, optIdx)}
                                                        />
                                                        <input
                                                            className="option-input"
                                                            placeholder={`Option ${optIdx + 1}`}
                                                            value={opt}
                                                            onChange={e => updateOption(idx, optIdx, e.target.value)}
                                                        />
                                                        {q.options.length > 1 && (
                                                            <button type="button" className="remove-option-btn" onClick={() => removeOption(idx, optIdx)}><X size={16} /></button>
                                                        )}
                                                    </div>
                                                ))}
                                                <div className="add-option-row">
                                                    <button type="button" className="add-option-btn" onClick={() => addOption(idx)}>
                                                        <Plus size={16} /> Thêm tùy chọn
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        <div className="question-footer">
                                            <div className="answer-key">
                                                <input
                                                    className="points-input"
                                                    type="number"
                                                    min={0}
                                                    value={q.points}
                                                    onChange={e => setQuestionPoints(idx, e.target.value)}
                                                /> điểm
                                            </div>
                                            <div className="question-actions">
                                                <button type="button" className="duplicate-btn" onClick={() => duplicateQuestion(idx)}><Copy size={16} /></button>
                                                <button type="button" className="delete-btn" onClick={() => removeQuestion(idx)}><X size={16} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="add-question-row">
                                    <button type="button" className="add-question-btn" onClick={addQuestion}>
                                        <Plus size={18} /> Thêm câu hỏi
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                    
                    <div className="create-task-sidebar">
                        {/* Hiển thị thông báo lỗi */}
                        {dateTimeError && (
                            <div className="date-time-error">
                                <AlertCircle size={16} />
                                <span>{dateTimeError}</span>
                            </div>
                        )}
                        
                        {/* Dành cho (Group name) */}
                        <div className="tasks-form-group">
                            <div className="dropdown-container for-group">
                                <div className="dropdown-label">Dành cho</div>
                                <div className="assigned-group">
                                    {groupName}
                                </div>
                            </div>
                        </div>
                        
                        {/* Điểm (Points) */}
                        {/* <div className="tasks-form-group">
                            <div className="dropdown-container points">
                                <div className="dropdown-label">Điểm</div>
                                <div
                                    className="dropdown-toggle"
                                    onClick={() => setShowPointsDropdown(!showPointsDropdown)}
                                >
                                    {points}
                                    <ChevronDown size={16} />
                                </div>
                                {showPointsDropdown && (
                                    <div className="dropdown-menu">
                                        {pointsOptions.map((option) => (
                                            <div
                                                key={option}
                                                className={`dropdown-item ${points === option ? 'active' : ''}`}
                                                onClick={() => {
                                                    setPoints(option);
                                                    setShowPointsDropdown(false);
                                                }}
                                            >
                                                {option}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div> */}
                        
                        {/* Thời gian bắt đầu (Start time) */}
                        <div className="tasks-form-group">
                            <div className="dropdown-container start-date">
                                <div className="dropdown-label">Thời gian bắt đầu</div>
                                <div className="due-date-dropdown-box" onClick={() => setShowStartDatePicker(v => !v)}>
                                    <span className="due-date-formatted">
                                        {startDateText}
                                    </span>
                                    <span style={{marginLeft: 'auto'}}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M7 10l5 5 5-5" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    </span>
                                </div>
                                {showStartDatePicker && (
                                    <div className="due-date-picker-popup">
                                        <div className='d-flex align-center' style={{margin: 'auto'}}>
                                            <input
                                                type="date"
                                                className="time-picker-inline"
                                                value={startDate}
                                                onChange={e => setStartDate(e.target.value)}
                                                min={todayFormatted}
                                            />
                                            <input
                                                type="time"
                                                className="time-picker-inline"
                                                value={startTime}
                                                onChange={e => setStartTime(e.target.value)}
                                                style={{marginLeft: 12}}
                                            />
                                        </div>
                                        <div className="due-date-actions">
                                            <button
                                                type="button"
                                                className="picker-inline-btn"
                                                onClick={() => setShowStartDatePicker(false)}
                                            >
                                                Ok
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Hạn nộp (Due date) */}
                        <div className="tasks-form-group">
                            <div className="dropdown-container due-date">
                                <div className="dropdown-label">Hạn nộp</div>
                                {dueDate ? (
                                    <div className="due-date-dropdown-box" onClick={() => setShowDueDatePicker(v => !v)}>
                                        <span className="due-date-formatted">
                                            {formatDueDateTime(dueDate, dueTime)}
                                        </span>
                                        <span style={{marginLeft: 'auto'}}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M7 10l5 5 5-5" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        </span>
                                    </div>
                                ) : (
                                    <div 
                                        className="due-date-dropdown-box" 
                                        onClick={() => {
                                            setDueDate(todayFormatted);
                                            setDueDateText(formatDueDateTime(todayFormatted, '23:59'));
                                            setShowDueDatePicker(true);
                                        }}
                                    >
                                        <span style={{marginLeft: 'auto'}}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M7 10l5 5 5-5" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        </span>
                                    </div>
                                )}
                                {dueDate && showDueDatePicker && (
                                    <div className="due-date-picker-popup">
                                        <div className='d-flex align-center' style={{margin: 'auto'}}>
                                            <input
                                                type="date"
                                                className="time-picker-inline"
                                                value={dueDate}
                                                onChange={e => setDueDate(e.target.value)}
                                                min={startDate}
                                            />
                                            <input
                                                type="time"
                                                className="time-picker-inline"
                                                value={dueTime}
                                                onChange={e => setDueTime(e.target.value)}
                                                style={{marginLeft: 12}}
                                            />
                                        </div>
                                        <div className="due-date-actions">
                                            <button
                                                type="button"
                                                className="picker-inline-btn"
                                                onClick={() => setShowDueDatePicker(false)}
                                            >
                                                Ok
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="form-actions">
                            <button
                                type="button"
                                className={isEditMode ? "teacher-test-delete-button" : "test-cancel-button"}
                                onClick={isEditMode ? handleDeleteTest : handleCancel}
                                disabled={loading}
                            >
                                {isEditMode ? 'Xóa' : 'Hủy'}
                            </button>
                            <button
                                type="button"
                                className="assign-button"
                                onClick={handleSubmit}
                                disabled={loading || !title.trim() || !!dateTimeError}
                            >
                                {loading ? 'Đang xử lý...' : (isEditMode ? 'Xác nhận chỉnh sửa' : 'Tạo bài kiểm tra')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateTask; 