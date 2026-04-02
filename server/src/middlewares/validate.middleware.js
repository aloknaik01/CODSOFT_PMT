import { ZodError } from "zod";

const validate = (schema) => {
  return (req, res, next) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }

      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }

      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        err.statusCode = 400;
      }
      next(err);
    }
  };
};

export default validate;