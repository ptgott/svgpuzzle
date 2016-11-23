var allEdges = [];
var allPolygons = [];

function createEdgesFromGridPerimeter(){
  for(var i = 0; i < window.puzzleGrid.squaresCount['x']; i++){
    var e1 = new Edge(
      new Point(i,0),
      new Point(i+1,0)
    );
    e1.add();
    
    var e2 = new Edge(
      new Point(i, window.puzzleGrid.squaresCount['y']),
      new Point(i+1,window.puzzleGrid.squaresCount['y'])
    );
    e2.add();
  }
  
  for(var j = 0; j < window.puzzleGrid.squaresCount['y']; j++){
    var e3 = new Edge(
      new Point(0,j),
      new Point(0, j+1)
    );
    e3.add();
    var e4 = new Edge(
      new Point(window.puzzleGrid.squaresCount['x'], j),
      new Point(window.puzzleGrid.squaresCount['x'], j+1)
    );
    e4.add();
  }

}

function createEdgesFromGridSlices(countX, countY){
  for(var i = 0; i < countX; i++){
    new GridSliceAgent('x');
  }
  for(var j = 0; j < countY; j++){
    new GridSliceAgent('y');
  } 
  return;
}

function Direction(xVal, yVal){  
// The intention is for xVal and yVal to be 0, -1 or 1. Perhaps later add code here
// that throws an error if the arguments do not sit within these values.
  this.xVal = xVal;
  this.yVal = yVal;
      
  // == sorting Edges by how sharply they turn right: criteria ==
  // -- travelling on x axis only = opposite dir for same axis, same dir for other axis
  //    positive on x axis = lowest x and highest y
  //    negative on x axis = highest x and lowest y
  //
  // -- travelling on the y axis only = same dir for other axis, same dir for same axis
  //    positive on y axis = highest x and highest y
  //    negative on y axis =  lowest x and lowest y
  //
  // -- travelling on both x and y axis
  //    positive x, positive y: lowest x, lowest y
  //    positive x, negative y: lowest x, highest y
  //    negative x, positive y: highest x, lowest y
  //    negative x, negative y: highest x, highest y
  
  // == The conclusion ==
  // I'm not going to venture to define a more eloquent function than the table I've
  // laid out above. Simply implement the table to determine which xs and ys to sort to the
  // lowest index of an array of xs and ys!
  
  this.rightmostTurn(edgeArray){
  
  }

}

function Edge(point1, point2){
  var _this = this;
  this.point1 = point1;
  this.point2 = point2;
  
  this.polygons = [];
  
  this.isAtPerimeter = (function(){
    var maxY = window.puzzleGrid.squaresCount['y'];
    var maxX = window.puzzleGrid.squaresCount['x'];
  
    return(
      (_this.point1.y == 0 && _this.point2.y == 0) ||
      (_this.point1.x == 0 && _this.point2.x == 0) ||
      (_this.point1.y == maxY && _this.point2.y == maxY) ||
      (_this.point1.x == maxX && _this.point2.x == maxX)
    );
  })();    
  
  this.maxPolygons = _this.isAtPerimeter ? 1 : 2;
  
  this.add = function(){
    allEdges.push(this);
  };
    
  this.doesItIntersectWithinSquare = function(){

    var conflicts = allEdges.filter(function(element){
      var currentXs = [_this.point1.x, _this.point2.x];
      var currentYs = [_this.point1.y, _this.point2.y];
      var otherXs = [element.point1.x, element.point2.x];
      var otherYs = [element.point1.y, element.point2.y];
      
      return(
        (currentXs.toString() == otherXs.toString() ||
        currentXs.toString() == otherXs.reverse().toString()) &&
        (currentYs.toString() == otherYs.toString() ||
        currentYs.toString() == otherYs.reverse().toString())
      );
    });
    return conflicts.length > 0;
  }
  
  this.edgesThatMeetAtPoint = function(point){
    var allEdgesButThisOne = allEdges.filter(function(element){
      return allEdges.indexOf(element) != allEdges.indexOf(_this);
    });
  
    return allEdgesButThisOne.filter(function(element){
      return (
        ((element.point1.x == _this[point].x ) && (element.point1.y == _this[point].y)) ||
        ((element.point2.x == _this.[point].x) && (element.point2.y == _this.[point].y))
      );
    });
  }
  
  this.getDistanceFromTail = function(otherTrailingEdge){
    // There's a good chance I won't need this method in the new version of Polygon.
   
    var pointsArray = [this.point1, this.point2, otherTrailingEdge.point1, otherTrailingEdge.point2];
      
    // in pointsArray, there are two elements that are alike. Find which ones these are
    // and assign them to edgeJoint.
    
    for(var i = 0; i < pointsArray.length; i++){
      var matches = pointsArray.filter(function(element){
        return pointsArray[i].x == element.x && pointsArray[i].y == element.y;
      });
    
      if(matches.length == 2){
        var edgeJoint = pointsArray[i];
      }
    }
  
    var farPoint = [otherTrailingEdge.point1, otherTrailingEdge.point2].filter(function(element){
      return (element.x != edgeJoint.x || element.y != edgeJoint.y);
    })[0];
  
    return (farPoint.x - edgeJoint.x) + (farPoint.y - edgeJoint.y);
    
  }
    
  this.render = function(colour){
    var line = window.puzzleSpace.line(
      this.point1.x * window.puzzleGrid.squareSize, 
      this.point1.y * window.puzzleGrid.squareSize, 
      this.point2.x * window.puzzleGrid.squareSize, 
      this.point2.y * window.puzzleGrid.squareSize
    );
    line.stroke({ width: '1px', color: colour });
    line.node.addEventListener('click', function(){
      console.log(_this);
      console.log("index in all edges", allEdges.indexOf(_this));
    });
  }
  
  this.remove = function(){
    allEdges.splice(allEdges.indexOf(this), 1);
    return;
  }
}

