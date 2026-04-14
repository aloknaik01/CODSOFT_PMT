import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import dashboardService from "../services/dashboard.service.js";

export const getStats = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getStats(req.user.id);
  return res.status(200).json(new ApiResponse(200, "Stats fetched", stats));
});

export const getActivityFeed = asyncHandler(async (req, res) => {
  const activities = await dashboardService.getActivityFeed(req.user.id);
  return res.status(200).json(new ApiResponse(200, "Activity feed fetched", { data: activities }));
});
