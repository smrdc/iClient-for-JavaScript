/**
 *
 * Class: SuperMap.Plot.AnalysisSymbol
 * 解析服务器返回的标号信息类
 */
SuperMap.Plot.AnalysisSymbol = new SuperMap.Class({

    CLASS_NAME: "SuperMap.Plot.AnalysisSymbol"
});

/**
 * APIFunction: SuperMap.Plot.AnalysisSymbol.analysisBasicInfo
 * 解析标号的基本信息。libID、code、类型、名字、衬线、最小编辑点及最大编辑点
 *
 * Parameters:
 * symbolData - {Object} 标绘对象的数据。
 *
 * Returns:
 * {Object} 标号的基本信息。
 */
SuperMap.Plot.AnalysisSymbol.analysisBasicInfo = function(symbolData) {
    var basicInfo = new Object();
    basicInfo.libID = symbolData.libID;
    basicInfo.code = symbolData.code;
    basicInfo.symbolType = symbolData.symbolType;
    basicInfo.symbolName = symbolData.symbolName;
    basicInfo.textContent = symbolData.textContent;
    basicInfo.minEditPts = symbolData.algoMinEditPts;
    basicInfo.maxEditPts = symbolData.algoMaxEditPts;
    basicInfo.surroundLineType = symbolData.surroundLineType;

    return basicInfo;
};

/**
 * APIFunction: SuperMap.Plot.AnalysisSymbol.analysisDotBasicInfo
 * 解析点标号的基本信息。旋转角、缩放比、注记位置、注记内容、锚点、标号等级、镜像及标号大小
 *
 * Parameters:
 * symbolData - {Object} 标绘对象的数据。
 *
 * Returns:
 * {Object} 点标号的基本信息。
 */
SuperMap.Plot.AnalysisSymbol.analysisDotBasicInfo = function(symbolData) {
    var dotBasicInfo = new Object();
    dotBasicInfo.rotate = symbolData.rotate2D.x;
    dotBasicInfo.scale = symbolData.scale2D.x;
    dotBasicInfo.annotationPosition = symbolData.annotationPosition;
    dotBasicInfo.anchorPoint = new SuperMap.Geometry.Point(symbolData.anchorPoint.x, symbolData.anchorPoint.y);
    dotBasicInfo.symbolRank = symbolData.symbolRank;
    dotBasicInfo.negativeImage = symbolData.negativeImage;
    dotBasicInfo.symbolSizeInLib = new SuperMap.Size(Math.round(symbolData.symbolSize.x * 96 / 25.4 / 10), Math.round(symbolData.symbolSize.y * 96 / 25.4 / 10));

    dotBasicInfo.middleMarkBounds = new SuperMap.Bounds(symbolData.middleMarkBounds.leftBottom.x, symbolData.middleMarkBounds.leftBottom.y, symbolData.middleMarkBounds.rightTop.x, symbolData.middleMarkBounds.rightTop.y);

    return dotBasicInfo;
};

/**
 * APIFunction: SuperMap.Plot.AnalysisSymbol.analysisAlgoBasicInfo
 * 解析线面标号的基本信息。子标号、比例值及比例点
 *
 * Parameters:
 * symbolData - {Object} 标绘对象的数据。
 * isAnalysisSubSymbols - {Boolean} 是否解析子标号，子标号字需要初始化时解析一次就可以。
 *
 * Returns:
 * {Object} 线面标号的基本信息。
 */
