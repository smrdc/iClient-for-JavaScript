/**
 * Class: SuperMap.Geometry.GeoGraphicObject.AlgoSymbol
 * 线面标号对象。
 *
 * Inherits from:
 *  - <SuperMap.Geometry.GeoGraphicObject>
 */
SuperMap.Geometry.GeoGraphicObject.AlgoSymbol=new SuperMap.Class(SuperMap.Geometry.GeoGraphicObject,{
    /**
     * Property: subSymbols
     * {Array(<int>)}线面标号的子标号列表
     */
    subSymbols: [],

    /**
     * Property: scalePoints
     * {Array(<SuperMap.Geometry.Point>)}线面标号的比例点
     */
    scalePoints: [],

    /**
     * Property: scaleValues
     * {Array(<int>)}线面标号的比例值
     */
    scaleValues: [],

    /**
     * Property: dOffset
     * {Float}线面标号求解衬线的偏移量
     */
    dOffset: null,

    /**
     * APIMethod: getSubSymbol
     * 获取线面标号的子标号
     *
     * Returns:
     * {Object} 返回线面标号的子标号。
     */
    getSubSymbols:function(){
        return this.subSymbols;
    },

    /**
     * APIMethod: setSubSymbol
     * 设置线面标号的子标号
     *
     * Parameters:
     * code - {Int} 子标号代码。
     * npos - {Int} 子标号在线面标号所处的索引位置。
     */
    setSubSymbol:function(code, npos){
        if(npos < this.subSymbols.length){
            this.subSymbols[npos] = code;
        }

        // 获取数据成功
        function getCompleted(result){
            this.symbolData.innerCells = result.originResult.innerCells;
            this.subSymbols = result.originResult.subSymbols;
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
        getSymbolInfoParams.inputPoints = this.controlPoints;
        getSymbolInfoParams.subSymbols = this.subSymbols;
        getSymbolInfo.processAsync(getSymbolInfoParams);
    },

    /**
     * APIMethod: setSurroundLineType
     * 设置标号的衬线类型
     *
     * Parameters:
     * surroundLineType - {int} 标号的衬线类型。
     */
    setSurroundLineType:function(surroundLineType){
        this.surroundLineType = surroundLineType;
        this.symbolData.surroundLineType = this.surroundLineType;
        this.dOffset = this.feature.style.surroundLineWidth/2.0 + this.feature.style.strokeWidth/2.0;
        this.calculateParts();
        this.layer.redraw();
    },

    /**
     * Constructor: SuperMap.Geometry.GeoGraphicObject.AlgoSymbol
     * 创建一个线面标绘对象。
     *
     * Parameters:
     * options - {Object} 此类与父类提供的属性。
     *
     * Returns:
     * {<SuperMap.Geometry.GeoGraphicObject.AlgoSymbol>} 新的标绘对象。
     */
    initialize:function(option){
        SuperMap.Geometry.GeoGraphicObject.prototype.initialize.apply(this, arguments);

        var algoBasicInfo = SuperMap.Plot.AnalysisSymbol.analysisAlgoBasicInfo(this.symbolData, true);
        this.subSymbols = algoBasicInfo.subSymbols;
    },

    /**
     * Method: calculateParts
     * 判断绘制图元是否需要访问服务器数据
     */
    isAccessServer: function(){
        if(this.symbolType === SuperMap.Plot.SymbolType.PARALLELOGRAM
            || this.symbolType === SuperMap.Plot.SymbolType.REGULARPOLYGON
            || this.symbolType === SuperMap.Plot.SymbolType.POLYBEZIERSYMBOL
            || this.symbolType === SuperMap.Plot.SymbolType.POLYBEZIERCLOSESYMBOL
            || this.symbolType === SuperMap.Plot.SymbolType.KIDNEY
            || this.symbolType === SuperMap.Plot.SymbolType.BRACESYMBOL
            || this.symbolType === SuperMap.Plot.SymbolType.TRAPEZOIDSYMBOL
            || this.symbolType === SuperMap.Plot.SymbolType.ANNOFRAMESYMBOL
            || this.symbolType === SuperMap.Plot.SymbolType.ALGOSYMBOL
            || this.symbolType === SuperMap.Plot.SymbolType.ARCSYMBOL
            || this.symbolType === SuperMap.Plot.SymbolType.CHORDSYMBOL
            || this.symbolType === SuperMap.Plot.SymbolType.PIESYMBOL){
            return true;
        }

        return false;
    },

    /**
     * Method: calculateParts
     * 重写了父类的方法
     */
    calculateParts: function () {
        //清空原有的所有点
        this.components = [];

        var plotting = SuperMap.Plotting.getInstance(this.layer.map, this.serverUrl);
        SuperMap.Plot.AnalysisSymbol.mergeDefaultStyle(this.feature.style, this, plotting.getDefaultStyle());

        if( this.controlPoints.length >= this.symbolData.algoMinEditPts) {
            if(this.isAccessServer()){
                this.calAccessServerSymbol();
            } else {
                this.calNotAccessServerSymbol();
            }
        } else if(this.controlPoints.length >= 2 && this.controlPoints.length < this.symbolData.algoMinEditPts){
            this.calAssistantLine();
        }

        this.clearBounds();
    },

    /**
     * Method: calAssistantLine
     * 计算铺助线
     */
    calAssistantLine: function () {
        var symbolCell = {
            type: 24,
            surroundLineFlag: false,
            positionPoints: this.controlPoints,
            style: {
                strokeColor: "#0000ff",
                strokeOpacity: 1.0,
                strokeWidth: 2,
                strokeDashstyle: "dash",
                lineColorLimit: true,
                lineTypeLimit: true,
                lineWidthLimit: true,
                surroundLineFlag: false
            }
        };

        var geometry = SuperMap.Geometry.Primitives.transformSymbolCellToGeometry(symbolCell, 0.0);
        geometry.style = symbolCell.style;
        this.components.push(geometry);
    },

    /**
     * Method: calAssistantLine
     * 计算标号，适用于部分基本图元类型，不需要实时访问服务器
     */
    calNotAccessServerSymbol: function () {
        if((!this.textContent || this.textContent === "" || this.textContent === "???") && this.symbolType === SuperMap.Plot.SymbolType.TEXTSYMBOL){
            this.textContent = "Test";
        }

        var symbolCell = {
            textContent: this.textContent,
            type: this.symbolType,
            surroundLineFlag: false,
            positionPoints: this.cloneControlPoints(this.controlPoints),
            style: {
                strokeColor: "#ff0000",
                strokeOpacity: 1.0,
                strokeWidth: 1,
                fill: false,
                fillColor: "#ff0000",
                fillOpactity: 0.31,
                lineColorLimit: false,
                lineTypeLimit: false,
                lineWidthLimit: false,
                fillLimit: false,
                fillColorLimit: false,
                surroundLineFlag: false
            }
        };

        var geometry = SuperMap.Geometry.Primitives.transformSymbolCellToGeometry(symbolCell, 0.0);
        if(geometry !== null){
            if(this.symbolType === SuperMap.Plot.SymbolType.PARALLELLINE){
                for(var i = 0; i < geometry.length; i++){
                    this.addOrRemoveSurroundLine(geometry[i], symbolCell);

                    geometry[i].style = symbolCell.style;
                    this.components.push(geometry[i]);
                }
            } else {
                this.addOrRemoveSurroundLine(geometry, symbolCell);

                geometry.style = symbolCell.style;
                this.components.push(geometry);
            }
        }
    },

    /**
     * Method: calAccessServerSymbol
     * 计算标号，适用于需要实时访问服务器类型
     */
    calAccessServerSymbol: function () {
        var symbolCells = SuperMap.Plot.AnalysisSymbol.analysisSymbolCells(this.symbolData);

        for(var i = 0; i < symbolCells.length; i++){
            var symbolCell = symbolCells[i];

            if(this.symbolType === 320 && symbolCell.type === 34 && this.textContent.length === 0){
                continue;
            } else {
                var geometry = SuperMap.Geometry.Primitives.transformSymbolCellToGeometry(symbolCell, 0.0);
                if(geometry && geometry !== null){
                    this.addOrRemoveSurroundLine(geometry, symbolCell);

                    geometry.style = symbolCell.style;
                    this.components.push(geometry);
                }
            }
        }

        var algoBasicInfo = SuperMap.Plot.AnalysisSymbol.analysisAlgoBasicInfo(this.symbolData, false);
        this.scalePoints = algoBasicInfo.scalePoints;
        this.scaleValues = algoBasicInfo.scaleValues;
    },

    /**
     * Method: addOrRemoveSurroundLine
     * 添加或移除衬线，由于目前每次修改衬线之后都重绘图层，所以暂不涉及删除衬线
     */
    addOrRemoveSurroundLine: function (geometry, symbolCell) {
        if(symbolCell.type === SuperMap.Plot.SymbolType.TEXTSYMBOL){
            return;
        }

        if(symbolCell.style.lineWidthLimit && symbolCell.style.strokeWidth === 0){
            return;
        }

        if(this.surroundLineType === SuperMap.Plot.AlgoSurroundLineType.NONE){
            return;
        }

        var surroundLineGeometry = geometry.clone();
        surroundLineGeometry.style = this.cloneObject(symbolCell.style);
        surroundLineGeometry.style.surroundLineFlag = true;
        surroundLineGeometry.originSymbolCell = this.cloneObject(symbolCell);
        surroundLineGeometry.originSymbolCell.surroundLineFlag = true;
        surroundLineGeometry.originSymbolCell.positionPoints = this.cloneControlPoints(symbolCell.positionPoints);

        this.components.push(surroundLineGeometry);
    },

    /**
     * Method: handleSurroundLine
     * 计算衬线
     */
    handleSurroundLine: function (symbolCell) {
        if(symbolCell.type === SuperMap.Plot.SymbolType.TEXTSYMBOL){
            return null;
        }

        if(this.surroundLineType === SuperMap.Plot.AlgoSurroundLineType.NONE){
            return null;
        }

        if(symbolCell.style.lineWidthLimit && symbolCell.style.strokeWidth === 0){
            return null;
        }

        var surroundLineSymbolCell = new Object();
        surroundLineSymbolCell.positionPoints = this.cloneControlPoints(symbolCell.positionPoints);
        surroundLineSymbolCell.type = symbolCell.type;
        surroundLineSymbolCell.surroundLineFlag = true;
        surroundLineSymbolCell.style = this.cloneObject(symbolCell.style);
        surroundLineSymbolCell.style.surroundLineFlag = surroundLineSymbolCell.surroundLineFlag;

        if(this.surroundLineType === SuperMap.Plot.AlgoSurroundLineType.INNER || this.surroundLineType === SuperMap.Plot.AlgoSurroundLineType.OUT){
            var baseDir = (this.surroundLineType === SuperMap.Plot.AlgoSurroundLineType.OUT) ? -1 : 1;
            var dir = this.innerOutlineDir(surroundLineSymbolCell.positionPoints);
            var dOffset = dir*baseDir*this.dOffset;

            var pPoints = surroundLineSymbolCell.positionPoints;
            var pPixel = [];
            for(var i = 0; i < pPoints.length; i++){
                var lonLat = new SuperMap.LonLat(pPoints[i].x, pPoints[i].y);
                var pixel = this.map.getPixelFromLonLat(lonLat);
                pPixel.push(pixel);
            }

            var pntResult = SuperMap.Plot.PlottingUtil.parallel(pPixel, dOffset);
            for(var j = 0; j < pPoints.length; j++){
                var pntResultPixe = new SuperMap.Pixel(pntResult[j].x, pntResult[j].y);
                var lonLat = this.map.getLonLatFromLayerPx(pntResultPixe);
                pPoints[j].x = lonLat.lon;
                pPoints[j].y = lonLat.lat;
            }
        }

        var geometry = SuperMap.Geometry.Primitives.transformSymbolCellToGeometry(surroundLineSymbolCell, this.rotate);
        geometry.style = surroundLineSymbolCell.style;
        geometry.originSymbolCell = this.cloneObject(symbolCell);
        geometry.originSymbolCell.positionPoints = this.cloneControlPoints(symbolCell.positionPoints);

        return geometry;
    },

    /**
     * Method: innerOutlineDir
     * 计算衬线方向
     */
    innerOutlineDir: function (controlPoints) {
        function vecRadian(v1, v2){
            function vecDir(v){
                var dirRad = Math.atan2(v.y, v.x);
                if(dirRad < 0){
                    dirRad += 2*Math.PI;
                }

                return dirRad;
            }
            var dr = vecDir(v2) - vecDir(v1);
            if(dr < -Math.PI){
                dr += 2*Math.PI;
            }
            if(dr > Math.PI){
                dr -= 2*Math.PI;
            }

            return dr;
        }

        if(controlPoints.length < 3){
            return 1;
        }

        var dRadian = 0;
        var v1 = {x:0, y:0};
        var v2 = {x:0, y:0};
        for(var i = 2; i < controlPoints.length; i++){
            v2.x = controlPoints[i].x - controlPoints[i-1].x;
            v2.y = controlPoints[i].y - controlPoints[i-1].y;
            v1.x = controlPoints[i-1].x - controlPoints[i-2].x;
            v1.y = controlPoints[i-1].y - controlPoints[i-2].y;
            dRadian += vecRadian(v1, v2);
        }
        v2.x = controlPoints[1].x - controlPoints[0].x;
        v2.y = controlPoints[1].y - controlPoints[0].y;
        v1.x = controlPoints[0].x - controlPoints[controlPoints.length-1].x;
        v1.y = controlPoints[0].y - controlPoints[controlPoints.length-1].y;
        dRadian += vecRadian(v1, v2);

        if(dRadian >= 0){
            return -1;
        } else {
            return 1;
        }
    },

    CLASS_NAME:"SuperMap.Geometry.GeoGraphicObject.AlgoSymbol"
});