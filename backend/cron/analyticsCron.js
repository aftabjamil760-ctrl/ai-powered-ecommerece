const cron = require('node-cron');
const analyticsService = require('../utils/analyticsService');

// Run daily at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily analytics update...');
  try {
    await analyticsService.updateDailyAnalytics();
    console.log('Daily analytics update completed successfully');
  } catch (error) {
    console.error('Error in daily analytics cron job:', error);
  }
});

// Run monthly on the 1st at 1 AM
cron.schedule('0 1 1 * *', async () => {
  console.log('Running monthly analytics update...');
  try {
    await analyticsService.updateMonthlyAnalytics();
    console.log('Monthly analytics update completed successfully');
  } catch (error) {
    console.error('Error in monthly analytics cron job:', error);
  }
});

module.exports = cron;