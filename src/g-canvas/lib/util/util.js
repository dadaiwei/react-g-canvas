"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getPixelRatio() {
    return window ? window.devicePixelRatio : 1;
}
exports.getPixelRatio = getPixelRatio;
/**
 * 两点之间的距离
 * @param {number} x1 起始点 x
 * @param {number} y1 起始点 y
 * @param {number} x2 结束点 x
 * @param {number} y2 结束点 y
 */
function distance(x1, y1, x2, y2) {
    var dx = x1 - x2;
    var dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
}
exports.distance = distance;
/**
 * 是否在包围盒内
 * @param {number} minX   包围盒开始的点 x
 * @param {number} minY   包围盒开始的点 y
 * @param {number} width  宽度
 * @param {number} height 高度
 * @param {[type]} x      检测点的 x
 * @param {[type]} y      监测点的 y
 */
function inBox(minX, minY, width, height, x, y) {
    return x >= minX && x <= minX + width && y >= minY && y <= minY + height;
}
exports.inBox = inBox;
// 全局设置一个唯一离屏的 ctx，用于计算 isPointInPath
var offScreenCtx = null;
function getOffScreenContext() {
    if (!offScreenCtx) {
        var canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        offScreenCtx = canvas.getContext('2d');
    }
    return offScreenCtx;
}
exports.getOffScreenContext = getOffScreenContext;
function intersectRect(box1, box2) {
    return !(box2.minX > box1.maxX || box2.maxX < box1.minX || box2.minY > box1.maxY || box2.maxY < box1.minY);
}
exports.intersectRect = intersectRect;
// 合并两个区域
function mergeRegion(region1, region2) {
    if (!region1 || !region2) {
        return region1 || region2;
    }
    return {
        minX: Math.min(region1.minX, region2.minX),
        minY: Math.min(region1.minY, region2.minY),
        maxX: Math.max(region1.maxX, region2.maxX),
        maxY: Math.max(region1.maxY, region2.maxY),
    };
}
exports.mergeRegion = mergeRegion;
/**
 * 判断两个点是否重合，点坐标的格式为 [x, y]
 * @param {Array} point1 第一个点
 * @param {Array} point2 第二个点
 */
function isSamePoint(point1, point2) {
    return point1[0] === point2[0] && point1[1] === point2[1];
}
exports.isSamePoint = isSamePoint;
var is_nil_1 = require("@antv/util/lib/is-nil");
exports.isNil = is_nil_1.default;
var is_string_1 = require("@antv/util/lib/is-string");
exports.isString = is_string_1.default;
var is_function_1 = require("@antv/util/lib/is-function");
exports.isFunction = is_function_1.default;
var is_array_1 = require("@antv/util/lib/is-array");
exports.isArray = is_array_1.default;
var each_1 = require("@antv/util/lib/each");
exports.each = each_1.default;
var to_radian_1 = require("@antv/util/lib/to-radian");
exports.toRadian = to_radian_1.default;
var mod_1 = require("@antv/util/lib/mod");
exports.mod = mod_1.default;
var is_number_equal_1 = require("@antv/util/lib/is-number-equal");
exports.isNumberEqual = is_number_equal_1.default;
var request_animation_frame_1 = require("@antv/util/lib/request-animation-frame");
exports.requestAnimationFrame = request_animation_frame_1.default;
var clear_animation_frame_1 = require("@antv/util/lib/clear-animation-frame");
exports.clearAnimationFrame = clear_animation_frame_1.default;
//# sourceMappingURL=util.js.map