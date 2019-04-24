var shapes = [];
var canvas = document.getElementById("canvas");
var polyType = "";
var startPolyDraw = false;
var isMouseDown = false;
var canvas1 = new CanvasObject(canvas); //This is the global canvas, we'll be working with.
var selectedShape = -100; //index to note selected shape.
var xChangeCanvas = 0; //variables to keep track of change in mouse position within canavs: used to ploy transformations.
var yChangeCanvas = 0;


function getMouseCoordinates(event) {
  //get mouse position
  var rect = event.target.getBoundingClientRect();
  var x = event.clientX - rect.left; //x position within canvas
  var y = event.clientY - rect.top; //y position within canvas
  return [x, y];
}

function Shape(type, coordinates) {
  this.type = type;
  this.coordinates = coordinates;
  this.selected = false;
  this.thickness = 3;
  this.color = "#2E86C1";
  this.rotationIcon;
  this.scaleIcon;
}

/*

Scale ICON
var x = 100;
var y = 75;
var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
ctx.beginPath();
ctx.lineWidth = 2;
ctx.arc(x,y, 5, 0, 2 * Math.PI);
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 4;
    ctx.strokeStyle = "white";
    ctx.fillStyle = "white";
    ctx.fill();
ctx.stroke();
*/

/*
ROTATION ICON
var x = 100;
var y = 75;
var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
ctx.beginPath();
ctx.lineWidth = 2;
ctx.arc(x,y, 10, 0, 1.5 * Math.PI);
ctx.moveTo(x+1, y);
ctx.lineTo(x+2, y-5);
ctx.moveTo(x+1, y-10);
ctx.lineTo(x+15, y);
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 4;
    ctx.strokeStyle = "white";
ctx.stroke();

*/

//Draw function for shape object.
Shape.prototype.draw = function(context) {
  this.path = new Path2D(); //path object very important to check whether point lies in path.
  context.lineWidth = this.thickness;
  context.strokeStyle = this.color;
  if (this.selected) {
    context.shadowColor = 'green';
    context.shadowBlur = 7;
  } else {
    context.shadowBlur = 0;
  }
  context.beginPath(this.path);
  switch (String(this.type)) {
    case "line":
      this.path.moveTo(this.coordinates[0], this.coordinates[1]);
      this.path.lineTo(this.coordinates[2], this.coordinates[3]);
      break;
    case "triangle":
      this.path.moveTo(this.coordinates[0], this.coordinates[1]);
      this.path.lineTo(this.coordinates[2], this.coordinates[3]);
      this.path.lineTo(this.coordinates[4], this.coordinates[5]);
      this.path.lineTo(this.coordinates[0], this.coordinates[1]);
      break;
    case "square":
      this.path.rect(this.coordinates[0], this.coordinates[1], this.coordinates[2], this.coordinates[2]);
      break;
    case "rectangle":
      this.path.rect(this.coordinates[0], this.coordinates[1], this.coordinates[2], this.coordinates[3]);
      break;
    case "circle":
      this.path.arc(this.coordinates[0], this.coordinates[1], this.coordinates[2], 0, 2 * Math.PI);
      break;
    case "ellipse":
      this.path.ellipse(this.coordinates[0], this.coordinates[1], this.coordinates[2], this.coordinates[3], 0, 0, 2 * Math.PI);
      break;
    case "curve":
      this.path.moveTo(this.coordinates[0], this.coordinates[1]);
      this.path.quadraticCurveTo(this.coordinates[2], this.coordinates[3],
        this.coordinates[4], this.coordinates[5]);
      this.path.quadraticCurveTo(this.coordinates[6], this.coordinates[7],
        this.coordinates[8], this.coordinates[9]);
      break;
    case "polyline":
      this.path.moveTo(this.coordinates[0], this.coordinates[1]);
      for (var i = 2; i < this.coordinates.length; i += 2) {
        this.path.lineTo(this.coordinates[i], this.coordinates[i + 1]);
      }
      break;
    case "polygon":
      this.path.moveTo(this.coordinates[0], this.coordinates[1]);
      for (var i = 2; i < this.coordinates.length; i += 2) {
        this.path.lineTo(this.coordinates[i], this.coordinates[i + 1]);
      }
      break;
    default:
  }
  context.closePath(this.path);
  context.stroke(this.path);
  this.drawRotaionAndMoveIcons(context);
}



