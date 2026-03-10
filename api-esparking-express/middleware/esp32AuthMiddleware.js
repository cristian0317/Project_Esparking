const Device = require('../models/Device'); // Import the Device model
const ParkingSpot = require('../models/ParkingSpot'); // Import the ParkingSpot model

const esp32Auth = async (req, res, next) => {
  let apiKey;

  if (req.headers['x-api-key']) {
    apiKey = req.headers['x-api-key'];
  }

  if (!apiKey) {
    return res.status(401).json({ message: 'No API Key provided. Authorization denied.' });
  }

  try {
    // Find the Device using the provided API key
    const device = await Device.findOne({ apiKey });

    if (!device) {
      return res.status(401).json({ message: 'Invalid API Key. Authorization denied.' });
    }

    // Ensure the device is associated with a parking spot
    if (!device.parkingSpot) {
      return res.status(403).json({ message: 'Device is not assigned to a parking spot. Authorization denied.' });
    }

    // Attach the authenticated spot's ID to the request for further use
    req.esp32SpotId = device.parkingSpot.toString(); // device.parkingSpot is already the ObjectId
    next();
  } catch (error) {
    console.error('ESP32 Auth Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = esp32Auth;