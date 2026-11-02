const express = require('express');
const router = express.Router();
const logger = require('../../services/logger');

const safeMount = (routePath, moduleRelativePath) => {
  try {
    const mod = require(moduleRelativePath);
    if (mod && mod.routes) {
      router.use(routePath, mod.routes);
    }
  } catch (err) {
    logger.warn(`FrontEnd module ${routePath} not mounted: ${err.message}`);
  }
};

safeMount('/register', './register');
safeMount('/login', './login');
safeMount('/events', './events');
safeMount('/checkout', './checkout');
safeMount('/bookings', './bookings');
safeMount('/transactions', './transactions');

module.exports = {
  routes: router,
};
