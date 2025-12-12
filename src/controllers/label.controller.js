import Label from "../models/label.model.js";
import Todo from "../models/todo.model.js";
import User from "../models/user.model.js";

const createLabel = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res
        .status(401)
        .json({ success: false, data: { message: "label name is required" } });
    }

    const exists = await Label.findOne({
      name: name.trim(),
      userId: req.user._id,
    });
    if (exists) {
      return res.status(401).json({
        success: false,
        data: { message: "this label name is allrady exists" },
      });
    }

    const data = await Label.create({
      name: name,
      userId: req.user._id,
    });

    res.status(201).json({ success: true, data: data });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, data: { message: "internal server error" } });
  }
};

const getLabel = async (req, res) => {
  try {
    const label = await Label.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: label });
  } catch (error) {
    return res.status(500).json({ success: false, data: error.message });
  }
};

const getLabelById = async (req, res) => {
  try {
    const { id } = req.params;
    const label = await Label.findById(id);
    res.status(200).json({ success: true, data: label });
  } catch (error) {
    return res.status(500).json({ success: false, data: error.message });
  }
};

const updateLabel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
      return res
        .status(401)
        .json({ success: false, data: { message: "name is required" } });
    }

    const exists = await Label.findOne({
      name: name.trim(),
      userId: req.user._id,
    });
    if (exists) {
      return res.status(401).json({
        success: false,
        data: { message: "this label name is allready exists" },
      });
    }

    const label = await Label.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { name: name },
      { new: true }
    );
    if (!label) {
      return res
        .status(404)
        .json({ success: false, data: { message: "label not found" } });
    }

    return res.status(201).json({ success: true, data: label });
  } catch (error) {
    return res.status(500).json({ success: false, data: error.message });
  }
};

const updateLabelsBulk = async (req, res) => {
  try {
    const { labels } = req.body;

    if (!Array.isArray(labels) || labels.length === 0) {
      return res.status(400).json({
        success: false,
        message: "labels array is required and must not be empty",
      });
    }

    // Validate each label object
    for (const lb of labels) {
      if (!lb._id || !lb.name) {
        return res.status(400).json({
          success: false,
          message: "Each label must have _id and name",
        });
      }
    }

    const bulkOps = labels.map((lb) => ({
      updateOne: {
        filter: { _id: lb._id, userId: req.user._id },
        update: { $set: { name: lb.name.trim() } },
      },
    }));

    // Run Bulk Write
    const result = await Label.bulkWrite(bulkOps);

    return res.status(200).json({
      success: true,
      message: "Labels updated successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const deleteLabel = async (req, res) => {
  try {
    const { id } = req.params;

    const label = await Label.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

    if (!label) {
      return res
        .status(404)
        .json({ success: false, message: "label not found" });
    }

    await Todo.updateMany({ userId: req.user._id }, { $pull: { labels: id } });

    return res.status(200).json({ success: true, data: label });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export {
  createLabel,
  getLabel,
  getLabelById,
  updateLabel,
  deleteLabel,
  updateLabelsBulk,
};
