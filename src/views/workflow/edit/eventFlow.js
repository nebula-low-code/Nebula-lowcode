import { workFlowList } from "./left-menu/menu";

/* eslint-disable */
function Diagram(nextflow, id, stage, layer, devSwitch) {
    this.nextflow = nextflow;
    this.id = id;
    this.links = [];
    this.inputs = [];
    this.outputs = [];
    this.properties = {};
    this.stage = stage;
    this.layer = layer;
    this.devSwitch = devSwitch;
}



const ArrowDefaultXOffset = 200;
const ArrowDefaultYOffset = 34;
const ArrowDefaultMargin = 32;
const ArrowDefaultTextWidth = 242;
const ArrowDefaultTextOffsetX = 250;
const ArrowDefaultTextOffsetY = 16;
const ArrowDefaultRadius = 5;
const DiagramWidth = 100;

Diagram.prototype.create = function (type, imgfile, title, x, y, output_count, onSelected) {
    this._createShapeImage(type, undefined, imgfile, title, x, y, output_count, onSelected);

}
Diagram.prototype.createConnector = function (type, subType, imgfile, title, x, y, output_count, onSelected) {
    this._createShapeImage(type, subType, imgfile, title, x, y, output_count, onSelected);

}

Diagram.prototype._createShape = function (type, subType, img, title, properties, x, y, onSelected) {
    const stage = this.stage;
    const layer = this.layer;
    let menuInfo = getMenuInfo(subType || type);
    let introTitle = title;
    var shape = new Konva.Group({
        x: x,
        y: y,
        draggable: true,
        fill: 'green',
    });

    var titleText = new Konva.Text({
        x: 0,
        y: 35,
        width: DiagramWidth - 10,
        text: introTitle,
        fontSize: 14,
        // fontFamily: 'Calibri',
        fill: '#555',
        align: 'center',
        zIndex: 3,
    });
    shape.titleText = titleText;
    this.titleShape = titleText;

    var left = new Konva.Rect({
        x: 0,
        y: 0,
        width: DiagramWidth - 10,
        height: 28,
        fill: menuInfo.color,
        stroke: menuInfo.color,
        strokeWidth: 10,
        lineJoin: 'round',
        radius: 90,
    });
    var right = new Konva.Rect({
        x: -5,
        y: 23,
        width: DiagramWidth,
        height: titleText.height() + 20,
        fill: '#fff',
        strokeEnabled: false,
        shadowColor: '#ddd',
        shadowBlur: 0,
        shadowOffset: { x: 2, y: 2 },
        shadowOpacity: 0.5
    });
    var typeText = new Konva.Text({
        x: -5,
        y: 5,
        width: DiagramWidth,
        text: menuInfo.name,
        fontSize: 14,
        // fontFamily: 'Calibri',
        fill: '#fff',
        align: 'center'
    });

    shape.add(left);
    shape.add(right);
    shape.add(typeText);
    shape.add(titleText)
    // var shape = new Konva.Rect({
    //     x: x,
    //     y: y,
    //     width: 100,
    //     height: 50,
    //     draggable: true,
    //     fill: 'green',
    //     stroke: 'black',
    //     strokeWidth: 20,
    //     lineJoin: 'round',
    //     radius: 70,
    //   });
    // var shape = new Konva.Image({
    //     x: x,
    //     y: y,
    //     image: img,
    //     width: 32,
    //     height: 32,
    //     draggable: true,
    //     stroke: 'green',
    //     strokeWidth: 2,
    //     strokeEnabled: false
    // });


    this.type = type;
    this.subType = subType;
    this.shape = shape;
    shape.diagram = this;
    shape._m_title = title;
    shape._m_isShape = true;

    left._m_isShape = true;
    left.type = type;
    right._m_isShape = true;
    right.type = type;


    // var titleText = new Konva.Text({
    //     x: x,
    //     y: y + 36,
    //     text: introTitle,
    //     fontSize: 14,
    //     fill: '#555',
    //     align: 'left'
    // });




    if (onSelected && (typeof onSelected === "function")) {
        shape.on('click', function (e) {
            console.log('click', e);
            if (e.evt && e.evt.button === 0) {
                onSelected(this.diagram);
            }
        });
    }

    shape.on('dragstart', function () {
        console.log('shape dragstart');
    });

    shape.on('dragmove', function (e) {

        //   console.log('shape dragmove', this.x(), this.y(), e);
        for (var i = 0; i < this.diagram.outputs.length; i++) {
            var out_arrow = this.diagram.outputs[i]
            if (!out_arrow._m_isLinked) {
                // out_arrow.x(this.x() + out_arrow._dx);
                // out_arrow.y(this.y() + out_arrow._dy);
                __set_arrow_position(out_arrow, this.x() + out_arrow._dx, this.y() + out_arrow._dy);
                const points = __get_connector_points(
                    this.position(),
                    out_arrow.position()
                );
                out_arrow.line.points(points);
            } else {
                const points = __get_connector_points(
                    this.position(),
                    out_arrow.position()
                );
                out_arrow.line.points(points);
            }
        }

        for (var i = 0; i < this.diagram.inputs.length; i++) {
            var in_arrow = this.diagram.inputs[i]
            if (in_arrow._m_isLinked) {
                //vertical
                // __set_arrow_position(in_arrow, this.x() + 16, this.y() - 4);
                __set_arrow_position(in_arrow, this.x() - 10, this.y() + 34);
                const points = __get_connector_points(
                    in_arrow.shape.position(),
                    in_arrow.position()
                );
                in_arrow.line.points(points);
            }
        }


        // this.titleText.x(this.x()+30);
        // this.titleText.y(this.y() + 5);
        layer.batchDraw();
    });

    shape.on('dragleave', function () {
        console.log('shape dragleave');
    });


    shape.on('dragend', function () {
        // shape.dx = 0;
        // shape.dy = 0;
        console.log('shape dragend')

    });

    let nextflow = this.nextflow;
    shape.on('mouseenter', function (e) {
        stage.container().style.cursor = 'move';
        if (nextflow.events['mouseenter'] !== undefined) {
            let callback = nextflow.events['mouseenter'];
            callback(e);
        }
    });

    shape.on('mouseleave', function () {
        stage.container().style.cursor = 'default';
        if (nextflow.events['mouseleave'] !== undefined) {
            let callback = nextflow.events['mouseleave'];
            callback();
        }
    });


    layer.add(shape);
    // layer.add(titleText);
    layer.batchDraw();
}

Diagram.prototype.createGreenCircle = function (x, y) {
    const layer = this.layer;
    var circle = new Konva.Circle({
        x: x + 16,
        y: y + 15,
        radius: 20,
        fill: 'green',
        opacity: 0.5,
    });
    this.circleShape = circle;
    layer.add(circle);
    layer.batchDraw();
}
Diagram.prototype.createChosenCircle = function (x, y, diagram) {
    const layer = this.layer;
    const stage = this.stage;
    var circle = new Konva.Circle({
        x: x + 16,
        y: y + 15,
        radius: 20,
        fill: 'blue',
        opacity: 0.5,
        // draggable: true,
    });
    this.chosenCircle = circle;
    return circle;
    // layer.add(circle);
    // layer.batchDraw();
}


