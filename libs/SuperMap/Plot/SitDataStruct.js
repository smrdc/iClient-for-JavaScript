/* COPYRIGHT 2012 SUPERMAP
 * 本程序只能在有效的授权许可下使用。
 * 未经许可，不得以任何手段擅自使用或传播。*/

/**
 * @requires SuperMap/
 * @requires SuperMap/
 */
/**
 * Class: SuperMap.Plot.SitDataStruct
 * 态势图的基本信息和态势图上的所有图层。
 */
SuperMap.Plot.SitDataStruct = new SuperMap.Class({

    /**
     * APIProperty: smlInfo
     * {<SuperMap.Plot.SMLInfoStruct>} 态势图基本信息
     */
    smlInfo: null,

    /**
     * APIProperty: layerDatas
     * {Array(<SuperMap.Plot.LayerDataStruct>)} 图层数据
     */
    layerDatas: null,

    /**
     * Constructor: SuperMap.Plot.SitDataStruct
     * 创建一个态势图信息结构。
     *
     * Parameters:
     * options - {Object} 态势图参数
     *
     * Returns:
     * {<SuperMap.Plot.SitDataStruct>} 新的图层结构。
     */
    initialize:function(options){
        if(options && options.smlInfo){
            this.smlInfo = options.smlInfo;
        }

        if(options && options.layerDatas){
            this.layerDatas = options.layerDatas;
        }
    },

    CLASS_NAME:"SuperMap.Plot.SitDataStruct"
});

/* COPYRIGHT 2012 SUPERMAP
 * 本程序只能在有效的授权许可下使用。
 * 未经许可，不得以任何手段擅自使用或传播。*/

/**
 * @requires SuperMap/
 * @requires SuperMap/
 */
/**
 * Class: SuperMap.Plot.SMLInfoStruct
 * 标识态势图基本信息。
 */
SuperMap.Plot.SMLInfoStruct = new SuperMap.Class({

    /**
     * APIProperty: fieldRootName
     * {String} 态势图名称
     */
    SMLName:"",

    /**
     * APIProperty: fieldRootDesc
     * {String} 态势图描述名
     */
    SMLDesc:"",

    /**
     * APIProperty: fieldRootSeclevel
     * {String} 态势图密级
     */
    SMLSeclevel:"",

    /**
     * APIProperty: fieldRootDepat
     * {String} 态势图所属部门
     */
    SMLDepat:"",

    /**
     * APIProperty: fieldRootAuthor
     * {String} 态势图作者
     */
    SMLAuthor:"",

    /**
     * APIProperty: fieldRootTime
     * {String} 态势图创建时间
     */
    SMLTime:"",

    /**
     * Constructor: SuperMap.Plot.SMLInfoStruct
     * 创建一个态势图基本信息结构。
     *
     * Parameters:
     * options - {Object} 态势图信息参数
     *
     * Returns:
     * {<SuperMap.Plot.SMLInfoStruct>} 新的图层结构。
     */
    initialize:function(options){
        if(options){
            this.SMLName = options.SMLName;
            this.SMLDesc = options.SMLDesc;
            this.SMLSeclevel = options.SMLSeclevel;
            this.SMLDepat = options.SMLDepat;
            this.SMLAuthor = options.SMLAuthor;
            this.SMLTime = options.SMLTime;
        }
    },

    /**
     * APIMethod: toJSON
     * 将态势图信息结构转成JSON格式数据
     *
     * Returns:
     * {String} 态势图信息结构的JSON格式字符串。
     */
    toJSON:function () {

        var str = null;
        str =  "{\"SMLName\":"+ SuperMap.Plot.PlottingUtil.toJSON(this.SMLName)
        +",\"SMLDesc\":"+ SuperMap.Plot.PlottingUtil.toJSON(this.SMLDesc)
        +",\"SMLSeclevel\":"+ SuperMap.Plot.PlottingUtil.toJSON(this.SMLSeclevel)
        +",\"SMLDepat\":"+ SuperMap.Plot.PlottingUtil.toJSON(this.SMLDepat)
        +",\"SMLAuthor\":"+ SuperMap.Plot.PlottingUtil.toJSON(this.SMLAuthor)
        +",\"SMLTime\":"+ SuperMap.Plot.PlottingUtil.toJSON(this.SMLTime)
        + "}";
        return str;
    },
    CLASS_NAME:"SuperMap.Plot.SMLInfoStruct"
});

/* COPYRIGHT 2012 SUPERMAP
 * 本程序只能在有效的授权许可下使用。
 * 未经许可，不得以任何手段擅自使用或传播。*/

/**
 * @requires SuperMap/
 * @requires SuperMap/
 */
/**
 * Class: SuperMap.Plot.LayerDataStruct
 * 标识态势图上的每一个图层信息，图层名和图层上的所有要素。
 */
SuperMap.Plot.LayerDataStruct = new SuperMap.Class({
    /**
     * APIProperty: layerName
     * {String} 图层名称
     */
    layerName: null,

    /**
     * APIProperty: featrues
     * {Array(<SuperMap.Feature.Vector>)} 图层上的所有要素。
     */
    featrues: null,

    /**
     * Constructor: SuperMap.Plot.LayerDataStruct
     * 创建一个图层结构。
     *
     * Parameters:
     * options - {Object} 图层结构。
     *
     * Returns:
     * {<SuperMap.Plot.LayerDataStruct>} 新的图层结构。
     */
    initialize:function(options){
        if(options && options.layerName){
            this.layerName = options.layerName;
        }

        if(options && options.features){
            this.features = options.features;
        }
    },

    /**
     * APIMethod: toJSON
     * 将图层结构转成JSON格式数据
     *
     * Returns:
     * {String} 图层结构的JSON格式字符串。
     */
    toJSON: function () {
        var featureDatas = [];
        for(var i = 0; i < this.featrues.length; i++){
            featureDatas.push(this.featrues[i].geometry.symbolData);
        }

        var str =  "{\"layerName\":"+ SuperMap.Plot.PlottingUtil.toJSON(this.layerName) +",\"featrues\":"+ SuperMap.Plot.PlottingUtil.toJSON(featureDatas) + "}";
        return str;
    },

    CLASS_NAME:"SuperMap.Plot.LayerDataStruct"
});