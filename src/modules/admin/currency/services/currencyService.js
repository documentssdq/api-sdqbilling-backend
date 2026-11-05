const Currency = require('../models/currencyModel');
const { formatPagination } = require('../../../../utils/helpers');
const logger = require('../../../../services/logger');

const DEFAULT_CURRENCIES = [
  { name: 'Indian Rupee', code: 'INR', symbol: '₹', description: 'National currency of India', isActive: true },
  { name: 'US Dollar', code: 'USD', symbol: '$', description: 'United States Dollar', isActive: true },
  { name: 'Euro', code: 'EUR', symbol: '€', description: 'Eurozone Currency', isActive: true },
  { name: 'British Pound', code: 'GBP', symbol: '£', description: 'Great British Pound', isActive: true },
  { name: 'UAE Dirham', code: 'AED', symbol: 'د.إ', description: 'United Arab Emirates Dirham', isActive: true },
  { name: 'Canadian Dollar', code: 'CAD', symbol: '$', description: 'Canadian Dollar', isActive: true },
  { name: 'Australian Dollar', code: 'AUD', symbol: '$', description: 'Australian Dollar', isActive: true },
  { name: 'Singapore Dollar', code: 'SGD', symbol: '$', description: 'Singapore Dollar', isActive: true },
  { name: 'Japanese Yen', code: 'JPY', symbol: '¥', description: 'Japanese Yen', isActive: true },
  { name: 'Saudi Riyal', code: 'SAR', symbol: '﷼', description: 'Saudi Arabian Riyal', isActive: true },
  { name: 'Qatari Riyal', code: 'QAR', symbol: '﷼', description: 'Qatari Riyal', isActive: true },
  { name: 'Kuwaiti Dinar', code: 'KWD', symbol: 'د.ك', description: 'Kuwaiti Dinar', isActive: true },
  { name: 'Bahraini Dinar', code: 'BHD', symbol: '.د.ب', description: 'Bahraini Dinar', isActive: true },
  { name: 'Omani Rial', code: 'OMR', symbol: '﷼', description: 'Omani Rial', isActive: true },
];

module.exports = {
  async getAll(page = 1, limit = 10) {
    try {
      let total = await Currency.countDocuments();
      if (total === 0) {
        try {
          await Currency.insertMany(DEFAULT_CURRENCIES);
          total = await Currency.countDocuments();
        } catch (seedErr) {
          logger.warn('Could not auto-seed currencies:', seedErr);
        }
      }

      const isUnlimited = limit >= 1000;
      let query = Currency.find().sort({ createdAt: -1 });
      if (!isUnlimited) {
        const { skip } = formatPagination(page, limit);
        query = query.skip(skip).limit(limit);
      }
      const data = await query;
      return { data, total };
    } catch (error) {
      logger.error('Error in getAll:', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      return await Currency.findById(id);
    } catch (error) {
      logger.error('Error in getById:', error);
      throw error;
    }
  },

  async create(data) {
    try {
      if (data.code) {
        data.code = data.code.trim().toUpperCase();
      }
      if (data.name) {
        data.name = data.name.trim();
        const existing = await Currency.findOne({
          $or: [
            { name: data.name },
            ...(data.code ? [{ code: data.code }] : []),
          ],
        });
        if (existing) {
          if (existing.name.toLowerCase() === data.name.toLowerCase()) {
            throw new Error(`Currency name "${data.name}" already exists`);
          }
          if (data.code && existing.code === data.code) {
            throw new Error(`Currency code "${data.code}" already exists`);
          }
        }
      }
      return await Currency.create(data);
    } catch (error) {
      logger.error('Error in create:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      if (data.code) {
        data.code = data.code.trim().toUpperCase();
      }
      if (data.name) {
        data.name = data.name.trim();
        const existing = await Currency.findOne({
          _id: { $ne: id },
          $or: [
            { name: data.name },
            ...(data.code ? [{ code: data.code }] : []),
          ],
        });
        if (existing) {
          if (existing.name.toLowerCase() === data.name.toLowerCase()) {
            throw new Error(`Currency name "${data.name}" already exists`);
          }
          if (data.code && existing.code === data.code) {
            throw new Error(`Currency code "${data.code}" already exists`);
          }
        }
      }
      return await Currency.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    } catch (error) {
      logger.error('Error in update:', error);
      throw error;
    }
  },

  async status(id, status) {
    try {
      return await Currency.findByIdAndUpdate(id, { isActive: Boolean(status) }, { new: true, runValidators: true });
    } catch (error) {
      logger.error('Error in status:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      return await Currency.findByIdAndDelete(id);
    } catch (error) {
      logger.error('Error in delete:', error);
      throw error;
    }
  },
};
