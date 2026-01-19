const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Reaction = sequelize.define('Reaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  reactionType: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['like', 'love', 'haha', 'wow', 'sad', 'angry']],
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['postId', 'userId'],
      unique: true,
      name: 'unique_post_user_reaction',
    },
  ],
});

Reaction.belongsTo(User, { foreignKey: 'userId' });

module.exports = Reaction;
