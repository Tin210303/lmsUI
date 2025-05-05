import React, { useState } from 'react';
import { FiMoreHorizontal } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, X } from 'lucide-react';
import axios from 'axios';
import '../../assets/css/group-page.css';

// Add Group Modal Component
const AddGroupModal = ({ isOpen, onClose, onSubmit }) => {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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
      const response = await axios.post('http://localhost:8080/lms/group/create', 
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
        onClose();
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

  if (!isOpen) return null;

  return (
    <div className="teacher-group-modal-overlay">
      <div className="teacher-group-modal-container">
        <div className="teacher-group-modal-header">
          <h3>Tạo nhóm mới</h3>
          <button onClick={onClose} className="teacher-group-close-button">
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
            <button type="button" onClick={onClose} className="teacher-group-cancel-button">
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

// Group Card Component
const GroupCard = ({ data, onClick }) => {
  return (
    <div className="group-card" onClick={() => onClick(data)}>
      <div className="group-header">
        <h3>{data.name}</h3>
        <p>{data.description}</p>
      </div>
      
      <div className="group-content">
        <div className="teachers-section">
          <p className="group-section-title">Teachers</p>
          <div className="teachers-avatars">
            {data.teachers.map((teacher, index) => (
              <div className="avatar" key={index}>
                <img src={teacher.avatar} alt={`Teacher ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="divider"></div>

        <div className="students-section">
          <p className="group-section-title">Top Students</p>
          <div className="students-avatars">
            {data.topStudents.map((student, index) => (
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

// Sample data that closely matches the image
const sampleGroups = [
  {
    id: 1,
    name: "Group One",
    description: "3 Teacher, 20 Students",
    teachers: [
      { id: 1, avatar: "https://randomuser.me/api/portraits/women/68.jpg" },
      { id: 2, avatar: "https://randomuser.me/api/portraits/men/33.jpg" },
      { id: 3, avatar: "https://randomuser.me/api/portraits/men/45.jpg" },
    ],
    topStudents: [
      { id: 1, initial: "D", color: "#8a2be2" },
      { id: 2, initial: "E", color: "#32cd32" },
    ],
  },
  {
    id: 2,
    name: "Group One",
    description: "3 Teacher, 20 Students",
    teachers: [
      { id: 1, avatar: "https://randomuser.me/api/portraits/women/65.jpg" },
      { id: 2, avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
      { id: 3, avatar: "https://randomuser.me/api/portraits/men/43.jpg" },
    ],
    topStudents: [
      { id: 1, initial: "D", color: "#8a2be2" },
      { id: 2, initial: "E", color: "#32cd32" },
    ],
  },
  {
    id: 3,
    name: "Group One",
    description: "3 Quiz, 20 Students",
    teachers: [
      { id: 1, avatar: "https://randomuser.me/api/portraits/men/67.jpg" },
      { id: 2, avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
      { id: 3, avatar: "https://randomuser.me/api/portraits/men/41.jpg" },
    ],
    topStudents: [
      { id: 1, initial: "D", color: "#ff3333" },
      { id: 2, initial: "E", color: "#8a2be2" },
    ],
  },
  {
    id: 4,
    name: "Group One",
    description: "3 Teacher, 20 Students",
    teachers: [
      { id: 1, avatar: "https://randomuser.me/api/portraits/men/67.jpg" },
      { id: 2, avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
      { id: 3, avatar: "https://randomuser.me/api/portraits/men/41.jpg" },
    ],
    topStudents: [
      { id: 1, initial: "D", color: "#00ced1" },
      { id: 2, initial: "E", color: "#8a2be2" },
    ],
  },
  {
    id: 5,
    name: "Group One",
    description: "3 Teacher, 20 Students",
    teachers: [
      { id: 1, avatar: "https://randomuser.me/api/portraits/women/65.jpg" },
      { id: 2, avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
      { id: 3, avatar: "https://randomuser.me/api/portraits/men/43.jpg" },
    ],
    topStudents: [
      { id: 1, initial: "D", color: "#8a2be2" },
      { id: 2, initial: "E", color: "#32cd32" },
    ],
  },
  {
    id: 6,
    name: "Group One",
    description: "3 Teacher, 20 Students",
    teachers: [
      { id: 1, avatar: "https://randomuser.me/api/portraits/women/68.jpg" },
      { id: 2, avatar: "https://randomuser.me/api/portraits/women/42.jpg" },
      { id: 3, avatar: "https://randomuser.me/api/portraits/men/44.jpg" },
    ],
    topStudents: [
      { id: 1, initial: "D", color: "#ffd700" },
      { id: 2, initial: "E", color: "#32cd32" },
    ],
  },
  {
    id: 7,
    name: "Group One",
    description: "3 Teacher, 20 Students",
    teachers: [
      { id: 1, avatar: "https://randomuser.me/api/portraits/women/68.jpg" },
      { id: 2, avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
      { id: 3, avatar: "https://randomuser.me/api/portraits/men/43.jpg" },
    ],
    topStudents: [
      { id: 1, initial: "D", color: "#8a2be2" },
      { id: 2, initial: "E", color: "#32cd32" },
    ],
  },
  {
    id: 8,
    name: "Group One",
    description: "3 Quiz, 20 Students",
    teachers: [
      { id: 1, avatar: "https://randomuser.me/api/portraits/men/67.jpg" },
      { id: 2, avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
      { id: 3, avatar: "https://randomuser.me/api/portraits/men/41.jpg" },
    ],
    topStudents: [
      { id: 1, initial: "D", color: "#ff3333" },
      { id: 2, initial: "E", color: "#8a2be2" },
    ],
  },
];

const GroupPage = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [groups, setGroups] = useState(sampleGroups);
    const [searchTerm, setSearchTerm] = useState('');
    
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

    const handleAddGroup = (newGroup) => {
      // In a real application, you would add the new group to your state
      // and potentially fetch the updated list from the server
      console.log('New group created:', newGroup);
      
      // For now, we'll just add a simplified version to our local state
      const createdGroup = {
        ...newGroup,
        id: groups.length + 1,
        teachers: [
          { id: 1, avatar: "https://randomuser.me/api/portraits/women/68.jpg" },
        ],
        topStudents: [
          { id: 1, initial: "S", color: "#3e60ff" },
        ]
      };
      
      setGroups([createdGroup, ...groups]);
    };

    const filteredGroups = searchTerm 
      ? groups.filter(group => 
          group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          group.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : groups;

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
            <div className="group-grid">
                {filteredGroups.map((group) => (
                    <GroupCard 
                        key={group.id} 
                        data={group} 
                        onClick={handleGroupClick}
                    />
                ))}
            </div>
            
            {/* Add Group Modal */}
            <AddGroupModal 
              isOpen={isModalOpen} 
              onClose={() => setIsModalOpen(false)}
              onSubmit={handleAddGroup}
            />
        </div>
    );
};

export default GroupPage;
