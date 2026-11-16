const Taxrate = require('../models/taxrateModel');
const { formatPagination } = require('../../../../utils/helpers');
const logger = require('../../../../services/logger');

const DEFAULT_TAXRATES = [
  { name: 'GST 0%', rate: 0, taxType: 'GST', description: 'Nil rated or exempt goods/services', isDefault: false, isActive: true },
  { name: 'GST 5%', rate: 5, taxType: 'GST', description: 'Essential goods and services', isDefault: false, isActive: true },
  { name: 'GST 12%', rate: 12, taxType: 'GST', description: 'Standard lower rate goods/services', isDefault: false, isActive: true },
  { name: 'GST 18%', rate: 18, taxType: 'GST', description: 'Standard rate for most goods/services', isDefault: true, isActive: true },
  { name: 'GST 28%', rate: 28, taxType: 'GST', description: 'Luxury and specialized goods', isDefault: false, isActive: true },
  { name: 'VAT 5%', rate: 5, taxType: 'VAT', description: 'Standard international / UAE VAT rate', isDefault: false, isActive: true },
  { name: 'VAT 0%', rate: 0, taxType: 'VAT', description: 'Zero rated exports / international VAT', isDefault: false, isActive: true },
];

module.exports = {
  async getAll(page = 1, limit = 10, filter = {}) {
    try {
      let total = await Taxrate.countDocuments();
      if (total === 0) {
        try {
          await Taxrate.insertMany(DEFAULT_TAXRATES);
          total = await Taxrate.countDocuments();
        } catch (seedErr) {
          logger.warn('Could not auto-seed taxrates:', seedErr);
        }
      }

      const isUnlimited = limit >= 1000;
      const { skip } = formatPagination(page, limit);

      const query = {};
      if (filter.taxType) {
        query.taxType = String(filter.taxType).toUpperCase();
      }
      if (filter.isActive !== undefined && filter.isActive !== '') {
        query.isActive = filter.isActive === true || filter.isActive === 'true';
      }
      if (filter.search) {
        query.$or = [
          { name: { $regex: filter.search, $options: 'i' } },
          { description: { $regex: filter.search, $options: 'i' } },
        ];
      }

      const filteredTotal = await Taxrate.countDocuments(query);
      let queryChain = Taxrate.find(query).sort({ rate: 1, name: 1 });

      if (!isUnlimited) {
        queryChain = queryChain.skip(skip).limit(limit);
      }

      const data = await queryChain.exec();
      return { data, total: filteredTotal };
    } catch (error) {
      logger.error('Error in getAll taxrates:', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      return await Taxrate.findById(id);
    } catch (error) {
      logger.error('Error in getById taxrate:', error);
      throw error;
    }
  },

  async create(data) {
    try {
      const existing = await Taxrate.findOne({ name: data.name });
      if (existing) throw new Error(`Tax rate "${data.name}" already exists`);

      if (data.isDefault) {
        await Taxrate.updateMany(
          { taxType: data.taxType || 'GST' },
          { $set: { isDefault: false } }
        );
      }

      return await Taxrate.create(data);
    } catch (error) {
      logger.error('Error in create taxrate:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      if (data.name) {
        const existing = await Taxrate.findOne({ name: data.name, _id: { $ne: id } });
        if (existing) throw new Error(`Tax rate "${data.name}" already exists`);
      }

      if (data.isDefault) {
        await Taxrate.updateMany(
          { _id: { $ne: id }, taxType: data.taxType || 'GST' },
          { $set: { isDefault: false } }
        );
      }

      return await Taxrate.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    } catch (error) {
      logger.error('Error in update taxrate:', error);
      throw error;
    }
  },

  async status(id, status) {
    try {
      return await Taxrate.findByIdAndUpdate(
        id,
        { isActive: Boolean(status) },
        { new: true, runValidators: true }
      );
    } catch (error) {
      logger.error('Error in status taxrate:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      return await Taxrate.findByIdAndDelete(id);
    } catch (error) {
      logger.error('Error in delete taxrate:', error);
      throw error;
    }
  },
};
