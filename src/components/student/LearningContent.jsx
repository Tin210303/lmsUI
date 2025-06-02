import React, { useState, useEffect, useRef } from 'react';
import { FileText, Video, Image, Download } from 'lucide-react';
import axios from 'axios';
import { Document, Page } from '@react-pdf/renderer';
import { renderAsync } from 'docx-preview';
import * as XLSX from 'xlsx';
import { API_BASE_URL } from '../../services/apiService';

const LearningContent = ({ currentLesson, onVideoEnded, onDownload }) => {
    const token = localStorage.getItem('authToken');
    const [mediaUrl, setMediaUrl] = useState(null);
    const [fileContent, setFileContent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fileType, setFileType] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const videoRef = useRef(null);
    const [lastTime, setLastTime] = useState(0);
    const allowUpdateTime = useRef(true);

    useEffect(() => {
        if (currentLesson) {
            if (currentLesson.type === 'video' || currentLesson.type === 'image') {
                fetchMedia();
            } else if (currentLesson.type === 'file') {
                fetchFileContent();
            }
        }
        // Cleanup function to revoke object URL when component unmounts or lesson changes
        return () => {
            if (mediaUrl) {
                URL.revokeObjectURL(mediaUrl);
            }
        };
    }, [currentLesson]);

    useEffect(() => {
        const video = videoRef.current;
    
        const handleTimeUpdate = () => {
            if (!video) return;
        
            if (allowUpdateTime.current && video.currentTime > lastTime) {
                setLastTime(video.currentTime);
            }
        
            // Nếu tua quá giới hạn đã xem → trả về
            if (video.currentTime > lastTime + 0.1) {
                allowUpdateTime.current = false;
                video.currentTime = lastTime;
            }
        };
    
        const handleSeeking = () => {
            if (!video) return;
        
            // Nếu người dùng cố gắng tua vượt
            if (video.currentTime > lastTime + 0.1) {
                allowUpdateTime.current = false;
                video.currentTime = lastTime;
            }
        };
    
        const handleSeeked = () => {
            allowUpdateTime.current = true;
        };
    
        if (video) {
            video.addEventListener('timeupdate', handleTimeUpdate);
            video.addEventListener('seeking', handleSeeking);
            video.addEventListener('seeked', handleSeeked);
        }
    
        return () => {
            if (video) {
                video.removeEventListener('timeupdate', handleTimeUpdate);
                video.removeEventListener('seeking', handleSeeking);
                video.removeEventListener('seeked', handleSeeked);
            }
        };
      }, [lastTime]);
    if (!currentLesson) {
        return (
            <div className="content-placeholder">
                <h3>Vui lòng chọn một bài học để xem nội dung</h3>
            </div>
        );
    }


    const getFileExtension = (filename) => {
        return filename.split('.').pop().toLowerCase();
    };

    const getContentUrl = (type, path) => {
        return `${API_BASE_URL}${path}`;
    };

    const getMimeType = (extension) => {
        switch (extension.toLowerCase()) {
            case 'pdf':
                return 'application/pdf';
            case 'doc':
                return 'application/msword';
            case 'docx':
                return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            case 'xls':
                return 'application/vnd.ms-excel';
            case 'xlsx':
                return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            case 'txt':
                return 'text/plain';
            case 'png':
                return 'image/png';
            case 'jpg':
            case 'jpeg':
                return 'image/jpeg';
            default:
                return 'application/octet-stream';
        }
    };

    const fetchMedia = async () => {
        try {
            setLoading(true);
            const contentUrl = getContentUrl(currentLesson.type, currentLesson.path);
            console.log('Fetching from URL:', contentUrl);
            
            const response = await axios({
                method: 'GET',
                url: contentUrl,
                responseType: 'blob',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                withCredentials: false
            });
            
            const url = URL.createObjectURL(response.data);
            setMediaUrl(url);
        } catch (error) {
            console.error('Error fetching media:', error);
            setMediaUrl(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchFileContent = async () => {
        try {
            setLoading(true);
            const contentUrl = getContentUrl(currentLesson.type, currentLesson.path);
            const extension = getFileExtension(currentLesson.path);
            setFileType(extension);

            const response = await axios({
                method: 'GET',
                url: contentUrl,
                responseType: 'blob',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                withCredentials: false
            });

            const blob = response.data;

            switch (extension) {
                case 'txt':
                    const text = await blob.text();
                    setFileContent(text);
                    break;

                case 'docx':
                    const container = document.createElement('div');
                    await renderAsync(blob, container);
                    setFileContent(container.innerHTML);
                    break;

                case 'xlsx':
                case 'xls':
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, { type: 'array' });
                        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                        const htmlTable = XLSX.utils.sheet_to_html(firstSheet);
                        setFileContent(htmlTable);
                    };
                    reader.readAsArrayBuffer(blob);
                    break;

                case 'pdf':
                    const url = URL.createObjectURL(blob);
                    setFileContent(url);
                    break;

                default:
                    // For unsupported file types, we'll just show a download option
                    setFileContent(null);
                    break;
            }
        } catch (error) {
            console.error('Error fetching file content:', error);
            setFileContent(null);
        } finally {
            setLoading(false);
        }
    };

    const handleFileDownload = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const contentUrl = getContentUrl(currentLesson.type, currentLesson.path);
            const extension = getFileExtension(currentLesson.path);
            
            const response = await axios({
                method: 'GET',
                url: contentUrl,
                responseType: 'blob',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                withCredentials: false
            });

            // Tạo blob với đúng MIME type
            const mimeType = getMimeType(extension);
            const blob = new Blob([response.data], { type: mimeType });
            const url = window.URL.createObjectURL(blob);

            // Tạo tên file với đúng extension
            let fileName = currentLesson.name || 'download';
            if (!fileName.toLowerCase().endsWith(`.${extension}`)) {
                fileName = `${fileName}.${extension}`;
            }

            // Tạo link tải xuống
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);
        } catch (error) {
            console.error('Error downloading file:', error);
            alert('Có lỗi khi tải file. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const renderFileContent = () => {
        if (loading) {
            return (
                <div className="loading-placeholder">
                    <h3>Đang tải nội dung...</h3>
                </div>
            );
        }

        if (!fileContent) {
            return (
                <div className="file-preview-placeholder">
                    <FileText size={48} />
                    <p>Không thể hiển thị trước nội dung file này</p>
                    <p>Vui lòng tải xuống để xem</p>
                </div>
            );
        }

        switch (fileType) {
            case 'txt':
                return (
                    <div className="file-content-text">
                        <pre>{fileContent}</pre>
                    </div>
                );

            case 'docx':
                return (
                    <div 
                        className="file-content-docx"
                        dangerouslySetInnerHTML={{ __html: fileContent }}
                    />
                );

            case 'xlsx':
            case 'xls':
                return (
                    <div 
                        className="file-content-excel"
                        dangerouslySetInnerHTML={{ __html: fileContent }}
                    />
                );

            case 'pdf':
                return (
                    <div className="file-content-pdf">
                        <iframe
                            src={fileContent}
                            title="PDF Viewer"
                            width="100%"
                            height="600px"
                            style={{ border: 'none' }}
                        />
                    </div>
                );

            default:
                return (
                    <div className="file-preview-placeholder">
                        <FileText size={48} />
                        <p>Định dạng file không được hỗ trợ xem trước</p>
                        <p>Vui lòng tải xuống để xem</p>
                    </div>
                );
        }
    };

    const renderContent = () => {
        if (!currentLesson.path) {
            return (
                <div className="content-placeholder">
                    <h3>Không tìm thấy nội dung bài học</h3>
                </div>
            );
        }

        switch (currentLesson.type?.toLowerCase()) {
            case 'video':
                return (
                    <div className="video-wrapper">
                        {mediaUrl ? (
                            <video 
                                ref={videoRef}
                                controls 
                                className="video-player"
                                key={mediaUrl}
                                onEnded={(e) => {
                                    console.log('Video ended event triggered');
                                    if (typeof onVideoEnded === 'function') {
                                        onVideoEnded();
                                    } else {
                                        console.error('onVideoEnded is not a function or not provided');
                                    }
                                }}
                            >
                                <source 
                                    src={mediaUrl}
                                    type="video/mp4"
                                />
                                Your browser does not support the video tag.
                            </video>
                        ) : (
                            <div className="loading-placeholder">
                                <h3>Đang tải video...</h3>
                            </div>
                        )}
                    </div>
                );
            
            case 'image':
                return (
                    <div className="image-wrapper">
                        {mediaUrl ? (
                            <img 
                                src={mediaUrl}
                                alt={currentLesson.name}
                                className="content-image"
                            />
                        ) : (
                            <div className="loading-placeholder">
                                <h3>Đang tải hình ảnh...</h3>
                            </div>
                        )}
                    </div>
                );
            
            case 'file':
                return (
                    <div className="file-wrapper">
                        <div className="file-header">
                            <div className="learning-file-info">
                                <FileText size={24} />
                                <h3>{currentLesson.name}</h3>
                            </div>
                            <button 
                                className="download-button"
                                onClick={handleFileDownload}
                                disabled={loading}
                            >
                                <Download size={20} />
                                Tải xuống
                            </button>
                        </div>
                        <div className="file-preview">
                            {renderFileContent()}
                        </div>
                    </div>
                );
            
            default:
                return (
                    <div className="content-placeholder">
                        <h3>Không hỗ trợ định dạng này</h3>
                    </div>
                );
        }
    };

    return (
        <div className="learning-content-wrapper">
            <div className="content-body">
                {renderContent()}
            </div>
            <div className="content-header">
                <h2>{currentLesson.name}</h2>
            </div>
        </div>
    );
};

export default LearningContent; 