Diagram.prototype._destroy = function () {
    this.shape.destroy();
    this.titleShape.destroy();
    for (var i = 0; i < this.outputs.length; i++) {
        const arrow = this.outputs[i];
        if (arrow.titleText) {
            arrow.titleText.destroy();
        }
        if (arrow.line) {
            arrow.line.destroy();
        }
        arrow.destroy();
    }

}
Diagram.prototype._destroyGreenCircle = function () {
    if (this.circleShape) {
        this.circleShape.destroy();
    }
    // this.circle.destroy();
}
Diagram.prototype._destroyChosenCircle = function () {
    // this.chosenGroup.removeChildren();
    if (this.chosenCircle) {
        this.chosenCircle.destroy();
    }
}


Diagram.prototype._createShapeImage = function (type, subType, imgfile, title, x, y, output_count, onSelected) {
    const stage = this.stage;
    const layer = this.layer;

    this.title = title;
    var img = new Image();
    img.src = imgfile;
    var _this = this;
    this.type = type;
    this.subType = subType;
    this.title = title;
    img.onload = function () {

        _this._createShape(type, subType, img, title, null, x, y, onSelected);
        _this._createOutputs(x, y, output_count);

    };
}

Diagram.prototype._importShape = function (type, subType, imgfile, title, properties, x, y, outputs, onSelected, onComplete) {
    const stage = this.stage;
    const layer = this.layer;

    this.title = title;
    var img = new Image();
    img.src = imgfile;
    var _this = this;
    this.type = type;
    this.subType = subType;
    this.title = title;
    img.onload = function () {
        _this._createShape(type, subType, img, title, properties, x, y, onSelected);
        for (var i = 0; i < outputs.length; i++) {
            var output = outputs[i];
            var isNeedDiyArrow = false;
            if (type == "route") {
                if (i > 0) {
                    isNeedDiyArrow = true;
                    _this._createArrow(output.id, output.x, output.y, properties.routes[i - 1].title);
                }
            }

            if (!isNeedDiyArrow) {
                _this._createArrow(output.id, output.x, output.y, output.title);
            }
        }

        if (onComplete) {
            onComplete(true);
        }
    };

}


Diagram.prototype._createOutputs = function (x, y, outputCount) {
    if (outputCount > 0) {
        const offset = (ArrowDefaultMargin * (outputCount - 1)) / 2
        var offsetX = ArrowDefaultXOffset;
        if (outputCount <= 1) {
            offsetX = ArrowDefaultXOffset * 3 / 4;
        }
        for (var i = 0; i < outputCount; i++) {
            var arrowTitle = null;
            if (this.type === 'event-operate-logic-judgment' || this.type === 'work-flow-if') {
                if (i == 0) {
                    arrowTitle = 'True';
                } else {
                    arrowTitle = 'False';
                }
            }
            if (this.type === 'work-flow-approval') {
                if (i == 0) {
                    arrowTitle = '通过';
                } else if(i==1) {
                    arrowTitle = '不通过';
                } else if(i==2) {
                    arrowTitle = '撤回';
                }
            }
            
            // this._createVerticalArrow(null, x + 16 + i * ArrowDefaultMargin, y + ArrowDefaultYOffset + i * ArrowDefaultMargin + offsetX, arrowTitle);
            this._createArrow(null, x + offsetX, y + ArrowDefaultYOffset + i * ArrowDefaultMargin - offset, arrowTitle);
        } //endfor
    }
}



Diagram.prototype._createVerticalArrow = function (id, x, y, arrowTitle) {
    const stage = this.stage;
    const layer = this.layer;
    const fromShape = this.shape;
    var _this = this;
    var arrow = new Konva.RegularPolygon({
        x: x, //x + 100,
        y: y, //y + 16 + i*32 - offset,
        scaleY: 1.5,
        sides: 3,
        radius: ArrowDefaultRadius,
        fill: 'red',
        stroke: 'gray',
        strokeWidth: 1,
        draggable: true,
        name: 'triangle',
        rotation: 180
    });


    if (id) {
        arrow._m_id = id;
    }
    console.log("_createArrow", x, y)

    arrow._m_isLinked = false;
    arrow._m_isArrow = true;
    arrow.title = arrowTitle;
    var line = new Konva.Line({
        stroke: 'gray',
        // id: 'line'+i,
        fill: 'red',
        strokeWidth: 2
    });
    // line.id = 'line'+i
    arrow._dx = arrow.x() - fromShape.x();
    arrow._dy = arrow.y() - fromShape.y();
    const points = __get_connector_points(
        fromShape.position(),
        arrow.position()
    );
    line.from = fromShape;
    line.arrow = arrow;
    line.to = null;
    line.points(points);
    arrow.line = line;
    arrow.shape = fromShape;
    fromShape.diagram.links.push(line);
    fromShape.diagram.outputs.push(arrow);

    line.on('mouseover', function (e) {
        this.stroke('red');
        this.strokeWidth(3);
        const idx = this.getParent().children.length - 1;
        this.zIndex(idx);
        layer.draw();
    });

    line.on('mouseleave', function (e) {
        this.stroke('gray');
        this.strokeWidth(2);
        this.zIndex(1);
        layer.draw();
    });

    if (arrowTitle) {
        var titleText = new Konva.Text({
            x: x - ArrowDefaultTextOffsetX,
            y: y - ArrowDefaultTextOffsetY,
            text: arrowTitle,
            fontSize: 14,
            // fontFamily: 'Calibri',
            fill: '#555',
            width: ArrowDefaultTextWidth,
            align: 'right'

        });

        arrow.titleText = titleText;
        layer.add(titleText);
        titleText.zIndex(0);
    }

    arrow.on('dragstart', function (e) {
        if (this._m_isLinked) {
            var diagram = this._m_linkedShape.diagram;
            this.fill('red');
            if (diagram) {
                diagram._disconnectInputPort(this);
                console.log('remove ports', diagram, diagram.title, this, diagram.inputs);
            }
        }
    });

    arrow.on('dragmove', function (e) {
        // console.log('arrow move', this.id)
        const points = __get_connector_points(
            this.shape.position(),
            this.position()
        );

        this._dx = this.x() - this.shape.x();
        this._dy = this.y() - this.shape.y();
        this.line.points(points);
        if (this.titleText) {
            this.titleText.x(this.x() - ArrowDefaultTextOffsetX);
            this.titleText.y(this.y() - ArrowDefaultTextOffsetY);
        }
        layer.batchDraw();
    });

    arrow.on('mouseenter', function () {
        stage.container().style.cursor = 'move';
    });

    arrow.on('mouseleave', function () {
        stage.container().style.cursor = 'default';
    });

    layer.add(arrow);
    layer.add(line);


    return arrow;

}
Diagram.prototype._createArrow = function (id, x, y, arrowTitle) {
    const stage = this.stage;
    const layer = this.layer;
    const fromShape = this.shape;
    var _this = this;
    var arrow = new Konva.RegularPolygon({
        x: x, //x + 100,
        y: y, //y + 16 + i*32 - offset,
        scaleY: 1.5,
        sides: 3,
        radius: ArrowDefaultRadius,
        fill: 'red',
        stroke: 'gray',
        strokeWidth: 1,
        draggable: true,
        name: 'triangle',
        rotation: 90
    });


    if (id) {
        arrow._m_id = id;
    }

    arrow._m_isLinked = false;
    arrow._m_isArrow = true;
    arrow.title = arrowTitle;
    var line = new Konva.Line({
        stroke: 'gray',
        // id: 'line'+i,
        fill: 'red',
        strokeWidth: 2
    });
    // line.id = 'line'+i
    arrow._dx = arrow.x() - fromShape.x();
    arrow._dy = arrow.y() - fromShape.y();
    const points = __get_connector_points(
        fromShape.position(),
        arrow.position()
    );
    line.from = fromShape;
    line.arrow = arrow;
    line.to = null;
    line.points(points);
    arrow.line = line;
    arrow.shape = fromShape;
    fromShape.diagram.links.push(line);
    fromShape.diagram.outputs.push(arrow);

    line.on('mouseover', function (e) {
        this.stroke('red');
        this.strokeWidth(3);
        const idx = this.getParent().children.length - 1;
        this.zIndex(idx);
        layer.draw();
    });

    line.on('mouseleave', function (e) {
        this.stroke('gray');
        this.strokeWidth(2);
        this.zIndex(1);
        layer.draw();
    });

    if (arrowTitle) {
        var titleText = new Konva.Text({
            x: x - ArrowDefaultTextOffsetX,
            y: y - ArrowDefaultTextOffsetY,
            text: arrowTitle,
            fontSize: 14,
            // fontFamily: 'Calibri',
            fill: '#555',
            width: ArrowDefaultTextWidth,
            align: 'right'

        });

        arrow.titleText = titleText;
        layer.add(titleText);
        titleText.zIndex(0);
    }

    arrow.on('dragstart', function (e) {
        if (this._m_isLinked) {
            var diagram = this._m_linkedShape.diagram;
            this.fill('red');
            if (diagram) {
                diagram._disconnectInputPort(this);
                console.log('remove ports', diagram, diagram.title, this, diagram.inputs);
            }
        }
    });

    arrow.on('dragmove', function (e) {
        // console.log('arrow move', this.id)
        const points = __get_connector_points(
            this.shape.position(),
            this.position()
        );

        this._dx = this.x() - this.shape.x();
        this._dy = this.y() - this.shape.y();
        this.line.points(points);
        if (this.titleText) {
            this.titleText.x(this.x() - ArrowDefaultTextOffsetX);
            this.titleText.y(this.y() - ArrowDefaultTextOffsetY);
        }
        layer.batchDraw();
    });

    arrow.on('mouseenter', function () {
        stage.container().style.cursor = 'move';
    });

    arrow.on('mouseleave', function () {
        stage.container().style.cursor = 'default';
    });

    layer.add(arrow);
    layer.add(line);


    return arrow;

}

