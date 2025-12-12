import mongoose, { Schema } from "mongoose";

const labelSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

labelSchema.index({ name: 1, userId: 1 }, { unique: true });

const Label = mongoose.model("Label", labelSchema);

export default Label;

