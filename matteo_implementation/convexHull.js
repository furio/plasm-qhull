/* JavaScript standard objects extensions */

Array.prototype.contains = function(element) {
	return this.some( function(item) {
		return item.toString() === element.toString();
	});
};

Array.prototype.isEmpty = function() {
	return this.length === 0;
};

Array.prototype.add = function(array) {
	for(var i = 0; i < array.length; i++) {
		if(!this.contains(array[i])) {
			this.push(array[i]);
		}
	}
};


/* JavaScript objects definitions */

function Facet() {
	this.vertices = [];
	this.ridges = [];
	this.centroid = [];
	this.hyperplaneCoefficients = [];
	this.leastPoint = [];
	this.upperSet = [];
	this.lowerSet = [];
}

Facet.prototype.toString = function() {
	var out = "";
	for(var i = 0; i < this.vertices.length; i++) {
		out += "(" + this.vertices[i].toString() + ")";
	}
	return out;
}

Facet.prototype.fromPoints = function(pointList) {
	this.vertices = pointList.concat();
	this.hyperplaneCoefficients = points2HyperplaneCoefficients(pointList);
	for(var i = 0; i <this.vertices.length; i++) {
		this.ridges.push(this.vertices.filter( function(item,index,elems) {
			return index !== (elems.length - 1) - i;
		}));
	}
};

