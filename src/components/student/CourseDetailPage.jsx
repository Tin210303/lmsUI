import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import coursesData from '../../database/CourseData';
import '../../assets/css/course-detail.css';
import { Check, CirclePlay, CircleGauge, Film, Clock, AlarmClock, Plus, Minus } from 'lucide-react';

const CourseDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const course = coursesData.find(c => c.id === id);
    const [openChapters, setOpenChapters] = useState({0: true});

    if (!course) {
        return <div style={{ padding: 32 }}>Khóa học không tồn tại!</div>;
    }

    const { title, description, whatYouWillLearn, stats, chapters, videoPreview } = course;

    const toggleChapter = (index) => {
        setOpenChapters(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    // Hàm xử lý đăng ký học
    const handleRegister = () => {
        // Chuyển hướng đến trang học với ID khóa học
        navigate(`/learning/${id}`);
    };

    return (
        <div className="course-detail-container">
            <div className="left-column">
                <h1 className="course-detail-title">{title}</h1>
                <p className="course-description">{description}</p>

                <h3 style={{margin: 0}}>Bạn sẽ học được gì?</h3>
                <ul className="benefits-list">
                    {whatYouWillLearn.map((item, index) => (
                        <li key={index}><Check size={18} className='benefit-list-check'/> <span>{item}</span></li>
                    ))}
                </ul>

                <div className="course-summary">
                    <h3>Nội dung khóa học</h3>
                    <p><strong>{chapters.length}</strong> chương <strong>· {stats.lessons} </strong> bài học <strong>·</strong> Thời lượng <strong>{stats.duration}</strong></p>
                </div>

                <div className="course-content">
                    {chapters.map((chapter, idx) => (
                        <div key={idx} className="chapter">
                            <div className="chapter-title" onClick={() => toggleChapter(idx)}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {openChapters[idx] ? <Minus size={18} color='#066fbf' /> : <Plus size={18} color='#066fbf'/>}
                                    <span style={{ fontWeight: '600', paddingBottom: '3px' }}>{idx + 1}. {chapter.title}</span>
                                </div>
                                <span style={{ fontSize: '0.9rem' }}>{chapter.lessons.length} bài học</span>
                            </div>
                            {openChapters[idx] && (
                                <ul className="lesson-list">
                                    {chapter.lessons.map((lesson, lIdx) => (
                                        <li key={lIdx}>
                                            <div className='d-flex align-center'>
                                                <CirclePlay size={16} color='#066fbf'opacity={0.4}/>
                                                <span style={{marginLeft: '12px', paddingBottom: '3px', fontSize: '0.9rem'}}>{lIdx + 1}. {lesson.name}</span>
                                            </div>
                                            <span style={{fontSize: '0.9rem'}}>{lesson.time}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="right-column">
                <div className="video-preview">
                    <iframe width="100%" height="200" src={videoPreview} frameBorder="0" allowFullScreen></iframe>
                </div>
                <div className="price-box">
                    <p className="free-label">{stats.free ? 'Miễn phí' : 'Trả phí'}</p>
                    <button className="register-btn" onClick={handleRegister}>ĐĂNG KÝ HỌC</button>
                    <ul className="info-list">
                        <li><CircleGauge size={16} className='mr-16'/> {stats.level}</li>
                        <li><Film size={16} className='mr-16'/> Tổng số {stats.lessons} bài học</li>
                        <li><Clock size={16} className='mr-16'/> Thời lượng {stats.duration}</li>
                        <li><AlarmClock size={16} className='mr-16'/> Giới hạn {stats.limit}</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailPage;
