const Widget = require('../models/widgetModel');
const { formatPagination } = require('../../../../utils/helpers');
const logger = require('../../../../services/logger');

module.exports = {
  async getAll(page = 1, limit = 100) {
    try {
      const { skip } = formatPagination(page, limit);
      const total = await Widget.countDocuments();
      const data = await Widget.find().sort({ displaySequence: 1, createdAt: -1 }).skip(skip).limit(limit);
      return { data, total };
    } catch (error) {
      logger.error('Error in getAll:', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      return await Widget.findById(id);
    } catch (error) {
      logger.error('Error in getById:', error);
      throw error;
    }
  },

  async create(data) {
    try {
      return await Widget.create(data);
    } catch (error) {
      logger.error('Error in create:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      return await Widget.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    } catch (error) {
      logger.error('Error in update:', error);
      throw error;
    }
  },

  async status(id, status) {
    try {
      return await Widget.findByIdAndUpdate(id, { isActive: Boolean(status) }, { new: true, runValidators: true });
    } catch (error) {
      logger.error('Error in status:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      return await Widget.findByIdAndDelete(id);
    } catch (error) {
      logger.error('Error in delete:', error);
      throw error;
    }
  },
};
