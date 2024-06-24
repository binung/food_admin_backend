const mongoose = require('mongoose');
const Order = require('../models/Order');
const Driver = require('../models/Drivers');
module.exports = {
    placeOrder: async (req, res) => {
        try {
            // Extract order data from the request body
            const {
                userId,
                orderItems,
                orderTotal,
                restaurantAddress,
                restaurantCoords,
                recipientCoords,
                deliveryFee,
                grandTotal,
                deliveryAddress,
                paymentMethod,
                restaurantId
            } = req.body;
    
            // Create a new order instance with the extracted data
            const newOrder = new Order({
                userId,
                orderItems: orderItems.map(item => ({
                    foodId: item.foodId,
                    additives: item.additives,
                    quantity: item.quantity,
                    price: item.price,
                    instructions: item.instructions
                })),
                orderTotal,
                restaurantAddress,
                restaurantCoords,
                recipientCoords,
                deliveryFee,
                grandTotal,
                deliveryAddress,
                paymentMethod,
                restaurantId
            });
    
            // Save the new order to the database
            await newOrder.save();
    
            // Return the newly created order in the response
            res.status(201).json({
                success: true,
                message: 'Order placed successfully',
                order: newOrder._id.toString() // Send only the order ID
            });
        } catch (error) {
            // Handle errors
            res.status(500).json({
                success: false,
                message: 'Failed to place order',
                order: null,
                error: error.message
            });
        }
    },
    getAllOrders: async (req, res) => {
        try {
            console.log('Received request to fetch all orders.');

            const orders = await Order.find();

            if (!orders || orders.length === 0) {
                console.log('No orders found.');
                return res.status(404).json({ status: false, message: 'No orders found.' });
            }

            console.log(`Found ${orders.length} orders.`);
            res.status(200).json({ status: true, orders });
        } catch (error) {
            console.error(`Error occurred: ${error.message}`);
            res.status(500).json({ status: false, message: error.message });
        }
    },
    
    getOrdersByRestaurant: async (req, res) => {
        const { restaurantId } = req.params;
        const { orderStatus } = req.query; // Extract orderStatus from query parameters
    
        console.log(`Received request for restaurantId: ${restaurantId} with status: ${orderStatus}`);
    
        try {
            // Validate restaurantId
            if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
                console.error(`Invalid restaurantId: ${restaurantId}`);
                return res.status(400).json({ status: false, message: 'Invalid restaurantId' });
            }
    
            // Check if the restaurantId exists in the database
            console.log(`Checking if restaurantId exists in the Order collection`);
            const restaurantExists = await Order.exists({ restaurantId });
            if (!restaurantExists) {
                console.log(`No orders found for restaurantId: ${restaurantId}`);
                return res.status(404).json({ status: false, message: 'No orders found for the specified restaurantId.' });
            }
    
            let orders;
            if (orderStatus) {
                // Filter orders based on orderStatus
                orders = await Order.find({ restaurantId, orderStatus }).populate({
                    path: 'orderItems.foodId',
                    select: 'imageUrl title rating time',
                }).populate({
                    path: 'userId',
                    select: 'id phone profile', // Include 'deliveryAddress' field from the 'User' schema
                }).populate({
                    path: 'deliveryAddress',
                    select: 'id addressLine1'
                }).populate({
                    path: 'restaurantId',
                    select: 'id phone profile title time imageUrl logoUrl',
                });
    
                if (!orders || orders.length === 0) {
                    console.log(`No orders found for restaurantId: ${restaurantId} with status: ${orderStatus}`);
                    return res.status(404).json({ status: false, message: 'No orders found for the specified restaurant and status.' });
                }
            } else {
                console.log(`Fetching all orders for restaurantId: ${restaurantId}`);
                // Fetch all orders for the specified restaurantId
                orders = await Order.find({ restaurantId }).populate({
                    path: 'orderItems.foodId',
                    select: 'imageUrl title rating time',
                }).populate({
                    path: 'userId',
                    select: 'id phone profile', // Include 'deliveryAddress' field from the 'User' schema
                }).populate({
                    path: 'deliveryAddress',
                    select: 'id addressLine1'
                }).populate({
                    path: 'restaurantId',
                    select: 'id phone profile title time imageUrl logoUrl',
                });
    
                if (!orders || orders.length === 0) {
                    console.log(`No orders found for restaurantId: ${restaurantId}`);
                    return res.status(404).json({ status: false, message: 'No orders found for the specified restaurant.' });
                }
            }
    
            console.log(`Found ${orders.length} orders for restaurantId: ${restaurantId} with status: ${orderStatus}`);
            res.status(200).json({ status: true, orders });
        } catch (error) {
            console.error(`Error occurred: ${error.message}`);
            res.status(500).json({ status: false, message: error.message });
        }
    },
    
   driverOrder:async(req,res)=>{
    const { driverId } = req.params;

    try {
        // Query the database for orders associated with the given driver ID and status "Ready"
        const orders = await Order.find({ driverId, orderStatus: 'Ready' });

        // Check if orders were found
        if (!orders || orders.length === 0) {
            return res.status(404).json({ success: false, message: 'No "Ready" orders found for the specified driver ID' });
        }

        // Return the fetched orders in the response
        res.status(200).json({ success: true, orders });
    } catch (error) {
        // Handle errors
        console.error('Error fetching orders:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch orders', error: error.message });
    }
   },

   pickOrder: async (req, res) => {
    const { orderId, driverId } = req.params;

    try {
        // Update the order status and assign the driver ID
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { orderStatus: 'Out_for_Delivery', driverId },
            { new: true }
        );

        // Check if the order was updated successfully
        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Return success response
        res.status(200).json({ success: true, message: 'Order picked successfully', order: updatedOrder });
    } catch (error) {
        console.error('Error picking order:', error);
        res.status(500).json({ success: false, message: 'Failed to pick order', error: error.message });
    }
},
getOrdersByDriverAndStatus: async (req, res) => {
    const { driverId, orderStatus } = req.params;

    try {
        const orders = await Order.find({ driverId, orderStatus })
            .populate({
                path: 'userId',
                select: 'id phone profile'
            })
            .populate({
                path: 'orderItems.foodId',
                select: 'id title imageUrl time'
            })
            .populate({
                path: 'deliveryAddress',
                select: 'id addressLine1'
            });

        if (!orders || orders.length === 0) {
            return res.status(404).json({ success: false, message: 'No orders found for the specified driver ID and status' });
        }

        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch orders', error: error.message });
    }
},
getOrdersByStatus: async (req, res) => {
    const { status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
      // Validate the status parameter
      if (!status) {
        return res.status(400).json({ success: false, message: 'Order status is required' });
      }

      // Calculate pagination values
      const skip = (page - 1) * limit;

      // Fetch orders based on status with pagination
      const orders = await Order.find({ orderStatus: status })
        .populate({
          path: 'orderItems.foodId',
          select: 'imageUrl title rating time',
        })
        .populate({
          path: 'userId',
          select: 'id phone profile',
        })
        .populate({
          path: 'deliveryAddress',
          select: 'id addressLine1',
        })
        .populate({
          path: 'restaurantId',
          select: 'id phone profile title time imageUrl logoUrl',
        })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      // Fetch total number of documents for the given status
      const totalItems = await Order.countDocuments({ orderStatus: status });

      res.status(200).json({
        success: true,
        orders,
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
      });
    } catch (error) {
      console.error('Error fetching orders by status:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch orders', error: error.message });
    }
  },







