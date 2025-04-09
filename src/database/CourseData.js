const coursesData = [
    {
        id: '1',
        title: 'Kiến Thức Nhập Môn IT',
        description: 'Tổng quan về ngành IT - lập trình web.',
        whatYouWillLearn: [
            'Các kiến thức cơ bản, nền móng của ngành IT',
            'Các khái niệm, thuật ngữ cốt lõi khi triển khai ứng dụng',
            'Các mô hình, kiến trúc cơ bản khi triển khai ứng dụng',
            'Hiểu hơn về cách internet và máy vi tính hoạt động'
        ],
        stats: {
            chapters: 3,
            lessons: 12,
            duration: '03 giờ 26 phút',
            limit: '10 ngày',
            level: 'Khóa học riêng cho sinh viên trong lớp',
            free: true,
        },
        videoPreview: 'https://www.youtube.com/embed/Oe421EPjeBE',
        chapters: [
            {
                title: 'Khái niệm kỹ thuật cần biết',
                lessons: [
                    { name: 'Mô hình Client - Server là gì?', time: '11:35' },
                    { name: 'Domain là gì? Tên miền là gì?', time: '10:34' }
                ]
            },
            {
                title: 'Môi trường, con người IT',
                lessons: [
                    { name: 'Giới thiệu môi trường IT', time: '08:12' },
                    { name: 'Làm việc nhóm', time: '07:10' }
                ]
            }
        ]
    },
    {
        id: '2',
        title: 'Lập trình C++ cơ bản, nâng cao',
        description: 'Khóa học lập trình C++ từ cơ bản tới nâng cao dành cho người mới bắt đầu. Mục tiêu của khóa học này nhằm giúp các bạn nắm được các khái niệm căn cơ của lập trình, giúp các bạn có nền tảng vững chắc để chinh phục con đường trở thành một lập trình viên.',
        whatYouWillLearn: [
            'Các kiến thức cơ bản, nền móng của ngành IT',
            'Các khái niệm, thuật ngữ cốt lõi khi triển khai ứng dụng',
            'Các mô hình, kiến trúc cơ bản khi triển khai ứng dụng',
            'Hiểu hơn về cách internet và máy vi tính hoạt động'
        ],
        stats: {
            chapters: 11,
            lessons: 138,
            duration: '10 giờ 29 phút',
            limit: '30 ngày',
            level: 'Khóa học chung cho toàn sinh viên',
            free: false,
        },
        videoPreview: 'https://www.youtube.com/embed/5K5WN8IW9Qo',
        chapters: [
            {
                title: 'Giới thiệu',
                lessons: [
                    { name: 'Giới thiệu khóa học?', time: '10:10' },
                    { name: 'Cấu trúc cơ bản', time: '09:45' },
                    { name: 'Cấu trúc cơ bản', time: '09:45' },
                ]
            },
            {
                title: 'Biến và kiểu dữ liệu',
                lessons: [
                    { name: 'CSS là gì?', time: '08:50' },
                    { name: 'Inline, Internal, External CSS', time: '07:30' }
                ]
            }
        ]
    },
    
    {
        id: '2',
        title: 'HTML CSS từ Zero đến Hero',
        description: 'Khóa học dành cho người mới bắt đầu học HTML và CSS.',
        whatYouWillLearn: [
            'Tạo giao diện web cơ bản',
            'Hiểu cấu trúc HTML5',
            'Sử dụng CSS hiệu quả',
            'Responsive Design'
        ],
        stats: {
            chapters: 4,
            lessons: 18,
            duration: '06 giờ 15 phút',
            limit: '1 ngày',
            level: 'Cơ bản đến trung bình',
            free: false,
        },
        videoPreview: 'https://www.youtube.com/embed/5K5WN8IW9Qo',
        chapters: [
            {
                title: 'Giới thiệu HTML',
                lessons: [
                    { name: 'HTML là gì?', time: '10:10' },
                    { name: 'Cấu trúc cơ bản', time: '09:45' }
                ]
            },
            {
                title: 'Giới thiệu CSS',
                lessons: [
                    { name: 'CSS là gì?', time: '08:50' },
                    { name: 'Inline, Internal, External CSS', time: '07:30' }
                ]
            }
        ]
    }
];

export default coursesData;