//Shape function to draw rotation and scale icons.
Shape.prototype.drawRotaionAndMoveIcons = function(context) {
  //if selected draw rotation icon
  if (this.selected) {
    var x;
    var y;
    var scaleIconX;
    var scaleIconY;

    switch (this.type) {
      case "line":
      case "polyline":
      case "polygon":
        //get midpoint of first line on shape.
        x = (this.coordinates[0] + this.coordinates[2]) / 2;
        y = (this.coordinates[1] + this.coordinates[3]) / 2;
        //scale icon coordinates
        scaleIconX = this.coordinates[2];
        scaleIconY = this.coordinates[3];
        break;
      case "triangle":
        //put icon at top vertex.
        y = this.coordinates[3];
        x = this.coordinates[2];
        //scale icon.
        scaleIconX = this.coordinates[1];
        scaleIconY = this.coordinates[0];
        break;
      case "circle":
      case "ellipse":
        //put icon at top of circle or ellipse
        x = this.coordinates[0];
        //if ellipse it will have a fourth coordinate(x radius), use that to place icon.
        y = String(this.coordinates[3]) == 'undefined' ? this.coordinates[1] - this.coordinates[2] : this.coordinates[1] - this.coordinates[3];
        //scale icon.
        scaleIconX = this.coordinates[0] + this.coordinates[2]; //dont need to check if ellipse because x radius has same index as regular radius
        scaleIconY = this.coordinates[1];
        break;
      case "curve":
        //place icon at midpoint of curve.
        x = this.coordinates[4];
        y = this.coordinates[5];
        //scale icon.
        scaleIconX = this.coordinates[8];
        scaleIconY = this.coordinates[9];
        break;
      case "rectangle":
      case "square":
        //place icon at half the width.
        x = this.coordinates[0] + this.coordinates[2] / 2;
        y = this.coordinates[1];
        //scale icon.
        scaleIconX = this.coordinates[0] + this.coordinates[2];
        scaleIconY = this.coordinates[1] + this.coordinates[3] / 2;
        break;
      default:

    }
    this.rotationIcon = new Path2D();
    this.scaleIcon = new Path2D();

    //draw rotation icon
    context.beginPath(this.rotationIcon);
    context.lineWidth = 2;
    context.strokeStyle = "black"
    var i = y - 10; //displace the icon alittle bit on the y axis.
    context.arc(x, i, 5, 0, 1.5 * Math.PI);
    context.moveTo(x + 7, i);
    context.lineTo(x + 2, i + 1);
    context.moveTo(x + 6, i);
    context.lineTo(x + 7, i + 4);
    context.shadowColor = 'black';
    context.shadowBlur = 4;
    context.strokeStyle = "white";
    context.closePath(this.rotationIcon);
    context.stroke();

    //-----------------draw scale icon.
    context.beginPath(this.scaleIcon);
    context.arc(scaleIconX, scaleIconY, 5, 0, 2 * Math.PI);
    context.strokeStyle = "gray";
    context.lineWidth = .7
    context.fillStyle = "white";
    context.fill();
    context.closePath(this.scaleIcon);
    context.stroke();
  }
}


function CanvasObject(canvas) {
  this.canvas = canvas;
  this.context = canvas.getContext('2d');
}



CanvasObject.prototype.draw =
  function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (var i = 0; i < shapes.length; i++) {
      shapes[i].draw(this.context);
    }
  }

/* To be used for poly translation */

canvas.addEventListener('mousemove', setCoordChanges);

