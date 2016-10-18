'use strict';

const util = require('../../util/util');
const StyleLayer = require('../style_layer');

function BackgroundStyleLayer() {
    StyleLayer.apply(this, arguments);
}

module.exports = BackgroundStyleLayer;

BackgroundStyleLayer.prototype = util.inherit(StyleLayer, {});
