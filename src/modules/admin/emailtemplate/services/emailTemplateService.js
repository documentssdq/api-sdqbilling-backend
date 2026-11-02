const EmailTemplate = require('../models/emailTemplateModel');
const { formatPagination } = require('../../../../utils/helpers');
const logger = require('../../../../services/logger');

module.exports = {

  /**
   * @description Fetch all email templates with pagination
   * @param {number} page
   * @param {number} limit
   * @returns {Promise<{data: Array, total: number}>}
   */
  async getAll(page = 1, limit = 10) {
    try {
      const { skip } = formatPagination(page, limit);
      const total = await EmailTemplate.countDocuments();
      const data = await EmailTemplate.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
      return { data, total };
    } catch (error) {
      logger.error('Error in EmailTemplateService getAll:', error);
      throw error;
    }
  },

  /**
   * @description Fetch email template by ID
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async getById(id) {
    try {
      return await EmailTemplate.findById(id);
    } catch (error) {
      logger.error('Error in EmailTemplateService getById:', error);
      throw error;
    }
  },

  /**
   * @description Create new email template
   * @param {Object} data
   * @returns {Promise<Object|null>}
   */
  async create(data) {
    try {
      const existing = await EmailTemplate.findOne({ unique_code: data.unique_code });
      if (existing) throw new Error('Unique code already exists');
      return await EmailTemplate.create(data);
    } catch (error) {
      logger.error('Error in EmailTemplateService create:', error);
      throw error;
    }
  },

  /**
   * @description Update email template
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<Object|null>}
   */
  async update(id, data) {
    try {
      return await EmailTemplate.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    } catch (error) {
      logger.error('Error in EmailTemplateService update:', error);
      throw error;
    }
  },

  /**
   * @description Update email template status
   * @param {string} id
   * @param {boolean} status
   * @returns {Promise<Object|null>}
   */
  async status(id, status) {
    try {
      return await EmailTemplate.findByIdAndUpdate(id, { isActive: Boolean(status) }, { new: true, runValidators: true });
    } catch (error) {
      logger.error('Error in EmailTemplateService status:', error);
      throw error;
    }
  },

  /**
   * @description Delete email template
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async delete(id) {
    try {
      return await EmailTemplate.findByIdAndDelete(id);
    } catch (error) {
      logger.error('Error in EmailTemplateService delete:', error);
      throw error;
    }
  },
};
