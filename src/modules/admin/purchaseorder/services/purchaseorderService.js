const Purchaseorder = require('../models/purchaseorderModel');
const PurchaseorderDetails = require('../models/purchaseorderDetailsModel');
const Purchase = require('../../purchase/models/purchaseModel');
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

const formatLinkedPurchases = (rows = []) =>
  rows.map((lp) => ({
    id: String(lp._id),
    _id: String(lp._id),
    purchase_no: lp.purchase_no || '',
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
      const distinctYears = await Purchaseorder.distinct('fin_year');
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
      logger.error('Error in getFinancialYears Purchaseorder:', error);
      return [this.getFinancialYear()];
    }
  },

  async getNextPurchaseorderNo(targetDate = new Date(), customFinYear = null, customPrefix = null) {
    try {
      let basePrefix = customPrefix ? String(customPrefix).trim() : null;
      if (!basePrefix) {
        try {
          const SettingsService = require('../../settings/services/settingsService');
          const settingItem =
            (await SettingsService.getByIdOrKey("setting('prefixes.purchaseorder')")) ||
            (await SettingsService.getByIdOrKey('prefixes.purchaseorder')) ||
            (await SettingsService.getByIdOrKey("setting('prefixes.purchase_order')")) ||
            (await SettingsService.getByIdOrKey('prefixes.purchase_order')) ||
            (await SettingsService.getByIdOrKey("setting('purchaseorder.prefix')")) ||
            (await SettingsService.getByIdOrKey('purchaseorder.prefix')) ||
            (await SettingsService.getByIdOrKey("setting('prefixes.purchase')")) ||
            (await SettingsService.getByIdOrKey('prefixes.purchase'));
          if (settingItem && settingItem.value) {
            basePrefix = String(settingItem.value).trim();
          }
        } catch (e) {
          // ignore fallback
        }
      }
      if (!basePrefix) {
        basePrefix = 'PO';
      }
      basePrefix = basePrefix.replace(/\/+$/, '');

      const fy = (customFinYear && typeof customFinYear === 'string' && customFinYear.trim() && customFinYear !== 'All')
        ? customFinYear.trim()
        : this.getFinancialYear(targetDate);
      const prefix = `${basePrefix}/${fy}/`;
      const escaped = basePrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`^${escaped}/${fy}/(\\d+)$`, 'i');

      const matchingOrders = await Purchaseorder.find({
        $or: [
          { purchase_order_no: { $regex: `^${escaped}/${fy}/`, $options: 'i' } },
          { purchase_no: { $regex: `^${escaped}/${fy}/`, $options: 'i' } },
        ],
      }).select('purchase_order_no purchase_no');

      let maxSeq = 0;
      for (const p of matchingOrders) {
        const no = p.purchase_order_no || p.purchase_no;
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
      logger.error('Error in getNextPurchaseorderNo:', error);
      const fy = (customFinYear && typeof customFinYear === 'string' && customFinYear.trim() && customFinYear !== 'All')
        ? customFinYear.trim()
        : this.getFinancialYear(targetDate);
      const basePrefix = (customPrefix ? String(customPrefix).trim() : 'PO').replace(/\/+$/, '');
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
          { purchase_order_no: regex },
          { purchase_no: regex },
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

      const total = await Purchaseorder.countDocuments(query);
      const data = await Purchaseorder.find(query)
        .populate({
          path: 'vendor_id',
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

      const orderIds = data.map((d) => d._id);
      const linkedPurchases =
        orderIds.length > 0
          ? await Purchase.find({ purchaseorder_id: { $in: orderIds } })
              .select('purchaseorder_id purchase_no _id')
              .lean()
          : [];

      const linkedMap = new Map();
      for (const lp of linkedPurchases) {
        const key = String(lp.purchaseorder_id);
        if (!linkedMap.has(key)) {
          linkedMap.set(key, []);
        }
        linkedMap.get(key).push(lp);
      }

      const enrichedData = data.map((order) => {
        const plain = typeof order.toObject === 'function' ? order.toObject() : { ...order };
        const links = formatLinkedPurchases(linkedMap.get(String(plain._id)) || []);
        plain.isUsedInPurchase = links.length > 0;
        plain.has_purchase = links.length > 0;
        plain.linked_purchases = links;
        plain.linked_purchase_no = links[0]?.purchase_no || '';
        return plain;
      });

      return { data: enrichedData, total };
    } catch (error) {
      logger.error('Error in getAll Purchaseorder:', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const order = await Purchaseorder.findById(id)
        .populate({
          path: 'vendor_id',
          select: 'name phone email gstin address taxType currency_id country_id city_id',
          populate: [
            { path: 'country_id', select: 'name' },
            { path: 'city_id', select: 'name' },
          ],
        })
        .populate('currency_id', 'name code symbol');
      if (!order) return null;

      const details = await PurchaseorderDetails.find({ purchaseorder_id: id })
        .populate({
          path: 'service_id',
          select: 'name category_id subcategory_id isActive',
          populate: [
            { path: 'category_id', select: 'name' },
            { path: 'subcategory_id', select: 'name' },
          ],
        })
        .populate('unit_id', 'name');

      const linkedPurchases = await Purchase.find({ purchaseorder_id: id })
        .select('purchaseorder_id purchase_no _id')
        .lean();
      const links = formatLinkedPurchases(linkedPurchases);

      const plain = order.toObject();
      plain.items = details;
      plain.purchaseorder_details = details;
      plain.purchase_details = details;
      plain.isUsedInPurchase = links.length > 0;
      plain.has_purchase = links.length > 0;
      plain.linked_purchases = links;
      plain.linked_purchase_no = links[0]?.purchase_no || '';
      return plain;
    } catch (error) {
      logger.error('Error in getById Purchaseorder:', error);
      throw error;
    }
  },

  async create(data) {
    try {
      const { items, purchaseorder_details, purchase_details, ...headerData } = data;
      const rawItems = items || purchaseorder_details || purchase_details || [];

      // Normalize vendor_id
      if (headerData.vendor_id && typeof headerData.vendor_id === 'object') {
        headerData.vendor_id = headerData.vendor_id._id || headerData.vendor_id.id;
      }

      // Normalize currency_id
      if (headerData.currency_id && typeof headerData.currency_id === 'object') {
        headerData.currency_id = headerData.currency_id._id || headerData.currency_id.id;
      }
      if (headerData.currency_id === '') {
        headerData.currency_id = null;
      }

      // Handle order_date alias to invoice_date
      if (!headerData.invoice_date && headerData.order_date) {
        headerData.invoice_date = headerData.order_date;
      }

      // Automatically assign fin_year based on invoice_date or current date
      if (!headerData.fin_year || !headerData.fin_year.trim()) {
        headerData.fin_year = this.getFinancialYear(headerData.invoice_date || new Date());
      } else {
        headerData.fin_year = headerData.fin_year.trim();
      }

      // Harmonize purchase_order_no and purchase_no
      const givenNo = headerData.purchase_order_no || headerData.purchase_no;
      if (!givenNo || !givenNo.trim()) {
        headerData.purchase_order_no = await this.getNextPurchaseorderNo(headerData.invoice_date || new Date(), headerData.fin_year);
      } else {
        headerData.purchase_order_no = givenNo.trim();
        const existing = await Purchaseorder.findOne({
          $or: [
            { purchase_order_no: headerData.purchase_order_no },
            { purchase_no: headerData.purchase_order_no },
          ],
        });
        if (existing) {
          const err = new Error(`Purchase order number "${headerData.purchase_order_no}" is already in use`);
          err.statusCode = 400;
          throw err;
        }
      }

      // Create purchaseorder header in Purchaseorder collection
      const order = await Purchaseorder.create(headerData);

      // Save line items in separate collection purchaseorder_details
      if (Array.isArray(rawItems) && rawItems.length > 0) {
        const detailsToInsert = rawItems.map((item) => ({
          purchaseorder_id: order._id,
          service_id: typeof item.service_id === 'object' ? item.service_id._id || item.service_id.id : item.service_id,
          quantity: Number(item.quantity) || 1,
          unit_id: typeof item.unit_id === 'object' ? item.unit_id._id || item.unit_id.id : item.unit_id,
          rate: Number(item.rate) || 0,
          discount: Number(item.discount) || 0,
          total: Number(item.total) || 0,
        }));
        await PurchaseorderDetails.insertMany(detailsToInsert);
      }

      return await this.getById(order._id);
    } catch (error) {
      logger.error('Error in create Purchaseorder:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      const { items, purchaseorder_details, purchase_details, ...headerData } = data;
      const rawItems = items || purchaseorder_details || purchase_details;

      delete headerData.id;
      delete headerData._id;

      // Normalize vendor_id
      if (headerData.vendor_id && typeof headerData.vendor_id === 'object') {
        headerData.vendor_id = headerData.vendor_id._id || headerData.vendor_id.id;
      }

      // Normalize currency_id
      if (headerData.currency_id && typeof headerData.currency_id === 'object') {
        headerData.currency_id = headerData.currency_id._id || headerData.currency_id.id;
      }
      if (headerData.currency_id === '') {
        headerData.currency_id = null;
      }

      // Handle order_date alias
      if (!headerData.invoice_date && headerData.order_date) {
        headerData.invoice_date = headerData.order_date;
      }

      // Ensure fin_year is updated if provided or if invoice_date changed
      if (headerData.fin_year && headerData.fin_year.trim()) {
        headerData.fin_year = headerData.fin_year.trim();
      } else if (headerData.invoice_date) {
        headerData.fin_year = this.getFinancialYear(headerData.invoice_date);
      }

      // Harmonize purchase_order_no
      const givenNo = headerData.purchase_order_no || headerData.purchase_no;
      if (givenNo) {
        headerData.purchase_order_no = givenNo.trim();
        const existing = await Purchaseorder.findOne({
          $or: [
            { purchase_order_no: headerData.purchase_order_no },
            { purchase_no: headerData.purchase_order_no },
          ],
          _id: { $ne: id },
        });
        if (existing) {
          const err = new Error(`Purchase order number "${headerData.purchase_order_no}" is already in use`);
          err.statusCode = 400;
          throw err;
        }
      }

      // Update purchase order header
      await Purchaseorder.findByIdAndUpdate(id, headerData, { new: true, runValidators: true });

      // Update line items in separate collection purchaseorder_details if provided
      if (Array.isArray(rawItems)) {
        await PurchaseorderDetails.deleteMany({ purchaseorder_id: id });
        if (rawItems.length > 0) {
          const detailsToInsert = rawItems.map((item) => ({
            purchaseorder_id: id,
            service_id: typeof item.service_id === 'object' ? item.service_id._id || item.service_id.id : item.service_id,
            quantity: Number(item.quantity) || 1,
            unit_id: typeof item.unit_id === 'object' ? item.unit_id._id || item.unit_id.id : item.unit_id,
            rate: Number(item.rate) || 0,
            discount: Number(item.discount) || 0,
            total: Number(item.total) || 0,
          }));
          await PurchaseorderDetails.insertMany(detailsToInsert);
        }
      }

      return await this.getById(id);
    } catch (error) {
      logger.error('Error in update Purchaseorder:', error);
      throw error;
    }
  },

  async status(id, status) {
    try {
      return await Purchaseorder.findByIdAndUpdate(id, { isActive: Boolean(status) }, { new: true, runValidators: true });
    } catch (error) {
      logger.error('Error in status Purchaseorder:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const linkedPurchase = await Purchase.findOne({ purchaseorder_id: id })
        .select('purchase_no _id')
        .lean();
      if (linkedPurchase) {
        const refLabel = linkedPurchase.purchase_no || linkedPurchase._id;
        const err = new Error(
          `Cannot delete Purchase Order because Purchase "${refLabel}" has already been created from it.`
        );
        err.statusCode = 400;
        throw err;
      }

      await PurchaseorderDetails.deleteMany({ purchaseorder_id: id });
      return await Purchaseorder.findByIdAndDelete(id);
    } catch (error) {
      logger.error('Error in delete Purchaseorder:', error);
      throw error;
    }
  },
};
