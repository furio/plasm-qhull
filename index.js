/* !
 * plasm-qhull
 * Convex Hull dimension indipendent algorithm for plasm.js
 * Copyright (c) 2013 Matteo Pellegrini and Francesco Furiani
 * MIT License
 */

/**
 * Variables.
 */

var cos = Math.cos;
var sin = Math.sin;
var round = Math.round;
var min = Math.min;
var abs = Math.abs;
var pi = Math.PI;
var random = Math.random;
var floor = Math.floor;

/**
 * Library namespace.
 */

var qhull = exports;

/**
 * Library version.
 */

qhull.version = '0.0.1';

/**
 * utils namespace
 * @api private
 */

qhull._utils = {};

/**
 * _arrayContains
 * Return a flat version of the given array of arrays.
 * 
 * @param {Array} arrays
 * @return {Array} array
 * @api private
 */

var _arrayContains =
qhull._utils._flat = function (array, element) {

};