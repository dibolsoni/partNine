'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};


console.info('Instantiating and configuring the Sequelize object instance...');
  
const options = {
  dialect: 'sqlite',
  storage: 'fsjstd-restapi.db',
  // This disables the use of string based operators
  // in order to improve the security of our code.
  // This option configures Sequelize to always force the synchronization
  // of our models by dropping any existing tables.
  sync: { force: true },
  define: {
    // This option removes the `createdAt` and `updatedAt` columns from the tables
    // that Sequelize generates from our models. These columns are often useful
    // with production apps, so we'd typically leave them enabled, but for our
    // purposes let's keep things as simple as possible.
    timestamps: false,
  },
};

const sequelize = new Sequelize(options);
fs
.readdirSync(__dirname)
.filter(file => {
  return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
})
.forEach(file => {
  console.info(`Importing database model from file: ${file}`);
  const model = sequelize['import'](path.join(__dirname, file));
  db[model.name] = model;
})

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});



console.info('Instantiating and configuring: done!');

db.sequelize = sequelize
                .authenticate()
                .then(() => {
                  console.log('Connection has been established successfully.');
                })
                .catch(err => {
                  console.error('Unable to connect to the database:', err);
                });

db.Sequelize = Sequelize;



module.exports = db;