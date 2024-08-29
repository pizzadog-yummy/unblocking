const moment = require('moment-timezone');

// Define the start date (January 1, 2000, EST)
const startDate = moment.tz("2000-01-01", "America/New_York");

// Get the current date in EST
const currentDate = moment.tz("America/New_York");

// Calculate the difference in days
const daysSince2000 = currentDate.diff(startDate, 'days');

// Export the daysSince2000 variable
module.exports = { daysSince2000 };
