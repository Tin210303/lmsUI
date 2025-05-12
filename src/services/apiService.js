export const API_BASE_URL = 'http://localhost:8080';

export const FORGOT_PASSWORD_API = `${API_BASE_URL}/lms/email/forgotpassword`;
export const SEND_EMAIL_API = `${API_BASE_URL}/lms/email/send`;
export const VERIFY_EMAIL_API = `${API_BASE_URL}/lms/email/verifycode`;
export const CREATE_STUDENT_ACCOUNT = `${API_BASE_URL}/lms/student/create`;
export const CREATE_TEACHER_ACCOUNT = `${API_BASE_URL}/lms/teacher/create`;


// STUDENT API
export const GET_STATUS_API = `${API_BASE_URL}/lms/joinclass/getstatus`; // Kiểm tra trạng thái đăng ký học của sinh viên
export const GET_STUDENT_INFO = `${API_BASE_URL}/lms/student/myinfo`; // Lấy ra thông tin cá nhân của sinh viên
export const SEARCH_COURSE_API = `${API_BASE_URL}/lms/course/search`; // Tìm kiếm khóa học theo tên khóa hoặc gv
export const GET_MY_COURSE = `${API_BASE_URL}/lms/studentcourse/mycourse`; // Danh sách khóa học của sv
export const GET_PROGRESS_PERCENT = `${API_BASE_URL}/lms/lessonchapterprogress/getpercent`; // Lấy % hoàn thành khóa học
export const TEST_GROUP_DETAIL = `${API_BASE_URL}/lms/testingroup/testdetails`;
export const TEST_RESULT_DETAIL = `${API_BASE_URL}/lms/teststudentresult/gettestdetail`;
export const START_TEST_API = `${API_BASE_URL}/lms/teststudentresult/starttest`;
export const SUBMIT_TEST_API = `${API_BASE_URL}/lms/teststudentresult/submitTest`;

// TEACHER API
export const GET_TEACHER_INFO = `${API_BASE_URL}/lms/teacher/myinfo`;
export const GET_TEACHER_GROUPS = `${API_BASE_URL}/lms/group/groupofteacher`;
export const GET_MAJOR_API = `${API_BASE_URL}/lms/major`;
export const GET_STUDENT_COURSE = `${API_BASE_URL}/lms/studentcourse/studentofcourse`;
export const GET_JOINCLASS_REQUEST = `${API_BASE_URL}/lms/joinclass/studentrequest`;
export const GET_POST_GROUP = `${API_BASE_URL}/lms/post`;
export const GET_STUDENTS_GROUP = `${API_BASE_URL}/lms/studentgroup/getstudent`;
export const GET_TESTS_IN_GROUP = `${API_BASE_URL}/lms/testingroup/getalltest`;
export const GET_GROUPS_OF_STUDENT = `${API_BASE_URL}/lms/studentgroup/getgroup`;
export const GET_ALL_RESULTS = `${API_BASE_URL}/lms/teststudentresult/getallresult`;
export const GET_STUDENT_TEST_RESULT = `${API_BASE_URL}/lms/teststudentresult/gettestresult`;
export const JOINCLASS_APPROVED_API = `${API_BASE_URL}/lms/joinclass/approved`;
export const JOINCLASS_REJECTED_API = `${API_BASE_URL}/lms/joinclass/rejected`;
export const ADD_LESSON_API = `${API_BASE_URL}/lms/lesson/create`;
export const ADD_MATERIAL_API = `${API_BASE_URL}/lms/lessonmaterial/create`;
export const ADD_CHAPTER_API = `${API_BASE_URL}/lms/chapter/create`;
export const ADD_COURSE_API = `${API_BASE_URL}/lms/course/create`;
export const ADD_STUDENT_COURSE = `${API_BASE_URL}/lms/studentcourse/addstudents`;
export const ADD_POST_GROUP = `${API_BASE_URL}/lms/post/create`;
export const ADD_STUDENT_GROUP = `${API_BASE_URL}/lms/studentgroup/addstudent`;
export const CREATE_TEST_API = `${API_BASE_URL}/lms/testingroup/create`;
export const UPDATE_COURSE_API = `${API_BASE_URL}/lms/course/update`;
export const DELETE_STUDENT_COURSE = `${API_BASE_URL}/lms/studentcourse/delete`;
export const DELETE_POST_GROUP = `${API_BASE_URL}/lms/post/delete`;
export const DELETE_STUDENT_GROUP = `${API_BASE_URL}/lms/studentgroup/delete`;
export const SEARCH_STUDENT_NOT_IN_COURSE = `${API_BASE_URL}/lms/studentcourse/searchstudentnotin`;
export const SEARCH_STUDENT_NOT_IN_GROUP = `${API_BASE_URL}/lms/student/searchnotingroup`;
export const SEARCH_STUDENT = `${API_BASE_URL}/lms/student/search`;
