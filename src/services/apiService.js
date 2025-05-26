export const API_BASE_URL = 'http://localhost:8080';

// ACCOUNT API
export const FORGOT_PASSWORD_API = `${API_BASE_URL}/lms/email/forgotpassword`;
export const SEND_EMAIL_API = `${API_BASE_URL}/lms/email/send`;
export const VERIFY_EMAIL_API = `${API_BASE_URL}/lms/email/verifycode`;
export const CREATE_STUDENT_ACCOUNT = `${API_BASE_URL}/lms/student/create`;
export const CREATE_TEACHER_ACCOUNT = `${API_BASE_URL}/lms/teacher/create`;

// STUDENT API
export const GET_STATUS_API = `${API_BASE_URL}/lms/joinclass/getstatus`; // Kiểm tra trạng thái đăng ký học của sinh viên
export const GET_STUDENT_INFO = `${API_BASE_URL}/lms/student/myinfo`; // Lấy ra thông tin cá nhân của sinh viên
export const SEARCH_COURSE_API = `${API_BASE_URL}/lms/course/search`; // Tìm kiếm khóa học theo tên khóa hoặc gv
export const GET_MAJOR_API = `${API_BASE_URL}/lms/major`;


// TEACHER API
export const GET_TEACHER_INFO = `${API_BASE_URL}/lms/teacher/myinfo`;
export const GET_TEACHER_GROUPS = `${API_BASE_URL}/lms/group/groupofteacher`;

// GROUP API
export const GET_POST_GROUP = `${API_BASE_URL}/lms/post`;
export const GET_STUDENTS_GROUP = `${API_BASE_URL}/lms/studentgroup/getstudent`;
export const GET_TESTS_IN_GROUP = `${API_BASE_URL}/lms/testingroup/getalltest`;
export const GET_GROUPS_OF_STUDENT = `${API_BASE_URL}/lms/studentgroup/getgroup`;
export const GET_ALL_RESULTS = `${API_BASE_URL}/lms/teststudentresult/getallresult`;
export const GET_STUDENT_TEST_RESULT = `${API_BASE_URL}/lms/teststudentresult/gettestresult`;
export const ADD_GROUP_API = `${API_BASE_URL}/lms/group/create`;
export const ADD_POST_GROUP = `${API_BASE_URL}/lms/post/create`;
export const ADD_STUDENT_GROUP = `${API_BASE_URL}/lms/studentgroup/addstudent`;
export const CREATE_TEST_API = `${API_BASE_URL}/lms/testingroup/create`;
export const UPDATE_TEST_API = `${API_BASE_URL}/lms/testingroup/update`;
export const DELETE_TEST_API = `${API_BASE_URL}/lms/testingroup/delete`;
export const DELETE_STUDENT_COURSE = `${API_BASE_URL}/lms/studentcourse/delete`;
export const DELETE_POST_GROUP = `${API_BASE_URL}/lms/post/delete`;
export const DELETE_STUDENT_GROUP = `${API_BASE_URL}/lms/studentgroup/delete`;
export const SEARCH_STUDENT_NOT_IN_GROUP = `${API_BASE_URL}/lms/student/searchnotingroup`;
export const TEST_GROUP_DETAIL = `${API_BASE_URL}/lms/testingroup/testdetails`;
export const TEST_RESULT_DETAIL = `${API_BASE_URL}/lms/teststudentresult/gettestdetail`;
export const START_TEST_API = `${API_BASE_URL}/lms/teststudentresult/starttest`;
export const SUBMIT_TEST_API = `${API_BASE_URL}/lms/teststudentresult/submitTest`;
export const UPDATE_POST_API = `${API_BASE_URL}/lms/post/update`;
export const UPDATE_GROUP_API = `${API_BASE_URL}/lms/group/update`;

