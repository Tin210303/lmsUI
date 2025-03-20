import React, { useState, useEffect } from 'react';
import '../assets/css/rightsidebar.css';

// Sample class schedule data (same as in the original code)
const scheduleData = [
  {
    id: 1,
    name: "Thiết kế cơ sở dữ liệu - TIN4012",
    room: "B202",
    startTime: "7:00",
    endTime: "11:00"
  },
  {
    id: 2,
    name: "Thiết kế cơ sở dữ liệu - TIN4012",
    room: "B202",
    startTime: "7:00",
    endTime: "11:00"
  },
  {
    id: 3,
    name: "Thiết kế cơ sở dữ liệu - TIN4012",
    room: "B202",
    startTime: "7:00",
    endTime: "11:00"
  },
];

const RightSideBar = () => {
    // Calendar state
    const [currentDate, setCurrentDate] = useState(new Date());
    const [calendarDays, setCalendarDays] = useState([]);

    
    // Generate calendar
    useEffect(() => {
        generateCalendarDays();
    }, [currentDate]);
    
    const generateCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // First day of the month
        const firstDay = new Date(year, month, 1);
        // Last day of the month
        const lastDay = new Date(year, month + 1, 0);
        
        // Day of the week for first day (0 = Sunday, 6 = Saturday)
        const startDayIndex = firstDay.getDay();
        
        // Total days in month
        const totalDays = lastDay.getDate();
        
        // Create array for calendar
        const days = [];
        
        // Add empty slots for days before first day of month
        for (let i = 0; i < startDayIndex; i++) {
            days.push(null);
        }
        
        // Add days of the month
        for (let i = 1; i <= totalDays; i++) {
            days.push(i);
        }
        
        setCalendarDays(days);
    };
    
    // Format month name
    const formatMonthYear = () => {
        const options = { month: 'long', year: 'numeric' };
        return currentDate.toLocaleDateString('vi-VN', options);
    };
    
    // Get current day
    const getCurrentDay = () => {
        const today = new Date();
        return today.getDate();
    };
    
    // Navigation buttons for calendar
    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };
    
    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    return (
        <div className="right-sidebar">
            {/* Student Info Card */}
            <div className="student-info-card">
            <div className="student-avatar">
                <img src="/api/placeholder/80/80" alt="Student Avatar" />
            </div>
            <div className="student-details">
                <p className="student-course">KHÓA K45 (2021 - 2025)</p>
                <p className="student-major">KỸ THUẬT PHẦN MỀM</p>
                <p className="student-year">HỌC KỲ: 2, NĂM HỌC 2024 - 2025</p>
                <p className="student-name">User Name</p>
            </div>
            </div>
        
            {/* Calendar */}
            <div className="calendar-widget">
            <div className="right-sidebar_calendar-header">
                <div className="calendar-navigation">
                <button onClick={prevMonth} className="calendar-nav-btn">&lt;</button>
                <p className="calendar-month">{formatMonthYear()}</p>
                <button onClick={nextMonth} className="calendar-nav-btn">&gt;</button>
                </div>
            </div>
            <table className="calendar-table">
                <thead>
                <tr>
                    <th>CN</th>
                    <th>T2</th>
                    <th>T3</th>
                    <th>T4</th>
                    <th>T5</th>
                    <th>T6</th>
                    <th>T7</th>
                </tr>
                </thead>
                <tbody>
                {/* Generate calendar grid */}
                {Array.from({ length: Math.ceil(calendarDays.length / 7) }).map((_, rowIndex) => (
                    <tr key={rowIndex}>
                    {Array.from({ length: 7 }).map((_, colIndex) => {
                        const dayIndex = rowIndex * 7 + colIndex;
                        const day = calendarDays[dayIndex];
                        const isCurrentDay = day === getCurrentDay() && 
                                            currentDate.getMonth() === new Date().getMonth() && 
                                            currentDate.getFullYear() === new Date().getFullYear();
                        
                        return (
                        <td 
                            key={colIndex} 
                            className={isCurrentDay ? 'current-day' : ''}
                        >
                            {day}
                        </td>
                        );
                    })}
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        
            {/* Today's Schedule */}
            <div className="today-schedule">
            <h3 className="schedule-title">LỊCH HỌC HÔM NAY</h3>
            
            {/* Class Schedule Items */}
            {scheduleData.map(schedule => (
                <div key={schedule.id} className="schedule-item">
                <div className="schedule-time">
                    <p>{schedule.startTime}</p>
                    <p>{schedule.endTime}</p>
                </div>
                <div className="schedule-class">
                    <p className="class-name">{schedule.name}</p>
                    <p className="class-room">{schedule.room}</p>
                </div>
                </div>
            ))}
            </div>
        </div> 
    )
}


export default RightSideBar