function setCoordChanges(event) {
  xChangeCanvas = event.movementX;
  yChangeCanvas = event.movementY;
}
/* ---------------------------------------------------------- */


//JQUERY
$(function() {


  attachDraggableAbility();


  //if polygon or polyline button has been clicked.
  $(".polybutton").click(function() {
    polyType = $(this).attr('id');
    startPolyDraw = true;
  });

  $("#canvas").click(function(event) {
    //if this is double click, don't try to select, just return.
    if (event.originalEvent.detail > 1) {
      return;
    }
    var coordinates = getMouseCoordinates(event);
    makeSelection(coordinates);
    //this is function is also used to draw polys, so draw shouldn't be called here if we're making poly
    if (polyType == "") canvas1.draw();
  });



  //--------------------BEGIN MOUSE EVENTS---------------------------------
  $("#canvas").mousedown(function(event) {
    isMouseDown = true;
    var coordinates = getMouseCoordinates(event);
    makeSelection(coordinates); //if mouse down near another object, it can be selected.
    initPoly(coordinates); //initilize a polygon if poly button pressed
  });

  $("#canvas").mousemove(function(event) {
    var coordinates = getMouseCoordinates(event); //get current coordinates.
    var x = coordinates[0];
    var y = coordinates[1];



    //if user is dragging to define poly change last two coordintes and draw
    if (polyType != "" && isMouseDown) {
      changeLastVertex(x, y);
      canvas1.draw();
    }

    //-------------------------------TRANSLATION CODE.
    //if shape is selected,
    if (selectedShape != -100 && isMouseDown) {
      //if new point is within shape then move: prevents selected shape from jumping from one point to another.
      switch (shapes[selectedShape].type) {
        case "polygon":
        case "polyline":
          translatePoly(selectedShape, xChangeCanvas, yChangeCanvas);
          break;
        case "line":
        case "curve":
          shapes[selectedShape] = makeShape(shapes[selectedShape].type, x, y);
          break;
        default:
          if (canvas1.context.isPointInPath(shapes[selectedShape].path, x, y) || canvas1.context.isPointInStroke(shapes[selectedShape].path, x, y)) { //keep pointer within shape.
            shapes[selectedShape] = makeShape(shapes[selectedShape].type, x, y);
          }
      }
      shapes[selectedShape].selected = true;
      canvas1.draw();
    }

    //------------------------------------------------------
  });


  $("#canvas").mouseup(function() {
    isMouseDown = false;
  });

  $("#canvas").dblclick(function(event) {
    finalizePoly(getMouseCoordinates(event));
  });

  $("#canvas").mouseout(function(event) {
    //causes infine line to be drawn
    //if mouse is moved outside canvas while poly is being defined, finalize poly with last known click.
    /*  if (polyType != "" && shapes.length > 0) {
        var coordinates = shapes[shapes.length - 1].coordinates;
        finalizePoly(coordinates[coordinates.length - 2], coordinates[coordinates.length - 1]);
      } */
  });

  //--------------------- END MOUSE EVENTS ----------------------------


  $("#canvas").droppable({


    //when button hovers over canvas turn into shape.
    over: function(event, ui) {
      //get the clone of button being dragged
      clone = $(".ui-draggable-dragging");
      //get actual drawing i.e svg
      drawing = clone.children().children();
      clone.removeClass("btn-dark"); //remove button styles.
      clone.addClass("shapeHover");
      drawing.attr('fill', 'rgba(255, 255, 255, 0)'); //apply canavs styles
      drawing.attr('stroke', '#37474F');
    },
    out: function(event, ui) {
      //get the clone of button being dragged
      clone = $(".ui-draggable-dragging");
      //get actual drawing i.e svg
      drawing = clone.children().children();
      clone.removeClass("shapeHover"); //remove button styles.
      clone.addClass("btn-dark");
      drawing.attr('fill', '#37474F'); //apply canavs styles
      drawing.attr('stroke', 'white');
    },
    drop: function(event, ui) {
      var rect = event.target.getBoundingClientRect();
      var x = event.clientX - rect.left; //x position within the canvas
      var y = event.clientY - rect.top; //y position within the canvas
      shapes.push(makeShape(String(ui.draggable.attr("id")), x, y));
      canvas1.draw();
    }
  });


});

