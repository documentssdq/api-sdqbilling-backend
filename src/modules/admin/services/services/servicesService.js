const Services = require('../models/servicesModel');
  const { formatPagination } = require('../../../../utils/helpers');
  const logger = require('../../../../services/logger');

module.exports = {
  async getAll(page = 1, limit = 10) {
    try {
      const { skip } = formatPagination(page, limit);
      const total = await Services.countDocuments();
      const data = await Services.find().populate('category_id', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit);
      return { data, total };
    } catch (error) {
      logger.error('Error in getAll:', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      return await Services.findById(id).populate('category_id', 'name');
    } catch (error) {
      logger.error('Error in getById:', error);
      throw error;
    }
  },

  async create(data) {
    try {
      if (!data.category_id && data.ccategory_id) {
        data.category_id = data.ccategory_id;
      }
      if (data.category_id && typeof data.category_id === 'object') {
        data.category_id = data.category_id._id || data.category_id.id;
      }
      const existing = await Services.findOne({ name: data.name });
      if (existing) throw new Error('Name already exists');
      const created = await Services.create(data);
      return await Services.findById(created._id).populate('category_id', 'name');
    } catch (error) {
      logger.error('Error in create:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      if (!data.category_id && data.ccategory_id) {
        data.category_id = data.ccategory_id;
      }
      if (data.category_id && typeof data.category_id === 'object') {
        data.category_id = data.category_id._id || data.category_id.id;
      }
      return await Services.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate('category_id', 'name');
    } catch (error) {
      logger.error('Error in update:', error);
      throw error;
    }
  },

  async status(id, status) {
    try {
      return await Services.findByIdAndUpdate(id, { isActive: Boolean(status) }, { new: true, runValidators: true });
    } catch (error) {
      logger.error('Error in status:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      return await Services.findByIdAndDelete(id);
    } catch (error) {
      logger.error('Error in delete:', error);
      throw error;
    }
  },
};
