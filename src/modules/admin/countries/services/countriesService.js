const Countries = require('../models/countriesModel');
  const { formatPagination } = require('../../../../utils/helpers');
  const logger = require('../../../../services/logger');

module.exports = {
  async getAll(page = 1, limit = 10) {
    try {
      const { skip } = formatPagination(page, limit);
      const total = await Countries.countDocuments();
      const data = await Countries.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
      return { data, total };
    } catch (error) {
      logger.error('Error in getAll:', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      return await Countries.findById(id);
    } catch (error) {
      logger.error('Error in getById:', error);
      throw error;
    }
  },

  async create(data) {
    try {
      const existing = await Countries.findOne({ name: data.name });
      if (existing) throw new Error('Name already exists');
      return await Countries.create(data);
    } catch (error) {
      logger.error('Error in create:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      return await Countries.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    } catch (error) {
      logger.error('Error in update:', error);
      throw error;
    }
  },

  async status(id, status) {
    try {
      return await Countries.findByIdAndUpdate(id, { isActive: Boolean(status) }, { new: true, runValidators: true });
    } catch (error) {
      logger.error('Error in status:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      return await Countries.findByIdAndDelete(id);
    } catch (error) {
      logger.error('Error in delete:', error);
      throw error;
    }
  },
};
