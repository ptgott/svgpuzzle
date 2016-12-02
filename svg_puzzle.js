var allEdges = [];
var allPolygonAgents = [];
var allPolygons = [];

function getRandomColor(){
  var colours = ["red", "green", "blue", "pink", "purple", "orange", "gray"];
  var indx = Math.round(Math.random() * (colours.length -1));
  return colours[indx];
}

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
  
  this.rightSideOfLine = function(){
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
        x: undefined,
        y: 1
      },
      "-1,0": {
        x: undefined,
        y: -1
      },
      "0,1": {
        x: -1,
        y: undefined
      },
      "0,-1": {
        x: 1,
        y: undefined
      },
      "1,1": {
        x: -1,
        y: 1
      },
      "1,-1": {
        x: 1,
        y: 1
      },
      "-1,1": {
        x: -1,
        y: -1
      },
      "-1,-1": {
        x: 1,
        y: -1
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
  
  this.angleFrom = function(otherEdge){
  // There should not be an angle that >= 0. This is because every angle is taken 
  // as being from between 1 - 180 on a given side (left or right). That is, since I
  // so far only consider angles when segregating edges on the basis of being 'left' or 'right'
  // of a given edge, I'm only considering angles between 1 - 180 using the reference
  // edge as an axis. Any negative angles are taken as obtuse. 0 angles are taken as
  // 180.
  
    var convertToAngle = {
      "0": 180,
      "1": 135,
      "Infinity": 90,
      "-1": 45
    }
  

    var otherSlope = convertToAngle['' + otherEdge.slope];
    var thisSlope = convertToAngle['' + this.slope];
  
    var resultAngle = otherSlope - thisSlope;
    if(resultAngle <= 0){
      return 180 + resultAngle;
    }
    else{
      return resultAngle;
    }
        
  }
    
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
     
  this.otherPointThan = function(criterionPoint){
    return ([this.point1, this.point2].filter(function(edgePoint){
      return (edgePoint.x != criterionPoint.x) || (edgePoint.y != criterionPoint.y);
    }))[0];
  } 
    
  this.render = function(colour){
    var line = window.puzzleSpace.line(
      this.point1.x * window.puzzleGrid.squareSize, 
      this.point1.y * window.puzzleGrid.squareSize, 
      this.point2.x * window.puzzleGrid.squareSize, 
      this.point2.y * window.puzzleGrid.squareSize
    );
    line.stroke({ width: '1px', color: colour });
  }
  
  this.remove = function(){
    allEdges.splice(allEdges.indexOf(this), 1);
    return;
  }
  
  this.slope = (function(){
    return (
      (_this.point2.y - _this.point1.y)/
      (_this.point2.x - _this.point1.x)
    );
  })();
  
  this.extendedLine = new ExtendedLine(this);

  this.whichPerimeter = function(){
    var otherAxis = { x: "y", y: "x" };
    var onBottomRight = function(axis){
      var testAxis = otherAxis[axis];
      return window.puzzleGrid.squaresCount[testAxis] == _this.point1[testAxis];
    };
    var perimeterEdges = {
      "y,false":"left",
      "y,true": "right",
      "x,true": "bottom",
      "x,false": "top"
    };
    if(!this.isAtPerimeter){
      return "none";
    }
    else{
      var onWhichAxis = this.point1.x - this.point2.x == 0 ? "y" : "x";
      var results = [onWhichAxis, onBottomRight(onWhichAxis)].join(',');
      return perimeterEdges[results];
    }

  }    
  
}

