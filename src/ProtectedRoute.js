import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Hiển thị loading nếu đang kiểm tra trạng thái xác thực
  if (isLoading) {
    return (
      <div className="auth-loading-container">
        <div className="auth-loading-spinner"></div>
        <p>Đang tải...</p>
      </div>
    );
  }

  // Nếu chưa đăng nhập hoặc không có quyền truy cập
  if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    // Redirect to login if not authenticated, or home if wrong role
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
