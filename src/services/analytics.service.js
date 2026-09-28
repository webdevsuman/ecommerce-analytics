import Order from "../models/Order.js";

class AnalyticsService {
  async getDashboardStats() {
    const pipeline = [
      // Stage 1: $match - Match all documents (or add filters if needed)
      {
        $match: {},
      },

      // Stage 2: $group - Calculate accumulated totals across all orders
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $cond: [{ $ne: ["$status", "cancelled"] }, "$totalAmount", 0],
            },
          },
          averageOrderValue: {
            $avg: {
              $cond: [{ $ne: ["$status", "cancelled"] }, "$totalAmount", null],
            },
          },
          completedOrders: {
            $sum: {
              $cond: [{ $in: ["$status", ["delivered", "confirmed"]] }, 1, 0],
            },
          },
          cancelledOrders: {
            $sum: {
              $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0],
            },
          },
        },
      },

      // Stage 3: $project - Reshape output, format decimals, and remove _id
      {
        $project: {
          _id: 0,
          totalOrders: 1,
          totalRevenue: { $round: ["$totalRevenue", 2] },
          averageOrderValue: {
            $round: [{ $ifNull: ["$averageOrderValue", 0] }, 2],
          },
          completedOrders: 1,
          cancelledOrders: 1,
        },
      },
    ];

    const result = await Order.aggregate(pipeline);

    // Fallback if the database has 0 orders
    return (
      result[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        completedOrders: 0,
        cancelledOrders: 0,
      }
    );
  }

  async getCategorySales() {
    const pipeline = [
      // 1. Exclude cancelled orders from sales figures
      {
        $match: {
          status: { $ne: "cancelled" },
        },
      },

      // 2. Unwind the items array into individual documents
      {
        $unwind: "$items",
      },

      // 3. Left join with products collection to retrieve category
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },

      // 4. Flatten the productDetails array
      {
        $unwind: "$productDetails",
      },

      // 5. Group by product category
      {
        $group: {
          _id: "$productDetails.category",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
          orderIds: { $addToSet: "$_id" }, // Collect unique orders
        },
      },

      // 6. Reshape output & calculate count of distinct orders
      {
        $project: {
          _id: 0,
          category: "$_id",
          totalQuantity: 1,
          totalRevenue: { $round: ["$totalRevenue", 2] },
          totalOrders: { $size: "$orderIds" },
        },
      },

      // 7. Sort by highest revenue first
      {
        $sort: { totalRevenue: -1 },
      },
    ];

    return await Order.aggregate(pipeline);
  }

  async getTopProducts(limit = 5) {
    const pipeline = [
      // 1. Exclude cancelled orders
      {
        $match: {
          status: { $ne: "cancelled" },
        },
      },

      // 2. Unwind order items array
      {
        $unwind: "$items",
      },

      // 3. Group by product ID and sum quantity & revenue
      {
        $group: {
          _id: "$items.product",
          totalQuantitySold: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
        },
      },

      // 4. Sort descending by highest revenue first
      {
        $sort: { totalRevenue: -1 },
      },

      // 5. Limit to top 5 products
      {
        $limit: Number(limit),
      },

      // 6. Join product collection only for the top 5 products (optimized)
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },

      // 7. Flatten the joined product array
      {
        $unwind: "$product",
      },

      // 8. Reshape clean output
      {
        $project: {
          _id: 0,
          productId: "$_id",
          name: "$product.name",
          category: "$product.category",
          price: "$product.price",
          totalQuantitySold: 1,
          totalRevenue: { $round: ["$totalRevenue", 2] },
        },
      },
    ];

    return await Order.aggregate(pipeline);
  }

  async getCustomerAnalytics() {
    const pipeline = [
      // 1. Exclude cancelled orders
      {
        $match: {
          status: { $ne: "cancelled" },
        },
      },

      // 2. Group by customer ID and calculate totals
      {
        $group: {
          _id: "$user",
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" },
          averageOrderValue: { $avg: "$totalAmount" },
        },
      },

      // 3. Join with users collection to get profile info
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "customer",
        },
      },

      // 4. Flatten the customer array
      {
        $unwind: "$customer",
      },

      // 5. Reshape and format output
      {
        $project: {
          _id: 0,
          customerId: "$_id",
          name: "$customer.name",
          email: "$customer.email",
          totalOrders: 1,
          totalSpent: { $round: ["$totalSpent", 2] },
          averageOrderValue: { $round: ["$averageOrderValue", 2] },
        },
      },

      // 6. Sort by highest spending customer first
      {
        $sort: { totalSpent: -1 },
      },
    ];

    return await Order.aggregate(pipeline);
  }

  async getMonthlyRevenue() {
    const pipeline = [
      // 1. Exclude cancelled orders from revenue
      {
        $match: {
          status: { $ne: "cancelled" },
        },
      },

      // 2. Group by extracted Year and Month
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: "$totalAmount" },
        },
      },

      // 3. Sort chronologically (newest month first)
      {
        $sort: {
          "_id.year": -1,
          "_id.month": -1,
        },
      },

      // 4. Reshape output cleanly
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          totalRevenue: { $round: ["$totalRevenue", 2] },
          totalOrders: 1,
          averageOrderValue: { $round: ["$averageOrderValue", 2] },
        },
      },
    ];

    return await Order.aggregate(pipeline);
  }

  async getDateRangeSales(from, to) {
    // 1. Build date filter in $match
    const matchStage = {
      status: { $ne: "cancelled" },
    };

    if (from || to) {
      matchStage.createdAt = {};
      if (from) {
        matchStage.createdAt.$gte = new Date(from);
      }
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999); // Cover until the end of that day
        matchStage.createdAt.$lte = toDate;
      }
    }

    const pipeline = [
      // 2. Filter orders within date boundary
      {
        $match: matchStage,
      },

      // 3. Group and aggregate metrics
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          averageOrderValue: { $avg: "$totalAmount" },
          totalItemsSold: {
            $sum: {
              $reduce: {
                input: "$items",
                initialValue: 0,
                in: { $add: ["$$value", "$$this.quantity"] },
              },
            },
          },
        },
      },

      // 4. Clean projection
      {
        $project: {
          _id: 0,
          totalOrders: 1,
          totalRevenue: { $round: ["$totalRevenue", 2] },
          averageOrderValue: {
            $round: [{ $ifNull: ["$averageOrderValue", 0] }, 2],
          },
          totalItemsSold: 1,
        },
      },
    ];

    const result = await Order.aggregate(pipeline);

    return (
      result[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        totalItemsSold: 0,
      }
    );
  }

  async getOrderStatusStats() {
    const pipeline = [
      // 1. Group by status
      {
        $group: {
          _id: "$status",
          orderCount: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          averageOrderValue: { $avg: "$totalAmount" },
        },
      },

      // 2. Format & reshape output
      {
        $project: {
          _id: 0,
          status: "$_id",
          orderCount: 1,
          totalRevenue: { $round: ["$totalRevenue", 2] },
          averageOrderValue: { $round: ["$averageOrderValue", 2] },
        },
      },

      // 3. Sort by highest order count first
      {
        $sort: { orderCount: -1 },
      },
    ];

    return await Order.aggregate(pipeline);
  }
}

export default new AnalyticsService();
