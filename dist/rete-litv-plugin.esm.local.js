/*!
* rete-vue-plugin v2.0.3
* (c) 2023 Vitaliy Stoliarov
* Released under the MIT license.
* */
import _typeof from "https://esm.sh/@babel/runtime/helpers/typeof";
import _classCallCheck from "https://esm.sh/@babel/runtime/helpers/classCallCheck";
import _createClass from "https://esm.sh/@babel/runtime/helpers/createClass";
import _assertThisInitialized from "https://esm.sh/@babel/runtime/helpers/assertThisInitialized";
import _get from "https://esm.sh/@babel/runtime/helpers/get";
import _inherits from "https://esm.sh/@babel/runtime/helpers/inherits";
import _possibleConstructorReturn from "https://esm.sh/@babel/runtime/helpers/possibleConstructorReturn";
import _getPrototypeOf from "https://esm.sh/@babel/runtime/helpers/getPrototypeOf";
import _defineProperty from "https://esm.sh/@babel/runtime/helpers/defineProperty";
import { ClassicPreset, Scope } from "https://esm.sh/rete";
import _asyncToGenerator from "https://esm.sh/@babel/runtime/helpers/asyncToGenerator";
import _regeneratorRuntime from "https://esm.sh/@babel/runtime/regenerator";
import {
    getDOMSocketPosition,
    loopConnectionPath,
    classicConnectionPath,
} from "https://esm.sh/rete-render-utils";
import _taggedTemplateLiteral from "https://esm.sh/@babel/runtime/helpers/taggedTemplateLiteral";
import _toArray from "https://esm.sh/@babel/runtime/helpers/toArray";
import { LitElement, css, html } from "https://esm.sh/lit@2.8.0";
import { styleMap } from "https://esm.sh/lit@2.8.0/directives/style-map";
import {
    customElement,
    property,
    query,
} from "https://esm.sh/lit@2.8.0/decorators";
import _slicedToArray from "https://esm.sh/@babel/runtime/helpers/slicedToArray";
import { BaseAreaPlugin } from "https://esm.sh/rete-area-plugin";

