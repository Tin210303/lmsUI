import React, { useState } from 'react';
import '../assets/css/Calendar.css';

const Calendar = () => {
  // Current date information
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Current week data (similar to the image)
  const [selectedDay, setSelectedDay] = useState(20); // Highlighted day in blue
  const weekDays = [17, 18, 19, 20, 21, 22, 23];
  
  // Month names in Vietnamese
  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];
  
  // Day names in Vietnamese
  const dayNames = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];
  
  // Schedule data
  const scheduleData = [
    {
      time: "Buổi Sáng",
      classes: [
        { day: 17, name: "Đồ họa máy tính", time: "1 - 4", room: "[E502]" },
        { day: 18, name: "Đồ họa máy tính", time: "1 - 2", room: "[E502]" },
        { day: 19, name: "Java cơ bản", time: "3 - 4", room: "[E301]" },
        { day: 20, name: "", time: "", room: "" },
        { day: 21, name: "", time: "", room: "" },
        { day: 22, name: "", time: "", room: "" },
        { day: 23, name: "", time: "", room: "" },
      ]
    },
    {
      time: "Buổi Chiều",
      classes: [
        { day: 17, name: "", time: "", room: "" },
        { day: 18, name: "Lập trình hướng đối tượng", time: "6 - 8", room: "[H402]" },
        { day: 19, name: "", time: "", room: "" },
        { day: 20, name: "Phân tích thiết kế hệ thống thông tin", time: "5 - 8", room: "[B202]" },
        { day: 21, name: "", time: "", room: "" },
        { day: 22, name: "", time: "", room: "" },
        { day: 23, name: "", time: "", room: "" },
      ]
    },
    {
      time: "Buổi Tối",
      classes: [
        { day: 17, name: "", time: "", room: "" },
        { day: 18, name: "", time: "", room: "" },
        { day: 19, name: "", time: "", room: "" },
        { day: 20, name: "", time: "", room: "" },
        { day: 21, name: "Kinh tế chính trị Mác - Lenin", time: "9 - 11", room: "[E402]" },
        { day: 22, name: "", time: "", room: "" },
        { day: 23, name: "", time: "", room: "" },
      ]
    }
  ];

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h1>Lịch Học</h1>
        <div className="calendar_navigation">
          <p>{`${monthNames[currentMonth]} Năm ${currentYear}`}</p>
          <div className="dropdown-container">
            <button className="dropdown-button">
              Lịch học tập tuần hiện tại
              <span className="dropdown-arrow">›</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="calendar-grid">
        {/* Days of the week header */}
        <div className="calendar-row days-header">
          <div className="time-column"></div>
          {dayNames.map((day, index) => (
            <div key={`day-${index}`} className="day-column day-header">
              <div>{day}</div>
              <div className={weekDays[index] === selectedDay ? "day-number selected" : "day-number"}>
                {weekDays[index]}
              </div>
            </div>
          ))}
        </div>
        
        {/* Calendar body with schedule */}
        {scheduleData.map((timeSlot, timeIndex) => (
          <div key={`time-${timeIndex}`} className="calendar-row">
            <div className="time-column">{timeSlot.time}</div>
            {timeSlot.classes.map((classItem, dayIndex) => (
              <div key={`class-${timeIndex}-${dayIndex}`} className="day-column class-cell">
                {classItem.name && (
                  <div className="class-content">
                    <div className="class_name">{classItem.name}</div>
                    <div className="class-details">
                      {classItem.time && <div>{classItem.time} {classItem.room}</div>}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;