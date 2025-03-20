import React, { useState, useEffect } from 'react';
import '../assets/css/studentportal.css';

// Sample announcement data (same as in the original code)
const announcementData = [
  {
    id: 1,
    title: "Thông báo về việc cập nhật Lý lịch cá nhân của sinh viên",
    date: "06/02/2025 14:31",
    content: "Nhằm thực hiện tốt công tác hỗ trợ, quản lý người học tại Nhà trường, yêu cầu tất cả sinh viên phải khai báo đầy đủ, chính xác các thông tin cá nhân. Trường hợp sinh viên chưa khai báo đầy đủ sẽ không thể thực hiện các thao tác nghiệp vụ online liên quan đến học tập tại trường."
  },
  {
    id: 2,
    title: "Thông báo về việc cập nhật Lý lịch cá nhân của sinh viên",
    date: "06/02/2025 14:31",
    content: "Nhằm thực hiện tốt công tác hỗ trợ, quản lý người học tại Nhà trường, yêu cầu tất cả sinh viên phải khai báo đầy đủ, chính xác các thông tin cá nhân. Trường hợp sinh viên chưa khai báo đầy đủ sẽ không thể thực hiện các thao tác nghiệp vụ online liên quan đến học tập tại trường."
  },
  {
    id: 3,
    title: "Thông báo về việc cập nhật Lý lịch cá nhân của sinh viên",
    date: "06/02/2025 14:31",
    content: "Nhằm thực hiện tốt công tác hỗ trợ, quản lý người học tại Nhà trường, yêu cầu tất cả sinh viên phải khai báo đầy đủ, chính xác các thông tin cá nhân. Trường hợp sinh viên chưa khai báo đầy đủ sẽ không thể thực hiện các thao tác nghiệp vụ online liên quan đến học tập tại trường."
  },
  {
    id: 4,
    title: "Thông báo về việc cập nhật Lý lịch cá nhân của sinh viên",
    date: "06/02/2025 14:31",
    content: "Nhằm thực hiện tốt công tác hỗ trợ, quản lý người học tại Nhà trường, yêu cầu tất cả sinh viên phải khai báo đầy đủ, chính xác các thông tin cá nhân. Trường hợp sinh viên chưa khai báo đầy đủ sẽ không thể thực hiện các thao tác nghiệp vụ online liên quan đến học tập tại trường."
  },
  {
    id: 5,
    title: "Thông báo về việc cập nhật Lý lịch cá nhân của sinh viên",
    date: "06/02/2025 14:31",
    content: "Nhằm thực hiện tốt công tác hỗ trợ, quản lý người học tại Nhà trường, yêu cầu tất cả sinh viên phải khai báo đầy đủ, chính xác các thông tin cá nhân. Trường hợp sinh viên chưa khai báo đầy đủ sẽ không thể thực hiện các thao tác nghiệp vụ online liên quan đến học tập tại trường."
  },
  {
    id: 6,
    title: "Thông báo về việc cập nhật Lý lịch cá nhân của sinh viên",
    date: "06/02/2025 14:31",
    content: "Nhằm thực hiện tốt công tác hỗ trợ, quản lý người học tại Nhà trường, yêu cầu tất cả sinh viên phải khai báo đầy đủ, chính xác các thông tin cá nhân. Trường hợp sinh viên chưa khai báo đầy đủ sẽ không thể thực hiện các thao tác nghiệp vụ online liên quan đến học tập tại trường."
  },
  {
    id: 7,
    title: "Thông báo về việc cập nhật Lý lịch cá nhân của sinh viên",
    date: "06/02/2025 14:31",
    content: "Nhằm thực hiện tốt công tác hỗ trợ, quản lý người học tại Nhà trường, yêu cầu tất cả sinh viên phải khai báo đầy đủ, chính xác các thông tin cá nhân. Trường hợp sinh viên chưa khai báo đầy đủ sẽ không thể thực hiện các thao tác nghiệp vụ online liên quan đến học tập tại trường."
  },
  {
    id: 8,
    title: "Thông báo về việc cập nhật Lý lịch cá nhân của sinh viên",
    date: "06/02/2025 14:31",
    content: "Nhằm thực hiện tốt công tác hỗ trợ, quản lý người học tại Nhà trường, yêu cầu tất cả sinh viên phải khai báo đầy đủ, chính xác các thông tin cá nhân. Trường hợp sinh viên chưa khai báo đầy đủ sẽ không thể thực hiện các thao tác nghiệp vụ online liên quan đến học tập tại trường."
  },
  {
    id: 9,
    title: "Thông báo về việc cập nhật Lý lịch cá nhân của sinh viên",
    date: "06/02/2025 14:31",
    content: "Nhằm thực hiện tốt công tác hỗ trợ, quản lý người học tại Nhà trường, yêu cầu tất cả sinh viên phải khai báo đầy đủ, chính xác các thông tin cá nhân. Trường hợp sinh viên chưa khai báo đầy đủ sẽ không thể thực hiện các thao tác nghiệp vụ online liên quan đến học tập tại trường."
  },
  {
    id: 10,
    title: "Thông báo về việc cập nhật Lý lịch cá nhân của sinh viên",
    date: "06/02/2025 14:31",
    content: "Nhằm thực hiện tốt công tác hỗ trợ, quản lý người học tại Nhà trường, yêu cầu tất cả sinh viên phải khai báo đầy đủ, chính xác các thông tin cá nhân. Trường hợp sinh viên chưa khai báo đầy đủ sẽ không thể thực hiện các thao tác nghiệp vụ online liên quan đến học tập tại trường."
  },
  {
    id: 11,
    title: "Thông báo về việc cập nhật Lý lịch cá nhân của sinh viên",
    date: "06/02/2025 14:31",
    content: "Nhằm thực hiện tốt công tác hỗ trợ, quản lý người học tại Nhà trường, yêu cầu tất cả sinh viên phải khai báo đầy đủ, chính xác các thông tin cá nhân. Trường hợp sinh viên chưa khai báo đầy đủ sẽ không thể thực hiện các thao tác nghiệp vụ online liên quan đến học tập tại trường."
  },
  {
    id: 12,
    title: "Thông báo về việc cập nhật Lý lịch cá nhân của sinh viên",
    date: "06/02/2025 14:31",
    content: "Nhằm thực hiện tốt công tác hỗ trợ, quản lý người học tại Nhà trường, yêu cầu tất cả sinh viên phải khai báo đầy đủ, chính xác các thông tin cá nhân. Trường hợp sinh viên chưa khai báo đầy đủ sẽ không thể thực hiện các thao tác nghiệp vụ online liên quan đến học tập tại trường."
  },
  {
    id: 13,
    title: "Thông báo về việc cập nhật Lý lịch cá nhân của sinh viên",
    date: "06/02/2025 14:31",
    content: "Nhằm thực hiện tốt công tác hỗ trợ, quản lý người học tại Nhà trường, yêu cầu tất cả sinh viên phải khai báo đầy đủ, chính xác các thông tin cá nhân. Trường hợp sinh viên chưa khai báo đầy đủ sẽ không thể thực hiện các thao tác nghiệp vụ online liên quan đến học tập tại trường."
  },
  {
    id: 14,
    title: "Thông báo về việc cập nhật Lý lịch cá nhân của sinh viên",
    date: "06/02/2025 14:31",
    content: "Nhằm thực hiện tốt công tác hỗ trợ, quản lý người học tại Nhà trường, yêu cầu tất cả sinh viên phải khai báo đầy đủ, chính xác các thông tin cá nhân. Trường hợp sinh viên chưa khai báo đầy đủ sẽ không thể thực hiện các thao tác nghiệp vụ online liên quan đến học tập tại trường."
  },
  {
    id: 15,
    title: "Thông báo về việc cập nhật Lý lịch cá nhân của sinh viên",
    date: "06/02/2025 14:31",
    content: "Nhằm thực hiện tốt công tác hỗ trợ, quản lý người học tại Nhà trường, yêu cầu tất cả sinh viên phải khai báo đầy đủ, chính xác các thông tin cá nhân. Trường hợp sinh viên chưa khai báo đầy đủ sẽ không thể thực hiện các thao tác nghiệp vụ online liên quan đến học tập tại trường."
  },
  {
    id: 16,
    title: "Thông báo về việc cập nhật Lý lịch cá nhân của sinh viên",
    date: "06/02/2025 14:31",
    content: "Nhằm thực hiện tốt công tác hỗ trợ, quản lý người học tại Nhà trường, yêu cầu tất cả sinh viên phải khai báo đầy đủ, chính xác các thông tin cá nhân. Trường hợp sinh viên chưa khai báo đầy đủ sẽ không thể thực hiện các thao tác nghiệp vụ online liên quan đến học tập tại trường."
  },
  {
    id: 17,
    title: "Thông báo về việc cập nhật Lý lịch cá nhân của sinh viên",
    date: "06/02/2025 14:31",
    content: "Nhằm thực hiện tốt công tác hỗ trợ, quản lý người học tại Nhà trường, yêu cầu tất cả sinh viên phải khai báo đầy đủ, chính xác các thông tin cá nhân. Trường hợp sinh viên chưa khai báo đầy đủ sẽ không thể thực hiện các thao tác nghiệp vụ online liên quan đến học tập tại trường."
  },
  {
    id: 18,
    title: "Thông báo về việc cập nhật Lý lịch cá nhân của sinh viên",
    date: "06/02/2025 14:31",
    content: "Nhằm thực hiện tốt công tác hỗ trợ, quản lý người học tại Nhà trường, yêu cầu tất cả sinh viên phải khai báo đầy đủ, chính xác các thông tin cá nhân. Trường hợp sinh viên chưa khai báo đầy đủ sẽ không thể thực hiện các thao tác nghiệp vụ online liên quan đến học tập tại trường."
  },
  {
    id: 19,
    title: "Thông báo về việc cập nhật Lý lịch cá nhân của sinh viên",
    date: "06/02/2025 14:31",
    content: "Nhằm thực hiện tốt công tác hỗ trợ, quản lý người học tại Nhà trường, yêu cầu tất cả sinh viên phải khai báo đầy đủ, chính xác các thông tin cá nhân. Trường hợp sinh viên chưa khai báo đầy đủ sẽ không thể thực hiện các thao tác nghiệp vụ online liên quan đến học tập tại trường."
  },
  {
    id: 20,
    title: "Thông báo về việc cập nhật Lý lịch cá nhân của sinh viên",
    date: "06/02/2025 14:31",
    content: "Nhằm thực hiện tốt công tác hỗ trợ, quản lý người học tại Nhà trường, yêu cầu tất cả sinh viên phải khai báo đầy đủ, chính xác các thông tin cá nhân. Trường hợp sinh viên chưa khai báo đầy đủ sẽ không thể thực hiện các thao tác nghiệp vụ online liên quan đến học tập tại trường."
  },
];

