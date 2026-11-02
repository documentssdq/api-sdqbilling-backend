let routes = null;
try {
  routes = require('./routes/transactionsRoutes');
} catch (err) {
  // Submodule requires admin models not yet present
}
module.exports = {
  routes
};
