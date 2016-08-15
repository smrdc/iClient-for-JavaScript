/**
 * Class: SuperMap.Plot.PlottingUtil
 * 一些常用的函数。
 */
SuperMap.Plot.PlottingUtil = new SuperMap.Class({

    CLASS_NAME: "SuperMap.Plot.PlottingUtil"
});

/**
 * APIFunction: SuperMap.Plot.PlottingUtil.toJSON
 * 将对象转换成 JSON 字符串。
 *
 * Parameters:
 * obj - {Object} 要转换成 JSON 的 Object 对象。
 *
 * Returns:
 * {String} 返回转换后的 JSON 对象。
 */
SuperMap.Plot.PlottingUtil.toJSON = function (obj) {
    var objInn = obj;
    if (objInn == null) {
        return null;
    }
    switch (objInn.constructor) {
        case String:
            //s = "'" + str.replace(/(["\\])/g, "\\$1") + "'";   string含有单引号出错
            objInn = '"' + objInn.replace(/(["\\])/g, '\\$1') + '"';
            objInn= objInn.replace(/\n/g,"\\n");
            objInn= objInn.replace(/\r/g,"\\r");
            objInn= objInn.replace("<", "&lt;");
            objInn= objInn.replace(">", "&gt;");
            objInn= objInn.replace(/%/g, "%25");
            objInn= objInn.replace(/&/g, "%26");
            return objInn;
        case Array:
            var arr = [];
            for(var i=0,len=objInn.length;i<len;i++) {
                arr.push(SuperMap.Plot.PlottingUtil.toJSON(objInn[i]));
            }
            return "[" + arr.join(",") + "]";
        case Number:
            return isFinite(objInn) ? String(objInn) : null;
        case Boolean:
            return String(objInn);
        case Date:
            var dateStr = "{" + "'__type':\"System.DateTime\"," +
                "'Year':" + objInn.getFullYear() + "," +
                "'Month':" + (objInn.getMonth() + 1) + "," +
                "'Day':" + objInn.getDate() + "," +
                "'Hour':" + objInn.getHours() + "," +
                "'Minute':" + objInn.getMinutes() + "," +
                "'Second':" + objInn.getSeconds() + "," +
                "'Millisecond':" + objInn.getMilliseconds() + "," +
                "'TimezoneOffset':" + objInn.getTimezoneOffset() + "}";
            return dateStr;
        default:
            if (objInn["toJSON"] != null && typeof objInn["toJSON"] === "function") {
                return objInn.toJSON();
            }
            if (typeof objInn === "object") {
                if (objInn.length) {
                    var arr = [];
                    for(var i=0,len=objInn.length;i<len;i++)
                        arr.push(SuperMap.Plot.PlottingUtil.toJSON(objInn[i]));
                    return "[" + arr.join(",") + "]";
                }
                var arr=[];
                for (attr in objInn) {
                    //为解决SuperMap.Geometry类型头json时堆栈溢出的问题，attr == "parent"时不进行json转换
                    if (typeof objInn[attr] !== "function" && attr !== "CLASS_NAME" && attr !== "parent") {
                        arr.push("\"" + attr + "\":" + SuperMap.Plot.PlottingUtil.toJSON(objInn[attr]));
                    }
                }

                if (arr.length > 0) {
                    return "{" + arr.join(",") + "}";
                } else {
                    return "{}";
                }
            }
            return objInn.toString();
    }
};

/**
 * APIFunction: SuperMap.Plot.PlottingUtil.isRight
 * 判断点是否在线段的右边。
 *
 * Parameters:
 * pntTest - {<SuperMap.Geometry.Point>} 要判断的点。
 * pntStart - {<SuperMap.Geometry.Point>} 线段起点。
 * pntEnd - {<SuperMap.Geometry.Point>} 线段终点。
 *
 * Returns:
 * {Integer} 在右边返回true。
 */
SuperMap.Plot.PlottingUtil.isRight = function(pntTest, pntStart, pntEnd) {
    var pntFrom1 = pntStart;
    var pntTo1 = pntEnd;
    var pntFrom2 = pntStart;
    var pntTo2 = pntTest;

    //矢量叉乘 < 0
    return ((pntTo1.x-pntFrom1.x)*(pntTo2.y-pntFrom2.y) - (pntTo2.x-pntFrom2.x)*(pntTo1.y-pntFrom1.y)) < 0;
};

/**
 * APIFunction: SuperMap.Plot.PlottingUtil.radian
 * 计算两点的弧度（和正东方向的逆时针夹角）。
 *
 * Parameters:
 * textContent - {String} 要求解长度的字符串。
 *
 * Returns:
 * {Integer} 返回字符串长度。
 */
SuperMap.Plot.PlottingUtil.radian = function(pntFrom, pntTo) {
    var dAngle = 0;
    var dDistx = pntTo.x - pntFrom.x;
    var dDisty = pntTo.y - pntFrom.y;
    dAngle = Math.atan2(dDisty, dDistx);
    if(dAngle < 0){
        dAngle += 2 * Math.PI;
    }

    return dAngle;
};

/**
 * APIFunction: SuperMap.Plot.PlottingUtil.findBisectorPoint
 * 计算二等分点。
 *
 * Parameters:
 * textContent - {String} 要求解长度的字符串。
 *
 * Returns:
 * {Integer} 返回字符串长度。
 */
SuperMap.Plot.PlottingUtil.findBisectorPoint = function(pnt1, pntJoint, pnt2, dDistance) {
    var dRadian1 = SuperMap.Plot.PlottingUtil.radian(pntJoint, pnt1);
    var dRadian2 = SuperMap.Plot.PlottingUtil.radian(pntJoint, pnt2);
    var dRadian = (dRadian1 + dRadian2) / 2.0;

    var dRadio = Math.cos(dRadian - dRadian1 + Math.PI / 2);
    var dDisOnBisector = dDistance;
    if(Math.abs(dRadio) > 0.000000001){
        dDisOnBisector = dDistance / dRadio;
    }

    var pntResultX = pntJoint.x + dDisOnBisector * Math.cos(dRadian);
    var pntResultY = pntJoint.y + dDisOnBisector * Math.sin(dRadian);

    return new SuperMap.Geometry.Point(pntResultX, pntResultY);
};

/**
 * APIFunction: SuperMap.Plot.PlottingUtil.findPoint
 * 在直线(pntStart, pntEnd)绕pntStart逆时针旋转dAngle度所成的直线上，到pntStart的距离为dDistance的点。
 *
 * Parameters:
 * pntStart - {<SuperMap.Geometry.Point>} 直线起点。
 * pntEnd - {<SuperMap.Geometry.Point>} 直线终点。
 * dDistance - {Float} 和pntStart的距离。
 * dAngle - {Float} 直线绕pntStart的旋转角度。
 *
 * Returns:
 * {<SuperMap.Geometry.Point>}
 */
SuperMap.Plot.PlottingUtil.findPoint = function(pntStart, pntEnd, dDistance, dAngle) {
    if(pntStart === pntEnd || Math.abs(dDistance) < 0.00000001){
        return pntStart;
    }

    var dRadian = SuperMap.Plot.PlottingUtil.radian(pntStart, pntEnd) + dAngle * Math.PI /180;

    var pntResultX = pntStart.x + dDistance * Math.cos(dRadian);
    var pntResultY = pntStart.y + dDistance * Math.sin(dRadian);

    return new SuperMap.Geometry.Point(pntResultX, pntResultY);
};

/**
 * APIFunction: SuperMap.Plot.PlottingUtil.isSameQuadrant
 * 判断两条线段是否同向。矢量方向在同一象限内
 *
 * Parameters:
 * pntStart1 - {<SuperMap.Geometry.Point>} 线段起点。
 * pntEnd1 - {<SuperMap.Geometry.Point>} 线段终点。
 * pntStart2 - {<SuperMap.Geometry.Point>} 另一条线段起点。
 * pntEnd2 - {<SuperMap.Geometry.Point>} 另一条线段终点。
 *
 * Returns:
 * {Boolean} 是否同向
 */
SuperMap.Plot.PlottingUtil.isSameQuadrant = function(pntStart1, pntEnd1, pntStart2, pntEnd2) {
    var dDictionX = (pntEnd1.x - pntStart1.x) * (pntEnd2.x - pntStart2.x);
    var dDictionY = (pntEnd1.y - pntStart1.y) * (pntEnd2.y - pntStart2.y);

    if(Math.abs(dDictionX) < 0.00000001 && Math.abs(dDictionY) < 0.00000001){
        return false; //垂直情况
    }

    if((dDictionX > 0 || Math.abs(dDictionX) < 0.00000001) && (dDictionY > 0 || Math.abs(dDictionY) < 0.00000001)){
        return true;
    }

    return false;
};

/**
 * APIFunction: SuperMap.Plot.PlottingUtil.isCross
 * 判断线段A是否跨越线段B
 *
 * Parameters:
 * pntStart1 - {<SuperMap.Geometry.Point>} 线段起点。
 * pntEnd1 - {<SuperMap.Geometry.Point>} 线段终点。
 * pntStart2 - {<SuperMap.Geometry.Point>} 另一条线段起点。
 * pntEnd2 - {<SuperMap.Geometry.Point>} 另一条线段终点。
 *
 * Returns:
 * {Boolean} 是否跨越
 */
SuperMap.Plot.PlottingUtil.isCross = function(pntStart1, pntEnd1, pntStart2, pntEnd2) {
    var pntIntersect = new SuperMap.Geometry.Point();

    if(SuperMap.Plot.PlottingUtil.intersectLineSegs(pntStart1, pntEnd1, pntStart2, pntEnd2, pntIntersect)){
        if(pntIntersect != pntStart1 && pntIntersect !== pntEnd1 && pntIntersect !== pntStart2 && pntIntersect != pntEnd2){
            return true;
        }
    }

    return false;
};

/**
 * APIFunction: SuperMap.Plot.PlottingUtil.intersectLineSegs
 * 求解线段和线段的交点，重叠或者平行返回false
 *
 * Parameters:
 * pntStart1 - {<SuperMap.Geometry.Point>} 线段起点。
 * pntEnd1 - {<SuperMap.Geometry.Point>} 线段终点。
 * pntStart2 - {<SuperMap.Geometry.Point>} 另一条线段起点。
 * pntEnd2 - {<SuperMap.Geometry.Point>} 另一条线段终点。
 *
 * Returns:
 * {Boolean} 平行返回false
 */
SuperMap.Plot.PlottingUtil.intersectLineSegs = function(pntStart1, pntEnd1, pntStart2, pntEnd2, pntResult) {
    if(pntStart1 === pntEnd1 || pntStart2 === pntEnd2){
        return false;
    }

    var dToler = 1e-10;

    var dmax = 0;
    var dmin = 0;
    dmax = (pntStart1.x > pntEnd1.x ? pntStart1.x : pntEnd1.x);
    dmin = (pntStart1.x < pntEnd1.x ? pntStart1.x : pntEnd1.x);
    if(((pntStart2.x - dmax) > dToler && (pntEnd2.x - dmax) > dToler) || ((pntStart2.x - dmin) < (-dToler) && (pntEnd2.x - dmin) < (-dToler))){
        return false;
    }

    dmax = (pntStart1.y > pntEnd1.y ? pntStart1.y : pntEnd1.y);
    dmin = (pntStart1.y < pntEnd1.y ? pntStart1.y : pntEnd1.y);
    if(((pntStart2.y - dmax) > dToler && (pntEnd2.y - dmax) > dToler) || ((pntStart2.y - dmin) < (-dToler) && (pntEnd2.y - dmin) < (-dToler))){
        return false;
    }

    var dOffsetX1 = pntEnd1.x - pntStart1.x;
    var dOffsetY1 = pntEnd1.y - pntStart1.y;
    var dOffsetX2 = pntEnd2.x - pntStart2.x;
    var dOffsetY2 = pntEnd2.y - pntStart2.y;
    var dOffsetX12 = pntStart1.x - pntStart2.x;
    var dOffsetY12 = pntStart1.y - pntStart2.y;

    var delt = dOffsetX1 * dOffsetY2 - dOffsetX2 * dOffsetY1;
    var deltB = delt;
    if(Math.abs(dOffsetX1) > 0.000000001 && Math.abs(dOffsetX2) > 0.000000001){
        deltB /= (dOffsetX1*dOffsetX2);
    }

    if(Math.abs(deltB) < 0.000000001){
        if(pntStart1 === pntStart2){
            pntResult = pntStart1;
            return !SuperMap.Plot.PlottingUtil.isSameQuadrant(pntStart1, pntEnd1, pntStart2, pntEnd2);
        } else if(pntEnd1 === pntEnd2){
            pntResult = pntEnd1;
            return !SuperMap.Plot.PlottingUtil.isSameQuadrant(pntStart1, pntEnd1, pntStart2, pntEnd2);
        } else if(pntStart1 === pntEnd2){
            pntResult = pntStart1;
            return SuperMap.Plot.PlottingUtil.isSameQuadrant(pntStart1, pntEnd1, pntStart2, pntEnd2);
        } else if(pntEnd1 === pntStart2){
            pntResult = pntEnd1;
            return SuperMap.Plot.PlottingUtil.isSameQuadrant(pntStart1, pntEnd1, pntStart2, pntEnd2);
        }

        return false;
    }

    var t0 = (dOffsetX1*dOffsetY12 - dOffsetY1*dOffsetX12) / delt;
    var t1 = (dOffsetX2*dOffsetY12 - dOffsetY2*dOffsetX12) / delt;

    if((t0 < 0) && (Math.abs(t0*dOffsetX2) > dToler || Math.abs(t0*dOffsetY2) > dToler)){
        return false;
    }
    if((t0 > 1.0) && ((Math.abs((t0-1)*dOffsetX2)>dToler)||(Math.abs((t0-1)*dOffsetY2)>dToler)))
    {
        return false;
    }
    if((t1 < 0) && ((Math.abs(t1*dOffsetX1)>dToler)||(Math.abs(t1*dOffsetY1)>dToler)))
    {
        return false;
    }
    if((t1 > 1.0) && ((Math.abs((t1-1)*dOffsetX1)>dToler)||(Math.abs((t1-1)*dOffsetY1)>dToler)))
    {
        return false;
    }

    if (Math.abs(t0) < 0.00000001)
    {
        pntResult = pntStart2;
        return true;
    }
    else if (Math.abs(t0-1) < 0.00000001)
    {
        pntResult = pntEnd2;
        return true;
    }
    if (Math.abs(t1) < 0.00000001)
    {
        pntResult = pntStart1;
        return true;
    }
    else if (Math.abs(t1-1) < 0.00000001)
    {
        pntResult = pntEnd1;
        return true;
    }

    if ((t0 < 0) && ((Math.abs(t0*dOffsetX2)>dToler)||(Math.abs(t0*dOffsetY2)>dToler)))
    {
        return false;
    }
    if ((t0 > 1.0) && ((Math.abs((t0-1)*dOffsetX2)>dToler)||(Math.abs((t0-1)*dOffsetY2)>dToler)))
    {
        return false;
    }
    if ((t1 < 0) && ((Math.abs(t1*dOffsetX1)>dToler)||(Math.abs(t1*dOffsetY1)>dToler)))
    {
        return false;
    }
    if ((t1 > 1.0) && ((Math.abs((t1-1)*dOffsetX1)>dToler)||(Math.abs((t1-1)*dOffsetY1)>dToler)))
    {
        return false;
    }

    pntResult.x = t0*dOffsetX2 + pntStart2.x;
    pntResult.y = t0*dOffsetY2 + pntStart2.y;

    return true;
};

/**
 * APIFunction: SuperMap.Plot.PlottingUtil.parallel
 * 求解折线的平行线。
 *
 * Parameters:
 * pntSrc - {Array(<SuperMap.Geometry.Point>)} 折线数组。
 * dDistance - {Float} 平行线之间距离。
 *
 * Returns:
 * {Array(<SuperMap.Geometry.Point>)} 返回折线。
 */
SuperMap.Plot.PlottingUtil.parallel = function(pntSrc, dDistance) {
    var pntResult = [];

    if(!pntSrc || pntSrc === null || pntSrc.length < 2){
        return pntResult;
    }

    var bClose = false;
    if(pntSrc.length > 3 && pntSrc[0] === pntSrc[pntSrc.length-1]){
        bClose = true;
    }

    if(bClose){
        pntResult[0] = SuperMap.Plot.PlottingUtil.findBisectorPoint(pntSrc[pntSrc.length-2], pntSrc[0], pntSrc[1], dDistance);
        pntResult[pntSrc.length-1] = pntResult[0];
    } else {
        pntResult[0] = SuperMap.Plot.PlottingUtil.findPoint(pntSrc[0], pntSrc[1], dDistance, 90);
        pntResult[pntSrc.length-1] = SuperMap.Plot.PlottingUtil.findPoint(pntSrc[pntSrc.length-1], pntSrc[pntSrc.length-2], -dDistance, 90);
    }

    var pnt0 = pntSrc[0];
    var pnt1 = pntSrc[1];
    var pnt2 = pntSrc[1];
    for(var i = 1; i < pntSrc.length-1; i++){
        pnt1 = pntSrc[i];
        if(pntSrc[i] !== pntSrc[i-1]){
            pnt0 = pntSrc[i-1];
        }

        if(pntSrc[i] !== pntSrc[i+1]){
            pnt2 = pntSrc[i+1];
            var pnt = SuperMap.Plot.PlottingUtil.findBisectorPoint(pnt0, pnt1, pnt2, dDistance);
            if(SuperMap.Plot.PlottingUtil.isCross(pnt0, pntResult[i-1], pnt1, pnt)){
                pnt = pntResult[i-1];
            }
            pntResult[i] = pnt;
        }
        else {
            var nFrom = i;
            while (nFrom < nPntCount - 1 )
            {
                if(pSrc[nFrom] !== pSrc[nFrom+1])
                {
                    pnt2 = pSrc[nFrom+1];
                    break;
                }
                nFrom ++;
            }
            if(nFrom < nPntCount-1)
            {
                var pnt = FindBisectorPoint(pnt0,pnt1,pnt2,dDistance);
                if (SuperMap.Plot.PlottingUtil.isCross(pnt0,pntResults[i-1],pnt1,pnt))
                {
                    pnt = pntResults[i-1];
                }

                while ( i < nFrom )
                {
                    pntResults[i] = pnt;
                    i++;
                }
                i = nFrom-1;
            }
        }
    }

    return pntResult;
};

/**
 * APIFunction: SuperMap.Plot.PlottingUtil.distance
 * 求解两点间距离
 *
 * Parameters:
 * pt1 - {<SuperMap.Geometry.Point>} 第一点
 * pt2 - {<SuperMap.Geometry.Point>} 另一点
 *
 * Returns:
 * {Float} 返回pt1和pt2两点间距离。
 */
SuperMap.Plot.PlottingUtil.distance = function(pt1, pt2){

    return Math.sqrt((pt1.x-pt2.x)*(pt1.x-pt2.x)+(pt1.y-pt2.y)*(pt1.y-pt2.y));
};

/**
 * APIFunction: SuperMap.Plot.PlottingUtil.projectPoint
 * 求pt在线段(ptStart, ptEnd)上的垂足
 *
 * Parameters:
 * pt - {<SuperMap.Geometry.Point>} pt
 * ptStart - {<SuperMap.Geometry.Point>} 线段起点
 * ptEnd - {<SuperMap.Geometry.Point>} 线段终点
 *
 * Returns:
 * {<SuperMap.Geometry.Point>} 返回垂足点。
 */
SuperMap.Plot.PlottingUtil.projectPoint = function(pt, ptStart, ptEnd){
    if(ptStart === ptEnd){
        return pntStart;
    }

    var pntProject = new SuperMap.Geometry.Point();

    var dDaltaX = ptEnd.x - ptStart.x;
    var dDaltaY = ptStart.y - ptEnd.y;

    var dDaltaX2 = dDaltaX * dDaltaX;
    var dDaltaY2 = dDaltaY * dDaltaY;
    var dDeltaXY = dDaltaX * dDaltaY;

    var dLineSectDist = dDaltaX * dDaltaX + dDaltaY * dDaltaY;

    pntProject.x = (dDeltaXY * (ptStart.y-pt.y) + ptStart.x * dDaltaY2 + pt.x * dDaltaX2) / dLineSectDist;
    pntProject.y = (dDeltaXY * (ptStart.x-pt.x) + ptStart.y * dDaltaX2 + pt.y * dDaltaY2) / dLineSectDist;

    return pntProject;
};

/**
 * APIFunction: SuperMap.Plot.PlottingUtil.pointToLineDis
 * 求pt到线段(ptStart, ptEnd)上的距离
 *
 * Parameters:
 * pt - {<SuperMap.Geometry.Point>} pt
 * ptStart - {<SuperMap.Geometry.Point>} 线段起点
 * ptEnd - {<SuperMap.Geometry.Point>} 线段终点
 *
 * Returns:
 * {<SuperMap.Geometry.Point>} 返回距离。
 */
SuperMap.Plot.PlottingUtil.pointToLineDis = function(pt, ptStart, ptEnd){

    var pntProject = SuperMap.Plot.PlottingUtil.projectPoint(pt,ptStart,ptEnd);
    return SuperMap.Plot.PlottingUtil.distance(pt,pntProject);
};

/**
 * APIFunction: SuperMap.Plot.PlottingUtil.pointToPloyLineDis
 * 求pt到(ptStart, ptEnd)折线上的距离,如果垂足不在折线上，则返回点到线段两个端点距离的较小值
 *
 * Parameters:
 * pt - {<SuperMap.Geometry.Point>} pt
 * ptStart - {<SuperMap.Geometry.Point>} 线段起点
 * ptEnd - {<SuperMap.Geometry.Point>} 线段终点
 *
 * Returns:
 * {<SuperMap.Geometry.Point>} 返回距离。
 */
SuperMap.Plot.PlottingUtil.pointToPloyLineDis = function(pt, ptStart, ptEnd){

    if(ptStart === ptEnd)
    {
        return SuperMap.Plot.PlottingUtil.distance(pt,ptStart);
    }

    var da2 = (ptStart.x-pt.x)*(ptStart.x-pt.x) + (ptStart.y-pt.y)*(ptStart.y-pt.y) ;
    var db2 = (ptEnd.x-pt.x)*(ptEnd.x-pt.x) + (ptEnd.y-pt.y)*(ptEnd.y-pt.y) ;
    var dc2 = (ptStart.x-ptEnd.x)*(ptStart.x-ptEnd.x) + (ptStart.y-ptEnd.y)*(ptStart.y-ptEnd.y) ;

    var dtemp = (da2+dc2-db2)/(2*dc2);

    if(dtemp<0)
    {
        dtemp = 0.0;
    }
    else if(dtemp>1.0)
    {
        dtemp = 1.0;
    }

    var dx = (ptEnd.x - ptStart.x)*dtemp + ptStart.x;
    var dy = (ptEnd.y - ptStart.y)*dtemp + ptStart.y;

    var dDistance2  =  (dx-pt.x)*(dx-pt.x) + (dy-pt.y)*(dy-pt.y);
    var dDistance   =  Math.sqrt(dDistance2);
    return dDistance;
};