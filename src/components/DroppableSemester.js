import React from "react";
import { useDroppable } from "@dnd-kit/core";

const DroppableSemester = ({ semesterIndex, semesterName, subjects, onRemoveSubject }) => {
  const { setNodeRef, isOver } = useDroppable({ id: `semester-${semesterIndex}` });

  // Tính tổng số tín chỉ đã đăng ký
  const totalCreditsSemester = subjects.reduce((sum, subject) => sum + subject.credits, 0);

  return (
    <React.Fragment>
      <tr ref={setNodeRef} className={`semester-header ${isOver ? "highlight" : ""}`}>
        <td colSpan="2">{semesterName}</td>
        <td colSpan="2">Tổng số TC đã đăng ký: {totalCreditsSemester}</td>
      </tr>
      {subjects.length > 0 ? (
        subjects.map((subject) => (
          <tr key={subject.id} className="dropped-item" onClick={() => onRemoveSubject?.(subject.id)}>
            <td>{subject.id}</td>
            <td className="text-left">{subject.name}</td>
            <td>{subject.credits}</td>
            <td className={`${subject.type === "Bắt buộc" ? "red" : "green"}`}>{subject.type}</td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="4" className="empty-message">Kéo học phần vào đây</td>
        </tr>
      )}
    </React.Fragment>
  );
};

export default DroppableSemester;