Facet.prototype.setUpperLower = function(pointList,centroid) {
	this.centroid = centroid;
	if(pointList.length > 0) {
		var sign = point2HyperplaneDistance(centroid,this.hyperplaneCoefficients) < 0 ? 1 : -1;
		var maxPoint = pointList[0];
		var maxDist = point2HyperplaneDistance(pointList[0],this.hyperplaneCoefficients) * sign;
		var temp;
		for(var i = 0; i < pointList.length; i++) {
			var currentPoint = pointList[i];
			if(!this.vertices.contains(pointList[i])) {
				temp = point2HyperplaneDistance(currentPoint,this.hyperplaneCoefficients) * sign;
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


/* Auxiliary functions definitions */

function pointsNd(dim) {
	var points = [];
	var pts = [0,1];
	if(dim === 1) {
		return [[0],[1]];
	} else {
		var temp = pointsNd(dim-1);
		for(var i = 0; i < pts.length; i++) {
			for(var j = 0; j < temp.length; j++) {
				points.push(temp[j].concat(pts[i]));
			}
		}
		return points;
	}
}

function randomPointsAsString(dimension,size) {
	output = "[";
	for(var i = 0; i < size; i++) {
		output += "[";
		for(var j = 0; j < dimension; j++) {
			output += Math.random() * 100;
			
			if(j !== dimension - 1) {
				output += ",";
			}
		}
		output += "]";
		
		if(i !== size - 1) {
			output += ",";
		}
	}
	output += "]";
	return output;
}

function randomPoints(dimension,size) {
	output = [];
	for(var i = 0; i < size; i++) {
		var point = [];
		for(var j = 0; j < dimension; j++) {
			point.push(Math.random() * 100);
		}
		output.push(point);
	}
	return output;
}

function randomPointsCustom(dimension,size,min,max) {
	output = [];
	for(var i = 0; i < size; i++) {
		var point = [];
		for(var j = 0; j < dimension; j++) {
			point.push(min + (Math.random() * (max - min)));
		}
		output.push(point);
	}
	return output;
}

function randomSpherePoints(dimension,size) {
	output = [];
	for(var i = 0; i < size; i++) {
		var point = [];
		for(var j = 0; j < dimension; j++) {
			point.push(Math.random() * 360);
		}
		var mappedPoint = [];
		for(var j = 0; j < point.length; j++) {
			var temp = 1;
			for(var k = 0; k < j; k++) {
				temp *= Math.sin(point[k]);
			}
			if(j == point.length - 1) {
				temp *= Math.sin(point[j]) * 100;
			} else {
				temp *= Math.cos(point[j]) * 100;
			}
			mappedPoint.push(temp);
		}
		output.push(mappedPoint);
	}
	return output;
}

function subMatrix(matrix,row,column) {
	var subMat = [];
	for(var i = 0; i < matrix.length; i++) {
		if(i !== row) {
			subMat.push(matrix[i].filter( function(item,j) {
				return j !== column;
			}));
		}
	}
	return subMat;
}

function determinant(matrix) {
	var det = 0;
	if(matrix.length === 1) {
		det = matrix[0][0];
	} else if(matrix.length === 2) {
		det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
	} else {
		for(var i = 0; i < matrix.length; i++) {
			det += Math.pow(-1,i) * matrix[0][i] * determinant(subMatrix(matrix,0,i));
		}
	}
	return det;
}

function points2HyperplaneCoefficients(pointList) {
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
			var temp = Math.pow(-1,i) * (determinant(subMatrix(vectorList,-1,i)));
			coefficients.push(temp);
			lastCoefficient += pointList[1][i] * temp;
		}
		coefficients.push(-lastCoefficient);
	}
	
	if(coefficients.every(function(item) { return item === 0; })) {
		coefficients = 0;
	}
	return coefficients;
}

function point2HyperplaneDistance(point, coefficients) {
	var distance = 0;
	var i;
	for(i = 0; i < point.length; i++) {
		distance += point[i] * coefficients[i];
	}
	return distance + coefficients[i];
}


/* Convex hull functions definitions */

// Euler tensor for finding independent points
function indepPts(pointSet) {
	var eulerTensor = [];
	for(var i = 0; i < pointSet[0].length; i++) {
		var row = [];
		for(var j = 0; j < pointSet[0].length; j++) {
			row.push(0);
		}
		eulerTensor.push(row);
	}
	var centroid = centroidEvaluation(pointSet);
	var translatedPoints = [];
	for(var i = 0; i < pointSet.length; i++) {
		var point = pointSet[i].concat();
		for(var j = 0; j < point.length; j++) {
			point[j] -= centroid[j];
		}
		translatedPoints.push(point);
		for(var k = 0; k < point.length; k++) {
			for(var l = k; l < point.length; l++) {
				eulerTensor[k][l] += (point[k] * point[l]);
				if(k !== l) {
					eulerTensor[l][k] += (point[l] * point[k]);
				}
			}
		}
	}
	var eigenVector = numeric.transpose(numeric.eig(eulerTensor).E.x);

	var baseShiftMatrix = numeric.inv(eigenVector);
	for(var i = 0; i < translatedPoints.length; i++) {
		translatedPoints[i] = numeric.dot(baseShiftMatrix,translatedPoints[i]);
	}
	
	var maxInDim = [];
	for(var d = 0; d < centroid.length; d++) {
		maxInDim.push(centroid);
	}

	var indepSet = [];
	var remSet = [];
	var added = false;
	for(var i = 0; i < translatedPoints.length; i++) {
		for(var d = 0; d < centroid.length && !added; d++) {
			if(Math.abs(maxInDim[d][d]) < Math.abs(translatedPoints[i][d])) {
				remSet.add([numeric.dot(eigenVector,maxInDim[d])]);
				maxInDim[d] = translatedPoints[i];
				added = true;
			}
		}
		if(!added) {
			remSet.add([numeric.dot(eigenVector,translatedPoints[i])]);
		}
	}
	var coefficients = points2HyperplaneCoefficients(maxInDim);
	for(var i = 0; i < remSet.length && maxInDim.length !== dimension + 1; i++) {
		if(point2HyperplaneDistance(remSet[i], coefficients) !== 0) {
			maxInDim.push(remSet.splice(i,1)[0]);
		}
	}
	for(var d = 0; d < maxInDim.length; d++) {
		indepSet.push(maxInDim[d]);
	}
	for(var d = 0; d < maxInDim.length; d++) {
		indepSet.push(numeric.dot(eigenVector,maxInDim[d]));
	}
	return { independentPoints: indepSet, otherPoints: remSet };
}

// Naive algorithm for finding independent points
function indepPts2(pointSet) {
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
				if(!maxInDim.contains(temp)) {
					remSet.add([temp]);
				}
				added = true;
			}
		}
		if(!added) {
			remSet.add([pointSet[i]]);
		}
	}
	var coefficients = points2HyperplaneCoefficients(maxInDim);
	for(var i = 0; i < remSet.length && maxInDim.length !== dimension + 1; i++) {
		if(point2HyperplaneDistance(remSet[i], coefficients) !== 0) {
			maxInDim.push(remSet.splice(i,1)[0]);
		}
	}
	for(var d = 0; d < maxInDim.length; d++) {
		indepSet.push(maxInDim[d]);
	}
	return { independentPoints: indepSet, otherPoints: remSet };
}

