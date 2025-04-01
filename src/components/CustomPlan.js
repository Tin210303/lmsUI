import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import DroppableSemester from "./DroppableSemester";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { StudyPlanContext } from "../context/StudyPlanContext";
import '../assets/css/customplan.css'

const subjects = [
  {
    id: 1,
    knowledge: "Kiến thức giáo dục đại cương",
    total_credit: 30,
    credit_required: 30,
    courses: [
      { id: "LLCTTH3", name: "Triết học Mác - Lênin", credits: 3, type: "Bắt buộc", semester: 2 },
      { id: "MTR1022", name: "Giáo dục môi trường đại cương", credits: 2, type: "Bắt buộc", semester: 3 },
      { id: "TIN1039", name: "Kinh tế chính trị Mác - Lênin", credits: 3, type: "Tự chọn", semester: 4 },
      { id: "TIN2013", name: "Chủ nghĩa xã hội khoa học", credits: 3, type: "Bắt buộc", semester: 1 },
      { id: "TIN3032", name: "Pháp luật Việt Nam đại cương", credits: 2, type: "Bắt buộc", semester: 6 },
      { id: "TIN3033", name: "Lịch sử Đảng cộng sản Việt Nam", credits: 2, type: "Bắt buộc", semester: 7 },
    ]
  },
  {
    id: 2,
    knowledge: "Kiến thức cơ sở ngành",
    total_credit: 25,
    credit_required: 25,
    courses: [
      { id: "LLCTTH2", name: "Triết học Mác - Lênin", credits: 3, type: "Bắt buộc", semester: 2 },
      { id: "MTR1021", name: "Giáo dục môi trường đại cương", credits: 2, type: "Bắt buộc", semester: 3 },
      { id: "TIN1040", name: "Kinh tế chính trị Mác - Lênin", credits: 3, type: "Tự chọn", semester: 4 },
      { id: "TIN2014", name: "Chủ nghĩa xã hội khoa học", credits: 3, type: "Bắt buộc", semester: 1 },
      { id: "TIN3034", name: "Pháp luật Việt Nam đại cương", credits: 2, type: "Bắt buộc", semester: 6 },
      { id: "TIN3035", name: "Lịch sử Đảng cộng sản Việt Nam", credits: 2, type: "Bắt buộc", semester: 7 },
    ]
  },
  {
    id: 3,
    knowledge: "Kiến thức ngành",
    total_credit: 54,
    credit_required: 48,
    courses: [
      { id: "LLCTTH4", name: "Triết học Mác - Lênin", credits: 3, type: "Bắt buộc", semester: 2 },
      { id: "MTR1023", name: "Giáo dục môi trường đại cương", credits: 2, type: "Bắt buộc", semester: 3 },
      { id: "TIN1041", name: "Kinh tế chính trị Mác - Lênin", credits: 3, type: "Bắt buộc", semester: 4 },
      { id: "TIN2015", name: "Chủ nghĩa xã hội khoa học", credits: 3, type: "Bắt buộc", semester: 1 },
      { id: "TIN3036", name: "Pháp luật Việt Nam đại cương", credits: 2, type: "Bắt buộc", semester: 6 },
      { id: "TIN3037", name: "Phân tích và thiết kế hệ thống thông tin", credits: 2, type: "Bắt buộc", semester: 7 },
    ]
  },
  {
    id: 4,
    knowledge: "Thực tập, thực tế",
    total_credit: 4,
    credit_required: 4,
    courses: [
      { id: "TTTN2025", name: "Thực tập tốt nghiệp", credits: 2, type: "Bắt buộc", semester: 8 },
    ]
  },
  {
    id: 5,
    knowledge: "Khóa luận tốt nghiệp",
    total_credit: 10,
    credit_required: 10,
    courses: [
      { id: "KLTN2025", name: "Khóa luận tốt nghiệp", credits: 3, type: "Bắt buộc", semester: 8 },
    ]
  },
];
const semesters = [
  "Học Kỳ: 1 - Năm Học: 2021 - 2022",
  "Học Kỳ: 2 - Năm Học: 2021 - 2022",
  "Học Kỳ: 3 - Năm Học: 2021 - 2022",
  "Học Kỳ: 1 - Năm Học: 2022 - 2023",
  "Học Kỳ: 2 - Năm Học: 2022 - 2023",
  "Học Kỳ: 3 - Năm Học: 2022 - 2023",
  "Học Kỳ: 1 - Năm Học: 2023 - 2024",
  "Học Kỳ: 2 - Năm Học: 2023 - 2024",
  "Học Kỳ: 3 - Năm Học: 2023 - 2024",
  "Học Kỳ: 1 - Năm Học: 2024 - 2025",
  "Học Kỳ: 2 - Năm Học: 2024 - 2025",
];

