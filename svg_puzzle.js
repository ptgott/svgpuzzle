var allEdges = [];

function createEdgesFromGridPerimeter(){
  for(var i = 0; i < window.puzzleGrid.squaresCount['x']; i++){
    new Edge(
      new Point(i,0),
      new Point(i+1,0)
    );
    new Edge(
      new Point(i, window.puzzleGrid.squaresCount['y']),
      new Point(i+1,window.puzzleGrid.squaresCount['y'])
    );
  }
  
  for(var j = 0; j < window.puzzleGrid.squaresCount['y']; j++){
    new Edge(
      new Point(0,j),
      new Point(0, j+1)
    );
    new Edge(
      new Point(window.puzzleGrid.squaresCount['x'], j),
      new Point(window.puzzleGrid.squaresCount['x'], j+1)
    );
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
  allEdges.push(this);
  this.point1 = point1;
  this.point2 = point2;
  this.render = function(){
    var line = window.puzzleSpace.line(
      this.point1.x * window.puzzleGrid.squareSize, 
      this.point1.y * window.puzzleGrid.squareSize, 
      this.point2.x * window.puzzleGrid.squareSize, 
      this.point2.y * window.puzzleGrid.squareSize
    );
    line.stroke({ width: '1px', color: 'black' });
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
    
  function getProgressDirection(){
    // This is a simplistic way of choosing the next possible point.
    // What's IMPORTANT is that it won't account for a SliceAgent crossing the lines
    // of another so that an 'X' forms in the middle of a grid box. I'll need some
    // code to guage the permissibility of each possibleDirection.
    
    // BUG TO KILL FIRST: the line will happily drift out of the grid on the inverse
    // axis of what's specified (a slice travelling across x can drift outside the y axis)
    
    var possibleDirections = [-1, 1, 0];
    var indx = Math.round(Math.random() * 2);
    return possibleDirections[indx];
  }
  
  function placeNewEdge(point1){
    var dir = getProgressDirection();
    var point2 = new Point (
      axis == 'x' ? point1.x + 1 : point1.x + dir,
      axis == 'y' ? point1.y + 1 : point1.y + dir
    );
    
    return new Edge(point1, point2);
  }
  
  (function moveMoveMove(refPoint){
    var newEdge = placeNewEdge(refPoint);
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
  console.log("the document has loaded!");
  window.puzzleGrid = new Grid(50, 50, 7);  
  window.puzzleSpace = SVG('puzzleSpace').size('100%', '100%');
  window.puzzleGrid.render();
  createEdgesFromGridPerimeter();
  createEdgesFromGridSlices(3, 3);

  for(var e = 0; e < allEdges.length; e++){
    allEdges[e].render();
  }
  
}