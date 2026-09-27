import mongoose from "mongoose";

const objectField = ({ ref, required = false } = {}) => ({
  type: mongoose.Schema.Types.ObjectId,
  ...(ref && { ref }),
  required,
});

export default objectField;
