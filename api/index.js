const app = require('../server');

module.exports = async (req, res) => {
  // Express app handles routing — forward request
  app(req, res);
};
