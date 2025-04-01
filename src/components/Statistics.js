import React, { useState } from "react";
import { Link } from "react-router-dom";
import '../assets/css/statistics.css';
import logo from '../logo.svg'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from "recharts";
import { AiOutlineBarChart, AiOutlineBook } from "react-icons/ai";
import { FaGraduationCap, FaClipboardList } from "react-icons/fa";

const creditData = [
  { name: "A", value: 10, color: "#00C49F" },
  { name: "B", value: 19, color: "#FFBB28" },
  { name: "C", value: 10, color: "#FF8042" },
  { name: "D", value: 2, color: "#8884d8" },
  { name: "F", value: 0, color: "#d0d0d0" },
];

const scoreData = [
  { semester: "2021-2022.1", score: 7.5 },
  { semester: "2021-2022.2", score: 8.7 },
  { semester: "2021-2022.3", score: 6.3 },
  { semester: "2022-2023.1", score: 6.5 },
  { semester: "2022-2023.2", score: 7.4 },
  { semester: "2022-2023.3", score: 8.1 },
  { semester: "2023-2024.1", score: 7.3 },
  { semester: "2023-2024.2", score: 7.9 },
  { semester: "2023-2024.3", score: 8.6 },
  { semester: "2024-2025.1", score: 8.6 },
  { semester: "2024-2025.2", score: 8.6 },
];

const scoreYearData = [
    { year: "2021-2022", score: 8.3 },
    { year: "2022-2023", score: 6.1 },
    { year: "2023-2024", score: 7.2 },
    { year: "2024-2025", score: 9.0 },
];

const studyTrendData = [
  { year: "2021-2022", credits: 35 },
  { year: "2022-2023", credits: 33 },
  { year: "2023-2024", credits: 41 },
  { year: "2024-2025", credits: 14 },
];

const totalCredits = 123;
const currentCredits = 109;
const progressPercent = Math.floor((currentCredits / totalCredits) * 100);
const requiredPercent = 100 - progressPercent;

const progressData = [
    { name: "Tiến trình", percentage: progressPercent, color: "#34D399" },
    { name: "Còn lại", percentage: requiredPercent, color: "#F2726F" },
]

const isValidData = (data) => {
    return Array.isArray(data) && data.length > 0;
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`Kỳ học: ${label}`}</p>
          <p className="tooltip-value">{`ĐTB hệ 10: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
};

const CustomTooltipTrend = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`Kỳ học: ${label}`}</p>
          <p className="tooltip-value">{`Số tín chỉ đã học: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
};

