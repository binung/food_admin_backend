// const express = require('express');
// const router = express.Router();
// const Reservation = require('../models/reservation'); 


// module.exports = {
//     reservationRestaurants:async (req, res) => {
//         try {
//           // Extract data from the request body
//           const { userId, restaurantId, dateTime, numberOfGuests } = req.body;
      
//           // Validate input data (basic validation for demonstration)
//           if (!userId || !restaurantId || !dateTime || !numberOfGuests) {
//             return res.status(400).json({ message: 'All fields are required' });
//           }
      
//           // Create a new reservation
//           const reservation = new Reservation({
//             user: userId,
//             restaurant: restaurantId,
//             dateTime,
//             numberOfGuests,
//             status: 'pending' // Default status is 'pending'
//           });
      
//           // Save the reservation to the database
//           await reservation.save();
      
//           // Return the created reservation in the response
//           res.status(201).json({ reservation });
      
//         } catch (error) {
//           console.error('Error booking reservation:', error);
//           res.status(500).json({ message: 'Failed to book reservation' });
//         }
//       }

// }