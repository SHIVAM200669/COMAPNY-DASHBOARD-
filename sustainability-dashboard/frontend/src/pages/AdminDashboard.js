import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Form, Row, Col, Card, Alert, Spinner, Button, InputGroup } from 'react-bootstrap';
import BarChart from '../components/BarChart';

const initialFormState = {
    carbon_emission: '', water_consumption: '', waste_water: '',
    solid_waste: '', trees_plantation: '', carbon_absorption: ''
};

const units = {
    carbon_emission: 'tCO2e',
    water_consumption: 'KL',
    waste_water: 'KL',
    solid_waste: 'Tonnes',
    trees_plantation: 'Trees',
    carbon_absorption: 'tCO2e'
};


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

const AdminDashboard = () => {
    const [plants, setPlants] = useState([]);
    const [selectedPlant, setSelectedPlant] = useState('');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(false);
    const [barChartData, setBarChartData] = useState(null);
    const [formData, setFormData] = useState(initialFormState);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [data, setData] = useState(null);

    const token = localStorage.getItem('token');
    const authHeader = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

    useEffect(() => {
        const fetchPlants = async () => {
            try {
                const res = await axios.get('/api/data/plants', authHeader);
                setPlants(res.data);
                if (res.data.length > 0) setSelectedPlant(res.data[0].id);
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
            setMessage({ type: '', text: '' });
            try {
                const res = await axios.get(`/api/data/${selectedPlant}/${selectedYear}`, authHeader);
                const fetchedData = res.data;
                setData(fetchedData);
                const completeData = Object.keys(initialFormState).reduce((acc, key) => {
                    acc[key] = fetchedData[key] || '';
                    return acc;
                }, {});
                setFormData(completeData);
                if (fetchedData && Object.keys(fetchedData).length > 0) {
                    const labels = [
                        'Carbon Emission (tCO2e)',
                        'Water Consumption (KL)',
                        'Waste Water (KL)',
                        'Solid Waste (Tonnes)'
                    ];
                    const values = [
                        fetchedData.carbon_emission,
                        fetchedData.water_consumption,
                        fetchedData.waste_water,
                        fetchedData.solid_waste
                    ];
                    setBarChartData({
                        labels,
                        datasets: [{
                            label: `Metrics for ${selectedYear}`,
                            data: values,
                            backgroundColor: '#36A2EB'
                        }]
                    });
                } else {
                    setBarChartData(null);
                }
            } catch (err) {
                console.error("Failed to fetch data", err);
                setFormData(initialFormState);
                setBarChartData(null);
                setData(null);
            }
            setLoading(false);
        };
        fetchData();
    }, [selectedPlant, selectedYear, authHeader]);

    const handleInputChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

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
            <Row className="mb-3">
                <Col md={4}><StatBox iconClass="bi-cloud" title="Carbon Emission" value={data?.carbon_emission} unit="tCO2e" color="#dc3545" loading={loading} /></Col>
                <Col md={4}><StatBox iconClass="bi-droplet" title="Water Consumption" value={data?.water_consumption} unit="KL" color="#0d6efd" loading={loading} /></Col>
                <Col md={4}><StatBox iconClass="bi-water" title="Waste Water" value={data?.waste_water} unit="KL" color="#6c757d" loading={loading} /></Col>
                <Col md={4}><StatBox iconClass="bi-trash" title="Solid Waste" value={data?.solid_waste} unit="Tonnes" color="#fd7e14" loading={loading} /></Col>
                <Col md={4}><StatBox iconClass="bi-tree" title="Trees Planted" value={data?.trees_plantation} unit="Trees" color="#198754" loading={loading} /></Col>
                <Col md={4}><StatBox iconClass="bi-wind" title="Carbon Absorption" value={data?.carbon_absorption} unit="tCO2e" color="#0dcaf0" loading={loading} /></Col>
            </Row>
            <Row>
                <Col lg={5}>
                    <h3>Manage Data</h3>
                    <Card className="p-3">
                        <Form onSubmit={handleSubmit}>
                            <Row>
                                <Col md={6} className="mb-2">
                                    <Form.Label>Plant</Form.Label>
                                    <Form.Select
                                        value={selectedPlant}
                                        onChange={(e) => setSelectedPlant(e.target.value)}
                                        disabled={loading}
                                    >
                                        {plants.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </Form.Select>
                                </Col>
                                <Col md={6} className="mb-2">
                                    <Form.Label>Year</Form.Label>
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
                                </Col>
                            </Row>
                            <hr />
                            {Object.keys(initialFormState).map(key => (
                                <Form.Group key={key} className="mb-2">
                                    <Form.Label>
                                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type="number"
                                            step="any"
                                            name={key}
                                            value={formData[key]}
                                            onChange={handleInputChange}
                                            placeholder="0"
                                            required
                                        />
                                        <InputGroup.Text>{units[key]}</InputGroup.Text>
                                    </InputGroup>
                                </Form.Group>
                            ))}
                            <Button
                                type="submit"
                                className="w-100 mt-3"
                                disabled={loading || !selectedPlant}
                            >
                                {loading ? (
                                    <Spinner as="span" animation="border" size="sm" />
                                ) : (
                                    'Save Data'
                                )}
                            </Button>
                            {message.text && (
                                <Alert variant={message.type} className="mt-3">{message.text}</Alert>
                            )}
                        </Form>
                    </Card>
                </Col>
                <Col lg={7}>
                    <h3>Data Visualization</h3>
                    {loading ? (
                        <div className="text-center mt-5"><Spinner animation="border" /></div>
                    ) : barChartData ? (
                        <Card className="p-3">
                            <BarChart chartData={barChartData} title="Current Environmental Metrics" />
                        </Card>
                    ) : (
                        <Alert variant="info" className="mt-4">
                            No data to display. Select a plant and year, or add new data.
                        </Alert>
                    )}
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboard;
