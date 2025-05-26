import React from 'react';
import '../assets/css/free-courses.css';
import { LayoutDashboard, MonitorSmartphone, BookOpenCheck, MessageSquareCode, ChartLine, ShieldCheck } from 'lucide-react';

function FreeCoursesSignup() {
    return (
        <section className="free-courses-section" >
            <div className="why-triprex">
                <h2 data-aos="fade-up" className="home-section-title">Tại Sao Nên Chọn Hệ Thống Của Chúng Tôi</h2>
                <div data-aos="fade-up" className="features-grid">
                    {[
                        { icon: <LayoutDashboard size={60} />, title: 'Giao diện thân thiện, dễ sử dụng', description: 'Giao diện đơn giản, dễ thao tác giúp sinh viên tập trung vào việc học thay vì mất thời gian tìm hiểu cách dùng.' },
                        { icon: <MonitorSmartphone size={60}/>, title: 'Truy cập nhanh và đa nền tảng', description: 'Sinh viên có thể học mọi lúc mọi nơi, không bị giới hạn bởi thiết bị.' },
                        { icon: <BookOpenCheck size={60}/>, title: 'Nội dung học tập đầy đủ và cập nhật', description: 'Giúp sinh viên luôn được tiếp cận với kiến thức mới và theo sát chương trình học.' },
                        { icon: <MessageSquareCode size={60}/>, title: 'Học tập tương tác và linh hoạt', description: 'Tăng tính tương tác, hỗ trợ giải đáp thắc mắc nhanh chóng, học tập hiệu quả hơn.' },
                        { icon: <ChartLine size={60}/>, title: 'Theo dõi tiến độ học tập cá nhân', description: 'Sinh viên có thể tự đánh giá và điều chỉnh kế hoạch học tập phù hợp.' },
                        { icon: <ShieldCheck size={60}/>, title: 'Bảo mật thông tin và dữ liệu cá nhân', description: 'Đảm bảo thông tin của sinh viên không bị rò rỉ hoặc sử dụng sai mục đích.' },
                    ].map((feature, index) => (
                    <div
                        key={index}
                        className="home-feature-item"
                    >
                        <div className="home-feature-icon">{feature.icon}</div>
                        <h3>{feature.title}</h3>
                        <p>{feature.description}</p>
                    </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default FreeCoursesSignup;