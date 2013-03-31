console.log('test');

var load = function (id, n) {
  var url = "https://raw.github.com/cvdlab-cg/" + id 
    + "/master/2012-05-04/exercise" + n + ".js";

  var script = document.createElement('script');
  script.src = url;
  document.body.appendChild(script);

  return url;
};

var ch = [];

var dom1D = INTERVALS(1)(32);
var dom2D = PROD1x1([INTERVALS(1)(16),INTERVALS(1)(16)]);

function drawPoints(points) {
	DRAW(POLYPOINT(points));
}

function drawFacet2D(facet) {
	var a = [];
	for(var i = 0; i < facet.vertices.length; i++) {
		for(var j = i+1; j < facet.vertices.length; j++) {
			if(i !== j) {
				a.push(facet.vertices[i]);
				a.push(facet.vertices[j]);
				DRAW(MAP(BEZIER(S0)(a))(dom1D));
				a = [];
			}
		}
	}	
}

function drawFacet3D(facet) {
	var a1 = [facet.vertices[0],facet.vertices[1]];
	var a2 = [facet.vertices[2],facet.vertices[2]];
	var b1 = BEZIER(S0)(a1);
	var b2 = BEZIER(S0)(a2);
	var c = BEZIER(S1)([b1,b2]);
	DRAW(MAP(c)(dom2D));
}

function drawFacet3DC(facet) {
	var a1 = [facet.vertices[0],facet.vertices[1]];
	var a2 = [facet.vertices[2],facet.vertices[2]];
	var b1 = BEZIER(S0)(a1);
	var b2 = BEZIER(S0)(a2);
	var c = BEZIER(S1)([b1,b2]);
	var d = COLOR([Math.random(),Math.random(),Math.random(),1])(MAP(c)(dom2D));
	DRAW(d);
}

function drawConvexHullWireFrame(facets) {
	for(var i = 0; i < facets.length; i++) {
		drawFacet2D(facets[i]);
	}
}

function drawConvexHullBody(facets) {
	for(var i = 0; i < facets.length; i++) {
		drawFacet3D(facets[i]);
	}
}

function drawConvexHull(facets) {
	switch(facets[0].vertices[0].length) {
		case 2:
			for(var i = 0; i < facets.length; i++) {
				drawFacet2D(facets[i]);
			}
			break;
		default:
			for(var i = 0; i < facets.length; i++) {
				drawFacet2D(facets[i]);
				drawFacet3D(facets[i]);
			}
	}
}

var counter = 0;
function drawNextFacet() {
	if(counter < ch.length) {
		drawFacet3DC(ch[counter]);
		printFacetList([ch[counter]]);
		counter++;
	} else {
		console.log("Finito!");
	}
}

function timedConvexHull(pointList) {
	var begin = new Date().getTime();
	ch = convexHull(pointList);
	var end = new Date().getTime();
	console.log("Begin Time:       " + begin);
	console.log("End Time:         " + end);
	console.log("Elapsed Time:     " + (end - begin) + " ms (" + (end - begin) / 1000 + " s)");
	console.log("Point Set Size:   " + pointList.length + " points");
	console.log("Convex Hull Size: " + ch.length + " facets");
}

function printFacetList(facetList) {
	for(var i = 0; i < facetList.length; i++) {
		var string = "[" + i + "] ";
		for(var j = 0; j < facetList[i].vertices.length; j++) {
		 	string+="(" + facetList[i].vertices[j] +") ";
		}
		console.log(string);
	}
	console.log("\n");
}
