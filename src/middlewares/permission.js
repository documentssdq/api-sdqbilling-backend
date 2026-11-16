const Group = require('../modules/admin/groups/models/groupModel');
const Permission = require('../modules/admin/permissions/models/Permission');
const { normalizeModuleKey } = require('../utils/moduleNameNormalizer');

module.exports = (config, action) => {
  return async (req, res, next) => {
    try {
      const user = req.user || req.admin;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      /* Super Admin bypass */
      if (user.group === 'GRP-1' || user.group === 'Super Admin') {
        return next();
      }

      const groupRef = user.group || user.groupId;
      const group = await Group.findOne({ $or: [{ id: groupRef }, { name: groupRef }] });
      if (!group || group.status === 'Inactive') {
        return res.status(403).json({
          success: false,
          message: 'Permission denied. Invalid or inactive group.',
        });
      }

      if (!config) return next();
      const moduleName = typeof config === 'string' ? config : config.moduleName;
      if (!moduleName) return next();
      const type = typeof config === 'object' && config.type ? config.type : 'group-access';
      const category = typeof config === 'object' && config.category ? config.category : undefined;
      const escapedModule = moduleName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      const query = {
        type,
        groupId: group.id,
        moduleName: { $regex: new RegExp(`^${escapedModule}$`, 'i') },
      };

      if (category) {
        query.category = category;
      }

      let rule = await Permission.findOne(query);

      if (!rule) {
        const canonicalTarget = normalizeModuleKey(moduleName);
        if (canonicalTarget) {
          const groupRules = await Permission.find({ type, groupId: group.id });
          rule = groupRules.find(
            (r) => normalizeModuleKey(r.moduleName) === canonicalTarget
          ) || null;
        }
      }

      if (!rule) {
        return res.status(403).json({
          success: false,
          message: `Permission denied. Rule for ${moduleName} not found.`,
          requestId: req.id,
        });
      }

      const isAllowed = () => {
        switch (action.toUpperCase()) {
          case 'READ': return rule.read;
          case 'WRITE': return rule.write;
          case 'DELETE': return rule.delete;
          case 'EXPORT': return rule.export;
          default: return false;
        }
      };

      if (!isAllowed()) {
        return res.status(403).json({
          success: false,
          message: `Permission denied. Required: ${moduleName}.${action}`,
          requestId: req.id,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error while verifying permissions',
      });
    }
  };
};
