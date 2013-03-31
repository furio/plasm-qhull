/* !
 * plasm-qhull
 * Convex Hull dimension indipendent algorithm for plasm.js
 * Copyright (c) 2013 Matteo Pellegrini and Francesco Furiani
 * MIT License
 */

/**
 * Variables.
 */

var simplexn = require('simplexn');
var pow = Math.pow;

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
 * utils.array namespace
 * @api private
 */

qhull._utils.array = {};

/**
 * contains
 * Return true if array contains element.
 * 
 * @param {Array} arr
 * @param {Object} element
 * @return {Boolean} 
 * @api private
 */

var _arrayContains =
qhull._utils.array.contains = function (arr, element) {
	return arr.some( function(item) {
		return item.toString() === element.toString();
	});
};

/**
 * isEmpty
 * Return true if array is empty.
 * 
 * @param {Array} array
 * @return {Boolean} 
 * @api private
 */

var _arrayisEmpty =
qhull._utils.array.isEmpty = function (arr) {
	return arr.length === 0;
};

/**
 * add
 * Add eleemnts id arrIn in arr if they don't exist already
 * 
 * @param {Array} arr
 * @param {Array} arrIn
 * @api private
 */

var _arrayAdd =
qhull._utils.array.add = function (arr, arrIn) {
	for(var i = 0; i < arrIn.length; i++) {
		if( ! _arrayContains(arr, arrIn[i]) ) {
			arr.push(arrIn[i]);
		}
	}
};

/**
 * hull namespace
 * @api private
 */

qhull._hull = {};

/**
 * hull.matrix namespace
 * @api private
 */

qhull._hull.matrix = {};

var _subMatrix = 
qhull._hull.matrix.subMatrix = function (matrix,row,column) {
	var subMat = [];
	for(var i = 0; i < matrix.length; i++) {
		if(i !== row) {
			subMat.push(matrix[i].filter( function(item,j) {
				return j !== column;
			}));
		}
	}
	return subMat;
};

var _determinant = 
qhull._hull.matrix.determinant = function (matrix) {
	var det = 0;
	if(matrix.length === 1) {
		det = matrix[0][0];
	} else if(matrix.length === 2) {
		det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
	} else {
		for(var i = 0; i < matrix.length; i++) {
			det += pow(-1,i) * matrix[0][i] * _determinant( _subMatrix(matrix,0,i) );
		}
	}
	return det;
};

/**
 * hull.point namespace
 * @api private
 */

qhull._hull.point = {};

var _points2HyperplaneCoefficients =
qhull._hull.point.hyperplaneCoefficients = function (pointList) {
	var coefficients = [];
	var lastCoefficient = 0;
	if(pointList !== undefined && pointList !== null && pointList.length > 0) {
		var dimension = pointList.length;
		var vectorList = [];
		for(var i = 1; i < dimension; i++) {
			var vector = [];
			for(var j = 0; j < dimension; j++) {
				vector.push(pointList[i][j] - pointList[0][j]);
			}
			vectorList.push(vector);
		}
		for(var i = 0; i < vectorList[0].length; i++) {
			var temp = pow(-1,i) * ( _determinant( _subMatrix(vectorList,-1,i) ));
			coefficients.push(temp);
			lastCoefficient += pointList[1][i] * temp;
		}
		coefficients.push(-lastCoefficient);
	}
	
	if(coefficients.every(function(item) { return item === 0; })) {
		coefficients = 0;
	}
	
	return coefficients;
};

var _point2HyperplaneDistance =
qhull._hull.point.hyperplaneDistance = function (point, coefficients) {
	var distance = 0;
	var i;
	for(i = 0; i < point.length; i++) {
		distance += point[i] * coefficients[i];
	}
	return distance + coefficients[i];
};

/**
 * hull.compute namespace
 * @api private
 */

qhull._hull.compute = {};

