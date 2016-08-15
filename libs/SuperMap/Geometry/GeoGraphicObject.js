/* COPYRIGHT 2016 SUPERMAP
 * 本程序只能在有效的授权许可下使用。
 * 未经许可，不得以任何手段擅自使用或传播。*/

/**
 * @requires SuperMap/Geometry.js
 * @requires SuperMap/Geometry/Collection.js
 */

/**
 * Class: SuperMap.Geometry.GeoGraphicObject
 * 标绘几何对象类。
 *
 * Inherits from:
 *  - <SuperMap.Geometry.Collection>
 */
SuperMap.Geometry.GeoGraphicObject = SuperMap.Class(SuperMap.Geometry.Collection,{

    /**
     * Property: serverUrl
     * {String} 标绘服务的URI
     */
    serverUrl: null,

    /**
     * Property: map
     * {<SuperMap.Map>}
     */
    map: null,

    /**
     * Property: layer
     * {<SuperMap.Layer.PlottingLayer>}
     */
    layer: null,

    /**
     * APIProperty: symbolData
     * {Object} 标号原始的数据
     */
    symbolData: null,

    /**
     * APIProperty: libID
     * {Integer} 标号的库ID
     */
    libID: null,

    /**
     * APIProperty: code
     * {Integer} 标号的代码
     */
    code: null,

    /**
     * APIProperty: symbolType
     * {Integer} 标号类型
     */
    symbolType: null,

    /**
     * APIProperty: symbolName
     * {String} 标号名称
     */
    symbolName: null,

    /**
     * APIProperty: maxEditPts
     * {Integer} 标号最大编辑点个数
     */
    maxEditPts: 0,

    /**
     * APIProperty: minEditPts
     * {Integer} 标号最小编辑点个数
     */
    minEditPts: 0,

    /**
     * APIProperty: note
     * {String} 图形对象的用户备注信息
     */
    note: null,

    /**
     * Property: surroundLineType
     * {Integer} 标号的衬线类型
     */
    surroundLineType: null,

    /**
     * Property: extendProperty
     * {<SuperMap.Plot.ExtendPropety>} 标号的衬线类型
     */
    extendProperty: null,

    /**
     * Property: textContent
     * {String} 点标号的注记内容
     */
    textContent: null,

    /**
     * Property: feature
     * {<SuperMap.Feature.Vector>} 几何对象所属的feature，对象被选中才赋值
     */
    feature: null,

    /**
     * Property: controlPoints
     * {Array(<SuperMap.Geometry.Point>)}用于存储标绘标号的所有控制点，算法标号的控制点即为它的定位点
     */
    controlPoints: [],

    /**
     * APIMethod: getSymbolSize
     * 获取点标号的大小
     *
     * Returns:
     * {<SuperMap.Size>} 返回点标号的大小。
     */
    getSymbolSize:function(){},

    /**
     * APIMethod: setRotate
     * 设置点标号的旋转角度
     *
     * Parameters:
     * rotateValue - {Float} 点标号的旋转角度。
     */
    setSymbolSize:function(width, height){},

    /**
     * APIMethod: getRotate
     * 获取点标号的旋转角度
     *
     * Returns:
     * {Float} 返回点标号的旋转角度。
     */
    getRotate:function(){},

    /**
     * APIMethod: setRotate
     * 设置点标号的旋转角度
     *
     * Parameters:
     * rotateValue - {float} 点标号的旋转角度。
     */
    setRotate:function(rotateValue){},

    /**
     * APIMethod: getScale
     * 获取点标号的比例值
     *
     * Returns:
     * {Float} 返回点标号的比例值。
     */
    getScale:function(){},

    /**
     * APIMethod: setRotate
     * 设置点标号的比例值
     *
     * Parameters:
     * scaleValue - {Float} 点标号的比例值。
     */
    setScale:function(scaleValue){},

    /**
     * APIMethod: getSymbolRank
     * 获取标号的符号等级
     *
     * Returns:
     * {Integer} 返回标号的符号等级。
     */
    getSymbolRank:function(){},

    /**
     * APIMethod: setSymbolRank
     * 设置标号的符号等级
     *
     * Parameters:
     * rank - {Integer} rank。
     */
    setSymbolRank:function(rank){},

    /**
     * APIMethod: getNegativeImage
     * 获取图形对象的镜像（只对点标号有效）
     *
     * Returns:
     * {Boolean} 图形对象的镜像。
     */
    getNegativeImage:function(){},

    /**
     * APIMethod: setNegativeImage
     * 设置图形对象的镜像（只对点标号有效）
     *
     * Parameters:
     * mirror - {Boolean} 镜像。
     */
    setNegativeImage:function(mirror){},

    /**
     * APIMethod: getTextPosition
     * 获取注记文本的位置
     *
     * Returns:
     * {Object} 返回注记文本的位置。
     */
    getTextPosition:function(){},

    /**
     * APIMethod: setTextPosition
     * 设置注记文本的位置
     *
     * Parameters:
     * position - {Object} 注记文本的位置。
     */
    setTextPosition:function(position){},

    /**
     * APIMethod: getSubSymbol
     * 获取线面标号的子标号
     *
     * Returns:
     * {Object} 返回线面标号的子标号。
     */
    getSubSymbols:function(){},

    /**
     * APIMethod: setSubSymbol
     * 设置线面标号的子标号
     *
     * Parameters:
     * code - {Int} 子标号代码。
     * npos - {Int} 子标号在线面标号所处的索引位置。
     */
    setSubSymbol:function(code, npos){},

    /**
     * APIMethod: getExtendProperty
     * 标号的自定义属性
     *
     * Returns:
     * {<SuperMap.Plot.ExtendPropety>} 返回标号的自定义属性。
     */
    getExtendProperty:function(){
        return this.extendProperty;
    },

    /**
     * APIMethod: getSurroundLineType
     * 获取标号的衬线类型
     *
     * Returns:
     * {int} 返回标号的衬线类型。
     */
    getSurroundLineType:function(){
        return this.surroundLineType;
    },

    /**
     * APIMethod: setSurroundLineType
     * 设置标号的衬线类型
     *
     * Parameters:
     * surroundLineType - {int} 标号的衬线类型。
     */
    setSurroundLineType:function(surroundLineType){},

    /**
     * APIMethod: getTextContent
     * 获取点标号注记内容
     *
     * Returns:
     * {String} 返回点标号注记内容。
     */
    getTextContent:function(){
        return this.textContent;
    },
    /**
     * APIMethod: setTextContent
     * 设置点标号注记内容
     *
     * Parameters:
     * content - {String} 点标号注记内容。
     */
    setTextContent:function(content){
        this.textContent = content;
        this.symbolData.textContent = this.textContent;
        this.calculateParts();
        this.layer.redraw();
    },

    /**
     * Constructor: SuperMap.Geometry.GeoGraphicObject
     * 创建一个标绘对象。可以使用SuperMap.Geometry.GeoGraphicObject.getGeometry函数创建新的标绘对象
     *
     * Parameters:
     * options - {Object} 此类与父类提供的开放属性。
     *
     * Returns:
     * {<SuperMap.Geometry.GeoGraphicObject>} 新的标绘对象。
     */
    initialize: function(options){
        SuperMap.Geometry.Collection.prototype.initialize.apply(this,arguments);
        this.components = [];

        this.serverUrl = options.serverUrl;
        this.layer = options.layer;
        this.map = this.layer.map;
        if(options.symbolData.symbolType === SuperMap.Plot.SymbolType.DOTSYMBOL){
            this.symbolData = this.cloneObject(options.symbolData);
        } else {
            this.symbolData = options.symbolData;
        }

        var basicInfo = SuperMap.Plot.AnalysisSymbol.analysisBasicInfo(this.symbolData);
        this.libID = basicInfo.libID;
        this.code = basicInfo.code;
        this.symbolType = basicInfo.symbolType;
        this.symbolName = basicInfo.symbolName;
        this.minEditPts = basicInfo.minEditPts;
        this.maxEditPts = basicInfo.maxEditPts;
        this.textContent = basicInfo.textContent;
        this.surroundLineType = basicInfo.surroundLineType;

        this.extendProperty = new SuperMap.Plot.ExtendProperty();
    },

    /**
     * APIMethod: clone
     * 克隆当前几何对象。
     *
     * Returns:
     * {<SuperMap.Geometry.GeoGraphicObject>} 克隆的几何对象集合。
     */
    clone: function () {
        var copySymbolData = {};
        if(this.symbolData){
            SuperMap.Util.extend(copySymbolData, this.symbolData);
        }
        var geometry = SuperMap.Geometry.GeoGraphicObject.getGeometry(copySymbolData, this.layer, this.serverUrl);

        if(this.symbolType === SuperMap.Plot.SymbolType.DOTSYMBOL){
            geometry.locationPoints = this.cloneControlPoints(this.locationPoints);
            geometry.annotationIndex = this.annotationIndex;
        } else {
            geometry.controlPoints = this.cloneControlPoints(this.controlPoints);
            geometry.dOffset = this.dOffset;
        }

        return geometry;
    },

    /**
     * Method: move
     * 沿着x、y轴的正方向上按照给定的位移移动几何图形，move 不仅改变了几何图形的位置并且清理了边界缓存。
     *
     * Parameters:
     * x - {Float} x轴正方向上移动的距离。
     * y - {Float} y轴正方向上移动的距离。
     */
    move: function(x, y) {

        for(var i=0, len=this.components.length; i<len; i++) {
            if(this.components[i].CLASS_NAME !== "SuperMap.Geometry.GeoText"){

                this.components[i].move(x, y);
            }
            else
            {
                this.components[i].x += x;
                this.components[i].y += y;
            }
        }
    },

    /**
     * Method: cloneControlPoints
     * 克隆控制点数组
     *
     */
    cloneControlPoints: function (cp) {
        var controlPoints = [];

        if(cp && cp !== null){
            for (var i = 0; i < cp.length; i++) {
                controlPoints.push(cp[i].clone());
            }
        }

        return controlPoints;
    },

    /**
     * Method: cloneSymbolData
     * 克隆标号数据
     *
     */
    cloneObject: function (obj) {
        var jsonData = SuperMap.Plot.PlottingUtil.toJSON(obj);
        var objCopy = JSON.parse(jsonData);

        return objCopy;
    },

    CLASS_NAME: "SuperMap.Geometry.GeoGraphicObject"
});

