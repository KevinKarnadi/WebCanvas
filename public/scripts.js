var canvas = document.getElementById("canvas");
var tmp_canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
var tmp_ctx = tmp_canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

var container = canvas.parentNode;
tmp_canvas.id = "tmp_canvas";
tmp_canvas.width = 800;
tmp_canvas.height = 600;
tmp_canvas.style.cursor = "url('images/brush.svg'), auto"
container.appendChild(tmp_canvas);

var penColor = "black";
var penSize = "10";
var fontSize = "16px";
var fontName = "Arial";

var mode = new brushTool();
var currentMode = "brush";
var isTyping = false;

var canvasHistory = new Array();
var step = -1;

Push();

function Push() {
    console.log("push canvas");
    step++;
    if (step < canvasHistory.length) {
        canvasHistory.length = step;
    }
    let img = new Image();
    img.src = canvas.toDataURL();
    canvasHistory.push(img);
}

function Undo() {
    console.log("Undo");
    if (step > 0) {
        step--;
        let img = new Image();
        img = canvasHistory[step];
        clearCanvas();
        ctx.drawImage(img, 0, 0);
    }
}

function Redo() {
    console.log("Redo");
    if (step < canvasHistory.length-1) {
        step++;
        let img = new Image();
        img = canvasHistory[step];
        clearCanvas();
        ctx.drawImage(img, 0, 0);
    }
}

tmp_canvas.addEventListener("mousedown", canvasEvent, false);
tmp_canvas.addEventListener("mousemove", canvasEvent, false);
tmp_canvas.addEventListener("mouseup", canvasEvent, false);

function canvasEvent (e) {
    if(currentMode == undefined)
        return;
    var rect = tmp_canvas.getBoundingClientRect();
    e._x = e.clientX - rect.left;
    e._y = e.clientY - rect.top;
    tmp_canvas.onclick = function (e) {
        if(isTyping == true) {
            typeText(e);
            return;
        }
    };
    if(currentMode == "typing")
        return;
    var func = mode[e.type];
    func(e);
}

function toolChange (value) {
    currentMode = value;
    isTyping = false;
    if(value == "brush")
        mode = new brushTool();
    else if(value == "erase")
        mode = new eraseTool();
    else if(value == "circle")
        mode = new circleTool();
    else if(value == "rectangle")
        mode = new rectangleTool();
    else if(value == "triangle")
        mode = new triangleTool();
}

function changeCursor(val) {
    if(val == "default") {
        tmp_canvas.style.cursor = "default";
        return;
    }
    let str = "url('images/"+val+".svg'), auto";
    tmp_canvas.style.cursor = str;
}

function brushTool() {
    let tool = this;
    this.started = false;
    this.mousedown = function (e) {
        tmp_ctx.strokeStyle = penColor;
        tmp_ctx.lineWidth = penSize;
        tmp_ctx.beginPath();
        tmp_ctx.moveTo(e._x, e._y);
        tool.started = true;
    };
    this.mousemove = function (e) {
        if (tool.started == true) {
            tmp_ctx.lineTo(e._x, e._y);
            tmp_ctx.stroke();
        }
    };
    this.mouseup = function (e) {
        if (tool.started == true) {
            tool.mousemove(e);
            tool.started = false;
            drawImg();
        }
    };
}

function eraseTool() {
    let tool = this;
    this.started = false;
    this.mousedown = function (e) {
        ctx.clearRect(e._x, e._y, penSize, penSize);
        tool.started = true;
    };
    this.mousemove = function (e) {
        if (tool.started == true) {
            ctx.clearRect(e._x, e._y, penSize, penSize);
        }
    };
    this.mouseup = function (e) {
        if (tool.started == true) {
            tool.mousemove(e);
            tool.started = false;
        }
    };
}

