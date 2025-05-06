
export const API_BASE_URL = 'http://localhost:8080';

// STUDENT API
export const GET_STATUS_API = `${API_BASE_URL}/lms/joinclass/getstatus`; // Kiểm tra trạng thái đăng ký học của sinh viên
export const GET_STUDENT_INFO = `${API_BASE_URL}/lms/student/myinfo`; // Lấy ra thông tin cá nhân của sinh viên
export const SEARCH_COURSE_API = `${API_BASE_URL}/lms/course/search`; // Tìm kiếm khóa học theo tên khóa hoặc gv
export const GET_MY_COURSE = `${API_BASE_URL}/lms/studentcourse/mycourse`; // Danh sách khóa học của sv
export const GET_PROGRESS_PERCENT = `${API_BASE_URL}/lms/lessonchapterprogress/getpercent`; // Lấy % hoàn thành khóa học

// TEACHER API
export const GET_TEACHER_INFO = `${API_BASE_URL}/lms/teacher/myinfo`;
export const GET_TEACHER_GROUPS = `${API_BASE_URL}/lms/group/groupofteacher`;
export const GET_MAJOR_API = `${API_BASE_URL}/lms/major`;
export const GET_STUDENT_COURSE = `${API_BASE_URL}/lms/studentcourse/studentofcourse`;
export const GET_JOINCLASS_REQUEST = `${API_BASE_URL}/lms/joinclass/studentrequest`;
export const GET_POST_GROUP = `${API_BASE_URL}/lms/post`;
export const JOINCLASS_APPROVED_API = `${API_BASE_URL}/lms/joinclass/approved`;
export const JOINCLASS_REJECTED_API = `${API_BASE_URL}/lms/joinclass/rejected`;
export const ADD_LESSON_API = `${API_BASE_URL}/lms/lesson/create`;
export const ADD_MATERIAL_API = `${API_BASE_URL}/lms/lessonmaterial/create`;
export const ADD_CHAPTER_API = `${API_BASE_URL}/lms/chapter/create`;
export const ADD_COURSE_API = `${API_BASE_URL}/lms/course/create`;
export const ADD_STUDENT_COURSE = `${API_BASE_URL}/lms/studentcourse/addstudents`;
export const ADD_POST_GROUP = `${API_BASE_URL}/lms/post/create`
export const UPDATE_COURSE_API = `${API_BASE_URL}/lms/course/update`;
export const DELETE_STUDENT_COURSE = `${API_BASE_URL}/lms/studentcourse/delete`;
export const DELETE_POST_GROUP = `${API_BASE_URL}/lms/post/delete`;
export const SEARCH_STUDENT_NOT_IN_COURSE = `${API_BASE_URL}/lms/studentcourse/searchstudentnotin`;