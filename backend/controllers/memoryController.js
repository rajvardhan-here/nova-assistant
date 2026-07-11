import Memory from "../models/Memory.js";

export const getAllMemories = async (req, res) => {
  try {
    const memories = await Memory.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(memories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMemory = async (req, res) => {
  try {
    const memory = await Memory.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!memory) return res.status(404).json({ error: "Memory not found" });
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};