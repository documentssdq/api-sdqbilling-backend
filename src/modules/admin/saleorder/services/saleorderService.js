const Saleorder = require('../models/saleorderModel');
const SaleorderDetails = require('../models/saleorderDetailsModel');
// Require referenced models so mongoose registers them for populate
require('../../partys/models/partysModel');
require('../../services/models/servicesModel');
require('../../categorys/models/categorysModel');
require('../../subcategorys/models/subcategorysModel');
require('../../unit/models/unitModel');
require('../../currency/models/currencyModel');
require('../../countries/models/countriesModel');
require('../../city/models/cityModel');

const { formatPagination } = require('../../../../utils/helpers');
const logger = require('../../../../services/logger');

const normalizeHeaderPayload = (headerData = {}) => {
  if (headerData.customer_id && typeof headerData.customer_id === 'object') {
    headerData.customer_id = headerData.customer_id._id || headerData.customer_id.id;
  }

  if (headerData.currency_id && typeof headerData.currency_id === 'object') {
    headerData.currency_id = headerData.currency_id._id || headerData.currency_id.id;
  }
  if (headerData.currency_id === '') {
    headerData.currency_id = null;
  }

  if (!headerData.invoice_date && headerData.order_date) {
    headerData.invoice_date = headerData.order_date;
  }
  if (headerData.challan_date === '') {
    headerData.challan_date = null;
  }
  if (headerData.due_date === '') {
    headerData.due_date = null;
  }
  return headerData;
};

const mapDetailItems = (saleorderId, rawItems = []) =>
  rawItems.map((item) => ({
    saleorder_id: saleorderId,
    service_id:
      typeof item.service_id === 'object'
        ? item.service_id._id || item.service_id.id
        : item.service_id,
    quantity: Number(item.quantity) || 1,
    unit_id:
      typeof item.unit_id === 'object'
        ? item.unit_id._id || item.unit_id.id
        : item.unit_id,
    rate: Number(item.rate) || 0,
    discount: Number(item.discount) || 0,
    total: Number(item.total) || 0,
  }));

