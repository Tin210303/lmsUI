import React from 'react';
import { Outlet, Routes, Route } from 'react-router-dom';
import '../assets/css/content.css';

function Content() {
  return (
    <div className="main-content">
      <Outlet />
    </div>
  );
}

export default Content;