/**
 * APIFunction: SuperMap.Geometry.GeoGraphicObject.getGeometry
 * 根据类型创建相应的标号对象。
 *
 * Parameters:
 * params - {symbolData} 标绘对象的数据。
 * params - {layer} 标绘对象所在图层。
 * params - {serverUrl} 标绘服务URI。
 *
 * Returns:
 * {<SuperMap.Geometry.GeoGraphicObject.DotSymbol> | <SuperMap.Geometry.GeoGraphicObject.AlgoSymbol>} 标绘对象。
 */
SuperMap.Geometry.GeoGraphicObject.getGeometry = function(symbolData, layer, serverUrl, options){
    if(symbolData.symbolType === SuperMap.Plot.SymbolType.DOTSYMBOL){
        return new SuperMap.Geometry.GeoGraphicObject.DotSymbol({
            "serverUrl": serverUrl,
            "layer": layer,
            "symbolData": symbolData
        });
    } else /*if(symbolData.symbolType === SuperMap.Plot.SymbolType.ALGOSYMBOL)*/{
        return new SuperMap.Geometry.GeoGraphicObject.AlgoSymbol({
            "serverUrl": serverUrl,
            "layer": layer,
            "symbolData": symbolData
        });
    }

    if(options && options.feature){
        this.feature = options.features;
    }
};
