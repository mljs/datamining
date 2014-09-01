'use strict';

var Distance = require('../math/distance');

var SOM = function () {
    this._distance = Distance.euclidean;
};

SOM.prototype = {
    setDistance: function (distance) {
        this._distance = distance;
    }
};

module.exports = SOM;