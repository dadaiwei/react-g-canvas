"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var g_base_1 = require("@antv/g-base");
var util_1 = require("../util/util");
var draw_1 = require("../util/draw");
var index_1 = require("@antv/g-base/lib/bbox/index");
var Shape = require("./index");
var group_1 = require("../group");
var ShapeBase = /** @class */ (function (_super) {
    tslib_1.__extends(ShapeBase, _super);
    function ShapeBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ShapeBase.prototype.getDefaultAttrs = function () {
        var attrs = _super.prototype.getDefaultAttrs.call(this);
        // 设置默认值
        return tslib_1.__assign(tslib_1.__assign({}, attrs), { lineWidth: 1, lineAppendWidth: 0, strokeOpacity: 1, fillOpacity: 1 });
    };
    ShapeBase.prototype.getShapeBase = function () {
        return Shape;
    };
    ShapeBase.prototype.getGroupBase = function () {
        return group_1.default;
    };
    /**
     * 一些方法调用会引起画布变化
     * @param {ChangeType} changeType 改变的类型
     */
    ShapeBase.prototype.onCanvasChange = function (changeType) {
        draw_1.refreshElement(this, changeType);
    };
    ShapeBase.prototype.calculateBBox = function () {
        var type = this.get('type');
        var lineWidth = this.getHitLineWidth();
        // const attrs = this.attr();
        var bboxMethod = index_1.getBBoxMethod(type);
        var box = bboxMethod(this);
        var halfLineWidth = lineWidth / 2;
        var minX = box.x - halfLineWidth;
        var minY = box.y - halfLineWidth;
        var maxX = box.x + box.width + halfLineWidth;
        var maxY = box.y + box.height + halfLineWidth;
        return {
            x: minX,
            minX: minX,
            y: minY,
            minY: minY,
            width: box.width + lineWidth,
            height: box.height + lineWidth,
            maxX: maxX,
            maxY: maxY,
        };
    };
    ShapeBase.prototype.isFill = function () {
        return !!this.attrs['fill'] || this.isClipShape();
    };
    ShapeBase.prototype.isStroke = function () {
        return !!this.attrs['stroke'];
    };
    // 同 shape 中的方法重复了
    ShapeBase.prototype._applyClip = function (context, clip) {
        if (clip) {
            context.save();
            // 将 clip 的属性挂载到 context 上
            draw_1.applyAttrsToContext(context, clip);
            // 绘制 clip 路径
            clip.createPath(context);
            context.restore();
            // 裁剪
            context.clip();
            clip._afterDraw();
        }
    };
    // 绘制图形时需要考虑 region 限制
    ShapeBase.prototype.draw = function (context, region) {
        var clip = this.getClip();
        // 如果指定了区域，当与指定区域相交时，才会触发渲染
        if (region) {
            // 是否相交需要考虑 clip 的包围盒
            var bbox = clip ? draw_1.getMergedRegion([this, clip]) : this.getCanvasBBox();
            if (!util_1.intersectRect(region, bbox)) {
                return;
            }
        }
        context.save();
        // 先将 attrs 应用到上下文中，再设置 clip。因为 clip 应该被当前元素的 matrix 所影响
        draw_1.applyAttrsToContext(context, this);
        this._applyClip(context, this.getClip());
        this.drawPath(context);
        context.restore();
        this._afterDraw();
    };
    ShapeBase.prototype._afterDraw = function () {
        // 绘制的时候缓存包围盒
        this.set('cacheCanvasBBox', this.getCanvasBBox());
        // 绘制后消除标记
        this.set('hasChanged', false);
    };
    ShapeBase.prototype.skipDraw = function () {
        this.set('cacheCanvasBBox', null);
        this.set('hasChanged', false);
    };
    /**
     * 绘制图形的路径
     * @param {CanvasRenderingContext2D} context 上下文
     */
    ShapeBase.prototype.drawPath = function (context) {
        this.createPath(context);
        this.strokeAndFill(context);
        this.afterDrawPath(context);
    };
    /**
     * @protected
     * 填充图形
     * @param {CanvasRenderingContext2D} context context 上下文
     */
    ShapeBase.prototype.fill = function (context) {
        context.fill();
    };
    /**
     * @protected
     * 绘制图形边框
     * @param {CanvasRenderingContext2D} context context 上下文
     */
    ShapeBase.prototype.stroke = function (context) {
        context.stroke();
    };
    // 绘制或者填充
    ShapeBase.prototype.strokeAndFill = function (context) {
        var _a = this.attrs, lineWidth = _a.lineWidth, opacity = _a.opacity, strokeOpacity = _a.strokeOpacity, fillOpacity = _a.fillOpacity;
        if (this.isFill()) {
            if (!util_1.isNil(fillOpacity) && fillOpacity !== 1) {
                context.globalAlpha = fillOpacity;
                this.fill(context);
                context.globalAlpha = opacity;
            }
            else {
                this.fill(context);
            }
        }
        if (this.isStroke()) {
            if (lineWidth > 0) {
                if (!util_1.isNil(strokeOpacity) && strokeOpacity !== 1) {
                    context.globalAlpha = strokeOpacity;
                }
                this.stroke(context);
            }
        }
        this.afterDrawPath(context);
    };
    /**
     * @protected
     * 绘制图形的路径
     * @param {CanvasRenderingContext2D} context 上下文
     */
    ShapeBase.prototype.createPath = function (context) { };
    /**
     * 绘制完成 path 后的操作
     * @param {CanvasRenderingContext2D} context 上下文
     */
    ShapeBase.prototype.afterDrawPath = function (context) { };
    ShapeBase.prototype.isInShape = function (refX, refY) {
        // return HitUtil.isHitShape(this, refX, refY);
        var isStroke = this.isStroke();
        var isFill = this.isFill();
        var lineWidth = this.getHitLineWidth();
        return this.isInStrokeOrPath(refX, refY, isStroke, isFill, lineWidth);
    };
    // 之所以不拆成 isInStroke 和 isInPath 在于两者存在一些共同的计算
    ShapeBase.prototype.isInStrokeOrPath = function (x, y, isStroke, isFill, lineWidth) {
        return false;
    };
    /**
     * 获取线拾取的宽度
     * @returns {number} 线的拾取宽度
     */
    ShapeBase.prototype.getHitLineWidth = function () {
        if (!this.isStroke()) {
            return 0;
        }
        var attrs = this.attrs;
        return attrs['lineWidth'] + attrs['lineAppendWidth'];
    };
    return ShapeBase;
}(g_base_1.AbstractShape));
exports.default = ShapeBase;
//# sourceMappingURL=base.js.map