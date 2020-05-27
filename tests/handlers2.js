'use strict';

var colors = require('colors');

module.exports = {
  get: function (req, res) {
    console.log(colors.green('\tin the handler for get'));
    res.status(200).json({ message: 'you made it' });
    // next();
  },
  post: function (req, res) {
    console.log(colors.green('\tin the post handler'));
    res.status(200).json({ name: 'you made it' });
    // next();
  },
  put: function (req, res) {
    console.log(colors.green('\tin the put handler'));
    res.status(200).json({ name: 'you made it' });
    // next();
  },
  head: function (req, res) {
    console.log(colors.green('\tin the head handler'));
    res.status(200);//.json({ name: 'you made it' });
    // next();
  },
  options: function (req, res) {
    console.log(colors.green('\tin the options handler'));
    res.status(200).json({ name: 'you made it' });
    // next();
  },
  delete: function (req, res) {
    console.log(colors.green('\tin the delete handler'));
    res.status(200).json({ name: 'you made it' });
    // next();
  }
};
