const User = require('../models/User');
const Address = require('../models/Address');

module.exports = {
    addAddress: async (req, res) => {

        const newAddress = new Address({
            userId: req.user.id,
            addressLine1: req.body.addressLine1,
            postalCode: req.body.postalCode,
            default: req.body.default,
            deliveryInstructions: req.body.deliveryInstructions,
            latitude: req.body.latitude,
            longitude: req.body.longitude
        });

        try {
            if(req.body.default === true){
                await Address.updateMany({userId: req.user.id},{default: false})
            }

            await newAddress.save();
            res.status(201).json({status: true, message: "Address successfully added"});
        } catch (error) {
           res.status(500).json({status: false, message: error.message}); 
        }
    },

    getAddresses: async (req, res) => {
        try {
            const addresses = await Address.find({userId: req.user.id});

            res.status(200).json(addresses);
        } catch (error) {
          res.status(500).json({stats: false, message: error.message});  
        }
    },

    deleteAddress: async (req, res)=> {
        try {
            await Address.findByIdAndDelete(req.params.id);

            res.status(200).json({status: true, message: "Address successfully deleted"});
        } catch (error) {
            res.status(500).json({status: false, message: error.message}); 
        }
    },

    setAddressDefault: async (req, res) => {
        const addressId = req.params.id;
        const userId = req.user.id;
    
        try {
            // Set all user's addresses default flag to false
            await Address.updateMany({userId: userId},{default: false});
    
            // Set the specified address default flag to true
            const updatedAddress = await Address.findByIdAndUpdate(addressId, {default: true});
    
            if(updatedAddress){
                // Optionally update the user's default address field
                await User.findByIdAndUpdate(userId, {address: addressId});
    
                res.status(200).json({status: true, message: "Address successfully set as default"});
            }else{
                res.status(400).json({status: false, message: "Address not found"});
            }
    
        } catch (error) {
            res.status(500).json({status: false, message: error.message});
        }
    }
    ,
    getAddressById: async (req, res) => {
        const addressId = req.params.id;

        try {
            const address = await Address.findById(addressId);
            if (address) {
                res.status(200).json(address);
            } else {
                res.status(404).json({ status: false, message: "Address not found" });
            }
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },
    getDefaultAddress: async (req, res) => {
        const userId = req.user.id;

        try {
            const address = await Address.findOne({userId: userId, default: true});

            res.status(200).json(address);
        } catch (error) {
           res.status(500).json({status: false, message: error.message}); 
        }
    } 
}