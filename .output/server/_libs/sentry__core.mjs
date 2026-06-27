import { fileURLToPath as __eveFileURLToPath } from "node:url";
import { dirname as __eveDirname } from "node:path";
__eveDirname(__eveFileURLToPath(import.meta.url));
import { t as __commonJSMin } from "../_runtime.mjs";
//#region node_modules/@sentry/core/build/cjs/debug-build.js
var require_debug_build = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	exports.DEBUG_BUILD = typeof __SENTRY_DEBUG__ === "undefined" || __SENTRY_DEBUG__;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/worldwide.js
var require_worldwide = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	exports.GLOBAL_OBJ = globalThis;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/version.js
var require_version = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	exports.SDK_VERSION = "10.62.0";
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/carrier.js
var require_carrier = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const version = require_version();
	const worldwide = require_worldwide();
	function getMainCarrier() {
		getSentryCarrier(worldwide.GLOBAL_OBJ);
		return worldwide.GLOBAL_OBJ;
	}
	function getSentryCarrier(carrier) {
		const __SENTRY__ = carrier.__SENTRY__ = carrier.__SENTRY__ || {};
		__SENTRY__.version = __SENTRY__.version || version.SDK_VERSION;
		return __SENTRY__[version.SDK_VERSION] = __SENTRY__[version.SDK_VERSION] || {};
	}
	function getGlobalSingleton(name, creator, obj = worldwide.GLOBAL_OBJ) {
		const __SENTRY__ = obj.__SENTRY__ = obj.__SENTRY__ || {};
		const carrier = __SENTRY__[version.SDK_VERSION] = __SENTRY__[version.SDK_VERSION] || {};
		return carrier[name] || (carrier[name] = creator());
	}
	exports.getGlobalSingleton = getGlobalSingleton;
	exports.getMainCarrier = getMainCarrier;
	exports.getSentryCarrier = getSentryCarrier;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/debug-logger.js
var require_debug_logger = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const carrier = require_carrier();
	const debugBuild = require_debug_build();
	const worldwide = require_worldwide();
	const CONSOLE_LEVELS = [
		"debug",
		"info",
		"warn",
		"error",
		"log",
		"assert",
		"trace"
	];
	const PREFIX = "Sentry Logger ";
	const originalConsoleMethods = {};
	function consoleSandbox(callback) {
		if (!("console" in worldwide.GLOBAL_OBJ)) return callback();
		const console = worldwide.GLOBAL_OBJ.console;
		const wrappedFuncs = {};
		const wrappedLevels = Object.keys(originalConsoleMethods);
		wrappedLevels.forEach((level) => {
			const originalConsoleMethod = originalConsoleMethods[level];
			wrappedFuncs[level] = console[level];
			console[level] = originalConsoleMethod;
		});
		try {
			return callback();
		} finally {
			wrappedLevels.forEach((level) => {
				console[level] = wrappedFuncs[level];
			});
		}
	}
	function enable() {
		_getLoggerSettings().enabled = true;
	}
	function disable() {
		_getLoggerSettings().enabled = false;
	}
	function isEnabled() {
		return _getLoggerSettings().enabled;
	}
	function log(...args) {
		_maybeLog("log", ...args);
	}
	function warn(...args) {
		_maybeLog("warn", ...args);
	}
	function error(...args) {
		_maybeLog("error", ...args);
	}
	function _maybeLog(level, ...args) {
		if (!debugBuild.DEBUG_BUILD) return;
		if (isEnabled()) consoleSandbox(() => {
			worldwide.GLOBAL_OBJ.console[level](`${PREFIX}[${level}]:`, ...args);
		});
	}
	function _getLoggerSettings() {
		if (!debugBuild.DEBUG_BUILD) return { enabled: false };
		return carrier.getGlobalSingleton("loggerSettings", () => ({ enabled: false }));
	}
	const debug = {
		/** Enable logging. */
		enable,
		/** Disable logging. */
		disable,
		/** Check if logging is enabled. */
		isEnabled,
		/** Log a message. */
		log,
		/** Log a warning. */
		warn,
		/** Log an error. */
		error
	};
	exports.CONSOLE_LEVELS = CONSOLE_LEVELS;
	exports.consoleSandbox = consoleSandbox;
	exports.debug = debug;
	exports.originalConsoleMethods = originalConsoleMethods;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/stacktrace.js
var require_stacktrace = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const STACKTRACE_FRAME_LIMIT = 50;
	const UNKNOWN_FUNCTION = "?";
	const WEBPACK_ERROR_REGEXP = /\(error: (.*)\)/;
	const STRIP_FRAME_REGEXP = /captureMessage|captureException/;
	function createStackParser(...parsers) {
		const sortedParsers = parsers.sort((a, b) => a[0] - b[0]).map((p) => p[1]);
		return (stack, skipFirstLines = 0, framesToPop = 0) => {
			const frames = [];
			const lines = stack.split("\n");
			for (let i = skipFirstLines; i < lines.length; i++) {
				let line = lines[i];
				if (line.length > 1024) line = line.slice(0, 1024);
				const cleanedLine = WEBPACK_ERROR_REGEXP.test(line) ? line.replace(WEBPACK_ERROR_REGEXP, "$1") : line;
				if (cleanedLine.includes("Error: ")) continue;
				for (const parser of sortedParsers) {
					const frame = parser(cleanedLine);
					if (frame) {
						frames.push(frame);
						break;
					}
				}
				if (frames.length >= STACKTRACE_FRAME_LIMIT + framesToPop) break;
			}
			return stripSentryFramesAndReverse(frames.slice(framesToPop));
		};
	}
	function stackParserFromStackParserOptions(stackParser) {
		if (Array.isArray(stackParser)) return createStackParser(...stackParser);
		return stackParser;
	}
	function stripSentryFramesAndReverse(stack) {
		if (!stack.length) return [];
		const localStack = Array.from(stack);
		if (/sentryWrapped/.test(getLastStackFrame(localStack).function || "")) localStack.pop();
		localStack.reverse();
		if (STRIP_FRAME_REGEXP.test(getLastStackFrame(localStack).function || "")) {
			localStack.pop();
			if (STRIP_FRAME_REGEXP.test(getLastStackFrame(localStack).function || "")) localStack.pop();
		}
		return localStack.slice(0, STACKTRACE_FRAME_LIMIT).map((frame) => ({
			...frame,
			filename: frame.filename || getLastStackFrame(localStack).filename,
			function: frame.function || UNKNOWN_FUNCTION
		}));
	}
	function getLastStackFrame(arr) {
		return arr[arr.length - 1] || {};
	}
	const defaultFunctionName = "<anonymous>";
	function getFunctionName(fn) {
		try {
			if (!fn || typeof fn !== "function") return defaultFunctionName;
			return fn.name || defaultFunctionName;
		} catch {
			return defaultFunctionName;
		}
	}
	function getFramesFromEvent(event) {
		const exception = event.exception;
		if (exception) {
			const frames = [];
			try {
				exception.values.forEach((value) => {
					if (value.stacktrace.frames) frames.push(...value.stacktrace.frames);
				});
				return frames;
			} catch {
				return;
			}
		}
	}
	function normalizeStackTracePath(path) {
		let filename = path?.startsWith("file://") ? path.slice(7) : path;
		if (filename?.match(/\/[A-Z]:/)) filename = filename.slice(1);
		return filename;
	}
	exports.UNKNOWN_FUNCTION = UNKNOWN_FUNCTION;
	exports.createStackParser = createStackParser;
	exports.getFramesFromEvent = getFramesFromEvent;
	exports.getFunctionName = getFunctionName;
	exports.normalizeStackTracePath = normalizeStackTracePath;
	exports.stackParserFromStackParserOptions = stackParserFromStackParserOptions;
	exports.stripSentryFramesAndReverse = stripSentryFramesAndReverse;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/instrument/handlers.js
var require_handlers$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const debugBuild = require_debug_build();
	const debugLogger = require_debug_logger();
	const stacktrace = require_stacktrace();
	const handlers = {};
	const instrumented = {};
	function addHandler(type, handler) {
		handlers[type] = handlers[type] || [];
		handlers[type].push(handler);
		return () => {
			const typeHandlers = handlers[type];
			if (typeHandlers) {
				const index = typeHandlers.indexOf(handler);
				if (index !== -1) typeHandlers.splice(index, 1);
			}
		};
	}
	function resetInstrumentationHandlers() {
		Object.keys(handlers).forEach((key) => {
			handlers[key] = void 0;
		});
	}
	function maybeInstrument(type, instrumentFn) {
		if (!instrumented[type]) {
			instrumented[type] = true;
			try {
				instrumentFn();
			} catch (e) {
				debugBuild.DEBUG_BUILD && debugLogger.debug.error(`Error while instrumenting ${type}`, e);
			}
		}
	}
	function triggerHandlers(type, data) {
		const typeHandlers = type && handlers[type];
		if (!typeHandlers) return;
		for (const handler of typeHandlers) try {
			handler(data);
		} catch (e) {
			debugBuild.DEBUG_BUILD && debugLogger.debug.error(`Error while triggering instrumentation handler.
Type: ${type}
Name: ${stacktrace.getFunctionName(handler)}
Error:`, e);
		}
	}
	exports.addHandler = addHandler;
	exports.maybeInstrument = maybeInstrument;
	exports.resetInstrumentationHandlers = resetInstrumentationHandlers;
	exports.triggerHandlers = triggerHandlers;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/instrument/globalError.js
var require_globalError = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const worldwide = require_worldwide();
	const handlers = require_handlers$1();
	let _oldOnErrorHandler = null;
	function addGlobalErrorInstrumentationHandler(handler) {
		const type = "error";
		handlers.addHandler(type, handler);
		handlers.maybeInstrument(type, instrumentError);
	}
	function instrumentError() {
		_oldOnErrorHandler = worldwide.GLOBAL_OBJ.onerror;
		worldwide.GLOBAL_OBJ.onerror = function(msg, url, line, column, error) {
			const handlerData = {
				column,
				error,
				line,
				msg,
				url
			};
			handlers.triggerHandlers("error", handlerData);
			if (_oldOnErrorHandler) return _oldOnErrorHandler.apply(this, arguments);
			return false;
		};
		worldwide.GLOBAL_OBJ.onerror.__SENTRY_INSTRUMENTED__ = true;
	}
	exports.addGlobalErrorInstrumentationHandler = addGlobalErrorInstrumentationHandler;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/instrument/globalUnhandledRejection.js
var require_globalUnhandledRejection = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const worldwide = require_worldwide();
	const handlers = require_handlers$1();
	let _oldOnUnhandledRejectionHandler = null;
	function addGlobalUnhandledRejectionInstrumentationHandler(handler) {
		const type = "unhandledrejection";
		handlers.addHandler(type, handler);
		handlers.maybeInstrument(type, instrumentUnhandledRejection);
	}
	function instrumentUnhandledRejection() {
		_oldOnUnhandledRejectionHandler = worldwide.GLOBAL_OBJ.onunhandledrejection;
		worldwide.GLOBAL_OBJ.onunhandledrejection = function(e) {
			const handlerData = e;
			handlers.triggerHandlers("unhandledrejection", handlerData);
			if (_oldOnUnhandledRejectionHandler) return _oldOnUnhandledRejectionHandler.apply(this, arguments);
			return true;
		};
		worldwide.GLOBAL_OBJ.onunhandledrejection.__SENTRY_INSTRUMENTED__ = true;
	}
	exports.addGlobalUnhandledRejectionInstrumentationHandler = addGlobalUnhandledRejectionInstrumentationHandler;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/is.js
var require_is = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const objectToString = Object.prototype.toString;
	function isError(wat) {
		switch (objectToString.call(wat)) {
			case "[object Error]":
			case "[object Exception]":
			case "[object DOMException]":
			case "[object WebAssembly.Exception]": return true;
			default: return isInstanceOf(wat, Error);
		}
	}
	function isBuiltin(wat, className) {
		return objectToString.call(wat) === `[object ${className}]`;
	}
	function isErrorEvent(wat) {
		return isBuiltin(wat, "ErrorEvent");
	}
	function isDOMError(wat) {
		return isBuiltin(wat, "DOMError");
	}
	function isDOMException(wat) {
		return isBuiltin(wat, "DOMException");
	}
	function isString(wat) {
		return isBuiltin(wat, "String");
	}
	function isParameterizedString(wat) {
		return typeof wat === "object" && wat !== null && "__sentry_template_string__" in wat && "__sentry_template_values__" in wat;
	}
	function isPrimitive(wat) {
		return wat === null || isParameterizedString(wat) || typeof wat !== "object" && typeof wat !== "function";
	}
	function isPlainObject(wat) {
		return isBuiltin(wat, "Object");
	}
	function isEvent(wat) {
		return typeof Event !== "undefined" && isInstanceOf(wat, Event);
	}
	function isElement(wat) {
		return typeof Element !== "undefined" && isInstanceOf(wat, Element);
	}
	function isRegExp(wat) {
		return isBuiltin(wat, "RegExp");
	}
	function isThenable(wat) {
		return Boolean(wat?.then && typeof wat.then === "function");
	}
	function isSyntheticEvent(wat) {
		return isPlainObject(wat) && "nativeEvent" in wat && "preventDefault" in wat && "stopPropagation" in wat;
	}
	function isInstanceOf(wat, base) {
		try {
			return wat instanceof base;
		} catch {
			return false;
		}
	}
	function isVueViewModel(wat) {
		return !!(typeof wat === "object" && wat !== null && (wat.__isVue || wat._isVue || wat.__v_isVNode));
	}
	function isRequest(request) {
		return typeof Request !== "undefined" && isInstanceOf(request, Request);
	}
	exports.isDOMError = isDOMError;
	exports.isDOMException = isDOMException;
	exports.isElement = isElement;
	exports.isError = isError;
	exports.isErrorEvent = isErrorEvent;
	exports.isEvent = isEvent;
	exports.isInstanceOf = isInstanceOf;
	exports.isParameterizedString = isParameterizedString;
	exports.isPlainObject = isPlainObject;
	exports.isPrimitive = isPrimitive;
	exports.isRegExp = isRegExp;
	exports.isRequest = isRequest;
	exports.isString = isString;
	exports.isSyntheticEvent = isSyntheticEvent;
	exports.isThenable = isThenable;
	exports.isVueViewModel = isVueViewModel;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/object.js
var require_object = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const debugBuild = require_debug_build();
	const debugLogger = require_debug_logger();
	const is = require_is();
	function fill(source, name, replacementFactory) {
		if (!(name in source)) return;
		const original = source[name];
		if (typeof original !== "function") return;
		const wrapped = replacementFactory(original);
		if (typeof wrapped === "function") markFunctionWrapped(wrapped, original);
		try {
			source[name] = wrapped;
		} catch {
			debugBuild.DEBUG_BUILD && debugLogger.debug.log(`Failed to replace method "${name}" in object`, source);
		}
	}
	function addNonEnumerableProperty(obj, name, value) {
		try {
			Object.defineProperty(obj, name, {
				value,
				writable: true,
				configurable: true
			});
		} catch {
			debugBuild.DEBUG_BUILD && debugLogger.debug.log(`Failed to add non-enumerable property "${String(name)}" to object`, obj);
		}
	}
	function markFunctionWrapped(wrapped, original) {
		try {
			wrapped.prototype = original.prototype = original.prototype || {};
			addNonEnumerableProperty(wrapped, "__sentry_original__", original);
		} catch {}
	}
	function wrapMethod(obj, field, wrapped, enumerable = true) {
		const original = obj[field];
		if (typeof original !== "function") throw new Error(`Cannot wrap method: ${field} is not a function`);
		if (getOriginalFunction(original)) throw new Error(`Attempting to wrap method ${field} multiple times`);
		markFunctionWrapped(wrapped, original);
		Object.defineProperty(obj, field, {
			writable: true,
			configurable: true,
			enumerable,
			value: wrapped
		});
	}
	function getOriginalFunction(func) {
		return func.__sentry_original__;
	}
	function convertToPlainObject(value) {
		if (is.isError(value)) return {
			message: value.message,
			name: value.name,
			stack: value.stack,
			...getOwnProperties(value)
		};
		if (is.isEvent(value)) {
			const { type, target, currentTarget, detail } = value;
			return {
				type,
				target,
				currentTarget,
				...detail ? { detail } : {},
				...getOwnProperties(value)
			};
		}
		return value;
	}
	function getOwnProperties(obj) {
		if (typeof obj === "object" && obj !== null) return Object.fromEntries(Object.entries(obj));
		return {};
	}
	function extractExceptionKeysForMessage(exception) {
		const keys = Object.keys(convertToPlainObject(exception));
		keys.sort();
		return !keys[0] ? "[object has no keys]" : keys.join(", ");
	}
	function dropUndefinedKeys(inputValue) {
		return _dropUndefinedKeys(inputValue, /* @__PURE__ */ new Map());
	}
	function _dropUndefinedKeys(inputValue, memoizationMap) {
		if (inputValue === null || typeof inputValue !== "object") return inputValue;
		const memoVal = memoizationMap.get(inputValue);
		if (memoVal !== void 0) return memoVal;
		if (Array.isArray(inputValue)) {
			const returnValue = [];
			memoizationMap.set(inputValue, returnValue);
			inputValue.forEach((value) => {
				returnValue.push(_dropUndefinedKeys(value, memoizationMap));
			});
			return returnValue;
		}
		if (isPojo(inputValue)) {
			const returnValue = {};
			memoizationMap.set(inputValue, returnValue);
			Object.keys(inputValue).forEach((key) => {
				const val = inputValue[key];
				if (val !== void 0) returnValue[key] = _dropUndefinedKeys(val, memoizationMap);
			});
			return returnValue;
		}
		return inputValue;
	}
	function isPojo(input) {
		const constructor = input.constructor;
		return constructor === Object || constructor === void 0;
	}
	function objectify(wat) {
		let objectified;
		switch (true) {
			case wat == void 0:
				objectified = new String(wat);
				break;
			case typeof wat === "symbol" || typeof wat === "bigint":
				objectified = Object(wat);
				break;
			case is.isPrimitive(wat):
				objectified = new wat.constructor(wat);
				break;
			default:
				objectified = wat;
				break;
		}
		return objectified;
	}
	exports.addNonEnumerableProperty = addNonEnumerableProperty;
	exports.convertToPlainObject = convertToPlainObject;
	exports.dropUndefinedKeys = dropUndefinedKeys;
	exports.extractExceptionKeysForMessage = extractExceptionKeysForMessage;
	exports.fill = fill;
	exports.getOriginalFunction = getOriginalFunction;
	exports.markFunctionWrapped = markFunctionWrapped;
	exports.objectify = objectify;
	exports.wrapMethod = wrapMethod;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/weakRef.js
var require_weakRef = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const worldwide = require_worldwide();
	function makeWeakRef(value) {
		try {
			const WeakRefImpl = worldwide.GLOBAL_OBJ.WeakRef;
			if (typeof WeakRefImpl === "function") return new WeakRefImpl(value);
		} catch {}
		return value;
	}
	function derefWeakRef(ref) {
		if (!ref) return;
		if (typeof ref === "object" && "deref" in ref && typeof ref.deref === "function") try {
			return ref.deref();
		} catch {
			return;
		}
		return ref;
	}
	exports.derefWeakRef = derefWeakRef;
	exports.makeWeakRef = makeWeakRef;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/spanOnScope.js
var require_spanOnScope = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const object = require_object();
	const weakRef = require_weakRef();
	const SCOPE_SPAN_FIELD = "_sentrySpan";
	function _setSpanForScope(scope, span) {
		if (span) object.addNonEnumerableProperty(scope, SCOPE_SPAN_FIELD, weakRef.makeWeakRef(span));
		else delete scope[SCOPE_SPAN_FIELD];
	}
	function _getSpanForScope(scope) {
		return weakRef.derefWeakRef(scope[SCOPE_SPAN_FIELD]);
	}
	exports._getSpanForScope = _getSpanForScope;
	exports._setSpanForScope = _setSpanForScope;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/randomSafeContext.js
var require_randomSafeContext = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const worldwide = require_worldwide();
	let RESOLVED_RUNNER;
	function withRandomSafeContext(cb) {
		if (RESOLVED_RUNNER !== void 0) return RESOLVED_RUNNER ? RESOLVED_RUNNER(cb) : cb();
		const sym = /* @__PURE__ */ Symbol.for("__SENTRY_SAFE_RANDOM_ID_WRAPPER__");
		const globalWithSymbol = worldwide.GLOBAL_OBJ;
		if (sym in globalWithSymbol && typeof globalWithSymbol[sym] === "function") {
			RESOLVED_RUNNER = globalWithSymbol[sym];
			return RESOLVED_RUNNER(cb);
		}
		RESOLVED_RUNNER = null;
		return cb();
	}
	function safeMathRandom() {
		return withRandomSafeContext(() => Math.random());
	}
	function safeDateNow() {
		return withRandomSafeContext(() => Date.now());
	}
	exports.safeDateNow = safeDateNow;
	exports.safeMathRandom = safeMathRandom;
	exports.withRandomSafeContext = withRandomSafeContext;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/normalizationHints.js
var require_normalizationHints = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const object = require_object();
	const SENTRY_SKIP_NORMALIZATION = /* @__PURE__ */ Symbol.for("sentry.skipNormalization");
	const SENTRY_OVERRIDE_NORMALIZATION_DEPTH = /* @__PURE__ */ Symbol.for("sentry.overrideNormalizationDepth");
	function setSkipNormalizationHint(obj) {
		object.addNonEnumerableProperty(obj, SENTRY_SKIP_NORMALIZATION, true);
	}
	function setNormalizationDepthOverrideHint(obj, depth) {
		object.addNonEnumerableProperty(obj, SENTRY_OVERRIDE_NORMALIZATION_DEPTH, depth);
	}
	function hasSkipNormalizationHint(value) {
		return Boolean(value[SENTRY_SKIP_NORMALIZATION]);
	}
	function getNormalizationDepthOverrideHint(value) {
		const v = value[SENTRY_OVERRIDE_NORMALIZATION_DEPTH];
		return typeof v === "number" ? v : void 0;
	}
	exports.getNormalizationDepthOverrideHint = getNormalizationDepthOverrideHint;
	exports.hasSkipNormalizationHint = hasSkipNormalizationHint;
	exports.setNormalizationDepthOverrideHint = setNormalizationDepthOverrideHint;
	exports.setSkipNormalizationHint = setSkipNormalizationHint;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/normalize.js
var require_normalize = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const normalizationHints = require_normalizationHints();
	const object = require_object();
	const stacktrace = require_stacktrace();
	let stringifier;
	function setNormalizeStringifier(newStringifier) {
		stringifier = newStringifier;
	}
	function normalize(input, depth = 100, maxProperties = Infinity) {
		try {
			return visit("", input, depth, maxProperties);
		} catch (err) {
			return { ERROR: `**non-serializable** (${err})` };
		}
	}
	function normalizeToSize(object, depth = 3, maxSize = 100 * 1024) {
		const normalized = normalize(object, depth);
		if (jsonSize(normalized) > maxSize) return normalizeToSize(object, depth - 1, maxSize);
		return normalized;
	}
	function visit(key, value, depth = Infinity, maxProperties = Infinity, memo = memoBuilder()) {
		const [memoize, unmemoize] = memo;
		if (value == null || ["boolean", "string"].includes(typeof value) || typeof value === "number" && Number.isFinite(value)) return value;
		const stringified = stringifyValue(key, value);
		if (!stringified.startsWith("[object ")) return stringified;
		if (normalizationHints.hasSkipNormalizationHint(value)) return value;
		const overrideDepth = normalizationHints.getNormalizationDepthOverrideHint(value);
		const remainingDepth = overrideDepth !== void 0 ? overrideDepth : depth;
		if (remainingDepth === 0) return stringified.replace("object ", "");
		if (memoize(value)) return "[Circular ~]";
		const valueWithToJSON = value;
		if (valueWithToJSON && typeof valueWithToJSON.toJSON === "function") try {
			return visit("", valueWithToJSON.toJSON(), remainingDepth - 1, maxProperties, memo);
		} catch {}
		const normalized = Array.isArray(value) ? [] : {};
		let numAdded = 0;
		const visitable = object.convertToPlainObject(value);
		for (const visitKey in visitable) {
			if (!Object.prototype.hasOwnProperty.call(visitable, visitKey)) continue;
			if (numAdded >= maxProperties) {
				normalized[visitKey] = "[MaxProperties ~]";
				break;
			}
			const visitValue = visitable[visitKey];
			normalized[visitKey] = visit(visitKey, visitValue, remainingDepth - 1, maxProperties, memo);
			numAdded++;
		}
		unmemoize(value);
		return normalized;
	}
	function stringifyValue(key, value) {
		try {
			if (stringifier) {
				const stringified = stringifier(value);
				if (stringified) return stringified;
			}
			if (typeof global !== "undefined" && value === global) return "[Global]";
			if (typeof value === "number" && !Number.isFinite(value)) return `[${value}]`;
			if (typeof value === "function") return `[Function: ${stacktrace.getFunctionName(value)}]`;
			if (typeof value === "symbol") return `[${String(value)}]`;
			if (typeof value === "bigint") return `[BigInt: ${String(value)}]`;
			return `[object ${getConstructorName(value)}]`;
		} catch (err) {
			return `**non-serializable** (${err})`;
		}
	}
	function getConstructorName(value) {
		const prototype = Object.getPrototypeOf(value);
		return prototype?.constructor ? prototype.constructor.name : "null prototype";
	}
	function utf8Length(value) {
		return ~-encodeURI(value).split(/%..|./).length;
	}
	function jsonSize(value) {
		return utf8Length(JSON.stringify(value));
	}
	function normalizeUrlToBase(url, basePath) {
		const escapedBase = basePath.replace(/\\/g, "/").replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
		let newUrl = url;
		try {
			newUrl = decodeURI(url);
		} catch {}
		return newUrl.replace(/\\/g, "/").replace(/webpack:\/?/g, "").replace(new RegExp(`(file://)?/*${escapedBase}/*`, "ig"), "app:///");
	}
	function memoBuilder() {
		const inner = /* @__PURE__ */ new WeakSet();
		function memoize(obj) {
			if (inner.has(obj)) return true;
			inner.add(obj);
			return false;
		}
		function unmemoize(obj) {
			inner.delete(obj);
		}
		return [memoize, unmemoize];
	}
	exports.normalize = normalize;
	exports.normalizeToSize = normalizeToSize;
	exports.normalizeUrlToBase = normalizeUrlToBase;
	exports.setNormalizeStringifier = setNormalizeStringifier;
	exports.stringifyValue = stringifyValue;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/string.js
var require_string = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const is = require_is();
	const normalize = require_normalize();
	function truncate(str, max = 0) {
		if (typeof str !== "string" || max === 0) return str;
		return str.length <= max ? str : `${str.slice(0, max)}...`;
	}
	function snipLine(line, colno) {
		let newLine = line;
		const lineLength = newLine.length;
		if (lineLength <= 150) return newLine;
		if (colno > lineLength) colno = lineLength;
		let start = Math.max(colno - 60, 0);
		if (start < 5) start = 0;
		let end = Math.min(start + 140, lineLength);
		if (end > lineLength - 5) end = lineLength;
		if (end === lineLength) start = Math.max(end - 140, 0);
		newLine = newLine.slice(start, end);
		if (start > 0) newLine = `'{snip} ${newLine}`;
		if (end < lineLength) newLine += " {snip}";
		return newLine;
	}
	function safeJoin(input, delimiter) {
		if (!Array.isArray(input)) return "";
		const output = [];
		for (let i = 0; i < input.length; i++) {
			const value = input[i];
			if (is.isPrimitive(value)) output.push(String(value));
			else if (value instanceof Error) output.push(value.message ? `${value.name}: ${value.message}` : value.name);
			else output.push(normalize.stringifyValue(void 0, value));
		}
		return output.join(delimiter);
	}
	function isMatchingPattern(value, pattern, requireExactStringMatch = false) {
		if (!is.isString(value)) return false;
		if (is.isRegExp(pattern)) return pattern.test(value);
		if (is.isString(pattern)) return requireExactStringMatch ? value === pattern : value.includes(pattern);
		if (typeof pattern === "function") return pattern(value);
		return false;
	}
	function stringMatchesSomePattern(testString, patterns = [], requireExactStringMatch = false) {
		for (const pattern of patterns) if (isMatchingPattern(testString, pattern, requireExactStringMatch)) return true;
		return false;
	}
	exports.isMatchingPattern = isMatchingPattern;
	exports.safeJoin = safeJoin;
	exports.snipLine = snipLine;
	exports.stringMatchesSomePattern = stringMatchesSomePattern;
	exports.truncate = truncate;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/misc.js
var require_misc = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const object = require_object();
	const randomSafeContext = require_randomSafeContext();
	const string = require_string();
	const worldwide = require_worldwide();
	function getCrypto() {
		const gbl = worldwide.GLOBAL_OBJ;
		return gbl.crypto || gbl.msCrypto;
	}
	let emptyUuid;
	function getRandomByte() {
		return randomSafeContext.safeMathRandom() * 16;
	}
	function uuid4(crypto = getCrypto()) {
		try {
			if (crypto?.randomUUID) return randomSafeContext.withRandomSafeContext(() => crypto.randomUUID()).replace(/-/g, "");
		} catch {}
		if (!emptyUuid) emptyUuid = "10000000100040008000100000000000";
		return emptyUuid.replace(/[018]/g, (c) => (c ^ (getRandomByte() & 15) >> c / 4).toString(16));
	}
	function getFirstException(event) {
		return event.exception?.values?.[0];
	}
	function getEventDescription(event) {
		const { message, event_id: eventId } = event;
		if (message) return message;
		const firstException = getFirstException(event);
		if (firstException) {
			if (firstException.type && firstException.value) return `${firstException.type}: ${firstException.value}`;
			return firstException.type || firstException.value || eventId || "<unknown>";
		}
		return eventId || "<unknown>";
	}
	function addExceptionTypeValue(event, value, type) {
		const exception = event.exception = event.exception || {};
		const values = exception.values = exception.values || [];
		const firstException = values[0] = values[0] || {};
		if (!firstException.value) firstException.value = value || "";
		if (!firstException.type) firstException.type = type || "Error";
	}
	function addExceptionMechanism(event, newMechanism) {
		const firstException = getFirstException(event);
		if (!firstException) return;
		const defaultMechanism = {
			type: "generic",
			handled: true
		};
		const currentMechanism = firstException.mechanism;
		firstException.mechanism = {
			...defaultMechanism,
			...currentMechanism,
			...newMechanism
		};
		if (newMechanism && "data" in newMechanism) {
			const mergedData = {
				...currentMechanism?.data,
				...newMechanism.data
			};
			firstException.mechanism.data = mergedData;
		}
	}
	const SEMVER_REGEXP = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
	function _parseInt(input) {
		return parseInt(input || "", 10);
	}
	function parseSemver(input) {
		const match = input.match(SEMVER_REGEXP) || [];
		const major = _parseInt(match[1]);
		const minor = _parseInt(match[2]);
		const patch = _parseInt(match[3]);
		return {
			buildmetadata: match[5],
			major: isNaN(major) ? void 0 : major,
			minor: isNaN(minor) ? void 0 : minor,
			patch: isNaN(patch) ? void 0 : patch,
			prerelease: match[4]
		};
	}
	function addContextToFrame(lines, frame, linesOfContext = 5) {
		if (frame.lineno === void 0) return;
		const maxLines = lines.length;
		const sourceLine = Math.max(Math.min(maxLines - 1, frame.lineno - 1), 0);
		frame.pre_context = lines.slice(Math.max(0, sourceLine - linesOfContext), sourceLine).map((line) => string.snipLine(line, 0));
		const lineIndex = Math.min(maxLines - 1, sourceLine);
		frame.context_line = string.snipLine(lines[lineIndex], frame.colno || 0);
		frame.post_context = lines.slice(Math.min(sourceLine + 1, maxLines), sourceLine + 1 + linesOfContext).map((line) => string.snipLine(line, 0));
	}
	function checkOrSetAlreadyCaught(exception) {
		if (isAlreadyCaptured(exception)) return true;
		try {
			object.addNonEnumerableProperty(exception, "__sentry_captured__", true);
		} catch {}
		return false;
	}
	function isAlreadyCaptured(exception) {
		try {
			return exception.__sentry_captured__;
		} catch {}
	}
	exports.addContextToFrame = addContextToFrame;
	exports.addExceptionMechanism = addExceptionMechanism;
	exports.addExceptionTypeValue = addExceptionTypeValue;
	exports.checkOrSetAlreadyCaught = checkOrSetAlreadyCaught;
	exports.getEventDescription = getEventDescription;
	exports.isAlreadyCaptured = isAlreadyCaptured;
	exports.parseSemver = parseSemver;
	exports.uuid4 = uuid4;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/time.js
var require_time = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const randomSafeContext = require_randomSafeContext();
	const worldwide = require_worldwide();
	const ONE_SECOND_IN_MS = 1e3;
	function dateTimestampInSeconds() {
		return randomSafeContext.safeDateNow() / ONE_SECOND_IN_MS;
	}
	function createUnixTimestampInSecondsFunc() {
		const { performance } = worldwide.GLOBAL_OBJ;
		if (!performance?.now || !performance.timeOrigin) return dateTimestampInSeconds;
		const timeOrigin = performance.timeOrigin;
		return () => {
			return (timeOrigin + randomSafeContext.withRandomSafeContext(() => performance.now())) / ONE_SECOND_IN_MS;
		};
	}
	let _cachedTimestampInSeconds;
	function timestampInSeconds() {
		return (_cachedTimestampInSeconds ?? (_cachedTimestampInSeconds = createUnixTimestampInSecondsFunc()))();
	}
	let cachedTimeOrigin = null;
	function getBrowserTimeOrigin() {
		const { performance } = worldwide.GLOBAL_OBJ;
		if (!performance?.now) return;
		const threshold = 3e5;
		const performanceNow = randomSafeContext.withRandomSafeContext(() => performance.now());
		const dateNow = randomSafeContext.safeDateNow();
		const timeOrigin = performance.timeOrigin;
		if (typeof timeOrigin === "number") {
			if (Math.abs(timeOrigin + performanceNow - dateNow) < threshold) return timeOrigin;
		}
		const navigationStart = performance.timing?.navigationStart;
		if (typeof navigationStart === "number") {
			if (Math.abs(navigationStart + performanceNow - dateNow) < threshold) return navigationStart;
		}
		return dateNow - performanceNow;
	}
	function browserPerformanceTimeOrigin() {
		if (cachedTimeOrigin === null) cachedTimeOrigin = getBrowserTimeOrigin();
		return cachedTimeOrigin;
	}
	exports.browserPerformanceTimeOrigin = browserPerformanceTimeOrigin;
	exports.dateTimestampInSeconds = dateTimestampInSeconds;
	exports.timestampInSeconds = timestampInSeconds;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/session.js
var require_session = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const misc = require_misc();
	const time = require_time();
	function makeSession(context) {
		const startingTime = time.timestampInSeconds();
		const session = {
			sid: misc.uuid4(),
			init: true,
			timestamp: startingTime,
			started: startingTime,
			duration: 0,
			status: "ok",
			errors: 0,
			ignoreDuration: false,
			toJSON: () => sessionToJSON(session)
		};
		if (context) updateSession(session, context);
		return session;
	}
	function updateSession(session, context = {}) {
		if (context.user) {
			if (!session.ipAddress && context.user.ip_address) session.ipAddress = context.user.ip_address;
			if (!session.did && !context.did) session.did = context.user.id || context.user.email || context.user.username;
		}
		session.timestamp = context.timestamp || time.timestampInSeconds();
		if (context.abnormal_mechanism) session.abnormal_mechanism = context.abnormal_mechanism;
		if (context.ignoreDuration) session.ignoreDuration = context.ignoreDuration;
		if (context.sid) session.sid = context.sid.length === 32 ? context.sid : misc.uuid4();
		if (context.init !== void 0) session.init = context.init;
		if (!session.did && context.did) session.did = `${context.did}`;
		if (typeof context.started === "number") session.started = context.started;
		if (session.ignoreDuration) session.duration = void 0;
		else if (typeof context.duration === "number") session.duration = context.duration;
		else {
			const duration = session.timestamp - session.started;
			session.duration = duration >= 0 ? duration : 0;
		}
		if (context.release) session.release = context.release;
		if (context.environment) session.environment = context.environment;
		if (!session.ipAddress && context.ipAddress) session.ipAddress = context.ipAddress;
		if (!session.userAgent && context.userAgent) session.userAgent = context.userAgent;
		if (typeof context.errors === "number") session.errors = context.errors;
		if (context.status) session.status = context.status;
	}
	function closeSession(session, status) {
		let context = {};
		if (status) context = { status };
		else if (session.status === "ok") context = { status: "exited" };
		updateSession(session, context);
	}
	function sessionToJSON(session) {
		return {
			sid: `${session.sid}`,
			init: session.init,
			started: (/* @__PURE__ */ new Date(session.started * 1e3)).toISOString(),
			timestamp: (/* @__PURE__ */ new Date(session.timestamp * 1e3)).toISOString(),
			status: session.status,
			errors: session.errors,
			did: typeof session.did === "number" || typeof session.did === "string" ? `${session.did}` : void 0,
			duration: session.duration,
			abnormal_mechanism: session.abnormal_mechanism,
			attrs: {
				release: session.release,
				environment: session.environment,
				ip_address: session.ipAddress,
				user_agent: session.userAgent
			}
		};
	}
	exports.closeSession = closeSession;
	exports.makeSession = makeSession;
	exports.updateSession = updateSession;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/merge.js
var require_merge = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	function merge(initialObj, mergeObj, levels = 2) {
		if (!mergeObj || typeof mergeObj !== "object" || levels <= 0) return mergeObj;
		if (initialObj && Object.keys(mergeObj).length === 0) return initialObj;
		const output = { ...initialObj };
		for (const key in mergeObj) if (Object.prototype.hasOwnProperty.call(mergeObj, key)) output[key] = merge(output[key], mergeObj[key], levels - 1);
		return output;
	}
	exports.merge = merge;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/propagationContext.js
var require_propagationContext = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const misc = require_misc();
	function generateTraceId() {
		return misc.uuid4();
	}
	function generateSpanId() {
		return misc.uuid4().substring(16);
	}
	exports.generateSpanId = generateSpanId;
	exports.generateTraceId = generateTraceId;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/scope.js
var require_scope = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const debugBuild = require_debug_build();
	const session = require_session();
	const debugLogger = require_debug_logger();
	const is = require_is();
	const merge = require_merge();
	const misc = require_misc();
	const propagationContext = require_propagationContext();
	const randomSafeContext = require_randomSafeContext();
	const spanOnScope = require_spanOnScope();
	const string = require_string();
	const time = require_time();
	const DEFAULT_MAX_BREADCRUMBS = 100;
	exports.Scope = class Scope {
		constructor() {
			this._notifyingListeners = false;
			this._scopeListeners = [];
			this._eventProcessors = [];
			this._breadcrumbs = [];
			this._attachments = [];
			this._user = {};
			this._tags = {};
			this._attributes = {};
			this._extra = {};
			this._contexts = {};
			this._sdkProcessingMetadata = {};
			this._propagationContext = {
				traceId: propagationContext.generateTraceId(),
				sampleRand: randomSafeContext.safeMathRandom()
			};
		}
		/**
		* Clone all data from this scope into a new scope.
		*/
		clone() {
			const newScope = new Scope();
			newScope._breadcrumbs = [...this._breadcrumbs];
			newScope._tags = { ...this._tags };
			newScope._attributes = { ...this._attributes };
			newScope._extra = { ...this._extra };
			newScope._contexts = { ...this._contexts };
			if (this._contexts.flags) newScope._contexts.flags = { values: [...this._contexts.flags.values] };
			newScope._user = this._user;
			newScope._level = this._level;
			newScope._session = this._session;
			newScope._transactionName = this._transactionName;
			newScope._fingerprint = this._fingerprint;
			newScope._eventProcessors = [...this._eventProcessors];
			newScope._attachments = [...this._attachments];
			newScope._sdkProcessingMetadata = { ...this._sdkProcessingMetadata };
			newScope._propagationContext = { ...this._propagationContext };
			newScope._client = this._client;
			newScope._lastEventId = this._lastEventId;
			newScope._conversationId = this._conversationId;
			spanOnScope._setSpanForScope(newScope, spanOnScope._getSpanForScope(this));
			return newScope;
		}
		/**
		* Update the client assigned to this scope.
		* Note that not every scope will have a client assigned - isolation scopes & the global scope will generally not have a client,
		* as well as manually created scopes.
		*/
		setClient(client) {
			this._client = client;
		}
		/**
		* Set the ID of the last captured error event.
		* This is generally only captured on the isolation scope.
		*/
		setLastEventId(lastEventId) {
			this._lastEventId = lastEventId;
		}
		/**
		* Get the client assigned to this scope.
		*/
		getClient() {
			return this._client;
		}
		/**
		* Get the ID of the last captured error event.
		* This is generally only available on the isolation scope.
		*/
		lastEventId() {
			return this._lastEventId;
		}
		/**
		* @inheritDoc
		*/
		addScopeListener(callback) {
			this._scopeListeners.push(callback);
		}
		/**
		* Add an event processor that will be called before an event is sent.
		*/
		addEventProcessor(callback) {
			this._eventProcessors.push(callback);
			return this;
		}
		/**
		* Set the user for this scope.
		* Set to `null` to unset the user.
		*/
		setUser(user) {
			this._user = user || {
				email: void 0,
				id: void 0,
				ip_address: void 0,
				username: void 0
			};
			if (this._session) session.updateSession(this._session, { user });
			this._notifyScopeListeners();
			return this;
		}
		/**
		* Get the user from this scope.
		*/
		getUser() {
			return this._user;
		}
		/**
		* Set the conversation ID for this scope.
		* Set to `null` to unset the conversation ID.
		*/
		setConversationId(conversationId) {
			this._conversationId = conversationId || void 0;
			this._notifyScopeListeners();
			return this;
		}
		/**
		* Set an object that will be merged into existing tags on the scope,
		* and will be sent as tags data with the event.
		*/
		setTags(tags) {
			this._tags = {
				...this._tags,
				...tags
			};
			this._notifyScopeListeners();
			return this;
		}
		/**
		* Set a single tag that will be sent as tags data with the event.
		*/
		setTag(key, value) {
			return this.setTags({ [key]: value });
		}
		/**
		* Sets attributes onto the scope.
		*
		* These attributes are applied to logs, metrics and streamed spans.
		*
		* Supported attribute value types are `string`, `number`, `boolean`, `string[]`, `number[]` and `boolean[]`.
		*
		* @param newAttributes - The attributes to set on the scope, as key-value pairs.
		*
		* @example
		* ```typescript
		* scope.setAttributes({
		*   is_admin: true,
		*   payment_selection: 'credit_card',
		*   render_duration: 150,
		* });
		* ```
		*/
		setAttributes(newAttributes) {
			this._attributes = {
				...this._attributes,
				...newAttributes
			};
			this._notifyScopeListeners();
			return this;
		}
		/**
		* Sets an attribute onto the scope.
		*
		* These attributes are applied to logs, metrics and streamed spans.
		*
		* Supported attribute value types are `string`, `number`, `boolean`, `string[]`, `number[]` and `boolean[]`.
		*
		* @param key - The attribute key.
		* @param value - The attribute value.
		*
		* @example
		* ```typescript
		* scope.setAttribute('is_admin', true);
		* scope.setAttribute('render_duration', 150);
		* ```
		*/
		setAttribute(key, value) {
			return this.setAttributes({ [key]: value });
		}
		/**
		* Removes the attribute with the given key from the scope.
		*
		* @param key - The attribute key.
		*
		* @example
		* ```typescript
		* scope.removeAttribute('is_admin');
		* ```
		*/
		removeAttribute(key) {
			if (key in this._attributes) {
				delete this._attributes[key];
				this._notifyScopeListeners();
			}
			return this;
		}
		/**
		* Set an object that will be merged into existing extra on the scope,
		* and will be sent as extra data with the event.
		*/
		setExtras(extras) {
			this._extra = {
				...this._extra,
				...extras
			};
			this._notifyScopeListeners();
			return this;
		}
		/**
		* Set a single key:value extra entry that will be sent as extra data with the event.
		*/
		setExtra(key, extra) {
			this._extra = {
				...this._extra,
				[key]: extra
			};
			this._notifyScopeListeners();
			return this;
		}
		/**
		* Sets the fingerprint on the scope to send with the events.
		* @param {string[]} fingerprint Fingerprint to group events in Sentry.
		*/
		setFingerprint(fingerprint) {
			this._fingerprint = fingerprint;
			this._notifyScopeListeners();
			return this;
		}
		/**
		* Sets the level on the scope for future events.
		*/
		setLevel(level) {
			this._level = level;
			this._notifyScopeListeners();
			return this;
		}
		/**
		* Sets the transaction name on the scope so that the name of e.g. taken server route or
		* the page location is attached to future events.
		*
		* IMPORTANT: Calling this function does NOT change the name of the currently active
		* root span. If you want to change the name of the active root span, use
		* `Sentry.updateSpanName(rootSpan, 'new name')` instead.
		*
		* By default, the SDK updates the scope's transaction name automatically on sensible
		* occasions, such as a page navigation or when handling a new request on the server.
		*/
		setTransactionName(name) {
			this._transactionName = name;
			this._notifyScopeListeners();
			return this;
		}
		/**
		* Sets context data with the given name.
		* Data passed as context will be normalized. You can also pass `null` to unset the context.
		* Note that context data will not be merged - calling `setContext` will overwrite an existing context with the same key.
		*/
		setContext(key, context) {
			if (context === null) delete this._contexts[key];
			else this._contexts[key] = context;
			this._notifyScopeListeners();
			return this;
		}
		/**
		* Set the session for the scope.
		*/
		setSession(session) {
			if (!session) delete this._session;
			else this._session = session;
			this._notifyScopeListeners();
			return this;
		}
		/**
		* Get the session from the scope.
		*/
		getSession() {
			return this._session;
		}
		/**
		* Updates the scope with provided data. Can work in three variations:
		* - plain object containing updatable attributes
		* - Scope instance that'll extract the attributes from
		* - callback function that'll receive the current scope as an argument and allow for modifications
		*/
		update(captureContext) {
			if (!captureContext) return this;
			const scopeToMerge = typeof captureContext === "function" ? captureContext(this) : captureContext;
			const { tags, attributes, extra, user, contexts, level, fingerprint = [], propagationContext, conversationId } = (scopeToMerge instanceof Scope ? scopeToMerge.getScopeData() : is.isPlainObject(scopeToMerge) ? captureContext : void 0) || {};
			this._tags = {
				...this._tags,
				...tags
			};
			this._attributes = {
				...this._attributes,
				...attributes
			};
			this._extra = {
				...this._extra,
				...extra
			};
			this._contexts = {
				...this._contexts,
				...contexts
			};
			if (user && Object.keys(user).length) this._user = user;
			if (level) this._level = level;
			if (fingerprint.length) this._fingerprint = fingerprint;
			if (propagationContext) this._propagationContext = propagationContext;
			if (conversationId) this._conversationId = conversationId;
			return this;
		}
		/**
		* Clears the current scope and resets its properties.
		* Note: The client will not be cleared.
		*/
		clear() {
			this._breadcrumbs = [];
			this._tags = {};
			this._attributes = {};
			this._extra = {};
			this._user = {};
			this._contexts = {};
			this._level = void 0;
			this._transactionName = void 0;
			this._fingerprint = void 0;
			this._session = void 0;
			this._conversationId = void 0;
			spanOnScope._setSpanForScope(this, void 0);
			this._attachments = [];
			this.setPropagationContext({
				traceId: propagationContext.generateTraceId(),
				sampleRand: randomSafeContext.safeMathRandom()
			});
			this._notifyScopeListeners();
			return this;
		}
		/**
		* Adds a breadcrumb to the scope.
		* By default, the last 100 breadcrumbs are kept.
		*/
		addBreadcrumb(breadcrumb, maxBreadcrumbs) {
			const maxCrumbs = typeof maxBreadcrumbs === "number" ? maxBreadcrumbs : DEFAULT_MAX_BREADCRUMBS;
			if (maxCrumbs <= 0) return this;
			const mergedBreadcrumb = {
				timestamp: time.dateTimestampInSeconds(),
				...breadcrumb,
				message: breadcrumb.message ? string.truncate(breadcrumb.message, 2048) : breadcrumb.message
			};
			this._breadcrumbs.push(mergedBreadcrumb);
			if (this._breadcrumbs.length > maxCrumbs) {
				this._breadcrumbs = this._breadcrumbs.slice(-maxCrumbs);
				this._client?.recordDroppedEvent("buffer_overflow", "log_item");
			}
			this._notifyScopeListeners();
			return this;
		}
		/**
		* Get the last breadcrumb of the scope.
		*/
		getLastBreadcrumb() {
			return this._breadcrumbs[this._breadcrumbs.length - 1];
		}
		/**
		* Clear all breadcrumbs from the scope.
		*/
		clearBreadcrumbs() {
			this._breadcrumbs = [];
			this._notifyScopeListeners();
			return this;
		}
		/**
		* Add an attachment to the scope.
		*/
		addAttachment(attachment) {
			this._attachments.push(attachment);
			return this;
		}
		/**
		* Clear all attachments from the scope.
		*/
		clearAttachments() {
			this._attachments = [];
			return this;
		}
		/**
		* Get the data of this scope, which should be applied to an event during processing.
		*/
		getScopeData() {
			return {
				breadcrumbs: this._breadcrumbs,
				attachments: this._attachments,
				contexts: this._contexts,
				tags: this._tags,
				attributes: this._attributes,
				extra: this._extra,
				user: this._user,
				level: this._level,
				fingerprint: this._fingerprint || [],
				eventProcessors: this._eventProcessors,
				propagationContext: this._propagationContext,
				sdkProcessingMetadata: this._sdkProcessingMetadata,
				transactionName: this._transactionName,
				span: spanOnScope._getSpanForScope(this),
				conversationId: this._conversationId
			};
		}
		/**
		* Add data which will be accessible during event processing but won't get sent to Sentry.
		*/
		setSDKProcessingMetadata(newData) {
			this._sdkProcessingMetadata = merge.merge(this._sdkProcessingMetadata, newData, 2);
			return this;
		}
		/**
		* Add propagation context to the scope, used for distributed tracing
		*/
		setPropagationContext(context) {
			this._propagationContext = context;
			return this;
		}
		/**
		* Get propagation context from the scope, used for distributed tracing
		*/
		getPropagationContext() {
			return this._propagationContext;
		}
		/**
		* Capture an exception for this scope.
		*
		* @returns {string} The id of the captured Sentry event.
		*/
		captureException(exception, hint) {
			const eventId = hint?.event_id || misc.uuid4();
			if (!this._client) {
				debugBuild.DEBUG_BUILD && debugLogger.debug.warn("No client configured on scope - will not capture exception!");
				return eventId;
			}
			const syntheticException = /* @__PURE__ */ new Error("Sentry syntheticException");
			this._client.captureException(exception, {
				originalException: exception,
				syntheticException,
				...hint,
				event_id: eventId
			}, this);
			return eventId;
		}
		/**
		* Capture a message for this scope.
		*
		* @returns {string} The id of the captured message.
		*/
		captureMessage(message, level, hint) {
			const eventId = hint?.event_id || misc.uuid4();
			if (!this._client) {
				debugBuild.DEBUG_BUILD && debugLogger.debug.warn("No client configured on scope - will not capture message!");
				return eventId;
			}
			const syntheticException = hint?.syntheticException ?? new Error(message);
			this._client.captureMessage(message, level, {
				originalException: message,
				syntheticException,
				...hint,
				event_id: eventId
			}, this);
			return eventId;
		}
		/**
		* Capture a Sentry event for this scope.
		*
		* @returns {string} The id of the captured event.
		*/
		captureEvent(event, hint) {
			const eventId = event.event_id || hint?.event_id || misc.uuid4();
			if (!this._client) {
				debugBuild.DEBUG_BUILD && debugLogger.debug.warn("No client configured on scope - will not capture event!");
				return eventId;
			}
			this._client.captureEvent(event, {
				...hint,
				event_id: eventId
			}, this);
			return eventId;
		}
		/**
		* This will be called on every set call.
		*/
		_notifyScopeListeners() {
			if (!this._notifyingListeners) {
				this._notifyingListeners = true;
				this._scopeListeners.forEach((callback) => {
					callback(this);
				});
				this._notifyingListeners = false;
			}
		}
	};
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/defaultScopes.js
var require_defaultScopes = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const carrier = require_carrier();
	const scope = require_scope();
	function getDefaultCurrentScope() {
		return carrier.getGlobalSingleton("defaultCurrentScope", () => new scope.Scope());
	}
	function getDefaultIsolationScope() {
		return carrier.getGlobalSingleton("defaultIsolationScope", () => new scope.Scope());
	}
	exports.getDefaultCurrentScope = getDefaultCurrentScope;
	exports.getDefaultIsolationScope = getDefaultIsolationScope;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/chain-and-copy-promiselike.js
var require_chain_and_copy_promiselike = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const isActualPromise = (p) => p instanceof Promise && !p[kChainedCopy];
	const kChainedCopy = /* @__PURE__ */ Symbol("chained PromiseLike");
	const chainAndCopyPromiseLike = (original, onSuccess, onError) => {
		const chained = original.then((value) => {
			onSuccess(value);
			return value;
		}, (err) => {
			onError(err);
			throw err;
		});
		return isActualPromise(chained) && isActualPromise(original) ? chained : copyProps(original, chained);
	};
	const copyProps = (original, chained) => {
		if (!chained) return original;
		let mutated = false;
		for (const key in original) {
			if (key in chained) continue;
			mutated = true;
			const value = original[key];
			if (typeof value === "function") Object.defineProperty(chained, key, {
				value: (...args) => value.apply(original, args),
				enumerable: true,
				configurable: true,
				writable: true
			});
			else chained[key] = value;
		}
		if (mutated) Object.assign(chained, { [kChainedCopy]: true });
		return chained;
	};
	exports.chainAndCopyPromiseLike = chainAndCopyPromiseLike;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/asyncContext/stackStrategy.js
var require_stackStrategy = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const defaultScopes = require_defaultScopes();
	const scope = require_scope();
	const chainAndCopyPromiselike = require_chain_and_copy_promiselike();
	const is = require_is();
	const carrier = require_carrier();
	var AsyncContextStack = class {
		constructor(scope$1, isolationScope) {
			let assignedScope;
			if (!scope$1) assignedScope = new scope.Scope();
			else assignedScope = scope$1;
			let assignedIsolationScope;
			if (!isolationScope) assignedIsolationScope = new scope.Scope();
			else assignedIsolationScope = isolationScope;
			this._stack = [{ scope: assignedScope }];
			this._isolationScope = assignedIsolationScope;
		}
		/**
		* Fork a scope for the stack.
		*/
		withScope(callback) {
			const scope = this._pushScope();
			let maybePromiseResult;
			try {
				maybePromiseResult = callback(scope);
			} catch (e) {
				this._popScope();
				throw e;
			}
			if (is.isThenable(maybePromiseResult)) return chainAndCopyPromiselike.chainAndCopyPromiseLike(maybePromiseResult, () => this._popScope(), () => this._popScope());
			this._popScope();
			return maybePromiseResult;
		}
		/**
		* Get the client of the stack.
		*/
		getClient() {
			return this.getStackTop().client;
		}
		/**
		* Returns the scope of the top stack.
		*/
		getScope() {
			return this.getStackTop().scope;
		}
		/**
		* Get the isolation scope for the stack.
		*/
		getIsolationScope() {
			return this._isolationScope;
		}
		/**
		* Returns the topmost scope layer in the order domain > local > process.
		*/
		getStackTop() {
			return this._stack[this._stack.length - 1];
		}
		/**
		* Push a scope to the stack.
		*/
		_pushScope() {
			const scope = this.getScope().clone();
			this._stack.push({
				client: this.getClient(),
				scope
			});
			return scope;
		}
		/**
		* Pop a scope from the stack.
		*/
		_popScope() {
			if (this._stack.length <= 1) return false;
			return !!this._stack.pop();
		}
	};
	function getAsyncContextStack() {
		const registry = carrier.getMainCarrier();
		const sentry = carrier.getSentryCarrier(registry);
		return sentry.stack = sentry.stack || new AsyncContextStack(defaultScopes.getDefaultCurrentScope(), defaultScopes.getDefaultIsolationScope());
	}
	function withScope(callback) {
		return getAsyncContextStack().withScope(callback);
	}
	function withSetScope(scope, callback) {
		const stack = getAsyncContextStack();
		return stack.withScope(() => {
			stack.getStackTop().scope = scope;
			return callback(scope);
		});
	}
	function withIsolationScope(callback) {
		return getAsyncContextStack().withScope(() => {
			return callback(getAsyncContextStack().getIsolationScope());
		});
	}
	function getStackAsyncContextStrategy() {
		return {
			withIsolationScope,
			withScope,
			withSetScope,
			withSetIsolationScope: (_isolationScope, callback) => {
				return withIsolationScope(callback);
			},
			getCurrentScope: () => getAsyncContextStack().getScope(),
			getIsolationScope: () => getAsyncContextStack().getIsolationScope()
		};
	}
	exports.AsyncContextStack = AsyncContextStack;
	exports.getStackAsyncContextStrategy = getStackAsyncContextStrategy;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/asyncContext/index.js
var require_asyncContext = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const carrier = require_carrier();
	const spanOnScope = require_spanOnScope();
	const stackStrategy = require_stackStrategy();
	function setAsyncContextStrategy(strategy) {
		const registry = carrier.getMainCarrier();
		const sentry = carrier.getSentryCarrier(registry);
		sentry.acs = strategy;
	}
	function getAsyncContextStrategy(carrier$1) {
		const sentry = carrier.getSentryCarrier(carrier$1);
		if (sentry.acs) return sentry.acs;
		return stackStrategy.getStackAsyncContextStrategy();
	}
	function getTracingChannelBinding() {
		return getAsyncContextStrategy(carrier.getMainCarrier()).getTracingChannelBinding?.();
	}
	function _INTERNAL_createTracingChannelBinding(asyncLocalStorage, getScopes) {
		return {
			asyncLocalStorage,
			getStoreWithActiveSpan: (span) => {
				const { scope, isolationScope } = getScopes();
				const activeScope = scope.clone();
				spanOnScope._setSpanForScope(activeScope, span);
				return {
					scope: activeScope,
					isolationScope
				};
			}
		};
	}
	exports._INTERNAL_createTracingChannelBinding = _INTERNAL_createTracingChannelBinding;
	exports.getAsyncContextStrategy = getAsyncContextStrategy;
	exports.getTracingChannelBinding = getTracingChannelBinding;
	exports.setAsyncContextStrategy = setAsyncContextStrategy;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/attributes.js
var require_attributes$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const is = require_is();
	function isAttributeObject(maybeObj) {
		return typeof maybeObj === "object" && maybeObj != null && !Array.isArray(maybeObj) && Object.keys(maybeObj).includes("value");
	}
	function attributeValueToTypedAttributeValue(rawValue, useFallback) {
		const { value, unit } = isAttributeObject(rawValue) ? rawValue : {
			value: rawValue,
			unit: void 0
		};
		const attributeValue = getTypedAttributeValue(value);
		const checkedUnit = unit && typeof unit === "string" ? { unit } : {};
		if (attributeValue) return {
			...attributeValue,
			...checkedUnit
		};
		if (!useFallback || useFallback === "skip-undefined" && value === void 0) return;
		let stringValue = "";
		try {
			stringValue = JSON.stringify(value) ?? "";
		} catch {}
		return {
			value: stringValue,
			type: "string",
			...checkedUnit
		};
	}
	function serializeAttributes(attributes, fallback = false) {
		const serializedAttributes = {};
		for (const [key, value] of Object.entries(attributes ?? {})) {
			const typedValue = attributeValueToTypedAttributeValue(value, fallback);
			if (typedValue) serializedAttributes[key] = typedValue;
		}
		return serializedAttributes;
	}
	function estimateTypedAttributesSizeInBytes(attributes) {
		if (!attributes) return 0;
		let weight = 0;
		for (const [key, attr] of Object.entries(attributes)) {
			weight += key.length * 2;
			weight += attr.type.length * 2;
			weight += (attr.unit?.length ?? 0) * 2;
			const val = attr.value;
			if (Array.isArray(val)) weight += estimatePrimitiveSizeInBytes(val[0]) * val.length;
			else if (is.isPrimitive(val)) weight += estimatePrimitiveSizeInBytes(val);
			else weight += 100;
		}
		return weight;
	}
	function estimatePrimitiveSizeInBytes(value) {
		if (typeof value === "string") return value.length * 2;
		else if (typeof value === "boolean") return 4;
		else if (typeof value === "number") return 8;
		return 0;
	}
	function getTypedAttributeValue(value) {
		if (Array.isArray(value)) return {
			value,
			type: "array"
		};
		const primitiveType = typeof value === "string" ? "string" : typeof value === "boolean" ? "boolean" : typeof value === "number" && !Number.isNaN(value) ? Number.isInteger(value) ? "integer" : "double" : null;
		if (primitiveType) return {
			value,
			type: primitiveType
		};
	}
	exports.attributeValueToTypedAttributeValue = attributeValueToTypedAttributeValue;
	exports.estimateTypedAttributesSizeInBytes = estimateTypedAttributesSizeInBytes;
	exports.isAttributeObject = isAttributeObject;
	exports.serializeAttributes = serializeAttributes;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/currentScopes.js
var require_currentScopes = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const index = require_asyncContext();
	const carrier = require_carrier();
	const scope = require_scope();
	const propagationContext = require_propagationContext();
	let _externalPropagationContextProvider;
	function registerExternalPropagationContext(fn) {
		_externalPropagationContextProvider = fn;
	}
	function getExternalPropagationContext() {
		return _externalPropagationContextProvider?.();
	}
	function hasExternalPropagationContext() {
		return _externalPropagationContextProvider !== void 0;
	}
	function getCurrentScope() {
		const carrier$1 = carrier.getMainCarrier();
		return index.getAsyncContextStrategy(carrier$1).getCurrentScope();
	}
	function getIsolationScope() {
		const carrier$1 = carrier.getMainCarrier();
		return index.getAsyncContextStrategy(carrier$1).getIsolationScope();
	}
	function getGlobalScope() {
		return carrier.getGlobalSingleton("globalScope", () => new scope.Scope());
	}
	function withScope(...rest) {
		const carrier$1 = carrier.getMainCarrier();
		const acs = index.getAsyncContextStrategy(carrier$1);
		if (rest.length === 2) {
			const [scope, callback] = rest;
			if (!scope) return acs.withScope(callback);
			return acs.withSetScope(scope, callback);
		}
		return acs.withScope(rest[0]);
	}
	function withIsolationScope(...rest) {
		const carrier$1 = carrier.getMainCarrier();
		const acs = index.getAsyncContextStrategy(carrier$1);
		if (rest.length === 2) {
			const [isolationScope, callback] = rest;
			if (!isolationScope) return acs.withIsolationScope(callback);
			return acs.withSetIsolationScope(isolationScope, callback);
		}
		return acs.withIsolationScope(rest[0]);
	}
	function getClient() {
		return getCurrentScope().getClient();
	}
	function getTraceContextFromScope(scope) {
		const externalContext = getExternalPropagationContext();
		if (externalContext) return {
			trace_id: externalContext.traceId,
			span_id: externalContext.spanId
		};
		const { traceId, parentSpanId, propagationSpanId } = scope.getPropagationContext();
		const traceContext = {
			trace_id: traceId,
			span_id: propagationSpanId || propagationContext.generateSpanId()
		};
		if (parentSpanId) traceContext.parent_span_id = parentSpanId;
		return traceContext;
	}
	exports.getClient = getClient;
	exports.getCurrentScope = getCurrentScope;
	exports.getExternalPropagationContext = getExternalPropagationContext;
	exports.getGlobalScope = getGlobalScope;
	exports.getIsolationScope = getIsolationScope;
	exports.getTraceContextFromScope = getTraceContextFromScope;
	exports.hasExternalPropagationContext = hasExternalPropagationContext;
	exports.registerExternalPropagationContext = registerExternalPropagationContext;
	exports.withIsolationScope = withIsolationScope;
	exports.withScope = withScope;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/semanticAttributes.js
var require_semanticAttributes = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const SEMANTIC_ATTRIBUTE_SENTRY_SOURCE = "sentry.source";
	const SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE = "sentry.sample_rate";
	const SEMANTIC_ATTRIBUTE_SENTRY_PREVIOUS_TRACE_SAMPLE_RATE = "sentry.previous_trace_sample_rate";
	const SEMANTIC_ATTRIBUTE_SENTRY_OP = "sentry.op";
	const SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN = "sentry.origin";
	const SEMANTIC_ATTRIBUTE_SENTRY_IDLE_SPAN_FINISH_REASON = "sentry.idle_span_finish_reason";
	const SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_UNIT = "sentry.measurement_unit";
	const SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_VALUE = "sentry.measurement_value";
	const SEMANTIC_ATTRIBUTE_SENTRY_RELEASE = "sentry.release";
	const SEMANTIC_ATTRIBUTE_SENTRY_ENVIRONMENT = "sentry.environment";
	const SEMANTIC_ATTRIBUTE_SENTRY_SEGMENT_NAME = "sentry.segment.name";
	const SEMANTIC_ATTRIBUTE_SENTRY_SEGMENT_ID = "sentry.segment.id";
	const SEMANTIC_ATTRIBUTE_SENTRY_SDK_NAME = "sentry.sdk.name";
	const SEMANTIC_ATTRIBUTE_SENTRY_SDK_VERSION = "sentry.sdk.version";
	const SEMANTIC_ATTRIBUTE_SENTRY_SDK_INTEGRATIONS = "sentry.sdk.integrations";
	const SEMANTIC_ATTRIBUTE_USER_ID = "user.id";
	const SEMANTIC_ATTRIBUTE_USER_EMAIL = "user.email";
	const SEMANTIC_ATTRIBUTE_USER_IP_ADDRESS = "user.ip_address";
	const SEMANTIC_ATTRIBUTE_USER_USERNAME = "user.name";
	const SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME = "sentry.custom_span_name";
	const SEMANTIC_ATTRIBUTE_PROFILE_ID = "sentry.profile_id";
	const SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME = "sentry.exclusive_time";
	const SEMANTIC_ATTRIBUTE_CACHE_HIT = "cache.hit";
	const SEMANTIC_ATTRIBUTE_CACHE_KEY = "cache.key";
	const SEMANTIC_ATTRIBUTE_CACHE_ITEM_SIZE = "cache.item_size";
	const SEMANTIC_ATTRIBUTE_HTTP_REQUEST_METHOD = "http.request.method";
	const SEMANTIC_ATTRIBUTE_URL_FULL = "url.full";
	const SEMANTIC_LINK_ATTRIBUTE_LINK_TYPE = "sentry.link.type";
	exports.GEN_AI_CONVERSATION_ID_ATTRIBUTE = "gen_ai.conversation.id";
	exports.SEMANTIC_ATTRIBUTE_CACHE_HIT = SEMANTIC_ATTRIBUTE_CACHE_HIT;
	exports.SEMANTIC_ATTRIBUTE_CACHE_ITEM_SIZE = SEMANTIC_ATTRIBUTE_CACHE_ITEM_SIZE;
	exports.SEMANTIC_ATTRIBUTE_CACHE_KEY = SEMANTIC_ATTRIBUTE_CACHE_KEY;
	exports.SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME = SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME;
	exports.SEMANTIC_ATTRIBUTE_HTTP_REQUEST_METHOD = SEMANTIC_ATTRIBUTE_HTTP_REQUEST_METHOD;
	exports.SEMANTIC_ATTRIBUTE_PROFILE_ID = SEMANTIC_ATTRIBUTE_PROFILE_ID;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME = SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_ENVIRONMENT = SEMANTIC_ATTRIBUTE_SENTRY_ENVIRONMENT;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_IDLE_SPAN_FINISH_REASON = SEMANTIC_ATTRIBUTE_SENTRY_IDLE_SPAN_FINISH_REASON;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_UNIT = SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_UNIT;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_VALUE = SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_VALUE;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_OP = SEMANTIC_ATTRIBUTE_SENTRY_OP;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN = SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_PREVIOUS_TRACE_SAMPLE_RATE = SEMANTIC_ATTRIBUTE_SENTRY_PREVIOUS_TRACE_SAMPLE_RATE;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_RELEASE = SEMANTIC_ATTRIBUTE_SENTRY_RELEASE;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE = SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_SDK_INTEGRATIONS = SEMANTIC_ATTRIBUTE_SENTRY_SDK_INTEGRATIONS;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_SDK_NAME = SEMANTIC_ATTRIBUTE_SENTRY_SDK_NAME;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_SDK_VERSION = SEMANTIC_ATTRIBUTE_SENTRY_SDK_VERSION;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_SEGMENT_ID = SEMANTIC_ATTRIBUTE_SENTRY_SEGMENT_ID;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_SEGMENT_NAME = SEMANTIC_ATTRIBUTE_SENTRY_SEGMENT_NAME;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE = SEMANTIC_ATTRIBUTE_SENTRY_SOURCE;
	exports.SEMANTIC_ATTRIBUTE_URL_FULL = SEMANTIC_ATTRIBUTE_URL_FULL;
	exports.SEMANTIC_ATTRIBUTE_USER_EMAIL = SEMANTIC_ATTRIBUTE_USER_EMAIL;
	exports.SEMANTIC_ATTRIBUTE_USER_ID = SEMANTIC_ATTRIBUTE_USER_ID;
	exports.SEMANTIC_ATTRIBUTE_USER_IP_ADDRESS = SEMANTIC_ATTRIBUTE_USER_IP_ADDRESS;
	exports.SEMANTIC_ATTRIBUTE_USER_USERNAME = SEMANTIC_ATTRIBUTE_USER_USERNAME;
	exports.SEMANTIC_LINK_ATTRIBUTE_LINK_TYPE = SEMANTIC_LINK_ATTRIBUTE_LINK_TYPE;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/spanstatus.js
var require_spanstatus = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const SPAN_STATUS_UNSET = 0;
	const SPAN_STATUS_OK = 1;
	const SPAN_STATUS_ERROR = 2;
	function getSpanStatusFromHttpCode(httpStatus) {
		if (httpStatus < 400 && httpStatus >= 100) return { code: SPAN_STATUS_OK };
		if (httpStatus >= 400 && httpStatus < 500) switch (httpStatus) {
			case 401: return {
				code: SPAN_STATUS_ERROR,
				message: "unauthenticated"
			};
			case 403: return {
				code: SPAN_STATUS_ERROR,
				message: "permission_denied"
			};
			case 404: return {
				code: SPAN_STATUS_ERROR,
				message: "not_found"
			};
			case 409: return {
				code: SPAN_STATUS_ERROR,
				message: "already_exists"
			};
			case 413: return {
				code: SPAN_STATUS_ERROR,
				message: "failed_precondition"
			};
			case 429: return {
				code: SPAN_STATUS_ERROR,
				message: "resource_exhausted"
			};
			case 499: return {
				code: SPAN_STATUS_ERROR,
				message: "cancelled"
			};
			default: return {
				code: SPAN_STATUS_ERROR,
				message: "invalid_argument"
			};
		}
		if (httpStatus >= 500 && httpStatus < 600) switch (httpStatus) {
			case 501: return {
				code: SPAN_STATUS_ERROR,
				message: "unimplemented"
			};
			case 503: return {
				code: SPAN_STATUS_ERROR,
				message: "unavailable"
			};
			case 504: return {
				code: SPAN_STATUS_ERROR,
				message: "deadline_exceeded"
			};
			default: return {
				code: SPAN_STATUS_ERROR,
				message: "internal_error"
			};
		}
		return {
			code: SPAN_STATUS_ERROR,
			message: "internal_error"
		};
	}
	function setHttpStatus(span, httpStatus) {
		span.setAttribute("http.response.status_code", httpStatus);
		const spanStatus = getSpanStatusFromHttpCode(httpStatus);
		if (spanStatus.message !== "unknown_error") span.setStatus(spanStatus);
	}
	exports.SPAN_STATUS_ERROR = SPAN_STATUS_ERROR;
	exports.SPAN_STATUS_OK = SPAN_STATUS_OK;
	exports.SPAN_STATUS_UNSET = SPAN_STATUS_UNSET;
	exports.getSpanStatusFromHttpCode = getSpanStatusFromHttpCode;
	exports.setHttpStatus = setHttpStatus;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/utils.js
var require_utils$9 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const object = require_object();
	const weakRef = require_weakRef();
	const SCOPE_ON_START_SPAN_FIELD = "_sentryScope";
	const ISOLATION_SCOPE_ON_START_SPAN_FIELD = "_sentryIsolationScope";
	const OTEL_SOURCE_INFERENCE_SPAN_FIELD = /* @__PURE__ */ Symbol.for("sentry.otelSourceInference");
	function setCapturedScopesOnSpan(span, scope, isolationScope) {
		if (span) {
			object.addNonEnumerableProperty(span, ISOLATION_SCOPE_ON_START_SPAN_FIELD, weakRef.makeWeakRef(isolationScope));
			object.addNonEnumerableProperty(span, SCOPE_ON_START_SPAN_FIELD, scope);
		}
	}
	function getCapturedScopesOnSpan(span) {
		const spanWithScopes = span;
		return {
			scope: spanWithScopes[SCOPE_ON_START_SPAN_FIELD],
			isolationScope: weakRef.derefWeakRef(spanWithScopes[ISOLATION_SCOPE_ON_START_SPAN_FIELD])
		};
	}
	function markSpanForOtelSourceInference(span) {
		object.addNonEnumerableProperty(span, OTEL_SOURCE_INFERENCE_SPAN_FIELD, true);
	}
	function spanShouldInferOtelSource(span) {
		return span[OTEL_SOURCE_INFERENCE_SPAN_FIELD] === true;
	}
	exports.getCapturedScopesOnSpan = getCapturedScopesOnSpan;
	exports.markSpanForOtelSourceInference = markSpanForOtelSourceInference;
	exports.setCapturedScopesOnSpan = setCapturedScopesOnSpan;
	exports.spanShouldInferOtelSource = spanShouldInferOtelSource;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/baggage.js
var require_baggage = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const debugBuild = require_debug_build();
	const debugLogger = require_debug_logger();
	const is = require_is();
	const SENTRY_BAGGAGE_KEY_PREFIX = "sentry-";
	const SENTRY_BAGGAGE_KEY_PREFIX_REGEX = /^sentry-/;
	const MAX_BAGGAGE_STRING_LENGTH = 8192;
	function baggageHeaderToDynamicSamplingContext(baggageHeader) {
		const baggageObject = parseBaggageHeader(baggageHeader);
		if (!baggageObject) return;
		const dynamicSamplingContext = Object.entries(baggageObject).reduce((acc, [key, value]) => {
			if (key.startsWith(SENTRY_BAGGAGE_KEY_PREFIX)) {
				const nonPrefixedKey = key.slice(7);
				acc[nonPrefixedKey] = value;
			}
			return acc;
		}, {});
		if (Object.keys(dynamicSamplingContext).length > 0) return dynamicSamplingContext;
		else return;
	}
	function dynamicSamplingContextToSentryBaggageHeader(dynamicSamplingContext) {
		if (!dynamicSamplingContext) return;
		return objectToBaggageHeader(Object.entries(dynamicSamplingContext).reduce((acc, [dscKey, dscValue]) => {
			if (dscValue) acc[`${SENTRY_BAGGAGE_KEY_PREFIX}${dscKey}`] = dscValue;
			return acc;
		}, {}));
	}
	function parseBaggageHeader(baggageHeader) {
		if (!baggageHeader || !is.isString(baggageHeader) && !Array.isArray(baggageHeader)) return;
		if (Array.isArray(baggageHeader)) return baggageHeader.reduce((acc, curr) => {
			const currBaggageObject = baggageHeaderToObject(curr);
			Object.entries(currBaggageObject).forEach(([key, value]) => {
				acc[key] = value;
			});
			return acc;
		}, {});
		return baggageHeaderToObject(baggageHeader);
	}
	function baggageHeaderToObject(baggageHeader) {
		return baggageHeader.split(",").map((baggageEntry) => {
			const eqIdx = baggageEntry.indexOf("=");
			if (eqIdx === -1) return [];
			return [baggageEntry.slice(0, eqIdx), baggageEntry.slice(eqIdx + 1)].map((keyOrValue) => {
				try {
					return decodeURIComponent(keyOrValue.trim());
				} catch {
					return;
				}
			});
		}).reduce((acc, [key, value]) => {
			if (key && value) acc[key] = value;
			return acc;
		}, {});
	}
	function objectToBaggageHeader(object) {
		if (Object.keys(object).length === 0) return;
		return Object.entries(object).reduce((baggageHeader, [objectKey, objectValue], currentIndex) => {
			const baggageEntry = `${encodeURIComponent(objectKey)}=${encodeURIComponent(objectValue)}`;
			const newBaggageHeader = currentIndex === 0 ? baggageEntry : `${baggageHeader},${baggageEntry}`;
			if (newBaggageHeader.length > MAX_BAGGAGE_STRING_LENGTH) {
				debugBuild.DEBUG_BUILD && debugLogger.debug.warn(`Not adding key: ${objectKey} with val: ${objectValue} to baggage header due to exceeding baggage size limits.`);
				return baggageHeader;
			} else return newBaggageHeader;
		}, "");
	}
	function mergeBaggageHeaders(existing, incoming) {
		if (!existing) return incoming;
		const existingEntries = parseBaggageHeader(existing);
		const incomingEntries = parseBaggageHeader(incoming);
		if (!incomingEntries) return existing;
		const merged = {};
		let hasNewSentryEntries = false;
		const newSentryEntries = {};
		const newNonSentryEntries = {};
		for (const [key, value] of Object.entries(incomingEntries)) if (key.startsWith(SENTRY_BAGGAGE_KEY_PREFIX)) {
			newSentryEntries[key] = value;
			hasNewSentryEntries = true;
		} else newNonSentryEntries[key] = value;
		if (existingEntries) {
			for (const [key, value] of Object.entries(existingEntries)) if (!hasNewSentryEntries || !key.startsWith(SENTRY_BAGGAGE_KEY_PREFIX)) merged[key] = value;
		}
		if (hasNewSentryEntries) Object.assign(merged, newSentryEntries);
		for (const [key, value] of Object.entries(newNonSentryEntries)) merged[key] ?? (merged[key] = value);
		return objectToBaggageHeader(merged);
	}
	exports.MAX_BAGGAGE_STRING_LENGTH = MAX_BAGGAGE_STRING_LENGTH;
	exports.SENTRY_BAGGAGE_KEY_PREFIX = SENTRY_BAGGAGE_KEY_PREFIX;
	exports.SENTRY_BAGGAGE_KEY_PREFIX_REGEX = SENTRY_BAGGAGE_KEY_PREFIX_REGEX;
	exports.baggageHeaderToDynamicSamplingContext = baggageHeaderToDynamicSamplingContext;
	exports.dynamicSamplingContextToSentryBaggageHeader = dynamicSamplingContextToSentryBaggageHeader;
	exports.mergeBaggageHeaders = mergeBaggageHeaders;
	exports.objectToBaggageHeader = objectToBaggageHeader;
	exports.parseBaggageHeader = parseBaggageHeader;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/dsn.js
var require_dsn = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const debugBuild = require_debug_build();
	const debugLogger = require_debug_logger();
	const ORG_ID_REGEX = /^o(\d+)\./;
	const DSN_REGEX = /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+)?)?@)((?:\[[:.%\w]+\]|[\w.-]+))(?::(\d+))?\/(.+)/;
	function isValidProtocol(protocol) {
		return protocol === "http" || protocol === "https";
	}
	function dsnToString(dsn, withPassword = false) {
		const { host, path, pass, port, projectId, protocol, publicKey } = dsn;
		return `${protocol}://${publicKey}${withPassword && pass ? `:${pass}` : ""}@${host}${port ? `:${port}` : ""}/${path ? `${path}/` : path}${projectId}`;
	}
	function dsnFromString(str) {
		const match = DSN_REGEX.exec(str);
		if (!match) {
			debugLogger.consoleSandbox(() => {
				console.error(`Invalid Sentry Dsn: ${str}`);
			});
			return;
		}
		const [protocol, publicKey, pass = "", host = "", port = "", lastPath = ""] = match.slice(1);
		let path = "";
		let projectId = lastPath;
		const split = projectId.split("/");
		if (split.length > 1) {
			path = split.slice(0, -1).join("/");
			projectId = split.pop();
		}
		if (projectId) {
			const projectMatch = projectId.match(/^\d+/);
			if (projectMatch) projectId = projectMatch[0];
		}
		return dsnFromComponents({
			host,
			pass,
			path,
			projectId,
			port,
			protocol,
			publicKey
		});
	}
	function dsnFromComponents(components) {
		return {
			protocol: components.protocol,
			publicKey: components.publicKey || "",
			pass: components.pass || "",
			host: components.host,
			port: components.port || "",
			path: components.path || "",
			projectId: components.projectId
		};
	}
	function validateDsn(dsn) {
		if (!debugBuild.DEBUG_BUILD) return true;
		const { port, projectId, protocol } = dsn;
		if ([
			"protocol",
			"publicKey",
			"host",
			"projectId"
		].find((component) => {
			if (!dsn[component]) {
				debugLogger.debug.error(`Invalid Sentry Dsn: ${component} missing`);
				return true;
			}
			return false;
		})) return false;
		if (!projectId.match(/^\d+$/)) {
			debugLogger.debug.error(`Invalid Sentry Dsn: Invalid projectId ${projectId}`);
			return false;
		}
		if (!isValidProtocol(protocol)) {
			debugLogger.debug.error(`Invalid Sentry Dsn: Invalid protocol ${protocol}`);
			return false;
		}
		if (port && isNaN(parseInt(port, 10))) {
			debugLogger.debug.error(`Invalid Sentry Dsn: Invalid port ${port}`);
			return false;
		}
		return true;
	}
	function extractOrgIdFromDsnHost(host) {
		return host.match(ORG_ID_REGEX)?.[1];
	}
	function extractOrgIdFromClient(client) {
		const options = client.getOptions();
		const { host } = client.getDsn() || {};
		let org_id;
		if (options.orgId) org_id = String(options.orgId);
		else if (host) org_id = extractOrgIdFromDsnHost(host);
		return org_id;
	}
	function makeDsn(from) {
		const components = typeof from === "string" ? dsnFromString(from) : dsnFromComponents(from);
		if (!components || !validateDsn(components)) return;
		return components;
	}
	exports.dsnFromString = dsnFromString;
	exports.dsnToString = dsnToString;
	exports.extractOrgIdFromClient = extractOrgIdFromClient;
	exports.extractOrgIdFromDsnHost = extractOrgIdFromDsnHost;
	exports.makeDsn = makeDsn;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/parseSampleRate.js
var require_parseSampleRate = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	function parseSampleRate(sampleRate) {
		if (typeof sampleRate === "boolean") return Number(sampleRate);
		const rate = typeof sampleRate === "string" ? parseFloat(sampleRate) : sampleRate;
		if (typeof rate !== "number" || isNaN(rate) || rate < 0 || rate > 1) return;
		return rate;
	}
	exports.parseSampleRate = parseSampleRate;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/tracing.js
var require_tracing = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const debugLogger = require_debug_logger();
	const baggage = require_baggage();
	const dsn = require_dsn();
	const parseSampleRate = require_parseSampleRate();
	const propagationContext = require_propagationContext();
	const randomSafeContext = require_randomSafeContext();
	const TRACEPARENT_REGEXP = /* @__PURE__ */ new RegExp("^[ \\t]*([0-9a-f]{32})?-?([0-9a-f]{16})?-?([01])?[ \\t]*$");
	function extractTraceparentData(traceparent) {
		if (!traceparent) return;
		const matches = traceparent.match(TRACEPARENT_REGEXP);
		if (!matches) return;
		let parentSampled;
		if (matches[3] === "1") parentSampled = true;
		else if (matches[3] === "0") parentSampled = false;
		return {
			traceId: matches[1],
			parentSampled,
			parentSpanId: matches[2]
		};
	}
	function propagationContextFromHeaders(sentryTrace, baggage$1) {
		const traceparentData = extractTraceparentData(sentryTrace);
		const dynamicSamplingContext = baggage.baggageHeaderToDynamicSamplingContext(baggage$1);
		if (!traceparentData?.traceId) return {
			traceId: propagationContext.generateTraceId(),
			sampleRand: randomSafeContext.safeMathRandom()
		};
		const sampleRand = getSampleRandFromTraceparentAndDsc(traceparentData, dynamicSamplingContext);
		if (dynamicSamplingContext) dynamicSamplingContext.sample_rand = sampleRand.toString();
		const { traceId, parentSpanId, parentSampled } = traceparentData;
		return {
			traceId,
			parentSpanId,
			sampled: parentSampled,
			dsc: dynamicSamplingContext || {},
			sampleRand
		};
	}
	function generateSentryTraceHeader(traceId = propagationContext.generateTraceId(), spanId = propagationContext.generateSpanId(), sampled) {
		let sampledString = "";
		if (sampled !== void 0) sampledString = sampled ? "-1" : "-0";
		return `${traceId}-${spanId}${sampledString}`;
	}
	function generateTraceparentHeader(traceId = propagationContext.generateTraceId(), spanId = propagationContext.generateSpanId(), sampled) {
		return `00-${traceId}-${spanId}-${sampled ? "01" : "00"}`;
	}
	function getSampleRandFromTraceparentAndDsc(traceparentData, dsc) {
		const parsedSampleRand = parseSampleRate.parseSampleRate(dsc?.sample_rand);
		if (parsedSampleRand !== void 0) return parsedSampleRand;
		const parsedSampleRate = parseSampleRate.parseSampleRate(dsc?.sample_rate);
		if (parsedSampleRate && traceparentData?.parentSampled !== void 0) return traceparentData.parentSampled ? randomSafeContext.safeMathRandom() * parsedSampleRate : parsedSampleRate + randomSafeContext.safeMathRandom() * (1 - parsedSampleRate);
		else return randomSafeContext.safeMathRandom();
	}
	function shouldContinueTrace(client, baggageOrgId) {
		const clientOrgId = dsn.extractOrgIdFromClient(client);
		if (baggageOrgId && clientOrgId && baggageOrgId !== clientOrgId) {
			debugLogger.debug.log(`Won't continue trace because org IDs don't match (incoming baggage: ${baggageOrgId}, SDK options: ${clientOrgId})`);
			return false;
		}
		if (client.getOptions().strictTraceContinuation || false) {
			if (baggageOrgId && !clientOrgId || !baggageOrgId && clientOrgId) {
				debugLogger.debug.log(`Starting a new trace because strict trace continuation is enabled but one org ID is missing (incoming baggage: ${baggageOrgId}, Sentry client: ${clientOrgId})`);
				return false;
			}
		}
		return true;
	}
	exports.TRACEPARENT_REGEXP = TRACEPARENT_REGEXP;
	exports.extractTraceparentData = extractTraceparentData;
	exports.generateSentryTraceHeader = generateSentryTraceHeader;
	exports.generateTraceparentHeader = generateTraceparentHeader;
	exports.propagationContextFromHeaders = propagationContextFromHeaders;
	exports.shouldContinueTrace = shouldContinueTrace;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/spanUtils.js
var require_spanUtils = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const index = require_asyncContext();
	const attributes = require_attributes$1();
	const carrier = require_carrier();
	const currentScopes = require_currentScopes();
	const semanticAttributes = require_semanticAttributes();
	const spanstatus = require_spanstatus();
	const utils = require_utils$9();
	const object = require_object();
	const propagationContext = require_propagationContext();
	const time = require_time();
	const tracing = require_tracing();
	const debugLogger = require_debug_logger();
	const spanOnScope = require_spanOnScope();
	const TRACE_FLAG_NONE = 0;
	const TRACE_FLAG_SAMPLED = 1;
	let hasShownSpanDropWarning = false;
	function spanToTransactionTraceContext(span) {
		const { spanId: span_id, traceId: trace_id } = span.spanContext();
		const { data, op, parent_span_id, status, origin, links } = spanToJSON(span);
		return {
			parent_span_id,
			span_id,
			trace_id,
			data,
			op,
			status,
			origin,
			links
		};
	}
	function spanToTraceContext(span) {
		const { spanId, traceId: trace_id, isRemote } = span.spanContext();
		const parent_span_id = isRemote ? spanId : spanToJSON(span).parent_span_id;
		const scope = utils.getCapturedScopesOnSpan(span).scope;
		return {
			parent_span_id,
			span_id: isRemote ? scope?.getPropagationContext().propagationSpanId || propagationContext.generateSpanId() : spanId,
			trace_id
		};
	}
	function spanToTraceHeader(span) {
		const { traceId, spanId } = span.spanContext();
		const sampled = spanIsSampled(span);
		return tracing.generateSentryTraceHeader(traceId, spanId, sampled);
	}
	function spanToTraceparentHeader(span) {
		const { traceId, spanId } = span.spanContext();
		const sampled = spanIsSampled(span);
		return tracing.generateTraceparentHeader(traceId, spanId, sampled);
	}
	function convertSpanLinksForEnvelope(links) {
		if (links && links.length > 0) return links.map(({ context: { spanId, traceId, traceFlags, ...restContext }, attributes }) => ({
			span_id: spanId,
			trace_id: traceId,
			sampled: traceFlags === TRACE_FLAG_SAMPLED,
			attributes,
			...restContext
		}));
		else return;
	}
	function getStreamedSpanLinks(links) {
		if (links?.length) return links.map(({ context: { spanId, traceId, traceFlags }, attributes }) => ({
			span_id: spanId,
			trace_id: traceId,
			sampled: traceFlags === TRACE_FLAG_SAMPLED,
			attributes
		}));
		else return;
	}
	function spanTimeInputToSeconds(input) {
		if (typeof input === "number") return ensureTimestampInSeconds(input);
		if (Array.isArray(input)) return input[0] + input[1] / 1e9;
		if (input instanceof Date) return ensureTimestampInSeconds(input.getTime());
		return time.timestampInSeconds();
	}
	function ensureTimestampInSeconds(timestamp) {
		return timestamp > 9999999999 ? timestamp / 1e3 : timestamp;
	}
	function spanToJSON(span) {
		if (spanIsSentrySpan(span)) return span.getSpanJSON();
		const { spanId: span_id, traceId: trace_id } = span.spanContext();
		if (spanIsOpenTelemetrySdkTraceBaseSpan(span)) {
			const { attributes, startTime, name, endTime, status, links } = span;
			return {
				span_id,
				trace_id,
				data: attributes,
				description: name,
				parent_span_id: getOtelParentSpanId(span),
				start_timestamp: spanTimeInputToSeconds(startTime),
				timestamp: spanTimeInputToSeconds(endTime) || void 0,
				status: getStatusMessage(status),
				op: attributes[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_OP],
				origin: attributes[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN],
				links: convertSpanLinksForEnvelope(links)
			};
		}
		return {
			span_id,
			trace_id,
			start_timestamp: 0,
			data: {}
		};
	}
	function spanToStreamedSpanJSON(span) {
		if (spanIsSentrySpan(span)) return span.getStreamedSpanJSON();
		const { spanId: span_id, traceId: trace_id } = span.spanContext();
		if (spanIsOpenTelemetrySdkTraceBaseSpan(span)) {
			const { attributes, startTime, name, endTime, status, links } = span;
			return {
				name,
				span_id,
				trace_id,
				parent_span_id: getOtelParentSpanId(span),
				start_timestamp: spanTimeInputToSeconds(startTime),
				end_timestamp: spanTimeInputToSeconds(endTime),
				is_segment: span === INTERNAL_getSegmentSpan(span),
				status: getSimpleStatusMessage(status),
				attributes,
				links: getStreamedSpanLinks(links)
			};
		}
		return {
			span_id,
			trace_id,
			start_timestamp: 0,
			name: "",
			end_timestamp: 0,
			status: "ok",
			is_segment: span === INTERNAL_getSegmentSpan(span)
		};
	}
	function getOtelParentSpanId(span) {
		return "parentSpanId" in span ? span.parentSpanId : "parentSpanContext" in span ? span.parentSpanContext?.spanId : void 0;
	}
	function streamedSpanJsonToSerializedSpan(spanJson) {
		return {
			...spanJson,
			attributes: attributes.serializeAttributes(spanJson.attributes),
			links: spanJson.links?.map((link) => ({
				...link,
				attributes: attributes.serializeAttributes(link.attributes)
			}))
		};
	}
	function spanIsOpenTelemetrySdkTraceBaseSpan(span) {
		const castSpan = span;
		return !!castSpan.attributes && !!castSpan.startTime && !!castSpan.name && !!castSpan.endTime && !!castSpan.status;
	}
	function spanIsSentrySpan(span) {
		return typeof span.getSpanJSON === "function";
	}
	function spanIsSampled(span) {
		const { traceFlags } = span.spanContext();
		return traceFlags === TRACE_FLAG_SAMPLED;
	}
	function getStatusMessage(status) {
		if (!status || status.code === spanstatus.SPAN_STATUS_UNSET) return;
		if (status.code === spanstatus.SPAN_STATUS_OK) return "ok";
		return status.message || "internal_error";
	}
	function getSimpleStatusMessage(status) {
		return !status || status.code === spanstatus.SPAN_STATUS_OK || status.code === spanstatus.SPAN_STATUS_UNSET || status.message === "cancelled" ? "ok" : "error";
	}
	const CHILD_SPANS_FIELD = "_sentryChildSpans";
	const ROOT_SPAN_FIELD = "_sentryRootSpan";
	function addChildSpanToSpan(span, childSpan) {
		const rootSpan = span[ROOT_SPAN_FIELD] || span;
		object.addNonEnumerableProperty(childSpan, ROOT_SPAN_FIELD, rootSpan);
		if (span[CHILD_SPANS_FIELD]) span[CHILD_SPANS_FIELD].add(childSpan);
		else object.addNonEnumerableProperty(span, CHILD_SPANS_FIELD, /* @__PURE__ */ new Set([childSpan]));
	}
	function removeChildSpanFromSpan(span, childSpan) {
		if (span[CHILD_SPANS_FIELD]) span[CHILD_SPANS_FIELD].delete(childSpan);
	}
	function getSpanDescendants(span) {
		const resultSet = /* @__PURE__ */ new Set();
		function addSpanChildren(span2) {
			if (resultSet.has(span2)) return;
			else if (spanIsSampled(span2)) {
				resultSet.add(span2);
				const childSpans = span2[CHILD_SPANS_FIELD] ? Array.from(span2[CHILD_SPANS_FIELD]) : [];
				for (const childSpan of childSpans) addSpanChildren(childSpan);
			}
		}
		addSpanChildren(span);
		return Array.from(resultSet);
	}
	const getRootSpan = INTERNAL_getSegmentSpan;
	function INTERNAL_getSegmentSpan(span) {
		return span[ROOT_SPAN_FIELD] || span;
	}
	function getActiveSpan() {
		const carrier$1 = carrier.getMainCarrier();
		const acs = index.getAsyncContextStrategy(carrier$1);
		if (acs.getActiveSpan) return acs.getActiveSpan();
		return spanOnScope._getSpanForScope(currentScopes.getCurrentScope());
	}
	function showSpanDropWarning() {
		if (!hasShownSpanDropWarning) {
			debugLogger.consoleSandbox(() => {
				console.warn("[Sentry] Returning null from `beforeSendSpan` is disallowed. To drop certain spans, configure the respective integrations directly or use `ignoreSpans`.");
			});
			hasShownSpanDropWarning = true;
		}
	}
	function updateSpanName(span, name) {
		span.updateName(name);
		span.setAttributes({
			[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: "custom",
			[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME]: name
		});
	}
	exports.INTERNAL_getSegmentSpan = INTERNAL_getSegmentSpan;
	exports.TRACE_FLAG_NONE = TRACE_FLAG_NONE;
	exports.TRACE_FLAG_SAMPLED = TRACE_FLAG_SAMPLED;
	exports.addChildSpanToSpan = addChildSpanToSpan;
	exports.convertSpanLinksForEnvelope = convertSpanLinksForEnvelope;
	exports.getActiveSpan = getActiveSpan;
	exports.getRootSpan = getRootSpan;
	exports.getSimpleStatusMessage = getSimpleStatusMessage;
	exports.getSpanDescendants = getSpanDescendants;
	exports.getStatusMessage = getStatusMessage;
	exports.getStreamedSpanLinks = getStreamedSpanLinks;
	exports.removeChildSpanFromSpan = removeChildSpanFromSpan;
	exports.showSpanDropWarning = showSpanDropWarning;
	exports.spanIsSampled = spanIsSampled;
	exports.spanTimeInputToSeconds = spanTimeInputToSeconds;
	exports.spanToJSON = spanToJSON;
	exports.spanToStreamedSpanJSON = spanToStreamedSpanJSON;
	exports.spanToTraceContext = spanToTraceContext;
	exports.spanToTraceHeader = spanToTraceHeader;
	exports.spanToTraceparentHeader = spanToTraceparentHeader;
	exports.spanToTransactionTraceContext = spanToTransactionTraceContext;
	exports.streamedSpanJsonToSerializedSpan = streamedSpanJsonToSerializedSpan;
	exports.updateSpanName = updateSpanName;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/errors.js
var require_errors = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const debugBuild = require_debug_build();
	const globalError = require_globalError();
	const globalUnhandledRejection = require_globalUnhandledRejection();
	const debugLogger = require_debug_logger();
	const spanUtils = require_spanUtils();
	const spanstatus = require_spanstatus();
	let errorsInstrumented = false;
	function registerSpanErrorInstrumentation() {
		if (errorsInstrumented) return;
		function errorCallback() {
			const activeSpan = spanUtils.getActiveSpan();
			const rootSpan = activeSpan && spanUtils.getRootSpan(activeSpan);
			if (rootSpan) {
				const message = "internal_error";
				debugBuild.DEBUG_BUILD && debugLogger.debug.log(`[Tracing] Root span: ${message} -> Global error occurred`);
				rootSpan.setStatus({
					code: spanstatus.SPAN_STATUS_ERROR,
					message
				});
			}
		}
		errorsInstrumented = true;
		globalError.addGlobalErrorInstrumentationHandler(errorCallback);
		globalUnhandledRejection.addGlobalUnhandledRejectionInstrumentationHandler(errorCallback);
	}
	exports.registerSpanErrorInstrumentation = registerSpanErrorInstrumentation;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/hasSpansEnabled.js
var require_hasSpansEnabled = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const currentScopes = require_currentScopes();
	function hasSpansEnabled(maybeOptions) {
		if (typeof __SENTRY_TRACING__ === "boolean" && !__SENTRY_TRACING__) return false;
		const options = maybeOptions || currentScopes.getClient()?.getOptions();
		return !!options && (options.tracesSampleRate != null || !!options.tracesSampler);
	}
	exports.hasSpansEnabled = hasSpansEnabled;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/should-ignore-span.js
var require_should_ignore_span = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const debugBuild = require_debug_build();
	const debugLogger = require_debug_logger();
	const string = require_string();
	function logIgnoredSpan(droppedSpan) {
		debugLogger.debug.log(`Ignoring span ${droppedSpan.op} - ${droppedSpan.description} because it matches \`ignoreSpans\`.`);
	}
	function shouldIgnoreSpan(span, ignoreSpans) {
		if (!ignoreSpans?.length) return false;
		for (const pattern of ignoreSpans) {
			if (isStringOrRegExp(pattern)) {
				if (span.description && string.isMatchingPattern(span.description, pattern)) {
					debugBuild.DEBUG_BUILD && logIgnoredSpan(span);
					return true;
				}
				continue;
			}
			const hasAttributes = !!pattern.attributes && Object.keys(pattern.attributes).length > 0;
			if (!pattern.name && !pattern.op && !hasAttributes) continue;
			const nameMatches = pattern.name ? span.description && string.isMatchingPattern(span.description, pattern.name) : true;
			const opMatches = pattern.op ? span.op && string.isMatchingPattern(span.op, pattern.op) : true;
			const attrsMatch = pattern.attributes ? Object.entries(pattern.attributes).every(([key, valuePattern]) => _matchesAttributeValue(span.attributes?.[key], valuePattern)) : true;
			if (nameMatches && opMatches && attrsMatch) {
				debugBuild.DEBUG_BUILD && logIgnoredSpan(span);
				return true;
			}
		}
		return false;
	}
	function _matchesAttributeValue(actual, pat) {
		if (typeof actual === "string" && (typeof pat === "string" || pat instanceof RegExp)) return string.isMatchingPattern(actual, pat);
		if (Array.isArray(actual) && Array.isArray(pat)) return actual.length === pat.length && actual.every((v, i) => v === pat[i]);
		return actual === pat;
	}
	function reparentChildSpans(spans, dropSpan) {
		const droppedSpanParentId = dropSpan.parent_span_id;
		const droppedSpanId = dropSpan.span_id;
		if (!droppedSpanParentId) return;
		for (const span of spans) if (span.parent_span_id === droppedSpanId) span.parent_span_id = droppedSpanParentId;
	}
	function isStringOrRegExp(value) {
		return typeof value === "string" || value instanceof RegExp;
	}
	exports.reparentChildSpans = reparentChildSpans;
	exports.shouldIgnoreSpan = shouldIgnoreSpan;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/sentryNonRecordingSpan.js
var require_sentryNonRecordingSpan = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const object = require_object();
	const propagationContext = require_propagationContext();
	const spanUtils = require_spanUtils();
	const NON_RECORDING_SPAN_FIELD = /* @__PURE__ */ Symbol.for("sentry.nonRecordingSpan");
	var SentryNonRecordingSpan = class {
		constructor(spanContext = {}) {
			this._traceId = spanContext.traceId || propagationContext.generateTraceId();
			this._spanId = spanContext.spanId || propagationContext.generateSpanId();
			this.dropReason = spanContext.dropReason;
			object.addNonEnumerableProperty(this, NON_RECORDING_SPAN_FIELD, true);
		}
		/** @inheritdoc */
		spanContext() {
			return {
				spanId: this._spanId,
				traceId: this._traceId,
				traceFlags: spanUtils.TRACE_FLAG_NONE
			};
		}
		/** @inheritdoc */
		end(_timestamp) {}
		/** @inheritdoc */
		setAttribute(_key, _value) {
			return this;
		}
		/** @inheritdoc */
		setAttributes(_values) {
			return this;
		}
		/** @inheritdoc */
		setStatus(_status) {
			return this;
		}
		/** @inheritdoc */
		updateName(_name) {
			return this;
		}
		/** @inheritdoc */
		isRecording() {
			return false;
		}
		/** @inheritdoc */
		addEvent(_name, _attributesOrStartTime, _startTime) {
			return this;
		}
		/** @inheritDoc */
		addLink(_link) {
			return this;
		}
		/** @inheritDoc */
		addLinks(_links) {
			return this;
		}
		/**
		* This should generally not be used,
		* but we need it for being compliant with the OTEL Span interface.
		*
		* @hidden
		* @internal
		*/
		recordException(_exception, _time) {}
	};
	function spanIsNonRecordingSpan(span) {
		return !!span && span[NON_RECORDING_SPAN_FIELD] === true;
	}
	exports.SentryNonRecordingSpan = SentryNonRecordingSpan;
	exports.spanIsNonRecordingSpan = spanIsNonRecordingSpan;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/constants.js
var require_constants$8 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const DEFAULT_ENVIRONMENT = "production";
	const DEV_ENVIRONMENT = "development";
	exports.DEFAULT_ENVIRONMENT = DEFAULT_ENVIRONMENT;
	exports.DEV_ENVIRONMENT = DEV_ENVIRONMENT;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/dynamicSamplingContext.js
var require_dynamicSamplingContext = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const constants = require_constants$8();
	const currentScopes = require_currentScopes();
	const semanticAttributes = require_semanticAttributes();
	const baggage = require_baggage();
	const dsn = require_dsn();
	const hasSpansEnabled = require_hasSpansEnabled();
	const object = require_object();
	const spanUtils = require_spanUtils();
	const sentryNonRecordingSpan = require_sentryNonRecordingSpan();
	const utils = require_utils$9();
	const FROZEN_DSC_FIELD = "_frozenDsc";
	function freezeDscOnSpan(span, dsc) {
		const spanWithMaybeDsc = span;
		object.addNonEnumerableProperty(spanWithMaybeDsc, FROZEN_DSC_FIELD, dsc);
	}
	function getDynamicSamplingContextFromClient(trace_id, client) {
		const options = client.getOptions();
		const { publicKey: public_key } = client.getDsn() || {};
		const dsc = {
			environment: options.environment || constants.DEFAULT_ENVIRONMENT,
			release: options.release,
			public_key,
			trace_id,
			org_id: dsn.extractOrgIdFromClient(client)
		};
		client.emit("createDsc", dsc);
		return dsc;
	}
	function getDynamicSamplingContextFromScope(client, scope) {
		const propagationContext = scope.getPropagationContext();
		return propagationContext.dsc || getDynamicSamplingContextFromClient(propagationContext.traceId, client);
	}
	function getDynamicSamplingContextFromSpan(span) {
		const client = currentScopes.getClient();
		if (!client) return {};
		const rootSpan = spanUtils.getRootSpan(span);
		const rootSpanJson = spanUtils.spanToJSON(rootSpan);
		const rootSpanAttributes = rootSpanJson.data;
		const traceState = rootSpan.spanContext().traceState;
		const rootSpanSampleRate = traceState?.get("sentry.sample_rate") ?? rootSpanAttributes[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE] ?? rootSpanAttributes[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_PREVIOUS_TRACE_SAMPLE_RATE];
		function applyLocalSampleRateToDsc(dsc2) {
			if (typeof rootSpanSampleRate === "number" || typeof rootSpanSampleRate === "string") dsc2.sample_rate = `${rootSpanSampleRate}`;
			return dsc2;
		}
		const frozenDsc = rootSpan[FROZEN_DSC_FIELD];
		if (frozenDsc) return applyLocalSampleRateToDsc(frozenDsc);
		if (sentryNonRecordingSpan.spanIsNonRecordingSpan(rootSpan) && !hasSpansEnabled.hasSpansEnabled(client.getOptions())) {
			const capturedScope = utils.getCapturedScopesOnSpan(rootSpan).scope;
			if (capturedScope) return applyLocalSampleRateToDsc({ ...getDynamicSamplingContextFromScope(client, capturedScope) });
		}
		const traceStateDsc = traceState?.get("sentry.dsc");
		const dscOnTraceState = traceStateDsc && baggage.baggageHeaderToDynamicSamplingContext(traceStateDsc);
		if (dscOnTraceState) return applyLocalSampleRateToDsc(dscOnTraceState);
		const dsc = getDynamicSamplingContextFromClient(span.spanContext().traceId, client);
		const source = rootSpanAttributes[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE] ?? rootSpanAttributes["sentry.span.source"];
		const name = rootSpanJson.description;
		if (source !== "url" && name) dsc.transaction = name;
		if (hasSpansEnabled.hasSpansEnabled()) {
			dsc.sampled = String(spanUtils.spanIsSampled(rootSpan));
			dsc.sample_rand = traceState?.get("sentry.sample_rand") ?? utils.getCapturedScopesOnSpan(rootSpan).scope?.getPropagationContext().sampleRand.toString();
		}
		applyLocalSampleRateToDsc(dsc);
		client.emit("createDsc", dsc, rootSpan);
		return dsc;
	}
	function spanToBaggageHeader(span) {
		const dsc = getDynamicSamplingContextFromSpan(span);
		return baggage.dynamicSamplingContextToSentryBaggageHeader(dsc);
	}
	exports.freezeDscOnSpan = freezeDscOnSpan;
	exports.getDynamicSamplingContextFromClient = getDynamicSamplingContextFromClient;
	exports.getDynamicSamplingContextFromScope = getDynamicSamplingContextFromScope;
	exports.getDynamicSamplingContextFromSpan = getDynamicSamplingContextFromSpan;
	exports.spanToBaggageHeader = spanToBaggageHeader;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/spans/beforeSendSpan.js
var require_beforeSendSpan = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const object = require_object();
	function withStreamedSpan(callback) {
		object.addNonEnumerableProperty(callback, "_streamed", true);
		return callback;
	}
	function isStreamedBeforeSendSpanCallback(callback) {
		return !!callback && typeof callback === "function" && "_streamed" in callback && !!callback._streamed;
	}
	exports.isStreamedBeforeSendSpanCallback = isStreamedBeforeSendSpanCallback;
	exports.withStreamedSpan = withStreamedSpan;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/envelope.js
var require_envelope$4 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const carrier = require_carrier();
	const dsn = require_dsn();
	const normalize = require_normalize();
	const randomSafeContext = require_randomSafeContext();
	const worldwide = require_worldwide();
	function createEnvelope(headers, items = []) {
		return [headers, items];
	}
	function addItemToEnvelope(envelope, newItem) {
		const [headers, items] = envelope;
		return [headers, [...items, newItem]];
	}
	function forEachEnvelopeItem(envelope, callback) {
		const envelopeItems = envelope[1];
		for (const envelopeItem of envelopeItems) {
			const envelopeItemType = envelopeItem[0].type;
			if (callback(envelopeItem, envelopeItemType)) return true;
		}
		return false;
	}
	function envelopeContainsItemType(envelope, types) {
		return forEachEnvelopeItem(envelope, (_, type) => types.includes(type));
	}
	function encodeUTF8(input) {
		const carrier$1 = carrier.getSentryCarrier(worldwide.GLOBAL_OBJ);
		return carrier$1.encodePolyfill ? carrier$1.encodePolyfill(input) : new TextEncoder().encode(input);
	}
	function decodeUTF8(input) {
		const carrier$1 = carrier.getSentryCarrier(worldwide.GLOBAL_OBJ);
		return carrier$1.decodePolyfill ? carrier$1.decodePolyfill(input) : new TextDecoder().decode(input);
	}
	function serializeEnvelope(envelope) {
		const [envHeaders, items] = envelope;
		let parts = JSON.stringify(envHeaders);
		function append(next) {
			if (typeof parts === "string") parts = typeof next === "string" ? parts + next : [encodeUTF8(parts), next];
			else parts.push(typeof next === "string" ? encodeUTF8(next) : next);
		}
		for (const item of items) {
			const [itemHeaders, payload] = item;
			append(`
${JSON.stringify(itemHeaders)}
`);
			if (typeof payload === "string" || payload instanceof Uint8Array) append(payload);
			else {
				let stringifiedPayload;
				try {
					stringifiedPayload = JSON.stringify(payload);
				} catch {
					stringifiedPayload = JSON.stringify(normalize.normalize(payload));
				}
				append(stringifiedPayload);
			}
		}
		return typeof parts === "string" ? parts : concatBuffers(parts);
	}
	function concatBuffers(buffers) {
		const totalLength = buffers.reduce((acc, buf) => acc + buf.length, 0);
		const merged = new Uint8Array(totalLength);
		let offset = 0;
		for (const buffer of buffers) {
			merged.set(buffer, offset);
			offset += buffer.length;
		}
		return merged;
	}
	function parseEnvelope(env) {
		let buffer = typeof env === "string" ? encodeUTF8(env) : env;
		function readBinary(length) {
			const bin = buffer.subarray(0, length);
			buffer = buffer.subarray(length + 1);
			return bin;
		}
		function readJson() {
			let i = buffer.indexOf(10);
			if (i < 0) i = buffer.length;
			return JSON.parse(decodeUTF8(readBinary(i)));
		}
		const envelopeHeader = readJson();
		const items = [];
		while (buffer.length) {
			const itemHeader = readJson();
			const binaryLength = typeof itemHeader.length === "number" ? itemHeader.length : void 0;
			items.push([itemHeader, binaryLength ? readBinary(binaryLength) : readJson()]);
		}
		return [envelopeHeader, items];
	}
	function createSpanEnvelopeItem(spanJson) {
		return [{ type: "span" }, spanJson];
	}
	function createAttachmentEnvelopeItem(attachment) {
		const buffer = typeof attachment.data === "string" ? encodeUTF8(attachment.data) : attachment.data;
		return [{
			type: "attachment",
			length: buffer.length,
			filename: attachment.filename,
			content_type: attachment.contentType,
			attachment_type: attachment.attachmentType
		}, buffer];
	}
	const DATA_CATEGORY_OVERRIDES = {
		sessions: "session",
		event: "error",
		client_report: "internal",
		user_report: "default",
		profile_chunk: "profile",
		replay_event: "replay",
		replay_recording: "replay",
		check_in: "monitor",
		raw_security: "security",
		log: "log_item",
		trace_metric: "metric"
	};
	function _isOverriddenType(type) {
		return type in DATA_CATEGORY_OVERRIDES;
	}
	function envelopeItemTypeToDataCategory(type) {
		return _isOverriddenType(type) ? DATA_CATEGORY_OVERRIDES[type] : type;
	}
	function getSdkMetadataForEnvelopeHeader(metadataOrEvent) {
		if (!metadataOrEvent?.sdk) return;
		const { name, version } = metadataOrEvent.sdk;
		return {
			name,
			version
		};
	}
	function createEventEnvelopeHeaders(event, sdkInfo, tunnel, dsn$1) {
		const dynamicSamplingContext = event.sdkProcessingMetadata?.dynamicSamplingContext;
		return {
			event_id: event.event_id,
			sent_at: new Date(randomSafeContext.safeDateNow()).toISOString(),
			...sdkInfo && { sdk: sdkInfo },
			...!!tunnel && dsn$1 && { dsn: dsn.dsnToString(dsn$1) },
			...dynamicSamplingContext && { trace: dynamicSamplingContext }
		};
	}
	exports.addItemToEnvelope = addItemToEnvelope;
	exports.createAttachmentEnvelopeItem = createAttachmentEnvelopeItem;
	exports.createEnvelope = createEnvelope;
	exports.createEventEnvelopeHeaders = createEventEnvelopeHeaders;
	exports.createSpanEnvelopeItem = createSpanEnvelopeItem;
	exports.envelopeContainsItemType = envelopeContainsItemType;
	exports.envelopeItemTypeToDataCategory = envelopeItemTypeToDataCategory;
	exports.forEachEnvelopeItem = forEachEnvelopeItem;
	exports.getSdkMetadataForEnvelopeHeader = getSdkMetadataForEnvelopeHeader;
	exports.parseEnvelope = parseEnvelope;
	exports.serializeEnvelope = serializeEnvelope;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/envelope.js
var require_envelope$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const dynamicSamplingContext = require_dynamicSamplingContext();
	const beforeSendSpan = require_beforeSendSpan();
	const dsn = require_dsn();
	const envelope = require_envelope$4();
	const randomSafeContext = require_randomSafeContext();
	const shouldIgnoreSpan = require_should_ignore_span();
	const spanUtils = require_spanUtils();
	function _enhanceEventWithSdkInfo(event, newSdkInfo) {
		if (!newSdkInfo) return event;
		const eventSdkInfo = event.sdk || {};
		event.sdk = {
			...eventSdkInfo,
			name: eventSdkInfo.name || newSdkInfo.name,
			version: eventSdkInfo.version || newSdkInfo.version,
			integrations: [...event.sdk?.integrations || [], ...newSdkInfo.integrations || []],
			packages: [...event.sdk?.packages || [], ...newSdkInfo.packages || []],
			settings: event.sdk?.settings || newSdkInfo.settings ? {
				...event.sdk?.settings,
				...newSdkInfo.settings
			} : void 0
		};
		return event;
	}
	function createSessionEnvelope(session, dsn$1, metadata, tunnel) {
		const sdkInfo = envelope.getSdkMetadataForEnvelopeHeader(metadata);
		const envelopeHeaders = {
			sent_at: new Date(randomSafeContext.safeDateNow()).toISOString(),
			...sdkInfo && { sdk: sdkInfo },
			...!!tunnel && dsn$1 && { dsn: dsn.dsnToString(dsn$1) }
		};
		const envelopeItem = "aggregates" in session ? [{ type: "sessions" }, session] : [{ type: "session" }, session.toJSON()];
		return envelope.createEnvelope(envelopeHeaders, [envelopeItem]);
	}
	function createEventEnvelope(event, dsn, metadata, tunnel) {
		const sdkInfo = envelope.getSdkMetadataForEnvelopeHeader(metadata);
		const eventType = event.type && event.type !== "replay_event" ? event.type : "event";
		_enhanceEventWithSdkInfo(event, metadata?.sdk);
		const envelopeHeaders = envelope.createEventEnvelopeHeaders(event, sdkInfo, tunnel, dsn);
		delete event.sdkProcessingMetadata;
		const eventItem = [{ type: eventType }, event];
		return envelope.createEnvelope(envelopeHeaders, [eventItem]);
	}
	function createSpanEnvelope(spans, client) {
		function dscHasRequiredProps(dsc2) {
			return !!dsc2.trace_id && !!dsc2.public_key;
		}
		const dsc = dynamicSamplingContext.getDynamicSamplingContextFromSpan(spans[0]);
		const dsn$1 = client?.getDsn();
		const tunnel = client?.getOptions().tunnel;
		const headers = {
			sent_at: new Date(randomSafeContext.safeDateNow()).toISOString(),
			...dscHasRequiredProps(dsc) && { trace: dsc },
			...!!tunnel && dsn$1 && { dsn: dsn.dsnToString(dsn$1) }
		};
		const { beforeSendSpan: beforeSendSpan$1, ignoreSpans } = client?.getOptions() || {};
		const filteredSpans = ignoreSpans?.length ? spans.filter((span) => {
			const json = spanUtils.spanToJSON(span);
			return !shouldIgnoreSpan.shouldIgnoreSpan({
				description: json.description,
				op: json.op,
				attributes: json.data
			}, ignoreSpans);
		}) : spans;
		const droppedSpans = spans.length - filteredSpans.length;
		if (droppedSpans) client?.recordDroppedEvent("before_send", "span", droppedSpans);
		const convertToSpanJSON = beforeSendSpan$1 ? (span) => {
			const spanJson = spanUtils.spanToJSON(span);
			const processedSpan = !beforeSendSpan.isStreamedBeforeSendSpanCallback(beforeSendSpan$1) ? beforeSendSpan$1(spanJson) : spanJson;
			if (!processedSpan) {
				spanUtils.showSpanDropWarning();
				return spanJson;
			}
			return processedSpan;
		} : spanUtils.spanToJSON;
		const items = [];
		for (const span of filteredSpans) {
			const spanJson = convertToSpanJSON(span);
			if (spanJson) items.push(envelope.createSpanEnvelopeItem(spanJson));
		}
		return envelope.createEnvelope(headers, items);
	}
	exports._enhanceEventWithSdkInfo = _enhanceEventWithSdkInfo;
	exports.createEventEnvelope = createEventEnvelope;
	exports.createSessionEnvelope = createSessionEnvelope;
	exports.createSpanEnvelope = createSpanEnvelope;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/logSpans.js
var require_logSpans = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const debugBuild = require_debug_build();
	const debugLogger = require_debug_logger();
	const spanUtils = require_spanUtils();
	function logSpanStart(span) {
		if (!debugBuild.DEBUG_BUILD) return;
		const { description = "< unknown name >", op = "< unknown op >", parent_span_id: parentSpanId } = spanUtils.spanToJSON(span);
		const { spanId } = span.spanContext();
		const sampled = spanUtils.spanIsSampled(span);
		const rootSpan = spanUtils.getRootSpan(span);
		const isRootSpan = rootSpan === span;
		const header = `[Tracing] Starting ${sampled ? "sampled" : "unsampled"} ${isRootSpan ? "root " : ""}span`;
		const infoParts = [
			`op: ${op}`,
			`name: ${description}`,
			`ID: ${spanId}`
		];
		if (parentSpanId) infoParts.push(`parent ID: ${parentSpanId}`);
		if (!isRootSpan) {
			const { op: op2, description: description2 } = spanUtils.spanToJSON(rootSpan);
			infoParts.push(`root ID: ${rootSpan.spanContext().spanId}`);
			if (op2) infoParts.push(`root op: ${op2}`);
			if (description2) infoParts.push(`root description: ${description2}`);
		}
		debugLogger.debug.log(`${header}
  ${infoParts.join("\n  ")}`);
	}
	function logSpanEnd(span) {
		if (!debugBuild.DEBUG_BUILD) return;
		const { description = "< unknown name >", op = "< unknown op >" } = spanUtils.spanToJSON(span);
		const { spanId } = span.spanContext();
		const msg = `[Tracing] Finishing "${op}" ${spanUtils.getRootSpan(span) === span ? "root " : ""}span "${description}" with ID ${spanId}`;
		debugLogger.debug.log(msg);
	}
	exports.logSpanEnd = logSpanEnd;
	exports.logSpanStart = logSpanStart;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/measurement.js
var require_measurement = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const debugBuild = require_debug_build();
	const semanticAttributes = require_semanticAttributes();
	const debugLogger = require_debug_logger();
	const spanUtils = require_spanUtils();
	function setMeasurement(name, value, unit, activeSpan = spanUtils.getActiveSpan()) {
		const rootSpan = activeSpan && spanUtils.getRootSpan(activeSpan);
		if (rootSpan) {
			debugBuild.DEBUG_BUILD && debugLogger.debug.log(`[Measurement] Setting measurement on root span: ${name} = ${value} ${unit}`);
			rootSpan.addEvent(name, {
				[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_VALUE]: value,
				[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_UNIT]: unit
			});
		}
	}
	function timedEventsToMeasurements(events) {
		if (!events || events.length === 0) return;
		const measurements = {};
		events.forEach((event) => {
			const attributes = event.attributes || {};
			const unit = attributes[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_UNIT];
			const value = attributes[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_VALUE];
			if (typeof unit === "string" && typeof value === "number") measurements[event.name] = {
				value,
				unit
			};
		});
		return measurements;
	}
	exports.setMeasurement = setMeasurement;
	exports.timedEventsToMeasurements = timedEventsToMeasurements;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/spans/hasSpanStreamingEnabled.js
var require_hasSpanStreamingEnabled = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	function hasSpanStreamingEnabled(client) {
		return client.getOptions().traceLifecycle === "stream";
	}
	exports.hasSpanStreamingEnabled = hasSpanStreamingEnabled;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/sentrySpan.js
var require_sentrySpan = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const currentScopes = require_currentScopes();
	const debugBuild = require_debug_build();
	const envelope = require_envelope$3();
	const semanticAttributes = require_semanticAttributes();
	const debugLogger = require_debug_logger();
	const propagationContext = require_propagationContext();
	const spanUtils = require_spanUtils();
	const time = require_time();
	const dynamicSamplingContext = require_dynamicSamplingContext();
	const logSpans = require_logSpans();
	const measurement = require_measurement();
	const hasSpanStreamingEnabled = require_hasSpanStreamingEnabled();
	const utils = require_utils$9();
	const MAX_SPAN_COUNT = 1e3;
	var SentrySpan = class {
		/**
		* You should never call the constructor manually, always use `Sentry.startSpan()`
		* or other span methods.
		* @internal
		* @hideconstructor
		* @hidden
		*/
		constructor(spanContext = {}) {
			this._traceId = spanContext.traceId || propagationContext.generateTraceId();
			this._spanId = spanContext.spanId || propagationContext.generateSpanId();
			this._startTime = spanContext.startTimestamp || time.timestampInSeconds();
			this._links = spanContext.links;
			this._attributes = {};
			this.setAttributes({
				[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "manual",
				[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_OP]: spanContext.op,
				...spanContext.attributes
			});
			this._name = spanContext.name;
			if (spanContext.parentSpanId) this._parentSpanId = spanContext.parentSpanId;
			if ("sampled" in spanContext) this._sampled = spanContext.sampled;
			if (spanContext.endTimestamp) this._endTime = spanContext.endTimestamp;
			this._events = [];
			this._isStandaloneSpan = spanContext.isStandalone;
			if (this._endTime) this._onSpanEnded();
		}
		/** @inheritDoc */
		addLink(link) {
			if (this._links) this._links.push(link);
			else this._links = [link];
			return this;
		}
		/** @inheritDoc */
		addLinks(links) {
			if (this._links) this._links.push(...links);
			else this._links = links;
			return this;
		}
		/**
		* This should generally not be used,
		* but it is needed for being compliant with the OTEL Span interface.
		*
		* @hidden
		* @internal
		*/
		recordException(_exception, _time) {}
		/** @inheritdoc */
		spanContext() {
			const { _spanId: spanId, _traceId: traceId, _sampled: sampled } = this;
			return {
				spanId,
				traceId,
				traceFlags: sampled ? spanUtils.TRACE_FLAG_SAMPLED : spanUtils.TRACE_FLAG_NONE
			};
		}
		/** @inheritdoc */
		setAttribute(key, value) {
			if (value === void 0) delete this._attributes[key];
			else this._attributes[key] = value;
			return this;
		}
		/** @inheritdoc */
		setAttributes(attributes) {
			Object.keys(attributes).forEach((key) => this.setAttribute(key, attributes[key]));
			return this;
		}
		/**
		* This should generally not be used,
		* but we need it for browser tracing where we want to adjust the start time afterwards.
		* USE THIS WITH CAUTION!
		*
		* @hidden
		* @internal
		*/
		updateStartTime(timeInput) {
			this._startTime = spanUtils.spanTimeInputToSeconds(timeInput);
		}
		/**
		* @inheritDoc
		*/
		setStatus(value) {
			this._status = value;
			return this;
		}
		/**
		* @inheritDoc
		*/
		updateName(name) {
			this._name = name;
			if (!utils.spanShouldInferOtelSource(this)) this.setAttribute(semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, "custom");
			return this;
		}
		/** @inheritdoc */
		end(endTimestamp) {
			if (this._endTime) return;
			this._endTime = spanUtils.spanTimeInputToSeconds(endTimestamp);
			logSpans.logSpanEnd(this);
			this._onSpanEnded();
		}
		/**
		* Get JSON representation of this span.
		*
		* @hidden
		* @internal This method is purely for internal purposes and should not be used outside
		* of SDK code. If you need to get a JSON representation of a span,
		* use `spanToJSON(span)` instead.
		*/
		getSpanJSON() {
			return {
				data: this._attributes,
				description: this._name,
				op: this._attributes[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_OP],
				parent_span_id: this._parentSpanId,
				span_id: this._spanId,
				start_timestamp: this._startTime,
				status: spanUtils.getStatusMessage(this._status),
				timestamp: this._endTime,
				trace_id: this._traceId,
				origin: this._attributes[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN],
				profile_id: this._attributes[semanticAttributes.SEMANTIC_ATTRIBUTE_PROFILE_ID],
				exclusive_time: this._attributes[semanticAttributes.SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME],
				measurements: measurement.timedEventsToMeasurements(this._events),
				is_segment: this._isStandaloneSpan && spanUtils.getRootSpan(this) === this || void 0,
				segment_id: this._isStandaloneSpan ? spanUtils.getRootSpan(this).spanContext().spanId : void 0,
				links: spanUtils.convertSpanLinksForEnvelope(this._links)
			};
		}
		/**
		* Get {@link StreamedSpanJSON} representation of this span.
		*
		* @hidden
		* @internal This method is purely for internal purposes and should not be used outside
		* of SDK code. If you need to get a JSON representation of a span,
		* use `spanToStreamedSpanJSON(span)` instead.
		*/
		getStreamedSpanJSON() {
			return {
				name: this._name ?? "",
				span_id: this._spanId,
				trace_id: this._traceId,
				parent_span_id: this._parentSpanId,
				start_timestamp: this._startTime,
				end_timestamp: this._endTime ?? this._startTime,
				is_segment: this._isStandaloneSpan || this === spanUtils.getRootSpan(this),
				status: spanUtils.getSimpleStatusMessage(this._status),
				attributes: this._attributes,
				links: spanUtils.getStreamedSpanLinks(this._links)
			};
		}
		/** @inheritdoc */
		isRecording() {
			return !this._endTime && !!this._sampled;
		}
		/**
		* @inheritdoc
		*/
		addEvent(name, attributesOrStartTime, startTime) {
			debugBuild.DEBUG_BUILD && debugLogger.debug.log("[Tracing] Adding an event to span:", name);
			const time$1 = isSpanTimeInput(attributesOrStartTime) ? attributesOrStartTime : startTime || time.timestampInSeconds();
			const attributes = isSpanTimeInput(attributesOrStartTime) ? {} : attributesOrStartTime || {};
			const event = {
				name,
				time: spanUtils.spanTimeInputToSeconds(time$1),
				attributes
			};
			this._events.push(event);
			return this;
		}
		/**
		* This method should generally not be used,
		* but for now we need a way to publicly check if the `_isStandaloneSpan` flag is set.
		* USE THIS WITH CAUTION!
		* @internal
		* @hidden
		* @experimental
		*/
		isStandaloneSpan() {
			return !!this._isStandaloneSpan;
		}
		/** Emit `spanEnd` when the span is ended. */
		_onSpanEnded() {
			const client = currentScopes.getClient();
			if (client) {
				client.emit("spanEnd", this);
				if (!this._isStandaloneSpan) client.emit("afterSpanEnd", this);
			}
			if (!(this._isStandaloneSpan || this === spanUtils.getRootSpan(this))) return;
			if (this._isStandaloneSpan) {
				if (this._sampled) sendSpanEnvelope(envelope.createSpanEnvelope([this], client));
				else {
					debugBuild.DEBUG_BUILD && debugLogger.debug.log("[Tracing] Discarding standalone span because its trace was not chosen to be sampled.");
					if (client) client.recordDroppedEvent("sample_rate", "span");
				}
				return;
			} else if (client && hasSpanStreamingEnabled.hasSpanStreamingEnabled(client)) {
				client.emit("afterSegmentSpanEnd", this);
				return;
			}
			const transactionEvent = this._convertSpanToTransaction();
			if (transactionEvent) (utils.getCapturedScopesOnSpan(this).scope || currentScopes.getCurrentScope()).captureEvent(transactionEvent);
		}
		/**
		* Finish the transaction & prepare the event to send to Sentry.
		*/
		_convertSpanToTransaction() {
			if (!isFullFinishedSpan(spanUtils.spanToJSON(this))) return;
			if (!this._name) {
				debugBuild.DEBUG_BUILD && debugLogger.debug.warn("Transaction has no name, falling back to `<unlabeled transaction>`.");
				this._name = "<unlabeled transaction>";
			}
			const { scope: capturedSpanScope, isolationScope: capturedSpanIsolationScope } = utils.getCapturedScopesOnSpan(this);
			const normalizedRequest = capturedSpanScope?.getScopeData().sdkProcessingMetadata?.normalizedRequest;
			if (this._sampled !== true) return;
			const spans = spanUtils.getSpanDescendants(this).filter((span) => span !== this && !isStandaloneSpan(span)).map((span) => spanUtils.spanToJSON(span)).filter(isFullFinishedSpan);
			const source = this._attributes[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE];
			delete this._attributes[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME];
			let hasGenAiSpans = false;
			spans.forEach((span) => {
				delete span.data[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME];
				if (span.op?.startsWith("gen_ai.")) hasGenAiSpans = true;
			});
			const transaction = {
				contexts: { trace: spanUtils.spanToTransactionTraceContext(this) },
				spans: spans.length > MAX_SPAN_COUNT ? spans.sort((a, b) => a.start_timestamp - b.start_timestamp).slice(0, MAX_SPAN_COUNT) : spans,
				start_timestamp: this._startTime,
				timestamp: this._endTime,
				transaction: this._name,
				type: "transaction",
				sdkProcessingMetadata: {
					capturedSpanScope,
					capturedSpanIsolationScope,
					dynamicSamplingContext: dynamicSamplingContext.getDynamicSamplingContextFromSpan(this),
					hasGenAiSpans
				},
				request: normalizedRequest,
				...source && { transaction_info: { source } }
			};
			const measurements = measurement.timedEventsToMeasurements(this._events);
			if (measurements && Object.keys(measurements).length) {
				debugBuild.DEBUG_BUILD && debugLogger.debug.log("[Measurements] Adding measurements to transaction event", JSON.stringify(measurements, void 0, 2));
				transaction.measurements = measurements;
			}
			return transaction;
		}
	};
	function isSpanTimeInput(value) {
		return value && typeof value === "number" || value instanceof Date || Array.isArray(value);
	}
	function isFullFinishedSpan(input) {
		return !!input.start_timestamp && !!input.timestamp && !!input.span_id && !!input.trace_id;
	}
	function isStandaloneSpan(span) {
		return span instanceof SentrySpan && span.isStandaloneSpan();
	}
	function sendSpanEnvelope(envelope) {
		const client = currentScopes.getClient();
		if (!client) return;
		const spanItems = envelope[1];
		if (!spanItems || spanItems.length === 0) {
			client.recordDroppedEvent("before_send", "span");
			return;
		}
		client.sendEnvelope(envelope);
	}
	exports.SentrySpan = SentrySpan;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/handleCallbackErrors.js
var require_handleCallbackErrors = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const chainAndCopyPromiselike = require_chain_and_copy_promiselike();
	const is = require_is();
	function handleCallbackErrors(fn, onError, onFinally = () => {}, onSuccess = () => {}) {
		let maybePromiseResult;
		try {
			maybePromiseResult = fn();
		} catch (e) {
			onError(e);
			onFinally();
			throw e;
		}
		return maybeHandlePromiseRejection(maybePromiseResult, onError, onFinally, onSuccess);
	}
	function maybeHandlePromiseRejection(value, onError, onFinally, onSuccess) {
		if (is.isThenable(value)) return chainAndCopyPromiselike.chainAndCopyPromiseLike(value, (result) => {
			onFinally();
			onSuccess(result);
		}, (err) => {
			onError(err);
			onFinally();
		});
		onFinally();
		onSuccess(value);
		return value;
	}
	exports.handleCallbackErrors = handleCallbackErrors;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/sampling.js
var require_sampling = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const debugBuild = require_debug_build();
	const debugLogger = require_debug_logger();
	const hasSpansEnabled = require_hasSpansEnabled();
	const parseSampleRate = require_parseSampleRate();
	function sampleSpan(options, samplingContext, sampleRand) {
		if (!hasSpansEnabled.hasSpansEnabled(options)) return [false];
		let localSampleRateWasApplied = void 0;
		let sampleRate;
		if (typeof options.tracesSampler === "function") {
			sampleRate = options.tracesSampler({
				...samplingContext,
				inheritOrSampleWith: (fallbackSampleRate) => {
					if (typeof samplingContext.parentSampleRate === "number") return samplingContext.parentSampleRate;
					if (typeof samplingContext.parentSampled === "boolean") return Number(samplingContext.parentSampled);
					return fallbackSampleRate;
				}
			});
			localSampleRateWasApplied = true;
		} else if (samplingContext.parentSampled !== void 0) sampleRate = samplingContext.parentSampled;
		else if (typeof options.tracesSampleRate !== "undefined") {
			sampleRate = options.tracesSampleRate;
			localSampleRateWasApplied = true;
		}
		const parsedSampleRate = parseSampleRate.parseSampleRate(sampleRate);
		if (parsedSampleRate === void 0) {
			debugBuild.DEBUG_BUILD && debugLogger.debug.warn(`[Tracing] Discarding root span because of invalid sample rate. Sample rate must be a boolean or a number between 0 and 1. Got ${JSON.stringify(sampleRate)} of type ${JSON.stringify(typeof sampleRate)}.`);
			return [false];
		}
		if (!parsedSampleRate) {
			debugBuild.DEBUG_BUILD && debugLogger.debug.log(`[Tracing] Discarding transaction because ${typeof options.tracesSampler === "function" ? "tracesSampler returned 0 or false" : "a negative sampling decision was inherited or tracesSampleRate is set to 0"}`);
			return [
				false,
				parsedSampleRate,
				localSampleRateWasApplied
			];
		}
		const shouldSample = sampleRand < parsedSampleRate;
		if (!shouldSample) debugBuild.DEBUG_BUILD && debugLogger.debug.log(`[Tracing] Discarding transaction because it's not included in the random sample (sampling rate = ${Number(sampleRate)})`);
		return [
			shouldSample,
			parsedSampleRate,
			localSampleRateWasApplied
		];
	}
	exports.sampleSpan = sampleSpan;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/trace.js
var require_trace = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const index = require_asyncContext();
	const carrier = require_carrier();
	const currentScopes = require_currentScopes();
	const debugBuild = require_debug_build();
	const semanticAttributes = require_semanticAttributes();
	const baggage = require_baggage();
	const debugLogger = require_debug_logger();
	const handleCallbackErrors = require_handleCallbackErrors();
	const hasSpansEnabled = require_hasSpansEnabled();
	const shouldIgnoreSpan = require_should_ignore_span();
	const hasSpanStreamingEnabled = require_hasSpanStreamingEnabled();
	const parseSampleRate = require_parseSampleRate();
	const propagationContext = require_propagationContext();
	const randomSafeContext = require_randomSafeContext();
	const spanOnScope = require_spanOnScope();
	const spanUtils = require_spanUtils();
	const tracing = require_tracing();
	const dynamicSamplingContext = require_dynamicSamplingContext();
	const logSpans = require_logSpans();
	const sampling = require_sampling();
	const sentryNonRecordingSpan = require_sentryNonRecordingSpan();
	const sentrySpan = require_sentrySpan();
	const spanstatus = require_spanstatus();
	const utils = require_utils$9();
	const SUPPRESS_TRACING_KEY = "__SENTRY_SUPPRESS_TRACING__";
	function startSpan(options, callback) {
		const acs = getAcs();
		if (acs.startSpan) return acs.startSpan(options, callback);
		const spanArguments = parseSentrySpanArguments(options);
		const { forceTransaction, parentSpan: customParentSpan, scope: customScope } = options;
		const customForkedScope = customScope?.clone();
		return currentScopes.withScope(customForkedScope, () => {
			return getActiveSpanWrapper(customParentSpan)(() => {
				const scope = currentScopes.getCurrentScope();
				const parentSpan = getParentSpan(scope, customParentSpan);
				const client = currentScopes.getClient();
				const activeSpan = options.onlyIfParent && !parentSpan ? startMissingRequiredParentSpan(scope, client) : createChildOrRootSpan({
					parentSpan,
					spanArguments,
					forceTransaction,
					scope
				});
				if (!_isIgnoredSpan(activeSpan) || !parentSpan) spanOnScope._setSpanForScope(scope, activeSpan);
				return handleCallbackErrors.handleCallbackErrors(() => callback(activeSpan), () => {
					const { status } = spanUtils.spanToJSON(activeSpan);
					if (activeSpan.isRecording() && (!status || status === "ok")) activeSpan.setStatus({
						code: spanstatus.SPAN_STATUS_ERROR,
						message: "internal_error"
					});
				}, () => {
					activeSpan.end();
				});
			});
		});
	}
	function startSpanManual(options, callback) {
		const acs = getAcs();
		if (acs.startSpanManual) return acs.startSpanManual(options, callback);
		const spanArguments = parseSentrySpanArguments(options);
		const { forceTransaction, parentSpan: customParentSpan, scope: customScope } = options;
		const customForkedScope = customScope?.clone();
		return currentScopes.withScope(customForkedScope, () => {
			return getActiveSpanWrapper(customParentSpan)(() => {
				const scope = currentScopes.getCurrentScope();
				const parentSpan = getParentSpan(scope, customParentSpan);
				const activeSpan = options.onlyIfParent && !parentSpan ? startMissingRequiredParentSpan(scope, currentScopes.getClient()) : createChildOrRootSpan({
					parentSpan,
					spanArguments,
					forceTransaction,
					scope
				});
				if (!_isIgnoredSpan(activeSpan) || !parentSpan) spanOnScope._setSpanForScope(scope, activeSpan);
				return handleCallbackErrors.handleCallbackErrors(() => callback(activeSpan, () => activeSpan.end()), () => {
					const { status } = spanUtils.spanToJSON(activeSpan);
					if (activeSpan.isRecording() && (!status || status === "ok")) activeSpan.setStatus({
						code: spanstatus.SPAN_STATUS_ERROR,
						message: "internal_error"
					});
				});
			});
		});
	}
	function startInactiveSpan(options) {
		const acs = getAcs();
		if (acs.startInactiveSpan) return acs.startInactiveSpan(options);
		const spanArguments = parseSentrySpanArguments(options);
		const { forceTransaction, parentSpan: customParentSpan } = options;
		return (options.scope ? (callback) => currentScopes.withScope(options.scope, callback) : customParentSpan !== void 0 ? (callback) => withActiveSpan(customParentSpan, callback) : (callback) => callback())(() => {
			const scope = currentScopes.getCurrentScope();
			const parentSpan = getParentSpan(scope, customParentSpan);
			const client = currentScopes.getClient();
			if (options.onlyIfParent && !parentSpan) return startMissingRequiredParentSpan(scope, client);
			return createChildOrRootSpan({
				parentSpan,
				spanArguments,
				forceTransaction,
				scope
			});
		});
	}
	const continueTrace = (options, callback) => {
		const carrier$1 = carrier.getMainCarrier();
		const acs = index.getAsyncContextStrategy(carrier$1);
		if (acs.continueTrace) return acs.continueTrace(options, callback);
		const { sentryTrace, baggage: baggage$1 } = options;
		const client = currentScopes.getClient();
		const incomingDsc = baggage.baggageHeaderToDynamicSamplingContext(baggage$1);
		if (client && !tracing.shouldContinueTrace(client, incomingDsc?.org_id)) return startNewTrace(callback);
		return currentScopes.withScope((scope) => {
			const propagationContext = tracing.propagationContextFromHeaders(sentryTrace, baggage$1);
			scope.setPropagationContext(propagationContext);
			spanOnScope._setSpanForScope(scope, void 0);
			return callback();
		});
	};
	function withActiveSpan(span, callback) {
		const acs = getAcs();
		if (acs.withActiveSpan) return acs.withActiveSpan(span, callback);
		return currentScopes.withScope((scope) => {
			spanOnScope._setSpanForScope(scope, span || void 0);
			return callback(scope);
		});
	}
	function suppressTracing(callback) {
		const acs = getAcs();
		if (acs.suppressTracing) return acs.suppressTracing(callback);
		return currentScopes.withScope((scope) => {
			scope.setSDKProcessingMetadata({ [SUPPRESS_TRACING_KEY]: true });
			const res = callback();
			scope.setSDKProcessingMetadata({ [SUPPRESS_TRACING_KEY]: void 0 });
			return res;
		});
	}
	function startNewTrace(callback) {
		const acs = getAcs();
		if (acs.startNewTrace) return acs.startNewTrace(callback);
		return currentScopes.withScope((scope) => {
			scope.setPropagationContext({
				traceId: propagationContext.generateTraceId(),
				sampleRand: randomSafeContext.safeMathRandom()
			});
			debugBuild.DEBUG_BUILD && debugLogger.debug.log(`Starting a new trace with id ${scope.getPropagationContext().traceId}`);
			return withActiveSpan(null, callback);
		});
	}
	function startMissingRequiredParentSpan(scope, client) {
		client?.recordDroppedEvent("no_parent_span", "span");
		const span = new sentryNonRecordingSpan.SentryNonRecordingSpan({ traceId: scope.getPropagationContext().traceId });
		utils.setCapturedScopesOnSpan(span, scope, currentScopes.getIsolationScope());
		return span;
	}
	function createChildOrRootSpan({ parentSpan, spanArguments, forceTransaction, scope }) {
		const isolationScope = currentScopes.getIsolationScope();
		if (!hasSpansEnabled.hasSpansEnabled()) {
			const scopePropagationContext = {
				...isolationScope.getPropagationContext(),
				...scope.getPropagationContext()
			};
			const traceId = parentSpan ? parentSpan.spanContext().traceId : scopePropagationContext.traceId;
			const span2 = new sentryNonRecordingSpan.SentryNonRecordingSpan({ traceId });
			if (parentSpan && !forceTransaction) spanUtils.addChildSpanToSpan(parentSpan, span2);
			utils.setCapturedScopesOnSpan(span2, scope, isolationScope);
			return span2;
		}
		const client = currentScopes.getClient();
		if (_shouldIgnoreStreamedSpan(client, spanArguments)) {
			if (!_isTracingSuppressed(scope)) client?.recordDroppedEvent("ignored", "span");
			const ignoredSpan = new sentryNonRecordingSpan.SentryNonRecordingSpan({
				dropReason: "ignored",
				traceId: parentSpan?.spanContext().traceId ?? scope.getPropagationContext().traceId
			});
			utils.setCapturedScopesOnSpan(ignoredSpan, scope, isolationScope);
			return ignoredSpan;
		}
		let span;
		if (parentSpan && !forceTransaction) {
			span = _startChildSpan(parentSpan, scope, spanArguments, isolationScope);
			spanUtils.addChildSpanToSpan(parentSpan, span);
		} else if (parentSpan) {
			const dsc = dynamicSamplingContext.getDynamicSamplingContextFromSpan(parentSpan);
			const { traceId, spanId: parentSpanId } = parentSpan.spanContext();
			const parentSampled = spanUtils.spanIsSampled(parentSpan);
			span = _startRootSpan({
				traceId,
				parentSpanId,
				...spanArguments
			}, scope, isolationScope, parentSampled);
			dynamicSamplingContext.freezeDscOnSpan(span, dsc);
		} else {
			const { traceId, dsc, parentSpanId, sampled: parentSampled } = {
				...isolationScope.getPropagationContext(),
				...scope.getPropagationContext()
			};
			span = _startRootSpan({
				traceId,
				parentSpanId,
				...spanArguments
			}, scope, isolationScope, parentSampled);
			if (dsc) dynamicSamplingContext.freezeDscOnSpan(span, dsc);
		}
		logSpans.logSpanStart(span);
		return span;
	}
	function parseSentrySpanArguments(options) {
		const initialCtx = {
			isStandalone: (options.experimental || {}).standalone,
			...options
		};
		if (options.startTime) {
			const ctx = { ...initialCtx };
			ctx.startTimestamp = spanUtils.spanTimeInputToSeconds(options.startTime);
			delete ctx.startTime;
			return ctx;
		}
		return initialCtx;
	}
	function getAcs() {
		const carrier$1 = carrier.getMainCarrier();
		return index.getAsyncContextStrategy(carrier$1);
	}
	function _startRootSpan(spanArguments, scope, isolationScope, parentSampled) {
		const client = currentScopes.getClient();
		const options = client?.getOptions() || {};
		const { name = "" } = spanArguments;
		const mutableSpanSamplingData = {
			spanAttributes: { ...spanArguments.attributes },
			spanName: name,
			parentSampled
		};
		client?.emit("beforeSampling", mutableSpanSamplingData, { decision: false });
		const finalParentSampled = mutableSpanSamplingData.parentSampled ?? parentSampled;
		const finalAttributes = mutableSpanSamplingData.spanAttributes;
		const currentPropagationContext = scope.getPropagationContext();
		const isTracingSuppressed = _isTracingSuppressed(scope);
		const [sampled, sampleRate, localSampleRateWasApplied] = isTracingSuppressed ? [false] : sampling.sampleSpan(options, {
			name,
			parentSampled: finalParentSampled,
			attributes: finalAttributes,
			parentSampleRate: parseSampleRate.parseSampleRate(currentPropagationContext.dsc?.sample_rate)
		}, currentPropagationContext.sampleRand);
		const rootSpan = new sentrySpan.SentrySpan({
			...spanArguments,
			attributes: {
				[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: "custom",
				[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE]: sampleRate !== void 0 && localSampleRateWasApplied ? sampleRate : void 0,
				...finalAttributes
			},
			sampled
		});
		if (!sampled && client && !isTracingSuppressed) {
			debugBuild.DEBUG_BUILD && debugLogger.debug.log("[Tracing] Discarding root span because its trace was not chosen to be sampled.");
			client.recordDroppedEvent("sample_rate", hasSpanStreamingEnabled.hasSpanStreamingEnabled(client) ? "span" : "transaction");
		}
		utils.setCapturedScopesOnSpan(rootSpan, scope, isolationScope);
		if (client) client.emit("spanStart", rootSpan);
		return rootSpan;
	}
	function _startChildSpan(parentSpan, scope, spanArguments, isolationScope) {
		const { spanId, traceId } = parentSpan.spanContext();
		const isTracingSuppressed = _isTracingSuppressed(scope);
		const sampled = isTracingSuppressed ? false : spanUtils.spanIsSampled(parentSpan);
		const childSpan = sampled ? new sentrySpan.SentrySpan({
			...spanArguments,
			parentSpanId: spanId,
			traceId,
			sampled
		}) : new sentryNonRecordingSpan.SentryNonRecordingSpan({ traceId });
		spanUtils.addChildSpanToSpan(parentSpan, childSpan);
		utils.setCapturedScopesOnSpan(childSpan, scope, isolationScope);
		const client = currentScopes.getClient();
		if (!client) return childSpan;
		if (hasSpanStreamingEnabled.hasSpanStreamingEnabled(client) && sentryNonRecordingSpan.spanIsNonRecordingSpan(childSpan)) {
			if (sentryNonRecordingSpan.spanIsNonRecordingSpan(parentSpan) && parentSpan.dropReason) {
				childSpan.dropReason = parentSpan.dropReason;
				client.recordDroppedEvent(parentSpan.dropReason, "span");
			} else if (!isTracingSuppressed) {
				childSpan.dropReason = "sample_rate";
				client.recordDroppedEvent("sample_rate", "span");
			}
		}
		client.emit("spanStart", childSpan);
		if (spanArguments.endTimestamp) {
			client.emit("spanEnd", childSpan);
			client.emit("afterSpanEnd", childSpan);
		}
		return childSpan;
	}
	function getParentSpan(scope, customParentSpan) {
		if (customParentSpan) return customParentSpan;
		if (customParentSpan === null) return;
		const span = spanOnScope._getSpanForScope(scope);
		if (!span) return;
		const client = currentScopes.getClient();
		if ((client ? client.getOptions() : {}).parentSpanIsAlwaysRootSpan) return spanUtils.getRootSpan(span);
		return span;
	}
	function getActiveSpanWrapper(parentSpan) {
		return parentSpan !== void 0 ? (callback) => {
			return withActiveSpan(parentSpan, callback);
		} : (callback) => callback();
	}
	function _shouldIgnoreStreamedSpan(client, spanArguments) {
		const ignoreSpans = client?.getOptions().ignoreSpans;
		if (!client || !hasSpanStreamingEnabled.hasSpanStreamingEnabled(client) || !ignoreSpans?.length) return false;
		return shouldIgnoreSpan.shouldIgnoreSpan({
			description: spanArguments.name || "",
			op: spanArguments.attributes?.[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_OP] || spanArguments.op,
			attributes: spanArguments.attributes
		}, ignoreSpans);
	}
	function _isIgnoredSpan(span) {
		return sentryNonRecordingSpan.spanIsNonRecordingSpan(span) && span.dropReason === "ignored";
	}
	function _isTracingSuppressed(scope) {
		return scope.getScopeData().sdkProcessingMetadata[SUPPRESS_TRACING_KEY] === true;
	}
	exports.SUPPRESS_TRACING_KEY = SUPPRESS_TRACING_KEY;
	exports.continueTrace = continueTrace;
	exports.startInactiveSpan = startInactiveSpan;
	exports.startNewTrace = startNewTrace;
	exports.startSpan = startSpan;
	exports.startSpanManual = startSpanManual;
	exports.suppressTracing = suppressTracing;
	exports.withActiveSpan = withActiveSpan;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/idleSpan.js
var require_idleSpan = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const currentScopes = require_currentScopes();
	const debugBuild = require_debug_build();
	const semanticAttributes = require_semanticAttributes();
	const debugLogger = require_debug_logger();
	const hasSpansEnabled = require_hasSpansEnabled();
	const shouldIgnoreSpan = require_should_ignore_span();
	const spanOnScope = require_spanOnScope();
	const spanUtils = require_spanUtils();
	const time = require_time();
	const sentryNonRecordingSpan = require_sentryNonRecordingSpan();
	const sentrySpan = require_sentrySpan();
	const spanstatus = require_spanstatus();
	const trace = require_trace();
	const utils = require_utils$9();
	const TRACING_DEFAULTS = {
		idleTimeout: 1e3,
		finalTimeout: 3e4,
		childSpanTimeout: 15e3
	};
	const FINISH_REASON_HEARTBEAT_FAILED = "heartbeatFailed";
	const FINISH_REASON_IDLE_TIMEOUT = "idleTimeout";
	const FINISH_REASON_FINAL_TIMEOUT = "finalTimeout";
	const FINISH_REASON_EXTERNAL_FINISH = "externalFinish";
	function startIdleSpan(startSpanOptions, options = {}) {
		const activities = /* @__PURE__ */ new Map();
		let _finished = false;
		let _idleTimeoutID;
		let _finishReason = FINISH_REASON_EXTERNAL_FINISH;
		let _autoFinishAllowed = !options.disableAutoFinish;
		const _cleanupHooks = [];
		const { idleTimeout = TRACING_DEFAULTS.idleTimeout, finalTimeout = TRACING_DEFAULTS.finalTimeout, childSpanTimeout = TRACING_DEFAULTS.childSpanTimeout, beforeSpanEnd, trimIdleSpanEndTimestamp = true } = options;
		const client = currentScopes.getClient();
		const scope = currentScopes.getCurrentScope();
		if (!client || !hasSpansEnabled.hasSpansEnabled()) {
			const span2 = new sentryNonRecordingSpan.SentryNonRecordingSpan({ traceId: scope.getPropagationContext().traceId });
			utils.setCapturedScopesOnSpan(span2, scope, currentScopes.getIsolationScope());
			return span2;
		}
		const previousActiveSpan = spanUtils.getActiveSpan();
		const span = _startIdleSpan(startSpanOptions);
		span.end = new Proxy(span.end, { apply(target, thisArg, args) {
			if (beforeSpanEnd) beforeSpanEnd(span);
			if (sentryNonRecordingSpan.spanIsNonRecordingSpan(thisArg)) return;
			const [definedEndTimestamp, ...rest] = args;
			const timestamp = definedEndTimestamp || time.timestampInSeconds();
			const spanEndTimestamp = spanUtils.spanTimeInputToSeconds(timestamp);
			const spans = spanUtils.getSpanDescendants(span).filter((child) => child !== span);
			const spanJson = spanUtils.spanToJSON(span);
			if (!spans.length || !trimIdleSpanEndTimestamp) {
				onIdleSpanEnded(spanEndTimestamp);
				return Reflect.apply(target, thisArg, [spanEndTimestamp, ...rest]);
			}
			const ignoreSpans = client.getOptions().ignoreSpans;
			const latestSpanEndTimestamp = spans?.reduce((acc, current) => {
				const currentSpanJson = spanUtils.spanToJSON(current);
				if (!currentSpanJson.timestamp) return acc;
				if (ignoreSpans && shouldIgnoreSpan.shouldIgnoreSpan({
					description: currentSpanJson.description,
					op: currentSpanJson.op,
					attributes: currentSpanJson.data
				}, ignoreSpans)) return acc;
				return acc ? Math.max(acc, currentSpanJson.timestamp) : currentSpanJson.timestamp;
			}, void 0);
			const spanStartTimestamp = spanJson.start_timestamp;
			const endTimestamp = Math.min(spanStartTimestamp ? spanStartTimestamp + finalTimeout / 1e3 : Infinity, Math.max(spanStartTimestamp || -Infinity, Math.min(spanEndTimestamp, latestSpanEndTimestamp || Infinity)));
			onIdleSpanEnded(endTimestamp);
			return Reflect.apply(target, thisArg, [endTimestamp, ...rest]);
		} });
		function _cancelIdleTimeout() {
			if (_idleTimeoutID) {
				clearTimeout(_idleTimeoutID);
				_idleTimeoutID = void 0;
			}
		}
		function _restartIdleTimeout(endTimestamp) {
			_cancelIdleTimeout();
			_idleTimeoutID = setTimeout(() => {
				if (!_finished && activities.size === 0 && _autoFinishAllowed) {
					_finishReason = FINISH_REASON_IDLE_TIMEOUT;
					span.end(endTimestamp);
				}
			}, idleTimeout);
		}
		function _restartChildSpanTimeout(endTimestamp) {
			_idleTimeoutID = setTimeout(() => {
				if (!_finished && _autoFinishAllowed) {
					_finishReason = FINISH_REASON_HEARTBEAT_FAILED;
					span.end(endTimestamp);
				}
			}, childSpanTimeout);
		}
		function _pushActivity(spanId) {
			_cancelIdleTimeout();
			activities.set(spanId, true);
			_restartChildSpanTimeout(time.timestampInSeconds() + childSpanTimeout / 1e3);
		}
		function _popActivity(spanId) {
			if (activities.has(spanId)) activities.delete(spanId);
			if (activities.size === 0) _restartIdleTimeout(time.timestampInSeconds() + idleTimeout / 1e3);
		}
		function onIdleSpanEnded(endTimestamp) {
			_finished = true;
			activities.clear();
			_cleanupHooks.forEach((cleanup) => cleanup());
			spanOnScope._setSpanForScope(scope, previousActiveSpan);
			const spanJSON = spanUtils.spanToJSON(span);
			const { start_timestamp: startTimestamp } = spanJSON;
			if (!startTimestamp) return;
			if (!spanJSON.data[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_IDLE_SPAN_FINISH_REASON]) span.setAttribute(semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_IDLE_SPAN_FINISH_REASON, _finishReason);
			const currentStatus = spanJSON.status;
			if (!currentStatus || currentStatus === "unknown") span.setStatus({ code: spanstatus.SPAN_STATUS_OK });
			debugLogger.debug.log(`[Tracing] Idle span "${spanJSON.op}" finished`);
			const childSpans = spanUtils.getSpanDescendants(span).filter((child) => child !== span);
			let discardedSpans = 0;
			childSpans.forEach((childSpan) => {
				if (childSpan.isRecording()) {
					childSpan.setStatus({
						code: spanstatus.SPAN_STATUS_ERROR,
						message: "cancelled"
					});
					childSpan.end(endTimestamp);
					debugBuild.DEBUG_BUILD && debugLogger.debug.log("[Tracing] Cancelling span since span ended early", JSON.stringify(childSpan, void 0, 2));
				}
				const { timestamp: childEndTimestamp = 0, start_timestamp: childStartTimestamp = 0 } = spanUtils.spanToJSON(childSpan);
				const spanStartedBeforeIdleSpanEnd = childStartTimestamp <= endTimestamp;
				const timeoutWithMarginOfError = (finalTimeout + idleTimeout) / 1e3;
				const spanEndedBeforeFinalTimeout = childEndTimestamp - childStartTimestamp <= timeoutWithMarginOfError;
				if (debugBuild.DEBUG_BUILD) {
					const stringifiedSpan = JSON.stringify(childSpan, void 0, 2);
					if (!spanStartedBeforeIdleSpanEnd) debugLogger.debug.log("[Tracing] Discarding span since it happened after idle span was finished", stringifiedSpan);
					else if (!spanEndedBeforeFinalTimeout) debugLogger.debug.log("[Tracing] Discarding span since it finished after idle span final timeout", stringifiedSpan);
				}
				if (!spanEndedBeforeFinalTimeout || !spanStartedBeforeIdleSpanEnd) {
					spanUtils.removeChildSpanFromSpan(span, childSpan);
					discardedSpans++;
				}
			});
			if (discardedSpans > 0) span.setAttribute("sentry.idle_span_discarded_spans", discardedSpans);
		}
		_cleanupHooks.push(client.on("spanStart", (startedSpan) => {
			if (_finished || startedSpan === span || !!spanUtils.spanToJSON(startedSpan).timestamp || startedSpan instanceof sentrySpan.SentrySpan && startedSpan.isStandaloneSpan()) return;
			if (spanUtils.getSpanDescendants(span).includes(startedSpan)) _pushActivity(startedSpan.spanContext().spanId);
		}));
		_cleanupHooks.push(client.on("spanEnd", (endedSpan) => {
			if (_finished) return;
			_popActivity(endedSpan.spanContext().spanId);
		}));
		_cleanupHooks.push(client.on("idleSpanEnableAutoFinish", (spanToAllowAutoFinish) => {
			if (spanToAllowAutoFinish === span) {
				_autoFinishAllowed = true;
				_restartIdleTimeout();
				if (activities.size) _restartChildSpanTimeout();
			}
		}));
		if (!options.disableAutoFinish) _restartIdleTimeout();
		setTimeout(() => {
			if (!_finished) {
				span.setStatus({
					code: spanstatus.SPAN_STATUS_ERROR,
					message: "deadline_exceeded"
				});
				_finishReason = FINISH_REASON_FINAL_TIMEOUT;
				span.end();
			}
		}, finalTimeout);
		return span;
	}
	function _startIdleSpan(options) {
		const span = trace.startInactiveSpan(options);
		spanOnScope._setSpanForScope(currentScopes.getCurrentScope(), span);
		debugBuild.DEBUG_BUILD && debugLogger.debug.log("[Tracing] Started span is an idle span");
		return span;
	}
	exports.TRACING_DEFAULTS = TRACING_DEFAULTS;
	exports.startIdleSpan = startIdleSpan;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/bindScopeToEmitter.js
var require_bindScopeToEmitter = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const currentScopes = require_currentScopes();
	const ADD_LISTENER_METHODS = [
		"addListener",
		"on",
		"once",
		"prependListener",
		"prependOnceListener",
		"addEventListener"
	];
	const REMOVE_LISTENER_METHODS = [
		"removeListener",
		"off",
		"removeEventListener"
	];
	const SCOPE_BOUND_LISTENERS = /* @__PURE__ */ Symbol("SentryScopeBoundListeners");
	let registeringWrapper;
	function isReentrantWrapperRegistration(listener) {
		return registeringWrapper !== void 0 && (listener === registeringWrapper || listener.listener === registeringWrapper);
	}
	function bindScopeToEmitter(emitter, scope = currentScopes.getCurrentScope()) {
		const ee = emitter;
		if (getPatchMap(ee)) return emitter;
		createPatchMap(ee);
		for (const methodName of ADD_LISTENER_METHODS) {
			if (typeof ee[methodName] !== "function") continue;
			ee[methodName] = patchAddListener(ee, ee[methodName], scope);
		}
		for (const methodName of REMOVE_LISTENER_METHODS) {
			if (typeof ee[methodName] !== "function") continue;
			ee[methodName] = patchRemoveListener(ee, ee[methodName]);
		}
		if (typeof ee.removeAllListeners === "function") ee.removeAllListeners = patchRemoveAllListeners(ee, ee.removeAllListeners);
		return emitter;
	}
	function bindListenerToScope(listener, scope) {
		return function(...args) {
			return currentScopes.withScope(scope, () => listener.apply(this, args));
		};
	}
	function isBoundListener(listener) {
		return typeof listener === "function";
	}
	function patchAddListener(ee, original, scope) {
		return function(...args) {
			const event = args[0];
			const listener = args[1];
			const rest = args.slice(2);
			if (!isBoundListener(listener) || isReentrantWrapperRegistration(listener)) return original.apply(this, args);
			const map = getPatchMap(ee) || createPatchMap(ee);
			let listeners = map.get(event);
			if (!listeners) {
				listeners = /* @__PURE__ */ new WeakMap();
				map.set(event, listeners);
			}
			let boundListener = listeners.get(listener);
			if (!boundListener) {
				boundListener = bindListenerToScope(listener, scope);
				listeners.set(listener, boundListener);
			}
			const previous = registeringWrapper;
			registeringWrapper = boundListener;
			try {
				return original.call(this, event, boundListener, ...rest);
			} finally {
				registeringWrapper = previous;
			}
		};
	}
	function patchRemoveListener(ee, original) {
		return function(...args) {
			const event = args[0];
			const listener = args[1];
			const rest = args.slice(2);
			const boundListener = isBoundListener(listener) ? getPatchMap(ee)?.get(event)?.get(listener) : void 0;
			if (!boundListener) return original.apply(this, args);
			return original.call(this, event, boundListener, ...rest);
		};
	}
	function patchRemoveAllListeners(ee, original) {
		return function(...args) {
			const map = getPatchMap(ee);
			if (map) if (args.length === 0) createPatchMap(ee);
			else {
				const event = args[0];
				map.delete(event);
			}
			return original.apply(this, args);
		};
	}
	function createPatchMap(ee) {
		const map = /* @__PURE__ */ new Map();
		ee[SCOPE_BOUND_LISTENERS] = map;
		return map;
	}
	function getPatchMap(ee) {
		return ee[SCOPE_BOUND_LISTENERS];
	}
	exports.bindScopeToEmitter = bindScopeToEmitter;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/scopeData.js
var require_scopeData = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const currentScopes = require_currentScopes();
	const dynamicSamplingContext = require_dynamicSamplingContext();
	const merge = require_merge();
	const spanUtils = require_spanUtils();
	function applyScopeDataToEvent(event, data) {
		const { fingerprint, span, breadcrumbs, sdkProcessingMetadata } = data;
		applyDataToEvent(event, data);
		if (span) applySpanToEvent(event, span);
		applyFingerprintToEvent(event, fingerprint);
		applyBreadcrumbsToEvent(event, breadcrumbs);
		applySdkMetadataToEvent(event, sdkProcessingMetadata);
	}
	function mergeScopeData(data, mergeData) {
		const { extra, tags, attributes, user, contexts, level, sdkProcessingMetadata, breadcrumbs, fingerprint, eventProcessors, attachments, propagationContext, transactionName, span } = mergeData;
		mergeAndOverwriteScopeData(data, "extra", extra);
		mergeAndOverwriteScopeData(data, "tags", tags);
		mergeAndOverwriteScopeData(data, "attributes", attributes);
		mergeAndOverwriteScopeData(data, "user", user);
		mergeAndOverwriteScopeData(data, "contexts", contexts);
		data.sdkProcessingMetadata = merge.merge(data.sdkProcessingMetadata, sdkProcessingMetadata, 2);
		if (level) data.level = level;
		if (transactionName) data.transactionName = transactionName;
		if (span) data.span = span;
		if (breadcrumbs.length) data.breadcrumbs = [...data.breadcrumbs, ...breadcrumbs];
		if (fingerprint.length) data.fingerprint = [...data.fingerprint, ...fingerprint];
		if (eventProcessors.length) data.eventProcessors = [...data.eventProcessors, ...eventProcessors];
		if (attachments.length) data.attachments = [...data.attachments, ...attachments];
		data.propagationContext = {
			...data.propagationContext,
			...propagationContext
		};
	}
	function mergeAndOverwriteScopeData(data, prop, mergeVal) {
		data[prop] = merge.merge(data[prop], mergeVal, 1);
	}
	function getCombinedScopeData(isolationScope, currentScope) {
		const scopeData = currentScopes.getGlobalScope().getScopeData();
		isolationScope && mergeScopeData(scopeData, isolationScope.getScopeData());
		currentScope && mergeScopeData(scopeData, currentScope.getScopeData());
		return scopeData;
	}
	function applyDataToEvent(event, data) {
		const { extra, tags, user, contexts, level, transactionName } = data;
		if (Object.keys(extra).length) event.extra = {
			...extra,
			...event.extra
		};
		if (Object.keys(tags).length) event.tags = {
			...tags,
			...event.tags
		};
		if (Object.keys(user).length) event.user = {
			...user,
			...event.user
		};
		if (Object.keys(contexts).length) event.contexts = {
			...contexts,
			...event.contexts
		};
		if (level) event.level = level;
		if (transactionName && event.type !== "transaction") event.transaction = transactionName;
	}
	function applyBreadcrumbsToEvent(event, breadcrumbs) {
		const mergedBreadcrumbs = [...event.breadcrumbs || [], ...breadcrumbs];
		event.breadcrumbs = mergedBreadcrumbs.length ? mergedBreadcrumbs : void 0;
	}
	function applySdkMetadataToEvent(event, sdkProcessingMetadata) {
		event.sdkProcessingMetadata = {
			...event.sdkProcessingMetadata,
			...sdkProcessingMetadata
		};
	}
	function applySpanToEvent(event, span) {
		event.contexts = {
			trace: spanUtils.spanToTraceContext(span),
			...event.contexts
		};
		event.sdkProcessingMetadata = {
			dynamicSamplingContext: dynamicSamplingContext.getDynamicSamplingContextFromSpan(span),
			...event.sdkProcessingMetadata
		};
		const rootSpan = spanUtils.getRootSpan(span);
		const transactionName = spanUtils.spanToJSON(rootSpan).description;
		if (transactionName && !event.transaction && event.type === "transaction") event.transaction = transactionName;
	}
	function applyFingerprintToEvent(event, fingerprint) {
		event.fingerprint = event.fingerprint ? Array.isArray(event.fingerprint) ? event.fingerprint : [event.fingerprint] : [];
		if (fingerprint) event.fingerprint = event.fingerprint.concat(fingerprint);
		if (!event.fingerprint.length) delete event.fingerprint;
	}
	exports.applyScopeDataToEvent = applyScopeDataToEvent;
	exports.getCombinedScopeData = getCombinedScopeData;
	exports.mergeAndOverwriteScopeData = mergeAndOverwriteScopeData;
	exports.mergeScopeData = mergeScopeData;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/spans/scopeContextAttributes.js
var require_scopeContextAttributes = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	function scopeContextsToSpanAttributes(contexts) {
		const attrs = {};
		const { response, profile, cloud_resource, culture, state } = contexts;
		if (response) {
			if (response.status_code != null) attrs["http.response.status_code"] = response.status_code;
			if (response.body_size != null) attrs["http.response.body.size"] = response.body_size;
		}
		if (profile) {
			if (profile.profile_id) attrs["sentry.profile_id"] = profile.profile_id;
			if (profile.profiler_id) attrs["sentry.profiler_id"] = profile.profiler_id;
		}
		if (cloud_resource) {
			for (const [key, value] of Object.entries(cloud_resource)) if (value != null) attrs[key] = value;
		}
		if (culture) {
			if (culture.locale) attrs["culture.locale"] = culture.locale;
			if (culture.timezone) attrs["culture.timezone"] = culture.timezone;
		}
		if (state?.state && typeof state.state.type === "string") attrs["state.type"] = state.state.type;
		const angular = contexts["angular"];
		if (angular) {
			const version = angular["version"];
			if (typeof version === "string" || typeof version === "number") attrs["angular.version"] = version;
		}
		const react = contexts["react"];
		if (react) {
			const version = react["version"];
			if (typeof version === "string" || typeof version === "number") attrs["react.version"] = version;
		}
		return attrs;
	}
	exports.scopeContextsToSpanAttributes = scopeContextsToSpanAttributes;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/spans/captureSpan.js
var require_captureSpan = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const semanticAttributes = require_semanticAttributes();
	const scopeData = require_scopeData();
	const spanUtils = require_spanUtils();
	const utils = require_utils$9();
	const beforeSendSpan = require_beforeSendSpan();
	const scopeContextAttributes = require_scopeContextAttributes();
	const constants = require_constants$8();
	function captureSpan(span, client) {
		const spanJSON = spanUtils.spanToStreamedSpanJSON(span);
		const segmentSpan = spanUtils.INTERNAL_getSegmentSpan(span);
		const serializedSegmentSpan = spanUtils.spanToStreamedSpanJSON(segmentSpan);
		const { isolationScope: spanIsolationScope, scope: spanScope } = utils.getCapturedScopesOnSpan(span);
		const finalScopeData = scopeData.getCombinedScopeData(spanIsolationScope, spanScope);
		applyCommonSpanAttributes(spanJSON, serializedSegmentSpan, client, finalScopeData);
		const spanKind = span.kind;
		client.emit("preprocessSpan", spanJSON, { spanKind });
		if (spanJSON.is_segment) {
			applyScopeToSegmentSpan(spanJSON, finalScopeData);
			applySdkMetadataToSegmentSpan(spanJSON, client);
			client.emit("processSegmentSpan", spanJSON);
		}
		client.emit("processSpan", spanJSON);
		const { beforeSendSpan: beforeSendSpan$1 } = client.getOptions();
		const processedSpan = beforeSendSpan$1 && beforeSendSpan.isStreamedBeforeSendSpanCallback(beforeSendSpan$1) ? applyBeforeSendSpanCallback(spanJSON, beforeSendSpan$1) : spanJSON;
		const spanNameSource = processedSpan.attributes?.[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE];
		if (spanNameSource) safeSetSpanJSONAttributes(processedSpan, { "sentry.span.source": spanNameSource });
		return {
			...spanUtils.streamedSpanJsonToSerializedSpan(processedSpan),
			_segmentSpan: segmentSpan
		};
	}
	function applyScopeToSegmentSpan(segmentSpanJSON, scopeData) {
		safeSetSpanJSONAttributes(segmentSpanJSON, scopeContextAttributes.scopeContextsToSpanAttributes(scopeData.contexts));
	}
	function safeSetSpanJSONAttributes(spanJSON, newAttributes) {
		const originalAttributes = spanJSON.attributes ?? (spanJSON.attributes = {});
		Object.entries(newAttributes).forEach(([key, value]) => {
			if (value != null && !(key in originalAttributes)) originalAttributes[key] = value;
		});
	}
	function applySdkMetadataToSegmentSpan(segmentSpanJSON, client) {
		const integrationNames = client.getIntegrationNames();
		if (!integrationNames.length) return;
		safeSetSpanJSONAttributes(segmentSpanJSON, { [semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_SDK_INTEGRATIONS]: integrationNames });
	}
	function applyCommonSpanAttributes(spanJSON, serializedSegmentSpan, client, scopeData) {
		const sdk = client.getSdkMetadata();
		const { release, environment } = client.getOptions();
		safeSetSpanJSONAttributes(spanJSON, {
			[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_RELEASE]: release,
			[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_ENVIRONMENT]: environment || constants.DEFAULT_ENVIRONMENT,
			[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_SEGMENT_NAME]: serializedSegmentSpan.name,
			[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_SEGMENT_ID]: serializedSegmentSpan.span_id,
			[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_SDK_NAME]: sdk?.sdk?.name,
			[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_SDK_VERSION]: sdk?.sdk?.version,
			[semanticAttributes.SEMANTIC_ATTRIBUTE_USER_ID]: scopeData.user?.id,
			[semanticAttributes.SEMANTIC_ATTRIBUTE_USER_EMAIL]: scopeData.user?.email,
			[semanticAttributes.SEMANTIC_ATTRIBUTE_USER_IP_ADDRESS]: scopeData.user?.ip_address,
			[semanticAttributes.SEMANTIC_ATTRIBUTE_USER_USERNAME]: scopeData.user?.username,
			...scopeData.attributes
		});
	}
	function applyBeforeSendSpanCallback(span, beforeSendSpan) {
		const modifedSpan = beforeSendSpan(span);
		if (!modifedSpan) {
			spanUtils.showSpanDropWarning();
			return span;
		}
		return modifedSpan;
	}
	exports.applyBeforeSendSpanCallback = applyBeforeSendSpanCallback;
	exports.captureSpan = captureSpan;
	exports.safeSetSpanJSONAttributes = safeSetSpanJSONAttributes;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/syncpromise.js
var require_syncpromise = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const is = require_is();
	const STATE_PENDING = 0;
	const STATE_RESOLVED = 1;
	const STATE_REJECTED = 2;
	function resolvedSyncPromise(value) {
		return new SyncPromise((resolve) => {
			resolve(value);
		});
	}
	function rejectedSyncPromise(reason) {
		return new SyncPromise((_, reject) => {
			reject(reason);
		});
	}
	var SyncPromise = class SyncPromise {
		constructor(executor) {
			this._state = STATE_PENDING;
			this._handlers = [];
			this._runExecutor(executor);
		}
		/** @inheritdoc */
		then(onfulfilled, onrejected) {
			return new SyncPromise((resolve, reject) => {
				this._handlers.push([
					false,
					(result) => {
						if (!onfulfilled) resolve(result);
						else try {
							resolve(onfulfilled(result));
						} catch (e) {
							reject(e);
						}
					},
					(reason) => {
						if (!onrejected) reject(reason);
						else try {
							resolve(onrejected(reason));
						} catch (e) {
							reject(e);
						}
					}
				]);
				this._executeHandlers();
			});
		}
		/** @inheritdoc */
		catch(onrejected) {
			return this.then((val) => val, onrejected);
		}
		/** @inheritdoc */
		finally(onfinally) {
			return new SyncPromise((resolve, reject) => {
				let val;
				let isRejected;
				return this.then((value) => {
					isRejected = false;
					val = value;
					if (onfinally) onfinally();
				}, (reason) => {
					isRejected = true;
					val = reason;
					if (onfinally) onfinally();
				}).then(() => {
					if (isRejected) {
						reject(val);
						return;
					}
					resolve(val);
				});
			});
		}
		/** Excute the resolve/reject handlers. */
		_executeHandlers() {
			if (this._state === STATE_PENDING) return;
			const cachedHandlers = this._handlers.slice();
			this._handlers = [];
			cachedHandlers.forEach((handler) => {
				if (handler[0]) return;
				if (this._state === STATE_RESOLVED) handler[1](this._value);
				if (this._state === STATE_REJECTED) handler[2](this._value);
				handler[0] = true;
			});
		}
		/** Run the executor for the SyncPromise. */
		_runExecutor(executor) {
			const setResult = (state, value) => {
				if (this._state !== STATE_PENDING) return;
				if (is.isThenable(value)) {
					value.then(resolve, reject);
					return;
				}
				this._state = state;
				this._value = value;
				this._executeHandlers();
			};
			const resolve = (value) => {
				setResult(STATE_RESOLVED, value);
			};
			const reject = (reason) => {
				setResult(STATE_REJECTED, reason);
			};
			try {
				executor(resolve, reject);
			} catch (e) {
				reject(e);
			}
		}
	};
	exports.SyncPromise = SyncPromise;
	exports.rejectedSyncPromise = rejectedSyncPromise;
	exports.resolvedSyncPromise = resolvedSyncPromise;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/eventProcessors.js
var require_eventProcessors = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const debugBuild = require_debug_build();
	const debugLogger = require_debug_logger();
	const is = require_is();
	const syncpromise = require_syncpromise();
	function notifyEventProcessors(processors, event, hint, index = 0) {
		try {
			const result = _notifyEventProcessors(event, hint, processors, index);
			return is.isThenable(result) ? result : syncpromise.resolvedSyncPromise(result);
		} catch (error) {
			return syncpromise.rejectedSyncPromise(error);
		}
	}
	function _notifyEventProcessors(event, hint, processors, index) {
		const processor = processors[index];
		if (!event || !processor) return event;
		const result = processor({ ...event }, hint);
		debugBuild.DEBUG_BUILD && result === null && debugLogger.debug.log(`Event processor "${processor.id || "?"}" dropped event`);
		if (is.isThenable(result)) return result.then((final) => _notifyEventProcessors(final, hint, processors, index + 1));
		return _notifyEventProcessors(result, hint, processors, index + 1);
	}
	exports.notifyEventProcessors = notifyEventProcessors;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/debug-ids.js
var require_debug_ids = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const stacktrace = require_stacktrace();
	const worldwide = require_worldwide();
	let parsedStackResults;
	let lastSentryKeysCount;
	let lastNativeKeysCount;
	let cachedFilenameDebugIds;
	function getFilenameToDebugIdMap(stackParser) {
		const sentryDebugIdMap = worldwide.GLOBAL_OBJ._sentryDebugIds;
		const nativeDebugIdMap = worldwide.GLOBAL_OBJ._debugIds;
		if (!sentryDebugIdMap && !nativeDebugIdMap) return {};
		const sentryDebugIdKeys = sentryDebugIdMap ? Object.keys(sentryDebugIdMap) : [];
		const nativeDebugIdKeys = nativeDebugIdMap ? Object.keys(nativeDebugIdMap) : [];
		if (cachedFilenameDebugIds && sentryDebugIdKeys.length === lastSentryKeysCount && nativeDebugIdKeys.length === lastNativeKeysCount) return cachedFilenameDebugIds;
		lastSentryKeysCount = sentryDebugIdKeys.length;
		lastNativeKeysCount = nativeDebugIdKeys.length;
		cachedFilenameDebugIds = {};
		if (!parsedStackResults) parsedStackResults = {};
		const processDebugIds = (debugIdKeys, debugIdMap) => {
			for (const key of debugIdKeys) {
				const debugId = debugIdMap[key];
				const result = parsedStackResults?.[key];
				if (result && cachedFilenameDebugIds && debugId) {
					cachedFilenameDebugIds[result[0]] = debugId;
					if (parsedStackResults) parsedStackResults[key] = [result[0], debugId];
				} else if (debugId) {
					const parsedStack = stackParser(key);
					for (let i = parsedStack.length - 1; i >= 0; i--) {
						const filename = parsedStack[i]?.filename;
						if (filename && cachedFilenameDebugIds && parsedStackResults) {
							cachedFilenameDebugIds[filename] = debugId;
							parsedStackResults[key] = [filename, debugId];
							break;
						}
					}
				}
			}
		};
		if (sentryDebugIdMap) processDebugIds(sentryDebugIdKeys, sentryDebugIdMap);
		if (nativeDebugIdMap) processDebugIds(nativeDebugIdKeys, nativeDebugIdMap);
		return cachedFilenameDebugIds;
	}
	function getDebugImagesForResources(stackParser, resource_paths) {
		const filenameDebugIdMap = getFilenameToDebugIdMap(stackParser);
		if (!filenameDebugIdMap) return [];
		const images = [];
		for (const path of resource_paths) {
			const normalizedPath = stacktrace.normalizeStackTracePath(path);
			if (normalizedPath && filenameDebugIdMap[normalizedPath]) images.push({
				type: "sourcemap",
				code_file: path,
				debug_id: filenameDebugIdMap[normalizedPath]
			});
		}
		return images;
	}
	exports.getDebugImagesForResources = getDebugImagesForResources;
	exports.getFilenameToDebugIdMap = getFilenameToDebugIdMap;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/prepareEvent.js
var require_prepareEvent = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const constants = require_constants$8();
	const eventProcessors = require_eventProcessors();
	const scope = require_scope();
	const debugIds = require_debug_ids();
	const misc = require_misc();
	const normalize = require_normalize();
	const scopeData = require_scopeData();
	const string = require_string();
	const syncpromise = require_syncpromise();
	const time = require_time();
	function prepareEvent(options, event, hint, scope, client, isolationScope) {
		const { normalizeDepth = 3, normalizeMaxBreadth = 1e3 } = options;
		const prepared = {
			...event,
			event_id: event.event_id || hint.event_id || misc.uuid4(),
			timestamp: event.timestamp || time.dateTimestampInSeconds()
		};
		const integrations = hint.integrations || options.integrations.map((i) => i.name);
		applyClientOptions(prepared, options);
		applyIntegrationsMetadata(prepared, integrations);
		if (client) client.emit("applyFrameMetadata", event);
		if (event.type === void 0) applyDebugIds(prepared, options.stackParser);
		const finalScope = getFinalScope(scope, hint.captureContext);
		if (hint.mechanism) misc.addExceptionMechanism(prepared, hint.mechanism);
		const clientEventProcessors = client ? client.getEventProcessors() : [];
		const data = scopeData.getCombinedScopeData(isolationScope, finalScope);
		const attachments = [...hint.attachments || [], ...data.attachments];
		if (attachments.length) hint.attachments = attachments;
		scopeData.applyScopeDataToEvent(prepared, data);
		const eventProcessors$1 = [...clientEventProcessors, ...data.eventProcessors];
		return (hint.data && hint.data.__sentry__ === true ? syncpromise.resolvedSyncPromise(prepared) : eventProcessors.notifyEventProcessors(eventProcessors$1, prepared, hint)).then((evt) => {
			if (evt) applyDebugMeta(evt);
			if (typeof normalizeDepth === "number" && normalizeDepth > 0) return normalizeEvent(evt, normalizeDepth, normalizeMaxBreadth);
			return evt;
		});
	}
	function applyClientOptions(event, options) {
		const { environment, release, dist, maxValueLength } = options;
		event.environment = event.environment || environment || constants.DEFAULT_ENVIRONMENT;
		if (!event.release && release) event.release = release;
		if (!event.dist && dist) event.dist = dist;
		const request = event.request;
		if (request?.url && maxValueLength) request.url = string.truncate(request.url, maxValueLength);
		if (maxValueLength) event.exception?.values?.forEach((exception) => {
			if (exception.value) exception.value = string.truncate(exception.value, maxValueLength);
		});
	}
	function applyDebugIds(event, stackParser) {
		const filenameDebugIdMap = debugIds.getFilenameToDebugIdMap(stackParser);
		event.exception?.values?.forEach((exception) => {
			exception.stacktrace?.frames?.forEach((frame) => {
				if (frame.filename) frame.debug_id = filenameDebugIdMap[frame.filename];
			});
		});
	}
	function applyDebugMeta(event) {
		const filenameDebugIdMap = {};
		event.exception?.values?.forEach((exception) => {
			exception.stacktrace?.frames?.forEach((frame) => {
				if (frame.debug_id) {
					if (frame.abs_path) filenameDebugIdMap[frame.abs_path] = frame.debug_id;
					else if (frame.filename) filenameDebugIdMap[frame.filename] = frame.debug_id;
					delete frame.debug_id;
				}
			});
		});
		if (Object.keys(filenameDebugIdMap).length === 0) return;
		event.debug_meta = event.debug_meta || {};
		event.debug_meta.images = event.debug_meta.images || [];
		const images = event.debug_meta.images;
		Object.entries(filenameDebugIdMap).forEach(([filename, debug_id]) => {
			images.push({
				type: "sourcemap",
				code_file: filename,
				debug_id
			});
		});
	}
	function applyIntegrationsMetadata(event, integrationNames) {
		if (integrationNames.length > 0) {
			event.sdk = event.sdk || {};
			event.sdk.integrations = [...event.sdk.integrations || [], ...integrationNames];
		}
	}
	function normalizeEvent(event, depth, maxBreadth) {
		if (!event) return null;
		const normalized = {
			...event,
			...event.breadcrumbs && { breadcrumbs: event.breadcrumbs.map((b) => ({
				...b,
				...b.data && { data: normalize.normalize(b.data, depth, maxBreadth) }
			})) },
			...event.user && { user: normalize.normalize(event.user, depth, maxBreadth) },
			...event.contexts && { contexts: normalize.normalize(event.contexts, depth, maxBreadth) },
			...event.extra && { extra: normalize.normalize(event.extra, depth, maxBreadth) }
		};
		if (event.contexts?.trace && normalized.contexts) {
			normalized.contexts.trace = event.contexts.trace;
			if (event.contexts.trace.data) normalized.contexts.trace.data = normalize.normalize(event.contexts.trace.data, depth, maxBreadth);
		}
		if (event.spans) normalized.spans = event.spans.map((span) => {
			return {
				...span,
				...span.data && { data: normalize.normalize(span.data, depth, maxBreadth) }
			};
		});
		if (event.contexts?.flags && normalized.contexts) normalized.contexts.flags = normalize.normalize(event.contexts.flags, 3, maxBreadth);
		return normalized;
	}
	function getFinalScope(scope$1, captureContext) {
		if (!captureContext) return scope$1;
		const finalScope = scope$1 ? scope$1.clone() : new scope.Scope();
		finalScope.update(captureContext);
		return finalScope;
	}
	function parseEventHintOrCaptureContext(hint) {
		if (!hint) return;
		if (hintIsScopeOrFunction(hint)) return { captureContext: hint };
		if (hintIsScopeContext(hint)) return { captureContext: hint };
		return hint;
	}
	function hintIsScopeOrFunction(hint) {
		return hint instanceof scope.Scope || typeof hint === "function";
	}
	const captureContextKeys = [
		"user",
		"level",
		"extra",
		"contexts",
		"tags",
		"fingerprint",
		"propagationContext"
	];
	function hintIsScopeContext(hint) {
		return Object.keys(hint).some((key) => captureContextKeys.includes(key));
	}
	exports.applyClientOptions = applyClientOptions;
	exports.applyDebugIds = applyDebugIds;
	exports.applyDebugMeta = applyDebugMeta;
	exports.parseEventHintOrCaptureContext = parseEventHintOrCaptureContext;
	exports.prepareEvent = prepareEvent;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/exports.js
var require_exports$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const currentScopes = require_currentScopes();
	const debugBuild = require_debug_build();
	const session = require_session();
	const trace = require_trace();
	const debugLogger = require_debug_logger();
	const is = require_is();
	const misc = require_misc();
	const prepareEvent = require_prepareEvent();
	const scopeData = require_scopeData();
	const time = require_time();
	const worldwide = require_worldwide();
	function captureException(exception, hint) {
		return currentScopes.getCurrentScope().captureException(exception, prepareEvent.parseEventHintOrCaptureContext(hint));
	}
	function captureMessage(message, captureContext) {
		const level = typeof captureContext === "string" ? captureContext : void 0;
		const hint = typeof captureContext !== "string" ? { captureContext } : void 0;
		return currentScopes.getCurrentScope().captureMessage(message, level, hint);
	}
	function captureEvent(event, hint) {
		return currentScopes.getCurrentScope().captureEvent(event, hint);
	}
	function setContext(name, context) {
		currentScopes.getIsolationScope().setContext(name, context);
	}
	function setExtras(extras) {
		currentScopes.getIsolationScope().setExtras(extras);
	}
	function setExtra(key, extra) {
		currentScopes.getIsolationScope().setExtra(key, extra);
	}
	function setTags(tags) {
		currentScopes.getIsolationScope().setTags(tags);
	}
	function setTag(key, value) {
		currentScopes.getIsolationScope().setTag(key, value);
	}
	function setAttributes(attributes) {
		currentScopes.getIsolationScope().setAttributes(attributes);
	}
	function setAttribute(key, value) {
		currentScopes.getIsolationScope().setAttribute(key, value);
	}
	function setUser(user) {
		currentScopes.getIsolationScope().setUser(user);
	}
	function setConversationId(conversationId) {
		currentScopes.getIsolationScope().setConversationId(conversationId);
	}
	function lastEventId() {
		return currentScopes.getIsolationScope().lastEventId();
	}
	function captureCheckIn(checkIn, upsertMonitorConfig) {
		const scope = currentScopes.getCurrentScope();
		const client = currentScopes.getClient();
		if (!client) debugBuild.DEBUG_BUILD && debugLogger.debug.warn("Cannot capture check-in. No client defined.");
		else if (!client.captureCheckIn) debugBuild.DEBUG_BUILD && debugLogger.debug.warn("Cannot capture check-in. Client does not support sending check-ins.");
		else return client.captureCheckIn(checkIn, upsertMonitorConfig, scope);
		return misc.uuid4();
	}
	function withMonitor(monitorSlug, callback, upsertMonitorConfig) {
		function runCallback() {
			const checkInId = captureCheckIn({
				monitorSlug,
				status: "in_progress"
			}, upsertMonitorConfig);
			const now = time.timestampInSeconds();
			function finishCheckIn(status) {
				captureCheckIn({
					monitorSlug,
					status,
					checkInId,
					duration: time.timestampInSeconds() - now
				});
			}
			let maybePromiseResult;
			try {
				maybePromiseResult = callback();
			} catch (e) {
				finishCheckIn("error");
				throw e;
			}
			if (is.isThenable(maybePromiseResult)) return maybePromiseResult.then((r) => {
				finishCheckIn("ok");
				return r;
			}, (e) => {
				finishCheckIn("error");
				throw e;
			});
			finishCheckIn("ok");
			return maybePromiseResult;
		}
		return currentScopes.withIsolationScope(() => upsertMonitorConfig?.isolateTrace ? trace.startNewTrace(runCallback) : runCallback());
	}
	async function flush(timeout) {
		const client = currentScopes.getClient();
		if (client) return client.flush(timeout);
		debugBuild.DEBUG_BUILD && debugLogger.debug.warn("Cannot flush events. No client defined.");
		return Promise.resolve(false);
	}
	async function close(timeout) {
		const client = currentScopes.getClient();
		if (client) return client.close(timeout);
		debugBuild.DEBUG_BUILD && debugLogger.debug.warn("Cannot flush events and disable SDK. No client defined.");
		return Promise.resolve(false);
	}
	function isInitialized() {
		return !!currentScopes.getClient();
	}
	function isEnabled() {
		const client = currentScopes.getClient();
		return client?.getOptions().enabled !== false && !!client?.getTransport();
	}
	function addEventProcessor(callback) {
		currentScopes.getIsolationScope().addEventProcessor(callback);
	}
	function startSession(context) {
		const isolationScope = currentScopes.getIsolationScope();
		const { user } = scopeData.getCombinedScopeData(isolationScope, currentScopes.getCurrentScope());
		const { userAgent } = worldwide.GLOBAL_OBJ.navigator || {};
		const session$1 = session.makeSession({
			user,
			...userAgent && { userAgent },
			...context
		});
		const currentSession = isolationScope.getSession();
		if (currentSession?.status === "ok") session.updateSession(currentSession, { status: "exited" });
		endSession();
		isolationScope.setSession(session$1);
		return session$1;
	}
	function endSession() {
		const isolationScope = currentScopes.getIsolationScope();
		const session$1 = currentScopes.getCurrentScope().getSession() || isolationScope.getSession();
		if (session$1) session.closeSession(session$1);
		_sendSessionUpdate();
		isolationScope.setSession();
	}
	function _sendSessionUpdate() {
		const isolationScope = currentScopes.getIsolationScope();
		const client = currentScopes.getClient();
		const session = isolationScope.getSession();
		if (session && client) client.captureSession(session);
	}
	function captureSession(end = false) {
		if (end) {
			endSession();
			return;
		}
		_sendSessionUpdate();
	}
	exports.addEventProcessor = addEventProcessor;
	exports.captureCheckIn = captureCheckIn;
	exports.captureEvent = captureEvent;
	exports.captureException = captureException;
	exports.captureMessage = captureMessage;
	exports.captureSession = captureSession;
	exports.close = close;
	exports.endSession = endSession;
	exports.flush = flush;
	exports.isEnabled = isEnabled;
	exports.isInitialized = isInitialized;
	exports.lastEventId = lastEventId;
	exports.setAttribute = setAttribute;
	exports.setAttributes = setAttributes;
	exports.setContext = setContext;
	exports.setConversationId = setConversationId;
	exports.setExtra = setExtra;
	exports.setExtras = setExtras;
	exports.setTag = setTag;
	exports.setTags = setTags;
	exports.setUser = setUser;
	exports.startSession = startSession;
	exports.withMonitor = withMonitor;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/api.js
var require_api = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const dsn = require_dsn();
	const SENTRY_API_VERSION = "7";
	function getBaseApiEndpoint(dsn) {
		const protocol = dsn.protocol ? `${dsn.protocol}:` : "";
		const port = dsn.port ? `:${dsn.port}` : "";
		return `${protocol}//${dsn.host}${port}${dsn.path ? `/${dsn.path}` : ""}/api/`;
	}
	function _getIngestEndpoint(dsn) {
		return `${getBaseApiEndpoint(dsn)}${dsn.projectId}/envelope/`;
	}
	function _encodedAuth(dsn, sdkInfo) {
		const params = { sentry_version: SENTRY_API_VERSION };
		if (dsn.publicKey) params.sentry_key = dsn.publicKey;
		if (sdkInfo) params.sentry_client = `${sdkInfo.name}/${sdkInfo.version}`;
		return new URLSearchParams(params).toString();
	}
	function getEnvelopeEndpointWithUrlEncodedAuth(dsn, tunnel, sdkInfo) {
		return tunnel ? tunnel : `${_getIngestEndpoint(dsn)}?${_encodedAuth(dsn, sdkInfo)}`;
	}
	function getReportDialogEndpoint(dsnLike, dialogOptions) {
		const dsn$1 = dsn.makeDsn(dsnLike);
		if (!dsn$1) return "";
		const endpoint = `${getBaseApiEndpoint(dsn$1)}embed/error-page/`;
		let encodedOptions = `dsn=${dsn.dsnToString(dsn$1)}`;
		for (const key in dialogOptions) {
			if (key === "dsn") continue;
			if (key === "onClose") continue;
			if (key === "user") {
				const user = dialogOptions.user;
				if (!user) continue;
				if (user.name) encodedOptions += `&name=${encodeURIComponent(user.name)}`;
				if (user.email) encodedOptions += `&email=${encodeURIComponent(user.email)}`;
			} else encodedOptions += `&${encodeURIComponent(key)}=${encodeURIComponent(dialogOptions[key])}`;
		}
		return `${endpoint}?${encodedOptions}`;
	}
	exports.SENTRY_API_VERSION = SENTRY_API_VERSION;
	exports.getEnvelopeEndpointWithUrlEncodedAuth = getEnvelopeEndpointWithUrlEncodedAuth;
	exports.getReportDialogEndpoint = getReportDialogEndpoint;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integration.js
var require_integration = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const currentScopes = require_currentScopes();
	const debugBuild = require_debug_build();
	const debugLogger = require_debug_logger();
	const installedIntegrations = [];
	function filterDuplicates(integrations) {
		const integrationsByName = {};
		integrations.forEach((currentInstance) => {
			const { name } = currentInstance;
			const existingInstance = integrationsByName[name];
			if (existingInstance && !existingInstance.isDefaultInstance && currentInstance.isDefaultInstance) return;
			integrationsByName[name] = currentInstance;
		});
		return Object.values(integrationsByName);
	}
	function getIntegrationsToSetup(options) {
		const defaultIntegrations = options.defaultIntegrations || [];
		const userIntegrations = options.integrations;
		defaultIntegrations.forEach((integration) => {
			integration.isDefaultInstance = true;
		});
		let integrations;
		if (Array.isArray(userIntegrations)) integrations = [...defaultIntegrations, ...userIntegrations];
		else if (typeof userIntegrations === "function") {
			const resolvedUserIntegrations = userIntegrations(defaultIntegrations);
			integrations = Array.isArray(resolvedUserIntegrations) ? resolvedUserIntegrations : [resolvedUserIntegrations];
		} else integrations = defaultIntegrations;
		return filterDuplicates(integrations);
	}
	function setupIntegrations(client, integrations) {
		const integrationIndex = {};
		integrations.forEach((integration) => {
			if (integration?.beforeSetup) integration.beforeSetup(client);
		});
		integrations.forEach((integration) => {
			if (integration) setupIntegration(client, integration, integrationIndex);
		});
		return integrationIndex;
	}
	function afterSetupIntegrations(client, integrations) {
		for (const integration of integrations) if (integration?.afterAllSetup) integration.afterAllSetup(client);
	}
	function setupIntegration(client, integration, integrationIndex) {
		if (integrationIndex[integration.name]) {
			debugBuild.DEBUG_BUILD && debugLogger.debug.log(`Integration skipped because it was already installed: ${integration.name}`);
			return;
		}
		integrationIndex[integration.name] = integration;
		if (!installedIntegrations.includes(integration.name) && typeof integration.setupOnce === "function") {
			integration.setupOnce();
			installedIntegrations.push(integration.name);
		}
		if (integration.setup && typeof integration.setup === "function") integration.setup(client);
		if (typeof integration.preprocessEvent === "function") {
			const callback = integration.preprocessEvent.bind(integration);
			client.on("preprocessEvent", (event, hint) => callback(event, hint, client));
		}
		if (typeof integration.processEvent === "function") {
			const callback = integration.processEvent.bind(integration);
			const processor = Object.assign((event, hint) => callback(event, hint, client), { id: integration.name });
			client.addEventProcessor(processor);
		}
		["processSpan", "processSegmentSpan"].forEach((hook) => {
			const callback = integration[hook];
			if (typeof callback === "function") client.on(hook, (span) => callback.call(integration, span, client));
		});
		debugBuild.DEBUG_BUILD && debugLogger.debug.log(`Integration installed: ${integration.name}`);
	}
	function addIntegration(integration) {
		const client = currentScopes.getClient();
		if (!client) {
			debugBuild.DEBUG_BUILD && debugLogger.debug.warn(`Cannot add integration "${integration.name}" because no SDK Client is available.`);
			return;
		}
		client.addIntegration(integration);
	}
	function defineIntegration(fn) {
		return fn;
	}
	exports.addIntegration = addIntegration;
	exports.afterSetupIntegrations = afterSetupIntegrations;
	exports.defineIntegration = defineIntegration;
	exports.getIntegrationsToSetup = getIntegrationsToSetup;
	exports.installedIntegrations = installedIntegrations;
	exports.setupIntegration = setupIntegration;
	exports.setupIntegrations = setupIntegrations;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/timestampSequence.js
var require_timestampSequence = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const SEQUENCE_ATTR_KEY = "sentry.timestamp.sequence";
	let _sequenceNumber = 0;
	let _previousTimestampMs;
	function getSequenceAttribute(timestampInSeconds) {
		const nowMs = Math.floor(timestampInSeconds * 1e3);
		if (_previousTimestampMs !== void 0 && nowMs !== _previousTimestampMs) _sequenceNumber = 0;
		const value = _sequenceNumber;
		_sequenceNumber++;
		_previousTimestampMs = nowMs;
		return {
			key: SEQUENCE_ATTR_KEY,
			value: {
				value,
				type: "integer"
			}
		};
	}
	exports.getSequenceAttribute = getSequenceAttribute;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/trace-info.js
var require_trace_info = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const currentScopes = require_currentScopes();
	const dynamicSamplingContext = require_dynamicSamplingContext();
	const spanUtils = require_spanUtils();
	function _getTraceInfoFromScope(client, scope) {
		if (!scope) return [void 0, void 0];
		return currentScopes.withScope(scope, () => {
			const span = spanUtils.getActiveSpan();
			const traceContext = span ? spanUtils.spanToTraceContext(span) : currentScopes.getTraceContextFromScope(scope);
			return [span ? dynamicSamplingContext.getDynamicSamplingContextFromSpan(span) : dynamicSamplingContext.getDynamicSamplingContextFromScope(client, scope), traceContext];
		});
	}
	exports._getTraceInfoFromScope = _getTraceInfoFromScope;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/logs/constants.js
var require_constants$7 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	exports.SEVERITY_TEXT_TO_SEVERITY_NUMBER = {
		trace: 1,
		debug: 5,
		info: 9,
		warn: 13,
		error: 17,
		fatal: 21
	};
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/env.js
var require_env = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	function isBrowserBundle() {
		return typeof __SENTRY_BROWSER_BUNDLE__ !== "undefined" && !!__SENTRY_BROWSER_BUNDLE__;
	}
	function getSDKSource() {
		/*! __SENTRY_SDK_SOURCE__ */
		return "npm";
	}
	exports.getSDKSource = getSDKSource;
	exports.isBrowserBundle = isBrowserBundle;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/node.js
var require_node = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const env = require_env();
	function isNodeEnv() {
		return !env.isBrowserBundle() && Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) === "[object process]";
	}
	function dynamicRequire(mod, request) {
		return mod.require(request);
	}
	function loadModule(moduleName, existingModule = module) {
		let mod;
		try {
			mod = dynamicRequire(existingModule, moduleName);
		} catch {}
		if (!mod) try {
			const { cwd } = dynamicRequire(existingModule, "process");
			mod = dynamicRequire(existingModule, `${cwd()}/node_modules/${moduleName}`);
		} catch {}
		return mod;
	}
	exports.isNodeEnv = isNodeEnv;
	exports.loadModule = loadModule;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/isBrowser.js
var require_isBrowser = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const node = require_node();
	const worldwide = require_worldwide();
	function isBrowser() {
		return typeof window !== "undefined" && (!node.isNodeEnv() || isElectronNodeRenderer());
	}
	function isElectronNodeRenderer() {
		return worldwide.GLOBAL_OBJ.process?.type === "renderer";
	}
	exports.isBrowser = isBrowser;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/logs/envelope.js
var require_envelope$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const dsn = require_dsn();
	const envelope = require_envelope$4();
	const isBrowser = require_isBrowser();
	function createLogContainerEnvelopeItem(items, inferUserData) {
		const inferSetting = inferUserData ? "auto" : "never";
		return [{
			type: "log",
			item_count: items.length,
			content_type: "application/vnd.sentry.items.log+json"
		}, {
			version: 2,
			...isBrowser.isBrowser() && { ingest_settings: {
				infer_ip: inferSetting,
				infer_user_agent: inferSetting
			} },
			items
		}];
	}
	function createLogEnvelope(logs, metadata, tunnel, dsn$1, inferUserData) {
		const headers = {};
		if (metadata?.sdk) headers.sdk = {
			name: metadata.sdk.name,
			version: metadata.sdk.version
		};
		if (!!tunnel && !!dsn$1) headers.dsn = dsn.dsnToString(dsn$1);
		return envelope.createEnvelope(headers, [createLogContainerEnvelopeItem(logs, inferUserData)]);
	}
	exports.createLogContainerEnvelopeItem = createLogContainerEnvelopeItem;
	exports.createLogEnvelope = createLogEnvelope;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/logs/internal.js
var require_internal$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const attributes = require_attributes$1();
	const carrier = require_carrier();
	const currentScopes = require_currentScopes();
	const debugBuild = require_debug_build();
	const debugLogger = require_debug_logger();
	const is = require_is();
	const scopeData = require_scopeData();
	const spanOnScope = require_spanOnScope();
	const time = require_time();
	const timestampSequence = require_timestampSequence();
	const traceInfo = require_trace_info();
	const constants = require_constants$7();
	const envelope = require_envelope$2();
	const MAX_LOG_BUFFER_SIZE = 100;
	function setLogAttribute(logAttributes, key, value, setEvenIfPresent = true) {
		if (value && (!logAttributes[key] || setEvenIfPresent)) logAttributes[key] = value;
	}
	function _INTERNAL_captureSerializedLog(client, serializedLog) {
		const bufferMap = _getBufferMap();
		const logBuffer = _INTERNAL_getLogBuffer(client);
		if (logBuffer === void 0) bufferMap.set(client, [serializedLog]);
		else if (logBuffer.length >= MAX_LOG_BUFFER_SIZE) {
			_INTERNAL_flushLogsBuffer(client, logBuffer);
			bufferMap.set(client, [serializedLog]);
		} else bufferMap.set(client, [...logBuffer, serializedLog]);
	}
	function _INTERNAL_captureLog(beforeLog, currentScope = currentScopes.getCurrentScope(), captureSerializedLog = _INTERNAL_captureSerializedLog) {
		const client = currentScope?.getClient() ?? currentScopes.getClient();
		if (!client) {
			debugBuild.DEBUG_BUILD && debugLogger.debug.warn("No client available to capture log.");
			return;
		}
		const { release, environment, enableLogs = false, beforeSendLog } = client.getOptions();
		if (!enableLogs) {
			debugBuild.DEBUG_BUILD && debugLogger.debug.warn("logging option not enabled, log will not be captured.");
			return;
		}
		const [, traceContext] = traceInfo._getTraceInfoFromScope(client, currentScope);
		const processedLogAttributes = { ...beforeLog.attributes };
		const { user: { id, email, username }, attributes: scopeAttributes = {} } = scopeData.getCombinedScopeData(currentScopes.getIsolationScope(), currentScope);
		setLogAttribute(processedLogAttributes, "user.id", id, false);
		setLogAttribute(processedLogAttributes, "user.email", email, false);
		setLogAttribute(processedLogAttributes, "user.name", username, false);
		setLogAttribute(processedLogAttributes, "sentry.release", release);
		setLogAttribute(processedLogAttributes, "sentry.environment", environment);
		const { name, version } = client.getSdkMetadata()?.sdk ?? {};
		setLogAttribute(processedLogAttributes, "sentry.sdk.name", name);
		setLogAttribute(processedLogAttributes, "sentry.sdk.version", version);
		const replay = client.getIntegrationByName("Replay");
		const replayId = replay?.getReplayId(true);
		setLogAttribute(processedLogAttributes, "sentry.replay_id", replayId);
		if (replayId && replay?.getRecordingMode() === "buffer") setLogAttribute(processedLogAttributes, "sentry._internal.replay_is_buffering", true);
		const beforeLogMessage = beforeLog.message;
		if (is.isParameterizedString(beforeLogMessage)) {
			const { __sentry_template_string__, __sentry_template_values__ = [] } = beforeLogMessage;
			if (__sentry_template_values__?.length) processedLogAttributes["sentry.message.template"] = __sentry_template_string__;
			__sentry_template_values__.forEach((param, index) => {
				processedLogAttributes[`sentry.message.parameter.${index}`] = param;
			});
		}
		setLogAttribute(processedLogAttributes, "sentry.trace.parent_span_id", spanOnScope._getSpanForScope(currentScope)?.spanContext().spanId);
		const processedLog = {
			...beforeLog,
			attributes: processedLogAttributes
		};
		client.emit("beforeCaptureLog", processedLog);
		const log = beforeSendLog ? debugLogger.consoleSandbox(() => beforeSendLog(processedLog)) : processedLog;
		if (!log) {
			client.recordDroppedEvent("before_send", "log_item", 1);
			debugBuild.DEBUG_BUILD && debugLogger.debug.warn("beforeSendLog returned null, log will not be captured.");
			return;
		}
		const { level, message, attributes: logAttributes = {}, severityNumber } = log;
		const timestamp = time.timestampInSeconds();
		const sequenceAttr = timestampSequence.getSequenceAttribute(timestamp);
		captureSerializedLog(client, {
			timestamp,
			level,
			body: _removeLoneSurrogates(String(message)),
			trace_id: traceContext?.trace_id,
			severity_number: severityNumber ?? constants.SEVERITY_TEXT_TO_SEVERITY_NUMBER[level],
			attributes: sanitizeLogAttributes({
				...attributes.serializeAttributes(scopeAttributes),
				...attributes.serializeAttributes(logAttributes, true),
				[sequenceAttr.key]: sequenceAttr.value
			})
		});
		client.emit("afterCaptureLog", log);
	}
	function _INTERNAL_flushLogsBuffer(client, maybeLogBuffer) {
		const logBuffer = maybeLogBuffer ?? _INTERNAL_getLogBuffer(client) ?? [];
		if (logBuffer.length === 0) return;
		const clientOptions = client.getOptions();
		const envelope$1 = envelope.createLogEnvelope(logBuffer, clientOptions._metadata, clientOptions.tunnel, client.getDsn(), client.getDataCollectionOptions().userInfo);
		_getBufferMap().set(client, []);
		client.emit("flushLogs");
		client.sendEnvelope(envelope$1);
	}
	function _INTERNAL_getLogBuffer(client) {
		return _getBufferMap().get(client);
	}
	function _getBufferMap() {
		return carrier.getGlobalSingleton("clientToLogBufferMap", () => /* @__PURE__ */ new WeakMap());
	}
	function sanitizeLogAttributes(attributes) {
		const sanitized = {};
		for (const [key, attr] of Object.entries(attributes)) {
			const sanitizedKey = _removeLoneSurrogates(key);
			if (attr.type === "string") sanitized[sanitizedKey] = {
				...attr,
				value: _removeLoneSurrogates(attr.value)
			};
			else sanitized[sanitizedKey] = attr;
		}
		return sanitized;
	}
	function _removeLoneSurrogates(str) {
		const strObj = Object(str);
		const isWellFormed = strObj["isWellFormed"];
		const toWellFormed = strObj["toWellFormed"];
		if (typeof isWellFormed === "function" && typeof toWellFormed === "function") return isWellFormed.call(str) ? str : toWellFormed.call(str);
		return str;
	}
	exports._INTERNAL_captureLog = _INTERNAL_captureLog;
	exports._INTERNAL_captureSerializedLog = _INTERNAL_captureSerializedLog;
	exports._INTERNAL_flushLogsBuffer = _INTERNAL_flushLogsBuffer;
	exports._INTERNAL_getLogBuffer = _INTERNAL_getLogBuffer;
	exports._removeLoneSurrogates = _removeLoneSurrogates;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/metrics/envelope.js
var require_envelope$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const dsn = require_dsn();
	const envelope = require_envelope$4();
	const isBrowser = require_isBrowser();
	function createMetricContainerEnvelopeItem(items, inferUserData) {
		const inferSetting = inferUserData ? "auto" : "never";
		return [{
			type: "trace_metric",
			item_count: items.length,
			content_type: "application/vnd.sentry.items.trace-metric+json"
		}, {
			version: 2,
			...isBrowser.isBrowser() && { ingest_settings: {
				infer_ip: inferSetting,
				infer_user_agent: inferSetting
			} },
			items
		}];
	}
	function createMetricEnvelope(metrics, metadata, tunnel, dsn$1, inferUserData) {
		const headers = {};
		if (metadata?.sdk) headers.sdk = {
			name: metadata.sdk.name,
			version: metadata.sdk.version
		};
		if (!!tunnel && !!dsn$1) headers.dsn = dsn.dsnToString(dsn$1);
		return envelope.createEnvelope(headers, [createMetricContainerEnvelopeItem(metrics, inferUserData)]);
	}
	exports.createMetricContainerEnvelopeItem = createMetricContainerEnvelopeItem;
	exports.createMetricEnvelope = createMetricEnvelope;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/metrics/internal.js
var require_internal = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const attributes = require_attributes$1();
	const carrier = require_carrier();
	const currentScopes = require_currentScopes();
	const debugBuild = require_debug_build();
	const debugLogger = require_debug_logger();
	const scopeData = require_scopeData();
	const spanOnScope = require_spanOnScope();
	const time = require_time();
	const timestampSequence = require_timestampSequence();
	const traceInfo = require_trace_info();
	const envelope = require_envelope$1();
	const MAX_METRIC_BUFFER_SIZE = 1e3;
	function setMetricAttribute(metricAttributes, key, value, setEvenIfPresent = true) {
		if (value && (setEvenIfPresent || !(key in metricAttributes))) metricAttributes[key] = value;
	}
	function _INTERNAL_captureSerializedMetric(client, serializedMetric) {
		const bufferMap = _getBufferMap();
		const metricBuffer = _INTERNAL_getMetricBuffer(client);
		if (metricBuffer === void 0) bufferMap.set(client, [serializedMetric]);
		else if (metricBuffer.length >= MAX_METRIC_BUFFER_SIZE) {
			_INTERNAL_flushMetricsBuffer(client, metricBuffer);
			bufferMap.set(client, [serializedMetric]);
		} else bufferMap.set(client, [...metricBuffer, serializedMetric]);
	}
	function _enrichMetricAttributes(beforeMetric, client, user) {
		const { release, environment } = client.getOptions();
		const processedMetricAttributes = { ...beforeMetric.attributes };
		setMetricAttribute(processedMetricAttributes, "user.id", user.id, false);
		setMetricAttribute(processedMetricAttributes, "user.email", user.email, false);
		setMetricAttribute(processedMetricAttributes, "user.name", user.username, false);
		setMetricAttribute(processedMetricAttributes, "sentry.release", release);
		setMetricAttribute(processedMetricAttributes, "sentry.environment", environment);
		const { name, version } = client.getSdkMetadata()?.sdk ?? {};
		setMetricAttribute(processedMetricAttributes, "sentry.sdk.name", name);
		setMetricAttribute(processedMetricAttributes, "sentry.sdk.version", version);
		const replay = client.getIntegrationByName("Replay");
		const replayId = replay?.getReplayId(true);
		setMetricAttribute(processedMetricAttributes, "sentry.replay_id", replayId);
		if (replayId && replay?.getRecordingMode() === "buffer") setMetricAttribute(processedMetricAttributes, "sentry._internal.replay_is_buffering", true);
		return {
			...beforeMetric,
			attributes: processedMetricAttributes
		};
	}
	function _buildSerializedMetric(metric, client, currentScope, scopeAttributes) {
		const [, traceContext] = traceInfo._getTraceInfoFromScope(client, currentScope);
		const span = spanOnScope._getSpanForScope(currentScope);
		const traceId = span ? span.spanContext().traceId : traceContext?.trace_id;
		const spanId = span ? span.spanContext().spanId : void 0;
		const timestamp = time.timestampInSeconds();
		const sequenceAttr = timestampSequence.getSequenceAttribute(timestamp);
		return {
			timestamp,
			trace_id: traceId ?? "",
			span_id: spanId,
			name: metric.name,
			type: metric.type,
			unit: metric.unit,
			value: metric.value,
			attributes: {
				...attributes.serializeAttributes(scopeAttributes),
				...attributes.serializeAttributes(metric.attributes, "skip-undefined"),
				[sequenceAttr.key]: sequenceAttr.value
			}
		};
	}
	function _INTERNAL_captureMetric(beforeMetric, options) {
		const currentScope = options?.scope ?? currentScopes.getCurrentScope();
		const captureSerializedMetric = options?.captureSerializedMetric ?? _INTERNAL_captureSerializedMetric;
		const client = currentScope?.getClient() ?? currentScopes.getClient();
		if (!client) {
			debugBuild.DEBUG_BUILD && debugLogger.debug.warn("No client available to capture metric.");
			return;
		}
		const { _experiments, enableMetrics, beforeSendMetric } = client.getOptions();
		if (!(enableMetrics ?? _experiments?.enableMetrics ?? true)) {
			debugBuild.DEBUG_BUILD && debugLogger.debug.warn("metrics option not enabled, metric will not be captured.");
			return;
		}
		const { user, attributes: scopeAttributes } = scopeData.getCombinedScopeData(currentScopes.getIsolationScope(), currentScope);
		const enrichedMetric = _enrichMetricAttributes(beforeMetric, client, user);
		client.emit("processMetric", enrichedMetric);
		const beforeSendCallback = beforeSendMetric || _experiments?.beforeSendMetric;
		const processedMetric = beforeSendCallback ? beforeSendCallback(enrichedMetric) : enrichedMetric;
		if (!processedMetric) {
			debugBuild.DEBUG_BUILD && debugLogger.debug.log("`beforeSendMetric` returned `null`, will not send metric.");
			return;
		}
		const serializedMetric = _buildSerializedMetric(processedMetric, client, currentScope, scopeAttributes);
		debugBuild.DEBUG_BUILD && debugLogger.debug.log("[Metric]", serializedMetric);
		captureSerializedMetric(client, serializedMetric);
		client.emit("afterCaptureMetric", processedMetric);
	}
	function _INTERNAL_flushMetricsBuffer(client, maybeMetricBuffer) {
		const metricBuffer = maybeMetricBuffer ?? _INTERNAL_getMetricBuffer(client) ?? [];
		if (metricBuffer.length === 0) return;
		const clientOptions = client.getOptions();
		const envelope$1 = envelope.createMetricEnvelope(metricBuffer, clientOptions._metadata, clientOptions.tunnel, client.getDsn(), client.getDataCollectionOptions().userInfo);
		_getBufferMap().set(client, []);
		client.emit("flushMetrics");
		client.sendEnvelope(envelope$1);
	}
	function _INTERNAL_getMetricBuffer(client) {
		return _getBufferMap().get(client);
	}
	function _getBufferMap() {
		return carrier.getGlobalSingleton("clientToMetricBufferMap", () => /* @__PURE__ */ new WeakMap());
	}
	exports._INTERNAL_captureMetric = _INTERNAL_captureMetric;
	exports._INTERNAL_captureSerializedMetric = _INTERNAL_captureSerializedMetric;
	exports._INTERNAL_flushMetricsBuffer = _INTERNAL_flushMetricsBuffer;
	exports._INTERNAL_getMetricBuffer = _INTERNAL_getMetricBuffer;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/spans/spanJsonToStreamedSpan.js
var require_spanJsonToStreamedSpan = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const spanUtils = require_spanUtils();
	function spanJsonToSerializedStreamedSpan(span) {
		const streamedSpan = {
			trace_id: span.trace_id,
			span_id: span.span_id,
			parent_span_id: span.parent_span_id,
			name: span.description || "",
			start_timestamp: span.start_timestamp,
			end_timestamp: span.timestamp || span.start_timestamp,
			status: !span.status || span.status === "ok" || span.status === "cancelled" ? "ok" : "error",
			is_segment: false,
			attributes: { ...span.data },
			links: span.links
		};
		return spanUtils.streamedSpanJsonToSerializedSpan(streamedSpan);
	}
	exports.spanJsonToSerializedStreamedSpan = spanJsonToSerializedStreamedSpan;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/spans/extractGenAiSpans.js
var require_extractGenAiSpans = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const isBrowser = require_isBrowser();
	const hasSpanStreamingEnabled = require_hasSpanStreamingEnabled();
	const spanJsonToStreamedSpan = require_spanJsonToStreamedSpan();
	function extractGenAiSpansFromEvent(event, client) {
		if (event.type !== "transaction" || !event.spans?.length || !event.sdkProcessingMetadata?.hasGenAiSpans || client.getOptions().streamGenAiSpans === false || hasSpanStreamingEnabled.hasSpanStreamingEnabled(client)) return;
		const genAiSpans = [];
		const remainingSpans = [];
		for (const span of event.spans) if (span.op?.startsWith("gen_ai.")) genAiSpans.push(spanJsonToStreamedSpan.spanJsonToSerializedStreamedSpan(span));
		else remainingSpans.push(span);
		if (genAiSpans.length === 0) return;
		event.spans = remainingSpans;
		const inferSetting = client.getDataCollectionOptions().userInfo ? "auto" : "never";
		return [{
			type: "span",
			item_count: genAiSpans.length,
			content_type: "application/vnd.sentry.items.span.v2+json"
		}, {
			version: 2,
			...isBrowser.isBrowser() && { ingest_settings: {
				infer_ip: inferSetting,
				infer_user_agent: inferSetting
			} },
			items: genAiSpans
		}];
	}
	exports.extractGenAiSpansFromEvent = extractGenAiSpansFromEvent;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/timer.js
var require_timer = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	function safeUnref(timer) {
		if (typeof timer === "object" && typeof timer.unref === "function") timer.unref();
		return timer;
	}
	exports.safeUnref = safeUnref;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/promisebuffer.js
var require_promisebuffer = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const syncpromise = require_syncpromise();
	const timer = require_timer();
	const SENTRY_BUFFER_FULL_ERROR = /* @__PURE__ */ Symbol.for("SentryBufferFullError");
	function makePromiseBuffer(limit = 100) {
		const buffer = /* @__PURE__ */ new Set();
		function isReady() {
			return buffer.size < limit;
		}
		function remove(task) {
			buffer.delete(task);
		}
		function add(taskProducer) {
			if (!isReady()) return syncpromise.rejectedSyncPromise(SENTRY_BUFFER_FULL_ERROR);
			const task = taskProducer();
			buffer.add(task);
			task.then(() => remove(task), () => remove(task));
			return task;
		}
		function drain(timeout) {
			if (!buffer.size) return syncpromise.resolvedSyncPromise(true);
			const drainPromise = Promise.allSettled(Array.from(buffer)).then(() => true);
			if (!timeout) return drainPromise;
			const promises = [drainPromise, new Promise((resolve) => timer.safeUnref(setTimeout(() => resolve(false), timeout)))];
			return Promise.race(promises);
		}
		return {
			get $() {
				return Array.from(buffer);
			},
			add,
			drain
		};
	}
	exports.SENTRY_BUFFER_FULL_ERROR = SENTRY_BUFFER_FULL_ERROR;
	exports.makePromiseBuffer = makePromiseBuffer;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/ratelimit.js
var require_ratelimit = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const randomSafeContext = require_randomSafeContext();
	const DEFAULT_RETRY_AFTER = 60 * 1e3;
	function parseRetryAfterHeader(header, now = randomSafeContext.safeDateNow()) {
		const headerDelay = parseInt(`${header}`, 10);
		if (!isNaN(headerDelay)) return headerDelay * 1e3;
		const headerDate = Date.parse(`${header}`);
		if (!isNaN(headerDate)) return headerDate - now;
		return DEFAULT_RETRY_AFTER;
	}
	function disabledUntil(limits, dataCategory) {
		return limits[dataCategory] || limits.all || 0;
	}
	function isRateLimited(limits, dataCategory, now = randomSafeContext.safeDateNow()) {
		return disabledUntil(limits, dataCategory) > now;
	}
	function updateRateLimits(limits, { statusCode, headers }, now = randomSafeContext.safeDateNow()) {
		const updatedRateLimits = { ...limits };
		const rateLimitHeader = headers?.["x-sentry-rate-limits"];
		const retryAfterHeader = headers?.["retry-after"];
		if (rateLimitHeader) for (const limit of rateLimitHeader.trim().split(",")) {
			const [retryAfter, categories, , , namespaces] = limit.split(":", 5);
			const headerDelay = parseInt(retryAfter, 10);
			const delay = (!isNaN(headerDelay) ? headerDelay : 60) * 1e3;
			if (!categories) updatedRateLimits.all = now + delay;
			else for (const category of categories.split(";")) if (category === "metric_bucket") {
				if (!namespaces || namespaces.split(";").includes("custom")) updatedRateLimits[category] = now + delay;
			} else updatedRateLimits[category] = now + delay;
		}
		else if (retryAfterHeader) updatedRateLimits.all = now + parseRetryAfterHeader(retryAfterHeader, now);
		else if (statusCode === 429) updatedRateLimits.all = now + 60 * 1e3;
		return updatedRateLimits;
	}
	exports.DEFAULT_RETRY_AFTER = DEFAULT_RETRY_AFTER;
	exports.disabledUntil = disabledUntil;
	exports.isRateLimited = isRateLimited;
	exports.parseRetryAfterHeader = parseRetryAfterHeader;
	exports.updateRateLimits = updateRateLimits;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/transports/base.js
var require_base = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const debugBuild = require_debug_build();
	const debugLogger = require_debug_logger();
	const envelope = require_envelope$4();
	const promisebuffer = require_promisebuffer();
	const ratelimit = require_ratelimit();
	const DEFAULT_TRANSPORT_BUFFER_SIZE = 64;
	function createTransport(options, makeRequest, buffer = promisebuffer.makePromiseBuffer(options.bufferSize || DEFAULT_TRANSPORT_BUFFER_SIZE)) {
		let rateLimits = {};
		const flush = (timeout) => buffer.drain(timeout);
		function send(envelope$1) {
			const filteredEnvelopeItems = [];
			envelope.forEachEnvelopeItem(envelope$1, (item, type) => {
				const dataCategory = envelope.envelopeItemTypeToDataCategory(type);
				if (ratelimit.isRateLimited(rateLimits, dataCategory)) options.recordDroppedEvent("ratelimit_backoff", dataCategory);
				else filteredEnvelopeItems.push(item);
			});
			if (filteredEnvelopeItems.length === 0) return Promise.resolve({});
			const filteredEnvelope = envelope.createEnvelope(envelope$1[0], filteredEnvelopeItems);
			const recordEnvelopeLoss = (reason) => {
				if (envelope.envelopeContainsItemType(filteredEnvelope, ["client_report"])) {
					debugBuild.DEBUG_BUILD && debugLogger.debug.warn(`Dropping client report. Will not send outcomes (reason: ${reason}).`);
					return;
				}
				envelope.forEachEnvelopeItem(filteredEnvelope, (item, type) => {
					options.recordDroppedEvent(reason, envelope.envelopeItemTypeToDataCategory(type));
				});
			};
			const requestTask = () => makeRequest({ body: envelope.serializeEnvelope(filteredEnvelope) }).then((response) => {
				if (response.statusCode === 413) {
					debugBuild.DEBUG_BUILD && debugLogger.debug.error("Sentry responded with status code 413. Envelope was discarded due to exceeding size limits.");
					recordEnvelopeLoss("send_error");
					return response;
				}
				if (debugBuild.DEBUG_BUILD && response.statusCode !== void 0 && (response.statusCode < 200 || response.statusCode >= 300)) debugLogger.debug.warn(`Sentry responded with status code ${response.statusCode} to sent event.`);
				rateLimits = ratelimit.updateRateLimits(rateLimits, response);
				return response;
			}, (error) => {
				recordEnvelopeLoss("network_error");
				debugBuild.DEBUG_BUILD && debugLogger.debug.error("Encountered error running transport request:", error);
				throw error;
			});
			return buffer.add(requestTask).then((result) => result, (error) => {
				if (error === promisebuffer.SENTRY_BUFFER_FULL_ERROR) {
					debugBuild.DEBUG_BUILD && debugLogger.debug.error("Skipped sending event because buffer is full.");
					recordEnvelopeLoss("queue_overflow");
					return Promise.resolve({});
				} else throw error;
			});
		}
		return {
			send,
			flush
		};
	}
	exports.DEFAULT_TRANSPORT_BUFFER_SIZE = DEFAULT_TRANSPORT_BUFFER_SIZE;
	exports.createTransport = createTransport;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/clientreport.js
var require_clientreport = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const envelope = require_envelope$4();
	const time = require_time();
	function createClientReportEnvelope(discarded_events, dsn, timestamp) {
		const clientReportItem = [{ type: "client_report" }, {
			timestamp: timestamp || time.dateTimestampInSeconds(),
			discarded_events
		}];
		return envelope.createEnvelope(dsn ? { dsn } : {}, [clientReportItem]);
	}
	exports.createClientReportEnvelope = createClientReportEnvelope;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/eventUtils.js
var require_eventUtils = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	function getPossibleEventMessages(event) {
		const possibleMessages = [];
		if (event.message) possibleMessages.push(event.message);
		try {
			const lastException = event.exception.values[event.exception.values.length - 1];
			if (lastException?.value) {
				possibleMessages.push(lastException.value);
				if (lastException.type) possibleMessages.push(`${lastException.type}: ${lastException.value}`);
			}
		} catch {}
		return possibleMessages;
	}
	exports.getPossibleEventMessages = getPossibleEventMessages;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/transactionEvent.js
var require_transactionEvent = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const semanticAttributes = require_semanticAttributes();
	function convertTransactionEventToSpanJson(event) {
		const { trace_id, parent_span_id, span_id, status, origin, data, op } = event.contexts?.trace ?? {};
		return {
			data: data ?? {},
			description: event.transaction,
			op,
			parent_span_id,
			span_id: span_id ?? "",
			start_timestamp: event.start_timestamp ?? 0,
			status,
			timestamp: event.timestamp,
			trace_id: trace_id ?? "",
			origin,
			profile_id: data?.[semanticAttributes.SEMANTIC_ATTRIBUTE_PROFILE_ID],
			exclusive_time: data?.[semanticAttributes.SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME],
			measurements: event.measurements,
			is_segment: true
		};
	}
	function convertSpanJsonToTransactionEvent(span) {
		return {
			type: "transaction",
			timestamp: span.timestamp,
			start_timestamp: span.start_timestamp,
			transaction: span.description,
			contexts: { trace: {
				trace_id: span.trace_id,
				span_id: span.span_id,
				parent_span_id: span.parent_span_id,
				op: span.op,
				status: span.status,
				origin: span.origin,
				data: {
					...span.data,
					...span.profile_id && { [semanticAttributes.SEMANTIC_ATTRIBUTE_PROFILE_ID]: span.profile_id },
					...span.exclusive_time && { [semanticAttributes.SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME]: span.exclusive_time }
				}
			} },
			measurements: span.measurements
		};
	}
	exports.convertSpanJsonToTransactionEvent = convertSpanJsonToTransactionEvent;
	exports.convertTransactionEventToSpanJson = convertTransactionEventToSpanJson;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/data-collection/filtering-snippets.js
var require_filtering_snippets = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const FILTERED_VALUE = "[Filtered]";
	const PII_HEADER_SNIPPETS = [
		"forwarded",
		"-ip",
		"remote-",
		"via",
		"-user"
	];
	const SENSITIVE_KEY_SNIPPETS = [
		"auth",
		"token",
		"secret",
		"session",
		"password",
		"passwd",
		"pwd",
		"key",
		"jwt",
		"bearer",
		"sso",
		"saml",
		"csrf",
		"xsrf",
		"credentials",
		"sid",
		"identity",
		"set-cookie",
		"cookie"
	];
	const SENSITIVE_COOKIE_NAME_SNIPPETS = [
		".sid",
		"sessid",
		"remember",
		"oidc",
		"pkce",
		"nonce",
		"__secure-",
		"__host-",
		"awsalb",
		"awselb",
		"akamai",
		"__stripe",
		"cognito",
		"firebase",
		"supabase",
		"sb-",
		"mfa",
		"2fa"
	];
	exports.FILTERED_VALUE = FILTERED_VALUE;
	exports.PII_HEADER_SNIPPETS = PII_HEADER_SNIPPETS;
	exports.SENSITIVE_COOKIE_NAME_SNIPPETS = SENSITIVE_COOKIE_NAME_SNIPPETS;
	exports.SENSITIVE_KEY_SNIPPETS = SENSITIVE_KEY_SNIPPETS;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/data-collection/defaultPiiToCollectionOptions.js
var require_defaultPiiToCollectionOptions = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const filteringSnippets = require_filtering_snippets();
	function defaultPiiToCollectionOptions(sendDefaultPii) {
		return sendDefaultPii === true ? {
			userInfo: true,
			cookies: true,
			httpHeaders: {
				request: true,
				response: true
			},
			httpBodies: [
				"incomingRequest",
				"outgoingRequest",
				"incomingResponse",
				"outgoingResponse"
			],
			queryParams: true,
			genAI: {
				inputs: true,
				outputs: true
			},
			stackFrameVariables: true,
			frameContextLines: 7
		} : {
			userInfo: false,
			cookies: { deny: filteringSnippets.PII_HEADER_SNIPPETS },
			httpHeaders: {
				request: { deny: filteringSnippets.PII_HEADER_SNIPPETS },
				response: { deny: filteringSnippets.PII_HEADER_SNIPPETS }
			},
			httpBodies: [],
			queryParams: { deny: filteringSnippets.PII_HEADER_SNIPPETS },
			genAI: {
				inputs: false,
				outputs: false
			},
			stackFrameVariables: true,
			frameContextLines: 7
		};
	}
	exports.defaultPiiToCollectionOptions = defaultPiiToCollectionOptions;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/data-collection/resolveDataCollectionOptions.js
var require_resolveDataCollectionOptions = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const defaultPiiToCollectionOptions = require_defaultPiiToCollectionOptions();
	const DEFAULTS = {
		userInfo: true,
		cookies: true,
		httpHeaders: {
			request: true,
			response: true
		},
		httpBodies: [
			"incomingRequest",
			"outgoingRequest",
			"incomingResponse",
			"outgoingResponse"
		],
		queryParams: true,
		genAI: {
			inputs: true,
			outputs: true
		},
		stackFrameVariables: true,
		frameContextLines: 5
	};
	function resolveDataCollectionOptions(options) {
		const base = options.dataCollection != null ? DEFAULTS : defaultPiiToCollectionOptions.defaultPiiToCollectionOptions(options.sendDefaultPii);
		const dc = options.dataCollection ?? {};
		return {
			userInfo: dc.userInfo ?? base.userInfo,
			cookies: dc.cookies ?? base.cookies,
			httpHeaders: {
				request: dc.httpHeaders?.request ?? base.httpHeaders.request,
				response: dc.httpHeaders?.response ?? base.httpHeaders.response
			},
			httpBodies: dc.httpBodies ?? base.httpBodies,
			queryParams: dc.queryParams ?? base.queryParams,
			genAI: {
				inputs: dc.genAI?.inputs ?? base.genAI.inputs,
				outputs: dc.genAI?.outputs ?? base.genAI.outputs
			},
			stackFrameVariables: dc.stackFrameVariables ?? base.stackFrameVariables,
			frameContextLines: dc.frameContextLines ?? base.frameContextLines
		};
	}
	exports.resolveDataCollectionOptions = resolveDataCollectionOptions;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/client.js
var require_client = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const api = require_api();
	const constants = require_constants$8();
	const currentScopes = require_currentScopes();
	const debugBuild = require_debug_build();
	const envelope = require_envelope$3();
	const integration = require_integration();
	const internal = require_internal$1();
	const internal$1 = require_internal();
	const session = require_session();
	const dynamicSamplingContext = require_dynamicSamplingContext();
	const beforeSendSpan = require_beforeSendSpan();
	const extractGenAiSpans = require_extractGenAiSpans();
	const base = require_base();
	const clientreport = require_clientreport();
	const debugLogger = require_debug_logger();
	const dsn = require_dsn();
	const envelope$1 = require_envelope$4();
	const eventUtils = require_eventUtils();
	const is = require_is();
	const merge = require_merge();
	const misc = require_misc();
	const parseSampleRate = require_parseSampleRate();
	const prepareEvent = require_prepareEvent();
	const promisebuffer = require_promisebuffer();
	const randomSafeContext = require_randomSafeContext();
	const shouldIgnoreSpan = require_should_ignore_span();
	const spanUtils = require_spanUtils();
	const syncpromise = require_syncpromise();
	const timer = require_timer();
	const transactionEvent = require_transactionEvent();
	const resolveDataCollectionOptions = require_resolveDataCollectionOptions();
	const ALREADY_SEEN_ERROR = "Not capturing exception because it's already been captured.";
	const MISSING_RELEASE_FOR_SESSION_ERROR = "Discarded session because of missing or non-string release";
	const INTERNAL_ERROR_SYMBOL = /* @__PURE__ */ Symbol.for("SentryInternalError");
	const DO_NOT_SEND_EVENT_SYMBOL = /* @__PURE__ */ Symbol.for("SentryDoNotSendEventError");
	const DEFAULT_FLUSH_INTERVAL = 5e3;
	function _makeInternalError(message) {
		return {
			message,
			[INTERNAL_ERROR_SYMBOL]: true
		};
	}
	function _makeDoNotSendEventError(message) {
		return {
			message,
			[DO_NOT_SEND_EVENT_SYMBOL]: true
		};
	}
	function _isInternalError(error) {
		return !!error && typeof error === "object" && INTERNAL_ERROR_SYMBOL in error;
	}
	function _isDoNotSendEventError(error) {
		return !!error && typeof error === "object" && DO_NOT_SEND_EVENT_SYMBOL in error;
	}
	function setupWeightBasedFlushing(client, afterCaptureHook, flushHook, estimateSizeFn, flushFn) {
		let weight = 0;
		let flushTimeout;
		let isTimerActive = false;
		client.on(flushHook, () => {
			weight = 0;
			clearTimeout(flushTimeout);
			isTimerActive = false;
		});
		client.on(afterCaptureHook, (item) => {
			weight += estimateSizeFn(item);
			if (weight >= 8e5) flushFn(client);
			else if (!isTimerActive) {
				const flushInterval = client.getOptions()._flushInterval ?? DEFAULT_FLUSH_INTERVAL;
				if (flushInterval > 0) {
					isTimerActive = true;
					flushTimeout = timer.safeUnref(setTimeout(() => {
						flushFn(client);
					}, flushInterval));
				}
			}
		});
		client.on("flush", () => {
			flushFn(client);
		});
	}
	var Client = class {
		/**
		* Initializes this client instance.
		*
		* @param options Options for the client.
		*/
		constructor(options) {
			this._options = options;
			this._integrations = {};
			this._numProcessing = 0;
			this._outcomes = {};
			this._hooks = {};
			this._eventProcessors = [];
			this._promiseBuffer = promisebuffer.makePromiseBuffer(options.transportOptions?.bufferSize ?? base.DEFAULT_TRANSPORT_BUFFER_SIZE);
			this._dataCollection = resolveDataCollectionOptions.resolveDataCollectionOptions(options);
			if (options.dsn) this._dsn = dsn.makeDsn(options.dsn);
			else debugBuild.DEBUG_BUILD && debugLogger.debug.warn("No DSN provided, client will not send events.");
			if (this._dsn) {
				const url = api.getEnvelopeEndpointWithUrlEncodedAuth(this._dsn, options.tunnel, options._metadata ? options._metadata.sdk : void 0);
				this._transport = options.transport({
					tunnel: this._options.tunnel,
					recordDroppedEvent: this.recordDroppedEvent.bind(this),
					...options.transportOptions,
					url
				});
			}
			this._options.enableLogs = this._options.enableLogs ?? this._options._experiments?.enableLogs;
			if (this._options.enableLogs) setupWeightBasedFlushing(this, "afterCaptureLog", "flushLogs", estimateLogSizeInBytes, internal._INTERNAL_flushLogsBuffer);
			if (this._options.enableMetrics ?? this._options._experiments?.enableMetrics ?? true) setupWeightBasedFlushing(this, "afterCaptureMetric", "flushMetrics", estimateMetricSizeInBytes, internal$1._INTERNAL_flushMetricsBuffer);
		}
		/**
		* Captures an exception event and sends it to Sentry.
		*
		* Unlike `captureException` exported from every SDK, this method requires that you pass it the current scope.
		*/
		captureException(exception, hint, scope) {
			const eventId = misc.uuid4();
			if (misc.checkOrSetAlreadyCaught(exception)) {
				debugBuild.DEBUG_BUILD && debugLogger.debug.log(ALREADY_SEEN_ERROR);
				return eventId;
			}
			const hintWithEventId = {
				event_id: eventId,
				...hint
			};
			this._process(() => this.eventFromException(exception, hintWithEventId).then((event) => this._captureEvent(event, hintWithEventId, scope)).then((res) => res), "error");
			return hintWithEventId.event_id;
		}
		/**
		* Captures a message event and sends it to Sentry.
		*
		* Unlike `captureMessage` exported from every SDK, this method requires that you pass it the current scope.
		*/
		captureMessage(message, level, hint, currentScope) {
			const hintWithEventId = {
				event_id: misc.uuid4(),
				...hint
			};
			const eventMessage = is.isParameterizedString(message) ? message : String(message);
			const isMessage = is.isPrimitive(message);
			const promisedEvent = isMessage ? this.eventFromMessage(eventMessage, level, hintWithEventId) : this.eventFromException(message, hintWithEventId);
			this._process(() => promisedEvent.then((event) => this._captureEvent(event, hintWithEventId, currentScope)), isMessage ? "unknown" : "error");
			return hintWithEventId.event_id;
		}
		/**
		* Captures a manually created event and sends it to Sentry.
		*
		* Unlike `captureEvent` exported from every SDK, this method requires that you pass it the current scope.
		*/
		captureEvent(event, hint, currentScope) {
			const eventId = misc.uuid4();
			if (hint?.originalException && misc.checkOrSetAlreadyCaught(hint.originalException)) {
				debugBuild.DEBUG_BUILD && debugLogger.debug.log(ALREADY_SEEN_ERROR);
				return eventId;
			}
			const hintWithEventId = {
				event_id: eventId,
				...hint
			};
			const sdkProcessingMetadata = event.sdkProcessingMetadata || {};
			const capturedSpanScope = sdkProcessingMetadata.capturedSpanScope;
			const capturedSpanIsolationScope = sdkProcessingMetadata.capturedSpanIsolationScope;
			const dataCategory = getDataCategoryByType(event.type);
			this._process(() => this._captureEvent(event, hintWithEventId, capturedSpanScope || currentScope, capturedSpanIsolationScope), dataCategory);
			return hintWithEventId.event_id;
		}
		/**
		* Captures a session.
		*/
		captureSession(session$1) {
			this.sendSession(session$1);
			session.updateSession(session$1, { init: false });
		}
		/**
		* Get the current Dsn.
		*/
		getDsn() {
			return this._dsn;
		}
		/**
		* Get the current options.
		*/
		getOptions() {
			return this._options;
		}
		/**
		* Get the resolved data collection configuration.
		*/
		getDataCollectionOptions() {
			return this._dataCollection;
		}
		/**
		* Get the SDK metadata.
		* @see SdkMetadata
		*/
		getSdkMetadata() {
			return this._options._metadata;
		}
		/**
		* Returns the transport that is used by the client.
		* Please note that the transport gets lazy initialized so it will only be there once the first event has been sent.
		*/
		getTransport() {
			return this._transport;
		}
		/**
		* Wait for all events to be sent or the timeout to expire, whichever comes first.
		*
		* @param timeout Maximum time in ms the client should wait for events to be flushed. Omitting this parameter will
		*   cause the client to wait until all events are sent before resolving the promise.
		* @returns A promise that will resolve with `true` if all events are sent before the timeout, or `false` if there are
		* still events in the queue when the timeout is reached.
		*/
		async flush(timeout) {
			const transport = this._transport;
			this.emit("flush");
			if (!transport) return true;
			const clientFinished = await this._isClientDoneProcessing(timeout);
			const transportFlushed = await transport.flush(timeout);
			return clientFinished && transportFlushed;
		}
		/**
		* Flush the event queue and set the client to `enabled = false`. See {@link Client.flush}.
		*
		* @param {number} timeout Maximum time in ms the client should wait before shutting down. Omitting this parameter will cause
		*   the client to wait until all events are sent before disabling itself.
		* @returns {Promise<boolean>} A promise which resolves to `true` if the flush completes successfully before the timeout, or `false` if
		* it doesn't.
		*/
		async close(timeout) {
			internal._INTERNAL_flushLogsBuffer(this);
			const result = await this.flush(timeout);
			this.getOptions().enabled = false;
			this.emit("close");
			return result;
		}
		/**
		* Get all installed event processors.
		*/
		getEventProcessors() {
			return this._eventProcessors;
		}
		/**
		* Adds an event processor that applies to any event processed by this client.
		*/
		addEventProcessor(eventProcessor) {
			this._eventProcessors.push(eventProcessor);
		}
		/**
		* Initialize this client.
		* Call this after the client was set on a scope.
		*/
		init() {
			if (this._isEnabled() || this._options.integrations.some(({ name }) => name.startsWith("Spotlight"))) this._setupIntegrations();
		}
		/**
		* Gets an installed integration by its name.
		*
		* @returns {Integration|undefined} The installed integration or `undefined` if no integration with that `name` was installed.
		*/
		getIntegrationByName(integrationName) {
			return this._integrations[integrationName];
		}
		/**
		* Returns the names of all installed integrations.
		*/
		getIntegrationNames() {
			return Object.keys(this._integrations);
		}
		/**
		* Add an integration to the client.
		* This can be used to e.g. lazy load integrations.
		* In most cases, this should not be necessary,
		* and you're better off just passing the integrations via `integrations: []` at initialization time.
		* However, if you find the need to conditionally load & add an integration, you can use `addIntegration` to do so.
		*/
		addIntegration(integration$1) {
			const isAlreadyInstalled = this._integrations[integration$1.name];
			if (!isAlreadyInstalled && integration$1.beforeSetup) integration$1.beforeSetup(this);
			integration.setupIntegration(this, integration$1, this._integrations);
			if (!isAlreadyInstalled) integration.afterSetupIntegrations(this, [integration$1]);
		}
		/**
		* Send a fully prepared event to Sentry.
		*/
		sendEvent(event, hint = {}) {
			this.emit("beforeSendEvent", event, hint);
			const genAiSpanItem = extractGenAiSpans.extractGenAiSpansFromEvent(event, this);
			let env = envelope.createEventEnvelope(event, this._dsn, this._options._metadata, this._options.tunnel);
			for (const attachment of hint.attachments || []) env = envelope$1.addItemToEnvelope(env, envelope$1.createAttachmentEnvelopeItem(attachment));
			if (genAiSpanItem) env = envelope$1.addItemToEnvelope(env, genAiSpanItem);
			this.sendEnvelope(env).then((sendResponse) => this.emit("afterSendEvent", event, sendResponse));
		}
		/**
		* Send a session or session aggregrates to Sentry.
		*/
		sendSession(session) {
			const { release: clientReleaseOption, environment: clientEnvironmentOption = constants.DEFAULT_ENVIRONMENT } = this._options;
			if ("aggregates" in session) {
				const sessionAttrs = session.attrs || {};
				if (!sessionAttrs.release && !clientReleaseOption) {
					debugBuild.DEBUG_BUILD && debugLogger.debug.warn(MISSING_RELEASE_FOR_SESSION_ERROR);
					return;
				}
				sessionAttrs.release = sessionAttrs.release || clientReleaseOption;
				sessionAttrs.environment = sessionAttrs.environment || clientEnvironmentOption;
				session.attrs = sessionAttrs;
			} else {
				if (!session.release && !clientReleaseOption) {
					debugBuild.DEBUG_BUILD && debugLogger.debug.warn(MISSING_RELEASE_FOR_SESSION_ERROR);
					return;
				}
				session.release = session.release || clientReleaseOption;
				session.environment = session.environment || clientEnvironmentOption;
			}
			this.emit("beforeSendSession", session);
			const env = envelope.createSessionEnvelope(session, this._dsn, this._options._metadata, this._options.tunnel);
			this.sendEnvelope(env);
		}
		/**
		* Record on the client that an event got dropped (ie, an event that will not be sent to Sentry).
		*/
		recordDroppedEvent(reason, category, count = 1) {
			if (this._options.sendClientReports) {
				const key = `${reason}:${category}`;
				debugBuild.DEBUG_BUILD && debugLogger.debug.log(`Recording outcome: "${key}"${count > 1 ? ` (${count} times)` : ""}`);
				this._outcomes[key] = (this._outcomes[key] || 0) + count;
			}
		}
		/**
		* Register a hook on this client.
		*/
		on(hook, callback) {
			const hookCallbacks = this._hooks[hook] = this._hooks[hook] || /* @__PURE__ */ new Set();
			const uniqueCallback = (...args) => callback(...args);
			hookCallbacks.add(uniqueCallback);
			return () => {
				hookCallbacks.delete(uniqueCallback);
			};
		}
		/**
		* Emit a hook that was previously registered via `on()`.
		*/
		emit(hook, ...rest) {
			const callbacks = this._hooks[hook];
			if (callbacks) callbacks.forEach((callback) => callback(...rest));
		}
		/**
		* Send an envelope to Sentry.
		*/
		async sendEnvelope(envelope) {
			this.emit("beforeEnvelope", envelope);
			if (this._isEnabled() && this._transport) try {
				return await this._transport.send(envelope);
			} catch (reason) {
				debugBuild.DEBUG_BUILD && debugLogger.debug.error("Error while sending envelope:", reason);
				return {};
			}
			debugBuild.DEBUG_BUILD && debugLogger.debug.error("Transport disabled");
			return {};
		}
		/**
		* Register a cleanup function to be called when the client is disposed.
		* This is useful for integrations that need to clean up global state.
		*
		* NOTE: This is a no-op in the base `Client` class. Subclasses like `ServerRuntimeClient`
		* override this method to actually register and execute cleanup callbacks.
		*/
		registerCleanup(callback) {}
		/**
		* Disposes of the client and releases all resources.
		*
		* Subclasses should override this method to clean up their own resources, including invoking
		* any callbacks registered via {@link Client.registerCleanup}. The base implementation is a
		* no-op and does NOT execute registered cleanup callbacks.
		*
		* After calling dispose(), the client should not be used anymore.
		*/
		dispose() {}
		/** Setup integrations for this client. */
		_setupIntegrations() {
			const { integrations } = this._options;
			this._integrations = integration.setupIntegrations(this, integrations);
			integration.afterSetupIntegrations(this, integrations);
		}
		/** Updates existing session based on the provided event */
		_updateSessionFromEvent(session$1, event) {
			let crashed = event.level === "fatal";
			let errored = false;
			const exceptions = event.exception?.values;
			if (exceptions) {
				errored = true;
				crashed = false;
				for (const ex of exceptions) if (ex.mechanism?.handled === false) {
					crashed = true;
					break;
				}
			}
			const sessionNonTerminal = session$1.status === "ok";
			if (sessionNonTerminal && session$1.errors === 0 || sessionNonTerminal && crashed) {
				session.updateSession(session$1, {
					...crashed && { status: "crashed" },
					errors: session$1.errors || Number(errored || crashed)
				});
				this.captureSession(session$1);
			}
		}
		/**
		* Determine if the client is finished processing. Returns a promise because it will wait `timeout` ms before saying
		* "no" (resolving to `false`) in order to give the client a chance to potentially finish first.
		*
		* @param timeout The time, in ms, after which to resolve to `false` if the client is still busy. Passing `0` (or not
		* passing anything) will make the promise wait as long as it takes for processing to finish before resolving to
		* `true`.
		* @returns A promise which will resolve to `true` if processing is already done or finishes before the timeout, and
		* `false` otherwise
		*/
		async _isClientDoneProcessing(timeout) {
			let ticked = 0;
			while (!timeout || ticked < timeout) {
				await new Promise((resolve) => setTimeout(resolve, 1));
				if (!this._numProcessing) return true;
				ticked++;
			}
			return false;
		}
		/** Determines whether this SDK is enabled and a transport is present. */
		_isEnabled() {
			return this.getOptions().enabled !== false && this._transport !== void 0;
		}
		/**
		* Adds common information to events.
		*
		* The information includes release and environment from `options`,
		* breadcrumbs and context (extra, tags and user) from the scope.
		*
		* Information that is already present in the event is never overwritten. For
		* nested objects, such as the context, keys are merged.
		*
		* @param event The original event.
		* @param hint May contain additional information about the original exception.
		* @param currentScope A scope containing event metadata.
		* @returns A new event with more information.
		*/
		_prepareEvent(event, hint, currentScope, isolationScope) {
			const options = this.getOptions();
			const integrations = this.getIntegrationNames();
			if (!hint.integrations && integrations.length) hint.integrations = integrations;
			this.emit("preprocessEvent", event, hint);
			if (!event.type) isolationScope.setLastEventId(event.event_id || hint.event_id);
			return prepareEvent.prepareEvent(options, event, hint, currentScope, this, isolationScope).then((evt) => {
				if (evt === null) return evt;
				this.emit("postprocessEvent", evt, hint);
				evt.contexts = {
					trace: {
						...evt.contexts?.trace,
						...currentScopes.getTraceContextFromScope(currentScope)
					},
					...evt.contexts
				};
				evt.sdkProcessingMetadata = {
					dynamicSamplingContext: dynamicSamplingContext.getDynamicSamplingContextFromScope(this, currentScope),
					...evt.sdkProcessingMetadata
				};
				return evt;
			});
		}
		/**
		* Processes the event and logs an error in case of rejection
		* @param event
		* @param hint
		* @param scope
		*/
		_captureEvent(event, hint = {}, currentScope = currentScopes.getCurrentScope(), isolationScope = currentScopes.getIsolationScope()) {
			if (debugBuild.DEBUG_BUILD && isErrorEvent(event)) debugLogger.debug.log(`Captured error event \`${eventUtils.getPossibleEventMessages(event)[0] || "<unknown>"}\``);
			return this._processEvent(event, hint, currentScope, isolationScope).then((finalEvent) => {
				return finalEvent.event_id;
			}, (reason) => {
				if (debugBuild.DEBUG_BUILD) if (_isDoNotSendEventError(reason)) debugLogger.debug.log(reason.message);
				else if (_isInternalError(reason)) debugLogger.debug.warn(reason.message);
				else debugLogger.debug.warn(reason);
			});
		}
		/**
		* Processes an event (either error or message) and sends it to Sentry.
		*
		* This also adds breadcrumbs and context information to the event. However,
		* platform specific meta data (such as the User's IP address) must be added
		* by the SDK implementor.
		*
		*
		* @param event The event to send to Sentry.
		* @param hint May contain additional information about the original exception.
		* @param currentScope A scope containing event metadata.
		* @returns A SyncPromise that resolves with the event or rejects in case event was/will not be send.
		*/
		_processEvent(event, hint, currentScope, isolationScope) {
			const options = this.getOptions();
			const { sampleRate } = options;
			const isTransaction = isTransactionEvent(event);
			const isError = isErrorEvent(event);
			const beforeSendLabel = `before send for type \`${event.type || "error"}\``;
			const parsedSampleRate = typeof sampleRate === "undefined" ? void 0 : parseSampleRate.parseSampleRate(sampleRate);
			if (isError && typeof parsedSampleRate === "number" && randomSafeContext.safeMathRandom() > parsedSampleRate) {
				this.recordDroppedEvent("sample_rate", "error");
				return syncpromise.rejectedSyncPromise(_makeDoNotSendEventError(`Discarding event because it's not included in the random sample (sampling rate = ${sampleRate})`));
			}
			const dataCategory = getDataCategoryByType(event.type);
			return this._prepareEvent(event, hint, currentScope, isolationScope).then((prepared) => {
				if (prepared === null) {
					this.recordDroppedEvent("event_processor", dataCategory);
					throw _makeDoNotSendEventError("An event processor returned `null`, will not send event.");
				}
				if (hint.data?.__sentry__ === true) return prepared;
				return _validateBeforeSendResult(processBeforeSend(this, options, prepared, hint), beforeSendLabel);
			}).then((processedEvent) => {
				if (processedEvent === null) {
					this.recordDroppedEvent("before_send", dataCategory);
					if (isTransaction) {
						const spanCount = 1 + (event.spans || []).length;
						this.recordDroppedEvent("before_send", "span", spanCount);
					}
					throw _makeDoNotSendEventError(`${beforeSendLabel} returned \`null\`, will not send event.`);
				}
				const session = currentScope.getSession() || isolationScope.getSession();
				if (isError && session) this._updateSessionFromEvent(session, processedEvent);
				if (isTransaction) {
					const droppedSpanCount = (processedEvent.sdkProcessingMetadata?.spanCountBeforeProcessing || 0) - (processedEvent.spans ? processedEvent.spans.length : 0);
					if (droppedSpanCount > 0) this.recordDroppedEvent("before_send", "span", droppedSpanCount);
				}
				const transactionInfo = processedEvent.transaction_info;
				if (isTransaction && transactionInfo && processedEvent.transaction !== event.transaction) {
					const source = "custom";
					processedEvent.transaction_info = {
						...transactionInfo,
						source
					};
				}
				this.sendEvent(processedEvent, hint);
				return processedEvent;
			}).then(null, (reason) => {
				if (_isDoNotSendEventError(reason) || _isInternalError(reason)) throw reason;
				this.captureException(reason, {
					mechanism: {
						handled: false,
						type: "internal"
					},
					data: { __sentry__: true },
					originalException: reason
				});
				throw _makeInternalError(`Event processing pipeline threw an error, original event will not be sent. Details have been sent as a new event.
Reason: ${reason}`);
			});
		}
		/**
		* Occupies the client with processing and event
		*/
		_process(taskProducer, dataCategory) {
			this._numProcessing++;
			this._promiseBuffer.add(taskProducer).then((value) => {
				this._numProcessing--;
				return value;
			}, (reason) => {
				this._numProcessing--;
				if (reason === promisebuffer.SENTRY_BUFFER_FULL_ERROR) this.recordDroppedEvent("queue_overflow", dataCategory);
				return reason;
			});
		}
		/**
		* Clears outcomes on this client and returns them.
		*/
		_clearOutcomes() {
			const outcomes = this._outcomes;
			this._outcomes = {};
			return Object.entries(outcomes).map(([key, quantity]) => {
				const [reason, category] = key.split(":");
				return {
					reason,
					category,
					quantity
				};
			});
		}
		/**
		* Sends client reports as an envelope.
		*/
		_flushOutcomes() {
			debugBuild.DEBUG_BUILD && debugLogger.debug.log("Flushing outcomes...");
			const outcomes = this._clearOutcomes();
			if (outcomes.length === 0) {
				debugBuild.DEBUG_BUILD && debugLogger.debug.log("No outcomes to send");
				return;
			}
			if (!this._dsn) {
				debugBuild.DEBUG_BUILD && debugLogger.debug.log("No dsn provided, will not send outcomes");
				return;
			}
			debugBuild.DEBUG_BUILD && debugLogger.debug.log("Sending outcomes:", outcomes);
			const envelope = clientreport.createClientReportEnvelope(outcomes, this._options.tunnel && dsn.dsnToString(this._dsn));
			this.sendEnvelope(envelope);
		}
	};
	function getDataCategoryByType(type) {
		return type === "replay_event" ? "replay" : type || "error";
	}
	function _validateBeforeSendResult(beforeSendResult, beforeSendLabel) {
		const invalidValueError = `${beforeSendLabel} must return \`null\` or a valid event.`;
		if (is.isThenable(beforeSendResult)) return beforeSendResult.then((event) => {
			if (!is.isPlainObject(event) && event !== null) throw _makeInternalError(invalidValueError);
			return event;
		}, (e) => {
			throw _makeInternalError(`${beforeSendLabel} rejected with ${e}`);
		});
		else if (!is.isPlainObject(beforeSendResult) && beforeSendResult !== null) throw _makeInternalError(invalidValueError);
		return beforeSendResult;
	}
	function processBeforeSend(client, options, event, hint) {
		const { beforeSend, beforeSendTransaction, ignoreSpans } = options;
		const beforeSendSpan$1 = !beforeSendSpan.isStreamedBeforeSendSpanCallback(options.beforeSendSpan) && options.beforeSendSpan;
		let processedEvent = event;
		if (isErrorEvent(processedEvent) && beforeSend) return beforeSend(processedEvent, hint);
		if (isTransactionEvent(processedEvent)) {
			if (beforeSendSpan$1 || ignoreSpans) {
				const rootSpanJson = transactionEvent.convertTransactionEventToSpanJson(processedEvent);
				if (ignoreSpans?.length && shouldIgnoreSpan.shouldIgnoreSpan({
					description: rootSpanJson.description,
					op: rootSpanJson.op,
					attributes: rootSpanJson.data
				}, ignoreSpans)) return null;
				if (beforeSendSpan$1) {
					const processedRootSpanJson = beforeSendSpan$1(rootSpanJson);
					if (!processedRootSpanJson) spanUtils.showSpanDropWarning();
					else processedEvent = merge.merge(event, transactionEvent.convertSpanJsonToTransactionEvent(processedRootSpanJson));
				}
				if (processedEvent.spans) {
					const processedSpans = [];
					const initialSpans = processedEvent.spans;
					for (const span of initialSpans) {
						if (ignoreSpans?.length && shouldIgnoreSpan.shouldIgnoreSpan({
							description: span.description,
							op: span.op,
							attributes: span.data
						}, ignoreSpans)) {
							shouldIgnoreSpan.reparentChildSpans(initialSpans, span);
							continue;
						}
						if (beforeSendSpan$1) {
							const processedSpan = beforeSendSpan$1(span);
							if (!processedSpan) {
								spanUtils.showSpanDropWarning();
								processedSpans.push(span);
							} else processedSpans.push(processedSpan);
						} else processedSpans.push(span);
					}
					const droppedSpans = processedEvent.spans.length - processedSpans.length;
					if (droppedSpans) client.recordDroppedEvent("before_send", "span", droppedSpans);
					processedEvent.spans = processedSpans;
				}
			}
			if (beforeSendTransaction) {
				if (processedEvent.spans) {
					const spanCountBefore = processedEvent.spans.length;
					processedEvent.sdkProcessingMetadata = {
						...event.sdkProcessingMetadata,
						spanCountBeforeProcessing: spanCountBefore
					};
				}
				return beforeSendTransaction(processedEvent, hint);
			}
		}
		return processedEvent;
	}
	function isErrorEvent(event) {
		return event.type === void 0;
	}
	function isTransactionEvent(event) {
		return event.type === "transaction";
	}
	function estimateMetricSizeInBytes(metric) {
		let weight = 0;
		if (metric.name) weight += metric.name.length * 2;
		weight += 8;
		return weight + estimateAttributesSizeInBytes(metric.attributes);
	}
	function estimateLogSizeInBytes(log) {
		let weight = 0;
		if (log.message) weight += log.message.length * 2;
		return weight + estimateAttributesSizeInBytes(log.attributes);
	}
	function estimateAttributesSizeInBytes(attributes) {
		if (!attributes) return 0;
		let weight = 0;
		Object.values(attributes).forEach((value) => {
			if (Array.isArray(value)) weight += value.length * estimatePrimitiveSizeInBytes(value[0]);
			else if (is.isPrimitive(value)) weight += estimatePrimitiveSizeInBytes(value);
			else weight += 100;
		});
		return weight;
	}
	function estimatePrimitiveSizeInBytes(value) {
		if (typeof value === "string") return value.length * 2;
		else if (typeof value === "number") return 8;
		else if (typeof value === "boolean") return 4;
		return 0;
	}
	exports.Client = Client;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/sdk.js
var require_sdk = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const currentScopes = require_currentScopes();
	const debugBuild = require_debug_build();
	const debugLogger = require_debug_logger();
	function initAndBind(clientClass, options) {
		if (options.debug === true) if (debugBuild.DEBUG_BUILD) debugLogger.debug.enable();
		else debugLogger.consoleSandbox(() => {
			console.warn("[Sentry] Cannot initialize SDK with `debug` option using a non-debug bundle.");
		});
		currentScopes.getCurrentScope().update(options.initialScope);
		const client = new clientClass(options);
		setCurrentClient(client);
		client.init();
		return client;
	}
	function setCurrentClient(client) {
		currentScopes.getCurrentScope().setClient(client);
	}
	exports.initAndBind = initAndBind;
	exports.setCurrentClient = setCurrentClient;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/transports/offline.js
var require_offline = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const debugBuild = require_debug_build();
	const debugLogger = require_debug_logger();
	const envelope = require_envelope$4();
	const randomSafeContext = require_randomSafeContext();
	const ratelimit = require_ratelimit();
	const timer = require_timer();
	const MIN_DELAY = 100;
	const START_DELAY = 5e3;
	const MAX_DELAY = 36e5;
	function makeOfflineTransport(createTransport) {
		function log(...args) {
			debugBuild.DEBUG_BUILD && debugLogger.debug.log("[Offline]:", ...args);
		}
		return (options) => {
			const transport = createTransport(options);
			if (!options.createStore) throw new Error("No `createStore` function was provided");
			const store = options.createStore(options);
			let retryDelay = START_DELAY;
			let flushTimer;
			function shouldQueue(env, error, retryDelay2) {
				if (envelope.envelopeContainsItemType(env, ["client_report"])) return false;
				if (options.shouldStore) return options.shouldStore(env, error, retryDelay2);
				return true;
			}
			function flushIn(delay) {
				if (flushTimer) clearTimeout(flushTimer);
				flushTimer = timer.safeUnref(setTimeout(async () => {
					flushTimer = void 0;
					const found = await store.shift();
					if (found) {
						log("Attempting to send previously queued event");
						found[0].sent_at = new Date(randomSafeContext.safeDateNow()).toISOString();
						send(found, true).catch((e) => {
							log("Failed to retry sending", e);
						});
					}
				}, delay));
			}
			function flushWithBackOff() {
				if (flushTimer) return;
				flushIn(retryDelay);
				retryDelay = Math.min(retryDelay * 2, MAX_DELAY);
			}
			async function send(envelope$1, isRetry = false) {
				if (!isRetry && envelope.envelopeContainsItemType(envelope$1, ["replay_event", "replay_recording"])) {
					await store.push(envelope$1);
					flushIn(MIN_DELAY);
					return {};
				}
				try {
					if (options.shouldSend && await options.shouldSend(envelope$1) === false) throw new Error("Envelope not sent because `shouldSend` callback returned false");
					const result = await transport.send(envelope$1);
					let delay = MIN_DELAY;
					if (result) {
						if (result.headers?.["retry-after"]) delay = ratelimit.parseRetryAfterHeader(result.headers["retry-after"]);
						else if (result.headers?.["x-sentry-rate-limits"]) delay = 6e4;
						else if ((result.statusCode || 0) >= 400) return result;
					}
					flushIn(delay);
					retryDelay = START_DELAY;
					return result;
				} catch (e) {
					if (await shouldQueue(envelope$1, e, retryDelay)) {
						if (isRetry) await store.unshift(envelope$1);
						else await store.push(envelope$1);
						flushWithBackOff();
						log("Error sending. Event queued.", e);
						return {};
					} else throw e;
				}
			}
			if (options.flushAtStartup) flushWithBackOff();
			return {
				send,
				flush: (timeout) => {
					if (timeout === void 0) {
						retryDelay = START_DELAY;
						flushIn(MIN_DELAY);
					}
					return transport.flush(timeout);
				}
			};
		};
	}
	exports.MIN_DELAY = MIN_DELAY;
	exports.START_DELAY = START_DELAY;
	exports.makeOfflineTransport = makeOfflineTransport;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/transports/multiplexed.js
var require_multiplexed = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const api = require_api();
	const dsn = require_dsn();
	const envelope = require_envelope$4();
	const MULTIPLEXED_TRANSPORT_EXTRA_KEY = "MULTIPLEXED_TRANSPORT_EXTRA_KEY";
	function eventFromEnvelope(env, types) {
		let event;
		envelope.forEachEnvelopeItem(env, (item, type) => {
			if (types.includes(type)) event = Array.isArray(item) ? item[1] : void 0;
			return !!event;
		});
		return event;
	}
	function makeOverrideReleaseTransport(createTransport, release) {
		return (options) => {
			const transport = createTransport(options);
			return {
				...transport,
				send: async (envelope) => {
					const event = eventFromEnvelope(envelope, [
						"event",
						"transaction",
						"profile",
						"replay_event"
					]);
					if (event) event.release = release;
					return transport.send(envelope);
				}
			};
		};
	}
	function overrideDsn(envelope$1, dsn) {
		return envelope.createEnvelope(dsn ? {
			...envelope$1[0],
			dsn
		} : envelope$1[0], envelope$1[1]);
	}
	function makeMultiplexedTransport(createTransport, matcher) {
		return (options) => {
			const fallbackTransport = createTransport(options);
			const otherTransports = /* @__PURE__ */ new Map();
			const actualMatcher = matcher || ((args) => {
				const event = args.getEvent();
				if (event?.extra?.[MULTIPLEXED_TRANSPORT_EXTRA_KEY] && Array.isArray(event.extra[MULTIPLEXED_TRANSPORT_EXTRA_KEY])) return event.extra[MULTIPLEXED_TRANSPORT_EXTRA_KEY];
				return [];
			});
			function getTransport(dsn$1, release) {
				const key = release ? `${dsn$1}:${release}` : dsn$1;
				let transport = otherTransports.get(key);
				if (!transport) {
					const validatedDsn = dsn.dsnFromString(dsn$1);
					if (!validatedDsn) return;
					const url = api.getEnvelopeEndpointWithUrlEncodedAuth(validatedDsn, options.tunnel);
					transport = release ? makeOverrideReleaseTransport(createTransport, release)({
						...options,
						url
					}) : createTransport({
						...options,
						url
					});
					otherTransports.set(key, transport);
				}
				return [dsn$1, transport];
			}
			async function send(envelope) {
				function getEvent(types) {
					return eventFromEnvelope(envelope, types?.length ? types : ["event"]);
				}
				const transports = actualMatcher({
					envelope,
					getEvent
				}).map((result) => {
					if (typeof result === "string") return getTransport(result, void 0);
					else return getTransport(result.dsn, result.release);
				}).filter((t) => !!t);
				const transportsWithFallback = transports.length ? transports : [["", fallbackTransport]];
				return (await Promise.all(transportsWithFallback.map(([dsn, transport]) => transport.send(overrideDsn(envelope, dsn)))))[0];
			}
			async function flush(timeout) {
				const allTransports = [...otherTransports.values(), fallbackTransport];
				return (await Promise.all(allTransports.map((transport) => transport.flush(timeout)))).every((r) => r);
			}
			return {
				send,
				flush
			};
		};
	}
	exports.MULTIPLEXED_TRANSPORT_EXTRA_KEY = MULTIPLEXED_TRANSPORT_EXTRA_KEY;
	exports.eventFromEnvelope = eventFromEnvelope;
	exports.makeMultiplexedTransport = makeMultiplexedTransport;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/ai/providerSkip.js
var require_providerSkip = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const debugBuild = require_debug_build();
	const debugLogger = require_debug_logger();
	const SKIPPED_AI_PROVIDERS = /* @__PURE__ */ new Set();
	function _INTERNAL_skipAiProviderWrapping(modules) {
		modules.forEach((module$1) => {
			SKIPPED_AI_PROVIDERS.add(module$1);
			debugBuild.DEBUG_BUILD && debugLogger.debug.log(`AI provider "${module$1}" wrapping will be skipped`);
		});
	}
	function _INTERNAL_shouldSkipAiProviderWrapping(module$2) {
		return SKIPPED_AI_PROVIDERS.has(module$2);
	}
	function _INTERNAL_clearAiProviderSkips() {
		SKIPPED_AI_PROVIDERS.clear();
		debugBuild.DEBUG_BUILD && debugLogger.debug.log("Cleared AI provider skip registrations");
	}
	exports._INTERNAL_clearAiProviderSkips = _INTERNAL_clearAiProviderSkips;
	exports._INTERNAL_shouldSkipAiProviderWrapping = _INTERNAL_shouldSkipAiProviderWrapping;
	exports._INTERNAL_skipAiProviderWrapping = _INTERNAL_skipAiProviderWrapping;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/data-collection/filterKeyValueData.js
var require_filterKeyValueData = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const filteringSnippets = require_filtering_snippets();
	function isSensitiveKey(lower, denySnippets) {
		return denySnippets.some((snippet) => lower.includes(snippet));
	}
	function filterKeyValueData(data, behavior, additionalDenyTerms) {
		if (behavior === false) return {};
		const denySnippets = additionalDenyTerms != null ? [...filteringSnippets.SENSITIVE_KEY_SNIPPETS, ...additionalDenyTerms] : filteringSnippets.SENSITIVE_KEY_SNIPPETS;
		const result = {};
		if (behavior === true) {
			for (const key of Object.keys(data)) result[key] = isSensitiveKey(key.toLowerCase(), denySnippets) ? filteringSnippets.FILTERED_VALUE : data[key];
			return result;
		}
		if ("deny" in behavior) {
			const lowerTerms2 = behavior.deny.map((t) => t.toLowerCase());
			for (const key of Object.keys(data)) {
				const lower = key.toLowerCase();
				result[key] = isSensitiveKey(lower, denySnippets) || lowerTerms2.some((term) => lower.includes(term)) ? filteringSnippets.FILTERED_VALUE : data[key];
			}
			return result;
		}
		const lowerTerms = behavior.allow.map((t) => t.toLowerCase());
		for (const key of Object.keys(data)) {
			const lower = key.toLowerCase();
			if (isSensitiveKey(lower, denySnippets)) result[key] = filteringSnippets.FILTERED_VALUE;
			else result[key] = lowerTerms.some((term) => lower.includes(term)) ? data[key] : filteringSnippets.FILTERED_VALUE;
		}
		return result;
	}
	exports.filterKeyValueData = filterKeyValueData;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/cookie.js
var require_cookie = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	function parseCookie(str) {
		const obj = {};
		let index = 0;
		while (index < str.length) {
			const eqIdx = str.indexOf("=", index);
			if (eqIdx === -1) break;
			let endIdx = str.indexOf(";", index);
			if (endIdx === -1) endIdx = str.length;
			else if (endIdx < eqIdx) {
				index = str.lastIndexOf(";", eqIdx - 1) + 1;
				continue;
			}
			const key = str.slice(index, eqIdx).trim();
			if (void 0 === obj[key]) {
				let val = str.slice(eqIdx + 1, endIdx).trim();
				if (val.charCodeAt(0) === 34) val = val.slice(1, -1);
				try {
					obj[key] = val.indexOf("%") !== -1 ? decodeURIComponent(val) : val;
				} catch {
					obj[key] = val;
				}
			}
			index = endIdx + 1;
		}
		return obj;
	}
	exports.parseCookie = parseCookie;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/data-collection/filterCookies.js
var require_filterCookies = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const cookie = require_cookie();
	const filteringSnippets = require_filtering_snippets();
	const filterKeyValueData = require_filterKeyValueData();
	function filterCookies(cookieString, behavior) {
		if (behavior === false) return {};
		try {
			const parsed = cookie.parseCookie(cookieString);
			if (Object.keys(parsed).length === 0) return {};
			return filterKeyValueData.filterKeyValueData(parsed, behavior, filteringSnippets.SENSITIVE_COOKIE_NAME_SNIPPETS);
		} catch {
			return filteringSnippets.FILTERED_VALUE;
		}
	}
	exports.filterCookies = filterCookies;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/data-collection/filterQueryParams.js
var require_filterQueryParams = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const filteringSnippets = require_filtering_snippets();
	const filterKeyValueData = require_filterKeyValueData();
	function filterQueryParams(queryString, behavior) {
		if (behavior === false) return {};
		try {
			const params = new URLSearchParams(queryString);
			const parsed = {};
			params.forEach((value, key) => {
				parsed[key] = value;
			});
			if (Object.keys(parsed).length === 0) return {};
			return filterKeyValueData.filterKeyValueData(parsed, behavior);
		} catch {
			return filteringSnippets.FILTERED_VALUE;
		}
	}
	exports.filterQueryParams = filterQueryParams;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/envToBool.js
var require_envToBool = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const FALSY_ENV_VALUES = /* @__PURE__ */ new Set([
		"false",
		"f",
		"n",
		"no",
		"off",
		"0"
	]);
	const TRUTHY_ENV_VALUES = /* @__PURE__ */ new Set([
		"true",
		"t",
		"y",
		"yes",
		"on",
		"1"
	]);
	function envToBool(value, options) {
		const normalized = String(value).toLowerCase();
		if (FALSY_ENV_VALUES.has(normalized)) return false;
		if (TRUTHY_ENV_VALUES.has(normalized)) return true;
		return options?.strict ? null : Boolean(value);
	}
	exports.FALSY_ENV_VALUES = FALSY_ENV_VALUES;
	exports.TRUTHY_ENV_VALUES = TRUTHY_ENV_VALUES;
	exports.envToBool = envToBool;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/checkin.js
var require_checkin = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const dsn = require_dsn();
	const envelope = require_envelope$4();
	const randomSafeContext = require_randomSafeContext();
	function createCheckInEnvelope(checkIn, dynamicSamplingContext, metadata, tunnel, dsn$1) {
		const headers = { sent_at: new Date(randomSafeContext.safeDateNow()).toISOString() };
		if (metadata?.sdk) headers.sdk = {
			name: metadata.sdk.name,
			version: metadata.sdk.version
		};
		if (!!tunnel && !!dsn$1) headers.dsn = dsn.dsnToString(dsn$1);
		if (dynamicSamplingContext) headers.trace = dynamicSamplingContext;
		const item = createCheckInEnvelopeItem(checkIn);
		return envelope.createEnvelope(headers, [item]);
	}
	function createCheckInEnvelopeItem(checkIn) {
		return [{ type: "check_in" }, checkIn];
	}
	exports.createCheckInEnvelope = createCheckInEnvelope;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/url.js
var require_url = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const semanticAttributes = require_semanticAttributes();
	const DEFAULT_BASE_URL = "thismessage:/";
	function isURLObjectRelative(url) {
		return "isRelative" in url;
	}
	function parseStringToURLObject(url, urlBase) {
		const isRelative = url.indexOf("://") <= 0 && url.indexOf("//") !== 0;
		const base = urlBase ?? (isRelative ? DEFAULT_BASE_URL : void 0);
		try {
			if ("canParse" in URL && !URL.canParse(url, base)) return;
			const fullUrlObject = new URL(url, base);
			if (isRelative) return {
				isRelative,
				pathname: fullUrlObject.pathname,
				search: fullUrlObject.search,
				hash: fullUrlObject.hash
			};
			return fullUrlObject;
		} catch {}
	}
	function getSanitizedUrlStringFromUrlObject(url) {
		if (isURLObjectRelative(url)) return url.pathname;
		const newUrl = new URL(url);
		newUrl.search = "";
		newUrl.hash = "";
		if (["80", "443"].includes(newUrl.port)) newUrl.port = "";
		if (newUrl.password) newUrl.password = "%filtered%";
		if (newUrl.username) newUrl.username = "%filtered%";
		return newUrl.toString();
	}
	function getHttpSpanNameFromUrlObject(urlObject, kind, request, routeName) {
		return `${request?.method?.toUpperCase() ?? "GET"} ${routeName ? routeName : urlObject ? kind === "client" ? getSanitizedUrlStringFromUrlObject(urlObject) : urlObject.pathname : "/"}`;
	}
	function getHttpSpanDetailsFromUrlObject(urlObject, kind, spanOrigin, request, routeName) {
		const attributes = {
			[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: spanOrigin,
			[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: "url"
		};
		if (routeName) {
			attributes[kind === "server" ? "http.route" : "url.template"] = routeName;
			attributes[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE] = "route";
		}
		if (request?.method) attributes[semanticAttributes.SEMANTIC_ATTRIBUTE_HTTP_REQUEST_METHOD] = request.method.toUpperCase();
		if (urlObject) {
			if (urlObject.search) attributes["url.query"] = urlObject.search;
			if (urlObject.hash) attributes["url.fragment"] = urlObject.hash;
			if (urlObject.pathname) {
				attributes["url.path"] = urlObject.pathname;
				if (urlObject.pathname === "/") attributes[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE] = "route";
			}
			if (!isURLObjectRelative(urlObject)) {
				attributes[semanticAttributes.SEMANTIC_ATTRIBUTE_URL_FULL] = urlObject.href;
				if (urlObject.port) attributes["url.port"] = urlObject.port;
				if (urlObject.protocol) attributes["url.scheme"] = urlObject.protocol;
				if (urlObject.hostname) attributes[kind === "server" ? "server.address" : "url.domain"] = urlObject.hostname;
			}
		}
		return [getHttpSpanNameFromUrlObject(urlObject, kind, request, routeName), attributes];
	}
	function parseUrl(url) {
		if (!url) return {};
		const match = url.match(/^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/);
		if (!match) return {};
		const query = match[6] || "";
		const fragment = match[8] || "";
		return {
			host: match[4],
			path: match[5],
			protocol: match[2],
			search: query,
			hash: fragment,
			relative: match[5] + query + fragment
		};
	}
	function stripUrlQueryAndFragment(urlPath) {
		return urlPath.split(/[?#]/, 1)[0];
	}
	function getSanitizedUrlString(url) {
		const { protocol, host, path } = url;
		const filteredHost = host?.replace(/^.*@/, "[filtered]:[filtered]@").replace(/(:80)$/, "").replace(/(:443)$/, "") || "";
		return `${protocol ? `${protocol}://` : ""}${filteredHost}${path}`;
	}
	function stripDataUrlContent(url, includeDataPrefix = true) {
		if (url.startsWith("data:")) {
			const match = url.match(/^data:([^;,]+)/);
			const mimeType = match ? match[1] : "text/plain";
			const isBase64 = url.includes(";base64,");
			const dataStart = url.indexOf(",");
			let dataPrefix = "";
			if (includeDataPrefix && dataStart !== -1) {
				const data = url.slice(dataStart + 1);
				dataPrefix = data.length > 10 ? `${data.slice(0, 10)}... [truncated]` : data;
			}
			return `data:${mimeType}${isBase64 ? ",base64" : ""}${dataPrefix ? `,${dataPrefix}` : ""}`;
		}
		return url;
	}
	exports.getHttpSpanDetailsFromUrlObject = getHttpSpanDetailsFromUrlObject;
	exports.getSanitizedUrlString = getSanitizedUrlString;
	exports.getSanitizedUrlStringFromUrlObject = getSanitizedUrlStringFromUrlObject;
	exports.isURLObjectRelative = isURLObjectRelative;
	exports.parseStringToURLObject = parseStringToURLObject;
	exports.parseUrl = parseUrl;
	exports.stripDataUrlContent = stripDataUrlContent;
	exports.stripUrlQueryAndFragment = stripUrlQueryAndFragment;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/isSentryRequestUrl.js
var require_isSentryRequestUrl = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const url = require_url();
	function isSentryRequestUrl(url, client) {
		const dsn = client?.getDsn();
		const tunnel = client?.getOptions().tunnel;
		return checkDsn(url, dsn) || checkTunnel(url, tunnel);
	}
	function checkTunnel(url, tunnel) {
		if (!tunnel) return false;
		return removeTrailingSlash(url) === removeTrailingSlash(tunnel);
	}
	function checkDsn(url$1, dsn) {
		const urlParts = url.parseStringToURLObject(url$1);
		if (!urlParts || url.isURLObjectRelative(urlParts)) return false;
		if (!dsn) return false;
		return hostnameMatchesDsnHost(urlParts.hostname, dsn.host) && /(^|&|\?)sentry_key=/.test(urlParts.search);
	}
	function hostnameMatchesDsnHost(hostname, dsnHost) {
		return hostname === dsnHost || dsnHost.length > 0 && hostname.endsWith(`.${dsnHost}`);
	}
	function removeTrailingSlash(str) {
		return str[str.length - 1] === "/" ? str.slice(0, -1) : str;
	}
	exports.isSentryRequestUrl = isSentryRequestUrl;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/parameterize.js
var require_parameterize = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	function parameterize(strings, ...values) {
		const formatted = new String(String.raw(strings, ...values));
		formatted.__sentry_template_string__ = strings.join("\0").replace(/%/g, "%%").replace(/\0/g, "%s");
		formatted.__sentry_template_values__ = values;
		return formatted;
	}
	exports.fmt = parameterize;
	exports.parameterize = parameterize;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/tunnel.js
var require_tunnel = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const api = require_api();
	const debugLogger = require_debug_logger();
	const dsn = require_dsn();
	const envelope = require_envelope$4();
	async function handleTunnelRequest(options) {
		const { request, allowedDsns } = options;
		if (allowedDsns.length === 0) return new Response("Tunnel not configured", { status: 500 });
		const body = new Uint8Array(await request.arrayBuffer());
		let envelopeHeader;
		try {
			[envelopeHeader] = envelope.parseEnvelope(body);
		} catch {
			return new Response("Invalid envelope", { status: 400 });
		}
		if (!envelopeHeader) return new Response("Invalid envelope: missing header", { status: 400 });
		const dsn$1 = envelopeHeader.dsn;
		if (!dsn$1) return new Response("Invalid envelope: missing DSN", { status: 400 });
		if (!allowedDsns.some((allowed) => allowed === dsn$1)) {
			debugLogger.debug.warn(`Sentry tunnel: rejected request with unauthorized DSN (${dsn$1})`);
			return new Response("DSN not allowed", { status: 403 });
		}
		const dsnComponents = dsn.makeDsn(dsn$1);
		if (!dsnComponents) {
			debugLogger.debug.warn(`Could not extract DSN Components from: ${dsn$1}`);
			return new Response("Invalid DSN", { status: 403 });
		}
		const sentryIngestUrl = api.getEnvelopeEndpointWithUrlEncodedAuth(dsnComponents);
		try {
			return await fetch(sentryIngestUrl, {
				method: "POST",
				headers: { "Content-Type": "application/x-sentry-envelope" },
				body
			});
		} catch (error) {
			debugLogger.debug.error("Sentry tunnel: failed to forward envelope", error);
			return new Response("Failed to forward envelope to Sentry", { status: 500 });
		}
	}
	exports.handleTunnelRequest = handleTunnelRequest;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/ipAddress.js
var require_ipAddress = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	function addAutoIpAddressToUser(objWithMaybeUser) {
		if (objWithMaybeUser.user?.ip_address === void 0) objWithMaybeUser.user = {
			...objWithMaybeUser.user,
			ip_address: "{{auto}}"
		};
	}
	function addAutoIpAddressToSession(session) {
		if ("aggregates" in session) {
			if (session.attrs?.["ip_address"] === void 0) session.attrs = {
				...session.attrs,
				ip_address: "{{auto}}"
			};
		} else if (session.ipAddress === void 0) session.ipAddress = "{{auto}}";
	}
	exports.addAutoIpAddressToSession = addAutoIpAddressToSession;
	exports.addAutoIpAddressToUser = addAutoIpAddressToUser;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/sdkMetadata.js
var require_sdkMetadata = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const version = require_version();
	function applySdkMetadata(options, name, names = [name], source = "npm") {
		const sdk = (options._metadata = options._metadata || {}).sdk = options._metadata.sdk || {};
		if (!sdk.name) {
			sdk.name = `sentry.javascript.${name}`;
			sdk.packages = names.map((name2) => ({
				name: `${source}:@sentry/${name2}`,
				version: version.SDK_VERSION
			}));
			sdk.version = version.SDK_VERSION;
		}
	}
	exports.applySdkMetadata = applySdkMetadata;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/traceData.js
var require_traceData = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const index = require_asyncContext();
	const carrier = require_carrier();
	const currentScopes = require_currentScopes();
	const exports$1 = require_exports$1();
	const debugLogger = require_debug_logger();
	const spanUtils = require_spanUtils();
	const hasSpansEnabled = require_hasSpansEnabled();
	const sentryNonRecordingSpan = require_sentryNonRecordingSpan();
	const dynamicSamplingContext = require_dynamicSamplingContext();
	const baggage = require_baggage();
	const tracing = require_tracing();
	function getTraceData(options = {}) {
		const client = options.client || currentScopes.getClient();
		if (!exports$1.isEnabled() || !client) return {};
		const carrier$1 = carrier.getMainCarrier();
		const acs = index.getAsyncContextStrategy(carrier$1);
		if (acs.getTraceData) return acs.getTraceData(options);
		const scope = options.scope || currentScopes.getCurrentScope();
		const span = options.span || spanUtils.getActiveSpan();
		const isTwpPlaceholder = sentryNonRecordingSpan.spanIsNonRecordingSpan(span) && !hasSpansEnabled.hasSpansEnabled(client.getOptions());
		if (!span && currentScopes.hasExternalPropagationContext()) return {};
		const sentryTrace = span && !isTwpPlaceholder ? spanUtils.spanToTraceHeader(span) : scopeToTraceHeader(scope);
		const dsc = span ? dynamicSamplingContext.getDynamicSamplingContextFromSpan(span) : dynamicSamplingContext.getDynamicSamplingContextFromScope(client, scope);
		const baggage$1 = baggage.dynamicSamplingContextToSentryBaggageHeader(dsc);
		if (!tracing.TRACEPARENT_REGEXP.test(sentryTrace)) {
			debugLogger.debug.warn("Invalid sentry-trace data. Cannot generate trace data");
			return {};
		}
		const traceData = {
			"sentry-trace": sentryTrace,
			baggage: baggage$1
		};
		if (options.propagateTraceparent) traceData.traceparent = span && !isTwpPlaceholder ? spanUtils.spanToTraceparentHeader(span) : scopeToTraceparentHeader(scope);
		return traceData;
	}
	function scopeToTraceHeader(scope) {
		const { traceId, sampled, propagationSpanId } = scope.getPropagationContext();
		return tracing.generateSentryTraceHeader(traceId, propagationSpanId, sampled);
	}
	function scopeToTraceparentHeader(scope) {
		const { traceId, sampled, propagationSpanId } = scope.getPropagationContext();
		return tracing.generateTraceparentHeader(traceId, propagationSpanId, sampled);
	}
	exports.getTraceData = getTraceData;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/tracePropagationTargets.js
var require_tracePropagationTargets = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const debugBuild = require_debug_build();
	const debugLogger = require_debug_logger();
	const string = require_string();
	const NOT_PROPAGATED_MESSAGE = "[Tracing] Not injecting trace data for url because it does not match tracePropagationTargets:";
	function shouldPropagateTraceForUrl(url, tracePropagationTargets, decisionMap) {
		if (typeof url !== "string" || !tracePropagationTargets) return true;
		const cachedDecision = decisionMap?.get(url);
		if (cachedDecision !== void 0) {
			debugBuild.DEBUG_BUILD && !cachedDecision && debugLogger.debug.log(NOT_PROPAGATED_MESSAGE, url);
			return cachedDecision;
		}
		const decision = string.stringMatchesSomePattern(url, tracePropagationTargets);
		decisionMap?.set(url, decision);
		debugBuild.DEBUG_BUILD && !decision && debugLogger.debug.log(NOT_PROPAGATED_MESSAGE, url);
		return decision;
	}
	exports.shouldPropagateTraceForUrl = shouldPropagateTraceForUrl;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/meta.js
var require_meta = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const traceData = require_traceData();
	function getTraceMetaTags(traceData$1) {
		return Object.entries(traceData$1 || traceData.getTraceData()).map(([key, value]) => `<meta name="${key}" content="${value}"/>`).join("\n");
	}
	exports.getTraceMetaTags = getTraceMetaTags;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/debounce.js
var require_debounce = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	function debounce(func, wait, options) {
		let callbackReturnValue;
		let timerId;
		let maxTimerId;
		const maxWait = options?.maxWait ? Math.max(options.maxWait, wait) : 0;
		const setTimeoutImpl = options?.setTimeoutImpl || setTimeout;
		function invokeFunc() {
			cancelTimers();
			callbackReturnValue = func();
			return callbackReturnValue;
		}
		function cancelTimers() {
			timerId !== void 0 && clearTimeout(timerId);
			maxTimerId !== void 0 && clearTimeout(maxTimerId);
			timerId = maxTimerId = void 0;
		}
		function flush() {
			if (timerId !== void 0 || maxTimerId !== void 0) return invokeFunc();
			return callbackReturnValue;
		}
		function debounced() {
			if (timerId) clearTimeout(timerId);
			timerId = setTimeoutImpl(invokeFunc, wait);
			if (maxWait && maxTimerId === void 0) maxTimerId = setTimeoutImpl(invokeFunc, maxWait);
			return callbackReturnValue;
		}
		debounced.cancel = cancelTimers;
		debounced.flush = flush;
		return debounced;
	}
	exports.debounce = debounce;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/request.js
var require_request = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const debugBuild = require_debug_build();
	const debugLogger = require_debug_logger();
	const defaultPiiToCollectionOptions = require_defaultPiiToCollectionOptions();
	const filteringSnippets = require_filtering_snippets();
	const filterKeyValueData = require_filterKeyValueData();
	const timer = require_timer();
	const MAX_BODY_BYTE_LENGTH = 1024 * 1024;
	const TEXT_CONTENT_TYPES = [
		"text/",
		"application/json",
		"application/x-www-form-urlencoded",
		"application/xml",
		"application/graphql"
	];
	function getMaxBodyByteLength(maxRequestBodySize) {
		if (maxRequestBodySize === "small") return 1e3;
		if (maxRequestBodySize === "medium") return 1e4;
		return MAX_BODY_BYTE_LENGTH;
	}
	function winterCGHeadersToDict(winterCGHeaders) {
		const headers = {};
		try {
			winterCGHeaders.forEach((value, key) => {
				if (typeof value === "string") headers[key] = value;
			});
		} catch {}
		return headers;
	}
	function headersToDict(reqHeaders) {
		const headers = /* @__PURE__ */ Object.create(null);
		try {
			Object.entries(reqHeaders).forEach(([key, value]) => {
				if (typeof value === "string") headers[key] = value;
				else if (typeof value === "number") headers[key] = String(value);
			});
		} catch {}
		return headers;
	}
	function winterCGRequestToRequestData(req) {
		const headers = winterCGHeadersToDict(req.headers);
		return {
			method: req.method,
			url: req.url,
			query_string: extractQueryParamsFromUrl(req.url),
			headers
		};
	}
	function isTextualContentType(contentType) {
		if (!contentType) return false;
		const lowerContentType = contentType.toLowerCase();
		return TEXT_CONTENT_TYPES.some((type) => lowerContentType.includes(type));
	}
	async function captureBodyFromWinterCGRequest(request, isolationScope, maxRequestBodySize) {
		try {
			const contentType = request.headers.get("content-type");
			if (!isTextualContentType(contentType)) {
				debugBuild.DEBUG_BUILD && debugLogger.debug.log("Skipping body capture for non-textual content type:", contentType);
				return;
			}
			if (!request.body) return;
			const contentLength = request.headers.get("content-length");
			const maxBodySize = getMaxBodyByteLength(maxRequestBodySize);
			if (contentLength) {
				const length = parseInt(contentLength, 10);
				if (!isNaN(length) && length > MAX_BODY_BYTE_LENGTH) {
					debugBuild.DEBUG_BUILD && debugLogger.debug.log("Skipping body capture: body too large", length);
					return;
				}
			}
			const bodyPromise = request.clone().text();
			const timeoutPromise = new Promise((resolve) => {
				timer.safeUnref(setTimeout(() => resolve(null), 2e3));
			});
			const body = await Promise.race([bodyPromise, timeoutPromise]);
			if (body === null) {
				debugBuild.DEBUG_BUILD && debugLogger.debug.log("Timeout reading request body");
				return;
			}
			if (!body) return;
			const bytes = new TextEncoder().encode(body);
			const bodyByteLength = bytes.length;
			let truncatedBody;
			if (bodyByteLength > maxBodySize) truncatedBody = `${new TextDecoder().decode(bytes.slice(0, maxBodySize - 3))}...`;
			else truncatedBody = body;
			isolationScope.setSDKProcessingMetadata({ normalizedRequest: { data: truncatedBody } });
			debugBuild.DEBUG_BUILD && debugLogger.debug.log("Captured request body:", bodyByteLength, "bytes");
		} catch (error) {
			debugBuild.DEBUG_BUILD && debugLogger.debug.error("Error capturing request body:", error);
		}
	}
	function httpRequestToRequestData(request) {
		const headers = request.headers || {};
		const host = (typeof headers["x-forwarded-host"] === "string" ? headers["x-forwarded-host"] : void 0) || (typeof headers.host === "string" ? headers.host : void 0);
		const protocol = (typeof headers["x-forwarded-proto"] === "string" ? headers["x-forwarded-proto"] : void 0) || request.protocol || (request.socket?.encrypted ? "https" : "http");
		const url = request.url || "";
		const absoluteUrl = getAbsoluteUrl({
			url,
			host,
			protocol
		});
		const data = request.body || void 0;
		const cookies = request.cookies;
		return {
			url: absoluteUrl,
			method: request.method,
			query_string: extractQueryParamsFromUrl(url),
			headers: headersToDict(headers),
			cookies,
			data
		};
	}
	function getAbsoluteUrl({ url, protocol, host }) {
		if (url?.startsWith("http")) return url;
		if (url && host) return `${protocol}://${host}${url}`;
	}
	function httpHeadersToSpanAttributes(headers, dataCollection = false, lifecycle = "request") {
		const resolvedDataCollection = typeof dataCollection === "boolean" ? defaultPiiToCollectionOptions.defaultPiiToCollectionOptions(dataCollection) : dataCollection;
		const headerBehavior = lifecycle === "request" ? resolvedDataCollection.httpHeaders.request : resolvedDataCollection.httpHeaders.response;
		const cookieBehavior = resolvedDataCollection.cookies;
		const prefix = `http.${lifecycle}.header.`;
		const spanAttributes = {};
		try {
			const regularHeaders = {};
			for (const [key, value] of Object.entries(headers)) {
				if (value == null) continue;
				const lowerKey = key.toLowerCase();
				if (lowerKey === "cookie" || lowerKey === "set-cookie") {
					if (cookieBehavior === false) continue;
					if (typeof value === "string" && value !== "") {
						const parsed = parseCookieHeader(value, lowerKey === "set-cookie");
						const filtered = filterKeyValueData.filterKeyValueData(parsed, cookieBehavior, filteringSnippets.SENSITIVE_COOKIE_NAME_SNIPPETS);
						for (const [cookieKey, cookieValue] of Object.entries(filtered)) spanAttributes[`${prefix}${normalizeAttributeKey(lowerKey)}.${normalizeAttributeKey(cookieKey)}`] = cookieValue;
					} else spanAttributes[`${prefix}${normalizeAttributeKey(lowerKey)}`] = filteringSnippets.FILTERED_VALUE;
				} else {
					if (headerBehavior === false) continue;
					if (Array.isArray(value)) regularHeaders[lowerKey] = value.map((v) => v != null ? String(v) : v).join(";");
					else if (typeof value === "string") regularHeaders[lowerKey] = value;
				}
			}
			if (headerBehavior !== false) {
				const filtered = filterKeyValueData.filterKeyValueData(regularHeaders, headerBehavior);
				for (const [headerKey, headerValue] of Object.entries(filtered)) spanAttributes[`${prefix}${normalizeAttributeKey(headerKey)}`] = headerValue;
			}
		} catch {}
		return spanAttributes;
	}
	function normalizeAttributeKey(key) {
		return key.replace(/-/g, "_");
	}
	function parseCookieHeader(value, isSetCookie) {
		const semicolonIndex = value.indexOf(";");
		const cookieString = isSetCookie && semicolonIndex !== -1 ? value.substring(0, semicolonIndex) : value;
		const cookies = isSetCookie ? [cookieString] : cookieString.split("; ");
		const result = {};
		for (const cookie of cookies) {
			const equalSignIndex = cookie.indexOf("=");
			const cookieKey = (equalSignIndex !== -1 ? cookie.substring(0, equalSignIndex) : cookie).toLowerCase();
			result[cookieKey] = equalSignIndex !== -1 ? cookie.substring(equalSignIndex + 1) : "";
		}
		return result;
	}
	function extractQueryParamsFromUrl(url) {
		if (!url) return;
		try {
			const queryParams = new URL(url, "http://s.io").search.slice(1);
			return queryParams.length ? queryParams : void 0;
		} catch {
			return;
		}
	}
	exports.MAX_BODY_BYTE_LENGTH = MAX_BODY_BYTE_LENGTH;
	exports.captureBodyFromWinterCGRequest = captureBodyFromWinterCGRequest;
	exports.extractQueryParamsFromUrl = extractQueryParamsFromUrl;
	exports.getMaxBodyByteLength = getMaxBodyByteLength;
	exports.headersToDict = headersToDict;
	exports.httpHeadersToSpanAttributes = httpHeadersToSpanAttributes;
	exports.httpRequestToRequestData = httpRequestToRequestData;
	exports.winterCGHeadersToDict = winterCGHeadersToDict;
	exports.winterCGRequestToRequestData = winterCGRequestToRequestData;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/spanKind.js
var require_spanKind = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const SPAN_KIND = {
		INTERNAL: 0,
		SERVER: 1,
		CLIENT: 2,
		PRODUCER: 3,
		CONSUMER: 4
	};
	const SPAN_KIND_NAME = {
		[SPAN_KIND.INTERNAL]: "INTERNAL",
		[SPAN_KIND.SERVER]: "SERVER",
		[SPAN_KIND.CLIENT]: "CLIENT",
		[SPAN_KIND.PRODUCER]: "PRODUCER",
		[SPAN_KIND.CONSUMER]: "CONSUMER"
	};
	function spanKindToName(kind) {
		return SPAN_KIND_NAME[kind];
	}
	exports.SPAN_KIND = SPAN_KIND;
	exports.spanKindToName = spanKindToName;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/breadcrumbs.js
var require_breadcrumbs = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const currentScopes = require_currentScopes();
	const debugLogger = require_debug_logger();
	const time = require_time();
	const DEFAULT_BREADCRUMBS = 100;
	function addBreadcrumb(breadcrumb, hint) {
		const client = currentScopes.getClient();
		const isolationScope = currentScopes.getIsolationScope();
		if (!client) return;
		const { beforeBreadcrumb = null, maxBreadcrumbs = DEFAULT_BREADCRUMBS } = client.getOptions();
		if (maxBreadcrumbs <= 0) return;
		const mergedBreadcrumb = {
			timestamp: time.dateTimestampInSeconds(),
			...breadcrumb
		};
		const finalBreadcrumb = beforeBreadcrumb ? debugLogger.consoleSandbox(() => beforeBreadcrumb(mergedBreadcrumb, hint)) : mergedBreadcrumb;
		if (finalBreadcrumb === null) return;
		if (client.emit) client.emit("beforeAddBreadcrumb", finalBreadcrumb, hint);
		isolationScope.addBreadcrumb(finalBreadcrumb, maxBreadcrumbs);
	}
	exports.addBreadcrumb = addBreadcrumb;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/functiontostring.js
var require_functiontostring = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const currentScopes = require_currentScopes();
	const integration = require_integration();
	const object = require_object();
	let originalFunctionToString;
	const INTEGRATION_NAME = "FunctionToString";
	const SETUP_CLIENTS = /* @__PURE__ */ new WeakMap();
	const _functionToStringIntegration = (() => {
		return {
			name: INTEGRATION_NAME,
			setupOnce() {
				originalFunctionToString = Function.prototype.toString;
				try {
					Function.prototype.toString = function(...args) {
						const originalFunction = object.getOriginalFunction(this);
						const context = SETUP_CLIENTS.has(currentScopes.getClient()) && originalFunction !== void 0 ? originalFunction : this;
						return originalFunctionToString.apply(context, args);
					};
				} catch {}
			},
			setup(client) {
				SETUP_CLIENTS.set(client, true);
			}
		};
	});
	exports.functionToStringIntegration = integration.defineIntegration(_functionToStringIntegration);
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/eventFilters.js
var require_eventFilters = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const debugBuild = require_debug_build();
	const integration = require_integration();
	const debugLogger = require_debug_logger();
	const eventUtils = require_eventUtils();
	const misc = require_misc();
	const string = require_string();
	const DEFAULT_IGNORE_ERRORS = [
		/^Script error\.?$/,
		/^Javascript error: Script error\.? on line 0$/,
		/^ResizeObserver loop completed with undelivered notifications.$/,
		/^Cannot redefine property: googletag$/,
		/^Can't find variable: gmo$/,
		/^undefined is not an object \(evaluating 'a\.[A-Z]'\)$/,
		/can't redefine non-configurable property "solana"/,
		/vv\(\)\.getRestrictions is not a function/,
		/Can't find variable: _AutofillCallbackHandler/,
		/Object Not Found Matching Id:\d+, MethodName:simulateEvent/,
		/^Java exception was raised during method invocation$/
	];
	const INTEGRATION_NAME = "EventFilters";
	const eventFiltersIntegration = integration.defineIntegration((options = {}) => {
		let mergedOptions;
		return {
			name: INTEGRATION_NAME,
			setup(client) {
				mergedOptions = _mergeOptions(options, client.getOptions());
			},
			processEvent(event, _hint, client) {
				if (!mergedOptions) mergedOptions = _mergeOptions(options, client.getOptions());
				return _shouldDropEvent(event, mergedOptions) ? null : event;
			}
		};
	});
	const inboundFiltersIntegration = integration.defineIntegration(((options = {}) => {
		return {
			...eventFiltersIntegration(options),
			name: "InboundFilters"
		};
	}));
	function _mergeOptions(internalOptions = {}, clientOptions = {}) {
		return {
			allowUrls: [...internalOptions.allowUrls || [], ...clientOptions.allowUrls || []],
			denyUrls: [...internalOptions.denyUrls || [], ...clientOptions.denyUrls || []],
			ignoreErrors: [
				...internalOptions.ignoreErrors || [],
				...clientOptions.ignoreErrors || [],
				...internalOptions.disableErrorDefaults ? [] : DEFAULT_IGNORE_ERRORS
			],
			ignoreTransactions: [...internalOptions.ignoreTransactions || [], ...clientOptions.ignoreTransactions || []]
		};
	}
	function _shouldDropEvent(event, options) {
		if (!event.type) {
			if (_isIgnoredError(event, options.ignoreErrors)) {
				debugBuild.DEBUG_BUILD && debugLogger.debug.warn(`Event dropped due to being matched by \`ignoreErrors\` option.
Event: ${misc.getEventDescription(event)}`);
				return true;
			}
			if (_isUselessError(event)) {
				debugBuild.DEBUG_BUILD && debugLogger.debug.warn(`Event dropped due to not having an error message, error type or stacktrace.
Event: ${misc.getEventDescription(event)}`);
				return true;
			}
			if (_isDeniedUrl(event, options.denyUrls)) {
				debugBuild.DEBUG_BUILD && debugLogger.debug.warn(`Event dropped due to being matched by \`denyUrls\` option.
Event: ${misc.getEventDescription(event)}.
Url: ${_getEventFilterUrl(event)}`);
				return true;
			}
			if (!_isAllowedUrl(event, options.allowUrls)) {
				debugBuild.DEBUG_BUILD && debugLogger.debug.warn(`Event dropped due to not being matched by \`allowUrls\` option.
Event: ${misc.getEventDescription(event)}.
Url: ${_getEventFilterUrl(event)}`);
				return true;
			}
		} else if (event.type === "transaction") {
			if (_isIgnoredTransaction(event, options.ignoreTransactions)) {
				debugBuild.DEBUG_BUILD && debugLogger.debug.warn(`Event dropped due to being matched by \`ignoreTransactions\` option.
Event: ${misc.getEventDescription(event)}`);
				return true;
			}
		}
		return false;
	}
	function _isIgnoredError(event, ignoreErrors) {
		if (!ignoreErrors?.length) return false;
		return eventUtils.getPossibleEventMessages(event).some((message) => string.stringMatchesSomePattern(message, ignoreErrors));
	}
	function _isIgnoredTransaction(event, ignoreTransactions) {
		if (!ignoreTransactions?.length) return false;
		const name = event.transaction;
		return name ? string.stringMatchesSomePattern(name, ignoreTransactions) : false;
	}
	function _isDeniedUrl(event, denyUrls) {
		if (!denyUrls?.length) return false;
		const url = _getEventFilterUrl(event);
		return !url ? false : string.stringMatchesSomePattern(url, denyUrls);
	}
	function _isAllowedUrl(event, allowUrls) {
		if (!allowUrls?.length) return true;
		const url = _getEventFilterUrl(event);
		return !url ? true : string.stringMatchesSomePattern(url, allowUrls);
	}
	function _getLastValidUrl(frames = []) {
		for (let i = frames.length - 1; i >= 0; i--) {
			const frame = frames[i];
			if (frame && frame.filename !== "<anonymous>" && frame.filename !== "[native code]") return frame.filename || null;
		}
		return null;
	}
	function _getEventFilterUrl(event) {
		try {
			const frames = [...event.exception?.values ?? []].reverse().find((value) => value.mechanism?.parent_id === void 0 && value.stacktrace?.frames?.length)?.stacktrace?.frames;
			return frames ? _getLastValidUrl(frames) : null;
		} catch {
			debugBuild.DEBUG_BUILD && debugLogger.debug.error(`Cannot extract url for event ${misc.getEventDescription(event)}`);
			return null;
		}
	}
	function _isUselessError(event) {
		if (!event.exception?.values?.length) return false;
		return !event.message && !event.exception.values.some((value) => value.stacktrace || value.type && value.type !== "Error" || value.value);
	}
	exports.eventFiltersIntegration = eventFiltersIntegration;
	exports.inboundFiltersIntegration = inboundFiltersIntegration;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/aggregate-errors.js
var require_aggregate_errors = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const is = require_is();
	function applyAggregateErrorsToEvent(exceptionFromErrorImplementation, parser, key, limit, event, hint) {
		if (!event.exception?.values || !hint || !is.isInstanceOf(hint.originalException, Error)) return;
		const originalException = event.exception.values.length > 0 ? event.exception.values[event.exception.values.length - 1] : void 0;
		if (originalException) event.exception.values = aggregateExceptionsFromError(exceptionFromErrorImplementation, parser, limit, hint.originalException, key, event.exception.values, originalException, 0);
	}
	function aggregateExceptionsFromError(exceptionFromErrorImplementation, parser, limit, error, key, prevExceptions, exception, exceptionId) {
		if (prevExceptions.length >= limit + 1) return prevExceptions;
		let newExceptions = [...prevExceptions];
		if (is.isInstanceOf(error[key], Error)) {
			applyExceptionGroupFieldsForParentException(exception, exceptionId, error);
			const newException = exceptionFromErrorImplementation(parser, error[key]);
			const newExceptionId = newExceptions.length;
			applyExceptionGroupFieldsForChildException(newException, key, newExceptionId, exceptionId);
			newExceptions = aggregateExceptionsFromError(exceptionFromErrorImplementation, parser, limit, error[key], key, [newException, ...newExceptions], newException, newExceptionId);
		}
		if (isExceptionGroup(error)) error.errors.forEach((childError, i) => {
			if (is.isInstanceOf(childError, Error)) {
				applyExceptionGroupFieldsForParentException(exception, exceptionId, error);
				const newException = exceptionFromErrorImplementation(parser, childError);
				const newExceptionId = newExceptions.length;
				applyExceptionGroupFieldsForChildException(newException, `errors[${i}]`, newExceptionId, exceptionId);
				newExceptions = aggregateExceptionsFromError(exceptionFromErrorImplementation, parser, limit, childError, key, [newException, ...newExceptions], newException, newExceptionId);
			}
		});
		return newExceptions;
	}
	function isExceptionGroup(error) {
		return Array.isArray(error.errors);
	}
	function applyExceptionGroupFieldsForParentException(exception, exceptionId, error) {
		exception.mechanism = {
			handled: true,
			type: "auto.core.linked_errors",
			...isExceptionGroup(error) && { is_exception_group: true },
			...exception.mechanism,
			exception_id: exceptionId
		};
	}
	function applyExceptionGroupFieldsForChildException(exception, source, exceptionId, parentId) {
		exception.mechanism = {
			handled: true,
			...exception.mechanism,
			type: "chained",
			source,
			exception_id: exceptionId,
			parent_id: parentId
		};
	}
	exports.applyAggregateErrorsToEvent = applyAggregateErrorsToEvent;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/eventbuilder.js
var require_eventbuilder = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const is = require_is();
	const misc = require_misc();
	const normalize = require_normalize();
	const object = require_object();
	function parseStackFrames(stackParser, error) {
		return stackParser(error.stack || "", 1);
	}
	function hasSentryFetchUrlHost(error) {
		return is.isError(error) && "__sentry_fetch_url_host__" in error && typeof error.__sentry_fetch_url_host__ === "string";
	}
	function _enhanceErrorWithSentryInfo(error) {
		if (hasSentryFetchUrlHost(error)) return `${error.message} (${error.__sentry_fetch_url_host__})`;
		return error.message;
	}
	function exceptionFromError(stackParser, error) {
		const exception = {
			type: error.name || error.constructor.name,
			value: _enhanceErrorWithSentryInfo(error)
		};
		const frames = parseStackFrames(stackParser, error);
		if (frames.length) exception.stacktrace = { frames };
		return exception;
	}
	function getErrorPropertyFromObject(obj) {
		for (const prop in obj) if (Object.prototype.hasOwnProperty.call(obj, prop)) {
			const value = obj[prop];
			if (value instanceof Error) return value;
		}
	}
	function getMessageForObject(exception) {
		if ("name" in exception && typeof exception.name === "string") {
			let message = `'${exception.name}' captured as exception`;
			if ("message" in exception && typeof exception.message === "string") message += ` with message '${exception.message}'`;
			return message;
		} else if ("message" in exception && typeof exception.message === "string") return exception.message;
		const keys = object.extractExceptionKeysForMessage(exception);
		if (is.isErrorEvent(exception)) return `Event \`ErrorEvent\` captured as exception with message \`${exception.message}\``;
		const className = getObjectClassName(exception);
		return `${className && className !== "Object" ? `'${className}'` : "Object"} captured as exception with keys: ${keys}`;
	}
	function getObjectClassName(obj) {
		try {
			const prototype = Object.getPrototypeOf(obj);
			return prototype ? prototype.constructor.name : void 0;
		} catch {}
	}
	function getException(client, mechanism, exception, hint) {
		if (is.isError(exception)) return [exception, void 0];
		mechanism.synthetic = true;
		if (is.isPlainObject(exception)) {
			const normalizeDepth = client?.getOptions().normalizeDepth;
			const extras = { ["__serialized__"]: normalize.normalizeToSize(exception, normalizeDepth) };
			const errorFromProp = getErrorPropertyFromObject(exception);
			if (errorFromProp) return [errorFromProp, extras];
			const message = getMessageForObject(exception);
			const ex2 = hint?.syntheticException || new Error(message);
			ex2.message = message;
			return [ex2, extras];
		}
		const ex = hint?.syntheticException || new Error(exception);
		ex.message = `${exception}`;
		return [ex, void 0];
	}
	function eventFromUnknownInput(client, stackParser, exception, hint) {
		const mechanism = hint?.data && hint.data.mechanism || {
			handled: true,
			type: "generic"
		};
		const [ex, extras] = getException(client, mechanism, exception, hint);
		const event = { exception: { values: [exceptionFromError(stackParser, ex)] } };
		if (extras) event.extra = extras;
		misc.addExceptionTypeValue(event, void 0, void 0);
		misc.addExceptionMechanism(event, mechanism);
		return {
			...event,
			event_id: hint?.event_id
		};
	}
	function eventFromMessage(stackParser, message, level = "info", hint, attachStacktrace) {
		const event = {
			event_id: hint?.event_id,
			level
		};
		if (attachStacktrace && hint?.syntheticException) {
			const frames = parseStackFrames(stackParser, hint.syntheticException);
			if (frames.length) {
				event.exception = { values: [{
					value: message,
					stacktrace: { frames }
				}] };
				misc.addExceptionMechanism(event, { synthetic: true });
			}
		}
		if (is.isParameterizedString(message)) {
			const { __sentry_template_string__, __sentry_template_values__ } = message;
			event.logentry = {
				message: __sentry_template_string__,
				params: __sentry_template_values__
			};
			return event;
		}
		event.message = message;
		return event;
	}
	exports._enhanceErrorWithSentryInfo = _enhanceErrorWithSentryInfo;
	exports.eventFromMessage = eventFromMessage;
	exports.eventFromUnknownInput = eventFromUnknownInput;
	exports.exceptionFromError = exceptionFromError;
	exports.parseStackFrames = parseStackFrames;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/linkederrors.js
var require_linkederrors = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const integration = require_integration();
	const aggregateErrors = require_aggregate_errors();
	const eventbuilder = require_eventbuilder();
	const DEFAULT_KEY = "cause";
	const DEFAULT_LIMIT = 5;
	const INTEGRATION_NAME = "LinkedErrors";
	const _linkedErrorsIntegration = ((options = {}) => {
		const limit = options.limit || DEFAULT_LIMIT;
		const key = options.key || DEFAULT_KEY;
		return {
			name: INTEGRATION_NAME,
			preprocessEvent(event, hint, client) {
				const options2 = client.getOptions();
				aggregateErrors.applyAggregateErrorsToEvent(eventbuilder.exceptionFromError, options2.stackParser, key, limit, event, hint);
			}
		};
	});
	exports.linkedErrorsIntegration = integration.defineIntegration(_linkedErrorsIntegration);
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/metadata.js
var require_metadata = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const worldwide = require_worldwide();
	const filenameMetadataMap = /* @__PURE__ */ new Map();
	const parsedStacks = /* @__PURE__ */ new Set();
	function getFilenameToMetadataMap(parser) {
		if (!worldwide.GLOBAL_OBJ._sentryModuleMetadata) return {};
		const filenameMap = {};
		for (const stack of Object.keys(worldwide.GLOBAL_OBJ._sentryModuleMetadata)) {
			const metadata = worldwide.GLOBAL_OBJ._sentryModuleMetadata[stack];
			const frames = parser(stack);
			for (const frame of frames.reverse()) if (frame.filename) {
				filenameMap[frame.filename] = metadata;
				break;
			}
		}
		return filenameMap;
	}
	function ensureMetadataStacksAreParsed(parser) {
		if (!worldwide.GLOBAL_OBJ._sentryModuleMetadata) return;
		for (const stack of Object.keys(worldwide.GLOBAL_OBJ._sentryModuleMetadata)) {
			const metadata = worldwide.GLOBAL_OBJ._sentryModuleMetadata[stack];
			if (parsedStacks.has(stack)) continue;
			parsedStacks.add(stack);
			const frames = parser(stack);
			for (const frame of frames.reverse()) if (frame.filename) {
				filenameMetadataMap.set(frame.filename, metadata);
				break;
			}
		}
	}
	function getMetadataForUrl(parser, filename) {
		ensureMetadataStacksAreParsed(parser);
		return filenameMetadataMap.get(filename);
	}
	function addMetadataToStackFrames(parser, event) {
		event.exception?.values?.forEach((exception) => {
			exception.stacktrace?.frames?.forEach((frame) => {
				if (!frame.filename || frame.module_metadata) return;
				const metadata = getMetadataForUrl(parser, frame.filename);
				if (metadata) frame.module_metadata = metadata;
			});
		});
	}
	function stripMetadataFromStackFrames(event) {
		event.exception?.values?.forEach((exception) => {
			exception.stacktrace?.frames?.forEach((frame) => {
				delete frame.module_metadata;
			});
		});
	}
	exports.addMetadataToStackFrames = addMetadataToStackFrames;
	exports.getFilenameToMetadataMap = getFilenameToMetadataMap;
	exports.getMetadataForUrl = getMetadataForUrl;
	exports.stripMetadataFromStackFrames = stripMetadataFromStackFrames;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/moduleMetadata.js
var require_moduleMetadata = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const integration = require_integration();
	const metadata = require_metadata();
	const envelope = require_envelope$4();
	exports.moduleMetadataIntegration = integration.defineIntegration(() => {
		return {
			name: "ModuleMetadata",
			setup(client) {
				client.on("beforeEnvelope", (envelope$1) => {
					envelope.forEachEnvelopeItem(envelope$1, (item, type) => {
						if (type === "event") {
							const event = Array.isArray(item) ? item[1] : void 0;
							if (event) {
								metadata.stripMetadataFromStackFrames(event);
								item[1] = event;
							}
						}
					});
				});
				client.on("applyFrameMetadata", (event) => {
					if (event.type) return;
					const stackParser = client.getOptions().stackParser;
					metadata.addMetadataToStackFrames(stackParser, event);
				});
			}
		};
	});
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/vendor/getIpAddress.js
var require_getIpAddress = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const ipHeaderNames = [
		"X-Client-IP",
		"X-Forwarded-For",
		"Fly-Client-IP",
		"CF-Connecting-IP",
		"Fastly-Client-Ip",
		"True-Client-Ip",
		"X-Real-IP",
		"X-Cluster-Client-IP",
		"X-Forwarded",
		"Forwarded-For",
		"Forwarded",
		"X-Vercel-Forwarded-For"
	];
	function getClientIPAddress(headers) {
		const lowerCaseHeaders = {};
		for (const key of Object.keys(headers)) lowerCaseHeaders[key.toLowerCase()] = headers[key];
		return ipHeaderNames.map((headerName) => {
			const rawValue = lowerCaseHeaders[headerName.toLowerCase()];
			const value = Array.isArray(rawValue) ? rawValue.join(";") : rawValue;
			if (headerName === "Forwarded") return parseForwardedHeader(value);
			return value?.split(",").map((v) => v.trim());
		}).reduce((acc, val) => {
			if (!val) return acc;
			return acc.concat(val);
		}, []).find((ip) => ip !== null && isIP(ip)) || null;
	}
	function parseForwardedHeader(value) {
		if (!value) return null;
		for (const part of value.split(";")) if (part.startsWith("for=")) return part.slice(4);
		return null;
	}
	function isIP(str) {
		return /(?:^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$)|(?:^(?:(?:[a-fA-F\d]{1,4}:){7}(?:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){6}(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){5}(?::(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,2}|:)|(?:[a-fA-F\d]{1,4}:){4}(?:(?::[a-fA-F\d]{1,4}){0,1}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,3}|:)|(?:[a-fA-F\d]{1,4}:){3}(?:(?::[a-fA-F\d]{1,4}){0,2}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,4}|:)|(?:[a-fA-F\d]{1,4}:){2}(?:(?::[a-fA-F\d]{1,4}){0,3}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,5}|:)|(?:[a-fA-F\d]{1,4}:){1}(?:(?::[a-fA-F\d]{1,4}){0,4}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,6}|:)|(?::(?:(?::[a-fA-F\d]{1,4}){0,5}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,7}|:)))(?:%[0-9a-zA-Z]{1,})?$)/.test(str);
	}
	exports.getClientIPAddress = getClientIPAddress;
	exports.ipHeaderNames = ipHeaderNames;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/requestdata.js
var require_requestdata = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const currentScopes = require_currentScopes();
	const integration = require_integration();
	const semanticAttributes = require_semanticAttributes();
	const cookie = require_cookie();
	const request = require_request();
	const getIpAddress = require_getIpAddress();
	const captureSpan = require_captureSpan();
	const INTEGRATION_NAME = "RequestData";
	const _requestDataIntegration = ((options = {}) => {
		function resolveIncludeAndDataCollection(client) {
			const dc = client.getDataCollectionOptions();
			const dataCollection = {
				...dc,
				...options.include?.cookies === true && dc.cookies === false && { cookies: true },
				...options.include?.headers === true && dc.httpHeaders.request === false && { httpHeaders: {
					...dc.httpHeaders,
					request: true
				} }
			};
			return {
				dataCollection,
				include: {
					cookies: dataCollection.cookies !== false,
					data: true,
					headers: dataCollection.httpHeaders.request !== false,
					ip: dataCollection.userInfo,
					query_string: dataCollection.queryParams !== false,
					url: true,
					...options.include
				}
			};
		}
		return {
			name: INTEGRATION_NAME,
			processEvent(event, _hint, client) {
				const { sdkProcessingMetadata = {} } = event;
				const { normalizedRequest, ipAddress } = sdkProcessingMetadata;
				const { include } = resolveIncludeAndDataCollection(client);
				if (normalizedRequest) addNormalizedRequestDataToEvent(event, normalizedRequest, { ipAddress }, include);
				return event;
			},
			processSegmentSpan(span, client) {
				const { sdkProcessingMetadata = {} } = currentScopes.getIsolationScope().getScopeData();
				const { normalizedRequest, ipAddress } = sdkProcessingMetadata;
				if (!normalizedRequest) return;
				const { include, dataCollection } = resolveIncludeAndDataCollection(client);
				addNormalizedRequestDataToSpan(span, normalizedRequest, ipAddress, include, dataCollection);
			}
		};
	});
	const requestDataIntegration = integration.defineIntegration(_requestDataIntegration);
	function addNormalizedRequestDataToEvent(event, req, additionalData, include) {
		event.request = {
			...event.request,
			...extractNormalizedRequestData(req, include)
		};
		if (include.ip) {
			const ip = req.headers && getIpAddress.getClientIPAddress(req.headers) || additionalData.ipAddress;
			if (ip) event.user = {
				...event.user,
				ip_address: ip
			};
		}
	}
	function addNormalizedRequestDataToSpan(span, normalizedRequest, ipAddress, include, dataCollection) {
		const requestData = extractNormalizedRequestData(normalizedRequest, include);
		const attributes = {};
		if (requestData.url) attributes["url.full"] = requestData.url;
		if (requestData.method) attributes["http.request.method"] = requestData.method;
		if (requestData.query_string) attributes["url.query"] = normalizeQueryString(requestData.query_string);
		captureSpan.safeSetSpanJSONAttributes(span, attributes);
		if (requestData.cookies && Object.keys(requestData.cookies).length > 0) {
			const cookieString = Object.entries(requestData.cookies).map(([name, value]) => `${name}=${value}`).join("; ");
			const cookieAttributes = request.httpHeadersToSpanAttributes({ cookie: cookieString }, dataCollection, "request");
			captureSpan.safeSetSpanJSONAttributes(span, cookieAttributes);
		}
		if (requestData.headers) {
			const headerAttributes = request.httpHeadersToSpanAttributes(requestData.headers, dataCollection, "request");
			captureSpan.safeSetSpanJSONAttributes(span, headerAttributes);
		}
		if (requestData.data != null) {
			const serialized = typeof requestData.data === "string" ? requestData.data : JSON.stringify(requestData.data);
			if (serialized) captureSpan.safeSetSpanJSONAttributes(span, { "http.request.body.data": serialized });
		}
		if (include.ip) {
			const ip = normalizedRequest.headers && getIpAddress.getClientIPAddress(normalizedRequest.headers) || ipAddress || void 0;
			if (ip) captureSpan.safeSetSpanJSONAttributes(span, { [semanticAttributes.SEMANTIC_ATTRIBUTE_USER_IP_ADDRESS]: ip });
		}
	}
	function extractNormalizedRequestData(normalizedRequest, include) {
		const requestData = {};
		const headers = { ...normalizedRequest.headers };
		if (include.headers) {
			requestData.headers = headers;
			if (!include.cookies) delete headers.cookie;
			if (!include.ip) {
				const ipHeaderNamesLower = new Set(getIpAddress.ipHeaderNames.map((name) => name.toLowerCase()));
				for (const key of Object.keys(headers)) if (ipHeaderNamesLower.has(key.toLowerCase())) delete headers[key];
			}
		}
		requestData.method = normalizedRequest.method;
		if (include.url) requestData.url = normalizedRequest.url;
		if (include.cookies) requestData.cookies = normalizedRequest.cookies || (headers?.cookie ? cookie.parseCookie(headers.cookie) : void 0) || {};
		if (include.query_string) requestData.query_string = normalizedRequest.query_string;
		if (include.data) requestData.data = normalizedRequest.data;
		return requestData;
	}
	function normalizeQueryString(queryString) {
		if (typeof queryString === "string") return queryString || void 0;
		return (Array.isArray(queryString) ? queryString : Object.entries(queryString)).map(([key, value]) => `${key}=${value}`).join("&") || void 0;
	}
	exports.requestDataIntegration = requestDataIntegration;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/instrument/console.js
var require_console$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const debugBuild = require_debug_build();
	const debugLogger = require_debug_logger();
	const object = require_object();
	const string = require_string();
	const worldwide = require_worldwide();
	const handlers = require_handlers$1();
	const _filter = /* @__PURE__ */ new Set([]);
	function addConsoleInstrumentationHandler(handler) {
		const type = "console";
		const removeHandler = handlers.addHandler(type, handler);
		handlers.maybeInstrument(type, instrumentConsole);
		return removeHandler;
	}
	function addConsoleInstrumentationFilter(filter) {
		for (const f of filter) _filter.add(f);
		return () => {
			for (const f of filter) _filter.delete(f);
		};
	}
	function instrumentConsole() {
		if (!("console" in worldwide.GLOBAL_OBJ)) return;
		debugLogger.CONSOLE_LEVELS.forEach(function(level) {
			if (!(level in worldwide.GLOBAL_OBJ.console)) return;
			object.fill(worldwide.GLOBAL_OBJ.console, level, function(originalConsoleMethod) {
				debugLogger.originalConsoleMethods[level] = originalConsoleMethod;
				return function(...args) {
					const firstArg = args[0];
					const log = debugLogger.originalConsoleMethods[level];
					const isFiltered = _filter.size && typeof firstArg === "string" && string.stringMatchesSomePattern(firstArg, _filter);
					if (!isFiltered) handlers.triggerHandlers("console", {
						args,
						level
					});
					if (!isFiltered || debugBuild.DEBUG_BUILD && debugLogger.debug.isEnabled()) log?.apply(worldwide.GLOBAL_OBJ.console, args);
				};
			});
		});
	}
	exports.addConsoleInstrumentationFilter = addConsoleInstrumentationFilter;
	exports.addConsoleInstrumentationHandler = addConsoleInstrumentationHandler;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/severity.js
var require_severity = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	function severityLevelFromString(level) {
		return level === "warn" ? "warning" : [
			"fatal",
			"error",
			"warning",
			"log",
			"info",
			"debug"
		].includes(level) ? level : "log";
	}
	exports.severityLevelFromString = severityLevelFromString;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/captureconsole.js
var require_captureconsole = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const currentScopes = require_currentScopes();
	const exports$1 = require_exports$1();
	const console = require_console$1();
	const integration = require_integration();
	const debugLogger = require_debug_logger();
	const misc = require_misc();
	const severity = require_severity();
	const string = require_string();
	const worldwide = require_worldwide();
	const INTEGRATION_NAME = "CaptureConsole";
	const _captureConsoleIntegration = ((options = {}) => {
		const levels = options.levels || debugLogger.CONSOLE_LEVELS;
		const handled = options.handled ?? true;
		return {
			name: INTEGRATION_NAME,
			setup(client) {
				if (!("console" in worldwide.GLOBAL_OBJ)) return;
				console.addConsoleInstrumentationHandler(({ args, level }) => {
					if (currentScopes.getClient() !== client || !levels.includes(level)) return;
					consoleHandler(args, level, handled);
				});
			}
		};
	});
	const captureConsoleIntegration = integration.defineIntegration(_captureConsoleIntegration);
	function consoleHandler(args, level, handled) {
		const severityLevel = severity.severityLevelFromString(level);
		const syntheticException = /* @__PURE__ */ new Error();
		const captureContext = {
			level: severity.severityLevelFromString(level),
			extra: { arguments: args }
		};
		currentScopes.withScope((scope) => {
			scope.addEventProcessor((event) => {
				event.logger = "console";
				misc.addExceptionMechanism(event, {
					handled,
					type: "auto.core.capture_console"
				});
				return event;
			});
			if (level === "assert") {
				if (!args[0]) {
					const message2 = `Assertion failed: ${string.safeJoin(args.slice(1), " ") || "console.assert"}`;
					scope.setExtra("arguments", args.slice(1));
					scope.captureMessage(message2, severityLevel, {
						captureContext,
						syntheticException
					});
				}
				return;
			}
			const error = args.find((arg) => arg instanceof Error);
			if (error) {
				exports$1.captureException(error, captureContext);
				return;
			}
			const message = string.safeJoin(args, " ");
			scope.captureMessage(message, severityLevel, {
				captureContext,
				syntheticException
			});
		});
	}
	exports.captureConsoleIntegration = captureConsoleIntegration;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/dedupe.js
var require_dedupe = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const debugBuild = require_debug_build();
	const integration = require_integration();
	const debugLogger = require_debug_logger();
	const stacktrace = require_stacktrace();
	const INTEGRATION_NAME = "Dedupe";
	const _dedupeIntegration = (() => {
		let previousEvent;
		return {
			name: INTEGRATION_NAME,
			processEvent(currentEvent) {
				if (currentEvent.type) return currentEvent;
				try {
					if (_shouldDropEvent(currentEvent, previousEvent)) {
						debugBuild.DEBUG_BUILD && debugLogger.debug.warn("Event dropped due to being a duplicate of previously captured event.");
						return null;
					}
				} catch {}
				return previousEvent = currentEvent;
			}
		};
	});
	const dedupeIntegration = integration.defineIntegration(_dedupeIntegration);
	function _shouldDropEvent(currentEvent, previousEvent) {
		if (!previousEvent) return false;
		if (_isSameMessageEvent(currentEvent, previousEvent)) return true;
		if (_isSameExceptionEvent(currentEvent, previousEvent)) return true;
		return false;
	}
	function _isSameMessageEvent(currentEvent, previousEvent) {
		const currentMessage = currentEvent.message;
		const previousMessage = previousEvent.message;
		if (!currentMessage && !previousMessage) return false;
		if (currentMessage && !previousMessage || !currentMessage && previousMessage) return false;
		if (currentMessage !== previousMessage) return false;
		if (!_isSameFingerprint(currentEvent, previousEvent)) return false;
		if (!_isSameStacktrace(currentEvent, previousEvent)) return false;
		return true;
	}
	function _isSameExceptionEvent(currentEvent, previousEvent) {
		const previousException = _getExceptionFromEvent(previousEvent);
		const currentException = _getExceptionFromEvent(currentEvent);
		if (!previousException || !currentException) return false;
		if (previousException.type !== currentException.type || previousException.value !== currentException.value) return false;
		if (!_isSameFingerprint(currentEvent, previousEvent)) return false;
		if (!_isSameStacktrace(currentEvent, previousEvent)) return false;
		return true;
	}
	function _isSameStacktrace(currentEvent, previousEvent) {
		let currentFrames = stacktrace.getFramesFromEvent(currentEvent);
		let previousFrames = stacktrace.getFramesFromEvent(previousEvent);
		if (!currentFrames && !previousFrames) return true;
		if (currentFrames && !previousFrames || !currentFrames && previousFrames) return false;
		currentFrames = currentFrames;
		previousFrames = previousFrames;
		if (previousFrames.length !== currentFrames.length) return false;
		for (let i = 0; i < previousFrames.length; i++) {
			const frameA = previousFrames[i];
			const frameB = currentFrames[i];
			if (frameA.filename !== frameB.filename || frameA.lineno !== frameB.lineno || frameA.colno !== frameB.colno || frameA.function !== frameB.function) return false;
		}
		return true;
	}
	function _isSameFingerprint(currentEvent, previousEvent) {
		let currentFingerprint = currentEvent.fingerprint;
		let previousFingerprint = previousEvent.fingerprint;
		if (!currentFingerprint && !previousFingerprint) return true;
		if (currentFingerprint && !previousFingerprint || !currentFingerprint && previousFingerprint) return false;
		currentFingerprint = currentFingerprint;
		previousFingerprint = previousFingerprint;
		try {
			return !!(currentFingerprint.join("") === previousFingerprint.join(""));
		} catch {
			return false;
		}
	}
	function _getExceptionFromEvent(event) {
		return event.exception?.values?.[0];
	}
	exports._shouldDropEvent = _shouldDropEvent;
	exports.dedupeIntegration = dedupeIntegration;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/extraerrordata.js
var require_extraerrordata = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const debugBuild = require_debug_build();
	const integration = require_integration();
	const debugLogger = require_debug_logger();
	const is = require_is();
	const normalize = require_normalize();
	const normalizationHints = require_normalizationHints();
	const string = require_string();
	const INTEGRATION_NAME = "ExtraErrorData";
	const _extraErrorDataIntegration = ((options = {}) => {
		const { depth = 3, captureErrorCause = true } = options;
		return {
			name: INTEGRATION_NAME,
			processEvent(event, hint, client) {
				const { maxValueLength } = client.getOptions();
				return _enhanceEventWithErrorData(event, hint, depth, captureErrorCause, maxValueLength);
			}
		};
	});
	const extraErrorDataIntegration = integration.defineIntegration(_extraErrorDataIntegration);
	function _enhanceEventWithErrorData(event, hint = {}, depth, captureErrorCause, maxValueLength) {
		if (!hint.originalException || !is.isError(hint.originalException)) return event;
		const exceptionName = hint.originalException.name || hint.originalException.constructor.name;
		const errorData = _extractErrorData(hint.originalException, captureErrorCause, maxValueLength);
		if (errorData) {
			const contexts = { ...event.contexts };
			const normalizedErrorData = normalize.normalize(errorData, depth);
			if (is.isPlainObject(normalizedErrorData)) {
				normalizationHints.setSkipNormalizationHint(normalizedErrorData);
				contexts[exceptionName] = normalizedErrorData;
			}
			return {
				...event,
				contexts
			};
		}
		return event;
	}
	function _extractErrorData(error, captureErrorCause, maxValueLength) {
		try {
			const nativeKeys = [
				"name",
				"message",
				"stack",
				"line",
				"column",
				"fileName",
				"lineNumber",
				"columnNumber",
				"toJSON"
			];
			const extraErrorInfo = {};
			for (const key of Object.keys(error)) {
				if (nativeKeys.indexOf(key) !== -1) continue;
				const value = error[key];
				extraErrorInfo[key] = is.isError(value) || typeof value === "string" ? maxValueLength ? string.truncate(`${value}`, maxValueLength) : `${value}` : value;
			}
			if (captureErrorCause && error.cause !== void 0) if (is.isError(error.cause)) extraErrorInfo.cause = { [error.cause.name || error.cause.constructor.name]: _extractErrorData(error.cause, false, maxValueLength) };
			else extraErrorInfo.cause = error.cause;
			if (typeof error.toJSON === "function") {
				const serializedError = error.toJSON();
				for (const key of Object.keys(serializedError)) {
					const value = serializedError[key];
					extraErrorInfo[key] = is.isError(value) ? value.toString() : value;
				}
			}
			return extraErrorInfo;
		} catch (oO) {
			debugBuild.DEBUG_BUILD && debugLogger.debug.error("Unable to extract extra data from the Error object:", oO);
		}
		return null;
	}
	exports.extraErrorDataIntegration = extraErrorDataIntegration;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/path.js
var require_path = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	function normalizeArray(parts, allowAboveRoot) {
		let up = 0;
		for (let i = parts.length - 1; i >= 0; i--) {
			const last = parts[i];
			if (last === ".") parts.splice(i, 1);
			else if (last === "..") {
				parts.splice(i, 1);
				up++;
			} else if (up) {
				parts.splice(i, 1);
				up--;
			}
		}
		if (allowAboveRoot) for (; up--;) parts.unshift("..");
		return parts;
	}
	const splitPathRe = /^(\S+:\\|\/?)([\s\S]*?)((?:\.{1,2}|[^/\\]+?|)(\.[^./\\]*|))(?:[/\\]*)$/;
	function splitPath(filename) {
		const truncated = filename.length > 1024 ? `<truncated>${filename.slice(-1024)}` : filename;
		const parts = splitPathRe.exec(truncated);
		return parts ? parts.slice(1) : [];
	}
	function resolve(...args) {
		let resolvedPath = "";
		let resolvedAbsolute = false;
		for (let i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
			const path = i >= 0 ? args[i] : "/";
			if (!path) continue;
			resolvedPath = `${path}/${resolvedPath}`;
			resolvedAbsolute = path.charAt(0) === "/";
		}
		resolvedPath = normalizeArray(resolvedPath.split("/").filter((p) => !!p), !resolvedAbsolute).join("/");
		return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
	}
	function trim(arr) {
		let start = 0;
		for (; start < arr.length; start++) if (arr[start] !== "") break;
		let end = arr.length - 1;
		for (; end >= 0; end--) if (arr[end] !== "") break;
		if (start > end) return [];
		return arr.slice(start, end - start + 1);
	}
	function relative(from, to) {
		from = resolve(from).slice(1);
		to = resolve(to).slice(1);
		const fromParts = trim(from.split("/"));
		const toParts = trim(to.split("/"));
		const length = Math.min(fromParts.length, toParts.length);
		let samePartsLength = length;
		for (let i = 0; i < length; i++) if (fromParts[i] !== toParts[i]) {
			samePartsLength = i;
			break;
		}
		let outputParts = [];
		for (let i = samePartsLength; i < fromParts.length; i++) outputParts.push("..");
		outputParts = outputParts.concat(toParts.slice(samePartsLength));
		return outputParts.join("/");
	}
	function normalizePath(path) {
		const isPathAbsolute = isAbsolute(path);
		const trailingSlash = path.slice(-1) === "/";
		let normalizedPath = normalizeArray(path.split("/").filter((p) => !!p), !isPathAbsolute).join("/");
		if (!normalizedPath && !isPathAbsolute) normalizedPath = ".";
		if (normalizedPath && trailingSlash) normalizedPath += "/";
		return (isPathAbsolute ? "/" : "") + normalizedPath;
	}
	function isAbsolute(path) {
		return path.charAt(0) === "/";
	}
	function join(...args) {
		return normalizePath(args.join("/"));
	}
	function dirname(path) {
		const result = splitPath(path);
		const root = result[0] || "";
		let dir = result[1];
		if (!root && !dir) return ".";
		if (dir) dir = dir.slice(0, dir.length - 1);
		return root + dir;
	}
	function basename(path, ext) {
		let f = splitPath(path)[2] || "";
		if (ext && f.slice(ext.length * -1) === ext) f = f.slice(0, f.length - ext.length);
		return f;
	}
	exports.basename = basename;
	exports.dirname = dirname;
	exports.isAbsolute = isAbsolute;
	exports.join = join;
	exports.normalizePath = normalizePath;
	exports.relative = relative;
	exports.resolve = resolve;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/rewriteframes.js
var require_rewriteframes = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const integration = require_integration();
	const path = require_path();
	const worldwide = require_worldwide();
	const INTEGRATION_NAME = "RewriteFrames";
	const rewriteFramesIntegration = integration.defineIntegration((options = {}) => {
		const root = options.root;
		const prefix = options.prefix || "app:///";
		const isBrowser = "window" in worldwide.GLOBAL_OBJ && !!worldwide.GLOBAL_OBJ.window;
		const iteratee = options.iteratee || generateIteratee({
			isBrowser,
			root,
			prefix
		});
		function _processExceptionsEvent(event) {
			try {
				return {
					...event,
					exception: {
						...event.exception,
						values: event.exception.values.map((value) => ({
							...value,
							...value.stacktrace && { stacktrace: _processStacktrace(value.stacktrace) }
						}))
					}
				};
			} catch {
				return event;
			}
		}
		function _processStacktrace(stacktrace) {
			return {
				...stacktrace,
				frames: stacktrace?.frames?.map((f) => iteratee(f))
			};
		}
		return {
			name: INTEGRATION_NAME,
			processEvent(originalEvent) {
				let processedEvent = originalEvent;
				if (originalEvent.exception && Array.isArray(originalEvent.exception.values)) processedEvent = _processExceptionsEvent(processedEvent);
				return processedEvent;
			}
		};
	});
	function generateIteratee({ isBrowser, root, prefix }) {
		return (frame) => {
			if (!frame.filename) return frame;
			const isWindowsFrame = /^[a-zA-Z]:\\/.test(frame.filename) || frame.filename.includes("\\") && !frame.filename.includes("/");
			const startsWithSlash = /^\//.test(frame.filename);
			if (isBrowser) {
				if (root) {
					const oldFilename = frame.filename;
					if (oldFilename.indexOf(root) === 0) frame.filename = oldFilename.replace(root, prefix);
				}
			} else if (isWindowsFrame || startsWithSlash) {
				const filename = isWindowsFrame ? frame.filename.replace(/^[a-zA-Z]:/, "").replace(/\\/g, "/") : frame.filename;
				frame.filename = `${prefix}${root ? path.relative(root, filename) : path.basename(filename)}`;
			}
			return frame;
		};
	}
	exports.generateIteratee = generateIteratee;
	exports.rewriteFramesIntegration = rewriteFramesIntegration;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/supabase.js
var require_supabase = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const breadcrumbs = require_breadcrumbs();
	const currentScopes = require_currentScopes();
	const debugBuild = require_debug_build();
	const exports$1 = require_exports$1();
	const integration = require_integration();
	const semanticAttributes = require_semanticAttributes();
	const debugLogger = require_debug_logger();
	const is = require_is();
	const misc = require_misc();
	const spanstatus = require_spanstatus();
	const trace = require_trace();
	const AUTH_OPERATIONS_TO_INSTRUMENT = [
		"reauthenticate",
		"signInAnonymously",
		"signInWithOAuth",
		"signInWithIdToken",
		"signInWithOtp",
		"signInWithPassword",
		"signInWithSSO",
		"signOut",
		"signUp",
		"verifyOtp"
	];
	const AUTH_ADMIN_OPERATIONS_TO_INSTRUMENT = [
		"createUser",
		"deleteUser",
		"listUsers",
		"getUserById",
		"updateUserById",
		"inviteUserByEmail"
	];
	const FILTER_MAPPINGS = {
		eq: "eq",
		neq: "neq",
		gt: "gt",
		gte: "gte",
		lt: "lt",
		lte: "lte",
		like: "like",
		"like(all)": "likeAllOf",
		"like(any)": "likeAnyOf",
		ilike: "ilike",
		"ilike(all)": "ilikeAllOf",
		"ilike(any)": "ilikeAnyOf",
		is: "is",
		in: "in",
		cs: "contains",
		cd: "containedBy",
		sr: "rangeGt",
		nxl: "rangeGte",
		sl: "rangeLt",
		nxr: "rangeLte",
		adj: "rangeAdjacent",
		ov: "overlaps",
		fts: "",
		plfts: "plain",
		phfts: "phrase",
		wfts: "websearch",
		not: "not"
	};
	const DB_OPERATIONS_TO_INSTRUMENT = [
		"select",
		"insert",
		"upsert",
		"update",
		"delete"
	];
	function markAsInstrumented(fn) {
		try {
			fn.__SENTRY_INSTRUMENTED__ = true;
		} catch {}
	}
	function isInstrumented(fn) {
		try {
			return fn.__SENTRY_INSTRUMENTED__;
		} catch {
			return false;
		}
	}
	function getMutationBodyPayloadForTelemetry(rawBody, plainBody) {
		if (Object.keys(plainBody).length > 0) return plainBody;
		if (Array.isArray(rawBody) && rawBody.length > 0) return rawBody;
	}
	function hasMutationBodyForDescription(rawBody, plainBody) {
		return getMutationBodyPayloadForTelemetry(rawBody, plainBody) !== void 0;
	}
	function extractOperation(method, headers = {}) {
		switch (method) {
			case "GET": return "select";
			case "POST": if (headers["Prefer"]?.includes("resolution=")) return "upsert";
			else return "insert";
			case "PATCH": return "update";
			case "DELETE": return "delete";
			default: return "<unknown-op>";
		}
	}
	function translateFiltersIntoMethods(key, query) {
		if (query === "" || query === "*") return "select(*)";
		if (key === "select") return `select(${query})`;
		if (key === "or" || key.endsWith(".or")) return `${key}${query}`;
		const [filter, ...value] = query.split(".");
		let method;
		if (filter?.startsWith("fts")) method = "textSearch";
		else if (filter?.startsWith("plfts")) method = "textSearch[plain]";
		else if (filter?.startsWith("phfts")) method = "textSearch[phrase]";
		else if (filter?.startsWith("wfts")) method = "textSearch[websearch]";
		else method = filter && FILTER_MAPPINGS[filter] || "filter";
		return `${method}(${key}, ${value.join(".")})`;
	}
	function instrumentAuthOperation(operation, isAdmin = false) {
		return new Proxy(operation, { apply(target, thisArg, argumentsList) {
			return trace.startSpan({
				name: `auth ${isAdmin ? "(admin) " : ""}${operation.name}`,
				attributes: {
					[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.db.supabase",
					[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_OP]: "db",
					"db.system": "postgresql",
					"db.operation": `auth.${isAdmin ? "admin." : ""}${operation.name}`
				}
			}, (span) => {
				return Reflect.apply(target, thisArg, argumentsList).then((res) => {
					if (res && typeof res === "object" && "error" in res && res.error) {
						span.setStatus({ code: spanstatus.SPAN_STATUS_ERROR });
						exports$1.captureException(res.error, { mechanism: {
							handled: false,
							type: "auto.db.supabase.auth"
						} });
					} else span.setStatus({ code: spanstatus.SPAN_STATUS_OK });
					span.end();
					return res;
				}).catch((err) => {
					span.setStatus({ code: spanstatus.SPAN_STATUS_ERROR });
					span.end();
					exports$1.captureException(err, { mechanism: {
						handled: false,
						type: "auto.db.supabase.auth"
					} });
					throw err;
				}).then(...argumentsList);
			});
		} });
	}
	function instrumentSupabaseAuthClient(supabaseClientInstance) {
		const auth = supabaseClientInstance.auth;
		if (!auth || isInstrumented(supabaseClientInstance.auth)) return;
		for (const operation of AUTH_OPERATIONS_TO_INSTRUMENT) {
			const authOperation = auth[operation];
			if (!authOperation) continue;
			if (typeof supabaseClientInstance.auth[operation] === "function") supabaseClientInstance.auth[operation] = instrumentAuthOperation(authOperation);
		}
		for (const operation of AUTH_ADMIN_OPERATIONS_TO_INSTRUMENT) {
			const authOperation = auth.admin[operation];
			if (!authOperation) continue;
			if (typeof supabaseClientInstance.auth.admin[operation] === "function") supabaseClientInstance.auth.admin[operation] = instrumentAuthOperation(authOperation, true);
		}
		markAsInstrumented(supabaseClientInstance.auth);
	}
	function instrumentSupabaseClientConstructor(SupabaseClient, _options) {
		if (isInstrumented(SupabaseClient.prototype.from)) return;
		SupabaseClient.prototype.from = new Proxy(SupabaseClient.prototype.from, { apply(target, thisArg, argumentsList) {
			const rv = Reflect.apply(target, thisArg, argumentsList);
			const PostgRESTQueryBuilder = rv.constructor;
			instrumentPostgRESTQueryBuilder(PostgRESTQueryBuilder, _options);
			return rv;
		} });
		markAsInstrumented(SupabaseClient.prototype.from);
	}
	function instrumentPostgRESTFilterBuilder(PostgRESTFilterBuilder, _options) {
		if (isInstrumented(PostgRESTFilterBuilder.prototype.then)) return;
		PostgRESTFilterBuilder.prototype.then = new Proxy(PostgRESTFilterBuilder.prototype.then, { apply(target, thisArg, argumentsList) {
			const operations = DB_OPERATIONS_TO_INSTRUMENT;
			const typedThis = thisArg;
			const operation = extractOperation(typedThis.method, typedThis.headers);
			if (!operations.includes(operation)) return Reflect.apply(target, thisArg, argumentsList);
			if (!typedThis?.url?.pathname || typeof typedThis.url.pathname !== "string") return Reflect.apply(target, thisArg, argumentsList);
			const pathParts = typedThis.url.pathname.split("/");
			const table = pathParts.length > 0 ? pathParts[pathParts.length - 1] : "";
			const queryItems = [];
			for (const [key, value] of typedThis.url.searchParams.entries()) queryItems.push(translateFiltersIntoMethods(key, value));
			const body = /* @__PURE__ */ Object.create(null);
			if (is.isPlainObject(typedThis.body)) for (const [key, value] of Object.entries(typedThis.body)) body[key] = value;
			const client = currentScopes.getClient();
			const shouldSendData = _options.sendOperationData ?? client?.getDataCollectionOptions().userInfo === true;
			const bodyPayload = getMutationBodyPayloadForTelemetry(typedThis.body, body);
			const mutationPart = operation === "select" ? "" : `${operation}${hasMutationBodyForDescription(typedThis.body, body) ? "(...) " : ""}`;
			const queryPart = shouldSendData ? queryItems.join(" ") : queryItems.length > 0 ? "[redacted]" : "";
			const descriptionMiddle = [mutationPart.trimEnd(), queryPart].filter(Boolean).join(" ");
			const description = descriptionMiddle ? `${descriptionMiddle} from(${table})` : `from(${table})`;
			const attributes = {
				"db.table": table,
				"db.schema": typedThis.schema,
				"db.url": typedThis.url.origin,
				"db.sdk": typedThis.headers["X-Client-Info"],
				"db.system": "postgresql",
				"db.operation": operation,
				[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.db.supabase",
				[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_OP]: "db"
			};
			if (queryItems.length && shouldSendData) attributes["db.query"] = queryItems;
			if (bodyPayload !== void 0 && shouldSendData) attributes["db.body"] = bodyPayload;
			return trace.startSpan({
				name: description,
				attributes
			}, (span) => {
				return Reflect.apply(target, thisArg, []).then((res) => {
					if (span) {
						if (res && typeof res === "object" && "status" in res) spanstatus.setHttpStatus(span, res.status || 500);
						span.end();
					}
					if (res?.error) {
						const err = new Error(res.error.message);
						if (res.error.code) err.code = res.error.code;
						if (res.error.details) err.details = res.error.details;
						const supabaseContext = {};
						if (queryItems.length && shouldSendData) supabaseContext.query = queryItems;
						if (bodyPayload !== void 0 && shouldSendData) supabaseContext.body = bodyPayload;
						exports$1.captureException(err, (scope) => {
							scope.addEventProcessor((e) => {
								misc.addExceptionMechanism(e, {
									handled: false,
									type: "auto.db.supabase.postgres"
								});
								return e;
							});
							scope.setContext("supabase", supabaseContext);
							return scope;
						});
					}
					const breadcrumb = {
						type: "supabase",
						category: `db.${operation}`,
						message: description
					};
					const data = {};
					if (queryItems.length && shouldSendData) data.query = queryItems;
					if (bodyPayload !== void 0 && shouldSendData) data.body = bodyPayload;
					if (Object.keys(data).length) breadcrumb.data = data;
					breadcrumbs.addBreadcrumb(breadcrumb);
					return res;
				}, (err) => {
					if (span) {
						spanstatus.setHttpStatus(span, 500);
						span.end();
					}
					throw err;
				}).then(...argumentsList);
			});
		} });
		markAsInstrumented(PostgRESTFilterBuilder.prototype.then);
	}
	function instrumentPostgRESTQueryBuilder(PostgRESTQueryBuilder, _options) {
		for (const operation of DB_OPERATIONS_TO_INSTRUMENT) {
			if (isInstrumented(PostgRESTQueryBuilder.prototype[operation])) continue;
			PostgRESTQueryBuilder.prototype[operation] = new Proxy(PostgRESTQueryBuilder.prototype[operation], { apply(target, thisArg, argumentsList) {
				const rv = Reflect.apply(target, thisArg, argumentsList);
				const PostgRESTFilterBuilder = rv.constructor;
				debugBuild.DEBUG_BUILD && debugLogger.debug.log(`Instrumenting ${operation} operation's PostgRESTFilterBuilder`);
				instrumentPostgRESTFilterBuilder(PostgRESTFilterBuilder, _options);
				return rv;
			} });
			markAsInstrumented(PostgRESTQueryBuilder.prototype[operation]);
		}
	}
	const instrumentSupabaseClient = (supabaseClient, options = {}) => {
		if (!supabaseClient) {
			debugBuild.DEBUG_BUILD && debugLogger.debug.warn("Supabase integration was not installed because no Supabase client was provided.");
			return;
		}
		instrumentSupabaseClientConstructor(supabaseClient.constructor === Function ? supabaseClient : supabaseClient.constructor, options);
		instrumentSupabaseAuthClient(supabaseClient);
	};
	const INTEGRATION_NAME = "Supabase";
	const _supabaseIntegration = ((supabaseClient, options) => {
		return {
			setupOnce() {
				instrumentSupabaseClient(supabaseClient, options);
			},
			name: INTEGRATION_NAME
		};
	});
	const supabaseIntegration = integration.defineIntegration((options) => {
		return _supabaseIntegration(options.supabaseClient, { sendOperationData: options.sendOperationData });
	});
	exports.DB_OPERATIONS_TO_INSTRUMENT = DB_OPERATIONS_TO_INSTRUMENT;
	exports.FILTER_MAPPINGS = FILTER_MAPPINGS;
	exports.extractOperation = extractOperation;
	exports.instrumentSupabaseClient = instrumentSupabaseClient;
	exports.supabaseIntegration = supabaseIntegration;
	exports.translateFiltersIntoMethods = translateFiltersIntoMethods;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/zoderrors.js
var require_zoderrors = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const integration = require_integration();
	const is = require_is();
	const string = require_string();
	const DEFAULT_LIMIT = 10;
	const INTEGRATION_NAME = "ZodErrors";
	function originalExceptionIsZodError(originalException) {
		return is.isError(originalException) && originalException.name === "ZodError" && Array.isArray(originalException.issues);
	}
	function flattenIssue(issue) {
		return {
			...issue,
			path: "path" in issue && Array.isArray(issue.path) ? issue.path.join(".") : void 0,
			keys: "keys" in issue ? JSON.stringify(issue.keys) : void 0,
			unionErrors: "unionErrors" in issue ? JSON.stringify(issue.unionErrors) : void 0
		};
	}
	function flattenIssuePath(path) {
		return path.map((p) => {
			if (typeof p === "number") return "<array>";
			else return p;
		}).join(".");
	}
	function formatIssueMessage(zodError) {
		const errorKeyMap = /* @__PURE__ */ new Set();
		for (const iss of zodError.issues) {
			const issuePath = flattenIssuePath(iss.path);
			if (issuePath.length > 0) errorKeyMap.add(issuePath);
		}
		const errorKeys = Array.from(errorKeyMap);
		if (errorKeys.length === 0) {
			let rootExpectedType = "variable";
			if (zodError.issues.length > 0) {
				const iss = zodError.issues[0];
				if (iss !== void 0 && "expected" in iss && typeof iss.expected === "string") rootExpectedType = iss.expected;
			}
			return `Failed to validate ${rootExpectedType}`;
		}
		return `Failed to validate keys: ${string.truncate(errorKeys.join(", "), 100)}`;
	}
	function applyZodErrorsToEvent(limit, saveZodIssuesAsAttachment = false, event, hint) {
		if (!event.exception?.values || !hint.originalException || !originalExceptionIsZodError(hint.originalException) || hint.originalException.issues.length === 0) return event;
		try {
			const flattenedIssues = (saveZodIssuesAsAttachment ? hint.originalException.issues : hint.originalException.issues.slice(0, limit)).map(flattenIssue);
			if (saveZodIssuesAsAttachment) {
				if (!Array.isArray(hint.attachments)) hint.attachments = [];
				hint.attachments.push({
					filename: "zod_issues.json",
					data: JSON.stringify({ issues: flattenedIssues })
				});
			}
			return {
				...event,
				exception: {
					...event.exception,
					values: [{
						...event.exception.values[0],
						value: formatIssueMessage(hint.originalException)
					}, ...event.exception.values.slice(1)]
				},
				extra: {
					...event.extra,
					"zoderror.issues": flattenedIssues.slice(0, limit)
				}
			};
		} catch (e) {
			return {
				...event,
				extra: {
					...event.extra,
					"zoderrors sentry integration parse error": {
						message: "an exception was thrown while processing ZodError within applyZodErrorsToEvent()",
						error: e instanceof Error ? `${e.name}: ${e.message}
${e.stack}` : "unknown"
					}
				}
			};
		}
	}
	const _zodErrorsIntegration = ((options = {}) => {
		const limit = options.limit ?? DEFAULT_LIMIT;
		return {
			name: INTEGRATION_NAME,
			processEvent(originalEvent, hint) {
				return applyZodErrorsToEvent(limit, options.saveZodIssuesAsAttachment, originalEvent, hint);
			}
		};
	});
	const zodErrorsIntegration = integration.defineIntegration(_zodErrorsIntegration);
	exports.applyZodErrorsToEvent = applyZodErrorsToEvent;
	exports.flattenIssue = flattenIssue;
	exports.flattenIssuePath = flattenIssuePath;
	exports.formatIssueMessage = formatIssueMessage;
	exports.zodErrorsIntegration = zodErrorsIntegration;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/third-party-errors-filter.js
var require_third_party_errors_filter = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const integration = require_integration();
	const metadata = require_metadata();
	const envelope = require_envelope$4();
	const stacktrace = require_stacktrace();
	const worldwide = require_worldwide();
	const thirdPartyErrorFilterIntegration = integration.defineIntegration((options) => {
		return {
			name: "ThirdPartyErrorsFilter",
			setup(client) {
				client.on("beforeEnvelope", (envelope$1) => {
					envelope.forEachEnvelopeItem(envelope$1, (item, type) => {
						if (type === "event") {
							const event = Array.isArray(item) ? item[1] : void 0;
							if (event) {
								metadata.stripMetadataFromStackFrames(event);
								item[1] = event;
							}
						}
					});
				});
				client.on("applyFrameMetadata", (event) => {
					if (event.type) return;
					const stackParser = client.getOptions().stackParser;
					metadata.addMetadataToStackFrames(stackParser, event);
				});
			},
			preprocessEvent(event) {
				if (options.ignoreSentryInternalFrames && (worldwide.GLOBAL_OBJ._sentryWrappedDepth ?? 0) > 0) event.sdkProcessingMetadata = {
					...event.sdkProcessingMetadata,
					insideSentryWrapped: true
				};
			},
			processEvent(event) {
				const insideSentryWrapped = options.ignoreSentryInternalFrames ? event.sdkProcessingMetadata?.insideSentryWrapped === true && event.exception?.values?.length === 1 : false;
				const frameKeys = getBundleKeysForAllFramesWithFilenames(event, options.ignoreSentryInternalFrames, insideSentryWrapped);
				if (frameKeys) {
					if (frameKeys[options.behaviour === "drop-error-if-contains-third-party-frames" || options.behaviour === "apply-tag-if-contains-third-party-frames" ? "some" : "every"]((keys) => !keys.some((key) => options.filterKeys.includes(key)))) if (options.behaviour === "drop-error-if-contains-third-party-frames" || options.behaviour === "drop-error-if-exclusively-contains-third-party-frames") return null;
					else event.tags = {
						...event.tags,
						third_party_code: true
					};
				}
				return event;
			}
		};
	});
	function isSentryInternalFrame(frame, frameIndex, insideSentryWrapped) {
		if (frameIndex !== 0) return false;
		if (insideSentryWrapped && isLikelyMinifiedSentryWrappedFrame(frame)) return true;
		if (frame.function === "sentryWrapped") return true;
		if (!frame.context_line || !frame.filename) return false;
		if (!frame.filename.includes("sentry") || !frame.filename.includes("helpers") || !frame.context_line.includes(SENTRY_INTERNAL_FN_APPLY)) return false;
		if (frame.pre_context) {
			const len = frame.pre_context.length;
			for (let i = 0; i < len; i++) if (frame.pre_context[i]?.includes(SENTRY_INTERNAL_COMMENT)) return true;
		}
		return false;
	}
	function getBundleKeysForAllFramesWithFilenames(event, ignoreSentryInternalFrames, insideSentryWrapped) {
		const frames = stacktrace.getFramesFromEvent(event);
		if (!frames) return;
		return frames.filter((frame, index) => {
			if (!frame.filename) return false;
			if (frame.lineno == null && frame.colno == null && frame.instruction_addr == null) return false;
			return !ignoreSentryInternalFrames || !isSentryInternalFrame(frame, index, !!insideSentryWrapped);
		}).map((frame) => {
			if (!frame.module_metadata) return [];
			return Object.keys(frame.module_metadata).filter((key) => key.startsWith(BUNDLER_PLUGIN_APP_KEY_PREFIX)).map((key) => key.slice(BUNDLER_PLUGIN_APP_KEY_PREFIX.length));
		});
	}
	function isLikelyMinifiedSentryWrappedFrame(frame) {
		return !frame.context_line && !frame.pre_context && !!frame.function && frame.function.length <= 2;
	}
	const BUNDLER_PLUGIN_APP_KEY_PREFIX = "_sentryBundlerPluginAppKey:";
	const SENTRY_INTERNAL_COMMENT = "Attempt to invoke user-land function";
	const SENTRY_INTERNAL_FN_APPLY = "fn.apply(this, wrappedArguments)";
	exports.thirdPartyErrorFilterIntegration = thirdPartyErrorFilterIntegration;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/console.js
var require_console = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const breadcrumbs = require_breadcrumbs();
	const currentScopes = require_currentScopes();
	const console = require_console$1();
	const integration = require_integration();
	const debugLogger = require_debug_logger();
	const severity = require_severity();
	const string = require_string();
	const worldwide = require_worldwide();
	const INTEGRATION_NAME = "Console";
	const consoleIntegration = integration.defineIntegration((options = {}) => {
		const levels = new Set(options.levels || debugLogger.CONSOLE_LEVELS);
		return {
			name: INTEGRATION_NAME,
			setup(client) {
				const unsubscribe = console.addConsoleInstrumentationHandler(({ args, level }) => {
					if (currentScopes.getClient() !== client || !levels.has(level)) return;
					addConsoleBreadcrumb(level, args);
				});
				client.registerCleanup(unsubscribe);
				if (options.filter) {
					const unsubscribe2 = console.addConsoleInstrumentationFilter(options.filter);
					client.registerCleanup(unsubscribe2);
				}
			}
		};
	});
	function addConsoleBreadcrumb(level, args) {
		const breadcrumb = {
			category: "console",
			data: {
				arguments: args,
				logger: "console"
			},
			level: severity.severityLevelFromString(level),
			message: formatConsoleArgs(args)
		};
		if (level === "assert") if (args[0] === false) {
			const assertionArgs = args.slice(1);
			breadcrumb.message = assertionArgs.length > 0 ? `Assertion failed: ${formatConsoleArgs(assertionArgs)}` : "Assertion failed";
			breadcrumb.data.arguments = assertionArgs;
		} else return;
		breadcrumbs.addBreadcrumb(breadcrumb, {
			input: args,
			level
		});
	}
	function formatConsoleArgs(values) {
		return "util" in worldwide.GLOBAL_OBJ && typeof worldwide.GLOBAL_OBJ.util.format === "function" ? worldwide.GLOBAL_OBJ.util.format(...values) : string.safeJoin(values, " ");
	}
	exports.addConsoleBreadcrumb = addConsoleBreadcrumb;
	exports.consoleIntegration = consoleIntegration;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/featureFlags.js
var require_featureFlags = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const currentScopes = require_currentScopes();
	const debugBuild = require_debug_build();
	const debugLogger = require_debug_logger();
	const spanUtils = require_spanUtils();
	const _INTERNAL_FLAG_BUFFER_SIZE = 100;
	const _INTERNAL_MAX_FLAGS_PER_SPAN = 10;
	const SPAN_FLAG_ATTRIBUTE_PREFIX = "flag.evaluation.";
	function _INTERNAL_copyFlagsFromScopeToEvent(event) {
		if (event.type) return event;
		const flagContext = currentScopes.getCurrentScope().getScopeData().contexts.flags;
		const flagBuffer = flagContext ? flagContext.values : [];
		if (!flagBuffer.length) return event;
		if (event.contexts === void 0) event.contexts = {};
		event.contexts.flags = { values: [...flagBuffer] };
		return event;
	}
	function _INTERNAL_insertFlagToScope(name, value, maxSize = _INTERNAL_FLAG_BUFFER_SIZE) {
		const scopeContexts = currentScopes.getCurrentScope().getScopeData().contexts;
		if (!scopeContexts.flags) scopeContexts.flags = { values: [] };
		const flags = scopeContexts.flags.values;
		_INTERNAL_insertToFlagBuffer(flags, name, value, maxSize);
	}
	function _INTERNAL_insertToFlagBuffer(flags, name, value, maxSize) {
		if (typeof value !== "boolean") return;
		if (flags.length > maxSize) {
			debugBuild.DEBUG_BUILD && debugLogger.debug.error(`[Feature Flags] insertToFlagBuffer called on a buffer larger than maxSize=${maxSize}`);
			return;
		}
		const index = flags.findIndex((f) => f.flag === name);
		if (index !== -1) flags.splice(index, 1);
		if (flags.length === maxSize) flags.shift();
		flags.push({
			flag: name,
			result: value
		});
	}
	function _INTERNAL_addFeatureFlagToActiveSpan(name, value, maxFlagsPerSpan = _INTERNAL_MAX_FLAGS_PER_SPAN) {
		if (typeof value !== "boolean") return;
		const span = spanUtils.getActiveSpan();
		if (!span) return;
		const attributes = spanUtils.spanToJSON(span).data;
		if (`${SPAN_FLAG_ATTRIBUTE_PREFIX}${name}` in attributes) {
			span.setAttribute(`${SPAN_FLAG_ATTRIBUTE_PREFIX}${name}`, value);
			return;
		}
		if (Object.keys(attributes).filter((key) => key.startsWith(SPAN_FLAG_ATTRIBUTE_PREFIX)).length < maxFlagsPerSpan) span.setAttribute(`${SPAN_FLAG_ATTRIBUTE_PREFIX}${name}`, value);
	}
	exports._INTERNAL_FLAG_BUFFER_SIZE = _INTERNAL_FLAG_BUFFER_SIZE;
	exports._INTERNAL_MAX_FLAGS_PER_SPAN = _INTERNAL_MAX_FLAGS_PER_SPAN;
	exports._INTERNAL_addFeatureFlagToActiveSpan = _INTERNAL_addFeatureFlagToActiveSpan;
	exports._INTERNAL_copyFlagsFromScopeToEvent = _INTERNAL_copyFlagsFromScopeToEvent;
	exports._INTERNAL_insertFlagToScope = _INTERNAL_insertFlagToScope;
	exports._INTERNAL_insertToFlagBuffer = _INTERNAL_insertToFlagBuffer;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/featureFlags/featureFlagsIntegration.js
var require_featureFlagsIntegration = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const integration = require_integration();
	const featureFlags = require_featureFlags();
	exports.featureFlagsIntegration = integration.defineIntegration(() => {
		return {
			name: "FeatureFlags",
			processEvent(event, _hint, _client) {
				return featureFlags._INTERNAL_copyFlagsFromScopeToEvent(event);
			},
			addFeatureFlag(name, value) {
				featureFlags._INTERNAL_insertFlagToScope(name, value);
				featureFlags._INTERNAL_addFeatureFlagToActiveSpan(name, value);
			}
		};
	});
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/featureFlags/growthbook.js
var require_growthbook = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const integration = require_integration();
	const featureFlags = require_featureFlags();
	const object = require_object();
	const growthbookIntegration = integration.defineIntegration(({ growthbookClass }) => {
		return {
			name: "GrowthBook",
			setupOnce() {
				const proto = growthbookClass.prototype;
				if (typeof proto.isOn === "function") object.fill(proto, "isOn", _wrapAndCaptureBooleanResult);
				if (typeof proto.getFeatureValue === "function") object.fill(proto, "getFeatureValue", _wrapAndCaptureBooleanResult);
			},
			processEvent(event, _hint, _client) {
				return featureFlags._INTERNAL_copyFlagsFromScopeToEvent(event);
			}
		};
	});
	function _wrapAndCaptureBooleanResult(original) {
		return function(...args) {
			const flagName = args[0];
			const result = original.apply(this, args);
			if (typeof flagName === "string" && typeof result === "boolean") {
				featureFlags._INTERNAL_insertFlagToScope(flagName, result);
				featureFlags._INTERNAL_addFeatureFlagToActiveSpan(flagName, result);
			}
			return result;
		};
	}
	exports.growthbookIntegration = growthbookIntegration;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/conversationId.js
var require_conversationId = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const currentScopes = require_currentScopes();
	const integration = require_integration();
	const semanticAttributes = require_semanticAttributes();
	const spanUtils = require_spanUtils();
	const INTEGRATION_NAME = "ConversationId";
	const _conversationIdIntegration = (() => {
		return {
			name: INTEGRATION_NAME,
			setup(client) {
				client.on("spanStart", (span) => {
					const scopeData = currentScopes.getCurrentScope().getScopeData();
					const isolationScopeData = currentScopes.getIsolationScope().getScopeData();
					const conversationId = scopeData.conversationId || isolationScopeData.conversationId;
					if (conversationId) {
						const { op, data: attributes, description: name } = spanUtils.spanToJSON(span);
						if (!op?.startsWith("gen_ai.") && !attributes["ai.operationId"] && !name?.startsWith("ai.")) return;
						span.setAttribute(semanticAttributes.GEN_AI_CONVERSATION_ID_ATTRIBUTE, conversationId);
					}
				});
			}
		};
	});
	exports.conversationIdIntegration = integration.defineIntegration(_conversationIdIntegration);
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/profiling.js
var require_profiling = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const currentScopes = require_currentScopes();
	const debugBuild = require_debug_build();
	const debugLogger = require_debug_logger();
	function isProfilingIntegrationWithProfiler(integration) {
		return !!integration && typeof integration["_profiler"] !== "undefined" && typeof integration["_profiler"]["start"] === "function" && typeof integration["_profiler"]["stop"] === "function";
	}
	function startProfiler() {
		const client = currentScopes.getClient();
		if (!client) {
			debugBuild.DEBUG_BUILD && debugLogger.debug.warn("No Sentry client available, profiling is not started");
			return;
		}
		const integration = client.getIntegrationByName("ProfilingIntegration");
		if (!integration) {
			debugBuild.DEBUG_BUILD && debugLogger.debug.warn("ProfilingIntegration is not available");
			return;
		}
		if (!isProfilingIntegrationWithProfiler(integration)) {
			debugBuild.DEBUG_BUILD && debugLogger.debug.warn("Profiler is not available on profiling integration.");
			return;
		}
		integration._profiler.start();
	}
	function stopProfiler() {
		const client = currentScopes.getClient();
		if (!client) {
			debugBuild.DEBUG_BUILD && debugLogger.debug.warn("No Sentry client available, profiling is not started");
			return;
		}
		const integration = client.getIntegrationByName("ProfilingIntegration");
		if (!integration) {
			debugBuild.DEBUG_BUILD && debugLogger.debug.warn("ProfilingIntegration is not available");
			return;
		}
		if (!isProfilingIntegrationWithProfiler(integration)) {
			debugBuild.DEBUG_BUILD && debugLogger.debug.warn("Profiler is not available on profiling integration.");
			return;
		}
		integration._profiler.stop();
	}
	exports.profiler = {
		startProfiler,
		stopProfiler
	};
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/fetch.js
var require_fetch$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const currentScopes = require_currentScopes();
	const semanticAttributes = require_semanticAttributes();
	const spanUtils = require_spanUtils();
	const spanstatus = require_spanstatus();
	const is = require_is();
	const hasSpansEnabled = require_hasSpansEnabled();
	const sentryNonRecordingSpan = require_sentryNonRecordingSpan();
	const baggage = require_baggage();
	const hasSpanStreamingEnabled = require_hasSpanStreamingEnabled();
	const trace = require_trace();
	const traceData = require_traceData();
	const url = require_url();
	function instrumentFetchRequest(handlerData, shouldCreateSpan, shouldAttachHeaders, spans, spanOriginOrOptions) {
		if (!handlerData.fetchData) return;
		const { method, url } = handlerData.fetchData;
		const shouldCreateSpanResult = hasSpansEnabled.hasSpansEnabled() && shouldCreateSpan(url);
		if (handlerData.endTimestamp) {
			const spanId = handlerData.fetchData.__span;
			if (!spanId) return;
			const span2 = spans[spanId];
			if (span2) {
				if (shouldCreateSpanResult) {
					endSpan(span2, handlerData);
					_callOnRequestSpanEnd(span2, handlerData, spanOriginOrOptions);
				}
				delete spans[spanId];
			}
			return;
		}
		const { spanOrigin = "auto.http.browser", propagateTraceparent = false } = typeof spanOriginOrOptions === "object" ? spanOriginOrOptions : { spanOrigin: spanOriginOrOptions };
		const client = currentScopes.getClient();
		const shouldEmitSpan = !!spanUtils.getActiveSpan() || !!client && hasSpanStreamingEnabled.hasSpanStreamingEnabled(client);
		const span = shouldCreateSpanResult && shouldEmitSpan ? trace.startInactiveSpan(getSpanStartOptions(url, method, spanOrigin)) : new sentryNonRecordingSpan.SentryNonRecordingSpan();
		if (shouldCreateSpanResult && !shouldEmitSpan) client?.recordDroppedEvent("no_parent_span", "span");
		handlerData.fetchData.__span = span.spanContext().spanId;
		spans[span.spanContext().spanId] = span;
		if (shouldAttachHeaders(handlerData.fetchData.url)) {
			const request = handlerData.args[0];
			const options = { ...handlerData.args[1] || {} };
			const headers = _INTERNAL_getTracingHeadersForFetchRequest(request, options, hasSpansEnabled.hasSpansEnabled() && shouldEmitSpan ? span : void 0, propagateTraceparent);
			if (headers) {
				handlerData.args[1] = options;
				options.headers = headers;
			}
		}
		if (client) {
			const fetchHint = {
				input: handlerData.args,
				response: handlerData.response,
				startTimestamp: handlerData.startTimestamp,
				endTimestamp: handlerData.endTimestamp
			};
			client.emit("beforeOutgoingRequestSpan", span, fetchHint);
		}
		return span;
	}
	function _callOnRequestSpanEnd(span, handlerData, spanOriginOrOptions) {
		(typeof spanOriginOrOptions === "object" && spanOriginOrOptions !== null ? spanOriginOrOptions.onRequestSpanEnd : void 0)?.(span, {
			headers: handlerData.response?.headers,
			error: handlerData.error
		});
	}
	function _INTERNAL_getTracingHeadersForFetchRequest(request, fetchOptionsObj, span, propagateTraceparent) {
		const traceHeaders = traceData.getTraceData({
			span,
			propagateTraceparent
		});
		const sentryTrace = traceHeaders["sentry-trace"];
		const baggage = traceHeaders.baggage;
		const traceparent = traceHeaders.traceparent;
		if (!sentryTrace) return;
		const originalHeaders = fetchOptionsObj.headers || (is.isRequest(request) ? request.headers : void 0);
		if (!originalHeaders) return { ...traceHeaders };
		else if (isHeaders(originalHeaders)) {
			const newHeaders = new Headers(originalHeaders);
			if (!newHeaders.get("sentry-trace")) newHeaders.set("sentry-trace", sentryTrace);
			if (propagateTraceparent && traceparent && !newHeaders.get("traceparent")) newHeaders.set("traceparent", traceparent);
			if (baggage) {
				const prevBaggageHeader = newHeaders.get("baggage");
				if (!prevBaggageHeader) newHeaders.set("baggage", baggage);
				else if (!baggageHeaderHasSentryBaggageValues(prevBaggageHeader)) newHeaders.set("baggage", `${prevBaggageHeader},${baggage}`);
			}
			return newHeaders;
		} else if (isHeadersInitTupleArray(originalHeaders)) {
			const newHeaders = [...originalHeaders];
			if (!newHeaders.find((header) => header[0] === "sentry-trace")) newHeaders.push(["sentry-trace", sentryTrace]);
			if (propagateTraceparent && traceparent && !newHeaders.find((header) => header[0] === "traceparent")) newHeaders.push(["traceparent", traceparent]);
			const prevBaggageHeaderWithSentryValues = originalHeaders.find((header) => header[0] === "baggage" && typeof header[1] === "string" && baggageHeaderHasSentryBaggageValues(header[1]));
			if (baggage && !prevBaggageHeaderWithSentryValues) newHeaders.push(["baggage", baggage]);
			return newHeaders;
		} else {
			const existingSentryTraceHeader = "sentry-trace" in originalHeaders ? originalHeaders["sentry-trace"] : void 0;
			const existingTraceparentHeader = "traceparent" in originalHeaders ? originalHeaders.traceparent : void 0;
			const existingBaggageHeader = "baggage" in originalHeaders ? originalHeaders.baggage : void 0;
			const newBaggageHeaders = existingBaggageHeader ? Array.isArray(existingBaggageHeader) ? [...existingBaggageHeader] : [existingBaggageHeader] : [];
			const prevBaggageHeaderWithSentryValues = existingBaggageHeader && (Array.isArray(existingBaggageHeader) ? existingBaggageHeader.find((headerItem) => baggageHeaderHasSentryBaggageValues(headerItem)) : baggageHeaderHasSentryBaggageValues(existingBaggageHeader));
			if (baggage && !prevBaggageHeaderWithSentryValues) newBaggageHeaders.push(baggage);
			const newHeaders = Object.assign({}, originalHeaders, {
				"sentry-trace": existingSentryTraceHeader ?? sentryTrace,
				baggage: newBaggageHeaders.length > 0 ? newBaggageHeaders.join(",") : void 0
			});
			if (propagateTraceparent && traceparent && !existingTraceparentHeader) newHeaders.traceparent = traceparent;
			return newHeaders;
		}
	}
	function endSpan(span, handlerData) {
		if (handlerData.response) {
			spanstatus.setHttpStatus(span, handlerData.response.status);
			const contentLength = handlerData.response?.headers?.get("content-length");
			if (contentLength) {
				const contentLengthNum = parseInt(contentLength);
				if (contentLengthNum > 0) span.setAttribute("http.response_content_length", contentLengthNum);
			}
		} else if (handlerData.error) span.setStatus({
			code: spanstatus.SPAN_STATUS_ERROR,
			message: "internal_error"
		});
		span.end();
	}
	function baggageHeaderHasSentryBaggageValues(baggageHeader) {
		if (typeof baggageHeader !== "string") return false;
		return baggageHeader.split(",").some((baggageEntry) => baggageEntry.trim().startsWith(baggage.SENTRY_BAGGAGE_KEY_PREFIX));
	}
	function isHeaders(headers) {
		return typeof Headers !== "undefined" && is.isInstanceOf(headers, Headers);
	}
	function isHeadersInitTupleArray(headers) {
		if (!Array.isArray(headers)) return false;
		return headers.every((item) => Array.isArray(item) && item.length === 2 && typeof item[0] === "string");
	}
	function getSpanStartOptions(url$1, method, spanOrigin) {
		if (url$1.startsWith("data:")) return {
			name: `${method} ${url.stripDataUrlContent(url$1)}`,
			attributes: getFetchSpanAttributes(url$1, void 0, method, spanOrigin)
		};
		const parsedUrl = url.parseStringToURLObject(url$1);
		return {
			name: `${method} ${parsedUrl ? url.getSanitizedUrlStringFromUrlObject(parsedUrl) : url$1}`,
			attributes: getFetchSpanAttributes(url$1, parsedUrl, method, spanOrigin)
		};
	}
	function getFetchSpanAttributes(url$1, parsedUrl, method, spanOrigin) {
		const attributes = {
			url: url.stripDataUrlContent(url$1),
			type: "fetch",
			"http.method": method,
			[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: spanOrigin,
			[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_OP]: "http.client"
		};
		if (parsedUrl) {
			if (!url.isURLObjectRelative(parsedUrl)) {
				attributes["http.url"] = url.stripDataUrlContent(parsedUrl.href);
				attributes["server.address"] = parsedUrl.host;
			}
			if (parsedUrl.search) attributes["http.query"] = parsedUrl.search;
			if (parsedUrl.hash) attributes["http.fragment"] = parsedUrl.hash;
		}
		return attributes;
	}
	exports._INTERNAL_getTracingHeadersForFetchRequest = _INTERNAL_getTracingHeadersForFetchRequest;
	exports._callOnRequestSpanEnd = _callOnRequestSpanEnd;
	exports.instrumentFetchRequest = instrumentFetchRequest;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/feedback.js
var require_feedback = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const currentScopes = require_currentScopes();
	function captureFeedback(params, hint = {}, scope = currentScopes.getCurrentScope()) {
		const { message, name, email, url, source, associatedEventId, tags } = params;
		const feedbackEvent = {
			contexts: { feedback: {
				contact_email: email,
				name,
				message,
				url,
				source,
				associated_event_id: associatedEventId
			} },
			type: "feedback",
			level: "info",
			tags
		};
		const client = scope?.getClient() || currentScopes.getClient();
		if (client) client.emit("beforeSendFeedback", feedbackEvent, hint);
		return scope.captureEvent(feedbackEvent, hint);
	}
	exports.captureFeedback = captureFeedback;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/logs/public-api.js
var require_public_api$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const internal = require_internal$1();
	const parameterize = require_parameterize();
	function captureLog(level, message, attributes, scope, severityNumber) {
		internal._INTERNAL_captureLog({
			level,
			message,
			attributes,
			severityNumber
		}, scope);
	}
	function trace(message, attributes, { scope } = {}) {
		captureLog("trace", message, attributes, scope);
	}
	function debug(message, attributes, { scope } = {}) {
		captureLog("debug", message, attributes, scope);
	}
	function info(message, attributes, { scope } = {}) {
		captureLog("info", message, attributes, scope);
	}
	function warn(message, attributes, { scope } = {}) {
		captureLog("warn", message, attributes, scope);
	}
	function error(message, attributes, { scope } = {}) {
		captureLog("error", message, attributes, scope);
	}
	function fatal(message, attributes, { scope } = {}) {
		captureLog("fatal", message, attributes, scope);
	}
	exports.fmt = parameterize.fmt;
	exports.debug = debug;
	exports.error = error;
	exports.fatal = fatal;
	exports.info = info;
	exports.trace = trace;
	exports.warn = warn;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/logs/utils.js
var require_utils$8 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const is = require_is();
	const normalize = require_normalize();
	const worldwide = require_worldwide();
	function formatConsoleArgs(values, normalizeDepth, normalizeMaxBreadth) {
		return "util" in worldwide.GLOBAL_OBJ && typeof worldwide.GLOBAL_OBJ.util.format === "function" ? worldwide.GLOBAL_OBJ.util.format(...values) : safeJoinConsoleArgs(values, normalizeDepth, normalizeMaxBreadth);
	}
	function safeJoinConsoleArgs(values, normalizeDepth, normalizeMaxBreadth) {
		return values.map((value) => is.isPrimitive(value) ? String(value) : JSON.stringify(normalize.normalize(value, normalizeDepth, normalizeMaxBreadth))).join(" ");
	}
	function hasConsoleSubstitutions(str) {
		return /%[sdifocO]/.test(str);
	}
	function createConsoleTemplateAttributes(firstArg, followingArgs) {
		const attributes = {};
		attributes["sentry.message.template"] = `${firstArg} ${new Array(followingArgs.length).fill("{}").join(" ")}`;
		followingArgs.forEach((arg, index) => {
			attributes[`sentry.message.parameter.${index}`] = arg;
		});
		return attributes;
	}
	exports.createConsoleTemplateAttributes = createConsoleTemplateAttributes;
	exports.formatConsoleArgs = formatConsoleArgs;
	exports.hasConsoleSubstitutions = hasConsoleSubstitutions;
	exports.safeJoinConsoleArgs = safeJoinConsoleArgs;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/logs/console-integration.js
var require_console_integration = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const currentScopes = require_currentScopes();
	const debugBuild = require_debug_build();
	const console = require_console$1();
	const integration = require_integration();
	const semanticAttributes = require_semanticAttributes();
	const debugLogger = require_debug_logger();
	const is = require_is();
	const normalize = require_normalize();
	const internal = require_internal$1();
	const utils = require_utils$8();
	const INTEGRATION_NAME = "ConsoleLogs";
	const DEFAULT_ATTRIBUTES = { [semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.log.console" };
	const _consoleLoggingIntegration = ((options = {}) => {
		const levels = options.levels || debugLogger.CONSOLE_LEVELS;
		return {
			name: INTEGRATION_NAME,
			setup(client) {
				const { enableLogs, normalizeDepth = 3, normalizeMaxBreadth = 1e3 } = client.getOptions();
				if (!enableLogs) {
					debugBuild.DEBUG_BUILD && debugLogger.debug.warn("`enableLogs` is not enabled, ConsoleLogs integration disabled");
					return;
				}
				const unsubscribe = console.addConsoleInstrumentationHandler(({ args, level }) => {
					if (currentScopes.getClient() !== client || !levels.includes(level)) return;
					const firstArg = args[0];
					const followingArgs = args.slice(1);
					if (level === "assert") {
						if (!firstArg) {
							const assertionMessage = followingArgs.length > 0 ? `Assertion failed: ${utils.formatConsoleArgs(followingArgs, normalizeDepth, normalizeMaxBreadth)}` : "Assertion failed";
							internal._INTERNAL_captureLog({
								level: "error",
								message: assertionMessage,
								attributes: DEFAULT_ATTRIBUTES
							});
						}
						return;
					}
					const isLevelLog = level === "log";
					const attributes = { ...DEFAULT_ATTRIBUTES };
					if (is.isPlainObject(firstArg)) {
						Object.assign(attributes, normalize.normalize(firstArg, normalizeDepth, normalizeMaxBreadth));
						const remainingArgsStartIndex = typeof args[1] === "string" ? 2 : 1;
						args.slice(remainingArgsStartIndex).forEach((arg, index) => {
							attributes[`sentry.message.parameter.${index}`] = normalize.normalize(arg, normalizeDepth, normalizeMaxBreadth);
						});
					} else if (followingArgs.length > 0 && typeof firstArg === "string" && !utils.hasConsoleSubstitutions(firstArg)) {
						const templateAttrs = utils.createConsoleTemplateAttributes(firstArg, followingArgs);
						for (const [key, value] of Object.entries(templateAttrs)) attributes[key] = key.startsWith("sentry.message.parameter.") ? normalize.normalize(value, normalizeDepth, normalizeMaxBreadth) : value;
					}
					internal._INTERNAL_captureLog({
						level: isLevelLog ? "info" : level,
						message: utils.formatConsoleArgs(args, normalizeDepth, normalizeMaxBreadth),
						severityNumber: isLevelLog ? 10 : void 0,
						attributes
					});
				});
				client.registerCleanup(unsubscribe);
			}
		};
	});
	exports.consoleLoggingIntegration = integration.defineIntegration(_consoleLoggingIntegration);
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/metrics/public-api.js
var require_public_api = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const internal = require_internal();
	function captureMetric(type, name, value, options) {
		internal._INTERNAL_captureMetric({
			type,
			name,
			value,
			unit: options?.unit,
			attributes: options?.attributes
		}, { scope: options?.scope });
	}
	function count(name, value = 1, options) {
		captureMetric("counter", name, value, options);
	}
	function gauge(name, value, options) {
		captureMetric("gauge", name, value, options);
	}
	function distribution(name, value, options) {
		captureMetric("distribution", name, value, options);
	}
	exports.count = count;
	exports.distribution = distribution;
	exports.gauge = gauge;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/consola.js
var require_consola = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const currentScopes = require_currentScopes();
	const internal = require_internal$1();
	const utils = require_utils$8();
	const is = require_is();
	const normalize = require_normalize();
	const DEFAULT_CAPTURED_LEVELS = [
		"trace",
		"debug",
		"info",
		"warn",
		"error",
		"fatal"
	];
	function createConsolaReporter(options = {}) {
		const levels = new Set(options.levels ?? DEFAULT_CAPTURED_LEVELS);
		const providedClient = options.client;
		return { log(logObj) {
			const { type, level, message: consolaMessage, args, tag, date: _date, ...rest } = logObj;
			const client = providedClient || currentScopes.getClient();
			if (!client) return;
			const logSeverityLevel = getLogSeverityLevel(type, level);
			if (!levels.has(logSeverityLevel)) return;
			const { normalizeDepth = 3, normalizeMaxBreadth = 1e3 } = client.getOptions();
			const attributes = {};
			for (const [key, value] of Object.entries(rest)) attributes[key] = normalize.normalize(value, normalizeDepth, normalizeMaxBreadth);
			attributes["sentry.origin"] = "auto.log.consola";
			if (tag) attributes["consola.tag"] = tag;
			if (type) attributes["consola.type"] = type;
			if (level != null && typeof level === "number") attributes["consola.level"] = level;
			const extractionResult = processExtractedAttributes(defaultExtractAttributes(args, normalizeDepth, normalizeMaxBreadth), normalizeDepth, normalizeMaxBreadth);
			if (extractionResult?.attributes) Object.assign(attributes, extractionResult.attributes);
			internal._INTERNAL_captureLog({
				level: logSeverityLevel,
				message: extractionResult?.message || consolaMessage || args && utils.formatConsoleArgs(args, normalizeDepth, normalizeMaxBreadth) || "",
				attributes
			});
		} };
	}
	const CONSOLA_TYPE_TO_LOG_SEVERITY_LEVEL_MAP = {
		silent: "trace",
		fatal: "fatal",
		error: "error",
		warn: "warn",
		log: "info",
		info: "info",
		success: "info",
		fail: "error",
		ready: "info",
		start: "info",
		box: "info",
		debug: "debug",
		trace: "trace",
		verbose: "debug",
		critical: "fatal",
		notice: "info"
	};
	const CONSOLA_LEVEL_TO_LOG_SEVERITY_LEVEL_MAP = {
		0: "fatal",
		1: "warn",
		2: "info",
		3: "info",
		4: "debug",
		5: "trace"
	};
	function getLogSeverityLevel(type, level) {
		if (type === "verbose") return "debug";
		if (type === "silent") return "trace";
		if (type) {
			const mappedLevel = CONSOLA_TYPE_TO_LOG_SEVERITY_LEVEL_MAP[type];
			if (mappedLevel) return mappedLevel;
		}
		if (typeof level === "number") {
			const mappedLevel = CONSOLA_LEVEL_TO_LOG_SEVERITY_LEVEL_MAP[level];
			if (mappedLevel) return mappedLevel;
		}
		return "info";
	}
	function defaultExtractAttributes(args, normalizeDepth, normalizeMaxBreadth) {
		if (!args?.length) return { message: "" };
		const message = utils.formatConsoleArgs(args, normalizeDepth, normalizeMaxBreadth);
		const firstArg = args[0];
		if (is.isPlainObject(firstArg)) {
			const remainingArgsStartIndex = typeof args[1] === "string" ? 2 : 1;
			return {
				message,
				attributes: firstArg,
				messageParameters: args.slice(remainingArgsStartIndex)
			};
		} else {
			const followingArgs = args.slice(1);
			const shouldAddTemplateAttr = followingArgs.length > 0 && typeof firstArg === "string" && !utils.hasConsoleSubstitutions(firstArg);
			return {
				message,
				messageTemplate: shouldAddTemplateAttr ? firstArg : void 0,
				messageParameters: shouldAddTemplateAttr ? followingArgs : void 0
			};
		}
	}
	function processExtractedAttributes(extractionResult, normalizeDepth, normalizeMaxBreadth) {
		const { message, attributes, messageTemplate, messageParameters } = extractionResult;
		const messageParamAttributes = {};
		if (messageTemplate && messageParameters) {
			const templateAttrs = utils.createConsoleTemplateAttributes(messageTemplate, messageParameters);
			for (const [key, value] of Object.entries(templateAttrs)) messageParamAttributes[key] = key.startsWith("sentry.message.parameter.") ? normalize.normalize(value, normalizeDepth, normalizeMaxBreadth) : value;
		} else if (messageParameters && messageParameters.length > 0) messageParameters.forEach((arg, index) => {
			messageParamAttributes[`sentry.message.parameter.${index}`] = normalize.normalize(arg, normalizeDepth, normalizeMaxBreadth);
		});
		return {
			message,
			attributes: {
				...normalize.normalize(attributes, normalizeDepth, normalizeMaxBreadth),
				...messageParamAttributes
			}
		};
	}
	exports.createConsolaReporter = createConsolaReporter;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/ai/gen-ai-attributes.js
var require_gen_ai_attributes = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const GEN_AI_PROMPT_ATTRIBUTE = "gen_ai.prompt";
	const GEN_AI_SYSTEM_ATTRIBUTE = "gen_ai.system";
	const GEN_AI_REQUEST_MODEL_ATTRIBUTE = "gen_ai.request.model";
	const GEN_AI_REQUEST_STREAM_ATTRIBUTE = "gen_ai.request.stream";
	const GEN_AI_REQUEST_TEMPERATURE_ATTRIBUTE = "gen_ai.request.temperature";
	const GEN_AI_REQUEST_MAX_TOKENS_ATTRIBUTE = "gen_ai.request.max_tokens";
	const GEN_AI_REQUEST_FREQUENCY_PENALTY_ATTRIBUTE = "gen_ai.request.frequency_penalty";
	const GEN_AI_REQUEST_PRESENCE_PENALTY_ATTRIBUTE = "gen_ai.request.presence_penalty";
	const GEN_AI_REQUEST_TOP_P_ATTRIBUTE = "gen_ai.request.top_p";
	const GEN_AI_REQUEST_TOP_K_ATTRIBUTE = "gen_ai.request.top_k";
	const GEN_AI_REQUEST_ENCODING_FORMAT_ATTRIBUTE = "gen_ai.request.encoding_format";
	const GEN_AI_REQUEST_DIMENSIONS_ATTRIBUTE = "gen_ai.request.dimensions";
	const GEN_AI_RESPONSE_FINISH_REASONS_ATTRIBUTE = "gen_ai.response.finish_reasons";
	const GEN_AI_RESPONSE_MODEL_ATTRIBUTE = "gen_ai.response.model";
	const GEN_AI_RESPONSE_ID_ATTRIBUTE = "gen_ai.response.id";
	const GEN_AI_RESPONSE_STOP_REASON_ATTRIBUTE = "gen_ai.response.stop_reason";
	const GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE = "gen_ai.usage.input_tokens";
	const GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE = "gen_ai.usage.output_tokens";
	const GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE = "gen_ai.usage.total_tokens";
	const GEN_AI_OPERATION_NAME_ATTRIBUTE = "gen_ai.operation.name";
	const GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE = "sentry.sdk_meta.gen_ai.input.messages.original_length";
	const GEN_AI_INPUT_MESSAGES_ATTRIBUTE = "gen_ai.input.messages";
	const GEN_AI_OUTPUT_MESSAGES_ATTRIBUTE = "gen_ai.output.messages";
	const GEN_AI_SYSTEM_INSTRUCTIONS_ATTRIBUTE = "gen_ai.system_instructions";
	const GEN_AI_RESPONSE_TEXT_ATTRIBUTE = "gen_ai.response.text";
	const GEN_AI_REQUEST_AVAILABLE_TOOLS_ATTRIBUTE = "gen_ai.request.available_tools";
	const GEN_AI_RESPONSE_STREAMING_ATTRIBUTE = "gen_ai.response.streaming";
	const GEN_AI_RESPONSE_TOOL_CALLS_ATTRIBUTE = "gen_ai.response.tool_calls";
	const GEN_AI_AGENT_NAME_ATTRIBUTE = "gen_ai.agent.name";
	const GEN_AI_PIPELINE_NAME_ATTRIBUTE = "gen_ai.pipeline.name";
	const GEN_AI_CONVERSATION_ID_ATTRIBUTE = "gen_ai.conversation.id";
	const GEN_AI_USAGE_CACHE_CREATION_INPUT_TOKENS_ATTRIBUTE = "gen_ai.usage.cache_creation_input_tokens";
	const GEN_AI_USAGE_CACHE_READ_INPUT_TOKENS_ATTRIBUTE = "gen_ai.usage.cache_read_input_tokens";
	const GEN_AI_USAGE_INPUT_TOKENS_CACHE_WRITE_ATTRIBUTE = "gen_ai.usage.input_tokens.cache_write";
	const GEN_AI_USAGE_INPUT_TOKENS_CACHED_ATTRIBUTE = "gen_ai.usage.input_tokens.cached";
	const GEN_AI_INVOKE_AGENT_OPERATION_ATTRIBUTE = "gen_ai.invoke_agent";
	const GEN_AI_EMBEDDINGS_INPUT_ATTRIBUTE = "gen_ai.embeddings.input";
	const GEN_AI_EMBEDDINGS_OPERATION_ATTRIBUTE = "gen_ai.embeddings";
	const GEN_AI_EXECUTE_TOOL_OPERATION_ATTRIBUTE = "gen_ai.execute_tool";
	const GEN_AI_TOOL_NAME_ATTRIBUTE = "gen_ai.tool.name";
	const GEN_AI_TOOL_CALL_ID_ATTRIBUTE = "gen_ai.tool.call.id";
	const GEN_AI_TOOL_TYPE_ATTRIBUTE = "gen_ai.tool.type";
	const GEN_AI_TOOL_INPUT_ATTRIBUTE = "gen_ai.tool.input";
	const GEN_AI_TOOL_OUTPUT_ATTRIBUTE = "gen_ai.tool.output";
	const GEN_AI_TOOL_DESCRIPTION_ATTRIBUTE = "gen_ai.tool.description";
	exports.GEN_AI_AGENT_NAME_ATTRIBUTE = GEN_AI_AGENT_NAME_ATTRIBUTE;
	exports.GEN_AI_CONVERSATION_ID_ATTRIBUTE = GEN_AI_CONVERSATION_ID_ATTRIBUTE;
	exports.GEN_AI_EMBEDDINGS_INPUT_ATTRIBUTE = GEN_AI_EMBEDDINGS_INPUT_ATTRIBUTE;
	exports.GEN_AI_EMBEDDINGS_OPERATION_ATTRIBUTE = GEN_AI_EMBEDDINGS_OPERATION_ATTRIBUTE;
	exports.GEN_AI_EXECUTE_TOOL_OPERATION_ATTRIBUTE = GEN_AI_EXECUTE_TOOL_OPERATION_ATTRIBUTE;
	exports.GEN_AI_INPUT_MESSAGES_ATTRIBUTE = GEN_AI_INPUT_MESSAGES_ATTRIBUTE;
	exports.GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE = GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE;
	exports.GEN_AI_INVOKE_AGENT_OPERATION_ATTRIBUTE = GEN_AI_INVOKE_AGENT_OPERATION_ATTRIBUTE;
	exports.GEN_AI_OPERATION_NAME_ATTRIBUTE = GEN_AI_OPERATION_NAME_ATTRIBUTE;
	exports.GEN_AI_OUTPUT_MESSAGES_ATTRIBUTE = GEN_AI_OUTPUT_MESSAGES_ATTRIBUTE;
	exports.GEN_AI_PIPELINE_NAME_ATTRIBUTE = GEN_AI_PIPELINE_NAME_ATTRIBUTE;
	exports.GEN_AI_PROMPT_ATTRIBUTE = GEN_AI_PROMPT_ATTRIBUTE;
	exports.GEN_AI_REQUEST_AVAILABLE_TOOLS_ATTRIBUTE = GEN_AI_REQUEST_AVAILABLE_TOOLS_ATTRIBUTE;
	exports.GEN_AI_REQUEST_DIMENSIONS_ATTRIBUTE = GEN_AI_REQUEST_DIMENSIONS_ATTRIBUTE;
	exports.GEN_AI_REQUEST_ENCODING_FORMAT_ATTRIBUTE = GEN_AI_REQUEST_ENCODING_FORMAT_ATTRIBUTE;
	exports.GEN_AI_REQUEST_FREQUENCY_PENALTY_ATTRIBUTE = GEN_AI_REQUEST_FREQUENCY_PENALTY_ATTRIBUTE;
	exports.GEN_AI_REQUEST_MAX_TOKENS_ATTRIBUTE = GEN_AI_REQUEST_MAX_TOKENS_ATTRIBUTE;
	exports.GEN_AI_REQUEST_MODEL_ATTRIBUTE = GEN_AI_REQUEST_MODEL_ATTRIBUTE;
	exports.GEN_AI_REQUEST_PRESENCE_PENALTY_ATTRIBUTE = GEN_AI_REQUEST_PRESENCE_PENALTY_ATTRIBUTE;
	exports.GEN_AI_REQUEST_STREAM_ATTRIBUTE = GEN_AI_REQUEST_STREAM_ATTRIBUTE;
	exports.GEN_AI_REQUEST_TEMPERATURE_ATTRIBUTE = GEN_AI_REQUEST_TEMPERATURE_ATTRIBUTE;
	exports.GEN_AI_REQUEST_TOP_K_ATTRIBUTE = GEN_AI_REQUEST_TOP_K_ATTRIBUTE;
	exports.GEN_AI_REQUEST_TOP_P_ATTRIBUTE = GEN_AI_REQUEST_TOP_P_ATTRIBUTE;
	exports.GEN_AI_RESPONSE_FINISH_REASONS_ATTRIBUTE = GEN_AI_RESPONSE_FINISH_REASONS_ATTRIBUTE;
	exports.GEN_AI_RESPONSE_ID_ATTRIBUTE = GEN_AI_RESPONSE_ID_ATTRIBUTE;
	exports.GEN_AI_RESPONSE_MODEL_ATTRIBUTE = GEN_AI_RESPONSE_MODEL_ATTRIBUTE;
	exports.GEN_AI_RESPONSE_STOP_REASON_ATTRIBUTE = GEN_AI_RESPONSE_STOP_REASON_ATTRIBUTE;
	exports.GEN_AI_RESPONSE_STREAMING_ATTRIBUTE = GEN_AI_RESPONSE_STREAMING_ATTRIBUTE;
	exports.GEN_AI_RESPONSE_TEXT_ATTRIBUTE = GEN_AI_RESPONSE_TEXT_ATTRIBUTE;
	exports.GEN_AI_RESPONSE_TOOL_CALLS_ATTRIBUTE = GEN_AI_RESPONSE_TOOL_CALLS_ATTRIBUTE;
	exports.GEN_AI_SYSTEM_ATTRIBUTE = GEN_AI_SYSTEM_ATTRIBUTE;
	exports.GEN_AI_SYSTEM_INSTRUCTIONS_ATTRIBUTE = GEN_AI_SYSTEM_INSTRUCTIONS_ATTRIBUTE;
	exports.GEN_AI_TOOL_CALL_ID_ATTRIBUTE = GEN_AI_TOOL_CALL_ID_ATTRIBUTE;
	exports.GEN_AI_TOOL_DESCRIPTION_ATTRIBUTE = GEN_AI_TOOL_DESCRIPTION_ATTRIBUTE;
	exports.GEN_AI_TOOL_INPUT_ATTRIBUTE = GEN_AI_TOOL_INPUT_ATTRIBUTE;
	exports.GEN_AI_TOOL_NAME_ATTRIBUTE = GEN_AI_TOOL_NAME_ATTRIBUTE;
	exports.GEN_AI_TOOL_OUTPUT_ATTRIBUTE = GEN_AI_TOOL_OUTPUT_ATTRIBUTE;
	exports.GEN_AI_TOOL_TYPE_ATTRIBUTE = GEN_AI_TOOL_TYPE_ATTRIBUTE;
	exports.GEN_AI_USAGE_CACHE_CREATION_INPUT_TOKENS_ATTRIBUTE = GEN_AI_USAGE_CACHE_CREATION_INPUT_TOKENS_ATTRIBUTE;
	exports.GEN_AI_USAGE_CACHE_READ_INPUT_TOKENS_ATTRIBUTE = GEN_AI_USAGE_CACHE_READ_INPUT_TOKENS_ATTRIBUTE;
	exports.GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE = GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE;
	exports.GEN_AI_USAGE_INPUT_TOKENS_CACHED_ATTRIBUTE = GEN_AI_USAGE_INPUT_TOKENS_CACHED_ATTRIBUTE;
	exports.GEN_AI_USAGE_INPUT_TOKENS_CACHE_WRITE_ATTRIBUTE = GEN_AI_USAGE_INPUT_TOKENS_CACHE_WRITE_ATTRIBUTE;
	exports.GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE = GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE;
	exports.GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE = GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/ai/mediaStripping.js
var require_mediaStripping = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	function isContentMedia(part) {
		if (!part || typeof part !== "object") return false;
		return isContentMediaSource(part) || hasInlineData(part) || hasImageUrl(part) || hasInputAudio(part) || hasFileData(part) || hasMediaTypeData(part) || hasVercelFileData(part) || hasVercelImageData(part) || hasBlobOrBase64Type(part) || hasB64Json(part) || hasImageGenerationResult(part) || hasDataUri(part);
	}
	function hasImageUrl(part) {
		if (!("image_url" in part)) return false;
		if (typeof part.image_url === "string") return part.image_url.startsWith("data:");
		return hasNestedImageUrl(part);
	}
	function hasNestedImageUrl(part) {
		return "image_url" in part && !!part.image_url && typeof part.image_url === "object" && "url" in part.image_url && typeof part.image_url.url === "string" && part.image_url.url.startsWith("data:");
	}
	function isContentMediaSource(part) {
		return "type" in part && typeof part.type === "string" && "source" in part && isContentMedia(part.source);
	}
	function hasInlineData(part) {
		return "inlineData" in part && !!part.inlineData && typeof part.inlineData === "object" && "data" in part.inlineData && typeof part.inlineData.data === "string";
	}
	function hasInputAudio(part) {
		return "type" in part && part.type === "input_audio" && "input_audio" in part && !!part.input_audio && typeof part.input_audio === "object" && "data" in part.input_audio && typeof part.input_audio.data === "string";
	}
	function hasFileData(part) {
		return "type" in part && part.type === "file" && "file" in part && !!part.file && typeof part.file === "object" && "file_data" in part.file && typeof part.file.file_data === "string";
	}
	function hasMediaTypeData(part) {
		return "media_type" in part && typeof part.media_type === "string" && "data" in part;
	}
	function hasVercelFileData(part) {
		return "type" in part && part.type === "file" && "mediaType" in part && typeof part.mediaType === "string" && "data" in part && typeof part.data === "string" && !part.data.startsWith("http://") && !part.data.startsWith("https://");
	}
	function hasVercelImageData(part) {
		return "type" in part && part.type === "image" && "image" in part && typeof part.image === "string" && !part.image.startsWith("http://") && !part.image.startsWith("https://");
	}
	function hasBlobOrBase64Type(part) {
		return "type" in part && (part.type === "blob" || part.type === "base64");
	}
	function hasB64Json(part) {
		return "b64_json" in part;
	}
	function hasImageGenerationResult(part) {
		return "type" in part && "result" in part && part.type === "image_generation";
	}
	function hasDataUri(part) {
		return "uri" in part && typeof part.uri === "string" && part.uri.startsWith("data:");
	}
	const REMOVED_STRING = "[Blob substitute]";
	const MEDIA_FIELDS = [
		"image_url",
		"data",
		"content",
		"b64_json",
		"result",
		"uri",
		"image"
	];
	function stripInlineMediaFromSingleMessage(part) {
		const strip = { ...part };
		if (isContentMedia(strip.source)) strip.source = stripInlineMediaFromSingleMessage(strip.source);
		if (hasInlineData(part)) strip.inlineData = {
			...part.inlineData,
			data: REMOVED_STRING
		};
		if (hasNestedImageUrl(part)) strip.image_url = {
			...part.image_url,
			url: REMOVED_STRING
		};
		if (hasInputAudio(part)) strip.input_audio = {
			...part.input_audio,
			data: REMOVED_STRING
		};
		if (hasFileData(part)) strip.file = {
			...part.file,
			file_data: REMOVED_STRING
		};
		for (const field of MEDIA_FIELDS) if (typeof strip[field] === "string") strip[field] = REMOVED_STRING;
		return strip;
	}
	exports.isContentMedia = isContentMedia;
	exports.stripInlineMediaFromSingleMessage = stripInlineMediaFromSingleMessage;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/ai/messageTruncation.js
var require_messageTruncation = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const mediaStripping = require_mediaStripping();
	const DEFAULT_GEN_AI_MESSAGES_BYTE_LIMIT = 2e4;
	const utf8Bytes = (text) => {
		return new TextEncoder().encode(text).length;
	};
	const jsonBytes = (value) => {
		return utf8Bytes(JSON.stringify(value));
	};
	function truncateTextByBytes(text, maxBytes) {
		if (utf8Bytes(text) <= maxBytes) return text;
		let low = 0;
		let high = text.length;
		let bestFit = "";
		while (low <= high) {
			const mid = Math.floor((low + high) / 2);
			const candidate = text.slice(0, mid);
			if (utf8Bytes(candidate) <= maxBytes) {
				bestFit = candidate;
				low = mid + 1;
			} else high = mid - 1;
		}
		return bestFit;
	}
	function getItemText(item) {
		if (typeof item === "string") return item;
		if ("text" in item && typeof item.text === "string") return item.text;
		return "";
	}
	function withItemText(item, text) {
		if (typeof item === "string") return text;
		return {
			...item,
			text
		};
	}
	function isContentMessage(message) {
		return message !== null && typeof message === "object" && "content" in message && typeof message.content === "string";
	}
	function isContentArrayMessage(message) {
		return message !== null && typeof message === "object" && "content" in message && Array.isArray(message.content);
	}
	function isPartsMessage(message) {
		return message !== null && typeof message === "object" && "parts" in message && Array.isArray(message.parts) && message.parts.length > 0;
	}
	function truncateContentMessage(message, maxBytes) {
		const availableForContent = maxBytes - jsonBytes({
			...message,
			content: ""
		});
		if (availableForContent <= 0) return [];
		const truncatedContent = truncateTextByBytes(message.content, availableForContent);
		return [{
			...message,
			content: truncatedContent
		}];
	}
	function getArrayItems(message) {
		if ("parts" in message && Array.isArray(message.parts)) return {
			key: "parts",
			items: message.parts
		};
		if ("content" in message && Array.isArray(message.content)) return {
			key: "content",
			items: message.content
		};
		return {
			key: null,
			items: []
		};
	}
	function truncateArrayMessage(message, maxBytes) {
		const { key, items } = getArrayItems(message);
		if (key === null || items.length === 0) return [];
		const emptyItems = items.map((item) => withItemText(item, ""));
		let remainingBytes = maxBytes - jsonBytes({
			...message,
			[key]: emptyItems
		});
		if (remainingBytes <= 0) return [];
		const includedItems = [];
		for (const item of items) {
			const text = getItemText(item);
			const textSize = utf8Bytes(text);
			if (textSize <= remainingBytes) {
				includedItems.push(item);
				remainingBytes -= textSize;
			} else if (includedItems.length === 0) {
				const truncated = truncateTextByBytes(text, remainingBytes);
				if (truncated) includedItems.push(withItemText(item, truncated));
				break;
			} else break;
		}
		if (includedItems.length <= 0) return [];
		else return [{
			...message,
			[key]: includedItems
		}];
	}
	function truncateSingleMessage(message, maxBytes) {
		if (!message) return [];
		if (typeof message === "string") {
			const truncated = truncateTextByBytes(message, maxBytes);
			return truncated ? [truncated] : [];
		}
		if (typeof message !== "object") return [];
		if (isContentMessage(message)) return truncateContentMessage(message, maxBytes);
		if (isContentArrayMessage(message) || isPartsMessage(message)) return truncateArrayMessage(message, maxBytes);
		return [];
	}
	function stripInlineMediaFromMessages(messages) {
		return messages.map((message) => {
			let newMessage = void 0;
			if (!!message && typeof message === "object") {
				if (isContentArrayMessage(message)) newMessage = {
					...message,
					content: stripInlineMediaFromMessages(message.content)
				};
				else if ("content" in message && mediaStripping.isContentMedia(message.content)) newMessage = {
					...message,
					content: mediaStripping.stripInlineMediaFromSingleMessage(message.content)
				};
				if (isPartsMessage(message)) newMessage = {
					...newMessage ?? message,
					parts: stripInlineMediaFromMessages(message.parts)
				};
				if (mediaStripping.isContentMedia(newMessage)) newMessage = mediaStripping.stripInlineMediaFromSingleMessage(newMessage);
				else if (mediaStripping.isContentMedia(message)) newMessage = mediaStripping.stripInlineMediaFromSingleMessage(message);
			}
			return newMessage ?? message;
		});
	}
	function truncateMessagesByBytes(messages, maxBytes) {
		if (!Array.isArray(messages) || messages.length === 0) return messages;
		const effectiveMaxBytes = maxBytes - 2;
		const lastMessage = messages[messages.length - 1];
		const stripped = stripInlineMediaFromMessages([lastMessage]);
		const strippedMessage = stripped[0];
		if (jsonBytes(strippedMessage) <= effectiveMaxBytes) return stripped;
		return truncateSingleMessage(strippedMessage, effectiveMaxBytes);
	}
	function truncateGenAiMessages(messages) {
		return truncateMessagesByBytes(messages, DEFAULT_GEN_AI_MESSAGES_BYTE_LIMIT);
	}
	function truncateGenAiStringInput(input) {
		return truncateTextByBytes(input, DEFAULT_GEN_AI_MESSAGES_BYTE_LIMIT);
	}
	exports.DEFAULT_GEN_AI_MESSAGES_BYTE_LIMIT = DEFAULT_GEN_AI_MESSAGES_BYTE_LIMIT;
	exports.truncateGenAiMessages = truncateGenAiMessages;
	exports.truncateGenAiStringInput = truncateGenAiStringInput;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/ai/utils.js
var require_utils$7 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const exports$1 = require_exports$1();
	const currentScopes = require_currentScopes();
	const hasSpanStreamingEnabled = require_hasSpanStreamingEnabled();
	const is = require_is();
	const genAiAttributes = require_gen_ai_attributes();
	const messageTruncation = require_messageTruncation();
	function resolveAIRecordingOptions(options) {
		const genAI = currentScopes.getClient()?.getDataCollectionOptions().genAI;
		return {
			...options,
			recordInputs: options?.recordInputs ?? genAI?.inputs ?? false,
			recordOutputs: options?.recordOutputs ?? genAI?.outputs ?? false
		};
	}
	function shouldEnableTruncation(enableTruncation) {
		if (enableTruncation !== void 0) return enableTruncation;
		const client = currentScopes.getClient();
		if (!client) return true;
		return !hasSpanStreamingEnabled.hasSpanStreamingEnabled(client) && client.getOptions().streamGenAiSpans === false;
	}
	function buildMethodPath(currentPath, prop) {
		return currentPath ? `${currentPath}.${prop}` : prop;
	}
	function setTokenUsageAttributes(span, promptTokens, completionTokens, cachedInputTokens, cachedOutputTokens) {
		if (promptTokens !== void 0) span.setAttributes({ [genAiAttributes.GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE]: promptTokens });
		if (completionTokens !== void 0) span.setAttributes({ [genAiAttributes.GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE]: completionTokens });
		if (promptTokens !== void 0 || completionTokens !== void 0 || cachedInputTokens !== void 0 || cachedOutputTokens !== void 0) {
			const totalTokens = (promptTokens ?? 0) + (completionTokens ?? 0) + (cachedInputTokens ?? 0) + (cachedOutputTokens ?? 0);
			span.setAttributes({ [genAiAttributes.GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE]: totalTokens });
		}
	}
	function endStreamSpan(span, state, recordOutputs) {
		if (!span.isRecording()) return;
		const attrs = { [genAiAttributes.GEN_AI_RESPONSE_STREAMING_ATTRIBUTE]: true };
		if (state.responseId) attrs[genAiAttributes.GEN_AI_RESPONSE_ID_ATTRIBUTE] = state.responseId;
		if (state.responseModel) attrs[genAiAttributes.GEN_AI_RESPONSE_MODEL_ATTRIBUTE] = state.responseModel;
		if (state.promptTokens !== void 0) attrs[genAiAttributes.GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE] = state.promptTokens;
		if (state.completionTokens !== void 0) attrs[genAiAttributes.GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE] = state.completionTokens;
		if (state.totalTokens !== void 0) attrs[genAiAttributes.GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE] = state.totalTokens;
		else if (state.promptTokens !== void 0 || state.completionTokens !== void 0 || state.cacheCreationInputTokens !== void 0 || state.cacheReadInputTokens !== void 0) attrs[genAiAttributes.GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE] = (state.promptTokens ?? 0) + (state.completionTokens ?? 0) + (state.cacheCreationInputTokens ?? 0) + (state.cacheReadInputTokens ?? 0);
		if (state.finishReasons.length) attrs[genAiAttributes.GEN_AI_RESPONSE_FINISH_REASONS_ATTRIBUTE] = JSON.stringify(state.finishReasons);
		if (recordOutputs && state.responseTexts.length) attrs[genAiAttributes.GEN_AI_RESPONSE_TEXT_ATTRIBUTE] = state.responseTexts.join("");
		if (recordOutputs && state.toolCalls.length) attrs[genAiAttributes.GEN_AI_RESPONSE_TOOL_CALLS_ATTRIBUTE] = JSON.stringify(state.toolCalls);
		span.setAttributes(attrs);
		span.end();
	}
	function getJsonString(value) {
		if (typeof value === "string") return value;
		return JSON.stringify(value);
	}
	function getTruncatedJsonString(value) {
		if (typeof value === "string") return messageTruncation.truncateGenAiStringInput(value);
		if (Array.isArray(value)) {
			const truncatedMessages = messageTruncation.truncateGenAiMessages(value);
			return JSON.stringify(truncatedMessages);
		}
		return JSON.stringify(value);
	}
	function extractSystemInstructions(messages) {
		if (!Array.isArray(messages)) return {
			systemInstructions: void 0,
			filteredMessages: messages
		};
		const systemMessageIndex = messages.findIndex((msg) => msg && typeof msg === "object" && "role" in msg && msg.role === "system");
		if (systemMessageIndex === -1) return {
			systemInstructions: void 0,
			filteredMessages: messages
		};
		const systemMessage = messages[systemMessageIndex];
		const systemContent = typeof systemMessage.content === "string" ? systemMessage.content : systemMessage.content !== void 0 ? JSON.stringify(systemMessage.content) : void 0;
		if (!systemContent) return {
			systemInstructions: void 0,
			filteredMessages: messages
		};
		return {
			systemInstructions: JSON.stringify([{
				type: "text",
				content: systemContent
			}]),
			filteredMessages: [...messages.slice(0, systemMessageIndex), ...messages.slice(systemMessageIndex + 1)]
		};
	}
	async function createWithResponseWrapper(originalWithResponse, instrumentedPromise, mechanismType) {
		const safeOriginalWithResponse = originalWithResponse.catch((error) => {
			exports$1.captureException(error, { mechanism: {
				handled: false,
				type: mechanismType
			} });
			throw error;
		});
		const instrumentedResult = await instrumentedPromise;
		const originalWrapper = await safeOriginalWithResponse;
		if (originalWrapper && typeof originalWrapper === "object" && "data" in originalWrapper) return {
			...originalWrapper,
			data: instrumentedResult
		};
		return instrumentedResult;
	}
	function wrapPromiseWithMethods(originalPromiseLike, instrumentedPromise, mechanismType) {
		if (!is.isThenable(originalPromiseLike)) return instrumentedPromise;
		return new Proxy(originalPromiseLike, { get(target, prop) {
			const source = prop in Promise.prototype || prop === Symbol.toStringTag ? instrumentedPromise : target;
			const value = Reflect.get(source, prop);
			if (prop === "withResponse" && typeof value === "function") return function wrappedWithResponse() {
				return createWithResponseWrapper(value.call(target), instrumentedPromise, mechanismType);
			};
			return typeof value === "function" ? value.bind(source) : value;
		} });
	}
	exports.buildMethodPath = buildMethodPath;
	exports.endStreamSpan = endStreamSpan;
	exports.extractSystemInstructions = extractSystemInstructions;
	exports.getJsonString = getJsonString;
	exports.getTruncatedJsonString = getTruncatedJsonString;
	exports.resolveAIRecordingOptions = resolveAIRecordingOptions;
	exports.setTokenUsageAttributes = setTokenUsageAttributes;
	exports.shouldEnableTruncation = shouldEnableTruncation;
	exports.wrapPromiseWithMethods = wrapPromiseWithMethods;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/vercel-ai/constants.js
var require_constants$6 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const toolCallSpanContextMap = /* @__PURE__ */ new Map();
	const toolDescriptionMap = /* @__PURE__ */ new Map();
	exports.SPAN_TO_OPERATION_NAME = /* @__PURE__ */ new Map([
		["ai.generateText", "invoke_agent"],
		["ai.streamText", "invoke_agent"],
		["ai.generateObject", "invoke_agent"],
		["ai.streamObject", "invoke_agent"],
		["ai.generateText.doGenerate", "generate_content"],
		["ai.streamText.doStream", "generate_content"],
		["ai.generateObject.doGenerate", "generate_content"],
		["ai.streamObject.doStream", "generate_content"],
		["ai.embed.doEmbed", "embeddings"],
		["ai.embedMany.doEmbed", "embeddings"],
		["ai.rerank.doRerank", "rerank"],
		["ai.toolCall", "execute_tool"]
	]);
	exports.toolCallSpanContextMap = toolCallSpanContextMap;
	exports.toolDescriptionMap = toolDescriptionMap;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/vercel-ai/vercel-ai-attributes.js
var require_vercel_ai_attributes = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const OPERATION_NAME_ATTRIBUTE = "operation.name";
	const AI_OPERATION_ID_ATTRIBUTE = "ai.operationId";
	const AI_PROMPT_ATTRIBUTE = "ai.prompt";
	const AI_SCHEMA_ATTRIBUTE = "ai.schema";
	const AI_RESPONSE_OBJECT_ATTRIBUTE = "ai.response.object";
	const AI_VALUES_ATTRIBUTE = "ai.values";
	const AI_RESPONSE_TEXT_ATTRIBUTE = "ai.response.text";
	const AI_RESPONSE_TOOL_CALLS_ATTRIBUTE = "ai.response.toolCalls";
	const AI_RESPONSE_FINISH_REASON_ATTRIBUTE = "ai.response.finishReason";
	const AI_PROMPT_MESSAGES_ATTRIBUTE = "ai.prompt.messages";
	const AI_PROMPT_TOOLS_ATTRIBUTE = "ai.prompt.tools";
	const AI_MODEL_ID_ATTRIBUTE = "ai.model.id";
	const AI_RESPONSE_PROVIDER_METADATA_ATTRIBUTE = "ai.response.providerMetadata";
	const AI_USAGE_CACHED_INPUT_TOKENS_ATTRIBUTE = "ai.usage.cachedInputTokens";
	const AI_USAGE_INPUT_TOKEN_DETAILS_ATTRIBUTE_PREFIX = "ai.usage.inputTokenDetails.";
	const AI_TELEMETRY_FUNCTION_ID_ATTRIBUTE = "ai.telemetry.functionId";
	const AI_USAGE_COMPLETION_TOKENS_ATTRIBUTE = "ai.usage.completionTokens";
	const AI_USAGE_PROMPT_TOKENS_ATTRIBUTE = "ai.usage.promptTokens";
	const AI_USAGE_TOKENS_ATTRIBUTE = "ai.usage.tokens";
	const AI_TOOL_CALL_NAME_ATTRIBUTE = "ai.toolCall.name";
	const AI_TOOL_CALL_ID_ATTRIBUTE = "ai.toolCall.id";
	const AI_TOOL_CALL_ARGS_ATTRIBUTE = "ai.toolCall.args";
	const AI_TOOL_CALL_RESULT_ATTRIBUTE = "ai.toolCall.result";
	exports.AI_MODEL_ID_ATTRIBUTE = AI_MODEL_ID_ATTRIBUTE;
	exports.AI_OPERATION_ID_ATTRIBUTE = AI_OPERATION_ID_ATTRIBUTE;
	exports.AI_PROMPT_ATTRIBUTE = AI_PROMPT_ATTRIBUTE;
	exports.AI_PROMPT_MESSAGES_ATTRIBUTE = AI_PROMPT_MESSAGES_ATTRIBUTE;
	exports.AI_PROMPT_TOOLS_ATTRIBUTE = AI_PROMPT_TOOLS_ATTRIBUTE;
	exports.AI_RESPONSE_FINISH_REASON_ATTRIBUTE = AI_RESPONSE_FINISH_REASON_ATTRIBUTE;
	exports.AI_RESPONSE_OBJECT_ATTRIBUTE = AI_RESPONSE_OBJECT_ATTRIBUTE;
	exports.AI_RESPONSE_PROVIDER_METADATA_ATTRIBUTE = AI_RESPONSE_PROVIDER_METADATA_ATTRIBUTE;
	exports.AI_RESPONSE_TEXT_ATTRIBUTE = AI_RESPONSE_TEXT_ATTRIBUTE;
	exports.AI_RESPONSE_TOOL_CALLS_ATTRIBUTE = AI_RESPONSE_TOOL_CALLS_ATTRIBUTE;
	exports.AI_SCHEMA_ATTRIBUTE = AI_SCHEMA_ATTRIBUTE;
	exports.AI_TELEMETRY_FUNCTION_ID_ATTRIBUTE = AI_TELEMETRY_FUNCTION_ID_ATTRIBUTE;
	exports.AI_TOOL_CALL_ARGS_ATTRIBUTE = AI_TOOL_CALL_ARGS_ATTRIBUTE;
	exports.AI_TOOL_CALL_ID_ATTRIBUTE = AI_TOOL_CALL_ID_ATTRIBUTE;
	exports.AI_TOOL_CALL_NAME_ATTRIBUTE = AI_TOOL_CALL_NAME_ATTRIBUTE;
	exports.AI_TOOL_CALL_RESULT_ATTRIBUTE = AI_TOOL_CALL_RESULT_ATTRIBUTE;
	exports.AI_USAGE_CACHED_INPUT_TOKENS_ATTRIBUTE = AI_USAGE_CACHED_INPUT_TOKENS_ATTRIBUTE;
	exports.AI_USAGE_COMPLETION_TOKENS_ATTRIBUTE = AI_USAGE_COMPLETION_TOKENS_ATTRIBUTE;
	exports.AI_USAGE_INPUT_TOKEN_DETAILS_ATTRIBUTE_PREFIX = AI_USAGE_INPUT_TOKEN_DETAILS_ATTRIBUTE_PREFIX;
	exports.AI_USAGE_PROMPT_TOKENS_ATTRIBUTE = AI_USAGE_PROMPT_TOKENS_ATTRIBUTE;
	exports.AI_USAGE_TOKENS_ATTRIBUTE = AI_USAGE_TOKENS_ATTRIBUTE;
	exports.AI_VALUES_ATTRIBUTE = AI_VALUES_ATTRIBUTE;
	exports.OPERATION_NAME_ATTRIBUTE = OPERATION_NAME_ATTRIBUTE;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/vercel-ai/utils.js
var require_utils$6 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const genAiAttributes = require_gen_ai_attributes();
	const utils = require_utils$7();
	const constants = require_constants$6();
	const vercelAiAttributes = require_vercel_ai_attributes();
	function accumulateTokensForParent(span, tokenAccumulator) {
		const parentSpanId = span.parent_span_id;
		if (!parentSpanId) return;
		const inputTokens = span.data[genAiAttributes.GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE];
		const outputTokens = span.data[genAiAttributes.GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE];
		if (typeof inputTokens === "number" || typeof outputTokens === "number") {
			const existing = tokenAccumulator.get(parentSpanId) || {
				inputTokens: 0,
				outputTokens: 0
			};
			if (typeof inputTokens === "number") existing.inputTokens += inputTokens;
			if (typeof outputTokens === "number") existing.outputTokens += outputTokens;
			tokenAccumulator.set(parentSpanId, existing);
		}
	}
	function applyAccumulatedTokens(spanOrTrace, tokenAccumulator) {
		const accumulated = tokenAccumulator.get(spanOrTrace.span_id);
		if (!accumulated || !spanOrTrace.data) return;
		if (accumulated.inputTokens > 0) spanOrTrace.data[genAiAttributes.GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE] = accumulated.inputTokens;
		if (accumulated.outputTokens > 0) spanOrTrace.data[genAiAttributes.GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE] = accumulated.outputTokens;
		if (accumulated.inputTokens > 0 || accumulated.outputTokens > 0) spanOrTrace.data["gen_ai.usage.total_tokens"] = accumulated.inputTokens + accumulated.outputTokens;
	}
	function buildToolDescriptionMap(spans) {
		const toolDescriptions = /* @__PURE__ */ new Map();
		for (const span of spans) {
			const availableTools = span.data[genAiAttributes.GEN_AI_REQUEST_AVAILABLE_TOOLS_ATTRIBUTE];
			if (typeof availableTools !== "string") continue;
			try {
				const tools = JSON.parse(availableTools);
				for (const tool of tools) if (tool.name && tool.description && !toolDescriptions.has(tool.name)) toolDescriptions.set(tool.name, tool.description);
			} catch {}
		}
		return toolDescriptions;
	}
	function applyToolDescriptionsAndTokens(spans, tokenAccumulator) {
		const toolDescriptions = buildToolDescriptionMap(spans);
		for (const span of spans) {
			if (span.op === "gen_ai.execute_tool") {
				const toolName = span.data[genAiAttributes.GEN_AI_TOOL_NAME_ATTRIBUTE];
				if (typeof toolName === "string") {
					const description = toolDescriptions.get(toolName);
					if (description) span.data[genAiAttributes.GEN_AI_TOOL_DESCRIPTION_ATTRIBUTE] = description;
				}
			}
			if (span.op === "gen_ai.invoke_agent") applyAccumulatedTokens(span, tokenAccumulator);
		}
	}
	function _INTERNAL_getSpanContextForToolCallId(toolCallId) {
		return constants.toolCallSpanContextMap.get(toolCallId);
	}
	function _INTERNAL_cleanupToolCallSpanContext(toolCallId) {
		constants.toolCallSpanContextMap.delete(toolCallId);
	}
	function convertAvailableToolsToJsonString(tools) {
		const toolObjects = tools.map((tool) => {
			if (typeof tool === "string") try {
				return JSON.parse(tool);
			} catch {
				return tool;
			}
			return tool;
		});
		return JSON.stringify(toolObjects);
	}
	function filterMessagesArray(input) {
		return input.filter((m) => !!m && typeof m === "object" && "role" in m && "content" in m);
	}
	function convertUserInputToMessagesFormat(userInput) {
		try {
			const p = JSON.parse(userInput);
			if (!!p && typeof p === "object") {
				let { messages } = p;
				const { prompt, system } = p;
				const result = [];
				if (typeof system === "string") result.push({
					role: "system",
					content: system
				});
				if (typeof messages === "string") try {
					messages = JSON.parse(messages);
				} catch {}
				if (Array.isArray(messages)) {
					result.push(...filterMessagesArray(messages));
					return result;
				}
				if (Array.isArray(prompt)) {
					result.push(...filterMessagesArray(prompt));
					return result;
				}
				if (typeof prompt === "string") result.push({
					role: "user",
					content: prompt
				});
				if (result.length > 0) return result;
			}
		} catch {}
		return [];
	}
	function requestMessagesFromPrompt(span, attributes, enableTruncation) {
		if (typeof attributes[vercelAiAttributes.AI_PROMPT_ATTRIBUTE] === "string" && !attributes[genAiAttributes.GEN_AI_INPUT_MESSAGES_ATTRIBUTE] && !attributes[vercelAiAttributes.AI_PROMPT_MESSAGES_ATTRIBUTE]) {
			const userInput = attributes[vercelAiAttributes.AI_PROMPT_ATTRIBUTE];
			const messages = convertUserInputToMessagesFormat(userInput);
			if (messages.length) {
				const { systemInstructions, filteredMessages } = utils.extractSystemInstructions(messages);
				if (systemInstructions) span.setAttribute(genAiAttributes.GEN_AI_SYSTEM_INSTRUCTIONS_ATTRIBUTE, systemInstructions);
				const filteredLength = Array.isArray(filteredMessages) ? filteredMessages.length : 0;
				const messagesJson = enableTruncation ? utils.getTruncatedJsonString(filteredMessages) : utils.getJsonString(filteredMessages);
				span.setAttributes({
					[vercelAiAttributes.AI_PROMPT_ATTRIBUTE]: messagesJson,
					[genAiAttributes.GEN_AI_INPUT_MESSAGES_ATTRIBUTE]: messagesJson,
					[genAiAttributes.GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE]: filteredLength
				});
			}
		} else if (typeof attributes[vercelAiAttributes.AI_PROMPT_MESSAGES_ATTRIBUTE] === "string") {
			const originalMessagesJson = attributes[vercelAiAttributes.AI_PROMPT_MESSAGES_ATTRIBUTE];
			try {
				const messages = JSON.parse(originalMessagesJson);
				if (Array.isArray(messages)) {
					const { systemInstructions, filteredMessages } = utils.extractSystemInstructions(messages);
					if (systemInstructions) span.setAttribute(genAiAttributes.GEN_AI_SYSTEM_INSTRUCTIONS_ATTRIBUTE, systemInstructions);
					const filteredLength = Array.isArray(filteredMessages) ? filteredMessages.length : 0;
					const messagesJson = !enableTruncation && filteredMessages === messages ? originalMessagesJson : enableTruncation ? utils.getTruncatedJsonString(filteredMessages) : utils.getJsonString(filteredMessages);
					span.setAttributes({
						[vercelAiAttributes.AI_PROMPT_MESSAGES_ATTRIBUTE]: messagesJson,
						[genAiAttributes.GEN_AI_INPUT_MESSAGES_ATTRIBUTE]: messagesJson,
						[genAiAttributes.GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE]: filteredLength
					});
				}
			} catch {}
		}
	}
	exports._INTERNAL_cleanupToolCallSpanContext = _INTERNAL_cleanupToolCallSpanContext;
	exports._INTERNAL_getSpanContextForToolCallId = _INTERNAL_getSpanContextForToolCallId;
	exports.accumulateTokensForParent = accumulateTokensForParent;
	exports.applyAccumulatedTokens = applyAccumulatedTokens;
	exports.applyToolDescriptionsAndTokens = applyToolDescriptionsAndTokens;
	exports.convertAvailableToolsToJsonString = convertAvailableToolsToJsonString;
	exports.convertUserInputToMessagesFormat = convertUserInputToMessagesFormat;
	exports.requestMessagesFromPrompt = requestMessagesFromPrompt;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/vercel-ai/index.js
var require_vercel_ai = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const currentScopes = require_currentScopes();
	const semanticAttributes = require_semanticAttributes();
	const utils = require_utils$7();
	const spanUtils = require_spanUtils();
	const genAiAttributes = require_gen_ai_attributes();
	const constants = require_constants$6();
	const hasSpanStreamingEnabled = require_hasSpanStreamingEnabled();
	const utils$1 = require_utils$6();
	const vercelAiAttributes = require_vercel_ai_attributes();
	function onVercelAiSpanStart(span) {
		const { data: attributes, description: name } = spanUtils.spanToJSON(span);
		if (!name) return;
		if (attributes[vercelAiAttributes.AI_TOOL_CALL_NAME_ATTRIBUTE] && attributes[vercelAiAttributes.AI_TOOL_CALL_ID_ATTRIBUTE] && name === "ai.toolCall") {
			processToolCallSpan(span, attributes);
			return;
		}
		if (!attributes[vercelAiAttributes.AI_OPERATION_ID_ATTRIBUTE] && !name.startsWith("ai.")) return;
		const integration = currentScopes.getClient()?.getIntegrationByName("VercelAI");
		processGenerateSpan(span, name, attributes, utils.shouldEnableTruncation(integration?.options?.enableTruncation));
	}
	function vercelAiEventProcessor(event) {
		if (event.type === "transaction" && event.spans) {
			const tokenAccumulator = /* @__PURE__ */ new Map();
			for (const span of event.spans) {
				processEndedVercelAiSpan(span);
				utils$1.accumulateTokensForParent(span, tokenAccumulator);
			}
			utils$1.applyToolDescriptionsAndTokens(event.spans, tokenAccumulator);
			const trace = event.contexts?.trace;
			if (trace?.op === "gen_ai.invoke_agent") utils$1.applyAccumulatedTokens(trace, tokenAccumulator);
		}
		return event;
	}
	function normalizeFinishReason(finishReason) {
		if (typeof finishReason !== "string") return "stop";
		switch (finishReason) {
			case "tool-calls": return "tool_call";
			case "stop":
			case "length":
			case "content_filter":
			case "error": return finishReason;
			default: return finishReason;
		}
	}
	function buildOutputMessages(attributes) {
		const responseText = attributes[vercelAiAttributes.AI_RESPONSE_TEXT_ATTRIBUTE];
		const responseToolCalls = attributes[vercelAiAttributes.AI_RESPONSE_TOOL_CALLS_ATTRIBUTE];
		const finishReason = attributes[vercelAiAttributes.AI_RESPONSE_FINISH_REASON_ATTRIBUTE];
		if (responseText == null && responseToolCalls == null) return;
		const parts = [];
		if (typeof responseText === "string" && responseText.length > 0) parts.push({
			type: "text",
			content: responseText
		});
		if (responseToolCalls != null) try {
			const toolCalls = typeof responseToolCalls === "string" ? JSON.parse(responseToolCalls) : responseToolCalls;
			if (Array.isArray(toolCalls)) {
				for (const toolCall of toolCalls) {
					const args = toolCall.input ?? toolCall.args;
					parts.push({
						type: "tool_call",
						id: toolCall.toolCallId,
						name: toolCall.toolName,
						arguments: typeof args === "string" ? args : JSON.stringify(args ?? {})
					});
				}
				delete attributes[vercelAiAttributes.AI_RESPONSE_TOOL_CALLS_ATTRIBUTE];
			}
		} catch {}
		if (parts.length > 0) {
			const outputMessage = {
				role: "assistant",
				parts,
				finish_reason: normalizeFinishReason(finishReason)
			};
			attributes[genAiAttributes.GEN_AI_OUTPUT_MESSAGES_ATTRIBUTE] = JSON.stringify([outputMessage]);
			delete attributes[vercelAiAttributes.AI_RESPONSE_TEXT_ATTRIBUTE];
		}
	}
	function processVercelAiSpanAttributes(attributes) {
		renameAttributeKey(attributes, vercelAiAttributes.AI_USAGE_COMPLETION_TOKENS_ATTRIBUTE, genAiAttributes.GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE);
		renameAttributeKey(attributes, vercelAiAttributes.AI_USAGE_PROMPT_TOKENS_ATTRIBUTE, genAiAttributes.GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE);
		renameAttributeKey(attributes, vercelAiAttributes.AI_USAGE_CACHED_INPUT_TOKENS_ATTRIBUTE, genAiAttributes.GEN_AI_USAGE_INPUT_TOKENS_CACHED_ATTRIBUTE);
		renameAttributeKey(attributes, "ai.usage.inputTokens", genAiAttributes.GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE);
		renameAttributeKey(attributes, "ai.usage.outputTokens", genAiAttributes.GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE);
		renameAttributeKey(attributes, vercelAiAttributes.AI_USAGE_TOKENS_ATTRIBUTE, genAiAttributes.GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE);
		renameAttributeKey(attributes, "ai.response.avgOutputTokensPerSecond", "ai.response.avgCompletionTokensPerSecond");
		if (!Object.keys(attributes).some((key) => key.startsWith(vercelAiAttributes.AI_USAGE_INPUT_TOKEN_DETAILS_ATTRIBUTE_PREFIX)) && typeof attributes[genAiAttributes.GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE] === "number" && typeof attributes[genAiAttributes.GEN_AI_USAGE_INPUT_TOKENS_CACHED_ATTRIBUTE] === "number") attributes[genAiAttributes.GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE] = attributes[genAiAttributes.GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE] + attributes[genAiAttributes.GEN_AI_USAGE_INPUT_TOKENS_CACHED_ATTRIBUTE];
		if (typeof attributes[genAiAttributes.GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE] === "number") {
			const outputTokens = typeof attributes[genAiAttributes.GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE] === "number" ? attributes[genAiAttributes.GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE] : 0;
			attributes[genAiAttributes.GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE] = outputTokens + attributes[genAiAttributes.GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE];
		}
		if (attributes[vercelAiAttributes.AI_PROMPT_TOOLS_ATTRIBUTE] && Array.isArray(attributes[vercelAiAttributes.AI_PROMPT_TOOLS_ATTRIBUTE])) attributes[vercelAiAttributes.AI_PROMPT_TOOLS_ATTRIBUTE] = utils$1.convertAvailableToolsToJsonString(attributes[vercelAiAttributes.AI_PROMPT_TOOLS_ATTRIBUTE]);
		if (attributes[vercelAiAttributes.OPERATION_NAME_ATTRIBUTE]) {
			const rawOperationName = attributes[vercelAiAttributes.AI_OPERATION_ID_ATTRIBUTE] ? attributes[vercelAiAttributes.AI_OPERATION_ID_ATTRIBUTE] : attributes[vercelAiAttributes.OPERATION_NAME_ATTRIBUTE];
			const operationName = constants.SPAN_TO_OPERATION_NAME.get(rawOperationName) ?? rawOperationName;
			attributes[genAiAttributes.GEN_AI_OPERATION_NAME_ATTRIBUTE] = operationName;
			delete attributes[vercelAiAttributes.OPERATION_NAME_ATTRIBUTE];
		}
		renameAttributeKey(attributes, vercelAiAttributes.AI_PROMPT_MESSAGES_ATTRIBUTE, genAiAttributes.GEN_AI_INPUT_MESSAGES_ATTRIBUTE);
		buildOutputMessages(attributes);
		renameAttributeKey(attributes, vercelAiAttributes.AI_RESPONSE_OBJECT_ATTRIBUTE, "gen_ai.response.object");
		renameAttributeKey(attributes, vercelAiAttributes.AI_PROMPT_TOOLS_ATTRIBUTE, "gen_ai.request.available_tools");
		renameAttributeKey(attributes, vercelAiAttributes.AI_TOOL_CALL_ARGS_ATTRIBUTE, genAiAttributes.GEN_AI_TOOL_INPUT_ATTRIBUTE);
		renameAttributeKey(attributes, vercelAiAttributes.AI_TOOL_CALL_RESULT_ATTRIBUTE, genAiAttributes.GEN_AI_TOOL_OUTPUT_ATTRIBUTE);
		renameAttributeKey(attributes, vercelAiAttributes.AI_SCHEMA_ATTRIBUTE, "gen_ai.request.schema");
		renameAttributeKey(attributes, vercelAiAttributes.AI_MODEL_ID_ATTRIBUTE, genAiAttributes.GEN_AI_REQUEST_MODEL_ATTRIBUTE);
		if (Array.isArray(attributes[vercelAiAttributes.AI_VALUES_ATTRIBUTE])) {
			const parsed = attributes[vercelAiAttributes.AI_VALUES_ATTRIBUTE].map((v) => {
				try {
					return JSON.parse(v);
				} catch {
					return v;
				}
			});
			attributes[genAiAttributes.GEN_AI_EMBEDDINGS_INPUT_ATTRIBUTE] = parsed.length === 1 ? parsed[0] : JSON.stringify(parsed);
		}
		addProviderMetadataToAttributes(attributes);
		for (const key of Object.keys(attributes)) {
			if (Array.isArray(attributes[key])) attributes[key] = JSON.stringify(attributes[key]);
			if (key.startsWith("ai.")) renameAttributeKey(attributes, key, `vercel.${key}`);
		}
	}
	function processEndedVercelAiSpan(span) {
		const { data: attributes, origin } = span;
		if (origin !== "auto.vercelai.otel") return;
		if (span.status && span.status !== "ok") span.status = "internal_error";
		processVercelAiSpanAttributes(attributes);
	}
	function processVercelAiStreamedSpan(span) {
		const attributes = span.attributes;
		if (attributes?.[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN] !== "auto.vercelai.otel") return;
		processVercelAiSpanAttributes(attributes);
		if (attributes[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_OP] === "gen_ai.execute_tool" && span.parent_span_id) {
			const descriptions = constants.toolDescriptionMap.get(span.parent_span_id);
			if (descriptions) {
				const toolName = attributes[genAiAttributes.GEN_AI_TOOL_NAME_ATTRIBUTE];
				if (typeof toolName === "string") {
					const desc = descriptions.get(toolName);
					if (desc) attributes[genAiAttributes.GEN_AI_TOOL_DESCRIPTION_ATTRIBUTE] = desc;
				}
			}
		}
		constants.toolDescriptionMap.delete(span.span_id);
	}
	function renameAttributeKey(attributes, oldKey, newKey) {
		if (attributes[oldKey] != null) {
			attributes[newKey] = attributes[oldKey];
			delete attributes[oldKey];
		}
	}
	function processToolCallSpan(span, attributes) {
		span.setAttribute(semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, "auto.vercelai.otel");
		span.setAttribute(semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_OP, "gen_ai.execute_tool");
		span.setAttribute(genAiAttributes.GEN_AI_OPERATION_NAME_ATTRIBUTE, "execute_tool");
		renameAttributeKey(attributes, vercelAiAttributes.AI_TOOL_CALL_NAME_ATTRIBUTE, genAiAttributes.GEN_AI_TOOL_NAME_ATTRIBUTE);
		renameAttributeKey(attributes, vercelAiAttributes.AI_TOOL_CALL_ID_ATTRIBUTE, genAiAttributes.GEN_AI_TOOL_CALL_ID_ATTRIBUTE);
		const toolCallId = attributes[genAiAttributes.GEN_AI_TOOL_CALL_ID_ATTRIBUTE];
		if (typeof toolCallId === "string") constants.toolCallSpanContextMap.set(toolCallId, span.spanContext());
		if (!attributes[genAiAttributes.GEN_AI_TOOL_TYPE_ATTRIBUTE]) span.setAttribute(genAiAttributes.GEN_AI_TOOL_TYPE_ATTRIBUTE, "function");
		const toolName = attributes[genAiAttributes.GEN_AI_TOOL_NAME_ATTRIBUTE];
		if (toolName) span.updateName(`execute_tool ${toolName}`);
	}
	function processGenerateSpan(span, name, attributes, enableTruncation) {
		span.setAttribute(semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, "auto.vercelai.otel");
		const nameWthoutAi = name.replace("ai.", "");
		span.setAttribute("ai.pipeline.name", nameWthoutAi);
		span.updateName(nameWthoutAi);
		const functionId = attributes[vercelAiAttributes.AI_TELEMETRY_FUNCTION_ID_ATTRIBUTE];
		if (functionId && typeof functionId === "string") span.setAttribute("gen_ai.function_id", functionId);
		utils$1.requestMessagesFromPrompt(span, attributes, enableTruncation);
		if (attributes[vercelAiAttributes.AI_MODEL_ID_ATTRIBUTE] && !attributes[genAiAttributes.GEN_AI_RESPONSE_MODEL_ATTRIBUTE]) span.setAttribute(genAiAttributes.GEN_AI_RESPONSE_MODEL_ATTRIBUTE, attributes[vercelAiAttributes.AI_MODEL_ID_ATTRIBUTE]);
		span.setAttribute("ai.streaming", name.includes("stream"));
		const operationName = constants.SPAN_TO_OPERATION_NAME.get(name);
		if (operationName) span.setAttribute(semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_OP, `gen_ai.${operationName}`);
		else if (name.startsWith("ai.stream")) span.setAttribute(semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_OP, "ai.run");
		if (operationName === "invoke_agent") {
			if (functionId && typeof functionId === "string") span.updateName(`invoke_agent ${functionId}`);
			else span.updateName("invoke_agent");
			return;
		}
		const modelId = attributes[vercelAiAttributes.AI_MODEL_ID_ATTRIBUTE];
		if (modelId && operationName) span.updateName(`${operationName} ${modelId}`);
		const client = currentScopes.getClient();
		if (client && hasSpanStreamingEnabled.hasSpanStreamingEnabled(client) && attributes[vercelAiAttributes.AI_PROMPT_TOOLS_ATTRIBUTE] && Array.isArray(attributes[vercelAiAttributes.AI_PROMPT_TOOLS_ATTRIBUTE])) {
			const descriptions = /* @__PURE__ */ new Map();
			for (const toolStr of attributes[vercelAiAttributes.AI_PROMPT_TOOLS_ATTRIBUTE]) try {
				const parsed = typeof toolStr === "string" ? JSON.parse(toolStr) : toolStr;
				if (parsed?.name && parsed?.description) descriptions.set(parsed.name, parsed.description);
			} catch {}
			if (descriptions.size > 0) {
				const parentSpanId = spanUtils.spanToJSON(span).parent_span_id;
				if (parentSpanId) constants.toolDescriptionMap.set(parentSpanId, descriptions);
			}
		}
	}
	function addVercelAiProcessors(client) {
		client.on("spanStart", onVercelAiSpanStart);
		client.addEventProcessor(Object.assign(vercelAiEventProcessor, { id: "VercelAiEventProcessor" }));
		client.on("processSpan", (span) => {
			processVercelAiStreamedSpan(span);
		});
	}
	function getProviderMetadataAttributes(providerMetadata) {
		const attributes = {};
		if (!providerMetadata || typeof providerMetadata !== "object") return attributes;
		const metadata = providerMetadata;
		const openaiMetadata = metadata.openai ?? metadata.azure;
		if (openaiMetadata) {
			setAttributeIfDefined(attributes, genAiAttributes.GEN_AI_USAGE_INPUT_TOKENS_CACHED_ATTRIBUTE, openaiMetadata.cachedPromptTokens);
			setAttributeIfDefined(attributes, "gen_ai.usage.output_tokens.reasoning", openaiMetadata.reasoningTokens);
			setAttributeIfDefined(attributes, "gen_ai.usage.output_tokens.prediction_accepted", openaiMetadata.acceptedPredictionTokens);
			setAttributeIfDefined(attributes, "gen_ai.usage.output_tokens.prediction_rejected", openaiMetadata.rejectedPredictionTokens);
			setAttributeIfDefined(attributes, genAiAttributes.GEN_AI_CONVERSATION_ID_ATTRIBUTE, openaiMetadata.responseId);
		}
		if (metadata.anthropic) {
			const cachedInputTokens = metadata.anthropic.usage?.cache_read_input_tokens ?? metadata.anthropic.cacheReadInputTokens;
			setAttributeIfDefined(attributes, genAiAttributes.GEN_AI_USAGE_INPUT_TOKENS_CACHED_ATTRIBUTE, cachedInputTokens);
			const cacheWriteInputTokens = metadata.anthropic.usage?.cache_creation_input_tokens ?? metadata.anthropic.cacheCreationInputTokens;
			setAttributeIfDefined(attributes, genAiAttributes.GEN_AI_USAGE_INPUT_TOKENS_CACHE_WRITE_ATTRIBUTE, cacheWriteInputTokens);
		}
		if (metadata.bedrock?.usage) {
			setAttributeIfDefined(attributes, genAiAttributes.GEN_AI_USAGE_INPUT_TOKENS_CACHED_ATTRIBUTE, metadata.bedrock.usage.cacheReadInputTokens);
			setAttributeIfDefined(attributes, genAiAttributes.GEN_AI_USAGE_INPUT_TOKENS_CACHE_WRITE_ATTRIBUTE, metadata.bedrock.usage.cacheWriteInputTokens);
		}
		if (metadata.deepseek) {
			setAttributeIfDefined(attributes, genAiAttributes.GEN_AI_USAGE_INPUT_TOKENS_CACHED_ATTRIBUTE, metadata.deepseek.promptCacheHitTokens);
			setAttributeIfDefined(attributes, "gen_ai.usage.input_tokens.cache_miss", metadata.deepseek.promptCacheMissTokens);
		}
		return attributes;
	}
	function addProviderMetadataToAttributes(attributes) {
		const providerMetadata = attributes[vercelAiAttributes.AI_RESPONSE_PROVIDER_METADATA_ATTRIBUTE];
		if (!providerMetadata) return;
		try {
			const derived = getProviderMetadataAttributes(JSON.parse(providerMetadata));
			for (const [key, value] of Object.entries(derived)) {
				if (key === genAiAttributes.GEN_AI_CONVERSATION_ID_ATTRIBUTE && attributes[key]) continue;
				attributes[key] = value;
			}
		} catch {}
	}
	function setAttributeIfDefined(attributes, key, value) {
		if (value != null) attributes[key] = value;
	}
	exports.addVercelAiProcessors = addVercelAiProcessors;
	exports.getProviderMetadataAttributes = getProviderMetadataAttributes;
	exports.processVercelAiSpanAttributes = processVercelAiSpanAttributes;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/openai/constants.js
var require_constants$5 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const OPENAI_INTEGRATION_NAME = "OpenAI";
	const OPENAI_METHOD_REGISTRY = {
		"responses.create": { operation: "chat" },
		"chat.completions.create": { operation: "chat" },
		"embeddings.create": { operation: "embeddings" },
		"conversations.create": { operation: "chat" }
	};
	const RESPONSES_TOOL_CALL_EVENT_TYPES = [
		"response.output_item.added",
		"response.function_call_arguments.delta",
		"response.function_call_arguments.done",
		"response.output_item.done"
	];
	const RESPONSE_EVENT_TYPES = [
		"response.created",
		"response.in_progress",
		"response.failed",
		"response.completed",
		"response.incomplete",
		"response.queued",
		"response.output_text.delta",
		...RESPONSES_TOOL_CALL_EVENT_TYPES
	];
	exports.OPENAI_INTEGRATION_NAME = OPENAI_INTEGRATION_NAME;
	exports.OPENAI_METHOD_REGISTRY = OPENAI_METHOD_REGISTRY;
	exports.RESPONSES_TOOL_CALL_EVENT_TYPES = RESPONSES_TOOL_CALL_EVENT_TYPES;
	exports.RESPONSE_EVENT_TYPES = RESPONSE_EVENT_TYPES;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/openai/utils.js
var require_utils$5 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const genAiAttributes = require_gen_ai_attributes();
	function isResponsesApiStreamEvent(event) {
		return event !== null && typeof event === "object" && "type" in event && typeof event.type === "string" && event.type.startsWith("response.");
	}
	function isChatCompletionChunk(event) {
		return event !== null && typeof event === "object" && "object" in event && event.object === "chat.completion.chunk";
	}
	function addResponseAttributes(span, result, recordOutputs) {
		if (!result || typeof result !== "object") return;
		const response = result;
		const attrs = {};
		if (typeof response.id === "string") attrs[genAiAttributes.GEN_AI_RESPONSE_ID_ATTRIBUTE] = response.id;
		if (typeof response.model === "string") attrs[genAiAttributes.GEN_AI_RESPONSE_MODEL_ATTRIBUTE] = response.model;
		if (response.object === "conversation" && typeof response.id === "string") attrs[genAiAttributes.GEN_AI_CONVERSATION_ID_ATTRIBUTE] = response.id;
		if (response.usage && typeof response.usage === "object") {
			const usage = response.usage;
			const inputTokens = usage.prompt_tokens ?? usage.input_tokens;
			if (typeof inputTokens === "number") attrs[genAiAttributes.GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE] = inputTokens;
			const outputTokens = usage.completion_tokens ?? usage.output_tokens;
			if (typeof outputTokens === "number") attrs[genAiAttributes.GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE] = outputTokens;
			if (typeof usage.total_tokens === "number") attrs[genAiAttributes.GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE] = usage.total_tokens;
		}
		if (Array.isArray(response.choices)) {
			const choices = response.choices;
			const finishReasons = choices.map((choice) => choice.finish_reason).filter((reason) => typeof reason === "string");
			if (finishReasons.length > 0) attrs[genAiAttributes.GEN_AI_RESPONSE_FINISH_REASONS_ATTRIBUTE] = JSON.stringify(finishReasons);
			if (recordOutputs) {
				const responseTexts = choices.map((choice) => {
					return choice.message?.content || "";
				});
				attrs[genAiAttributes.GEN_AI_RESPONSE_TEXT_ATTRIBUTE] = JSON.stringify(responseTexts);
				const toolCalls = choices.map((choice) => {
					return choice.message?.tool_calls;
				}).filter((calls) => Array.isArray(calls) && calls.length > 0).flat();
				if (toolCalls.length > 0) attrs[genAiAttributes.GEN_AI_RESPONSE_TOOL_CALLS_ATTRIBUTE] = JSON.stringify(toolCalls);
			}
		}
		if (typeof response.status === "string") {
			if (!attrs[genAiAttributes.GEN_AI_RESPONSE_FINISH_REASONS_ATTRIBUTE]) attrs[genAiAttributes.GEN_AI_RESPONSE_FINISH_REASONS_ATTRIBUTE] = JSON.stringify([response.status]);
		}
		if (recordOutputs) {
			if (typeof response.output_text === "string" && !attrs[genAiAttributes.GEN_AI_RESPONSE_TEXT_ATTRIBUTE]) attrs[genAiAttributes.GEN_AI_RESPONSE_TEXT_ATTRIBUTE] = response.output_text;
			if (Array.isArray(response.output) && response.output.length > 0 && !attrs[genAiAttributes.GEN_AI_RESPONSE_TOOL_CALLS_ATTRIBUTE]) {
				const functionCalls = response.output.filter((item) => item?.type === "function_call");
				if (functionCalls.length > 0) attrs[genAiAttributes.GEN_AI_RESPONSE_TOOL_CALLS_ATTRIBUTE] = JSON.stringify(functionCalls);
			}
		}
		span.setAttributes(attrs);
	}
	function extractConversationId(params) {
		if ("conversation" in params && typeof params.conversation === "string") return params.conversation;
		if ("previous_response_id" in params && typeof params.previous_response_id === "string") return params.previous_response_id;
	}
	function extractRequestParameters(params) {
		const attributes = { [genAiAttributes.GEN_AI_REQUEST_MODEL_ATTRIBUTE]: params.model ?? "unknown" };
		if ("temperature" in params) attributes[genAiAttributes.GEN_AI_REQUEST_TEMPERATURE_ATTRIBUTE] = params.temperature;
		if ("top_p" in params) attributes[genAiAttributes.GEN_AI_REQUEST_TOP_P_ATTRIBUTE] = params.top_p;
		if ("frequency_penalty" in params) attributes[genAiAttributes.GEN_AI_REQUEST_FREQUENCY_PENALTY_ATTRIBUTE] = params.frequency_penalty;
		if ("presence_penalty" in params) attributes[genAiAttributes.GEN_AI_REQUEST_PRESENCE_PENALTY_ATTRIBUTE] = params.presence_penalty;
		if ("stream" in params) attributes[genAiAttributes.GEN_AI_REQUEST_STREAM_ATTRIBUTE] = params.stream;
		if ("encoding_format" in params) attributes[genAiAttributes.GEN_AI_REQUEST_ENCODING_FORMAT_ATTRIBUTE] = params.encoding_format;
		if ("dimensions" in params) attributes[genAiAttributes.GEN_AI_REQUEST_DIMENSIONS_ATTRIBUTE] = params.dimensions;
		const conversationId = extractConversationId(params);
		if (conversationId) attributes[genAiAttributes.GEN_AI_CONVERSATION_ID_ATTRIBUTE] = conversationId;
		return attributes;
	}
	exports.addResponseAttributes = addResponseAttributes;
	exports.extractRequestParameters = extractRequestParameters;
	exports.isChatCompletionChunk = isChatCompletionChunk;
	exports.isResponsesApiStreamEvent = isResponsesApiStreamEvent;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/openai/streaming.js
var require_streaming$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const exports$1 = require_exports$1();
	const spanstatus = require_spanstatus();
	const utils$1 = require_utils$7();
	const constants = require_constants$5();
	const utils = require_utils$5();
	function processChatCompletionToolCalls(toolCalls, state) {
		for (const toolCall of toolCalls) {
			const index = toolCall.index;
			if (index === void 0 || !toolCall.function) continue;
			if (!(index in state.chatCompletionToolCalls)) state.chatCompletionToolCalls[index] = {
				...toolCall,
				function: {
					name: toolCall.function.name,
					arguments: toolCall.function.arguments || ""
				}
			};
			else {
				const existingToolCall = state.chatCompletionToolCalls[index];
				if (toolCall.function.arguments && existingToolCall?.function) existingToolCall.function.arguments += toolCall.function.arguments;
			}
		}
	}
	function processChatCompletionChunk(chunk, state, recordOutputs) {
		state.responseId = chunk.id ?? state.responseId;
		state.responseModel = chunk.model ?? state.responseModel;
		if (chunk.usage) {
			state.promptTokens = chunk.usage.prompt_tokens;
			state.completionTokens = chunk.usage.completion_tokens;
			state.totalTokens = chunk.usage.total_tokens;
		}
		for (const choice of chunk.choices ?? []) {
			if (recordOutputs) {
				if (choice.delta?.content) state.responseTexts.push(choice.delta.content);
				if (choice.delta?.tool_calls) processChatCompletionToolCalls(choice.delta.tool_calls, state);
			}
			if (choice.finish_reason) state.finishReasons.push(choice.finish_reason);
		}
	}
	function processResponsesApiEvent(streamEvent, state, recordOutputs, span) {
		if (!(streamEvent && typeof streamEvent === "object")) {
			state.eventTypes.push("unknown:non-object");
			return;
		}
		if (streamEvent instanceof Error) {
			span.setStatus({
				code: spanstatus.SPAN_STATUS_ERROR,
				message: "internal_error"
			});
			exports$1.captureException(streamEvent, { mechanism: {
				handled: false,
				type: "auto.ai.openai.stream-response"
			} });
			return;
		}
		if (!("type" in streamEvent)) return;
		const event = streamEvent;
		if (!constants.RESPONSE_EVENT_TYPES.includes(event.type)) {
			state.eventTypes.push(event.type);
			return;
		}
		if (recordOutputs) {
			if (event.type === "response.output_item.done" && "item" in event) state.responsesApiToolCalls.push(event.item);
			if (event.type === "response.output_text.delta" && "delta" in event && event.delta) {
				state.responseTexts.push(event.delta);
				return;
			}
		}
		if ("response" in event) {
			const { response } = event;
			state.responseId = response.id ?? state.responseId;
			state.responseModel = response.model ?? state.responseModel;
			if (response.usage) {
				state.promptTokens = response.usage.input_tokens;
				state.completionTokens = response.usage.output_tokens;
				state.totalTokens = response.usage.total_tokens;
			}
			if (response.status) state.finishReasons.push(response.status);
			if (recordOutputs && response.output_text) state.responseTexts.push(response.output_text);
		}
	}
	async function* instrumentStream(stream, span, recordOutputs) {
		const state = {
			eventTypes: [],
			responseTexts: [],
			finishReasons: [],
			responseId: "",
			responseModel: "",
			promptTokens: void 0,
			completionTokens: void 0,
			totalTokens: void 0,
			chatCompletionToolCalls: {},
			responsesApiToolCalls: []
		};
		try {
			for await (const event of stream) {
				if (utils.isChatCompletionChunk(event)) processChatCompletionChunk(event, state, recordOutputs);
				else if (utils.isResponsesApiStreamEvent(event)) processResponsesApiEvent(event, state, recordOutputs, span);
				yield event;
			}
		} finally {
			const allToolCalls = [...Object.values(state.chatCompletionToolCalls), ...state.responsesApiToolCalls];
			utils$1.endStreamSpan(span, {
				...state,
				toolCalls: allToolCalls
			}, recordOutputs);
		}
	}
	exports.instrumentStream = instrumentStream;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/openai/index.js
var require_openai = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const debugBuild = require_debug_build();
	const exports$1 = require_exports$1();
	const semanticAttributes = require_semanticAttributes();
	const debugLogger = require_debug_logger();
	const spanstatus = require_spanstatus();
	const trace = require_trace();
	const genAiAttributes = require_gen_ai_attributes();
	const utils = require_utils$7();
	const constants = require_constants$5();
	const streaming = require_streaming$2();
	const utils$1 = require_utils$5();
	function extractAvailableTools(params) {
		const tools = Array.isArray(params.tools) ? params.tools : [];
		const webSearchOptions = params.web_search_options && typeof params.web_search_options === "object" ? [{
			type: "web_search_options",
			...params.web_search_options
		}] : [];
		const availableTools = [...tools, ...webSearchOptions];
		if (availableTools.length === 0) return;
		try {
			return JSON.stringify(availableTools);
		} catch (error) {
			debugBuild.DEBUG_BUILD && debugLogger.debug.error("Failed to serialize OpenAI tools:", error);
			return;
		}
	}
	function extractRequestAttributes(args, operationName) {
		const attributes = {
			[genAiAttributes.GEN_AI_SYSTEM_ATTRIBUTE]: "openai",
			[genAiAttributes.GEN_AI_OPERATION_NAME_ATTRIBUTE]: operationName,
			[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.ai.openai"
		};
		if (args.length > 0 && typeof args[0] === "object" && args[0] !== null) {
			const params = args[0];
			const availableTools = extractAvailableTools(params);
			if (availableTools) attributes[genAiAttributes.GEN_AI_REQUEST_AVAILABLE_TOOLS_ATTRIBUTE] = availableTools;
			Object.assign(attributes, utils$1.extractRequestParameters(params));
		} else attributes[genAiAttributes.GEN_AI_REQUEST_MODEL_ATTRIBUTE] = "unknown";
		return attributes;
	}
	function addRequestAttributes(span, params, operationName, enableTruncation) {
		if (operationName === "embeddings" && "input" in params) {
			const input = params.input;
			if (input == null) return;
			if (typeof input === "string" && input.length === 0) return;
			if (Array.isArray(input) && input.length === 0) return;
			span.setAttribute(genAiAttributes.GEN_AI_EMBEDDINGS_INPUT_ATTRIBUTE, typeof input === "string" ? input : JSON.stringify(input));
			return;
		}
		const src = "input" in params ? params.input : "messages" in params ? params.messages : void 0;
		if (!src) return;
		if (Array.isArray(src) && src.length === 0) return;
		const { systemInstructions, filteredMessages } = utils.extractSystemInstructions(src);
		if (systemInstructions) span.setAttribute(genAiAttributes.GEN_AI_SYSTEM_INSTRUCTIONS_ATTRIBUTE, systemInstructions);
		span.setAttribute(genAiAttributes.GEN_AI_INPUT_MESSAGES_ATTRIBUTE, enableTruncation ? utils.getTruncatedJsonString(filteredMessages) : utils.getJsonString(filteredMessages));
		if (Array.isArray(filteredMessages)) span.setAttribute(genAiAttributes.GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE, filteredMessages.length);
		else span.setAttribute(genAiAttributes.GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE, 1);
	}
	function instrumentMethod(originalMethod, methodPath, instrumentedMethod, context, options) {
		return function instrumentedCall(...args) {
			const operationName = instrumentedMethod.operation || "unknown";
			const requestAttributes = extractRequestAttributes(args, operationName);
			const model = requestAttributes[genAiAttributes.GEN_AI_REQUEST_MODEL_ATTRIBUTE] || "unknown";
			const params = args[0];
			const isStreamRequested = params && typeof params === "object" && params.stream === true;
			const spanConfig = {
				name: `${operationName} ${model}`,
				op: `gen_ai.${operationName}`,
				attributes: requestAttributes
			};
			if (isStreamRequested) {
				let originalResult2;
				const instrumentedPromise2 = trace.startSpanManual(spanConfig, (span) => {
					originalResult2 = originalMethod.apply(context, args);
					if (options.recordInputs && params) addRequestAttributes(span, params, operationName, utils.shouldEnableTruncation(options.enableTruncation));
					return (async () => {
						try {
							const result = await originalResult2;
							return streaming.instrumentStream(result, span, options.recordOutputs ?? false);
						} catch (error) {
							span.setStatus({
								code: spanstatus.SPAN_STATUS_ERROR,
								message: "internal_error"
							});
							exports$1.captureException(error, { mechanism: {
								handled: false,
								type: "auto.ai.openai.stream",
								data: { function: methodPath }
							} });
							span.end();
							throw error;
						}
					})();
				});
				return utils.wrapPromiseWithMethods(originalResult2, instrumentedPromise2, "auto.ai.openai");
			}
			let originalResult;
			const instrumentedPromise = trace.startSpan(spanConfig, (span) => {
				originalResult = originalMethod.apply(context, args);
				if (options.recordInputs && params) addRequestAttributes(span, params, operationName, utils.shouldEnableTruncation(options.enableTruncation));
				return originalResult.then((result) => {
					utils$1.addResponseAttributes(span, result, options.recordOutputs);
					return result;
				}, (error) => {
					exports$1.captureException(error, { mechanism: {
						handled: false,
						type: "auto.ai.openai",
						data: { function: methodPath }
					} });
					throw error;
				});
			});
			return utils.wrapPromiseWithMethods(originalResult, instrumentedPromise, "auto.ai.openai");
		};
	}
	function createDeepProxy(target, currentPath = "", options) {
		return new Proxy(target, { get(obj, prop) {
			const value = obj[prop];
			const methodPath = utils.buildMethodPath(currentPath, String(prop));
			const instrumentedMethod = constants.OPENAI_METHOD_REGISTRY[methodPath];
			if (typeof value === "function" && instrumentedMethod) return instrumentMethod(value, methodPath, instrumentedMethod, obj, options);
			if (typeof value === "function") return value.bind(obj);
			if (value && typeof value === "object") return createDeepProxy(value, methodPath, options);
			return value;
		} });
	}
	function instrumentOpenAiClient(client, options) {
		return createDeepProxy(client, "", utils.resolveAIRecordingOptions(options));
	}
	exports.instrumentOpenAiClient = instrumentOpenAiClient;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/anthropic-ai/constants.js
var require_constants$4 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const ANTHROPIC_AI_INTEGRATION_NAME = "Anthropic_AI";
	const ANTHROPIC_METHOD_REGISTRY = {
		"messages.create": { operation: "chat" },
		"messages.stream": {
			operation: "chat",
			streaming: true
		},
		"messages.countTokens": { operation: "chat" },
		"models.get": { operation: "models" },
		"completions.create": { operation: "chat" },
		"models.retrieve": { operation: "models" },
		"beta.messages.create": { operation: "chat" }
	};
	exports.ANTHROPIC_AI_INTEGRATION_NAME = ANTHROPIC_AI_INTEGRATION_NAME;
	exports.ANTHROPIC_METHOD_REGISTRY = ANTHROPIC_METHOD_REGISTRY;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/anthropic-ai/utils.js
var require_utils$4 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const exports$1 = require_exports$1();
	const spanstatus = require_spanstatus();
	const genAiAttributes = require_gen_ai_attributes();
	const utils = require_utils$7();
	function setMessagesAttribute(span, messages, enableTruncation) {
		if (Array.isArray(messages) && messages.length === 0) return;
		const { systemInstructions, filteredMessages } = utils.extractSystemInstructions(messages);
		if (systemInstructions) span.setAttributes({ [genAiAttributes.GEN_AI_SYSTEM_INSTRUCTIONS_ATTRIBUTE]: systemInstructions });
		const filteredLength = Array.isArray(filteredMessages) ? filteredMessages.length : 1;
		span.setAttributes({
			[genAiAttributes.GEN_AI_INPUT_MESSAGES_ATTRIBUTE]: enableTruncation ? utils.getTruncatedJsonString(filteredMessages) : utils.getJsonString(filteredMessages),
			[genAiAttributes.GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE]: filteredLength
		});
	}
	const ANTHROPIC_ERROR_TYPE_TO_SPAN_STATUS = {
		invalid_request_error: "invalid_argument",
		authentication_error: "unauthenticated",
		permission_error: "permission_denied",
		not_found_error: "not_found",
		request_too_large: "failed_precondition",
		rate_limit_error: "resource_exhausted",
		api_error: "internal_error",
		overloaded_error: "unavailable"
	};
	function mapAnthropicErrorToStatusMessage(errorType) {
		if (!errorType) return "internal_error";
		return ANTHROPIC_ERROR_TYPE_TO_SPAN_STATUS[errorType] || "internal_error";
	}
	function handleResponseError(span, response) {
		if (response.error) {
			span.setStatus({
				code: spanstatus.SPAN_STATUS_ERROR,
				message: mapAnthropicErrorToStatusMessage(response.error.type)
			});
			exports$1.captureException(response.error, { mechanism: {
				handled: false,
				type: "auto.ai.anthropic.anthropic_error"
			} });
		}
	}
	function messagesFromParams(params) {
		const { system, messages, input } = params;
		const systemMessages = typeof system === "string" ? [{
			role: "system",
			content: params.system
		}] : [];
		const userMessages = (Array.isArray(input) ? input : input != null ? [input] : void 0) ?? (Array.isArray(messages) ? messages : messages != null ? [messages] : []);
		return [...systemMessages, ...userMessages];
	}
	exports.handleResponseError = handleResponseError;
	exports.mapAnthropicErrorToStatusMessage = mapAnthropicErrorToStatusMessage;
	exports.messagesFromParams = messagesFromParams;
	exports.setMessagesAttribute = setMessagesAttribute;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/anthropic-ai/streaming.js
var require_streaming$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const exports$1 = require_exports$1();
	const spanstatus = require_spanstatus();
	const utils = require_utils$7();
	const utils$1 = require_utils$4();
	function isErrorEvent(event, span) {
		if ("type" in event && typeof event.type === "string") {
			if (event.type === "error") {
				span.setStatus({
					code: spanstatus.SPAN_STATUS_ERROR,
					message: utils$1.mapAnthropicErrorToStatusMessage(event.error?.type)
				});
				exports$1.captureException(event.error, { mechanism: {
					handled: false,
					type: "auto.ai.anthropic.anthropic_error"
				} });
				return true;
			}
		}
		return false;
	}
	function handleMessageMetadata(event, state) {
		if (event.type === "message_delta" && event.usage) {
			if ("output_tokens" in event.usage && typeof event.usage.output_tokens === "number") state.completionTokens = event.usage.output_tokens;
		}
		if (event.message) {
			const message = event.message;
			if (message.id) state.responseId = message.id;
			if (message.model) state.responseModel = message.model;
			if (message.stop_reason) state.finishReasons.push(message.stop_reason);
			if (message.usage) {
				if (typeof message.usage.input_tokens === "number") state.promptTokens = message.usage.input_tokens;
				if (typeof message.usage.cache_creation_input_tokens === "number") state.cacheCreationInputTokens = message.usage.cache_creation_input_tokens;
				if (typeof message.usage.cache_read_input_tokens === "number") state.cacheReadInputTokens = message.usage.cache_read_input_tokens;
			}
		}
	}
	function handleContentBlockStart(event, state) {
		if (event.type !== "content_block_start" || typeof event.index !== "number" || !event.content_block) return;
		if (event.content_block.type === "tool_use" || event.content_block.type === "server_tool_use") state.activeToolBlocks[event.index] = {
			id: event.content_block.id,
			name: event.content_block.name,
			inputJsonParts: []
		};
	}
	function handleContentBlockDelta(event, state, recordOutputs) {
		if (event.type !== "content_block_delta" || !event.delta) return;
		if (typeof event.index === "number" && "partial_json" in event.delta && typeof event.delta.partial_json === "string") {
			const active = state.activeToolBlocks[event.index];
			if (active) active.inputJsonParts.push(event.delta.partial_json);
		}
		if (recordOutputs && typeof event.delta.text === "string") state.responseTexts.push(event.delta.text);
	}
	function handleContentBlockStop(event, state) {
		if (event.type !== "content_block_stop" || typeof event.index !== "number") return;
		const active = state.activeToolBlocks[event.index];
		if (!active) return;
		const raw = active.inputJsonParts.join("");
		let parsedInput;
		try {
			parsedInput = raw ? JSON.parse(raw) : {};
		} catch {
			parsedInput = { __unparsed: raw };
		}
		state.toolCalls.push({
			type: "tool_use",
			id: active.id,
			name: active.name,
			input: parsedInput
		});
		delete state.activeToolBlocks[event.index];
	}
	function processEvent(event, state, recordOutputs, span) {
		if (!(event && typeof event === "object")) return;
		if (isErrorEvent(event, span)) return;
		handleMessageMetadata(event, state);
		handleContentBlockStart(event, state);
		handleContentBlockDelta(event, state, recordOutputs);
		handleContentBlockStop(event, state);
	}
	async function* instrumentAsyncIterableStream(stream, span, recordOutputs) {
		const state = {
			responseTexts: [],
			finishReasons: [],
			responseId: "",
			responseModel: "",
			promptTokens: void 0,
			completionTokens: void 0,
			cacheCreationInputTokens: void 0,
			cacheReadInputTokens: void 0,
			toolCalls: [],
			activeToolBlocks: {}
		};
		try {
			for await (const event of stream) {
				processEvent(event, state, recordOutputs, span);
				yield event;
			}
		} finally {
			utils.endStreamSpan(span, state, recordOutputs);
		}
	}
	function instrumentMessageStream(stream, span, recordOutputs) {
		const state = {
			responseTexts: [],
			finishReasons: [],
			responseId: "",
			responseModel: "",
			promptTokens: void 0,
			completionTokens: void 0,
			cacheCreationInputTokens: void 0,
			cacheReadInputTokens: void 0,
			toolCalls: [],
			activeToolBlocks: {}
		};
		stream.on("streamEvent", (event) => {
			processEvent(event, state, recordOutputs, span);
		});
		stream.on("message", () => {
			utils.endStreamSpan(span, state, recordOutputs);
		});
		stream.on("error", (error) => {
			exports$1.captureException(error, { mechanism: {
				handled: false,
				type: "auto.ai.anthropic.stream_error"
			} });
			if (span.isRecording()) {
				span.setStatus({
					code: spanstatus.SPAN_STATUS_ERROR,
					message: "internal_error"
				});
				span.end();
			}
		});
		return stream;
	}
	exports.instrumentAsyncIterableStream = instrumentAsyncIterableStream;
	exports.instrumentMessageStream = instrumentMessageStream;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/anthropic-ai/index.js
var require_anthropic_ai = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const exports$1 = require_exports$1();
	const semanticAttributes = require_semanticAttributes();
	const spanstatus = require_spanstatus();
	const trace = require_trace();
	const genAiAttributes = require_gen_ai_attributes();
	const utils = require_utils$7();
	const constants = require_constants$4();
	const streaming = require_streaming$1();
	const utils$1 = require_utils$4();
	function extractRequestAttributes(args, methodPath, operationName) {
		const attributes = {
			[genAiAttributes.GEN_AI_SYSTEM_ATTRIBUTE]: "anthropic",
			[genAiAttributes.GEN_AI_OPERATION_NAME_ATTRIBUTE]: operationName,
			[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.ai.anthropic"
		};
		if (args.length > 0 && typeof args[0] === "object" && args[0] !== null) {
			const params = args[0];
			if (params.tools && Array.isArray(params.tools)) attributes[genAiAttributes.GEN_AI_REQUEST_AVAILABLE_TOOLS_ATTRIBUTE] = JSON.stringify(params.tools);
			attributes[genAiAttributes.GEN_AI_REQUEST_MODEL_ATTRIBUTE] = params.model ?? "unknown";
			if ("temperature" in params) attributes[genAiAttributes.GEN_AI_REQUEST_TEMPERATURE_ATTRIBUTE] = params.temperature;
			if ("top_p" in params) attributes[genAiAttributes.GEN_AI_REQUEST_TOP_P_ATTRIBUTE] = params.top_p;
			if ("stream" in params) attributes[genAiAttributes.GEN_AI_REQUEST_STREAM_ATTRIBUTE] = params.stream;
			if ("top_k" in params) attributes[genAiAttributes.GEN_AI_REQUEST_TOP_K_ATTRIBUTE] = params.top_k;
			if ("frequency_penalty" in params) attributes[genAiAttributes.GEN_AI_REQUEST_FREQUENCY_PENALTY_ATTRIBUTE] = params.frequency_penalty;
			if ("max_tokens" in params) attributes[genAiAttributes.GEN_AI_REQUEST_MAX_TOKENS_ATTRIBUTE] = params.max_tokens;
		} else if (methodPath === "models.retrieve" || methodPath === "models.get") attributes[genAiAttributes.GEN_AI_REQUEST_MODEL_ATTRIBUTE] = args[0];
		else attributes[genAiAttributes.GEN_AI_REQUEST_MODEL_ATTRIBUTE] = "unknown";
		return attributes;
	}
	function addPrivateRequestAttributes(span, params, enableTruncation) {
		const messages = utils$1.messagesFromParams(params);
		utils$1.setMessagesAttribute(span, messages, enableTruncation);
		if ("prompt" in params) span.setAttributes({ [genAiAttributes.GEN_AI_PROMPT_ATTRIBUTE]: JSON.stringify(params.prompt) });
	}
	function addContentAttributes(span, response) {
		if ("content" in response) {
			if (Array.isArray(response.content)) {
				span.setAttributes({ [genAiAttributes.GEN_AI_RESPONSE_TEXT_ATTRIBUTE]: response.content.map((item) => item.text).filter((text) => !!text).join("") });
				const toolCalls = [];
				for (const item of response.content) if (item.type === "tool_use" || item.type === "server_tool_use") toolCalls.push(item);
				if (toolCalls.length > 0) span.setAttributes({ [genAiAttributes.GEN_AI_RESPONSE_TOOL_CALLS_ATTRIBUTE]: JSON.stringify(toolCalls) });
			}
		}
		if ("completion" in response) span.setAttributes({ [genAiAttributes.GEN_AI_RESPONSE_TEXT_ATTRIBUTE]: response.completion });
		if ("input_tokens" in response) span.setAttributes({ [genAiAttributes.GEN_AI_RESPONSE_TEXT_ATTRIBUTE]: JSON.stringify(response.input_tokens) });
	}
	function addMetadataAttributes(span, response) {
		if ("id" in response && "model" in response) {
			span.setAttributes({
				[genAiAttributes.GEN_AI_RESPONSE_ID_ATTRIBUTE]: response.id,
				[genAiAttributes.GEN_AI_RESPONSE_MODEL_ATTRIBUTE]: response.model
			});
			if ("usage" in response && response.usage) utils.setTokenUsageAttributes(span, response.usage.input_tokens, response.usage.output_tokens, response.usage.cache_creation_input_tokens, response.usage.cache_read_input_tokens);
		}
	}
	function addResponseAttributes(span, response, recordOutputs) {
		if (!response || typeof response !== "object") return;
		if ("type" in response && response.type === "error") {
			utils$1.handleResponseError(span, response);
			return;
		}
		if (recordOutputs) addContentAttributes(span, response);
		addMetadataAttributes(span, response);
	}
	function handleStreamingError(error, span, methodPath) {
		exports$1.captureException(error, { mechanism: {
			handled: false,
			type: "auto.ai.anthropic",
			data: { function: methodPath }
		} });
		if (span.isRecording()) {
			span.setStatus({
				code: spanstatus.SPAN_STATUS_ERROR,
				message: "internal_error"
			});
			span.end();
		}
		throw error;
	}
	function handleStreamingRequest(originalMethod, target, context, args, requestAttributes, operationName, methodPath, params, options, isStreamRequested, isStreamingMethod) {
		const spanConfig = {
			name: `${operationName} ${requestAttributes[genAiAttributes.GEN_AI_REQUEST_MODEL_ATTRIBUTE] ?? "unknown"}`,
			op: `gen_ai.${operationName}`,
			attributes: requestAttributes
		};
		if (isStreamRequested && !isStreamingMethod) {
			let originalResult;
			const instrumentedPromise = trace.startSpanManual(spanConfig, (span) => {
				originalResult = originalMethod.apply(context, args);
				if (options.recordInputs && params) addPrivateRequestAttributes(span, params, utils.shouldEnableTruncation(options.enableTruncation));
				return (async () => {
					try {
						const result = await originalResult;
						return streaming.instrumentAsyncIterableStream(result, span, options.recordOutputs ?? false);
					} catch (error) {
						return handleStreamingError(error, span, methodPath);
					}
				})();
			});
			return utils.wrapPromiseWithMethods(originalResult, instrumentedPromise, "auto.ai.anthropic");
		} else return trace.startSpanManual(spanConfig, (span) => {
			try {
				if (options.recordInputs && params) addPrivateRequestAttributes(span, params, utils.shouldEnableTruncation(options.enableTruncation));
				const messageStream = target.apply(context, args);
				return streaming.instrumentMessageStream(messageStream, span, options.recordOutputs ?? false);
			} catch (error) {
				return handleStreamingError(error, span, methodPath);
			}
		});
	}
	function instrumentMethod(originalMethod, methodPath, instrumentedMethod, context, options) {
		return new Proxy(originalMethod, { apply(target, thisArg, args) {
			const operationName = instrumentedMethod.operation || "unknown";
			const requestAttributes = extractRequestAttributes(args, methodPath, operationName);
			const model = requestAttributes[genAiAttributes.GEN_AI_REQUEST_MODEL_ATTRIBUTE] ?? "unknown";
			const params = typeof args[0] === "object" ? args[0] : void 0;
			const isStreamRequested = Boolean(params?.stream);
			const isStreamingMethod = instrumentedMethod.streaming === true;
			if (isStreamRequested || isStreamingMethod) return handleStreamingRequest(originalMethod, target, context, args, requestAttributes, operationName, methodPath, params, options, isStreamRequested, isStreamingMethod);
			let originalResult;
			const instrumentedPromise = trace.startSpan({
				name: `${operationName} ${model}`,
				op: `gen_ai.${operationName}`,
				attributes: requestAttributes
			}, (span) => {
				originalResult = target.apply(context, args);
				if (options.recordInputs && params) addPrivateRequestAttributes(span, params, utils.shouldEnableTruncation(options.enableTruncation));
				return originalResult.then((result) => {
					addResponseAttributes(span, result, options.recordOutputs);
					return result;
				}, (error) => {
					exports$1.captureException(error, { mechanism: {
						handled: false,
						type: "auto.ai.anthropic",
						data: { function: methodPath }
					} });
					throw error;
				});
			});
			return utils.wrapPromiseWithMethods(originalResult, instrumentedPromise, "auto.ai.anthropic");
		} });
	}
	function createDeepProxy(target, currentPath = "", options) {
		return new Proxy(target, { get(obj, prop) {
			const value = obj[prop];
			const methodPath = utils.buildMethodPath(currentPath, String(prop));
			const instrumentedMethod = constants.ANTHROPIC_METHOD_REGISTRY[methodPath];
			if (typeof value === "function" && instrumentedMethod) return instrumentMethod(value, methodPath, instrumentedMethod, obj, options);
			if (typeof value === "function") return value.bind(obj);
			if (value && typeof value === "object") return createDeepProxy(value, methodPath, options);
			return value;
		} });
	}
	function instrumentAnthropicAiClient(anthropicAiClient, options) {
		return createDeepProxy(anthropicAiClient, "", utils.resolveAIRecordingOptions(options));
	}
	exports.instrumentAnthropicAiClient = instrumentAnthropicAiClient;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/google-genai/constants.js
var require_constants$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const GOOGLE_GENAI_INTEGRATION_NAME = "Google_GenAI";
	const GOOGLE_GENAI_METHOD_REGISTRY = {
		"models.generateContent": { operation: "generate_content" },
		"models.generateContentStream": {
			operation: "generate_content",
			streaming: true
		},
		"models.embedContent": { operation: "embeddings" },
		"chats.create": { proxyResultPath: "chat" },
		"chat.sendMessage": { operation: "chat" },
		"chat.sendMessageStream": {
			operation: "chat",
			streaming: true
		}
	};
	const GOOGLE_GENAI_SYSTEM_NAME = "google_genai";
	exports.GOOGLE_GENAI_INTEGRATION_NAME = GOOGLE_GENAI_INTEGRATION_NAME;
	exports.GOOGLE_GENAI_METHOD_REGISTRY = GOOGLE_GENAI_METHOD_REGISTRY;
	exports.GOOGLE_GENAI_SYSTEM_NAME = GOOGLE_GENAI_SYSTEM_NAME;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/google-genai/streaming.js
var require_streaming = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const exports$1 = require_exports$1();
	const spanstatus = require_spanstatus();
	const utils = require_utils$7();
	function isErrorChunk(chunk, span) {
		const feedback = chunk?.promptFeedback;
		if (feedback?.blockReason) {
			const message = feedback.blockReasonMessage ?? feedback.blockReason;
			span.setStatus({
				code: spanstatus.SPAN_STATUS_ERROR,
				message: "internal_error"
			});
			exports$1.captureException(`Content blocked: ${message}`, { mechanism: {
				handled: false,
				type: "auto.ai.google_genai"
			} });
			return true;
		}
		return false;
	}
	function handleResponseMetadata(chunk, state) {
		if (typeof chunk.responseId === "string") state.responseId = chunk.responseId;
		if (typeof chunk.modelVersion === "string") state.responseModel = chunk.modelVersion;
		const usage = chunk.usageMetadata;
		if (usage) {
			if (typeof usage.promptTokenCount === "number") state.promptTokens = usage.promptTokenCount;
			if (typeof usage.candidatesTokenCount === "number") state.completionTokens = usage.candidatesTokenCount;
			if (typeof usage.totalTokenCount === "number") state.totalTokens = usage.totalTokenCount;
		}
	}
	function handleCandidateContent(chunk, state, recordOutputs) {
		if (Array.isArray(chunk.functionCalls)) state.toolCalls.push(...chunk.functionCalls);
		for (const candidate of chunk.candidates ?? []) {
			if (candidate?.finishReason && !state.finishReasons.includes(candidate.finishReason)) state.finishReasons.push(candidate.finishReason);
			for (const part of candidate?.content?.parts ?? []) {
				if (recordOutputs && part.text) state.responseTexts.push(part.text);
				if (part.functionCall) state.toolCalls.push({
					type: "function",
					id: part.functionCall.id,
					name: part.functionCall.name,
					arguments: part.functionCall.args
				});
			}
		}
	}
	function processChunk(chunk, state, recordOutputs, span) {
		if (!chunk || isErrorChunk(chunk, span)) return;
		handleResponseMetadata(chunk, state);
		handleCandidateContent(chunk, state, recordOutputs);
	}
	async function* instrumentStream(stream, span, recordOutputs) {
		const state = {
			responseTexts: [],
			finishReasons: [],
			toolCalls: []
		};
		try {
			for await (const chunk of stream) {
				processChunk(chunk, state, recordOutputs, span);
				yield chunk;
			}
		} finally {
			utils.endStreamSpan(span, state, recordOutputs);
		}
	}
	exports.instrumentStream = instrumentStream;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/google-genai/utils.js
var require_utils$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	function contentUnionToMessages(content, role = "user") {
		if (typeof content === "string") return [{
			role,
			content
		}];
		if (Array.isArray(content)) return content.flatMap((content2) => contentUnionToMessages(content2, role));
		if (typeof content !== "object" || !content) return [];
		if ("role" in content && typeof content.role === "string") return [content];
		if ("parts" in content) return [{
			...content,
			role
		}];
		return [{
			role,
			content
		}];
	}
	exports.contentUnionToMessages = contentUnionToMessages;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/google-genai/index.js
var require_google_genai = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const exports$1 = require_exports$1();
	const semanticAttributes = require_semanticAttributes();
	const spanstatus = require_spanstatus();
	const trace = require_trace();
	const handleCallbackErrors = require_handleCallbackErrors();
	const genAiAttributes = require_gen_ai_attributes();
	const utils = require_utils$7();
	const constants = require_constants$3();
	const streaming = require_streaming();
	const utils$1 = require_utils$3();
	function extractModel(params, context) {
		if ("model" in params && typeof params.model === "string") return params.model;
		if (context && typeof context === "object") {
			const contextObj = context;
			if ("model" in contextObj && typeof contextObj.model === "string") return contextObj.model;
			if ("modelVersion" in contextObj && typeof contextObj.modelVersion === "string") return contextObj.modelVersion;
		}
		return "unknown";
	}
	function extractConfigAttributes(config) {
		const attributes = {};
		if ("temperature" in config && typeof config.temperature === "number") attributes[genAiAttributes.GEN_AI_REQUEST_TEMPERATURE_ATTRIBUTE] = config.temperature;
		if ("topP" in config && typeof config.topP === "number") attributes[genAiAttributes.GEN_AI_REQUEST_TOP_P_ATTRIBUTE] = config.topP;
		if ("topK" in config && typeof config.topK === "number") attributes[genAiAttributes.GEN_AI_REQUEST_TOP_K_ATTRIBUTE] = config.topK;
		if ("maxOutputTokens" in config && typeof config.maxOutputTokens === "number") attributes[genAiAttributes.GEN_AI_REQUEST_MAX_TOKENS_ATTRIBUTE] = config.maxOutputTokens;
		if ("frequencyPenalty" in config && typeof config.frequencyPenalty === "number") attributes[genAiAttributes.GEN_AI_REQUEST_FREQUENCY_PENALTY_ATTRIBUTE] = config.frequencyPenalty;
		if ("presencePenalty" in config && typeof config.presencePenalty === "number") attributes[genAiAttributes.GEN_AI_REQUEST_PRESENCE_PENALTY_ATTRIBUTE] = config.presencePenalty;
		return attributes;
	}
	function extractRequestAttributes(operationName, params, context) {
		const attributes = {
			[genAiAttributes.GEN_AI_SYSTEM_ATTRIBUTE]: constants.GOOGLE_GENAI_SYSTEM_NAME,
			[genAiAttributes.GEN_AI_OPERATION_NAME_ATTRIBUTE]: operationName,
			[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.ai.google_genai"
		};
		if (params) {
			attributes[genAiAttributes.GEN_AI_REQUEST_MODEL_ATTRIBUTE] = extractModel(params, context);
			if ("config" in params && typeof params.config === "object" && params.config) {
				const config = params.config;
				Object.assign(attributes, extractConfigAttributes(config));
				if ("tools" in config && Array.isArray(config.tools)) {
					const functionDeclarations = config.tools.flatMap((tool) => tool.functionDeclarations);
					attributes[genAiAttributes.GEN_AI_REQUEST_AVAILABLE_TOOLS_ATTRIBUTE] = JSON.stringify(functionDeclarations);
				}
			}
		} else attributes[genAiAttributes.GEN_AI_REQUEST_MODEL_ATTRIBUTE] = extractModel({}, context);
		return attributes;
	}
	function addPrivateRequestAttributes(span, params, isEmbeddings, enableTruncation) {
		if (isEmbeddings) {
			const contents = params.contents;
			if (contents != null) span.setAttribute(genAiAttributes.GEN_AI_EMBEDDINGS_INPUT_ATTRIBUTE, typeof contents === "string" ? contents : JSON.stringify(contents));
			return;
		}
		const messages = [];
		if ("config" in params && params.config && typeof params.config === "object" && "systemInstruction" in params.config && params.config.systemInstruction) messages.push(...utils$1.contentUnionToMessages(params.config.systemInstruction, "system"));
		if ("history" in params) messages.push(...utils$1.contentUnionToMessages(params.history, "user"));
		if ("contents" in params) messages.push(...utils$1.contentUnionToMessages(params.contents, "user"));
		if ("message" in params) messages.push(...utils$1.contentUnionToMessages(params.message, "user"));
		if (Array.isArray(messages) && messages.length) {
			const { systemInstructions, filteredMessages } = utils.extractSystemInstructions(messages);
			if (systemInstructions) span.setAttribute(genAiAttributes.GEN_AI_SYSTEM_INSTRUCTIONS_ATTRIBUTE, systemInstructions);
			const filteredLength = Array.isArray(filteredMessages) ? filteredMessages.length : 0;
			span.setAttributes({
				[genAiAttributes.GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE]: filteredLength,
				[genAiAttributes.GEN_AI_INPUT_MESSAGES_ATTRIBUTE]: enableTruncation ? utils.getTruncatedJsonString(filteredMessages) : utils.getJsonString(filteredMessages)
			});
		}
	}
	function addResponseAttributes(span, response, recordOutputs) {
		if (!response || typeof response !== "object") return;
		if (response.modelVersion) span.setAttribute(genAiAttributes.GEN_AI_RESPONSE_MODEL_ATTRIBUTE, response.modelVersion);
		if (response.usageMetadata && typeof response.usageMetadata === "object") {
			const usage = response.usageMetadata;
			if (typeof usage.promptTokenCount === "number") span.setAttributes({ [genAiAttributes.GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE]: usage.promptTokenCount });
			if (typeof usage.candidatesTokenCount === "number") span.setAttributes({ [genAiAttributes.GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE]: usage.candidatesTokenCount });
			if (typeof usage.totalTokenCount === "number") span.setAttributes({ [genAiAttributes.GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE]: usage.totalTokenCount });
		}
		if (recordOutputs && Array.isArray(response.candidates) && response.candidates.length > 0) {
			const responseTexts = response.candidates.map((candidate) => {
				if (candidate.content?.parts && Array.isArray(candidate.content.parts)) return candidate.content.parts.map((part) => typeof part.text === "string" ? part.text : "").filter((text) => text.length > 0).join("");
				return "";
			}).filter((text) => text.length > 0);
			if (responseTexts.length > 0) span.setAttributes({ [genAiAttributes.GEN_AI_RESPONSE_TEXT_ATTRIBUTE]: responseTexts.join("") });
		}
		if (recordOutputs && response.functionCalls) {
			const functionCalls = response.functionCalls;
			if (Array.isArray(functionCalls) && functionCalls.length > 0) span.setAttributes({ [genAiAttributes.GEN_AI_RESPONSE_TOOL_CALLS_ATTRIBUTE]: JSON.stringify(functionCalls) });
		}
	}
	function instrumentMethod(originalMethod, methodPath, instrumentedMethod, context, options) {
		const isEmbeddings = instrumentedMethod.operation === "embeddings";
		return new Proxy(originalMethod, { apply(target, _, args) {
			const operationName = instrumentedMethod.operation || "unknown";
			const params = args[0];
			const requestAttributes = extractRequestAttributes(operationName, params, context);
			const model = requestAttributes[genAiAttributes.GEN_AI_REQUEST_MODEL_ATTRIBUTE] ?? "unknown";
			if (instrumentedMethod.streaming) return trace.startSpanManual({
				name: `${operationName} ${model}`,
				op: `gen_ai.${operationName}`,
				attributes: requestAttributes
			}, async (span) => {
				try {
					if (options.recordInputs && params) addPrivateRequestAttributes(span, params, isEmbeddings, utils.shouldEnableTruncation(options.enableTruncation));
					const stream = await target.apply(context, args);
					return streaming.instrumentStream(stream, span, Boolean(options.recordOutputs));
				} catch (error) {
					span.setStatus({
						code: spanstatus.SPAN_STATUS_ERROR,
						message: "internal_error"
					});
					exports$1.captureException(error, { mechanism: {
						handled: false,
						type: "auto.ai.google_genai",
						data: { function: methodPath }
					} });
					span.end();
					throw error;
				}
			});
			return trace.startSpan({
				name: `${operationName} ${model}`,
				op: `gen_ai.${operationName}`,
				attributes: requestAttributes
			}, (span) => {
				if (options.recordInputs && params) addPrivateRequestAttributes(span, params, isEmbeddings, utils.shouldEnableTruncation(options.enableTruncation));
				return handleCallbackErrors.handleCallbackErrors(() => target.apply(context, args), (error) => {
					exports$1.captureException(error, { mechanism: {
						handled: false,
						type: "auto.ai.google_genai",
						data: { function: methodPath }
					} });
				}, () => {}, (result) => {
					if (!isEmbeddings) addResponseAttributes(span, result, options.recordOutputs);
				});
			});
		} });
	}
	function createDeepProxy(target, currentPath = "", options) {
		return new Proxy(target, { get: (t, prop, receiver) => {
			const value = Reflect.get(t, prop, receiver);
			const methodPath = utils.buildMethodPath(currentPath, String(prop));
			const instrumentedMethod = constants.GOOGLE_GENAI_METHOD_REGISTRY[methodPath];
			if (typeof value === "function" && instrumentedMethod) {
				const wrappedMethod = instrumentedMethod.operation ? instrumentMethod(value, methodPath, instrumentedMethod, t, options) : value.bind(t);
				if (!instrumentedMethod.proxyResultPath) return wrappedMethod;
				return function(...args) {
					const result = wrappedMethod(...args);
					if (result && typeof result === "object") return createDeepProxy(result, instrumentedMethod.proxyResultPath, options);
					return result;
				};
			}
			if (typeof value === "function") return value.bind(t);
			if (value && typeof value === "object") return createDeepProxy(value, methodPath, options);
			return value;
		} });
	}
	function instrumentGoogleGenAIClient(client, options) {
		return createDeepProxy(client, "", utils.resolveAIRecordingOptions(options));
	}
	exports.extractModel = extractModel;
	exports.instrumentGoogleGenAIClient = instrumentGoogleGenAIClient;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/langchain/constants.js
var require_constants$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const LANGCHAIN_INTEGRATION_NAME = "LangChain";
	const LANGCHAIN_ORIGIN = "auto.ai.langchain";
	const ROLE_MAP = {
		human: "user",
		ai: "assistant",
		assistant: "assistant",
		system: "system",
		function: "function",
		tool: "tool"
	};
	exports.LANGCHAIN_INTEGRATION_NAME = LANGCHAIN_INTEGRATION_NAME;
	exports.LANGCHAIN_ORIGIN = LANGCHAIN_ORIGIN;
	exports.ROLE_MAP = ROLE_MAP;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/langchain/utils.js
var require_utils$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const semanticAttributes = require_semanticAttributes();
	const genAiAttributes = require_gen_ai_attributes();
	const mediaStripping = require_mediaStripping();
	const utils = require_utils$7();
	const constants = require_constants$2();
	const setIfDefined = (target, key, value) => {
		if (value != null) target[key] = value;
	};
	const setNumberIfDefined = (target, key, value) => {
		const n = Number(value);
		if (!Number.isNaN(n)) target[key] = n;
	};
	function asString(v) {
		if (typeof v === "string") return v;
		try {
			return JSON.stringify(v);
		} catch {
			return String(v);
		}
	}
	function normalizeContent(v) {
		if (Array.isArray(v)) try {
			const stripped = v.map((part) => part && typeof part === "object" && mediaStripping.isContentMedia(part) ? mediaStripping.stripInlineMediaFromSingleMessage(part) : part);
			return JSON.stringify(stripped);
		} catch {
			return String(v);
		}
		return asString(v);
	}
	function normalizeMessageRole(role) {
		const normalized = role.toLowerCase();
		return constants.ROLE_MAP[normalized] ?? normalized;
	}
	function normalizeRoleNameFromCtor(name) {
		if (name.includes("System")) return "system";
		if (name.includes("Human")) return "user";
		if (name.includes("AI") || name.includes("Assistant")) return "assistant";
		if (name.includes("Function")) return "function";
		if (name.includes("Tool")) return "tool";
		return "user";
	}
	function getInvocationParams(tags) {
		if (!tags || Array.isArray(tags)) return void 0;
		return tags.invocation_params;
	}
	function normalizeLangChainMessages(messages) {
		return messages.map((message) => {
			const maybeGetType = message._getType;
			if (typeof maybeGetType === "function") return {
				role: normalizeMessageRole(maybeGetType.call(message)),
				content: normalizeContent(message.content)
			};
			if (message.lc === 1 && message.kwargs) {
				const id = message.id;
				const messageType = Array.isArray(id) && id.length > 0 ? id[id.length - 1] : "";
				return {
					role: normalizeMessageRole(typeof messageType === "string" ? normalizeRoleNameFromCtor(messageType) : "user"),
					content: normalizeContent(message.kwargs?.content)
				};
			}
			if (message.type) return {
				role: normalizeMessageRole(String(message.type).toLowerCase()),
				content: normalizeContent(message.content)
			};
			if (message.role) return {
				role: normalizeMessageRole(String(message.role)),
				content: normalizeContent(message.content)
			};
			const ctor = message.constructor?.name;
			if (ctor && ctor !== "Object") return {
				role: normalizeMessageRole(normalizeRoleNameFromCtor(ctor)),
				content: normalizeContent(message.content)
			};
			return {
				role: "user",
				content: normalizeContent(message.content)
			};
		});
	}
	function extractCommonRequestAttributes(serialized, invocationParams, langSmithMetadata) {
		const attrs = {};
		const kwargs = "kwargs" in serialized ? serialized.kwargs : void 0;
		const temperature = invocationParams?.temperature ?? langSmithMetadata?.ls_temperature ?? kwargs?.temperature;
		setNumberIfDefined(attrs, genAiAttributes.GEN_AI_REQUEST_TEMPERATURE_ATTRIBUTE, temperature);
		const maxTokens = invocationParams?.max_tokens ?? langSmithMetadata?.ls_max_tokens ?? kwargs?.max_tokens;
		setNumberIfDefined(attrs, genAiAttributes.GEN_AI_REQUEST_MAX_TOKENS_ATTRIBUTE, maxTokens);
		const topP = invocationParams?.top_p ?? kwargs?.top_p;
		setNumberIfDefined(attrs, genAiAttributes.GEN_AI_REQUEST_TOP_P_ATTRIBUTE, topP);
		const frequencyPenalty = invocationParams?.frequency_penalty;
		setNumberIfDefined(attrs, genAiAttributes.GEN_AI_REQUEST_FREQUENCY_PENALTY_ATTRIBUTE, frequencyPenalty);
		const presencePenalty = invocationParams?.presence_penalty;
		setNumberIfDefined(attrs, genAiAttributes.GEN_AI_REQUEST_PRESENCE_PENALTY_ATTRIBUTE, presencePenalty);
		if (invocationParams && "stream" in invocationParams) setIfDefined(attrs, genAiAttributes.GEN_AI_REQUEST_STREAM_ATTRIBUTE, Boolean(invocationParams.stream));
		return attrs;
	}
	function baseRequestAttributes(system, modelName, serialized, invocationParams, langSmithMetadata) {
		return {
			[genAiAttributes.GEN_AI_SYSTEM_ATTRIBUTE]: asString(system ?? "langchain"),
			[genAiAttributes.GEN_AI_OPERATION_NAME_ATTRIBUTE]: "chat",
			[genAiAttributes.GEN_AI_REQUEST_MODEL_ATTRIBUTE]: asString(modelName),
			[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: constants.LANGCHAIN_ORIGIN,
			...extractCommonRequestAttributes(serialized, invocationParams, langSmithMetadata)
		};
	}
	function extractLLMRequestAttributes(llm, prompts, recordInputs, enableTruncation, invocationParams, langSmithMetadata) {
		const system = langSmithMetadata?.ls_provider;
		const attrs = baseRequestAttributes(system, invocationParams?.model ?? langSmithMetadata?.ls_model_name ?? "unknown", llm, invocationParams, langSmithMetadata);
		if (recordInputs && Array.isArray(prompts) && prompts.length > 0) {
			setIfDefined(attrs, genAiAttributes.GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE, prompts.length);
			const messages = prompts.map((p) => ({
				role: "user",
				content: p
			}));
			setIfDefined(attrs, genAiAttributes.GEN_AI_INPUT_MESSAGES_ATTRIBUTE, enableTruncation ? utils.getTruncatedJsonString(messages) : utils.getJsonString(messages));
		}
		return attrs;
	}
	function extractChatModelRequestAttributes(llm, langChainMessages, recordInputs, enableTruncation, invocationParams, langSmithMetadata) {
		const attrs = baseRequestAttributes(langSmithMetadata?.ls_provider ?? llm.id?.[2], invocationParams?.model ?? langSmithMetadata?.ls_model_name ?? "unknown", llm, invocationParams, langSmithMetadata);
		if (recordInputs && Array.isArray(langChainMessages) && langChainMessages.length > 0) {
			const normalized = normalizeLangChainMessages(langChainMessages.flat());
			const { systemInstructions, filteredMessages } = utils.extractSystemInstructions(normalized);
			if (systemInstructions) setIfDefined(attrs, genAiAttributes.GEN_AI_SYSTEM_INSTRUCTIONS_ATTRIBUTE, systemInstructions);
			const filteredLength = Array.isArray(filteredMessages) ? filteredMessages.length : 0;
			setIfDefined(attrs, genAiAttributes.GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE, filteredLength);
			setIfDefined(attrs, genAiAttributes.GEN_AI_INPUT_MESSAGES_ATTRIBUTE, enableTruncation ? utils.getTruncatedJsonString(filteredMessages) : utils.getJsonString(filteredMessages));
		}
		return attrs;
	}
	function addToolCallsAttributes(generations, attrs) {
		const toolCalls = [];
		const flatGenerations = generations.flat();
		for (const gen of flatGenerations) {
			const msgToolCalls = gen.message?.tool_calls;
			if (Array.isArray(msgToolCalls) && msgToolCalls.length > 0) toolCalls.push(...msgToolCalls);
			else {
				const content = gen.message?.content;
				if (Array.isArray(content)) for (const item of content) {
					const t = item;
					if (t.type === "tool_use") toolCalls.push(t);
				}
			}
		}
		if (toolCalls.length > 0) setIfDefined(attrs, genAiAttributes.GEN_AI_RESPONSE_TOOL_CALLS_ATTRIBUTE, asString(toolCalls));
	}
	function addTokenUsageAttributes(llmOutput, attrs) {
		if (!llmOutput) return;
		const tokenUsage = llmOutput.tokenUsage;
		const anthropicUsage = llmOutput.usage;
		if (tokenUsage) {
			setNumberIfDefined(attrs, genAiAttributes.GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE, tokenUsage.promptTokens);
			setNumberIfDefined(attrs, genAiAttributes.GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE, tokenUsage.completionTokens);
			setNumberIfDefined(attrs, genAiAttributes.GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE, tokenUsage.totalTokens);
		} else if (anthropicUsage) {
			setNumberIfDefined(attrs, genAiAttributes.GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE, anthropicUsage.input_tokens);
			setNumberIfDefined(attrs, genAiAttributes.GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE, anthropicUsage.output_tokens);
			const input = Number(anthropicUsage.input_tokens);
			const output = Number(anthropicUsage.output_tokens);
			const total = (Number.isNaN(input) ? 0 : input) + (Number.isNaN(output) ? 0 : output);
			if (total > 0) setNumberIfDefined(attrs, genAiAttributes.GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE, total);
			if (anthropicUsage.cache_creation_input_tokens !== void 0) setNumberIfDefined(attrs, genAiAttributes.GEN_AI_USAGE_CACHE_CREATION_INPUT_TOKENS_ATTRIBUTE, anthropicUsage.cache_creation_input_tokens);
			if (anthropicUsage.cache_read_input_tokens !== void 0) setNumberIfDefined(attrs, genAiAttributes.GEN_AI_USAGE_CACHE_READ_INPUT_TOKENS_ATTRIBUTE, anthropicUsage.cache_read_input_tokens);
		}
	}
	function extractLlmResponseAttributes(llmResult, recordOutputs) {
		if (!llmResult) return;
		const attrs = {};
		if (Array.isArray(llmResult.generations)) {
			const finishReasons = llmResult.generations.flat().map((g) => {
				if (g.generationInfo?.finish_reason) return g.generationInfo.finish_reason;
				if (g.generation_info?.finish_reason) return g.generation_info.finish_reason;
				return null;
			}).filter((r) => typeof r === "string");
			if (finishReasons.length > 0) setIfDefined(attrs, genAiAttributes.GEN_AI_RESPONSE_FINISH_REASONS_ATTRIBUTE, asString(finishReasons));
			addToolCallsAttributes(llmResult.generations, attrs);
			if (recordOutputs) {
				const texts = llmResult.generations.flat().map((gen) => gen.text ?? gen.message?.content).filter((t) => typeof t === "string");
				if (texts.length > 0) setIfDefined(attrs, genAiAttributes.GEN_AI_RESPONSE_TEXT_ATTRIBUTE, asString(texts));
			}
		}
		addTokenUsageAttributes(llmResult.llmOutput, attrs);
		const llmOutput = llmResult.llmOutput;
		const v1Message = (llmResult.generations?.[0]?.[0])?.message;
		const modelName = llmOutput?.model_name ?? llmOutput?.model ?? v1Message?.response_metadata?.model_name;
		if (modelName) setIfDefined(attrs, genAiAttributes.GEN_AI_RESPONSE_MODEL_ATTRIBUTE, modelName);
		const responseId = llmOutput?.id ?? v1Message?.id;
		if (responseId) setIfDefined(attrs, genAiAttributes.GEN_AI_RESPONSE_ID_ATTRIBUTE, responseId);
		const stopReason = llmOutput?.stop_reason ?? v1Message?.response_metadata?.finish_reason;
		if (stopReason) setIfDefined(attrs, genAiAttributes.GEN_AI_RESPONSE_STOP_REASON_ATTRIBUTE, asString(stopReason));
		return attrs;
	}
	function getAgentNameFromMetadata(metadata) {
		const attrs = {};
		const agentName = metadata?.lc_agent_name;
		if (typeof agentName === "string") attrs[genAiAttributes.GEN_AI_AGENT_NAME_ATTRIBUTE] = agentName;
		return attrs;
	}
	function extractToolDefinitions(extraParams) {
		const tools = extraParams?.invocation_params?.tools ?? extraParams?.options?.tools;
		if (!Array.isArray(tools) || tools.length === 0) return void 0;
		const toolDefs = tools.map((tool) => {
			const fn = tool.function;
			return {
				type: "function",
				name: tool.name ?? fn?.name ?? "",
				description: tool.description ?? fn?.description
			};
		});
		return JSON.stringify(toolDefs);
	}
	function isCallbackManager(value) {
		if (!value || typeof value !== "object") return false;
		const candidate = value;
		return typeof candidate.addHandler === "function" && typeof candidate.copy === "function";
	}
	function isSentryHandler(handler) {
		return typeof handler === "object" && handler?.name === "SentryCallbackHandler";
	}
	function containsSentryHandler(handlers) {
		return handlers.some(isSentryHandler);
	}
	function _INTERNAL_mergeLangChainCallbackHandler(existing, sentryHandler) {
		if (!existing) return [sentryHandler];
		if (isCallbackManager(existing)) {
			if (containsSentryHandler(existing.handlers ?? [])) return existing;
			const copied = existing.copy();
			copied.addHandler(sentryHandler, true);
			return copied;
		}
		const handlers = Array.isArray(existing) ? existing : [existing];
		if (containsSentryHandler(handlers)) return existing;
		return [...handlers, sentryHandler];
	}
	exports._INTERNAL_mergeLangChainCallbackHandler = _INTERNAL_mergeLangChainCallbackHandler;
	exports.extractChatModelRequestAttributes = extractChatModelRequestAttributes;
	exports.extractLLMRequestAttributes = extractLLMRequestAttributes;
	exports.extractLlmResponseAttributes = extractLlmResponseAttributes;
	exports.extractToolDefinitions = extractToolDefinitions;
	exports.getAgentNameFromMetadata = getAgentNameFromMetadata;
	exports.getInvocationParams = getInvocationParams;
	exports.normalizeLangChainMessages = normalizeLangChainMessages;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/langchain/index.js
var require_langchain = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const exports$1 = require_exports$1();
	const semanticAttributes = require_semanticAttributes();
	const spanstatus = require_spanstatus();
	const trace = require_trace();
	const genAiAttributes = require_gen_ai_attributes();
	const utils = require_utils$7();
	const constants = require_constants$2();
	const utils$1 = require_utils$2();
	function createLangChainCallbackHandler(options = {}) {
		const { recordInputs, recordOutputs } = utils.resolveAIRecordingOptions(options);
		const enableTruncation = utils.shouldEnableTruncation(options.enableTruncation);
		const spanMap = /* @__PURE__ */ new Map();
		const exitSpan = (runId) => {
			const span = spanMap.get(runId);
			if (span?.isRecording()) {
				span.end();
				spanMap.delete(runId);
			}
		};
		const handler = {
			lc_serializable: false,
			lc_namespace: [
				"langchain_core",
				"callbacks",
				"sentry"
			],
			lc_secrets: void 0,
			lc_attributes: void 0,
			lc_aliases: void 0,
			lc_serializable_keys: void 0,
			lc_id: [
				"langchain_core",
				"callbacks",
				"sentry"
			],
			lc_kwargs: {},
			name: "SentryCallbackHandler",
			ignoreLLM: false,
			ignoreChain: false,
			ignoreAgent: false,
			ignoreRetriever: false,
			ignoreCustomEvent: false,
			raiseError: false,
			awaitHandlers: true,
			handleLLMStart(llm, prompts, runId, _parentRunId, _extraParams, tags, metadata, _runName) {
				const invocationParams = utils$1.getInvocationParams(tags);
				const attributes = utils$1.extractLLMRequestAttributes(llm, prompts, recordInputs, enableTruncation, invocationParams, metadata);
				const modelName = attributes[genAiAttributes.GEN_AI_REQUEST_MODEL_ATTRIBUTE];
				const operationName = attributes[genAiAttributes.GEN_AI_OPERATION_NAME_ATTRIBUTE];
				trace.startSpanManual({
					name: `${operationName} ${modelName}`,
					op: "gen_ai.chat",
					attributes: {
						...utils$1.getAgentNameFromMetadata(metadata),
						...attributes,
						[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_OP]: "gen_ai.chat"
					}
				}, (span) => {
					spanMap.set(runId, span);
					return span;
				});
			},
			handleChatModelStart(llm, messages, runId, _parentRunId, extraParams, tags, metadata, _runName) {
				const invocationParams = utils$1.getInvocationParams(tags);
				const attributes = utils$1.extractChatModelRequestAttributes(llm, messages, recordInputs, enableTruncation, invocationParams, metadata);
				const toolDefsJson = utils$1.extractToolDefinitions(extraParams);
				if (toolDefsJson) attributes[genAiAttributes.GEN_AI_REQUEST_AVAILABLE_TOOLS_ATTRIBUTE] = toolDefsJson;
				const modelName = attributes[genAiAttributes.GEN_AI_REQUEST_MODEL_ATTRIBUTE];
				const operationName = attributes[genAiAttributes.GEN_AI_OPERATION_NAME_ATTRIBUTE];
				trace.startSpanManual({
					name: `${operationName} ${modelName}`,
					op: "gen_ai.chat",
					attributes: {
						...utils$1.getAgentNameFromMetadata(metadata),
						...attributes,
						[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_OP]: "gen_ai.chat"
					}
				}, (span) => {
					spanMap.set(runId, span);
					return span;
				});
			},
			handleLLMEnd(output, runId, _parentRunId, _tags, _extraParams) {
				const span = spanMap.get(runId);
				if (span?.isRecording()) {
					const attributes = utils$1.extractLlmResponseAttributes(output, recordOutputs);
					if (attributes) span.setAttributes(attributes);
					exitSpan(runId);
				}
			},
			handleLLMError(error, runId) {
				const span = spanMap.get(runId);
				if (span?.isRecording()) {
					span.setStatus({
						code: spanstatus.SPAN_STATUS_ERROR,
						message: "internal_error"
					});
					exitSpan(runId);
				}
				exports$1.captureException(error, { mechanism: {
					handled: false,
					type: `${constants.LANGCHAIN_ORIGIN}.llm_error_handler`
				} });
			},
			handleChainStart(chain, inputs, runId, _parentRunId, _tags, metadata, _runType, runName) {
				if (metadata?.__sentry_langgraph__) return;
				const chainName = runName || chain.name || "unknown_chain";
				const attributes = {
					[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.ai.langchain",
					"langchain.chain.name": chainName
				};
				if (recordInputs) attributes["langchain.chain.inputs"] = JSON.stringify(inputs);
				trace.startSpanManual({
					name: `chain ${chainName}`,
					op: "gen_ai.invoke_agent",
					attributes: {
						...attributes,
						[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_OP]: "gen_ai.invoke_agent"
					}
				}, (span) => {
					spanMap.set(runId, span);
					return span;
				});
			},
			handleChainEnd(outputs, runId) {
				const span = spanMap.get(runId);
				if (span?.isRecording()) {
					if (recordOutputs) span.setAttributes({ "langchain.chain.outputs": JSON.stringify(outputs) });
					exitSpan(runId);
				}
			},
			handleChainError(error, runId) {
				const span = spanMap.get(runId);
				if (span?.isRecording()) {
					span.setStatus({
						code: spanstatus.SPAN_STATUS_ERROR,
						message: "internal_error"
					});
					exitSpan(runId);
				}
				exports$1.captureException(error, { mechanism: {
					handled: false,
					type: `${constants.LANGCHAIN_ORIGIN}.chain_error_handler`
				} });
			},
			handleToolStart(tool, input, runId, _parentRunId, _tags, metadata, runName) {
				if (metadata?.__sentry_langgraph__) return;
				const toolName = runName || tool.name || "unknown_tool";
				const attributes = {
					...utils$1.getAgentNameFromMetadata(metadata),
					[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: constants.LANGCHAIN_ORIGIN,
					[genAiAttributes.GEN_AI_OPERATION_NAME_ATTRIBUTE]: "execute_tool",
					[genAiAttributes.GEN_AI_TOOL_NAME_ATTRIBUTE]: toolName
				};
				if (recordInputs) attributes[genAiAttributes.GEN_AI_TOOL_INPUT_ATTRIBUTE] = input;
				trace.startSpanManual({
					name: `execute_tool ${toolName}`,
					op: "gen_ai.execute_tool",
					attributes: {
						...attributes,
						[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_OP]: "gen_ai.execute_tool"
					}
				}, (span) => {
					spanMap.set(runId, span);
					return span;
				});
			},
			handleToolEnd(output, runId) {
				const span = spanMap.get(runId);
				if (span?.isRecording()) {
					if (recordOutputs) {
						const outputObj = output;
						const content = outputObj && typeof outputObj === "object" && "content" in outputObj ? outputObj.content : output;
						span.setAttributes({ [genAiAttributes.GEN_AI_TOOL_OUTPUT_ATTRIBUTE]: typeof content === "string" ? content : JSON.stringify(content) });
					}
					exitSpan(runId);
				}
			},
			handleToolError(error, runId) {
				const span = spanMap.get(runId);
				if (span?.isRecording()) {
					span.setStatus({
						code: spanstatus.SPAN_STATUS_ERROR,
						message: "internal_error"
					});
					exitSpan(runId);
				}
				exports$1.captureException(error, { mechanism: {
					handled: false,
					type: `${constants.LANGCHAIN_ORIGIN}.tool_error_handler`
				} });
			},
			copy() {
				return handler;
			},
			toJSON() {
				return {
					lc: 1,
					type: "not_implemented",
					id: handler.lc_id
				};
			},
			toJSONNotImplemented() {
				return {
					lc: 1,
					type: "not_implemented",
					id: handler.lc_id
				};
			}
		};
		return handler;
	}
	exports.createLangChainCallbackHandler = createLangChainCallbackHandler;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/langgraph/constants.js
var require_constants$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const LANGGRAPH_INTEGRATION_NAME = "LangGraph";
	const LANGGRAPH_ORIGIN = "auto.ai.langgraph";
	exports.LANGGRAPH_INTEGRATION_NAME = LANGGRAPH_INTEGRATION_NAME;
	exports.LANGGRAPH_ORIGIN = LANGGRAPH_ORIGIN;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/langgraph/utils.js
var require_utils$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const exports$1 = require_exports$1();
	const semanticAttributes = require_semanticAttributes();
	const spanstatus = require_spanstatus();
	const trace = require_trace();
	const genAiAttributes = require_gen_ai_attributes();
	const utils = require_utils$2();
	const constants = require_constants$1();
	function extractLLMFromParams(args) {
		const arg = args[0];
		if (typeof arg !== "object" || !arg || !("llm" in arg) || !arg.llm || typeof arg.llm !== "object") return null;
		const llm = arg.llm;
		if (typeof llm.modelName !== "string" && typeof llm.model !== "string") return null;
		return llm;
	}
	function extractAgentNameFromParams(args) {
		const arg = args[0];
		if (typeof arg === "object" && !!arg && "name" in arg && typeof arg.name === "string") return arg.name;
		return null;
	}
	function wrapToolsWithSpans(tools, options, agentName) {
		const SENTRY_WRAPPED = "__sentry_tool_wrapped__";
		for (const tool of tools) {
			if (!tool || typeof tool !== "object") continue;
			const t = tool;
			const originalInvoke = t.invoke;
			if (typeof originalInvoke !== "function" || Object.prototype.hasOwnProperty.call(t, SENTRY_WRAPPED)) continue;
			const toolName = typeof t.name === "string" ? t.name : "unknown_tool";
			const toolDescription = typeof t.description === "string" ? t.description : void 0;
			t.invoke = new Proxy(originalInvoke, { apply(target, thisArg, args) {
				const spanAttributes = {
					[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: constants.LANGGRAPH_ORIGIN,
					[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_OP]: genAiAttributes.GEN_AI_EXECUTE_TOOL_OPERATION_ATTRIBUTE,
					[genAiAttributes.GEN_AI_OPERATION_NAME_ATTRIBUTE]: "execute_tool",
					[genAiAttributes.GEN_AI_TOOL_NAME_ATTRIBUTE]: toolName,
					[genAiAttributes.GEN_AI_TOOL_TYPE_ATTRIBUTE]: "function"
				};
				const callAgentName = args[1]?.metadata?.lc_agent_name ?? agentName;
				if (typeof callAgentName === "string") spanAttributes[genAiAttributes.GEN_AI_AGENT_NAME_ATTRIBUTE] = callAgentName;
				if (toolDescription) spanAttributes[genAiAttributes.GEN_AI_TOOL_DESCRIPTION_ATTRIBUTE] = toolDescription;
				const input = args[0];
				if (typeof input === "object" && !!input) {
					if ("id" in input && typeof input.id === "string") spanAttributes[genAiAttributes.GEN_AI_TOOL_CALL_ID_ATTRIBUTE] = input.id;
					if (options.recordInputs) {
						const toolArgs = "args" in input && typeof input.args === "object" ? input.args : input;
						try {
							spanAttributes[genAiAttributes.GEN_AI_TOOL_INPUT_ATTRIBUTE] = JSON.stringify(toolArgs);
						} catch {}
					}
				}
				return trace.startSpan({
					op: genAiAttributes.GEN_AI_EXECUTE_TOOL_OPERATION_ATTRIBUTE,
					name: `execute_tool ${toolName}`,
					attributes: spanAttributes
				}, async (span) => {
					try {
						const result = await Reflect.apply(target, thisArg, args);
						if (options.recordOutputs) try {
							const resultObj = result;
							const content = resultObj && typeof resultObj === "object" && "content" in resultObj ? resultObj.content : result;
							span.setAttribute(genAiAttributes.GEN_AI_TOOL_OUTPUT_ATTRIBUTE, typeof content === "string" ? content : JSON.stringify(content));
						} catch {}
						return result;
					} catch (error) {
						span.setStatus({
							code: spanstatus.SPAN_STATUS_ERROR,
							message: "internal_error"
						});
						exports$1.captureException(error, { mechanism: {
							handled: false,
							type: "auto.ai.langgraph.error"
						} });
						throw error;
					}
				});
			} });
			Object.defineProperty(t, SENTRY_WRAPPED, {
				value: true,
				enumerable: false
			});
		}
		return tools;
	}
	function extractToolCalls(messages) {
		if (!messages || messages.length === 0) return null;
		const toolCalls = [];
		for (const message of messages) if (message && typeof message === "object") {
			const msgToolCalls = message.tool_calls;
			if (msgToolCalls && Array.isArray(msgToolCalls)) toolCalls.push(...msgToolCalls);
		}
		return toolCalls.length > 0 ? toolCalls : null;
	}
	function extractTokenUsageFromMessage(message) {
		const msg = message;
		let inputTokens = 0;
		let outputTokens = 0;
		let totalTokens = 0;
		if (msg.usage_metadata && typeof msg.usage_metadata === "object") {
			const usage = msg.usage_metadata;
			if (typeof usage.input_tokens === "number") inputTokens = usage.input_tokens;
			if (typeof usage.output_tokens === "number") outputTokens = usage.output_tokens;
			if (typeof usage.total_tokens === "number") totalTokens = usage.total_tokens;
			return {
				inputTokens,
				outputTokens,
				totalTokens
			};
		}
		if (msg.response_metadata && typeof msg.response_metadata === "object") {
			const metadata = msg.response_metadata;
			if (metadata.tokenUsage && typeof metadata.tokenUsage === "object") {
				const tokenUsage = metadata.tokenUsage;
				if (typeof tokenUsage.promptTokens === "number") inputTokens = tokenUsage.promptTokens;
				if (typeof tokenUsage.completionTokens === "number") outputTokens = tokenUsage.completionTokens;
				if (typeof tokenUsage.totalTokens === "number") totalTokens = tokenUsage.totalTokens;
			}
		}
		return {
			inputTokens,
			outputTokens,
			totalTokens
		};
	}
	function extractModelMetadata(span, message) {
		const msg = message;
		if (msg.response_metadata && typeof msg.response_metadata === "object") {
			const metadata = msg.response_metadata;
			if (metadata.model_name && typeof metadata.model_name === "string") span.setAttribute(genAiAttributes.GEN_AI_RESPONSE_MODEL_ATTRIBUTE, metadata.model_name);
			if (metadata.finish_reason && typeof metadata.finish_reason === "string") span.setAttribute(genAiAttributes.GEN_AI_RESPONSE_FINISH_REASONS_ATTRIBUTE, [metadata.finish_reason]);
		}
	}
	function extractToolsFromCompiledGraph(compiledGraph) {
		if (!compiledGraph.builder?.nodes?.tools?.runnable?.tools) return null;
		const tools = compiledGraph.builder?.nodes?.tools?.runnable?.tools;
		if (!tools || !Array.isArray(tools) || tools.length === 0) return null;
		return tools.map((tool) => ({
			name: tool.lc_kwargs?.name,
			description: tool.lc_kwargs?.description,
			schema: tool.lc_kwargs?.schema
		}));
	}
	function setResponseAttributes(span, inputMessages, result) {
		const outputMessages = result?.messages;
		if (!outputMessages || !Array.isArray(outputMessages)) return;
		const inputCount = inputMessages?.length ?? 0;
		const newMessages = outputMessages.length > inputCount ? outputMessages.slice(inputCount) : [];
		if (newMessages.length === 0) return;
		const toolCalls = extractToolCalls(newMessages);
		if (toolCalls) span.setAttribute(genAiAttributes.GEN_AI_RESPONSE_TOOL_CALLS_ATTRIBUTE, JSON.stringify(toolCalls));
		const normalizedNewMessages = utils.normalizeLangChainMessages(newMessages);
		span.setAttribute(genAiAttributes.GEN_AI_RESPONSE_TEXT_ATTRIBUTE, JSON.stringify(normalizedNewMessages));
		let totalInputTokens = 0;
		let totalOutputTokens = 0;
		let totalTokens = 0;
		for (const message of newMessages) {
			const tokens = extractTokenUsageFromMessage(message);
			totalInputTokens += tokens.inputTokens;
			totalOutputTokens += tokens.outputTokens;
			totalTokens += tokens.totalTokens;
			extractModelMetadata(span, message);
		}
		if (totalInputTokens > 0) span.setAttribute(genAiAttributes.GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE, totalInputTokens);
		if (totalOutputTokens > 0) span.setAttribute(genAiAttributes.GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE, totalOutputTokens);
		if (totalTokens > 0) span.setAttribute(genAiAttributes.GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE, totalTokens);
	}
	exports.extractAgentNameFromParams = extractAgentNameFromParams;
	exports.extractLLMFromParams = extractLLMFromParams;
	exports.extractModelMetadata = extractModelMetadata;
	exports.extractTokenUsageFromMessage = extractTokenUsageFromMessage;
	exports.extractToolCalls = extractToolCalls;
	exports.extractToolsFromCompiledGraph = extractToolsFromCompiledGraph;
	exports.setResponseAttributes = setResponseAttributes;
	exports.wrapToolsWithSpans = wrapToolsWithSpans;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/langgraph/index.js
var require_langgraph = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const exports$1 = require_exports$1();
	const semanticAttributes = require_semanticAttributes();
	const spanstatus = require_spanstatus();
	const trace = require_trace();
	const genAiAttributes = require_gen_ai_attributes();
	const utils = require_utils$7();
	const index = require_langchain();
	const utils$2 = require_utils$2();
	const constants = require_constants$1();
	const utils$1 = require_utils$1();
	let _insideCreateReactAgent = false;
	const SENTRY_PATCHED = "__sentry_patched__";
	function instrumentStateGraphCompile(originalCompile, options) {
		if (Object.prototype.hasOwnProperty.call(originalCompile, SENTRY_PATCHED)) return originalCompile;
		const sentryHandler = index.createLangChainCallbackHandler(options);
		const wrapped = new Proxy(originalCompile, { apply(target, thisArg, args) {
			if (_insideCreateReactAgent) return Reflect.apply(target, thisArg, args);
			return trace.startSpan({
				op: "gen_ai.create_agent",
				name: "create_agent",
				attributes: {
					[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: constants.LANGGRAPH_ORIGIN,
					[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_OP]: "gen_ai.create_agent",
					[genAiAttributes.GEN_AI_OPERATION_NAME_ATTRIBUTE]: "create_agent"
				}
			}, (span) => {
				try {
					const compiledGraph = Reflect.apply(target, thisArg, args);
					const compileOptions = args.length > 0 ? args[0] : {};
					if (compileOptions?.name && typeof compileOptions.name === "string") {
						span.setAttribute(genAiAttributes.GEN_AI_AGENT_NAME_ATTRIBUTE, compileOptions.name);
						span.updateName(`create_agent ${compileOptions.name}`);
					}
					const originalInvoke = compiledGraph.invoke;
					if (originalInvoke && typeof originalInvoke === "function") compiledGraph.invoke = instrumentCompiledGraphInvoke(originalInvoke.bind(compiledGraph), compiledGraph, compileOptions, options, void 0, sentryHandler);
					return compiledGraph;
				} catch (error) {
					span.setStatus({
						code: spanstatus.SPAN_STATUS_ERROR,
						message: "internal_error"
					});
					exports$1.captureException(error, { mechanism: {
						handled: false,
						type: "auto.ai.langgraph.error"
					} });
					throw error;
				}
			});
		} });
		Object.defineProperty(wrapped, SENTRY_PATCHED, {
			value: true,
			enumerable: false
		});
		return wrapped;
	}
	function instrumentCompiledGraphInvoke(originalInvoke, graphInstance, compileOptions, options, llm, sentryCallbackHandler) {
		return new Proxy(originalInvoke, { apply(target, thisArg, args) {
			const modelName = llm?.modelName ?? llm?.model;
			return trace.startSpan({
				op: "gen_ai.invoke_agent",
				name: "invoke_agent",
				attributes: {
					[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: constants.LANGGRAPH_ORIGIN,
					[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_OP]: genAiAttributes.GEN_AI_INVOKE_AGENT_OPERATION_ATTRIBUTE,
					[genAiAttributes.GEN_AI_OPERATION_NAME_ATTRIBUTE]: "invoke_agent"
				}
			}, async (span) => {
				try {
					const graphName = compileOptions?.name;
					if (graphName && typeof graphName === "string") {
						span.setAttribute(genAiAttributes.GEN_AI_PIPELINE_NAME_ATTRIBUTE, graphName);
						span.setAttribute(genAiAttributes.GEN_AI_AGENT_NAME_ATTRIBUTE, graphName);
						span.updateName(`invoke_agent ${graphName}`);
					}
					if (modelName) span.setAttribute(genAiAttributes.GEN_AI_REQUEST_MODEL_ATTRIBUTE, modelName);
					const threadId = ((args.length > 1 ? args[1] : void 0)?.configurable)?.thread_id;
					if (threadId && typeof threadId === "string") span.setAttribute(genAiAttributes.GEN_AI_CONVERSATION_ID_ATTRIBUTE, threadId);
					if (sentryCallbackHandler) {
						const invokeConfig = args[1] ?? {};
						args[1] = invokeConfig;
						invokeConfig.metadata = {
							...invokeConfig.metadata ?? {},
							__sentry_langgraph__: true,
							...typeof graphName === "string" ? { lc_agent_name: graphName } : {}
						};
						invokeConfig.callbacks = utils$2._INTERNAL_mergeLangChainCallbackHandler(invokeConfig.callbacks, sentryCallbackHandler);
					}
					const tools = utils$1.extractToolsFromCompiledGraph(graphInstance);
					if (tools) span.setAttribute(genAiAttributes.GEN_AI_REQUEST_AVAILABLE_TOOLS_ATTRIBUTE, JSON.stringify(tools));
					const recordInputs = options.recordInputs;
					const recordOutputs = options.recordOutputs;
					const inputMessages = args.length > 0 ? args[0]?.messages ?? [] : [];
					if (inputMessages && recordInputs) {
						const normalizedMessages = utils$2.normalizeLangChainMessages(inputMessages);
						const { systemInstructions, filteredMessages } = utils.extractSystemInstructions(normalizedMessages);
						if (systemInstructions) span.setAttribute(genAiAttributes.GEN_AI_SYSTEM_INSTRUCTIONS_ATTRIBUTE, systemInstructions);
						const enableTruncation = utils.shouldEnableTruncation(options.enableTruncation);
						const filteredLength = Array.isArray(filteredMessages) ? filteredMessages.length : 0;
						span.setAttributes({
							[genAiAttributes.GEN_AI_INPUT_MESSAGES_ATTRIBUTE]: enableTruncation ? utils.getTruncatedJsonString(filteredMessages) : utils.getJsonString(filteredMessages),
							[genAiAttributes.GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE]: filteredLength
						});
					}
					const result = await Reflect.apply(target, thisArg, args);
					if (recordOutputs) utils$1.setResponseAttributes(span, inputMessages ?? null, result);
					return result;
				} catch (error) {
					span.setStatus({
						code: spanstatus.SPAN_STATUS_ERROR,
						message: "internal_error"
					});
					exports$1.captureException(error, { mechanism: {
						handled: false,
						type: "auto.ai.langgraph.error"
					} });
					throw error;
				}
			});
		} });
	}
	function instrumentCreateReactAgent(originalCreateReactAgent, options) {
		if (Object.prototype.hasOwnProperty.call(originalCreateReactAgent, SENTRY_PATCHED)) return originalCreateReactAgent;
		const resolvedOptions = utils.resolveAIRecordingOptions(options);
		const sentryHandler = index.createLangChainCallbackHandler(resolvedOptions);
		const wrapped = new Proxy(originalCreateReactAgent, { apply(target, thisArg, args) {
			const llm = utils$1.extractLLMFromParams(args);
			const agentName = utils$1.extractAgentNameFromParams(args);
			const params = args[0];
			if (params && Array.isArray(params.tools) && params.tools.length > 0) utils$1.wrapToolsWithSpans(params.tools, resolvedOptions, agentName ?? void 0);
			_insideCreateReactAgent = true;
			let compiledGraph;
			try {
				compiledGraph = Reflect.apply(target, thisArg, args);
			} finally {
				_insideCreateReactAgent = false;
			}
			const originalInvoke = compiledGraph.invoke;
			if (originalInvoke && typeof originalInvoke === "function") {
				const compileOptions = {};
				if (agentName) compileOptions.name = agentName;
				compiledGraph.invoke = instrumentCompiledGraphInvoke(originalInvoke.bind(compiledGraph), compiledGraph, compileOptions, resolvedOptions, llm, sentryHandler);
			}
			return compiledGraph;
		} });
		Object.defineProperty(wrapped, SENTRY_PATCHED, {
			value: true,
			enumerable: false
		});
		return wrapped;
	}
	function instrumentLangGraph(stateGraph, options) {
		stateGraph.compile = instrumentStateGraphCompile(stateGraph.compile, utils.resolveAIRecordingOptions(options));
		return stateGraph;
	}
	exports.instrumentCreateReactAgent = instrumentCreateReactAgent;
	exports.instrumentLangGraph = instrumentLangGraph;
	exports.instrumentStateGraphCompile = instrumentStateGraphCompile;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/spans/envelope.js
var require_envelope = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const dsn = require_dsn();
	const envelope = require_envelope$4();
	const isBrowser = require_isBrowser();
	const randomSafeContext = require_randomSafeContext();
	function createStreamedSpanEnvelope(serializedSpans, dsc, client) {
		const options = client.getOptions();
		const dsn$1 = client.getDsn();
		const tunnel = options.tunnel;
		const sdk = envelope.getSdkMetadataForEnvelopeHeader(options._metadata);
		const headers = {
			sent_at: new Date(randomSafeContext.safeDateNow()).toISOString(),
			...dscHasRequiredProps(dsc) && { trace: dsc },
			...sdk && { sdk },
			...!!tunnel && dsn$1 && { dsn: dsn.dsnToString(dsn$1) }
		};
		const inferSetting = client.getDataCollectionOptions().userInfo ? "auto" : "never";
		const spanContainer = [{
			type: "span",
			item_count: serializedSpans.length,
			content_type: "application/vnd.sentry.items.span.v2+json"
		}, {
			version: 2,
			...isBrowser.isBrowser() && { ingest_settings: {
				infer_ip: inferSetting,
				infer_user_agent: inferSetting
			} },
			items: serializedSpans
		}];
		return envelope.createEnvelope(headers, [spanContainer]);
	}
	function dscHasRequiredProps(dsc) {
		return !!dsc.trace_id && !!dsc.public_key;
	}
	exports.createStreamedSpanEnvelope = createStreamedSpanEnvelope;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/spans/estimateSize.js
var require_estimateSize = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const attributes = require_attributes$1();
	function estimateSerializedSpanSizeInBytes(span) {
		let weight = 156;
		weight += span.name.length * 2;
		weight += attributes.estimateTypedAttributesSizeInBytes(span.attributes);
		if (span.links && span.links.length > 0) {
			const attributes$1 = span.links[0]?.attributes;
			const linkWeight = 100 + (attributes$1 ? attributes.estimateTypedAttributesSizeInBytes(attributes$1) : 0);
			weight += linkWeight * span.links.length;
		}
		return weight;
	}
	exports.estimateSerializedSpanSizeInBytes = estimateSerializedSpanSizeInBytes;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/spans/spanBuffer.js
var require_spanBuffer = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const debugBuild = require_debug_build();
	const debugLogger = require_debug_logger();
	const timer = require_timer();
	const dynamicSamplingContext = require_dynamicSamplingContext();
	const envelope = require_envelope();
	const estimateSize = require_estimateSize();
	const MAX_SPANS_PER_ENVELOPE = 1e3;
	const MAX_TRACE_WEIGHT_IN_BYTES = 5e6;
	var SpanBuffer = class {
		constructor(client, options) {
			this._traceBuckets = /* @__PURE__ */ new Map();
			this._client = client;
			const { maxSpanLimit, flushInterval, maxTraceWeightInBytes } = options ?? {};
			this._maxSpanLimit = maxSpanLimit && maxSpanLimit > 0 && maxSpanLimit <= MAX_SPANS_PER_ENVELOPE ? maxSpanLimit : MAX_SPANS_PER_ENVELOPE;
			this._flushInterval = flushInterval && flushInterval > 0 ? flushInterval : 5e3;
			this._maxTraceWeight = maxTraceWeightInBytes && maxTraceWeightInBytes > 0 ? maxTraceWeightInBytes : MAX_TRACE_WEIGHT_IN_BYTES;
			this._client.on("flush", () => {
				this.drain();
			});
			this._client.on("close", () => {
				this._traceBuckets.forEach((bucket) => {
					clearTimeout(bucket.timeout);
				});
				this._traceBuckets.clear();
			});
		}
		/**
		* Add a span to the buffer.
		*/
		add(spanJSON) {
			const traceId = spanJSON.trace_id;
			let bucket = this._traceBuckets.get(traceId);
			if (!bucket) {
				bucket = {
					spans: /* @__PURE__ */ new Set(),
					size: 0,
					timeout: timer.safeUnref(setTimeout(() => {
						this.flush(traceId);
					}, this._flushInterval))
				};
				this._traceBuckets.set(traceId, bucket);
			}
			bucket.spans.add(spanJSON);
			bucket.size += estimateSize.estimateSerializedSpanSizeInBytes(spanJSON);
			if (bucket.spans.size >= this._maxSpanLimit || bucket.size >= this._maxTraceWeight) this.flush(traceId);
		}
		/**
		* Drain and flush all buffered traces.
		*/
		drain() {
			if (!this._traceBuckets.size) return;
			debugBuild.DEBUG_BUILD && debugLogger.debug.log(`Flushing span tree map with ${this._traceBuckets.size} traces`);
			this._traceBuckets.forEach((_, traceId) => {
				this.flush(traceId);
			});
		}
		/**
		* Flush spans of a specific trace.
		* In contrast to {@link SpanBuffer.drain}, this method does not flush all traces, but only the one with the given traceId.
		*/
		flush(traceId) {
			const bucket = this._traceBuckets.get(traceId);
			if (!bucket) return;
			if (!bucket.spans.size) {
				this._removeTrace(traceId);
				return;
			}
			const spans = Array.from(bucket.spans);
			const segmentSpan = spans[0]?._segmentSpan;
			if (!segmentSpan) {
				debugBuild.DEBUG_BUILD && debugLogger.debug.warn("No segment span reference found on span JSON, cannot compute DSC");
				this._removeTrace(traceId);
				return;
			}
			const dsc = dynamicSamplingContext.getDynamicSamplingContextFromSpan(segmentSpan);
			const cleanedSpans = spans.map((spanJSON) => {
				const { _segmentSpan, ...cleanSpanJSON } = spanJSON;
				return cleanSpanJSON;
			});
			const envelope$1 = envelope.createStreamedSpanEnvelope(cleanedSpans, dsc, this._client);
			debugBuild.DEBUG_BUILD && debugLogger.debug.log(`Sending span envelope for trace ${traceId} with ${cleanedSpans.length} spans`);
			this._client.sendEnvelope(envelope$1).then(null, (reason) => {
				debugBuild.DEBUG_BUILD && debugLogger.debug.error("Error while sending streamed span envelope:", reason);
			});
			this._removeTrace(traceId);
		}
		_removeTrace(traceId) {
			const bucket = this._traceBuckets.get(traceId);
			if (bucket) clearTimeout(bucket.timeout);
			this._traceBuckets.delete(traceId);
		}
	};
	exports.SpanBuffer = SpanBuffer;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/spanStreaming.js
var require_spanStreaming = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const debugBuild = require_debug_build();
	const integration = require_integration();
	const beforeSendSpan = require_beforeSendSpan();
	const captureSpan = require_captureSpan();
	const hasSpanStreamingEnabled = require_hasSpanStreamingEnabled();
	const spanBuffer = require_spanBuffer();
	const debugLogger = require_debug_logger();
	const spanUtils = require_spanUtils();
	exports.spanStreamingIntegration = integration.defineIntegration(() => {
		return {
			name: "SpanStreaming",
			setup(client) {
				const initialMessage = "SpanStreaming integration requires";
				const fallbackMsg = "Falling back to static trace lifecycle.";
				const clientOptions = client.getOptions();
				if (!hasSpanStreamingEnabled.hasSpanStreamingEnabled(client)) {
					clientOptions.traceLifecycle = "static";
					debugBuild.DEBUG_BUILD && debugLogger.debug.warn(`${initialMessage} \`traceLifecycle\` to be set to "stream"! ${fallbackMsg}`);
					return;
				}
				const beforeSendSpan$1 = clientOptions.beforeSendSpan;
				if (beforeSendSpan$1 && !beforeSendSpan.isStreamedBeforeSendSpanCallback(beforeSendSpan$1)) {
					clientOptions.traceLifecycle = "static";
					debugBuild.DEBUG_BUILD && debugLogger.debug.warn(`${initialMessage} a beforeSendSpan callback using \`withStreamedSpan\`! ${fallbackMsg}`);
					return;
				}
				const buffer = new spanBuffer.SpanBuffer(client);
				client.on("afterSpanEnd", (span) => {
					if (!spanUtils.spanIsSampled(span)) return;
					buffer.add(captureSpan.captureSpan(span, client));
				});
			}
		};
	});
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/breadcrumb-log-level.js
var require_breadcrumb_log_level = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	function getBreadcrumbLogLevelFromHttpStatusCode(statusCode) {
		if (statusCode === void 0) return;
		else if (statusCode >= 400 && statusCode < 500) return "warning";
		else if (statusCode >= 500) return "error";
		else return;
	}
	exports.getBreadcrumbLogLevelFromHttpStatusCode = getBreadcrumbLogLevelFromHttpStatusCode;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/error.js
var require_error = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	var SentryError = class extends Error {
		constructor(message, logLevel = "warn") {
			super(message);
			this.message = message;
			this.logLevel = logLevel;
		}
	};
	exports.SentryError = SentryError;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/supports.js
var require_supports = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const debugBuild = require_debug_build();
	const debugLogger = require_debug_logger();
	const WINDOW = require_worldwide().GLOBAL_OBJ;
	function supportsErrorEvent() {
		try {
			new ErrorEvent("");
			return true;
		} catch {
			return false;
		}
	}
	function supportsDOMError() {
		try {
			new DOMError("");
			return true;
		} catch {
			return false;
		}
	}
	function supportsDOMException() {
		try {
			new DOMException("");
			return true;
		} catch {
			return false;
		}
	}
	function supportsHistory() {
		return "history" in WINDOW && !!WINDOW.history;
	}
	const supportsFetch = _isFetchSupported;
	function _isFetchSupported() {
		if (!("fetch" in WINDOW)) return false;
		try {
			new Headers();
			new Request("data:,");
			new Response();
			return true;
		} catch {
			return false;
		}
	}
	function isNativeFunction(func) {
		return func && /^function\s+\w+\(\)\s+\{\s+\[native code\]\s+\}$/.test(func.toString());
	}
	function supportsNativeFetch() {
		if (typeof EdgeRuntime === "string") return true;
		if (!_isFetchSupported()) return false;
		if (isNativeFunction(WINDOW.fetch)) return true;
		let result = false;
		const doc = WINDOW.document;
		if (doc && typeof doc.createElement === "function") try {
			const sandbox = doc.createElement("iframe");
			sandbox.hidden = true;
			doc.head.appendChild(sandbox);
			if (sandbox.contentWindow?.fetch) result = isNativeFunction(sandbox.contentWindow.fetch);
			doc.head.removeChild(sandbox);
		} catch (err) {
			debugBuild.DEBUG_BUILD && debugLogger.debug.warn("Could not create sandbox iframe for pure fetch check, bailing to window.fetch: ", err);
		}
		return result;
	}
	function supportsReportingObserver() {
		return "ReportingObserver" in WINDOW;
	}
	function supportsReferrerPolicy() {
		if (!_isFetchSupported()) return false;
		try {
			new Request("_", { referrerPolicy: "origin" });
			return true;
		} catch {
			return false;
		}
	}
	exports.isNativeFunction = isNativeFunction;
	exports.supportsDOMError = supportsDOMError;
	exports.supportsDOMException = supportsDOMException;
	exports.supportsErrorEvent = supportsErrorEvent;
	exports.supportsFetch = supportsFetch;
	exports.supportsHistory = supportsHistory;
	exports.supportsNativeFetch = supportsNativeFetch;
	exports.supportsReferrerPolicy = supportsReferrerPolicy;
	exports.supportsReportingObserver = supportsReportingObserver;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/instrument/fetch.js
var require_fetch = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const currentScopes = require_currentScopes();
	const is = require_is();
	const object = require_object();
	const supports = require_supports();
	const time = require_time();
	const worldwide = require_worldwide();
	const handlers = require_handlers$1();
	function addFetchInstrumentationHandler(handler, skipNativeFetchCheck) {
		const type = "fetch";
		const removeHandler = handlers.addHandler(type, handler);
		handlers.maybeInstrument(type, () => instrumentFetch(void 0, skipNativeFetchCheck));
		return removeHandler;
	}
	function addFetchEndInstrumentationHandler(handler) {
		const type = "fetch-body-resolved";
		const removeHandler = handlers.addHandler(type, handler);
		handlers.maybeInstrument(type, () => instrumentFetch(streamHandler));
		return removeHandler;
	}
	function instrumentFetch(onFetchResolved, skipNativeFetchCheck = false) {
		if (skipNativeFetchCheck && !supports.supportsNativeFetch()) return;
		object.fill(worldwide.GLOBAL_OBJ, "fetch", function(originalFetch) {
			return function(...args) {
				const virtualError = /* @__PURE__ */ new Error();
				const { method, url } = parseFetchArgs(args);
				const handlerData = {
					args,
					fetchData: {
						method,
						url
					},
					startTimestamp: time.timestampInSeconds() * 1e3,
					virtualError,
					headers: getHeadersFromFetchArgs(args)
				};
				if (!onFetchResolved) handlers.triggerHandlers("fetch", { ...handlerData });
				return originalFetch.apply(worldwide.GLOBAL_OBJ, args).then(async (response) => {
					if (onFetchResolved) onFetchResolved(response);
					else handlers.triggerHandlers("fetch", {
						...handlerData,
						endTimestamp: time.timestampInSeconds() * 1e3,
						response
					});
					return response;
				}, (error) => {
					handlers.triggerHandlers("fetch", {
						...handlerData,
						endTimestamp: time.timestampInSeconds() * 1e3,
						error
					});
					if (is.isError(error) && error.stack === void 0) {
						error.stack = virtualError.stack;
						object.addNonEnumerableProperty(error, "framesToPop", 1);
					}
					const enhanceOption = currentScopes.getClient()?.getOptions().enhanceFetchErrorMessages ?? "always";
					if (enhanceOption !== false && error instanceof TypeError && (error.message === "Failed to fetch" || error.message === "Load failed" || error.message === "NetworkError when attempting to fetch resource.")) try {
						const hostname = new URL(handlerData.fetchData.url).host;
						if (enhanceOption === "always") error.message = `${error.message} (${hostname})`;
						else object.addNonEnumerableProperty(error, "__sentry_fetch_url_host__", hostname);
					} catch {}
					throw error;
				});
			};
		});
	}
	async function resolveResponse(res, onFinishedResolving) {
		if (res?.body) {
			const body = res.body;
			const responseReader = body.getReader();
			const maxFetchDurationTimeout = setTimeout(() => {
				body.cancel().then(null, () => {});
			}, 90 * 1e3);
			let readingActive = true;
			while (readingActive) {
				let chunkTimeout;
				try {
					chunkTimeout = setTimeout(() => {
						body.cancel().then(null, () => {});
					}, 5e3);
					const { done } = await responseReader.read();
					clearTimeout(chunkTimeout);
					if (done) {
						onFinishedResolving();
						readingActive = false;
					}
				} catch {
					readingActive = false;
				} finally {
					clearTimeout(chunkTimeout);
				}
			}
			clearTimeout(maxFetchDurationTimeout);
			responseReader.releaseLock();
			body.cancel().then(null, () => {});
		}
	}
	function streamHandler(response) {
		let clonedResponseForResolving;
		try {
			clonedResponseForResolving = response.clone();
		} catch {
			return;
		}
		resolveResponse(clonedResponseForResolving, () => {
			handlers.triggerHandlers("fetch-body-resolved", {
				endTimestamp: time.timestampInSeconds() * 1e3,
				response
			});
		});
	}
	function hasProp(obj, prop) {
		return !!obj && typeof obj === "object" && !!obj[prop];
	}
	function getUrlFromResource(resource) {
		if (typeof resource === "string") return resource;
		if (!resource) return "";
		if (hasProp(resource, "url")) return resource.url;
		if (resource.toString) return resource.toString();
		return "";
	}
	function parseFetchArgs(fetchArgs) {
		if (fetchArgs.length === 0) return {
			method: "GET",
			url: ""
		};
		if (fetchArgs.length === 2) {
			const [resource, options] = fetchArgs;
			return {
				url: getUrlFromResource(resource),
				method: hasProp(options, "method") ? String(options.method).toUpperCase() : is.isRequest(resource) && hasProp(resource, "method") ? String(resource.method).toUpperCase() : "GET"
			};
		}
		const arg = fetchArgs[0];
		return {
			url: getUrlFromResource(arg),
			method: hasProp(arg, "method") ? String(arg.method).toUpperCase() : "GET"
		};
	}
	function getHeadersFromFetchArgs(fetchArgs) {
		const [requestArgument, optionsArgument] = fetchArgs;
		try {
			if (typeof optionsArgument === "object" && optionsArgument !== null && "headers" in optionsArgument && optionsArgument.headers) return new Headers(optionsArgument.headers);
			if (is.isRequest(requestArgument)) return new Headers(requestArgument.headers);
		} catch {}
	}
	exports.addFetchEndInstrumentationHandler = addFetchEndInstrumentationHandler;
	exports.addFetchInstrumentationHandler = addFetchInstrumentationHandler;
	exports.parseFetchArgs = parseFetchArgs;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/exports.js
var require_exports = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	function replaceExports(exports$1, exportName, wrappedConstructor) {
		const original = exports$1[exportName];
		if (typeof original !== "function") return;
		try {
			exports$1[exportName] = wrappedConstructor;
		} catch {
			Object.defineProperty(exports$1, exportName, {
				value: wrappedConstructor,
				writable: true,
				configurable: true,
				enumerable: true
			});
		}
		if (exports$1.default === original) try {
			exports$1.default = wrappedConstructor;
		} catch {
			Object.defineProperty(exports$1, "default", {
				value: wrappedConstructor,
				writable: true,
				configurable: true,
				enumerable: true
			});
		}
	}
	exports.replaceExports = replaceExports;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/lru.js
var require_lru = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	var LRUMap = class {
		constructor(_maxSize) {
			this._maxSize = _maxSize;
			this._cache = /* @__PURE__ */ new Map();
		}
		/** Get the current size of the cache */
		get size() {
			return this._cache.size;
		}
		/** Get an entry or undefined if it was not in the cache. Re-inserts to update the recently used order */
		get(key) {
			const value = this._cache.get(key);
			if (value === void 0) return;
			this._cache.delete(key);
			this._cache.set(key, value);
			return value;
		}
		/** Insert an entry and evict an older entry if we've reached maxSize */
		set(key, value) {
			if (this._cache.size >= this._maxSize) {
				const nextKey = this._cache.keys().next().value;
				this._cache.delete(nextKey);
			}
			this._cache.set(key, value);
		}
		/** Remove an entry and return the entry if it was in the cache */
		remove(key) {
			const value = this._cache.get(key);
			if (value) this._cache.delete(key);
			return value;
		}
		/** Clear all entries */
		clear() {
			this._cache.clear();
		}
		/** Get all the keys */
		keys() {
			return Array.from(this._cache.keys());
		}
		/** Get all the values */
		values() {
			const values = [];
			this._cache.forEach((value) => values.push(value));
			return values;
		}
	};
	exports.LRUMap = LRUMap;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/vendor/escapeStringForRegex.js
var require_escapeStringForRegex = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	function escapeStringForRegex(regexString) {
		return regexString.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
	}
	exports.escapeStringForRegex = escapeStringForRegex;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/transports/userAgent.js
var require_userAgent = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	function addUserAgentToTransportHeaders(options) {
		const sdkMetadata = options._metadata?.sdk;
		const sdkUserAgent = sdkMetadata?.name && sdkMetadata?.version ? `${sdkMetadata?.name}/${sdkMetadata?.version}` : void 0;
		options.transportOptions = {
			...options.transportOptions,
			headers: {
				...sdkUserAgent && { "user-agent": sdkUserAgent },
				...options.transportOptions?.headers
			}
		};
	}
	exports.addUserAgentToTransportHeaders = addUserAgentToTransportHeaders;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/server-runtime-client.js
var require_server_runtime_client = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const checkin = require_checkin();
	const client = require_client();
	const currentScopes = require_currentScopes();
	const debugBuild = require_debug_build();
	const base = require_base();
	const userAgent = require_userAgent();
	const debugLogger = require_debug_logger();
	const eventbuilder = require_eventbuilder();
	const misc = require_misc();
	const promisebuffer = require_promisebuffer();
	const syncpromise = require_syncpromise();
	const traceInfo = require_trace_info();
	var ServerRuntimeClient = class extends client.Client {
		/**
		* Creates a new Edge SDK instance.
		* @param options Configuration options for this SDK.
		*/
		constructor(options) {
			userAgent.addUserAgentToTransportHeaders(options);
			super(options);
			this._disposeCallbacks = [];
			this._setUpMetricsProcessing();
		}
		/**
		* @inheritDoc
		*/
		eventFromException(exception, hint) {
			const event = eventbuilder.eventFromUnknownInput(this, this._options.stackParser, exception, hint);
			event.level = "error";
			return syncpromise.resolvedSyncPromise(event);
		}
		/**
		* @inheritDoc
		*/
		eventFromMessage(message, level = "info", hint) {
			return syncpromise.resolvedSyncPromise(eventbuilder.eventFromMessage(this._options.stackParser, message, level, hint, this._options.attachStacktrace));
		}
		/**
		* @inheritDoc
		*/
		captureException(exception, hint, scope) {
			setCurrentRequestSessionErroredOrCrashed(hint);
			return super.captureException(exception, hint, scope);
		}
		/**
		* @inheritDoc
		*/
		captureEvent(event, hint, scope) {
			if (!event.type && event.exception?.values && event.exception.values.length > 0) setCurrentRequestSessionErroredOrCrashed(hint);
			return super.captureEvent(event, hint, scope);
		}
		/**
		* Create a cron monitor check in and send it to Sentry.
		*
		* @param checkIn An object that describes a check in.
		* @param upsertMonitorConfig An optional object that describes a monitor config. Use this if you want
		* to create a monitor automatically when sending a check in.
		*/
		captureCheckIn(checkIn, monitorConfig, scope) {
			const id = "checkInId" in checkIn && checkIn.checkInId ? checkIn.checkInId : misc.uuid4();
			if (!this._isEnabled()) {
				debugBuild.DEBUG_BUILD && debugLogger.debug.warn("SDK not enabled, will not capture check-in.");
				return id;
			}
			const { release, environment, tunnel } = this.getOptions();
			const serializedCheckIn = {
				check_in_id: id,
				monitor_slug: checkIn.monitorSlug,
				status: checkIn.status,
				release,
				environment
			};
			if ("duration" in checkIn) serializedCheckIn.duration = checkIn.duration;
			if (monitorConfig) serializedCheckIn.monitor_config = {
				schedule: monitorConfig.schedule,
				checkin_margin: monitorConfig.checkinMargin,
				max_runtime: monitorConfig.maxRuntime,
				timezone: monitorConfig.timezone,
				failure_issue_threshold: monitorConfig.failureIssueThreshold,
				recovery_threshold: monitorConfig.recoveryThreshold
			};
			const [dynamicSamplingContext, traceContext] = traceInfo._getTraceInfoFromScope(this, scope);
			if (traceContext) serializedCheckIn.contexts = { trace: traceContext };
			const envelope = checkin.createCheckInEnvelope(serializedCheckIn, dynamicSamplingContext, this.getSdkMetadata(), tunnel, this.getDsn());
			debugBuild.DEBUG_BUILD && debugLogger.debug.log("Sending checkin:", checkIn.monitorSlug, checkIn.status);
			this.sendEnvelope(envelope);
			return id;
		}
		/**
		* @inheritDoc
		*/
		registerCleanup(callback) {
			this._disposeCallbacks.push(callback);
		}
		/**
		* Disposes of the client and releases all resources.
		*
		* This method clears all internal state to allow the client to be garbage collected.
		* It clears hooks, event processors, integrations, transport, and other internal references.
		*
		* Call this method after flushing to allow the client to be garbage collected.
		* After calling dispose(), the client should not be used anymore.
		*
		* Subclasses should override this method to clean up their own resources and call `super.dispose()`.
		*/
		dispose() {
			debugBuild.DEBUG_BUILD && debugLogger.debug.log("Disposing client...");
			for (const callback of this._disposeCallbacks) try {
				callback();
			} catch {}
			this._disposeCallbacks.length = 0;
			for (const hookName of Object.keys(this._hooks)) this._hooks[hookName]?.clear();
			this._hooks = {};
			this._eventProcessors.length = 0;
			this._integrations = {};
			this._outcomes = {};
			this._transport = void 0;
			this._promiseBuffer = promisebuffer.makePromiseBuffer(base.DEFAULT_TRANSPORT_BUFFER_SIZE);
		}
		/**
		* @inheritDoc
		*/
		_prepareEvent(event, hint, currentScope, isolationScope) {
			if (this._options.platform) event.platform = event.platform || this._options.platform;
			if (this._options.runtime) event.contexts = {
				...event.contexts,
				runtime: event.contexts?.runtime || this._options.runtime
			};
			if (this._options.serverName) event.server_name = event.server_name || this._options.serverName;
			return super._prepareEvent(event, hint, currentScope, isolationScope);
		}
		/**
		* Process a server-side metric before it is captured.
		*/
		_setUpMetricsProcessing() {
			this.on("processMetric", (metric) => {
				if (this._options.serverName) metric.attributes = {
					"server.address": this._options.serverName,
					...metric.attributes
				};
			});
		}
	};
	function setCurrentRequestSessionErroredOrCrashed(eventHint) {
		const requestSession = currentScopes.getIsolationScope().getScopeData().sdkProcessingMetadata.requestSession;
		if (requestSession) {
			const isHandledException = eventHint?.mechanism?.handled ?? true;
			if (isHandledException && requestSession.status !== "crashed") requestSession.status = "errored";
			else if (!isHandledException) requestSession.status = "crashed";
		}
	}
	exports.ServerRuntimeClient = ServerRuntimeClient;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/trpc.js
var require_trpc = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const currentScopes = require_currentScopes();
	const exports$1 = require_exports$1();
	const semanticAttributes = require_semanticAttributes();
	const normalize = require_normalize();
	const trace = require_trace();
	const normalizationHints = require_normalizationHints();
	const trpcCaptureContext = { mechanism: {
		handled: false,
		type: "auto.rpc.trpc.middleware"
	} };
	function captureIfError(nextResult) {
		if (typeof nextResult === "object" && nextResult !== null && "ok" in nextResult && !nextResult.ok && "error" in nextResult) exports$1.captureException(nextResult.error, trpcCaptureContext);
	}
	function trpcMiddleware(options = {}) {
		return async function(opts) {
			const { path, type, next, rawInput, getRawInput } = opts;
			const client = currentScopes.getClient();
			const clientOptions = client?.getOptions();
			const dataCollection = client?.getDataCollectionOptions();
			const trpcContext = {
				procedure_path: path,
				procedure_type: type
			};
			normalizationHints.setNormalizationDepthOverrideHint(trpcContext, 1 + (clientOptions?.normalizeDepth ?? 5));
			if (options.attachRpcInput !== void 0 ? options.attachRpcInput : dataCollection?.httpBodies.includes("incomingRequest")) {
				if (rawInput !== void 0) trpcContext.input = normalize.normalize(rawInput);
				if (getRawInput !== void 0 && typeof getRawInput === "function") try {
					const rawRes = await getRawInput();
					trpcContext.input = normalize.normalize(rawRes);
				} catch {}
			}
			return currentScopes.withIsolationScope((scope) => {
				scope.setContext("trpc", trpcContext);
				return trace.startSpanManual({
					name: `trpc/${path}`,
					op: "rpc.server",
					attributes: {
						[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: "route",
						[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.rpc.trpc"
					},
					forceTransaction: !!options.forceTransaction
				}, async (span) => {
					try {
						const nextResult = await next();
						captureIfError(nextResult);
						span.end();
						return nextResult;
					} catch (e) {
						exports$1.captureException(e, trpcCaptureContext);
						span.end();
						throw e;
					}
				});
			});
		};
	}
	exports.trpcMiddleware = trpcMiddleware;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/mcp-server/errorCapture.js
var require_errorCapture = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const currentScopes = require_currentScopes();
	const exports$1 = require_exports$1();
	const spanUtils = require_spanUtils();
	const spanstatus = require_spanstatus();
	function captureError(error, errorType, extraData) {
		try {
			if (!currentScopes.getClient()) return;
			const activeSpan = spanUtils.getActiveSpan();
			if (activeSpan?.isRecording()) activeSpan.setStatus({
				code: spanstatus.SPAN_STATUS_ERROR,
				message: "internal_error"
			});
			exports$1.captureException(error, { mechanism: {
				type: "auto.ai.mcp_server",
				handled: false,
				data: {
					error_type: errorType || "handler_execution",
					...extraData
				}
			} });
		} catch {}
	}
	exports.captureError = captureError;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/mcp-server/handlers.js
var require_handlers = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const debugBuild = require_debug_build();
	const debugLogger = require_debug_logger();
	const object = require_object();
	const errorCapture = require_errorCapture();
	function wrapMethodHandler(serverInstance, methodName) {
		object.fill(serverInstance, methodName, (originalMethod) => {
			return function(name, ...args) {
				const handler = args[args.length - 1];
				if (typeof handler !== "function") return originalMethod.call(this, name, ...args);
				const wrappedHandler = createWrappedHandler(handler, methodName, name);
				return originalMethod.call(this, name, ...args.slice(0, -1), wrappedHandler);
			};
		});
	}
	function createWrappedHandler(originalHandler, methodName, handlerName) {
		return function(...handlerArgs) {
			try {
				return createErrorCapturingHandler.call(this, originalHandler, methodName, handlerName, handlerArgs);
			} catch (error) {
				debugBuild.DEBUG_BUILD && debugLogger.debug.warn("MCP handler wrapping failed:", error);
				return originalHandler.apply(this, handlerArgs);
			}
		};
	}
	function createErrorCapturingHandler(originalHandler, methodName, handlerName, handlerArgs) {
		try {
			const result = originalHandler.apply(this, handlerArgs);
			if (result && typeof result === "object" && typeof result.then === "function") return Promise.resolve(result).catch((error) => {
				captureHandlerError(error, methodName, handlerName);
				throw error;
			});
			return result;
		} catch (error) {
			captureHandlerError(error, methodName, handlerName);
			throw error;
		}
	}
	function captureHandlerError(error, methodName, handlerName) {
		try {
			const extraData = {};
			if (methodName === "tool" || methodName === "registerTool") {
				extraData.tool_name = handlerName;
				if (error.name === "ProtocolValidationError" || error.message.includes("validation") || error.message.includes("protocol")) errorCapture.captureError(error, "validation", extraData);
				else if (error.name === "ServerTimeoutError" || error.message.includes("timed out") || error.message.includes("timeout")) errorCapture.captureError(error, "timeout", extraData);
				else errorCapture.captureError(error, "tool_execution", extraData);
			} else if (methodName === "resource" || methodName === "registerResource") {
				extraData.resource_uri = handlerName;
				errorCapture.captureError(error, "resource_execution", extraData);
			} else if (methodName === "prompt" || methodName === "registerPrompt") {
				extraData.prompt_name = handlerName;
				errorCapture.captureError(error, "prompt_execution", extraData);
			}
		} catch (_captureErr) {}
	}
	function wrapToolHandlers(serverInstance) {
		if (typeof serverInstance.tool === "function") wrapMethodHandler(serverInstance, "tool");
		if (typeof serverInstance.registerTool === "function") wrapMethodHandler(serverInstance, "registerTool");
	}
	function wrapResourceHandlers(serverInstance) {
		if (typeof serverInstance.resource === "function") wrapMethodHandler(serverInstance, "resource");
		if (typeof serverInstance.registerResource === "function") wrapMethodHandler(serverInstance, "registerResource");
	}
	function wrapPromptHandlers(serverInstance) {
		if (typeof serverInstance.prompt === "function") wrapMethodHandler(serverInstance, "prompt");
		if (typeof serverInstance.registerPrompt === "function") wrapMethodHandler(serverInstance, "registerPrompt");
	}
	function wrapAllMCPHandlers(serverInstance) {
		wrapToolHandlers(serverInstance);
		wrapResourceHandlers(serverInstance);
		wrapPromptHandlers(serverInstance);
	}
	function wrapExistingHandlers(serverInstance) {
		const server = serverInstance;
		const registeredTools = server["_registeredTools"];
		if (registeredTools && typeof registeredTools === "object") {
			for (const [name, tool] of Object.entries(registeredTools)) if (typeof tool["executor"] === "function") tool["executor"] = createWrappedHandler(tool["executor"], "registerTool", name);
		}
		const registeredResources = server["_registeredResources"];
		if (registeredResources && typeof registeredResources === "object") {
			for (const [name, resource] of Object.entries(registeredResources)) if (typeof resource["readCallback"] === "function") resource["readCallback"] = createWrappedHandler(resource["readCallback"], "registerResource", name);
		}
		const registeredResourceTemplates = server["_registeredResourceTemplates"];
		if (registeredResourceTemplates && typeof registeredResourceTemplates === "object") {
			for (const [name, template] of Object.entries(registeredResourceTemplates)) if (typeof template["readCallback"] === "function") template["readCallback"] = createWrappedHandler(template["readCallback"], "registerResource", name);
		}
		const registeredPrompts = server["_registeredPrompts"];
		if (registeredPrompts && typeof registeredPrompts === "object") {
			for (const [name, prompt] of Object.entries(registeredPrompts)) if (typeof prompt["handler"] === "function") prompt["handler"] = createWrappedHandler(prompt["handler"], "registerPrompt", name);
		}
	}
	exports.wrapAllMCPHandlers = wrapAllMCPHandlers;
	exports.wrapExistingHandlers = wrapExistingHandlers;
	exports.wrapPromptHandlers = wrapPromptHandlers;
	exports.wrapResourceHandlers = wrapResourceHandlers;
	exports.wrapToolHandlers = wrapToolHandlers;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/mcp-server/attributes.js
var require_attributes = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const MCP_METHOD_NAME_ATTRIBUTE = "mcp.method.name";
	const MCP_REQUEST_ID_ATTRIBUTE = "mcp.request.id";
	const MCP_SESSION_ID_ATTRIBUTE = "mcp.session.id";
	const MCP_TRANSPORT_ATTRIBUTE = "mcp.transport";
	const MCP_SERVER_NAME_ATTRIBUTE = "mcp.server.name";
	const MCP_SERVER_TITLE_ATTRIBUTE = "mcp.server.title";
	const MCP_SERVER_VERSION_ATTRIBUTE = "mcp.server.version";
	const MCP_PROTOCOL_VERSION_ATTRIBUTE = "mcp.protocol.version";
	const MCP_TOOL_NAME_ATTRIBUTE = "mcp.tool.name";
	const MCP_RESOURCE_URI_ATTRIBUTE = "mcp.resource.uri";
	const MCP_PROMPT_NAME_ATTRIBUTE = "mcp.prompt.name";
	const MCP_TOOL_RESULT_IS_ERROR_ATTRIBUTE = "mcp.tool.result.is_error";
	const MCP_TOOL_RESULT_CONTENT_COUNT_ATTRIBUTE = "mcp.tool.result.content_count";
	const MCP_PROMPT_RESULT_DESCRIPTION_ATTRIBUTE = "mcp.prompt.result.description";
	const MCP_PROMPT_RESULT_MESSAGE_COUNT_ATTRIBUTE = "mcp.prompt.result.message_count";
	const MCP_REQUEST_ARGUMENT = "mcp.request.argument";
	const MCP_LOGGING_LEVEL_ATTRIBUTE = "mcp.logging.level";
	const MCP_LOGGING_LOGGER_ATTRIBUTE = "mcp.logging.logger";
	const MCP_LOGGING_DATA_TYPE_ATTRIBUTE = "mcp.logging.data_type";
	const MCP_LOGGING_MESSAGE_ATTRIBUTE = "mcp.logging.message";
	const NETWORK_TRANSPORT_ATTRIBUTE = "network.transport";
	const NETWORK_PROTOCOL_VERSION_ATTRIBUTE = "network.protocol.version";
	const CLIENT_ADDRESS_ATTRIBUTE = "client.address";
	const CLIENT_PORT_ATTRIBUTE = "client.port";
	const MCP_SERVER_OP_VALUE = "mcp.server";
	const MCP_NOTIFICATION_CLIENT_TO_SERVER_OP_VALUE = "mcp.notification.client_to_server";
	const MCP_NOTIFICATION_SERVER_TO_CLIENT_OP_VALUE = "mcp.notification.server_to_client";
	const MCP_FUNCTION_ORIGIN_VALUE = "auto.function.mcp_server";
	const MCP_NOTIFICATION_ORIGIN_VALUE = "auto.mcp.notification";
	const MCP_ROUTE_SOURCE_VALUE = "route";
	exports.CLIENT_ADDRESS_ATTRIBUTE = CLIENT_ADDRESS_ATTRIBUTE;
	exports.CLIENT_PORT_ATTRIBUTE = CLIENT_PORT_ATTRIBUTE;
	exports.MCP_FUNCTION_ORIGIN_VALUE = MCP_FUNCTION_ORIGIN_VALUE;
	exports.MCP_LOGGING_DATA_TYPE_ATTRIBUTE = MCP_LOGGING_DATA_TYPE_ATTRIBUTE;
	exports.MCP_LOGGING_LEVEL_ATTRIBUTE = MCP_LOGGING_LEVEL_ATTRIBUTE;
	exports.MCP_LOGGING_LOGGER_ATTRIBUTE = MCP_LOGGING_LOGGER_ATTRIBUTE;
	exports.MCP_LOGGING_MESSAGE_ATTRIBUTE = MCP_LOGGING_MESSAGE_ATTRIBUTE;
	exports.MCP_METHOD_NAME_ATTRIBUTE = MCP_METHOD_NAME_ATTRIBUTE;
	exports.MCP_NOTIFICATION_CLIENT_TO_SERVER_OP_VALUE = MCP_NOTIFICATION_CLIENT_TO_SERVER_OP_VALUE;
	exports.MCP_NOTIFICATION_ORIGIN_VALUE = MCP_NOTIFICATION_ORIGIN_VALUE;
	exports.MCP_NOTIFICATION_SERVER_TO_CLIENT_OP_VALUE = MCP_NOTIFICATION_SERVER_TO_CLIENT_OP_VALUE;
	exports.MCP_PROMPT_NAME_ATTRIBUTE = MCP_PROMPT_NAME_ATTRIBUTE;
	exports.MCP_PROMPT_RESULT_DESCRIPTION_ATTRIBUTE = MCP_PROMPT_RESULT_DESCRIPTION_ATTRIBUTE;
	exports.MCP_PROMPT_RESULT_MESSAGE_COUNT_ATTRIBUTE = MCP_PROMPT_RESULT_MESSAGE_COUNT_ATTRIBUTE;
	exports.MCP_PROTOCOL_VERSION_ATTRIBUTE = MCP_PROTOCOL_VERSION_ATTRIBUTE;
	exports.MCP_REQUEST_ARGUMENT = MCP_REQUEST_ARGUMENT;
	exports.MCP_REQUEST_ID_ATTRIBUTE = MCP_REQUEST_ID_ATTRIBUTE;
	exports.MCP_RESOURCE_URI_ATTRIBUTE = MCP_RESOURCE_URI_ATTRIBUTE;
	exports.MCP_ROUTE_SOURCE_VALUE = MCP_ROUTE_SOURCE_VALUE;
	exports.MCP_SERVER_NAME_ATTRIBUTE = MCP_SERVER_NAME_ATTRIBUTE;
	exports.MCP_SERVER_OP_VALUE = MCP_SERVER_OP_VALUE;
	exports.MCP_SERVER_TITLE_ATTRIBUTE = MCP_SERVER_TITLE_ATTRIBUTE;
	exports.MCP_SERVER_VERSION_ATTRIBUTE = MCP_SERVER_VERSION_ATTRIBUTE;
	exports.MCP_SESSION_ID_ATTRIBUTE = MCP_SESSION_ID_ATTRIBUTE;
	exports.MCP_TOOL_NAME_ATTRIBUTE = MCP_TOOL_NAME_ATTRIBUTE;
	exports.MCP_TOOL_RESULT_CONTENT_COUNT_ATTRIBUTE = MCP_TOOL_RESULT_CONTENT_COUNT_ATTRIBUTE;
	exports.MCP_TOOL_RESULT_IS_ERROR_ATTRIBUTE = MCP_TOOL_RESULT_IS_ERROR_ATTRIBUTE;
	exports.MCP_TRANSPORT_ATTRIBUTE = MCP_TRANSPORT_ATTRIBUTE;
	exports.NETWORK_PROTOCOL_VERSION_ATTRIBUTE = NETWORK_PROTOCOL_VERSION_ATTRIBUTE;
	exports.NETWORK_TRANSPORT_ATTRIBUTE = NETWORK_TRANSPORT_ATTRIBUTE;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/mcp-server/validation.js
var require_validation = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const debugBuild = require_debug_build();
	const debugLogger = require_debug_logger();
	function isJsonRpcRequest(message) {
		return typeof message === "object" && message !== null && "jsonrpc" in message && message.jsonrpc === "2.0" && "method" in message && "id" in message;
	}
	function isJsonRpcNotification(message) {
		return typeof message === "object" && message !== null && "jsonrpc" in message && message.jsonrpc === "2.0" && "method" in message && !("id" in message);
	}
	function isJsonRpcResponse(message) {
		return typeof message === "object" && message !== null && "jsonrpc" in message && message.jsonrpc === "2.0" && "id" in message && ("result" in message || "error" in message);
	}
	function validateMcpServerInstance(instance) {
		if (typeof instance === "object" && instance !== null && "connect" in instance && ("tool" in instance && "resource" in instance && "prompt" in instance || "registerTool" in instance && "registerResource" in instance && "registerPrompt" in instance)) return true;
		debugBuild.DEBUG_BUILD && debugLogger.debug.warn("Did not patch MCP server. Interface is incompatible.");
		return false;
	}
	function isValidContentItem(item) {
		return item != null && typeof item === "object";
	}
	exports.isJsonRpcNotification = isJsonRpcNotification;
	exports.isJsonRpcRequest = isJsonRpcRequest;
	exports.isJsonRpcResponse = isJsonRpcResponse;
	exports.isValidContentItem = isValidContentItem;
	exports.validateMcpServerInstance = validateMcpServerInstance;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/mcp-server/resultExtraction.js
var require_resultExtraction = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const attributes = require_attributes();
	const validation = require_validation();
	function buildAllContentItemAttributes(content, includeContent) {
		const attributes$1 = { [attributes.MCP_TOOL_RESULT_CONTENT_COUNT_ATTRIBUTE]: content.length };
		for (const [i, item] of content.entries()) {
			if (!validation.isValidContentItem(item)) continue;
			const prefix = content.length === 1 ? "mcp.tool.result" : `mcp.tool.result.${i}`;
			if (typeof item.type === "string") attributes$1[`${prefix}.content_type`] = item.type;
			if (includeContent) {
				const safeSet = (key, value) => {
					if (typeof value === "string") attributes$1[`${prefix}.${key}`] = value;
				};
				safeSet("mime_type", item.mimeType);
				safeSet("uri", item.uri);
				safeSet("name", item.name);
				if (typeof item.text === "string") attributes$1[`${prefix}.content`] = item.text;
				if (typeof item.data === "string") attributes$1[`${prefix}.data_size`] = item.data.length;
				const resource = item.resource;
				if (validation.isValidContentItem(resource)) {
					safeSet("resource_uri", resource.uri);
					safeSet("resource_mime_type", resource.mimeType);
				}
			}
		}
		return attributes$1;
	}
	function extractToolResultAttributes(result, recordOutputs) {
		if (!validation.isValidContentItem(result)) return {};
		const attributes$1 = Array.isArray(result.content) ? buildAllContentItemAttributes(result.content, recordOutputs) : {};
		if (typeof result.isError === "boolean") attributes$1[attributes.MCP_TOOL_RESULT_IS_ERROR_ATTRIBUTE] = result.isError;
		return attributes$1;
	}
	function extractPromptResultAttributes(result, recordOutputs) {
		const attributes$1 = {};
		if (!validation.isValidContentItem(result)) return attributes$1;
		if (recordOutputs && typeof result.description === "string") attributes$1[attributes.MCP_PROMPT_RESULT_DESCRIPTION_ATTRIBUTE] = result.description;
		if (Array.isArray(result.messages)) {
			attributes$1[attributes.MCP_PROMPT_RESULT_MESSAGE_COUNT_ATTRIBUTE] = result.messages.length;
			if (recordOutputs) {
				const messages = result.messages;
				for (const [i, message] of messages.entries()) {
					if (!validation.isValidContentItem(message)) continue;
					const prefix = messages.length === 1 ? "mcp.prompt.result" : `mcp.prompt.result.${i}`;
					const safeSet = (key, value) => {
						if (typeof value === "string") {
							const attrName = messages.length === 1 ? `${prefix}.message_${key}` : `${prefix}.${key}`;
							attributes$1[attrName] = value;
						}
					};
					safeSet("role", message.role);
					if (validation.isValidContentItem(message.content)) {
						const content = message.content;
						if (typeof content.text === "string") {
							const attrName = messages.length === 1 ? `${prefix}.message_content` : `${prefix}.content`;
							attributes$1[attrName] = content.text;
						}
					}
				}
			}
		}
		return attributes$1;
	}
	exports.extractPromptResultAttributes = extractPromptResultAttributes;
	exports.extractToolResultAttributes = extractToolResultAttributes;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/mcp-server/sessionManagement.js
var require_sessionManagement = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const sessionToSessionData = /* @__PURE__ */ new Map();
	const statelessSessionData = /* @__PURE__ */ new WeakMap();
	function getSessionData(transport) {
		const sessionId = transport.sessionId;
		if (sessionId) return sessionToSessionData.get(sessionId);
		return statelessSessionData.get(transport);
	}
	function setSessionData(transport, data) {
		const sessionId = transport.sessionId;
		if (sessionId) sessionToSessionData.set(sessionId, data);
		else statelessSessionData.set(transport, data);
	}
	function storeSessionDataForTransport(transport, sessionData) {
		setSessionData(transport, sessionData);
	}
	function updateSessionDataForTransport(transport, partialSessionData) {
		setSessionData(transport, {
			...getSessionData(transport) || {},
			...partialSessionData
		});
	}
	function getClientInfoForTransport(transport) {
		return getSessionData(transport)?.clientInfo;
	}
	function getProtocolVersionForTransport(transport) {
		return getSessionData(transport)?.protocolVersion;
	}
	function getSessionDataForTransport(transport) {
		return getSessionData(transport);
	}
	function cleanupSessionDataForTransport(transport) {
		const sessionId = transport.sessionId;
		if (sessionId) sessionToSessionData.delete(sessionId);
	}
	exports.cleanupSessionDataForTransport = cleanupSessionDataForTransport;
	exports.getClientInfoForTransport = getClientInfoForTransport;
	exports.getProtocolVersionForTransport = getProtocolVersionForTransport;
	exports.getSessionDataForTransport = getSessionDataForTransport;
	exports.storeSessionDataForTransport = storeSessionDataForTransport;
	exports.updateSessionDataForTransport = updateSessionDataForTransport;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/mcp-server/sessionExtraction.js
var require_sessionExtraction = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const attributes = require_attributes();
	const sessionManagement = require_sessionManagement();
	const validation = require_validation();
	function extractPartyInfo(obj) {
		const partyInfo = {};
		if (validation.isValidContentItem(obj)) {
			if (typeof obj.name === "string") partyInfo.name = obj.name;
			if (typeof obj.title === "string") partyInfo.title = obj.title;
			if (typeof obj.version === "string") partyInfo.version = obj.version;
		}
		return partyInfo;
	}
	function extractSessionDataFromInitializeRequest(request) {
		const sessionData = {};
		if (validation.isValidContentItem(request.params)) {
			if (typeof request.params.protocolVersion === "string") sessionData.protocolVersion = request.params.protocolVersion;
			if (request.params.clientInfo) sessionData.clientInfo = extractPartyInfo(request.params.clientInfo);
		}
		return sessionData;
	}
	function extractSessionDataFromInitializeResponse(result) {
		const sessionData = {};
		if (validation.isValidContentItem(result)) {
			if (typeof result.protocolVersion === "string") sessionData.protocolVersion = result.protocolVersion;
			if (result.serverInfo) sessionData.serverInfo = extractPartyInfo(result.serverInfo);
		}
		return sessionData;
	}
	function getClientAttributes(transport) {
		const clientInfo = sessionManagement.getClientInfoForTransport(transport);
		const attributes = {};
		if (clientInfo?.name) attributes["mcp.client.name"] = clientInfo.name;
		if (clientInfo?.title) attributes["mcp.client.title"] = clientInfo.title;
		if (clientInfo?.version) attributes["mcp.client.version"] = clientInfo.version;
		return attributes;
	}
	function buildClientAttributesFromInfo(clientInfo) {
		const attributes = {};
		if (clientInfo?.name) attributes["mcp.client.name"] = clientInfo.name;
		if (clientInfo?.title) attributes["mcp.client.title"] = clientInfo.title;
		if (clientInfo?.version) attributes["mcp.client.version"] = clientInfo.version;
		return attributes;
	}
	function getServerAttributes(transport) {
		const serverInfo = sessionManagement.getSessionDataForTransport(transport)?.serverInfo;
		const attributes$1 = {};
		if (serverInfo?.name) attributes$1[attributes.MCP_SERVER_NAME_ATTRIBUTE] = serverInfo.name;
		if (serverInfo?.title) attributes$1[attributes.MCP_SERVER_TITLE_ATTRIBUTE] = serverInfo.title;
		if (serverInfo?.version) attributes$1[attributes.MCP_SERVER_VERSION_ATTRIBUTE] = serverInfo.version;
		return attributes$1;
	}
	function buildServerAttributesFromInfo(serverInfo) {
		const attributes$1 = {};
		if (serverInfo?.name) attributes$1[attributes.MCP_SERVER_NAME_ATTRIBUTE] = serverInfo.name;
		if (serverInfo?.title) attributes$1[attributes.MCP_SERVER_TITLE_ATTRIBUTE] = serverInfo.title;
		if (serverInfo?.version) attributes$1[attributes.MCP_SERVER_VERSION_ATTRIBUTE] = serverInfo.version;
		return attributes$1;
	}
	function extractClientInfo(extra) {
		return {
			address: extra?.requestInfo?.remoteAddress || extra?.clientAddress || extra?.request?.ip || extra?.request?.connection?.remoteAddress,
			port: extra?.requestInfo?.remotePort || extra?.clientPort || extra?.request?.connection?.remotePort
		};
	}
	function getTransportTypes(transport) {
		if (!transport?.constructor) return {
			mcpTransport: "unknown",
			networkTransport: "unknown"
		};
		const transportName = typeof transport.constructor?.name === "string" ? transport.constructor.name : "unknown";
		let networkTransport = "unknown";
		const lowerTransportName = transportName.toLowerCase();
		if (lowerTransportName.includes("stdio")) networkTransport = "pipe";
		else if (lowerTransportName.includes("http") || lowerTransportName.includes("sse")) networkTransport = "tcp";
		return {
			mcpTransport: transportName,
			networkTransport
		};
	}
	function buildTransportAttributes(transport, extra) {
		const sessionId = transport && "sessionId" in transport ? transport.sessionId : void 0;
		const clientInfo = extra ? extractClientInfo(extra) : {};
		const { mcpTransport, networkTransport } = getTransportTypes(transport);
		const clientAttributes = getClientAttributes(transport);
		const serverAttributes = getServerAttributes(transport);
		const protocolVersion = sessionManagement.getProtocolVersionForTransport(transport);
		return {
			...sessionId && { [attributes.MCP_SESSION_ID_ATTRIBUTE]: sessionId },
			...clientInfo.address && { [attributes.CLIENT_ADDRESS_ATTRIBUTE]: clientInfo.address },
			...clientInfo.port && { [attributes.CLIENT_PORT_ATTRIBUTE]: clientInfo.port },
			[attributes.MCP_TRANSPORT_ATTRIBUTE]: mcpTransport,
			[attributes.NETWORK_TRANSPORT_ATTRIBUTE]: networkTransport,
			[attributes.NETWORK_PROTOCOL_VERSION_ATTRIBUTE]: "2.0",
			...protocolVersion && { [attributes.MCP_PROTOCOL_VERSION_ATTRIBUTE]: protocolVersion },
			...clientAttributes,
			...serverAttributes
		};
	}
	exports.buildClientAttributesFromInfo = buildClientAttributesFromInfo;
	exports.buildServerAttributesFromInfo = buildServerAttributesFromInfo;
	exports.buildTransportAttributes = buildTransportAttributes;
	exports.extractClientInfo = extractClientInfo;
	exports.extractSessionDataFromInitializeRequest = extractSessionDataFromInitializeRequest;
	exports.extractSessionDataFromInitializeResponse = extractSessionDataFromInitializeResponse;
	exports.getClientAttributes = getClientAttributes;
	exports.getServerAttributes = getServerAttributes;
	exports.getTransportTypes = getTransportTypes;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/mcp-server/correlation.js
var require_correlation = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const spanstatus = require_spanstatus();
	const attributes = require_attributes();
	const resultExtraction = require_resultExtraction();
	const sessionExtraction = require_sessionExtraction();
	const sessionToSpanMap = /* @__PURE__ */ new Map();
	const statelessSpanMap = /* @__PURE__ */ new WeakMap();
	function getOrCreateSpanMap(transport) {
		const sessionId = transport.sessionId;
		if (sessionId) {
			let spanMap2 = sessionToSpanMap.get(sessionId);
			if (!spanMap2) {
				spanMap2 = /* @__PURE__ */ new Map();
				sessionToSpanMap.set(sessionId, spanMap2);
			}
			return spanMap2;
		}
		let spanMap = statelessSpanMap.get(transport);
		if (!spanMap) {
			spanMap = /* @__PURE__ */ new Map();
			statelessSpanMap.set(transport, spanMap);
		}
		return spanMap;
	}
	function storeSpanForRequest(transport, requestId, span, method) {
		getOrCreateSpanMap(transport).set(requestId, {
			span,
			method,
			startTime: Date.now()
		});
	}
	function completeSpanWithResults(transport, requestId, result, options, hasError = false) {
		const spanMap = getOrCreateSpanMap(transport);
		const spanData = spanMap.get(requestId);
		if (spanData) {
			const { span, method } = spanData;
			if (hasError) span.setStatus({
				code: spanstatus.SPAN_STATUS_ERROR,
				message: "internal_error"
			});
			else if (method === "initialize") {
				const sessionData = sessionExtraction.extractSessionDataFromInitializeResponse(result);
				const initAttributes = { ...sessionExtraction.buildServerAttributesFromInfo(sessionData.serverInfo) };
				if (sessionData.protocolVersion) initAttributes[attributes.MCP_PROTOCOL_VERSION_ATTRIBUTE] = sessionData.protocolVersion;
				span.setAttributes(initAttributes);
			} else if (method === "tools/call") {
				const toolAttributes = resultExtraction.extractToolResultAttributes(result, options.recordOutputs);
				span.setAttributes(toolAttributes);
			} else if (method === "prompts/get") {
				const promptAttributes = resultExtraction.extractPromptResultAttributes(result, options.recordOutputs);
				span.setAttributes(promptAttributes);
			}
			span.end();
			spanMap.delete(requestId);
		}
	}
	function cleanupPendingSpansForTransport(transport) {
		const sessionId = transport.sessionId;
		if (sessionId) {
			const spanMap2 = sessionToSpanMap.get(sessionId);
			if (spanMap2) {
				for (const [, spanData] of spanMap2) {
					spanData.span.setStatus({
						code: spanstatus.SPAN_STATUS_ERROR,
						message: "cancelled"
					});
					spanData.span.end();
				}
				sessionToSpanMap.delete(sessionId);
			}
			return;
		}
		const spanMap = statelessSpanMap.get(transport);
		if (spanMap) {
			for (const [, spanData] of spanMap) {
				spanData.span.setStatus({
					code: spanstatus.SPAN_STATUS_ERROR,
					message: "cancelled"
				});
				spanData.span.end();
			}
			spanMap.clear();
		}
	}
	exports.cleanupPendingSpansForTransport = cleanupPendingSpansForTransport;
	exports.completeSpanWithResults = completeSpanWithResults;
	exports.storeSpanForRequest = storeSpanForRequest;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/mcp-server/methodConfig.js
var require_methodConfig = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const attributes = require_attributes();
	const METHOD_CONFIGS = {
		"tools/call": {
			targetField: "name",
			targetAttribute: attributes.MCP_TOOL_NAME_ATTRIBUTE,
			captureArguments: true,
			argumentsField: "arguments"
		},
		"resources/read": {
			targetField: "uri",
			targetAttribute: attributes.MCP_RESOURCE_URI_ATTRIBUTE,
			captureUri: true
		},
		"resources/subscribe": {
			targetField: "uri",
			targetAttribute: attributes.MCP_RESOURCE_URI_ATTRIBUTE
		},
		"resources/unsubscribe": {
			targetField: "uri",
			targetAttribute: attributes.MCP_RESOURCE_URI_ATTRIBUTE
		},
		"prompts/get": {
			targetField: "name",
			targetAttribute: attributes.MCP_PROMPT_NAME_ATTRIBUTE,
			captureName: true,
			captureArguments: true,
			argumentsField: "arguments"
		}
	};
	function extractTargetInfo(method, params) {
		const config = METHOD_CONFIGS[method];
		if (!config) return { attributes: {} };
		const target = config.targetField && typeof params?.[config.targetField] === "string" ? params[config.targetField] : void 0;
		return {
			target,
			attributes: target && config.targetAttribute ? { [config.targetAttribute]: target } : {}
		};
	}
	function getRequestArguments(method, params) {
		const args = {};
		const config = METHOD_CONFIGS[method];
		if (!config) return args;
		if (config.captureArguments && config.argumentsField && params?.[config.argumentsField]) {
			const argumentsObj = params[config.argumentsField];
			if (typeof argumentsObj === "object" && argumentsObj !== null) for (const [key, value] of Object.entries(argumentsObj)) args[`${attributes.MCP_REQUEST_ARGUMENT}.${key.toLowerCase()}`] = JSON.stringify(value);
		}
		if (config.captureUri && params?.uri) args[`${attributes.MCP_REQUEST_ARGUMENT}.uri`] = JSON.stringify(params.uri);
		if (config.captureName && params?.name) args[`${attributes.MCP_REQUEST_ARGUMENT}.name`] = JSON.stringify(params.name);
		return args;
	}
	exports.extractTargetInfo = extractTargetInfo;
	exports.getRequestArguments = getRequestArguments;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/mcp-server/attributeExtraction.js
var require_attributeExtraction = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const url = require_url();
	const attributes = require_attributes();
	const methodConfig = require_methodConfig();
	function formatLoggingData(data) {
		return typeof data === "string" ? data : JSON.stringify(data);
	}
	function getNotificationAttributes(method, params, recordInputs) {
		const attributes$1 = {};
		switch (method) {
			case "notifications/cancelled":
				if (params?.requestId) attributes$1["mcp.cancelled.request_id"] = String(params.requestId);
				if (params?.reason) attributes$1["mcp.cancelled.reason"] = String(params.reason);
				break;
			case "notifications/message":
				if (params?.level) attributes$1[attributes.MCP_LOGGING_LEVEL_ATTRIBUTE] = String(params.level);
				if (params?.logger) attributes$1[attributes.MCP_LOGGING_LOGGER_ATTRIBUTE] = String(params.logger);
				if (params?.data !== void 0) {
					attributes$1[attributes.MCP_LOGGING_DATA_TYPE_ATTRIBUTE] = typeof params.data;
					if (recordInputs) attributes$1[attributes.MCP_LOGGING_MESSAGE_ATTRIBUTE] = formatLoggingData(params.data);
				}
				break;
			case "notifications/progress":
				if (params?.progressToken) attributes$1["mcp.progress.token"] = String(params.progressToken);
				if (typeof params?.progress === "number") attributes$1["mcp.progress.current"] = params.progress;
				if (typeof params?.total === "number") {
					attributes$1["mcp.progress.total"] = params.total;
					if (typeof params?.progress === "number") attributes$1["mcp.progress.percentage"] = params.progress / params.total * 100;
				}
				if (params?.message) attributes$1["mcp.progress.message"] = String(params.message);
				break;
			case "notifications/resources/updated":
				if (params?.uri) {
					attributes$1[attributes.MCP_RESOURCE_URI_ATTRIBUTE] = String(params.uri);
					const urlObject = url.parseStringToURLObject(String(params.uri));
					if (urlObject && !url.isURLObjectRelative(urlObject)) attributes$1["mcp.resource.protocol"] = urlObject.protocol.replace(":", "");
				}
				break;
			case "notifications/initialized":
				attributes$1["mcp.lifecycle.phase"] = "initialization_complete";
				attributes$1["mcp.protocol.ready"] = 1;
				break;
		}
		return attributes$1;
	}
	function buildTypeSpecificAttributes(type, message, params, recordInputs) {
		if (type === "request") {
			const request = message;
			const targetInfo = methodConfig.extractTargetInfo(request.method, params || {});
			return {
				...request.id !== void 0 && { [attributes.MCP_REQUEST_ID_ATTRIBUTE]: String(request.id) },
				...targetInfo.attributes,
				...recordInputs ? methodConfig.getRequestArguments(request.method, params || {}) : {}
			};
		}
		return getNotificationAttributes(message.method, params || {}, recordInputs);
	}
	exports.buildTypeSpecificAttributes = buildTypeSpecificAttributes;
	exports.getNotificationAttributes = getNotificationAttributes;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/mcp-server/piiFiltering.js
var require_piiFiltering = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const attributes = require_attributes();
	const NETWORK_PII_ATTRIBUTES = /* @__PURE__ */ new Set([
		attributes.CLIENT_ADDRESS_ATTRIBUTE,
		attributes.CLIENT_PORT_ATTRIBUTE,
		attributes.MCP_RESOURCE_URI_ATTRIBUTE
	]);
	function isNetworkPiiAttribute(key) {
		return NETWORK_PII_ATTRIBUTES.has(key);
	}
	function filterMcpPiiFromSpanData(spanData, userInfo) {
		if (userInfo) return spanData;
		return Object.entries(spanData).reduce((acc, [key, value]) => {
			if (!isNetworkPiiAttribute(key)) acc[key] = value;
			return acc;
		}, {});
	}
	exports.filterMcpPiiFromSpanData = filterMcpPiiFromSpanData;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/mcp-server/spans.js
var require_spans = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const currentScopes = require_currentScopes();
	const semanticAttributes = require_semanticAttributes();
	const trace = require_trace();
	const attributeExtraction = require_attributeExtraction();
	const attributes = require_attributes();
	const methodConfig = require_methodConfig();
	const piiFiltering = require_piiFiltering();
	const sessionExtraction = require_sessionExtraction();
	function createSpanName(method, target) {
		return target ? `${method} ${target}` : method;
	}
	function buildSentryAttributes(type) {
		let op;
		let origin;
		switch (type) {
			case "request":
				op = attributes.MCP_SERVER_OP_VALUE;
				origin = attributes.MCP_FUNCTION_ORIGIN_VALUE;
				break;
			case "notification-incoming":
				op = attributes.MCP_NOTIFICATION_CLIENT_TO_SERVER_OP_VALUE;
				origin = attributes.MCP_NOTIFICATION_ORIGIN_VALUE;
				break;
			case "notification-outgoing":
				op = attributes.MCP_NOTIFICATION_SERVER_TO_CLIENT_OP_VALUE;
				origin = attributes.MCP_NOTIFICATION_ORIGIN_VALUE;
				break;
		}
		return {
			[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_OP]: op,
			[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: origin,
			[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: attributes.MCP_ROUTE_SOURCE_VALUE
		};
	}
	function createMcpSpan(config) {
		const { type, message, transport, extra, callback, options } = config;
		const { method } = message;
		const params = message.params;
		let spanName;
		if (type === "request") spanName = createSpanName(method, methodConfig.extractTargetInfo(method, params || {}).target);
		else spanName = method;
		const rawAttributes = {
			...sessionExtraction.buildTransportAttributes(transport, extra),
			[attributes.MCP_METHOD_NAME_ATTRIBUTE]: method,
			...attributeExtraction.buildTypeSpecificAttributes(type, message, params, options?.recordInputs),
			...buildSentryAttributes(type)
		};
		const client = currentScopes.getClient();
		const userInfo = Boolean(client?.getDataCollectionOptions().userInfo);
		const attributes$1 = piiFiltering.filterMcpPiiFromSpanData(rawAttributes, userInfo);
		return trace.startSpan({
			name: spanName,
			forceTransaction: true,
			attributes: attributes$1
		}, callback);
	}
	function createMcpNotificationSpan(jsonRpcMessage, transport, extra, options, callback) {
		return createMcpSpan({
			type: "notification-incoming",
			message: jsonRpcMessage,
			transport,
			extra,
			callback,
			options
		});
	}
	function createMcpOutgoingNotificationSpan(jsonRpcMessage, transport, options, callback) {
		return createMcpSpan({
			type: "notification-outgoing",
			message: jsonRpcMessage,
			transport,
			options,
			callback
		});
	}
	function buildMcpServerSpanConfig(jsonRpcMessage, transport, extra, options) {
		const { method } = jsonRpcMessage;
		const params = jsonRpcMessage.params;
		const spanName = createSpanName(method, methodConfig.extractTargetInfo(method, params || {}).target);
		const rawAttributes = {
			...sessionExtraction.buildTransportAttributes(transport, extra),
			[attributes.MCP_METHOD_NAME_ATTRIBUTE]: method,
			...attributeExtraction.buildTypeSpecificAttributes("request", jsonRpcMessage, params, options?.recordInputs),
			...buildSentryAttributes("request")
		};
		const client = currentScopes.getClient();
		const userInfo = Boolean(client?.getDataCollectionOptions().userInfo);
		const attributes$1 = piiFiltering.filterMcpPiiFromSpanData(rawAttributes, userInfo);
		return {
			name: spanName,
			op: attributes.MCP_SERVER_OP_VALUE,
			forceTransaction: true,
			attributes: attributes$1
		};
	}
	exports.buildMcpServerSpanConfig = buildMcpServerSpanConfig;
	exports.createMcpNotificationSpan = createMcpNotificationSpan;
	exports.createMcpOutgoingNotificationSpan = createMcpOutgoingNotificationSpan;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/mcp-server/transport.js
var require_transport = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const currentScopes = require_currentScopes();
	const object = require_object();
	const trace = require_trace();
	const attributes = require_attributes();
	const correlation = require_correlation();
	const errorCapture = require_errorCapture();
	const sessionExtraction = require_sessionExtraction();
	const sessionManagement = require_sessionManagement();
	const spans = require_spans();
	const validation = require_validation();
	function wrapTransportOnMessage(transport, options) {
		if (transport.onmessage) object.fill(transport, "onmessage", (originalOnMessage) => {
			return function(message, extra) {
				if (validation.isJsonRpcRequest(message)) {
					const isInitialize = message.method === "initialize";
					let initSessionData;
					if (isInitialize) try {
						initSessionData = sessionExtraction.extractSessionDataFromInitializeRequest(message);
						sessionManagement.storeSessionDataForTransport(transport, initSessionData);
					} catch {}
					const isolationScope = currentScopes.getIsolationScope().clone();
					return currentScopes.withIsolationScope(isolationScope, () => {
						const spanConfig = spans.buildMcpServerSpanConfig(message, transport, extra, options);
						const span = trace.startInactiveSpan(spanConfig);
						if (isInitialize && initSessionData) span.setAttributes({
							...sessionExtraction.buildClientAttributesFromInfo(initSessionData.clientInfo),
							...initSessionData.protocolVersion && { [attributes.MCP_PROTOCOL_VERSION_ATTRIBUTE]: initSessionData.protocolVersion }
						});
						correlation.storeSpanForRequest(transport, message.id, span, message.method);
						return trace.withActiveSpan(span, () => {
							return originalOnMessage.call(this, message, extra);
						});
					});
				}
				if (validation.isJsonRpcNotification(message)) return spans.createMcpNotificationSpan(message, transport, extra, options, () => {
					return originalOnMessage.call(this, message, extra);
				});
				return originalOnMessage.call(this, message, extra);
			};
		});
	}
	function wrapTransportSend(transport, options) {
		if (transport.send) object.fill(transport, "send", (originalSend) => {
			return async function(...args) {
				const [message] = args;
				if (validation.isJsonRpcNotification(message)) return spans.createMcpOutgoingNotificationSpan(message, transport, options, () => {
					return originalSend.call(this, ...args);
				});
				if (validation.isJsonRpcResponse(message)) {
					if (message.id !== null && message.id !== void 0) {
						if (message.error) captureJsonRpcErrorResponse(message.error);
						if (validation.isValidContentItem(message.result)) {
							if (message.result.protocolVersion || message.result.serverInfo) try {
								const serverData = sessionExtraction.extractSessionDataFromInitializeResponse(message.result);
								sessionManagement.updateSessionDataForTransport(transport, serverData);
							} catch {}
						}
						correlation.completeSpanWithResults(transport, message.id, message.result, options, !!message.error);
					}
				}
				return originalSend.call(this, ...args);
			};
		});
	}
	function wrapTransportOnClose(transport) {
		if (transport.onclose) object.fill(transport, "onclose", (originalOnClose) => {
			return function(...args) {
				correlation.cleanupPendingSpansForTransport(transport);
				sessionManagement.cleanupSessionDataForTransport(transport);
				return originalOnClose.call(this, ...args);
			};
		});
	}
	function wrapTransportError(transport) {
		if (transport.onerror) object.fill(transport, "onerror", (originalOnError) => {
			return function(error) {
				captureTransportError(error);
				return originalOnError.call(this, error);
			};
		});
	}
	function captureJsonRpcErrorResponse(errorResponse) {
		try {
			if (errorResponse && typeof errorResponse === "object" && "code" in errorResponse && "message" in errorResponse) {
				const jsonRpcError = errorResponse;
				if (jsonRpcError.code === -32603 || jsonRpcError.code >= -32099 && jsonRpcError.code <= -32e3) {
					const error = new Error(jsonRpcError.message);
					error.name = `JsonRpcError_${jsonRpcError.code}`;
					errorCapture.captureError(error, "protocol");
				}
			}
		} catch {}
	}
	function captureTransportError(error) {
		try {
			errorCapture.captureError(error, "transport");
		} catch {}
	}
	exports.wrapTransportError = wrapTransportError;
	exports.wrapTransportOnClose = wrapTransportOnClose;
	exports.wrapTransportOnMessage = wrapTransportOnMessage;
	exports.wrapTransportSend = wrapTransportSend;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/mcp-server/index.js
var require_mcp_server = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const currentScopes = require_currentScopes();
	const object = require_object();
	const handlers = require_handlers();
	const transport = require_transport();
	const validation = require_validation();
	const wrappedMcpServerInstances = /* @__PURE__ */ new WeakSet();
	function wrapMcpServerWithSentry(mcpServerInstance, options) {
		if (wrappedMcpServerInstances.has(mcpServerInstance)) return mcpServerInstance;
		if (!validation.validateMcpServerInstance(mcpServerInstance)) return mcpServerInstance;
		const serverInstance = mcpServerInstance;
		const genAI = currentScopes.getClient()?.getDataCollectionOptions().genAI;
		const resolvedOptions = {
			recordInputs: options?.recordInputs ?? genAI?.inputs ?? false,
			recordOutputs: options?.recordOutputs ?? genAI?.outputs ?? false
		};
		object.fill(serverInstance, "connect", (originalConnect) => {
			return async function(transport$1, ...restArgs) {
				const result = await originalConnect.call(this, transport$1, ...restArgs);
				transport.wrapTransportOnMessage(transport$1, resolvedOptions);
				transport.wrapTransportSend(transport$1, resolvedOptions);
				transport.wrapTransportOnClose(transport$1);
				transport.wrapTransportError(transport$1);
				return result;
			};
		});
		handlers.wrapAllMCPHandlers(serverInstance);
		handlers.wrapExistingHandlers(serverInstance);
		wrappedMcpServerInstances.add(mcpServerInstance);
		return mcpServerInstance;
	}
	exports.wrapMcpServerWithSentry = wrapMcpServerWithSentry;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/node-stack-trace.js
var require_node_stack_trace = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const stacktrace = require_stacktrace();
	function filenameIsInApp(filename, isNative = false) {
		return !(isNative || filename && !filename.startsWith("/") && !filename.match(/^[A-Z]:/) && !filename.startsWith(".") && !filename.match(/^[a-zA-Z]([a-zA-Z0-9.\-+])*:\/\//)) && filename !== void 0 && !filename.includes("node_modules/");
	}
	function node(getModule) {
		const FILENAME_MATCH = /^\s*[-]{4,}$/;
		const FULL_MATCH = /at (?:async )?(?:(.+?)\s+\()?(?:(.+):(\d+):(\d+)?|([^)]+))\)?/;
		const DATA_URI_MATCH = /at (?:async )?(.+?) \(data:(.*?),/;
		return (line) => {
			const dataUriMatch = line.match(DATA_URI_MATCH);
			if (dataUriMatch) return {
				filename: `<data:${dataUriMatch[2]}>`,
				function: dataUriMatch[1]
			};
			const lineMatch = line.match(FULL_MATCH);
			if (lineMatch) {
				let object;
				let method;
				let functionName;
				let typeName;
				let methodName;
				if (lineMatch[1]) {
					functionName = lineMatch[1];
					let methodStart = functionName.lastIndexOf(".");
					if (functionName[methodStart - 1] === ".") methodStart--;
					if (methodStart > 0) {
						object = functionName.slice(0, methodStart);
						method = functionName.slice(methodStart + 1);
						const objectEnd = object.indexOf(".Module");
						if (objectEnd > 0) {
							functionName = functionName.slice(objectEnd + 1);
							object = object.slice(0, objectEnd);
						}
					}
					typeName = void 0;
				}
				if (method) {
					typeName = object;
					methodName = method;
				}
				if (method === "<anonymous>") {
					methodName = void 0;
					functionName = void 0;
				}
				if (functionName === void 0) {
					methodName = methodName || stacktrace.UNKNOWN_FUNCTION;
					functionName = typeName ? `${typeName}.${methodName}` : methodName;
				}
				let filename = stacktrace.normalizeStackTracePath(lineMatch[2]);
				const isNative = lineMatch[5] === "native";
				if (!filename && lineMatch[5] && !isNative) filename = lineMatch[5];
				const maybeDecodedFilename = filename ? _safeDecodeURI(filename) : void 0;
				return {
					filename: maybeDecodedFilename ?? filename,
					module: maybeDecodedFilename && getModule?.(maybeDecodedFilename),
					function: functionName,
					lineno: _parseIntOrUndefined(lineMatch[3]),
					colno: _parseIntOrUndefined(lineMatch[4]),
					in_app: filenameIsInApp(filename || "", isNative)
				};
			}
			if (line.match(FILENAME_MATCH)) return { filename: line };
		};
	}
	function nodeStackLineParser(getModule) {
		return [90, node(getModule)];
	}
	function _parseIntOrUndefined(input) {
		return parseInt(input || "", 10) || void 0;
	}
	function _safeDecodeURI(filename) {
		try {
			return decodeURI(filename);
		} catch {
			return;
		}
	}
	exports.filenameIsInApp = filenameIsInApp;
	exports.node = node;
	exports.nodeStackLineParser = nodeStackLineParser;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/vercelWaitUntil.js
var require_vercelWaitUntil = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const worldwide = require_worldwide();
	function vercelWaitUntil(task) {
		if (typeof EdgeRuntime !== "string") return;
		const ctx = worldwide.GLOBAL_OBJ[/* @__PURE__ */ Symbol.for("@vercel/request-context")]?.get?.();
		if (ctx?.waitUntil) ctx.waitUntil(task);
	}
	exports.vercelWaitUntil = vercelWaitUntil;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/flushIfServerless.js
var require_flushIfServerless = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const exports$1 = require_exports$1();
	const debugLogger = require_debug_logger();
	const vercelWaitUntil = require_vercelWaitUntil();
	const worldwide = require_worldwide();
	async function flushWithTimeout(timeout) {
		try {
			debugLogger.debug.log("Flushing events...");
			await exports$1.flush(timeout);
			debugLogger.debug.log("Done flushing events");
		} catch (e) {
			debugLogger.debug.log("Error while flushing events:\n", e);
		}
	}
	async function flushIfServerless(params = {}) {
		const { timeout = 2e3 } = params;
		if ("cloudflareWaitUntil" in params && typeof params?.cloudflareWaitUntil === "function") {
			params.cloudflareWaitUntil(flushWithTimeout(timeout));
			return;
		}
		if ("cloudflareCtx" in params && typeof params.cloudflareCtx?.waitUntil === "function") {
			params.cloudflareCtx.waitUntil(flushWithTimeout(timeout));
			return;
		}
		if (worldwide.GLOBAL_OBJ[/* @__PURE__ */ Symbol.for("@vercel/request-context")]) {
			vercelWaitUntil.vercelWaitUntil(flushWithTimeout(timeout));
			return;
		}
		if (typeof process === "undefined") return;
		if (!!process.env.FUNCTIONS_WORKER_RUNTIME || !!process.env.LAMBDA_TASK_ROOT || !!process.env.K_SERVICE || !!process.env.CF_PAGES || !!process.env.VERCEL || !!process.env.NETLIFY) await flushWithTimeout(timeout);
	}
	exports.flushIfServerless = flushIfServerless;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/anr.js
var require_anr = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const nodeStackTrace = require_node_stack_trace();
	const stacktrace = require_stacktrace();
	function watchdogTimer(createTimer, pollInterval, anrThreshold, callback) {
		const timer = createTimer();
		let triggered = false;
		let enabled = true;
		setInterval(() => {
			const diffMs = timer.getTimeMs();
			if (triggered === false && diffMs > pollInterval + anrThreshold) {
				triggered = true;
				if (enabled) callback();
			}
			if (diffMs < pollInterval + anrThreshold) triggered = false;
		}, 20);
		return {
			poll: () => {
				timer.reset();
			},
			enabled: (state) => {
				enabled = state;
			}
		};
	}
	function callFrameToStackFrame(frame, url, getModuleFromFilename) {
		const filename = url ? url.replace(/^file:\/\//, "") : void 0;
		const colno = frame.location.columnNumber ? frame.location.columnNumber + 1 : void 0;
		const lineno = frame.location.lineNumber ? frame.location.lineNumber + 1 : void 0;
		return {
			filename,
			module: getModuleFromFilename(filename),
			function: frame.functionName || stacktrace.UNKNOWN_FUNCTION,
			colno,
			lineno,
			in_app: filename ? nodeStackTrace.filenameIsInApp(filename) : void 0
		};
	}
	exports.callFrameToStackFrame = callFrameToStackFrame;
	exports.watchdogTimer = watchdogTimer;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/express/request-layer-store.js
var require_request_layer_store = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const requestLayerStore = /* @__PURE__ */ new WeakMap();
	const storeLayer = (req, layer) => {
		const store = requestLayerStore.get(req);
		if (!store) requestLayerStore.set(req, [layer]);
		else store.push(layer);
	};
	const getStoredLayers = (req) => {
		let store = requestLayerStore.get(req);
		if (!store) {
			store = [];
			requestLayerStore.set(req, store);
		}
		return store;
	};
	exports.getStoredLayers = getStoredLayers;
	exports.storeLayer = storeLayer;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/express/types.js
var require_types = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const ATTR_EXPRESS_NAME = "express.name";
	const ATTR_HTTP_ROUTE = "http.route";
	const ATTR_EXPRESS_TYPE = "express.type";
	const ExpressLayerType_ROUTER = "router";
	const ExpressLayerType_MIDDLEWARE = "middleware";
	const ExpressLayerType_REQUEST_HANDLER = "request_handler";
	exports.ATTR_EXPRESS_NAME = ATTR_EXPRESS_NAME;
	exports.ATTR_EXPRESS_TYPE = ATTR_EXPRESS_TYPE;
	exports.ATTR_HTTP_ROUTE = ATTR_HTTP_ROUTE;
	exports.ExpressLayerType_MIDDLEWARE = ExpressLayerType_MIDDLEWARE;
	exports.ExpressLayerType_REQUEST_HANDLER = ExpressLayerType_REQUEST_HANDLER;
	exports.ExpressLayerType_ROUTER = ExpressLayerType_ROUTER;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/express/utils.js
var require_utils = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const requestLayerStore = require_request_layer_store();
	const types = require_types();
	const string = require_string();
	const asErrorAndMessage = (error) => error instanceof Error ? [error, error.message] : [String(error), String(error)];
	function isRoutePattern(route) {
		return route.includes(":") || route.includes("*");
	}
	const getLayerMetadata = (route, layer, layerPath) => {
		if (layer.name === "router") {
			const maybeRouterPath = getRouterPath("", layer);
			const extractedRouterPath = maybeRouterPath ? maybeRouterPath : layerPath || route || "/";
			return {
				attributes: {
					[types.ATTR_EXPRESS_NAME]: extractedRouterPath,
					[types.ATTR_EXPRESS_TYPE]: types.ExpressLayerType_ROUTER
				},
				name: `router - ${extractedRouterPath}`
			};
		} else if (layer.name === "bound dispatch" || layer.name === "handle") return {
			attributes: {
				[types.ATTR_EXPRESS_NAME]: (route || layerPath) ?? "request handler",
				[types.ATTR_EXPRESS_TYPE]: types.ExpressLayerType_REQUEST_HANDLER
			},
			name: `request handler${layer.path ? ` - ${route || layerPath}` : ""}`
		};
		else return {
			attributes: {
				[types.ATTR_EXPRESS_NAME]: layer.name,
				[types.ATTR_EXPRESS_TYPE]: types.ExpressLayerType_MIDDLEWARE
			},
			name: `middleware - ${layer.name}`
		};
	};
	const getRouterPath = (path, layer) => {
		const stackLayer = Array.isArray(layer.handle?.stack) ? layer.handle?.stack?.[0] : void 0;
		if (stackLayer?.route?.path) return `${path}${stackLayer.route.path}`;
		if (stackLayer && Array.isArray(stackLayer?.handle?.stack)) return getRouterPath(path, stackLayer);
		return path;
	};
	const isLayerIgnored = (name, type, config) => {
		if (Array.isArray(config?.ignoreLayersType) && config?.ignoreLayersType?.includes(type)) return true;
		if (!Array.isArray(config?.ignoreLayers)) return false;
		try {
			return string.stringMatchesSomePattern(name, config.ignoreLayers, true);
		} catch {}
		return false;
	};
	function getActualMatchedRoute(req, constructedRoute) {
		const layersStore = requestLayerStore.getStoredLayers(req);
		if (layersStore.length === 0) return;
		if (layersStore.every((path) => path === "/")) return req.originalUrl === "/" ? "/" : void 0;
		if (constructedRoute === "*") return constructedRoute;
		if (constructedRoute.includes("/") && (constructedRoute.includes(",") || constructedRoute.includes("\\") || constructedRoute.includes("*") || constructedRoute.includes("["))) return constructedRoute;
		const normalizedRoute = constructedRoute.startsWith("/") ? constructedRoute : `/${constructedRoute}`;
		return normalizedRoute.length > 0 && (req.originalUrl === normalizedRoute || req.originalUrl.startsWith(normalizedRoute) || isRoutePattern(normalizedRoute)) ? normalizedRoute : void 0;
	}
	function getConstructedRoute(req) {
		const layersStore = requestLayerStore.getStoredLayers(req);
		let constructedRoute = "";
		for (const path of layersStore) {
			if (path === "/" || path === "/*") continue;
			constructedRoute += !constructedRoute || constructedRoute.endsWith("/") ? path : `/${path}`;
		}
		return constructedRoute.replace(/\/{2,}/g, "/");
	}
	const getLayerPath = (args) => {
		const firstArg = args[0];
		if (Array.isArray(firstArg)) return firstArg.map((arg) => extractLayerPathSegment(arg) || "").join(",");
		return extractLayerPathSegment(firstArg);
	};
	const extractLayerPathSegment = (arg) => typeof arg === "string" ? arg : arg instanceof RegExp || typeof arg === "number" ? String(arg) : void 0;
	const isExpressWithRouterPrototype = (express) => isExpressRouterPrototype(express?.Router?.prototype);
	const isExpressRouterPrototype = (routerProto) => (typeof routerProto === "object" || typeof routerProto === "function") && !!routerProto && "route" in routerProto && typeof routerProto.route === "function";
	const isExpressWithoutRouterPrototype = (express) => isExpressRouterPrototype(express.Router) && !isExpressWithRouterPrototype(express);
	function getStatusCodeFromResponse(error) {
		const statusCode = error.status || error.statusCode || error.status_code || error.output?.statusCode;
		return statusCode ? parseInt(statusCode, 10) : 500;
	}
	function defaultShouldHandleError(error) {
		return getStatusCodeFromResponse(error) >= 500;
	}
	exports.asErrorAndMessage = asErrorAndMessage;
	exports.defaultShouldHandleError = defaultShouldHandleError;
	exports.getActualMatchedRoute = getActualMatchedRoute;
	exports.getConstructedRoute = getConstructedRoute;
	exports.getLayerMetadata = getLayerMetadata;
	exports.getLayerPath = getLayerPath;
	exports.getRouterPath = getRouterPath;
	exports.isExpressWithRouterPrototype = isExpressWithRouterPrototype;
	exports.isExpressWithoutRouterPrototype = isExpressWithoutRouterPrototype;
	exports.isLayerIgnored = isLayerIgnored;
	exports.isRoutePattern = isRoutePattern;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/express/set-sdk-processing-metadata.js
var require_set_sdk_processing_metadata = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const currentScopes = require_currentScopes();
	const request = require_request();
	function setSDKProcessingMetadata(request$1) {
		if (!(currentScopes.getIsolationScope()?.getScopeData()?.sdkProcessingMetadata)?.normalizedRequest) {
			const normalizedRequest = request.httpRequestToRequestData(request$1);
			currentScopes.getIsolationScope().setSDKProcessingMetadata({ normalizedRequest });
		}
	}
	exports.setSDKProcessingMetadata = setSDKProcessingMetadata;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/express/patch-layer.js
var require_patch_layer = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const debugBuild = require_debug_build();
	const semanticAttributes = require_semanticAttributes();
	const debugLogger = require_debug_logger();
	const spanUtils = require_spanUtils();
	const spanstatus = require_spanstatus();
	const object = require_object();
	const currentScopes = require_currentScopes();
	const trace = require_trace();
	const requestLayerStore = require_request_layer_store();
	const types = require_types();
	const utils = require_utils();
	const defaultScopes = require_defaultScopes();
	const setSdkProcessingMetadata = require_set_sdk_processing_metadata();
	function patchLayer(getOptions, maybeLayer, layerPath) {
		if (!maybeLayer?.handle) return;
		const layer = maybeLayer;
		const layerHandleOriginal = layer.handle;
		if (object.getOriginalFunction(layerHandleOriginal)) return;
		if (layerHandleOriginal.length === 4) return;
		function layerHandlePatched(req, res, ...otherArgs) {
			const options = getOptions();
			setSdkProcessingMetadata.setSDKProcessingMetadata(req);
			const parentSpan = spanUtils.getActiveSpan();
			if (!parentSpan) return layerHandleOriginal.apply(this, [
				req,
				res,
				...otherArgs
			]);
			if (layerPath) requestLayerStore.storeLayer(req, layerPath);
			const storedLayers = requestLayerStore.getStoredLayers(req);
			const isLayerPathStored = !!layerPath;
			const constructedRoute = utils.getConstructedRoute(req);
			const actualMatchedRoute = utils.getActualMatchedRoute(req, constructedRoute);
			options.onRouteResolved?.(actualMatchedRoute);
			const metadata = utils.getLayerMetadata(constructedRoute, layer, layerPath);
			const name = metadata.attributes[types.ATTR_EXPRESS_NAME];
			const type = metadata.attributes[types.ATTR_EXPRESS_TYPE];
			const attributes = Object.assign(metadata.attributes, {
				[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.express",
				[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_OP]: `${type}.express`
			});
			if (actualMatchedRoute) attributes[types.ATTR_HTTP_ROUTE] = actualMatchedRoute;
			if (utils.isLayerIgnored(metadata.attributes[types.ATTR_EXPRESS_NAME], type, options)) {
				if (isLayerPathStored) storedLayers.pop();
				return layerHandleOriginal.apply(this, [
					req,
					res,
					...otherArgs
				]);
			}
			const currentScope = currentScopes.getIsolationScope();
			if (currentScope !== defaultScopes.getDefaultIsolationScope()) {
				if (type === "request_handler") {
					const method = req.method ? req.method.toUpperCase() : "GET";
					currentScope.setTransactionName(`${method} ${constructedRoute}`);
				}
			} else debugBuild.DEBUG_BUILD && debugLogger.debug.warn("Isolation scope is still default isolation scope - skipping setting transactionName");
			return trace.startSpanManual({
				name,
				attributes
			}, (span) => {
				let spanHasEnded = false;
				if (metadata.attributes[types.ATTR_EXPRESS_TYPE] === types.ExpressLayerType_ROUTER) {
					span.end();
					spanHasEnded = true;
				}
				const onResponseFinish = () => {
					if (!spanHasEnded) {
						spanHasEnded = true;
						span.end();
					}
				};
				for (let i = 0; i < otherArgs.length; i++) {
					const callback = otherArgs[i];
					if (typeof callback !== "function") continue;
					otherArgs[i] = function(...args) {
						const maybeError = args[0];
						const isError = !!maybeError && maybeError !== "route" && maybeError !== "router";
						if (!spanHasEnded && isError) {
							const [_, message] = utils.asErrorAndMessage(maybeError);
							span.setStatus({
								code: spanstatus.SPAN_STATUS_ERROR,
								message
							});
						}
						if (!spanHasEnded) {
							spanHasEnded = true;
							res.removeListener("finish", onResponseFinish);
							span.end();
						}
						if (!(req.route && isError) && isLayerPathStored) storedLayers.pop();
						return trace.withActiveSpan(parentSpan, () => callback.apply(this, args));
					};
					break;
				}
				try {
					return layerHandleOriginal.apply(this, [
						req,
						res,
						...otherArgs
					]);
				} catch (anyError) {
					const [_, message] = utils.asErrorAndMessage(anyError);
					span.setStatus({
						code: spanstatus.SPAN_STATUS_ERROR,
						message
					});
					throw anyError;
				} finally {
					if (!spanHasEnded) res.once("finish", onResponseFinish);
				}
			});
		}
		for (const key in layerHandleOriginal) {
			if (key in layerHandlePatched) continue;
			Object.defineProperty(layerHandlePatched, key, {
				get() {
					return layerHandleOriginal[key];
				},
				set(value) {
					layerHandleOriginal[key] = value;
				}
			});
		}
		object.markFunctionWrapped(layerHandlePatched, layerHandleOriginal);
		Object.defineProperty(layer, "handle", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: layerHandlePatched
		});
	}
	exports.patchLayer = patchLayer;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/get-default-export.js
var require_get_default_export = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	function getDefaultExport(moduleExport) {
		return !!moduleExport && typeof moduleExport === "object" && "default" in moduleExport && moduleExport.default || moduleExport;
	}
	exports.getDefaultExport = getDefaultExport;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/express/index.js
var require_express = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const debugLogger = require_debug_logger();
	const exports$1 = require_exports$1();
	const debugBuild = require_debug_build();
	const utils = require_utils();
	const object = require_object();
	const patchLayer = require_patch_layer();
	const setSdkProcessingMetadata = require_set_sdk_processing_metadata();
	const getDefaultExport = require_get_default_export();
	function isLegacyOptions(options) {
		return !!options.express;
	}
	let didLegacyDeprecationWarning = false;
	function deprecationWarning() {
		if (!didLegacyDeprecationWarning) {
			didLegacyDeprecationWarning = true;
			debugBuild.DEBUG_BUILD && debugLogger.debug.warn("[Express] `patchExpressModule(options)` is deprecated. Use `patchExpressModule(moduleExports, getOptions)` instead.");
		}
	}
	function patchExpressModule(optionsOrExports, maybeGetOptions) {
		let getOptions;
		let moduleExports;
		if (!maybeGetOptions && isLegacyOptions(optionsOrExports)) {
			const { express: express2, ...options } = optionsOrExports;
			moduleExports = express2;
			getOptions = () => options;
			deprecationWarning();
		} else if (typeof maybeGetOptions !== "function") throw new TypeError("`patchExpressModule(moduleExports, getOptions)` requires a `getOptions` callback");
		else {
			getOptions = maybeGetOptions;
			moduleExports = optionsOrExports;
		}
		const express = getDefaultExport.getDefaultExport(moduleExports);
		const routerProto = utils.isExpressWithRouterPrototype(express) ? express.Router.prototype : utils.isExpressWithoutRouterPrototype(express) ? express.Router : void 0;
		if (!routerProto) throw new TypeError("no valid Express route function to instrument");
		const originalRouteMethod = routerProto.route;
		try {
			object.wrapMethod(routerProto, "route", function routeTrace(...args) {
				const route = originalRouteMethod.apply(this, args);
				const layer = this.stack[this.stack.length - 1];
				patchLayer.patchLayer(getOptions, layer, utils.getLayerPath(args));
				return route;
			});
		} catch (e) {
			debugBuild.DEBUG_BUILD && debugLogger.debug.error("Failed to patch express route method:", e);
		}
		const originalRouterUse = routerProto.use;
		try {
			object.wrapMethod(routerProto, "use", function useTrace(...args) {
				const route = originalRouterUse.apply(this, args);
				const layer = this.stack[this.stack.length - 1];
				if (!layer) return route;
				patchLayer.patchLayer(getOptions, layer, utils.getLayerPath(args));
				return route;
			});
		} catch (e) {
			debugBuild.DEBUG_BUILD && debugLogger.debug.error("Failed to patch express use method:", e);
		}
		const { application } = express;
		const originalApplicationUse = application.use;
		try {
			object.wrapMethod(application, "use", function appUseTrace(...args) {
				const route = originalApplicationUse.apply(this, args);
				const router = utils.isExpressWithRouterPrototype(express) ? this.router : this._router;
				if (router) {
					const layer = router.stack[router.stack.length - 1];
					if (layer) patchLayer.patchLayer(getOptions, layer, utils.getLayerPath(args));
				}
				return route;
			});
		} catch (e) {
			debugBuild.DEBUG_BUILD && debugLogger.debug.error("Failed to patch express application.use method:", e);
		}
		return express;
	}
	function expressErrorHandler(options) {
		return function sentryErrorMiddleware(error, request, res, next) {
			setSdkProcessingMetadata.setSDKProcessingMetadata(request);
			if ((options?.shouldHandleError || utils.defaultShouldHandleError)(error)) res.sentry = exports$1.captureException(error, { mechanism: {
				type: "auto.middleware.express",
				handled: false
			} });
			next(error);
		};
	}
	function setupExpressErrorHandler(app, options) {
		app.use(expressRequestHandler());
		app.use(expressErrorHandler(options));
	}
	function expressRequestHandler() {
		return function sentryRequestMiddleware(request, _res, next) {
			setSdkProcessingMetadata.setSDKProcessingMetadata(request);
			next();
		};
	}
	exports.expressErrorHandler = expressErrorHandler;
	exports.patchExpressModule = patchExpressModule;
	exports.setupExpressErrorHandler = setupExpressErrorHandler;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/postgresjs.js
var require_postgresjs = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const debugBuild = require_debug_build();
	const semanticAttributes = require_semanticAttributes();
	const debugLogger = require_debug_logger();
	const spanUtils = require_spanUtils();
	const spanstatus = require_spanstatus();
	const trace = require_trace();
	const SQL_OPERATION_REGEX = /^(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)/i;
	const CONNECTION_CONTEXT_SYMBOL = /* @__PURE__ */ Symbol("sentryPostgresConnectionContext");
	const INSTRUMENTED_MARKER = /* @__PURE__ */ Symbol.for("sentry.instrumented.postgresjs");
	const QUERY_FROM_INSTRUMENTED_SQL = /* @__PURE__ */ Symbol.for("sentry.query.from.instrumented.sql");
	function instrumentPostgresJsSql(sql, options) {
		if (!sql || typeof sql !== "function") {
			debugBuild.DEBUG_BUILD && debugLogger.debug.warn("instrumentPostgresJsSql: provided value is not a valid postgres.js sql instance");
			return sql;
		}
		return _instrumentSqlInstance(sql, {
			requireParentSpan: true,
			...options
		});
	}
	function _instrumentSqlInstance(sql, options, parentConnectionContext) {
		if (sql[INSTRUMENTED_MARKER]) return sql;
		const proxiedSql = new Proxy(sql, {
			apply(target, thisArg, argumentsList) {
				const query = Reflect.apply(target, thisArg, argumentsList);
				if (query && typeof query === "object" && "handle" in query) _wrapSingleQueryHandle(query, proxiedSql, options);
				return query;
			},
			get(target, prop) {
				const original = target[prop];
				if (typeof prop !== "string" || typeof original !== "function") return original;
				if (prop === "unsafe" || prop === "file") return _wrapQueryMethod(original, target, proxiedSql, options);
				if (prop === "begin" || prop === "reserve") return _wrapCallbackMethod(original, target, proxiedSql, options);
				return original;
			}
		});
		if (parentConnectionContext) proxiedSql[CONNECTION_CONTEXT_SYMBOL] = parentConnectionContext;
		else _attachConnectionContext(sql, proxiedSql);
		sql[INSTRUMENTED_MARKER] = true;
		proxiedSql[INSTRUMENTED_MARKER] = true;
		return proxiedSql;
	}
	function _wrapQueryMethod(original, target, proxiedSql, options) {
		return function(...args) {
			const query = Reflect.apply(original, target, args);
			if (query && typeof query === "object" && "handle" in query) _wrapSingleQueryHandle(query, proxiedSql, options);
			return query;
		};
	}
	function _wrapCallbackMethod(original, target, parentSqlInstance, options) {
		return function(...args) {
			const parentContext = parentSqlInstance[CONNECTION_CONTEXT_SYMBOL];
			if (!(typeof args[args.length - 1] === "function")) {
				const result = Reflect.apply(original, target, args);
				if (result && typeof result.then === "function") return result.then((sqlInstance) => {
					return _instrumentSqlInstance(sqlInstance, options, parentContext);
				});
				return result;
			}
			const callback = args.length === 1 ? args[0] : args[1];
			const wrappedCallback = function(sqlInstance) {
				return callback(_instrumentSqlInstance(sqlInstance, options, parentContext));
			};
			const newArgs = args.length === 1 ? [wrappedCallback] : [args[0], wrappedCallback];
			return Reflect.apply(original, target, newArgs);
		};
	}
	function _wrapSingleQueryHandle(query, sqlInstance, options) {
		if (query.handle?.__sentryWrapped) return;
		query[QUERY_FROM_INSTRUMENTED_SQL] = true;
		const originalHandle = query.handle;
		const wrappedHandle = async function(...args) {
			if (this.executed || !_shouldCreateSpans(options)) return originalHandle.apply(this, args);
			const sanitizedSqlQuery = _sanitizeSqlQuery(_reconstructQuery(query.strings));
			return trace.startSpanManual({
				name: sanitizedSqlQuery || "postgresjs.query",
				op: "db"
			}, (span) => {
				span.setAttribute(semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, "auto.db.postgresjs");
				span.setAttributes({
					"db.system.name": "postgres",
					"db.query.text": sanitizedSqlQuery
				});
				const connectionContext = sqlInstance ? sqlInstance[CONNECTION_CONTEXT_SYMBOL] : void 0;
				_setConnectionAttributes(span, connectionContext);
				if (options.requestHook) try {
					options.requestHook(span, sanitizedSqlQuery, connectionContext);
				} catch (e) {
					span.setAttribute("sentry.hook.error", "requestHook failed");
					debugBuild.DEBUG_BUILD && debugLogger.debug.error("Error in requestHook for PostgresJs instrumentation:", e);
				}
				const queryWithCallbacks = this;
				queryWithCallbacks.resolve = new Proxy(queryWithCallbacks.resolve, { apply: (resolveTarget, resolveThisArg, resolveArgs) => {
					try {
						_setOperationName(span, sanitizedSqlQuery, resolveArgs?.[0]?.command);
						span.end();
					} catch (e) {
						debugBuild.DEBUG_BUILD && debugLogger.debug.error("Error ending span in resolve callback:", e);
					}
					return Reflect.apply(resolveTarget, resolveThisArg, resolveArgs);
				} });
				queryWithCallbacks.reject = new Proxy(queryWithCallbacks.reject, { apply: (rejectTarget, rejectThisArg, rejectArgs) => {
					try {
						span.setStatus({
							code: spanstatus.SPAN_STATUS_ERROR,
							message: rejectArgs?.[0]?.message || "unknown_error"
						});
						span.setAttribute("db.response.status_code", rejectArgs?.[0]?.code || "unknown");
						span.setAttribute("error.type", rejectArgs?.[0]?.name || "unknown");
						_setOperationName(span, sanitizedSqlQuery);
						span.end();
					} catch (e) {
						debugBuild.DEBUG_BUILD && debugLogger.debug.error("Error ending span in reject callback:", e);
					}
					return Reflect.apply(rejectTarget, rejectThisArg, rejectArgs);
				} });
				try {
					return originalHandle.apply(this, args);
				} catch (e) {
					span.setStatus({
						code: spanstatus.SPAN_STATUS_ERROR,
						message: e instanceof Error ? e.message : "unknown_error"
					});
					span.end();
					throw e;
				}
			});
		};
		wrappedHandle.__sentryWrapped = true;
		query.handle = wrappedHandle;
	}
	function _shouldCreateSpans(options) {
		return spanUtils.getActiveSpan() !== void 0 || !options.requireParentSpan;
	}
	function _reconstructQuery(strings) {
		if (!strings?.length) return;
		if (strings.length === 1) return strings[0] || void 0;
		return strings.reduce((acc, str, i) => i === 0 ? str : `${acc}$${i}${str}`, "");
	}
	let integerLiteralRE;
	function _sanitizeSqlQuery(sqlQuery) {
		if (!sqlQuery) return "Unknown SQL Query";
		if (!integerLiteralRE) integerLiteralRE = /* @__PURE__ */ new RegExp("(?<!\\$)-?\\b\\d+\\b", "g");
		return sqlQuery.replace(/--.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/;\s*$/, "").replace(/\s+/g, " ").trim().replace(/\bX'[0-9A-Fa-f]*'/gi, "?").replace(/\bB'[01]*'/gi, "?").replace(/'(?:[^']|'')*'/g, "?").replace(/\b0x[0-9A-Fa-f]+/gi, "?").replace(/\b(?:TRUE|FALSE)\b/gi, "?").replace(/-?\b\d+\.?\d*[eE][+-]?\d+\b/g, "?").replace(/-?\b\d+\.\d+\b/g, "?").replace(/-?\.\d+\b/g, "?").replace(integerLiteralRE, "?").replace(/\bIN\b\s*\(\s*\?(?:\s*,\s*\?)*\s*\)/gi, "IN (?)").replace(/\bIN\b\s*\(\s*\$\d+(?:\s*,\s*\$\d+)*\s*\)/gi, "IN ($?)");
	}
	function _setConnectionAttributes(span, connectionContext) {
		if (!connectionContext) return;
		if (connectionContext.ATTR_DB_NAMESPACE) span.setAttribute("db.namespace", connectionContext.ATTR_DB_NAMESPACE);
		if (connectionContext.ATTR_SERVER_ADDRESS) span.setAttribute("server.address", connectionContext.ATTR_SERVER_ADDRESS);
		if (connectionContext.ATTR_SERVER_PORT !== void 0) {
			const portNumber = parseInt(connectionContext.ATTR_SERVER_PORT, 10);
			if (!isNaN(portNumber)) span.setAttribute("server.port", portNumber);
		}
	}
	function _setOperationName(span, sanitizedQuery, command) {
		if (command) {
			span.setAttribute("db.operation.name", command);
			return;
		}
		const operationMatch = sanitizedQuery?.match(SQL_OPERATION_REGEX);
		if (operationMatch?.[1]) span.setAttribute("db.operation.name", operationMatch[1].toUpperCase());
	}
	function _attachConnectionContext(sql, proxiedSql) {
		const sqlInstance = sql;
		if (!sqlInstance.options || typeof sqlInstance.options !== "object") return;
		const opts = sqlInstance.options;
		const host = opts.host?.[0] || "localhost";
		const port = opts.port?.[0] || 5432;
		proxiedSql[CONNECTION_CONTEXT_SYMBOL] = {
			ATTR_DB_NAMESPACE: typeof opts.database === "string" && opts.database !== "" ? opts.database : void 0,
			ATTR_SERVER_ADDRESS: host,
			ATTR_SERVER_PORT: String(port)
		};
	}
	exports._reconstructQuery = _reconstructQuery;
	exports._sanitizeSqlQuery = _sanitizeSqlQuery;
	exports.instrumentPostgresJsSql = instrumentPostgresJsSql;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/sql.js
var require_sql = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const MAX_SUMMARY_LENGTH = 255;
	const TABLE_NAME = /[^\s(,;)]+/.source;
	const DDL_RE = new RegExp(`^\\s*(?<operation>(?:CREATE|DROP)\\s+(?:TABLE|INDEX)|ALTER\\s+TABLE)(?:\\s+IF\\s+(?:NOT\\s+)?EXISTS)?\\s+(?<table>${TABLE_NAME})`, "i");
	const INSERT_RE = new RegExp(`^\\s*(?<operation>INSERT)\\s+INTO\\s+(?<table>${TABLE_NAME})`, "i");
	const UPDATE_RE = new RegExp(`^\\s*(?<operation>UPDATE)\\s+(?<table>${TABLE_NAME})`, "i");
	const DELETE_RE = new RegExp(`^\\s*(?<operation>DELETE)\\s+FROM\\s+(?<table>${TABLE_NAME})`, "i");
	const SELECT_RE = /^\s*\(?\s*(?<operation>SELECT)\b/i;
	const PRAGMA_RE = /^\s*(?<operation>PRAGMA)\s+(?<command>\S+)/i;
	const TOKEN_RE = /\b(?:FROM|JOIN)\s+|\(\s*(SELECT)\b|\b(?:UNION|INTERSECT|EXCEPT|MINUS)\s+(?:ALL\s+)?(SELECT)\b/gi;
	const QUOTED_OR_PLAIN_TABLE_RE = /^(?:"[^"]*"|'[^']*'|[^\s(,;)]+)/;
	const COMMA_TABLE_RE = /^\s*,\s*((?:"[^"]*"|'[^']*'|[^\s(,;)]+))/;
	const SUBQUERY_SELECT_RE = /^\(\s*(SELECT)\b/i;
	function getSqlQuerySummary(query) {
		if (!query) return;
		const pragmaMatch = PRAGMA_RE.exec(query);
		if (pragmaMatch?.groups?.["operation"] && pragmaMatch.groups["command"]) {
			const operation = pragmaMatch.groups["operation"];
			const command = pragmaMatch.groups["command"];
			const parenIdx = command.indexOf("(");
			return truncate(`${operation} ${parenIdx >= 0 ? command.substring(0, parenIdx) : command}`);
		}
		const ddlMatch = DDL_RE.exec(query);
		if (ddlMatch?.groups?.["operation"] && ddlMatch.groups["table"]) return truncate(`${ddlMatch.groups["operation"]} ${ddlMatch.groups["table"]}`);
		const insertMatch = INSERT_RE.exec(query);
		if (insertMatch?.groups?.["operation"] && insertMatch.groups["table"]) {
			const parts = [insertMatch.groups["operation"], insertMatch.groups["table"]];
			const rest = query.slice(insertMatch[0].length);
			const subSelect = /\b(SELECT)\b/i.exec(rest);
			if (subSelect?.[1]) {
				parts.push(subSelect[1]);
				const selectTables = extractTableNames(rest.slice(subSelect.index));
				parts.push(...selectTables);
			}
			return truncate(parts.join(" "));
		}
		const updateMatch = UPDATE_RE.exec(query);
		if (updateMatch?.groups?.["operation"] && updateMatch.groups["table"]) return truncate(`${updateMatch.groups["operation"]} ${updateMatch.groups["table"]}`);
		const deleteMatch = DELETE_RE.exec(query);
		if (deleteMatch?.groups?.["operation"] && deleteMatch.groups["table"]) return truncate(`${deleteMatch.groups["operation"]} ${deleteMatch.groups["table"]}`);
		const selectMatch = SELECT_RE.exec(query);
		if (selectMatch?.groups?.["operation"]) {
			const tables = extractTableNames(query.slice(selectMatch[0].length));
			if (tables.length > 0) return truncate(`${selectMatch.groups["operation"]} ${tables.join(" ")}`);
			return selectMatch.groups["operation"];
		}
		return truncate(query.trim().split(/\s+/)[0] ?? query);
	}
	function extractTableNames(sql) {
		const tables = [];
		TOKEN_RE.lastIndex = 0;
		let match;
		while ((match = TOKEN_RE.exec(sql)) !== null) {
			if (match[1] || match[2]) {
				tables.push(match[1] || match[2]);
				continue;
			}
			const rest = sql.slice(match.index + match[0].length);
			const subqueryMatch = SUBQUERY_SELECT_RE.exec(rest);
			if (subqueryMatch?.[1]) {
				tables.push(subqueryMatch[1]);
				TOKEN_RE.lastIndex = match.index + match[0].length + subqueryMatch[0].length;
				continue;
			}
			const tableMatch = QUOTED_OR_PLAIN_TABLE_RE.exec(rest);
			if (!tableMatch) continue;
			tables.push(tableMatch[0]);
			let afterTable = rest.slice(tableMatch[0].length);
			let commaMatch;
			while ((commaMatch = COMMA_TABLE_RE.exec(afterTable)) !== null) {
				if (!commaMatch[1]) break;
				tables.push(commaMatch[1]);
				afterTable = afterTable.slice(commaMatch[0].length);
			}
		}
		return tables;
	}
	function truncate(summary) {
		if (summary.length <= MAX_SUMMARY_LENGTH) return summary;
		const truncated = summary.substring(0, MAX_SUMMARY_LENGTH);
		const lastSpace = truncated.lastIndexOf(" ");
		return lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated;
	}
	exports.getSqlQuerySummary = getSqlQuerySummary;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/http/constants.js
var require_constants = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const LOG_PREFIX = "@sentry/instrumentation-http";
	const HTTP_ON_CLIENT_REQUEST = "http.client.request.created";
	const HTTP_ON_SERVER_REQUEST = "http.server.request.start";
	exports.HTTP_ON_CLIENT_REQUEST = HTTP_ON_CLIENT_REQUEST;
	exports.HTTP_ON_SERVER_REQUEST = HTTP_ON_SERVER_REQUEST;
	exports.LOG_PREFIX = LOG_PREFIX;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/http/get-request-url.js
var require_get_request_url = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	function getRequestOptions(request) {
		const hostWithPort = request.host || "";
		const portInHost = /^(.*):(\d+)$/.exec(hostWithPort);
		const hostname = portInHost ? portInHost[1] : hostWithPort;
		const port = request.port ?? (portInHost ? Number(portInHost[2]) : void 0);
		return {
			method: request.method,
			port,
			protocol: request.protocol,
			host: request.host,
			hostname,
			path: request.path,
			headers: request.getHeaders()
		};
	}
	function getRequestUrl(requestOptions) {
		try {
			return String(getRequestUrlObject(requestOptions));
		} catch {
			return "";
		}
	}
	function getRequestUrlObject(requestOptions) {
		const protocol = requestOptions.protocol || "http:";
		const hostname = requestOptions.headers?.host && String(requestOptions.headers?.host) || requestOptions.hostname || requestOptions.host || "";
		const port = !requestOptions.port || requestOptions.port === 80 || requestOptions.port === 443 || /^(.*):(\d+)$/.test(hostname) ? "" : `:${requestOptions.port}`;
		const path = requestOptions.path ? requestOptions.path : "/";
		const base = `${protocol}//${hostname}${port}`;
		return new URL(path.startsWith("//") ? `${base}${path}` : path, base);
	}
	function getRequestUrlFromClientRequest(request) {
		return String(getRequestUrl(getRequestOptions(request)));
	}
	exports.getRequestOptions = getRequestOptions;
	exports.getRequestUrl = getRequestUrl;
	exports.getRequestUrlFromClientRequest = getRequestUrlFromClientRequest;
	exports.getRequestUrlObject = getRequestUrlObject;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/http/add-outgoing-request-breadcrumb.js
var require_add_outgoing_request_breadcrumb = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const breadcrumbs = require_breadcrumbs();
	const breadcrumbLogLevel = require_breadcrumb_log_level();
	const url = require_url();
	const getRequestUrl = require_get_request_url();
	function addOutgoingRequestBreadcrumb(request, response) {
		const url$1 = getRequestUrl.getRequestUrlFromClientRequest(request);
		const parsedUrl = url.parseUrl(url$1);
		const statusCode = response?.statusCode;
		const level = breadcrumbLogLevel.getBreadcrumbLogLevelFromHttpStatusCode(statusCode);
		breadcrumbs.addBreadcrumb({
			category: "http",
			data: {
				status_code: statusCode,
				url: url.getSanitizedUrlString(parsedUrl),
				"http.method": request.method || "GET",
				...parsedUrl.search ? { "http.query": parsedUrl.search } : {},
				...parsedUrl.hash ? { "http.fragment": parsedUrl.hash } : {}
			},
			type: "http",
			level
		}, {
			event: "response",
			request,
			response
		});
	}
	exports.addOutgoingRequestBreadcrumb = addOutgoingRequestBreadcrumb;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/http/get-outgoing-span-data.js
var require_get_outgoing_span_data = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const semanticAttributes = require_semanticAttributes();
	const url = require_url();
	const getRequestUrl = require_get_request_url();
	function getOutgoingRequestSpanData(request) {
		const url$1 = getRequestUrl.getRequestUrlFromClientRequest(request);
		const [name, attributes] = url.getHttpSpanDetailsFromUrlObject(url.parseStringToURLObject(url$1), "client", "auto.http.client", request);
		const userAgent = request.getHeader("user-agent");
		return {
			name,
			attributes: {
				[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_OP]: "http.client",
				"otel.kind": "CLIENT",
				"http.url": url$1,
				"http.method": request.method,
				"http.target": request.path || "/",
				"net.peer.name": request.host,
				"http.host": request.getHeader("host"),
				...userAgent ? { "user_agent.original": userAgent } : {},
				...attributes
			},
			onlyIfParent: true
		};
	}
	function setIncomingResponseSpanData(response, span) {
		const { statusCode, statusMessage, httpVersion, socket } = response;
		const transport = httpVersion?.toUpperCase() !== "QUIC" ? "ip_tcp" : "ip_udp";
		span.setAttributes({
			"http.response.status_code": statusCode,
			"network.protocol.version": httpVersion,
			"http.flavor": httpVersion,
			"network.transport": transport,
			"net.transport": transport,
			"http.status_text": statusMessage?.toUpperCase(),
			"http.status_code": statusCode,
			...getResponseContentLengthAttributes(response),
			...getSocketAttrs(socket)
		});
	}
	function getSocketAttrs(socket) {
		if (!socket) return {};
		const { remoteAddress, remotePort } = socket;
		return {
			"network.peer.address": remoteAddress,
			"network.peer.port": remotePort,
			"net.peer.ip": remoteAddress,
			"net.peer.port": remotePort
		};
	}
	function getResponseContentLengthAttributes(response) {
		const { headers } = response;
		const contentLengthHeader = headers["content-length"];
		const length = contentLengthHeader ? parseInt(String(contentLengthHeader), 10) : -1;
		const encoding = headers["content-encoding"];
		return length >= 0 ? encoding && encoding !== "identity" ? { "http.response_content_length": length } : { "http.response_content_length_uncompressed": length } : {};
	}
	exports.getOutgoingRequestSpanData = getOutgoingRequestSpanData;
	exports.setIncomingResponseSpanData = setIncomingResponseSpanData;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/http/inject-trace-propagation-headers.js
var require_inject_trace_propagation_headers = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const currentScopes = require_currentScopes();
	const debugBuild = require_debug_build();
	const debugLogger = require_debug_logger();
	const is = require_is();
	const traceData = require_traceData();
	const tracePropagationTargets = require_tracePropagationTargets();
	const constants = require_constants();
	const getRequestUrl = require_get_request_url();
	const baggage = require_baggage();
	function injectTracePropagationHeaders(request, propagationDecisionMap) {
		const url = getRequestUrl.getRequestUrlFromClientRequest(request);
		const { tracePropagationTargets: tracePropagationTargets$1, propagateTraceparent } = currentScopes.getClient()?.getOptions() ?? {};
		if (!tracePropagationTargets.shouldPropagateTraceForUrl(url, tracePropagationTargets$1, propagationDecisionMap)) return;
		if (!!request.getHeader("sentry-trace")) return;
		const traceData$1 = traceData.getTraceData({ propagateTraceparent });
		if (!traceData$1) return;
		const { "sentry-trace": sentryTrace, baggage: baggage$1, traceparent } = traceData$1;
		if (sentryTrace) try {
			request.setHeader("sentry-trace", sentryTrace);
			debugBuild.DEBUG_BUILD && debugLogger.debug.log(constants.LOG_PREFIX, "Added sentry-trace header");
		} catch (e) {
			debugBuild.DEBUG_BUILD && debugLogger.debug.error(constants.LOG_PREFIX, "Failed to set sentry-trace header:", is.isError(e) ? e.message : "Unknown error");
		}
		if (traceparent && !request.getHeader("traceparent")) try {
			request.setHeader("traceparent", traceparent);
			debugBuild.DEBUG_BUILD && debugLogger.debug.log(constants.LOG_PREFIX, "Added traceparent header");
		} catch (e) {
			debugBuild.DEBUG_BUILD && debugLogger.debug.error(constants.LOG_PREFIX, "Failed to set traceparent header:", is.isError(e) ? e.message : "Unknown error");
		}
		if (baggage$1) {
			const merged = baggage.mergeBaggageHeaders(request.getHeader("baggage"), baggage$1);
			if (merged) try {
				request.setHeader("baggage", merged);
				debugBuild.DEBUG_BUILD && debugLogger.debug.log(constants.LOG_PREFIX, "Added baggage header");
			} catch (e) {
				debugBuild.DEBUG_BUILD && debugLogger.debug.error(constants.LOG_PREFIX, "Failed to set baggage header:", is.isError(e) ? e.message : "Unknown error");
			}
		}
	}
	exports.injectTracePropagationHeaders = injectTracePropagationHeaders;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/http/double-wrap-warning.js
var require_double_wrap_warning = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const debugBuild = require_debug_build();
	const debugLogger = require_debug_logger();
	const isOtelWrapped = (fn) => typeof fn.__unwrap === "function";
	const warning = "Double-wrapped http.client detected. Either disable spans in Sentry.httpIntegration, or disable the OpenTelemetry HTTP instrumentation. See: https://docs.sentry.io/platforms/javascript/guides/express/opentelemetry/custom-setup/#custom-http-instrumentation";
	let didDoubleWrapWarning = false;
	exports.doubleWrapWarning = debugBuild.DEBUG_BUILD ? (http) => {
		if (!didDoubleWrapWarning) {
			if (isOtelWrapped(http.request) || isOtelWrapped(http.get)) {
				didDoubleWrapWarning = true;
				debugLogger.debug.warn(warning);
			}
		}
	} : () => {};
	exports.warning = warning;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/http/client-subscriptions.js
var require_client_subscriptions = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const addOutgoingRequestBreadcrumb = require_add_outgoing_request_breadcrumb();
	const debugBuild = require_debug_build();
	const debugLogger = require_debug_logger();
	const currentScopes = require_currentScopes();
	const spanstatus = require_spanstatus();
	const hasSpansEnabled = require_hasSpansEnabled();
	const trace = require_trace();
	const lru = require_lru();
	const getOutgoingSpanData = require_get_outgoing_span_data();
	const getRequestUrl = require_get_request_url();
	const injectTracePropagationHeaders = require_inject_trace_propagation_headers();
	const constants = require_constants();
	const doubleWrapWarning = require_double_wrap_warning();
	function getHttpClientSubscriptions(options) {
		const propagationDecisionMap = new lru.LRUMap(100);
		const getConfig = () => currentScopes.getClient()?.getOptions();
		const onHttpClientRequestCreated = (data) => {
			if (currentScopes.getCurrentScope().getScopeData().sdkProcessingMetadata[trace.SUPPRESS_TRACING_KEY] === true) return;
			const clientOptions = getConfig();
			const { errorMonitor = "error", spans: createSpans = clientOptions ? hasSpansEnabled.hasSpansEnabled(clientOptions) : true, propagateTrace = false, breadcrumbs = true, http, https, suppressOtelWarning = false } = options;
			const { request } = data;
			if (options.ignoreOutgoingRequests?.(getRequestUrl.getRequestUrlFromClientRequest(request), request)) return;
			let addedBreadcrumbs = false;
			function addBreadcrumbs(request2, response) {
				if (!addedBreadcrumbs) {
					addedBreadcrumbs = true;
					addOutgoingRequestBreadcrumb.addOutgoingRequestBreadcrumb(request2, response);
				}
			}
			function breadcrumbsOnly(request2) {
				request2.on(errorMonitor, () => addBreadcrumbs(request2, void 0));
				request2.prependListener("response", (response) => {
					if (request2.listenerCount("response") <= 1) response.resume();
					response.on("end", () => addBreadcrumbs(request2, response));
					response.on(errorMonitor, () => addBreadcrumbs(request2, response));
				});
			}
			if (!createSpans) {
				if (breadcrumbs) breadcrumbsOnly(request);
				if (propagateTrace) injectTracePropagationHeaders.injectTracePropagationHeaders(request, propagationDecisionMap);
				return;
			}
			if (!suppressOtelWarning) {
				if (http) doubleWrapWarning.doubleWrapWarning(http);
				if (https) doubleWrapWarning.doubleWrapWarning(https);
			}
			const span = trace.startInactiveSpan(getOutgoingSpanData.getOutgoingRequestSpanData(request));
			options.outgoingRequestHook?.(span, request);
			if (propagateTrace) if (span.isRecording()) trace.withActiveSpan(span, () => {
				injectTracePropagationHeaders.injectTracePropagationHeaders(request, propagationDecisionMap);
			});
			else injectTracePropagationHeaders.injectTracePropagationHeaders(request, propagationDecisionMap);
			let spanEnded = false;
			function endSpan(status) {
				if (!spanEnded) {
					spanEnded = true;
					span.setStatus(status);
					span.end();
				}
			}
			const requestOnClose = () => endSpan({ code: spanstatus.SPAN_STATUS_UNSET });
			request.on("close", requestOnClose);
			request.on(errorMonitor, (error) => {
				debugBuild.DEBUG_BUILD && debugLogger.debug.log(constants.LOG_PREFIX, "outgoingRequest on request error()", error);
				if (breadcrumbs) addBreadcrumbs(request, void 0);
				endSpan({ code: spanstatus.SPAN_STATUS_ERROR });
			});
			request.prependListener("response", (response) => {
				request.removeListener("close", requestOnClose);
				if (request.listenerCount("response") <= 1) response.resume();
				getOutgoingSpanData.setIncomingResponseSpanData(response, span);
				options.outgoingResponseHook?.(span, response);
				let finished = false;
				function finishWithResponse(error) {
					if (!finished) {
						finished = true;
						if (error) debugBuild.DEBUG_BUILD && debugLogger.debug.log(constants.LOG_PREFIX, "outgoingRequest on response error()", error);
						if (breadcrumbs) addBreadcrumbs(request, response);
						const aborted = response.aborted && !response.complete;
						const status = error || typeof response.statusCode !== "number" || aborted ? { code: spanstatus.SPAN_STATUS_ERROR } : spanstatus.getSpanStatusFromHttpCode(response.statusCode);
						options.applyCustomAttributesOnSpan?.(span, request, response);
						endSpan(status);
					}
				}
				response.on("end", () => finishWithResponse());
				response.on(errorMonitor, finishWithResponse);
			});
		};
		return { [constants.HTTP_ON_CLIENT_REQUEST]: onHttpClientRequestCreated };
	}
	exports.getHttpClientSubscriptions = getHttpClientSubscriptions;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/http/client-patch.js
var require_client_patch = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const getDefaultExport = require_get_default_export();
	const constants = require_constants();
	const object = require_object();
	const clientSubscriptions = require_client_subscriptions();
	function patchHttpRequest(httpModule, options) {
		if (!object.getOriginalFunction(httpModule.request)) {
			const { [constants.HTTP_ON_CLIENT_REQUEST]: onHttpClientRequestCreated } = clientSubscriptions.getHttpClientSubscriptions({
				...options,
				http: httpModule
			});
			const originalRequest = httpModule.request;
			object.wrapMethod(httpModule, "request", function patchedRequest(...args) {
				const request = originalRequest.apply(this, args);
				onHttpClientRequestCreated({ request }, constants.HTTP_ON_CLIENT_REQUEST);
				return request;
			});
		}
	}
	function patchHttpGet(httpModule) {
		if (!object.getOriginalFunction(httpModule.get)) object.wrapMethod(httpModule, "get", function patchedGet(input, options, cb) {
			const request = httpModule.request.call(this, input, options, cb);
			request.end();
			return request;
		});
	}
	function patchModule(httpModuleExport, options = {}) {
		const httpDefault = getDefaultExport.getDefaultExport(httpModuleExport);
		const httpModule = httpModuleExport;
		if (httpDefault !== httpModuleExport) {
			patchModule(httpDefault, options);
			for (const method of ["get", "request"]) {
				const desc = Object.getOwnPropertyDescriptor(httpDefault, method);
				if (desc) Object.defineProperty(httpModule, method, desc);
			}
			return httpModule;
		}
		patchHttpRequest(httpModule, options);
		patchHttpGet(httpModule);
		return httpModuleExport;
	}
	const patchHttpModuleClient = (httpModuleExport, options = {}) => patchModule(httpModuleExport, options);
	exports.patchHttpModuleClient = patchHttpModuleClient;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/http/patch-request-to-capture-body.js
var require_patch_request_to_capture_body = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const debugLogger = require_debug_logger();
	const debugBuild = require_debug_build();
	const request = require_request();
	function patchRequestToCaptureBody(req, isolationScope, maxIncomingRequestBodySize, integrationName) {
		let bodyByteLength = 0;
		const chunks = [];
		debugBuild.DEBUG_BUILD && debugLogger.debug.log(integrationName, "Patching request.on");
		const callbackMap = /* @__PURE__ */ new WeakMap();
		const maxBodySize = request.getMaxBodyByteLength(maxIncomingRequestBodySize);
		try {
			req.on = req.addListener = new Proxy(req.on, { apply: (target, thisArg, args) => {
				const [event, listener, ...restArgs] = args;
				if (event === "data") {
					debugBuild.DEBUG_BUILD && debugLogger.debug.log(integrationName, `Handling request.on("data") with maximum body size of ${maxBodySize}b`);
					const callback = new Proxy(listener, { apply: (target2, thisArg2, args2) => {
						try {
							const chunk = args2[0];
							const bufferifiedChunk = Buffer.from(chunk);
							if (bodyByteLength < maxBodySize) {
								chunks.push(bufferifiedChunk);
								bodyByteLength += bufferifiedChunk.byteLength;
							} else if (debugBuild.DEBUG_BUILD) debugLogger.debug.log(integrationName, `Dropping request body chunk because maximum body length of ${maxBodySize}b is exceeded.`);
						} catch (_err) {
							debugBuild.DEBUG_BUILD && debugLogger.debug.error(integrationName, "Encountered error while storing body chunk.");
						}
						return Reflect.apply(target2, thisArg2, args2);
					} });
					callbackMap.set(listener, callback);
					return Reflect.apply(target, thisArg, [
						event,
						callback,
						...restArgs
					]);
				}
				return Reflect.apply(target, thisArg, args);
			} });
			req.off = req.removeListener = new Proxy(req.off, { apply: (target, thisArg, args) => {
				const [, listener] = args;
				const callback = callbackMap.get(listener);
				if (callback) {
					callbackMap.delete(listener);
					const modifiedArgs = args.slice();
					modifiedArgs[1] = callback;
					return Reflect.apply(target, thisArg, modifiedArgs);
				}
				return Reflect.apply(target, thisArg, args);
			} });
			req.on("end", () => {
				try {
					const body = Buffer.concat(chunks).toString("utf-8");
					if (body) {
						const truncatedBody = Buffer.byteLength(body, "utf-8") > maxBodySize ? `${Buffer.from(body).subarray(0, maxBodySize - 3).toString("utf-8")}...` : body;
						isolationScope.setSDKProcessingMetadata({ normalizedRequest: { data: truncatedBody } });
					}
				} catch (error) {
					if (debugBuild.DEBUG_BUILD) debugLogger.debug.error(integrationName, "Error building captured request body", error);
				}
			});
		} catch (error) {
			if (debugBuild.DEBUG_BUILD) debugLogger.debug.error(integrationName, "Error patching request to capture body", error);
		}
	}
	exports.patchRequestToCaptureBody = patchRequestToCaptureBody;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/http/record-request-session.js
var require_record_request_session = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const debugLogger = require_debug_logger();
	const debugBuild = require_debug_build();
	const randomSafeContext = require_randomSafeContext();
	const timer = require_timer();
	const clientToRequestSessionAggregatesMap = /* @__PURE__ */ new WeakMap();
	function recordRequestSession(client, { requestIsolationScope, response, sessionFlushingDelayMS }) {
		requestIsolationScope.setSDKProcessingMetadata({ requestSession: { status: "ok" } });
		response.once("close", () => {
			const requestSession = requestIsolationScope.getScopeData().sdkProcessingMetadata.requestSession;
			if (client && requestSession) {
				debugBuild.DEBUG_BUILD && debugLogger.debug.log(`Recorded request session with status: ${requestSession.status}`);
				const roundedDate = new Date(randomSafeContext.safeDateNow());
				roundedDate.setSeconds(0, 0);
				const dateBucketKey = roundedDate.toISOString();
				const existingClientAggregate = clientToRequestSessionAggregatesMap.get(client);
				const bucket = existingClientAggregate?.[dateBucketKey] || {
					exited: 0,
					crashed: 0,
					errored: 0
				};
				bucket[{
					ok: "exited",
					crashed: "crashed",
					errored: "errored"
				}[requestSession.status]]++;
				if (existingClientAggregate) existingClientAggregate[dateBucketKey] = bucket;
				else {
					debugBuild.DEBUG_BUILD && debugLogger.debug.log("Opened new request session aggregate.");
					const newClientAggregate = { [dateBucketKey]: bucket };
					clientToRequestSessionAggregatesMap.set(client, newClientAggregate);
					const flushPendingClientAggregates = () => {
						clearTimeout(timeout);
						unregisterClientFlushHook();
						clientToRequestSessionAggregatesMap.delete(client);
						const aggregatePayload = Object.entries(newClientAggregate).map(([timestamp, value]) => ({
							started: timestamp,
							exited: value.exited,
							errored: value.errored,
							crashed: value.crashed
						}));
						client.sendSession({ aggregates: aggregatePayload });
					};
					const unregisterClientFlushHook = client.on("flush", () => {
						debugBuild.DEBUG_BUILD && debugLogger.debug.log("Sending request session aggregate due to client flush");
						flushPendingClientAggregates();
					});
					const timeout = setTimeout(() => {
						debugBuild.DEBUG_BUILD && debugLogger.debug.log("Sending request session aggregate due to flushing schedule");
						flushPendingClientAggregates();
					}, sessionFlushingDelayMS);
					timer.safeUnref(timeout);
				}
			}
		});
	}
	exports.recordRequestSession = recordRequestSession;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/integrations/http/server-subscription.js
var require_server_subscription = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const constants = require_constants();
	const debugBuild = require_debug_build();
	const debugLogger = require_debug_logger();
	const currentScopes = require_currentScopes();
	const hasSpansEnabled = require_hasSpansEnabled();
	const request = require_request();
	const patchRequestToCaptureBody = require_patch_request_to_capture_body();
	const url = require_url();
	const recordRequestSession = require_record_request_session();
	const propagationContext = require_propagationContext();
	const trace = require_trace();
	const randomSafeContext = require_randomSafeContext();
	const semanticAttributes = require_semanticAttributes();
	const spanstatus = require_spanstatus();
	const spanKind = require_spanKind();
	const INTEGRATION_NAME = "Http.Server";
	const SPANS_INTEGRATION_NAME = "Http.SentryServerSpans";
	const lastSentryEmitMap = /* @__PURE__ */ new WeakMap();
	const kRequestMark = /* @__PURE__ */ Symbol.for("sentry_http_server_instrumented");
	function markRequest(request) {
		return !request[kRequestMark] && (request[kRequestMark] = true);
	}
	function instrumentServer(options, server) {
		const currentEmit = server.emit;
		if (currentEmit === lastSentryEmitMap.get(server)) return;
		const newEmit = new Proxy(currentEmit, { apply(target, thisArg, args) {
			const [event, ...data] = args;
			if (event !== "request") return target.apply(thisArg, args);
			const client = currentScopes.getClient();
			const [request$1, response] = data;
			if (!client || !markRequest(request$1)) return target.apply(thisArg, args);
			debugBuild.DEBUG_BUILD && debugLogger.debug.log(INTEGRATION_NAME, "Handling incoming request");
			const isolationScope = currentScopes.getIsolationScope().clone();
			isolationScope.setClient(client);
			const ipAddress = request$1.socket?.remoteAddress;
			const url$1 = request$1.url || "/";
			const normalizedRequest = request.httpRequestToRequestData(request$1);
			const { maxRequestBodySize = "medium", ignoreRequestBody, sessions = true, sessionFlushingDelayMS = 6e4 } = options;
			if (maxRequestBodySize !== "none" && !ignoreRequestBody?.(url$1, request$1)) patchRequestToCaptureBody.patchRequestToCaptureBody(request$1, isolationScope, maxRequestBodySize, INTEGRATION_NAME);
			isolationScope.setSDKProcessingMetadata({
				normalizedRequest,
				ipAddress
			});
			const bestEffortTransactionName = `${(request$1.method || "GET").toUpperCase()} ${url.stripUrlQueryAndFragment(url$1)}`;
			isolationScope.setTransactionName(bestEffortTransactionName);
			if (sessions) recordRequestSession.recordRequestSession(client, {
				requestIsolationScope: isolationScope,
				response,
				sessionFlushingDelayMS: sessionFlushingDelayMS ?? 6e4
			});
			return currentScopes.withIsolationScope(isolationScope, () => {
				const sentryTrace = normalizedRequest.headers?.["sentry-trace"];
				const baggage = normalizedRequest.headers?.["baggage"];
				const sentryTraceValue = Array.isArray(sentryTrace) ? sentryTrace[0] : sentryTrace;
				return trace.continueTrace({
					sentryTrace: sentryTraceValue,
					baggage: Array.isArray(baggage) ? baggage[0] : baggage
				}, () => {
					const propagationContext$1 = currentScopes.getCurrentScope().getPropagationContext();
					propagationContext$1.propagationSpanId = propagationContext.generateSpanId();
					if (!sentryTraceValue) {
						propagationContext$1.traceId = propagationContext.generateTraceId();
						propagationContext$1.sampleRand = randomSafeContext.safeMathRandom();
					}
					response.once("close", () => {
						isolationScope.setContext("response", { status_code: response.statusCode });
					});
					const wrap = options.wrapServerEmitRequest;
					let emitResult = false;
					if (wrap) wrap(request$1, response, normalizedRequest, () => {
						emitResult = target.apply(thisArg, args);
					});
					else emitResult = target.apply(thisArg, args);
					return emitResult;
				});
			});
		} });
		lastSentryEmitMap.set(server, newEmit);
		server.emit = newEmit;
	}
	function getHttpServerSubscriptions(options) {
		const userWrap = options.wrapServerEmitRequest;
		const spanWrap = buildServerSpanWrap(options);
		const effectiveOptions = {
			...options,
			wrapServerEmitRequest(request, response, normalizedRequest, next) {
				const clientOptions = currentScopes.getClient()?.getOptions();
				if (options.spans ?? (clientOptions ? hasSpansEnabled.hasSpansEnabled(clientOptions) : false)) spanWrap(request, response, normalizedRequest, next);
				else if (userWrap) userWrap(request, response, normalizedRequest, next);
				else next();
			}
		};
		const onHttpServerRequest = (data) => {
			const { server } = data;
			instrumentServer(effectiveOptions, server);
		};
		return { [constants.HTTP_ON_SERVER_REQUEST]: onHttpServerRequest };
	}
	function buildServerSpanWrap(options) {
		const { wrapServerEmitRequest: userWrap, ignoreIncomingRequests, ignoreStaticAssets = true, onSpanCreated, errorMonitor = "error", onSpanEnd } = options;
		return (request$1, response, normalizedRequest, next) => {
			if (typeof __SENTRY_TRACING__ !== "undefined" && !__SENTRY_TRACING__) return next();
			return userWrap ? userWrap(request$1, response, normalizedRequest, createSpan) : createSpan();
			function createSpan() {
				const client = currentScopes.getIsolationScope().getClient();
				if (!client) return next();
				if (shouldIgnoreSpansForIncomingRequest(request$1, {
					ignoreStaticAssets,
					ignoreIncomingRequests
				})) {
					debugBuild.DEBUG_BUILD && debugLogger.debug.log(SPANS_INTEGRATION_NAME, "Skipping span creation for incoming request", request$1.url);
					return next();
				}
				const fullUrl = normalizedRequest.url || request$1.url || "/";
				const urlObj = url.parseStringToURLObject(fullUrl);
				const httpTargetWithoutQueryFragment = urlObj ? urlObj.pathname : url.stripUrlQueryAndFragment(fullUrl);
				const method = (request$1.method || "GET").toUpperCase();
				const name = `${method} ${httpTargetWithoutQueryFragment}`;
				const headers = request$1.headers;
				const userAgent = headers["user-agent"];
				const ips = headers["x-forwarded-for"];
				const httpVersion = request$1.httpVersion;
				const host = headers.host;
				const hostname = host?.replace(/^(.*)(:[0-9]{1,5})/, "$1") || "localhost";
				const scheme = fullUrl.startsWith("https") ? "https" : "http";
				const { socket } = request$1;
				const { localAddress, localPort, remoteAddress, remotePort } = socket ?? {};
				return trace.startSpanManual({
					name,
					kind: spanKind.SPAN_KIND.SERVER,
					attributes: {
						[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_OP]: "http.server",
						[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.server",
						[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: "url",
						"http.route": httpTargetWithoutQueryFragment,
						"otel.kind": "SERVER",
						"net.host.ip": localAddress,
						"net.host.port": localPort,
						"net.peer.ip": remoteAddress,
						"net.peer.port": remotePort,
						"sentry.http.prefetch": isKnownPrefetchRequest(request$1) || void 0,
						"http.url": fullUrl,
						"http.method": method,
						"http.target": urlObj ? `${urlObj.pathname}${urlObj.search}` : httpTargetWithoutQueryFragment,
						"http.host": host,
						"net.host.name": hostname,
						"http.client_ip": typeof ips === "string" ? ips.split(",")[0] : void 0,
						"http.user_agent": userAgent,
						"http.scheme": scheme,
						"http.flavor": httpVersion,
						"net.transport": httpVersion?.toUpperCase() === "QUIC" ? "ip_udp" : "ip_tcp",
						...getRequestContentLengthAttribute(request$1),
						...request.httpHeadersToSpanAttributes(normalizedRequest.headers || {}, client.getDataCollectionOptions())
					}
				}, (span) => {
					onSpanCreated?.(span, request$1, response);
					let isEnded = false;
					function endSpan(status) {
						if (isEnded) return;
						isEnded = true;
						span.setAttributes({
							"http.status_text": response.statusMessage?.toUpperCase(),
							"http.response.status_code": response.statusCode,
							"http.status_code": response.statusCode,
							...request.httpHeadersToSpanAttributes(request.headersToDict(response.headers), client?.getDataCollectionOptions() ?? false, "response")
						});
						span.setStatus(status);
						onSpanEnd?.(span, request$1, response);
						span.end();
					}
					response.once("close", () => {
						endSpan(spanstatus.getSpanStatusFromHttpCode(response.statusCode));
					});
					response.once(errorMonitor, () => {
						const httpStatus = spanstatus.getSpanStatusFromHttpCode(response.statusCode);
						endSpan(httpStatus.code === spanstatus.SPAN_STATUS_ERROR ? httpStatus : { code: spanstatus.SPAN_STATUS_ERROR });
					});
					next();
				});
			}
		};
	}
	function shouldIgnoreSpansForIncomingRequest(request, { ignoreStaticAssets, ignoreIncomingRequests }) {
		const urlPath = request.url;
		const method = request.method?.toUpperCase();
		if (method === "OPTIONS" || method === "HEAD" || !urlPath) return true;
		if (ignoreStaticAssets && method === "GET" && isStaticAssetRequest(urlPath)) return true;
		if (ignoreIncomingRequests?.(urlPath, request)) return true;
		return false;
	}
	function isStaticAssetRequest(urlPath) {
		const path = url.stripUrlQueryAndFragment(urlPath);
		if (path.match(/\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot|webp|avif)$/)) return true;
		if (path.match(/^\/(robots\.txt|sitemap\.xml|manifest\.json|browserconfig\.xml)$/)) return true;
		return false;
	}
	function isKnownPrefetchRequest(req) {
		return req.headers["next-router-prefetch"] === "1";
	}
	function getRequestContentLengthAttribute(request) {
		const { headers } = request;
		const contentLengthHeader = headers["content-length"];
		const length = contentLengthHeader ? parseInt(String(contentLengthHeader), 10) : -1;
		const encoding = headers["content-encoding"];
		return length >= 0 ? encoding && encoding !== "identity" ? { "http.request_content_length": length } : { "http.request_content_length_uncompressed": length } : {};
	}
	exports.getHttpServerSubscriptions = getHttpServerSubscriptions;
	exports.instrumentServer = instrumentServer;
	exports.isStaticAssetRequest = isStaticAssetRequest;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/utils/browser.js
var require_browser = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const is = require_is();
	const WINDOW = require_worldwide().GLOBAL_OBJ;
	const DEFAULT_MAX_STRING_LENGTH = 80;
	function htmlTreeAsString(elem, options = {}) {
		if (!elem) return "<unknown>";
		try {
			let currentElem = elem;
			const MAX_TRAVERSE_HEIGHT = 5;
			const out = [];
			let height = 0;
			let len = 0;
			const separator = " > ";
			const sepLength = 3;
			let nextStr;
			const keyAttrs = Array.isArray(options) ? options : options.keyAttrs;
			const maxStringLength = !Array.isArray(options) && options.maxStringLength || DEFAULT_MAX_STRING_LENGTH;
			while (currentElem && height++ < MAX_TRAVERSE_HEIGHT) {
				nextStr = _htmlElementAsString(currentElem, keyAttrs);
				if (nextStr === "html" || height > 1 && len + out.length * sepLength + nextStr.length >= maxStringLength) break;
				out.push(nextStr);
				len += nextStr.length;
				currentElem = currentElem.parentNode;
			}
			return out.reverse().join(separator);
		} catch {
			return "<unknown>";
		}
	}
	function _htmlElementAsString(el, keyAttrs) {
		const elem = el;
		const out = [];
		if (!elem?.tagName) return "";
		if (WINDOW.HTMLElement) {
			if (elem instanceof HTMLElement && elem.dataset) {
				if (elem.dataset["sentryComponent"]) return elem.dataset["sentryComponent"];
				if (elem.dataset["sentryElement"]) return elem.dataset["sentryElement"];
			}
		}
		out.push(elem.tagName.toLowerCase());
		const keyAttrPairs = keyAttrs?.length ? keyAttrs.filter((keyAttr) => elem.getAttribute(keyAttr)).map((keyAttr) => [keyAttr, elem.getAttribute(keyAttr)]) : null;
		if (keyAttrPairs?.length) keyAttrPairs.forEach((keyAttrPair) => {
			out.push(`[${keyAttrPair[0]}="${keyAttrPair[1]}"]`);
		});
		else {
			if (elem.id) out.push(`#${elem.id}`);
			const className = elem.className;
			if (className && is.isString(className)) {
				const classes = className.split(/\s+/);
				for (const c of classes) out.push(`.${c}`);
			}
		}
		for (const k of [
			"aria-label",
			"type",
			"name",
			"title",
			"alt"
		]) {
			const attr = elem.getAttribute(k);
			if (attr) out.push(`[${k}="${attr}"]`);
		}
		return out.join("");
	}
	function getLocationHref() {
		try {
			return WINDOW.document.location.href;
		} catch {
			return "";
		}
	}
	function getComponentName(elem, maxTraverseHeight = 5) {
		if (!WINDOW.HTMLElement) return null;
		let currentElem = elem;
		for (let i = 0; i < maxTraverseHeight; i++) {
			if (!currentElem) return null;
			if (currentElem instanceof HTMLElement) {
				if (currentElem.dataset["sentryComponent"]) return currentElem.dataset["sentryComponent"];
				if (currentElem.dataset["sentryElement"]) return currentElem.dataset["sentryElement"];
			}
			currentElem = currentElem.parentNode;
		}
		return null;
	}
	exports.getComponentName = getComponentName;
	exports.getLocationHref = getLocationHref;
	exports.htmlTreeAsString = htmlTreeAsString;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/tracing/langchain/embeddings.js
var require_embeddings = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const exports$1 = require_exports$1();
	const semanticAttributes = require_semanticAttributes();
	const trace = require_trace();
	const genAiAttributes = require_gen_ai_attributes();
	const utils = require_utils$7();
	const constants = require_constants$2();
	function inferSystemFromInstance(instance) {
		const name = instance.constructor?.name ?? "";
		if (name.includes("OpenAI")) return "openai";
		if (name.includes("Google")) return "google_genai";
		if (name.includes("Mistral")) return "mistralai";
		if (name.includes("Vertex")) return "google_vertexai";
		if (name.includes("Bedrock")) return "aws_bedrock";
		if (name.includes("Ollama")) return "ollama";
		if (name.includes("Cloudflare")) return "cloudflare";
		if (name.includes("Cohere")) return "cohere";
		return "langchain";
	}
	function extractEmbeddingAttributes(instance) {
		const embeddingsInstance = instance ?? {};
		const attributes = {
			[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: constants.LANGCHAIN_ORIGIN,
			[semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_OP]: genAiAttributes.GEN_AI_EMBEDDINGS_OPERATION_ATTRIBUTE,
			[genAiAttributes.GEN_AI_OPERATION_NAME_ATTRIBUTE]: "embeddings",
			[genAiAttributes.GEN_AI_REQUEST_MODEL_ATTRIBUTE]: embeddingsInstance.model ?? "unknown"
		};
		attributes[genAiAttributes.GEN_AI_SYSTEM_ATTRIBUTE] = inferSystemFromInstance(embeddingsInstance);
		if ("dimensions" in embeddingsInstance) attributes[genAiAttributes.GEN_AI_REQUEST_DIMENSIONS_ATTRIBUTE] = embeddingsInstance.dimensions;
		if ("encodingFormat" in embeddingsInstance) attributes[genAiAttributes.GEN_AI_REQUEST_ENCODING_FORMAT_ATTRIBUTE] = embeddingsInstance.encodingFormat;
		return attributes;
	}
	function instrumentEmbeddingMethod(originalMethod, options = {}) {
		const { recordInputs } = utils.resolveAIRecordingOptions(options);
		return new Proxy(originalMethod, { apply(target, thisArg, args) {
			const attributes = extractEmbeddingAttributes(thisArg);
			const modelName = attributes[genAiAttributes.GEN_AI_REQUEST_MODEL_ATTRIBUTE] || "unknown";
			if (recordInputs) {
				const input = args[0];
				if (input != null) attributes[genAiAttributes.GEN_AI_EMBEDDINGS_INPUT_ATTRIBUTE] = typeof input === "string" ? input : JSON.stringify(input);
			}
			return trace.startSpan({
				name: `embeddings ${modelName}`,
				op: genAiAttributes.GEN_AI_EMBEDDINGS_OPERATION_ATTRIBUTE,
				attributes
			}, () => {
				return Reflect.apply(target, thisArg, args).then(void 0, (error) => {
					exports$1.captureException(error, { mechanism: {
						handled: false,
						type: "auto.ai.langchain"
					} });
					throw error;
				});
			});
		} });
	}
	function instrumentLangChainEmbeddings(instance, options) {
		const embeddingsInstance = instance;
		if (typeof embeddingsInstance.embedQuery === "function") embeddingsInstance.embedQuery = instrumentEmbeddingMethod(embeddingsInstance.embedQuery, options);
		if (typeof embeddingsInstance.embedDocuments === "function") embeddingsInstance.embedDocuments = instrumentEmbeddingMethod(embeddingsInstance.embedDocuments, options);
		return instance;
	}
	exports.instrumentEmbeddingMethod = instrumentEmbeddingMethod;
	exports.instrumentLangChainEmbeddings = instrumentLangChainEmbeddings;
}));
//#endregion
//#region node_modules/@sentry/core/build/cjs/index.js
var require_cjs = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const errors = require_errors();
	const utils$2 = require_utils$9();
	const idleSpan = require_idleSpan();
	const sentrySpan = require_sentrySpan();
	const sentryNonRecordingSpan = require_sentryNonRecordingSpan();
	const spanstatus = require_spanstatus();
	const trace = require_trace();
	const bindScopeToEmitter = require_bindScopeToEmitter();
	const dynamicSamplingContext = require_dynamicSamplingContext();
	const measurement = require_measurement();
	const sampling = require_sampling();
	const logSpans = require_logSpans();
	const captureSpan = require_captureSpan();
	const semanticAttributes = require_semanticAttributes();
	const envelope$1 = require_envelope$3();
	const exports$1 = require_exports$1();
	const currentScopes = require_currentScopes();
	const defaultScopes = require_defaultScopes();
	const index = require_asyncContext();
	const carrier = require_carrier();
	const session = require_session();
	const scope = require_scope();
	const eventProcessors = require_eventProcessors();
	const api = require_api();
	const client = require_client();
	const sdk = require_sdk();
	const base = require_base();
	const offline = require_offline();
	const multiplexed = require_multiplexed();
	const integration = require_integration();
	const providerSkip = require_providerSkip();
	const filterKeyValueData = require_filterKeyValueData();
	const filterCookies = require_filterCookies();
	const filterQueryParams = require_filterQueryParams();
	const envToBool = require_envToBool();
	const scopeData = require_scopeData();
	const prepareEvent = require_prepareEvent();
	const checkin = require_checkin();
	const hasSpansEnabled = require_hasSpansEnabled();
	const beforeSendSpan = require_beforeSendSpan();
	const isSentryRequestUrl = require_isSentryRequestUrl();
	const handleCallbackErrors = require_handleCallbackErrors();
	const parameterize = require_parameterize();
	const tunnel = require_tunnel();
	const ipAddress = require_ipAddress();
	const spanUtils = require_spanUtils();
	const spanOnScope = require_spanOnScope();
	const parseSampleRate = require_parseSampleRate();
	const sdkMetadata = require_sdkMetadata();
	const traceData = require_traceData();
	const tracePropagationTargets = require_tracePropagationTargets();
	const meta = require_meta();
	const debounce = require_debounce();
	const weakRef = require_weakRef();
	const shouldIgnoreSpan = require_should_ignore_span();
	const request = require_request();
	const constants$1 = require_constants$8();
	const spanKind = require_spanKind();
	const breadcrumbs = require_breadcrumbs();
	const functiontostring = require_functiontostring();
	const eventFilters = require_eventFilters();
	const linkederrors = require_linkederrors();
	const moduleMetadata = require_moduleMetadata();
	const requestdata = require_requestdata();
	const captureconsole = require_captureconsole();
	const dedupe = require_dedupe();
	const extraerrordata = require_extraerrordata();
	const rewriteframes = require_rewriteframes();
	const supabase = require_supabase();
	const zoderrors = require_zoderrors();
	const thirdPartyErrorsFilter = require_third_party_errors_filter();
	const console$1 = require_console();
	const featureFlagsIntegration = require_featureFlagsIntegration();
	const growthbook = require_growthbook();
	const conversationId = require_conversationId();
	const profiling = require_profiling();
	const fetch = require_fetch$1();
	const feedback = require_feedback();
	const internal = require_internal$1();
	const publicApi = require_public_api$1();
	const consoleIntegration = require_console_integration();
	const internal$1 = require_internal();
	const publicApi$1 = require_public_api();
	const consola = require_consola();
	const index$1 = require_vercel_ai();
	const utils$3 = require_utils$7();
	const genAiAttributes = require_gen_ai_attributes();
	const utils = require_utils$6();
	const constants$7 = require_constants$6();
	const index$7 = require_openai();
	const constants$6 = require_constants$5();
	const index$4 = require_anthropic_ai();
	const constants = require_constants$4();
	const index$6 = require_google_genai();
	const constants$2 = require_constants$3();
	const index$2 = require_langchain();
	const utils$1 = require_utils$2();
	const constants$4 = require_constants$2();
	const index$5 = require_langgraph();
	const constants$5 = require_constants$1();
	const spanBuffer = require_spanBuffer();
	const hasSpanStreamingEnabled = require_hasSpanStreamingEnabled();
	const spanStreaming = require_spanStreaming();
	const featureFlags = require_featureFlags();
	const aggregateErrors = require_aggregate_errors();
	const breadcrumbLogLevel = require_breadcrumb_log_level();
	const dsn = require_dsn();
	const error = require_error();
	const worldwide = require_worldwide();
	const console = require_console$1();
	const fetch$1 = require_fetch();
	const globalError = require_globalError();
	const globalUnhandledRejection = require_globalUnhandledRejection();
	const handlers = require_handlers$1();
	const is = require_is();
	const isBrowser = require_isBrowser();
	const debugLogger = require_debug_logger();
	const misc = require_misc();
	const normalize = require_normalize();
	const normalizationHints = require_normalizationHints();
	const object = require_object();
	const path = require_path();
	const promisebuffer = require_promisebuffer();
	const severity = require_severity();
	const exports$2 = require_exports();
	const stacktrace = require_stacktrace();
	const string = require_string();
	const supports = require_supports();
	const syncpromise = require_syncpromise();
	const time = require_time();
	const tracing = require_tracing();
	const env = require_env();
	const envelope = require_envelope$4();
	const clientreport = require_clientreport();
	const ratelimit = require_ratelimit();
	const baggage = require_baggage();
	const url = require_url();
	const eventbuilder = require_eventbuilder();
	const lru = require_lru();
	const propagationContext = require_propagationContext();
	const version = require_version();
	const debugIds = require_debug_ids();
	const metadata = require_metadata();
	const escapeStringForRegex = require_escapeStringForRegex();
	const randomSafeContext = require_randomSafeContext();
	const serverRuntimeClient = require_server_runtime_client();
	const trpc = require_trpc();
	const index$8 = require_mcp_server();
	const node = require_node();
	const nodeStackTrace = require_node_stack_trace();
	const vercelWaitUntil = require_vercelWaitUntil();
	const flushIfServerless = require_flushIfServerless();
	const anr = require_anr();
	const timer = require_timer();
	const index$3 = require_express();
	const postgresjs = require_postgresjs();
	const sql = require_sql();
	const clientPatch = require_client_patch();
	const clientSubscriptions = require_client_subscriptions();
	const serverSubscription = require_server_subscription();
	const recordRequestSession = require_record_request_session();
	const addOutgoingRequestBreadcrumb = require_add_outgoing_request_breadcrumb();
	const getRequestUrl = require_get_request_url();
	const constants$3 = require_constants();
	const browser = require_browser();
	const embeddings = require_embeddings();
	exports.registerSpanErrorInstrumentation = errors.registerSpanErrorInstrumentation;
	exports.getCapturedScopesOnSpan = utils$2.getCapturedScopesOnSpan;
	exports.markSpanForOtelSourceInference = utils$2.markSpanForOtelSourceInference;
	exports.setCapturedScopesOnSpan = utils$2.setCapturedScopesOnSpan;
	exports.spanShouldInferOtelSource = utils$2.spanShouldInferOtelSource;
	exports.TRACING_DEFAULTS = idleSpan.TRACING_DEFAULTS;
	exports.startIdleSpan = idleSpan.startIdleSpan;
	exports.SentrySpan = sentrySpan.SentrySpan;
	exports.SentryNonRecordingSpan = sentryNonRecordingSpan.SentryNonRecordingSpan;
	exports.SPAN_STATUS_ERROR = spanstatus.SPAN_STATUS_ERROR;
	exports.SPAN_STATUS_OK = spanstatus.SPAN_STATUS_OK;
	exports.SPAN_STATUS_UNSET = spanstatus.SPAN_STATUS_UNSET;
	exports.getSpanStatusFromHttpCode = spanstatus.getSpanStatusFromHttpCode;
	exports.setHttpStatus = spanstatus.setHttpStatus;
	exports.SUPPRESS_TRACING_KEY = trace.SUPPRESS_TRACING_KEY;
	exports.continueTrace = trace.continueTrace;
	exports.startInactiveSpan = trace.startInactiveSpan;
	exports.startNewTrace = trace.startNewTrace;
	exports.startSpan = trace.startSpan;
	exports.startSpanManual = trace.startSpanManual;
	exports.suppressTracing = trace.suppressTracing;
	exports.withActiveSpan = trace.withActiveSpan;
	exports.bindScopeToEmitter = bindScopeToEmitter.bindScopeToEmitter;
	exports.getDynamicSamplingContextFromClient = dynamicSamplingContext.getDynamicSamplingContextFromClient;
	exports.getDynamicSamplingContextFromScope = dynamicSamplingContext.getDynamicSamplingContextFromScope;
	exports.getDynamicSamplingContextFromSpan = dynamicSamplingContext.getDynamicSamplingContextFromSpan;
	exports.spanToBaggageHeader = dynamicSamplingContext.spanToBaggageHeader;
	exports.setMeasurement = measurement.setMeasurement;
	exports.timedEventsToMeasurements = measurement.timedEventsToMeasurements;
	exports.sampleSpan = sampling.sampleSpan;
	exports.logSpanEnd = logSpans.logSpanEnd;
	exports.logSpanStart = logSpans.logSpanStart;
	exports.captureSpan = captureSpan.captureSpan;
	exports.safeSetSpanJSONAttributes = captureSpan.safeSetSpanJSONAttributes;
	exports.GEN_AI_CONVERSATION_ID_ATTRIBUTE = semanticAttributes.GEN_AI_CONVERSATION_ID_ATTRIBUTE;
	exports.SEMANTIC_ATTRIBUTE_CACHE_HIT = semanticAttributes.SEMANTIC_ATTRIBUTE_CACHE_HIT;
	exports.SEMANTIC_ATTRIBUTE_CACHE_ITEM_SIZE = semanticAttributes.SEMANTIC_ATTRIBUTE_CACHE_ITEM_SIZE;
	exports.SEMANTIC_ATTRIBUTE_CACHE_KEY = semanticAttributes.SEMANTIC_ATTRIBUTE_CACHE_KEY;
	exports.SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME = semanticAttributes.SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME;
	exports.SEMANTIC_ATTRIBUTE_HTTP_REQUEST_METHOD = semanticAttributes.SEMANTIC_ATTRIBUTE_HTTP_REQUEST_METHOD;
	exports.SEMANTIC_ATTRIBUTE_PROFILE_ID = semanticAttributes.SEMANTIC_ATTRIBUTE_PROFILE_ID;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME = semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_ENVIRONMENT = semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_ENVIRONMENT;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_IDLE_SPAN_FINISH_REASON = semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_IDLE_SPAN_FINISH_REASON;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_UNIT = semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_UNIT;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_VALUE = semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_VALUE;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_OP = semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_OP;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN = semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_PREVIOUS_TRACE_SAMPLE_RATE = semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_PREVIOUS_TRACE_SAMPLE_RATE;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_RELEASE = semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_RELEASE;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE = semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_SDK_INTEGRATIONS = semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_SDK_INTEGRATIONS;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_SDK_NAME = semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_SDK_NAME;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_SDK_VERSION = semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_SDK_VERSION;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_SEGMENT_ID = semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_SEGMENT_ID;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_SEGMENT_NAME = semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_SEGMENT_NAME;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE = semanticAttributes.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE;
	exports.SEMANTIC_ATTRIBUTE_URL_FULL = semanticAttributes.SEMANTIC_ATTRIBUTE_URL_FULL;
	exports.SEMANTIC_ATTRIBUTE_USER_EMAIL = semanticAttributes.SEMANTIC_ATTRIBUTE_USER_EMAIL;
	exports.SEMANTIC_ATTRIBUTE_USER_ID = semanticAttributes.SEMANTIC_ATTRIBUTE_USER_ID;
	exports.SEMANTIC_ATTRIBUTE_USER_IP_ADDRESS = semanticAttributes.SEMANTIC_ATTRIBUTE_USER_IP_ADDRESS;
	exports.SEMANTIC_ATTRIBUTE_USER_USERNAME = semanticAttributes.SEMANTIC_ATTRIBUTE_USER_USERNAME;
	exports.SEMANTIC_LINK_ATTRIBUTE_LINK_TYPE = semanticAttributes.SEMANTIC_LINK_ATTRIBUTE_LINK_TYPE;
	exports.createEventEnvelope = envelope$1.createEventEnvelope;
	exports.createSessionEnvelope = envelope$1.createSessionEnvelope;
	exports.createSpanEnvelope = envelope$1.createSpanEnvelope;
	exports.addEventProcessor = exports$1.addEventProcessor;
	exports.captureCheckIn = exports$1.captureCheckIn;
	exports.captureEvent = exports$1.captureEvent;
	exports.captureException = exports$1.captureException;
	exports.captureMessage = exports$1.captureMessage;
	exports.captureSession = exports$1.captureSession;
	exports.close = exports$1.close;
	exports.endSession = exports$1.endSession;
	exports.flush = exports$1.flush;
	exports.isEnabled = exports$1.isEnabled;
	exports.isInitialized = exports$1.isInitialized;
	exports.lastEventId = exports$1.lastEventId;
	exports.setAttribute = exports$1.setAttribute;
	exports.setAttributes = exports$1.setAttributes;
	exports.setContext = exports$1.setContext;
	exports.setConversationId = exports$1.setConversationId;
	exports.setExtra = exports$1.setExtra;
	exports.setExtras = exports$1.setExtras;
	exports.setTag = exports$1.setTag;
	exports.setTags = exports$1.setTags;
	exports.setUser = exports$1.setUser;
	exports.startSession = exports$1.startSession;
	exports.withMonitor = exports$1.withMonitor;
	exports.getClient = currentScopes.getClient;
	exports.getCurrentScope = currentScopes.getCurrentScope;
	exports.getExternalPropagationContext = currentScopes.getExternalPropagationContext;
	exports.getGlobalScope = currentScopes.getGlobalScope;
	exports.getIsolationScope = currentScopes.getIsolationScope;
	exports.getTraceContextFromScope = currentScopes.getTraceContextFromScope;
	exports.hasExternalPropagationContext = currentScopes.hasExternalPropagationContext;
	exports.registerExternalPropagationContext = currentScopes.registerExternalPropagationContext;
	exports.withIsolationScope = currentScopes.withIsolationScope;
	exports.withScope = currentScopes.withScope;
	exports.getDefaultCurrentScope = defaultScopes.getDefaultCurrentScope;
	exports.getDefaultIsolationScope = defaultScopes.getDefaultIsolationScope;
	exports._INTERNAL_createTracingChannelBinding = index._INTERNAL_createTracingChannelBinding;
	exports._INTERNAL_getTracingChannelBinding = index.getTracingChannelBinding;
	exports.setAsyncContextStrategy = index.setAsyncContextStrategy;
	exports.getGlobalSingleton = carrier.getGlobalSingleton;
	exports.getMainCarrier = carrier.getMainCarrier;
	exports.closeSession = session.closeSession;
	exports.makeSession = session.makeSession;
	exports.updateSession = session.updateSession;
	exports.Scope = scope.Scope;
	exports.notifyEventProcessors = eventProcessors.notifyEventProcessors;
	exports.SENTRY_API_VERSION = api.SENTRY_API_VERSION;
	exports.getEnvelopeEndpointWithUrlEncodedAuth = api.getEnvelopeEndpointWithUrlEncodedAuth;
	exports.getReportDialogEndpoint = api.getReportDialogEndpoint;
	exports.Client = client.Client;
	exports.initAndBind = sdk.initAndBind;
	exports.setCurrentClient = sdk.setCurrentClient;
	exports.createTransport = base.createTransport;
	exports.makeOfflineTransport = offline.makeOfflineTransport;
	exports.MULTIPLEXED_TRANSPORT_EXTRA_KEY = multiplexed.MULTIPLEXED_TRANSPORT_EXTRA_KEY;
	exports.makeMultiplexedTransport = multiplexed.makeMultiplexedTransport;
	exports.addIntegration = integration.addIntegration;
	exports.defineIntegration = integration.defineIntegration;
	exports.getIntegrationsToSetup = integration.getIntegrationsToSetup;
	exports.installedIntegrations = integration.installedIntegrations;
	exports._INTERNAL_clearAiProviderSkips = providerSkip._INTERNAL_clearAiProviderSkips;
	exports._INTERNAL_shouldSkipAiProviderWrapping = providerSkip._INTERNAL_shouldSkipAiProviderWrapping;
	exports._INTERNAL_skipAiProviderWrapping = providerSkip._INTERNAL_skipAiProviderWrapping;
	exports._INTERNAL_filterKeyValueData = filterKeyValueData.filterKeyValueData;
	exports._INTERNAL_filterCookies = filterCookies.filterCookies;
	exports._INTERNAL_filterQueryParams = filterQueryParams.filterQueryParams;
	exports.envToBool = envToBool.envToBool;
	exports.applyScopeDataToEvent = scopeData.applyScopeDataToEvent;
	exports.getCombinedScopeData = scopeData.getCombinedScopeData;
	exports.mergeScopeData = scopeData.mergeScopeData;
	exports.prepareEvent = prepareEvent.prepareEvent;
	exports.createCheckInEnvelope = checkin.createCheckInEnvelope;
	exports.hasSpansEnabled = hasSpansEnabled.hasSpansEnabled;
	exports.isStreamedBeforeSendSpanCallback = beforeSendSpan.isStreamedBeforeSendSpanCallback;
	exports.withStreamedSpan = beforeSendSpan.withStreamedSpan;
	exports.isSentryRequestUrl = isSentryRequestUrl.isSentryRequestUrl;
	exports.handleCallbackErrors = handleCallbackErrors.handleCallbackErrors;
	exports.fmt = parameterize.fmt;
	exports.parameterize = parameterize.parameterize;
	exports.handleTunnelRequest = tunnel.handleTunnelRequest;
	exports.addAutoIpAddressToSession = ipAddress.addAutoIpAddressToSession;
	exports.addAutoIpAddressToUser = ipAddress.addAutoIpAddressToUser;
	exports.INTERNAL_getSegmentSpan = spanUtils.INTERNAL_getSegmentSpan;
	exports.addChildSpanToSpan = spanUtils.addChildSpanToSpan;
	exports.convertSpanLinksForEnvelope = spanUtils.convertSpanLinksForEnvelope;
	exports.getActiveSpan = spanUtils.getActiveSpan;
	exports.getRootSpan = spanUtils.getRootSpan;
	exports.getSpanDescendants = spanUtils.getSpanDescendants;
	exports.getStatusMessage = spanUtils.getStatusMessage;
	exports.spanIsSampled = spanUtils.spanIsSampled;
	exports.spanTimeInputToSeconds = spanUtils.spanTimeInputToSeconds;
	exports.spanToJSON = spanUtils.spanToJSON;
	exports.spanToStreamedSpanJSON = spanUtils.spanToStreamedSpanJSON;
	exports.spanToTraceContext = spanUtils.spanToTraceContext;
	exports.spanToTraceHeader = spanUtils.spanToTraceHeader;
	exports.updateSpanName = spanUtils.updateSpanName;
	exports._INTERNAL_setSpanForScope = spanOnScope._setSpanForScope;
	exports.parseSampleRate = parseSampleRate.parseSampleRate;
	exports.applySdkMetadata = sdkMetadata.applySdkMetadata;
	exports.getTraceData = traceData.getTraceData;
	exports.shouldPropagateTraceForUrl = tracePropagationTargets.shouldPropagateTraceForUrl;
	exports.getTraceMetaTags = meta.getTraceMetaTags;
	exports.debounce = debounce.debounce;
	exports.derefWeakRef = weakRef.derefWeakRef;
	exports.makeWeakRef = weakRef.makeWeakRef;
	exports.shouldIgnoreSpan = shouldIgnoreSpan.shouldIgnoreSpan;
	exports.MAX_BODY_BYTE_LENGTH = request.MAX_BODY_BYTE_LENGTH;
	exports.captureBodyFromWinterCGRequest = request.captureBodyFromWinterCGRequest;
	exports.extractQueryParamsFromUrl = request.extractQueryParamsFromUrl;
	exports.getMaxBodyByteLength = request.getMaxBodyByteLength;
	exports.headersToDict = request.headersToDict;
	exports.httpHeadersToSpanAttributes = request.httpHeadersToSpanAttributes;
	exports.httpRequestToRequestData = request.httpRequestToRequestData;
	exports.winterCGHeadersToDict = request.winterCGHeadersToDict;
	exports.winterCGRequestToRequestData = request.winterCGRequestToRequestData;
	exports.DEFAULT_ENVIRONMENT = constants$1.DEFAULT_ENVIRONMENT;
	exports.DEV_ENVIRONMENT = constants$1.DEV_ENVIRONMENT;
	exports.SPAN_KIND = spanKind.SPAN_KIND;
	exports.spanKindToName = spanKind.spanKindToName;
	exports.addBreadcrumb = breadcrumbs.addBreadcrumb;
	exports.functionToStringIntegration = functiontostring.functionToStringIntegration;
	exports.eventFiltersIntegration = eventFilters.eventFiltersIntegration;
	exports.inboundFiltersIntegration = eventFilters.inboundFiltersIntegration;
	exports.linkedErrorsIntegration = linkederrors.linkedErrorsIntegration;
	exports.moduleMetadataIntegration = moduleMetadata.moduleMetadataIntegration;
	exports.requestDataIntegration = requestdata.requestDataIntegration;
	exports.captureConsoleIntegration = captureconsole.captureConsoleIntegration;
	exports.dedupeIntegration = dedupe.dedupeIntegration;
	exports.extraErrorDataIntegration = extraerrordata.extraErrorDataIntegration;
	exports.rewriteFramesIntegration = rewriteframes.rewriteFramesIntegration;
	exports.instrumentSupabaseClient = supabase.instrumentSupabaseClient;
	exports.supabaseIntegration = supabase.supabaseIntegration;
	exports.zodErrorsIntegration = zoderrors.zodErrorsIntegration;
	exports.thirdPartyErrorFilterIntegration = thirdPartyErrorsFilter.thirdPartyErrorFilterIntegration;
	exports.consoleIntegration = console$1.consoleIntegration;
	exports.featureFlagsIntegration = featureFlagsIntegration.featureFlagsIntegration;
	exports.growthbookIntegration = growthbook.growthbookIntegration;
	exports.conversationIdIntegration = conversationId.conversationIdIntegration;
	exports.profiler = profiling.profiler;
	exports._INTERNAL_getTracingHeadersForFetchRequest = fetch._INTERNAL_getTracingHeadersForFetchRequest;
	exports.instrumentFetchRequest = fetch.instrumentFetchRequest;
	exports.captureFeedback = feedback.captureFeedback;
	exports._INTERNAL_captureLog = internal._INTERNAL_captureLog;
	exports._INTERNAL_captureSerializedLog = internal._INTERNAL_captureSerializedLog;
	exports._INTERNAL_flushLogsBuffer = internal._INTERNAL_flushLogsBuffer;
	exports.logger = publicApi;
	exports.consoleLoggingIntegration = consoleIntegration.consoleLoggingIntegration;
	exports._INTERNAL_captureMetric = internal$1._INTERNAL_captureMetric;
	exports._INTERNAL_captureSerializedMetric = internal$1._INTERNAL_captureSerializedMetric;
	exports._INTERNAL_flushMetricsBuffer = internal$1._INTERNAL_flushMetricsBuffer;
	exports.metrics = publicApi$1;
	exports.createConsolaReporter = consola.createConsolaReporter;
	exports.addVercelAiProcessors = index$1.addVercelAiProcessors;
	exports.getProviderMetadataAttributes = index$1.getProviderMetadataAttributes;
	exports.getTruncatedJsonString = utils$3.getTruncatedJsonString;
	exports.shouldEnableTruncation = utils$3.shouldEnableTruncation;
	exports.GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE = genAiAttributes.GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE;
	exports.GEN_AI_SYSTEM_INSTRUCTIONS_ATTRIBUTE = genAiAttributes.GEN_AI_SYSTEM_INSTRUCTIONS_ATTRIBUTE;
	exports._INTERNAL_cleanupToolCallSpanContext = utils._INTERNAL_cleanupToolCallSpanContext;
	exports._INTERNAL_getSpanContextForToolCallId = utils._INTERNAL_getSpanContextForToolCallId;
	exports._INTERNAL_toolCallSpanContextMap = constants$7.toolCallSpanContextMap;
	exports.instrumentOpenAiClient = index$7.instrumentOpenAiClient;
	exports.OPENAI_INTEGRATION_NAME = constants$6.OPENAI_INTEGRATION_NAME;
	exports.instrumentAnthropicAiClient = index$4.instrumentAnthropicAiClient;
	exports.ANTHROPIC_AI_INTEGRATION_NAME = constants.ANTHROPIC_AI_INTEGRATION_NAME;
	exports.instrumentGoogleGenAIClient = index$6.instrumentGoogleGenAIClient;
	exports.GOOGLE_GENAI_INTEGRATION_NAME = constants$2.GOOGLE_GENAI_INTEGRATION_NAME;
	exports.createLangChainCallbackHandler = index$2.createLangChainCallbackHandler;
	exports._INTERNAL_mergeLangChainCallbackHandler = utils$1._INTERNAL_mergeLangChainCallbackHandler;
	exports.LANGCHAIN_INTEGRATION_NAME = constants$4.LANGCHAIN_INTEGRATION_NAME;
	exports.instrumentCreateReactAgent = index$5.instrumentCreateReactAgent;
	exports.instrumentLangGraph = index$5.instrumentLangGraph;
	exports.instrumentStateGraphCompile = index$5.instrumentStateGraphCompile;
	exports.LANGGRAPH_INTEGRATION_NAME = constants$5.LANGGRAPH_INTEGRATION_NAME;
	exports.SpanBuffer = spanBuffer.SpanBuffer;
	exports.hasSpanStreamingEnabled = hasSpanStreamingEnabled.hasSpanStreamingEnabled;
	exports.spanStreamingIntegration = spanStreaming.spanStreamingIntegration;
	exports._INTERNAL_FLAG_BUFFER_SIZE = featureFlags._INTERNAL_FLAG_BUFFER_SIZE;
	exports._INTERNAL_MAX_FLAGS_PER_SPAN = featureFlags._INTERNAL_MAX_FLAGS_PER_SPAN;
	exports._INTERNAL_addFeatureFlagToActiveSpan = featureFlags._INTERNAL_addFeatureFlagToActiveSpan;
	exports._INTERNAL_copyFlagsFromScopeToEvent = featureFlags._INTERNAL_copyFlagsFromScopeToEvent;
	exports._INTERNAL_insertFlagToScope = featureFlags._INTERNAL_insertFlagToScope;
	exports.applyAggregateErrorsToEvent = aggregateErrors.applyAggregateErrorsToEvent;
	exports.getBreadcrumbLogLevelFromHttpStatusCode = breadcrumbLogLevel.getBreadcrumbLogLevelFromHttpStatusCode;
	exports.dsnFromString = dsn.dsnFromString;
	exports.dsnToString = dsn.dsnToString;
	exports.makeDsn = dsn.makeDsn;
	exports.SentryError = error.SentryError;
	exports.GLOBAL_OBJ = worldwide.GLOBAL_OBJ;
	exports.addConsoleInstrumentationFilter = console.addConsoleInstrumentationFilter;
	exports.addConsoleInstrumentationHandler = console.addConsoleInstrumentationHandler;
	exports.addFetchEndInstrumentationHandler = fetch$1.addFetchEndInstrumentationHandler;
	exports.addFetchInstrumentationHandler = fetch$1.addFetchInstrumentationHandler;
	exports.addGlobalErrorInstrumentationHandler = globalError.addGlobalErrorInstrumentationHandler;
	exports.addGlobalUnhandledRejectionInstrumentationHandler = globalUnhandledRejection.addGlobalUnhandledRejectionInstrumentationHandler;
	exports.addHandler = handlers.addHandler;
	exports.maybeInstrument = handlers.maybeInstrument;
	exports.resetInstrumentationHandlers = handlers.resetInstrumentationHandlers;
	exports.triggerHandlers = handlers.triggerHandlers;
	exports.isDOMError = is.isDOMError;
	exports.isDOMException = is.isDOMException;
	exports.isElement = is.isElement;
	exports.isError = is.isError;
	exports.isErrorEvent = is.isErrorEvent;
	exports.isEvent = is.isEvent;
	exports.isInstanceOf = is.isInstanceOf;
	exports.isParameterizedString = is.isParameterizedString;
	exports.isPlainObject = is.isPlainObject;
	exports.isPrimitive = is.isPrimitive;
	exports.isRegExp = is.isRegExp;
	exports.isString = is.isString;
	exports.isSyntheticEvent = is.isSyntheticEvent;
	exports.isThenable = is.isThenable;
	exports.isVueViewModel = is.isVueViewModel;
	exports.isBrowser = isBrowser.isBrowser;
	exports.CONSOLE_LEVELS = debugLogger.CONSOLE_LEVELS;
	exports.consoleSandbox = debugLogger.consoleSandbox;
	exports.debug = debugLogger.debug;
	exports.originalConsoleMethods = debugLogger.originalConsoleMethods;
	exports.addContextToFrame = misc.addContextToFrame;
	exports.addExceptionMechanism = misc.addExceptionMechanism;
	exports.addExceptionTypeValue = misc.addExceptionTypeValue;
	exports.checkOrSetAlreadyCaught = misc.checkOrSetAlreadyCaught;
	exports.getEventDescription = misc.getEventDescription;
	exports.isAlreadyCaptured = misc.isAlreadyCaptured;
	exports.parseSemver = misc.parseSemver;
	exports.uuid4 = misc.uuid4;
	exports.normalize = normalize.normalize;
	exports.normalizeToSize = normalize.normalizeToSize;
	exports.normalizeUrlToBase = normalize.normalizeUrlToBase;
	exports.setNormalizeStringifier = normalize.setNormalizeStringifier;
	exports.setNormalizationDepthOverrideHint = normalizationHints.setNormalizationDepthOverrideHint;
	exports.setSkipNormalizationHint = normalizationHints.setSkipNormalizationHint;
	exports.addNonEnumerableProperty = object.addNonEnumerableProperty;
	exports.convertToPlainObject = object.convertToPlainObject;
	exports.dropUndefinedKeys = object.dropUndefinedKeys;
	exports.extractExceptionKeysForMessage = object.extractExceptionKeysForMessage;
	exports.fill = object.fill;
	exports.getOriginalFunction = object.getOriginalFunction;
	exports.markFunctionWrapped = object.markFunctionWrapped;
	exports.objectify = object.objectify;
	exports.basename = path.basename;
	exports.dirname = path.dirname;
	exports.isAbsolute = path.isAbsolute;
	exports.join = path.join;
	exports.normalizePath = path.normalizePath;
	exports.relative = path.relative;
	exports.resolve = path.resolve;
	exports.SENTRY_BUFFER_FULL_ERROR = promisebuffer.SENTRY_BUFFER_FULL_ERROR;
	exports.makePromiseBuffer = promisebuffer.makePromiseBuffer;
	exports.severityLevelFromString = severity.severityLevelFromString;
	exports.replaceExports = exports$2.replaceExports;
	exports.UNKNOWN_FUNCTION = stacktrace.UNKNOWN_FUNCTION;
	exports.createStackParser = stacktrace.createStackParser;
	exports.getFramesFromEvent = stacktrace.getFramesFromEvent;
	exports.getFunctionName = stacktrace.getFunctionName;
	exports.stackParserFromStackParserOptions = stacktrace.stackParserFromStackParserOptions;
	exports.stripSentryFramesAndReverse = stacktrace.stripSentryFramesAndReverse;
	exports.isMatchingPattern = string.isMatchingPattern;
	exports.safeJoin = string.safeJoin;
	exports.snipLine = string.snipLine;
	exports.stringMatchesSomePattern = string.stringMatchesSomePattern;
	exports.truncate = string.truncate;
	exports.isNativeFunction = supports.isNativeFunction;
	exports.supportsDOMError = supports.supportsDOMError;
	exports.supportsDOMException = supports.supportsDOMException;
	exports.supportsErrorEvent = supports.supportsErrorEvent;
	exports.supportsFetch = supports.supportsFetch;
	exports.supportsHistory = supports.supportsHistory;
	exports.supportsNativeFetch = supports.supportsNativeFetch;
	exports.supportsReferrerPolicy = supports.supportsReferrerPolicy;
	exports.supportsReportingObserver = supports.supportsReportingObserver;
	exports.SyncPromise = syncpromise.SyncPromise;
	exports.rejectedSyncPromise = syncpromise.rejectedSyncPromise;
	exports.resolvedSyncPromise = syncpromise.resolvedSyncPromise;
	exports.browserPerformanceTimeOrigin = time.browserPerformanceTimeOrigin;
	exports.dateTimestampInSeconds = time.dateTimestampInSeconds;
	exports.timestampInSeconds = time.timestampInSeconds;
	exports.TRACEPARENT_REGEXP = tracing.TRACEPARENT_REGEXP;
	exports.extractTraceparentData = tracing.extractTraceparentData;
	exports.generateSentryTraceHeader = tracing.generateSentryTraceHeader;
	exports.generateTraceparentHeader = tracing.generateTraceparentHeader;
	exports.propagationContextFromHeaders = tracing.propagationContextFromHeaders;
	exports.shouldContinueTrace = tracing.shouldContinueTrace;
	exports.getSDKSource = env.getSDKSource;
	exports.isBrowserBundle = env.isBrowserBundle;
	exports.addItemToEnvelope = envelope.addItemToEnvelope;
	exports.createAttachmentEnvelopeItem = envelope.createAttachmentEnvelopeItem;
	exports.createEnvelope = envelope.createEnvelope;
	exports.createEventEnvelopeHeaders = envelope.createEventEnvelopeHeaders;
	exports.createSpanEnvelopeItem = envelope.createSpanEnvelopeItem;
	exports.envelopeContainsItemType = envelope.envelopeContainsItemType;
	exports.envelopeItemTypeToDataCategory = envelope.envelopeItemTypeToDataCategory;
	exports.forEachEnvelopeItem = envelope.forEachEnvelopeItem;
	exports.getSdkMetadataForEnvelopeHeader = envelope.getSdkMetadataForEnvelopeHeader;
	exports.parseEnvelope = envelope.parseEnvelope;
	exports.serializeEnvelope = envelope.serializeEnvelope;
	exports.createClientReportEnvelope = clientreport.createClientReportEnvelope;
	exports.DEFAULT_RETRY_AFTER = ratelimit.DEFAULT_RETRY_AFTER;
	exports.disabledUntil = ratelimit.disabledUntil;
	exports.isRateLimited = ratelimit.isRateLimited;
	exports.parseRetryAfterHeader = ratelimit.parseRetryAfterHeader;
	exports.updateRateLimits = ratelimit.updateRateLimits;
	exports.MAX_BAGGAGE_STRING_LENGTH = baggage.MAX_BAGGAGE_STRING_LENGTH;
	exports.SENTRY_BAGGAGE_KEY_PREFIX = baggage.SENTRY_BAGGAGE_KEY_PREFIX;
	exports.SENTRY_BAGGAGE_KEY_PREFIX_REGEX = baggage.SENTRY_BAGGAGE_KEY_PREFIX_REGEX;
	exports.baggageHeaderToDynamicSamplingContext = baggage.baggageHeaderToDynamicSamplingContext;
	exports.dynamicSamplingContextToSentryBaggageHeader = baggage.dynamicSamplingContextToSentryBaggageHeader;
	exports.mergeBaggageHeaders = baggage.mergeBaggageHeaders;
	exports.objectToBaggageHeader = baggage.objectToBaggageHeader;
	exports.parseBaggageHeader = baggage.parseBaggageHeader;
	exports.getHttpSpanDetailsFromUrlObject = url.getHttpSpanDetailsFromUrlObject;
	exports.getSanitizedUrlString = url.getSanitizedUrlString;
	exports.getSanitizedUrlStringFromUrlObject = url.getSanitizedUrlStringFromUrlObject;
	exports.isURLObjectRelative = url.isURLObjectRelative;
	exports.parseStringToURLObject = url.parseStringToURLObject;
	exports.parseUrl = url.parseUrl;
	exports.stripDataUrlContent = url.stripDataUrlContent;
	exports.stripUrlQueryAndFragment = url.stripUrlQueryAndFragment;
	exports._INTERNAL_enhanceErrorWithSentryInfo = eventbuilder._enhanceErrorWithSentryInfo;
	exports.eventFromMessage = eventbuilder.eventFromMessage;
	exports.eventFromUnknownInput = eventbuilder.eventFromUnknownInput;
	exports.exceptionFromError = eventbuilder.exceptionFromError;
	exports.parseStackFrames = eventbuilder.parseStackFrames;
	exports.LRUMap = lru.LRUMap;
	exports.generateSpanId = propagationContext.generateSpanId;
	exports.generateTraceId = propagationContext.generateTraceId;
	exports.SDK_VERSION = version.SDK_VERSION;
	exports.getDebugImagesForResources = debugIds.getDebugImagesForResources;
	exports.getFilenameToDebugIdMap = debugIds.getFilenameToDebugIdMap;
	exports.getFilenameToMetadataMap = metadata.getFilenameToMetadataMap;
	exports.escapeStringForRegex = escapeStringForRegex.escapeStringForRegex;
	exports._INTERNAL_safeDateNow = randomSafeContext.safeDateNow;
	exports._INTERNAL_safeMathRandom = randomSafeContext.safeMathRandom;
	exports._INTERNAL_withRandomSafeContext = randomSafeContext.withRandomSafeContext;
	exports.ServerRuntimeClient = serverRuntimeClient.ServerRuntimeClient;
	exports.trpcMiddleware = trpc.trpcMiddleware;
	exports.wrapMcpServerWithSentry = index$8.wrapMcpServerWithSentry;
	exports.isNodeEnv = node.isNodeEnv;
	exports.loadModule = node.loadModule;
	exports.filenameIsInApp = nodeStackTrace.filenameIsInApp;
	exports.node = nodeStackTrace.node;
	exports.nodeStackLineParser = nodeStackTrace.nodeStackLineParser;
	exports.vercelWaitUntil = vercelWaitUntil.vercelWaitUntil;
	exports.flushIfServerless = flushIfServerless.flushIfServerless;
	exports.callFrameToStackFrame = anr.callFrameToStackFrame;
	exports.watchdogTimer = anr.watchdogTimer;
	exports._INTERNAL_safeUnref = timer.safeUnref;
	exports.expressErrorHandler = index$3.expressErrorHandler;
	exports.patchExpressModule = index$3.patchExpressModule;
	exports.setupExpressErrorHandler = index$3.setupExpressErrorHandler;
	exports._INTERNAL_sanitizeSqlQuery = postgresjs._sanitizeSqlQuery;
	exports.instrumentPostgresJsSql = postgresjs.instrumentPostgresJsSql;
	exports._INTERNAL_getSqlQuerySummary = sql.getSqlQuerySummary;
	exports.patchHttpModuleClient = clientPatch.patchHttpModuleClient;
	exports.getHttpClientSubscriptions = clientSubscriptions.getHttpClientSubscriptions;
	exports.getHttpServerSubscriptions = serverSubscription.getHttpServerSubscriptions;
	exports.isStaticAssetRequest = serverSubscription.isStaticAssetRequest;
	exports.recordRequestSession = recordRequestSession.recordRequestSession;
	exports.addOutgoingRequestBreadcrumb = addOutgoingRequestBreadcrumb.addOutgoingRequestBreadcrumb;
	exports.getRequestOptions = getRequestUrl.getRequestOptions;
	exports.getRequestUrl = getRequestUrl.getRequestUrl;
	exports.getRequestUrlFromClientRequest = getRequestUrl.getRequestUrlFromClientRequest;
	exports.getRequestUrlObject = getRequestUrl.getRequestUrlObject;
	exports.HTTP_ON_CLIENT_REQUEST = constants$3.HTTP_ON_CLIENT_REQUEST;
	exports.HTTP_ON_SERVER_REQUEST = constants$3.HTTP_ON_SERVER_REQUEST;
	exports.getComponentName = browser.getComponentName;
	exports.getLocationHref = browser.getLocationHref;
	exports.htmlTreeAsString = browser.htmlTreeAsString;
	exports.instrumentLangChainEmbeddings = embeddings.instrumentLangChainEmbeddings;
}));
//#endregion
export { require_cjs as t };
