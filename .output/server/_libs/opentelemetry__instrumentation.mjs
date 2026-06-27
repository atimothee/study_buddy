import { fileURLToPath as __eveFileURLToPath } from "node:url";
import { dirname as __eveDirname } from "node:path";
__eveDirname(__eveFileURLToPath(import.meta.url));
import { i as __require, t as __commonJSMin } from "../_runtime.mjs";
import { t as require_src$1 } from "./opentelemetry__api.mjs";
import { t as require_src$2 } from "./opentelemetry__api-logs.mjs";
//#region node_modules/@opentelemetry/instrumentation/build/src/autoLoaderUtils.js
var require_autoLoaderUtils = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.disableInstrumentations = exports.enableInstrumentations = void 0;
	/**
	* Enable instrumentations
	* @param instrumentations
	* @param tracerProvider
	* @param meterProvider
	*/
	function enableInstrumentations(instrumentations, tracerProvider, meterProvider, loggerProvider) {
		for (let i = 0, j = instrumentations.length; i < j; i++) {
			const instrumentation = instrumentations[i];
			if (tracerProvider) instrumentation.setTracerProvider(tracerProvider);
			if (meterProvider) instrumentation.setMeterProvider(meterProvider);
			if (loggerProvider && instrumentation.setLoggerProvider) instrumentation.setLoggerProvider(loggerProvider);
			if (!instrumentation.getConfig().enabled) instrumentation.enable();
		}
	}
	exports.enableInstrumentations = enableInstrumentations;
	/**
	* Disable instrumentations
	* @param instrumentations
	*/
	function disableInstrumentations(instrumentations) {
		instrumentations.forEach((instrumentation) => instrumentation.disable());
	}
	exports.disableInstrumentations = disableInstrumentations;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/build/src/autoLoader.js
var require_autoLoader = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.registerInstrumentations = void 0;
	const api_1 = require_src$1();
	const api_logs_1 = require_src$2();
	const autoLoaderUtils_1 = require_autoLoaderUtils();
	/**
	* It will register instrumentations and plugins
	* @param options
	* @return returns function to unload instrumentation and plugins that were
	*   registered
	*/
	function registerInstrumentations(options) {
		const tracerProvider = options.tracerProvider || api_1.trace.getTracerProvider();
		const meterProvider = options.meterProvider || api_1.metrics.getMeterProvider();
		const loggerProvider = options.loggerProvider || api_logs_1.logs.getLoggerProvider();
		const instrumentations = options.instrumentations?.flat() ?? [];
		(0, autoLoaderUtils_1.enableInstrumentations)(instrumentations, tracerProvider, meterProvider, loggerProvider);
		return () => {
			(0, autoLoaderUtils_1.disableInstrumentations)(instrumentations);
		};
	}
	exports.registerInstrumentations = registerInstrumentations;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/build/src/semver.js