// COURSE API
export const SEARCH_STUDENT = `${API_BASE_URL}/lms/student/search`;
export const GET_STUDENT_COURSE = `${API_BASE_URL}/lms/studentcourse/studentofcourse`;
export const GET_JOINCLASS_REQUEST = `${API_BASE_URL}/lms/joinclass/studentrequest`;
export const JOINCLASS_APPROVED_API = `${API_BASE_URL}/lms/joinclass/approved`;
export const JOINCLASS_REJECTED_API = `${API_BASE_URL}/lms/joinclass/rejected`;
export const ADD_LESSON_API = `${API_BASE_URL}/lms/lesson/create`;
export const ADD_MATERIAL_API = `${API_BASE_URL}/lms/lessonmaterial/create`;
export const ADD_CHAPTER_API = `${API_BASE_URL}/lms/chapter/create`;
export const ADD_COURSE_API = `${API_BASE_URL}/lms/course/create`;
export const UPLOAD_COURSE_PHOTO_API = `${API_BASE_URL}/lms/course`; // Endpoint cơ sở cho upload ảnh khóa học
export const ADD_STUDENT_COURSE = `${API_BASE_URL}/lms/studentcourse/addstudents`;
export const UPDATE_COURSE_API = `${API_BASE_URL}/lms/course/update`;
export const SEARCH_STUDENT_NOT_IN_COURSE = `${API_BASE_URL}/lms/studentcourse/searchstudentnotin`;
export const GET_MY_COURSE = `${API_BASE_URL}/lms/studentcourse/mycourse`; // Danh sách khóa học của sv
export const GET_PROGRESS_PERCENT = `${API_BASE_URL}/lms/lessonchapterprogress/getpercent`; // Lấy % hoàn thành khóa học
export const DELETE_MULTIPLE_STUDENTS_COURSE = `${API_BASE_URL}/lms/studentcourse/deleteall`; // Xoá nhiều sinh viên khỏi khóa học

// WebSocket URLs
export const WS_BASE_URL = `${API_BASE_URL}/lms/ws`;
export const WS_COMMENT_ENDPOINT = '/app/comment';
export const WS_REPLY_ENDPOINT = '/app/comment-reply';
export const WS_COMMENTS_TOPIC = '/topic/comments';
export const WS_REPLIES_TOPIC = '/topic/comment-replies';
export const WS_POST_COMMENT_ENDPOINT = '/app/post-comment';
export const WS_POST_COMMENTS_TOPIC = '/topic/post-comments';

// Comment endpoints
export const GET_COMMENTS_BY_CHAPTER = `${API_BASE_URL}/lms/comments/getCommentByChapter/details`;
export const GET_COMMENT_REPLIES = `${API_BASE_URL}/lms/comments/getCommentReplyByComment/details`;

// Comment post endpoints
export const GET_COMMENTS_BY_POST = `${API_BASE_URL}/lms/comments/getCommentByPost/details`;

// Group Student Management
export const DELETE_MULTIPLE_STUDENTS_GROUP = `${API_BASE_URL}/lms/studentgroup/deleteall`;

// Document Management API
export const GET_MAJOR_DOCUMENTS = `${API_BASE_URL}/lms/document/getbymajor`; // Lấy danh sách tài liệu theo chuyên ngành
export const GET_MY_DOCUMENTS = `${API_BASE_URL}/lms/document/mydocument`; // Lấy danh sách tài liệu của giảng viên đang đăng nhập
export const UPLOAD_DOCUMENT = `${API_BASE_URL}/lms/document/create`; // Upload tài liệu mới
export const DELETE_DOCUMENT = `${API_BASE_URL}/lms/document/delete`; // Xoá tài liệu
export const UPDATE_DOCUMENT_STATUS = `${API_BASE_URL}/lms/document/updatestatus`; // Cập nhật trạng thái hiển thị của tài liệu
export const SEARCH_DOCUMENTS_API = `${API_BASE_URL}/lms/document/search`; // Tìm kiếm tài liệu theo từ khóa

// Chat API Endpoints
export const GET_ALL_CHATBOXES_API = `${API_BASE_URL}/lms/chatBox`; // Assuming /api is part of API_BASE_URL or you might need to adjust this
export const SEND_MESSAGE_API = (chatBoxId) => `${API_BASE_URL}/lms/chatBox/${chatBoxId}/messages`; // POST request
