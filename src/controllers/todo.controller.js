import Todo from "../models/todo.model.js";

const addTodo = async (req, res) => {
  try {
    const { title, content, isPinned, labels, color, reminder, isArchived } =
      req.body;
    if (!title && !content) {
      return res
        .status(400)
        .json({ success: false, message: "title or content is required" });
    }

    const todo = await Todo.create({
      title: title?.trim() ?? "",
      content: content?.trim() ?? "",
      labels: labels ?? [],
      color: color ?? null,
      isPinned: isPinned ?? false,
      isArchived: isArchived ?? false,
      reminder: reminder ?? null,
      userId: req.user._id,
    });

    const populatedTodo = await Todo.findById(todo._id).populate(
      "labels",
      "name"
    );

    res.status(201).json({ success: true, data: populatedTodo });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "internal server error",
      data: error.message,
    });
  }
};

const getTodo = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = { userId: req.user._id };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const todos = await Todo.find(filter)
      .populate("labels", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "todos fetched successfuly",
      data: todos,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "internal server error",
      data: error.message,
    });
  }
};

const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, isPinned, labels, color, reminder, isArchived } =
      req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content.trim();
    if (isPinned !== undefined) updateData.isPinned = isPinned;
    if (labels !== undefined) updateData.labels = labels;
    if (color !== undefined) updateData.color = color;
    if (reminder !== undefined) updateData.reminder = reminder;
    if (isArchived !== undefined) updateData.isArchived = isArchived;

    const todo = await Todo.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      updateData,
      { new: true }
    ).populate("labels", "name");

    if (!todo) {
      return res
        .status(404)
        .json({ success: false, message: "todo not found" });
    }

    res.status(200).json({
      success: true,
      message: "todos update successfuly",
      data: todo,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "internal server error",
      data: error.message,
    });
  }
};

export const restoreTodo = async (req, res) => {
  try {
    const { id } = req.params;

    const todo = await Todo.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { isTrashed: false, deletedAt: null },
      { new: true }
    ).populate("labels", "name");

    if (!todo) {
      return res
        .status(404)
        .json({ success: false, message: "Todo not found" });
    }

    res.status(200).json({
      success: true,
      message: "Todo restored",
      data: todo,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;

    const todo = await Todo.findOne({
      _id: id,
      userId: req.user._id,
    }).populate("labels", "name")

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });
    }

    if (!todo.isTrashed) {
      todo.isTrashed = true;
      todo.deletedAt = new Date();
      todo.isArchived = false;
      await todo.save();

      return res.status(200).json({
        success: true,
        message: "Todo moved to trash",
        type: "SOFT_DELETE",
        data: todo,
      });
    }

    await Todo.deleteOne({ _id: id });

    return res.status(200).json({
      success: true,
      message: "Todo permanently deleted",
      type: "PERMANENT_DELETE",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { addTodo, getTodo, updateTodo, deleteTodo };
