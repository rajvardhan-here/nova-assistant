import mongoose from "mongoose";

const memorySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const Memory = mongoose.model("Memory", memorySchema);
export default Memory;