Diagram.prototype.updateOutputPorts = function (port_count) {
    if (port_count == this.outputs.length) {
        return;
    }
    if (this.outputs.length > port_count) {
        var outputs = this.outputs.splice(port_count, this.outputs.length - port_count);
        console.log('outputs', this.outputs, outputs);
        for (var i = 0; i < outputs.length; i++) {
            var output = outputs[i];
            if (output._m_isLinked) {
                output._m_linkedShape.diagram._disconnectInputPort(output); //remove input link
            } else {

            }
            if (output.titleText) {
                output.titleText.destroy();
            }
            output.line.destroy();
            output.destroy();
        }
    } else {
        var lastx = 0;
        var lasty = 0;
        var len = this.outputs.length;
        if (this.outputs.length > 0) {
            var lastOutput = this.outputs[this.outputs.length - 1]
            lastx = lastOutput.x();
            lasty = lastOutput.y() + ArrowDefaultMargin;
        } else {
            lastx = this.shape.x() + ArrowDefaultXOffset;
            lasty = this.shape.y() + ArrowDefaultYOffset;
        }
        for (var i = len; i < port_count; i++) {
            var title = "";
            if (this.type === 'branch' || this.type === 'branchV4') {
                title = (i + 1) + "";
            } else if (this.type === 'route' || this.type === 'routeV4') {
                if (i === 0) {
                    title = '默认';
                } else {
                    title = '' + i;
                }
            }
            this._createArrow(null, lastx, lasty + (i - len) * ArrowDefaultMargin, title);
        }

    }

    this.layer.draw();
}

Diagram.prototype._setOutputTitle = function (outputIndex, title) {
    if (this.outputs.length > outputIndex) {
        __set_arrow_m_title(this.outputs[outputIndex], title);
        this.layer.draw();
    }
}

Diagram.prototype.setTitle = function (propertys, type, title) {
    this.title = title;
    var detailTitle = title;
    if (this.devSwitch) {
        detailTitle = showDetailTitle(propertys, type, title);
    }
    this.shape.titleText.text(detailTitle);
    this.layer.draw();
}

Diagram.prototype.setProperties = function (properties) {
    this.properties = properties;
}

Diagram.prototype.getProperties = function () {
    return this.properties;
}

Diagram.prototype.setProperty = function (propertyName, value) {
    this.properties[propertyName] = value;
}

Diagram.prototype.getProperty = function (propertyName) {
    return this.properties[propertyName];
}

Diagram.prototype._connectOutputPort = function (output) {
    for (var i = 0; i < this.inputs.length; i++) {
        if (this.inputs[i]._id === output._id) {
            return;
        }
    }
    if (output._m_isArrow) {
        output._m_isLinked = true;
        output._m_linkedShape = this.shape;
        // output.fill('#22c710');
        output.fill('#fff');
    }
    this.inputs.push(output);
}

Diagram.prototype._disconnectInputPort = function (input) {
    var arr = [];
    var pos = -1;
    for (var i = 0; i < this.inputs.length; i++) {
        if (this.inputs[i]._id === input._id) {
            pos = i;
        }
    }
    if (pos >= 0) {
        this.inputs.splice(pos, 1);
    }
    input._m_isLinked = false;
    input._m_linkedShape = null;
    input.fill('red');
}


Diagram.prototype.getOutputPort = function (outputId) {
    for (var i = 0; i < this.outputs.length; i++) {
        if (this.outputs[i]._id === outputId) {
            return this.outputs[i];
        }
    }
}

Diagram.prototype.getOutputPortByMid = function (outputId) {
    for (var i = 0; i < this.outputs.length; i++) {
        if (this.outputs[i]._m_id === outputId) {
            return this.outputs[i];
        }
    }
}


function NextFlow(width, height) {

    if (typeof document.__nextflowNumber == 'undefined') {
        document.__nextflowNumber = 0;
    } else {
        document.__nextflowNumber++;
    }
    this.globalId = document.__nextflowNumber;
    this.diagramNum = 0;
    this.events = {};
    this.scale = 1;

    this.stage = new Konva.Stage({
        container: 'container',
        width: width,
        height: height
    });
    var gridLayer = new Konva.Layer();
    this.gridLayer = gridLayer;
    this.stage.add(gridLayer);

    var layer = new Konva.Layer();
    this.mainLayer = layer;

    this.stage.add(layer);
    var clayer = new Konva.Layer();
    this.chosenLayer = clayer;
    this.stage.add(clayer);
    var tempLayer = new Konva.Layer();
    this.stage.add(tempLayer);

    this.tempLayer = tempLayer;

    var text = new Konva.Text({
        fill: 'black'
    });
    layer.add(text);

    this.init();
}

NextFlow.prototype.draw = function () {
    this.mainLayer.draw();
}



