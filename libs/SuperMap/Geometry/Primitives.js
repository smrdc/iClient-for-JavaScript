/**
 * Class: SuperMap.Geometry.Primitives
 * 将标号的基本图元构建成相应的几何对象。
 */
SuperMap.Geometry.Primitives = SuperMap.Class({
    //初始化
    initialize: function(options){

    },

    /**
     * Method: polyline
     * 折线图元
     */
    polyline: function(controlPoints){
        if(controlPoints && controlPoints.length >1){
            return new SuperMap.Geometry.LineString(controlPoints);
        }
    },

    /**
     * Method: parallelline
     * 平行线图元
     */
    parallelline: function(controlPoints){
        if(controlPoints && controlPoints.length >= 3){
            var dOffset = SuperMap.Plot.PlottingUtil.distance(controlPoints[0], controlPoints[1]);
            if(SuperMap.Plot.PlottingUtil.isRight(controlPoints[0], controlPoints[1], controlPoints[2])){
                dOffset = -dOffset;
            }

            var lineControlPoints = [];
            for(var i = 1; i < controlPoints.length; i++){
                lineControlPoints.push(controlPoints[i].clone());
            }
            var pntResult = SuperMap.Plot.PlottingUtil.parallel(lineControlPoints, dOffset);
            controlPoints[0].x = pntResult[0].x;
            controlPoints[0].y = pntResult[0].y;

            var components = [];
            components.push(new SuperMap.Geometry.LineString(lineControlPoints));
            components.push(new SuperMap.Geometry.LineString(pntResult));
            return components;
        }
    },

    /**
     * Method: kidney
     * 猪肾图元
     *
     * 目前贝塞尔曲线客户端的根据控制点解析算法没有写，所以目前先用服务器提供的所有点进行绘制
     * 后期考虑效率问题再翻译 C++ 解析算法
     */
    kidney: function(controlPoints){
        if(controlPoints){
            var linearRing = new SuperMap.Geometry.LinearRing(controlPoints);
            return new SuperMap.Geometry.Polygon([linearRing]);
        }
    },

    /**
     * Method: bezier
     * 贝塞尔图元
     */
    bezier: function(controlPoints){
        if(controlPoints){
            return new SuperMap.Geometry.LineString(controlPoints);
        }
    },

    /**
     * Method: loopbezier
     * 闭合贝塞尔图元
     */
    loopbezier: function(controlPoints){
        if(controlPoints){
            var linearRing = new SuperMap.Geometry.LinearRing(controlPoints);
            return new SuperMap.Geometry.Polygon([linearRing]);
        }
    },

    /**
     * Method: parallelogram
     * 平行四边形图元
     */
    parallelogram: function(controlPoints){
        return this.polygon(controlPoints);
    },

    /**
     * Method: polygon
     * 多边形图元
     */
    polygon: function(controlPoints){
        if(controlPoints && controlPoints.length>2){
            var linearRing = new SuperMap.Geometry.LinearRing(controlPoints);
            return new SuperMap.Geometry.Polygon([linearRing]);
        }
    },

    /**
     * Method: circle
     * 圆形图元
     */
    circle: function(controlPoints){
        if(controlPoints && controlPoints.length === 2){
            //取第一个作为中心点
            var centerPoint = controlPoints[0];
            //取最后一个作为半径控制点
            var radiusPoint = controlPoints[1];
            var points = [];
            //计算圆的半径
            var radius = Math.sqrt((radiusPoint.x - centerPoint.x) * (radiusPoint.x - centerPoint.x) +
            (radiusPoint.y - centerPoint.y) * (radiusPoint.y - centerPoint.y));
            //计算圆的边缘所有点
            for(var i = 0; i < 360; i++)
            {
                var radians = (i + 1) * Math.PI / 180;
                var circlePoint = new SuperMap.Geometry.Point(Math.cos(radians) * radius + centerPoint.x, Math.sin(radians) * radius + centerPoint.y);
                points[i] = circlePoint;
            }
            var linearRing = new SuperMap.Geometry.LinearRing(points);
            return new SuperMap.Geometry.Polygon([linearRing]);
        }
    },

    /**
     * Method: rectangle
     * 矩形图元
     *
     * 已知的是左上和右下点，目前算法中没考虑带旋转角的矩形
     */
    rectangle: function(controlPoints, dAngle, width, height){
        //if((!width || width === null) && (controlPoints && controlPoints.length === 2)) {
        //    width = Math.abs(controlPoints[0].x - controlPoints[1].y);
        //}
        //if((!height || height === null) && (controlPoints && controlPoints.length === 2)) {
        //    height = Math.abs(controlPoints[0].y - controlPoints[1].y);
        //}
        //if(!dAngle || dAngle === null){
        //    dAngle = 0;
        //}
        //
        //if(controlPoints && controlPoints.length > 0){
        //    //var points = this.getEllipseSpatialData(controlPoints[0], majorAxis, minorAxis, dAngle);
        //    var points = [];
        //
        //    //var pntCenter = new SuperMap.Geometry.Point((controlPoints[0].x+controlPoints[1].x)/2.0, (controlPoints[0].y+controlPoints[1].y)/2.0);
        //    var pntCenter = controlPoints[2];
        //    points.push(new SuperMap.Geometry.Point((pntCenter.x-width/2.0), (pntCenter.y+height/2.0)));
        //    points.push(new SuperMap.Geometry.Point((pntCenter.x-width/2.0), (pntCenter.y-height/2.0)));
        //    points.push(new SuperMap.Geometry.Point((pntCenter.x+width/2.0), (pntCenter.y-height/2.0)));
        //    points.push(new SuperMap.Geometry.Point((pntCenter.x+width/2.0), (pntCenter.y+height/2.0)));
        //    points.push(new SuperMap.Geometry.Point((pntCenter.x-width/2.0), (pntCenter.y+height/2.0)));
        //
        //    for(var i = 0; i < points.length; i++){
        //        points[i].rotate(dAngle, pntCenter);
        //    }
        //
        //    var linearRing = new SuperMap.Geometry.LinearRing(points);
        //    return new SuperMap.Geometry.Polygon([linearRing]);
        //}

        if(controlPoints && controlPoints.length === 2){
            //取第一个
            var startPoint = controlPoints[0];
            //取最后一个
            var endPoint = controlPoints[1];
            var point1 = startPoint.clone();
            var point2 = new SuperMap.Geometry.Point(endPoint.x,startPoint.y);
            var point3 = endPoint.clone();
            var point4 = new SuperMap.Geometry.Point(startPoint.x,endPoint.y);
            var linearRing = new SuperMap.Geometry.LinearRing([point1, point2, point3, point4]);
            return new SuperMap.Geometry.Polygon([linearRing]);
        }
    },

    /**
     * Method: geotext
     * 文本图元
     */
    geotext: function(controlPoints,text){
        if(controlPoints && text && text.length > 0){
            return new SuperMap.Geometry.GeoText(controlPoints[0].x, controlPoints[0].y, text);
        }
    },

    /**
     * Method: sector
     * 扇形图元
     *
     * 圆弧起始点A 圆弧终点B 圆弧上一点C
     */
    sector: function(controlPoints){
        var infoPoints = this.getArcPoints(controlPoints);
        if(infoPoints){
            var points = infoPoints.allpoints;
            points.push(infoPoints.center);
            var linearRing = new SuperMap.Geometry.LinearRing(points);
            return new SuperMap.Geometry.Polygon([linearRing]);
        }
    },

    /**
     * Method: lune
     * 弓形图元
     *
     * 圆弧起始点A 圆弧终点B 圆弧上一点C
     */
    lune: function(controlPoints){
        var infoPoints = this.getArcPoints(controlPoints);
        if(infoPoints){
            var linearRing = new SuperMap.Geometry.LinearRing(infoPoints.allpoints);
            return new SuperMap.Geometry.Polygon([linearRing]);
        }
    },

    /**
     * Method: arc
     * 圆弧图元
     *
     * 圆弧起始点A 圆弧终点B 圆弧上一点C
     */
    arc: function(controlPoints){
        var infoPoints = this.getArcPoints(controlPoints);
        if(infoPoints){
            return new SuperMap.Geometry.LineString(infoPoints.allpoints);
        }
    },

    /**
     * Method: ellipse
     * 椭圆图元   圆心点、旋转角、长半轴及短半轴
     */
    ellipse: function(controlPoints, dAngle, majorAxis, minorAxis){
        if((!majorAxis || majorAxis === null) && (controlPoints && controlPoints.length === 3)) {
            majorAxis = SuperMap.Plot.PlottingUtil.distance(controlPoints[0], controlPoints[1]);
        }
        if((!minorAxis || minorAxis === null) && (controlPoints && controlPoints.length === 3)) {
            var pntProject = SuperMap.Plot.PlottingUtil.projectPoint(controlPoints[2], controlPoints[0], controlPoints[1]);
            minorAxis = SuperMap.Plot.PlottingUtil.distance(pntProject, controlPoints[2]);
        }
        if(!dAngle || dAngle === null){
            dAngle = SuperMap.Plot.PlottingUtil.radian(controlPoints[0], controlPoints[1]);
        }else{
            dAngle *= Math.PI / 180;
        }

        if(dAngle !== 0){
            var dSin = Math.sin(dAngle);
            var dCos = Math.cos(dAngle);
            controlPoints[2].x = controlPoints[0].x + minorAxis*dSin;
            controlPoints[2].y = controlPoints[0].y - minorAxis*dCos;
        }
        if(controlPoints && controlPoints.length > 0){
            var points = this.getEllipseSpatialData(controlPoints[0], majorAxis, minorAxis, dAngle);

            return new SuperMap.Geometry.LinearRing(points);
        }
    },

    /**
     * Method: getEllipseSpatialData
     * 获取椭圆拟合点
     */
    getEllipseSpatialData: function(ptCenter, majorAxis, minorAxis, dRotation){
        var points = [];

        var dRadianBegin = 0.0;
        var dRadianEnd = Math.PI * 2;
        var dStep = dRadianEnd / 360;

        while(dRadianEnd < dRadianBegin){
            dRadianEnd += Math.PI * 2;
        }

        while(dRadianEnd > (dRadianBegin + Math.PI * 2)){
            dRadianBegin += Math.PI * 2;
        }

        var dCosPri = Math.cos(dRotation) * majorAxis;
        var dSinPri = Math.sin(dRotation) * majorAxis;
        var dCosSec = Math.cos(dRotation) * minorAxis;
        var dSinSec = Math.sin(dRotation) * minorAxis;

        var dRadianBeginT = this.calcEllipseRadian(dRadianBegin, majorAxis, minorAxis);
        var dRadianEndT = this.calcEllipseRadian(dRadianEnd, majorAxis, minorAxis);

        if((dRadianEndT - dRadianBeginT) < 0.00001){
            dRadianEndT += 2 * Math.PI;
        }

        var lPointCount = Math.round(Math.abs((dRadianEndT-dRadianBeginT)/dStep) + 1);
        if(lPointCount < 2)
            return points;

        for(var i = 0; i < lPointCount-1; dRadianBeginT += dStep, i++){
            var ptX = ptCenter.x + dCosPri * Math.cos(dRadianBeginT) - dSinSec * Math.sin(dRadianBeginT);
            var ptY = ptCenter.y + dSinPri * Math.cos(dRadianBeginT) + dCosSec * Math.sin(dRadianBeginT);
            points.push(new SuperMap.Geometry.Point(ptX, ptY));
        }

        points[points.length-1].x = ptCenter.x + dCosPri * Math.cos(dRadianEndT) - dSinSec * Math.sin(dRadianEndT);
        points[points.length-1].y = ptCenter.y + dSinPri * Math.cos(dRadianEndT) + dCosSec * Math.sin(dRadianEndT);

        return points;
    },

    /**
     * Method: calcEllipseRadian
     * 计算椭圆弧度
     */
    calcEllipseRadian: function(pntRadian, majorAxis, minorAxis){
        var tempPntRadian = pntRadian;
        var dSinB = majorAxis * Math.sin(pntRadian);
        var dCosB = minorAxis * Math.cos(pntRadian);
        var dRadianT = Math.atan2(dSinB, dCosB);

        if(pntRadian > Math.PI){
            while( tempPntRadian > Math.PI){
                tempPntRadian -= 2 * Math.PI;
                dRadianT += 2 * Math.PI;
            }
        } else if(pntRadian < -Math.PI){
            while(tempPntRadian < -Math.PI){
                tempPntRadian += 2 * Math.PI;
                dRadianT -= 2 * Math.PI;
            }
        }

        return dRadianT;
    },

    /**
     * Method: getArcPoints
     * 根据三个点 （圆弧起始点A 圆弧终点B 圆弧上一点C）计算出圆弧绘制所需的点 以及圆心;用于扇形、弓形、圆弧。
     *
     *Parameters:
     * points - {Array<SuperMap.Geometry.Point>}
     *
     * return {points:Array<SuperMap.Geometry.Point>,center:<SuperMap.Geometry.Point>}
     */
    getArcPoints:function(controlPoints){
        if(controlPoints && controlPoints.length === 4){
            var pointA = controlPoints[0];
            var pointB = controlPoints[2];
            var pointC = controlPoints[1];
            var allPoints=[];
            //以第一个点A、第二个点B为圆弧的端点，C为圆弧上的一点
            //计算A点和B点的中点
            var midPointAB = this.calculateMidpoint(pointA, pointB);
            //计算B点和C点的中点
            var midPointBC = this.calculateMidpoint(pointB, pointC);
            //计算向量AB
            var vectorAB = new SuperMap.Geometry.Point(pointB.x - pointA.x, pointB.y - pointA.y);
            //计算向量BC
            var vectorBC = new SuperMap.Geometry.Point(pointC.x - pointB.x, pointC.y - pointB.y);
            //判断三点是否共线，若共线，返回三点（直线）
            if(Math.abs(vectorAB.x*vectorBC.y-vectorBC.x*vectorAB.y)<0.00001)
            {
                allPoints.push(pointA,pointC,pointB);
                return;
            }
            //计算过AB中点且与向量AB垂直的向量（AB的中垂线向量）
            var vector_center_midPointAB = this.calculateVector(vectorAB)[1];
            //计算过BC中点且与向量BC垂直的向量（BC的中垂线向量）
            var vector_center_midPointBC = this.calculateVector(vectorBC)[1];
            //计算圆弧的圆心
            //var centerPoint = this.calculateIntersection(vector_center_midPointAB, vector_center_midPointBC, midPointAB, midPointBC);
            var centerPoint = controlPoints[3];
            //while(centerPoint.x > 180)
            //    centerPoint.x -= 180;
            //while(centerPoint.x < -180)
            //    centerPoint.x += 180;
            //while(centerPoint.y > 90)
            //    centerPoint.y -= 90;
            //while(centerPoint.y < -90)
            //    centerPoint.y += 90;
            //计算圆弧的半径
            var radius = this.calculateDistance(centerPoint, pointA);
            //分别计算三点所在的直径线与X轴的夹角
            var angleA=this.calculateAngle(pointA,centerPoint);
            var angleB=this.calculateAngle(pointB,centerPoint);
            var angleC=this.calculateAngle(pointC,centerPoint);
            var PI=Math.PI;

            /*圆弧绘制思路为：
             angleA、angleB中最小的角对应的点为起点，最大的角对应的点为终点，若angleC不同时小于或不同时大于angleA与angleB，
             则从起点开始逆时针（direction=1）绘制点，直至终点；否则，从起点开始顺时针（direction=-1）绘制点，直至终点。
             */
            var  direction= 1,startAngle=angleA,endAngle=angleB,startP,endP;
            if(angleA>angleB)
            {
                startAngle=angleB;
                endAngle=angleA;
                startP=pointB;
                endP=pointA;
            }
            else
            {
                startP=pointA;
                endP=pointB;
            }
            var length=endAngle-startAngle;
            if((angleC<angleB &&angleC <angleA)||(angleC>angleB &&angleC >angleA))
            {
                direction=-1;
                length=startAngle+(2*PI-endAngle);
            }

            //计算圆弧上点，默认每隔1°绘制2个点
            var step=PI/360/2;
            var stepDir= step*direction;
            allPoints.push(startP);
            for(var radians =startAngle,i = 0; i <length-step;i+=step)
            {
                radians+=stepDir;
                radians=radians<0?(radians+2*PI):radians;
                radians=radians> 2*PI?(radians-2*PI):radians;
                var circlePoint = new SuperMap.Geometry.Point(Math.cos(radians) * radius + centerPoint.x, Math.sin(radians) * radius + centerPoint.y);
                allPoints.push(circlePoint);

            }
            allPoints.push(endP);

            return {'allpoints':allPoints, 'center':centerPoint};
        }
    },

    /**
     * Method: calculateMidpoint
     * 计算两个点所连成的线段的的中点
     *
     * Parameters:
     * pointA - {<SuperMap.Geometry.Point>} 第一个点
     * pointB -  {<SuperMap.Geometry.Point>} 第二个点
     *
     * Returns:
     * {<SuperMap.Geometry.Point>} 返回中点
     */
    calculateMidpoint: function (pointA, pointB) {
        var midPoint = new SuperMap.Geometry.Point((pointA.x + pointB.x) / 2, (pointA.y + pointB.y) / 2);
        return midPoint;

    },

    /**
     * Method: calculateVector
     * 计算和基准向量v夹角为a、长度为d的目标向量（理论上有两个，一左一右）
     *
     * Parameters:
     * v - {<SuperMap.Geometry.Point>} 基准向量
     * a - {Number} 目标向量和基准向量的夹角，默认为90度，这里的单位使用弧度
     * d - {Number} 目标向量的长度，即模，默认为1，即单位向量
     *
     * Returns:
     * {Array(<SuperMap.Geometry.Point>)} 回目标向量数组（就两个向量，一左一右）
     */
    calculateVector: function (v, a, d) {
        if (!a) a = Math.PI / 2;
        if (!d) d = 1;

        //定义目标向量的头部   x 坐标
        var x_1;
        var x_2;
        //定义目标向量的头部   y 坐标
        var y_1;
        var y_2;
        //定义目标向量，一左一右
        var v_l;
        var v_r;

        //计算基准向量v的模
        var d_v = Math.sqrt(v.x * v.x + v.y * v.y);

        //基准向量的斜率为0时，y值不能作为除数，所以需要特别处理
        if (v.y == 0) {
            //计算x,会有两个值
            x_1 = x_2 = d_v * d * Math.cos(a) / v.x;
            //根据v.x的正负判断目标向量的左右之分
            if (v.x > 0) {
                //计算y
                y_1 = Math.sqrt(d * d - x_1 * x_1);
                y_2 = -y_1;
            }
            else if (v.x < 0) {
                //计算y
                y_2 = Math.sqrt(d * d - x_1 * x_1);
                y_1 = -y_2;
            }
            v_l = new SuperMap.Geometry.Point(x_1, y_1);
            v_r = new SuperMap.Geometry.Point(x_2, y_2);
        }
        //此为大多数情况
        else {
            //转换为y=nx+m形式
            var n = -v.x / v.y;
            var m = d * d_v * Math.cos(a) / v.y;
            //
            //x*x + y*y = d*d
            //转换为a*x*x + b*x + c = 0
            var a = 1 + n * n;
            var b = 2 * n * m;
            var c = m * m - d * d;
            //计算x,会有两个值
            x_1 = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);
            x_2 = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
            //计算y
            y_1 = n * x_1 + m;
            y_2 = n * x_2 + m;
            //当向量向上时
            if (v.y >= 0) {
                v_l = new SuperMap.Geometry.Point(x_1, y_1);
                v_r = new SuperMap.Geometry.Point(x_2, y_2);
            }
            //当向量向下时
            else if (v.y < 0) {
                v_l = new SuperMap.Geometry.Point(x_2, y_2);
                v_r = new SuperMap.Geometry.Point(x_1, y_1);
            }
        }
        return [v_l, v_r];
    },

    /**
     * Method: calculateIntersection
     * 计算两条直线的交点
     * 通过向量的思想进行计算，需要提供两个向量以及两条直线上各自一个点
     *
     * Parameters:
     * v_1 - {<SuperMap.Geometry.Point>} 直线1的向量
     * v_2 - {<SuperMap.Geometry.Point>} 直线2的向量
     * points1 - {<SuperMap.Geometry.Point>} 直线1上的任意一点
     * points2 - {<SuperMap.Geometry.Point>} 直线2上的任意一点
     *
     * Returns:
     * {Array(<SuperMap.Geometry.Point>)} 返回交点
     */
    calculateIntersection: function (v_1, v_2, point1, point2) {
        //定义交点的坐标
        var x;
        var y;
        //如果向量v_1和v_2平行
        if (v_1.y * v_2.x - v_1.x * v_2.y == 0) {
            //平行也有两种情况
            //同向
            if (v_1.x * v_2.x > 0 || v_1.y * v_2.y > 0) {
                //同向直接取两个点的中点
                x = (point1.x + point2.x) / 2;
                y = (point1.y + point2.y) / 2;
            }
            //反向
            else {
                //如果反向直接返回后面的点位置
                x = point2.x;
                y = point2.y;
            }
        }
        else {
            //
            x = (v_1.x * v_2.x * (point2.y - point1.y) + point1.x * v_1.y * v_2.x - point2.x * v_2.y * v_1.x) / (v_1.y * v_2.x - v_1.x * v_2.y);
            if (v_1.x != 0) {
                y = (x - point1.x) * v_1.y / v_1.x + point1.y;
            }
            //不可能v_1.x和v_2.x同时为0
            else {
                y = (x - point2.x) * v_2.y / v_2.x + point2.y;
            }
        }
        return new SuperMap.Geometry.Point(x, y);

    },

    /**
     * Method: calculateDistance
     * 计算两点间的距离
     *
     * Parameters:
     * pointA - {<SuperMap.Geometry.Point>} 第一个点
     * pointB -  {<SuperMap.Geometry.Point>} 第二个点
     *
     * Returns:
     * {<SuperMap.Geometry.Point>} 返回两点间的距离值
     */
    calculateDistance: function (pointA, pointB) {
        var distance =Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2));
        return distance;

    },

    /**
     * Method: calculateAngle
     * 计算圆上一点所在半径的直线与X轴的夹角，结果以弧度形式表示，范围是+π到 +2π。
     */
    calculateAngle: function (pointA, centerPoint) {
        var angle = Math.atan2((pointA.y-centerPoint.y),(pointA.x-centerPoint.x));
        if(angle < 0){ angle += 2*Math.PI; }
        return angle;
    },

    CLASS_NAME: "SuperMap.Geometry.Primitives"
});