var _indepPts2 = 
qhull._hull.compute.indepPts2 = function (pointSet) {
	var dimension = pointSet[0].length;
	var maxInDim = [];
	for(var d = 0; d < pointSet[0].length; d++) {
		maxInDim.push(pointSet[0]);
	}

	var indepSet = [];
	var remSet = [];
	var added = false;
	for(var i = 1; i < pointSet.length; i++) {
		added = false;
		for(var d = 0; d < pointSet[0].length && !added; d++) {
			if(maxInDim[d][d] < pointSet[i][d]) {
				var temp = maxInDim[d];
				maxInDim[d] = pointSet[i];
				if(! _arrayContains(maxInDim, temp)) {
					remSet.add([temp]);
				}
				added = true;
			}
		}
		if(!added) {
			remSet.add([pointSet[i]]);
		}
	}
	var coefficients = _points2HyperplaneCoefficients(maxInDim);
	for(var i = 0; i < remSet.length && maxInDim.length !== dimension + 1; i++) {
		if( _point2HyperplaneDistance(remSet[i], coefficients) !== 0) {
			maxInDim.push(remSet.splice(i,1)[0]);
		}
	}
	for(var d = 0; d < maxInDim.length; d++) {
		indepSet.push(maxInDim[d]);
	}
	return { independentPoints: indepSet, otherPoints: remSet };
};

var _makeSimplex = 
qhull._hull.compute.makeSimplex = function (points,centroid) {
	var pointSet = points.independentPoints.concat();
	var remainingSet = points.otherPoints.concat();
	var simplex = [];
	var visited = [];
	var currentFacet;
	var elem;
	for(var i = 0; i < pointSet.length + visited.length; i++) {
		elem = pointSet.pop();
		currentFacet = new Facet();
		currentFacet.fromPoints(pointSet.concat(visited));
		currentFacet.setUpperLower(remainingSet,centroid);
		currentFacet.centroid = centroid;
		simplex.push(currentFacet);
		visited.unshift(elem);
	}
	return simplex;
};

var _centroidEvaluation = 
qhull._hull.compute.centroidEvaluation = function (convexSet) {
	var centroid = [];
	for(var i = 0; i < convexSet[0].length; i++) {
		var temp = 0;
		for(var j = 0; j < convexSet.length; j++) {
			temp += convexSet[j][i];
		}
		centroid.push(temp / convexSet.length);
	}
	return centroid;
};

var _updateFacetList = 
qhull._hull.compute.updateFacetList = function (referenceFacet,facetList,convexHullList) {
	var dividedFacetList = {
		visibleFacetList : [referenceFacet],
		hiddenFacetList : convexHullList.concat()
	}
	
	var coplanarCounter = 0;
	if( _point2HyperplaneDistance(referenceFacet.leastPoint,referenceFacet.hyperplaneCoefficients) == 0) {
		coplanarCounter++;
	}
	for(var i = 0; i < facetList.length; i++) {
		var currentFacet = facetList[i];
		var sign = _point2HyperplaneDistance(currentFacet.centroid,currentFacet.hyperplaneCoefficients) < 0 ? 1 : -1;
		var distance = _point2HyperplaneDistance(referenceFacet.leastPoint,currentFacet.hyperplaneCoefficients);
		if(distance * sign >= 0 ) {
			if(distance == 0)
				coplanarCounter++;
			dividedFacetList.visibleFacetList.push(currentFacet);
		} else {
			dividedFacetList.hiddenFacetList.push(currentFacet);
		}
	}
	var newFacetList = [];
	if(coplanarCounter === dividedFacetList.visibleFacetList.length) {
		convexHullList.push(referenceFacet);
		newFacetList = facetList;
	} else {
		
		var remainingPoints = [];
		var horizon = [];
		for(var i = 0; i < dividedFacetList.visibleFacetList.length; i++) {
			var tempRidges = dividedFacetList.visibleFacetList[i].ridges;
			remainingPoints.add(dividedFacetList.visibleFacetList[i].upperSet.filter( function (item) {
				return item !== referenceFacet.leastPoint;
			}));
			for(var j = 0; j < tempRidges.length; j++) {
				var tempRidge = tempRidges[j];
				for(var k = 0; k < dividedFacetList.hiddenFacetList.length; k++) {
					if(dividedFacetList.hiddenFacetList[k].ridges.contains(tempRidge)) {
						horizon.push(tempRidge);
					}
				}
			}
		}
		for(var i = 0; i < facetList.length; i++) {
			var contains = dividedFacetList.visibleFacetList.some( function(item) { return item === facetList[i]; });
			if(!contains) {
				newFacetList.push(facetList[i]);
			}
		}
		for(var i = 0; i < horizon.length; i++) {
			var facet = new Facet();
			horizon[i].push(referenceFacet.leastPoint)
			facet.fromPoints(horizon[i]);
			facet.setUpperLower(remainingPoints,referenceFacet.centroid);
			newFacetList.push(facet);
		}
	}
	return newFacetList;
};