NextFlow.prototype.batchDraw = function () {
    this.mainLayer.batchDraw();
}

NextFlow.prototype.diagrams = function () {
    return this._diagrams;
}




NextFlow.prototype.init = function () {

    const stage = this.stage;
    const layer = this.mainLayer;
    const tempLayer = this.tempLayer;

    this._diagrams = {};

    var _this = this;
    _this.draggingShape = null;
    stage.on('dragstart', function (e) {
        console.log('dragstart')
        e.target.moveTo(tempLayer);
        _this.draggingShape = e.target;
        layer.draw();
    });

    var previousShape;
    stage.on('dragmove', function (evt) {
        console.log("stage dragmove");
        // 舞台拖拽触发时取消 框选功能
        this.mouseEnterFlag = false;
        var pos = stage.getPointerPosition();
        var shape = layer.getIntersection(pos);
        if (previousShape && shape && shape._m_isShape) {
            if (previousShape !== shape) {
                // leave from old targer
                previousShape.fire(
                    'dragleave', {
                    type: 'dragleave',
                    target: previousShape,
                    evt: evt.evt
                },
                    true
                );

                // enter new targer
                shape.fire(
                    'dragenter', {
                    type: 'dragenter',
                    target: shape,
                    evt: evt.evt
                },
                    true
                );
                previousShape = shape;
            } else {
                previousShape.fire(
                    'dragover', {
                    type: 'dragover',
                    target: previousShape,
                    evt: evt.evt
                },
                    true
                );
            }
        } else if (!previousShape && shape) {
            console.log('set prev shap', previousShape, shape)
            previousShape = shape;
            shape.fire(
                'dragenter', {
                type: 'dragenter',
                target: shape,
                evt: evt.evt
            },
                true
            );
        } else if (previousShape && !shape) {

            previousShape.fire(
                'dragleave', {
                type: 'dragleave',
                target: previousShape,
                evt: evt.evt
            },
                true
            );
            console.log('pre shape dragleave, set prev = null');
            previousShape = undefined;
        }
    });
    stage.on('dragend', function (e) {
        console.log('dragend');
        var pos = this.getPointerPosition();
        var shape = layer.getIntersection(pos);
        if (shape && shape._m_isShape) {
            previousShape.fire(
                'drop', {
                type: 'drop',
                target: previousShape,
                source: e.target,
                dist: shape,
                evt: e.evt,
                e: e
            },
                true
            );
        }
        console.log('stage dragend, set prev = null');
        previousShape = undefined;
        e.target.moveTo(layer);
        layer.draw();
        tempLayer.draw();
    });

    stage.on('dragenter', function (e) {
        console.log('dragenter', _this.draggingShape, e.target.id, e, e.target.parent, this);
        if (e.target._m_isShape && _this.draggingShape._m_isArrow && _this.draggingShape.shape._id !== e.target._id && e.target.parent.diagram.type !== 'start') {
            // e.target.fill('#ccc');
            // e.target.parent.strokeEnabled(true)
            layer.draw();
        }
    });

    stage.on('dragleave', function (e) {
        console.log('dragleave', e);
        if (e.target._m_isShape) {
            // e.target.fill('');
            // e.target.strokeEnabled(false)
            layer.draw();
        }

    });

    stage.on('dragover', function (e) {
        layer.draw();
    });

    stage.on('drop', function (e) {
        // e.target.fill('');
        var source = e.source;
        var target = e.target.parent;

        if (target._m_isShape && source._m_isArrow && source.shape) {
            console.log('drop id', source.shape._id, target._id);
            if (source.shape._id === target._id || target.type === 'start') {
                // source.x(target.x()-32)
                // source.y(target.y()+16)
                __set_arrow_position(source, target.x() - 32, target.y() + 32);
                source._dx = source.x() - target.x();
                source._dy = source.y() - target.y();
                const points = __get_connector_points(
                    source.shape.position(),
                    source.position()
                );
                source.line.points(points);
            } else {
                // target.diagram.inputs.push(source)
                // __add_input_port(target.diagram.inputs, source);
                // __arrow_hock_shape(target, source);
                // source._m_isLinked = true;
                // source._m_linkedShape = target;

                target.diagram._connectOutputPort(source);


                // source.fill('#22c710');
                // source.fill('#fff');
                // source.strokeEnabled(true);
                // vertical 
                // __set_arrow_position(source, target.x() + 16, target.y() - 4);

                __set_arrow_position(source, target.x() - 10, target.y() + 34);
                const points = __get_connector_points(
                    source.shape.position(),
                    source.position()
                );
                source.line.points(points);
            }

            // target.strokeEnabled(false);
            layer.draw();
        }
        console.log('drop', e);
    });


}


NextFlow.prototype._newDiagram = function () {
    while (typeof this._diagrams[this.diagramNum] != 'undefined') {
        this.diagramNum++;
    }
    var diagram = new Diagram(this, this.diagramNum, this.stage, this.mainLayer, this.devSwitch);
    this._diagrams[diagram.id] = diagram;
    return diagram;
}


NextFlow.prototype._createDiagram = function (type, title, x, y, outputs) {
    var diagram = this._newDiagram();

    // var imgfile = require('@/assets/icon/'+type+'.jpg');
    var imgfile = require('@/assets/icon/if.svg');
    var _this = this;

    function onClick(e) {
        var call = _this.events.click;
        if (call) {
            console.log('click create', e, this);
            call(e);
        }
    }
    diagram.create(type, imgfile, title, x, y, outputs, onClick);
    // 这边直接初始化 properties
    var properties = {
        actionType: type
    }
    if (type == 'work-flow-approval') {
        properties.approveBy = 'user';
        properties.approveUserId = null;
        properties.approveLevel=null
        properties.approveDeptId=""
        properties.approveMethods=""
        properties.adoptRequired=false;
        properties.rejectRequired=false;
        properties.approveList=[];
    }
    if(type=='work-flow-business-handler'){
        properties.operateApiId = '';
        properties.interfaceDataConfig={}
    }
    
    diagram.properties = properties;
    return diagram;
}
NextFlow.prototype._createDiagramV4 = function (type, subType, title, x, y, outputs) {
    var diagram = this._newDiagram();

    // var imgfile = require('@/assets/icon/'+type+'.jpg');
    var imgfile = require('@/assets/icon/' + subType + '.svg');
    var _this = this;

    function onClick(e) {
        var call = _this.events.click;
        if (call) {
            console.log('click create', e, this);
            call(e);
        }
    }
    diagram.createConnector(type, subType, imgfile, title, x, y, outputs, onClick);
    return diagram;
}



NextFlow.prototype._createBranch = function (title, x, y, outputs) {
    var diagram = this._createDiagram('branchV4', title, x, y, outputs);

    return diagram
}

NextFlow.prototype._createRoute = function (title, x, y, outputs) {
    var diagram = this._createDiagram('routeV4', title, x, y, outputs)

    return diagram;
}

NextFlow.prototype._createStart = function (title, x, y) {
    var diagram = this._createDiagram('start', title, x, y, 1);

    return diagram;
}


NextFlow.prototype._createStop = function (title, x, y) {
    var diagram = this._createDiagram('stopV4', title, x, y, 0);

    return diagram;
}

NextFlow.prototype._createSetProperties = function (title, x, y) {
    var diagram = this._createDiagram('setproperties', title, x, y, 1);

    return diagram;
}