/**
 * APIFunction: SuperMap.Geometry.Primitives.transformSymbolCellToGeometry
 * 根据标号图元解析生成相应的Geometry
 *
 * Parameters:
 * params - {Object} 图元对象的数据。
 * params - {Float} 标号的旋转角度，目前椭圆需要使用。
 *
 * Returns:
 * {<SuperMap.Geometry>} 返回相应的Geometry。
 */
SuperMap.Geometry.Primitives.transformSymbolCellToGeometry = function(symbolCell, dAngle){
    var primitives = new SuperMap.Geometry.Primitives();
    switch (symbolCell.type){
        case 24:
            return primitives.polyline(symbolCell.positionPoints);
        case 390:
            return primitives.kidney(symbolCell.positionPoints);
        case 590:
            return primitives.bezier(symbolCell.positionPoints);
        case 360:
            return primitives.loopbezier(symbolCell.positionPoints);
        case 28:
            return primitives.parallelogram(symbolCell.positionPoints);
        case 32:
            return primitives.polygon(symbolCell.positionPoints);
        case 29:
            return primitives.circle(symbolCell.positionPoints);
        case 26:
            return primitives.rectangle(symbolCell.positionPoints);
        case 34:
            return primitives.geotext(symbolCell.positionPoints, symbolCell.textContent);
        case 380:
            return primitives.sector(symbolCell.positionPoints);
        case 370:
            return primitives.lune(symbolCell.positionPoints);
        case 44:
            return primitives.arc(symbolCell.positionPoints);
        case 31:
            return primitives.ellipse(symbolCell.positionPoints, dAngle);
        case 48:
            return primitives.parallelline(symbolCell.positionPoints);
    }
};