'use strict';

const helper = {
  set: (key, value, options) => {
    options.data.root[key] = value;
  }
}

module.exports = helper;