SuperMap.Plot.AnalysisSymbol.analysisAlgoBasicInfo = function(symbolData, isAnalysisSubSymbols) {
    var algoBasicInfo = new Object();
    algoBasicInfo.subSymbols = [];
    algoBasicInfo.scalePoints = [];
    algoBasicInfo.scaleValues = [];

    if(isAnalysisSubSymbols && symbolData.subSymbols){
        for(var i = 0; i < symbolData.subSymbols.length; i++){
            algoBasicInfo.subSymbols.push(symbolData.subSymbols[i]);
        }
    }

    if(symbolData.scalePoints){
        this.scalePoints = [];
        for(var j = 0; j < symbolData.scalePoints.length; j++){
            var scalePoint = new SuperMap.Geometry.Point(symbolData.scalePoints[j].x, symbolData.scalePoints[j].y);
            scalePoint.tag = j;
            scalePoint.isScalePoint = true;
            algoBasicInfo.scalePoints.push(scalePoint);
        }
    }

    if(symbolData.scaleValues){
        for(var k = 0; k < symbolData.scaleValues.length; k++){
            algoBasicInfo.scaleValues.push(symbolData.scaleValues[k]);
        }
    }

    return algoBasicInfo;
};

/**
 * APIFunction: SuperMap.Plot.AnalysisSymbol.analysisSymbolCells
 * 解析标号的图元信息。
 *
 * Parameters:
 * symbolData - {Object} 标绘对象的数据。
 *
 * Returns:
 * {Array(Object)} 标号的图元数据列表。
 */
SuperMap.Plot.AnalysisSymbol.analysisSymbolCells = function(symbolData) {
    function handleArrowFill(symbolData, symbolCells){
        if(symbolData.symbolIsCanFill && symbolCells.length > 0){
            var arrowCell = new Object();
            var symbolStyle = SuperMap.Plot.AnalysisSymbol.getStyle(symbolData);
            arrowCell.type = 32;
            arrowCell.style = {
                fill: symbolStyle.fill,
                fillColor: symbolStyle.fillColor,
                fillOpacity: symbolStyle.fillOpacity,
                strokeOpacity: 0,
                strokeWidth: 0,
                fillLimit: false,
                lineColorLimit: true,
                lineWidthLimit: true
            };

            arrowCell.positionPoints = [];
            for (var i = 0; i < symbolCells[0].positionPoints.length; i++) {
                arrowCell.positionPoints.push(symbolCells[0].positionPoints[i].clone());
            }

            symbolCells.push(arrowCell);
        }
    }

    var symbolCells = [];

    if(symbolData) {
        if (symbolData.innerCells) {
            var cellDatas = symbolData.innerCells;
            if (cellDatas.length !== 0){
                for (var i = 0; i < cellDatas.length; i++) {
                    symbolCells.push(SuperMap.Plot.AnalysisSymbol.analysisInnerCell(cellDatas[i]));
                }
            }
        }
    }

    handleArrowFill(symbolData, symbolCells);

    return symbolCells;
};

/**
 * Function: SuperMap.Plot.AnalysisSymbol.analysisInnerCell
 * 解析标号的图元信息。
 *
 * Parameters:
 * cellData - {Object} 标绘对象的图元数据。
 *
 * Returns:
 * {Object} 标号的图元。
 */
