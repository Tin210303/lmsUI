import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { renderAsync } from 'docx-preview';
import * as XLSX from 'xlsx';
import { 
    Search, 
    ChevronDown, 
    Download, 
    ArrowLeft, 
    Check,
    X,
    Filter,
    FileText,
    AlertTriangle
} from 'lucide-react';
import { 
    GET_MAJOR_API, 
    GET_MAJOR_DOCUMENTS, 
    API_BASE_URL,
    SEARCH_DOCUMENTS_API
} from '../../services/apiService';
import '../../assets/css/manage-document.css';

const UnsupportedPreview = ({ title }) => {
    return (
        <div className="preview-not-available">
            <FileText size={48} color="#1890ff" />
            <h3>{title}</h3>
            <p>Định dạng file không được hỗ trợ xem trước.</p>
        </div>
    );
};

const LoadingPreview = () => {
    return (
        <div className="preview-loading">
            <div className="loading-spinner"></div>
            <p>Đang tải nội dung...</p>
        </div>
    );
};

const ErrorPreview = ({ error }) => {
    return (
        <div className="preview-not-available">
            <AlertTriangle size={48} color="#faad14" />
            <h3>Không thể xem trước tài liệu</h3>
            <p>{error}</p>
        </div>
    );
};

const MajorDocuments = () => {
    const { majorId } = useParams();
    const navigate = useNavigate();
    const [major, setMajor] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('newest');
    const [searching, setSearching] = useState(false);
    
    // State for dropdown menus
    const [showSortOptions, setShowSortOptions] = useState(false);
    
    // Refs for dropdown containers
    const sortDropdownRef = useRef(null);
    const searchTimeoutRef = useRef(null);
    
    // Pagination states
    const [pageSize, setPageSize] = useState(5);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    
    // Preview document modal states
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewDocument, setPreviewDocument] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState('');
    const [previewContent, setPreviewContent] = useState(null);
    const [previewType, setPreviewType] = useState(null);

    useEffect(() => {
        fetchMajorData();
        if (searchTerm.trim() === '') {
            fetchDocuments();
        } else {
            searchDocuments(searchTerm);
        }
    }, [majorId, currentPage, pageSize]);
    
    // Thêm useEffect mới để xử lý debounce khi nhập vào ô tìm kiếm
    useEffect(() => {
        // Clear timeout cũ nếu có
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Nếu searchTerm không rỗng, sau 500ms sẽ gọi API tìm kiếm
        if (searchTerm.trim() !== '') {
            searchTimeoutRef.current = setTimeout(() => {
                searchDocuments(searchTerm);
            }, 500);
        } else {
            // Nếu searchTerm rỗng, gọi lại fetchDocuments để tải lại danh sách ban đầu
            searchTimeoutRef.current = setTimeout(() => {
                setCurrentPage(0); // Reset về trang đầu tiên
                fetchDocuments();
            }, 300);
        }

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchTerm, majorId, pageSize]);
    
    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
                setShowSortOptions(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    const toggleSortOptions = () => {
        setShowSortOptions(!showSortOptions);
    };
    
    const handleSortOptionSelect = (option) => {
        setSortOption(option);
        setShowSortOptions(false);
    };
    
    const fetchMajorData = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            // Get major details
            const response = await axios.get(GET_MAJOR_API, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data && response.data.code === 0) {
                const majorData = (response.data.result || []).find(m => m.id.toString() === majorId);
                setMajor(majorData);
                if (!majorData) {
                    throw new Error('Major not found');
                }
            } else {
                throw new Error(response.data?.message || 'Failed to fetch major data');
            }
        } catch (err) {
            console.error('Error fetching major data:', err);
            setError('Không thể tải dữ liệu chuyên ngành. Vui lòng thử lại sau.');
        }
    };
    
    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            // Get documents for this major
            const response = await axios.get(GET_MAJOR_DOCUMENTS, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    majorId: majorId,
                    pageSize: pageSize,
                    pageNumber: currentPage
                }
            });
            
            if (response.data && response.data.code === 0) {
                const documentData = response.data.result;
                setDocuments(documentData.content || []);
                setTotalPages(documentData.page.totalPages);
                setTotalElements(documentData.page.totalElements);
            } else {
                throw new Error(response.data?.message || 'Failed to fetch documents');
            }
        } catch (err) {
            console.error('Error fetching documents:', err);
            setError('Không thể tải danh sách tài liệu. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleBackClick = () => {
        navigate('/documents');
    };
    
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
            
            // Scroll to top of document list
            const documentList = document.querySelector('.document-list');
            if (documentList) {
                window.scrollTo({
                    top: documentList.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        }
    };
    
    // Calculate visible page numbers for pagination
    const getPageNumbers = () => {
        const visiblePages = 5; // Số trang hiển thị tối đa
        let startPage = Math.max(0, currentPage - Math.floor(visiblePages / 2));
        let endPage = Math.min(totalPages - 1, startPage + visiblePages - 1);
        
        // Điều chỉnh lại startPage nếu endPage đã chạm đến giới hạn
        if (endPage - startPage + 1 < visiblePages) {
            startPage = Math.max(0, endPage - visiblePages + 1);
        }
        
        return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    };
    
    // Sort and filter documents
    const getSortedDocuments = () => {
        return documents;
    };
    
    const filteredDocuments = getSortedDocuments();
    
    // Format date function
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    // Hàm xử lý khi click vào xem trước tài liệu
    const handlePreviewClick = async (doc) => {
        console.log('Mở preview cho document:', doc.id, doc.title, 'path:', doc.path);
        setPreviewDocument(doc);
        setShowPreviewModal(true);
        setPreviewLoading(true);
        setPreviewContent(null);
        setPreviewError('');
        setPreviewType(null);
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Không tìm thấy token xác thực');
            }
            
            // Kiểm tra token
            console.log('Sử dụng token để lấy file, độ dài token:', token.length);
            
            // Tạo URL đúng từ path của document
            const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
            let fileUrl;
            
            // Sử dụng path trực tiếp thay vì documentId
            if (doc.path) {
                // Đảm bảo path bắt đầu bằng dấu /
                const path = doc.path.startsWith('/') ? doc.path : `/${doc.path}`;
                fileUrl = `${baseUrl}${path}`;
            } else {
                // Fallback về cách cũ nếu không có path
                fileUrl = `${baseUrl}/api/documents/download?documentId=${doc.id}`;
            }
            
            const fileType = getFileType(doc.fileName);
            setPreviewType(fileType);
            
            console.log('Tải file từ URL:', fileUrl);
            console.log('Loại file:', fileType);
            
            try {
                console.log('Bắt đầu gửi request với headers:', {
                    'Authorization': `Bearer ${token.substring(0, 10)}...`,
                    'responseType': 'blob',
                    'timeout': 30000
                });
                
                const response = await axios({
                    method: 'GET',
                    url: fileUrl,
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    },
                    responseType: 'blob',
                    timeout: 30000,
                    withCredentials: false // Tắt withCredentials để tránh vấn đề CORS
                });
                
                const blob = response.data;
                console.log('Nhận response blob:', blob.size, 'bytes, type:', blob.type);
                
                if (blob.size === 0) {
                    throw new Error('File trống hoặc không tồn tại');
                }
                
                // Xử lý theo loại file
                switch (fileType) {
                    case 'text':
                        try {
                            const text = await blob.text();
                            console.log('Đã chuyển đổi text, độ dài:', text.length);
                            setPreviewContent(text);
                        } catch (error) {
                            console.error('Lỗi khi đọc text:', error);
                            throw new Error('Không thể đọc nội dung file text');
                        }
                        break;
                        
                    case 'word':
                        try {
                            console.log('Đang xử lý file Word...');
                            const container = document.createElement('div');
                            await renderAsync(blob, container);
                            const htmlContent = container.innerHTML;
                            console.log('Xử lý Word thành công, độ dài HTML:', htmlContent.length);
                            setPreviewContent(htmlContent);
                        } catch (error) {
                            console.error('Lỗi xử lý Word:', error);
                            throw new Error('Không thể xử lý file Word');
                        }
                        break;
                        
                    case 'excel':
                        try {
                            console.log('Đang xử lý file Excel...');
                            // Đọc file Excel trực tiếp thay vì sử dụng FileReader
                            const data = new Uint8Array(await blob.arrayBuffer());
                            const workbook = XLSX.read(data, { type: 'array' });
                            
                            if (workbook.SheetNames.length === 0) {
                                throw new Error('Không tìm thấy sheet nào trong file Excel');
                            }
                            
                            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                            const htmlTable = XLSX.utils.sheet_to_html(firstSheet);
                            console.log('Xử lý Excel thành công, độ dài HTML:', htmlTable.length);
                            
                            setPreviewContent(htmlTable);
                        } catch (error) {
                            console.error('Lỗi xử lý Excel:', error);
                            throw new Error('Không thể xử lý file Excel');
                        }
                        break;
                        
                    case 'pdf':
                        try {
                            const url = URL.createObjectURL(blob);
                            console.log('PDF URL đã được tạo:', url);
                            setPreviewContent(url);
                        } catch (error) {
                            console.error('Lỗi tạo URL cho PDF:', error);
                            throw new Error('Không thể tạo URL cho file PDF');
                        }
                        break;
                        
                    default:
                        throw new Error('Định dạng file không được hỗ trợ xem trước');
                }
            } catch (axiosError) {
                // Xử lý lỗi Axios chi tiết hơn
                console.error('Lỗi Axios:', axiosError);
                
                if (axiosError.response) {
                    // Server trả về response với status code nằm ngoài phạm vi 2xx
                    console.error('Lỗi từ server:', axiosError.response.status, axiosError.response.data);
                    throw new Error(`Lỗi từ server: ${axiosError.response.status} - ${axiosError.response.data?.message || 'Không có chi tiết'}`);
                } else if (axiosError.request) {
                    // Request được gửi nhưng không nhận được response
                    console.error('Không nhận được phản hồi từ server:', axiosError.request);
                    
                    // Kiểm tra xem server có đang chạy không
                    try {
                        // Ping API server để kiểm tra kết nối
                        await axios.get(`${API_BASE_URL}/actuator/health`, { timeout: 5000 });
                        throw new Error('Server đang chạy nhưng không phản hồi yêu cầu tải file - Có thể do quyền truy cập hoặc đường dẫn không đúng');
                    } catch (pingError) {
                        throw new Error('Không thể kết nối đến server - Vui lòng kiểm tra xem server có đang chạy không');
                    }
                } else {
                    // Có lỗi khi thiết lập request
                    throw new Error(`Lỗi khi gửi yêu cầu: ${axiosError.message}`);
                }
            }
        } catch (error) {
            console.error('Lỗi xem trước file:', error);
            
            // Kiểm tra lỗi cụ thể và hiển thị thông báo phù hợp
            let errorMessage = error.message;
            
            // Nếu là lỗi mạng, đề xuất kiểm tra kết nối
            if (error.message.includes('Network Error')) {
                errorMessage = 'Lỗi kết nối mạng - Vui lòng kiểm tra kết nối internet hoặc VPN của bạn';
                console.error('Chi tiết lỗi mạng:', error);
            }
            // Nếu là lỗi token hết hạn/không hợp lệ
            else if (error.response && error.response.status === 401) {
                errorMessage = 'Phiên đăng nhập đã hết hạn - Vui lòng đăng nhập lại';
                // Có thể thêm chuyển hướng đến trang đăng nhập ở đây
            }
            
            setPreviewError(errorMessage);
        } finally {
            setPreviewLoading(false);
        }
    };
    
    // Đóng modal xem trước và dọn dẹp tài nguyên
    const closePreviewModal = () => {
        if (previewContent && previewType === 'pdf') {
            URL.revokeObjectURL(previewContent);
            console.log('Đã giải phóng URL object');
        }
        
        setShowPreviewModal(false);
        setPreviewDocument(null);
        setPreviewError('');
        setPreviewLoading(false);
        setPreviewContent(null);
        setPreviewType(null);
    };
    
    // Hàm để tải xuống tài liệu
    const handleDownloadDocument = (doc) => {
        try {
            console.log('Bắt đầu tải xuống tài liệu:', doc.id, doc.title, 'path:', doc.path);
            
            const token = localStorage.getItem('authToken');
            if (!token) {
                alert('Không tìm thấy token xác thực');
                return;
            }
            
            // Tạo URL đúng từ path của document
            const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
            let downloadUrl;
            
            // Sử dụng path trực tiếp thay vì documentId
            if (doc.path) {
                // Đảm bảo path bắt đầu bằng dấu /
                const path = doc.path.startsWith('/') ? doc.path : `/${doc.path}`;
                downloadUrl = `${baseUrl}${path}`;
            } else {
                // Fallback về cách cũ nếu không có path
                downloadUrl = `${baseUrl}/api/documents/download?documentId=${doc.id}`;
            }
            
            console.log('Tải xuống từ URL:', downloadUrl);
            
            // Thêm header Authorization vào request
            fetch(downloadUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                },
                mode: 'cors', // Sử dụng CORS
                credentials: 'omit' // Không gửi cookie
            })
            .then(response => {
                if (!response.ok) {
                    const error = new Error('Lỗi khi tải tài liệu: ' + response.status);
                    error.status = response.status;
                    throw error;
                }
                return response.blob();
            })
            .then(blob => {
                if (blob.size === 0) {
                    alert('File trống hoặc không tồn tại');
                    return;
                }
                
                const url = window.URL.createObjectURL(blob);
                
                // Tạo một thẻ a ẩn để tải xuống
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', doc.fileName || doc.title);
                link.setAttribute('target', '_blank');
                document.body.appendChild(link);
                link.click();
                
                // Dọn dẹp
                setTimeout(() => {
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(link);
                }, 100);
                
                console.log('Tải xuống thành công');
            })
            .catch(error => {
                console.error('Lỗi khi tải xuống:', error);
                
                let errorMessage = 'Không thể tải xuống tài liệu.';
                
                if (error.status === 401) {
                    errorMessage += ' Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
                } else if (error.message.includes('Network Error')) {
                    errorMessage += ' Kiểm tra kết nối mạng của bạn.';
                } else {
                    errorMessage += ' Vui lòng thử lại sau.';
                }
                
                alert(errorMessage);
            });
        } catch (err) {
            console.error('Lỗi tải xuống tài liệu:', err);
            alert('Không thể tải xuống tài liệu. Vui lòng thử lại sau.');
        }
    };
    
    // Component tạo nội dung xem trước trong modal
    const renderPreviewContent = () => {
        console.log('renderPreviewContent - loading:', previewLoading, 'error:', previewError ? true : false, 'content:', previewContent ? 'có' : 'không', 'type:', previewType);
        
        if (previewLoading) {
            return <LoadingPreview />;
        }
        
        if (previewError) {
            return <ErrorPreview error={previewError} />;
        }
        
        if (!previewContent) {
            return (
                <div className="preview-not-available">
                    <FileText size={48} />
                    <p>Không thể xem trước nội dung file này</p>
                    <p>Vui lòng tải xuống để xem</p>
                </div>
            );
        }
        
        // Hiển thị nội dung theo loại file
        switch (previewType) {
            case 'text':
                return (
                    <div className="text-preview">
                        <pre className="text-content">{previewContent}</pre>
                    </div>
                );
                
            case 'word':
                return (
                    <div 
                        className="word-preview-content"
                        dangerouslySetInnerHTML={{ __html: previewContent }}
                    />
                );
                
            case 'excel':
                return (
                    <div 
                        className="excel-preview-content"
                        dangerouslySetInnerHTML={{ __html: previewContent }}
                    />
                );
                
            case 'pdf':
                return (
                    <div className="pdf-preview">
                        <iframe
                            src={previewContent}
                            title="PDF Viewer"
                            width="100%"
                            height="100%"
                            style={{border: 'none'}}
                        />
                    </div>
                );
                
            default:
                return <UnsupportedPreview title={previewDocument ? previewDocument.title : 'Unknown'} />;
        }
    };
    
    // Render modal xem trước
    const renderPreviewModal = () => {
        if (!showPreviewModal || !previewDocument) return null;
        
        return (
            <div className="file-preview-modal-overlay">
                <div className="file-preview-modal">
                    <div className="file-preview-modal-header">
                        <h3>{previewDocument.title}</h3>
                        <div className="file-preview-modal-actions">
                            <button 
                                className="file-download-button"
                                onClick={() => handleDownloadDocument(previewDocument)}
                            >
                                <Download size={18} />
                                <span>Tải xuống</span>
                            </button>
                            <button className="file-close-button" onClick={closePreviewModal}>
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="file-preview-modal-content">
                        {renderPreviewContent()}
                    </div>
                </div>
            </div>
        );
    };
    
    // Xác định loại file dựa vào phần mở rộng
    const getFileType = (fileName) => {
        if (!fileName) return 'unknown';
        
        const extension = fileName.split('.').pop().toLowerCase();
        
        if (['pdf'].includes(extension)) {
            return 'pdf';
        } else if (['doc', 'docx'].includes(extension)) {
            return 'word';
        } else if (['xls', 'xlsx', 'csv'].includes(extension)) {
            return 'excel';
        } else if (['txt', 'text'].includes(extension)) {
            return 'text';
        } else {
            return 'unknown';
        }
    };
    
    // Thêm safety timeout để tắt loading nếu có lỗi không xác định
    useEffect(() => {
        let timeout;
        if (showPreviewModal && previewLoading) {
            // Đảm bảo loading không kéo dài quá 15 giây
            timeout = setTimeout(() => {
                setPreviewLoading(false);
                setPreviewError('Tải tài liệu quá thời gian. Vui lòng tải xuống để xem.');
            }, 15000);
        }
        
        return () => {
            if (timeout) clearTimeout(timeout);
        };
    }, [showPreviewModal, previewLoading]);
    
    // Hàm tìm kiếm tài liệu thông qua API
    const searchDocuments = async (keyword) => {
        try {
            setSearching(true);
            setLoading(true);
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Gọi API tìm kiếm với các tham số yêu cầu
            const response = await axios.get(SEARCH_DOCUMENTS_API, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    title: keyword,
                    majorId: majorId,
                    pageSize: pageSize,
                    pageNumber: currentPage
                }
            });

            if (response.data && response.data.code === 0) {
                const documentData = response.data.result;
                setDocuments(documentData.content || []);
                setTotalPages(documentData.page.totalPages);
                setTotalElements(documentData.page.totalElements);
            } else {
                throw new Error(response.data?.message || 'Failed to search documents');
            }
        } catch (err) {
            console.error('Lỗi khi tìm kiếm tài liệu:', err);
            setError('Không thể tìm kiếm tài liệu. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
            setSearching(false);
        }
    };
    
    const handleSearchTermChange = (e) => {
        const newSearchTerm = e.target.value;
        
        // Reset trang về 0 khi bắt đầu tìm kiếm mới hoặc xóa hết từ khóa
        if ((searchTerm.trim() === '' && newSearchTerm.trim() !== '') || 
            (searchTerm.trim() !== '' && newSearchTerm.trim() === '')) {
            setCurrentPage(0);
        }
        
        setSearchTerm(newSearchTerm);
    };
    
    if (loading && documents.length === 0) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }
    
    if (error && documents.length === 0) {
        return (
            <div className="error-container">
                <p>{error}</p>
                <button onClick={fetchDocuments} className="retry-button">Thử lại</button>
                <button onClick={handleBackClick} className="document-back-button">Quay lại</button>
            </div>
        );
    }
    
    if (!major) {
        return (
            <div className="error-container">
                <p>Không tìm thấy chuyên ngành.</p>
                <button onClick={handleBackClick} className="document-back-button">Quay lại</button>
            </div>
        );
    }
    
    return (
        <div className="manage-document-container">
            {renderPreviewModal()}
            
            <div className="document-header">
                <div className="header-title">
                    <button onClick={handleBackClick} className="document-back-button">
                        Kho tài liệu
                    </button>
                    &gt;
                    <span>{major.name}</span>
                </div>
                <div className="header-actions">
                    <div className="student-document-search-container">
                        <Search size={20} className="student-document-search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm tài liệu..."
                            value={searchTerm}
                            onChange={handleSearchTermChange}
                            className="student-document-search-input"
                        />
                        {searching && <div className="student-document-search-spinner"></div>}
                    </div>
                </div>
            </div>
            
            <div className="filter-container">
                <div className="filter-item">
                    <Filter size={18} className="filter-icon" />
                    <span className="filter-label">Sắp xếp:</span>
                    <div className="filter-dropdown date-filter" ref={sortDropdownRef}>
                        <button className="filter-button" onClick={toggleSortOptions}>
                            {sortOption === 'newest' ? 'Ngày đăng mới nhất' : 
                             sortOption === 'oldest' ? 'Ngày đăng cũ nhất' : 
                             'Tên tài liệu'}
                            <ChevronDown size={16} />
                        </button>
                        <div className={`filter-options ${showSortOptions ? 'show' : ''}`}>
                            <div 
                                className={`filter-option ${sortOption === 'newest' ? 'active' : ''}`}
                                onClick={() => handleSortOptionSelect('newest')}
                            >
                                Ngày đăng mới nhất
                            </div>
                            <div 
                                className={`filter-option ${sortOption === 'oldest' ? 'active' : ''}`}
                                onClick={() => handleSortOptionSelect('oldest')}
                            >
                                Ngày đăng cũ nhất
                            </div>
                            <div 
                                className={`filter-option ${sortOption === 'name' ? 'active' : ''}`}
                                onClick={() => handleSortOptionSelect('name')}
                            >
                                Tên tài liệu
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="document-list">
                <div className="document-table-header">
                    <div className="document-name-column">Tên tài liệu</div>
                    <div className="uploader-column">Người đăng</div>
                    <div className="date-column">Ngày đăng</div>
                    <div className="document-actions-column">Thao tác</div>
                </div>
                
                {loading && (
                    <div className="loading-overlay">
                        <div className="loading-spinner"></div>
                    </div>
                )}
                
                {filteredDocuments.length > 0 ? (
                    filteredDocuments.map(document => {
                        return (
                            <div 
                                key={document.id} 
                                className="document-item"
                            >
                                <div className="document-name-column" onClick={() => handlePreviewClick(document)}>
                                    <div className="document-name">{document.title}</div>
                                    <div className="document-filename">{document.fileName}</div>
                                </div>
                                <div className="uploader-column">
                                    {document.object ? `GV. ${document.object.fullName}` : 'Không xác định'}
                                </div>
                                <div className="date-column">{formatDate(document.createdAt)}</div>
                                <div className="document-actions-column">
                                    <button 
                                        className="document-action-button document-download-button"
                                        onClick={() => handleDownloadDocument(document)}
                                    >
                                        <Download size={18} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="no-documents">
                        <p>{searchTerm.trim() !== '' ? `Không tìm thấy tài liệu nào phù hợp với từ khóa "${searchTerm}".` : 'Không tìm thấy tài liệu nào phù hợp.'}</p>
                    </div>
                )}
            </div>
            
            <div className="document-pagination">
                <div className="pagination-info">Tổng số: {totalElements} files</div>
                {totalPages > 1 && (
                    <div className="pagination-controls">
                        {/* Nút về trang đầu tiên */}
                        <button 
                            className="pagination-button"
                            onClick={() => handlePageChange(0)}
                            disabled={currentPage === 0}
                            title="Trang đầu"
                        >
                            &laquo;
                        </button>
                        
                        {/* Nút quay lại trang trước */}
                        <button 
                            className="pagination-button"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 0}
                            title="Trang trước"
                        >
                            &lsaquo;
                        </button>
                        
                        {/* Hiển thị "..." nếu không phải từ trang đầu tiên */}
                        {getPageNumbers()[0] > 0 && (
                            <>
                            <button
                                    className="pagination-button"
                                    onClick={() => handlePageChange(0)}
                                >
                                    1
                                </button>
                                {getPageNumbers()[0] > 1 && (
                                    <span className="pagination-ellipsis">...</span>
                                )}
                            </>
                        )}
                        
                        {/* Các nút số trang */}
                        {getPageNumbers().map(page => (
                            <button
                                key={page}
                                className={`pagination-button ${currentPage === page ? 'current-page' : ''}`}
                                onClick={() => handlePageChange(page)}
                            >
                                {page + 1}
                            </button>
                        ))}
                        
                        {/* Hiển thị "..." nếu không hiển thị đến trang cuối cùng */}
                        {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
                            <>
                                {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 2 && (
                                    <span className="pagination-ellipsis">...</span>
                                )}
                                <button
                                    className="pagination-button"
                                    onClick={() => handlePageChange(totalPages - 1)}
                                >
                                    {totalPages}
                                </button>
                            </>
                        )}
                        
                        {/* Nút tới trang sau */}
                        <button 
                            className="pagination-button"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages - 1}
                            title="Trang sau"
                        >
                            &rsaquo;
                        </button>
                        
                        {/* Nút tới trang cuối cùng */}
                        <button 
                            className="pagination-button"
                            onClick={() => handlePageChange(totalPages - 1)}
                            disabled={currentPage === totalPages - 1}
                            title="Trang cuối"
                        >
                            &raquo;
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MajorDocuments; 