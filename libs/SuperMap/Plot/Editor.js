/* COPYRIGHT 2012 SUPERMAP
 * 本程序只能在有效的授权许可下使用。
 * 未经许可，不得以任何手段擅自使用或传播。*/

/**
 * @requires SuperMap/
 * @requires SuperMap/
 */
/**
 * Class: SuperMap.Plot.Editor
 * 标号对象编辑类，负责标号对象编辑操作（拷贝、粘贴、剪切）。
 */
SuperMap.Plot.Editor = new SuperMap.Class({

    /**
     * Property: map
     * {SuperMap.Map}
     */
    map: null,

    /**
     * Property: pastGeoAry
     * {Array(<SuperMap.Feature.Vector>)}用于存放拷贝对象的数组。该数组保存的为对象本身，即使用时需要复制。
     */
    pastGeoAry: null,

    /**
     * APIProperty: activeLayer
     * {<SuperMap.Layer.PlottingLayer>} 可编辑标号对象所在图层，未设置取第一个可编辑图层。
     */
    activeLayer: null,

    /**
     * APIProperty: plotingEdit
     * {<SuperMap.Control.PlottingEdit>} 标号对象的鼠标编辑控件。
     */
    plotingEdit: null,

    /**
     * Constructor: SuperMap.Plot.Editor
     * 构建一个图形对象编辑类。
     *
     * Parameters:
     * map - {<SuperMap.Map>}。
     * options - {Object} 此类与父类提供的属性。
     *
     * Returns:
     * {<SuperMap.Plot.Editor>}  结果类型对象。
     */
    initialize: function(map, options){
        if(map && map !== null){
            this.map = map;
        }

        if(options && options.activeLayer){
            this.activeLayer = options.activeLayer;
        }
        if(options && options.plotingEdit){
            this.plotingEdit = options.plotingEdit;
        }

        this.pastGeoAry = [];
    },

    /**
     * APIMethod: destroy
     * 销毁对象，释放资源。
     */
    destroy: function() {
        this.pastGeoAry = null;
    },

    /**
     * Method: init
     * 初始化当前活动图层以及标绘对象编辑控件。
     */
    init: function(){
        if(this.activeLayer === null){
            var layers = this.map.layers;
            for (var n = 0; n < layers.length; n++) {
                if (layers[n].isEditable) {
                    this.activeLayer = layers[n];
                    break;
                }
            }
        }

        if(this.plotingEdit === null ) {
            var controls = this.map.controls;
            for (var m = 0; m < controls.length; m++) {
                if (controls[m].CLASS_NAME === "SuperMap.Control.PlottingEdit" && controls[m].layer === this.activeLayer) {
                    this.plotingEdit = controls[m];
                }
            }
        }
    },

    /**
     * APIMethod: copy
     * 拷贝选中的标号对象。
     */
    copy: function(){
        this.pastGeoAry = [];

        this.init();

        for(var i = 0;i < this.activeLayer.selectedFeatures.length; i++){
            var feature = this.activeLayer.selectedFeatures[i];
            if(feature.geometry.CLASS_NAME === "SuperMap.Geometry.GeoGraphicObject.DotSymbol" ||
                (feature.geometry.CLASS_NAME === "SuperMap.Geometry.GeoGraphicObject.AlgoSymbol"))
            {
                this.pastGeoAry.push(feature);
            }
        }
    },

    /**
     * APIMethod: cut
     *  剪切选中的图形对象。
     */
    cut: function(){
        this.pastGeoAry = [];

        this.init();

        for(var i = 0;i < this.activeLayer.selectedFeatures.length; i++){
            var feature = this.activeLayer.selectedFeatures[i];
            if(feature.geometry.CLASS_NAME === "SuperMap.Geometry.GeoGraphicObject.DotSymbol" ||
                (feature.geometry.CLASS_NAME === "SuperMap.Geometry.GeoGraphicObject.AlgoSymbol"))
            {
                SuperMap.Util.removeItem(this.activeLayer.selectedFeatures, feature);
                SuperMap.Util.removeItem(this.activeLayer.features, feature);
                this.plotingEdit.unselectFeature(feature);
                i--;
                this.pastGeoAry.push(feature);
            }
        }

    },

    /**
     * APIMethod: paste
     *  粘贴选中的图形对象。
     */
    paste: function(){

        this.init();

        for(var i = 0;i < this.pastGeoAry.length; i++){
            var feature = this.pastGeoAry[i];
            if(feature.geometry.CLASS_NAME === "SuperMap.Geometry.GeoGraphicObject.DotSymbol" ||
                (feature.geometry.CLASS_NAME === "SuperMap.Geometry.GeoGraphicObject.AlgoSymbol"))
            {
                var copyFeature = feature.clone();
                if(feature.style)
                    copyFeature.style = SuperMap.Util.copyAttributes(copyFeature.style, feature.style);
                copyFeature.layer = feature.layer;
                copyFeature.geometry.feature = copyFeature;
                copyFeature.geometry.calculateParts();
                this.activeLayer.drawFeature(copyFeature,copyFeature.style);
                this.activeLayer.features.push(copyFeature);
            }
        }
    },

    CLASS_NAME: "SuperMap.Plot.Editor"
});