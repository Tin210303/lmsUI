import React, { useState, useEffect } from 'react';
import { FiMoreHorizontal } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, X } from 'lucide-react';
import axios from 'axios';
import '../../assets/css/group-page.css';
import { API_BASE_URL, GET_GROUPS_OF_STUDENT } from '../../services/apiService';

// Group Card Component
const GroupCard = ({ data, avatar, onClick }) => {
  return (
    <div className="group-card" onClick={() => onClick(data)}>
      <div className="group-header">
        <h3>{data.name}</h3>
        <p>{(data.description) ? data.description : data.teacher.fullName}</p>
      </div>
      
      <div className="group-content">
        <div className="teachers-section">
          <p className="group-section-title">Giảng viên</p>
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

        <div className="menu-icon">
          <FiMoreHorizontal />
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
    const [teacherAvatarUrl, setTeacherAvatarUrl] = useState(null);
    
    const fetchGroups = async () => {
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
          `${GET_GROUPS_OF_STUDENT}?${params.toString()}`,
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
            setGroups(formattedGroups);
            
            // Cập nhật thông tin phân trang
            setPagination({
              ...pagination,
              totalPages: responseData.totalPages,
              totalElements: responseData.totalElements
            });

            // Fetch avatar if available
            responseData.content.forEach(group => {
              fetchTeacherAvatar(group.teacher.avatar)
            });
          } else {
            // Nếu kết quả trả về là mảng thông thường
            const formattedGroups = formatApiDataToDisplayData(responseData);
            setGroups(formattedGroups);
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
    const fetchTeacherAvatar = async (avatarPath) => {
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
          setTeacherAvatarUrl(imageUrl);
      } catch (err) {
          console.error('Error fetching avatar:', err);
      }
    };
    
    useEffect(() => {
      fetchGroups();
    }, [pagination.pageNumber, pagination.pageSize]);
    
    const handleGroupClick = (group) => {
      const key = `group_${group.id}`;
      console.log("Saving group to localStorage with key:", key);
      localStorage.setItem(key, JSON.stringify(group));

      // Sau đó kiểm tra
      console.log("Saved value:", localStorage.getItem(key));
      
      // Navigate to group detail page
      setTimeout(() => {
        navigate(`/groups/${group.id}`);
      }, 100)
    };

    const filteredGroups = searchTerm 
      ? groups.filter(group => 
          group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          group.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : groups;

    // Xử lý khi thay đổi trang
    const handlePageChange = (newPage) => {
      setPagination({
        ...pagination,
        pageNumber: newPage
      });
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
                </div>
            </div>
            
            {/* Loading và Error */}
            {isLoading && (
              <div className="loading-container">
                <div className="loading-spinner"></div>
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
                              avatar={teacherAvatarUrl}
                              onClick={handleGroupClick}
                          />
                      ))
                    ) : (
                      <div className="no-groups">
                        <p>Không tìm thấy nhóm nào</p>
                      </div>
                    )}
                </div>
                
                {/* Phân trang */}
                {pagination.totalPages > 1 && (
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
                )}
              </>
            )}
        </div>
    );
};

export default GroupPage;
