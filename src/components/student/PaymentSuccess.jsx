import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paymentDetails, setPaymentDetails] = useState(null);

    useEffect(() => {
        const fetchPaymentStatus = async () => {
            try {
                setLoading(true);
                // Lấy token xác thực
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('No authentication token found');
                }

                // Xử lý URL để lấy các tham số
                const urlParams = new URLSearchParams(window.location.search);
                const paymentId = urlParams.get('paymentId');
                const payerId = urlParams.get('PayerID');

                if (!paymentId || !payerId) {
                    throw new Error('Missing payment information in URL');
                }

                // Gửi yêu cầu xác nhận thanh toán
                const response = await axios.get(`http://localhost:8080/lms/paypal/success?paymentId=${paymentId}&PayerID=${payerId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.data && response.data.code === 0) {
                    setPaymentDetails(response.data.result);
                    console.log(response.data);
                    
                } else {
                    throw new Error(response.data?.message || 'Xác nhận thanh toán thất bại');
                }
            } catch (error) {
                console.error('Error confirming payment:', error);
                setError(error.message || 'Có lỗi xảy ra khi xác nhận thanh toán');
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentStatus();
    }, []);

    const handleBackToCourses = () => {
        navigate('/courses');
    };

    const handleGoToCourse = () => {
        if (paymentDetails && paymentDetails.courseId) {
            navigate(`/learning/${paymentDetails.courseId}`);
        } else {
            navigate('/courses');
        }
    };

    if (loading) {
        return (
            <div className="payment-result-container">
                <div className="payment-result-card loading">
                    <div className="spinner"></div>
                    <h2>Đang xác nhận thanh toán...</h2>
                    <p>Vui lòng chờ trong giây lát</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="payment-result-container">
                <div className="payment-result-card error">
                    <div className="error-icon">❌</div>
                    <h2>Thanh toán thất bại</h2>
                    <p>{error}</p>
                    <button className="payment-action-btn" onClick={handleBackToCourses}>
                        <ArrowLeft size={16} />
                        Quay lại danh sách khóa học
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-result-container">
            <div className="payment-result-card success">
                <div className="success-icon">
                    <Check size={40} color="#fff" />
                </div>
                <h2>Thanh toán thành công!</h2>
                
                {paymentDetails && (
                    <div className="payment-details">
                        <div className="payment-info-row">
                            <span>Mã giao dịch:</span>
                            <span>{paymentDetails.paymentId || 'N/A'}</span>
                        </div>
                        <div className="payment-info-row">
                            <span>Tên khóa học:</span>
                            <span>{paymentDetails.course?.name || 'N/A'}</span>
                        </div>
                        <div className="payment-info-row">
                            <span>Số tiền:</span>
                            <span>{paymentDetails.totalPrice?.toLocaleString('vi-VN')} {paymentDetails.currency || 'USD'}</span>
                        </div>
                        <div className="payment-info-row">
                            <span>Thời gian:</span>
                            <span>{new Date(paymentDetails.createTime || Date.now()).toLocaleString('vi-VN')}</span>
                        </div>
                        <div className="payment-info-row">
                            <span>Tài khoản thanh toán:</span>
                            <span>{paymentDetails.email || 'N/A'}</span>
                        </div>
                        <div className="payment-info-row">
                            <span>Sinh viên đăng ký:</span>
                            <span>{paymentDetails.student?.email || 'N/A'}</span>
                        </div>
                    </div>
                )}

                <div className="payment-actions">
                    <button className="payment-action-btn primary" onClick={handleGoToCourse}>
                        Vào học ngay
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

export default PaymentSuccess; 