/**
 *
 * Class: SuperMap.Plot.DefaultStyle
 * 缺省属性类。
 * 用户可以通过该类设置缺省标绘属性，包括线型、线色、线宽等属性。启用缺省属性后，标号将以缺省属性为默认风格去绘制。
 */

SuperMap.Plot.DefualtStyle = new SuperMap.Class({

    /*
     * Property:lineColor
     * 线色
     */
    lineColor:"#0000FF",

    /*
     * Property:lineWidth
     * 线宽
     */
    lineWidth:2,

    /*
     * Property:symbolWidth
     * 标号宽度
     */
    symbolWidth:-1,

    /*
     * Property:symbolHeight
     * 标号高度
     */
    symbolHeight:-1,

    /*
     * Property:lineType
     * 线形
     */
    lineType: "solid",

    /*
     * Property:tableWidth
     * 表格宽度
     */
    tableWidth:10,

    /*
     * Property:tableHeight
     * 表格高度
     */
    tableHeight:10,

    /*
     * Property:defualtColorFlag
     * 是否使用标号缺省颜色
     */
    defaultFlag: false,

    /**
     * Constructor: SuperMap.Plot.DefaultStyle
     * 构建一个图形缺省属性类。
     *
     * Parameters:
     *
     * Returns:
     * {<SuperMap.Plot.DefaultStyle>}  结果类型对象。
     */
    initialize: function(){

    },

    /**
     * APIMethod: setLineType
     * 设置缺省的标绘线型
     */
    setLineType : function(lineType){
        this.lineType = lineType;
    },

    /**
     * APIMethod: getLineType
     * 获取缺省的标绘线型
     */
    getLineType : function(){
        return this.lineType;
    },

    /**
     * APIMethod: setLineWidth
     * 设置缺省的标绘线宽
     */
    setLineWidth : function(lineWidth){
        this.lineWidth = lineWidth;
    },

    /**
     * APIMethod: getLineWidth
     * 获取缺省的标绘线宽
     */
    getLineWidth : function(){
        return this.lineWidth;
    },

    /**
     * APIMethod: setLineColor
     * 设置缺省的标绘颜色
     */
    setLineColor : function(lineColor){
        this.lineColor = lineColor;
    },

    /**
     * APIMethod: getLineColor
     * 获取缺省的标绘颜色
     */
    getLineColor : function() {
        return this.lineColor;
    },

    /**
     * APIMethod: setSymbolWidth
     * 设置缺省的标绘宽度
     */
    setSymbolWidth : function(width){
        this.symbolWidth = width;
    },

    /**
     * APIMethod: getSymbolWidth
     * 获取缺省的标绘宽度
     */
    getSymbolWidth : function(){
        return this.symbolWidth;
    },

    /**
     * APIMethod: setSymbolHeight
     * 设置缺省的标绘高度
     */
    setSymbolHeight : function(height){
        this.symbolHeight = height;
    },

    /**
     * APIMethod: getSymbolHeight
     * 获取缺省的标绘高度
     */
    getSymbolHeight : function(){
        return this.symbolHeight;
    },

    /**
     * APIMethod: setTableWidth
     * 设置缺省的表格宽度
     */
    setTableWidth : function(tableWidth){
        this.tableWidth = tableWidth;
    },

    /**
     * APIMethod: getTableWidth
     * 获取缺省的表格宽度
     */
    getTableWidth : function(){
        return this.tableWidth;
    },

    /**
     * APIMethod: setTableHeight
     * 设置缺省的标绘线宽
     */
    setTableHeight : function(tableHeight){
        this.tableHeight = tableHeight;
    },

    /**
     * APIMethod: getTableHeight
     * 获取缺省的标绘线宽
     */
    getTableHeight : function(){
        return this.tableHeight;
    },

    /**
     * APIMethod: setDefaultFlag
     * 设置是否使用标号缺省属性
     */
    setDefaultFlag : function(defaultFlag){
        this.defaultFlag = defaultFlag;
    },

    /**
     * APIMethod: getDefaultFlag
     * 获取是否使用标号缺省颜色
     */
    getDefaultFlag : function(){
        return this.defaultFlag;
    },

    CLASS_NAME: "SuperMap.Plot.DefualtStyle"
});