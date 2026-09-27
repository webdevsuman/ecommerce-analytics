const numberField = ({ required = false, min, max, defaultValue } = {}) => ({
  type: Number,
  required,
  ...(min !== undefined && { min }),
  ...(max !== undefined && { max }),
  ...(defaultValue !== undefined && { default: defaultValue }),
});

export default numberField;
