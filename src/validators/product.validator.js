import Joi from "joi";

export const createProductSchema = Joi.object({
  name: Joi.string().trim().required(),
  category: Joi.string().trim().required(),
  price: Joi.number().min(0).required(),
  stock: Joi.number().integer().min(0).required(),
  isActive: Joi.boolean().optional(),
});

export const productQuerySchema = Joi.object({
  category: Joi.string().optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  search: Joi.string().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().optional(),
});
