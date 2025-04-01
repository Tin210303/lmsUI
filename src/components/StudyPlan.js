import React, { useContext } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { StudyPlanContext } from "../context/StudyPlanContext";
import "../assets/css/processplan.css";

const studyPlanData = {
    total_credits: 123,
    registered_credits: 123,
    required_credits: 114,
    elective_credits: 9,
    process: [
        {
            semester: "Học Kỳ: 1 - Năm Học: 2021 - 2022",
            totalCredits: 15,
            courses: [
                { code: "LLCTTH3", name: "Triết học Mác - Lênin", credits: 3, type: "Bắt buộc" },
                { code: "MTR1022", name: "Giáo dục môi trường đại cương", credits: 2, type: "Bắt buộc" },
                { code: "TIN1039", name: "Nhập môn lập trình", credits: 3, type: "Bắt buộc" },
                { code: "TIN2013", name: "Kiến trúc máy tính", credits: 3, type: "Bắt buộc" },
                { code: "TIN3032", name: "Nhập môn cơ sở dữ liệu", credits: 2, type: "Bắt buộc" },
                { code: "TOA1012", name: "Cơ sở toán", credits: 2, type: "Bắt buộc" },
            ],
        },
        {
            semester: "Học Kỳ: 2 - Năm Học: 2021 - 2022",
            totalCredits: 18,
            courses: [
                { code: "TIN3032", name: "Kỹ năng mềm", credits: 3, type: "Bắt buộc" },
                { code: "TIN3032", name: "Kỹ thuật lập trình", credits: 3, type: "Bắt buộc" },
                { code: "TIN3032", name: "Ngôn ngữ truy vấn cơ sở dữ liệu (SQL)", credits: 2, type: "Bắt buộc" },
                { code: "TIN3032", name: "Lập trình nâng cao", credits: 3, type: "Bắt buộc" },
                { code: "TIN3032", name: "Lập trình Front - End", credits: 2, type: "Bắt buộc" },
                { code: "TOA1012", name: "Đại số tuyến tính", credits: 3, type: "Bắt buộc" },
            ],
        },
        {
            semester: "Học Kỳ: 3 - Năm Học: 2021 - 2022",
            totalCredits: 4,
            courses: [
                { code: "TIN3032", name: "Kinh tế chính trị Mác - Lênin", credits: 2, type: "Bắt buộc" },
                { code: "TIN3032", name: "Chủ nghĩa xã hội khoa học", credits: 2, type: "Bắt buộc" },
            ],
        },
        {
            semester: "Học Kỳ: 1 - Năm Học: 2022 - 2023",
            totalCredits: 17,
            courses: [
                { code: "TIN3032", name: "Pháp luật Việt Nam đại cương", credits: 2, type: "Bắt buộc" },
                { code: "TIN3032", name: "Toán học rời rạc", credits: 3, type: "Bắt buộc" },
                { code: "TIN3032", name: "Lập trình hướng đối tượng", credits: 3, type: "Bắt buộc" },
                { code: "TIN3032", name: "Giải tích", credits: 3, type: "Bắt buộc" },
                { code: "TIN3032", name: "Mạng máy tính", credits: 3, type: "Bắt buộc" },
                { code: "TIN3032", name: "Đồ họa máy tính", credits: 3, type: "Bắt buộc" },
            ],
        },
        {
            semester: "Học Kỳ: 2 - Năm Học: 2022 - 2023",
            totalCredits: 15,
            courses: [
                { code: "TIN3032", name: "Java cơ bản", credits: 3, type: "Bắt buộc" },
                { code: "TIN3032", name: "Các hệ quản trị cơ sở dữ liệu", credits: 2, type: "Bắt buộc" },
                { code: "TIN3032", name: "Cấu trúc dữ liệu và thuật toán", credits: 4, type: "Bắt buộc" },
                { code: "TIN3032", name: "Thiết kế cơ sở dữ liệu", credits: 2, type: "Bắt buộc" },
                { code: "TIN3032", name: "Ngôn ngữ mô hình hóa UML", credits: 2, type: "Bắt buộc" },
                { code: "TIN3032", name: "Nguyên lý hệ điều hành", credits: 2, type: "Bắt buộc" },
            ],
        },
        {
            semester: "Học Kỳ: 3 - Năm Học: 2022 - 2023",
            totalCredits: 7,
            courses: [
                { code: "TIN3032", name: "Lịch sử Đảng cộng sản Việt Nam", credits: 2, type: "Bắt buộc" },
                { code: "TIN3032", name: "Tư tưởng Hồ Chí Minh", credits: 2, type: "Bắt buộc" },
                { code: "TIN3032", name: "Phương pháp tính", credits: 3, type: "Tự chọn" },
            ],
        },
        {
            semester: "Học Kỳ: 1 - Năm Học: 2023 - 2024",
            totalCredits: 18,
            courses: [
                { code: "TIN3032", name: "Lập trình Python", credits: 3, type: "Bắt buộc" },
                { code: "TIN3032", name: "Java nâng cao", credits: 3, type: "Bắt buộc" },
                { code: "TIN3032", name: "Trí tuệ nhân tạo", credits: 3, type: "Bắt buộc" },
                { code: "TIN3032", name: "Xác suất thống kê", credits: 3, type: "Bắt buộc" },
                { code: "TIN3032", name: "Kỹ nghệ phần mềm", credits: 3, type: "Bắt buộc" },
                { code: "TIN3032", name: "Phân tích và thiết kế hệ thống thông tin", credits: 3, type: "Bắt buộc" },
            ],
        },
        {
            semester: "Học Kỳ: 2 - Năm Học: 2023 - 2024",
            totalCredits: 17,
            courses: [
                { code: "TIN3032", name: "Quản trị dự án phần mềm", credits: 3, type: "Bắt buộc" },
                { code: "TIN3032", name: "Kiểm định phần mềm", credits: 3, type: "Bắt buộc" },
                { code: "TIN3032", name: "Web ngữ nghĩa", credits: 3, type: "Tự chọn" },
                { code: "TIN3032", name: "Mẫu thiết kế", credits: 2, type: "Bắt buộc" },
                { code: "TIN3032", name: "XML và ứng dụng", credits: 3, type: "Bắt buộc" },
                { code: "TIN3032", name: "Lập trình ứng dụng Web", credits: 3, type: "Tự chọn" },
            ],
        },
        {
            semester: "Học Kỳ: 1 - Năm Học: 2024 - 2025",
            totalCredits: 14,
            courses: [
                { code: "TIN3032", name: "Khóa luận tốt nghiệp", credits: 10, type: "Bắt buộc" },
                { code: "TIN3032", name: "Thực tập tốt nghiệp", credits: 4, type: "Bắt buộc" },
            ],
        },

    ],
}