function ownKeys$5(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread$5(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$5(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$5(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function setProps(element, payload) {
  for (var _i = 0, _Object$keys = Object.keys(payload); _i < _Object$keys.length; _i++) {
    var key = _Object$keys[_i];
    if (key === 'style') continue;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    element[key] = payload[key];
  }
}
function create(element, component, payload, onRendered) {
  var state = payload;
  var app = new component();
  app.addEventListener('updated', function () {
    onRendered();
  });
  setProps(app, payload);
  element.appendChild(app);
  onRendered();
  return {
    app: app,
    payload: state
  };
}
function _update(instance, payload) {
  instance.payload = _objectSpread$5(_objectSpread$5({}, instance.payload), payload);
  setProps(instance.app, instance.payload);
  instance.app.requestUpdate();
}
function destroy(instance) {
  instance.app.remove();
}
function getRenderer() {
  var instances = new Map();
  return {
    get: function get(element) {
      return instances.get(element);
    },
    mount: function mount(element, litComponent, payload, onRendered) {
      var app = create(element, litComponent, payload, onRendered);
      instances.set(element, app);
      return app;
    },
    update: function update(app, payload) {
      _update(app, payload);
    },
    unmount: function unmount(element) {
      var app = instances.get(element);
      if (app) {
        destroy(app);
        instances["delete"](element);
      }
    }
  };
}

var _templateObject$f, _templateObject2$d;
function _createSuper$e(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$e(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _isNativeReflectConstruct$e() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _decorate$d(decorators, factory, superClass, mixins) { var api = _getDecoratorsApi$d(); if (mixins) { for (var i = 0; i < mixins.length; i++) { api = mixins[i](api); } } var r = factory(function initialize(O) { api.initializeInstanceElements(O, decorated.elements); }, superClass); var decorated = api.decorateClass(_coalesceClassElements$d(r.d.map(_createElementDescriptor$d)), decorators); api.initializeClassElements(r.F, decorated.elements); return api.runClassFinishers(r.F, decorated.finishers); }
function _getDecoratorsApi$d() { _getDecoratorsApi$d = function _getDecoratorsApi() { return api; }; var api = { elementsDefinitionOrder: [["method"], ["field"]], initializeInstanceElements: function initializeInstanceElements(O, elements) { ["method", "field"].forEach(function (kind) { elements.forEach(function (element) { if (element.kind === kind && element.placement === "own") { this.defineClassElement(O, element); } }, this); }, this); }, initializeClassElements: function initializeClassElements(F, elements) { var proto = F.prototype; ["method", "field"].forEach(function (kind) { elements.forEach(function (element) { var placement = element.placement; if (element.kind === kind && (placement === "static" || placement === "prototype")) { var receiver = placement === "static" ? F : proto; this.defineClassElement(receiver, element); } }, this); }, this); }, defineClassElement: function defineClassElement(receiver, element) { var descriptor = element.descriptor; if (element.kind === "field") { var initializer = element.initializer; descriptor = { enumerable: descriptor.enumerable, writable: descriptor.writable, configurable: descriptor.configurable, value: initializer === void 0 ? void 0 : initializer.call(receiver) }; } Object.defineProperty(receiver, element.key, descriptor); }, decorateClass: function decorateClass(elements, decorators) { var newElements = []; var finishers = []; var placements = { "static": [], prototype: [], own: [] }; elements.forEach(function (element) { this.addElementPlacement(element, placements); }, this); elements.forEach(function (element) { if (!_hasDecorators$d(element)) return newElements.push(element); var elementFinishersExtras = this.decorateElement(element, placements); newElements.push(elementFinishersExtras.element); newElements.push.apply(newElements, elementFinishersExtras.extras); finishers.push.apply(finishers, elementFinishersExtras.finishers); }, this); if (!decorators) { return { elements: newElements, finishers: finishers }; } var result = this.decorateConstructor(newElements, decorators); finishers.push.apply(finishers, result.finishers); result.finishers = finishers; return result; }, addElementPlacement: function addElementPlacement(element, placements, silent) { var keys = placements[element.placement]; if (!silent && keys.indexOf(element.key) !== -1) { throw new TypeError("Duplicated element (" + element.key + ")"); } keys.push(element.key); }, decorateElement: function decorateElement(element, placements) { var extras = []; var finishers = []; for (var decorators = element.decorators, i = decorators.length - 1; i >= 0; i--) { var keys = placements[element.placement]; keys.splice(keys.indexOf(element.key), 1); var elementObject = this.fromElementDescriptor(element); var elementFinisherExtras = this.toElementFinisherExtras((0, decorators[i])(elementObject) || elementObject); element = elementFinisherExtras.element; this.addElementPlacement(element, placements); if (elementFinisherExtras.finisher) { finishers.push(elementFinisherExtras.finisher); } var newExtras = elementFinisherExtras.extras; if (newExtras) { for (var j = 0; j < newExtras.length; j++) { this.addElementPlacement(newExtras[j], placements); } extras.push.apply(extras, newExtras); } } return { element: element, finishers: finishers, extras: extras }; }, decorateConstructor: function decorateConstructor(elements, decorators) { var finishers = []; for (var i = decorators.length - 1; i >= 0; i--) { var obj = this.fromClassDescriptor(elements); var elementsAndFinisher = this.toClassDescriptor((0, decorators[i])(obj) || obj); if (elementsAndFinisher.finisher !== undefined) { finishers.push(elementsAndFinisher.finisher); } if (elementsAndFinisher.elements !== undefined) { elements = elementsAndFinisher.elements; for (var j = 0; j < elements.length - 1; j++) { for (var k = j + 1; k < elements.length; k++) { if (elements[j].key === elements[k].key && elements[j].placement === elements[k].placement) { throw new TypeError("Duplicated element (" + elements[j].key + ")"); } } } } } return { elements: elements, finishers: finishers }; }, fromElementDescriptor: function fromElementDescriptor(element) { var obj = { kind: element.kind, key: element.key, placement: element.placement, descriptor: element.descriptor }; var desc = { value: "Descriptor", configurable: true }; Object.defineProperty(obj, Symbol.toStringTag, desc); if (element.kind === "field") obj.initializer = element.initializer; return obj; }, toElementDescriptors: function toElementDescriptors(elementObjects) { if (elementObjects === undefined) return; return _toArray(elementObjects).map(function (elementObject) { var element = this.toElementDescriptor(elementObject); this.disallowProperty(elementObject, "finisher", "An element descriptor"); this.disallowProperty(elementObject, "extras", "An element descriptor"); return element; }, this); }, toElementDescriptor: function toElementDescriptor(elementObject) { var kind = String(elementObject.kind); if (kind !== "method" && kind !== "field") { throw new TypeError('An element descriptor\'s .kind property must be either "method" or' + ' "field", but a decorator created an element descriptor with' + ' .kind "' + kind + '"'); } var key = _toPropertyKey$d(elementObject.key); var placement = String(elementObject.placement); if (placement !== "static" && placement !== "prototype" && placement !== "own") { throw new TypeError('An element descriptor\'s .placement property must be one of "static",' + ' "prototype" or "own", but a decorator created an element descriptor' + ' with .placement "' + placement + '"'); } var descriptor = elementObject.descriptor; this.disallowProperty(elementObject, "elements", "An element descriptor"); var element = { kind: kind, key: key, placement: placement, descriptor: Object.assign({}, descriptor) }; if (kind !== "field") { this.disallowProperty(elementObject, "initializer", "A method descriptor"); } else { this.disallowProperty(descriptor, "get", "The property descriptor of a field descriptor"); this.disallowProperty(descriptor, "set", "The property descriptor of a field descriptor"); this.disallowProperty(descriptor, "value", "The property descriptor of a field descriptor"); element.initializer = elementObject.initializer; } return element; }, toElementFinisherExtras: function toElementFinisherExtras(elementObject) { var element = this.toElementDescriptor(elementObject); var finisher = _optionalCallableProperty$d(elementObject, "finisher"); var extras = this.toElementDescriptors(elementObject.extras); return { element: element, finisher: finisher, extras: extras }; }, fromClassDescriptor: function fromClassDescriptor(elements) { var obj = { kind: "class", elements: elements.map(this.fromElementDescriptor, this) }; var desc = { value: "Descriptor", configurable: true }; Object.defineProperty(obj, Symbol.toStringTag, desc); return obj; }, toClassDescriptor: function toClassDescriptor(obj) { var kind = String(obj.kind); if (kind !== "class") { throw new TypeError('A class descriptor\'s .kind property must be "class", but a decorator' + ' created a class descriptor with .kind "' + kind + '"'); } this.disallowProperty(obj, "key", "A class descriptor"); this.disallowProperty(obj, "placement", "A class descriptor"); this.disallowProperty(obj, "descriptor", "A class descriptor"); this.disallowProperty(obj, "initializer", "A class descriptor"); this.disallowProperty(obj, "extras", "A class descriptor"); var finisher = _optionalCallableProperty$d(obj, "finisher"); var elements = this.toElementDescriptors(obj.elements); return { elements: elements, finisher: finisher }; }, runClassFinishers: function runClassFinishers(constructor, finishers) { for (var i = 0; i < finishers.length; i++) { var newConstructor = (0, finishers[i])(constructor); if (newConstructor !== undefined) { if (typeof newConstructor !== "function") { throw new TypeError("Finishers must return a constructor."); } constructor = newConstructor; } } return constructor; }, disallowProperty: function disallowProperty(obj, name, objectType) { if (obj[name] !== undefined) { throw new TypeError(objectType + " can't have a ." + name + " property."); } } }; return api; }
function _createElementDescriptor$d(def) { var key = _toPropertyKey$d(def.key); var descriptor; if (def.kind === "method") { descriptor = { value: def.value, writable: true, configurable: true, enumerable: false }; } else if (def.kind === "get") { descriptor = { get: def.value, configurable: true, enumerable: false }; } else if (def.kind === "set") { descriptor = { set: def.value, configurable: true, enumerable: false }; } else if (def.kind === "field") { descriptor = { configurable: true, writable: true, enumerable: true }; } var element = { kind: def.kind === "field" ? "field" : "method", key: key, placement: def["static"] ? "static" : def.kind === "field" ? "own" : "prototype", descriptor: descriptor }; if (def.decorators) element.decorators = def.decorators; if (def.kind === "field") element.initializer = def.value; return element; }
function _coalesceGetterSetter$d(element, other) { if (element.descriptor.get !== undefined) { other.descriptor.get = element.descriptor.get; } else { other.descriptor.set = element.descriptor.set; } }
function _coalesceClassElements$d(elements) { var newElements = []; var isSameElement = function isSameElement(other) { return other.kind === "method" && other.key === element.key && other.placement === element.placement; }; for (var i = 0; i < elements.length; i++) { var element = elements[i]; var other; if (element.kind === "method" && (other = newElements.find(isSameElement))) { if (_isDataDescriptor$d(element.descriptor) || _isDataDescriptor$d(other.descriptor)) { if (_hasDecorators$d(element) || _hasDecorators$d(other)) { throw new ReferenceError("Duplicated methods (" + element.key + ") can't be decorated."); } other.descriptor = element.descriptor; } else { if (_hasDecorators$d(element)) { if (_hasDecorators$d(other)) { throw new ReferenceError("Decorators can't be placed on different accessors with for " + "the same property (" + element.key + ")."); } other.decorators = element.decorators; } _coalesceGetterSetter$d(element, other); } } else { newElements.push(element); } } return newElements; }
function _hasDecorators$d(element) { return element.decorators && element.decorators.length; }
function _isDataDescriptor$d(desc) { return desc !== undefined && !(desc.value === undefined && desc.writable === undefined); }
function _optionalCallableProperty$d(obj, name) { var value = obj[name]; if (value !== undefined && typeof value !== "function") { throw new TypeError("Expected '" + name + "' to be a function"); } return value; }
function _toPropertyKey$d(arg) { var key = _toPrimitive$d(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive$d(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var Connection = _decorate$d([customElement('connection-component')], function (_initialize, _LitElement) {
  var Connection = /*#__PURE__*/function (_LitElement2) {
    _inherits(Connection, _LitElement2);
    var _super = _createSuper$e(Connection);
    function Connection() {
      var _this;
      _classCallCheck(this, Connection);
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _super.call.apply(_super, [this].concat(args));
      _initialize(_assertThisInitialized(_this));
      return _this;
    }
    return _createClass(Connection);
  }(_LitElement);
  return {
    F: Connection,
    d: [{
      kind: "field",
      decorators: [property({
        type: Object
      })],
      key: "data",
      value: function value() {
        return {};
      }
    }, {
      kind: "field",
      decorators: [property({
        type: Object
      })],
      key: "start",
      value: function value() {
        return {};
      }
    }, {
      kind: "field",
      decorators: [property({
        type: Object
      })],
      key: "end",
      value: function value() {
        return {};
      }
    }, {
      kind: "field",
      decorators: [property({
        type: String
      })],
      key: "path",
      value: function value() {
        return '';
      }
    }, {
      kind: "field",
      "static": true,
      key: "styles",
      value: function value() {
        return css(_templateObject$f || (_templateObject$f = _taggedTemplateLiteral(["\n    svg {\n      overflow: visible !important;\n      position: absolute;\n      pointer-events: none;\n      width: 9999px;\n      height: 9999px;\n    }\n    path {\n      fill: none;\n      stroke-width: 5px;\n      stroke: steelblue;\n      pointer-events: auto;\n    }\n  "])));
      }
    }, {
      kind: "method",
      key: "render",
      value: function render() {
        return html(_templateObject2$d || (_templateObject2$d = _taggedTemplateLiteral(["\n      <svg data-testid=\"connection\">\n        <path d=", "></path>\n      </svg>\n    "])), this.path);
      }
    }]
  };
}, LitElement);

var _templateObject$e, _templateObject2$c;
function _createSuper$d(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$d(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _isNativeReflectConstruct$d() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _decorate$c(decorators, factory, superClass, mixins) { var api = _getDecoratorsApi$c(); if (mixins) { for (var i = 0; i < mixins.length; i++) { api = mixins[i](api); } } var r = factory(function initialize(O) { api.initializeInstanceElements(O, decorated.elements); }, superClass); var decorated = api.decorateClass(_coalesceClassElements$c(r.d.map(_createElementDescriptor$c)), decorators); api.initializeClassElements(r.F, decorated.elements); return api.runClassFinishers(r.F, decorated.finishers); }
function _getDecoratorsApi$c() { _getDecoratorsApi$c = function _getDecoratorsApi() { return api; }; var api = { elementsDefinitionOrder: [["method"], ["field"]], initializeInstanceElements: function initializeInstanceElements(O, elements) { ["method", "field"].forEach(function (kind) { elements.forEach(function (element) { if (element.kind === kind && element.placement === "own") { this.defineClassElement(O, element); } }, this); }, this); }, initializeClassElements: function initializeClassElements(F, elements) { var proto = F.prototype; ["method", "field"].forEach(function (kind) { elements.forEach(function (element) { var placement = element.placement; if (element.kind === kind && (placement === "static" || placement === "prototype")) { var receiver = placement === "static" ? F : proto; this.defineClassElement(receiver, element); } }, this); }, this); }, defineClassElement: function defineClassElement(receiver, element) { var descriptor = element.descriptor; if (element.kind === "field") { var initializer = element.initializer; descriptor = { enumerable: descriptor.enumerable, writable: descriptor.writable, configurable: descriptor.configurable, value: initializer === void 0 ? void 0 : initializer.call(receiver) }; } Object.defineProperty(receiver, element.key, descriptor); }, decorateClass: function decorateClass(elements, decorators) { var newElements = []; var finishers = []; var placements = { "static": [], prototype: [], own: [] }; elements.forEach(function (element) { this.addElementPlacement(element, placements); }, this); elements.forEach(function (element) { if (!_hasDecorators$c(element)) return newElements.push(element); var elementFinishersExtras = this.decorateElement(element, placements); newElements.push(elementFinishersExtras.element); newElements.push.apply(newElements, elementFinishersExtras.extras); finishers.push.apply(finishers, elementFinishersExtras.finishers); }, this); if (!decorators) { return { elements: newElements, finishers: finishers }; } var result = this.decorateConstructor(newElements, decorators); finishers.push.apply(finishers, result.finishers); result.finishers = finishers; return result; }, addElementPlacement: function addElementPlacement(element, placements, silent) { var keys = placements[element.placement]; if (!silent && keys.indexOf(element.key) !== -1) { throw new TypeError("Duplicated element (" + element.key + ")"); } keys.push(element.key); }, decorateElement: function decorateElement(element, placements) { var extras = []; var finishers = []; for (var decorators = element.decorators, i = decorators.length - 1; i >= 0; i--) { var keys = placements[element.placement]; keys.splice(keys.indexOf(element.key), 1); var elementObject = this.fromElementDescriptor(element); var elementFinisherExtras = this.toElementFinisherExtras((0, decorators[i])(elementObject) || elementObject); element = elementFinisherExtras.element; this.addElementPlacement(element, placements); if (elementFinisherExtras.finisher) { finishers.push(elementFinisherExtras.finisher); } var newExtras = elementFinisherExtras.extras; if (newExtras) { for (var j = 0; j < newExtras.length; j++) { this.addElementPlacement(newExtras[j], placements); } extras.push.apply(extras, newExtras); } } return { element: element, finishers: finishers, extras: extras }; }, decorateConstructor: function decorateConstructor(elements, decorators) { var finishers = []; for (var i = decorators.length - 1; i >= 0; i--) { var obj = this.fromClassDescriptor(elements); var elementsAndFinisher = this.toClassDescriptor((0, decorators[i])(obj) || obj); if (elementsAndFinisher.finisher !== undefined) { finishers.push(elementsAndFinisher.finisher); } if (elementsAndFinisher.elements !== undefined) { elements = elementsAndFinisher.elements; for (var j = 0; j < elements.length - 1; j++) { for (var k = j + 1; k < elements.length; k++) { if (elements[j].key === elements[k].key && elements[j].placement === elements[k].placement) { throw new TypeError("Duplicated element (" + elements[j].key + ")"); } } } } } return { elements: elements, finishers: finishers }; }, fromElementDescriptor: function fromElementDescriptor(element) { var obj = { kind: element.kind, key: element.key, placement: element.placement, descriptor: element.descriptor }; var desc = { value: "Descriptor", configurable: true }; Object.defineProperty(obj, Symbol.toStringTag, desc); if (element.kind === "field") obj.initializer = element.initializer; return obj; }, toElementDescriptors: function toElementDescriptors(elementObjects) { if (elementObjects === undefined) return; return _toArray(elementObjects).map(function (elementObject) { var element = this.toElementDescriptor(elementObject); this.disallowProperty(elementObject, "finisher", "An element descriptor"); this.disallowProperty(elementObject, "extras", "An element descriptor"); return element; }, this); }, toElementDescriptor: function toElementDescriptor(elementObject) { var kind = String(elementObject.kind); if (kind !== "method" && kind !== "field") { throw new TypeError('An element descriptor\'s .kind property must be either "method" or' + ' "field", but a decorator created an element descriptor with' + ' .kind "' + kind + '"'); } var key = _toPropertyKey$c(elementObject.key); var placement = String(elementObject.placement); if (placement !== "static" && placement !== "prototype" && placement !== "own") { throw new TypeError('An element descriptor\'s .placement property must be one of "static",' + ' "prototype" or "own", but a decorator created an element descriptor' + ' with .placement "' + placement + '"'); } var descriptor = elementObject.descriptor; this.disallowProperty(elementObject, "elements", "An element descriptor"); var element = { kind: kind, key: key, placement: placement, descriptor: Object.assign({}, descriptor) }; if (kind !== "field") { this.disallowProperty(elementObject, "initializer", "A method descriptor"); } else { this.disallowProperty(descriptor, "get", "The property descriptor of a field descriptor"); this.disallowProperty(descriptor, "set", "The property descriptor of a field descriptor"); this.disallowProperty(descriptor, "value", "The property descriptor of a field descriptor"); element.initializer = elementObject.initializer; } return element; }, toElementFinisherExtras: function toElementFinisherExtras(elementObject) { var element = this.toElementDescriptor(elementObject); var finisher = _optionalCallableProperty$c(elementObject, "finisher"); var extras = this.toElementDescriptors(elementObject.extras); return { element: element, finisher: finisher, extras: extras }; }, fromClassDescriptor: function fromClassDescriptor(elements) { var obj = { kind: "class", elements: elements.map(this.fromElementDescriptor, this) }; var desc = { value: "Descriptor", configurable: true }; Object.defineProperty(obj, Symbol.toStringTag, desc); return obj; }, toClassDescriptor: function toClassDescriptor(obj) { var kind = String(obj.kind); if (kind !== "class") { throw new TypeError('A class descriptor\'s .kind property must be "class", but a decorator' + ' created a class descriptor with .kind "' + kind + '"'); } this.disallowProperty(obj, "key", "A class descriptor"); this.disallowProperty(obj, "placement", "A class descriptor"); this.disallowProperty(obj, "descriptor", "A class descriptor"); this.disallowProperty(obj, "initializer", "A class descriptor"); this.disallowProperty(obj, "extras", "A class descriptor"); var finisher = _optionalCallableProperty$c(obj, "finisher"); var elements = this.toElementDescriptors(obj.elements); return { elements: elements, finisher: finisher }; }, runClassFinishers: function runClassFinishers(constructor, finishers) { for (var i = 0; i < finishers.length; i++) { var newConstructor = (0, finishers[i])(constructor); if (newConstructor !== undefined) { if (typeof newConstructor !== "function") { throw new TypeError("Finishers must return a constructor."); } constructor = newConstructor; } } return constructor; }, disallowProperty: function disallowProperty(obj, name, objectType) { if (obj[name] !== undefined) { throw new TypeError(objectType + " can't have a ." + name + " property."); } } }; return api; }
function _createElementDescriptor$c(def) { var key = _toPropertyKey$c(def.key); var descriptor; if (def.kind === "method") { descriptor = { value: def.value, writable: true, configurable: true, enumerable: false }; } else if (def.kind === "get") { descriptor = { get: def.value, configurable: true, enumerable: false }; } else if (def.kind === "set") { descriptor = { set: def.value, configurable: true, enumerable: false }; } else if (def.kind === "field") { descriptor = { configurable: true, writable: true, enumerable: true }; } var element = { kind: def.kind === "field" ? "field" : "method", key: key, placement: def["static"] ? "static" : def.kind === "field" ? "own" : "prototype", descriptor: descriptor }; if (def.decorators) element.decorators = def.decorators; if (def.kind === "field") element.initializer = def.value; return element; }
function _coalesceGetterSetter$c(element, other) { if (element.descriptor.get !== undefined) { other.descriptor.get = element.descriptor.get; } else { other.descriptor.set = element.descriptor.set; } }
function _coalesceClassElements$c(elements) { var newElements = []; var isSameElement = function isSameElement(other) { return other.kind === "method" && other.key === element.key && other.placement === element.placement; }; for (var i = 0; i < elements.length; i++) { var element = elements[i]; var other; if (element.kind === "method" && (other = newElements.find(isSameElement))) { if (_isDataDescriptor$c(element.descriptor) || _isDataDescriptor$c(other.descriptor)) { if (_hasDecorators$c(element) || _hasDecorators$c(other)) { throw new ReferenceError("Duplicated methods (" + element.key + ") can't be decorated."); } other.descriptor = element.descriptor; } else { if (_hasDecorators$c(element)) { if (_hasDecorators$c(other)) { throw new ReferenceError("Decorators can't be placed on different accessors with for " + "the same property (" + element.key + ")."); } other.decorators = element.decorators; } _coalesceGetterSetter$c(element, other); } } else { newElements.push(element); } } return newElements; }
function _hasDecorators$c(element) { return element.decorators && element.decorators.length; }
function _isDataDescriptor$c(desc) { return desc !== undefined && !(desc.value === undefined && desc.writable === undefined); }
function _optionalCallableProperty$c(obj, name) { var value = obj[name]; if (value !== undefined && typeof value !== "function") { throw new TypeError("Expected '" + name + "' to be a function"); } return value; }
function _toPropertyKey$c(arg) { var key = _toPrimitive$c(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive$c(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var ConnectionWrapper = _decorate$c([customElement('connection-wrapper')], function (_initialize, _LitElement) {
  var ConnectionWrapper = /*#__PURE__*/function (_LitElement2) {
    _inherits(ConnectionWrapper, _LitElement2);
    var _super = _createSuper$d(ConnectionWrapper);
    function ConnectionWrapper() {
      var _this;
      _classCallCheck(this, ConnectionWrapper);
      _this = _super.call(this);
      _initialize(_assertThisInitialized(_this));
      return _this;
    }
    return _createClass(ConnectionWrapper);
  }(_LitElement);
  return {
    F: ConnectionWrapper,
    d: [{
      kind: "field",
      decorators: [property({
        type: Object
      })],
      key: "component",
      value: void 0
    }, {
      kind: "field",
      decorators: [property({
        type: Object
      })],
      key: "data",
      value: void 0
    }, {
      kind: "field",
      decorators: [property({
        type: Object
      })],
      key: "start",
      value: void 0
    }, {
      kind: "field",
      decorators: [property({
        type: Object
      })],
      key: "end",
      value: void 0
    }, {
      kind: "field",
      decorators: [property({
        type: Function
      })],
      key: "path",
      value: function value() {
        return function () {
          throw new Error('PATH FUNCTION NOT SET PROPERLY');
        };
      }
    }, {
      kind: "field",
      key: "observedStart",
      value: function value() {
        return {
          x: 0,
          y: 0
        };
      }
    }, {
      kind: "field",
      key: "observedEnd",
      value: function value() {
        return {
          x: 0,
          y: 0
        };
      }
    }, {
      kind: "field",
      key: "observedPath",
      value: function value() {
        return '';
      }
    }, {
      kind: "field",
      key: "onDestroy",
      value: function value() {
        return null;
      }
    }, {
      kind: "method",
      key: "connectedCallback",
      value: function connectedCallback() {
        _get(_getPrototypeOf(ConnectionWrapper.prototype), "connectedCallback", this).call(this);
        this.initializeWatchers();
        this.fetchPath();
      }
    }, {
      kind: "method",
      key: "disconnectedCallback",
      value: function disconnectedCallback() {
        if (this.onDestroy) this.onDestroy();
        _get(_getPrototypeOf(ConnectionWrapper.prototype), "disconnectedCallback", this).call(this);
      }
    }, {
      kind: "method",
      key: "initializeWatchers",
      value: function initializeWatchers() {
        var _this2 = this;
        var unwatch1 = typeof this.start === 'function' && this.start(function (pos) {
          _this2.observedStart = pos;
          _this2.fetchPath(); // Fetch the new path when start changes
        });

        var unwatch2 = typeof this.end === 'function' && this.end(function (pos) {
          _this2.observedEnd = pos;
          _this2.fetchPath(); // Fetch the new path when end changes
        });

        this.onDestroy = function () {
          unwatch1 && unwatch1();
          unwatch2 && unwatch2();
        };
      }
    }, {
      kind: "method",
      key: "fetchPath",
      value: function () {
        var _fetchPath = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
          return _regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
              case 0:
                if (!(this.startPosition && this.endPosition)) {
                  _context.next = 5;
                  break;
                }
                _context.next = 3;
                return this.path(this.startPosition, this.endPosition);
              case 3:
                this.observedPath = _context.sent;
                this.requestUpdate(); // Request re-render
              case 5:
              case "end":
                return _context.stop();
            }
          }, _callee, this);
        }));
        function fetchPath() {
          return _fetchPath.apply(this, arguments);
        }
        return fetchPath;
      }()
    }, {
      kind: "get",
      key: "startPosition",
      value: function startPosition() {
        return this.start && 'x' in this.start ? this.start : this.observedStart;
      }
    }, {
      kind: "get",
      key: "endPosition",
      value: function endPosition() {
        return this.end && 'x' in this.end ? this.end : this.observedEnd;
      }
    }, {
      kind: "method",
      key: "render",
      value: function render() {
        if (this.component) {
          var dynamicComponent = new this.component();
          dynamicComponent.data = this.data;
          dynamicComponent.start = this.startPosition;
          dynamicComponent.end = this.endPosition;
          dynamicComponent.path = this.observedPath;
          return html(_templateObject$e || (_templateObject$e = _taggedTemplateLiteral(["", ""])), dynamicComponent);
        }
        return html(_templateObject2$c || (_templateObject2$c = _taggedTemplateLiteral([""])));
      }
    }]
  };
}, LitElement);

var _templateObject$d;
var vars$1 = css(_templateObject$d || (_templateObject$d = _taggedTemplateLiteral([":host {\n    --node-color: rgba(110, 136, 255, 0.8);\n    --node-color-selected: #ffd92c;\n    --group-color: rgba(15, 80, 255, 0.2);\n    --group-handler-size: 40px;\n    --group-handler-offset: -10px;\n    --socket-size: 24px;\n    --socket-margin: 6px;\n    --socket-color: #96b38a;\n    --node-width: 180px;\n}"])));

var _templateObject$c, _templateObject2$b;
function _createSuper$c(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$c(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _isNativeReflectConstruct$c() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _decorate$b(decorators, factory, superClass, mixins) { var api = _getDecoratorsApi$b(); if (mixins) { for (var i = 0; i < mixins.length; i++) { api = mixins[i](api); } } var r = factory(function initialize(O) { api.initializeInstanceElements(O, decorated.elements); }, superClass); var decorated = api.decorateClass(_coalesceClassElements$b(r.d.map(_createElementDescriptor$b)), decorators); api.initializeClassElements(r.F, decorated.elements); return api.runClassFinishers(r.F, decorated.finishers); }
function _getDecoratorsApi$b() { _getDecoratorsApi$b = function _getDecoratorsApi() { return api; }; var api = { elementsDefinitionOrder: [["method"], ["field"]], initializeInstanceElements: function initializeInstanceElements(O, elements) { ["method", "field"].forEach(function (kind) { elements.forEach(function (element) { if (element.kind === kind && element.placement === "own") { this.defineClassElement(O, element); } }, this); }, this); }, initializeClassElements: function initializeClassElements(F, elements) { var proto = F.prototype; ["method", "field"].forEach(function (kind) { elements.forEach(function (element) { var placement = element.placement; if (element.kind === kind && (placement === "static" || placement === "prototype")) { var receiver = placement === "static" ? F : proto; this.defineClassElement(receiver, element); } }, this); }, this); }, defineClassElement: function defineClassElement(receiver, element) { var descriptor = element.descriptor; if (element.kind === "field") { var initializer = element.initializer; descriptor = { enumerable: descriptor.enumerable, writable: descriptor.writable, configurable: descriptor.configurable, value: initializer === void 0 ? void 0 : initializer.call(receiver) }; } Object.defineProperty(receiver, element.key, descriptor); }, decorateClass: function decorateClass(elements, decorators) { var newElements = []; var finishers = []; var placements = { "static": [], prototype: [], own: [] }; elements.forEach(function (element) { this.addElementPlacement(element, placements); }, this); elements.forEach(function (element) { if (!_hasDecorators$b(element)) return newElements.push(element); var elementFinishersExtras = this.decorateElement(element, placements); newElements.push(elementFinishersExtras.element); newElements.push.apply(newElements, elementFinishersExtras.extras); finishers.push.apply(finishers, elementFinishersExtras.finishers); }, this); if (!decorators) { return { elements: newElements, finishers: finishers }; } var result = this.decorateConstructor(newElements, decorators); finishers.push.apply(finishers, result.finishers); result.finishers = finishers; return result; }, addElementPlacement: function addElementPlacement(element, placements, silent) { var keys = placements[element.placement]; if (!silent && keys.indexOf(element.key) !== -1) { throw new TypeError("Duplicated element (" + element.key + ")"); } keys.push(element.key); }, decorateElement: function decorateElement(element, placements) { var extras = []; var finishers = []; for (var decorators = element.decorators, i = decorators.length - 1; i >= 0; i--) { var keys = placements[element.placement]; keys.splice(keys.indexOf(element.key), 1); var elementObject = this.fromElementDescriptor(element); var elementFinisherExtras = this.toElementFinisherExtras((0, decorators[i])(elementObject) || elementObject); element = elementFinisherExtras.element; this.addElementPlacement(element, placements); if (elementFinisherExtras.finisher) { finishers.push(elementFinisherExtras.finisher); } var newExtras = elementFinisherExtras.extras; if (newExtras) { for (var j = 0; j < newExtras.length; j++) { this.addElementPlacement(newExtras[j], placements); } extras.push.apply(extras, newExtras); } } return { element: element, finishers: finishers, extras: extras }; }, decorateConstructor: function decorateConstructor(elements, decorators) { var finishers = []; for (var i = decorators.length - 1; i >= 0; i--) { var obj = this.fromClassDescriptor(elements); var elementsAndFinisher = this.toClassDescriptor((0, decorators[i])(obj) || obj); if (elementsAndFinisher.finisher !== undefined) { finishers.push(elementsAndFinisher.finisher); } if (elementsAndFinisher.elements !== undefined) { elements = elementsAndFinisher.elements; for (var j = 0; j < elements.length - 1; j++) { for (var k = j + 1; k < elements.length; k++) { if (elements[j].key === elements[k].key && elements[j].placement === elements[k].placement) { throw new TypeError("Duplicated element (" + elements[j].key + ")"); } } } } } return { elements: elements, finishers: finishers }; }, fromElementDescriptor: function fromElementDescriptor(element) { var obj = { kind: element.kind, key: element.key, placement: element.placement, descriptor: element.descriptor }; var desc = { value: "Descriptor", configurable: true }; Object.defineProperty(obj, Symbol.toStringTag, desc); if (element.kind === "field") obj.initializer = element.initializer; return obj; }, toElementDescriptors: function toElementDescriptors(elementObjects) { if (elementObjects === undefined) return; return _toArray(elementObjects).map(function (elementObject) { var element = this.toElementDescriptor(elementObject); this.disallowProperty(elementObject, "finisher", "An element descriptor"); this.disallowProperty(elementObject, "extras", "An element descriptor"); return element; }, this); }, toElementDescriptor: function toElementDescriptor(elementObject) { var kind = String(elementObject.kind); if (kind !== "method" && kind !== "field") { throw new TypeError('An element descriptor\'s .kind property must be either "method" or' + ' "field", but a decorator created an element descriptor with' + ' .kind "' + kind + '"'); } var key = _toPropertyKey$b(elementObject.key); var placement = String(elementObject.placement); if (placement !== "static" && placement !== "prototype" && placement !== "own") { throw new TypeError('An element descriptor\'s .placement property must be one of "static",' + ' "prototype" or "own", but a decorator created an element descriptor' + ' with .placement "' + placement + '"'); } var descriptor = elementObject.descriptor; this.disallowProperty(elementObject, "elements", "An element descriptor"); var element = { kind: kind, key: key, placement: placement, descriptor: Object.assign({}, descriptor) }; if (kind !== "field") { this.disallowProperty(elementObject, "initializer", "A method descriptor"); } else { this.disallowProperty(descriptor, "get", "The property descriptor of a field descriptor"); this.disallowProperty(descriptor, "set", "The property descriptor of a field descriptor"); this.disallowProperty(descriptor, "value", "The property descriptor of a field descriptor"); element.initializer = elementObject.initializer; } return element; }, toElementFinisherExtras: function toElementFinisherExtras(elementObject) { var element = this.toElementDescriptor(elementObject); var finisher = _optionalCallableProperty$b(elementObject, "finisher"); var extras = this.toElementDescriptors(elementObject.extras); return { element: element, finisher: finisher, extras: extras }; }, fromClassDescriptor: function fromClassDescriptor(elements) { var obj = { kind: "class", elements: elements.map(this.fromElementDescriptor, this) }; var desc = { value: "Descriptor", configurable: true }; Object.defineProperty(obj, Symbol.toStringTag, desc); return obj; }, toClassDescriptor: function toClassDescriptor(obj) { var kind = String(obj.kind); if (kind !== "class") { throw new TypeError('A class descriptor\'s .kind property must be "class", but a decorator' + ' created a class descriptor with .kind "' + kind + '"'); } this.disallowProperty(obj, "key", "A class descriptor"); this.disallowProperty(obj, "placement", "A class descriptor"); this.disallowProperty(obj, "descriptor", "A class descriptor"); this.disallowProperty(obj, "initializer", "A class descriptor"); this.disallowProperty(obj, "extras", "A class descriptor"); var finisher = _optionalCallableProperty$b(obj, "finisher"); var elements = this.toElementDescriptors(obj.elements); return { elements: elements, finisher: finisher }; }, runClassFinishers: function runClassFinishers(constructor, finishers) { for (var i = 0; i < finishers.length; i++) { var newConstructor = (0, finishers[i])(constructor); if (newConstructor !== undefined) { if (typeof newConstructor !== "function") { throw new TypeError("Finishers must return a constructor."); } constructor = newConstructor; } } return constructor; }, disallowProperty: function disallowProperty(obj, name, objectType) { if (obj[name] !== undefined) { throw new TypeError(objectType + " can't have a ." + name + " property."); } } }; return api; }
function _createElementDescriptor$b(def) { var key = _toPropertyKey$b(def.key); var descriptor; if (def.kind === "method") { descriptor = { value: def.value, writable: true, configurable: true, enumerable: false }; } else if (def.kind === "get") { descriptor = { get: def.value, configurable: true, enumerable: false }; } else if (def.kind === "set") { descriptor = { set: def.value, configurable: true, enumerable: false }; } else if (def.kind === "field") { descriptor = { configurable: true, writable: true, enumerable: true }; } var element = { kind: def.kind === "field" ? "field" : "method", key: key, placement: def["static"] ? "static" : def.kind === "field" ? "own" : "prototype", descriptor: descriptor }; if (def.decorators) element.decorators = def.decorators; if (def.kind === "field") element.initializer = def.value; return element; }
function _coalesceGetterSetter$b(element, other) { if (element.descriptor.get !== undefined) { other.descriptor.get = element.descriptor.get; } else { other.descriptor.set = element.descriptor.set; } }
function _coalesceClassElements$b(elements) { var newElements = []; var isSameElement = function isSameElement(other) { return other.kind === "method" && other.key === element.key && other.placement === element.placement; }; for (var i = 0; i < elements.length; i++) { var element = elements[i]; var other; if (element.kind === "method" && (other = newElements.find(isSameElement))) { if (_isDataDescriptor$b(element.descriptor) || _isDataDescriptor$b(other.descriptor)) { if (_hasDecorators$b(element) || _hasDecorators$b(other)) { throw new ReferenceError("Duplicated methods (" + element.key + ") can't be decorated."); } other.descriptor = element.descriptor; } else { if (_hasDecorators$b(element)) { if (_hasDecorators$b(other)) { throw new ReferenceError("Decorators can't be placed on different accessors with for " + "the same property (" + element.key + ")."); } other.decorators = element.decorators; } _coalesceGetterSetter$b(element, other); } } else { newElements.push(element); } } return newElements; }
function _hasDecorators$b(element) { return element.decorators && element.decorators.length; }
function _isDataDescriptor$b(desc) { return desc !== undefined && !(desc.value === undefined && desc.writable === undefined); }
function _optionalCallableProperty$b(obj, name) { var value = obj[name]; if (value !== undefined && typeof value !== "function") { throw new TypeError("Expected '" + name + "' to be a function"); } return value; }
function _toPropertyKey$b(arg) { var key = _toPrimitive$b(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive$b(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var Control = _decorate$b(null, function (_initialize, _LitElement) {
  var Control = /*#__PURE__*/function (_LitElement2) {
    _inherits(Control, _LitElement2);
    var _super = _createSuper$c(Control);
    function Control() {
      var _this;
      _classCallCheck(this, Control);
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _super.call.apply(_super, [this].concat(args));
      _initialize(_assertThisInitialized(_this));
      return _this;
    }
    return _createClass(Control);
  }(_LitElement);
  return {
    F: Control,
    d: [{
      kind: "field",
      decorators: [property({
        type: ClassicPreset.InputControl
      })],
      key: "data",
      value: void 0
    }, {
      kind: "field",
      "static": true,
      key: "styles",
      value: function value() {
        return [vars$1, css(_templateObject$c || (_templateObject$c = _taggedTemplateLiteral(["\n    input {\n      width: 100%;\n      border-radius: 30px;\n      background-color: white;\n      padding: 2px 6px;\n      border: 1px solid #999;\n      font-size: 110%;\n      box-sizing: border-box;\n    }\n  "])))];
      }
    }, {
      kind: "method",
      key: "render",
      value: function render() {
        var _this$data, _this$data2, _this$data3;
        return html(_templateObject2$b || (_templateObject2$b = _taggedTemplateLiteral(["\n      <input\n        type=\"", "\"\n        .value=\"", "\"\n        ?readonly=\"", "\"\n        @input=\"", "\"\n        @pointerdown=\"", "\"\n      />\n    "])), (_this$data = this.data) === null || _this$data === void 0 ? void 0 : _this$data.type, (_this$data2 = this.data) === null || _this$data2 === void 0 ? void 0 : _this$data2.value, (_this$data3 = this.data) === null || _this$data3 === void 0 ? void 0 : _this$data3.readonly, this.change, this.stopEvent);
      }
    }, {
      kind: "method",
      key: "change",
      value: function change(e) {
        var _this$data4, _e$target, _e$target2, _this$data5;
        var val = ((_this$data4 = this.data) === null || _this$data4 === void 0 ? void 0 : _this$data4.type) === 'number' ? +((_e$target = e.target) === null || _e$target === void 0 ? void 0 : _e$target.value) : (_e$target2 = e.target) === null || _e$target2 === void 0 ? void 0 : _e$target2.value;

        // @ts-ignore
        (_this$data5 = this.data) === null || _this$data5 === void 0 ? void 0 : _this$data5.setValue(val);
      }
    }, {
      kind: "method",
      key: "stopEvent",
      value: function stopEvent(e) {
        e.stopPropagation();
      }
    }]
  };
}, LitElement);
customElements.define('control-component', Control);

var _templateObject$b, _templateObject2$a, _templateObject3$4, _templateObject4$2, _templateObject5;
function _createSuper$b(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$b(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _isNativeReflectConstruct$b() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _decorate$a(decorators, factory, superClass, mixins) { var api = _getDecoratorsApi$a(); if (mixins) { for (var i = 0; i < mixins.length; i++) { api = mixins[i](api); } } var r = factory(function initialize(O) { api.initializeInstanceElements(O, decorated.elements); }, superClass); var decorated = api.decorateClass(_coalesceClassElements$a(r.d.map(_createElementDescriptor$a)), decorators); api.initializeClassElements(r.F, decorated.elements); return api.runClassFinishers(r.F, decorated.finishers); }
function _getDecoratorsApi$a() { _getDecoratorsApi$a = function _getDecoratorsApi() { return api; }; var api = { elementsDefinitionOrder: [["method"], ["field"]], initializeInstanceElements: function initializeInstanceElements(O, elements) { ["method", "field"].forEach(function (kind) { elements.forEach(function (element) { if (element.kind === kind && element.placement === "own") { this.defineClassElement(O, element); } }, this); }, this); }, initializeClassElements: function initializeClassElements(F, elements) { var proto = F.prototype; ["method", "field"].forEach(function (kind) { elements.forEach(function (element) { var placement = element.placement; if (element.kind === kind && (placement === "static" || placement === "prototype")) { var receiver = placement === "static" ? F : proto; this.defineClassElement(receiver, element); } }, this); }, this); }, defineClassElement: function defineClassElement(receiver, element) { var descriptor = element.descriptor; if (element.kind === "field") { var initializer = element.initializer; descriptor = { enumerable: descriptor.enumerable, writable: descriptor.writable, configurable: descriptor.configurable, value: initializer === void 0 ? void 0 : initializer.call(receiver) }; } Object.defineProperty(receiver, element.key, descriptor); }, decorateClass: function decorateClass(elements, decorators) { var newElements = []; var finishers = []; var placements = { "static": [], prototype: [], own: [] }; elements.forEach(function (element) { this.addElementPlacement(element, placements); }, this); elements.forEach(function (element) { if (!_hasDecorators$a(element)) return newElements.push(element); var elementFinishersExtras = this.decorateElement(element, placements); newElements.push(elementFinishersExtras.element); newElements.push.apply(newElements, elementFinishersExtras.extras); finishers.push.apply(finishers, elementFinishersExtras.finishers); }, this); if (!decorators) { return { elements: newElements, finishers: finishers }; } var result = this.decorateConstructor(newElements, decorators); finishers.push.apply(finishers, result.finishers); result.finishers = finishers; return result; }, addElementPlacement: function addElementPlacement(element, placements, silent) { var keys = placements[element.placement]; if (!silent && keys.indexOf(element.key) !== -1) { throw new TypeError("Duplicated element (" + element.key + ")"); } keys.push(element.key); }, decorateElement: function decorateElement(element, placements) { var extras = []; var finishers = []; for (var decorators = element.decorators, i = decorators.length - 1; i >= 0; i--) { var keys = placements[element.placement]; keys.splice(keys.indexOf(element.key), 1); var elementObject = this.fromElementDescriptor(element); var elementFinisherExtras = this.toElementFinisherExtras((0, decorators[i])(elementObject) || elementObject); element = elementFinisherExtras.element; this.addElementPlacement(element, placements); if (elementFinisherExtras.finisher) { finishers.push(elementFinisherExtras.finisher); } var newExtras = elementFinisherExtras.extras; if (newExtras) { for (var j = 0; j < newExtras.length; j++) { this.addElementPlacement(newExtras[j], placements); } extras.push.apply(extras, newExtras); } } return { element: element, finishers: finishers, extras: extras }; }, decorateConstructor: function decorateConstructor(elements, decorators) { var finishers = []; for (var i = decorators.length - 1; i >= 0; i--) { var obj = this.fromClassDescriptor(elements); var elementsAndFinisher = this.toClassDescriptor((0, decorators[i])(obj) || obj); if (elementsAndFinisher.finisher !== undefined) { finishers.push(elementsAndFinisher.finisher); } if (elementsAndFinisher.elements !== undefined) { elements = elementsAndFinisher.elements; for (var j = 0; j < elements.length - 1; j++) { for (var k = j + 1; k < elements.length; k++) { if (elements[j].key === elements[k].key && elements[j].placement === elements[k].placement) { throw new TypeError("Duplicated element (" + elements[j].key + ")"); } } } } } return { elements: elements, finishers: finishers }; }, fromElementDescriptor: function fromElementDescriptor(element) { var obj = { kind: element.kind, key: element.key, placement: element.placement, descriptor: element.descriptor }; var desc = { value: "Descriptor", configurable: true }; Object.defineProperty(obj, Symbol.toStringTag, desc); if (element.kind === "field") obj.initializer = element.initializer; return obj; }, toElementDescriptors: function toElementDescriptors(elementObjects) { if (elementObjects === undefined) return; return _toArray(elementObjects).map(function (elementObject) { var element = this.toElementDescriptor(elementObject); this.disallowProperty(elementObject, "finisher", "An element descriptor"); this.disallowProperty(elementObject, "extras", "An element descriptor"); return element; }, this); }, toElementDescriptor: function toElementDescriptor(elementObject) { var kind = String(elementObject.kind); if (kind !== "method" && kind !== "field") { throw new TypeError('An element descriptor\'s .kind property must be either "method" or' + ' "field", but a decorator created an element descriptor with' + ' .kind "' + kind + '"'); } var key = _toPropertyKey$a(elementObject.key); var placement = String(elementObject.placement); if (placement !== "static" && placement !== "prototype" && placement !== "own") { throw new TypeError('An element descriptor\'s .placement property must be one of "static",' + ' "prototype" or "own", but a decorator created an element descriptor' + ' with .placement "' + placement + '"'); } var descriptor = elementObject.descriptor; this.disallowProperty(elementObject, "elements", "An element descriptor"); var element = { kind: kind, key: key, placement: placement, descriptor: Object.assign({}, descriptor) }; if (kind !== "field") { this.disallowProperty(elementObject, "initializer", "A method descriptor"); } else { this.disallowProperty(descriptor, "get", "The property descriptor of a field descriptor"); this.disallowProperty(descriptor, "set", "The property descriptor of a field descriptor"); this.disallowProperty(descriptor, "value", "The property descriptor of a field descriptor"); element.initializer = elementObject.initializer; } return element; }, toElementFinisherExtras: function toElementFinisherExtras(elementObject) { var element = this.toElementDescriptor(elementObject); var finisher = _optionalCallableProperty$a(elementObject, "finisher"); var extras = this.toElementDescriptors(elementObject.extras); return { element: element, finisher: finisher, extras: extras }; }, fromClassDescriptor: function fromClassDescriptor(elements) { var obj = { kind: "class", elements: elements.map(this.fromElementDescriptor, this) }; var desc = { value: "Descriptor", configurable: true }; Object.defineProperty(obj, Symbol.toStringTag, desc); return obj; }, toClassDescriptor: function toClassDescriptor(obj) { var kind = String(obj.kind); if (kind !== "class") { throw new TypeError('A class descriptor\'s .kind property must be "class", but a decorator' + ' created a class descriptor with .kind "' + kind + '"'); } this.disallowProperty(obj, "key", "A class descriptor"); this.disallowProperty(obj, "placement", "A class descriptor"); this.disallowProperty(obj, "descriptor", "A class descriptor"); this.disallowProperty(obj, "initializer", "A class descriptor"); this.disallowProperty(obj, "extras", "A class descriptor"); var finisher = _optionalCallableProperty$a(obj, "finisher"); var elements = this.toElementDescriptors(obj.elements); return { elements: elements, finisher: finisher }; }, runClassFinishers: function runClassFinishers(constructor, finishers) { for (var i = 0; i < finishers.length; i++) { var newConstructor = (0, finishers[i])(constructor); if (newConstructor !== undefined) { if (typeof newConstructor !== "function") { throw new TypeError("Finishers must return a constructor."); } constructor = newConstructor; } } return constructor; }, disallowProperty: function disallowProperty(obj, name, objectType) { if (obj[name] !== undefined) { throw new TypeError(objectType + " can't have a ." + name + " property."); } } }; return api; }
function _createElementDescriptor$a(def) { var key = _toPropertyKey$a(def.key); var descriptor; if (def.kind === "method") { descriptor = { value: def.value, writable: true, configurable: true, enumerable: false }; } else if (def.kind === "get") { descriptor = { get: def.value, configurable: true, enumerable: false }; } else if (def.kind === "set") { descriptor = { set: def.value, configurable: true, enumerable: false }; } else if (def.kind === "field") { descriptor = { configurable: true, writable: true, enumerable: true }; } var element = { kind: def.kind === "field" ? "field" : "method", key: key, placement: def["static"] ? "static" : def.kind === "field" ? "own" : "prototype", descriptor: descriptor }; if (def.decorators) element.decorators = def.decorators; if (def.kind === "field") element.initializer = def.value; return element; }
function _coalesceGetterSetter$a(element, other) { if (element.descriptor.get !== undefined) { other.descriptor.get = element.descriptor.get; } else { other.descriptor.set = element.descriptor.set; } }
function _coalesceClassElements$a(elements) { var newElements = []; var isSameElement = function isSameElement(other) { return other.kind === "method" && other.key === element.key && other.placement === element.placement; }; for (var i = 0; i < elements.length; i++) { var element = elements[i]; var other; if (element.kind === "method" && (other = newElements.find(isSameElement))) { if (_isDataDescriptor$a(element.descriptor) || _isDataDescriptor$a(other.descriptor)) { if (_hasDecorators$a(element) || _hasDecorators$a(other)) { throw new ReferenceError("Duplicated methods (" + element.key + ") can't be decorated."); } other.descriptor = element.descriptor; } else { if (_hasDecorators$a(element)) { if (_hasDecorators$a(other)) { throw new ReferenceError("Decorators can't be placed on different accessors with for " + "the same property (" + element.key + ")."); } other.decorators = element.decorators; } _coalesceGetterSetter$a(element, other); } } else { newElements.push(element); } } return newElements; }
function _hasDecorators$a(element) { return element.decorators && element.decorators.length; }
function _isDataDescriptor$a(desc) { return desc !== undefined && !(desc.value === undefined && desc.writable === undefined); }
function _optionalCallableProperty$a(obj, name) { var value = obj[name]; if (value !== undefined && typeof value !== "function") { throw new TypeError("Expected '" + name + "' to be a function"); } return value; }
function _toPropertyKey$a(arg) { var key = _toPrimitive$a(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive$a(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function sortByIndex() {
  var entries = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  entries.sort(function (a, b) {
    var ai = a[1] && a[1].index || 0;
    var bi = b[1] && b[1].index || 0;
    return ai - bi;
  });
  return entries;
}
var Node = _decorate$a([customElement('node-component')], function (_initialize, _LitElement) {
  var Node = /*#__PURE__*/function (_LitElement2) {
    _inherits(Node, _LitElement2);
    var _super = _createSuper$b(Node);
    function Node() {
      var _this;
      _classCallCheck(this, Node);
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _super.call.apply(_super, [this].concat(args));
      _initialize(_assertThisInitialized(_this));
      return _this;
    }
    return _createClass(Node);
  }(_LitElement);
  return {
    F: Node,
    d: [{
      kind: "field",
      decorators: [property({
        type: Object
      })],
      key: "data",
      value: void 0
    }, {
      kind: "field",
      decorators: [property({
        type: Function
      })],
      key: "emit",
      value: function value() {
        return function () {
          throw new Error('emit not set properly');
        };
      }
    }, {
      kind: "field",
      decorators: [property({
        type: String
      })],
      key: "seed",
      value: function value() {
        return '';
      }
    }, {
      kind: "method",
      key: "nodeStyles",
      value: function nodeStyles() {
        var _this$data, _this$data2;
        // @ts-ignore
        return "width: ".concat(((_this$data = this.data) === null || _this$data === void 0 ? void 0 : _this$data.width) || '100px', "; height: ").concat(
        // @ts-ignore
        ((_this$data2 = this.data) === null || _this$data2 === void 0 ? void 0 : _this$data2.height) || '100px');
      }
    }, {
      kind: "method",
      key: "inputs",
      value: function inputs() {
        var _this$data3;
        // @ts-ignore
        return sortByIndex(Object.entries(((_this$data3 = this.data) === null || _this$data3 === void 0 ? void 0 : _this$data3.inputs) || {}));
      }
    }, {
      kind: "method",
      key: "controls",
      value: function controls() {
        var _this$data4;
        // @ts-ignore
        return sortByIndex(Object.entries(((_this$data4 = this.data) === null || _this$data4 === void 0 ? void 0 : _this$data4.controls) || {}));
      }
    }, {
      kind: "method",
      key: "outputs",
      value: function outputs() {
        var _this$data5;
        // @ts-ignore
        return sortByIndex(Object.entries(((_this$data5 = this.data) === null || _this$data5 === void 0 ? void 0 : _this$data5.outputs) || {}));
      }
    }, {
      kind: "field",
      "static": true,
      key: "styles",
      value: function value() {
        return [vars$1, css(_templateObject$b || (_templateObject$b = _taggedTemplateLiteral(["\n            :host {\n                display: block;\n            }\n\n            .node {\n                background: var(--node-color);\n                border: 2px solid #4e58bf;\n                border-radius: 10px;\n                cursor: pointer;\n                box-sizing: border-box;\n                width: var(--node-width);\n                height: auto;\n                padding-bottom: 6px;\n                position: relative;\n                user-select: none;\n                line-height: initial;\n                font-family: Arial;\n            }\n\n            .node:hover {\n                background: linear-gradient(\n                        rgba(255, 255, 255, 0.04),\n                        rgba(255, 255, 255, 0.04)\n                    ),\n                    var(--node-color);\n            }\n\n            .node.selected {\n                background: var(--node-color-selected);\n                border-color: #e3c000;\n            }\n\n            .node .title {\n                color: white;\n                font-family: sans-serif;\n                font-size: 18px;\n                padding: 8px;\n            }\n\n            .node .output {\n                text-align: right;\n            }\n            .node .input {\n                text-alight: left;\n            }\n\n            .node .input-socket {\n                text-align: left;\n                margin-left: calc(\n                    (var(--socket-size) / -2) - var(--socket-margin)\n                );\n                display: inline-block;\n            }\n\n            .node .output-socket {\n                text-align: right;\n                margin-right: calc(\n                    (var(--socket-size) / -2) - var(--socket-margin)\n                );\n                display: inline-block;\n            }\n\n            .node .input-title,\n            .node .output-title {\n                vertical-align: middle;\n                color: white;\n                display: inline-block;\n                font-family: sans-serif;\n                font-size: 14px;\n                margin: var(--socket-margin);\n                line-height: var(--socket-size);\n            }\n\n            .node .input-control {\n                z-index: 1;\n                width: calc(\n                    100% - var(--socket-size) - 2 * var(--socket-margin)\n                );\n                vertical-align: middle;\n                display: inline-block;\n            }\n\n            .node .input-title[hidden],\n            .node .output-title[hidden] {\n                display: none;\n            }\n\n            .node .control {\n                padding: var(--socket-margin)\n                    calc(var(--socket-size) / 2 + var(--socket-margin));\n                display: block;\n                margin: -4px;\n            }\n        "])))];
      }
    }, {
      kind: "method",
      key: "render",
      value: function render() {
        var _this$data6,
          _this$data7,
          _this2 = this;
        return html(_templateObject2$a || (_templateObject2$a = _taggedTemplateLiteral(["\n            <div\n                class=\"node ", "\"\n                style=", "\n                data-testid=\"node\"\n            >\n                <div class=\"title\" data-testid=\"title\">", "</div>\n\n                <!-- Outputs -->\n                ", "\n\n                <!-- Controls -->\n                ", "\n\n                <!-- Inputs -->\n                ", "\n            </div>\n        "])), (_this$data6 = this.data) !== null && _this$data6 !== void 0 && _this$data6.selected ? 'selected' : '', this.nodeStyles(), (_this$data7 = this.data) === null || _this$data7 === void 0 ? void 0 : _this$data7.label, this.outputs().map(function (_ref) {
          var _this2$data;
          var _ref2 = _slicedToArray(_ref, 2),
            key = _ref2[0],
            output = _ref2[1];
          return html(_templateObject3$4 || (_templateObject3$4 = _taggedTemplateLiteral(["\n                        <div class=\"output\" data-testid=\"output-", "\">\n                            <div\n                                class=\"output-title\"\n                                data-testid=\"output-title\"\n                            >\n                                ", "\n                            </div>\n                            <ref-element\n                                class=\"output-socket\"\n                                .data=", "\n                                .emit=", "\n                                data-testid=\"output-socket\"\n                            ></ref-element>\n                        </div>\n                    "])), key, output.label, {
            type: 'socket',
            side: 'output',
            key: key,
            nodeId: (_this2$data = _this2.data) === null || _this2$data === void 0 ? void 0 : _this2$data.id,
            payload: output.socket
          }, _this2.emit);
        }), this.controls().map(function (_ref3) {
          var _ref4 = _slicedToArray(_ref3, 2),
            key = _ref4[0],
            control = _ref4[1];
          return html(_templateObject4$2 || (_templateObject4$2 = _taggedTemplateLiteral(["\n                        <ref-element\n                            data-testid=\"control-", "\"\n                            class=\"control\"\n                            .emit=", "\n                            .data=", "\n                        ></ref-element>\n                    "])), key, _this2.emit, {
            type: 'control',
            payload: control
          });
        }), this.inputs().map(function (_ref5) {
          var _this2$data2;
          var _ref6 = _slicedToArray(_ref5, 2),
            key = _ref6[0],
            input = _ref6[1];
          return html(_templateObject5 || (_templateObject5 = _taggedTemplateLiteral(["\n                        <div class=\"input\" data-testid=\"input-", "\">\n                            <ref-element\n                                class=\"input-socket\"\n                                .data=", "\n                                .emit=", "\n                                data-testid=\"input-socket\"\n                            ></ref-element>\n                            <div\n                                class=\"input-title\"\n                                ?hidden=", "\n                                data-testid=\"input-title\"\n                            >\n                                ", "\n                            </div>\n                            <ref-element\n                                ?hidden=", "\n                                .emit=", "\n                                .data=", "\n                                data-testid=\"input-control\"\n                                class=\"input-control\"\n                            ></ref-element>\n                        </div>\n                    "])), key, {
            type: 'socket',
            side: 'input',
            key: key,
            nodeId: (_this2$data2 = _this2.data) === null || _this2$data2 === void 0 ? void 0 : _this2$data2.id,
            payload: input.socket
          }, _this2.emit, input.control && input.showControl, input.label, !input.control && input.showControl, _this2.emit, {
            type: 'control',
            payload: input.control
          });
        }));
      }
    }]
  };
}, LitElement);

var _templateObject$a, _templateObject2$9;
function _createSuper$a(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$a(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _isNativeReflectConstruct$a() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _decorate$9(decorators, factory, superClass, mixins) { var api = _getDecoratorsApi$9(); if (mixins) { for (var i = 0; i < mixins.length; i++) { api = mixins[i](api); } } var r = factory(function initialize(O) { api.initializeInstanceElements(O, decorated.elements); }, superClass); var decorated = api.decorateClass(_coalesceClassElements$9(r.d.map(_createElementDescriptor$9)), decorators); api.initializeClassElements(r.F, decorated.elements); return api.runClassFinishers(r.F, decorated.finishers); }
function _getDecoratorsApi$9() { _getDecoratorsApi$9 = function _getDecoratorsApi() { return api; }; var api = { elementsDefinitionOrder: [["method"], ["field"]], initializeInstanceElements: function initializeInstanceElements(O, elements) { ["method", "field"].forEach(function (kind) { elements.forEach(function (element) { if (element.kind === kind && element.placement === "own") { this.defineClassElement(O, element); } }, this); }, this); }, initializeClassElements: function initializeClassElements(F, elements) { var proto = F.prototype; ["method", "field"].forEach(function (kind) { elements.forEach(function (element) { var placement = element.placement; if (element.kind === kind && (placement === "static" || placement === "prototype")) { var receiver = placement === "static" ? F : proto; this.defineClassElement(receiver, element); } }, this); }, this); }, defineClassElement: function defineClassElement(receiver, element) { var descriptor = element.descriptor; if (element.kind === "field") { var initializer = element.initializer; descriptor = { enumerable: descriptor.enumerable, writable: descriptor.writable, configurable: descriptor.configurable, value: initializer === void 0 ? void 0 : initializer.call(receiver) }; } Object.defineProperty(receiver, element.key, descriptor); }, decorateClass: function decorateClass(elements, decorators) { var newElements = []; var finishers = []; var placements = { "static": [], prototype: [], own: [] }; elements.forEach(function (element) { this.addElementPlacement(element, placements); }, this); elements.forEach(function (element) { if (!_hasDecorators$9(element)) return newElements.push(element); var elementFinishersExtras = this.decorateElement(element, placements); newElements.push(elementFinishersExtras.element); newElements.push.apply(newElements, elementFinishersExtras.extras); finishers.push.apply(finishers, elementFinishersExtras.finishers); }, this); if (!decorators) { return { elements: newElements, finishers: finishers }; } var result = this.decorateConstructor(newElements, decorators); finishers.push.apply(finishers, result.finishers); result.finishers = finishers; return result; }, addElementPlacement: function addElementPlacement(element, placements, silent) { var keys = placements[element.placement]; if (!silent && keys.indexOf(element.key) !== -1) { throw new TypeError("Duplicated element (" + element.key + ")"); } keys.push(element.key); }, decorateElement: function decorateElement(element, placements) { var extras = []; var finishers = []; for (var decorators = element.decorators, i = decorators.length - 1; i >= 0; i--) { var keys = placements[element.placement]; keys.splice(keys.indexOf(element.key), 1); var elementObject = this.fromElementDescriptor(element); var elementFinisherExtras = this.toElementFinisherExtras((0, decorators[i])(elementObject) || elementObject); element = elementFinisherExtras.element; this.addElementPlacement(element, placements); if (elementFinisherExtras.finisher) { finishers.push(elementFinisherExtras.finisher); } var newExtras = elementFinisherExtras.extras; if (newExtras) { for (var j = 0; j < newExtras.length; j++) { this.addElementPlacement(newExtras[j], placements); } extras.push.apply(extras, newExtras); } } return { element: element, finishers: finishers, extras: extras }; }, decorateConstructor: function decorateConstructor(elements, decorators) { var finishers = []; for (var i = decorators.length - 1; i >= 0; i--) { var obj = this.fromClassDescriptor(elements); var elementsAndFinisher = this.toClassDescriptor((0, decorators[i])(obj) || obj); if (elementsAndFinisher.finisher !== undefined) { finishers.push(elementsAndFinisher.finisher); } if (elementsAndFinisher.elements !== undefined) { elements = elementsAndFinisher.elements; for (var j = 0; j < elements.length - 1; j++) { for (var k = j + 1; k < elements.length; k++) { if (elements[j].key === elements[k].key && elements[j].placement === elements[k].placement) { throw new TypeError("Duplicated element (" + elements[j].key + ")"); } } } } } return { elements: elements, finishers: finishers }; }, fromElementDescriptor: function fromElementDescriptor(element) { var obj = { kind: element.kind, key: element.key, placement: element.placement, descriptor: element.descriptor }; var desc = { value: "Descriptor", configurable: true }; Object.defineProperty(obj, Symbol.toStringTag, desc); if (element.kind === "field") obj.initializer = element.initializer; return obj; }, toElementDescriptors: function toElementDescriptors(elementObjects) { if (elementObjects === undefined) return; return _toArray(elementObjects).map(function (elementObject) { var element = this.toElementDescriptor(elementObject); this.disallowProperty(elementObject, "finisher", "An element descriptor"); this.disallowProperty(elementObject, "extras", "An element descriptor"); return element; }, this); }, toElementDescriptor: function toElementDescriptor(elementObject) { var kind = String(elementObject.kind); if (kind !== "method" && kind !== "field") { throw new TypeError('An element descriptor\'s .kind property must be either "method" or' + ' "field", but a decorator created an element descriptor with' + ' .kind "' + kind + '"'); } var key = _toPropertyKey$9(elementObject.key); var placement = String(elementObject.placement); if (placement !== "static" && placement !== "prototype" && placement !== "own") { throw new TypeError('An element descriptor\'s .placement property must be one of "static",' + ' "prototype" or "own", but a decorator created an element descriptor' + ' with .placement "' + placement + '"'); } var descriptor = elementObject.descriptor; this.disallowProperty(elementObject, "elements", "An element descriptor"); var element = { kind: kind, key: key, placement: placement, descriptor: Object.assign({}, descriptor) }; if (kind !== "field") { this.disallowProperty(elementObject, "initializer", "A method descriptor"); } else { this.disallowProperty(descriptor, "get", "The property descriptor of a field descriptor"); this.disallowProperty(descriptor, "set", "The property descriptor of a field descriptor"); this.disallowProperty(descriptor, "value", "The property descriptor of a field descriptor"); element.initializer = elementObject.initializer; } return element; }, toElementFinisherExtras: function toElementFinisherExtras(elementObject) { var element = this.toElementDescriptor(elementObject); var finisher = _optionalCallableProperty$9(elementObject, "finisher"); var extras = this.toElementDescriptors(elementObject.extras); return { element: element, finisher: finisher, extras: extras }; }, fromClassDescriptor: function fromClassDescriptor(elements) { var obj = { kind: "class", elements: elements.map(this.fromElementDescriptor, this) }; var desc = { value: "Descriptor", configurable: true }; Object.defineProperty(obj, Symbol.toStringTag, desc); return obj; }, toClassDescriptor: function toClassDescriptor(obj) { var kind = String(obj.kind); if (kind !== "class") { throw new TypeError('A class descriptor\'s .kind property must be "class", but a decorator' + ' created a class descriptor with .kind "' + kind + '"'); } this.disallowProperty(obj, "key", "A class descriptor"); this.disallowProperty(obj, "placement", "A class descriptor"); this.disallowProperty(obj, "descriptor", "A class descriptor"); this.disallowProperty(obj, "initializer", "A class descriptor"); this.disallowProperty(obj, "extras", "A class descriptor"); var finisher = _optionalCallableProperty$9(obj, "finisher"); var elements = this.toElementDescriptors(obj.elements); return { elements: elements, finisher: finisher }; }, runClassFinishers: function runClassFinishers(constructor, finishers) { for (var i = 0; i < finishers.length; i++) { var newConstructor = (0, finishers[i])(constructor); if (newConstructor !== undefined) { if (typeof newConstructor !== "function") { throw new TypeError("Finishers must return a constructor."); } constructor = newConstructor; } } return constructor; }, disallowProperty: function disallowProperty(obj, name, objectType) { if (obj[name] !== undefined) { throw new TypeError(objectType + " can't have a ." + name + " property."); } } }; return api; }
function _createElementDescriptor$9(def) { var key = _toPropertyKey$9(def.key); var descriptor; if (def.kind === "method") { descriptor = { value: def.value, writable: true, configurable: true, enumerable: false }; } else if (def.kind === "get") { descriptor = { get: def.value, configurable: true, enumerable: false }; } else if (def.kind === "set") { descriptor = { set: def.value, configurable: true, enumerable: false }; } else if (def.kind === "field") { descriptor = { configurable: true, writable: true, enumerable: true }; } var element = { kind: def.kind === "field" ? "field" : "method", key: key, placement: def["static"] ? "static" : def.kind === "field" ? "own" : "prototype", descriptor: descriptor }; if (def.decorators) element.decorators = def.decorators; if (def.kind === "field") element.initializer = def.value; return element; }
function _coalesceGetterSetter$9(element, other) { if (element.descriptor.get !== undefined) { other.descriptor.get = element.descriptor.get; } else { other.descriptor.set = element.descriptor.set; } }
function _coalesceClassElements$9(elements) { var newElements = []; var isSameElement = function isSameElement(other) { return other.kind === "method" && other.key === element.key && other.placement === element.placement; }; for (var i = 0; i < elements.length; i++) { var element = elements[i]; var other; if (element.kind === "method" && (other = newElements.find(isSameElement))) { if (_isDataDescriptor$9(element.descriptor) || _isDataDescriptor$9(other.descriptor)) { if (_hasDecorators$9(element) || _hasDecorators$9(other)) { throw new ReferenceError("Duplicated methods (" + element.key + ") can't be decorated."); } other.descriptor = element.descriptor; } else { if (_hasDecorators$9(element)) { if (_hasDecorators$9(other)) { throw new ReferenceError("Decorators can't be placed on different accessors with for " + "the same property (" + element.key + ")."); } other.decorators = element.decorators; } _coalesceGetterSetter$9(element, other); } } else { newElements.push(element); } } return newElements; }
function _hasDecorators$9(element) { return element.decorators && element.decorators.length; }
function _isDataDescriptor$9(desc) { return desc !== undefined && !(desc.value === undefined && desc.writable === undefined); }
function _optionalCallableProperty$9(obj, name) { var value = obj[name]; if (value !== undefined && typeof value !== "function") { throw new TypeError("Expected '" + name + "' to be a function"); } return value; }
function _toPropertyKey$9(arg) { var key = _toPrimitive$9(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive$9(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var Socket = _decorate$9([customElement('socket-component')], function (_initialize, _LitElement) {
  var Socket = /*#__PURE__*/function (_LitElement2) {
    _inherits(Socket, _LitElement2);
    var _super = _createSuper$a(Socket);
    function Socket() {
      var _this;
      _classCallCheck(this, Socket);
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _super.call.apply(_super, [this].concat(args));
      _initialize(_assertThisInitialized(_this));
      return _this;
    }
    return _createClass(Socket);
  }(_LitElement);
  return {
    F: Socket,
    d: [{
      kind: "field",
      decorators: [property({
        type: ClassicPreset.Socket
      })],
      key: "data",
      value: void 0
    }, {
      kind: "field",
      "static": true,
      key: "styles",
      value: function value() {
        return [vars$1, css(_templateObject$a || (_templateObject$a = _taggedTemplateLiteral(["\n            :host {\n                display: inline-block;\n                cursor: pointer;\n                border: 1px solid white;\n                border-radius: calc(var(--socket-size) / 2);\n                width: var(--socket-size);\n                height: var(--socket-size);\n                margin: var(--socket-margin);\n                vertical-align: middle;\n                background: var(--socket-color);\n                z-index: 2;\n                box-sizing: border-box;\n            }\n            :host(:hover) {\n                border-width: 4px;\n            }\n            :host(.multiple) {\n                border-color: yellow;\n            }\n            :host(.output) {\n                margin-right: calc(var(--socket-size) / -2);\n            }\n            :host(.input) {\n                margin-left: calc(var(--socket-size) / -2);\n            }\n        "])))];
      }
    }, {
      kind: "method",
      key: "handleClick",
      value:
      // Define the click handler function
      function handleClick() {
        // eslint-disable-next-line
        console.log('Socket has been clicked');
      }
    }, {
      kind: "method",
      key: "render",
      value: function render() {
        var _this$data;
        return html(_templateObject2$9 || (_templateObject2$9 = _taggedTemplateLiteral(["\n            <div\n                class=\"socket\"\n                title=\"", "\"\n                @click=\"", "\"\n            ></div>\n        "])), (_this$data = this.data) === null || _this$data === void 0 ? void 0 : _this$data.name, this.handleClick);
      }
    }]
  };
}, LitElement);

function ownKeys$4(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread$4(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$4(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$4(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
/**
 * Classic preset for rendering nodes, connections, controls and sockets.
 */
function setup$3(props) {
  var positionWatcher = typeof (props === null || props === void 0 ? void 0 : props.socketPositionWatcher) === 'undefined' ? getDOMSocketPosition() : props === null || props === void 0 ? void 0 : props.socketPositionWatcher;
  var _ref = (props === null || props === void 0 ? void 0 : props.customize) || {},
    node = _ref.node,
    connection = _ref.connection,
    socket = _ref.socket,
    control = _ref.control;
  return {
    attach: function attach(plugin) {
      positionWatcher.attach(plugin);
    },
    update: function update(context, plugin) {
      var payload = context.data.payload;
      var parent = plugin.parentScope();
      if (!parent) throw new Error('parent');
      var emit = parent.emit.bind(parent);
      if (context.data.type === 'node') {
        return {
          data: payload,
          emit: emit
        };
      } else if (context.data.type === 'connection') {
        var _context$data = context.data,
          start = _context$data.start,
          end = _context$data.end;
        return _objectSpread$4(_objectSpread$4({
          data: payload
        }, start ? {
          start: start
        } : {}), end ? {
          end: end
        } : {});
      }
      return {
        data: payload
      };
    },
    // eslint-disable-next-line max-statements, complexity
    render: function render(context, plugin) {
      var parent = plugin.parentScope();
      var emit = parent.emit.bind(parent);
      if (context.data.type === 'node') {
        var component = node ? node(context.data) : Node;
        return component && {
          component: component,
          props: {
            data: context.data.payload,
            emit: emit
          }
        };
      } else if (context.data.type === 'connection') {
        var _component = connection ? connection(context.data) : Connection;
        var payload = context.data.payload;
        var source = payload.source,
          target = payload.target,
          sourceOutput = payload.sourceOutput,
          targetInput = payload.targetInput;
        return _component && {
          component: ConnectionWrapper,
          props: {
            data: context.data.payload,
            component: _component,
            start: context.data.start || function (change) {
              return positionWatcher.listen(source, 'output', sourceOutput, change);
            },
            end: context.data.end || function (change) {
              return positionWatcher.listen(target, 'input', targetInput, change);
            },
            path: function () {
              var _path = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(start, end) {
                var response, _response$data, path, points, curvature;
                return _regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) switch (_context.prev = _context.next) {
                    case 0:
                      _context.next = 2;
                      return plugin.emit({
                        type: 'connectionpath',
                        data: {
                          payload: payload,
                          points: [start, end]
                        }
                      });
                    case 2:
                      response = _context.sent;
                      if (response) {
                        _context.next = 5;
                        break;
                      }
                      return _context.abrupt("return", '');
                    case 5:
                      _response$data = response.data, path = _response$data.path, points = _response$data.points;
                      curvature = 0.3;
                      if (!(!path && points.length !== 2)) {
                        _context.next = 9;
                        break;
                      }
                      throw new Error('cannot render connection with a custom number of points');
                    case 9:
                      if (path) {
                        _context.next = 11;
                        break;
                      }
                      return _context.abrupt("return", payload.isLoop ? loopConnectionPath(points, curvature, 120) : classicConnectionPath(points, curvature));
                    case 11:
                      return _context.abrupt("return", path);
                    case 12:
                    case "end":
                      return _context.stop();
                  }
                }, _callee);
              }));
              function path(_x, _x2) {
                return _path.apply(this, arguments);
              }
              return path;
            }()
          }
        };
      } else if (context.data.type === 'socket') {
        var _payload = context.data.payload;
        var _component2 = socket ? socket(context.data) : Socket;
        return {
          component: _component2,
          props: {
            data: _payload
          }
        };
      } else if (context.data.type === 'control') {
        var _payload2 = context.data.payload;
        if (control) {
          var _component3 = control(context.data);
          return _component3 && {
            component: _component3,
            props: {
              data: _payload2
            }
          };
        }
        return context.data.payload instanceof ClassicPreset.InputControl ? {
          component: Control,
          props: {
            data: _payload2
          }
        } : null;
      }
    }
  };
}

var index$4 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  setup: setup$3,
  Connection: Connection,
  Control: Control,
  Node: Node,
  Socket: Socket
});

var _templateObject$9;
var vars = css(_templateObject$9 || (_templateObject$9 = _taggedTemplateLiteral([":host {\n    --context-color: rgba(110, 136, 255, 0.8);\n    --context-color-light: rgba(130, 153, 255, 0.8);\n    --context-color-dark: rgba(69, 103, 255, 0.8);\n    --context-menu-round: 5px;\n    --width: 120px;\n    --test: 23px;\n}"])));

var _templateObject$8, _templateObject2$8;
function _createSuper$9(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$9(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _isNativeReflectConstruct$9() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _decorate$8(decorators, factory, superClass, mixins) { var api = _getDecoratorsApi$8(); if (mixins) { for (var i = 0; i < mixins.length; i++) { api = mixins[i](api); } } var r = factory(function initialize(O) { api.initializeInstanceElements(O, decorated.elements); }, superClass); var decorated = api.decorateClass(_coalesceClassElements$8(r.d.map(_createElementDescriptor$8)), decorators); api.initializeClassElements(r.F, decorated.elements); return api.runClassFinishers(r.F, decorated.finishers); }
function _getDecoratorsApi$8() { _getDecoratorsApi$8 = function _getDecoratorsApi() { return api; }; var api = { elementsDefinitionOrder: [["method"], ["field"]], initializeInstanceElements: function initializeInstanceElements(O, elements) { ["method", "field"].forEach(function (kind) { elements.forEach(function (element) { if (element.kind === kind && element.placement === "own") { this.defineClassElement(O, element); } }, this); }, this); }, initializeClassElements: function initializeClassElements(F, elements) { var proto = F.prototype; ["method", "field"].forEach(function (kind) { elements.forEach(function (element) { var placement = element.placement; if (element.kind === kind && (placement === "static" || placement === "prototype")) { var receiver = placement === "static" ? F : proto; this.defineClassElement(receiver, element); } }, this); }, this); }, defineClassElement: function defineClassElement(receiver, element) { var descriptor = element.descriptor; if (element.kind === "field") { var initializer = element.initializer; descriptor = { enumerable: descriptor.enumerable, writable: descriptor.writable, configurable: descriptor.configurable, value: initializer === void 0 ? void 0 : initializer.call(receiver) }; } Object.defineProperty(receiver, element.key, descriptor); }, decorateClass: function decorateClass(elements, decorators) { var newElements = []; var finishers = []; var placements = { "static": [], prototype: [], own: [] }; elements.forEach(function (element) { this.addElementPlacement(element, placements); }, this); elements.forEach(function (element) { if (!_hasDecorators$8(element)) return newElements.push(element); var elementFinishersExtras = this.decorateElement(element, placements); newElements.push(elementFinishersExtras.element); newElements.push.apply(newElements, elementFinishersExtras.extras); finishers.push.apply(finishers, elementFinishersExtras.finishers); }, this); if (!decorators) { return { elements: newElements, finishers: finishers }; } var result = this.decorateConstructor(newElements, decorators); finishers.push.apply(finishers, result.finishers); result.finishers = finishers; return result; }, addElementPlacement: function addElementPlacement(element, placements, silent) { var keys = placements[element.placement]; if (!silent && keys.indexOf(element.key) !== -1) { throw new TypeError("Duplicated element (" + element.key + ")"); } keys.push(element.key); }, decorateElement: function decorateElement(element, placements) { var extras = []; var finishers = []; for (var decorators = element.decorators, i = decorators.length - 1; i >= 0; i--) { var keys = placements[element.placement]; keys.splice(keys.indexOf(element.key), 1); var elementObject = this.fromElementDescriptor(element); var elementFinisherExtras = this.toElementFinisherExtras((0, decorators[i])(elementObject) || elementObject); element = elementFinisherExtras.element; this.addElementPlacement(element, placements); if (elementFinisherExtras.finisher) { finishers.push(elementFinisherExtras.finisher); } var newExtras = elementFinisherExtras.extras; if (newExtras) { for (var j = 0; j < newExtras.length; j++) { this.addElementPlacement(newExtras[j], placements); } extras.push.apply(extras, newExtras); } } return { element: element, finishers: finishers, extras: extras }; }, decorateConstructor: function decorateConstructor(elements, decorators) { var finishers = []; for (var i = decorators.length - 1; i >= 0; i--) { var obj = this.fromClassDescriptor(elements); var elementsAndFinisher = this.toClassDescriptor((0, decorators[i])(obj) || obj); if (elementsAndFinisher.finisher !== undefined) { finishers.push(elementsAndFinisher.finisher); } if (elementsAndFinisher.elements !== undefined) { elements = elementsAndFinisher.elements; for (var j = 0; j < elements.length - 1; j++) { for (var k = j + 1; k < elements.length; k++) { if (elements[j].key === elements[k].key && elements[j].placement === elements[k].placement) { throw new TypeError("Duplicated element (" + elements[j].key + ")"); } } } } } return { elements: elements, finishers: finishers }; }, fromElementDescriptor: function fromElementDescriptor(element) { var obj = { kind: element.kind, key: element.key, placement: element.placement, descriptor: element.descriptor }; var desc = { value: "Descriptor", configurable: true }; Object.defineProperty(obj, Symbol.toStringTag, desc); if (element.kind === "field") obj.initializer = element.initializer; return obj; }, toElementDescriptors: function toElementDescriptors(elementObjects) { if (elementObjects === undefined) return; return _toArray(elementObjects).map(function (elementObject) { var element = this.toElementDescriptor(elementObject); this.disallowProperty(elementObject, "finisher", "An element descriptor"); this.disallowProperty(elementObject, "extras", "An element descriptor"); return element; }, this); }, toElementDescriptor: function toElementDescriptor(elementObject) { var kind = String(elementObject.kind); if (kind !== "method" && kind !== "field") { throw new TypeError('An element descriptor\'s .kind property must be either "method" or' + ' "field", but a decorator created an element descriptor with' + ' .kind "' + kind + '"'); } var key = _toPropertyKey$8(elementObject.key); var placement = String(elementObject.placement); if (placement !== "static" && placement !== "prototype" && placement !== "own") { throw new TypeError('An element descriptor\'s .placement property must be one of "static",' + ' "prototype" or "own", but a decorator created an element descriptor' + ' with .placement "' + placement + '"'); } var descriptor = elementObject.descriptor; this.disallowProperty(elementObject, "elements", "An element descriptor"); var element = { kind: kind, key: key, placement: placement, descriptor: Object.assign({}, descriptor) }; if (kind !== "field") { this.disallowProperty(elementObject, "initializer", "A method descriptor"); } else { this.disallowProperty(descriptor, "get", "The property descriptor of a field descriptor"); this.disallowProperty(descriptor, "set", "The property descriptor of a field descriptor"); this.disallowProperty(descriptor, "value", "The property descriptor of a field descriptor"); element.initializer = elementObject.initializer; } return element; }, toElementFinisherExtras: function toElementFinisherExtras(elementObject) { var element = this.toElementDescriptor(elementObject); var finisher = _optionalCallableProperty$8(elementObject, "finisher"); var extras = this.toElementDescriptors(elementObject.extras); return { element: element, finisher: finisher, extras: extras }; }, fromClassDescriptor: function fromClassDescriptor(elements) { var obj = { kind: "class", elements: elements.map(this.fromElementDescriptor, this) }; var desc = { value: "Descriptor", configurable: true }; Object.defineProperty(obj, Symbol.toStringTag, desc); return obj; }, toClassDescriptor: function toClassDescriptor(obj) { var kind = String(obj.kind); if (kind !== "class") { throw new TypeError('A class descriptor\'s .kind property must be "class", but a decorator' + ' created a class descriptor with .kind "' + kind + '"'); } this.disallowProperty(obj, "key", "A class descriptor"); this.disallowProperty(obj, "placement", "A class descriptor"); this.disallowProperty(obj, "descriptor", "A class descriptor"); this.disallowProperty(obj, "initializer", "A class descriptor"); this.disallowProperty(obj, "extras", "A class descriptor"); var finisher = _optionalCallableProperty$8(obj, "finisher"); var elements = this.toElementDescriptors(obj.elements); return { elements: elements, finisher: finisher }; }, runClassFinishers: function runClassFinishers(constructor, finishers) { for (var i = 0; i < finishers.length; i++) { var newConstructor = (0, finishers[i])(constructor); if (newConstructor !== undefined) { if (typeof newConstructor !== "function") { throw new TypeError("Finishers must return a constructor."); } constructor = newConstructor; } } return constructor; }, disallowProperty: function disallowProperty(obj, name, objectType) { if (obj[name] !== undefined) { throw new TypeError(objectType + " can't have a ." + name + " property."); } } }; return api; }
function _createElementDescriptor$8(def) { var key = _toPropertyKey$8(def.key); var descriptor; if (def.kind === "method") { descriptor = { value: def.value, writable: true, configurable: true, enumerable: false }; } else if (def.kind === "get") { descriptor = { get: def.value, configurable: true, enumerable: false }; } else if (def.kind === "set") { descriptor = { set: def.value, configurable: true, enumerable: false }; } else if (def.kind === "field") { descriptor = { configurable: true, writable: true, enumerable: true }; } var element = { kind: def.kind === "field" ? "field" : "method", key: key, placement: def["static"] ? "static" : def.kind === "field" ? "own" : "prototype", descriptor: descriptor }; if (def.decorators) element.decorators = def.decorators; if (def.kind === "field") element.initializer = def.value; return element; }
function _coalesceGetterSetter$8(element, other) { if (element.descriptor.get !== undefined) { other.descriptor.get = element.descriptor.get; } else { other.descriptor.set = element.descriptor.set; } }
function _coalesceClassElements$8(elements) { var newElements = []; var isSameElement = function isSameElement(other) { return other.kind === "method" && other.key === element.key && other.placement === element.placement; }; for (var i = 0; i < elements.length; i++) { var element = elements[i]; var other; if (element.kind === "method" && (other = newElements.find(isSameElement))) { if (_isDataDescriptor$8(element.descriptor) || _isDataDescriptor$8(other.descriptor)) { if (_hasDecorators$8(element) || _hasDecorators$8(other)) { throw new ReferenceError("Duplicated methods (" + element.key + ") can't be decorated."); } other.descriptor = element.descriptor; } else { if (_hasDecorators$8(element)) { if (_hasDecorators$8(other)) { throw new ReferenceError("Decorators can't be placed on different accessors with for " + "the same property (" + element.key + ")."); } other.decorators = element.decorators; } _coalesceGetterSetter$8(element, other); } } else { newElements.push(element); } } return newElements; }
function _hasDecorators$8(element) { return element.decorators && element.decorators.length; }
function _isDataDescriptor$8(desc) { return desc !== undefined && !(desc.value === undefined && desc.writable === undefined); }
function _optionalCallableProperty$8(obj, name) { var value = obj[name]; if (value !== undefined && typeof value !== "function") { throw new TypeError("Expected '" + name + "' to be a function"); } return value; }
function _toPropertyKey$8(arg) { var key = _toPrimitive$8(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive$8(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
_decorate$8([customElement('block-component')], function (_initialize, _LitElement) {
  var Block = /*#__PURE__*/function (_LitElement2) {
    _inherits(Block, _LitElement2);
    var _super = _createSuper$9(Block);
    function Block() {
      var _this;
      _classCallCheck(this, Block);
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _super.call.apply(_super, [this].concat(args));
      _initialize(_assertThisInitialized(_this));
      return _this;
    }
    return _createClass(Block);
  }(_LitElement);
  return {
    F: Block,
    d: [{
      kind: "field",
      "static": true,
      key: "styles",
      value: function value() {
        return [vars, css(_templateObject$8 || (_templateObject$8 = _taggedTemplateLiteral(["\n    :host {\n      color: #fff;\n      padding: 4px;\n      border-bottom: 1px solid var(--context-color-dark);\n      background-color: var(--context-color);\n      cursor: pointer;\n      box-sizing: border-box;\n      width: 100%;\n      position: relative;\n    }\n\n    :host(:first-child) {\n      border-top-left-radius: var(--context-menu-round);\n      border-top-right-radius: var(--context-menu-round);\n    }\n\n    :host(:last-child) {\n      border-bottom-left-radius: var(--context-menu-round);\n      border-bottom-right-radius: var(--context-menu-round);\n    }\n\n    :host(:hover) {\n      background-color: var(--context-color-light);\n    }\n  "])))];
      }
    }, {
      kind: "method",
      key: "render",
      value: function render() {
        return html(_templateObject2$8 || (_templateObject2$8 = _taggedTemplateLiteral(["\n      <slot></slot>\n    "])));
      }
    }]
  };
}, LitElement);

function debounce(delay, cb) {
  return {
    timeout: null,
    cancel: function cancel() {
      if (this.timeout) {
        window.clearTimeout(this.timeout);
        this.timeout = null;
      }
    },
    call: function call() {
      this.timeout = window.setTimeout(function () {
        cb();
      }, delay);
    }
  };
}

var _templateObject$7, _templateObject2$7, _templateObject3$3, _templateObject4$1;
function _createSuper$8(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$8(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _isNativeReflectConstruct$8() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _decorate$7(decorators, factory, superClass, mixins) { var api = _getDecoratorsApi$7(); if (mixins) { for (var i = 0; i < mixins.length; i++) { api = mixins[i](api); } } var r = factory(function initialize(O) { api.initializeInstanceElements(O, decorated.elements); }, superClass); var decorated = api.decorateClass(_coalesceClassElements$7(r.d.map(_createElementDescriptor$7)), decorators); api.initializeClassElements(r.F, decorated.elements); return api.runClassFinishers(r.F, decorated.finishers); }
function _getDecoratorsApi$7() { _getDecoratorsApi$7 = function _getDecoratorsApi() { return api; }; var api = { elementsDefinitionOrder: [["method"], ["field"]], initializeInstanceElements: function initializeInstanceElements(O, elements) { ["method", "field"].forEach(function (kind) { elements.forEach(function (element) { if (element.kind === kind && element.placement === "own") { this.defineClassElement(O, element); } }, this); }, this); }, initializeClassElements: function initializeClassElements(F, elements) { var proto = F.prototype; ["method", "field"].forEach(function (kind) { elements.forEach(function (element) { var placement = element.placement; if (element.kind === kind && (placement === "static" || placement === "prototype")) { var receiver = placement === "static" ? F : proto; this.defineClassElement(receiver, element); } }, this); }, this); }, defineClassElement: function defineClassElement(receiver, element) { var descriptor = element.descriptor; if (element.kind === "field") { var initializer = element.initializer; descriptor = { enumerable: descriptor.enumerable, writable: descriptor.writable, configurable: descriptor.configurable, value: initializer === void 0 ? void 0 : initializer.call(receiver) }; } Object.defineProperty(receiver, element.key, descriptor); }, decorateClass: function decorateClass(elements, decorators) { var newElements = []; var finishers = []; var placements = { "static": [], prototype: [], own: [] }; elements.forEach(function (element) { this.addElementPlacement(element, placements); }, this); elements.forEach(function (element) { if (!_hasDecorators$7(element)) return newElements.push(element); var elementFinishersExtras = this.decorateElement(element, placements); newElements.push(elementFinishersExtras.element); newElements.push.apply(newElements, elementFinishersExtras.extras); finishers.push.apply(finishers, elementFinishersExtras.finishers); }, this); if (!decorators) { return { elements: newElements, finishers: finishers }; } var result = this.decorateConstructor(newElements, decorators); finishers.push.apply(finishers, result.finishers); result.finishers = finishers; return result; }, addElementPlacement: function addElementPlacement(element, placements, silent) { var keys = placements[element.placement]; if (!silent && keys.indexOf(element.key) !== -1) { throw new TypeError("Duplicated element (" + element.key + ")"); } keys.push(element.key); }, decorateElement: function decorateElement(element, placements) { var extras = []; var finishers = []; for (var decorators = element.decorators, i = decorators.length - 1; i >= 0; i--) { var keys = placements[element.placement]; keys.splice(keys.indexOf(element.key), 1); var elementObject = this.fromElementDescriptor(element); var elementFinisherExtras = this.toElementFinisherExtras((0, decorators[i])(elementObject) || elementObject); element = elementFinisherExtras.element; this.addElementPlacement(element, placements); if (elementFinisherExtras.finisher) { finishers.push(elementFinisherExtras.finisher); } var newExtras = elementFinisherExtras.extras; if (newExtras) { for (var j = 0; j < newExtras.length; j++) { this.addElementPlacement(newExtras[j], placements); } extras.push.apply(extras, newExtras); } } return { element: element, finishers: finishers, extras: extras }; }, decorateConstructor: function decorateConstructor(elements, decorators) { var finishers = []; for (var i = decorators.length - 1; i >= 0; i--) { var obj = this.fromClassDescriptor(elements); var elementsAndFinisher = this.toClassDescriptor((0, decorators[i])(obj) || obj); if (elementsAndFinisher.finisher !== undefined) { finishers.push(elementsAndFinisher.finisher); } if (elementsAndFinisher.elements !== undefined) { elements = elementsAndFinisher.elements; for (var j = 0; j < elements.length - 1; j++) { for (var k = j + 1; k < elements.length; k++) { if (elements[j].key === elements[k].key && elements[j].placement === elements[k].placement) { throw new TypeError("Duplicated element (" + elements[j].key + ")"); } } } } } return { elements: elements, finishers: finishers }; }, fromElementDescriptor: function fromElementDescriptor(element) { var obj = { kind: element.kind, key: element.key, placement: element.placement, descriptor: element.descriptor }; var desc = { value: "Descriptor", configurable: true }; Object.defineProperty(obj, Symbol.toStringTag, desc); if (element.kind === "field") obj.initializer = element.initializer; return obj; }, toElementDescriptors: function toElementDescriptors(elementObjects) { if (elementObjects === undefined) return; return _toArray(elementObjects).map(function (elementObject) { var element = this.toElementDescriptor(elementObject); this.disallowProperty(elementObject, "finisher", "An element descriptor"); this.disallowProperty(elementObject, "extras", "An element descriptor"); return element; }, this); }, toElementDescriptor: function toElementDescriptor(elementObject) { var kind = String(elementObject.kind); if (kind !== "method" && kind !== "field") { throw new TypeError('An element descriptor\'s .kind property must be either "method" or' + ' "field", but a decorator created an element descriptor with' + ' .kind "' + kind + '"'); } var key = _toPropertyKey$7(elementObject.key); var placement = String(elementObject.placement); if (placement !== "static" && placement !== "prototype" && placement !== "own") { throw new TypeError('An element descriptor\'s .placement property must be one of "static",' + ' "prototype" or "own", but a decorator created an element descriptor' + ' with .placement "' + placement + '"'); } var descriptor = elementObject.descriptor; this.disallowProperty(elementObject, "elements", "An element descriptor"); var element = { kind: kind, key: key, placement: placement, descriptor: Object.assign({}, descriptor) }; if (kind !== "field") { this.disallowProperty(elementObject, "initializer", "A method descriptor"); } else { this.disallowProperty(descriptor, "get", "The property descriptor of a field descriptor"); this.disallowProperty(descriptor, "set", "The property descriptor of a field descriptor"); this.disallowProperty(descriptor, "value", "The property descriptor of a field descriptor"); element.initializer = elementObject.initializer; } return element; }, toElementFinisherExtras: function toElementFinisherExtras(elementObject) { var element = this.toElementDescriptor(elementObject); var finisher = _optionalCallableProperty$7(elementObject, "finisher"); var extras = this.toElementDescriptors(elementObject.extras); return { element: element, finisher: finisher, extras: extras }; }, fromClassDescriptor: function fromClassDescriptor(elements) { var obj = { kind: "class", elements: elements.map(this.fromElementDescriptor, this) }; var desc = { value: "Descriptor", configurable: true }; Object.defineProperty(obj, Symbol.toStringTag, desc); return obj; }, toClassDescriptor: function toClassDescriptor(obj) { var kind = String(obj.kind); if (kind !== "class") { throw new TypeError('A class descriptor\'s .kind property must be "class", but a decorator' + ' created a class descriptor with .kind "' + kind + '"'); } this.disallowProperty(obj, "key", "A class descriptor"); this.disallowProperty(obj, "placement", "A class descriptor"); this.disallowProperty(obj, "descriptor", "A class descriptor"); this.disallowProperty(obj, "initializer", "A class descriptor"); this.disallowProperty(obj, "extras", "A class descriptor"); var finisher = _optionalCallableProperty$7(obj, "finisher"); var elements = this.toElementDescriptors(obj.elements); return { elements: elements, finisher: finisher }; }, runClassFinishers: function runClassFinishers(constructor, finishers) { for (var i = 0; i < finishers.length; i++) { var newConstructor = (0, finishers[i])(constructor); if (newConstructor !== undefined) { if (typeof newConstructor !== "function") { throw new TypeError("Finishers must return a constructor."); } constructor = newConstructor; } } return constructor; }, disallowProperty: function disallowProperty(obj, name, objectType) { if (obj[name] !== undefined) { throw new TypeError(objectType + " can't have a ." + name + " property."); } } }; return api; }
function _createElementDescriptor$7(def) { var key = _toPropertyKey$7(def.key); var descriptor; if (def.kind === "method") { descriptor = { value: def.value, writable: true, configurable: true, enumerable: false }; } else if (def.kind === "get") { descriptor = { get: def.value, configurable: true, enumerable: false }; } else if (def.kind === "set") { descriptor = { set: def.value, configurable: true, enumerable: false }; } else if (def.kind === "field") { descriptor = { configurable: true, writable: true, enumerable: true }; } var element = { kind: def.kind === "field" ? "field" : "method", key: key, placement: def["static"] ? "static" : def.kind === "field" ? "own" : "prototype", descriptor: descriptor }; if (def.decorators) element.decorators = def.decorators; if (def.kind === "field") element.initializer = def.value; return element; }
function _coalesceGetterSetter$7(element, other) { if (element.descriptor.get !== undefined) { other.descriptor.get = element.descriptor.get; } else { other.descriptor.set = element.descriptor.set; } }
function _coalesceClassElements$7(elements) { var newElements = []; var isSameElement = function isSameElement(other) { return other.kind === "method" && other.key === element.key && other.placement === element.placement; }; for (var i = 0; i < elements.length; i++) { var element = elements[i]; var other; if (element.kind === "method" && (other = newElements.find(isSameElement))) { if (_isDataDescriptor$7(element.descriptor) || _isDataDescriptor$7(other.descriptor)) { if (_hasDecorators$7(element) || _hasDecorators$7(other)) { throw new ReferenceError("Duplicated methods (" + element.key + ") can't be decorated."); } other.descriptor = element.descriptor; } else { if (_hasDecorators$7(element)) { if (_hasDecorators$7(other)) { throw new ReferenceError("Decorators can't be placed on different accessors with for " + "the same property (" + element.key + ")."); } other.decorators = element.decorators; } _coalesceGetterSetter$7(element, other); } } else { newElements.push(element); } } return newElements; }
function _hasDecorators$7(element) { return element.decorators && element.decorators.length; }
function _isDataDescriptor$7(desc) { return desc !== undefined && !(desc.value === undefined && desc.writable === undefined); }
function _optionalCallableProperty$7(obj, name) { var value = obj[name]; if (value !== undefined && typeof value !== "function") { throw new TypeError("Expected '" + name + "' to be a function"); } return value; }
function _toPropertyKey$7(arg) { var key = _toPrimitive$7(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive$7(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
_decorate$7([customElement('item-component')], function (_initialize, _LitElement) {
  var Item = /*#__PURE__*/function (_LitElement2) {
    _inherits(Item, _LitElement2);
    var _super = _createSuper$8(Item);
    function Item() {
      var _this;
      _classCallCheck(this, Item);
      _this = _super.call(this);
      _initialize(_assertThisInitialized(_this));
      _this.hide = debounce(_this.delay, _this.hideSubitems.bind(_assertThisInitialized(_this)));
      return _this;
    }
    return _createClass(Item);
  }(_LitElement);
  return {
    F: Item,
    d: [{
      kind: "field",
      decorators: [property({
        type: Array
      })],
      key: "subitems",
      value: function value() {
        return [];
      }
    }, {
      kind: "field",
      decorators: [property({
        type: Number
      })],
      key: "delay",
      value: function value() {
        return 0;
      }
    }, {
      kind: "field",
      decorators: [property({
        type: Boolean
      })],
      key: "visibleSubitems",
      value: function value() {
        return false;
      }
    }, {
      kind: "field",
      key: "hide",
      value: void 0
    }, {
      kind: "method",
      key: "hideSubitems",
      value: function hideSubitems() {
        this.visibleSubitems = false;
      }
    }, {
      kind: "method",
      key: "render",
      value: function render() {
        var _this2 = this;
        return html(_templateObject$7 || (_templateObject$7 = _taggedTemplateLiteral(["\n      <block-component class=\"block ", "\" data-testid=\"context-menu-item\">\n        <div \n          class=\"content\"\n          @click=\"", "\"\n          @wheel=\"", "\"\n          @pointerover=\"", "\"\n          @pointerleave=\"", "\"\n          @pointerdown=\"", "\"\n        >\n          <slot></slot>\n          ", "\n        </div>\n      </block-component>\n    "])), this.subitems ? 'hasSubitems' : '', function (event) {
          _this2.dispatchEvent(new CustomEvent('select', {
            detail: event
          }));
          _this2.dispatchEvent(new CustomEvent('hide'));
        }, function (event) {
          return event.stopPropagation();
        }, function () {
          _this2.hide.cancel();
          _this2.visibleSubitems = true;
        }, function () {
          return _this2.hide.call(_this2);
        }, function (event) {
          return event.stopPropagation();
        }, this.subitems && this.visibleSubitems ? html(_templateObject2$7 || (_templateObject2$7 = _taggedTemplateLiteral(["\n            <div class=\"subitems\">\n              ", "\n            </div>\n          "])), this.subitems.map(function (item) {
          return html(_templateObject3$3 || (_templateObject3$3 = _taggedTemplateLiteral(["\n                <item-component\n                  @select=\"", "\"\n                  .delay=\"", "\"\n                  @hide=\"", "\"\n                  .subitems=\"", "\"\n                >", "</item-component>\n              "])), function (event) {
            return item.handler(event);
          }, _this2.delay, function () {
            return _this2.dispatchEvent(new CustomEvent('hide'));
          }, item.subitems, item.label);
        })) : '');
      }
    }, {
      kind: "field",
      "static": true,
      key: "styles",
      value: function value() {
        return [vars, css(_templateObject4$1 || (_templateObject4$1 = _taggedTemplateLiteral(["\n\n    .block {\n      padding: 0;\n    }\n\n    .content {\n      padding: 4px;\n      background-color: var(--context-color);\n    }\n\n    .hasSubitems:after {\n      content: '\u25BA';\n      position: absolute;\n      opacity: 0.6;\n      right: 5px;\n      top: 5px;\n    }\n\n    .subitems {\n      position: absolute;\n      top: 0;\n      left: 100%;\n      width: var(--width);\n    }\n  "])))];
      }
    }]
  };
}, LitElement);

var _templateObject$6, _templateObject2$6;
function _createSuper$7(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$7(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _isNativeReflectConstruct$7() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _decorate$6(decorators, factory, superClass, mixins) { var api = _getDecoratorsApi$6(); if (mixins) { for (var i = 0; i < mixins.length; i++) { api = mixins[i](api); } } var r = factory(function initialize(O) { api.initializeInstanceElements(O, decorated.elements); }, superClass); var decorated = api.decorateClass(_coalesceClassElements$6(r.d.map(_createElementDescriptor$6)), decorators); api.initializeClassElements(r.F, decorated.elements); return api.runClassFinishers(r.F, decorated.finishers); }
function _getDecoratorsApi$6() { _getDecoratorsApi$6 = function _getDecoratorsApi() { return api; }; var api = { elementsDefinitionOrder: [["method"], ["field"]], initializeInstanceElements: function initializeInstanceElements(O, elements) { ["method", "field"].forEach(function (kind) { elements.forEach(function (element) { if (element.kind === kind && element.placement === "own") { this.defineClassElement(O, element); } }, this); }, this); }, initializeClassElements: function initializeClassElements(F, elements) { var proto = F.prototype; ["method", "field"].forEach(function (kind) { elements.forEach(function (element) { var placement = element.placement; if (element.kind === kind && (placement === "static" || placement === "prototype")) { var receiver = placement === "static" ? F : proto; this.defineClassElement(receiver, element); } }, this); }, this); }, defineClassElement: function defineClassElement(receiver, element) { var descriptor = element.descriptor; if (element.kind === "field") { var initializer = element.initializer; descriptor = { enumerable: descriptor.enumerable, writable: descriptor.writable, configurable: descriptor.configurable, value: initializer === void 0 ? void 0 : initializer.call(receiver) }; } Object.defineProperty(receiver, element.key, descriptor); }, decorateClass: function decorateClass(elements, decorators) { var newElements = []; var finishers = []; var placements = { "static": [], prototype: [], own: [] }; elements.forEach(function (element) { this.addElementPlacement(element, placements); }, this); elements.forEach(function (element) { if (!_hasDecorators$6(element)) return newElements.push(element); var elementFinishersExtras = this.decorateElement(element, placements); newElements.push(elementFinishersExtras.element); newElements.push.apply(newElements, elementFinishersExtras.extras); finishers.push.apply(finishers, elementFinishersExtras.finishers); }, this); if (!decorators) { return { elements: newElements, finishers: finishers }; } var result = this.decorateConstructor(newElements, decorators); finishers.push.apply(finishers, result.finishers); result.finishers = finishers; return result; }, addElementPlacement: function addElementPlacement(element, placements, silent) { var keys = placements[element.placement]; if (!silent && keys.indexOf(element.key) !== -1) { throw new TypeError("Duplicated element (" + element.key + ")"); } keys.push(element.key); }, decorateElement: function decorateElement(element, placements) { var extras = []; var finishers = []; for (var decorators = element.decorators, i = decorators.length - 1; i >= 0; i--) { var keys = placements[element.placement]; keys.splice(keys.indexOf(element.key), 1); var elementObject = this.fromElementDescriptor(element); var elementFinisherExtras = this.toElementFinisherExtras((0, decorators[i])(elementObject) || elementObject); element = elementFinisherExtras.element; this.addElementPlacement(element, placements); if (elementFinisherExtras.finisher) { finishers.push(elementFinisherExtras.finisher); } var newExtras = elementFinisherExtras.extras; if (newExtras) { for (var j = 0; j < newExtras.length; j++) { this.addElementPlacement(newExtras[j], placements); } extras.push.apply(extras, newExtras); } } return { element: element, finishers: finishers, extras: extras }; }, decorateConstructor: function decorateConstructor(elements, decorators) { var finishers = []; for (var i = decorators.length - 1; i >= 0; i--) { var obj = this.fromClassDescriptor(elements); var elementsAndFinisher = this.toClassDescriptor((0, decorators[i])(obj) || obj); if (elementsAndFinisher.finisher !== undefined) { finishers.push(elementsAndFinisher.finisher); } if (elementsAndFinisher.elements !== undefined) { elements = elementsAndFinisher.elements; for (var j = 0; j < elements.length - 1; j++) { for (var k = j + 1; k < elements.length; k++) { if (elements[j].key === elements[k].key && elements[j].placement === elements[k].placement) { throw new TypeError("Duplicated element (" + elements[j].key + ")"); } } } } } return { elements: elements, finishers: finishers }; }, fromElementDescriptor: function fromElementDescriptor(element) { var obj = { kind: element.kind, key: element.key, placement: element.placement, descriptor: element.descriptor }; var desc = { value: "Descriptor", configurable: true }; Object.defineProperty(obj, Symbol.toStringTag, desc); if (element.kind === "field") obj.initializer = element.initializer; return obj; }, toElementDescriptors: function toElementDescriptors(elementObjects) { if (elementObjects === undefined) return; return _toArray(elementObjects).map(function (elementObject) { var element = this.toElementDescriptor(elementObject); this.disallowProperty(elementObject, "finisher", "An element descriptor"); this.disallowProperty(elementObject, "extras", "An element descriptor"); return element; }, this); }, toElementDescriptor: function toElementDescriptor(elementObject) { var kind = String(elementObject.kind); if (kind !== "method" && kind !== "field") { throw new TypeError('An element descriptor\'s .kind property must be either "method" or' + ' "field", but a decorator created an element descriptor with' + ' .kind "' + kind + '"'); } var key = _toPropertyKey$6(elementObject.key); var placement = String(elementObject.placement); if (placement !== "static" && placement !== "prototype" && placement !== "own") { throw new TypeError('An element descriptor\'s .placement property must be one of "static",' + ' "prototype" or "own", but a decorator created an element descriptor' + ' with .placement "' + placement + '"'); } var descriptor = elementObject.descriptor; this.disallowProperty(elementObject, "elements", "An element descriptor"); var element = { kind: kind, key: key, placement: placement, descriptor: Object.assign({}, descriptor) }; if (kind !== "field") { this.disallowProperty(elementObject, "initializer", "A method descriptor"); } else { this.disallowProperty(descriptor, "get", "The property descriptor of a field descriptor"); this.disallowProperty(descriptor, "set", "The property descriptor of a field descriptor"); this.disallowProperty(descriptor, "value", "The property descriptor of a field descriptor"); element.initializer = elementObject.initializer; } return element; }, toElementFinisherExtras: function toElementFinisherExtras(elementObject) { var element = this.toElementDescriptor(elementObject); var finisher = _optionalCallableProperty$6(elementObject, "finisher"); var extras = this.toElementDescriptors(elementObject.extras); return { element: element, finisher: finisher, extras: extras }; }, fromClassDescriptor: function fromClassDescriptor(elements) { var obj = { kind: "class", elements: elements.map(this.fromElementDescriptor, this) }; var desc = { value: "Descriptor", configurable: true }; Object.defineProperty(obj, Symbol.toStringTag, desc); return obj; }, toClassDescriptor: function toClassDescriptor(obj) { var kind = String(obj.kind); if (kind !== "class") { throw new TypeError('A class descriptor\'s .kind property must be "class", but a decorator' + ' created a class descriptor with .kind "' + kind + '"'); } this.disallowProperty(obj, "key", "A class descriptor"); this.disallowProperty(obj, "placement", "A class descriptor"); this.disallowProperty(obj, "descriptor", "A class descriptor"); this.disallowProperty(obj, "initializer", "A class descriptor"); this.disallowProperty(obj, "extras", "A class descriptor"); var finisher = _optionalCallableProperty$6(obj, "finisher"); var elements = this.toElementDescriptors(obj.elements); return { elements: elements, finisher: finisher }; }, runClassFinishers: function runClassFinishers(constructor, finishers) { for (var i = 0; i < finishers.length; i++) { var newConstructor = (0, finishers[i])(constructor); if (newConstructor !== undefined) { if (typeof newConstructor !== "function") { throw new TypeError("Finishers must return a constructor."); } constructor = newConstructor; } } return constructor; }, disallowProperty: function disallowProperty(obj, name, objectType) { if (obj[name] !== undefined) { throw new TypeError(objectType + " can't have a ." + name + " property."); } } }; return api; }
function _createElementDescriptor$6(def) { var key = _toPropertyKey$6(def.key); var descriptor; if (def.kind === "method") { descriptor = { value: def.value, writable: true, configurable: true, enumerable: false }; } else if (def.kind === "get") { descriptor = { get: def.value, configurable: true, enumerable: false }; } else if (def.kind === "set") { descriptor = { set: def.value, configurable: true, enumerable: false }; } else if (def.kind === "field") { descriptor = { configurable: true, writable: true, enumerable: true }; } var element = { kind: def.kind === "field" ? "field" : "method", key: key, placement: def["static"] ? "static" : def.kind === "field" ? "own" : "prototype", descriptor: descriptor }; if (def.decorators) element.decorators = def.decorators; if (def.kind === "field") element.initializer = def.value; return element; }
function _coalesceGetterSetter$6(element, other) { if (element.descriptor.get !== undefined) { other.descriptor.get = element.descriptor.get; } else { other.descriptor.set = element.descriptor.set; } }
function _coalesceClassElements$6(elements) { var newElements = []; var isSameElement = function isSameElement(other) { return other.kind === "method" && other.key === element.key && other.placement === element.placement; }; for (var i = 0; i < elements.length; i++) { var element = elements[i]; var other; if (element.kind === "method" && (other = newElements.find(isSameElement))) { if (_isDataDescriptor$6(element.descriptor) || _isDataDescriptor$6(other.descriptor)) { if (_hasDecorators$6(element) || _hasDecorators$6(other)) { throw new ReferenceError("Duplicated methods (" + element.key + ") can't be decorated."); } other.descriptor = element.descriptor; } else { if (_hasDecorators$6(element)) { if (_hasDecorators$6(other)) { throw new ReferenceError("Decorators can't be placed on different accessors with for " + "the same property (" + element.key + ")."); } other.decorators = element.decorators; } _coalesceGetterSetter$6(element, other); } } else { newElements.push(element); } } return newElements; }
function _hasDecorators$6(element) { return element.decorators && element.decorators.length; }
function _isDataDescriptor$6(desc) { return desc !== undefined && !(desc.value === undefined && desc.writable === undefined); }
function _optionalCallableProperty$6(obj, name) { var value = obj[name]; if (value !== undefined && typeof value !== "function") { throw new TypeError("Expected '" + name + "' to be a function"); } return value; }
function _toPropertyKey$6(arg) { var key = _toPrimitive$6(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive$6(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
_decorate$6([customElement('search-component')], function (_initialize, _LitElement) {
  var Search = /*#__PURE__*/function (_LitElement2) {
    _inherits(Search, _LitElement2);
    var _super = _createSuper$7(Search);
    function Search() {
      var _this;
      _classCallCheck(this, Search);
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _super.call.apply(_super, [this].concat(args));
      _initialize(_assertThisInitialized(_this));
      return _this;
    }
    return _createClass(Search);
  }(_LitElement);
  return {
    F: Search,
    d: [{
      kind: "field",
      decorators: [property({
        type: String
      })],
      key: "text",
      value: function value() {
        return '';
      }
    }, {
      kind: "field",
      "static": true,
      key: "styles",
      value: function value() {
        return css(_templateObject$6 || (_templateObject$6 = _taggedTemplateLiteral(["\n    .search {\n      color: white;\n      padding: 1px 8px;\n      border: 1px solid white;\n      border-radius: 10px;\n      font-size: 16px;\n      font-family: serif;\n      width: 100%;\n      box-sizing: border-box;\n      background: transparent;\n    }\n  "])));
      }
    }, {
      kind: "method",
      key: "render",
      value: function render() {
        return html(_templateObject2$6 || (_templateObject2$6 = _taggedTemplateLiteral(["\n      <input class=\"search\" \n        .value=\"", "\" \n        @input=\"", "\" \n        data-testid=\"context-menu-search-input\">\n      </input>\n    "])), this.text, this.handleInput);
      }
    }, {
      kind: "method",
      key: "handleInput",
      value: function handleInput(e) {
        this.text = e.target.value;
        this.dispatchEvent(new CustomEvent('change', {
          detail: this.text
        }));
      }
    }]
  };
}, LitElement);

var _templateObject$5, _templateObject2$5, _templateObject3$2, _templateObject4;
function _createSuper$6(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$6(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _isNativeReflectConstruct$6() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _decorate$5(decorators, factory, superClass, mixins) { var api = _getDecoratorsApi$5(); if (mixins) { for (var i = 0; i < mixins.length; i++) { api = mixins[i](api); } } var r = factory(function initialize(O) { api.initializeInstanceElements(O, decorated.elements); }, superClass); var decorated = api.decorateClass(_coalesceClassElements$5(r.d.map(_createElementDescriptor$5)), decorators); api.initializeClassElements(r.F, decorated.elements); return api.runClassFinishers(r.F, decorated.finishers); }
function _getDecoratorsApi$5() { _getDecoratorsApi$5 = function _getDecoratorsApi() { return api; }; var api = { elementsDefinitionOrder: [["method"], ["field"]], initializeInstanceElements: function initializeInstanceElements(O, elements) { ["method", "field"].forEach(function (kind) { elements.forEach(function (element) { if (element.kind === kind && element.placement === "own") { this.defineClassElement(O, element); } }, this); }, this); }, initializeClassElements: function initializeClassElements(F, elements) { var proto = F.prototype; ["method", "field"].forEach(function (kind) { elements.forEach(function (element) { var placement = element.placement; if (element.kind === kind && (placement === "static" || placement === "prototype")) { var receiver = placement === "static" ? F : proto; this.defineClassElement(receiver, element); } }, this); }, this); }, defineClassElement: function defineClassElement(receiver, element) { var descriptor = element.descriptor; if (element.kind === "field") { var initializer = element.initializer; descriptor = { enumerable: descriptor.enumerable, writable: descriptor.writable, configurable: descriptor.configurable, value: initializer === void 0 ? void 0 : initializer.call(receiver) }; } Object.defineProperty(receiver, element.key, descriptor); }, decorateClass: function decorateClass(elements, decorators) { var newElements = []; var finishers = []; var placements = { "static": [], prototype: [], own: [] }; elements.forEach(function (element) { this.addElementPlacement(element, placements); }, this); elements.forEach(function (element) { if (!_hasDecorators$5(element)) return newElements.push(element); var elementFinishersExtras = this.decorateElement(element, placements); newElements.push(elementFinishersExtras.element); newElements.push.apply(newElements, elementFinishersExtras.extras); finishers.push.apply(finishers, elementFinishersExtras.finishers); }, this); if (!decorators) { return { elements: newElements, finishers: finishers }; } var result = this.decorateConstructor(newElements, decorators); finishers.push.apply(finishers, result.finishers); result.finishers = finishers; return result; }, addElementPlacement: function addElementPlacement(element, placements, silent) { var keys = placements[element.placement]; if (!silent && keys.indexOf(element.key) !== -1) { throw new TypeError("Duplicated element (" + element.key + ")"); } keys.push(element.key); }, decorateElement: function decorateElement(element, placements) { var extras = []; var finishers = []; for (var decorators = element.decorators, i = decorators.length - 1; i >= 0; i--) { var keys = placements[element.placement]; keys.splice(keys.indexOf(element.key), 1); var elementObject = this.fromElementDescriptor(element); var elementFinisherExtras = this.toElementFinisherExtras((0, decorators[i])(elementObject) || elementObject); element = elementFinisherExtras.element; this.addElementPlacement(element, placements); if (elementFinisherExtras.finisher) { finishers.push(elementFinisherExtras.finisher); } var newExtras = elementFinisherExtras.extras; if (newExtras) { for (var j = 0; j < newExtras.length; j++) { this.addElementPlacement(newExtras[j], placements); } extras.push.apply(extras, newExtras); } } return { element: element, finishers: finishers, extras: extras }; }, decorateConstructor: function decorateConstructor(elements, decorators) { var finishers = []; for (var i = decorators.length - 1; i >= 0; i--) { var obj = this.fromClassDescriptor(elements); var elementsAndFinisher = this.toClassDescriptor((0, decorators[i])(obj) || obj); if (elementsAndFinisher.finisher !== undefined) { finishers.push(elementsAndFinisher.finisher); } if (elementsAndFinisher.elements !== undefined) { elements = elementsAndFinisher.elements; for (var j = 0; j < elements.length - 1; j++) { for (var k = j + 1; k < elements.length; k++) { if (elements[j].key === elements[k].key && elements[j].placement === elements[k].placement) { throw new TypeError("Duplicated element (" + elements[j].key + ")"); } } } } } return { elements: elements, finishers: finishers }; }, fromElementDescriptor: function fromElementDescriptor(element) { var obj = { kind: element.kind, key: element.key, placement: element.placement, descriptor: element.descriptor }; var desc = { value: "Descriptor", configurable: true }; Object.defineProperty(obj, Symbol.toStringTag, desc); if (element.kind === "field") obj.initializer = element.initializer; return obj; }, toElementDescriptors: function toElementDescriptors(elementObjects) { if (elementObjects === undefined) return; return _toArray(elementObjects).map(function (elementObject) { var element = this.toElementDescriptor(elementObject); this.disallowProperty(elementObject, "finisher", "An element descriptor"); this.disallowProperty(elementObject, "extras", "An element descriptor"); return element; }, this); }, toElementDescriptor: function toElementDescriptor(elementObject) { var kind = String(elementObject.kind); if (kind !== "method" && kind !== "field") { throw new TypeError('An element descriptor\'s .kind property must be either "method" or' + ' "field", but a decorator created an element descriptor with' + ' .kind "' + kind + '"'); } var key = _toPropertyKey$5(elementObject.key); var placement = String(elementObject.placement); if (placement !== "static" && placement !== "prototype" && placement !== "own") { throw new TypeError('An element descriptor\'s .placement property must be one of "static",' + ' "prototype" or "own", but a decorator created an element descriptor' + ' with .placement "' + placement + '"'); } var descriptor = elementObject.descriptor; this.disallowProperty(elementObject, "elements", "An element descriptor"); var element = { kind: kind, key: key, placement: placement, descriptor: Object.assign({}, descriptor) }; if (kind !== "field") { this.disallowProperty(elementObject, "initializer", "A method descriptor"); } else { this.disallowProperty(descriptor, "get", "The property descriptor of a field descriptor"); this.disallowProperty(descriptor, "set", "The property descriptor of a field descriptor"); this.disallowProperty(descriptor, "value", "The property descriptor of a field descriptor"); element.initializer = elementObject.initializer; } return element; }, toElementFinisherExtras: function toElementFinisherExtras(elementObject) { var element = this.toElementDescriptor(elementObject); var finisher = _optionalCallableProperty$5(elementObject, "finisher"); var extras = this.toElementDescriptors(elementObject.extras); return { element: element, finisher: finisher, extras: extras }; }, fromClassDescriptor: function fromClassDescriptor(elements) { var obj = { kind: "class", elements: elements.map(this.fromElementDescriptor, this) }; var desc = { value: "Descriptor", configurable: true }; Object.defineProperty(obj, Symbol.toStringTag, desc); return obj; }, toClassDescriptor: function toClassDescriptor(obj) { var kind = String(obj.kind); if (kind !== "class") { throw new TypeError('A class descriptor\'s .kind property must be "class", but a decorator' + ' created a class descriptor with .kind "' + kind + '"'); } this.disallowProperty(obj, "key", "A class descriptor"); this.disallowProperty(obj, "placement", "A class descriptor"); this.disallowProperty(obj, "descriptor", "A class descriptor"); this.disallowProperty(obj, "initializer", "A class descriptor"); this.disallowProperty(obj, "extras", "A class descriptor"); var finisher = _optionalCallableProperty$5(obj, "finisher"); var elements = this.toElementDescriptors(obj.elements); return { elements: elements, finisher: finisher }; }, runClassFinishers: function runClassFinishers(constructor, finishers) { for (var i = 0; i < finishers.length; i++) { var newConstructor = (0, finishers[i])(constructor); if (newConstructor !== undefined) { if (typeof newConstructor !== "function") { throw new TypeError("Finishers must return a constructor."); } constructor = newConstructor; } } return constructor; }, disallowProperty: function disallowProperty(obj, name, objectType) { if (obj[name] !== undefined) { throw new TypeError(objectType + " can't have a ." + name + " property."); } } }; return api; }
function _createElementDescriptor$5(def) { var key = _toPropertyKey$5(def.key); var descriptor; if (def.kind === "method") { descriptor = { value: def.value, writable: true, configurable: true, enumerable: false }; } else if (def.kind === "get") { descriptor = { get: def.value, configurable: true, enumerable: false }; } else if (def.kind === "set") { descriptor = { set: def.value, configurable: true, enumerable: false }; } else if (def.kind === "field") { descriptor = { configurable: true, writable: true, enumerable: true }; } var element = { kind: def.kind === "field" ? "field" : "method", key: key, placement: def["static"] ? "static" : def.kind === "field" ? "own" : "prototype", descriptor: descriptor }; if (def.decorators) element.decorators = def.decorators; if (def.kind === "field") element.initializer = def.value; return element; }
function _coalesceGetterSetter$5(element, other) { if (element.descriptor.get !== undefined) { other.descriptor.get = element.descriptor.get; } else { other.descriptor.set = element.descriptor.set; } }
function _coalesceClassElements$5(elements) { var newElements = []; var isSameElement = function isSameElement(other) { return other.kind === "method" && other.key === element.key && other.placement === element.placement; }; for (var i = 0; i < elements.length; i++) { var element = elements[i]; var other; if (element.kind === "method" && (other = newElements.find(isSameElement))) { if (_isDataDescriptor$5(element.descriptor) || _isDataDescriptor$5(other.descriptor)) { if (_hasDecorators$5(element) || _hasDecorators$5(other)) { throw new ReferenceError("Duplicated methods (" + element.key + ") can't be decorated."); } other.descriptor = element.descriptor; } else { if (_hasDecorators$5(element)) { if (_hasDecorators$5(other)) { throw new ReferenceError("Decorators can't be placed on different accessors with for " + "the same property (" + element.key + ")."); } other.decorators = element.decorators; } _coalesceGetterSetter$5(element, other); } } else { newElements.push(element); } } return newElements; }
function _hasDecorators$5(element) { return element.decorators && element.decorators.length; }
function _isDataDescriptor$5(desc) { return desc !== undefined && !(desc.value === undefined && desc.writable === undefined); }
function _optionalCallableProperty$5(obj, name) { var value = obj[name]; if (value !== undefined && typeof value !== "function") { throw new TypeError("Expected '" + name + "' to be a function"); } return value; }
function _toPropertyKey$5(arg) { var key = _toPrimitive$5(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive$5(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var Menu = _decorate$5([customElement('menu-component')], function (_initialize, _LitElement) {
  var Menu = /*#__PURE__*/function (_LitElement2) {
    _inherits(Menu, _LitElement2);
    var _super = _createSuper$6(Menu);
    // eslint-disable-next-line

    function Menu() {
      var _this;
      _classCallCheck(this, Menu);
      _this = _super.call(this);
      _initialize(_assertThisInitialized(_this));
      _this.hide = debounce(_this.delay, _this.onHide);
      return _this;
    }
    return _createClass(Menu);
  }(_LitElement);
  return {
    F: Menu,
    d: [{
      kind: "field",
      decorators: [property({
        type: Array
      })],
      key: "items",
      value: function value() {
        return [];
      }
    }, {
      kind: "field",
      decorators: [property({
        type: Number
      })],
      key: "delay",
      value: function value() {
        return 0;
      }
    }, {
      kind: "field",
      decorators: [property({
        type: Boolean
      })],
      key: "searchBar",
      value: function value() {
        return false;
      }
    }, {
      kind: "field",
      decorators: [property({
        type: Function
      })],
      key: "onHide",
      value: function value() {
        return function () {};
      }
    }, {
      kind: "field",
      decorators: [property({
        type: String
      })],
      key: "seed",
      value: function value() {
        return '';
      }
    }, {
      kind: "field",
      decorators: [property({
        type: String
      })],
      key: "filter",
      value: function value() {
        return '';
      }
    }, {
      kind: "field",
      key: "hide",
      value: void 0
    }, {
      kind: "method",
      key: "getItems",
      value: function getItems() {
        var filterRegexp = new RegExp(this.filter, 'i');
        var filteredList = this.items.filter(function (item) {
          return item.label.match(filterRegexp);
        });
        return filteredList;
      }
    }, {
      kind: "method",
      key: "connectedCallback",
      value: function connectedCallback() {
        _get(_getPrototypeOf(Menu.prototype), "connectedCallback", this).call(this);
      }
    }, {
      kind: "method",
      key: "disconnectedCallback",
      value: function disconnectedCallback() {
        if (this.hide) this.hide.cancel();
        _get(_getPrototypeOf(Menu.prototype), "disconnectedCallback", this).call(this);
      }
    }, {
      kind: "method",
      key: "render",
      value: function render() {
        var _this2 = this;
        return html(_templateObject$5 || (_templateObject$5 = _taggedTemplateLiteral(["\n        <div\n            class=\"menu\"\n            @mouseover=\"", "\"\n            @mouseleave=\"", "\"\n            data-testid=\"context-menu\"\n            rete-context-menu\n        >\n            ", "\n            ", "\n        </div>\n    "])), this.hide.cancel, this.hide.call, this.searchBar ? html(_templateObject2$5 || (_templateObject2$5 = _taggedTemplateLiteral(["\n                      <block-component>\n                          <search-component\n                              .text=\"", "\"\n                              @change=\"", "\"\n                          ></search-component>\n                      </block-component>\n                  "])), this.filter, function (e) {
          return _this2.filter = e.detail;
        }) : '', this.getItems().map(function (item) {
          return html(_templateObject3$2 || (_templateObject3$2 = _taggedTemplateLiteral(["\n                    <item-component\n                        @select=\"", "\"\n                        .delay=\"", "\"\n                        @hide=\"", "\"\n                        .subitems=\"", "\"\n                    >\n                        ", "\n                    </item-component>\n                "])), item.handler, _this2.delay, _this2.onHide, item.subitems, item.label);
        }));
      }
    }, {
      kind: "field",
      "static": true,
      key: "styles",
      value: function value() {
        return [vars, css(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["\n\n    .menu {\n      padding: 10px;\n      width: var(--width);\n      margin-top: -20px;\n      margin-left: calc(var(--width) / -2);\n    }\n  "])))];
      }
    }]
  };
}, LitElement);

function setup$2(props) {
  var delay = typeof (props === null || props === void 0 ? void 0 : props.delay) === 'undefined' ? 1000 : props.delay;
  return {
    update: function update(context) {
      if (context.data.type === 'contextmenu') {
        return {
          items: context.data.items,
          delay: delay,
          searchBar: context.data.searchBar,
          onHide: context.data.onHide
        };
      }
    },
    render: function render(context) {
      if (context.data.type === 'contextmenu') {
        return {
          component: Menu,
          props: {
            items: context.data.items,
            delay: delay,
            searchBar: context.data.searchBar,
            onHide: context.data.onHide
          }
        };
      }
    }
  };
}

var index$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  setup: setup$2
});

function px(value) {
  return "".concat(value, "px");
}

var _templateObject$4, _templateObject2$4;
function _createSuper$5(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$5(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _isNativeReflectConstruct$5() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _decorate$4(decorators, factory, superClass, mixins) { var api = _getDecoratorsApi$4(); if (mixins) { for (var i = 0; i < mixins.length; i++) { api = mixins[i](api); } } var r = factory(function initialize(O) { api.initializeInstanceElements(O, decorated.elements); }, superClass); var decorated = api.decorateClass(_coalesceClassElements$4(r.d.map(_createElementDescriptor$4)), decorators); api.initializeClassElements(r.F, decorated.elements); return api.runClassFinishers(r.F, decorated.finishers); }
function _getDecoratorsApi$4() { _getDecoratorsApi$4 = function _getDecoratorsApi() { return api; }; var api = { elementsDefinitionOrder: [["method"], ["field"]], initializeInstanceElements: function initializeInstanceElements(O, elements) { ["method", "field"].forEach(function (kind) { elements.forEach(function (element) { if (element.kind === kind && element.placement === "own") { this.defineClassElement(O, element); } }, this); }, this); }, initializeClassElements: function initializeClassElements(F, elements) { var proto = F.prototype; ["method", "field"].forEach(function (kind) { elements.forEach(function (element) { var placement = element.placement; if (element.kind === kind && (placement === "static" || placement === "prototype")) { var receiver = placement === "static" ? F : proto; this.defineClassElement(receiver, element); } }, this); }, this); }, defineClassElement: function defineClassElement(receiver, element) { var descriptor = element.descriptor; if (element.kind === "field") { var initializer = element.initializer; descriptor = { enumerable: descriptor.enumerable, writable: descriptor.writable, configurable: descriptor.configurable, value: initializer === void 0 ? void 0 : initializer.call(receiver) }; } Object.defineProperty(receiver, element.key, descriptor); }, decorateClass: function decorateClass(elements, decorators) { var newElements = []; var finishers = []; var placements = { "static": [], prototype: [], own: [] }; elements.forEach(function (element) { this.addElementPlacement(element, placements); }, this); elements.forEach(function (element) { if (!_hasDecorators$4(element)) return newElements.push(element); var elementFinishersExtras = this.decorateElement(element, placements); newElements.push(elementFinishersExtras.element); newElements.push.apply(newElements, elementFinishersExtras.extras); finishers.push.apply(finishers, elementFinishersExtras.finishers); }, this); if (!decorators) { return { elements: newElements, finishers: finishers }; } var result = this.decorateConstructor(newElements, decorators); finishers.push.apply(finishers, result.finishers); result.finishers = finishers; return result; }, addElementPlacement: function addElementPlacement(element, placements, silent) { var keys = placements[element.placement]; if (!silent && keys.indexOf(element.key) !== -1) { throw new TypeError("Duplicated element (" + element.key + ")"); } keys.push(element.key); }, decorateElement: function decorateElement(element, placements) { var extras = []; var finishers = []; for (var decorators = element.decorators, i = decorators.length - 1; i >= 0; i--) { var keys = placements[element.placement]; keys.splice(keys.indexOf(element.key), 1); var elementObject = this.fromElementDescriptor(element); var elementFinisherExtras = this.toElementFinisherExtras((0, decorators[i])(elementObject) || elementObject); element = elementFinisherExtras.element; this.addElementPlacement(element, placements); if (elementFinisherExtras.finisher) { finishers.push(elementFinisherExtras.finisher); } var newExtras = elementFinisherExtras.extras; if (newExtras) { for (var j = 0; j < newExtras.length; j++) { this.addElementPlacement(newExtras[j], placements); } extras.push.apply(extras, newExtras); } } return { element: element, finishers: finishers, extras: extras }; }, decorateConstructor: function decorateConstructor(elements, decorators) { var finishers = []; for (var i = decorators.length - 1; i >= 0; i--) { var obj = this.fromClassDescriptor(elements); var elementsAndFinisher = this.toClassDescriptor((0, decorators[i])(obj) || obj); if (elementsAndFinisher.finisher !== undefined) { finishers.push(elementsAndFinisher.finisher); } if (elementsAndFinisher.elements !== undefined) { elements = elementsAndFinisher.elements; for (var j = 0; j < elements.length - 1; j++) { for (var k = j + 1; k < elements.length; k++) { if (elements[j].key === elements[k].key && elements[j].placement === elements[k].placement) { throw new TypeError("Duplicated element (" + elements[j].key + ")"); } } } } } return { elements: elements, finishers: finishers }; }, fromElementDescriptor: function fromElementDescriptor(element) { var obj = { kind: element.kind, key: element.key, placement: element.placement, descriptor: element.descriptor }; var desc = { value: "Descriptor", configurable: true }; Object.defineProperty(obj, Symbol.toStringTag, desc); if (element.kind === "field") obj.initializer = element.initializer; return obj; }, toElementDescriptors: function toElementDescriptors(elementObjects) { if (elementObjects === undefined) return; return _toArray(elementObjects).map(function (elementObject) { var element = this.toElementDescriptor(elementObject); this.disallowProperty(elementObject, "finisher", "An element descriptor"); this.disallowProperty(elementObject, "extras", "An element descriptor"); return element; }, this); }, toElementDescriptor: function toElementDescriptor(elementObject) { var kind = String(elementObject.kind); if (kind !== "method" && kind !== "field") { throw new TypeError('An element descriptor\'s .kind property must be either "method" or' + ' "field", but a decorator created an element descriptor with' + ' .kind "' + kind + '"'); } var key = _toPropertyKey$4(elementObject.key); var placement = String(elementObject.placement); if (placement !== "static" && placement !== "prototype" && placement !== "own") { throw new TypeError('An element descriptor\'s .placement property must be one of "static",' + ' "prototype" or "own", but a decorator created an element descriptor' + ' with .placement "' + placement + '"'); } var descriptor = elementObject.descriptor; this.disallowProperty(elementObject, "elements", "An element descriptor"); var element = { kind: kind, key: key, placement: placement, descriptor: Object.assign({}, descriptor) }; if (kind !== "field") { this.disallowProperty(elementObject, "initializer", "A method descriptor"); } else { this.disallowProperty(descriptor, "get", "The property descriptor of a field descriptor"); this.disallowProperty(descriptor, "set", "The property descriptor of a field descriptor"); this.disallowProperty(descriptor, "value", "The property descriptor of a field descriptor"); element.initializer = elementObject.initializer; } return element; }, toElementFinisherExtras: function toElementFinisherExtras(elementObject) { var element = this.toElementDescriptor(elementObject); var finisher = _optionalCallableProperty$4(elementObject, "finisher"); var extras = this.toElementDescriptors(elementObject.extras); return { element: element, finisher: finisher, extras: extras }; }, fromClassDescriptor: function fromClassDescriptor(elements) { var obj = { kind: "class", elements: elements.map(this.fromElementDescriptor, this) }; var desc = { value: "Descriptor", configurable: true }; Object.defineProperty(obj, Symbol.toStringTag, desc); return obj; }, toClassDescriptor: function toClassDescriptor(obj) { var kind = String(obj.kind); if (kind !== "class") { throw new TypeError('A class descriptor\'s .kind property must be "class", but a decorator' + ' created a class descriptor with .kind "' + kind + '"'); } this.disallowProperty(obj, "key", "A class descriptor"); this.disallowProperty(obj, "placement", "A class descriptor"); this.disallowProperty(obj, "descriptor", "A class descriptor"); this.disallowProperty(obj, "initializer", "A class descriptor"); this.disallowProperty(obj, "extras", "A class descriptor"); var finisher = _optionalCallableProperty$4(obj, "finisher"); var elements = this.toElementDescriptors(obj.elements); return { elements: elements, finisher: finisher }; }, runClassFinishers: function runClassFinishers(constructor, finishers) { for (var i = 0; i < finishers.length; i++) { var newConstructor = (0, finishers[i])(constructor); if (newConstructor !== undefined) { if (typeof newConstructor !== "function") { throw new TypeError("Finishers must return a constructor."); } constructor = newConstructor; } } return constructor; }, disallowProperty: function disallowProperty(obj, name, objectType) { if (obj[name] !== undefined) { throw new TypeError(objectType + " can't have a ." + name + " property."); } } }; return api; }
function _createElementDescriptor$4(def) { var key = _toPropertyKey$4(def.key); var descriptor; if (def.kind === "method") { descriptor = { value: def.value, writable: true, configurable: true, enumerable: false }; } else if (def.kind === "get") { descriptor = { get: def.value, configurable: true, enumerable: false }; } else if (def.kind === "set") { descriptor = { set: def.value, configurable: true, enumerable: false }; } else if (def.kind === "field") { descriptor = { configurable: true, writable: true, enumerable: true }; } var element = { kind: def.kind === "field" ? "field" : "method", key: key, placement: def["static"] ? "static" : def.kind === "field" ? "own" : "prototype", descriptor: descriptor }; if (def.decorators) element.decorators = def.decorators; if (def.kind === "field") element.initializer = def.value; return element; }
function _coalesceGetterSetter$4(element, other) { if (element.descriptor.get !== undefined) { other.descriptor.get = element.descriptor.get; } else { other.descriptor.set = element.descriptor.set; } }
function _coalesceClassElements$4(elements) { var newElements = []; var isSameElement = function isSameElement(other) { return other.kind === "method" && other.key === element.key && other.placement === element.placement; }; for (var i = 0; i < elements.length; i++) { var element = elements[i]; var other; if (element.kind === "method" && (other = newElements.find(isSameElement))) { if (_isDataDescriptor$4(element.descriptor) || _isDataDescriptor$4(other.descriptor)) { if (_hasDecorators$4(element) || _hasDecorators$4(other)) { throw new ReferenceError("Duplicated methods (" + element.key + ") can't be decorated."); } other.descriptor = element.descriptor; } else { if (_hasDecorators$4(element)) { if (_hasDecorators$4(other)) { throw new ReferenceError("Decorators can't be placed on different accessors with for " + "the same property (" + element.key + ")."); } other.decorators = element.decorators; } _coalesceGetterSetter$4(element, other); } } else { newElements.push(element); } } return newElements; }
function _hasDecorators$4(element) { return element.decorators && element.decorators.length; }
function _isDataDescriptor$4(desc) { return desc !== undefined && !(desc.value === undefined && desc.writable === undefined); }
function _optionalCallableProperty$4(obj, name) { var value = obj[name]; if (value !== undefined && typeof value !== "function") { throw new TypeError("Expected '" + name + "' to be a function"); } return value; }
function _toPropertyKey$4(arg) { var key = _toPrimitive$4(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive$4(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var MiniNode = _decorate$4(null, function (_initialize, _LitElement) {
  var MiniNode = /*#__PURE__*/function (_LitElement2) {
    _inherits(MiniNode, _LitElement2);
    var _super = _createSuper$5(MiniNode);
    function MiniNode() {
      var _this;
      _classCallCheck(this, MiniNode);
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _super.call.apply(_super, [this].concat(args));
      _initialize(_assertThisInitialized(_this));
      return _this;
    }
    return _createClass(MiniNode);
  }(_LitElement);
  return {
    F: MiniNode,
    d: [{
      kind: "field",
      decorators: [property({
        type: Number
      })],
      key: "left",
      value: function value() {
        return 0;
      }
    }, {
      kind: "field",
      decorators: [property({
        type: Number
      })],
      key: "top",
      value: function value() {
        return 0;
      }
    }, {
      kind: "field",
      decorators: [property({
        type: Number
      })],
      key: "width",
      value: function value() {
        return 0;
      }
    }, {
      kind: "field",
      decorators: [property({
        type: Number
      })],
      key: "height",
      value: function value() {
        return 0;
      }
    }, {
      kind: "field",
      "static": true,
      key: "styles",
      value: function value() {
        return css(_templateObject$4 || (_templateObject$4 = _taggedTemplateLiteral(["\n    .mini-node {\n      position: absolute;\n      background: rgba(110, 136, 255, 0.8);\n      border: 1px solid rgb(192 206 212 / 60%);\n    }\n  "])));
      }
    }, {
      kind: "get",
      key: "styles",
      value: function styles() {
        return {
          left: px(this.left),
          top: px(this.top),
          width: px(this.width),
          height: px(this.height)
        };
      }
    }, {
      kind: "method",
      key: "render",
      value: function render() {
        return html(_templateObject2$4 || (_templateObject2$4 = _taggedTemplateLiteral(["\n      <div class=\"mini-node\" style=", "></div>\n    "])), styleMap(this.styles));
      }
    }]
  };
}, LitElement);
customElements.define('mini-node', MiniNode);

function ownKeys$3(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread$3(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$3(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$3(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function useDrag(translate, getPointer) {
  return {
    start: function start(e) {
      var previous = _objectSpread$3({}, getPointer(e));
      function move(moveEvent) {
        var current = _objectSpread$3({}, getPointer(moveEvent));
        var dx = current.x - previous.x;
        var dy = current.y - previous.y;
        previous = current;
        translate(dx, dy);
      }
      function up() {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
      }
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
    }
  };
}

var _templateObject$3, _templateObject2$3;
function _createSuper$4(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$4(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _isNativeReflectConstruct$4() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _decorate$3(decorators, factory, superClass, mixins) { var api = _getDecoratorsApi$3(); if (mixins) { for (var i = 0; i < mixins.length; i++) { api = mixins[i](api); } } var r = factory(function initialize(O) { api.initializeInstanceElements(O, decorated.elements); }, superClass); var decorated = api.decorateClass(_coalesceClassElements$3(r.d.map(_createElementDescriptor$3)), decorators); api.initializeClassElements(r.F, decorated.elements); return api.runClassFinishers(r.F, decorated.finishers); }
function _getDecoratorsApi$3() { _getDecoratorsApi$3 = function _getDecoratorsApi() { return api; }; var api = { elementsDefinitionOrder: [["method"], ["field"]], initializeInstanceElements: function initializeInstanceElements(O, elements) { ["method", "field"].forEach(function (kind) { elements.forEach(function (element) { if (element.kind === kind && element.placement === "own") { this.defineClassElement(O, element); } }, this); }, this); }, initializeClassElements: function initializeClassElements(F, elements) { var proto = F.prototype; ["method", "field"].forEach(function (kind) { elements.forEach(function (element) { var placement = element.placement; if (element.kind === kind && (placement === "static" || placement === "prototype")) { var receiver = placement === "static" ? F : proto; this.defineClassElement(receiver, element); } }, this); }, this); }, defineClassElement: function defineClassElement(receiver, element) { var descriptor = element.descriptor; if (element.kind === "field") { var initializer = element.initializer; descriptor = { enumerable: descriptor.enumerable, writable: descriptor.writable, configurable: descriptor.configurable, value: initializer === void 0 ? void 0 : initializer.call(receiver) }; } Object.defineProperty(receiver, element.key, descriptor); }, decorateClass: function decorateClass(elements, decorators) { var newElements = []; var finishers = []; var placements = { "static": [], prototype: [], own: [] }; elements.forEach(function (element) { this.addElementPlacement(element, placements); }, this); elements.forEach(function (element) { if (!_hasDecorators$3(element)) return newElements.push(element); var elementFinishersExtras = this.decorateElement(element, placements); newElements.push(elementFinishersExtras.element); newElements.push.apply(newElements, elementFinishersExtras.extras); finishers.push.apply(finishers, elementFinishersExtras.finishers); }, this); if (!decorators) { return { elements: newElements, finishers: finishers }; } var result = this.decorateConstructor(newElements, decorators); finishers.push.apply(finishers, result.finishers); result.finishers = finishers; return result; }, addElementPlacement: function addElementPlacement(element, placements, silent) { var keys = placements[element.placement]; if (!silent && keys.indexOf(element.key) !== -1) { throw new TypeError("Duplicated element (" + element.key + ")"); } keys.push(element.key); }, decorateElement: function decorateElement(element, placements) { var extras = []; var finishers = []; for (var decorators = element.decorators, i = decorators.length - 1; i >= 0; i--) { var keys = placements[element.placement]; keys.splice(keys.indexOf(element.key), 1); var elementObject = this.fromElementDescriptor(element); var elementFinisherExtras = this.toElementFinisherExtras((0, decorators[i])(elementObject) || elementObject); element = elementFinisherExtras.element; this.addElementPlacement(element, placements); if (elementFinisherExtras.finisher) { finishers.push(elementFinisherExtras.finisher); } var newExtras = elementFinisherExtras.extras; if (newExtras) { for (var j = 0; j < newExtras.length; j++) { this.addElementPlacement(newExtras[j], placements); } extras.push.apply(extras, newExtras); } } return { element: element, finishers: finishers, extras: extras }; }, decorateConstructor: function decorateConstructor(elements, decorators) { var finishers = []; for (var i = decorators.length - 1; i >= 0; i--) { var obj = this.fromClassDescriptor(elements); var elementsAndFinisher = this.toClassDescriptor((0, decorators[i])(obj) || obj); if (elementsAndFinisher.finisher !== undefined) { finishers.push(elementsAndFinisher.finisher); } if (elementsAndFinisher.elements !== undefined) { elements = elementsAndFinisher.elements; for (var j = 0; j < elements.length - 1; j++) { for (var k = j + 1; k < elements.length; k++) { if (elements[j].key === elements[k].key && elements[j].placement === elements[k].placement) { throw new TypeError("Duplicated element (" + elements[j].key + ")"); } } } } } return { elements: elements, finishers: finishers }; }, fromElementDescriptor: function fromElementDescriptor(element) { var obj = { kind: element.kind, key: element.key, placement: element.placement, descriptor: element.descriptor }; var desc = { value: "Descriptor", configurable: true }; Object.defineProperty(obj, Symbol.toStringTag, desc); if (element.kind === "field") obj.initializer = element.initializer; return obj; }, toElementDescriptors: function toElementDescriptors(elementObjects) { if (elementObjects === undefined) return; return _toArray(elementObjects).map(function (elementObject) { var element = this.toElementDescriptor(elementObject); this.disallowProperty(elementObject, "finisher", "An element descriptor"); this.disallowProperty(elementObject, "extras", "An element descriptor"); return element; }, this); }, toElementDescriptor: function toElementDescriptor(elementObject) { var kind = String(elementObject.kind); if (kind !== "method" && kind !== "field") { throw new TypeError('An element descriptor\'s .kind property must be either "method" or' + ' "field", but a decorator created an element descriptor with' + ' .kind "' + kind + '"'); } var key = _toPropertyKey$3(elementObject.key); var placement = String(elementObject.placement); if (placement !== "static" && placement !== "prototype" && placement !== "own") { throw new TypeError('An element descriptor\'s .placement property must be one of "static",' + ' "prototype" or "own", but a decorator created an element descriptor' + ' with .placement "' + placement + '"'); } var descriptor = elementObject.descriptor; this.disallowProperty(elementObject, "elements", "An element descriptor"); var element = { kind: kind, key: key, placement: placement, descriptor: Object.assign({}, descriptor) }; if (kind !== "field") { this.disallowProperty(elementObject, "initializer", "A method descriptor"); } else { this.disallowProperty(descriptor, "get", "The property descriptor of a field descriptor"); this.disallowProperty(descriptor, "set", "The property descriptor of a field descriptor"); this.disallowProperty(descriptor, "value", "The property descriptor of a field descriptor"); element.initializer = elementObject.initializer; } return element; }, toElementFinisherExtras: function toElementFinisherExtras(elementObject) { var element = this.toElementDescriptor(elementObject); var finisher = _optionalCallableProperty$3(elementObject, "finisher"); var extras = this.toElementDescriptors(elementObject.extras); return { element: element, finisher: finisher, extras: extras }; }, fromClassDescriptor: function fromClassDescriptor(elements) { var obj = { kind: "class", elements: elements.map(this.fromElementDescriptor, this) }; var desc = { value: "Descriptor", configurable: true }; Object.defineProperty(obj, Symbol.toStringTag, desc); return obj; }, toClassDescriptor: function toClassDescriptor(obj) { var kind = String(obj.kind); if (kind !== "class") { throw new TypeError('A class descriptor\'s .kind property must be "class", but a decorator' + ' created a class descriptor with .kind "' + kind + '"'); } this.disallowProperty(obj, "key", "A class descriptor"); this.disallowProperty(obj, "placement", "A class descriptor"); this.disallowProperty(obj, "descriptor", "A class descriptor"); this.disallowProperty(obj, "initializer", "A class descriptor"); this.disallowProperty(obj, "extras", "A class descriptor"); var finisher = _optionalCallableProperty$3(obj, "finisher"); var elements = this.toElementDescriptors(obj.elements); return { elements: elements, finisher: finisher }; }, runClassFinishers: function runClassFinishers(constructor, finishers) { for (var i = 0; i < finishers.length; i++) { var newConstructor = (0, finishers[i])(constructor); if (newConstructor !== undefined) { if (typeof newConstructor !== "function") { throw new TypeError("Finishers must return a constructor."); } constructor = newConstructor; } } return constructor; }, disallowProperty: function disallowProperty(obj, name, objectType) { if (obj[name] !== undefined) { throw new TypeError(objectType + " can't have a ." + name + " property."); } } }; return api; }
function _createElementDescriptor$3(def) { var key = _toPropertyKey$3(def.key); var descriptor; if (def.kind === "method") { descriptor = { value: def.value, writable: true, configurable: true, enumerable: false }; } else if (def.kind === "get") { descriptor = { get: def.value, configurable: true, enumerable: false }; } else if (def.kind === "set") { descriptor = { set: def.value, configurable: true, enumerable: false }; } else if (def.kind === "field") { descriptor = { configurable: true, writable: true, enumerable: true }; } var element = { kind: def.kind === "field" ? "field" : "method", key: key, placement: def["static"] ? "static" : def.kind === "field" ? "own" : "prototype", descriptor: descriptor }; if (def.decorators) element.decorators = def.decorators; if (def.kind === "field") element.initializer = def.value; return element; }
function _coalesceGetterSetter$3(element, other) { if (element.descriptor.get !== undefined) { other.descriptor.get = element.descriptor.get; } else { other.descriptor.set = element.descriptor.set; } }
function _coalesceClassElements$3(elements) { var newElements = []; var isSameElement = function isSameElement(other) { return other.kind === "method" && other.key === element.key && other.placement === element.placement; }; for (var i = 0; i < elements.length; i++) { var element = elements[i]; var other; if (element.kind === "method" && (other = newElements.find(isSameElement))) { if (_isDataDescriptor$3(element.descriptor) || _isDataDescriptor$3(other.descriptor)) { if (_hasDecorators$3(element) || _hasDecorators$3(other)) { throw new ReferenceError("Duplicated methods (" + element.key + ") can't be decorated."); } other.descriptor = element.descriptor; } else { if (_hasDecorators$3(element)) { if (_hasDecorators$3(other)) { throw new ReferenceError("Decorators can't be placed on different accessors with for " + "the same property (" + element.key + ")."); } other.decorators = element.decorators; } _coalesceGetterSetter$3(element, other); } } else { newElements.push(element); } } return newElements; }
function _hasDecorators$3(element) { return element.decorators && element.decorators.length; }
function _isDataDescriptor$3(desc) { return desc !== undefined && !(desc.value === undefined && desc.writable === undefined); }
function _optionalCallableProperty$3(obj, name) { var value = obj[name]; if (value !== undefined && typeof value !== "function") { throw new TypeError("Expected '" + name + "' to be a function"); } return value; }
function _toPropertyKey$3(arg) { var key = _toPrimitive$3(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive$3(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var MiniViewport = _decorate$3(null, function (_initialize, _LitElement) {
  var MiniViewport = /*#__PURE__*/function (_LitElement2) {
    _inherits(MiniViewport, _LitElement2);
    var _super = _createSuper$4(MiniViewport);
    function MiniViewport() {
      var _this;
      _classCallCheck(this, MiniViewport);
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _super.call.apply(_super, [this].concat(args));
      _initialize(_assertThisInitialized(_this));
      return _this;
    }
    return _createClass(MiniViewport);
  }(_LitElement);
  return {
    F: MiniViewport,
    d: [{
      kind: "field",
      decorators: [property({
        type: Number
      })],
      key: "left",
      value: function value() {
        return 0;
      }
    }, {
      kind: "field",
      decorators: [property({
        type: Number
      })],
      key: "top",
      value: function value() {
        return 0;
      }
    }, {
      kind: "field",
      decorators: [property({
        type: Number
      })],
      key: "width",
      value: function value() {
        return 0;
      }
    }, {
      kind: "field",
      decorators: [property({
        type: Number
      })],
      key: "height",
      value: function value() {
        return 0;
      }
    }, {
      kind: "field",
      decorators: [property({
        type: Number
      })],
      key: "containerWidth",
      value: function value() {
        return 0;
      }
    }, {
      kind: "field",
      decorators: [property({
        type: Function
      })],
      key: "reTranslate",
      value: function value() {
        return function (_x, _y) {
          throw new Error('TRANSLATE NOT SET PROPERLY IN MiniViewport');
        };
      }
    }, {
      kind: "field",
      key: "drag",
      value: function value() {
        return useDrag(this.onDrag, function (e) {
          return {
            x: e.pageX,
            y: e.pageY
          };
        });
      }
    }, {
      kind: "method",
      key: "scale",
      value:
      // eslint-disable-next-line @typescript-eslint/naming-convention

      function scale(v) {
        return v * this.containerWidth;
      }
    }, {
      kind: "method",
      key: "invert",
      value: function invert(v) {
        return v / this.containerWidth;
      }
    }, {
      kind: "method",
      key: "onDrag",
      value: function onDrag(dx, dy) {
        this.reTranslate(this.invert(-dx), this.invert(-dy));
      }
    }, {
      kind: "get",
      key: "styles",
      value: function styles() {
        return {
          left: px(this.scale(this.left)),
          top: px(this.scale(this.top)),
          width: px(this.scale(this.width)),
          height: px(this.scale(this.height))
        };
      }
    }, {
      kind: "method",
      key: "render",
      value: function render() {
        return html(_templateObject$3 || (_templateObject$3 = _taggedTemplateLiteral(["\n      <div\n        class=\"mini-viewport\"\n        @pointerdown=", "\n        style=", "\n        data-testid=\"minimap-viewport\"\n      ></div>\n    "])), this.drag.start, this.styles);
      }
    }, {
      kind: "field",
      "static": true,
      key: "styles",
      value: function value() {
        return css(_templateObject2$3 || (_templateObject2$3 = _taggedTemplateLiteral(["\n    .mini-viewport {\n      position: absolute;\n      background: rgba(255, 251, 128, 0.32);\n      border: 1px solid #ffe52b;\n    }\n  "])));
      }
    }]
  };
}, LitElement);
customElements.define('mini-viewport', MiniViewport);

var getOwnPropertyNames = Object.getOwnPropertyNames, getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
/**
 * Combine two comparators into a single comparators.
 */
function combineComparators(comparatorA, comparatorB) {
    return function isEqual(a, b, state) {
        return comparatorA(a, b, state) && comparatorB(a, b, state);
    };
}
/**
 * Wrap the provided `areItemsEqual` method to manage the circular state, allowing
 * for circular references to be safely included in the comparison without creating
 * stack overflows.
 */
function createIsCircular(areItemsEqual) {
    return function isCircular(a, b, state) {
        if (!a || !b || typeof a !== 'object' || typeof b !== 'object') {
            return areItemsEqual(a, b, state);
        }
        var cache = state.cache;
        var cachedA = cache.get(a);
        var cachedB = cache.get(b);
        if (cachedA && cachedB) {
            return cachedA === b && cachedB === a;
        }
        cache.set(a, b);
        cache.set(b, a);
        var result = areItemsEqual(a, b, state);
        cache.delete(a);
        cache.delete(b);
        return result;
    };
}
/**
 * Get the properties to strictly examine, which include both own properties that are
 * not enumerable and symbol properties.
 */
function getStrictProperties(object) {
    return getOwnPropertyNames(object).concat(getOwnPropertySymbols(object));
}
/**
 * Whether the object contains the property passed as an own property.
 */
var hasOwn = Object.hasOwn ||
    (function (object, property) {
        return hasOwnProperty.call(object, property);
    });
/**
 * Whether the values passed are strictly equal or both NaN.
 */
function sameValueZeroEqual(a, b) {
    return a || b ? a === b : a === b || (a !== a && b !== b);
}

var OWNER = '_owner';
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor, keys = Object.keys;
/**
 * Whether the arrays are equal in value.
 */
function areArraysEqual(a, b, state) {
    var index = a.length;
    if (b.length !== index) {
        return false;
    }
    while (index-- > 0) {
        if (!state.equals(a[index], b[index], index, index, a, b, state)) {
            return false;
        }
    }
    return true;
}
/**
 * Whether the dates passed are equal in value.
 */
function areDatesEqual(a, b) {
    return sameValueZeroEqual(a.getTime(), b.getTime());
}
/**
 * Whether the `Map`s are equal in value.
 */
function areMapsEqual(a, b, state) {
    if (a.size !== b.size) {
        return false;
    }
    var matchedIndices = {};
    var aIterable = a.entries();
    var index = 0;
    var aResult;
    var bResult;
    while ((aResult = aIterable.next())) {
        if (aResult.done) {
            break;
        }
        var bIterable = b.entries();
        var hasMatch = false;
        var matchIndex = 0;
        while ((bResult = bIterable.next())) {
            if (bResult.done) {
                break;
            }
            var _a = aResult.value, aKey = _a[0], aValue = _a[1];
            var _b = bResult.value, bKey = _b[0], bValue = _b[1];
            if (!hasMatch &&
                !matchedIndices[matchIndex] &&
                (hasMatch =
                    state.equals(aKey, bKey, index, matchIndex, a, b, state) &&
                        state.equals(aValue, bValue, aKey, bKey, a, b, state))) {
                matchedIndices[matchIndex] = true;
            }
            matchIndex++;
        }
        if (!hasMatch) {
            return false;
        }
        index++;
    }
    return true;
}
/**
 * Whether the objects are equal in value.
 */
function areObjectsEqual(a, b, state) {
    var properties = keys(a);
    var index = properties.length;
    if (keys(b).length !== index) {
        return false;
    }
    var property;
    // Decrementing `while` showed faster results than either incrementing or
    // decrementing `for` loop and than an incrementing `while` loop. Declarative
    // methods like `some` / `every` were not used to avoid incurring the garbage
    // cost of anonymous callbacks.
    while (index-- > 0) {
        property = properties[index];
        if (property === OWNER &&
            (a.$$typeof || b.$$typeof) &&
            a.$$typeof !== b.$$typeof) {
            return false;
        }
        if (!hasOwn(b, property) ||
            !state.equals(a[property], b[property], property, property, a, b, state)) {
            return false;
        }
    }
    return true;
}
/**
 * Whether the objects are equal in value with strict property checking.
 */
function areObjectsEqualStrict(a, b, state) {
    var properties = getStrictProperties(a);
    var index = properties.length;
    if (getStrictProperties(b).length !== index) {
        return false;
    }
    var property;
    var descriptorA;
    var descriptorB;
    // Decrementing `while` showed faster results than either incrementing or
    // decrementing `for` loop and than an incrementing `while` loop. Declarative
    // methods like `some` / `every` were not used to avoid incurring the garbage
    // cost of anonymous callbacks.
    while (index-- > 0) {
        property = properties[index];
        if (property === OWNER &&
            (a.$$typeof || b.$$typeof) &&
            a.$$typeof !== b.$$typeof) {
            return false;
        }
        if (!hasOwn(b, property)) {
            return false;
        }
        if (!state.equals(a[property], b[property], property, property, a, b, state)) {
            return false;
        }
        descriptorA = getOwnPropertyDescriptor(a, property);
        descriptorB = getOwnPropertyDescriptor(b, property);
        if ((descriptorA || descriptorB) &&
            (!descriptorA ||
                !descriptorB ||
                descriptorA.configurable !== descriptorB.configurable ||
                descriptorA.enumerable !== descriptorB.enumerable ||
                descriptorA.writable !== descriptorB.writable)) {
            return false;
        }
    }
    return true;
}
/**
 * Whether the primitive wrappers passed are equal in value.
 */
function arePrimitiveWrappersEqual(a, b) {
    return sameValueZeroEqual(a.valueOf(), b.valueOf());
}
/**
 * Whether the regexps passed are equal in value.
 */
function areRegExpsEqual(a, b) {
    return a.source === b.source && a.flags === b.flags;
}
/**
 * Whether the `Set`s are equal in value.
 */
function areSetsEqual(a, b, state) {
    if (a.size !== b.size) {
        return false;
    }
    var matchedIndices = {};
    var aIterable = a.values();
    var aResult;
    var bResult;
    while ((aResult = aIterable.next())) {
        if (aResult.done) {
            break;
        }
        var bIterable = b.values();
        var hasMatch = false;
        var matchIndex = 0;
        while ((bResult = bIterable.next())) {
            if (bResult.done) {
                break;
            }
            if (!hasMatch &&
                !matchedIndices[matchIndex] &&
                (hasMatch = state.equals(aResult.value, bResult.value, aResult.value, bResult.value, a, b, state))) {
                matchedIndices[matchIndex] = true;
            }
            matchIndex++;
        }
        if (!hasMatch) {
            return false;
        }
    }
    return true;
}
/**
 * Whether the TypedArray instances are equal in value.
 */
function areTypedArraysEqual(a, b) {
    var index = a.length;
    if (b.length !== index) {
        return false;
    }
    while (index-- > 0) {
        if (a[index] !== b[index]) {
            return false;
        }
    }
    return true;
}

var ARGUMENTS_TAG = '[object Arguments]';
var BOOLEAN_TAG = '[object Boolean]';
var DATE_TAG = '[object Date]';
var MAP_TAG = '[object Map]';
var NUMBER_TAG = '[object Number]';
var OBJECT_TAG = '[object Object]';
var REG_EXP_TAG = '[object RegExp]';
var SET_TAG = '[object Set]';
var STRING_TAG = '[object String]';
var isArray = Array.isArray;
var isTypedArray = typeof ArrayBuffer === 'function' && ArrayBuffer.isView
    ? ArrayBuffer.isView
    : null;
var assign = Object.assign;
var getTag = Object.prototype.toString.call.bind(Object.prototype.toString);
/**
 * Create a comparator method based on the type-specific equality comparators passed.
 */
function createEqualityComparator(_a) {
    var areArraysEqual = _a.areArraysEqual, areDatesEqual = _a.areDatesEqual, areMapsEqual = _a.areMapsEqual, areObjectsEqual = _a.areObjectsEqual, arePrimitiveWrappersEqual = _a.arePrimitiveWrappersEqual, areRegExpsEqual = _a.areRegExpsEqual, areSetsEqual = _a.areSetsEqual, areTypedArraysEqual = _a.areTypedArraysEqual;
    /**
     * compare the value of the two objects and return true if they are equivalent in values
     */
    return function comparator(a, b, state) {
        // If the items are strictly equal, no need to do a value comparison.
        if (a === b) {
            return true;
        }
        // If the items are not non-nullish objects, then the only possibility
        // of them being equal but not strictly is if they are both `NaN`. Since
        // `NaN` is uniquely not equal to itself, we can use self-comparison of
        // both objects, which is faster than `isNaN()`.
        if (a == null ||
            b == null ||
            typeof a !== 'object' ||
            typeof b !== 'object') {
            return a !== a && b !== b;
        }
        var constructor = a.constructor;
        // Checks are listed in order of commonality of use-case:
        //   1. Common complex object types (plain object, array)
        //   2. Common data values (date, regexp)
        //   3. Less-common complex object types (map, set)
        //   4. Less-common data values (promise, primitive wrappers)
        // Inherently this is both subjective and assumptive, however
        // when reviewing comparable libraries in the wild this order
        // appears to be generally consistent.
        // Constructors should match, otherwise there is potential for false positives
        // between class and subclass or custom object and POJO.
        if (constructor !== b.constructor) {
            return false;
        }
        // `isPlainObject` only checks against the object's own realm. Cross-realm
        // comparisons are rare, and will be handled in the ultimate fallback, so
        // we can avoid capturing the string tag.
        if (constructor === Object) {
            return areObjectsEqual(a, b, state);
        }
        // `isArray()` works on subclasses and is cross-realm, so we can avoid capturing
        // the string tag or doing an `instanceof` check.
        if (isArray(a)) {
            return areArraysEqual(a, b, state);
        }
        // `isTypedArray()` works on all possible TypedArray classes, so we can avoid
        // capturing the string tag or comparing against all possible constructors.
        if (isTypedArray != null && isTypedArray(a)) {
            return areTypedArraysEqual(a, b, state);
        }
        // Try to fast-path equality checks for other complex object types in the
        // same realm to avoid capturing the string tag. Strict equality is used
        // instead of `instanceof` because it is more performant for the common
        // use-case. If someone is subclassing a native class, it will be handled
        // with the string tag comparison.
        if (constructor === Date) {
            return areDatesEqual(a, b, state);
        }
        if (constructor === RegExp) {
            return areRegExpsEqual(a, b, state);
        }
        if (constructor === Map) {
            return areMapsEqual(a, b, state);
        }
        if (constructor === Set) {
            return areSetsEqual(a, b, state);
        }
        // Since this is a custom object, capture the string tag to determing its type.
        // This is reasonably performant in modern environments like v8 and SpiderMonkey.
        var tag = getTag(a);
        if (tag === DATE_TAG) {
            return areDatesEqual(a, b, state);
        }
        if (tag === REG_EXP_TAG) {
            return areRegExpsEqual(a, b, state);
        }
        if (tag === MAP_TAG) {
            return areMapsEqual(a, b, state);
        }
        if (tag === SET_TAG) {
            return areSetsEqual(a, b, state);
        }
        if (tag === OBJECT_TAG) {
            // The exception for value comparison is custom `Promise`-like class instances. These should
            // be treated the same as standard `Promise` objects, which means strict equality, and if
            // it reaches this point then that strict equality comparison has already failed.
            return (typeof a.then !== 'function' &&
                typeof b.then !== 'function' &&
                areObjectsEqual(a, b, state));
        }
        // If an arguments tag, it should be treated as a standard object.
        if (tag === ARGUMENTS_TAG) {
            return areObjectsEqual(a, b, state);
        }
        // As the penultimate fallback, check if the values passed are primitive wrappers. This
        // is very rare in modern JS, which is why it is deprioritized compared to all other object
        // types.
        if (tag === BOOLEAN_TAG || tag === NUMBER_TAG || tag === STRING_TAG) {
            return arePrimitiveWrappersEqual(a, b, state);
        }
        // If not matching any tags that require a specific type of comparison, then we hard-code false because
        // the only thing remaining is strict equality, which has already been compared. This is for a few reasons:
        //   - Certain types that cannot be introspected (e.g., `WeakMap`). For these types, this is the only
        //     comparison that can be made.
        //   - For types that can be introspected, but rarely have requirements to be compared
        //     (`ArrayBuffer`, `DataView`, etc.), the cost is avoided to prioritize the common
        //     use-cases (may be included in a future release, if requested enough).
        //   - For types that can be introspected but do not have an objective definition of what
        //     equality is (`Error`, etc.), the subjective decision is to be conservative and strictly compare.
        // In all cases, these decisions should be reevaluated based on changes to the language and
        // common development practices.
        return false;
    };
}
/**
 * Create the configuration object used for building comparators.
 */
function createEqualityComparatorConfig(_a) {
    var circular = _a.circular, createCustomConfig = _a.createCustomConfig, strict = _a.strict;
    var config = {
        areArraysEqual: strict
            ? areObjectsEqualStrict
            : areArraysEqual,
        areDatesEqual: areDatesEqual,
        areMapsEqual: strict
            ? combineComparators(areMapsEqual, areObjectsEqualStrict)
            : areMapsEqual,
        areObjectsEqual: strict
            ? areObjectsEqualStrict
            : areObjectsEqual,
        arePrimitiveWrappersEqual: arePrimitiveWrappersEqual,
        areRegExpsEqual: areRegExpsEqual,
        areSetsEqual: strict
            ? combineComparators(areSetsEqual, areObjectsEqualStrict)
            : areSetsEqual,
        areTypedArraysEqual: strict
            ? areObjectsEqualStrict
            : areTypedArraysEqual,
    };
    if (createCustomConfig) {
        config = assign({}, config, createCustomConfig(config));
    }
    if (circular) {
        var areArraysEqual$1 = createIsCircular(config.areArraysEqual);
        var areMapsEqual$1 = createIsCircular(config.areMapsEqual);
        var areObjectsEqual$1 = createIsCircular(config.areObjectsEqual);
        var areSetsEqual$1 = createIsCircular(config.areSetsEqual);
        config = assign({}, config, {
            areArraysEqual: areArraysEqual$1,
            areMapsEqual: areMapsEqual$1,
            areObjectsEqual: areObjectsEqual$1,
            areSetsEqual: areSetsEqual$1,
        });
    }
    return config;
}
/**
 * Default equality comparator pass-through, used as the standard `isEqual` creator for
 * use inside the built comparator.
 */
function createInternalEqualityComparator(compare) {
    return function (a, b, _indexOrKeyA, _indexOrKeyB, _parentA, _parentB, state) {
        return compare(a, b, state);
    };
}
/**
 * Create the `isEqual` function used by the consuming application.
 */
function createIsEqual(_a) {
    var circular = _a.circular, comparator = _a.comparator, createState = _a.createState, equals = _a.equals, strict = _a.strict;
    if (createState) {
        return function isEqual(a, b) {
            var _a = createState(), _b = _a.cache, cache = _b === void 0 ? circular ? new WeakMap() : undefined : _b, meta = _a.meta;
            return comparator(a, b, {
                cache: cache,
                equals: equals,
                meta: meta,
                strict: strict,
            });
        };
    }
    if (circular) {
        return function isEqual(a, b) {
            return comparator(a, b, {
                cache: new WeakMap(),
                equals: equals,
                meta: undefined,
                strict: strict,
            });
        };
    }
    var state = {
        cache: undefined,
        equals: equals,
        meta: undefined,
        strict: strict,
    };
    return function isEqual(a, b) {
        return comparator(a, b, state);
    };
}

/**
 * Whether the items passed are deeply-equal in value.
 */
var deepEqual = createCustomEqual();
/**
 * Whether the items passed are deeply-equal in value based on strict comparison.
 */
createCustomEqual({ strict: true });
/**
 * Whether the items passed are deeply-equal in value, including circular references.
 */
createCustomEqual({ circular: true });
/**
 * Whether the items passed are deeply-equal in value, including circular references,
 * based on strict comparison.
 */
createCustomEqual({
    circular: true,
    strict: true,
});
/**
 * Whether the items passed are shallowly-equal in value.
 */
createCustomEqual({
    createInternalComparator: function () { return sameValueZeroEqual; },
});
/**
 * Whether the items passed are shallowly-equal in value based on strict comparison
 */
createCustomEqual({
    strict: true,
    createInternalComparator: function () { return sameValueZeroEqual; },
});
/**
 * Whether the items passed are shallowly-equal in value, including circular references.
 */
createCustomEqual({
    circular: true,
    createInternalComparator: function () { return sameValueZeroEqual; },
});
/**
 * Whether the items passed are shallowly-equal in value, including circular references,
 * based on strict comparison.
 */
createCustomEqual({
    circular: true,
    createInternalComparator: function () { return sameValueZeroEqual; },
    strict: true,
});
/**
 * Create a custom equality comparison method.
 *
 * This can be done to create very targeted comparisons in extreme hot-path scenarios
 * where the standard methods are not performant enough, but can also be used to provide
 * support for legacy environments that do not support expected features like
 * `RegExp.prototype.flags` out of the box.
 */
function createCustomEqual(options) {
    if (options === void 0) { options = {}; }
    var _a = options.circular, circular = _a === void 0 ? false : _a, createCustomInternalComparator = options.createInternalComparator, createState = options.createState, _b = options.strict, strict = _b === void 0 ? false : _b;
    var config = createEqualityComparatorConfig(options);
    var comparator = createEqualityComparator(config);
    var equals = createCustomInternalComparator
        ? createCustomInternalComparator(comparator)
        : createInternalEqualityComparator(comparator);
    return createIsEqual({ circular: circular, comparator: comparator, createState: createState, equals: equals, strict: strict });
}

var _templateObject$2, _templateObject2$2, _templateObject3$1;
function _createSuper$3(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$3(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _isNativeReflectConstruct$3() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _decorate$2(decorators, factory, superClass, mixins) { var api = _getDecoratorsApi$2(); if (mixins) { for (var i = 0; i < mixins.length; i++) { api = mixins[i](api); } } var r = factory(function initialize(O) { api.initializeInstanceElements(O, decorated.elements); }, superClass); var decorated = api.decorateClass(_coalesceClassElements$2(r.d.map(_createElementDescriptor$2)), decorators); api.initializeClassElements(r.F, decorated.elements); return api.runClassFinishers(r.F, decorated.finishers); }
function _getDecoratorsApi$2() { _getDecoratorsApi$2 = function _getDecoratorsApi() { return api; }; var api = { elementsDefinitionOrder: [["method"], ["field"]], initializeInstanceElements: function initializeInstanceElements(O, elements) { ["method", "field"].forEach(function (kind) { elements.forEach(function (element) { if (element.kind === kind && element.placement === "own") { this.defineClassElement(O, element); } }, this); }, this); }, initializeClassElements: function initializeClassElements(F, elements) { var proto = F.prototype; ["method", "field"].forEach(function (kind) { elements.forEach(function (element) { var placement = element.placement; if (element.kind === kind && (placement === "static" || placement === "prototype")) { var receiver = placement === "static" ? F : proto; this.defineClassElement(receiver, element); } }, this); }, this); }, defineClassElement: function defineClassElement(receiver, element) { var descriptor = element.descriptor; if (element.kind === "field") { var initializer = element.initializer; descriptor = { enumerable: descriptor.enumerable, writable: descriptor.writable, configurable: descriptor.configurable, value: initializer === void 0 ? void 0 : initializer.call(receiver) }; } Object.defineProperty(receiver, element.key, descriptor); }, decorateClass: function decorateClass(elements, decorators) { var newElements = []; var finishers = []; var placements = { "static": [], prototype: [], own: [] }; elements.forEach(function (element) { this.addElementPlacement(element, placements); }, this); elements.forEach(function (element) { if (!_hasDecorators$2(element)) return newElements.push(element); var elementFinishersExtras = this.decorateElement(element, placements); newElements.push(elementFinishersExtras.element); newElements.push.apply(newElements, elementFinishersExtras.extras); finishers.push.apply(finishers, elementFinishersExtras.finishers); }, this); if (!decorators) { return { elements: newElements, finishers: finishers }; } var result = this.decorateConstructor(newElements, decorators); finishers.push.apply(finishers, result.finishers); result.finishers = finishers; return result; }, addElementPlacement: function addElementPlacement(element, placements, silent) { var keys = placements[element.placement]; if (!silent && keys.indexOf(element.key) !== -1) { throw new TypeError("Duplicated element (" + element.key + ")"); } keys.push(element.key); }, decorateElement: function decorateElement(element, placements) { var extras = []; var finishers = []; for (var decorators = element.decorators, i = decorators.length - 1; i >= 0; i--) { var keys = placements[element.placement]; keys.splice(keys.indexOf(element.key), 1); var elementObject = this.fromElementDescriptor(element); var elementFinisherExtras = this.toElementFinisherExtras((0, decorators[i])(elementObject) || elementObject); element = elementFinisherExtras.element; this.addElementPlacement(element, placements); if (elementFinisherExtras.finisher) { finishers.push(elementFinisherExtras.finisher); } var newExtras = elementFinisherExtras.extras; if (newExtras) { for (var j = 0; j < newExtras.length; j++) { this.addElementPlacement(newExtras[j], placements); } extras.push.apply(extras, newExtras); } } return { element: element, finishers: finishers, extras: extras }; }, decorateConstructor: function decorateConstructor(elements, decorators) { var finishers = []; for (var i = decorators.length - 1; i >= 0; i--) { var obj = this.fromClassDescriptor(elements); var elementsAndFinisher = this.toClassDescriptor((0, decorators[i])(obj) || obj); if (elementsAndFinisher.finisher !== undefined) { finishers.push(elementsAndFinisher.finisher); } if (elementsAndFinisher.elements !== undefined) { elements = elementsAndFinisher.elements; for (var j = 0; j < elements.length - 1; j++) { for (var k = j + 1; k < elements.length; k++) { if (elements[j].key === elements[k].key && elements[j].placement === elements[k].placement) { throw new TypeError("Duplicated element (" + elements[j].key + ")"); } } } } } return { elements: elements, finishers: finishers }; }, fromElementDescriptor: function fromElementDescriptor(element) { var obj = { kind: element.kind, key: element.key, placement: element.placement, descriptor: element.descriptor }; var desc = { value: "Descriptor", configurable: true }; Object.defineProperty(obj, Symbol.toStringTag, desc); if (element.kind === "field") obj.initializer = element.initializer; return obj; }, toElementDescriptors: function toElementDescriptors(elementObjects) { if (elementObjects === undefined) return; return _toArray(elementObjects).map(function (elementObject) { var element = this.toElementDescriptor(elementObject); this.disallowProperty(elementObject, "finisher", "An element descriptor"); this.disallowProperty(elementObject, "extras", "An element descriptor"); return element; }, this); }, toElementDescriptor: function toElementDescriptor(elementObject) { var kind = String(elementObject.kind); if (kind !== "method" && kind !== "field") { throw new TypeError('An element descriptor\'s .kind property must be either "method" or' + ' "field", but a decorator created an element descriptor with' + ' .kind "' + kind + '"'); } var key = _toPropertyKey$2(elementObject.key); var placement = String(elementObject.placement); if (placement !== "static" && placement !== "prototype" && placement !== "own") { throw new TypeError('An element descriptor\'s .placement property must be one of "static",' + ' "prototype" or "own", but a decorator created an element descriptor' + ' with .placement "' + placement + '"'); } var descriptor = elementObject.descriptor; this.disallowProperty(elementObject, "elements", "An element descriptor"); var element = { kind: kind, key: key, placement: placement, descriptor: Object.assign({}, descriptor) }; if (kind !== "field") { this.disallowProperty(elementObject, "initializer", "A method descriptor"); } else { this.disallowProperty(descriptor, "get", "The property descriptor of a field descriptor"); this.disallowProperty(descriptor, "set", "The property descriptor of a field descriptor"); this.disallowProperty(descriptor, "value", "The property descriptor of a field descriptor"); element.initializer = elementObject.initializer; } return element; }, toElementFinisherExtras: function toElementFinisherExtras(elementObject) { var element = this.toElementDescriptor(elementObject); var finisher = _optionalCallableProperty$2(elementObject, "finisher"); var extras = this.toElementDescriptors(elementObject.extras); return { element: element, finisher: finisher, extras: extras }; }, fromClassDescriptor: function fromClassDescriptor(elements) { var obj = { kind: "class", elements: elements.map(this.fromElementDescriptor, this) }; var desc = { value: "Descriptor", configurable: true }; Object.defineProperty(obj, Symbol.toStringTag, desc); return obj; }, toClassDescriptor: function toClassDescriptor(obj) { var kind = String(obj.kind); if (kind !== "class") { throw new TypeError('A class descriptor\'s .kind property must be "class", but a decorator' + ' created a class descriptor with .kind "' + kind + '"'); } this.disallowProperty(obj, "key", "A class descriptor"); this.disallowProperty(obj, "placement", "A class descriptor"); this.disallowProperty(obj, "descriptor", "A class descriptor"); this.disallowProperty(obj, "initializer", "A class descriptor"); this.disallowProperty(obj, "extras", "A class descriptor"); var finisher = _optionalCallableProperty$2(obj, "finisher"); var elements = this.toElementDescriptors(obj.elements); return { elements: elements, finisher: finisher }; }, runClassFinishers: function runClassFinishers(constructor, finishers) { for (var i = 0; i < finishers.length; i++) { var newConstructor = (0, finishers[i])(constructor); if (newConstructor !== undefined) { if (typeof newConstructor !== "function") { throw new TypeError("Finishers must return a constructor."); } constructor = newConstructor; } } return constructor; }, disallowProperty: function disallowProperty(obj, name, objectType) { if (obj[name] !== undefined) { throw new TypeError(objectType + " can't have a ." + name + " property."); } } }; return api; }
function _createElementDescriptor$2(def) { var key = _toPropertyKey$2(def.key); var descriptor; if (def.kind === "method") { descriptor = { value: def.value, writable: true, configurable: true, enumerable: false }; } else if (def.kind === "get") { descriptor = { get: def.value, configurable: true, enumerable: false }; } else if (def.kind === "set") { descriptor = { set: def.value, configurable: true, enumerable: false }; } else if (def.kind === "field") { descriptor = { configurable: true, writable: true, enumerable: true }; } var element = { kind: def.kind === "field" ? "field" : "method", key: key, placement: def["static"] ? "static" : def.kind === "field" ? "own" : "prototype", descriptor: descriptor }; if (def.decorators) element.decorators = def.decorators; if (def.kind === "field") element.initializer = def.value; return element; }
function _coalesceGetterSetter$2(element, other) { if (element.descriptor.get !== undefined) { other.descriptor.get = element.descriptor.get; } else { other.descriptor.set = element.descriptor.set; } }
function _coalesceClassElements$2(elements) { var newElements = []; var isSameElement = function isSameElement(other) { return other.kind === "method" && other.key === element.key && other.placement === element.placement; }; for (var i = 0; i < elements.length; i++) { var element = elements[i]; var other; if (element.kind === "method" && (other = newElements.find(isSameElement))) { if (_isDataDescriptor$2(element.descriptor) || _isDataDescriptor$2(other.descriptor)) { if (_hasDecorators$2(element) || _hasDecorators$2(other)) { throw new ReferenceError("Duplicated methods (" + element.key + ") can't be decorated."); } other.descriptor = element.descriptor; } else { if (_hasDecorators$2(element)) { if (_hasDecorators$2(other)) { throw new ReferenceError("Decorators can't be placed on different accessors with for " + "the same property (" + element.key + ")."); } other.decorators = element.decorators; } _coalesceGetterSetter$2(element, other); } } else { newElements.push(element); } } return newElements; }
function _hasDecorators$2(element) { return element.decorators && element.decorators.length; }
function _isDataDescriptor$2(desc) { return desc !== undefined && !(desc.value === undefined && desc.writable === undefined); }
function _optionalCallableProperty$2(obj, name) { var value = obj[name]; if (value !== undefined && typeof value !== "function") { throw new TypeError("Expected '" + name + "' to be a function"); } return value; }
function _toPropertyKey$2(arg) { var key = _toPrimitive$2(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive$2(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var Minimap = _decorate$2([customElement('minimap-component')], function (_initialize, _LitElement) {
  var Minimap = /*#__PURE__*/function (_LitElement2) {
    _inherits(Minimap, _LitElement2);
    var _super = _createSuper$3(Minimap);
    function Minimap() {
      var _this;
      _classCallCheck(this, Minimap);
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _super.call.apply(_super, [this].concat(args));
      _initialize(_assertThisInitialized(_this));
      return _this;
    }
    return _createClass(Minimap);
  }(_LitElement);
  return {
    F: Minimap,
    d: [{
      kind: "field",
      decorators: [property({
        type: Number
      })],
      key: "size",
      value: function value() {
        return 200;
      }
    }, {
      kind: "field",
      decorators: [property({
        type: Number
      })],
      key: "ratio",
      value: function value() {
        return 1;
      }
    }, {
      kind: "field",
      decorators: [property({
        type: Array,
        hasChanged: function hasChanged(newVal, oldVal) {
          return !deepEqual(newVal, oldVal);
        }
      })],
      key: "nodes",
      value: void 0
    }, {
      kind: "field",
      decorators: [property({
        type: Object
      })],
      key: "viewport",
      value: void 0
    }, {
      kind: "field",
      decorators: [property({
        type: Function
      })],
      key: "reTranslate",
      value: function value() {
        return function () {
          throw new Error('reTranslate not set properly');
        };
      }
    }, {
      kind: "field",
      decorators: [property({
        type: Function
      })],
      key: "point",
      value: function value() {
        return function (_x, _y) {
          throw new Error('point not defined Properly');
        };
      }
    }, {
      kind: "field",
      decorators: [property({
        type: Number
      })],
      key: "seed",
      value: void 0
    }, {
      kind: "field",
      decorators: [query('.minimap')],
      key: "container",
      value: void 0
    }, {
      kind: "field",
      "static": true,
      key: "styles",
      value: function value() {
        return css(_templateObject$2 || (_templateObject$2 = _taggedTemplateLiteral(["\n        .minimap {\n            position: absolute;\n            right: 24px;\n            bottom: 24px;\n            background: rgba(229, 234, 239, 0.65);\n            padding: 20px;\n            overflow: hidden;\n            border: 1px solid #b1b7ff;\n            border-radius: 8px;\n            box-sizing: border-box;\n        }\n    "])));
      }
    }, {
      kind: "method",
      key: "render",
      value: function render() {
        var _this$nodes,
          _this2 = this;
        return html(_templateObject2$2 || (_templateObject2$2 = _taggedTemplateLiteral(["\n            <div\n                class=\"minimap\"\n                style=\"width: ", "; height: ", "\"\n                @pointerdown=\"", "\"\n                @dblclick=\"", "\"\n                data-testid=\"minimap\"\n            >\n                ", "\n                <mini-viewport\n                    .left=\"", "\"\n                    .top=\"", "\"\n                    .width=\"", "\"\n                    .height=\"", "\"\n                    .containerWidth=\"", "\"\n                    .reTranslate=\"", "\"\n                ></mini-viewport>\n            </div>\n        "])), px(this.size * this.ratio), px(this.size), this.stopEvent, this.dblclick, (_this$nodes = this.nodes) === null || _this$nodes === void 0 ? void 0 : _this$nodes.map(function (node) {
          return html(_templateObject3$1 || (_templateObject3$1 = _taggedTemplateLiteral(["\n                        <mini-node\n                            .left=\"", "\"\n                            .top=\"", "\"\n                            .width=\"", "\"\n                            .height=\"", "\"\n                        ></mini-node>\n                    "])), _this2.scale(node.left), _this2.scale(node.top), _this2.scale(node.width), _this2.scale(node.height));
        }), this.viewport.left, this.viewport.top, this.viewport.width, this.viewport.height, this.container && this.container.clientWidth, this.reTranslate);
      }
    }, {
      kind: "method",
      key: "stopEvent",
      value: function stopEvent(e) {
        e.stopPropagation();
        e.preventDefault();
      }
    }, {
      kind: "method",
      key: "dblclick",
      value: function dblclick(e) {
        var _this$point;
        if (!this.container) return;
        var box = this.container.getBoundingClientRect();
        var x = (e.clientX - box.left) / (this.size * this.ratio);
        var y = (e.clientY - box.top) / (this.size * this.ratio);
        (_this$point = this.point) === null || _this$point === void 0 ? void 0 : _this$point.call(this, x, y);
      }
    }, {
      kind: "method",
      key: "scale",
      value: function scale(value) {
        if (!this.container) return 0;
        return value * this.container.clientWidth;
      }
    }]
  };
}, LitElement);

function setup$1(props) {
  return {
    update: function update(context) {
      if (context.data.type === 'minimap') {
        return {
          nodes: context.data.nodes,
          size: (props === null || props === void 0 ? void 0 : props.size) || 200,
          ratio: context.data.ratio,
          viewport: context.data.viewport,
          reTranslate: context.data.translate,
          point: context.data.point
        };
      }
    },
    render: function render(context) {
      if (context.data.type === 'minimap') {
        return {
          component: Minimap,
          props: {
            nodes: context.data.nodes,
            size: (props === null || props === void 0 ? void 0 : props.size) || 200,
            ratio: context.data.ratio,
            viewport: context.data.viewport,
            reTranslate: context.data.translate,
            point: context.data.point
          }
        };
      }
    }
  };
}

var index$2 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  setup: setup$1
});

var _templateObject$1, _templateObject2$1, _templateObject3;
function _createSuper$2(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$2(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _isNativeReflectConstruct$2() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _decorate$1(decorators, factory, superClass, mixins) { var api = _getDecoratorsApi$1(); if (mixins) { for (var i = 0; i < mixins.length; i++) { api = mixins[i](api); } } var r = factory(function initialize(O) { api.initializeInstanceElements(O, decorated.elements); }, superClass); var decorated = api.decorateClass(_coalesceClassElements$1(r.d.map(_createElementDescriptor$1)), decorators); api.initializeClassElements(r.F, decorated.elements); return api.runClassFinishers(r.F, decorated.finishers); }
function _getDecoratorsApi$1() { _getDecoratorsApi$1 = function _getDecoratorsApi() { return api; }; var api = { elementsDefinitionOrder: [["method"], ["field"]], initializeInstanceElements: function initializeInstanceElements(O, elements) { ["method", "field"].forEach(function (kind) { elements.forEach(function (element) { if (element.kind === kind && element.placement === "own") { this.defineClassElement(O, element); } }, this); }, this); }, initializeClassElements: function initializeClassElements(F, elements) { var proto = F.prototype; ["method", "field"].forEach(function (kind) { elements.forEach(function (element) { var placement = element.placement; if (element.kind === kind && (placement === "static" || placement === "prototype")) { var receiver = placement === "static" ? F : proto; this.defineClassElement(receiver, element); } }, this); }, this); }, defineClassElement: function defineClassElement(receiver, element) { var descriptor = element.descriptor; if (element.kind === "field") { var initializer = element.initializer; descriptor = { enumerable: descriptor.enumerable, writable: descriptor.writable, configurable: descriptor.configurable, value: initializer === void 0 ? void 0 : initializer.call(receiver) }; } Object.defineProperty(receiver, element.key, descriptor); }, decorateClass: function decorateClass(elements, decorators) { var newElements = []; var finishers = []; var placements = { "static": [], prototype: [], own: [] }; elements.forEach(function (element) { this.addElementPlacement(element, placements); }, this); elements.forEach(function (element) { if (!_hasDecorators$1(element)) return newElements.push(element); var elementFinishersExtras = this.decorateElement(element, placements); newElements.push(elementFinishersExtras.element); newElements.push.apply(newElements, elementFinishersExtras.extras); finishers.push.apply(finishers, elementFinishersExtras.finishers); }, this); if (!decorators) { return { elements: newElements, finishers: finishers }; } var result = this.decorateConstructor(newElements, decorators); finishers.push.apply(finishers, result.finishers); result.finishers = finishers; return result; }, addElementPlacement: function addElementPlacement(element, placements, silent) { var keys = placements[element.placement]; if (!silent && keys.indexOf(element.key) !== -1) { throw new TypeError("Duplicated element (" + element.key + ")"); } keys.push(element.key); }, decorateElement: function decorateElement(element, placements) { var extras = []; var finishers = []; for (var decorators = element.decorators, i = decorators.length - 1; i >= 0; i--) { var keys = placements[element.placement]; keys.splice(keys.indexOf(element.key), 1); var elementObject = this.fromElementDescriptor(element); var elementFinisherExtras = this.toElementFinisherExtras((0, decorators[i])(elementObject) || elementObject); element = elementFinisherExtras.element; this.addElementPlacement(element, placements); if (elementFinisherExtras.finisher) { finishers.push(elementFinisherExtras.finisher); } var newExtras = elementFinisherExtras.extras; if (newExtras) { for (var j = 0; j < newExtras.length; j++) { this.addElementPlacement(newExtras[j], placements); } extras.push.apply(extras, newExtras); } } return { element: element, finishers: finishers, extras: extras }; }, decorateConstructor: function decorateConstructor(elements, decorators) { var finishers = []; for (var i = decorators.length - 1; i >= 0; i--) { var obj = this.fromClassDescriptor(elements); var elementsAndFinisher = this.toClassDescriptor((0, decorators[i])(obj) || obj); if (elementsAndFinisher.finisher !== undefined) { finishers.push(elementsAndFinisher.finisher); } if (elementsAndFinisher.elements !== undefined) { elements = elementsAndFinisher.elements; for (var j = 0; j < elements.length - 1; j++) { for (var k = j + 1; k < elements.length; k++) { if (elements[j].key === elements[k].key && elements[j].placement === elements[k].placement) { throw new TypeError("Duplicated element (" + elements[j].key + ")"); } } } } } return { elements: elements, finishers: finishers }; }, fromElementDescriptor: function fromElementDescriptor(element) { var obj = { kind: element.kind, key: element.key, placement: element.placement, descriptor: element.descriptor }; var desc = { value: "Descriptor", configurable: true }; Object.defineProperty(obj, Symbol.toStringTag, desc); if (element.kind === "field") obj.initializer = element.initializer; return obj; }, toElementDescriptors: function toElementDescriptors(elementObjects) { if (elementObjects === undefined) return; return _toArray(elementObjects).map(function (elementObject) { var element = this.toElementDescriptor(elementObject); this.disallowProperty(elementObject, "finisher", "An element descriptor"); this.disallowProperty(elementObject, "extras", "An element descriptor"); return element; }, this); }, toElementDescriptor: function toElementDescriptor(elementObject) { var kind = String(elementObject.kind); if (kind !== "method" && kind !== "field") { throw new TypeError('An element descriptor\'s .kind property must be either "method" or' + ' "field", but a decorator created an element descriptor with' + ' .kind "' + kind + '"'); } var key = _toPropertyKey$1(elementObject.key); var placement = String(elementObject.placement); if (placement !== "static" && placement !== "prototype" && placement !== "own") { throw new TypeError('An element descriptor\'s .placement property must be one of "static",' + ' "prototype" or "own", but a decorator created an element descriptor' + ' with .placement "' + placement + '"'); } var descriptor = elementObject.descriptor; this.disallowProperty(elementObject, "elements", "An element descriptor"); var element = { kind: kind, key: key, placement: placement, descriptor: Object.assign({}, descriptor) }; if (kind !== "field") { this.disallowProperty(elementObject, "initializer", "A method descriptor"); } else { this.disallowProperty(descriptor, "get", "The property descriptor of a field descriptor"); this.disallowProperty(descriptor, "set", "The property descriptor of a field descriptor"); this.disallowProperty(descriptor, "value", "The property descriptor of a field descriptor"); element.initializer = elementObject.initializer; } return element; }, toElementFinisherExtras: function toElementFinisherExtras(elementObject) { var element = this.toElementDescriptor(elementObject); var finisher = _optionalCallableProperty$1(elementObject, "finisher"); var extras = this.toElementDescriptors(elementObject.extras); return { element: element, finisher: finisher, extras: extras }; }, fromClassDescriptor: function fromClassDescriptor(elements) { var obj = { kind: "class", elements: elements.map(this.fromElementDescriptor, this) }; var desc = { value: "Descriptor", configurable: true }; Object.defineProperty(obj, Symbol.toStringTag, desc); return obj; }, toClassDescriptor: function toClassDescriptor(obj) { var kind = String(obj.kind); if (kind !== "class") { throw new TypeError('A class descriptor\'s .kind property must be "class", but a decorator' + ' created a class descriptor with .kind "' + kind + '"'); } this.disallowProperty(obj, "key", "A class descriptor"); this.disallowProperty(obj, "placement", "A class descriptor"); this.disallowProperty(obj, "descriptor", "A class descriptor"); this.disallowProperty(obj, "initializer", "A class descriptor"); this.disallowProperty(obj, "extras", "A class descriptor"); var finisher = _optionalCallableProperty$1(obj, "finisher"); var elements = this.toElementDescriptors(obj.elements); return { elements: elements, finisher: finisher }; }, runClassFinishers: function runClassFinishers(constructor, finishers) { for (var i = 0; i < finishers.length; i++) { var newConstructor = (0, finishers[i])(constructor); if (newConstructor !== undefined) { if (typeof newConstructor !== "function") { throw new TypeError("Finishers must return a constructor."); } constructor = newConstructor; } } return constructor; }, disallowProperty: function disallowProperty(obj, name, objectType) { if (obj[name] !== undefined) { throw new TypeError(objectType + " can't have a ." + name + " property."); } } }; return api; }
function _createElementDescriptor$1(def) { var key = _toPropertyKey$1(def.key); var descriptor; if (def.kind === "method") { descriptor = { value: def.value, writable: true, configurable: true, enumerable: false }; } else if (def.kind === "get") { descriptor = { get: def.value, configurable: true, enumerable: false }; } else if (def.kind === "set") { descriptor = { set: def.value, configurable: true, enumerable: false }; } else if (def.kind === "field") { descriptor = { configurable: true, writable: true, enumerable: true }; } var element = { kind: def.kind === "field" ? "field" : "method", key: key, placement: def["static"] ? "static" : def.kind === "field" ? "own" : "prototype", descriptor: descriptor }; if (def.decorators) element.decorators = def.decorators; if (def.kind === "field") element.initializer = def.value; return element; }
function _coalesceGetterSetter$1(element, other) { if (element.descriptor.get !== undefined) { other.descriptor.get = element.descriptor.get; } else { other.descriptor.set = element.descriptor.set; } }
function _coalesceClassElements$1(elements) { var newElements = []; var isSameElement = function isSameElement(other) { return other.kind === "method" && other.key === element.key && other.placement === element.placement; }; for (var i = 0; i < elements.length; i++) { var element = elements[i]; var other; if (element.kind === "method" && (other = newElements.find(isSameElement))) { if (_isDataDescriptor$1(element.descriptor) || _isDataDescriptor$1(other.descriptor)) { if (_hasDecorators$1(element) || _hasDecorators$1(other)) { throw new ReferenceError("Duplicated methods (" + element.key + ") can't be decorated."); } other.descriptor = element.descriptor; } else { if (_hasDecorators$1(element)) { if (_hasDecorators$1(other)) { throw new ReferenceError("Decorators can't be placed on different accessors with for " + "the same property (" + element.key + ")."); } other.decorators = element.decorators; } _coalesceGetterSetter$1(element, other); } } else { newElements.push(element); } } return newElements; }
function _hasDecorators$1(element) { return element.decorators && element.decorators.length; }
function _isDataDescriptor$1(desc) { return desc !== undefined && !(desc.value === undefined && desc.writable === undefined); }
function _optionalCallableProperty$1(obj, name) { var value = obj[name]; if (value !== undefined && typeof value !== "function") { throw new TypeError("Expected '" + name + "' to be a function"); } return value; }
function _toPropertyKey$1(arg) { var key = _toPrimitive$1(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive$1(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var Pins = _decorate$1([customElement('pins-component')], function (_initialize, _LitElement) {
  var Pins = /*#__PURE__*/function (_LitElement2) {
    _inherits(Pins, _LitElement2);
    var _super = _createSuper$2(Pins);
    function Pins() {
      var _this;
      _classCallCheck(this, Pins);
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _super.call.apply(_super, [this].concat(args));
      _initialize(_assertThisInitialized(_this));
      return _this;
    }
    return _createClass(Pins);
  }(_LitElement);
  return {
    F: Pins,
    d: [{
      kind: "field",
      decorators: [property({
        type: Array
      })],
      key: "pins",
      value: function value() {
        return [];
      }
    }, {
      kind: "field",
      decorators: [property({
        type: Function
      })],
      key: "menu",
      value: function value() {
        return function (_id) {
          throw new Error('menu not set properly');
        };
      }
    }, {
      kind: "field",
      decorators: [property({
        type: Function
      })],
      key: "reTranslate",
      value: function value() {
        return function (_id, _dx, _dy) {
          throw new Error('reTranslate not set properly');
        };
      }
    }, {
      kind: "field",
      decorators: [property({
        type: Function
      })],
      key: "down",
      value: function value() {
        return function (_id) {
          throw new Error('down not set properly');
        };
      }
    }, {
      kind: "field",
      decorators: [property({
        type: Function
      })],
      key: "getPointer",
      value: function value() {
        return function () {
          throw new Error('getPointer not set properly');
        };
      }
    }, {
      kind: "field",
      "static": true,
      key: "styles",
      value: function value() {
        return css(_templateObject$1 || (_templateObject$1 = _taggedTemplateLiteral(["\n    :host {\n      display: block;\n    }\n  "])));
      }
    }, {
      kind: "method",
      key: "render",
      value: function render() {
        var _this2 = this;
        return html(_templateObject2$1 || (_templateObject2$1 = _taggedTemplateLiteral(["\n      ", "\n    "])), this.pins.map(function (pin) {
          return html(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n          <pin-component\n            .position=", "\n            .selected=", "\n            .getPointer=", "\n            @menu=", "\n            @translate=", "\n            @down=", "\n          ></pin-component>\n        "])), pin.position, pin.selected, _this2.getPointer, function () {
            return _this2.menu(pin.id);
          }, function (e) {
            return _this2.reTranslate(pin.id, e.detail.dx, e.detail.dy);
          }, function () {
            return _this2.down(pin.id);
          });
        }));
      }
    }]
  };
}, LitElement);

function ownKeys$2(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread$2(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$2(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$2(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
/**
 * Preset for rendering pins.
 */
function setup(props) {
  var getProps = function getProps() {
    return {
      menu: (props === null || props === void 0 ? void 0 : props.contextMenu) || function () {
        return null;
      },
      translate: (props === null || props === void 0 ? void 0 : props.translate) || function () {
        return null;
      },
      down: (props === null || props === void 0 ? void 0 : props.pointerdown) || function () {
        return null;
      }
    };
  };
  return {
    update: function update(context) {
      if (context.data.type === 'reroute-pins') {
        return _objectSpread$2(_objectSpread$2({}, getProps()), {}, {
          pins: context.data.data.pins
        });
      }
    },
    render: function render(context, plugin) {
      if (context.data.type === 'reroute-pins') {
        var area = plugin.parentScope(BaseAreaPlugin);
        return {
          component: Pins,
          props: _objectSpread$2(_objectSpread$2({}, getProps()), {}, {
            getPointer: function getPointer() {
              return area.area.pointer;
            },
            pins: context.data.data.pins
          })
        };
      }
    }
  };
}

var index$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  setup: setup
});

var index = /*#__PURE__*/Object.freeze({
  __proto__: null,
  classic: index$4,
  contextMenu: index$3,
  minimap: index$2,
  reroute: index$1
});

var _templateObject, _templateObject2;
function ownKeys$1(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread$1(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$1(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$1(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _createSuper$1(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$1(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _isNativeReflectConstruct$1() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _decorate(decorators, factory, superClass, mixins) { var api = _getDecoratorsApi(); if (mixins) { for (var i = 0; i < mixins.length; i++) { api = mixins[i](api); } } var r = factory(function initialize(O) { api.initializeInstanceElements(O, decorated.elements); }, superClass); var decorated = api.decorateClass(_coalesceClassElements(r.d.map(_createElementDescriptor)), decorators); api.initializeClassElements(r.F, decorated.elements); return api.runClassFinishers(r.F, decorated.finishers); }
function _getDecoratorsApi() { _getDecoratorsApi = function _getDecoratorsApi() { return api; }; var api = { elementsDefinitionOrder: [["method"], ["field"]], initializeInstanceElements: function initializeInstanceElements(O, elements) { ["method", "field"].forEach(function (kind) { elements.forEach(function (element) { if (element.kind === kind && element.placement === "own") { this.defineClassElement(O, element); } }, this); }, this); }, initializeClassElements: function initializeClassElements(F, elements) { var proto = F.prototype; ["method", "field"].forEach(function (kind) { elements.forEach(function (element) { var placement = element.placement; if (element.kind === kind && (placement === "static" || placement === "prototype")) { var receiver = placement === "static" ? F : proto; this.defineClassElement(receiver, element); } }, this); }, this); }, defineClassElement: function defineClassElement(receiver, element) { var descriptor = element.descriptor; if (element.kind === "field") { var initializer = element.initializer; descriptor = { enumerable: descriptor.enumerable, writable: descriptor.writable, configurable: descriptor.configurable, value: initializer === void 0 ? void 0 : initializer.call(receiver) }; } Object.defineProperty(receiver, element.key, descriptor); }, decorateClass: function decorateClass(elements, decorators) { var newElements = []; var finishers = []; var placements = { "static": [], prototype: [], own: [] }; elements.forEach(function (element) { this.addElementPlacement(element, placements); }, this); elements.forEach(function (element) { if (!_hasDecorators(element)) return newElements.push(element); var elementFinishersExtras = this.decorateElement(element, placements); newElements.push(elementFinishersExtras.element); newElements.push.apply(newElements, elementFinishersExtras.extras); finishers.push.apply(finishers, elementFinishersExtras.finishers); }, this); if (!decorators) { return { elements: newElements, finishers: finishers }; } var result = this.decorateConstructor(newElements, decorators); finishers.push.apply(finishers, result.finishers); result.finishers = finishers; return result; }, addElementPlacement: function addElementPlacement(element, placements, silent) { var keys = placements[element.placement]; if (!silent && keys.indexOf(element.key) !== -1) { throw new TypeError("Duplicated element (" + element.key + ")"); } keys.push(element.key); }, decorateElement: function decorateElement(element, placements) { var extras = []; var finishers = []; for (var decorators = element.decorators, i = decorators.length - 1; i >= 0; i--) { var keys = placements[element.placement]; keys.splice(keys.indexOf(element.key), 1); var elementObject = this.fromElementDescriptor(element); var elementFinisherExtras = this.toElementFinisherExtras((0, decorators[i])(elementObject) || elementObject); element = elementFinisherExtras.element; this.addElementPlacement(element, placements); if (elementFinisherExtras.finisher) { finishers.push(elementFinisherExtras.finisher); } var newExtras = elementFinisherExtras.extras; if (newExtras) { for (var j = 0; j < newExtras.length; j++) { this.addElementPlacement(newExtras[j], placements); } extras.push.apply(extras, newExtras); } } return { element: element, finishers: finishers, extras: extras }; }, decorateConstructor: function decorateConstructor(elements, decorators) { var finishers = []; for (var i = decorators.length - 1; i >= 0; i--) { var obj = this.fromClassDescriptor(elements); var elementsAndFinisher = this.toClassDescriptor((0, decorators[i])(obj) || obj); if (elementsAndFinisher.finisher !== undefined) { finishers.push(elementsAndFinisher.finisher); } if (elementsAndFinisher.elements !== undefined) { elements = elementsAndFinisher.elements; for (var j = 0; j < elements.length - 1; j++) { for (var k = j + 1; k < elements.length; k++) { if (elements[j].key === elements[k].key && elements[j].placement === elements[k].placement) { throw new TypeError("Duplicated element (" + elements[j].key + ")"); } } } } } return { elements: elements, finishers: finishers }; }, fromElementDescriptor: function fromElementDescriptor(element) { var obj = { kind: element.kind, key: element.key, placement: element.placement, descriptor: element.descriptor }; var desc = { value: "Descriptor", configurable: true }; Object.defineProperty(obj, Symbol.toStringTag, desc); if (element.kind === "field") obj.initializer = element.initializer; return obj; }, toElementDescriptors: function toElementDescriptors(elementObjects) { if (elementObjects === undefined) return; return _toArray(elementObjects).map(function (elementObject) { var element = this.toElementDescriptor(elementObject); this.disallowProperty(elementObject, "finisher", "An element descriptor"); this.disallowProperty(elementObject, "extras", "An element descriptor"); return element; }, this); }, toElementDescriptor: function toElementDescriptor(elementObject) { var kind = String(elementObject.kind); if (kind !== "method" && kind !== "field") { throw new TypeError('An element descriptor\'s .kind property must be either "method" or' + ' "field", but a decorator created an element descriptor with' + ' .kind "' + kind + '"'); } var key = _toPropertyKey(elementObject.key); var placement = String(elementObject.placement); if (placement !== "static" && placement !== "prototype" && placement !== "own") { throw new TypeError('An element descriptor\'s .placement property must be one of "static",' + ' "prototype" or "own", but a decorator created an element descriptor' + ' with .placement "' + placement + '"'); } var descriptor = elementObject.descriptor; this.disallowProperty(elementObject, "elements", "An element descriptor"); var element = { kind: kind, key: key, placement: placement, descriptor: Object.assign({}, descriptor) }; if (kind !== "field") { this.disallowProperty(elementObject, "initializer", "A method descriptor"); } else { this.disallowProperty(descriptor, "get", "The property descriptor of a field descriptor"); this.disallowProperty(descriptor, "set", "The property descriptor of a field descriptor"); this.disallowProperty(descriptor, "value", "The property descriptor of a field descriptor"); element.initializer = elementObject.initializer; } return element; }, toElementFinisherExtras: function toElementFinisherExtras(elementObject) { var element = this.toElementDescriptor(elementObject); var finisher = _optionalCallableProperty(elementObject, "finisher"); var extras = this.toElementDescriptors(elementObject.extras); return { element: element, finisher: finisher, extras: extras }; }, fromClassDescriptor: function fromClassDescriptor(elements) { var obj = { kind: "class", elements: elements.map(this.fromElementDescriptor, this) }; var desc = { value: "Descriptor", configurable: true }; Object.defineProperty(obj, Symbol.toStringTag, desc); return obj; }, toClassDescriptor: function toClassDescriptor(obj) { var kind = String(obj.kind); if (kind !== "class") { throw new TypeError('A class descriptor\'s .kind property must be "class", but a decorator' + ' created a class descriptor with .kind "' + kind + '"'); } this.disallowProperty(obj, "key", "A class descriptor"); this.disallowProperty(obj, "placement", "A class descriptor"); this.disallowProperty(obj, "descriptor", "A class descriptor"); this.disallowProperty(obj, "initializer", "A class descriptor"); this.disallowProperty(obj, "extras", "A class descriptor"); var finisher = _optionalCallableProperty(obj, "finisher"); var elements = this.toElementDescriptors(obj.elements); return { elements: elements, finisher: finisher }; }, runClassFinishers: function runClassFinishers(constructor, finishers) { for (var i = 0; i < finishers.length; i++) { var newConstructor = (0, finishers[i])(constructor); if (newConstructor !== undefined) { if (typeof newConstructor !== "function") { throw new TypeError("Finishers must return a constructor."); } constructor = newConstructor; } } return constructor; }, disallowProperty: function disallowProperty(obj, name, objectType) { if (obj[name] !== undefined) { throw new TypeError(objectType + " can't have a ." + name + " property."); } } }; return api; }
function _createElementDescriptor(def) { var key = _toPropertyKey(def.key); var descriptor; if (def.kind === "method") { descriptor = { value: def.value, writable: true, configurable: true, enumerable: false }; } else if (def.kind === "get") { descriptor = { get: def.value, configurable: true, enumerable: false }; } else if (def.kind === "set") { descriptor = { set: def.value, configurable: true, enumerable: false }; } else if (def.kind === "field") { descriptor = { configurable: true, writable: true, enumerable: true }; } var element = { kind: def.kind === "field" ? "field" : "method", key: key, placement: def["static"] ? "static" : def.kind === "field" ? "own" : "prototype", descriptor: descriptor }; if (def.decorators) element.decorators = def.decorators; if (def.kind === "field") element.initializer = def.value; return element; }
function _coalesceGetterSetter(element, other) { if (element.descriptor.get !== undefined) { other.descriptor.get = element.descriptor.get; } else { other.descriptor.set = element.descriptor.set; } }
function _coalesceClassElements(elements) { var newElements = []; var isSameElement = function isSameElement(other) { return other.kind === "method" && other.key === element.key && other.placement === element.placement; }; for (var i = 0; i < elements.length; i++) { var element = elements[i]; var other; if (element.kind === "method" && (other = newElements.find(isSameElement))) { if (_isDataDescriptor(element.descriptor) || _isDataDescriptor(other.descriptor)) { if (_hasDecorators(element) || _hasDecorators(other)) { throw new ReferenceError("Duplicated methods (" + element.key + ") can't be decorated."); } other.descriptor = element.descriptor; } else { if (_hasDecorators(element)) { if (_hasDecorators(other)) { throw new ReferenceError("Decorators can't be placed on different accessors with for " + "the same property (" + element.key + ")."); } other.decorators = element.decorators; } _coalesceGetterSetter(element, other); } } else { newElements.push(element); } } return newElements; }
function _hasDecorators(element) { return element.decorators && element.decorators.length; }
function _isDataDescriptor(desc) { return desc !== undefined && !(desc.value === undefined && desc.writable === undefined); }
function _optionalCallableProperty(obj, name) { var value = obj[name]; if (value !== undefined && typeof value !== "function") { throw new TypeError("Expected '" + name + "' to be a function"); } return value; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var RefElement = _decorate([customElement('ref-element')], function (_initialize, _LitElement) {
  var RefElement = /*#__PURE__*/function (_LitElement2) {
    _inherits(RefElement, _LitElement2);
    var _super = _createSuper$1(RefElement);
    function RefElement() {
      var _this;
      _classCallCheck(this, RefElement);
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _super.call.apply(_super, [this].concat(args));
      _initialize(_assertThisInitialized(_this));
      return _this;
    }
    return _createClass(RefElement);
  }(_LitElement);
  return {
    F: RefElement,
    d: [{
      kind: "field",
      decorators: [property({
        type: Object
      })],
      key: "data",
      value: function value() {
        return {};
      }
    }, {
      kind: "field",
      decorators: [property({
        type: Function
      })],
      key: "emit",
      value: function value() {
        return function (_payload) {
          throw new Error('emit not set properly');
        };
      }
    }, {
      kind: "field",
      decorators: [query('#element')],
      key: "element",
      value: void 0
    }, {
      kind: "field",
      key: "originalElementsFromPoint",
      value: function value() {
        return document.elementsFromPoint.bind(document);
      }
    }, {
      kind: "method",
      key: "updated",
      value: function updated() {
        this.emit({
          type: 'render',
          data: _objectSpread$1(_objectSpread$1({}, this.data), {}, {
            element: this.element
          })
        });
      }
    }, {
      kind: "method",
      key: "disconnectedCallback",
      value: function disconnectedCallback() {
        this.emit({
          type: 'unmount',
          data: {
            element: this.element
          }
        });
        _get(_getPrototypeOf(RefElement.prototype), "disconnectedCallback", this).call(this);
      }
    }, {
      kind: "method",
      key: "handlePointerDown",
      value: function handlePointerDown() {
        // Stash original function
        var originalElementsFromPoint = this.originalElementsFromPoint;

        // Monkey patch
        document.elementsFromPoint = function (x, y) {
          var elements = originalElementsFromPoint(x, y);
          var shadowElements = [];
          var shadowRoot = elements[0].shadowRoot;
          var d = 0;
          while (shadowRoot) {
            var _innerElements$;
            var innerElements = shadowRoot.elementsFromPoint(x, y);
            d++;
            shadowElements = innerElements.concat(shadowElements);
            shadowRoot = (_innerElements$ = innerElements[0]) === null || _innerElements$ === void 0 ? void 0 : _innerElements$.shadowRoot; // Only check the shadow root of the first element
            if (d > 5) break;
          }
          return Array.from(new Set(shadowElements.concat(elements)));
        };

        // eslint-disable-next-line
        console.log("ref pointerdown");
      }
    }, {
      kind: "method",
      key: "handlePointerUp",
      value: function handlePointerUp() {
        var _this2 = this;
        // Restore original function after a setImmediate
        setTimeout(function () {
          document.elementsFromPoint = _this2.originalElementsFromPoint;
        }, 0);

        // eslint-disable-next-line
        console.log("ref pointerup");
      }
    }, {
      kind: "method",
      key: "render",
      value: function render() {
        return html(_templateObject || (_templateObject = _taggedTemplateLiteral(["<div\n            id=\"element\"\n            @pointerdown=\"", "\"\n            @pointerup=\"", "\"\n            .data=", "\n        ></div>"])), this.handlePointerDown, this.handlePointerUp, this.data);
      }
    }, {
      kind: "field",
      "static": true,
      key: "styles",
      value: function value() {
        return css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n        /* Add your styles here */\n    "])));
      }
    }]
  };
}, LitElement);

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var LitPlugin = /*#__PURE__*/function (_Scope) {
  _inherits(LitPlugin, _Scope);
  var _super = _createSuper(LitPlugin);
  function LitPlugin() {
    var _this;
    _classCallCheck(this, LitPlugin);
    _this = _super.call(this, 'lit-render');
    _defineProperty(_assertThisInitialized(_this), "renderer", void 0);
    _defineProperty(_assertThisInitialized(_this), "presets", []);
    _defineProperty(_assertThisInitialized(_this), "owners", new WeakMap());
    _this.renderer = getRenderer();
    _this.addPipe(function (context) {
      if (!context || _typeof(context) !== 'object' || !('type' in context)) return context;
      if (context.type === 'unmount') {
        _this.unmount(context.data.element);
      } else if (context.type === 'render') {
        if ('filled' in context.data && context.data.filled) {
          return context;
        }
        if (_this.mount(context.data.element, context)) {
          return _objectSpread(_objectSpread({}, context), {}, {
            data: _objectSpread(_objectSpread({}, context.data), {}, {
              filled: true
            })
          });
        }
      }
      return context;
    });
    return _this;
  }
  _createClass(LitPlugin, [{
    key: "setParent",
    value: function setParent(scope) {
      var _this2 = this;
      _get(_getPrototypeOf(LitPlugin.prototype), "setParent", this).call(this, scope);
      this.presets.forEach(function (preset) {
        if (preset.attach) preset.attach(_this2);
      });
    }
  }, {
    key: "unmount",
    value: function unmount(element) {
      this.owners["delete"](element);
      this.renderer.unmount(element);
    }
  }, {
    key: "mount",
    value: function mount(element, context) {
      var _this3 = this;
      var existing = this.renderer.get(element);
      var parent = this.parentScope();
      if (existing) {
        this.presets.forEach(function (preset) {
          if (_this3.owners.get(element) !== preset) return;
          var result = preset.update(context, _this3);
          if (result) {
            _this3.renderer.update(existing, result);
          }
        });
        return true;
      }
      var _iterator = _createForOfIteratorHelper(this.presets),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var preset = _step.value;
          var result = preset.render(context, this);
          if (!result) continue;
          this.renderer.mount(element, result.component, result.props, function () {
            return parent === null || parent === void 0 ? void 0 : parent.emit({
              type: 'rendered',
              data: context.data
            });
          });
          this.owners.set(element, preset);
          return true;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }, {
    key: "addPreset",
    value: function addPreset(preset) {
      var local = preset;
      if (local.attach) local.attach(this);
      this.presets.push(local);
    }
  }]);
  return LitPlugin;
}(Scope);

export { LitPlugin, index as Presets, RefElement as Ref };
//# sourceMappingURL=rete-litv-plugin.esm.js.map
