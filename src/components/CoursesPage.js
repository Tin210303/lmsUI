// Search theo API

import React, { useState, useRef } from 'react';
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
    author: 'Tín Nguyễn',
    time: '09:12',
    content: 'Tin đẹp trai vãi chưởng',
    formattedContent: '<strong>A</strong>',
    avatar: '/api/placeholder/40/40'
  },
  {
    id: 2,
    author: 'Tín Nguyễn',
    time: '09:12',
    content: 'Tin đẹp trai vãi chưởng Tin đẹp trai vãi chưởng Tin đẹp trai vãi chưởng Tin đẹp trai vãi chưởng Tin đẹp trai vãi chưởng Tin đẹp trai vãi chưởng Tin đẹp trai vãi chưởng Tin đẹp trai vãi chưởngTin đẹp trai vãi chưởng Tin đẹp trai vãi chưởng',
    formattedContent: '<strong>A</strong>',
    avatar: '/api/placeholder/40/40'
  }
];

function CoursesPage() {
  const editorRef = useRef(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isActive, setisActive] = useState('wall');
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage, setCoursesPerPage] = useState(9);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isShowCoursesList, setIsShowCoursesList] = useState(true);
  const [comments, setComments] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    list: false
  });
  
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
  const truncateText = (text, maxLength = 30) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  // Handle course click
  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setIsShowCoursesList(false);
  }

  // Back to courses list
  const backToCousesList = () => {
    setSelectedCourse(null);
    setIsShowCoursesList(true);
  }

  // Handle change tabs
  const handleTabChange = (tab) => {
    setisActive(tab);
  }

  // Handle comment change
  const handleCommentChange = (e) => {
    setComments(e.target.value);
  }

  // Handle comment submit
  const handleCommentSubmit = (e) => {
    if (e.key === 'Enter') {
      // Here you would usually send the comment to a server
      setComments('');
    }
  }

  // Function to handle opening the editor
  const openEditor = () => {
    setIsEditorOpen(true);
    // Reset all active formats when opening the editor
    setActiveFormats({
      bold: false,
      italic: false,
      underline: false,
      list: false
    });
    
    // Focus on the editor after it renders
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.focus();
      }
    }, 0);
  };

  // Function to handle closing the editor
  const closeEditor = () => {
    setIsEditorOpen(false);
    setAnnouncementText('');
  };

  // Function to handle text changes in the contenteditable div
  const handleEditorChange = () => {
    if (editorRef.current) {
      setAnnouncementText(editorRef.current.innerHTML);
    }
  };

  // Function for handling formatting with toggle functionality
  const toggleFormatting = (command, format) => {
    document.execCommand(command, false, null);
    
    // Toggle the active state
    setActiveFormats({
      ...activeFormats,
      [format]: document.queryCommandState(command)
    });
    
    // Focus back on the editor
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  // Function to check the current formatting state
  const checkFormatting = () => {
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      list: document.queryCommandState('insertUnorderedList')
    });
  };

  // Function to handle announcement submission
  const submitAnnouncement = () => {
    if (announcementText.trim()) {
      // Create a new announcement
      const newAnnouncement = {
        id: Date.now(),
        author: 'Giáo viên',
        time: new Date().toLocaleString('vi-VN'),
        content: announcementText
      };
      
      // Add to announcements array
      announcements.push(newAnnouncement)
      
      closeEditor();
    }
  };

  // xử lý up ảnh
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Xử lý tệp đã chọn
      console.log('Tệp đã chọn:', file);
    }
  };
  

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch(isActive) {
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
                <a className="view-all" onClick={() => handleTabChange('tasks')}>Xem tất cả</a>
              </div>
            </div>
            
            <div className="class-announcement">
              <div className="announcement_header">
                {isEditorOpen ? (
                  // <div className="announcement-editor">
                  //   <div className="editor-recipient">Dành cho: Tất cả học viên</div>
                  //   <div
                  //     className={`editor ${isInputFocused ? 'active' : ''}`} 
                  //     onFocus={() => setIsInputFocused(true)}
                  //     onBlur={() => setIsInputFocused(editorRef.current.textContent !== '')}
                  //   >
                  //     <div 
                  //       ref={editorRef}
                  //       className={`editor-content`} 
                  //       contentEditable="true"
                  //       placeholder="Thông báo nội dung cho lớp học của bạn"
                  //       onInput={handleEditorChange}
                  //       onSelect={checkFormatting}
                  //       onMouseUp={checkFormatting}
                  //       onKeyUp={checkFormatting}
                  //     ></div>
                      
                  //     <div className="editor-toolbar">
                  //       <button 
                  //         className={`toolbar-button bold ${activeFormats.bold ? 'active' : ''}`}
                  //         title="In đậm"
                  //         onClick={() => toggleFormatting('bold', 'bold')}
                  //       >
                  //         B
                  //       </button>
                  //       <button 
                  //         className={`toolbar-button italic ${activeFormats.italic ? 'active' : ''}`}
                  //         title="In nghiêng"
                  //         onClick={() => toggleFormatting('italic', 'italic')}
                  //       >
                  //         I
                  //       </button>
                  //       <button 
                  //         className={`toolbar-button underline ${activeFormats.underline ? 'active' : ''}`}
                  //         title="Gạch chân"
                  //         onClick={() => toggleFormatting('underline', 'underline')}
                  //       >
                  //         U
                  //       </button>
                  //       <button 
                  //         className={`toolbar-button list ${activeFormats.list ? 'active' : ''}`}
                  //         title="Danh sách"
                  //         onClick={() => toggleFormatting('insertUnorderedList', 'list')}
                  //       >
                  //         ☰
                  //       </button>
                  //     </div>
                  //   </div>
                    
                  //   <div className="editor-actions">
                  //     <button className="cancel-button" onClick={closeEditor}>Hủy</button>
                  //     <button className="post-button" onClick={submitAnnouncement}>Đăng</button>
                  //   </div>
                  // </div>
                  <div className="announcement-editor">
                    <div className="editor-recipient">Dành cho: Tất cả học viên</div>
                    <div
                      className={`editor ${isInputFocused ? 'active' : ''}`} 
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => setIsInputFocused(editorRef.current.textContent !== '')}
                    >
                      <div 
                        ref={editorRef}
                        className="editor-content" 
                        contentEditable="true"
                        placeholder="Thông báo nội dung cho lớp học của bạn"
                        onInput={handleEditorChange}
                        onSelect={checkFormatting}
                        onMouseUp={checkFormatting}
                        onKeyUp={checkFormatting}
                      ></div>
                      
                      <div className="editor-toolbar">
                        <button 
                          className={`toolbar-button bold ${activeFormats.bold ? 'active' : ''}`}
                          title="In đậm"
                          onClick={() => toggleFormatting('bold', 'bold')}
                        >
                          B
                        </button>
                        <button 
                          className={`toolbar-button italic ${activeFormats.italic ? 'active' : ''}`}
                          title="In nghiêng"
                          onClick={() => toggleFormatting('italic', 'italic')}
                        >
                          I
                        </button>
                        <button 
                          className={`toolbar-button underline ${activeFormats.underline ? 'active' : ''}`}
                          title="Gạch chân"
                          onClick={() => toggleFormatting('underline', 'underline')}
                        >
                          U
                        </button>
                        <button 
                          className={`toolbar-button list ${activeFormats.list ? 'active' : ''}`}
                          title="Danh sách"
                          onClick={() => toggleFormatting('insertUnorderedList', 'list')}
                        >
                          ☰
                        </button>
                        {/* Nút tải tệp */}
                        <button
                          className="toolbar-button upload-file"
                          title="Tải lên tệp"
                          onClick={() => document.getElementById('file-input').click()}
                        >
                          📎
                        </button>
                        <input
                          id="file-input"
                          type="file"
                          style={{ display: 'none' }}
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>
                    
                    <div className="editor-actions">
                      <button className="cancel-button" onClick={closeEditor}>Hủy</button>
                      <button className="post-button" onClick={submitAnnouncement}>Đăng</button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className='d-flex open-editor'
                    onClick={openEditor}
                  > 
                    <img src={logo} alt="Avatar" className="author-avatar" />
                    <input 
                      type="text" 
                      className="announcement_header-input" 
                      placeholder="Thông báo nội dung cho lớp học phần"
                    />
                  </div>
                )}
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
                  <div className="announcement_content" dangerouslySetInnerHTML={{ __html: announcement.content }}>
                  </div>
                  <div className="comment-section">
                    <img src={logo} alt="Avatar" className="comment-avatar" />
                    <input
                      type="text"
                      className="comment-input"
                      placeholder="Thêm nhận xét trong lớp học..."
                      value={comments}
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
        return (
          <div className="tasks-content">
            <div className="tasks-list">
              <div className="task-item">
                <div className="task-icon">
                  <i className="fa-solid fa-clipboard task-icon-img"></i>
                </div>
                <div className="task-details">
                  <div className="task-title">Kiểm tra giữa kì</div>
                  <div className="task-deadline">Đến hạn 21 thg 3</div>
                </div>
                <div className="task-actions">
                  <button className="task-more-options">⋮</button>
                </div>
              </div>
      
              <div className="task-item">
                <div className="task-icon">
                  <i className="fa-solid fa-clipboard task-icon-img"></i>
                </div>
                <div className="task-details">
                  <div className="task-title">Kiểm tra 15p</div>
                  <div className="task-deadline">Không có ngày đến hạn</div>
                </div>
                <div className="task-actions">
                  <button className="task-more-options">⋮</button>
                </div>
              </div>
      
              <div className="task-item">
                <div className="task-icon">
                  <i className="fa-solid fa-clipboard task-icon-img"></i>
                </div>
                <div className="task-details">
                  <div className="task-title">Kiểm tra cuối kì</div>
                  <div className="task-deadline">Đến hạn 21 thg 5</div>
                </div>
                <div className="task-actions">
                  <button className="task-more-options">⋮</button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'people':
        return (
          <div className="people-content">
            <div className="people-section" style={{marginBottom: '12px'}}>
              <div className="section-header">
                <h3>Giáo Viên</h3>
                <button className="add-person-button">
                  <span>+</span>
                </button>
              </div>
              <div className="people-list teacher-list">
                <div className="teacher-item">
                  <div className="person-avatar">
                    <img src={logo} alt="Avatar" />
                  </div>
                  <div className="person-name">
                    Tín Nguyễn
                  </div>
                </div>
              </div>
            </div>
      
            <div className="people-section">
              <div className="section-header">
                <h3>Sinh Viên</h3>
                <button className="add-person-button">
                  <span>+</span>
                </button>
              </div>
              <div className="people-list-container">
                <div className="people-list student-list">
                  <div className="person-item">
                    <div className="person-avatar">
                      <img src={logo} alt="Avatar" />
                    </div>
                    <div className="person-name">
                      Tiến Lê Văn
                    </div>
                  </div>
                  <div className="person-item">
                    <div className="person-avatar">
                      <img src={logo} alt="Avatar" />
                    </div>
                    <div className="person-name">
                      Tân Ngô
                    </div>
                  </div>
                  <div className="person-item">
                    <div className="person-avatar">
                      <img src={logo} alt="Avatar" />
                    </div>
                    <div className="person-name">
                      Tiến Nguyễn Đình
                    </div>
                  </div>
                  <div className="person-item">
                    <div className="person-avatar">
                      <img src={logo} alt="Avatar" />
                    </div>
                    <div className="person-name">
                      Thành Nguyễn Hoàng Quang Minh
                    </div>
                  </div>
                  <div className="person-item">
                    <div className="person-avatar">
                      <img src={logo} alt="Avatar" />
                    </div>
                    <div className="person-name">
                      Quang Trần Đại
                    </div>
                  </div>
                  {/* Additional students to demonstrate scrolling */}
                  <div className="person-item">
                    <div className="person-avatar">
                      <img src={logo} alt="Avatar" />
                    </div>
                    <div className="person-name">
                      Huy Phan Quốc
                    </div>
                  </div>
                  <div className="person-item">
                    <div className="person-avatar">
                      <img src={logo} alt="Avatar" />
                    </div>
                    <div className="person-name">
                      Nhật Võ Minh
                    </div>
                  </div>
                  <div className="person-item">
                    <div className="person-avatar">
                      <img src={logo} alt="Avatar" />
                    </div>
                    <div className="person-name">
                      Dũng Trần Văn
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'marks':
        return <div className="marks-content">Nội dung Điểm</div>;
      default:
        return null;
    }
  };

  return (
    <div className='content-container'>
      {isShowCoursesList ? (
        <div className="announcements-section">
          <h1 className="courses-title">LỚP HỌC</h1>
          
          <div className="courses-grid">
            {currentCourses.map((course, index) => (
              <div key={index} className="course-card" onClick={() => handleCourseClick(course)}>
                <div className="course-details">
                <p className="course-semester">{truncateText(course.semester, 25)}</p>
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
              <button onClick={backToCousesList} className="back_button">Lớp Học</button>  
              &gt; 
              <span style={{ marginLeft: '16px' , color: '#000'}}>{selectedCourse.semester}</span>
            </div>
          </div>
          <div className='course-tabs'> 
            <button
             className={isActive === 'wall' ? 'tab-active' : ''}
             onClick={() => handleTabChange('wall')}
            >
              Bảng Tin
            </button>
            <button
             className={isActive === 'tasks' ? 'tab-active' : ''}
             onClick={() => handleTabChange('tasks')}
            >
              Bài Tập Trên Lớp
            </button>
            <button
             className={isActive === 'people' ? 'tab-active' : ''}
             onClick={() => handleTabChange('people')}
            >
              Mọi Người
            </button>
            <button
             className={isActive === 'marks' ? 'tab-active' : ''}
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