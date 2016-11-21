function Edge(point1, point2){
  this.point1 = point1;
  this.point2 = point2;
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

function GridSlice(){
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

}