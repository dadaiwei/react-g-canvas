"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("../util");
function isPointInPath(shape, x, y) {
    var ctx = util_1.getOffScreenContext();
    shape.createPath(ctx);
    return ctx.isPointInPath(x, y);
}
exports.default = isPointInPath;
//# sourceMappingURL=point-in-path.js.map