//given a string representation of a shape and x.y coordinates, this function generates a default shape.
function makeShape(shapeType, x, y) {
  switch (shapeType) {
    case "line":
      return new Shape("line", [x - 50, y, x + 50, y]);
      break;
    case "triangle":
      return new Shape("triangle", [x + 50, y + 50, x, y - 50, x - 50, y + 50]);
      break;
    case "square":
      return new Shape("square", [x - 50, y - 50, 100]);
      break;
    case "rectangle":
      return new Shape("rectangle", [x - 50, y - 25, 100, 50]);
      break;
    case "circle":
      return new Shape("circle", [x, y, 50]);
      break;
    case "ellipse":
      return new Shape("ellipse", [x, y, 100, 50]);
      break;
    case "curve":
      return new Shape("curve", [
        x - 50, y + 25, // start point on first quardratic curve.
        x - 25, y - 25, // control point on first quardratic curve
        x, y, //end point and start point: first/second curve.
        x + 25, y + 25, // control point on second quardratic curve
        x + 50, y - 25 // end point on second quardratic curve
      ]);
      break;
    default:
  }
}

//Translate poly: because polylines and polygons are constructed on the fly, they need a special translate method.
function translatePoly(shapeIndex, x, y) {
  var shape = shapes[shapeIndex];
  for (var i = 0; i < shape.coordinates.length; i += 2) {
    shape.coordinates[i] += x
    shape.coordinates[i + 1] += y;
  }
}

//changes last coordinate of poly to given coordinates
function changeLastVertex(x, y) {
  var shapeIndex = shapes.length - 1; //last shape added
  var xIndexToChange = shapes[shapeIndex].coordinates.length - 2; //last coordintes added by mouse down as place holders. i.e -1000,-1000, these are to be cahged to new x and y
  var yIndexToChange = shapes[shapeIndex].coordinates.length - 1;
  var xBefore = xIndexToChange - 2; //x,y before the last point.(before place holder values -1000)
  var yBefore = yIndexToChange - 2;

  //check if new point to be added is the same as last point added.
  if ((xBefore >= 0 && shapes[shapeIndex].coordinates[xBefore] == x) && shapes[shapeIndex].coordinates[yBefore] == y) {
    shapes[shapeIndex].coordinates.pop(); //remove place holder points -1000, -1000, also there is nothing to add, last point same as new point.
    shapes[shapeIndex].coordinates.pop();
  } else {
    shapes[shapeIndex].coordinates[xIndexToChange] = x; //coordinates changed
    shapes[shapeIndex].coordinates[yIndexToChange] = y;
  }
}


//make selection and update flag to reflect selected shape.
function makeSelection(coordinates) {
  //if there are shapes that have been drawn and we're not in poly mode.
  if (shapes.length > 0 && polyType == "") {
    //for all shape paths check if pointer lies in any path of any shape stored so far.
    for (var i = 0; i < shapes.length; i++) {
      if (canvas1.context.isPointInPath(shapes[i].path, coordinates[0], coordinates[1]) ||
        canvas1.context.isPointInStroke(shapes[i].path, coordinates[0], coordinates[1])) {

        if (selectedShape != -100) {
          shapes[selectedShape].selected = false;
        }
        selectedShape = i;
        shapes[selectedShape].selected = true;
        return;
      }
    }
    if (selectedShape != -100) {
      shapes[selectedShape].selected = false;
      selectedShape = -100
    }
  } //if polytype is being drawn no shape should be selected.
  else if (polyType != "" && selectedShape != -100) {
    shapes[selectedShape].selected = false;
    selectedShape = -100
  }
}


