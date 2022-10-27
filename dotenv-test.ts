const path = require('path');
const dotenv = require('dotenv');
const homedir = require('os').homedir();

module.exports = async () => {
  dotenv.config({
    path: path.join(homedir, 'env/respiree-backend/.env'),
  });
};
