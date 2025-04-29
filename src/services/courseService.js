import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:8080/lms';

export const getCourseById = async (courseId) => {
    try {
        // Lấy token từ localStorage và kiểm tra
        let token = localStorage.getItem('authToken');
        
        // Placeholder token cho development (giữ lại nếu cần)
        if (!token && process.env.NODE_ENV === 'development') {
            token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJsZXRpZW5AdGVhY2hlci5jb20iLCJyb2xlIjoiVEVBQ0hFUiIsImlhdCI6MTY3MjUwMzYwMCwiZXhwIjoxNjcyNTA3MjAwfQ.5eH5rcXitROX9QvvhXkQcxoKEU-QTHT8NVEIERoG5MI';
            console.warn('Đang sử dụng token mẫu cho getCourseById trong development');
        }
        
        if (!token) {
            console.error('getCourseById: Token không tồn tại, cần đăng nhập lại');
            window.location.href = '/'; 
            return null;
        }
        
        console.log('Fetching course detail with ID:', courseId);
        console.log('Using token:', token.substring(0, 15) + '...');
        
        // Gọi API đúng endpoint: /course/{courseId}
        const response = await axios.get(`${API_URL}/course/${courseId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        console.log('Course detail API response:', response.data);
        
        // Xử lý response khi result là một object
        if (response.data.code === 0 && response.data.result && typeof response.data.result === 'object') {
            console.log('Found course detail:', response.data.result);
            return response.data.result; // Trả về trực tiếp object khóa học
        }
        
        console.warn('Không tìm thấy chi tiết khóa học hoặc API trả về lỗi');
        return null;
    } catch (error) {
        console.error('Error fetching course detail:', error);
        
        // Xử lý lỗi 401 Unauthorized (token hết hạn)
        if (error.response && error.response.status === 401) {
            console.error('getCourseById: Token đã hết hạn hoặc không hợp lệ, cần đăng nhập lại');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            localStorage.removeItem('tokenExpiry');
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('role');
            window.location.href = '/';
        }
        
        console.error('getCourseById Error details:', error.response?.data || error.message);
        return null;
    }
};

export const getCoursesOfMajor = async (pageNumber = 0, pageSize = 8) => {
    try {
        // Lấy token từ localStorage và kiểm tra
        let token = localStorage.getItem('authToken');
        
        // Kiểm tra nếu đang trong môi trường development và không có token
        if (!token && process.env.NODE_ENV === 'development') {
            // Sử dụng token mẫu từ screenshot trước đó
            token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJsZXRpZW5AdGVhY2hlci5jb20iLCJyb2xlIjoiVEVBQ0hFUiIsImlhdCI6MTY3MjUwMzYwMCwiZXhwIjoxNjcyNTA3MjAwfQ.5eH5rcXitROX9QvvhXkQcxoKEU-QTHT8NVEIERoG5MI';
            console.warn('Đang sử dụng token mẫu cho môi trường development');
        }
        
        if (!token) {
            console.error('Token không tồn tại, cần đăng nhập lại');
            window.location.href = '/'; // Chuyển về trang chủ nếu không có token
            return { content: [], totalPages: 0, totalElements: 0, pageNumber: 0 };
        }
        
        console.log('Using token for courses:', token.substring(0, 15) + '...');
        console.log('Pagination params for all courses: pageNumber=', pageNumber, 'pageSize=', pageSize);
        
        // Gọi API với các tham số phân trang
        const response = await axios.get(`${API_URL}/course/courseofmajorfirst`, {
            params: {
                pageNumber: pageNumber,
                pageSize: pageSize
            },
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        console.log('All courses API response:', response.data);
        
        // Xử lý kết quả và thông tin phân trang
        if (response.data.code === 0) {
            if (response.data.result && Array.isArray(response.data.result.content)) {
                // Cấu trúc API trả về thông tin phân trang chuẩn
                return {
                    content: response.data.result.content,
                    totalPages: response.data.result.page.totalPages || 1,
                    totalElements: response.data.result.page.totalElements || response.data.result.content.length,
                    pageNumber: response.data.result.page.number || 0
                };
            } else if (Array.isArray(response.data.result)) {
                // Cấu trúc API trả về mảng đơn giản, không có thông tin phân trang
                return {
                    content: response.data.result,
                    totalPages: 1,
                    totalElements: response.data.result.length,
                    pageNumber: 0
                };
            }
        }
        
        return { content: [], totalPages: 0, totalElements: 0, pageNumber: 0 };
    } catch (error) {
        console.error('Error fetching courses:', error);
        
        // Xử lý lỗi 401 Unauthorized (token hết hạn)
        if (error.response && error.response.status === 401) {
            console.error('Token đã hết hạn hoặc không hợp lệ, cần đăng nhập lại');
            // Xóa dữ liệu đăng nhập và chuyển về trang chủ
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            localStorage.removeItem('tokenExpiry');
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('role');
            window.location.href = '/';
        }
        
        console.error('Error details:', error.response?.data || error.message);
        return { content: [], totalPages: 0, totalElements: 0, pageNumber: 0 };
    }
};

export const getCoursesMajorFirst = async (pageNumber = 0, pageSize = 8) => {
    try {
        // Lấy token từ localStorage và kiểm tra
        let token = localStorage.getItem('authToken');
        
        // Kiểm tra nếu đang trong môi trường development và không có token
        if (!token && process.env.NODE_ENV === 'development') {
            // Sử dụng token mẫu từ screenshot trước đó
            token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJsZXRpZW5AdGVhY2hlci5jb20iLCJyb2xlIjoiVEVBQ0hFUiIsImlhdCI6MTY3MjUwMzYwMCwiZXhwIjoxNjcyNTA3MjAwfQ.5eH5rcXitROX9QvvhXkQcxoKEU-QTHT8NVEIERoG5MI';
            console.warn('Đang sử dụng token mẫu cho môi trường development');
        }
        
        if (!token) {
            console.error('Token không tồn tại, cần đăng nhập lại');
            window.location.href = '/'; // Chuyển về trang chủ nếu không có token
            return { content: [], totalPages: 0, totalElements: 0, pageNumber: 0 };
        }
        
        console.log('Using token for courses:', token.substring(0, 15) + '...');
        console.log('Pagination params for all courses: pageNumber=', pageNumber, 'pageSize=', pageSize);
        
        // Gọi API với các tham số phân trang
        const response = await axios.get(`${API_URL}/course/courseofmajorfirst`, {
            params: {
                pageNumber: pageNumber,
                pageSize: pageSize
            },
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        console.log('All courses API response:', response.data);
        
        // Xử lý kết quả và thông tin phân trang
        if (response.data.code === 0) {
            if (response.data.result && Array.isArray(response.data.result.content)) {
                // Cấu trúc API trả về thông tin phân trang chuẩn
                return {
                    content: response.data.result.content,
                    totalPages: response.data.result.page.totalPages || 1,
                    totalElements: response.data.result.page.totalElements || response.data.result.content.length,
                    pageNumber: response.data.result.page.number || 0
                };
            } else if (Array.isArray(response.data.result)) {
                // Cấu trúc API trả về mảng đơn giản, không có thông tin phân trang
                return {
                    content: response.data.result,
                    totalPages: 1,
                    totalElements: response.data.result.length,
                    pageNumber: 0
                };
            }
        }
        
        return { content: [], totalPages: 0, totalElements: 0, pageNumber: 0 };
    } catch (error) {
        console.error('Error fetching courses:', error);
        
        // Xử lý lỗi 401 Unauthorized (token hết hạn)
        if (error.response && error.response.status === 401) {
            console.error('Token đã hết hạn hoặc không hợp lệ, cần đăng nhập lại');
            // Xóa dữ liệu đăng nhập và chuyển về trang chủ
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            localStorage.removeItem('tokenExpiry');
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('role');
            window.location.href = '/';
        }
        
        console.error('Error details:', error.response?.data || error.message);
        return { content: [], totalPages: 0, totalElements: 0, pageNumber: 0 };
    }
};

export const getMyCourses = async (pageNumber = 0, pageSize = 10) => {
    try {
        // Lấy token từ localStorage và kiểm tra
        let token = localStorage.getItem('authToken');

        // Placeholder token cho development nếu cần (có thể xóa nếu không cần)
        if (!token && process.env.NODE_ENV === 'development') {
            token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJsZXRpZW5AdGVhY2hlci5jb20iLCJyb2xlIjoiVEVBQ0hFUiIsImlhdCI6MTY3MjUwMzYwMCwiZXhwIjoxNjcyNTA3MjAwfQ.5eH5rcXitROX9QvvhXkQcxoKEU-QTHT8NVEIERoG5MI'; // Thay bằng token hợp lệ
            console.warn('Đang sử dụng token mẫu cho getMyCourses trong development');
        }

        if (!token) {
            console.error('getMyCourses: Token không tồn tại, cần đăng nhập lại');
            window.location.href = '/';
            return { content: [], totalPages: 0, totalElements: 0 };
        }

        console.log('Fetching my courses with token:', token.substring(0, 15) + '...');
        console.log('Pagination params: pageNumber=', pageNumber, 'pageSize=', pageSize);

        const response = await axios.get(`${API_URL}/studentcourse/mycourse`, {
            params: {
                pageNumber: pageNumber,
                pageSize: pageSize
            },
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log('My courses API response:', response.data);

        // Return both the courses array and pagination info
        if (response.data.code === 0) {
            if (response.data.result && Array.isArray(response.data.result.content)) {
                return {
                    content: response.data.result.content,
                    totalPages: response.data.result.page.totalPages || 1,
                    totalElements: response.data.result.page.totalElements || response.data.result.content.length,
                    pageNumber: response.data.result.page.number || 0
                };
            } else if (Array.isArray(response.data.result)) {
                // Fallback for API that doesn't return pagination info
                return {
                    content: response.data.result,
                    totalPages: 1,
                    totalElements: response.data.result.length,
                    pageNumber: 0
                };
            }
        }
        
        return { content: [], totalPages: 0, totalElements: 0, pageNumber: 0 };
    } catch (error) {
        console.error('Error fetching my courses:', error);

        // Xử lý lỗi 401 Unauthorized
        if (error.response && error.response.status === 401) {
            console.error('getMyCourses: Token đã hết hạn hoặc không hợp lệ, cần đăng nhập lại');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            localStorage.removeItem('tokenExpiry');
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('role');
            window.location.href = '/';
        }

        console.error('getMyCourses Error details:', error.response?.data || error.message);
        return { content: [], totalPages: 0, totalElements: 0, pageNumber: 0 };
    }
}; 

export const getTeacherCourses = async (pageNumber = 0, pageSize = 10) => {
    try {
        // Lấy token từ localStorage và kiểm tra
        let token = localStorage.getItem('authToken');
        
        if (!token) {
            console.error('getTeacherCourses: Token không tồn tại, cần đăng nhập lại');
            window.location.href = '/';
            return { content: [], totalPages: 0, totalElements: 0, pageNumber: 0 };
        }
        
        console.log('Fetching teacher courses with params:', { pageNumber, pageSize });
        
        // Gọi API với các tham số lọc và phân trang
        const response = await axios.get(`${API_URL}/course/courseofteacher`, {
            params: {
                pageNumber,
                pageSize
            },
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        console.log('Teacher courses API response:', response.data);
        
        // Xử lý kết quả và thông tin phân trang
        if (response.data.code === 0) {
            if (response.data.result && Array.isArray(response.data.result.content)) {
                return {
                    content: response.data.result.content,
                    totalPages: response.data.result.page.totalPages || 1,
                    totalElements: response.data.result.page.totalElements || response.data.result.content.length,
                    pageNumber: response.data.result.page.number || 0,
                    pageSize: response.data.result.page.size || pageSize
                };
            } else if (Array.isArray(response.data.result)) {
                return {
                    content: response.data.result,
                    totalPages: 1,
                    totalElements: response.data.result.length,
                    pageNumber: 0,
                    pageSize: pageSize
                };
            }
        }
        
        return { content: [], totalPages: 0, totalElements: 0, pageNumber: 0, pageSize: pageSize };
    } catch (error) {
        console.error('Error fetching teacher courses:', error);
        
        // Xử lý lỗi 401 Unauthorized (token hết hạn)
        if (error.response && error.response.status === 401) {
            console.error('getTeacherCourses: Token đã hết hạn hoặc không hợp lệ, cần đăng nhập lại');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            localStorage.removeItem('tokenExpiry');
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('role');
            window.location.href = '/';
        }
        
        console.error('getTeacherCourses Error details:', error.response?.data || error.message);
        return { content: [], totalPages: 0, totalElements: 0, pageNumber: 0, pageSize: pageSize };
    }
}; 