import React from 'react';
import { Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="landing-page">
            <Container>
                <h1 className="display-3">Welcome to EcoDash</h1>
                <p className="lead">
                    Your central dashboard for tracking and analyzing corporate sustainability metrics.
                </p>
                <hr className="my-4" />
                <p>
                    Visualize environmental impact, manage data across multiple plants, and drive your green initiatives forward.
                </p>
                <p className="lead">
                    <Button as={Link} to="/login" variant="primary" size="lg">Get Started</Button>
                </p>
            </Container>
        </div>
    );
};

export default LandingPage;