import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, XCircle, Info } from 'lucide-react';

const Alert = ({ type = 'info', title, message, onClose, duration = 5000 }) => {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle2 className="alert-icon" />;
            case 'error':
                return <XCircle className="alert-icon" />;
            case 'warning':
                return <AlertCircle className="alert-icon" />;
            default:
                return <Info className="alert-icon" />;
        }
    };

    return (
        <div className={`alert alert-${type}`}>
            {getIcon()}
            <div className="alert-content">
                {title && <div className="alert-title">{title}</div>}
                <div className="alert-message">{message}</div>
            </div>
            <button className="alert-close" onClick={onClose}>×</button>
        </div>
    );
};

export default Alert; 