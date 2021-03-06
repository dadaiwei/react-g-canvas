"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
var tslib_1 = require("tslib");
var g_base_1 = require("@antv/g-base");
var event_contoller_1 = require("@antv/g-base/lib/event/event-contoller");
var Shape = require("./shape");
var group_1 = require("./group");
var draw_1 = require("./util/draw");
var util_1 = require("./util/util");
var REFRSH_COUNT = 30; // 局部刷新的元素个数，超过后合并绘图区域
var Canvas = /** @class */ (function (_super) {
    tslib_1.__extends(Canvas, _super);
    function Canvas() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Canvas.prototype.getDefaultCfg = function () {
        var cfg = _super.prototype.getDefaultCfg.call(this);
        // 设置渲染引擎为 canvas，只读属性
        cfg['renderer'] = 'canvas';
        // 是否自动绘制，不需要用户调用 draw 方法
        cfg['autoDraw'] = true;
        // 是否允许局部刷新图表
        cfg['localRefresh'] = true;
        cfg['refreshElements'] = [];
        return cfg;
    };
    /**
     * 一些方法调用会引起画布变化
     * @param {ChangeType} changeType 改变的类型
     */
    Canvas.prototype.onCanvasChange = function (changeType) {
        /**
         * 触发画布更新的三种 changeType
         * 1. attr: 修改画布的绘图属性
         * 2. sort: 画布排序，图形的层次会发生变化
         * 3. changeSize: 改变画布大小
         */
        if (changeType === 'attr' || changeType === 'sort' || changeType === 'changeSize') {
            this.set('refreshElements', [this]);
            this.draw();
        }
    };
    Canvas.prototype.getShapeBase = function () {
        return Shape;
    };
    Canvas.prototype.getGroupBase = function () {
        return group_1.default;
    };
    /**
     * 获取屏幕像素比
     */
    Canvas.prototype.getPixelRatio = function () {
        return this.get('pixelRatio') || util_1.getPixelRatio();
    };
    Canvas.prototype.getViewRange = function () {
        var element = this.get('el');
        return {
            minX: 0,
            minY: 0,
            maxX: element.width,
            maxY: element.height,
        };
    };
    // 复写处理事件
    Canvas.prototype.initEvents = function () {
        var eventController = new event_contoller_1.default({
            canvas: this,
        });
        eventController.init();
        this.set('eventController', eventController);
    };
    // 复写基类的方法生成标签
    Canvas.prototype.createDom = function () {
        var element = document.createElement('canvas');
        var context = element.getContext('2d');
        // 缓存 context 对象
        this.set('context', context);
        return element;
    };
    Canvas.prototype.setDOMSize = function (width, height) {
        _super.prototype.setDOMSize.call(this, width, height);
        var context = this.get('context');
        var el = this.get('el');
        var pixelRatio = this.getPixelRatio();
        el.width = pixelRatio * width;
        el.height = pixelRatio * height;
        // 设置 canvas 元素的宽度和高度，会重置缩放，因此 context.scale 需要在每次设置宽、高后调用
        if (pixelRatio > 1) {
            context.scale(pixelRatio, pixelRatio);
        }
    };
    // 复写基类方法
    Canvas.prototype.clear = function () {
        _super.prototype.clear.call(this);
        this._clearFrame(); // 需要清理掉延迟绘制的帧
        var context = this.get('context');
        var element = this.get('el');
        context.clearRect(0, 0, element.width, element.height);
    };
    // 对绘制区域边缘取整，避免浮点数问题
    Canvas.prototype._getRefreshRegion = function () {
        var elements = this.get('refreshElements');
        var region;
        // 如果是当前画布整体发生了变化，则直接重绘整个画布
        if (elements.length && elements[0] === this) {
            region = this.getViewRange();
        }
        else {
            region = draw_1.getMergedRegion(elements);
            // 附加 0.5 像素，会解决1px 变成 2px 的问题，无论 pixelRatio 的值是多少
            // 真实测试的环境下，发现在 1-2 之间时会出现 >2 和 <1 的情况下未出现，但是为了安全，统一附加 0.5
            var appendPixel = 0.5;
            if (region) {
                region.minX = Math.floor(region.minX - appendPixel);
                region.minY = Math.floor(region.minY - appendPixel);
                region.maxX = Math.ceil(region.maxX + appendPixel);
                region.maxY = Math.ceil(region.maxY + appendPixel);
            }
        }
        return region;
    };
    /**
     * 刷新图形元素，这里仅仅是放入队列，下次绘制时进行绘制
     * @param {IElement} element 图形元素
     */
    Canvas.prototype.refreshElement = function (element) {
        var refreshElements = this.get('refreshElements');
        refreshElements.push(element);
        // if (this.get('autoDraw')) {
        //   this._startDraw();
        // }
    };
    // 清理还在进行的绘制
    Canvas.prototype._clearFrame = function () {
        var drawFrame = this.get('drawFrame');
        if (drawFrame) {
            // 如果全部渲染时，存在局部渲染，则抛弃掉局部渲染
            util_1.clearAnimationFrame(drawFrame);
            this.set('drawFrame', null);
            this.set('refreshElements', []);
        }
    };
    // 手工调用绘制接口
    Canvas.prototype.draw = function () {
        var drawFrame = this.get('drawFrame');
        if (this.get('autoDraw') && drawFrame) {
            return;
        }
        this._startDraw();
    };
    // 绘制所有图形
    Canvas.prototype._drawAll = function () {
        var context = this.get('context');
        var element = this.get('el');
        var children = this.getChildren();
        context.clearRect(0, 0, element.width, element.height);
        draw_1.applyAttrsToContext(context, this);
        draw_1.drawChildren(context, children);
        // 对于 https://github.com/antvis/g/issues/422 的场景，全局渲染的模式下也会记录更新的元素队列，因此全局渲染完后也需要置空
        this.set('refreshElements', []);
    };
    // 绘制局部
    Canvas.prototype._drawRegion = function () {
        var context = this.get('context');
        var children = this.getChildren();
        var region = this._getRefreshRegion();
        // 需要注意可能没有 region 的场景
        // 一般发生在设置了 localRefresh ,在没有图形发生变化的情况下，用户调用了 draw
        if (region) {
            // 清理指定区域
            context.clearRect(region.minX, region.minY, region.maxX - region.minX, region.maxY - region.minY);
            // 保存上下文，设置 clip
            context.save();
            context.beginPath();
            context.rect(region.minX, region.minY, region.maxX - region.minX, region.maxY - region.minY);
            context.clip();
            draw_1.applyAttrsToContext(context, this);
            // 绘制子元素
            draw_1.drawChildren(context, children, region);
            context.restore();
        }
        this.set('refreshElements', []);
    };
    // 触发绘制
    Canvas.prototype._startDraw = function () {
        var _this = this;
        var drawFrame = this.get('drawFrame');
        if (!drawFrame) {
            drawFrame = util_1.requestAnimationFrame(function () {
                if (_this.get('localRefresh')) {
                    _this._drawRegion();
                }
                else {
                    _this._drawAll();
                }
                _this.set('drawFrame', null);
            });
            this.set('drawFrame', drawFrame);
        }
    };
    Canvas.prototype.skipDraw = function () {};
    Canvas.prototype.destroy = function () {
        var eventController = this.get('eventController');
        eventController.destroy();
        _super.prototype.destroy.call(this);
    };
    return Canvas;
}(g_base_1.AbstractCanvas));
exports.default = Canvas;
//# sourceMappingURL=canvas.js.map