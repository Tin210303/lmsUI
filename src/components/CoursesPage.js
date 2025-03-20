import React, { useState } from 'react';
import '../assets/css/coursespage.css';
import logo from '../logo.svg'

// Sample course data
const coursesData = [
  {
    semester: '[2023-2024.1] Thiết kế cơ sở dữ liệu',
    instructor: 'Bình Nguyễn Đăng',
    group: 'Nhóm 1',
    avatar: '/api/placeholder/50/50'
  },
  {
    semester: '[2023-2024.1] Đồ hoạ máy tính',
    instructor: 'Ngô Tấn',
    group: 'Nhóm 3',
    avatar: '/api/placeholder/50/50'
  },
  {
    semester: '[2023-2024.1] Hệ quản trị cơ sở dữ liệu',
    instructor: 'Bình Nguyễn Đăng',
    group: 'Nhóm 1',
    avatar: '/api/placeholder/50/50'
  },
  {
    semester: '[2023-2024.1] Java cơ bản',
    instructor: 'Ngô Tấn',
    group: 'Nhóm 3',
    avatar: '/api/placeholder/50/50'
  },
  {
    semester: '[2023-2024.1] Java nâng cao',
    instructor: 'Ngô Tấn',
    group: 'Nhóm 3',
    avatar: '/api/placeholder/50/50'
  },
  {
    semester: '[2023-2024.1] Phân tích và thiết kế hệ thống thông tin',
    instructor: 'Ngô Tấn',
    group: 'Nhóm 3',
    avatar: '/api/placeholder/50/50'
  },
  {
    semester: '[2023-2024.1] Kỹ nghệ phần mềm',
    instructor: 'Ngô Tấn',
    group: 'Nhóm 3',
    avatar: '/api/placeholder/50/50'
  },
  {
    semester: '[2023-2024.1] Lập trình nâng cao',
    instructor: 'Ngô Tấn',
    group: 'Nhóm 3',
    avatar: '/api/placeholder/50/50'
  },
  {
    semester: '[2023-2024.1] Lập trình hướng đối tượng',
    instructor: 'Ngô Tấn',
    group: 'Nhóm 3',
    avatar: '/api/placeholder/50/50'
  },
  {
    semester: '[2023-2024.1] Cấu trúc dữ liệu và thuật toán',
    instructor: 'Ngô Tấn',
    group: 'Nhóm 3',
    avatar: '/api/placeholder/50/50'
  },
  {
    semester: '[2023-2024.1] Web ngữ nghĩa',
    instructor: 'Ngô Tấn',
    group: 'Nhóm 3',
    avatar: '/api/placeholder/50/50'
  },
  {
    semester: '[2023-2024.1] Kiểm định phần mềm',
    instructor: 'Ngô Tấn',
    group: 'Nhóm 3',
    avatar: '/api/placeholder/50/50'
  },
  {
    semester: '[2023-2024.1] Đồ hoạ máy tính',
    instructor: 'Ngô Tấn',
    group: 'Nhóm 3',
    avatar: '/api/placeholder/50/50'
  },
  {
    semester: '[2023-2024.1] Đồ hoạ máy tính',
    instructor: 'Ngô Tấn',
    group: 'Nhóm 3',
    avatar: '/api/placeholder/50/50'
  },
]

// Sample announcements data
const announcements = [
  {
    id: 1,
    author: 'Tin Nguyễn',
    time: '09:12',
    content: 'Tin đẹp trai vãi chưởng',
    avatar: '/api/placeholder/40/40'
  },
  {
    id: 2,
    author: 'Tin Nguyễn',
    time: '09:12',
    content: 'Tin đẹp trai vãi chưởng Tin đẹp trai vãi chưởng Tin đẹp trai vãi chưởng Tin đẹp trai vãi chưởng Tin đẹp trai vãi chưởng Tin đẹp trai vãi chưởng Tin đẹp trai vãi chưởng Tin đẹp trai vãi chưởngTin đẹp trai vãi chưởng Tin đẹp trai vãi chưởng',
    avatar: '/api/placeholder/40/40'
  }
];

