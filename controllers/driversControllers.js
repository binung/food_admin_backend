const Driver = require('../models/Drivers');
const Order = require('../models/Order');
const User = require('../models/User');
const {  rejectionDriverEmail } = require('../utils/driver_rejection_email');
const {  sendVerificationEmail } = require('../utils/driver_verification_email');

module.exports = {
    createDriver: async (req, res) => {
        try {
            const {
                vehicleType,
                phone,
                vehicleNumber,
                currentLocation,
                owner
            } = req.body;
    
            const newDriver = new Driver({
                owner,
                vehicleType,
                phone,
                vehicleNumber,
                currentLocation: {
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                },
            });
          console.log(currentLocation.latitude,);
          console.log(currentLocation.longitude,);
            await newDriver.save();
    
            res.status(201).json({ success: true,  driver: newDriver });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Failed to create driver', error: error.message });
        }
    
    },
    
    getDriverOrders: async (req, res) => {
        const page  = req.query.page || 1;
        const ITEMS_PER_PAGE = req.query.limit || 10;
        try {
            const orders = await Order.find({ orderStatus: req.query.orderStatus, driverId: req.query.id}, {deliveryFee: 1, orderStatus: 1, orderItems: 1})
                .populate({
                    path: 'orderItems.foodId',
                    select: "imageUrl title"
                }).sort({ createdAt: -1 })
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);

                const totalItems = await Order.countDocuments({ orderStatus: req.query.orderStatus, page: req.query.page});
                const fulfilled = await Order.countDocuments({ orderStatus: 'Delivered', page: req.query.id});
                const incomplete = await Order.countDocuments({ orderStatus: 'Out_for_Delivery', page: req.query.id});

                res.status(200).json({
                    orders,
                    fulfilled: fulfilled,
                    incomplete: incomplete,
                    currentPage: +page,
                    totalPages: Math.ceil(totalItems / ITEMS_PER_PAGE),
                });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },
    getDrivers: async (req, res) => {
        const page = parseInt(req.query.page, 10) || 1;
        const ITEMS_PER_PAGE = parseInt(req.query.limit, 10) || 5;
        const status = req.query.status;
    
        try {
            const currentPage = Math.max(page, 1);
    
            let query = {};
            if (status) {
                query.verification = status;
            }
    
            const totalItems = await Driver.countDocuments(query);
    
            const drivers = await Driver.find(query, {
                vehicleType: 1,
                phone: 1,
                vehicleNumber: 1,
                currentLocation: 1,
                profileImage: 1,
                owner: 1,
                verification: 1, // Include verification field
                isAvailable: 1, // Include isAvailable field
            })
                .sort({ createdAt: -1 })
                .skip((currentPage - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
    
            res.status(200).json({
                drivers,
                currentPage,
                totalPages: Math.ceil(totalItems / ITEMS_PER_PAGE),
            });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    }
,    
getDriverProfileByToken: async (req, res) => {
    try {
      const userId = req.params.userId; // Extract userId from route parameters
      console.log('Received userId:', userId);

      const driverData = await Driver.findOne({ owner: userId });
      console.log('Fetched driverData:', driverData);

      if (driverData) {
        res.status(200).json(driverData); // Return the driver data
      } else {
        res.status(404).send('Driver data not found for the given user ID');
      }
    } catch (error) {
      console.error('Error fetching driver profile:', error); // Log the error
      res.status(500).json({ success: false, message: error.message });
    }
  }
,


    


    updateDriverStatus: async (req, res) => {
        const id = req.query.id;
        const status = req.query.status;
        try {
            const driver = await Driver.findByIdAndUpdate(id, { verification: status }, { new: true });
    
            const user = await User.findById(driver.driver, { email: 1, fcm: 1, username: 1 });
    
            if (user.email) {
            if (status === "Verified") {
                await sendVerificationEmail(user.email, user.username);
            } else if (status === "Rejected") {
                await rejectionDriverEmail(user.email, user.username);
            }
        }
            res.status(200).json({ status: true, message: "Driver status updated successfully" }); // Update response message
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    }
}