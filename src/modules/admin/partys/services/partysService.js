const Partys = require('../models/partysModel');
const { formatPagination } = require('../../../../utils/helpers');
const logger = require('../../../../services/logger');

/**
 * Normalizes Indian phone / mobile numbers to standard 10-digit format
 */
const normalizePhone = (phone) => {
  if (!phone) return phone;
  const cleaned = phone.toString().replace(/[\s\-()]/g, '');
  const match = cleaned.match(/^(?:(?:\+91|91|0))?([6-9]\d{9})$/);
  return match ? match[1] : cleaned;
};

module.exports = {
  async getAll(page = 1, limit = 10) {
    try {
      const { skip } = formatPagination(page, limit);
      const total = await Partys.countDocuments();
      const data = await Partys.find()
        .populate('country_id', 'name')
        .populate('state_id', 'name country_id')
        .populate('city_id', 'name country_id')
        .populate('currency_id', 'name code symbol')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      return { data, total };
    } catch (error) {
      logger.error('Error in getAll:', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      return await Partys.findById(id)
        .populate('country_id', 'name')
        .populate('state_id', 'name country_id')
        .populate('city_id', 'name country_id')
        .populate('currency_id', 'name code symbol');
    } catch (error) {
      logger.error('Error in getById:', error);
      throw error;
    }
  },

  async create(data) {
    try {
      // 1. Normalize phone and email
      if (data.phone) {
        data.phone = normalizePhone(data.phone);
      }
      if (data.email) {
        data.email = data.email.trim().toLowerCase();
      }

      // 2. Uniqueness checks
      if (data.name) {
        const existingName = await Partys.findOne({ name: data.name.trim() });
        if (existingName) {
          const err = new Error('Party name is already in use');
          err.field = 'name';
          err.statusCode = 400;
          throw err;
        }
      }

      if (data.phone) {
        const existingPhone = await Partys.findOne({ phone: data.phone });
        if (existingPhone) {
          const err = new Error('Phone / Mobile number is already registered with another party');
          err.field = 'phone';
          err.statusCode = 400;
          throw err;
        }
      }

      if (data.email) {
        const existingEmail = await Partys.findOne({ email: data.email });
        if (existingEmail) {
          const err = new Error('Email address is already registered with another party');
          err.field = 'email';
          err.statusCode = 400;
          throw err;
        }
      }

      // 3. Normalize country_id, state_id, city_id, currency_id
      if (data.country_id && typeof data.country_id === 'object') {
        data.country_id = data.country_id._id || data.country_id.id;
      }
      if (!data.country_id) {
        data.country_id = null;
      }
      if (data.state_id && typeof data.state_id === 'object') {
        data.state_id = data.state_id._id || data.state_id.id;
      }
      if (!data.state_id) {
        data.state_id = null;
      }
      if (data.city_id && typeof data.city_id === 'object') {
        data.city_id = data.city_id._id || data.city_id.id;
      }
      if (!data.city_id) {
        data.city_id = null;
      }
      if (data.currency_id && typeof data.currency_id === 'object') {
        data.currency_id = data.currency_id._id || data.currency_id.id;
      }
      if (!data.currency_id) {
        data.currency_id = null;
      }

      const created = await Partys.create(data);
      return await Partys.findById(created._id)
        .populate('country_id', 'name')
        .populate('state_id', 'name country_id')
        .populate('city_id', 'name country_id')
        .populate('currency_id', 'name code symbol');
    } catch (error) {
      logger.error('Error in create:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      // 1. Normalize phone and email if provided
      if (data.phone) {
        data.phone = normalizePhone(data.phone);
      }
      if (data.email) {
        data.email = data.email.trim().toLowerCase();
      }

      // 2. Uniqueness checks excluding current party
      if (data.name) {
        const existingName = await Partys.findOne({
          name: data.name.trim(),
          _id: { $ne: id },
        });
        if (existingName) {
          const err = new Error('Party name is already in use');
          err.field = 'name';
          err.statusCode = 400;
          throw err;
        }
      }

      if (data.phone) {
        const existingPhone = await Partys.findOne({
          phone: data.phone,
          _id: { $ne: id },
        });
        if (existingPhone) {
          const err = new Error('Phone / Mobile number is already registered with another party');
          err.field = 'phone';
          err.statusCode = 400;
          throw err;
        }
      }

      if (data.email) {
        const existingEmail = await Partys.findOne({
          email: data.email,
          _id: { $ne: id },
        });
        if (existingEmail) {
          const err = new Error('Email address is already registered with another party');
          err.field = 'email';
          err.statusCode = 400;
          throw err;
        }
      }

      // 3. Normalize country_id, state_id, city_id, currency_id
      if (data.country_id && typeof data.country_id === 'object') {
        data.country_id = data.country_id._id || data.country_id.id;
      }
      if (data.country_id === '') {
        data.country_id = null;
      }
      if (data.state_id && typeof data.state_id === 'object') {
        data.state_id = data.state_id._id || data.state_id.id;
      }
      if (data.state_id === '') {
        data.state_id = null;
      }
      if (data.city_id && typeof data.city_id === 'object') {
        data.city_id = data.city_id._id || data.city_id.id;
      }
      if (data.city_id === '') {
        data.city_id = null;
      }
      if (data.currency_id && typeof data.currency_id === 'object') {
        data.currency_id = data.currency_id._id || data.currency_id.id;
      }
      if (data.currency_id === '') {
        data.currency_id = null;
      }

      return await Partys.findByIdAndUpdate(id, data, { new: true, runValidators: true })
        .populate('country_id', 'name')
        .populate('state_id', 'name country_id')
        .populate('city_id', 'name country_id')
        .populate('currency_id', 'name code symbol');
    } catch (error) {
      logger.error('Error in update:', error);
      throw error;
    }
  },

  async status(id, status) {
    try {
      return await Partys.findByIdAndUpdate(id, { isActive: Boolean(status) }, { new: true, runValidators: true });
    } catch (error) {
      logger.error('Error in status:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      return await Partys.findByIdAndDelete(id);
    } catch (error) {
      logger.error('Error in delete:', error);
      throw error;
    }
  },
};