function Grid(squaresX, squaresY, squareSizePx){
  this.squaresCount = {
    x: squaresX,
    y: squaresY
  }

  this.squareSize = squareSizePx;
  
  var gridLineQualities = {
    width: '1px',
    color: 'rgb(200,200,200)'
  }
  
  this.render = function(){
    var gridLines = window.puzzleSpace.group();
    for(var i = 0; i < this.squaresCount['y'] + 1; i++){
      var line = window.puzzleSpace.line(
        0, 
        i * this.squareSize, 
        this.squaresCount['x'] * this.squareSize, 
        i * this.squareSize
      );
      gridLines.add(line);
      line.stroke(gridLineQualities);
    }
    
    for(var j = 0; j < this.squaresCount['x'] + 1; j++){
      var line = window.puzzleSpace.line(
        j * this.squareSize, 
        0,
        j * this.squareSize, 
        this.squaresCount['y'] * this.squareSize
      );
      gridLines.add(line);
      line.stroke(gridLineQualities);
    }
  }  
}

function GridSliceAgent(axis){
  var axis = axis;
  var firstCoord = Math.round(Math.random() * window.puzzleGrid.squaresCount[axis]);
  var firstPoint = new Point(
    axis == 'x' ? 0 : firstCoord,
    axis == 'y' ? 0 : firstCoord
  )       
    
    
  function chooseRandomEdge(edgeArray){      
    var indx = Math.round(Math.random() * (edgeArray.length - 1));
    
    var newEdge = edgeArray[indx];
    
    newEdge.add();
    return newEdge;
  }
  
  function thereIsNoMoreRoomGivenTo(edge){
    return edge.point2[axis] == window.puzzleGrid.squaresCount[axis];
  }
  
  
  (function advanceTheAgent(refPoint){
    var possibleEdges = possibleNextEdgesFor(refPoint);
    if(possibleEdges.length > 0){
      var newEdge = chooseRandomEdge(possibleEdges);
    }
    if(newEdge && !thereIsNoMoreRoomGivenTo(newEdge)){
      return advanceTheAgent(newEdge.point2);
    }
    else{
      return;
    }
  })(firstPoint);
  
  function possibleNextEdgesFor(point1){
    var possibleDirections = [-1, 1, 0];
           
    var possibleNextEdges = possibleDirections.map(function(element){

      var point2 = new Point (
        axis == 'x' ? point1.x + 1 : Math.min(point1.x + element, window.puzzleGrid.squaresCount['y']),
        axis == 'y' ? point1.y + 1 : Math.min(point1.y + element, window.puzzleGrid.squaresCount['x'])
      );
      return new Edge(point1, point2);
    });
    
    return possibleNextEdges.filter(function(element){
      return !(element.doesItIntersectWithinSquare());
    });
  }
   
}

function Point(x,y){
  this.x = x;
  this.y = y;
}

function PolygonAgent(startEdge){
  var _this = this;
  this.edges = [startEdge];
  this.startEdge = startEdge;
  this.currentEdge = startEdge;
  
  this.currentDirection = new Direction(
    startEdge.point2.x - startEdge.point1.x,
    startEdge.point2.y - startEdge.point1.y
  );

  
  var clockWiseTurns = {
  // Add this to Direction and remove it here: an object literal of right turns from
  // any given direction (i.e. based on whether x and y are positive or negative).
  };
  
  this.getCurrentDirection = function(){
    // The agent assumes it's moving clockwise. For an arbitrary Edge, it's not clear what
    // clockwise movement means for the agent's directions. Why not pick a direction arbitrarily?
  }
  
  this.getForwardPoint = function(){

    
  }

  

  var trailingEdges = refEdge.edgesThatMeetAtPoint(forwardPoint);
     
  // Sort trailingEdges based on which one is the sharpest right turn, then add that Edge.
            
    
  // Code for selecting and adding an Edge is below. It's all wrong, so re-write.
//   _this.edges.push(preferredEdge);
//         
//   preferredEdge.polygons.push(_this);
//     
//   preferredEdge.render('red');
//     
//   if((preferredEdge.point2.x == _this.startEdge.point1.x) &&
//     (preferredEdge.point2.y == _this.startEdge.point1.y)){
//     return;
//   }
//   else{
//     addNextEdge(preferredEdge);
//   }

    // Once I add an Edge, change currentEdge and currentDirection

    // end by producing a Polygon object from this.edges.
    
    
    // later I'll want to take the points that belong to a Polygon (not Point objects,
    // as different Edges will have produced different Points for the same coordinates)
    // and add these to an SVG polygon.
    
}


window.onload = function(){
  window.puzzleGrid = new Grid(50, 50, 15);  
  window.puzzleSpace = SVG('puzzleSpace').size('100%', '100%');
  window.puzzleGrid.render();
  createEdgesFromGridPerimeter();
  createEdgesFromGridSlices(3, 3);

  for(var e = 0; e < allEdges.length; e++){
    allEdges[e].render('black');
    

//     if(allEdges[e].polygons.length < allEdges[e].maxPolygons ){
//       new PolygonAgent(allEdges[e]);
//     }
  }
  
}