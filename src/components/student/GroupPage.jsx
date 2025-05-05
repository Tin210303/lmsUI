import React from 'react';
import { FiMoreHorizontal } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import '../../assets/css/group-page.css';

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

  return (
    <div className="group-page-container">
      <div className="group-grid">
        {sampleGroups.map((group) => (
          <GroupCard 
            key={group.id} 
            data={group} 
            onClick={handleGroupClick}
          />
        ))}
      </div>
    </div>
  );
};

export default GroupPage;
