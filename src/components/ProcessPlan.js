import React, { useState, useContext } from "react";
import { StudyPlanContext } from "../context/StudyPlanContext";
import { useNavigate } from "react-router-dom";
import "../assets/css/processplan.css";

const ProcessPlan = () => {
    const [step, setStep] = useState(1);
    const navigate = useNavigate();
    const { studyPlan, years } = useContext(StudyPlanContext);
    console.log('a',studyPlan.total_credits);
    
    
    const handleSelectYear = (year) => {
        navigate(`/process/${year}?years=${year}`);
    };

    const handleCustomPlan = () => {
        navigate(`/process/customplan`)
    }

    return (
        <div className="process-container">
            {studyPlan.length === 0 ? (
                <div className={`process-box`}>
                    {step === 1 ? (
                        <div className={`process-slide ${step === 1 ? "slide-in" : "slide-out"}`}>
                            <p className="process-text">
                                Chào <strong>UserName</strong>, có vẻ như bạn chưa có một lộ trình học tập hợp lý.
                                Hãy để tôi hỗ trợ bạn nhé!
                            </p>
                            <div className="process-buttons">
                                <button className="process-btn continue-btn" onClick={() => setStep(2)}>
                                    Tiếp Tục
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className={`process-slide ${step === 2 ? "slide-in" : "slide-out"}`}>
                            <div className="d-flex">
                                <p className="back-to-step1" onClick={() => setStep(1)}>&lt;</p>
                                <div style={{margin: 'auto'}}>
                                    <p className="process-text">
                                        Tôi sẽ giúp bạn xây dựng một lộ trình học tập hợp lý để quản lý việc học tập dễ dàng hơn.
                                    </p>
                                    <p className="process-subtext">Bạn dự kiến thời điểm tốt nghiệp trong bao lâu?</p>
                                </div>
                            </div>
                            <div className="year-buttons">
                                {[3, 4, 5, 6].map((year) => (
                                    <button key={year} className="process-btn year-btn" onClick={() => handleSelectYear(year)}>
                                        {year} Năm
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            ):(
                <div className="study-plan">
                    <h2>Lộ trình học trong vòng {years} năm của bạn</h2>

                    <div className="d-flex justify-content-between imy-20">
                        <div className="summary">
                            <p>Số tín chỉ tối thiểu phải tích lũy: <strong>123</strong></p>
                            <p>Số tín chỉ đã đăng ký lộ trình: <strong>{studyPlan.registered_credits}</strong></p>
                            <p>Số tín chỉ bắt buộc: <strong>{studyPlan.required_credits}</strong></p>
                            <p>Số tín chỉ tự chọn: <strong>{studyPlan.elective_credits}</strong></p>
                        </div>
                        <div className="button-group">
                            <button onClick={handleCustomPlan} className="edit-btn">Thay đổi lộ trình</button>
                        </div>
                    </div>

                    <table className="study-table">
                        <thead>
                            <tr>
                                <th style={{width: '150px'}}>Mã học phần</th>
                                <th>Tên học phần</th>
                                <th>Số TC</th>
                                <th>Loại học phần</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studyPlan.process.map((semester, index) => (
                                <React.Fragment key={index}>
                                    <tr className="semester-header">
                                        <td colSpan="2">{semester.semester}</td>
                                        <td colSpan="2">Tổng số TC đăng ký: {semester.totalCredits}</td>
                                    </tr>
                                    {semester.courses.map((course, idx) => (
                                        <tr key={idx}>
                                            <td className="text-center">{course.code}</td>
                                            <td>{course.name}</td>
                                            <td className="text-center">{course.credits}</td>
                                            <td className={`course-type text-center ${course.type === "Bắt buộc" ? "red" : "green"}`}>{course.type}</td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                    
                </div>
            )}
        </div>
    );
};

export default ProcessPlan;
