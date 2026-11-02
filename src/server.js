const app = require('./app');
const config = require('./config');
const logger = require('./services/logger');
const { connectDB } = require('./database/connection');

require('dotenv').config();

const PORT = Number(process.env.PORT || config.app.port || 3000);

// ========================================
// START SERVER FIRST
// ========================================

app.listen(PORT, '0.0.0.0', () => {
  console.log('====================================');
  console.log('DEMO SERVER STARTED');
  console.log('PORT:', PORT);
  console.log('====================================');

  // Connect MongoDB AFTER listen()
  connectDB().catch((error) => {
    logger.error('❌ Failed to establish MongoDB connection:', error.message);
  });
});