const StudyPlan = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const years = queryParams.get("years");
    const { setStudyPlan } = useContext(StudyPlanContext);

    const handleSavePlan = () => {
        setStudyPlan(studyPlanData);
        alert("Lộ trình đã được lưu!");
        navigate(`/process`)
    };
    const handleCustomPlan = () => {
        navigate(`/process/customplan`)
    }

    return (
        <div className="process-container">
            <div className="study-plan">
                <Link to="/process" className="breadcrumb-link">BACK</Link>
                <h2>Đây là lộ trình học trong vòng {years} năm mà tôi đề xuất cho bạn<br/> Bạn có thể lưu lộ trình này hoặc tự thay đổi lộ trình</h2>

                <div className="d-flex justify-content-between imy-20">
                    <div className="summary">
                        <p>Số tín chỉ tối thiểu phải tích lũy: <strong>123</strong></p>
                        <p>Số tín chỉ bắt buộc: <strong>114</strong></p>
                        <p>Số tín chỉ tự chọn: <strong>9</strong></p>
                    </div>
                    <div className="button-group">
                        <button onClick={handleCustomPlan} className="edit-btn">Thay đổi lộ trình</button>
                        <button onClick={handleSavePlan} className="save-btn">Lưu lộ trình</button>
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
                        {studyPlanData.process.map((semester, index) => (
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
        </div>
    );
};

export default StudyPlan;
