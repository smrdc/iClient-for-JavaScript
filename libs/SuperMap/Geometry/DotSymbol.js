/**
 * Class: SuperMap.Geometry.GeoGraphicObject.DotSymbol
 * 点标号对象。
 *
 * Inherits from:
 *  - <SuperMap.Geometry.GeoGraphicObject>
 */

SuperMap.Geometry.GeoGraphicObject.DotSymbol = new SuperMap.Class(SuperMap.Geometry.GeoGraphicObject, {
    /**
     * Property: rotate
     * {double} 点标号的旋转角度
     */
    rotate: null,

    /**
     * Property: scale
     * {double} 点标号的缩放比例
     */
    scale: null,

    /**
     * Property: annotationPosition
     * {Integer} 点标号的注记位置
     */
    annotationPosition: null,

    /**
     * Property: symbolRank
     * {Integer} 点标号的标号等级
     */
    symbolRank: null,

    /**
     * Property: negativeImage
     * {Boolean} 点标号的镜像
     */
    negativeImage: null,

    /**
     * Property: annotationIndex
     * {Integer} 点标号的注记图元的索引
     */
    annotationIndex: -1,

    /**
     * Property: anchorPoint
     * {<SuperMap.Geometry.Point>} 点标号的锚点位置
     */
    anchorPoint: null,

    /**
     * Property: symbolSizeInLib
     * {<SuperMap.Size>} 点标号的在标号库中的大小
     */
    symbolSizeInLib: null,

    /**
     * Property: symbolSize
     * {<SuperMap.Size>} 点标号的大小
     */
    symbolSize: null,

    /**
     * Property: middleMarkBounds
     * {<SuperMap.Bounds>} 点标号的中间注记范围
     */
    middleMarkBounds: null,

    /**
     * Property: locationPoints
     * {Array(<SuperMap.Geometry.Point>)} 点标号的定位点
     */
    locationPoints: null,

    /**
     * Property: rotatePoint
     * {<SuperMap.Geometry.Point>} 点标号旋转的控制点
     */
    rotatePoint: null,

    /**
     * APIMethod: getSymbolSize
     * 获取点标号的大小
     *
     * Returns:
     * {<SuperMap.Size>} 返回点标号的大小。
     */
    getSymbolSize:function(){
        return this.symbolSize;
    },

    /**
     * APIMethod: setRotate
     * 设置点标号的旋转角度
     *
     * Parameters:
     * rotateValue - {Float} 点标号的旋转角度。
     */
    setSymbolSize:function(width, height){
        var scaleX = width/this.symbolSizeInLib.w;
        var scaleY = height/this.symbolSizeInLib.h;
        if(this.scale !== scaleX){
            this.scale = scaleX;
        } else if(this.scale !== scaleY){
            this.scale = scaleY;
        }

        this.symbolSize.w = this.scale * this.symbolSizeInLib.w;
        this.symbolSize.h = this.scale * this.symbolSizeInLib.h;

        this.symbolData.scale2D.x = this.scale;

        this.calculateParts(true);
    },

    /**
     * APIMethod: getRotate
     * 获取点标号的旋转角度
     *
     * Returns:
     * {float} 返回点标号的旋转角度。
     */
    getRotate:function(){
        return this.rotate;
    },

    /**
     * APIMethod: setRotate
     * 设置点标号的旋转角度
     *
     * Parameters:
     * rotateValue - {float} 点标号的旋转角度。
     */
    setRotate:function(rotateValue){
        this.rotate = rotateValue;
        this.symbolData.rotate2D.x = this.rotate;
        this.calculateParts(true);
    },

    /**
     * APIMethod: getScale
     * 获取点标号的比例值
     *
     * Returns:
     * {float} 返回点标号的比例值。
     */
    getScale:function(){
        return this.scale;
    },

    /**
     * APIMethod: setRotate
     * 设置点标号的比例值
     *
     * Parameters:
     * scaleValue - {float} 点标号的比例值。
     */
    setScale:function(scaleValue) {
        this.scale = scaleValue;
        this.symbolData.scale2D.x = this.scale;
        this.symbolSize.w = this.scale * this.symbolSizeInLib.w;
        this.symbolSize.h = this.scale * this.symbolSizeInLib.h;
        this.calculateParts(true);
    },

    /**
     * APIMethod: getSymbolRank
     * 获取标号的符号等级
     *
     * Returns:
     * {int} 返回标号的符号等级。
     */
    getSymbolRank:function(){
        return this.symbolRank;
    },

    /**
     * APIMethod: setSymbolRank
     * 设置标号的符号等级
     *
     * Parameters:
     * rank - {Int} rank。
     */
    setSymbolRank:function(rank){
        // 获取数据成功
        function getCompleted(result){
            this.symbolData.innerCells = result.originResult.innerCells;
            this.symbolRank = result.originResult.symbolRank;
            //重新计算标绘扩展符号的geometry
            this.calculateParts();
            this.layer.redraw();

            this.layer.events.triggerEvent("featuremodified",
                {feature: this.feature});
        }

        //获取数据失败
        function getFailed(result){
            return;
        }

        //对接iserver中的服务
        var getSymbolInfo = new SuperMap.REST.GetSymbolInfoService(this.serverUrl);
        getSymbolInfo.events.on({
            "processCompleted": getCompleted,
            "processFailed": getFailed,
            scope: this
        });

        var getSymbolInfoParams = new SuperMap.REST.GetSymbolInfoParameters();
        getSymbolInfoParams.libID = this.libID;
        getSymbolInfoParams.code = this.code;
        getSymbolInfoParams.symbolRank = rank;
        getSymbolInfoParams.negativeImage = this.negativeImage;
        getSymbolInfoParams.surroundLineType = this.surroundLineType;
        getSymbolInfo.processAsync(getSymbolInfoParams);
    },

    /**
     * APIMethod: getNegativeImage
     * 获取图形对象的镜像（只对点标号有效）
     *
     * Returns:
     * {Int} 图形对象的镜像；0：无镜像；1：左右镜像；2：上下镜像；3左右+上下镜像。
     */
    getNegativeImage:function(){
        return this.negativeImage;
    },

    /**
     * APIMethod: setNegativeImage
     * 设置图形对象的镜像（只对点标号有效）
     *
     * Parameters:
     * mirror - {Int} 镜像；0：无镜像；1：左右镜像；2：上下镜像；3左右+上下镜像。
     */
    setNegativeImage:function(mirror){
        // 获取数据成功
        function getCompleted(result){
            this.symbolData.innerCells = result.originResult.innerCells;
            this.negativeImage = result.originResult.negativeImage;
            //重新计算标绘扩展符号的geometry
            this.calculateParts();
            this.layer.redraw();

            this.layer.events.triggerEvent("featuremodified",
                {feature: this.feature});
        }

        //获取数据失败
        function getFailed(result){
            return;
        }

        //对接iserver中的服务
        var getSymbolInfo = new SuperMap.REST.GetSymbolInfoService(this.serverUrl);
        getSymbolInfo.events.on({
            "processCompleted": getCompleted,
            "processFailed": getFailed,
            scope: this
        });

        var getSymbolInfoParams = new SuperMap.REST.GetSymbolInfoParameters();
        getSymbolInfoParams.libID = this.libID;
        getSymbolInfoParams.code = this.code;
        getSymbolInfoParams.negativeImage = mirror;
        getSymbolInfoParams.symbolRank = this.symbolRank;
        getSymbolInfoParams.surroundLineType = this.surroundLineType;
        getSymbolInfo.processAsync(getSymbolInfoParams);
    },

    /**
     * APIMethod: getTextPosition
     * 获取注记文本的位置
     *
     * Returns:
     * {Object} 返回注记文本的位置。
     */
    getTextPosition:function(){
        return this.annotationPosition;
    },

    /**
     * APIMethod: setTextPosition
     * 设置注记文本的位置
     *
     * Parameters:
     * position - {Object} 注记文本的位置。
     */
    setTextPosition:function(position){
        this.annotationPosition = position;
        this.symbolData.annotationPosition = this.annotationPosition;
        this.calculateParts();
        this.layer.redraw();
    },

    /**
     * APIMethod: setSurroundLineType
     * 设置标号的衬线类型
     *
     * Parameters:
     * surroundLineType - {int} 标号的衬线类型。
     */
    setSurroundLineType:function(surroundLineType){
        // 获取数据成功
        function getCompleted(result){
            this.symbolData.innerCells = result.originResult.innerCells;
            this.surroundLineType = result.originResult.surroundLineType;
            //重新计算标绘扩展符号的geometry
            this.calculateParts();
            this.layer.redraw();

            this.layer.events.triggerEvent("featuremodified",
                {feature: this.feature});
        }

        //获取数据失败
        function getFailed(result){
            return;
        }

        //对接iserver中的服务
        var getSymbolInfo = new SuperMap.REST.GetSymbolInfoService(this.serverUrl);
        getSymbolInfo.events.on({
            "processCompleted": getCompleted,
            "processFailed": getFailed,
            scope: this
        });

        var getSymbolInfoParams = new SuperMap.REST.GetSymbolInfoParameters();
        getSymbolInfoParams.libID = this.libID;
        getSymbolInfoParams.code = this.code;
        getSymbolInfoParams.negativeImage = this.negativeImage;
        getSymbolInfoParams.symbolRank = this.symbolRank;
        getSymbolInfoParams.surroundLineType = surroundLineType;
        getSymbolInfo.processAsync(getSymbolInfoParams);
    },

    /**
     * Constructor: SuperMap.Geometry.GeoGraphicObject.DotSymbol
     * 创建一个点标绘对象。
     *
     * Parameters:
     * options - {Object} 此类与父类提供的属性。
     *
     * Returns:
     * {<SuperMap.Geometry.GeoGraphicObject.DotSymbol>} 新的标绘对象。
     */
    initialize:function(options){
        SuperMap.Geometry.GeoGraphicObject.prototype.initialize.apply(this, arguments);

        var dotBasicInfo = SuperMap.Plot.AnalysisSymbol.analysisDotBasicInfo(this.symbolData);
        this.rotate = dotBasicInfo.rotate;
        this.scale = dotBasicInfo.scale;
        this.annotationPosition = dotBasicInfo.annotationPosition;
        this.symbolRank = dotBasicInfo.symbolRank;
        this.negativeImage = dotBasicInfo.negativeImage;
        this.anchorPoint = dotBasicInfo.anchorPoint;
        this.symbolSizeInLib = dotBasicInfo.symbolSizeInLib;

        this.symbolSize = new SuperMap.Size(this.scale * this.symbolSizeInLib.w,this.scale * this.symbolSizeInLib.h);

        this.middleMarkBounds = dotBasicInfo.middleMarkBounds;

        this.locationPoints = [];
    },

    /**
     * Method: calculateParts
     * 重写了父类的方法
     */
    calculateParts: function (isResetId) {
        if(this.locationPoints !== null && this.locationPoints.length !== 0){
            //存储当前geometry 中的ids
            var ids = [];
            if((this.layer.renderer.CLASS_NAME === "SuperMap.Renderer.SVG" || this.layer.renderer.CLASS_NAME === "SuperMap.Renderer.VML")
                && isResetId && isResetId === true && this.components.length !== 0) {
                for(var i = 0; i <this.components.length; i++){
                    ids.push(this.components[i].id)
                }
            }

            //清空原有的所有点
            this.components = [];

            var plotting = SuperMap.Plotting.getInstance(this.layer.map, this.serverUrl);
            SuperMap.Plot.AnalysisSymbol.mergeDefaultStyle(this.feature.style, this, plotting.getDefaultStyle());

            if (this.symbolData.symbolType === 1) {
                var symbolCells = SuperMap.Plot.AnalysisSymbol.analysisSymbolCells(this.symbolData);
                this.components = this.transformSymbolCellsToCompontGeometrys(symbolCells);

                if(ids.length !== 0){
                    //还原ids
                    for(var i = 0; i < ids.length; i++){
                        if( i < this.components.length ){
                            this.components[i].id = ids[i];
                        }
                    }
                }

                this.clearBounds();

                this.annotationIndex = -1;
                this.handleAnnotation();
            }
        }
    },

    /**
     * Method: reView
     * 根据点标号的原始信息重新计算 符号所在的位置
     *（用于地图缩放的时候重新计算  更换原来feature 中各个geometry的components  让原来的geometry不发生变化。）
     * @param feature
     */
    reView: function(feature){
        feature.geometry.bounds = null;
        if(this.locationPoints.length === 0){
            return;
        }

        if (feature.geometry.symbolType === SuperMap.Plot.SymbolType.DOTSYMBOL) {
            var symbolCells = SuperMap.Plot.AnalysisSymbol.analysisSymbolCells(this.symbolData);
            var compontentGeometrys = this.transformSymbolCellsToCompontGeometrys(symbolCells);

            var result = [];
            for(var i = 0; i < compontentGeometrys.length; i++)
                result.push(compontentGeometrys[i]);

            for(var i = 0; i < result.length; i++){
                feature.geometry.components[i].bounds = null;
                if(result[i].CLASS_NAME !== "SuperMap.Geometry.Point"){
                    if(result[i].components){
                        feature.geometry.components[this.annotationIndex+1+i].components = result[i].components;
                    }
                    else{
                        if(result[i].CLASS_NAME === "SuperMap.Geometry.GeoText"){
                            feature.geometry.components[this.annotationIndex+1+i].x = result[i].x;
                            feature.geometry.components[this.annotationIndex+1+i].y = result[i].y;

                            //feature.geometry.components[i].style.labelRotation = -this.symbolData.rotate2D.x;
                            //文本字体
                            //feature.geometry.components[i].style.fontSize = this.symbolData.innerCells[i].textStyle.fontHeight/2;
                            //feature.geometry.components[i].style.labelYOffset = this.symbolData.innerCells[i].textStyle.fontHeight*2;
                            //feature.geometry.components[i].style.labelXOffset = this.symbolData.innerCells[i].textStyle.fontHeight*2;
                        }
                    }
                }
            }

            this.clearBounds();

            feature.geometry.handleAnnotation();
            this.setControlPoint(feature.geometry.getBounds());
        }
    },

    /**
     * Method: transformSymbolCellsToCompontGeometrys
     * 将图元从数据层面转换成几何对象层面
     *
     * Parameters:
     * feature - {Array(Object)}需要绘制的要素
     */
    transformSymbolCellsToCompontGeometrys: function(symbolCells){
        var componentsGeometrys = [];

        var locationPixel = this.map.getPixelFromLonLat(new SuperMap.LonLat(this.locationPoints[0].x,this.locationPoints[0].y));

        for(var i = 0; i < symbolCells.length; i++){
            var symbolCell = symbolCells[i];

            if(symbolCell.type === SuperMap.Plot.SymbolType.TEXTSYMBOL){
                if(this.layer.renderer.CLASS_NAME === "SuperMap.Renderer.Canvas" || this.layer.renderer.CLASS_NAME === "SuperMap.Renderer.Canvas2"){
                    symbolCell.style.fontSize = Math.round(symbolCell.style.fontSize /16).toString() + "em";
                }
                symbolCell.style.labelRotation = -this.symbolData.rotate2D.x;
            }

            for(var j = 0; j < symbolCell.positionPoints.length; j++){
                symbolCell.positionPoints[j].x = symbolCell.positionPoints[j].x * this.scale ;
                symbolCell.positionPoints[j].y = symbolCell.positionPoints[j].y * this.scale ;

                symbolCell.positionPoints[j].rotate(this.rotate, this.anchorPoint);

                symbolCell.positionPoints[j] = this.transitionPoint(symbolCell.positionPoints[j],locationPixel);
            }

            var geometry = SuperMap.Geometry.Primitives.transformSymbolCellToGeometry(symbolCell, this.rotate);
            geometry.style = symbolCell.style;
            componentsGeometrys.push(geometry);
        }

        return componentsGeometrys
    },

    /**
     * Method: setControlPoint
     * 添加点标号控制点，用来鼠标操作点标号的缩放、旋转
     *
     */
    setControlPoint: function(bounds){
        //缩放点
        var cp1 = new SuperMap.Geometry.Point(bounds.right , bounds.top );
        var cp2 = new SuperMap.Geometry.Point(bounds.left , bounds.top );
        var cp3 = new SuperMap.Geometry.Point(bounds.right , bounds.bottom );
        var cp4 = new SuperMap.Geometry.Point(bounds.left , bounds.bottom );
        this.controlPoints = [cp1];

        //旋转点
        var cp1Pixel = this.map.getPixelFromLonLat(new SuperMap.LonLat(cp1.x,cp1.y));
        var cp3Pixel = this.map.getPixelFromLonLat(new SuperMap.LonLat(cp3.x,cp3.y));
        var cp5Pixel = new SuperMap.Pixel(cp1Pixel.x+(cp3Pixel.x - cp1Pixel.x)/2 + 20,cp1Pixel.y+(cp3Pixel.y - cp1Pixel.y)/2);
        var cp5Lonlat = this.map.getLonLatFromPixel(cp5Pixel);
        var cp5 = new SuperMap.Geometry.Point(cp5Lonlat.lon, cp5Lonlat.lat);
        this.rotatePoint = cp5;
        cp5.isRotatePoint = true;
    },

    /**
     * Method: getBounds
     * 获得几何图形的边界。如果没有设置边界，可通过计算获得。
     *
     * Returns:
     * {<SuperMap.Bounds>}返回的几何对象的边界。
     */
    getBounds: function() {
        if (this.bounds == null) {
            this.calculateBounds();
        }
        return this.bounds;
    },

    /**
     * Method: calculateBounds
     * 通过遍历数组重新计算边界，在遍历每一子项中时调用 extend 方法。
     */
    calculateBounds: function() {
        this.bounds = null;
        var bounds = new SuperMap.Bounds();
        var components = this.components;
        if (components) {
            for (var i = this.annotationIndex+1; i < components.length; i++) {
                bounds.extend(components[i].getBounds());
            }
        }

        if (bounds.left != null && bounds.bottom != null &&
            bounds.right != null && bounds.top != null) {
            this.setBounds(bounds);
        }
    },

    /**
     * Method: handleAnnotation
     * 处理点标号注记的相关修改
     *
     */
    handleAnnotation: function(){
        if(this.symbolData.textContent && this.symbolData.textContent !== null && this.symbolData.textContent.length !== 0){
            var symbolBounds = this.getBounds();

            var style = SuperMap.Plot.AnalysisSymbol.getStyle(this.symbolData);

            var positionPoint = null;
            if(this.symbolData.annotationPosition === 0){
                var leftTop = new SuperMap.LonLat(symbolBounds.left, symbolBounds.top);
                var leftTopPixel = this.map.getPixelFromLonLat(leftTop);
                style.labelAlign = "rb";
                var lonLat = this.map.getLonLatFromPixel(leftTopPixel);
                positionPoint = new SuperMap.Geometry.Point(lonLat.lon, lonLat.lat);
            } else if(this.symbolData.annotationPosition === 1){
                var leftBottom = new SuperMap.LonLat(symbolBounds.left, symbolBounds.bottom);
                var leftBottomPixel = this.map.getPixelFromLonLat(leftBottom);
                style.labelAlign = "rt";
                var lonLat = this.map.getLonLatFromPixel(leftBottomPixel);
                positionPoint = new SuperMap.Geometry.Point(lonLat.lon, lonLat.lat);
            } else if(this.symbolData.annotationPosition === 2){
                var rightTop = new SuperMap.LonLat(symbolBounds.right, symbolBounds.top);
                var rightTopPixel = this.map.getPixelFromLonLat(rightTop);
                style.labelAlign = "lb";
                var lonLat = this.map.getLonLatFromPixel(rightTopPixel);
                positionPoint = new SuperMap.Geometry.Point(lonLat.lon, lonLat.lat);
            } else if(this.symbolData.annotationPosition === 3){
                var rightBottom = new SuperMap.LonLat(symbolBounds.right, symbolBounds.bottom);
                var rightBottomPixel = this.map.getPixelFromLonLat(rightBottom);
                style.labelAlign = "lt";
                var lonLat = this.map.getLonLatFromPixel(rightBottomPixel);
                positionPoint = new SuperMap.Geometry.Point(lonLat.lon, lonLat.lat);
            } else if(this.symbolData.annotationPosition === 4){
                var top = new SuperMap.LonLat((symbolBounds.left+symbolBounds.right)/2, symbolBounds.top);
                var topPixel = this.map.getPixelFromLonLat(top);
                style.labelAlign = "cb";
                var lonLat = this.map.getLonLatFromPixel(topPixel);
                positionPoint = new SuperMap.Geometry.Point(lonLat.lon, lonLat.lat);
            } else if(this.symbolData.annotationPosition === 5){
                var bottom = new SuperMap.LonLat((symbolBounds.left+symbolBounds.right)/2, symbolBounds.bottom);
                var bottomPixel = this.map.getPixelFromLonLat(bottom);
                style.labelAlign = "ct";
                var lonLat = this.map.getLonLatFromPixel(bottomPixel);
                positionPoint = new SuperMap.Geometry.Point(lonLat.lon, lonLat.lat);
            } else if(this.symbolData.annotationPosition === 6){
                var left = new SuperMap.LonLat(symbolBounds.left, (symbolBounds.top+symbolBounds.bottom)/2);
                var leftPixel = this.map.getPixelFromLonLat(left);
                style.labelAlign = "rm";
                var lonLat = this.map.getLonLatFromPixel(leftPixel);
                positionPoint = new SuperMap.Geometry.Point(lonLat.lon, lonLat.lat);
            } else if(this.symbolData.annotationPosition === 7){
                var right = new SuperMap.LonLat(symbolBounds.right, (symbolBounds.top+symbolBounds.bottom)/2);
                var rightPixel = this.map.getPixelFromLonLat(right);
                style.labelAlign = "lm";
                var lonLat = this.map.getLonLatFromPixel(rightPixel);
                positionPoint = new SuperMap.Geometry.Point(lonLat.lon, lonLat.lat);
            } else if(this.symbolData.annotationPosition === 8) {
                var tempMiddleMarkBounds = this.middleMarkBounds.scale(this.scale, this.anchorPoint);
                var centerPoint = new SuperMap.Geometry.Point((tempMiddleMarkBounds.left + tempMiddleMarkBounds.right) / 2.0, (tempMiddleMarkBounds.top + tempMiddleMarkBounds.bottom) / 2.0);
                centerPoint.rotate(this.rotate, this.anchorPoint);
                var locationPixel = this.map.getPixelFromLonLat(new SuperMap.LonLat(this.locationPoints[0].x, this.locationPoints[0].y));
                style.labelAlign = "cm";
                style.labelRotation = -this.rotate;
                positionPoint = this.transitionPoint(centerPoint, locationPixel);
            }

            var primitives = new SuperMap.Geometry.Primitives();
            var geoText = primitives.geotext([positionPoint], this.symbolData.textContent);
            geoText.style = style;

            if(this.annotationIndex === -1){
                this.annotationIndex = 0;
                this.components.splice(this.annotationIndex, 0, geoText);
            } else {
                this.components[this.annotationIndex] = geoText;
            }
        }
    },

    /**
     * Method: transitionPoint
     * 处理点标号注记的相关修改
     *
     */
    /**
     * 坐标转换
     * 组件提供的距离坐标  转换成像素坐标 根据当前提供的一个位置点转换成屏幕坐标 然后根据当前的屏幕坐标转换成经纬度坐标
     *
     * 组件提供单位是0.1mm  所以*10
     *
     * @param point1 要转换的点
     * @param location 定位置点，通过此点确定 point1
     * @constructor
     */
    transitionPoint: function(point1, location, options){
        var scale = 0.254;
        var inch = 96;
        if(options && options.scale){
            scale = options.scale;
        }
        if(options && options.inch){
            inch = options.inch;
        }

        //扩大1000倍，提高计算精度
        var px = scale*inch/10;
        //获取位置点的像素坐标
        var x = location.x + point1.x/px;
        var y = location.y - point1.y/px;

        var lonlat = this.map.getLonLatFromPixel(new SuperMap.Pixel(x, y));

        return new SuperMap.Geometry.Point(lonlat.lon,lonlat.lat);
    },

    CLASS_NAME: "SuperMap.Geometry.GeoGraphicObject.DotSymbol"
});