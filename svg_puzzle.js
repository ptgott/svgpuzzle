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
  
  this.rightMostTurn = function(){
  // Let's face it: The functionality of this function comes from the fact that I gave up
  // on defining a relationship between the direction of travel on the x and y axis
  // and a sharp right turn on a web browser's upside-down coordinate system. Now that I've
  // got it laid out neatly as an object literal, I can come bakc later and
  // refactor it into a nice mathematical function.
  
  // In 'turns', a value of -1 means lowest and 1 means highest. I'll later use these
  // values to fill in a sort function for a given point's forking Edges. We want the agent
  // to make the sharpest right turn she can at any given junction.
    var turnToTest = [this.xVal, this.yVal].toString();
    var turns = {
      "1,0": {
        x: -1,
        y: 1
      },
      "-1,0": {
        x: 1,
        y: -1
      },
      "0,1": {
        x: -1,
        y: -1
      },
      "0,-1": {
        x: 1,
        y: 1
      },
      "1,1": {
        x: -1,
        y: -1
      },
      "1,-1": {
        x: -1,
        y: 1
      },
      "-1,1": {
        x: 1,
        y: -1
      },
      "-1,-1": {
        x: 1,
        y: 1
      }      
    } 
    
    return turns[turnToTest];

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
  // This should really be a method of Point, as it only refers to this Edge once.
  // Make sure I'm defining and referring to Points consistently enough that I can do this
  // reliably.
  
    var allEdgesButThisOne = allEdges.filter(function(element){
      return allEdges.indexOf(element) != allEdges.indexOf(_this);
    });
  
    return allEdgesButThisOne.filter(function(element){
      return (
        ((element.point1.x == point.x ) && (element.point1.y == point.y)) ||
        ((element.point2.x == point.x) && (element.point2.y == point.y))
      );
    });
  }
  
  this.equals = function(otherEdge){
    var thesePoints = [this.point1, this.point2];
    var otherPoints = [otherEdge.point1, otherEdge.point2];
    
    return (thesePoints.filter(function(pnt1){
      return otherPoints.some(function(pnt2){
        pnt2.x == pnt1.x && pnt2.y == pnt1.y;
      });
    })).length == 2;
    
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
  // **ISSUE**: the difference between points does not automatically set the Agent in the right direction.
  // In fact, it could easily bring about a case in which there is no clockwise turn available.
  
  // INSTRUCTIONS FOR NEXT TIME: I need a way to define forwardPoint without the use of currentDirection.
  // In the current code, I first define forwardPoints (old and new) using a forwardPoint method
  // that incorporates currentDirection. **Yet this currentDirection is always outdated**.
  // Instead, to define forwardPoint, I can use code already within nextEdge: the distalPoint
  // of the chosen Edge becomes the new forwardPoint. From there, I can calculate a new direction.
    startEdge.point2.y - startEdge.point1.y
  );
  
  
  this.forwardPoint = function(){
  // This is the point ahead of the imaginary agent, who sits on currentEdge.
  
    var points = [this.currentEdge.point1, this.currentEdge.point2];
    var cd = this.currentDirection; 
    
    return points.sort(function(a,b){
      if(((a.x * cd.xVal)  >= (b.x * cd.xVal)) && ((a.y * cd.yVal) >= (b.y * cd.yVal))){
        return -1;
      }
      else{
        return 1;
      }
    })[0];
    
  }
  

  this.trailingEdges = function(){
    var forwardPoint = this.forwardPoint();
    return this.currentEdge.edgesThatMeetAtPoint(forwardPoint);
  }
  
  this.nextEdge = function(){
  
  // ** ISSUE ** after a right turn from, say, (6,0) to (6,1), currentDirection becomes (0,0)
  // and forwardPoint becomes (6,0). It should be (6,1).
  
    var forwardPoint = this.forwardPoint();
    var trailingEdges = this.trailingEdges();
    
    console.log("forwardPoint (of currentEdge) in this.nextEdge", forwardPoint);
    console.log("trailingEdges in this.nextEdge", trailingEdges);  
    console.log("currentDirection in this.nextEdge", this.currentDirection);  
    var rightTurnDirection = this.currentDirection.rightMostTurn();
    
    console.log("rightTurnDirection in this.nextEdge", rightTurnDirection);
    
    // Map trailingEdges into an array of points other than the forwardPoint where the
    // trailingEdges meet.
    var distalPoints = trailingEdges.map(function(edg){
      var distalPointsInEdge = [edg.point1, edg.point2].filter(function(pt){
        return (pt.x != forwardPoint.x) || (pt.y != forwardPoint.y);
      });
      var distalPointInEdge = distalPointsInEdge[0];
      return distalPointInEdge;
    });
        
    // sort the distal points by how sharp of a right turn they present
    var rightMostPoint = (distalPoints.sort(function(a,b){
      if(
        ((a.x * rightTurnDirection.dirX) >= (b.x * rightTurnDirection.dirX)) &&
        ((a.y * rightTurnDirection.dirY) >= (b.y * rightTurnDirection.dirY))
      ){
        return -1;
      }
      else{
        return 1;
      }
    }))[0];
    
    console.log("rightMostPoint", rightMostPoint);
    
    // Since distalPoints loses the Edge that the points belong to, choose an Edge
    // on the basis of the rightmost distal point.
    var chosenEdge = (trailingEdges.filter(function(edge){
      return (
        ((edge.point1.x == rightMostPoint.x) && (edge.point2.y == rightMostPoint.y)) ||
        ((edge.point2.x == rightMostPoint.x) && (edge.point2.y == rightMostPoint.y))
      );
    }))[0];
    
    return chosenEdge;
  }
  
  this.activate = function(){
    var nextEdge = this.nextEdge();
    console.log("=====AND THE CALCULATED NEXT EDGE IS:========");
    console.log("allEdges.indexOf(this.nextEdge)", allEdges.indexOf(nextEdge));
    console.log(nextEdge);
    console.log("----------------------------------");
        
    if(nextEdge.equals(this.startEdge)){ 
      console.log("There should be a new Polygon now!!");
      // insert code for a new Polygon here
    }
    else{
      var oldForwardPoint = this.forwardPoint();
      nextEdge.render("red");
      this.edges.push(nextEdge);
      this.currentEdge = nextEdge;
      
      // **ISSUE** there are moments in which oldForwardPoint and newForwardPoint are equal.
      // What's concerning is that forwardPoint() depends on current direction,
      // yet calculating current direction depends on calculating the forward point.
      // Let's rethink.
      // You can't calculate a new forward point with an old direction in the case of a right turn.
      // What you can use is the newEdge itself.
      
      var newForwardPoint = this.forwardPoint();
      console.log("=====SETTING UP THE NEXT EDGE FROM THE CURRENT EDGE=====");
      console.log("oldForwardPoint at end of this.activate", oldForwardPoint);
      console.log("newForwardPoint at end of this.activate", newForwardPoint);
      this.currentDirection = new Direction(
      
        newForwardPoint.x - oldForwardPoint.x,
        newForwardPoint.y - oldForwardPoint.y
      );
      _this.activate();
    }
  }            

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
  }
  
  for(var i = 0; i < allEdges.length; i++){
    if(allEdges[i].polygons < allEdges[i].maxPolygons){
      (new PolygonAgent(allEdges[i])).activate();
    }
  }
  
}