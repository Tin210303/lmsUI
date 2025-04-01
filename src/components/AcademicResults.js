import React, { useState } from 'react';
import '../assets/css/AcademicResults.css';

const AcademicResults = () => {
    // Dữ liệu mẫu các học kỳ
    const allSemesterData = [
        // Học kỳ 1
        {
            completedCredits: 109,
            totalCredits: 123,
            averageGrade: 2.92,
            totalGrade: 4.0,
            totalRegisteredCredits: 15,
            totalAccumulatedCredits: 15,
            academicYear: "2021 - 2022",
            semester: "1",
            semesterGPA: 4.0,
            subjects: [
                {
                    code: "LLCTTH3",
                    name: "Triết học Mác - Lênin",
                    credits: 3,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 8.5,
                    gradeExam: 8.5,
                    grade10: 8.5,
                    letterGrade: "A",
                    grade4: 4.0
                },
                {
                    code: "TIN3093",
                    name: "Phân tích và thiết kế các hệ thống thông tin - Nhóm 1",
                    credits: 3,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 8.5,
                    gradeExam: 8.5,
                    grade10: 8.5,
                    letterGrade: "A",
                    grade4: 4.0
                },
                {
                    code: "TIN3033",
                    name: "Công nghệ Web",
                    credits: 3,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 8.5,
                    gradeExam: 8.5,
                    grade10: 8.5,
                    letterGrade: "A",
                    grade4: 4.0
                },
                {
                    code: "TIN3001",
                    name: "Cơ sở dữ liệu nâng cao",
                    credits: 3,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 8.5,
                    gradeExam: 8.5,
                    grade10: 8.5,
                    letterGrade: "A",
                    grade4: 4.0
                },
                {
                    code: "ENG2013",
                    name: "Tiếng Anh chuyên ngành CNTT",
                    credits: 3,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 8.5,
                    gradeExam: 8.5,
                    grade10: 8.5,
                    letterGrade: "A",
                    grade4: 4.0
                }
            ]
        },
        // Học kỳ 2
        {
            completedCredits: 109,
            totalCredits: 123,
            averageGrade: 3.5,
            totalGrade: 4.0,
            totalRegisteredCredits: 18,
            totalAccumulatedCredits: 18,
            academicYear: "2021 - 2022",
            semester: "2",
            semesterGPA: 3.7, // Thêm điểm trung bình học kỳ
            subjects: [
                {
                    code: "LLCTTH4",
                    name: "Kinh tế chính trị Mác - Lênin",
                    credits: 3,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 9.0,
                    gradeExam: 8.7,
                    grade10: 8.8,
                    letterGrade: "A",
                    grade4: 4.0
                },
                {
                    code: "TIN3104",
                    name: "Trí tuệ nhân tạo",
                    credits: 3,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 7.6,
                    gradeExam: 8.0,
                    grade10: 7.8,
                    letterGrade: "B",
                    grade4: 3.5
                },
                {
                    code: "TIN3075",
                    name: "Lập trình ứng dụng di động",
                    credits: 4,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 8.3,
                    gradeExam: 8.0,
                    grade10: 8.1,
                    letterGrade: "C",
                    grade4: 4.0
                },
                {
                    code: "TIN3083",
                    name: "Đồ án công nghệ phần mềm",
                    credits: 4,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 8.1,
                    gradeExam: 8.0,
                    grade10: 8.0,
                    letterGrade: "F",
                    grade4: 4.0
                },
                {
                    code: "TIN3021",
                    name: "Phát triển phần mềm hướng dịch vụ",
                    credits: 4,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 7.5,
                    gradeExam: 7.0,
                    grade10: 7.2,
                    letterGrade: "D",
                    grade4: 3.0
                },
                {
                    code: "TIN3021",
                    name: "Phát triển phần mềm hướng dịch vụ",
                    credits: 4,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 7.5,
                    gradeExam: 7.0,
                    grade10: 7.2,
                    letterGrade: "D",
                    grade4: 3.0
                },
                {
                    code: "TIN3021",
                    name: "Phát triển phần mềm hướng dịch vụ",
                    credits: 4,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 7.5,
                    gradeExam: 7.0,
                    grade10: 7.2,
                    letterGrade: "D",
                    grade4: 3.0
                }
            ]
        },
        // Học kỳ 3
        {
            completedCredits: 109,
            totalCredits: 123,
            averageGrade: 2.4,
            totalGrade: 4.0,
            totalRegisteredCredits: 16,
            totalAccumulatedCredits: 16,
            academicYear: "2022 - 2023",
            semester: "1",
            semesterGPA: 3.3, // Thêm điểm trung bình học kỳ
            subjects: [
                {
                    code: "LLCTTH4",
                    name: "Kinh tế chính trị Mác - Lênin",
                    credits: 3,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 9.0,
                    gradeExam: 8.7,
                    grade10: 8.8,
                    letterGrade: "A",
                    grade4: 4.0
                },
                {
                    code: "TIN3104",
                    name: "Trí tuệ nhân tạo",
                    credits: 3,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 7.6,
                    gradeExam: 8.0,
                    grade10: 7.8,
                    letterGrade: "B",
                    grade4: 3.5
                },
                {
                    code: "TIN3075",
                    name: "Lập trình ứng dụng di động",
                    credits: 4,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 8.3,
                    gradeExam: 8.0,
                    grade10: 8.1,
                    letterGrade: "A",
                    grade4: 4.0
                },
                {
                    code: "TIN3083",
                    name: "Đồ án công nghệ phần mềm",
                    credits: 4,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 8.1,
                    gradeExam: 8.0,
                    grade10: 8.0,
                    letterGrade: "A",
                    grade4: 4.0
                },
                {
                    code: "TIN3021",
                    name: "Phát triển phần mềm hướng dịch vụ",
                    credits: 4,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 7.5,
                    gradeExam: 7.0,
                    grade10: 7.2,
                    letterGrade: "B",
                    grade4: 3.0
                }
            ]
        },
        // Học kỳ 4
        {
            completedCredits: 109,
            totalCredits: 123,
            averageGrade: 2.92,
            totalGrade: 4.0,
            totalRegisteredCredits: 15,
            totalAccumulatedCredits: 15,
            academicYear: "2022 - 2023",
            semester: "2",
            semesterGPA: 4.0,
            subjects: [
                {
                    code: "LLCTTH3",
                    name: "Triết học Mác - Lênin",
                    credits: 3,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 8.5,
                    gradeExam: 8.5,
                    grade10: 8.5,
                    letterGrade: "A",
                    grade4: 4.0
                },
                {
                    code: "TIN3093",
                    name: "Phân tích và thiết kế các hệ thống thông tin - Nhóm 1",
                    credits: 3,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 8.5,
                    gradeExam: 8.5,
                    grade10: 8.5,
                    letterGrade: "A",
                    grade4: 4.0
                },
                {
                    code: "TIN3033",
                    name: "Công nghệ Web",
                    credits: 3,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 8.5,
                    gradeExam: 8.5,
                    grade10: 8.5,
                    letterGrade: "A",
                    grade4: 4.0
                },
                {
                    code: "TIN3001",
                    name: "Cơ sở dữ liệu nâng cao",
                    credits: 3,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 8.5,
                    gradeExam: 8.5,
                    grade10: 8.5,
                    letterGrade: "A",
                    grade4: 4.0
                },
                {
                    code: "ENG2013",
                    name: "Tiếng Anh chuyên ngành CNTT",
                    credits: 3,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 8.5,
                    gradeExam: 8.5,
                    grade10: 8.5,
                    letterGrade: "A",
                    grade4: 4.0
                },
                {
                    code: "TIN3093",
                    name: "Phân tích và thiết kế các hệ thống thông tin - Nhóm 1",
                    credits: 3,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 8.5,
                    gradeExam: 8.5,
                    grade10: 8.5,
                    letterGrade: "A",
                    grade4: 4.0
                },
                {
                    code: "TIN3093",
                    name: "Phân tích và thiết kế các hệ thống thông tin - Nhóm 1",
                    credits: 3,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 8.5,
                    gradeExam: 8.5,
                    grade10: 8.5,
                    letterGrade: "A",
                    grade4: 4.0
                }
            ]
        },
        // Học kỳ 5
        {
            completedCredits: 109,
            totalCredits: 123,
            averageGrade: 2.92,
            totalGrade: 4.0,
            totalRegisteredCredits: 15,
            totalAccumulatedCredits: 15,
            academicYear: "2023 - 2024",
            semester: "1",
            semesterGPA: 4.0,
            subjects: [
                {
                    code: "LLCTTH3",
                    name: "Triết học Mác - Lênin",
                    credits: 3,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 8.5,
                    gradeExam: 8.5,
                    grade10: 8.5,
                    letterGrade: "A",
                    grade4: 4.0
                },
                {
                    code: "TIN3093",
                    name: "Phân tích và thiết kế các hệ thống thông tin - Nhóm 1",
                    credits: 3,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 8.5,
                    gradeExam: 8.5,
                    grade10: 8.5,
                    letterGrade: "A",
                    grade4: 4.0
                },
                {
                    code: "TIN3033",
                    name: "Công nghệ Web",
                    credits: 3,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 8.5,
                    gradeExam: 8.5,
                    grade10: 8.5,
                    letterGrade: "A",
                    grade4: 4.0
                },
                {
                    code: "TIN3001",
                    name: "Cơ sở dữ liệu nâng cao",
                    credits: 3,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 8.5,
                    gradeExam: 8.5,
                    grade10: 8.5,
                    letterGrade: "A",
                    grade4: 4.0
                }
            ]
        },
        // Học kỳ 6
        {
            completedCredits: 109,
            totalCredits: 123,
            averageGrade: 2.92,
            totalGrade: 4.0,
            totalRegisteredCredits: 15,
            totalAccumulatedCredits: 15,
            academicYear: "2023 - 2024",
            semester: "2",
            semesterGPA: 4.0,
            subjects: [
                {
                    code: "LLCTTH3",
                    name: "Triết học Mác - Lênin",
                    credits: 3,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 8.5,
                    gradeExam: 8.5,
                    grade10: 8.5,
                    letterGrade: "A",
                    grade4: 4.0
                },
                {
                    code: "TIN3001",
                    name: "Cơ sở dữ liệu nâng cao",
                    credits: 3,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 8.5,
                    gradeExam: 8.5,
                    grade10: 8.5,
                    letterGrade: "A",
                    grade4: 4.0
                },
                {
                    code: "ENG2013",
                    name: "Tiếng Anh chuyên ngành CNTT",
                    credits: 3,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 8.5,
                    gradeExam: 8.5,
                    grade10: 8.5,
                    letterGrade: "A",
                    grade4: 4.0
                },
                {
                    code: "TIN3093",
                    name: "Phân tích và thiết kế các hệ thống thông tin - Nhóm 1",
                    credits: 3,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 8.5,
                    gradeExam: 8.5,
                    grade10: 8.5,
                    letterGrade: "A",
                    grade4: 4.0
                },
                {
                    code: "TIN3093",
                    name: "Phân tích và thiết kế các hệ thống thông tin - Nhóm 1",
                    credits: 3,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 8.5,
                    gradeExam: 8.5,
                    grade10: 8.5,
                    letterGrade: "A",
                    grade4: 4.0
                }
            ]
        },
        // Học kỳ 7
        {
            completedCredits: 109,
            totalCredits: 123,
            averageGrade: 2.92,
            totalGrade: 4.0,
            totalRegisteredCredits: 15,
            totalAccumulatedCredits: 15,
            academicYear: "2024 - 2025",
            semester: "1",
            semesterGPA: 4.0,
            subjects: [
                {
                    code: "LLCTTH3",
                    name: "Triết học Mác - Lênin",
                    credits: 3,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 8.5,
                    gradeExam: 8.5,
                    grade10: 8.5,
                    letterGrade: "A",
                    grade4: 4.0
                },
                {
                    code: "TIN3093",
                    name: "Phân tích và thiết kế các hệ thống thông tin - Nhóm 1",
                    credits: 3,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 8.5,
                    gradeExam: 8.5,
                    grade10: 8.5,
                    letterGrade: "A",
                    grade4: 4.0
                },
                {
                    code: "TIN3033",
                    name: "Công nghệ Web",
                    credits: 3,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 8.5,
                    gradeExam: 8.5,
                    grade10: 8.5,
                    letterGrade: "A",
                    grade4: 4.0
                },
                {
                    code: "TIN3001",
                    name: "Cơ sở dữ liệu nâng cao",
                    credits: 3,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 8.5,
                    gradeExam: 8.5,
                    grade10: 8.5,
                    letterGrade: "A",
                    grade4: 4.0
                },
                {
                    code: "ENG2013",
                    name: "Tiếng Anh chuyên ngành CNTT",
                    credits: 3,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 8.5,
                    gradeExam: 8.5,
                    grade10: 8.5,
                    letterGrade: "A",
                    grade4: 4.0
                },
                {
                    code: "TIN3093",
                    name: "Phân tích và thiết kế các hệ thống thông tin - Nhóm 1",
                    credits: 3,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 8.5,
                    gradeExam: 8.5,
                    grade10: 8.5,
                    letterGrade: "A",
                    grade4: 4.0
                },
                {
                    code: "TIN3093",
                    name: "Phân tích và thiết kế các hệ thống thông tin - Nhóm 1",
                    credits: 3,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 8.5,
                    gradeExam: 8.5,
                    grade10: 8.5,
                    letterGrade: "A",
                    grade4: 4.0
                }
            ]
        },
        // Học kỳ 8
        {
            completedCredits: 109,
            totalCredits: 123,
            averageGrade: 2.92,
            totalGrade: 4.0,
            totalRegisteredCredits: 14,
            totalAccumulatedCredits: 14,
            academicYear: "2024 - 2025",
            semester: "2",
            semesterGPA: 4.0,
            subjects: [
                {
                    code: "LLCTTH3",
                    name: "Thực tập tốt nghiệp - Nhóm 1",
                    credits: 4,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 10,
                    gradeExam: 10,
                    grade10: 10,
                    letterGrade: "A",
                    grade4: 4.0
                },
                {
                    code: "TIN3093",
                    name: "Khóa luận tốt nghiệp - Nhóm 8",
                    credits: 10,
                    studyTimes: 1,
                    examTimes: 1,
                    gradeQTHT: 10,
                    gradeExam: 10,
                    grade10: 10,
                    letterGrade: "A",
                    grade4: 4.0
                }
            ]
        }
    ];

    // State để lưu trữ trang hiện tại
    const [currentPage, setCurrentPage] = useState(0);
    
    // Lấy dữ liệu của học kỳ hiện tại cho các thống kê trên đầu trang
    const studentData = allSemesterData[currentPage];
    
    // Tính toán phần trăm hoàn thành
    const completionPercentage = Math.round((studentData.completedCredits / studentData.totalCredits) * 100);
    const gradePercentage = Math.round((studentData.averageGrade / studentData.totalGrade) * 100);
    
    // Tạo option học kỳ - năm cho nút select
    const semesterOptions = allSemesterData.map((data, index) => ({
        id: `${data.academicYear}-${data.semester}`,
        label: `Học Kỳ: ${data.semester} - Năm Học: ${data.academicYear}`,
        index: index
    }));

    // State to track the selected semester
    const [selectedSemesterId, setSelectedSemesterId] = useState(semesterOptions[0].id);
    
    // Find the selected semester data
    const selectedSemesterIndex = semesterOptions.find(option => option.id === selectedSemesterId)?.index || 0;
    const selectedSemesterData = allSemesterData[selectedSemesterIndex];

    // Handle semester selection change
    const handleSemesterChange = (e) => {
        setSelectedSemesterId(e.target.value);
    };
    
    return (
        <div className="academic-results-container announcements-section">
            <h1 className="main-title">Kết Quả Học Tập</h1>
            
            <div className="stats-container">
                <div className="stats-card">
                    <div className="stats-icon">
                        <div className="layers-icon">
                            <div className="layer"></div>
                            <div className="layer"></div>
                            <div className="layer"></div>
                        </div>
                    </div>
                    <div className="stats-info">
                        <div className="stats-label">Số Tín Chỉ Tích Lũy</div>
                        <div className="stats-value-container">
                            <div className="stats-value blue">{studentData.completedCredits}</div>
                            <svg className="circle-progress blue" viewBox="0 0 36 36">
                                <path className="circle-bg"
                                d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path className="circle"
                                strokeDasharray={`${completionPercentage}, 100`}
                                d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
                
                <div className="stats-card">
                    <div className="stats-icon">
                        <div className="check-icon">
                            <div className="checkmark"></div>
                        </div>
                    </div>
                    <div className="stats-info">
                        <div className="stats-label">Điểm Trung Bình Tích Lũy</div>
                        <div className="stats-value-container">
                            <div className="stats-value orange">{studentData.averageGrade}</div>
                            <svg className="circle-progress orange" viewBox="0 0 36 36">
                                <path className="circle-bg"
                                d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path className="circle"
                                strokeDasharray={`${gradePercentage}, 100`}
                                d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                            </svg>
                            
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="table-container">
                <table className="results-table">
                    <thead>
                        <tr>
                            <th rowSpan="2" className='w-50'>
                                <span>Mã</span> <br/>
                                <span>học phần</span>
                            </th>
                            <th rowSpan="2" className='w-17'>Tên học phần</th>
                            <th rowSpan="2" className='w-50'>
                                <span>Số</span> <br/>
                                <span>TC</span>
                            </th>
                            <th rowSpan="2" className='w-50'>Lần Học</th>
                            <th rowSpan="2" className='w-50'>Lần Thi</th>
                            <th rowSpan="2" className='w-50'>Điểm QTHT</th>
                            <th rowSpan="2" className='w-50'>Điểm Thi</th>
                            <th colSpan="3">Điểm Đánh Giá Học Phần</th>
                        </tr>
                        <tr>
                            <th className='w-70'>Hệ 10</th>
                            <th className='w-70'>Đ.Chữ</th>
                            <th className='w-70'>Hệ 4</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="semester-row">
                            <td colSpan="3">
                                <div>
                                    <select 
                                    id="semester-select" 
                                    value={selectedSemesterId}
                                    onChange={handleSemesterChange}
                                    >
                                    {semesterOptions.map(option => (
                                        <option key={option.id} value={option.id}>
                                        {option.label}
                                        </option>
                                    ))}
                                    </select>
                                </div>
                            </td>
                            <td colSpan="7">
                                <div className="semester-stats d-flex justify-content-around">
                                    <div>
                                        <span className='fw-nor'>Tổng số TC đăng ký: <span className='fw-600'>{selectedSemesterData.totalRegisteredCredits}</span></span> <br/>
                                        <span className='fw-nor'>Tổng số TC tích lũy: <span className='fw-600'>{selectedSemesterData.totalAccumulatedCredits}</span></span>
                                    </div>
                                    <div className="semester-gpa">
                                        <span className='fw-nor'>Điểm TB học kỳ hệ 4: <span className='fw-600'>{selectedSemesterData.semesterGPA.toFixed(2)}</span></span> <br/>
                                        <span className='fw-nor'>Điểm TB học kỳ hệ 10: <span className='fw-600'>{selectedSemesterData.semesterGPA.toFixed(2)}</span></span>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        {selectedSemesterData.subjects.map((subject, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="border p-2">{subject.code}</td>
                                <td className="border p-2">{subject.name}</td>
                                <td className="border p-2 text-center">{subject.credits}</td>
                                <td className="border p-2 text-center">{subject.studyTimes}</td>
                                <td className="border p-2 text-center">{subject.examTimes}</td>
                                <td className="border p-2 text-center">{subject.gradeQTHT}</td>
                                <td className="border p-2 text-center">{subject.gradeExam}</td>
                                <td className="border p-2 text-center">{subject.grade10}</td>
                                <td className="border p-2 text-center">{subject.letterGrade}</td>
                                <td className="border p-2 text-center">{subject.grade4}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AcademicResults;