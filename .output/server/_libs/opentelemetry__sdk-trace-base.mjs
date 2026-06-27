import { fileURLToPath as __eveFileURLToPath } from "node:url";
import { dirname as __eveDirname } from "node:path";
__eveDirname(__eveFileURLToPath(import.meta.url));
import { t as __commonJSMin } from "../_runtime.mjs";
import { t as require_src$1 } from "./opentelemetry__api.mjs";
import { n as require_src$3, t as require_src$2 } from "./@opentelemetry/core+[...].mjs";
import { t as require_src$4 } from "./opentelemetry__resources.mjs";
//#region node_modules/@opentelemetry/sdk-trace-base/build/src/enums.js
var require_enums = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ExceptionEventName = void 0;
	exports.ExceptionEventName = "exception";
}));
//#endregion
//#region node_modules/@opentelemetry/sdk-trace-base/build/src/inspect.js
var require_inspect = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.formatInspect = exports.settledResourceAttributes = exports.inspectCustom = void 0;
	/**
	* Well-known symbol used by Node.js `util.inspect` (and `console.*`) to
	* render an object via a custom representation. Defined as a global Symbol
	* so it works without importing from `node:util`, keeping this module safe
	* for browser builds (where the symbol is simply never looked up).
	*/
	exports.inspectCustom = Symbol.for("nodejs.util.inspect.custom");
	/**
	* Collect a Resource's settled attributes without touching the
	* `attributes` getter, which emits diag.error/debug entries when async
	* attribute detectors are still pending. Promise-like (unsettled)
	* entries are silently skipped so logging a Span/Tracer/Provider during
	* startup doesn't recurse through the diag pipeline.
	*/
	function settledResourceAttributes(resource) {
		const attrs = {};
		for (const [k, v] of resource.getRawAttributes()) {
			if (typeof v?.then === "function") continue;
			if (v != null) attrs[k] ??= v;
		}
		return attrs;
	}
	exports.settledResourceAttributes = settledResourceAttributes;
	/**
	* Build a class-tagged inspect representation. Returns a stub like
	* `[ClassName]` once the recursion budget is exhausted, otherwise returns
	* `ClassName <inspected payload>` so nested fields keep proper coloring,
	* indentation, and depth handling. In environments that don't supply an
	* `inspect` callback (e.g. browsers), falls back to returning the raw
	* payload object.
	*/
	function formatInspect(className, payload, depth, options, inspect) {
		if (typeof depth === "number" && depth < 0) {
			const tag = `[${className}]`;
			return options?.stylize ? options.stylize(tag, "special") : tag;
		}
		if (typeof inspect !== "function" || !options) return payload;
		return `${className} ${inspect(payload, {
			...options,
			depth: options.depth == null ? options.depth : options.depth - 1
		})}`;
	}
	exports.formatInspect = formatInspect;
}));
//#endregion
//#region node_modules/@opentelemetry/sdk-trace-base/build/src/Span.js
var require_Span = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SpanImpl = void 0;
	const api_1 = require_src$1();
	const core_1 = require_src$2();
	const semantic_conventions_1 = require_src$3();
	const enums_1 = require_enums();
	const inspect_1 = require_inspect();
	/**
	* This class represents a span.
	*/
	var SpanImpl = class {
		_spanContext;
		kind;
		parentSpanContext;
		attributes = {};
		links = [];
		events = [];
		startTime;
		resource;
		instrumentationScope;
		_droppedAttributesCount = 0;
		_droppedEventsCount = 0;
		_droppedLinksCount = 0;
		_attributesCount = 0;
		name;
		status = { code: api_1.SpanStatusCode.UNSET };
		endTime = [0, 0];
		_ended = false;
		_duration = [-1, -1];
		_spanProcessor;
		_spanLimits;
		_attributeValueLengthLimit;
		_recordEndMetrics;
		_performanceStartTime;
		_performanceOffset;
		_startTimeProvided;
		/**
		* Constructs a new SpanImpl instance.
		*/
		constructor(opts) {
			const now = Date.now();
			this._spanContext = opts.spanContext;
			this._performanceStartTime = core_1.otperformance.now();
			this._performanceOffset = now - (this._performanceStartTime + core_1.otperformance.timeOrigin);
			this._startTimeProvided = opts.startTime != null;
			this._spanLimits = opts.spanLimits;
			this._attributeValueLengthLimit = this._spanLimits.attributeValueLengthLimit ?? 0;
			this._spanProcessor = opts.spanProcessor;
			this.name = opts.name;
			this.parentSpanContext = opts.parentSpanContext;
			this.kind = opts.kind;
			if (opts.links) for (const link of opts.links) this.addLink(link);
			this.startTime = this._getTime(opts.startTime ?? now);
			this.resource = opts.resource;
			this.instrumentationScope = opts.scope;
			this._recordEndMetrics = opts.recordEndMetrics;
			if (opts.attributes != null) this.setAttributes(opts.attributes);
			this._spanProcessor.onStart(this, opts.context);
		}
		spanContext() {
			return this._spanContext;
		}
		setAttribute(key, value) {
			if (value == null || this._isSpanEnded()) return this;
			if (key.length === 0) {
				api_1.diag.warn(`Invalid attribute key: ${key}`);
				return this;
			}
			if (!(0, core_1.isAttributeValue)(value)) {
				api_1.diag.warn(`Invalid attribute value set for key: ${key}`);
				return this;
			}
			const { attributeCountLimit } = this._spanLimits;
			const isNewKey = !Object.prototype.hasOwnProperty.call(this.attributes, key);
			if (attributeCountLimit !== void 0 && this._attributesCount >= attributeCountLimit && isNewKey) {
				this._droppedAttributesCount++;
				return this;
			}
			this.attributes[key] = this._truncateToSize(value);
			if (isNewKey) this._attributesCount++;
			return this;
		}
		setAttributes(attributes) {
			for (const key in attributes) if (Object.prototype.hasOwnProperty.call(attributes, key)) this.setAttribute(key, attributes[key]);
			return this;
		}
		/**
		*
		* @param name Span Name
		* @param [attributesOrStartTime] Span attributes or start time
		*     if type is {@type TimeInput} and 3rd param is undefined
		* @param [timeStamp] Specified time stamp for the event
		*/
		addEvent(name, attributesOrStartTime, timeStamp) {
			if (this._isSpanEnded()) return this;
			const { eventCountLimit } = this._spanLimits;
			if (eventCountLimit === 0) {
				api_1.diag.warn("No events allowed.");
				this._droppedEventsCount++;
				return this;
			}
			if (eventCountLimit !== void 0 && this.events.length >= eventCountLimit) {
				if (this._droppedEventsCount === 0) api_1.diag.debug("Dropping extra events.");
				this.events.shift();
				this._droppedEventsCount++;
			}
			if ((0, core_1.isTimeInput)(attributesOrStartTime)) {
				if (!(0, core_1.isTimeInput)(timeStamp)) timeStamp = attributesOrStartTime;
				attributesOrStartTime = void 0;
			}
			const sanitized = (0, core_1.sanitizeAttributes)(attributesOrStartTime);
			const { attributePerEventCountLimit } = this._spanLimits;
			const attributes = {};
			let droppedAttributesCount = 0;
			let eventAttributesCount = 0;
			for (const attr in sanitized) {
				if (!Object.prototype.hasOwnProperty.call(sanitized, attr)) continue;
				const attrVal = sanitized[attr];
				if (attributePerEventCountLimit !== void 0 && eventAttributesCount >= attributePerEventCountLimit) {
					droppedAttributesCount++;
					continue;
				}
				attributes[attr] = this._truncateToSize(attrVal);
				eventAttributesCount++;
			}
			this.events.push({
				name,
				attributes,
				time: this._getTime(timeStamp),
				droppedAttributesCount
			});
			return this;
		}
		addLink(link) {
			if (this._isSpanEnded()) return this;
			const { linkCountLimit } = this._spanLimits;
			if (linkCountLimit === 0) {
				this._droppedLinksCount++;
				return this;
			}
			if (linkCountLimit !== void 0 && this.links.length >= linkCountLimit) {
				if (this._droppedLinksCount === 0) api_1.diag.debug("Dropping extra links.");
				this.links.shift();
				this._droppedLinksCount++;
			}
			const { attributePerLinkCountLimit } = this._spanLimits;
			const sanitized = (0, core_1.sanitizeAttributes)(link.attributes);
			const attributes = {};
			let droppedAttributesCount = 0;
			let linkAttributesCount = 0;
			for (const attr in sanitized) {
				if (!Object.prototype.hasOwnProperty.call(sanitized, attr)) continue;
				const attrVal = sanitized[attr];
				if (attributePerLinkCountLimit !== void 0 && linkAttributesCount >= attributePerLinkCountLimit) {
					droppedAttributesCount++;
					continue;
				}
				attributes[attr] = this._truncateToSize(attrVal);
				linkAttributesCount++;
			}
			const processedLink = { context: link.context };
			if (linkAttributesCount > 0) processedLink.attributes = attributes;
			if (droppedAttributesCount > 0) processedLink.droppedAttributesCount = droppedAttributesCount;
			this.links.push(processedLink);
			return this;
		}
		addLinks(links) {
			for (const link of links) this.addLink(link);
			return this;
		}
		setStatus(status) {
			if (this._isSpanEnded()) return this;
			if (status.code === api_1.SpanStatusCode.UNSET) return this;
			if (this.status.code === api_1.SpanStatusCode.OK) return this;
			const newStatus = { code: status.code };
			if (status.code === api_1.SpanStatusCode.ERROR) {
				if (typeof status.message === "string") newStatus.message = status.message;
				else if (status.message != null) api_1.diag.warn(`Dropping invalid status.message of type '${typeof status.message}', expected 'string'`);
			}
			this.status = newStatus;
			return this;
		}
		updateName(name) {
			if (this._isSpanEnded()) return this;
			this.name = name;
			return this;
		}
		end(endTime) {
			if (this._isSpanEnded()) {
				api_1.diag.error(`${this.name} ${this._spanContext.traceId}-${this._spanContext.spanId} - You can only call end() on a span once.`);
				return;
			}
			this.endTime = this._getTime(endTime);
			this._duration = (0, core_1.hrTimeDuration)(this.startTime, this.endTime);
			if (this._duration[0] < 0) {
				api_1.diag.warn("Inconsistent start and end time, startTime > endTime. Setting span duration to 0ms.", this.startTime, this.endTime);
				this.endTime = this.startTime.slice();
				this._duration = [0, 0];
			}
			if (this._droppedEventsCount > 0) api_1.diag.warn(`Dropped ${this._droppedEventsCount} events because eventCountLimit reached`);
			if (this._droppedLinksCount > 0) api_1.diag.warn(`Dropped ${this._droppedLinksCount} links because linkCountLimit reached`);
			if (this._spanProcessor.onEnding) this._spanProcessor.onEnding(this);
			this._recordEndMetrics?.();
			this._ended = true;
			this._spanProcessor.onEnd(this);
		}
		_getTime(inp) {
			if (typeof inp === "number" && inp <= core_1.otperformance.now()) return (0, core_1.hrTime)(inp + this._performanceOffset);
			if (typeof inp === "number") return (0, core_1.millisToHrTime)(inp);
			if (inp instanceof Date) return (0, core_1.millisToHrTime)(inp.getTime());
			if ((0, core_1.isTimeInputHrTime)(inp)) return inp;
			if (this._startTimeProvided) return (0, core_1.millisToHrTime)(Date.now());
			const msDuration = core_1.otperformance.now() - this._performanceStartTime;
			return (0, core_1.addHrTimes)(this.startTime, (0, core_1.millisToHrTime)(msDuration));
		}
		isRecording() {
			return this._ended === false;
		}
		recordException(exception, time) {
			const attributes = {};
			if (typeof exception === "string") attributes[semantic_conventions_1.ATTR_EXCEPTION_MESSAGE] = exception;
			else if (exception) {
				if (exception.code) attributes[semantic_conventions_1.ATTR_EXCEPTION_TYPE] = exception.code.toString();
				else if (exception.name) attributes[semantic_conventions_1.ATTR_EXCEPTION_TYPE] = exception.name;
				if (exception.message) attributes[semantic_conventions_1.ATTR_EXCEPTION_MESSAGE] = exception.message;
				if (exception.stack) attributes[semantic_conventions_1.ATTR_EXCEPTION_STACKTRACE] = exception.stack;
			}
			if (attributes[semantic_conventions_1.ATTR_EXCEPTION_TYPE] || attributes[semantic_conventions_1.ATTR_EXCEPTION_MESSAGE]) this.addEvent(enums_1.ExceptionEventName, attributes, time);
			else api_1.diag.warn(`Failed to record an exception ${exception}`);
		}
		get duration() {
			return this._duration;
		}
		get ended() {
			return this._ended;
		}
		get droppedAttributesCount() {
			return this._droppedAttributesCount;
		}
		get droppedEventsCount() {
			return this._droppedEventsCount;
		}
		get droppedLinksCount() {
			return this._droppedLinksCount;
		}
		_isSpanEnded() {
			if (this._ended) {
				const error = /* @__PURE__ */ new Error(`Operation attempted on ended Span {traceId: ${this._spanContext.traceId}, spanId: ${this._spanContext.spanId}}`);
				api_1.diag.warn(`Cannot execute the operation on ended Span {traceId: ${this._spanContext.traceId}, spanId: ${this._spanContext.spanId}}`, error);
			}
			return this._ended;
		}
		_truncateToLimitUtil(value, limit) {
			if (value.length <= limit) return value;
			return value.substring(0, limit);
		}
		/**
		* If the given attribute value is of type string and has more characters than given {@code attributeValueLengthLimit} then
		* return string with truncated to {@code attributeValueLengthLimit} characters
		*
		* If the given attribute value is array of strings then
		* return new array of strings with each element truncated to {@code attributeValueLengthLimit} characters
		*
		* Otherwise return same Attribute {@code value}
		*
		* @param value Attribute value
		* @returns truncated attribute value if required, otherwise same value
		*/
		_truncateToSize(value) {
			const limit = this._attributeValueLengthLimit;
			if (limit <= 0) {
				api_1.diag.warn(`Attribute value limit must be positive, got ${limit}`);
				return value;
			}
			if (typeof value === "string") return this._truncateToLimitUtil(value, limit);
			if (Array.isArray(value)) return value.map((val) => typeof val === "string" ? this._truncateToLimitUtil(val, limit) : val);
			return value;
		}
		[inspect_1.inspectCustom](depth, options, inspect) {
			const payload = {
				name: this.name,
				kind: this.kind,
				spanContext: this._spanContext,
				parentSpanContext: this.parentSpanContext,
				status: this.status,
				startTime: this.startTime,
				endTime: this.endTime,
				duration: this._duration,
				ended: this._ended,
				attributes: this.attributes,
				events: this.events,
				links: this.links,
				droppedAttributesCount: this._droppedAttributesCount,
				droppedEventsCount: this._droppedEventsCount,
				droppedLinksCount: this._droppedLinksCount,
				instrumentationScope: this.instrumentationScope,
				resource: { attributes: (0, inspect_1.settledResourceAttributes)(this.resource) }
			};
			return (0, inspect_1.formatInspect)("SpanImpl", payload, depth, options, inspect);
		}
	};
	exports.SpanImpl = SpanImpl;
}));
//#endregion
//#region node_modules/@opentelemetry/sdk-trace-base/build/src/Sampler.js
var require_Sampler = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SamplingDecision = void 0;
	(function(SamplingDecision) {
		/**
		* `Span.isRecording() === false`, span will not be recorded and all events
		* and attributes will be dropped.
		*/
		SamplingDecision[SamplingDecision["NOT_RECORD"] = 0] = "NOT_RECORD";
		/**
		* `Span.isRecording() === true`, but `Sampled` flag in {@link TraceFlags}
		* MUST NOT be set.
		*/
		SamplingDecision[SamplingDecision["RECORD"] = 1] = "RECORD";
		/**
		* `Span.isRecording() === true` AND `Sampled` flag in {@link TraceFlags}
		* MUST be set.
		*/
		SamplingDecision[SamplingDecision["RECORD_AND_SAMPLED"] = 2] = "RECORD_AND_SAMPLED";
	})(exports.SamplingDecision || (exports.SamplingDecision = {}));
}));
//#endregion
//#region node_modules/@opentelemetry/sdk-trace-base/build/src/sampler/AlwaysOffSampler.js
var require_AlwaysOffSampler = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.AlwaysOffSampler = void 0;
	const Sampler_1 = require_Sampler();
	/** Sampler that samples no traces. */
	var AlwaysOffSampler = class {
		shouldSample() {
			return { decision: Sampler_1.SamplingDecision.NOT_RECORD };
		}
		toString() {
			return "AlwaysOffSampler";
		}
	};
	exports.AlwaysOffSampler = AlwaysOffSampler;
}));
//#endregion
//#region node_modules/@opentelemetry/sdk-trace-base/build/src/sampler/AlwaysOnSampler.js
var require_AlwaysOnSampler = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.AlwaysOnSampler = void 0;
	const Sampler_1 = require_Sampler();
	/** Sampler that samples all traces. */
	var AlwaysOnSampler = class {
		shouldSample() {
			return { decision: Sampler_1.SamplingDecision.RECORD_AND_SAMPLED };
		}
		toString() {
			return "AlwaysOnSampler";
		}
	};
	exports.AlwaysOnSampler = AlwaysOnSampler;
}));
//#endregion
//#region node_modules/@opentelemetry/sdk-trace-base/build/src/sampler/ParentBasedSampler.js
var require_ParentBasedSampler = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ParentBasedSampler = void 0;
	const api_1 = require_src$1();
	const core_1 = require_src$2();
	const AlwaysOffSampler_1 = require_AlwaysOffSampler();
	const AlwaysOnSampler_1 = require_AlwaysOnSampler();
	/**
	* A composite sampler that either respects the parent span's sampling decision
	* or delegates to `delegateSampler` for root spans.
	*/
	var ParentBasedSampler = class {
		_root;
		_remoteParentSampled;
		_remoteParentNotSampled;
		_localParentSampled;
		_localParentNotSampled;
		constructor(config) {
			this._root = config.root;
			if (!this._root) {
				(0, core_1.globalErrorHandler)(/* @__PURE__ */ new Error("ParentBasedSampler must have a root sampler configured"));
				this._root = new AlwaysOnSampler_1.AlwaysOnSampler();
			}
			this._remoteParentSampled = config.remoteParentSampled ?? new AlwaysOnSampler_1.AlwaysOnSampler();
			this._remoteParentNotSampled = config.remoteParentNotSampled ?? new AlwaysOffSampler_1.AlwaysOffSampler();
			this._localParentSampled = config.localParentSampled ?? new AlwaysOnSampler_1.AlwaysOnSampler();
			this._localParentNotSampled = config.localParentNotSampled ?? new AlwaysOffSampler_1.AlwaysOffSampler();
		}
		shouldSample(context, traceId, spanName, spanKind, attributes, links) {
			const parentContext = api_1.trace.getSpanContext(context);
			if (!parentContext || !(0, api_1.isSpanContextValid)(parentContext)) return this._root.shouldSample(context, traceId, spanName, spanKind, attributes, links);
			if (parentContext.isRemote) {
				if (parentContext.traceFlags & api_1.TraceFlags.SAMPLED) return this._remoteParentSampled.shouldSample(context, traceId, spanName, spanKind, attributes, links);
				return this._remoteParentNotSampled.shouldSample(context, traceId, spanName, spanKind, attributes, links);
			}
			if (parentContext.traceFlags & api_1.TraceFlags.SAMPLED) return this._localParentSampled.shouldSample(context, traceId, spanName, spanKind, attributes, links);
			return this._localParentNotSampled.shouldSample(context, traceId, spanName, spanKind, attributes, links);
		}
		toString() {
			return `ParentBased{root=${this._root.toString()}, remoteParentSampled=${this._remoteParentSampled.toString()}, remoteParentNotSampled=${this._remoteParentNotSampled.toString()}, localParentSampled=${this._localParentSampled.toString()}, localParentNotSampled=${this._localParentNotSampled.toString()}}`;
		}
	};
	exports.ParentBasedSampler = ParentBasedSampler;
}));
//#endregion
//#region node_modules/@opentelemetry/sdk-trace-base/build/src/sampler/TraceIdRatioBasedSampler.js
var require_TraceIdRatioBasedSampler = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.TraceIdRatioBasedSampler = void 0;
	const api_1 = require_src$1();
	const Sampler_1 = require_Sampler();
	/** Sampler that samples a given fraction of traces based of trace id deterministically. */
	var TraceIdRatioBasedSampler = class {
		_ratio;
		_upperBound;
		constructor(ratio = 0) {
			this._ratio = this._normalize(ratio);
			this._upperBound = Math.floor(this._ratio * 4294967295);
		}
		shouldSample(context, traceId) {
			return { decision: (0, api_1.isValidTraceId)(traceId) && this._accumulate(traceId) < this._upperBound ? Sampler_1.SamplingDecision.RECORD_AND_SAMPLED : Sampler_1.SamplingDecision.NOT_RECORD };
		}
		toString() {
			return `TraceIdRatioBased{${this._ratio}}`;
		}
		_normalize(ratio) {
			if (typeof ratio !== "number" || isNaN(ratio)) return 0;
			return ratio >= 1 ? 1 : ratio <= 0 ? 0 : ratio;
		}
		_accumulate(traceId) {
			let accumulation = 0;
			for (let i = 0; i < 32; i += 8) {
				let part = 0;
				for (let j = 0; j < 8; j++) {
					const c = traceId.charCodeAt(i + j);
					const v = c < 58 ? c - 48 : c < 71 ? c - 55 : c - 87;
					part = part << 4 | v;
				}
				accumulation = (accumulation ^ part) >>> 0;
			}
			return accumulation;
		}
	};
	exports.TraceIdRatioBasedSampler = TraceIdRatioBasedSampler;
}));
//#endregion
//#region node_modules/@opentelemetry/sdk-trace-base/build/src/config.js
var require_config = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.buildSamplerFromEnv = exports.loadDefaultConfig = void 0;
	const api_1 = require_src$1();
	const core_1 = require_src$2();
	const AlwaysOffSampler_1 = require_AlwaysOffSampler();
	const AlwaysOnSampler_1 = require_AlwaysOnSampler();
	const ParentBasedSampler_1 = require_ParentBasedSampler();
	const TraceIdRatioBasedSampler_1 = require_TraceIdRatioBasedSampler();
	var TracesSamplerValues;
	(function(TracesSamplerValues) {
		TracesSamplerValues["AlwaysOff"] = "always_off";
		TracesSamplerValues["AlwaysOn"] = "always_on";
		TracesSamplerValues["ParentBasedAlwaysOff"] = "parentbased_always_off";
		TracesSamplerValues["ParentBasedAlwaysOn"] = "parentbased_always_on";
		TracesSamplerValues["ParentBasedTraceIdRatio"] = "parentbased_traceidratio";
		TracesSamplerValues["TraceIdRatio"] = "traceidratio";
	})(TracesSamplerValues || (TracesSamplerValues = {}));
	const DEFAULT_RATIO = 1;
	/**
	* Load default configuration. For fields with primitive values, any user-provided
	* value will override the corresponding default value. For fields with
	* non-primitive values (like `spanLimits`), the user-provided value will be
	* used to extend the default value.
	*/
	function loadDefaultConfig() {
		return {
			sampler: buildSamplerFromEnv(),
			forceFlushTimeoutMillis: 3e4,
			generalLimits: {
				attributeValueLengthLimit: (0, core_1.getNumberFromEnv)("OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT") ?? Infinity,
				attributeCountLimit: (0, core_1.getNumberFromEnv)("OTEL_ATTRIBUTE_COUNT_LIMIT") ?? 128
			},
			spanLimits: {
				attributeValueLengthLimit: (0, core_1.getNumberFromEnv)("OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT") ?? Infinity,
				attributeCountLimit: (0, core_1.getNumberFromEnv)("OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT") ?? 128,
				linkCountLimit: (0, core_1.getNumberFromEnv)("OTEL_SPAN_LINK_COUNT_LIMIT") ?? 128,
				eventCountLimit: (0, core_1.getNumberFromEnv)("OTEL_SPAN_EVENT_COUNT_LIMIT") ?? 128,
				attributePerEventCountLimit: (0, core_1.getNumberFromEnv)("OTEL_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT") ?? 128,
				attributePerLinkCountLimit: (0, core_1.getNumberFromEnv)("OTEL_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT") ?? 128
			}
		};
	}
	exports.loadDefaultConfig = loadDefaultConfig;
	/**
	* Based on environment, builds a sampler, complies with specification.
	*/
	function buildSamplerFromEnv() {
		const sampler = (0, core_1.getStringFromEnv)("OTEL_TRACES_SAMPLER") ?? TracesSamplerValues.ParentBasedAlwaysOn;
		switch (sampler) {
			case TracesSamplerValues.AlwaysOn: return new AlwaysOnSampler_1.AlwaysOnSampler();
			case TracesSamplerValues.AlwaysOff: return new AlwaysOffSampler_1.AlwaysOffSampler();
			case TracesSamplerValues.ParentBasedAlwaysOn: return new ParentBasedSampler_1.ParentBasedSampler({ root: new AlwaysOnSampler_1.AlwaysOnSampler() });
			case TracesSamplerValues.ParentBasedAlwaysOff: return new ParentBasedSampler_1.ParentBasedSampler({ root: new AlwaysOffSampler_1.AlwaysOffSampler() });
			case TracesSamplerValues.TraceIdRatio: return new TraceIdRatioBasedSampler_1.TraceIdRatioBasedSampler(getSamplerProbabilityFromEnv());
			case TracesSamplerValues.ParentBasedTraceIdRatio: return new ParentBasedSampler_1.ParentBasedSampler({ root: new TraceIdRatioBasedSampler_1.TraceIdRatioBasedSampler(getSamplerProbabilityFromEnv()) });
			default:
				api_1.diag.error(`OTEL_TRACES_SAMPLER value "${sampler}" invalid, defaulting to "${TracesSamplerValues.ParentBasedAlwaysOn}".`);
				return new ParentBasedSampler_1.ParentBasedSampler({ root: new AlwaysOnSampler_1.AlwaysOnSampler() });
		}
	}
	exports.buildSamplerFromEnv = buildSamplerFromEnv;
	function getSamplerProbabilityFromEnv() {
		const probability = (0, core_1.getNumberFromEnv)("OTEL_TRACES_SAMPLER_ARG");
		if (probability == null) {
			api_1.diag.error(`OTEL_TRACES_SAMPLER_ARG is blank, defaulting to ${DEFAULT_RATIO}.`);
			return DEFAULT_RATIO;
		}
		if (probability < 0 || probability > 1) {
			api_1.diag.error(`OTEL_TRACES_SAMPLER_ARG=${probability} was given, but it is out of range ([0..1]), defaulting to ${DEFAULT_RATIO}.`);
			return DEFAULT_RATIO;
		}
		return probability;
	}
}));
//#endregion
//#region node_modules/@opentelemetry/sdk-trace-base/build/src/utility.js
var require_utility = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.reconfigureLimits = exports.mergeConfig = exports.DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT = exports.DEFAULT_ATTRIBUTE_COUNT_LIMIT = void 0;
	const config_1 = require_config();
	const core_1 = require_src$2();
	exports.DEFAULT_ATTRIBUTE_COUNT_LIMIT = 128;
	exports.DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT = Infinity;
	/**
	* Function to merge Default configuration (as specified in './config') with
	* user provided configurations.
	*/
	function mergeConfig(userConfig) {
		const perInstanceDefaults = { sampler: (0, config_1.buildSamplerFromEnv)() };
		const DEFAULT_CONFIG = (0, config_1.loadDefaultConfig)();
		const target = Object.assign({}, DEFAULT_CONFIG, perInstanceDefaults, userConfig);
		target.generalLimits = Object.assign({}, DEFAULT_CONFIG.generalLimits, userConfig.generalLimits || {});
		target.spanLimits = Object.assign({}, DEFAULT_CONFIG.spanLimits, userConfig.spanLimits || {});
		return target;
	}
	exports.mergeConfig = mergeConfig;
	/**
	* When general limits are provided and model specific limits are not,
	* configures the model specific limits by using the values from the general ones.
	* @param userConfig User provided tracer configuration
	*/
	function reconfigureLimits(userConfig) {
		const spanLimits = Object.assign({}, userConfig.spanLimits);
		/**
		* Reassign span attribute count limit to use first non null value defined by user or use default value
		*/
		spanLimits.attributeCountLimit = userConfig.spanLimits?.attributeCountLimit ?? userConfig.generalLimits?.attributeCountLimit ?? (0, core_1.getNumberFromEnv)("OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT") ?? (0, core_1.getNumberFromEnv)("OTEL_ATTRIBUTE_COUNT_LIMIT") ?? exports.DEFAULT_ATTRIBUTE_COUNT_LIMIT;
		/**
		* Reassign span attribute value length limit to use first non null value defined by user or use default value
		*/
		spanLimits.attributeValueLengthLimit = userConfig.spanLimits?.attributeValueLengthLimit ?? userConfig.generalLimits?.attributeValueLengthLimit ?? (0, core_1.getNumberFromEnv)("OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT") ?? (0, core_1.getNumberFromEnv)("OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT") ?? exports.DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT;
		return Object.assign({}, userConfig, { spanLimits });
	}
	exports.reconfigureLimits = reconfigureLimits;
}));
//#endregion
//#region node_modules/@opentelemetry/sdk-trace-base/build/src/export/BatchSpanProcessorBase.js
var require_BatchSpanProcessorBase = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.BatchSpanProcessorBase = void 0;
	const api_1 = require_src$1();
	const core_1 = require_src$2();
	/**
	* Implementation of the {@link SpanProcessor} that batches spans exported by
	* the SDK then pushes them to the exporter pipeline.
	*/
	var BatchSpanProcessorBase = class {
		_maxExportBatchSize;
		_maxQueueSize;
		_scheduledDelayMillis;
		_exportTimeoutMillis;
		_exporter;
		_isExporting = false;
		_finishedSpans = [];
		_timer;
		_shutdownOnce;
		_droppedSpansCount = 0;
		constructor(exporter, config) {
			this._exporter = exporter;
			this._maxExportBatchSize = typeof config?.maxExportBatchSize === "number" ? config.maxExportBatchSize : (0, core_1.getNumberFromEnv)("OTEL_BSP_MAX_EXPORT_BATCH_SIZE") ?? 512;
			this._maxQueueSize = typeof config?.maxQueueSize === "number" ? config.maxQueueSize : (0, core_1.getNumberFromEnv)("OTEL_BSP_MAX_QUEUE_SIZE") ?? 2048;
			this._scheduledDelayMillis = typeof config?.scheduledDelayMillis === "number" ? config.scheduledDelayMillis : (0, core_1.getNumberFromEnv)("OTEL_BSP_SCHEDULE_DELAY") ?? 5e3;
			this._exportTimeoutMillis = typeof config?.exportTimeoutMillis === "number" ? config.exportTimeoutMillis : (0, core_1.getNumberFromEnv)("OTEL_BSP_EXPORT_TIMEOUT") ?? 3e4;
			this._shutdownOnce = new core_1.BindOnceFuture(this._shutdown, this);
			if (this._maxExportBatchSize > this._maxQueueSize) {
				api_1.diag.warn("BatchSpanProcessor: maxExportBatchSize must be smaller or equal to maxQueueSize, setting maxExportBatchSize to match maxQueueSize");
				this._maxExportBatchSize = this._maxQueueSize;
			}
		}
		forceFlush() {
			if (this._shutdownOnce.isCalled) return this._shutdownOnce.promise;
			return this._flushAll();
		}
		onStart(_span, _parentContext) {}
		onEnd(span) {
			if (this._shutdownOnce.isCalled) return;
			if ((span.spanContext().traceFlags & api_1.TraceFlags.SAMPLED) === 0) return;
			this._addToBuffer(span);
		}
		shutdown() {
			return this._shutdownOnce.call();
		}
		_shutdown() {
			return Promise.resolve().then(() => {
				return this.onShutdown();
			}).then(() => {
				return this._flushAll();
			}).then(() => {
				return this._exporter.shutdown();
			});
		}
		/** Add a span in the buffer. */
		_addToBuffer(span) {
			if (this._finishedSpans.length >= this._maxQueueSize) {
				if (this._droppedSpansCount === 0) api_1.diag.debug("maxQueueSize reached, dropping spans");
				this._droppedSpansCount++;
				return;
			}
			if (this._droppedSpansCount > 0) {
				api_1.diag.warn(`Dropped ${this._droppedSpansCount} spans because maxQueueSize reached`);
				this._droppedSpansCount = 0;
			}
			this._finishedSpans.push(span);
			this._maybeStartTimer();
		}
		/**
		* Send all spans to the exporter respecting the batch size limit
		* This function is used only on forceFlush or shutdown,
		* for all other cases _flush should be used
		* */
		_flushAll() {
			return new Promise((resolve, reject) => {
				const promises = [];
				const count = Math.ceil(this._finishedSpans.length / this._maxExportBatchSize);
				for (let i = 0, j = count; i < j; i++) promises.push(this._flushOneBatch());
				Promise.all(promises).then(() => {
					resolve();
				}).catch(reject);
			});
		}
		_flushOneBatch() {
			this._clearTimer();
			if (this._finishedSpans.length === 0) return Promise.resolve();
			return new Promise((resolve, reject) => {
				const timer = setTimeout(() => {
					reject(/* @__PURE__ */ new Error("Timeout"));
				}, this._exportTimeoutMillis);
				api_1.context.with((0, core_1.suppressTracing)(api_1.context.active()), () => {
					let spans;
					if (this._finishedSpans.length <= this._maxExportBatchSize) {
						spans = this._finishedSpans;
						this._finishedSpans = [];
					} else spans = this._finishedSpans.splice(0, this._maxExportBatchSize);
					const doExport = () => this._exporter.export(spans, (result) => {
						clearTimeout(timer);
						if (result.code === core_1.ExportResultCode.SUCCESS) resolve();
						else reject(result.error ?? /* @__PURE__ */ new Error("BatchSpanProcessor: span export failed"));
					});
					let pendingResources = null;
					for (let i = 0, len = spans.length; i < len; i++) {
						const span = spans[i];
						if (span.resource.asyncAttributesPending && span.resource.waitForAsyncAttributes) {
							pendingResources ??= [];
							pendingResources.push(span.resource.waitForAsyncAttributes());
						}
					}
					if (pendingResources === null) doExport();
					else Promise.all(pendingResources).then(doExport, (err) => {
						(0, core_1.globalErrorHandler)(err);
						reject(err);
					});
				});
			});
		}
		_maybeStartTimer() {
			if (this._isExporting) return;
			const flush = () => {
				this._isExporting = true;
				this._flushOneBatch().finally(() => {
					this._isExporting = false;
					if (this._finishedSpans.length > 0) {
						this._clearTimer();
						this._maybeStartTimer();
					}
				}).catch((e) => {
					this._isExporting = false;
					(0, core_1.globalErrorHandler)(e);
				});
			};
			if (this._finishedSpans.length >= this._maxExportBatchSize) return flush();
			if (this._timer !== void 0) return;
			this._timer = setTimeout(() => flush(), this._scheduledDelayMillis);
			if (typeof this._timer !== "number") this._timer.unref();
		}
		_clearTimer() {
			if (this._timer !== void 0) {
				clearTimeout(this._timer);
				this._timer = void 0;
			}
		}
	};
	exports.BatchSpanProcessorBase = BatchSpanProcessorBase;
}));
//#endregion
//#region node_modules/@opentelemetry/sdk-trace-base/build/src/platform/node/export/BatchSpanProcessor.js
var require_BatchSpanProcessor = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.BatchSpanProcessor = void 0;
	const BatchSpanProcessorBase_1 = require_BatchSpanProcessorBase();
	var BatchSpanProcessor = class extends BatchSpanProcessorBase_1.BatchSpanProcessorBase {
		onShutdown() {}
	};
	exports.BatchSpanProcessor = BatchSpanProcessor;
}));
//#endregion
//#region node_modules/@opentelemetry/sdk-trace-base/build/src/platform/node/RandomIdGenerator.js
var require_RandomIdGenerator = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.RandomIdGenerator = void 0;
	const SPAN_ID_BYTES = 8;
	const TRACE_ID_BYTES = 16;
	var RandomIdGenerator = class {
		/**
		* Returns a random 16-byte trace ID formatted/encoded as a 32 lowercase hex
		* characters corresponding to 128 bits.
		*/
		generateTraceId = getIdGenerator(TRACE_ID_BYTES);
		/**
		* Returns a random 8-byte span ID formatted/encoded as a 16 lowercase hex
		* characters corresponding to 64 bits.
		*/
		generateSpanId = getIdGenerator(SPAN_ID_BYTES);
	};
	exports.RandomIdGenerator = RandomIdGenerator;
	const SHARED_BUFFER = Buffer.allocUnsafe(TRACE_ID_BYTES);
	function getIdGenerator(bytes) {
		return function generateId() {
			for (let i = 0; i < bytes / 4; i++) SHARED_BUFFER.writeUInt32BE(Math.random() * 2 ** 32 >>> 0, i * 4);
			for (let i = 0; i < bytes; i++) if (SHARED_BUFFER[i] > 0) break;
			else if (i === bytes - 1) SHARED_BUFFER[bytes - 1] = 1;
			return SHARED_BUFFER.toString("hex", 0, bytes);
		};
	}
}));
//#endregion
//#region node_modules/@opentelemetry/sdk-trace-base/build/src/platform/node/index.js
var require_node = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.RandomIdGenerator = exports.BatchSpanProcessor = void 0;
	var BatchSpanProcessor_1 = require_BatchSpanProcessor();
	Object.defineProperty(exports, "BatchSpanProcessor", {
		enumerable: true,
		get: function() {
			return BatchSpanProcessor_1.BatchSpanProcessor;
		}
	});
	var RandomIdGenerator_1 = require_RandomIdGenerator();
	Object.defineProperty(exports, "RandomIdGenerator", {
		enumerable: true,
		get: function() {
			return RandomIdGenerator_1.RandomIdGenerator;
		}
	});
}));
//#endregion
//#region node_modules/@opentelemetry/sdk-trace-base/build/src/platform/index.js
var require_platform = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.RandomIdGenerator = exports.BatchSpanProcessor = void 0;
	var node_1 = require_node();
	Object.defineProperty(exports, "BatchSpanProcessor", {
		enumerable: true,
		get: function() {
			return node_1.BatchSpanProcessor;
		}
	});
	Object.defineProperty(exports, "RandomIdGenerator", {
		enumerable: true,
		get: function() {
			return node_1.RandomIdGenerator;
		}
	});
}));
//#endregion
//#region node_modules/@opentelemetry/sdk-trace-base/build/src/semconv.js
var require_semconv = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.METRIC_OTEL_SDK_SPAN_STARTED = exports.METRIC_OTEL_SDK_SPAN_LIVE = exports.ATTR_OTEL_SPAN_SAMPLING_RESULT = exports.ATTR_OTEL_SPAN_PARENT_ORIGIN = void 0;
	/**
	* Determines whether the span has a parent span, and if so, [whether it is a remote parent](https://opentelemetry.io/docs/specs/otel/trace/api/#isremote)
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_OTEL_SPAN_PARENT_ORIGIN = "otel.span.parent.origin";
	/**
	* The result value of the sampler for this span
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_OTEL_SPAN_SAMPLING_RESULT = "otel.span.sampling_result";
	/**
	* The number of created spans with `recording=true` for which the end operation has not been called yet.
	*
	* @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.METRIC_OTEL_SDK_SPAN_LIVE = "otel.sdk.span.live";
	/**
	* The number of created spans.
	*
	* @note Implementations **MUST** record this metric for all spans, even for non-recording ones.
	*
	* @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.METRIC_OTEL_SDK_SPAN_STARTED = "otel.sdk.span.started";
}));
//#endregion
//#region node_modules/@opentelemetry/sdk-trace-base/build/src/TracerMetrics.js
var require_TracerMetrics = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.TracerMetrics = void 0;
	const Sampler_1 = require_Sampler();
	const semconv_1 = require_semconv();
	/**
	* Generates `otel.sdk.span.*` metrics.
	* https://opentelemetry.io/docs/specs/semconv/otel/sdk-metrics/#span-metrics
	*/
	var TracerMetrics = class {
		startedSpans;
		liveSpans;
		constructor(meter) {
			this.startedSpans = meter.createCounter(semconv_1.METRIC_OTEL_SDK_SPAN_STARTED, {
				unit: "{span}",
				description: "The number of created spans."
			});
			this.liveSpans = meter.createUpDownCounter(semconv_1.METRIC_OTEL_SDK_SPAN_LIVE, {
				unit: "{span}",
				description: "The number of currently live spans."
			});
		}
		startSpan(parentSpanCtx, samplingDecision) {
			const samplingDecisionStr = samplingDecisionToString(samplingDecision);
			this.startedSpans.add(1, {
				[semconv_1.ATTR_OTEL_SPAN_PARENT_ORIGIN]: parentOrigin(parentSpanCtx),
				[semconv_1.ATTR_OTEL_SPAN_SAMPLING_RESULT]: samplingDecisionStr
			});
			if (samplingDecision === Sampler_1.SamplingDecision.NOT_RECORD) return () => {};
			const liveSpanAttributes = { [semconv_1.ATTR_OTEL_SPAN_SAMPLING_RESULT]: samplingDecisionStr };
			this.liveSpans.add(1, liveSpanAttributes);
			return () => {
				this.liveSpans.add(-1, liveSpanAttributes);
			};
		}
	};
	exports.TracerMetrics = TracerMetrics;
	function parentOrigin(parentSpanContext) {
		if (!parentSpanContext) return "none";
		if (parentSpanContext.isRemote) return "remote";
		return "local";
	}
	function samplingDecisionToString(decision) {
		switch (decision) {
			case Sampler_1.SamplingDecision.RECORD_AND_SAMPLED: return "RECORD_AND_SAMPLE";
			case Sampler_1.SamplingDecision.RECORD: return "RECORD_ONLY";
			case Sampler_1.SamplingDecision.NOT_RECORD: return "DROP";
		}
	}
}));
//#endregion
//#region node_modules/@opentelemetry/sdk-trace-base/build/src/version.js
var require_version = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.VERSION = void 0;
	exports.VERSION = "2.8.0";
}));
//#endregion
//#region node_modules/@opentelemetry/sdk-trace-base/build/src/Tracer.js
var require_Tracer = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Tracer = void 0;
	const api = require_src$1();
	const core_1 = require_src$2();
	const Span_1 = require_Span();
	const utility_1 = require_utility();
	const platform_1 = require_platform();
	const TracerMetrics_1 = require_TracerMetrics();
	const version_1 = require_version();
	const inspect_1 = require_inspect();
	/**
	* This class represents a basic tracer.
	*/
	var Tracer = class {
		_sampler;
		_generalLimits;
		_spanLimits;
		_idGenerator;
		instrumentationScope;
		_resource;
		_spanProcessor;
		_tracerMetrics;
		/**
		* Constructs a new Tracer instance.
		*/
		constructor(instrumentationScope, config, resource, spanProcessor) {
			const localConfig = (0, utility_1.mergeConfig)(config);
			this._sampler = localConfig.sampler;
			this._generalLimits = localConfig.generalLimits;
			this._spanLimits = localConfig.spanLimits;
			this._idGenerator = config.idGenerator || new platform_1.RandomIdGenerator();
			this._resource = resource;
			this._spanProcessor = spanProcessor;
			this.instrumentationScope = instrumentationScope;
			const meter = localConfig.meterProvider ? localConfig.meterProvider.getMeter("@opentelemetry/sdk-trace", version_1.VERSION) : api.createNoopMeter();
			this._tracerMetrics = new TracerMetrics_1.TracerMetrics(meter);
		}
		/**
		* Starts a new Span or returns the default NoopSpan based on the sampling
		* decision.
		*/
		startSpan(name, options = {}, context = api.context.active()) {
			if (options.root) context = api.trace.deleteSpan(context);
			const parentSpan = api.trace.getSpan(context);
			if ((0, core_1.isTracingSuppressed)(context)) {
				api.diag.debug("Instrumentation suppressed, returning Noop Span");
				return api.trace.wrapSpanContext(api.INVALID_SPAN_CONTEXT);
			}
			const parentSpanContext = parentSpan?.spanContext();
			const spanId = this._idGenerator.generateSpanId();
			let validParentSpanContext;
			let traceId;
			let traceState;
			if (!parentSpanContext || !api.trace.isSpanContextValid(parentSpanContext)) traceId = this._idGenerator.generateTraceId();
			else {
				traceId = parentSpanContext.traceId;
				traceState = parentSpanContext.traceState;
				validParentSpanContext = parentSpanContext;
			}
			const spanKind = options.kind ?? api.SpanKind.INTERNAL;
			const links = (options.links ?? []).map((link) => {
				return {
					context: link.context,
					attributes: (0, core_1.sanitizeAttributes)(link.attributes)
				};
			});
			const attributes = (0, core_1.sanitizeAttributes)(options.attributes);
			const samplingResult = this._sampler.shouldSample(context, traceId, name, spanKind, attributes, links);
			const recordEndMetrics = this._tracerMetrics.startSpan(parentSpanContext, samplingResult.decision);
			traceState = samplingResult.traceState ?? traceState;
			const traceFlags = samplingResult.decision === api.SamplingDecision.RECORD_AND_SAMPLED ? api.TraceFlags.SAMPLED : api.TraceFlags.NONE;
			const spanContext = {
				traceId,
				spanId,
				traceFlags,
				traceState
			};
			if (samplingResult.decision === api.SamplingDecision.NOT_RECORD) {
				api.diag.debug("Recording is off, propagating context in a non-recording span");
				return api.trace.wrapSpanContext(spanContext);
			}
			const initAttributes = (0, core_1.sanitizeAttributes)(Object.assign(attributes, samplingResult.attributes));
			return new Span_1.SpanImpl({
				resource: this._resource,
				scope: this.instrumentationScope,
				context,
				spanContext,
				name,
				kind: spanKind,
				links,
				parentSpanContext: validParentSpanContext,
				attributes: initAttributes,
				startTime: options.startTime,
				spanProcessor: this._spanProcessor,
				spanLimits: this._spanLimits,
				recordEndMetrics
			});
		}
		startActiveSpan(name, arg2, arg3, arg4) {
			let opts;
			let ctx;
			let fn;
			if (arguments.length < 2) return;
			else if (arguments.length === 2) fn = arg2;
			else if (arguments.length === 3) {
				opts = arg2;
				fn = arg3;
			} else {
				opts = arg2;
				ctx = arg3;
				fn = arg4;
			}
			const parentContext = ctx ?? api.context.active();
			const span = this.startSpan(name, opts, parentContext);
			const contextWithSpanSet = api.trace.setSpan(parentContext, span);
			return api.context.with(contextWithSpanSet, fn, void 0, span);
		}
		/** Returns the active {@link GeneralLimits}. */
		getGeneralLimits() {
			return this._generalLimits;
		}
		/** Returns the active {@link SpanLimits}. */
		getSpanLimits() {
			return this._spanLimits;
		}
		[inspect_1.inspectCustom](depth, options, inspect) {
			const payload = {
				instrumentationScope: this.instrumentationScope,
				resource: { attributes: (0, inspect_1.settledResourceAttributes)(this._resource) },
				spanLimits: this._spanLimits,
				generalLimits: this._generalLimits
			};
			return (0, inspect_1.formatInspect)("Tracer", payload, depth, options, inspect);
		}
	};
	exports.Tracer = Tracer;
}));
//#endregion
//#region node_modules/@opentelemetry/sdk-trace-base/build/src/MultiSpanProcessor.js
var require_MultiSpanProcessor = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.MultiSpanProcessor = void 0;
	const core_1 = require_src$2();
	/**
	* Implementation of the {@link SpanProcessor} that simply forwards all
	* received events to a list of {@link SpanProcessor}s.
	*/
	var MultiSpanProcessor = class {
		_spanProcessors;
		constructor(spanProcessors) {
			this._spanProcessors = spanProcessors;
		}
		forceFlush() {
			const promises = [];
			for (const spanProcessor of this._spanProcessors) promises.push(spanProcessor.forceFlush());
			return new Promise((resolve) => {
				Promise.all(promises).then(() => {
					resolve();
				}).catch((error) => {
					(0, core_1.globalErrorHandler)(error || /* @__PURE__ */ new Error("MultiSpanProcessor: forceFlush failed"));
					resolve();
				});
			});
		}
		onStart(span, context) {
			for (const spanProcessor of this._spanProcessors) spanProcessor.onStart(span, context);
		}
		onEnding(span) {
			for (const spanProcessor of this._spanProcessors) if (spanProcessor.onEnding) spanProcessor.onEnding(span);
		}
		onEnd(span) {
			for (const spanProcessor of this._spanProcessors) spanProcessor.onEnd(span);
		}
		shutdown() {
			const promises = [];
			for (const spanProcessor of this._spanProcessors) promises.push(spanProcessor.shutdown());
			return new Promise((resolve, reject) => {
				Promise.all(promises).then(() => {
					resolve();
				}, reject);
			});
		}
	};
	exports.MultiSpanProcessor = MultiSpanProcessor;
}));
//#endregion
//#region node_modules/@opentelemetry/sdk-trace-base/build/src/BasicTracerProvider.js
var require_BasicTracerProvider = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.BasicTracerProvider = exports.ForceFlushState = void 0;
	const core_1 = require_src$2();
	const resources_1 = require_src$4();
	const Tracer_1 = require_Tracer();
	const config_1 = require_config();
	const MultiSpanProcessor_1 = require_MultiSpanProcessor();
	const utility_1 = require_utility();
	const inspect_1 = require_inspect();
	var ForceFlushState;
	(function(ForceFlushState) {
		ForceFlushState[ForceFlushState["resolved"] = 0] = "resolved";
		ForceFlushState[ForceFlushState["timeout"] = 1] = "timeout";
		ForceFlushState[ForceFlushState["error"] = 2] = "error";
		ForceFlushState[ForceFlushState["unresolved"] = 3] = "unresolved";
	})(ForceFlushState = exports.ForceFlushState || (exports.ForceFlushState = {}));
	/**
	* This class represents a basic tracer provider which platform libraries can extend
	*/
	var BasicTracerProvider = class {
		_config;
		_tracers = /* @__PURE__ */ new Map();
		_resource;
		_activeSpanProcessor;
		constructor(config = {}) {
			const mergedConfig = (0, core_1.merge)({}, (0, config_1.loadDefaultConfig)(), (0, utility_1.reconfigureLimits)(config));
			this._resource = mergedConfig.resource ?? (0, resources_1.defaultResource)();
			this._config = Object.assign({}, mergedConfig, { resource: this._resource });
			const spanProcessors = [];
			if (config.spanProcessors?.length) spanProcessors.push(...config.spanProcessors);
			this._activeSpanProcessor = new MultiSpanProcessor_1.MultiSpanProcessor(spanProcessors);
		}
		getTracer(name, version, options) {
			const key = `${name}@${version || ""}:${options?.schemaUrl || ""}`;
			if (!this._tracers.has(key)) this._tracers.set(key, new Tracer_1.Tracer({
				name,
				version,
				schemaUrl: options?.schemaUrl
			}, this._config, this._resource, this._activeSpanProcessor));
			return this._tracers.get(key);
		}
		forceFlush() {
			const timeout = this._config.forceFlushTimeoutMillis;
			const promises = this._activeSpanProcessor["_spanProcessors"].map((spanProcessor) => {
				return new Promise((resolve) => {
					let state;
					const timeoutInterval = setTimeout(() => {
						resolve(/* @__PURE__ */ new Error(`Span processor did not completed within timeout period of ${timeout} ms`));
						state = ForceFlushState.timeout;
					}, timeout);
					spanProcessor.forceFlush().then(() => {
						clearTimeout(timeoutInterval);
						if (state !== ForceFlushState.timeout) {
							state = ForceFlushState.resolved;
							resolve(state);
						}
					}).catch((error) => {
						clearTimeout(timeoutInterval);
						state = ForceFlushState.error;
						resolve(error);
					});
				});
			});
			return new Promise((resolve, reject) => {
				Promise.all(promises).then((results) => {
					const errors = results.filter((result) => result !== ForceFlushState.resolved);
					if (errors.length > 0) reject(errors);
					else resolve();
				}).catch((error) => reject([error]));
			});
		}
		shutdown() {
			return this._activeSpanProcessor.shutdown();
		}
		[inspect_1.inspectCustom](depth, options, inspect) {
			const processors = this._activeSpanProcessor["_spanProcessors"];
			const payload = {
				resource: { attributes: (0, inspect_1.settledResourceAttributes)(this._resource) },
				tracers: Array.from(this._tracers.keys()),
				spanProcessors: processors.map((p) => p.constructor?.name ?? "SpanProcessor")
			};
			return (0, inspect_1.formatInspect)("BasicTracerProvider", payload, depth, options, inspect);
		}
	};
	exports.BasicTracerProvider = BasicTracerProvider;
}));
//#endregion
//#region node_modules/@opentelemetry/sdk-trace-base/build/src/export/ConsoleSpanExporter.js
var require_ConsoleSpanExporter = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ConsoleSpanExporter = void 0;
	const core_1 = require_src$2();
	/**
	* This is implementation of {@link SpanExporter} that prints spans to the
	* console. This class can be used for diagnostic purposes.
	*
	* NOTE: This {@link SpanExporter} is intended for diagnostics use only, output rendered to the console may change at any time.
	*/
	var ConsoleSpanExporter = class {
		/**
		* Export spans.
		* @param spans
		* @param resultCallback
		*/
		export(spans, resultCallback) {
			return this._sendSpans(spans, resultCallback);
		}
		/**
		* Shutdown the exporter.
		*/
		shutdown() {
			this._sendSpans([]);
			return this.forceFlush();
		}
		/**
		* Exports any pending spans in exporter
		*/
		forceFlush() {
			return Promise.resolve();
		}
		/**
		* converts span info into more readable format
		* @param span
		*/
		_exportInfo(span) {
			return {
				resource: { attributes: span.resource.attributes },
				instrumentationScope: span.instrumentationScope,
				traceId: span.spanContext().traceId,
				parentSpanContext: span.parentSpanContext,
				traceState: span.spanContext().traceState?.serialize(),
				name: span.name,
				id: span.spanContext().spanId,
				kind: span.kind,
				timestamp: (0, core_1.hrTimeToMicroseconds)(span.startTime),
				duration: (0, core_1.hrTimeToMicroseconds)(span.duration),
				attributes: span.attributes,
				status: span.status,
				events: span.events,
				links: span.links
			};
		}
		/**
		* Showing spans in console
		* @param spans
		* @param done
		*/
		_sendSpans(spans, done) {
			for (const span of spans) console.dir(this._exportInfo(span), { depth: 3 });
			if (done) return done({ code: core_1.ExportResultCode.SUCCESS });
		}
	};
	exports.ConsoleSpanExporter = ConsoleSpanExporter;
}));
//#endregion
//#region node_modules/@opentelemetry/sdk-trace-base/build/src/export/InMemorySpanExporter.js
var require_InMemorySpanExporter = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.InMemorySpanExporter = void 0;
	const core_1 = require_src$2();
	/**
	* This class can be used for testing purposes. It stores the exported spans
	* in a list in memory that can be retrieved using the `getFinishedSpans()`
	* method.
	*/
	var InMemorySpanExporter = class {
		_finishedSpans = [];
		/**
		* Indicates if the exporter has been "shutdown."
		* When false, exported spans will not be stored in-memory.
		*/
		_stopped = false;
		export(spans, resultCallback) {
			if (this._stopped) return resultCallback({
				code: core_1.ExportResultCode.FAILED,
				error: /* @__PURE__ */ new Error("Exporter has been stopped")
			});
			this._finishedSpans.push(...spans);
			setTimeout(() => resultCallback({ code: core_1.ExportResultCode.SUCCESS }), 0);
		}
		shutdown() {
			this._stopped = true;
			this._finishedSpans = [];
			return this.forceFlush();
		}
		/**
		* Exports any pending spans in the exporter
		*/
		forceFlush() {
			return Promise.resolve();
		}
		reset() {
			this._finishedSpans = [];
		}
		getFinishedSpans() {
			return this._finishedSpans;
		}
	};
	exports.InMemorySpanExporter = InMemorySpanExporter;
}));
//#endregion
//#region node_modules/@opentelemetry/sdk-trace-base/build/src/export/SimpleSpanProcessor.js
var require_SimpleSpanProcessor = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SimpleSpanProcessor = void 0;
	const api_1 = require_src$1();
	const core_1 = require_src$2();
	/**
	* An implementation of the {@link SpanProcessor} that converts the {@link Span}
	* to {@link ReadableSpan} and passes it to the configured exporter.
	*
	* Only spans that are sampled are converted.
	*
	* NOTE: This {@link SpanProcessor} exports every ended span individually instead of batching spans together, which causes significant performance overhead with most exporters. For production use, please consider using the {@link BatchSpanProcessor} instead.
	*/
	var SimpleSpanProcessor = class {
		_exporter;
		_shutdownOnce;
		_pendingExports;
		constructor(exporter) {
			this._exporter = exporter;
			this._shutdownOnce = new core_1.BindOnceFuture(this._shutdown, this);
			this._pendingExports = /* @__PURE__ */ new Set();
		}
		async forceFlush() {
			await Promise.all(Array.from(this._pendingExports));
			if (this._exporter.forceFlush) await this._exporter.forceFlush();
		}
		onStart(_span, _parentContext) {}
		onEnd(span) {
			if (this._shutdownOnce.isCalled) return;
			if ((span.spanContext().traceFlags & api_1.TraceFlags.SAMPLED) === 0) return;
			const pendingExport = this._doExport(span).catch((err) => (0, core_1.globalErrorHandler)(err));
			this._pendingExports.add(pendingExport);
			pendingExport.finally(() => this._pendingExports.delete(pendingExport));
		}
		async _doExport(span) {
			if (span.resource.asyncAttributesPending) await span.resource.waitForAsyncAttributes?.();
			const result = await core_1.internal._export(this._exporter, [span]);
			if (result.code !== core_1.ExportResultCode.SUCCESS) throw result.error ?? /* @__PURE__ */ new Error(`SimpleSpanProcessor: span export failed (status ${result})`);
		}
		shutdown() {
			return this._shutdownOnce.call();
		}
		_shutdown() {
			return this._exporter.shutdown();
		}
	};
	exports.SimpleSpanProcessor = SimpleSpanProcessor;
}));
//#endregion
//#region node_modules/@opentelemetry/sdk-trace-base/build/src/export/NoopSpanProcessor.js
var require_NoopSpanProcessor = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.NoopSpanProcessor = void 0;
	/** No-op implementation of SpanProcessor */
	var NoopSpanProcessor = class {
		onStart(_span, _context) {}
		onEnd(_span) {}
		shutdown() {
			return Promise.resolve();
		}
		forceFlush() {
			return Promise.resolve();
		}
	};
	exports.NoopSpanProcessor = NoopSpanProcessor;
}));
//#endregion
//#region node_modules/@opentelemetry/sdk-trace-base/build/src/index.js
var require_src = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SamplingDecision = exports.TraceIdRatioBasedSampler = exports.ParentBasedSampler = exports.AlwaysOnSampler = exports.AlwaysOffSampler = exports.NoopSpanProcessor = exports.SimpleSpanProcessor = exports.InMemorySpanExporter = exports.ConsoleSpanExporter = exports.RandomIdGenerator = exports.BatchSpanProcessor = exports.BasicTracerProvider = void 0;
	var BasicTracerProvider_1 = require_BasicTracerProvider();
	Object.defineProperty(exports, "BasicTracerProvider", {
		enumerable: true,
		get: function() {
			return BasicTracerProvider_1.BasicTracerProvider;
		}
	});
	var platform_1 = require_platform();
	Object.defineProperty(exports, "BatchSpanProcessor", {
		enumerable: true,
		get: function() {
			return platform_1.BatchSpanProcessor;
		}
	});
	Object.defineProperty(exports, "RandomIdGenerator", {
		enumerable: true,
		get: function() {
			return platform_1.RandomIdGenerator;
		}
	});
	var ConsoleSpanExporter_1 = require_ConsoleSpanExporter();
	Object.defineProperty(exports, "ConsoleSpanExporter", {
		enumerable: true,
		get: function() {
			return ConsoleSpanExporter_1.ConsoleSpanExporter;
		}
	});
	var InMemorySpanExporter_1 = require_InMemorySpanExporter();
	Object.defineProperty(exports, "InMemorySpanExporter", {
		enumerable: true,
		get: function() {
			return InMemorySpanExporter_1.InMemorySpanExporter;
		}
	});
	var SimpleSpanProcessor_1 = require_SimpleSpanProcessor();
	Object.defineProperty(exports, "SimpleSpanProcessor", {
		enumerable: true,
		get: function() {
			return SimpleSpanProcessor_1.SimpleSpanProcessor;
		}
	});
	var NoopSpanProcessor_1 = require_NoopSpanProcessor();
	Object.defineProperty(exports, "NoopSpanProcessor", {
		enumerable: true,
		get: function() {
			return NoopSpanProcessor_1.NoopSpanProcessor;
		}
	});
	var AlwaysOffSampler_1 = require_AlwaysOffSampler();
	Object.defineProperty(exports, "AlwaysOffSampler", {
		enumerable: true,
		get: function() {
			return AlwaysOffSampler_1.AlwaysOffSampler;
		}
	});
	var AlwaysOnSampler_1 = require_AlwaysOnSampler();
	Object.defineProperty(exports, "AlwaysOnSampler", {
		enumerable: true,
		get: function() {
			return AlwaysOnSampler_1.AlwaysOnSampler;
		}
	});
	var ParentBasedSampler_1 = require_ParentBasedSampler();
	Object.defineProperty(exports, "ParentBasedSampler", {
		enumerable: true,
		get: function() {
			return ParentBasedSampler_1.ParentBasedSampler;
		}
	});
	var TraceIdRatioBasedSampler_1 = require_TraceIdRatioBasedSampler();
	Object.defineProperty(exports, "TraceIdRatioBasedSampler", {
		enumerable: true,
		get: function() {
			return TraceIdRatioBasedSampler_1.TraceIdRatioBasedSampler;
		}
	});
	var Sampler_1 = require_Sampler();
	Object.defineProperty(exports, "SamplingDecision", {
		enumerable: true,
		get: function() {
			return Sampler_1.SamplingDecision;
		}
	});
}));
//#endregion
export { require_src as t };