const DraggableItem = ({ subject, isDropped }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: subject.id,
  });
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : "",
    background: isDropped ? "#d3d3d3" : "#f1f1f1", // Đổi màu nếu đã thả
    opacity: isDropped ? 0.5 : 1, // Làm mờ nếu đã thả
    cursor: isDropped ? "not-allowed" : "grab", // Thay đổi con trỏ
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="draggable"
    >
      {subject.name}
    </div>
  );
};

const DroppableArea = ({ subjects, onRemoveSubject }) => {
  const { setNodeRef, isOver } = useDroppable({ id: "drop-zone" });

  return (
    <div ref={setNodeRef} className="droppable">
      <table>
        <thead>
          <tr>
            <th style={{width: "76px"}}>Mã<br/>học phần</th>
            <th>Tên học phần</th>
            <th style={{width: "68px"}}>Số TC</th>
            <th style={{width: "114px"}}>Loại học phần</th>
          </tr>
        </thead>
        <tbody>
          {semesters.map((semester, index) => (
            <DroppableSemester
              key={index}
              semesterIndex={index + 1}
              semesterName={semester}
              subjects={subjects.filter((subject) => subject.semester === index + 1)}
              onRemoveSubject={onRemoveSubject}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};


export default function CustomPlan() {
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const { setStudyPlan } = useContext(StudyPlanContext);
  const navigate = useNavigate();

  const handleRemoveSubject = (id) => {
    setSelectedSubjects(selectedSubjects.filter(subject => subject.id !== id));
  };
  
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) return; // Nếu không có vùng đích, thoát
  
    const overId = over.id;
    
    // Kiểm tra nếu phần tử được thả vào học kỳ nào
    if (overId.startsWith("semester-")) {
      const semesterIndex = parseInt(overId.split("-")[1], 10); // Lấy số học kỳ từ ID
      
      let subject = null;
  
      // Tìm học phần theo ID
      subjects.forEach((group) => {
        const found = group.courses.find((course) => course.id === active.id);
        if (found) subject = found;
      });
  
      if (subject) {
        // Cập nhật học kỳ của học phần trước khi thêm vào danh sách
        subject = { ...subject, semester: semesterIndex };
  
        // Kiểm tra nếu chưa có học phần này trong danh sách đã chọn
        setSelectedSubjects((prev) =>
          prev.some((s) => s.id === subject.id) ? prev : [...prev, subject]
        );
      }
    }
  };

  // Tính tổng số tín chỉ đã đăng ký
  const totalCredits = selectedSubjects.reduce((sum, subject) => sum + subject.credits, 0);
  // Tính tổng số tín chỉ bắt buộc
  const requiredCredits = selectedSubjects
    .filter(subject => subject.type === "Bắt buộc")
    .reduce((sum, subject) => sum + subject.credits, 0);
  // Tính tổng số tín chỉ tự chọn
  const electiveCredits = selectedSubjects
    .filter(subject => subject.type === "Tự chọn")
    .reduce((sum, subject) => sum + subject.credits, 0);

  // const handleSavePlan = () => {
  //   // // Nhóm môn học theo học kỳ
  //   // const studyPlan = semesters.map((semester, index) => {
  //   //     const coursesInSemester = selectedSubjects.filter(subject => subject.semester === index + 1);

  //   //     if (coursesInSemester.length === 0) return null; // Bỏ qua học kỳ không có môn học

  //   //     return {
  //   //         semester,
  //   //         totalCredits: coursesInSemester.reduce((sum, subject) => sum + subject.credits, 0),
  //   //         courses: coursesInSemester.map(subject => ({
  //   //             code: subject.id,
  //   //             name: subject.name,
  //   //             credits: subject.credits,
  //   //             type: subject.type
  //   //         }))
  //   //     };
  //   // }).filter(Boolean); // Loại bỏ các phần tử null
  //   const studyPlan = {
  //     total_creadits: selectedSubjects.reduce((sum, subject) => sum + subject.credits, 0),
  //     required_credits: selectedSubjects
  //       .filter(subject => subject.type === "Bắt buộc")
  //       .reduce((sum, subject) => sum + subject.credits, 0),
  //     elective_credits: selectedSubjects
  //       .filter(subject => subject.type === "Tự chọn")
  //       .reduce((sum, subject) => sum + subject.credits, 0),
  //     process: semesters.map((semester, index) => {
  //       const semesterSubjects = selectedSubjects.filter(subject => subject.semester === index + 1);
  //       return {
  //         semester,
  //         totalCredits: semesterSubjects.reduce((sum, subject) => sum + subject.credits, 0),
  //         courses: semesterSubjects.map(subject => ({
  //           code: subject.id,
  //           name: subject.name,
  //           credits: subject.credits,
  //           type: subject.type,
  //         }))
  //       };
  //     }).filter(semester => semester.courses.length > 0) // Loại bỏ học kỳ trống
  //   };

  //   if (studyPlan.length === 0) {
  //     alert("Lộ trình trống")
  //   } else {
  //     setStudyPlan(studyPlan);
  //     alert("Lộ trình đã được lưu!");
  //     navigate(`/process`);
  //   }
  // };
  const handleSavePlan = () => {
    const processData = semesters.map((semester, index) => {
        const coursesInSemester = subjects
            .flatMap(group => group.courses)
            .filter(course => selectedSubjects.some(s => s.id === course.id && s.semester === index + 1));

        if (coursesInSemester.length === 0) return null;

        return {
            semester,
            totalCredits: coursesInSemester.reduce((sum, course) => sum + course.credits, 0),
            courses: coursesInSemester.map(course => ({
                code: course.id,
                name: course.name,
                credits: course.credits,
                type: course.type,
            })),
        };
    }).filter(Boolean); // Lọc bỏ học kỳ không có học phần nào

    const registeredCredits = selectedSubjects.reduce((sum, subject) => sum + subject.credits, 0);
    const requiredCredits = selectedSubjects
        .filter(subject => subject.type === "Bắt buộc")
        .reduce((sum, subject) => sum + subject.credits, 0);
    const electiveCredits = selectedSubjects
        .filter(subject => subject.type === "Tự chọn")
        .reduce((sum, subject) => sum + subject.credits, 0);

    const studyPlan = {
        registered_credits: registeredCredits,
        required_credits: requiredCredits,
        elective_credits: electiveCredits,
        process: processData,
    };
    alert("Lộ trình đã được lưu!");

    setStudyPlan(studyPlan);
    navigate(`/process`);
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="custom-container">
        <h2 className="text-center imy-20">XÂY DỰNG LỘ TRÌNH HỌC TẬP</h2>
        <div className="content">
          <div className="left-panel">
            <h4 className="text-center imy-20">Kéo và thả từng học phần bạn mong muốn để hoàn thiện lộ trình học tập của bạn</h4>
            <table>
              <thead>
                <tr>
                  <th style={{width: "76px"}}>Mã<br/>học phần</th>
                  <th>Tên học phần</th>
                  <th style={{width: "60px"}}>Số TC</th>
                  <th style={{width: "110px"}}>Loại học phần</th>
                  <th style={{width: "66px"}}>Học kỳ dự kiến</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject, index) => (
                  <React.Fragment key={index}>
                    <tr>
                      <td colSpan="5" style={{fontWeight: 600, textAlign: "left"}}>{subject.knowledge} (Số tín chỉ phải tích lũy: {subject.total_credit}, số tín chỉ bắt buộc: {subject.credit_required})</td>
                    </tr>
                    {subject.courses.map((course) => {
                      const isDropped = selectedSubjects.some((s) => s.id === course.id);
                      return (
                        <tr key={course.id}>
                          <td>{course.id}</td>
                          <td className="text-left"><DraggableItem subject={course} isDropped={isDropped} /></td>
                          <td>{course.credits}</td>
                          <td className={`${course.type === "Bắt buộc" ? "red" : "green"}`}>{course.type}</td>
                          <td>{course.semester}</td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <div className="right-panel">
            <div className="d-flex justify-content-between align-items-center">
              <div className="summary">
                  <p>Số tín chỉ tối thiểu phải tích lũy: <strong>123</strong></p>
                  <p>Số tín chỉ đã đăng ký: <strong>{totalCredits}</strong></p>
                  <p>Số tín chỉ bắt buộc: <strong>{requiredCredits}</strong></p>
                  <p>Số tín chỉ tự chọn: <strong>{electiveCredits}</strong></p>
              </div>
              <div className="button-group">
                  <button onClick={handleSavePlan} className="save-btn">Lưu lộ trình</button>
              </div>
            </div>
            <DroppableArea subjects={selectedSubjects} onRemoveSubject={handleRemoveSubject}/>
          </div>
        </div>
      </div>
    </DndContext>
  );
}
