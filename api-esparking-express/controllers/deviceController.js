const Device = require('../models/Device');
const ParkingSpot = require('../models/ParkingSpot'); // Needed for associating devices with spots

// @desc    Create a new Device
// @route   POST /api/devices
// @access  Private (Admin/Authorized User)
exports.createDevice = async (req, res) => {
  try {
    const { name, parkingSpotId } = req.body;
    const organizationId = req.user.organization;

    // Check if a device with this name already exists for the organization
    const existingDevice = await Device.findOne({ name, organization: organizationId });
    if (existingDevice) {
      return res.status(400).json({ message: 'Ya existe un dispositivo con este nombre en su organización.' });
    }

    let parkingSpot = null;
    if (parkingSpotId) {
      parkingSpot = await ParkingSpot.findOne({ _id: parkingSpotId, organization: organizationId });
      if (!parkingSpot) {
        return res.status(404).json({ message: 'El ParkingSpot especificado no existe o no pertenece a su organización.' });
      }
      // Check if the parking spot is already assigned to another device
      const deviceAssignedToSpot = await Device.findOne({ parkingSpot: parkingSpotId });
      if (deviceAssignedToSpot) {
        return res.status(400).json({ message: 'Este ParkingSpot ya está asignado a otro dispositivo.' });
      }
    }

    const device = await Device.create({
      name,
      parkingSpot: parkingSpotId,
      organization: organizationId
    });

    // If a parking spot was assigned, update the parking spot to reference this device
    if (parkingSpot) {
        await ParkingSpot.findByIdAndUpdate(parkingSpotId, { device: device._id });
    }

    // Return the API key only on creation
    res.status(201).json({
      _id: device._id,
      name: device.name,
      apiKey: device.apiKey, // Only return API key on creation
      parkingSpot: device.parkingSpot,
      createdAt: device.createdAt
    });
  } catch (error) {
    console.error('Error creating device:', error);
    res.status(500).json({ message: 'Error al crear el dispositivo', error: error.message });
  }
};

// @desc    Get all Devices
// @route   GET /api/devices
// @access  Private (Admin/Authorized User)
exports.getDevices = async (req, res) => {
  try {
    const organizationId = req.user.organization;
    // Do not select apiKey for security reasons
    const devices = await Device.find({ organization: organizationId }).select('-apiKey').populate('parkingSpot', 'spotIdentifier');
    res.status(200).json(devices);
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ message: 'Error al obtener los dispositivos', error: error.message });
  }
};

// @desc    Delete a Device
// @route   DELETE /api/devices/:id
// @access  Private (Admin/Authorized User)
exports.deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organization;

    const device = await Device.findOneAndDelete({ _id: id, organization: organizationId });

    if (!device) {
      return res.status(404).json({ message: 'Dispositivo no encontrado o no pertenece a su organización.' });
    }

    // If the device was associated with a parking spot, clear that reference
    if (device.parkingSpot) {
        await ParkingSpot.findByIdAndUpdate(device.parkingSpot, { $unset: { device: 1 } });
    }

    res.status(200).json({ message: 'Dispositivo eliminado exitosamente.' });
  } catch (error) {
    console.error('Error deleting device:', error);
    res.status(500).json({ message: 'Error al eliminar el dispositivo', error: error.message });
  }
};
