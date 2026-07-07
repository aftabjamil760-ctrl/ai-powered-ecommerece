const cron = require('node-cron');
const analyticsService = require('../utils/analyticsService');
const logger = require('../utils/logger');

// Run daily at midnight
cron.schedule('0 0 * * *', async () => {
  logger.info('Running daily analytics update...');
  try {
    await analyticsService.updateDailyAnalytics();
    logger.success('Daily analytics update completed successfully');
  } catch (error) {
    logger.error('Error in daily analytics cron job:', error);
  }
});

// Run monthly on the 1st at 1 AM
cron.schedule('0 1 1 * *', async () => {
  logger.info('Running monthly analytics update...');
  try {
    await analyticsService.updateMonthlyAnalytics();
    logger.success('Monthly analytics update completed successfully');
  } catch (error) {
    logger.error('Error in monthly analytics cron job:', error);
  }
});

module.exports = cron;