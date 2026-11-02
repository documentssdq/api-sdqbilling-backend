
const logger = require('../services/logger');
const Activities = require('../modules/admin/activities/services/activitiesService');

class BaseController {
  success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  error(res, message = 'Error', statusCode = 400, data = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      data,
    });
  }

  paginated(res, data, total, page, limit, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  }

  async logActivity(req, moduleName, moduleId, action, description) {
    try {
      const user = req.admin || req.user;
      if (process.env.ACTIVITIES_ENABLE === 'true' && user && user._id) {
        await Activities.create({
          user_id: user._id,
          module_name: moduleName,
          module_id: moduleId,
          action: action,
          description: description,
          ip: req.headers?.['x-forwarded-for'] || req.connection?.remoteAddress || req.ip,
        });
        logger.info(`[logActivity Debug] Successfully logged activity!`);
      } else {
        logger.info(`[logActivity Debug] Skipped because neither req.admin nor req.user is found.`);
      }
    } catch (error) {
      logger.error(`[logActivity Error] Failed to log activity for ${moduleName}: ${error.message}`);
    }
  }
}

module.exports = BaseController;