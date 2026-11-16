const Auth = require('../../admin/users/models/usersModel');
const tokenService = require('../../../services/tokenService');
const logger = require('../../../services/logger');
const {
  normalizeExactModuleKey,
  normalizeModuleKey,
  getDefaultModuleUrl,
} = require('../../../utils/moduleNameNormalizer');

const buildAccessRulesForUser = async (userObj) => {
  const Permission = require('../../admin/permissions/models/Permission');
  const stdPerms = await Permission.find({ type: 'standard' });
  const stdByExact = new Map();
  const stdByCanonical = new Map();
  for (const p of stdPerms) {
    const exactKey = normalizeExactModuleKey(p.name);
    const canonicalKey = normalizeModuleKey(p.name);
    if (exactKey && !stdByExact.has(exactKey)) {
      stdByExact.set(exactKey, p);
    }
    if (canonicalKey && !stdByCanonical.has(canonicalKey)) {
      stdByCanonical.set(canonicalKey, p);
    }
  }

  const findStdPerm = (moduleName) => {
    const exactKey = normalizeExactModuleKey(moduleName);
    if (exactKey && stdByExact.has(exactKey)) {
      return stdByExact.get(exactKey);
    }
    const canonicalKey = normalizeModuleKey(moduleName);
    if (canonicalKey && stdByCanonical.has(canonicalKey)) {
      return stdByCanonical.get(canonicalKey);
    }
    return null;
  };

  let registry = await Permission.find({ type: 'module-registry' });
  if (!registry || registry.length === 0) {
    registry = stdPerms.map((p) => ({
      moduleName: p.name,
      category: p.category || 'Management',
      url: p.url || getDefaultModuleUrl(p.name) || '',
      icon: p.icon || '',
      isActive: p.isActive !== false,
    }));
  } else {
    registry = registry.map((r) => {
      const obj = typeof r.toObject === 'function' ? r.toObject() : { ...r };
      const std = findStdPerm(obj.moduleName);
      return {
        ...obj,
        url: obj.url || std?.url || getDefaultModuleUrl(obj.moduleName) || '',
        icon: obj.icon || std?.icon || '',
        category: obj.category || std?.category || 'Management',
        isActive: std ? std.isActive !== false : obj.isActive !== false,
      };
    });
    for (const p of stdPerms) {
      const exactKey = normalizeExactModuleKey(p.name);
      const canonicalKey = normalizeModuleKey(p.name);
      const alreadyPresent = registry.some((r) => {
        const regExact = normalizeExactModuleKey(r.moduleName);
        if (exactKey && regExact === exactKey) return true;
        return canonicalKey && normalizeModuleKey(r.moduleName) === canonicalKey;
      });
      if (exactKey && !alreadyPresent) {
        registry.push({
          moduleName: p.name,
          category: p.category || 'Management',
          url: p.url || getDefaultModuleUrl(p.name) || '',
          icon: p.icon || '',
          isActive: p.isActive !== false,
        });
      }
    }
  }

  let accessRules = [];
  if (userObj.groupId || userObj.group) {
    const Group = require('../../admin/groups/models/groupModel');
    const mongoose = require('mongoose');
    const searchId = userObj.groupId || userObj.group;
    const q = [{ id: searchId }, { name: searchId }];
    if (mongoose.Types.ObjectId.isValid(searchId)) {
      q.push({ _id: searchId });
    }
    const group = await Group.findOne({ $or: q });
    if (group) {
      userObj.groupName = group.name;
    }

    const isGroupActive = group ? group.status !== 'Inactive' : true;
    const isAdmin = group && (group.id === 'GRP-1' || group.name === 'Super Admin');

    let rawRules = [];
    if (group) {
      rawRules = await Permission.find({ type: 'group-access', groupId: group.id });
    }

    const representedCanonicalKeys = new Set();

    accessRules = registry.map((reg) => {
      const exactKey = normalizeExactModuleKey(reg.moduleName);
      const canonicalKey = normalizeModuleKey(reg.moduleName);
      if (canonicalKey) {
        representedCanonicalKeys.add(canonicalKey);
      }
      const std = findStdPerm(reg.moduleName);
      const moduleIsActive = isGroupActive && (std ? std.isActive !== false : reg.isActive !== false);

      let existingRule = rawRules.find(
        (r) => normalizeExactModuleKey(r.moduleName) === exactKey
      );
      let canonicalMatches = [];
      if (!existingRule && canonicalKey) {
        canonicalMatches = rawRules.filter(
          (r) => normalizeModuleKey(r.moduleName) === canonicalKey
        );
        existingRule = canonicalMatches[0];
      }

      if (existingRule) {
        const ruleObj = existingRule.toObject();
        const combinedRead = canonicalMatches.length > 1
          ? canonicalMatches.some((r) => Boolean(r.read))
          : Boolean(ruleObj.read);
        const combinedWrite = canonicalMatches.length > 1
          ? canonicalMatches.some((r) => Boolean(r.write))
          : Boolean(ruleObj.write);
        const combinedDelete = canonicalMatches.length > 1
          ? canonicalMatches.some((r) => Boolean(r.delete))
          : Boolean(ruleObj.delete);
        const combinedExport = canonicalMatches.length > 1
          ? canonicalMatches.some((r) => Boolean(r.export))
          : Boolean(ruleObj.export);

        return {
          ...ruleObj,
          moduleName: std?.name || reg.moduleName || ruleObj.moduleName,
          category: ruleObj.category || reg.category || std?.category || 'Management',
          url: reg.url || std?.url || ruleObj.url || getDefaultModuleUrl(reg.moduleName) || '',
          icon: reg.icon || std?.icon || '',
          isActive: moduleIsActive,
          read: isGroupActive ? (isAdmin ? true : combinedRead) : false,
          write: isGroupActive ? (isAdmin ? true : combinedWrite) : false,
          delete: isGroupActive ? (isAdmin ? true : combinedDelete) : false,
          export: isGroupActive ? (isAdmin ? true : combinedExport) : false,
        };
      }

      return {
        moduleName: reg.moduleName,
        category: reg.category || std?.category || 'Management',
        url: reg.url || std?.url || getDefaultModuleUrl(reg.moduleName) || '',
        icon: reg.icon || std?.icon || '',
        isActive: moduleIsActive,
        read: isGroupActive ? Boolean(isAdmin) : false,
        write: isGroupActive ? Boolean(isAdmin) : false,
        delete: isGroupActive ? Boolean(isAdmin) : false,
        export: isGroupActive ? Boolean(isAdmin) : false,
        order: 999,
      };
    });

    rawRules.forEach((rule) => {
      const exactKey = normalizeExactModuleKey(rule.moduleName);
      const canonicalKey = normalizeModuleKey(rule.moduleName);
      const alreadyIncluded = accessRules.some((r) => {
        const rExact = normalizeExactModuleKey(r.moduleName);
        if (exactKey && rExact === exactKey) return true;
        return canonicalKey && normalizeModuleKey(r.moduleName) === canonicalKey;
      });
      if (!alreadyIncluded && (!canonicalKey || !representedCanonicalKeys.has(canonicalKey))) {
        if (canonicalKey) {
          representedCanonicalKeys.add(canonicalKey);
        }
        const rObj = rule.toObject();
        const std = findStdPerm(rule.moduleName);
        const moduleIsActive = isGroupActive && (std ? std.isActive !== false : true);
        rObj.isActive = moduleIsActive;
        rObj.url = rObj.url || std?.url || getDefaultModuleUrl(rule.moduleName) || '';
        rObj.icon = rObj.icon || std?.icon || '';
        if (!isGroupActive) {
          rObj.read = false;
          rObj.write = false;
          rObj.delete = false;
          rObj.export = false;
        } else if (isAdmin) {
          rObj.read = true;
          rObj.write = true;
          rObj.delete = true;
          rObj.export = true;
        }
        accessRules.push(rObj);
      }
    });

    accessRules.sort((a, b) => {
      const orderA = a.order !== undefined && a.order !== null ? a.order : 999;
      const orderB = b.order !== undefined && b.order !== null ? b.order : 999;
      return orderA - orderB;
    });
  }

  return accessRules;
};

