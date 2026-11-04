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
      return await City.findById(id).populate('country_id', 'name');
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
      const existing = await City.findOne({
        name: data.name,
        country_id: data.country_id,
      });
      if (existing) {
        const err = new Error('City name already exists in this country');
        err.field = 'name';
        err.statusCode = 400;
        throw err;
      }
      const created = await City.create(data);
      return await City.findById(created._id).populate('country_id', 'name');
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
      if (data.name && data.country_id) {
        const existing = await City.findOne({
          name: data.name,
          country_id: data.country_id,
          _id: { $ne: id },
        });
        if (existing) {
          const err = new Error('City name already exists in this country');
          err.field = 'name';
          err.statusCode = 400;
          throw err;
        }
      }
      return await City.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate('country_id', 'name');
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