var require_semver = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.satisfies = void 0;
	const api_1 = require_src$1();
	const VERSION_REGEXP = /^(?:v)?(?<version>(?<major>0|[1-9]\d*)\.(?<minor>0|[1-9]\d*)\.(?<patch>0|[1-9]\d*))(?:-(?<prerelease>(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+(?<build>[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
	const RANGE_REGEXP = /^(?<op><|>|=|==|<=|>=|~|\^|~>)?\s*(?:v)?(?<version>(?<major>x|X|\*|0|[1-9]\d*)(?:\.(?<minor>x|X|\*|0|[1-9]\d*))?(?:\.(?<patch>x|X|\*|0|[1-9]\d*))?)(?:-(?<prerelease>(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+(?<build>[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
	const operatorResMap = {
		">": [1],
		">=": [0, 1],
		"=": [0],
		"<=": [-1, 0],
		"<": [-1],
		"!=": [-1, 1]
	};
	/**
	* Checks given version whether it satisfies given range expression.
	* @param version the [version](https://github.com/npm/node-semver#versions) to be checked
	* @param range   the [range](https://github.com/npm/node-semver#ranges) expression for version check
	* @param options options to configure semver satisfy check
	*/
	function satisfies(version, range, options) {
		if (!_validateVersion(version)) {
			api_1.diag.error(`Invalid version: ${version}`);
			return false;
		}
		if (!range) return true;
		range = range.replace(/([<>=~^]+)\s+/g, "$1");
		const parsedVersion = _parseVersion(version);
		if (!parsedVersion) return false;
		const allParsedRanges = [];
		const checkResult = _doSatisfies(parsedVersion, range, allParsedRanges, options);
		if (checkResult && !options?.includePrerelease) return _doPreleaseCheck(parsedVersion, allParsedRanges);
		return checkResult;
	}
	exports.satisfies = satisfies;
	function _validateVersion(version) {
		return typeof version === "string" && VERSION_REGEXP.test(version);
	}
	function _doSatisfies(parsedVersion, range, allParsedRanges, options) {
		if (range.includes("||")) {
			const ranges = range.trim().split("||");
			for (const r of ranges) if (_checkRange(parsedVersion, r, allParsedRanges, options)) return true;
			return false;
		} else if (range.includes(" - ")) range = replaceHyphen(range, options);
		else if (range.includes(" ")) {
			const ranges = range.trim().replace(/\s{2,}/g, " ").split(" ");
			for (const r of ranges) if (!_checkRange(parsedVersion, r, allParsedRanges, options)) return false;
			return true;
		}
		return _checkRange(parsedVersion, range, allParsedRanges, options);
	}
	function _checkRange(parsedVersion, range, allParsedRanges, options) {
		range = _normalizeRange(range, options);
		if (range.includes(" ")) return _doSatisfies(parsedVersion, range, allParsedRanges, options);
		else {
			const parsedRange = _parseRange(range);
			allParsedRanges.push(parsedRange);
			return _satisfies(parsedVersion, parsedRange);
		}
	}
	function _satisfies(parsedVersion, parsedRange) {
		if (parsedRange.invalid) return false;
		if (!parsedRange.version || _isWildcard(parsedRange.version)) return true;
		let comparisonResult = _compareVersionSegments(parsedVersion.versionSegments || [], parsedRange.versionSegments || []);
		if (comparisonResult === 0) {
			const versionPrereleaseSegments = parsedVersion.prereleaseSegments || [];
			const rangePrereleaseSegments = parsedRange.prereleaseSegments || [];
			if (!versionPrereleaseSegments.length && !rangePrereleaseSegments.length) comparisonResult = 0;
			else if (!versionPrereleaseSegments.length && rangePrereleaseSegments.length) comparisonResult = 1;
			else if (versionPrereleaseSegments.length && !rangePrereleaseSegments.length) comparisonResult = -1;
			else comparisonResult = _compareVersionSegments(versionPrereleaseSegments, rangePrereleaseSegments);
		}
		return operatorResMap[parsedRange.op]?.includes(comparisonResult);
	}
	function _doPreleaseCheck(parsedVersion, allParsedRanges) {
		if (parsedVersion.prerelease) return allParsedRanges.some((r) => r.prerelease && r.version === parsedVersion.version);
		return true;
	}
	function _normalizeRange(range, options) {
		range = range.trim();
		range = replaceCaret(range, options);
		range = replaceTilde(range);
		range = replaceXRange(range, options);
		range = range.trim();
		return range;
	}
	function isX(id) {
		return !id || id.toLowerCase() === "x" || id === "*";
	}
	function _parseVersion(versionString) {
		const match = versionString.match(VERSION_REGEXP);
		if (!match) {
			api_1.diag.error(`Invalid version: ${versionString}`);
			return;
		}
		const version = match.groups.version;
		const prerelease = match.groups.prerelease;
		const build = match.groups.build;
		const versionSegments = version.split(".");
		const prereleaseSegments = prerelease?.split(".");
		return {
			op: void 0,
			version,
			versionSegments,
			versionSegmentCount: versionSegments.length,
			prerelease,
			prereleaseSegments,
			prereleaseSegmentCount: prereleaseSegments ? prereleaseSegments.length : 0,
			build
		};
	}
	function _parseRange(rangeString) {
		if (!rangeString) return {};
		const match = rangeString.match(RANGE_REGEXP);
		if (!match) {
			api_1.diag.error(`Invalid range: ${rangeString}`);
			return { invalid: true };
		}
		let op = match.groups.op;
		const version = match.groups.version;
		const prerelease = match.groups.prerelease;
		const build = match.groups.build;
		const versionSegments = version.split(".");
		const prereleaseSegments = prerelease?.split(".");
		if (op === "==") op = "=";
		return {
			op: op || "=",
			version,
			versionSegments,
			versionSegmentCount: versionSegments.length,
			prerelease,
			prereleaseSegments,
			prereleaseSegmentCount: prereleaseSegments ? prereleaseSegments.length : 0,
			build
		};
	}
	function _isWildcard(s) {
		return s === "*" || s === "x" || s === "X";
	}
	function _parseVersionString(v) {
		const n = parseInt(v, 10);
		return isNaN(n) ? v : n;
	}
	function _normalizeVersionType(a, b) {
		if (typeof a === typeof b) if (typeof a === "number") return [a, b];
		else if (typeof a === "string") return [a, b];
		else throw new Error("Version segments can only be strings or numbers");
		else return [String(a), String(b)];
	}
	function _compareVersionStrings(v1, v2) {
		if (_isWildcard(v1) || _isWildcard(v2)) return 0;
		const [parsedV1, parsedV2] = _normalizeVersionType(_parseVersionString(v1), _parseVersionString(v2));
		if (parsedV1 > parsedV2) return 1;
		else if (parsedV1 < parsedV2) return -1;
		return 0;
	}
	function _compareVersionSegments(v1, v2) {
		for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
			const res = _compareVersionStrings(v1[i] || "0", v2[i] || "0");
			if (res !== 0) return res;
		}
		return 0;
	}
	const LETTERDASHNUMBER = "[a-zA-Z0-9-]";
	const NUMERICIDENTIFIER = "0|[1-9]\\d*";
	const NONNUMERICIDENTIFIER = `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`;
	const GTLT = "((?:<|>)?=?)";
	const PRERELEASEIDENTIFIER = `(?:${NUMERICIDENTIFIER}|${NONNUMERICIDENTIFIER})`;
	const PRERELEASE = `(?:-(${PRERELEASEIDENTIFIER}(?:\\.${PRERELEASEIDENTIFIER})*))`;
	const BUILDIDENTIFIER = `${LETTERDASHNUMBER}+`;
	const BUILD = `(?:\\+(${BUILDIDENTIFIER}(?:\\.${BUILDIDENTIFIER})*))`;
	const XRANGEIDENTIFIER = `${NUMERICIDENTIFIER}|x|X|\\*`;
	const XRANGEPLAIN = `[v=\\s]*(${XRANGEIDENTIFIER})(?:\\.(${XRANGEIDENTIFIER})(?:\\.(${XRANGEIDENTIFIER})(?:${PRERELEASE})?${BUILD}?)?)?`;
	const XRANGE = `^${GTLT}\\s*${XRANGEPLAIN}$`;
	const XRANGE_REGEXP = new RegExp(XRANGE);
	const HYPHENRANGE = `^\\s*(${XRANGEPLAIN})\\s+-\\s+(${XRANGEPLAIN})\\s*$`;
	const HYPHENRANGE_REGEXP = new RegExp(HYPHENRANGE);
	const TILDE = `^(?:~>?)${XRANGEPLAIN}$`;
	const TILDE_REGEXP = new RegExp(TILDE);
	const CARET = `^(?:\\^)${XRANGEPLAIN}$`;
	const CARET_REGEXP = new RegExp(CARET);
	function replaceTilde(comp) {
		const r = TILDE_REGEXP;
		return comp.replace(r, (_, M, m, p, pr) => {
			let ret;
			if (isX(M)) ret = "";
			else if (isX(m)) ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
			else if (isX(p)) ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
			else if (pr) ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
			else ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
			return ret;
		});
	}
	function replaceCaret(comp, options) {
		const r = CARET_REGEXP;
		const z = options?.includePrerelease ? "-0" : "";
		return comp.replace(r, (_, M, m, p, pr) => {
			let ret;
			if (isX(M)) ret = "";
			else if (isX(m)) ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
			else if (isX(p)) if (M === "0") ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
			else ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
			else if (pr) if (M === "0") if (m === "0") ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
			else ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
			else ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
			else if (M === "0") if (m === "0") ret = `>=${M}.${m}.${p}${z} <${M}.${m}.${+p + 1}-0`;
			else ret = `>=${M}.${m}.${p}${z} <${M}.${+m + 1}.0-0`;
			else ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
			return ret;
		});
	}
	function replaceXRange(comp, options) {
		const r = XRANGE_REGEXP;
		return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
			const xM = isX(M);
			const xm = xM || isX(m);
			const xp = xm || isX(p);
			const anyX = xp;
			if (gtlt === "=" && anyX) gtlt = "";
			pr = options?.includePrerelease ? "-0" : "";
			if (xM) if (gtlt === ">" || gtlt === "<") ret = "<0.0.0-0";
			else ret = "*";
			else if (gtlt && anyX) {
				if (xm) m = 0;
				p = 0;
				if (gtlt === ">") {
					gtlt = ">=";
					if (xm) {
						M = +M + 1;
						m = 0;
						p = 0;
					} else {
						m = +m + 1;
						p = 0;
					}
				} else if (gtlt === "<=") {
					gtlt = "<";
					if (xm) M = +M + 1;
					else m = +m + 1;
				}
				if (gtlt === "<") pr = "-0";
				ret = `${gtlt + M}.${m}.${p}${pr}`;
			} else if (xm) ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
			else if (xp) ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
			return ret;
		});
	}
	function replaceHyphen(comp, options) {
		const r = HYPHENRANGE_REGEXP;
		return comp.replace(r, (_, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr) => {
			if (isX(fM)) from = "";
			else if (isX(fm)) from = `>=${fM}.0.0${options?.includePrerelease ? "-0" : ""}`;
			else if (isX(fp)) from = `>=${fM}.${fm}.0${options?.includePrerelease ? "-0" : ""}`;
			else if (fpr) from = `>=${from}`;
			else from = `>=${from}${options?.includePrerelease ? "-0" : ""}`;
			if (isX(tM)) to = "";
			else if (isX(tm)) to = `<${+tM + 1}.0.0-0`;
			else if (isX(tp)) to = `<${tM}.${+tm + 1}.0-0`;
			else if (tpr) to = `<=${tM}.${tm}.${tp}-${tpr}`;
			else if (options?.includePrerelease) to = `<${tM}.${tm}.${+tp + 1}-0`;
			else to = `<=${to}`;
			return `${from} ${to}`.trim();
		});
	}
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/build/src/shimmer.js
var require_shimmer = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.massUnwrap = exports.unwrap = exports.massWrap = exports.wrap = void 0;
	let logger = console.error.bind(console);
	function defineProperty(obj, name, value) {
		const enumerable = !!obj[name] && Object.prototype.propertyIsEnumerable.call(obj, name);
		Object.defineProperty(obj, name, {
			configurable: true,
			enumerable,
			writable: true,
			value
		});
	}
	const wrap = (nodule, name, wrapper) => {
		if (!nodule || !nodule[name]) {
			logger("no original function " + String(name) + " to wrap");
			return;
		}
		if (!wrapper) {
			logger("no wrapper function");
			logger((/* @__PURE__ */ new Error()).stack);
			return;
		}
		const original = nodule[name];
		if (typeof original !== "function" || typeof wrapper !== "function") {
			logger("original object and wrapper must be functions");
			return;
		}
		const wrapped = wrapper(original, name);
		defineProperty(wrapped, "__original", original);
		defineProperty(wrapped, "__unwrap", () => {
			if (nodule[name] === wrapped) defineProperty(nodule, name, original);
		});
		defineProperty(wrapped, "__wrapped", true);
		defineProperty(nodule, name, wrapped);
		return wrapped;
	};
	exports.wrap = wrap;
	const massWrap = (nodules, names, wrapper) => {
		if (!nodules) {
			logger("must provide one or more modules to patch");
			logger((/* @__PURE__ */ new Error()).stack);
			return;
		} else if (!Array.isArray(nodules)) nodules = [nodules];
		if (!(names && Array.isArray(names))) {
			logger("must provide one or more functions to wrap on modules");
			return;
		}
		nodules.forEach((nodule) => {
			names.forEach((name) => {
				(0, exports.wrap)(nodule, name, wrapper);
			});
		});
	};
	exports.massWrap = massWrap;
	const unwrap = (nodule, name) => {
		if (!nodule || !nodule[name]) {
			logger("no function to unwrap.");
			logger((/* @__PURE__ */ new Error()).stack);
			return;
		}
		const wrapped = nodule[name];
		if (!wrapped.__unwrap) logger("no original to unwrap to -- has " + String(name) + " already been unwrapped?");
		else {
			wrapped.__unwrap();
			return;
		}
	};
	exports.unwrap = unwrap;
	const massUnwrap = (nodules, names) => {
		if (!nodules) {
			logger("must provide one or more modules to patch");
			logger((/* @__PURE__ */ new Error()).stack);
			return;
		} else if (!Array.isArray(nodules)) nodules = [nodules];
		if (!(names && Array.isArray(names))) {
			logger("must provide one or more functions to unwrap on modules");
			return;
		}
		nodules.forEach((nodule) => {
			names.forEach((name) => {
				(0, exports.unwrap)(nodule, name);
			});
		});
	};
	exports.massUnwrap = massUnwrap;
	function shimmer(options) {
		if (options && options.logger) if (typeof options.logger !== "function") logger("new logger isn't a function, not replacing");
		else logger = options.logger;
	}
	exports.default = shimmer;
	shimmer.wrap = exports.wrap;
	shimmer.massWrap = exports.massWrap;
	shimmer.unwrap = exports.unwrap;
	shimmer.massUnwrap = exports.massUnwrap;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/build/src/instrumentation.js
var require_instrumentation$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.InstrumentationAbstract = void 0;
	const api_1 = require_src$1();
	const api_logs_1 = require_src$2();
	const shimmer = require_shimmer();
	/**
	* Base abstract internal class for instrumenting node and web plugins
	*/
	var InstrumentationAbstract = class {
		_config = {};
		_tracer;
		_meter;
		_logger;
		_diag;
		instrumentationName;
		instrumentationVersion;
		constructor(instrumentationName, instrumentationVersion, config) {
			this.instrumentationName = instrumentationName;
			this.instrumentationVersion = instrumentationVersion;
			this.setConfig(config);
			this._diag = api_1.diag.createComponentLogger({ namespace: instrumentationName });
			this._tracer = api_1.trace.getTracer(instrumentationName, instrumentationVersion);
			this._meter = api_1.metrics.getMeter(instrumentationName, instrumentationVersion);
			this._logger = api_logs_1.logs.getLogger(instrumentationName, instrumentationVersion);
			this._updateMetricInstruments();
		}
		_wrap = shimmer.wrap;
		_unwrap = shimmer.unwrap;
		_massWrap = shimmer.massWrap;
		_massUnwrap = shimmer.massUnwrap;
		get meter() {
			return this._meter;
		}
		/**
		* Sets MeterProvider to this plugin
		* @param meterProvider
		*/
		setMeterProvider(meterProvider) {
			this._meter = meterProvider.getMeter(this.instrumentationName, this.instrumentationVersion);
			this._updateMetricInstruments();
		}
		get logger() {
			return this._logger;
		}
		/**
		* Sets LoggerProvider to this plugin
		* @param loggerProvider
		*/
		setLoggerProvider(loggerProvider) {
			this._logger = loggerProvider.getLogger(this.instrumentationName, this.instrumentationVersion);
		}
		/**
		* @experimental
		*
		* Get module definitions defined by {@link init}.
		* This can be used for experimental compile-time instrumentation.
		*
		* @returns an array of {@link InstrumentationModuleDefinition}
		*/
		getModuleDefinitions() {
			const initResult = this.init() ?? [];
			if (!Array.isArray(initResult)) return [initResult];
			return initResult;
		}
		/**
		* Sets the new metric instruments with the current Meter.
		*/
		_updateMetricInstruments() {}
		getConfig() {
			return this._config;
		}
		/**
		* Sets InstrumentationConfig to this plugin
		* @param config
		*/
		setConfig(config) {
			this._config = {
				enabled: true,
				...config
			};
		}
		/**
		* Sets TraceProvider to this plugin
		* @param tracerProvider
		*/
		setTracerProvider(tracerProvider) {
			this._tracer = tracerProvider.getTracer(this.instrumentationName, this.instrumentationVersion);
		}
		get tracer() {
			return this._tracer;
		}
		/**
		* Execute span customization hook, if configured, and log any errors.
		* Any semantics of the trigger and info are defined by the specific instrumentation.
		* @param hookHandler The optional hook handler which the user has configured via instrumentation config
		* @param triggerName The name of the trigger for executing the hook for logging purposes
		* @param span The span to which the hook should be applied
		* @param info The info object to be passed to the hook, with useful data the hook may use
		*/
		_runSpanCustomizationHook(hookHandler, triggerName, span, info) {
			if (!hookHandler) return;
			try {
				hookHandler(span, info);
			} catch (e) {
				this._diag.error(`Error running span customization hook due to exception in handler`, { triggerName }, e);
			}
		}
	};
	exports.InstrumentationAbstract = InstrumentationAbstract;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/build/src/platform/node/ModuleNameTrie.js
var require_ModuleNameTrie = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ModuleNameTrie = exports.ModuleNameSeparator = void 0;
	exports.ModuleNameSeparator = "/";
	/**
	* Node in a `ModuleNameTrie`
	*/
	var ModuleNameTrieNode = class {
		hooks = [];
		children = /* @__PURE__ */ new Map();
	};
	/**
	* Trie containing nodes that represent a part of a module name (i.e. the parts separated by forward slash)
	*/
	var ModuleNameTrie = class {
		_trie = new ModuleNameTrieNode();
		_counter = 0;
		/**
		* Insert a module hook into the trie
		*
		* @param {Hooked} hook Hook
		*/
		insert(hook) {
			let trieNode = this._trie;
			for (const moduleNamePart of hook.moduleName.split(exports.ModuleNameSeparator)) {
				let nextNode = trieNode.children.get(moduleNamePart);
				if (!nextNode) {
					nextNode = new ModuleNameTrieNode();
					trieNode.children.set(moduleNamePart, nextNode);
				}
				trieNode = nextNode;
			}
			trieNode.hooks.push({
				hook,
				insertedId: this._counter++
			});
		}
		/**
		* Search for matching hooks in the trie
		*
		* @param {string} moduleName Module name
		* @param {boolean} maintainInsertionOrder Whether to return the results in insertion order
		* @param {boolean} fullOnly Whether to return only full matches
		* @returns {Hooked[]} Matching hooks
		*/
		search(moduleName, { maintainInsertionOrder, fullOnly } = {}) {
			let trieNode = this._trie;
			const results = [];
			let foundFull = true;
			for (const moduleNamePart of moduleName.split(exports.ModuleNameSeparator)) {
				const nextNode = trieNode.children.get(moduleNamePart);
				if (!nextNode) {
					foundFull = false;
					break;
				}
				if (!fullOnly) results.push(...nextNode.hooks);
				trieNode = nextNode;
			}
			if (fullOnly && foundFull) results.push(...trieNode.hooks);
			if (results.length === 0) return [];
			if (results.length === 1) return [results[0].hook];
			if (maintainInsertionOrder) results.sort((a, b) => a.insertedId - b.insertedId);
			return results.map(({ hook }) => hook);
		}
	};
	exports.ModuleNameTrie = ModuleNameTrie;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/build/src/platform/node/RequireInTheMiddleSingleton.js
var require_RequireInTheMiddleSingleton = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.RequireInTheMiddleSingleton = void 0;
	const require_in_the_middle_1$1 = __require("require-in-the-middle");
	const path$1 = __require("path");
	const ModuleNameTrie_1 = require_ModuleNameTrie();
	/**
	* Whether Mocha is running in this process
	* Inspired by https://github.com/AndreasPizsa/detect-mocha
	*
	* @type {boolean}
	*/
	const isMocha = [
		"afterEach",
		"after",
		"beforeEach",
		"before",
		"describe",
		"it"
	].every((fn) => {
		return typeof global[fn] === "function";
	});
	exports.RequireInTheMiddleSingleton = class RequireInTheMiddleSingleton {
		_moduleNameTrie = new ModuleNameTrie_1.ModuleNameTrie();
		static _instance;
		constructor() {
			this._initialize();
		}
		_initialize() {
			new require_in_the_middle_1$1.Hook(null, { internals: true }, (exports$4, name, basedir) => {
				const normalizedModuleName = normalizePathSeparators(name);
				const matches = this._moduleNameTrie.search(normalizedModuleName, {
					maintainInsertionOrder: true,
					fullOnly: basedir === void 0
				});
				for (const { onRequire } of matches) exports$4 = onRequire(exports$4, name, basedir);
				return exports$4;
			});
		}
		/**
		* Register a hook with `require-in-the-middle`
		*
		* @param {string} moduleName Module name
		* @param {OnRequireFn} onRequire Hook function
		* @returns {Hooked} Registered hook
		*/
		register(moduleName, onRequire) {
			const hooked = {
				moduleName,
				onRequire
			};
			this._moduleNameTrie.insert(hooked);
			return hooked;
		}
		/**
		* Get the `RequireInTheMiddleSingleton` singleton
		*
		* @returns {RequireInTheMiddleSingleton} Singleton of `RequireInTheMiddleSingleton`
		*/
		static getInstance() {
			if (isMocha) return new RequireInTheMiddleSingleton();
			return this._instance = this._instance ?? new RequireInTheMiddleSingleton();
		}
	};
	/**
	* Normalize the path separators to forward slash in a module name or path
	*
	* @param {string} moduleNameOrPath Module name or path
	* @returns {string} Normalized module name or path
	*/
	function normalizePathSeparators(moduleNameOrPath) {
		return path$1.sep !== ModuleNameTrie_1.ModuleNameSeparator ? moduleNameOrPath.split(path$1.sep).join(ModuleNameTrie_1.ModuleNameSeparator) : moduleNameOrPath;
	}
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/build/src/utils.js
var require_utils = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isWrapped = exports.safeExecuteInTheMiddleAsync = exports.safeExecuteInTheMiddle = void 0;
	/**
	* function to execute patched function and being able to catch errors
	* @param execute - function to be executed
	* @param onFinish - callback to run when execute finishes
	*/
	function safeExecuteInTheMiddle(execute, onFinish, preventThrowingError) {
		let error;
		let result;
		try {
			result = execute();
		} catch (e) {
			error = e;
		} finally {
			onFinish(error, result);
			if (error && !preventThrowingError) throw error;
			return result;
		}
	}
	exports.safeExecuteInTheMiddle = safeExecuteInTheMiddle;
	/**
	* Async function to execute patched function and being able to catch errors
	* @param execute - function to be executed
	* @param onFinish - callback to run when execute finishes
	*/
	async function safeExecuteInTheMiddleAsync(execute, onFinish, preventThrowingError) {
		let error;
		let result;
		try {
			result = await execute();
		} catch (e) {
			error = e;
		} finally {
			await onFinish(error, result);
			if (error && !preventThrowingError) throw error;
			return result;
		}
	}
	exports.safeExecuteInTheMiddleAsync = safeExecuteInTheMiddleAsync;
	/**
	* Checks if certain function has been already wrapped
	* @param func
	*/
	function isWrapped(func) {
		return typeof func === "function" && typeof func.__original === "function" && typeof func.__unwrap === "function" && func.__wrapped === true;
	}
	exports.isWrapped = isWrapped;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/build/src/platform/node/instrumentation.js
var require_instrumentation = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.InstrumentationBase = void 0;
	const path = __require("path");
	const util_1 = __require("util");
	const semver_1 = require_semver();
	const shimmer_1 = require_shimmer();
	const instrumentation_1 = require_instrumentation$1();
	const RequireInTheMiddleSingleton_1 = require_RequireInTheMiddleSingleton();
	const import_in_the_middle_1 = __require("import-in-the-middle");
	const api_1 = require_src$1();
	const require_in_the_middle_1 = __require("require-in-the-middle");
	const fs_1 = __require("fs");
	const utils_1 = require_utils();
	/**
	* Base abstract class for instrumenting node plugins
	*/
	var InstrumentationBase = class extends instrumentation_1.InstrumentationAbstract {
		_modules;
		_hooks = [];
		_requireInTheMiddleSingleton = RequireInTheMiddleSingleton_1.RequireInTheMiddleSingleton.getInstance();
		_enabled = false;
		constructor(instrumentationName, instrumentationVersion, config) {
			super(instrumentationName, instrumentationVersion, config);
			let modules = this.init();
			if (modules && !Array.isArray(modules)) modules = [modules];
			this._modules = modules || [];
			if (this._config.enabled) this.enable();
		}
		_wrap = (moduleExports, name, wrapper) => {
			if ((0, utils_1.isWrapped)(moduleExports[name])) this._unwrap(moduleExports, name);
			if (!util_1.types.isProxy(moduleExports)) return (0, shimmer_1.wrap)(moduleExports, name, wrapper);
			else {
				const wrapped = (0, shimmer_1.wrap)(Object.assign({}, moduleExports), name, wrapper);
				Object.defineProperty(moduleExports, name, { value: wrapped });
				return wrapped;
			}
		};
		_unwrap = (moduleExports, name) => {
			if (!util_1.types.isProxy(moduleExports)) return (0, shimmer_1.unwrap)(moduleExports, name);
			else return Object.defineProperty(moduleExports, name, { value: moduleExports[name] });
		};
		_massWrap = (moduleExportsArray, names, wrapper) => {
			if (!moduleExportsArray) {
				api_1.diag.error("must provide one or more modules to patch");
				return;
			} else if (!Array.isArray(moduleExportsArray)) moduleExportsArray = [moduleExportsArray];
			if (!(names && Array.isArray(names))) {
				api_1.diag.error("must provide one or more functions to wrap on modules");
				return;
			}
			moduleExportsArray.forEach((moduleExports) => {
				names.forEach((name) => {
					this._wrap(moduleExports, name, wrapper);
				});
			});
		};
		_massUnwrap = (moduleExportsArray, names) => {
			if (!moduleExportsArray) {
				api_1.diag.error("must provide one or more modules to patch");
				return;
			} else if (!Array.isArray(moduleExportsArray)) moduleExportsArray = [moduleExportsArray];
			if (!(names && Array.isArray(names))) {
				api_1.diag.error("must provide one or more functions to wrap on modules");
				return;
			}
			moduleExportsArray.forEach((moduleExports) => {
				names.forEach((name) => {
					this._unwrap(moduleExports, name);
				});
			});
		};
		_warnOnPreloadedModules() {
			const nodeRequire = globalThis.require;
			if (!nodeRequire?.resolve || !nodeRequire?.cache) return;
			this._modules.forEach((module$1) => {
				const { name } = module$1;
				try {
					const resolvedModule = nodeRequire.resolve(name);
					if (nodeRequire.cache[resolvedModule]?.loaded) this._diag.warn(`Module ${name} has been loaded before ${this.instrumentationName} so it might not work, please initialize it before requiring ${name}`);
				} catch {}
			});
		}
		_extractPackageVersion(baseDir) {
			try {
				const json = (0, fs_1.readFileSync)(path.join(baseDir, "package.json"), { encoding: "utf8" });
				const version = JSON.parse(json).version;
				return typeof version === "string" ? version : void 0;
			} catch {
				api_1.diag.warn("Failed extracting version", baseDir);
			}
		}
		_onRequire(module$2, exports$1, name, baseDir) {
			if (!baseDir) {
				if (typeof module$2.patch === "function") {
					module$2.moduleExports = exports$1;
					if (this._enabled) {
						this._diag.debug("Applying instrumentation patch for nodejs core module on require hook", { module: module$2.name });
						return module$2.patch(exports$1);
					}
				}
				return exports$1;
			}
			const version = this._extractPackageVersion(baseDir);
			module$2.moduleVersion = version;
			if (module$2.name === name) {
				if (isSupported(module$2.supportedVersions, version, module$2.includePrerelease)) {
					if (typeof module$2.patch === "function") {
						module$2.moduleExports = exports$1;
						if (this._enabled) {
							this._diag.debug("Applying instrumentation patch for module on require hook", {
								module: module$2.name,
								version: module$2.moduleVersion,
								baseDir
							});
							return module$2.patch(exports$1, module$2.moduleVersion);
						}
					}
				}
				return exports$1;
			}
			const files = module$2.files ?? [];
			const normalizedName = path.normalize(name);
			return files.filter((f) => f.name === normalizedName && isSupported(f.supportedVersions, version, module$2.includePrerelease)).reduce((patchedExports, file) => {
				file.moduleExports = patchedExports;
				if (this._enabled) {
					this._diag.debug("Applying instrumentation patch for nodejs module file on require hook", {
						module: module$2.name,
						version: module$2.moduleVersion,
						fileName: file.name,
						baseDir
					});
					return file.patch(patchedExports, module$2.moduleVersion);
				}
				return patchedExports;
			}, exports$1);
		}
		enable() {
			if (this._enabled) return;
			this._enabled = true;
			if (this._hooks.length > 0) {
				for (const module$3 of this._modules) {
					if (typeof module$3.patch === "function" && module$3.moduleExports) {
						this._diag.debug("Applying instrumentation patch for nodejs module on instrumentation enabled", {
							module: module$3.name,
							version: module$3.moduleVersion
						});
						module$3.patch(module$3.moduleExports, module$3.moduleVersion);
					}
					for (const file of module$3.files) if (file.moduleExports) {
						this._diag.debug("Applying instrumentation patch for nodejs module file on instrumentation enabled", {
							module: module$3.name,
							version: module$3.moduleVersion,
							fileName: file.name
						});
						file.patch(file.moduleExports, module$3.moduleVersion);
					}
				}
				return;
			}
			this._warnOnPreloadedModules();
			for (const module$4 of this._modules) {
				const hookFn = (exports$2, name, baseDir) => {
					if (!baseDir && path.isAbsolute(name)) {
						const parsedPath = path.parse(name);
						name = parsedPath.name;
						baseDir = parsedPath.dir;
					}
					return this._onRequire(module$4, exports$2, name, baseDir);
				};
				const onRequire = (exports$3, name, baseDir) => {
					return this._onRequire(module$4, exports$3, name, baseDir);
				};
				const hook = path.isAbsolute(module$4.name) ? new require_in_the_middle_1.Hook([module$4.name], { internals: true }, onRequire) : this._requireInTheMiddleSingleton.register(module$4.name, onRequire);
				this._hooks.push(hook);
				const esmHook = new import_in_the_middle_1.Hook([module$4.name], { internals: true }, hookFn);
				this._hooks.push(esmHook);
			}
		}
		disable() {
			if (!this._enabled) return;
			this._enabled = false;
			for (const module$5 of this._modules) {
				if (typeof module$5.unpatch === "function" && module$5.moduleExports) {
					this._diag.debug("Removing instrumentation patch for nodejs module on instrumentation disabled", {
						module: module$5.name,
						version: module$5.moduleVersion
					});
					module$5.unpatch(module$5.moduleExports, module$5.moduleVersion);
				}
				for (const file of module$5.files) if (file.moduleExports) {
					this._diag.debug("Removing instrumentation patch for nodejs module file on instrumentation disabled", {
						module: module$5.name,
						version: module$5.moduleVersion,
						fileName: file.name
					});
					file.unpatch(file.moduleExports, module$5.moduleVersion);
				}
			}
		}
		isEnabled() {
			return this._enabled;
		}
	};
	exports.InstrumentationBase = InstrumentationBase;
	function isSupported(supportedVersions, version, includePrerelease) {
		if (typeof version === "undefined") return supportedVersions.includes("*");
		return supportedVersions.some((supportedVersion) => {
			return (0, semver_1.satisfies)(version, supportedVersion, { includePrerelease });
		});
	}
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/build/src/platform/node/normalize.js
var require_normalize = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.normalize = void 0;
	var path_1 = __require("path");
	Object.defineProperty(exports, "normalize", {
		enumerable: true,
		get: function() {
			return path_1.normalize;
		}
	});
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/build/src/platform/node/index.js
var require_node = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.normalize = exports.InstrumentationBase = void 0;
	var instrumentation_1 = require_instrumentation();
	Object.defineProperty(exports, "InstrumentationBase", {
		enumerable: true,
		get: function() {
			return instrumentation_1.InstrumentationBase;
		}
	});
	var normalize_1 = require_normalize();
	Object.defineProperty(exports, "normalize", {
		enumerable: true,
		get: function() {
			return normalize_1.normalize;
		}
	});
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/build/src/platform/index.js
var require_platform = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.normalize = exports.InstrumentationBase = void 0;
	var node_1 = require_node();
	Object.defineProperty(exports, "InstrumentationBase", {
		enumerable: true,
		get: function() {
			return node_1.InstrumentationBase;
		}
	});
	Object.defineProperty(exports, "normalize", {
		enumerable: true,
		get: function() {
			return node_1.normalize;
		}
	});
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/build/src/instrumentationNodeModuleDefinition.js
var require_instrumentationNodeModuleDefinition = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.InstrumentationNodeModuleDefinition = void 0;
	var InstrumentationNodeModuleDefinition = class {
		files;
		name;
		supportedVersions;
		patch;
		unpatch;
		constructor(name, supportedVersions, patch, unpatch, files) {
			this.files = files || [];
			this.name = name;
			this.supportedVersions = supportedVersions;
			this.patch = patch;
			this.unpatch = unpatch;
		}
	};
	exports.InstrumentationNodeModuleDefinition = InstrumentationNodeModuleDefinition;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/build/src/instrumentationNodeModuleFile.js
var require_instrumentationNodeModuleFile = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.InstrumentationNodeModuleFile = void 0;
	const index_1 = require_platform();
	var InstrumentationNodeModuleFile = class {
		name;
		supportedVersions;
		patch;
		unpatch;
		constructor(name, supportedVersions, patch, unpatch) {
			this.name = (0, index_1.normalize)(name);
			this.supportedVersions = supportedVersions;
			this.patch = patch;
			this.unpatch = unpatch;
		}
	};
	exports.InstrumentationNodeModuleFile = InstrumentationNodeModuleFile;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/build/src/semconvStability.js
var require_semconvStability = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.semconvStabilityFromStr = exports.SemconvStability = void 0;
	var SemconvStability;
	(function(SemconvStability) {
		/** Emit only stable semantic conventions. */
		SemconvStability[SemconvStability["STABLE"] = 1] = "STABLE";
		/** Emit only old semantic conventions. */
		SemconvStability[SemconvStability["OLD"] = 2] = "OLD";
		/** Emit both stable and old semantic conventions. */
		SemconvStability[SemconvStability["DUPLICATE"] = 3] = "DUPLICATE";
	})(SemconvStability = exports.SemconvStability || (exports.SemconvStability = {}));
	/**
	* Determine the appropriate semconv stability for the given namespace.
	*
	* This will parse the given string of comma-separated values (often
	* `process.env.OTEL_SEMCONV_STABILITY_OPT_IN`) looking for the `${namespace}`
	* or `${namespace}/dup` tokens. This is a pattern defined by a number of
	* non-normative semconv documents.
	*
	* For example:
	* - namespace 'http': https://opentelemetry.io/docs/specs/semconv/non-normative/http-migration/
	* - namespace 'database': https://opentelemetry.io/docs/specs/semconv/non-normative/database-migration/
	* - namespace 'k8s': https://opentelemetry.io/docs/specs/semconv/non-normative/k8s-migration/
	*
	* Usage:
	*
	*  import {SemconvStability, semconvStabilityFromStr} from '@opentelemetry/instrumentation';
	*
	*  export class FooInstrumentation extends InstrumentationBase<FooInstrumentationConfig> {
	*    private _semconvStability: SemconvStability;
	*    constructor(config: FooInstrumentationConfig = {}) {
	*      super('@opentelemetry/instrumentation-foo', VERSION, config);
	*
	*      // When supporting the OTEL_SEMCONV_STABILITY_OPT_IN envvar
	*      this._semconvStability = semconvStabilityFromStr(
	*        'http',
	*        process.env.OTEL_SEMCONV_STABILITY_OPT_IN
	*      );
	*
	*      // or when supporting a `semconvStabilityOptIn` config option (e.g. for
	*      // the web where there are no envvars).
	*      this._semconvStability = semconvStabilityFromStr(
	*        'http',
	*        config?.semconvStabilityOptIn
	*      );
	*    }
	*  }
	*
	*  // Then, to apply semconv, use the following or similar:
	*  if (this._semconvStability & SemconvStability.OLD) {
	*    // ...
	*  }
	*  if (this._semconvStability & SemconvStability.STABLE) {
	*    // ...
	*  }
	*
	*/
	function semconvStabilityFromStr(namespace, str) {
		let semconvStability = SemconvStability.OLD;
		const entries = str?.split(",").map((v) => v.trim()).filter((s) => s !== "");
		for (const entry of entries ?? []) if (entry.toLowerCase() === namespace + "/dup") {
			semconvStability = SemconvStability.DUPLICATE;
			break;
		} else if (entry.toLowerCase() === namespace) semconvStability = SemconvStability.STABLE;
		return semconvStability;
	}
	exports.semconvStabilityFromStr = semconvStabilityFromStr;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/build/src/index.js
var require_src = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.semconvStabilityFromStr = exports.SemconvStability = exports.safeExecuteInTheMiddleAsync = exports.safeExecuteInTheMiddle = exports.isWrapped = exports.InstrumentationNodeModuleFile = exports.InstrumentationNodeModuleDefinition = exports.InstrumentationBase = exports.registerInstrumentations = void 0;
	var autoLoader_1 = require_autoLoader();
	Object.defineProperty(exports, "registerInstrumentations", {
		enumerable: true,
		get: function() {
			return autoLoader_1.registerInstrumentations;
		}
	});
	var index_1 = require_platform();
	Object.defineProperty(exports, "InstrumentationBase", {
		enumerable: true,
		get: function() {
			return index_1.InstrumentationBase;
		}
	});
	var instrumentationNodeModuleDefinition_1 = require_instrumentationNodeModuleDefinition();
	Object.defineProperty(exports, "InstrumentationNodeModuleDefinition", {
		enumerable: true,
		get: function() {
			return instrumentationNodeModuleDefinition_1.InstrumentationNodeModuleDefinition;
		}
	});
	var instrumentationNodeModuleFile_1 = require_instrumentationNodeModuleFile();
	Object.defineProperty(exports, "InstrumentationNodeModuleFile", {
		enumerable: true,
		get: function() {
			return instrumentationNodeModuleFile_1.InstrumentationNodeModuleFile;
		}
	});
	var utils_1 = require_utils();
	Object.defineProperty(exports, "isWrapped", {
		enumerable: true,
		get: function() {
			return utils_1.isWrapped;
		}
	});
	Object.defineProperty(exports, "safeExecuteInTheMiddle", {
		enumerable: true,
		get: function() {
			return utils_1.safeExecuteInTheMiddle;
		}
	});
	Object.defineProperty(exports, "safeExecuteInTheMiddleAsync", {
		enumerable: true,
		get: function() {
			return utils_1.safeExecuteInTheMiddleAsync;
		}
	});
	var semconvStability_1 = require_semconvStability();
	Object.defineProperty(exports, "SemconvStability", {
		enumerable: true,
		get: function() {
			return semconvStability_1.SemconvStability;
		}
	});
	Object.defineProperty(exports, "semconvStabilityFromStr", {
		enumerable: true,
		get: function() {
			return semconvStability_1.semconvStabilityFromStr;
		}
	});
}));
//#endregion
export { require_src as t };
