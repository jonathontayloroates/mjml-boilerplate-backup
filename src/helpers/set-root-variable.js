'use strict';

const helper = {
  var: (key, value, options) => {
    options.data.root[key] = value;
  }
}

module.exports = helper;