NextFlow.prototype._createLoop = function (title, x, y) {
    var diagram = this._createDiagram('loopV4', title, x, y, 1);

    return diagram;
}


NextFlow.prototype._createIf = function (title, x, y) {
    var diagram = this._createDiagram('ifV4', title, x, y, 2);

    return diagram;
}

NextFlow.prototype.createConnector = function (title, subType, x, y) {
    var diagram = this._createDiagramV4('connectorV4', subType, title, x, y, 1);

    return diagram;
}

NextFlow.prototype.createConnectorV3 = function (title, x, y) {
    var diagram = this._createDiagram('connectorV3', title, x, y, 1);

    return diagram;
}

NextFlow.prototype._createDataProcess = function (title, x, y) {
    var diagram = this._createDiagram('dataprocessV4', title, x, y, 1);

    return diagram;
}

NextFlow.prototype._createDataProcessV4 = function (title, subType, x, y) {
    var diagram = this._createDiagramV4('dataprocessV4', subType, title, x, y, 1);

    return diagram;
}


NextFlow.prototype._createProgramCommand = function (title, x, y) {
    var diagram = this._createDiagram('programcommand', title, x, y, 1);

    return diagram;
}

NextFlow.prototype._createReturn = function (title, x, y) {
    var diagram = this._createDiagram('returnV4', title, x, y, 0);

    return diagram;
}
NextFlow.prototype._createCall = function (title, x, y) {
    var diagram = this._createDiagram('processcallV4', title, x, y, 1);

    return diagram;
}

NextFlow.prototype._createMessage = function (title, x, y) {
    var diagram = this._createDiagram('messageV4', title, x, y, 0);

    return diagram;
}

NextFlow.prototype._createNotify = function (title, x, y) {
    var diagram = this._createDiagram('notify', title, x, y, 0);

    return diagram;
}

NextFlow.prototype._createException = function (title, x, y) {
    var diagram = this._createDiagram('exception', title, x, y, 0);

    return diagram;
}
NextFlow.prototype._createInterface = function (title, x, y) {
    var diagram = this._createDiagram('interface', title, x, y, 1);

    return diagram;
}
NextFlow.prototype._createInterfaceV4 = function (title, x, y) {
    var diagram = this._createDiagram('interfaceV4', title, x, y, 1);

    return diagram;
}
NextFlow.prototype._createScriptV4 = function (title, x, y) {
    var diagram = this._createDiagram('scriptV4', title, x, y, 1);
    return diagram;
}
NextFlow.prototype._createDataJoinV4 = function (title, x, y) {
    var diagram = this._createDiagram('dataJoinV4', title, x, y, 1);
    return diagram;
}
NextFlow.prototype._createDataUnionV4 = function (title, x, y) {
    var diagram = this._createDiagram('dataUnionV4', title, x, y, 1);
    return diagram;
}
NextFlow.prototype._createDataSortV4 = function (title, x, y) {
    var diagram = this._createDiagram('dataSortV4', title, x, y, 1);
    return diagram;
}

NextFlow.prototype._createLog = function (title, x, y) {
    var diagram = this._createDiagram('log', title, x, y, 1);

    return diagram;
}

NextFlow.prototype.createDiagram = function (type, name, x, y) {
    if (type === 'start') {
        this._createStart('开始', x, y);
    } else if (type === 'event-operate-logic-judgment') {
        this._createDiagram(type, name, x, y, 2);
    } else if (type === 'work-flow-if') {
        this._createDiagram(type, name, x, y, 2);
    } else if (type === 'work-flow-approval') {
        this._createDiagram(type, name, x, y, 3);
    } else {
        this._createDiagram(type, name, x, y, 1);
    }
}

NextFlow.prototype._importShape = function (id, type, subType, title, x, y, outputs, properties, onComplete) {
    var diagram = new Diagram(this, id, this.stage, this.mainLayer, this.devSwitch);
    this._diagrams[diagram.id] = diagram;
    var _this = this;

    diagram.properties = properties;

    function onClick(e) {
        var call = _this.events.click;
        if (call) {
            console.log('click import', e, this);
            call(e);
        }
    }
    let img
    if (type == 'start') {
        img = require('@/assets/icon/' + type + '.svg');
    } else {
        img = require('@/assets/icon/if.svg');
    }

    // diagram._importShape(type, require('@/assets/icon/' + type + '.jpg'), title,properties, x, y, outputs, onClick, onComplete);
    diagram._importShape(type, subType, img, title, properties, x, y, outputs, onClick, onComplete);
}


