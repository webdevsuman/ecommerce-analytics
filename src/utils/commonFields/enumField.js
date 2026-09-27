const enumField = ({ values = [], required = false, defaultValue } = {}) => ({
  type: String,
  enum: values,
  required,
  ...(defaultValue !== undefined && { default: defaultValue }),
});

export default enumField;