function CoursesPage() {
  const [activeTab, setActiveTab] = useState('wall');
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(8);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCoursesList, setShowCoursesList] = useState(true);
  const [comment, setComment] = useState('');

  // Calculate current courses
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = coursesData.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(coursesData.length / coursesPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const firstPage = () => setCurrentPage(1);
  const lastPage = () => setCurrentPage(totalPages);

  // Function to truncate text if it's longer than a certain length
  const truncateText = (text, maxLength = 15) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  // Handle course click
  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setShowCoursesList(false);
  }

  // Back to courses list
  const backToCousesList = () => {
    setSelectedCourse(null);
    setShowCoursesList(true);
  }

  // Handle change tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  }

  // Handle comment change
  const handleCommentChange = (e) => {
    setComment(e.target.value);
  }

  // Handle comment submit
  const handleCommentSubmit = (e) => {
    if (e.key === 'Enter') {
      // Here you would usually send the comment to a server
      setComment('');
    }
  }

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch(activeTab) {
      case 'wall':
        return (
          <div className="wall-content">
            <div className="class-info">
              <div className="class-code">
                <div className="label">Mã Lớp</div>
                <div className="value">Tin221436</div>
              </div>
              <div className="upcoming-deadline">
                <div className="label">Sắp đến hạn</div>
                <div className="value">Không có bài tập nào sắp đến hạn</div>
                <a href="#" className="view-all" onClick={() => handleTabChange('tasks')}>Xem tất cả</a>
              </div>
            </div>
            
            <div className="class-announcement">
              <div className="announcement_header">
                <img src={logo} alt="Avatar" className="author-avatar" />
                <input type="text" className='announcement_header-input' placeholder='Thông báo nội dung cho lớp học phần'/>
              </div>
              
              {announcements.map((announcement) => (
                <div key={announcement.id} className="announcement_item">
                  <div className="announcement-author">
                    <img src={logo} alt="Avatar" className="author-avatar" />
                    <div className="author-info">
                      <div className="author-name">{announcement.author}</div>
                      <div className="announcement-time">{announcement.time}</div>
                    </div>
                    <button className="more-options">⋮</button>
                  </div>
                  <div className="announcement_content">
                    {announcement.content}
                  </div>
                  <div className="comment-section">
                    <img src={logo} alt="Avatar" className="comment-avatar" />
                    <input
                      type="text"
                      className="comment-input"
                      placeholder="Thêm nhận xét trong lớp học..."
                      value={comment}
                      onChange={handleCommentChange}
                      onKeyPress={handleCommentSubmit}
                    />
                    <button className="send-button">›</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'tasks':
        return <div className="tasks-content">Nội dung Bài Tập Trên Lớp</div>;
      case 'people':
        return <div className="people-content">Nội dung Mọi Người</div>;
      case 'marks':
        return <div className="marks-content">Nội dung Điểm</div>;
      default:
        return null;
    }
  };

  return (
    <div className='content-container'>
      {showCoursesList ? (
        <div className="announcements-section">
          <h1 className="courses-title">LỚP HỌC</h1>
          
          <div className="courses-grid">
            {currentCourses.map((course, index) => (
              <div key={index} className="course-card" onClick={() => handleCourseClick(course)}>
                <div className="course-details">
                <p className="course-semester">{truncateText(course.semester, 35)}</p>
                  <p className="course-group">{course.group}</p>
                  <p className="course-instructor">{course.instructor}</p>
                </div>
                <div className="course-avatar">
                  <img src={logo} alt="A" />
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          <div className="pagination">
            <button onClick={firstPage} className="pagination-item double-arrow">&lt;&lt;</button>
            <button onClick={prevPage} className="pagination-item">&lt;</button>
            
            {[...Array(totalPages)].map((_, index) => {
              // Show limited page numbers with ellipsis
              if (
                index + 1 === 1 || 
                index + 1 === totalPages || 
                (index + 1 >= currentPage - 1 && index + 1 <= currentPage + 1)
              ) {
                return (
                  <button
                    key={index}
                    onClick={() => paginate(index + 1)}
                    className={`pagination-item ${currentPage === index + 1 ? 'active' : ''}`}
                  >
                    {index + 1}
                  </button>
                );
              } else if (
                (index + 1 === currentPage - 2 && currentPage > 3) ||
                (index + 1 === currentPage + 2 && currentPage < totalPages - 2)
              ) {
                return <span key={index} className="pagination-ellipsis">...</span>;
              } else {
                return null;
              }
            })}
            
            <button onClick={nextPage} className="pagination-item">&gt;</button>
            <button onClick={lastPage} className="pagination-item double-arrow">&gt;&gt;</button>
          </div>
        </div>

      ) : (
        <div className='course-detail-section'> 
          <div className='course-header'> 
            <div className='back-nav'> 
              <button onClick={backToCousesList} className="back_button">Lớp Học</button>  &gt; <span>{selectedCourse.semester}</span>
            </div>
          </div>
          <div className='course-tabs'> 
            <button
             className={activeTab === 'wall' ? 'tab-active' : ''}
             onClick={() => handleTabChange('wall')}
            >
              Bảng Tin
            </button>
            <button
             className={activeTab === 'tasks' ? 'tab-active' : ''}
             onClick={() => handleTabChange('tasks')}
            >
              Bài Tập Trên Lớp
            </button>
            <button
             className={activeTab === 'people' ? 'tab-active' : ''}
             onClick={() => handleTabChange('people')}
            >
              Mọi Người
            </button>
            <button
             className={activeTab === 'marks' ? 'tab-active' : ''}
             onClick={() => handleTabChange('marks')}
            >
              Điểm
            </button>
          </div>
          
          <div className="course-content">
            {renderTabContent()}
          </div>
        </div>
      )}
    </div>
  );
}

export default CoursesPage;