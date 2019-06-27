'use strict';

const helper = {
  get: (...keys) => {
    const options = keys.pop();

    let data = options.data.root;

    keys.map(key => {
      data = data[key];
    });

    return data;
  }
}

module.exports = helper;