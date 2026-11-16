const mongoose = require('mongoose');
const Settings = require('../models/settingsModel');
const logger = require('../../../../services/logger');

const buildKeyVariants = (identifier) => {
  const raw = String(identifier || '').trim();
  if (!raw) return [];
  const unwrapped = raw.replace(/^setting\(['"](.+)['"]\)$/, '$1');
  const wrapped = `setting('${unwrapped}')`;
  return Array.from(new Set([raw, unwrapped, wrapped]));
};

const findFallbackSetting = (list, identifier) => {
  const variants = buildKeyVariants(identifier);
  return list.find((s) => s.id === identifier || variants.includes(s.key)) || null;
};

// Initial default settings to seed if DB is empty or fallback when offline
let inMemorySettings = [
  {
    id: 'SET-1',
    displayName: 'Website Title',
    key: "setting('general.title')",
    type: 'text',
    group: 'General',
    value: 'AISGWB',
  },
  {
    id: 'SET-2',
    displayName: 'Website Logo',
    key: "setting('general.logo')",
    type: 'file',
    group: 'General',
    value: '/images/logo.png',
    previewUrl: '/images/logo.png',
  },
  {
    id: 'SET-3',
    displayName: 'Website Favicon',
    key: "setting('general.favicon')",
    type: 'file',
    group: 'General',
    value: '/images/logo-sm.png',
    previewUrl: '/images/logo-sm.png',
  },
  {
    id: 'SET-4',
    displayName: 'Support Email Address',
    key: "setting('general.support_email')",
    type: 'text',
    group: 'General',
    value: 'support@aisgwb.com',
  },
  {
    id: 'SET-5',
    displayName: 'Maintenance Mode',
    key: "setting('general.maintenance')",
    type: 'switch',
    group: 'General',
    value: false,
  },
  {
    id: 'SET-6',
    displayName: 'SEO Meta Description',
    key: "setting('seo.meta_description')",
    type: 'textarea',
    group: 'SEO',
    value: 'AISGWB',
  },
  {
    id: 'SET-7',
    displayName: 'Google Analytics Property ID',
    key: "setting('seo.ga_tracking_id')",
    type: 'text',
    group: 'SEO',
    value: 'G-XXXXXXX101',
  },
  {
    id: 'SET-8',
    displayName: 'SMTP Mail Host',
    key: "setting('mail.smtp_host')",
    type: 'text',
    group: 'Email / SMTP',
    value: 'smtp.gmail.com',
  },
  {
    id: 'SET-9',
    displayName: 'Purchase Prefix',
    key: "setting('prefixes.purchase')",
    type: 'text',
    group: 'Prefixes',
    value: 'BILL/P',
  },
  {
    id: 'SET-10',
    displayName: 'Purchase Order Prefix',
    key: "setting('prefixes.purchaseorder')",
    type: 'text',
    group: 'Prefixes',
    value: 'PO',
  },
  {
    id: 'SET-11',
    displayName: 'Sale Order Prefix',
    key: "setting('prefixes.saleorder')",
    type: 'text',
    group: 'Prefixes',
    value: 'SO',
  },
];

const DEFAULT_SETTINGS = [...inMemorySettings];

module.exports = {
  async getAll() {
    try {
      const count = await Settings.countDocuments();
      if (count === 0) {
        logger.info('Seeding initial website settings into MongoDB...');
        await Settings.insertMany(inMemorySettings);
      } else {
        const hasSaleorderPrefix = await Settings.exists({
          key: { $in: ["setting('prefixes.saleorder')", 'prefixes.saleorder'] },
        });
        if (!hasSaleorderPrefix) {
          const saleorderPrefixDefault = DEFAULT_SETTINGS.find(
            (s) => s.key === "setting('prefixes.saleorder')"
          );
          if (saleorderPrefixDefault) {
            await Settings.create(saleorderPrefixDefault).catch(() => null);
          }
        }
      }
      const data = await Settings.find().sort({ createdAt: -1 });
      // Update inMemory backup just in case
      inMemorySettings = data.map((item) => item.toObject ? item.toObject() : item);
      return inMemorySettings;
    } catch (error) {
      logger.warn('MongoDB query failed or offline, returning inMemory website settings fallback:', error.message);
      return inMemorySettings;
    }
  },

  async getByIdOrKey(identifier) {
    const raw = String(identifier || '').trim();
    const variants = buildKeyVariants(raw);
    const orConditions = [{ id: raw }, { key: { $in: variants } }];
    if (mongoose.Types.ObjectId.isValid(raw)) {
      orConditions.push({ _id: raw });
    }
    try {
      const item = await Settings.findOne({ $or: orConditions });
      if (item) return item.toObject ? item.toObject() : item;
      return (
        findFallbackSetting(inMemorySettings, raw) ||
        findFallbackSetting(DEFAULT_SETTINGS, raw)
      );
    } catch (error) {
      return (
        findFallbackSetting(inMemorySettings, raw) ||
        findFallbackSetting(DEFAULT_SETTINGS, raw)
      );
    }
  },

  async create(data) {
    const newItem = {
      id: data.id || `SET-${Date.now()}`,
      displayName: data.displayName,
      key: data.key,
      type: data.type || 'text',
      group: data.group || 'General',
      value: data.value !== undefined ? data.value : '',
      previewUrl: data.previewUrl || '',
      optionsData: data.optionsData || '',
    };

    try {
      const existing = await Settings.findOne({ key: newItem.key });
      if (existing) {
        const updated = await Settings.findOneAndUpdate({ key: newItem.key }, newItem, { new: true });
        const obj = updated.toObject ? updated.toObject() : updated;
        inMemorySettings = [obj, ...inMemorySettings.filter((s) => s.key !== newItem.key)];
        return obj;
      }
      const created = await Settings.create(newItem);
      const obj = created.toObject ? created.toObject() : created;
      inMemorySettings = [obj, ...inMemorySettings];
      return obj;
    } catch (error) {
      logger.warn('Saving setting offline/in-memory:', error.message);
      inMemorySettings = [newItem, ...inMemorySettings.filter((s) => s.key !== newItem.key)];
      return newItem;
    }
  },

  async update(id, data) {
    try {
      const updated = await Settings.findOneAndUpdate(
        { $or: [{ id }, { key: id }, { _id: id }] },
        { $set: data },
        { new: true }
      );
      if (updated) {
        const obj = updated.toObject ? updated.toObject() : updated;
        inMemorySettings = inMemorySettings.map((s) => (s.id === id || s.key === id ? { ...s, ...obj } : s));
        return obj;
      }
    } catch (error) {
      logger.warn('Updating setting in-memory fallback:', error.message);
    }
    inMemorySettings = inMemorySettings.map((s) => (s.id === id || s.key === id ? { ...s, ...data } : s));
    return inMemorySettings.find((s) => s.id === id || s.key === id) || null;
  },

  async delete(id) {
    try {
      await Settings.findOneAndDelete({ $or: [{ id }, { key: id }, { _id: id }] });
    } catch (error) {
      logger.warn('Deleting setting in-memory fallback:', error.message);
    }
    const item = inMemorySettings.find((s) => s.id === id || s.key === id);
    inMemorySettings = inMemorySettings.filter((s) => s.id !== id && s.key !== id);
    return item || { id };
  },

  async bulkSave(settingsArray = []) {
    inMemorySettings = settingsArray;
    try {
      await Settings.deleteMany({});
      await Settings.insertMany(settingsArray);
      return settingsArray;
    } catch (error) {
      logger.warn('Bulk save fallback in-memory:', error.message);
      return inMemorySettings;
    }
  },
};
