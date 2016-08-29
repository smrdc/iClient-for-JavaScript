/**
 * @requires SuperMap/Control/DragFeature.js
 * @requires SuperMap/Control/SelectFeature.js
 */

/**
 * Class: SuperMap.Control.PlottingEdit
 * 鼠标编辑动态标绘标号类。该控件激活时，单击即可选中标号，被选中的标号将显示其控制点及比例点，拖拽这些点以编辑标号，拖拽符号本身平移标号。
 *
 * 通过 active 和 deactive 两个方法，实现动态的激活和注销。
 * * 激活控件，方法如下:
 * (code)
 * plottingEdit.activate();
 * (end)
 *
 * 注销控件，方法如下：
 * (code)
 * plottingEdit.deactivate();
 * (end)
 *
 * Inherits From:
 *  - <SuperMap.Control>
 */
SuperMap.Control.PlottingEdit = SuperMap.Class(SuperMap.Control, {
    /**
     * Constant: EVENT_TYPES
     * 支持的事件类型:
     *  - *beforefeaturemodified* 当图层上的要素（标号）开始编辑前触发该事件。
     *  - *featuremodified* 当图层上的要素（标号）编辑时触发该事件。
     *  - *afterfeaturemodified* 当图层上的要素（标号）编辑完成时，触发该事件。
     */
    EVENT_TYPES: ["beforefeaturemodified", "featuremodified", "afterfeaturemodified"],

    /**
     * APIProperty: clickout
     * {Boolean} 是否在要素区域外点击鼠标，取消选择要素。默认为true。
     */
    clickout: true,

    /**
     * APIProperty: controlPointsStyle
     * {Object} 控制点风格。
     *
     * controlPointsStyle的可设属性如下：
     * fillColor - {String} 十六进制填充颜色，默认为"#ee9900"。
     * fillOpacity - {Number} 填充不透明度。默认为0.4。
     * strokeColor - {String} 十六进制描边颜色。
     * strokeOpacity - {Number} 描边的不透明度(0-1),默认为1.0。
     * strokeWidth - {Number} 像素描边宽度，默认为1。
     * pointRadius - {Number} 像素点半径，默认为6
     */
    controlPointsStyle: null,

    /**
     * APIProperty: scalePointsStyle
     * {Object} 比例点 style。
     *
     * scalePointsStyle的可设属性如下：
     * fillColor - {String} 十六进制填充颜色，默认为"#ffff00"。
     * fillOpacity - {Number} 填充不透明度。默认为1.0。
     * strokeColor - {String} 十六进制描边颜色，默认为"#ffff00"。
     * strokeOpacity - {Number} 描边的不透明度(0-1),默认为1.0。
     * strokeWidth - {Number} 像素描边宽度，默认为1。
     * pointRadius - {Number} 像素点半径，默认为6
     */
    scalePointsStyle: null,

    /**
     * Property: defaultControlPointStyle
     * {Boolean} 控制点默认 style。
     */
    defaultControlPointStyle: {
        fillColor: "#ee9900",
        fillOpacity: 0.4,
        strokeColor: "#ee9900",
        strokeOpacity: 1,
        strokeWidth: 1,
        pointRadius: 6
    },

    /**
     * Property: defaultScalePointStyle
     * {Boolean} 控制点默认 style。
     */
    defaultScalePointStyle: {
        fillColor: "#ffff00",
        fillOpacity: 1,
        strokeColor: "#ffff00",
        strokeOpacity: 1,
        strokeWidth: 1,
        pointRadius: 6
    },

    /**
     * Property: controlPoints
     * 标号的控制点
     */
    controlPoints: [],

    /**
     * Property: controlPoints
     * 点标号的旋转点
     */
    rotatePoint: null,

    /**
     * Property: controlPoints
     * 线面标号的比例点
     */
    scalePoints: [],

    /**
     * Property: layer
     * {<SuperMap.Layer.Vector>}
     */
    layer: null,

    /**
     * Property: feature
     * {<SuperMap.Feature.Vector>} Feature（plotting symbol）currently available for modification.
     */
    feature: null,

    /**
     * Property: selectControl
     * {<SuperMap.Control.SelectFeature>}
     */
    selectControl: null,

    /**
     * Property: dragControl
     * {<SuperMap.Control.DragFeature>}
     */
    dragControl: null,

    /**
     * Property: modified
     * {Boolean} The currently selected feature has been modified.
     */
    modified: false,

    /**
     * Property: dragStartScale
     * {float} 拖拽开始的缩放比例.
     */
    dragStartScale: null,

    /**
     * Property: dragStartRotate
     * {float} 拖拽开始的旋转角度.
     */
    dragStartRotate: null,

    /**
     * Constructor: SuperMap.Control.PlottingEdit
     * 创建该控件的新实例。
     *
     * Parameters:
     * layer - {<SuperMap.Layer.PlottingLayer>} 执行编辑的图层。
     * options - {Object} 设置该类开放的属性值。
     *
     * 创建 PlottingEdit 控件新实例的方法如下所示：
     * (start code)
     * //定义一个矢量图层 vectorLayer 进行符号的编辑
     * var plottingLayer = new SuperMap.Layer.PlottingLayer("plottingLayer");
     * //实例化一个 plottingEdit 控件
     * var plottingEdit = new SuperMap.Control.PlottingEdit(plottingLayer);
     * //地图上添加控件
     * map.addControl(plottingEdit);
     * //激活 plottingEdit 控件
     * plottingEdit.activate();
     * (end)
     */
    initialize: function (layer, options) {
        options = options || {};
        this.layer = layer;
        this.layer.plottingEdit = this;
        this.controlPoints = [];
        this.scalePoints = [];
        SuperMap.Control.prototype.initialize.apply(this, [options]);

        var control = this;

        // configure the select control
        var selectOptions = {
            clickout: this.clickout,
            toggle: false,
            onBeforeSelect: this.beforeSelectFeature,
            onSelect: this.selectFeature,
            onUnselect: this.unselectFeature,
            scope: this
        };
        this.selectControl = new SuperMap.Control.SelectFeature(
            layer, selectOptions
        );

        // configure the drag control
        var dragOptions = {
            onStart: function (feature, pixel) {
                control.dragStart.apply(control, [feature, pixel]);
            },
            onDrag: function (feature, pixel) {
                control.dragControlPoint.apply(control, [feature, pixel]);
            },
            onComplete: function (feature) {
                control.dragComplete.apply(control, [feature]);
            },
            featureCallbacks: {
                over: function (feature) {
                    control.dragControl.overFeature.apply(
                        control.dragControl, [feature]);
                }
            }
        };
        this.dragControl = new SuperMap.Control.DragFeature(
            layer, dragOptions
        );

        //this.layer.map.events.on("moveend",this.layerMoveEnd());
        this.layer.events.register("moveend", this, this.layerMoveEnd);
        layer.plotEdit = this;
    },

    /**
     * Method: destroy
     * 图层缩放 重新计算控制点
     */
    layerMoveEnd: function(){
        this.resetControlPoints();
    },

    /**
     * APIMethod: destroy
     * 销毁该类，释放空间。
     */
    destroy: function () {
        this.controlPoints = [];
        this.rotatePoint = null;
        this.scalePoints = [];
        this.layer = null;
        this.selectControl.destroy();
        this.dragControl.destroy();
        SuperMap.Control.prototype.destroy.apply(this, []);
    },

    /**
     * APIMethod: activate
     * 激活该控件。
     *
     * Returns:
     * {Boolean} 激活控件是否成功。
     */
    activate: function () {
        if(!this.layer.isLocked){
            return (this.selectControl.activate() &&
            SuperMap.Control.prototype.activate.apply(this, arguments));
        }
        else {
            this.clearSelectFeatures();
        }
    },

    /**
     * APIMethod: deactivate
     * 取消激活控件，使其不可用。
     *
     * Returns:
     * {Boolean} 返回操作是否成功。
     */
    deactivate: function () {
        var deactivated = false;
        // the return from the controls is unimportant in this case
        if (SuperMap.Control.prototype.deactivate.apply(this, arguments)) {
            this.layer.removeFeatures(this.controlPoints, {silent: true});
            this.layer.removeFeatures(this.scalePoints, {silent: true});
            this.layer.removeFeatures(this.rotatePoint, {silent: true});
            this.controlPoints = [];
            this.scalePoints = [];
            this.rotatePoint = null;
            this.dragControl.deactivate();
            var feature = this.feature;
            var valid = feature && feature.geometry && feature.layer;

            if (valid) {
                this.selectControl.unselect.apply(this.selectControl,
                    [feature]);
            }
            this.selectControl.deactivate();

            deactivated = true;
        }
        return deactivated;
    },

    /**
     * Method: isPlottingGeometry
     * 判断是否是标绘对象
     */
    isPlottingGeometry: function (feature) {
        if (feature.geometry instanceof SuperMap.Geometry.GeoGraphicObject.DotSymbol ||
            feature.geometry instanceof SuperMap.Geometry.GeoGraphicObject.AlgoSymbol){
            return true;
        }
        else {
            return false;
        }
    },

    /**
     * Method: deleteSelectFeature
     * 删除标绘扩展符号 (选中)
     *
     * Returns:
     * {Boolean} 返回操作是否成功。
     */
    deleteSelectFeature: function () {
        if (this.feature && this.controlPoints && this.controlPoints.length > 0) {
            this.layer.destroyFeatures(this.feature);
			if(null !== this.controlPoints){
				this.layer.destroyFeatures(this.controlPoints);
			}
			if(null !== this.scalePoints){
				this.layer.destroyFeatures(this.scalePoints);
			}
			if(null !== this.rotatePoint){
				this.layer.destroyFeatures(this.rotatePoint);
			}
            this.unselectFeature(this.feature);
            return true;
        }
        else {
            return false;
        }
    },

    /**
     * Method: selectFeature
     * 选择需要编辑的要素。
     *
     * Parameters:
     * feature - {<SuperMap.Feature.Vector>} 要选中的要素。
     */
    selectFeature: function (feature) {
        if(this.layer.isLocked){
            this.clearSelectFeatures();
            return;
        }

        if (this.beforeSelectFeature(feature) !== false) {
            if (this.isPlottingGeometry(feature)) {
                this.feature = feature;
                this.modified = false;
                this.resetControlPoints();
                this.dragControl.activate();

                this.feature.geometry.feature = this.feature;
            }
        }
    },

    /**
     * Method: unselectFeature
     * 取消选择编辑的要素。
     *
     * Parameters:
     * feature - {<SuperMap.Feature.Vector>} The unselected feature.
     */
    unselectFeature: function (feature) {
        this.layer.removeFeatures(this.controlPoints, {silent: true});
        this.layer.removeFeatures(this.scalePoints, {silent: true});
        this.layer.removeFeatures(this.rotatePoint, {silent: true});
        this.controlPoints = [];
        this.scalePoints = [];
        this.rotatePoint = null;
        this.feature = null;
        this.dragControl.deactivate();
        this.layer.events.triggerEvent("afterfeaturemodified", {
            feature: feature,
            modified: this.modified
        });
        this.modified = false;
    },

    /**
     * Method: beforeSelectFeature
     * Called before a feature is selected.
     *
     * Parameters:
     * feature - {<SuperMap.Feature.Vector>} The feature（plotting symbol） about to be selected.
     */
    beforeSelectFeature: function (feature) {
        this.otherLayerUnSelectFeatures();
        return this.layer.events.triggerEvent(
            "beforefeaturemodified", {feature: feature}
        );
    },

    /**
     * Method: dragStart
     * Called by the drag feature control with before a feature is dragged.
     *
     * Parameters:
     * feature - {<SuperMap.Feature.Vector>} The control point or plotting symbol about to be dragged.
     * pixel - {<SuperMap.Pixel>} Pixel location of the mouse event.
     */
    dragStart: function (feature, pixel) {
        if(!this.layer.isEditable || this.layer.isLocked){
            this.clearSelectFeatures();
            return;
        }

        if (feature != this.feature && (this.isPlottingGeometry(feature)) && (this.isPlottingGeometry(this.feature))) {
            if (this.feature) {
                this.selectControl.clickFeature.apply(this.selectControl,
                    [this.feature]);
            }
            this.selectControl.clickFeature.apply(
                this.selectControl, [feature]);
            this.dragControl.overFeature.apply(this.dragControl,
                [feature]);
            this.dragControl.lastPixel = pixel;
            this.dragControl.handlers.drag.started = true;
            this.dragControl.handlers.drag.start = pixel;
            this.dragControl.handlers.drag.last = pixel;
        }

        this.dragStartRotate = this.feature.geometry.getRotate();
        this.dragStartScale = this.feature.geometry.getScale();
        this._dragPixel = pixel;
        //鼠标手势，IE7、8中需重新设置cursor
        SuperMap.Element.removeClass(this.map.viewPortDiv, "smDragDown");
        this.map.viewPortDiv.style.cursor = "pointer";
    },

    /**
     * Method: dragControlPoint
     * Called by the drag feature control with each drag move of a control point or a plotting symbol.
     *
     * Parameters:
     * cp - {<SuperMap.Feature.Vector>} The control point being dragged.
     * pixel - {<SuperMap.Pixel>} Pixel location of the mouse event.
     */
    dragControlPoint: function (cp, pixel) {
        if(this.layer.isLocked){
            this.clearSelectFeatures();
            return;
        }

        var geo = this.feature.geometry;
        if(geo.symbolType === SuperMap.Plot.SymbolType.DOTSYMBOL){
            this.dragControlPointForDot(cp,pixel);
        }
        else {
            this.dragControlPointForAlgo(cp,pixel);
        }
    },

    /**
     * Method: dragControlPointForDot
     * 点标号的处理 （旋转 放大缩小 平移）
     *
     * Parameters:
     * cp - {<SuperMap.Feature.Vector>} The control point being dragged.
     * pixel - {<SuperMap.Pixel>} Pixel location of the mouse event.
     */
    dragControlPointForDot: function(cp,pixel){
        //拖拽控制点时编辑符号，拖拽符号本身时平移符号（平移符号的所有控制控制点）
        if (cp.geometry.CLASS_NAME == "SuperMap.Geometry.Point") {
            this.modified = true;
            //拖拽控制点过程中改变符号的Geometry
            //平移的时候不显示控制点
            var geo = this.feature.geometry;

            //当前位置
            var lonLat = this.layer.getLonLatFromViewPortPx(pixel);
            //拖拽开始的位置
            var ll = this.layer.getLonLatFromViewPortPx(this._dragPixel);


            //定位点的像素位置
            var bound = geo.getBounds();
            var centerPixel = this.layer.map.getPixelFromLonLat(bound.getCenterLonLat());
            var lpLonlat = new SuperMap.LonLat(geo.locationPoints[0].x, geo.locationPoints[0].y);
            var lpPixel = this.layer.map.getPixelFromLonLat(lpLonlat);
            if(cp.geometry.isRotatePoint && cp.geometry.isRotatePoint === true) {
                //旋转
                var x = (pixel.x - lpPixel.x) - (this._dragPixel.x - lpPixel.x);
                var y = (pixel.y - lpPixel.y) - (this._dragPixel.y - lpPixel.y);
                if (x !== 0 && y !== 0) {
                    //旋转角度，单位是弧度
                    var dRadian = (Math.atan2(this._dragPixel.y-lpPixel.y, this._dragPixel.x-lpPixel.x)-Math.atan2(pixel.y-lpPixel.y, pixel.x-lpPixel.x));
                    //将弧度转换为角度
                    var dAngle = dRadian * 180 / Math.PI;

                    geo.setRotate(dAngle + this.dragStartRotate);
                }
            }
            else {
                //放大缩小
                if (this._dragPixel.x !== pixel.x || this._dragPixel.y !== pixel.y) {
                    //var scalex = (pixel.x - lpPixel.x) / (this._dragPixel.x - lpPixel.x);
                    //var scaley = (pixel.y - lpPixel.y) / (this._dragPixel.y - lpPixel.y);
                    //var scale = Math.abs(scaley) > Math.abs(scalex) ? scaley : scalex;
                    var baseDis = SuperMap.Plot.PlottingUtil.distance(this._dragPixel,lpPixel);
                    var currentDis = SuperMap.Plot.PlottingUtil.distance(pixel,lpPixel);
                    var scale = currentDis / baseDis;

                    scale = this.dragStartScale * scale;
                    if(scale >= 0.64 && scale <= 5){
                        geo.setScale(scale);
                    }
                }
            }

            this.resetControlPoints();
            //绘制符号及控制点
            this.layer.drawFeature(this.feature);
        }
        else if (this.isPlottingGeometry(cp)) {
            this.modified = true;

            //平移的时候不显示控制点
            this.layer.removeFeatures(this.controlPoints, {silent: true});
            this.layer.removeFeatures(this.rotatePoint, {silent: true});

            //当前位置
            var lonLat = this.layer.getLonLatFromViewPortPx(pixel);
            //拖拽开始的位置
            var ll = this.layer.getLonLatFromViewPortPx(this._dragPixel);

            var geo = this.feature.geometry;

            ////// 重新计算定位点
            geo.locationPoints[0].x += lonLat.lon - ll.lon;
            geo.locationPoints[0].y += lonLat.lat - ll.lat;

            geo.handleAnnotation();
            this._dragPixel = pixel;
        }
    },

    /**
     * Method: dragControlPointForAlgo
     * 线面标号的编辑处理
     *
     * Parameters:
     * cp - {<SuperMap.Feature.Vector>} The control point being dragged.
     * pixel - {<SuperMap.Pixel>} Pixel location of the mouse event.
     */
    dragControlPointForAlgo:function(cp, pixel){
        //拖拽控制点时编辑符号，拖拽符号本身时平移符号（平移符号的所有控制控制点）
        if (cp.geometry.CLASS_NAME == "SuperMap.Geometry.Point") {
            this.modified = true;
            //拖拽控制点过程中改变符号的Geometry
            var geo = this.feature.geometry;

                // 获取数据成功
                function getCompleted(result){
                    //var style = geo.symbolData.style;
                    //var textStyle = geo.symbolData.textStyle2D;
                    geo.symbolData.innerCells = result.originResult.innerCells;
                    geo.symbolData.scalePoints = result.originResult.scalePoints;
                    geo.symbolData.scaleValues = result.originResult.scaleValues;
                    //geo.symbolData.style = style;
                    //geo.symbolData.textStyle2D = textStyle;

                    //存储当前geometry 中的ids
                    var ids = [];
                    for(var i = 0; i < geo.components.length; i++){
                        ids.push(geo.components[i].id)
                    }
                    geo.calculateParts();
                    //还原ids
                    for(var i = 0; i < geo.components.length; i++){
                        geo.components[i].id = ids[i];
                    }

                    for(var j = 0; j < this.scalePoints.length; j++){
                        this.scalePoints[j].geometry.x = geo.scalePoints[j].x;
                        this.scalePoints[j].geometry.y = geo.scalePoints[j].y;
                    }

                    //绘制符号及控制点
                    this.layer.renderer.clear();
                    this.layer.drawFeature(this.feature, this.feature.style, {isSelected:true});
                    this.layer.drawFeature(cp);
                    this.layer.drawFeatures(this.scalePoints);
                }

                //获取数据失败
                function getFailed(result){
                    console.log(result);
                }

                //对接iserver中的服务
                var getSymbolInfo = new SuperMap.REST.GetSymbolInfoService(this.layer.serverUrl);
                getSymbolInfo.events.on({
                    "processCompleted": getCompleted,
                    "processFailed": getFailed,
                    scope: this
                });

                var getSymbolInfoParams = new SuperMap.REST.GetSymbolInfoParameters();
                getSymbolInfoParams.libID = geo.libID;
                getSymbolInfoParams.code = geo.code;
                if( cp.geometry.isScalePoint === true ) {
                    getSymbolInfoParams.inputPoints = geo.controlPoints;
                    getSymbolInfoParams.scalePoints = geo.scalePoints;
                    getSymbolInfoParams.scaleValues = geo.scaleValues;
                    getSymbolInfoParams.newScalePoint = cp.geometry;
                    getSymbolInfoParams.newScalePointIndex = cp.geometry.tag;
                } else {
                    if(geo.symbolType === SuperMap.Plot.SymbolType.REGULARPOLYGON) {
                        var tempControlPoints = this.getCpGeos();
                        geo.controlPoints[0] = tempControlPoints[0];
                        geo.controlPoints[geo.controlPoints.length-1] = tempControlPoints[1];
                    } else {
                        geo.controlPoints = this.getCpGeos();
                    }
                    getSymbolInfoParams.inputPoints = geo.controlPoints;
                    getSymbolInfoParams.scaleValues = geo.scaleValues;
                }
                getSymbolInfoParams.subSymbols = geo.subSymbols;
                getSymbolInfo.processAsync(getSymbolInfoParams);

        }
        else if (this.isPlottingGeometry(cp)) {
            this.modified = true;

            //平移的时候不显示控制点
            this.layer.removeFeatures(this.controlPoints, {silent: true});
            this.layer.removeFeatures(this.scalePoints, {silent: true});

            //当前位置
            var lonLat = this.layer.getLonLatFromViewPortPx(pixel);
            //拖拽开始的位置
            var ll = this.layer.getLonLatFromViewPortPx(this._dragPixel);

            //重新计算控制点
            var cps = this.getCpGeos();
            for (var i = 0, len = cps.length; i < len; i++) {
                var cp = cps[i];
                //平移控制点（符号geometry的平移在拖拽控件中完成）
                cp.x += lonLat.lon - ll.lon;
                cp.y += lonLat.lat - ll.lat;
            }

            var sps = this.getSpGeos();
            for (var j = 0, len = sps.length; j < len; j++) {
                var sp = sps[j];
                //平移控制点（符号geometry的平移在拖拽控件中完成）
                sp.x += lonLat.lon - ll.lon;
                sp.y += lonLat.lat - ll.lat;
            }
            var geo = this.feature.geometry;
            geo.controlPoints = cps;
            geo.scalePoints = sps;

            for(var k = 0; k < geo.symbolData.innerCells.length; k++){
                for(var n = 0; n < geo.symbolData.innerCells[k].positionPoints.length; n++){
                    geo.symbolData.innerCells[k].positionPoints[n].x += lonLat.lon - ll.lon;
                    geo.symbolData.innerCells[k].positionPoints[n].y += lonLat.lat - ll.lat;
                }
            }

            for(var m = 0; m < geo.symbolData.scalePoints.length; m++){
                geo.symbolData.scalePoints[m].x += lonLat.lon - ll.lon;
                geo.symbolData.scalePoints[m].y += lonLat.lat - ll.lat;
            }

            this._dragPixel = pixel;

            geo.clearBounds();
        }
    },

    /**
     * Method: dragComplete
     * Called by the drag feature control when the dragging is complete.
     */
    dragComplete: function () {
        if(this.layer.isLocked){
            this.clearSelectFeatures();
            return;
        }

        delete this._dragPixel;
        this.resetControlPoints();
        this.setFeatureState();
        this.feature.geometry.rotateAngle =Number(this.feature.geometry.rotateAngle) - Number(this.rotateAngle );
        this.feature.geometry.rotateAnglePre= Number(this.feature.geometry.rotateAnglePre )- Number(this.rotateAngle);
        this.layer.events.triggerEvent("featuremodified",
            {feature: this.feature});
    },

    /**
     * Method: setFeatureState
     * Called when the feature is modified.  If the current state is not
     *     INSERT or DELETE, the state is set to UPDATE.
     */
    setFeatureState: function () {
        if (this.feature.state != SuperMap.State.INSERT &&
            this.feature.state != SuperMap.State.DELETE) {
            this.feature.state = SuperMap.State.UPDATE;
        }
    },

    /**
     * Method: resetControlPoints
     * 重设控制点
     */
    resetControlPoints: function () {
        //移除当前控制点
        if (this.controlPoints.length > 0) {
            this.layer.removeFeatures(this.controlPoints, {silent: true});
            this.layer.removeFeatures(this.scalePoints, {silent: true});
            this.layer.removeFeatures(this.rotatePoint, {silent: true});
            this.controlPoints = [];
            this.scalePoints = [];
            this.rotatePoint = null;
        }
        //重设控制点
        this.collectControlPoints();
    },

    /**
     * Method: collectControlPoints
     * Collect the control points from the modifiable plotting symbol's Geometry and push
     *     them on to the control's controlPoints array.
     */
    collectControlPoints: function () {
        if (!this.feature || !this.feature.geometry) return;
        this.controlPoints = [];
        this.scalePoints = [];
        this.rotatePoint = null;
        var control = this;

        //重设符号 Geometry 的 控制点
        function collectGeometryControlPoints(geometry) {
            var i, controlPoi, cp;
            if (geometry instanceof SuperMap.Geometry.GeoGraphicObject.DotSymbol ||
                geometry instanceof SuperMap.Geometry.GeoGraphicObject.AlgoSymbol) {
                if(geometry.symbolType === SuperMap.Plot.SymbolType.REGULARPOLYGON){
                    var centerControlPoi = new SuperMap.Feature.Vector(geometry.controlPoints[0]);
                    centerControlPoi._sketch = true;
                    centerControlPoi.style = SuperMap.Util.copyAttributes(centerControlPoi.style, control.defaultControlPointStyle);
                    if (control.controlPointsStyle) {
                        centerControlPoi.style = SuperMap.Util.copyAttributes(centerControlPoi.style, control.controlPointsStyle);
                    }
                    control.controlPoints.push(centerControlPoi);

                    var radiusControlPoi = new SuperMap.Feature.Vector(geometry.controlPoints[geometry.controlPoints.length-1]);
                    radiusControlPoi._sketch = true;
                    radiusControlPoi.style = SuperMap.Util.copyAttributes(radiusControlPoi.style, control.defaultControlPointStyle);
                    if (control.controlPointsStyle) {
                        radiusControlPoi.style = SuperMap.Util.copyAttributes(radiusControlPoi.style, control.controlPointsStyle);
                    }
                    control.controlPoints.push(radiusControlPoi);
                } else {
                    var numCont = geometry.controlPoints.length;
                    for (i = 0; i < numCont; ++i) {
                        cp = geometry.controlPoints[i];
                        if (cp.CLASS_NAME == "SuperMap.Geometry.Point") {
                            controlPoi = new SuperMap.Feature.Vector(cp);
                            controlPoi._sketch = true;
                            controlPoi.style = SuperMap.Util.copyAttributes(controlPoi.style, control.defaultControlPointStyle);
                            if (control.controlPointsStyle) {
                                controlPoi.style = SuperMap.Util.copyAttributes(controlPoi.style, control.controlPointsStyle);
                            }
                            control.controlPoints.push(controlPoi);
                        }
                    }
                }
            }

            //线面标号的 比例点
            if(geometry instanceof SuperMap.Geometry.GeoGraphicObject.AlgoSymbol && geometry.scalePoints !== null){
                for (var j = 0; j < geometry.scalePoints.length; j++){
                    cp = geometry.scalePoints[j];
                    if (cp.CLASS_NAME == "SuperMap.Geometry.Point") {
                        controlPoi = new SuperMap.Feature.Vector(cp);
                        controlPoi._sketch = true;
                        controlPoi.style = SuperMap.Util.copyAttributes(controlPoi.style, control.defaultScalePointStyle);
                        if (control.scalePointsStyle) {
                            controlPoi.style = SuperMap.Util.copyAttributes(controlPoi.style, control.scalePointsStyle);
                        }
                        control.scalePoints.push(controlPoi);
                    }
                }
            }

            //点标号的旋转点
            if(geometry instanceof SuperMap.Geometry.GeoGraphicObject.DotSymbol && geometry.rotatePoint !== null){
               var rp = geometry.rotatePoint;
                if(rp.CLASS_NAME == "SuperMap.Geometry.Point"){
                    controlPoi = new SuperMap.Feature.Vector(rp);
                    controlPoi._sketch = true;
                    controlPoi.style = SuperMap.Util.copyAttributes(controlPoi.style, control.defaultScalePointStyle);
                    if (control.scalePointsStyle) {
                        controlPoi.style = SuperMap.Util.copyAttributes(controlPoi.style, control.scalePointsStyle);
                    }
                    control.rotatePoint = controlPoi ;
                }
            }
        }

        collectGeometryControlPoints.call(this, this.feature.geometry);
        if(this.controlPoints !== null && this.controlPoints.length > 0){
            this.layer.addFeatures(this.controlPoints, {silent: true});
        }
        if(this.scalePoints !== null && this.scalePoints.length > 0){
            this.layer.addFeatures(this.scalePoints, {silent: true});
        }
        if(this.rotatePoint !== null){
            this.layer.addFeatures(this.rotatePoint, {silent: true});
        }
    },


    /**
     * Method: setMap
     * Set the map property for the control and all handlers.
     *
     * Parameters:
     *
     * map - {<SuperMap.Map>} The control's map.
     */
    setMap: function (map) {
        this.selectControl.setMap(map);
        this.dragControl.setMap(map);
        SuperMap.Control.prototype.setMap.apply(this, arguments);
    },

    /**
     * Method: getCpGeos
     * 从 this.controlPoints 中获取出 Geometry 控制点数组
     *
     */
    getCpGeos: function () {
        var cpFeas = this.controlPoints;
        var cpGeos = [];

        for (var i = 0; i < cpFeas.length; i++) {
            cpGeos.push(cpFeas[i].geometry);
        }

        return cpGeos;
    },

    /**
     * Method: getCpGeos
     * 从 this.controlPoints 中获取出 Geometry 控制点数组
     *
     */
    getSpGeos: function () {
        var spFeas = this.scalePoints;
        var spGeos = [];

        for (var i = 0; i < spFeas.length; i++) {
            spGeos.push(spFeas[i].geometry);
        }

        return spGeos;
    },

    ///**
    // * Method: cloneControlPoints
    // * 克隆控制点数组
    // *
    // * Parameters:
    // * cp - {<SuperMap.Geometry.Point>} 要进行克隆的控制点数组
    // */
    //cloneControlPoints: function (cp) {
    //    var controlPoints = [];
    //
    //    for (var i = 0; i < cp.length; i++) {
    //        controlPoints.push(cp[i].clone());
    //    }
    //
    //    return controlPoints;
    //},

    ///**
    // * Method: controlPointsToJSON
    // * 当前符号（this.feature）的控制点（Geometry.controlPoints）转为json数据。
    // * (用于测试的方法)
    // */
    //controlPointsToJSON: function () {
    //    if (this.feature && this.feature.geometry && (this.isPlottingGeometry(this.feature))) {
    //        return this.feature.geometry.toJSON();
    //    }
    //},

    /**
     * Method: clearSelectFeatures
     * 清空当前选择对象
     *
     */
    clearSelectFeatures : function()
    {
        if(null == this.layer)
        {
            return;
        }

        for(var i = 0; i < this.layer.selectedFeatures.length; i++)
        {
            var feature = this.layer.selectedFeatures[i];

            var valid = feature && feature.geometry && feature.layer;
            if (valid) {
                this.selectControl.unselect.apply(this.selectControl,
                    [feature]);
            }

            //if(null != feature)
            //{
            //    this.unselectFeature(feature);
            //}
        }
    },

    /**
     * Method: otherLayerUnSelectFeatures
     * 清空其他图层选中对象
     *
     */
    otherLayerUnSelectFeatures : function () {
        if(null === this.map)
        {
            return;
        }

        for(var i = 0; i < this.map.controls.length; i++)
        {
            var control = this.map.controls[i];
            if(null === control)
            {
                continue;
            }

            if(control.CLASS_NAME !== "SuperMap.Control.PlottingEdit")
            {
                continue;
            }

            if(control === this)
            {
                continue;
            }

            control.clearSelectFeatures();
        }
    },

    CLASS_NAME: "SuperMap.Control.PlottingEdit"
});