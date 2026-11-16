const mongoose = require('mongoose');
const Purchase = require('../models/purchaseModel');
const PurchaseDetails = require('../models/purchaseDetailsModel');
const Purchaseorder = require('../../purchaseorder/models/purchaseorderModel');
const PurchaseorderDetails = require('../../purchaseorder/models/purchaseorderDetailsModel');
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

const extractRefId = (val) => {
  if (!val) return null;
  if (typeof val === 'object') {
    return val._id || val.id || null;
  }
  const str = String(val).trim();
  return str || null;
};

const toFiniteNumber = (val, fallback = 0) => {
  const num = Number(val);
  return Number.isFinite(num) ? num : fallback;
};

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
      const distinctYears = await Purchase.distinct('fin_year');
      const currentFY = this.getFinancialYear();
      const allYears = new Set();
      allYears.add(currentFY);

      // Only include valid distinct years starting from 2026-2027 onwards
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
      logger.error('Error in getFinancialYears:', error);
      return [this.getFinancialYear()];
    }
  },

  async getNextPurchaseNo(targetDate = new Date(), customFinYear = null, customPrefix = null) {
    try {
      let basePrefix = customPrefix ? String(customPrefix).trim() : null;
      if (!basePrefix) {
        try {
          const SettingsService = require('../../settings/services/settingsService');
          const settingItem =
            (await SettingsService.getByIdOrKey("setting('prefixes.purchase')")) ||
            (await SettingsService.getByIdOrKey('prefixes.purchase')) ||
            (await SettingsService.getByIdOrKey("setting('purchase.prefix')")) ||
            (await SettingsService.getByIdOrKey('purchase.prefix')) ||
            (await SettingsService.getByIdOrKey("setting('general.purchase_prefix')")) ||
            (await SettingsService.getByIdOrKey('general.purchase_prefix'));
          if (settingItem && settingItem.value) {
            basePrefix = String(settingItem.value).trim();
          }
        } catch (e) {
          // ignore fallback
        }
      }
      if (!basePrefix) {
        basePrefix = 'BILL/P';
      }
      basePrefix = basePrefix.replace(/\/+$/, '');

      const fy = (customFinYear && typeof customFinYear === 'string' && customFinYear.trim() && customFinYear !== 'All')
        ? customFinYear.trim()
        : this.getFinancialYear(targetDate);
      const prefix = `${basePrefix}/${fy}/`;
      const escaped = basePrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`^${escaped}/${fy}/(\\d+)$`, 'i');

      const matchingPurchases = await Purchase.find({
        purchase_no: { $regex: `^${escaped}/${fy}/`, $options: 'i' },
      }).select('purchase_no');

      let maxSeq = 0;
      for (const p of matchingPurchases) {
        const match = p.purchase_no ? p.purchase_no.match(regex) : null;
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxSeq) {
            maxSeq = num;
          }
        }
      }

      return `${prefix}${maxSeq + 1}`;
    } catch (error) {
      logger.error('Error in getNextPurchaseNo:', error);
      const fy = (customFinYear && typeof customFinYear === 'string' && customFinYear.trim() && customFinYear !== 'All')
        ? customFinYear.trim()
        : this.getFinancialYear(targetDate);
      const basePrefix = (customPrefix ? String(customPrefix).trim() : 'BILL/P').replace(/\/+$/, '');
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

      const total = await Purchase.countDocuments(query);
      const data = await Purchase.find(query)
        .populate('purchaseorder_id', 'purchase_order_no invoice_date final_amount isActive')
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

      return { data, total };
    } catch (error) {
      logger.error('Error in getAll Purchase:', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const purchase = await Purchase.findById(id)
        .populate('purchaseorder_id', 'purchase_order_no invoice_date final_amount isActive')
        .populate({
          path: 'vendor_id',
          select: 'name phone email gstin address taxType currency_id country_id city_id',
          populate: [
            { path: 'country_id', select: 'name' },
            { path: 'city_id', select: 'name' },
          ],
        })
        .populate('currency_id', 'name code symbol');
      if (!purchase) return null;

      const details = await PurchaseDetails.find({ purchase_id: id })
        .populate({
          path: 'service_id',
          select: 'name category_id subcategory_id isActive',
          populate: [
            { path: 'category_id', select: 'name' },
            { path: 'subcategory_id', select: 'name' },
          ],
        })
        .populate('unit_id', 'name');

      const plain = purchase.toObject();
      plain.items = details;
      plain.purchase_details = details;
      return plain;
    } catch (error) {
      logger.error('Error in getById Purchase:', error);
      throw error;
    }
  },

  /**
   * Sync changes from a Purchase record (header + line items) back to its linked Purchaseorder
   * without overwriting purchase_order_no or causing validation/cast errors.
   */
  async syncPurchaseorderFromPurchase(purchaseorderId, purchaseDoc, itemsArray = null, options = {}) {
    try {
      const poId = extractRefId(purchaseorderId);
      if (!poId || !mongoose.Types.ObjectId.isValid(String(poId))) {
        return null;
      }

      const existingPo = await Purchaseorder.findById(poId);
      if (!existingPo) {
        return null;
      }

      const vendorId = extractRefId(purchaseDoc.vendor_id);
      const currencyId = extractRefId(purchaseDoc.currency_id);
      const allowedTaxTypes = ['GST', 'VAT', 'None', ''];
      const taxType = allowedTaxTypes.includes(purchaseDoc.tax_type)
        ? purchaseDoc.tax_type
        : (existingPo.tax_type || 'GST');
      const discountType = ['fixed', 'percentage'].includes(purchaseDoc.discount_type)
        ? purchaseDoc.discount_type
        : (existingPo.discount_type || 'fixed');

      const poUpdateHeader = {
        currency_id: currencyId && mongoose.Types.ObjectId.isValid(String(currencyId)) ? currencyId : null,
        due_date: purchaseDoc.due_date || null,
        invoice_no:
          purchaseDoc.invoice_no !== undefined
            ? String(purchaseDoc.invoice_no || '').trim()
            : existingPo.invoice_no,
        tax_type: taxType,
        tax_percentage: toFiniteNumber(purchaseDoc.tax_percentage, existingPo.tax_percentage || 0),
        total_amount: toFiniteNumber(purchaseDoc.total_amount, 0),
        discount_type: discountType,
        discount: toFiniteNumber(purchaseDoc.discount, 0),
        discount_amount: toFiniteNumber(purchaseDoc.discount_amount, 0),
        tax_amount: toFiniteNumber(purchaseDoc.tax_amount, 0),
        round_off: toFiniteNumber(purchaseDoc.round_off, 0),
        final_amount: toFiniteNumber(purchaseDoc.final_amount, 0),
        remarks:
          purchaseDoc.remarks !== undefined
            ? String(purchaseDoc.remarks || '').trim()
            : existingPo.remarks,
        isActive:
          purchaseDoc.isActive !== undefined
            ? Boolean(purchaseDoc.isActive)
            : existingPo.isActive,
      };

      if (vendorId && mongoose.Types.ObjectId.isValid(String(vendorId))) {
        poUpdateHeader.vendor_id = vendorId;
      }

      if (options.syncInvoiceDate && purchaseDoc.invoice_date) {
        poUpdateHeader.invoice_date = purchaseDoc.invoice_date;
        if (purchaseDoc.fin_year && String(purchaseDoc.fin_year).trim()) {
          poUpdateHeader.fin_year = String(purchaseDoc.fin_year).trim();
        }
      }

      await Purchaseorder.findByIdAndUpdate(
        poId,
        { $set: poUpdateHeader },
        { new: true, runValidators: true }
      );

      if (Array.isArray(itemsArray)) {
        const poDetailsToInsert = itemsArray
          .map((item) => {
            const serviceId = extractRefId(item.service_id);
            const unitId = extractRefId(item.unit_id);
            if (
              !serviceId ||
              !unitId ||
              !mongoose.Types.ObjectId.isValid(String(serviceId)) ||
              !mongoose.Types.ObjectId.isValid(String(unitId))
            ) {
              return null;
            }
            return {
              purchaseorder_id: poId,
              service_id: serviceId,
              quantity: Math.max(0, toFiniteNumber(item.quantity, 1)),
              unit_id: unitId,
              rate: Math.max(0, toFiniteNumber(item.rate, 0)),
              discount: Math.max(0, toFiniteNumber(item.discount, 0)),
              total: toFiniteNumber(item.total, 0),
            };
          })
          .filter(Boolean);

        await PurchaseorderDetails.deleteMany({ purchaseorder_id: poId });
        if (poDetailsToInsert.length > 0) {
          await PurchaseorderDetails.insertMany(poDetailsToInsert);
        }
      }

      return await Purchaseorder.findById(poId);
    } catch (error) {
      logger.error('Error in syncPurchaseorderFromPurchase:', error);
      throw error;
    }
  },

  async create(data) {
    try {
      const { items, purchase_details, sync_po_invoice_date, ...headerData } = data;
      const rawItems = items || purchase_details || [];

      delete headerData.id;
      delete headerData._id;

      // Normalize purchaseorder_id
      const normalizedPoId = extractRefId(headerData.purchaseorder_id);
      if (normalizedPoId) {
        if (!mongoose.Types.ObjectId.isValid(String(normalizedPoId))) {
          const err = new Error('Invalid Purchase Order ID');
          err.statusCode = 400;
          throw err;
        }
        headerData.purchaseorder_id = normalizedPoId;
      } else {
        headerData.purchaseorder_id = null;
      }

      // Normalize vendor_id
      const normalizedVendorId = extractRefId(headerData.vendor_id);
      if (normalizedVendorId) {
        headerData.vendor_id = normalizedVendorId;
      }

      // Normalize currency_id
      const normalizedCurrencyId = extractRefId(headerData.currency_id);
      headerData.currency_id =
        normalizedCurrencyId && mongoose.Types.ObjectId.isValid(String(normalizedCurrencyId))
          ? normalizedCurrencyId
          : null;

      // Automatically assign fin_year based on invoice_date or current date
      if (!headerData.fin_year || !headerData.fin_year.trim()) {
        headerData.fin_year = this.getFinancialYear(headerData.invoice_date || new Date());
      } else {
        headerData.fin_year = headerData.fin_year.trim();
      }

      // Check purchase_no or auto-generate
      if (!headerData.purchase_no || !headerData.purchase_no.trim()) {
        headerData.purchase_no = await this.getNextPurchaseNo(headerData.invoice_date || new Date());
      } else {
        headerData.purchase_no = headerData.purchase_no.trim();
        const existing = await Purchase.findOne({ purchase_no: headerData.purchase_no });
        if (existing) {
          const err = new Error(`Purchase number "${headerData.purchase_no}" is already in use`);
          err.statusCode = 400;
          throw err;
        }
      }

      // Create purchase header in Purchase table
      const purchase = await Purchase.create(headerData);

      // Save line items in separate table purchase_details
      if (Array.isArray(rawItems) && rawItems.length > 0) {
        const detailsToInsert = rawItems.map((item) => ({
          purchase_id: purchase._id,
          service_id: extractRefId(item.service_id),
          quantity: Math.max(0, toFiniteNumber(item.quantity, 1)),
          unit_id: extractRefId(item.unit_id),
          rate: Math.max(0, toFiniteNumber(item.rate, 0)),
          discount: Math.max(0, toFiniteNumber(item.discount, 0)),
          total: toFiniteNumber(item.total, 0),
        }));
        await PurchaseDetails.insertMany(detailsToInsert);
      }

      // Sync linked purchaseorder data if purchaseorder_id is set
      if (purchase.purchaseorder_id) {
        await this.syncPurchaseorderFromPurchase(
          purchase.purchaseorder_id,
          purchase.toObject(),
          rawItems,
          { syncInvoiceDate: Boolean(sync_po_invoice_date) }
        );
      }

      return await this.getById(purchase._id);
    } catch (error) {
      logger.error('Error in create Purchase:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      const existingPurchase = await Purchase.findById(id);
      if (!existingPurchase) {
        const err = new Error('Purchase not found');
        err.statusCode = 404;
        throw err;
      }

      const { items, purchase_details, sync_po_invoice_date, ...headerData } = data;
      const rawItems = items || purchase_details;

      delete headerData.id;
      delete headerData._id;

      // Normalize purchaseorder_id when provided
      if (Object.prototype.hasOwnProperty.call(headerData, 'purchaseorder_id')) {
        const normalizedPoId = extractRefId(headerData.purchaseorder_id);
        if (normalizedPoId) {
          if (!mongoose.Types.ObjectId.isValid(String(normalizedPoId))) {
            const err = new Error('Invalid Purchase Order ID');
            err.statusCode = 400;
            throw err;
          }
          headerData.purchaseorder_id = normalizedPoId;
        } else {
          headerData.purchaseorder_id = null;
        }
      }

      // Normalize vendor_id
      if (Object.prototype.hasOwnProperty.call(headerData, 'vendor_id')) {
        const normalizedVendorId = extractRefId(headerData.vendor_id);
        if (normalizedVendorId) {
          headerData.vendor_id = normalizedVendorId;
        }
      }

      // Normalize currency_id
      if (Object.prototype.hasOwnProperty.call(headerData, 'currency_id')) {
        const normalizedCurrencyId = extractRefId(headerData.currency_id);
        headerData.currency_id =
          normalizedCurrencyId && mongoose.Types.ObjectId.isValid(String(normalizedCurrencyId))
            ? normalizedCurrencyId
            : null;
      }

      // Ensure fin_year is updated if provided or if invoice_date changed
      if (headerData.fin_year && headerData.fin_year.trim()) {
        headerData.fin_year = headerData.fin_year.trim();
      } else if (headerData.invoice_date) {
        headerData.fin_year = this.getFinancialYear(headerData.invoice_date);
      }

      // Check purchase_no uniqueness excluding current
      if (headerData.purchase_no) {
        headerData.purchase_no = headerData.purchase_no.trim();
        const existing = await Purchase.findOne({
          purchase_no: headerData.purchase_no,
          _id: { $ne: id },
        });
        if (existing) {
          const err = new Error(`Purchase number "${headerData.purchase_no}" is already in use`);
          err.statusCode = 400;
          throw err;
        }
      }

      // Update purchase header in Purchase table
      const updatedPurchase = await Purchase.findByIdAndUpdate(id, headerData, {
        new: true,
        runValidators: true,
      });

      // Update line items in separate table purchase_details if provided
      if (Array.isArray(rawItems)) {
        await PurchaseDetails.deleteMany({ purchase_id: id });
        if (rawItems.length > 0) {
          const detailsToInsert = rawItems.map((item) => ({
            purchase_id: id,
            service_id: extractRefId(item.service_id),
            quantity: Math.max(0, toFiniteNumber(item.quantity, 1)),
            unit_id: extractRefId(item.unit_id),
            rate: Math.max(0, toFiniteNumber(item.rate, 0)),
            discount: Math.max(0, toFiniteNumber(item.discount, 0)),
            total: toFiniteNumber(item.total, 0),
          }));
          await PurchaseDetails.insertMany(detailsToInsert);
        }
      }

      // Sync linked purchaseorder data whenever purchaseorder_id exists
      const linkedPoId = updatedPurchase ? updatedPurchase.purchaseorder_id : null;
      if (linkedPoId) {
        const oldDate = existingPurchase.invoice_date
          ? new Date(existingPurchase.invoice_date).toISOString().slice(0, 10)
          : null;
        const newDate =
          updatedPurchase && updatedPurchase.invoice_date
            ? new Date(updatedPurchase.invoice_date).toISOString().slice(0, 10)
            : null;
        const invoiceDateChanged = Boolean(
          sync_po_invoice_date || (headerData.invoice_date && oldDate !== newDate)
        );

        await this.syncPurchaseorderFromPurchase(
          linkedPoId,
          updatedPurchase.toObject(),
          Array.isArray(rawItems) ? rawItems : null,
          { syncInvoiceDate: invoiceDateChanged }
        );
      }

      return await this.getById(id);
    } catch (error) {
      logger.error('Error in update Purchase:', error);
      throw error;
    }
  },

  async status(id, status) {
    try {
      const updatedPurchase = await Purchase.findByIdAndUpdate(
        id,
        { isActive: Boolean(status) },
        { new: true, runValidators: true }
      );
      if (updatedPurchase && updatedPurchase.purchaseorder_id) {
        const poId = extractRefId(updatedPurchase.purchaseorder_id);
        if (poId && mongoose.Types.ObjectId.isValid(String(poId))) {
          await Purchaseorder.findByIdAndUpdate(poId, { isActive: Boolean(status) });
        }
      }
      return updatedPurchase;
    } catch (error) {
      logger.error('Error in status Purchase:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      await PurchaseDetails.deleteMany({ purchase_id: id });
      return await Purchase.findByIdAndDelete(id);
    } catch (error) {
      logger.error('Error in delete Purchase:', error);
      throw error;
    }
  },
};