module.exports = {
  getFinancialYear(date = new Date()) {
    const d = new Date(date);
    const valid = !isNaN(d.getTime());
    const year = valid ? d.getFullYear() : new Date().getFullYear();
    const month = valid ? d.getMonth() : new Date().getMonth();
    const startYear = month >= 3 ? year : year - 1;
    return `${startYear}-${startYear + 1}`;
  },

  async getFinancialYears() {
    try {
      const START_YEAR = 2026;
      const distinctYears = await Saleorder.distinct('fin_year');
      const currentFY = this.getFinancialYear();
      const allYears = new Set();
      allYears.add(currentFY);

      if (Array.isArray(distinctYears)) {
        distinctYears.forEach((y) => {
          if (y && typeof y === 'string') {
            const startY = parseInt(y.split('-')[0], 10);
            if (!isNaN(startY) && startY >= START_YEAR) {
              allYears.add(y.trim());
            }
          }
        });
      }

      return Array.from(allYears).sort().reverse();
    } catch (error) {
      logger.error('Error in getFinancialYears Saleorder:', error);
      return [this.getFinancialYear()];
    }
  },

  async getNextSaleorderNo(targetDate = new Date(), customFinYear = null, customPrefix = null) {
    try {
      let basePrefix = customPrefix ? String(customPrefix).trim() : null;
      if (!basePrefix) {
        try {
          const SettingsService = require('../../settings/services/settingsService');
          const settingItem =
            (await SettingsService.getByIdOrKey("setting('prefixes.saleorder')")) ||
            (await SettingsService.getByIdOrKey('prefixes.saleorder')) ||
            (await SettingsService.getByIdOrKey("setting('prefixes.sale_order')")) ||
            (await SettingsService.getByIdOrKey('prefixes.sale_order')) ||
            (await SettingsService.getByIdOrKey("setting('saleorder.prefix')")) ||
            (await SettingsService.getByIdOrKey('saleorder.prefix'));
          if (settingItem && settingItem.value) {
            basePrefix = String(settingItem.value).trim();
          }
        } catch (e) {
          // ignore fallback
        }
      }
      if (!basePrefix) {
        basePrefix = 'SO';
      }
      basePrefix = basePrefix.replace(/\/+$/, '');

      const fy = (customFinYear && typeof customFinYear === 'string' && customFinYear.trim() && customFinYear !== 'All')
        ? customFinYear.trim()
        : this.getFinancialYear(targetDate);
      const prefix = `${basePrefix}/${fy}/`;
      const escaped = basePrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`^${escaped}/${fy}/(\\d+)$`, 'i');

      const matchingOrders = await Saleorder.find({
        $or: [
          { sale_order_no: { $regex: `^${escaped}/${fy}/`, $options: 'i' } },
          { sale_no: { $regex: `^${escaped}/${fy}/`, $options: 'i' } },
        ],
      }).select('sale_order_no sale_no');

      let maxSeq = 0;
      for (const s of matchingOrders) {
        const no = s.sale_order_no || s.sale_no;
        const match = no ? no.match(regex) : null;
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxSeq) {
            maxSeq = num;
          }
        }
      }

      return `${prefix}${maxSeq + 1}`;
    } catch (error) {
      logger.error('Error in getNextSaleorderNo:', error);
      const fy = (customFinYear && typeof customFinYear === 'string' && customFinYear.trim() && customFinYear !== 'All')
        ? customFinYear.trim()
        : this.getFinancialYear(targetDate);
      const basePrefix = (customPrefix ? String(customPrefix).trim() : 'SO').replace(/\/+$/, '');
      return `${basePrefix}/${fy}/1`;
    }
  },

  async getAll(page = 1, limit = 10, search = '', fin_year = '') {
    try {
      const { skip } = formatPagination(page, limit);
      let query = {};

      if (fin_year && fin_year.trim() && fin_year !== 'All') {
        query.fin_year = fin_year.trim();
      }

      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        const searchConditions = [
          { sale_order_no: regex },
          { sale_no: regex },
          { invoice_no: regex },
          { remarks: regex },
          { fin_year: regex },
        ];
        if (query.fin_year) {
          query = {
            $and: [
              { fin_year: query.fin_year },
              { $or: searchConditions },
            ],
          };
        } else {
          query.$or = searchConditions;
        }
      }

      const total = await Saleorder.countDocuments(query);
      const data = await Saleorder.find(query)
        .populate({
          path: 'customer_id',
          select: 'name phone email gstin address taxType currency_id country_id city_id',
          populate: [
            { path: 'country_id', select: 'name' },
            { path: 'city_id', select: 'name' },
          ],
        })
        .populate('currency_id', 'name code symbol')
        .sort({ invoice_date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return { data, total };
    } catch (error) {
      logger.error('Error in getAll Saleorder:', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const order = await Saleorder.findById(id)
        .populate({
          path: 'customer_id',
          select: 'name phone email gstin address taxType currency_id country_id city_id',
          populate: [
            { path: 'country_id', select: 'name' },
            { path: 'city_id', select: 'name' },
          ],
        })
        .populate('currency_id', 'name code symbol');
      if (!order) return null;

      const details = await SaleorderDetails.find({ saleorder_id: id })
        .populate({
          path: 'service_id',
          select: 'name category_id subcategory_id isActive',
          populate: [
            { path: 'category_id', select: 'name' },
            { path: 'subcategory_id', select: 'name' },
          ],
        })
        .populate('unit_id', 'name');

      const plain = order.toObject();
      plain.items = details;
      plain.saleorder_details = details;
      plain.sale_details = details;
      return plain;
    } catch (error) {
      logger.error('Error in getById Saleorder:', error);
      throw error;
    }
  },

  async create(data) {
    try {
      const { items, saleorder_details, sale_details, ...headerData } = data;
      const rawItems = items || saleorder_details || sale_details || [];

      normalizeHeaderPayload(headerData);

      if (!headerData.fin_year || !headerData.fin_year.trim()) {
        headerData.fin_year = this.getFinancialYear(headerData.invoice_date || new Date());
      } else {
        headerData.fin_year = headerData.fin_year.trim();
      }

      const givenNo = headerData.sale_order_no || headerData.sale_no;
      if (!givenNo || !givenNo.trim()) {
        headerData.sale_order_no = await this.getNextSaleorderNo(headerData.invoice_date || new Date(), headerData.fin_year);
      } else {
        headerData.sale_order_no = givenNo.trim();
        const existing = await Saleorder.findOne({
          $or: [
            { sale_order_no: headerData.sale_order_no },
            { sale_no: headerData.sale_order_no },
          ],
        });
        if (existing) {
          const err = new Error(`Sale order number "${headerData.sale_order_no}" is already in use`);
          err.statusCode = 400;
          throw err;
        }
      }

      const order = await Saleorder.create(headerData);

      if (Array.isArray(rawItems) && rawItems.length > 0) {
        await SaleorderDetails.insertMany(mapDetailItems(order._id, rawItems));
      }

      return await this.getById(order._id);
    } catch (error) {
      logger.error('Error in create Saleorder:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      const { items, saleorder_details, sale_details, ...headerData } = data;
      const rawItems = items || saleorder_details || sale_details;

      delete headerData.id;
      delete headerData._id;

      normalizeHeaderPayload(headerData);

      if (headerData.fin_year && headerData.fin_year.trim()) {
        headerData.fin_year = headerData.fin_year.trim();
      } else if (headerData.invoice_date) {
        headerData.fin_year = this.getFinancialYear(headerData.invoice_date);
      }

      const givenNo = headerData.sale_order_no || headerData.sale_no;
      if (givenNo) {
        headerData.sale_order_no = givenNo.trim();
        const existing = await Saleorder.findOne({
          $or: [
            { sale_order_no: headerData.sale_order_no },
            { sale_no: headerData.sale_order_no },
          ],
          _id: { $ne: id },
        });
        if (existing) {
          const err = new Error(`Sale order number "${headerData.sale_order_no}" is already in use`);
          err.statusCode = 400;
          throw err;
        }
      }

      await Saleorder.findByIdAndUpdate(id, headerData, { new: true, runValidators: true });

      if (Array.isArray(rawItems)) {
        await SaleorderDetails.deleteMany({ saleorder_id: id });
        if (rawItems.length > 0) {
          await SaleorderDetails.insertMany(mapDetailItems(id, rawItems));
        }
      }

      return await this.getById(id);
    } catch (error) {
      logger.error('Error in update Saleorder:', error);
      throw error;
    }
  },

  async status(id, status) {
    try {
      return await Saleorder.findByIdAndUpdate(id, { isActive: Boolean(status) }, { new: true, runValidators: true });
    } catch (error) {
      logger.error('Error in status Saleorder:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      await SaleorderDetails.deleteMany({ saleorder_id: id });
      return await Saleorder.findByIdAndDelete(id);
    } catch (error) {
      logger.error('Error in delete Saleorder:', error);
      throw error;
    }
  },
};