function circleTool() {
    var tool = this;
    this.started = false;
    var x1, y1, x2, y2;
    this.mousedown = function(e) {
        tmp_ctx.strokeStyle = penColor;
        tmp_ctx.lineWidth = penSize;
        var rect = canvas.getBoundingClientRect();
        x1 = e.clientX - rect.left;
        y1 = e.clientY - rect.top;
        tool.started = true;
    };
    this.mousemove = function(e) {
        if (tool.started) {
            var rect = tmp_canvas.getBoundingClientRect(),
            x2 = e.clientX - rect.left,
            y2 = e.clientY - rect.top;
            tmp_ctx.clearRect(0, 0, canvas.width, canvas.height);
            var radiusX = (x2 - x1) * 0.5,
                radiusY = (y2 - y1) * 0.5,
                centerX = x1 + radiusX,
                centerY = y1 + radiusY,
                step = 0.01,
                i = step,
                pi2 = Math.PI * 2 - step;
            tmp_ctx.beginPath();
            tmp_ctx.moveTo(centerX + radiusX * Math.cos(0),
                           centerY + radiusY * Math.sin(0));
            for(; i < pi2; i += step) {
                tmp_ctx.lineTo(centerX + radiusX * Math.cos(i),
                               centerY + radiusY * Math.sin(i));
            }
            tmp_ctx.closePath();
            tmp_ctx.stroke();
        }
    };
    this.mouseup = function(e) {
        if (tool.started) {
            tool.mousemove(e);
            tool.started = false;
            drawImg();
        }
    };
}

function rectangleTool() {
    var tool = this;
	this.started = false;
	this.mousedown = function (e) {
        tmp_ctx.strokeStyle = penColor;
        tmp_ctx.lineWidth = penSize;
		tool.started = true;
		tool.x0 = e._x;
		tool.y0 = e._y;
	};
	this.mousemove = function (e) {
		if (tool.started == true) {
			var x = Math.min(e._x,	tool.x0),
			    y = Math.min(e._y,	tool.y0),
			    w = Math.abs(e._x - tool.x0),
			    h = Math.abs(e._y - tool.y0);
            tmp_ctx.clearRect(0, 0, canvas.width, canvas.height);
		    tmp_ctx.strokeRect(x, y, w, h);
		}
	};
	this.mouseup = function (e) {
		if (tool.started == true) {
			tool.mousemove(e);
			tool.started = false;
            drawImg();
		}
	};
}

function triangleTool() {
    var tool = this;
	this.started = false;
	this.mousedown = function (e) {
        tmp_ctx.strokeStyle = penColor;
        tmp_ctx.lineWidth = penSize;
		tool.started = true;
		tool.x0 = e._x;
		tool.y0 = e._y;
	};
	this.mousemove = function (e) {
		if (tool.started == true) {
			var w = Math.abs(e._x - tool.x0);
            tmp_ctx.clearRect(0, 0, canvas.width, canvas.height);
            tmp_ctx.beginPath();
            tmp_ctx.moveTo(tool.x0, tool.y0);
		    tmp_ctx.lineTo(e._x, tool.y0);
            if(e._x > tool.x0)
		        tmp_ctx.lineTo(e._x - (w / 2), e._y);
            else
                tmp_ctx.lineTo(e._x + (w / 2), e._y);
            tmp_ctx.closePath();
            tmp_ctx.stroke();
		}
	};
	this.mouseup = function (e) {
		if (tool.started == true) {
			tool.mousemove(e);
			tool.started = false;
            drawImg();
		}
	};
}

function drawImg() {
    ctx.drawImage(tmp_canvas, 0, 0);
	tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
    Push();
}

function typeText(e) {
    let x = e.clientX;
    let y = e.clientY;
    var input = document.createElement('input');
    input.type = 'text';
    input.style.position = 'fixed';
    input.style.left = x + 'px';
    input.style.top = y + 'px';
    input.onkeydown = function (e) {
        if (e.keyCode === 13) {
            let font = fontSize + " " + fontName;
            ctx.font = font;
            ctx.fillStyle = penColor;
            ctx.fillText(this.value, x, y);
            document.body.removeChild(this);
            Push();
        }
    };
    document.body.appendChild(input);
    input.focus();
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function loseFocus(e) {
    if(e.which == 13)
        this.blur();
}

document.getElementById("customFont").addEventListener("keydown", function(e) {
    if (e.which == 13) {
        fontSize = this.value + "px";
        this.blur();
    }
});

function Upload() {
    document.getElementById("upload").click();
}

const reader = new FileReader();
const img = new Image();

const uploadImage = (e) => {
    reader.onload = () => {
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            tmp_canvas.width = img.width;
            tmp_canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            Push();
        };
        img.src = reader.result;
    };
    reader.readAsDataURL(e.target.files[0]);
};

const imageLoader = document.getElementById("upload");
imageLoader.addEventListener("change", uploadImage);

function Download() {
    const image = canvas.toDataURL();
    const link = document.createElement("a");
    link.href = image;
    link.download = "image.png";
    link.click();
}