// First version of independent points algorithm
function independentPoints(pointSet) {
	if(pointSet === undefined || pointSet === null || pointSet.length < 2) {
		return { independentPoints:[],otherPoints:pointSet };
	} else {
		var dimension = pointSet[0].length + 1;
		var i;
		var independentPoints = { independentPoints:[],otherPoints:[]};
		for(i = 0; i < pointSet[0].length; i++) {
			independentPoints.independentPoints.push(pointSet[i]);
		}
		
		var det = points2HyperplaneCoefficients(independentPoints.independentPoints);
		while(det === 0) {
			independentPoints.otherPoints.push(independentPoints.independentPoints.shift());
			independentPoints.independentPoints.push(pointSet[i++]);
			det = points2HyperplaneCoefficients(independentPoints.independentPoints);
		}

		for(i = pointSet[0].length; independentPoints.independentPoints.length < dimension && i < pointSet.length; i++) {
			var coefficients = points2HyperplaneCoefficients(independentPoints.independentPoints);
			if(point2HyperplaneDistance(pointSet[i], coefficients) !== 0) {
				independentPoints.independentPoints.push(pointSet[i]);
			} else {
				independentPoints.otherPoints.push(pointSet[i]);
			}
		}
		independentPoints.otherPoints = independentPoints.otherPoints.concat(pointSet.slice(i));
		if(independentPoints.independentPoints.length === dimension) {
			return independentPoints;
		} else {
			return { independentPoints:[],otherPoints:pointSet };
		}
	}
}

function makeSimplex(points,centroid) {
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
}

function centroidEvaluation(convexSet) {
	var centroid = [];
	for(var i = 0; i < convexSet[0].length; i++) {
		var temp = 0;
		for(var j = 0; j < convexSet.length; j++) {
			temp += convexSet[j][i];
		}
		centroid.push(temp / convexSet.length);
	}
	return centroid;
}

function updateFacetList(referenceFacet,facetList,convexHullList) {
	var dividedFacetList = {
		visibleFacetList : [referenceFacet],
		hiddenFacetList : convexHullList.concat()
	}
	
	var coplanarCounter = 0;
	if(point2HyperplaneDistance(referenceFacet.leastPoint,referenceFacet.hyperplaneCoefficients) == 0) {
		coplanarCounter++;
	}
	for(var i = 0; i < facetList.length; i++) {
		var currentFacet = facetList[i];
		var sign = point2HyperplaneDistance(currentFacet.centroid,currentFacet.hyperplaneCoefficients) < 0 ? 1 : -1;
		var distance = point2HyperplaneDistance(referenceFacet.leastPoint,currentFacet.hyperplaneCoefficients);
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
}

function convexHull(pointList) {
	//var initialSet = independentPoints(pointList); // Not safe
	//var initialSet = indepPts(pointList); // Waiting for a bugfix on Number.js eig() function
	var initialSet = indepPts2(pointList);
	var centroid = centroidEvaluation(initialSet.independentPoints);
	var facetList = makeSimplex(initialSet,centroid);
	var convexHullList = [];
	while(facetList.length > 0) {
		var currentFacet = facetList.shift();
		if(currentFacet.upperSet.isEmpty()) {
			convexHullList.push(currentFacet);
		} else {
			facetList = updateFacetList(currentFacet,facetList,convexHullList);
		}
	}
	return convexHullList;
}


/* Cell Complexes Prototype */

function Cell() {
	this.vertices = [];
	this.ridges = [];
}

Cell.prototype.fromFacets = function(facetList) {
	for(var i = 0; i < facetList.length; i++) {
		this.vertices.add(facetList[i].vertices);
	}

	var tempSingle = [];
	var tempDuplicate = [];
	for(var i = 0; i < facetList.length; i++) {
		var facet = facetList[i];
		for(var j = 0; j < facet.ridges.length; j++) {
			if(!tempSingle.contains(facet.ridges[j])) {
				tempSingle.push(facet.ridges[j]);
			} else if (!tempDuplicate.contains(facet.ridges[j])) {
				tempDuplicate.push(facet.ridges[j]);
			}
		}
	}
	for(var i = 0; i < tempSingle.length; i++) {
		if(!tempDuplicate.contains(tempSingle[i])) {
			this.ridges.push(tempSingle[i]);
		}
	}
};

Cell.prototype.printRidges = function() {
	var a = [];
	for(var i = 0; i < this.ridges.length; i++) {
		a.push("[" + this.ridges[i].toString() + "]");
	}
	return a;
}

function convexHull2CellComplex(convexHull) {
	var cells = [];
	var tempCells = [];
	while(convexHull.length > 0) {
		var simplex = convexHull.shift();
		var simplexCoefficient = points2HyperplaneCoefficients(simplex.vertices);
		var cell = [simplex];
		var other = [];
		while(convexHull.length > 0) {
			var temp = convexHull.shift();
			if(temp.vertices.every( function (item) {
				return point2HyperplaneDistance(item,simplexCoefficient) === 0;
			})) {
				cell.push(temp);
			} else {
				other.push(temp);
			}
		}
		tempCells.push(cell);
		convexHull = other;
	}
	while(tempCells.length > 0) {
		var currentCell = tempCells.shift();
		var newCell = new Cell();
		newCell.fromFacets(currentCell);
		cells.push(newCell);
	}
	return cells;
}
