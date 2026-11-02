const { BaseController } = require('../../../../core');
const UsersService = require('../services/usersService');

class UsersController extends BaseController {
  /**
   * @description Fetch all users with pagination
   * @route GET /users
   * @access Private
   */
  async getAll(req, res) {
    try {
      const pageNum = parseInt(req.query.page, 10) || 1;
      const limitNum = parseInt(req.query.limit, 10) || 10;
      const data = await UsersService.getAll(pageNum, limitNum);
      this.paginated(res, data.data, data.total, pageNum, limitNum, 'Users fetched successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }

  /**
   * @description Fetch user by ID
   * @route GET /users/:id
   * @access Private
   */
  async getById(req, res) {
    try {
      const data = await UsersService.getById(req.params.id);
      if (!data) {
        return this.error(res, 'User not found', 404);
      }
      this.success(res, data, 'User fetched successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }

  /**
   * @description Create new user
   * @route POST /users
   * @access Private
   */
  async create(req, res) {
    try {
      const data = await UsersService.create(req.body);
      await this.logActivity(req, 'Users', data._id, 'CREATE', req.body);
      this.success(res, data, 'User created successfully', 201);
    } catch (error) {
      this.error(res, error.message, 400);
    }
  }

  /**
   * @description Update user
   * @route PUT /users/:id
   * @access Private
   */
  async update(req, res) {
    try {
      const data = await UsersService.update(req.params.id, req.body);
      await this.logActivity(req, 'Users', req.params.id, 'UPDATE', req.body);
      this.success(res, data, 'User updated successfully');
    } catch (error) {
      this.error(res, error.message, 400);
    }
  }

  /**
   * @description Update user status
   * @route PUT /users/:id/status
   * @access Private
   */
  async status(req, res) {
    try {
      const status = req.body.status === 1 || req.body.status === true;
      const data = await UsersService.status(req.params.id, status);
      await this.logActivity(req, 'Users', req.params.id, 'STATUS', req.body);
      this.success(res, data, 'User status updated successfully');
    } catch (error) {
      this.error(res, error.message, 400);
    }
  }

  /**
   * @description Delete user
   * @route DELETE /users/:id
   * @access Private
   */
  async delete(req, res) {
    try {
      const data = await UsersService.getById(req.params.id);
      await this.logActivity(req, 'Users', req.params.id, 'DELETE', data);
      await UsersService.delete(req.params.id);
      this.success(res, null, 'User deleted successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }
}

module.exports = new UsersController();
