/* HIllary  Ssemakula
 */

var shapes = [];
var canvas = document.getElementById("canvas");
var polyType = "";
var startPolyDraw = false;
var isMouseDown = false;
var canvas1 = new CanvasObject(canvas); //This is the global canvas, we'll be working with.
var selectedShape = -100; //index to note selected shape.
var xChangeCanvas = 0; //variables to keep track of change in mouse position within canavs: used to ploy transformations.
var yChangeCanvas = 0;
var mode = ""; //tracks whether we are rotating or scaling.


function getMouseCoordinates(event) {
  //get mouse position
  var rect = event.target.getBoundingClientRect();
  var x = event.clientX - rect.left; //x position within canvas
  var y = event.clientY - rect.top; //y position within canvas
  return [x, y];
}

function Shape(type, x, y) {
  this.type = type; //string type of shape
  this.coordinates = []; //array of coordinates.
  this.selected = false;
  this.thickness = 3; //thickness of line
  this.lineColor = "#2E86C1";
  this.fillColor = "";
  this.rotationIconPath; //rotation icon
  this.scaleXIconPath; //scaleX icon paths
  this.scaleYIconPath; //scaleY icon
  this.centerX = x; //coorinates for center of shape, poly's don't use this
  this.centerY = y;
  this.angle = 0; //angle of rotation at which shape is currently rotated.
}

//build shape using given center point
Shape.prototype.build = function() {
  //using shape type define coordinates.
  switch (this.type) {
    case "line":
      this.coordinates = [this.centerX - 50, this.centerY, this.centerX + 50, this.centerY];
      break;
    case "triangle":
      this.coordinates = [this.centerX + 50, this.centerY + 50, this.centerX, this.centerY - 50,
        this.centerX - 50, this.centerY + 50
      ];
      break;
    case "square":
    case "rectangle":
      var topLeftX = this.centerX - 50;
      var topLeftY = (this.type == "square") ? this.centerY - 50 : this.centerY - 25;
      this.coordinates = [topLeftX, topLeftY, topLeftX + 100, topLeftY, topLeftX + 100,
        (this.type == "square") ? topLeftY + 100 : topLeftY + 50,
        topLeftX, (this.type == "square") ? topLeftY + 100 : topLeftY + 50, topLeftX, topLeftY
      ];
      break;
    case "ellipse":
    case "circle":
      //circle and ellipse drawn using same code.
      this.coordinates = [this.centerX, this.centerY, (this.type == "ellipse") ? 100 : 50, 50];
      break;
    case "curve":
      this.coordinates = [
        this.centerX - 50, this.centerY + 25, // start point on first quardratic curve.
        this.centerX - 25, this.centerY - 25, // control point on first quardratic curve
        this.centerX, this.centerY, //end point and start point: first/second curve.
        this.centerX + 25, this.centerY + 25, // control point on second quardratic curve
        this.centerX + 50, this.centerY - 25 // end point on second quardratic curve
      ];
      break;
    default:
  }
}

