//Bỏ Ngày, Sửa lại lịch thành sáng chiều tôi (tên, tiết, phòng), Bỏ Năm, THêm lịch toàn kỳ


// CalendarComponent.jsx
import React, { useState, useEffect } from 'react';
import '../assets/css/Calendar.css';

const CalendarComponent = () => {
  // State for current date and view
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('Week');
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const [selectedDate, setSelectedDate] = useState(currentDate.getDate());
  
  // Calculate week dates based on current date
  const getWeekDates = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day;
    
    return Array(7).fill().map((_, i) => {
      const newDate = new Date(date);
      newDate.setDate(diff + i);
      return newDate.getDate();
    });
  };
  
  // Format month and year
  const formatMonthYear = (date) => {
    const options = { month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  // Days of the week
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  
  // Dates for the week
  const [weekDates, setWeekDates] = useState(getWeekDates(currentDate));
  
  // Hours of the day
  const hours = Array.from({ length: 24 }, (_, i) => {
    if (i === 0) return '12 AM';
    if (i < 12) return `${i} AM`;
    if (i === 12) return '12 PM';
    return `${i - 12} PM`;
  });
  
  // Sample events - you would replace this with real data
  const events = [
    { day: currentDate.getDay(), startHour: 10, endHour: 11, title: 'Math Class' },
    { day: (currentDate.getDay() + 1) % 7, startHour: 14, endHour: 16, title: 'Physics Lab' },
    { day: (currentDate.getDay() + 2) % 7, startHour: 9, endHour: 10, title: 'Literature' }
  ];
  
  // Function to check if there's an event at a specific day and hour
  const hasEvent = (day, hourIndex) => {
    return events.some(event => 
      event.day === day && 
      hourIndex >= event.startHour && 
      hourIndex < event.endHour
    );
  };
  
  // Get event for a specific day and hour
  const getEvent = (day, hourIndex) => {
    return events.find(event => 
      event.day === day && 
      hourIndex >= event.startHour && 
      hourIndex < event.endHour
    );
  };

  // Navigate to today
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today.getDate());
    setWeekDates(getWeekDates(today));
  };

  // Navigate to previous period
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    
    if (currentView === 'Day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (currentView === 'Week') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (currentView === 'Month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (currentView === 'Year') {
      newDate.setFullYear(newDate.getFullYear() - 1);
    }
    
    setCurrentDate(newDate);
    setSelectedDate(newDate.getDate());
    setWeekDates(getWeekDates(newDate));
  };

  // Navigate to next period
  const goToNext = () => {
    const newDate = new Date(currentDate);
    
    if (currentView === 'Day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (currentView === 'Week') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (currentView === 'Month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (currentView === 'Year') {
      newDate.setFullYear(newDate.getFullYear() + 1);
    }
    
    setCurrentDate(newDate);
    setSelectedDate(newDate.getDate());
    setWeekDates(getWeekDates(newDate));
  };

  // Change view
  const changeView = (view) => {
    setCurrentView(view);
    setShowViewDropdown(false);
  };

  // Icons components
  const ChevronLeft = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  );

  const ChevronRight = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  );

  const ChevronDown = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );

  const SearchIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );

  const HelpCircleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  );

  const SettingsIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  );

  const CalendarIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  );

  const CheckCircleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );

  const MoreHorizontalIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1"></circle>
      <circle cx="19" cy="12" r="1"></circle>
      <circle cx="5" cy="12" r="1"></circle>
    </svg>
  );
  
  return (
    <div className="calendar-container announcements-section">
      <h1 className="calendar-title">Lịch Học</h1>
      
      <div className="calendar-header">
        <div className="calendar-nav">
          <button className="today-button" onClick={goToToday}>Today</button>
          <div className="nav-arrows">
            <button className="nav-button" onClick={goToPrevious}><ChevronLeft /></button>
            <button className="nav-button" onClick={goToNext}><ChevronRight /></button>
          </div>
          <span className="current-month">{formatMonthYear(currentDate)}</span>
        </div>
        
        <div className="calendar-actions">
          
          <div className="view-dropdown">
            <div 
              className="view-selector"
              onClick={() => setShowViewDropdown(!showViewDropdown)}
            >
              <span>{currentView}</span>
              <ChevronDown />
            </div>
            
            {showViewDropdown && (
              <div className="view-options">
                {['Day', 'Week', 'Month', 'Year'].map(view => (
                  <div 
                    key={view}
                    className="view-option"
                    onClick={() => changeView(view)}
                  >
                    {view}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {currentView === 'Week' && (
        <>
          <div className="week-header">
            <div className="timezone-column">
              GMT+07
            </div>
            
            <div className="days-row">
              {daysOfWeek.map((day, index) => {
                const isToday = weekDates[index] === new Date().getDate() && 
                               currentDate.getMonth() === new Date().getMonth() && 
                               currentDate.getFullYear() === new Date().getFullYear();
                
                return (
                  <div key={day} className="day-cell">
                    <div className="day-name">{day}</div>
                    <div className={`day-number ${isToday ? 'today' : ''}`}>
                      {weekDates[index]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="calendar-body">
            <div className="time-column">
              {hours.map((hour) => (
                <div key={hour} className="time-cell">
                  {hour}
                </div>
              ))}
            </div>
            
            <div className="days-grid">
              {Array(7).fill().map((_, dayIndex) => (
                <div key={dayIndex} className="day-column">
                  {Array(24).fill().map((_, hourIndex) => {
                    const event = getEvent(dayIndex, hourIndex);
                    const isFirstHourOfEvent = event && event.startHour === hourIndex;
                    
                    return (
                      <div key={hourIndex} className="hour-cell">
                        {hasEvent(dayIndex, hourIndex) && (
                          <div className={`event-block ${isFirstHourOfEvent ? 'event-start' : ''} 
                                         ${hourIndex === event.endHour - 1 ? 'event-end' : ''}`}>
                            {isFirstHourOfEvent && (
                              <div className="event-title">
                                {event.title}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      
      {currentView === 'Day' && (
        <div className="day-view">
          <div className="day-header">
            <div className="current-day">
              {new Date(currentDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
          </div>
          
          <div className="day-body">
            <div className="time-column">
              {hours.map((hour) => (
                <div key={hour} className="time-cell">
                  {hour}
                </div>
              ))}
            </div>
            
            <div className="day-events">
              {Array(24).fill().map((_, hourIndex) => {
                const event = getEvent(currentDate.getDay(), hourIndex);
                const isFirstHourOfEvent = event && event.startHour === hourIndex;
                
                return (
                  <div key={hourIndex} className="hour-cell">
                    {hasEvent(currentDate.getDay(), hourIndex) && (
                      <div className={`event-block ${isFirstHourOfEvent ? 'event-start' : ''} 
                                     ${hourIndex === event.endHour - 1 ? 'event-end' : ''}`}>
                        {isFirstHourOfEvent && (
                          <div className="event-title">
                            {event.title}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
      {currentView === 'Month' && (
        <div className="month-grid">
          {daysOfWeek.map(day => (
            <div key={day} className="month-day-name">
              {day}
            </div>
          ))}
          
          {Array(35).fill().map((_, i) => {
            const day = i - new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() + 1;
            const isCurrentMonth = day > 0 && day <= new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
            const isToday = day === new Date().getDate() && 
                           currentDate.getMonth() === new Date().getMonth() && 
                           currentDate.getFullYear() === new Date().getFullYear();
            
            return (
              <div 
                key={i} 
                className={`month-day ${isCurrentMonth ? '' : 'other-month'}`}
              >
                {isCurrentMonth && (
                  <div className={`month-day-number ${isToday ? 'today' : ''}`}>
                    {day}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {currentView === 'Year' && (
        <div className="year-grid">
          {Array(12).fill().map((_, i) => {
            const month = new Date(currentDate.getFullYear(), i, 1);
            const monthName = month.toLocaleDateString('en-US', { month: 'short' });
            const isCurrentMonth = i === new Date().getMonth() && 
                                  currentDate.getFullYear() === new Date().getFullYear();
            
            return (
              <div 
                key={i} 
                className={`month-card ${isCurrentMonth ? 'current-month-card' : ''}`}
              >
                <div className="month-name">{monthName}</div>
                <div className="mini-calendar">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, j) => (
                    <div key={j} className="mini-day-name">{d}</div>
                  ))}
                  
                  {Array(35).fill().map((_, j) => {
                    const day = j - new Date(currentDate.getFullYear(), i, 1).getDay() + 1;
                    const isMonthDay = day > 0 && day <= new Date(currentDate.getFullYear(), i + 1, 0).getDate();
                    const isToday = isMonthDay && day === new Date().getDate() && 
                                   i === new Date().getMonth() && 
                                   currentDate.getFullYear() === new Date().getFullYear();
                    
                    return (
                      <div 
                        key={j} 
                        className={`mini-day ${isMonthDay ? '' : 'mini-other-month'} ${isToday ? 'mini-today' : ''}`}
                      >
                        {isMonthDay ? day : ''}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CalendarComponent;