SuperMap.Plot.AnalysisSymbol.analysisInnerCell = function(cellData) {
    var symbolCell = new Object();

    symbolCell.positionPoints = [];
    if(cellData){
        symbolCell.type = cellData.type;
        symbolCell.surroundLineFlag = cellData.surroundLineFlag;
        symbolCell.textContent = cellData.textContent;
        symbolCell.style = SuperMap.Plot.AnalysisSymbol.getStyle(cellData);
        if(cellData.positionPoints !== null){
            var points = cellData.positionPoints;
            for(var i=0; i<points.length; i++){
                var point = new SuperMap.Geometry.Point(points[i].x, points[i].y);
                symbolCell.positionPoints.push(point);
            }
        }
        symbolCell.style.lineColorLimit = cellData.lineColorLimit;
        symbolCell.style.lineTypeLimit = cellData.lineTypeLimit;
        symbolCell.style.lineWidthLimit = cellData.lineWidthLimit;
        symbolCell.style.fillLimit = cellData.fillLimit;
        symbolCell.style.fillColorLimit = cellData.fillColorLimit;
        symbolCell.style.fontColorLimit = cellData.fontColorLimit;
        symbolCell.style.surroundLineLimit = cellData.surroundLineLimit;
        symbolCell.style.surroundLineFlag = symbolCell.surroundLineFlag;

        if(symbolCell.type === SuperMap.Plot.SymbolType.RECTANGLESYMBOL){

            //取第一个
            var startPoint = symbolCell.positionPoints[0];
            //取最后一个
            var endPoint = symbolCell.positionPoints[1];
            var point1 = startPoint.clone();
            var point2 = new SuperMap.Geometry.Point(endPoint.x,startPoint.y);
            var point3 = endPoint.clone();
            var point4 = new SuperMap.Geometry.Point(startPoint.x,endPoint.y);
            symbolCell.positionPoints = [];
            symbolCell.positionPoints.push(point1);
            symbolCell.positionPoints.push(point2);
            symbolCell.positionPoints.push(point3);
            symbolCell.positionPoints.push(point4);
            symbolCell.type = SuperMap.Plot.SymbolType.ARBITRARYPOLYGONSYMBOL;
        }
        if(symbolCell.type === SuperMap.Plot.SymbolType.TEXTSYMBOL) {
            symbolCell.style.fontSizeLimit = true;
        }
    }

    return symbolCell;
};

/**
 * APIFunction: SuperMap.Plot.AnalysisSymbol.getStyle
 * 解析标号的样式。
 *
 * Parameters:
 * symbolData - {Object} 标绘对象的数据。
 *
 * Returns:
 * {Object} 标号的样式。
 */
SuperMap.Plot.AnalysisSymbol.getStyle = function(symbolData) {
    function getColorFromRGB(colorData){
        var hexStringR = colorData.red.toString(16);
        if(hexStringR.length < 2)
            hexStringR = "0" + hexStringR;
        var hexStringG = colorData.green.toString(16);
        if(hexStringG.length < 2)
            hexStringG = "0" + hexStringG;
        var hexStringB = colorData.blue.toString(16);
        if(hexStringB.length < 2)
            hexStringB = "0" + hexStringB;

        var hexStringColor = "#" + hexStringR + hexStringG + hexStringB;
        return hexStringColor;
    }

    function getAlign(align){
        if(align === "TOPLEFT"){
            return "lt";
        } else if(align === "TOPCENTER"){
            return "ct";
        } else if(align === "TOPRIGHT"){
            return "rt";
        } else if(align === "BOTTOMLEFT"){
            return "lb";
        } else if(align === "BOTTOMCENTER"){
            return "cb";
        } else if(align === "BOTTOMRIGHT"){
            return "rb";
        } else if(align === "MIDDLELEFT"){
            return "lm";
        } else if(align === "MIDDLECENTER"){
            return "cm";
        } else if(align === "MIDDLERIGHT"){
            return "rm";
        }
        return "lt";
    }

    var style = {};

    if(symbolData.style.fillSymbolID === 1){
        style.fill = false;
    } else {
        style.fill = true;
    }

    if(symbolData.style.fillGradientMode && symbolData.style.fillGradientMode !== null){
        style.fillGradientMode = symbolData.style.fillGradientMode;
    }

    style.fillColor = getColorFromRGB(symbolData.style.fillForeColor);
    style.fillOpacity = (symbolData.style.fillForeColor.alpha / 255).toFixed(2);

    style.fillBackColor = getColorFromRGB(symbolData.style.fillBackColor);
    style.fillBackOpacity = (symbolData.style.fillBackColor.alpha / 255).toFixed(2);

    style.strokeColor = getColorFromRGB(symbolData.style.lineColor);
    style.strokeOpacity = (symbolData.style.lineColor.alpha / 255).toFixed(2);
    style.strokeWidth = Math.round(symbolData.style.lineWidth * 96 / 25.4);
    if(symbolData.style.lineSymbolID !== "dot" && symbolData.style.lineSymbolID !== "dash" && symbolData.style.lineSymbolID !== "dashdot" && symbolData.style.lineSymbolID !== "longdash" && symbolData.style.lineSymbolID !== "longdashdot"){
        style.strokeDashstyle = "solid";
    } else {
        style.strokeDashstyle = symbolData.style.lineSymbolID;
    }

    if(symbolData.textStyle2D && symbolData.textStyle2D != null){
        //适用于标号
        style.fontFamily = symbolData.textStyle2D.fontName;
        style.fontSize = Math.round(symbolData.textStyle2D.fontHeight * 96 / 25.4 /16).toString() + "em";
        style.fontColor = getColorFromRGB(symbolData.textStyle2D.foreColor);
        style.labelAlign = getAlign(symbolData.textStyle2D.align);
        style.labelXOffset = 0;
        style.labelYOffset = 0;
    } else if(symbolData.textStyle && symbolData.textStyle != null){
        //适用于图元
        style.fontFamily = symbolData.textStyle.fontName;
        style.fontSize = symbolData.textStyle.fontHeight / 2;
        //style.fontSize = Math.round(symbolData.textStyle.fontHeight * 96 / 25.4 /16).toString() + "em";
        style.fontColor = getColorFromRGB(symbolData.textStyle.foreColor);
        style.labelAlign = getAlign(symbolData.textStyle.align);
        style.labelXOffset = 0;
        style.labelYOffset = 0;
    }

    if(symbolData.surroundLineColor && symbolData.surroundLineColor !== null){
        style.surroundLineColor = getColorFromRGB(symbolData.surroundLineColor);
        style.surroundLineColorOpacity = (symbolData.surroundLineColor.alpha / 255).toFixed(2);
    }

    if(symbolData.surroundLineWidth2D && symbolData.surroundLineWidth2D !== null){
        style.surroundLineWidth = Math.round(symbolData.surroundLineWidth2D * 96 / 25.4);
    }

    if(symbolData.visibility && symbolData.visibility === false){
        style.display = "none";
    } else {
        style.display = "display";
    }

    return style;
};

