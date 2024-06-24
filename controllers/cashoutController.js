const Cashout = require("../models/Cashout");
const Restaurant = require("../models/Restaurant");
const User = require("../models/User");
module.exports = {

    getCashouts: async (req, res) => {
        const page = req.query.page || 1;
        const ITEMS_PER_PAGE = req.query.limit || 6;
        try {
            const cashout = await Cashout.find({ status: req.query.status })
                .populate(
                    {
                        path: "restaurant",
                        select: "logoUrl title",
                    }
                )
                .sort({ createdAt: -1 })
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
            const totalItems = await Cashout.countDocuments({ status: req.query.status });

            res.status(200).json({
                cashout,
                currentPage: +page,
                totalPages: Math.ceil(totalItems / ITEMS_PER_PAGE),
            });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },


    requestCashout: async (req, res) => {
        const id = req.params.id;

        try {
            const restaurant = await Restaurant.findById(id);
            if (restaurant.earnings < amount) {
                return res.status(400).json({ status: false, message: "Insufficient balance" });
            }
            const cashout = new Cashout({
                amount: amount,
                restaurant: id,
                paymentMethod: req.body.paymentMethod,
            });
            await cashout.save();

            res.status(200).json({ status: true, message: "Cashout request sent successfully" });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },

    changeCashoutStatus: async (req, res) => {
        const id = req.query.id;
        const status = req.query.status;
        try {
            const cashout = await Cashout.findById(id);
            if (!cashout) {
                return res.status(404).json({ status: false, message: "Cashout not found" });
            }

            if (status == "approved") {
                cashout.status = "Approved";
                await cashout.save();
                const restaurant = await Restaurant.findById(cashout.restaurant);
                restaurant.earnings = restaurant.earnings - cashout.amount;
                await restaurant.save();

                const user = await User.findById(restaurant.owner);

                

                //send notification email
                return res.status(200).json({ status: true, message: "Cashout approved successfully" });
            }

            if (status === "rejected") {
                cashout.status = "Rejected";
                await cashout.save();

                //send notification email

                return res.status(200).json({ status: true, message: "Cashout rejected successfully" });
            }
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    }
}
