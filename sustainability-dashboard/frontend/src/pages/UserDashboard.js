import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Form, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import BarChart from '../components/BarChart';
import PieChart from '../components/PieChart';

// ✅ StatBox now uses <i> with Bootstrap Icons
const StatBox = ({ iconClass, value, title, unit, color, loading }) => {
    const cardStyle = {
        border: 'none', borderRadius: '0.5rem',
        boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)',
        marginBottom: '1.5rem', borderLeft: `5px solid ${color}`
    };
    const iconStyle = {
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '50px', height: '50px', color: 'white',
        borderRadius: '50%', fontSize: '1.5rem', backgroundColor: color
    };
    return (
        <Card style={cardStyle}>
            <Card.Body>
                <Row className="align-items-center">
                    <Col xs="auto">
                        <div style={iconStyle}>
                            <i className={`bi ${iconClass}`}></i>
                        </div>
                    </Col>
                    <Col>
                        <h6 className="text-muted mb-1">{title}</h6>
                        {loading ? (
                            <Spinner animation="border" size="sm" />
                        ) : (
                            <h4 className="mb-0">
                                {value ? Number(value).toLocaleString() : 'N/A'} <small>{unit}</small>
                            </h4>
                        )}
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

const UserDashboard = () => {
    const [plants, setPlants] = useState([]);
    const [selectedPlant, setSelectedPlant] = useState('');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [barChartData, setBarChartData] = useState(null);
    const [pieChartData, setPieChartData] = useState(null);

    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    const authHeader = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

    useEffect(() => {
        const fetchPlants = async () => {
            try {
                const res = await axios.get('/api/data/plants', authHeader);
                setPlants(res.data);
                if (res.data.length > 0) {
                    setSelectedPlant(res.data[0].id);
                }
            } catch (err) {
                console.error("Failed to fetch plants", err);
            }
        };
        fetchPlants();
    }, [authHeader]);

    useEffect(() => {
        if (!selectedPlant || !selectedYear) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`/api/data/${selectedPlant}/${selectedYear}`, authHeader);
                setData(res.data);
            } catch (err) {
                console.error("Failed to fetch data", err);
                setData(null);
            }
            setLoading(false);
        };
        fetchData();
    }, [selectedPlant, selectedYear, authHeader]);

    useEffect(() => {
        if (!data || Object.keys(data).length === 0) {
            setBarChartData(null);
            setPieChartData(null);
            return;
        }
        const labels = [
            'Carbon Emission (tCO2e)',
            'Water Consumption (KL)',
            'Waste Water (KL)',
            'Solid Waste (Tonnes)'
        ];
        const values = [
            data.carbon_emission,
            data.water_consumption,
            data.waste_water,
            data.solid_waste
        ];
        setBarChartData({
            labels,
            datasets: [{
                label: `Metrics for ${selectedYear}`,
                data: values,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
            }]
        });
        setPieChartData({
            labels: ['Carbon Emission', 'Carbon Absorption'],
            datasets: [{
                label: 'Carbon Balance (tCO2e)',
                data: [data.carbon_emission, data.carbon_absorption],
                backgroundColor: ['#FF6384', '#36A2EB']
            }]
        });
    }, [data, selectedYear]);

    return (
        <div>
            <h2>Welcome, {username}!</h2>
            <p>View sustainability data for our plants.</p>
            <Row className="mb-3">
                <Col md={4}>
                    <StatBox iconClass="bi-cloud" title="Carbon Emission" value={data?.carbon_emission} unit="tCO2e" color="#dc3545" loading={loading} />
                </Col>
                <Col md={4}>
                    <StatBox iconClass="bi-droplet" title="Water Consumption" value={data?.water_consumption} unit="KL" color="#0d6efd" loading={loading} />
                </Col>
                <Col md={4}>
                    <StatBox iconClass="bi-water" title="Waste Water" value={data?.waste_water} unit="KL" color="#6c757d" loading={loading} />
                </Col>
                <Col md={4}>
                    <StatBox iconClass="bi-trash" title="Solid Waste" value={data?.solid_waste} unit="Tonnes" color="#fd7e14" loading={loading} />
                </Col>
                <Col md={4}>
                    <StatBox iconClass="bi-tree" title="Trees Planted" value={data?.trees_plantation} unit="Trees" color="#198754" loading={loading} />
                </Col>
                <Col md={4}>
                    <StatBox iconClass="bi-wind" title="Carbon Absorption" value={data?.carbon_absorption} unit="tCO2e" color="#0dcaf0" loading={loading} />
                </Col>
            </Row>
            <Card className="p-3 mb-4">
                <Row>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Select Plant</Form.Label>
                            <Form.Select
                                value={selectedPlant}
                                onChange={(e) => setSelectedPlant(e.target.value)}
                                disabled={loading}
                            >
                                {plants.map(plant => (
                                    <option key={plant.id} value={plant.id}>{plant.name}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Select Year</Form.Label>
                            <Form.Select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                disabled={loading}
                            >
                                <option value="2022">2022</option>
                                <option value="2023">2023</option>
                                <option value="2024">2024</option>
                                <option value="2025">2025</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>
            </Card>
            {loading ? (
                <div className="text-center"><Spinner animation="border" /></div>
            ) : barChartData ? (
                <Row>
                    <Col lg={8}>
                        <BarChart chartData={barChartData} title="Environmental Metrics" />
                    </Col>
                    <Col lg={4}>
                        <PieChart chartData={pieChartData} title="Carbon Balance" />
                    </Col>
                </Row>
            ) : (
                <Alert variant="info">No data available for the selected plant and year.</Alert>
            )}
        </div>
    );
};

export default UserDashboard;
