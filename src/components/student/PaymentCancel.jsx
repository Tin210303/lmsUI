import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, ShoppingCart } from 'lucide-react';

const PaymentCancel = () => {
    const navigate = useNavigate();

    const handleBackToCourses = () => {
        navigate('/courses');
    };

    const handleTryAgain = () => {
        // Quay lại trang trước đó
        window.history.go(-2);
    };

    return (
        <div className="payment-result-container">
            <div className="payment-result-card canceled">
                <div className="cancel-icon">
                    <XCircle size={40} color="#fff" />
                </div>
                <h2>Thanh toán đã bị hủy</h2>
                <p>Bạn đã hủy quá trình thanh toán. Không có khoản phí nào được trừ từ tài khoản của bạn.</p>
                
                <div className="payment-actions">
                    <button className="payment-action-btn primary" onClick={handleTryAgain}>
                        <ShoppingCart size={16} />
                        Thử lại
                    </button>
                    <button className="payment-action-btn secondary" onClick={handleBackToCourses}>
                        <ArrowLeft size={16} />
                        Quay lại danh sách khóa học
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentCancel; 