module.exports = {
  async register(data) {
    try {
      const existing = await Auth.findOne({ email: data.email });
      if (existing) throw new Error('Email already registered');
      const user = await Auth.create(data);
      const { password, ...userObj } = user.toObject();
      return userObj;
    } catch (error) {
      logger.error('Error in register:', error);
      throw error;
    }
  },

  async login_email(email, password) {
    try {
      const user = await Auth.findOne({ email, isActive: true });
      if (!user) throw new Error('Invalid credentials');

      const match = await user.comparePassword(password);
      if (!match) throw new Error('Invalid credentials');

      const token = tokenService.generateToken({ id: user._id, email: user.email });
      const { password: _pw, ...userObj } = user.toObject();
      return { token, user: userObj };
    } catch (error) {
      logger.error('Error in login:', error);
      throw error;
    }
  },

  async login(username, password) {
    try {
      const query = {
        isActive: true,
      };

      // Email or Mobile
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username);

      if (isEmail) {
        query.email = username.toLowerCase().trim();
      } else {
        query.mobile = username.trim();
      }

      const user = await Auth.findOne(query);

      if (!user) {
        throw new Error('Invalid email/mobile or password');
      }

      const match = await user.comparePassword(password);

      if (!match) {
        throw new Error('Invalid Password');
      }

      const token = tokenService.generateToken({
        id: user._id,
        email: user.email,
        mobile: user.mobile,
        isFrontEnd: false,
      });

      const userObj = user.toObject();
      delete userObj.password;

      // Fetch group access rules
      userObj.accessRules = await buildAccessRulesForUser(userObj);

      return {
        token,
        user: userObj,
      };
    } catch (error) {
      logger.error('Error in login:', error);
      throw error;
    }
  },

  async getProfile(userId) {
    try {
      const user = await Auth.findById(userId);
      if (!user) throw new Error('User not found');
      const userObj = user.toObject();
      delete userObj.password;

      userObj.accessRules = await buildAccessRulesForUser(userObj);

      return { user: userObj };
    } catch (error) {
      logger.error('Error in getProfile:', error);
      throw error;
    }
  },
};

