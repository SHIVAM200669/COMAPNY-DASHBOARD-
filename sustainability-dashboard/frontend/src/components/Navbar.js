import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, Button, Container } from 'react-bootstrap';

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <BootstrapNavbar bg="dark" variant="dark" expand="lg" sticky="top">
            <Container>
                <BootstrapNavbar.Brand as={Link} to="/">🌱 EcoDash</BootstrapNavbar.Brand>
                <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
                <BootstrapNavbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        {token && <Nav.Link as={Link} to={role === 'admin' ? '/admin' : '/dashboard'}>Dashboard</Nav.Link>}
                    </Nav>
                    <Nav className="ms-auto">
                        {!token ? (
                            <>
                                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                                <Nav.Link as={Link} to="/signup">Sign Up</Nav.Link>
                            </>
                        ) : (
                            <>
                                <BootstrapNavbar.Text className="me-3">
                                    Signed in as: <span className="text-white">{username}</span>
                                </BootstrapNavbar.Text>
                                <Button variant="outline-success" onClick={handleLogout}>Logout</Button>
                            </>
                        )}
                    </Nav>
                </BootstrapNavbar.Collapse>
            </Container>
        </BootstrapNavbar>
    );
};

export default Navbar;