/**
 * utils.Facet namespace
 * @api public
 */

var Facet =
qhull._hull.Facet = function () {
	this.vertices = [];
	this.ridges = [];
	this.centroid = [];
	this.hyperplaneCoefficients = [];
	this.leastPoint = [];
	this.upperSet = [];
	this.lowerSet = [];
};

qhull._hull.Facet.prototype.fromPoints = function (pointList) {
	this.vertices = pointList.concat();
	this.hyperplaneCoefficients = _points2HyperplaneCoefficients(pointList);
	for(var i = 0; i <this.vertices.length; i++) {
		this.ridges.push(this.vertices.filter( function(item,index,elems) {
			return index !== (elems.length - 1) - i;
		}));
	}
};

qhull._hull.Facet.prototype.setUpperLower = function(pointList,centroid) {
	this.centroid = centroid;
	if(pointList.length > 0) {
		var sign = _point2HyperplaneDistance(centroid,this.hyperplaneCoefficients) < 0 ? 1 : -1;
		var maxPoint = pointList[0];
		var maxDist = _point2HyperplaneDistance(pointList[0], this.hyperplaneCoefficients) * sign;
		var temp;
		for(var i = 0; i < pointList.length; i++) {
			var currentPoint = pointList[i];
			if(! _arrayContains(this.vertices, pointList[i]) ) {
				temp = _point2HyperplaneDistance(currentPoint, this.hyperplaneCoefficients) * sign;
				if(temp >= 0) {
					this.upperSet.push(pointList[i]);
					if(temp > maxDist) {
						maxPoint = pointList[i];
						maxDist = temp;
					}
				} else {
					this.lowerSet.push(pointList[i]);
				}
			}
		}
		if(maxDist >= 0) {
			this.leastPoint = maxPoint;
		}
	} else {
		this.upperSet = [];
		this.lowerSet = [];
	}
};

/**
 * utils.Cell namespace
 * @api public
 */

var Cell = 
qhull._hull.Cell = function () {
	this.vertices = [];
	this.ridges = [];
}

qhull._hull.Cell.prototype.fromFacets = function(facetList) {
	for(var i = 0; i < facetList.length; i++) {
		this.vertices.add(facetList[i].vertices);
	}

	var tempSingle = [];
	var tempDuplicate = [];
	for(var i = 0; i < facetList.length; i++) {
		var facet = facetList[i];
		for(var j = 0; j < facet.ridges.length; j++) {
			if (! _arrayContains( tempSingle, facet.ridges[j])) {
				tempSingle.push(facet.ridges[j]);
			} else if (! _arrayContains(tempDuplicate, facet.ridges[j])) {
				tempDuplicate.push(facet.ridges[j]);
			}
		}
	}
	for(var i = 0; i < tempSingle.length; i++) {
		if(! _arrayContains(tempDuplicate, tempSingle[i]) ) {
			this.ridges.push(tempSingle[i]);
		}
	}
};


var _createHull =
qull._hull.createHull = function(pointList) {
	var initialSet = _indepPts2(pointList);
	var centroid = _centroidEvaluation(initialSet.independentPoints);
	var facetList = _makeSimplex(initialSet,centroid);
	var convexHullList = [];
	
	while(facetList.length > 0) {
		var currentFacet = facetList.shift();
		if(currentFacet.upperSet.isEmpty()) {
			convexHullList.push(currentFacet);
		} else {
			facetList = _updateFacetList(currentFacet,facetList,convexHullList);
		}
	}
	
	return convexHullList;
};

// return a simplexn.pointset
qull.getHull = function(pointList) {
	
};

// return a simplexn.simplicialcomplex
qull.getHullSimplicial = function(pointList) {
	
};