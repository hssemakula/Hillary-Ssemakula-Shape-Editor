var shapes = [];
var canvas = document.getElementById("canvas");
var polyType = "";
var startPolyDraw = false;
var isMouseDown = false;
var canvas1 = new CanvasObject(canvas); //This is the global canvas, we'll be working with.
var selectedShape = -100; //index to note selected shape.


function getMouseCoordinates(event) {
  //get mouse position
  var rect = event.target.getBoundingClientRect();
  var x = event.clientX - rect.left; //x position within canvas
  var y = event.clientY - rect.top; //y position within canvas
  return [x, y];
}

function Shape(type, coordinates) {
  this.type = type;
  this.coordinates = coordinates
}

//Draw function for shape object.
Shape.prototype.draw = function(context) {
  this.path = new Path2D(); //path object very important to check whether point lies in path.
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
}

function CanvasObject(canvas) {
  this.canvas = canvas;
  this.context = canvas.getContext('2d');
  this.context.strokeStyle = "#1B4F72";

}



CanvasObject.prototype.draw =
  function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (var i = 0; i < shapes.length; i++) {
      this.context.strokeStyle = "#1B4F72";
      shapes[i].draw(this.context);
    }
  }

$(function() {


  attachDraggableAbility();


  //if polygon or polyline button has been clicked.
  $(".polybutton").click(function() {
    polyType = $(this).attr('id');
    startPolyDraw = true;
  });

  $("#canvas").click(function(event) {
    var coordinates = getMouseCoordinates(event);
    for (var i = 0; i < shapes.length; i++) {
      if (canvas1.context.isPointInPath(shapes[i].path, coordinates[0], coordinates[1])) {
        selectedShape = i;
        break;
      }
      else{
        selectedShape = -100
      }
    }

  });



  //--------------------BEGIN MOUSE EVENTS---------------------------------
  $("#canvas").mousedown(function(event) {
    isMouseDown = true;
    var coordinates = getMouseCoordinates(event);
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

    if (selectedShape != -100 && isMouseDown) {
      shapes[selectedShape] = makeShape(shapes[selectedShape].type, x, y);
      canvas1.draw();
    }
  });


  $("#canvas").mouseup(function() {
    isMouseDown = false;
  });

  $("#canvas").dblclick(function(event) {
    finalizePoly(getMouseCoordinates(event));
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

//changes last coordinate of poly to given coordinates
function changeLastVertex(x, y) {
  var shapeIndex = shapes.length - 1; //last shape added
  var xIndexToChange = shapes[shapeIndex].coordinates.length - 2; //last coordintes added by mouse down i.e 0,0, these are to be cahged to new x and y
  var yIndexToChange = shapes[shapeIndex].coordinates.length - 1;

  shapes[shapeIndex].coordinates[xIndexToChange] = x; //coordinates changed
  shapes[shapeIndex].coordinates[yIndexToChange] = y;
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
  //check if polygon drawn is more than 3 sides.(2 * 3 vertices)
  if (polyType == "polygon" && shapes[shapes.length - 1].coordinates.length <= 6) {
    alert("A ploygon cannot have less than 3 sides");
    return;
  }
  //check if last point dragged to, in polygon mode is close to the first point, if so join
  else if (polyType == "polygon") {
    var shapeIndex = shapes.length - 1;
    var lastXIndex = shapes[shapeIndex].coordinates.length - 2; //most recent coordinates of polygon placed.
    var lastYIndex = shapes[shapeIndex].coordinates.length - 1;

    //if last point clicked is close to starting point, join to starting point else add
    if (Math.abs(shapes[shapeIndex].coordinates[0]) - Math.abs(shapes[shapeIndex].coordinates[lastXIndex]) <= 5 ||
      Math.abs(shapes[shapeIndex].coordinates[1]) - Math.abs(shapes[shapeIndex].coordinates[lastYIndex]) <= 5) {
      shapes[shapeIndex].coordinates[lastXIndex] = shapes[shapeIndex].coordinates[0];
      shapes[shapeIndex].coordinates[lastYIndex] = shapes[shapeIndex].coordinates[1];
    } else {
      //else add another vertex and join to start point.
      shapes[shapeIndex].coordinates.push(coordinates[0]);
      shapes[shapeIndex].coordinates.push(coordinates[1]);
    }
  }

  polyType = "";
  startPolyDraw = false;
  canvas1.draw();
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