markOrderAsDelivered :async (req, res) => {
    const { orderId } = req.params;

    try {
        // Check if the order ID is valid
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ success: false, message: 'Invalid orderId' });
        }

        // Update the order status to 'Delivered' in the database
        const updatedOrder = await Order.findByIdAndUpdate(orderId, { orderStatus: 'Delivered' }, { new: true });

        // Check if the order was found and updated
        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: 'Order not found or already delivered' });
        }

        // Return success response with updated order details
        res.status(200).json({ success: true, message: 'Order marked as delivered successfully', order: updatedOrder });
    } catch (error) {
        // Handle errors
        console.error(`Error marking order as delivered: ${error.message}`);
        res.status(500).json({ success: false, message: 'Failed to mark order as delivered', error: error.message });
    }
},







    updateOrderStatus: async (req, res) => {
        const { orderId } = req.params;
        const { orderStatus } = req.body;
    
        try {
            console.log(`Received request to update order status for order ID: ${orderId} to status: ${orderStatus}`);
            
            if (!mongoose.Types.ObjectId.isValid(orderId)) {
                return res.status(400).json({ status: false, message: 'Invalid orderId' });
            }
    
            // Fetch the driver based on your application's logic
            // For example, if you want to fetch the driver with the highest rating:
            const driver = await Driver.findOne({}).sort({ rating: -1 });
    
            if (!driver) {
                return res.status(404).json({ status: false, message: 'Driver not found' });
            }
    
            const updatedOrder = await Order.findByIdAndUpdate(orderId, { orderStatus, driverId: driver._id }, { new: true });
    
            console.log(`Order status updated successfully for order ID: ${orderId}`);
            
            if (!updatedOrder) {
                return res.status(404).json({ status: false, message: 'Order not found' });
            }
    
            res.status(200).json({ status: true, message: 'Order status updated successfully', order: updatedOrder });
        } catch (error) {
            console.error(`Error updating order status: ${error.message}`);
            res.status(500).json({ status: false, message: error.message });
        }
    }
    ,
    driverOrder: async (req, res) => {
        try {
            // Query the database for orders that are ready
            const orders = await Order.find({ orderStatus: 'Ready' })
                .populate({
                    path: 'userId',
                    select: 'id phone profile' // Select only id, phone, and profile fields
                })
                .populate({
                    path: 'orderItems',
                    populate: {
                        path: 'foodId',
                        select: 'id title imageUrl time' // Select only id, title, imageUrl, and time fields
                    },
                    select: 'quantity price additives instructions id' // Select only specified fields from OrderItem
                })
                .populate({
                    path: 'deliveryAddress',
                    select: 'id addressLine1' // Select only id and addressLine1 fields from DeliveryAddress
                });
    
            // Check if orders were found
            if (!orders || orders.length === 0) {
                return res.status(404).json({ success: false, message: 'No ready orders found' });
            }
    
            // Return the fetched orders in the response
            res.status(200).json({ success: true, orders });
        } catch (error) {
            // Handle errors
            console.error('Error fetching ready orders:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch ready orders', error: error.message });
        }
    }
    
    
,    
    getReadyOrders: async (req, res) => {
        const page = req.query.page || 1;
    const ITEMS_PER_PAGE = req.query.limit || 5;
    const paymentStatus = req.query.paymentStatus; // New query parameter for paymentStatus

    try {
        let ordersQuery = {}; // Initialize empty query object

        if (paymentStatus) {
            ordersQuery.paymentStatus = paymentStatus; // Filter by paymentStatus if provided
        }

        const orders = await Order.find(ordersQuery)
            .populate({
                path: 'orderItems.foodId',
                select: 'imageUrl title rating time' // Specify the fields you want to include
            })
            .sort({ createdAt: -1 })
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);

        const totalItems = await Order.countDocuments(ordersQuery);

        // Log fetched orders and total number of items
        console.log('Fetched orders:', orders);
        console.log('Total items:', totalItems);

        res.status(200).json({
            orders,
            currentPage: +page,
            totalPages: Math.ceil(totalItems / ITEMS_PER_PAGE),
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch orders', error: error.message });
    }
    }
    
    
    
};
