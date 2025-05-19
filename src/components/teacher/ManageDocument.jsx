import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { renderAsync } from 'docx-preview';
import * as XLSX from 'xlsx';
import Alert from '../common/Alert';
import { 
    Upload, 
    Search, 
    ChevronDown, 
    Eye, 
    EyeOff, 
    Download, 
    Trash2, 
    Edit, 
    ArrowLeft, 
    Check,
    X,
    Filter,
    FileText,
    File,
    AlertTriangle,
    Settings
} from 'lucide-react';
import { 
    GET_MAJOR_API, 
    GET_MAJOR_DOCUMENTS, 
    GET_MY_DOCUMENTS,
    UPLOAD_DOCUMENT, 
    DELETE_DOCUMENT, 
    UPDATE_DOCUMENT_STATUS, 
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

const ManageDocument = () => {
    const { majorId } = useParams();
    const navigate = useNavigate();
    const [major, setMajor] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('newest');
    const [documentFilter, setDocumentFilter] = useState('mine');
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const fileInputRef = useRef(null);
    
    // For handling "My Documents" pagination
    const [myDocsTotal, setMyDocsTotal] = useState(0);
    const [filterMajorId, setFilterMajorId] = useState(null);
    const [myDocumentsCache, setMyDocumentsCache] = useState([]);
    
    // State for dropdown menus
    const [showSortOptions, setShowSortOptions] = useState(false);
    const [showDocumentFilterOptions, setShowDocumentFilterOptions] = useState(false);
    
    // Refs for dropdown containers
    const sortDropdownRef = useRef(null);
    const docFilterDropdownRef = useRef(null);
    
    // Pagination states
    const [pageSize, setPageSize] = useState(5);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    
    // Timer for search debounce
    const searchTimerRef = useRef(null);
    
    // Upload modal states
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadDescription, setUploadDescription] = useState('');
    const [uploadStatus, setUploadStatus] = useState('PUBLIC');
    const [uploadError, setUploadError] = useState('');
    
    // Delete confirmation modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState(null);
    const [deleteError, setDeleteError] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    
    // Visibility confirmation modal states
    const [showVisibilityModal, setShowVisibilityModal] = useState(false);
    const [documentToToggle, setDocumentToToggle] = useState(null);
    const [visibilityError, setVisibilityError] = useState('');
    const [visibilityLoading, setVisibilityLoading] = useState(false);
    
    // Preview document modal states - Cập nhật theo cách tiếp cận của GroupDetailPage
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewDocument, setPreviewDocument] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState('');
    const [previewContent, setPreviewContent] = useState(null); // Nội dung đã được xử lý
    const [previewType, setPreviewType] = useState(null); // Loại file đang xem
    
    // State for bulk actions dropdown
    const [showBulkActions, setShowBulkActions] = useState(false);
    const bulkActionsRef = useRef(null);
    
    // State for bulk delete modal
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [bulkDeleteError, setBulkDeleteError] = useState('');
    const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
    
    // State for bulk visibility modal
    const [showBulkVisibilityModal, setShowBulkVisibilityModal] = useState(false);
    const [bulkVisibilityAction, setBulkVisibilityAction] = useState('');
    const [bulkVisibilityError, setBulkVisibilityError] = useState('');
    const [bulkVisibilityLoading, setBulkVisibilityLoading] = useState(false);

    const [alert, setAlert] = useState(null);

    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
    };
    
    useEffect(() => {
        fetchMajorData();
        if (documentFilter === 'all') {
            if (searchTerm.trim() !== '') {
                searchAllDocumentsWithTerm(searchTerm.trim());
            } else {
                fetchDocuments();
            }
        } else {
            if (searchTerm.trim() !== '') {
                searchMyDocumentsWithTerm(searchTerm.trim());
            } else {
                fetchMyDocuments();
            }
        }
        
        // Store the majorId for filtering
        setFilterMajorId(majorId);
    }, [majorId, currentPage, pageSize, documentFilter]);
    
    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
                setShowSortOptions(false);
            }
            if (docFilterDropdownRef.current && !docFilterDropdownRef.current.contains(event.target)) {
                setShowDocumentFilterOptions(false);
            }
            if (bulkActionsRef.current && !bulkActionsRef.current.contains(event.target)) {
                setShowBulkActions(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    const toggleSortOptions = () => {
        setShowSortOptions(!showSortOptions);
        setShowDocumentFilterOptions(false);
        setShowBulkActions(false);
    };
    
    const toggleDocumentFilterOptions = () => {
        setShowDocumentFilterOptions(!showDocumentFilterOptions);
        setShowSortOptions(false);
        setShowBulkActions(false);
    };
    
    const toggleBulkActions = () => {
        setShowBulkActions(!showBulkActions);
        setShowDocumentFilterOptions(false);
        setShowSortOptions(false);
    };
    
    const handleSortOptionSelect = (option) => {
        setSortOption(option);
        setShowSortOptions(false);
    };
    
    const handleDocumentFilterSelect = (filter) => {
        setDocumentFilter(filter);
        setShowDocumentFilterOptions(false);
        // Reset search term when switching document filter
        setSearchTerm('');
        // Reset to first page when switching document filter
        setCurrentPage(0);
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
                
                // Reset selection when changing page
                setSelectedDocuments([]);
                setSelectAll(false);
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
    
    const fetchMyDocuments = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            // Get all my documents first to calculate total for pagination
            const response = await axios.get(GET_MY_DOCUMENTS, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    pageSize: 1000, // Get a large number to find total count
                    pageNumber: 0
                }
            });
            
            if (response.data && response.data.code === 0) {
                const allDocuments = response.data.result.content || [];
                
                // Filter documents by majorId for this specific major
                const filteredDocs = allDocuments.filter(doc => 
                    doc.major && doc.major.id.toString() === majorId.toString()
                );
                
                // Store total count of filtered documents
                setMyDocsTotal(filteredDocs.length);
                
                // Store all documents for pagination calculation
                setMyDocumentsCache(filteredDocs);
                
                // Reset selection when changing data
                setSelectedDocuments([]);
                setSelectAll(false);
            } else {
                throw new Error(response.data?.message || 'Failed to fetch documents');
            }
        } catch (err) {
            console.error('Error fetching my documents:', err);
            setError('Không thể tải danh sách tài liệu. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };
    
    const handleFileChange = (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            const file = files[0];
            setUploadFile(file);
            
            // Extract filename without extension as default title
            const fileName = file.name;
            const fileTitle = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
            setUploadTitle(fileTitle);
            
            // Open upload modal
            setShowUploadModal(true);
        }
    };
    
    const closeUploadModal = () => {
        setShowUploadModal(false);
        setUploadFile(null);
        setUploadTitle('');
        setUploadDescription('');
        setUploadStatus('PUBLIC');
        setUploadError('');
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    const handleSubmitUpload = async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!uploadTitle.trim()) {
            setUploadError('Vui lòng nhập tiêu đề tài liệu');
            return;
        }
        
        if (!uploadFile) {
            setUploadError('Vui lòng chọn file tài liệu');
            return;
        }
        
        try {
            setLoading(true);
            setUploadError('');
            
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            const formData = new FormData();
            formData.append('file', uploadFile);
            formData.append('majorId', majorId);
            formData.append('title', uploadTitle);
            formData.append('description', uploadDescription);
            formData.append('status', uploadStatus);
            formData.append('type', 'file');
            
            const response = await axios.post(UPLOAD_DOCUMENT, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            if (response.data && response.data.code === 0) {
                // Close modal
                closeUploadModal();
                
                // Refresh document list after upload
                if (documentFilter === 'all') {
                    fetchDocuments();
                } else {
                    // When in "My Documents" view, we need to refresh the entire cache
                    fetchMyDocuments();
                    
                    // Reset to the first page to show the new document
                    setCurrentPage(0);
                }
            } else {
                throw new Error(response.data?.message || 'Failed to upload document');
            }
        } catch (err) {
            console.error('Error uploading document:', err);
            setUploadError('Không thể tải lên tài liệu. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleSelectDocument = (documentId) => {
        setSelectedDocuments(prev => {
            if (prev.includes(documentId)) {
                return prev.filter(id => id !== documentId);
            } else {
                return [...prev, documentId];
            }
        });
    };
    
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedDocuments([]);
        } else {
            setSelectedDocuments(filteredDocuments.map(doc => doc.id));
        }
        setSelectAll(!selectAll);
    };
    
    const handleDeleteButtonClick = (document) => {
        setDocumentToDelete(document);
        setShowDeleteModal(true);
        setDeleteError('');
    };
    
    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setDocumentToDelete(null);
        setDeleteError('');
        setDeleteLoading(false);
    };
    
    const handleDeleteDocument = async () => {
        if (!documentToDelete) {
            return;
        }
        
        try {
            setDeleteLoading(true);
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            // Create FormData object to send documentId
            const formData = new FormData();
            formData.append('documentId', documentToDelete.id);
            
            const response = await axios.delete(DELETE_DOCUMENT, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                data: formData
            });
            
            if (response.data && response.data.code === 0) {
                // Close the modal
                closeDeleteModal();
                
                // Update UI after deletion
                setDocuments(prev => prev.filter(doc => doc.id !== documentToDelete.id));
                setSelectedDocuments(prev => prev.filter(id => id !== documentToDelete.id));
                
                if (documentFilter === 'mine') {
                    // Update the cache for "My Documents" pagination
                    setMyDocumentsCache(prev => prev.filter(doc => doc.id !== documentToDelete.id));
                    
                    // Recalculate total elements and pages
                    const updatedTotal = myDocumentsCache.length - 1;
                    setMyDocsTotal(updatedTotal);
                    setTotalElements(updatedTotal);
                    setTotalPages(Math.ceil(updatedTotal / pageSize));
                    
                    // If we deleted the last item on the current page, go back one page
                    if (documents.length === 1 && currentPage > 0) {
                        setCurrentPage(currentPage - 1);
                    } else {
                        // Apply pagination manually for the updated cache
                        const startIdx = currentPage * pageSize;
                        const endIdx = startIdx + pageSize;
                        const updatedCache = myDocumentsCache.filter(doc => doc.id !== documentToDelete.id);
                        const paginatedDocs = updatedCache.slice(startIdx, endIdx);
                        
                        // If the current page would be empty after deletion but we have more pages before,
                        // go back one page
                        if (paginatedDocs.length === 0 && currentPage > 0) {
                            setCurrentPage(currentPage - 1);
                        }
                    }
                } else {
                    // Refresh if we deleted the last item on the page
                    if (documents.length === 1 && currentPage > 0) {
                        setCurrentPage(currentPage - 1);
                    } else {
                        fetchDocuments();
                    }
                }
            } else {
                throw new Error(response.data?.message || 'Failed to delete document');
            }
        } catch (err) {
            console.error('Error deleting document:', err);
            setDeleteError('Không thể xóa tài liệu. Vui lòng thử lại sau.');
        } finally {
            setDeleteLoading(false);
        }
    };
    
    const handleVisibilityButtonClick = (document) => {
        setDocumentToToggle(document);
        setShowVisibilityModal(true);
        setVisibilityError('');
    };
    
    const closeVisibilityModal = () => {
        setShowVisibilityModal(false);
        setDocumentToToggle(null);
        setVisibilityError('');
        setVisibilityLoading(false);
    };
    
    const handleToggleVisibility = async () => {
        if (!documentToToggle) {
            return;
        }
        
        try {
            setVisibilityLoading(true);
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            // Toggle status (PUBLIC <-> PRIVATE)
            const newStatus = documentToToggle.status === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC';
            
            // Create FormData object to send documentId and status
            const formData = new FormData();
            formData.append('documentId', documentToToggle.id);
            formData.append('status', newStatus);
            
            const response = await axios.put(UPDATE_DOCUMENT_STATUS, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            if (response.data && response.data.code === 0) {
                // Close modal
                closeVisibilityModal();
                
                if (documentFilter === 'mine') {
                    // Update both the documents list and cache for "My Documents" with the new status
                    setDocuments(prev => prev.map(doc => {
                        if (doc.id === documentToToggle.id) {
                            return {
                                ...doc,
                                status: newStatus
                            };
                        }
                        return doc;
                    }));
                    
                    setMyDocumentsCache(prev => prev.map(doc => {
                        if (doc.id === documentToToggle.id) {
                            return {
                                ...doc,
                                status: newStatus
                            };
                        }
                        return doc;
                    }));
                } else {
                    // Update UI after status change for "All Documents"
                    setDocuments(prev => prev.map(doc => {
                        if (doc.id === documentToToggle.id) {
                            return {
                                ...doc,
                                status: newStatus
                            };
                        }
                        return doc;
                    }));
                }
            } else {
                throw new Error(response.data?.message || 'Failed to update document status');
            }
        } catch (err) {
            console.error('Error updating document status:', err);
            setVisibilityError('Không thể cập nhật trạng thái tài liệu. Vui lòng thử lại sau.');
        } finally {
            setVisibilityLoading(false);
        }
    };
    
    const handleBackClick = () => {
        navigate('/teacher/documents');
    };
    
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
            
            // Nếu đang tìm kiếm, gọi lại API tìm kiếm với trang mới
            if (searchTerm.trim() !== '') {
                if (documentFilter === 'all') {
                    setTimeout(() => {
                        searchAllDocumentsWithTerm(searchTerm.trim());
                    }, 100);
                } else {
                    setTimeout(() => {
                        searchMyDocumentsWithTerm(searchTerm.trim());
                    }, 100);
                }
            } else {
                // Nếu không có từ khóa tìm kiếm, hiển thị tất cả tài liệu
                if (documentFilter === 'all') {
                    fetchDocuments();
                } else {
                    fetchMyDocuments();
                }
            }
        }
    };
    
    // Sort and filter documents
    const getSortedDocuments = () => {
        const docs = [...documents];
        if (sortOption === 'newest') {
            // Sort by creation date if available, newest first
            return docs.sort((a, b) => {
                if (a.createdAt && b.createdAt) {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                }
                return 0;
            });
        } else if (sortOption === 'oldest') {
            // Sort by creation date if available, oldest first
            return docs.sort((a, b) => {
                if (a.createdAt && b.createdAt) {
                    return new Date(a.createdAt) - new Date(b.createdAt);
                }
                return 0;
            });
        } else if (sortOption === 'name') {
            return docs.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortOption === 'status') {
            return docs.sort((a, b) => a.status.localeCompare(b.status));
        }
        return docs;
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
    
    // Render upload modal
    const renderUploadModal = () => {
        if (!showUploadModal) return null;
        
        return (
            <div className="modal-overlay">
                <div className="upload-modal">
                    <div className="modal-header">
                        <h3>Thêm tài liệu mới</h3>
                        <button className="close-button" onClick={closeUploadModal}>
                            <X size={20} />
                        </button>
                    </div>
                    
                    <form onSubmit={handleSubmitUpload} className="upload-form">
                        <div className="form-group">
                            <label htmlFor="title">Tiêu đề tài liệu *</label>
                            <input 
                                type="text"
                                id="title"
                                value={uploadTitle}
                                onChange={(e) => setUploadTitle(e.target.value)}
                                placeholder="Nhập tiêu đề tài liệu"
                                className="document-form-control"
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="description">Mô tả</label>
                            <textarea 
                                id="description"
                                value={uploadDescription}
                                onChange={(e) => setUploadDescription(e.target.value)}
                                placeholder="Nhập mô tả tài liệu (không bắt buộc)"
                                className="document-form-control"
                                rows={4}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="status">Trạng thái</label>
                            <select
                                id="status"
                                value={uploadStatus}
                                onChange={(e) => setUploadStatus(e.target.value)}
                                className="document-form-control"
                            >
                                <option value="PUBLIC">Hiển thị công khai</option>
                                <option value="PRIVATE">Ẩn</option>
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label>File đã chọn</label>
                            <div className="selected-file">
                                {uploadFile ? (
                                    <>
                                        <span>{uploadFile.name}</span>
                                        <span className="file-size">({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                                    </>
                                ) : (
                                    <span>Chưa chọn file nào</span>
                                )}
                            </div>
                            <button 
                                type="button" 
                                onClick={handleUploadClick} 
                                className="change-file-button"
                            >
                                Chọn file khác
                            </button>
                        </div>
                        
                        {uploadError && (
                            <div className="error-message">
                                {uploadError}
                            </div>
                        )}
                        
                        <div className="document-form-actions">
                            <button 
                                type="button" 
                                onClick={closeUploadModal} 
                                className="document-cancel-button"
                            >
                                Hủy
                            </button>
                            <button 
                                type="submit" 
                                className="document-submit-button"
                                disabled={loading}
                            >
                                {loading ? 'Đang tải lên...' : 'Tải lên'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };
    
    // Render delete confirmation modal
    const renderDeleteModal = () => {
        if (!showDeleteModal || !documentToDelete) return null;
        
        return (
            <div className="modal-overlay">
                <div className="delete-modal">
                    <div className="document-modal-header">
                        <h3>Xác nhận xóa tài liệu</h3>
                        <button className="close-button" onClick={closeDeleteModal}>
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="delete-modal-content">
                        <p>Bạn có chắc chắn muốn xóa tài liệu sau?</p>
                        <div className="document-to-delete-info">
                            <FileText size={20} />
                            <span>{documentToDelete.title}</span>
                        </div>
                        <p className="delete-warning">Hành động này không thể hoàn tác.</p>
                        
                        {deleteError && (
                            <div className="error-message">
                                {deleteError}
                            </div>
                        )}
                        
                        <div className="document-form-actions">
                            <button 
                                type="button" 
                                onClick={closeDeleteModal} 
                                className="document-cancel-button"
                                disabled={deleteLoading}
                            >
                                Hủy
                            </button>
                            <button 
                                type="button" 
                                onClick={handleDeleteDocument} 
                                className="delete-confirm-button"
                                disabled={deleteLoading}
                            >
                                {deleteLoading ? 'Đang xóa...' : 'Xác nhận xóa'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
    
    // Render visibility confirmation modal
    const renderVisibilityModal = () => {
        if (!showVisibilityModal || !documentToToggle) return null;
        
        const isCurrentlyPublic = documentToToggle.status === 'PUBLIC';
        const actionText = isCurrentlyPublic ? 'ẩn' : 'hiển thị';
        
        return (
            <div className="modal-overlay">
                <div className="visibility-modal">
                    <div className="document-modal-header">
                        <h3>Xác nhận {actionText} tài liệu</h3>
                        <button className="close-button" onClick={closeVisibilityModal}>
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="visibility-modal-content">
                        <p>Bạn có chắc chắn muốn {actionText} tài liệu sau?</p>
                        <div className="document-to-toggle-info">
                            <FileText size={20} />
                            <span>{documentToToggle.title}</span>
                        </div>
                        
                        {visibilityError && (
                            <div className="error-message">
                                {visibilityError}
                            </div>
                        )}
                        
                        <div className="document-form-actions">
                            <button 
                                type="button" 
                                onClick={closeVisibilityModal} 
                                className="document-cancel-button"
                                disabled={visibilityLoading}
                            >
                                Hủy
                            </button>
                            <button 
                                type="button" 
                                onClick={handleToggleVisibility} 
                                className={`visibility-confirm-button ${isCurrentlyPublic ? 'hide-button' : 'show-button'}`}
                                disabled={visibilityLoading}
                            >
                                {visibilityLoading ? 'Đang xử lý...' : `Xác nhận ${actionText}`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
    
    // Add useEffect to update pagination for "My Documents" when cache or page changes
    useEffect(() => {
        if (documentFilter === 'mine' && myDocumentsCache.length > 0) {
            // Calculate pagination
            const totalFilteredDocs = myDocumentsCache.length;
            setTotalElements(totalFilteredDocs);
            const calculatedTotalPages = Math.ceil(totalFilteredDocs / pageSize);
            setTotalPages(calculatedTotalPages);
            
            // Ensure current page is valid
            if (currentPage >= calculatedTotalPages && calculatedTotalPages > 0) {
                setCurrentPage(calculatedTotalPages - 1);
            }
            
            // Apply pagination manually
            const startIdx = currentPage * pageSize;
            const endIdx = startIdx + pageSize;
            const paginatedDocs = myDocumentsCache.slice(startIdx, endIdx);
            setDocuments(paginatedDocs);
        }
    }, [documentFilter, myDocumentsCache, currentPage, pageSize]);
    
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
    
    // Tạo hàm mới để tìm kiếm với từ khóa cụ thể thay vì sử dụng state
    const searchAllDocumentsWithTerm = async (term) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            console.log(`Tìm kiếm tài liệu với title="${term}", majorId=${majorId}, pageSize=${pageSize}, pageNumber=${currentPage}`);
            
            // Gọi API tìm kiếm tất cả tài liệu
            const response = await axios.get(SEARCH_DOCUMENTS_API, {
                headers: { 
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    title: term,
                    majorId: majorId,
                    pageSize: pageSize,
                    pageNumber: currentPage
                }
            });
            
            if (response.data && response.data.code === 0) {
                const documentData = response.data.result;
                setDocuments(documentData.content || []);
                
                // Cập nhật thông tin phân trang
                const pageInfo = documentData.page || {};
                setTotalPages(pageInfo.totalPages || 0);
                setTotalElements(pageInfo.totalElements || 0);
                
                // Reset selection when changing page
                setSelectedDocuments([]);
                setSelectAll(false);
                
                console.log('Kết quả tìm kiếm:', {
                    từKhóa: term,
                    tổngKếtQuả: pageInfo.totalElements,
                    tổngTrang: pageInfo.totalPages,
                    trangHiệnTại: currentPage + 1,
                    kếtQuảTrênTrang: (documentData.content || []).length
                });
            } else {
                throw new Error(response.data?.message || 'Failed to search documents');
            }
        } catch (err) {
            console.error('Error searching documents:', err);
            setError('Không thể tìm kiếm tài liệu. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };
    
    // Tạo hàm mới để tìm kiếm tài liệu của tôi với từ khóa cụ thể
    const searchMyDocumentsWithTerm = async (term) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            console.log(`Tìm kiếm tài liệu của tôi với keyword="${term}", pageSize=${pageSize}, pageNumber=${currentPage}`);
            
            // Gọi API tìm kiếm tài liệu của tôi
            const response = await axios.get(GET_MY_DOCUMENTS, {
                headers: { 
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    keyword: term,
                    pageSize: pageSize,
                    pageNumber: currentPage
                }
            });
            
            if (response.data && response.data.code === 0) {
                const documentData = response.data.result;
                const allDocuments = documentData.content || [];
                
                // Lọc theo chuyên ngành hiện tại (majorId)
                const filteredByMajor = allDocuments.filter(doc => 
                    doc.major && doc.major.id.toString() === majorId.toString()
                );
                
                setDocuments(filteredByMajor);
                // Cập nhật cache của tài liệu của tôi
                setMyDocumentsCache(filteredByMajor);
                setTotalElements(filteredByMajor.length);
                setTotalPages(Math.ceil(filteredByMajor.length / pageSize));
                
                // Reset selection when changing page
                setSelectedDocuments([]);
                setSelectAll(false);
                
                console.log('Kết quả tìm kiếm tài liệu của tôi:', {
                    từKhóa: term,
                    tổngKếtQuả: filteredByMajor.length,
                    tổngTrang: Math.ceil(filteredByMajor.length / pageSize),
                    trangHiệnTại: currentPage + 1,
                    kếtQuảTrênTrang: filteredByMajor.length
                });
            } else {
                throw new Error(response.data?.message || 'Failed to search documents');
            }
        } catch (err) {
            console.error('Error searching my documents:', err);
            setError('Không thể tìm kiếm tài liệu. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };
    
    // Cập nhật hàm xử lý khi nhập vào ô tìm kiếm
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        
        // Xóa timer search trước đó nếu có
        if (searchTimerRef.current) {
            clearTimeout(searchTimerRef.current);
        }
        
        // Thiết lập timer mới để debounce việc tìm kiếm
        searchTimerRef.current = setTimeout(() => {
            // Lưu giá trị tìm kiếm hiện tại vào biến local để đảm bảo sử dụng giá trị mới nhất
            const currentSearchTerm = value.trim();
            
            // Reset về trang đầu tiên khi thực hiện tìm kiếm mới
            setCurrentPage(0);
            
            console.log(`Thực hiện tìm kiếm với từ khóa: "${currentSearchTerm}"`);
            
            if (currentSearchTerm === '') {
                // Nếu ô tìm kiếm trống, quay lại hiển thị tất cả tài liệu
                if (documentFilter === 'all') {
                    fetchDocuments();
                } else {
                    fetchMyDocuments();
                }
            } else {
                // Gọi API tìm kiếm tương ứng với chế độ hiện tại
                if (documentFilter === 'all') {
                    // Gọi hàm tìm kiếm với giá trị hiện tại, không sử dụng searchTerm từ state
                    searchAllDocumentsWithTerm(currentSearchTerm);
                } else {
                    // Gọi hàm tìm kiếm với giá trị hiện tại, không sử dụng searchTerm từ state
                    searchMyDocumentsWithTerm(currentSearchTerm);
                }
            }
        }, 500); // Đợi 500ms sau khi ngừng gõ mới thực hiện tìm kiếm
    };
    
    // Xóa timer khi component unmount
    useEffect(() => {
        return () => {
            if (searchTimerRef.current) {
                clearTimeout(searchTimerRef.current);
            }
        };
    }, []);
    
    // Handle bulk action selection
    const handleBulkActionSelect = (action) => {
        setShowBulkActions(false);
        
        switch (action) {
            case 'delete':
                setShowBulkDeleteModal(true);
                setBulkDeleteError('');
                break;
            case 'hide':
                setBulkVisibilityAction('PRIVATE');
                setShowBulkVisibilityModal(true);
                setBulkVisibilityError('');
                break;
            case 'show':
                setBulkVisibilityAction('PUBLIC');
                setShowBulkVisibilityModal(true);
                setBulkVisibilityError('');
                break;
            default:
                break;
        }
    };
    
    // Close bulk delete modal
    const closeBulkDeleteModal = () => {
        setShowBulkDeleteModal(false);
        setBulkDeleteError('');
        setBulkDeleteLoading(false);
    };
    
    // Handle bulk delete documents
    const handleBulkDeleteDocuments = async () => {
        if (selectedDocuments.length === 0) {
            return;
        }
        
        try {
            setBulkDeleteLoading(true);
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            // Create FormData object to send documentIds
            const formData = new FormData();
            selectedDocuments.forEach(documentId => {
                formData.append('documentId', documentId);
            });
            
            const response = await axios.delete('http://localhost:8080/lms/document/deleteall', {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                data: formData
            });
            
            if (response.data && response.data.code === 0) {
                // Close the modal
                closeBulkDeleteModal();
                
                // Update UI after deletion
                setDocuments(prev => prev.filter(doc => !selectedDocuments.includes(doc.id)));
                
                if (documentFilter === 'mine') {
                    // Update the cache for "My Documents" pagination
                    setMyDocumentsCache(prev => prev.filter(doc => !selectedDocuments.includes(doc.id)));
                    
                    // Recalculate total elements and pages
                    const updatedTotal = myDocumentsCache.length - selectedDocuments.length;
                    setMyDocsTotal(updatedTotal);
                    setTotalElements(updatedTotal);
                    setTotalPages(Math.ceil(updatedTotal / pageSize));
                    
                    // If we deleted all items on the current page and we're not on the first page, go back one page
                    const remainingOnCurrentPage = documents.filter(doc => !selectedDocuments.includes(doc.id)).length;
                    if (remainingOnCurrentPage === 0 && currentPage > 0) {
                        setCurrentPage(currentPage - 1);
                    }
                    
                } else {
                    // Refresh if we deleted all items on the page
                    const remainingOnCurrentPage = documents.filter(doc => !selectedDocuments.includes(doc.id)).length;
                    if (remainingOnCurrentPage === 0 && currentPage > 0) {
                        setCurrentPage(currentPage - 1);
                    } else {
                        fetchDocuments();
                    }
                }
                showAlert('success', 'Thành công', 'Xóa tài liệu thành công!');
                // Reset selection
                setSelectedDocuments([]);
                setSelectAll(false);
            } else {
                throw new Error(response.data?.message || 'Failed to delete documents');
            }
        } catch (err) {
            console.error('Error deleting documents:', err);
            showAlert('error', 'Lỗi', 'Không thể xóa tài liệu. Vui lòng thử lại sau.');
        } finally {
            setBulkDeleteLoading(false);
        }
    };
    
    // Close bulk visibility modal
    const closeBulkVisibilityModal = () => {
        setShowBulkVisibilityModal(false);
        setBulkVisibilityAction('');
        setBulkVisibilityError('');
        setBulkVisibilityLoading(false);
    };
    
    // Handle bulk update visibility
    const handleBulkUpdateVisibility = async () => {
        if (selectedDocuments.length === 0 || !bulkVisibilityAction) {
            return;
        }
        
        try {
            setBulkVisibilityLoading(true);
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            // Create FormData object to send documentIds and status
            const formData = new FormData();
            selectedDocuments.forEach(documentId => {
                formData.append('documentIds', documentId);
            });
            formData.append('status', bulkVisibilityAction);
            
            // Use the same endpoint as single document update but with multiple IDs
            const response = await axios.put(UPDATE_DOCUMENT_STATUS, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            if (response.data && response.data.code === 0) {
                // Close modal
                closeBulkVisibilityModal();
                
                // Update documents in UI with new status
                setDocuments(prev => prev.map(doc => {
                    if (selectedDocuments.includes(doc.id)) {
                        return {
                            ...doc,
                            status: bulkVisibilityAction
                        };
                    }
                    return doc;
                }));
                
                if (documentFilter === 'mine') {
                    // Update the cache for "My Documents"
                    setMyDocumentsCache(prev => prev.map(doc => {
                        if (selectedDocuments.includes(doc.id)) {
                            return {
                                ...doc,
                                status: bulkVisibilityAction
                            };
                        }
                        return doc;
                    }));
                }
                
                // Reset selection
                setSelectedDocuments([]);
                setSelectAll(false);
            } else {
                throw new Error(response.data?.message || 'Failed to update document status');
            }
        } catch (err) {
            console.error('Error updating document status:', err);
            setBulkVisibilityError('Không thể cập nhật trạng thái tài liệu. Vui lòng thử lại sau.');
        } finally {
            setBulkVisibilityLoading(false);
        }
    };
    
    // Render bulk delete confirmation modal
    const renderBulkDeleteModal = () => {
        if (!showBulkDeleteModal || selectedDocuments.length === 0) return null;
        
        return (
            <div className="modal-overlay">
                <div className="delete-modal">
                    <div className="document-modal-header">
                        <h3>Xác nhận xóa tài liệu</h3>
                        <button className="close-button" onClick={closeBulkDeleteModal}>
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="delete-modal-content">
                        <p>Bạn có chắc chắn muốn xóa {selectedDocuments.length} tài liệu đã chọn?</p>
                        <p className="delete-warning">Hành động này không thể hoàn tác.</p>
                        
                        {bulkDeleteError && (
                            <div className="error-message">
                                {bulkDeleteError}
                            </div>
                        )}
                        
                        <div className="document-form-actions">
                            <button 
                                type="button" 
                                onClick={closeBulkDeleteModal} 
                                className="document-cancel-button"
                                disabled={bulkDeleteLoading}
                            >
                                Hủy
                            </button>
                            <button 
                                type="button" 
                                onClick={handleBulkDeleteDocuments} 
                                className="delete-confirm-button"
                                disabled={bulkDeleteLoading}
                            >
                                {bulkDeleteLoading ? 'Đang xóa...' : 'Xác nhận xóa'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
    
    // Render bulk visibility confirmation modal
    const renderBulkVisibilityModal = () => {
        if (!showBulkVisibilityModal || selectedDocuments.length === 0 || !bulkVisibilityAction) return null;
        
        const isPublic = bulkVisibilityAction === 'PUBLIC';
        const actionText = isPublic ? 'hiển thị' : 'ẩn';
        
        return (
            <div className="modal-overlay">
                <div className="visibility-modal">
                    <div className="document-modal-header">
                        <h3>Xác nhận {actionText} tài liệu</h3>
                        <button className="close-button" onClick={closeBulkVisibilityModal}>
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="visibility-modal-content">
                        <p>Bạn có chắc chắn muốn {actionText} {selectedDocuments.length} tài liệu đã chọn?</p>
                        
                        {bulkVisibilityError && (
                            <div className="error-message">
                                {bulkVisibilityError}
                            </div>
                        )}
                        
                        <div className="document-form-actions">
                            <button 
                                type="button" 
                                onClick={closeBulkVisibilityModal} 
                                className="document-cancel-button"
                                disabled={bulkVisibilityLoading}
                            >
                                Hủy
                            </button>
                            <button 
                                type="button" 
                                onClick={handleBulkUpdateVisibility} 
                                className={`visibility-confirm-button ${isPublic ? 'show-button' : 'hide-button'}`}
                                disabled={bulkVisibilityLoading}
                            >
                                {bulkVisibilityLoading ? 'Đang xử lý...' : `Xác nhận ${actionText}`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
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
                <button onClick={documentFilter === 'all' ? fetchDocuments : fetchMyDocuments} className="retry-button">Thử lại</button>
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
            {renderUploadModal()}
            {renderDeleteModal()}
            {renderVisibilityModal()}
            {renderPreviewModal()}
            {renderBulkDeleteModal()}
            {renderBulkVisibilityModal()}
            {alert && (
                <div className="alert-container">
                    <Alert
                        type={alert.type}
                        title={alert.title}
                        message={alert.message}
                        onClose={() => setAlert(null)}
                    />
                </div>
            )}
            <div className="document-header">
                <div className="header-title">
                    <button onClick={handleBackClick} className="document-back-button">
                        Quản lý tài liệu
                    </button>
                    &gt;
                    <span>{major.name}</span>
                </div>
                <div className="header-actions">
                    <div className="search-container">
                        <Search size={20} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm tài liệu..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="search-input"
                        />
                    </div>
                    <button className="upload-button" onClick={handleUploadClick}>
                        <Upload size={20} />
                        <span>Upload</span>
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                </div>
            </div>
            
            <div className="filter-container">
                <div className="filter-item">
                    <Filter size={18} className="filter-icon" />
                    <span className="filter-label">Sắp xếp:</span>
                    <div className="filter-dropdown date-filter" ref={sortDropdownRef}>
                        <button className="filter-button" onClick={toggleSortOptions}>
                            {sortOption === 'newest' ? 'Ngày đăng mới nhất' : 
                             sortOption === 'oldest' ? 'Ngày đăng muộn nhất' : 
                             sortOption === 'name' ? 'Tên tài liệu' : 'Trạng thái'}
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
                                Ngày đăng muộn nhất
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
                
                <div className="filter-item">
                    <span className="filter-label">Loại tài liệu:</span>
                    <div className="filter-dropdown document-filter" ref={docFilterDropdownRef}>
                        <button className="filter-button" onClick={toggleDocumentFilterOptions}>
                            {documentFilter === 'all' ? 'Tất cả tài liệu' : 'Tài liệu của tôi'}
                            <ChevronDown size={16} />
                        </button>
                        <div className={`filter-options ${showDocumentFilterOptions ? 'show' : ''}`}>
                            <div 
                                className={`filter-option ${documentFilter === 'mine' ? 'active' : ''}`}
                                onClick={() => handleDocumentFilterSelect('mine')}
                            >
                                Tài liệu của tôi
                            </div>
                            <div 
                                className={`filter-option ${documentFilter === 'all' ? 'active' : ''}`}
                                onClick={() => handleDocumentFilterSelect('all')}
                            >
                                Tất cả tài liệu
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Add bulk actions dropdown */}
                {selectedDocuments.length > 0 && (
                    <div className="filter-item">
                        <div className="filter-dropdown bulk-actions" ref={bulkActionsRef}>
                            <button 
                                className="filter-button" 
                                onClick={toggleBulkActions}
                                style={{ 
                                    color: '#0056b3', 
                                    border: '1px solid #0056b3' 
                                }}
                            >
                                Đã chọn {selectedDocuments.length} file
                                <ChevronDown size={16} />
                            </button>
                            <div 
                                className={`filter-options ${showBulkActions ? 'show' : ''}`}
                                style={{ minWidth: '180px' }}
                            >
                                <div 
                                    className="filter-option"
                                    onClick={() => handleBulkActionSelect('delete')}
                                >
                                    <Trash2 size={16} style={{ marginRight: '8px' }} />
                                    Xóa file đã chọn
                                </div>
                                <div 
                                    className="filter-option"
                                    onClick={() => handleBulkActionSelect('hide')}
                                >
                                    <EyeOff size={16} style={{ marginRight: '8px' }} />
                                    Ẩn file đã chọn
                                </div>
                                <div 
                                    className="filter-option"
                                    onClick={() => handleBulkActionSelect('show')}
                                >
                                    <Eye size={16} style={{ marginRight: '8px' }} />
                                    Hiển thị file đã chọn
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="document-list">
                <div className="document-table-header">
                    <div className="document-checkbox-column">
                        <input 
                            type="checkbox" 
                            checked={selectAll} 
                            onChange={handleSelectAll}
                        />
                    </div>
                    <div className="document-name-column">Tên tài liệu</div>
                    <div className="status-column">
                        {documentFilter === 'all' ? 'Người đăng' : 'Trạng thái'}
                    </div>
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
                        const isSelected = selectedDocuments.includes(document.id);
                        return (
                            <div 
                                key={document.id} 
                                className={`document-item ${isSelected ? 'selected' : ''}`}
                            >
                                <div className="document-checkbox-column">
                                    <input 
                                        type="checkbox" 
                                        checked={isSelected}
                                        onChange={() => handleSelectDocument(document.id)}
                                    />
                                </div>
                                <div className="document-name-column" onClick={() => handlePreviewClick(document)}>
                                    <div className="document-name">{document.title}</div>
                                    <div className="document-filename">{document.fileName}</div>
                                </div>
                                <div className="status-column">
                                    {documentFilter === 'all' ? (
                                        <div className="document-uploader">
                                            {document.object?.fullName || 'Unknown'}
                                        </div>
                                    ) : (
                                        <div className={`document-status-badge ${document.status === 'PUBLIC' ? 'show' : 'hide'}`}>
                                            {document.status === 'PUBLIC' ? (
                                                <>
                                                    <Check size={14} />
                                                    <span>Hiển thị</span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="x-icon"></div>
                                                    <span>Ẩn</span>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="date-column">{formatDate(document.createdAt)}</div>
                                <div className="document-actions-column">
                                    {documentFilter === 'mine' && (
                                        <>
                                            <button 
                                                className="document-action-button visibility-button"
                                                onClick={() => handleVisibilityButtonClick(document)}
                                            >
                                                {document.status === 'PUBLIC' ? (
                                                    <Eye size={18} />
                                                ) : (
                                                    <EyeOff size={18} />
                                                )}
                                            </button>
                                            <button 
                                                className="document-action-button document-delete-button"
                                                onClick={() => handleDeleteButtonClick(document)}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </>
                                    )}
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
                        <p>Không tìm thấy tài liệu nào phù hợp.</p>
                    </div>
                )}
            </div>
            
            <div className="document-pagination">
                <div className="pagination-info">Tổng số: {totalElements} files</div>
                {totalPages > 1 && (
                    <div className="pagination-controls">
                        <button 
                            className="pagination-button"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 0}
                        >
                            &lt;
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i}
                                className={`pagination-button ${currentPage === i ? 'current-page' : ''}`}
                                onClick={() => handlePageChange(i)}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button 
                            className="pagination-button"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages - 1}
                        >
                            &gt;
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageDocument;