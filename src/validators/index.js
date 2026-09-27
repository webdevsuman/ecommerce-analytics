class Validation {
  static validate(schema, source = "body") {
    return (req, res, next) => {
      const { error, value } = schema.validate(req[source], {
        abortEarly: false, //Without this option, Joi stops at the first validation error. (//You get all errors:["Email is required", "Password must be at least 6 characters" ] This provides better feedback to API consumers.)
        stripUnknown: true, //Removes properties that are not defined in the Joi schema. (Then after validation:emoved automatically.)
      });

      if (error) {
        return res.status(400).json({
          success: false,
          errors: error.details.map((err) => ({
            field: err.path?.join(".") || "unknown",
            message: err.message,
          })),
        });
      }

      if (source === "query") {
        Object.keys(req.query).forEach((key) => delete req.query[key]);
        Object.assign(req.query, value);
      } else {
        req[source] = value;
      }
      
      next();
    };
  }
}

export default Validation;