//passed mouse coordinates, checks if a poly button is selected and initializes a new poly shape to be drawn by moving mouse.
function initPoly(coordinates) {
  //if a plogon or polyline button has been clicked
  if (polyType != "") {
    //if first click add new polygon or polyline
    if (startPolyDraw) {
      //add 0,0 at end because mousemove changes those values for rubberbanding.
      //-1000 is a place holder for next click coordinates.
      shapes.push(new Shape(polyType, [coordinates[0], coordinates[1], -1000, -1000]));
      startPolyDraw = false; //turn poly initialization off until next time poly burron is clicked
    } else {
      //if vertices have been added to shape by mouse move, last 2 points won't be -1000
      if (shapes[shapes.length - 1].coordinates[shapes[shapes.length - 1].coordinates.length - 2] != -1000) {
        shapes[shapes.length - 1].coordinates.push(-1000);
        shapes[shapes.length - 1].coordinates.push(-1000);
      }
      changeLastVertex(coordinates[0], coordinates[1]);
      canvas1.draw();

    }
  }
}


//called by double click this method finalizes the polygon or polyline drawing.
function finalizePoly(coordinates) {
  if (polyType == "polyline" && shapes[shapes.length - 1].coordinates.length < 4) {
    alert("A ployline cannot be a dot");
    return;
  }
  //check if polygon drawn is more than 3 sides.(2 * 3 vertices)
  else if (polyType == "polygon" && shapes[shapes.length - 1].coordinates.length < 6) {
    alert("A ploygon cannot have less than 3 sides");
    return;
  }
  //check if last point dragged to, in polygon mode is close to the first point, if so join
  else if (polyType == "polygon") {
    var shapeIndex = shapes.length - 1;
    var lastXIndex = shapes[shapeIndex].coordinates.length - 2; //most recent coordinates of polygon placed.
    var lastYIndex = shapes[shapeIndex].coordinates.length - 1;

    //if last point clicked is close to starting point, join to starting point else add
    if (Math.abs(shapes[shapeIndex].coordinates[0] - shapes[shapeIndex].coordinates[lastXIndex]) <= 5 &&
      Math.abs(shapes[shapeIndex].coordinates[1] - shapes[shapeIndex].coordinates[lastYIndex]) <= 5) {
      shapes[shapeIndex].coordinates[lastXIndex] = shapes[shapeIndex].coordinates[0];
      shapes[shapeIndex].coordinates[lastYIndex] = shapes[shapeIndex].coordinates[1];
    } else {

      //else add another vertex and join to start point.
      shapes[shapeIndex].coordinates.push(shapes[shapeIndex].coordinates[0]);
      shapes[shapeIndex].coordinates.push(shapes[shapeIndex].coordinates[1]);
    }
  }
  canvas1.draw();
  startPolyDraw = false;
  polyType = "";
}

/* This function iterates through all html elements with the class shapeButton and innitializes them as draggable */
function attachDraggableAbility() {
  //make all elements with class shapeButton, draggable.(i.e. all shape buttons.)
  $(".shapeButton").draggable({

    //VERY IMPORTANT REVERT FUNCTION: enables button to stick only to canvas
    revert: function(droppableReceiver) {
      //if passed object is false then no droppable object was available to receive draggable
      if (droppableReceiver === false) {
        //revert the postion of the draggable back
        return true;
      } else {
        //else some droppable object received the draggable
        //Check if the droppable object that received draggable is a canvas
        if (droppableReceiver.attr('id') == "canvas") return false; //return false so that draggable button doesn't revert back to original position
        else return true; //else draggable was dropped at an inavlid location, revert back to original position.
      }
    },
    helper: "clone",
    cancel: false, //enable buttons draggability.
    stack: ".shapeButton", //ensures that button being dragged is always on top
    containment: "#wrapper" //keep draggable from scrolling off screen. keep it within the body div.
  }); //make all buttons with class "draggable", draggable.

}
