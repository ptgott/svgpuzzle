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
    
  function defineNextPoint(point1){
    // This is a simplistic way of choosing the next possible point.
    // What's IMPORTANT is that it won't account for a SliceAgent crossing the lines
    // of another so that an 'X' forms in the middle of a grid box. I'll need some
    // code to guage the permissibility of each possibleDirection.
    
    // Note that it's possible to have two Edges share the same coordinates on the Grid
    // (as well as, but not necessarily, the same Point objects). 
    // I'll need to determine how to remove redundant Edges before I start turning them
    // into Polygons.
    
    // I could add a 'detect conflict' feature in GridSliceAgent that resolves both issues
    // above, seeing if any direction in possibleDirections leads to one of the two above conflicts.
    
    // Alternative progression for the below code: determine three possible next points (rather than
    // directions), eliminate any that cause conflicts and choose from those that remain.
    
    var possibleDirections = [-1, 1, 0];
    var possibleNextPoints = possibleDirections.map(function(element){
    // Go one step further and have the randomiser choose between edges. This way I can apply tests
    // for permissibility to the candidate edges.
      return new Point (
        axis == 'x' ? point1.x + 1 : Math.min(point1.x + element, window.puzzleGrid.squaresCount['y']),
        axis == 'y' ? point1.y + 1 : Math.min(point1.y + element, window.puzzleGrid.squaresCount['x'])
      );
    });
    var indx = Math.round(Math.random() * 2);
    var point2 = possibleNextPoints[indx];
    
    return point2;
  }
  
  function placeNewEdge(point1){
  // I might not need this function. I could add the below code to moveMoveMove.
    var point2 = defineNextPoint(point1);    
    return new Edge(point1, point2);
  };
  
  (function moveMoveMove(refPoint){
    var newEdge = placeNewEdge(refPoint);
    if(newEdge.point2[axis] != window.puzzleGrid.squaresCount[axis]){
      return moveMoveMove(newEdge.point2);
    }
    else{
      return;
    }
  })(firstPoint);
  
  function testForConflicts(point1, point2){
  // I need a good, solid place to call this function before I write it.
  }
   
}

function Point(x,y){
  this.x = x;
  this.y = y;
}

function Polygon(){
  this.edges = [];
}


window.onload = function(){
  window.puzzleGrid = new Grid(50, 50, 7);  
  window.puzzleSpace = SVG('puzzleSpace').size('100%', '100%');
  window.puzzleGrid.render();
  createEdgesFromGridPerimeter();
  createEdgesFromGridSlices(3, 3);

  for(var e = 0; e < allEdges.length; e++){
    allEdges[e].render();
  }
  
}