/**
 * APIFunction: SuperMap.Plot.AnalysisSymbol.setStyle
 * 将标号样式的修改存储到标号数据里
 *
 * Parameters:
 * style - {Object} 标绘对象的样式。
 * symbolData - {Object} 标绘对象的数据。
 */
SuperMap.Plot.AnalysisSymbol.setStyle = function(style, symbolData) {
    function setColorFromRGB(color, colorData){
        var hexStringR = color.substring(1, 3);
        colorData.red = parseInt(hexStringR, 16);
        var hexStringG = color.substring(3, 5);
        colorData.green = parseInt(hexStringG, 16);
        var hexStringB = color.substring(5);
        colorData.blue = parseInt(hexStringB, 16);
    }

    if(style.fill){
        symbolData.style.fillSymbolID = 0;
    }

    if(style.fillGradientMode){
        symbolData.style.fillGradientMode = style.fillGradientMode;
    }

    if(style.fillColor){
        setColorFromRGB(style.fillColor, symbolData.style.fillForeColor);
    }
    if(style.fillOpacity) {
        symbolData.style.fillForeColor.alpha = style.fillOpacity * 255;
    }

    if(style.strokeColor) {
        setColorFromRGB(style.strokeColor, symbolData.style.lineColor);
    }
    if(style.strokeOpacity) {
        symbolData.style.lineColor.alpha = style.strokeOpacity * 255;
    }
    if(style.strokeWidth) {
        symbolData.style.lineWidth = style.strokeWidth * 25.4 / 96;
    }
    if(style.strokeDashstyle) {
        symbolData.style.lineSymbolID = style.strokeDashstyle;
    }

    if(style.fontFamily){
        if(symbolData.textStyle2D && symbolData.textStyle2D != null){
            //适用于标号
            symbolData.textStyle2D.fontName = style.fontFamily;
        } else if(symbolData.textStyle && symbolData.textStyle != null){
            //适用于图元
            symbolData.textStyle.fontName = style.fontFamily;
        }
    }

    if(style.fontSize){
        if(symbolData.textStyle2D && symbolData.textStyle2D != null){
            //适用于标号
            symbolData.textStyle2D.fontHeight = parseFloat(style.fontSize) * 25.4 * 16 / 96;
        } else if(symbolData.textStyle && symbolData.textStyle != null){
            //适用于图元
            //symbolData.textStyle.fontHeight = parseFloat(style.fontSize) * 25.4 * 16 / 96;
            symbolData.textStyle.fontHeight = style.fontSize * 2;
        }
    }

    if(style.fontColor){
        if(symbolData.textStyle2D && symbolData.textStyle2D != null){
            //适用于标号
            setColorFromRGB(style.fontColor, symbolData.textStyle2D.foreColor);
        } else if(symbolData.textStyle && symbolData.textStyle != null){
            //适用于图元
            setColorFromRGB(style.fontColor, symbolData.textStyle.foreColor);
        }
    }

    if(style.surroundLineColor &&symbolData.surroundLineColor && symbolData.surroundLineColor !== null){
        setColorFromRGB(style.surroundLineColor, symbolData.surroundLineColor);
    }

    if(style.surroundLineColorOpacity &&symbolData.surroundLineColor && symbolData.surroundLineColor !== null){
        symbolData.surroundLineColor.alpha = style.surroundLineColorOpacity * 255;
    }

    if(style.surroundLineWidth2D && symbolData.surroundLineWidth2D && symbolData.surroundLineWidth2D !== null){
        symbolData.surroundLineWidth = style.surroundLineWidth2D * 25.4 / 96;
    }

    if(style.display && style.display === "none"){
        symbolData.visibility = false;
    } else {
        symbolData.visibility = true;
    }

    return style;
};

