import { fileURLToPath as __eveFileURLToPath } from "node:url";
import { dirname as __eveDirname } from "node:path";
__eveDirname(__eveFileURLToPath(import.meta.url));
import { t as __commonJSMin } from "../_runtime.mjs";
//#region node_modules/@opentelemetry/api-logs/build/src/types/LogRecord.js
var require_LogRecord = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SeverityNumber = void 0;
	(function(SeverityNumber) {
		SeverityNumber[SeverityNumber["UNSPECIFIED"] = 0] = "UNSPECIFIED";
		SeverityNumber[SeverityNumber["TRACE"] = 1] = "TRACE";
		SeverityNumber[SeverityNumber["TRACE2"] = 2] = "TRACE2";
		SeverityNumber[SeverityNumber["TRACE3"] = 3] = "TRACE3";
		SeverityNumber[SeverityNumber["TRACE4"] = 4] = "TRACE4";
		SeverityNumber[SeverityNumber["DEBUG"] = 5] = "DEBUG";
		SeverityNumber[SeverityNumber["DEBUG2"] = 6] = "DEBUG2";
		SeverityNumber[SeverityNumber["DEBUG3"] = 7] = "DEBUG3";
		SeverityNumber[SeverityNumber["DEBUG4"] = 8] = "DEBUG4";
		SeverityNumber[SeverityNumber["INFO"] = 9] = "INFO";
		SeverityNumber[SeverityNumber["INFO2"] = 10] = "INFO2";
		SeverityNumber[SeverityNumber["INFO3"] = 11] = "INFO3";
		SeverityNumber[SeverityNumber["INFO4"] = 12] = "INFO4";
		SeverityNumber[SeverityNumber["WARN"] = 13] = "WARN";
		SeverityNumber[SeverityNumber["WARN2"] = 14] = "WARN2";
		SeverityNumber[SeverityNumber["WARN3"] = 15] = "WARN3";
		SeverityNumber[SeverityNumber["WARN4"] = 16] = "WARN4";
		SeverityNumber[SeverityNumber["ERROR"] = 17] = "ERROR";
		SeverityNumber[SeverityNumber["ERROR2"] = 18] = "ERROR2";
		SeverityNumber[SeverityNumber["ERROR3"] = 19] = "ERROR3";
		SeverityNumber[SeverityNumber["ERROR4"] = 20] = "ERROR4";
		SeverityNumber[SeverityNumber["FATAL"] = 21] = "FATAL";
		SeverityNumber[SeverityNumber["FATAL2"] = 22] = "FATAL2";
		SeverityNumber[SeverityNumber["FATAL3"] = 23] = "FATAL3";
		SeverityNumber[SeverityNumber["FATAL4"] = 24] = "FATAL4";
	})(exports.SeverityNumber || (exports.SeverityNumber = {}));
}));
//#endregion
//#region node_modules/@opentelemetry/api-logs/build/src/NoopLogger.js
var require_NoopLogger = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.NOOP_LOGGER = exports.NoopLogger = void 0;
	var NoopLogger = class {
		emit(_logRecord) {}
	};
	exports.NoopLogger = NoopLogger;
	exports.NOOP_LOGGER = new NoopLogger();
}));
//#endregion
//#region node_modules/@opentelemetry/api-logs/build/src/internal/global-utils.js
var require_global_utils = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.API_BACKWARDS_COMPATIBILITY_VERSION = exports.makeGetter = exports._global = exports.GLOBAL_LOGS_API_KEY = void 0;
	exports.GLOBAL_LOGS_API_KEY = Symbol.for("io.opentelemetry.js.api.logs");
	exports._global = globalThis;
	/**
	* Make a function which accepts a version integer and returns the instance of an API if the version
	* is compatible, or a fallback version (usually NOOP) if it is not.
	*
	* @param requiredVersion Backwards compatibility version which is required to return the instance
	* @param instance Instance which should be returned if the required version is compatible
	* @param fallback Fallback instance, usually NOOP, which will be returned if the required version is not compatible
	*/
	function makeGetter(requiredVersion, instance, fallback) {
		return (version) => version === requiredVersion ? instance : fallback;
	}
	exports.makeGetter = makeGetter;
	/**
	* A number which should be incremented each time a backwards incompatible
	* change is made to the API. This number is used when an API package
	* attempts to access the global API to ensure it is getting a compatible
	* version. If the global API is not compatible with the API package
	* attempting to get it, a NOOP API implementation will be returned.
	*/
	exports.API_BACKWARDS_COMPATIBILITY_VERSION = 1;
}));
//#endregion
//#region node_modules/@opentelemetry/api-logs/build/src/NoopLoggerProvider.js
var require_NoopLoggerProvider = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.NOOP_LOGGER_PROVIDER = exports.NoopLoggerProvider = void 0;
	const NoopLogger_1 = require_NoopLogger();
	var NoopLoggerProvider = class {
		getLogger(_name, _version, _options) {
			return new NoopLogger_1.NoopLogger();
		}
	};
	exports.NoopLoggerProvider = NoopLoggerProvider;
	exports.NOOP_LOGGER_PROVIDER = new NoopLoggerProvider();
}));
//#endregion
//#region node_modules/@opentelemetry/api-logs/build/src/ProxyLogger.js
var require_ProxyLogger = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ProxyLogger = void 0;
	const NoopLogger_1 = require_NoopLogger();
	var ProxyLogger = class {
		constructor(provider, name, version, options) {
			this._provider = provider;
			this.name = name;
			this.version = version;
			this.options = options;
		}
		/**
		* Emit a log record. This method should only be used by log appenders.
		*
		* @param logRecord
		*/
		emit(logRecord) {
			this._getLogger().emit(logRecord);
		}
		/**
		* Try to get a logger from the proxy logger provider.
		* If the proxy logger provider has no delegate, return a noop logger.
		*/
		_getLogger() {
			if (this._delegate) return this._delegate;
			const logger = this._provider._getDelegateLogger(this.name, this.version, this.options);
			if (!logger) return NoopLogger_1.NOOP_LOGGER;
			this._delegate = logger;
			return this._delegate;
		}
	};
	exports.ProxyLogger = ProxyLogger;
}));
//#endregion
//#region node_modules/@opentelemetry/api-logs/build/src/ProxyLoggerProvider.js
var require_ProxyLoggerProvider = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ProxyLoggerProvider = void 0;
	const NoopLoggerProvider_1 = require_NoopLoggerProvider();
	const ProxyLogger_1 = require_ProxyLogger();
	var ProxyLoggerProvider = class {
		getLogger(name, version, options) {
			var _a;
			return (_a = this._getDelegateLogger(name, version, options)) !== null && _a !== void 0 ? _a : new ProxyLogger_1.ProxyLogger(this, name, version, options);
		}
		/**
		* Get the delegate logger provider.
		* Used by tests only.
		* @internal
		*/
		_getDelegate() {
			var _a;
			return (_a = this._delegate) !== null && _a !== void 0 ? _a : NoopLoggerProvider_1.NOOP_LOGGER_PROVIDER;
		}
		/**
		* Set the delegate logger provider
		* @internal
		*/
		_setDelegate(delegate) {
			this._delegate = delegate;
		}
		/**
		* @internal
		*/
		_getDelegateLogger(name, version, options) {
			var _a;
			return (_a = this._delegate) === null || _a === void 0 ? void 0 : _a.getLogger(name, version, options);
		}
	};
	exports.ProxyLoggerProvider = ProxyLoggerProvider;
}));
//#endregion
//#region node_modules/@opentelemetry/api-logs/build/src/api/logs.js
var require_logs = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.LogsAPI = void 0;
	const global_utils_1 = require_global_utils();
	const NoopLoggerProvider_1 = require_NoopLoggerProvider();
	const ProxyLoggerProvider_1 = require_ProxyLoggerProvider();
	exports.LogsAPI = class LogsAPI {
		constructor() {
			this._proxyLoggerProvider = new ProxyLoggerProvider_1.ProxyLoggerProvider();
		}
		static getInstance() {
			if (!this._instance) this._instance = new LogsAPI();
			return this._instance;
		}
		setGlobalLoggerProvider(provider) {
			if (global_utils_1._global[global_utils_1.GLOBAL_LOGS_API_KEY]) return this.getLoggerProvider();
			global_utils_1._global[global_utils_1.GLOBAL_LOGS_API_KEY] = (0, global_utils_1.makeGetter)(global_utils_1.API_BACKWARDS_COMPATIBILITY_VERSION, provider, NoopLoggerProvider_1.NOOP_LOGGER_PROVIDER);
			this._proxyLoggerProvider._setDelegate(provider);
			return provider;
		}
		/**
		* Returns the global logger provider.
		*
		* @returns LoggerProvider
		*/
		getLoggerProvider() {
			var _a, _b;
			return (_b = (_a = global_utils_1._global[global_utils_1.GLOBAL_LOGS_API_KEY]) === null || _a === void 0 ? void 0 : _a.call(global_utils_1._global, global_utils_1.API_BACKWARDS_COMPATIBILITY_VERSION)) !== null && _b !== void 0 ? _b : this._proxyLoggerProvider;
		}
		/**
		* Returns a logger from the global logger provider.
		*
		* @returns Logger
		*/
		getLogger(name, version, options) {
			return this.getLoggerProvider().getLogger(name, version, options);
		}
		/** Remove the global logger provider */
		disable() {
			delete global_utils_1._global[global_utils_1.GLOBAL_LOGS_API_KEY];
			this._proxyLoggerProvider = new ProxyLoggerProvider_1.ProxyLoggerProvider();
		}
	};
}));
//#endregion
//#region node_modules/@opentelemetry/api-logs/build/src/index.js
var require_src = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.logs = exports.NoopLogger = exports.NOOP_LOGGER = exports.SeverityNumber = void 0;
	var LogRecord_1 = require_LogRecord();
	Object.defineProperty(exports, "SeverityNumber", {
		enumerable: true,
		get: function() {
			return LogRecord_1.SeverityNumber;
		}
	});
	var NoopLogger_1 = require_NoopLogger();
	Object.defineProperty(exports, "NOOP_LOGGER", {
		enumerable: true,
		get: function() {
			return NoopLogger_1.NOOP_LOGGER;
		}
	});
	Object.defineProperty(exports, "NoopLogger", {
		enumerable: true,
		get: function() {
			return NoopLogger_1.NoopLogger;
		}
	});
	exports.logs = require_logs().LogsAPI.getInstance();
}));
//#endregion
export { require_src as t };
