import analyticsService from "../services/analytics.service.js";
import httpStatusCodes from "../utils/httpStatusCodes.js";
import logger from "../utils/logger.js";

class AnalyticsController {
  async getDashboard(req, res) {
    try {
      const stats = await analyticsService.getDashboardStats();

      return res.status(httpStatusCodes.OK).json({
        success: true,
        message: "Dashboard analytics retrieved successfully.",
        data: stats,
      });
    } catch (error) {
      logger.error(error.message);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getCategorySales(req, res) {
    try {
      const data = await analyticsService.getCategorySales();

      return res.status(httpStatusCodes.OK).json({
        success: true,
        message: "Category sales analytics retrieved successfully.",
        count: data.length,
        data,
      });
    } catch (error) {
      logger.error(error.message);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getTopProducts(req, res) {
    try {
      const limit = req.query.limit || 5;
      const data = await analyticsService.getTopProducts(limit);

      return res.status(httpStatusCodes.OK).json({
        success: true,
        message: "Top products analytics retrieved successfully.",
        count: data.length,
        data,
      });
    } catch (error) {
      logger.error(error.message);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getCustomers(req, res) {
    try {
      const data = await analyticsService.getCustomerAnalytics();

      return res.status(httpStatusCodes.OK).json({
        success: true,
        message: "Customer analytics retrieved successfully.",
        count: data.length,
        data,
      });
    } catch (error) {
      logger.error(error.message);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getMonthlyRevenue(req, res) {
    try {
      const data = await analyticsService.getMonthlyRevenue();

      return res.status(httpStatusCodes.OK).json({
        success: true,
        message: "Monthly revenue analytics retrieved successfully.",
        count: data.length,
        data,
      });
    } catch (error) {
      logger.error(error.message);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getSales(req, res) {
    try {
      const { from, to } = req.query;
      const data = await analyticsService.getDateRangeSales(from, to);

      return res.status(httpStatusCodes.OK).json({
        success: true,
        message: "Sales analytics retrieved successfully.",
        filter: { from: from || "all-time", to: to || "present" },
        data,
      });
    } catch (error) {
      logger.error(error.message);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

    async getOrderStatus(req, res) {
    try {
      const data = await analyticsService.getOrderStatusStats();

      return res.status(httpStatusCodes.OK).json({
        success: true,
        message: "Order status analytics retrieved successfully.",
        count: data.length,
        data,
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

export default new AnalyticsController();
