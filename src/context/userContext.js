import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const accessToken = localStorage.getItem('authToken');
    const [infoUser, setInfoUser] = useState(null);
    const [profileImage, setProfileImage] = useState(null);

    useEffect(() => {
        fetchInfoUser();
    }, []);

    useEffect(() => {
        if (infoUser?.result?.id) {
            fetchProfileImage();
        }
    }, [infoUser]);

    const fetchInfoUser = async () => {
        try {
            const response = await axios.get('http://localhost:8080/lms/student/myinfo', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            setInfoUser(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
        }
    };

    const fetchProfileImage = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/lms/student/image/${infoUser.result.id}.JPG`, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
                responseType: 'blob'
            });
            const imageUrl = URL.createObjectURL(response.data);
            setProfileImage(imageUrl);
        } catch (error) {
            console.error('Lỗi khi lấy ảnh:', error);
        }
    };

    return (
        <UserContext.Provider value={{ infoUser, setInfoUser, profileImage, setProfileImage }}>
            {children}
        </UserContext.Provider>
    );
};
