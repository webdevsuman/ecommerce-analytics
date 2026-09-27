import Product from "../models/Product.js";
import httpStatusCodes from "../utils/httpStatusCodes.js";
import logger from "../utils/logger.js";
class ProductController {
  async createProduct(req, res) {
    try {
      const product = await Product.create(req.body);
      return res.status(httpStatusCodes.CREATED).json({
        success: true,
        message: "Product created successfully",
        data: product,
      });
    } catch (error) {
      logger.error(error.message);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getProducts(req, res) {
    try {
      const {
        category,
        minPrice,
        maxPrice,
        search,
        page = 1,
        limit = 10,
        sort = "-createdAt",
      } = req.query;

      const matchStage = { isActive: true };

      if (category) {
        matchStage.category = { $regex: new RegExp(`^${category}$`, "i") };
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        matchStage.price = {};
        if (minPrice !== undefined) matchStage.price.$gte = Number(minPrice);
        if (maxPrice !== undefined) matchStage.price.$lte = Number(maxPrice);
      }

      if (search) {
        matchStage.name = { $regex: search, $options: "i" };
      }

      const sortOrder = sort.startsWith("-") ? -1 : 1;
      const sortField = sort.startsWith("-") ? sort.substring(1) : sort;
      const sortStage = { [sortField]: sortOrder };

      const pageNumber = Number(page);
      const limitNumber = Number(limit);
      const skip = (pageNumber - 1) * limitNumber;

      const pipeline = [
        { $match: matchStage },
        { $sort: sortStage },
        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [{ $skip: skip }, { $limit: limitNumber }],
          },
        },
      ];

      const [result] = await Product.aggregate(pipeline);

      const total = result?.metadata[0]?.total || 0;
      const products = result?.data || [];

      return res.status(httpStatusCodes.OK).json({
        success: true,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          totalPages: Math.ceil(total / limitNumber),
        },
        data: { products },
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

export default new ProductController();
