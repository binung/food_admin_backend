const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const User = require('../models/User');
const Food = require('../models/Food');
const sendPushNotification = require('../utils/notification');
const sendMail = require('../utils/smtp_function');
const {  rejectionDriverEmail } = require('../utils/driver_rejection_email');
const {  sendVerificationEmail } = require('../utils/driver_verification_email');
const Reservation = require('../models/Reservation'); 
const {  sendRejectionEmail } = require('../utils/smtp_function');
const {  sendVerificationReservationEmail } = require('../utils/reservation_verrification_email');
const mongoose = require('mongoose'); 

module.exports = {
    addRestaurant: async (req, res) => {
       
            try {
                const { title, time, imgUrl, code, owner, logoUrl, coords } = req.body;
    
                if (!coords.title || !coords.longitude || !coords.latitude || !coords.address) {
                    return res.status(400).json({ success: false, message: 'Invalid coordinates format' });
                }
    
                const newRestaurant = new Restaurant(req.body);
                await newRestaurant.save();
    
                res.status(201).json({ status: true, message: 'Restaurant has been successfully created' });
            } catch (err) {
                res.status(500).json({ status: false, message: err.message });
            }
        
    },
   // Inside your reservationRestaurants handler in Node.js
    reservationRestaurants : async (req, res) => {
    try {
      const { user, restaurant, dateTime, numberOfGuests, specialRequests } = req.body;
  
      console.log('Received reservation request:', req.body);
  
      if (!user || !restaurant || !dateTime || !numberOfGuests) {
        return res.status(400).json({ message: 'All fields are required' });
      }
  
    //   if (!mongoose.Types.ObjectId.isValid(user) || !mongoose.Types.ObjectId.isValid(restaurant)) {
    //     return res.status(400).json({ message: 'Invalid ObjectId format' });
    //   }
  
      const parsedDateTime = new Date(dateTime);
  
      const reservation = new Reservation({
        user:user,
        restaurant:restaurant,
        dateTime: parsedDateTime,
        numberOfGuests,
        specialRequests,
        status: 'pending'
      });
  
      await reservation.save();
  
      const responseData = {
        data: {
          user: reservation.user,
          restaurant: reservation.restaurant,
          dateTime: reservation.dateTime,
          numberOfGuests: reservation.numberOfGuests,
          status: reservation.status,
          specialRequests: reservation.specialRequests
        }
      };
  
      res.status(201).json(responseData);
    } catch (error) {
      console.error('Error booking reservation:', error);
      res.status(500).json({ success: false, message: 'Failed to book reservation' });
    }
    },





    searchRestaurants: async (req, res) => {
        const query = req.params.search;
        console.log(`Searching restaurants for query: ${query}`); // Add this logging statement
        try {
            const restaurants = await Restaurant.aggregate([
                {
                    $search: {
                        index: "restaurants",
                        text: {
                            query: query,
                            path: {
                                wildcard: "*",
                            }
                        }
                    }
                }
            ]);
            console.log(`Found ${restaurants.length} restaurants matching query: ${query}`); // Add this logging statement
            res.status(200).json({ status: true, restaurants });
        } catch (error) {
            console.error(`Error searching restaurants: ${error.message}`); // Add this logging statement
            res.status(500).json({ status: false, message: error.message });
        }
    },
    getRestaurantProfileByToken: async (req, res) => {
        try {
            const userId = req.params.userId;
            const restaurant = await Restaurant.findOne({ owner: userId });
    
            if (!restaurant) {
                return res.status(404).json({ success: false, message: 'Restaurant not found' });
            }
    
            const restaurantData = {
                _id: restaurant._id,
                title: restaurant.title,
                time: restaurant.time,
                imageUrl: restaurant.imageUrl,
                food: restaurant.food,
                pickup: restaurant.pickup,
                delivery: restaurant.delivery,
                isAvailable: restaurant.isAvailable,
                owner: restaurant.owner,
                code: restaurant.code,
                logoUrl: restaurant.logoUrl,
                rating: restaurant.rating,
                ratingCount: restaurant.ratingCount,
                verification: restaurant.verification,
                verificationMessage: restaurant.verificationMessage,
                coords: restaurant.coords,
                earnings: restaurant.earnings
            };
    
            res.status(200).json({ success: true, data: restaurantData });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    
    toggleRestaurantStatus: async (req, res) => {
        const { restaurantId } = req.params;
    
        try {
          const restaurant = await Restaurant.findById(restaurantId);
    
          if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
          }
    
          restaurant.isAvailable = !restaurant.isAvailable;
          await restaurant.save();
    
          res.status(200).json({ success: true, isAvailable: restaurant.isAvailable });
        } catch (error) {
          console.error('Error toggling restaurant status:', error);
          res.status(500).json({ success: false, message: 'Failed to toggle restaurant status', error: error.message });
        }
      },

      getReservationsByRestaurantId: async (req, res) => {
        try {
            const restaurantId = req.params.restaurantId;
    
            // Find all reservations for the given restaurant ID and populate the 'user' field
            const reservations = await Reservation.find({ restaurant: restaurantId })
                .populate({
                    path: 'user',
                    select: 'email phone name profile',
                })
                .select('numberOfGuests dateTime specialRequests status'); // Select reservation fields
    
            // Filter reservations by status
            const pendingReservations = reservations.filter(reservation => reservation.status === 'pending');
            const confirmedReservations = reservations.filter(reservation => reservation.status === 'confirmed');
            const cancelledReservations = reservations.filter(reservation => reservation.status === 'cancelled');
    
            // Respond with the categorized reservations
            res.status(200).json({ 
                success: true, 
                data: {
                    pending: pendingReservations,
                    confirmed: confirmedReservations,
                    cancelled: cancelledReservations
                } 
            });
        } catch (error) {
            console.error('Error fetching reservations by restaurant ID:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch reservations' });
        }
    },
    
    
    getRestaurantsByOwnerId: async (req, res) => {
        const ownerId = req.params.ownerId;

        try {
            const data = await Restaurant.find({ owner: ownerId });
            
            if (!data || data.length === 0) {
                return res.status(404).json({ status: false, message: 'No restaurants found for the specified owner ID' });
            }

            res.status(200).json({ status: true, data: data });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },
    getRestaurants: async (req, res) => {
        const { page = 1, status } = req.query;
        const ITEMS_PER_PAGE = req.query.limit || 5;
        try {
            let query = {};
            if (status) {
                query = { verification: req.query.status };
            }

            const totalItems = await Restaurant.countDocuments(query);

            const restaurants = await Restaurant.find(query, {logoUrl: 1,title:1, isAvailable: 1,ratingCount: 1, rating: 1, time: 1, coords: 1 })
                .sort({ createdAt: -1 })
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);

            res.status(200).json({
                restaurants,
                currentPage: +page,
                totalPages: Math.ceil(totalItems / ITEMS_PER_PAGE),
            });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },

    // getRestaurantById: async (req, res) => {
    //     const id = req.params.id;
    //     try {
    //         const foundRestaurant = await Restaurant.findById(id);
    //         if (!foundRestaurant) {
    //             return res.status(404).json({ success: false, message: 'Restaurant not found' });
    //         }
    //         res.status(200).json({ success: true, data: foundRestaurant });
    //     } catch (error) {
    //         console.error('Error fetching restaurant by ID:', error);
    //         res.status(500).json({ success: false, message: error.message });
    //     }
    // },

    getRestaurantById: async (req, res) => {
        const id = req.params.id;
        console.log("jjjjjjj",id);
        try {
            const data = await Restaurant.findById(id);
               console.log(data);
            const ordersTotal = await Order.countDocuments({ restaurantId: id, orderStatus: "Delivered" });
            const cancelledOrders = await Order.countDocuments({ restaurantId: id, orderStatus: "Cancelled" });
            
            const revenue = await Order.aggregate([
                { $match: { restaurantId: id, orderStatus: "Delivered" } },
                { $group: { _id: null, total: { $sum: "$orderTotal" } } }
            ]);
            console.log('Aggregation result:', revenue);
           

            const processingOrders = await Order.countDocuments({
                restaurantId: id,
                orderStatus: {
                  $in: ["Pending", "Preparing", "Manual", "Ready", "Out_for_Delivery"],
                },
              });

              const revenueTotalString = revenue[0]?.total.toString() || 0.0.toString();

            const revenueTotal = parseFloat(revenueTotalString)
            const restaurantToken = await User.findById(data.owner, { fcm: 1 });
           
           


            res.status(200).json(
                {
                    data,
                    ordersTotal,
                    cancelledOrders,
                    revenueTotal,
                    processingOrders,
                    restaurantToken
                });


        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },

    getRandomRestaurant: async (req, res) => {
        
            
            let randomRestaurant = [];

            if (req.params.code) {
                randomRestaurant = await Restaurant.aggregate([
                    { $match: { code: req.params.code,  } },
                    { $sample: { size: 4 } },
                    { $project: { __v: 0 } },
                ]);
            }

            if (!randomRestaurant.length ) {
                randomRestaurant = await Restaurant.aggregate([
                  
                    { $sample: { size: 4 } },
                    { $project: { __v: 0 } },
                ]);
            }

           if(randomRestaurant.length){
            res.status(200).json({ success: true, data: randomRestaurant });
        } 
        else{
           
                res.status(500).json({ success: false, error: err.message });
            }
        },
           
        getFoodByRestaurant: async (req, res) => {
       
            const restaurantId = req.params.id;

            try {
                // Verify restaurant ID
                const existingRestaurant = await Restaurant.findById(restaurantId);
                if (!existingRestaurant) {
                    return res.status(404).json({ status: false, message: "Restaurant not found" });
                }
        
                // Find food items that reference this restaurant
                const foodItems = await Food.find({ restaurant: restaurantId });
                res.status(200).json({ status: true, food: foodItems });
            } catch (error) {
                res.status(500).json({ status: false, message: 'Server error', error: error.message });
            }
        
        }, 





        deleteFoodByRestaurant : async (req, res) => {
            const restaurantId = req.params.id;
        
            try {
                // Verify restaurant ID
                const existingRestaurant = await Restaurant.findById(restaurantId);
                if (!existingRestaurant) {
                    return res.status(404).json({ status: false, message: "Restaurant not found" });
                }
        
                // Delete food items that reference this restaurant
                const deletionResult = await Food.deleteMany({ restaurant: restaurantId });
                res.status(200).json({ status: true, message: `Deleted ${deletionResult.deletedCount} food items` });
            } catch (error) {
                res.status(500).json({ status: false, message: 'Server error', error: error.message });
            }

        },


    // searchRestaurants: async (req, res) => {
    //     const search = req.params.search;

    //     try {
    //         const results = await Restaurant.aggregate([
    //             {
    //                 $search: {
    //                     index: "restaurant",
    //                     text: {
    //                         query: search,
    //                         path: {
    //                             wildcard: "*"
    //                         }
    //                     }
    //                 }
    //             }
    //         ])

    //         res.status(200).json(results);
    //     } catch (error) {
    //         res.status(500).json({ status: false, message: error.message });
    //     }
    // },

    changeStatus: async (req, res) => {
        const id = req.params.id;
    const status = req.query.status;

    try {
        const restaurant = await Restaurant.findById(id);
        restaurant.verification = status;
        await restaurant.save();

        const restaurantData = await User.findById(restaurant.owner, { fcm: 1, email: 1, username: 1 });

        if (restaurantData.email) {
            if (status === "Verified") {
                await sendVerificationEmail(restaurantData.email, restaurantData.username);
            } else if (status === "Rejected") {
                await rejectionDriverEmail(restaurantData.email, restaurantData.username);
            }
        }

        res.status(200).json({ status: true, message: "Status changed successfully" });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
    },

    deleteRestaurant: async (req, res) => {
        const id  = req.params;
        const owner = req.query.owner;

        if (!owner) {
            return res.status(400).json({ status: false, message: 'Owner ID is required for deletion.' });
        }
    
        if (!id) {
            return res.status(400).json({ status: false, message: 'Restaurant ID is required for deletion.' });
        }
    
        try {
            await Food.deleteMany({restaurant: id});
            await Order.deleteMany({restaurantId: id});
            await User.findByIdAndUpdate(
                owner,
                { userType: "Client" },
                { new: true, runValidators: true });
            await Restaurant.findByIdAndRemove(id);

            
    
            res.status(200).json({ status: true, message: 'Restaurant successfully deleted' });
        } catch (error) {
            console.error("Error deleting Restaurant:", error);
            res.status(500).json({ status: false, message: 'An error occurred while deleting the restaurant.' });
        }
    },

    getAllNearByRestaurant: async (req, res) => {
        try {
            const code = req.params.code; // Extract code from request params
            let AllNearbyRestaurants = [];
    
            if (code) {
                AllNearbyRestaurants = await Restaurant.aggregate([
                    { $match: { code: code, isAvailable: true } },
                    { $project: { __v: 0 } },
                ]);
            }
    
            if (AllNearbyRestaurants.length === 0) {
                AllNearbyRestaurants = await Restaurant.aggregate([
                    { $match: { isAvailable: true } },
                    { $project: { __v: 0 } },
                ]);
            }
    
            res.status(200).json({ success: true, data: AllNearbyRestaurants });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },
    getReservationsByRestaurantId : async (req, res) => {
        try {
            const restaurantId = req.params.restaurantId;
        
            // Find reservations for the given restaurant ID and populate the 'user' field
            const reservations = await Reservation.find({ restaurant: restaurantId })
              .populate({
                path: 'user',
                select: 'email phone name profile',
              })
              .select('numberOfGuests dateTime specialRequests status'); // Select reservation fields
        
            res.status(200).json({ success: true, data: reservations });
          } catch (error) {
            console.error('Error fetching reservations by restaurant ID:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch reservations' });
          }
    },












getResevationByStatus:async(req,res)=>{
    try {
        const restaurantId = req.params.restaurantId;
        const status = req.query.status;  // Get the status from the query parameters

        // Validate the status query parameter
        if (!status) {
            return res.status(400).json({ success: false, message: 'Order status is required' });
        }

        // Find reservations for the given restaurant ID and status, and populate the 'user' field
        const reservations = await Reservation.find({ restaurant: restaurantId, status: status })
            .populate({
                path: 'user',
                select: 'email phone name profile',
            })
            .select('numberOfGuests dateTime specialRequests status'); // Select reservation fields

        res.status(200).json({ 
            success: true, 
            data: reservations 
        });
    } catch (error) {
        console.error('Error fetching reservations by restaurant ID and status:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch reservations' });
    }
},
    updateReservationStatus : async (req, res) => {
       
            try {
                const reservationId = req.params.reservationId;
                const { status } = req.body;
    
                console.log(`Received request to update reservationId: ${reservationId} with status: ${status}`);
    
                // Validate input data
                if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
                    return res.status(400).json({ success: false, message: 'Invalid status value' });
                }
    
                // Find the reservation by ID and update its status
                const updatedReservation = await Reservation.findByIdAndUpdate(
                    reservationId,
                    { status },
                    { new: true } // Return the updated document
                );
    
                if (!updatedReservation) {
                    return res.status(404).json({ success: false, message: 'Reservation not found' });
                }
    
                console.log(`Updated reservation: ${updatedReservation}`);
    
                // Send confirmation email if the status is confirmed
                if (status === 'confirmed') {
                    if (updatedReservation.user) {
                        const user = await User.findById(updatedReservation.user); // Assuming reservation has a userId field
                        if (user) {
                            await sendVerificationReservationEmail(user.email, user.username);
                            console.log(`Email sent to ${user.email} with username ${user.username}`);
                        } else {
                            console.log(`User not found for userId: ${updatedReservation.user}`);
                        }
                    } else {
                        console.log('No userId found in the reservation');
                    }
                }
    
                res.status(200).json({ success: true, data: updatedReservation });
            } catch (error) {
                console.error('Error updating reservation status:', error);
                res.status(500).json({ success: false, message: 'Failed to update reservation status' });
            }
        },

}