/* COPYRIGHT 2012 SUPERMAP
 * 本程序只能在有效的授权许可下使用。
 * 未经许可，不得以任何手段擅自使用或传播。*/

/**
 * @requires SuperMap/
 * @requires SuperMap/
 */
/**
 * Class: SuperMap.Plot.SitDataManager
 * 态势数据管理类。
 */

SuperMap.Plot.SitDataManager = new SuperMap.Class({

    /**
     * APIProperty: map
     * <SuperMap.Map>
     */
    map: null,

    /**
     * APIProperty: serverUrl
     * {String} 表示标绘服务的URI
     */
    serverUrl: "",

    /**
     * APIProperty: activeLayer
     * {<SuperMap.Layer.PlottingLayer>} 当前图层，未设置则取第一个可编辑图层
     */
    activeLayer: null,

    /**
     * APIProperty: smlInfo
     * {<SuperMap.Plot.SMLInfoStruct>} 当前打开的态势图信息
     */
    smlInfo: null,

    /**
     * APIProperty: smlFileName
     * {String} 当前打开的态势图在发布时的名称
     */
    smlFileName: null,

    /**
     * Constant: EVENT_TYPES
     * 支持应用事件的类型。
     **/
    EVENT_TYPES: ["getSMLInfosSuccess", "getSMLInfosFail","openSmlFileSuccess","openSmlFileFail","getSMLInfoSuccess", "getSMLInfoFail", "addSmlFileSuccess", "addSmlFileFail", "addSmlFileToLayerSuccess", "addSmlFileToLayerFail", "deleteSmlFileSuccess", "deleteSmlFileFail"],

    /**
     * APIProperty: events
     * {<SuperMap.Events>} 事件对象。
     */
    events: null,

    /**
     * APIProperty: eventListeners
     * {Object} 如果在构造方法中设置此选项，事件监听对象将注册。
     */
    eventListeners:null,

    /**
     * Constructor: SuperMap.Plot.SitDataManager
     * 态势数据管理对象。
     *
     * Parameters:
     * map - <SuperMap.Map>。
     * serverUrl - {String} 标绘服务地址
     * options - {Object} 此类与父类提供的属性。
     *
     * Returns:
     * {<SuperMap.Plot.SitDataManager>}  结果类型对象。
     */
    initialize: function(map, serverUrl, options){
        if(map && map !== null){
            this.map = map;
        }

        if(serverUrl){
            this.serverUrl = serverUrl;
        }

        if(options && options.activeLayer){
            this.activeLayer = options.activeLayer;
        }

        this.events = new SuperMap.Events(
            this, null, this.EVENT_TYPES, true
        );

        if (this.eventListeners instanceof Object) {
            this.events.on(this.eventListeners);
        }

        this.smlInfo = new SuperMap.Plot.SMLInfoStruct();
        this.smlFileName = "situationMap";
    },

    /**
     * APIMethod: destroy
     * 销毁图形对象数据管理对象。
     *
     */
    destroy:function() {
        if(this.eventListeners) {
            this.events.un(this.eventListeners);
            this.eventListeners = null;
        }
        this.events.destroy();
        this.events = null;
    },

    /**
     * Method: getCurrentLayer
     * 获取第一个可编辑图层。
     *
     * Returns:
     * {<SuperMap.Layer.Plottinglayer>}  结果类型对象。
     */
    getCurrentLayer: function(){
        if(this.activeLayer === null){
            var layers = this.map.layers;
            for(var n = 0;n < layers.length; n++){
                if(layers[n].isEditable) {
                    this.activeLayer = layers[n];
                    break;
                }
            }
        }
    },

    /**
     * Method: getSitDataLayers
     * 获取态势图上所有的标绘图层。
     *
     * Returns:
     * {Array(<SuperMap.Layer.Plottinglayer>)}  图层数组。
     */
    getSitDataLayers: function(){
        var sitDataLayers = [];
        for(var i = 0; i < this.map.layers.length; i++){
            if(this.map.layers[i].CLASS_NAME === "SuperMap.Layer.PlottingLayer"){
                sitDataLayers.push(this.map.layers[i]);
            }
        }

        return sitDataLayers;
    },

    /**
     * APIMethod: openSmlFile
     * 打开态势图文件(本地)，并将其上传到服务器。删除当前态势图中的所有图层,重新加载该态势图。
     *
     * Parameters:
     *  fileId - {String} 要打开的本地态势图文件div的id。
     *  success - {Function} 打开态势文件成功处理函数 。
     *  fail - {Function} 打开态势文件失败处理函数。
     */
    openSmlFile: function(fileId, success, fail){
        var url = this.serverUrl + "smlInfos/";
        var temp =document.getElementById(fileId).value;

        var ary = temp.split("\\");
        var smlFileName =ary[ary.length-1];
        url+= smlFileName;
        var me = this;
        if(smlFileName !== ""){
            $.ajaxFileUpload({
                url: url,
                secureuri: false,
                fileElementId: fileId,
                dataType: 'json',
                timeout: 60 * 60 * 1000,
                success: function (data, status) {
                    me.openSmlFileOnServer(smlFileName, success, fail);
                },
                error: function (data, status, e) {
                    fail();
                }
            });
        }
    },

    /**
     * APIMethod: addSmlFile
     *  叠加态势图文件（本地）。首先需要将本地的态势图文件上传到服务器，再叠加。
     *
     * Parameters:
     *  fileId - {string} 要上传到服务器的态势图文件的div的id。
     *  bAllLayer -{bool} 是否叠加所有图层,如果是true，将所有图层叠加到当前的态势图上。如果是false，则只叠加与当前态势图相同的图层。
     *  success - {Function}叠加态势文件到指定图层成功的回调处理函数叠加态势文件到指定图层成功的回调处理函数(用户指定)
     *  fail - {Function}叠加态势文件到指定图层失败的回调处理函数(用户指定)
     */
    addSmlFile: function(fileId, bAllLayer, success, fail){

        var url = this.serverUrl + "smlInfos/";
        var temp = document.getElementById(fileId).value;

        var ary = temp.split("\\");
        var smlFileName = ary[ary.length-1];
        url += smlFileName;
        var me = this;
        if(smlFileName !== ""){
            $.ajaxFileUpload({
                url: url,
                secureuri: false,
                fileElementId: fileId,
                dataType: 'json',
                timeout: 60 * 60 * 1000,
                success: function (data, status) {
                    me.getCurrentLayer();
                    me.addSmlFileOnServer(smlFileName, bAllLayer, success, fail);
                },
                error: function (data, status, e) {
                    fail();
                }
            });
        }
    },

    /**
     * APIMethod: addSmlFileToLayer
     *  叠加态势文件(本地)到指定的图层。首先需要将本地的态势图文件上传到服务器，再叠加。
     *
     * Parameters:
     *  fileId - {String} 要上传到服务器的态势图文件的div的id。
     *  layerName - {String} 需要叠加的图层名称
     *  success - {Function}叠加态势文件到指定图层成功的回调处理函数叠加态势文件到指定图层成功的回调处理函数(用户指定)
     *  fail - {Function}叠加态势文件到指定图层失败的回调处理函数(用户指定)
     */
    addSmlFileToLayer: function (fileId, layerName, success, fail) {
        var url = this.serverUrl+ "smlInfos/";
        var temp =document.getElementById(fileId).value;//file.value;

        var ary = temp.split("\\");
        var smlFileName = ary[ary.length-1];
        url+= smlFileName;
        var me = this;
        if(smlFileName !== ""){
            $.ajaxFileUpload({
                url: url,
                secureuri: false,
                fileElementId: fileId,
                dataType: 'json',
                timeout: 60 * 60 * 1000,
                success: function (data, status) {
                    me.addSmlFileToLayerOnServer(smlFileName, layerName, success, fail);
                },
                error: function (data, status, e) {
                    fail();
                }
            });
        }

    },

    /**
     * APIMethod: uploadSmlFile
     *  上传态势图文件。
     *
     * Parameters:
     *  fileId - {string} 要上传到服务器的态势图文件的div的id。
     *  success - {Function} 上传态势文件到服务器成功的回调处理函数叠加态势文件到指定图层成功的回调处理函数(用户指定)
     *  fail - {Function} 上传态势文件到服务器失败的回调处理函数(用户指定)
     */
    uploadSmlFile: function(fileId, success, fail){
        var url = this.serverUrl + "smlInfos/";
        var temp =document.getElementById(fileId).value;

        var ary = temp.split("\\");
        var filename =ary[ary.length-1];
        url += filename;
        if(filename !== ""){
            $.ajaxFileUpload({
                url: url,
                secureuri: false,
                fileElementId: fileId,
                dataType: 'json',
                timeout: 60 * 60 * 1000,
                success: function (data, status) {
                    success();
                },
                error: function (data, status, e) {
                    fail();
                }
            });
        }
    },

    /**
     * APIMethod: addSmlFileToLayerOnServer
     *  叠加已发布的态势图到指定图层。
     *
     * Parameters:
     *  smlFileName - {String} 保存态势图文件时的名称。
     *  layerName - {String} 指定的图层名称。
     *  success - {Function} 叠加态势文件到指定图层成功的回调处理函数叠加态势文件到指定图层成功的回调处理函数(用户指定)
     *  fail - {Function} 叠加态势文件到指定图层失败的回调处理函数(用户指定)
     */
    addSmlFileToLayerOnServer:function(smlFileName, layerName, success, fail){
       function getCompleted(result){
           var sitData = result.originResult;
           var layerDatas =  sitData.layerDatas;

           var featureLayer = null;
           var layers = this.map.getLayersByName(layerName);
           if(layers.length !== 0){
               featureLayer = layers[0];
           } else {
               featureLayer = new SuperMap.Layer.PlottingLayer(layerName, this.serverUrl);
               var plottingEdit = new SuperMap.Control.PlottingEdit(featureLayer);
               var drawGraphicObject = new SuperMap.Control.DrawFeature(featureLayer, SuperMap.Handler.GraphicObject);
               this.map.addLayers([featureLayer]);
               this.map.addControls([plottingEdit, drawGraphicObject]);
           }

           for(var i = 0; i < layerDatas.length; i++){
               var ary  = [];
               for(var m = 0; m < layerDatas[i].featrues.length; m++)
               {
                   var geoGraphicObject = SuperMap.Geometry.GeoGraphicObject.getGeometry(layerDatas[i].featrues[m],featureLayer,this.serverUrl);
                   if(layerDatas[i].featrues[m].localePoints){
                       if(layerDatas[i].featrues[m].symbolType === 1){
                           geoGraphicObject.locationPoints = [];
                       } else {
                           geoGraphicObject.controlPoints = [];
                       }

                       for(var j = 0; j < layerDatas[i].featrues[m].localePoints.length; j++){
                           var localePoint = new SuperMap.Geometry.Point(layerDatas[i].featrues[m].localePoints[j].x, layerDatas[i].featrues[m].localePoints[j].y);
                           if(layerDatas[i].featrues[m].symbolType === 1){
                               geoGraphicObject.locationPoints.push(localePoint);
                           } else {
                               geoGraphicObject.controlPoints.push(localePoint);
                           }
                       }
                   }

                   var feature = new SuperMap.Feature.Vector(geoGraphicObject);
                   var featureStyle = SuperMap.Plot.AnalysisSymbol.getStyle(layerDatas[i].featrues[m]);
                   if(featureStyle){
                       feature.style = SuperMap.Util.copyAttributes(feature.style, featureStyle);
                   }
                   feature.layer = featureLayer;

                   geoGraphicObject.feature = feature;
                   geoGraphicObject.calculateParts();
                   ary.push(feature);
               }

               featureLayer.features = ary;

               for(var k = 0;k < ary.length; k++){
                   featureLayer.drawFeature(ary[k], ary[k].style, {isNewAdd:true});
               }
           }

           this.events.triggerEvent("addSmlFileToLayerSuccess");
       }

       //获取数据失败
       function getFailed(result){
           this.events.triggerEvent("addSmlFileToLayerFail");
       }

       this.events.on({
           "addSmlFileToLayerSuccess": success,
           "addSmlFileToLayerFail": fail
       })

       //对接iserver中的服务
       var editSmlFile = new SuperMap.REST.EditSmlFileService(this.serverUrl, {"smlFileName": smlFileName});
       editSmlFile.events.on({
           "processCompleted": getCompleted,
           "processFailed": getFailed,
           scope: this
       });

       var editSmlFileParams = new SuperMap.REST.EditSmlFileParameters();
        editSmlFileParams.method = "GET";
       editSmlFile.processAsync(editSmlFileParams);
    },

    /**
     * APIMethod: addSmlFileOnServer
     *  叠加已发布的态势图到当前态势图。
     *
     * Parameters:
     *  smlFileName - {String} 保存态势图文件时的名称。
     *  bAllLayer - {bool} 是否叠加所有图层,如果是true，将所有图层叠加到当前的态势图上。如果是false，则只叠加与当前态势图相同的图层。
     *  success - {Function} 叠加态势文件到当前态势图成功的回调处理函数(用户指定)
     *  fail - {Function} 叠加态势文件到当前态势图失败的回调处理函数(用户指定)
     */
    addSmlFileOnServer:function(smlFileName, bAllLayer, success, fail){
        function getCompleted(result){
            var sitData = result.originResult;
            var layerDatas =  sitData.layerDatas;
            for(var i = 0; i < layerDatas.length; i++){
                var featureLayer = null;

                var layers = this.map.getLayersByName(layerDatas[i].layerName);
                if(layers.length !== 0){
                    featureLayer = layers[0];
                } else {
                    if(bAllLayer){
                        featureLayer = new SuperMap.Layer.PlottingLayer(layerDatas[i].layerName, this.serverUrl);
                        var plottingEdit = new SuperMap.Control.PlottingEdit(featureLayer);
                        var drawGraphicObject = new SuperMap.Control.DrawFeature(featureLayer, SuperMap.Handler.GraphicObject);
                        this.map.addLayers([featureLayer]);
                        this.map.addControls([plottingEdit, drawGraphicObject]);
                    }
                }

                if(featureLayer === null){
                    continue;
                }

                var ary  = [];
                for(var m = 0; m < layerDatas[i].featrues.length; m++)
                {
                    var geoGraphicObject = SuperMap.Geometry.GeoGraphicObject.getGeometry(layerDatas[i].featrues[m],featureLayer,this.serverUrl);
                    if(layerDatas[i].featrues[m].localePoints){
                        if(layerDatas[i].featrues[m].symbolType === 1){
                            geoGraphicObject.locationPoints = [];
                        } else {
                            geoGraphicObject.controlPoints = [];
                        }

                        for(var j = 0; j < layerDatas[i].featrues[m].localePoints.length; j++){
                            var localePoint = new SuperMap.Geometry.Point(layerDatas[i].featrues[m].localePoints[j].x, layerDatas[i].featrues[m].localePoints[j].y);
                            if(layerDatas[i].featrues[m].symbolType === 1){
                                geoGraphicObject.locationPoints.push(localePoint);
                            } else {
                                geoGraphicObject.controlPoints.push(localePoint);
                            }
                        }
                    }

                    var feature = new SuperMap.Feature.Vector(geoGraphicObject);
                    var featureStyle = SuperMap.Plot.AnalysisSymbol.getStyle(layerDatas[i].featrues[m]);
                    if(featureStyle){
                        feature.style = SuperMap.Util.copyAttributes(feature.style, featureStyle);
                    }
                    feature.layer = featureLayer;

                    geoGraphicObject.feature = feature;
                    geoGraphicObject.calculateParts();
                    ary.push(feature);
                }

                featureLayer.features = ary;

                for(var k = 0;k < ary.length; k++){
                    featureLayer.drawFeature(ary[k], ary[k].style, {isNewAdd:true});
                }
            }

            this.events.triggerEvent("addSmlFileSuccess");
        }
        //获取数据失败
        function getFailed(result){
            this.events.triggerEvent("addSmlFileFail");
        }

        this.events.on({
            "addSmlFileSuccess": success,
            "addSmlFileFail": fail
        })
        //对接iserver中的服务
        var editSmlFile = new SuperMap.REST.EditSmlFileService(this.serverUrl, {"smlFileName": smlFileName});
        editSmlFile.events.on({
            "processCompleted": getCompleted,
            "processFailed": getFailed,
            scope: this
        });

        var editSmlFileParams = new SuperMap.REST.EditSmlFileParameters();
        editSmlFileParams.method = "GET";
        editSmlFile.processAsync(editSmlFileParams);
    },

    /**
     * APIMethod: downloadSmlFileURL
     * 从服务器上获取指定的态势文件的下载地址
     *
     * Parameters:
     *  smlFileName -  {String}保存态势图文件时的名称。
     */
    downloadSmlFileURL:function(smlFileName){
        return "smlFileDownload/" + smlFileName;
    },

    /**
     * APIMethod: newSmlFile
     * 新建态势图，会清空当前态势图。
     */
    newSmlFile: function(){
        this.smlFileName = "";
        this.smlInfo.clear();

        var allLayers = this.map.layers;
        for(var j = 0; j < allLayers.length; )
        {
            if(allLayers[j].CLASS_NAME === "SuperMap.Layer.PlottingLayer"){
                allLayers[j].removeAllFeatures();
                this.map.removeControl(allLayers[j].plotingEdit);
                this.map.removeControl(allLayers[j].drawGraphicObject);
                this.map.removeLayer(allLayers[j],false);
            } else {
                j++;
            }
        }
    },

    /**
     * APIMethod: saveSmlFile
     * 保存当前的态势图上所有图层的要素到服务器，若服务器已存在该态势图则覆盖。
     */
    saveSmlFile: function(){
        if(this.smlFileName !== ""){
            this.save(this.smlFileName, true);
        }
    },

    /**
     * APIMethod: saveAsSmlFile
     * 另存当前态势图数据到服务器
     *
     * Parameters:
     *  smlFileName - {String} 保存到服务器的态势图文件名称。
     */
    saveAsSmlFile: function(smlFileName){
        this.save(smlFileName, false);
    },

    /**
     * APIMethod: saveLayersToSmlFile
     * 发布态势图上指定图层的数据到指定态势图。
     *
     * Parameters:
     *  smlFileName - {String} 保存到服务器的态势图文件名称。
     *  layerNames - {String} 需要保存的图层名称的集合。
     */
    saveLayersToSmlFile: function(smlFileName, layerNames){
        var saveLayers = [];
        if(!SuperMap.Util.isArray(layerNames)){
            layerNames = [layerNames];
        }

        for(var j = 0; j < layerNames.length; j++){
            saveLayers.concat(this.map.getLayersByName(layerNames[j]));
        }

        var sitData = new SuperMap.Plot.SitDataStruct();
        sitData.smlInfo = this.smlInfo;
        sitData.layerDatas = [];

        for(var k = 0; k < saveLayers.length; k++){
            var layerdata = new SuperMap.Plot.LayerDataStruct();
            layerdata.layerName = saveLayers[k].layerName;

            var features = [];
            var  LayerFeatrues = saveLayers[k].features;
            for(var i = 0; i < LayerFeatrues.length; i++){
                var feature = LayerFeatrues[i].clone();
                if((feature.geometry.CLASS_NAME === "SuperMap.Geometry.GeoGraphicObject.DotSymbol") ||
                    (feature.geometry.CLASS_NAME === "SuperMap.Geometry.GeoGraphicObject.AlgoSymbol")){
                    if(feature.geometry.symbolData != null && feature.geometry.symbolData.symbolType === 1){
                        feature.geometry.symbolData.localePoints = feature.geometry.locationPoints;
                    } else {
                        feature.geometry.symbolData.localePoints = feature.geometry.controlPoints;
                    }

                    features.push(feature);
                }
            }

            layerdata.featrues = features;
            sitData.layerDatas.push(layerdata);
        }

        // 获取数据成功
        function getCompleted(result){
            console.log(result);
        }

        //获取数据失败
        function getFailed(result){
            console.log(result);
        }

        //对接iserver中的服务
        var editSmlFile = new SuperMap.REST.EditSmlFileService(this.serverUrl, {"smlFileName": smlFileName});
        editSmlFile.events.on({
            "processCompleted": getCompleted,
            "processFailed": getFailed,
            scope: this
        });

        var editSmlFileParams = new SuperMap.REST.EditSmlFileParameters();
        editSmlFileParams.method = "POST";
        editSmlFileParams.sitData = sitData;
        editSmlFile.processAsync(editSmlFileParams);
    },

    /**
     * APIMethod: getSMLInfo
     *  获取指定的态势图信息。
     *
     * Parameters:
     * smlFileName - {String}态势图文件名称，即保存到服务器时使用的名称。
     * getSuccess - {Function}获取态势图信息成功处理函数文件。
     * getFail - {Function}获取态势图信息失败处理函数 。
     */
    getSMLInfo: function(smlFileName, getSuccess, getFail){
        function getCompleted(result){
            this.events.triggerEvent("getSMLInfoSuccess", result.originResult.smlInfo);
        }

        //获取数据失败
        function getFailed(result){
            this.events.triggerEvent("getSMLInfoFail", null);
        }

        //对接iserver中的服务
        var editSmlFile = new SuperMap.REST.EditSmlFileService(this.serverUrl, {"smlFileName": smlFileName});
        editSmlFile.events.on({
            "processCompleted": getCompleted,
            "processFailed": getFailed,
            scope: this
        });
        this.events.on({
            "getSMLInfoSuccess": getSuccess,
            "getSMLInfoFail": getFail
        });
        var editSmlFileParams = new SuperMap.REST.EditSmlFileParameters();
        editSmlFileParams.method = "GET";
        editSmlFile.processAsync(editSmlFileParams);
    },

    /**
     * APIMethod: getSMLInfos
     * 获取服务器上用户发布的态势图文件列表
     *
     * Parameters:
     *  page - {Integer} 第几页，从第一页开始计数。
     *  pageSize - {Integer} 每页上查询的记录的条数。
     *  success - {Function} 获取列表成功的处理函数。
     *  fail - {Function} 获取列表失败的处理函数
     */
    getSMLInfos: function(page, pageSize, success, fail){
        function getCompleted(result){
            this.events.triggerEvent("getSMLInfosSuccess", result.originResult);
        }

        //获取数据失败
        function getFailed(result){
            this.events.triggerEvent("getSMLInfosFail", result);
        }

        var start =  page * pageSize ;
        var count = pageSize;
        //对接iserver中的服务
        var servervice = new SuperMap.REST.GetSMLInfosService(this.serverUrl);
        servervice.events.on({
            "processCompleted": getCompleted,
            "processFailed": getFailed,
            scope: this
        });

        this.events.on({
            "getSMLInfosSuccess": success,
            "getSMLInfosFail": fail
        });
        var serverviceParams = new SuperMap.REST.GetSMLInfosParameters();
        serverviceParams.start = start;
        serverviceParams.count = count;
        servervice.processAsync(serverviceParams);
    },

    /**
     * APIMethod: openSmlFileOnServer
     * 打开指定的已发布态势图文件到指定图层，未指定图层则加载到this.activeLayer。
     *
     * Parameters:
     *  smlFileName - {String} 态势图文件保存到服务器时的名字。
     *  success - {Function} 打开态势文件成功的处理函数，可以为空
     *  fail - {Function} 打开态势文件失败的处理函数，可以为空
     */
    openSmlFileOnServer: function (smlFileName, success, fail) {
        function getCompleted(result){
            var sitData = result.originResult;
            this.smlInfo = sitData.smlInfo;
            this.smlFileName = smlFileName;
            var layerDatas =  sitData.layerDatas;

            var allLayers = this.map.layers;
            for(var j = 0; j < allLayers.length; )
            {
                if(allLayers[j].CLASS_NAME === "SuperMap.Layer.PlottingLayer"){
                    allLayers[j].removeAllFeatures();
                    this.map.removeControl(allLayers[j].plotingEdit);
                    this.map.removeControl(allLayers[j].drawGraphicObject);
                    this.map.removeLayer(allLayers[j],false);
                } else {
                    j++;
                }
            }

            for(var i = 0; i < layerDatas.length; i++){
                var featureLayer = new SuperMap.Layer.PlottingLayer(layerDatas[i].layerName, this.serverUrl);
                var plottingEdit = new SuperMap.Control.PlottingEdit(featureLayer);
                var drawGraphicObject = new SuperMap.Control.DrawFeature(featureLayer, SuperMap.Handler.GraphicObject);
                this.map.addLayers([featureLayer]);
                this.map.addControls([plottingEdit, drawGraphicObject]);

                var ary = [];
                for(var m = 0; m < layerDatas[i].featrues.length; m++)
                {
                    var geoGraphicObject = SuperMap.Geometry.GeoGraphicObject.getGeometry(layerDatas[i].featrues[m],featureLayer,this.serverUrl);
                    if(layerDatas[i].featrues[m].localePoints){
                        if(layerDatas[i].featrues[m].symbolType === 1){
                            geoGraphicObject.locationPoints = [];
                        } else {
                            geoGraphicObject.controlPoints = [];
                        }

                        for(var j = 0; j < layerDatas[i].featrues[m].localePoints.length; j++){
                            var localePoint = new SuperMap.Geometry.Point(layerDatas[i].featrues[m].localePoints[j].x, layerDatas[i].featrues[m].localePoints[j].y);
                            if(layerDatas[i].featrues[m].symbolType === 1){
                                geoGraphicObject.locationPoints.push(localePoint);
                            } else {
                                geoGraphicObject.controlPoints.push(localePoint);
                            }
                        }
                    }

                    var feature = new SuperMap.Feature.Vector(geoGraphicObject);
                    var featureStyle = SuperMap.Plot.AnalysisSymbol.getStyle(layerDatas[i].featrues[m]);
                    if(featureStyle){
                        feature.style = SuperMap.Util.copyAttributes(feature.style, featureStyle);
                    }
                    feature.layer = featureLayer;

                    geoGraphicObject.feature = feature;
                    geoGraphicObject.calculateParts();

                    ary.push(feature);

                    featureLayer.features.push(feature);
                }

                for(var k = 0;k < ary.length; k++){
                    featureLayer.drawFeature(ary[k], ary[k].style, {isNewAdd:true});
                }
            }

            this.activeLayer = null;
            this.getCurrentLayer();
            this.events.triggerEvent("openSmlFileSuccess");
        }

        //获取数据失败
        function getFailed(result){
            this.events.triggerEvent("openSmlFileFail");
        }

        this.events.on({
            "openSmlFileSuccess": success,
            "openSmlFileFail": fail
        });

        this.getCurrentLayer();
        //对接iserver中的服务
        var editSmlFile = new SuperMap.REST.EditSmlFileService(this.serverUrl, {"smlFileName": smlFileName});
        editSmlFile.events.on({
            "processCompleted": getCompleted,
            "processFailed": getFailed,
            scope: this
        });

        var editSmlFileParams = new SuperMap.REST.EditSmlFileParameters();
        editSmlFileParams.method = "GET";
        editSmlFile.processAsync(editSmlFileParams);
    },

    /**
     * APIMethod: deleteSmlFileOnServer
     * 删除指定的已发布态势图文件。
     *
     * Parameters:
     *  smlFileName -  {String} 保存到服务器时的态势图文件名称
     *  success - {Function} 删除态势图文件成功的处理函数，可以为空
     *  fail - {Function} 删除态势图文件失败的处理函数，可以为空
     */
    deleteSmlFileOnServer: function(smlFileName, success, fail){
        // 获取数据成功
        function getCompleted(result){
            this.events.triggerEvent("deleteSmlFileSuccess");
        }

        //获取数据失败
        function getFailed(result){
            this.events.triggerEvent("deleteSmlFileFail");
        }

        this.events.on({
            "deleteSmlFileSuccess": success,
            "deleteSmlFileFail": fail
        });

        //对接iserver中的服务
        var editSmlFile = new SuperMap.REST.EditSmlFileService(this.serverUrl, {"smlFileName": smlFileName});
        editSmlFile.events.on({
            "processCompleted": getCompleted,
            "processFailed": getFailed,
            scope: this
        });

        var editSmlFileParams = new SuperMap.REST.EditSmlFileParameters();
        editSmlFileParams.method = "DELETE";
        editSmlFile.processAsync(editSmlFileParams);
    },

    /**
     * APIMethod: getGObjectByExtendProperty
     * 根据自定义属性关键字进行查找，查找的结果是图形对象的集合数组
     *
     * Parameters:
     *  key -  {String}自定义属性的关键字。
     *
     *  Returns：
     *  {Array(<SuperMap.Feature.Vector>)} 满足条件的标号对象数组
     *
     */
    getGObjectByExtendProperty: function(key){
        var array = [];

        var layers = this.map.layers;
        for(var ll = 0; ll < layers.length; ll++) {
            if(layers[ll].isBaseLayer === true){
                continue;
            }

            var features = layers[ll].features;
            for(var i = 0; i < features.length; i++){
                if(features[i].geometry.getExtendProperty().findProperty(key) !== null) {
                    array.push(features[i]);
                }
            }
        }

        return array;
    },

    /**
     * APIMethod: getGObjectByCode
     * 根据标号库ID和code查找图形对象
     *
     * Parameters:
     *  libID - {Integer} 标号库ID。
     *  code - {Integer} 标号标识code
     *
     *  Returns：
     *  {Array(<SuperMap.Feature.Vector>)} 满足条件的标号对象数组
     */
    getGObjectByCode:function(libID,code){
        var array = [];

        var layers = this.map.layers;
        for(var ll = 0; ll < layers.length; ll++) {
            if(layers[ll].isBaseLayer === true){
                continue;
            }

            var features = layers[ll].features;
            for(var i = 0; i < features.length; i++){
                if(features[i].geometry.code === code && features[i].geometry.libID === libID) {
                    array.push(features[i]);
                }
            }
        }

        return array;
    },

    /**
     * APIMethod: getGObjectByName
     * 根据名称查找图形对象
     *
     * Parameters:
     *  name -  {String}符号名称。
     *
     *  Returns：
     *  {Array(<SuperMap.Feature.Vector>)} 满足条件的标号对象数组
     */
    getGObjectByName:function(name){
        var array = [];

        var layers = this.map.layers;
        for(var ll = 0; ll < layers.length; ll++) {
            if(layers[ll].isBaseLayer === true){
                continue;
            }

            var features = layers[ll].features;
            for(var i = 0; i < features.length; i++){
                if(features[i].geometry.symbolName === name) {
                    array.push(features[i]);
                }
            }
        }

        return array;
    },

    /**
     * APIMethod: getGObjectByID
     * 根据ID查找图形对象
     *
     * Parameters:
     *  szID -  {String}图形对象ID。
     *  Returns：
     *  {Array(<SuperMap.Feature.Vector>)} 满足条件的标号对象数组
     */
    getGObjectByID: function(szID) {
        var array = [];

        var layers = this.map.layers;
        for(var ll = 0; ll < layers.length; ll++) {
            if(layers[ll].isBaseLayer === true){
                continue;
            }

            array.push(layers[ll].getFeatureById(szID));
        }

        return array;
    },

    /**
     * APIMethod: createSymbol
     *  根据屏幕坐标新建军标对象
     *
     * Parameters:
     *  libid - {Integer}符号所在的标号库id。
     *  code - {Integer}符号的标识code。
     *  pts - {<SuperMap.Geometry.Point>} 位置点序列（屏幕），数组，如{x:300,y:200},{x:300,y:200}的数据。
     *  success - {Function}对于线面标识起作用，因为线面标号的创建需要与服务器进行异步通信，因此循环创建线面标号设置线面标号的显示属性的时候创建下个线面标号的时候需要设置该参数。
     *  fail - {Function}对于线面标号起作用，因为线面标号的创建需要与服务器进行异步通信。
     */
    createSymbol: function(libid, code, pts, szID, success, fail) {
        this.getCurrentLayer();
        return this.activeLayer.createSymbol(libid,code,pts, success, fail);
    },

    /**
     * APIMethod: createSymbolWC
     *  根据经纬度坐标新建军标对象
     *
     * Parameters:
     *  libid - {Integer} 符号所在的标号库id。
     *  code - {Integer} 符号的标识code。
     *  pts - {<SuperMap.Geometry.Point>} 位置点序列（经纬度），数组，如{x:85,y:120},{x:76,y:90}的数据，其中x代表经度，y代表纬度 。
     *  success - {Function} 创建标号成功的处理函数。
     *  fail - {Function} 创建标号失败的处理函数。
     */
    createSymbolWC:function(libid, code, pts, success, fail) {
        this.getCurrentLayer();
        return this.activeLayer.createSymbolWC(libid, code, pts, success, fail);
    },

    /**
     * APIMethod: createText
     *  根据屏幕坐标创建文本对象
     *
     * Parameters:
     *  content - {String} 文本内容。
     *  pos - {<SuperMap.Geometry.Point>} 文本内容的位置，传入如{x:50,y:50}参数，屏幕坐标。
     *  style - {Object} 文本的样式。
     *  success - {Function} 创建文本成功的处理函数。
     *  fail - {Function} 创建文本失败的处理函数。
     */
    createText: function(content, pos, style, success, fail){
        this.getCurrentLayer();
        return this.activeLayer.createText(content, pos, style, success, fail);
    },

    /**
     * APIMethod: createTextWC
     *  根据地理坐标创建文本对象
     *
     * Parameters:
     *  content - {String}文本内容。
     *  pos - {<SuperMap.Geometry.Point>}文本内容的位置，传入如{x:50,y:50}参数，经纬度坐标。
     *  style - {Object} 文本的样式。
     *  success - {Function} 创建文本成功的处理函数。
     *  fail - {Function} 创建文本失败的处理函数。
     */
    createTextWC: function(content, pos, style, success, fail){
        this.getCurrentLayer();
        return this.activeLayer.createTextWC(content, pos, style, success, fail);
    },

    /**
     * Method: save
     * 保存态势图。
     *
     * Parameters:
     *  smlFileName - {String} 态势图名称。
     *  isCover - {Boolean} 是否覆盖保存。
     */
    save: function(smlFileName, isCover){
        var sitData = new SuperMap.Plot.SitDataStruct();
        sitData.smlInfo = this.smlInfo;
        sitData.layerDatas = [];

        var layers = this.map.layers;
        for(var ll = 0; ll < layers.length; ll++){
            if(layers[ll].isBaseLayer === true){
                continue;
            }

            var layerdata = new SuperMap.Plot.LayerDataStruct();
            layerdata.layerName = layers[ll].name;

            var features = [];
            var layerFeatures = layers[ll].features;
            for(var i = 0; i < layerFeatures.length; i++){
                var feature = layerFeatures[i].clone();
                feature.geometry.symbolData = layerFeatures[i].geometry.symbolData;
                if((layerFeatures[i].geometry.CLASS_NAME === "SuperMap.Geometry.GeoGraphicObject.DotSymbol") ||
                    (layerFeatures[i].geometry.CLASS_NAME === "SuperMap.Geometry.GeoGraphicObject.AlgoSymbol")) {
                    if (layerFeatures[i].geometry.symbolData != null && layerFeatures[i].geometry.symbolData.symbolType === 1) {
                        layerFeatures[i].geometry.symbolData.localePoints = layerFeatures[i].geometry.cloneControlPoints(layerFeatures[i].geometry.locationPoints);
                    } else {
                        feature.geometry.symbolData.localePoints = feature.geometry.controlPoints;
                    }
                    features.push(feature);
                }
            }
            layerdata.featrues = features;
            sitData.layerDatas.push(layerdata);
        }

        // 获取数据成功
        function getCompleted(result){
            console.log(result);
        }

        //获取数据失败
        function getFailed(result){
            console.log(result);
        }

        //对接iserver中的服务
        var editSmlFile = new SuperMap.REST.EditSmlFileService(this.serverUrl, {"smlFileName": smlFileName, "isCover": isCover});
        editSmlFile.events.on({
            "processCompleted": getCompleted,
            "processFailed": getFailed,
            scope: this
        });

        var editSmlFileParams = new SuperMap.REST.EditSmlFileParameters();
        editSmlFileParams.method = "POST";
        editSmlFileParams.sitData = sitData;
        editSmlFile.processAsync(editSmlFileParams);
    },

    CLASS_NAME: "SuperMap.Plot.SitDataManager"
});

