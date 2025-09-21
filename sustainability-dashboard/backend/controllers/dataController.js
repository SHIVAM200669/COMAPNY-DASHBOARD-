const db = require('../config/db');

exports.getPlants = async (req, res) => {
    try {
        const [plants] = await db.query('SELECT * FROM plants ORDER BY name');
        res.json(plants);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPlantData = async (req, res) => {
    const { plantId, year } = req.params;
    try {
        const [data] = await db.query(
            'SELECT * FROM sustainability_data WHERE plant_id = ? AND year = ?',
            [plantId, year]
        );
        res.json(data[0] || {}); // Return data or empty object if none found
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addOrUpdatePlantData = async (req, res) => {
    const {
        plant_id, year, carbon_emission, water_consumption,
        waste_water, solid_waste, trees_plantation, carbon_absorption
    } = req.body;

    try {
        // Using INSERT ... ON DUPLICATE KEY UPDATE to handle both adding and modifying
        const sql = `
            INSERT INTO sustainability_data (plant_id, year, carbon_emission, water_consumption, waste_water, solid_waste, trees_plantation, carbon_absorption)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                carbon_emission = VALUES(carbon_emission),
                water_consumption = VALUES(water_consumption),
                waste_water = VALUES(waste_water),
                solid_waste = VALUES(solid_waste),
                trees_plantation = VALUES(trees_plantation),
                carbon_absorption = VALUES(carbon_absorption);
        `;
        await db.query(sql, [plant_id, year, carbon_emission, water_consumption, waste_water, solid_waste, trees_plantation, carbon_absorption]);
        res.status(201).json({ message: 'Data saved successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};