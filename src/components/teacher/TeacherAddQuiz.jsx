import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react';
import '../../assets/css/teacher-add-quiz.css';
import Alert from '../common/Alert';
import { API_BASE_URL } from '../../services/apiService';

const TeacherAddQuiz = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { courseId, lessonId, lessonName } = location.state || {};
    const [alert, setAlert] = useState(null);
    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
    };

    const [quizzes, setQuizzes] = useState([{
        question: '',
        options: {
            A: '',
            B: '',
            C: '',
            D: ''
        },
        answer: 'A'
    }]);

    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const getNextOptionKey = (options) => {
        const keys = Object.keys(options);
        if (keys.length === 0) return 'A';
        const lastKey = keys[keys.length - 1];
        return String.fromCharCode(lastKey.charCodeAt(0) + 1);
    };

    const handleInputChange = (index, field, value) => {
        const updatedQuizzes = [...quizzes];
        if (field.startsWith('option-')) {
            const optionKey = field.split('-')[1];
            updatedQuizzes[index] = {
                ...updatedQuizzes[index],
                options: {
                    ...updatedQuizzes[index].options,
                    [optionKey]: value
                }
            };
        } else {
            updatedQuizzes[index] = {
                ...updatedQuizzes[index],
                [field]: value
            };
        }
        setQuizzes(updatedQuizzes);
    };

    const addNewOption = (quizIndex) => {
        const updatedQuizzes = [...quizzes];
        const quiz = updatedQuizzes[quizIndex];
        const nextKey = getNextOptionKey(quiz.options);
        
        // Chỉ cho phép thêm tối đa 6 lựa chọn (A-F)
        if (nextKey.charCodeAt(0) <= 'F'.charCodeAt(0)) {
            updatedQuizzes[quizIndex] = {
                ...quiz,
                options: {
                    ...quiz.options,
                    [nextKey]: ''
                }
            };
            setQuizzes(updatedQuizzes);
        }
    };

    const removeOption = (quizIndex, optionKey) => {
        const updatedQuizzes = [...quizzes];
        const quiz = updatedQuizzes[quizIndex];
        
        // Không cho phép xóa nếu chỉ còn 2 lựa chọn
        if (Object.keys(quiz.options).length <= 2) {
            return;
        }

        // Lấy tất cả các options hiện tại
        const currentOptions = Object.entries(quiz.options);
        // Xóa option được chọn
        const filteredOptions = currentOptions.filter(([key]) => key !== optionKey);
        // Tạo lại options với key mới (A, B, C,...)
        const reorderedOptions = filteredOptions.reduce((acc, [_, value], index) => {
            const newKey = String.fromCharCode('A'.charCodeAt(0) + index);
            return { ...acc, [newKey]: value };
        }, {});

        // Cập nhật đáp án đúng nếu cần
        let newAnswer = quiz.answer;
        if (quiz.answer === optionKey) {
            newAnswer = 'A'; // Mặc định chọn đáp án đầu tiên nếu đáp án đúng bị xóa
        } else if (quiz.answer > optionKey) {
            // Nếu đáp án đúng nằm sau option bị xóa, dịch chuyển về trước 1 bước
            newAnswer = String.fromCharCode(quiz.answer.charCodeAt(0) - 1);
        }
        
        updatedQuizzes[quizIndex] = {
            ...quiz,
            options: reorderedOptions,
            answer: newAnswer
        };
        
        setQuizzes(updatedQuizzes);
    };

    const addNewQuestion = () => {
        setQuizzes([...quizzes, {
            question: '',
            options: {
                A: '',
                B: ''
            },
            answer: 'A'
        }]);
    };

    const removeQuestion = (index) => {
        if (quizzes.length > 1) {
            const updatedQuizzes = quizzes.filter((_, i) => i !== index);
            setQuizzes(updatedQuizzes);
        }
    };

    const validateQuizzes = () => {
        for (let i = 0; i < quizzes.length; i++) {
            const quiz = quizzes[i];
            if (!quiz.question.trim()) {
                setError(`Vui lòng nhập câu hỏi ${i + 1}`);
                return false;
            }

            const emptyOptions = Object.entries(quiz.options)
                .filter(([_, value]) => !value.trim())
                .map(([key]) => key);

            if (emptyOptions.length > 0) {
                setError(`Vui lòng nhập nội dung cho lựa chọn ${emptyOptions.join(', ')} của câu hỏi ${i + 1}`);
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateQuizzes()) {
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Gửi từng câu hỏi
            for (const quiz of quizzes) {
                const formattedOptions = Object.entries(quiz.options)
                    .map(([key, value]) => `${key}. ${value}`)
                    .join('; ');

                const response = await axios.post(
                    `${API_BASE_URL}/lms/lessonquiz/${lessonId}/create`,
                    [
                        {
                            question: quiz.question,
                            option: formattedOptions,
                            answer: quiz.answer
                        }
                    ],
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        withCredentials: false
                    }
                );
                if (response.data.code === 0) {
                    showAlert('success', 'Thành công', 'Thêm bài kiểm tra thành công!');
                }
                if (response.data.code !== 0) {
                    throw new Error(response.data.message || 'Có lỗi xảy ra khi tạo câu hỏi');
                }
            }
            
            // Điều hướng về trang danh sách khóa học, truyền expandedLessonId để chương vừa thêm quiz được mở rộng
            // giúp người dùng dễ dàng thấy được câu hỏi vừa thêm vào
            navigate('/teacher/course', {
                state: { 
                    courseId,
                    expandedLessonId: lessonId
                }
            });
        } catch (error) {
            console.error('Error creating quiz:', error);
            setError(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tạo câu hỏi');
            showAlert('error', 'Lỗi', 'Có lỗi xảy ra khi thêm nội dung bài học!');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="teacher-add-quiz-container">
            <div className="quiz-header">
                <h2>Thêm câu hỏi kiểm tra</h2>
                <p className="quiz-lesson-name">{lessonName}</p>
            </div>

            <form onSubmit={handleSubmit} className="quiz-form">
                {quizzes.map((quiz, index) => (
                    <div key={index} className="quiz-question-container">
                        <div className="quiz-question-header">
                            <h3>Câu hỏi {index + 1}</h3>
                            {quizzes.length > 1 && (
                                <button
                                    type="button"
                                    className="quiz-remove-question-button"
                                    onClick={() => removeQuestion(index)}
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>

                        <div className="quiz-form-group">
                            <label>Nội dung:</label>
                            <textarea
                                value={quiz.question}
                                onChange={(e) => handleInputChange(index, 'question', e.target.value)}
                                placeholder="Nhập câu hỏi..."
                                required
                            />
                        </div>

                        <div className="quiz-options-group">
                            <div className="quiz-options-header">
                                <label>Các lựa chọn:</label>
                                <button
                                    type="button"
                                    className="quiz-add-option-button"
                                    onClick={() => addNewOption(index)}
                                    disabled={Object.keys(quiz.options).length >= 6}
                                >
                                    <Plus size={16} />
                                    <span>Thêm lựa chọn</span>
                                </button>
                            </div>
                            {Object.entries(quiz.options).map(([key, value]) => (
                                <div key={key} className="quiz-option-item">
                                    <label>{key}.</label>
                                    <input
                                        type="text"
                                        value={value}
                                        onChange={(e) => handleInputChange(index, `option-${key}`, e.target.value)}
                                        placeholder={`Nhập nội dung lựa chọn ${key}...`}
                                        required
                                    />
                                    {Object.keys(quiz.options).length > 2 && (
                                        <button
                                            type="button"
                                            className="quiz-remove-option-button"
                                            onClick={() => removeOption(index, key)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="quiz-form-group">
                            <label>Đáp án đúng:</label>
                            <select
                                value={quiz.answer}
                                onChange={(e) => handleInputChange(index, 'answer', e.target.value)}
                                required
                            >
                                {Object.keys(quiz.options).map((key) => (
                                    <option key={key} value={key}>
                                        {key}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                ))}

                <button
                    type="button"
                    className="quiz-add-question-button"
                    onClick={addNewQuestion}
                >
                    <Plus size={16} />
                    <span>Thêm câu hỏi</span>
                </button>

                {error && <div className="quiz-error-message">{error}</div>}

                <div className="quiz-form-actions">
                    <button
                        type="button"
                        className="quiz-cancel-button"
                        onClick={() => {
                            // Khi hủy, vẫn truyền expandedLessonId để khi quay lại trang TeacherCourseDetail
                            // chương sẽ được mở rộng, giúp cải thiện UX
                            navigate('/teacher/course', {
                                state: { 
                                    courseId,
                                    expandedLessonId: lessonId
                                }
                            });
                        }}
                        disabled={submitting}
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="quiz-submit-button"
                        disabled={submitting}
                    >
                        {submitting ? 'Đang tạo...' : 'Lưu các câu hỏi'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TeacherAddQuiz; 