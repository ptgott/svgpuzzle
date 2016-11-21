var allEdges = [];

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

function Edge(point1, point2){
  var _this = this;
  this.point1 = point1;
  this.point2 = point2;
  
  this.add = function(){
    allEdges.push(this);
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
  
  this.render = function(){
    var line = window.puzzleSpace.line(
      this.point1.x * window.puzzleGrid.squareSize, 
      this.point1.y * window.puzzleGrid.squareSize, 
      this.point2.x * window.puzzleGrid.squareSize, 
      this.point2.y * window.puzzleGrid.squareSize
    );
    line.stroke({ width: '1px', color: 'black' });
    line.node.addEventListener('click', function(){
      console.log("does this line intersect within a square?", _this.doesItIntersectWithinSquare());
      console.log(_this.point1.x, _this.point2.x);
      console.log(_this.point1.y, _this.point2.y);
      console.log("---------------------");
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
    
  function defineNextEdge(point1){

    
    // WHAT TO DO NOW: currently this function accurately tests for cases where two Edges
    // share both X and Y values (i.e. crossing within a square or being identical).
    // I need something to do for cases in which a line has nowhere to go!
        
    
    var possibleDirections = [-1, 1, 0];
           
    var possibleNextEdges = possibleDirections.map(function(element){

      var point2 = new Point (
        axis == 'x' ? point1.x + 1 : Math.min(point1.x + element, window.puzzleGrid.squaresCount['y']),
        axis == 'y' ? point1.y + 1 : Math.min(point1.y + element, window.puzzleGrid.squaresCount['x'])
      );
      return new Edge(point1, point2);
    });
    
    possibleNextEdges = possibleNextEdges.filter(function(element){
      return !(element.doesItIntersectWithinSquare());
    });
        
    var indx = Math.round(Math.random() * (possibleNextEdges.length - 1));
    
    console.log(possibleNextEdges);
    var newEdge = possibleNextEdges[indx];
    
    newEdge.add();
    return newEdge;
  }
  
  
  (function moveMoveMove(refPoint){
    var newEdge = defineNextEdge(refPoint);
    if(newEdge.point2[axis] != window.puzzleGrid.squaresCount[axis]){
      return moveMoveMove(newEdge.point2);
    }
    else{
      return;
    }
  })(firstPoint);
   
}

function Point(x,y){
  this.x = x;
  this.y = y;
}

function Polygon(){
  this.edges = [];
}


window.onload = function(){
  window.puzzleGrid = new Grid(50, 50, 15);  
  window.puzzleSpace = SVG('puzzleSpace').size('100%', '100%');
  window.puzzleGrid.render();
  createEdgesFromGridPerimeter();
  createEdgesFromGridSlices(3, 3);

  for(var e = 0; e < allEdges.length; e++){
    allEdges[e].render();
  }
  
}