NextFlow.prototype._createGridLine = function () {
    const layer = this.gridLayer;
    var width = 1980;
    var height = 700;
    var group = new Konva.Group({
        x: 0,
        y: 0,
    });
    var colorDot = '#EDEDED';
    var colorFull = '#C8C8C8';
    for (var i = 0; i < height; i = i + 10) {
        var straight = new Konva.Line({
            x: 0, // x轴的位置
            y: i, // y轴的位置
            points: [0, i, 1980, i], // 排列：平面阵列的点坐标，定义[x1，y1，x2，y2，x3，y3]。
            stroke: i % 40 == 0 ? colorFull : colorDot, // 颜色
            strokeWidth: 0.5,
            tension: 0 // 数：较高的值将导致更曲线,默认值为0。
        });
        group.add(straight);
    }

    for (var j = 0; j < width; j = j + 10) {
        var straight = new Konva.Line({
            x: j, // x轴的位置
            y: 0, // y轴的位置
            points: [j, 0, j, 1080], // 排列：平面阵列的点坐标，定义[x1，y1，x2，y2，x3，y3]。
            stroke: j % 40 == 0 ? colorFull : colorDot, // 颜色
            strokeWidth: 0.5,
            tension: 0 // 数：较高的值将导致更曲线,默认值为0。
        });
        group.add(straight);
    }

    layer.add(group);
    layer.batchDraw();
}
NextFlow.prototype._createChosenRect = function () {
    const chosenLayer = this.chosenLayer;
    const layer = this.mainLayer;
    const stage = this.stage;
    const _this = this;
    this.mouseEnterFlag = false;
    var startPos = null;
    var chosenRect = null;
    var chosenDiagramList = new Array();
    var chosenRectGroup = new Konva.Group({
        x: 0,
        y: 0,
    });
    var chosenGroup = new Konva.Group({
        x: 0,
        y: 0,
        draggable: true,
        zIndex: 999
    });
    // layer.add(chosenGroup);
    // layer.add(chosenRectGroup);
    chosenLayer.add(chosenGroup);
    chosenLayer.add(chosenRectGroup);

    stage.on('mousedown touchstart', function () {
        console.log("stage mousedown touchstart")
        var pos = stage.getPointerPosition();
        this.mouseEnterFlag = true;
        startPos = pos;
        chosenRect = new Konva.Rect({
            x: pos.x,
            y: pos.y,
            width: 0,
            height: 0,
            fill: 'rgba(0,0,255,0.5)',
        });
        chosenRectGroup.add(chosenRect);
    });
    stage.on('mouseup touchend', function () {
        console.log("stage mouseup touchend");
        if (this.mouseEnterFlag) {
            var pos = stage.getPointerPosition();
            // setTimeout(() => {
            //     this.mouseEnterFlag=false;
            //     chosenLayer.batchDraw();
            // });
            this.mouseEnterFlag = false;
            chosenRectGroup.removeChildren();
            chosenGroup.x(0);
            chosenGroup.y(0);
            // 选中组销毁
            chosenGroup.removeChildren();
            // 选中对象数组销毁
            chosenDiagramList = new Array();
            // 计算框选的内容
            var images = layer.find("Image");
            for (var i = 0; i < images.length; i++) {
                //左上->右下 开始X<终止X AND 开始Y<终止Y ===> 开始x<image<终止x  AND 开始Y<image<终止Y
                //pos.x >=images[i].x() && images[i].x()>=startPos.x && images[i].y()>=startPos.y && pos.y >=images[i].y()
                //左下->右上 开始X<终止X AND 开始Y>终止Y ===> 开始x<image<终止x AND 开始Y>image>终止Y
                //右上->左下 开始X>终止X AND 开始Y<终止Y ===> 开始x>image>终止x AND 开始Y<image<终止Y
                //右下->左上 开始X>终止X AND 开始Y>终止Y ===> 开始x>image>终止x AND 开始Y>image>终止Y
                if (
                    (startPos.x <= images[i].x() && images[i].x() <= pos.x && startPos.y <= images[i].y() && images[i].y() <= pos.y) ||
                    (startPos.x <= images[i].x() && images[i].x() <= pos.x && startPos.y >= images[i].y() && images[i].y() >= pos.y) ||
                    (startPos.x >= images[i].x() && images[i].x() >= pos.x && startPos.y <= images[i].y() && images[i].y() <= pos.y) ||
                    (startPos.x >= images[i].x() && images[i].x() >= pos.x && startPos.y >= images[i].y() && images[i].y() >= pos.y)
                ) {
                    images[i].diagram.relative = {
                        x: images[i].x(),
                        y: images[i].y()
                    };
                    chosenDiagramList.push(images[i].diagram);
                    var circle = images[i].diagram.createChosenCircle(images[i].x(), images[i].y(), images[i].diagram);
                    chosenGroup.add(circle);
                }
            }
        } else {
            chosenRectGroup.removeChildren();
        }
        layer.draw();
        chosenLayer.batchDraw();
    });
    stage.on('mousemove touchmove', function () {
        if (this.mouseEnterFlag) {
            // 画虚线框
            var pos = stage.getPointerPosition();
            var width = pos.x - startPos.x;
            var height = pos.y - startPos.y;
            chosenRect.width(width);
            chosenRect.height(height);
            // layer.draw();   
            chosenLayer.batchDraw();
        }
    });

    chosenGroup.on('dragmove', function (e) {
        chosenDiagramList.forEach((diagram) => {
            // 移动图片和文字
            diagram.shape.x(diagram.relative.x + e.target.x());
            diagram.shape.y(diagram.relative.y + e.target.y());
            diagram.titleShape.x(diagram.relative.x + e.target.x());
            diagram.titleShape.y(diagram.relative.y + e.target.y() + 36);
            //移动 line 和arrow
            diagram.inputs.forEach((in_arrow) => {
                if (in_arrow._m_isLinked) {
                    __set_arrow_position(in_arrow, diagram.relative.x + e.target.x() - 10, diagram.relative.y + e.target.y() + 34);
                    const points = __get_connector_points(
                        in_arrow.shape.position(),
                        in_arrow.position()
                    );
                    in_arrow.line.points(points);
                }
            });
            diagram.outputs.forEach((out_arrow) => {
                if (!out_arrow._m_isLinked) {
                    // out_arrow.x(this.x() + out_arrow._dx);
                    // out_arrow.y(this.y() + out_arrow._dy);
                    // __set_arrow_position(out_arrow, this.x() + out_arrow._dx, this.y() + out_arrow._dy);
                    __set_arrow_position(out_arrow, diagram.relative.x + e.target.x() + out_arrow._dx, diagram.relative.y + e.target.y() + out_arrow._dy);
                    var from = {
                        x: diagram.relative.x + e.target.x(),
                        y: diagram.relative.y + e.target.y()
                    }
                    const points = __get_connector_points(
                        from,
                        out_arrow.position()
                    );
                    out_arrow.line.points(points);
                } else {
                    var from = {
                        x: diagram.relative.x + e.target.x(),
                        y: diagram.relative.y + e.target.y()
                    }
                    const points = __get_connector_points(
                        from,
                        out_arrow.position()
                    );
                    out_arrow.line.points(points);
                }
            });
        })
        chosenRectGroup.removeChildren();
        layer.batchDraw();
        chosenLayer.batchDraw();
    });

}

NextFlow.prototype._createTransformer = function () {
    const layer = this.mainLayer;
    const stage = this.stage;
    const _this = this;

    var tr = new Konva.Transformer();
    layer.add(tr);

    var images = layer.find("Image");
    // by default select all shapes
    tr.nodes(images);

    // at this point basic demo is finished!!
    // we just have several transforming nodes
    layer.draw();
    var selectionRectangle = new Konva.Rect({
        fill: 'rgba(0,0,255,0.5)',
    });
    layer.add(selectionRectangle);
    var x1, y1, x2, y2;
    stage.on('mousedown touchstart', (e) => {
        // do nothing if we mousedown on eny shape
        if (e.target !== stage) {
            return;
        }
        x1 = stage.getPointerPosition().x;
        y1 = stage.getPointerPosition().y;
        x2 = stage.getPointerPosition().x;
        y2 = stage.getPointerPosition().y;

        selectionRectangle.visible(true);
        selectionRectangle.width(0);
        selectionRectangle.height(0);
        layer.draw();
    });

    stage.on('mousemove touchmove', () => {
        // no nothing if we didn't start selection
        if (!selectionRectangle.visible()) {
            return;
        }
        x2 = stage.getPointerPosition().x;
        y2 = stage.getPointerPosition().y;

        selectionRectangle.setAttrs({
            x: Math.min(x1, x2),
            y: Math.min(y1, y2),
            width: Math.abs(x2 - x1),
            height: Math.abs(y2 - y1),
        });
        layer.batchDraw();
    });

    stage.on('mouseup touchend', () => {
        // no nothing if we didn't start selection
        if (!selectionRectangle.visible()) {
            return;
        }
        // update visibility in timeout, so we can check it in click event
        setTimeout(() => {
            selectionRectangle.visible(false);
            layer.batchDraw();
        });

        var shapes = stage.find('.rect').toArray();
        var box = selectionRectangle.getClientRect();
        var selected = shapes.filter((shape) =>
            Konva.Util.haveIntersection(box, shape.getClientRect())
        );
        tr.nodes(selected);
        layer.batchDraw();
    });

    // clicks should select/deselect shapes
    stage.on('click tap', function (e) {
        // if we are selecting with rect, do nothing
        if (selectionRectangle.visible()) {
            return;
        }

        // if click on empty area - remove all selections
        if (e.target === stage) {
            tr.nodes([]);
            layer.draw();
            return;
        }

        // do nothing if clicked NOT on our rectangles
        if (!e.target.hasName('rect')) {
            return;
        }

        // do we pressed shift or ctrl?
        const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
        const isSelected = tr.nodes().indexOf(e.target) >= 0;

        if (!metaPressed && !isSelected) {
            // if no key pressed and the node is not selected
            // select just one
            tr.nodes([e.target]);
        } else if (metaPressed && isSelected) {
            // if we pressed keys and node was selected
            // we need to remove it from selection:
            const nodes = tr.nodes().slice(); // use slice to have new copy of array
            // remove node from array
            nodes.splice(nodes.indexOf(e.target), 1);
            tr.nodes(nodes);
        } else if (metaPressed && !isSelected) {
            // add the node into selection
            const nodes = tr.nodes().concat([e.target]);
            tr.nodes(nodes);
        }
        layer.draw();
    });

}
NextFlow.prototype.export = function () {
    var objects = [];
    Object.entries(this._diagrams).map(([k, diagram]) => {
        // console.log(diagram);
        const type = diagram.type;
        const links = diagram.links;

        var entity = {};
        entity.version = 1;
        entity.id = diagram.id;
        entity.x = diagram.shape.x();
        entity.y = diagram.shape.y();
        entity.title = diagram.title;
        entity.type = diagram.type;
        entity.subType = diagram.subType;
        var outputs = [];
        for (var j = 0; j < diagram.outputs.length; j++) {
            var output = diagram.outputs[j];
            var out = {
                id: output._id,
                x: output.x(),
                y: output.y(),
                title: output.title
            };
            if (output._m_isLinked) {
                out['next'] = output._m_linkedShape.diagram.id;
            }
            outputs.push(out);
        }
        entity.outputs = outputs;
        entity.properties = diagram.properties;

        objects.push(entity);
    });


    return { "nodes": objects };
}

