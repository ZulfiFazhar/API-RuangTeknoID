const UserLogActivity = require("../models/UserLogActivity");

class UserLogActivityController {
  static async createLog(req, res) {
    try {
      const { searchQuery } = req.body;
      const userId = req.user.userId;
      const logId = await UserLogActivity.create({ userId, searchQuery });
      res.status(201).json({ message: "Log created successfully", logId });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error creating log", error: error.message });
    }
  }

  static async getLogsByUserId(req, res) {
    try {
      const userId = req.user.userId;
      const logs = await UserLogActivity.findByUserId(userId);
      res.status(200).json({
        staus: "Success",
        message: "Logs fetched successfully",
        data: logs,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching logs", error: error.message });
    }
  }

  static async getLogById(req, res) {
    try {
      const { logId } = req.params;
      const log = await UserLogActivity.findById(logId);
      if (log) {
        res.status(200).json(log);
      } else {
        res.status(404).json({ message: "Log not found" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching log", error: error.message });
    }
  }

  static async deleteLogById(req, res) {
    try {
      const { logId } = req.params;
      const success = await UserLogActivity.deleteById(logId);
      if (success) {
        res.status(200).json({ message: "Log deleted successfully" });
      } else {
        res.status(404).json({ message: "Log not found" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error deleting log", error: error.message });
    }
  }

  static async getAllLogs(req, res) {
    try {
      const logs = await UserLogActivity.getAllLogs();
      res.status(200).json(logs);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching logs", error: error.message });
    }
  }
}

module.exports = UserLogActivityController;
