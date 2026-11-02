const Page = require('../models/pageModel');
  const { formatPagination } = require('../../../../utils/helpers');
  const logger = require('../../../../services/logger');

module.exports = {
  async getAll(page = 1, limit = 10) {
    try {
      const { skip } = formatPagination(page, limit);
      const total = await Page.countDocuments();
      const data = await Page.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
      return { data, total };
    } catch (error) {
      logger.error('Error in getAll:', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      return await Page.findById(id);
    } catch (error) {
      logger.error('Error in getById:', error);
      throw error;
    }
  },

  async create(data) {
    try {
      const existing = await Page.findOne({ pageName: data.pageName });
      if (existing) throw new Error('Page Name already exists');
      return await Page.create(data);
    } catch (error) {
      logger.error('Error in create:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      return await Page.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    } catch (error) {
      logger.error('Error in update:', error);
      throw error;
    }
  },

  async status(id, status) {
    try {
      return await Page.findByIdAndUpdate(id, { isActive: Boolean(status) }, { new: true, runValidators: true });
    } catch (error) {
      logger.error('Error in status:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      return await Page.findByIdAndDelete(id);
    } catch (error) {
      logger.error('Error in delete:', error);
      throw error;
    }
  },
};
