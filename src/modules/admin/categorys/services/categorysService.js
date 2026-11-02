const Categorys = require('../models/categorysModel');
  const { formatPagination } = require('../../../../utils/helpers');
  const logger = require('../../../../services/logger');

module.exports = {
  async getAll(page = 1, limit = 10) {
    try {
      const { skip } = formatPagination(page, limit);
      const total = await Categorys.countDocuments();
      const data = await Categorys.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
      return { data, total };
    } catch (error) {
      logger.error('Error in getAll:', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      return await Categorys.findById(id);
    } catch (error) {
      logger.error('Error in getById:', error);
      throw error;
    }
  },

  async create(data) {
    try {
      const existing = await Categorys.findOne({ name: data.name });
      if (existing) throw new Error('Name already exists');
      return await Categorys.create(data);
    } catch (error) {
      logger.error('Error in create:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      return await Categorys.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    } catch (error) {
      logger.error('Error in update:', error);
      throw error;
    }
  },

  async status(id, status) {
    try {
      return await Categorys.findByIdAndUpdate(id, { isActive: Boolean(status) }, { new: true, runValidators: true });
    } catch (error) {
      logger.error('Error in status:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      return await Categorys.findByIdAndDelete(id);
    } catch (error) {
      logger.error('Error in delete:', error);
      throw error;
    }
  },
};