// Main component
const StudentPortal = () => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [announcementsPerPage] = useState(3);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showAnnouncementList, setShowAnnouncementList] = useState(true);
  
  // Calculate current announcements
  const indexOfLastAnnouncement = currentPage * announcementsPerPage;
  const indexOfFirstAnnouncement = indexOfLastAnnouncement - announcementsPerPage;
  const currentAnnouncements = announcementData.slice(indexOfFirstAnnouncement, indexOfLastAnnouncement);
  const totalPages = Math.ceil(announcementData.length / announcementsPerPage);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const firstPage = () => setCurrentPage(1);
  const lastPage = () => setCurrentPage(totalPages);
  
  // Handle announcement click
  const handleAnnouncementClick = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowAnnouncementList(false);
  };
  
  // Back to announcements list
  const backToHomePage = () => {
    setSelectedAnnouncement(null);
    setShowAnnouncementList(true);
  };
  
  return (
    <div className="content-container">
      {showAnnouncementList ? (
        /* Announcements List Section */
        <div className="announcements-section">
          <h2 className="section-title">THÔNG BÁO</h2>
          
          {/* Announcement Items */}
          {currentAnnouncements.map(announcement => (
            <div 
              key={announcement.id} 
              className="announcement-item"
              onClick={() => handleAnnouncementClick(announcement)}
              style={{ cursor: 'pointer' }}
            >
              <div className="announcement-header">
                <h3 className="announcement-title">{announcement.title}</h3>
                <p className="announcement-date">[{announcement.date}]</p>
              </div>
              <div className="announcement-content">
                <p>{announcement.content}</p>
              </div>
            </div>
          ))}
          
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
        /* Announcement Detail Section */
        <div className="announcement-detail-section">
          <div className="back-nav">
            <button onClick={backToHomePage} className="back-button">
              &larr;
            </button>
          </div>
          
          <div className="announcement-detail">
            <div className="announcement-detail-header">
              <h3 className="announcement-detail-title">{selectedAnnouncement.title}</h3>
              <p className="announcement-detail-date">[{selectedAnnouncement.date}]</p>
            </div>
            <div className="announcement-detail-content">
              <p>{selectedAnnouncement.content}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPortal;