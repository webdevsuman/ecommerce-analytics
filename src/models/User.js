import mongoose from "mongoose";
import stringField from "../utils/commonFields/stringField.js";
import enumField from "../utils/commonFields/enumField.js";
import ROLES from "../constants/roles.constant.js";
import booleanField from "../utils/commonFields/booleanField.js";

const UserSchema = mongoose.Schema(
  {
    // { name, email, password, role: 'customer'|'admin', isActive, createdAt }
    name: stringField({ required: true }),
    email: stringField({ required: true, lowercase: true }),
    password: stringField({ required: true }),
    role: enumField({
      required: true,
      values: [ROLES.ADMIN, ROLES.CUSTOMER],
      defaultValue: ROLES.CUSTOMER,
    }),
    isActive: booleanField({ defaultValue: true }),
  },
  {
    timestamps: true,
    versionkey: false,
  },
);

UserSchema.index({ email: 1 });

export default mongoose.model("User", UserSchema);