const Statistics = () => {
    const [chartType, setChartType] = useState("bar");
    const [scoreView, setScoreView] = useState("semester");
    return (
        <div className="dashboard-container">
        <div className="header-statistics">
            <div className="d-flex justify-content-center align-items-center">
                <img src={logo} style={{width: '4rem'}}/>
                <div className="subtitle">Nguyễn Đắc Tịnh Tín</div>
            </div>
            <div className="subtitle">
                <i className="fas fa-book" style={{ marginRight: '8px', color: '#0670bf' }}></i>
                Kỹ Thuật Phần Mềm
            </div>
            <div className="subtitle">
                <i className="fas fa-calendar-alt" style={{ marginRight: '8px', color: '#34D399' }}></i>
                Khóa 45 (2021 - 2025)
            </div>
        </div>
        <div className="grid-container">
            <div className="card-container-short">
                {/* Pie Chart - Credit Distribution */}
                <div className="card short">
                    <h3>BIỂU ĐỒ TÍN CHỈ</h3>
                    <div className="chart-short-container">
                        {isValidData(creditData) ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie 
                                        data={creditData} 
                                        dataKey="value" 
                                        outerRadius={80} 
                                        innerRadius={40} 
                                    >
                                        {creditData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="error-message">Không có dữ liệu</p>
                        )}
                    </div>

                    {/* Legend for Credit Chart */}
                    <div className="legend-container">
                        {creditData.map((entry, index) => (
                            <div key={index} className="legend-item">
                                <span className="legend-dot" style={{ backgroundColor: entry.color }}></span>
                                {entry.name} ({entry.value})
                            </div>
                        ))}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="card semi-long imy-20">
                    <h3>TIẾN TRÌNH HỌC TẬP</h3>
                    <div className="chart-short-container1">
                        {isValidData(progressData) ? (
                            <ResponsiveContainer width="100%" height={150}>
                                <PieChart>
                                    <Pie
                                        dataKey="percentage"
                                        startAngle={180}
                                        endAngle={0}
                                        data={progressData}
                                        cx="50%"
                                        cy="75%"
                                        outerRadius={80}
                                        innerRadius={40}
                                        fill="#34D399"
                                    >
                                        {progressData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))} 
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="error-message">Không có dữ liệu</p>
                        )}
                    </div>
                    <p className="imy-20">Bạn đã hoàn thành <span style={{color: '#0670bf'}}>{progressPercent}%</span> lộ trình học tập</p>
                    <div className="footer"><Link to='/process'>Click vào đây</Link> để xây dựng lộ trình học tập hợp lý</div>
                    <div className="d-flex justify-content-between">
                        <div className="text-left">
                            <div className="d-flex">
                                <AiOutlineBarChart className="icon" />
                                <div>
                                    <p className="progress-text">GPA</p>
                                    <strong>2.92</strong>
                                </div>
                            </div>
                            <div className="imy-20 d-flex">
                                <AiOutlineBook className="icon" />
                                <div>
                                    <p className="progress-text">Số tín chỉ tích lũy</p>
                                    <strong>109</strong>
                                </div>
                            </div>
                        </div>
                        <div className="text-left">
                            <div className="d-flex">
                                <FaGraduationCap className="icon" />
                                <div>
                                    <p className="progress-text">Học lực</p>
                                    <strong>KHÁ</strong>
                                </div>
                            </div>
                            <div className="imy-20 d-flex">
                                <FaClipboardList className="icon" /> 
                                <div>
                                    <p className="progress-text">Số tín chỉ còn thiếu</p>
                                    <strong>14</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card-container-long">
                {/* Score Trend */}
                <div className="card long">
                    <h3>ĐIỂM THEO {scoreView === "semester" ? "HỌC KỲ" : "NĂM"}</h3>
                    <div className="d-flex" style={{flexDirection: 'row-reverse'}}>
                        <div className="chart-options">
                            <select value={scoreView} onChange={(e) => setScoreView(e.target.value)}>
                                <option value="semester">Điểm Theo Học Kỳ</option>
                                <option value="year">Điểm Theo Năm</option>
                            </select>
                        </div>
                        <div className="chart-options">
                            <select value={chartType} onChange={(e) => setChartType(e.target.value)}>
                                <option value="bar">Biểu đồ cột</option>
                                <option value="line">Biểu đồ đường</option>
                            </select>
                        </div>
                    </div>
                    <div className="chart-container">
                        {isValidData(scoreView === "semester" ? scoreData : scoreYearData) ? (
                            <ResponsiveContainer width="100%" height={300}>
                                {chartType === "bar" ? (
                                    <BarChart data={scoreView === "semester" ? scoreData : scoreYearData}>
                                        <XAxis dataKey={scoreView === "semester" ? "semester" : "year"} />
                                        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                                        <YAxis />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="score" fill="#0670bf" barSize={40} radius={[5, 5, 0, 0]} />
                                    </BarChart>
                                ) : (
                                    <LineChart data={scoreView === "semester" ? scoreData : scoreYearData}>
                                        <XAxis dataKey={scoreView === "semester" ? "semester" : "year"} />
                                        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                                        <YAxis />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Line type="monotone" dataKey="score" stroke="#0670bf" strokeWidth={2} />
                                    </LineChart>
                                )}
                            </ResponsiveContainer>
                        ) : (
                            <p className="error-message">Không có dữ liệu</p>
                        )}
                    </div>
                    {/* Legend for Score Trend Chart */}
                    {chartType === "bar" ? (
                        <div className="legend-container">
                            <div className="legend-item">
                                <span className="legend-dot" style={{ backgroundColor: '#0670bf' }}></span>
                                Điểm trung bình hệ 10
                            </div>
                        </div>
                    ) : (
                        <div className="legend-container">
                            <div className="legend-item">
                                <span className="legend-line" style={{ backgroundColor: '#0670bf' }}></span>
                                Điểm trung bình hệ 10
                            </div>
                        </div>
                    )}
                </div>

                {/* Study Trends */}
                <div className="card long imy-20" style={{height: '410px'}}>
                    <h3>XU HƯỚNG HỌC TẬP</h3>
                    <div className="chart-container">
                        {isValidData(studyTrendData) ? (
                            <ResponsiveContainer width="100%" height={300}>
                                {chartType === "bar" ? (
                                    <BarChart data={studyTrendData}>
                                        <XAxis dataKey="year" />
                                        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                                        <YAxis />
                                        <Tooltip content={<CustomTooltipTrend/>}/>
                                        <Bar dataKey="credits" fill="#34D399" barSize={50} radius={[5, 5, 0, 0]} />
                                    </BarChart>
                                ) : (
                                    <LineChart data={studyTrendData}>
                                        <XAxis dataKey="year" />
                                        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                                        <YAxis />
                                        <Tooltip content={<CustomTooltipTrend/>}/>
                                        <Line type="monotone" dataKey="credits" stroke="#34D399" strokeWidth={2} />
                                    </LineChart>
                                )}
                            </ResponsiveContainer>
                        ) : (
                            <p className="error-message">Không có dữ liệu</p>
                        )}
                    </div>
                    {/* Legend for Study Trends Chart */}
                    {chartType === "bar" ? (
                        <div className="legend-container">
                            <div className="legend-item">
                                <span className="legend-dot" style={{ backgroundColor: '#34D399' }}></span>
                                Số tín chỉ đã học
                            </div>
                        </div>
                    ) : (
                        <div className="legend-container">
                            <div className="legend-item">
                                <span className="legend-line" style={{ backgroundColor: '#34D399' }}></span>
                                Số tín chỉ đã học
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </div>
    );
};

export default Statistics;
