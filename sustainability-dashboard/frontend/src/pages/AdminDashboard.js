import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Row, Col, Card, Alert, Spinner, Button, InputGroup } from 'react-bootstrap';
import BarChart from '../components/BarChart';

const initialFormState = {
    carbon_emission: '', water_consumption: '', waste_water: '',
    solid_waste: '', trees_plantation: '', carbon_absorption: ''
};

const AdminDashboard = () => {
    const [plants, setPlants] = useState([]);
    const [selectedPlant, setSelectedPlant] = useState('');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(false);
    const [barChartData, setBarChartData] = useState(null);
    const [formData, setFormData] = useState(initialFormState);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    const token = localStorage.getItem('token');
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        const fetchPlants = async () => {
            try {
                const res = await axios.get('/api/data/plants', authHeader);
                setPlants(res.data);
                if (res.data.length > 0) setSelectedPlant(res.data[0].id);
            } catch (err) { console.error("Failed to fetch plants", err); }
        };
        fetchPlants();
    }, []);

    useEffect(() => {
        if (!selectedPlant || !selectedYear) return;
        
        const fetchData = async () => {
            setLoading(true);
            setMessage({ type: '', text: '' });
            try {
                const res = await axios.get(`/api/data/${selectedPlant}/${selectedYear}`, authHeader);
                setFormData(res.data || initialFormState);
                
                if (res.data && Object.keys(res.data).length > 0) {
                    const labels = ['Carbon Emission (tCO2e)', 'Water Consumption (KL)', 'Waste Water (KL)', 'Solid Waste (Tonnes)'];
                    const values = [res.data.carbon_emission, res.data.water_consumption, res.data.waste_water, res.data.solid_waste];
                    setBarChartData({
                        labels,
                        datasets: [{ label: `Metrics for ${selectedYear}`, data: values, backgroundColor: '#36A2EB' }]
                    });
                } else {
                    setBarChartData(null);
                }
            } catch (err) {
                console.error("Failed to fetch data", err);
                setFormData(initialFormState);
                setBarChartData(null);
            }
            setLoading(false);
        };
        fetchData();
    }, [selectedPlant, selectedYear]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...formData, plant_id: selectedPlant, year: selectedYear };
            await axios.post('/api/data', payload, authHeader);
            setMessage({ type: 'success', text: 'Data saved successfully!' });
        } catch (err) {
            setMessage({ type: 'danger', text: 'Failed to save data.' });
        }
        setLoading(false);
    };

    return (
        <div>
            <h2>Admin Dashboard</h2>
            <p>View and manage sustainability data.</p>
            <Row>
                <Col lg={5}>
                    <h3>Manage Data</h3>
                    <Card className="p-3">
                         <Form onSubmit={handleSubmit}>
                            <Row>
                                <Col md={6} className="mb-2">
                                    <Form.Label>Plant</Form.Label>
                                    <Form.Select value={selectedPlant} onChange={(e) => setSelectedPlant(e.target.value)} disabled={loading}>
                                        {plants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </Form.Select>
                                </Col>
                                <Col md={6} className="mb-2">
                                    <Form.Label>Year</Form.Label>
                                    <Form.Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} disabled={loading}>
                                        <option value="2022">2022</option>
                                        <option value="2023">2023</option>
                                        <option value="2024">2024</option>
                                        <option value="2025">2025</option>
                                    </Form.Select>
                                </Col>
                            </Row>
                            <hr />
                            {Object.keys(initialFormState).map(key => (
                                <Form.Group key={key} className="mb-2">
                                    <Form.Label>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Form.Label>
                                    <InputGroup>
                                        <Form.Control type="number" name={key} value={formData[key] || ''} onChange={handleInputChange} placeholder="0" required />
                                    </InputGroup>
                                </Form.Group>
                            ))}
                            <Button type="submit" className="w-100 mt-3" disabled={loading}>
                                {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Save Data'}
                            </Button>
                            {message.text && <Alert variant={message.type} className="mt-3">{message.text}</Alert>}
                        </Form>
                    </Card>
                </Col>
                <Col lg={7}>
                    <h3>Data Visualization</h3>
                    {loading ? (
                        <div className="text-center mt-5"><Spinner animation="border" /></div>
                    ) : barChartData ? (
                        <Card className="p-3"><BarChart chartData={barChartData} title="Current Environmental Metrics" /></Card>
                    ) : (
                        <Alert variant="info" className="mt-4">No data to display. Select a plant and year, or add new data.</Alert>
                    )}
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboard;