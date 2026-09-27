import Order from "../models/Order.js";
import Product from "../models/Product.js";
import httpStatusCodes from "../utils/httpStatusCodes.js";
import logger from "../utils/logger.js";

class OrderController {
  async createOrder(req, res) {
    try {
      const { items } = req.body;
      const userId = req.user._id;

      const productIds = items.map((item) => item.product);
      const dbProducts = await Product.find({
        _id: { $in: productIds },
        isActive: true,
      });

      if (dbProducts.length !== productIds.length) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({
          success: false,
          message: "One or more products are invalid or no longer active.",
        });
      }

      const productMap = new Map(
        dbProducts.map((prod) => [prod._id.toString(), prod]),
      );

      let calculatedTotal = 0;
      const orderItems = [];

      for (const item of items) {
        const dbProduct = productMap.get(item.product);

        if (dbProduct.stock < item.quantity) {
          return res.status(httpStatusCodes.BAD_REQUEST).json({
            success: false,
            message: `Insufficient stock for '${dbProduct.name}'. Available: ${dbProduct.stock}, Requested: ${item.quantity}`,
          });
        }

        const itemTotal = dbProduct.price * item.quantity;
        calculatedTotal += itemTotal;

        orderItems.push({
          product: dbProduct._id,
          quantity: item.quantity,
          price: dbProduct.price,
        });
      }

      for (const item of items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      }

      const order = await Order.create({
        user: userId,
        items: orderItems,
        totalAmount: calculatedTotal,
        status: "pending",
      });

      return res.status(httpStatusCodes.CREATED).json({
        success: true,
        message: "Order placed successfully.",
        data: { order },
      });
    } catch (error) {
      logger.error(error.message);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getMyOrders(req, res) {
    try {
      const orders = await Order.find({ user: req.user._id })
        .populate("items.product", "name category price")
        .sort({ createdAt: -1 });

      return res.status(httpStatusCodes.OK).json({
        success: true,
        results: orders.length,
        data: { orders },
      });
    } catch (error) {
      logger.error(error.message);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new OrderController();
