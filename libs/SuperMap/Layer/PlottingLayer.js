/* COPYRIGHT 2016 SUPERMAP
 * 本程序只能在有效的授权许可下使用。
 * 未经许可，不得以任何手段擅自使用或传播。*/

/**
 * @requires SuperMap/Layer/Vector.js
 */

/**
 * Class: SuperMap.Layer.PlottingLayer
 * 该图层用于渲染标号。
 *
 * Inherits from:
 *  - <SuperMap.Layer.Vector>
 */
SuperMap.Layer.PlottingLayer = new SuperMap.Class(SuperMap.Layer.Vector,{

    /**
     * Constant: EVENT_TYPES
     * {Array(String)}
     *
     * 此类支持的事件类型:
     * - *createsymbolsuccess* 创建标号成功时触发该事件。
     * - *createsymbolfail* 创建标号失败时触发该事件。
     * - *createtextsuccess* 创建文本成功时触发该事件。
     * - *createtextfail* 创建文本失败时触发该事件。
     */

    EVENT_TYPES: ["createsymbolsuccess", "createsymbolfail", "createtextsuccess", "createtextfail"],

    /**
     * APIProperty: serverUrl
     * {String} serverUrl表示标绘服务的URI
     */
    serverUrl: true,

    /**
     * APIProperty: locked
     * {Boolean} locked表示图层是否锁定
     */
    isLocked: false,

    /**
     * APIProperty: isEditable
     * {Boolean} isEditable表示图层是否可编辑
     */
    isEditable: true,

    /**
     * APIProperty: description
     * {String} description表示图层的描述信息
     */
    description: null,

    /**
     * APIProperty: plottingEdit
     * {<SuperMap.Control.PlottingEdit>} plottingEdit表示该图层上标号的编辑控件
     */
    plottingEdit: null,

    /**
     * APIProperty: drawGraphicObject
     * {<SuperMap.Control.DrawFeature>} drawGraphicObject表示该图层上标号的绘制控件
     */
    drawGraphicObject: null,

    /**
     * Constructor: SuperMap.Layer.PlottingLayer
     * 创建一个标绘图层。
     * (start code)
     * //创建一个名为“PlottingLayer”    、采用 Canvas2 渲染方式渲染的标绘图层。
     *  var plottingLayer = new SuperMap.Layer.PlottingLayer("PlottingLayer", {renderers: ["Canvas2"]});
     * (end)
     *
     * Parameters:
     * name - {String} 此图层的图层名。
     * plottingUrl - {String} 标绘服务地址
     * options - {Object} 此类与父类提供的属性。
     *
     * Returns:
     * {<SuperMap.Layer.PlottingLayer>} 新的标绘图层。
     */
    initialize: function(name, serverUrl, options){
        this.serverUrl = serverUrl;

        this.EVENT_TYPES =
            SuperMap.Layer.PlottingLayer.prototype.EVENT_TYPES.concat(
                SuperMap.Layer.Vector.prototype.EVENT_TYPES);

        SuperMap.Layer.Vector.prototype.EVENT_TYPES = this.EVENT_TYPES;

        SuperMap.Layer.Vector.prototype.initialize.apply(this,arguments);
    },

    /**
     * APIMethod: drawFeature
     * 在当前图层中绘制一个feature。如果参数中的样式（style）被设置
     * 则使用。否则使用矢量要素的样式。如果未设置要素的样式，则使用图层上的样式。
     * 点标号需要重新计算点，线面标号则沿用以前的处理方式
     *
     * 当要素的样式更改或者要素已经添加到图层上需要更新时使用该函数。
     *
     * Parameters:
     * feature - {<SuperMap.Feature.Vector>}需要绘制的要素
     * style - {String | Object} 风格
     */
    drawFeature: function(feature,style,option){

        //点符号处理
        if(feature.geometry.CLASS_NAME === "SuperMap.Geometry.GeoGraphicObject.DotSymbol"){
            feature.geometry.reView(feature);
            this.events.triggerEvent("moveed");
        }
        SuperMap.Layer.Vector.prototype.drawFeature.apply(this,arguments);

    },

    /**
     * Method: drawFeatures
     * 遍历所有features，并绘制，
     */
    drawFeatures: function(bounds) {
        SuperMap.Layer.Vector.prototype.drawFeatures.apply(this,arguments);

        if(this.renderer.CLASS_NAME === "SuperMap.Renderer.Canvas" || this.renderer.CLASS_NAME === "SuperMap.Renderer.Canvas2"){
            this.renderer.locked = false;
        }
    },

    /**
     * APIMethod: createSymbol
     * 根据屏幕坐标绘制标号
     *
     * Parameters:
     * libId - {Integer}标号库ID
     * code - {Integer} 标号代码
     * locationPoints - {Array(<SuperMap.Pixel>)}标号定位点
     * success - {Function}创建成功的处理函数
     * fail - {Function}创建失败的处理函数
     *
     */
    createSymbol: function(libId, code, locationPoints, success, fail){
        var locationPointWCs = [];
        for(var i = 0; i < locationPoints.length; i++){
            var lonLat = this.map.getLonLatFromViewPortPx(locationPoints[i]);
            locationPointWCs.push(new SuperMap.Geometry.Point(lonLat.lon, lonLat.lat));
        }

        this.createSymbolWC(libId, code, locationPointWCs, success, fail);
    },

    /**
     * APIMethod: createSymbolWC
     * 根据地理坐标绘制标号
     *
     * Parameters:
     * libId - {Integer}标号库ID
     * code - {Integer} 标号代码
     * locationPoints - {Array(<SuperMap.Geomety.Point>)}标号定位点
     * success - {Function}创建成功的处理函数
     * fail - {Function}创建失败的处理函数
     *
     */
    createSymbolWC: function(libId, code, locationPoints, success, fail){
        // 获取数据成功
        function getCompleted(result){
            var geoGraphicObject = SuperMap.Geometry.GeoGraphicObject.getGeometry(result.originResult, this, this.serverUrl);
            var feature = new SuperMap.Feature.Vector(geoGraphicObject);
            if(feature.geometry.symbolType === SuperMap.Plot.SymbolType.DOTSYMBOL){
                feature.geometry.locationPoints = feature.geometry.cloneControlPoints(locationPoints);
            } else {
                feature.geometry.controlPoints = feature.geometry.cloneControlPoints(locationPoints);
            }
            var featureStyle = SuperMap.Plot.AnalysisSymbol.getStyle(result.originResult);
            if(featureStyle){
                feature.style = SuperMap.Util.copyAttributes(feature.style, featureStyle);
            }			
            feature.layer = this;
			
			geoGraphicObject.feature = feature;
            //重新计算标绘扩展符号的geometry
            feature.geometry.calculateParts();
			
            this.features.push(feature);
            this.drawFeature(feature, feature.style, {isNewAdd: true});

            this.events.triggerEvent("createsymbolsuccess",{feature : feature});
        }

        //获取数据失败
        function getFailed(result){
            this.events.triggerEvent("createsymbolfail");
            return null;
        }

        this.events.on({
            "createsymbolsuccess": success,
            "createsymbolfail": fail
        });

        //对接iserver中的服务
        var getSymbolInfo = new SuperMap.REST.GetSymbolInfoService(this.serverUrl);
        getSymbolInfo.events.on({
            "processCompleted": getCompleted,
            "processFailed": getFailed,
            scope: this
        });

        var getSymbolInfoParams = new SuperMap.REST.GetSymbolInfoParameters();
        getSymbolInfoParams.libID = libId;
        getSymbolInfoParams.code = code;
        getSymbolInfoParams.inputPoints = locationPoints;
        getSymbolInfo.processAsync(getSymbolInfoParams);
    },

    /**
     * APIMethod: createText
     * 根据屏幕坐标绘制文本
     *
     * Parameters:
     * content - {String} 文字内容
     * pos - {<SuperMap.Pixel>} 文本内容的位置
     * style - {Object | {}} 文本的样式
     * success - {Function} 创建成功的处理函数
     * fail - {Function} 创建失败的处理函数
     *
     * Returns:
     * {<SuperMap.Feature.Vector>}创建成功返回相应的feature，否则返回空。
     */
    createText: function(content, pos, style, success, fail){
        var lonLat = this.map.getLonLatFromViewPortPx(pos);
        var posWC = new SuperMap.Geometry.Point(lonLat.lon, lonLat.lat);

        this.createTextWC(content, posWC, style, success, fail);
    },

    /**
     * APIMethod: createTextWC
     * 根据地理坐标绘制文本
     *
     * Parameters:
     * content - {String} 文字内容
     * pos - {<SuperMap.Geomety.Point>} 文本内容的位置
     * style - {Object | {}} 文本的样式
     * success - {Function} 创建成功的处理函数
     * fail - {Function} 创建失败的处理函数
     *
     * Returns:
     * {<SuperMap.Feature.Vector>}创建成功返回相应的feature，否则返回空。
     */
    createTextWC: function(content, pos, style, success, fail){
        // 获取数据成功
        function getCompleted(result){
            result.originResult.textContent = content;
            SuperMap.Plot.AnalysisSymbol.setStyle(style, result.originResult);
            var geoGraphicObject = SuperMap.Geometry.GeoGraphicObject.getGeometry(result.originResult, this, this.serverUrl);
            var feature = new SuperMap.Feature.Vector(geoGraphicObject);
            feature.geometry.controlPoints = feature.geometry.cloneControlPoints([pos]);
            
            var featureStyle = SuperMap.Plot.AnalysisSymbol.getStyle(result.originResult);
            if(featureStyle){
                feature.style = SuperMap.Util.copyAttributes(feature.style, featureStyle);
            }
            feature.layer = this;
			
			geoGraphicObject.feature = feature;
            //重新计算标绘扩展符号的geometry
            feature.geometry.calculateParts();
			
            this.features.push(feature);
            this.drawFeature(feature, feature.style, {isNewAdd: true});

            this.events.triggerEvent("createtextsuccess",{feature : feature});
        }

        //获取数据失败
        function getFailed(result){
            this.events.triggerEvent("createtextfail");
            return null;
        }

        this.events.on({
            "createtextsuccess": success,
            "createtextfail": fail
        });

        //对接iserver中的服务
        var getSymbolInfo = new SuperMap.REST.GetSymbolInfoService(this.serverUrl);
        getSymbolInfo.events.on({
            "processCompleted": getCompleted,
            "processFailed": getFailed,
            scope: this
        });

        var getSymbolInfoParams = new SuperMap.REST.GetSymbolInfoParameters();
        getSymbolInfoParams.libID = 0;
        getSymbolInfoParams.code = 34;
        getSymbolInfoParams.inputPoints = [pos];
        getSymbolInfo.processAsync(getSymbolInfoParams);
    },

    /**
     * APIMethod: getFeatureAt
     * 获取图层上指定索引的feature
     *
     * Parameters:
     * index - {Integer}指定feature的索引
     *
     * Returns:
     * {<SuperMap.Feature.Vector>}
     */
    getFeatureAt: function(index){
        return this.features[index];
    },

    /**
     * APIMethod: removeFeatureByID
     * 根据ID删除指定的feature
     *
     * Parameters:
     * id - {String}指定feature的id
     */
    removeFeatureByID: function(id){
        var feature = this.getFeatureById(id);
        this.removeFeatures([feature]);
    },

    /**
     * APIMethod: removeFeatureAt
     * 删除图层上指定索引的feature
     *
     * Parameters:
     * index - {Integer}指定feature的索引
     */
    removeFeatureAt: function(index){
        var feature = this.getFeatureAt(index);
        this.removeFeatures([feature]);
    },

    /**
     * Method: getFeatureFromEvent
     * 通过一个事件，从渲染器中获取一个对应的feature，如果没有则返回null。
     *
     * Parameters:
     * evt - {Event}
     *
     * Returns:
     * {<SuperMap.Feature.PlottingLayer>} 一个通过事件选中的feature。
     */
    getFeatureFromEvent: function(evt) {
        if(this.visibility == false)
            return null;

        if (!this.renderer) {
            throw new Error('getFeatureFromEvent called on layer with no ' +
            'renderer. This usually means you destroyed a ' +
            'layer, but not some handler which is associated ' +
            'with it.');
        }
        var feature = null;
        var featureId = this.renderer.getFeatureIdFromEvent(evt);
        if (featureId) {
            if (typeof featureId === "string") {
                feature = this.getFeatureById(featureId);
            } else {
                feature = featureId;
            }
        }

        if(null == feature)
        {
            if(evt.type !== "click"){
                return null;
            }

            //容限
            var tolerancePixel = 5;

            var tempPt0 = this.map.getLonLatFromViewPortPx(new SuperMap.Pixel(0,0));
            var tempPt1 = this.map.getLonLatFromViewPortPx(new SuperMap.Pixel(tolerancePixel,0));
            var tolerance = SuperMap.Plot.PlottingUtil.distance({x:tempPt0.lon,y:tempPt0.lat},{x:tempPt1.lon,y:tempPt1.lat});

            //鼠标的经纬度点
            var mousePoint = this.map.getLonLatFromViewPortPx(evt.xy);

            for(var i = 0; i < this.features.length; i++)
            {
                var tempFeature = this.features[i];
                if(null == tempFeature || null == tempFeature.geometry)
                {
                    continue;
                }

                var geo = tempFeature.geometry;
                if(!(geo instanceof SuperMap.Geometry.GeoGraphicObject))
                {
                    continue;
                }

                if(geo.symbolType == SuperMap.Plot.SymbolType.TEXTSYMBOL)
                {
                    var cell = geo.components[0];
                    if(this.mouseSelectCell(mousePoint,tolerance,cell)) {
                        return tempFeature;
                    }
                }
                else {
                    var bounds = geo.getBounds();
                    if(null == bounds)
                    {
                        return null;
                    }
                    var tempBounds = bounds.clone();
                    tempBounds.bottom -= tolerance;
                    tempBounds.top += tolerance;
                    tempBounds.left -= tolerance;
                    tempBounds.right += tolerance;

                    if(!this.pointInBounds(mousePoint, tempBounds))
                    {
                        continue;
                    }

                    for(var m = 0; m < geo.components.length; m++)
                    {
                        if(geo.components[m].CLASS_NAME === "SuperMap.Geometry.GeoText"){
                            continue;
                        }

                        var cell = geo.components[m];
                        var bSelect = this.mouseSelectCell(mousePoint,tolerance,cell);
                        if(bSelect) {
                            return tempFeature;
                        }
                    }
                }
            }
        }

        return feature;
    },

    /**
     * Method: pointInBounds
     * 计算点是否在bounds内。
     *
     * Parameters:
     * point - {Point}点
     * bounds
     *
     * Returns:
     * {<SuperMap.Feature.PlottingLayer>} 是否在bounds内。
     */
    pointInBounds : function(point, bounds)
    {
        if(null == point || null == bounds)
        {
            return false;
        }

        if(point.lon >= bounds.left   && point.lon <= bounds.right &&
           point.lat >= bounds.bottom && point.lat <= bounds.top)
        {
            return true;
        }

        return false;
    },

    /**
     * Method: pointInBounds
     * 计算点是否在bounds内,单位是像素。
     *
     * Parameters:
     * point - {Point}点
     * bounds
     *
     * Returns:
     * {<SuperMap.Feature.PlottingLayer>} 是否在bounds内。
     */
    pointInBoundsByPiexl : function(point, bounds)
    {
        if(null == point || null == bounds)
        {
            return false;
        }

        if(point.x >= bounds.left   && point.x <= bounds.right &&
           point.y <= bounds.bottom && point.y >= bounds.top)
        {
            return true;
        }

        return false;
    },

    /**
     * Method: mouseSelectCell
     * 判断点是否选中图元。
     *
     * Parameters:
     * mousePoint - {Point}点
     * toleranceDis {double} 容限
     * cell 图元
     *
     * Returns:
     * {<SuperMap.Feature.PlottingLayer>} 是否选中。
     */
    mouseSelectCell : function(mousePoint,toleranceDis, cell)
    {
        if(cell.CLASS_NAME === "SuperMap.Geometry.GeoText")
        {
            var locationPixel = this.map.getPixelFromLonLat({lon:cell.x,lat:cell.y});
            var textBounds = cell.getLabelPxBoundsByText(locationPixel, cell.style);
            var tempBounds = textBounds.scale(4);
            var mousePointForPixe = this.map.getPixelFromLonLat(mousePoint);
            if(this.pointInBoundsByPiexl(mousePointForPixe,tempBounds))
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        if(cell.CLASS_NAME !== "SuperMap.Geometry.LinearRing" &&
           cell.CLASS_NAME !== "SuperMap.Geometry.LineString")
        {
            for(var i = 0; i < cell.components.length; i++)
            {
                var bSelect = this.mouseSelectCell(mousePoint,toleranceDis,cell.components[i]);
                if(bSelect)
                {
                    return true;
                }
            }
        }
        else
        {
            for(var n = 0; n < cell.components.length-1; n++)
            {
                var pt0 = new SuperMap.Geometry.Point(cell.components[n].x,cell.components[n].y);
                var pt1 = new SuperMap.Geometry.Point(cell.components[n+1].x,cell.components[n+1].y);

                var dis = SuperMap.Plot.PlottingUtil.pointToPloyLineDis({x:mousePoint.lon,y:mousePoint.lat},pt0,pt1);
                if(dis <= toleranceDis)
                {
                    return true;
                }
            }
        }

        return false;
    },

    CLASS_NAME: "SuperMap.Layer.PlottingLayer"
});
