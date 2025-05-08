import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { X, ChevronDown, Calendar, Copy, Plus, CircleCheck, SquareCheck, ListCheck } from 'lucide-react';
import { API_BASE_URL, CREATE_TEST_API } from '../../services/apiService';
import '../../assets/css/create-task.css';
import Select from 'react-select';

const QUESTION_TYPES = [
    { value: 'single_choice', label: 'Trắc nghiệm 1 đáp án', icon: <CircleCheck size={16}/> },
    { value: 'multiple_choice', label: 'Trắc nghiệm nhiều đáp án', icon: <SquareCheck size={16}/> },
    { value: 'text', label: 'Câu hỏi tự luận', icon: <ListCheck size={16}/> },
];

const DEFAULT_QUESTION = () => ({
    title: '',
    type: 'single_choice',
    options: [''],
    correctAnswer: null,
    correctAnswers: [],
    required: false,
    points: 0,
});

const CreateTask = () => {
    const { id: groupId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [groupName, setGroupName] = useState('');
    
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

    const [dueDate, setDueDate] = useState(todayFormatted);
    const [dueDateText, setDueDateText] = useState(formatDueDateTime(todayFormatted, '23:59'));
    
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
    
    // Thêm state cho giờ phút và popup
    const [dueTime, setDueTime] = useState('23:59');
    const [showDueDatePicker, setShowDueDatePicker] = useState(false);
    
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
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!title.trim()) {
            alert('Vui lòng nhập tiêu đề bài kiểm tra');
            return;
        }

        if (questions.length === 0) {
            alert('Vui lòng thêm ít nhất một câu hỏi');
            return;
        }

        if (questions.some(q => !q.title.trim())) {
            alert('Vui lòng nhập nội dung cho tất cả câu hỏi');
            return;
        }
        
        setLoading(true);
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token found');
            
            // Format expiredAt date if provided
            let expiredAt = null;
            if (dueDate) {
                const dateObj = new Date(`${dueDate}T${dueTime}`);
                expiredAt = dateObj.toISOString().split('.')[0];
            }
            
            // Format questions for API
            const listQuestionRequest = questions.map(q => {
                let formattedQuestion = {
                    point: parseInt(q.points || 0),
                    content: q.title,
                    type: q.type
                };
                
                // For single and multiple choice questions
                if (q.type === 'single_choice' || q.type === 'multiple_choice') {
                    // Format options as "A. Option1;B. Option2;C. Option3"
                    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
                    const options = q.options.map((opt, idx) => `${letters[idx]}. ${opt}`).join(';');
                    formattedQuestion.options = options;
                    
                    // Format correct answers
                    if (q.type === 'single_choice' && q.correctAnswer !== null) {
                        formattedQuestion.correctAnswers = letters[q.correctAnswer];
                    } else if (q.type === 'multiple_choice' && q.correctAnswers.length > 0) {
                        formattedQuestion.correctAnswers = q.correctAnswers.map(idx => letters[idx]).join(',');
                    }
                } else if (q.type === 'text') {
                    // For text/essay, no options needed
                    formattedQuestion.options = "";
                    formattedQuestion.correctAnswers = "";
                }
                
                return formattedQuestion;
            });
            
            // Prepare request body
            const requestBody = {
                groupId: groupId,
                title: title,
                description: instructions,
                expiredAt: expiredAt,
                listQuestionRequest: listQuestionRequest
            };
            
            // Call API to create test
            const response = await axios.post(
                CREATE_TEST_API,
                requestBody,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (response.data && response.data.code === 0) {
                // Navigate back to group detail page
                navigate(`/teacher/groups/${groupId}`);
            } else {
                throw new Error(response.data?.message || 'Failed to create test');
            }
        } catch (error) {
            console.error('Error creating test:', error);
            alert('Có lỗi xảy ra khi tạo bài kiểm tra. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleCancel = () => {
        navigate(`/teacher/groups/${groupId}`);
    };
    
    const handleDateChange = (e) => {
        const selectedDate = e.target.value;
        if (selectedDate) {
            setDueDate(selectedDate);
            // Format date for display: DD/MM/YYYY
            const date = new Date(selectedDate);
            const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
            setDueDateText(formattedDate);
        } else {
            setDueDate('');
            setDueDateText('Không có ngày đến hạn');
        }
        setShowDatePicker(false);
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
                if (newData.type === 'single_choice') {
                    return { ...q, ...newData, correctAnswer: null, correctAnswers: [] };
                } else if (newData.type === 'multiple_choice') {
                    return { ...q, ...newData, correctAnswers: [], correctAnswer: null };
                } else {
                    return { ...q, ...newData, correctAnswer: null, correctAnswers: [] };
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
            <div className="create-task-header">
                <h1>Bài kiểm tra</h1>
            </div>
            
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
                                    {q.type === 'single_choice' && (
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
                                    {q.type === 'multiple_choice' && (
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
                                    {q.type === 'text' && (
                                        <div className="question-short-answer">
                                            <input className="short-answer-input" placeholder="Câu trả lời ngắn" disabled />
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
                                                style={{ width: 50, marginLeft: 8 }}
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
                    <div className="tasks-form-group">
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
                    </div>
                    
                    {/* Hạn nộp (Due date) - Updated to match the image */}
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
                            className="cancel-button"
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            className="assign-button"
                            onClick={handleSubmit}
                            disabled={loading || !title.trim()}
                        >
                            {loading ? 'Đang xử lý...' : 'Tạo bài kiểm tra'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateTask; 