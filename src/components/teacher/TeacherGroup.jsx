import React, { useState, useEffect, useRef } from 'react';
import { FiMoreHorizontal } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, X, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import '../../assets/css/group-page.css';
import { API_BASE_URL, GET_TEACHER_GROUPS, UPDATE_GROUP_API, ADD_GROUP_API } from '../../services/apiService';

// Add Group Modal Component
const AddGroupModal = ({ isOpen, onClose, onSubmit }) => {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    // Đợi animation hoàn thành trước khi đóng modal
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300); // Thời gian phải khớp với thời gian animation trong CSS
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      setError('Group name is required');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post( ADD_GROUP_API, 
        { 
          name: groupName, 
          description: groupDescription 
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data && response.data.code === 0) {
        onSubmit(response.data.result);
        setGroupName('');
        setGroupDescription('');
        handleClose();
      } else {
        setError(response.data.message || 'Failed to create group');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      setError(error.response?.data?.message || 'An error occurred while creating the group');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div className={`teacher-group-modal-overlay ${isClosing ? 'modal-closing' : ''}`}>
      <div className="teacher-group-modal-container">
        <div className="teacher-group-modal-header">
          <h3>Tạo nhóm mới</h3>
          <button onClick={handleClose} className="teacher-group-close-button">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="teacher-group-modal-form">
          {error && <div className="teacher-group-error-message">{error}</div>}
          
          <div className="teacher-group-form-group">
            <label htmlFor="groupName">Tên nhóm <span className="teacher-group-required">*</span></label>
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Nhập tên nhóm"
              required
            />
          </div>
          
          <div className="teacher-group-form-group">
            <label htmlFor="groupDescription">Mô tả</label>
            <input
              type="text"
              id="groupDescription"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              placeholder="Nhập mô tả nhóm"
            />
          </div>
          
          <div className="teacher-group-modal-footer">
            <button type="button" onClick={handleClose} className="teacher-group-cancel-button">
              Hủy
            </button>
            <button type="submit" className="teacher-group-submit-button" disabled={isSubmitting}>
              {isSubmitting ? 'Đang tạo nhóm...' : 'Tạo nhóm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Group Modal Component
const EditGroupModal = ({ isOpen, onClose, onSubmit, group }) => {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  // Cập nhật state khi group thay đổi
  useEffect(() => {
    if (group) {
      setGroupName(group.name || '');
      setGroupDescription(group.description || '');
    }
  }, [group]);

  const handleClose = () => {
    setIsClosing(true);
    // Đợi animation hoàn thành trước khi đóng modal
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300); // Thời gian phải khớp với thời gian animation trong CSS
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      setError('Group name is required');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const token = localStorage.getItem('authToken');
      
      // Truyền dữ liệu qua body thay vì FormData
      const requestData = {
        groupId: group.id,
        name: groupName,
        description: groupDescription
      };
      
      // Gọi API cập nhật nhóm với Content-Type là application/json
      const response = await axios.put( 
        UPDATE_GROUP_API, 
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data && response.data.code === 0) {
        // Cập nhật thành công
        onSubmit({
          ...group,
          name: groupName,
          description: groupDescription
        });
        handleClose();
      } else {
        setError(response.data.message || 'Failed to update group');
      }
    } catch (error) {
      console.error('Error updating group:', error);
      setError(error.response?.data?.message || 'An error occurred while updating the group');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div className={`teacher-group-modal-overlay ${isClosing ? 'modal-closing' : ''}`}>
      <div className="teacher-group-modal-container">
        <div className="teacher-group-modal-header">
          <h3>Chỉnh sửa nhóm</h3>
          <button onClick={handleClose} className="teacher-group-close-button">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="teacher-group-modal-form">
          {error && <div className="teacher-group-error-message">{error}</div>}
          
          <div className="teacher-group-form-group">
            <label htmlFor="editGroupName">Tên nhóm <span className="teacher-group-required">*</span></label>
            <input
              type="text"
              id="editGroupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Nhập tên nhóm"
              required
            />
          </div>
          
          <div className="teacher-group-form-group">
            <label htmlFor="editGroupDescription">Mô tả</label>
            <input
              type="text"
              id="editGroupDescription"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              placeholder="Nhập mô tả nhóm"
            />
          </div>
          
          <div className="teacher-group-modal-footer">
            <button type="button" onClick={handleClose} className="teacher-group-cancel-button">
              Hủy
            </button>
            <button type="submit" className="teacher-group-submit-button" disabled={isSubmitting}>
              {isSubmitting ? 'Đang cập nhật...' : 'Xác nhận'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Group Modal Component
const DeleteGroupModal = ({ isOpen, onClose, onConfirm, group, isDeleting }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    // Đợi animation hoàn thành trước khi đóng modal
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div className={`teacher-group-modal-overlay ${isClosing ? 'modal-closing' : ''}`}>
      <div className="teacher-group-modal-container delete-modal">
        <div className="teacher-group-modal-header">
          <h3>Xác nhận xóa nhóm</h3>
          <button onClick={handleClose} className="teacher-group-close-button">
            <X size={20} />
          </button>
        </div>
        
        <div className="teacher-group-modal-content">
          <p className="delete-warning">Bạn có chắc chắn muốn xóa nhóm này?</p>
          <p className="delete-group-name">{group?.name}</p>
          <p className="delete-note">Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan đến nhóm.</p>
        </div>
        
        <div className="teacher-group-modal-footer">
          <button 
            type="button" 
            onClick={handleClose} 
            className="teacher-group-cancel-button"
            disabled={isDeleting}
          >
            Hủy
          </button>
          <button 
            type="button" 
            onClick={() => onConfirm(group)}
            className="teacher-group-delete-button"
            disabled={isDeleting}
          >
            {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Group Card Component
const GroupCard = ({ data, onClick, avatar, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const menuIconRef = useRef(null);
  const [menuPosition, setMenuPosition] = useState({ top: 'calc(100% + 5px)', right: 0 });

  // Tính toán vị trí menu để đảm bảo không bị cắt khi ở cuối trang
  const updateMenuPosition = () => {
    if (menuIconRef.current) {
      const rect = menuIconRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Kiểm tra xem menu có bị cắt ở dưới màn hình không
      const menuHeight = 80; // Ước tính chiều cao của menu (2 mục x ~40px)
      const spaceBelow = viewportHeight - rect.bottom;
      
      if (spaceBelow < menuHeight) {
        // Nếu không đủ không gian bên dưới, hiển thị menu phía trên nút
        setMenuPosition({ bottom: 'calc(100% + 5px)', right: 0, top: 'auto' });
      } else {
        // Mặc định hiển thị menu bên dưới nút
        setMenuPosition({ top: 'calc(100% + 5px)', right: 0 });
      }
    }
  };

  const handleMenuClick = (e) => {
    e.stopPropagation(); // Ngăn không cho sự kiện lan ra ngoài (không mở trang chi tiết)
    updateMenuPosition(); // Cập nhật vị trí menu trước khi hiển thị
    setShowMenu(!showMenu);
  };

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && 
          menuIconRef.current && !menuIconRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Đóng menu khi cuộn trang
  useEffect(() => {
    const handleScroll = () => {
      if (showMenu) {
        setShowMenu(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showMenu]);

  const handleEditClick = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit(data);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete(data);
  };

  return (
    <div className="group-card" onClick={() => onClick(data)}>
      <div className="group-header">
        <h3>{data.name}</h3>
        <p>{(data.description) ? data.description : data.teacher.fullName}</p>
      </div>
      
      <div className="group-content">
        <div className="teachers-section">
          <p className="group-section-title">Teachers</p>
          <div className="teachers-avatars">
            <div className="avatar">
              <img src={avatar || "https://randomuser.me/api/portraits/men/1.jpg"} alt={`${data.teacher.fullName}`} />
              </div>
            <span>{data.teacher.fullName}</span>
          </div>
        </div>

        <div className="divider"></div>

        <div className="students-section">
          <p className="group-section-title">Top Students</p>
          <div className="students-avatars">
            {data.topStudents && data.topStudents.map((student, index) => (
              <div 
                className="student-avatar" 
                key={index} 
                style={{ backgroundColor: student.color }}
              >
                {student.initial}
              </div>
            ))}
          </div>
        </div>

        <div className="menu-icon" onClick={handleMenuClick} ref={menuIconRef}>
          <FiMoreHorizontal />
          {showMenu && (
            <div className="group-action-menu" ref={menuRef} style={menuPosition}>
              <button className="group-action-item" onClick={handleEditClick}>
                <Edit size={16} />
                <span>Chỉnh sửa</span>
              </button>
              <button className="group-action-item" onClick={handleDeleteClick}>
                <Trash2 size={16} />
                <span>Xóa</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Tạo dữ liệu hiển thị từ API response
const formatApiDataToDisplayData = (apiGroups) => {
  return apiGroups.map(group => {
    // Xử lý students
    const students = group.students || [];
    // Chọn 2 sinh viên đứng đầu
    const topStudents = students.slice(0, 2).map((student, index) => {
      // Tạo một màu ngẫu nhiên hoặc từ một danh sách màu cố định
      const colors = ["#8a2be2", "#32cd32", "#ff3333", "#00ced1", "#ffd700", "#3e60ff"];
      const initial = student.fullName ? student.fullName.charAt(0).toUpperCase() : 'S';
      
      return {
        id: student.id,
        initial: initial,
        color: colors[index % colors.length]
      };
    });
    
    return {
      id: group.id,
      name: group.name,
      description: group.description,
      teacher: group.teacher,
      topStudents: topStudents
    };
  });
};

const GroupPage = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [groups, setGroups] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
      pageNumber: 0,
      pageSize: 10,
      totalPages: 0,
      totalElements: 0
    });
    const [avatarUrl, setAvatarUrl] = useState(null);
    
    // Hàm đóng modal với hiệu ứng
    const closeModal = () => {
      setIsModalOpen(false);
    };
    
    // Hàm đóng modal chỉnh sửa
    const closeEditModal = () => {
      setIsEditModalOpen(false);
      setSelectedGroup(null);
    };
    
    // Hàm đóng modal xóa
    const closeDeleteModal = () => {
      setIsDeleteModalOpen(false);
      setSelectedGroup(null);
    };
    
    const fetchGroups = async (isLoadMore = false) => {
      setIsLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        // Tạo URLSearchParams để gửi tham số GET
        const params = new URLSearchParams();
        params.append('pageNumber', pagination.pageNumber.toString());
        params.append('pageSize', pagination.pageSize.toString());
        
        // Gọi API với phương thức GET và params
        const response = await axios.get(
          `${GET_TEACHER_GROUPS}?${params.toString()}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        // Kiểm tra kết quả trả về
        if (response.data && response.data.code === 0) {
          const responseData = response.data.result;
          
          // Nếu kết quả trả về là dạng phân trang
          if (responseData.content) {
            const formattedGroups = formatApiDataToDisplayData(responseData.content);
            
            // Nếu đang load more, thêm nhóm mới vào danh sách hiện tại
            if (isLoadMore) {
              setGroups(prevGroups => [...prevGroups, ...formattedGroups]);
            } else {
              // Nếu không phải load more, thay thế danh sách hiện tại
              setGroups(formattedGroups);
            }
            
            // Cập nhật thông tin phân trang
            setPagination({
              ...pagination,
              totalPages: responseData.totalPages,
              totalElements: responseData.totalElements
            });

            // Fetch avatar if available
            responseData.content.forEach(group => {
              fetchAvatar(group.teacher.avatar)
            });
          } else {
            // Nếu kết quả trả về là mảng thông thường
            const formattedGroups = formatApiDataToDisplayData(responseData);
            
            // Tương tự xử lý load more
            if (isLoadMore) {
              setGroups(prevGroups => [...prevGroups, ...formattedGroups]);
            } else {
              setGroups(formattedGroups);
            }
          }
        } else {
          throw new Error(response.data?.message || 'Failed to fetch groups');
        }
      } catch (err) {
        console.error('Error fetching teacher groups:', err);
        setError('Không thể tải danh sách nhóm. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    // Hàm gọi API để lấy ra ảnh đại diện của sinh viên
    const fetchAvatar = async (avatarPath) => {
      if (!avatarPath) return;

      try {
          const token = localStorage.getItem('authToken');
          if (!token) return;

          // Fetch avatar with authorization header
          const response = await axios.get(`${API_BASE_URL}${avatarPath}`, {
              headers: {
                  'Authorization': `Bearer ${token}`
              },
              responseType: 'blob'
          });

          // Create a URL for the blob data
          const imageUrl = URL.createObjectURL(response.data);
          setAvatarUrl(imageUrl);
      } catch (err) {
          console.error('Error fetching avatar:', err);
      }
    };
    
    useEffect(() => {
      fetchGroups();
      // Không phụ thuộc vào pagination.pageNumber để tránh gọi API 2 lần khi click nút Xem thêm nhóm
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    const handleGroupClick = (group) => {
        const key = `group_${group.id}`;
        console.log("Saving group to localStorage with key:", key);
        localStorage.setItem(key, JSON.stringify(group));

        // Sau đó kiểm tra
        console.log("Saved value:", localStorage.getItem(key));
        
        // Navigate to group detail page
        setTimeout(() => {
        navigate(`/teacher/groups/${group.id}`);
        }, 100)
    };

    const handleAddGroup = (newGroup) => {
      console.log('New group created:', newGroup);
      
      // Tạo định dạng dữ liệu hiển thị cho nhóm mới tạo
      const createdGroup = {
        ...newGroup,
        teachers: [
          { id: 1, avatar: "https://randomuser.me/api/portraits/women/68.jpg" },
        ],
        topStudents: [
          { id: 1, initial: "S", color: "#3e60ff" },
        ]
      };
      
      // Thêm nhóm mới vào đầu danh sách
      setGroups([createdGroup, ...groups]);
      
      // Reload danh sách nhóm từ server
      fetchGroups();
    };

    // Xử lý chỉnh sửa nhóm
    const handleEditGroup = (group) => {
      setSelectedGroup(group);
      setIsEditModalOpen(true);
    };

    // Xử lý cập nhật nhóm sau khi chỉnh sửa
    const handleUpdateGroup = (updatedGroup) => {
      console.log('Group updated:', updatedGroup);
      
      // Cập nhật nhóm trong state
      setGroups(prevGroups => 
        prevGroups.map(group => 
          group.id === updatedGroup.id ? updatedGroup : group
        )
      );
      
      // Reload danh sách nhóm từ server
      fetchGroups();
    };

    // Mở modal xác nhận xóa nhóm
    const handleDeleteGroup = (group) => {
      setSelectedGroup(group);
      setIsDeleteModalOpen(true);
    };

    // Xử lý xóa nhóm sau khi xác nhận
    const confirmDeleteGroup = async (group) => {
      if (!group || !group.id) return;
      
      setIsDeleting(true);
      
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        // Tạo FormData để gửi dữ liệu
        const formData = new FormData();
        formData.append('groupId', group.id);
        
        // Gọi API xóa nhóm
        const response = await axios.delete('http://localhost:8080/lms/group/delete', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          data: formData // Truyền formData trong data khi sử dụng method DELETE
        });
        
        if (response.data && response.data.code === 0) {
          // Xóa nhóm khỏi state
          setGroups(prevGroups => prevGroups.filter(g => g.id !== group.id));
          closeDeleteModal();
          
          // Hiển thị thông báo thành công (nếu có)
          console.log('Group deleted successfully');
        } else {
          throw new Error(response.data?.message || 'Failed to delete group');
        }
      } catch (error) {
        console.error('Error deleting group:', error);
        // Hiển thị thông báo lỗi (nếu có)
      } finally {
        setIsDeleting(false);
      }
    };

    const filteredGroups = searchTerm 
      ? groups.filter(group => 
          group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          group.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : groups;

    // Xử lý khi thay đổi trang
    const handlePageChange = (newPage) => {
      setPagination({
        ...pagination,
        pageNumber: newPage
      });
      
      // Khi chuyển trang, load lại dữ liệu mà không thêm vào danh sách hiện tại
      fetchGroups(false);
    };

    // Hàm xử lý khi bấm nút Xem thêm nhóm
    const handleLoadMore = () => {
      // Tăng pageNumber lên 1
      const nextPage = pagination.pageNumber + 1;
      
      // Cập nhật state pagination với pageNumber mới
      setPagination(prev => ({
        ...prev,
        pageNumber: nextPage
      }));
      
      // Gọi fetchGroups với tham số isLoadMore = true để thêm vào danh sách hiện tại
      fetchGroups(true);
    };

    return (
      <div className="group-page-container">
        <div className='group-hearder'>
          <h2 className='group-header-title'>Groups</h2>
          <div className='group-content-left'>
            <div className='group-search'>
              <span className="group-search-icon">
                <Search size={18} color='#787878'/>
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              className='group-add-btn'
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={18} style={{marginRight: '4px'}}/>
              Add Group
            </button>
          </div>
        </div>
        
        {/* Loading và Error */}
        {isLoading && (
          <div className="group-loading">
            <div className="group-loading-spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        )}
        
        {error && (
          <div className="group-error">
            <p>{error}</p>
            <button onClick={fetchGroups}>Thử lại</button>
          </div>
        )}
        
        {/* Danh sách nhóm */}
        {!isLoading && !error && (
          <>
            <div className="group-grid">
              {filteredGroups.length > 0 ? (
                filteredGroups.map((group) => (
              <GroupCard 
                key={group.id} 
                data={group}
                avatar={avatarUrl} 
                onClick={handleGroupClick}
                onEdit={handleEditGroup}
                onDelete={handleDeleteGroup}
              />
                ))
              ) : (
                <div className="no-groups">
                  <p>Bạn chưa tạo nhóm nào, bấm vào nút Add group để tạo nhóm</p>
                  <button 
                    className="create-group-btn"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <Plus size={18} style={{marginRight: '4px'}}/>
                    Add Group
                  </button>
                </div>
              )}
            </div>
            
            {/* Nút "Xem thêm nhóm" và phân trang */}
            {pagination.totalPages > 1 && (
              <div className="group-pagination-container">
                {/* Hiển thị nút "Xem thêm nhóm" nếu chưa phải trang cuối */}
                {pagination.pageNumber < pagination.totalPages - 1 && (
                  <button
                    className="load-more-btn"
                    onClick={handleLoadMore}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Đang tải...' : 'Xem thêm nhóm'}
                  </button>
                )}
                
                {/* Phân trang */}
                <div className="group-pagination">
                  <button 
                    disabled={pagination.pageNumber === 0}
                    onClick={() => handlePageChange(pagination.pageNumber - 1)}
                  >
                    Trước
                  </button>
                  <span>
                    Trang {pagination.pageNumber + 1} / {pagination.totalPages}
                  </span>
                  <button 
                    disabled={pagination.pageNumber >= pagination.totalPages - 1}
                    onClick={() => handlePageChange(pagination.pageNumber + 1)}
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Add Group Modal */}
        <AddGroupModal 
          isOpen={isModalOpen} 
          onClose={closeModal}
          onSubmit={handleAddGroup}
        />

        {/* Edit Group Modal */}
        <EditGroupModal 
          isOpen={isEditModalOpen} 
          onClose={closeEditModal}
          onSubmit={handleUpdateGroup}
          group={selectedGroup}
        />

        {/* Delete Group Modal */}
        <DeleteGroupModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={confirmDeleteGroup}
          group={selectedGroup}
          isDeleting={isDeleting}
        />
      </div>
    );
};

export default GroupPage;