NextFlow.prototype._loadLinks = function (data) {
    for (var i = 0; i < data.length; i++) {
        var v = data[i];

        for (var j = 0; j < v.outputs.length; j++) {
            var out = v.outputs[j];

            if (out.next !== null && out.next !== undefined && out.next !== '') {

                var source = this._diagrams[v.id];
                var target = this._diagrams[out.next];
                if (source === undefined || target === undefined) {
                    console.log('source or targe is null, can\'t create arrow', source, target);
                } else {
                    var output = source.getOutputPortByMid(out.id);
                    if (output) {
                        output._m_isLinked = true;
                        output._m_linkedShape = target.shape;
                        target._connectOutputPort(output);
                    }
                }
            }
        }
    }
}

NextFlow.prototype.import = function (jsondata) {
    var _this = this;
    _this.loadedCount = 0;
    var data = jsondata.nodes;
    var shapeCount = data.length;
    _this.devSwitch = jsondata.devSwitch;

    function onImportComplete(flag) {
        console.log('on import complete');
        _this.loadedCount++;
    }

    for (var i = 0; i < data.length; i++) {
        var v = data[i];
        this._importShape(v.id, v.type, v.subType, v.properties.name, v.x, v.y, v.outputs, v.properties, onImportComplete);

    }
    this._createGridLine();

    (function myLoop(i) {
        setTimeout(function () {
            console.log('import data, waiting onload', i, _this.loadedCount, shapeCount); //  your code here
            //load output hock
            --i;
            if (_this.loadedCount !== shapeCount) {

                if (i > 0) {
                    myLoop(i);
                } else if (i <= 0) {
                    alert('导入json数据失败');
                    console.log('data', data);
                }
            } else {
                // console.log('loaded',_this.loadedCount, shapeCount, data);
                _this._loadLinks(data);
                _this._createChosenRect();
                // _this._createTransformer();
                _this.mainLayer.batchDraw();

            }
        }, 100)
    })(100);

}


NextFlow.prototype.on = function (event, callback) {
    this.events[event] = callback;
}

NextFlow.prototype.destroyChildren = function () {
    this.mainLayer.destroyChildren();
    this.gridLayer.destroyChildren();
    this._diagrams = [];
}

NextFlow.prototype.deleteDiagram = function (diagram) {
    delete this._diagrams[diagram.id];
    diagram._destroy();
    this.mainLayer.batchDraw();
}
NextFlow.prototype.copyDiagram = function (diagram) {
    // delete this._diagrams[diagram.id];
    var cdiagram = this._newDiagram();
    // var imgfile = require('@/assets/icon/'+diagram.type+'.jpg');
    var imgfile = require('@/assets/icon/' + diagram.type + '.svg');
    var _this = this;
    function onClick(e) {
        var call = _this.events.click;
        if (call) {
            console.log('click create', e, this);
            call(e);
        }
    }

    cdiagram.properties = diagram.properties;

    cdiagram.createConnector(diagram.type, diagram.subType, imgfile, diagram.title, diagram.shape.attrs.x + 50, diagram.shape.attrs.y + 50, diagram.outputs.length, onClick);

    return cdiagram;
}

NextFlow.prototype.deleteGreenCircle = function () {
    this._diagrams.forEach(diagram => {
        diagram._destroyGreenCircle();
    })
    this.mainLayer.batchDraw();
}
NextFlow.prototype.deleteChosenCircle = function () {
    this._diagrams.forEach(diagram => {
        diagram._destroyChosenCircle();
    })
    this.mainLayer.batchDraw();
}

NextFlow.prototype.zoomOut = function () {
    this.scale += 0.1;
    this.mainLayer.scale({
        x: this.scale,
        y: this.scale
    });
    this.tempLayer.scale({
        x: this.scale,
        y: this.scale
    });
    this.gridLayer.scale({
        x: this.scale,
        y: this.scale
    });
    this.gridLayer.draw();
    this.mainLayer.draw();
}

NextFlow.prototype.zoomIn = function () {
    this.scale -= 0.1;
    this.mainLayer.scale({
        x: this.scale,
        y: this.scale
    });
    this.tempLayer.scale({
        x: this.scale,
        y: this.scale
    });
    this.gridLayer.scale({
        x: this.scale,
        y: this.scale
    });
    this.gridLayer.draw();
    this.mainLayer.draw();
}

NextFlow.prototype.zoomZero = function () {
    this.scale = 1;
    this.mainLayer.scale({
        x: this.scale,
        y: this.scale
    });
    this.tempLayer.scale({
        x: this.scale,
        y: this.scale
    });
    this.mainLayer.draw();
}

NextFlow.prototype.getArgs = function () {
    var start = null;
    Object.entries(this._diagrams).map(([k, diagram]) => {
        if (diagram.type === 'startV4') {
            start = diagram;
        }
    });
    if (start === null) {
        return [];
    }
    var properties = start.properties;
    var args = [];
    console.log('properties', properties);
    if (properties.arguments) {
        for (var i = 0; i < properties.arguments.length; i++) {
            let arg = properties.arguments[i];
            console.log('arg', arg);
            args.push({ name: arg.name, title: arg.title });
        }
    }
    return args;
}
NextFlow.prototype.getInputs = function () {
    var start = null;
    Object.entries(this._diagrams).map(([k, diagram]) => {
        if (diagram.type === 'startV4') {
            start = diagram;
        }
    });
    if (start === null) {
        return [];
    }
    var properties = start.properties;
    var args = [];
    console.log('properties', properties);
    if (properties.inputs) {
        for (var i = 0; i < properties.inputs.length; i++) {
            let arg = properties.inputs[i];
            console.log('arg', arg);
            args.push({ name: arg.name, type: arg.type, value: arg.value });
        }
    }
    return args;
}

NextFlow.prototype.getDiagramsById = function (id) {
    let diagramsAttrs = this._diagrams[id].shape.attrs
    this.deleteGreenCircle();
    this._diagrams[id].createGreenCircle(diagramsAttrs.x, diagramsAttrs.y)
    return this._diagrams[id];
}



