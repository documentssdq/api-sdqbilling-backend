const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { BaseController } = require('../../../../core');
const SettingsService = require('../services/settingsService');

class SettingsController extends BaseController {
  async getAll(req, res) {
    try {
      const data = await SettingsService.getAll();
      this.success(res, data, 'Website settings fetched successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }

  async getById(req, res) {
    try {
      const data = await SettingsService.getByIdOrKey(req.params.id);
      if (!data) {
        return this.error(res, 'Setting item not found', 404);
      }
      this.success(res, data, 'Setting fetched successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }

  async create(req, res) {
    try {
      if (!req.body.displayName || !req.body.key) {
        return this.error(res, 'Display Name and Key are required', 400);
      }
      const data = await SettingsService.create(req.body);
      this.success(res, data, 'Setting created successfully', 201);
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }

  async update(req, res) {
    try {
      const data = await SettingsService.update(req.params.id, req.body);
      if (!data) {
        return this.error(res, 'Setting item not found to update', 404);
      }
      this.success(res, data, 'Setting updated successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }

  async delete(req, res) {
    try {
      const data = await SettingsService.delete(req.params.id);
      this.success(res, data, 'Setting deleted successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }

  async saveAll(req, res) {
    try {
      const settingsArray = req.body.settings || req.body;
      if (!Array.isArray(settingsArray)) {
        return this.error(res, 'Settings array required for bulk save', 400);
      }
      const data = await SettingsService.bulkSave(settingsArray);
      this.success(res, data, 'All settings saved successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }

  async uploadFile(req, res) {
    try {
      if (req.file) {
        const url = `/images/${req.file.filename}`;
        return res.status(200).json({
          success: true,
          data: { url },
          message: 'File uploaded successfully',
        });
      }

      if (req.body && req.body.base64) {
        const { base64, filename } = req.body;
        const commaIndex = base64.indexOf(',');
        if (commaIndex === -1) {
          return this.error(res, 'Invalid base64 image data', 400);
        }
        const base64Data = base64.substring(commaIndex + 1);
        const buffer = Buffer.from(base64Data, 'base64');
        const ext = path.extname(filename || 'image.png').toLowerCase() || '.png';
        const uniqueFilename = `${uuidv4()}${ext}`;
        const uploadDir = path.join(__dirname, '..', '..', '..', '..', 'public', 'images');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        fs.writeFileSync(path.join(uploadDir, uniqueFilename), buffer);
        const url = `/images/${uniqueFilename}`;

        return res.status(200).json({
          success: true,
          data: { url },
          message: 'File uploaded successfully',
        });
      }

      return this.error(res, 'No file or base64 data provided', 400);
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }
}

module.exports = new SettingsController();
