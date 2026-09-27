const stringField = ({
  required = false,
  unique = false,
  trim = true,
  lowercase = false,
  uppercase = false,
  index = false,
  defaultValue,
} = {}) => ({
  type: String,
  required,
  unique,
  trim,
  lowercase,
  uppercase,
  index,
  ...(defaultValue !== undefined && { default: defaultValue }),
});

export default stringField;