function __set_arrow_position(arrow, x, y) {
    arrow.x(x);
    arrow.y(y);
    if (arrow.titleText) {
        arrow.titleText.x(x - ArrowDefaultTextOffsetX);
        arrow.titleText.y(y - ArrowDefaultTextOffsetY);
    }
}

function __set_arrow_m_title(arrow, title) {
    if (arrow && arrow.titleText) {
        arrow.title = title;
        arrow.titleText.text(title);
    }
}

/**
 * 和流程 的进行区分，通过竖着来
 * @param {}} from 
 * @param {*} to 
 * @returns 
 */
function __get_vertical_connector_points(from, to) {
    var points = [];
    const fromx = from.x + 16;
    const fromy = from.y + 32;
    const tox = to.x;
    const toy = to.y;

    const dx = tox - fromx;
    const dy = toy - fromy;

    points.push(fromx);
    points.push(fromy);
    // if (dx > 0) {
    //     var midx = fromx + dx / 2;
    //     if (dx > 100) {
    //         midx = fromx + 50;
    //     }


    //     const midy = fromy + dy;

    //     if (dy != 0) {
    //         points.push(midx);
    //         points.push(fromy);
    //         points.push(midx);
    //         points.push(midy);
    //     }
    // } else {
    //     points.push(fromx + 32);
    //     points.push(fromy);
    //     if (dy >= 0) {
    //         points.push(fromx + 32);
    //         points.push(fromy + 50);

    //         points.push(tox - 16);
    //         points.push(fromy + 50);

    //         points.push(tox - 16);
    //         points.push(toy);
    //     } else {
    //         points.push(fromx + 32);
    //         points.push(fromy - 50);

    //         points.push(tox - 16);
    //         points.push(fromy - 50);

    //         points.push(tox - 16);
    //         points.push(toy);
    //     }

    // }
    points.push(tox);
    points.push(toy);

    return points;

}
function __get_connector_points(from, to) {
    var points = [];
    const fromx = from.x + DiagramWidth - 5;
    const fromy = from.y + 34;
    const tox = to.x - 4;
    const toy = to.y;

    const dx = tox - fromx;
    const dy = toy - fromy;

    points.push(fromx);
    points.push(fromy);

    if (dx > 0) {
        var midx = fromx + dx / 2;
        if (dx > 100) {
            midx = fromx + 50;
        }


        const midy = fromy + dy;

        if (dy != 0) {
            points.push(midx);
            points.push(fromy);
            points.push(midx);
            points.push(midy);
        }
    } else {
        points.push(fromx + 32);
        points.push(fromy);
        if (dy >= 0) {
            points.push(fromx + 32);
            points.push(fromy + 50);

            points.push(tox - 16);
            points.push(fromy + 50);

            points.push(tox - 16);
            points.push(toy);
        } else {
            points.push(fromx + 32);
            points.push(fromy - 50);

            points.push(tox - 16);
            points.push(fromy - 50);

            points.push(tox - 16);
            points.push(toy);
        }

    }

    points.push(tox);
    points.push(toy);

    return points;

}

function __arrow_hock_shape(target, input) {
    for (var i = 0; i < target.diagram.inputs.length; i++) {
        if (target.diagram.inputs[i]._id === input._id) {
            return;
        }
    }
    if (input._m_isArrow) {
        input._m_isLinked = true;
        input._m_linkedShape = target;
    }
    target.diagram.inputs.push(input);
}
function getVariableValue(variable) {
    if (variable.category && variable.name) {
        return variable.category + "/" + variable.name;
    } else if (variable.category) {
        return variable.category;
    } else if (variable.name) {
        return variable.name;
    } else if (variable.value) {
        return variable.value;
    }
    return "";
}
function showDetailTitle(properties, type, title) {
    var introTitle = title;
    if (properties) {
        if (type == 'if') {
            if (properties.left_value && properties.right_value) {
                introTitle = title + "\n" + getVariableValue(properties.left_value) + properties.op + getVariableValue(properties.right_value);
            }
        } else if (type == "route") {
            // TODO arrow
            if (properties.property) {
                introTitle = title + "\n" + getVariableValue(properties.property);
            }
        } else if (type == "loop") {
            if (properties.source && properties.source) {
                introTitle = title + "\n" + getVariableValue(properties.source) + "\n" + getVariableValue(properties.target);
            }
        } else if (type == "dataprocess") {
            if (properties.steps) {
                properties.steps.forEach(step => {
                    introTitle = introTitle + "\n" + getVariableValue(step.target);
                });
            }
        } else if (type == "return") {
            if (properties.results) {
                properties.results.forEach(result => {
                    introTitle = introTitle + "\n" + getVariableValue(result);
                });
            }
        } else if (type == "connector" || type == "connectorV3") {
            if (properties.opType == "query") {
                // 查询 要区分是结果集还是表
                if (properties.loader_type == 'dataSet') {
                    introTitle = introTitle + "\n" + "[查询]" + properties.dataSetName;
                } else {
                    introTitle = introTitle + "\n" + "[查询]" + properties.tableName;
                }
                introTitle = introTitle + "\n" + getVariableValue(properties.target);
                if (properties.sourceList) {
                    properties.sourceList.forEach(source => {
                        introTitle = introTitle + "\n" + source.field;
                    });
                }
            } else if (properties.opType == "insert") {
                introTitle = introTitle + "\n" + "[插入]" + properties.tableName + "\n";
                if (properties.setList) {
                    properties.setList.forEach(setItem => {
                        introTitle = introTitle + setItem.name + ",";
                    });
                    introTitle = introTitle.substring(0, introTitle.length - 1);
                }
            } else if (properties.opType == "update") {
                introTitle = introTitle + "\n" + "[修改]" + properties.tableName + "\n";
                if (properties.setList) {
                    properties.setList.forEach(setItem => {
                        introTitle = introTitle + setItem.name + ",";
                    });
                    introTitle = introTitle.substring(0, introTitle.length - 1);
                }
                if (properties.sourceList) {
                    properties.sourceList.forEach(source => {
                        introTitle = introTitle + "\n" + source.field;
                    });
                }
            } else if (properties.opType == "delete") {
                introTitle = introTitle + "\n" + "[删除]" + properties.tableName;
                if (properties.sourceList) {
                    properties.sourceList.forEach(source => {
                        introTitle = introTitle + "\n" + source.field;
                    });
                }
            } else if (properties.opType == "diy") {
                introTitle = introTitle + "\n" + "[自定义]" + properties.dataSourceName;
                introTitle = introTitle + "\n" + getVariableValue(properties.target);
            }
        }
    }
    return introTitle;
}
function getMenuInfo(menuType) {
    let menuInfo = {
        name: "",
        color: "",
    }
    if (menuType === 'start') {
        menuInfo.name = "开始"
        menuInfo.color = "#FF9944"
    }
    console.log("getMenuInfo", menu, menuType, workFlowList);
    workFlowList && workFlowList.forEach(menuItem => {
        menuItem.componentList.forEach(componentItem => {
            if (componentItem.type == menuType) {
                menuInfo.name = componentItem.name
                menuInfo.color = componentItem.color

            }
        })
    })
    return menuInfo;
}
export default NextFlow;
