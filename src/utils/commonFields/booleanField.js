const booleanField = ({ required = false, defaultValue = false } = {}) => ({
  type: Boolean,
  required,
  default: defaultValue,
});

export default booleanField;
