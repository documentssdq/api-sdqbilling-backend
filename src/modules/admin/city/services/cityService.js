const City = require('../models/cityModel');
const { formatPagination } = require('../../../../utils/helpers');
const logger = require('../../../../services/logger');

module.exports = {
  async getAll(page = 1, limit = 10) {
    try {
      const { skip } = formatPagination(page, limit);
      const total = await City.countDocuments();
      const data = await City.find()
        .populate('country_id', 'name')
        .populate('state_id', 'name code')
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
      return await City.findById(id)
        .populate('country_id', 'name')
        .populate('state_id', 'name code');
    } catch (error) {
      logger.error('Error in getById:', error);
      throw error;
    }
  },

  async create(data) {
    try {
      if (data.country_id && typeof data.country_id === 'object') {
        data.country_id = data.country_id._id || data.country_id.id;
      }
      if (data.state_id && typeof data.state_id === 'object') {
        data.state_id = data.state_id._id || data.state_id.id;
      }
      const existingQuery = {
        name: data.name,
      };
      if (data.state_id) {
        existingQuery.state_id = data.state_id;
      } else if (data.country_id) {
        existingQuery.country_id = data.country_id;
      }
      const existing = await City.findOne(existingQuery);
      if (existing) {
        const err = new Error('City name already exists in this state');
        err.field = 'name';
        err.statusCode = 400;
        throw err;
      }
      const created = await City.create(data);
      return await City.findById(created._id)
        .populate('country_id', 'name')
        .populate('state_id', 'name code');
    } catch (error) {
      logger.error('Error in create:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      if (data.country_id && typeof data.country_id === 'object') {
        data.country_id = data.country_id._id || data.country_id.id;
      }
      if (data.state_id && typeof data.state_id === 'object') {
        data.state_id = data.state_id._id || data.state_id.id;
      }
      if (data.name && (data.state_id || data.country_id)) {
        const existingQuery = {
          name: data.name,
          _id: { $ne: id },
        };
        if (data.state_id) {
          existingQuery.state_id = data.state_id;
        } else if (data.country_id) {
          existingQuery.country_id = data.country_id;
        }
        const existing = await City.findOne(existingQuery);
        if (existing) {
          const err = new Error('City name already exists in this state');
          err.field = 'name';
          err.statusCode = 400;
          throw err;
        }
      }
      return await City.findByIdAndUpdate(id, data, { new: true, runValidators: true })
        .populate('country_id', 'name')
        .populate('state_id', 'name code');
    } catch (error) {
      logger.error('Error in update:', error);
      throw error;
    }
  },

  async status(id, status) {
    try {
      return await City.findByIdAndUpdate(id, { isActive: Boolean(status) }, { new: true, runValidators: true });
    } catch (error) {
      logger.error('Error in status:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      return await City.findByIdAndDelete(id);
    } catch (error) {
      logger.error('Error in delete:', error);
      throw error;
    }
  },
};