/**
 * APIFunction: SuperMap.Plot.AnalysisSymbol.mergeDefaultStyle
 * 应用缺省属性到样式和数据里
 *
 * Parameters:
 * style - {Object} 标绘对象的样式。
 * symbolData - {Object} 标绘对象的数据。
 * defaultStyle - {<SuperMap.Plot.DefaultStyle>} 缺省属性
 */
SuperMap.Plot.AnalysisSymbol.mergeDefaultStyle = function(style, geoGraphicObject, defaultStyle) {
    if(defaultStyle && defaultStyle.getDefaultFlag()){
        style.strokeColor = defaultStyle.lineColor;
        style.strokeWidth = defaultStyle.lineWidth;
        style.strokeDashstyle = defaultStyle.lineType;
        SuperMap.Plot.AnalysisSymbol.setStyle(style, geoGraphicObject.symbolData);

        if(geoGraphicObject.symbolType === SuperMap.Plot.SymbolType.DOTSYMBOL){
            if(defaultStyle.symbolWidth !== -1 && defaultStyle.symbolHeight !== -1){
                var scaleX = defaultStyle.symbolWidth/geoGraphicObject.symbolSizeInLib.w;
                var scaleY = defaultStyle.symbolHeight/geoGraphicObject.symbolSizeInLib.h;
                if(geoGraphicObject.scale !== scaleX){
                    geoGraphicObject.scale = scaleX;
                } else if(geoGraphicObject.scale !== scaleY){
                    geoGraphicObject.scale = scaleY;
                }

                geoGraphicObject.symbolSize.w = geoGraphicObject.scale * geoGraphicObject.symbolSizeInLib.w;
                geoGraphicObject.symbolSize.h = geoGraphicObject.scale * geoGraphicObject.symbolSizeInLib.h;

                geoGraphicObject.symbolData.scale2D.x = geoGraphicObject.scale;
            }
        }
    }
};