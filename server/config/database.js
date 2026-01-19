const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../genr-app.db'),
  logging: false, // Set to console.log to see SQL queries
});

const connectDB = async () => {
  try {
    if (process.env.USE_CLOUD_D1 === 'true') {
      console.log('Primary database: Cloudflare D1');
      return;
    }
    
    await sequelize.authenticate();
    console.log('SQLite database connected successfully');
    
    await sequelize.sync({ force: false });
    console.log('Database models synced');
    console.log('Primary database: SQLite');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