//Draw function for shape object.
Shape.prototype.draw = function(context) {
  this.path = new Path2D(); //path object very important to check whether point lies in path.
  context.lineWidth = this.thickness;
  context.strokeStyle = this.lineColor;
  if (this.selected) {
    context.shadowColor = 'green';
    context.shadowBlur = 7;
  } else {
    context.shadowBlur = 0;
  }
  context.beginPath(this.path);

  //if shape has not been built yet and is not polygon or polyline.
  if ((this.coordinates.length <= 0) && (this.type != "polygon") && (this.type != "polyline")) {

    this.build();
  }

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
    case "rectangle":
      this.path.moveTo(this.coordinates[0], this.coordinates[1]);
      for (var i = 0; i <= this.coordinates.length; i += 2) {
        this.path.lineTo(this.coordinates[i], this.coordinates[i + 1]);
      }
      break;
    case "circle":
    case "ellipse":
      this.path.ellipse(this.coordinates[0], this.coordinates[1], this.coordinates[2], this.coordinates[3], this.angle, 0, 2 * Math.PI, true);
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
    var rotateIconX;
    var rotateIconY;
    var scaleXIconX;
    var scaleXIconY;
    var scaleYIconX;
    var scaleYIconY;

    switch (this.type) {
      case "line":
      case "polyline":
      case "polygon":
        //get midpoint of first line on shape.
        rotateIconX = (this.coordinates[0] + this.coordinates[2]) / 2;
        rotateIconY = (this.coordinates[1] + this.coordinates[3]) / 2;
        this.centerX = rotateIconX; //for polys set this x and x as center because polys don't have a center
        this.centerY = rotateIconY;
        //scale x icon coordinates
        scaleXIconX = this.coordinates[2];
        scaleXIconY = this.coordinates[3];

        //scale y icon coordinates
        scaleYIconX = (this.type == "line") ? this.coordinates[0] : this.coordinates[4];
        scaleYIconY = (this.type == "line") ? this.coordinates[1] : this.coordinates[5];
        break;
      case "triangle":
        //put icon at top vertex.
        rotateIconY = this.coordinates[3];
        rotateIconX = this.coordinates[2];
        //scale x icon.
        scaleXIconX = (this.coordinates[0] + this.coordinates[2]) / 2; //on midpoint of right side
        scaleXIconY = (this.coordinates[1] + this.coordinates[3]) / 2;

        //scale y icon
        scaleYIconX = (this.coordinates[0] + this.coordinates[4]) / 2; //on midpoint of base.
        scaleYIconY = (this.coordinates[1] + this.coordinates[5]) / 2;
        break;
      case "circle":
      case "ellipse":
        //put icon at top of circle or ellipse
        rotateIconX = this.centerX + (this.coordinates[3] * Math.sin(this.angle)); //top most x of ellipse = absolute X coordinate + yRadius * sin( rotaion angle)
        rotateIconY = this.centerY - (this.coordinates[3] * Math.cos(this.angle)); //top most y of ellipse = absolute Y coordinate - yRadius * cos( rotaion angle)
        //scale icon.
        scaleXIconX = this.coordinates[2] * Math.cos(this.angle) + this.centerX; //left most x of ellipse = xRadius * Cos( rotaion angle) + absolute X coordinate.
        scaleXIconY = this.coordinates[2] * Math.sin(this.angle) + this.centerY; //left most y of ellipse = xRadius * Sin( rotaion angle) + absolute Y coordinate.
        break;
      case "curve":
        //place icon at midpoint of curve.
        rotateIconX = this.coordinates[4];
        rotateIconY = this.coordinates[5];
        //scale x icon.
        scaleXIconX = this.coordinates[8];
        scaleXIconY = this.coordinates[9];

        //scale y icon.
        scaleYIconX = this.coordinates[0];
        scaleYIconY = this.coordinates[1];
        break;
      case "rectangle":
      case "square":
        //place icon at half of the first line.
        rotateIconX = (this.coordinates[0] + this.coordinates[2]) / 2;
        rotateIconY = (this.coordinates[1] + this.coordinates[3]) / 2;
        //scale x icon.
        scaleXIconX = (this.coordinates[2] + this.coordinates[4]) / 2;
        scaleXIconY = (this.coordinates[3] + this.coordinates[5]) / 2;
        //scale y icon.
        scaleYIconX = (this.coordinates[4] + this.coordinates[6]) / 2;
        scaleYIconY = (this.coordinates[5] + this.coordinates[7]) / 2;
        break;
      default:

    }
    this.rotationIconPath = new Path2D();
    this.scaleXIconPath = new Path2D();
    this.scaleYIconPath = new Path2D();

    //draw rotation icon

    context.lineWidth = 2;
    context.strokeStyle = "black"
    context.shadowColor = 'black';
    context.shadowBlur = 4;
    context.strokeStyle = "white";
    context.beginPath(this.rotationIconPath);
    this.rotationIconPath.arc(rotateIconX, rotateIconY, 5, 0, 1.5 * Math.PI);
    this.rotationIconPath.moveTo(rotateIconX + 7, rotateIconY);
    this.rotationIconPath.lineTo(rotateIconX + 2, rotateIconY + 1);
    this.rotationIconPath.moveTo(rotateIconX + 6, rotateIconY);
    this.rotationIconPath.lineTo(rotateIconX + 7, rotateIconY + 4);
    context.closePath(this.rotationIcon);
    context.stroke(this.rotationIconPath);

    //-----------------draw scale x icon.
    context.strokeStyle = "white";
    context.lineWidth = 5; //helps icon appear on top.
    context.fillStyle = "white";
    context.beginPath(this.scaleXIconPath);
    this.scaleXIconPath.arc(scaleXIconX, scaleXIconY, 2, 0, 2 * Math.PI);
    context.closePath(this.scaleXIconPath);
    context.stroke(this.scaleXIconPath);

    //-----------------draw scale y icon.
    context.strokeStyle = "#FADBD8";
    context.lineWidth = 5; //helps icon appear on top.
    context.fillStyle = "white";
    context.beginPath(this.scaleYIconPath);
    this.scaleYIconPath.arc(scaleYIconX, scaleYIconY, 2, 0, 2 * Math.PI);
    context.closePath(this.scaleYIconPath);
    context.stroke(this.scaleYIconPath);
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
    if (mode != "") makeSelection(coordinates); //some how prevents a shape from getting deselected when you click during a rotion, I don't know how, but it works.
    //this is function is also used to draw polys, so draw shouldn't be called here if we're making poly
    if (polyType == "" && mode == "") canvas1.draw();
  });



  //--------------------BEGIN MOUSE EVENTS---------------------------------
  $("#wrapper").mouseup(function(event) { //when cursor is off canvas and mouse is up stop rotating or anything.
    isMouseDown = false;
    mode = "";
  });

  $("#canvas").mousedown(function(event) {
    isMouseDown = true;
    var coordinates = getMouseCoordinates(event);
    if (selectedShape != -100) {
      if (canvas1.context.isPointInPath(shapes[selectedShape].rotationIconPath, coordinates[0], coordinates[1]) ||
        canvas1.context.isPointInStroke(shapes[selectedShape].rotationIconPath, coordinates[0], coordinates[1])) {
        mode = "rotate";
      } else if (canvas1.context.isPointInPath(shapes[selectedShape].scaleXIconPath, coordinates[0], coordinates[1]) ||
        canvas1.context.isPointInStroke(shapes[selectedShape].scaleXIconPath, coordinates[0], coordinates[1])) {
        mode = "scaleX";
      }
    }
    makeSelection(coordinates); //if mouse down near another object, it can be selected.
    initPoly(coordinates); //initilize a polygon if poly button pressed
  });

  $("#canvas").mousemove(function(event) {
    var coordinates = getMouseCoordinates(event); //get current coordinates.
    var x = coordinates[0];
    var y = coordinates[1];

    //user is trying to rotate or scale something.
    if (polyType == "" && isMouseDown && mode != "") {

      switch (mode) {
        case "rotate":
          rotateShape(selectedShape, canvas1.context, x, y);
          break;
        case "scaleX":
        case "scaleY":
          scaleShape(selectedShape, canvas1.context);
        default:

      }
    }


    //if user is dragging to define poly change last two coordintes and draw
    else if (polyType != "" && isMouseDown) {
      changeLastVertex(x, y);
      canvas1.draw();
    }

    //-------------------------------TRANSLATION CODE.
    //if shape is selected,
    else if (selectedShape != -100 && isMouseDown) {
      var dx = x - shapes[selectedShape].centerX; //change in previous center of shape to new one.
      var dy = y - shapes[selectedShape].centerY;

      //if new point is within shape then move: prevents selected shape from jumping from one point to another.
      switch (shapes[selectedShape].type) {
        //polys use their own change in x and y values.
        case "polygon":
        case "polyline":
          translateShape(selectedShape, xChangeCanvas, yChangeCanvas);
          break;
          //for curve or line we dont try to keep pointer in path.
        case "line":
        case "curve":
          translateShape(selectedShape, x, y);
          break;
        default:
          if (canvas1.context.isPointInPath(shapes[selectedShape].path, x, y) || canvas1.context.isPointInStroke(shapes[selectedShape].path, x, y)) { //keep pointer within shape.
            translateShape(selectedShape, x, y);
          }
      }
      shapes[selectedShape].selected = true;
      canvas1.draw();
    }

    //------------------------------------------------------
  });


  $("#canvas").mouseup(function() {
    isMouseDown = false;
    mode = "";
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
      shapes.push(new Shape(String(ui.draggable.attr("id")), x, y));
      canvas1.draw();
    }
  });


});

