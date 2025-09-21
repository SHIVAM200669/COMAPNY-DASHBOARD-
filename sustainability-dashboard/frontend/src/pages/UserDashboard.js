import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import BarChart from '../components/BarChart';
import PieChart from '../components/PieChart';

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

    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

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
    }, []);

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
    }, [selectedPlant, selectedYear]);

    useEffect(() => {
        if (!data || Object.keys(data).length === 0) {
            setBarChartData(null);
            setPieChartData(null);
            return;
        }

        const labels = ['Carbon Emission (tCO2e)', 'Water Consumption (KL)', 'Waste Water (KL)', 'Solid Waste (Tonnes)'];
        const values = [data.carbon_emission, data.water_consumption, data.waste_water, data.solid_waste];
        
        setBarChartData({
            labels,
            datasets: [{
                label: `Metrics for ${selectedYear}`,
                data: values,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
            }]
        });

        setPieChartData({
            labels: ['Carbon Emission', 'Carbon Absorption'],
            datasets: [{
                label: 'Carbon Balance (tCO2e)',
                data: [data.carbon_emission, data.carbon_absorption],
                backgroundColor: ['#FF6384', '#36A2EB'],
            }]
        });
    }, [data, selectedYear]);

    return (
        <div>
            <h2>Welcome, {username}!</h2>
            <p>View sustainability data for our plants.</p>
            <Card className="p-3 mb-4">
                <Row>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Select Plant</Form.Label>
                            <Form.Select value={selectedPlant} onChange={(e) => setSelectedPlant(e.target.value)} disabled={loading}>
                                {plants.map(plant => (
                                    <option key={plant.id} value={plant.id}>{plant.name}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Select Year</Form.Label>
                            <Form.Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} disabled={loading}>
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
                    <Col lg={8}><BarChart chartData={barChartData} title="Environmental Metrics" /></Col>
                    <Col lg={4}><PieChart chartData={pieChartData} title="Carbon Balance" /></Col>
                </Row>
            ) : (
                <Alert variant="info">No data available for the selected plant and year.</Alert>
            )}
        </div>
    );
};

export default UserDashboard;