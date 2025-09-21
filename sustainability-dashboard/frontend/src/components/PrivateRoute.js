import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, roles }) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    if (!token) {
        // Not logged in
        return <Navigate to="/login" />;
    }

    if (!roles.includes(userRole)) {
        // Logged in but wrong role
        return <Navigate to="/" />;
    }

    return children;
};

export default PrivateRoute;