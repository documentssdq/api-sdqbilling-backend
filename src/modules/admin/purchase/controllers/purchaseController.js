const { BaseController } = require('../../../../core');
  const PurchaseService = require('../services/purchaseService');

class PurchaseController extends BaseController {
  async getAll(req, res) {
    try {
      const pageNum = parseInt(req.query.page, 10) || 1;
      const limitNum = parseInt(req.query.limit, 10) || 1000;
      const search = req.query.search || '';
      const finYear = req.query.fin_year || '';
      const data = await PurchaseService.getAll(pageNum, limitNum, search, finYear);
      this.paginated(res, data.data, data.total, pageNum, limitNum, 'Purchase fetched successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }

  async getFinancialYears(req, res) {
    try {
      const years = await PurchaseService.getFinancialYears();
      this.success(res, years, 'Financial years fetched successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }

  async getNextNumber(req, res) {
    try {
      const targetDate = req.query.invoice_date || req.query.date || new Date();
      const finYear = req.query.fin_year;
      const prefix = req.query.prefix;
      const purchaseNo = await PurchaseService.getNextPurchaseNo(targetDate, finYear, prefix);
      this.success(res, { purchase_no: purchaseNo }, 'Next purchase number generated successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }

  async getById(req, res) {
    try {
      const data = await PurchaseService.getById(req.params.id);
      if (!data) return this.error(res, 'Purchase not found', 404);
      this.success(res, data, 'Purchase fetched successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }

  async create(req, res) {
    try {
      const data = await PurchaseService.create(req.body);
      // Log Activities //
      await this.logActivity(req, 'Purchase', data._id, 'CREATE', req.body);
      this.success(res, data, 'Purchase created successfully', 201);
    } catch (error) {
      this.error(res, error.message, 400);
    }
  }

  async update(req, res) {
    try {
      const data = await PurchaseService.update(req.params.id, req.body);
      // Log Activities //
      await this.logActivity(req, 'Purchase', req.params.id, 'UPDATE', req.body);
      this.success(res, data, 'Purchase updated successfully');
    } catch (error) {
      this.error(res, error.message, 400);
    }
  }

  async status(req, res) {
    try {
      const status = req.body.status === 1 || req.body.status === true;
      const data = await PurchaseService.status(req.params.id, status);
      //  Log Activities //
      await this.logActivity(req, 'Purchase', req.params.id, 'STATUS', req.body);
      this.success(res, data, 'Purchase status updated successfully');
    } catch (error) {
      this.error(res, error.message, 400);
    }
  }

  async delete(req, res) {
    try {
      const data = await PurchaseService.getById(req.params.id);
      // Log Activities //
      await this.logActivity(req, 'Purchase', req.params.id, 'DELETE', data);
      await PurchaseService.delete(req.params.id);
      this.success(res, null, 'Purchase deleted successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }
}

module.exports = new PurchaseController();