//TranslateShape: add change in x and y to every point.
function translateShape(shapeIndex, dx, dy) {
  var x = dx; //save x and y before calculating change.
  var y = dy;
  if (shapes[selectedShape].type != "polyline" && shapes[selectedShape].type != "polygon") {
    dx -= shapes[selectedShape].centerX; //change in previous center of shape to new one.
    dy -= shapes[selectedShape].centerY;
  }

  var shape = shapes[shapeIndex];
  switch (shape.type) {
    case "circle":
    case "ellipse":
      //if circle or ellipse just translate center.
      shape.coordinates[0] += dx;
      shape.coordinates[1] += dy;
      break;
    default:
      for (var i = 0; i < shape.coordinates.length; i += 2) {
        shape.coordinates[i] += dx
        shape.coordinates[i + 1] += dy;
      }

  }
  shape.centerX = x; //update center of shape.
  shape.centerY = y;
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
  if (shapes.length > 0 && polyType == "" && mode == "") {
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
      //add -1000,-1000 at end because mousemove changes those values for rubberbanding.
      //-1000 is a place holder for next click coordinates.
      var newShape = new Shape(polyType, 0, 0); //create new shape.
      newShape.coordinates = [coordinates[0], coordinates[1], -1000, -1000]; //add clicked coordinate and shapeholder coordinates
      shapes.push(newShape); //add it to shapes.
      startPolyDraw = false; //turn poly initialization off until next time poly button is clicked
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


//rotate a shape at the center point.
function rotateShape(shapeIndex, context, x, y) {
  var shape = shapes[shapeIndex];
  var rotationPointX = shape.centerX; // make point of rotation center of shape.
  var rotationPointY = shape.centerY;
  var coordinates = shape.coordinates;
  var tempWorkArr = coordinates.slice(0); //copy coordinates into temp array, we don't want to change the original yet.   //original values saved to be used in calculations.
  var angle = 0;

  //calculate angle where mouse click is
  //make triangle between clicked point and center, find angle using cosine.
  var d2 = Math.sqrt(0 + Math.pow((y - shape.centerY), 2)); //distance of right angle line to same level as clicked point.
  var d1 = Math.sqrt(Math.pow((x - shape.centerX), 2) + Math.pow((y - shape.centerY), 2));

  angle = Math.acos(d2 / d1);

  //adjust angle calculated to place it in right quadrant. This trash is very confusing guessed on it for about 2 hours.
  if ((x - shape.centerX) < 0 && (y - shape.centerY) > 0) {
    angle = Math.PI + angle;
  } else if ((x - shape.centerX) > 0 && (y - shape.centerY) > 0) {
    angle = Math.PI - angle;
  } else if ((x - shape.centerX) < 0 && (y - shape.centerY) < 0) {
    angle = (2 * Math.PI) - angle;
  }

  context.save();
  switch (shape.type) {
    case "circle":
    case "ellipse":
      //basically for circle and ellipse rotation just change the angle at which they are drawn since we are rotating about the center, no matrix needed.
      shape.angle = angle;
      break;
    default: // Move rotation point to center of the shape.

      //if shape is polyline or polygon, we can't tell what the center is since it's user defined: we used the exact point where the rotaion icon is
      if (shape.type == "polygon" || shape.type == "polyline") {
        rotationPointX = (shape.coordinates[0] + shape.coordinates[2]) / 2;
        rotationPointY = (shape.coordinates[1] + shape.coordinates[3]) / 2;
      }

      context.translate(rotationPointX, rotationPointY);
      //translate each point of shape to new rotation point.
      //(i.e we want to rotate about a given point, not the origin so we translate the coordinate system to that point)
      for (var i = 0; i < tempWorkArr.length; i += 2) {
        tempWorkArr[i] -= rotationPointX;
        tempWorkArr[i + 1] -= rotationPointY;
      }
      var changeInAngle = angle - shape.angle; //if shape was already rotated, only rotate it by difference.

      //***ROTATION MATRIX ***
      //This calculation is shorthand for the transformation matrix for rotation. ROtate every point on shape.
      for (var i = 0; i < tempWorkArr.length; i += 2) {
        coordinates[i] = (tempWorkArr[i] * Math.cos(changeInAngle)) + (tempWorkArr[i + 1] * -Math.sin(changeInAngle));
        coordinates[i + 1] = (tempWorkArr[i] * Math.sin(changeInAngle)) + (tempWorkArr[i + 1] * Math.cos(changeInAngle));
      }
      for (var i = 0; i < tempWorkArr.length; i += 2) {
        coordinates[i] += rotationPointX;
        coordinates[i + 1] += rotationPointY;
      }

      //update angle at which shape is rotated.
      shape.angle = angle;


  }

  context.restore();
  canvas1.draw();
}


//scale shape while it 's at center.
function scaleShape(shapeIndex, context) {

  var shape = shapes[shapeIndex];
  var scalePointX = shape.centerX; // fix shape at it's center during scaling.
  var scalePointY = shape.centerY;
  var coordinates = shape.coordinates;
  var tempWorkArr = coordinates.slice(0); //copy coordinates into temp array, we don't want to change the original yet.   //original values saved to be used in calculations.
  var scaleFactorX = 1;
  var scaleFactorY = 1;
  context.save();
  if (xChangeCanvas < 0) scaleFactorX = 0.995;
  else {
    scaleFactorX = 1.005;
  }
  if (yChangeCanvas < 0) scaleFactorY = 0.995;
  else {
    scaleFactorY = 1.005;
  }

  switch (shape.type) {
    case "circle":
    case "ellipse":
      //basically for circle and ellipse rotation just change the angle at which they are drawn since we are rotating about the center, no matrix needed.
      console.log(shape.coordinates[2]);
      shape.coordinates[2] *= scaleFactorX;
      shape.coordinates[3] *= scaleFactorY;
      console.log(shape.coordinates[2]);
      break;
    default: // Move rotation point to center of the shape.

      //if shape is polyline or polygon, we can't tell what the center is since it's user defined: we used the exact point where the rotaion icon is
      if (shape.type == "polygon" || shape.type == "polyline") {
        rotationPointX = (shape.coordinates[0] + shape.coordinates[2]) / 2;
        rotationPointY = (shape.coordinates[1] + shape.coordinates[3]) / 2;
      }

      context.translate(rotationPointX, rotationPointY);
      //translate each point of shape to new rotation point.
      //(i.e we want to rotate about a given point, not the origin so we translate the coordinate system to that point)
      for (var i = 0; i < tempWorkArr.length; i += 2) {
        tempWorkArr[i] -= rotationPointX;
        tempWorkArr[i + 1] -= rotationPointY;
      }
      //***ROTATION MATRIX ***
      //This calculation is shorthand for the transformation matrix for rotation. ROtate every point on shape.
      for (var i = 0; i < tempWorkArr.length; i += 2) {
        coordinates[i] = (tempWorkArr[i] * Math.cos(angle)) + (tempWorkArr[i + 1] * -Math.sin(angle));
        coordinates[i + 1] = (tempWorkArr[i] * Math.sin(angle)) + (tempWorkArr[i + 1] * Math.cos(angle));
      }
      for (var i = 0; i < tempWorkArr.length; i += 2) {
        coordinates[i] += rotationPointX;
        coordinates[i + 1] += rotationPointY;
      }

  }
  context.restore();
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
