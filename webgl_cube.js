var gl;
// Create a canvas with given height and width
function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

// Get shaders
// Look for an element in our HTML page that has an ID that matches a parameter passed in, pulling out its contents, creating either a fragment or a vertex shader based on its type and then passing it off to WebGL to be compiled into a form that can run on the graphics card. 
function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}


var shaderProgram;
//  it uses a function called getShader to get two things,  a “fragment shader” and a “vertex shader” and then attaches them both to a WebGL thing called a “program”.
function initShaders() {
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

    // Create a program. A program is a bit of code that lives on the WebGL side of the system; you can look at it as a way of specifying something that can run on the graphics card.    
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    //Once the function has set up the program and attached the shaders, it stores in a new field on the program object called vertexPositionAttribute
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

    // We use gl.enableVertexAttribArray to tell WebGL that we will want to provide values for the attribute using an array.
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}


var mvMatrix = mat4.create(); // holds the model-view matrix 
var mvMatrixStack = [];
var pMatrix = mat4.create(); // holds projection matrix

function mvPushMatrix() {
    var copy = mat4.create();
    mat4.set(mvMatrix, copy);
    mvMatrixStack.push(copy);
}

function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}

// So, using the references to the uniforms that represent our projection matrix and our model-view matrix that we got back in initShaders, we send WebGL the values from our JavaScript-style matrices.
function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}


function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

var cubeVertexPositionBuffer;
var cubeVertexColorBuffer;
var cubeVertexIndexBuffer;

// buffers are things that hold the details of the the object(s) that we’re going to be drawing
function initBuffers() {
    cubeVertexPositionBuffer = gl.createBuffer(); // We create a buffer for the cube's vertex positions
    // Specify that any following operations that act on buffers should use the cubeVertexPositionBuffer
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    vertices = [
        // Front face
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,
        // Back face
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0, -1.0, -1.0,
        // Top face
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
         1.0,  1.0,  1.0,
         1.0,  1.0, -1.0,
        // Bottom face
        -1.0, -1.0, -1.0,
         1.0, -1.0, -1.0,
         1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,
        // Right face
         1.0, -1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0,  1.0,  1.0,
         1.0, -1.0,  1.0,
        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0
    ];
    // create a Float32Array object and tell WebGL to use it to fill the current buffer 
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    cubeVertexPositionBuffer.itemSize = 3; // (X, Y, Z)
    cubeVertexPositionBuffer.numItems = 24; // 6 cube's sides * 4 coordinates

    // Color Buffer: The colour buffer is more complex, because we use a loop to create a list of vertex colours so that we don’t have to specify each colour four times, one for each vertex
    cubeVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
    colors = [
        [1, 0.843137, 0, 1.0], // Front face
        [0.541176, 0.168627, 0.886275, 1.0], // Back face
        [0.678431, 1, 0.184314, 1.0], // Top face
        [1.0, 0.5, 0.5, 1.0], // Bottom face
        [0, 0.807843, 0.819608, 1.0], // Right face
        [1, 0.498039, 0.313725, 1.0]  // Left face
    ];
    // We use a loop to create a list of vertex colours so that we don’t have to specify each colour four times, one for each vertex
    var unpackedColors = [];
    for (var i in colors) {
        var color = colors[i];
        for (var j=0; j < 4; j++) {
            unpackedColors = unpackedColors.concat(color);
        }
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedColors), gl.STATIC_DRAW);
    cubeVertexColorBuffer.itemSize = 4; // (R, G, B, A)
    cubeVertexColorBuffer.numItems = 24; // 6 cube's sides * 4 coordinates

    cubeVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    // Each side of a cube is 2 triangles
    var cubeVertexIndices = [
        0, 1, 2,      0, 2, 3,    // Front face
        4, 5, 6,      4, 6, 7,    // Back face
        8, 9, 10,     8, 10, 11,  // Top face
        12, 13, 14,   12, 14, 15, // Bottom face
        16, 17, 18,   16, 18, 19, // Right face
        20, 21, 22,   20, 22, 23  // Left face
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
    cubeVertexIndexBuffer.itemSize = 1;
    cubeVertexIndexBuffer.numItems = 36;
}

var rCube = 0;

// Now we have all of the data for our objects in a set of four buffers, so the next change is to make drawScene use the new data
function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight); // tell WebGL about the size of the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear the canvas in preparation for drawing on it

    // 45 (field of view - 45degrees)
    // gl.viewportWidth / gl.viewportHeight (canvas ration)
    // 0.1 (don’t see things that are closer than 0.1 units to our viewpoint)
    // 100.0 (don’t see things that are further away than 100 units)
    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

    mat4.identity(mvMatrix); // “move” to the centre of the 3D scene (set inside canvas x,y,z to be 0,0,0)
    mat4.translate(mvMatrix, [0, 0.0, -8.0]); // move the object to a specific position on xyz

    mvPushMatrix();
    mat4.rotate(mvMatrix, degToRad(rCube), [1, 1, 1]); // xyz rotation coordinates

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, cubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    mvPopMatrix();

}


var lastTime = 0;

function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;

        rCube -= (75 * elapsed) / 1000.0;
    }
    lastTime = timeNow;
}


function tick() {
    requestAnimFrame(tick);
    drawScene();
    animate();
}


function webGLStart() {
    var canvas = document.getElementById("mycanvas");
    initGL(canvas);
    initShaders()
    initBuffers();
    gl.clearColor(0.0, 0.0, 0.0, 0.0); // background color
    gl.enable(gl.DEPTH_TEST);

    tick();
}