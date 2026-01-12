function validate(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid payload",
        detail: parsed.error.flatten(),
      });
    }

    req.body = parsed.data;
    next();
  };
}

export default validate;