function ExtendedLine(edge){
  var _this = this;
  this.visibleEdge = edge; 
  
  this.yIntercept = (
    this.visibleEdge.point1.y - (this.visibleEdge.slope * this.visibleEdge.point1.x)
  );
  
  this.getYWithX = function(x){
    var ve = this.visibleEdge;
    var yIntercept = this.yIntercept;
    return (ve.slope * x) + yIntercept;
  }
  
  this.getXWithY = function(y){
    var ve = this.visibleEdge;
    //y = mx+b
    //x = (y - b)/m
    
    return (y - this.yIntercept)/this.visibleEdge.slope;
  }
  
  this.points = (function(){
    var ve = _this.visibleEdge;
    // y = mx + b
    // b = y - mx
    
    var pnts = [];
    
    if(ve.slope == Infinity){
      for(var i = 0; i <= window.puzzleGrid.squaresCount['y']; i ++){
        pnts[i] = new Point(ve.point1.x, i);
      }
      return pnts;
    }
    

    for(var i = 0; i < window.puzzleGrid.squaresCount['x'] + 1; i ++){
      pnts[i] = new Point(i, _this.getYWithX(i));
    }
    
    var pntsOnGrid = pnts.filter(function(element){
      return (
        (element.x >=0 && element.x <= window.puzzleGrid.squaresCount['x']) &&
        (element.y >=0 && element.y <= window.puzzleGrid.squaresCount['y'])
      );
    });
    
    return pntsOnGrid;
    
  })();
  
  this.getComparisonPoints = function(otherPoint){  
    // In case you are tempted to replace this code with something that 
    // iterates through 'x' and 'y', I've tried it, and it makes things confusing without saving
    // space!
    
    var slp = Math.abs(_this.visibleEdge.slope);

    var resultForX = function(){
      if(slp > 0 && slp != Infinity){
        var resultingX = _this.getXWithY(otherPoint.y);
        return new Point(resultingX, otherPoint.y);
      }
      else{
        return (_this.getPointsByAxis('y', otherPoint.y))[0];
      }
    }
    
    var resultForY = function(){
      if(slp > 0 && slp != Infinity){
        var resultingY = _this.getYWithX(otherPoint.x);
        return new Point(otherPoint.x, resultingY);
      }
      else{
        return (_this.getPointsByAxis('x', otherPoint.x))[0];
      }
    }
    
   return {
     x: resultForX(),
     y: resultForY()
   }
  }
  
  this.getPointsByAxis = function(axis, value){
    return this.points.filter(function(pnt){
      return pnt[axis] == value;
    });
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
  
  this.renderForDebug = function(){
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
  this.renderGuide = function(){
    var sc = this.squaresCount;
    var ss = this.squareSize;
   
    var guideOffset = {
      x: document.body.clientWidth/2 - (sc.x*ss)/2,
      y: document.body.clientHeight/2 - (sc.y*ss)/2
    };

    var gridPerimeter = window.puzzleSpace.group();
    gridPerimeter.add(window.puzzleSpace.line(
      0 + guideOffset.x, 
      0 + guideOffset.y, 
      sc.x*ss + guideOffset.x, 
      0 + guideOffset.y
    ).stroke(gridLineQualities));
    gridPerimeter.add(window.puzzleSpace.line(
      0 + guideOffset.x,
      sc.y*ss + guideOffset.y,
      sc.x*ss + guideOffset.x,
      sc.y*ss + guideOffset.y
    ).stroke(gridLineQualities));
    gridPerimeter.add(window.puzzleSpace.line(
      0 + guideOffset.x,
      0 + guideOffset.y,
      0 + guideOffset.x,
      sc.y*ss + guideOffset.y
    ).stroke(gridLineQualities));
    gridPerimeter.add(window.puzzleSpace.line(
      sc.x*ss + guideOffset.x,
      0 + guideOffset.y,
      sc.x*ss + guideOffset.x,
      sc.y*ss + guideOffset.y
    ).stroke(gridLineQualities));
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
      
      var point2InGrid = new Point(
        Math.min(Math.max(point2.x, 0), window.puzzleGrid.squaresCount.x),
        Math.min(Math.max(point2.y, 0), window.puzzleGrid.squaresCount.y)
      );
      return new Edge(point1, point2InGrid);
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

function Puzzle(){
// I need to make allEdges, allPolygons and allPolygonAgents properties of Puzzle
  this.errors = 0;
  this.color = getRandomColor();
  
  this.carve = function(){   
    createEdgesFromGridPerimeter();
    // The arguments for this call to 'creatEdgesFromGridSlices' are pretty arbitrary.
    // Make them seem less so!
    createEdgesFromGridSlices(3, 3);
    for(var j = 0; j < allEdges.length; j++){
      if(allEdges[j].polygons.length < allEdges[j].maxPolygons){
        var agent = new PolygonAgent(allEdges[j]);
        agent.activate();
        !agent.giveUp || this.recarve();
      }
    }
    
  }
  
  this.finalize = function(){
    for(var i = 0; i < allPolygons.length; i++){
      allPolygons[i].render();
    }
  }
  
  this.recarve = function(){
    allEdges = [];
    allPolygonAgents = [];
    allPolygons = [];
    this.errors++;
    // The number of errors I let the system tolerate is pretty arbitrary. Make it less so!
    // For instance, the probability that a puzzle will encounter an error, and the 
    // number of errors it'll probably take before the system finds a working puzzle,
    // increases with the number of gridSlices and grid squares.
    if(this.errors < 100){
      this.carve();
    }
    else{
      throw "There've been too many attempts to set up the puzzle. I'm giving up!";
      // So far I haven't handled this exception. One way to handle it would be to
      // present the user with an option to try producing the puzzle again.
      // another would be to display an error message and be all sad and stuff.
    }
  }
}

function Polygon(edgeArray, pointsObject){
  var _this = this;
  this.edges = edgeArray;
  this.points = pointsObject;
  this.color = window.puzzle.color;
  
  allPolygons.push(this);
      
  for(var i = 0; i < this.edges.length; i++){
    this.edges[i].polygons.push(this);
  }
      
  this.render = function(){
    var pointsString = (function(){
      // I need a less 'magic' way to specify the initial offsets of each piece.
      var initialXOffset = Math.round(Math.random() * (document.body.clientWidth/2));
      var initialYOffset = Math.round(Math.random() * (document.body.clientHeight/3));

      var strng = '';
      for(var i = 0, pnts = _this.points, keys = Object.keys(_this.points); i < keys.length; i++){
        var renderedX = (pnts[keys[i]].x * window.puzzleGrid.squareSize) + initialXOffset;
        var renderedY = (pnts[keys[i]].y * window.puzzleGrid.squareSize) + initialYOffset;
        strng = strng + (renderedX + "," + renderedY + " ");
      }
      return strng;
    })();
    
    this.shape = window.puzzleSpace.polygon(pointsString).fill(this.color).stroke(
      { width: 1, color: "black" }
    );  
    this.shape.node.addEventListener('mousedown', startDrag);
  }
    
  
  function startDrag(mousedownEvent){
    mousedownEvent.preventDefault();
    // I'm calling 'preventDefault' to avert the browser's own drag event.
    window.puzzleSpace.node.addEventListener('mousemove', dragGo);
    
    window.puzzleSpace.node.addEventListener('mouseup', dragStop);
    
    
    function dragStop(){
      window.puzzleSpace.node.removeEventListener('mousemove', dragGo);
    }
    
    var mouseInShape = {
      x: mousedownEvent.clientX - _this.shape.bbox().x,
      y: mousedownEvent.clientY - _this.shape.bbox().y
    }
    
    
    function dragGo(mouseMoveEvent){
              
      var moveTo = {
        x: mouseMoveEvent.clientX - mouseInShape.x,
        y: mouseMoveEvent.clientY - mouseInShape.y
      }
      
      _this.shape.move(moveTo.x, moveTo.y);
      
    }

  }
  
}

function PolygonAgent(startEdge){
  var _this = this;
  this.edges = [startEdge];
  this.startEdge = startEdge;
  this.currentEdge = startEdge;
  this.points = {};
  
  this.giveUp = false;
  
  allPolygonAgents.push(this);
      
  this.currentDirection = (function getFirstDirection(){
    var perimeterEdge = _this.startEdge.whichPerimeter();
    var startDirs = {
      top: { x: 1, y: 0 },
      bottom: { x: -1, y:0 },
      left: { x: 0, y: -1 },
      right: { x: 0, y: 1 },
      none: { 
        x: _this.startEdge.point2.x - _this.startEdge.point1.x,
        y: startEdge.point2.y - startEdge.point1.y
      }
    }
    
    return new Direction(startDirs[perimeterEdge]['x'], startDirs[perimeterEdge]['y']);
    
  })();
  
  
  this.forwardPoint = (function(){
  // This is the point ahead of the imaginary agent, who sits on currentEdge.
  
    var points = [_this.currentEdge.point1, _this.currentEdge.point2];
    var cd = _this.currentDirection; 
    
    return points.sort(function(a,b){
      if(((a.x * cd.xVal)  >= (b.x * cd.xVal)) && ((a.y * cd.yVal) >= (b.y * cd.yVal))){
        return -1;
      }
      else{
        return 1;
      }
    })[0];
    
  })();
  
  this.startPoint = this.startEdge.otherPointThan(_this.forwardPoint); 
  
  this.points[0] = this.startPoint;
  this.points[1] = this.forwardPoint;

  this.trailingEdges = function(){
    var allTrailingEdges = this.currentEdge.edgesThatMeetAtPoint(this.forwardPoint);
    var trailingEdgesMissingPolygons = allTrailingEdges.filter(function(edg){
      return edg.polygons.length < edg.maxPolygons;
    });
    return trailingEdgesMissingPolygons;
  }
    
  this.nextEdge = function(){ 
      
    var trailingEdges = this.trailingEdges();
        
    var rightTurnDirection = this.currentDirection.rightSideOfLine();
            
    // Map trailingEdges into an array of points other than the forwardPoint where the
    // trailingEdges meet.
    
        
    var edgesOnTheRight = trailingEdges.filter(function(edg){
  
    // First, choose two points from the line that extends through currentEdge.
    // One point corresponds with distalPoint's x value, one with distalPoint's y value.
      var distalPoint = edg.otherPointThan(_this.forwardPoint);
    
      var comparisonPointsFor = _this.currentEdge.extendedLine.getComparisonPoints(distalPoint);
                  
    // Second, see which axes we're comparing to distalPoint. Horizontal or vertical lines
    // only require comparison along one axis. I.e. only one axis might have a rightTurn.
      var criteriaAxes = ['x','y'].filter(function(axis){
        return rightTurnDirection[axis];
      });
  
    // Third, see if distalPoint lies above/below the testLine at its x and y values,
    // depending on which axes are available to test. Sort the points that sit on the 'right'
    // side of the testLine into one array (this includes points on the testLine).
      var testAxes = criteriaAxes.filter(function(axis){
        var criterionValue = comparisonPointsFor[axis][axis];
        return (
          (distalPoint[axis] * rightTurnDirection[axis]) >=
          (criterionValue * rightTurnDirection[axis])
        );

      });
      return testAxes.length == criteriaAxes.length;
    });
        
    // Fourth, sort the points on the 'left' of the line into another array.
    
    var edgesOnTheLeft = trailingEdges.filter(function(edg){
      return edgesOnTheRight.indexOf(edg) == -1;
    });
           
    var rightEdgesByAcuteAngle = edgesOnTheRight.sort(function(a,b){
      return _this.currentEdge.angleFrom(a) - _this.currentEdge.angleFrom(b);
    });
        
    
    var leftEdgesByObtuseAngle = edgesOnTheLeft.sort(function(a,b){
      return _this.currentEdge.angleFrom(b) - _this.currentEdge.angleFrom(a);
    });
    
    
    var chosenEdge = (
      rightEdgesByAcuteAngle.length > 0 ? rightEdgesByAcuteAngle[0] : leftEdgesByObtuseAngle[0]
    );
            
    
    return chosenEdge;
    
  }
  
  this.activate = function(){
    var nextEdge = this.nextEdge();
    
    // I'm including the below 'if' block, as well as the whole 'Puzzle' object and its
    // associated 'carve', 'finalize', and 'recarve' methods, because every now and then,
    // 'nextEdge' comes up as undefined or the PolygonAgent goes astray. I'm not sure why
    // this happens. For some reason, there are times when the initial Edge within a 
    // PolygonAgent has fewer than its maxPolygons, but some of the following Edges
    // have reached their polygon limit. In these moments, if I filter out
    // Edges that have reached .maxPolygons in 'this.trailingEdges', the PolygonAgent
    // will see the rightmost Edge as one that's patently not to the 'right' at all. In these
    // moments, there's a recursion issue and the whole enterprise has to be abandoned.
    if(nextEdge == undefined || this.edges.length > 25){  
      this.giveUp = true; 
      return; 
    }
             
    if(_this.forwardPoint.x == _this.startPoint.x &&
      _this.forwardPoint.y == _this.startPoint.y){
            
      var newPolygon = new Polygon(this.edges, this.points);
    }
    else{
      var oldForwardPoint = this.forwardPoint;
      this.edges.push(nextEdge);
      this.currentEdge = nextEdge;
            
      this.forwardPoint = nextEdge.otherPointThan(oldForwardPoint);
      _this.points[Object.keys(_this.points).length] = _this.forwardPoint;
      this.currentDirection = new Direction(
        this.forwardPoint.x - oldForwardPoint.x,
        this.forwardPoint.y - oldForwardPoint.y
      );
      _this.activate();
    }
  }            
    
}


window.onload = function(){

  window.puzzleGrid = new Grid(10, 10, 20);
  window.puzzleSpace = SVG('puzzleSpace').size('100%', '100%');
  window.puzzleGrid.renderGuide();
  
  window.puzzle = new Puzzle();
  window.puzzle.carve();
  window.puzzle.finalize();
   
}