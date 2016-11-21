var allEdges = [];

function createEdgesFromGridPerimeter(){
  for(var i = 0; i < window.puzzleGrid.squaresX; i++){
    new Edge(
      new Point(i,0),
      new Point(i+1,0)
    );
    new Edge(
      new Point(i, window.puzzleGrid.squaresY),
      new Point(i+1,window.puzzleGrid.squaresY)
    );
  }
  
  for(var j = 0; j < window.puzzleGrid.squaresY; j++){
    new Edge(
      new Point(0,j),
      new Point(0, j+1)
    );
    new Edge(
      new Point(window.puzzleGrid.squaresX, j),
      new Point(window.puzzleGrid.squaresX, j+1)
    );
  }

}

function createEdgesFromGridSlices(countX, countY){
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
  this.squaresX = squaresX;
  this.squaresY = squaresY;
  this.squareSize = squareSizePx;
  
  var gridLineQualities = {
    width: '1px',
    color: 'rgb(200,200,200)'
  }
  
  this.render = function(){
    var gridLines = window.puzzleSpace.group();
    for(var i = 0; i < this.squaresY + 1; i++){
      var line = window.puzzleSpace.line(
        0, 
        i * this.squareSize, 
        this.squaresX * this.squareSize, 
        i * this.squareSize
      );
      gridLines.add(line);
      line.stroke(gridLineQualities);
    }
    
    for(var j = 0; j < this.squaresX + 1; j++){
      var line = window.puzzleSpace.line(
        j * this.squareSize, 
        0,
        j * this.squareSize, 
        this.squaresY * this.squareSize
      );
      gridLines.add(line);
      line.stroke(gridLineQualities);
    }
  }  
}

function GridSliceAgent(axis){
  // this.startValue = where it'll start on the axis
  
  // var currentEdge = an Edge object, the one last created
  
  // This function, based on the Points within the currentEdge, randomly
  // determines whether to choose for the next currentEdge a vertical shift, a 45 degree
  // angle or a horizontal shift, and in what direction.
  // determineNextEdge = function(){
  // }
  // this.axis = ; //define this: left to right or top to bottom?
//   this.startPoint = ;//define this as a new Point
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
  createEdgesFromGridSlices(1, 0);

  for(var e = 0; e < allEdges.length; e++){
    allEdges[e].render();
  }
  
}