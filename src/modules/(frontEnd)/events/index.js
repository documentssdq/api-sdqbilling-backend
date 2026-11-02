let routes = null;
try {
  routes = require('./routes/eventsRoutes');
} catch (err) {
  // Submodule requires admin models not yet present
}
module.exports = {
  routes
};
