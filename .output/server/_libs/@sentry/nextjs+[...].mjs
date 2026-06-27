import { fileURLToPath as __eveFileURLToPath } from "node:url";
import { dirname as __eveDirname } from "node:path";
const __filename = __eveFileURLToPath(import.meta.url);
const __dirname = __eveDirname(__filename);
import { i as __require, t as __commonJSMin } from "../../_runtime.mjs";
import { n as require_attributes, t as require_op } from "../sentry__conventions.mjs";
import { t as require_cjs$4 } from "../sentry__core.mjs";
import { t as require_src } from "../opentelemetry__api.mjs";
import { t as require_src$1 } from "../opentelemetry__instrumentation.mjs";
import { n as require_src$3, t as require_src$2 } from "../@opentelemetry/core+[...].mjs";
import { t as require_src$4 } from "../opentelemetry__sdk-trace-base.mjs";
//#region node_modules/@sentry/node-core/build/cjs/otel/instrument.js
var require_instrument = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const instrumentation = require_src$1();
	const INSTRUMENTED = {};
	function generateInstrumentOnce(name, creatorOrClass, optionsCallback) {
		if (optionsCallback) return _generateInstrumentOnceWithOptions(name, creatorOrClass, optionsCallback);
		return _generateInstrumentOnce(name, creatorOrClass);
	}
	function _generateInstrumentOnce(name, creator) {
		return Object.assign((options) => {
			const instrumented = INSTRUMENTED[name];
			if (instrumented) {
				if (options) instrumented.setConfig(options);
				return instrumented;
			}
			const instrumentation$1 = creator(options);
			INSTRUMENTED[name] = instrumentation$1;
			instrumentation.registerInstrumentations({ instrumentations: [instrumentation$1] });
			return instrumentation$1;
		}, { id: name });
	}
	function _generateInstrumentOnceWithOptions(name, instrumentationClass, optionsCallback) {
		return Object.assign((_options) => {
			const options = optionsCallback(_options);
			const instrumented = INSTRUMENTED[name];
			if (instrumented) {
				instrumented.setConfig(options);
				return instrumented;
			}
			const instrumentation$1 = new instrumentationClass(options);
			INSTRUMENTED[name] = instrumentation$1;
			instrumentation.registerInstrumentations({ instrumentations: [instrumentation$1] });
			return instrumentation$1;
		}, { id: name });
	}
	function instrumentWhenWrapped(instrumentation) {
		let isWrapped = false;
		let callbacks = [];
		if (!hasWrap(instrumentation)) isWrapped = true;
		else {
			const originalWrap = instrumentation["_wrap"];
			instrumentation["_wrap"] = (...args) => {
				isWrapped = true;
				callbacks.forEach((callback) => callback());
				callbacks = [];
				return originalWrap(...args);
			};
		}
		const registerCallback = (callback) => {
			if (isWrapped) callback();
			else callbacks.push(callback);
		};
		return registerCallback;
	}
	function hasWrap(instrumentation) {
		return typeof instrumentation["_wrap"] === "function";
	}
	exports.INSTRUMENTED = INSTRUMENTED;
	exports.generateInstrumentOnce = generateInstrumentOnce;
	exports.instrumentWhenWrapped = instrumentWhenWrapped;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/debug-build.js
var require_debug_build$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	exports.DEBUG_BUILD = typeof __SENTRY_DEBUG__ === "undefined" || __SENTRY_DEBUG__;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/integrations/http/httpServerIntegration.js
var require_httpServerIntegration = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const diagnosticsChannel$3 = __require("node:diagnostics_channel");
	const api = require_src();
	const core = require_cjs$4();
	const debugBuild = require_debug_build$3();
	const HTTP_SERVER_INSTRUMENTED_KEY = api.createContextKey("sentry_http_server_instrumented");
	const INTEGRATION_NAME = "Http.Server";
	function addStartSpanCallback(request, callback) {
		core.addNonEnumerableProperty(request, "_startSpanCallback", new WeakRef(callback));
	}
	const _httpServerIntegration = ((options = {}) => {
		const _options = {
			sessions: options.sessions ?? true,
			sessionFlushingDelayMS: options.sessionFlushingDelayMS ?? 6e4,
			maxRequestBodySize: options.maxRequestBodySize ?? "medium",
			spans: false,
			ignoreRequestBody: options.ignoreRequestBody,
			/**
			* Hook called by core's `instrumentServer` to wrap the upstream
			* `emit('request')` call.
			*
			* We use it to extract OTel context from request headers and re-enter
			* the OTel context before the framework sees the request, so subsequent
			* spans (eg from `httpServerSpansIntegration`) attach to the right trace.
			*/
			wrapServerEmitRequest(request, response, normalizedRequest, next) {
				const client = core.getClient();
				if (!client) return next();
				if (api.context.active().getValue(HTTP_SERVER_INSTRUMENTED_KEY)) return next();
				const ctx = api.propagation.extract(api.context.active(), normalizedRequest.headers).setValue(HTTP_SERVER_INSTRUMENTED_KEY, true);
				api.context.with(ctx, () => {
					client.emit("httpServerRequest", request, response, normalizedRequest);
					const callback = request._startSpanCallback?.deref();
					if (callback) callback(() => {
						next();
						return true;
					});
					else next();
				});
			}
		};
		return {
			name: INTEGRATION_NAME,
			setupOnce() {
				const { [core.HTTP_ON_SERVER_REQUEST]: onHttpServerRequestStart } = core.getHttpServerSubscriptions(_options);
				diagnosticsChannel$3.subscribe(core.HTTP_ON_SERVER_REQUEST, onHttpServerRequestStart);
			},
			afterAllSetup(client) {
				if (debugBuild.DEBUG_BUILD && client.getIntegrationByName("Http")) core.debug.warn("It seems that you have manually added `httpServerIntegration` while `httpIntegration` is also present. Make sure to remove `httpServerIntegration` when adding `httpIntegration`.");
			}
		};
	});
	const httpServerIntegration = _httpServerIntegration;
	exports.recordRequestSession = core.recordRequestSession;
	exports.addStartSpanCallback = addStartSpanCallback;
	exports.httpServerIntegration = httpServerIntegration;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/integrations/http/httpServerSpansIntegration.js
var require_httpServerSpansIntegration = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const node_events$2 = __require("node:events");
	const api = require_src();
	const core$1 = require_src$2();
	const attributes = require_attributes();
	const core = require_cjs$4();
	const debugBuild = require_debug_build$3();
	const httpServerIntegration = require_httpServerIntegration();
	const INTEGRATION_NAME = "Http.ServerSpans";
	const _httpServerSpansIntegration = ((options = {}) => {
		const ignoreStaticAssets = options.ignoreStaticAssets ?? true;
		const ignoreIncomingRequests = options.ignoreIncomingRequests;
		const ignoreStatusCodes = options.ignoreStatusCodes ?? [
			[401, 404],
			[301, 303],
			[305, 399]
		];
		const { onSpanCreated } = options;
		const { requestHook, responseHook, applyCustomAttributesOnSpan } = options.instrumentation ?? {};
		return {
			name: INTEGRATION_NAME,
			setup(client) {
				if (typeof __SENTRY_TRACING__ !== "undefined" && !__SENTRY_TRACING__) return;
				client.on("httpServerRequest", (_request, _response, normalizedRequest) => {
					const request = _request;
					const response = _response;
					const startSpan = (next) => {
						if (shouldIgnoreSpansForIncomingRequest(request, {
							ignoreStaticAssets,
							ignoreIncomingRequests
						})) {
							debugBuild.DEBUG_BUILD && core.debug.log(INTEGRATION_NAME, "Skipping span creation for incoming request", request.url);
							return next();
						}
						const fullUrl = normalizedRequest.url || request.url || "/";
						const urlObj = core.parseStringToURLObject(fullUrl);
						const headers = request.headers;
						const userAgent = headers["user-agent"];
						const ips = headers["x-forwarded-for"];
						const httpVersion = request.httpVersion;
						const host = headers.host;
						const hostname = host?.replace(/^(.*)(:[0-9]{1,5})/, "$1") || "localhost";
						const tracer = client.tracer;
						const scheme = fullUrl.startsWith("https") ? "https" : "http";
						const method = normalizedRequest.method || request.method?.toUpperCase() || "GET";
						const httpTargetWithoutQueryFragment = urlObj ? urlObj.pathname : core.stripUrlQueryAndFragment(fullUrl);
						const bestEffortTransactionName = `${method} ${httpTargetWithoutQueryFragment}`;
						const span = tracer.startSpan(bestEffortTransactionName, {
							kind: api.SpanKind.SERVER,
							attributes: {
								[core.SEMANTIC_ATTRIBUTE_SENTRY_OP]: "http.server",
								[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.otel.http",
								"sentry.http.prefetch": isKnownPrefetchRequest(request) || void 0,
								"http.url": fullUrl,
								"http.method": normalizedRequest.method,
								"http.target": urlObj ? `${urlObj.pathname}${urlObj.search}` : httpTargetWithoutQueryFragment,
								"http.host": host,
								"net.host.name": hostname,
								"http.client_ip": typeof ips === "string" ? ips.split(",")[0] : void 0,
								"http.user_agent": userAgent,
								"http.scheme": scheme,
								"http.flavor": httpVersion,
								"net.transport": httpVersion?.toUpperCase() === "QUIC" ? "ip_udp" : "ip_tcp",
								...getRequestContentLengthAttribute(request),
								...core.httpHeadersToSpanAttributes(normalizedRequest.headers || {}, client.getDataCollectionOptions())
							}
						});
						requestHook?.(span, request);
						responseHook?.(span, response);
						applyCustomAttributesOnSpan?.(span, request, response);
						onSpanCreated?.(span, request, response);
						const rpcMetadata = {
							type: core$1.RPCType.HTTP,
							span
						};
						return api.context.with(core$1.setRPCMetadata(api.trace.setSpan(api.context.active(), span), rpcMetadata), () => {
							api.context.bind(api.context.active(), request);
							api.context.bind(api.context.active(), response);
							let isEnded = false;
							function endSpan(status) {
								if (isEnded) return;
								isEnded = true;
								const newAttributes = getIncomingRequestAttributesOnResponse(request, response);
								span.setAttributes(newAttributes);
								span.setStatus(status);
								span.end();
								const route = newAttributes["http.route"];
								if (route) core.getIsolationScope().setTransactionName(`${request.method?.toUpperCase() || "GET"} ${route}`);
							}
							response.on("close", () => {
								endSpan(core.getSpanStatusFromHttpCode(response.statusCode));
							});
							response.on(node_events$2.errorMonitor, () => {
								const httpStatus = core.getSpanStatusFromHttpCode(response.statusCode);
								endSpan(httpStatus.code === core.SPAN_STATUS_ERROR ? httpStatus : { code: core.SPAN_STATUS_ERROR });
							});
							return next();
						});
					};
					httpServerIntegration.addStartSpanCallback(request, startSpan);
				});
			},
			processEvent(event) {
				if (event.type === "transaction") {
					const statusCode = event.contexts?.trace?.data?.["http.response.status_code"];
					if (typeof statusCode === "number") {
						if (shouldFilterStatusCode(statusCode, ignoreStatusCodes)) {
							debugBuild.DEBUG_BUILD && core.debug.log("Dropping transaction due to status code", statusCode);
							return null;
						}
					}
				}
				return event;
			},
			afterAllSetup(client) {
				if (!debugBuild.DEBUG_BUILD) return;
				if (client.getIntegrationByName("Http")) core.debug.warn("It seems that you have manually added `httpServerSpansIntegration` while `httpIntegration` is also present. Make sure to remove `httpIntegration` when adding `httpServerSpansIntegration`.");
				if (!client.getIntegrationByName("Http.Server")) core.debug.error("It seems that you have manually added `httpServerSpansIntegration` without adding `httpServerIntegration`. This is a requiement for spans to be created - please add the `httpServerIntegration` integration.");
			}
		};
	});
	const httpServerSpansIntegration = _httpServerSpansIntegration;
	function isKnownPrefetchRequest(req) {
		return req.headers["next-router-prefetch"] === "1";
	}
	function isStaticAssetRequest(urlPath) {
		const path = core.stripUrlQueryAndFragment(urlPath);
		if (path.match(/\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot|webp|avif)$/)) return true;
		if (path.match(/^\/(robots\.txt|sitemap\.xml|manifest\.json|browserconfig\.xml)$/)) return true;
		return false;
	}
	function shouldIgnoreSpansForIncomingRequest(request, { ignoreStaticAssets, ignoreIncomingRequests }) {
		if (core$1.isTracingSuppressed(api.context.active())) return true;
		const urlPath = request.url;
		const method = request.method?.toUpperCase();
		if (method === "OPTIONS" || method === "HEAD" || !urlPath) return true;
		if (ignoreStaticAssets && method === "GET" && isStaticAssetRequest(urlPath)) return true;
		if (ignoreIncomingRequests?.(urlPath, request)) return true;
		return false;
	}
	function getRequestContentLengthAttribute(request) {
		const length = getContentLength(request.headers);
		if (length == null) return {};
		if (isCompressed(request.headers)) return { ["http.request_content_length"]: length };
		else return { ["http.request_content_length_uncompressed"]: length };
	}
	function getContentLength(headers) {
		const contentLengthHeader = headers["content-length"];
		if (contentLengthHeader === void 0) return null;
		const contentLength = parseInt(contentLengthHeader, 10);
		if (isNaN(contentLength)) return null;
		return contentLength;
	}
	function isCompressed(headers) {
		const encoding = headers["content-encoding"];
		return !!encoding && encoding !== "identity";
	}
	function getIncomingRequestAttributesOnResponse(request, response) {
		const { socket } = request;
		const { statusCode, statusMessage } = response;
		const newAttributes = {
			[attributes.HTTP_RESPONSE_STATUS_CODE]: statusCode,
			[attributes.HTTP_STATUS_CODE]: statusCode,
			"http.status_text": statusMessage?.toUpperCase()
		};
		const rpcMetadata = core$1.getRPCMetadata(api.context.active());
		if (socket) {
			const { localAddress, localPort, remoteAddress, remotePort } = socket;
			newAttributes[attributes.NET_HOST_IP] = localAddress;
			newAttributes[attributes.NET_HOST_PORT] = localPort;
			newAttributes[attributes.NET_PEER_IP] = remoteAddress;
			newAttributes["net.peer.port"] = remotePort;
		}
		newAttributes[attributes.HTTP_STATUS_CODE] = statusCode;
		newAttributes["http.status_text"] = (statusMessage || "").toUpperCase();
		if (rpcMetadata?.type === core$1.RPCType.HTTP && rpcMetadata.route !== void 0) {
			const routeName = rpcMetadata.route;
			newAttributes[attributes.HTTP_ROUTE] = routeName;
		}
		return newAttributes;
	}
	function shouldFilterStatusCode(statusCode, dropForStatusCodes) {
		return dropForStatusCodes.some((code) => {
			if (typeof code === "number") return code === statusCode;
			const [min, max] = code;
			return statusCode >= min && statusCode <= max;
		});
	}
	exports.httpServerSpansIntegration = httpServerSpansIntegration;
	exports.isStaticAssetRequest = isStaticAssetRequest;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/integrations/http/constants.js
var require_constants$8 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	exports.INSTRUMENTATION_NAME = "@sentry/instrumentation-http";
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/nodeVersion.js
var require_nodeVersion = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const NODE_VERSION = require_cjs$4().parseSemver(process.versions.node);
	const NODE_MAJOR = NODE_VERSION.major;
	const NODE_MINOR = NODE_VERSION.minor;
	exports.NODE_MAJOR = NODE_MAJOR;
	exports.NODE_MINOR = NODE_MINOR;
	exports.NODE_VERSION = NODE_VERSION;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/integrations/http/SentryHttpInstrumentation.js
var require_SentryHttpInstrumentation = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const diagnosticsChannel$2 = __require("node:diagnostics_channel");
	const api = require_src();
	const core$1 = require_src$2();
	const instrumentation = require_src$1();
	const core = require_cjs$4();
	const constants = require_constants$8();
	const nodeVersion = require_nodeVersion();
	const node_events$1 = __require("node:events");
	const http$3 = __require("node:http");
	const https$1 = __require("node:https");
	const FULLY_SUPPORTS_HTTP_DIAGNOSTICS_CHANNEL = nodeVersion.NODE_VERSION.major === 22 && nodeVersion.NODE_VERSION.minor >= 12 || nodeVersion.NODE_VERSION.major === 23 && nodeVersion.NODE_VERSION.minor >= 2 || nodeVersion.NODE_VERSION.major >= 24;
	var SentryHttpInstrumentation = class extends instrumentation.InstrumentationBase {
		constructor(config = {}) {
			super(constants.INSTRUMENTATION_NAME, core.SDK_VERSION, config);
		}
		/** @inheritdoc */
		init() {
			const { outgoingRequestApplyCustomAttributes: applyCustomAttributesOnSpan, ...options } = this.getConfig();
			const patchOptions = {
				propagateTrace: options.propagateTraceInOutgoingRequests,
				applyCustomAttributesOnSpan,
				...options,
				spans: options.createSpansForOutgoingRequests && (options.spans ?? true),
				ignoreOutgoingRequests(url, request) {
					return core$1.isTracingSuppressed(api.context.active()) || !!options.ignoreOutgoingRequests?.(url, core.getRequestOptions(request));
				},
				outgoingRequestHook(span, request) {
					options.outgoingRequestHook?.(span, request);
					const originalOnce = request.once;
					request.once = new Proxy(originalOnce, { apply(target, thisArg, args) {
						const [event] = args;
						if (event !== "response") return target.apply(thisArg, args);
						const parentContext = api.context.active();
						const requestContext = api.trace.setSpan(parentContext, span);
						return api.context.with(requestContext, () => {
							return target.apply(thisArg, args);
						});
					} });
				},
				outgoingResponseHook(span, response) {
					options.outgoingResponseHook?.(span, response);
					api.context.bind(api.context.active(), response);
				},
				errorMonitor: node_events$1.errorMonitor,
				http: http$3,
				https: https$1
			};
			const { [core.HTTP_ON_CLIENT_REQUEST]: onHttpClientRequestCreated } = FULLY_SUPPORTS_HTTP_DIAGNOSTICS_CHANNEL ? core.getHttpClientSubscriptions(patchOptions) : {};
			let hasRegisteredHandlers = false;
			const sub = onHttpClientRequestCreated ? (moduleExports) => {
				if (!hasRegisteredHandlers && onHttpClientRequestCreated) {
					hasRegisteredHandlers = true;
					diagnosticsChannel$2.subscribe(core.HTTP_ON_CLIENT_REQUEST, onHttpClientRequestCreated);
				}
				return moduleExports;
			} : void 0;
			const wrapHttp = sub ?? ((moduleExports) => core.patchHttpModuleClient(moduleExports, patchOptions));
			const wrapHttps = sub ?? ((moduleExports) => core.patchHttpModuleClient(moduleExports, patchOptions));
			return [new instrumentation.InstrumentationNodeModuleDefinition("http", ["*"], wrapHttp), new instrumentation.InstrumentationNodeModuleDefinition("https", ["*"], wrapHttps)];
		}
	};
	exports.SentryHttpInstrumentation = SentryHttpInstrumentation;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/integrations/http/index.js
var require_http$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const instrument = require_instrument();
	const httpServerIntegration = require_httpServerIntegration();
	const httpServerSpansIntegration = require_httpServerSpansIntegration();
	const SentryHttpInstrumentation = require_SentryHttpInstrumentation();
	const INTEGRATION_NAME = "Http";
	const instrumentSentryHttp = instrument.generateInstrumentOnce(`${INTEGRATION_NAME}.sentry`, (options) => {
		return new SentryHttpInstrumentation.SentryHttpInstrumentation(options);
	});
	exports.httpIntegration = core.defineIntegration((options = {}) => {
		const serverOptions = {
			sessions: options.trackIncomingRequestsAsSessions,
			sessionFlushingDelayMS: options.sessionFlushingDelayMS,
			ignoreRequestBody: options.ignoreIncomingRequestBody,
			maxRequestBodySize: options.maxIncomingRequestBodySize
		};
		const serverSpansOptions = {
			ignoreIncomingRequests: options.ignoreIncomingRequests,
			ignoreStaticAssets: options.ignoreStaticAssets,
			ignoreStatusCodes: options.dropSpansForIncomingRequestStatusCodes
		};
		const httpInstrumentationOptions = {
			breadcrumbs: options.breadcrumbs,
			propagateTraceInOutgoingRequests: options.tracePropagation ?? true,
			ignoreOutgoingRequests: options.ignoreOutgoingRequests
		};
		const server = httpServerIntegration.httpServerIntegration(serverOptions);
		const serverSpans = httpServerSpansIntegration.httpServerSpansIntegration(serverSpansOptions);
		const spans = options.spans ?? false;
		const disableIncomingRequestSpans = options.disableIncomingRequestSpans ?? false;
		const enabledServerSpans = spans && !disableIncomingRequestSpans;
		return {
			name: INTEGRATION_NAME,
			setup(client) {
				if (enabledServerSpans) serverSpans.setup(client);
			},
			setupOnce() {
				server.setupOnce();
				instrumentSentryHttp(httpInstrumentationOptions);
			},
			processEvent(event) {
				return serverSpans.processEvent(event);
			}
		};
	});
	exports.instrumentSentryHttp = instrumentSentryHttp;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/utils/outgoingFetchRequest.js
var require_outgoingFetchRequest = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const SENTRY_TRACE_HEADER = "sentry-trace";
	const SENTRY_BAGGAGE_HEADER = "baggage";
	const W3C_TRACEPARENT_HEADER = "traceparent";
	function addTracePropagationHeadersToFetchRequest(request, propagationDecisionMap) {
		const url = getAbsoluteUrl(request.origin, request.path);
		const { tracePropagationTargets, propagateTraceparent } = core.getClient()?.getOptions() || {};
		const addedHeaders = core.shouldPropagateTraceForUrl(url, tracePropagationTargets, propagationDecisionMap) ? core.getTraceData({ propagateTraceparent }) : void 0;
		if (!addedHeaders) return;
		const { "sentry-trace": sentryTrace, baggage, traceparent } = addedHeaders;
		const requestHeaders = Array.isArray(request.headers) ? normalizeUndiciHeaderPairs(request.headers) : stringToArrayHeaders(request.headers);
		_deduplicateArrayHeader(requestHeaders, SENTRY_TRACE_HEADER);
		_deduplicateArrayHeader(requestHeaders, SENTRY_BAGGAGE_HEADER);
		if (propagateTraceparent) _deduplicateArrayHeader(requestHeaders, W3C_TRACEPARENT_HEADER);
		if (!(_findExistingHeaderIndex(requestHeaders, SENTRY_TRACE_HEADER) !== -1)) {
			if (sentryTrace) requestHeaders.push(SENTRY_TRACE_HEADER, sentryTrace);
			if (traceparent && _findExistingHeaderIndex(requestHeaders, "traceparent") === -1) requestHeaders.push("traceparent", traceparent);
			const existingBaggageIndex = _findExistingHeaderIndex(requestHeaders, SENTRY_BAGGAGE_HEADER);
			if (baggage && existingBaggageIndex === -1) requestHeaders.push(SENTRY_BAGGAGE_HEADER, baggage);
			else if (baggage) {
				const existingBaggageValue = requestHeaders[existingBaggageIndex + 1];
				const merged = core.mergeBaggageHeaders(existingBaggageValue, baggage);
				if (merged) requestHeaders[existingBaggageIndex + 1] = merged;
			}
		}
		if (Array.isArray(request.headers)) request.headers.splice(0, request.headers.length, ...requestHeaders);
		else request.headers = arrayToStringHeaders(requestHeaders);
	}
	function normalizeUndiciHeaderPairs(headers) {
		const out = [];
		for (let i = 0; i < headers.length; i++) {
			const entry = headers[i];
			if (i % 2 === 0) out.push(typeof entry === "string" ? entry : String(entry));
			else out.push(Array.isArray(entry) ? entry.join(", ") : entry ?? "");
		}
		return out;
	}
	function stringToArrayHeaders(requestHeaders) {
		const headersArray = requestHeaders.split("\r\n");
		const headers = [];
		for (const header of headersArray) try {
			const colonIndex = header.indexOf(":");
			if (colonIndex === -1) continue;
			const key = header.slice(0, colonIndex).trim();
			const value = header.slice(colonIndex + 1).trim();
			if (key) headers.push(key, value);
		} catch {
			core.debug.warn(`Failed to convert string request header to array header: ${header}`);
		}
		return headers;
	}
	function arrayToStringHeaders(headers) {
		const headerPairs = [];
		for (let i = 0; i < headers.length; i += 2) {
			const key = headers[i];
			const value = headers[i + 1];
			if (!key || value == null) continue;
			headerPairs.push(`${key}: ${value}`);
		}
		if (!headerPairs.length) return "";
		return headerPairs.join("\r\n").concat("\r\n");
	}
	function _deduplicateArrayHeader(headers, headerName) {
		let firstIndex = -1;
		for (let i = 0; i < headers.length; i += 2) {
			if (headers[i] !== headerName) continue;
			if (firstIndex === -1) {
				firstIndex = i;
				continue;
			}
			const firstHeaderValue = headers[firstIndex + 1];
			if (headerName === SENTRY_BAGGAGE_HEADER && firstHeaderValue) {
				const merged = core.mergeBaggageHeaders(headers[i + 1], firstHeaderValue);
				if (merged) headers[firstIndex + 1] = merged;
			}
			headers.splice(i, 2);
			i -= 2;
		}
	}
	function _findExistingHeaderIndex(headers, name) {
		return headers.findIndex((header, i) => i % 2 === 0 && header === name);
	}
	function addFetchRequestBreadcrumb(request, response) {
		const data = getBreadcrumbData(request);
		const statusCode = response.statusCode;
		const level = core.getBreadcrumbLogLevelFromHttpStatusCode(statusCode);
		core.addBreadcrumb({
			category: "http",
			data: {
				status_code: statusCode,
				...data
			},
			type: "http",
			level
		}, {
			event: "response",
			request,
			response
		});
	}
	function getBreadcrumbData(request) {
		try {
			const url = getAbsoluteUrl(request.origin, request.path);
			const parsedUrl = core.parseUrl(url);
			const data = {
				url: core.getSanitizedUrlString(parsedUrl),
				"http.method": request.method || "GET"
			};
			if (parsedUrl.search) data["http.query"] = parsedUrl.search;
			if (parsedUrl.hash) data["http.fragment"] = parsedUrl.hash;
			return data;
		} catch {
			return {};
		}
	}
	function getAbsoluteUrl(origin, path = "/") {
		try {
			return new URL(path, origin).toString();
		} catch {
			const url = `${origin}`;
			if (url.endsWith("/") && path.startsWith("/")) return `${url}${path.slice(1)}`;
			if (!url.endsWith("/") && !path.startsWith("/")) return `${url}/${path}`;
			return `${url}${path}`;
		}
	}
	exports.addFetchRequestBreadcrumb = addFetchRequestBreadcrumb;
	exports.addTracePropagationHeadersToFetchRequest = addTracePropagationHeadersToFetchRequest;
	exports.getAbsoluteUrl = getAbsoluteUrl;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/integrations/node-fetch/SentryNodeFetchInstrumentation.js
var require_SentryNodeFetchInstrumentation = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const api = require_src();
	const core$1 = require_src$2();
	const instrumentation = require_src$1();
	const core = require_cjs$4();
	const diagch$1 = __require("diagnostics_channel");
	const nodeVersion = require_nodeVersion();
	const outgoingFetchRequest = require_outgoingFetchRequest();
	var SentryNodeFetchInstrumentation = class extends instrumentation.InstrumentationBase {
		constructor(config = {}) {
			super("@sentry/instrumentation-node-fetch", core.SDK_VERSION, config);
			this._channelSubs = [];
			this._propagationDecisionMap = new core.LRUMap(100);
			this._ignoreOutgoingRequestsMap = /* @__PURE__ */ new WeakMap();
		}
		/** No need to instrument files/modules. */
		init() {}
		/** Disable the instrumentation. */
		disable() {
			super.disable();
			this._channelSubs.forEach((sub) => sub.unsubscribe());
			this._channelSubs = [];
		}
		/** Enable the instrumentation. */
		enable() {
			super.enable();
			this._channelSubs = this._channelSubs || [];
			if (this._channelSubs.length > 0) return;
			this._subscribeToChannel("undici:request:create", this._onRequestCreated.bind(this));
			this._subscribeToChannel("undici:request:headers", this._onResponseHeaders.bind(this));
		}
		/**
		* This method is called when a request is created.
		* You can still mutate the request here before it is sent.
		*/
		_onRequestCreated({ request }) {
			const config = this.getConfig();
			if (!(config.enabled !== false)) return;
			const shouldIgnore = this._shouldIgnoreOutgoingRequest(request);
			this._ignoreOutgoingRequestsMap.set(request, shouldIgnore);
			if (shouldIgnore) return;
			if (config.tracePropagation !== false) outgoingFetchRequest.addTracePropagationHeadersToFetchRequest(request, this._propagationDecisionMap);
		}
		/**
		* This method is called when a response is received.
		*/
		_onResponseHeaders({ request, response }) {
			const config = this.getConfig();
			if (!(config.enabled !== false)) return;
			const _breadcrumbs = config.breadcrumbs;
			const breadCrumbsEnabled = typeof _breadcrumbs === "undefined" ? true : _breadcrumbs;
			const shouldIgnore = this._ignoreOutgoingRequestsMap.get(request);
			if (breadCrumbsEnabled && !shouldIgnore) outgoingFetchRequest.addFetchRequestBreadcrumb(request, response);
		}
		/** Subscribe to a diagnostics channel. */
		_subscribeToChannel(diagnosticChannel, onMessage) {
			const useNewSubscribe = nodeVersion.NODE_MAJOR > 18 || nodeVersion.NODE_MAJOR === 18 && nodeVersion.NODE_MINOR >= 19;
			let unsubscribe;
			if (useNewSubscribe) {
				diagch$1.subscribe?.(diagnosticChannel, onMessage);
				unsubscribe = () => diagch$1.unsubscribe?.(diagnosticChannel, onMessage);
			} else {
				const channel = diagch$1.channel(diagnosticChannel);
				channel.subscribe(onMessage);
				unsubscribe = () => channel.unsubscribe(onMessage);
			}
			this._channelSubs.push({
				name: diagnosticChannel,
				unsubscribe
			});
		}
		/**
		* Check if the given outgoing request should be ignored.
		*/
		_shouldIgnoreOutgoingRequest(request) {
			if (core$1.isTracingSuppressed(api.context.active())) return true;
			const url = outgoingFetchRequest.getAbsoluteUrl(request.origin, request.path);
			const ignoreOutgoingRequests = this.getConfig().ignoreOutgoingRequests;
			if (typeof ignoreOutgoingRequests !== "function" || !url) return false;
			return ignoreOutgoingRequests(url);
		}
	};
	exports.SentryNodeFetchInstrumentation = SentryNodeFetchInstrumentation;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/integrations/node-fetch/index.js
var require_node_fetch$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const instrument = require_instrument();
	const SentryNodeFetchInstrumentation = require_SentryNodeFetchInstrumentation();
	const instrumentSentryNodeFetch = instrument.generateInstrumentOnce(`NodeFetch.sentry`, SentryNodeFetchInstrumentation.SentryNodeFetchInstrumentation, (options) => {
		return options;
	});
	const _nativeNodeFetchIntegration = ((options = {}) => {
		return {
			name: "NodeFetch",
			setupOnce() {
				instrumentSentryNodeFetch(options);
			}
		};
	});
	exports.nativeNodeFetchIntegration = core.defineIntegration(_nativeNodeFetchIntegration);
}));
//#endregion
//#region node_modules/@sentry/opentelemetry/build/cjs/resource-DuZKnQnC.js
var require_resource_DuZKnQnC = /* @__PURE__ */ __commonJSMin(((exports) => {
	const api = require_src();
	const core = require_cjs$4();
	const attributes = require_attributes();
	const core$1 = require_src$2();
	const sdkTraceBase = require_src$4();
	const SEMANTIC_ATTRIBUTE_SENTRY_PARENT_IS_REMOTE = "sentry.parentIsRemote";
	const SEMANTIC_ATTRIBUTE_SENTRY_GRAPHQL_OPERATION = "sentry.graphql.operation";
	function getParentSpanId(span) {
		if ("parentSpanId" in span) return span.parentSpanId;
		else if ("parentSpanContext" in span) return span.parentSpanContext?.spanId;
	}
	function spanHasAttributes(span) {
		const castSpan = span;
		return !!castSpan.attributes && typeof castSpan.attributes === "object";
	}
	function spanHasKind(span) {
		return typeof span.kind === "number";
	}
	function spanHasStatus(span) {
		return !!span.status;
	}
	function spanHasName(span) {
		return !!span.name;
	}
	function spanHasParentId(span) {
		return !!getParentSpanId(span);
	}
	function spanHasEvents(span) {
		const castSpan = span;
		return Array.isArray(castSpan.events);
	}
	function getRequestSpanData(span) {
		if (!spanHasAttributes(span)) return {};
		const maybeUrlAttribute = span.attributes[attributes.URL_FULL] || span.attributes[attributes.HTTP_URL];
		const data = {
			url: maybeUrlAttribute,
			"http.method": span.attributes[attributes.HTTP_REQUEST_METHOD] || span.attributes[attributes.HTTP_METHOD]
		};
		if (!data["http.method"] && data.url) data["http.method"] = "GET";
		try {
			if (typeof maybeUrlAttribute === "string") {
				const url = core.parseUrl(maybeUrlAttribute);
				data.url = core.getSanitizedUrlString(url);
				if (url.search) data["http.query"] = url.search;
				if (url.hash) data["http.fragment"] = url.hash;
			}
		} catch {}
		return data;
	}
	function wrapClientClass(ClientClass) {
		class OpenTelemetryClient extends ClientClass {
			constructor(...args) {
				super(...args);
			}
			/** Get the OTEL tracer. */
			get tracer() {
				if (this._tracer) return this._tracer;
				const name = "@sentry/opentelemetry";
				const version = core.SDK_VERSION;
				const tracer = api.trace.getTracer(name, version);
				this._tracer = tracer;
				return tracer;
			}
			/**
			* @inheritDoc
			*/
			async flush(timeout) {
				await this.traceProvider?.forceFlush();
				return super.flush(timeout);
			}
		}
		return OpenTelemetryClient;
	}
	function getSpanKind(span) {
		if (spanHasKind(span)) return span.kind;
		return api.SpanKind.INTERNAL;
	}
	const SENTRY_TRACE_HEADER = "sentry-trace";
	const SENTRY_BAGGAGE_HEADER = "baggage";
	const SENTRY_TRACE_STATE_DSC = "sentry.dsc";
	const SENTRY_TRACE_STATE_SAMPLED_NOT_RECORDING = "sentry.sampled_not_recording";
	const SENTRY_TRACE_STATE_URL = "sentry.url";
	const SENTRY_TRACE_STATE_SAMPLE_RAND = "sentry.sample_rand";
	const SENTRY_TRACE_STATE_SAMPLE_RATE = "sentry.sample_rate";
	const SENTRY_TRACE_STATE_CHILD_IGNORED = "sentry.ignored";
	const SENTRY_TRACE_STATE_SEGMENT_IGNORED = "sentry.segment_ignored";
	const SENTRY_SCOPES_CONTEXT_KEY = api.createContextKey("sentry_scopes");
	const SENTRY_FORK_ISOLATION_SCOPE_CONTEXT_KEY = api.createContextKey("sentry_fork_isolation_scope");
	const SENTRY_FORK_SET_SCOPE_CONTEXT_KEY = api.createContextKey("sentry_fork_set_scope");
	const SENTRY_FORK_SET_ISOLATION_SCOPE_CONTEXT_KEY = api.createContextKey("sentry_fork_set_isolation_scope");
	const SCOPE_CONTEXT_FIELD = "_scopeContext";
	function getScopesFromContext(context) {
		return context.getValue(SENTRY_SCOPES_CONTEXT_KEY);
	}
	function setScopesOnContext(context, scopes) {
		return context.setValue(SENTRY_SCOPES_CONTEXT_KEY, scopes);
	}
	function setContextOnScope(scope, context) {
		core.addNonEnumerableProperty(scope, SCOPE_CONTEXT_FIELD, core.makeWeakRef(context));
	}
	function getContextFromScope(scope) {
		return core.derefWeakRef(scope[SCOPE_CONTEXT_FIELD]);
	}
	function isSentryRequestSpan(span) {
		if (!spanHasAttributes(span)) return false;
		const { attributes: attributes$1 } = span;
		const httpUrl = attributes$1[attributes.HTTP_URL] || attributes$1[attributes.URL_FULL];
		if (!httpUrl) return false;
		return core.isSentryRequestUrl(httpUrl.toString(), core.getClient());
	}
	function getSamplingDecision(spanContext) {
		const { traceFlags, traceState } = spanContext;
		const sampledNotRecording = traceState ? traceState.get(SENTRY_TRACE_STATE_SAMPLED_NOT_RECORDING) === "1" : false;
		if (traceFlags === api.TraceFlags.SAMPLED) return true;
		if (sampledNotRecording) return false;
		const dscString = traceState ? traceState.get(SENTRY_TRACE_STATE_DSC) : void 0;
		const dsc = dscString ? core.baggageHeaderToDynamicSamplingContext(dscString) : void 0;
		if (dsc?.sampled === "true") return true;
		if (dsc?.sampled === "false") return false;
	}
	function inferSpanData(spanName, attributes$1, kind) {
		const httpMethod = attributes$1[attributes.HTTP_REQUEST_METHOD] || attributes$1[attributes.HTTP_METHOD];
		if (httpMethod) return descriptionForHttpMethod({
			attributes: attributes$1,
			name: spanName,
			kind
		}, httpMethod);
		const dbSystem = attributes$1[attributes.DB_SYSTEM_NAME] || attributes$1[attributes.DB_SYSTEM];
		const opIsCache = typeof attributes$1[core.SEMANTIC_ATTRIBUTE_SENTRY_OP] === "string" && attributes$1[core.SEMANTIC_ATTRIBUTE_SENTRY_OP].startsWith("cache.");
		if (dbSystem && !opIsCache) return descriptionForDbSystem({
			attributes: attributes$1,
			name: spanName
		});
		const customSourceOrRoute = attributes$1[core.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE] === "custom" ? "custom" : "route";
		if (attributes$1[attributes.RPC_SERVICE]) return {
			...getUserUpdatedNameAndSource(spanName, attributes$1, "route"),
			op: "rpc"
		};
		if (attributes$1[attributes.MESSAGING_SYSTEM]) return {
			...getUserUpdatedNameAndSource(spanName, attributes$1, customSourceOrRoute),
			op: "message"
		};
		const faasTrigger = attributes$1[attributes.FAAS_TRIGGER];
		if (faasTrigger) return {
			...getUserUpdatedNameAndSource(spanName, attributes$1, customSourceOrRoute),
			op: faasTrigger.toString()
		};
		return {
			op: void 0,
			description: spanName,
			source: "custom"
		};
	}
	function parseSpanDescription(span) {
		const attributes = spanHasAttributes(span) ? span.attributes : {};
		return inferSpanData(spanHasName(span) ? span.name : "<unknown>", attributes, getSpanKind(span));
	}
	function descriptionForDbSystem({ attributes: attributes$1, name }) {
		const userDefinedName = attributes$1[core.SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME];
		if (typeof userDefinedName === "string") return {
			op: "db",
			description: userDefinedName,
			source: attributes$1[core.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE] || "custom"
		};
		if (attributes$1[core.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE] === "custom") return {
			op: "db",
			description: name,
			source: "custom"
		};
		const statement = attributes$1[attributes.DB_STATEMENT];
		return {
			op: "db",
			description: statement ? statement.toString() : name,
			source: "task"
		};
	}
	function descriptionForHttpMethod({ name, kind, attributes }, httpMethod) {
		const opParts = ["http"];
		switch (kind) {
			case api.SpanKind.CLIENT:
				opParts.push("client");
				break;
			case api.SpanKind.SERVER:
				opParts.push("server");
				break;
		}
		if (attributes["sentry.http.prefetch"]) opParts.push("prefetch");
		const { urlPath, url, query, fragment, hasRoute } = getSanitizedUrl(attributes, kind);
		if (!urlPath) return {
			...getUserUpdatedNameAndSource(name, attributes),
			op: opParts.join(".")
		};
		const graphqlOperationsAttribute = attributes[SEMANTIC_ATTRIBUTE_SENTRY_GRAPHQL_OPERATION];
		const baseDescription = `${httpMethod} ${urlPath}`;
		const inferredDescription = graphqlOperationsAttribute ? `${baseDescription} (${getGraphqlOperationNamesFromAttribute(graphqlOperationsAttribute)})` : baseDescription;
		const inferredSource = hasRoute || urlPath === "/" ? "route" : "url";
		const data = {};
		if (url) data.url = url;
		if (query) data["http.query"] = query;
		if (fragment) data["http.fragment"] = fragment;
		const isClientOrServerKind = kind === api.SpanKind.CLIENT || kind === api.SpanKind.SERVER;
		const isManualSpan = !`${attributes[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN] || "manual"}`.startsWith("auto");
		const alreadyHasCustomSource = attributes[core.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE] === "custom";
		const customSpanName = attributes[core.SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME];
		const { description, source } = !alreadyHasCustomSource && customSpanName == null && (isClientOrServerKind || !isManualSpan) ? {
			description: inferredDescription,
			source: inferredSource
		} : getUserUpdatedNameAndSource(name, attributes);
		return {
			op: opParts.join("."),
			description,
			source,
			data
		};
	}
	function getGraphqlOperationNamesFromAttribute(attr) {
		if (Array.isArray(attr)) {
			const sorted = attr.slice().sort();
			if (sorted.length <= 5) return sorted.join(", ");
			else return `${sorted.slice(0, 5).join(", ")}, +${sorted.length - 5}`;
		}
		return `${attr}`;
	}
	function getSanitizedUrl(attributes$1, kind) {
		const httpTarget = attributes$1[attributes.HTTP_TARGET];
		const httpUrl = attributes$1[attributes.HTTP_URL] || attributes$1[attributes.URL_FULL];
		const httpRoute = attributes$1[attributes.HTTP_ROUTE];
		const parsedUrl = typeof httpUrl === "string" ? core.parseUrl(httpUrl) : void 0;
		const url = parsedUrl ? core.getSanitizedUrlString(parsedUrl) : void 0;
		const query = parsedUrl?.search || void 0;
		const fragment = parsedUrl?.hash || void 0;
		if (typeof httpRoute === "string") return {
			urlPath: httpRoute,
			url,
			query,
			fragment,
			hasRoute: true
		};
		if (kind === api.SpanKind.SERVER && typeof httpTarget === "string") return {
			urlPath: core.stripUrlQueryAndFragment(httpTarget),
			url,
			query,
			fragment,
			hasRoute: false
		};
		if (parsedUrl) return {
			urlPath: url,
			url,
			query,
			fragment,
			hasRoute: false
		};
		if (typeof httpTarget === "string") return {
			urlPath: core.stripUrlQueryAndFragment(httpTarget),
			url,
			query,
			fragment,
			hasRoute: false
		};
		return {
			urlPath: void 0,
			url,
			query,
			fragment,
			hasRoute: false
		};
	}
	function getUserUpdatedNameAndSource(originalName, attributes, fallbackSource = "custom") {
		const source = attributes[core.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE] || fallbackSource;
		const description = attributes[core.SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME];
		if (description && typeof description === "string") return {
			description,
			source
		};
		return {
			description: originalName,
			source
		};
	}
	function enhanceDscWithOpenTelemetryRootSpanName(client) {
		client.on("createDsc", (dsc, rootSpan) => {
			if (!rootSpan) return;
			const source = core.spanToJSON(rootSpan).data[core.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE];
			const { description } = spanHasName(rootSpan) ? parseSpanDescription(rootSpan) : { description: void 0 };
			if (source !== "url" && description) dsc.transaction = description;
			if (core.hasSpansEnabled()) {
				const sampled = getSamplingDecision(rootSpan.spanContext());
				dsc.sampled = sampled == void 0 ? void 0 : String(sampled);
			}
		});
	}
	function getActiveSpan() {
		return api.trace.getActiveSpan();
	}
	const DEBUG_BUILD = typeof __SENTRY_DEBUG__ === "undefined" || __SENTRY_DEBUG__;
	var TraceState = class TraceState {
		constructor() {
			this._internalState = /* @__PURE__ */ new Map();
		}
		/** @inheritDoc */
		set(key, value) {
			const next = this._clone();
			if (next._internalState.has(key)) next._internalState.delete(key);
			next._internalState.set(key, value);
			return next;
		}
		/** @inheritDoc */
		unset(key) {
			const next = this._clone();
			next._internalState.delete(key);
			return next;
		}
		/** @inheritDoc */
		get(key) {
			return this._internalState.get(key);
		}
		/** @inheritDoc */
		serialize() {
			return Array.from(this._internalState.keys()).reverse().map((key) => `${key}=${this._internalState.get(key)}`).join(",");
		}
		_clone() {
			const next = new TraceState();
			next._internalState = new Map(this._internalState);
			return next;
		}
	};
	function makeTraceState({ dsc, sampled }) {
		const dscString = dsc ? core.dynamicSamplingContextToSentryBaggageHeader(dsc) : void 0;
		const traceStateBase = new TraceState();
		const traceStateWithDsc = dscString ? traceStateBase.set(SENTRY_TRACE_STATE_DSC, dscString) : traceStateBase;
		return sampled === false ? traceStateWithDsc.set(SENTRY_TRACE_STATE_SAMPLED_NOT_RECORDING, "1") : traceStateWithDsc;
	}
	const setupElements = /* @__PURE__ */ new Set();
	function openTelemetrySetupCheck() {
		return Array.from(setupElements);
	}
	function setIsSetup(element) {
		setupElements.add(element);
	}
	var SentryPropagator = class extends core$1.W3CBaggagePropagator {
		constructor() {
			super();
			setIsSetup("SentryPropagator");
			this._urlMatchesTargetsMap = new core.LRUMap(100);
		}
		/**
		* @inheritDoc
		*/
		inject(context2, carrier, setter) {
			if (core$1.isTracingSuppressed(context2)) {
				DEBUG_BUILD && core.debug.log("[Tracing] Not injecting trace data for url because tracing is suppressed.");
				return;
			}
			const activeSpan = api.trace.getSpan(context2);
			const url = activeSpan && getCurrentURL(activeSpan);
			const { tracePropagationTargets, propagateTraceparent } = core.getClient()?.getOptions() || {};
			if (!core.shouldPropagateTraceForUrl(url, tracePropagationTargets, this._urlMatchesTargetsMap)) {
				DEBUG_BUILD && core.debug.log("[Tracing] Not injecting trace data for url because it does not match tracePropagationTargets:", url);
				return;
			}
			const existingBaggageHeader = getExistingBaggage(carrier);
			const existingSentryTraceHeader = getExistingSentryTrace(carrier);
			let baggage = api.propagation.getBaggage(context2) || api.propagation.createBaggage({});
			const { dynamicSamplingContext, traceId, spanId, sampled } = getInjectionData(context2);
			if (existingBaggageHeader) {
				const baggageEntries = core.parseBaggageHeader(existingBaggageHeader);
				if (baggageEntries) Object.entries(baggageEntries).forEach(([key, value]) => {
					if (!existingSentryTraceHeader && key.startsWith(core.SENTRY_BAGGAGE_KEY_PREFIX)) return;
					baggage = baggage.setEntry(key, { value });
				});
			}
			if (!existingSentryTraceHeader && dynamicSamplingContext) baggage = Object.entries(dynamicSamplingContext).reduce((b, [dscKey, dscValue]) => {
				if (dscValue) return b.setEntry(`${core.SENTRY_BAGGAGE_KEY_PREFIX}${dscKey}`, { value: dscValue });
				return b;
			}, baggage);
			if (!existingSentryTraceHeader && traceId && traceId !== api.INVALID_TRACEID) {
				setter.set(carrier, SENTRY_TRACE_HEADER, core.generateSentryTraceHeader(traceId, spanId, sampled));
				if (propagateTraceparent) setter.set(carrier, "traceparent", core.generateTraceparentHeader(traceId, spanId, sampled));
			}
			super.inject(api.propagation.setBaggage(context2, baggage), carrier, setter);
		}
		/**
		* @inheritDoc
		*/
		extract(context2, carrier, getter) {
			const maybeSentryTraceHeader = getter.get(carrier, SENTRY_TRACE_HEADER);
			const baggage = getter.get(carrier, SENTRY_BAGGAGE_HEADER);
			return ensureScopesOnContext(getContextWithRemoteActiveSpan(context2, {
				sentryTrace: maybeSentryTraceHeader ? Array.isArray(maybeSentryTraceHeader) ? maybeSentryTraceHeader[0] : maybeSentryTraceHeader : void 0,
				baggage
			}));
		}
		/**
		* @inheritDoc
		*/
		fields() {
			return [
				SENTRY_TRACE_HEADER,
				SENTRY_BAGGAGE_HEADER,
				"traceparent"
			];
		}
	};
	function getInjectionData(context2, options = {}) {
		const span = api.trace.getSpan(context2);
		if (span?.spanContext().isRemote) {
			const spanContext = span.spanContext();
			return {
				dynamicSamplingContext: core.getDynamicSamplingContextFromSpan(span),
				traceId: spanContext.traceId,
				spanId: void 0,
				sampled: getSamplingDecision(spanContext)
			};
		}
		if (span) {
			const spanContext = span.spanContext();
			return {
				dynamicSamplingContext: core.getDynamicSamplingContextFromSpan(span),
				traceId: spanContext.traceId,
				spanId: spanContext.spanId,
				sampled: getSamplingDecision(spanContext)
			};
		}
		const scope = options.scope || getScopesFromContext(context2)?.scope || core.getCurrentScope();
		const client = options.client || core.getClient();
		const propagationContext = scope.getPropagationContext();
		return {
			dynamicSamplingContext: client ? core.getDynamicSamplingContextFromScope(client, scope) : void 0,
			traceId: propagationContext.traceId,
			spanId: propagationContext.propagationSpanId,
			sampled: propagationContext.sampled
		};
	}
	function getContextWithRemoteActiveSpan(ctx, { sentryTrace, baggage }) {
		const { traceId, parentSpanId, sampled, dsc } = core.propagationContextFromHeaders(sentryTrace, baggage);
		const client = core.getClient();
		const incomingDsc = core.baggageHeaderToDynamicSamplingContext(baggage);
		if (!parentSpanId || client && !core.shouldContinueTrace(client, incomingDsc?.org_id)) return ctx;
		const spanContext = generateRemoteSpanContext({
			traceId,
			spanId: parentSpanId,
			sampled,
			dsc
		});
		return api.trace.setSpanContext(ctx, spanContext);
	}
	function continueTraceAsRemoteSpan(ctx, options, callback) {
		const ctxWithSpanContext = ensureScopesOnContext(getContextWithRemoteActiveSpan(ctx, options));
		return api.context.with(ctxWithSpanContext, callback);
	}
	function ensureScopesOnContext(ctx) {
		const scopes = getScopesFromContext(ctx);
		return setScopesOnContext(ctx, {
			scope: scopes ? scopes.scope : core.getCurrentScope().clone(),
			isolationScope: scopes ? scopes.isolationScope : core.getIsolationScope()
		});
	}
	function getExistingBaggage(carrier) {
		try {
			const baggage = carrier[SENTRY_BAGGAGE_HEADER];
			return Array.isArray(baggage) ? baggage.join(",") : baggage;
		} catch {
			return;
		}
	}
	function getExistingSentryTrace(carrier) {
		try {
			return carrier[SENTRY_TRACE_HEADER];
		} catch {
			return;
		}
	}
	function getCurrentURL(span) {
		const spanData = core.spanToJSON(span).data;
		const urlAttribute = spanData[attributes.HTTP_URL] || spanData[attributes.URL_FULL];
		if (typeof urlAttribute === "string") return urlAttribute;
		const urlTraceState = span.spanContext().traceState?.get(SENTRY_TRACE_STATE_URL);
		if (urlTraceState) return urlTraceState;
	}
	function generateRemoteSpanContext({ spanId, traceId, sampled, dsc }) {
		const traceState = makeTraceState({
			dsc,
			sampled
		});
		return {
			traceId,
			spanId,
			isRemote: true,
			traceFlags: sampled ? api.TraceFlags.SAMPLED : api.TraceFlags.NONE,
			traceState
		};
	}
	function _startSpan(options, callback, autoEnd) {
		const tracer = getTracer();
		const { name, parentSpan: customParentSpan } = options;
		return getActiveSpanWrapper(customParentSpan)(() => {
			const activeCtx = getContext(options.scope, options.forceTransaction);
			const missingRequiredParent = options.onlyIfParent && !api.trace.getSpan(activeCtx);
			const ctx = missingRequiredParent ? core$1.suppressTracing(activeCtx) : activeCtx;
			if (missingRequiredParent) core.getClient()?.recordDroppedEvent("no_parent_span", "span");
			const spanOptions = getSpanOptions(options);
			if (!core.hasSpansEnabled()) {
				const suppressedCtx = core$1.isTracingSuppressed(ctx) ? ctx : core$1.suppressTracing(ctx);
				return api.context.with(suppressedCtx, () => {
					return tracer.startActiveSpan(name, spanOptions, suppressedCtx, (span) => {
						patchSpanEnd(span);
						return api.context.with(activeCtx, () => {
							return core.handleCallbackErrors(() => callback(span), () => {
								if (core.spanToJSON(span).status === void 0) span.setStatus({ code: api.SpanStatusCode.ERROR });
							}, autoEnd ? () => span.end() : void 0);
						});
					});
				});
			}
			return tracer.startActiveSpan(name, spanOptions, ctx, (span) => {
				patchSpanEnd(span);
				return core.handleCallbackErrors(() => callback(span), () => {
					if (core.spanToJSON(span).status === void 0) span.setStatus({ code: api.SpanStatusCode.ERROR });
				}, autoEnd ? () => span.end() : void 0);
			});
		});
	}
	function startSpan(options, callback) {
		return _startSpan(options, callback, true);
	}
	function startSpanManual(options, callback) {
		return _startSpan(options, (span) => callback(span, () => span.end()), false);
	}
	function startInactiveSpan(options) {
		const tracer = getTracer();
		const { name, parentSpan: customParentSpan } = options;
		return getActiveSpanWrapper(customParentSpan)(() => {
			const activeCtx = getContext(options.scope, options.forceTransaction);
			const missingRequiredParent = options.onlyIfParent && !api.trace.getSpan(activeCtx);
			let ctx = missingRequiredParent ? core$1.suppressTracing(activeCtx) : activeCtx;
			if (missingRequiredParent) core.getClient()?.recordDroppedEvent("no_parent_span", "span");
			const spanOptions = getSpanOptions(options);
			if (!core.hasSpansEnabled()) ctx = core$1.isTracingSuppressed(ctx) ? ctx : core$1.suppressTracing(ctx);
			const span = tracer.startSpan(name, spanOptions, ctx);
			patchSpanEnd(span);
			return span;
		});
	}
	function withActiveSpan(span, callback) {
		const newContextWithActiveSpan = span ? api.trace.setSpan(api.context.active(), span) : api.trace.deleteSpan(api.context.active());
		return api.context.with(newContextWithActiveSpan, () => callback(core.getCurrentScope()));
	}
	function getTracer() {
		return core.getClient()?.tracer || api.trace.getTracer("@sentry/opentelemetry", core.SDK_VERSION);
	}
	function getSpanOptions(options) {
		const { startTime, attributes, kind, op, links } = options;
		const fixedStartTime = typeof startTime === "number" ? ensureTimestampInMilliseconds(startTime) : startTime;
		return {
			attributes: op ? {
				[core.SEMANTIC_ATTRIBUTE_SENTRY_OP]: op,
				...attributes
			} : attributes,
			kind,
			links,
			startTime: fixedStartTime
		};
	}
	function ensureTimestampInMilliseconds(timestamp) {
		return timestamp < 9999999999 ? timestamp * 1e3 : timestamp;
	}
	function patchSpanEnd(span) {
		const originalEnd = span.end.bind(span);
		span.end = (endTime) => {
			return originalEnd(typeof endTime === "number" ? ensureTimestampInMilliseconds(endTime) : endTime);
		};
	}
	function getContext(scope, forceTransaction) {
		const ctx = getContextForScope(scope);
		const parentSpan = api.trace.getSpan(ctx);
		if (!parentSpan) return ctx;
		if (!forceTransaction) return ctx;
		const ctxWithoutSpan = api.trace.deleteSpan(ctx);
		const { spanId, traceId } = parentSpan.spanContext();
		const sampled = getSamplingDecision(parentSpan.spanContext());
		const rootSpan = core.getRootSpan(parentSpan);
		const traceState = makeTraceState({
			dsc: core.getDynamicSamplingContextFromSpan(rootSpan),
			sampled
		});
		const spanOptions = {
			traceId,
			spanId,
			isRemote: true,
			traceFlags: sampled ? api.TraceFlags.SAMPLED : api.TraceFlags.NONE,
			traceState
		};
		return api.trace.setSpanContext(ctxWithoutSpan, spanOptions);
	}
	function getContextForScope(scope) {
		if (scope) {
			const ctx = getContextFromScope(scope);
			if (ctx) return ctx;
		}
		return api.context.active();
	}
	function continueTrace(options, callback) {
		return continueTraceAsRemoteSpan(api.context.active(), options, callback);
	}
	function startNewTrace(callback) {
		const traceId = core.generateTraceId();
		const spanContext = {
			traceId,
			spanId: core.generateSpanId(),
			isRemote: true,
			traceFlags: api.TraceFlags.NONE
		};
		const ctxWithTrace = api.trace.setSpanContext(api.context.active(), spanContext);
		return api.context.with(ctxWithTrace, () => {
			core.getCurrentScope().setPropagationContext({
				traceId,
				sampleRand: core._INTERNAL_safeMathRandom()
			});
			return callback();
		});
	}
	function getTraceContextForScope(client, scope) {
		const ctx = getContextFromScope(scope);
		const span = ctx && api.trace.getSpan(ctx);
		const traceContext = span ? core.spanToTraceContext(span) : core.getTraceContextFromScope(scope);
		return [span ? core.getDynamicSamplingContextFromSpan(span) : core.getDynamicSamplingContextFromScope(client, scope), traceContext];
	}
	function getActiveSpanWrapper(parentSpan) {
		return parentSpan !== void 0 ? (callback) => {
			return withActiveSpan(parentSpan, callback);
		} : (callback) => callback();
	}
	function suppressTracing(callback) {
		const ctx = core$1.suppressTracing(api.context.active());
		return api.context.with(ctx, callback);
	}
	function setupEventContextTrace(client) {
		client.on("preprocessEvent", (event) => {
			const span = getActiveSpan();
			if (!span || event.type === "transaction") return;
			event.contexts = {
				trace: core.spanToTraceContext(span),
				...event.contexts
			};
			const rootSpan = core.getRootSpan(span);
			event.sdkProcessingMetadata = {
				dynamicSamplingContext: core.getDynamicSamplingContextFromSpan(rootSpan),
				...event.sdkProcessingMetadata
			};
			return event;
		});
	}
	function getTraceData({ span, scope, client, propagateTraceparent } = {}) {
		let ctx = (scope && getContextFromScope(scope)) ?? api.context.active();
		if (span) {
			const { scope: scope2 } = core.getCapturedScopesOnSpan(span);
			ctx = scope2 && getContextFromScope(scope2) || api.trace.setSpan(api.context.active(), span);
		}
		const { traceId, spanId, sampled, dynamicSamplingContext } = getInjectionData(ctx, {
			scope,
			client
		});
		const traceData = {
			"sentry-trace": core.generateSentryTraceHeader(traceId, spanId, sampled),
			baggage: core.dynamicSamplingContextToSentryBaggageHeader(dynamicSamplingContext)
		};
		if (propagateTraceparent) traceData.traceparent = core.generateTraceparentHeader(traceId, spanId, sampled);
		return traceData;
	}
	function setOpenTelemetryContextAsyncContextStrategy() {
		function getScopes() {
			const scopes = getScopesFromContext(api.context.active());
			if (scopes) return scopes;
			return {
				scope: core.getDefaultCurrentScope(),
				isolationScope: core.getDefaultIsolationScope()
			};
		}
		function withScope(callback) {
			const ctx = api.context.active();
			return api.context.with(ctx, () => {
				return callback(getCurrentScope());
			});
		}
		function withSetScope(scope, callback) {
			const ctx = getContextFromScope(scope) || api.context.active();
			return api.context.with(ctx.setValue(SENTRY_FORK_SET_SCOPE_CONTEXT_KEY, scope), () => {
				return callback(scope);
			});
		}
		function withIsolationScope(callback) {
			const ctx = api.context.active();
			return api.context.with(ctx.setValue(SENTRY_FORK_ISOLATION_SCOPE_CONTEXT_KEY, true), () => {
				return callback(getIsolationScope());
			});
		}
		function withSetIsolationScope(isolationScope, callback) {
			const ctx = api.context.active();
			return api.context.with(ctx.setValue(SENTRY_FORK_SET_ISOLATION_SCOPE_CONTEXT_KEY, isolationScope), () => {
				return callback(getIsolationScope());
			});
		}
		function getCurrentScope() {
			return getScopes().scope;
		}
		function getIsolationScope() {
			return getScopes().isolationScope;
		}
		core.setAsyncContextStrategy({
			withScope,
			withSetScope,
			withSetIsolationScope,
			withIsolationScope,
			getCurrentScope,
			getIsolationScope,
			startSpan,
			startSpanManual,
			startInactiveSpan,
			getActiveSpan,
			suppressTracing,
			getTraceData,
			continueTrace,
			startNewTrace,
			withActiveSpan,
			getTracingChannelBinding: () => {
				try {
					return {
						asyncLocalStorage: api.context._getContextManager().getAsyncLocalStorageLookup().asyncLocalStorage,
						getStoreWithActiveSpan: (span) => api.trace.setSpan(api.context.active(), span)
					};
				} catch {
					return;
				}
			}
		});
	}
	function buildContextWithSentryScopes(context, activeContext) {
		const span = api.trace.getSpan(context);
		let effectiveContext;
		if (span?.spanContext().traceState?.get(SENTRY_TRACE_STATE_CHILD_IGNORED) === "1") {
			const contextWithoutSpan = api.trace.deleteSpan(context);
			const parentSpan = api.trace.getSpan(activeContext);
			effectiveContext = parentSpan ? api.trace.setSpan(contextWithoutSpan, parentSpan) : contextWithoutSpan;
		} else effectiveContext = context;
		const currentScopes = getScopesFromContext(effectiveContext);
		const currentScope = currentScopes?.scope || core.getCurrentScope();
		const currentIsolationScope = currentScopes?.isolationScope || core.getIsolationScope();
		const shouldForkIsolationScope = effectiveContext.getValue(SENTRY_FORK_ISOLATION_SCOPE_CONTEXT_KEY) === true;
		const scope = effectiveContext.getValue(SENTRY_FORK_SET_SCOPE_CONTEXT_KEY);
		const isolationScope = effectiveContext.getValue(SENTRY_FORK_SET_ISOLATION_SCOPE_CONTEXT_KEY);
		const newCurrentScope = scope || currentScope.clone();
		const scopes = {
			scope: newCurrentScope,
			isolationScope: isolationScope || (shouldForkIsolationScope ? currentIsolationScope.clone() : currentIsolationScope)
		};
		const ctx2 = setScopesOnContext(effectiveContext, scopes).deleteValue(SENTRY_FORK_ISOLATION_SCOPE_CONTEXT_KEY).deleteValue(SENTRY_FORK_SET_SCOPE_CONTEXT_KEY).deleteValue(SENTRY_FORK_SET_ISOLATION_SCOPE_CONTEXT_KEY);
		setContextOnScope(newCurrentScope, ctx2);
		return ctx2;
	}
	function wrapContextManagerClass(ContextManagerClass) {
		class SentryContextManager extends ContextManagerClass {
			constructor(...args) {
				super(...args);
				setIsSetup("SentryContextManager");
			}
			/**
			* Overwrite with() of the original AsyncLocalStorageContextManager
			* to ensure we also create new scopes per context.
			*/
			with(context, fn, thisArg, ...args) {
				const ctx2 = buildContextWithSentryScopes(context, this.active());
				return super.with(ctx2, fn, thisArg, ...args);
			}
			/**
			* Gets underlying AsyncLocalStorage and symbol to allow lookup of scope.
			*/
			getAsyncLocalStorageLookup() {
				return {
					asyncLocalStorage: this._asyncLocalStorage,
					contextSymbol: SENTRY_SCOPES_CONTEXT_KEY
				};
			}
		}
		return SentryContextManager;
	}
	function groupSpansWithParents(spans) {
		const nodeMap = /* @__PURE__ */ new Map();
		for (const span of spans) createOrUpdateSpanNodeAndRefs(nodeMap, span);
		return Array.from(nodeMap, function([_id, spanNode]) {
			return spanNode;
		});
	}
	function getLocalParentId(span) {
		return !(span.attributes[SEMANTIC_ATTRIBUTE_SENTRY_PARENT_IS_REMOTE] === true) ? getParentSpanId(span) : void 0;
	}
	function createOrUpdateSpanNodeAndRefs(nodeMap, span) {
		const id = span.spanContext().spanId;
		const parentId = getLocalParentId(span);
		if (!parentId) {
			createOrUpdateNode(nodeMap, {
				id,
				span,
				children: []
			});
			return;
		}
		const parentNode = createOrGetParentNode(nodeMap, parentId);
		const node = createOrUpdateNode(nodeMap, {
			id,
			span,
			parentNode,
			children: []
		});
		parentNode.children.push(node);
	}
	function createOrGetParentNode(nodeMap, id) {
		const existing = nodeMap.get(id);
		if (existing) return existing;
		return createOrUpdateNode(nodeMap, {
			id,
			children: []
		});
	}
	function createOrUpdateNode(nodeMap, spanNode) {
		const existing = nodeMap.get(spanNode.id);
		if (existing?.span) return existing;
		if (existing && !existing.span) {
			existing.span = spanNode.span;
			existing.parentNode = spanNode.parentNode;
			return existing;
		}
		nodeMap.set(spanNode.id, spanNode);
		return spanNode;
	}
	const canonicalGrpcErrorCodesMap = {
		"1": "cancelled",
		"2": "unknown_error",
		"3": "invalid_argument",
		"4": "deadline_exceeded",
		"5": "not_found",
		"6": "already_exists",
		"7": "permission_denied",
		"8": "resource_exhausted",
		"9": "failed_precondition",
		"10": "aborted",
		"11": "out_of_range",
		"12": "unimplemented",
		"13": "internal_error",
		"14": "unavailable",
		"15": "data_loss",
		"16": "unauthenticated"
	};
	const isStatusErrorMessageValid = (message) => {
		return Object.values(canonicalGrpcErrorCodesMap).includes(message);
	};
	function mapStatus(span) {
		const attributes = spanHasAttributes(span) ? span.attributes : {};
		const status = spanHasStatus(span) ? span.status : void 0;
		if (status) {
			if (status.code === api.SpanStatusCode.OK) return { code: core.SPAN_STATUS_OK };
			else if (status.code === api.SpanStatusCode.ERROR) {
				if (typeof status.message === "undefined") {
					const inferredStatus2 = inferStatusFromAttributes(attributes);
					if (inferredStatus2) return inferredStatus2;
				}
				if (status.message && isStatusErrorMessageValid(status.message)) return {
					code: core.SPAN_STATUS_ERROR,
					message: status.message
				};
				else return {
					code: core.SPAN_STATUS_ERROR,
					message: "internal_error"
				};
			}
		}
		const inferredStatus = inferStatusFromAttributes(attributes);
		if (inferredStatus) return inferredStatus;
		if (status?.code === api.SpanStatusCode.UNSET) return { code: core.SPAN_STATUS_OK };
		else return {
			code: core.SPAN_STATUS_ERROR,
			message: "unknown_error"
		};
	}
	function inferStatusFromAttributes(attributes$1) {
		const httpCodeAttribute = attributes$1[attributes.HTTP_RESPONSE_STATUS_CODE] || attributes$1[attributes.HTTP_STATUS_CODE];
		const grpcCodeAttribute = attributes$1[attributes.RPC_GRPC_STATUS_CODE];
		const numberHttpCode = typeof httpCodeAttribute === "number" ? httpCodeAttribute : typeof httpCodeAttribute === "string" ? parseInt(httpCodeAttribute) : void 0;
		if (typeof numberHttpCode === "number") return core.getSpanStatusFromHttpCode(numberHttpCode);
		if (typeof grpcCodeAttribute === "string") return {
			code: core.SPAN_STATUS_ERROR,
			message: canonicalGrpcErrorCodesMap[grpcCodeAttribute] || "unknown_error"
		};
	}
	const MAX_SPAN_COUNT = 1e3;
	const DEFAULT_TIMEOUT = 300;
	const SENT_SPANS_MAX_SIZE = 1e4;
	var SentrySpanExporter = class {
		constructor(options) {
			this._finishedSpanBucketSize = options?.timeout || DEFAULT_TIMEOUT;
			this._finishedSpanBuckets = new Array(this._finishedSpanBucketSize).fill(void 0);
			this._lastCleanupTimestampInS = Math.floor(core._INTERNAL_safeDateNow() / 1e3);
			this._spansToBucketEntry = /* @__PURE__ */ new WeakMap();
			this._sentSpans = new core.LRUMap(SENT_SPANS_MAX_SIZE);
			this._debouncedFlush = core.debounce(this.flush.bind(this), 1, { maxWait: 100 });
		}
		/**
		* Export a single span.
		* This is called by the span processor whenever a span is ended.
		*/
		export(span) {
			const currentTimestampInS = Math.floor(core._INTERNAL_safeDateNow() / 1e3);
			if (this._lastCleanupTimestampInS !== currentTimestampInS) {
				let droppedSpanCount = 0;
				this._finishedSpanBuckets.forEach((bucket, i) => {
					if (bucket && bucket.timestampInS <= currentTimestampInS - this._finishedSpanBucketSize) {
						droppedSpanCount += bucket.spans.size;
						this._finishedSpanBuckets[i] = void 0;
					}
				});
				if (droppedSpanCount > 0) DEBUG_BUILD && core.debug.log(`SpanExporter dropped ${droppedSpanCount} spans because they were pending for more than ${this._finishedSpanBucketSize} seconds.`);
				this._lastCleanupTimestampInS = currentTimestampInS;
			}
			const currentBucketIndex = currentTimestampInS % this._finishedSpanBucketSize;
			const currentBucket = this._finishedSpanBuckets[currentBucketIndex] || {
				timestampInS: currentTimestampInS,
				spans: /* @__PURE__ */ new Set()
			};
			this._finishedSpanBuckets[currentBucketIndex] = currentBucket;
			currentBucket.spans.add(span);
			this._spansToBucketEntry.set(span, currentBucket);
			const localParentId = getLocalParentId(span);
			if (!localParentId || this._sentSpans.get(localParentId)) this._debouncedFlush();
		}
		/**
		* Try to flush any pending spans immediately.
		* This is called internally by the exporter (via _debouncedFlush),
		* but can also be triggered externally if we force-flush.
		*/
		flush() {
			const finishedSpans = this._finishedSpanBuckets.flatMap((bucket) => bucket ? Array.from(bucket.spans) : []);
			const sentSpans = this._maybeSend(finishedSpans);
			const sentSpanCount = sentSpans.size;
			const remainingOpenSpanCount = finishedSpans.length - sentSpanCount;
			DEBUG_BUILD && core.debug.log(`SpanExporter exported ${sentSpanCount} spans, ${remainingOpenSpanCount} spans are waiting for their parent spans to finish`);
			for (const span of sentSpans) {
				this._sentSpans.set(span.spanContext().spanId, 1);
				const bucketEntry = this._spansToBucketEntry.get(span);
				if (bucketEntry) bucketEntry.spans.delete(span);
			}
			this._debouncedFlush.cancel();
		}
		/**
		* Clear the exporter.
		* This is called when the span processor is shut down.
		*/
		clear() {
			this._finishedSpanBuckets = this._finishedSpanBuckets.fill(void 0);
			this._sentSpans.clear();
			this._debouncedFlush.cancel();
		}
		/**
		* Send the given spans, but only if they are part of a finished transaction.
		*
		* Returns the sent spans.
		* Spans remain unsent when their parent span is not yet finished.
		* This will happen regularly, as child spans are generally finished before their parents.
		* But it _could_ also happen because, for whatever reason, a parent span was lost.
		* In this case, we'll eventually need to clean this up.
		*/
		_maybeSend(spans) {
			const grouped = groupSpansWithParents(spans);
			const sentSpans = /* @__PURE__ */ new Set();
			const rootNodes = this._getCompletedRootNodes(grouped);
			for (const root of rootNodes) {
				const span = root.span;
				sentSpans.add(span);
				const transactionEvent = createTransactionForOtelSpan(span);
				if (root.parentNode && this._sentSpans.get(root.parentNode.id)) {
					const traceData = transactionEvent.contexts?.trace?.data;
					if (traceData) traceData["sentry.parent_span_already_sent"] = true;
				}
				const spans2 = transactionEvent.spans || [];
				let hasGenAiSpans = false;
				for (const child of root.children) if (createAndFinishSpanForOtelSpan(child, spans2, sentSpans)) hasGenAiSpans = true;
				transactionEvent.spans = spans2.length > MAX_SPAN_COUNT ? spans2.sort((a, b) => a.start_timestamp - b.start_timestamp).slice(0, MAX_SPAN_COUNT) : spans2;
				if (hasGenAiSpans) transactionEvent.sdkProcessingMetadata = {
					...transactionEvent.sdkProcessingMetadata,
					hasGenAiSpans: true
				};
				const measurements = core.timedEventsToMeasurements(span.events);
				if (measurements) transactionEvent.measurements = measurements;
				core.captureEvent(transactionEvent);
			}
			return sentSpans;
		}
		/** Check if a node is a completed root node or a node whose parent has already been sent */
		_nodeIsCompletedRootNodeOrHasSentParent(node) {
			return !!node.span && (!node.parentNode || !!this._sentSpans.get(node.parentNode.id));
		}
		/** Get all completed root nodes from a list of nodes */
		_getCompletedRootNodes(nodes) {
			return nodes.filter((node) => this._nodeIsCompletedRootNodeOrHasSentParent(node));
		}
	};
	function parseSpan(span) {
		const attributes = span.attributes;
		return {
			origin: attributes[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN],
			op: attributes[core.SEMANTIC_ATTRIBUTE_SENTRY_OP],
			source: attributes[core.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]
		};
	}
	function createTransactionForOtelSpan(span) {
		const { op, description, data, origin = "manual", source } = getSpanData(span);
		const capturedSpanScopes = core.getCapturedScopesOnSpan(span);
		const sampleRate = span.attributes[core.SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE];
		const attributes$1 = {
			[core.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: source,
			[core.SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE]: sampleRate,
			[core.SEMANTIC_ATTRIBUTE_SENTRY_OP]: op,
			[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: origin,
			...data,
			...removeSentryAttributes(span.attributes)
		};
		const { links } = span;
		const { traceId: trace_id, spanId: span_id } = span.spanContext();
		const parent_span_id = getParentSpanId(span);
		const status = mapStatus(span);
		const traceContext = {
			parent_span_id,
			span_id,
			trace_id,
			data: attributes$1,
			origin,
			op,
			status: core.getStatusMessage(status),
			links: core.convertSpanLinksForEnvelope(links)
		};
		const statusCode = attributes$1[attributes.HTTP_RESPONSE_STATUS_CODE];
		const responseContext = typeof statusCode === "number" ? { response: { status_code: statusCode } } : void 0;
		return {
			contexts: {
				trace: traceContext,
				otel: { resource: span.resource.attributes },
				...responseContext
			},
			spans: [],
			start_timestamp: core.spanTimeInputToSeconds(span.startTime),
			timestamp: core.spanTimeInputToSeconds(span.endTime),
			transaction: description,
			type: "transaction",
			sdkProcessingMetadata: {
				capturedSpanScope: capturedSpanScopes.scope,
				capturedSpanIsolationScope: capturedSpanScopes.isolationScope,
				sampleRate,
				dynamicSamplingContext: core.getDynamicSamplingContextFromSpan(span)
			},
			...source && { transaction_info: { source } }
		};
	}
	function createAndFinishSpanForOtelSpan(node, spans, sentSpans) {
		const span = node.span;
		if (span) sentSpans.add(span);
		if (!span) {
			let hasGenAiSpans2 = false;
			node.children.forEach((child) => {
				if (createAndFinishSpanForOtelSpan(child, spans, sentSpans)) hasGenAiSpans2 = true;
			});
			return hasGenAiSpans2;
		}
		const span_id = span.spanContext().spanId;
		const trace_id = span.spanContext().traceId;
		const parentSpanId = getParentSpanId(span);
		const { attributes, startTime, endTime, links } = span;
		const { op, description, data, origin = "manual" } = getSpanData(span);
		const allData = {
			[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: origin,
			[core.SEMANTIC_ATTRIBUTE_SENTRY_OP]: op,
			...removeSentryAttributes(attributes),
			...data
		};
		const status = mapStatus(span);
		const spanJSON = {
			span_id,
			trace_id,
			data: allData,
			description,
			parent_span_id: parentSpanId,
			start_timestamp: core.spanTimeInputToSeconds(startTime),
			timestamp: core.spanTimeInputToSeconds(endTime) || void 0,
			status: core.getStatusMessage(status),
			op,
			origin,
			measurements: core.timedEventsToMeasurements(span.events),
			links: core.convertSpanLinksForEnvelope(links)
		};
		spans.push(spanJSON);
		let hasGenAiSpans = !!op?.startsWith("gen_ai.");
		node.children.forEach((child) => {
			if (createAndFinishSpanForOtelSpan(child, spans, sentSpans)) hasGenAiSpans = true;
		});
		return hasGenAiSpans;
	}
	function getSpanData(span) {
		const { op: definedOp, source: definedSource, origin } = parseSpan(span);
		const { op: inferredOp, description, source: inferredSource, data: inferredData } = parseSpanDescription(span);
		return {
			op: definedOp || inferredOp,
			description,
			source: definedSource || inferredSource,
			origin,
			data: {
				...inferredData,
				...getData(span)
			}
		};
	}
	function removeSentryAttributes(data) {
		const cleanedData = { ...data };
		delete cleanedData[core.SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE];
		delete cleanedData[SEMANTIC_ATTRIBUTE_SENTRY_PARENT_IS_REMOTE];
		delete cleanedData[core.SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME];
		return cleanedData;
	}
	function getData(span) {
		const attributes$1 = span.attributes;
		const data = {};
		if (span.kind !== api.SpanKind.INTERNAL) data["otel.kind"] = api.SpanKind[span.kind];
		const maybeHttpStatusCodeAttribute = attributes$1[attributes.HTTP_STATUS_CODE];
		if (maybeHttpStatusCodeAttribute) data[attributes.HTTP_RESPONSE_STATUS_CODE] = maybeHttpStatusCodeAttribute;
		const requestData = getRequestSpanData(span);
		if (requestData.url) data.url = requestData.url;
		if (requestData["http.query"]) data["http.query"] = requestData["http.query"].slice(1);
		if (requestData["http.fragment"]) data["http.fragment"] = requestData["http.fragment"].slice(1);
		return data;
	}
	var SentrySpanProcessor = class {
		constructor(options) {
			this._unsubscribePreprocessSpan = void 0;
			setIsSetup("SentrySpanProcessor");
			this._exporter = new SentrySpanExporter(options);
			this._client = options?.client ?? core.getClient();
			if (this._client && core.hasSpanStreamingEnabled(this._client)) this._unsubscribePreprocessSpan = this._client.on("preprocessSpan", backfillStreamedSpanDataFromOtel);
		}
		/**
		* @inheritDoc
		*/
		async forceFlush() {
			this._exporter.flush();
		}
		/**
		* @inheritDoc
		*/
		async shutdown() {
			this._unsubscribePreprocessSpan?.();
			this._exporter.clear();
		}
		/**
		* @inheritDoc
		*/
		onStart(span, parentContext) {
			const parentSpan = api.trace.getSpan(parentContext);
			let scopes = getScopesFromContext(parentContext);
			if (parentSpan && !parentSpan.spanContext().isRemote) core.addChildSpanToSpan(parentSpan, span);
			if (parentSpan?.spanContext().isRemote) span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_PARENT_IS_REMOTE, true);
			if (parentContext === api.ROOT_CONTEXT) scopes = {
				scope: core.getDefaultCurrentScope(),
				isolationScope: core.getDefaultIsolationScope()
			};
			if (scopes) core.setCapturedScopesOnSpan(span, scopes.scope, scopes.isolationScope);
			core.logSpanStart(span);
			this._client?.emit("spanStart", span);
		}
		/** @inheritDoc */
		onEnd(span) {
			core.logSpanEnd(span);
			this._client?.emit("spanEnd", span);
			if (this._client && core.hasSpanStreamingEnabled(this._client)) this._client.emit("afterSpanEnd", span);
			else this._exporter.export(span);
		}
	};
	function backfillStreamedSpanDataFromOtel(spanJSON, hint) {
		const attributes = spanJSON.attributes;
		if (!attributes) return;
		const kind = hint?.spanKind ?? core.SPAN_KIND.INTERNAL;
		const { op, description, source, data } = inferSpanData(spanJSON.name, attributes, kind);
		spanJSON.name = description;
		core.safeSetSpanJSONAttributes(spanJSON, {
			[core.SEMANTIC_ATTRIBUTE_SENTRY_OP]: op,
			[core.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: source,
			...data
		});
		if (kind !== core.SPAN_KIND.INTERNAL) core.safeSetSpanJSONAttributes(spanJSON, { "otel.kind": core.spanKindToName(kind) });
	}
	var SentrySampler = class {
		constructor(client) {
			this._client = client;
			this._isSpanStreaming = core.hasSpanStreamingEnabled(client);
			setIsSetup("SentrySampler");
		}
		/** @inheritDoc */
		shouldSample(context, traceId, spanName, spanKind, spanAttributes, _links) {
			const options = this._client.getOptions();
			const { ignoreSpans } = options;
			const parentSpan = getValidSpan(context);
			const parentContext = parentSpan?.spanContext();
			if (!core.hasSpansEnabled(options)) return wrapSamplingDecision({
				decision: void 0,
				context,
				spanAttributes
			});
			const maybeSpanHttpMethod = spanAttributes[attributes.HTTP_METHOD] || spanAttributes[attributes.HTTP_REQUEST_METHOD];
			if (spanKind === api.SpanKind.CLIENT && maybeSpanHttpMethod && (!parentSpan || parentContext?.isRemote)) {
				if (!this._isSpanStreaming) {
					this._client.recordDroppedEvent("no_parent_span", "span");
					return wrapSamplingDecision({
						decision: void 0,
						context,
						spanAttributes
					});
				}
			}
			const parentSampled = parentSpan ? getParentSampled(parentSpan, traceId, spanName) : void 0;
			if (!(!parentSpan || parentContext?.isRemote)) {
				if (this._isSpanStreaming) {
					if (parentSampled) {
						if (ignoreSpans?.length) {
							const { description: inferredChildName, op: childOp } = inferSpanData(spanName, spanAttributes, spanKind);
							if (core.shouldIgnoreSpan({
								description: inferredChildName,
								op: spanAttributes[core.SEMANTIC_ATTRIBUTE_SENTRY_OP] ?? childOp,
								attributes: spanAttributes
							}, ignoreSpans)) {
								this._client.recordDroppedEvent("ignored", "span");
								return wrapSamplingDecision({
									decision: sdkTraceBase.SamplingDecision.NOT_RECORD,
									context,
									spanAttributes,
									ignoredChildSpan: true
								});
							}
						}
					}
					if (!parentSampled) {
						const parentSegmentIgnored = parentContext?.traceState?.get(SENTRY_TRACE_STATE_SEGMENT_IGNORED) === "1";
						this._client.recordDroppedEvent(parentSegmentIgnored ? "ignored" : "sample_rate", "span");
					}
				}
				return wrapSamplingDecision({
					decision: parentSampled ? sdkTraceBase.SamplingDecision.RECORD_AND_SAMPLED : sdkTraceBase.SamplingDecision.NOT_RECORD,
					context,
					spanAttributes
				});
			}
			const { description: inferredSpanName, data: inferredAttributes, op } = inferSpanData(spanName, spanAttributes, spanKind);
			const mergedAttributes = {
				...inferredAttributes,
				...spanAttributes
			};
			if (op) mergedAttributes[core.SEMANTIC_ATTRIBUTE_SENTRY_OP] = op;
			if (this._isSpanStreaming && ignoreSpans?.length && core.shouldIgnoreSpan({
				description: inferredSpanName,
				op: mergedAttributes[core.SEMANTIC_ATTRIBUTE_SENTRY_OP] ?? op,
				attributes: mergedAttributes
			}, ignoreSpans)) {
				this._client.recordDroppedEvent("ignored", "span");
				return wrapSamplingDecision({
					decision: sdkTraceBase.SamplingDecision.NOT_RECORD,
					context,
					spanAttributes,
					ignoredSegmentSpan: true
				});
			}
			const mutableSamplingDecision = { decision: true };
			this._client.emit("beforeSampling", {
				spanAttributes: mergedAttributes,
				spanName: inferredSpanName,
				parentSampled,
				parentContext
			}, mutableSamplingDecision);
			if (!mutableSamplingDecision.decision) return wrapSamplingDecision({
				decision: void 0,
				context,
				spanAttributes
			});
			const { isolationScope } = getScopesFromContext(context) ?? {};
			const dscString = parentContext?.traceState ? parentContext.traceState.get(SENTRY_TRACE_STATE_DSC) : void 0;
			const dsc = dscString ? core.baggageHeaderToDynamicSamplingContext(dscString) : void 0;
			const sampleRand = core.parseSampleRate(dsc?.sample_rand) ?? core._INTERNAL_safeMathRandom();
			const [sampled, sampleRate, localSampleRateWasApplied] = core.sampleSpan(options, {
				name: inferredSpanName,
				attributes: mergedAttributes,
				normalizedRequest: isolationScope?.getScopeData().sdkProcessingMetadata.normalizedRequest,
				parentSampled,
				parentSampleRate: core.parseSampleRate(dsc?.sample_rate)
			}, sampleRand);
			const method = `${maybeSpanHttpMethod}`.toUpperCase();
			if (method === "OPTIONS" || method === "HEAD") {
				DEBUG_BUILD && core.debug.log(`[Tracing] Not sampling span because HTTP method is '${method}' for ${spanName}`);
				return wrapSamplingDecision({
					decision: sdkTraceBase.SamplingDecision.NOT_RECORD,
					context,
					spanAttributes,
					sampleRand,
					downstreamTraceSampleRate: 0
				});
			}
			if (!sampled && parentSampled === void 0) {
				DEBUG_BUILD && core.debug.log("[Tracing] Discarding root span because its trace was not chosen to be sampled.");
				this._client.recordDroppedEvent("sample_rate", this._isSpanStreaming ? "span" : "transaction");
			}
			return {
				...wrapSamplingDecision({
					decision: sampled ? sdkTraceBase.SamplingDecision.RECORD_AND_SAMPLED : sdkTraceBase.SamplingDecision.NOT_RECORD,
					context,
					spanAttributes,
					sampleRand,
					downstreamTraceSampleRate: localSampleRateWasApplied ? sampleRate : void 0
				}),
				attributes: { [core.SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE]: localSampleRateWasApplied ? sampleRate : void 0 }
			};
		}
		/** Returns the sampler name or short description with the configuration. */
		toString() {
			return "SentrySampler";
		}
	};
	function getParentSampled(parentSpan, traceId, spanName) {
		const parentContext = parentSpan.spanContext();
		if (api.isSpanContextValid(parentContext) && parentContext.traceId === traceId) {
			if (parentContext.isRemote) {
				const parentSampled2 = getSamplingDecision(parentSpan.spanContext());
				DEBUG_BUILD && core.debug.log(`[Tracing] Inheriting remote parent's sampled decision for ${spanName}: ${parentSampled2}`);
				return parentSampled2;
			}
			const parentSampled = getSamplingDecision(parentContext);
			DEBUG_BUILD && core.debug.log(`[Tracing] Inheriting parent's sampled decision for ${spanName}: ${parentSampled}`);
			return parentSampled;
		}
	}
	function wrapSamplingDecision({ decision, context, spanAttributes, sampleRand, downstreamTraceSampleRate, ignoredChildSpan, ignoredSegmentSpan }) {
		let traceState = getBaseTraceState(context, spanAttributes);
		if (downstreamTraceSampleRate !== void 0) traceState = traceState.set(SENTRY_TRACE_STATE_SAMPLE_RATE, `${downstreamTraceSampleRate}`);
		if (sampleRand !== void 0) traceState = traceState.set(SENTRY_TRACE_STATE_SAMPLE_RAND, `${sampleRand}`);
		if (ignoredChildSpan) traceState = traceState.set(SENTRY_TRACE_STATE_CHILD_IGNORED, "1");
		if (ignoredSegmentSpan) traceState = traceState.set(SENTRY_TRACE_STATE_SEGMENT_IGNORED, "1");
		if (decision == void 0) return {
			decision: sdkTraceBase.SamplingDecision.NOT_RECORD,
			traceState
		};
		if (decision === sdkTraceBase.SamplingDecision.NOT_RECORD) return {
			decision,
			traceState: traceState.set(SENTRY_TRACE_STATE_SAMPLED_NOT_RECORDING, "1")
		};
		return {
			decision,
			traceState
		};
	}
	function getBaseTraceState(context, spanAttributes) {
		let traceState = (api.trace.getSpan(context)?.spanContext())?.traceState || new TraceState();
		const url = spanAttributes[attributes.HTTP_URL] || spanAttributes[attributes.URL_FULL];
		if (url && typeof url === "string") traceState = traceState.set(SENTRY_TRACE_STATE_URL, url);
		return traceState;
	}
	function getValidSpan(context) {
		const span = api.trace.getSpan(context);
		return span && api.isSpanContextValid(span.spanContext()) ? span : void 0;
	}
	const ATTR_TELEMETRY_SDK_LANGUAGE = "telemetry.sdk.language";
	const ATTR_TELEMETRY_SDK_NAME = "telemetry.sdk.name";
	const ATTR_TELEMETRY_SDK_VERSION = "telemetry.sdk.version";
	const SEMRESATTRS_SERVICE_NAMESPACE = "service.namespace";
	var SentryResource = class SentryResource {
		constructor(attributes) {
			this._attributes = attributes;
		}
		get attributes() {
			return this._attributes;
		}
		merge(other) {
			if (!other) return this;
			return new SentryResource({
				...this._attributes,
				...other.attributes
			});
		}
		getRawAttributes() {
			return Object.entries(this._attributes);
		}
	};
	function parseOtelResourceAttributes(raw) {
		if (!raw) return {};
		const result = {};
		for (const pair of raw.split(",")) {
			const eq = pair.indexOf("=");
			if (eq === -1) continue;
			const key = pair.substring(0, eq).trim();
			const value = pair.substring(eq + 1).trim();
			if (key) try {
				result[key] = decodeURIComponent(value);
			} catch {
				result[key] = value;
			}
		}
		return result;
	}
	function getSentryResource(serviceNameFallback) {
		const env = typeof process !== "undefined" ? process.env : {};
		const otelServiceName = env.OTEL_SERVICE_NAME;
		const otelResourceAttrs = parseOtelResourceAttributes(env.OTEL_RESOURCE_ATTRIBUTES);
		return new SentryResource({
			[SEMRESATTRS_SERVICE_NAMESPACE]: "sentry",
			[attributes.SERVICE_NAME]: serviceNameFallback,
			...otelResourceAttrs,
			...otelServiceName ? { [attributes.SERVICE_NAME]: otelServiceName } : {},
			[attributes.SERVICE_VERSION]: core.SDK_VERSION,
			[ATTR_TELEMETRY_SDK_LANGUAGE]: core$1.SDK_INFO[ATTR_TELEMETRY_SDK_LANGUAGE],
			[ATTR_TELEMETRY_SDK_NAME]: core$1.SDK_INFO[ATTR_TELEMETRY_SDK_NAME],
			[ATTR_TELEMETRY_SDK_VERSION]: core$1.SDK_INFO[ATTR_TELEMETRY_SDK_VERSION]
		});
	}
	exports.SEMANTIC_ATTRIBUTE_SENTRY_GRAPHQL_OPERATION = SEMANTIC_ATTRIBUTE_SENTRY_GRAPHQL_OPERATION;
	exports.SENTRY_SCOPES_CONTEXT_KEY = SENTRY_SCOPES_CONTEXT_KEY;
	exports.SentryPropagator = SentryPropagator;
	exports.SentrySampler = SentrySampler;
	exports.SentrySpanProcessor = SentrySpanProcessor;
	exports.buildContextWithSentryScopes = buildContextWithSentryScopes;
	exports.continueTrace = continueTrace;
	exports.enhanceDscWithOpenTelemetryRootSpanName = enhanceDscWithOpenTelemetryRootSpanName;
	exports.getActiveSpan = getActiveSpan;
	exports.getRequestSpanData = getRequestSpanData;
	exports.getScopesFromContext = getScopesFromContext;
	exports.getSentryResource = getSentryResource;
	exports.getSpanKind = getSpanKind;
	exports.getTraceContextForScope = getTraceContextForScope;
	exports.isSentryRequestSpan = isSentryRequestSpan;
	exports.openTelemetrySetupCheck = openTelemetrySetupCheck;
	exports.setIsSetup = setIsSetup;
	exports.setOpenTelemetryContextAsyncContextStrategy = setOpenTelemetryContextAsyncContextStrategy;
	exports.setupEventContextTrace = setupEventContextTrace;
	exports.spanHasAttributes = spanHasAttributes;
	exports.spanHasEvents = spanHasEvents;
	exports.spanHasKind = spanHasKind;
	exports.spanHasName = spanHasName;
	exports.spanHasParentId = spanHasParentId;
	exports.spanHasStatus = spanHasStatus;
	exports.startInactiveSpan = startInactiveSpan;
	exports.startSpan = startSpan;
	exports.startSpanManual = startSpanManual;
	exports.suppressTracing = suppressTracing;
	exports.withActiveSpan = withActiveSpan;
	exports.wrapClientClass = wrapClientClass;
	exports.wrapContextManagerClass = wrapContextManagerClass;
	exports.wrapSamplingDecision = wrapSamplingDecision;
}));
//#endregion
//#region node_modules/@sentry/opentelemetry/build/cjs/index.js
var require_cjs$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const resource = require_resource_DuZKnQnC();
	const core = require_cjs$4();
	const api = require_src();
	const node_async_hooks = __require("node:async_hooks");
	const node_events = __require("node:events");
	require_attributes();
	require_src$2();
	require_src$4();
	const ADD_LISTENER_METHODS = [
		"addListener",
		"on",
		"once",
		"prependListener",
		"prependOnceListener"
	];
	var SentryAsyncLocalStorageContextManager = class {
		constructor() {
			this._asyncLocalStorage = new node_async_hooks.AsyncLocalStorage();
			this._kOtListeners = /* @__PURE__ */ Symbol("OtListeners");
			this._wrapped = false;
			resource.setIsSetup("SentryContextManager");
		}
		active() {
			return this._asyncLocalStorage.getStore() ?? api.ROOT_CONTEXT;
		}
		with(context, fn, thisArg, ...args) {
			const ctx2 = resource.buildContextWithSentryScopes(context, this.active());
			const cb = thisArg == null ? fn : fn.bind(thisArg);
			return this._asyncLocalStorage.run(ctx2, cb, ...args);
		}
		enable() {
			return this;
		}
		disable() {
			this._asyncLocalStorage.disable();
			return this;
		}
		bind(context, target) {
			if (target instanceof node_events.EventEmitter) return this._bindEventEmitter(context, target);
			if (typeof target === "function") return this._bindFunction(context, target);
			return target;
		}
		/**
		* Gets underlying AsyncLocalStorage and symbol to allow lookup of scope.
		* This is Sentry-specific.
		*/
		getAsyncLocalStorageLookup() {
			return {
				asyncLocalStorage: this._asyncLocalStorage,
				contextSymbol: resource.SENTRY_SCOPES_CONTEXT_KEY
			};
		}
		_bindFunction(context, target) {
			const managerWith = this.with.bind(this);
			const contextWrapper = function(...args) {
				return managerWith(context, () => target.apply(this, args));
			};
			Object.defineProperty(contextWrapper, "length", {
				enumerable: false,
				configurable: true,
				writable: false,
				value: target.length
			});
			return contextWrapper;
		}
		_bindEventEmitter(context, ee) {
			if (this._getPatchMap(ee) !== void 0) return ee;
			this._createPatchMap(ee);
			for (const methodName of ADD_LISTENER_METHODS) {
				if (ee[methodName] === void 0) continue;
				ee[methodName] = this._patchAddListener(ee, ee[methodName], context);
			}
			if (typeof ee.removeListener === "function") ee.removeListener = this._patchRemoveListener(ee, ee.removeListener);
			if (typeof ee.off === "function") ee.off = this._patchRemoveListener(ee, ee.off);
			if (typeof ee.removeAllListeners === "function") ee.removeAllListeners = this._patchRemoveAllListeners(ee, ee.removeAllListeners);
			return ee;
		}
		_patchRemoveListener(ee, original) {
			const contextManager = this;
			return function(event, listener) {
				const events = contextManager._getPatchMap(ee)?.[event];
				if (events === void 0) return original.call(this, event, listener);
				const patchedListener = events.get(listener);
				return original.call(this, event, patchedListener || listener);
			};
		}
		_patchRemoveAllListeners(ee, original) {
			const contextManager = this;
			return function(event) {
				const map = contextManager._getPatchMap(ee);
				if (map !== void 0) {
					if (arguments.length === 0) contextManager._createPatchMap(ee);
					else if (event !== void 0 && map[event] !== void 0) delete map[event];
				}
				return original.apply(this, arguments);
			};
		}
		_patchAddListener(ee, original, context) {
			const contextManager = this;
			return function(event, listener) {
				if (contextManager._wrapped) return original.call(this, event, listener);
				let map = contextManager._getPatchMap(ee);
				if (map === void 0) map = contextManager._createPatchMap(ee);
				let listeners = map[event];
				if (listeners === void 0) {
					listeners = /* @__PURE__ */ new WeakMap();
					map[event] = listeners;
				}
				const patchedListener = contextManager.bind(context, listener);
				listeners.set(listener, patchedListener);
				contextManager._wrapped = true;
				try {
					return original.call(this, event, patchedListener);
				} finally {
					contextManager._wrapped = false;
				}
			};
		}
		_createPatchMap(ee) {
			const map = /* @__PURE__ */ Object.create(null);
			ee[this._kOtListeners] = map;
			return map;
		}
		_getPatchMap(ee) {
			return ee[this._kOtListeners];
		}
	};
	exports.SEMANTIC_ATTRIBUTE_SENTRY_GRAPHQL_OPERATION = resource.SEMANTIC_ATTRIBUTE_SENTRY_GRAPHQL_OPERATION;
	exports.SentryPropagator = resource.SentryPropagator;
	exports.SentrySampler = resource.SentrySampler;
	exports.SentrySpanProcessor = resource.SentrySpanProcessor;
	exports.continueTrace = resource.continueTrace;
	exports.enhanceDscWithOpenTelemetryRootSpanName = resource.enhanceDscWithOpenTelemetryRootSpanName;
	exports.getActiveSpan = resource.getActiveSpan;
	exports.getRequestSpanData = resource.getRequestSpanData;
	exports.getScopesFromContext = resource.getScopesFromContext;
	exports.getSentryResource = resource.getSentryResource;
	exports.getSpanKind = resource.getSpanKind;
	exports.getTraceContextForScope = resource.getTraceContextForScope;
	exports.isSentryRequestSpan = resource.isSentryRequestSpan;
	exports.openTelemetrySetupCheck = resource.openTelemetrySetupCheck;
	exports.setOpenTelemetryContextAsyncContextStrategy = resource.setOpenTelemetryContextAsyncContextStrategy;
	exports.setupEventContextTrace = resource.setupEventContextTrace;
	exports.spanHasAttributes = resource.spanHasAttributes;
	exports.spanHasEvents = resource.spanHasEvents;
	exports.spanHasKind = resource.spanHasKind;
	exports.spanHasName = resource.spanHasName;
	exports.spanHasParentId = resource.spanHasParentId;
	exports.spanHasStatus = resource.spanHasStatus;
	exports.startInactiveSpan = resource.startInactiveSpan;
	exports.startSpan = resource.startSpan;
	exports.startSpanManual = resource.startSpanManual;
	exports.suppressTracing = resource.suppressTracing;
	exports.withActiveSpan = resource.withActiveSpan;
	exports.wrapClientClass = resource.wrapClientClass;
	exports.wrapContextManagerClass = resource.wrapContextManagerClass;
	exports.wrapSamplingDecision = resource.wrapSamplingDecision;
	exports.getClient = core.getClient;
	exports.getDynamicSamplingContextFromSpan = core.getDynamicSamplingContextFromSpan;
	exports.shouldPropagateTraceForUrl = core.shouldPropagateTraceForUrl;
	exports.withStreamedSpan = core.withStreamedSpan;
	exports.SentryAsyncLocalStorageContextManager = SentryAsyncLocalStorageContextManager;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/otel/contextManager.js
var require_contextManager = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	exports.SentryContextManager = require_cjs$3().SentryAsyncLocalStorageContextManager;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/otel/logger.js
var require_logger = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const api = require_src();
	const core = require_cjs$4();
	function setupOpenTelemetryLogger() {
		api.diag.disable();
		api.diag.setLogger({
			error: core.debug.error,
			warn: core.debug.warn,
			info: core.debug.log,
			debug: core.debug.log,
			verbose: core.debug.log
		}, api.DiagLogLevel.DEBUG);
	}
	exports.setupOpenTelemetryLogger = setupOpenTelemetryLogger;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/integrations/childProcess.js
var require_childProcess = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const diagnosticsChannel$1 = __require("node:diagnostics_channel");
	const core = require_cjs$4();
	const INTEGRATION_NAME = "ChildProcess";
	const childProcessIntegration = core.defineIntegration((options = {}) => {
		return {
			name: INTEGRATION_NAME,
			setup() {
				diagnosticsChannel$1.channel("child_process").subscribe((event) => {
					if (event && typeof event === "object" && "process" in event) captureChildProcessEvents(event.process, options);
				});
				diagnosticsChannel$1.channel("worker_threads").subscribe((event) => {
					if (event && typeof event === "object" && "worker" in event) captureWorkerThreadEvents(event.worker, options);
				});
			}
		};
	});
	function captureChildProcessEvents(child, options) {
		let hasExited = false;
		let data;
		child.on("spawn", () => {
			if (child.spawnfile === "/usr/bin/sw_vers") {
				hasExited = true;
				return;
			}
			data = { spawnfile: child.spawnfile };
			if (options.includeChildProcessArgs) data.spawnargs = child.spawnargs;
		}).on("exit", (code) => {
			if (!hasExited) {
				hasExited = true;
				if (code !== null && code !== 0) core.addBreadcrumb({
					category: "child_process",
					message: `Child process exited with code '${code}'`,
					level: code === 0 ? "info" : "warning",
					data
				});
			}
		}).on("error", (error) => {
			if (!hasExited) {
				hasExited = true;
				core.addBreadcrumb({
					category: "child_process",
					message: `Child process errored with '${error.message}'`,
					level: "error",
					data
				});
			}
		});
	}
	function captureWorkerThreadEvents(worker, options) {
		let threadId;
		worker.on("online", () => {
			threadId = worker.threadId;
		}).on("error", (error) => {
			if (options.captureWorkerErrors !== false) core.captureException(error, { mechanism: {
				type: "auto.child_process.worker_thread",
				handled: false,
				data: { threadId: String(threadId) }
			} });
			else core.addBreadcrumb({
				category: "worker_thread",
				message: `Worker thread errored with '${error.message}'`,
				level: "error",
				data: { threadId }
			});
		});
	}
	exports.childProcessIntegration = childProcessIntegration;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/integrations/context.js
var require_context = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const node_child_process = __require("node:child_process");
	const node_fs$2 = __require("node:fs");
	const os$1 = __require("node:os");
	const node_path$2 = __require("node:path");
	const util$4 = __require("node:util");
	const core = require_cjs$4();
	const readFileAsync = util$4.promisify(node_fs$2.readFile);
	const readDirAsync = util$4.promisify(node_fs$2.readdir);
	const INTEGRATION_NAME = "Context";
	const _nodeContextIntegration = ((options = {}) => {
		const _options = {
			app: true,
			os: true,
			device: true,
			culture: true,
			cloudResource: true,
			...options
		};
		const appContext = _options.app ? getAppContext() : void 0;
		const deviceContext = _options.device ? getDeviceContext(_options.device) : void 0;
		const cultureContext = _options.culture ? getCultureContext() : void 0;
		const cloudResourceContext = _options.cloudResource ? getCloudResourceContext() : void 0;
		const osContextPromise = _options.os ? getOsContext() : void 0;
		const cachedSpanAttributes = {
			"process.runtime.engine.name": "v8",
			"process.runtime.engine.version": process.versions.v8,
			...contextsToSpanAttributes({
				app: appContext,
				device: deviceContext,
				culture: cultureContext,
				cloud_resource: cloudResourceContext
			})
		};
		if (osContextPromise) osContextPromise.then((osCtx) => Object.assign(cachedSpanAttributes, contextsToSpanAttributes({ os: osCtx }))).catch(() => {});
		const contextsPromise = (async () => {
			const contexts = {};
			if (osContextPromise) contexts.os = await osContextPromise;
			if (appContext) contexts.app = appContext;
			if (deviceContext) contexts.device = deviceContext;
			if (cultureContext) contexts.culture = cultureContext;
			if (cloudResourceContext) contexts.cloud_resource = cloudResourceContext;
			return contexts;
		})();
		async function addContext(event) {
			const updatedContext = _updateContext(await contextsPromise);
			event.contexts = {
				...event.contexts,
				app: {
					...updatedContext.app,
					...event.contexts?.app
				},
				os: {
					...updatedContext.os,
					...event.contexts?.os
				},
				device: {
					...updatedContext.device,
					...event.contexts?.device
				},
				culture: {
					...updatedContext.culture,
					...event.contexts?.culture
				},
				cloud_resource: {
					...updatedContext.cloud_resource,
					...event.contexts?.cloud_resource
				}
			};
			return event;
		}
		return {
			name: INTEGRATION_NAME,
			processEvent(event) {
				return addContext(event);
			},
			processSegmentSpan(span) {
				core.safeSetSpanJSONAttributes(span, cachedSpanAttributes);
				core.safeSetSpanJSONAttributes(span, getDynamicSpanAttributes(appContext, deviceContext));
			}
		};
	});
	const nodeContextIntegration = core.defineIntegration(_nodeContextIntegration);
	function _updateContext(contexts) {
		if (contexts.app?.app_memory) contexts.app.app_memory = process.memoryUsage().rss;
		if (contexts.app?.free_memory && typeof process.availableMemory === "function") {
			const freeMemory = process.availableMemory?.();
			if (freeMemory != null) contexts.app.free_memory = freeMemory;
		}
		if (contexts.device?.free_memory) contexts.device.free_memory = os$1.freemem();
		return contexts;
	}
	function contextsToSpanAttributes(contexts) {
		const attrs = {};
		const { app, device, os: osCtx, culture, cloud_resource } = contexts;
		if (app) {
			if (app.app_start_time) attrs["app.start_time"] = app.app_start_time;
		}
		if (device) {
			if (device.arch) attrs["device.archs"] = [device.arch];
			if (device.boot_time) attrs["device.boot_time"] = device.boot_time;
			if (device.memory_size != null) attrs["device.memory_size"] = device.memory_size;
			if (device.processor_count != null) attrs["device.processor_count"] = device.processor_count;
			if (device.cpu_description) attrs["device.cpu_description"] = device.cpu_description;
			if (device.processor_frequency != null) attrs["device.processor_frequency"] = device.processor_frequency;
		}
		if (osCtx) {
			if (osCtx.name) attrs["os.name"] = osCtx.name;
			if (osCtx.version) attrs["os.version"] = osCtx.version;
			if (osCtx.kernel_version) attrs["os.kernel_version"] = osCtx.kernel_version;
			if (osCtx.build) attrs["os.build"] = osCtx.build;
		}
		if (culture) {
			if (culture.locale) attrs["culture.locale"] = culture.locale;
			if (culture.timezone) attrs["culture.timezone"] = culture.timezone;
		}
		if (cloud_resource) {
			for (const [key, value] of Object.entries(cloud_resource)) if (value != null) attrs[key] = value;
		}
		return attrs;
	}
	function getDynamicSpanAttributes(appContext, deviceContext) {
		const attrs = {};
		if (appContext) {
			attrs["app.memory"] = process.memoryUsage().rss;
			if (typeof process.availableMemory === "function") {
				const freeMemory = process.availableMemory?.();
				if (freeMemory != null) attrs["app.free_memory"] = freeMemory;
			}
		}
		if (deviceContext?.free_memory != null) attrs["device.free_memory"] = os$1.freemem();
		return attrs;
	}
	async function getOsContext() {
		const platformId = os$1.platform();
		switch (platformId) {
			case "darwin": return getDarwinInfo();
			case "linux": return getLinuxInfo();
			default: return {
				name: PLATFORM_NAMES[platformId] || platformId,
				version: os$1.release()
			};
		}
	}
	function getCultureContext() {
		try {
			if (typeof process.versions.icu !== "string") return;
			const january = /* @__PURE__ */ new Date(9e8);
			if (new Intl.DateTimeFormat("es", { month: "long" }).format(january) === "enero") {
				const options = Intl.DateTimeFormat().resolvedOptions();
				return {
					locale: options.locale,
					timezone: options.timeZone
				};
			}
		} catch {}
	}
	function getAppContext() {
		const app_memory = process.memoryUsage().rss;
		const appContext = {
			app_start_time: (/* @__PURE__ */ new Date(Date.now() - process.uptime() * 1e3)).toISOString(),
			app_memory
		};
		if (typeof process.availableMemory === "function") {
			const freeMemory = process.availableMemory?.();
			if (freeMemory != null) appContext.free_memory = freeMemory;
		}
		return appContext;
	}
	function getDeviceContext(deviceOpt) {
		const device = {};
		let uptime;
		try {
			uptime = os$1.uptime();
		} catch {}
		if (typeof uptime === "number") device.boot_time = (/* @__PURE__ */ new Date(Date.now() - uptime * 1e3)).toISOString();
		device.arch = os$1.arch();
		if (deviceOpt === true || deviceOpt.memory) {
			device.memory_size = os$1.totalmem();
			device.free_memory = os$1.freemem();
		}
		if (deviceOpt === true || deviceOpt.cpu) {
			const cpuInfo = os$1.cpus();
			const firstCpu = cpuInfo?.[0];
			if (firstCpu) {
				device.processor_count = cpuInfo.length;
				device.cpu_description = firstCpu.model;
				device.processor_frequency = firstCpu.speed;
			}
		}
		return device;
	}
	const PLATFORM_NAMES = {
		aix: "IBM AIX",
		freebsd: "FreeBSD",
		openbsd: "OpenBSD",
		sunos: "SunOS",
		win32: "Windows",
		ohos: "OpenHarmony",
		android: "Android"
	};
	const LINUX_DISTROS = [
		{
			name: "fedora-release",
			distros: ["Fedora"]
		},
		{
			name: "redhat-release",
			distros: ["Red Hat Linux", "Centos"]
		},
		{
			name: "redhat_version",
			distros: ["Red Hat Linux"]
		},
		{
			name: "SuSE-release",
			distros: ["SUSE Linux"]
		},
		{
			name: "lsb-release",
			distros: ["Ubuntu Linux", "Arch Linux"]
		},
		{
			name: "debian_version",
			distros: ["Debian"]
		},
		{
			name: "debian_release",
			distros: ["Debian"]
		},
		{
			name: "arch-release",
			distros: ["Arch Linux"]
		},
		{
			name: "gentoo-release",
			distros: ["Gentoo Linux"]
		},
		{
			name: "novell-release",
			distros: ["SUSE Linux"]
		},
		{
			name: "alpine-release",
			distros: ["Alpine Linux"]
		}
	];
	const LINUX_VERSIONS = {
		alpine: (content) => content,
		arch: (content) => matchFirst(/distrib_release=(.*)/, content),
		centos: (content) => matchFirst(/release ([^ ]+)/, content),
		debian: (content) => content,
		fedora: (content) => matchFirst(/release (..)/, content),
		mint: (content) => matchFirst(/distrib_release=(.*)/, content),
		red: (content) => matchFirst(/release ([^ ]+)/, content),
		suse: (content) => matchFirst(/VERSION = (.*)\n/, content),
		ubuntu: (content) => matchFirst(/distrib_release=(.*)/, content)
	};
	function matchFirst(regex, text) {
		const match = regex.exec(text);
		return match ? match[1] : void 0;
	}
	async function getDarwinInfo() {
		const darwinInfo = {
			kernel_version: os$1.release(),
			name: "Mac OS X",
			version: `10.${Number(os$1.release().split(".")[0]) - 4}`
		};
		try {
			const output = await new Promise((resolve, reject) => {
				node_child_process.execFile("/usr/bin/sw_vers", (error, stdout) => {
					if (error) {
						reject(error);
						return;
					}
					resolve(stdout);
				});
			});
			darwinInfo.name = matchFirst(/^ProductName:\s+(.*)$/m, output);
			darwinInfo.version = matchFirst(/^ProductVersion:\s+(.*)$/m, output);
			darwinInfo.build = matchFirst(/^BuildVersion:\s+(.*)$/m, output);
		} catch {}
		return darwinInfo;
	}
	function getLinuxDistroId(name) {
		return name.split(" ")[0].toLowerCase();
	}
	async function getLinuxInfo() {
		const linuxInfo = {
			kernel_version: os$1.release(),
			name: "Linux"
		};
		try {
			const etcFiles = await readDirAsync("/etc");
			const distroFile = LINUX_DISTROS.find((file) => etcFiles.includes(file.name));
			if (!distroFile) return linuxInfo;
			const contents = (await readFileAsync(node_path$2.join("/etc", distroFile.name), { encoding: "utf-8" })).toLowerCase();
			const { distros } = distroFile;
			linuxInfo.name = distros.find((d) => contents.indexOf(getLinuxDistroId(d)) >= 0) || distros[0];
			linuxInfo.version = LINUX_VERSIONS[getLinuxDistroId(linuxInfo.name)]?.(contents);
		} catch {}
		return linuxInfo;
	}
	function getCloudResourceContext() {
		if (process.env.VERCEL) return {
			"cloud.provider": "vercel",
			"cloud.region": process.env.VERCEL_REGION
		};
		else if (process.env.AWS_REGION) return {
			"cloud.provider": "aws",
			"cloud.region": process.env.AWS_REGION,
			"cloud.platform": process.env.AWS_EXECUTION_ENV
		};
		else if (process.env.GCP_PROJECT) return { "cloud.provider": "gcp" };
		else if (process.env.ALIYUN_REGION_ID) return {
			"cloud.provider": "alibaba_cloud",
			"cloud.region": process.env.ALIYUN_REGION_ID
		};
		else if (process.env.WEBSITE_SITE_NAME && process.env.REGION_NAME) return {
			"cloud.provider": "azure",
			"cloud.region": process.env.REGION_NAME
		};
		else if (process.env.IBM_CLOUD_REGION) return {
			"cloud.provider": "ibm_cloud",
			"cloud.region": process.env.IBM_CLOUD_REGION
		};
		else if (process.env.TENCENTCLOUD_REGION) return {
			"cloud.provider": "tencent_cloud",
			"cloud.region": process.env.TENCENTCLOUD_REGION,
			"cloud.account.id": process.env.TENCENTCLOUD_APPID,
			"cloud.availability_zone": process.env.TENCENTCLOUD_ZONE
		};
		else if (process.env.NETLIFY) return { "cloud.provider": "netlify" };
		else if (process.env.FLY_REGION) return {
			"cloud.provider": "fly.io",
			"cloud.region": process.env.FLY_REGION
		};
		else if (process.env.DYNO) return { "cloud.provider": "heroku" };
		else return;
	}
	exports.contextsToSpanAttributes = contextsToSpanAttributes;
	exports.getAppContext = getAppContext;
	exports.getDeviceContext = getDeviceContext;
	exports.getDynamicSpanAttributes = getDynamicSpanAttributes;
	exports.nodeContextIntegration = nodeContextIntegration;
	exports.readDirAsync = readDirAsync;
	exports.readFileAsync = readFileAsync;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/integrations/contextlines.js
var require_contextlines = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const node_fs$1 = __require("node:fs");
	const node_readline = __require("node:readline");
	const core = require_cjs$4();
	const debugBuild = require_debug_build$3();
	const LRU_FILE_CONTENTS_CACHE = new core.LRUMap(10);
	const LRU_FILE_CONTENTS_FS_READ_FAILED = new core.LRUMap(20);
	const DEFAULT_LINES_OF_CONTEXT = 7;
	const INTEGRATION_NAME = "ContextLines";
	const MAX_CONTEXTLINES_COLNO = 1e3;
	const MAX_CONTEXTLINES_LINENO = 1e4;
	function emplace(map, key, contents) {
		const value = map.get(key);
		if (value === void 0) {
			map.set(key, contents);
			return contents;
		}
		return value;
	}
	function shouldSkipContextLinesForFile(path) {
		if (path.startsWith("node:")) return true;
		if (path.endsWith(".min.js")) return true;
		if (path.endsWith(".min.cjs")) return true;
		if (path.endsWith(".min.mjs")) return true;
		if (path.startsWith("data:")) return true;
		return false;
	}
	function shouldSkipContextLinesForFrame(frame) {
		if (frame.lineno !== void 0 && frame.lineno > MAX_CONTEXTLINES_LINENO) return true;
		if (frame.colno !== void 0 && frame.colno > MAX_CONTEXTLINES_COLNO) return true;
		return false;
	}
	function rangeExistsInContentCache(file, range) {
		const contents = LRU_FILE_CONTENTS_CACHE.get(file);
		if (contents === void 0) return false;
		for (let i = range[0]; i <= range[1]; i++) if (contents[i] === void 0) return false;
		return true;
	}
	function makeLineReaderRanges(lines, linecontext) {
		if (!lines.length) return [];
		let i = 0;
		const line = lines[0];
		if (typeof line !== "number") return [];
		let current = makeContextRange(line, linecontext);
		const out = [];
		while (true) {
			if (i === lines.length - 1) {
				out.push(current);
				break;
			}
			const next = lines[i + 1];
			if (typeof next !== "number") break;
			if (next <= current[1]) current[1] = next + linecontext;
			else {
				out.push(current);
				current = makeContextRange(next, linecontext);
			}
			i++;
		}
		return out;
	}
	function getContextLinesFromFile(path, ranges, output) {
		return new Promise((resolve, _reject) => {
			const stream = node_fs$1.createReadStream(path);
			const lineReaded = node_readline.createInterface({ input: stream });
			function destroyStreamAndResolve() {
				stream.destroy();
				resolve();
			}
			let lineNumber = 0;
			let currentRangeIndex = 0;
			const range = ranges[currentRangeIndex];
			if (range === void 0) {
				destroyStreamAndResolve();
				return;
			}
			let rangeStart = range[0];
			let rangeEnd = range[1];
			function onStreamError(e) {
				LRU_FILE_CONTENTS_FS_READ_FAILED.set(path, 1);
				debugBuild.DEBUG_BUILD && core.debug.error(`Failed to read file: ${path}. Error: ${e}`);
				lineReaded.close();
				lineReaded.removeAllListeners();
				destroyStreamAndResolve();
			}
			stream.on("error", onStreamError);
			lineReaded.on("error", onStreamError);
			lineReaded.on("close", destroyStreamAndResolve);
			lineReaded.on("line", (line) => {
				lineNumber++;
				if (lineNumber < rangeStart) return;
				output[lineNumber] = core.snipLine(line, 0);
				if (lineNumber >= rangeEnd) {
					if (currentRangeIndex === ranges.length - 1) {
						lineReaded.close();
						lineReaded.removeAllListeners();
						return;
					}
					currentRangeIndex++;
					const range2 = ranges[currentRangeIndex];
					if (range2 === void 0) {
						lineReaded.close();
						lineReaded.removeAllListeners();
						return;
					}
					rangeStart = range2[0];
					rangeEnd = range2[1];
				}
			});
		});
	}
	async function addSourceContext(event, contextLines) {
		const filesToLines = {};
		if (contextLines > 0 && event.exception?.values) for (const exception of event.exception.values) {
			if (!exception.stacktrace?.frames?.length) continue;
			for (let i = exception.stacktrace.frames.length - 1; i >= 0; i--) {
				const frame = exception.stacktrace.frames[i];
				const filename = frame?.filename;
				if (!frame || typeof filename !== "string" || typeof frame.lineno !== "number" || shouldSkipContextLinesForFile(filename) || shouldSkipContextLinesForFrame(frame)) continue;
				if (!filesToLines[filename]) filesToLines[filename] = [];
				filesToLines[filename].push(frame.lineno);
			}
		}
		const files = Object.keys(filesToLines);
		if (files.length == 0) return event;
		const readlinePromises = [];
		for (const file of files) {
			if (LRU_FILE_CONTENTS_FS_READ_FAILED.get(file)) continue;
			const filesToLineRanges = filesToLines[file];
			if (!filesToLineRanges) continue;
			filesToLineRanges.sort((a, b) => a - b);
			const ranges = makeLineReaderRanges(filesToLineRanges, contextLines);
			if (ranges.every((r) => rangeExistsInContentCache(file, r))) continue;
			const cache = emplace(LRU_FILE_CONTENTS_CACHE, file, {});
			readlinePromises.push(getContextLinesFromFile(file, ranges, cache));
		}
		await Promise.all(readlinePromises).catch(() => {
			debugBuild.DEBUG_BUILD && core.debug.log("Failed to read one or more source files and resolve context lines");
		});
		if (contextLines > 0 && event.exception?.values) {
			for (const exception of event.exception.values) if (exception.stacktrace?.frames && exception.stacktrace.frames.length > 0) addSourceContextToFrames(exception.stacktrace.frames, contextLines, LRU_FILE_CONTENTS_CACHE);
		}
		return event;
	}
	function addSourceContextToFrames(frames, contextLines, cache) {
		for (const frame of frames) if (frame.filename && frame.context_line === void 0 && typeof frame.lineno === "number") {
			const contents = cache.get(frame.filename);
			if (contents === void 0) continue;
			addContextToFrame(frame.lineno, frame, contextLines, contents);
		}
	}
	function clearLineContext(frame) {
		delete frame.pre_context;
		delete frame.context_line;
		delete frame.post_context;
	}
	function addContextToFrame(lineno, frame, contextLines, contents) {
		if (frame.lineno === void 0 || contents === void 0) {
			debugBuild.DEBUG_BUILD && core.debug.error("Cannot resolve context for frame with no lineno or file contents");
			return;
		}
		frame.pre_context = [];
		for (let i = makeRangeStart(lineno, contextLines); i < lineno; i++) {
			const line = contents[i];
			if (line === void 0) {
				clearLineContext(frame);
				debugBuild.DEBUG_BUILD && core.debug.error(`Could not find line ${i} in file ${frame.filename}`);
				return;
			}
			frame.pre_context.push(line);
		}
		if (contents[lineno] === void 0) {
			clearLineContext(frame);
			debugBuild.DEBUG_BUILD && core.debug.error(`Could not find line ${lineno} in file ${frame.filename}`);
			return;
		}
		frame.context_line = contents[lineno];
		const end = makeRangeEnd(lineno, contextLines);
		frame.post_context = [];
		for (let i = lineno + 1; i <= end; i++) {
			const line = contents[i];
			if (line === void 0) break;
			frame.post_context.push(line);
		}
	}
	function makeRangeStart(line, linecontext) {
		return Math.max(1, line - linecontext);
	}
	function makeRangeEnd(line, linecontext) {
		return line + linecontext;
	}
	function makeContextRange(line, linecontext) {
		return [makeRangeStart(line, linecontext), makeRangeEnd(line, linecontext)];
	}
	const _contextLinesIntegration = ((options = {}) => {
		return {
			name: INTEGRATION_NAME,
			processEvent(event, _hint, client) {
				return addSourceContext(event, options.frameContextLines ?? client?.getDataCollectionOptions().frameContextLines ?? DEFAULT_LINES_OF_CONTEXT);
			}
		};
	});
	const contextLinesIntegration = core.defineIntegration(_contextLinesIntegration);
	exports.MAX_CONTEXTLINES_COLNO = MAX_CONTEXTLINES_COLNO;
	exports.MAX_CONTEXTLINES_LINENO = MAX_CONTEXTLINES_LINENO;
	exports._contextLinesIntegration = _contextLinesIntegration;
	exports.addContextToFrame = addContextToFrame;
	exports.contextLinesIntegration = contextLinesIntegration;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/utils/debug.js
var require_debug = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	let cachedDebuggerEnabled;
	async function isDebuggerEnabled() {
		if (cachedDebuggerEnabled === void 0) try {
			cachedDebuggerEnabled = !!(await import("node:inspector")).url();
		} catch {
			cachedDebuggerEnabled = false;
		}
		return cachedDebuggerEnabled;
	}
	exports.isDebuggerEnabled = isDebuggerEnabled;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/integrations/local-variables/common.js
var require_common$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const LOCAL_VARIABLES_KEY = "__SENTRY_ERROR_LOCAL_VARIABLES__";
	function createRateLimiter(maxPerSecond, enable, disable) {
		let count = 0;
		let retrySeconds = 5;
		let disabledTimeout = 0;
		setInterval(() => {
			if (disabledTimeout === 0) {
				if (count > maxPerSecond) {
					retrySeconds *= 2;
					disable(retrySeconds);
					if (retrySeconds > 86400) retrySeconds = 86400;
					disabledTimeout = retrySeconds;
				}
			} else {
				disabledTimeout -= 1;
				if (disabledTimeout === 0) enable();
			}
			count = 0;
		}, 1e3).unref();
		return () => {
			count += 1;
		};
	}
	function isAnonymous(name) {
		return name !== void 0 && (name.length === 0 || name === "?" || name === "<anonymous>");
	}
	function functionNamesMatch(a, b) {
		return a === b || `Object.${a}` === b || a === `Object.${b}` || isAnonymous(a) && isAnonymous(b);
	}
	exports.LOCAL_VARIABLES_KEY = LOCAL_VARIABLES_KEY;
	exports.createRateLimiter = createRateLimiter;
	exports.functionNamesMatch = functionNamesMatch;
	exports.isAnonymous = isAnonymous;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/integrations/local-variables/local-variables-async.js
var require_local_variables_async = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const node_worker_threads$1 = __require("node:worker_threads");
	const core = require_cjs$4();
	const debug = require_debug();
	const common = require_common$1();
	const base64WorkerScript = "LyohIEBzZW50cnkvbm9kZS1jb3JlIDEwLjYyLjAgKDFmYzUzOWUpIHwgaHR0cHM6Ly9naXRodWIuY29tL2dldHNlbnRyeS9zZW50cnktamF2YXNjcmlwdCAqLwppbXBvcnR7U2Vzc2lvbiBhcyBlfWZyb20ibm9kZTppbnNwZWN0b3IvcHJvbWlzZXMiO2ltcG9ydHt3b3JrZXJEYXRhIGFzIHR9ZnJvbSJub2RlOndvcmtlcl90aHJlYWRzIjtjb25zdCBuPWdsb2JhbFRoaXMsaT17fTtjb25zdCBvPSJfX1NFTlRSWV9FUlJPUl9MT0NBTF9WQVJJQUJMRVNfXyI7Y29uc3QgYT10O2Z1bmN0aW9uIHMoLi4uZSl7YS5kZWJ1ZyYmZnVuY3Rpb24oZSl7aWYoISgiY29uc29sZSJpbiBuKSlyZXR1cm4gZSgpO2NvbnN0IHQ9bi5jb25zb2xlLG89e30sYT1PYmplY3Qua2V5cyhpKTthLmZvckVhY2goZT0+e2NvbnN0IG49aVtlXTtvW2VdPXRbZV0sdFtlXT1ufSk7dHJ5e3JldHVybiBlKCl9ZmluYWxseXthLmZvckVhY2goZT0+e3RbZV09b1tlXX0pfX0oKCk9PmNvbnNvbGUubG9nKCJbTG9jYWxWYXJpYWJsZXMgV29ya2VyXSIsLi4uZSkpfWFzeW5jIGZ1bmN0aW9uIGMoZSx0LG4saSl7Y29uc3Qgbz1hd2FpdCBlLnBvc3QoIlJ1bnRpbWUuZ2V0UHJvcGVydGllcyIse29iamVjdElkOnQsb3duUHJvcGVydGllczohMH0pO2lbbl09by5yZXN1bHQuZmlsdGVyKGU9PiJsZW5ndGgiIT09ZS5uYW1lJiYhaXNOYU4ocGFyc2VJbnQoZS5uYW1lLDEwKSkpLnNvcnQoKGUsdCk9PnBhcnNlSW50KGUubmFtZSwxMCktcGFyc2VJbnQodC5uYW1lLDEwKSkubWFwKGU9PmUudmFsdWU/LnZhbHVlKX1hc3luYyBmdW5jdGlvbiByKGUsdCxuLGkpe2NvbnN0IG89YXdhaXQgZS5wb3N0KCJSdW50aW1lLmdldFByb3BlcnRpZXMiLHtvYmplY3RJZDp0LG93blByb3BlcnRpZXM6ITB9KTtpW25dPW8ucmVzdWx0Lm1hcChlPT5bZS5uYW1lLGUudmFsdWU/LnZhbHVlXSkucmVkdWNlKChlLFt0LG5dKT0+KGVbdF09bixlKSx7fSl9ZnVuY3Rpb24gdShlLHQpe2UudmFsdWUmJigidmFsdWUiaW4gZS52YWx1ZT92b2lkIDA9PT1lLnZhbHVlLnZhbHVlfHxudWxsPT09ZS52YWx1ZS52YWx1ZT90W2UubmFtZV09YDwke2UudmFsdWUudmFsdWV9PmA6dFtlLm5hbWVdPWUudmFsdWUudmFsdWU6ImRlc2NyaXB0aW9uImluIGUudmFsdWUmJiJmdW5jdGlvbiIhPT1lLnZhbHVlLnR5cGU/dFtlLm5hbWVdPWA8JHtlLnZhbHVlLmRlc2NyaXB0aW9ufT5gOiJ1bmRlZmluZWQiPT09ZS52YWx1ZS50eXBlJiYodFtlLm5hbWVdPSI8dW5kZWZpbmVkPiIpKX1hc3luYyBmdW5jdGlvbiBsKGUsdCl7Y29uc3Qgbj1hd2FpdCBlLnBvc3QoIlJ1bnRpbWUuZ2V0UHJvcGVydGllcyIse29iamVjdElkOnQsb3duUHJvcGVydGllczohMH0pLGk9e307Zm9yKGNvbnN0IHQgb2Ygbi5yZXN1bHQpaWYodC52YWx1ZT8ub2JqZWN0SWQmJiJBcnJheSI9PT10LnZhbHVlLmNsYXNzTmFtZSl7Y29uc3Qgbj10LnZhbHVlLm9iamVjdElkO2F3YWl0IGMoZSxuLHQubmFtZSxpKX1lbHNlIGlmKHQudmFsdWU/Lm9iamVjdElkJiYiT2JqZWN0Ij09PXQudmFsdWUuY2xhc3NOYW1lKXtjb25zdCBuPXQudmFsdWUub2JqZWN0SWQ7YXdhaXQgcihlLG4sdC5uYW1lLGkpfWVsc2UgdC52YWx1ZSYmdSh0LGkpO3JldHVybiBpfWxldCBmOyhhc3luYyBmdW5jdGlvbigpe2NvbnN0IHQ9bmV3IGU7dC5jb25uZWN0VG9NYWluVGhyZWFkKCkscygiQ29ubmVjdGVkIHRvIG1haW4gdGhyZWFkIik7bGV0IG49ITE7dC5vbigiRGVidWdnZXIucmVzdW1lZCIsKCk9PntuPSExfSksdC5vbigiRGVidWdnZXIucGF1c2VkIixlPT57bj0hMCxhc3luYyBmdW5jdGlvbihlLHtyZWFzb246dCxkYXRhOntvYmplY3RJZDpufSxjYWxsRnJhbWVzOml9KXtpZigiZXhjZXB0aW9uIiE9PXQmJiJwcm9taXNlUmVqZWN0aW9uIiE9PXQpcmV0dXJuO2lmKGY/LigpLG51bGw9PW4pcmV0dXJuO2NvbnN0IGE9W107Zm9yKGxldCB0PTA7dDxpLmxlbmd0aDt0Kyspe2NvbnN0e3Njb3BlQ2hhaW46bixmdW5jdGlvbk5hbWU6byx0aGlzOnN9PWlbdF0sYz1uLmZpbmQoZT0+ImxvY2FsIj09PWUudHlwZSkscj0iZ2xvYmFsIiE9PXMuY2xhc3NOYW1lJiZzLmNsYXNzTmFtZT9gJHtzLmNsYXNzTmFtZX0uJHtvfWA6bztpZih2b2lkIDA9PT1jPy5vYmplY3Qub2JqZWN0SWQpYVt0XT17ZnVuY3Rpb246cn07ZWxzZXtjb25zdCBuPWF3YWl0IGwoZSxjLm9iamVjdC5vYmplY3RJZCk7YVt0XT17ZnVuY3Rpb246cix2YXJzOm59fX1hd2FpdCBlLnBvc3QoIlJ1bnRpbWUuY2FsbEZ1bmN0aW9uT24iLHtmdW5jdGlvbkRlY2xhcmF0aW9uOmBmdW5jdGlvbigpIHsgdGhpcy4ke299ID0gdGhpcy4ke299IHx8ICR7SlNPTi5zdHJpbmdpZnkoYSl9OyB9YCxzaWxlbnQ6ITAsb2JqZWN0SWQ6bn0pLGF3YWl0IGUucG9zdCgiUnVudGltZS5yZWxlYXNlT2JqZWN0Iix7b2JqZWN0SWQ6bn0pfSh0LGUucGFyYW1zKS50aGVuKGFzeW5jKCk9PntuJiZhd2FpdCB0LnBvc3QoIkRlYnVnZ2VyLnJlc3VtZSIpfSxhc3luYyBlPT57biYmYXdhaXQgdC5wb3N0KCJEZWJ1Z2dlci5yZXN1bWUiKX0pfSksYXdhaXQgdC5wb3N0KCJEZWJ1Z2dlci5lbmFibGUiKTtjb25zdCBpPSExIT09YS5jYXB0dXJlQWxsRXhjZXB0aW9ucztpZihhd2FpdCB0LnBvc3QoIkRlYnVnZ2VyLnNldFBhdXNlT25FeGNlcHRpb25zIix7c3RhdGU6aT8iYWxsIjoidW5jYXVnaHQifSksaSl7Y29uc3QgZT1hLm1heEV4Y2VwdGlvbnNQZXJTZWNvbmR8fDUwO2Y9ZnVuY3Rpb24oZSx0LG4pe2xldCBpPTAsbz01LGE9MDtyZXR1cm4gc2V0SW50ZXJ2YWwoKCk9PnswPT09YT9pPmUmJihvKj0yLG4obyksbz44NjQwMCYmKG89ODY0MDApLGE9byk6KGEtPTEsMD09PWEmJnQoKSksaT0wfSwxZTMpLnVucmVmKCksKCk9PntpKz0xfX0oZSxhc3luYygpPT57cygiUmF0ZS1saW1pdCBsaWZ0ZWQuIiksYXdhaXQgdC5wb3N0KCJEZWJ1Z2dlci5zZXRQYXVzZU9uRXhjZXB0aW9ucyIse3N0YXRlOiJhbGwifSl9LGFzeW5jIGU9PntzKGBSYXRlLWxpbWl0IGV4Y2VlZGVkLiBEaXNhYmxpbmcgY2FwdHVyaW5nIG9mIGNhdWdodCBleGNlcHRpb25zIGZvciAke2V9IHNlY29uZHMuYCksYXdhaXQgdC5wb3N0KCJEZWJ1Z2dlci5zZXRQYXVzZU9uRXhjZXB0aW9ucyIse3N0YXRlOiJ1bmNhdWdodCJ9KX0pfX0pKCkuY2F0Y2goZT0+e3MoIkZhaWxlZCB0byBzdGFydCBkZWJ1Z2dlciIsZSl9KSxzZXRJbnRlcnZhbCgoKT0+e30sMWU0KTs=";
	function log(...args) {
		core.debug.log("[LocalVariables]", ...args);
	}
	const localVariablesAsyncIntegration = core.defineIntegration(((integrationOptions = {}) => {
		function addLocalVariablesToException(exception, localVariables) {
			const frames = (exception.stacktrace?.frames || []).filter((frame) => frame.function !== "new Promise");
			for (let i = 0; i < frames.length; i++) {
				const frameIndex = frames.length - i - 1;
				const frameLocalVariables = localVariables[i];
				const frame = frames[frameIndex];
				if (!frame || !frameLocalVariables) break;
				if (frameLocalVariables.vars === void 0 || frame.in_app === false && integrationOptions.includeOutOfAppFrames !== true || !common.functionNamesMatch(frame.function, frameLocalVariables.function)) continue;
				frame.vars = frameLocalVariables.vars;
			}
		}
		function addLocalVariablesToEvent(event, hint) {
			if (hint.originalException && typeof hint.originalException === "object" && common.LOCAL_VARIABLES_KEY in hint.originalException && Array.isArray(hint.originalException[common.LOCAL_VARIABLES_KEY])) {
				for (const exception of event.exception?.values || []) addLocalVariablesToException(exception, hint.originalException[common.LOCAL_VARIABLES_KEY]);
				hint.originalException[common.LOCAL_VARIABLES_KEY] = void 0;
			}
			return event;
		}
		async function startInspector() {
			const inspector = await import("node:inspector");
			if (!inspector.url()) inspector.open(0);
		}
		function startWorker(options) {
			const worker = new node_worker_threads$1.Worker(new URL(`data:application/javascript;base64,${base64WorkerScript}`), {
				workerData: options,
				execArgv: [],
				env: {
					...process.env,
					NODE_OPTIONS: void 0
				}
			});
			process.on("exit", () => {
				worker.terminate();
			});
			worker.once("error", (err) => {
				log("Worker error", err);
			});
			worker.once("exit", (code) => {
				log("Worker exit", code);
			});
			worker.unref();
		}
		return {
			name: "LocalVariablesAsync",
			async setup(client) {
				if (!client.getOptions().includeLocalVariables) return;
				if (await debug.isDebuggerEnabled()) {
					core.debug.warn("Local variables capture has been disabled because the debugger was already enabled");
					return;
				}
				const options = {
					...integrationOptions,
					debug: core.debug.isEnabled()
				};
				startInspector().then(() => {
					try {
						startWorker(options);
					} catch (e) {
						core.debug.error("Failed to start worker", e);
					}
				}, (e) => {
					core.debug.error("Failed to start inspector", e);
				});
			},
			processEvent(event, hint) {
				return addLocalVariablesToEvent(event, hint);
			}
		};
	}));
	exports.base64WorkerScript = base64WorkerScript;
	exports.localVariablesAsyncIntegration = localVariablesAsyncIntegration;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/integrations/local-variables/local-variables-sync.js
var require_local_variables_sync = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const nodeVersion = require_nodeVersion();
	const debug = require_debug();
	const common = require_common$1();
	function hashFrames(frames) {
		if (frames === void 0) return;
		return frames.slice(-10).reduce((acc, frame) => `${acc},${frame.function},${frame.lineno},${frame.colno}`, "");
	}
	function hashFromStack(stackParser, stack) {
		if (stack === void 0) return;
		return hashFrames(stackParser(stack, 1));
	}
	function createCallbackList(complete) {
		let callbacks = [];
		let completedCalled = false;
		function checkedComplete(result) {
			callbacks = [];
			if (completedCalled) return;
			completedCalled = true;
			complete(result);
		}
		callbacks.push(checkedComplete);
		function add(fn) {
			callbacks.push(fn);
		}
		function next(result) {
			const popped = callbacks.pop() || checkedComplete;
			try {
				popped(result);
			} catch {
				checkedComplete(result);
			}
		}
		return {
			add,
			next
		};
	}
	var AsyncSession = class AsyncSession {
		/** Throws if inspector API is not available */
		constructor(_session) {
			this._session = _session;
		}
		static async create(orDefault) {
			if (orDefault) return orDefault;
			return new AsyncSession(new (await (import("node:inspector"))).Session());
		}
		/** @inheritdoc */
		configureAndConnect(onPause, captureAll) {
			this._session.connect();
			this._session.on("Debugger.paused", (event) => {
				onPause(event, () => {
					this._session.post("Debugger.resume");
				});
			});
			this._session.post("Debugger.enable");
			this._session.post("Debugger.setPauseOnExceptions", { state: captureAll ? "all" : "uncaught" });
		}
		setPauseOnExceptions(captureAll) {
			this._session.post("Debugger.setPauseOnExceptions", { state: captureAll ? "all" : "uncaught" });
		}
		/** @inheritdoc */
		getLocalVariables(objectId, complete) {
			this._getProperties(objectId, (props) => {
				const { add, next } = createCallbackList(complete);
				for (const prop of props) if (prop.value?.objectId && prop.value.className === "Array") {
					const id = prop.value.objectId;
					add((vars) => this._unrollArray(id, prop.name, vars, next));
				} else if (prop.value?.objectId && prop.value.className === "Object") {
					const id = prop.value.objectId;
					add((vars) => this._unrollObject(id, prop.name, vars, next));
				} else if (prop.value) add((vars) => this._unrollOther(prop, vars, next));
				next({});
			});
		}
		/**
		* Gets all the PropertyDescriptors of an object
		*/
		_getProperties(objectId, next) {
			this._session.post("Runtime.getProperties", {
				objectId,
				ownProperties: true
			}, (err, params) => {
				if (err) next([]);
				else next(params.result);
			});
		}
		/**
		* Unrolls an array property
		*/
		_unrollArray(objectId, name, vars, next) {
			this._getProperties(objectId, (props) => {
				vars[name] = props.filter((v) => v.name !== "length" && !isNaN(parseInt(v.name, 10))).sort((a, b) => parseInt(a.name, 10) - parseInt(b.name, 10)).map((v) => v.value?.value);
				next(vars);
			});
		}
		/**
		* Unrolls an object property
		*/
		_unrollObject(objectId, name, vars, next) {
			this._getProperties(objectId, (props) => {
				vars[name] = props.map((v) => [v.name, v.value?.value]).reduce((obj, [key, val]) => {
					obj[key] = val;
					return obj;
				}, {});
				next(vars);
			});
		}
		/**
		* Unrolls other properties
		*/
		_unrollOther(prop, vars, next) {
			if (prop.value) {
				if ("value" in prop.value) if (prop.value.value === void 0 || prop.value.value === null) vars[prop.name] = `<${prop.value.value}>`;
				else vars[prop.name] = prop.value.value;
				else if ("description" in prop.value && prop.value.type !== "function") vars[prop.name] = `<${prop.value.description}>`;
				else if (prop.value.type === "undefined") vars[prop.name] = "<undefined>";
			}
			next(vars);
		}
	};
	const INTEGRATION_NAME = "LocalVariables";
	const _localVariablesSyncIntegration = ((options = {}, sessionOverride) => {
		const cachedFrames = new core.LRUMap(20);
		let rateLimiter;
		let shouldProcessEvent = false;
		function addLocalVariablesToException(exception) {
			const hash = hashFrames(exception.stacktrace?.frames);
			if (hash === void 0) return;
			const cachedFrame = cachedFrames.remove(hash);
			if (cachedFrame === void 0) return;
			const frames = (exception.stacktrace?.frames || []).filter((frame) => frame.function !== "new Promise");
			for (let i = 0; i < frames.length; i++) {
				const frameIndex = frames.length - i - 1;
				const cachedFrameVariable = cachedFrame[i];
				const frameVariable = frames[frameIndex];
				if (!frameVariable || !cachedFrameVariable) break;
				if (cachedFrameVariable.vars === void 0 || frameVariable.in_app === false && options.includeOutOfAppFrames !== true || !common.functionNamesMatch(frameVariable.function, cachedFrameVariable.function)) continue;
				frameVariable.vars = cachedFrameVariable.vars;
			}
		}
		function addLocalVariablesToEvent(event) {
			for (const exception of event.exception?.values || []) addLocalVariablesToException(exception);
			return event;
		}
		let setupPromise;
		async function setup() {
			const clientOptions = core.getClient()?.getOptions();
			if (!clientOptions?.includeLocalVariables) return;
			if (nodeVersion.NODE_MAJOR < 18) {
				core.debug.log("The `LocalVariables` integration is only supported on Node >= v18.");
				return;
			}
			if (await debug.isDebuggerEnabled()) {
				core.debug.warn("Local variables capture has been disabled because the debugger was already enabled");
				return;
			}
			try {
				const session = await AsyncSession.create(sessionOverride);
				const handlePaused = (stackParser, { params: { reason, data, callFrames } }, complete) => {
					if (reason !== "exception" && reason !== "promiseRejection") {
						complete();
						return;
					}
					rateLimiter?.();
					const exceptionHash = hashFromStack(stackParser, data.description);
					if (exceptionHash == void 0) {
						complete();
						return;
					}
					const { add, next } = createCallbackList((frames) => {
						cachedFrames.set(exceptionHash, frames);
						complete();
					});
					for (let i = 0; i < Math.min(callFrames.length, 5); i++) {
						const { scopeChain, functionName, this: obj } = callFrames[i];
						const localScope = scopeChain.find((scope) => scope.type === "local");
						const fn = obj.className === "global" || !obj.className ? functionName : `${obj.className}.${functionName}`;
						if (localScope?.object.objectId === void 0) add((frames) => {
							frames[i] = { function: fn };
							next(frames);
						});
						else {
							const id = localScope.object.objectId;
							add((frames) => session.getLocalVariables(id, (vars) => {
								frames[i] = {
									function: fn,
									vars
								};
								next(frames);
							}));
						}
					}
					next([]);
				};
				const captureAll = options.captureAllExceptions !== false;
				session.configureAndConnect((ev, complete) => handlePaused(clientOptions.stackParser, ev, complete), captureAll);
				if (captureAll) {
					const max = options.maxExceptionsPerSecond || 50;
					rateLimiter = common.createRateLimiter(max, () => {
						core.debug.log("Local variables rate-limit lifted.");
						session.setPauseOnExceptions(true);
					}, (seconds) => {
						core.debug.log(`Local variables rate-limit exceeded. Disabling capturing of caught exceptions for ${seconds} seconds.`);
						session.setPauseOnExceptions(false);
					});
				}
				shouldProcessEvent = true;
			} catch (error) {
				core.debug.log("The `LocalVariables` integration failed to start.", error);
			}
		}
		return {
			name: INTEGRATION_NAME,
			setupOnce() {
				setupPromise = setup();
			},
			async processEvent(event) {
				await setupPromise;
				if (shouldProcessEvent) return addLocalVariablesToEvent(event);
				return event;
			},
			_getCachedFramesCount() {
				return cachedFrames.size;
			},
			_getFirstCachedFrame() {
				return cachedFrames.values()[0];
			}
		};
	});
	const localVariablesSyncIntegration = core.defineIntegration(_localVariablesSyncIntegration);
	exports.createCallbackList = createCallbackList;
	exports.hashFrames = hashFrames;
	exports.hashFromStack = hashFromStack;
	exports.localVariablesSyncIntegration = localVariablesSyncIntegration;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/integrations/local-variables/index.js
var require_local_variables = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const nodeVersion = require_nodeVersion();
	const localVariablesAsync = require_local_variables_async();
	const localVariablesSync = require_local_variables_sync();
	const localVariablesIntegration = (options = {}) => {
		return nodeVersion.NODE_VERSION.major < 19 ? localVariablesSync.localVariablesSyncIntegration(options) : localVariablesAsync.localVariablesAsyncIntegration(options);
	};
	exports.localVariablesIntegration = localVariablesIntegration;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/integrations/modules.js
var require_modules = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const node_fs = __require("node:fs");
	const node_path$1 = __require("node:path");
	const core = require_cjs$4();
	require_nodeVersion();
	let moduleCache;
	const INTEGRATION_NAME = "Modules";
	function getServerModules() {
		if (typeof __SENTRY_SERVER_MODULES__ !== "undefined") return __SENTRY_SERVER_MODULES__;
		return core.GLOBAL_OBJ.__SENTRY_SERVER_MODULES__ ?? {};
	}
	const _modulesIntegration = (() => {
		return {
			name: INTEGRATION_NAME,
			processEvent(event) {
				event.modules = {
					...event.modules,
					..._getModules()
				};
				return event;
			},
			getModules: _getModules
		};
	});
	const modulesIntegration = _modulesIntegration;
	function getRequireCachePaths() {
		try {
			return __require.cache ? Object.keys(__require.cache) : [];
		} catch {
			return [];
		}
	}
	function collectModules() {
		return {
			...getServerModules(),
			...getModulesFromPackageJson(),
			...collectRequireModules()
		};
	}
	function collectRequireModules() {
		const mainPaths = __require.main?.paths || [];
		const paths = getRequireCachePaths();
		const infos = {};
		const seen = /* @__PURE__ */ new Set();
		paths.forEach((path) => {
			let dir = path;
			const updir = () => {
				const orig = dir;
				dir = node_path$1.dirname(orig);
				if (!dir || orig === dir || seen.has(orig)) return;
				if (mainPaths.indexOf(dir) < 0) return updir();
				const pkgfile = node_path$1.join(orig, "package.json");
				seen.add(orig);
				if (!node_fs.existsSync(pkgfile)) return updir();
				try {
					const info = JSON.parse(node_fs.readFileSync(pkgfile, "utf8"));
					infos[info.name] = info.version;
				} catch {}
			};
			updir();
		});
		return infos;
	}
	function _getModules() {
		if (!moduleCache) moduleCache = collectModules();
		return moduleCache;
	}
	function getPackageJson() {
		try {
			const filePath = node_path$1.join(process.cwd(), "package.json");
			return JSON.parse(node_fs.readFileSync(filePath, "utf8"));
		} catch {
			return {};
		}
	}
	function getModulesFromPackageJson() {
		const packageJson = getPackageJson();
		return {
			...packageJson.dependencies,
			...packageJson.devDependencies
		};
	}
	exports.modulesIntegration = modulesIntegration;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/utils/errorhandling.js
var require_errorhandling = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const debugBuild = require_debug_build$3();
	const DEFAULT_SHUTDOWN_TIMEOUT = 2e3;
	function logAndExitProcess(error) {
		core.consoleSandbox(() => {
			console.error(error);
		});
		const client = core.getClient();
		if (client === void 0) {
			debugBuild.DEBUG_BUILD && core.debug.warn("No NodeClient was defined, we are exiting the process now.");
			global.process.exit(1);
			return;
		}
		const options = client.getOptions();
		const timeout = options?.shutdownTimeout && options.shutdownTimeout > 0 ? options.shutdownTimeout : DEFAULT_SHUTDOWN_TIMEOUT;
		client.close(timeout).then((result) => {
			if (!result) debugBuild.DEBUG_BUILD && core.debug.warn("We reached the timeout for emptying the request buffer, still exiting now!");
			global.process.exit(1);
		}, (error2) => {
			debugBuild.DEBUG_BUILD && core.debug.error(error2);
		});
	}
	exports.logAndExitProcess = logAndExitProcess;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/integrations/onuncaughtexception.js
var require_onuncaughtexception = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const worker_threads$1 = __require("worker_threads");
	const debugBuild = require_debug_build$3();
	const errorhandling = require_errorhandling();
	const INTEGRATION_NAME = "OnUncaughtException";
	const onUncaughtExceptionIntegration = core.defineIntegration((options = {}) => {
		const optionsWithDefaults = {
			exitEvenIfOtherHandlersAreRegistered: false,
			...options
		};
		return {
			name: INTEGRATION_NAME,
			setup(client) {
				if (!worker_threads$1.isMainThread) return;
				global.process.on("uncaughtException", makeErrorHandler(client, optionsWithDefaults));
			}
		};
	});
	function makeErrorHandler(client, options) {
		const timeout = 2e3;
		let caughtFirstError = false;
		let caughtSecondError = false;
		let calledFatalError = false;
		let firstError;
		const clientOptions = client.getOptions();
		return Object.assign((error) => {
			let onFatalError = errorhandling.logAndExitProcess;
			if (options.onFatalError) onFatalError = options.onFatalError;
			else if (clientOptions.onFatalError) onFatalError = clientOptions.onFatalError;
			const processWouldExit = global.process.listeners("uncaughtException").filter((listener) => {
				return listener.name !== "domainUncaughtExceptionClear" && listener._errorHandler !== true;
			}).length === 0;
			const shouldApplyFatalHandlingLogic = options.exitEvenIfOtherHandlersAreRegistered || processWouldExit;
			if (!caughtFirstError) {
				firstError = error;
				caughtFirstError = true;
				if (core.getClient() === client) core.captureException(error, {
					originalException: error,
					captureContext: { level: "fatal" },
					mechanism: {
						handled: false,
						type: "auto.node.onuncaughtexception"
					}
				});
				if (!calledFatalError && shouldApplyFatalHandlingLogic) {
					calledFatalError = true;
					onFatalError(error);
				}
			} else if (shouldApplyFatalHandlingLogic) {
				if (calledFatalError) {
					debugBuild.DEBUG_BUILD && core.debug.warn("uncaught exception after calling fatal error shutdown callback - this is bad! forcing shutdown");
					errorhandling.logAndExitProcess(error);
				} else if (!caughtSecondError) {
					caughtSecondError = true;
					setTimeout(() => {
						if (!calledFatalError) {
							calledFatalError = true;
							onFatalError(firstError, error);
						}
					}, timeout);
				}
			}
		}, { _errorHandler: true });
	}
	exports.makeErrorHandler = makeErrorHandler;
	exports.onUncaughtExceptionIntegration = onUncaughtExceptionIntegration;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/integrations/onunhandledrejection.js
var require_onunhandledrejection = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const errorhandling = require_errorhandling();
	const INTEGRATION_NAME = "OnUnhandledRejection";
	const DEFAULT_IGNORES = [{ name: "AI_NoOutputGeneratedError" }, { name: "AbortError" }];
	const _onUnhandledRejectionIntegration = ((options = {}) => {
		const opts = {
			mode: options.mode ?? "warn",
			ignore: [...DEFAULT_IGNORES, ...options.ignore ?? []]
		};
		return {
			name: INTEGRATION_NAME,
			setup(client) {
				global.process.on("unhandledRejection", makeUnhandledPromiseHandler(client, opts));
			}
		};
	});
	const onUnhandledRejectionIntegration = core.defineIntegration(_onUnhandledRejectionIntegration);
	function extractErrorInfo(reason) {
		if (typeof reason !== "object" || reason === null) return {
			name: "",
			message: String(reason ?? "")
		};
		const errorLike = reason;
		return {
			name: typeof errorLike.name === "string" ? errorLike.name : "",
			message: typeof errorLike.message === "string" ? errorLike.message : String(reason)
		};
	}
	function isMatchingReason(matcher, errorInfo) {
		const nameMatches = matcher.name === void 0 || core.isMatchingPattern(errorInfo.name, matcher.name, true);
		const messageMatches = matcher.message === void 0 || core.isMatchingPattern(errorInfo.message, matcher.message);
		return nameMatches && messageMatches;
	}
	function matchesIgnore(list, reason) {
		const errorInfo = extractErrorInfo(reason);
		return list.some((matcher) => isMatchingReason(matcher, errorInfo));
	}
	function makeUnhandledPromiseHandler(client, options) {
		return function sendUnhandledPromise(reason, _promise) {
			if (core.getClient() !== client) return;
			if (matchesIgnore(options.ignore ?? [], reason)) return;
			const level = options.mode === "strict" ? "fatal" : "error";
			const activeSpanForError = reason && typeof reason === "object" ? reason._sentry_active_span : void 0;
			(activeSpanForError ? (fn) => core.withActiveSpan(activeSpanForError, fn) : (fn) => fn())(() => {
				core.captureException(reason, {
					originalException: reason,
					captureContext: {
						extra: { unhandledPromiseRejection: true },
						level
					},
					mechanism: {
						handled: false,
						type: "auto.node.onunhandledrejection"
					}
				});
			});
			handleRejection(reason, options.mode);
		};
	}
	function handleRejection(reason, mode) {
		const rejectionWarning = "This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). The promise rejected with the reason:";
		if (mode === "warn") core.consoleSandbox(() => {
			console.warn(rejectionWarning);
			console.error(reason && typeof reason === "object" && "stack" in reason ? reason.stack : reason);
		});
		else if (mode === "strict") {
			core.consoleSandbox(() => {
				console.warn(rejectionWarning);
			});
			errorhandling.logAndExitProcess(reason);
		}
	}
	exports.makeUnhandledPromiseHandler = makeUnhandledPromiseHandler;
	exports.onUnhandledRejectionIntegration = onUnhandledRejectionIntegration;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/integrations/processSession.js
var require_processSession = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const INTEGRATION_NAME = "ProcessSession";
	exports.processSessionIntegration = core.defineIntegration(() => {
		return {
			name: INTEGRATION_NAME,
			setupOnce() {
				core.startSession();
				process.on("beforeExit", () => {
					if (core.getIsolationScope().getSession()?.status !== "ok") core.endSession();
				});
			}
		};
	});
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/integrations/spotlight.js
var require_spotlight$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const http$2 = __require("node:http");
	const core = require_cjs$4();
	const INTEGRATION_NAME = "Spotlight";
	const _spotlightIntegration = ((options = {}) => {
		const _options = { sidecarUrl: options.sidecarUrl || "http://localhost:8969/stream" };
		return {
			name: INTEGRATION_NAME,
			setup(client) {
				try {
					if (process.env.NODE_ENV && process.env.NODE_ENV !== "development") core.debug.warn("[Spotlight] It seems you're not in dev mode. Do you really want to have Spotlight enabled?");
				} catch {}
				connectToSpotlight(client, _options);
			}
		};
	});
	const spotlightIntegration = core.defineIntegration(_spotlightIntegration);
	function connectToSpotlight(client, options) {
		const spotlightUrl = parseSidecarUrl(options.sidecarUrl);
		if (!spotlightUrl) return;
		let failedRequests = 0;
		client.on("beforeEnvelope", (envelope) => {
			if (failedRequests > 3) {
				core.debug.warn("[Spotlight] Disabled Sentry -> Spotlight integration due to too many failed requests");
				return;
			}
			const serializedEnvelope = core.serializeEnvelope(envelope);
			core.suppressTracing(() => {
				const req = http$2.request({
					method: "POST",
					path: spotlightUrl.pathname,
					hostname: spotlightUrl.hostname,
					port: spotlightUrl.port,
					headers: { "Content-Type": "application/x-sentry-envelope" }
				}, (res) => {
					if (res.statusCode && res.statusCode >= 200 && res.statusCode < 400) failedRequests = 0;
					res.on("data", () => {});
					res.on("end", () => {});
					res.setEncoding("utf8");
				});
				req.on("error", () => {
					failedRequests++;
					core.debug.warn("[Spotlight] Failed to send envelope to Spotlight Sidecar");
				});
				req.write(serializedEnvelope);
				req.end();
			});
		});
	}
	function parseSidecarUrl(url) {
		try {
			return new URL(`${url}`);
		} catch {
			core.debug.warn(`[Spotlight] Invalid sidecar URL: ${url}`);
			return;
		}
	}
	exports.INTEGRATION_NAME = INTEGRATION_NAME;
	exports.spotlightIntegration = spotlightIntegration;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/integrations/console.js
var require_console = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const consoleIntegration = core.defineIntegration((options = {}) => {
		return {
			name: "Console",
			setup(client) {
				if (process.env.LAMBDA_TASK_ROOT) core.maybeInstrument("console", instrumentConsoleLambda);
				core.consoleIntegration({
					...options,
					filter: [...options.filter || [], "[DEP0205] DeprecationWarning"]
				}).setup?.(client);
			}
		};
	});
	function instrumentConsoleLambda() {
		const consoleObj = core.GLOBAL_OBJ?.console;
		if (!consoleObj) return;
		core.CONSOLE_LEVELS.forEach((level) => {
			if (level in consoleObj) patchWithDefineProperty(consoleObj, level);
		});
	}
	function patchWithDefineProperty(consoleObj, level) {
		const nativeMethod = consoleObj[level];
		core.originalConsoleMethods[level] = nativeMethod;
		let delegate = nativeMethod;
		let savedDelegate;
		let isExecuting = false;
		const wrapper = function(...args) {
			if (isExecuting) {
				nativeMethod.apply(consoleObj, args);
				return;
			}
			isExecuting = true;
			try {
				core.triggerHandlers("console", {
					args,
					level
				});
				delegate.apply(consoleObj, args);
			} finally {
				isExecuting = false;
			}
		};
		core.markFunctionWrapped(wrapper, nativeMethod);
		const sandboxBypass = nativeMethod.bind(consoleObj);
		core.originalConsoleMethods[level] = sandboxBypass;
		try {
			let current = wrapper;
			Object.defineProperty(consoleObj, level, {
				configurable: true,
				enumerable: true,
				get() {
					return current;
				},
				set(newValue) {
					if (newValue === wrapper) {
						if (savedDelegate !== void 0) {
							delegate = savedDelegate;
							savedDelegate = void 0;
						}
						current = wrapper;
					} else if (newValue === sandboxBypass) {
						savedDelegate = delegate;
						current = sandboxBypass;
					} else if (typeof newValue === "function" && !newValue.__sentry_original__) {
						delegate = newValue;
						current = wrapper;
					} else current = newValue;
				}
			});
		} catch {
			core.fill(consoleObj, level, function(originalConsoleMethod) {
				core.originalConsoleMethods[level] = originalConsoleMethod;
				return function(...args) {
					core.triggerHandlers("console", {
						args,
						level
					});
					core.originalConsoleMethods[level]?.apply(this, args);
				};
			});
		}
	}
	exports.consoleIntegration = consoleIntegration;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/integrations/systemError.js
var require_systemError = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const util$3 = __require("node:util");
	const core = require_cjs$4();
	const INTEGRATION_NAME = "NodeSystemError";
	function isSystemError(error) {
		if (!(error instanceof Error)) return false;
		if (!("errno" in error) || typeof error.errno !== "number") return false;
		if (typeof util$3.getSystemErrorMap !== "function") return false;
		return util$3.getSystemErrorMap().has(error.errno);
	}
	exports.systemErrorIntegration = core.defineIntegration((options = {}) => {
		return {
			name: INTEGRATION_NAME,
			processEvent: (event, hint, client) => {
				if (!isSystemError(hint.originalException)) return event;
				const error = hint.originalException;
				const errorContext = { ...error };
				if (!client.getDataCollectionOptions().userInfo && options.includePaths !== true) {
					delete errorContext.path;
					delete errorContext.dest;
				}
				event.contexts = {
					...event.contexts,
					node_system_error: errorContext
				};
				for (const exception of event.exception?.values || []) if (exception.value) {
					if (error.path && exception.value.includes(error.path)) exception.value = exception.value.replace(`'${error.path}'`, "").trim();
					if (error.dest && exception.value.includes(error.dest)) exception.value = exception.value.replace(`'${error.dest}'`, "").trim();
				}
				return event;
			}
		};
	});
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/proxy/base.js
var require_base = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const http$1 = __require("node:http");
	__require("node:https");
	var _a;
	const INTERNAL = /* @__PURE__ */ Symbol("AgentBaseInternalState");
	var Agent = class extends (_a = http$1.Agent, _a) {
		constructor(opts) {
			super(opts);
			this[INTERNAL] = {};
		}
		/**
		* Determine whether this is an `http` or `https` request.
		*/
		isSecureEndpoint(options) {
			if (options) {
				if (typeof options.secureEndpoint === "boolean") return options.secureEndpoint;
				if (typeof options.protocol === "string") return options.protocol === "https:";
			}
			const { stack } = /* @__PURE__ */ new Error();
			if (typeof stack !== "string") return false;
			return stack.split("\n").some((l) => l.indexOf("(https.js:") !== -1 || l.indexOf("node:https:") !== -1);
		}
		createSocket(req, options, cb) {
			const connectOpts = {
				...options,
				secureEndpoint: this.isSecureEndpoint(options)
			};
			Promise.resolve().then(() => this.connect(req, connectOpts)).then((socket) => {
				if (socket instanceof http$1.Agent) return socket.addRequest(req, connectOpts);
				this[INTERNAL].currentSocket = socket;
				super.createSocket(req, options, cb);
			}, cb);
		}
		createConnection() {
			const socket = this[INTERNAL].currentSocket;
			this[INTERNAL].currentSocket = void 0;
			if (!socket) throw new Error("No socket was returned in the `connect()` function");
			return socket;
		}
		get defaultPort() {
			return this[INTERNAL].defaultPort ?? (this.protocol === "https:" ? 443 : 80);
		}
		set defaultPort(v) {
			if (this[INTERNAL]) this[INTERNAL].defaultPort = v;
		}
		get protocol() {
			return this[INTERNAL].protocol ?? (this.isSecureEndpoint() ? "https:" : "http:");
		}
		set protocol(v) {
			if (this[INTERNAL]) this[INTERNAL].protocol = v;
		}
	};
	exports.Agent = Agent;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/proxy/parse-proxy-response.js
var require_parse_proxy_response = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	function debugLog(...args) {
		core.debug.log("[https-proxy-agent:parse-proxy-response]", ...args);
	}
	function parseProxyResponse(socket) {
		return new Promise((resolve, reject) => {
			let buffersLength = 0;
			const buffers = [];
			function read() {
				const b = socket.read();
				if (b) ondata(b);
				else socket.once("readable", read);
			}
			function cleanup() {
				socket.removeListener("end", onend);
				socket.removeListener("error", onerror);
				socket.removeListener("readable", read);
			}
			function onend() {
				cleanup();
				debugLog("onend");
				reject(/* @__PURE__ */ new Error("Proxy connection ended before receiving CONNECT response"));
			}
			function onerror(err) {
				cleanup();
				debugLog("onerror %o", err);
				reject(err);
			}
			function ondata(b) {
				buffers.push(b);
				buffersLength += b.length;
				const buffered = Buffer.concat(buffers, buffersLength);
				const endOfHeaders = buffered.indexOf("\r\n\r\n");
				if (endOfHeaders === -1) {
					debugLog("have not received end of HTTP headers yet...");
					read();
					return;
				}
				const headerParts = buffered.subarray(0, endOfHeaders).toString("ascii").split("\r\n");
				const firstLine = headerParts.shift();
				if (!firstLine) {
					socket.destroy();
					return reject(/* @__PURE__ */ new Error("No header received from proxy CONNECT response"));
				}
				const firstLineParts = firstLine.split(" ");
				const statusCode = +(firstLineParts[1] || 0);
				const statusText = firstLineParts.slice(2).join(" ");
				const headers = {};
				for (const header of headerParts) {
					if (!header) continue;
					const firstColon = header.indexOf(":");
					if (firstColon === -1) {
						socket.destroy();
						return reject(/* @__PURE__ */ new Error(`Invalid header from proxy CONNECT response: "${header}"`));
					}
					const key = header.slice(0, firstColon).toLowerCase();
					const value = header.slice(firstColon + 1).trimStart();
					const current = headers[key];
					if (typeof current === "string") headers[key] = [current, value];
					else if (Array.isArray(current)) current.push(value);
					else headers[key] = value;
				}
				debugLog("got proxy server response: %o %o", firstLine, headers);
				cleanup();
				resolve({
					connect: {
						statusCode,
						statusText,
						headers
					},
					buffered
				});
			}
			socket.on("error", onerror);
			socket.on("end", onend);
			read();
		});
	}
	exports.parseProxyResponse = parseProxyResponse;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/proxy/index.js
var require_proxy = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const net$1 = __require("node:net");
	const tls = __require("node:tls");
	const core = require_cjs$4();
	const base = require_base();
	const parseProxyResponse = require_parse_proxy_response();
	function debugLog(...args) {
		core.debug.log("[https-proxy-agent]", ...args);
	}
	var HttpsProxyAgent = class extends base.Agent {
		constructor(proxy, opts) {
			super(opts);
			this.options = {};
			this.proxy = typeof proxy === "string" ? new URL(proxy) : proxy;
			this.proxyHeaders = opts?.headers ?? {};
			debugLog("Creating new HttpsProxyAgent instance: %o", this.proxy.href);
			const host = (this.proxy.hostname || this.proxy.host).replace(/^\[|\]$/g, "");
			const port = this.proxy.port ? parseInt(this.proxy.port, 10) : this.proxy.protocol === "https:" ? 443 : 80;
			this.connectOpts = {
				ALPNProtocols: ["http/1.1"],
				...opts ? omit(opts, "headers") : null,
				host,
				port
			};
		}
		/**
		* Called when the node-core HTTP client library is creating a
		* new HTTP request.
		*/
		async connect(req, opts) {
			const { proxy } = this;
			if (!opts.host) throw new TypeError("No \"host\" provided");
			let socket;
			if (proxy.protocol === "https:") {
				debugLog("Creating `tls.Socket`: %o", this.connectOpts);
				const servername = this.connectOpts.servername || this.connectOpts.host;
				socket = tls.connect({
					...this.connectOpts,
					servername: servername && net$1.isIP(servername) ? void 0 : servername
				});
			} else {
				debugLog("Creating `net.Socket`: %o", this.connectOpts);
				socket = net$1.connect(this.connectOpts);
			}
			const headers = typeof this.proxyHeaders === "function" ? this.proxyHeaders() : { ...this.proxyHeaders };
			const host = net$1.isIPv6(opts.host) ? `[${opts.host}]` : opts.host;
			let payload = `CONNECT ${host}:${opts.port} HTTP/1.1\r
`;
			if (proxy.username || proxy.password) {
				const auth = `${decodeURIComponent(proxy.username)}:${decodeURIComponent(proxy.password)}`;
				headers["Proxy-Authorization"] = `Basic ${Buffer.from(auth).toString("base64")}`;
			}
			headers.Host = `${host}:${opts.port}`;
			if (!headers["Proxy-Connection"]) headers["Proxy-Connection"] = this.keepAlive ? "Keep-Alive" : "close";
			for (const name of Object.keys(headers)) payload += `${name}: ${headers[name]}\r
`;
			const proxyResponsePromise = parseProxyResponse.parseProxyResponse(socket);
			socket.write(`${payload}\r
`);
			const { connect, buffered } = await proxyResponsePromise;
			req.emit("proxyConnect", connect);
			this.emit("proxyConnect", connect, req);
			if (connect.statusCode === 200) {
				req.once("socket", resume);
				if (opts.secureEndpoint) {
					debugLog("Upgrading socket connection to TLS");
					const servername = opts.servername || opts.host;
					return tls.connect({
						...omit(opts, "host", "path", "port"),
						socket,
						servername: net$1.isIP(servername) ? void 0 : servername
					});
				}
				return socket;
			}
			socket.destroy();
			const fakeSocket = new net$1.Socket({ writable: false });
			fakeSocket.readable = true;
			req.once("socket", (s) => {
				debugLog("Replaying proxy buffer for failed request");
				s.push(buffered);
				s.push(null);
			});
			return fakeSocket;
		}
	};
	HttpsProxyAgent.protocols = ["http", "https"];
	function resume(socket) {
		socket.resume();
	}
	function omit(obj, ...keys) {
		const ret = {};
		let key;
		for (key in obj) if (!keys.includes(key)) ret[key] = obj[key];
		return ret;
	}
	exports.HttpsProxyAgent = HttpsProxyAgent;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/transports/http.js
var require_http$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const http = __require("node:http");
	const https = __require("node:https");
	const node_stream = __require("node:stream");
	const node_zlib = __require("node:zlib");
	const core = require_cjs$4();
	const index = require_proxy();
	const GZIP_THRESHOLD = 1024 * 32;
	function streamFromBody(body) {
		return new node_stream.Readable({ read() {
			this.push(body);
			this.push(null);
		} });
	}
	function makeNodeTransport(options) {
		let urlSegments;
		try {
			urlSegments = new URL(options.url);
		} catch (_e) {
			core.consoleSandbox(() => {
				console.warn("[@sentry/node]: Invalid dsn or tunnel option, will not send any events. The tunnel option must be a full URL when used.");
			});
			return core.createTransport(options, () => Promise.resolve({}));
		}
		const isHttps = urlSegments.protocol === "https:";
		const proxy = applyNoProxyOption(urlSegments, options.proxy || (isHttps ? process.env.https_proxy : void 0) || process.env.http_proxy);
		const nativeHttpModule = isHttps ? https : http;
		const keepAlive = options.keepAlive === void 0 ? false : options.keepAlive;
		const agent = proxy ? new index.HttpsProxyAgent(proxy) : new nativeHttpModule.Agent({
			keepAlive,
			maxSockets: 30,
			timeout: 2e3
		});
		const requestExecutor = createRequestExecutor(options, options.httpModule ?? nativeHttpModule, agent);
		return core.createTransport(options, requestExecutor);
	}
	function applyNoProxyOption(transportUrlSegments, proxy) {
		const { no_proxy } = process.env;
		if (no_proxy?.split(",").some((exemption) => transportUrlSegments.host.endsWith(exemption) || transportUrlSegments.hostname.endsWith(exemption))) return;
		else return proxy;
	}
	function createRequestExecutor(options, httpModule, agent) {
		const { hostname, pathname, port, protocol, search } = new URL(options.url);
		return function makeRequest(request) {
			return new Promise((resolve, reject) => {
				core.suppressTracing(() => {
					let body = streamFromBody(request.body);
					const headers = { ...options.headers };
					if (request.body.length > GZIP_THRESHOLD) {
						headers["content-encoding"] = "gzip";
						body = body.pipe(node_zlib.createGzip());
					}
					const hostnameIsIPv6 = hostname.startsWith("[");
					const req = httpModule.request({
						method: "POST",
						agent,
						headers,
						hostname: hostnameIsIPv6 ? hostname.slice(1, -1) : hostname,
						path: `${pathname}${search}`,
						port,
						protocol,
						ca: options.caCerts
					}, (res) => {
						res.on("data", () => {});
						res.on("end", () => {});
						res.setEncoding("utf8");
						const retryAfterHeader = res.headers["retry-after"] ?? null;
						const rateLimitsHeader = res.headers["x-sentry-rate-limits"] ?? null;
						resolve({
							statusCode: res.statusCode,
							headers: {
								"retry-after": retryAfterHeader,
								"x-sentry-rate-limits": Array.isArray(rateLimitsHeader) ? rateLimitsHeader[0] || null : rateLimitsHeader
							}
						});
					});
					req.on("error", reject);
					body.pipe(req);
				});
			});
		};
	}
	exports.makeNodeTransport = makeNodeTransport;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/utils/spotlight.js
var require_spotlight = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	function getSpotlightConfig(optionsSpotlight) {
		if (optionsSpotlight === false) return false;
		if (typeof optionsSpotlight === "string") return optionsSpotlight;
		const envBool = core.envToBool(process.env.SENTRY_SPOTLIGHT, { strict: true });
		const envUrl = envBool === null && process.env.SENTRY_SPOTLIGHT ? process.env.SENTRY_SPOTLIGHT : void 0;
		return optionsSpotlight === true ? envUrl ?? true : envBool ?? envUrl;
	}
	exports.getSpotlightConfig = getSpotlightConfig;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/utils/module.js
var require_module = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const node_path = __require("node:path");
	const core = require_cjs$4();
	function normalizeWindowsPath(path) {
		return path.replace(/^[A-Z]:/, "").replace(/\\/g, "/");
	}
	function createGetModuleFromFilename(basePath = process.argv[1] ? core.dirname(process.argv[1]) : process.cwd(), isWindows = node_path.sep === "\\") {
		const normalizedBase = isWindows ? normalizeWindowsPath(basePath) : basePath;
		return (filename) => {
			if (!filename) return;
			const normalizedFilename = isWindows ? normalizeWindowsPath(filename) : filename;
			let { dir, base: file, ext } = node_path.posix.parse(normalizedFilename);
			if (ext === ".js" || ext === ".mjs" || ext === ".cjs") file = file.slice(0, ext.length * -1);
			const decodedFile = decodeURIComponent(file);
			if (!dir) dir = ".";
			const n = dir.lastIndexOf("/node_modules");
			if (n > -1) return `${dir.slice(n + 14).replace(/\//g, ".")}:${decodedFile}`;
			if (dir.startsWith(normalizedBase)) {
				const moduleName = dir.slice(normalizedBase.length + 1).replace(/\//g, ".");
				return moduleName ? `${moduleName}:${decodedFile}` : decodedFile;
			}
			return decodedFile;
		};
	}
	exports.createGetModuleFromFilename = createGetModuleFromFilename;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/sdk/api.js
var require_api = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const module$1 = require_module();
	function getSentryRelease(fallback) {
		if (process.env.SENTRY_RELEASE) return process.env.SENTRY_RELEASE;
		if (core.GLOBAL_OBJ.SENTRY_RELEASE?.id) return core.GLOBAL_OBJ.SENTRY_RELEASE.id;
		const possibleReleaseNameOfGitProvider = process.env["GITHUB_SHA"] || process.env["CI_MERGE_REQUEST_SOURCE_BRANCH_SHA"] || process.env["CI_BUILD_REF"] || process.env["CI_COMMIT_SHA"] || process.env["BITBUCKET_COMMIT"];
		const possibleReleaseNameOfCiProvidersWithSpecificEnvVar = process.env["APPVEYOR_PULL_REQUEST_HEAD_COMMIT"] || process.env["APPVEYOR_REPO_COMMIT"] || process.env["CODEBUILD_RESOLVED_SOURCE_VERSION"] || process.env["AWS_COMMIT_ID"] || process.env["BUILD_SOURCEVERSION"] || process.env["GIT_CLONE_COMMIT_HASH"] || process.env["BUDDY_EXECUTION_REVISION"] || process.env["BUILDKITE_COMMIT"] || process.env["CIRCLE_SHA1"] || process.env["CIRRUS_CHANGE_IN_REPO"] || process.env["CF_REVISION"] || process.env["CM_COMMIT"] || process.env["CF_PAGES_COMMIT_SHA"] || process.env["DRONE_COMMIT_SHA"] || process.env["FC_GIT_COMMIT_SHA"] || process.env["HEROKU_TEST_RUN_COMMIT_VERSION"] || process.env["HEROKU_BUILD_COMMIT"] || process.env["HEROKU_SLUG_COMMIT"] || process.env["RAILWAY_GIT_COMMIT_SHA"] || process.env["RENDER_GIT_COMMIT"] || process.env["SEMAPHORE_GIT_SHA"] || process.env["TRAVIS_PULL_REQUEST_SHA"] || process.env["VERCEL_GIT_COMMIT_SHA"] || process.env["VERCEL_GITHUB_COMMIT_SHA"] || process.env["VERCEL_GITLAB_COMMIT_SHA"] || process.env["VERCEL_BITBUCKET_COMMIT_SHA"] || process.env["ZEIT_GITHUB_COMMIT_SHA"] || process.env["ZEIT_GITLAB_COMMIT_SHA"] || process.env["ZEIT_BITBUCKET_COMMIT_SHA"];
		const possibleReleaseNameOfCiProvidersWithGenericEnvVar = process.env["CI_COMMIT_ID"] || process.env["SOURCE_COMMIT"] || process.env["SOURCE_VERSION"] || process.env["GIT_COMMIT"] || process.env["COMMIT_REF"] || process.env["BUILD_VCS_NUMBER"] || process.env["CI_COMMIT_SHA"];
		return possibleReleaseNameOfGitProvider || possibleReleaseNameOfCiProvidersWithSpecificEnvVar || possibleReleaseNameOfCiProvidersWithGenericEnvVar || fallback;
	}
	exports.defaultStackParser = core.createStackParser(core.nodeStackLineParser(module$1.createGetModuleFromFilename()));
	exports.getSentryRelease = getSentryRelease;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/sdk/client.js
var require_client = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const os = __require("node:os");
	const api = require_src();
	const instrumentation = require_src$1();
	const core = require_cjs$4();
	const opentelemetry = require_cjs$3();
	const worker_threads = __require("worker_threads");
	const debugBuild = require_debug_build$3();
	const DEFAULT_CLIENT_REPORT_FLUSH_INTERVAL_MS = 6e4;
	var NodeClient = class extends core.ServerRuntimeClient {
		constructor(options) {
			const serverName = options.includeServerName === false ? void 0 : options.serverName || global.process.env.SENTRY_NAME || os.hostname();
			const clientOptions = {
				...options,
				platform: "node",
				runtime: options.runtime || {
					name: "node",
					version: global.process.version
				},
				serverName
			};
			if (options.openTelemetryInstrumentations) instrumentation.registerInstrumentations({ instrumentations: options.openTelemetryInstrumentations });
			core.applySdkMetadata(clientOptions, "node");
			core.debug.log(`Initializing Sentry: process: ${process.pid}, thread: ${worker_threads.isMainThread ? "main" : `worker-${worker_threads.threadId}`}.`);
			super(clientOptions);
			if (this.getOptions().enableLogs) {
				this._logOnExitFlushListener = () => {
					core._INTERNAL_flushLogsBuffer(this);
				};
				if (serverName) this.on("beforeCaptureLog", (log) => {
					log.attributes = {
						...log.attributes,
						"server.address": serverName
					};
				});
				process.on("beforeExit", this._logOnExitFlushListener);
			}
		}
		/** Get the OTEL tracer. */
		get tracer() {
			if (this._tracer) return this._tracer;
			const name = "@sentry/node";
			const version = core.SDK_VERSION;
			const tracer = api.trace.getTracer(name, version);
			this._tracer = tracer;
			return tracer;
		}
		/** @inheritDoc */
		async flush(timeout) {
			await this.traceProvider?.forceFlush();
			if (this.getOptions().sendClientReports) this._flushOutcomes();
			return super.flush(timeout);
		}
		/** @inheritDoc */
		async close(timeout) {
			if (this._clientReportInterval) clearInterval(this._clientReportInterval);
			if (this._clientReportOnExitFlushListener) process.off("beforeExit", this._clientReportOnExitFlushListener);
			if (this._logOnExitFlushListener) process.off("beforeExit", this._logOnExitFlushListener);
			const allEventsSent = await super.close(timeout);
			if (this.traceProvider) await this.traceProvider.shutdown();
			return allEventsSent;
		}
		/**
		* Will start tracking client reports for this client.
		*
		* NOTICE: This method will create an interval that is periodically called and attach a `process.on('beforeExit')`
		* hook. To clean up these resources, call `.close()` when you no longer intend to use the client. Not doing so will
		* result in a memory leak.
		*/
		startClientReportTracking() {
			const clientOptions = this.getOptions();
			if (clientOptions.sendClientReports) {
				this._clientReportOnExitFlushListener = () => {
					this._flushOutcomes();
				};
				this._clientReportInterval = setInterval(() => {
					debugBuild.DEBUG_BUILD && core.debug.log("Flushing client reports based on interval.");
					this._flushOutcomes();
				}, clientOptions.clientReportFlushInterval ?? DEFAULT_CLIENT_REPORT_FLUSH_INTERVAL_MS).unref();
				process.on("beforeExit", this._clientReportOnExitFlushListener);
			}
		}
		/** @inheritDoc */
		_setupIntegrations() {
			core._INTERNAL_clearAiProviderSkips();
			super._setupIntegrations();
		}
		/** Custom implementation for OTEL, so we can handle scope-span linking. */
		_getTraceInfoFromScope(scope) {
			if (!scope) return [void 0, void 0];
			return opentelemetry.getTraceContextForScope(this, scope);
		}
	};
	exports.NodeClient = NodeClient;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/utils/detection.js
var require_detection = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	require_cjs$4();
	require_nodeVersion();
	function isCjs() {
		return true;
	}
	function supportsEsmLoaderHooks() {
		return false;
	}
	exports.isCjs = isCjs;
	exports.supportsEsmLoaderHooks = supportsEsmLoaderHooks;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/sdk/esmLoader.js
var require_esmLoader = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const importInTheMiddle = __require("import-in-the-middle");
	const moduleModule = __require("module");
	const detection = require_detection();
	var _documentCurrentScript = typeof document !== "undefined" ? document.currentScript : null;
	function initializeEsmLoader() {
		if (!detection.supportsEsmLoaderHooks()) return;
		if (!core.GLOBAL_OBJ._sentryEsmLoaderHookRegistered) {
			core.GLOBAL_OBJ._sentryEsmLoaderHookRegistered = true;
			try {
				const { addHookMessagePort } = importInTheMiddle.createAddHookMessageChannel();
				moduleModule.register("import-in-the-middle/hook.mjs", typeof document === "undefined" ? __require("url").pathToFileURL(__filename).href : _documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === "SCRIPT" && _documentCurrentScript.src || new URL("sdk/esmLoader.js", document.baseURI).href, {
					data: {
						addHookMessagePort,
						include: []
					},
					transferList: [addHookMessagePort]
				});
			} catch (error) {
				core.debug.warn("Failed to register 'import-in-the-middle' hook", error);
			}
		}
	}
	exports.initializeEsmLoader = initializeEsmLoader;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/sdk/index.js
var require_sdk$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const opentelemetry = require_cjs$3();
	const debugBuild = require_debug_build$3();
	const childProcess = require_childProcess();
	const context = require_context();
	const contextlines = require_contextlines();
	const index = require_http$2();
	const index$2 = require_local_variables();
	const modules = require_modules();
	const index$1 = require_node_fetch$1();
	const onuncaughtexception = require_onuncaughtexception();
	const onunhandledrejection = require_onunhandledrejection();
	const processSession = require_processSession();
	const spotlight = require_spotlight$1();
	const console$1 = require_console();
	const systemError = require_systemError();
	const http = require_http$1();
	require_nodeVersion();
	const spotlight$1 = require_spotlight();
	const api = require_api();
	const client = require_client();
	const esmLoader = require_esmLoader();
	function getDefaultIntegrations() {
		return [
			core.inboundFiltersIntegration(),
			core.functionToStringIntegration(),
			core.linkedErrorsIntegration(),
			core.requestDataIntegration(),
			systemError.systemErrorIntegration(),
			core.conversationIdIntegration(),
			console$1.consoleIntegration(),
			index.httpIntegration(),
			index$1.nativeNodeFetchIntegration(),
			onuncaughtexception.onUncaughtExceptionIntegration(),
			onunhandledrejection.onUnhandledRejectionIntegration(),
			contextlines.contextLinesIntegration(),
			index$2.localVariablesIntegration(),
			context.nodeContextIntegration(),
			childProcess.childProcessIntegration(),
			processSession.processSessionIntegration(),
			modules.modulesIntegration()
		];
	}
	function init(options = {}) {
		return _init(options, getDefaultIntegrations);
	}
	function initWithoutDefaultIntegrations(options = {}) {
		return _init(options, () => []);
	}
	function _init(_options = {}, getDefaultIntegrationsImpl) {
		const options = getClientOptions(_options, getDefaultIntegrationsImpl);
		if (options.debug === true) if (debugBuild.DEBUG_BUILD) core.debug.enable();
		else core.consoleSandbox(() => {
			console.warn("[Sentry] Cannot initialize SDK with `debug` option using a non-debug bundle.");
		});
		if (options.registerEsmLoaderHooks !== false) esmLoader.initializeEsmLoader();
		opentelemetry.setOpenTelemetryContextAsyncContextStrategy();
		core.getCurrentScope().update(options.initialScope);
		if (options.spotlight && !options.integrations.some(({ name }) => name === spotlight.INTEGRATION_NAME)) options.integrations.push(spotlight.spotlightIntegration({ sidecarUrl: typeof options.spotlight === "string" ? options.spotlight : void 0 }));
		core.applySdkMetadata(options, "node-core");
		const client$1 = new client.NodeClient(options);
		core.getCurrentScope().setClient(client$1);
		client$1.init();
		core.debug.log(`SDK initialized from CommonJS`);
		client$1.startClientReportTracking();
		updateScopeFromEnvVariables();
		opentelemetry.enhanceDscWithOpenTelemetryRootSpanName(client$1);
		opentelemetry.setupEventContextTrace(client$1);
		if (process.env.VERCEL) process.on("SIGTERM", async () => {
			await client$1.flush(200);
		});
		return client$1;
	}
	function validateOpenTelemetrySetup() {
		if (!debugBuild.DEBUG_BUILD) return;
		const setup = opentelemetry.openTelemetrySetupCheck();
		const required = ["SentryContextManager", "SentryPropagator"];
		if (core.hasSpansEnabled()) required.push("SentrySpanProcessor");
		for (const k of required) if (!setup.includes(k)) core.debug.error(`You have to set up the ${k}. Without this, the OpenTelemetry & Sentry integration will not work properly.`);
		if (!setup.includes("SentrySampler")) core.debug.warn("You have to set up the SentrySampler. Without this, the OpenTelemetry & Sentry integration may still work, but sample rates set for the Sentry SDK will not be respected. If you use a custom sampler, make sure to use `wrapSamplingDecision`.");
	}
	function getClientOptions(options, getDefaultIntegrationsImpl) {
		const release = getRelease(options.release);
		const spotlight = spotlight$1.getSpotlightConfig(options.spotlight);
		const tracesSampleRate = getTracesSampleRate(options.tracesSampleRate);
		const mergedOptions = {
			...options,
			dsn: options.dsn ?? process.env.SENTRY_DSN,
			environment: options.environment ?? process.env.SENTRY_ENVIRONMENT,
			sendClientReports: options.sendClientReports ?? true,
			transport: options.transport ?? http.makeNodeTransport,
			stackParser: core.stackParserFromStackParserOptions(options.stackParser || api.defaultStackParser),
			release,
			tracesSampleRate,
			spotlight,
			debug: core.envToBool(options.debug ?? process.env.SENTRY_DEBUG)
		};
		const integrations = options.integrations;
		const defaultIntegrations = options.defaultIntegrations ?? getDefaultIntegrationsImpl(mergedOptions);
		const resolvedIntegrations = core.getIntegrationsToSetup({
			defaultIntegrations,
			integrations
		});
		if (mergedOptions.traceLifecycle === "stream" && !resolvedIntegrations.some((i) => i.name === "SpanStreaming")) resolvedIntegrations.push(core.spanStreamingIntegration());
		return {
			...mergedOptions,
			integrations: resolvedIntegrations
		};
	}
	function getRelease(release) {
		if (release !== void 0) return release;
		const detectedRelease = api.getSentryRelease();
		if (detectedRelease !== void 0) return detectedRelease;
	}
	function getTracesSampleRate(tracesSampleRate) {
		if (tracesSampleRate !== void 0) return tracesSampleRate;
		const sampleRateFromEnv = process.env.SENTRY_TRACES_SAMPLE_RATE;
		if (!sampleRateFromEnv) return;
		const parsed = parseFloat(sampleRateFromEnv);
		return isFinite(parsed) ? parsed : void 0;
	}
	function updateScopeFromEnvVariables() {
		if (core.envToBool(process.env.SENTRY_USE_ENVIRONMENT) !== false) {
			const sentryTraceEnv = process.env.SENTRY_TRACE;
			const baggageEnv = process.env.SENTRY_BAGGAGE;
			const propagationContext = core.propagationContextFromHeaders(sentryTraceEnv, baggageEnv);
			core.getCurrentScope().setPropagationContext(propagationContext);
		}
	}
	exports.getDefaultIntegrations = getDefaultIntegrations;
	exports.init = init;
	exports.initWithoutDefaultIntegrations = initWithoutDefaultIntegrations;
	exports.validateOpenTelemetrySetup = validateOpenTelemetrySetup;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/sdk/scope.js
var require_scope = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const api = require_src();
	const opentelemetry = require_cjs$3();
	function setIsolationScope(isolationScope) {
		const scopes = opentelemetry.getScopesFromContext(api.context.active());
		if (scopes) scopes.isolationScope = isolationScope;
	}
	exports.setIsolationScope = setIsolationScope;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/utils/createMissingInstrumentationContext.js
var require_createMissingInstrumentationContext = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const detection = require_detection();
	const createMissingInstrumentationContext = (pkg) => ({
		package: pkg,
		"javascript.is_cjs": detection.isCjs()
	});
	exports.createMissingInstrumentationContext = createMissingInstrumentationContext;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/utils/ensureIsWrapped.js
var require_ensureIsWrapped = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const instrumentation = require_src$1();
	const core = require_cjs$4();
	const createMissingInstrumentationContext = require_createMissingInstrumentationContext();
	require_nodeVersion();
	function ensureIsWrapped(maybeWrappedFunction, name) {
		const clientOptions = core.getClient()?.getOptions();
		if (!clientOptions?.disableInstrumentationWarnings && !(instrumentation.isWrapped(maybeWrappedFunction) || typeof core.getOriginalFunction(maybeWrappedFunction) === "function") && core.isEnabled() && core.hasSpansEnabled(clientOptions)) {
			core.consoleSandbox(() => {
				console.warn(`[Sentry] ${name} is not instrumented. This is likely because you required/imported ${name} before calling \`Sentry.init()\`.`);
			});
			core.getGlobalScope().setContext("missing_instrumentation", createMissingInstrumentationContext.createMissingInstrumentationContext(name));
		}
	}
	exports.ensureIsWrapped = ensureIsWrapped;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/integrations/anr/index.js
var require_anr = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const util$2 = __require("node:util");
	const node_worker_threads = __require("node:worker_threads");
	const core = require_cjs$4();
	const nodeVersion = require_nodeVersion();
	const debug = require_debug();
	const { isPromise } = util$2.types;
	const base64WorkerScript = "LyohIEBzZW50cnkvbm9kZS1jb3JlIDEwLjYyLjAgKDFmYzUzOWUpIHwgaHR0cHM6Ly9naXRodWIuY29tL2dldHNlbnRyeS9zZW50cnktamF2YXNjcmlwdCAqLwppbXBvcnR7U2Vzc2lvbiBhcyB0fWZyb20ibm9kZTppbnNwZWN0b3IiO2ltcG9ydHt3b3JrZXJEYXRhIGFzIG4scGFyZW50UG9ydCBhcyBlfWZyb20ibm9kZTp3b3JrZXJfdGhyZWFkcyI7aW1wb3J0e3Bvc2l4IGFzIHIsc2VwIGFzIG99ZnJvbSJub2RlOnBhdGgiO2ltcG9ydCphcyBpIGZyb20ibm9kZTpodHRwIjtpbXBvcnQqYXMgcyBmcm9tIm5vZGU6aHR0cHMiO2ltcG9ydHtSZWFkYWJsZSBhcyBjfWZyb20ibm9kZTpzdHJlYW0iO2ltcG9ydHtjcmVhdGVHemlwIGFzIHV9ZnJvbSJub2RlOnpsaWIiO2ltcG9ydCphcyBhIGZyb20ibm9kZTpuZXQiO2ltcG9ydCphcyBmIGZyb20ibm9kZTp0bHMiO2NvbnN0IGg9InVuZGVmaW5lZCI9PXR5cGVvZiBfX1NFTlRSWV9ERUJVR19ffHxfX1NFTlRSWV9ERUJVR19fLHA9Z2xvYmFsVGhpcyxkPSIxMC42Mi4wIjtmdW5jdGlvbiBsKCl7cmV0dXJuIGcocCkscH1mdW5jdGlvbiBnKHQpe2NvbnN0IG49dC5fX1NFTlRSWV9fPXQuX19TRU5UUllfX3x8e307cmV0dXJuIG4udmVyc2lvbj1uLnZlcnNpb258fGQsbltkXT1uW2RdfHx7fX1mdW5jdGlvbiBtKHQsbixlPXApe2NvbnN0IHI9ZS5fX1NFTlRSWV9fPWUuX19TRU5UUllfX3x8e30sbz1yW2RdPXJbZF18fHt9O3JldHVybiBvW3RdfHwob1t0XT1uKCkpfWNvbnN0IHk9e307ZnVuY3Rpb24gYih0KXtpZighKCJjb25zb2xlImluIHApKXJldHVybiB0KCk7Y29uc3Qgbj1wLmNvbnNvbGUsZT17fSxyPU9iamVjdC5rZXlzKHkpO3IuZm9yRWFjaCh0PT57Y29uc3Qgcj15W3RdO2VbdF09blt0XSxuW3RdPXJ9KTt0cnl7cmV0dXJuIHQoKX1maW5hbGx5e3IuZm9yRWFjaCh0PT57blt0XT1lW3RdfSl9fWZ1bmN0aW9uIHYoKXtyZXR1cm4gUygpLmVuYWJsZWR9ZnVuY3Rpb24gXyh0LC4uLm4pe2gmJnYoKSYmYigoKT0+e3AuY29uc29sZVt0XShgU2VudHJ5IExvZ2dlciBbJHt0fV06YCwuLi5uKX0pfWZ1bmN0aW9uIFMoKXtyZXR1cm4gaD9tKCJsb2dnZXJTZXR0aW5ncyIsKCk9Pih7ZW5hYmxlZDohMX0pKTp7ZW5hYmxlZDohMX19Y29uc3Qgdz17ZW5hYmxlOmZ1bmN0aW9uKCl7UygpLmVuYWJsZWQ9ITB9LGRpc2FibGU6ZnVuY3Rpb24oKXtTKCkuZW5hYmxlZD0hMX0saXNFbmFibGVkOnYsbG9nOmZ1bmN0aW9uKC4uLnQpe18oImxvZyIsLi4udCl9LHdhcm46ZnVuY3Rpb24oLi4udCl7Xygid2FybiIsLi4udCl9LGVycm9yOmZ1bmN0aW9uKC4uLnQpe18oImVycm9yIiwuLi50KX19LCQ9L2NhcHR1cmVNZXNzYWdlfGNhcHR1cmVFeGNlcHRpb24vO2Z1bmN0aW9uIEUodCl7cmV0dXJuIHRbdC5sZW5ndGgtMV18fHt9fWNvbnN0IHg9Ijxhbm9ueW1vdXM+Ijtjb25zdCBOPU9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7ZnVuY3Rpb24gQyh0LG4pe3JldHVybiBOLmNhbGwodCk9PT1gW29iamVjdCAke259XWB9ZnVuY3Rpb24gaih0KXtyZXR1cm4gQm9vbGVhbih0Py50aGVuJiYiZnVuY3Rpb24iPT10eXBlb2YgdC50aGVuKX1mdW5jdGlvbiBSKHQsbil7dHJ5e3JldHVybiB0IGluc3RhbmNlb2Ygbn1jYXRjaHtyZXR1cm4hMX19ZnVuY3Rpb24gQSh0KXtpZihmdW5jdGlvbih0KXtzd2l0Y2goTi5jYWxsKHQpKXtjYXNlIltvYmplY3QgRXJyb3JdIjpjYXNlIltvYmplY3QgRXhjZXB0aW9uXSI6Y2FzZSJbb2JqZWN0IERPTUV4Y2VwdGlvbl0iOmNhc2UiW29iamVjdCBXZWJBc3NlbWJseS5FeGNlcHRpb25dIjpyZXR1cm4hMDtkZWZhdWx0OnJldHVybiBSKHQsRXJyb3IpfX0odCkpcmV0dXJue21lc3NhZ2U6dC5tZXNzYWdlLG5hbWU6dC5uYW1lLHN0YWNrOnQuc3RhY2ssLi4uSSh0KX07aWYobj10LCJ1bmRlZmluZWQiIT10eXBlb2YgRXZlbnQmJlIobixFdmVudCkpe2NvbnN0e3R5cGU6bix0YXJnZXQ6ZSxjdXJyZW50VGFyZ2V0OnIsZGV0YWlsOm99PXQ7cmV0dXJue3R5cGU6bix0YXJnZXQ6ZSxjdXJyZW50VGFyZ2V0OnIsLi4ubz97ZGV0YWlsOm99Ont9LC4uLkkodCl9fXZhciBuO3JldHVybiB0fWZ1bmN0aW9uIEkodCl7cmV0dXJuIm9iamVjdCI9PXR5cGVvZiB0JiZudWxsIT09dD9PYmplY3QuZnJvbUVudHJpZXMoT2JqZWN0LmVudHJpZXModCkpOnt9fWZ1bmN0aW9uIE8odCl7aWYodCl7aWYoIm9iamVjdCI9PXR5cGVvZiB0JiYiZGVyZWYiaW4gdCYmImZ1bmN0aW9uIj09dHlwZW9mIHQuZGVyZWYpdHJ5e3JldHVybiB0LmRlcmVmKCl9Y2F0Y2h7cmV0dXJufXJldHVybiB0fX1jb25zdCBUPSJfc2VudHJ5U3BhbiI7ZnVuY3Rpb24gayh0LG4pe24/ZnVuY3Rpb24odCxuLGUpe3RyeXtPYmplY3QuZGVmaW5lUHJvcGVydHkodCxuLHt2YWx1ZTplLHdyaXRhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMH0pfWNhdGNoe2gmJncubG9nKGBGYWlsZWQgdG8gYWRkIG5vbi1lbnVtZXJhYmxlIHByb3BlcnR5ICIke1N0cmluZyhuKX0iIHRvIG9iamVjdGAsdCl9fSh0LFQsZnVuY3Rpb24odCl7dHJ5e2NvbnN0IG49cC5XZWFrUmVmO2lmKCJmdW5jdGlvbiI9PXR5cGVvZiBuKXJldHVybiBuZXcgbih0KX1jYXRjaHt9cmV0dXJuIHR9KG4pKTpkZWxldGUgdFtUXX1mdW5jdGlvbiBQKHQpe3JldHVybiBPKHRbVF0pfWxldCBEO2Z1bmN0aW9uIFUodCl7aWYodm9pZCAwIT09RClyZXR1cm4gRD9EKHQpOnQoKTtjb25zdCBuPVN5bWJvbC5mb3IoIl9fU0VOVFJZX1NBRkVfUkFORE9NX0lEX1dSQVBQRVJfXyIpLGU9cDtyZXR1cm4gbiBpbiBlJiYiZnVuY3Rpb24iPT10eXBlb2YgZVtuXT8oRD1lW25dLEQodCkpOihEPW51bGwsdCgpKX1mdW5jdGlvbiBCKCl7cmV0dXJuIFUoKCk9Pk1hdGgucmFuZG9tKCkpfWZ1bmN0aW9uIEwoKXtyZXR1cm4gVSgoKT0+RGF0ZS5ub3coKSl9Y29uc3QgTT1TeW1ib2wuZm9yKCJzZW50cnkuc2tpcE5vcm1hbGl6YXRpb24iKSx6PVN5bWJvbC5mb3IoInNlbnRyeS5vdmVycmlkZU5vcm1hbGl6YXRpb25EZXB0aCIpO2Z1bmN0aW9uIEYodCxuPTEwMCxlPTEvMCl7dHJ5e3JldHVybiBHKCIiLHQsbixlKX1jYXRjaCh0KXtyZXR1cm57RVJST1I6YCoqbm9uLXNlcmlhbGl6YWJsZSoqICgke3R9KWB9fX1mdW5jdGlvbiBHKHQsbixlPTEvMCxyPTEvMCxvPWZ1bmN0aW9uKCl7Y29uc3QgdD1uZXcgV2Vha1NldDtmdW5jdGlvbiBuKG4pe3JldHVybiEhdC5oYXMobil8fCh0LmFkZChuKSwhMSl9ZnVuY3Rpb24gZShuKXt0LmRlbGV0ZShuKX1yZXR1cm5bbixlXX0oKSl7Y29uc3RbaSxzXT1vO2lmKG51bGw9PW58fFsiYm9vbGVhbiIsInN0cmluZyJdLmluY2x1ZGVzKHR5cGVvZiBuKXx8Im51bWJlciI9PXR5cGVvZiBuJiZOdW1iZXIuaXNGaW5pdGUobikpcmV0dXJuIG47Y29uc3QgYz1mdW5jdGlvbih0LG4pe3RyeXtpZigidW5kZWZpbmVkIiE9dHlwZW9mIGdsb2JhbCYmbj09PWdsb2JhbClyZXR1cm4iW0dsb2JhbF0iO2lmKCJudW1iZXIiPT10eXBlb2YgbiYmIU51bWJlci5pc0Zpbml0ZShuKSlyZXR1cm5gWyR7bn1dYDtpZigiZnVuY3Rpb24iPT10eXBlb2YgbilyZXR1cm5gW0Z1bmN0aW9uOiAke2Z1bmN0aW9uKHQpe3RyeXtyZXR1cm4gdCYmImZ1bmN0aW9uIj09dHlwZW9mIHQmJnQubmFtZXx8eH1jYXRjaHtyZXR1cm4geH19KG4pfV1gO2lmKCJzeW1ib2wiPT10eXBlb2YgbilyZXR1cm5gWyR7U3RyaW5nKG4pfV1gO2lmKCJiaWdpbnQiPT10eXBlb2YgbilyZXR1cm5gW0JpZ0ludDogJHtTdHJpbmcobil9XWA7Y29uc3QgdD1mdW5jdGlvbih0KXtjb25zdCBuPU9iamVjdC5nZXRQcm90b3R5cGVPZih0KTtyZXR1cm4gbj8uY29uc3RydWN0b3I/bi5jb25zdHJ1Y3Rvci5uYW1lOiJudWxsIHByb3RvdHlwZSJ9KG4pO3JldHVybmBbb2JqZWN0ICR7dH1dYH1jYXRjaCh0KXtyZXR1cm5gKipub24tc2VyaWFsaXphYmxlKiogKCR7dH0pYH19KDAsbik7aWYoIWMuc3RhcnRzV2l0aCgiW29iamVjdCAiKSlyZXR1cm4gYztpZihmdW5jdGlvbih0KXtyZXR1cm4gQm9vbGVhbih0W01dKX0obikpcmV0dXJuIG47Y29uc3QgdT1mdW5jdGlvbih0KXtjb25zdCBuPXRbel07cmV0dXJuIm51bWJlciI9PXR5cGVvZiBuP246dm9pZCAwfShuKSxhPXZvaWQgMCE9PXU/dTplO2lmKDA9PT1hKXJldHVybiBjLnJlcGxhY2UoIm9iamVjdCAiLCIiKTtpZihpKG4pKXJldHVybiJbQ2lyY3VsYXIgfl0iO2NvbnN0IGY9bjtpZihmJiYiZnVuY3Rpb24iPT10eXBlb2YgZi50b0pTT04pdHJ5e3JldHVybiBHKCIiLGYudG9KU09OKCksYS0xLHIsbyl9Y2F0Y2h7fWNvbnN0IGg9QXJyYXkuaXNBcnJheShuKT9bXTp7fTtsZXQgcD0wO2NvbnN0IGQ9QShuKTtmb3IoY29uc3QgdCBpbiBkKXtpZighT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGQsdCkpY29udGludWU7aWYocD49cil7aFt0XT0iW01heFByb3BlcnRpZXMgfl0iO2JyZWFrfWNvbnN0IG49ZFt0XTtoW3RdPUcodCxuLGEtMSxyLG8pLHArK31yZXR1cm4gcyhuKSxofWZ1bmN0aW9uIEoodCxuKXtjb25zdCBlPW4ucmVwbGFjZSgvXFwvZywiLyIpLnJlcGxhY2UoL1t8XFx7fSgpW1xdXiQrKj8uXS9nLCJcXCQmIik7bGV0IHI9dDt0cnl7cj1kZWNvZGVVUkkodCl9Y2F0Y2h7fXJldHVybiByLnJlcGxhY2UoL1xcL2csIi8iKS5yZXBsYWNlKC93ZWJwYWNrOlwvPy9nLCIiKS5yZXBsYWNlKG5ldyBSZWdFeHAoYChmaWxlOi8vKT8vKiR7ZX0vKmAsImlnIiksImFwcDovLy8iKX1mdW5jdGlvbiBXKHQsbj0wKXtyZXR1cm4ic3RyaW5nIiE9dHlwZW9mIHR8fDA9PT1ufHx0Lmxlbmd0aDw9bj90OmAke3Quc2xpY2UoMCxuKX0uLi5gfWxldCBZO2Z1bmN0aW9uIEgodD1mdW5jdGlvbigpe2NvbnN0IHQ9cDtyZXR1cm4gdC5jcnlwdG98fHQubXNDcnlwdG99KCkpe3RyeXtpZih0Py5yYW5kb21VVUlEKXJldHVybiBVKCgpPT50LnJhbmRvbVVVSUQoKSkucmVwbGFjZSgvLS9nLCIiKX1jYXRjaHt9cmV0dXJuIFl8fChZPSIxMDAwMDAwMDEwMDA0MDAwODAwMDEwMDAwMDAwMDAwMCIpLFkucmVwbGFjZSgvWzAxOF0vZyx0PT4odF4oMTYqQigpJjE1KT4+dC80KS50b1N0cmluZygxNikpfWZ1bmN0aW9uIEsoKXtyZXR1cm4gTCgpLzFlM31sZXQgWjtmdW5jdGlvbiBxKCl7cmV0dXJuKFo/PyhaPWZ1bmN0aW9uKCl7Y29uc3R7cGVyZm9ybWFuY2U6dH09cDtpZighdD8ubm93fHwhdC50aW1lT3JpZ2luKXJldHVybiBLO2NvbnN0IG49dC50aW1lT3JpZ2luO3JldHVybigpPT4obitVKCgpPT50Lm5vdygpKSkvMWUzfSgpKSkoKX1mdW5jdGlvbiBWKHQpe2NvbnN0IG49cSgpLGU9e3NpZDpIKCksaW5pdDohMCx0aW1lc3RhbXA6bixzdGFydGVkOm4sZHVyYXRpb246MCxzdGF0dXM6Im9rIixlcnJvcnM6MCxpZ25vcmVEdXJhdGlvbjohMSx0b0pTT046KCk9PmZ1bmN0aW9uKHQpe3JldHVybntzaWQ6YCR7dC5zaWR9YCxpbml0OnQuaW5pdCxzdGFydGVkOm5ldyBEYXRlKDFlMyp0LnN0YXJ0ZWQpLnRvSVNPU3RyaW5nKCksdGltZXN0YW1wOm5ldyBEYXRlKDFlMyp0LnRpbWVzdGFtcCkudG9JU09TdHJpbmcoKSxzdGF0dXM6dC5zdGF0dXMsZXJyb3JzOnQuZXJyb3JzLGRpZDoibnVtYmVyIj09dHlwZW9mIHQuZGlkfHwic3RyaW5nIj09dHlwZW9mIHQuZGlkP2Ake3QuZGlkfWA6dm9pZCAwLGR1cmF0aW9uOnQuZHVyYXRpb24sYWJub3JtYWxfbWVjaGFuaXNtOnQuYWJub3JtYWxfbWVjaGFuaXNtLGF0dHJzOntyZWxlYXNlOnQucmVsZWFzZSxlbnZpcm9ubWVudDp0LmVudmlyb25tZW50LGlwX2FkZHJlc3M6dC5pcEFkZHJlc3MsdXNlcl9hZ2VudDp0LnVzZXJBZ2VudH19fShlKX07cmV0dXJuIHQmJlEoZSx0KSxlfWZ1bmN0aW9uIFEodCxuPXt9KXtpZihuLnVzZXImJighdC5pcEFkZHJlc3MmJm4udXNlci5pcF9hZGRyZXNzJiYodC5pcEFkZHJlc3M9bi51c2VyLmlwX2FkZHJlc3MpLHQuZGlkfHxuLmRpZHx8KHQuZGlkPW4udXNlci5pZHx8bi51c2VyLmVtYWlsfHxuLnVzZXIudXNlcm5hbWUpKSx0LnRpbWVzdGFtcD1uLnRpbWVzdGFtcHx8cSgpLG4uYWJub3JtYWxfbWVjaGFuaXNtJiYodC5hYm5vcm1hbF9tZWNoYW5pc209bi5hYm5vcm1hbF9tZWNoYW5pc20pLG4uaWdub3JlRHVyYXRpb24mJih0Lmlnbm9yZUR1cmF0aW9uPW4uaWdub3JlRHVyYXRpb24pLG4uc2lkJiYodC5zaWQ9MzI9PT1uLnNpZC5sZW5ndGg/bi5zaWQ6SCgpKSx2b2lkIDAhPT1uLmluaXQmJih0LmluaXQ9bi5pbml0KSwhdC5kaWQmJm4uZGlkJiYodC5kaWQ9YCR7bi5kaWR9YCksIm51bWJlciI9PXR5cGVvZiBuLnN0YXJ0ZWQmJih0LnN0YXJ0ZWQ9bi5zdGFydGVkKSx0Lmlnbm9yZUR1cmF0aW9uKXQuZHVyYXRpb249dm9pZCAwO2Vsc2UgaWYoIm51bWJlciI9PXR5cGVvZiBuLmR1cmF0aW9uKXQuZHVyYXRpb249bi5kdXJhdGlvbjtlbHNle2NvbnN0IG49dC50aW1lc3RhbXAtdC5zdGFydGVkO3QuZHVyYXRpb249bj49MD9uOjB9bi5yZWxlYXNlJiYodC5yZWxlYXNlPW4ucmVsZWFzZSksbi5lbnZpcm9ubWVudCYmKHQuZW52aXJvbm1lbnQ9bi5lbnZpcm9ubWVudCksIXQuaXBBZGRyZXNzJiZuLmlwQWRkcmVzcyYmKHQuaXBBZGRyZXNzPW4uaXBBZGRyZXNzKSwhdC51c2VyQWdlbnQmJm4udXNlckFnZW50JiYodC51c2VyQWdlbnQ9bi51c2VyQWdlbnQpLCJudW1iZXIiPT10eXBlb2Ygbi5lcnJvcnMmJih0LmVycm9ycz1uLmVycm9ycyksbi5zdGF0dXMmJih0LnN0YXR1cz1uLnN0YXR1cyl9ZnVuY3Rpb24gWCh0LG4sZT0yKXtpZighbnx8Im9iamVjdCIhPXR5cGVvZiBufHxlPD0wKXJldHVybiBuO2lmKHQmJjA9PT1PYmplY3Qua2V5cyhuKS5sZW5ndGgpcmV0dXJuIHQ7Y29uc3Qgcj17Li4udH07Zm9yKGNvbnN0IHQgaW4gbilPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobix0KSYmKHJbdF09WChyW3RdLG5bdF0sZS0xKSk7cmV0dXJuIHJ9ZnVuY3Rpb24gdHQoKXtyZXR1cm4gSCgpfWZ1bmN0aW9uIG50KCl7cmV0dXJuIEgoKS5zdWJzdHJpbmcoMTYpfWNsYXNzIGV0e2NvbnN0cnVjdG9yKCl7dGhpcy50PSExLHRoaXMubz1bXSx0aGlzLmk9W10sdGhpcy51PVtdLHRoaXMuaD1bXSx0aGlzLnA9e30sdGhpcy5sPXt9LHRoaXMubT17fSx0aGlzLnY9e30sdGhpcy5fPXt9LHRoaXMuUz17fSx0aGlzLk49e3RyYWNlSWQ6dHQoKSxzYW1wbGVSYW5kOkIoKX19Y2xvbmUoKXtjb25zdCB0PW5ldyBldDtyZXR1cm4gdC51PVsuLi50aGlzLnVdLHQubD17Li4udGhpcy5sfSx0Lm09ey4uLnRoaXMubX0sdC52PXsuLi50aGlzLnZ9LHQuXz17Li4udGhpcy5ffSx0aGlzLl8uZmxhZ3MmJih0Ll8uZmxhZ3M9e3ZhbHVlczpbLi4udGhpcy5fLmZsYWdzLnZhbHVlc119KSx0LnA9dGhpcy5wLHQuQz10aGlzLkMsdC5qPXRoaXMuaix0LlI9dGhpcy5SLHQuQT10aGlzLkEsdC5pPVsuLi50aGlzLmldLHQuaD1bLi4udGhpcy5oXSx0LlM9ey4uLnRoaXMuU30sdC5OPXsuLi50aGlzLk59LHQuST10aGlzLkksdC5PPXRoaXMuTyx0LlQ9dGhpcy5ULGsodCxQKHRoaXMpKSx0fXNldENsaWVudCh0KXt0aGlzLkk9dH1zZXRMYXN0RXZlbnRJZCh0KXt0aGlzLk89dH1nZXRDbGllbnQoKXtyZXR1cm4gdGhpcy5JfWxhc3RFdmVudElkKCl7cmV0dXJuIHRoaXMuT31hZGRTY29wZUxpc3RlbmVyKHQpe3RoaXMuby5wdXNoKHQpfWFkZEV2ZW50UHJvY2Vzc29yKHQpe3JldHVybiB0aGlzLmkucHVzaCh0KSx0aGlzfXNldFVzZXIodCl7cmV0dXJuIHRoaXMucD10fHx7ZW1haWw6dm9pZCAwLGlkOnZvaWQgMCxpcF9hZGRyZXNzOnZvaWQgMCx1c2VybmFtZTp2b2lkIDB9LHRoaXMuaiYmUSh0aGlzLmose3VzZXI6dH0pLHRoaXMuaygpLHRoaXN9Z2V0VXNlcigpe3JldHVybiB0aGlzLnB9c2V0Q29udmVyc2F0aW9uSWQodCl7cmV0dXJuIHRoaXMuVD10fHx2b2lkIDAsdGhpcy5rKCksdGhpc31zZXRUYWdzKHQpe3JldHVybiB0aGlzLmw9ey4uLnRoaXMubCwuLi50fSx0aGlzLmsoKSx0aGlzfXNldFRhZyh0LG4pe3JldHVybiB0aGlzLnNldFRhZ3Moe1t0XTpufSl9c2V0QXR0cmlidXRlcyh0KXtyZXR1cm4gdGhpcy5tPXsuLi50aGlzLm0sLi4udH0sdGhpcy5rKCksdGhpc31zZXRBdHRyaWJ1dGUodCxuKXtyZXR1cm4gdGhpcy5zZXRBdHRyaWJ1dGVzKHtbdF06bn0pfXJlbW92ZUF0dHJpYnV0ZSh0KXtyZXR1cm4gdCBpbiB0aGlzLm0mJihkZWxldGUgdGhpcy5tW3RdLHRoaXMuaygpKSx0aGlzfXNldEV4dHJhcyh0KXtyZXR1cm4gdGhpcy52PXsuLi50aGlzLnYsLi4udH0sdGhpcy5rKCksdGhpc31zZXRFeHRyYSh0LG4pe3JldHVybiB0aGlzLnY9ey4uLnRoaXMudixbdF06bn0sdGhpcy5rKCksdGhpc31zZXRGaW5nZXJwcmludCh0KXtyZXR1cm4gdGhpcy5BPXQsdGhpcy5rKCksdGhpc31zZXRMZXZlbCh0KXtyZXR1cm4gdGhpcy5DPXQsdGhpcy5rKCksdGhpc31zZXRUcmFuc2FjdGlvbk5hbWUodCl7cmV0dXJuIHRoaXMuUj10LHRoaXMuaygpLHRoaXN9c2V0Q29udGV4dCh0LG4pe3JldHVybiBudWxsPT09bj9kZWxldGUgdGhpcy5fW3RdOnRoaXMuX1t0XT1uLHRoaXMuaygpLHRoaXN9c2V0U2Vzc2lvbih0KXtyZXR1cm4gdD90aGlzLmo9dDpkZWxldGUgdGhpcy5qLHRoaXMuaygpLHRoaXN9Z2V0U2Vzc2lvbigpe3JldHVybiB0aGlzLmp9dXBkYXRlKHQpe2lmKCF0KXJldHVybiB0aGlzO2NvbnN0IG49ImZ1bmN0aW9uIj09dHlwZW9mIHQ/dCh0aGlzKTp0LGU9biBpbnN0YW5jZW9mIGV0P24uZ2V0U2NvcGVEYXRhKCk6QyhuLCJPYmplY3QiKT90OnZvaWQgMDtjb25zdHt0YWdzOnIsYXR0cmlidXRlczpvLGV4dHJhOmksdXNlcjpzLGNvbnRleHRzOmMsbGV2ZWw6dSxmaW5nZXJwcmludDphPVtdLHByb3BhZ2F0aW9uQ29udGV4dDpmLGNvbnZlcnNhdGlvbklkOmh9PWV8fHt9O3JldHVybiB0aGlzLmw9ey4uLnRoaXMubCwuLi5yfSx0aGlzLm09ey4uLnRoaXMubSwuLi5vfSx0aGlzLnY9ey4uLnRoaXMudiwuLi5pfSx0aGlzLl89ey4uLnRoaXMuXywuLi5jfSxzJiZPYmplY3Qua2V5cyhzKS5sZW5ndGgmJih0aGlzLnA9cyksdSYmKHRoaXMuQz11KSxhLmxlbmd0aCYmKHRoaXMuQT1hKSxmJiYodGhpcy5OPWYpLGgmJih0aGlzLlQ9aCksdGhpc31jbGVhcigpe3JldHVybiB0aGlzLnU9W10sdGhpcy5sPXt9LHRoaXMubT17fSx0aGlzLnY9e30sdGhpcy5wPXt9LHRoaXMuXz17fSx0aGlzLkM9dm9pZCAwLHRoaXMuUj12b2lkIDAsdGhpcy5BPXZvaWQgMCx0aGlzLmo9dm9pZCAwLHRoaXMuVD12b2lkIDAsayh0aGlzLHZvaWQgMCksdGhpcy5oPVtdLHRoaXMuc2V0UHJvcGFnYXRpb25Db250ZXh0KHt0cmFjZUlkOnR0KCksc2FtcGxlUmFuZDpCKCl9KSx0aGlzLmsoKSx0aGlzfWFkZEJyZWFkY3J1bWIodCxuKXtjb25zdCBlPSJudW1iZXIiPT10eXBlb2Ygbj9uOjEwMDtpZihlPD0wKXJldHVybiB0aGlzO2NvbnN0IHI9e3RpbWVzdGFtcDpLKCksLi4udCxtZXNzYWdlOnQubWVzc2FnZT9XKHQubWVzc2FnZSwyMDQ4KTp0Lm1lc3NhZ2V9O3JldHVybiB0aGlzLnUucHVzaChyKSx0aGlzLnUubGVuZ3RoPmUmJih0aGlzLnU9dGhpcy51LnNsaWNlKC1lKSx0aGlzLkk/LnJlY29yZERyb3BwZWRFdmVudCgiYnVmZmVyX292ZXJmbG93IiwibG9nX2l0ZW0iKSksdGhpcy5rKCksdGhpc31nZXRMYXN0QnJlYWRjcnVtYigpe3JldHVybiB0aGlzLnVbdGhpcy51Lmxlbmd0aC0xXX1jbGVhckJyZWFkY3J1bWJzKCl7cmV0dXJuIHRoaXMudT1bXSx0aGlzLmsoKSx0aGlzfWFkZEF0dGFjaG1lbnQodCl7cmV0dXJuIHRoaXMuaC5wdXNoKHQpLHRoaXN9Y2xlYXJBdHRhY2htZW50cygpe3JldHVybiB0aGlzLmg9W10sdGhpc31nZXRTY29wZURhdGEoKXtyZXR1cm57YnJlYWRjcnVtYnM6dGhpcy51LGF0dGFjaG1lbnRzOnRoaXMuaCxjb250ZXh0czp0aGlzLl8sdGFnczp0aGlzLmwsYXR0cmlidXRlczp0aGlzLm0sZXh0cmE6dGhpcy52LHVzZXI6dGhpcy5wLGxldmVsOnRoaXMuQyxmaW5nZXJwcmludDp0aGlzLkF8fFtdLGV2ZW50UHJvY2Vzc29yczp0aGlzLmkscHJvcGFnYXRpb25Db250ZXh0OnRoaXMuTixzZGtQcm9jZXNzaW5nTWV0YWRhdGE6dGhpcy5TLHRyYW5zYWN0aW9uTmFtZTp0aGlzLlIsc3BhbjpQKHRoaXMpLGNvbnZlcnNhdGlvbklkOnRoaXMuVH19c2V0U0RLUHJvY2Vzc2luZ01ldGFkYXRhKHQpe3JldHVybiB0aGlzLlM9WCh0aGlzLlMsdCwyKSx0aGlzfXNldFByb3BhZ2F0aW9uQ29udGV4dCh0KXtyZXR1cm4gdGhpcy5OPXQsdGhpc31nZXRQcm9wYWdhdGlvbkNvbnRleHQoKXtyZXR1cm4gdGhpcy5OfWNhcHR1cmVFeGNlcHRpb24odCxuKXtjb25zdCBlPW4/LmV2ZW50X2lkfHxIKCk7aWYoIXRoaXMuSSlyZXR1cm4gaCYmdy53YXJuKCJObyBjbGllbnQgY29uZmlndXJlZCBvbiBzY29wZSAtIHdpbGwgbm90IGNhcHR1cmUgZXhjZXB0aW9uISIpLGU7Y29uc3Qgcj1uZXcgRXJyb3IoIlNlbnRyeSBzeW50aGV0aWNFeGNlcHRpb24iKTtyZXR1cm4gdGhpcy5JLmNhcHR1cmVFeGNlcHRpb24odCx7b3JpZ2luYWxFeGNlcHRpb246dCxzeW50aGV0aWNFeGNlcHRpb246ciwuLi5uLGV2ZW50X2lkOmV9LHRoaXMpLGV9Y2FwdHVyZU1lc3NhZ2UodCxuLGUpe2NvbnN0IHI9ZT8uZXZlbnRfaWR8fEgoKTtpZighdGhpcy5JKXJldHVybiBoJiZ3Lndhcm4oIk5vIGNsaWVudCBjb25maWd1cmVkIG9uIHNjb3BlIC0gd2lsbCBub3QgY2FwdHVyZSBtZXNzYWdlISIpLHI7Y29uc3Qgbz1lPy5zeW50aGV0aWNFeGNlcHRpb24/P25ldyBFcnJvcih0KTtyZXR1cm4gdGhpcy5JLmNhcHR1cmVNZXNzYWdlKHQsbix7b3JpZ2luYWxFeGNlcHRpb246dCxzeW50aGV0aWNFeGNlcHRpb246bywuLi5lLGV2ZW50X2lkOnJ9LHRoaXMpLHJ9Y2FwdHVyZUV2ZW50KHQsbil7Y29uc3QgZT10LmV2ZW50X2lkfHxuPy5ldmVudF9pZHx8SCgpO3JldHVybiB0aGlzLkk/KHRoaXMuSS5jYXB0dXJlRXZlbnQodCx7Li4ubixldmVudF9pZDplfSx0aGlzKSxlKTooaCYmdy53YXJuKCJObyBjbGllbnQgY29uZmlndXJlZCBvbiBzY29wZSAtIHdpbGwgbm90IGNhcHR1cmUgZXZlbnQhIiksZSl9aygpe3RoaXMudHx8KHRoaXMudD0hMCx0aGlzLm8uZm9yRWFjaCh0PT57dCh0aGlzKX0pLHRoaXMudD0hMSl9fWNvbnN0IHJ0PXQ9PnQgaW5zdGFuY2VvZiBQcm9taXNlJiYhdFtvdF0sb3Q9U3ltYm9sKCJjaGFpbmVkIFByb21pc2VMaWtlIiksaXQ9KHQsbik9PntpZighbilyZXR1cm4gdDtsZXQgZT0hMTtmb3IoY29uc3QgciBpbiB0KXtpZihyIGluIG4pY29udGludWU7ZT0hMDtjb25zdCBvPXRbcl07ImZ1bmN0aW9uIj09dHlwZW9mIG8/T2JqZWN0LmRlZmluZVByb3BlcnR5KG4scix7dmFsdWU6KC4uLm4pPT5vLmFwcGx5KHQsbiksZW51bWVyYWJsZTohMCxjb25maWd1cmFibGU6ITAsd3JpdGFibGU6ITB9KTpuW3JdPW99cmV0dXJuIGUmJk9iamVjdC5hc3NpZ24obix7W290XTohMH0pLG59O2NsYXNzIHN0e2NvbnN0cnVjdG9yKHQsbil7bGV0IGUscjtlPXR8fG5ldyBldCxyPW58fG5ldyBldCx0aGlzLlA9W3tzY29wZTplfV0sdGhpcy5EPXJ9d2l0aFNjb3BlKHQpe2NvbnN0IG49dGhpcy5VKCk7bGV0IGU7dHJ5e2U9dChuKX1jYXRjaCh0KXt0aHJvdyB0aGlzLkIoKSx0fXJldHVybiBqKGUpPygodCxuLGUpPT57Y29uc3Qgcj10LnRoZW4odD0+KG4odCksdCksdD0+e3Rocm93IGUodCksdH0pO3JldHVybiBydChyKSYmcnQodCk/cjppdCh0LHIpfSkoZSwoKT0+dGhpcy5CKCksKCk9PnRoaXMuQigpKToodGhpcy5CKCksZSl9Z2V0Q2xpZW50KCl7cmV0dXJuIHRoaXMuZ2V0U3RhY2tUb3AoKS5jbGllbnR9Z2V0U2NvcGUoKXtyZXR1cm4gdGhpcy5nZXRTdGFja1RvcCgpLnNjb3BlfWdldElzb2xhdGlvblNjb3BlKCl7cmV0dXJuIHRoaXMuRH1nZXRTdGFja1RvcCgpe3JldHVybiB0aGlzLlBbdGhpcy5QLmxlbmd0aC0xXX1VKCl7Y29uc3QgdD10aGlzLmdldFNjb3BlKCkuY2xvbmUoKTtyZXR1cm4gdGhpcy5QLnB1c2goe2NsaWVudDp0aGlzLmdldENsaWVudCgpLHNjb3BlOnR9KSx0fUIoKXtyZXR1cm4hKHRoaXMuUC5sZW5ndGg8PTEpJiYhIXRoaXMuUC5wb3AoKX19ZnVuY3Rpb24gY3QoKXtjb25zdCB0PWcobCgpKTtyZXR1cm4gdC5zdGFjaz10LnN0YWNrfHxuZXcgc3QobSgiZGVmYXVsdEN1cnJlbnRTY29wZSIsKCk9Pm5ldyBldCksbSgiZGVmYXVsdElzb2xhdGlvblNjb3BlIiwoKT0+bmV3IGV0KSl9ZnVuY3Rpb24gdXQodCl7cmV0dXJuIGN0KCkud2l0aFNjb3BlKHQpfWZ1bmN0aW9uIGF0KHQsbil7Y29uc3QgZT1jdCgpO3JldHVybiBlLndpdGhTY29wZSgoKT0+KGUuZ2V0U3RhY2tUb3AoKS5zY29wZT10LG4odCkpKX1mdW5jdGlvbiBmdCh0KXtyZXR1cm4gY3QoKS53aXRoU2NvcGUoKCk9PnQoY3QoKS5nZXRJc29sYXRpb25TY29wZSgpKSl9ZnVuY3Rpb24gaHQodCl7Y29uc3Qgbj1nKHQpO3JldHVybiBuLmFjcz9uLmFjczp7d2l0aElzb2xhdGlvblNjb3BlOmZ0LHdpdGhTY29wZTp1dCx3aXRoU2V0U2NvcGU6YXQsd2l0aFNldElzb2xhdGlvblNjb3BlOih0LG4pPT5mdChuKSxnZXRDdXJyZW50U2NvcGU6KCk9PmN0KCkuZ2V0U2NvcGUoKSxnZXRJc29sYXRpb25TY29wZTooKT0+Y3QoKS5nZXRJc29sYXRpb25TY29wZSgpfX1mdW5jdGlvbiBwdCgpe3JldHVybiBodChsKCkpLmdldEN1cnJlbnRTY29wZSgpLmdldENsaWVudCgpfWZ1bmN0aW9uIGR0KHQpe2NvbnN0IG49dDtyZXR1cm57c2NvcGU6bi5fc2VudHJ5U2NvcGUsaXNvbGF0aW9uU2NvcGU6TyhuLl9zZW50cnlJc29sYXRpb25TY29wZSl9fWNvbnN0IGx0PSJzZW50cnktIjtmdW5jdGlvbiBndCh0KXtjb25zdCBuPWZ1bmN0aW9uKHQpe2lmKCF0fHwobj10LCFDKG4sIlN0cmluZyIpJiYhQXJyYXkuaXNBcnJheSh0KSkpcmV0dXJuO3ZhciBuO2lmKEFycmF5LmlzQXJyYXkodCkpcmV0dXJuIHQucmVkdWNlKCh0LG4pPT57Y29uc3QgZT1tdChuKTtyZXR1cm4gT2JqZWN0LmVudHJpZXMoZSkuZm9yRWFjaCgoW24sZV0pPT57dFtuXT1lfSksdH0se30pO3JldHVybiBtdCh0KX0odCk7aWYoIW4pcmV0dXJuO2NvbnN0IGU9T2JqZWN0LmVudHJpZXMobikucmVkdWNlKCh0LFtuLGVdKT0+e2lmKG4uc3RhcnRzV2l0aChsdCkpe3Rbbi5zbGljZSg3KV09ZX1yZXR1cm4gdH0se30pO3JldHVybiBPYmplY3Qua2V5cyhlKS5sZW5ndGg+MD9lOnZvaWQgMH1mdW5jdGlvbiBtdCh0KXtyZXR1cm4gdC5zcGxpdCgiLCIpLm1hcCh0PT57Y29uc3Qgbj10LmluZGV4T2YoIj0iKTtpZigtMT09PW4pcmV0dXJuW107cmV0dXJuW3Quc2xpY2UoMCxuKSx0LnNsaWNlKG4rMSldLm1hcCh0PT57dHJ5e3JldHVybiBkZWNvZGVVUklDb21wb25lbnQodC50cmltKCkpfWNhdGNoe3JldHVybn19KX0pLnJlZHVjZSgodCxbbixlXSk9PihuJiZlJiYodFtuXT1lKSx0KSx7fSl9Y29uc3QgeXQ9L15vKFxkKylcLi87ZnVuY3Rpb24gYnQodCxuPSExKXtjb25zdHtob3N0OmUscGF0aDpyLHBhc3M6byxwb3J0OmkscHJvamVjdElkOnMscHJvdG9jb2w6YyxwdWJsaWNLZXk6dX09dDtyZXR1cm5gJHtjfTovLyR7dX0ke24mJm8/YDoke299YDoiIn1AJHtlfSR7aT9gOiR7aX1gOiIifS8ke3I/YCR7cn0vYDpyfSR7c31gfWZ1bmN0aW9uIHZ0KHQpe2NvbnN0IG49dC5nZXRPcHRpb25zKCkse2hvc3Q6ZX09dC5nZXREc24oKXx8e307bGV0IHI7cmV0dXJuIG4ub3JnSWQ/cj1TdHJpbmcobi5vcmdJZCk6ZSYmKHI9ZnVuY3Rpb24odCl7Y29uc3Qgbj10Lm1hdGNoKHl0KTtyZXR1cm4gbj8uWzFdfShlKSkscn1mdW5jdGlvbiBfdCh0KXtjb25zdHtzcGFuSWQ6bix0cmFjZUlkOmUsaXNSZW1vdGU6cn09dC5zcGFuQ29udGV4dCgpLG89cj9uOkV0KHQpLnBhcmVudF9zcGFuX2lkLGk9ZHQodCkuc2NvcGU7cmV0dXJue3BhcmVudF9zcGFuX2lkOm8sc3Bhbl9pZDpyP2k/LmdldFByb3BhZ2F0aW9uQ29udGV4dCgpLnByb3BhZ2F0aW9uU3BhbklkfHxudCgpOm4sdHJhY2VfaWQ6ZX19ZnVuY3Rpb24gU3QodCl7cmV0dXJuIHQmJnQubGVuZ3RoPjA/dC5tYXAoKHtjb250ZXh0OntzcGFuSWQ6dCx0cmFjZUlkOm4sdHJhY2VGbGFnczplLC4uLnJ9LGF0dHJpYnV0ZXM6b30pPT4oe3NwYW5faWQ6dCx0cmFjZV9pZDpuLHNhbXBsZWQ6MT09PWUsYXR0cmlidXRlczpvLC4uLnJ9KSk6dm9pZCAwfWZ1bmN0aW9uIHd0KHQpe3JldHVybiJudW1iZXIiPT10eXBlb2YgdD8kdCh0KTpBcnJheS5pc0FycmF5KHQpP3RbMF0rdFsxXS8xZTk6dCBpbnN0YW5jZW9mIERhdGU/JHQodC5nZXRUaW1lKCkpOnEoKX1mdW5jdGlvbiAkdCh0KXtyZXR1cm4gdD45OTk5OTk5OTk5P3QvMWUzOnR9ZnVuY3Rpb24gRXQodCl7aWYoZnVuY3Rpb24odCl7cmV0dXJuImZ1bmN0aW9uIj09dHlwZW9mIHQuZ2V0U3BhbkpTT059KHQpKXJldHVybiB0LmdldFNwYW5KU09OKCk7Y29uc3R7c3BhbklkOm4sdHJhY2VJZDplfT10LnNwYW5Db250ZXh0KCk7aWYoZnVuY3Rpb24odCl7Y29uc3Qgbj10O3JldHVybiEhKG4uYXR0cmlidXRlcyYmbi5zdGFydFRpbWUmJm4ubmFtZSYmbi5lbmRUaW1lJiZuLnN0YXR1cyl9KHQpKXtjb25zdHthdHRyaWJ1dGVzOnIsc3RhcnRUaW1lOm8sbmFtZTppLGVuZFRpbWU6cyxzdGF0dXM6YyxsaW5rczp1fT10O3JldHVybntzcGFuX2lkOm4sdHJhY2VfaWQ6ZSxkYXRhOnIsZGVzY3JpcHRpb246aSxwYXJlbnRfc3Bhbl9pZDp4dCh0KSxzdGFydF90aW1lc3RhbXA6d3QobyksdGltZXN0YW1wOnd0KHMpfHx2b2lkIDAsc3RhdHVzOk50KGMpLG9wOnJbInNlbnRyeS5vcCJdLG9yaWdpbjpyWyJzZW50cnkub3JpZ2luIl0sbGlua3M6U3QodSl9fXJldHVybntzcGFuX2lkOm4sdHJhY2VfaWQ6ZSxzdGFydF90aW1lc3RhbXA6MCxkYXRhOnt9fX1mdW5jdGlvbiB4dCh0KXtyZXR1cm4icGFyZW50U3BhbklkImluIHQ/dC5wYXJlbnRTcGFuSWQ6InBhcmVudFNwYW5Db250ZXh0ImluIHQ/dC5wYXJlbnRTcGFuQ29udGV4dD8uc3BhbklkOnZvaWQgMH1mdW5jdGlvbiBOdCh0KXtpZih0JiYwIT09dC5jb2RlKXJldHVybiAxPT09dC5jb2RlPyJvayI6dC5tZXNzYWdlfHwiaW50ZXJuYWxfZXJyb3IifWNvbnN0IEN0PWZ1bmN0aW9uKHQpe3JldHVybiB0Ll9zZW50cnlSb290U3Bhbnx8dH07ZnVuY3Rpb24ganQodCl7aWYoImJvb2xlYW4iPT10eXBlb2YgX19TRU5UUllfVFJBQ0lOR19fJiYhX19TRU5UUllfVFJBQ0lOR19fKXJldHVybiExO2NvbnN0IG49dHx8cHQoKT8uZ2V0T3B0aW9ucygpO3JldHVybiEoIW58fG51bGw9PW4udHJhY2VzU2FtcGxlUmF0ZSYmIW4udHJhY2VzU2FtcGxlcil9Y29uc3QgUnQ9U3ltYm9sLmZvcigic2VudHJ5Lm5vblJlY29yZGluZ1NwYW4iKTtmdW5jdGlvbiBBdCh0LG4pe2NvbnN0IGU9bi5nZXRPcHRpb25zKCkse3B1YmxpY0tleTpyfT1uLmdldERzbigpfHx7fSxvPXtlbnZpcm9ubWVudDplLmVudmlyb25tZW50fHwicHJvZHVjdGlvbiIscmVsZWFzZTplLnJlbGVhc2UscHVibGljX2tleTpyLHRyYWNlX2lkOnQsb3JnX2lkOnZ0KG4pfTtyZXR1cm4gbi5lbWl0KCJjcmVhdGVEc2MiLG8pLG99ZnVuY3Rpb24gSXQodCxuKXtjb25zdCBlPW4uZ2V0UHJvcGFnYXRpb25Db250ZXh0KCk7cmV0dXJuIGUuZHNjfHxBdChlLnRyYWNlSWQsdCl9ZnVuY3Rpb24gT3QodCl7Y29uc3Qgbj1wdCgpO2lmKCFuKXJldHVybnt9O2NvbnN0IGU9Q3QodCkscj1FdChlKSxvPXIuZGF0YSxpPWUuc3BhbkNvbnRleHQoKS50cmFjZVN0YXRlLHM9aT8uZ2V0KCJzZW50cnkuc2FtcGxlX3JhdGUiKT8/b1sic2VudHJ5LnNhbXBsZV9yYXRlIl0/P29bInNlbnRyeS5wcmV2aW91c190cmFjZV9zYW1wbGVfcmF0ZSJdO2Z1bmN0aW9uIGModCl7cmV0dXJuIm51bWJlciIhPXR5cGVvZiBzJiYic3RyaW5nIiE9dHlwZW9mIHN8fCh0LnNhbXBsZV9yYXRlPWAke3N9YCksdH1jb25zdCB1PWUuX2Zyb3plbkRzYztpZih1KXJldHVybiBjKHUpO2lmKGZ1bmN0aW9uKHQpe3JldHVybiEhdCYmITA9PT10W1J0XX0oZSkmJiFqdChuLmdldE9wdGlvbnMoKSkpe2NvbnN0IHQ9ZHQoZSkuc2NvcGU7aWYodClyZXR1cm4gYyh7Li4uSXQobix0KX0pfWNvbnN0IGE9aT8uZ2V0KCJzZW50cnkuZHNjIiksZj1hJiZndChhKTtpZihmKXJldHVybiBjKGYpO2NvbnN0IGg9QXQodC5zcGFuQ29udGV4dCgpLnRyYWNlSWQsbikscD1vWyJzZW50cnkuc291cmNlIl0/P29bInNlbnRyeS5zcGFuLnNvdXJjZSJdLGQ9ci5kZXNjcmlwdGlvbjtyZXR1cm4idXJsIiE9PXAmJmQmJihoLnRyYW5zYWN0aW9uPWQpLGp0KCkmJihoLnNhbXBsZWQ9U3RyaW5nKGZ1bmN0aW9uKHQpe2NvbnN0e3RyYWNlRmxhZ3M6bn09dC5zcGFuQ29udGV4dCgpO3JldHVybiAxPT09bn0oZSkpLGguc2FtcGxlX3JhbmQ9aT8uZ2V0KCJzZW50cnkuc2FtcGxlX3JhbmQiKT8/ZHQoZSkuc2NvcGU/LmdldFByb3BhZ2F0aW9uQ29udGV4dCgpLnNhbXBsZVJhbmQudG9TdHJpbmcoKSksYyhoKSxuLmVtaXQoImNyZWF0ZURzYyIsaCxlKSxofWZ1bmN0aW9uIFR0KHQsbj1bXSl7cmV0dXJuW3Qsbl19ZnVuY3Rpb24ga3QodCxuKXtjb25zdCBlPXRbMV07Zm9yKGNvbnN0IHQgb2YgZSl7aWYobih0LHRbMF0udHlwZSkpcmV0dXJuITB9cmV0dXJuITF9ZnVuY3Rpb24gUHQodCl7Y29uc3Qgbj1nKHApO3JldHVybiBuLmVuY29kZVBvbHlmaWxsP24uZW5jb2RlUG9seWZpbGwodCk6KG5ldyBUZXh0RW5jb2RlcikuZW5jb2RlKHQpfWZ1bmN0aW9uIER0KHQpe2NvbnN0W24sZV09dDtsZXQgcj1KU09OLnN0cmluZ2lmeShuKTtmdW5jdGlvbiBvKHQpeyJzdHJpbmciPT10eXBlb2Ygcj9yPSJzdHJpbmciPT10eXBlb2YgdD9yK3Q6W1B0KHIpLHRdOnIucHVzaCgic3RyaW5nIj09dHlwZW9mIHQ/UHQodCk6dCl9Zm9yKGNvbnN0IHQgb2YgZSl7Y29uc3RbbixlXT10O2lmKG8oYFxuJHtKU09OLnN0cmluZ2lmeShuKX1cbmApLCJzdHJpbmciPT10eXBlb2YgZXx8ZSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpbyhlKTtlbHNle2xldCB0O3RyeXt0PUpTT04uc3RyaW5naWZ5KGUpfWNhdGNoe3Q9SlNPTi5zdHJpbmdpZnkoRihlKSl9byh0KX19cmV0dXJuInN0cmluZyI9PXR5cGVvZiByP3I6ZnVuY3Rpb24odCl7Y29uc3Qgbj10LnJlZHVjZSgodCxuKT0+dCtuLmxlbmd0aCwwKSxlPW5ldyBVaW50OEFycmF5KG4pO2xldCByPTA7Zm9yKGNvbnN0IG4gb2YgdCllLnNldChuLHIpLHIrPW4ubGVuZ3RoO3JldHVybiBlfShyKX1jb25zdCBVdD17c2Vzc2lvbnM6InNlc3Npb24iLGV2ZW50OiJlcnJvciIsY2xpZW50X3JlcG9ydDoiaW50ZXJuYWwiLHVzZXJfcmVwb3J0OiJkZWZhdWx0Iixwcm9maWxlX2NodW5rOiJwcm9maWxlIixyZXBsYXlfZXZlbnQ6InJlcGxheSIscmVwbGF5X3JlY29yZGluZzoicmVwbGF5IixjaGVja19pbjoibW9uaXRvciIscmF3X3NlY3VyaXR5OiJzZWN1cml0eSIsbG9nOiJsb2dfaXRlbSIsdHJhY2VfbWV0cmljOiJtZXRyaWMifTtmdW5jdGlvbiBCdCh0KXtyZXR1cm4gZnVuY3Rpb24odCl7cmV0dXJuIHQgaW4gVXR9KHQpP1V0W3RdOnR9ZnVuY3Rpb24gTHQodCl7aWYoIXQ/LnNkaylyZXR1cm47Y29uc3R7bmFtZTpuLHZlcnNpb246ZX09dC5zZGs7cmV0dXJue25hbWU6bix2ZXJzaW9uOmV9fWZ1bmN0aW9uIE10KHQsbixlLHIpe2NvbnN0IG89THQoZSksaT10LnR5cGUmJiJyZXBsYXlfZXZlbnQiIT09dC50eXBlP3QudHlwZToiZXZlbnQiOyFmdW5jdGlvbih0LG4pe2lmKCFuKXJldHVybiB0O2NvbnN0IGU9dC5zZGt8fHt9O3Quc2RrPXsuLi5lLG5hbWU6ZS5uYW1lfHxuLm5hbWUsdmVyc2lvbjplLnZlcnNpb258fG4udmVyc2lvbixpbnRlZ3JhdGlvbnM6Wy4uLnQuc2RrPy5pbnRlZ3JhdGlvbnN8fFtdLC4uLm4uaW50ZWdyYXRpb25zfHxbXV0scGFja2FnZXM6Wy4uLnQuc2RrPy5wYWNrYWdlc3x8W10sLi4ubi5wYWNrYWdlc3x8W11dLHNldHRpbmdzOnQuc2RrPy5zZXR0aW5nc3x8bi5zZXR0aW5ncz97Li4udC5zZGs/LnNldHRpbmdzLC4uLm4uc2V0dGluZ3N9OnZvaWQgMH19KHQsZT8uc2RrKTtjb25zdCBzPWZ1bmN0aW9uKHQsbixlLHIpe2NvbnN0IG89dC5zZGtQcm9jZXNzaW5nTWV0YWRhdGE/LmR5bmFtaWNTYW1wbGluZ0NvbnRleHQ7cmV0dXJue2V2ZW50X2lkOnQuZXZlbnRfaWQsc2VudF9hdDpuZXcgRGF0ZShMKCkpLnRvSVNPU3RyaW5nKCksLi4ubiYme3NkazpufSwuLi4hIWUmJnImJntkc246YnQocil9LC4uLm8mJnt0cmFjZTpvfX19KHQsbyxyLG4pO2RlbGV0ZSB0LnNka1Byb2Nlc3NpbmdNZXRhZGF0YTtyZXR1cm4gVHQocyxbW3t0eXBlOml9LHRdXSl9Y29uc3QgenQ9Il9fU0VOVFJZX1NVUFBSRVNTX1RSQUNJTkdfXyI7ZnVuY3Rpb24gRnQodCl7Y29uc3Qgbj1odChsKCkpO3JldHVybiBuLnN1cHByZXNzVHJhY2luZz9uLnN1cHByZXNzVHJhY2luZyh0KTpmdW5jdGlvbiguLi50KXtjb25zdCBuPWh0KGwoKSk7aWYoMj09PXQubGVuZ3RoKXtjb25zdFtlLHJdPXQ7cmV0dXJuIGU/bi53aXRoU2V0U2NvcGUoZSxyKTpuLndpdGhTY29wZShyKX1yZXR1cm4gbi53aXRoU2NvcGUodFswXSl9KG49PntuLnNldFNES1Byb2Nlc3NpbmdNZXRhZGF0YSh7W3p0XTohMH0pO2NvbnN0IGU9dCgpO3JldHVybiBuLnNldFNES1Byb2Nlc3NpbmdNZXRhZGF0YSh7W3p0XTp2b2lkIDB9KSxlfSl9ZnVuY3Rpb24gR3QodCxuKXtjb25zdHtmaW5nZXJwcmludDplLHNwYW46cixicmVhZGNydW1iczpvLHNka1Byb2Nlc3NpbmdNZXRhZGF0YTppfT1uOyFmdW5jdGlvbih0LG4pe2NvbnN0e2V4dHJhOmUsdGFnczpyLHVzZXI6byxjb250ZXh0czppLGxldmVsOnMsdHJhbnNhY3Rpb25OYW1lOmN9PW47T2JqZWN0LmtleXMoZSkubGVuZ3RoJiYodC5leHRyYT17Li4uZSwuLi50LmV4dHJhfSk7T2JqZWN0LmtleXMocikubGVuZ3RoJiYodC50YWdzPXsuLi5yLC4uLnQudGFnc30pO09iamVjdC5rZXlzKG8pLmxlbmd0aCYmKHQudXNlcj17Li4ubywuLi50LnVzZXJ9KTtPYmplY3Qua2V5cyhpKS5sZW5ndGgmJih0LmNvbnRleHRzPXsuLi5pLC4uLnQuY29udGV4dHN9KTtzJiYodC5sZXZlbD1zKTtjJiYidHJhbnNhY3Rpb24iIT09dC50eXBlJiYodC50cmFuc2FjdGlvbj1jKX0odCxuKSxyJiZmdW5jdGlvbih0LG4pe3QuY29udGV4dHM9e3RyYWNlOl90KG4pLC4uLnQuY29udGV4dHN9LHQuc2RrUHJvY2Vzc2luZ01ldGFkYXRhPXtkeW5hbWljU2FtcGxpbmdDb250ZXh0Ok90KG4pLC4uLnQuc2RrUHJvY2Vzc2luZ01ldGFkYXRhfTtjb25zdCBlPUN0KG4pLHI9RXQoZSkuZGVzY3JpcHRpb247ciYmIXQudHJhbnNhY3Rpb24mJiJ0cmFuc2FjdGlvbiI9PT10LnR5cGUmJih0LnRyYW5zYWN0aW9uPXIpfSh0LHIpLGZ1bmN0aW9uKHQsbil7dC5maW5nZXJwcmludD10LmZpbmdlcnByaW50P0FycmF5LmlzQXJyYXkodC5maW5nZXJwcmludCk/dC5maW5nZXJwcmludDpbdC5maW5nZXJwcmludF06W10sbiYmKHQuZmluZ2VycHJpbnQ9dC5maW5nZXJwcmludC5jb25jYXQobikpO3QuZmluZ2VycHJpbnQubGVuZ3RofHxkZWxldGUgdC5maW5nZXJwcmludH0odCxlKSxmdW5jdGlvbih0LG4pe2NvbnN0IGU9Wy4uLnQuYnJlYWRjcnVtYnN8fFtdLC4uLm5dO3QuYnJlYWRjcnVtYnM9ZS5sZW5ndGg/ZTp2b2lkIDB9KHQsbyksZnVuY3Rpb24odCxuKXt0LnNka1Byb2Nlc3NpbmdNZXRhZGF0YT17Li4udC5zZGtQcm9jZXNzaW5nTWV0YWRhdGEsLi4ubn19KHQsaSl9Y2xhc3MgSnR7Y29uc3RydWN0b3IodCl7dGhpcy5MPTAsdGhpcy5NPVtdLHRoaXMuRih0KX10aGVuKHQsbil7cmV0dXJuIG5ldyBKdCgoZSxyKT0+e3RoaXMuTS5wdXNoKFshMSxuPT57aWYodCl0cnl7ZSh0KG4pKX1jYXRjaCh0KXtyKHQpfWVsc2UgZShuKX0sdD0+e2lmKG4pdHJ5e2Uobih0KSl9Y2F0Y2godCl7cih0KX1lbHNlIHIodCl9XSksdGhpcy5HKCl9KX1jYXRjaCh0KXtyZXR1cm4gdGhpcy50aGVuKHQ9PnQsdCl9ZmluYWxseSh0KXtyZXR1cm4gbmV3IEp0KChuLGUpPT57bGV0IHIsbztyZXR1cm4gdGhpcy50aGVuKG49PntvPSExLHI9bix0JiZ0KCl9LG49PntvPSEwLHI9bix0JiZ0KCl9KS50aGVuKCgpPT57bz9lKHIpOm4ocil9KX0pfUcoKXtpZigwPT09dGhpcy5MKXJldHVybjtjb25zdCB0PXRoaXMuTS5zbGljZSgpO3RoaXMuTT1bXSx0LmZvckVhY2godD0+e3RbMF18fCgxPT09dGhpcy5MJiZ0WzFdKHRoaXMuSiksMj09PXRoaXMuTCYmdFsyXSh0aGlzLkopLHRbMF09ITApfSl9Rih0KXtjb25zdCBuPSh0LG4pPT57MD09PXRoaXMuTCYmKGoobik/bi50aGVuKGUscik6KHRoaXMuTD10LHRoaXMuSj1uLHRoaXMuRygpKSl9LGU9dD0+e24oMSx0KX0scj10PT57bigyLHQpfTt0cnl7dChlLHIpfWNhdGNoKHQpe3IodCl9fX1jb25zdCBXdD1TeW1ib2wuZm9yKCJTZW50cnlCdWZmZXJGdWxsRXJyb3IiKTtmdW5jdGlvbiBZdCh0PTEwMCl7Y29uc3Qgbj1uZXcgU2V0O2Z1bmN0aW9uIGUodCl7bi5kZWxldGUodCl9cmV0dXJue2dldCAkKCl7cmV0dXJuIEFycmF5LmZyb20obil9LGFkZDpmdW5jdGlvbihyKXtpZighKG4uc2l6ZTx0KSlyZXR1cm4gbz1XdCxuZXcgSnQoKHQsbik9PntuKG8pfSk7dmFyIG87Y29uc3QgaT1yKCk7cmV0dXJuIG4uYWRkKGkpLGkudGhlbigoKT0+ZShpKSwoKT0+ZShpKSksaX0sZHJhaW46ZnVuY3Rpb24odCl7aWYoIW4uc2l6ZSlyZXR1cm4gZT0hMCxuZXcgSnQodD0+e3QoZSl9KTt2YXIgZTtjb25zdCByPVByb21pc2UuYWxsU2V0dGxlZChBcnJheS5mcm9tKG4pKS50aGVuKCgpPT4hMCk7aWYoIXQpcmV0dXJuIHI7Y29uc3Qgbz1bcixuZXcgUHJvbWlzZShuPT57cmV0dXJuIm9iamVjdCI9PXR5cGVvZihlPXNldFRpbWVvdXQoKCk9Pm4oITEpLHQpKSYmImZ1bmN0aW9uIj09dHlwZW9mIGUudW5yZWYmJmUudW5yZWYoKSxlO3ZhciBlfSldO3JldHVybiBQcm9taXNlLnJhY2Uobyl9fX1mdW5jdGlvbiBIdCh0LHtzdGF0dXNDb2RlOm4saGVhZGVyczplfSxyPUwoKSl7Y29uc3Qgbz17Li4udH0saT1lPy5bIngtc2VudHJ5LXJhdGUtbGltaXRzIl0scz1lPy5bInJldHJ5LWFmdGVyIl07aWYoaSlmb3IoY29uc3QgdCBvZiBpLnRyaW0oKS5zcGxpdCgiLCIpKXtjb25zdFtuLGUsLCxpXT10LnNwbGl0KCI6Iiw1KSxzPXBhcnNlSW50KG4sMTApLGM9MWUzKihpc05hTihzKT82MDpzKTtpZihlKWZvcihjb25zdCB0IG9mIGUuc3BsaXQoIjsiKSkibWV0cmljX2J1Y2tldCI9PT10JiZpJiYhaS5zcGxpdCgiOyIpLmluY2x1ZGVzKCJjdXN0b20iKXx8KG9bdF09citjKTtlbHNlIG8uYWxsPXIrY31lbHNlIHM/by5hbGw9citmdW5jdGlvbih0LG49TCgpKXtjb25zdCBlPXBhcnNlSW50KGAke3R9YCwxMCk7aWYoIWlzTmFOKGUpKXJldHVybiAxZTMqZTtjb25zdCByPURhdGUucGFyc2UoYCR7dH1gKTtyZXR1cm4gaXNOYU4ocik/NmU0OnItbn0ocyxyKTo0Mjk9PT1uJiYoby5hbGw9cis2ZTQpO3JldHVybiBvfWZ1bmN0aW9uIEt0KHQsbixlPVl0KHQuYnVmZmVyU2l6ZXx8NjQpKXtsZXQgcj17fTtyZXR1cm57c2VuZDpmdW5jdGlvbih0KXtjb25zdCBvPVtdO2lmKGt0KHQsKHQsbik9Pntjb25zdCBlPUJ0KG4pOyhmdW5jdGlvbih0LG4sZT1MKCkpe3JldHVybiBmdW5jdGlvbih0LG4pe3JldHVybiB0W25dfHx0LmFsbHx8MH0odCxuKT5lfSkocixlKXx8by5wdXNoKHQpfSksMD09PW8ubGVuZ3RoKXJldHVybiBQcm9taXNlLnJlc29sdmUoe30pO2NvbnN0IGk9VHQodFswXSxvKSxzPXQ9PnshZnVuY3Rpb24odCxuKXtyZXR1cm4ga3QodCwodCxlKT0+bi5pbmNsdWRlcyhlKSl9KGksWyJjbGllbnRfcmVwb3J0Il0pP2t0KGksKHQsbik9Pnt9KTpoJiZ3Lndhcm4oYERyb3BwaW5nIGNsaWVudCByZXBvcnQuIFdpbGwgbm90IHNlbmQgb3V0Y29tZXMgKHJlYXNvbjogJHt0fSkuYCl9O3JldHVybiBlLmFkZCgoKT0+bih7Ym9keTpEdChpKX0pLnRoZW4odD0+NDEzPT09dC5zdGF0dXNDb2RlPyhoJiZ3LmVycm9yKCJTZW50cnkgcmVzcG9uZGVkIHdpdGggc3RhdHVzIGNvZGUgNDEzLiBFbnZlbG9wZSB3YXMgZGlzY2FyZGVkIGR1ZSB0byBleGNlZWRpbmcgc2l6ZSBsaW1pdHMuIikscygic2VuZF9lcnJvciIpLHQpOihoJiZ2b2lkIDAhPT10LnN0YXR1c0NvZGUmJih0LnN0YXR1c0NvZGU8MjAwfHx0LnN0YXR1c0NvZGU+PTMwMCkmJncud2FybihgU2VudHJ5IHJlc3BvbmRlZCB3aXRoIHN0YXR1cyBjb2RlICR7dC5zdGF0dXNDb2RlfSB0byBzZW50IGV2ZW50LmApLHI9SHQocix0KSx0KSx0PT57dGhyb3cgcygibmV0d29ya19lcnJvciIpLGgmJncuZXJyb3IoIkVuY291bnRlcmVkIGVycm9yIHJ1bm5pbmcgdHJhbnNwb3J0IHJlcXVlc3Q6Iix0KSx0fSkpLnRoZW4odD0+dCx0PT57aWYodD09PVd0KXJldHVybiBoJiZ3LmVycm9yKCJTa2lwcGVkIHNlbmRpbmcgZXZlbnQgYmVjYXVzZSBidWZmZXIgaXMgZnVsbC4iKSxzKCJxdWV1ZV9vdmVyZmxvdyIpLFByb21pc2UucmVzb2x2ZSh7fSk7dGhyb3cgdH0pfSxmbHVzaDp0PT5lLmRyYWluKHQpfX1jb25zdCBadD0vXihcUys6XFx8XC8/KShbXHNcU10qPykoKD86XC57MSwyfXxbXi9cXF0rP3wpKFwuW14uL1xcXSp8KSkoPzpbL1xcXSopJC87ZnVuY3Rpb24gcXQodCl7Y29uc3Qgbj1mdW5jdGlvbih0KXtjb25zdCBuPXQubGVuZ3RoPjEwMjQ/YDx0cnVuY2F0ZWQ+JHt0LnNsaWNlKC0xMDI0KX1gOnQsZT1adC5leGVjKG4pO3JldHVybiBlP2Uuc2xpY2UoMSk6W119KHQpLGU9blswXXx8IiI7bGV0IHI9blsxXTtyZXR1cm4gZXx8cj8ociYmKHI9ci5zbGljZSgwLHIubGVuZ3RoLTEpKSxlK3IpOiIuIn1mdW5jdGlvbiBWdCh0LG49ITEpe3JldHVybiEobnx8dCYmIXQuc3RhcnRzV2l0aCgiLyIpJiYhdC5tYXRjaCgvXltBLVpdOi8pJiYhdC5zdGFydHNXaXRoKCIuIikmJiF0Lm1hdGNoKC9eW2EtekEtWl0oW2EtekEtWjAtOS5cLStdKSo6XC9cLy8pKSYmdm9pZCAwIT09dCYmIXQuaW5jbHVkZXMoIm5vZGVfbW9kdWxlcy8iKX12YXIgUXQ7Y29uc3QgWHQ9U3ltYm9sKCJBZ2VudEJhc2VJbnRlcm5hbFN0YXRlIik7Y2xhc3MgdG4gZXh0ZW5kcyhRdD1pLkFnZW50LFF0KXtjb25zdHJ1Y3Rvcih0KXtzdXBlcih0KSx0aGlzW1h0XT17fX1pc1NlY3VyZUVuZHBvaW50KHQpe2lmKHQpe2lmKCJib29sZWFuIj09dHlwZW9mIHQuc2VjdXJlRW5kcG9pbnQpcmV0dXJuIHQuc2VjdXJlRW5kcG9pbnQ7aWYoInN0cmluZyI9PXR5cGVvZiB0LnByb3RvY29sKXJldHVybiJodHRwczoiPT09dC5wcm90b2NvbH1jb25zdHtzdGFjazpufT1uZXcgRXJyb3I7cmV0dXJuInN0cmluZyI9PXR5cGVvZiBuJiZuLnNwbGl0KCJcbiIpLnNvbWUodD0+LTEhPT10LmluZGV4T2YoIihodHRwcy5qczoiKXx8LTEhPT10LmluZGV4T2YoIm5vZGU6aHR0cHM6IikpfWNyZWF0ZVNvY2tldCh0LG4sZSl7Y29uc3Qgcj17Li4ubixzZWN1cmVFbmRwb2ludDp0aGlzLmlzU2VjdXJlRW5kcG9pbnQobil9O1Byb21pc2UucmVzb2x2ZSgpLnRoZW4oKCk9PnRoaXMuY29ubmVjdCh0LHIpKS50aGVuKG89PntpZihvIGluc3RhbmNlb2YgaS5BZ2VudClyZXR1cm4gby5hZGRSZXF1ZXN0KHQscik7dGhpc1tYdF0uY3VycmVudFNvY2tldD1vLHN1cGVyLmNyZWF0ZVNvY2tldCh0LG4sZSl9LGUpfWNyZWF0ZUNvbm5lY3Rpb24oKXtjb25zdCB0PXRoaXNbWHRdLmN1cnJlbnRTb2NrZXQ7aWYodGhpc1tYdF0uY3VycmVudFNvY2tldD12b2lkIDAsIXQpdGhyb3cgbmV3IEVycm9yKCJObyBzb2NrZXQgd2FzIHJldHVybmVkIGluIHRoZSBgY29ubmVjdCgpYCBmdW5jdGlvbiIpO3JldHVybiB0fWdldCBkZWZhdWx0UG9ydCgpe3JldHVybiB0aGlzW1h0XS5kZWZhdWx0UG9ydD8/KCJodHRwczoiPT09dGhpcy5wcm90b2NvbD80NDM6ODApfXNldCBkZWZhdWx0UG9ydCh0KXt0aGlzW1h0XSYmKHRoaXNbWHRdLmRlZmF1bHRQb3J0PXQpfWdldCBwcm90b2NvbCgpe3JldHVybiB0aGlzW1h0XS5wcm90b2NvbD8/KHRoaXMuaXNTZWN1cmVFbmRwb2ludCgpPyJodHRwczoiOiJodHRwOiIpfXNldCBwcm90b2NvbCh0KXt0aGlzW1h0XSYmKHRoaXNbWHRdLnByb3RvY29sPXQpfX1mdW5jdGlvbiBubiguLi50KXt3LmxvZygiW2h0dHBzLXByb3h5LWFnZW50OnBhcnNlLXByb3h5LXJlc3BvbnNlXSIsLi4udCl9ZnVuY3Rpb24gZW4odCl7cmV0dXJuIG5ldyBQcm9taXNlKChuLGUpPT57bGV0IHI9MDtjb25zdCBvPVtdO2Z1bmN0aW9uIGkoKXtjb25zdCBjPXQucmVhZCgpO2M/ZnVuY3Rpb24oYyl7by5wdXNoKGMpLHIrPWMubGVuZ3RoO2NvbnN0IHU9QnVmZmVyLmNvbmNhdChvLHIpLGE9dS5pbmRleE9mKCJcclxuXHJcbiIpO2lmKC0xPT09YSlyZXR1cm4gbm4oImhhdmUgbm90IHJlY2VpdmVkIGVuZCBvZiBIVFRQIGhlYWRlcnMgeWV0Li4uIiksdm9pZCBpKCk7Y29uc3QgZj11LnN1YmFycmF5KDAsYSkudG9TdHJpbmcoImFzY2lpIikuc3BsaXQoIlxyXG4iKSxoPWYuc2hpZnQoKTtpZighaClyZXR1cm4gdC5kZXN0cm95KCksZShuZXcgRXJyb3IoIk5vIGhlYWRlciByZWNlaXZlZCBmcm9tIHByb3h5IENPTk5FQ1QgcmVzcG9uc2UiKSk7Y29uc3QgcD1oLnNwbGl0KCIgIiksZD0rKHBbMV18fDApLGw9cC5zbGljZSgyKS5qb2luKCIgIiksZz17fTtmb3IoY29uc3QgbiBvZiBmKXtpZighbiljb250aW51ZTtjb25zdCByPW4uaW5kZXhPZigiOiIpO2lmKC0xPT09cilyZXR1cm4gdC5kZXN0cm95KCksZShuZXcgRXJyb3IoYEludmFsaWQgaGVhZGVyIGZyb20gcHJveHkgQ09OTkVDVCByZXNwb25zZTogIiR7bn0iYCkpO2NvbnN0IG89bi5zbGljZSgwLHIpLnRvTG93ZXJDYXNlKCksaT1uLnNsaWNlKHIrMSkudHJpbVN0YXJ0KCkscz1nW29dOyJzdHJpbmciPT10eXBlb2Ygcz9nW29dPVtzLGldOkFycmF5LmlzQXJyYXkocyk/cy5wdXNoKGkpOmdbb109aX1ubigiZ290IHByb3h5IHNlcnZlciByZXNwb25zZTogJW8gJW8iLGgsZykscygpLG4oe2Nvbm5lY3Q6e3N0YXR1c0NvZGU6ZCxzdGF0dXNUZXh0OmwsaGVhZGVyczpnfSxidWZmZXJlZDp1fSl9KGMpOnQub25jZSgicmVhZGFibGUiLGkpfWZ1bmN0aW9uIHMoKXt0LnJlbW92ZUxpc3RlbmVyKCJlbmQiLGMpLHQucmVtb3ZlTGlzdGVuZXIoImVycm9yIix1KSx0LnJlbW92ZUxpc3RlbmVyKCJyZWFkYWJsZSIsaSl9ZnVuY3Rpb24gYygpe3MoKSxubigib25lbmQiKSxlKG5ldyBFcnJvcigiUHJveHkgY29ubmVjdGlvbiBlbmRlZCBiZWZvcmUgcmVjZWl2aW5nIENPTk5FQ1QgcmVzcG9uc2UiKSl9ZnVuY3Rpb24gdSh0KXtzKCksbm4oIm9uZXJyb3IgJW8iLHQpLGUodCl9dC5vbigiZXJyb3IiLHUpLHQub24oImVuZCIsYyksaSgpfSl9ZnVuY3Rpb24gcm4oLi4udCl7dy5sb2coIltodHRwcy1wcm94eS1hZ2VudF0iLC4uLnQpfWNsYXNzIG9uIGV4dGVuZHMgdG57Y29uc3RydWN0b3IodCxuKXtzdXBlcihuKSx0aGlzLm9wdGlvbnM9e30sdGhpcy5wcm94eT0ic3RyaW5nIj09dHlwZW9mIHQ/bmV3IFVSTCh0KTp0LHRoaXMucHJveHlIZWFkZXJzPW4/LmhlYWRlcnM/P3t9LHJuKCJDcmVhdGluZyBuZXcgSHR0cHNQcm94eUFnZW50IGluc3RhbmNlOiAlbyIsdGhpcy5wcm94eS5ocmVmKTtjb25zdCBlPSh0aGlzLnByb3h5Lmhvc3RuYW1lfHx0aGlzLnByb3h5Lmhvc3QpLnJlcGxhY2UoL15cW3xcXSQvZywiIikscj10aGlzLnByb3h5LnBvcnQ/cGFyc2VJbnQodGhpcy5wcm94eS5wb3J0LDEwKToiaHR0cHM6Ij09PXRoaXMucHJveHkucHJvdG9jb2w/NDQzOjgwO3RoaXMuY29ubmVjdE9wdHM9e0FMUE5Qcm90b2NvbHM6WyJodHRwLzEuMSJdLC4uLm4/Y24obiwiaGVhZGVycyIpOm51bGwsaG9zdDplLHBvcnQ6cn19YXN5bmMgY29ubmVjdCh0LG4pe2NvbnN0e3Byb3h5OmV9PXRoaXM7aWYoIW4uaG9zdCl0aHJvdyBuZXcgVHlwZUVycm9yKCdObyAiaG9zdCIgcHJvdmlkZWQnKTtsZXQgcjtpZigiaHR0cHM6Ij09PWUucHJvdG9jb2wpe3JuKCJDcmVhdGluZyBgdGxzLlNvY2tldGA6ICVvIix0aGlzLmNvbm5lY3RPcHRzKTtjb25zdCB0PXRoaXMuY29ubmVjdE9wdHMuc2VydmVybmFtZXx8dGhpcy5jb25uZWN0T3B0cy5ob3N0O3I9Zi5jb25uZWN0KHsuLi50aGlzLmNvbm5lY3RPcHRzLHNlcnZlcm5hbWU6dCYmYS5pc0lQKHQpP3ZvaWQgMDp0fSl9ZWxzZSBybigiQ3JlYXRpbmcgYG5ldC5Tb2NrZXRgOiAlbyIsdGhpcy5jb25uZWN0T3B0cykscj1hLmNvbm5lY3QodGhpcy5jb25uZWN0T3B0cyk7Y29uc3Qgbz0iZnVuY3Rpb24iPT10eXBlb2YgdGhpcy5wcm94eUhlYWRlcnM/dGhpcy5wcm94eUhlYWRlcnMoKTp7Li4udGhpcy5wcm94eUhlYWRlcnN9LGk9YS5pc0lQdjYobi5ob3N0KT9gWyR7bi5ob3N0fV1gOm4uaG9zdDtsZXQgcz1gQ09OTkVDVCAke2l9OiR7bi5wb3J0fSBIVFRQLzEuMVxyXG5gO2lmKGUudXNlcm5hbWV8fGUucGFzc3dvcmQpe2NvbnN0IHQ9YCR7ZGVjb2RlVVJJQ29tcG9uZW50KGUudXNlcm5hbWUpfToke2RlY29kZVVSSUNvbXBvbmVudChlLnBhc3N3b3JkKX1gO29bIlByb3h5LUF1dGhvcml6YXRpb24iXT1gQmFzaWMgJHtCdWZmZXIuZnJvbSh0KS50b1N0cmluZygiYmFzZTY0Iil9YH1vLkhvc3Q9YCR7aX06JHtuLnBvcnR9YCxvWyJQcm94eS1Db25uZWN0aW9uIl18fChvWyJQcm94eS1Db25uZWN0aW9uIl09dGhpcy5rZWVwQWxpdmU/IktlZXAtQWxpdmUiOiJjbG9zZSIpO2Zvcihjb25zdCB0IG9mIE9iamVjdC5rZXlzKG8pKXMrPWAke3R9OiAke29bdF19XHJcbmA7Y29uc3QgYz1lbihyKTtyLndyaXRlKGAke3N9XHJcbmApO2NvbnN0e2Nvbm5lY3Q6dSxidWZmZXJlZDpofT1hd2FpdCBjO2lmKHQuZW1pdCgicHJveHlDb25uZWN0Iix1KSx0aGlzLmVtaXQoInByb3h5Q29ubmVjdCIsdSx0KSwyMDA9PT11LnN0YXR1c0NvZGUpe2lmKHQub25jZSgic29ja2V0Iixzbiksbi5zZWN1cmVFbmRwb2ludCl7cm4oIlVwZ3JhZGluZyBzb2NrZXQgY29ubmVjdGlvbiB0byBUTFMiKTtjb25zdCB0PW4uc2VydmVybmFtZXx8bi5ob3N0O3JldHVybiBmLmNvbm5lY3Qoey4uLmNuKG4sImhvc3QiLCJwYXRoIiwicG9ydCIpLHNvY2tldDpyLHNlcnZlcm5hbWU6YS5pc0lQKHQpP3ZvaWQgMDp0fSl9cmV0dXJuIHJ9ci5kZXN0cm95KCk7Y29uc3QgcD1uZXcgYS5Tb2NrZXQoe3dyaXRhYmxlOiExfSk7cmV0dXJuIHAucmVhZGFibGU9ITAsdC5vbmNlKCJzb2NrZXQiLHQ9PntybigiUmVwbGF5aW5nIHByb3h5IGJ1ZmZlciBmb3IgZmFpbGVkIHJlcXVlc3QiKSx0LnB1c2goaCksdC5wdXNoKG51bGwpfSkscH19ZnVuY3Rpb24gc24odCl7dC5yZXN1bWUoKX1mdW5jdGlvbiBjbih0LC4uLm4pe2NvbnN0IGU9e307bGV0IHI7Zm9yKHIgaW4gdCluLmluY2x1ZGVzKHIpfHwoZVtyXT10W3JdKTtyZXR1cm4gZX1vbi5wcm90b2NvbHM9WyJodHRwIiwiaHR0cHMiXTtmdW5jdGlvbiB1bih0KXtyZXR1cm4gdC5yZXBsYWNlKC9eW0EtWl06LywiIikucmVwbGFjZSgvXFwvZywiLyIpfWNvbnN0IGFuPW47bGV0IGZuLGhuPTAscG49e307ZnVuY3Rpb24gZG4odCl7YW4uZGVidWcmJmNvbnNvbGUubG9nKGBbQU5SIFdvcmtlcl0gJHt0fWApfXZhciBsbixnbixtbjtjb25zdCB5bj1mdW5jdGlvbih0KXtsZXQgbjt0cnl7bj1uZXcgVVJMKHQudXJsKX1jYXRjaChuKXtyZXR1cm4gYigoKT0+e2NvbnNvbGUud2FybigiW0BzZW50cnkvbm9kZV06IEludmFsaWQgZHNuIG9yIHR1bm5lbCBvcHRpb24sIHdpbGwgbm90IHNlbmQgYW55IGV2ZW50cy4gVGhlIHR1bm5lbCBvcHRpb24gbXVzdCBiZSBhIGZ1bGwgVVJMIHdoZW4gdXNlZC4iKX0pLEt0KHQsKCk9PlByb21pc2UucmVzb2x2ZSh7fSkpfWNvbnN0IGU9Imh0dHBzOiI9PT1uLnByb3RvY29sLHI9ZnVuY3Rpb24odCxuKXtjb25zdHtub19wcm94eTplfT1wcm9jZXNzLmVudixyPWU/LnNwbGl0KCIsIikuc29tZShuPT50Lmhvc3QuZW5kc1dpdGgobil8fHQuaG9zdG5hbWUuZW5kc1dpdGgobikpO3JldHVybiByP3ZvaWQgMDpufShuLHQucHJveHl8fChlP3Byb2Nlc3MuZW52Lmh0dHBzX3Byb3h5OnZvaWQgMCl8fHByb2Nlc3MuZW52Lmh0dHBfcHJveHkpLG89ZT9zOmksYT12b2lkIDAhPT10LmtlZXBBbGl2ZSYmdC5rZWVwQWxpdmUsZj1yP25ldyBvbihyKTpuZXcgby5BZ2VudCh7a2VlcEFsaXZlOmEsbWF4U29ja2V0czozMCx0aW1lb3V0OjJlM30pLGg9ZnVuY3Rpb24odCxuLGUpe2NvbnN0e2hvc3RuYW1lOnIscGF0aG5hbWU6byxwb3J0OmkscHJvdG9jb2w6cyxzZWFyY2g6YX09bmV3IFVSTCh0LnVybCk7cmV0dXJuIGZ1bmN0aW9uKGYpe3JldHVybiBuZXcgUHJvbWlzZSgoaCxwKT0+e0Z0KCgpPT57bGV0IGQ9ZnVuY3Rpb24odCl7cmV0dXJuIG5ldyBjKHtyZWFkKCl7dGhpcy5wdXNoKHQpLHRoaXMucHVzaChudWxsKX19KX0oZi5ib2R5KTtjb25zdCBsPXsuLi50LmhlYWRlcnN9O2YuYm9keS5sZW5ndGg+MzI3NjgmJihsWyJjb250ZW50LWVuY29kaW5nIl09Imd6aXAiLGQ9ZC5waXBlKHUoKSkpO2NvbnN0IGc9ci5zdGFydHNXaXRoKCJbIiksbT1uLnJlcXVlc3Qoe21ldGhvZDoiUE9TVCIsYWdlbnQ6ZSxoZWFkZXJzOmwsaG9zdG5hbWU6Zz9yLnNsaWNlKDEsLTEpOnIscGF0aDpgJHtvfSR7YX1gLHBvcnQ6aSxwcm90b2NvbDpzLGNhOnQuY2FDZXJ0c30sdD0+e3Qub24oImRhdGEiLCgpPT57fSksdC5vbigiZW5kIiwoKT0+e30pLHQuc2V0RW5jb2RpbmcoInV0ZjgiKTtjb25zdCBuPXQuaGVhZGVyc1sicmV0cnktYWZ0ZXIiXT8/bnVsbCxlPXQuaGVhZGVyc1sieC1zZW50cnktcmF0ZS1saW1pdHMiXT8/bnVsbDtoKHtzdGF0dXNDb2RlOnQuc3RhdHVzQ29kZSxoZWFkZXJzOnsicmV0cnktYWZ0ZXIiOm4sIngtc2VudHJ5LXJhdGUtbGltaXRzIjpBcnJheS5pc0FycmF5KGUpP2VbMF18fG51bGw6ZX19KX0pO20ub24oImVycm9yIixwKSxkLnBpcGUobSl9KX0pfX0odCx0Lmh0dHBNb2R1bGU/P28sZik7cmV0dXJuIEt0KHQsaCl9KHt1cmw6KGxuPWFuLmRzbixnbj1hbi50dW5uZWwsbW49YW4uc2RrTWV0YWRhdGEuc2RrLGdufHxgJHtmdW5jdGlvbih0KXtyZXR1cm5gJHtmdW5jdGlvbih0KXtjb25zdCBuPXQucHJvdG9jb2w/YCR7dC5wcm90b2NvbH06YDoiIixlPXQucG9ydD9gOiR7dC5wb3J0fWA6IiI7cmV0dXJuYCR7bn0vLyR7dC5ob3N0fSR7ZX0ke3QucGF0aD9gLyR7dC5wYXRofWA6IiJ9L2FwaS9gfSh0KX0ke3QucHJvamVjdElkfS9lbnZlbG9wZS9gfShsbil9PyR7ZnVuY3Rpb24odCxuKXtjb25zdCBlPXtzZW50cnlfdmVyc2lvbjoiNyJ9O3JldHVybiB0LnB1YmxpY0tleSYmKGUuc2VudHJ5X2tleT10LnB1YmxpY0tleSksbiYmKGUuc2VudHJ5X2NsaWVudD1gJHtuLm5hbWV9LyR7bi52ZXJzaW9ufWApLG5ldyBVUkxTZWFyY2hQYXJhbXMoZSkudG9TdHJpbmcoKX0obG4sbW4pfWApfSk7YXN5bmMgZnVuY3Rpb24gYm4oKXtpZihmbil7ZG4oIlNlbmRpbmcgYWJub3JtYWwgc2Vzc2lvbiIpLFEoZm4se3N0YXR1czoiYWJub3JtYWwiLGFibm9ybWFsX21lY2hhbmlzbToiYW5yX2ZvcmVncm91bmQiLHJlbGVhc2U6YW4ucmVsZWFzZSxlbnZpcm9ubWVudDphbi5lbnZpcm9ubWVudH0pO2NvbnN0IHQ9ZnVuY3Rpb24odCxuLGUscil7Y29uc3Qgbz1MdChlKTtyZXR1cm4gVHQoe3NlbnRfYXQ6bmV3IERhdGUoTCgpKS50b0lTT1N0cmluZygpLC4uLm8mJntzZGs6b30sLi4uISFyJiZuJiZ7ZHNuOmJ0KG4pfX0sWyJhZ2dyZWdhdGVzImluIHQ/W3t0eXBlOiJzZXNzaW9ucyJ9LHRdOlt7dHlwZToic2Vzc2lvbiJ9LHQudG9KU09OKCldXSl9KGZuLGFuLmRzbixhbi5zZGtNZXRhZGF0YSxhbi50dW5uZWwpO2RuKEpTT04uc3RyaW5naWZ5KHQpKSxhd2FpdCB5bi5zZW5kKHQpO3RyeXtlPy5wb3N0TWVzc2FnZSgic2Vzc2lvbi1lbmRlZCIpfWNhdGNoe319fWZ1bmN0aW9uIHZuKHQpe2lmKCF0KXJldHVybjtjb25zdCBuPWZ1bmN0aW9uKHQpe2lmKCF0Lmxlbmd0aClyZXR1cm5bXTtjb25zdCBuPUFycmF5LmZyb20odCk7cmV0dXJuL3NlbnRyeVdyYXBwZWQvLnRlc3QoRShuKS5mdW5jdGlvbnx8IiIpJiZuLnBvcCgpLG4ucmV2ZXJzZSgpLCQudGVzdChFKG4pLmZ1bmN0aW9ufHwiIikmJihuLnBvcCgpLCQudGVzdChFKG4pLmZ1bmN0aW9ufHwiIikmJm4ucG9wKCkpLG4uc2xpY2UoMCw1MCkubWFwKHQ9Pih7Li4udCxmaWxlbmFtZTp0LmZpbGVuYW1lfHxFKG4pLmZpbGVuYW1lLGZ1bmN0aW9uOnQuZnVuY3Rpb258fCI/In0pKX0odCk7aWYoYW4uYXBwUm9vdFBhdGgpZm9yKGNvbnN0IHQgb2Ygbil0LmZpbGVuYW1lJiYodC5maWxlbmFtZT1KKHQuZmlsZW5hbWUsYW4uYXBwUm9vdFBhdGgpKTtyZXR1cm4gbn1hc3luYyBmdW5jdGlvbiBfbih0LG4pe2lmKGhuPj1hbi5tYXhBbnJFdmVudHMpcmV0dXJuO2huKz0xLGF3YWl0IGJuKCksZG4oIlNlbmRpbmcgZXZlbnQiKTtjb25zdCBlPXtldmVudF9pZDpIKCksY29udGV4dHM6YW4uY29udGV4dHMscmVsZWFzZTphbi5yZWxlYXNlLGVudmlyb25tZW50OmFuLmVudmlyb25tZW50LGRpc3Q6YW4uZGlzdCxwbGF0Zm9ybToibm9kZSIsbGV2ZWw6ImVycm9yIixleGNlcHRpb246e3ZhbHVlczpbe3R5cGU6IkFwcGxpY2F0aW9uTm90UmVzcG9uZGluZyIsdmFsdWU6YEFwcGxpY2F0aW9uIE5vdCBSZXNwb25kaW5nIGZvciBhdCBsZWFzdCAke2FuLmFuclRocmVzaG9sZH0gbXNgLHN0YWNrdHJhY2U6e2ZyYW1lczp2bih0KX0sbWVjaGFuaXNtOnt0eXBlOiJBTlIifX1dfSx0YWdzOmFuLnN0YXRpY1RhZ3N9O24mJmZ1bmN0aW9uKHQsbil7aWYoR3QodCxuKSwhdC5jb250ZXh0cz8udHJhY2Upe2NvbnN0e3RyYWNlSWQ6ZSxwYXJlbnRTcGFuSWQ6cixwcm9wYWdhdGlvblNwYW5JZDpvfT1uLnByb3BhZ2F0aW9uQ29udGV4dDt0LmNvbnRleHRzPXt0cmFjZTp7dHJhY2VfaWQ6ZSxzcGFuX2lkOm98fG50KCkscGFyZW50X3NwYW5faWQ6cn0sLi4udC5jb250ZXh0c319fShlLG4pLGZ1bmN0aW9uKHQpe2lmKDA9PT1PYmplY3Qua2V5cyhwbikubGVuZ3RoKXJldHVybjtjb25zdCBuPWFuLmFwcFJvb3RQYXRoP3t9OnBuO2lmKGFuLmFwcFJvb3RQYXRoKWZvcihjb25zdFt0LGVdb2YgT2JqZWN0LmVudHJpZXMocG4pKW5bSih0LGFuLmFwcFJvb3RQYXRoKV09ZTtjb25zdCBlPW5ldyBNYXA7Zm9yKGNvbnN0IHIgb2YgdC5leGNlcHRpb24/LnZhbHVlc3x8W10pZm9yKGNvbnN0IHQgb2Ygci5zdGFja3RyYWNlPy5mcmFtZXN8fFtdKXtjb25zdCByPXQuYWJzX3BhdGh8fHQuZmlsZW5hbWU7ciYmbltyXSYmZS5zZXQocixuW3JdKX1pZihlLnNpemU+MCl7Y29uc3Qgbj1bXTtmb3IoY29uc3RbdCxyXW9mIGUuZW50cmllcygpKW4ucHVzaCh7dHlwZToic291cmNlbWFwIixjb2RlX2ZpbGU6dCxkZWJ1Z19pZDpyfSk7dC5kZWJ1Z19tZXRhPXtpbWFnZXM6bn19fShlKTtjb25zdCByPU10KGUsYW4uZHNuLGFuLnNka01ldGFkYXRhLGFuLnR1bm5lbCk7ZG4oSlNPTi5zdHJpbmdpZnkocikpLGF3YWl0IHluLnNlbmQociksYXdhaXQgeW4uZmx1c2goMmUzKSxobj49YW4ubWF4QW5yRXZlbnRzJiZzZXRUaW1lb3V0KCgpPT57cHJvY2Vzcy5leGl0KDApfSw1ZTMpfWxldCBTbjtpZihkbigiU3RhcnRlZCIpLGFuLmNhcHR1cmVTdGFja1RyYWNlKXtkbigiQ29ubmVjdGluZyB0byBkZWJ1Z2dlciIpO2NvbnN0IG49bmV3IHQ7bi5jb25uZWN0VG9NYWluVGhyZWFkKCksZG4oIkNvbm5lY3RlZCB0byBkZWJ1Z2dlciIpO2NvbnN0IGU9bmV3IE1hcDtuLm9uKCJEZWJ1Z2dlci5zY3JpcHRQYXJzZWQiLHQ9PntlLnNldCh0LnBhcmFtcy5zY3JpcHRJZCx0LnBhcmFtcy51cmwpfSksbi5vbigiRGVidWdnZXIucGF1c2VkIix0PT57aWYoIm90aGVyIj09PXQucGFyYW1zLnJlYXNvbil0cnl7ZG4oIkRlYnVnZ2VyIHBhdXNlZCIpO2NvbnN0IGk9Wy4uLnQucGFyYW1zLmNhbGxGcmFtZXNdLHM9YW4uYXBwUm9vdFBhdGg/ZnVuY3Rpb24odD0ocHJvY2Vzcy5hcmd2WzFdP3F0KHByb2Nlc3MuYXJndlsxXSk6cHJvY2Vzcy5jd2QoKSksbj0iXFwiPT09byl7Y29uc3QgZT1uP3VuKHQpOnQ7cmV0dXJuIHQ9PntpZighdClyZXR1cm47Y29uc3Qgbz1uP3VuKHQpOnQ7bGV0e2RpcjppLGJhc2U6cyxleHQ6Y309ci5wYXJzZShvKTsiLmpzIiE9PWMmJiIubWpzIiE9PWMmJiIuY2pzIiE9PWN8fChzPXMuc2xpY2UoMCwtMSpjLmxlbmd0aCkpO2NvbnN0IHU9ZGVjb2RlVVJJQ29tcG9uZW50KHMpO2l8fChpPSIuIik7Y29uc3QgYT1pLmxhc3RJbmRleE9mKCIvbm9kZV9tb2R1bGVzIik7aWYoYT4tMSlyZXR1cm5gJHtpLnNsaWNlKGErMTQpLnJlcGxhY2UoL1wvL2csIi4iKX06JHt1fWA7aWYoaS5zdGFydHNXaXRoKGUpKXtjb25zdCB0PWkuc2xpY2UoZS5sZW5ndGgrMSkucmVwbGFjZSgvXC8vZywiLiIpO3JldHVybiB0P2Ake3R9OiR7dX1gOnV9cmV0dXJuIHV9fShhbi5hcHBSb290UGF0aCk6KCk9Pnt9LGM9aS5tYXAodD0+ZnVuY3Rpb24odCxuLGUpe2NvbnN0IHI9bj9uLnJlcGxhY2UoL15maWxlOlwvXC8vLCIiKTp2b2lkIDAsbz10LmxvY2F0aW9uLmNvbHVtbk51bWJlcj90LmxvY2F0aW9uLmNvbHVtbk51bWJlcisxOnZvaWQgMCxpPXQubG9jYXRpb24ubGluZU51bWJlcj90LmxvY2F0aW9uLmxpbmVOdW1iZXIrMTp2b2lkIDA7cmV0dXJue2ZpbGVuYW1lOnIsbW9kdWxlOmUociksZnVuY3Rpb246dC5mdW5jdGlvbk5hbWV8fCI/Iixjb2xubzpvLGxpbmVubzppLGluX2FwcDpyP1Z0KHIpOnZvaWQgMH19KHQsZS5nZXQodC5sb2NhdGlvbi5zY3JpcHRJZCkscykpLHU9c2V0VGltZW91dCgoKT0+e19uKGMpLnRoZW4obnVsbCwoKT0+e2RuKCJTZW5kaW5nIEFOUiBldmVudCBmYWlsZWQuIil9KX0sNWUzKTtuLnBvc3QoIlJ1bnRpbWUuZXZhbHVhdGUiLHtleHByZXNzaW9uOiJnbG9iYWwuX19TRU5UUllfR0VUX1NDT1BFU19fKCk7IixzaWxlbnQ6ITAscmV0dXJuQnlWYWx1ZTohMH0sKHQsZSk9Pnt0JiZkbihgRXJyb3IgZXhlY3V0aW5nIHNjcmlwdDogJyR7dC5tZXNzYWdlfSdgKSxjbGVhclRpbWVvdXQodSk7Y29uc3Qgcj1lPy5yZXN1bHQ/ZS5yZXN1bHQudmFsdWU6dm9pZCAwO24ucG9zdCgiRGVidWdnZXIucmVzdW1lIiksbi5wb3N0KCJEZWJ1Z2dlci5kaXNhYmxlIiksX24oYyxyKS50aGVuKG51bGwsKCk9PntkbigiU2VuZGluZyBBTlIgZXZlbnQgZmFpbGVkLiIpfSl9KX1jYXRjaCh0KXt0aHJvdyBuLnBvc3QoIkRlYnVnZ2VyLnJlc3VtZSIpLG4ucG9zdCgiRGVidWdnZXIuZGlzYWJsZSIpLHR9fSksU249KCk9Pnt0cnl7bi5wb3N0KCJEZWJ1Z2dlci5lbmFibGUiLCgpPT57bi5wb3N0KCJEZWJ1Z2dlci5wYXVzZSIpfSl9Y2F0Y2h7fX19Y29uc3R7cG9sbDp3bn09ZnVuY3Rpb24odCxuLGUscil7Y29uc3Qgbz10KCk7bGV0IGk9ITEscz0hMDtyZXR1cm4gc2V0SW50ZXJ2YWwoKCk9Pntjb25zdCB0PW8uZ2V0VGltZU1zKCk7ITE9PT1pJiZ0Pm4rZSYmKGk9ITAscyYmcigpKSx0PG4rZSYmKGk9ITEpfSwyMCkse3BvbGw6KCk9PntvLnJlc2V0KCl9LGVuYWJsZWQ6dD0+e3M9dH19fShmdW5jdGlvbigpe2xldCB0PXByb2Nlc3MuaHJ0aW1lKCk7cmV0dXJue2dldFRpbWVNczooKT0+e2NvbnN0W24sZV09cHJvY2Vzcy5ocnRpbWUodCk7cmV0dXJuIE1hdGguZmxvb3IoMWUzKm4rZS8xZTYpfSxyZXNldDooKT0+e3Q9cHJvY2Vzcy5ocnRpbWUoKX19fSxhbi5wb2xsSW50ZXJ2YWwsYW4uYW5yVGhyZXNob2xkLGZ1bmN0aW9uKCl7ZG4oIldhdGNoZG9nIHRpbWVvdXQiKSxTbj8oZG4oIlBhdXNpbmcgZGVidWdnZXIgdG8gY2FwdHVyZSBzdGFjayB0cmFjZSIpLFNuKCkpOihkbigiQ2FwdHVyaW5nIGV2ZW50IHdpdGhvdXQgYSBzdGFjayB0cmFjZSIpLF9uKCkudGhlbihudWxsLCgpPT57ZG4oIlNlbmRpbmcgQU5SIGV2ZW50IGZhaWxlZCBvbiB3YXRjaGRvZyB0aW1lb3V0LiIpfSkpfSk7ZT8ub24oIm1lc3NhZ2UiLHQ9Pnt0LnNlc3Npb24mJihmbj1WKHQuc2Vzc2lvbikpLHQuZGVidWdJbWFnZXMmJihwbj10LmRlYnVnSW1hZ2VzKSx3bigpfSk7";
	const DEFAULT_INTERVAL = 50;
	const DEFAULT_HANG_THRESHOLD = 5e3;
	function log(message, ...args) {
		core.debug.log(`[ANR] ${message}`, ...args);
	}
	function globalWithScopeFetchFn() {
		return core.GLOBAL_OBJ;
	}
	function getScopeData() {
		const scope = core.getCombinedScopeData(core.getIsolationScope(), core.getCurrentScope());
		scope.attachments = [];
		scope.eventProcessors = [];
		return scope;
	}
	async function getContexts(client) {
		let event = { message: "ANR" };
		const eventHint = {};
		for (const processor of client.getEventProcessors()) {
			if (event === null) break;
			event = await processor(event, eventHint);
		}
		return event?.contexts || {};
	}
	const INTEGRATION_NAME = "Anr";
	const _anrIntegration = ((options = {}) => {
		if (nodeVersion.NODE_VERSION.major < 16 || nodeVersion.NODE_VERSION.major === 16 && nodeVersion.NODE_VERSION.minor < 17) throw new Error("ANR detection requires Node 16.17.0 or later");
		let worker;
		let client;
		const gbl = globalWithScopeFetchFn();
		gbl.__SENTRY_GET_SCOPES__ = getScopeData;
		return {
			name: INTEGRATION_NAME,
			startWorker: () => {
				if (worker) return;
				if (client) worker = _startWorker(client, options);
			},
			stopWorker: () => {
				if (worker) worker.then((stop) => {
					stop();
					worker = void 0;
				});
			},
			async setup(initClient) {
				client = initClient;
				if (options.captureStackTrace && await debug.isDebuggerEnabled()) {
					core.debug.warn("ANR captureStackTrace has been disabled because the debugger was already enabled");
					options.captureStackTrace = false;
				}
				setImmediate(() => this.startWorker());
			}
		};
	});
	const anrIntegration = core.defineIntegration(_anrIntegration);
	async function _startWorker(client, integrationOptions) {
		const dsn = client.getDsn();
		if (!dsn) return () => {};
		const contexts = await getContexts(client);
		delete contexts.app?.app_memory;
		delete contexts.device?.free_memory;
		const initOptions = client.getOptions();
		const sdkMetadata = client.getSdkMetadata() || {};
		if (sdkMetadata.sdk) sdkMetadata.sdk.integrations = initOptions.integrations.map((i) => i.name);
		const options = {
			debug: core.debug.isEnabled(),
			dsn,
			tunnel: initOptions.tunnel,
			environment: initOptions.environment || "production",
			release: initOptions.release,
			dist: initOptions.dist,
			sdkMetadata,
			appRootPath: integrationOptions.appRootPath,
			pollInterval: integrationOptions.pollInterval || DEFAULT_INTERVAL,
			anrThreshold: integrationOptions.anrThreshold || DEFAULT_HANG_THRESHOLD,
			captureStackTrace: !!integrationOptions.captureStackTrace,
			maxAnrEvents: integrationOptions.maxAnrEvents || 1,
			staticTags: integrationOptions.staticTags || {},
			contexts
		};
		if (options.captureStackTrace) {
			const inspector = await import("node:inspector");
			if (!inspector.url()) inspector.open(0);
		}
		const worker = new node_worker_threads.Worker(new URL(`data:application/javascript;base64,${base64WorkerScript}`), {
			workerData: options,
			execArgv: [],
			env: {
				...process.env,
				NODE_OPTIONS: void 0
			}
		});
		process.on("exit", () => {
			worker.terminate();
		});
		const timer = setInterval(() => {
			try {
				const currentSession = core.getIsolationScope().getSession();
				const session = currentSession ? {
					...currentSession,
					toJSON: void 0
				} : void 0;
				worker.postMessage({
					session,
					debugImages: core.getFilenameToDebugIdMap(initOptions.stackParser)
				});
			} catch {}
		}, options.pollInterval);
		timer.unref();
		worker.on("message", (msg) => {
			if (msg === "session-ended") {
				log("ANR event sent from ANR worker. Clearing session in this thread.");
				core.getIsolationScope().setSession(void 0);
			}
		});
		worker.once("error", (err) => {
			clearInterval(timer);
			log("ANR worker error", err);
		});
		worker.once("exit", (code) => {
			clearInterval(timer);
			log("ANR worker exit", code);
		});
		worker.unref();
		return () => {
			worker.terminate();
			clearInterval(timer);
		};
	}
	function disableAnrDetectionForCallback(callback) {
		const integration = core.getClient()?.getIntegrationByName(INTEGRATION_NAME);
		if (!integration) return callback();
		integration.stopWorker();
		const result = callback();
		if (isPromise(result)) return result.finally(() => integration.startWorker());
		integration.startWorker();
		return result;
	}
	exports.anrIntegration = anrIntegration;
	exports.base64WorkerScript = base64WorkerScript;
	exports.disableAnrDetectionForCallback = disableAnrDetectionForCallback;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/logs/capture.js
var require_capture = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const util$1 = __require("node:util");
	const core = require_cjs$4();
	function captureLog(level, ...args) {
		const [messageOrMessageTemplate, paramsOrAttributes, maybeAttributesOrMetadata, maybeMetadata] = args;
		if (Array.isArray(paramsOrAttributes)) {
			const attributes = { ...maybeAttributesOrMetadata };
			attributes["sentry.message.template"] = messageOrMessageTemplate;
			paramsOrAttributes.forEach((param, index) => {
				attributes[`sentry.message.parameter.${index}`] = param;
			});
			const message = util$1.format(messageOrMessageTemplate, ...paramsOrAttributes);
			core._INTERNAL_captureLog({
				level,
				message,
				attributes
			}, maybeMetadata?.scope);
		} else core._INTERNAL_captureLog({
			level,
			message: messageOrMessageTemplate,
			attributes: paramsOrAttributes
		}, maybeAttributesOrMetadata?.scope ?? maybeMetadata?.scope);
	}
	exports.captureLog = captureLog;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/logs/exports.js
var require_exports = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const capture = require_capture();
	const core = require_cjs$4();
	function trace(...args) {
		capture.captureLog("trace", ...args);
	}
	function debug(...args) {
		capture.captureLog("debug", ...args);
	}
	function info(...args) {
		capture.captureLog("info", ...args);
	}
	function warn(...args) {
		capture.captureLog("warn", ...args);
	}
	function error(...args) {
		capture.captureLog("error", ...args);
	}
	function fatal(...args) {
		capture.captureLog("fatal", ...args);
	}
	exports.fmt = core.fmt;
	exports.debug = debug;
	exports.error = error;
	exports.fatal = fatal;
	exports.info = info;
	exports.trace = trace;
	exports.warn = warn;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/integrations/nodeRuntimeMetrics.js
var require_nodeRuntimeMetrics = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const perf_hooks = __require("perf_hooks");
	const core = require_cjs$4();
	const INTEGRATION_NAME = "NodeRuntimeMetrics";
	const DEFAULT_INTERVAL_MS = 3e4;
	const MIN_COLLECTION_INTERVAL_MS = 1e3;
	const EVENT_LOOP_DELAY_RESOLUTION_MS = 10;
	function _INTERNAL_normalizeCollectionInterval(rawInterval, integrationName, defaultInterval) {
		if (!Number.isFinite(rawInterval)) {
			console.warn(`[Sentry] ${integrationName}: collectionIntervalMs (${rawInterval}) is invalid. Using default of ${defaultInterval}ms.`);
			return defaultInterval;
		}
		if (rawInterval < MIN_COLLECTION_INTERVAL_MS) {
			console.warn(`[Sentry] ${integrationName}: collectionIntervalMs (${rawInterval}) is below the minimum of ${MIN_COLLECTION_INTERVAL_MS}ms. Using minimum of ${MIN_COLLECTION_INTERVAL_MS}ms.`);
			return MIN_COLLECTION_INTERVAL_MS;
		}
		return rawInterval;
	}
	const nodeRuntimeMetricsIntegration = core.defineIntegration((options = {}) => {
		const collectionIntervalMs = _INTERNAL_normalizeCollectionInterval(options.collectionIntervalMs ?? DEFAULT_INTERVAL_MS, INTEGRATION_NAME, DEFAULT_INTERVAL_MS);
		const collect = {
			cpuUtilization: true,
			memHeapUsed: true,
			memHeapTotal: true,
			memRss: true,
			eventLoopDelayP50: true,
			eventLoopDelayP99: true,
			eventLoopUtilization: true,
			uptime: true,
			cpuTime: false,
			memExternal: false,
			eventLoopDelayMin: false,
			eventLoopDelayMax: false,
			eventLoopDelayMean: false,
			eventLoopDelayP90: false,
			...options.collect
		};
		const needsEventLoopDelay = collect.eventLoopDelayP99 || collect.eventLoopDelayMin || collect.eventLoopDelayMax || collect.eventLoopDelayMean || collect.eventLoopDelayP50 || collect.eventLoopDelayP90;
		const needsCpu = collect.cpuUtilization || collect.cpuTime;
		let intervalId;
		let prevCpuUsage;
		let prevElu;
		let prevFlushTime = 0;
		let eventLoopDelayHistogram;
		const resolutionNs = EVENT_LOOP_DELAY_RESOLUTION_MS * 1e6;
		const nsToS = (ns) => Math.max(0, (ns - resolutionNs) / 1e9);
		const METRIC_ATTRIBUTES = { attributes: { "sentry.origin": "auto.node.runtime_metrics" } };
		const METRIC_ATTRIBUTES_BYTE = {
			unit: "byte",
			attributes: { "sentry.origin": "auto.node.runtime_metrics" }
		};
		const METRIC_ATTRIBUTES_SECOND = {
			unit: "second",
			attributes: { "sentry.origin": "auto.node.runtime_metrics" }
		};
		function collectMetrics() {
			const now = core._INTERNAL_safeDateNow();
			const elapsed = now - prevFlushTime;
			if (needsCpu && prevCpuUsage !== void 0) {
				const delta = process.cpuUsage(prevCpuUsage);
				if (collect.cpuTime) {
					core.metrics.gauge("node.runtime.cpu.user", delta.user / 1e6, METRIC_ATTRIBUTES_SECOND);
					core.metrics.gauge("node.runtime.cpu.system", delta.system / 1e6, METRIC_ATTRIBUTES_SECOND);
				}
				if (collect.cpuUtilization && elapsed > 0) core.metrics.gauge("node.runtime.cpu.utilization", (delta.user + delta.system) / (elapsed * 1e3), METRIC_ATTRIBUTES);
				prevCpuUsage = process.cpuUsage();
			}
			if (collect.memRss || collect.memHeapUsed || collect.memHeapTotal || collect.memExternal) {
				const mem = process.memoryUsage();
				if (collect.memRss) core.metrics.gauge("node.runtime.mem.rss", mem.rss, METRIC_ATTRIBUTES_BYTE);
				if (collect.memHeapUsed) core.metrics.gauge("node.runtime.mem.heap_used", mem.heapUsed, METRIC_ATTRIBUTES_BYTE);
				if (collect.memHeapTotal) core.metrics.gauge("node.runtime.mem.heap_total", mem.heapTotal, METRIC_ATTRIBUTES_BYTE);
				if (collect.memExternal) {
					core.metrics.gauge("node.runtime.mem.external", mem.external, METRIC_ATTRIBUTES_BYTE);
					core.metrics.gauge("node.runtime.mem.array_buffers", mem.arrayBuffers, METRIC_ATTRIBUTES_BYTE);
				}
			}
			if (needsEventLoopDelay && eventLoopDelayHistogram) {
				if (collect.eventLoopDelayMin) core.metrics.gauge("node.runtime.event_loop.delay.min", nsToS(eventLoopDelayHistogram.min), METRIC_ATTRIBUTES_SECOND);
				if (collect.eventLoopDelayMax) core.metrics.gauge("node.runtime.event_loop.delay.max", nsToS(eventLoopDelayHistogram.max), METRIC_ATTRIBUTES_SECOND);
				if (collect.eventLoopDelayMean) core.metrics.gauge("node.runtime.event_loop.delay.mean", nsToS(eventLoopDelayHistogram.mean), METRIC_ATTRIBUTES_SECOND);
				if (collect.eventLoopDelayP50) core.metrics.gauge("node.runtime.event_loop.delay.p50", nsToS(eventLoopDelayHistogram.percentile(50)), METRIC_ATTRIBUTES_SECOND);
				if (collect.eventLoopDelayP90) core.metrics.gauge("node.runtime.event_loop.delay.p90", nsToS(eventLoopDelayHistogram.percentile(90)), METRIC_ATTRIBUTES_SECOND);
				if (collect.eventLoopDelayP99) core.metrics.gauge("node.runtime.event_loop.delay.p99", nsToS(eventLoopDelayHistogram.percentile(99)), METRIC_ATTRIBUTES_SECOND);
				eventLoopDelayHistogram.reset();
			}
			if (collect.eventLoopUtilization && prevElu !== void 0) {
				const currentElu = perf_hooks.performance.eventLoopUtilization();
				const delta = perf_hooks.performance.eventLoopUtilization(currentElu, prevElu);
				core.metrics.gauge("node.runtime.event_loop.utilization", delta.utilization, METRIC_ATTRIBUTES);
				prevElu = currentElu;
			}
			if (collect.uptime && elapsed > 0) core.metrics.count("node.runtime.process.uptime", elapsed / 1e3, METRIC_ATTRIBUTES_SECOND);
			prevFlushTime = now;
		}
		return {
			name: INTEGRATION_NAME,
			setup() {
				if (needsEventLoopDelay) {
					eventLoopDelayHistogram?.disable();
					try {
						eventLoopDelayHistogram = perf_hooks.monitorEventLoopDelay({ resolution: EVENT_LOOP_DELAY_RESOLUTION_MS });
						eventLoopDelayHistogram.enable();
					} catch {
						eventLoopDelayHistogram = void 0;
					}
				}
				if (needsCpu) prevCpuUsage = process.cpuUsage();
				if (collect.eventLoopUtilization) prevElu = perf_hooks.performance.eventLoopUtilization();
				prevFlushTime = core._INTERNAL_safeDateNow();
				if (intervalId) clearInterval(intervalId);
				intervalId = core._INTERNAL_safeUnref(setInterval(collectMetrics, collectionIntervalMs));
			}
		};
	});
	exports._INTERNAL_normalizeCollectionInterval = _INTERNAL_normalizeCollectionInterval;
	exports.nodeRuntimeMetricsIntegration = nodeRuntimeMetricsIntegration;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/integrations/winston.js
var require_winston = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const debugBuild = require_debug_build$3();
	const capture = require_capture();
	const DEFAULT_CAPTURED_LEVELS = [
		"trace",
		"debug",
		"info",
		"warn",
		"error",
		"fatal"
	];
	const LEVEL_SYMBOL = /* @__PURE__ */ Symbol.for("level");
	const MESSAGE_SYMBOL = /* @__PURE__ */ Symbol.for("message");
	const SPLAT_SYMBOL = /* @__PURE__ */ Symbol.for("splat");
	function createSentryWinstonTransport(TransportClass, sentryWinstonOptions) {
		class SentryWinstonTransport extends TransportClass {
			constructor(options) {
				super(options);
				this._levels = new Set(sentryWinstonOptions?.levels ?? DEFAULT_CAPTURED_LEVELS);
			}
			/**
			* Forwards a winston log to the Sentry SDK.
			*/
			log(info, callback) {
				try {
					setImmediate(() => {
						this.emit("logged", info);
					});
					if (!isObject(info)) return;
					const levelFromSymbol = info[LEVEL_SYMBOL];
					const { level, message, timestamp, ...attributes } = info;
					attributes[LEVEL_SYMBOL] = void 0;
					attributes[MESSAGE_SYMBOL] = void 0;
					attributes[SPLAT_SYMBOL] = void 0;
					const customLevel = sentryWinstonOptions?.customLevelMap?.[levelFromSymbol];
					const winstonLogLevel = WINSTON_LEVEL_TO_LOG_SEVERITY_LEVEL_MAP[levelFromSymbol];
					const logSeverityLevel = customLevel ?? winstonLogLevel ?? "info";
					if (this._levels.has(logSeverityLevel)) capture.captureLog(logSeverityLevel, message, {
						...attributes,
						"sentry.origin": "auto.log.winston"
					});
					else if (!customLevel && !winstonLogLevel) debugBuild.DEBUG_BUILD && core.debug.log(`Winston log level ${levelFromSymbol} is not captured by Sentry. Please add ${levelFromSymbol} to the "customLevelMap" option of the Sentry Winston transport.`);
				} catch {}
				if (callback) callback();
			}
		}
		return SentryWinstonTransport;
	}
	function isObject(anything) {
		return typeof anything === "object" && anything != null;
	}
	const WINSTON_LEVEL_TO_LOG_SEVERITY_LEVEL_MAP = {
		silly: "trace",
		debug: "debug",
		verbose: "debug",
		http: "debug",
		info: "info",
		notice: "info",
		warn: "warn",
		warning: "warn",
		error: "error",
		emerg: "fatal",
		alert: "fatal",
		crit: "fatal"
	};
	exports.createSentryWinstonTransport = createSentryWinstonTransport;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/integrations/pino.js
var require_pino = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const diagnosticsChannel = __require("node:diagnostics_channel");
	const core = require_cjs$4();
	const SENTRY_TRACK_SYMBOL = /* @__PURE__ */ Symbol("sentry-track-pino-logger");
	function getPinoKey(logger, symbolName, defaultKey) {
		const symbols = Object.getOwnPropertySymbols(logger);
		const symbolString = `Symbol(${symbolName})`;
		for (const sym of symbols) if (sym.toString() === symbolString) {
			const value = logger[sym];
			return typeof value === "string" ? value : defaultKey;
		}
		return defaultKey;
	}
	const DEFAULT_OPTIONS = {
		error: {
			levels: [],
			handled: true
		},
		log: { levels: [
			"trace",
			"debug",
			"info",
			"warn",
			"error",
			"fatal"
		] }
	};
	function stripIgnoredFields(result) {
		const { level, time, pid, hostname, ...rest } = result;
		return rest;
	}
	const _pinoIntegration = core.defineIntegration((userOptions = {}) => {
		const options = {
			autoInstrument: userOptions.autoInstrument !== false,
			error: {
				...DEFAULT_OPTIONS.error,
				...userOptions.error
			},
			log: {
				...DEFAULT_OPTIONS.log,
				...userOptions.log
			}
		};
		function shouldTrackLogger(logger) {
			const override = logger[SENTRY_TRACK_SYMBOL];
			return override === "track" || override !== "ignore" && options.autoInstrument;
		}
		return {
			name: "Pino",
			setup: (client) => {
				const enableLogs = !!client.getOptions().enableLogs;
				const integratedChannel = diagnosticsChannel.tracingChannel("pino_asJson");
				function onPinoStart(self, args, result) {
					if (!shouldTrackLogger(self)) return;
					const resultObj = stripIgnoredFields(result);
					const [captureObj, message, levelNumber] = args;
					const level = self?.levels?.labels?.[levelNumber] || "info";
					const messageKey = getPinoKey(self, "pino.messageKey", "msg");
					const logMessage = message || resultObj?.[messageKey] || "";
					if (enableLogs && options.log.levels.includes(level)) {
						const attributes = {
							...resultObj,
							"sentry.origin": "auto.log.pino",
							"pino.logger.level": levelNumber
						};
						core._INTERNAL_captureLog({
							level,
							message: logMessage,
							attributes
						});
					}
					if (options.error.levels.includes(level)) {
						const errorKey = getPinoKey(self, "pino.errorKey", "err");
						const pinoContext = {};
						for (const [key, value] of Object.entries(resultObj)) if (key !== errorKey && key !== messageKey) pinoContext[key] = value;
						if (logMessage) pinoContext[messageKey] = logMessage;
						const captureContext = {
							level: core.severityLevelFromString(level),
							contexts: { pino: pinoContext }
						};
						core.withScope((scope) => {
							scope.addEventProcessor((event) => {
								event.logger = "pino";
								core.addExceptionMechanism(event, {
									handled: options.error.handled,
									type: "auto.log.pino"
								});
								return event;
							});
							const error = captureObj[errorKey];
							if (error) {
								core.captureException(error, captureContext);
								return;
							}
							core.captureMessage(logMessage, captureContext);
						});
					}
				}
				integratedChannel.end.subscribe((data) => {
					const { instance, arguments: args, result } = data;
					onPinoStart(instance, args, JSON.parse(result));
				});
			}
		};
	});
	exports.pinoIntegration = Object.assign(_pinoIntegration, {
		trackLogger(logger) {
			if (logger && typeof logger === "object" && "levels" in logger) logger[SENTRY_TRACK_SYMBOL] = "track";
		},
		untrackLogger(logger) {
			if (logger && typeof logger === "object" && "levels" in logger) logger[SENTRY_TRACK_SYMBOL] = "ignore";
		}
	});
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/utils/addOriginToSpan.js
var require_addOriginToSpan = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	function addOriginToSpan(span, origin) {
		span.setAttribute(core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, origin);
	}
	exports.addOriginToSpan = addOriginToSpan;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/cron/common.js
var require_common = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const replacements = [
		["january", "1"],
		["february", "2"],
		["march", "3"],
		["april", "4"],
		["may", "5"],
		["june", "6"],
		["july", "7"],
		["august", "8"],
		["september", "9"],
		["october", "10"],
		["november", "11"],
		["december", "12"],
		["jan", "1"],
		["feb", "2"],
		["mar", "3"],
		["apr", "4"],
		["may", "5"],
		["jun", "6"],
		["jul", "7"],
		["aug", "8"],
		["sep", "9"],
		["oct", "10"],
		["nov", "11"],
		["dec", "12"],
		["sunday", "0"],
		["monday", "1"],
		["tuesday", "2"],
		["wednesday", "3"],
		["thursday", "4"],
		["friday", "5"],
		["saturday", "6"],
		["sun", "0"],
		["mon", "1"],
		["tue", "2"],
		["wed", "3"],
		["thu", "4"],
		["fri", "5"],
		["sat", "6"]
	];
	function replaceCronNames(cronExpression) {
		return replacements.reduce((acc, [name, replacement]) => acc.replace(new RegExp(name, "gi"), replacement), cronExpression);
	}
	exports.replaceCronNames = replaceCronNames;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/cron/cron.js
var require_cron$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const common = require_common();
	const ERROR_TEXT = "Automatic instrumentation of CronJob only supports crontab string";
	function instrumentCron(lib, monitorSlug) {
		let jobScheduled = false;
		return new Proxy(lib, {
			construct(target, args) {
				const [cronTime, onTick, onComplete, start, timeZone, ...rest] = args;
				if (typeof cronTime !== "string") throw new Error(ERROR_TEXT);
				if (jobScheduled) throw new Error(`A job named '${monitorSlug}' has already been scheduled`);
				jobScheduled = true;
				const cronString = common.replaceCronNames(cronTime);
				async function monitoredTick(context, onComplete2) {
					return core.withMonitor(monitorSlug, async () => {
						try {
							await onTick(context, onComplete2);
						} catch (e) {
							core.captureException(e, { mechanism: {
								handled: false,
								type: "auto.function.cron.instrumentCron"
							} });
							throw e;
						}
					}, {
						schedule: {
							type: "crontab",
							value: cronString
						},
						timezone: timeZone || void 0
					});
				}
				return new target(cronTime, monitoredTick, onComplete, start, timeZone, ...rest);
			},
			get(target, prop) {
				if (prop === "from") return (param) => {
					const { cronTime, onTick, timeZone } = param;
					if (typeof cronTime !== "string") throw new Error(ERROR_TEXT);
					if (jobScheduled) throw new Error(`A job named '${monitorSlug}' has already been scheduled`);
					jobScheduled = true;
					const cronString = common.replaceCronNames(cronTime);
					param.onTick = async (context, onComplete) => {
						return core.withMonitor(monitorSlug, async () => {
							try {
								await onTick(context, onComplete);
							} catch (e) {
								core.captureException(e, { mechanism: {
									handled: false,
									type: "auto.function.cron.instrumentCron"
								} });
								throw e;
							}
						}, {
							schedule: {
								type: "crontab",
								value: cronString
							},
							timezone: timeZone || void 0
						});
					};
					return target.from(param);
				};
				else return target[prop];
			}
		});
	}
	exports.instrumentCron = instrumentCron;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/cron/node-cron.js
var require_node_cron = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const common = require_common();
	function instrumentNodeCron(lib, monitorConfig = {}) {
		return new Proxy(lib, { get(target, prop) {
			if (prop === "schedule" && target.schedule) return new Proxy(target.schedule, { apply(target2, thisArg, argArray) {
				const [expression, callback, options] = argArray;
				const name = options?.name;
				const timezone = options?.timezone;
				if (!name) throw new Error("Missing \"name\" for scheduled job. A name is required for Sentry check-in monitoring.");
				const monitoredCallback = async (...args) => {
					return core.withMonitor(name, async () => {
						try {
							return await callback(...args);
						} catch (e) {
							core.captureException(e, { mechanism: {
								handled: false,
								type: "auto.function.node-cron.instrumentNodeCron"
							} });
							throw e;
						}
					}, {
						schedule: {
							type: "crontab",
							value: common.replaceCronNames(expression)
						},
						timezone,
						...monitorConfig
					});
				};
				return target2.apply(thisArg, [
					expression,
					monitoredCallback,
					options
				]);
			} });
			else return target[prop];
		} });
	}
	exports.instrumentNodeCron = instrumentNodeCron;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/cron/node-schedule.js
var require_node_schedule = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const common = require_common();
	function instrumentNodeSchedule(lib) {
		return new Proxy(lib, { get(target, prop) {
			if (prop === "scheduleJob") return new Proxy(target.scheduleJob, { apply(target2, thisArg, argArray) {
				const [nameOrExpression, expressionOrCallback, callback] = argArray;
				if (typeof nameOrExpression !== "string" || typeof expressionOrCallback !== "string" || typeof callback !== "function") throw new Error("Automatic instrumentation of 'node-schedule' requires the first parameter of 'scheduleJob' to be a job name string and the second parameter to be a crontab string");
				const monitorSlug = nameOrExpression;
				const expression = expressionOrCallback;
				async function monitoredCallback() {
					return core.withMonitor(monitorSlug, async () => {
						await callback?.();
					}, { schedule: {
						type: "crontab",
						value: common.replaceCronNames(expression)
					} });
				}
				return target2.apply(thisArg, [
					monitorSlug,
					expression,
					monitoredCallback
				]);
			} });
			return target[prop];
		} });
	}
	exports.instrumentNodeSchedule = instrumentNodeSchedule;
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/cron/index.js
var require_cron = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const cron$1 = require_cron$1();
	const nodeCron = require_node_cron();
	const nodeSchedule = require_node_schedule();
	exports.cron = {
		instrumentCron: cron$1.instrumentCron,
		instrumentNodeCron: nodeCron.instrumentNodeCron,
		instrumentNodeSchedule: nodeSchedule.instrumentNodeSchedule
	};
}));
//#endregion
//#region node_modules/@sentry/node-core/build/cjs/index.js
var require_cjs$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const index$3 = require_http$2();
	const httpServerSpansIntegration = require_httpServerSpansIntegration();
	const httpServerIntegration = require_httpServerIntegration();
	const SentryHttpInstrumentation = require_SentryHttpInstrumentation();
	const index$5 = require_node_fetch$1();
	const SentryNodeFetchInstrumentation = require_SentryNodeFetchInstrumentation();
	const contextManager = require_contextManager();
	const logger = require_logger();
	const instrument = require_instrument();
	const index$2 = require_sdk$1();
	const scope = require_scope();
	const client = require_client();
	const ensureIsWrapped = require_ensureIsWrapped();
	const processSession = require_processSession();
	const opentelemetry = require_cjs$3();
	const index = require_anr();
	const core = require_cjs$4();
	const exports$1 = require_exports();
	const context = require_context();
	const nodeRuntimeMetrics = require_nodeRuntimeMetrics();
	const contextlines = require_contextlines();
	const index$4 = require_local_variables();
	const modules = require_modules();
	const onuncaughtexception = require_onuncaughtexception();
	const onunhandledrejection = require_onunhandledrejection();
	const spotlight = require_spotlight$1();
	const systemError = require_systemError();
	const childProcess = require_childProcess();
	const winston = require_winston();
	const pino = require_pino();
	const console = require_console();
	const api = require_api();
	const module$1 = require_module();
	const addOriginToSpan = require_addOriginToSpan();
	const esmLoader = require_esmLoader();
	const detection = require_detection();
	const createMissingInstrumentationContext = require_createMissingInstrumentationContext();
	const http = require_http$1();
	const index$1 = require_cron();
	const nodeVersion = require_nodeVersion();
	exports.httpIntegration = index$3.httpIntegration;
	exports.httpServerSpansIntegration = httpServerSpansIntegration.httpServerSpansIntegration;
	exports.httpServerIntegration = httpServerIntegration.httpServerIntegration;
	exports.SentryHttpInstrumentation = SentryHttpInstrumentation.SentryHttpInstrumentation;
	exports.nativeNodeFetchIntegration = index$5.nativeNodeFetchIntegration;
	exports.SentryNodeFetchInstrumentation = SentryNodeFetchInstrumentation.SentryNodeFetchInstrumentation;
	exports.SentryContextManager = contextManager.SentryContextManager;
	exports.setupOpenTelemetryLogger = logger.setupOpenTelemetryLogger;
	exports.INSTRUMENTED = instrument.INSTRUMENTED;
	exports.generateInstrumentOnce = instrument.generateInstrumentOnce;
	exports.instrumentWhenWrapped = instrument.instrumentWhenWrapped;
	exports.getDefaultIntegrations = index$2.getDefaultIntegrations;
	exports.init = index$2.init;
	exports.initWithoutDefaultIntegrations = index$2.initWithoutDefaultIntegrations;
	exports.validateOpenTelemetrySetup = index$2.validateOpenTelemetrySetup;
	exports.setIsolationScope = scope.setIsolationScope;
	exports.NodeClient = client.NodeClient;
	exports.ensureIsWrapped = ensureIsWrapped.ensureIsWrapped;
	exports.processSessionIntegration = processSession.processSessionIntegration;
	exports.setNodeAsyncContextStrategy = opentelemetry.setOpenTelemetryContextAsyncContextStrategy;
	exports.anrIntegration = index.anrIntegration;
	exports.disableAnrDetectionForCallback = index.disableAnrDetectionForCallback;
	exports.SDK_VERSION = core.SDK_VERSION;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_OP = core.SEMANTIC_ATTRIBUTE_SENTRY_OP;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN = core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE = core.SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE = core.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE;
	exports.Scope = core.Scope;
	exports.addBreadcrumb = core.addBreadcrumb;
	exports.addEventProcessor = core.addEventProcessor;
	exports.addIntegration = core.addIntegration;
	exports.bindScopeToEmitter = core.bindScopeToEmitter;
	exports.captureCheckIn = core.captureCheckIn;
	exports.captureConsoleIntegration = core.captureConsoleIntegration;
	exports.captureEvent = core.captureEvent;
	exports.captureException = core.captureException;
	exports.captureFeedback = core.captureFeedback;
	exports.captureMessage = core.captureMessage;
	exports.captureSession = core.captureSession;
	exports.close = core.close;
	exports.consoleLoggingIntegration = core.consoleLoggingIntegration;
	exports.continueTrace = core.continueTrace;
	exports.createConsolaReporter = core.createConsolaReporter;
	exports.createTransport = core.createTransport;
	exports.dedupeIntegration = core.dedupeIntegration;
	exports.endSession = core.endSession;
	exports.envToBool = core.envToBool;
	exports.eventFiltersIntegration = core.eventFiltersIntegration;
	exports.extraErrorDataIntegration = core.extraErrorDataIntegration;
	exports.featureFlagsIntegration = core.featureFlagsIntegration;
	exports.flush = core.flush;
	exports.functionToStringIntegration = core.functionToStringIntegration;
	exports.getActiveSpan = core.getActiveSpan;
	exports.getClient = core.getClient;
	exports.getCurrentScope = core.getCurrentScope;
	exports.getGlobalScope = core.getGlobalScope;
	exports.getIsolationScope = core.getIsolationScope;
	exports.getRequestUrl = core.getRequestUrl;
	exports.getRootSpan = core.getRootSpan;
	exports.getSpanDescendants = core.getSpanDescendants;
	exports.getSpanStatusFromHttpCode = core.getSpanStatusFromHttpCode;
	exports.getTraceData = core.getTraceData;
	exports.getTraceMetaTags = core.getTraceMetaTags;
	exports.inboundFiltersIntegration = core.inboundFiltersIntegration;
	exports.instrumentSupabaseClient = core.instrumentSupabaseClient;
	exports.isEnabled = core.isEnabled;
	exports.isInitialized = core.isInitialized;
	exports.lastEventId = core.lastEventId;
	exports.linkedErrorsIntegration = core.linkedErrorsIntegration;
	exports.metrics = core.metrics;
	exports.parameterize = core.parameterize;
	exports.profiler = core.profiler;
	exports.requestDataIntegration = core.requestDataIntegration;
	exports.rewriteFramesIntegration = core.rewriteFramesIntegration;
	exports.setAttribute = core.setAttribute;
	exports.setAttributes = core.setAttributes;
	exports.setContext = core.setContext;
	exports.setCurrentClient = core.setCurrentClient;
	exports.setExtra = core.setExtra;
	exports.setExtras = core.setExtras;
	exports.setHttpStatus = core.setHttpStatus;
	exports.setMeasurement = core.setMeasurement;
	exports.setTag = core.setTag;
	exports.setTags = core.setTags;
	exports.setUser = core.setUser;
	exports.spanStreamingIntegration = core.spanStreamingIntegration;
	exports.spanToBaggageHeader = core.spanToBaggageHeader;
	exports.spanToJSON = core.spanToJSON;
	exports.spanToTraceHeader = core.spanToTraceHeader;
	exports.startInactiveSpan = core.startInactiveSpan;
	exports.startNewTrace = core.startNewTrace;
	exports.startSession = core.startSession;
	exports.startSpan = core.startSpan;
	exports.startSpanManual = core.startSpanManual;
	exports.supabaseIntegration = core.supabaseIntegration;
	exports.suppressTracing = core.suppressTracing;
	exports.trpcMiddleware = core.trpcMiddleware;
	exports.updateSpanName = core.updateSpanName;
	exports.withActiveSpan = core.withActiveSpan;
	exports.withIsolationScope = core.withIsolationScope;
	exports.withMonitor = core.withMonitor;
	exports.withScope = core.withScope;
	exports.withStreamedSpan = core.withStreamedSpan;
	exports.wrapMcpServerWithSentry = core.wrapMcpServerWithSentry;
	exports.zodErrorsIntegration = core.zodErrorsIntegration;
	exports.logger = exports$1;
	exports.nodeContextIntegration = context.nodeContextIntegration;
	exports._INTERNAL_normalizeCollectionInterval = nodeRuntimeMetrics._INTERNAL_normalizeCollectionInterval;
	exports.nodeRuntimeMetricsIntegration = nodeRuntimeMetrics.nodeRuntimeMetricsIntegration;
	exports.contextLinesIntegration = contextlines.contextLinesIntegration;
	exports.localVariablesIntegration = index$4.localVariablesIntegration;
	exports.modulesIntegration = modules.modulesIntegration;
	exports.onUncaughtExceptionIntegration = onuncaughtexception.onUncaughtExceptionIntegration;
	exports.onUnhandledRejectionIntegration = onunhandledrejection.onUnhandledRejectionIntegration;
	exports.spotlightIntegration = spotlight.spotlightIntegration;
	exports.systemErrorIntegration = systemError.systemErrorIntegration;
	exports.childProcessIntegration = childProcess.childProcessIntegration;
	exports.createSentryWinstonTransport = winston.createSentryWinstonTransport;
	exports.pinoIntegration = pino.pinoIntegration;
	exports.consoleIntegration = console.consoleIntegration;
	exports.defaultStackParser = api.defaultStackParser;
	exports.getSentryRelease = api.getSentryRelease;
	exports.createGetModuleFromFilename = module$1.createGetModuleFromFilename;
	exports.addOriginToSpan = addOriginToSpan.addOriginToSpan;
	exports.initializeEsmLoader = esmLoader.initializeEsmLoader;
	exports.isCjs = detection.isCjs;
	exports.createMissingInstrumentationContext = createMissingInstrumentationContext.createMissingInstrumentationContext;
	exports.makeNodeTransport = http.makeNodeTransport;
	exports.cron = index$1.cron;
	exports.NODE_VERSION = nodeVersion.NODE_VERSION;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/http.js
var require_http = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const nodeCore = require_cjs$2();
	const INTEGRATION_NAME = "Http";
	const instrumentSentryHttp = nodeCore.generateInstrumentOnce(`${INTEGRATION_NAME}.sentry`, (options) => {
		return new nodeCore.SentryHttpInstrumentation(options);
	});
	exports.httpIntegration = core.defineIntegration((options = {}) => {
		const spans = options.spans ?? true;
		const disableIncomingRequestSpans = options.disableIncomingRequestSpans;
		const enableServerSpans = spans && !disableIncomingRequestSpans;
		const serverOptions = {
			sessions: options.trackIncomingRequestsAsSessions,
			sessionFlushingDelayMS: options.sessionFlushingDelayMS,
			ignoreRequestBody: options.ignoreIncomingRequestBody,
			maxRequestBodySize: options.maxIncomingRequestBodySize
		};
		const serverSpansOptions = {
			ignoreIncomingRequests: options.ignoreIncomingRequests,
			ignoreStaticAssets: options.ignoreStaticAssets,
			ignoreStatusCodes: options.dropSpansForIncomingRequestStatusCodes,
			instrumentation: options.instrumentation,
			onSpanCreated: options.incomingRequestSpanHook
		};
		const server = nodeCore.httpServerIntegration(serverOptions);
		const serverSpans = nodeCore.httpServerSpansIntegration(serverSpansOptions);
		return {
			name: INTEGRATION_NAME,
			setup(client) {
				const clientOptions = client.getOptions();
				if (enableServerSpans && core.hasSpansEnabled(clientOptions)) serverSpans.setup(client);
			},
			setupOnce() {
				server.setupOnce();
				instrumentSentryHttp({
					breadcrumbs: options.breadcrumbs,
					spans,
					propagateTraceInOutgoingRequests: options.tracePropagation ?? true,
					createSpansForOutgoingRequests: spans,
					ignoreOutgoingRequests: options.ignoreOutgoingRequests,
					outgoingRequestHook: (span, request) => {
						const url = core.getRequestUrlFromClientRequest(request);
						if (url.startsWith("data:")) {
							const sanitizedUrl = core.stripDataUrlContent(url);
							span.setAttribute("http.url", sanitizedUrl);
							span.setAttribute(core.SEMANTIC_ATTRIBUTE_URL_FULL, sanitizedUrl);
							span.updateName(`${request.method || "GET"} ${sanitizedUrl}`);
						}
						options.instrumentation?.requestHook?.(span, request);
					},
					outgoingResponseHook: options.instrumentation?.responseHook,
					outgoingRequestApplyCustomAttributes: options.instrumentation?.applyCustomAttributesOnSpan
				});
			},
			processEvent(event) {
				return serverSpans.processEvent(event);
			}
		};
	});
	exports.instrumentSentryHttp = instrumentSentryHttp;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/debug-build.js
var require_debug_build$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	exports.DEBUG_BUILD = typeof __SENTRY_DEBUG__ === "undefined" || __SENTRY_DEBUG__;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/node-fetch/vendored/semconv.js
var require_semconv$11 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const ATTR_HTTP_REQUEST_METHOD = "http.request.method";
	const ATTR_HTTP_REQUEST_METHOD_ORIGINAL = "http.request.method_original";
	const ATTR_HTTP_RESPONSE_STATUS_CODE = "http.response.status_code";
	const ATTR_NETWORK_PEER_ADDRESS = "network.peer.address";
	const ATTR_NETWORK_PEER_PORT = "network.peer.port";
	const ATTR_SERVER_ADDRESS = "server.address";
	const ATTR_SERVER_PORT = "server.port";
	const ATTR_URL_FULL = "url.full";
	const ATTR_URL_PATH = "url.path";
	const ATTR_URL_QUERY = "url.query";
	const ATTR_URL_SCHEME = "url.scheme";
	const ATTR_USER_AGENT_ORIGINAL = "user_agent.original";
	exports.ATTR_HTTP_REQUEST_METHOD = ATTR_HTTP_REQUEST_METHOD;
	exports.ATTR_HTTP_REQUEST_METHOD_ORIGINAL = ATTR_HTTP_REQUEST_METHOD_ORIGINAL;
	exports.ATTR_HTTP_RESPONSE_STATUS_CODE = ATTR_HTTP_RESPONSE_STATUS_CODE;
	exports.ATTR_NETWORK_PEER_ADDRESS = ATTR_NETWORK_PEER_ADDRESS;
	exports.ATTR_NETWORK_PEER_PORT = ATTR_NETWORK_PEER_PORT;
	exports.ATTR_SERVER_ADDRESS = ATTR_SERVER_ADDRESS;
	exports.ATTR_SERVER_PORT = ATTR_SERVER_PORT;
	exports.ATTR_URL_FULL = ATTR_URL_FULL;
	exports.ATTR_URL_PATH = ATTR_URL_PATH;
	exports.ATTR_URL_QUERY = ATTR_URL_QUERY;
	exports.ATTR_URL_SCHEME = ATTR_URL_SCHEME;
	exports.ATTR_USER_AGENT_ORIGINAL = ATTR_USER_AGENT_ORIGINAL;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/node-fetch/vendored/undici.js
var require_undici = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const diagch = __require("diagnostics_channel");
	const url = __require("url");
	const core = require_cjs$4();
	const debugBuild = require_debug_build$2();
	const semconv = require_semconv$11();
	function safeExecute(fn, onError) {
		try {
			return fn();
		} catch (error) {
			onError(error);
			return;
		}
	}
	var UndiciInstrumentation = class {
		constructor(config = {}) {
			this._channelSubs = [];
			this._spanFromReq = /* @__PURE__ */ new WeakMap();
			this._propagationDecisionMap = new core.LRUMap(100);
			this._config = config;
		}
		disable() {
			this._channelSubs.forEach((sub) => sub.unsubscribe());
			this._channelSubs.length = 0;
		}
		/** Subscribe to the undici diagnostics channels (idempotent). */
		enable() {
			if (this._channelSubs.length > 0) return;
			this.subscribeToChannel("undici:request:create", this.onRequestCreated.bind(this));
			this.subscribeToChannel("undici:client:sendHeaders", this.onRequestHeaders.bind(this));
			this.subscribeToChannel("undici:request:headers", this.onResponseHeaders.bind(this));
			this.subscribeToChannel("undici:request:trailers", this.onDone.bind(this));
			this.subscribeToChannel("undici:request:error", this.onError.bind(this));
		}
		subscribeToChannel(diagnosticChannel, onMessage) {
			const [major = 0, minor = 0] = process.version.replace("v", "").split(".").map((n) => Number(n));
			const useNewSubscribe = major > 18 || major === 18 && minor >= 19;
			let unsubscribe;
			if (useNewSubscribe) {
				diagch.subscribe?.(diagnosticChannel, onMessage);
				unsubscribe = () => diagch.unsubscribe?.(diagnosticChannel, onMessage);
			} else {
				const channel = diagch.channel(diagnosticChannel);
				channel.subscribe(onMessage);
				unsubscribe = () => channel.unsubscribe(onMessage);
			}
			this._channelSubs.push({
				name: diagnosticChannel,
				unsubscribe
			});
		}
		parseRequestHeaders(request) {
			const result = /* @__PURE__ */ new Map();
			if (Array.isArray(request.headers)) for (let i = 0; i < request.headers.length; i += 2) {
				const key = request.headers[i];
				const value = request.headers[i + 1];
				if (typeof key === "string" && value !== void 0) result.set(key.toLowerCase(), value);
			}
			else if (typeof request.headers === "string") {
				const headers = request.headers.split("\r\n");
				for (const line of headers) {
					if (!line) continue;
					const colonIndex = line.indexOf(":");
					if (colonIndex === -1) continue;
					const key = line.substring(0, colonIndex).toLowerCase();
					const value = line.substring(colonIndex + 1).trim();
					const allValues = result.get(key);
					if (allValues && Array.isArray(allValues)) allValues.push(value);
					else if (allValues) result.set(key, [allValues, value]);
					else result.set(key, value);
				}
			}
			return result;
		}
		onRequestCreated({ request }) {
			const config = this._config;
			const enabled = config.enabled !== false;
			if (safeExecute(() => !enabled || request.method === "CONNECT" || config.ignoreRequestHook?.(request), (e) => e && debugBuild.DEBUG_BUILD && core.debug.error("caught ignoreRequestHook error: ", e))) return;
			let requestUrl;
			try {
				requestUrl = new url.URL(request.path, request.origin);
			} catch (err) {
				debugBuild.DEBUG_BUILD && core.debug.warn("could not determine url.full:", err);
				return;
			}
			const urlScheme = requestUrl.protocol.replace(":", "");
			const requestMethod = this.getRequestMethod(request.method);
			const attributes = {
				[semconv.ATTR_HTTP_REQUEST_METHOD]: requestMethod,
				[semconv.ATTR_HTTP_REQUEST_METHOD_ORIGINAL]: request.method,
				[semconv.ATTR_URL_FULL]: requestUrl.toString(),
				[semconv.ATTR_URL_PATH]: requestUrl.pathname,
				[semconv.ATTR_URL_QUERY]: requestUrl.search,
				[semconv.ATTR_URL_SCHEME]: urlScheme
			};
			const schemePorts = {
				https: "443",
				http: "80"
			};
			const serverAddress = requestUrl.hostname;
			const serverPort = requestUrl.port || schemePorts[urlScheme];
			attributes[semconv.ATTR_SERVER_ADDRESS] = serverAddress;
			if (serverPort && !isNaN(Number(serverPort))) attributes[semconv.ATTR_SERVER_PORT] = Number(serverPort);
			const userAgentValues = this.parseRequestHeaders(request).get("user-agent");
			if (userAgentValues) {
				const userAgent = Array.isArray(userAgentValues) ? userAgentValues[userAgentValues.length - 1] : userAgentValues;
				attributes[semconv.ATTR_USER_AGENT_ORIGINAL] = userAgent;
			}
			const hookAttributes = safeExecute(() => config.startSpanHook?.(request), (e) => e && debugBuild.DEBUG_BUILD && core.debug.error("caught startSpanHook error: ", e));
			if (hookAttributes) Object.entries(hookAttributes).forEach(([key, val]) => {
				attributes[key] = val;
			});
			const span = core.startInactiveSpan({
				name: requestMethod === "_OTHER" ? "HTTP" : requestMethod,
				kind: core.SPAN_KIND.CLIENT,
				attributes
			});
			safeExecute(() => config.requestHook?.(span, request), (e) => e && debugBuild.DEBUG_BUILD && core.debug.error("caught requestHook error: ", e));
			this.injectTracePropagationHeaders(span, request, requestUrl.toString());
			this._spanFromReq.set(request, span);
		}
		onRequestHeaders({ request, socket }) {
			const span = this._spanFromReq.get(request);
			if (!span) return;
			const config = this._config;
			const { remoteAddress, remotePort } = socket;
			const spanAttributes = {
				[semconv.ATTR_NETWORK_PEER_ADDRESS]: remoteAddress,
				[semconv.ATTR_NETWORK_PEER_PORT]: remotePort
			};
			if (config.headersToSpanAttributes?.requestHeaders) {
				const headersToAttribs = new Set(config.headersToSpanAttributes.requestHeaders.map((n) => n.toLowerCase()));
				const headersMap = this.parseRequestHeaders(request);
				for (const [name, value] of headersMap.entries()) if (headersToAttribs.has(name)) {
					const attrValue = Array.isArray(value) ? value : [value];
					spanAttributes[`http.request.header.${name}`] = attrValue;
				}
			}
			span.setAttributes(spanAttributes);
		}
		onResponseHeaders({ request, response }) {
			const span = this._spanFromReq.get(request);
			if (!span) return;
			const spanAttributes = { [semconv.ATTR_HTTP_RESPONSE_STATUS_CODE]: response.statusCode };
			const config = this._config;
			safeExecute(() => config.responseHook?.(span, {
				request,
				response
			}), (e) => e && debugBuild.DEBUG_BUILD && core.debug.error("caught responseHook error: ", e));
			if (config.headersToSpanAttributes?.responseHeaders) {
				const headersToAttribs = /* @__PURE__ */ new Set();
				config.headersToSpanAttributes?.responseHeaders.forEach((name) => headersToAttribs.add(name.toLowerCase()));
				for (let idx = 0; idx < response.headers.length; idx = idx + 2) {
					const nameBuf = response.headers[idx];
					const valueBuf = response.headers[idx + 1];
					if (nameBuf === void 0 || valueBuf === void 0) continue;
					const name = nameBuf.toString().toLowerCase();
					const value = valueBuf;
					if (headersToAttribs.has(name)) {
						const attrName = `http.response.header.${name}`;
						if (!Object.prototype.hasOwnProperty.call(spanAttributes, attrName)) spanAttributes[attrName] = [value.toString()];
						else spanAttributes[attrName].push(value.toString());
					}
				}
			}
			span.setAttributes(spanAttributes);
			if (response.statusCode >= 400) span.setStatus({ code: core.SPAN_STATUS_ERROR });
		}
		onDone({ request }) {
			const span = this._spanFromReq.get(request);
			if (!span) return;
			span.end();
			this._spanFromReq.delete(request);
		}
		onError({ request, error }) {
			const span = this._spanFromReq.get(request);
			if (!span) return;
			span.setStatus({
				code: core.SPAN_STATUS_ERROR,
				message: error.message
			});
			span.end();
			this._spanFromReq.delete(request);
		}
		injectTracePropagationHeaders(span, request, url) {
			const { tracePropagationTargets, propagateTraceparent } = core.getClient()?.getOptions() ?? {};
			if (!core.shouldPropagateTraceForUrl(url, tracePropagationTargets, this._propagationDecisionMap)) return;
			const addedHeaders = core.withActiveSpan(span, () => core.getTraceData({ propagateTraceparent }));
			const headerEntries = Object.entries(addedHeaders);
			for (let i = 0; i < headerEntries.length; i++) {
				const pair = headerEntries[i];
				if (!pair) continue;
				const [k, v] = pair;
				if (!v) continue;
				if (typeof request.addHeader === "function") request.addHeader(k, v);
				else if (typeof request.headers === "string") request.headers += `${k}: ${v}\r
`;
				else if (Array.isArray(request.headers)) request.headers.push(k, v);
			}
		}
		getRequestMethod(original) {
			if (original.toUpperCase() in {
				CONNECT: true,
				OPTIONS: true,
				HEAD: true,
				GET: true,
				POST: true,
				PUT: true,
				PATCH: true,
				DELETE: true,
				TRACE: true,
				QUERY: true
			}) return original.toUpperCase();
			return "_OTHER";
		}
	};
	exports.UndiciInstrumentation = UndiciInstrumentation;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/node-fetch/index.js
var require_node_fetch = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const undici = require_undici();
	const core = require_cjs$4();
	const nodeCore = require_cjs$2();
	const INTEGRATION_NAME = "NodeFetch";
	let _undiciInstrumentation;
	function instrumentNodeFetchSpans(options) {
		if (!_undiciInstrumentation) _undiciInstrumentation = new undici.UndiciInstrumentation(_getConfigWithDefaults(options));
		_undiciInstrumentation.enable();
	}
	const instrumentSentryNodeFetch = nodeCore.generateInstrumentOnce(`${INTEGRATION_NAME}.sentry`, nodeCore.SentryNodeFetchInstrumentation, (options) => {
		return options;
	});
	const _nativeNodeFetchIntegration = ((options = {}) => {
		return {
			name: "NodeFetch",
			setupOnce() {
				if (_shouldInstrumentSpans(options, core.getClient()?.getOptions())) instrumentNodeFetchSpans(options);
				instrumentSentryNodeFetch(options);
			}
		};
	});
	const nativeNodeFetchIntegration = core.defineIntegration(_nativeNodeFetchIntegration);
	function getAbsoluteUrl(origin, path = "/") {
		const url = `${origin}`;
		if (url.endsWith("/") && path.startsWith("/")) return `${url}${path.slice(1)}`;
		if (!url.endsWith("/") && !path.startsWith("/")) return `${url}/${path}`;
		return `${url}${path}`;
	}
	function _shouldInstrumentSpans(options, clientOptions = {}) {
		return typeof options.spans === "boolean" ? options.spans : !clientOptions.skipOpenTelemetrySetup && core.hasSpansEnabled(clientOptions);
	}
	function _getConfigWithDefaults(options = {}) {
		return {
			ignoreRequestHook: (request) => {
				const url = getAbsoluteUrl(request.origin, request.path);
				const _ignoreOutgoingRequests = options.ignoreOutgoingRequests;
				return !!(_ignoreOutgoingRequests && url && _ignoreOutgoingRequests(url));
			},
			startSpanHook: (request) => {
				const url = getAbsoluteUrl(request.origin, request.path);
				if (url.startsWith("data:")) {
					const sanitizedUrl = core.stripDataUrlContent(url);
					return {
						[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.otel.node_fetch",
						"http.url": sanitizedUrl,
						[core.SEMANTIC_ATTRIBUTE_URL_FULL]: sanitizedUrl,
						[core.SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME]: `${request.method || "GET"} ${sanitizedUrl}`
					};
				}
				return { [core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.otel.node_fetch" };
			},
			requestHook: options.requestHook,
			responseHook: options.responseHook,
			headersToSpanAttributes: options.headersToSpanAttributes
		};
	}
	exports._getConfigWithDefaults = _getConfigWithDefaults;
	exports.nativeNodeFetchIntegration = nativeNodeFetchIntegration;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/fs/vendored/constants.js
var require_constants$7 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const PROMISE_FUNCTIONS = [
		"access",
		"appendFile",
		"chmod",
		"chown",
		"copyFile",
		"cp",
		"lchown",
		"link",
		"lstat",
		"lutimes",
		"mkdir",
		"mkdtemp",
		"open",
		"opendir",
		"readdir",
		"readFile",
		"readlink",
		"realpath",
		"rename",
		"rm",
		"rmdir",
		"stat",
		"symlink",
		"truncate",
		"unlink",
		"utimes",
		"writeFile"
	];
	const CALLBACK_FUNCTIONS = [
		"access",
		"appendFile",
		"chmod",
		"chown",
		"copyFile",
		"cp",
		"exists",
		"lchown",
		"link",
		"lstat",
		"lutimes",
		"mkdir",
		"mkdtemp",
		"open",
		"opendir",
		"readdir",
		"readFile",
		"readlink",
		"realpath",
		"realpath.native",
		"rename",
		"rm",
		"rmdir",
		"stat",
		"symlink",
		"truncate",
		"unlink",
		"utimes",
		"writeFile"
	];
	const SYNC_FUNCTIONS = [
		"accessSync",
		"appendFileSync",
		"chmodSync",
		"chownSync",
		"copyFileSync",
		"cpSync",
		"existsSync",
		"lchownSync",
		"linkSync",
		"lstatSync",
		"lutimesSync",
		"mkdirSync",
		"mkdtempSync",
		"opendirSync",
		"openSync",
		"readdirSync",
		"readFileSync",
		"readlinkSync",
		"realpathSync",
		"realpathSync.native",
		"renameSync",
		"rmdirSync",
		"rmSync",
		"statSync",
		"symlinkSync",
		"truncateSync",
		"unlinkSync",
		"utimesSync",
		"writeFileSync"
	];
	exports.CALLBACK_FUNCTIONS = CALLBACK_FUNCTIONS;
	exports.PROMISE_FUNCTIONS = PROMISE_FUNCTIONS;
	exports.SYNC_FUNCTIONS = SYNC_FUNCTIONS;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/fs/vendored/utils.js
var require_utils$14 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	function splitTwoLevels(functionName) {
		const memberParts = functionName.split(".");
		if (memberParts.length > 1) {
			if (memberParts.length !== 2) throw Error(`Invalid member function name ${functionName}`);
			return memberParts;
		} else return [functionName];
	}
	function indexFs(fs, member) {
		if (!member) throw new Error(JSON.stringify({ member }));
		const [functionName1, functionName2] = splitTwoLevels(member);
		if (functionName2) return {
			objectToPatch: fs[functionName1],
			functionNameToPatch: functionName2
		};
		else return {
			objectToPatch: fs,
			functionNameToPatch: functionName1
		};
	}
	exports.indexFs = indexFs;
	exports.splitTwoLevels = splitTwoLevels;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/fs/vendored/instrumentation.js
var require_instrumentation$25 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const fs$6 = __require("fs");
	const util = __require("util");
	const constants = require_constants$7();
	const utils = require_utils$14();
	const SPAN_ORIGIN = "auto.file.fs";
	const SPAN_OP = "file";
	const FS_OPERATIONS_WITH_OLD_PATH_NEW_PATH = ["rename", "renameSync"];
	const FS_OPERATIONS_WITH_SRC_DEST = [
		"copyFile",
		"cp",
		"copyFileSync",
		"cpSync"
	];
	const FS_OPERATIONS_WITH_EXISTING_PATH_NEW_PATH = ["link", "linkSync"];
	const FS_OPERATIONS_WITH_PREFIX = ["mkdtemp", "mkdtempSync"];
	const FS_OPERATIONS_WITH_TARGET_PATH = ["symlink", "symlinkSync"];
	const FS_OPERATIONS_WITH_PATH_ARG = [
		"access",
		"appendFile",
		"chmod",
		"chown",
		"exists",
		"mkdir",
		"lchown",
		"lstat",
		"lutimes",
		"open",
		"opendir",
		"readdir",
		"readFile",
		"readlink",
		"realpath",
		"realpath.native",
		"rm",
		"rmdir",
		"stat",
		"truncate",
		"unlink",
		"utimes",
		"writeFile",
		"accessSync",
		"appendFileSync",
		"chmodSync",
		"chownSync",
		"existsSync",
		"lchownSync",
		"lstatSync",
		"lutimesSync",
		"opendirSync",
		"mkdirSync",
		"openSync",
		"readdirSync",
		"readFileSync",
		"readlinkSync",
		"realpathSync",
		"realpathSync.native",
		"rmdirSync",
		"rmSync",
		"statSync",
		"truncateSync",
		"unlinkSync",
		"utimesSync",
		"writeFileSync"
	];
	function getSpanAttributes(functionName, args, config) {
		const attributes = {
			[core.SEMANTIC_ATTRIBUTE_SENTRY_OP]: SPAN_OP,
			[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: SPAN_ORIGIN
		};
		if (!config.recordFilePaths) return attributes;
		if (typeof args[0] === "string" && FS_OPERATIONS_WITH_PATH_ARG.includes(functionName)) attributes["path_argument"] = args[0];
		else if (typeof args[0] === "string" && typeof args[1] === "string") {
			if (FS_OPERATIONS_WITH_TARGET_PATH.includes(functionName)) {
				attributes["target_argument"] = args[0];
				attributes["path_argument"] = args[1];
			} else if (FS_OPERATIONS_WITH_EXISTING_PATH_NEW_PATH.includes(functionName)) {
				attributes["existing_path_argument"] = args[0];
				attributes["new_path_argument"] = args[1];
			} else if (FS_OPERATIONS_WITH_SRC_DEST.includes(functionName)) {
				attributes["src_argument"] = args[0];
				attributes["dest_argument"] = args[1];
			} else if (FS_OPERATIONS_WITH_OLD_PATH_NEW_PATH.includes(functionName)) {
				attributes["old_path_argument"] = args[0];
				attributes["new_path_argument"] = args[1];
			}
		} else if (typeof args[0] === "string" && FS_OPERATIONS_WITH_PREFIX.includes(functionName)) attributes["prefix_argument"] = args[0];
		return attributes;
	}
	function patchedFunctionWithOriginalProperties(patchedFunction, original) {
		return Object.assign(patchedFunction, original);
	}
	const _patched = /* @__PURE__ */ new WeakMap();
	function _patchMethod(obj, name, wrapper) {
		const original = obj[name];
		if (typeof original !== "function") return;
		let patched = _patched.get(obj);
		if (!patched) {
			patched = /* @__PURE__ */ new Set();
			_patched.set(obj, patched);
		}
		if (patched.has(name)) return;
		patched.add(name);
		obj[name] = wrapper(original);
	}
	function _patchSyncFunction(functionName, original, config) {
		const patchedFunction = function(...args) {
			const attributes = getSpanAttributes(functionName, args, config);
			return core.startSpan({
				name: `fs.${functionName}`,
				onlyIfParent: true,
				attributes
			}, (span) => {
				try {
					return core.suppressTracing(() => original.apply(this, args));
				} catch (error) {
					recordError(span, error, config);
					throw error;
				}
			});
		};
		return patchedFunctionWithOriginalProperties(patchedFunction, original);
	}
	function _patchCallbackFunction(functionName, original, config) {
		const patchedFunction = function(...args) {
			const lastIdx = args.length - 1;
			const cb = args[lastIdx];
			if (typeof cb !== "function") return original.apply(this, args);
			const attributes = getSpanAttributes(functionName, args, config);
			const span = core.startInactiveSpan({
				name: `fs.${functionName}`,
				onlyIfParent: true,
				attributes
			});
			const parentSpan = core.getActiveSpan();
			args[lastIdx] = function(...cbArgs) {
				const error = cbArgs[0];
				if (error) recordError(span, error, config);
				span.end();
				if (parentSpan) return core.withActiveSpan(parentSpan, () => cb.apply(this, cbArgs));
				return cb.apply(this, cbArgs);
			};
			try {
				return core.suppressTracing(() => original.apply(this, args));
			} catch (error) {
				recordError(span, error, config);
				span.end();
				throw error;
			}
		};
		return patchedFunctionWithOriginalProperties(patchedFunction, original);
	}
	function _patchExistsCallbackFunction(original, config) {
		const functionName = "exists";
		const patchedFunction = function(...args) {
			const lastIdx = args.length - 1;
			const cb = args[lastIdx];
			if (typeof cb !== "function") return original.apply(this, args);
			const attributes = getSpanAttributes(functionName, args, config);
			const span = core.startInactiveSpan({
				name: `fs.${functionName}`,
				onlyIfParent: true,
				attributes
			});
			const parentSpan = core.getActiveSpan();
			args[lastIdx] = function(...cbArgs) {
				span.end();
				if (parentSpan) return core.withActiveSpan(parentSpan, () => cb.apply(this, cbArgs));
				return cb.apply(this, cbArgs);
			};
			try {
				return core.suppressTracing(() => original.apply(this, args));
			} catch (error) {
				recordError(span, error, config);
				span.end();
				throw error;
			}
		};
		const functionWithOriginalProperties = patchedFunctionWithOriginalProperties(patchedFunction, original);
		const promisified = function(path) {
			return new Promise((resolve) => functionWithOriginalProperties(path, resolve));
		};
		Object.defineProperty(promisified, "name", { value: functionName });
		Object.defineProperty(functionWithOriginalProperties, util.promisify.custom, { value: promisified });
		return functionWithOriginalProperties;
	}
	function _patchPromiseFunction(functionName, original, config) {
		const patchedFunction = async function(...args) {
			const attributes = getSpanAttributes(functionName, args, config);
			return core.startSpan({
				name: `fs.${functionName}`,
				onlyIfParent: true,
				attributes
			}, async (span) => {
				try {
					return await core.suppressTracing(() => original.apply(this, args));
				} catch (error) {
					recordError(span, error, config);
					throw error;
				}
			});
		};
		return patchedFunctionWithOriginalProperties(patchedFunction, original);
	}
	function enableFsInstrumentation(config = {}) {
		for (const fName of constants.SYNC_FUNCTIONS) {
			const { objectToPatch, functionNameToPatch } = utils.indexFs(fs$6, fName);
			_patchMethod(objectToPatch, functionNameToPatch, (original) => _patchSyncFunction(fName, original, config));
		}
		for (const fName of constants.CALLBACK_FUNCTIONS) {
			const { objectToPatch, functionNameToPatch } = utils.indexFs(fs$6, fName);
			if (fName === "exists") _patchMethod(objectToPatch, functionNameToPatch, (original) => _patchExistsCallbackFunction(original, config));
			else _patchMethod(objectToPatch, functionNameToPatch, (original) => _patchCallbackFunction(fName, original, config));
		}
		const fsPromises = fs$6.promises;
		for (const fName of constants.PROMISE_FUNCTIONS) _patchMethod(fsPromises, fName, (original) => _patchPromiseFunction(fName, original, config));
	}
	function recordError(span, error, config) {
		span.setStatus({
			code: core.SPAN_STATUS_ERROR,
			message: "internal_error"
		});
		if (config.recordErrorMessagesAsSpanAttributes && error instanceof Error) span.setAttribute("fs_error", error.message);
	}
	exports.enableFsInstrumentation = enableFsInstrumentation;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/fs/index.js
var require_fs = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const instrumentation = require_instrumentation$25();
	const INTEGRATION_NAME = "FileSystem";
	exports.fsIntegration = core.defineIntegration((options = {}) => {
		return {
			name: INTEGRATION_NAME,
			setupOnce() {
				instrumentation.enableFsInstrumentation(options);
			}
		};
	});
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/utils/setHttpServerSpanRouteAttribute.js
var require_setHttpServerSpanRouteAttribute = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	function setHttpServerSpanRouteAttribute(route) {
		const activeSpan = core.getActiveSpan();
		if (!activeSpan) return;
		const rootSpan = core.getRootSpan(activeSpan);
		if (!rootSpan) return;
		if (core.spanToJSON(rootSpan).data[core.SEMANTIC_ATTRIBUTE_SENTRY_OP] !== "http.server") return;
		rootSpan.setAttribute("http.route", route);
	}
	exports.setHttpServerSpanRouteAttribute = setHttpServerSpanRouteAttribute;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/express.js
var require_express = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const instrumentation = require_src$1();
	const nodeCore = require_cjs$2();
	const core = require_cjs$4();
	const debugBuild = require_debug_build$2();
	const setHttpServerSpanRouteAttribute = require_setHttpServerSpanRouteAttribute();
	const INTEGRATION_NAME = "Express";
	const SUPPORTED_VERSIONS = [">=4.0.0 <6"];
	function setupExpressErrorHandler(app, options) {
		core.setupExpressErrorHandler(app, options);
		nodeCore.ensureIsWrapped(app.use, "express");
	}
	const instrumentExpress = nodeCore.generateInstrumentOnce(INTEGRATION_NAME, (options) => new ExpressInstrumentation(options));
	var ExpressInstrumentation = class extends instrumentation.InstrumentationBase {
		constructor(config = {}) {
			super("sentry-express", core.SDK_VERSION, config);
		}
		init() {
			return new instrumentation.InstrumentationNodeModuleDefinition("express", SUPPORTED_VERSIONS, (express) => {
				try {
					core.patchExpressModule(express, () => ({
						...this.getConfig(),
						onRouteResolved(route) {
							if (route) setHttpServerSpanRouteAttribute.setHttpServerSpanRouteAttribute(route);
						}
					}));
				} catch (e) {
					debugBuild.DEBUG_BUILD && core.debug.error("Failed to patch express module:", e);
				}
				return express;
			}, (express) => express);
		}
	};
	const _expressIntegration = ((options) => {
		return {
			name: INTEGRATION_NAME,
			setupOnce() {
				instrumentExpress(options);
			}
		};
	});
	const expressIntegration = core.defineIntegration(_expressIntegration);
	exports.expressErrorHandler = core.expressErrorHandler;
	exports.ExpressInstrumentation = ExpressInstrumentation;
	exports.expressIntegration = expressIntegration;
	exports.instrumentExpress = instrumentExpress;
	exports.setupExpressErrorHandler = setupExpressErrorHandler;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/fastify/vendored/instrumentation.js
var require_instrumentation$24 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const dc$4 = __require("node:diagnostics_channel");
	const api = require_src();
	const semanticConventions = require_src$3();
	const instrumentation = require_src$1();
	const core = require_cjs$4();
	const setHttpServerSpanRouteAttribute = require_setHttpServerSpanRouteAttribute();
	var _a, _b;
	const PACKAGE_VERSION = core.SDK_VERSION;
	const PACKAGE_NAME = "@sentry/instrumentation-fastify";
	const SUPPORTED_VERSIONS = ">=4.0.0 <6";
	const FASTIFY_HOOKS = [
		"onRequest",
		"preParsing",
		"preValidation",
		"preHandler",
		"preSerialization",
		"onSend",
		"onResponse",
		"onError"
	];
	const ATTRIBUTE_NAMES = {
		HOOK_NAME: "hook.name",
		FASTIFY_TYPE: "fastify.type",
		HOOK_CALLBACK_NAME: "hook.callback.name",
		ROOT: "fastify.root"
	};
	const HOOK_TYPES = {
		ROUTE: "route-hook",
		INSTANCE: "hook",
		HANDLER: "request-handler"
	};
	const ANONYMOUS_FUNCTION_NAME = "anonymous";
	const kInstrumentation = /* @__PURE__ */ Symbol("fastify otel instance");
	const kRequestSpan = /* @__PURE__ */ Symbol("fastify otel request spans");
	const kRequestContext = /* @__PURE__ */ Symbol("fastify otel request context");
	const kAddHookOriginal = /* @__PURE__ */ Symbol("fastify otel addhook original");
	const kSetNotFoundOriginal = /* @__PURE__ */ Symbol("fastify otel setnotfound original");
	const kRecordExceptions = /* @__PURE__ */ Symbol("fastify otel record exceptions");
	var FastifyOtelInstrumentation = class extends (_b = instrumentation.InstrumentationBase, _a = kRecordExceptions, _b) {
		constructor(config = {}) {
			super(PACKAGE_NAME, PACKAGE_VERSION, config);
			this._otelLogger = null;
			this._requestHook = null;
			this._lifecycleHook = null;
			this._handleInitialization = void 0;
			this[_a] = true;
			this._otelLogger = api.diag.createComponentLogger({ namespace: PACKAGE_NAME });
			this[kRecordExceptions] = true;
			if (config?.recordExceptions != null) {
				if (typeof config.recordExceptions !== "boolean") throw new TypeError("recordExceptions must be a boolean");
				this[kRecordExceptions] = config.recordExceptions;
			}
			if (typeof config?.requestHook === "function") this._requestHook = config.requestHook;
			if (typeof config?.lifecycleHook === "function") this._lifecycleHook = config.lifecycleHook;
		}
		enable() {
			if (this._handleInitialization === void 0 && this.getConfig().registerOnInitialization) {
				this._handleInitialization = (message) => {
					this.plugin()(message.fastify, void 0, () => {});
					const emptyPlugin = (_, __, done) => {
						done();
					};
					emptyPlugin[/* @__PURE__ */ Symbol.for("skip-override")] = true;
					emptyPlugin[/* @__PURE__ */ Symbol.for("fastify.display-name")] = PACKAGE_NAME;
					message.fastify.register(emptyPlugin);
				};
				dc$4.subscribe("fastify.initialization", this._handleInitialization);
			}
			return super.enable();
		}
		disable() {
			if (this._handleInitialization) {
				dc$4.unsubscribe("fastify.initialization", this._handleInitialization);
				this._handleInitialization = void 0;
			}
			return super.disable();
		}
		init() {
			return [];
		}
		plugin() {
			const instrumentation = this;
			const pluginAny = FastifyInstrumentationPlugin;
			pluginAny[/* @__PURE__ */ Symbol.for("skip-override")] = true;
			pluginAny[/* @__PURE__ */ Symbol.for("fastify.display-name")] = PACKAGE_NAME;
			pluginAny[/* @__PURE__ */ Symbol.for("plugin-meta")] = {
				fastify: SUPPORTED_VERSIONS,
				name: PACKAGE_NAME
			};
			return FastifyInstrumentationPlugin;
			function FastifyInstrumentationPlugin(instance, _opts, done) {
				instance.decorate(kInstrumentation, instrumentation);
				instance.decorate(kAddHookOriginal, instance.addHook);
				instance.decorate(kSetNotFoundOriginal, instance.setNotFoundHandler);
				instance.decorateRequest("opentelemetry", function opentelemetry() {
					const ctx = this[kRequestContext];
					const span = this[kRequestSpan];
					return {
						enabled: this.routeOptions.config?.otel !== false,
						span,
						tracer: instrumentation.tracer,
						context: ctx,
						inject: (carrier, setter) => {
							return api.propagation.inject(ctx, carrier, setter);
						},
						extract: (carrier, getter) => {
							return api.propagation.extract(ctx, carrier, getter);
						}
					};
				});
				instance.decorateRequest(kRequestSpan, null);
				instance.decorateRequest(kRequestContext, null);
				instance.addHook("onRoute", function otelWireRoute(routeOptions) {
					if (routeOptions.config?.otel === false) {
						instrumentation._otelLogger.debug(`Ignoring route instrumentation ${routeOptions.method} ${routeOptions.url} because it is disabled`);
						return;
					}
					for (const hook of FASTIFY_HOOKS) if (routeOptions[hook] != null) {
						const handlerLike = routeOptions[hook];
						if (typeof handlerLike === "function") routeOptions[hook] = handlerWrapper(handlerLike, hook, {
							[ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - route -> ${hook}`,
							[ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.ROUTE,
							[semanticConventions.ATTR_HTTP_ROUTE]: routeOptions.url,
							[ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: handlerLike.name?.length > 0 ? handlerLike.name : ANONYMOUS_FUNCTION_NAME
						});
						else if (Array.isArray(handlerLike)) {
							const wrappedHandlers = [];
							for (const handler of handlerLike) wrappedHandlers.push(handlerWrapper(handler, hook, {
								[ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - route -> ${hook}`,
								[ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.ROUTE,
								[semanticConventions.ATTR_HTTP_ROUTE]: routeOptions.url,
								[ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: handler.name?.length > 0 ? handler.name : ANONYMOUS_FUNCTION_NAME
							}));
							routeOptions[hook] = wrappedHandlers;
						}
					}
					if (routeOptions.onSend != null) routeOptions.onSend = Array.isArray(routeOptions.onSend) ? [...routeOptions.onSend, finalizeResponseSpanHook] : [routeOptions.onSend, finalizeResponseSpanHook];
					else routeOptions.onSend = finalizeResponseSpanHook;
					if (routeOptions.onError != null) routeOptions.onError = Array.isArray(routeOptions.onError) ? [...routeOptions.onError, recordErrorInSpanHook] : [routeOptions.onError, recordErrorInSpanHook];
					else routeOptions.onError = recordErrorInSpanHook;
					routeOptions.handler = handlerWrapper(routeOptions.handler, "handler", {
						[ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - route-handler`,
						[ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.HANDLER,
						[semanticConventions.ATTR_HTTP_ROUTE]: routeOptions.url,
						[ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: routeOptions.handler.name.length > 0 ? routeOptions.handler.name : ANONYMOUS_FUNCTION_NAME
					});
				});
				instance.addHook("onRequest", function startRequestSpanHook(request, _reply, hookDone) {
					if (this[kInstrumentation].isEnabled() === false || request.routeOptions.config?.otel === false) return hookDone();
					let ctx = api.context.active();
					if (api.trace.getSpan(ctx) == null) ctx = api.propagation.extract(ctx, request.headers);
					if (request.routeOptions.url != null) setHttpServerSpanRouteAttribute.setHttpServerSpanRouteAttribute(request.routeOptions.url);
					const attributes = {
						[ATTRIBUTE_NAMES.ROOT]: PACKAGE_NAME,
						[semanticConventions.ATTR_HTTP_REQUEST_METHOD]: request.method,
						[semanticConventions.ATTR_URL_PATH]: request.url
					};
					if (request.routeOptions.url != null) attributes[semanticConventions.ATTR_HTTP_ROUTE] = request.routeOptions.url;
					const span = this[kInstrumentation].tracer.startSpan("request", { attributes }, ctx);
					try {
						this[kInstrumentation]._requestHook?.(span, request);
					} catch (err) {
						this[kInstrumentation]._otelLogger.error({ err }, "requestHook threw");
					}
					request[kRequestContext] = api.trace.setSpan(ctx, span);
					request[kRequestSpan] = span;
					api.context.with(request[kRequestContext], () => {
						hookDone();
					});
				});
				instance.addHook("onResponse", function finalizeNotFoundSpanHook(request, reply, hookDone) {
					const span = request[kRequestSpan];
					if (span != null) {
						span.setAttributes({ [semanticConventions.ATTR_HTTP_RESPONSE_STATUS_CODE]: reply.statusCode });
						span.end();
					}
					request[kRequestSpan] = null;
					hookDone();
				});
				instance.addHook = addHookPatched;
				instance.setNotFoundHandler = setNotFoundHandlerPatched;
				done();
				function finalizeResponseSpanHook(request, reply, payload, hookDone) {
					const span = request[kRequestSpan];
					if (span != null) {
						if (reply.statusCode >= 500) span.setStatus({ code: api.SpanStatusCode.ERROR });
						span.setAttributes({ [semanticConventions.ATTR_HTTP_RESPONSE_STATUS_CODE]: reply.statusCode });
						span.end();
					}
					request[kRequestSpan] = null;
					hookDone(null, payload);
				}
				function recordErrorInSpanHook(request, _reply, error, hookDone) {
					const span = request[kRequestSpan];
					if (span != null) {
						span.setStatus({
							code: api.SpanStatusCode.ERROR,
							message: error.message
						});
						if (instrumentation[kRecordExceptions] !== false) span.recordException(error);
					}
					hookDone();
				}
				function addHookPatched(name, hook) {
					const addHookOriginal = this[kAddHookOriginal];
					if (FASTIFY_HOOKS.includes(name)) return addHookOriginal.call(this, name, handlerWrapper(hook, name, {
						[ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - ${name}`,
						[ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.INSTANCE,
						[ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: hook.name?.length > 0 ? hook.name : ANONYMOUS_FUNCTION_NAME
					}));
					else return addHookOriginal.call(this, name, hook);
				}
				function setNotFoundHandlerPatched(hooks, handler) {
					const setNotFoundHandlerOriginal = this[kSetNotFoundOriginal];
					if (typeof hooks === "function") {
						handler = handlerWrapper(hooks, "notFoundHandler", {
							[ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - not-found-handler`,
							[ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.INSTANCE,
							[ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: hooks.name?.length > 0 ? hooks.name : ANONYMOUS_FUNCTION_NAME
						});
						setNotFoundHandlerOriginal.call(this, handler);
					} else {
						if (hooks.preValidation != null) hooks.preValidation = handlerWrapper(hooks.preValidation, "notFoundHandler - preValidation", {
							[ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - not-found-handler - preValidation`,
							[ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.INSTANCE,
							[ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: hooks.preValidation.name?.length > 0 ? hooks.preValidation.name : ANONYMOUS_FUNCTION_NAME
						});
						if (hooks.preHandler != null) hooks.preHandler = handlerWrapper(hooks.preHandler, "notFoundHandler - preHandler", {
							[ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - not-found-handler - preHandler`,
							[ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.INSTANCE,
							[ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: hooks.preHandler.name?.length > 0 ? hooks.preHandler.name : ANONYMOUS_FUNCTION_NAME
						});
						handler = handlerWrapper(handler, "notFoundHandler", {
							[ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - not-found-handler`,
							[ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.INSTANCE,
							[ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: handler.name?.length > 0 ? handler.name : ANONYMOUS_FUNCTION_NAME
						});
						setNotFoundHandlerOriginal.call(this, hooks, handler);
					}
				}
				function getRequestFromArgs(args) {
					for (const arg of args) if (arg?.routeOptions && arg.url && arg.method) return arg;
					return null;
				}
				function handlerWrapper(handler, hookName, spanAttributes = {}) {
					return function handlerWrapped(...args) {
						const instrumentation2 = this[kInstrumentation];
						const request = getRequestFromArgs(args);
						if (request === null) {
							instrumentation2._otelLogger.debug(`Ignoring route instrumentation because ${hookName} was called without a Fastify request argument`);
							return handler.call(this, ...args);
						}
						if (instrumentation2.isEnabled() === false || request.routeOptions.config?.otel === false) {
							instrumentation2._otelLogger.debug(`Ignoring route instrumentation ${request.routeOptions.method} ${request.routeOptions.url} because it is disabled`);
							return handler.call(this, ...args);
						}
						const ctx = request[kRequestContext] ?? api.context.active();
						const handlerName = handler.name?.length > 0 ? handler.name : this.pluginName ?? ANONYMOUS_FUNCTION_NAME;
						const span = instrumentation2.tracer.startSpan(`${hookName} - ${handlerName}`, { attributes: spanAttributes }, ctx);
						if (instrumentation2._lifecycleHook != null) try {
							instrumentation2._lifecycleHook(span, {
								hookName,
								request,
								handler: handlerName
							});
						} catch (err) {
							instrumentation2._otelLogger.error({ err }, "Execution of lifecycleHook failed");
						}
						return api.context.with(api.trace.setSpan(ctx, span), function() {
							try {
								const res = handler.call(this, ...args);
								if (typeof res?.then === "function") return res.then((result) => {
									span.end();
									return result;
								}, (error) => {
									span.setStatus({
										code: api.SpanStatusCode.ERROR,
										message: error.message
									});
									if (instrumentation2[kRecordExceptions] !== false) span.recordException(error);
									span.end();
									return Promise.reject(error);
								});
								span.end();
								return res;
							} catch (error) {
								span.setStatus({
									code: api.SpanStatusCode.ERROR,
									message: error.message
								});
								if (instrumentation2[kRecordExceptions] !== false) span.recordException(error);
								span.end();
								throw error;
							}
						}, this);
					};
				}
			}
		}
	};
	exports.FastifyOtelInstrumentation = FastifyOtelInstrumentation;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/fastify/v3/enums/AttributeNames.js
var require_AttributeNames$6 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	var AttributeNames = /* @__PURE__ */ ((AttributeNames2) => {
		AttributeNames2["FASTIFY_NAME"] = "fastify.name";
		AttributeNames2["FASTIFY_TYPE"] = "fastify.type";
		AttributeNames2["HOOK_NAME"] = "hook.name";
		AttributeNames2["PLUGIN_NAME"] = "plugin.name";
		return AttributeNames2;
	})(AttributeNames || {});
	var FastifyTypes = /* @__PURE__ */ ((FastifyTypes2) => {
		FastifyTypes2["MIDDLEWARE"] = "middleware";
		FastifyTypes2["REQUEST_HANDLER"] = "request_handler";
		return FastifyTypes2;
	})(FastifyTypes || {});
	var FastifyNames = /* @__PURE__ */ ((FastifyNames2) => {
		FastifyNames2["MIDDLEWARE"] = "middleware";
		FastifyNames2["REQUEST_HANDLER"] = "request handler";
		return FastifyNames2;
	})(FastifyNames || {});
	exports.AttributeNames = AttributeNames;
	exports.FastifyNames = FastifyNames;
	exports.FastifyTypes = FastifyTypes;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/fastify/v3/constants.js
var require_constants$6 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	exports.spanRequestSymbol = /* @__PURE__ */ Symbol("opentelemetry.instrumentation.fastify.request_active_span");
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/fastify/v3/utils.js
var require_utils$13 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const api = require_src();
	const constants = require_constants$6();
	function startSpan(reply, tracer, spanName, spanAttributes = {}) {
		const span = tracer.startSpan(spanName, { attributes: spanAttributes });
		const spans = reply[constants.spanRequestSymbol] || [];
		spans.push(span);
		Object.defineProperty(reply, constants.spanRequestSymbol, {
			enumerable: false,
			configurable: true,
			value: spans
		});
		return span;
	}
	function endSpan(reply, err) {
		const spans = reply[constants.spanRequestSymbol] || [];
		if (!spans.length) return;
		spans.forEach((span) => {
			if (err) {
				span.setStatus({
					code: api.SpanStatusCode.ERROR,
					message: err.message
				});
				span.recordException(err);
			}
			span.end();
		});
		delete reply[constants.spanRequestSymbol];
	}
	function safeExecuteInTheMiddleMaybePromise(execute, onFinish, preventThrowingError) {
		let error;
		let result = void 0;
		try {
			result = execute();
			if (isPromise(result)) result.then((res) => onFinish(void 0, res), (err) => onFinish(err));
		} catch (e) {
			error = e;
		} finally {
			if (!isPromise(result)) {
				onFinish(error, result);
				if (error && true) throw error;
			}
			return result;
		}
	}
	function isPromise(val) {
		return typeof val === "object" && val && typeof Object.getOwnPropertyDescriptor(val, "then")?.value === "function" || false;
	}
	exports.endSpan = endSpan;
	exports.safeExecuteInTheMiddleMaybePromise = safeExecuteInTheMiddleMaybePromise;
	exports.startSpan = startSpan;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/fastify/v3/instrumentation.js
var require_instrumentation$23 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const api = require_src();
	const instrumentation = require_src$1();
	const semanticConventions = require_src$3();
	const core = require_cjs$4();
	const setHttpServerSpanRouteAttribute = require_setHttpServerSpanRouteAttribute();
	const AttributeNames = require_AttributeNames$6();
	const utils = require_utils$13();
	const PACKAGE_VERSION = "0.1.0";
	const PACKAGE_NAME = "@sentry/instrumentation-fastify-v3";
	const ANONYMOUS_NAME = "anonymous";
	const hooksNamesToWrap = /* @__PURE__ */ new Set([
		"onTimeout",
		"onRequest",
		"preParsing",
		"preValidation",
		"preSerialization",
		"preHandler",
		"onSend",
		"onResponse",
		"onError"
	]);
	var FastifyInstrumentationV3 = class extends instrumentation.InstrumentationBase {
		constructor(config = {}) {
			super(PACKAGE_NAME, PACKAGE_VERSION, config);
		}
		init() {
			return [new instrumentation.InstrumentationNodeModuleDefinition("fastify", [">=3.0.0 <4"], (moduleExports) => {
				return this._patchConstructor(moduleExports);
			})];
		}
		_hookOnRequest() {
			const instrumentation = this;
			return function onRequest(request, reply, done) {
				if (!instrumentation.isEnabled()) return done();
				instrumentation._wrap(reply, "send", instrumentation._patchSend());
				const anyRequest = request;
				const routeName = anyRequest.routeOptions ? anyRequest.routeOptions.url : request.routerPath;
				if (routeName) setHttpServerSpanRouteAttribute.setHttpServerSpanRouteAttribute(routeName);
				const method = request.method || "GET";
				core.getIsolationScope().setTransactionName(`${method} ${routeName}`);
				done();
			};
		}
		_wrapHandler(pluginName, hookName, original, syncFunctionWithDone) {
			const instrumentation = this;
			this._diag.debug("Patching fastify route.handler function");
			return function(...args) {
				if (!instrumentation.isEnabled()) return original.apply(this, args);
				const name = original.name || pluginName || ANONYMOUS_NAME;
				const spanName = `${AttributeNames.FastifyNames.MIDDLEWARE} - ${name}`;
				const reply = args[1];
				const span = utils.startSpan(reply, instrumentation.tracer, spanName, {
					[AttributeNames.AttributeNames.FASTIFY_TYPE]: AttributeNames.FastifyTypes.MIDDLEWARE,
					[AttributeNames.AttributeNames.PLUGIN_NAME]: pluginName,
					[AttributeNames.AttributeNames.HOOK_NAME]: hookName
				});
				const origDone = syncFunctionWithDone && args[args.length - 1];
				if (origDone) args[args.length - 1] = function(...doneArgs) {
					utils.endSpan(reply);
					origDone.apply(this, doneArgs);
				};
				return api.context.with(api.trace.setSpan(api.context.active(), span), () => {
					return utils.safeExecuteInTheMiddleMaybePromise(() => {
						return original.apply(this, args);
					}, (err) => {
						if (err instanceof Error) {
							span.setStatus({
								code: api.SpanStatusCode.ERROR,
								message: err.message
							});
							span.recordException(err);
						}
						if (!syncFunctionWithDone) utils.endSpan(reply);
					});
				});
			};
		}
		_wrapAddHook() {
			const instrumentation = this;
			this._diag.debug("Patching fastify server.addHook function");
			return function(original) {
				return function wrappedAddHook(...args) {
					const name = args[0];
					const handler = args[1];
					const pluginName = this.pluginName;
					if (!hooksNamesToWrap.has(name)) return original.apply(this, args);
					const syncFunctionWithDone = typeof args[args.length - 1] === "function" && handler.constructor.name !== "AsyncFunction";
					return original.apply(this, [name, instrumentation._wrapHandler(pluginName, name, handler, syncFunctionWithDone)]);
				};
			};
		}
		_patchConstructor(moduleExports) {
			const instrumentation = this;
			function fastify(...args) {
				const app = moduleExports.fastify.apply(this, args);
				app.addHook("onRequest", instrumentation._hookOnRequest());
				app.addHook("preHandler", instrumentation._hookPreHandler());
				instrumentClient();
				instrumentation._wrap(app, "addHook", instrumentation._wrapAddHook());
				return app;
			}
			if (moduleExports.errorCodes !== void 0) fastify.errorCodes = moduleExports.errorCodes;
			fastify.fastify = fastify;
			fastify.default = fastify;
			return fastify;
		}
		_patchSend() {
			const instrumentation$1 = this;
			this._diag.debug("Patching fastify reply.send function");
			return function patchSend(original) {
				return function send(...args) {
					const maybeError = args[0];
					if (!instrumentation$1.isEnabled()) return original.apply(this, args);
					return instrumentation.safeExecuteInTheMiddle(() => {
						return original.apply(this, args);
					}, (err) => {
						if (!err && maybeError instanceof Error) err = maybeError;
						utils.endSpan(this, err);
					});
				};
			};
		}
		_hookPreHandler() {
			const instrumentation$1 = this;
			this._diag.debug("Patching fastify preHandler function");
			return function preHandler(request, reply, done) {
				if (!instrumentation$1.isEnabled()) return done();
				const anyRequest = request;
				const handler = anyRequest.routeOptions?.handler || anyRequest.context?.handler;
				const handlerName = handler?.name.startsWith("bound ") ? handler.name.substring(6) : handler?.name;
				const spanName = `${AttributeNames.FastifyNames.REQUEST_HANDLER} - ${handlerName || this.pluginName || ANONYMOUS_NAME}`;
				const spanAttributes = {
					[AttributeNames.AttributeNames.PLUGIN_NAME]: this.pluginName,
					[AttributeNames.AttributeNames.FASTIFY_TYPE]: AttributeNames.FastifyTypes.REQUEST_HANDLER,
					[semanticConventions.SEMATTRS_HTTP_ROUTE]: anyRequest.routeOptions ? anyRequest.routeOptions.url : request.routerPath
				};
				if (handlerName) spanAttributes[AttributeNames.AttributeNames.FASTIFY_NAME] = handlerName;
				const span = utils.startSpan(reply, instrumentation$1.tracer, spanName, spanAttributes);
				addFastifyV3SpanAttributes(span);
				const { requestHook } = instrumentation$1.getConfig();
				if (requestHook) instrumentation.safeExecuteInTheMiddle(() => requestHook(span, { request }), (e) => {
					if (e) instrumentation$1._diag.error("request hook failed", e);
				}, true);
				return api.context.with(api.trace.setSpan(api.context.active(), span), () => {
					done();
				});
			};
		}
	};
	function instrumentClient() {
		const client = core.getClient();
		if (client) client.on("spanStart", (span) => {
			addFastifyV3SpanAttributes(span);
		});
	}
	function addFastifyV3SpanAttributes(span) {
		const attributes = core.spanToJSON(span).data;
		const type = attributes["fastify.type"];
		if (attributes[core.SEMANTIC_ATTRIBUTE_SENTRY_OP] || !type) return;
		span.setAttributes({
			[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.otel.fastify",
			[core.SEMANTIC_ATTRIBUTE_SENTRY_OP]: `${type}.fastify`
		});
		const name = attributes["fastify.name"] || attributes["plugin.name"] || attributes["hook.name"];
		if (typeof name === "string") {
			const updatedName = name.replace(/^fastify -> /, "").replace(/^@fastify\/otel -> /, "");
			span.updateName(updatedName);
		}
	}
	exports.FastifyInstrumentationV3 = FastifyInstrumentationV3;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/fastify/index.js
var require_fastify = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const dc$3 = __require("node:diagnostics_channel");
	const instrumentation$1 = require_instrumentation$24();
	const core = require_cjs$4();
	const nodeCore = require_cjs$2();
	const debugBuild = require_debug_build$2();
	const instrumentation = require_instrumentation$23();
	const INTEGRATION_NAME = "Fastify";
	const instrumentFastifyV3 = nodeCore.generateInstrumentOnce(`${INTEGRATION_NAME}.v3`, () => new instrumentation.FastifyInstrumentationV3());
	function getFastifyIntegration() {
		const client = core.getClient();
		if (!client) return;
		else return client.getIntegrationByName(INTEGRATION_NAME);
	}
	function handleFastifyError(error, request, reply, handlerOrigin) {
		const shouldHandleError = getFastifyIntegration()?.getShouldHandleError() || defaultShouldHandleError;
		if (handlerOrigin === "diagnostics-channel") this.diagnosticsChannelExists = true;
		if (this.diagnosticsChannelExists && handlerOrigin === "onError-hook") {
			debugBuild.DEBUG_BUILD && core.debug.warn("Fastify error handler was already registered via diagnostics channel.", "You can safely remove `setupFastifyErrorHandler` call and set `shouldHandleError` on the integration options.");
			return;
		}
		if (shouldHandleError(error, request, reply)) core.captureException(error, { mechanism: {
			handled: false,
			type: "auto.function.fastify"
		} });
	}
	const instrumentFastify = nodeCore.generateInstrumentOnce(`${INTEGRATION_NAME}.v5`, () => {
		const fastifyOtelInstrumentationInstance = new instrumentation$1.FastifyOtelInstrumentation();
		const plugin = fastifyOtelInstrumentationInstance.plugin();
		dc$3.subscribe("fastify.initialization", (message) => {
			const fastifyInstance = message.fastify;
			fastifyInstance?.register(plugin).after((err) => {
				if (err) debugBuild.DEBUG_BUILD && core.debug.error("Failed to setup Fastify instrumentation", err);
				else {
					instrumentClient();
					if (fastifyInstance) instrumentOnRequest(fastifyInstance);
				}
			});
		});
		dc$3.subscribe("tracing:fastify.request.handler:error", (message) => {
			const { error, request, reply } = message;
			handleFastifyError.call(handleFastifyError, error, request, reply, "diagnostics-channel");
		});
		return fastifyOtelInstrumentationInstance;
	});
	const _fastifyIntegration = (({ shouldHandleError }) => {
		let _shouldHandleError;
		return {
			name: INTEGRATION_NAME,
			setupOnce() {
				_shouldHandleError = shouldHandleError || defaultShouldHandleError;
				instrumentFastifyV3();
				instrumentFastify();
			},
			getShouldHandleError() {
				return _shouldHandleError;
			},
			setShouldHandleError(fn) {
				_shouldHandleError = fn;
			}
		};
	});
	const fastifyIntegration = core.defineIntegration((options = {}) => _fastifyIntegration(options));
	function defaultShouldHandleError(_error, _request, reply) {
		const statusCode = reply.statusCode;
		return statusCode >= 500 || statusCode <= 299;
	}
	function setupFastifyErrorHandler(fastify, options) {
		if (options?.shouldHandleError) getFastifyIntegration()?.setShouldHandleError(options.shouldHandleError);
		const plugin = Object.assign(function(fastify2, _options, done) {
			fastify2.addHook("onError", async (request, reply, error) => {
				handleFastifyError.call(handleFastifyError, error, request, reply, "onError-hook");
			});
			done();
		}, {
			[/* @__PURE__ */ Symbol.for("skip-override")]: true,
			[/* @__PURE__ */ Symbol.for("fastify.display-name")]: "sentry-fastify-error-handler"
		});
		fastify.register(plugin);
	}
	function addFastifySpanAttributes(span) {
		const spanJSON = core.spanToJSON(span);
		const spanName = spanJSON.description;
		const attributes = spanJSON.data;
		const type = attributes["fastify.type"];
		const isHook = type === "hook";
		const isHandler = type === spanName?.startsWith("handler -");
		const isRequestHandler = spanName === "request" || type === "request-handler";
		if (attributes[core.SEMANTIC_ATTRIBUTE_SENTRY_OP] || !isHandler && !isRequestHandler && !isHook) return;
		const opPrefix = isHook ? "hook" : isHandler ? "middleware" : isRequestHandler ? "request_handler" : "<unknown>";
		span.setAttributes({
			[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.otel.fastify",
			[core.SEMANTIC_ATTRIBUTE_SENTRY_OP]: `${opPrefix}.fastify`
		});
		const attrName = attributes["fastify.name"] || attributes["plugin.name"] || attributes["hook.name"];
		if (typeof attrName === "string") {
			const updatedName = attrName.replace(/^fastify -> /, "").replace(/^@fastify\/otel -> /, "").replace(/^@sentry\/instrumentation-fastify -> /, "");
			span.updateName(updatedName);
		}
	}
	function instrumentClient() {
		const client = core.getClient();
		if (client) client.on("spanStart", (span) => {
			addFastifySpanAttributes(span);
		});
	}
	function instrumentOnRequest(fastify) {
		fastify.addHook("onRequest", async (request, _reply) => {
			if (request.opentelemetry) {
				const { span } = request.opentelemetry();
				if (span) addFastifySpanAttributes(span);
			}
			const routeName = request.routeOptions?.url;
			const method = request.method || "GET";
			core.getIsolationScope().setTransactionName(`${method} ${routeName}`);
		});
	}
	exports.fastifyIntegration = fastifyIntegration;
	exports.instrumentFastify = instrumentFastify;
	exports.instrumentFastifyV3 = instrumentFastifyV3;
	exports.setupFastifyErrorHandler = setupFastifyErrorHandler;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/InstrumentationNodeModuleFile.js
var require_InstrumentationNodeModuleFile = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const path$10 = __require("path");
	var InstrumentationNodeModuleFile = class {
		constructor(name, supportedVersions, patch, unpatch) {
			this.name = path$10.normalize(name);
			this.supportedVersions = supportedVersions;
			this.patch = patch;
			this.unpatch = unpatch;
		}
	};
	exports.InstrumentationNodeModuleFile = InstrumentationNodeModuleFile;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/graphql/vendored/enum.js
var require_enum = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	var AllowedOperationTypes = /* @__PURE__ */ ((AllowedOperationTypes2) => {
		AllowedOperationTypes2["QUERY"] = "query";
		AllowedOperationTypes2["MUTATION"] = "mutation";
		AllowedOperationTypes2["SUBSCRIPTION"] = "subscription";
		return AllowedOperationTypes2;
	})(AllowedOperationTypes || {});
	var TokenKind = /* @__PURE__ */ ((TokenKind2) => {
		TokenKind2["SOF"] = "<SOF>";
		TokenKind2["EOF"] = "<EOF>";
		TokenKind2["BANG"] = "!";
		TokenKind2["DOLLAR"] = "$";
		TokenKind2["AMP"] = "&";
		TokenKind2["PAREN_L"] = "(";
		TokenKind2["PAREN_R"] = ")";
		TokenKind2["SPREAD"] = "...";
		TokenKind2["COLON"] = ":";
		TokenKind2["EQUALS"] = "=";
		TokenKind2["AT"] = "@";
		TokenKind2["BRACKET_L"] = "[";
		TokenKind2["BRACKET_R"] = "]";
		TokenKind2["BRACE_L"] = "{";
		TokenKind2["PIPE"] = "|";
		TokenKind2["BRACE_R"] = "}";
		TokenKind2["NAME"] = "Name";
		TokenKind2["INT"] = "Int";
		TokenKind2["FLOAT"] = "Float";
		TokenKind2["STRING"] = "String";
		TokenKind2["BLOCK_STRING"] = "BlockString";
		TokenKind2["COMMENT"] = "Comment";
		return TokenKind2;
	})(TokenKind || {});
	var SpanNames = /* @__PURE__ */ ((SpanNames2) => {
		SpanNames2["EXECUTE"] = "graphql.execute";
		SpanNames2["PARSE"] = "graphql.parse";
		SpanNames2["RESOLVE"] = "graphql.resolve";
		SpanNames2["VALIDATE"] = "graphql.validate";
		SpanNames2["SCHEMA_VALIDATE"] = "graphql.validateSchema";
		SpanNames2["SCHEMA_PARSE"] = "graphql.parseSchema";
		return SpanNames2;
	})(SpanNames || {});
	exports.AllowedOperationTypes = AllowedOperationTypes;
	exports.SpanNames = SpanNames;
	exports.TokenKind = TokenKind;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/graphql/vendored/enums/AttributeNames.js
var require_AttributeNames$5 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	var AttributeNames = /* @__PURE__ */ ((AttributeNames2) => {
		AttributeNames2["SOURCE"] = "graphql.source";
		AttributeNames2["FIELD_NAME"] = "graphql.field.name";
		AttributeNames2["FIELD_PATH"] = "graphql.field.path";
		AttributeNames2["FIELD_TYPE"] = "graphql.field.type";
		AttributeNames2["PARENT_NAME"] = "graphql.parent.name";
		AttributeNames2["OPERATION_TYPE"] = "graphql.operation.type";
		AttributeNames2["OPERATION_NAME"] = "graphql.operation.name";
		return AttributeNames2;
	})(AttributeNames || {});
	exports.AttributeNames = AttributeNames;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/graphql/vendored/symbols.js
var require_symbols = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const OTEL_PATCHED_SYMBOL = /* @__PURE__ */ Symbol.for("opentelemetry.patched");
	exports.OTEL_GRAPHQL_DATA_SYMBOL = /* @__PURE__ */ Symbol.for("opentelemetry.graphql_data");
	exports.OTEL_PATCHED_SYMBOL = OTEL_PATCHED_SYMBOL;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/graphql/vendored/internal-types.js
var require_internal_types$4 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	exports.OPERATION_NOT_SUPPORTED = "Operation$operationName$not supported";
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/graphql/vendored/utils.js
var require_utils$12 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const _enum = require_enum();
	const AttributeNames = require_AttributeNames$5();
	const symbols = require_symbols();
	const OPERATION_VALUES = Object.values(_enum.AllowedOperationTypes);
	const isPromise = (value) => {
		return typeof value?.then === "function";
	};
	const isObjectLike = (value) => {
		return typeof value == "object" && value !== null;
	};
	function addSpanSource(span, loc, start, end) {
		const source = getSourceFromLocation(loc, start, end);
		span.setAttribute(AttributeNames.AttributeNames.SOURCE, source);
	}
	function createFieldIfNotExists(contextValue, info, path) {
		let field = getField(contextValue, path);
		if (field) return {
			field,
			spanAdded: false
		};
		field = { span: createResolverSpan(contextValue, info, path, getParentFieldSpan(contextValue, path)) };
		addField(contextValue, path, field);
		return {
			field,
			spanAdded: true
		};
	}
	function createResolverSpan(contextValue, info, path, parentSpan) {
		const attributes = {
			[AttributeNames.AttributeNames.FIELD_NAME]: info.fieldName,
			[AttributeNames.AttributeNames.FIELD_PATH]: path.join("."),
			[AttributeNames.AttributeNames.FIELD_TYPE]: info.returnType.toString(),
			[AttributeNames.AttributeNames.PARENT_NAME]: info.parentType.name
		};
		const span = core.startInactiveSpan({
			name: `${_enum.SpanNames.RESOLVE} ${attributes[AttributeNames.AttributeNames.FIELD_PATH]}`,
			attributes,
			parentSpan
		});
		const document = contextValue[symbols.OTEL_GRAPHQL_DATA_SYMBOL].source;
		const fieldNode = info.fieldNodes.find((fieldNode2) => fieldNode2.kind === "Field");
		if (fieldNode) addSpanSource(span, document.loc, fieldNode.loc?.start, fieldNode.loc?.end);
		return span;
	}
	function endSpan(span, error) {
		if (error) span.setStatus({
			code: core.SPAN_STATUS_ERROR,
			message: error.message
		});
		span.end();
	}
	function getOperation(document, operationName) {
		if (!document || !Array.isArray(document.definitions)) return;
		if (operationName) return document.definitions.filter((definition) => OPERATION_VALUES.indexOf(definition?.operation) !== -1).find((definition) => operationName === definition?.name?.value);
		else return document.definitions.find((definition) => OPERATION_VALUES.indexOf(definition?.operation) !== -1);
	}
	function addField(contextValue, path, field) {
		return contextValue[symbols.OTEL_GRAPHQL_DATA_SYMBOL].fields[path.join(".")] = field;
	}
	function getField(contextValue, path) {
		return contextValue[symbols.OTEL_GRAPHQL_DATA_SYMBOL].fields[path.join(".")];
	}
	function getParentFieldSpan(contextValue, path) {
		for (let i = path.length - 1; i > 0; i--) {
			const field = getField(contextValue, path.slice(0, i));
			if (field) return field.span;
		}
		return getRootSpan(contextValue);
	}
	function getRootSpan(contextValue) {
		return contextValue[symbols.OTEL_GRAPHQL_DATA_SYMBOL].span;
	}
	function pathToArray(path) {
		const flattened = [];
		let curr = path;
		while (curr) {
			flattened.push(String(curr.key));
			curr = curr.prev;
		}
		return flattened.reverse();
	}
	function repeatBreak(i) {
		return repeatChar("\n", i);
	}
	function repeatSpace(i) {
		return repeatChar(" ", i);
	}
	function repeatChar(char, to) {
		let text = "";
		for (let i = 0; i < to; i++) text += char;
		return text;
	}
	const KindsToBeRemoved = [
		_enum.TokenKind.FLOAT,
		_enum.TokenKind.STRING,
		_enum.TokenKind.INT,
		_enum.TokenKind.BLOCK_STRING
	];
	function getSourceFromLocation(loc, inputStart, inputEnd) {
		let source = "";
		if (loc?.startToken) {
			const start = typeof inputStart === "number" ? inputStart : loc.start;
			const end = typeof inputEnd === "number" ? inputEnd : loc.end;
			let next = loc.startToken.next;
			let previousLine = 1;
			while (next) {
				if (next.start < start) {
					next = next.next;
					previousLine = next?.line;
					continue;
				}
				if (next.end > end) {
					next = next.next;
					previousLine = next?.line;
					continue;
				}
				let value = next.value || next.kind;
				let space = "";
				if (KindsToBeRemoved.indexOf(next.kind) >= 0) value = "*";
				if (next.kind === _enum.TokenKind.STRING) value = `"${value}"`;
				if (next.kind === _enum.TokenKind.EOF) value = "";
				if (next.line > previousLine) {
					source += repeatBreak(next.line - previousLine);
					previousLine = next.line;
					space = repeatSpace(next.column - 1);
				} else if (next.line === next.prev?.line) space = repeatSpace(next.start - (next.prev?.end || 0));
				source += space + value;
				if (next) next = next.next;
			}
		}
		return source;
	}
	function wrapFields(type, getConfig) {
		if (!type || type[symbols.OTEL_PATCHED_SYMBOL]) return;
		const fields = type.getFields();
		type[symbols.OTEL_PATCHED_SYMBOL] = true;
		Object.keys(fields).forEach((key) => {
			const field = fields[key];
			if (!field) return;
			if (field.resolve) field.resolve = wrapFieldResolver(getConfig, field.resolve);
			if (field.type) {
				const unwrappedTypes = unwrapType(field.type);
				for (const unwrappedType of unwrappedTypes) wrapFields(unwrappedType, getConfig);
			}
		});
	}
	function unwrapType(type) {
		if ("ofType" in type) return unwrapType(type.ofType);
		if (isGraphQLUnionType(type)) return type.getTypes();
		if (isGraphQLObjectType(type)) return [type];
		return [];
	}
	function isGraphQLUnionType(type) {
		return "getTypes" in type && typeof type.getTypes === "function";
	}
	function isGraphQLObjectType(type) {
		return "getFields" in type && typeof type.getFields === "function";
	}
	const handleResolveSpanError = (resolveSpan, err, shouldEndSpan) => {
		if (!shouldEndSpan) return;
		resolveSpan.setStatus({
			code: core.SPAN_STATUS_ERROR,
			message: err.message
		});
		resolveSpan.end();
	};
	const handleResolveSpanSuccess = (resolveSpan, shouldEndSpan) => {
		if (!shouldEndSpan) return;
		resolveSpan.end();
	};
	function wrapFieldResolver(getConfig, fieldResolver, isDefaultResolver = false) {
		if (wrappedFieldResolver[symbols.OTEL_PATCHED_SYMBOL] || typeof fieldResolver !== "function") return fieldResolver;
		function wrappedFieldResolver(source, args, contextValue, info) {
			if (!fieldResolver) return;
			if (getConfig().ignoreTrivialResolveSpans && isDefaultResolver && (isObjectLike(source) || typeof source === "function")) {
				if (typeof source[info.fieldName] !== "function") return fieldResolver.call(this, source, args, contextValue, info);
			}
			if (!contextValue[symbols.OTEL_GRAPHQL_DATA_SYMBOL]) return fieldResolver.call(this, source, args, contextValue, info);
			const { field, spanAdded } = createFieldIfNotExists(contextValue, info, pathToArray(info?.path));
			const span = field.span;
			const shouldEndSpan = spanAdded;
			return core.withActiveSpan(span, () => {
				try {
					const res = fieldResolver.call(this, source, args, contextValue, info);
					if (isPromise(res)) return res.then((r) => {
						handleResolveSpanSuccess(span, shouldEndSpan);
						return r;
					}, (err) => {
						handleResolveSpanError(span, err, shouldEndSpan);
						throw err;
					});
					else {
						handleResolveSpanSuccess(span, shouldEndSpan);
						return res;
					}
				} catch (err) {
					handleResolveSpanError(span, err, shouldEndSpan);
					throw err;
				}
			});
		}
		wrappedFieldResolver[symbols.OTEL_PATCHED_SYMBOL] = true;
		return wrappedFieldResolver;
	}
	exports.addSpanSource = addSpanSource;
	exports.endSpan = endSpan;
	exports.getOperation = getOperation;
	exports.getSourceFromLocation = getSourceFromLocation;
	exports.isPromise = isPromise;
	exports.wrapFieldResolver = wrapFieldResolver;
	exports.wrapFields = wrapFields;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/graphql/vendored/instrumentation.js
var require_instrumentation$22 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const instrumentation = require_src$1();
	const InstrumentationNodeModuleFile = require_InstrumentationNodeModuleFile();
	const _enum = require_enum();
	const AttributeNames = require_AttributeNames$5();
	const symbols = require_symbols();
	const internalTypes = require_internal_types$4();
	const utils = require_utils$12();
	const core = require_cjs$4();
	const opentelemetry = require_cjs$3();
	const PACKAGE_NAME = "@sentry/instrumentation-graphql";
	const ORIGIN = "auto.graphql.otel.graphql";
	const DEFAULT_CONFIG = { ignoreResolveSpans: false };
	const supportedVersions = [">=14.0.0 <17"];
	var GraphQLInstrumentation = class extends instrumentation.InstrumentationBase {
		constructor(config = {}) {
			super(PACKAGE_NAME, core.SDK_VERSION, {
				...DEFAULT_CONFIG,
				...config
			});
		}
		setConfig(config = {}) {
			super.setConfig({
				...DEFAULT_CONFIG,
				...config
			});
		}
		init() {
			const module$23 = new instrumentation.InstrumentationNodeModuleDefinition("graphql", supportedVersions);
			module$23.files.push(this._addPatchingExecute());
			module$23.files.push(this._addPatchingParser());
			module$23.files.push(this._addPatchingValidate());
			return module$23;
		}
		_addPatchingExecute() {
			return new InstrumentationNodeModuleFile.InstrumentationNodeModuleFile("graphql/execution/execute.js", supportedVersions, (moduleExports) => {
				if (instrumentation.isWrapped(moduleExports.execute)) this._unwrap(moduleExports, "execute");
				this._wrap(moduleExports, "execute", this._patchExecute(moduleExports.defaultFieldResolver));
				return moduleExports;
			}, (moduleExports) => {
				if (moduleExports) this._unwrap(moduleExports, "execute");
			});
		}
		_addPatchingParser() {
			return new InstrumentationNodeModuleFile.InstrumentationNodeModuleFile("graphql/language/parser.js", supportedVersions, (moduleExports) => {
				if (instrumentation.isWrapped(moduleExports.parse)) this._unwrap(moduleExports, "parse");
				this._wrap(moduleExports, "parse", this._patchParse());
				return moduleExports;
			}, (moduleExports) => {
				if (moduleExports) this._unwrap(moduleExports, "parse");
			});
		}
		_addPatchingValidate() {
			return new InstrumentationNodeModuleFile.InstrumentationNodeModuleFile("graphql/validation/validate.js", supportedVersions, (moduleExports) => {
				if (instrumentation.isWrapped(moduleExports.validate)) this._unwrap(moduleExports, "validate");
				this._wrap(moduleExports, "validate", this._patchValidate());
				return moduleExports;
			}, (moduleExports) => {
				if (moduleExports) this._unwrap(moduleExports, "validate");
			});
		}
		_patchExecute(defaultFieldResolved) {
			const instrumentation$1 = this;
			return function execute(original) {
				return function patchExecute() {
					let processedArgs;
					if (arguments.length >= 2) {
						const args = arguments;
						processedArgs = instrumentation$1._wrapExecuteArgs(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], defaultFieldResolved);
					} else {
						const args = arguments[0];
						processedArgs = instrumentation$1._wrapExecuteArgs(args.schema, args.document, args.rootValue, args.contextValue, args.variableValues, args.operationName, args.fieldResolver, args.typeResolver, defaultFieldResolved);
					}
					const operation = utils.getOperation(processedArgs.document, processedArgs.operationName);
					const span = instrumentation$1._createExecuteSpan(operation, processedArgs);
					processedArgs.contextValue[symbols.OTEL_GRAPHQL_DATA_SYMBOL] = {
						source: processedArgs.document ? processedArgs.document || processedArgs.document[symbols.OTEL_GRAPHQL_DATA_SYMBOL] : void 0,
						span,
						fields: {}
					};
					return core.withActiveSpan(span, () => {
						return instrumentation.safeExecuteInTheMiddle(() => {
							return original.apply(this, [processedArgs]);
						}, (err, result) => {
							instrumentation$1._handleExecutionResult(span, err, result);
						});
					});
				};
			};
		}
		_handleExecutionResult(span, err, result) {
			if (result === void 0 || err) {
				utils.endSpan(span, err);
				return;
			}
			if (utils.isPromise(result)) result.then((resultData) => {
				this._updateSpanFromResult(span, resultData);
				utils.endSpan(span);
			}, (error) => {
				utils.endSpan(span, error);
			});
			else {
				this._updateSpanFromResult(span, result);
				utils.endSpan(span);
			}
		}
		/**
		* Applies Sentry-specific span mutations based on the GraphQL execution result:
		* - Marks the execute span as errored if the result contains errors (and no status was set yet)
		* - Optionally renames the containing root span to include the GraphQL operation name(s)
		*/
		_updateSpanFromResult(span, result) {
			if (result.errors?.length && !core.spanToJSON(span).status) span.setStatus({ code: core.SPAN_STATUS_ERROR });
			if (!this.getConfig().useOperationNameForRootSpan) return;
			const attributes = core.spanToJSON(span).data;
			const operationType = attributes[AttributeNames.AttributeNames.OPERATION_TYPE];
			const operationName = attributes[AttributeNames.AttributeNames.OPERATION_NAME];
			if (!operationType) return;
			const rootSpan = core.getRootSpan(span);
			const existingOperations = core.spanToJSON(rootSpan).data[opentelemetry.SEMANTIC_ATTRIBUTE_SENTRY_GRAPHQL_OPERATION] || [];
			const newOperation = operationName ? `${operationType} ${operationName}` : `${operationType}`;
			if (Array.isArray(existingOperations)) {
				existingOperations.push(newOperation);
				rootSpan.setAttribute(opentelemetry.SEMANTIC_ATTRIBUTE_SENTRY_GRAPHQL_OPERATION, existingOperations);
			} else if (typeof existingOperations === "string") rootSpan.setAttribute(opentelemetry.SEMANTIC_ATTRIBUTE_SENTRY_GRAPHQL_OPERATION, [existingOperations, newOperation]);
			else rootSpan.setAttribute(opentelemetry.SEMANTIC_ATTRIBUTE_SENTRY_GRAPHQL_OPERATION, newOperation);
			if (!core.spanToJSON(rootSpan).data["original-description"]) rootSpan.setAttribute("original-description", core.spanToJSON(rootSpan).description);
			rootSpan.updateName(`${core.spanToJSON(rootSpan).data["original-description"]} (${getGraphqlOperationNamesFromAttribute(existingOperations)})`);
		}
		_patchParse() {
			const instrumentation = this;
			return function parse(original) {
				return function patchParse(source, options) {
					return instrumentation._parse(this, original, source, options);
				};
			};
		}
		_patchValidate() {
			const instrumentation = this;
			return function validate(original) {
				return function patchValidate(schema, documentAST, rules, options, typeInfo) {
					return instrumentation._validate(this, original, schema, documentAST, rules, typeInfo, options);
				};
			};
		}
		_parse(obj, original, source, options) {
			const span = core.startInactiveSpan({ name: _enum.SpanNames.PARSE });
			return core.withActiveSpan(span, () => {
				return instrumentation.safeExecuteInTheMiddle(() => {
					return original.call(obj, source, options);
				}, (err, result) => {
					if (result) {
						if (!utils.getOperation(result)) span.updateName(_enum.SpanNames.SCHEMA_PARSE);
						else if (result.loc) utils.addSpanSource(span, result.loc);
					}
					utils.endSpan(span, err);
				});
			});
		}
		_validate(obj, original, schema, documentAST, rules, typeInfo, options) {
			const span = core.startInactiveSpan({ name: _enum.SpanNames.VALIDATE });
			return core.withActiveSpan(span, () => {
				return instrumentation.safeExecuteInTheMiddle(() => {
					return original.call(obj, schema, documentAST, rules, options, typeInfo);
				}, (err, _errors) => {
					if (!documentAST.loc) span.updateName(_enum.SpanNames.SCHEMA_VALIDATE);
					utils.endSpan(span, err);
				});
			});
		}
		_createExecuteSpan(operation, processedArgs) {
			const span = core.startInactiveSpan({
				name: _enum.SpanNames.EXECUTE,
				attributes: { [core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: ORIGIN }
			});
			if (operation) {
				const { operation: operationType, name: nameNode } = operation;
				span.setAttribute(AttributeNames.AttributeNames.OPERATION_TYPE, operationType);
				const operationName = nameNode?.value;
				if (operationName) {
					span.setAttribute(AttributeNames.AttributeNames.OPERATION_NAME, operationName);
					span.updateName(`${operationType} ${operationName}`);
				} else span.updateName(operationType);
			} else {
				let operationName = " ";
				if (processedArgs.operationName) operationName = ` "${processedArgs.operationName}" `;
				operationName = internalTypes.OPERATION_NOT_SUPPORTED.replace("$operationName$", operationName);
				span.setAttribute(AttributeNames.AttributeNames.OPERATION_NAME, operationName);
			}
			if (processedArgs.document?.loc) utils.addSpanSource(span, processedArgs.document.loc);
			return span;
		}
		_wrapExecuteArgs(schema, document, rootValue, contextValue, variableValues, operationName, fieldResolver, typeResolver, defaultFieldResolved) {
			if (!contextValue) contextValue = {};
			if (contextValue[symbols.OTEL_GRAPHQL_DATA_SYMBOL] || this.getConfig().ignoreResolveSpans) return {
				schema,
				document,
				rootValue,
				contextValue,
				variableValues,
				operationName,
				fieldResolver,
				typeResolver
			};
			const isUsingDefaultResolver = fieldResolver == null;
			const fieldResolverForExecute = fieldResolver ?? defaultFieldResolved;
			fieldResolver = utils.wrapFieldResolver(() => this.getConfig(), fieldResolverForExecute, isUsingDefaultResolver);
			if (schema) {
				utils.wrapFields(schema.getQueryType(), () => this.getConfig());
				utils.wrapFields(schema.getMutationType(), () => this.getConfig());
			}
			return {
				schema,
				document,
				rootValue,
				contextValue,
				variableValues,
				operationName,
				fieldResolver,
				typeResolver
			};
		}
	};
	function getGraphqlOperationNamesFromAttribute(attr) {
		if (Array.isArray(attr)) {
			const sorted = attr.slice().sort();
			if (sorted.length <= 5) return sorted.join(", ");
			else return `${sorted.slice(0, 5).join(", ")}, +${sorted.length - 5}`;
		}
		return `${attr}`;
	}
	exports.GraphQLInstrumentation = GraphQLInstrumentation;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/graphql/index.js
var require_graphql = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const instrumentation = require_instrumentation$22();
	const core = require_cjs$4();
	const nodeCore = require_cjs$2();
	const INTEGRATION_NAME = "Graphql";
	const instrumentGraphql = nodeCore.generateInstrumentOnce(INTEGRATION_NAME, instrumentation.GraphQLInstrumentation, (_options) => getOptionsWithDefaults(_options));
	const _graphqlIntegration = ((options = {}) => {
		return {
			name: INTEGRATION_NAME,
			setupOnce() {
				instrumentGraphql(getOptionsWithDefaults(options));
			}
		};
	});
	const graphqlIntegration = core.defineIntegration(_graphqlIntegration);
	function getOptionsWithDefaults(options) {
		return {
			ignoreResolveSpans: true,
			ignoreTrivialResolveSpans: true,
			useOperationNameForRootSpan: true,
			...options
		};
	}
	exports.graphqlIntegration = graphqlIntegration;
	exports.instrumentGraphql = instrumentGraphql;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/kafka/vendored/semconv.js
var require_semconv$10 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const ATTR_MESSAGING_BATCH_MESSAGE_COUNT = "messaging.batch.message_count";
	const ATTR_MESSAGING_DESTINATION_NAME = "messaging.destination.name";
	const ATTR_MESSAGING_DESTINATION_PARTITION_ID = "messaging.destination.partition.id";
	const ATTR_MESSAGING_KAFKA_MESSAGE_KEY = "messaging.kafka.message.key";
	const ATTR_MESSAGING_KAFKA_MESSAGE_TOMBSTONE = "messaging.kafka.message.tombstone";
	const ATTR_MESSAGING_KAFKA_OFFSET = "messaging.kafka.offset";
	const ATTR_MESSAGING_OPERATION_NAME = "messaging.operation.name";
	const ATTR_MESSAGING_OPERATION_TYPE = "messaging.operation.type";
	const ATTR_MESSAGING_SYSTEM = "messaging.system";
	const MESSAGING_OPERATION_TYPE_VALUE_PROCESS = "process";
	const MESSAGING_OPERATION_TYPE_VALUE_RECEIVE = "receive";
	const MESSAGING_OPERATION_TYPE_VALUE_SEND = "send";
	const MESSAGING_SYSTEM_VALUE_KAFKA = "kafka";
	const ATTR_ERROR_TYPE = "error.type";
	const ERROR_TYPE_VALUE_OTHER = "_OTHER";
	exports.ATTR_ERROR_TYPE = ATTR_ERROR_TYPE;
	exports.ATTR_MESSAGING_BATCH_MESSAGE_COUNT = ATTR_MESSAGING_BATCH_MESSAGE_COUNT;
	exports.ATTR_MESSAGING_DESTINATION_NAME = ATTR_MESSAGING_DESTINATION_NAME;
	exports.ATTR_MESSAGING_DESTINATION_PARTITION_ID = ATTR_MESSAGING_DESTINATION_PARTITION_ID;
	exports.ATTR_MESSAGING_KAFKA_MESSAGE_KEY = ATTR_MESSAGING_KAFKA_MESSAGE_KEY;
	exports.ATTR_MESSAGING_KAFKA_MESSAGE_TOMBSTONE = ATTR_MESSAGING_KAFKA_MESSAGE_TOMBSTONE;
	exports.ATTR_MESSAGING_KAFKA_OFFSET = ATTR_MESSAGING_KAFKA_OFFSET;
	exports.ATTR_MESSAGING_OPERATION_NAME = ATTR_MESSAGING_OPERATION_NAME;
	exports.ATTR_MESSAGING_OPERATION_TYPE = ATTR_MESSAGING_OPERATION_TYPE;
	exports.ATTR_MESSAGING_SYSTEM = ATTR_MESSAGING_SYSTEM;
	exports.ERROR_TYPE_VALUE_OTHER = ERROR_TYPE_VALUE_OTHER;
	exports.MESSAGING_OPERATION_TYPE_VALUE_PROCESS = MESSAGING_OPERATION_TYPE_VALUE_PROCESS;
	exports.MESSAGING_OPERATION_TYPE_VALUE_RECEIVE = MESSAGING_OPERATION_TYPE_VALUE_RECEIVE;
	exports.MESSAGING_OPERATION_TYPE_VALUE_SEND = MESSAGING_OPERATION_TYPE_VALUE_SEND;
	exports.MESSAGING_SYSTEM_VALUE_KAFKA = MESSAGING_SYSTEM_VALUE_KAFKA;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/kafka/vendored/utils.js
var require_utils$11 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const api = require_src();
	const core = require_cjs$4();
	const semconv = require_semconv$10();
	const PRODUCER_ORIGIN = "auto.kafkajs.otel.producer";
	const CONSUMER_ORIGIN = "auto.kafkajs.otel.consumer";
	function getHeaderAsString(headers, key) {
		const value = headers?.[key];
		if (value == null) return;
		return Array.isArray(value) ? value[0]?.toString() : value.toString();
	}
	function getLinksFromHeaders(headers) {
		const sentryTrace = getHeaderAsString(headers, "sentry-trace");
		if (!sentryTrace) return;
		const { traceId, parentSpanId, sampled } = core.propagationContextFromHeaders(sentryTrace, getHeaderAsString(headers, "baggage"));
		if (!parentSpanId) return;
		return [{ context: {
			traceId,
			spanId: parentSpanId,
			isRemote: true,
			traceFlags: sampled ? api.TraceFlags.SAMPLED : api.TraceFlags.NONE
		} }];
	}
	function startConsumerSpan({ topic, message, operationType, links, attributes }) {
		const operationName = operationType === semconv.MESSAGING_OPERATION_TYPE_VALUE_RECEIVE ? "poll" : operationType;
		return core.startInactiveSpan({
			name: `${operationName} ${topic}`,
			kind: operationType === semconv.MESSAGING_OPERATION_TYPE_VALUE_RECEIVE ? core.SPAN_KIND.CLIENT : core.SPAN_KIND.CONSUMER,
			links,
			attributes: {
				...attributes,
				[semconv.ATTR_MESSAGING_SYSTEM]: semconv.MESSAGING_SYSTEM_VALUE_KAFKA,
				[semconv.ATTR_MESSAGING_DESTINATION_NAME]: topic,
				[semconv.ATTR_MESSAGING_OPERATION_TYPE]: operationType,
				[semconv.ATTR_MESSAGING_OPERATION_NAME]: operationName,
				[semconv.ATTR_MESSAGING_KAFKA_MESSAGE_KEY]: message?.key ? String(message.key) : void 0,
				[semconv.ATTR_MESSAGING_KAFKA_MESSAGE_TOMBSTONE]: message?.key && message.value === null ? true : void 0,
				[semconv.ATTR_MESSAGING_KAFKA_OFFSET]: message?.offset,
				...message ? { [core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: CONSUMER_ORIGIN } : {}
			}
		});
	}
	function startProducerSpan(topic, message) {
		const span = core.startInactiveSpan({
			name: `send ${topic}`,
			kind: core.SPAN_KIND.PRODUCER,
			attributes: {
				[semconv.ATTR_MESSAGING_SYSTEM]: semconv.MESSAGING_SYSTEM_VALUE_KAFKA,
				[semconv.ATTR_MESSAGING_DESTINATION_NAME]: topic,
				[semconv.ATTR_MESSAGING_KAFKA_MESSAGE_KEY]: message.key ? String(message.key) : void 0,
				[semconv.ATTR_MESSAGING_KAFKA_MESSAGE_TOMBSTONE]: message.key && message.value === null ? true : void 0,
				[semconv.ATTR_MESSAGING_DESTINATION_PARTITION_ID]: message.partition !== void 0 ? String(message.partition) : void 0,
				[semconv.ATTR_MESSAGING_OPERATION_NAME]: "send",
				[semconv.ATTR_MESSAGING_OPERATION_TYPE]: semconv.MESSAGING_OPERATION_TYPE_VALUE_SEND,
				[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: PRODUCER_ORIGIN
			}
		});
		message.headers = message.headers ?? {};
		const traceData = core.getTraceData({ span });
		if (traceData["sentry-trace"]) message.headers["sentry-trace"] = traceData["sentry-trace"];
		if (traceData.baggage) message.headers["baggage"] = traceData.baggage;
		return span;
	}
	function endSpansOnPromise(spans, sendPromise) {
		return Promise.resolve(sendPromise).catch((reason) => {
			let errorMessage;
			let errorType = semconv.ERROR_TYPE_VALUE_OTHER;
			if (typeof reason === "string" || reason === void 0) errorMessage = reason;
			else if (typeof reason === "object" && Object.prototype.hasOwnProperty.call(reason, "message")) {
				errorMessage = reason.message;
				errorType = reason.constructor.name;
			}
			spans.forEach((span) => {
				span.setAttribute(semconv.ATTR_ERROR_TYPE, errorType);
				span.setStatus({
					code: core.SPAN_STATUS_ERROR,
					message: errorMessage
				});
			});
			throw reason;
		}).finally(() => {
			spans.forEach((span) => span.end());
		});
	}
	exports.endSpansOnPromise = endSpansOnPromise;
	exports.getHeaderAsString = getHeaderAsString;
	exports.getLinksFromHeaders = getLinksFromHeaders;
	exports.startConsumerSpan = startConsumerSpan;
	exports.startProducerSpan = startProducerSpan;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/kafka/vendored/instrumentation.js
var require_instrumentation$21 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const instrumentation = require_src$1();
	const core = require_cjs$4();
	const semconv = require_semconv$10();
	const utils = require_utils$11();
	const PACKAGE_NAME = "@sentry/instrumentation-kafkajs";
	var KafkaJsInstrumentation = class extends instrumentation.InstrumentationBase {
		constructor(config = {}) {
			super(PACKAGE_NAME, core.SDK_VERSION, config);
		}
		init() {
			const unpatch = (moduleExports) => {
				if (instrumentation.isWrapped(moduleExports?.Kafka?.prototype.producer)) this._unwrap(moduleExports.Kafka.prototype, "producer");
				if (instrumentation.isWrapped(moduleExports?.Kafka?.prototype.consumer)) this._unwrap(moduleExports.Kafka.prototype, "consumer");
			};
			return new instrumentation.InstrumentationNodeModuleDefinition("kafkajs", [">=0.3.0 <3"], (moduleExports) => {
				unpatch(moduleExports);
				this._wrap(moduleExports?.Kafka?.prototype, "producer", this._getProducerPatch());
				this._wrap(moduleExports?.Kafka?.prototype, "consumer", this._getConsumerPatch());
				return moduleExports;
			}, unpatch);
		}
		_getConsumerPatch() {
			const instrumentation$1 = this;
			return (original) => {
				return function consumer(...args) {
					const newConsumer = original.apply(this, args);
					if (instrumentation.isWrapped(newConsumer.run)) instrumentation$1._unwrap(newConsumer, "run");
					instrumentation$1._wrap(newConsumer, "run", instrumentation$1._getConsumerRunPatch());
					return newConsumer;
				};
			};
		}
		_getProducerPatch() {
			const instrumentation$1 = this;
			return (original) => {
				return function consumer(...args) {
					const newProducer = original.apply(this, args);
					if (instrumentation.isWrapped(newProducer.sendBatch)) instrumentation$1._unwrap(newProducer, "sendBatch");
					instrumentation$1._wrap(newProducer, "sendBatch", instrumentation$1._getSendBatchPatch());
					if (instrumentation.isWrapped(newProducer.send)) instrumentation$1._unwrap(newProducer, "send");
					instrumentation$1._wrap(newProducer, "send", instrumentation$1._getSendPatch());
					if (instrumentation.isWrapped(newProducer.transaction)) instrumentation$1._unwrap(newProducer, "transaction");
					instrumentation$1._wrap(newProducer, "transaction", instrumentation$1._getProducerTransactionPatch());
					return newProducer;
				};
			};
		}
		_getConsumerRunPatch() {
			const instrumentation$1 = this;
			return (original) => {
				return function run(...args) {
					const config = args[0];
					if (config?.eachMessage) {
						if (instrumentation.isWrapped(config.eachMessage)) instrumentation$1._unwrap(config, "eachMessage");
						instrumentation$1._wrap(config, "eachMessage", instrumentation$1._getConsumerEachMessagePatch());
					}
					if (config?.eachBatch) {
						if (instrumentation.isWrapped(config.eachBatch)) instrumentation$1._unwrap(config, "eachBatch");
						instrumentation$1._wrap(config, "eachBatch", instrumentation$1._getConsumerEachBatchPatch());
					}
					return original.call(this, config);
				};
			};
		}
		_getConsumerEachMessagePatch() {
			return (original) => {
				return function eachMessage(...args) {
					const payload = args[0];
					const sentryTrace = utils.getHeaderAsString(payload.message.headers, "sentry-trace");
					const baggage = utils.getHeaderAsString(payload.message.headers, "baggage");
					return core.continueTrace({
						sentryTrace,
						baggage
					}, () => {
						const span = utils.startConsumerSpan({
							topic: payload.topic,
							message: payload.message,
							operationType: semconv.MESSAGING_OPERATION_TYPE_VALUE_PROCESS,
							attributes: { [semconv.ATTR_MESSAGING_DESTINATION_PARTITION_ID]: String(payload.partition) }
						});
						const eachMessagePromise = core.withActiveSpan(span, () => {
							return original.apply(this, args);
						});
						return utils.endSpansOnPromise([span], eachMessagePromise);
					});
				};
			};
		}
		_getConsumerEachBatchPatch() {
			return (original) => {
				return function eachBatch(...args) {
					const payload = args[0];
					const receivingSpan = core.startNewTrace(() => utils.startConsumerSpan({
						topic: payload.batch.topic,
						message: void 0,
						operationType: semconv.MESSAGING_OPERATION_TYPE_VALUE_RECEIVE,
						attributes: {
							[semconv.ATTR_MESSAGING_BATCH_MESSAGE_COUNT]: payload.batch.messages.length,
							[semconv.ATTR_MESSAGING_DESTINATION_PARTITION_ID]: String(payload.batch.partition)
						}
					}));
					return core.withActiveSpan(receivingSpan, () => {
						const spans = [receivingSpan];
						payload.batch.messages.forEach((message) => {
							spans.push(utils.startConsumerSpan({
								topic: payload.batch.topic,
								message,
								operationType: semconv.MESSAGING_OPERATION_TYPE_VALUE_PROCESS,
								links: utils.getLinksFromHeaders(message.headers),
								attributes: { [semconv.ATTR_MESSAGING_DESTINATION_PARTITION_ID]: String(payload.batch.partition) }
							}));
						});
						const batchMessagePromise = original.apply(this, args);
						return utils.endSpansOnPromise(spans, batchMessagePromise);
					});
				};
			};
		}
		_getProducerTransactionPatch() {
			const instrumentation = this;
			return (original) => {
				return function transaction(...args) {
					const transactionSpan = core.startInactiveSpan({ name: "transaction" });
					const transactionPromise = original.apply(this, args);
					transactionPromise.then((transaction2) => {
						const originalSend = transaction2.send;
						transaction2.send = function send(...args2) {
							return core.withActiveSpan(transactionSpan, () => {
								return instrumentation._getSendPatch()(originalSend).apply(this, args2).catch((err) => {
									transactionSpan.setStatus({
										code: core.SPAN_STATUS_ERROR,
										message: err?.message
									});
									throw err;
								});
							});
						};
						const originalSendBatch = transaction2.sendBatch;
						transaction2.sendBatch = function sendBatch(...args2) {
							return core.withActiveSpan(transactionSpan, () => {
								return instrumentation._getSendBatchPatch()(originalSendBatch).apply(this, args2).catch((err) => {
									transactionSpan.setStatus({
										code: core.SPAN_STATUS_ERROR,
										message: err?.message
									});
									throw err;
								});
							});
						};
						const originalCommit = transaction2.commit;
						transaction2.commit = function commit(...args2) {
							const originCommitPromise = originalCommit.apply(this, args2).then(() => {
								transactionSpan.setStatus({ code: core.SPAN_STATUS_OK });
							});
							return utils.endSpansOnPromise([transactionSpan], originCommitPromise);
						};
						const originalAbort = transaction2.abort;
						transaction2.abort = function abort(...args2) {
							const originAbortPromise = originalAbort.apply(this, args2);
							return utils.endSpansOnPromise([transactionSpan], originAbortPromise);
						};
					}).catch((err) => {
						transactionSpan.setStatus({
							code: core.SPAN_STATUS_ERROR,
							message: err?.message
						});
						transactionSpan.end();
					});
					return transactionPromise;
				};
			};
		}
		_getSendBatchPatch() {
			return (original) => {
				return function sendBatch(...args) {
					const messages = args[0].topicMessages || [];
					const spans = [];
					messages.forEach((topicMessage) => {
						topicMessage.messages.forEach((message) => {
							spans.push(utils.startProducerSpan(topicMessage.topic, message));
						});
					});
					const origSendResult = original.apply(this, args);
					return utils.endSpansOnPromise(spans, origSendResult);
				};
			};
		}
		_getSendPatch() {
			return (original) => {
				return function send(...args) {
					const record = args[0];
					const spans = record.messages.map((message) => {
						return utils.startProducerSpan(record.topic, message);
					});
					const origSendResult = original.apply(this, args);
					return utils.endSpansOnPromise(spans, origSendResult);
				};
			};
		}
	};
	exports.KafkaJsInstrumentation = KafkaJsInstrumentation;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/kafka/index.js
var require_kafka = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const instrumentation = require_instrumentation$21();
	const core = require_cjs$4();
	const nodeCore = require_cjs$2();
	const INTEGRATION_NAME = "Kafka";
	const instrumentKafka = nodeCore.generateInstrumentOnce(INTEGRATION_NAME, () => new instrumentation.KafkaJsInstrumentation());
	const _kafkaIntegration = (() => {
		return {
			name: INTEGRATION_NAME,
			setupOnce() {
				instrumentKafka();
			}
		};
	});
	const kafkaIntegration = core.defineIntegration(_kafkaIntegration);
	exports.instrumentKafka = instrumentKafka;
	exports.kafkaIntegration = kafkaIntegration;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/lrumemoizer/vendored/instrumentation.js
var require_instrumentation$20 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const api = require_src();
	const instrumentation = require_src$1();
	const core = require_cjs$4();
	const PACKAGE_NAME = "@sentry/instrumentation-lru-memoizer";
	var LruMemoizerInstrumentation = class extends instrumentation.InstrumentationBase {
		constructor() {
			super(PACKAGE_NAME, core.SDK_VERSION, {});
		}
		init() {
			return [new instrumentation.InstrumentationNodeModuleDefinition("lru-memoizer", [">=1.3 <4"], (moduleExports) => {
				const asyncMemoizer = function(...args) {
					const origMemoizer = moduleExports.apply(this, args);
					return function(...memoizerArgs) {
						const origCallback = memoizerArgs.pop();
						const callbackWithContext = typeof origCallback === "function" ? api.context.bind(api.context.active(), origCallback) : origCallback;
						return origMemoizer.apply(this, [...memoizerArgs, callbackWithContext]);
					};
				};
				return Object.assign(asyncMemoizer, { sync: moduleExports.sync });
			}, void 0)];
		}
	};
	exports.LruMemoizerInstrumentation = LruMemoizerInstrumentation;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/lrumemoizer/index.js
var require_lrumemoizer = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const instrumentation = require_instrumentation$20();
	const core = require_cjs$4();
	const nodeCore = require_cjs$2();
	const INTEGRATION_NAME = "LruMemoizer";
	const instrumentLruMemoizer = nodeCore.generateInstrumentOnce(INTEGRATION_NAME, () => new instrumentation.LruMemoizerInstrumentation());
	const _lruMemoizerIntegration = (() => {
		return {
			name: INTEGRATION_NAME,
			setupOnce() {
				instrumentLruMemoizer();
			}
		};
	});
	const lruMemoizerIntegration = core.defineIntegration(_lruMemoizerIntegration);
	exports.instrumentLruMemoizer = instrumentLruMemoizer;
	exports.lruMemoizerIntegration = lruMemoizerIntegration;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/mongo/vendored/internal-types.js
var require_internal_types$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	var MongodbCommandType = /* @__PURE__ */ ((MongodbCommandType2) => {
		MongodbCommandType2["CREATE_INDEXES"] = "createIndexes";
		MongodbCommandType2["FIND_AND_MODIFY"] = "findAndModify";
		MongodbCommandType2["IS_MASTER"] = "isMaster";
		MongodbCommandType2["COUNT"] = "count";
		MongodbCommandType2["AGGREGATE"] = "aggregate";
		MongodbCommandType2["UNKNOWN"] = "unknown";
		return MongodbCommandType2;
	})(MongodbCommandType || {});
	exports.MongodbCommandType = MongodbCommandType;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/mongo/vendored/semconv.js
var require_semconv$9 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const ATTR_DB_CONNECTION_STRING = "db.connection_string";
	const ATTR_DB_MONGODB_COLLECTION = "db.mongodb.collection";
	const ATTR_DB_NAME = "db.name";
	const ATTR_DB_OPERATION = "db.operation";
	const ATTR_DB_STATEMENT = "db.statement";
	const ATTR_DB_SYSTEM = "db.system";
	const ATTR_NET_PEER_NAME = "net.peer.name";
	const ATTR_NET_PEER_PORT = "net.peer.port";
	const DB_SYSTEM_VALUE_MONGODB = "mongodb";
	exports.ATTR_DB_CONNECTION_STRING = ATTR_DB_CONNECTION_STRING;
	exports.ATTR_DB_MONGODB_COLLECTION = ATTR_DB_MONGODB_COLLECTION;
	exports.ATTR_DB_NAME = ATTR_DB_NAME;
	exports.ATTR_DB_OPERATION = ATTR_DB_OPERATION;
	exports.ATTR_DB_STATEMENT = ATTR_DB_STATEMENT;
	exports.ATTR_DB_SYSTEM = ATTR_DB_SYSTEM;
	exports.ATTR_NET_PEER_NAME = ATTR_NET_PEER_NAME;
	exports.ATTR_NET_PEER_PORT = ATTR_NET_PEER_PORT;
	exports.DB_SYSTEM_VALUE_MONGODB = DB_SYSTEM_VALUE_MONGODB;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/mongo/vendored/utils.js
var require_utils$10 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const semconv = require_semconv$9();
	const internalTypes = require_internal_types$3();
	const ORIGIN = "auto.db.otel.mongo";
	function serializeDbStatement(commandObj) {
		return JSON.stringify(scrubStatement(commandObj));
	}
	function scrubStatement(value) {
		if (Array.isArray(value)) return value.map((element) => scrubStatement(element));
		if (isCommandObj(value)) return Object.entries(value).map(([key, element]) => [key, scrubStatement(element)]).reduce((prev, current) => {
			if (isCommandEntry(current)) prev[current[0]] = current[1];
			return prev;
		}, {});
		return "?";
	}
	function isCommandObj(value) {
		return typeof value === "object" && value !== null && !isBuffer(value);
	}
	function isBuffer(value) {
		return typeof Buffer !== "undefined" && Buffer.isBuffer(value);
	}
	function isCommandEntry(value) {
		return Array.isArray(value);
	}
	function getCommandType(command) {
		if (command.createIndexes !== void 0) return internalTypes.MongodbCommandType.CREATE_INDEXES;
		else if (command.findandmodify !== void 0) return internalTypes.MongodbCommandType.FIND_AND_MODIFY;
		else if (command.ismaster !== void 0) return internalTypes.MongodbCommandType.IS_MASTER;
		else if (command.count !== void 0) return internalTypes.MongodbCommandType.COUNT;
		else if (command.aggregate !== void 0) return internalTypes.MongodbCommandType.AGGREGATE;
		else return internalTypes.MongodbCommandType.UNKNOWN;
	}
	function getV4SpanAttributes(connectionCtx, ns, command, operation) {
		let host, port;
		if (connectionCtx) {
			const hostParts = typeof connectionCtx.address === "string" ? connectionCtx.address.split(":") : "";
			if (hostParts.length === 2) {
				host = hostParts[0];
				port = hostParts[1];
			}
		}
		let commandObj;
		if (command?.documents && command.documents[0]) commandObj = command.documents[0];
		else if (command?.cursors) commandObj = command.cursors;
		else commandObj = command;
		return getSpanAttributes(ns.db, ns.collection, host, port, commandObj, operation);
	}
	function getV3SpanAttributes(ns, topology, command, operation) {
		let host;
		let port;
		if (topology?.s) {
			host = topology.s.options?.host ?? topology.s.host;
			port = (topology.s.options?.port ?? topology.s.port)?.toString();
			if (host == null || port == null) {
				const address = topology.description?.address;
				if (address) {
					const addressSegments = address.split(":");
					host = addressSegments[0];
					port = addressSegments[1];
				}
			}
		}
		const [dbName, dbCollection] = ns.toString().split(".");
		const commandObj = command?.query ?? command?.q ?? command;
		return getSpanAttributes(dbName, dbCollection, host, port, commandObj, operation);
	}
	function getSpanAttributes(dbName, dbCollection, host, port, commandObj, operation) {
		const attributes = {
			[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: ORIGIN,
			[semconv.ATTR_DB_SYSTEM]: semconv.DB_SYSTEM_VALUE_MONGODB,
			[semconv.ATTR_DB_NAME]: dbName,
			[semconv.ATTR_DB_MONGODB_COLLECTION]: dbCollection,
			[semconv.ATTR_DB_OPERATION]: operation,
			[semconv.ATTR_DB_CONNECTION_STRING]: `mongodb://${host}:${port}/${dbName}`
		};
		if (host && port) {
			attributes[semconv.ATTR_NET_PEER_NAME] = host;
			const portNumber = parseInt(port, 10);
			if (!isNaN(portNumber)) attributes[semconv.ATTR_NET_PEER_PORT] = portNumber;
		}
		if (commandObj) try {
			attributes[semconv.ATTR_DB_STATEMENT] = serializeDbStatement(commandObj);
		} catch {}
		return attributes;
	}
	function startMongoSpan(attributes) {
		return core.startInactiveSpan({
			name: `mongodb.${attributes[semconv.ATTR_DB_OPERATION] || "command"}`,
			kind: core.SPAN_KIND.CLIENT,
			attributes
		});
	}
	function patchEnd(span, resultHandler) {
		const parentSpan = core.getActiveSpan();
		let spanEnded = false;
		return function patchedEnd(...args) {
			if (!spanEnded) {
				spanEnded = true;
				const error = args[0];
				if (span) {
					if (error instanceof Error) span.setStatus({
						code: core.SPAN_STATUS_ERROR,
						message: error.message
					});
					span.end();
				}
			}
			return core.withActiveSpan(parentSpan ?? null, () => resultHandler.apply(this, args));
		};
	}
	function shouldSkipInstrumentation() {
		return !core.getActiveSpan();
	}
	exports.getCommandType = getCommandType;
	exports.getV3SpanAttributes = getV3SpanAttributes;
	exports.getV4SpanAttributes = getV4SpanAttributes;
	exports.patchEnd = patchEnd;
	exports.shouldSkipInstrumentation = shouldSkipInstrumentation;
	exports.startMongoSpan = startMongoSpan;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/mongo/vendored/patches.js
var require_patches$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const internalTypes = require_internal_types$3();
	const utils = require_utils$10();
	function getV3PatchOperation(operationName) {
		return (original) => {
			return function patchedServerCommand(server, ns, ops, options, callback) {
				const resultHandler = typeof options === "function" ? options : callback;
				if (utils.shouldSkipInstrumentation() || typeof resultHandler !== "function" || typeof ops !== "object") if (typeof options === "function") return original.call(this, server, ns, ops, options);
				else return original.call(this, server, ns, ops, options, callback);
				const span = utils.startMongoSpan(utils.getV3SpanAttributes(ns, server, ops[0], operationName));
				const patchedCallback = utils.patchEnd(span, resultHandler);
				if (typeof options === "function") return original.call(this, server, ns, ops, patchedCallback);
				else return original.call(this, server, ns, ops, options, patchedCallback);
			};
		};
	}
	function getV3PatchCommand() {
		return (original) => {
			return function patchedServerCommand(server, ns, cmd, options, callback) {
				const resultHandler = typeof options === "function" ? options : callback;
				if (utils.shouldSkipInstrumentation() || typeof resultHandler !== "function" || typeof cmd !== "object") if (typeof options === "function") return original.call(this, server, ns, cmd, options);
				else return original.call(this, server, ns, cmd, options, callback);
				const commandType = utils.getCommandType(cmd);
				const operationName = commandType === internalTypes.MongodbCommandType.UNKNOWN ? void 0 : commandType;
				const span = utils.startMongoSpan(utils.getV3SpanAttributes(ns, server, cmd, operationName));
				const patchedCallback = utils.patchEnd(span, resultHandler);
				if (typeof options === "function") return original.call(this, server, ns, cmd, patchedCallback);
				else return original.call(this, server, ns, cmd, options, patchedCallback);
			};
		};
	}
	function getV4PatchCommandCallback() {
		return (original) => {
			return function patchedV4ServerCommand(ns, cmd, options, callback) {
				const resultHandler = callback;
				const commandType = Object.keys(cmd)[0];
				if (typeof cmd !== "object" || cmd.ismaster || cmd.hello) return original.call(this, ns, cmd, options, callback);
				let span = void 0;
				if (!utils.shouldSkipInstrumentation()) span = utils.startMongoSpan(utils.getV4SpanAttributes(this, ns, cmd, commandType));
				const patchedCallback = utils.patchEnd(span, resultHandler);
				return original.call(this, ns, cmd, options, patchedCallback);
			};
		};
	}
	function getV4PatchCommandPromise() {
		return (original) => {
			return function patchedV4ServerCommand(...args) {
				const [ns, cmd] = args;
				const commandType = Object.keys(cmd)[0];
				const resultHandler = () => void 0;
				if (typeof cmd !== "object" || cmd.ismaster || cmd.hello) return original.apply(this, args);
				let span = void 0;
				if (!utils.shouldSkipInstrumentation()) span = utils.startMongoSpan(utils.getV4SpanAttributes(this, ns, cmd, commandType));
				const patchedCallback = utils.patchEnd(span, resultHandler);
				const result = original.apply(this, args);
				result.then((res) => patchedCallback(null, res), (err) => patchedCallback(err));
				return result;
			};
		};
	}
	function getV3PatchFind() {
		return (original) => {
			return function patchedServerCommand(server, ns, cmd, cursorState, options, callback) {
				const resultHandler = typeof options === "function" ? options : callback;
				if (utils.shouldSkipInstrumentation() || typeof resultHandler !== "function" || typeof cmd !== "object") if (typeof options === "function") return original.call(this, server, ns, cmd, cursorState, options);
				else return original.call(this, server, ns, cmd, cursorState, options, callback);
				const span = utils.startMongoSpan(utils.getV3SpanAttributes(ns, server, cmd, "find"));
				const patchedCallback = utils.patchEnd(span, resultHandler);
				if (typeof options === "function") return original.call(this, server, ns, cmd, cursorState, patchedCallback);
				else return original.call(this, server, ns, cmd, cursorState, options, patchedCallback);
			};
		};
	}
	function getV3PatchCursor() {
		return (original) => {
			return function patchedServerCommand(server, ns, cursorState, batchSize, options, callback) {
				const resultHandler = typeof options === "function" ? options : callback;
				if (utils.shouldSkipInstrumentation() || typeof resultHandler !== "function") if (typeof options === "function") return original.call(this, server, ns, cursorState, batchSize, options);
				else return original.call(this, server, ns, cursorState, batchSize, options, callback);
				const span = utils.startMongoSpan(utils.getV3SpanAttributes(ns, server, cursorState.cmd, "getMore"));
				const patchedCallback = utils.patchEnd(span, resultHandler);
				if (typeof options === "function") return original.call(this, server, ns, cursorState, batchSize, patchedCallback);
				else return original.call(this, server, ns, cursorState, batchSize, options, patchedCallback);
			};
		};
	}
	function getV4ConnectionPoolCheckOut() {
		return (original) => {
			return function patchedCheckout(callback) {
				const parentSpan = core.getActiveSpan();
				return original.call(this, function(...args) {
					return core.withActiveSpan(parentSpan ?? null, () => callback.apply(this, args));
				});
			};
		};
	}
	exports.getV3PatchCommand = getV3PatchCommand;
	exports.getV3PatchCursor = getV3PatchCursor;
	exports.getV3PatchFind = getV3PatchFind;
	exports.getV3PatchOperation = getV3PatchOperation;
	exports.getV4ConnectionPoolCheckOut = getV4ConnectionPoolCheckOut;
	exports.getV4PatchCommandCallback = getV4PatchCommandCallback;
	exports.getV4PatchCommandPromise = getV4PatchCommandPromise;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/mongo/vendored/instrumentation.js
var require_instrumentation$19 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const instrumentation = require_src$1();
	const core = require_cjs$4();
	const InstrumentationNodeModuleFile = require_InstrumentationNodeModuleFile();
	const patches = require_patches$1();
	const PACKAGE_NAME = "@sentry/instrumentation-mongodb";
	var MongoDBInstrumentation = class extends instrumentation.InstrumentationBase {
		constructor(config = {}) {
			super(PACKAGE_NAME, core.SDK_VERSION, config);
		}
		init() {
			const { v3PatchConnection, v3UnpatchConnection } = this._getV3ConnectionPatches();
			const { v4PatchConnectionCallback, v4PatchConnectionPromise, v4UnpatchConnection } = this._getV4ConnectionPatches();
			const { v4PatchConnectionPool, v4UnpatchConnectionPool } = this._getV4ConnectionPoolPatches();
			return [new instrumentation.InstrumentationNodeModuleDefinition("mongodb", [">=3.3.0 <4"], void 0, void 0, [new InstrumentationNodeModuleFile.InstrumentationNodeModuleFile("mongodb/lib/core/wireprotocol/index.js", [">=3.3.0 <4"], v3PatchConnection, v3UnpatchConnection)]), new instrumentation.InstrumentationNodeModuleDefinition("mongodb", [">=4.0.0 <8"], void 0, void 0, [
				new InstrumentationNodeModuleFile.InstrumentationNodeModuleFile("mongodb/lib/cmap/connection.js", [">=4.0.0 <6.4"], v4PatchConnectionCallback, v4UnpatchConnection),
				new InstrumentationNodeModuleFile.InstrumentationNodeModuleFile("mongodb/lib/cmap/connection.js", [">=6.4.0 <8"], v4PatchConnectionPromise, v4UnpatchConnection),
				new InstrumentationNodeModuleFile.InstrumentationNodeModuleFile("mongodb/lib/cmap/connection_pool.js", [">=4.0.0 <6.4"], v4PatchConnectionPool, v4UnpatchConnectionPool)
			])];
		}
		_getV3ConnectionPatches() {
			return {
				v3PatchConnection: (moduleExports) => {
					if (instrumentation.isWrapped(moduleExports.insert)) this._unwrap(moduleExports, "insert");
					this._wrap(moduleExports, "insert", patches.getV3PatchOperation("insert"));
					if (instrumentation.isWrapped(moduleExports.remove)) this._unwrap(moduleExports, "remove");
					this._wrap(moduleExports, "remove", patches.getV3PatchOperation("remove"));
					if (instrumentation.isWrapped(moduleExports.update)) this._unwrap(moduleExports, "update");
					this._wrap(moduleExports, "update", patches.getV3PatchOperation("update"));
					if (instrumentation.isWrapped(moduleExports.command)) this._unwrap(moduleExports, "command");
					this._wrap(moduleExports, "command", patches.getV3PatchCommand());
					if (instrumentation.isWrapped(moduleExports.query)) this._unwrap(moduleExports, "query");
					this._wrap(moduleExports, "query", patches.getV3PatchFind());
					if (instrumentation.isWrapped(moduleExports.getMore)) this._unwrap(moduleExports, "getMore");
					this._wrap(moduleExports, "getMore", patches.getV3PatchCursor());
					return moduleExports;
				},
				v3UnpatchConnection: (moduleExports) => {
					if (moduleExports === void 0) return;
					this._unwrap(moduleExports, "insert");
					this._unwrap(moduleExports, "remove");
					this._unwrap(moduleExports, "update");
					this._unwrap(moduleExports, "command");
					this._unwrap(moduleExports, "query");
					this._unwrap(moduleExports, "getMore");
				}
			};
		}
		_getV4ConnectionPoolPatches() {
			return {
				v4PatchConnectionPool: (moduleExports) => {
					const poolPrototype = moduleExports.ConnectionPool.prototype;
					if (instrumentation.isWrapped(poolPrototype.checkOut)) this._unwrap(poolPrototype, "checkOut");
					this._wrap(poolPrototype, "checkOut", patches.getV4ConnectionPoolCheckOut());
					return moduleExports;
				},
				v4UnpatchConnectionPool: (moduleExports) => {
					if (moduleExports === void 0) return;
					this._unwrap(moduleExports.ConnectionPool.prototype, "checkOut");
				}
			};
		}
		_getV4ConnectionPatches() {
			return {
				v4PatchConnectionCallback: (moduleExports) => {
					if (instrumentation.isWrapped(moduleExports.Connection.prototype.command)) this._unwrap(moduleExports.Connection.prototype, "command");
					this._wrap(moduleExports.Connection.prototype, "command", patches.getV4PatchCommandCallback());
					return moduleExports;
				},
				v4PatchConnectionPromise: (moduleExports) => {
					if (instrumentation.isWrapped(moduleExports.Connection.prototype.command)) this._unwrap(moduleExports.Connection.prototype, "command");
					this._wrap(moduleExports.Connection.prototype, "command", patches.getV4PatchCommandPromise());
					return moduleExports;
				},
				v4UnpatchConnection: (moduleExports) => {
					if (moduleExports === void 0) return;
					this._unwrap(moduleExports.Connection.prototype, "command");
				}
			};
		}
	};
	exports.MongoDBInstrumentation = MongoDBInstrumentation;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/mongo/index.js
var require_mongo = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const instrumentation = require_instrumentation$19();
	const core = require_cjs$4();
	const nodeCore = require_cjs$2();
	const INTEGRATION_NAME = "Mongo";
	const instrumentMongo = nodeCore.generateInstrumentOnce(INTEGRATION_NAME, () => new instrumentation.MongoDBInstrumentation());
	const _mongoIntegration = (() => {
		return {
			name: INTEGRATION_NAME,
			setupOnce() {
				instrumentMongo();
			}
		};
	});
	const mongoIntegration = core.defineIntegration(_mongoIntegration);
	exports.instrumentMongo = instrumentMongo;
	exports.mongoIntegration = mongoIntegration;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/mongoose/vendored/semconv.js
var require_semconv$8 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const ATTR_DB_MONGODB_COLLECTION = "db.mongodb.collection";
	const ATTR_DB_NAME = "db.name";
	const ATTR_DB_OPERATION = "db.operation";
	const ATTR_DB_SYSTEM = "db.system";
	const ATTR_DB_USER = "db.user";
	const ATTR_NET_PEER_NAME = "net.peer.name";
	const ATTR_NET_PEER_PORT = "net.peer.port";
	exports.ATTR_DB_MONGODB_COLLECTION = ATTR_DB_MONGODB_COLLECTION;
	exports.ATTR_DB_NAME = ATTR_DB_NAME;
	exports.ATTR_DB_OPERATION = ATTR_DB_OPERATION;
	exports.ATTR_DB_SYSTEM = ATTR_DB_SYSTEM;
	exports.ATTR_DB_USER = ATTR_DB_USER;
	exports.ATTR_NET_PEER_NAME = ATTR_NET_PEER_NAME;
	exports.ATTR_NET_PEER_PORT = ATTR_NET_PEER_PORT;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/mongoose/vendored/utils.js
var require_utils$9 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const semconv = require_semconv$8();
	function getAttributesFromCollection(collection) {
		return {
			[semconv.ATTR_DB_MONGODB_COLLECTION]: collection.name,
			[semconv.ATTR_DB_NAME]: collection.conn.name,
			[semconv.ATTR_DB_USER]: collection.conn.user,
			[semconv.ATTR_NET_PEER_NAME]: collection.conn.host,
			[semconv.ATTR_NET_PEER_PORT]: collection.conn.port
		};
	}
	function setErrorStatus(span, error) {
		span.setStatus({
			code: core.SPAN_STATUS_ERROR,
			message: `${error.message} ${error.code ? `
Mongoose Error Code: ${error.code}` : ""}`
		});
	}
	function handlePromiseResponse(execResponse, span) {
		if (!(execResponse instanceof Promise)) {
			span.end();
			return execResponse;
		}
		return execResponse.catch((err) => {
			setErrorStatus(span, err);
			throw err;
		}).finally(() => span.end());
	}
	function handleCallbackResponse(callback, exec, originalThis, span, args) {
		let callbackArgumentIndex = 0;
		if (args.length === 2) callbackArgumentIndex = 1;
		else if (args.length === 3) callbackArgumentIndex = 2;
		args[callbackArgumentIndex] = (err, response) => {
			if (err) setErrorStatus(span, err);
			span.end();
			return callback(err, response);
		};
		return exec.apply(originalThis, args);
	}
	exports.getAttributesFromCollection = getAttributesFromCollection;
	exports.handleCallbackResponse = handleCallbackResponse;
	exports.handlePromiseResponse = handlePromiseResponse;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/mongoose/vendored/mongoose.js
var require_mongoose$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const instrumentation = require_src$1();
	const core = require_cjs$4();
	const semconv = require_semconv$8();
	const utils = require_utils$9();
	const PACKAGE_NAME = "@sentry/instrumentation-mongoose";
	const ORIGIN = "auto.db.otel.mongoose";
	const contextCaptureFunctionsCommon = [
		"deleteOne",
		"deleteMany",
		"find",
		"findOne",
		"estimatedDocumentCount",
		"countDocuments",
		"distinct",
		"where",
		"$where",
		"findOneAndUpdate",
		"findOneAndDelete",
		"findOneAndReplace"
	];
	const contextCaptureFunctions6 = [
		"remove",
		"count",
		"findOneAndRemove",
		...contextCaptureFunctionsCommon
	];
	const contextCaptureFunctions7 = [
		"count",
		"findOneAndRemove",
		...contextCaptureFunctionsCommon
	];
	const contextCaptureFunctions8 = [...contextCaptureFunctionsCommon];
	function getContextCaptureFunctions(moduleVersion) {
		if (!moduleVersion) return contextCaptureFunctionsCommon;
		else if (moduleVersion.startsWith("6.") || moduleVersion.startsWith("5.")) return contextCaptureFunctions6;
		else if (moduleVersion.startsWith("7.")) return contextCaptureFunctions7;
		else return contextCaptureFunctions8;
	}
	function instrumentRemove(moduleVersion) {
		return moduleVersion && (moduleVersion.startsWith("5.") || moduleVersion.startsWith("6.")) || false;
	}
	function needsDocumentMethodPatch(moduleVersion) {
		if (!moduleVersion || !moduleVersion.startsWith("8.")) return false;
		return parseInt(moduleVersion.split(".")[1], 10) >= 21;
	}
	const _STORED_PARENT_SPAN = /* @__PURE__ */ Symbol("stored-parent-span");
	const _ALREADY_INSTRUMENTED = /* @__PURE__ */ Symbol("already-instrumented");
	var MongooseInstrumentation = class extends instrumentation.InstrumentationBase {
		constructor(config = {}) {
			super(PACKAGE_NAME, core.SDK_VERSION, config);
		}
		init() {
			return new instrumentation.InstrumentationNodeModuleDefinition("mongoose", [">=5.9.7 <10"], this.patch.bind(this), this.unpatch.bind(this));
		}
		patch(module$21, moduleVersion) {
			const moduleExports = module$21[Symbol.toStringTag] === "Module" && module$21.default ? module$21.default : module$21;
			this._wrap(moduleExports.Model.prototype, "save", this.patchOnModelMethods("save"));
			moduleExports.Model.prototype.$save = moduleExports.Model.prototype.save;
			if (instrumentRemove(moduleVersion)) this._wrap(moduleExports.Model.prototype, "remove", this.patchOnModelMethods("remove"));
			if (needsDocumentMethodPatch(moduleVersion)) {
				this._wrap(moduleExports.Model.prototype, "updateOne", this._patchDocumentUpdateMethods("updateOne"));
				this._wrap(moduleExports.Model.prototype, "deleteOne", this._patchDocumentUpdateMethods("deleteOne"));
			}
			this._wrap(moduleExports.Query.prototype, "exec", this.patchQueryExec());
			this._wrap(moduleExports.Aggregate.prototype, "exec", this.patchAggregateExec());
			getContextCaptureFunctions(moduleVersion).forEach((funcName) => {
				this._wrap(moduleExports.Query.prototype, funcName, this.patchAndCaptureSpanContext(funcName));
			});
			this._wrap(moduleExports.Model, "aggregate", this.patchModelAggregate());
			this._wrap(moduleExports.Model, "insertMany", this.patchModelStatic("insertMany"));
			this._wrap(moduleExports.Model, "bulkWrite", this.patchModelStatic("bulkWrite"));
			return moduleExports;
		}
		unpatch(module$22, moduleVersion) {
			const moduleExports = module$22[Symbol.toStringTag] === "Module" && module$22.default ? module$22.default : module$22;
			const contextCaptureFunctions = getContextCaptureFunctions(moduleVersion);
			this._unwrap(moduleExports.Model.prototype, "save");
			moduleExports.Model.prototype.$save = moduleExports.Model.prototype.save;
			if (instrumentRemove(moduleVersion)) this._unwrap(moduleExports.Model.prototype, "remove");
			if (needsDocumentMethodPatch(moduleVersion)) {
				this._unwrap(moduleExports.Model.prototype, "updateOne");
				this._unwrap(moduleExports.Model.prototype, "deleteOne");
			}
			this._unwrap(moduleExports.Query.prototype, "exec");
			this._unwrap(moduleExports.Aggregate.prototype, "exec");
			contextCaptureFunctions.forEach((funcName) => {
				this._unwrap(moduleExports.Query.prototype, funcName);
			});
			this._unwrap(moduleExports.Model, "aggregate");
			this._unwrap(moduleExports.Model, "insertMany");
			this._unwrap(moduleExports.Model, "bulkWrite");
		}
		patchAggregateExec() {
			const self = this;
			return (originalAggregate) => {
				return function exec(callback) {
					const parentSpan = this[_STORED_PARENT_SPAN];
					const span = self._startSpan(this._model.collection, this._model?.modelName, "aggregate", parentSpan);
					return self._handleResponse(span, originalAggregate, this, arguments, callback);
				};
			};
		}
		patchQueryExec() {
			const self = this;
			return (originalExec) => {
				return function exec(callback) {
					if (this[_ALREADY_INSTRUMENTED]) return originalExec.apply(this, arguments);
					const parentSpan = this[_STORED_PARENT_SPAN];
					const span = self._startSpan(this.mongooseCollection, this.model.modelName, this.op, parentSpan);
					return self._handleResponse(span, originalExec, this, arguments, callback);
				};
			};
		}
		patchOnModelMethods(op) {
			const self = this;
			return (originalOnModelFunction) => {
				return function method(options, callback) {
					const span = self._startSpan(this.constructor.collection, this.constructor.modelName, op);
					if (options instanceof Function) callback = options;
					return self._handleResponse(span, originalOnModelFunction, this, arguments, callback);
				};
			};
		}
		_patchDocumentUpdateMethods(op) {
			const self = this;
			return (originalMethod) => {
				return function method(update, options, callback) {
					let actualCallback = callback;
					if (typeof update === "function") actualCallback = update;
					else if (typeof options === "function") actualCallback = options;
					const span = self._startSpan(this.constructor.collection, this.constructor.modelName, op);
					const result = self._handleResponse(span, originalMethod, this, arguments, actualCallback);
					if (result && typeof result === "object") result[_ALREADY_INSTRUMENTED] = true;
					return result;
				};
			};
		}
		patchModelStatic(op) {
			const self = this;
			return (original) => {
				return function patchedStatic(docsOrOps, options, callback) {
					if (typeof options === "function") callback = options;
					const span = self._startSpan(this.collection, this.modelName, op);
					return self._handleResponse(span, original, this, arguments, callback);
				};
			};
		}
		patchModelAggregate() {
			return (original) => {
				return function captureSpanContext() {
					const currentSpan = core.getActiveSpan();
					const aggregate = original.apply(this, arguments);
					if (aggregate) aggregate[_STORED_PARENT_SPAN] = currentSpan;
					return aggregate;
				};
			};
		}
		patchAndCaptureSpanContext(_funcName) {
			return (original) => {
				return function captureSpanContext() {
					this[_STORED_PARENT_SPAN] = core.getActiveSpan();
					return original.apply(this, arguments);
				};
			};
		}
		_startSpan(collection, modelName, operation, parentSpan) {
			const attributes = {
				...utils.getAttributesFromCollection(collection),
				[semconv.ATTR_DB_OPERATION]: operation,
				[semconv.ATTR_DB_SYSTEM]: "mongoose",
				[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: ORIGIN
			};
			return core.startInactiveSpan({
				name: `mongoose.${modelName}.${operation}`,
				kind: core.SPAN_KIND.CLIENT,
				attributes,
				parentSpan
			});
		}
		_handleResponse(span, exec, originalThis, args, callback) {
			return core.withActiveSpan(span, () => {
				if (callback instanceof Function) return utils.handleCallbackResponse(callback, exec, originalThis, span, args);
				else {
					const response = exec.apply(originalThis, args);
					return utils.handlePromiseResponse(response, span);
				}
			});
		}
	};
	exports.MongooseInstrumentation = MongooseInstrumentation;
	exports._ALREADY_INSTRUMENTED = _ALREADY_INSTRUMENTED;
	exports._STORED_PARENT_SPAN = _STORED_PARENT_SPAN;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/mongoose/index.js
var require_mongoose = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const mongoose = require_mongoose$1();
	const core = require_cjs$4();
	const nodeCore = require_cjs$2();
	const INTEGRATION_NAME = "Mongoose";
	const instrumentMongoose = nodeCore.generateInstrumentOnce(INTEGRATION_NAME, () => new mongoose.MongooseInstrumentation());
	const _mongooseIntegration = (() => {
		return {
			name: INTEGRATION_NAME,
			setupOnce() {
				instrumentMongoose();
			}
		};
	});
	const mongooseIntegration = core.defineIntegration(_mongooseIntegration);
	exports.instrumentMongoose = instrumentMongoose;
	exports.mongooseIntegration = mongooseIntegration;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/mysql/vendored/semconv.js
var require_semconv$7 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const ATTR_DB_CONNECTION_STRING = "db.connection_string";
	const ATTR_DB_NAME = "db.name";
	const ATTR_DB_STATEMENT = "db.statement";
	const ATTR_DB_SYSTEM = "db.system";
	const ATTR_DB_USER = "db.user";
	const ATTR_NET_PEER_NAME = "net.peer.name";
	const ATTR_NET_PEER_PORT = "net.peer.port";
	const DB_SYSTEM_VALUE_MYSQL = "mysql";
	const METRIC_DB_CLIENT_CONNECTIONS_USAGE = "db.client.connections.usage";
	exports.ATTR_DB_CONNECTION_STRING = ATTR_DB_CONNECTION_STRING;
	exports.ATTR_DB_NAME = ATTR_DB_NAME;
	exports.ATTR_DB_STATEMENT = ATTR_DB_STATEMENT;
	exports.ATTR_DB_SYSTEM = ATTR_DB_SYSTEM;
	exports.ATTR_DB_USER = ATTR_DB_USER;
	exports.ATTR_NET_PEER_NAME = ATTR_NET_PEER_NAME;
	exports.ATTR_NET_PEER_PORT = ATTR_NET_PEER_PORT;
	exports.DB_SYSTEM_VALUE_MYSQL = DB_SYSTEM_VALUE_MYSQL;
	exports.METRIC_DB_CLIENT_CONNECTIONS_USAGE = METRIC_DB_CLIENT_CONNECTIONS_USAGE;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/mysql/vendored/AttributeNames.js
var require_AttributeNames$4 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	var AttributeNames = /* @__PURE__ */ ((AttributeNames2) => {
		AttributeNames2["MYSQL_VALUES"] = "db.mysql.values";
		return AttributeNames2;
	})(AttributeNames || {});
	exports.AttributeNames = AttributeNames;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/mysql/vendored/utils.js
var require_utils$8 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	function getConfig(config) {
		const { host, port, database, user } = config && config.connectionConfig || config || {};
		return {
			host,
			port,
			database,
			user
		};
	}
	function getJDBCString(host, port, database) {
		let jdbcString = `jdbc:mysql://${host || "localhost"}`;
		if (typeof port === "number") jdbcString += `:${port}`;
		if (typeof database === "string") jdbcString += `/${database}`;
		return jdbcString;
	}
	function getDbQueryText(query) {
		if (typeof query === "string") return query;
		else return query.sql;
	}
	function getDbValues(query, values) {
		if (typeof query === "string") return arrayStringifyHelper(values);
		else return arrayStringifyHelper(values || query.values);
	}
	function getSpanName(query) {
		const rawQuery = typeof query === "object" ? query.sql : query;
		const firstSpace = rawQuery?.indexOf(" ");
		if (typeof firstSpace === "number" && firstSpace !== -1) return rawQuery?.substring(0, firstSpace);
		return rawQuery;
	}
	function arrayStringifyHelper(arr) {
		if (arr) return `[${arr.toString()}]`;
		return "";
	}
	function getPoolNameOld(pool) {
		const c = pool.config.connectionConfig;
		let poolName = "";
		poolName += c?.host ? `host: '${c.host}', ` : "";
		poolName += c?.port ? `port: ${c.port}, ` : "";
		poolName += c?.database ? `database: '${c.database}', ` : "";
		poolName += c?.user ? `user: '${c.user}'` : "";
		if (!c?.user) poolName = poolName.substring(0, poolName.length - 2);
		return poolName.trim();
	}
	exports.arrayStringifyHelper = arrayStringifyHelper;
	exports.getConfig = getConfig;
	exports.getDbQueryText = getDbQueryText;
	exports.getDbValues = getDbValues;
	exports.getJDBCString = getJDBCString;
	exports.getPoolNameOld = getPoolNameOld;
	exports.getSpanName = getSpanName;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/mysql/vendored/instrumentation.js
var require_instrumentation$18 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const api = require_src();
	const instrumentation = require_src$1();
	const semanticConventions = require_src$3();
	const semconv = require_semconv$7();
	const AttributeNames = require_AttributeNames$4();
	const utils = require_utils$8();
	const core = require_cjs$4();
	const PACKAGE_NAME = "@sentry/instrumentation-mysql";
	var MySQLInstrumentation = class extends instrumentation.InstrumentationBase {
		constructor(config = {}) {
			super(PACKAGE_NAME, core.SDK_VERSION, config);
			this._setSemconvStabilityFromEnv();
		}
		_setSemconvStabilityFromEnv() {
			this._netSemconvStability = instrumentation.semconvStabilityFromStr("http", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
			this._dbSemconvStability = instrumentation.semconvStabilityFromStr("database", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
		}
		_updateMetricInstruments() {
			this._connectionsUsageOld = this.meter.createUpDownCounter(semconv.METRIC_DB_CLIENT_CONNECTIONS_USAGE, {
				description: "The number of connections that are currently in state described by the state attribute.",
				unit: "{connection}"
			});
		}
		/**
		* Convenience function for updating the `db.client.connections.usage` metric.
		* The name "count" comes from the eventually replacement for this metric per
		* https://opentelemetry.io/docs/specs/semconv/non-normative/db-migration/#database-client-connection-count
		*/
		_connCountAdd(n, poolNameOld, state) {
			this._connectionsUsageOld?.add(n, {
				state,
				name: poolNameOld
			});
		}
		init() {
			return [new instrumentation.InstrumentationNodeModuleDefinition("mysql", [">=2.0.0 <3"], (moduleExports) => {
				if (instrumentation.isWrapped(moduleExports.createConnection)) this._unwrap(moduleExports, "createConnection");
				this._wrap(moduleExports, "createConnection", this._patchCreateConnection());
				if (instrumentation.isWrapped(moduleExports.createPool)) this._unwrap(moduleExports, "createPool");
				this._wrap(moduleExports, "createPool", this._patchCreatePool());
				if (instrumentation.isWrapped(moduleExports.createPoolCluster)) this._unwrap(moduleExports, "createPoolCluster");
				this._wrap(moduleExports, "createPoolCluster", this._patchCreatePoolCluster());
				return moduleExports;
			}, (moduleExports) => {
				if (moduleExports === void 0) return;
				this._unwrap(moduleExports, "createConnection");
				this._unwrap(moduleExports, "createPool");
				this._unwrap(moduleExports, "createPoolCluster");
			})];
		}
		_patchCreateConnection() {
			return (originalCreateConnection) => {
				const thisPlugin = this;
				return function createConnection(_connectionUri) {
					const originalResult = originalCreateConnection(...arguments);
					thisPlugin._wrap(originalResult, "query", thisPlugin._patchQuery(originalResult));
					return originalResult;
				};
			};
		}
		_patchCreatePool() {
			return (originalCreatePool) => {
				const thisPlugin = this;
				return function createPool(_config) {
					const pool = originalCreatePool(...arguments);
					thisPlugin._wrap(pool, "query", thisPlugin._patchQuery(pool));
					thisPlugin._wrap(pool, "getConnection", thisPlugin._patchGetConnection(pool));
					thisPlugin._wrap(pool, "end", thisPlugin._patchPoolEnd(pool));
					thisPlugin._setPoolCallbacks(pool, "");
					return pool;
				};
			};
		}
		_patchPoolEnd(pool) {
			return (originalPoolEnd) => {
				const thisPlugin = this;
				return function end(callback) {
					const nAll = pool._allConnections.length;
					const nFree = pool._freeConnections.length;
					const nUsed = nAll - nFree;
					const poolNameOld = utils.getPoolNameOld(pool);
					thisPlugin._connCountAdd(-nUsed, poolNameOld, "used");
					thisPlugin._connCountAdd(-nFree, poolNameOld, "idle");
					originalPoolEnd.apply(pool, arguments);
				};
			};
		}
		_patchCreatePoolCluster() {
			return (originalCreatePoolCluster) => {
				const thisPlugin = this;
				return function createPool(_config) {
					const cluster = originalCreatePoolCluster(...arguments);
					thisPlugin._wrap(cluster, "getConnection", thisPlugin._patchGetConnection(cluster));
					thisPlugin._wrap(cluster, "add", thisPlugin._patchAdd(cluster));
					return cluster;
				};
			};
		}
		_patchAdd(cluster) {
			return (originalAdd) => {
				const thisPlugin = this;
				return function add(id, config) {
					if (!thisPlugin["_enabled"]) {
						thisPlugin._unwrap(cluster, "add");
						return originalAdd.apply(cluster, arguments);
					}
					originalAdd.apply(cluster, arguments);
					const nodes = cluster["_nodes"];
					if (nodes) {
						const pool = nodes[typeof id === "object" ? "CLUSTER::" + cluster._lastId : String(id)].pool;
						thisPlugin._setPoolCallbacks(pool, id);
					}
				};
			};
		}
		_patchGetConnection(pool) {
			return (originalGetConnection) => {
				const thisPlugin = this;
				return function getConnection(arg1, arg2, arg3) {
					if (!thisPlugin["_enabled"]) {
						thisPlugin._unwrap(pool, "getConnection");
						return originalGetConnection.apply(pool, arguments);
					}
					if (arguments.length === 1 && typeof arg1 === "function") {
						const patchFn = thisPlugin._getConnectionCallbackPatchFn(arg1);
						return originalGetConnection.call(pool, patchFn);
					}
					if (arguments.length === 2 && typeof arg2 === "function") {
						const patchFn = thisPlugin._getConnectionCallbackPatchFn(arg2);
						return originalGetConnection.call(pool, arg1, patchFn);
					}
					if (arguments.length === 3 && typeof arg3 === "function") {
						const patchFn = thisPlugin._getConnectionCallbackPatchFn(arg3);
						return originalGetConnection.call(pool, arg1, arg2, patchFn);
					}
					return originalGetConnection.apply(pool, arguments);
				};
			};
		}
		_getConnectionCallbackPatchFn(cb) {
			const thisPlugin = this;
			const activeContext = api.context.active();
			return function(err, connection) {
				if (connection) {
					if (!instrumentation.isWrapped(connection.query)) thisPlugin._wrap(connection, "query", thisPlugin._patchQuery(connection));
				}
				if (typeof cb === "function") api.context.with(activeContext, cb, this, err, connection);
			};
		}
		_patchQuery(connection) {
			return (originalQuery) => {
				const thisPlugin = this;
				return function query(query, _valuesOrCallback, _callback) {
					if (!thisPlugin["_enabled"]) {
						thisPlugin._unwrap(connection, "query");
						return originalQuery.apply(connection, arguments);
					}
					const attributes = {};
					const { host, port, database, user } = utils.getConfig(connection.config);
					const portNumber = parseInt(port, 10);
					const dbQueryText = utils.getDbQueryText(query);
					if (thisPlugin._dbSemconvStability & instrumentation.SemconvStability.OLD) {
						attributes[semconv.ATTR_DB_SYSTEM] = semconv.DB_SYSTEM_VALUE_MYSQL;
						attributes[semconv.ATTR_DB_CONNECTION_STRING] = utils.getJDBCString(host, port, database);
						attributes[semconv.ATTR_DB_NAME] = database;
						attributes[semconv.ATTR_DB_USER] = user;
						attributes[semconv.ATTR_DB_STATEMENT] = dbQueryText;
					}
					if (thisPlugin._dbSemconvStability & instrumentation.SemconvStability.STABLE) {
						attributes[semanticConventions.ATTR_DB_SYSTEM_NAME] = semanticConventions.DB_SYSTEM_NAME_VALUE_MYSQL;
						attributes[semanticConventions.ATTR_DB_NAMESPACE] = database;
						attributes[semanticConventions.ATTR_DB_QUERY_TEXT] = dbQueryText;
					}
					if (thisPlugin._netSemconvStability & instrumentation.SemconvStability.OLD) {
						attributes[semconv.ATTR_NET_PEER_NAME] = host;
						if (!isNaN(portNumber)) attributes[semconv.ATTR_NET_PEER_PORT] = portNumber;
					}
					if (thisPlugin._netSemconvStability & instrumentation.SemconvStability.STABLE) {
						attributes[semanticConventions.ATTR_SERVER_ADDRESS] = host;
						if (!isNaN(portNumber)) attributes[semanticConventions.ATTR_SERVER_PORT] = portNumber;
					}
					const span = thisPlugin.tracer.startSpan(utils.getSpanName(query), {
						kind: api.SpanKind.CLIENT,
						attributes
					});
					if (thisPlugin.getConfig().enhancedDatabaseReporting) {
						let values;
						if (Array.isArray(_valuesOrCallback)) values = _valuesOrCallback;
						else if (arguments[2]) values = [_valuesOrCallback];
						span.setAttribute(AttributeNames.AttributeNames.MYSQL_VALUES, utils.getDbValues(query, values));
					}
					const cbIndex = Array.from(arguments).findIndex((arg) => typeof arg === "function");
					const parentContext = api.context.active();
					if (cbIndex === -1) {
						const streamableQuery = api.context.with(api.trace.setSpan(api.context.active(), span), () => {
							return originalQuery.apply(connection, arguments);
						});
						api.context.bind(parentContext, streamableQuery);
						return streamableQuery.on("error", (err) => span.setStatus({
							code: api.SpanStatusCode.ERROR,
							message: err.message
						})).on("end", () => {
							span.end();
						});
					} else {
						thisPlugin._wrap(arguments, cbIndex, thisPlugin._patchCallbackQuery(span, parentContext));
						return api.context.with(api.trace.setSpan(api.context.active(), span), () => {
							return originalQuery.apply(connection, arguments);
						});
					}
				};
			};
		}
		_patchCallbackQuery(span, parentContext) {
			return (originalCallback) => {
				return function(err, results, fields) {
					if (err) span.setStatus({
						code: api.SpanStatusCode.ERROR,
						message: err.message
					});
					span.end();
					return api.context.with(parentContext, () => originalCallback(...arguments));
				};
			};
		}
		_setPoolCallbacks(pool, id) {
			const poolNameOld = id || utils.getPoolNameOld(pool);
			pool.on("connection", (_connection) => {
				this._connCountAdd(1, poolNameOld, "idle");
			});
			pool.on("acquire", (_connection) => {
				this._connCountAdd(-1, poolNameOld, "idle");
				this._connCountAdd(1, poolNameOld, "used");
			});
			pool.on("release", (_connection) => {
				this._connCountAdd(1, poolNameOld, "idle");
				this._connCountAdd(-1, poolNameOld, "used");
			});
		}
	};
	exports.MySQLInstrumentation = MySQLInstrumentation;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/mysql/index.js
var require_mysql$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const instrumentation = require_instrumentation$18();
	const core = require_cjs$4();
	const nodeCore = require_cjs$2();
	const INTEGRATION_NAME = "Mysql";
	const instrumentMysql = nodeCore.generateInstrumentOnce(INTEGRATION_NAME, () => new instrumentation.MySQLInstrumentation({}));
	const _mysqlIntegration = (() => {
		return {
			name: INTEGRATION_NAME,
			setupOnce() {
				instrumentMysql();
			}
		};
	});
	const mysqlIntegration = core.defineIntegration(_mysqlIntegration);
	exports.instrumentMysql = instrumentMysql;
	exports.mysqlIntegration = mysqlIntegration;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/mysql2/vendored/semconv.js
var require_semconv$6 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const ATTR_DB_CONNECTION_STRING = "db.connection_string";
	const ATTR_DB_NAME = "db.name";
	const ATTR_DB_STATEMENT = "db.statement";
	const ATTR_DB_SYSTEM = "db.system";
	const ATTR_DB_USER = "db.user";
	const ATTR_NET_PEER_NAME = "net.peer.name";
	const ATTR_NET_PEER_PORT = "net.peer.port";
	const DB_SYSTEM_VALUE_MYSQL = "mysql";
	exports.ATTR_DB_CONNECTION_STRING = ATTR_DB_CONNECTION_STRING;
	exports.ATTR_DB_NAME = ATTR_DB_NAME;
	exports.ATTR_DB_STATEMENT = ATTR_DB_STATEMENT;
	exports.ATTR_DB_SYSTEM = ATTR_DB_SYSTEM;
	exports.ATTR_DB_USER = ATTR_DB_USER;
	exports.ATTR_NET_PEER_NAME = ATTR_NET_PEER_NAME;
	exports.ATTR_NET_PEER_PORT = ATTR_NET_PEER_PORT;
	exports.DB_SYSTEM_VALUE_MYSQL = DB_SYSTEM_VALUE_MYSQL;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/mysql2/vendored/utils.js
var require_utils$7 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const semconv = require_semconv$6();
	function getConnectionAttributes(config) {
		const { host, port, database, user } = getConfig(config);
		const attrs = {
			[semconv.ATTR_DB_CONNECTION_STRING]: getJDBCString(host, port, database),
			[semconv.ATTR_DB_NAME]: database,
			[semconv.ATTR_DB_USER]: user,
			[semconv.ATTR_NET_PEER_NAME]: host
		};
		const portNumber = parseInt(port, 10);
		if (!isNaN(portNumber)) attrs[semconv.ATTR_NET_PEER_PORT] = portNumber;
		return attrs;
	}
	function getConfig(config) {
		const { host, port, database, user } = config?.connectionConfig || config || {};
		return {
			host,
			port,
			database,
			user
		};
	}
	function getJDBCString(host, port, database) {
		let jdbcString = `jdbc:mysql://${host || "localhost"}`;
		if (typeof port === "number") jdbcString += `:${port}`;
		if (typeof database === "string") jdbcString += `/${database}`;
		return jdbcString;
	}
	function getQueryText(query, format, values) {
		const [querySql, queryValues] = typeof query === "string" ? [query, values] : [query.sql, hasValues(query) ? values || query.values : values];
		try {
			if (format && queryValues) return format(querySql, queryValues);
			else return querySql;
		} catch {
			return "Could not determine the query due to an error in formatting";
		}
	}
	function hasValues(obj) {
		return "values" in obj;
	}
	function getSpanName(query) {
		const rawQuery = typeof query === "object" ? query.sql : query;
		const firstSpace = rawQuery?.indexOf(" ");
		if (typeof firstSpace === "number" && firstSpace !== -1) return rawQuery?.substring(0, firstSpace);
		return rawQuery;
	}
	const once = (fn) => {
		let called = false;
		return (...args) => {
			if (called) return;
			called = true;
			return fn(...args);
		};
	};
	function getConnectionPrototypeToInstrument(connection) {
		const connectionPrototype = connection.prototype;
		const basePrototype = Object.getPrototypeOf(connectionPrototype);
		if (typeof basePrototype?.query === "function" && typeof basePrototype?.execute === "function") return basePrototype;
		return connectionPrototype;
	}
	exports.getConnectionAttributes = getConnectionAttributes;
	exports.getConnectionPrototypeToInstrument = getConnectionPrototypeToInstrument;
	exports.getQueryText = getQueryText;
	exports.getSpanName = getSpanName;
	exports.once = once;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/mysql2/vendored/instrumentation.js
var require_instrumentation$17 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const instrumentation = require_src$1();
	const core = require_cjs$4();
	const InstrumentationNodeModuleFile = require_InstrumentationNodeModuleFile();
	const semconv = require_semconv$6();
	const utils = require_utils$7();
	const PACKAGE_NAME = "@sentry/instrumentation-mysql2";
	const ORIGIN = "auto.db.otel.mysql2";
	const supportedVersions = [">=1.4.2 <4"];
	var MySQL2Instrumentation = class extends instrumentation.InstrumentationBase {
		constructor(config = {}) {
			super(PACKAGE_NAME, core.SDK_VERSION, config);
		}
		init() {
			let format;
			function setFormatFunction(moduleExports) {
				if (!format && moduleExports.format) format = moduleExports.format;
			}
			const patch = (ConnectionPrototype) => {
				if (instrumentation.isWrapped(ConnectionPrototype.query)) this._unwrap(ConnectionPrototype, "query");
				this._wrap(ConnectionPrototype, "query", this._patchQuery(format));
				if (instrumentation.isWrapped(ConnectionPrototype.execute)) this._unwrap(ConnectionPrototype, "execute");
				this._wrap(ConnectionPrototype, "execute", this._patchQuery(format));
			};
			const unpatch = (ConnectionPrototype) => {
				this._unwrap(ConnectionPrototype, "query");
				this._unwrap(ConnectionPrototype, "execute");
			};
			return [new instrumentation.InstrumentationNodeModuleDefinition("mysql2", supportedVersions, (moduleExports) => {
				setFormatFunction(moduleExports);
				return moduleExports;
			}, () => {}, [new InstrumentationNodeModuleFile.InstrumentationNodeModuleFile("mysql2/promise.js", supportedVersions, (moduleExports) => {
				setFormatFunction(moduleExports);
				return moduleExports;
			}, () => {}), new InstrumentationNodeModuleFile.InstrumentationNodeModuleFile("mysql2/lib/connection.js", supportedVersions, (moduleExports) => {
				patch(utils.getConnectionPrototypeToInstrument(moduleExports));
				return moduleExports;
			}, (moduleExports) => {
				if (moduleExports === void 0) return;
				unpatch(utils.getConnectionPrototypeToInstrument(moduleExports));
			})])];
		}
		_patchQuery(format) {
			const thisPlugin = this;
			return (originalQuery) => {
				return function query(query, _valuesOrCallback, _callback) {
					let values;
					if (Array.isArray(_valuesOrCallback)) values = _valuesOrCallback;
					else if (arguments[2]) values = [_valuesOrCallback];
					const attributes = {
						...utils.getConnectionAttributes(this.config),
						[semconv.ATTR_DB_SYSTEM]: semconv.DB_SYSTEM_VALUE_MYSQL,
						[semconv.ATTR_DB_STATEMENT]: utils.getQueryText(query, format, values),
						[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: ORIGIN
					};
					const span = core.startInactiveSpan({
						name: utils.getSpanName(query),
						kind: core.SPAN_KIND.CLIENT,
						attributes
					});
					const endSpan = utils.once((err) => {
						if (err) span.setStatus({
							code: core.SPAN_STATUS_ERROR,
							message: err.message
						});
						span.end();
					});
					if (arguments.length === 1) {
						if (typeof query.onResult === "function") thisPlugin._wrap(query, "onResult", thisPlugin._patchCallbackQuery(endSpan));
						const streamableQuery = originalQuery.apply(this, arguments);
						streamableQuery.once("error", (err) => {
							endSpan(err);
						}).once("result", () => {
							endSpan();
						});
						return streamableQuery;
					}
					if (typeof arguments[1] === "function") thisPlugin._wrap(arguments, 1, thisPlugin._patchCallbackQuery(endSpan));
					else if (typeof arguments[2] === "function") thisPlugin._wrap(arguments, 2, thisPlugin._patchCallbackQuery(endSpan));
					return originalQuery.apply(this, arguments);
				};
			};
		}
		_patchCallbackQuery(endSpan) {
			return (originalCallback) => {
				return function(...args) {
					endSpan(args[0]);
					return originalCallback(...args);
				};
			};
		}
	};
	exports.MySQL2Instrumentation = MySQL2Instrumentation;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/mysql2/index.js
var require_mysql2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const instrumentation = require_instrumentation$17();
	const core = require_cjs$4();
	const nodeCore = require_cjs$2();
	const INTEGRATION_NAME = "Mysql2";
	const instrumentMysql2 = nodeCore.generateInstrumentOnce(INTEGRATION_NAME, () => new instrumentation.MySQL2Instrumentation());
	const _mysql2Integration = (() => {
		return {
			name: INTEGRATION_NAME,
			setupOnce() {
				instrumentMysql2();
			}
		};
	});
	const mysql2Integration = core.defineIntegration(_mysql2Integration);
	exports.instrumentMysql2 = instrumentMysql2;
	exports.mysql2Integration = mysql2Integration;
}));
//#endregion
//#region node_modules/@sentry/server-utils/build/cjs/debug-build.js
var require_debug_build$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	exports.DEBUG_BUILD = typeof __SENTRY_DEBUG__ === "undefined" || __SENTRY_DEBUG__;
}));
//#endregion
//#region node_modules/@sentry/server-utils/build/cjs/tracing-channel.js
var require_tracing_channel = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const debugBuild = require_debug_build$1();
	const NOOP = () => {};
	function bindTracingChannelToSpan(channel, getSpan, opts) {
		const handle = bindSpanToChannelStore(channel, getSpan);
		const beforeSpanEnd = opts?.beforeSpanEnd;
		const getErrorHint = (e) => {
			if (typeof opts?.captureError === "function") return opts.captureError(e);
			return { mechanism: {
				type: "auto.diagnostic_channels.bind_span",
				handled: false
			} };
		};
		const subscribers = {
			start: NOOP,
			asyncStart: NOOP,
			end(data) {
				if ("error" in data || "result" in data) endBoundSpan(data, beforeSpanEnd);
			},
			error(data) {
				const span = data._sentrySpan;
				if (!span) return;
				if (opts?.captureError) core.captureException(data.error, getErrorHint(data.error));
				span.setStatus({
					code: core.SPAN_STATUS_ERROR,
					message: getErrorMessage(data.error)
				});
			},
			asyncEnd(data) {
				endBoundSpan(data, beforeSpanEnd);
			}
		};
		handle.channel.subscribe(subscribers);
		return {
			channel: handle.channel,
			unbind: () => {
				handle.channel.unsubscribe(subscribers);
				handle.unbind();
			}
		};
	}
	function bindSpanToChannelStore(channel, getSpan) {
		const binding = core._INTERNAL_getTracingChannelBinding();
		if (!binding) {
			debugBuild.DEBUG_BUILD && core.debug.log("[TracingChannel] Could not access async context binding.");
			return {
				channel,
				unbind: NOOP
			};
		}
		const asyncLocalStorage = binding.asyncLocalStorage;
		channel.start.bindStore(asyncLocalStorage, (data) => {
			const span = getSpan(data);
			if (!span) return asyncLocalStorage.getStore();
			data._sentrySpan = span;
			return binding.getStoreWithActiveSpan(span);
		});
		return {
			channel,
			unbind: () => {
				channel.start.unbindStore(asyncLocalStorage);
			}
		};
	}
	function endBoundSpan(data, beforeSpanEnd) {
		const span = data._sentrySpan;
		if (!span) return;
		beforeSpanEnd?.(span, data);
		span.end();
	}
	function getErrorMessage(error) {
		if (error && typeof error === "object" && "message" in error && typeof error.message === "string") return error.message;
		return String(error);
	}
	exports.bindTracingChannelToSpan = bindTracingChannelToSpan;
}));
//#endregion
//#region node_modules/@sentry/server-utils/build/cjs/redis/redis-dc-subscriber.js
var require_redis_dc_subscriber = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const attributes = require_attributes();
	const core = require_cjs$4();
	const debugBuild = require_debug_build$1();
	const tracingChannel = require_tracing_channel();
	const REDIS_DC_CHANNEL_COMMAND = "node-redis:command";
	const REDIS_DC_CHANNEL_BATCH = "node-redis:batch";
	const REDIS_DC_CHANNEL_CONNECT = "node-redis:connect";
	const IOREDIS_DC_CHANNEL_COMMAND = "ioredis:command";
	const IOREDIS_DC_CHANNEL_CONNECT = "ioredis:connect";
	const ORIGIN = "auto.db.redis.diagnostic_channel";
	const DB_SYSTEM_NAME_VALUE_REDIS = "redis";
	let subscribed = false;
	let currentResponseHook;
	let activeUnbinds = [];
	function subscribeRedisDiagnosticChannels(tracingChannel, responseHook) {
		currentResponseHook = responseHook;
		if (subscribed) return;
		subscribed = true;
		try {
			activeUnbinds.push(setupCommandChannel(tracingChannel, REDIS_DC_CHANNEL_COMMAND, (data) => data.args.slice(1)), setupBatchChannel(tracingChannel, REDIS_DC_CHANNEL_BATCH, (data) => data.batchMode === "PIPELINE" ? "PIPELINE" : "MULTI"), setupConnectChannel(tracingChannel, REDIS_DC_CHANNEL_CONNECT), setupCommandChannel(tracingChannel, IOREDIS_DC_CHANNEL_COMMAND, (data) => data.args), setupConnectChannel(tracingChannel, IOREDIS_DC_CHANNEL_CONNECT));
		} catch {
			debugBuild.DEBUG_BUILD && core.debug.log("Redis node:diagnostics_channel subscription failed.");
		}
	}
	function setupCommandChannel(tracingChannel$1, channelName, getCommandArgs) {
		return tracingChannel.bindTracingChannelToSpan(tracingChannel$1(channelName), (data) => {
			const args = getCommandArgs(data);
			const statement = args.length ? `${data.command} ${args.join(" ")}` : data.command;
			return core.startInactiveSpan({
				name: `redis-${data.command}`,
				attributes: {
					[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: ORIGIN,
					[core.SEMANTIC_ATTRIBUTE_SENTRY_OP]: "db.redis",
					[attributes.DB_SYSTEM_NAME]: DB_SYSTEM_NAME_VALUE_REDIS,
					[attributes.DB_QUERY_TEXT]: statement,
					...data.serverAddress != null ? { [attributes.SERVER_ADDRESS]: data.serverAddress } : {},
					...data.serverPort != null ? { [attributes.SERVER_PORT]: data.serverPort } : {}
				}
			});
		}, {
			captureError: false,
			beforeSpanEnd(span, data) {
				if ("error" in data) return;
				runResponseHook(span, data.command, getCommandArgs(data), data.result);
			}
		}).unbind;
	}
	function setupBatchChannel(tracingChannel$1, channelName, getOperationName) {
		return tracingChannel.bindTracingChannelToSpan(tracingChannel$1(channelName), (data) => {
			return core.startInactiveSpan({
				name: getOperationName(data),
				attributes: {
					[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: ORIGIN,
					[core.SEMANTIC_ATTRIBUTE_SENTRY_OP]: "db.redis",
					[attributes.DB_SYSTEM_NAME]: DB_SYSTEM_NAME_VALUE_REDIS,
					...Number(data.batchSize) > 1 ? { [attributes.DB_OPERATION_BATCH_SIZE]: data.batchSize } : {},
					...data.serverAddress != null ? { [attributes.SERVER_ADDRESS]: data.serverAddress } : {},
					...data.serverPort != null ? { [attributes.SERVER_PORT]: data.serverPort } : {}
				}
			});
		}, { captureError: false }).unbind;
	}
	function setupConnectChannel(tracingChannel$1, channelName) {
		return tracingChannel.bindTracingChannelToSpan(tracingChannel$1(channelName), (data) => {
			return core.startInactiveSpan({
				name: "redis-connect",
				attributes: {
					[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: ORIGIN,
					[core.SEMANTIC_ATTRIBUTE_SENTRY_OP]: "db.redis.connect",
					[attributes.DB_SYSTEM_NAME]: DB_SYSTEM_NAME_VALUE_REDIS,
					...data.serverAddress != null ? { [attributes.SERVER_ADDRESS]: data.serverAddress } : {},
					...data.serverPort != null ? { [attributes.SERVER_PORT]: data.serverPort } : {}
				}
			});
		}, { captureError: false }).unbind;
	}
	function runResponseHook(span, command, args, result) {
		const hook = currentResponseHook;
		if (!hook) return;
		try {
			hook(span, command, args, result);
		} catch {}
	}
	exports.IOREDIS_DC_CHANNEL_COMMAND = IOREDIS_DC_CHANNEL_COMMAND;
	exports.IOREDIS_DC_CHANNEL_CONNECT = IOREDIS_DC_CHANNEL_CONNECT;
	exports.REDIS_DC_CHANNEL_BATCH = REDIS_DC_CHANNEL_BATCH;
	exports.REDIS_DC_CHANNEL_COMMAND = REDIS_DC_CHANNEL_COMMAND;
	exports.REDIS_DC_CHANNEL_CONNECT = REDIS_DC_CHANNEL_CONNECT;
	exports.subscribeRedisDiagnosticChannels = subscribeRedisDiagnosticChannels;
}));
//#endregion
//#region node_modules/@sentry/server-utils/build/cjs/vercel-ai/vercel-ai-dc-subscriber.js
var require_vercel_ai_dc_subscriber = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const attributes = require_attributes();
	const op = require_op();
	const core = require_cjs$4();
	const tracingChannel = require_tracing_channel();
	const AI_SDK_TELEMETRY_TRACING_CHANNEL = "ai:telemetry";
	const ORIGIN = "auto.vercelai.channel";
	const GEN_AI_TOOL_CALL_ID_ATTRIBUTE = "gen_ai.tool.call.id";
	const GEN_AI_TOOL_DESCRIPTION_ATTRIBUTE = "gen_ai.tool.description";
	const GEN_AI_EMBEDDINGS_OPERATION = "embeddings";
	const GEN_AI_RERANK_OPERATION = "rerank";
	const GEN_AI_GENERATE_CONTENT_OPERATION = "generate_content";
	const VERCEL_AI_OPERATION_ID_ATTRIBUTE = "vercel.ai.operationId";
	const VERCEL_AI_MODEL_PROVIDER_ATTRIBUTE = "vercel.ai.model.provider";
	const VERCEL_AI_SETTINGS_MAX_RETRIES_ATTRIBUTE = "vercel.ai.settings.maxRetries";
	const operationIdByCallId = /* @__PURE__ */ new Map();
	const toolDescriptionsByCallId = /* @__PURE__ */ new Map();
	const ROOT_OPERATION_TYPES = /* @__PURE__ */ new Set([
		"generateText",
		"streamText",
		"embed",
		"rerank"
	]);
	function clearOperationId(data) {
		if (!ROOT_OPERATION_TYPES.has(data.type)) return;
		const callId = asString(data.event.callId);
		if (callId) {
			operationIdByCallId.delete(callId);
			toolDescriptionsByCallId.delete(callId);
		}
	}
	function recordToolDescriptions(callId, tools) {
		if (!callId || !Array.isArray(tools)) return;
		let descriptions = toolDescriptionsByCallId.get(callId);
		for (const tool of tools) if (isRecord(tool) && typeof tool.name === "string" && typeof tool.description === "string") {
			descriptions = descriptions ?? /* @__PURE__ */ new Map();
			if (!descriptions.has(tool.name)) descriptions.set(tool.name, tool.description);
		}
		if (descriptions) toolDescriptionsByCallId.set(callId, descriptions);
	}
	function resolveToolDescription(callId, toolName, tools) {
		const fromMap = callId ? toolDescriptionsByCallId.get(callId)?.get(toolName) : void 0;
		if (fromMap) return fromMap;
		if (Array.isArray(tools)) {
			const match = tools.find((tool) => isRecord(tool) && tool.name === toolName);
			return isRecord(match) ? asString(match.description) : void 0;
		}
		if (isRecord(tools)) {
			const tool = tools[toolName];
			return isRecord(tool) ? asString(tool.description) : void 0;
		}
	}
	let subscribed = false;
	function subscribeVercelAiTracingChannel(tracingChannel$1, options = {}) {
		if (subscribed) return;
		subscribed = true;
		tracingChannel.bindTracingChannelToSpan(tracingChannel$1(AI_SDK_TELEMETRY_TRACING_CHANNEL), (data) => createSpanFromMessage(data, options), { beforeSpanEnd: (span, data) => {
			enrichSpanOnEnd(span, data, options);
			clearOperationId(data);
		} });
	}
	function createSpanFromMessage(data, channelOptions) {
		const { type, event } = data;
		if (type === "step" || !event || typeof event !== "object") return;
		const { recordInputs, enableTruncation } = getRecordingOptions(event, channelOptions);
		const provider = asString(event.provider);
		const modelId = asString(event.modelId);
		const callId = asString(event.callId);
		const maxRetries = asNumber(event.maxRetries);
		if (recordInputs) recordToolDescriptions(callId, event.tools);
		const baseAttributes = {
			[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: ORIGIN,
			...provider ? {
				[attributes.GEN_AI_SYSTEM]: provider,
				[VERCEL_AI_MODEL_PROVIDER_ATTRIBUTE]: provider
			} : {},
			...modelId ? { [attributes.GEN_AI_REQUEST_MODEL]: modelId } : {},
			...maxRetries !== void 0 ? { [VERCEL_AI_SETTINGS_MAX_RETRIES_ATTRIBUTE]: maxRetries } : {}
		};
		switch (type) {
			case "generateText":
			case "streamText": return buildInvokeAgentSpan(event, baseAttributes, recordInputs, enableTruncation, callId, type === "streamText");
			case "languageModelCall": return buildModelCallSpan(event, baseAttributes, recordInputs, enableTruncation, callId, modelId);
			case "executeTool": return buildToolSpan(event, recordInputs);
			case "embed": return startGenAiSpan(GEN_AI_EMBEDDINGS_OPERATION, modelId, {
				...baseAttributes,
				...recordInputs && event.value !== void 0 ? { [attributes.GEN_AI_EMBEDDINGS_INPUT]: safeStringify(event.value) } : {}
			});
			case "rerank": return startGenAiSpan(GEN_AI_RERANK_OPERATION, modelId, baseAttributes);
			default: return;
		}
	}
	function startGenAiSpan(operation, suffix, attributes$1) {
		return core.startInactiveSpan({
			name: suffix ? `${operation} ${suffix}` : operation,
			op: `gen_ai.${operation}`,
			attributes: {
				[attributes.GEN_AI_OPERATION_NAME]: operation,
				...attributes$1
			}
		});
	}
	function buildInvokeAgentSpan(event, baseAttributes, recordInputs, enableTruncation, callId, isStream) {
		const functionId = asString(event.functionId);
		const operationId = asString(event.operationId) ?? (isStream ? "ai.streamText" : "ai.generateText");
		if (callId) operationIdByCallId.set(callId, {
			operationId,
			isStream
		});
		return startGenAiSpan(op.GEN_AI_INVOKE_AGENT_SPAN_OP, functionId, {
			...baseAttributes,
			[VERCEL_AI_OPERATION_ID_ATTRIBUTE]: operationId,
			[attributes.GEN_AI_RESPONSE_STREAMING]: isStream,
			...functionId ? { [attributes.GEN_AI_FUNCTION_ID]: functionId } : {},
			...recordInputs ? buildInputMessageAttributes(event, enableTruncation) : {}
		});
	}
	function buildModelCallSpan(event, baseAttributes, recordInputs, enableTruncation, callId, modelId) {
		const parent = callId ? operationIdByCallId.get(callId) : void 0;
		const operationId = parent ? `${parent.operationId}.${parent.isStream ? "doStream" : "doGenerate"}` : "ai.generateText.doGenerate";
		return startGenAiSpan(GEN_AI_GENERATE_CONTENT_OPERATION, modelId, {
			...baseAttributes,
			[VERCEL_AI_OPERATION_ID_ATTRIBUTE]: operationId,
			...recordInputs ? buildInputMessageAttributes(event, enableTruncation) : {},
			...recordInputs && Array.isArray(event.tools) ? { [attributes.GEN_AI_REQUEST_AVAILABLE_TOOLS]: safeStringify(event.tools) } : {}
		});
	}
	function buildToolSpan(event, recordInputs) {
		const toolCall = isRecord(event.toolCall) ? event.toolCall : {};
		const toolName = asString(toolCall.toolName);
		const toolCallId = asString(event.toolCallId) ?? asString(toolCall.toolCallId);
		const toolInput = toolCall.input ?? toolCall.args;
		const description = recordInputs && toolName ? resolveToolDescription(asString(event.callId), toolName, event.tools) : void 0;
		return startGenAiSpan(op.GEN_AI_EXECUTE_TOOL_SPAN_OP, toolName, {
			[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: ORIGIN,
			[attributes.GEN_AI_TOOL_TYPE]: "function",
			...toolName ? { [attributes.GEN_AI_TOOL_NAME]: toolName } : {},
			...toolCallId ? { [GEN_AI_TOOL_CALL_ID_ATTRIBUTE]: toolCallId } : {},
			...description ? { [GEN_AI_TOOL_DESCRIPTION_ATTRIBUTE]: description } : {},
			...recordInputs && toolInput !== void 0 ? { [attributes.GEN_AI_TOOL_INPUT]: safeStringify(toolInput) } : {}
		});
	}
	function enrichSpanOnEnd(span, data, channelOptions) {
		const { type, result } = data;
		if (!isRecord(result)) return;
		const { recordOutputs } = getRecordingOptions(data.event, channelOptions);
		if (type === "executeTool") {
			if (recordOutputs) span.setAttribute(attributes.GEN_AI_TOOL_OUTPUT, safeStringify(result.output ?? result));
			const output = isRecord(result.output) ? result.output : void 0;
			if (output?.type === "tool-error") captureToolError(span, data, output.error);
			return;
		}
		const usage = isRecord(result.usage) ? result.usage : void 0;
		if (usage) {
			const inputTokens = tokenCount(usage.inputTokens) ?? tokenCount(usage.tokens);
			const outputTokens = tokenCount(usage.outputTokens);
			const totalTokens = tokenCount(usage.totalTokens) ?? sum(inputTokens, outputTokens);
			if (inputTokens !== void 0) span.setAttribute(attributes.GEN_AI_USAGE_INPUT_TOKENS, inputTokens);
			if (outputTokens !== void 0) span.setAttribute(attributes.GEN_AI_USAGE_OUTPUT_TOKENS, outputTokens);
			if (totalTokens !== void 0) span.setAttribute(attributes.GEN_AI_USAGE_TOTAL_TOKENS, totalTokens);
		}
		const finishReason = getFinishReason(result);
		if (finishReason && type === "languageModelCall") span.setAttribute(attributes.GEN_AI_RESPONSE_FINISH_REASONS, safeStringify([finishReason]));
		const response = isRecord(result.response) ? result.response : void 0;
		const responseId = asString(response?.id) ?? asString(result.responseId);
		if (responseId) span.setAttribute(attributes.GEN_AI_RESPONSE_ID, responseId);
		const responseModel = asString(response?.modelId) ?? asString(data.event.modelId);
		if (responseModel) span.setAttribute(attributes.GEN_AI_RESPONSE_MODEL, responseModel);
		const providerMetadata = result.providerMetadata;
		const providerAttributes = core.getProviderMetadataAttributes(providerMetadata);
		if (core.GEN_AI_CONVERSATION_ID_ATTRIBUTE in providerAttributes && core.spanToJSON(span).data[core.GEN_AI_CONVERSATION_ID_ATTRIBUTE]) delete providerAttributes[core.GEN_AI_CONVERSATION_ID_ATTRIBUTE];
		span.setAttributes(providerAttributes);
		if (recordOutputs) {
			const outputMessages = buildOutputMessages(type === "languageModelCall" && Array.isArray(result.content) ? partsFromContent(result.content) : partsFromTextAndToolCalls(result.text, result.toolCalls), finishReason);
			if (outputMessages) span.setAttribute(attributes.GEN_AI_OUTPUT_MESSAGES, outputMessages);
		}
	}
	function normalizeFinishReason(finishReason) {
		return finishReason === "tool-calls" ? "tool_call" : finishReason ?? "stop";
	}
	function getFinishReason(result) {
		const finishReason = result.finishReason;
		if (typeof finishReason === "string") return finishReason;
		return isRecord(finishReason) ? asString(finishReason.unified) : void 0;
	}
	function tokenCount(value) {
		return asNumber(value) ?? (isRecord(value) ? asNumber(value.total) : void 0);
	}
	function buildOutputMessages(parts, finishReason) {
		if (!parts.length) return;
		return safeStringify([{
			role: "assistant",
			parts,
			finish_reason: normalizeFinishReason(finishReason)
		}]);
	}
	function toolCallPart(toolCall) {
		const args = toolCall.input ?? toolCall.args;
		return {
			type: "tool_call",
			id: asString(toolCall.toolCallId),
			name: asString(toolCall.toolName),
			arguments: typeof args === "string" ? args : safeStringify(args ?? {})
		};
	}
	function partsFromContent(content) {
		const parts = [];
		for (const item of content) {
			if (!isRecord(item)) continue;
			if (item.type === "text" && typeof item.text === "string") parts.push({
				type: "text",
				content: item.text
			});
			else if (item.type === "tool-call") parts.push(toolCallPart(item));
		}
		return parts;
	}
	function partsFromTextAndToolCalls(text, toolCalls) {
		const parts = [];
		if (typeof text === "string" && text.length) parts.push({
			type: "text",
			content: text
		});
		if (Array.isArray(toolCalls)) {
			for (const toolCall of toolCalls) if (isRecord(toolCall)) parts.push(toolCallPart(toolCall));
		}
		return parts;
	}
	function captureToolError(span, data, error) {
		span.setStatus({
			code: core.SPAN_STATUS_ERROR,
			message: error instanceof Error ? error.message : "tool_error"
		});
		const toolCall = isRecord(data.event.toolCall) ? data.event.toolCall : {};
		const toolName = asString(toolCall.toolName);
		const toolCallId = asString(data.event.toolCallId) ?? asString(toolCall.toolCallId);
		core.withScope((scope) => {
			scope.setContext("trace", core.spanToTraceContext(span));
			if (toolName) scope.setTag("vercel.ai.tool.name", toolName);
			if (toolCallId) scope.setTag("vercel.ai.tool.callId", toolCallId);
			scope.setLevel("error");
			core.captureException(error instanceof Error ? error : new Error(typeof error === "string" ? error : "Tool execution failed"), { mechanism: {
				type: "auto.vercelai.channel",
				handled: false
			} });
		});
	}
	function getRecordingOptions(event, channelOptions) {
		const genAI = core.getClient()?.getDataCollectionOptions().genAI;
		return {
			recordInputs: resolveRecording(channelOptions.recordInputs, event.recordInputs, genAI?.inputs),
			recordOutputs: resolveRecording(channelOptions.recordOutputs, event.recordOutputs, genAI?.outputs),
			enableTruncation: core.shouldEnableTruncation(channelOptions.enableTruncation)
		};
	}
	function resolveRecording(integrationOption, perCallOption, globalDefault) {
		if (typeof integrationOption === "boolean") return integrationOption;
		if (typeof perCallOption === "boolean") return perCallOption;
		return globalDefault === true;
	}
	function buildInputMessageAttributes(event, enableTruncation) {
		const attributes$1 = {};
		const instructions = asString(event.instructions);
		if (instructions) attributes$1[core.GEN_AI_SYSTEM_INSTRUCTIONS_ATTRIBUTE] = safeStringify([{
			type: "text",
			content: instructions
		}]);
		const messages = event.messages ?? event.prompt;
		if (messages !== void 0) {
			attributes$1[attributes.GEN_AI_INPUT_MESSAGES] = enableTruncation ? core.getTruncatedJsonString(messages) : safeStringify(messages);
			attributes$1[core.GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE] = Array.isArray(messages) ? messages.length : 1;
		}
		return attributes$1;
	}
	function asString(value) {
		return typeof value === "string" ? value : void 0;
	}
	function asNumber(value) {
		return typeof value === "number" && !isNaN(value) ? value : void 0;
	}
	function sum(a, b) {
		return a === void 0 && b === void 0 ? void 0 : (a ?? 0) + (b ?? 0);
	}
	function isRecord(value) {
		return typeof value === "object" && value !== null;
	}
	function safeStringify(value) {
		if (typeof value === "string") return value;
		try {
			return JSON.stringify(value);
		} catch {
			return "[unserializable]";
		}
	}
	exports.clearOperationId = clearOperationId;
	exports.createSpanFromMessage = createSpanFromMessage;
	exports.enrichSpanOnEnd = enrichSpanOnEnd;
	exports.subscribeVercelAiTracingChannel = subscribeVercelAiTracingChannel;
}));
//#endregion
//#region node_modules/@sentry/server-utils/build/cjs/vercel-ai/index.js
var require_vercel_ai = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const vercelAiDcSubscriber = require_vercel_ai_dc_subscriber();
	const dc$2 = __require("node:diagnostics_channel");
	const _vercelAiIntegration = ((options = {}) => {
		return {
			name: "VercelAI",
			setupOnce() {
				if (!dc$2.tracingChannel) return;
				Promise.resolve().then(() => vercelAiDcSubscriber.subscribeVercelAiTracingChannel(dc$2.tracingChannel, options));
			}
		};
	});
	exports.vercelAiIntegration = core.defineIntegration(_vercelAiIntegration);
}));
//#endregion
//#region node_modules/@sentry/server-utils/build/cjs/index.js
var require_cjs$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const redisDcSubscriber = require_redis_dc_subscriber();
	const tracingChannel = require_tracing_channel();
	const index = require_vercel_ai();
	exports.IOREDIS_DC_CHANNEL_COMMAND = redisDcSubscriber.IOREDIS_DC_CHANNEL_COMMAND;
	exports.IOREDIS_DC_CHANNEL_CONNECT = redisDcSubscriber.IOREDIS_DC_CHANNEL_CONNECT;
	exports.REDIS_DC_CHANNEL_BATCH = redisDcSubscriber.REDIS_DC_CHANNEL_BATCH;
	exports.REDIS_DC_CHANNEL_COMMAND = redisDcSubscriber.REDIS_DC_CHANNEL_COMMAND;
	exports.REDIS_DC_CHANNEL_CONNECT = redisDcSubscriber.REDIS_DC_CHANNEL_CONNECT;
	exports.subscribeRedisDiagnosticChannels = redisDcSubscriber.subscribeRedisDiagnosticChannels;
	exports.bindTracingChannelToSpan = tracingChannel.bindTracingChannelToSpan;
	exports.vercelAiIntegration = index.vercelAiIntegration;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/utils/redisCache.js
var require_redisCache = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const SINGLE_ARG_COMMANDS = [
		"get",
		"set",
		"setex"
	];
	const GET_COMMANDS = ["get", "mget"];
	const SET_COMMANDS = ["set", "setex"];
	function isInCommands(redisCommands, command) {
		return redisCommands.includes(command.toLowerCase());
	}
	function getCacheOperation(command) {
		if (isInCommands(GET_COMMANDS, command)) return "cache.get";
		else if (isInCommands(SET_COMMANDS, command)) return "cache.put";
		else return;
	}
	function keyHasPrefix(key, prefixes) {
		return prefixes.some((prefix) => key.startsWith(prefix));
	}
	function getCacheKeySafely(redisCommand, cmdArgs) {
		try {
			if (cmdArgs.length === 0) return;
			const processArg = (arg) => {
				if (typeof arg === "string" || typeof arg === "number" || Buffer.isBuffer(arg)) return [arg.toString()];
				else if (Array.isArray(arg)) return flatten(arg.map((arg2) => processArg(arg2)));
				else return ["<unknown>"];
			};
			const firstArg = cmdArgs[0];
			if (isInCommands(SINGLE_ARG_COMMANDS, redisCommand) && firstArg != null) return processArg(firstArg);
			return flatten(cmdArgs.map((arg) => processArg(arg)));
		} catch {
			return;
		}
	}
	function shouldConsiderForCache(redisCommand, keys, prefixes) {
		if (!getCacheOperation(redisCommand)) return false;
		for (const key of keys) if (keyHasPrefix(key, prefixes)) return true;
		return false;
	}
	function calculateCacheItemSize(response) {
		const getSize = (value) => {
			try {
				if (Buffer.isBuffer(value)) return value.byteLength;
				else if (typeof value === "string") return value.length;
				else if (typeof value === "number") return value.toString().length;
				else if (value === null || value === void 0) return 0;
				return JSON.stringify(value).length;
			} catch {
				return;
			}
		};
		return Array.isArray(response) ? response.reduce((acc, curr) => {
			const size = getSize(curr);
			return typeof size === "number" ? acc !== void 0 ? acc + size : size : acc;
		}, 0) : getSize(response);
	}
	function flatten(input) {
		const result = [];
		const flattenHelper = (input2) => {
			input2.forEach((el) => {
				if (Array.isArray(el)) flattenHelper(el);
				else result.push(el);
			});
		};
		flattenHelper(input);
		return result;
	}
	exports.GET_COMMANDS = GET_COMMANDS;
	exports.SET_COMMANDS = SET_COMMANDS;
	exports.calculateCacheItemSize = calculateCacheItemSize;
	exports.getCacheKeySafely = getCacheKeySafely;
	exports.getCacheOperation = getCacheOperation;
	exports.isInCommands = isInCommands;
	exports.shouldConsiderForCache = shouldConsiderForCache;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/redis/vendored/redis-common.js
var require_redis_common = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const serializationSubsets = [
		{
			regex: /^ECHO/i,
			args: 0
		},
		{
			regex: /^(LPUSH|MSET|PFA|PUBLISH|RPUSH|SADD|SET|SPUBLISH|XADD|ZADD)/i,
			args: 1
		},
		{
			regex: /^(HSET|HMSET|LSET|LINSERT)/i,
			args: 2
		},
		{
			regex: /^(ACL|BIT|B[LRZ]|CLIENT|CLUSTER|CONFIG|COMMAND|DECR|DEL|EVAL|EX|FUNCTION|GEO|GET|HINCR|HMGET|HSCAN|INCR|L[TRLM]|MEMORY|P[EFISTU]|RPOP|S[CDIMORSU]|XACK|X[CDGILPRT]|Z[CDILMPRS])/i,
			args: -1
		}
	];
	const defaultDbStatementSerializer = (cmdName, cmdArgs) => {
		if (Array.isArray(cmdArgs) && cmdArgs.length) {
			const nArgsToSerialize = serializationSubsets.find(({ regex }) => regex.test(cmdName))?.args ?? 0;
			const argsToSerialize = nArgsToSerialize >= 0 ? cmdArgs.slice(0, nArgsToSerialize) : cmdArgs.slice();
			if (cmdArgs.length > argsToSerialize.length) argsToSerialize.push(`[${cmdArgs.length - nArgsToSerialize} other arguments]`);
			return `${cmdName} ${argsToSerialize.join(" ")}`;
		}
		return cmdName;
	};
	exports.defaultDbStatementSerializer = defaultDbStatementSerializer;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/redis/vendored/semconv.js
var require_semconv$5 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const ATTR_DB_CONNECTION_STRING = "db.connection_string";
	const ATTR_DB_STATEMENT = "db.statement";
	const ATTR_DB_SYSTEM = "db.system";
	const ATTR_NET_PEER_NAME = "net.peer.name";
	const ATTR_NET_PEER_PORT = "net.peer.port";
	const DB_SYSTEM_VALUE_REDIS = "redis";
	exports.ATTR_DB_CONNECTION_STRING = ATTR_DB_CONNECTION_STRING;
	exports.ATTR_DB_STATEMENT = ATTR_DB_STATEMENT;
	exports.ATTR_DB_SYSTEM = ATTR_DB_SYSTEM;
	exports.ATTR_NET_PEER_NAME = ATTR_NET_PEER_NAME;
	exports.ATTR_NET_PEER_PORT = ATTR_NET_PEER_PORT;
	exports.DB_SYSTEM_VALUE_REDIS = DB_SYSTEM_VALUE_REDIS;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/redis/vendored/ioredis-instrumentation.js
var require_ioredis_instrumentation = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const instrumentation = require_src$1();
	const core = require_cjs$4();
	const redisCommon = require_redis_common();
	const semconv = require_semconv$5();
	const PACKAGE_NAME = "@sentry/instrumentation-ioredis";
	const ORIGIN = "auto.db.otel.redis";
	const SUPPORTED_VERSIONS = [">=2.0.0 <5.11.0"];
	function endSpan(span, err) {
		if (err) span.setStatus({
			code: core.SPAN_STATUS_ERROR,
			message: err.message
		});
		span.end();
	}
	var IORedisInstrumentation = class extends instrumentation.InstrumentationBase {
		constructor(config = {}) {
			super(PACKAGE_NAME, core.SDK_VERSION, config);
		}
		init() {
			return [new instrumentation.InstrumentationNodeModuleDefinition("ioredis", SUPPORTED_VERSIONS, (module$19) => {
				const moduleExports = module$19[Symbol.toStringTag] === "Module" && module$19.default ? module$19.default : module$19;
				if (instrumentation.isWrapped(moduleExports.prototype.sendCommand)) this._unwrap(moduleExports.prototype, "sendCommand");
				this._wrap(moduleExports.prototype, "sendCommand", this._patchSendCommand());
				if (instrumentation.isWrapped(moduleExports.prototype.connect)) this._unwrap(moduleExports.prototype, "connect");
				this._wrap(moduleExports.prototype, "connect", this._patchConnection());
				return module$19;
			}, (module$20) => {
				if (module$20 === void 0) return;
				const moduleExports = module$20[Symbol.toStringTag] === "Module" && module$20.default ? module$20.default : module$20;
				this._unwrap(moduleExports.prototype, "sendCommand");
				this._unwrap(moduleExports.prototype, "connect");
			})];
		}
		_patchSendCommand() {
			const instrumentation = this;
			return (original) => {
				return function(...args) {
					const cmd = args[0];
					if (args.length < 1 || typeof cmd !== "object" || !core.getActiveSpan()) return original.apply(this, args);
					const { host, port } = this.options;
					const attributes = {
						[semconv.ATTR_DB_SYSTEM]: semconv.DB_SYSTEM_VALUE_REDIS,
						[semconv.ATTR_DB_STATEMENT]: redisCommon.defaultDbStatementSerializer(cmd.name, cmd.args),
						[semconv.ATTR_DB_CONNECTION_STRING]: `redis://${host}:${port}`,
						[semconv.ATTR_NET_PEER_NAME]: host,
						[semconv.ATTR_NET_PEER_PORT]: port,
						[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: ORIGIN
					};
					const span = core.startInactiveSpan({
						name: cmd.name,
						kind: core.SPAN_KIND.CLIENT,
						attributes
					});
					try {
						const result = original.apply(this, args);
						const origResolve = cmd.resolve;
						cmd.resolve = function(response) {
							instrumentation._callResponseHook(span, cmd, response);
							endSpan(span, null);
							origResolve(response);
						};
						const origReject = cmd.reject;
						cmd.reject = function(err) {
							endSpan(span, err);
							origReject(err);
						};
						return result;
					} catch (error) {
						endSpan(span, error);
						throw error;
					}
				};
			};
		}
		_patchConnection() {
			return (original) => {
				return function(...args) {
					if (!core.getActiveSpan()) return original.apply(this, args);
					const { host, port } = this.options;
					const attributes = {
						[semconv.ATTR_DB_SYSTEM]: semconv.DB_SYSTEM_VALUE_REDIS,
						[semconv.ATTR_DB_STATEMENT]: "connect",
						[semconv.ATTR_DB_CONNECTION_STRING]: `redis://${host}:${port}`,
						[semconv.ATTR_NET_PEER_NAME]: host,
						[semconv.ATTR_NET_PEER_PORT]: port,
						[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: ORIGIN
					};
					const span = core.startInactiveSpan({
						name: "connect",
						kind: core.SPAN_KIND.CLIENT,
						attributes
					});
					try {
						const result = original.apply(this, args);
						if (result instanceof Promise) return result.then((value) => {
							endSpan(span, null);
							return value;
						}, (error) => {
							endSpan(span, error);
							return Promise.reject(error);
						});
						endSpan(span, null);
						return result;
					} catch (error) {
						endSpan(span, error);
						throw error;
					}
				};
			};
		}
		_callResponseHook(span, cmd, response) {
			const { responseHook } = this.getConfig();
			if (!responseHook) return;
			try {
				responseHook(span, cmd.name, cmd.args, response);
			} catch {}
		}
	};
	exports.IORedisInstrumentation = IORedisInstrumentation;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/redis/vendored/redis-instrumentation.js
var require_redis_instrumentation = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const instrumentation = require_src$1();
	const core = require_cjs$4();
	const debugBuild = require_debug_build$2();
	const InstrumentationNodeModuleFile = require_InstrumentationNodeModuleFile();
	const redisCommon = require_redis_common();
	const semconv = require_semconv$5();
	const PACKAGE_NAME = "@sentry/instrumentation-redis";
	const ORIGIN = "auto.db.otel.redis";
	const OTEL_OPEN_SPANS = /* @__PURE__ */ Symbol("opentelemetry.instrumentation.redis.open_spans");
	const MULTI_COMMAND_OPTIONS = /* @__PURE__ */ Symbol("opentelemetry.instrumentation.redis.multi_command_options");
	function endSpan(span, err) {
		if (err) span.setStatus({
			code: core.SPAN_STATUS_ERROR,
			message: err.message
		});
		span.end();
	}
	function runResponseHook(responseHook, span, commandName, commandArgs, response) {
		if (!responseHook) return;
		try {
			responseHook(span, commandName, commandArgs, response);
		} catch {}
	}
	function removeCredentialsFromDBConnectionStringAttribute(url) {
		if (typeof url !== "string" || !url) return;
		try {
			const u = new URL(url);
			u.searchParams.delete("user_pwd");
			u.username = "";
			u.password = "";
			return u.href;
		} catch (err) {
			debugBuild.DEBUG_BUILD && core.debug.error("failed to sanitize redis connection url", err);
		}
	}
	function getClientAttributes(options) {
		return {
			[semconv.ATTR_DB_SYSTEM]: semconv.DB_SYSTEM_VALUE_REDIS,
			[semconv.ATTR_NET_PEER_NAME]: options?.socket?.host,
			[semconv.ATTR_NET_PEER_PORT]: options?.socket?.port,
			[semconv.ATTR_DB_CONNECTION_STRING]: removeCredentialsFromDBConnectionStringAttribute(options?.url),
			[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: ORIGIN
		};
	}
	const _RedisInstrumentationV2_V3 = class _RedisInstrumentationV2_V3 extends instrumentation.InstrumentationBase {
		constructor(config = {}) {
			super(PACKAGE_NAME, core.SDK_VERSION, config);
		}
		init() {
			return [new instrumentation.InstrumentationNodeModuleDefinition("redis", [">=2.6.0 <4"], (moduleExports) => {
				if (instrumentation.isWrapped(moduleExports.RedisClient.prototype["internal_send_command"])) this._unwrap(moduleExports.RedisClient.prototype, "internal_send_command");
				this._wrap(moduleExports.RedisClient.prototype, "internal_send_command", this._getPatchInternalSendCommand());
				return moduleExports;
			}, (moduleExports) => {
				if (moduleExports === void 0) return;
				this._unwrap(moduleExports.RedisClient.prototype, "internal_send_command");
			})];
		}
		_getPatchInternalSendCommand() {
			const instrumentation = this;
			return function internal_send_command(original) {
				return function internal_send_command_trace(cmd) {
					if (arguments.length !== 1 || typeof cmd !== "object") return original.apply(this, arguments);
					const attributes = {
						[semconv.ATTR_DB_SYSTEM]: semconv.DB_SYSTEM_VALUE_REDIS,
						[semconv.ATTR_DB_STATEMENT]: redisCommon.defaultDbStatementSerializer(cmd.command, cmd.args),
						[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: ORIGIN
					};
					if (this.connection_options) {
						attributes[semconv.ATTR_NET_PEER_NAME] = this.connection_options.host;
						attributes[semconv.ATTR_NET_PEER_PORT] = this.connection_options.port;
					}
					if (this.address) attributes[semconv.ATTR_DB_CONNECTION_STRING] = `redis://${this.address}`;
					const span = core.startInactiveSpan({
						name: `${_RedisInstrumentationV2_V3.COMPONENT}-${cmd.command}`,
						kind: core.SPAN_KIND.CLIENT,
						attributes
					});
					const originalCallback = arguments[0].callback;
					if (originalCallback) {
						const parentSpan = core.getActiveSpan();
						arguments[0].callback = function callback(err, reply) {
							runResponseHook(instrumentation.getConfig().responseHook, span, cmd.command, cmd.args, reply);
							endSpan(span, err);
							return core.withActiveSpan(parentSpan ?? null, () => originalCallback.apply(this, arguments));
						};
					}
					try {
						return original.apply(this, arguments);
					} catch (rethrow) {
						endSpan(span, rethrow);
						throw rethrow;
					}
				};
			};
		}
	};
	_RedisInstrumentationV2_V3.COMPONENT = "redis";
	let RedisInstrumentationV2_V3 = _RedisInstrumentationV2_V3;
	const _RedisInstrumentationV4_V5 = class _RedisInstrumentationV4_V5 extends instrumentation.InstrumentationBase {
		constructor(config = {}) {
			super(PACKAGE_NAME, core.SDK_VERSION, config);
		}
		init() {
			return [this._getInstrumentationNodeModuleDefinition("@redis/client"), this._getInstrumentationNodeModuleDefinition("@node-redis/client")];
		}
		_getInstrumentationNodeModuleDefinition(basePackageName) {
			const commanderModuleFile = new InstrumentationNodeModuleFile.InstrumentationNodeModuleFile(`${basePackageName}/dist/lib/commander.js`, ["^1.0.0"], (moduleExports, moduleVersion) => {
				const transformCommandArguments = moduleExports.transformCommandArguments;
				if (!transformCommandArguments) {
					debugBuild.DEBUG_BUILD && core.debug.error("internal instrumentation error, missing transformCommandArguments function");
					return moduleExports;
				}
				const functionToPatch = moduleVersion?.startsWith("1.0.") ? "extendWithCommands" : "attachCommands";
				if (instrumentation.isWrapped(moduleExports?.[functionToPatch])) this._unwrap(moduleExports, functionToPatch);
				this._wrap(moduleExports, functionToPatch, this._getPatchExtendWithCommands(transformCommandArguments));
				return moduleExports;
			}, (moduleExports) => {
				if (instrumentation.isWrapped(moduleExports?.extendWithCommands)) this._unwrap(moduleExports, "extendWithCommands");
				if (instrumentation.isWrapped(moduleExports?.attachCommands)) this._unwrap(moduleExports, "attachCommands");
			});
			const multiCommanderModule = new InstrumentationNodeModuleFile.InstrumentationNodeModuleFile(`${basePackageName}/dist/lib/client/multi-command.js`, ["^1.0.0", ">=5.0.0 <5.12.0"], (moduleExports) => {
				const redisClientMultiCommandPrototype = moduleExports?.default?.prototype;
				if (instrumentation.isWrapped(redisClientMultiCommandPrototype?.exec)) this._unwrap(redisClientMultiCommandPrototype, "exec");
				this._wrap(redisClientMultiCommandPrototype, "exec", this._getPatchMultiCommandsExec());
				if (instrumentation.isWrapped(redisClientMultiCommandPrototype?.execAsPipeline)) this._unwrap(redisClientMultiCommandPrototype, "execAsPipeline");
				this._wrap(redisClientMultiCommandPrototype, "execAsPipeline", this._getPatchMultiCommandsExec());
				if (instrumentation.isWrapped(redisClientMultiCommandPrototype?.addCommand)) this._unwrap(redisClientMultiCommandPrototype, "addCommand");
				this._wrap(redisClientMultiCommandPrototype, "addCommand", this._getPatchMultiCommandsAddCommand());
				return moduleExports;
			}, (moduleExports) => {
				const redisClientMultiCommandPrototype = moduleExports?.default?.prototype;
				if (instrumentation.isWrapped(redisClientMultiCommandPrototype?.exec)) this._unwrap(redisClientMultiCommandPrototype, "exec");
				if (instrumentation.isWrapped(redisClientMultiCommandPrototype?.execAsPipeline)) this._unwrap(redisClientMultiCommandPrototype, "execAsPipeline");
				if (instrumentation.isWrapped(redisClientMultiCommandPrototype?.addCommand)) this._unwrap(redisClientMultiCommandPrototype, "addCommand");
			});
			const clientIndexModule = new InstrumentationNodeModuleFile.InstrumentationNodeModuleFile(`${basePackageName}/dist/lib/client/index.js`, ["^1.0.0", ">=5.0.0 <5.12.0"], (moduleExports) => {
				const redisClientPrototype = moduleExports?.default?.prototype;
				if (redisClientPrototype?.multi) {
					if (instrumentation.isWrapped(redisClientPrototype?.multi)) this._unwrap(redisClientPrototype, "multi");
					this._wrap(redisClientPrototype, "multi", this._getPatchRedisClientMulti());
				}
				if (redisClientPrototype?.MULTI) {
					if (instrumentation.isWrapped(redisClientPrototype?.MULTI)) this._unwrap(redisClientPrototype, "MULTI");
					this._wrap(redisClientPrototype, "MULTI", this._getPatchRedisClientMulti());
				}
				if (instrumentation.isWrapped(redisClientPrototype?.sendCommand)) this._unwrap(redisClientPrototype, "sendCommand");
				this._wrap(redisClientPrototype, "sendCommand", this._getPatchRedisClientSendCommand());
				if (instrumentation.isWrapped(redisClientPrototype?.connect)) this._unwrap(redisClientPrototype, "connect");
				this._wrap(redisClientPrototype, "connect", this._getPatchedClientConnect());
				return moduleExports;
			}, (moduleExports) => {
				const redisClientPrototype = moduleExports?.default?.prototype;
				if (instrumentation.isWrapped(redisClientPrototype?.multi)) this._unwrap(redisClientPrototype, "multi");
				if (instrumentation.isWrapped(redisClientPrototype?.MULTI)) this._unwrap(redisClientPrototype, "MULTI");
				if (instrumentation.isWrapped(redisClientPrototype?.sendCommand)) this._unwrap(redisClientPrototype, "sendCommand");
				if (instrumentation.isWrapped(redisClientPrototype?.connect)) this._unwrap(redisClientPrototype, "connect");
			});
			return new instrumentation.InstrumentationNodeModuleDefinition(basePackageName, ["^1.0.0", ">=5.0.0 <5.12.0"], (moduleExports) => moduleExports, () => {}, [
				commanderModuleFile,
				multiCommanderModule,
				clientIndexModule
			]);
		}
		_getPatchExtendWithCommands(transformCommandArguments) {
			const plugin = this;
			return function extendWithCommandsPatchWrapper(original) {
				return function extendWithCommandsPatch(config) {
					if (config?.BaseClass?.name !== "RedisClient") return original.apply(this, arguments);
					const origExecutor = config.executor;
					config.executor = function(command, args) {
						const redisCommandArguments = transformCommandArguments(command, args).args;
						return plugin._traceClientCommand(origExecutor, this, arguments, redisCommandArguments);
					};
					return original.apply(this, arguments);
				};
			};
		}
		_getPatchMultiCommandsExec() {
			const plugin = this;
			return function execPatchWrapper(original) {
				return function execPatch() {
					const execRes = original.apply(this, arguments);
					if (typeof execRes?.then !== "function") {
						debugBuild.DEBUG_BUILD && core.debug.error("non-promise result when patching exec/execAsPipeline");
						return execRes;
					}
					return execRes.then((redisRes) => {
						const openSpans = this[OTEL_OPEN_SPANS];
						plugin._endSpansWithRedisReplies(openSpans, redisRes);
						return redisRes;
					}).catch((err) => {
						const openSpans = this[OTEL_OPEN_SPANS];
						if (!openSpans) debugBuild.DEBUG_BUILD && core.debug.error("cannot find open spans to end for multi/pipeline");
						else {
							const replies = err.constructor.name === "MultiErrorReply" ? err.replies : new Array(openSpans.length).fill(err);
							plugin._endSpansWithRedisReplies(openSpans, replies);
						}
						return Promise.reject(err);
					});
				};
			};
		}
		_getPatchMultiCommandsAddCommand() {
			const plugin = this;
			return function addCommandWrapper(original) {
				return function addCommandPatch(args) {
					return plugin._traceClientCommand(original, this, arguments, args);
				};
			};
		}
		_getPatchRedisClientMulti() {
			return function multiPatchWrapper(original) {
				return function multiPatch() {
					const multiRes = original.apply(this, arguments);
					multiRes[MULTI_COMMAND_OPTIONS] = this.options;
					return multiRes;
				};
			};
		}
		_getPatchRedisClientSendCommand() {
			const plugin = this;
			return function sendCommandWrapper(original) {
				return function sendCommandPatch(args) {
					return plugin._traceClientCommand(original, this, arguments, args);
				};
			};
		}
		_getPatchedClientConnect() {
			return function connectWrapper(original) {
				return function patchedConnect() {
					const attributes = getClientAttributes(this.options);
					const span = core.startInactiveSpan({
						name: `${_RedisInstrumentationV4_V5.COMPONENT}-connect`,
						kind: core.SPAN_KIND.CLIENT,
						attributes
					});
					return core.withActiveSpan(span, () => original.apply(this)).then((result) => {
						span.end();
						return result;
					}, (error) => {
						endSpan(span, error);
						return Promise.reject(error);
					});
				};
			};
		}
		_traceClientCommand(origFunction, origThis, origArguments, redisCommandArguments) {
			const clientOptions = origThis.options || origThis[MULTI_COMMAND_OPTIONS];
			const commandName = redisCommandArguments[0];
			const commandArgs = redisCommandArguments.slice(1);
			const attributes = getClientAttributes(clientOptions);
			const dbStatement = redisCommon.defaultDbStatementSerializer(commandName, commandArgs);
			if (dbStatement != null) attributes[semconv.ATTR_DB_STATEMENT] = dbStatement;
			const span = core.startInactiveSpan({
				name: `${_RedisInstrumentationV4_V5.COMPONENT}-${commandName}`,
				kind: core.SPAN_KIND.CLIENT,
				attributes
			});
			const res = core.withActiveSpan(span, () => origFunction.apply(origThis, origArguments));
			if (res instanceof Promise) res.then((redisRes) => {
				this._endSpanWithResponse(span, commandName, commandArgs, redisRes, void 0);
			}, (err) => {
				this._endSpanWithResponse(span, commandName, commandArgs, null, err);
			});
			else {
				const redisClientMultiCommand = res;
				redisClientMultiCommand[OTEL_OPEN_SPANS] = redisClientMultiCommand[OTEL_OPEN_SPANS] || [];
				redisClientMultiCommand[OTEL_OPEN_SPANS].push({
					span,
					commandName,
					commandArgs
				});
			}
			return res;
		}
		_endSpansWithRedisReplies(openSpans, replies) {
			if (!openSpans) {
				debugBuild.DEBUG_BUILD && core.debug.error("cannot find open spans to end for redis multi/pipeline");
				return;
			}
			if (replies.length !== openSpans.length) {
				debugBuild.DEBUG_BUILD && core.debug.error("number of multi command spans does not match response from redis");
				return;
			}
			for (let i = 0; i < openSpans.length; i++) {
				const { span, commandName, commandArgs } = openSpans[i];
				const currCommandRes = replies[i];
				const [res, err] = currCommandRes instanceof Error ? [null, currCommandRes] : [currCommandRes, void 0];
				this._endSpanWithResponse(span, commandName, commandArgs, res, err);
			}
		}
		_endSpanWithResponse(span, commandName, commandArgs, response, error) {
			if (!error) runResponseHook(this.getConfig().responseHook, span, commandName, commandArgs, response);
			endSpan(span, error);
		}
	};
	_RedisInstrumentationV4_V5.COMPONENT = "redis";
	let RedisInstrumentationV4_V5 = _RedisInstrumentationV4_V5;
	var RedisInstrumentation = class extends instrumentation.InstrumentationBase {
		constructor(config = {}) {
			super(PACKAGE_NAME, core.SDK_VERSION, config);
			this.initialized = false;
			this.instrumentationV2_V3 = new RedisInstrumentationV2_V3(this.getConfig());
			this.instrumentationV4_V5 = new RedisInstrumentationV4_V5(this.getConfig());
			this.initialized = true;
		}
		setConfig(config = {}) {
			super.setConfig(config);
			if (!this.initialized) return;
			this.instrumentationV2_V3.setConfig(config);
			this.instrumentationV4_V5.setConfig(config);
		}
		init() {}
		getModuleDefinitions() {
			return [...this.instrumentationV2_V3.getModuleDefinitions(), ...this.instrumentationV4_V5.getModuleDefinitions()];
		}
		setTracerProvider(tracerProvider) {
			super.setTracerProvider(tracerProvider);
			if (!this.initialized) return;
			this.instrumentationV2_V3.setTracerProvider(tracerProvider);
			this.instrumentationV4_V5.setTracerProvider(tracerProvider);
		}
		enable() {
			super.enable();
			if (!this.initialized) return;
			this.instrumentationV2_V3.enable();
			this.instrumentationV4_V5.enable();
		}
		disable() {
			super.disable();
			if (!this.initialized) return;
			this.instrumentationV2_V3.disable();
			this.instrumentationV4_V5.disable();
		}
	};
	exports.RedisInstrumentation = RedisInstrumentation;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/redis/index.js
var require_redis = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const dc$1 = __require("node:diagnostics_channel");
	const serverUtils = require_cjs$1();
	const nodeCore = require_cjs$2();
	const redisCache = require_redisCache();
	const ioredisInstrumentation = require_ioredis_instrumentation();
	const redisInstrumentation = require_redis_instrumentation();
	const INTEGRATION_NAME = "Redis";
	exports._redisOptions = {};
	const cacheResponseHook = (span, redisCommand, cmdArgs, response) => {
		const safeKey = redisCache.getCacheKeySafely(redisCommand, cmdArgs);
		const cacheOperation = redisCache.getCacheOperation(redisCommand);
		if (!safeKey || !cacheOperation || !exports._redisOptions.cachePrefixes || !redisCache.shouldConsiderForCache(redisCommand, safeKey, exports._redisOptions.cachePrefixes)) return;
		const spanData = core.spanToJSON(span).data;
		const networkPeerAddress = spanData["net.peer.name"] ?? spanData["server.address"];
		const networkPeerPort = spanData["net.peer.port"] ?? spanData["server.port"];
		if (networkPeerPort && networkPeerAddress) span.setAttributes({
			"network.peer.address": networkPeerAddress,
			"network.peer.port": networkPeerPort
		});
		const cacheItemSize = redisCache.calculateCacheItemSize(response);
		if (cacheItemSize) span.setAttribute(core.SEMANTIC_ATTRIBUTE_CACHE_ITEM_SIZE, cacheItemSize);
		if (redisCache.isInCommands(redisCache.GET_COMMANDS, redisCommand) && cacheItemSize !== void 0) span.setAttribute(core.SEMANTIC_ATTRIBUTE_CACHE_HIT, cacheItemSize > 0);
		span.setAttributes({
			[core.SEMANTIC_ATTRIBUTE_SENTRY_OP]: cacheOperation,
			[core.SEMANTIC_ATTRIBUTE_CACHE_KEY]: safeKey
		});
		const spanDescription = safeKey.join(", ");
		span.updateName(exports._redisOptions.maxCacheKeyLength ? core.truncate(spanDescription, exports._redisOptions.maxCacheKeyLength) : spanDescription);
	};
	const instrumentIORedis = nodeCore.generateInstrumentOnce(`${INTEGRATION_NAME}.IORedis`, () => {
		return new ioredisInstrumentation.IORedisInstrumentation({ responseHook: cacheResponseHook });
	});
	const instrumentRedisModule = nodeCore.generateInstrumentOnce(`${INTEGRATION_NAME}.Redis`, () => {
		return new redisInstrumentation.RedisInstrumentation({ responseHook: cacheResponseHook });
	});
	const instrumentRedis = Object.assign(() => {
		instrumentIORedis();
		instrumentRedisModule();
		if (dc$1.tracingChannel) Promise.resolve().then(() => serverUtils.subscribeRedisDiagnosticChannels(dc$1.tracingChannel, cacheResponseHook));
	}, { id: INTEGRATION_NAME });
	const _redisIntegration = ((options = {}) => {
		return {
			name: INTEGRATION_NAME,
			setupOnce() {
				exports._redisOptions = options;
				instrumentRedis();
			}
		};
	});
	const redisIntegration = core.defineIntegration(_redisIntegration);
	exports.cacheResponseHook = cacheResponseHook;
	exports.instrumentRedis = instrumentRedis;
	exports.redisIntegration = redisIntegration;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/postgres/vendored/enums/SpanNames.js
var require_SpanNames = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	var SpanNames = /* @__PURE__ */ ((SpanNames2) => {
		SpanNames2["QUERY_PREFIX"] = "pg.query";
		SpanNames2["CONNECT"] = "pg.connect";
		SpanNames2["POOL_CONNECT"] = "pg-pool.connect";
		return SpanNames2;
	})(SpanNames || {});
	exports.SpanNames = SpanNames;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/postgres/vendored/enums/AttributeNames.js
var require_AttributeNames$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	var AttributeNames = /* @__PURE__ */ ((AttributeNames2) => {
		AttributeNames2["PG_PLAN"] = "db.postgresql.plan";
		AttributeNames2["IDLE_TIMEOUT_MILLIS"] = "db.postgresql.idle.timeout.millis";
		AttributeNames2["MAX_CLIENT"] = "db.postgresql.max.client";
		return AttributeNames2;
	})(AttributeNames || {});
	exports.AttributeNames = AttributeNames;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/postgres/vendored/semconv.js
var require_semconv$4 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const ATTR_DB_CONNECTION_STRING = "db.connection_string";
	const ATTR_DB_NAME = "db.name";
	const ATTR_DB_STATEMENT = "db.statement";
	const ATTR_DB_SYSTEM = "db.system";
	const ATTR_DB_USER = "db.user";
	const ATTR_NET_PEER_NAME = "net.peer.name";
	const ATTR_NET_PEER_PORT = "net.peer.port";
	const DB_SYSTEM_VALUE_POSTGRESQL = "postgresql";
	exports.ATTR_DB_CONNECTION_STRING = ATTR_DB_CONNECTION_STRING;
	exports.ATTR_DB_NAME = ATTR_DB_NAME;
	exports.ATTR_DB_STATEMENT = ATTR_DB_STATEMENT;
	exports.ATTR_DB_SYSTEM = ATTR_DB_SYSTEM;
	exports.ATTR_DB_USER = ATTR_DB_USER;
	exports.ATTR_NET_PEER_NAME = ATTR_NET_PEER_NAME;
	exports.ATTR_NET_PEER_PORT = ATTR_NET_PEER_PORT;
	exports.DB_SYSTEM_VALUE_POSTGRESQL = DB_SYSTEM_VALUE_POSTGRESQL;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/postgres/vendored/utils.js
var require_utils$6 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const AttributeNames = require_AttributeNames$3();
	const SpanNames = require_SpanNames();
	const semconv = require_semconv$4();
	const ORIGIN = "auto.db.otel.postgres";
	function getQuerySpanName(dbName, queryConfig) {
		if (!queryConfig) return SpanNames.SpanNames.QUERY_PREFIX;
		const command = typeof queryConfig.name === "string" && queryConfig.name ? queryConfig.name : parseNormalizedOperationName(queryConfig.text);
		return `${SpanNames.SpanNames.QUERY_PREFIX}:${command}${dbName ? ` ${dbName}` : ""}`;
	}
	function parseNormalizedOperationName(queryText) {
		const trimmedQuery = queryText.trim();
		const indexOfFirstSpace = trimmedQuery.indexOf(" ");
		let sqlCommand = indexOfFirstSpace === -1 ? trimmedQuery : trimmedQuery.slice(0, indexOfFirstSpace);
		sqlCommand = sqlCommand.toUpperCase();
		return sqlCommand.endsWith(";") ? sqlCommand.slice(0, -1) : sqlCommand;
	}
	function parseAndMaskConnectionString(connectionString) {
		try {
			const url = new URL(connectionString);
			url.username = "";
			url.password = "";
			return url.toString();
		} catch {
			return "postgresql://localhost:5432/";
		}
	}
	function getConnectionString(params) {
		if ("connectionString" in params && params.connectionString) return parseAndMaskConnectionString(params.connectionString);
		return `postgresql://${params.host || "localhost"}:${params.port || 5432}/${params.database || ""}`;
	}
	function getPort(port) {
		if (Number.isInteger(port)) return port;
	}
	function getSemanticAttributesFromConnection(params) {
		return {
			[semconv.ATTR_DB_SYSTEM]: semconv.DB_SYSTEM_VALUE_POSTGRESQL,
			[semconv.ATTR_DB_NAME]: params.database,
			[semconv.ATTR_DB_CONNECTION_STRING]: getConnectionString(params),
			[semconv.ATTR_DB_USER]: params.user,
			[semconv.ATTR_NET_PEER_NAME]: params.host,
			[semconv.ATTR_NET_PEER_PORT]: getPort(params.port)
		};
	}
	function getSemanticAttributesFromPoolConnection(params) {
		let url;
		try {
			url = params.connectionString ? new URL(params.connectionString) : void 0;
		} catch {
			url = void 0;
		}
		return {
			[AttributeNames.AttributeNames.IDLE_TIMEOUT_MILLIS]: params.idleTimeoutMillis,
			[AttributeNames.AttributeNames.MAX_CLIENT]: params.maxClient,
			[semconv.ATTR_DB_SYSTEM]: semconv.DB_SYSTEM_VALUE_POSTGRESQL,
			[semconv.ATTR_DB_NAME]: url?.pathname.slice(1) ?? params.database,
			[semconv.ATTR_DB_CONNECTION_STRING]: getConnectionString(params),
			[semconv.ATTR_NET_PEER_NAME]: url?.hostname ?? params.host,
			[semconv.ATTR_NET_PEER_PORT]: Number(url?.port) || getPort(params.port),
			[semconv.ATTR_DB_USER]: url?.username ?? params.user
		};
	}
	function shouldSkipInstrumentation() {
		return core.getActiveSpan() === void 0;
	}
	function handleConfigQuery(queryConfig) {
		const { connectionParameters } = this;
		const dbName = connectionParameters.database;
		const spanName = getQuerySpanName(dbName, queryConfig);
		const span = core.startInactiveSpan({
			name: spanName,
			kind: core.SPAN_KIND.CLIENT,
			attributes: {
				...getSemanticAttributesFromConnection(connectionParameters),
				[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: ORIGIN
			}
		});
		if (!queryConfig) return span;
		if (queryConfig.text) span.setAttribute(semconv.ATTR_DB_STATEMENT, queryConfig.text);
		if (typeof queryConfig.name === "string") span.setAttribute(AttributeNames.AttributeNames.PG_PLAN, queryConfig.name);
		return span;
	}
	function patchCallback(span, cb) {
		return function patchedCallback(err, res) {
			if (err) span.setStatus({
				code: core.SPAN_STATUS_ERROR,
				message: err.message
			});
			span.end();
			cb.call(this, err, res);
		};
	}
	function patchCallbackPGPool(span, cb) {
		return function patchedCallback(err, res, done) {
			if (err) span.setStatus({
				code: core.SPAN_STATUS_ERROR,
				message: err.message
			});
			span.end();
			cb.call(this, err, res, done);
		};
	}
	function patchClientConnectCallback(span, cb) {
		return function patchedClientConnectCallback(...args) {
			const err = args[0];
			if (err instanceof Error) span.setStatus({
				code: core.SPAN_STATUS_ERROR,
				message: err.message
			});
			span.end();
			cb.apply(this, args);
		};
	}
	function getErrorMessage(e) {
		return typeof e === "object" && e !== null && "message" in e ? String(e.message) : void 0;
	}
	function isObjectWithTextString(it) {
		return typeof it === "object" && typeof it?.text === "string";
	}
	exports.ORIGIN = ORIGIN;
	exports.getConnectionString = getConnectionString;
	exports.getErrorMessage = getErrorMessage;
	exports.getQuerySpanName = getQuerySpanName;
	exports.getSemanticAttributesFromConnection = getSemanticAttributesFromConnection;
	exports.getSemanticAttributesFromPoolConnection = getSemanticAttributesFromPoolConnection;
	exports.handleConfigQuery = handleConfigQuery;
	exports.isObjectWithTextString = isObjectWithTextString;
	exports.parseAndMaskConnectionString = parseAndMaskConnectionString;
	exports.parseNormalizedOperationName = parseNormalizedOperationName;
	exports.patchCallback = patchCallback;
	exports.patchCallbackPGPool = patchCallbackPGPool;
	exports.patchClientConnectCallback = patchClientConnectCallback;
	exports.shouldSkipInstrumentation = shouldSkipInstrumentation;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/postgres/vendored/instrumentation.js
var require_instrumentation$16 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const instrumentation = require_src$1();
	const core = require_cjs$4();
	const InstrumentationNodeModuleFile = require_InstrumentationNodeModuleFile();
	const SpanNames = require_SpanNames();
	const utils = require_utils$6();
	const PACKAGE_NAME = "@sentry/instrumentation-pg";
	function extractModuleExports(module$12) {
		return module$12[Symbol.toStringTag] === "Module" ? module$12.default : module$12;
	}
	function bindCallbackToSpan(parentSpan, callback) {
		return function(...args) {
			return core.withActiveSpan(parentSpan, () => callback.apply(this, args));
		};
	}
	var PgInstrumentation = class extends instrumentation.InstrumentationBase {
		constructor(config = {}) {
			super(PACKAGE_NAME, core.SDK_VERSION, config);
		}
		init() {
			const SUPPORTED_PG_VERSIONS = [">=8.0.3 <9"];
			const SUPPORTED_PG_POOL_VERSIONS = [">=2.0.0 <4"];
			const modulePgNativeClient = new InstrumentationNodeModuleFile.InstrumentationNodeModuleFile("pg/lib/native/client.js", SUPPORTED_PG_VERSIONS, this._patchPgClient.bind(this), this._unpatchPgClient.bind(this));
			const modulePgClient = new InstrumentationNodeModuleFile.InstrumentationNodeModuleFile("pg/lib/client.js", SUPPORTED_PG_VERSIONS, this._patchPgClient.bind(this), this._unpatchPgClient.bind(this));
			return [new instrumentation.InstrumentationNodeModuleDefinition("pg", SUPPORTED_PG_VERSIONS, (module$13) => {
				const moduleExports = extractModuleExports(module$13);
				this._patchPgClient(moduleExports.Client);
				return module$13;
			}, (module$14) => {
				const moduleExports = extractModuleExports(module$14);
				this._unpatchPgClient(moduleExports.Client);
				return module$14;
			}, [modulePgClient, modulePgNativeClient]), new instrumentation.InstrumentationNodeModuleDefinition("pg-pool", SUPPORTED_PG_POOL_VERSIONS, (module$15) => {
				const moduleExports = extractModuleExports(module$15);
				if (instrumentation.isWrapped(moduleExports.prototype.connect)) this._unwrap(moduleExports.prototype, "connect");
				this._wrap(moduleExports.prototype, "connect", this._getPoolConnectPatch());
				return moduleExports;
			}, (module$16) => {
				const moduleExports = extractModuleExports(module$16);
				if (instrumentation.isWrapped(moduleExports.prototype.connect)) this._unwrap(moduleExports.prototype, "connect");
			})];
		}
		_patchPgClient(module$17) {
			if (!module$17) return;
			const moduleExports = extractModuleExports(module$17);
			if (instrumentation.isWrapped(moduleExports.prototype.query)) this._unwrap(moduleExports.prototype, "query");
			if (instrumentation.isWrapped(moduleExports.prototype.connect)) this._unwrap(moduleExports.prototype, "connect");
			this._wrap(moduleExports.prototype, "query", this._getClientQueryPatch());
			this._wrap(moduleExports.prototype, "connect", this._getClientConnectPatch());
			return module$17;
		}
		_unpatchPgClient(module$18) {
			const moduleExports = extractModuleExports(module$18);
			if (instrumentation.isWrapped(moduleExports.prototype.query)) this._unwrap(moduleExports.prototype, "query");
			if (instrumentation.isWrapped(moduleExports.prototype.connect)) this._unwrap(moduleExports.prototype, "connect");
			return module$18;
		}
		_getClientConnectPatch() {
			const plugin = this;
			return (original) => {
				return function connect(callback) {
					if (utils.shouldSkipInstrumentation() || plugin.getConfig().ignoreConnectSpans) return original.call(this, callback);
					const span = core.startInactiveSpan({
						name: SpanNames.SpanNames.CONNECT,
						kind: core.SPAN_KIND.CLIENT,
						attributes: utils.getSemanticAttributesFromConnection(this)
					});
					let cb = callback;
					if (cb) {
						const parentSpan = core.getActiveSpan();
						cb = utils.patchClientConnectCallback(span, cb);
						if (parentSpan) cb = bindCallbackToSpan(parentSpan, cb);
					}
					return handleConnectResult(span, core.withActiveSpan(span, () => {
						return original.call(this, cb);
					}));
				};
			};
		}
		_getClientQueryPatch() {
			return (original) => {
				this._diag.debug("Patching pg.Client.prototype.query");
				return function query(...args) {
					if (utils.shouldSkipInstrumentation()) return original.apply(this, args);
					const arg0 = args[0];
					const firstArgIsString = typeof arg0 === "string";
					const firstArgIsQueryObjectWithText = utils.isObjectWithTextString(arg0);
					const queryConfig = firstArgIsString ? {
						text: arg0,
						values: Array.isArray(args[1]) ? args[1] : void 0
					} : firstArgIsQueryObjectWithText ? {
						...arg0,
						name: arg0.name,
						text: arg0.text,
						values: arg0.values ?? (Array.isArray(args[1]) ? args[1] : void 0)
					} : void 0;
					const span = utils.handleConfigQuery.call(this, queryConfig);
					if (args.length > 0) {
						const parentSpan = core.getActiveSpan();
						if (typeof args[args.length - 1] === "function") {
							args[args.length - 1] = utils.patchCallback(span, args[args.length - 1]);
							if (parentSpan) args[args.length - 1] = bindCallbackToSpan(parentSpan, args[args.length - 1]);
						} else if (typeof queryConfig?.callback === "function") {
							let callback = utils.patchCallback(span, queryConfig.callback);
							if (parentSpan) callback = bindCallbackToSpan(parentSpan, callback);
							args[0].callback = callback;
						}
					}
					let result;
					try {
						result = original.apply(this, args);
					} catch (e) {
						span.setStatus({
							code: core.SPAN_STATUS_ERROR,
							message: utils.getErrorMessage(e)
						});
						span.end();
						throw e;
					}
					if (result instanceof Promise) return result.then((result2) => {
						span.end();
						return result2;
					}).catch((error) => {
						span.setStatus({
							code: core.SPAN_STATUS_ERROR,
							message: utils.getErrorMessage(error)
						});
						span.end();
						return Promise.reject(error);
					});
					return result;
				};
			};
		}
		_getPoolConnectPatch() {
			const plugin = this;
			return (originalConnect) => {
				return function connect(callback) {
					if (utils.shouldSkipInstrumentation() || plugin.getConfig().ignoreConnectSpans) return originalConnect.call(this, callback);
					const span = core.startInactiveSpan({
						name: SpanNames.SpanNames.POOL_CONNECT,
						kind: core.SPAN_KIND.CLIENT,
						attributes: utils.getSemanticAttributesFromPoolConnection(this.options)
					});
					let cb = callback;
					if (cb) {
						const parentSpan = core.getActiveSpan();
						cb = utils.patchCallbackPGPool(span, cb);
						if (parentSpan) cb = bindCallbackToSpan(parentSpan, cb);
					}
					return handleConnectResult(span, core.withActiveSpan(span, () => {
						return originalConnect.call(this, cb);
					}));
				};
			};
		}
	};
	function handleConnectResult(span, connectResult) {
		if (!(connectResult instanceof Promise)) return connectResult;
		return connectResult.then((result) => {
			span.end();
			return result;
		}).catch((error) => {
			span.setStatus({
				code: core.SPAN_STATUS_ERROR,
				message: utils.getErrorMessage(error)
			});
			span.end();
			return Promise.reject(error);
		});
	}
	exports.PgInstrumentation = PgInstrumentation;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/postgres/index.js
var require_postgres = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const instrumentation = require_instrumentation$16();
	const core = require_cjs$4();
	const nodeCore = require_cjs$2();
	const INTEGRATION_NAME = "Postgres";
	const instrumentPostgres = nodeCore.generateInstrumentOnce(INTEGRATION_NAME, instrumentation.PgInstrumentation, (options) => ({ ignoreConnectSpans: options?.ignoreConnectSpans ?? false }));
	const _postgresIntegration = ((options) => {
		return {
			name: INTEGRATION_NAME,
			setupOnce() {
				instrumentPostgres(options);
			}
		};
	});
	const postgresIntegration = core.defineIntegration(_postgresIntegration);
	exports.instrumentPostgres = instrumentPostgres;
	exports.postgresIntegration = postgresIntegration;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/postgresjs.js
var require_postgresjs = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const api = require_src();
	const instrumentation = require_src$1();
	const InstrumentationNodeModuleFile = require_InstrumentationNodeModuleFile();
	const semanticConventions = require_src$3();
	const core = require_cjs$4();
	const nodeCore = require_cjs$2();
	const debugBuild = require_debug_build$2();
	const INTEGRATION_NAME = "PostgresJs";
	const SUPPORTED_VERSIONS = [">=3.0.0 <4"];
	const SQL_OPERATION_REGEX = /^(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)/i;
	const QUERY_FROM_INSTRUMENTED_SQL = /* @__PURE__ */ Symbol.for("sentry.query.from.instrumented.sql");
	const instrumentPostgresJs = nodeCore.generateInstrumentOnce(INTEGRATION_NAME, (options) => new PostgresJsInstrumentation({
		requireParentSpan: options?.requireParentSpan ?? true,
		requestHook: options?.requestHook
	}));
	var PostgresJsInstrumentation = class extends instrumentation.InstrumentationBase {
		constructor(config) {
			super("sentry-postgres-js", core.SDK_VERSION, config);
		}
		/**
		* Initializes the instrumentation by patching the postgres module.
		* Uses two complementary approaches:
		* 1. Main function wrapper: instruments sql instances created AFTER instrumentation is set up (CJS + ESM)
		* 2. Query.prototype patch: fallback for sql instances created BEFORE instrumentation (CJS only)
		*/
		init() {
			const module$11 = new instrumentation.InstrumentationNodeModuleDefinition("postgres", SUPPORTED_VERSIONS, (exports$22) => {
				try {
					return this._patchPostgres(exports$22);
				} catch (e) {
					debugBuild.DEBUG_BUILD && core.debug.error("Failed to patch postgres module:", e);
					return exports$22;
				}
			}, (exports$23) => exports$23);
			[
				"src",
				"cf/src",
				"cjs/src"
			].forEach((path) => {
				module$11.files.push(new InstrumentationNodeModuleFile.InstrumentationNodeModuleFile(`postgres/${path}/query.js`, SUPPORTED_VERSIONS, this._patchQueryPrototype.bind(this), this._unpatchQueryPrototype.bind(this)));
			});
			return module$11;
		}
		/**
		* Patches the postgres module by wrapping the main export function.
		* This intercepts the creation of sql instances and instruments them.
		*/
		_patchPostgres(exports$24) {
			const isFunction = typeof exports$24 === "function";
			const Original = isFunction ? exports$24 : exports$24.default;
			if (typeof Original !== "function") {
				debugBuild.DEBUG_BUILD && core.debug.warn("postgres module does not export a function. Skipping instrumentation.");
				return exports$24;
			}
			const self = this;
			const WrappedPostgres = function(...args) {
				const sql = Reflect.construct(Original, args);
				if (!sql || typeof sql !== "function") {
					debugBuild.DEBUG_BUILD && core.debug.warn("postgres() did not return a valid instance");
					return sql;
				}
				const config = self.getConfig();
				return core.instrumentPostgresJsSql(sql, {
					requireParentSpan: config.requireParentSpan,
					requestHook: config.requestHook
				});
			};
			Object.setPrototypeOf(WrappedPostgres, Original);
			Object.setPrototypeOf(WrappedPostgres.prototype, Original.prototype);
			for (const key of Object.getOwnPropertyNames(Original)) if (![
				"length",
				"name",
				"prototype"
			].includes(key)) {
				const descriptor = Object.getOwnPropertyDescriptor(Original, key);
				if (descriptor) Object.defineProperty(WrappedPostgres, key, descriptor);
			}
			if (isFunction) return WrappedPostgres;
			else {
				core.replaceExports(exports$24, "default", WrappedPostgres);
				return exports$24;
			}
		}
		/**
		* Determines whether a span should be created based on the current context.
		* If `requireParentSpan` is set to true in the configuration, a span will
		* only be created if there is a parent span available.
		*/
		_shouldCreateSpans() {
			const config = this.getConfig();
			return api.trace.getSpan(api.context.active()) !== void 0 || !config.requireParentSpan;
		}
		/**
		* Extracts DB operation name from SQL query and sets it on the span.
		*/
		_setOperationName(span, sanitizedQuery, command) {
			if (command) {
				span.setAttribute(semanticConventions.ATTR_DB_OPERATION_NAME, command);
				return;
			}
			const operationMatch = sanitizedQuery?.match(SQL_OPERATION_REGEX);
			if (operationMatch?.[1]) span.setAttribute(semanticConventions.ATTR_DB_OPERATION_NAME, operationMatch[1].toUpperCase());
		}
		/**
		* Reconstructs the full SQL query from template strings with PostgreSQL placeholders.
		*
		* For sql`SELECT * FROM users WHERE id = ${123} AND name = ${'foo'}`:
		*   strings = ["SELECT * FROM users WHERE id = ", " AND name = ", ""]
		*   returns: "SELECT * FROM users WHERE id = $1 AND name = $2"
		*/
		_reconstructQuery(strings) {
			if (!strings?.length) return;
			if (strings.length === 1) return strings[0] || void 0;
			return strings.reduce((acc, str, i) => i === 0 ? str : `${acc}$${i}${str}`, "");
		}
		/**
		* Sanitize SQL query as per the OTEL semantic conventions
		* https://opentelemetry.io/docs/specs/semconv/database/database-spans/#sanitization-of-dbquerytext
		*
		* PostgreSQL $n placeholders are preserved per OTEL spec - they're parameterized queries,
		* not sensitive literals. Only actual values (strings, numbers, booleans) are sanitized.
		*/
		_sanitizeSqlQuery(sqlQuery) {
			if (!sqlQuery) return "Unknown SQL Query";
			return sqlQuery.replace(/--.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/;\s*$/, "").replace(/\s+/g, " ").trim().replace(/\bX'[0-9A-Fa-f]*'/gi, "?").replace(/\bB'[01]*'/gi, "?").replace(/'(?:[^']|'')*'/g, "?").replace(/\b0x[0-9A-Fa-f]+/gi, "?").replace(/\b(?:TRUE|FALSE)\b/gi, "?").replace(/-?\b\d+\.?\d*[eE][+-]?\d+\b/g, "?").replace(/-?\b\d+\.\d+\b/g, "?").replace(/-?\.\d+\b/g, "?").replace(/(?<!\$)-?\b\d+\b/g, "?").replace(/\bIN\b\s*\(\s*\?(?:\s*,\s*\?)*\s*\)/gi, "IN (?)").replace(/\bIN\b\s*\(\s*\$\d+(?:\s*,\s*\$\d+)*\s*\)/gi, "IN ($?)");
		}
		/**
		* Fallback patch for Query.prototype.handle to instrument queries from pre-existing sql instances.
		* This catches queries from sql instances created BEFORE Sentry was initialized (CJS only).
		*
		* Note: Queries from pre-existing instances won't have connection context (database, host, port)
		* because the sql instance wasn't created through our instrumented wrapper.
		*/
		_patchQueryPrototype(moduleExports) {
			const self = this;
			const originalHandle = moduleExports.Query.prototype.handle;
			moduleExports.Query.prototype.handle = async function(...args) {
				if (this.executed || this[QUERY_FROM_INSTRUMENTED_SQL]) return originalHandle.apply(this, args);
				if (!self._shouldCreateSpans()) return originalHandle.apply(this, args);
				const fullQuery = self._reconstructQuery(this.strings);
				const sanitizedSqlQuery = self._sanitizeSqlQuery(fullQuery);
				return core.startSpanManual({
					name: sanitizedSqlQuery || "postgresjs.query",
					op: "db"
				}, (span) => {
					nodeCore.addOriginToSpan(span, "auto.db.postgresjs");
					span.setAttributes({
						[semanticConventions.ATTR_DB_SYSTEM_NAME]: "postgres",
						[semanticConventions.ATTR_DB_QUERY_TEXT]: sanitizedSqlQuery
					});
					const { requestHook } = self.getConfig();
					if (requestHook) instrumentation.safeExecuteInTheMiddle(() => requestHook(span, sanitizedSqlQuery, void 0), (e) => {
						if (e) {
							span.setAttribute("sentry.hook.error", "requestHook failed");
							debugBuild.DEBUG_BUILD && core.debug.error(`Error in requestHook for ${INTEGRATION_NAME} integration:`, e);
						}
					}, true);
					const originalResolve = this.resolve;
					this.resolve = new Proxy(originalResolve, { apply: (resolveTarget, resolveThisArg, resolveArgs) => {
						try {
							self._setOperationName(span, sanitizedSqlQuery, resolveArgs?.[0]?.command);
							span.end();
						} catch (e) {
							debugBuild.DEBUG_BUILD && core.debug.error("Error ending span in resolve callback:", e);
						}
						return Reflect.apply(resolveTarget, resolveThisArg, resolveArgs);
					} });
					const originalReject = this.reject;
					this.reject = new Proxy(originalReject, { apply: (rejectTarget, rejectThisArg, rejectArgs) => {
						try {
							span.setStatus({
								code: core.SPAN_STATUS_ERROR,
								message: rejectArgs?.[0]?.message || "unknown_error"
							});
							span.setAttribute(semanticConventions.ATTR_DB_RESPONSE_STATUS_CODE, rejectArgs?.[0]?.code || "unknown");
							span.setAttribute(semanticConventions.ATTR_ERROR_TYPE, rejectArgs?.[0]?.name || "unknown");
							self._setOperationName(span, sanitizedSqlQuery);
							span.end();
						} catch (e) {
							debugBuild.DEBUG_BUILD && core.debug.error("Error ending span in reject callback:", e);
						}
						return Reflect.apply(rejectTarget, rejectThisArg, rejectArgs);
					} });
					try {
						return originalHandle.apply(this, args);
					} catch (e) {
						span.setStatus({
							code: core.SPAN_STATUS_ERROR,
							message: e instanceof Error ? e.message : "unknown_error"
						});
						span.end();
						throw e;
					}
				});
			};
			moduleExports.Query.prototype.handle.__sentry_original__ = originalHandle;
			return moduleExports;
		}
		/**
		* Restores the original Query.prototype.handle method.
		*/
		_unpatchQueryPrototype(moduleExports) {
			if (moduleExports.Query.prototype.handle.__sentry_original__) moduleExports.Query.prototype.handle = moduleExports.Query.prototype.handle.__sentry_original__;
			return moduleExports;
		}
	};
	const _postgresJsIntegration = ((options) => {
		return {
			name: INTEGRATION_NAME,
			setupOnce() {
				instrumentPostgresJs(options);
			}
		};
	});
	const postgresJsIntegration = core.defineIntegration(_postgresJsIntegration);
	exports.PostgresJsInstrumentation = PostgresJsInstrumentation;
	exports.instrumentPostgresJs = instrumentPostgresJs;
	exports.postgresJsIntegration = postgresJsIntegration;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/prisma/vendored/global.js
var require_global = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const majorVersion = "7";
	const GLOBAL_INSTRUMENTATION_KEY = "PRISMA_INSTRUMENTATION";
	const GLOBAL_VERSIONED_INSTRUMENTATION_KEY = `V${majorVersion}_PRISMA_INSTRUMENTATION`;
	const globalThisWithPrismaInstrumentation = globalThis;
	function getGlobalTracingHelper() {
		const versionedGlobal = globalThisWithPrismaInstrumentation[GLOBAL_VERSIONED_INSTRUMENTATION_KEY];
		if (versionedGlobal?.helper) return versionedGlobal.helper;
		return globalThisWithPrismaInstrumentation[GLOBAL_INSTRUMENTATION_KEY]?.helper;
	}
	function setGlobalTracingHelper(helper) {
		const globalValue = { helper };
		globalThisWithPrismaInstrumentation[GLOBAL_VERSIONED_INSTRUMENTATION_KEY] = globalValue;
		globalThisWithPrismaInstrumentation[GLOBAL_INSTRUMENTATION_KEY] = globalValue;
	}
	function clearGlobalTracingHelper() {
		delete globalThisWithPrismaInstrumentation[GLOBAL_VERSIONED_INSTRUMENTATION_KEY];
		delete globalThisWithPrismaInstrumentation[GLOBAL_INSTRUMENTATION_KEY];
	}
	exports.clearGlobalTracingHelper = clearGlobalTracingHelper;
	exports.getGlobalTracingHelper = getGlobalTracingHelper;
	exports.setGlobalTracingHelper = setGlobalTracingHelper;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/prisma/vendored/active-tracing-helper.js
var require_active_tracing_helper = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const api = require_src();
	const showAllTraces = process.env.PRISMA_SHOW_ALL_TRACES === "true";
	const nonSampledTraceParent = `00-10-10-00`;
	function engineSpanKindToOtelSpanKind(engineSpanKind) {
		switch (engineSpanKind) {
			case "client": return api.SpanKind.CLIENT;
			default: return api.SpanKind.INTERNAL;
		}
	}
	var ActiveTracingHelper = class {
		constructor({ tracerProvider, ignoreSpanTypes }) {
			this.tracerProvider = tracerProvider;
			this.ignoreSpanTypes = ignoreSpanTypes;
		}
		isEnabled() {
			return true;
		}
		getTraceParent(context) {
			const span = api.trace.getSpanContext(context ?? api.context.active());
			if (span) return `00-${span.traceId}-${span.spanId}-0${span.traceFlags}`;
			return nonSampledTraceParent;
		}
		dispatchEngineSpans(spans) {
			const tracer = this.tracerProvider.getTracer("prisma");
			const linkIds = /* @__PURE__ */ new Map();
			const roots = spans.filter((span) => span.parentId === null);
			for (const root of roots) dispatchEngineSpan(tracer, root, spans, linkIds, this.ignoreSpanTypes);
		}
		getActiveContext() {
			return api.context.active();
		}
		runInChildSpan(options, callback) {
			if (typeof options === "string") options = { name: options };
			if (options.internal && !showAllTraces) return callback();
			const tracer = this.tracerProvider.getTracer("prisma");
			const context = options.context ?? this.getActiveContext();
			const name = `prisma:client:${options.name}`;
			if (shouldIgnoreSpan(name, this.ignoreSpanTypes)) return callback();
			if (options.active === false) {
				const span = tracer.startSpan(name, options, context);
				return endSpan(span, callback(span, context));
			}
			return tracer.startActiveSpan(name, options, (span) => endSpan(span, callback(span, context)));
		}
	};
	function dispatchEngineSpan(tracer, engineSpan, allSpans, linkIds, ignoreSpanTypes) {
		if (shouldIgnoreSpan(engineSpan.name, ignoreSpanTypes)) return;
		const spanOptions = {
			attributes: engineSpan.attributes,
			kind: engineSpanKindToOtelSpanKind(engineSpan.kind),
			startTime: engineSpan.startTime
		};
		tracer.startActiveSpan(engineSpan.name, spanOptions, (span) => {
			linkIds.set(engineSpan.id, span.spanContext().spanId);
			if (engineSpan.links) span.addLinks(engineSpan.links.flatMap((link) => {
				const linkedId = linkIds.get(link);
				if (!linkedId) return [];
				return { context: {
					spanId: linkedId,
					traceId: span.spanContext().traceId,
					traceFlags: span.spanContext().traceFlags
				} };
			}));
			const children = allSpans.filter((s) => s.parentId === engineSpan.id);
			for (const child of children) dispatchEngineSpan(tracer, child, allSpans, linkIds, ignoreSpanTypes);
			span.end(engineSpan.endTime);
		});
	}
	function endSpan(span, result) {
		if (isPromiseLike(result)) return result.then((value) => {
			span.end();
			return value;
		}, (reason) => {
			span.end();
			throw reason;
		});
		span.end();
		return result;
	}
	function isPromiseLike(value) {
		return value != null && typeof value["then"] === "function";
	}
	function shouldIgnoreSpan(spanName, ignoreSpanTypes) {
		return ignoreSpanTypes.some((pattern) => typeof pattern === "string" ? pattern === spanName : pattern.test(spanName));
	}
	exports.ActiveTracingHelper = ActiveTracingHelper;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/prisma/vendored/constants.js
var require_constants$5 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const VERSION = require_cjs$4().SDK_VERSION;
	const NAME = "@sentry/instrumentation-prisma";
	const MODULE_NAME = "@prisma/client";
	const SUPPORTED_MODULE_VERSIONS = [">=5.0.0"];
	exports.MODULE_NAME = MODULE_NAME;
	exports.NAME = NAME;
	exports.SUPPORTED_MODULE_VERSIONS = SUPPORTED_MODULE_VERSIONS;
	exports.VERSION = VERSION;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/prisma/vendored/instrumentation.js
var require_instrumentation$15 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const api = require_src();
	const instrumentation = require_src$1();
	const global = require_global();
	const activeTracingHelper = require_active_tracing_helper();
	const constants = require_constants$5();
	var PrismaInstrumentation = class extends instrumentation.InstrumentationBase {
		constructor(config = {}) {
			super(constants.NAME, constants.VERSION, config);
		}
		setTracerProvider(tracerProvider) {
			this.tracerProvider = tracerProvider;
		}
		init() {
			return [new instrumentation.InstrumentationNodeModuleDefinition(constants.MODULE_NAME, constants.SUPPORTED_MODULE_VERSIONS)];
		}
		enable() {
			const config = this._config;
			global.setGlobalTracingHelper(new activeTracingHelper.ActiveTracingHelper({
				tracerProvider: this.tracerProvider ?? api.trace.getTracerProvider(),
				ignoreSpanTypes: config.ignoreSpanTypes ?? []
			}));
		}
		disable() {
			global.clearGlobalTracingHelper();
		}
		isEnabled() {
			return global.getGlobalTracingHelper() !== void 0;
		}
	};
	exports.PrismaInstrumentation = PrismaInstrumentation;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/prisma/index.js
var require_prisma = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const api = require_src();
	const core = require_cjs$4();
	const nodeCore = require_cjs$2();
	const instrumentation = require_instrumentation$15();
	const INTEGRATION_NAME = "Prisma";
	function isPrismaV6TracingHelper(helper) {
		return !!helper && typeof helper === "object" && "dispatchEngineSpans" in helper;
	}
	function getPrismaTracingHelper() {
		const prismaInstrumentationObject = globalThis.PRISMA_INSTRUMENTATION;
		return prismaInstrumentationObject && typeof prismaInstrumentationObject === "object" && "helper" in prismaInstrumentationObject ? prismaInstrumentationObject.helper : void 0;
	}
	var SentryPrismaInteropInstrumentation = class extends instrumentation.PrismaInstrumentation {
		constructor(options) {
			super(options?.instrumentationConfig);
		}
		enable() {
			super.enable();
			const prismaTracingHelper = getPrismaTracingHelper();
			if (isPrismaV6TracingHelper(prismaTracingHelper)) prismaTracingHelper.createEngineSpan = (engineSpanEvent) => {
				const tracer = api.trace.getTracer("prismaV5Compatibility");
				const initialIdGenerator = tracer._idGenerator;
				if (!initialIdGenerator) {
					core.consoleSandbox(() => {
						console.warn("[Sentry] Could not find _idGenerator on tracer, skipping Prisma v5 compatibility - some Prisma spans may be missing!");
					});
					return;
				}
				try {
					engineSpanEvent.spans.forEach((engineSpan) => {
						const kind = engineSpanKindToOTELSpanKind(engineSpan.kind);
						const parentSpanId = engineSpan.parent_span_id;
						const spanId = engineSpan.span_id;
						const traceId = engineSpan.trace_id;
						const links = engineSpan.links?.map((link) => {
							return { context: {
								traceId: link.trace_id,
								spanId: link.span_id,
								traceFlags: api.TraceFlags.SAMPLED
							} };
						});
						const ctx = api.trace.setSpanContext(api.context.active(), {
							traceId,
							spanId: parentSpanId,
							traceFlags: api.TraceFlags.SAMPLED
						});
						api.context.with(ctx, () => {
							tracer._idGenerator = {
								generateTraceId: () => {
									return traceId;
								},
								generateSpanId: () => {
									return spanId;
								}
							};
							tracer.startSpan(engineSpan.name, {
								kind,
								links,
								startTime: engineSpan.start_time,
								attributes: engineSpan.attributes
							}).end(engineSpan.end_time);
							tracer._idGenerator = initialIdGenerator;
						});
					});
				} finally {
					tracer._idGenerator = initialIdGenerator;
				}
			};
		}
	};
	function engineSpanKindToOTELSpanKind(engineSpanKind) {
		switch (engineSpanKind) {
			case "client": return api.SpanKind.CLIENT;
			default: return api.SpanKind.INTERNAL;
		}
	}
	const instrumentPrisma = nodeCore.generateInstrumentOnce(INTEGRATION_NAME, (options) => {
		return new SentryPrismaInteropInstrumentation(options);
	});
	const prismaIntegration = core.defineIntegration((options) => {
		return {
			name: INTEGRATION_NAME,
			setupOnce() {
				instrumentPrisma(options);
			},
			setup(client) {
				if (!getPrismaTracingHelper()) return;
				client.on("spanStart", (span) => {
					const spanJSON = core.spanToJSON(span);
					if (spanJSON.description?.startsWith("prisma:")) span.setAttribute(core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, "auto.db.otel.prisma");
					if ((spanJSON.description === "prisma:engine:db_query" || spanJSON.description === "prisma:client:db_query") && spanJSON.data["db.query.text"]) span.updateName(spanJSON.data["db.query.text"]);
					if (spanJSON.description === "prisma:engine:db_query" && !spanJSON.data["db.system"]) span.setAttribute("db.system", "prisma");
				});
			}
		};
	});
	exports.instrumentPrisma = instrumentPrisma;
	exports.prismaIntegration = prismaIntegration;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/hapi/vendored/enums/AttributeNames.js
var require_AttributeNames$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	var AttributeNames = /* @__PURE__ */ ((AttributeNames2) => {
		AttributeNames2["HAPI_TYPE"] = "hapi.type";
		AttributeNames2["PLUGIN_NAME"] = "hapi.plugin.name";
		AttributeNames2["EXT_TYPE"] = "server.ext.type";
		return AttributeNames2;
	})(AttributeNames || {});
	exports.AttributeNames = AttributeNames;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/hapi/vendored/internal-types.js
var require_internal_types$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const HapiComponentName = "@hapi/hapi";
	const handlerPatched = /* @__PURE__ */ Symbol("hapi-handler-patched");
	const HapiLayerType = {
		ROUTER: "router",
		PLUGIN: "plugin",
		EXT: "server.ext"
	};
	const HapiLifecycleMethodNames = /* @__PURE__ */ new Set([
		"onPreAuth",
		"onCredentials",
		"onPostAuth",
		"onPreHandler",
		"onPostHandler",
		"onPreResponse",
		"onRequest"
	]);
	exports.HapiComponentName = HapiComponentName;
	exports.HapiLayerType = HapiLayerType;
	exports.HapiLifecycleMethodNames = HapiLifecycleMethodNames;
	exports.handlerPatched = handlerPatched;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/hapi/vendored/semconv.js
var require_semconv$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	exports.ATTR_HTTP_METHOD = "http.method";
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/hapi/vendored/utils.js
var require_utils$5 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const semanticConventions = require_src$3();
	const semconv = require_semconv$3();
	const internalTypes = require_internal_types$2();
	const AttributeNames = require_AttributeNames$2();
	function getPluginName(plugin) {
		if (plugin.name) return plugin.name;
		else return plugin.pkg.name;
	}
	const isLifecycleExtType = (variableToCheck) => {
		return typeof variableToCheck === "string" && internalTypes.HapiLifecycleMethodNames.has(variableToCheck);
	};
	const isLifecycleExtEventObj = (variableToCheck) => {
		const event = variableToCheck?.type;
		return event !== void 0 && isLifecycleExtType(event);
	};
	const isDirectExtInput = (variableToCheck) => {
		return Array.isArray(variableToCheck) && variableToCheck.length <= 3 && isLifecycleExtType(variableToCheck[0]) && typeof variableToCheck[1] === "function";
	};
	const isPatchableExtMethod = (variableToCheck) => {
		return !Array.isArray(variableToCheck);
	};
	const getRouteMetadata = (route, pluginName) => {
		const attributes = {
			[semanticConventions.ATTR_HTTP_ROUTE]: route.path,
			[semconv.ATTR_HTTP_METHOD]: route.method
		};
		let name;
		if (pluginName) {
			attributes[AttributeNames.AttributeNames.HAPI_TYPE] = internalTypes.HapiLayerType.PLUGIN;
			attributes[AttributeNames.AttributeNames.PLUGIN_NAME] = pluginName;
			name = `${pluginName}: route - ${route.path}`;
		} else {
			attributes[AttributeNames.AttributeNames.HAPI_TYPE] = internalTypes.HapiLayerType.ROUTER;
			name = `route - ${route.path}`;
		}
		return {
			attributes,
			name
		};
	};
	const getExtMetadata = (extPoint, pluginName, methodName) => {
		let baseName = `ext - ${extPoint}`;
		if (methodName && methodName !== "method") baseName = `ext - ${extPoint} - ${methodName}`;
		if (pluginName) return {
			attributes: {
				[AttributeNames.AttributeNames.EXT_TYPE]: extPoint,
				[AttributeNames.AttributeNames.HAPI_TYPE]: internalTypes.HapiLayerType.EXT,
				[AttributeNames.AttributeNames.PLUGIN_NAME]: pluginName
			},
			name: `${pluginName}: ${baseName}`
		};
		return {
			attributes: {
				[AttributeNames.AttributeNames.EXT_TYPE]: extPoint,
				[AttributeNames.AttributeNames.HAPI_TYPE]: internalTypes.HapiLayerType.EXT
			},
			name: baseName
		};
	};
	const getPluginFromInput = (pluginObj) => {
		if ("plugin" in pluginObj) {
			if ("plugin" in pluginObj.plugin) return pluginObj.plugin.plugin;
			return pluginObj.plugin;
		}
		return pluginObj;
	};
	exports.getExtMetadata = getExtMetadata;
	exports.getPluginFromInput = getPluginFromInput;
	exports.getPluginName = getPluginName;
	exports.getRouteMetadata = getRouteMetadata;
	exports.isDirectExtInput = isDirectExtInput;
	exports.isLifecycleExtEventObj = isLifecycleExtEventObj;
	exports.isLifecycleExtType = isLifecycleExtType;
	exports.isPatchableExtMethod = isPatchableExtMethod;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/hapi/vendored/instrumentation.js
var require_instrumentation$14 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const api = require_src();
	const setHttpServerSpanRouteAttribute = require_setHttpServerSpanRouteAttribute();
	const instrumentation = require_src$1();
	const core = require_cjs$4();
	const AttributeNames = require_AttributeNames$2();
	const internalTypes = require_internal_types$2();
	const utils = require_utils$5();
	const PACKAGE_NAME = "@sentry/instrumentation-hapi";
	var HapiInstrumentation = class extends instrumentation.InstrumentationBase {
		constructor(config = {}) {
			super(PACKAGE_NAME, core.SDK_VERSION, config);
		}
		init() {
			return new instrumentation.InstrumentationNodeModuleDefinition(internalTypes.HapiComponentName, [">=17.0.0 <22"], (module$9) => {
				const moduleExports = module$9[Symbol.toStringTag] === "Module" ? module$9.default : module$9;
				if (!instrumentation.isWrapped(moduleExports.server)) this._wrap(moduleExports, "server", this._getServerPatch.bind(this));
				if (!instrumentation.isWrapped(moduleExports.Server)) this._wrap(moduleExports, "Server", this._getServerPatch.bind(this));
				return moduleExports;
			}, (module$10) => {
				const moduleExports = module$10[Symbol.toStringTag] === "Module" ? module$10.default : module$10;
				this._massUnwrap([moduleExports], ["server", "Server"]);
			});
		}
		/**
		* Patches the Hapi.server and Hapi.Server functions in order to instrument
		* the server.route, server.ext, and server.register functions via calls to the
		* @function _getServerRoutePatch, @function _getServerExtPatch, and
		* @function _getServerRegisterPatch functions
		* @param original - the original Hapi Server creation function
		*/
		_getServerPatch(original) {
			const instrumentation = this;
			const self = this;
			return function server(opts) {
				const newServer = original.apply(this, [opts]);
				self._wrap(newServer, "route", (originalRouter) => {
					return instrumentation._getServerRoutePatch.bind(instrumentation)(originalRouter);
				});
				self._wrap(newServer, "ext", (originalExtHandler) => {
					return instrumentation._getServerExtPatch.bind(instrumentation)(originalExtHandler);
				});
				self._wrap(newServer, "register", instrumentation._getServerRegisterPatch.bind(instrumentation));
				return newServer;
			};
		}
		/**
		* Patches the plugin register function used by the Hapi Server. This function
		* goes through each plugin that is being registered and adds instrumentation
		* via a call to the @function _wrapRegisterHandler function.
		* @param {RegisterFunction<T>} original - the original register function which
		* registers each plugin on the server
		*/
		_getServerRegisterPatch(original) {
			const instrumentation = this;
			return function register(pluginInput, options) {
				if (Array.isArray(pluginInput)) for (const pluginObj of pluginInput) {
					const plugin = utils.getPluginFromInput(pluginObj);
					instrumentation._wrapRegisterHandler(plugin);
				}
				else {
					const plugin = utils.getPluginFromInput(pluginInput);
					instrumentation._wrapRegisterHandler(plugin);
				}
				return original.apply(this, [pluginInput, options]);
			};
		}
		/**
		* Patches the Server.ext function which adds extension methods to the specified
		* point along the request lifecycle. This function accepts the full range of
		* accepted input into the standard Hapi `server.ext` function. For each extension,
		* it adds instrumentation to the handler via a call to the @function _wrapExtMethods
		* function.
		* @param original - the original ext function which adds the extension method to the server
		* @param {string} [pluginName] - if present, represents the name of the plugin responsible
		* for adding this server extension. Else, signifies that the extension was added directly
		*/
		_getServerExtPatch(original, pluginName) {
			const instrumentation = this;
			return function ext(...args) {
				if (Array.isArray(args[0])) {
					const eventsList = args[0];
					for (let i = 0; i < eventsList.length; i++) {
						const eventObj = eventsList[i];
						if (utils.isLifecycleExtType(eventObj.type)) {
							const lifecycleEventObj = eventObj;
							lifecycleEventObj.method = instrumentation._wrapExtMethods(lifecycleEventObj.method, eventObj.type, pluginName);
							eventsList[i] = lifecycleEventObj;
						}
					}
					return original.apply(this, args);
				} else if (utils.isDirectExtInput(args)) {
					const extInput = args;
					const method = extInput[1];
					const handler = instrumentation._wrapExtMethods(method, extInput[0], pluginName);
					return original.apply(this, [
						extInput[0],
						handler,
						extInput[2]
					]);
				} else if (utils.isLifecycleExtEventObj(args[0])) {
					const lifecycleEventObj = args[0];
					lifecycleEventObj.method = instrumentation._wrapExtMethods(lifecycleEventObj.method, lifecycleEventObj.type, pluginName);
					return original.call(this, lifecycleEventObj);
				}
				return original.apply(this, args);
			};
		}
		/**
		* Patches the Server.route function. This function accepts either one or an array
		* of Hapi.ServerRoute objects and adds instrumentation on each route via a call to
		* the @function _wrapRouteHandler function.
		* @param {HapiServerRouteInputMethod} original - the original route function which adds
		* the route to the server
		* @param {string} [pluginName] - if present, represents the name of the plugin responsible
		* for adding this server route. Else, signifies that the route was added directly
		*/
		_getServerRoutePatch(original, pluginName) {
			const instrumentation = this;
			return function route(route) {
				if (Array.isArray(route)) for (let i = 0; i < route.length; i++) {
					const newRoute = instrumentation._wrapRouteHandler.call(instrumentation, route[i], pluginName);
					route[i] = newRoute;
				}
				else route = instrumentation._wrapRouteHandler.call(instrumentation, route, pluginName);
				return original.apply(this, [route]);
			};
		}
		/**
		* Wraps newly registered plugins to add instrumentation to the plugin's clone of
		* the original server. Specifically, wraps the server.route and server.ext functions
		* via calls to @function _getServerRoutePatch and @function _getServerExtPatch
		* @param {Hapi.Plugin<T>} plugin - the new plugin which is being instrumented
		*/
		_wrapRegisterHandler(plugin) {
			const instrumentation = this;
			const pluginName = utils.getPluginName(plugin);
			const oldRegister = plugin.register;
			const self = this;
			const newRegisterHandler = function(server, options) {
				self._wrap(server, "route", (original) => {
					return instrumentation._getServerRoutePatch.bind(instrumentation)(original, pluginName);
				});
				self._wrap(server, "ext", (originalExtHandler) => {
					return instrumentation._getServerExtPatch.bind(instrumentation)(originalExtHandler, pluginName);
				});
				return oldRegister.call(this, server, options);
			};
			plugin.register = newRegisterHandler;
		}
		/**
		* Wraps request extension methods to add instrumentation to each new extension handler.
		* Patches each individual extension in order to create the
		* span and propagate context. It does not create spans when there is no parent span.
		* @param {PatchableExtMethod | PatchableExtMethod[]} method - the request extension
		* handler which is being instrumented
		* @param {Hapi.ServerRequestExtType} extPoint - the point in the Hapi request lifecycle
		* which this extension targets
		* @param {string} [pluginName] - if present, represents the name of the plugin responsible
		* for adding this server route. Else, signifies that the route was added directly
		*/
		_wrapExtMethods(method, extPoint, pluginName) {
			const instrumentation = this;
			if (method instanceof Array) {
				for (let i = 0; i < method.length; i++) method[i] = instrumentation._wrapExtMethods(method[i], extPoint);
				return method;
			} else if (utils.isPatchableExtMethod(method)) {
				if (method[internalTypes.handlerPatched] === true) return method;
				method[internalTypes.handlerPatched] = true;
				const newHandler = function(...params) {
					if (api.trace.getSpan(api.context.active()) === void 0) return method.apply(this, params);
					const metadata = utils.getExtMetadata(extPoint, pluginName, method.name);
					return core.startSpan({
						name: metadata.name,
						op: `${metadata.attributes[AttributeNames.AttributeNames.HAPI_TYPE]}.hapi`,
						attributes: {
							...metadata.attributes,
							[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.otel.hapi"
						}
					}, () => method.apply(void 0, params));
				};
				return newHandler;
			}
			return method;
		}
		/**
		* Patches each individual route handler method in order to create the
		* span and propagate context. It does not create spans when there is no parent span.
		* @param {PatchableServerRoute} route - the route handler which is being instrumented
		* @param {string} [pluginName] - if present, represents the name of the plugin responsible
		* for adding this server route. Else, signifies that the route was added directly
		*/
		_wrapRouteHandler(route, pluginName) {
			if (route[internalTypes.handlerPatched] === true) return route;
			route[internalTypes.handlerPatched] = true;
			const wrapHandler = (oldHandler) => {
				return function(...params) {
					if (api.trace.getSpan(api.context.active()) === void 0) return oldHandler.call(this, ...params);
					setHttpServerSpanRouteAttribute.setHttpServerSpanRouteAttribute(route.path);
					const metadata = utils.getRouteMetadata(route, pluginName);
					return core.startSpan({
						name: metadata.name,
						op: `${metadata.attributes[AttributeNames.AttributeNames.HAPI_TYPE]}.hapi`,
						attributes: {
							...metadata.attributes,
							[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.otel.hapi"
						}
					}, () => oldHandler.call(this, ...params));
				};
			};
			if (typeof route.handler === "function") route.handler = wrapHandler(route.handler);
			else if (typeof route.options === "function") {
				const oldOptions = route.options;
				route.options = function(server) {
					const options = oldOptions(server);
					if (typeof options.handler === "function") options.handler = wrapHandler(options.handler);
					return options;
				};
			} else if (typeof route.options?.handler === "function") route.options.handler = wrapHandler(route.options.handler);
			return route;
		}
	};
	exports.HapiInstrumentation = HapiInstrumentation;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/hapi/index.js
var require_hapi = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const instrumentation = require_instrumentation$14();
	const core = require_cjs$4();
	const nodeCore = require_cjs$2();
	const debugBuild = require_debug_build$2();
	const INTEGRATION_NAME = "Hapi";
	const instrumentHapi = nodeCore.generateInstrumentOnce(INTEGRATION_NAME, () => new instrumentation.HapiInstrumentation());
	const _hapiIntegration = (() => {
		return {
			name: INTEGRATION_NAME,
			setupOnce() {
				instrumentHapi();
			}
		};
	});
	const hapiIntegration = core.defineIntegration(_hapiIntegration);
	function isErrorEvent(event) {
		return !!(event && typeof event === "object" && "error" in event && event.error);
	}
	function sendErrorToSentry(errorData) {
		core.captureException(errorData, { mechanism: {
			type: "auto.function.hapi",
			handled: false
		} });
	}
	const hapiErrorPlugin = {
		name: "SentryHapiErrorPlugin",
		version: core.SDK_VERSION,
		register: async function(serverArg) {
			serverArg.events.on({
				name: "request",
				channels: ["error"]
			}, (request, event) => {
				if (core.getIsolationScope() !== core.getDefaultIsolationScope()) {
					const route = request.route;
					if (route.path) core.getIsolationScope().setTransactionName(`${route.method.toUpperCase()} ${route.path}`);
				} else debugBuild.DEBUG_BUILD && core.debug.warn("Isolation scope is still the default isolation scope - skipping setting transactionName");
				if (isErrorEvent(event)) sendErrorToSentry(event.error);
			});
		}
	};
	async function setupHapiErrorHandler(server) {
		await server.register(hapiErrorPlugin);
		nodeCore.ensureIsWrapped(server.register, "hapi");
	}
	exports.hapiErrorPlugin = hapiErrorPlugin;
	exports.hapiIntegration = hapiIntegration;
	exports.instrumentHapi = instrumentHapi;
	exports.setupHapiErrorHandler = setupHapiErrorHandler;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/hono/constants.js
var require_constants$4 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const AttributeNames = {
		HONO_TYPE: "hono.type",
		HONO_NAME: "hono.name"
	};
	const HonoTypes = {
		MIDDLEWARE: "middleware",
		REQUEST_HANDLER: "request_handler"
	};
	exports.AttributeNames = AttributeNames;
	exports.HonoTypes = HonoTypes;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/hono/instrumentation.js
var require_instrumentation$13 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const api = require_src();
	const instrumentation = require_src$1();
	const core = require_cjs$4();
	const constants = require_constants$4();
	const PACKAGE_NAME = "@sentry/instrumentation-hono";
	const PACKAGE_VERSION = "0.0.1";
	var HonoInstrumentation = class extends instrumentation.InstrumentationBase {
		constructor(config = {}) {
			super(PACKAGE_NAME, PACKAGE_VERSION, config);
		}
		/**
		* Initialize the instrumentation.
		*/
		init() {
			return [new instrumentation.InstrumentationNodeModuleDefinition("hono", [">=4.0.0 <5"], (moduleExports) => this._patch(moduleExports))];
		}
		/**
		* Patches the module exports to instrument Hono.
		*/
		_patch(moduleExports) {
			const instrumentation = this;
			class WrappedHono extends moduleExports.Hono {
				constructor(...args) {
					super(...args);
					instrumentation._wrap(this, "get", instrumentation._patchHandler());
					instrumentation._wrap(this, "post", instrumentation._patchHandler());
					instrumentation._wrap(this, "put", instrumentation._patchHandler());
					instrumentation._wrap(this, "delete", instrumentation._patchHandler());
					instrumentation._wrap(this, "options", instrumentation._patchHandler());
					instrumentation._wrap(this, "patch", instrumentation._patchHandler());
					instrumentation._wrap(this, "all", instrumentation._patchHandler());
					instrumentation._wrap(this, "on", instrumentation._patchOnHandler());
					instrumentation._wrap(this, "use", instrumentation._patchMiddlewareHandler());
				}
			}
			try {
				moduleExports.Hono = WrappedHono;
			} catch {
				return {
					...moduleExports,
					Hono: WrappedHono
				};
			}
			return moduleExports;
		}
		/**
		* Patches the route handler to instrument it.
		*/
		_patchHandler() {
			const instrumentation = this;
			return function(original) {
				return function wrappedHandler(...args) {
					if (typeof args[0] === "string") {
						const path = args[0];
						if (args.length === 1) return original.apply(this, [path]);
						const handlers = args.slice(1);
						return original.apply(this, [path, ...handlers.map((handler) => instrumentation._wrapHandler(handler))]);
					}
					return original.apply(this, args.map((handler) => instrumentation._wrapHandler(handler)));
				};
			};
		}
		/**
		* Patches the 'on' handler to instrument it.
		*/
		_patchOnHandler() {
			const instrumentation = this;
			return function(original) {
				return function wrappedHandler(...args) {
					const handlers = args.slice(2);
					return original.apply(this, [...args.slice(0, 2), ...handlers.map((handler) => instrumentation._wrapHandler(handler))]);
				};
			};
		}
		/**
		* Patches the middleware handler to instrument it.
		*/
		_patchMiddlewareHandler() {
			const instrumentation = this;
			return function(original) {
				return function wrappedHandler(...args) {
					if (typeof args[0] === "string") {
						const path = args[0];
						if (args.length === 1) return original.apply(this, [path]);
						const handlers = args.slice(1);
						return original.apply(this, [path, ...handlers.map((handler) => instrumentation._wrapHandler(handler))]);
					}
					return original.apply(this, args.map((handler) => instrumentation._wrapHandler(handler)));
				};
			};
		}
		/**
		* Wraps a handler or middleware handler to apply instrumentation.
		*/
		_wrapHandler(handler) {
			const instrumentation = this;
			return function(c, next) {
				if (!instrumentation.isEnabled()) return handler.apply(this, [c, next]);
				const path = c.req.path;
				const span = instrumentation.tracer.startSpan(path);
				return api.context.with(api.trace.setSpan(api.context.active(), span), () => {
					return instrumentation._safeExecute(() => {
						const result = handler.apply(this, [c, next]);
						if (core.isThenable(result)) return result.then((result2) => {
							const type = instrumentation._determineHandlerType(result2);
							span.setAttributes({
								[constants.AttributeNames.HONO_TYPE]: type,
								[constants.AttributeNames.HONO_NAME]: type === constants.HonoTypes.REQUEST_HANDLER ? path : handler.name || "anonymous"
							});
							instrumentation.getConfig().responseHook?.(span);
							return result2;
						});
						else {
							const type = instrumentation._determineHandlerType(result);
							span.setAttributes({
								[constants.AttributeNames.HONO_TYPE]: type,
								[constants.AttributeNames.HONO_NAME]: type === constants.HonoTypes.REQUEST_HANDLER ? path : handler.name || "anonymous"
							});
							instrumentation.getConfig().responseHook?.(span);
							return result;
						}
					}, () => span.end(), (error) => {
						instrumentation._handleError(span, error);
						span.end();
					});
				});
			};
		}
		/**
		* Safely executes a function and handles errors.
		*/
		_safeExecute(execute, onSuccess, onFailure) {
			try {
				const result = execute();
				if (core.isThenable(result)) result.then(() => onSuccess(), (error) => onFailure(error));
				else onSuccess();
				return result;
			} catch (error) {
				onFailure(error);
				throw error;
			}
		}
		/**
		* Determines the handler type based on the result.
		* @param result
		* @private
		*/
		_determineHandlerType(result) {
			return result === void 0 ? constants.HonoTypes.MIDDLEWARE : constants.HonoTypes.REQUEST_HANDLER;
		}
		/**
		* Handles errors by setting the span status and recording the exception.
		*/
		_handleError(span, error) {
			if (error instanceof Error) {
				span.setStatus({
					code: api.SpanStatusCode.ERROR,
					message: error.message
				});
				span.recordException(error);
			}
		}
	};
	exports.HonoInstrumentation = HonoInstrumentation;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/hono/index.js
var require_hono = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const semanticConventions = require_src$3();
	const core = require_cjs$4();
	const nodeCore = require_cjs$2();
	const debugBuild = require_debug_build$2();
	const constants = require_constants$4();
	const instrumentation = require_instrumentation$13();
	const INTEGRATION_NAME = "Hono";
	function addHonoSpanAttributes(span) {
		const attributes = core.spanToJSON(span).data;
		const type = attributes[constants.AttributeNames.HONO_TYPE];
		if (attributes[core.SEMANTIC_ATTRIBUTE_SENTRY_OP] || !type) return;
		span.setAttributes({
			[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.otel.hono",
			[core.SEMANTIC_ATTRIBUTE_SENTRY_OP]: `${type}.hono`
		});
		const name = attributes[constants.AttributeNames.HONO_NAME];
		if (typeof name === "string") span.updateName(name);
		if (core.getIsolationScope() === core.getDefaultIsolationScope()) {
			debugBuild.DEBUG_BUILD && core.debug.warn("Isolation scope is default isolation scope - skipping setting transactionName");
			return;
		}
		const route = attributes[semanticConventions.ATTR_HTTP_ROUTE];
		const method = attributes[semanticConventions.ATTR_HTTP_REQUEST_METHOD];
		if (typeof route === "string" && typeof method === "string") core.getIsolationScope().setTransactionName(`${method} ${route}`);
	}
	const instrumentHono = nodeCore.generateInstrumentOnce(INTEGRATION_NAME, () => new instrumentation.HonoInstrumentation({ responseHook: (span) => {
		addHonoSpanAttributes(span);
	} }));
	const _honoIntegration = (() => {
		return {
			name: INTEGRATION_NAME,
			setupOnce() {
				instrumentHono();
			}
		};
	});
	const honoIntegration = core.defineIntegration(_honoIntegration);
	function honoRequestHandler() {
		return async function sentryRequestMiddleware(context, next) {
			const normalizedRequest = core.httpRequestToRequestData(context.req);
			core.getIsolationScope().setSDKProcessingMetadata({ normalizedRequest });
			await next();
		};
	}
	function defaultShouldHandleError(context) {
		return context.res.status >= 500;
	}
	function honoErrorHandler(options) {
		return async function sentryErrorMiddleware(context, next) {
			await next();
			if ((options?.shouldHandleError || defaultShouldHandleError)(context)) context.res.sentry = core.captureException(context.error, { mechanism: {
				type: "auto.middleware.hono",
				handled: false
			} });
		};
	}
	function setupHonoErrorHandler(app, options) {
		app.use(honoRequestHandler());
		app.use(honoErrorHandler(options));
		nodeCore.ensureIsWrapped(app.use, "hono");
	}
	exports.honoIntegration = honoIntegration;
	exports.instrumentHono = instrumentHono;
	exports.setupHonoErrorHandler = setupHonoErrorHandler;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/koa/vendored/types.js
var require_types$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	var KoaLayerType = /* @__PURE__ */ ((KoaLayerType2) => {
		KoaLayerType2["ROUTER"] = "router";
		KoaLayerType2["MIDDLEWARE"] = "middleware";
		return KoaLayerType2;
	})(KoaLayerType || {});
	exports.KoaLayerType = KoaLayerType;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/koa/vendored/enums/AttributeNames.js
var require_AttributeNames$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	var AttributeNames = /* @__PURE__ */ ((AttributeNames2) => {
		AttributeNames2["KOA_TYPE"] = "koa.type";
		AttributeNames2["KOA_NAME"] = "koa.name";
		return AttributeNames2;
	})(AttributeNames || {});
	exports.AttributeNames = AttributeNames;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/koa/vendored/utils.js
var require_utils$4 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const types = require_types$1();
	const AttributeNames = require_AttributeNames$1();
	const semanticConventions = require_src$3();
	const getMiddlewareMetadata = (context, layer, isRouter, layerPath) => {
		if (isRouter) return {
			attributes: {
				[AttributeNames.AttributeNames.KOA_NAME]: layerPath?.toString(),
				[AttributeNames.AttributeNames.KOA_TYPE]: types.KoaLayerType.ROUTER,
				[semanticConventions.ATTR_HTTP_ROUTE]: layerPath?.toString()
			},
			name: context._matchedRouteName || `router - ${layerPath}`
		};
		else return {
			attributes: {
				[AttributeNames.AttributeNames.KOA_NAME]: layer.name ?? "middleware",
				[AttributeNames.AttributeNames.KOA_TYPE]: types.KoaLayerType.MIDDLEWARE
			},
			name: `middleware - ${layer.name}`
		};
	};
	const isLayerIgnored = (type, config) => {
		return !!(Array.isArray(config?.ignoreLayersType) && config?.ignoreLayersType?.includes(type));
	};
	exports.getMiddlewareMetadata = getMiddlewareMetadata;
	exports.isLayerIgnored = isLayerIgnored;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/koa/vendored/internal-types.js
var require_internal_types$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	exports.kLayerPatched = /* @__PURE__ */ Symbol("koa-layer-patched");
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/koa/vendored/instrumentation.js
var require_instrumentation$12 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const api = require_src();
	const instrumentation = require_src$1();
	const types = require_types$1();
	const core = require_cjs$4();
	const semanticConventions = require_src$3();
	const utils = require_utils$4();
	const setHttpServerSpanRouteAttribute = require_setHttpServerSpanRouteAttribute();
	const debugBuild = require_debug_build$2();
	const AttributeNames = require_AttributeNames$1();
	const internalTypes = require_internal_types$1();
	const PACKAGE_NAME = "@sentry/instrumentation-koa";
	var KoaInstrumentation = class extends instrumentation.InstrumentationBase {
		constructor(config = {}) {
			super(PACKAGE_NAME, core.SDK_VERSION, config);
		}
		init() {
			return new instrumentation.InstrumentationNodeModuleDefinition("koa", [">=2.0.0 <4"], (module$7) => {
				const moduleExports = module$7[Symbol.toStringTag] === "Module" ? module$7.default : module$7;
				if (moduleExports == null) return moduleExports;
				if (instrumentation.isWrapped(moduleExports.prototype.use)) this._unwrap(moduleExports.prototype, "use");
				this._wrap(moduleExports.prototype, "use", this._getKoaUsePatch.bind(this));
				return module$7;
			}, (module$8) => {
				const moduleExports = module$8[Symbol.toStringTag] === "Module" ? module$8.default : module$8;
				if (moduleExports && instrumentation.isWrapped(moduleExports.prototype.use)) this._unwrap(moduleExports.prototype, "use");
			});
		}
		/**
		* Patches the Koa.use function in order to instrument each original
		* middleware layer which is introduced
		* @param {KoaMiddleware} middleware - the original middleware function
		*/
		_getKoaUsePatch(original) {
			const patchRouterDispatch = this._patchRouterDispatch.bind(this);
			const patchLayer = this._patchLayer.bind(this);
			return function use(middlewareFunction) {
				const patchedFunction = middlewareFunction.router ? patchRouterDispatch(middlewareFunction) : patchLayer(middlewareFunction, false);
				return original.apply(this, [patchedFunction]);
			};
		}
		/**
		* Patches the dispatch function used by @koa/router. This function
		* goes through each routed middleware and adds instrumentation via a call
		* to the @function _patchLayer function.
		* @param {KoaMiddleware} dispatchLayer - the original dispatch function which dispatches
		* routed middleware
		*/
		_patchRouterDispatch(dispatchLayer) {
			const routesStack = dispatchLayer.router?.stack ?? [];
			for (const pathLayer of routesStack) {
				const path = pathLayer.path;
				const pathStack = pathLayer.stack;
				for (let j = 0; j < pathStack.length; j++) {
					const routedMiddleware = pathStack[j];
					pathStack[j] = this._patchLayer(routedMiddleware, true, path);
				}
			}
			return dispatchLayer;
		}
		/**
		* Patches each individual @param middlewareLayer function in order to create the
		* span and propagate context. It does not create spans when there is no parent span.
		* @param {KoaMiddleware} middlewareLayer - the original middleware function.
		* @param {boolean} isRouter - tracks whether the original middleware function
		* was dispatched by the router originally
		* @param {string?} layerPath - if present, provides additional data from the
		* router about the routed path which the middleware is attached to
		*/
		_patchLayer(middlewareLayer, isRouter, layerPath) {
			const layerType = isRouter ? types.KoaLayerType.ROUTER : types.KoaLayerType.MIDDLEWARE;
			if (middlewareLayer[internalTypes.kLayerPatched] === true || utils.isLayerIgnored(layerType, this.getConfig())) return middlewareLayer;
			if (middlewareLayer.constructor.name === "GeneratorFunction" || middlewareLayer.constructor.name === "AsyncGeneratorFunction") return middlewareLayer;
			middlewareLayer[internalTypes.kLayerPatched] = true;
			return (context, next) => {
				if (api.trace.getSpan(api.context.active()) === void 0) return middlewareLayer(context, next);
				const metadata = utils.getMiddlewareMetadata(context, middlewareLayer, isRouter, layerPath);
				if (context._matchedRoute) setHttpServerSpanRouteAttribute.setHttpServerSpanRouteAttribute(context._matchedRoute.toString());
				const koaName = metadata.attributes[AttributeNames.AttributeNames.KOA_NAME];
				const name = typeof koaName === "string" ? koaName || "< unknown >" : metadata.name;
				return core.startSpan({
					name,
					op: `${layerType}.koa`,
					attributes: {
						...metadata.attributes,
						[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.otel.koa"
					}
				}, () => {
					const route = metadata.attributes[semanticConventions.ATTR_HTTP_ROUTE];
					if (core.getIsolationScope() === core.getDefaultIsolationScope()) debugBuild.DEBUG_BUILD && core.debug.warn("Isolation scope is default isolation scope - skipping setting transactionName");
					else if (route) {
						const method = context.request?.method?.toUpperCase() || "GET";
						core.getIsolationScope().setTransactionName(`${method} ${route}`);
					}
					return middlewareLayer(context, next);
				});
			};
		}
	};
	exports.KoaInstrumentation = KoaInstrumentation;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/koa/index.js
var require_koa = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const instrumentation = require_instrumentation$12();
	const core = require_cjs$4();
	const nodeCore = require_cjs$2();
	const INTEGRATION_NAME = "Koa";
	const instrumentKoa = nodeCore.generateInstrumentOnce(INTEGRATION_NAME, instrumentation.KoaInstrumentation, (options = {}) => {
		return { ignoreLayersType: options.ignoreLayersType };
	});
	const _koaIntegration = ((options = {}) => {
		return {
			name: INTEGRATION_NAME,
			setupOnce() {
				instrumentKoa(options);
			}
		};
	});
	const koaIntegration = core.defineIntegration(_koaIntegration);
	const setupKoaErrorHandler = (app) => {
		app.use(async (ctx, next) => {
			try {
				await next();
			} catch (error) {
				core.captureException(error, { mechanism: {
					handled: false,
					type: "auto.middleware.koa"
				} });
				throw error;
			}
		});
		nodeCore.ensureIsWrapped(app.use, "koa");
	};
	exports.instrumentKoa = instrumentKoa;
	exports.koaIntegration = koaIntegration;
	exports.setupKoaErrorHandler = setupKoaErrorHandler;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/connect/vendored/enums/AttributeNames.js
var require_AttributeNames = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	var AttributeNames = /* @__PURE__ */ ((AttributeNames2) => {
		AttributeNames2["CONNECT_TYPE"] = "connect.type";
		AttributeNames2["CONNECT_NAME"] = "connect.name";
		return AttributeNames2;
	})(AttributeNames || {});
	var ConnectTypes = /* @__PURE__ */ ((ConnectTypes2) => {
		ConnectTypes2["MIDDLEWARE"] = "middleware";
		ConnectTypes2["REQUEST_HANDLER"] = "request_handler";
		return ConnectTypes2;
	})(ConnectTypes || {});
	exports.AttributeNames = AttributeNames;
	exports.ConnectTypes = ConnectTypes;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/connect/vendored/internal-types.js
var require_internal_types = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	exports._LAYERS_STORE_PROPERTY = /* @__PURE__ */ Symbol("opentelemetry.instrumentation-connect.request-route-stack");
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/connect/vendored/utils.js
var require_utils$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const internalTypes = require_internal_types();
	const debugBuild = require_debug_build$2();
	const addNewStackLayer = (request) => {
		if (Array.isArray(request[internalTypes._LAYERS_STORE_PROPERTY]) === false) Object.defineProperty(request, internalTypes._LAYERS_STORE_PROPERTY, {
			enumerable: false,
			value: []
		});
		request[internalTypes._LAYERS_STORE_PROPERTY].push("/");
		const stackLength = request[internalTypes._LAYERS_STORE_PROPERTY].length;
		return () => {
			if (stackLength === request[internalTypes._LAYERS_STORE_PROPERTY].length) request[internalTypes._LAYERS_STORE_PROPERTY].pop();
			else debugBuild.DEBUG_BUILD && core.debug.warn("Connect: Trying to pop the stack multiple time");
		};
	};
	const replaceCurrentStackRoute = (request, newRoute) => {
		if (newRoute) request[internalTypes._LAYERS_STORE_PROPERTY].splice(-1, 1, newRoute);
	};
	const generateRoute = (request) => {
		return request[internalTypes._LAYERS_STORE_PROPERTY].reduce((acc, sub) => acc.replace(/\/+$/, "") + sub);
	};
	exports.addNewStackLayer = addNewStackLayer;
	exports.generateRoute = generateRoute;
	exports.replaceCurrentStackRoute = replaceCurrentStackRoute;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/connect/vendored/instrumentation.js
var require_instrumentation$11 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const AttributeNames = require_AttributeNames();
	const core = require_cjs$4();
	const setHttpServerSpanRouteAttribute = require_setHttpServerSpanRouteAttribute();
	const instrumentation = require_src$1();
	const semanticConventions = require_src$3();
	const utils = require_utils$3();
	const PACKAGE_NAME = "@sentry/instrumentation-connect";
	const ANONYMOUS_NAME = "anonymous";
	var ConnectInstrumentation = class extends instrumentation.InstrumentationBase {
		constructor(config = {}) {
			super(PACKAGE_NAME, core.SDK_VERSION, config);
		}
		init() {
			return [new instrumentation.InstrumentationNodeModuleDefinition("connect", [">=3.0.0 <4"], (moduleExports) => {
				return this._patchConstructor(moduleExports);
			})];
		}
		_patchApp(patchedApp) {
			if (!instrumentation.isWrapped(patchedApp.use)) this._wrap(patchedApp, "use", this._patchUse.bind(this));
			if (!instrumentation.isWrapped(patchedApp.handle)) this._wrap(patchedApp, "handle", this._patchHandle.bind(this));
		}
		_patchConstructor(original) {
			const patchApp = this._patchApp.bind(this);
			return function(...args) {
				const app = Reflect.apply(original, this, args);
				patchApp(app);
				return app;
			};
		}
		_patchNext(next, span, finishSpan) {
			return function nextFunction(err) {
				if (core.isError(err)) span.setStatus({
					code: core.SPAN_STATUS_ERROR,
					message: "internal_error"
				});
				const result = next.apply(this, [err]);
				finishSpan();
				return result;
			};
		}
		_startSpan(routeName, middleWare) {
			const connectType = routeName ? AttributeNames.ConnectTypes.REQUEST_HANDLER : AttributeNames.ConnectTypes.MIDDLEWARE;
			const connectName = routeName || middleWare.name || ANONYMOUS_NAME;
			return core.startInactiveSpan({
				name: connectName,
				op: `${connectType}.connect`,
				attributes: {
					[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.otel.connect",
					[semanticConventions.ATTR_HTTP_ROUTE]: routeName.length > 0 ? routeName : "/",
					[AttributeNames.AttributeNames.CONNECT_TYPE]: connectType,
					[AttributeNames.AttributeNames.CONNECT_NAME]: connectName
				}
			});
		}
		_patchMiddleware(routeName, middleWare) {
			const isEnabled = this.isEnabled.bind(this);
			const startSpan = this._startSpan.bind(this);
			const patchNext = this._patchNext.bind(this);
			const isErrorMiddleware = middleWare.length === 4;
			function patchedMiddleware() {
				if (!isEnabled()) return Reflect.apply(middleWare, this, arguments);
				const [reqArgIdx, resArgIdx, nextArgIdx] = isErrorMiddleware ? [
					1,
					2,
					3
				] : [
					0,
					1,
					2
				];
				const req = arguments[reqArgIdx];
				const res = arguments[resArgIdx];
				const next = arguments[nextArgIdx];
				utils.replaceCurrentStackRoute(req, routeName);
				if (routeName) setHttpServerSpanRouteAttribute.setHttpServerSpanRouteAttribute(utils.generateRoute(req));
				const span = startSpan(routeName, middleWare);
				let spanFinished = false;
				function finishSpan() {
					if (!spanFinished) {
						spanFinished = true;
						span.end();
					}
					res.removeListener("close", finishSpan);
				}
				res.addListener("close", finishSpan);
				arguments[nextArgIdx] = patchNext(next, span, finishSpan);
				try {
					return Reflect.apply(middleWare, this, arguments);
				} catch (e) {
					span.setStatus({
						code: core.SPAN_STATUS_ERROR,
						message: "internal_error"
					});
					finishSpan();
					throw e;
				}
			}
			Object.defineProperty(patchedMiddleware, "length", {
				value: middleWare.length,
				writable: false,
				configurable: true
			});
			return patchedMiddleware;
		}
		_patchUse(original) {
			const patchMiddleware = this._patchMiddleware.bind(this);
			return function(...args) {
				const middleWare = args[args.length - 1];
				const routeName = args[args.length - 2] || "";
				args[args.length - 1] = patchMiddleware(routeName, middleWare);
				return original.apply(this, args);
			};
		}
		_patchHandle(original) {
			const patchOut = this._patchOut.bind(this);
			return function() {
				const [reqIdx, outIdx] = [0, 2];
				const req = arguments[reqIdx];
				const out = arguments[outIdx];
				const completeStack = utils.addNewStackLayer(req);
				if (typeof out === "function") arguments[outIdx] = patchOut(out, completeStack);
				return Reflect.apply(original, this, arguments);
			};
		}
		_patchOut(out, completeStack) {
			return function nextFunction(...args) {
				completeStack();
				return Reflect.apply(out, this, args);
			};
		}
	};
	exports.ConnectInstrumentation = ConnectInstrumentation;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/connect/index.js
var require_connect = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const instrumentation = require_instrumentation$11();
	const core = require_cjs$4();
	const nodeCore = require_cjs$2();
	const INTEGRATION_NAME = "Connect";
	const instrumentConnect = nodeCore.generateInstrumentOnce(INTEGRATION_NAME, () => new instrumentation.ConnectInstrumentation());
	const _connectIntegration = (() => {
		return {
			name: INTEGRATION_NAME,
			setupOnce() {
				instrumentConnect();
			}
		};
	});
	const connectIntegration = core.defineIntegration(_connectIntegration);
	function connectErrorMiddleware(err, req, res, next) {
		core.captureException(err, { mechanism: {
			handled: false,
			type: "auto.middleware.connect"
		} });
		next(err);
	}
	const setupConnectErrorHandler = (app) => {
		app.use(connectErrorMiddleware);
		nodeCore.ensureIsWrapped(app.use, "connect");
	};
	exports.connectIntegration = connectIntegration;
	exports.instrumentConnect = instrumentConnect;
	exports.setupConnectErrorHandler = setupConnectErrorHandler;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/knex/vendored/semconv.js
var require_semconv$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const ATTR_DB_NAME = "db.name";
	const ATTR_DB_OPERATION = "db.operation";
	const ATTR_DB_SQL_TABLE = "db.sql.table";
	const ATTR_DB_STATEMENT = "db.statement";
	const ATTR_DB_SYSTEM = "db.system";
	const ATTR_DB_USER = "db.user";
	const ATTR_NET_PEER_NAME = "net.peer.name";
	const ATTR_NET_PEER_PORT = "net.peer.port";
	const ATTR_NET_TRANSPORT = "net.transport";
	const DB_SYSTEM_NAME_VALUE_SQLITE = "sqlite";
	const DB_SYSTEM_NAME_VALUE_POSTGRESQL = "postgresql";
	exports.ATTR_DB_NAME = ATTR_DB_NAME;
	exports.ATTR_DB_OPERATION = ATTR_DB_OPERATION;
	exports.ATTR_DB_SQL_TABLE = ATTR_DB_SQL_TABLE;
	exports.ATTR_DB_STATEMENT = ATTR_DB_STATEMENT;
	exports.ATTR_DB_SYSTEM = ATTR_DB_SYSTEM;
	exports.ATTR_DB_USER = ATTR_DB_USER;
	exports.ATTR_NET_PEER_NAME = ATTR_NET_PEER_NAME;
	exports.ATTR_NET_PEER_PORT = ATTR_NET_PEER_PORT;
	exports.ATTR_NET_TRANSPORT = ATTR_NET_TRANSPORT;
	exports.DB_SYSTEM_NAME_VALUE_POSTGRESQL = DB_SYSTEM_NAME_VALUE_POSTGRESQL;
	exports.DB_SYSTEM_NAME_VALUE_SQLITE = DB_SYSTEM_NAME_VALUE_SQLITE;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/knex/vendored/utils.js
var require_utils$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const semconv = require_semconv$2();
	const getFormatter = (runner) => {
		if (runner) {
			if (runner.client) {
				if (runner.client._formatQuery) return runner.client._formatQuery.bind(runner.client);
				else if (runner.client.SqlString) return runner.client.SqlString.format.bind(runner.client.SqlString);
			}
			if (runner.builder) return runner.builder.toString.bind(runner.builder);
		}
		return () => "<noop formatter>";
	};
	const systemMap = /* @__PURE__ */ new Map([["sqlite3", semconv.DB_SYSTEM_NAME_VALUE_SQLITE], ["pg", semconv.DB_SYSTEM_NAME_VALUE_POSTGRESQL]]);
	const mapSystem = (knexSystem) => {
		return systemMap.get(knexSystem) || knexSystem;
	};
	const getName = (db, operation, table) => {
		if (operation) {
			if (table) return `${operation} ${db}.${table}`;
			return `${operation} ${db}`;
		}
		return db;
	};
	const limitLength = (str, maxLength) => {
		if (typeof str === "string" && typeof maxLength === "number" && 0 < maxLength && maxLength < str.length) return `${str.substring(0, maxLength)}..`;
		return str;
	};
	const extractDatabaseFromConnectionString = (connectionString) => {
		if (!connectionString) return void 0;
		try {
			return new URL(connectionString).pathname?.replace(/^\//, "") || void 0;
		} catch {
			return;
		}
	};
	const extractHostFromConnectionString = (connectionString) => {
		if (!connectionString) return void 0;
		try {
			return new URL(connectionString).hostname || void 0;
		} catch {
			return;
		}
	};
	const extractPortFromConnectionString = (connectionString) => {
		if (!connectionString) return void 0;
		try {
			const port = new URL(connectionString).port;
			return port ? parseInt(port, 10) : void 0;
		} catch {
			return;
		}
	};
	const extractTableName = (builder) => {
		const table = builder?._single?.table;
		if (typeof table === "object") return extractTableName(table);
		return table;
	};
	exports.extractDatabaseFromConnectionString = extractDatabaseFromConnectionString;
	exports.extractHostFromConnectionString = extractHostFromConnectionString;
	exports.extractPortFromConnectionString = extractPortFromConnectionString;
	exports.extractTableName = extractTableName;
	exports.getFormatter = getFormatter;
	exports.getName = getName;
	exports.limitLength = limitLength;
	exports.mapSystem = mapSystem;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/knex/vendored/instrumentation.js
var require_instrumentation$10 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const instrumentation = require_src$1();
	const core = require_cjs$4();
	const InstrumentationNodeModuleFile = require_InstrumentationNodeModuleFile();
	const semconv = require_semconv$2();
	const utils = require_utils$2();
	const PACKAGE_NAME = "@sentry/instrumentation-knex";
	const ORIGIN = "auto.db.otel.knex";
	const MODULE_NAME = "knex";
	const SUPPORTED_VERSIONS = [
		">=0.22.0 <4",
		">=0.10.0 <0.18.0",
		">=0.19.0 <0.22.0",
		">=0.18.0 <0.19.0"
	];
	const MAX_QUERY_LENGTH = 1022;
	const parentSpanSymbol = /* @__PURE__ */ Symbol("sentry.instrumentation-knex.parent-span");
	var KnexInstrumentation = class extends instrumentation.InstrumentationBase {
		constructor(config = {}) {
			super(PACKAGE_NAME, core.SDK_VERSION, config);
		}
		init() {
			const module$6 = new instrumentation.InstrumentationNodeModuleDefinition(MODULE_NAME, SUPPORTED_VERSIONS);
			module$6.files.push(this._getClientNodeModuleFileInstrumentation("src"), this._getClientNodeModuleFileInstrumentation("lib"), this._getRunnerNodeModuleFileInstrumentation("src"), this._getRunnerNodeModuleFileInstrumentation("lib"), this._getRunnerNodeModuleFileInstrumentation("lib/execution"));
			return module$6;
		}
		_getRunnerNodeModuleFileInstrumentation(basePath) {
			return new InstrumentationNodeModuleFile.InstrumentationNodeModuleFile(`knex/${basePath}/runner.js`, SUPPORTED_VERSIONS, (Runner, moduleVersion) => {
				this._ensureWrapped(Runner.prototype, "query", this._createQueryWrapper(moduleVersion));
				return Runner;
			}, (Runner) => {
				this._unwrap(Runner.prototype, "query");
				return Runner;
			});
		}
		_getClientNodeModuleFileInstrumentation(basePath) {
			return new InstrumentationNodeModuleFile.InstrumentationNodeModuleFile(`knex/${basePath}/client.js`, SUPPORTED_VERSIONS, (Client) => {
				this._ensureWrapped(Client.prototype, "queryBuilder", this._storeContext.bind(this));
				this._ensureWrapped(Client.prototype, "schemaBuilder", this._storeContext.bind(this));
				this._ensureWrapped(Client.prototype, "raw", this._storeContext.bind(this));
				return Client;
			}, (Client) => {
				this._unwrap(Client.prototype, "queryBuilder");
				this._unwrap(Client.prototype, "schemaBuilder");
				this._unwrap(Client.prototype, "raw");
				return Client;
			});
		}
		_createQueryWrapper(moduleVersion) {
			return function wrapQuery(original) {
				return function wrapped_logging_method(query) {
					const config = this.client.config;
					const table = utils.extractTableName(this.builder);
					const operation = query?.method;
					const connectionString = config?.connection?.connectionString;
					const name = config?.connection?.filename || config?.connection?.database || utils.extractDatabaseFromConnectionString(connectionString);
					const attributes = {
						[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: ORIGIN,
						"knex.version": moduleVersion,
						[semconv.ATTR_DB_SYSTEM]: utils.mapSystem(this.client.driverName),
						[semconv.ATTR_DB_SQL_TABLE]: table,
						[semconv.ATTR_DB_OPERATION]: operation,
						[semconv.ATTR_DB_USER]: config?.connection?.user,
						[semconv.ATTR_DB_NAME]: name,
						[semconv.ATTR_NET_PEER_NAME]: config?.connection?.host ?? utils.extractHostFromConnectionString(connectionString),
						[semconv.ATTR_NET_PEER_PORT]: config?.connection?.port ?? utils.extractPortFromConnectionString(connectionString),
						[semconv.ATTR_NET_TRANSPORT]: config?.connection?.filename === ":memory:" ? "inproc" : void 0,
						[semconv.ATTR_DB_STATEMENT]: utils.limitLength(query?.sql, MAX_QUERY_LENGTH)
					};
					const parentSpan = this.builder[parentSpanSymbol] || core.getActiveSpan();
					const args = arguments;
					return core.startSpan({
						name: utils.getName(name, operation, table),
						kind: core.SPAN_KIND.CLIENT,
						attributes,
						parentSpan,
						onlyIfParent: true
					}, (span) => original.apply(this, args).catch((err) => {
						const fullQuery = utils.getFormatter(this)(query.sql, query.bindings || []);
						const message = err.message.replace(`${fullQuery} - `, "");
						span.setStatus({
							code: core.SPAN_STATUS_ERROR,
							message
						});
						throw err;
					}));
				};
			};
		}
		_storeContext(original) {
			return function wrapped_logging_method() {
				const builder = original.apply(this, arguments);
				Object.defineProperty(builder, parentSpanSymbol, { value: core.getActiveSpan() });
				return builder;
			};
		}
		_ensureWrapped(obj, methodName, wrapper) {
			if (instrumentation.isWrapped(obj[methodName])) this._unwrap(obj, methodName);
			this._wrap(obj, methodName, wrapper);
		}
	};
	exports.KnexInstrumentation = KnexInstrumentation;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/knex/index.js
var require_knex = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const instrumentation = require_instrumentation$10();
	const core = require_cjs$4();
	const nodeCore = require_cjs$2();
	const INTEGRATION_NAME = "Knex";
	const instrumentKnex = nodeCore.generateInstrumentOnce(INTEGRATION_NAME, () => new instrumentation.KnexInstrumentation());
	const _knexIntegration = (() => {
		return {
			name: INTEGRATION_NAME,
			setupOnce() {
				instrumentKnex();
			}
		};
	});
	const knexIntegration = core.defineIntegration(_knexIntegration);
	exports.instrumentKnex = instrumentKnex;
	exports.knexIntegration = knexIntegration;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/tedious/vendored/semconv.js
var require_semconv$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const ATTR_DB_NAME = "db.name";
	const ATTR_DB_SQL_TABLE = "db.sql.table";
	const ATTR_DB_STATEMENT = "db.statement";
	const ATTR_DB_SYSTEM = "db.system";
	const ATTR_DB_USER = "db.user";
	const ATTR_NET_PEER_NAME = "net.peer.name";
	const ATTR_NET_PEER_PORT = "net.peer.port";
	const DB_SYSTEM_VALUE_MSSQL = "mssql";
	exports.ATTR_DB_NAME = ATTR_DB_NAME;
	exports.ATTR_DB_SQL_TABLE = ATTR_DB_SQL_TABLE;
	exports.ATTR_DB_STATEMENT = ATTR_DB_STATEMENT;
	exports.ATTR_DB_SYSTEM = ATTR_DB_SYSTEM;
	exports.ATTR_DB_USER = ATTR_DB_USER;
	exports.ATTR_NET_PEER_NAME = ATTR_NET_PEER_NAME;
	exports.ATTR_NET_PEER_PORT = ATTR_NET_PEER_PORT;
	exports.DB_SYSTEM_VALUE_MSSQL = DB_SYSTEM_VALUE_MSSQL;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/tedious/vendored/utils.js
var require_utils$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	function getSpanName(operation, db, sql, bulkLoadTable) {
		if (operation === "execBulkLoad" && bulkLoadTable && db) return `${operation} ${bulkLoadTable} ${db}`;
		if (operation === "callProcedure") {
			if (db) return `${operation} ${sql} ${db}`;
			return `${operation} ${sql}`;
		}
		if (db) return `${operation} ${db}`;
		return `${operation}`;
	}
	const once = (fn) => {
		let called = false;
		return (...args) => {
			if (called) return;
			called = true;
			return fn(...args);
		};
	};
	exports.getSpanName = getSpanName;
	exports.once = once;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/tedious/vendored/instrumentation.js
var require_instrumentation$9 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const events = __require("events");
	const instrumentation = require_src$1();
	const semconv = require_semconv$1();
	const utils = require_utils$1();
	const core = require_cjs$4();
	const PACKAGE_NAME = "@sentry/instrumentation-tedious";
	const CURRENT_DATABASE = /* @__PURE__ */ Symbol("opentelemetry.instrumentation-tedious.current-database");
	const PATCHED_METHODS = [
		"callProcedure",
		"execSql",
		"execSqlBatch",
		"execBulkLoad",
		"prepare",
		"execute"
	];
	function setDatabase(databaseName) {
		Object.defineProperty(this, CURRENT_DATABASE, {
			value: databaseName,
			writable: true
		});
	}
	const _TediousInstrumentation = class _TediousInstrumentation extends instrumentation.InstrumentationBase {
		constructor(config = {}) {
			super(PACKAGE_NAME, core.SDK_VERSION, config);
		}
		init() {
			return [new instrumentation.InstrumentationNodeModuleDefinition(_TediousInstrumentation.COMPONENT, [">=1.11.0 <20"], (moduleExports) => {
				const ConnectionPrototype = moduleExports.Connection.prototype;
				for (const method of PATCHED_METHODS) {
					if (instrumentation.isWrapped(ConnectionPrototype[method])) this._unwrap(ConnectionPrototype, method);
					this._wrap(ConnectionPrototype, method, this._patchQuery(method));
				}
				if (instrumentation.isWrapped(ConnectionPrototype.connect)) this._unwrap(ConnectionPrototype, "connect");
				this._wrap(ConnectionPrototype, "connect", this._patchConnect);
				return moduleExports;
			}, (moduleExports) => {
				if (moduleExports === void 0) return;
				const ConnectionPrototype = moduleExports.Connection.prototype;
				for (const method of PATCHED_METHODS) this._unwrap(ConnectionPrototype, method);
				this._unwrap(ConnectionPrototype, "connect");
			})];
		}
		_patchConnect(original) {
			return function patchedConnect() {
				setDatabase.call(this, this.config?.options?.database);
				this.removeListener("databaseChange", setDatabase);
				this.on("databaseChange", setDatabase);
				this.once("end", () => {
					this.removeListener("databaseChange", setDatabase);
				});
				return original.apply(this, arguments);
			};
		}
		_patchQuery(operation) {
			return (originalMethod) => {
				const thisPlugin = this;
				function patchedMethod(request) {
					if (!(request instanceof events.EventEmitter)) {
						thisPlugin._diag.warn(`Unexpected invocation of patched ${operation} method. Span not recorded`);
						return originalMethod.apply(this, arguments);
					}
					let procCount = 0;
					let statementCount = 0;
					const incrementStatementCount = () => statementCount++;
					const incrementProcCount = () => procCount++;
					const databaseName = this[CURRENT_DATABASE];
					const sql = ((request2) => {
						if (request2.sqlTextOrProcedure === "sp_prepare" && request2.parametersByName?.stmt?.value) return request2.parametersByName.stmt.value;
						return request2.sqlTextOrProcedure;
					})(request);
					const attributes = {
						[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.db.otel.tedious",
						[semconv.ATTR_DB_SYSTEM]: semconv.DB_SYSTEM_VALUE_MSSQL,
						[semconv.ATTR_DB_NAME]: databaseName,
						[semconv.ATTR_DB_USER]: this.config?.userName ?? this.config?.authentication?.options?.userName,
						[semconv.ATTR_DB_STATEMENT]: sql,
						[semconv.ATTR_DB_SQL_TABLE]: request.table,
						[semconv.ATTR_NET_PEER_NAME]: this.config?.server,
						[semconv.ATTR_NET_PEER_PORT]: this.config?.options?.port
					};
					const span = core.startInactiveSpan({
						name: utils.getSpanName(operation, databaseName, sql, request.table),
						kind: core.SPAN_KIND.CLIENT,
						attributes
					});
					const endSpan = utils.once((err) => {
						request.removeListener("done", incrementStatementCount);
						request.removeListener("doneInProc", incrementStatementCount);
						request.removeListener("doneProc", incrementProcCount);
						request.removeListener("error", endSpan);
						this.removeListener("end", endSpan);
						span.setAttribute("tedious.procedure_count", procCount);
						span.setAttribute("tedious.statement_count", statementCount);
						if (err) span.setStatus({
							code: core.SPAN_STATUS_ERROR,
							message: err.message
						});
						span.end();
					});
					request.on("done", incrementStatementCount);
					request.on("doneInProc", incrementStatementCount);
					request.on("doneProc", incrementProcCount);
					request.once("error", endSpan);
					this.on("end", endSpan);
					if (typeof request.callback === "function") thisPlugin._wrap(request, "callback", thisPlugin._patchCallbackQuery(endSpan));
					else thisPlugin._diag.error("Expected request.callback to be a function");
					return core.withActiveSpan(span, () => originalMethod.apply(this, arguments));
				}
				Object.defineProperty(patchedMethod, "length", {
					value: originalMethod.length,
					writable: false
				});
				return patchedMethod;
			};
		}
		_patchCallbackQuery(endSpan) {
			return (originalCallback) => {
				return function(err, _rowCount, _rows) {
					endSpan(err);
					return originalCallback.apply(this, arguments);
				};
			};
		}
	};
	_TediousInstrumentation.COMPONENT = "tedious";
	exports.TediousInstrumentation = _TediousInstrumentation;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/tedious/index.js
var require_tedious = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const instrumentation = require_instrumentation$9();
	const core = require_cjs$4();
	const nodeCore = require_cjs$2();
	const INTEGRATION_NAME = "Tedious";
	const instrumentTedious = nodeCore.generateInstrumentOnce(INTEGRATION_NAME, () => new instrumentation.TediousInstrumentation({}));
	const _tediousIntegration = (() => {
		return {
			name: INTEGRATION_NAME,
			setupOnce() {
				instrumentTedious();
			}
		};
	});
	const tediousIntegration = core.defineIntegration(_tediousIntegration);
	exports.instrumentTedious = instrumentTedious;
	exports.tediousIntegration = tediousIntegration;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/genericPool/vendored/instrumentation.js
var require_instrumentation$8 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const instrumentation = require_src$1();
	const core = require_cjs$4();
	const MODULE_NAME = "generic-pool";
	const PACKAGE_NAME = "@sentry/instrumentation-generic-pool";
	var GenericPoolInstrumentation = class extends instrumentation.InstrumentationBase {
		constructor(config = {}) {
			super(PACKAGE_NAME, core.SDK_VERSION, config);
			this._isDisabled = false;
		}
		init() {
			return [
				new instrumentation.InstrumentationNodeModuleDefinition(MODULE_NAME, [">=3.0.0 <4"], (moduleExports) => {
					const Pool = moduleExports.Pool;
					if (instrumentation.isWrapped(Pool.prototype.acquire)) this._unwrap(Pool.prototype, "acquire");
					this._wrap(Pool.prototype, "acquire", this._acquirePatcher.bind(this));
					return moduleExports;
				}, (moduleExports) => {
					const Pool = moduleExports.Pool;
					this._unwrap(Pool.prototype, "acquire");
					return moduleExports;
				}),
				new instrumentation.InstrumentationNodeModuleDefinition(MODULE_NAME, [">=2.4.0 <3"], (moduleExports) => {
					const Pool = moduleExports.Pool;
					if (instrumentation.isWrapped(Pool.prototype.acquire)) this._unwrap(Pool.prototype, "acquire");
					this._wrap(Pool.prototype, "acquire", this._acquireWithCallbacksPatcher.bind(this));
					return moduleExports;
				}, (moduleExports) => {
					const Pool = moduleExports.Pool;
					this._unwrap(Pool.prototype, "acquire");
					return moduleExports;
				}),
				new instrumentation.InstrumentationNodeModuleDefinition(MODULE_NAME, [">=2.0.0 <2.4"], (moduleExports) => {
					this._isDisabled = false;
					if (instrumentation.isWrapped(moduleExports.Pool)) this._unwrap(moduleExports, "Pool");
					this._wrap(moduleExports, "Pool", this._poolWrapper.bind(this));
					return moduleExports;
				}, (moduleExports) => {
					this._isDisabled = true;
					return moduleExports;
				})
			];
		}
		_acquirePatcher(original) {
			return function wrapped_acquire(...args) {
				return core.startSpan({
					name: "generic-pool.acquire",
					attributes: { [core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.db.otel.generic_pool" }
				}, () => {
					return original.call(this, ...args);
				});
			};
		}
		_poolWrapper(original) {
			const wrap = this._wrap.bind(this);
			const acquireWithCallbacksPatcher = this._acquireWithCallbacksPatcher.bind(this);
			return function wrapped_pool(...args) {
				const pool = original.apply(this, args);
				wrap(pool, "acquire", acquireWithCallbacksPatcher);
				return pool;
			};
		}
		_acquireWithCallbacksPatcher(original) {
			const isDisabled = () => this._isDisabled;
			return function wrapped_acquire(cb, priority) {
				if (isDisabled()) return original.call(this, cb, priority);
				return core.startSpanManual({
					name: "generic-pool.acquire",
					attributes: { [core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.db.otel.generic_pool" }
				}, (span) => {
					original.call(this, (err, client) => {
						if (err) span.setStatus({
							code: core.SPAN_STATUS_ERROR,
							message: "internal_error"
						});
						span.end();
						if (cb) cb(err, client);
					}, priority);
				});
			};
		}
	};
	exports.GenericPoolInstrumentation = GenericPoolInstrumentation;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/genericPool/index.js
var require_genericPool = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const instrumentation = require_instrumentation$8();
	const core = require_cjs$4();
	const nodeCore = require_cjs$2();
	const INTEGRATION_NAME = "GenericPool";
	const instrumentGenericPool = nodeCore.generateInstrumentOnce(INTEGRATION_NAME, () => new instrumentation.GenericPoolInstrumentation({}));
	const _genericPoolIntegration = (() => {
		return {
			name: INTEGRATION_NAME,
			setupOnce() {
				instrumentGenericPool();
			}
		};
	});
	exports.genericPoolIntegration = core.defineIntegration(_genericPoolIntegration);
	exports.instrumentGenericPool = instrumentGenericPool;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/dataloader/vendored/instrumentation.js
var require_instrumentation$7 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const instrumentation = require_src$1();
	const core = require_cjs$4();
	const MODULE_NAME = "dataloader";
	const PACKAGE_NAME = "@sentry/instrumentation-dataloader";
	const ORIGIN = "auto.db.otel.dataloader";
	function isModule(module$2) {
		return module$2[Symbol.toStringTag] === "Module";
	}
	function extractModuleExports(module$3) {
		return isModule(module$3) ? module$3.default : module$3;
	}
	function getSpanName(dataloader, operation) {
		const dataloaderName = dataloader.name;
		if (dataloaderName) return `${MODULE_NAME}.${operation} ${dataloaderName}`;
		return `${MODULE_NAME}.${operation}`;
	}
	function getSpanOp(operation) {
		if (operation === "load" || operation === "loadMany" || operation === "batch") return "cache.get";
	}
	var DataloaderInstrumentation = class extends instrumentation.InstrumentationBase {
		constructor(config = {}) {
			super(PACKAGE_NAME, core.SDK_VERSION, config);
		}
		init() {
			return [new instrumentation.InstrumentationNodeModuleDefinition(MODULE_NAME, [">=2.0.0 <3"], (module$4) => {
				const dataloader = extractModuleExports(module$4);
				this._patchLoad(dataloader.prototype);
				this._patchLoadMany(dataloader.prototype);
				this._patchPrime(dataloader.prototype);
				this._patchClear(dataloader.prototype);
				this._patchClearAll(dataloader.prototype);
				return this._getPatchedConstructor(dataloader);
			}, (module$5) => {
				const dataloader = extractModuleExports(module$5);
				[
					"load",
					"loadMany",
					"prime",
					"clear",
					"clearAll"
				].forEach((method) => {
					if (instrumentation.isWrapped(dataloader.prototype[method])) this._unwrap(dataloader.prototype, method);
				});
			})];
		}
		_wrapBatchLoadFn(batchLoadFn) {
			const instrumentation = this;
			return function patchedBatchLoadFn(...args) {
				if (!instrumentation.isEnabled()) return batchLoadFn.call(this, ...args);
				return core.startSpan({
					name: getSpanName(this, "batch"),
					links: this._batch?.spanLinks,
					attributes: {
						[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: ORIGIN,
						[core.SEMANTIC_ATTRIBUTE_SENTRY_OP]: getSpanOp("batch")
					},
					onlyIfParent: true
				}, () => batchLoadFn.apply(this, args));
			};
		}
		_getPatchedConstructor(constructor) {
			const instrumentation$1 = this;
			const prototype = constructor.prototype;
			if (!instrumentation$1.isEnabled()) return constructor;
			function PatchedDataloader(...args) {
				if (typeof args[0] === "function") {
					if (instrumentation.isWrapped(args[0])) instrumentation$1._unwrap(args, 0);
					args[0] = instrumentation$1._wrapBatchLoadFn(args[0]);
				}
				return constructor.apply(this, args);
			}
			PatchedDataloader.prototype = prototype;
			return PatchedDataloader;
		}
		_patchLoad(proto) {
			if (instrumentation.isWrapped(proto.load)) this._unwrap(proto, "load");
			this._wrap(proto, "load", this._getPatchedLoad.bind(this));
		}
		_getPatchedLoad(original) {
			return function patchedLoad(...args) {
				return core.startSpan({
					name: getSpanName(this, "load"),
					kind: core.SPAN_KIND.CLIENT,
					attributes: {
						[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: ORIGIN,
						[core.SEMANTIC_ATTRIBUTE_SENTRY_OP]: getSpanOp("load")
					},
					onlyIfParent: true
				}, (span) => {
					const result = original.call(this, ...args);
					if (this._batch && span.isRecording()) {
						if (!this._batch.spanLinks) this._batch.spanLinks = [];
						this._batch.spanLinks.push({ context: span.spanContext() });
					}
					return result;
				});
			};
		}
		_patchLoadMany(proto) {
			if (instrumentation.isWrapped(proto.loadMany)) this._unwrap(proto, "loadMany");
			this._wrap(proto, "loadMany", this._getPatchedLoadMany.bind(this));
		}
		_getPatchedLoadMany(original) {
			return function patchedLoadMany(...args) {
				return core.startSpan({
					name: getSpanName(this, "loadMany"),
					kind: core.SPAN_KIND.CLIENT,
					attributes: {
						[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: ORIGIN,
						[core.SEMANTIC_ATTRIBUTE_SENTRY_OP]: getSpanOp("loadMany")
					},
					onlyIfParent: true
				}, () => original.call(this, ...args));
			};
		}
		_patchPrime(proto) {
			if (instrumentation.isWrapped(proto.prime)) this._unwrap(proto, "prime");
			this._wrap(proto, "prime", this._getPatchedPrime.bind(this));
		}
		_getPatchedPrime(original) {
			return function patchedPrime(...args) {
				return core.startSpan({
					name: getSpanName(this, "prime"),
					kind: core.SPAN_KIND.CLIENT,
					attributes: {
						[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: ORIGIN,
						[core.SEMANTIC_ATTRIBUTE_SENTRY_OP]: getSpanOp("prime")
					},
					onlyIfParent: true
				}, () => original.call(this, ...args));
			};
		}
		_patchClear(proto) {
			if (instrumentation.isWrapped(proto.clear)) this._unwrap(proto, "clear");
			this._wrap(proto, "clear", this._getPatchedClear.bind(this));
		}
		_getPatchedClear(original) {
			return function patchedClear(...args) {
				return core.startSpan({
					name: getSpanName(this, "clear"),
					kind: core.SPAN_KIND.CLIENT,
					attributes: {
						[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: ORIGIN,
						[core.SEMANTIC_ATTRIBUTE_SENTRY_OP]: getSpanOp("clear")
					},
					onlyIfParent: true
				}, () => original.call(this, ...args));
			};
		}
		_patchClearAll(proto) {
			if (instrumentation.isWrapped(proto.clearAll)) this._unwrap(proto, "clearAll");
			this._wrap(proto, "clearAll", this._getPatchedClearAll.bind(this));
		}
		_getPatchedClearAll(original) {
			return function patchedClearAll(...args) {
				return core.startSpan({
					name: getSpanName(this, "clearAll"),
					kind: core.SPAN_KIND.CLIENT,
					attributes: {
						[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: ORIGIN,
						[core.SEMANTIC_ATTRIBUTE_SENTRY_OP]: getSpanOp("clearAll")
					},
					onlyIfParent: true
				}, () => original.call(this, ...args));
			};
		}
	};
	exports.DataloaderInstrumentation = DataloaderInstrumentation;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/dataloader/index.js
var require_dataloader = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const instrumentation = require_instrumentation$7();
	const core = require_cjs$4();
	const nodeCore = require_cjs$2();
	const INTEGRATION_NAME = "Dataloader";
	const instrumentDataloader = nodeCore.generateInstrumentOnce(INTEGRATION_NAME, () => new instrumentation.DataloaderInstrumentation());
	const _dataloaderIntegration = (() => {
		return {
			name: INTEGRATION_NAME,
			setupOnce() {
				instrumentDataloader();
			}
		};
	});
	exports.dataloaderIntegration = core.defineIntegration(_dataloaderIntegration);
	exports.instrumentDataloader = instrumentDataloader;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/amqplib/vendored/types.js
var require_types = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	var EndOperation = /* @__PURE__ */ ((EndOperation2) => {
		EndOperation2["AutoAck"] = "auto ack";
		EndOperation2["Ack"] = "ack";
		EndOperation2["AckAll"] = "ackAll";
		EndOperation2["Reject"] = "reject";
		EndOperation2["Nack"] = "nack";
		EndOperation2["NackAll"] = "nackAll";
		EndOperation2["ChannelClosed"] = "channel closed";
		EndOperation2["ChannelError"] = "channel error";
		EndOperation2["InstrumentationTimeout"] = "instrumentation timeout";
		return EndOperation2;
	})(EndOperation || {});
	exports.EndOperation = EndOperation;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/amqplib/vendored/semconv.js
var require_semconv = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const ATTR_MESSAGING_SYSTEM = "messaging.system";
	const ATTR_MESSAGING_OPERATION = "messaging.operation";
	const ATTR_NET_PEER_NAME = "net.peer.name";
	const ATTR_NET_PEER_PORT = "net.peer.port";
	const ATTR_MESSAGING_DESTINATION = "messaging.destination";
	const ATTR_MESSAGING_DESTINATION_KIND = "messaging.destination_kind";
	const ATTR_MESSAGING_RABBITMQ_ROUTING_KEY = "messaging.rabbitmq.routing_key";
	const ATTR_MESSAGING_PROTOCOL = "messaging.protocol";
	const ATTR_MESSAGING_PROTOCOL_VERSION = "messaging.protocol_version";
	const ATTR_MESSAGING_URL = "messaging.url";
	const OLD_ATTR_MESSAGING_MESSAGE_ID = "messaging.message_id";
	const ATTR_MESSAGING_CONVERSATION_ID = "messaging.conversation_id";
	const MESSAGING_DESTINATION_KIND_VALUE_TOPIC = "topic";
	const MESSAGING_OPERATION_VALUE_PROCESS = "process";
	exports.ATTR_MESSAGING_CONVERSATION_ID = ATTR_MESSAGING_CONVERSATION_ID;
	exports.ATTR_MESSAGING_DESTINATION = ATTR_MESSAGING_DESTINATION;
	exports.ATTR_MESSAGING_DESTINATION_KIND = ATTR_MESSAGING_DESTINATION_KIND;
	exports.ATTR_MESSAGING_OPERATION = ATTR_MESSAGING_OPERATION;
	exports.ATTR_MESSAGING_PROTOCOL = ATTR_MESSAGING_PROTOCOL;
	exports.ATTR_MESSAGING_PROTOCOL_VERSION = ATTR_MESSAGING_PROTOCOL_VERSION;
	exports.ATTR_MESSAGING_RABBITMQ_ROUTING_KEY = ATTR_MESSAGING_RABBITMQ_ROUTING_KEY;
	exports.ATTR_MESSAGING_SYSTEM = ATTR_MESSAGING_SYSTEM;
	exports.ATTR_MESSAGING_URL = ATTR_MESSAGING_URL;
	exports.ATTR_NET_PEER_NAME = ATTR_NET_PEER_NAME;
	exports.ATTR_NET_PEER_PORT = ATTR_NET_PEER_PORT;
	exports.MESSAGING_DESTINATION_KIND_VALUE_TOPIC = MESSAGING_DESTINATION_KIND_VALUE_TOPIC;
	exports.MESSAGING_OPERATION_VALUE_PROCESS = MESSAGING_OPERATION_VALUE_PROCESS;
	exports.OLD_ATTR_MESSAGING_MESSAGE_ID = OLD_ATTR_MESSAGING_MESSAGE_ID;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/amqplib/vendored/utils.js
var require_utils = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const api = require_src();
	const core = require_cjs$4();
	const semconv = require_semconv();
	const PUBLISHER_ORIGIN = "auto.amqplib.otel.publisher";
	const CONSUMER_ORIGIN = "auto.amqplib.otel.consumer";
	const MESSAGE_STORED_SPAN = /* @__PURE__ */ Symbol("opentelemetry.amqplib.message.stored-span");
	const CHANNEL_SPANS_NOT_ENDED = /* @__PURE__ */ Symbol("opentelemetry.amqplib.channel.spans-not-ended");
	const CHANNEL_CONSUME_TIMEOUT_TIMER = /* @__PURE__ */ Symbol("opentelemetry.amqplib.channel.consumer-timeout-timer");
	const CONNECTION_ATTRIBUTES = /* @__PURE__ */ Symbol("opentelemetry.amqplib.connection.attributes");
	const CHANNEL_IS_CONFIRM_PUBLISHING = /* @__PURE__ */ Symbol("sentry.amqplib.channel.is-confirm-publishing");
	const normalizeExchange = (exchangeName) => exchangeName !== "" ? exchangeName : "<default>";
	const censorPassword = (url) => {
		return url.replace(/:[^:@/]*@/, ":***@");
	};
	const getPort = (portFromUrl, resolvedProtocol) => {
		return portFromUrl || (resolvedProtocol === "AMQP" ? 5672 : 5671);
	};
	const getProtocol = (protocolFromUrl) => {
		const resolvedProtocol = protocolFromUrl || "amqp";
		return (resolvedProtocol.endsWith(":") ? resolvedProtocol.substring(0, resolvedProtocol.length - 1) : resolvedProtocol).toUpperCase();
	};
	const getHostname = (hostnameFromUrl) => {
		return hostnameFromUrl || "localhost";
	};
	const getConnectionAttributesFromServer = (conn) => {
		const product = conn.serverProperties.product?.toLowerCase?.();
		if (product) return { [semconv.ATTR_MESSAGING_SYSTEM]: product };
		else return {};
	};
	const getConnectionAttributesFromUrl = (url) => {
		const attributes = { [semconv.ATTR_MESSAGING_PROTOCOL_VERSION]: "0.9.1" };
		const resolvedUrl = url || "amqp://localhost";
		if (typeof resolvedUrl === "object") {
			const connectOptions = resolvedUrl;
			const protocol = getProtocol(connectOptions?.protocol);
			attributes[semconv.ATTR_MESSAGING_PROTOCOL] = protocol;
			attributes[semconv.ATTR_NET_PEER_NAME] = getHostname(connectOptions?.hostname);
			attributes[semconv.ATTR_NET_PEER_PORT] = getPort(connectOptions.port, protocol);
		} else {
			const censoredUrl = censorPassword(resolvedUrl);
			attributes[semconv.ATTR_MESSAGING_URL] = censoredUrl;
			try {
				const urlParts = new URL(censoredUrl);
				const protocol = getProtocol(urlParts.protocol);
				attributes[semconv.ATTR_MESSAGING_PROTOCOL] = protocol;
				attributes[semconv.ATTR_NET_PEER_NAME] = getHostname(urlParts.hostname);
				attributes[semconv.ATTR_NET_PEER_PORT] = getPort(urlParts.port ? parseInt(urlParts.port) : void 0, protocol);
			} catch {}
		}
		return attributes;
	};
	function getHeaderAsString(headers, key) {
		const value = headers?.[key];
		if (value == null) return;
		return Array.isArray(value) ? String(value[0]) : String(value);
	}
	function startPublishSpan(exchange, routingKey, channel, options) {
		const normalizedExchange = normalizeExchange(exchange);
		const span = core.startInactiveSpan({
			name: `publish ${normalizedExchange}`,
			kind: api.SpanKind.PRODUCER,
			attributes: {
				...channel.connection[CONNECTION_ATTRIBUTES],
				[semconv.ATTR_MESSAGING_DESTINATION]: exchange,
				[semconv.ATTR_MESSAGING_DESTINATION_KIND]: semconv.MESSAGING_DESTINATION_KIND_VALUE_TOPIC,
				[semconv.ATTR_MESSAGING_RABBITMQ_ROUTING_KEY]: routingKey,
				[semconv.OLD_ATTR_MESSAGING_MESSAGE_ID]: options?.messageId,
				[semconv.ATTR_MESSAGING_CONVERSATION_ID]: options?.correlationId,
				[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: PUBLISHER_ORIGIN
			}
		});
		const modifiedOptions = options ?? {};
		modifiedOptions.headers = modifiedOptions.headers ?? {};
		const traceData = core.getTraceData({ span });
		if (traceData["sentry-trace"]) modifiedOptions.headers["sentry-trace"] = traceData["sentry-trace"];
		if (traceData.baggage) modifiedOptions.headers["baggage"] = traceData.baggage;
		return {
			span,
			modifiedOptions
		};
	}
	function startConsumeSpan(queue, msg, channel) {
		return core.startInactiveSpan({
			name: `${queue} process`,
			kind: api.SpanKind.CONSUMER,
			attributes: {
				...channel?.connection?.[CONNECTION_ATTRIBUTES],
				[semconv.ATTR_MESSAGING_DESTINATION]: msg.fields?.exchange,
				[semconv.ATTR_MESSAGING_DESTINATION_KIND]: semconv.MESSAGING_DESTINATION_KIND_VALUE_TOPIC,
				[semconv.ATTR_MESSAGING_RABBITMQ_ROUTING_KEY]: msg.fields?.routingKey,
				[semconv.ATTR_MESSAGING_OPERATION]: semconv.MESSAGING_OPERATION_VALUE_PROCESS,
				[semconv.OLD_ATTR_MESSAGING_MESSAGE_ID]: msg?.properties.messageId,
				[semconv.ATTR_MESSAGING_CONVERSATION_ID]: msg?.properties.correlationId,
				[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: CONSUMER_ORIGIN
			}
		});
	}
	exports.CHANNEL_CONSUME_TIMEOUT_TIMER = CHANNEL_CONSUME_TIMEOUT_TIMER;
	exports.CHANNEL_IS_CONFIRM_PUBLISHING = CHANNEL_IS_CONFIRM_PUBLISHING;
	exports.CHANNEL_SPANS_NOT_ENDED = CHANNEL_SPANS_NOT_ENDED;
	exports.CONNECTION_ATTRIBUTES = CONNECTION_ATTRIBUTES;
	exports.MESSAGE_STORED_SPAN = MESSAGE_STORED_SPAN;
	exports.getConnectionAttributesFromServer = getConnectionAttributesFromServer;
	exports.getConnectionAttributesFromUrl = getConnectionAttributesFromUrl;
	exports.getHeaderAsString = getHeaderAsString;
	exports.normalizeExchange = normalizeExchange;
	exports.startConsumeSpan = startConsumeSpan;
	exports.startPublishSpan = startPublishSpan;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/amqplib/vendored/patches.js
var require_patches = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const types = require_types();
	const utils = require_utils();
	const CONSUME_TIMEOUT_MS = 1e3 * 60;
	function endConsumerSpan(message, isRejected, operation, requeue) {
		const storedSpan = message[utils.MESSAGE_STORED_SPAN];
		if (!storedSpan) return;
		if (isRejected !== false) storedSpan.setStatus({
			code: core.SPAN_STATUS_ERROR,
			message: operation !== types.EndOperation.ChannelClosed && operation !== types.EndOperation.ChannelError ? `${operation} called on message${requeue === true ? " with requeue" : requeue === false ? " without requeue" : ""}` : operation
		});
		storedSpan.end();
		message[utils.MESSAGE_STORED_SPAN] = void 0;
	}
	function endAllSpansOnChannel(channel, isRejected, operation, requeue) {
		(channel[utils.CHANNEL_SPANS_NOT_ENDED] ?? []).forEach((msgDetails) => {
			endConsumerSpan(msgDetails.msg, isRejected, operation, requeue);
		});
		channel[utils.CHANNEL_SPANS_NOT_ENDED] = [];
	}
	function checkConsumeTimeoutOnChannel(channel) {
		const currentTime = core.timestampInSeconds();
		const spansNotEnded = channel[utils.CHANNEL_SPANS_NOT_ENDED] ?? [];
		let i;
		for (i = 0; i < spansNotEnded.length; i++) {
			const currMessage = spansNotEnded[i];
			if ((currentTime - currMessage.timeOfConsume) * 1e3 < CONSUME_TIMEOUT_MS) break;
			endConsumerSpan(currMessage.msg, null, types.EndOperation.InstrumentationTimeout, true);
		}
		spansNotEnded.splice(0, i);
	}
	function getConnectPatch(original) {
		return function patchedConnect(url, socketOptions, openCallback) {
			return original.call(this, url, socketOptions, function(err, conn) {
				if (err == null) {
					const urlAttributes = utils.getConnectionAttributesFromUrl(url);
					const serverAttributes = utils.getConnectionAttributesFromServer(conn);
					conn[utils.CONNECTION_ATTRIBUTES] = {
						...urlAttributes,
						...serverAttributes
					};
				}
				openCallback.apply(this, arguments);
			});
		};
	}
	function getChannelEmitPatch(original) {
		return function emit(eventName) {
			if (eventName === "close") {
				endAllSpansOnChannel(this, true, types.EndOperation.ChannelClosed, void 0);
				const activeTimer = this[utils.CHANNEL_CONSUME_TIMEOUT_TIMER];
				if (activeTimer) clearInterval(activeTimer);
				this[utils.CHANNEL_CONSUME_TIMEOUT_TIMER] = void 0;
			} else if (eventName === "error") endAllSpansOnChannel(this, true, types.EndOperation.ChannelError, void 0);
			return original.apply(this, arguments);
		};
	}
	function getAckAllPatch(isRejected, endOperation) {
		return (original) => function ackAll(requeueOrEmpty) {
			endAllSpansOnChannel(this, isRejected, endOperation, requeueOrEmpty);
			return original.apply(this, arguments);
		};
	}
	function getAckPatch(isRejected, endOperation) {
		return (original) => function ack(message, allUpToOrRequeue, requeue) {
			const channel = this;
			const requeueResolved = endOperation === types.EndOperation.Reject ? allUpToOrRequeue : requeue;
			const spansNotEnded = channel[utils.CHANNEL_SPANS_NOT_ENDED] ?? [];
			const msgIndex = spansNotEnded.findIndex((msgDetails) => msgDetails.msg === message);
			if (msgIndex < 0) endConsumerSpan(message, isRejected, endOperation, requeueResolved);
			else if (endOperation !== types.EndOperation.Reject && allUpToOrRequeue) {
				for (let i = 0; i <= msgIndex; i++) endConsumerSpan(spansNotEnded[i].msg, isRejected, endOperation, requeueResolved);
				spansNotEnded.splice(0, msgIndex + 1);
			} else {
				endConsumerSpan(message, isRejected, endOperation, requeueResolved);
				spansNotEnded.splice(msgIndex, 1);
			}
			return original.apply(this, arguments);
		};
	}
	function getConsumePatch(original) {
		return function consume(queue, onMessage, options) {
			const channel = this;
			if (!Object.prototype.hasOwnProperty.call(channel, utils.CHANNEL_SPANS_NOT_ENDED)) {
				const timer = setInterval(() => {
					checkConsumeTimeoutOnChannel(channel);
				}, CONSUME_TIMEOUT_MS);
				timer.unref();
				channel[utils.CHANNEL_CONSUME_TIMEOUT_TIMER] = timer;
				channel[utils.CHANNEL_SPANS_NOT_ENDED] = [];
			}
			const patchedOnMessage = function(msg) {
				if (!msg) return onMessage.call(this, msg);
				const headers = msg.properties.headers ?? {};
				const sentryTrace = utils.getHeaderAsString(headers, "sentry-trace");
				const baggage = utils.getHeaderAsString(headers, "baggage");
				core.continueTrace({
					sentryTrace,
					baggage
				}, () => {
					const span = utils.startConsumeSpan(queue, msg, channel);
					if (!options?.noAck) {
						channel[utils.CHANNEL_SPANS_NOT_ENDED].push({
							msg,
							timeOfConsume: core.timestampInSeconds()
						});
						msg[utils.MESSAGE_STORED_SPAN] = span;
					}
					core.withActiveSpan(span, () => {
						onMessage.call(this, msg);
					});
					if (options?.noAck) span.end();
				});
			};
			const callArgs = Array.prototype.slice.call(arguments);
			callArgs[1] = patchedOnMessage;
			return original.apply(this, callArgs);
		};
	}
	function getConfirmedPublishPatch(original) {
		return function confirmedPublish(exchange, routingKey, content, options, callback) {
			const channel = this;
			const { span, modifiedOptions } = utils.startPublishSpan(exchange, routingKey, channel, options);
			const patchedOnConfirm = function(err, ok) {
				try {
					core.withActiveSpan(span, () => {
						callback?.call(this, err, ok);
					});
				} finally {
					if (err) span.setStatus({
						code: core.SPAN_STATUS_ERROR,
						message: "message confirmation has been nack'ed"
					});
					span.end();
				}
			};
			const argumentsCopy = [...arguments];
			argumentsCopy[3] = modifiedOptions;
			argumentsCopy[4] = patchedOnConfirm;
			channel[utils.CHANNEL_IS_CONFIRM_PUBLISHING] = true;
			try {
				return original.apply(this, argumentsCopy);
			} finally {
				channel[utils.CHANNEL_IS_CONFIRM_PUBLISHING] = false;
			}
		};
	}
	function getPublishPatch(original) {
		return function publish(exchange, routingKey, content, options) {
			if (this[utils.CHANNEL_IS_CONFIRM_PUBLISHING]) return original.apply(this, arguments);
			const channel = this;
			const { span, modifiedOptions } = utils.startPublishSpan(exchange, routingKey, channel, options);
			const argumentsCopy = [...arguments];
			argumentsCopy[3] = modifiedOptions;
			const originalRes = original.apply(this, argumentsCopy);
			span.end();
			return originalRes;
		};
	}
	exports.getAckAllPatch = getAckAllPatch;
	exports.getAckPatch = getAckPatch;
	exports.getChannelEmitPatch = getChannelEmitPatch;
	exports.getConfirmedPublishPatch = getConfirmedPublishPatch;
	exports.getConnectPatch = getConnectPatch;
	exports.getConsumePatch = getConsumePatch;
	exports.getPublishPatch = getPublishPatch;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/amqplib/vendored/instrumentation.js
var require_instrumentation$6 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const instrumentation = require_src$1();
	const core = require_cjs$4();
	const InstrumentationNodeModuleFile = require_InstrumentationNodeModuleFile();
	const patches = require_patches();
	const types = require_types();
	const PACKAGE_NAME = "@sentry/instrumentation-amqplib";
	const supportedVersions = [">=0.5.5 <2"];
	var AmqplibInstrumentation = class extends instrumentation.InstrumentationBase {
		constructor(config = {}) {
			super(PACKAGE_NAME, core.SDK_VERSION, config);
		}
		init() {
			const channelModelModuleFile = new InstrumentationNodeModuleFile.InstrumentationNodeModuleFile("amqplib/lib/channel_model.js", supportedVersions, this.patchChannelModel.bind(this), this.unpatchChannelModel.bind(this));
			const callbackModelModuleFile = new InstrumentationNodeModuleFile.InstrumentationNodeModuleFile("amqplib/lib/callback_model.js", supportedVersions, this.patchChannelModel.bind(this), this.unpatchChannelModel.bind(this));
			const connectModuleFile = new InstrumentationNodeModuleFile.InstrumentationNodeModuleFile("amqplib/lib/connect.js", supportedVersions, this.patchConnect.bind(this), this.unpatchConnect.bind(this));
			return new instrumentation.InstrumentationNodeModuleDefinition("amqplib", supportedVersions, void 0, void 0, [
				channelModelModuleFile,
				connectModuleFile,
				callbackModelModuleFile
			]);
		}
		patchConnect(moduleExports) {
			const unpatchedExports = this.unpatchConnect(moduleExports);
			if (!instrumentation.isWrapped(unpatchedExports.connect)) this._wrap(unpatchedExports, "connect", patches.getConnectPatch);
			return unpatchedExports;
		}
		unpatchConnect(moduleExports) {
			if (instrumentation.isWrapped(moduleExports.connect)) this._unwrap(moduleExports, "connect");
			return moduleExports;
		}
		patchChannelModel(moduleExports) {
			if (!instrumentation.isWrapped(moduleExports.Channel.prototype.publish)) this._wrap(moduleExports.Channel.prototype, "publish", patches.getPublishPatch);
			if (!instrumentation.isWrapped(moduleExports.Channel.prototype.consume)) this._wrap(moduleExports.Channel.prototype, "consume", patches.getConsumePatch);
			if (!instrumentation.isWrapped(moduleExports.Channel.prototype.ack)) this._wrap(moduleExports.Channel.prototype, "ack", patches.getAckPatch(false, types.EndOperation.Ack));
			if (!instrumentation.isWrapped(moduleExports.Channel.prototype.nack)) this._wrap(moduleExports.Channel.prototype, "nack", patches.getAckPatch(true, types.EndOperation.Nack));
			if (!instrumentation.isWrapped(moduleExports.Channel.prototype.reject)) this._wrap(moduleExports.Channel.prototype, "reject", patches.getAckPatch(true, types.EndOperation.Reject));
			if (!instrumentation.isWrapped(moduleExports.Channel.prototype.ackAll)) this._wrap(moduleExports.Channel.prototype, "ackAll", patches.getAckAllPatch(false, types.EndOperation.AckAll));
			if (!instrumentation.isWrapped(moduleExports.Channel.prototype.nackAll)) this._wrap(moduleExports.Channel.prototype, "nackAll", patches.getAckAllPatch(true, types.EndOperation.NackAll));
			if (!instrumentation.isWrapped(moduleExports.Channel.prototype.emit)) this._wrap(moduleExports.Channel.prototype, "emit", patches.getChannelEmitPatch);
			if (!instrumentation.isWrapped(moduleExports.ConfirmChannel.prototype.publish)) this._wrap(moduleExports.ConfirmChannel.prototype, "publish", patches.getConfirmedPublishPatch);
			return moduleExports;
		}
		unpatchChannelModel(moduleExports) {
			if (instrumentation.isWrapped(moduleExports.Channel.prototype.publish)) this._unwrap(moduleExports.Channel.prototype, "publish");
			if (instrumentation.isWrapped(moduleExports.Channel.prototype.consume)) this._unwrap(moduleExports.Channel.prototype, "consume");
			if (instrumentation.isWrapped(moduleExports.Channel.prototype.ack)) this._unwrap(moduleExports.Channel.prototype, "ack");
			if (instrumentation.isWrapped(moduleExports.Channel.prototype.nack)) this._unwrap(moduleExports.Channel.prototype, "nack");
			if (instrumentation.isWrapped(moduleExports.Channel.prototype.reject)) this._unwrap(moduleExports.Channel.prototype, "reject");
			if (instrumentation.isWrapped(moduleExports.Channel.prototype.ackAll)) this._unwrap(moduleExports.Channel.prototype, "ackAll");
			if (instrumentation.isWrapped(moduleExports.Channel.prototype.nackAll)) this._unwrap(moduleExports.Channel.prototype, "nackAll");
			if (instrumentation.isWrapped(moduleExports.Channel.prototype.emit)) this._unwrap(moduleExports.Channel.prototype, "emit");
			if (instrumentation.isWrapped(moduleExports.ConfirmChannel.prototype.publish)) this._unwrap(moduleExports.ConfirmChannel.prototype, "publish");
			return moduleExports;
		}
	};
	exports.AmqplibInstrumentation = AmqplibInstrumentation;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/amqplib/index.js
var require_amqplib = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const nodeCore = require_cjs$2();
	const instrumentation = require_instrumentation$6();
	const INTEGRATION_NAME = "Amqplib";
	const instrumentAmqplib = nodeCore.generateInstrumentOnce(INTEGRATION_NAME, () => new instrumentation.AmqplibInstrumentation());
	const _amqplibIntegration = (() => {
		return {
			name: INTEGRATION_NAME,
			setupOnce() {
				instrumentAmqplib();
			}
		};
	});
	exports.amqplibIntegration = core.defineIntegration(_amqplibIntegration);
	exports.instrumentAmqplib = instrumentAmqplib;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/vercelai/constants.js
var require_constants$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	exports.INTEGRATION_NAME = "VercelAI";
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/vercelai/instrumentation.js
var require_instrumentation$5 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const instrumentation = require_src$1();
	const core = require_cjs$4();
	const constants = require_constants$3();
	const SUPPORTED_VERSIONS = [">=3.0.0 <7"];
	const INSTRUMENTED_METHODS = [
		"generateText",
		"streamText",
		"generateObject",
		"streamObject",
		"embed",
		"embedMany",
		"rerank"
	];
	function isToolError(obj) {
		if (typeof obj !== "object" || obj === null) return false;
		const candidate = obj;
		return "type" in candidate && "error" in candidate && "toolName" in candidate && "toolCallId" in candidate && candidate.type === "tool-error" && candidate.error instanceof Error;
	}
	function processToolCallResults(result) {
		if (typeof result !== "object" || result === null || !("content" in result)) return;
		const resultObj = result;
		if (!Array.isArray(resultObj.content)) return;
		captureToolErrors(resultObj.content);
		cleanupToolCallSpanContexts(resultObj.content);
	}
	function captureToolErrors(content) {
		for (const item of content) {
			if (!isToolError(item)) continue;
			const spanContext = core._INTERNAL_getSpanContextForToolCallId(item.toolCallId);
			if (spanContext) core.withScope((scope) => {
				scope.setContext("trace", {
					trace_id: spanContext.traceId,
					span_id: spanContext.spanId
				});
				scope.setTag("vercel.ai.tool.name", item.toolName);
				scope.setTag("vercel.ai.tool.callId", item.toolCallId);
				scope.setLevel("error");
				core.captureException(item.error, { mechanism: {
					type: "auto.vercelai.otel",
					handled: false
				} });
			});
			else core.withScope((scope) => {
				scope.setTag("vercel.ai.tool.name", item.toolName);
				scope.setTag("vercel.ai.tool.callId", item.toolCallId);
				scope.setLevel("error");
				core.captureException(item.error, { mechanism: {
					type: "auto.vercelai.otel",
					handled: false
				} });
			});
		}
	}
	function cleanupToolCallSpanContexts(content) {
		for (const item of content) if (typeof item === "object" && item !== null && "toolCallId" in item && typeof item.toolCallId === "string") core._INTERNAL_cleanupToolCallSpanContext(item.toolCallId);
	}
	function determineRecordingSettings(integrationRecordingOptions, methodTelemetryOptions, telemetryExplicitlyEnabled, defaultInputsEnabled, defaultOutputsEnabled) {
		return {
			recordInputs: integrationRecordingOptions?.recordInputs !== void 0 ? integrationRecordingOptions.recordInputs : methodTelemetryOptions.recordInputs !== void 0 ? methodTelemetryOptions.recordInputs : telemetryExplicitlyEnabled === true ? true : defaultInputsEnabled,
			recordOutputs: integrationRecordingOptions?.recordOutputs !== void 0 ? integrationRecordingOptions.recordOutputs : methodTelemetryOptions.recordOutputs !== void 0 ? methodTelemetryOptions.recordOutputs : telemetryExplicitlyEnabled === true ? true : defaultOutputsEnabled
		};
	}
	var SentryVercelAiInstrumentation = class extends instrumentation.InstrumentationBase {
		constructor(config = {}) {
			super("@sentry/instrumentation-vercel-ai", core.SDK_VERSION, config);
			this._isPatched = false;
			this._callbacks = [];
		}
		/**
		* Initializes the instrumentation by defining the modules to be patched.
		*/
		init() {
			return new instrumentation.InstrumentationNodeModuleDefinition("ai", SUPPORTED_VERSIONS, this._patch.bind(this));
		}
		/**
		* Call the provided callback when the module is patched.
		* If it has already been patched, the callback will be called immediately.
		*/
		callWhenPatched(callback) {
			if (this._isPatched) callback();
			else this._callbacks.push(callback);
		}
		/**
		* Patches module exports to enable Vercel AI telemetry.
		*/
		_patch(moduleExports) {
			this._isPatched = true;
			this._callbacks.forEach((callback) => callback());
			this._callbacks = [];
			const generatePatch = (originalMethod) => {
				return new Proxy(originalMethod, { apply: (target, thisArg, args) => {
					const existingExperimentalTelemetry = args[0].experimental_telemetry || {};
					const isEnabled = existingExperimentalTelemetry.isEnabled;
					const client = core.getClient();
					const integration = client?.getIntegrationByName(constants.INTEGRATION_NAME);
					const integrationOptions = integration?.options;
					const genAI = integration ? client?.getDataCollectionOptions().genAI : void 0;
					const { recordInputs, recordOutputs } = determineRecordingSettings(integrationOptions, existingExperimentalTelemetry, isEnabled, Boolean(genAI?.inputs), Boolean(genAI?.outputs));
					args[0].experimental_telemetry = {
						...existingExperimentalTelemetry,
						isEnabled: isEnabled !== void 0 ? isEnabled : true,
						recordInputs,
						recordOutputs
					};
					return core.handleCallbackErrors(() => Reflect.apply(target, thisArg, args), (error) => {
						if (error && typeof error === "object") core.addNonEnumerableProperty(error, "_sentry_active_span", core.getActiveSpan());
					}, () => {}, (result) => {
						processToolCallResults(result);
					});
				} });
			};
			if (Object.prototype.toString.call(moduleExports) === "[object Module]") {
				for (const method of INSTRUMENTED_METHODS) if (moduleExports[method] != null) moduleExports[method] = generatePatch(moduleExports[method]);
				return moduleExports;
			} else {
				const patchedModuleExports = INSTRUMENTED_METHODS.reduce((acc, curr) => {
					if (moduleExports[curr] != null) acc[curr] = generatePatch(moduleExports[curr]);
					return acc;
				}, {});
				return {
					...moduleExports,
					...patchedModuleExports
				};
			}
		}
	};
	exports.SentryVercelAiInstrumentation = SentryVercelAiInstrumentation;
	exports.cleanupToolCallSpanContexts = cleanupToolCallSpanContexts;
	exports.determineRecordingSettings = determineRecordingSettings;
	exports.processToolCallResults = processToolCallResults;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/vercelai/index.js
var require_vercelai = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const nodeCore = require_cjs$2();
	const serverUtils = require_cjs$1();
	const constants = require_constants$3();
	const instrumentation = require_instrumentation$5();
	const instrumentVercelAi = nodeCore.generateInstrumentOnce(constants.INTEGRATION_NAME, () => new instrumentation.SentryVercelAiInstrumentation({}));
	function shouldForceIntegration(client) {
		return !!client.getIntegrationByName("Modules")?.getModules?.()?.ai;
	}
	const _vercelAIIntegration = ((options = {}) => {
		let instrumentation;
		const parentIntegration = serverUtils.vercelAiIntegration(options);
		return {
			name: constants.INTEGRATION_NAME,
			options,
			setupOnce() {
				instrumentation = instrumentVercelAi();
				parentIntegration.setupOnce?.();
			},
			afterAllSetup(client) {
				if (options.force ?? shouldForceIntegration(client)) core.addVercelAiProcessors(client);
				else instrumentation?.callWhenPatched(() => core.addVercelAiProcessors(client));
			}
		};
	});
	const vercelAIIntegration = core.defineIntegration(_vercelAIIntegration);
	exports.instrumentVercelAi = instrumentVercelAi;
	exports.vercelAIIntegration = vercelAIIntegration;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/openai/instrumentation.js
var require_instrumentation$4 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const instrumentation = require_src$1();
	const core = require_cjs$4();
	const supportedVersions = [">=4.0.0 <7"];
	var SentryOpenAiInstrumentation = class extends instrumentation.InstrumentationBase {
		constructor(config = {}) {
			super("@sentry/instrumentation-openai", core.SDK_VERSION, config);
		}
		/**
		* Initializes the instrumentation by defining the modules to be patched.
		*/
		init() {
			return new instrumentation.InstrumentationNodeModuleDefinition("openai", supportedVersions, this._patch.bind(this));
		}
		/**
		* Core patch logic applying instrumentation to the OpenAI and AzureOpenAI client constructors.
		*/
		_patch(exports$20) {
			let result = exports$20;
			result = this._patchClient(result, "OpenAI");
			result = this._patchClient(result, "AzureOpenAI");
			return result;
		}
		/**
		* Patch logic applying instrumentation to the specified client constructor.
		*/
		_patchClient(exports$21, exportKey) {
			const Original = exports$21[exportKey];
			if (!Original) return exports$21;
			const config = this.getConfig();
			const WrappedOpenAI = function(...args) {
				if (core._INTERNAL_shouldSkipAiProviderWrapping(core.OPENAI_INTEGRATION_NAME)) return Reflect.construct(Original, args);
				const instance = Reflect.construct(Original, args);
				return core.instrumentOpenAiClient(instance, config);
			};
			Object.setPrototypeOf(WrappedOpenAI, Original);
			Object.setPrototypeOf(WrappedOpenAI.prototype, Original.prototype);
			for (const key of Object.getOwnPropertyNames(Original)) if (![
				"length",
				"name",
				"prototype"
			].includes(key)) {
				const descriptor = Object.getOwnPropertyDescriptor(Original, key);
				if (descriptor) Object.defineProperty(WrappedOpenAI, key, descriptor);
			}
			try {
				exports$21[exportKey] = WrappedOpenAI;
			} catch {
				Object.defineProperty(exports$21, exportKey, {
					value: WrappedOpenAI,
					writable: true,
					configurable: true,
					enumerable: true
				});
			}
			if (exports$21.default === Original) try {
				exports$21.default = WrappedOpenAI;
			} catch {
				Object.defineProperty(exports$21, "default", {
					value: WrappedOpenAI,
					writable: true,
					configurable: true,
					enumerable: true
				});
			}
			return exports$21;
		}
	};
	exports.SentryOpenAiInstrumentation = SentryOpenAiInstrumentation;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/openai/index.js
var require_openai = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const nodeCore = require_cjs$2();
	const instrumentation = require_instrumentation$4();
	const instrumentOpenAi = nodeCore.generateInstrumentOnce(core.OPENAI_INTEGRATION_NAME, (options) => new instrumentation.SentryOpenAiInstrumentation(options));
	const _openAiIntegration = ((options = {}) => {
		return {
			name: core.OPENAI_INTEGRATION_NAME,
			setupOnce() {
				instrumentOpenAi(options);
			}
		};
	});
	const openAIIntegration = core.defineIntegration(_openAiIntegration);
	exports.instrumentOpenAi = instrumentOpenAi;
	exports.openAIIntegration = openAIIntegration;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/anthropic-ai/instrumentation.js
var require_instrumentation$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const instrumentation = require_src$1();
	const core = require_cjs$4();
	const supportedVersions = [">=0.19.2 <1.0.0"];
	var SentryAnthropicAiInstrumentation = class extends instrumentation.InstrumentationBase {
		constructor(config = {}) {
			super("@sentry/instrumentation-anthropic-ai", core.SDK_VERSION, config);
		}
		/**
		* Initializes the instrumentation by defining the modules to be patched.
		*/
		init() {
			return new instrumentation.InstrumentationNodeModuleDefinition("@anthropic-ai/sdk", supportedVersions, this._patch.bind(this));
		}
		/**
		* Core patch logic applying instrumentation to the Anthropic AI client constructor.
		*/
		_patch(exports$19) {
			const Original = exports$19.Anthropic;
			const config = this.getConfig();
			const WrappedAnthropic = function(...args) {
				if (core._INTERNAL_shouldSkipAiProviderWrapping(core.ANTHROPIC_AI_INTEGRATION_NAME)) return Reflect.construct(Original, args);
				const instance = Reflect.construct(Original, args);
				return core.instrumentAnthropicAiClient(instance, config);
			};
			Object.setPrototypeOf(WrappedAnthropic, Original);
			Object.setPrototypeOf(WrappedAnthropic.prototype, Original.prototype);
			for (const key of Object.getOwnPropertyNames(Original)) if (![
				"length",
				"name",
				"prototype"
			].includes(key)) {
				const descriptor = Object.getOwnPropertyDescriptor(Original, key);
				if (descriptor) Object.defineProperty(WrappedAnthropic, key, descriptor);
			}
			try {
				exports$19.Anthropic = WrappedAnthropic;
			} catch {
				Object.defineProperty(exports$19, "Anthropic", {
					value: WrappedAnthropic,
					writable: true,
					configurable: true,
					enumerable: true
				});
			}
			if (exports$19.default === Original) try {
				exports$19.default = WrappedAnthropic;
			} catch {
				Object.defineProperty(exports$19, "default", {
					value: WrappedAnthropic,
					writable: true,
					configurable: true,
					enumerable: true
				});
			}
			return exports$19;
		}
	};
	exports.SentryAnthropicAiInstrumentation = SentryAnthropicAiInstrumentation;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/anthropic-ai/index.js
var require_anthropic_ai = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const nodeCore = require_cjs$2();
	const instrumentation = require_instrumentation$3();
	const instrumentAnthropicAi = nodeCore.generateInstrumentOnce(core.ANTHROPIC_AI_INTEGRATION_NAME, (options) => new instrumentation.SentryAnthropicAiInstrumentation(options));
	const _anthropicAIIntegration = ((options = {}) => {
		return {
			name: core.ANTHROPIC_AI_INTEGRATION_NAME,
			options,
			setupOnce() {
				instrumentAnthropicAi(options);
			}
		};
	});
	exports.anthropicAIIntegration = core.defineIntegration(_anthropicAIIntegration);
	exports.instrumentAnthropicAi = instrumentAnthropicAi;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/google-genai/instrumentation.js
var require_instrumentation$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const instrumentation = require_src$1();
	const InstrumentationNodeModuleFile = require_InstrumentationNodeModuleFile();
	const core = require_cjs$4();
	const supportedVersions = [">=0.10.0 <2"];
	var SentryGoogleGenAiInstrumentation = class extends instrumentation.InstrumentationBase {
		constructor(config = {}) {
			super("@sentry/instrumentation-google-genai", core.SDK_VERSION, config);
		}
		/**
		* Initializes the instrumentation by defining the modules to be patched.
		*/
		init() {
			return new instrumentation.InstrumentationNodeModuleDefinition("@google/genai", supportedVersions, (exports$14) => this._patch(exports$14), (exports$15) => exports$15, [new InstrumentationNodeModuleFile.InstrumentationNodeModuleFile("@google/genai/dist/node/index.cjs", supportedVersions, (exports$16) => this._patch(exports$16), (exports$17) => exports$17)]);
		}
		/**
		* Core patch logic applying instrumentation to the Google GenAI client constructor.
		*/
		_patch(exports$18) {
			const Original = exports$18.GoogleGenAI;
			const config = this.getConfig();
			if (typeof Original !== "function") return exports$18;
			const WrappedGoogleGenAI = function(...args) {
				if (core._INTERNAL_shouldSkipAiProviderWrapping(core.GOOGLE_GENAI_INTEGRATION_NAME)) return Reflect.construct(Original, args);
				const instance = Reflect.construct(Original, args);
				return core.instrumentGoogleGenAIClient(instance, config);
			};
			Object.setPrototypeOf(WrappedGoogleGenAI, Original);
			Object.setPrototypeOf(WrappedGoogleGenAI.prototype, Original.prototype);
			for (const key of Object.getOwnPropertyNames(Original)) if (![
				"length",
				"name",
				"prototype"
			].includes(key)) {
				const descriptor = Object.getOwnPropertyDescriptor(Original, key);
				if (descriptor) Object.defineProperty(WrappedGoogleGenAI, key, descriptor);
			}
			core.replaceExports(exports$18, "GoogleGenAI", WrappedGoogleGenAI);
			return exports$18;
		}
	};
	exports.SentryGoogleGenAiInstrumentation = SentryGoogleGenAiInstrumentation;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/google-genai/index.js
var require_google_genai = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const nodeCore = require_cjs$2();
	const instrumentation = require_instrumentation$2();
	const instrumentGoogleGenAI = nodeCore.generateInstrumentOnce(core.GOOGLE_GENAI_INTEGRATION_NAME, (options) => new instrumentation.SentryGoogleGenAiInstrumentation(options));
	const _googleGenAIIntegration = ((options = {}) => {
		return {
			name: core.GOOGLE_GENAI_INTEGRATION_NAME,
			setupOnce() {
				instrumentGoogleGenAI(options);
			}
		};
	});
	exports.googleGenAIIntegration = core.defineIntegration(_googleGenAIIntegration);
	exports.instrumentGoogleGenAI = instrumentGoogleGenAI;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/langchain/instrumentation.js
var require_instrumentation$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const instrumentation = require_src$1();
	const InstrumentationNodeModuleFile = require_InstrumentationNodeModuleFile();
	const core = require_cjs$4();
	const supportedVersions = [">=0.1.0 <2.0.0"];
	function wrapRunnableMethod(originalMethod, sentryHandler, _methodName) {
		return new Proxy(originalMethod, { apply(target, thisArg, args) {
			const optionsIndex = 1;
			let options = args[optionsIndex];
			if (!options || typeof options !== "object" || Array.isArray(options)) {
				options = {};
				args[optionsIndex] = options;
			}
			options.callbacks = core._INTERNAL_mergeLangChainCallbackHandler(options.callbacks, sentryHandler);
			return Reflect.apply(target, thisArg, args);
		} });
	}
	var SentryLangChainInstrumentation = class extends instrumentation.InstrumentationBase {
		constructor(config = {}) {
			super("@sentry/instrumentation-langchain", core.SDK_VERSION, config);
		}
		/**
		* Initializes the instrumentation by defining the modules to be patched.
		* We patch the BaseChatModel class methods to inject callbacks
		*
		* We hook into provider packages (@langchain/anthropic, @langchain/openai, etc.)
		* because @langchain/core is often bundled and not loaded as a separate module
		*/
		init() {
			const modules = [];
			for (const packageName of [
				"@langchain/anthropic",
				"@langchain/openai",
				"@langchain/google-genai",
				"@langchain/mistralai",
				"@langchain/google-vertexai",
				"@langchain/groq"
			]) modules.push(new instrumentation.InstrumentationNodeModuleDefinition(packageName, supportedVersions, this._patch.bind(this), (exports$7) => exports$7, [new InstrumentationNodeModuleFile.InstrumentationNodeModuleFile(`${packageName}/dist/index.cjs`, supportedVersions, this._patch.bind(this), (exports$8) => exports$8)]));
			modules.push(new instrumentation.InstrumentationNodeModuleDefinition("langchain", supportedVersions, this._patch.bind(this), (exports$9) => exports$9, [new InstrumentationNodeModuleFile.InstrumentationNodeModuleFile("langchain/dist/chat_models/universal.cjs", supportedVersions, this._patch.bind(this), (exports$10) => exports$10)]));
			return modules;
		}
		/**
		* Core patch logic - patches chat model and embedding methods
		* This is called when a LangChain provider package is loaded
		*/
		_patch(exports$11) {
			core._INTERNAL_skipAiProviderWrapping([
				core.OPENAI_INTEGRATION_NAME,
				core.ANTHROPIC_AI_INTEGRATION_NAME,
				core.GOOGLE_GENAI_INTEGRATION_NAME
			]);
			const config = this.getConfig();
			const sentryHandler = core.createLangChainCallbackHandler(config);
			this._patchRunnableMethods(exports$11, sentryHandler);
			this._patchEmbeddingsMethods(exports$11, config);
			return exports$11;
		}
		/**
		* Patches chat model methods (invoke, stream, batch) to inject Sentry callbacks
		* Finds a chat model class from the provider package exports and patches its prototype methods
		*/
		_patchRunnableMethods(exports$12, sentryHandler) {
			const knownChatModelNames = [
				"ChatAnthropic",
				"ChatOpenAI",
				"ChatGoogleGenerativeAI",
				"ChatMistralAI",
				"ChatVertexAI",
				"ChatGroq",
				"ConfigurableModel"
			];
			const exportsToPatch = exports$12.universal_exports ?? exports$12;
			const chatModelClass = Object.values(exportsToPatch).find((exp) => {
				return typeof exp === "function" && knownChatModelNames.includes(exp.name);
			});
			if (!chatModelClass) return;
			const targetProto = chatModelClass.prototype;
			if (targetProto.__sentry_patched__) return;
			targetProto.__sentry_patched__ = true;
			for (const methodName of [
				"invoke",
				"stream",
				"batch"
			]) {
				const method = targetProto[methodName];
				if (typeof method === "function") targetProto[methodName] = wrapRunnableMethod(method, sentryHandler);
			}
		}
		/**
		* Patches embedding class methods (embedQuery, embedDocuments) to create Sentry spans.
		*
		* Unlike chat models which use LangChain's callback system, the Embeddings base class
		* has no callback support. We wrap the methods directly on the prototype.
		*
		* Instruments any exported class whose prototype has both embedQuery and embedDocuments as functions.
		*/
		_patchEmbeddingsMethods(exports$13, options) {
			const exportsToPatch = exports$13.universal_exports ?? exports$13;
			for (const exp of Object.values(exportsToPatch)) {
				if (typeof exp !== "function" || !exp.prototype) continue;
				const proto = exp.prototype;
				if (typeof proto.embedQuery !== "function" || typeof proto.embedDocuments !== "function") continue;
				if (proto.__sentry_patched__) continue;
				proto.__sentry_patched__ = true;
				core.instrumentLangChainEmbeddings(proto, options);
			}
		}
	};
	exports.SentryLangChainInstrumentation = SentryLangChainInstrumentation;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/langchain/index.js
var require_langchain = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const nodeCore = require_cjs$2();
	const instrumentation = require_instrumentation$1();
	const instrumentLangChain = nodeCore.generateInstrumentOnce(core.LANGCHAIN_INTEGRATION_NAME, (options) => new instrumentation.SentryLangChainInstrumentation(options));
	const _langChainIntegration = ((options = {}) => {
		return {
			name: core.LANGCHAIN_INTEGRATION_NAME,
			setupOnce() {
				instrumentLangChain(options);
			}
		};
	});
	const langChainIntegration = core.defineIntegration(_langChainIntegration);
	exports.instrumentLangChain = instrumentLangChain;
	exports.langChainIntegration = langChainIntegration;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/langgraph/instrumentation.js
var require_instrumentation = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const instrumentation = require_src$1();
	const InstrumentationNodeModuleFile = require_InstrumentationNodeModuleFile();
	const core = require_cjs$4();
	const supportedVersions = [">=0.0.0 <2.0.0"];
	var SentryLangGraphInstrumentation = class extends instrumentation.InstrumentationBase {
		constructor(config = {}) {
			super("@sentry/instrumentation-langgraph", core.SDK_VERSION, config);
		}
		/**
		* Initializes the instrumentation by defining the modules to be patched.
		*/
		init() {
			return [new instrumentation.InstrumentationNodeModuleDefinition("@langchain/langgraph", supportedVersions, this._patch.bind(this), (exports$1) => exports$1, [new InstrumentationNodeModuleFile.InstrumentationNodeModuleFile(
				/**
				* In CJS, LangGraph packages re-export from dist/index.cjs files.
				* Patching only the root module sometimes misses the real implementation or
				* gets overwritten when that file is loaded. We add a file-level patch so that
				* _patch runs again on the concrete implementation
				*/
				"@langchain/langgraph/dist/index.cjs",
				supportedVersions,
				this._patch.bind(this),
				(exports$2) => exports$2
			), new InstrumentationNodeModuleFile.InstrumentationNodeModuleFile(
				/**
				* In CJS, the prebuilt submodule re-exports from dist/prebuilt/index.cjs.
				* We add a file-level patch under the main module so that CJS require()
				* of @langchain/langgraph/prebuilt gets patched.
				*/
				"@langchain/langgraph/dist/prebuilt/index.cjs",
				supportedVersions,
				this._patch.bind(this),
				(exports$3) => exports$3
			)]), new instrumentation.InstrumentationNodeModuleDefinition("@langchain/langgraph/prebuilt", supportedVersions, this._patch.bind(this), (exports$4) => exports$4, [new InstrumentationNodeModuleFile.InstrumentationNodeModuleFile(
				/**
				* In CJS, the prebuilt submodule re-exports from dist/prebuilt/index.cjs.
				* We add file-level patches so _patch runs on the concrete implementation.
				*/
				"@langchain/langgraph/dist/prebuilt/index.cjs",
				supportedVersions,
				this._patch.bind(this),
				(exports$5) => exports$5
			)])];
		}
		/**
		* Core patch logic applying instrumentation to the LangGraph module.
		*/
		_patch(exports$6) {
			const genAI = core.getClient()?.getDataCollectionOptions().genAI;
			const options = {
				...this.getConfig(),
				recordInputs: this.getConfig().recordInputs ?? genAI?.inputs ?? false,
				recordOutputs: this.getConfig().recordOutputs ?? genAI?.outputs ?? false
			};
			if (exports$6.StateGraph && typeof exports$6.StateGraph === "function") core.instrumentLangGraph(exports$6.StateGraph.prototype, options);
			if (exports$6.createReactAgent && typeof exports$6.createReactAgent === "function") {
				const originalCreateReactAgent = exports$6.createReactAgent;
				Object.defineProperty(exports$6, "createReactAgent", {
					value: core.instrumentCreateReactAgent(originalCreateReactAgent, options),
					writable: true,
					enumerable: true,
					configurable: true
				});
			}
			return exports$6;
		}
	};
	exports.SentryLangGraphInstrumentation = SentryLangGraphInstrumentation;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/langgraph/index.js
var require_langgraph = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const nodeCore = require_cjs$2();
	const instrumentation = require_instrumentation();
	const instrumentLangGraph = nodeCore.generateInstrumentOnce(core.LANGGRAPH_INTEGRATION_NAME, (options) => new instrumentation.SentryLangGraphInstrumentation(options));
	const _langGraphIntegration = ((options = {}) => {
		return {
			name: core.LANGGRAPH_INTEGRATION_NAME,
			setupOnce() {
				instrumentLangGraph(options);
			}
		};
	});
	const langGraphIntegration = core.defineIntegration(_langGraphIntegration);
	exports.instrumentLangGraph = instrumentLangGraph;
	exports.langGraphIntegration = langGraphIntegration;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/featureFlagShims/launchDarkly.js
var require_launchDarkly = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const launchDarklyIntegrationShim = core.defineIntegration((_options) => {
		if (!core.isBrowser()) core.consoleSandbox(() => {
			console.warn("The launchDarklyIntegration() can only be used in the browser.");
		});
		return { name: "LaunchDarkly" };
	});
	function buildLaunchDarklyFlagUsedHandlerShim() {
		if (!core.isBrowser()) core.consoleSandbox(() => {
			console.warn("The buildLaunchDarklyFlagUsedHandler() can only be used in the browser.");
		});
		return {
			name: "sentry-flag-auditor",
			type: "flag-used",
			synchronous: true,
			method: () => null
		};
	}
	exports.buildLaunchDarklyFlagUsedHandlerShim = buildLaunchDarklyFlagUsedHandlerShim;
	exports.launchDarklyIntegrationShim = launchDarklyIntegrationShim;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/featureFlagShims/openFeature.js
var require_openFeature = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const openFeatureIntegrationShim = core.defineIntegration((_options) => {
		if (!core.isBrowser()) core.consoleSandbox(() => {
			console.warn("The openFeatureIntegration() can only be used in the browser.");
		});
		return { name: "OpenFeature" };
	});
	var OpenFeatureIntegrationHookShim = class {
		/**
		*
		*/
		constructor() {
			if (!core.isBrowser()) core.consoleSandbox(() => {
				console.warn("The OpenFeatureIntegrationHook can only be used in the browser.");
			});
		}
		/**
		*
		*/
		after() {}
		/**
		*
		*/
		error() {}
	};
	exports.OpenFeatureIntegrationHookShim = OpenFeatureIntegrationHookShim;
	exports.openFeatureIntegrationShim = openFeatureIntegrationShim;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/featureFlagShims/statsig.js
var require_statsig = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	exports.statsigIntegrationShim = core.defineIntegration((_options) => {
		if (!core.isBrowser()) core.consoleSandbox(() => {
			console.warn("The statsigIntegration() can only be used in the browser.");
		});
		return { name: "Statsig" };
	});
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/featureFlagShims/unleash.js
var require_unleash = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	exports.unleashIntegrationShim = core.defineIntegration((_options) => {
		if (!core.isBrowser()) core.consoleSandbox(() => {
			console.warn("The unleashIntegration() can only be used in the browser.");
		});
		return { name: "Unleash" };
	});
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/featureFlagShims/growthbook.js
var require_growthbook = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	exports.growthbookIntegrationShim = require_cjs$4().growthbookIntegration;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/firebase/otel/patches/firestore.js
var require_firestore = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const net = __require("node:net");
	const instrumentation = require_src$1();
	const InstrumentationNodeModuleFile = require_InstrumentationNodeModuleFile();
	const semanticConventions = require_src$3();
	const core = require_cjs$4();
	function patchFirestore(firestoreSupportedVersions, wrap, unwrap) {
		const moduleFirestoreCJS = new instrumentation.InstrumentationNodeModuleDefinition("@firebase/firestore", firestoreSupportedVersions, (moduleExports) => wrapMethods(moduleExports, wrap, unwrap));
		for (const file of [
			"@firebase/firestore/dist/lite/index.node.cjs.js",
			"@firebase/firestore/dist/lite/index.node.mjs.js",
			"@firebase/firestore/dist/lite/index.rn.esm2017.js",
			"@firebase/firestore/dist/lite/index.cjs.js"
		]) moduleFirestoreCJS.files.push(new InstrumentationNodeModuleFile.InstrumentationNodeModuleFile(file, firestoreSupportedVersions, (moduleExports) => wrapMethods(moduleExports, wrap, unwrap), (moduleExports) => unwrapMethods(moduleExports, unwrap)));
		return moduleFirestoreCJS;
	}
	function wrapMethods(moduleExports, wrap, unwrap) {
		unwrapMethods(moduleExports, unwrap);
		wrap(moduleExports, "addDoc", patchAddDoc());
		wrap(moduleExports, "getDocs", patchGetDocs());
		wrap(moduleExports, "setDoc", patchSetDoc());
		wrap(moduleExports, "deleteDoc", patchDeleteDoc());
		return moduleExports;
	}
	function unwrapMethods(moduleExports, unwrap) {
		for (const method of [
			"addDoc",
			"getDocs",
			"setDoc",
			"deleteDoc"
		]) if (instrumentation.isWrapped(moduleExports[method])) unwrap(moduleExports, method);
		return moduleExports;
	}
	function patchAddDoc() {
		return function addDoc(original) {
			return function(reference, data) {
				return startFirestoreSpan("addDoc", reference, () => original(reference, data));
			};
		};
	}
	function patchDeleteDoc() {
		return function deleteDoc(original) {
			return function(reference) {
				return startFirestoreSpan("deleteDoc", reference.parent || reference, () => original(reference));
			};
		};
	}
	function patchGetDocs() {
		return function getDocs(original) {
			return function(reference) {
				return startFirestoreSpan("getDocs", reference, () => original(reference));
			};
		};
	}
	function patchSetDoc() {
		return function setDoc(original) {
			return function(reference, data, options) {
				return startFirestoreSpan("setDoc", reference.parent || reference, () => {
					return typeof options !== "undefined" ? original(reference, data, options) : original(reference, data);
				});
			};
		};
	}
	function startFirestoreSpan(spanName, reference, callback) {
		return core.startSpan({
			name: `${spanName} ${reference.path}`,
			op: "db.query",
			kind: core.SPAN_KIND.CLIENT,
			attributes: {
				[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.firebase.otel.firestore",
				[semanticConventions.ATTR_DB_OPERATION_NAME]: spanName,
				...buildAttributes(reference)
			}
		}, callback);
	}
	function getPortAndAddress(settings) {
		let address;
		let port;
		if (typeof settings.host === "string") if (settings.host.startsWith("[")) {
			if (settings.host.endsWith("]")) address = settings.host.replace(/^\[|\]$/g, "");
			else if (settings.host.includes("]:")) {
				const lastColonIndex = settings.host.lastIndexOf(":");
				if (lastColonIndex !== -1) {
					address = settings.host.slice(1, lastColonIndex).replace(/^\[|\]$/g, "");
					port = settings.host.slice(lastColonIndex + 1);
				}
			}
		} else if (net.isIPv6(settings.host)) address = settings.host;
		else {
			const lastColonIndex = settings.host.lastIndexOf(":");
			if (lastColonIndex !== -1) {
				address = settings.host.slice(0, lastColonIndex);
				port = settings.host.slice(lastColonIndex + 1);
			} else address = settings.host;
		}
		return {
			address,
			port: port ? parseInt(port, 10) : void 0
		};
	}
	function buildAttributes(reference) {
		const firestoreApp = reference.firestore.app;
		const firestoreOptions = firestoreApp.options;
		const settings = (reference.firestore.toJSON() || {}).settings || {};
		const attributes = {
			[semanticConventions.ATTR_DB_COLLECTION_NAME]: reference.path,
			[semanticConventions.ATTR_DB_NAMESPACE]: firestoreApp.name,
			[semanticConventions.ATTR_DB_SYSTEM_NAME]: "firebase.firestore",
			"firebase.firestore.type": reference.type,
			"firebase.firestore.options.projectId": firestoreOptions.projectId,
			"firebase.firestore.options.appId": firestoreOptions.appId,
			"firebase.firestore.options.messagingSenderId": firestoreOptions.messagingSenderId,
			"firebase.firestore.options.storageBucket": firestoreOptions.storageBucket
		};
		const { address, port } = getPortAndAddress(settings);
		if (address) attributes[semanticConventions.ATTR_SERVER_ADDRESS] = address;
		if (port) attributes[semanticConventions.ATTR_SERVER_PORT] = port;
		return attributes;
	}
	exports.getPortAndAddress = getPortAndAddress;
	exports.patchFirestore = patchFirestore;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/firebase/otel/patches/functions.js
var require_functions = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const instrumentation = require_src$1();
	const InstrumentationNodeModuleFile = require_InstrumentationNodeModuleFile();
	const core = require_cjs$4();
	function patchFunctions(functionsSupportedVersions, wrap, unwrap) {
		const moduleFunctionsCJS = new instrumentation.InstrumentationNodeModuleDefinition("firebase-functions", functionsSupportedVersions);
		[
			{
				name: "firebase-functions/lib/v2/providers/https.js",
				triggerType: "function"
			},
			{
				name: "firebase-functions/lib/v2/providers/firestore.js",
				triggerType: "firestore"
			},
			{
				name: "firebase-functions/lib/v2/providers/scheduler.js",
				triggerType: "scheduler"
			},
			{
				name: "firebase-functions/lib/v2/storage.js",
				triggerType: "storage"
			}
		].forEach(({ name, triggerType }) => {
			moduleFunctionsCJS.files.push(new InstrumentationNodeModuleFile.InstrumentationNodeModuleFile(name, functionsSupportedVersions, (moduleExports) => wrapCommonFunctions(moduleExports, wrap, unwrap, triggerType), (moduleExports) => unwrapCommonFunctions(moduleExports, unwrap)));
		});
		return moduleFunctionsCJS;
	}
	function patchV2Functions(triggerType) {
		return function v2FunctionsWrapper(original) {
			return function(...args) {
				const handler = typeof args[0] === "function" ? args[0] : args[1];
				const documentOrOptions = typeof args[0] === "function" ? void 0 : args[0];
				if (!handler) return original.call(this, ...args);
				const wrappedHandler = async function(...handlerArgs) {
					const functionName = process.env.FUNCTION_TARGET || process.env.K_SERVICE || "unknown";
					const attributes = {
						[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.firebase.otel.functions",
						"faas.name": functionName,
						"faas.trigger": triggerType,
						"faas.provider": "firebase"
					};
					if (process.env.GCLOUD_PROJECT) attributes["cloud.project_id"] = process.env.GCLOUD_PROJECT;
					if (process.env.EVENTARC_CLOUD_EVENT_SOURCE) attributes["cloud.event_source"] = process.env.EVENTARC_CLOUD_EVENT_SOURCE;
					return core.startSpanManual({
						name: `firebase.function.${triggerType}`,
						op: "http.request",
						kind: core.SPAN_KIND.SERVER,
						attributes
					}, async (span) => {
						try {
							const result = await handler.apply(this, handlerArgs);
							span.end();
							return result;
						} catch (error) {
							span.setStatus({ code: core.SPAN_STATUS_ERROR });
							core.captureException(error, { mechanism: {
								type: "auto.firebase.otel.functions",
								handled: false
							} });
							span.end();
							await core.flush(2e3);
							throw error;
						}
					});
				};
				if (documentOrOptions) return original.call(this, documentOrOptions, wrappedHandler);
				else return original.call(this, wrappedHandler);
			};
		};
	}
	function wrapCommonFunctions(moduleExports, wrap, unwrap, triggerType) {
		unwrapCommonFunctions(moduleExports, unwrap);
		switch (triggerType) {
			case "function":
				wrap(moduleExports, "onRequest", patchV2Functions("http.request"));
				wrap(moduleExports, "onCall", patchV2Functions("http.call"));
				break;
			case "firestore":
				wrap(moduleExports, "onDocumentCreated", patchV2Functions("firestore.document.created"));
				wrap(moduleExports, "onDocumentUpdated", patchV2Functions("firestore.document.updated"));
				wrap(moduleExports, "onDocumentDeleted", patchV2Functions("firestore.document.deleted"));
				wrap(moduleExports, "onDocumentWritten", patchV2Functions("firestore.document.written"));
				wrap(moduleExports, "onDocumentCreatedWithAuthContext", patchV2Functions("firestore.document.created"));
				wrap(moduleExports, "onDocumentUpdatedWithAuthContext", patchV2Functions("firestore.document.updated"));
				wrap(moduleExports, "onDocumentDeletedWithAuthContext", patchV2Functions("firestore.document.deleted"));
				wrap(moduleExports, "onDocumentWrittenWithAuthContext", patchV2Functions("firestore.document.written"));
				break;
			case "scheduler":
				wrap(moduleExports, "onSchedule", patchV2Functions("scheduler.scheduled"));
				break;
			case "storage":
				wrap(moduleExports, "onObjectFinalized", patchV2Functions("storage.object.finalized"));
				wrap(moduleExports, "onObjectArchived", patchV2Functions("storage.object.archived"));
				wrap(moduleExports, "onObjectDeleted", patchV2Functions("storage.object.deleted"));
				wrap(moduleExports, "onObjectMetadataUpdated", patchV2Functions("storage.object.metadataUpdated"));
				break;
		}
		return moduleExports;
	}
	function unwrapCommonFunctions(moduleExports, unwrap) {
		for (const method of [
			"onSchedule",
			"onRequest",
			"onCall",
			"onObjectFinalized",
			"onObjectArchived",
			"onObjectDeleted",
			"onObjectMetadataUpdated",
			"onDocumentCreated",
			"onDocumentUpdated",
			"onDocumentDeleted",
			"onDocumentWritten",
			"onDocumentCreatedWithAuthContext",
			"onDocumentUpdatedWithAuthContext",
			"onDocumentDeletedWithAuthContext",
			"onDocumentWrittenWithAuthContext"
		]) if (instrumentation.isWrapped(moduleExports[method])) unwrap(moduleExports, method);
		return moduleExports;
	}
	exports.patchFunctions = patchFunctions;
	exports.patchV2Functions = patchV2Functions;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/firebase/otel/firebaseInstrumentation.js
var require_firebaseInstrumentation = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const instrumentation = require_src$1();
	const core = require_cjs$4();
	const firestore = require_firestore();
	const functions = require_functions();
	const firestoreSupportedVersions = [">=3.0.0 <5"];
	const functionsSupportedVersions = [">=6.0.0 <7"];
	var FirebaseInstrumentation = class extends instrumentation.InstrumentationBase {
		constructor(config = {}) {
			super("@sentry/instrumentation-firebase", core.SDK_VERSION, config);
		}
		/**
		*
		* @protected
		*/
		init() {
			const modules = [];
			modules.push(firestore.patchFirestore(firestoreSupportedVersions, this._wrap, this._unwrap));
			modules.push(functions.patchFunctions(functionsSupportedVersions, this._wrap, this._unwrap));
			return modules;
		}
	};
	exports.FirebaseInstrumentation = FirebaseInstrumentation;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/firebase/firebase.js
var require_firebase = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const nodeCore = require_cjs$2();
	const firebaseInstrumentation = require_firebaseInstrumentation();
	const INTEGRATION_NAME = "Firebase";
	const instrumentFirebase = nodeCore.generateInstrumentOnce(INTEGRATION_NAME, () => new firebaseInstrumentation.FirebaseInstrumentation());
	const _firebaseIntegration = (() => {
		return {
			name: INTEGRATION_NAME,
			setupOnce() {
				instrumentFirebase();
			}
		};
	});
	exports.firebaseIntegration = core.defineIntegration(_firebaseIntegration);
	exports.instrumentFirebase = instrumentFirebase;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/integrations/tracing/index.js
var require_tracing = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const http = require_http();
	const index$g = require_amqplib();
	const index$k = require_anthropic_ai();
	const index = require_connect();
	const express = require_express();
	const index$1 = require_fastify();
	const firebase = require_firebase();
	const index$f = require_genericPool();
	const index$l = require_google_genai();
	const index$c = require_graphql();
	const index$2 = require_hapi();
	const index$3 = require_hono();
	const index$4 = require_kafka();
	const index$5 = require_koa();
	const index$h = require_langchain();
	const index$m = require_langgraph();
	const index$6 = require_lrumemoizer();
	const index$7 = require_mongo();
	const index$8 = require_mongoose();
	const index$9 = require_mysql$1();
	const index$a = require_mysql2();
	const index$j = require_openai();
	const index$b = require_postgres();
	const postgresjs = require_postgresjs();
	const index$n = require_prisma();
	const index$d = require_redis();
	const index$e = require_tedious();
	const index$i = require_vercelai();
	function getAutoPerformanceIntegrations() {
		return [
			express.expressIntegration(),
			index$1.fastifyIntegration(),
			index$c.graphqlIntegration(),
			index$3.honoIntegration(),
			index$7.mongoIntegration(),
			index$8.mongooseIntegration(),
			index$9.mysqlIntegration(),
			index$a.mysql2Integration(),
			index$d.redisIntegration(),
			index$b.postgresIntegration(),
			index$n.prismaIntegration(),
			index$2.hapiIntegration(),
			index$5.koaIntegration(),
			index.connectIntegration(),
			index$e.tediousIntegration(),
			index$f.genericPoolIntegration(),
			index$4.kafkaIntegration(),
			index$g.amqplibIntegration(),
			index$6.lruMemoizerIntegration(),
			index$h.langChainIntegration(),
			index$m.langGraphIntegration(),
			index$i.vercelAIIntegration(),
			index$j.openAIIntegration(),
			index$k.anthropicAIIntegration(),
			index$l.googleGenAIIntegration(),
			postgresjs.postgresJsIntegration(),
			firebase.firebaseIntegration()
		];
	}
	function getOpenTelemetryInstrumentationToPreload() {
		return [
			http.instrumentSentryHttp,
			express.instrumentExpress,
			index.instrumentConnect,
			index$1.instrumentFastify,
			index$1.instrumentFastifyV3,
			index$2.instrumentHapi,
			index$3.instrumentHono,
			index$4.instrumentKafka,
			index$5.instrumentKoa,
			index$6.instrumentLruMemoizer,
			index$7.instrumentMongo,
			index$8.instrumentMongoose,
			index$9.instrumentMysql,
			index$a.instrumentMysql2,
			index$b.instrumentPostgres,
			index$2.instrumentHapi,
			index$c.instrumentGraphql,
			index$d.instrumentRedis,
			index$e.instrumentTedious,
			index$f.instrumentGenericPool,
			index$g.instrumentAmqplib,
			index$h.instrumentLangChain,
			index$i.instrumentVercelAi,
			index$j.instrumentOpenAi,
			postgresjs.instrumentPostgresJs,
			firebase.instrumentFirebase,
			index$k.instrumentAnthropicAi,
			index$l.instrumentGoogleGenAI,
			index$m.instrumentLangGraph
		];
	}
	exports.getAutoPerformanceIntegrations = getAutoPerformanceIntegrations;
	exports.getOpenTelemetryInstrumentationToPreload = getOpenTelemetryInstrumentationToPreload;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/sdk/diagnosticsChannelInjection.js
var require_diagnosticsChannelInjection = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	let loader;
	let cached;
	function setDiagnosticsChannelInjectionLoader(load) {
		loader = load;
	}
	function isDiagnosticsChannelInjectionEnabled() {
		return !!loader;
	}
	function resolveDiagnosticsChannelInjection() {
		if (!loader) return;
		return cached ?? (cached = loader());
	}
	exports.isDiagnosticsChannelInjectionEnabled = isDiagnosticsChannelInjectionEnabled;
	exports.resolveDiagnosticsChannelInjection = resolveDiagnosticsChannelInjection;
	exports.setDiagnosticsChannelInjectionLoader = setDiagnosticsChannelInjectionLoader;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/sdk/initOtel.js
var require_initOtel = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const api = require_src();
	const sdkTraceBase = require_src$4();
	const core = require_cjs$4();
	const nodeCore = require_cjs$2();
	const opentelemetry = require_cjs$3();
	const debugBuild = require_debug_build$2();
	const index = require_tracing();
	const MAX_MAX_SPAN_WAIT_DURATION = 1e6;
	function initOpenTelemetry(client, options = {}) {
		if (client.getOptions().debug) nodeCore.setupOpenTelemetryLogger();
		const [provider, asyncLocalStorageLookup] = setupOtel(client, options);
		client.traceProvider = provider;
		client.asyncLocalStorageLookup = asyncLocalStorageLookup;
	}
	function preloadOpenTelemetry(options = {}) {
		const { debug } = options;
		if (debug) core.debug.enable();
		nodeCore.initializeEsmLoader();
		getPreloadMethods(options.integrations).forEach((fn) => {
			fn();
			if (debug) core.debug.log(`[Sentry] Preloaded ${fn.id} instrumentation`);
		});
	}
	function getPreloadMethods(integrationNames) {
		const instruments = index.getOpenTelemetryInstrumentationToPreload();
		if (!integrationNames) return instruments;
		return instruments.filter((instrumentation) => {
			const id = instrumentation.id;
			return integrationNames.some((integrationName) => id === integrationName || id.startsWith(`${integrationName}.`));
		});
	}
	function setupOtel(client, options = {}) {
		const provider = new sdkTraceBase.BasicTracerProvider({
			sampler: new opentelemetry.SentrySampler(client),
			resource: opentelemetry.getSentryResource("node"),
			forceFlushTimeoutMillis: 500,
			spanProcessors: [new opentelemetry.SentrySpanProcessor({
				timeout: _clampSpanProcessorTimeout(client.getOptions().maxSpanWaitDuration),
				client
			}), ...options.spanProcessors || []]
		});
		api.trace.setGlobalTracerProvider(provider);
		api.propagation.setGlobalPropagator(new opentelemetry.SentryPropagator());
		const ctxManager = new nodeCore.SentryContextManager();
		api.context.setGlobalContextManager(ctxManager);
		return [provider, ctxManager.getAsyncLocalStorageLookup()];
	}
	function _clampSpanProcessorTimeout(maxSpanWaitDuration) {
		if (maxSpanWaitDuration == null) return;
		if (maxSpanWaitDuration > MAX_MAX_SPAN_WAIT_DURATION) {
			debugBuild.DEBUG_BUILD && core.debug.warn(`\`maxSpanWaitDuration\` is too high, using the maximum value of ${MAX_MAX_SPAN_WAIT_DURATION}`);
			return MAX_MAX_SPAN_WAIT_DURATION;
		} else if (maxSpanWaitDuration <= 0 || Number.isNaN(maxSpanWaitDuration)) {
			debugBuild.DEBUG_BUILD && core.debug.warn("`maxSpanWaitDuration` must be a positive number, using default value instead.");
			return;
		}
		return maxSpanWaitDuration;
	}
	exports._clampSpanProcessorTimeout = _clampSpanProcessorTimeout;
	exports.initOpenTelemetry = initOpenTelemetry;
	exports.preloadOpenTelemetry = preloadOpenTelemetry;
	exports.setupOtel = setupOtel;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/sdk/index.js
var require_sdk = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const nodeCore = require_cjs$2();
	const http = require_http();
	const index$1 = require_node_fetch();
	const index = require_tracing();
	const diagnosticsChannelInjection = require_diagnosticsChannelInjection();
	const initOtel = require_initOtel();
	function getDefaultIntegrationsWithoutPerformance() {
		return nodeCore.getDefaultIntegrations().filter((integration) => integration.name !== "Http" && integration.name !== "NodeFetch").concat(http.httpIntegration(), index$1.nativeNodeFetchIntegration());
	}
	function getDefaultIntegrations(options) {
		const integrations = [...getDefaultIntegrationsWithoutPerformance(), ...core.hasSpansEnabled(options) ? index.getAutoPerformanceIntegrations() : []];
		if (diagnosticsChannelInjection.isDiagnosticsChannelInjectionEnabled() && core.hasSpansEnabled(options)) {
			const diagnosticsChannelInjection$1 = diagnosticsChannelInjection.resolveDiagnosticsChannelInjection();
			if (diagnosticsChannelInjection$1) {
				const replaced = new Set(diagnosticsChannelInjection$1.replacedOtelIntegrationNames);
				return [...integrations.filter((i) => !replaced.has(i.name)), ...diagnosticsChannelInjection$1.integrations];
			}
		}
		return integrations;
	}
	function init(options = {}) {
		return _init(options, getDefaultIntegrations);
	}
	function _init(options = {}, getDefaultIntegrationsImpl) {
		core.applySdkMetadata(options, "node");
		const diagnosticsChannelInjection$1 = diagnosticsChannelInjection.isDiagnosticsChannelInjectionEnabled() && core.hasSpansEnabled(options) ? diagnosticsChannelInjection.resolveDiagnosticsChannelInjection() : void 0;
		if (diagnosticsChannelInjection$1) diagnosticsChannelInjection$1.register();
		const client = nodeCore.init({
			...options,
			defaultIntegrations: options.defaultIntegrations ?? getDefaultIntegrationsImpl(options)
		});
		if (client && !options.skipOpenTelemetrySetup) {
			initOtel.initOpenTelemetry(client, { spanProcessors: options.openTelemetrySpanProcessors });
			nodeCore.validateOpenTelemetrySetup();
		}
		if (diagnosticsChannelInjection$1) diagnosticsChannelInjection$1.detect();
		return client;
	}
	function initWithoutDefaultIntegrations(options = {}) {
		return _init(options, () => []);
	}
	exports.getDefaultIntegrations = getDefaultIntegrations;
	exports.getDefaultIntegrationsWithoutPerformance = getDefaultIntegrationsWithoutPerformance;
	exports.init = init;
	exports.initWithoutDefaultIntegrations = initWithoutDefaultIntegrations;
}));
//#endregion
//#region node_modules/@sentry/server-utils/build/cjs/orchestrion/detect.js
var require_detect = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const debugBuild = require_debug_build$1();
	function detectOrchestrionSetup() {
		if (!debugBuild.DEBUG_BUILD) return;
		const marker = globalThis.__SENTRY_ORCHESTRION__;
		const runtime = !!marker?.runtime;
		const bundler = !!marker?.bundler;
		debugBuild.DEBUG_BUILD && core.debug.log(`[orchestrion] detect: runtime=${runtime} bundler=${bundler}`);
		if (!runtime && !bundler) debugBuild.DEBUG_BUILD && core.debug.warn("[Sentry] No diagnostics-channel injection detected. Channel-based integrations (mysql, …) will not record spans. Make sure the diagnostics channels are injected via the runtime `--import` hook or a bundler plugin before the instrumented modules load.");
	}
	exports.detectOrchestrionSetup = detectOrchestrionSetup;
}));
//#endregion
//#region node_modules/@sentry/server-utils/build/cjs/orchestrion/channels.js
var require_channels = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	exports.CHANNELS = { MYSQL_QUERY: "orchestrion:mysql:query" };
}));
//#endregion
//#region node_modules/@sentry/server-utils/build/cjs/integrations/tracing-channel/mysql.js
var require_mysql = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const dc = __require("node:diagnostics_channel");
	const core = require_cjs$4();
	const debugBuild = require_debug_build$1();
	const channels = require_channels();
	const INTEGRATION_NAME = "Mysql";
	const ATTR_DB_SYSTEM = "db.system";
	const ATTR_DB_CONNECTION_STRING = "db.connection_string";
	const ATTR_DB_NAME = "db.name";
	const ATTR_DB_USER = "db.user";
	const ATTR_DB_STATEMENT = "db.statement";
	const ATTR_NET_PEER_NAME = "net.peer.name";
	const ATTR_NET_PEER_PORT = "net.peer.port";
	const _mysqlChannelIntegration = (() => {
		return {
			name: INTEGRATION_NAME,
			setupOnce() {
				debugBuild.DEBUG_BUILD && core.debug.log(`[orchestrion:mysql] subscribing to channel "${channels.CHANNELS.MYSQL_QUERY}"`);
				const queryCh = dc.tracingChannel(channels.CHANNELS.MYSQL_QUERY);
				const spans = /* @__PURE__ */ new WeakMap();
				const parentScopes = /* @__PURE__ */ new WeakMap();
				queryCh.subscribe({
					start(rawCtx) {
						const ctx = rawCtx;
						const sql = extractSql(ctx.arguments[0]);
						const { host, port, database, user } = getConnectionConfig(ctx.self);
						const portNumber = typeof port === "string" ? parseInt(port, 10) : port;
						const portIsNumber = typeof portNumber === "number" && !isNaN(portNumber);
						const span = core.startInactiveSpan({
							name: sql ?? "mysql.query",
							op: "db",
							attributes: {
								[ATTR_DB_SYSTEM]: "mysql",
								[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.db.orchestrion.mysql",
								[ATTR_DB_CONNECTION_STRING]: getJDBCString(host, portIsNumber ? portNumber : void 0, database),
								...database ? { [ATTR_DB_NAME]: database } : {},
								...user ? { [ATTR_DB_USER]: user } : {},
								...sql ? { [ATTR_DB_STATEMENT]: sql } : {},
								...host ? { [ATTR_NET_PEER_NAME]: host } : {},
								...portIsNumber ? { [ATTR_NET_PEER_PORT]: portNumber } : {}
							}
						});
						spans.set(rawCtx, span);
						const scope = core.getCurrentScope();
						parentScopes.set(rawCtx, scope);
						if (ctx.arguments.length > 0) {
							const cbIdx = ctx.arguments.length - 1;
							const orchestrionWrappedCb = ctx.arguments[cbIdx];
							if (typeof orchestrionWrappedCb === "function") {
								const wrapped = orchestrionWrappedCb;
								ctx.arguments[cbIdx] = function(...args) {
									return core.withScope(scope, () => wrapped.apply(this, args));
								};
							}
						}
					},
					end(rawCtx) {
						const ctx = rawCtx;
						if (ctx.error !== void 0) {
							finishSpan(rawCtx);
							return;
						}
						const result = ctx.result;
						if (result && typeof result === "object" && hasOnMethod(result)) {
							const span = spans.get(rawCtx);
							if (!span) return;
							const parentScope = parentScopes.get(rawCtx);
							if (parentScope) core.bindScopeToEmitter(result, parentScope);
							result.on("error", (err) => {
								span.setStatus({
									code: core.SPAN_STATUS_ERROR,
									message: err instanceof Error ? err.message : "unknown_error"
								});
								finishSpan(rawCtx);
							});
							result.on("end", () => finishSpan(rawCtx));
							return;
						}
					},
					error(rawCtx) {
						const ctx = rawCtx;
						const span = spans.get(rawCtx);
						if (!span) return;
						span.setStatus({
							code: core.SPAN_STATUS_ERROR,
							message: ctx.error instanceof Error ? ctx.error.message : "unknown_error"
						});
					},
					asyncStart() {},
					asyncEnd(rawCtx) {
						finishSpan(rawCtx);
					}
				});
				function finishSpan(rawCtx) {
					const span = spans.get(rawCtx);
					if (!span) return;
					span.end();
					spans.delete(rawCtx);
					parentScopes.delete(rawCtx);
				}
			}
		};
	});
	function hasOnMethod(obj) {
		return "on" in obj && typeof obj.on === "function";
	}
	function extractSql(firstArg) {
		if (typeof firstArg === "string") return firstArg;
		if (firstArg && typeof firstArg === "object" && "sql" in firstArg) {
			const sql = firstArg.sql;
			return typeof sql === "string" ? sql : void 0;
		}
	}
	function getConnectionConfig(connection) {
		const config = connection?.config?.connectionConfig ?? connection?.config ?? {};
		return {
			host: config.host,
			port: config.port,
			database: config.database,
			user: config.user
		};
	}
	function getJDBCString(host, port, database) {
		let s = `jdbc:mysql://${host || "localhost"}`;
		if (typeof port === "number") s += `:${port}`;
		if (database) s += `/${database}`;
		return s;
	}
	exports.mysqlChannelIntegration = core.defineIntegration(_mysqlChannelIntegration);
}));
//#endregion
//#region node_modules/@sentry/server-utils/build/cjs/orchestrion/index.js
var require_orchestrion = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const detect = require_detect();
	const mysql = require_mysql();
	exports.detectOrchestrionSetup = detect.detectOrchestrionSetup;
	exports.mysqlChannelIntegration = mysql.mysqlChannelIntegration;
}));
//#endregion
//#region node_modules/@sentry/server-utils/build/cjs/orchestrion/config.js
var require_config = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const SENTRY_INSTRUMENTATIONS = [{
		channelName: "query",
		module: {
			name: "mysql",
			versionRange: ">=2.0.0 <3",
			filePath: "lib/Connection.js"
		},
		functionQuery: {
			expressionName: "query",
			kind: "Auto"
		}
	}];
	const INSTRUMENTED_MODULE_NAMES = Array.from(new Set(SENTRY_INSTRUMENTATIONS.map((i) => i.module.name)));
	function withoutInstrumentedExternals(external) {
		if (!external) return;
		return external.filter((entry) => !INSTRUMENTED_MODULE_NAMES.some((name) => entry === name || entry.startsWith(`${name}/`)));
	}
	exports.INSTRUMENTED_MODULE_NAMES = INSTRUMENTED_MODULE_NAMES;
	exports.SENTRY_INSTRUMENTATIONS = SENTRY_INSTRUMENTATIONS;
	exports.withoutInstrumentedExternals = withoutInstrumentedExternals;
}));
//#endregion
//#region node_modules/@sentry/server-utils/build/cjs/orchestrion/runtime/register.js
var require_register = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const Module = __require("node:module");
	const node_url = __require("node:url");
	const debugBuild = require_debug_build$1();
	const config = require_config();
	var _documentCurrentScript = typeof document !== "undefined" ? document.currentScript : null;
	function registerDiagnosticsChannelInjection() {
		const g = globalThis.__SENTRY_ORCHESTRION__ ?? (globalThis.__SENTRY_ORCHESTRION__ = {});
		if (g.runtime || g.bundler) return;
		const globalAny = globalThis;
		const parseVersion = (v) => v.split(".").map((n) => parseInt(n, 10));
		const nodeVersion = parseVersion(process.versions.node ?? "0.0.0");
		const denoVersion = parseVersion(globalAny.Deno?.version?.deno ?? "0.0.0");
		const stableSyncHooks = (nodeVersion[0] ?? 0) > 25 || nodeVersion[0] === 25 && (nodeVersion[1] ?? 0) >= 1 || nodeVersion[0] === 24 && (nodeVersion[1] ?? 0) >= 13 || (denoVersion[0] ?? 0) > 2 || denoVersion[0] === 2 && (denoVersion[1] ?? 0) >= 8;
		const nodeRequire = typeof __require === "function" ? __require : Module.createRequire(typeof document === "undefined" ? __require("url").pathToFileURL(__filename).href : _documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === "SCRIPT" && _documentCurrentScript.src || new URL("orchestrion/runtime/register.js", document.baseURI).href);
		const mod = Module;
		try {
			if (typeof mod.registerHooks === "function" && stableSyncHooks) {
				const { initialize, resolve, load } = nodeRequire("@apm-js-collab/tracing-hooks/hook-sync.mjs");
				initialize({ instrumentations: config.SENTRY_INSTRUMENTATIONS });
				mod.registerHooks({
					resolve,
					load
				});
				debugBuild.DEBUG_BUILD && core.debug.log("[orchestrion] registered diagnostics-channel injection via Module.registerHooks()");
			} else if (typeof mod.register === "function" && !globalAny.Bun && !globalAny.Deno) {
				mod.register(node_url.pathToFileURL(nodeRequire.resolve("@apm-js-collab/tracing-hooks/hook.mjs")).href, { data: { instrumentations: config.SENTRY_INSTRUMENTATIONS } });
				new (nodeRequire("@apm-js-collab/tracing-hooks"))({ instrumentations: config.SENTRY_INSTRUMENTATIONS }).patch();
				debugBuild.DEBUG_BUILD && core.debug.log("[orchestrion] registered diagnostics-channel injection via Module.register()");
			} else {
				debugBuild.DEBUG_BUILD && core.debug.warn("[Sentry] No available Node API to register diagnostics-channel injection hooks; skipping.");
				return;
			}
		} catch (error) {
			debugBuild.DEBUG_BUILD && core.debug.warn("[Sentry] Failed to register diagnostics-channel injection hooks; channel-based integrations will not record spans.", error);
			return;
		}
		g.runtime = true;
	}
	exports.registerDiagnosticsChannelInjection = registerDiagnosticsChannelInjection;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/sdk/experimentalUseDiagnosticsChannelInjection.js
var require_experimentalUseDiagnosticsChannelInjection = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const orchestrion = require_orchestrion();
	const register = require_register();
	const diagnosticsChannelInjection = require_diagnosticsChannelInjection();
	function experimentalUseDiagnosticsChannelInjection() {
		diagnosticsChannelInjection.setDiagnosticsChannelInjectionLoader(() => ({
			integrations: [orchestrion.mysqlChannelIntegration()],
			replacedOtelIntegrationNames: ["Mysql"],
			register: register.registerDiagnosticsChannelInjection,
			detect: orchestrion.detectOrchestrionSetup
		}));
	}
	exports.experimentalUseDiagnosticsChannelInjection = experimentalUseDiagnosticsChannelInjection;
}));
//#endregion
//#region node_modules/@sentry/node/build/cjs/index.js
var require_cjs = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const http = require_http();
	const index$n = require_node_fetch();
	const index$5 = require_fs();
	const express = require_express();
	const index$4 = require_fastify();
	const index$a = require_graphql();
	const index$d = require_kafka();
	const index$i = require_lrumemoizer();
	const index$j = require_mongo();
	const index$k = require_mongoose();
	const index$m = require_mysql$1();
	const index$l = require_mysql2();
	const index$r = require_redis();
	const index$p = require_postgres();
	const postgresjs = require_postgresjs();
	const index$q = require_prisma();
	const index$b = require_hapi();
	const index$c = require_hono();
	const index$f = require_koa();
	const index$2 = require_connect();
	const index$e = require_knex();
	const index$s = require_tedious();
	const index$6 = require_genericPool();
	const index$3 = require_dataloader();
	const index = require_amqplib();
	const index$t = require_vercelai();
	const index$o = require_openai();
	const index$1 = require_anthropic_ai();
	const index$9 = require_google_genai();
	const index$g = require_langchain();
	const index$h = require_langgraph();
	const launchDarkly = require_launchDarkly();
	const openFeature = require_openFeature();
	const statsig = require_statsig();
	const unleash = require_unleash();
	const growthbook = require_growthbook();
	const firebase = require_firebase();
	const index$8 = require_sdk();
	const experimentalUseDiagnosticsChannelInjection = require_experimentalUseDiagnosticsChannelInjection();
	const initOtel = require_initOtel();
	const index$7 = require_tracing();
	const opentelemetry = require_cjs$3();
	const core = require_cjs$4();
	const nodeCore = require_cjs$2();
	exports.httpIntegration = http.httpIntegration;
	exports.nativeNodeFetchIntegration = index$n.nativeNodeFetchIntegration;
	exports.fsIntegration = index$5.fsIntegration;
	exports.expressIntegration = express.expressIntegration;
	exports.setupExpressErrorHandler = express.setupExpressErrorHandler;
	exports.fastifyIntegration = index$4.fastifyIntegration;
	exports.setupFastifyErrorHandler = index$4.setupFastifyErrorHandler;
	exports.graphqlIntegration = index$a.graphqlIntegration;
	exports.kafkaIntegration = index$d.kafkaIntegration;
	exports.lruMemoizerIntegration = index$i.lruMemoizerIntegration;
	exports.mongoIntegration = index$j.mongoIntegration;
	exports.mongooseIntegration = index$k.mongooseIntegration;
	exports.mysqlIntegration = index$m.mysqlIntegration;
	exports.mysql2Integration = index$l.mysql2Integration;
	exports.redisIntegration = index$r.redisIntegration;
	exports.postgresIntegration = index$p.postgresIntegration;
	exports.postgresJsIntegration = postgresjs.postgresJsIntegration;
	exports.prismaIntegration = index$q.prismaIntegration;
	exports.hapiIntegration = index$b.hapiIntegration;
	exports.setupHapiErrorHandler = index$b.setupHapiErrorHandler;
	exports.honoIntegration = index$c.honoIntegration;
	exports.setupHonoErrorHandler = index$c.setupHonoErrorHandler;
	exports.koaIntegration = index$f.koaIntegration;
	exports.setupKoaErrorHandler = index$f.setupKoaErrorHandler;
	exports.connectIntegration = index$2.connectIntegration;
	exports.setupConnectErrorHandler = index$2.setupConnectErrorHandler;
	exports.knexIntegration = index$e.knexIntegration;
	exports.tediousIntegration = index$s.tediousIntegration;
	exports.genericPoolIntegration = index$6.genericPoolIntegration;
	exports.dataloaderIntegration = index$3.dataloaderIntegration;
	exports.amqplibIntegration = index.amqplibIntegration;
	exports.vercelAIIntegration = index$t.vercelAIIntegration;
	exports.openAIIntegration = index$o.openAIIntegration;
	exports.anthropicAIIntegration = index$1.anthropicAIIntegration;
	exports.googleGenAIIntegration = index$9.googleGenAIIntegration;
	exports.langChainIntegration = index$g.langChainIntegration;
	exports.langGraphIntegration = index$h.langGraphIntegration;
	exports.buildLaunchDarklyFlagUsedHandler = launchDarkly.buildLaunchDarklyFlagUsedHandlerShim;
	exports.launchDarklyIntegration = launchDarkly.launchDarklyIntegrationShim;
	exports.OpenFeatureIntegrationHook = openFeature.OpenFeatureIntegrationHookShim;
	exports.openFeatureIntegration = openFeature.openFeatureIntegrationShim;
	exports.statsigIntegration = statsig.statsigIntegrationShim;
	exports.unleashIntegration = unleash.unleashIntegrationShim;
	exports.growthbookIntegration = growthbook.growthbookIntegrationShim;
	exports.firebaseIntegration = firebase.firebaseIntegration;
	exports.getDefaultIntegrations = index$8.getDefaultIntegrations;
	exports.getDefaultIntegrationsWithoutPerformance = index$8.getDefaultIntegrationsWithoutPerformance;
	exports.init = index$8.init;
	exports.initWithoutDefaultIntegrations = index$8.initWithoutDefaultIntegrations;
	exports.experimentalUseDiagnosticsChannelInjection = experimentalUseDiagnosticsChannelInjection.experimentalUseDiagnosticsChannelInjection;
	exports.initOpenTelemetry = initOtel.initOpenTelemetry;
	exports.preloadOpenTelemetry = initOtel.preloadOpenTelemetry;
	exports.getAutoPerformanceIntegrations = index$7.getAutoPerformanceIntegrations;
	exports.setNodeAsyncContextStrategy = opentelemetry.setOpenTelemetryContextAsyncContextStrategy;
	exports.SDK_VERSION = core.SDK_VERSION;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_OP = core.SEMANTIC_ATTRIBUTE_SENTRY_OP;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN = core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE = core.SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE;
	exports.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE = core.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE;
	exports.Scope = core.Scope;
	exports.addBreadcrumb = core.addBreadcrumb;
	exports.addEventProcessor = core.addEventProcessor;
	exports.addIntegration = core.addIntegration;
	exports.bindScopeToEmitter = core.bindScopeToEmitter;
	exports.captureCheckIn = core.captureCheckIn;
	exports.captureConsoleIntegration = core.captureConsoleIntegration;
	exports.captureEvent = core.captureEvent;
	exports.captureException = core.captureException;
	exports.captureFeedback = core.captureFeedback;
	exports.captureMessage = core.captureMessage;
	exports.captureSession = core.captureSession;
	exports.close = core.close;
	exports.consoleLoggingIntegration = core.consoleLoggingIntegration;
	exports.continueTrace = core.continueTrace;
	exports.createConsolaReporter = core.createConsolaReporter;
	exports.createLangChainCallbackHandler = core.createLangChainCallbackHandler;
	exports.createTransport = core.createTransport;
	exports.dedupeIntegration = core.dedupeIntegration;
	exports.endSession = core.endSession;
	exports.eventFiltersIntegration = core.eventFiltersIntegration;
	exports.expressErrorHandler = core.expressErrorHandler;
	exports.extraErrorDataIntegration = core.extraErrorDataIntegration;
	exports.featureFlagsIntegration = core.featureFlagsIntegration;
	exports.flush = core.flush;
	exports.functionToStringIntegration = core.functionToStringIntegration;
	exports.getActiveSpan = core.getActiveSpan;
	exports.getClient = core.getClient;
	exports.getCurrentScope = core.getCurrentScope;
	exports.getGlobalScope = core.getGlobalScope;
	exports.getIsolationScope = core.getIsolationScope;
	exports.getRootSpan = core.getRootSpan;
	exports.getSpanDescendants = core.getSpanDescendants;
	exports.getSpanStatusFromHttpCode = core.getSpanStatusFromHttpCode;
	exports.getTraceData = core.getTraceData;
	exports.getTraceMetaTags = core.getTraceMetaTags;
	exports.httpHeadersToSpanAttributes = core.httpHeadersToSpanAttributes;
	exports.inboundFiltersIntegration = core.inboundFiltersIntegration;
	exports.instrumentAnthropicAiClient = core.instrumentAnthropicAiClient;
	exports.instrumentGoogleGenAIClient = core.instrumentGoogleGenAIClient;
	exports.instrumentLangChainEmbeddings = core.instrumentLangChainEmbeddings;
	exports.instrumentLangGraph = core.instrumentLangGraph;
	exports.instrumentOpenAiClient = core.instrumentOpenAiClient;
	exports.instrumentStateGraphCompile = core.instrumentStateGraphCompile;
	exports.instrumentSupabaseClient = core.instrumentSupabaseClient;
	exports.isEnabled = core.isEnabled;
	exports.isInitialized = core.isInitialized;
	exports.lastEventId = core.lastEventId;
	exports.linkedErrorsIntegration = core.linkedErrorsIntegration;
	exports.parameterize = core.parameterize;
	exports.profiler = core.profiler;
	exports.requestDataIntegration = core.requestDataIntegration;
	exports.rewriteFramesIntegration = core.rewriteFramesIntegration;
	exports.setAttribute = core.setAttribute;
	exports.setAttributes = core.setAttributes;
	exports.setContext = core.setContext;
	exports.setConversationId = core.setConversationId;
	exports.setCurrentClient = core.setCurrentClient;
	exports.setExtra = core.setExtra;
	exports.setExtras = core.setExtras;
	exports.setHttpStatus = core.setHttpStatus;
	exports.setMeasurement = core.setMeasurement;
	exports.setTag = core.setTag;
	exports.setTags = core.setTags;
	exports.setUser = core.setUser;
	exports.spanStreamingIntegration = core.spanStreamingIntegration;
	exports.spanToBaggageHeader = core.spanToBaggageHeader;
	exports.spanToJSON = core.spanToJSON;
	exports.spanToTraceHeader = core.spanToTraceHeader;
	exports.startInactiveSpan = core.startInactiveSpan;
	exports.startNewTrace = core.startNewTrace;
	exports.startSession = core.startSession;
	exports.startSpan = core.startSpan;
	exports.startSpanManual = core.startSpanManual;
	exports.supabaseIntegration = core.supabaseIntegration;
	exports.suppressTracing = core.suppressTracing;
	exports.trpcMiddleware = core.trpcMiddleware;
	exports.updateSpanName = core.updateSpanName;
	exports.winterCGHeadersToDict = core.winterCGHeadersToDict;
	exports.withActiveSpan = core.withActiveSpan;
	exports.withIsolationScope = core.withIsolationScope;
	exports.withMonitor = core.withMonitor;
	exports.withScope = core.withScope;
	exports.wrapMcpServerWithSentry = core.wrapMcpServerWithSentry;
	exports.zodErrorsIntegration = core.zodErrorsIntegration;
	exports.NODE_VERSION = nodeCore.NODE_VERSION;
	exports.NodeClient = nodeCore.NodeClient;
	exports.SentryContextManager = nodeCore.SentryContextManager;
	exports._INTERNAL_normalizeCollectionInterval = nodeCore._INTERNAL_normalizeCollectionInterval;
	exports.anrIntegration = nodeCore.anrIntegration;
	exports.childProcessIntegration = nodeCore.childProcessIntegration;
	exports.consoleIntegration = nodeCore.consoleIntegration;
	exports.contextLinesIntegration = nodeCore.contextLinesIntegration;
	exports.createGetModuleFromFilename = nodeCore.createGetModuleFromFilename;
	exports.createSentryWinstonTransport = nodeCore.createSentryWinstonTransport;
	exports.cron = nodeCore.cron;
	exports.defaultStackParser = nodeCore.defaultStackParser;
	exports.disableAnrDetectionForCallback = nodeCore.disableAnrDetectionForCallback;
	exports.generateInstrumentOnce = nodeCore.generateInstrumentOnce;
	exports.getSentryRelease = nodeCore.getSentryRelease;
	exports.httpServerIntegration = nodeCore.httpServerIntegration;
	exports.httpServerSpansIntegration = nodeCore.httpServerSpansIntegration;
	exports.localVariablesIntegration = nodeCore.localVariablesIntegration;
	exports.logger = nodeCore.logger;
	exports.makeNodeTransport = nodeCore.makeNodeTransport;
	exports.metrics = nodeCore.metrics;
	exports.modulesIntegration = nodeCore.modulesIntegration;
	exports.nodeContextIntegration = nodeCore.nodeContextIntegration;
	exports.nodeRuntimeMetricsIntegration = nodeCore.nodeRuntimeMetricsIntegration;
	exports.onUncaughtExceptionIntegration = nodeCore.onUncaughtExceptionIntegration;
	exports.onUnhandledRejectionIntegration = nodeCore.onUnhandledRejectionIntegration;
	exports.pinoIntegration = nodeCore.pinoIntegration;
	exports.processSessionIntegration = nodeCore.processSessionIntegration;
	exports.spotlightIntegration = nodeCore.spotlightIntegration;
	exports.systemErrorIntegration = nodeCore.systemErrorIntegration;
	exports.validateOpenTelemetrySetup = nodeCore.validateOpenTelemetrySetup;
	exports.withStreamedSpan = nodeCore.withStreamedSpan;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/common/debug-build.js
var require_debug_build = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	exports.DEBUG_BUILD = typeof __SENTRY_DEBUG__ === "undefined" || __SENTRY_DEBUG__;
}));
//#endregion
//#region node_modules/stacktrace-parser/dist/stack-trace-parser.cjs.js
var require_stack_trace_parser_cjs = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var UNKNOWN_FUNCTION = "<unknown>";
	/**
	* This parses the different stack traces and puts them into one format
	* This borrows heavily from TraceKit (https://github.com/csnover/TraceKit)
	*/
	function parse(stackString) {
		return stackString.split("\n").reduce(function(stack, line) {
			var parseResult = parseChrome(line) || parseWinjs(line) || parseGecko(line) || parseNode(line) || parseJSC(line);
			if (parseResult) stack.push(parseResult);
			return stack;
		}, []);
	}
	var chromeRe = /^\s*at (.*?) ?\(((?:file|https?|blob|chrome-extension|native|eval|webpack|rsc|<anonymous>|\/|[a-z]:\\|\\\\).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;
	var chromeEvalRe = /\((\S*)(?::(\d+))(?::(\d+))\)/;
	function parseChrome(line) {
		var parts = chromeRe.exec(line);
		if (!parts) return null;
		var isNative = parts[2] && parts[2].indexOf("native") === 0;
		var isEval = parts[2] && parts[2].indexOf("eval") === 0;
		var submatch = chromeEvalRe.exec(parts[2]);
		if (isEval && submatch != null) {
			parts[2] = submatch[1];
			parts[3] = submatch[2];
			parts[4] = submatch[3];
		}
		return {
			file: !isNative ? parts[2] : null,
			methodName: parts[1] || UNKNOWN_FUNCTION,
			arguments: isNative ? [parts[2]] : [],
			lineNumber: parts[3] ? +parts[3] : null,
			column: parts[4] ? +parts[4] : null
		};
	}
	var winjsRe = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:file|ms-appx|https?|webpack|rsc|blob):.*?):(\d+)(?::(\d+))?\)?\s*$/i;
	function parseWinjs(line) {
		var parts = winjsRe.exec(line);
		if (!parts) return null;
		return {
			file: parts[2],
			methodName: parts[1] || UNKNOWN_FUNCTION,
			arguments: [],
			lineNumber: +parts[3],
			column: parts[4] ? +parts[4] : null
		};
	}
	var geckoRe = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)((?:file|https?|blob|chrome|webpack|rsc|resource|\[native).*?|[^@]*bundle)(?::(\d+))?(?::(\d+))?\s*$/i;
	var geckoEvalRe = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i;
	function parseGecko(line) {
		var parts = geckoRe.exec(line);
		if (!parts) return null;
		var isEval = parts[3] && parts[3].indexOf(" > eval") > -1;
		var submatch = geckoEvalRe.exec(parts[3]);
		if (isEval && submatch != null) {
			parts[3] = submatch[1];
			parts[4] = submatch[2];
			parts[5] = null;
		}
		return {
			file: parts[3],
			methodName: parts[1] || UNKNOWN_FUNCTION,
			arguments: parts[2] ? parts[2].split(",") : [],
			lineNumber: parts[4] ? +parts[4] : null,
			column: parts[5] ? +parts[5] : null
		};
	}
	var javaScriptCoreRe = /^\s*(?:([^@]*)(?:\((.*?)\))?@)?(\S.*?):(\d+)(?::(\d+))?\s*$/i;
	function parseJSC(line) {
		var parts = javaScriptCoreRe.exec(line);
		if (!parts) return null;
		return {
			file: parts[3],
			methodName: parts[1] || UNKNOWN_FUNCTION,
			arguments: [],
			lineNumber: +parts[4],
			column: parts[5] ? +parts[5] : null
		};
	}
	var nodeRe = /^\s*at (?:((?:\[object object\])?[^\\/]+(?: \[as \S+\])?) )?\(?(.*?):(\d+)(?::(\d+))?\)?\s*$/i;
	function parseNode(line) {
		var parts = nodeRe.exec(line);
		if (!parts) return null;
		return {
			file: parts[2],
			methodName: parts[1] || UNKNOWN_FUNCTION,
			arguments: [],
			lineNumber: +parts[3],
			column: parts[4] ? +parts[4] : null
		};
	}
	exports.parse = parse;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/common/devErrorSymbolicationEventProcessor.js
var require_devErrorSymbolicationEventProcessor = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const stackTraceParser = require_stack_trace_parser_cjs();
	const debugBuild = require_debug_build();
	const globalWithInjectedValues = core.GLOBAL_OBJ;
	function getDevServerBaseUrl() {
		let basePath = process.env._sentryBasePath ?? globalWithInjectedValues._sentryBasePath ?? "";
		if (basePath !== "" && !basePath.match(/^\//)) basePath = `/${basePath}`;
		if (typeof window !== "undefined") return basePath;
		return `http://localhost:${process.env.PORT || "3000"}${basePath}`;
	}
	async function fetchWithTimeout(url, options = {}) {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), 3e3);
		return core.suppressTracing(() => fetch(url, {
			...options,
			signal: controller.signal
		}).finally(() => {
			clearTimeout(timer);
		}));
	}
	async function devErrorSymbolicationEventProcessor(event, hint) {
		if (event.type === "transaction") event.spans = event.spans?.filter((span) => {
			const httpUrlAttribute = span.data?.["http.url"];
			if (typeof httpUrlAttribute === "string") return !httpUrlAttribute.includes("__nextjs_original-stack-frame");
			return true;
		});
		try {
			if (hint.originalException && hint.originalException instanceof Error && hint.originalException.stack) {
				const frames = stackTraceParser.parse(hint.originalException.stack);
				const nextJsVersion = globalWithInjectedValues._sentryNextJsVersion;
				if (!nextJsVersion) return event;
				const parsedNextjsVersion = core.parseSemver(nextJsVersion);
				let resolvedFrames;
				if (parsedNextjsVersion.major > 15 || parsedNextjsVersion.major === 15 && parsedNextjsVersion.minor >= 2) {
					const r = await resolveStackFrames(frames);
					if (r === null) return event;
					resolvedFrames = r;
				} else resolvedFrames = await Promise.all(frames.map((frame) => resolveStackFrame(frame, hint.originalException)));
				if (event.exception?.values?.[0]?.stacktrace?.frames) event.exception.values[0].stacktrace.frames = event.exception.values[0].stacktrace.frames.map((frame, i, frames2) => {
					const resolvedFrame = resolvedFrames[frames2.length - 1 - i];
					if (!resolvedFrame?.originalStackFrame || !resolvedFrame.originalCodeFrame) return {
						...frame,
						platform: frame.filename?.startsWith("node:internal") ? "nodejs" : void 0,
						in_app: false
					};
					const { contextLine, preContextLines, postContextLines } = parseOriginalCodeFrame(resolvedFrame.originalCodeFrame);
					return {
						...frame,
						pre_context: preContextLines,
						context_line: contextLine,
						post_context: postContextLines,
						function: resolvedFrame.originalStackFrame.methodName,
						filename: resolvedFrame.originalStackFrame.file ? stripWebpackInternalPrefix(resolvedFrame.originalStackFrame.file) : void 0,
						lineno: resolvedFrame.originalStackFrame.lineNumber || resolvedFrame.originalStackFrame.line1 || void 0,
						colno: resolvedFrame.originalStackFrame.column || resolvedFrame.originalStackFrame.column1 || void 0
					};
				});
			}
		} catch {
			return event;
		}
		return event;
	}
	async function resolveStackFrame(frame, error) {
		try {
			if (!(frame.file?.startsWith("webpack-internal:") || frame.file?.startsWith("file:"))) return null;
			const params = new URLSearchParams();
			params.append("isServer", String(false));
			params.append("isEdgeServer", String(false));
			params.append("isAppDirectory", String(true));
			params.append("errorMessage", error.toString());
			Object.keys(frame).forEach((key) => {
				params.append(key, (frame[key] ?? "").toString());
			});
			const res = await fetchWithTimeout(`${getDevServerBaseUrl()}/__nextjs_original-stack-frame?${params.toString()}`);
			if (!res.ok || res.status === 204) return null;
			const body = await res.json();
			return {
				originalCodeFrame: body.originalCodeFrame,
				originalStackFrame: body.originalStackFrame
			};
		} catch (e) {
			debugBuild.DEBUG_BUILD && core.debug.error("Failed to symbolicate event with Next.js dev server", e);
			return null;
		}
	}
	async function resolveStackFrames(frames) {
		try {
			const postBody = {
				frames: frames.filter((frame) => {
					return !!frame.file;
				}).map((frame) => {
					frame.file = frame.file.replace(/^rsc:\/\/React\/[^/]+\//, "").replace(/\?\d+$/, "");
					return {
						file: frame.file,
						methodName: frame.methodName ?? "<unknown>",
						arguments: [],
						lineNumber: frame.lineNumber ?? 0,
						column: frame.column ?? 0,
						line1: frame.lineNumber ?? 0,
						column1: frame.column ?? 0
					};
				}),
				isServer: false,
				isEdgeServer: false,
				isAppDirectory: true
			};
			const res = await fetchWithTimeout(`${getDevServerBaseUrl()}/__nextjs_original-stack-frames`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(postBody)
			});
			if (!res.ok || res.status === 204) return null;
			return (await res.json()).map((frame) => {
				return {
					originalCodeFrame: frame.value.originalCodeFrame,
					originalStackFrame: frame.value.originalStackFrame
				};
			});
		} catch (e) {
			debugBuild.DEBUG_BUILD && core.debug.error("Failed to symbolicate event with Next.js dev server", e);
			return null;
		}
	}
	function parseOriginalCodeFrame(codeFrame) {
		const preProcessedLines = codeFrame.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "").split("\n").filter((line) => !line.match(/^\s*\|/)).map((line) => ({
			line,
			isErrorLine: !!line.match(/^>/)
		})).map((lineObj) => ({
			...lineObj,
			line: lineObj.line.replace(/^.*\|/, "")
		}));
		const preContextLines = [];
		let contextLine = void 0;
		const postContextLines = [];
		let reachedContextLine = false;
		for (const preProcessedLine of preProcessedLines) if (preProcessedLine.isErrorLine) {
			contextLine = preProcessedLine.line;
			reachedContextLine = true;
		} else if (reachedContextLine) postContextLines.push(preProcessedLine.line);
		else preContextLines.push(preProcessedLine.line);
		return {
			contextLine,
			preContextLines,
			postContextLines
		};
	}
	function stripWebpackInternalPrefix(filename) {
		if (!filename) return filename;
		const match = filename.match(/^webpack-internal:(?:\/+)?(?:\([^)]*\)\/)?(.+)$/);
		return match ? match[1] : filename;
	}
	exports.devErrorSymbolicationEventProcessor = devErrorSymbolicationEventProcessor;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/common/getVercelEnv.js
var require_getVercelEnv = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	function getVercelEnv(isClient) {
		const vercelEnvVar = isClient ? process.env.NEXT_PUBLIC_VERCEL_ENV : process.env.VERCEL_ENV;
		return vercelEnvVar ? `vercel-${vercelEnvVar}` : void 0;
	}
	exports.getVercelEnv = getVercelEnv;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/common/span-attributes-with-logic-attached.js
var require_span_attributes_with_logic_attached = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const TRANSACTION_ATTR_SHOULD_DROP_TRANSACTION = "sentry.drop_transaction";
	exports.TRANSACTION_ATTR_SENTRY_ROUTE_BACKFILL = "sentry.route_backfill";
	exports.TRANSACTION_ATTR_SHOULD_DROP_TRANSACTION = TRANSACTION_ATTR_SHOULD_DROP_TRANSACTION;
}));
//#endregion
//#region node_modules/@swc/helpers/cjs/_interop_require_default.cjs
var require__interop_require_default = /* @__PURE__ */ __commonJSMin(((exports) => {
	function _interop_require_default(obj) {
		return obj && obj.__esModule ? obj : { default: obj };
	}
	exports._ = _interop_require_default;
}));
//#endregion
//#region node_modules/next/dist/shared/lib/modern-browserslist-target.js
/**
* These are the minimum browser versions that we consider "modern" and thus compile for by default.
* This list was generated using `pnpm browserslist "baseline widely available"` on 2025-10-01.
*/ var require_modern_browserslist_target = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = [
		"chrome 111",
		"edge 111",
		"firefox 111",
		"safari 16.4"
	];
}));
//#endregion
//#region node_modules/next/dist/shared/lib/entry-constants.js
var require_entry_constants = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	0 && (module.exports = {
		UNDERSCORE_GLOBAL_ERROR_ROUTE: null,
		UNDERSCORE_GLOBAL_ERROR_ROUTE_ENTRY: null,
		UNDERSCORE_NOT_FOUND_ROUTE: null,
		UNDERSCORE_NOT_FOUND_ROUTE_ENTRY: null
	});
	function _export(target, all) {
		for (var name in all) Object.defineProperty(target, name, {
			enumerable: true,
			get: all[name]
		});
	}
	_export(exports, {
		UNDERSCORE_GLOBAL_ERROR_ROUTE: function() {
			return UNDERSCORE_GLOBAL_ERROR_ROUTE;
		},
		UNDERSCORE_GLOBAL_ERROR_ROUTE_ENTRY: function() {
			return UNDERSCORE_GLOBAL_ERROR_ROUTE_ENTRY;
		},
		UNDERSCORE_NOT_FOUND_ROUTE: function() {
			return UNDERSCORE_NOT_FOUND_ROUTE;
		},
		UNDERSCORE_NOT_FOUND_ROUTE_ENTRY: function() {
			return UNDERSCORE_NOT_FOUND_ROUTE_ENTRY;
		}
	});
	const UNDERSCORE_NOT_FOUND_ROUTE = "/_not-found";
	const UNDERSCORE_NOT_FOUND_ROUTE_ENTRY = `${UNDERSCORE_NOT_FOUND_ROUTE}/page`;
	const UNDERSCORE_GLOBAL_ERROR_ROUTE = "/_global-error";
	const UNDERSCORE_GLOBAL_ERROR_ROUTE_ENTRY = `${UNDERSCORE_GLOBAL_ERROR_ROUTE}/page`;
}));
//#endregion
//#region node_modules/next/dist/shared/lib/constants.js
var require_constants$2 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	0 && (module.exports = {
		APP_CLIENT_INTERNALS: null,
		APP_PATHS_MANIFEST: null,
		APP_PATH_ROUTES_MANIFEST: null,
		AdapterOutputType: null,
		BARREL_OPTIMIZATION_PREFIX: null,
		BLOCKED_PAGES: null,
		BUILD_ID_FILE: null,
		BUILD_MANIFEST: null,
		CLIENT_PUBLIC_FILES_PATH: null,
		CLIENT_REFERENCE_MANIFEST: null,
		CLIENT_STATIC_FILES_PATH: null,
		CLIENT_STATIC_FILES_RUNTIME_MAIN: null,
		CLIENT_STATIC_FILES_RUNTIME_MAIN_APP: null,
		CLIENT_STATIC_FILES_RUNTIME_POLYFILLS: null,
		CLIENT_STATIC_FILES_RUNTIME_POLYFILLS_SYMBOL: null,
		CLIENT_STATIC_FILES_RUNTIME_REACT_REFRESH: null,
		CLIENT_STATIC_FILES_RUNTIME_WEBPACK: null,
		COMPILER_INDEXES: null,
		COMPILER_NAMES: null,
		CONFIG_FILES: null,
		DEFAULT_RUNTIME_WEBPACK: null,
		DEFAULT_SANS_SERIF_FONT: null,
		DEFAULT_SERIF_FONT: null,
		DEV_CLIENT_MIDDLEWARE_MANIFEST: null,
		DEV_CLIENT_PAGES_MANIFEST: null,
		DYNAMIC_CSS_MANIFEST: null,
		EDGE_RUNTIME_WEBPACK: null,
		EDGE_UNSUPPORTED_NODE_APIS: null,
		EXPORT_DETAIL: null,
		EXPORT_MARKER: null,
		FUNCTIONS_CONFIG_MANIFEST: null,
		IMAGES_MANIFEST: null,
		INTERCEPTION_ROUTE_REWRITE_MANIFEST: null,
		MIDDLEWARE_BUILD_MANIFEST: null,
		MIDDLEWARE_MANIFEST: null,
		MIDDLEWARE_REACT_LOADABLE_MANIFEST: null,
		MODERN_BROWSERSLIST_TARGET: null,
		NEXT_BUILTIN_DOCUMENT: null,
		NEXT_FONT_MANIFEST: null,
		PAGES_MANIFEST: null,
		PHASE_ANALYZE: null,
		PHASE_DEVELOPMENT_SERVER: null,
		PHASE_EXPORT: null,
		PHASE_INFO: null,
		PHASE_PRODUCTION_BUILD: null,
		PHASE_PRODUCTION_SERVER: null,
		PHASE_TEST: null,
		PREFETCH_HINTS: null,
		PRERENDER_MANIFEST: null,
		REACT_LOADABLE_MANIFEST: null,
		ROUTES_MANIFEST: null,
		RSC_MODULE_TYPES: null,
		SERVER_DIRECTORY: null,
		SERVER_FILES_MANIFEST: null,
		SERVER_PROPS_ID: null,
		SERVER_REFERENCE_MANIFEST: null,
		STATIC_PROPS_ID: null,
		STATIC_STATUS_PAGES: null,
		STRING_LITERAL_DROP_BUNDLE: null,
		SUBRESOURCE_INTEGRITY_MANIFEST: null,
		SYSTEM_ENTRYPOINTS: null,
		TRACE_OUTPUT_VERSION: null,
		TURBOPACK_CLIENT_BUILD_MANIFEST: null,
		TURBOPACK_CLIENT_MIDDLEWARE_MANIFEST: null,
		TURBO_TRACE_DEFAULT_MEMORY_LIMIT: null,
		UNDERSCORE_GLOBAL_ERROR_ROUTE: null,
		UNDERSCORE_GLOBAL_ERROR_ROUTE_ENTRY: null,
		UNDERSCORE_NOT_FOUND_ROUTE: null,
		UNDERSCORE_NOT_FOUND_ROUTE_ENTRY: null
	});
	function _export(target, all) {
		for (var name in all) Object.defineProperty(target, name, {
			enumerable: true,
			get: all[name]
		});
	}
	_export(exports, {
		APP_CLIENT_INTERNALS: function() {
			return APP_CLIENT_INTERNALS;
		},
		APP_PATHS_MANIFEST: function() {
			return APP_PATHS_MANIFEST;
		},
		APP_PATH_ROUTES_MANIFEST: function() {
			return APP_PATH_ROUTES_MANIFEST;
		},
		AdapterOutputType: function() {
			return AdapterOutputType;
		},
		BARREL_OPTIMIZATION_PREFIX: function() {
			return BARREL_OPTIMIZATION_PREFIX;
		},
		BLOCKED_PAGES: function() {
			return BLOCKED_PAGES;
		},
		BUILD_ID_FILE: function() {
			return BUILD_ID_FILE;
		},
		BUILD_MANIFEST: function() {
			return BUILD_MANIFEST;
		},
		CLIENT_PUBLIC_FILES_PATH: function() {
			return CLIENT_PUBLIC_FILES_PATH;
		},
		CLIENT_REFERENCE_MANIFEST: function() {
			return CLIENT_REFERENCE_MANIFEST;
		},
		CLIENT_STATIC_FILES_PATH: function() {
			return CLIENT_STATIC_FILES_PATH;
		},
		CLIENT_STATIC_FILES_RUNTIME_MAIN: function() {
			return CLIENT_STATIC_FILES_RUNTIME_MAIN;
		},
		CLIENT_STATIC_FILES_RUNTIME_MAIN_APP: function() {
			return CLIENT_STATIC_FILES_RUNTIME_MAIN_APP;
		},
		CLIENT_STATIC_FILES_RUNTIME_POLYFILLS: function() {
			return CLIENT_STATIC_FILES_RUNTIME_POLYFILLS;
		},
		CLIENT_STATIC_FILES_RUNTIME_POLYFILLS_SYMBOL: function() {
			return CLIENT_STATIC_FILES_RUNTIME_POLYFILLS_SYMBOL;
		},
		CLIENT_STATIC_FILES_RUNTIME_REACT_REFRESH: function() {
			return CLIENT_STATIC_FILES_RUNTIME_REACT_REFRESH;
		},
		CLIENT_STATIC_FILES_RUNTIME_WEBPACK: function() {
			return CLIENT_STATIC_FILES_RUNTIME_WEBPACK;
		},
		COMPILER_INDEXES: function() {
			return COMPILER_INDEXES;
		},
		COMPILER_NAMES: function() {
			return COMPILER_NAMES;
		},
		CONFIG_FILES: function() {
			return CONFIG_FILES;
		},
		DEFAULT_RUNTIME_WEBPACK: function() {
			return DEFAULT_RUNTIME_WEBPACK;
		},
		DEFAULT_SANS_SERIF_FONT: function() {
			return DEFAULT_SANS_SERIF_FONT;
		},
		DEFAULT_SERIF_FONT: function() {
			return DEFAULT_SERIF_FONT;
		},
		DEV_CLIENT_MIDDLEWARE_MANIFEST: function() {
			return DEV_CLIENT_MIDDLEWARE_MANIFEST;
		},
		DEV_CLIENT_PAGES_MANIFEST: function() {
			return DEV_CLIENT_PAGES_MANIFEST;
		},
		DYNAMIC_CSS_MANIFEST: function() {
			return DYNAMIC_CSS_MANIFEST;
		},
		EDGE_RUNTIME_WEBPACK: function() {
			return EDGE_RUNTIME_WEBPACK;
		},
		EDGE_UNSUPPORTED_NODE_APIS: function() {
			return EDGE_UNSUPPORTED_NODE_APIS;
		},
		EXPORT_DETAIL: function() {
			return EXPORT_DETAIL;
		},
		EXPORT_MARKER: function() {
			return EXPORT_MARKER;
		},
		FUNCTIONS_CONFIG_MANIFEST: function() {
			return FUNCTIONS_CONFIG_MANIFEST;
		},
		IMAGES_MANIFEST: function() {
			return IMAGES_MANIFEST;
		},
		INTERCEPTION_ROUTE_REWRITE_MANIFEST: function() {
			return INTERCEPTION_ROUTE_REWRITE_MANIFEST;
		},
		MIDDLEWARE_BUILD_MANIFEST: function() {
			return MIDDLEWARE_BUILD_MANIFEST;
		},
		MIDDLEWARE_MANIFEST: function() {
			return MIDDLEWARE_MANIFEST;
		},
		MIDDLEWARE_REACT_LOADABLE_MANIFEST: function() {
			return MIDDLEWARE_REACT_LOADABLE_MANIFEST;
		},
		MODERN_BROWSERSLIST_TARGET: function() {
			return _modernbrowserslisttarget.default;
		},
		NEXT_BUILTIN_DOCUMENT: function() {
			return NEXT_BUILTIN_DOCUMENT;
		},
		NEXT_FONT_MANIFEST: function() {
			return NEXT_FONT_MANIFEST;
		},
		PAGES_MANIFEST: function() {
			return PAGES_MANIFEST;
		},
		PHASE_ANALYZE: function() {
			return PHASE_ANALYZE;
		},
		PHASE_DEVELOPMENT_SERVER: function() {
			return PHASE_DEVELOPMENT_SERVER;
		},
		PHASE_EXPORT: function() {
			return PHASE_EXPORT;
		},
		PHASE_INFO: function() {
			return PHASE_INFO;
		},
		PHASE_PRODUCTION_BUILD: function() {
			return PHASE_PRODUCTION_BUILD;
		},
		PHASE_PRODUCTION_SERVER: function() {
			return PHASE_PRODUCTION_SERVER;
		},
		PHASE_TEST: function() {
			return PHASE_TEST;
		},
		PREFETCH_HINTS: function() {
			return PREFETCH_HINTS;
		},
		PRERENDER_MANIFEST: function() {
			return PRERENDER_MANIFEST;
		},
		REACT_LOADABLE_MANIFEST: function() {
			return REACT_LOADABLE_MANIFEST;
		},
		ROUTES_MANIFEST: function() {
			return ROUTES_MANIFEST;
		},
		RSC_MODULE_TYPES: function() {
			return RSC_MODULE_TYPES;
		},
		SERVER_DIRECTORY: function() {
			return SERVER_DIRECTORY;
		},
		SERVER_FILES_MANIFEST: function() {
			return SERVER_FILES_MANIFEST;
		},
		SERVER_PROPS_ID: function() {
			return SERVER_PROPS_ID;
		},
		SERVER_REFERENCE_MANIFEST: function() {
			return SERVER_REFERENCE_MANIFEST;
		},
		STATIC_PROPS_ID: function() {
			return STATIC_PROPS_ID;
		},
		STATIC_STATUS_PAGES: function() {
			return STATIC_STATUS_PAGES;
		},
		STRING_LITERAL_DROP_BUNDLE: function() {
			return STRING_LITERAL_DROP_BUNDLE;
		},
		SUBRESOURCE_INTEGRITY_MANIFEST: function() {
			return SUBRESOURCE_INTEGRITY_MANIFEST;
		},
		SYSTEM_ENTRYPOINTS: function() {
			return SYSTEM_ENTRYPOINTS;
		},
		TRACE_OUTPUT_VERSION: function() {
			return TRACE_OUTPUT_VERSION;
		},
		TURBOPACK_CLIENT_BUILD_MANIFEST: function() {
			return TURBOPACK_CLIENT_BUILD_MANIFEST;
		},
		TURBOPACK_CLIENT_MIDDLEWARE_MANIFEST: function() {
			return TURBOPACK_CLIENT_MIDDLEWARE_MANIFEST;
		},
		TURBO_TRACE_DEFAULT_MEMORY_LIMIT: function() {
			return TURBO_TRACE_DEFAULT_MEMORY_LIMIT;
		},
		UNDERSCORE_GLOBAL_ERROR_ROUTE: function() {
			return _entryconstants.UNDERSCORE_GLOBAL_ERROR_ROUTE;
		},
		UNDERSCORE_GLOBAL_ERROR_ROUTE_ENTRY: function() {
			return _entryconstants.UNDERSCORE_GLOBAL_ERROR_ROUTE_ENTRY;
		},
		UNDERSCORE_NOT_FOUND_ROUTE: function() {
			return _entryconstants.UNDERSCORE_NOT_FOUND_ROUTE;
		},
		UNDERSCORE_NOT_FOUND_ROUTE_ENTRY: function() {
			return _entryconstants.UNDERSCORE_NOT_FOUND_ROUTE_ENTRY;
		}
	});
	const _modernbrowserslisttarget = /*#__PURE__*/ require__interop_require_default()._(require_modern_browserslist_target());
	const _entryconstants = require_entry_constants();
	const COMPILER_NAMES = {
		client: "client",
		server: "server",
		edgeServer: "edge-server"
	};
	const COMPILER_INDEXES = {
		[COMPILER_NAMES.client]: 0,
		[COMPILER_NAMES.server]: 1,
		[COMPILER_NAMES.edgeServer]: 2
	};
	var AdapterOutputType = /*#__PURE__*/ function(AdapterOutputType) {
		/**
		* `PAGES` represents all the React pages that are under `pages/`.
		*/ AdapterOutputType["PAGES"] = "PAGES";
		/**
		* `PAGES_API` represents all the API routes under `pages/api/`.
		*/ AdapterOutputType["PAGES_API"] = "PAGES_API";
		/**
		* `APP_PAGE` represents all the React pages that are under `app/` with the
		* filename of `page.{j,t}s{,x}`.
		*/ AdapterOutputType["APP_PAGE"] = "APP_PAGE";
		/**
		* `APP_ROUTE` represents all the API routes and metadata routes that are under `app/` with the
		* filename of `route.{j,t}s{,x}`.
		*/ AdapterOutputType["APP_ROUTE"] = "APP_ROUTE";
		/**
		* `PRERENDER` represents an ISR enabled route that might
		* have a seeded cache entry or fallback generated during build
		*/ AdapterOutputType["PRERENDER"] = "PRERENDER";
		/**
		* `STATIC_FILE` represents a static file (ie /_next/static)
		*/ AdapterOutputType["STATIC_FILE"] = "STATIC_FILE";
		/**
		* `MIDDLEWARE` represents the middleware output if present
		*/ AdapterOutputType["MIDDLEWARE"] = "MIDDLEWARE";
		return AdapterOutputType;
	}({});
	const PHASE_EXPORT = "phase-export";
	const PHASE_ANALYZE = "phase-analyze";
	const PHASE_PRODUCTION_BUILD = "phase-production-build";
	const PHASE_PRODUCTION_SERVER = "phase-production-server";
	const PHASE_DEVELOPMENT_SERVER = "phase-development-server";
	const PHASE_TEST = "phase-test";
	const PHASE_INFO = "phase-info";
	const PAGES_MANIFEST = "pages-manifest.json";
	const APP_PATHS_MANIFEST = "app-paths-manifest.json";
	const APP_PATH_ROUTES_MANIFEST = "app-path-routes-manifest.json";
	const BUILD_MANIFEST = "build-manifest.json";
	const FUNCTIONS_CONFIG_MANIFEST = "functions-config-manifest.json";
	const SUBRESOURCE_INTEGRITY_MANIFEST = "subresource-integrity-manifest";
	const NEXT_FONT_MANIFEST = "next-font-manifest";
	const EXPORT_MARKER = "export-marker.json";
	const EXPORT_DETAIL = "export-detail.json";
	const PRERENDER_MANIFEST = "prerender-manifest.json";
	const PREFETCH_HINTS = "prefetch-hints.json";
	const ROUTES_MANIFEST = "routes-manifest.json";
	const IMAGES_MANIFEST = "images-manifest.json";
	const SERVER_FILES_MANIFEST = "required-server-files";
	const DEV_CLIENT_PAGES_MANIFEST = "_devPagesManifest.json";
	const MIDDLEWARE_MANIFEST = "middleware-manifest.json";
	const TURBOPACK_CLIENT_MIDDLEWARE_MANIFEST = "_clientMiddlewareManifest.js";
	const TURBOPACK_CLIENT_BUILD_MANIFEST = "client-build-manifest.json";
	const DEV_CLIENT_MIDDLEWARE_MANIFEST = "_devMiddlewareManifest.json";
	const REACT_LOADABLE_MANIFEST = "react-loadable-manifest.json";
	const SERVER_DIRECTORY = "server";
	const CONFIG_FILES = [
		"next.config.js",
		"next.config.mjs",
		"next.config.ts",
		...process?.features?.typescript ? ["next.config.mts"] : []
	];
	const BUILD_ID_FILE = "BUILD_ID";
	const BLOCKED_PAGES = [
		"/_document",
		"/_app",
		"/_error"
	];
	const CLIENT_PUBLIC_FILES_PATH = "public";
	const CLIENT_STATIC_FILES_PATH = "static";
	const STRING_LITERAL_DROP_BUNDLE = "__NEXT_DROP_CLIENT_FILE__";
	const NEXT_BUILTIN_DOCUMENT = "__NEXT_BUILTIN_DOCUMENT__";
	const BARREL_OPTIMIZATION_PREFIX = "__barrel_optimize__";
	const CLIENT_REFERENCE_MANIFEST = "client-reference-manifest";
	const SERVER_REFERENCE_MANIFEST = "server-reference-manifest";
	const MIDDLEWARE_BUILD_MANIFEST = "middleware-build-manifest";
	const MIDDLEWARE_REACT_LOADABLE_MANIFEST = "middleware-react-loadable-manifest";
	const INTERCEPTION_ROUTE_REWRITE_MANIFEST = "interception-route-rewrite-manifest";
	const DYNAMIC_CSS_MANIFEST = "dynamic-css-manifest";
	const CLIENT_STATIC_FILES_RUNTIME_MAIN = `main`;
	const CLIENT_STATIC_FILES_RUNTIME_MAIN_APP = `${CLIENT_STATIC_FILES_RUNTIME_MAIN}-app`;
	const APP_CLIENT_INTERNALS = "app-pages-internals";
	const CLIENT_STATIC_FILES_RUNTIME_REACT_REFRESH = `react-refresh`;
	const CLIENT_STATIC_FILES_RUNTIME_WEBPACK = `webpack`;
	const CLIENT_STATIC_FILES_RUNTIME_POLYFILLS = "polyfills";
	const CLIENT_STATIC_FILES_RUNTIME_POLYFILLS_SYMBOL = Symbol(CLIENT_STATIC_FILES_RUNTIME_POLYFILLS);
	const DEFAULT_RUNTIME_WEBPACK = "webpack-runtime";
	const EDGE_RUNTIME_WEBPACK = "edge-runtime-webpack";
	const STATIC_PROPS_ID = "__N_SSG";
	const SERVER_PROPS_ID = "__N_SSP";
	const DEFAULT_SERIF_FONT = {
		name: "Times New Roman",
		xAvgCharWidth: 821,
		azAvgWidth: 854.3953488372093,
		unitsPerEm: 2048
	};
	const DEFAULT_SANS_SERIF_FONT = {
		name: "Arial",
		xAvgCharWidth: 904,
		azAvgWidth: 934.5116279069767,
		unitsPerEm: 2048
	};
	const STATIC_STATUS_PAGES = ["/500"];
	const TRACE_OUTPUT_VERSION = 1;
	const TURBO_TRACE_DEFAULT_MEMORY_LIMIT = 6e3;
	const RSC_MODULE_TYPES = {
		client: "client",
		server: "server"
	};
	const EDGE_UNSUPPORTED_NODE_APIS = [
		"clearImmediate",
		"setImmediate",
		"BroadcastChannel",
		"ByteLengthQueuingStrategy",
		"CompressionStream",
		"CountQueuingStrategy",
		"DecompressionStream",
		"DomException",
		"MessageChannel",
		"MessageEvent",
		"MessagePort",
		"ReadableByteStreamController",
		"ReadableStreamBYOBRequest",
		"ReadableStreamDefaultController",
		"TransformStreamDefaultController",
		"WritableStreamDefaultController"
	];
	const SYSTEM_ENTRYPOINTS = /* @__PURE__ */ new Set([
		CLIENT_STATIC_FILES_RUNTIME_MAIN,
		CLIENT_STATIC_FILES_RUNTIME_REACT_REFRESH,
		CLIENT_STATIC_FILES_RUNTIME_MAIN_APP
	]);
	if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
		Object.defineProperty(exports.default, "__esModule", { value: true });
		Object.assign(exports.default, exports);
		module.exports = exports.default;
	}
}));
//#endregion
//#region node_modules/next/constants.js
var require_constants$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_constants$2();
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/common/utils/isBuild.js
var require_isBuild = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const constants = require_constants$1();
	function isBuild() {
		return process.env.NEXT_PHASE === constants.PHASE_PRODUCTION_BUILD;
	}
	exports.isBuild = isBuild;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/common/utils/responseEnd.js
var require_responseEnd = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const debugBuild = require_debug_build();
	async function flushSafelyWithTimeout() {
		try {
			debugBuild.DEBUG_BUILD && core.debug.log("Flushing events...");
			await core.flush(2e3);
			debugBuild.DEBUG_BUILD && core.debug.log("Done flushing events");
		} catch (e) {
			debugBuild.DEBUG_BUILD && core.debug.log("Error while flushing events:\n", e);
		}
	}
	function waitUntil(task) {
		if (isCloudflareWaitUntilAvailable()) {
			cloudflareWaitUntil(task);
			return;
		}
		core.vercelWaitUntil(task);
	}
	function _getOpenNextCloudflareContext() {
		const openNextCloudflareContextSymbol = /* @__PURE__ */ Symbol.for("__cloudflare-context__");
		return core.GLOBAL_OBJ[openNextCloudflareContextSymbol]?.ctx;
	}
	function cloudflareWaitUntil(task) {
		_getOpenNextCloudflareContext()?.waitUntil(task);
	}
	function isCloudflareWaitUntilAvailable() {
		return typeof _getOpenNextCloudflareContext()?.waitUntil === "function";
	}
	exports.cloudflareWaitUntil = cloudflareWaitUntil;
	exports.flushSafelyWithTimeout = flushSafelyWithTimeout;
	exports.isCloudflareWaitUntilAvailable = isCloudflareWaitUntilAvailable;
	exports.waitUntil = waitUntil;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/common/utils/urls.js
var require_urls = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const HeaderKeys = {
		FORWARDED_PROTO: "x-forwarded-proto",
		FORWARDED_HOST: "x-forwarded-host",
		HOST: "host",
		REFERER: "referer"
	};
	function substituteRouteParams(path, params) {
		return path;
	}
	function sanitizeRoutePath(path) {
		const cleanedSegments = path.split("/").filter((segment) => segment && !(segment.startsWith("(") && segment.endsWith(")")));
		return cleanedSegments.length > 0 ? `/${cleanedSegments.join("/")}` : "/";
	}
	function buildUrlFromComponentRoute(componentRoute, params, headersDict, pathname) {
		const parameterizedPath = substituteRouteParams(componentRoute);
		const path = pathname ?? sanitizeRoutePath(parameterizedPath);
		const protocol = headersDict?.[HeaderKeys.FORWARDED_PROTO];
		const host = headersDict?.[HeaderKeys.FORWARDED_HOST] || headersDict?.[HeaderKeys.HOST];
		if (!protocol || !host) return path;
		const fullUrl = `${protocol}://${host}${path}`;
		const urlObject = core.parseStringToURLObject(fullUrl);
		if (!urlObject) return path;
		return core.getSanitizedUrlStringFromUrlObject(urlObject);
	}
	function extractSanitizedUrlFromRefererHeader(headersDict) {
		const referer = headersDict?.[HeaderKeys.REFERER];
		if (!referer) return;
		try {
			const refererUrl = new URL(referer);
			return core.getSanitizedUrlStringFromUrlObject(refererUrl);
		} catch {
			return;
		}
	}
	function getSanitizedRequestUrl(componentRoute, params, headersDict, pathname) {
		const refererUrl = extractSanitizedUrlFromRefererHeader(headersDict);
		if (refererUrl) return refererUrl;
		return buildUrlFromComponentRoute(componentRoute, params, headersDict, pathname);
	}
	exports.buildUrlFromComponentRoute = buildUrlFromComponentRoute;
	exports.extractSanitizedUrlFromRefererHeader = extractSanitizedUrlFromRefererHeader;
	exports.getSanitizedRequestUrl = getSanitizedRequestUrl;
	exports.sanitizeRoutePath = sanitizeRoutePath;
	exports.substituteRouteParams = substituteRouteParams;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/common/utils/setUrlProcessingMetadata.js
var require_setUrlProcessingMetadata = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const urls = require_urls();
	function setUrlProcessingMetadata(event) {
		if (event.type !== "transaction" || event.contexts?.trace?.op !== "http.server" || !event.contexts?.trace?.data) return;
		if (!core.getClient()) return;
		const traceData = event.contexts.trace.data;
		const componentRoute = traceData["next.route"] || traceData["http.route"];
		const httpTarget = traceData["http.target"];
		if (!componentRoute) return;
		const isolationScopeData = event.sdkProcessingMetadata?.capturedSpanIsolationScope?.getScopeData();
		const headersDict = isolationScopeData?.sdkProcessingMetadata?.normalizedRequest?.headers;
		const url = urls.getSanitizedRequestUrl(componentRoute, void 0, headersDict, httpTarget?.toString());
		if (url && isolationScopeData?.sdkProcessingMetadata) {
			isolationScopeData.sdkProcessingMetadata.normalizedRequest = isolationScopeData.sdkProcessingMetadata.normalizedRequest || {};
			isolationScopeData.sdkProcessingMetadata.normalizedRequest.url = url;
		}
	}
	exports.setUrlProcessingMetadata = setUrlProcessingMetadata;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/server/distDirRewriteFramesIntegration.js
var require_distDirRewriteFramesIntegration = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const path$9 = __require("path");
	exports.distDirRewriteFramesIntegration = core.defineIntegration(({ distDirName }) => {
		const distDirAbsPath = path$9.resolve(distDirName).replace(/(\/|\\)$/, "");
		const SOURCEMAP_FILENAME_REGEX = new RegExp(core.escapeStringForRegex(distDirAbsPath));
		return {
			...core.rewriteFramesIntegration({ iteratee: (frame) => {
				frame.filename = frame.filename?.replace(SOURCEMAP_FILENAME_REGEX, "app:///_next");
				return frame;
			} }),
			name: "DistDirRewriteFrames"
		};
	});
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/common/nextSpanAttributes.js
var require_nextSpanAttributes = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const ATTR_NEXT_SPAN_TYPE = "next.span_type";
	const ATTR_NEXT_SPAN_NAME = "next.span_name";
	const ATTR_NEXT_ROUTE = "next.route";
	const ATTR_NEXT_SEGMENT = "next.segment";
	exports.ATTR_NEXT_ROUTE = ATTR_NEXT_ROUTE;
	exports.ATTR_NEXT_SEGMENT = ATTR_NEXT_SEGMENT;
	exports.ATTR_NEXT_SPAN_NAME = ATTR_NEXT_SPAN_NAME;
	exports.ATTR_NEXT_SPAN_TYPE = ATTR_NEXT_SPAN_TYPE;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/server/enhanceHandleRequestRootSpan.js
var require_enhanceHandleRequestRootSpan = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const attributes = require_attributes();
	const core = require_cjs$4();
	const nextSpanAttributes = require_nextSpanAttributes();
	const spanAttributesWithLogicAttached = require_span_attributes_with_logic_attached();
	function enhanceHandleRequestRootSpan(span) {
		const { attributes: attributes$1 } = span;
		if (attributes$1[nextSpanAttributes.ATTR_NEXT_SPAN_TYPE] !== "BaseServer.handleRequest") return;
		attributes$1[core.SEMANTIC_ATTRIBUTE_SENTRY_OP] = "http.server";
		span.setOp("http.server");
		const currentName = span.getName();
		if (currentName) span.setName(core.stripUrlQueryAndFragment(currentName));
		const method = attributes$1[attributes.HTTP_METHOD] ?? attributes$1[attributes.HTTP_REQUEST_METHOD];
		const target = attributes$1[attributes.HTTP_TARGET];
		const route = attributes$1[attributes.HTTP_ROUTE] || attributes$1[nextSpanAttributes.ATTR_NEXT_ROUTE];
		const spanName = attributes$1[nextSpanAttributes.ATTR_NEXT_SPAN_NAME];
		if (typeof method === "string" && typeof route === "string" && !route.startsWith("middleware")) {
			const cleanRoute = route.replace(/\/route$/, "");
			span.setName(`${method} ${cleanRoute}`);
			attributes$1[core.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE] = "route";
			attributes$1[nextSpanAttributes.ATTR_NEXT_ROUTE] = cleanRoute;
		}
		const routeBackfill = attributes$1[spanAttributesWithLogicAttached.TRANSACTION_ATTR_SENTRY_ROUTE_BACKFILL];
		if (typeof routeBackfill === "string" && span.getName() !== "GET /_app") span.setName(`${typeof method === "string" ? method : "GET"} ${routeBackfill}`);
		const middlewareMatch = typeof spanName === "string" && spanName.match(/^middleware (GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)/);
		if (middlewareMatch) {
			span.setName(`middleware ${middlewareMatch[1]}`);
			span.setOp("http.server.middleware");
		}
		if (span.getName() === "GET /_error" && typeof target === "string") span.setName(`${typeof method === "string" ? `${method} ` : ""}${target}`);
	}
	exports.enhanceHandleRequestRootSpan = enhanceHandleRequestRootSpan;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/common/utils/addHeadersAsAttributes.js
var require_addHeadersAsAttributes = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	function addHeadersAsAttributes(headers, span) {
		if (!headers) return {};
		const dataCollection = core.getClient()?.getDataCollectionOptions();
		if (dataCollection?.httpHeaders.request === false) return {};
		const headersDict = headers instanceof Headers || typeof headers === "object" && "get" in headers ? core.winterCGHeadersToDict(headers) : headers;
		const headerAttributes = core.httpHeadersToSpanAttributes(headersDict, dataCollection ?? false);
		if (span) span.setAttributes(headerAttributes);
		return headerAttributes;
	}
	exports.addHeadersAsAttributes = addHeadersAsAttributes;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/common/utils/tunnelPathnameMatch.js
var require_tunnelPathnameMatch = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	function isPathnameUnderSentryTunnelRoute(pathname, tunnelPath) {
		return pathname === tunnelPath || pathname.startsWith(`${tunnelPath}/`);
	}
	exports.isPathnameUnderSentryTunnelRoute = isPathnameUnderSentryTunnelRoute;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/common/utils/dropMiddlewareTunnelRequests.js
var require_dropMiddlewareTunnelRequests = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const attributes = require_attributes();
	const core = require_cjs$4();
	const opentelemetry = require_cjs$3();
	const nextSpanAttributes = require_nextSpanAttributes();
	const tunnelPathnameMatch = require_tunnelPathnameMatch();
	const spanAttributesWithLogicAttached = require_span_attributes_with_logic_attached();
	const globalWithInjectedValues = core.GLOBAL_OBJ;
	function dropMiddlewareTunnelRequests(span, attrs) {
		if (core.getClient()?.getOptions()?.skipOpenTelemetrySetup) return;
		const isMiddleware = attrs?.[nextSpanAttributes.ATTR_NEXT_SPAN_TYPE] === "Middleware.execute";
		const isFetchSpan = attrs?.[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN] === "auto.http.otel.node_fetch";
		const isBaseServerHandleRequest = attrs?.[nextSpanAttributes.ATTR_NEXT_SPAN_TYPE] === "BaseServer.handleRequest";
		if (!isMiddleware && !isFetchSpan && !isBaseServerHandleRequest) return;
		const isTunnel = isTunnelRouteSpan(attrs || {});
		const isSentry = opentelemetry.isSentryRequestSpan(span);
		if (isTunnel || isSentry) span.setAttribute(spanAttributesWithLogicAttached.TRANSACTION_ATTR_SHOULD_DROP_TRANSACTION, true);
	}
	function isTunnelRouteSpan(spanAttributes) {
		const tunnelPath = globalWithInjectedValues._sentryRewritesTunnelPath || process.env._sentryRewritesTunnelPath;
		if (!tunnelPath) return false;
		const httpTarget = spanAttributes[attributes.HTTP_TARGET];
		if (typeof httpTarget === "string") {
			const pathname = httpTarget.split("?")[0] || "";
			return tunnelPathnameMatch.isPathnameUnderSentryTunnelRoute(pathname, tunnelPath);
		}
		return false;
	}
	exports.dropMiddlewareTunnelRequests = dropMiddlewareTunnelRequests;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/common/utils/tracingUtils.js
var require_tracingUtils = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const attributes = require_attributes();
	const core = require_cjs$4();
	const debugBuild = require_debug_build();
	const nextSpanAttributes = require_nextSpanAttributes();
	const spanAttributesWithLogicAttached = require_span_attributes_with_logic_attached();
	const PAGE_SEGMENT = "__PAGE__";
	const commonIsolationScopeMap = /* @__PURE__ */ new WeakMap();
	function commonObjectToIsolationScope(commonObject) {
		if (typeof commonObject === "object" && commonObject) {
			const memoIsolationScope = commonIsolationScopeMap.get(commonObject);
			if (memoIsolationScope) return memoIsolationScope;
			else {
				const newIsolationScope = new core.Scope();
				commonIsolationScopeMap.set(commonObject, newIsolationScope);
				return newIsolationScope;
			}
		} else return new core.Scope();
	}
	let nextjsEscapedAsyncStorage;
	function escapeNextjsTracing(cb) {
		const MaybeGlobalAsyncLocalStorage = core.GLOBAL_OBJ.AsyncLocalStorage;
		if (!MaybeGlobalAsyncLocalStorage) {
			debugBuild.DEBUG_BUILD && core.debug.warn("Tried to register AsyncLocalStorage async context strategy in a runtime that doesn't support AsyncLocalStorage.");
			return cb();
		}
		if (!nextjsEscapedAsyncStorage) nextjsEscapedAsyncStorage = new MaybeGlobalAsyncLocalStorage();
		if (nextjsEscapedAsyncStorage.getStore()) return cb();
		else return core.startNewTrace(() => {
			return nextjsEscapedAsyncStorage.run(true, () => {
				return cb();
			});
		});
	}
	function dropNextjsRootContext() {
		if (core.getClient()?.getOptions()?.skipOpenTelemetrySetup) return;
		const nextJsOwnedSpan = core.getActiveSpan();
		if (nextJsOwnedSpan) {
			const rootSpan = core.getRootSpan(nextJsOwnedSpan);
			if (core.spanToJSON(rootSpan).data?.["next.span_type"]) core.getRootSpan(nextJsOwnedSpan)?.setAttribute(spanAttributesWithLogicAttached.TRANSACTION_ATTR_SHOULD_DROP_TRANSACTION, true);
		}
	}
	function isResolveSegmentSpan(spanAttributes) {
		return spanAttributes[nextSpanAttributes.ATTR_NEXT_SPAN_TYPE] === "NextNodeServer.getLayoutOrPageModule" && spanAttributes[nextSpanAttributes.ATTR_NEXT_SPAN_NAME] === "resolve segment modules" && typeof spanAttributes[nextSpanAttributes.ATTR_NEXT_SEGMENT] === "string";
	}
	function getEnhancedResolveSegmentSpanName({ segment, route }) {
		if (segment === PAGE_SEGMENT) return `resolve page server component "${route}"`;
		if (segment === "") return "resolve root layout server component";
		return `resolve layout server component "${segment}"`;
	}
	function maybeEnhanceServerComponentSpanName(activeSpan, spanAttributes, rootSpanAttributes) {
		if (!isResolveSegmentSpan(spanAttributes)) return;
		const segment = spanAttributes[nextSpanAttributes.ATTR_NEXT_SEGMENT];
		const route = rootSpanAttributes[attributes.HTTP_ROUTE];
		const enhancedName = getEnhancedResolveSegmentSpanName({
			segment,
			route: typeof route === "string" ? route : ""
		});
		activeSpan.updateName(enhancedName);
		activeSpan.setAttributes({
			"sentry.nextjs.ssr.function.type": segment === PAGE_SEGMENT ? "Page" : "Layout",
			"sentry.nextjs.ssr.function.route": route
		});
		activeSpan.setAttribute(core.SEMANTIC_ATTRIBUTE_SENTRY_OP, "function.nextjs");
	}
	exports.commonObjectToIsolationScope = commonObjectToIsolationScope;
	exports.dropNextjsRootContext = dropNextjsRootContext;
	exports.escapeNextjsTracing = escapeNextjsTracing;
	exports.getEnhancedResolveSegmentSpanName = getEnhancedResolveSegmentSpanName;
	exports.isResolveSegmentSpan = isResolveSegmentSpan;
	exports.maybeEnhanceServerComponentSpanName = maybeEnhanceServerComponentSpanName;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/server/vercelCronsMonitoring.js
var require_vercelCronsMonitoring = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const debugBuild = require_debug_build();
	const ATTR_SENTRY_CRON_CHECK_IN_ID = "sentry.cron.checkInId";
	const ATTR_SENTRY_CRON_MONITOR_SLUG = "sentry.cron.monitorSlug";
	const ATTR_SENTRY_CRON_START_TIME = "sentry.cron.startTime";
	const ATTR_SENTRY_CRON_SCHEDULE = "sentry.cron.schedule";
	function getVercelCronsConfig() {
		const globalWithCronsConfig = globalThis;
		if (!globalWithCronsConfig._sentryVercelCronsConfig) return;
		try {
			return JSON.parse(globalWithCronsConfig._sentryVercelCronsConfig);
		} catch {
			debugBuild.DEBUG_BUILD && core.debug.log("[@sentry/nextjs] Failed to parse Vercel crons config");
			return;
		}
	}
	function maybeStartCronCheckIn(span, route) {
		const vercelCronsConfig = getVercelCronsConfig();
		if (!vercelCronsConfig || !route) return;
		const headers = core.getIsolationScope().getScopeData().sdkProcessingMetadata?.normalizedRequest?.headers;
		if (!headers) return;
		if (!(Array.isArray(headers["user-agent"]) ? headers["user-agent"][0] : headers["user-agent"])?.includes("vercel-cron")) return;
		const matchedCron = vercelCronsConfig.find((cron) => cron.path === route);
		if (!matchedCron?.path || !matchedCron.schedule) return;
		const monitorSlug = matchedCron.path;
		const startTime = core._INTERNAL_safeDateNow() / 1e3;
		const checkInId = core.captureCheckIn({
			monitorSlug,
			status: "in_progress"
		}, {
			maxRuntime: 720,
			schedule: {
				type: "crontab",
				value: matchedCron.schedule
			}
		});
		debugBuild.DEBUG_BUILD && core.debug.log(`[Cron] Started check-in for "${monitorSlug}" with ID "${checkInId}"`);
		span.setAttribute(ATTR_SENTRY_CRON_CHECK_IN_ID, checkInId);
		span.setAttribute(ATTR_SENTRY_CRON_MONITOR_SLUG, monitorSlug);
		span.setAttribute(ATTR_SENTRY_CRON_START_TIME, startTime);
		span.setAttribute(ATTR_SENTRY_CRON_SCHEDULE, matchedCron.schedule);
	}
	function maybeCompleteCronCheckIn(span) {
		const spanData = core.spanToJSON(span).data;
		const checkInId = spanData?.[ATTR_SENTRY_CRON_CHECK_IN_ID];
		const monitorSlug = spanData?.[ATTR_SENTRY_CRON_MONITOR_SLUG];
		const startTime = spanData?.[ATTR_SENTRY_CRON_START_TIME];
		const schedule = spanData?.[ATTR_SENTRY_CRON_SCHEDULE];
		if (!checkInId || !monitorSlug || typeof startTime !== "number") return;
		const duration = core._INTERNAL_safeDateNow() / 1e3 - startTime;
		const spanStatus = core.spanToJSON(span).status;
		const checkInStatus = spanStatus && spanStatus !== "ok" ? "error" : "ok";
		const monitorConfig = typeof schedule === "string" ? {
			maxRuntime: 720,
			schedule: {
				type: "crontab",
				value: schedule
			}
		} : void 0;
		core.captureCheckIn({
			checkInId,
			monitorSlug,
			status: checkInStatus,
			duration
		}, monitorConfig);
		span.setAttribute(ATTR_SENTRY_CRON_CHECK_IN_ID, void 0);
		span.setAttribute(ATTR_SENTRY_CRON_MONITOR_SLUG, void 0);
		span.setAttribute(ATTR_SENTRY_CRON_START_TIME, void 0);
		span.setAttribute(ATTR_SENTRY_CRON_SCHEDULE, void 0);
		debugBuild.DEBUG_BUILD && core.debug.log(`[Cron] Completed check-in for "${monitorSlug}" with status "${checkInStatus}"`);
	}
	exports.maybeCompleteCronCheckIn = maybeCompleteCronCheckIn;
	exports.maybeStartCronCheckIn = maybeStartCronCheckIn;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/server/vercelQueuesMonitoring.js
var require_vercelQueuesMonitoring = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const ATTR_MESSAGING_SYSTEM = "messaging.system";
	const ATTR_MESSAGING_DESTINATION_NAME = "messaging.destination.name";
	const ATTR_MESSAGING_MESSAGE_ID = "messaging.message.id";
	const ATTR_MESSAGING_OPERATION_NAME = "messaging.operation.name";
	const ATTR_MESSAGING_CONSUMER_GROUP_NAME = "messaging.consumer.group.name";
	const ATTR_MESSAGING_MESSAGE_DELIVERY_COUNT = "messaging.message.delivery_count";
	const ATTR_SENTRY_QUEUE_ENRICHED = "sentry.queue.enriched";
	function maybeEnrichQueueConsumerSpan(span) {
		const headers = core.getIsolationScope().getScopeData().sdkProcessingMetadata?.normalizedRequest?.headers;
		if (!headers) return;
		if ((Array.isArray(headers["ce-type"]) ? headers["ce-type"][0] : headers["ce-type"]) !== "com.vercel.queue.v2beta") return;
		const queueName = getHeader(headers, "ce-vqsqueuename");
		const messageId = getHeader(headers, "ce-vqsmessageid");
		const consumerGroup = getHeader(headers, "ce-vqsconsumergroup");
		const deliveryCount = getHeader(headers, "ce-vqsdeliverycount");
		span.setAttribute(ATTR_MESSAGING_SYSTEM, "vercel.queue");
		span.setAttribute(ATTR_MESSAGING_OPERATION_NAME, "process");
		if (queueName) span.setAttribute(ATTR_MESSAGING_DESTINATION_NAME, queueName);
		if (messageId) span.setAttribute(ATTR_MESSAGING_MESSAGE_ID, messageId);
		if (consumerGroup) span.setAttribute(ATTR_MESSAGING_CONSUMER_GROUP_NAME, consumerGroup);
		if (deliveryCount) {
			const count = parseInt(deliveryCount, 10);
			if (!isNaN(count)) span.setAttribute(ATTR_MESSAGING_MESSAGE_DELIVERY_COUNT, count);
		}
		span.setAttribute(ATTR_SENTRY_QUEUE_ENRICHED, true);
	}
	function maybeEnrichQueueProducerSpan(span) {
		const urlFull = core.spanToJSON(span).data?.["url.full"];
		if (!urlFull) return;
		let parsed;
		try {
			parsed = new URL(urlFull);
		} catch {
			return;
		}
		if (parsed.hostname !== "vercel-queue.com" && !parsed.hostname.endsWith(".vercel-queue.com")) return;
		const topicMatch = parsed.pathname.match(/^\/api\/v3\/topic\/([^/]+)/);
		if (!topicMatch) return;
		const topic = decodeURIComponent(topicMatch[1]);
		span.setAttribute(ATTR_MESSAGING_SYSTEM, "vercel.queue");
		span.setAttribute(ATTR_MESSAGING_DESTINATION_NAME, topic);
		span.setAttribute(ATTR_MESSAGING_OPERATION_NAME, "send");
		span.setAttribute(ATTR_SENTRY_QUEUE_ENRICHED, true);
	}
	function maybeCleanupQueueSpan(span) {
		if (core.spanToJSON(span).data?.[ATTR_SENTRY_QUEUE_ENRICHED]) span.setAttribute(ATTR_SENTRY_QUEUE_ENRICHED, void 0);
	}
	function getHeader(headers, name) {
		const value = headers[name];
		return Array.isArray(value) ? value[0] : value;
	}
	exports.maybeCleanupQueueSpan = maybeCleanupQueueSpan;
	exports.maybeEnrichQueueConsumerSpan = maybeEnrichQueueConsumerSpan;
	exports.maybeEnrichQueueProducerSpan = maybeEnrichQueueProducerSpan;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/server/handleOnSpanStart.js
var require_handleOnSpanStart = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const api = require_src();
	const attributes = require_attributes();
	const core = require_cjs$4();
	const opentelemetry = require_cjs$3();
	const nextSpanAttributes = require_nextSpanAttributes();
	const addHeadersAsAttributes = require_addHeadersAsAttributes();
	const dropMiddlewareTunnelRequests = require_dropMiddlewareTunnelRequests();
	const tracingUtils = require_tracingUtils();
	const vercelCronsMonitoring = require_vercelCronsMonitoring();
	const vercelQueuesMonitoring = require_vercelQueuesMonitoring();
	function handleOnSpanStart(span) {
		const spanAttributes = core.spanToJSON(span).data;
		const rootSpan = core.getRootSpan(span);
		const rootSpanAttributes = core.spanToJSON(rootSpan).data;
		const isRootSpan = span === rootSpan;
		dropMiddlewareTunnelRequests.dropMiddlewareTunnelRequests(span, spanAttributes);
		if (typeof spanAttributes?.[nextSpanAttributes.ATTR_NEXT_ROUTE] === "string") {
			if ((rootSpanAttributes?.[attributes.HTTP_REQUEST_METHOD] || rootSpanAttributes?.[attributes.HTTP_METHOD]) && !rootSpanAttributes?.[attributes.HTTP_ROUTE]) {
				const route = spanAttributes[nextSpanAttributes.ATTR_NEXT_ROUTE].replace(/\/route$/, "");
				rootSpan.updateName(route);
				rootSpan.setAttribute(attributes.HTTP_ROUTE, route);
				rootSpan.setAttribute(nextSpanAttributes.ATTR_NEXT_ROUTE, route);
				const method = rootSpanAttributes?.[attributes.HTTP_REQUEST_METHOD] || rootSpanAttributes?.[attributes.HTTP_METHOD];
				if (typeof method === "string") core.getIsolationScope().setTransactionName(`${method} ${route}`);
				vercelCronsMonitoring.maybeStartCronCheckIn(rootSpan, route);
				vercelQueuesMonitoring.maybeEnrichQueueConsumerSpan(rootSpan);
			}
		}
		if (spanAttributes?.[nextSpanAttributes.ATTR_NEXT_SPAN_TYPE] === "Middleware.execute") {
			const middlewareName = spanAttributes[nextSpanAttributes.ATTR_NEXT_SPAN_NAME];
			if (typeof middlewareName === "string") {
				rootSpan.updateName(middlewareName);
				rootSpan.setAttribute(attributes.HTTP_ROUTE, middlewareName);
				rootSpan.setAttribute(nextSpanAttributes.ATTR_NEXT_SPAN_NAME, middlewareName);
			}
			span.setAttribute(core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, "auto");
		}
		if (spanAttributes?.[nextSpanAttributes.ATTR_NEXT_SPAN_TYPE] !== void 0) span.setAttribute(core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, "auto");
		if (isRootSpan) {
			const headers = core.getIsolationScope().getScopeData().sdkProcessingMetadata?.normalizedRequest?.headers;
			addHeadersAsAttributes.addHeadersAsAttributes(headers, rootSpan);
		}
		if (spanAttributes?.[nextSpanAttributes.ATTR_NEXT_SPAN_TYPE] === "BaseServer.handleRequest" && isRootSpan) {
			const scopes = core.getCapturedScopesOnSpan(span);
			const isolationScope = (scopes.isolationScope || core.getIsolationScope()).clone();
			const scope = scopes.scope || core.getCurrentScope();
			const currentScopesPointer = opentelemetry.getScopesFromContext(api.context.active());
			if (currentScopesPointer) currentScopesPointer.isolationScope = isolationScope;
			core.setCapturedScopesOnSpan(span, scope, isolationScope);
		}
		tracingUtils.maybeEnhanceServerComponentSpanName(span, spanAttributes, rootSpanAttributes);
		vercelQueuesMonitoring.maybeEnrichQueueProducerSpan(span);
	}
	exports.handleOnSpanStart = handleOnSpanStart;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/server/prepareSafeIdGeneratorContext.js
var require_prepareSafeIdGeneratorContext = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const debugBuild = require_debug_build();
	function prepareSafeIdGeneratorContext() {
		const sym = /* @__PURE__ */ Symbol.for("__SENTRY_SAFE_RANDOM_ID_WRAPPER__");
		const globalWithSymbol = core.GLOBAL_OBJ;
		const initialSnapshot = getAsyncLocalStorageSnapshot();
		if (!initialSnapshot) return;
		let cachedSnapshot = initialSnapshot;
		globalWithSymbol[sym] = (callback) => {
			try {
				return cachedSnapshot(callback);
			} catch (error) {
				if (!isAsyncLocalStorageError(error)) throw error;
				const freshSnapshot = getAsyncLocalStorageSnapshot();
				if (!freshSnapshot) return callback();
				cachedSnapshot = freshSnapshot;
				try {
					return cachedSnapshot(callback);
				} catch (retryError) {
					if (!isAsyncLocalStorageError(retryError)) throw retryError;
					return callback();
				}
			}
		};
		debugBuild.DEBUG_BUILD && core.debug.log("[@sentry/nextjs] Prepared safe random ID generator context");
	}
	function getAsyncLocalStorage() {
		if (typeof AsyncLocalStorage !== "undefined") return AsyncLocalStorage;
		if ("getBuiltinModule" in process && typeof process.getBuiltinModule === "function") {
			const { AsyncLocalStorage: AsyncLocalStorage2 } = process.getBuiltinModule("async_hooks") ?? {};
			return AsyncLocalStorage2;
		}
	}
	function getAsyncLocalStorageSnapshot() {
		const als = getAsyncLocalStorage();
		if (!als || typeof als.snapshot !== "function") {
			debugBuild.DEBUG_BUILD && core.debug.warn("[@sentry/nextjs] No AsyncLocalStorage found in the runtime or AsyncLocalStorage.snapshot() is not available, skipping safe random ID generator context preparation, you may see some errors with cache components.");
			return;
		}
		return als.snapshot();
	}
	function isAsyncLocalStorageError(error) {
		return error instanceof Error && error.message.includes("AsyncLocalStorage");
	}
	exports.prepareSafeIdGeneratorContext = prepareSafeIdGeneratorContext;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/common/pages-router-instrumentation/_error.js
var require__error = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const responseEnd = require_responseEnd();
	async function captureUnderscoreErrorException(contextOrProps) {
		const { req, res, err } = contextOrProps;
		const statusCode = res?.statusCode || contextOrProps.statusCode;
		if (statusCode && statusCode < 500) return;
		if (!contextOrProps.pathname) return;
		if (err && core.isAlreadyCaptured(err)) {
			responseEnd.waitUntil(responseEnd.flushSafelyWithTimeout());
			const storedEventId = typeof err === "object" ? err.__sentry_event_id__ : void 0;
			if (typeof storedEventId === "string") {
				core.getIsolationScope().setLastEventId(storedEventId);
				return storedEventId;
			}
			return core.getIsolationScope().lastEventId();
		}
		const eventId = core.withScope((scope) => {
			if (req) {
				const normalizedRequest = core.httpRequestToRequestData(req);
				scope.setSDKProcessingMetadata({ normalizedRequest });
			}
			return core.captureException(err || `_error.js called with falsy error (${err})`, { mechanism: {
				type: "auto.function.nextjs.underscore_error",
				handled: false,
				data: { function: "_error.getInitialProps" }
			} });
		});
		responseEnd.waitUntil(responseEnd.flushSafelyWithTimeout());
		return eventId;
	}
	exports.captureUnderscoreErrorException = captureUnderscoreErrorException;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/common/utils/isUseCacheFunction.js
var require_isUseCacheFunction = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	function extractInfoFromServerReferenceId(id) {
		const infoByte = parseInt(id.slice(0, 2), 16);
		const typeBit = infoByte >> 7 & 1;
		const argMask = infoByte >> 1 & 63;
		const restArgs = infoByte & 1;
		const usedArgs = Array(6);
		for (let index = 0; index < 6; index++) usedArgs[index] = (argMask >> 5 - index & 1) === 1;
		return {
			type: typeBit === 1 ? "use-cache" : "server-action",
			usedArgs,
			hasRestArgs: restArgs === 1
		};
	}
	function isServerReference(value) {
		return value.$$typeof === /* @__PURE__ */ Symbol.for("react.server.reference");
	}
	function isUseCacheFunction(value) {
		if (!isServerReference(value)) return false;
		const { type } = extractInfoFromServerReferenceId(value.$$id);
		return type === "use-cache";
	}
	exports.isUseCacheFunction = isUseCacheFunction;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/common/utils/nextSpan.js
var require_nextSpan = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const debugBuild = require_debug_build();
	const isBuild = require_isBuild();
	const isUseCacheFunction = require_isUseCacheFunction();
	function shouldNoopSpan(callback) {
		const isBuildContext = isBuild.isBuild();
		const isUseCacheFunctionContext = callback ? isUseCacheFunction.isUseCacheFunction(callback) : false;
		if (isUseCacheFunctionContext) debugBuild.DEBUG_BUILD && core.debug.log("Skipping span creation in Cache Components context");
		return isBuildContext || isUseCacheFunctionContext;
	}
	function createNonRecordingSpan() {
		return new core.SentryNonRecordingSpan({
			traceId: "00000000000000000000000000000000",
			spanId: "0000000000000000"
		});
	}
	function startSpan(options, callback) {
		if (shouldNoopSpan(callback)) return callback(createNonRecordingSpan());
		return core.startSpan(options, callback);
	}
	function startSpanManual(options, callback) {
		if (shouldNoopSpan(callback)) {
			const nonRecordingSpan = createNonRecordingSpan();
			return callback(nonRecordingSpan, () => nonRecordingSpan.end());
		}
		return core.startSpanManual(options, callback);
	}
	function startInactiveSpan(options) {
		if (shouldNoopSpan()) return createNonRecordingSpan();
		return core.startInactiveSpan(options);
	}
	exports.startInactiveSpan = startInactiveSpan;
	exports.startSpan = startSpan;
	exports.startSpanManual = startSpanManual;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/common/utils/wrapperUtils.js
var require_wrapperUtils = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const spanAttributesWithLogicAttached = require_span_attributes_with_logic_attached();
	function withErrorInstrumentation(origFunction) {
		return async function(...origFunctionArguments) {
			try {
				return await origFunction.apply(this, origFunctionArguments);
			} catch (e) {
				core.captureException(e, { mechanism: {
					handled: false,
					type: "auto.function.nextjs.wrapped",
					data: { function: origFunction.name }
				} });
				throw e;
			}
		};
	}
	function withTracedServerSideDataFetcher(origDataFetcher, req, res, options) {
		return async function(...args) {
			const normalizedRequest = core.httpRequestToRequestData(req);
			core.getCurrentScope().setTransactionName(`${options.dataFetchingMethodName} (${options.dataFetcherRouteName})`);
			core.getIsolationScope().setSDKProcessingMetadata({ normalizedRequest });
			const span = core.getActiveSpan();
			if (span && options.requestedRouteName !== "/_error") core.getRootSpan(span).setAttribute(spanAttributesWithLogicAttached.TRANSACTION_ATTR_SENTRY_ROUTE_BACKFILL, options.requestedRouteName);
			const { "sentry-trace": sentryTrace, baggage } = core.getTraceData();
			return {
				sentryTrace,
				baggage,
				data: await origDataFetcher.apply(this, args)
			};
		};
	}
	async function callDataFetcherTraced(origFunction, origFunctionArgs) {
		try {
			return await origFunction(...origFunctionArgs);
		} catch (e) {
			core.captureException(e, { mechanism: {
				handled: false,
				type: "auto.function.nextjs.data_fetcher"
			} });
			throw e;
		}
	}
	exports.callDataFetcherTraced = callDataFetcherTraced;
	exports.withErrorInstrumentation = withErrorInstrumentation;
	exports.withTracedServerSideDataFetcher = withTracedServerSideDataFetcher;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/common/pages-router-instrumentation/wrapGetStaticPropsWithSentry.js
var require_wrapGetStaticPropsWithSentry = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const isBuild = require_isBuild();
	const wrapperUtils = require_wrapperUtils();
	function wrapGetStaticPropsWithSentry(origGetStaticPropsa, _parameterizedRoute) {
		return new Proxy(origGetStaticPropsa, { apply: async (wrappingTarget, thisArg, args) => {
			if (isBuild.isBuild()) return wrappingTarget.apply(thisArg, args);
			const errorWrappedGetStaticProps = wrapperUtils.withErrorInstrumentation(wrappingTarget);
			return wrapperUtils.callDataFetcherTraced(errorWrappedGetStaticProps, args);
		} });
	}
	exports.wrapGetStaticPropsWithSentry = wrapGetStaticPropsWithSentry;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/common/pages-router-instrumentation/wrapGetInitialPropsWithSentry.js
var require_wrapGetInitialPropsWithSentry = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const isBuild = require_isBuild();
	const wrapperUtils = require_wrapperUtils();
	function wrapGetInitialPropsWithSentry(origGetInitialProps) {
		return new Proxy(origGetInitialProps, { apply: async (wrappingTarget, thisArg, args) => {
			if (isBuild.isBuild()) return wrappingTarget.apply(thisArg, args);
			const [context] = args;
			const { req, res } = context;
			const errorWrappedGetInitialProps = wrapperUtils.withErrorInstrumentation(wrappingTarget);
			if (req && res) {
				const { data: initialProps, baggage, sentryTrace } = await wrapperUtils.withTracedServerSideDataFetcher(errorWrappedGetInitialProps, req, res, {
					dataFetcherRouteName: context.pathname,
					requestedRouteName: context.pathname,
					dataFetchingMethodName: "getInitialProps"
				}).apply(thisArg, args) ?? {};
				if (typeof initialProps === "object" && initialProps !== null) {
					if (sentryTrace) initialProps._sentryTraceData = sentryTrace;
					if (baggage) initialProps._sentryBaggage = baggage;
				}
				return initialProps;
			} else return errorWrappedGetInitialProps.apply(thisArg, args);
		} });
	}
	exports.wrapGetInitialPropsWithSentry = wrapGetInitialPropsWithSentry;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/common/pages-router-instrumentation/wrapAppGetInitialPropsWithSentry.js
var require_wrapAppGetInitialPropsWithSentry = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const isBuild = require_isBuild();
	const wrapperUtils = require_wrapperUtils();
	function wrapAppGetInitialPropsWithSentry(origAppGetInitialProps) {
		return new Proxy(origAppGetInitialProps, { apply: async (wrappingTarget, thisArg, args) => {
			if (isBuild.isBuild()) return wrappingTarget.apply(thisArg, args);
			const [context] = args;
			const { req, res } = context.ctx;
			const errorWrappedAppGetInitialProps = wrapperUtils.withErrorInstrumentation(wrappingTarget);
			if (req && res) {
				const { data: appGetInitialProps, sentryTrace, baggage } = await wrapperUtils.withTracedServerSideDataFetcher(errorWrappedAppGetInitialProps, req, res, {
					dataFetcherRouteName: "/_app",
					requestedRouteName: context.ctx.pathname,
					dataFetchingMethodName: "getInitialProps"
				}).apply(thisArg, args);
				if (typeof appGetInitialProps === "object" && appGetInitialProps !== null) {
					if (!appGetInitialProps.pageProps) appGetInitialProps.pageProps = {};
					if (sentryTrace) appGetInitialProps.pageProps._sentryTraceData = sentryTrace;
					if (baggage) appGetInitialProps.pageProps._sentryBaggage = baggage;
				}
				return appGetInitialProps;
			} else return errorWrappedAppGetInitialProps.apply(thisArg, args);
		} });
	}
	exports.wrapAppGetInitialPropsWithSentry = wrapAppGetInitialPropsWithSentry;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/common/pages-router-instrumentation/wrapDocumentGetInitialPropsWithSentry.js
var require_wrapDocumentGetInitialPropsWithSentry = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const isBuild = require_isBuild();
	const wrapperUtils = require_wrapperUtils();
	function wrapDocumentGetInitialPropsWithSentry(origDocumentGetInitialProps) {
		return new Proxy(origDocumentGetInitialProps, { apply: async (wrappingTarget, thisArg, args) => {
			if (isBuild.isBuild()) return wrappingTarget.apply(thisArg, args);
			const [context] = args;
			const { req, res } = context;
			const errorWrappedGetInitialProps = wrapperUtils.withErrorInstrumentation(wrappingTarget);
			if (req && res) {
				const { data } = await wrapperUtils.withTracedServerSideDataFetcher(errorWrappedGetInitialProps, req, res, {
					dataFetcherRouteName: "/_document",
					requestedRouteName: context.pathname,
					dataFetchingMethodName: "getInitialProps"
				}).apply(thisArg, args);
				return data;
			} else return errorWrappedGetInitialProps.apply(thisArg, args);
		} });
	}
	exports.wrapDocumentGetInitialPropsWithSentry = wrapDocumentGetInitialPropsWithSentry;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/common/pages-router-instrumentation/wrapErrorGetInitialPropsWithSentry.js
var require_wrapErrorGetInitialPropsWithSentry = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const isBuild = require_isBuild();
	const wrapperUtils = require_wrapperUtils();
	function wrapErrorGetInitialPropsWithSentry(origErrorGetInitialProps) {
		return new Proxy(origErrorGetInitialProps, { apply: async (wrappingTarget, thisArg, args) => {
			if (isBuild.isBuild()) return wrappingTarget.apply(thisArg, args);
			const [context] = args;
			const { req, res } = context;
			const errorWrappedGetInitialProps = wrapperUtils.withErrorInstrumentation(wrappingTarget);
			if (req && res) {
				const { data: errorGetInitialProps, baggage, sentryTrace } = await wrapperUtils.withTracedServerSideDataFetcher(errorWrappedGetInitialProps, req, res, {
					dataFetcherRouteName: "/_error",
					requestedRouteName: context.pathname,
					dataFetchingMethodName: "getInitialProps"
				}).apply(thisArg, args);
				if (typeof errorGetInitialProps === "object" && errorGetInitialProps !== null) {
					if (sentryTrace) errorGetInitialProps._sentryTraceData = sentryTrace;
					if (baggage) errorGetInitialProps._sentryBaggage = baggage;
				}
				return errorGetInitialProps;
			} else return errorWrappedGetInitialProps.apply(thisArg, args);
		} });
	}
	exports.wrapErrorGetInitialPropsWithSentry = wrapErrorGetInitialPropsWithSentry;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/common/pages-router-instrumentation/wrapGetServerSidePropsWithSentry.js
var require_wrapGetServerSidePropsWithSentry = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const isBuild = require_isBuild();
	const wrapperUtils = require_wrapperUtils();
	function wrapGetServerSidePropsWithSentry(origGetServerSideProps, parameterizedRoute) {
		return new Proxy(origGetServerSideProps, { apply: async (wrappingTarget, thisArg, args) => {
			if (isBuild.isBuild()) return wrappingTarget.apply(thisArg, args);
			const [context] = args;
			const { req, res } = context;
			const errorWrappedGetServerSideProps = wrapperUtils.withErrorInstrumentation(wrappingTarget);
			const { data: serverSideProps, baggage, sentryTrace } = await wrapperUtils.withTracedServerSideDataFetcher(errorWrappedGetServerSideProps, req, res, {
				dataFetcherRouteName: parameterizedRoute,
				requestedRouteName: parameterizedRoute,
				dataFetchingMethodName: "getServerSideProps"
			}).apply(thisArg, args);
			if (typeof serverSideProps === "object" && serverSideProps !== null && "props" in serverSideProps) {
				if (sentryTrace) serverSideProps.props._sentryTraceData = sentryTrace;
				if (baggage) serverSideProps.props._sentryBaggage = baggage;
			}
			return serverSideProps;
		} });
	}
	exports.wrapGetServerSidePropsWithSentry = wrapGetServerSidePropsWithSentry;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/common/nextNavigationErrorUtils.js
var require_nextNavigationErrorUtils = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	function isNotFoundNavigationError(subject) {
		return core.isError(subject) && ["NEXT_NOT_FOUND", "NEXT_HTTP_ERROR_FALLBACK;404"].includes(subject.digest);
	}
	function isRedirectNavigationError(subject) {
		return core.isError(subject) && typeof subject.digest === "string" && subject.digest.startsWith("NEXT_REDIRECT;");
	}
	exports.isNotFoundNavigationError = isNotFoundNavigationError;
	exports.isRedirectNavigationError = isRedirectNavigationError;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/common/wrapServerComponentWithSentry.js
var require_wrapServerComponentWithSentry = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const nextNavigationErrorUtils = require_nextNavigationErrorUtils();
	const responseEnd = require_responseEnd();
	function wrapServerComponentWithSentry(appDirComponent, context) {
		return new Proxy(appDirComponent, { apply: (originalFunction, thisArg, args) => {
			const isolationScope = core.getIsolationScope();
			const headersDict = context.headers ? core.winterCGHeadersToDict(context.headers) : void 0;
			isolationScope.setSDKProcessingMetadata({ normalizedRequest: { headers: headersDict } });
			return core.handleCallbackErrors(() => originalFunction.apply(thisArg, args), (error) => {
				const span = core.getActiveSpan();
				const { componentRoute, componentType } = context;
				let shouldCapture = true;
				isolationScope.setTransactionName(`${componentType} Server Component (${componentRoute})`);
				if (span) if (nextNavigationErrorUtils.isNotFoundNavigationError(error)) {
					shouldCapture = false;
					span.setStatus({
						code: core.SPAN_STATUS_ERROR,
						message: "not_found"
					});
				} else if (nextNavigationErrorUtils.isRedirectNavigationError(error)) {
					shouldCapture = false;
					span.setStatus({ code: core.SPAN_STATUS_OK });
				} else span.setStatus({
					code: core.SPAN_STATUS_ERROR,
					message: "internal_error"
				});
				if (shouldCapture) core.captureException(error, { mechanism: {
					handled: false,
					type: "auto.function.nextjs.server_component"
				} });
			}, () => {
				responseEnd.waitUntil(responseEnd.flushSafelyWithTimeout());
			});
		} });
	}
	exports.wrapServerComponentWithSentry = wrapServerComponentWithSentry;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/common/wrapRouteHandlerWithSentry.js
var require_wrapRouteHandlerWithSentry = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const nextNavigationErrorUtils = require_nextNavigationErrorUtils();
	const responseEnd = require_responseEnd();
	const tracingUtils = require_tracingUtils();
	function wrapRouteHandlerWithSentry(routeHandler, context) {
		const { method, parameterizedRoute, headers } = context;
		return new Proxy(routeHandler, { apply: async (originalFunction, thisArg, args) => {
			const activeSpan = core.getActiveSpan();
			const rootSpan = activeSpan ? core.getRootSpan(activeSpan) : void 0;
			let edgeRuntimeIsolationScopeOverride;
			if (rootSpan && process.env.NEXT_RUNTIME === "edge") {
				const isolationScope = tracingUtils.commonObjectToIsolationScope(headers);
				const { scope } = core.getCapturedScopesOnSpan(rootSpan);
				core.setCapturedScopesOnSpan(rootSpan, scope ?? new core.Scope(), isolationScope);
				edgeRuntimeIsolationScopeOverride = isolationScope;
				rootSpan.updateName(`${method} ${parameterizedRoute}`);
				rootSpan.setAttribute(core.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, "route");
				rootSpan.setAttribute(core.SEMANTIC_ATTRIBUTE_SENTRY_OP, "http.server");
			}
			return core.withIsolationScope(process.env.NEXT_RUNTIME === "edge" ? edgeRuntimeIsolationScopeOverride : core.getIsolationScope(), () => {
				return core.withScope(async (scope) => {
					scope.setTransactionName(`${method} ${parameterizedRoute}`);
					if (process.env.NEXT_RUNTIME === "edge") {
						const completeHeadersDict = headers ? core.winterCGHeadersToDict(headers) : {};
						const incomingPropagationContext = core.propagationContextFromHeaders(completeHeadersDict["sentry-trace"], completeHeadersDict["baggage"]);
						scope.setPropagationContext(incomingPropagationContext);
						scope.setSDKProcessingMetadata({ normalizedRequest: {
							method,
							headers: completeHeadersDict
						} });
					}
					const response = await core.handleCallbackErrors(() => originalFunction.apply(thisArg, args), (error) => {
						if (nextNavigationErrorUtils.isRedirectNavigationError(error));
						else if (nextNavigationErrorUtils.isNotFoundNavigationError(error)) {
							if (activeSpan) core.setHttpStatus(activeSpan, 404);
							if (rootSpan) core.setHttpStatus(rootSpan, 404);
						} else core.captureException(error, { mechanism: {
							handled: false,
							type: "auto.function.nextjs.route_handler"
						} });
					}, () => {
						responseEnd.waitUntil(responseEnd.flushSafelyWithTimeout());
					});
					try {
						if (response.status) {
							if (activeSpan) core.setHttpStatus(activeSpan, response.status);
							if (rootSpan) core.setHttpStatus(rootSpan, response.status);
						}
					} catch {}
					return response;
				});
			});
		} });
	}
	exports.wrapRouteHandlerWithSentry = wrapRouteHandlerWithSentry;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/common/pages-router-instrumentation/wrapApiHandlerWithSentryVercelCrons.js
var require_wrapApiHandlerWithSentryVercelCrons = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	function wrapApiHandlerWithSentryVercelCrons(handler, vercelCronsConfig) {
		return new Proxy(handler, { apply: (originalFunction, thisArg, args) => {
			if (!args?.[0]) return originalFunction.apply(thisArg, args);
			const [req] = args;
			let maybePromiseResult;
			const cronsKey = "nextUrl" in req ? req.nextUrl.pathname : req.url;
			const userAgentHeader = "nextUrl" in req ? req.headers.get("user-agent") : req.headers["user-agent"];
			if (!vercelCronsConfig || !userAgentHeader?.includes("vercel-cron")) return originalFunction.apply(thisArg, args);
			const vercelCron = vercelCronsConfig.find((vercelCron2) => vercelCron2.path === cronsKey);
			if (!vercelCron?.path || !vercelCron.schedule) return originalFunction.apply(thisArg, args);
			const monitorSlug = vercelCron.path;
			const checkInId = core.captureCheckIn({
				monitorSlug,
				status: "in_progress"
			}, {
				maxRuntime: 720,
				schedule: {
					type: "crontab",
					value: vercelCron.schedule
				}
			});
			const startTime = core._INTERNAL_safeDateNow() / 1e3;
			const handleErrorCase = () => {
				core.captureCheckIn({
					checkInId,
					monitorSlug,
					status: "error",
					duration: core._INTERNAL_safeDateNow() / 1e3 - startTime
				});
			};
			try {
				maybePromiseResult = originalFunction.apply(thisArg, args);
			} catch (e) {
				handleErrorCase();
				throw e;
			}
			if (typeof maybePromiseResult === "object" && maybePromiseResult !== null && "then" in maybePromiseResult) {
				Promise.resolve(maybePromiseResult).then(() => {
					core.captureCheckIn({
						checkInId,
						monitorSlug,
						status: "ok",
						duration: core._INTERNAL_safeDateNow() / 1e3 - startTime
					});
				}, () => {
					handleErrorCase();
				});
				return maybePromiseResult;
			} else {
				core.captureCheckIn({
					checkInId,
					monitorSlug,
					status: "ok",
					duration: core._INTERNAL_safeDateNow() / 1e3 - startTime
				});
				return maybePromiseResult;
			}
		} });
	}
	exports.wrapApiHandlerWithSentryVercelCrons = wrapApiHandlerWithSentryVercelCrons;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/common/wrapMiddlewareWithSentry.js
var require_wrapMiddlewareWithSentry = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const responseEnd = require_responseEnd();
	const tunnelPathnameMatch = require_tunnelPathnameMatch();
	function wrapMiddlewareWithSentry(middleware) {
		return new Proxy(middleware, { apply: async (wrappingTarget, thisArg, args) => {
			const tunnelRoute = "_sentryRewritesTunnelPath" in globalThis ? globalThis._sentryRewritesTunnelPath : void 0;
			if (tunnelRoute && typeof tunnelRoute === "string") {
				const req = args[0];
				if (req instanceof Request) {
					const url = new URL(req.url);
					if (tunnelPathnameMatch.isPathnameUnderSentryTunnelRoute(url.pathname, tunnelRoute)) return new Response(null, {
						status: 200,
						headers: { "x-middleware-next": "1" }
					});
				}
			}
			return core.withIsolationScope((isolationScope) => {
				const req = args[0];
				const currentScope = core.getCurrentScope();
				let spanName;
				let spanSource;
				if (req instanceof Request) {
					isolationScope.setSDKProcessingMetadata({ normalizedRequest: core.winterCGRequestToRequestData(req) });
					spanName = `middleware ${req.method}`;
					spanSource = "url";
				} else {
					spanName = "middleware";
					spanSource = "component";
				}
				currentScope.setTransactionName(spanName);
				const activeSpan = core.getActiveSpan();
				if (activeSpan) {
					spanName = "middleware";
					spanSource = "component";
					const rootSpan = core.getRootSpan(activeSpan);
					if (rootSpan) core.setCapturedScopesOnSpan(rootSpan, currentScope, isolationScope);
				}
				return core.startSpan({
					name: spanName,
					op: "http.server.middleware",
					attributes: {
						[core.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: spanSource,
						[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.function.nextjs.wrap_middleware"
					}
				}, () => {
					return core.handleCallbackErrors(() => wrappingTarget.apply(thisArg, args), (error) => {
						core.captureException(error, { mechanism: {
							type: "auto.function.nextjs.wrap_middleware",
							handled: false
						} });
					}, () => {
						responseEnd.waitUntil(responseEnd.flushSafelyWithTimeout());
					});
				});
			});
		} });
	}
	exports.wrapMiddlewareWithSentry = wrapMiddlewareWithSentry;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/common/pages-router-instrumentation/wrapPageComponentWithSentry.js
var require_wrapPageComponentWithSentry = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	function storeCapturedEventIdOnError(error, eventId) {
		if (error && typeof error === "object") core.addNonEnumerableProperty(error, "__sentry_event_id__", eventId);
	}
	function isReactClassComponent(target) {
		return typeof target === "function" && target?.prototype?.isReactComponent;
	}
	function wrapPageComponentWithSentry(pageComponent) {
		if (isReactClassComponent(pageComponent)) return class SentryWrappedPageComponent extends pageComponent {
			render(...args) {
				return core.withIsolationScope(() => {
					const scope = core.getCurrentScope();
					const sentryTraceData = typeof this.props === "object" && this.props !== null && "_sentryTraceData" in this.props && typeof this.props._sentryTraceData === "string" ? this.props._sentryTraceData : void 0;
					if (sentryTraceData) {
						const traceparentData = core.extractTraceparentData(sentryTraceData);
						scope.setContext("trace", {
							span_id: traceparentData?.parentSpanId,
							trace_id: traceparentData?.traceId
						});
					}
					try {
						return super.render(...args);
					} catch (e) {
						storeCapturedEventIdOnError(e, core.captureException(e, { mechanism: {
							handled: false,
							type: "auto.function.nextjs.page_class"
						} }));
						throw e;
					}
				});
			}
		};
		else if (typeof pageComponent === "function") return new Proxy(pageComponent, { apply(target, thisArg, argArray) {
			return core.withIsolationScope(() => {
				const scope = core.getCurrentScope();
				const sentryTraceData = argArray?.[0]?._sentryTraceData;
				if (sentryTraceData) {
					const traceparentData = core.extractTraceparentData(sentryTraceData);
					scope.setContext("trace", {
						span_id: traceparentData?.parentSpanId,
						trace_id: traceparentData?.traceId
					});
				}
				try {
					return target.apply(thisArg, argArray);
				} catch (e) {
					storeCapturedEventIdOnError(e, core.captureException(e, { mechanism: {
						handled: false,
						type: "auto.function.nextjs.page_function"
					} }));
					throw e;
				}
			});
		} });
		else return pageComponent;
	}
	exports.wrapPageComponentWithSentry = wrapPageComponentWithSentry;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/common/wrapGenerationFunctionWithSentry.js
var require_wrapGenerationFunctionWithSentry = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const nextNavigationErrorUtils = require_nextNavigationErrorUtils();
	const responseEnd = require_responseEnd();
	function wrapGenerationFunctionWithSentry(generationFunction, context) {
		return new Proxy(generationFunction, { apply: (originalFunction, thisArg, args) => {
			const isolationScope = core.getIsolationScope();
			let headers = void 0;
			try {
				headers = context.requestAsyncStorage?.getStore()?.headers;
			} catch {}
			const headersDict = headers ? core.winterCGHeadersToDict(headers) : void 0;
			isolationScope.setSDKProcessingMetadata({ normalizedRequest: { headers: headersDict } });
			return core.handleCallbackErrors(() => originalFunction.apply(thisArg, args), (error) => {
				const span = core.getActiveSpan();
				const { componentRoute, componentType, generationFunctionIdentifier } = context;
				let shouldCapture = true;
				isolationScope.setTransactionName(`${componentType}.${generationFunctionIdentifier} (${componentRoute})`);
				if (span) if (nextNavigationErrorUtils.isNotFoundNavigationError(error)) {
					shouldCapture = false;
					span.setStatus({
						code: core.SPAN_STATUS_ERROR,
						message: "not_found"
					});
				} else if (nextNavigationErrorUtils.isRedirectNavigationError(error)) {
					shouldCapture = false;
					span.setStatus({ code: core.SPAN_STATUS_OK });
				} else span.setStatus({
					code: core.SPAN_STATUS_ERROR,
					message: "internal_error"
				});
				if (shouldCapture) core.captureException(error, { mechanism: {
					handled: false,
					type: "auto.function.nextjs.generation_function",
					data: { function: generationFunctionIdentifier }
				} });
			}, () => {
				responseEnd.waitUntil(responseEnd.flushSafelyWithTimeout());
			});
		} });
	}
	exports.wrapGenerationFunctionWithSentry = wrapGenerationFunctionWithSentry;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/common/withServerActionInstrumentation.js
var require_withServerActionInstrumentation = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const responseEnd = require_responseEnd();
	const debugBuild = require_debug_build();
	const nextNavigationErrorUtils = require_nextNavigationErrorUtils();
	function withServerActionInstrumentation(...args) {
		if (typeof args[1] === "function") {
			const [serverActionName, callback] = args;
			return withServerActionInstrumentationImplementation(serverActionName, {}, callback);
		} else {
			const [serverActionName, options, callback] = args;
			return withServerActionInstrumentationImplementation(serverActionName, options, callback);
		}
	}
	async function withServerActionInstrumentationImplementation(serverActionName, options, callback) {
		return core.withIsolationScope(async (isolationScope) => {
			const shouldRecordResponse = core.getClient()?.getDataCollectionOptions().httpBodies.includes("outgoingResponse");
			let sentryTraceHeader;
			let baggageHeader;
			const fullHeadersObject = {};
			try {
				const awaitedHeaders = await options.headers;
				sentryTraceHeader = awaitedHeaders?.get("sentry-trace") ?? void 0;
				baggageHeader = awaitedHeaders?.get("baggage");
				awaitedHeaders?.forEach((value, key) => {
					fullHeadersObject[key] = value;
				});
			} catch {
				debugBuild.DEBUG_BUILD && core.debug.warn("Sentry wasn't able to extract the tracing headers for a server action. Will not trace this request.");
			}
			isolationScope.setTransactionName(`serverAction/${serverActionName}`);
			isolationScope.setSDKProcessingMetadata({ normalizedRequest: { headers: fullHeadersObject } });
			return (core.getActiveSpan() ? (_opts, callback2) => callback2() : core.continueTrace)({
				sentryTrace: sentryTraceHeader,
				baggage: baggageHeader
			}, async () => {
				try {
					return await core.startSpan({
						op: "function.server_action",
						name: `serverAction/${serverActionName}`,
						forceTransaction: true,
						attributes: {
							[core.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: "route",
							[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.function.nextjs.server_action"
						}
					}, async (span) => {
						const result = await core.handleCallbackErrors(callback, (error) => {
							if (nextNavigationErrorUtils.isNotFoundNavigationError(error)) span.setStatus({
								code: core.SPAN_STATUS_ERROR,
								message: "not_found"
							});
							else if (nextNavigationErrorUtils.isRedirectNavigationError(error)) {
								span.setStatus({ code: core.SPAN_STATUS_OK });
								span.end();
							} else {
								span.setStatus({
									code: core.SPAN_STATUS_ERROR,
									message: "internal_error"
								});
								core.captureException(error, { mechanism: {
									handled: false,
									type: "auto.function.nextjs.server_action"
								} });
							}
						});
						if (options.recordResponse !== void 0 ? options.recordResponse : shouldRecordResponse) core.getIsolationScope().setExtra("server_action_result", result);
						if (options.formData) options.formData.forEach((value, key) => {
							core.getIsolationScope().setExtra(`server_action_form_data.${key}`, typeof value === "string" ? value : "[non-string value]");
						});
						return result;
					});
				} finally {
					responseEnd.waitUntil(responseEnd.flushSafelyWithTimeout());
				}
			});
		});
	}
	exports.withServerActionInstrumentation = withServerActionInstrumentation;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/common/captureRequestError.js
var require_captureRequestError = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const responseEnd = require_responseEnd();
	function captureRequestError(error, request, errorContext) {
		core.withScope((scope) => {
			scope.setSDKProcessingMetadata({ normalizedRequest: {
				headers: core.headersToDict(request.headers),
				method: request.method
			} });
			scope.setContext("nextjs", {
				request_path: request.path,
				router_kind: errorContext.routerKind,
				router_path: errorContext.routePath,
				route_type: errorContext.routeType
			});
			scope.setTransactionName(`${request.method} ${errorContext.routePath}`);
			core.captureException(error, { mechanism: {
				handled: false,
				type: "auto.function.nextjs.on_request_error"
			} });
			responseEnd.waitUntil(responseEnd.flushSafelyWithTimeout());
		});
	}
	exports.captureRequestError = captureRequestError;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/common/pages-router-instrumentation/wrapApiHandlerWithSentry.js
var require_wrapApiHandlerWithSentry = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const responseEnd = require_responseEnd();
	const tracingUtils = require_tracingUtils();
	function wrapApiHandlerWithSentry(apiHandler, parameterizedRoute) {
		return new Proxy(apiHandler, { apply: (wrappingTarget, thisArg, args) => {
			tracingUtils.dropNextjsRootContext();
			return tracingUtils.escapeNextjsTracing(() => {
				const [req, res] = args;
				if (!req) {
					core.debug.log(`Wrapped API handler on route "${parameterizedRoute}" was not passed a request object. Will not instrument.`);
					return wrappingTarget.apply(thisArg, args);
				} else if (!res) {
					core.debug.log(`Wrapped API handler on route "${parameterizedRoute}" was not passed a response object. Will not instrument.`);
					return wrappingTarget.apply(thisArg, args);
				}
				if (req.__withSentry_applied__) return wrappingTarget.apply(thisArg, args);
				req.__withSentry_applied__ = true;
				return core.withIsolationScope((isolationScope) => {
					return (core.getActiveSpan() ? (_opts, callback) => callback() : core.continueTrace)({
						sentryTrace: req.headers && core.isString(req.headers["sentry-trace"]) ? req.headers["sentry-trace"] : void 0,
						baggage: req.headers?.baggage
					}, () => {
						const reqMethod = `${(req.method || "GET").toUpperCase()} `;
						const normalizedRequest = core.httpRequestToRequestData(req);
						isolationScope.setSDKProcessingMetadata({ normalizedRequest });
						isolationScope.setTransactionName(`${reqMethod}${parameterizedRoute}`);
						return core.startSpanManual({
							name: `${reqMethod}${parameterizedRoute}`,
							op: "http.server",
							forceTransaction: true,
							attributes: {
								[core.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: "route",
								[core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.nextjs"
							}
						}, async (span) => {
							res.end = new Proxy(res.end, { apply(target, thisArg2, argArray) {
								core.setHttpStatus(span, res.statusCode);
								span.end();
								responseEnd.waitUntil(responseEnd.flushSafelyWithTimeout());
								return target.apply(thisArg2, argArray);
							} });
							try {
								return await wrappingTarget.apply(thisArg, args);
							} catch (e) {
								const objectifiedErr = core.objectify(e);
								core.captureException(objectifiedErr, { mechanism: {
									type: "auto.http.nextjs.api_handler",
									handled: false,
									data: {
										wrapped_handler: wrappingTarget.name,
										function: "withSentry"
									}
								} });
								core.setHttpStatus(span, 500);
								span.end();
								await responseEnd.flushSafelyWithTimeout();
								throw objectifiedErr;
							}
						});
					});
				});
			});
		} });
	}
	exports.wrapApiHandlerWithSentry = wrapApiHandlerWithSentry;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/server/index.js
var require_server = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const attributes = require_attributes();
	const core = require_cjs$4();
	const node = require_cjs();
	const debugBuild = require_debug_build();
	const devErrorSymbolicationEventProcessor = require_devErrorSymbolicationEventProcessor();
	const getVercelEnv = require_getVercelEnv();
	const spanAttributesWithLogicAttached = require_span_attributes_with_logic_attached();
	const isBuild = require_isBuild();
	const responseEnd = require_responseEnd();
	const setUrlProcessingMetadata = require_setUrlProcessingMetadata();
	const distDirRewriteFramesIntegration = require_distDirRewriteFramesIntegration();
	const enhanceHandleRequestRootSpan = require_enhanceHandleRequestRootSpan();
	const handleOnSpanStart = require_handleOnSpanStart();
	const prepareSafeIdGeneratorContext = require_prepareSafeIdGeneratorContext();
	const vercelCronsMonitoring = require_vercelCronsMonitoring();
	const vercelQueuesMonitoring = require_vercelQueuesMonitoring();
	const _error = require__error();
	const nextSpan = require_nextSpan();
	const wrapGetStaticPropsWithSentry = require_wrapGetStaticPropsWithSentry();
	const wrapGetInitialPropsWithSentry = require_wrapGetInitialPropsWithSentry();
	const wrapAppGetInitialPropsWithSentry = require_wrapAppGetInitialPropsWithSentry();
	const wrapDocumentGetInitialPropsWithSentry = require_wrapDocumentGetInitialPropsWithSentry();
	const wrapErrorGetInitialPropsWithSentry = require_wrapErrorGetInitialPropsWithSentry();
	const wrapGetServerSidePropsWithSentry = require_wrapGetServerSidePropsWithSentry();
	const wrapServerComponentWithSentry = require_wrapServerComponentWithSentry();
	const wrapRouteHandlerWithSentry = require_wrapRouteHandlerWithSentry();
	const wrapApiHandlerWithSentryVercelCrons = require_wrapApiHandlerWithSentryVercelCrons();
	const wrapMiddlewareWithSentry = require_wrapMiddlewareWithSentry();
	const wrapPageComponentWithSentry = require_wrapPageComponentWithSentry();
	const wrapGenerationFunctionWithSentry = require_wrapGenerationFunctionWithSentry();
	const withServerActionInstrumentation = require_withServerActionInstrumentation();
	const captureRequestError = require_captureRequestError();
	const wrapApiHandlerWithSentry = require_wrapApiHandlerWithSentry();
	const globalWithInjectedValues = core.GLOBAL_OBJ;
	prepareSafeIdGeneratorContext.prepareSafeIdGeneratorContext();
	const ErrorBoundary = (props) => {
		if (!props.children) return null;
		if (typeof props.children === "function") return props.children();
		return props.children;
	};
	function createReduxEnhancer() {
		return (createStore) => createStore;
	}
	function withErrorBoundary(WrappedComponent) {
		return WrappedComponent;
	}
	function showReportDialog() {}
	function getCloudflareRuntimeConfig() {
		if (responseEnd.isCloudflareWaitUntilAvailable()) return { runtime: { name: "cloudflare" } };
	}
	function init(options) {
		prepareSafeIdGeneratorContext.prepareSafeIdGeneratorContext();
		if (isBuild.isBuild()) return;
		if (!debugBuild.DEBUG_BUILD && options.debug) console.warn("[@sentry/nextjs] You have enabled `debug: true`, but Sentry debug logging was removed from your bundle (likely via `withSentryConfig({ disableLogger: true })` / `webpack.treeshake.removeDebugLogging: true`). Set that option to `false` to see Sentry debug output.");
		const customDefaultIntegrations = node.getDefaultIntegrations(options).filter((integration) => integration.name !== "Http").concat(node.httpIntegration({ disableIncomingRequestSpans: true }));
		if (!options.skipOpenTelemetrySetup) process.env.NEXT_OTEL_FETCH_DISABLED = "1";
		const distDirName = process.env._sentryRewriteFramesDistDir || globalWithInjectedValues._sentryRewriteFramesDistDir;
		if (distDirName) customDefaultIntegrations.push(distDirRewriteFramesIntegration.distDirRewriteFramesIntegration({ distDirName }));
		const cloudflareConfig = getCloudflareRuntimeConfig();
		const opts = {
			environment: options.environment || process.env.SENTRY_ENVIRONMENT || getVercelEnv.getVercelEnv(false) || process.env.NODE_ENV,
			release: process.env._sentryRelease || globalWithInjectedValues._sentryRelease,
			defaultIntegrations: customDefaultIntegrations,
			...options,
			...cloudflareConfig
		};
		const nextjsIgnoreSpans = [
			/^GET (\/.*)?\/_next\/static\//,
			/\/__nextjs_original-stack-frame/,
			/^\/404$/,
			/^(GET|HEAD|POST|PUT|DELETE|CONNECT|OPTIONS|TRACE|PATCH) \/(404|_not-found)$/,
			/^NextServer\.getRequestHandler$/,
			{ attributes: { [spanAttributesWithLogicAttached.TRANSACTION_ATTR_SHOULD_DROP_TRANSACTION]: true } }
		];
		opts.ignoreSpans = [...opts.ignoreSpans || [], ...nextjsIgnoreSpans];
		if (debugBuild.DEBUG_BUILD && opts.debug) core.debug.enable();
		debugBuild.DEBUG_BUILD && core.debug.log("Initializing SDK...");
		if (sdkAlreadyInitialized()) {
			debugBuild.DEBUG_BUILD && core.debug.log("SDK already initialized");
			return;
		}
		core.applySdkMetadata(opts, "nextjs", ["nextjs", cloudflareConfig ? "cloudflare" : "node"]);
		const client = node.init(opts);
		client?.on("beforeSampling", ({ spanAttributes }, samplingDecision) => {
			if (typeof spanAttributes[attributes.HTTP_TARGET] === "string" && spanAttributes[attributes.HTTP_TARGET].includes("sentry_key") && spanAttributes[attributes.HTTP_TARGET].includes("sentry_client") || typeof spanAttributes[attributes.URL_QUERY] === "string" && spanAttributes[attributes.URL_QUERY].includes("sentry_key") && spanAttributes[attributes.URL_QUERY].includes("sentry_client")) samplingDecision.decision = false;
		});
		client?.on("spanStart", handleOnSpanStart.handleOnSpanStart);
		client?.on("spanEnd", vercelCronsMonitoring.maybeCompleteCronCheckIn);
		client?.on("spanEnd", vercelQueuesMonitoring.maybeCleanupQueueSpan);
		core.getGlobalScope().addEventProcessor(Object.assign(((event, hint) => {
			if (event.type !== void 0) return event;
			const originalException = hint.originalException;
			if (typeof originalException === "object" && originalException !== null && "$$typeof" in originalException && originalException.$$typeof === /* @__PURE__ */ Symbol.for("react.postpone")) return null;
			const exceptionMessage = event.exception?.values?.[0]?.value;
			if (exceptionMessage?.includes("Suspense Exception: This is not a real error!") || exceptionMessage?.includes("Suspense Exception: This is not a real error, and should not leak")) return null;
			return event;
		}), { id: "DropReactControlFlowErrors" }));
		client?.on("preprocessEvent", (event) => {
			if (event.type === "transaction" && event.contexts?.trace?.data) enhanceHandleRequestRootSpan.enhanceHandleRequestRootSpan({
				attributes: event.contexts.trace.data,
				getName: () => event.transaction,
				setName: (name) => {
					event.transaction = name;
				},
				setOp: (op) => {
					event.contexts.trace.op = op;
				}
			});
			setUrlProcessingMetadata.setUrlProcessingMetadata(event);
		});
		client?.on("processSegmentSpan", (span) => {
			const attributes = span.attributes ?? (span.attributes = {});
			enhanceHandleRequestRootSpan.enhanceHandleRequestRootSpan({
				attributes,
				getName: () => span.name,
				setName: (name) => {
					span.name = name;
				},
				setOp: (op) => {
					attributes[core.SEMANTIC_ATTRIBUTE_SENTRY_OP] = op;
				}
			});
		});
		if (process.env.NODE_ENV === "development") core.getGlobalScope().addEventProcessor(devErrorSymbolicationEventProcessor.devErrorSymbolicationEventProcessor);
		try {
			if (process.turbopack) {
				core.getGlobalScope().setTag("turbopack", true);
				core.getGlobalScope().setAttribute("turbopack", true);
			}
		} catch {}
		debugBuild.DEBUG_BUILD && core.debug.log("SDK successfully initialized");
		return client;
	}
	function sdkAlreadyInitialized() {
		return !!core.getClient();
	}
	exports.pinoIntegration = node.pinoIntegration;
	exports.captureUnderscoreErrorException = _error.captureUnderscoreErrorException;
	exports.startInactiveSpan = nextSpan.startInactiveSpan;
	exports.startSpan = nextSpan.startSpan;
	exports.startSpanManual = nextSpan.startSpanManual;
	exports.wrapGetStaticPropsWithSentry = wrapGetStaticPropsWithSentry.wrapGetStaticPropsWithSentry;
	exports.wrapGetInitialPropsWithSentry = wrapGetInitialPropsWithSentry.wrapGetInitialPropsWithSentry;
	exports.wrapAppGetInitialPropsWithSentry = wrapAppGetInitialPropsWithSentry.wrapAppGetInitialPropsWithSentry;
	exports.wrapDocumentGetInitialPropsWithSentry = wrapDocumentGetInitialPropsWithSentry.wrapDocumentGetInitialPropsWithSentry;
	exports.wrapErrorGetInitialPropsWithSentry = wrapErrorGetInitialPropsWithSentry.wrapErrorGetInitialPropsWithSentry;
	exports.wrapGetServerSidePropsWithSentry = wrapGetServerSidePropsWithSentry.wrapGetServerSidePropsWithSentry;
	exports.wrapServerComponentWithSentry = wrapServerComponentWithSentry.wrapServerComponentWithSentry;
	exports.wrapRouteHandlerWithSentry = wrapRouteHandlerWithSentry.wrapRouteHandlerWithSentry;
	exports.wrapApiHandlerWithSentryVercelCrons = wrapApiHandlerWithSentryVercelCrons.wrapApiHandlerWithSentryVercelCrons;
	exports.wrapMiddlewareWithSentry = wrapMiddlewareWithSentry.wrapMiddlewareWithSentry;
	exports.wrapPageComponentWithSentry = wrapPageComponentWithSentry.wrapPageComponentWithSentry;
	exports.wrapGenerationFunctionWithSentry = wrapGenerationFunctionWithSentry.wrapGenerationFunctionWithSentry;
	exports.withServerActionInstrumentation = withServerActionInstrumentation.withServerActionInstrumentation;
	exports.captureRequestError = captureRequestError.captureRequestError;
	exports.wrapApiHandlerWithSentry = wrapApiHandlerWithSentry.wrapApiHandlerWithSentry;
	exports.ErrorBoundary = ErrorBoundary;
	exports.createReduxEnhancer = createReduxEnhancer;
	exports.init = init;
	exports.showReportDialog = showReportDialog;
	exports.withErrorBoundary = withErrorBoundary;
	Object.prototype.hasOwnProperty.call(node, "__proto__") && !Object.prototype.hasOwnProperty.call(exports, "__proto__") && Object.defineProperty(exports, "__proto__", {
		enumerable: true,
		value: node["__proto__"]
	});
	Object.keys(node).forEach((k) => {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) exports[k] = node[k];
	});
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/config/util.js
var require_util = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const fs$5 = __require("fs");
	const module$1$1 = __require("module");
	const path$8 = __require("path");
	function getNextjsVersion() {
		const nextjsPackageJsonPath = resolveNextjsPackageJson();
		if (nextjsPackageJsonPath) try {
			return JSON.parse(fs$5.readFileSync(nextjsPackageJsonPath, { encoding: "utf-8" })).version;
		} catch {}
	}
	function resolveNextjsPackageJson() {
		try {
			return module$1$1.createRequire(`${process.cwd()}/`).resolve("next/package.json");
		} catch {
			return;
		}
	}
	function supportsProductionCompileHook(version) {
		const versionToCheck = version;
		if (!versionToCheck) return false;
		const { major, minor, patch } = core.parseSemver(versionToCheck);
		if (major === void 0 || minor === void 0 || patch === void 0) return false;
		if (major > 15) return true;
		if (major === 15) {
			if (minor > 4) return true;
			if (minor === 4 && patch >= 1) return true;
			return false;
		}
		return false;
	}
	function supportsTurbopackRuleCondition(version) {
		if (!version) return false;
		const { major } = core.parseSemver(version);
		if (major === void 0) return false;
		return major >= 16;
	}
	function supportsNativeDebugIds(version) {
		if (!version) return false;
		const { major, minor, prerelease } = core.parseSemver(version);
		if (major === void 0 || minor === void 0) return false;
		if (major >= 16) return true;
		if (major === 15 && prerelease?.startsWith("canary.")) {
			if (minor > 6) return true;
			if (minor === 6) {
				if (parseInt(prerelease.split(".")[1] || "0", 10) >= 36) return true;
			}
		}
		return false;
	}
	function requiresInstrumentationHook(version) {
		if (!version) return true;
		const { major, minor, patch, prerelease } = core.parseSemver(version);
		if (major === void 0 || minor === void 0 || patch === void 0) return true;
		if (major >= 16) return false;
		if (major < 15) return true;
		if (!prerelease) return false;
		if (minor > 0 || patch > 0) return false;
		if (prerelease.startsWith("rc.")) return parseInt(prerelease.split(".")[1] || "0", 10) === 0;
		if (prerelease.startsWith("canary.")) return parseInt(prerelease.split(".")[1] || "0", 10) < 124;
		return true;
	}
	function detectActiveBundler() {
		const turbopackEnv = process.env.TURBOPACK;
		if (turbopackEnv && turbopackEnv !== "false" && turbopackEnv !== "0" || process.argv.includes("--turbo")) return "turbopack";
		else return "webpack";
	}
	function getPackageModules(projectDir) {
		try {
			const packageJson = path$8.join(projectDir, "package.json");
			const packageJsonContent = fs$5.readFileSync(packageJson, "utf8");
			const packageJsonObject = JSON.parse(packageJsonContent);
			return {
				...packageJsonObject.dependencies,
				...packageJsonObject.devDependencies
			};
		} catch {
			return {};
		}
	}
	exports.detectActiveBundler = detectActiveBundler;
	exports.getNextjsVersion = getNextjsVersion;
	exports.getPackageModules = getPackageModules;
	exports.requiresInstrumentationHook = requiresInstrumentationHook;
	exports.supportsNativeDebugIds = supportsNativeDebugIds;
	exports.supportsProductionCompileHook = supportsProductionCompileHook;
	exports.supportsTurbopackRuleCondition = supportsTurbopackRuleCondition;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/config/withSentryConfig/buildTime.js
var require_buildTime = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const childProcess = __require("child_process");
	const fs$4 = __require("fs");
	const path$7 = __require("path");
	function setUpBuildTimeVariables(userNextConfig, userSentryOptions, releaseName) {
		const assetPrefix = userNextConfig.assetPrefix || userNextConfig.basePath || "";
		const basePath = userNextConfig.basePath ?? "";
		const rewritesTunnelPath = userSentryOptions.tunnelRoute !== void 0 && userNextConfig.output !== "export" && typeof userSentryOptions.tunnelRoute === "string" ? `${basePath}${userSentryOptions.tunnelRoute}` : void 0;
		const buildTimeVariables = {
			_sentryRewriteFramesDistDir: userNextConfig.distDir?.replace(/\\/g, "\\\\") || ".next",
			_sentryRewriteFramesAssetPrefixPath: assetPrefix ? new URL(assetPrefix, "http://dogs.are.great").pathname.replace(/\/$/, "") : ""
		};
		if (userNextConfig.assetPrefix) buildTimeVariables._assetsPrefix = userNextConfig.assetPrefix;
		if (userSentryOptions._experimental?.thirdPartyOriginStackFrames) buildTimeVariables._experimentalThirdPartyOriginStackFrames = "true";
		if (rewritesTunnelPath) buildTimeVariables._sentryRewritesTunnelPath = rewritesTunnelPath;
		if (basePath) buildTimeVariables._sentryBasePath = basePath;
		if (userNextConfig.assetPrefix) buildTimeVariables._sentryAssetPrefix = userNextConfig.assetPrefix;
		if (userSentryOptions._experimental?.thirdPartyOriginStackFrames) buildTimeVariables._experimentalThirdPartyOriginStackFrames = "true";
		if (releaseName) buildTimeVariables._sentryRelease = releaseName;
		if (typeof userNextConfig.env === "object") userNextConfig.env = {
			...buildTimeVariables,
			...userNextConfig.env
		};
		else if (userNextConfig.env === void 0) userNextConfig.env = buildTimeVariables;
	}
	function getGitRevision() {
		let gitRevision;
		try {
			gitRevision = childProcess.execSync("git rev-parse HEAD", { stdio: [
				"ignore",
				"pipe",
				"ignore"
			] }).toString().trim();
		} catch {}
		return gitRevision;
	}
	function getInstrumentationClientFileContents() {
		for (const pathSegments of [
			["src", "instrumentation-client.ts"],
			["src", "instrumentation-client.js"],
			["instrumentation-client.ts"],
			["instrumentation-client.js"]
		]) try {
			return fs$4.readFileSync(path$7.join(process.cwd(), ...pathSegments), "utf-8");
		} catch {}
	}
	exports.getGitRevision = getGitRevision;
	exports.getInstrumentationClientFileContents = getInstrumentationClientFileContents;
	exports.setUpBuildTimeVariables = setUpBuildTimeVariables;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/config/withSentryConfig/deprecatedWebpackOptions.js
var require_deprecatedWebpackOptions = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const util = require_util();
	function migrateDeprecatedWebpackOptions(userSentryOptions) {
		userSentryOptions.webpack = userSentryOptions.webpack || {};
		const webpack = userSentryOptions.webpack;
		const withDeprecatedFallback = (newValue, deprecatedValue, message) => {
			if (deprecatedValue !== void 0) console.warn(message);
			return newValue ?? deprecatedValue;
		};
		const deprecatedMessage = (deprecatedPath, newPath) => {
			const message = `[@sentry/nextjs] DEPRECATION WARNING: ${deprecatedPath} is deprecated and will be removed in a future version. Use ${newPath} instead.`;
			if (util.detectActiveBundler() === "turbopack" && newPath.startsWith("webpack.")) return `${message} (Not supported with Turbopack.)`;
			return message;
		};
		webpack.autoInstrumentServerFunctions = withDeprecatedFallback(webpack.autoInstrumentServerFunctions, userSentryOptions.autoInstrumentServerFunctions, deprecatedMessage("autoInstrumentServerFunctions", "webpack.autoInstrumentServerFunctions"));
		webpack.autoInstrumentMiddleware = withDeprecatedFallback(webpack.autoInstrumentMiddleware, userSentryOptions.autoInstrumentMiddleware, deprecatedMessage("autoInstrumentMiddleware", "webpack.autoInstrumentMiddleware"));
		webpack.autoInstrumentAppDirectory = withDeprecatedFallback(webpack.autoInstrumentAppDirectory, userSentryOptions.autoInstrumentAppDirectory, deprecatedMessage("autoInstrumentAppDirectory", "webpack.autoInstrumentAppDirectory"));
		webpack.excludeServerRoutes = withDeprecatedFallback(webpack.excludeServerRoutes, userSentryOptions.excludeServerRoutes, deprecatedMessage("excludeServerRoutes", "webpack.excludeServerRoutes"));
		webpack.unstable_sentryWebpackPluginOptions = withDeprecatedFallback(webpack.unstable_sentryWebpackPluginOptions, userSentryOptions.unstable_sentryWebpackPluginOptions, deprecatedMessage("unstable_sentryWebpackPluginOptions", "webpack.unstable_sentryWebpackPluginOptions"));
		webpack.disableSentryConfig = withDeprecatedFallback(webpack.disableSentryConfig, userSentryOptions.disableSentryWebpackConfig, deprecatedMessage("disableSentryWebpackConfig", "webpack.disableSentryConfig"));
		if (userSentryOptions.disableLogger !== void 0) {
			webpack.treeshake = webpack.treeshake || {};
			webpack.treeshake.removeDebugLogging = withDeprecatedFallback(webpack.treeshake.removeDebugLogging, userSentryOptions.disableLogger, deprecatedMessage("disableLogger", "webpack.treeshake.removeDebugLogging"));
		}
		webpack.automaticVercelMonitors = withDeprecatedFallback(webpack.automaticVercelMonitors, userSentryOptions.automaticVercelMonitors, deprecatedMessage("automaticVercelMonitors", "webpack.automaticVercelMonitors"));
		webpack.reactComponentAnnotation = withDeprecatedFallback(webpack.reactComponentAnnotation, userSentryOptions.reactComponentAnnotation, deprecatedMessage("reactComponentAnnotation", "webpack.reactComponentAnnotation"));
	}
	exports.migrateDeprecatedWebpackOptions = migrateDeprecatedWebpackOptions;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/config/getBuildPluginOptions.js
var require_getBuildPluginOptions = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const path$6 = __require("path");
	const LOGGER_PREFIXES = {
		"webpack-nodejs": "[@sentry/nextjs - Node.js]",
		"webpack-edge": "[@sentry/nextjs - Edge]",
		"webpack-client": "[@sentry/nextjs - Client]",
		"after-production-compile-webpack": "[@sentry/nextjs - After Production Compile (Webpack)]",
		"after-production-compile-turbopack": "[@sentry/nextjs - After Production Compile (Turbopack)]"
	};
	const FILE_PATTERNS = {
		SERVER: {
			GLOB: "server/**",
			PATH: "server"
		},
		SERVERLESS: "serverless/**",
		STATIC_CHUNKS: {
			GLOB: "static/chunks/**",
			PATH: "static/chunks"
		},
		STATIC_CHUNKS_PAGES: {
			GLOB: "static/chunks/pages/**",
			PATH: "static/chunks/pages"
		},
		STATIC_CHUNKS_APP: {
			GLOB: "static/chunks/app/**",
			PATH: "static/chunks/app"
		},
		MAIN_CHUNKS: "static/chunks/main-*",
		FRAMEWORK_CHUNKS: "static/chunks/framework-*",
		FRAMEWORK_CHUNKS_DOT: "static/chunks/framework.*",
		POLYFILLS_CHUNKS: "static/chunks/polyfills-*",
		WEBPACK_CHUNKS: "static/chunks/webpack-*",
		PAGE_CLIENT_REFERENCE_MANIFEST: "**/page_client-reference-manifest.js",
		SERVER_REFERENCE_MANIFEST: "**/server-reference-manifest.js",
		NEXT_FONT_MANIFEST: "**/next-font-manifest.js",
		MIDDLEWARE_BUILD_MANIFEST: "**/middleware-build-manifest.js",
		INTERCEPTION_ROUTE_REWRITE_MANIFEST: "**/interception-route-rewrite-manifest.js",
		ROUTE_CLIENT_REFERENCE_MANIFEST: "**/route_client-reference-manifest.js",
		MIDDLEWARE_REACT_LOADABLE_MANIFEST: "**/middleware-react-loadable-manifest.js"
	};
	const SOURCEMAP_EXTENSIONS = [
		"*.js.map",
		"*.mjs.map",
		"*.cjs.map",
		"*.css.map"
	];
	function normalizePathForGlob(distPath) {
		return distPath.replace(/\\/g, "/");
	}
	function getServerPattern({ useDirectoryPath = false }) {
		return useDirectoryPath ? FILE_PATTERNS.SERVER.PATH : FILE_PATTERNS.SERVER.GLOB;
	}
	function getStaticChunksPattern({ useDirectoryPath = false }) {
		return useDirectoryPath ? FILE_PATTERNS.STATIC_CHUNKS.PATH : FILE_PATTERNS.STATIC_CHUNKS.GLOB;
	}
	function getStaticChunksPagesPattern({ useDirectoryPath = false }) {
		return useDirectoryPath ? FILE_PATTERNS.STATIC_CHUNKS_PAGES.PATH : FILE_PATTERNS.STATIC_CHUNKS_PAGES.GLOB;
	}
	function getStaticChunksAppPattern({ useDirectoryPath = false }) {
		return useDirectoryPath ? FILE_PATTERNS.STATIC_CHUNKS_APP.PATH : FILE_PATTERNS.STATIC_CHUNKS_APP.GLOB;
	}
	function createSourcemapUploadAssetPatterns(normalizedDistPath, buildTool, widenClientFileUpload = false) {
		const assets = [];
		if (buildTool.startsWith("after-production-compile")) {
			assets.push(path$6.posix.join(normalizedDistPath, getServerPattern({ useDirectoryPath: true })));
			if (buildTool === "after-production-compile-turbopack") assets.push(path$6.posix.join(normalizedDistPath, getStaticChunksPattern({ useDirectoryPath: true })));
			else if (widenClientFileUpload) assets.push(path$6.posix.join(normalizedDistPath, getStaticChunksPattern({ useDirectoryPath: true })));
			else assets.push(path$6.posix.join(normalizedDistPath, getStaticChunksPagesPattern({ useDirectoryPath: true })), path$6.posix.join(normalizedDistPath, getStaticChunksAppPattern({ useDirectoryPath: true })));
		} else if (buildTool === "webpack-nodejs" || buildTool === "webpack-edge") assets.push(path$6.posix.join(normalizedDistPath, getServerPattern({ useDirectoryPath: false })), path$6.posix.join(normalizedDistPath, FILE_PATTERNS.SERVERLESS));
		else if (buildTool === "webpack-client") if (widenClientFileUpload) assets.push(path$6.posix.join(normalizedDistPath, getStaticChunksPattern({ useDirectoryPath: false })));
		else assets.push(path$6.posix.join(normalizedDistPath, getStaticChunksPagesPattern({ useDirectoryPath: false })), path$6.posix.join(normalizedDistPath, getStaticChunksAppPattern({ useDirectoryPath: false })));
		return assets;
	}
	function createSourcemapUploadIgnorePattern(normalizedDistPath, widenClientFileUpload = false) {
		const ignore = [];
		if (!widenClientFileUpload) ignore.push(path$6.posix.join(normalizedDistPath, FILE_PATTERNS.MAIN_CHUNKS));
		ignore.push(path$6.posix.join(normalizedDistPath, FILE_PATTERNS.FRAMEWORK_CHUNKS), path$6.posix.join(normalizedDistPath, FILE_PATTERNS.FRAMEWORK_CHUNKS_DOT), path$6.posix.join(normalizedDistPath, FILE_PATTERNS.POLYFILLS_CHUNKS), path$6.posix.join(normalizedDistPath, FILE_PATTERNS.WEBPACK_CHUNKS), FILE_PATTERNS.PAGE_CLIENT_REFERENCE_MANIFEST, FILE_PATTERNS.SERVER_REFERENCE_MANIFEST, FILE_PATTERNS.NEXT_FONT_MANIFEST, FILE_PATTERNS.MIDDLEWARE_BUILD_MANIFEST, FILE_PATTERNS.INTERCEPTION_ROUTE_REWRITE_MANIFEST, FILE_PATTERNS.ROUTE_CLIENT_REFERENCE_MANIFEST, FILE_PATTERNS.MIDDLEWARE_REACT_LOADABLE_MANIFEST);
		return ignore;
	}
	function createFilesToDeleteAfterUploadPattern(normalizedDistPath, buildTool, deleteSourcemapsAfterUpload, useRunAfterProductionCompileHook = false) {
		if (!deleteSourcemapsAfterUpload) return;
		if (buildTool === "webpack-nodejs" || buildTool === "webpack-edge") return;
		if (buildTool === "webpack-client" && useRunAfterProductionCompileHook) return;
		return SOURCEMAP_EXTENSIONS.map((ext) => path$6.posix.join(normalizedDistPath, "static", "**", ext));
	}
	function shouldSkipSourcemapUpload(buildTool, useRunAfterProductionCompileHook = false) {
		return useRunAfterProductionCompileHook && buildTool.startsWith("webpack");
	}
	function rewriteWebpackSources(source) {
		return source.replace(/^webpack:\/\/(?:_N_E\/)?/, "");
	}
	function createReleaseConfig(releaseName, sentryBuildOptions) {
		if (releaseName !== void 0) return {
			inject: false,
			name: releaseName,
			create: sentryBuildOptions.release?.create,
			finalize: sentryBuildOptions.release?.finalize,
			dist: sentryBuildOptions.release?.dist,
			vcsRemote: sentryBuildOptions.release?.vcsRemote,
			setCommits: sentryBuildOptions.release?.setCommits,
			deploy: sentryBuildOptions.release?.deploy,
			...sentryBuildOptions.webpack?.unstable_sentryWebpackPluginOptions?.release
		};
		return {
			inject: false,
			create: false,
			finalize: false
		};
	}
	function mergeIgnorePatterns(defaultPatterns, userPatterns) {
		if (!userPatterns) return defaultPatterns;
		const userPatternsArray = Array.isArray(userPatterns) ? userPatterns : [userPatterns];
		return [...defaultPatterns, ...userPatternsArray];
	}
	function getBuildPluginOptions({ sentryBuildOptions, releaseName, distDirAbsPath, buildTool, useRunAfterProductionCompileHook }) {
		const normalizedDistDirAbsPath = normalizePathForGlob(distDirAbsPath);
		const loggerPrefix = LOGGER_PREFIXES[buildTool];
		const widenClientFileUpload = sentryBuildOptions.widenClientFileUpload ?? false;
		const deleteSourcemapsAfterUpload = sentryBuildOptions.sourcemaps?.deleteSourcemapsAfterUpload ?? false;
		const sourcemapUploadAssets = createSourcemapUploadAssetPatterns(normalizedDistDirAbsPath, buildTool, widenClientFileUpload);
		const finalIgnorePatterns = mergeIgnorePatterns(createSourcemapUploadIgnorePattern(normalizedDistDirAbsPath, widenClientFileUpload), sentryBuildOptions.sourcemaps?.ignore);
		const userFilesToDeleteAfterUpload = sentryBuildOptions.sourcemaps?.filesToDeleteAfterUpload;
		if (sentryBuildOptions.debug && userFilesToDeleteAfterUpload !== void 0) console.debug("[@sentry/nextjs] Skipping auto-deletion of source maps as user has provided filesToDeleteAfterUpload:", userFilesToDeleteAfterUpload);
		const filesToDeleteAfterUpload = userFilesToDeleteAfterUpload !== void 0 ? Array.isArray(userFilesToDeleteAfterUpload) ? userFilesToDeleteAfterUpload : [userFilesToDeleteAfterUpload] : createFilesToDeleteAfterUploadPattern(normalizedDistDirAbsPath, buildTool, deleteSourcemapsAfterUpload, useRunAfterProductionCompileHook);
		const skipSourcemapsUpload = shouldSkipSourcemapUpload(buildTool, useRunAfterProductionCompileHook);
		return {
			applicationKey: sentryBuildOptions.applicationKey,
			authToken: sentryBuildOptions.authToken,
			headers: sentryBuildOptions.headers,
			org: sentryBuildOptions.org,
			project: sentryBuildOptions.project,
			telemetry: sentryBuildOptions.telemetry,
			debug: sentryBuildOptions.debug,
			errorHandler: sentryBuildOptions.errorHandler,
			reactComponentAnnotation: buildTool.startsWith("after-production-compile") ? void 0 : {
				...sentryBuildOptions.webpack?.reactComponentAnnotation,
				...sentryBuildOptions.webpack?.unstable_sentryWebpackPluginOptions?.reactComponentAnnotation
			},
			silent: sentryBuildOptions.silent,
			url: sentryBuildOptions.sentryUrl,
			sourcemaps: {
				disable: skipSourcemapsUpload ? true : sentryBuildOptions.sourcemaps?.disable ?? false,
				rewriteSources: sentryBuildOptions.sourcemaps?.rewriteSources ?? rewriteWebpackSources,
				assets: sentryBuildOptions.sourcemaps?.assets ?? sourcemapUploadAssets,
				ignore: finalIgnorePatterns,
				filesToDeleteAfterUpload,
				...sentryBuildOptions.webpack?.unstable_sentryWebpackPluginOptions?.sourcemaps
			},
			release: createReleaseConfig(releaseName, sentryBuildOptions),
			bundleSizeOptimizations: { ...sentryBuildOptions.bundleSizeOptimizations },
			_metaOptions: {
				loggerPrefixOverride: loggerPrefix,
				telemetry: { metaFramework: "nextjs" }
			},
			...sentryBuildOptions.webpack?.unstable_sentryWebpackPluginOptions
		};
	}
	exports.getBuildPluginOptions = getBuildPluginOptions;
	exports.normalizePathForGlob = normalizePathForGlob;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/config/handleRunAfterProductionCompile.js
var require_handleRunAfterProductionCompile = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const fs$3 = __require("fs");
	const path$5 = __require("path");
	const getBuildPluginOptions = require_getBuildPluginOptions();
	async function handleRunAfterProductionCompile({ releaseName, distDir, buildTool, usesNativeDebugIds, sriEnabled }, sentryBuildOptions) {
		if (sentryBuildOptions.debug) console.debug("[@sentry/nextjs] Running runAfterProductionCompile logic.");
		const { createSentryBuildPluginManager } = core.loadModule("@sentry/bundler-plugin-core", module) ?? {};
		if (!createSentryBuildPluginManager) {
			console.warn("[@sentry/nextjs] Could not load build manager package. Will not run runAfterProductionCompile logic.");
			return;
		}
		const sentryBuildPluginManager = createSentryBuildPluginManager(getBuildPluginOptions.getBuildPluginOptions({
			sentryBuildOptions,
			releaseName,
			distDirAbsPath: distDir,
			buildTool: `after-production-compile-${buildTool}`
		}), {
			buildTool,
			loggerPrefix: "[@sentry/nextjs - After Production Compile]"
		});
		await sentryBuildPluginManager.telemetry.emitBundlerPluginExecutionSignal();
		await sentryBuildPluginManager.createRelease();
		if (!usesNativeDebugIds && sentryBuildOptions.sourcemaps?.disable !== true) await sentryBuildPluginManager.injectDebugIds([distDir]);
		await sentryBuildPluginManager.uploadSourcemaps([distDir], { prepareArtifacts: false });
		await sentryBuildPluginManager.deleteArtifacts();
		const deleteSourcemapsAfterUpload = sentryBuildOptions.sourcemaps?.deleteSourcemapsAfterUpload ?? false;
		if (deleteSourcemapsAfterUpload && buildTool === "turbopack" && !sriEnabled) await stripSourceMappingURLComments(path$5.join(distDir, "static"), sentryBuildOptions.debug);
		if (deleteSourcemapsAfterUpload && buildTool === "turbopack" && sriEnabled && sentryBuildOptions.debug) console.debug("[@sentry/nextjs] Skipping sourceMappingURL comment stripping because Subresource Integrity (SRI) is enabled.");
	}
	const SOURCEMAPPING_URL_COMMENT_REGEX = /\n?\/\/[#@] sourceMappingURL=[^\n]+$/;
	const CSS_SOURCEMAPPING_URL_COMMENT_REGEX = /\n?\/\*[#@] sourceMappingURL=[^\n]+\*\/$/;
	async function stripSourceMappingURLComments(staticDir, debug) {
		let entries;
		try {
			entries = await fs$3.promises.readdir(staticDir, { recursive: true }).then((e) => e.map((f) => String(f)));
		} catch {
			return;
		}
		const filesToProcess = entries.filter((f) => f.endsWith(".js") || f.endsWith(".mjs") || f.endsWith(".cjs") || f.endsWith(".css"));
		const strippedCount = (await Promise.all(filesToProcess.map(async (file) => {
			const filePath = path$5.join(staticDir, file);
			try {
				const content = await fs$3.promises.readFile(filePath, "utf-8");
				const regex = file.endsWith(".css") ? CSS_SOURCEMAPPING_URL_COMMENT_REGEX : SOURCEMAPPING_URL_COMMENT_REGEX;
				const strippedContent = content.replace(regex, "");
				if (strippedContent !== content) {
					await fs$3.promises.writeFile(filePath, strippedContent, "utf-8");
					return file;
				}
			} catch {}
		}))).filter(Boolean).length;
		if (debug && strippedCount > 0) console.debug(`[@sentry/nextjs] Stripped sourceMappingURL comments from ${String(strippedCount)} file(s) to prevent requests for deleted source maps.`);
	}
	exports.handleRunAfterProductionCompile = handleRunAfterProductionCompile;
	exports.stripSourceMappingURLComments = stripSourceMappingURLComments;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/config/turbopack/generateValueInjectionRules.js
var require_generateValueInjectionRules = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const path$4 = __require("path");
	const util = require_util();
	function generateValueInjectionRules({ routeManifest, nextJsVersion, tunnelPath, vercelCronsConfig }) {
		const rules = [];
		const isomorphicValues = {};
		let clientValues = {};
		let serverValues = {};
		if (nextJsVersion) isomorphicValues._sentryNextJsVersion = nextJsVersion;
		if (routeManifest) clientValues._sentryRouteManifest = JSON.stringify(routeManifest);
		if (tunnelPath) isomorphicValues._sentryRewritesTunnelPath = tunnelPath;
		if (vercelCronsConfig) serverValues._sentryVercelCronsConfig = JSON.stringify(vercelCronsConfig);
		serverValues.__SENTRY_SERVER_MODULES__ = util.getPackageModules(process.cwd());
		if (Object.keys(isomorphicValues).length > 0) {
			clientValues = {
				...clientValues,
				...isomorphicValues
			};
			serverValues = {
				...serverValues,
				...isomorphicValues
			};
		}
		const hasConditionSupport = nextJsVersion ? util.supportsTurbopackRuleCondition(nextJsVersion) : false;
		if (Object.keys(clientValues).length > 0) rules.push({
			matcher: "**/instrumentation-client.*",
			rule: {
				...hasConditionSupport ? { condition: { not: "foreign" } } : {},
				loaders: [{
					loader: path$4.resolve(__dirname, "..", "loaders", "valueInjectionLoader.js"),
					options: { values: clientValues }
				}]
			}
		});
		if (Object.keys(serverValues).length > 0) rules.push({
			matcher: "**/instrumentation.*",
			rule: {
				...hasConditionSupport ? { condition: { not: "foreign" } } : {},
				loaders: [{
					loader: path$4.resolve(__dirname, "..", "loaders", "valueInjectionLoader.js"),
					options: { values: serverValues }
				}]
			}
		});
		return rules;
	}
	exports.generateValueInjectionRules = generateValueInjectionRules;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/config/turbopack/constructTurbopackConfig.js
var require_constructTurbopackConfig = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const path$3 = __require("path");
	const util = require_util();
	const generateValueInjectionRules = require_generateValueInjectionRules();
	function constructTurbopackConfig({ userNextConfig, userSentryOptions, routeManifest, nextJsVersion, vercelCronsConfig }) {
		const shouldEnableNativeDebugIds = (util.supportsNativeDebugIds(nextJsVersion ?? "") && userNextConfig?.turbopack?.debugIds) ?? userSentryOptions?.sourcemaps?.disable !== true;
		const newConfig = {
			...userNextConfig.turbopack,
			...shouldEnableNativeDebugIds ? { debugIds: true } : {}
		};
		const tunnelPath = userSentryOptions?.tunnelRoute !== void 0 && userNextConfig.output !== "export" && typeof userSentryOptions.tunnelRoute === "string" ? `${userNextConfig.basePath ?? ""}${userSentryOptions.tunnelRoute}` : void 0;
		const valueInjectionRules = generateValueInjectionRules.generateValueInjectionRules({
			routeManifest,
			nextJsVersion,
			tunnelPath,
			vercelCronsConfig
		});
		for (const { matcher, rule } of valueInjectionRules) newConfig.rules = safelyAddTurbopackRule(newConfig.rules, {
			matcher,
			rule
		});
		const applicationKey = userSentryOptions?.applicationKey ?? userSentryOptions?._experimental?.turbopackApplicationKey;
		if (applicationKey && nextJsVersion && util.supportsTurbopackRuleCondition(nextJsVersion)) newConfig.rules = safelyAddTurbopackRule(newConfig.rules, {
			matcher: "*.{ts,tsx,js,jsx,mjs,cjs}",
			rule: {
				condition: { not: { path: /next\/dist\/build\/polyfills/ } },
				loaders: [{
					loader: path$3.resolve(__dirname, "..", "loaders", "moduleMetadataInjectionLoader.js"),
					options: { applicationKey }
				}]
			}
		});
		const turbopackReactComponentAnnotation = userSentryOptions?._experimental?.turbopackReactComponentAnnotation;
		if (turbopackReactComponentAnnotation?.enabled && nextJsVersion && util.supportsTurbopackRuleCondition(nextJsVersion)) newConfig.rules = safelyAddTurbopackRule(newConfig.rules, {
			matcher: "*.{tsx,jsx}",
			rule: {
				condition: { not: "foreign" },
				loaders: [{
					loader: path$3.resolve(__dirname, "..", "loaders", "componentAnnotationLoader.js"),
					options: { ignoredComponents: turbopackReactComponentAnnotation.ignoredComponents ?? [] }
				}]
			}
		});
		return newConfig;
	}
	function safelyAddTurbopackRule(existingRules, { matcher, rule }) {
		if (!existingRules) return { [matcher]: rule };
		if (existingRules[matcher]) {
			core.debug.log(`[@sentry/nextjs] - Turbopack rule already exists for ${matcher}. Please remove it from your Next.js config in order for Sentry to work properly.`);
			return existingRules;
		}
		return {
			...existingRules,
			[matcher]: rule
		};
	}
	exports.constructTurbopackConfig = constructTurbopackConfig;
	exports.safelyAddTurbopackRule = safelyAddTurbopackRule;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/config/webpack.js
var require_webpack = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const fs$2 = __require("fs");
	const module$1 = __require("module");
	const path$2 = __require("path");
	const getBuildPluginOptions = require_getBuildPluginOptions();
	const util = require_util();
	let showedMissingGlobalErrorWarningMsg = false;
	function constructWebpackConfigFunction({ userNextConfig = {}, userSentryOptions = {}, releaseName, routeManifest, nextJsVersion, useRunAfterProductionCompileHook, vercelCronsConfigResult }) {
		return function newWebpackFunction(incomingConfig, buildContext) {
			const { isServer, dev: isDev, dir: projectDir } = buildContext;
			const runtime = isServer ? buildContext.nextRuntime === "edge" ? "edge" : "server" : "client";
			const pageExtensions = userNextConfig.pageExtensions || [
				"tsx",
				"ts",
				"jsx",
				"js"
			];
			const dotPrefixedPageExtensions = pageExtensions.map((ext) => `.${ext}`);
			const pageExtensionRegex = pageExtensions.map(core.escapeStringForRegex).join("|");
			const nextVersion = nextJsVersion || util.getNextjsVersion();
			const { major } = core.parseSemver(nextVersion || "");
			const instrumentationFile = getInstrumentationFile(projectDir, dotPrefixedPageExtensions.concat([".ts", ".js"]));
			if (runtime !== "client") warnAboutDeprecatedConfigFiles(projectDir, instrumentationFile, runtime);
			if (runtime === "server") {
				if (major && major >= 15) warnAboutMissingOnRequestErrorHandler(instrumentationFile);
			}
			let rawNewConfig = { ...incomingConfig };
			if ("webpack" in userNextConfig && typeof userNextConfig.webpack === "function") rawNewConfig = userNextConfig.webpack(rawNewConfig, buildContext);
			const newConfig = setUpModuleRules(rawNewConfig);
			const { strategy: cronsStrategy, config: cronsConfig } = vercelCronsConfigResult;
			const vercelCronsConfigForGlobal = cronsStrategy === "spans" ? cronsConfig : void 0;
			const vercelCronsConfigForWrapper = cronsStrategy === "wrapper" ? cronsConfig : void 0;
			addValueInjectionLoader({
				newConfig,
				userNextConfig,
				userSentryOptions,
				buildContext,
				releaseName,
				routeManifest,
				nextJsVersion,
				vercelCronsConfig: vercelCronsConfigForGlobal
			});
			addOtelWarningIgnoreRule(newConfig);
			if (major && major === 13 && runtime === "edge" && isDev) addEdgeRuntimePolyfills(newConfig, buildContext);
			let pagesDirPath;
			const maybePagesDirPath = path$2.join(projectDir, "pages");
			const maybeSrcPagesDirPath = path$2.join(projectDir, "src", "pages");
			if (fs$2.existsSync(maybePagesDirPath) && fs$2.lstatSync(maybePagesDirPath).isDirectory()) pagesDirPath = maybePagesDirPath;
			else if (fs$2.existsSync(maybeSrcPagesDirPath) && fs$2.lstatSync(maybeSrcPagesDirPath).isDirectory()) pagesDirPath = maybeSrcPagesDirPath;
			let appDirPath;
			const maybeAppDirPath = path$2.join(projectDir, "app");
			const maybeSrcAppDirPath = path$2.join(projectDir, "src", "app");
			if (fs$2.existsSync(maybeAppDirPath) && fs$2.lstatSync(maybeAppDirPath).isDirectory()) appDirPath = maybeAppDirPath;
			else if (fs$2.existsSync(maybeSrcAppDirPath) && fs$2.lstatSync(maybeSrcAppDirPath).isDirectory()) appDirPath = maybeSrcAppDirPath;
			const apiRoutesPath = pagesDirPath ? path$2.join(pagesDirPath, "api") : void 0;
			const middlewareLocationFolder = pagesDirPath ? path$2.join(pagesDirPath, "..") : appDirPath ? path$2.join(appDirPath, "..") : projectDir;
			const staticWrappingLoaderOptions = {
				appDir: appDirPath,
				pagesDir: pagesDirPath,
				pageExtensionRegex,
				excludeServerRoutes: userSentryOptions.webpack?.excludeServerRoutes,
				nextjsRequestAsyncStorageModulePath: getRequestAsyncStorageModuleLocation(projectDir, rawNewConfig.resolve?.modules),
				isDev
			};
			const normalizeLoaderResourcePath = (resourcePath) => {
				let absoluteResourcePath;
				if (path$2.isAbsolute(resourcePath)) absoluteResourcePath = resourcePath;
				else absoluteResourcePath = path$2.join(projectDir, resourcePath);
				return path$2.normalize(absoluteResourcePath);
			};
			const isPageResource = (resourcePath) => {
				const normalizedAbsoluteResourcePath = normalizeLoaderResourcePath(resourcePath);
				return pagesDirPath !== void 0 && normalizedAbsoluteResourcePath.startsWith(pagesDirPath + path$2.sep) && !normalizedAbsoluteResourcePath.startsWith(apiRoutesPath + path$2.sep) && dotPrefixedPageExtensions.some((ext) => normalizedAbsoluteResourcePath.endsWith(ext));
			};
			const isApiRouteResource = (resourcePath) => {
				const normalizedAbsoluteResourcePath = normalizeLoaderResourcePath(resourcePath);
				return normalizedAbsoluteResourcePath.startsWith(apiRoutesPath + path$2.sep) && dotPrefixedPageExtensions.some((ext) => normalizedAbsoluteResourcePath.endsWith(ext));
			};
			const possibleMiddlewareLocations = pageExtensions.flatMap((middlewareFileEnding) => {
				return [path$2.join(middlewareLocationFolder, `middleware.${middlewareFileEnding}`), path$2.join(middlewareLocationFolder, `proxy.${middlewareFileEnding}`)];
			});
			const isMiddlewareResource = (resourcePath) => {
				const normalizedAbsoluteResourcePath = normalizeLoaderResourcePath(resourcePath);
				return possibleMiddlewareLocations.includes(normalizedAbsoluteResourcePath);
			};
			const isServerComponentResource = (resourcePath) => {
				const normalizedAbsoluteResourcePath = normalizeLoaderResourcePath(resourcePath);
				return appDirPath !== void 0 && normalizedAbsoluteResourcePath.startsWith(appDirPath + path$2.sep) && !!normalizedAbsoluteResourcePath.match(new RegExp(`[\\\\/](page|layout|loading|head|not-found)\\.(${pageExtensionRegex})$`));
			};
			const isRouteHandlerResource = (resourcePath) => {
				const normalizedAbsoluteResourcePath = normalizeLoaderResourcePath(resourcePath);
				return appDirPath !== void 0 && normalizedAbsoluteResourcePath.startsWith(appDirPath + path$2.sep) && !!normalizedAbsoluteResourcePath.match(new RegExp(`[\\\\/]route\\.(${pageExtensionRegex})$`));
			};
			if (isServer && userSentryOptions.webpack?.autoInstrumentServerFunctions !== false) {
				newConfig.module.rules.unshift({
					test: isPageResource,
					use: [{
						loader: path$2.resolve(__dirname, "loaders", "wrappingLoader.js"),
						options: {
							...staticWrappingLoaderOptions,
							wrappingTargetKind: "page"
						}
					}]
				});
				newConfig.module.rules.unshift({
					test: isApiRouteResource,
					use: [{
						loader: path$2.resolve(__dirname, "loaders", "wrappingLoader.js"),
						options: {
							...staticWrappingLoaderOptions,
							vercelCronsConfig: vercelCronsConfigForWrapper,
							wrappingTargetKind: "api-route"
						}
					}]
				});
				const canWrapStandaloneMiddleware = userNextConfig.output !== "standalone" || !major || major < 16;
				if ((userSentryOptions.webpack?.autoInstrumentMiddleware ?? true) && canWrapStandaloneMiddleware) newConfig.module.rules.unshift({
					test: isMiddlewareResource,
					use: [{
						loader: path$2.resolve(__dirname, "loaders", "wrappingLoader.js"),
						options: {
							...staticWrappingLoaderOptions,
							wrappingTargetKind: "middleware"
						}
					}]
				});
			}
			if (isServer && userSentryOptions.webpack?.autoInstrumentAppDirectory !== false) {
				newConfig.module.rules.unshift({
					test: isServerComponentResource,
					use: [{
						loader: path$2.resolve(__dirname, "loaders", "wrappingLoader.js"),
						options: {
							...staticWrappingLoaderOptions,
							wrappingTargetKind: "server-component"
						}
					}]
				});
				newConfig.module.rules.unshift({
					test: isRouteHandlerResource,
					use: [{
						loader: path$2.resolve(__dirname, "loaders", "wrappingLoader.js"),
						options: {
							...staticWrappingLoaderOptions,
							wrappingTargetKind: "route-handler"
						}
					}]
				});
			}
			if (appDirPath) {
				if (!pageExtensions.map((extension) => `global-error.${extension}`).some((globalErrorFile) => fs$2.existsSync(path$2.join(appDirPath, globalErrorFile))) && !showedMissingGlobalErrorWarningMsg && !process.env.SENTRY_SUPPRESS_GLOBAL_ERROR_HANDLER_FILE_WARNING) {
					console.log("[@sentry/nextjs] It seems like you don't have a global error handler set up. It is recommended that you add a 'global-error.js' file with Sentry instrumentation so that React rendering errors are reported to Sentry. Read more: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#react-render-errors-in-app-router (you can suppress this warning by setting SENTRY_SUPPRESS_GLOBAL_ERROR_HANDLER_FILE_WARNING=1 as environment variable)");
					showedMissingGlobalErrorWarningMsg = true;
				}
			}
			if (!isServer) {
				const origEntryProperty = newConfig.entry;
				newConfig.entry = async () => addSentryToClientEntryProperty(origEntryProperty, buildContext);
				const clientSentryConfigFileName = getClientSentryConfigFile(projectDir);
				if (clientSentryConfigFileName) console.warn(`[@sentry/nextjs] DEPRECATION WARNING: It is recommended renaming your \`${clientSentryConfigFileName}\` file, or moving its content to \`instrumentation-client.ts\`. When using Turbopack \`${clientSentryConfigFileName}\` will no longer work. Read more about the \`instrumentation-client.ts\` file: https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation-client`);
			}
			const isStaticExport = userNextConfig?.output === "export";
			if (!(isDev || isStaticExport && isServer)) {
				const { sentryWebpackPlugin } = core.loadModule("@sentry/webpack-plugin", module) ?? {};
				if (sentryWebpackPlugin) {
					if (!userSentryOptions.sourcemaps?.disable) {
						if (!newConfig.devtool) {
							core.debug.log(`[@sentry/nextjs] Automatically enabling source map generation for ${runtime} build.`);
							if (isServer) newConfig.devtool = "source-map";
							else newConfig.devtool = "hidden-source-map";
						}
						if (!isServer && userSentryOptions.sourcemaps?.deleteSourcemapsAfterUpload === void 0) {
							core.debug.warn("[@sentry/nextjs] Source maps will be automatically deleted after being uploaded to Sentry. If you want to keep the source maps, set the `sourcemaps.deleteSourcemapsAfterUpload` option to false in `withSentryConfig()`. If you do not want to generate and upload sourcemaps at all, set the `sourcemaps.disable` option to true.");
							userSentryOptions.sourcemaps = {
								...userSentryOptions.sourcemaps,
								deleteSourcemapsAfterUpload: true
							};
						}
					}
					newConfig.plugins = newConfig.plugins || [];
					const { config: userNextConfig2, dir, nextRuntime } = buildContext;
					const buildTool = isServer ? nextRuntime === "edge" ? "webpack-edge" : "webpack-nodejs" : "webpack-client";
					const projectDir2 = getBuildPluginOptions.normalizePathForGlob(dir);
					const distDir = getBuildPluginOptions.normalizePathForGlob(userNextConfig2.distDir ?? ".next");
					const distDirAbsPath = path$2.posix.join(projectDir2, distDir);
					const sentryWebpackPluginInstance = sentryWebpackPlugin(getBuildPluginOptions.getBuildPluginOptions({
						sentryBuildOptions: userSentryOptions,
						releaseName,
						distDirAbsPath,
						buildTool,
						useRunAfterProductionCompileHook
					}));
					sentryWebpackPluginInstance._name = "sentry-webpack-plugin";
					newConfig.plugins.push(sentryWebpackPluginInstance);
				}
			}
			if (userSentryOptions.webpack?.treeshake) setupTreeshakingFromConfig(userSentryOptions, newConfig, buildContext);
			newConfig.plugins = newConfig.plugins || [];
			newConfig.plugins.push(new buildContext.webpack.DefinePlugin({ __SENTRY_SERVER_MODULES__: JSON.stringify(util.getPackageModules(projectDir)) }));
			return newConfig;
		};
	}
	async function addSentryToClientEntryProperty(currentEntryProperty, buildContext) {
		const { dir: projectDir, dev: isDevMode } = buildContext;
		const newEntryProperty = typeof currentEntryProperty === "function" ? await currentEntryProperty() : { ...currentEntryProperty };
		const clientSentryConfigFileName = getClientSentryConfigFile(projectDir);
		const instrumentationClientFileName = getInstrumentationClientFile(projectDir);
		const filesToInject = [];
		if (clientSentryConfigFileName) filesToInject.push(`./${clientSentryConfigFileName}`);
		if (instrumentationClientFileName) filesToInject.push(`./${instrumentationClientFileName}`);
		for (const entryPointName in newEntryProperty) if (entryPointName === "pages/_app" || entryPointName === "main-app") addFilesToWebpackEntryPoint(newEntryProperty, entryPointName, filesToInject, isDevMode);
		return newEntryProperty;
	}
	function getInstrumentationFile(projectDir, dotPrefixedExtensions) {
		const paths = dotPrefixedExtensions.flatMap((extension) => [["src", `instrumentation${extension}`], [`instrumentation${extension}`]]);
		for (const pathSegments of paths) try {
			return fs$2.readFileSync(path$2.resolve(projectDir, ...pathSegments), { encoding: "utf-8" });
		} catch {}
		return null;
	}
	function warnAboutMissingOnRequestErrorHandler(instrumentationFile) {
		if (!instrumentationFile) {
			if (!process.env.SENTRY_SUPPRESS_INSTRUMENTATION_FILE_WARNING) console.warn("[@sentry/nextjs] Could not find a Next.js instrumentation file. This indicates an incomplete configuration of the Sentry SDK. An instrumentation file is required for the Sentry SDK to be initialized on the server: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#create-initialization-config-files (you can suppress this warning by setting SENTRY_SUPPRESS_INSTRUMENTATION_FILE_WARNING=1 as environment variable)");
			return;
		}
		if (!instrumentationFile.includes("onRequestError")) console.warn("[@sentry/nextjs] Could not find `onRequestError` hook in instrumentation file. This indicates outdated configuration of the Sentry SDK. Use `Sentry.captureRequestError` to instrument the `onRequestError` hook: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#errors-from-nested-react-server-components");
	}
	function warnAboutDeprecatedConfigFiles(projectDir, instrumentationFile, platform) {
		if (instrumentationFile && (instrumentationFile.includes("@sentry/") || instrumentationFile.match(/sentry\.(server|edge)\.config(\.(ts|js))?/))) return;
		for (const filename of [`sentry.${platform}.config.ts`, `sentry.${platform}.config.js`]) if (fs$2.existsSync(path$2.resolve(projectDir, filename))) console.warn(`[@sentry/nextjs] It appears you've configured a \`${filename}\` file. Please ensure to put this file's content into the \`register()\` function of a Next.js instrumentation file instead. To ensure correct functionality of the SDK, \`Sentry.init\` must be called inside of an instrumentation file. Learn more about setting up an instrumentation file in Next.js: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation. You can safely delete the \`${filename}\` file afterward.`);
	}
	function getClientSentryConfigFile(projectDir) {
		for (const filename of ["sentry.client.config.ts", "sentry.client.config.js"]) if (fs$2.existsSync(path$2.resolve(projectDir, filename))) return filename;
	}
	function getInstrumentationClientFile(projectDir) {
		for (const pathParts of [
			["src", "instrumentation-client.js"],
			["src", "instrumentation-client.ts"],
			["instrumentation-client.js"],
			["instrumentation-client.ts"]
		]) if (fs$2.existsSync(path$2.resolve(projectDir, ...pathParts))) return path$2.join(...pathParts);
	}
	function addFilesToWebpackEntryPoint(entryProperty, entryPointName, filesToInsert, isDevMode) {
		const currentEntryPoint = entryProperty[entryPointName];
		let newEntryPoint = currentEntryPoint;
		if (typeof currentEntryPoint === "string" || Array.isArray(currentEntryPoint)) {
			newEntryPoint = Array.isArray(currentEntryPoint) ? currentEntryPoint : [currentEntryPoint];
			if (newEntryPoint.some((entry) => filesToInsert.includes(entry))) return;
			if (isDevMode) newEntryPoint.push(...filesToInsert);
			else newEntryPoint.unshift(...filesToInsert);
		} else if (typeof currentEntryPoint === "object" && "import" in currentEntryPoint) {
			const currentImportValue = currentEntryPoint.import;
			const newImportValue = Array.isArray(currentImportValue) ? currentImportValue : [currentImportValue];
			if (newImportValue.some((entry) => filesToInsert.includes(entry))) return;
			if (isDevMode) newImportValue.push(...filesToInsert);
			else newImportValue.unshift(...filesToInsert);
			newEntryPoint = {
				...currentEntryPoint,
				import: newImportValue
			};
		} else console.error("Sentry Logger [Error]:", `Could not inject SDK initialization code into entry point ${entryPointName}, as its current value is not in a recognized format.
`, "Expected: string | Array<string> | { [key:string]: any, import: string | Array<string> }\n", `Got: ${currentEntryPoint}`);
		if (newEntryPoint) entryProperty[entryPointName] = newEntryPoint;
	}
	function setUpModuleRules(newConfig) {
		newConfig.module = {
			...newConfig.module,
			rules: [...newConfig.module?.rules || []]
		};
		return newConfig;
	}
	function addValueInjectionLoader({ newConfig, userNextConfig, userSentryOptions, buildContext, releaseName, routeManifest, nextJsVersion, vercelCronsConfig }) {
		const assetPrefix = userNextConfig.assetPrefix || userNextConfig.basePath || "";
		const shouldCreateRelease = userSentryOptions.release?.create !== false;
		const releaseToInject = releaseName && shouldCreateRelease ? releaseName : void 0;
		const isomorphicValues = {
			_sentryRewritesTunnelPath: userSentryOptions.tunnelRoute !== void 0 && userNextConfig.output !== "export" && typeof userSentryOptions.tunnelRoute === "string" ? `${userNextConfig.basePath ?? ""}${userSentryOptions.tunnelRoute}` : void 0,
			SENTRY_RELEASE: releaseToInject && !buildContext.dev ? { id: releaseToInject } : void 0,
			_sentryBasePath: buildContext.dev ? userNextConfig.basePath : void 0,
			_sentryNextJsVersion: nextJsVersion
		};
		const serverValues = {
			...isomorphicValues,
			_sentryRewriteFramesDistDir: userNextConfig.distDir?.replace(/\\/g, "\\\\") || ".next",
			_sentryVercelCronsConfig: vercelCronsConfig ? JSON.stringify(vercelCronsConfig) : void 0
		};
		const clientValues = {
			...isomorphicValues,
			_sentryRewriteFramesAssetPrefixPath: assetPrefix ? new URL(assetPrefix, "http://dogs.are.great").pathname.replace(/\/$/, "") : "",
			_sentryAssetPrefix: userNextConfig.assetPrefix,
			_sentryExperimentalThirdPartyOriginStackFrames: userSentryOptions._experimental?.thirdPartyOriginStackFrames ? "true" : void 0,
			_sentryRouteManifest: JSON.stringify(routeManifest)
		};
		if (buildContext.isServer) newConfig.module.rules.push({
			test: /(src[\\/])?instrumentation.(js|ts)/,
			use: [{
				loader: path$2.resolve(__dirname, "loaders/valueInjectionLoader.js"),
				options: { values: serverValues }
			}]
		});
		else newConfig.module.rules.push({
			test: /(?:sentry\.client\.config\.(jsx?|tsx?)|(?:src[\\/])?instrumentation-client\.(js|ts))$/,
			use: [{
				loader: path$2.resolve(__dirname, "loaders/valueInjectionLoader.js"),
				options: { values: clientValues }
			}]
		});
	}
	function resolveNextPackageDirFromDirectory(basedir) {
		try {
			return path$2.dirname(module$1.createRequire(`${basedir}/`).resolve("next/package.json"));
		} catch {
			return;
		}
	}
	const POTENTIAL_REQUEST_ASYNC_STORAGE_LOCATIONS = [
		"next/dist/client/components/request-async-storage.js",
		"next/dist/client/components/request-async-storage.external.js",
		"next/dist/server/app-render/work-unit-async-storage.external.js",
		"next/dist/client/components/work-unit-async-storage.external.js"
	];
	function getRequestAsyncStorageModuleLocation(webpackContextDir, webpackResolvableModuleLocations) {
		if (webpackResolvableModuleLocations === void 0) return;
		const absoluteWebpackResolvableModuleLocations = webpackResolvableModuleLocations.map((loc) => path$2.resolve(webpackContextDir, loc));
		for (const webpackResolvableLocation of absoluteWebpackResolvableModuleLocations) {
			const nextPackageDir = resolveNextPackageDirFromDirectory(webpackResolvableLocation);
			if (nextPackageDir) {
				const asyncLocalStorageLocation = POTENTIAL_REQUEST_ASYNC_STORAGE_LOCATIONS.find((loc) => fs$2.existsSync(path$2.join(nextPackageDir, "..", loc)));
				if (asyncLocalStorageLocation) return asyncLocalStorageLocation;
			}
		}
	}
	function addOtelWarningIgnoreRule(newConfig) {
		const ignoreRules = [
			(warning, compilation) => {
				try {
					if (!warning.module) return false;
					const isDependencyThatMayRaiseCriticalDependencyMessage = /@opentelemetry\/instrumentation/.test(warning.module.readableIdentifier(compilation.requestShortener)) || /@prisma\/instrumentation/.test(warning.module.readableIdentifier(compilation.requestShortener));
					const isCriticalDependencyMessage = /Critical dependency/.test(warning.message);
					return isDependencyThatMayRaiseCriticalDependencyMessage && isCriticalDependencyMessage;
				} catch {
					return false;
				}
			},
			{
				module: /@opentelemetry\/instrumentation/,
				message: /Critical dependency/
			},
			{
				module: /@prisma\/instrumentation/,
				message: /Critical dependency/
			},
			{
				module: /require-in-the-middle/,
				message: /Critical dependency/
			}
		];
		if (newConfig.ignoreWarnings === void 0) newConfig.ignoreWarnings = ignoreRules;
		else if (Array.isArray(newConfig.ignoreWarnings)) newConfig.ignoreWarnings.push(...ignoreRules);
	}
	function addEdgeRuntimePolyfills(newConfig, buildContext) {
		newConfig.plugins = newConfig.plugins || [];
		newConfig.plugins.push(new buildContext.webpack.ProvidePlugin({ performance: [path$2.resolve(__dirname, "polyfills", "perf_hooks.js"), "performance"] }));
		newConfig.resolve = newConfig.resolve || {};
		newConfig.resolve.alias = {
			...newConfig.resolve.alias,
			perf_hooks: path$2.resolve(__dirname, "polyfills", "perf_hooks.js")
		};
	}
	function setupTreeshakingFromConfig(userSentryOptions, newConfig, buildContext) {
		const defines = {};
		newConfig.plugins = newConfig.plugins || [];
		if (userSentryOptions.webpack?.treeshake?.removeDebugLogging) defines.__SENTRY_DEBUG__ = false;
		if (userSentryOptions.webpack?.treeshake?.removeTracing) defines.__SENTRY_TRACING__ = false;
		if (userSentryOptions.webpack?.treeshake?.excludeReplayIframe) defines.__RRWEB_EXCLUDE_IFRAME__ = true;
		if (userSentryOptions.webpack?.treeshake?.excludeReplayShadowDOM) defines.__RRWEB_EXCLUDE_SHADOW_DOM__ = true;
		if (userSentryOptions.webpack?.treeshake?.excludeReplayCompressionWorker) defines.__SENTRY_EXCLUDE_REPLAY_WORKER__ = true;
		if (Object.keys(defines).length > 0) newConfig.plugins.push(new buildContext.webpack.DefinePlugin(defines));
	}
	exports.constructWebpackConfigFunction = constructWebpackConfigFunction;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/config/withSentryConfig/constants.js
var require_constants = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	exports.DEFAULT_SERVER_EXTERNAL_PACKAGES = [
		"amqplib",
		"connect",
		"dataloader",
		"express",
		"generic-pool",
		"graphql",
		"@hapi/hapi",
		"ioredis",
		"kafkajs",
		"koa",
		"lru-memoizer",
		"mongodb",
		"mongoose",
		"mysql",
		"mysql2",
		"knex",
		"pg",
		"pg-pool",
		"@node-redis/client",
		"@redis/client",
		"redis",
		"tedious"
	];
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/config/withSentryConfig/getFinalConfigObjectBundlerUtils.js
var require_getFinalConfigObjectBundlerUtils = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const handleRunAfterProductionCompile = require_handleRunAfterProductionCompile();
	const constructTurbopackConfig = require_constructTurbopackConfig();
	const util = require_util();
	const webpack = require_webpack();
	const constants = require_constants();
	function getBundlerInfo(nextJsVersion) {
		const activeBundler = util.detectActiveBundler();
		return {
			isTurbopack: activeBundler === "turbopack",
			isWebpack: activeBundler === "webpack",
			isTurbopackSupported: util.supportsProductionCompileHook(nextJsVersion ?? "")
		};
	}
	function maybeWarnAboutUnsupportedTurbopack(nextJsVersion, bundlerInfo) {
		if (!bundlerInfo.isTurbopackSupported && bundlerInfo.isTurbopack) console.warn(`[@sentry/nextjs] WARNING: You are using the Sentry SDK with Turbopack. The Sentry SDK is compatible with Turbopack on Next.js version 15.4.1 or later. You are currently on ${nextJsVersion}. Please upgrade to a newer Next.js version to use the Sentry SDK with Turbopack.`);
	}
	function maybeWarnAboutUnsupportedRunAfterProductionCompileHook(nextJsVersion, userSentryOptions, bundlerInfo) {
		if (userSentryOptions.useRunAfterProductionCompileHook && !util.supportsProductionCompileHook(nextJsVersion ?? "") && bundlerInfo.isWebpack) console.warn("[@sentry/nextjs] The configured `useRunAfterProductionCompileHook` option is not compatible with your current Next.js version. This option is only supported on Next.js version 15.4.1 or later. Will not run source map and release management logic.");
	}
	function maybeConstructTurbopackConfig(incomingUserNextConfigObject, userSentryOptions, routeManifest, nextJsVersion, bundlerInfo, vercelCronsConfigResult) {
		if (!bundlerInfo.isTurbopack) return;
		const vercelCronsConfig = vercelCronsConfigResult.strategy === "spans" ? vercelCronsConfigResult.config : void 0;
		return constructTurbopackConfig.constructTurbopackConfig({
			userNextConfig: incomingUserNextConfigObject,
			userSentryOptions,
			routeManifest,
			nextJsVersion,
			vercelCronsConfig
		});
	}
	function resolveUseRunAfterProductionCompileHookOption(userSentryOptions, bundlerInfo) {
		return userSentryOptions.useRunAfterProductionCompileHook ?? (bundlerInfo.isTurbopack ? true : false);
	}
	function maybeSetUpRunAfterProductionCompileHook({ incomingUserNextConfigObject, userSentryOptions, releaseName, nextJsVersion, bundlerInfo, turboPackConfig, shouldUseRunAfterProductionCompileHook }) {
		if (!shouldUseRunAfterProductionCompileHook) return;
		if (!util.supportsProductionCompileHook(nextJsVersion ?? "")) return;
		if (incomingUserNextConfigObject?.compiler?.runAfterProductionCompile === void 0) {
			incomingUserNextConfigObject.compiler ?? (incomingUserNextConfigObject.compiler = {});
			incomingUserNextConfigObject.compiler.runAfterProductionCompile = async ({ distDir }) => {
				await handleRunAfterProductionCompile.handleRunAfterProductionCompile({
					releaseName,
					distDir,
					buildTool: bundlerInfo.isTurbopack ? "turbopack" : "webpack",
					usesNativeDebugIds: bundlerInfo.isTurbopack ? turboPackConfig?.debugIds : void 0,
					sriEnabled: !!incomingUserNextConfigObject.experimental?.sri
				}, userSentryOptions);
			};
			return;
		}
		if (typeof incomingUserNextConfigObject.compiler.runAfterProductionCompile === "function") {
			incomingUserNextConfigObject.compiler.runAfterProductionCompile = new Proxy(incomingUserNextConfigObject.compiler.runAfterProductionCompile, { async apply(target, thisArg, argArray) {
				const { distDir } = argArray[0] ?? { distDir: ".next" };
				await target.apply(thisArg, argArray);
				await handleRunAfterProductionCompile.handleRunAfterProductionCompile({
					releaseName,
					distDir,
					buildTool: bundlerInfo.isTurbopack ? "turbopack" : "webpack",
					usesNativeDebugIds: bundlerInfo.isTurbopack ? turboPackConfig?.debugIds : void 0,
					sriEnabled: !!incomingUserNextConfigObject.experimental?.sri
				}, userSentryOptions);
			} });
			return;
		}
		console.warn("[@sentry/nextjs] The configured `compiler.runAfterProductionCompile` option is not a function. Will not run source map and release management logic.");
	}
	function maybeEnableTurbopackSourcemaps(incomingUserNextConfigObject, userSentryOptions, bundlerInfo) {
		if (!bundlerInfo.isTurbopackSupported || !bundlerInfo.isTurbopack || userSentryOptions.sourcemaps?.disable) return;
		if (incomingUserNextConfigObject.productionBrowserSourceMaps !== void 0) return;
		if (userSentryOptions.debug) console.log("[@sentry/nextjs] Automatically enabling browser source map generation for turbopack build.");
		incomingUserNextConfigObject.productionBrowserSourceMaps = true;
		if (userSentryOptions.sourcemaps?.deleteSourcemapsAfterUpload !== void 0) return;
		if (userSentryOptions.debug) console.warn("[@sentry/nextjs] Source maps will be automatically deleted after being uploaded to Sentry. If you want to keep the source maps, set the `sourcemaps.deleteSourcemapsAfterUpload` option to false in `withSentryConfig()`. If you do not want to generate and upload sourcemaps at all, set the `sourcemaps.disable` option to true.");
		userSentryOptions.sourcemaps = {
			...userSentryOptions.sourcemaps,
			deleteSourcemapsAfterUpload: true
		};
	}
	function getServerExternalPackagesPatch(incomingUserNextConfigObject, nextMajor) {
		if (nextMajor && nextMajor >= 15) return { serverExternalPackages: [...incomingUserNextConfigObject.serverExternalPackages || [], ...constants.DEFAULT_SERVER_EXTERNAL_PACKAGES] };
		return { experimental: {
			...incomingUserNextConfigObject.experimental,
			serverComponentsExternalPackages: [...incomingUserNextConfigObject.experimental?.serverComponentsExternalPackages || [], ...constants.DEFAULT_SERVER_EXTERNAL_PACKAGES]
		} };
	}
	function getWebpackPatch({ incomingUserNextConfigObject, userSentryOptions, releaseName, routeManifest, nextJsVersion, shouldUseRunAfterProductionCompileHook, bundlerInfo, vercelCronsConfigResult }) {
		if (!bundlerInfo.isWebpack || userSentryOptions.webpack?.disableSentryConfig) return {};
		return { webpack: webpack.constructWebpackConfigFunction({
			userNextConfig: incomingUserNextConfigObject,
			userSentryOptions,
			releaseName,
			routeManifest,
			nextJsVersion,
			useRunAfterProductionCompileHook: shouldUseRunAfterProductionCompileHook,
			vercelCronsConfigResult
		}) };
	}
	function getTurbopackPatch(bundlerInfo, turboPackConfig) {
		if (!bundlerInfo.isTurbopackSupported || !bundlerInfo.isTurbopack) return {};
		return { turbopack: turboPackConfig };
	}
	exports.getBundlerInfo = getBundlerInfo;
	exports.getServerExternalPackagesPatch = getServerExternalPackagesPatch;
	exports.getTurbopackPatch = getTurbopackPatch;
	exports.getWebpackPatch = getWebpackPatch;
	exports.maybeConstructTurbopackConfig = maybeConstructTurbopackConfig;
	exports.maybeEnableTurbopackSourcemaps = maybeEnableTurbopackSourcemaps;
	exports.maybeSetUpRunAfterProductionCompileHook = maybeSetUpRunAfterProductionCompileHook;
	exports.maybeWarnAboutUnsupportedRunAfterProductionCompileHook = maybeWarnAboutUnsupportedRunAfterProductionCompileHook;
	exports.maybeWarnAboutUnsupportedTurbopack = maybeWarnAboutUnsupportedTurbopack;
	exports.resolveUseRunAfterProductionCompileHookOption = resolveUseRunAfterProductionCompileHookOption;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/config/manifest/createRouteManifest.js
var require_createRouteManifest = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const fs$1 = __require("fs");
	const path$1 = __require("path");
	let manifestCache = null;
	let lastAppDirPath = null;
	let lastIncludeRouteGroups = void 0;
	function isPageFile(filename) {
		return filename === "page.tsx" || filename === "page.jsx" || filename === "page.ts" || filename === "page.js";
	}
	function isRouteGroup(name) {
		return name.startsWith("(") && name.endsWith(")");
	}
	function normalizeRouteGroupPath(routePath) {
		return routePath.replace(/\/\((?=[^)/]*\))[^)/]+\)/g, "");
	}
	function getDynamicRouteSegment(name) {
		if (name.startsWith("[[...") && name.endsWith("]]")) return `:${name.slice(5, -2)}*?`;
		else if (name.startsWith("[...") && name.endsWith("]")) return `:${name.slice(4, -1)}*`;
		return `:${name.slice(1, -1)}`;
	}
	function buildRegexForDynamicRoute(routePath) {
		const segments = routePath.split("/").filter(Boolean);
		const regexSegments = [];
		const paramNames = [];
		let hasOptionalCatchall = false;
		for (const segment of segments) if (segment.startsWith(":")) {
			const paramName = segment.substring(1);
			if (paramName.endsWith("*?")) {
				const cleanParamName = paramName.slice(0, -2);
				paramNames.push(cleanParamName);
				hasOptionalCatchall = true;
			} else if (paramName.endsWith("*")) {
				const cleanParamName = paramName.slice(0, -1);
				paramNames.push(cleanParamName);
				regexSegments.push("(.+)");
			} else {
				paramNames.push(paramName);
				regexSegments.push("([^/]+)");
			}
		} else regexSegments.push(segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
		let pattern;
		if (hasOptionalCatchall) if (regexSegments.length === 0) pattern = "^/(.*)$";
		else pattern = `^/${regexSegments.join("/")}(?:/(.*))?$`;
		else pattern = `^/${regexSegments.join("/")}$`;
		return {
			regex: pattern,
			paramNames,
			hasOptionalPrefix: hasOptionalPrefix(paramNames)
		};
	}
	function hasOptionalPrefix(paramNames) {
		const firstParam = paramNames[0];
		if (firstParam === void 0) return false;
		return firstParam === "locale" || firstParam === "lang" || firstParam === "language";
	}
	function checkForGenerateStaticParams(pageFilePath) {
		try {
			const content = fs$1.readFileSync(pageFilePath, "utf8");
			return /export\s+(async\s+)?function\s+generateStaticParams|export\s+const\s+generateStaticParams/.test(content);
		} catch {
			return false;
		}
	}
	function scanAppDirectory(dir, basePath = "", includeRouteGroups = false) {
		const dynamicRoutes = [];
		const staticRoutes = [];
		const isrRoutes = [];
		try {
			const entries = fs$1.readdirSync(dir, { withFileTypes: true });
			const pageFile = entries.find((entry) => isPageFile(entry.name));
			if (pageFile) {
				const routePath = includeRouteGroups ? basePath || "/" : normalizeRouteGroupPath(basePath || "/");
				const isDynamic = routePath.includes(":");
				if (checkForGenerateStaticParams(path$1.join(dir, pageFile.name))) isrRoutes.push(routePath);
				if (isDynamic) {
					const { regex, paramNames, hasOptionalPrefix: hasOptionalPrefix2 } = buildRegexForDynamicRoute(routePath);
					dynamicRoutes.push({
						path: routePath,
						regex,
						paramNames,
						hasOptionalPrefix: hasOptionalPrefix2
					});
				} else staticRoutes.push({ path: routePath });
			}
			for (const entry of entries) if (entry.isDirectory()) {
				const fullPath = path$1.join(dir, entry.name);
				let routeSegment;
				const isDynamic = entry.name.startsWith("[") && entry.name.endsWith("]");
				if (isRouteGroup(entry.name)) if (includeRouteGroups) routeSegment = entry.name;
				else routeSegment = "";
				else if (isDynamic) routeSegment = getDynamicRouteSegment(entry.name);
				else routeSegment = entry.name;
				const subRoutes = scanAppDirectory(fullPath, routeSegment ? `${basePath}/${routeSegment}` : basePath, includeRouteGroups);
				dynamicRoutes.push(...subRoutes.dynamicRoutes);
				staticRoutes.push(...subRoutes.staticRoutes);
				isrRoutes.push(...subRoutes.isrRoutes);
			}
		} catch (error) {
			console.warn("Error building route manifest:", error);
		}
		return {
			dynamicRoutes,
			staticRoutes,
			isrRoutes
		};
	}
	function createRouteManifest(options) {
		let targetDir;
		if (options?.appDirPath) targetDir = options.appDirPath;
		else {
			const projectDir = process.cwd();
			const maybeAppDirPath = path$1.join(projectDir, "app");
			const maybeSrcAppDirPath = path$1.join(projectDir, "src", "app");
			if (fs$1.existsSync(maybeAppDirPath) && fs$1.lstatSync(maybeAppDirPath).isDirectory()) targetDir = maybeAppDirPath;
			else if (fs$1.existsSync(maybeSrcAppDirPath) && fs$1.lstatSync(maybeSrcAppDirPath).isDirectory()) targetDir = maybeSrcAppDirPath;
		}
		if (!targetDir) return {
			isrRoutes: [],
			dynamicRoutes: [],
			staticRoutes: []
		};
		if (manifestCache && lastAppDirPath === targetDir && lastIncludeRouteGroups === options?.includeRouteGroups) return manifestCache;
		const { dynamicRoutes, staticRoutes, isrRoutes } = scanAppDirectory(targetDir, options?.basePath, options?.includeRouteGroups);
		const manifest = {
			dynamicRoutes,
			staticRoutes,
			isrRoutes
		};
		manifestCache = manifest;
		lastAppDirPath = targetDir;
		lastIncludeRouteGroups = options?.includeRouteGroups;
		return manifest;
	}
	exports.createRouteManifest = createRouteManifest;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/config/withSentryConfig/tunnel.js
var require_tunnel = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	function generateRandomTunnelRoute() {
		return `/${core._INTERNAL_safeMathRandom().toString(36).substring(2, 10)}`;
	}
	function resolveTunnelRoute(tunnelRoute) {
		if (process.env.__SENTRY_TUNNEL_ROUTE__) return process.env.__SENTRY_TUNNEL_ROUTE__;
		const resolvedTunnelRoute = typeof tunnelRoute === "string" ? tunnelRoute : generateRandomTunnelRoute();
		if (resolvedTunnelRoute) process.env.__SENTRY_TUNNEL_ROUTE__ = resolvedTunnelRoute;
		return resolvedTunnelRoute;
	}
	function setUpTunnelRewriteRules(userNextConfig, tunnelPath) {
		const originalRewrites = userNextConfig.rewrites;
		const destinationOverride = process.env._SENTRY_TUNNEL_DESTINATION_OVERRIDE;
		const destination = destinationOverride || "https://o:orgid.ingest.sentry.io/api/:projectid/envelope/?hsts=0";
		const destinationWithRegion = destinationOverride || "https://o:orgid.ingest.:region.sentry.io/api/:projectid/envelope/?hsts=0";
		userNextConfig.rewrites = async (...args) => {
			const tunnelRouteRewrite = {
				source: `${tunnelPath}(/?)`,
				has: [{
					type: "query",
					key: "o",
					value: "(?<orgid>\\d*)"
				}, {
					type: "query",
					key: "p",
					value: "(?<projectid>\\d*)"
				}],
				destination
			};
			const newRewrites = [{
				source: `${tunnelPath}(/?)`,
				has: [
					{
						type: "query",
						key: "o",
						value: "(?<orgid>\\d*)"
					},
					{
						type: "query",
						key: "p",
						value: "(?<projectid>\\d*)"
					},
					{
						type: "query",
						key: "r",
						value: "(?<region>[a-z]{2})"
					}
				],
				destination: destinationWithRegion
			}, tunnelRouteRewrite];
			if (typeof originalRewrites !== "function") return newRewrites;
			const originalRewritesResult = await originalRewrites(...args);
			if (Array.isArray(originalRewritesResult)) return [...newRewrites, ...originalRewritesResult];
			else return {
				...originalRewritesResult,
				beforeFiles: [...newRewrites, ...originalRewritesResult.beforeFiles || []]
			};
		};
	}
	exports.resolveTunnelRoute = resolveTunnelRoute;
	exports.setUpTunnelRewriteRules = setUpTunnelRewriteRules;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/config/withSentryConfig/getFinalConfigObjectUtils.js
var require_getFinalConfigObjectUtils = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const node = require_cjs();
	const fs = __require("fs");
	const path = __require("path");
	const createRouteManifest = require_createRouteManifest();
	const util = require_util();
	const buildTime = require_buildTime();
	const tunnel = require_tunnel();
	let showedExportModeTunnelWarning = false;
	let showedExperimentalBuildModeWarning = false;
	function resolveReleaseName(userSentryOptions) {
		return userSentryOptions.release?.create !== false ? userSentryOptions.release?.name ?? node.getSentryRelease() ?? buildTime.getGitRevision() : userSentryOptions.release?.name;
	}
	function maybeSetUpTunnelRouteRewriteRules(incomingUserNextConfigObject, userSentryOptions) {
		if (!userSentryOptions.tunnelRoute) return;
		if (incomingUserNextConfigObject.output === "export") {
			if (!showedExportModeTunnelWarning) {
				showedExportModeTunnelWarning = true;
				console.warn("[@sentry/nextjs] The Sentry Next.js SDK `tunnelRoute` option will not work in combination with Next.js static exports. The `tunnelRoute` option uses server-side features that cannot be accessed in export mode. If you still want to tunnel Sentry events, set up your own tunnel: https://docs.sentry.io/platforms/javascript/troubleshooting/#using-the-tunnel-option");
			}
			return;
		}
		const resolvedTunnelRoute = tunnel.resolveTunnelRoute(userSentryOptions.tunnelRoute);
		userSentryOptions.tunnelRoute = resolvedTunnelRoute || void 0;
		tunnel.setUpTunnelRewriteRules(incomingUserNextConfigObject, resolvedTunnelRoute);
	}
	function shouldReturnEarlyInExperimentalBuildMode() {
		if (!process.argv.includes("--experimental-build-mode")) return false;
		if (!showedExperimentalBuildModeWarning) {
			showedExperimentalBuildModeWarning = true;
			console.warn("[@sentry/nextjs] The Sentry Next.js SDK does not currently fully support next build --experimental-build-mode");
		}
		return process.argv.includes("generate");
	}
	function maybeCreateRouteManifest(incomingUserNextConfigObject, userSentryOptions) {
		if (userSentryOptions.disableManifestInjection) console.warn("[@sentry/nextjs] The `disableManifestInjection` option is deprecated. Use `routeManifestInjection: false` instead.");
		if (userSentryOptions.routeManifestInjection === false) return;
		if (userSentryOptions.routeManifestInjection === void 0 && userSentryOptions.disableManifestInjection) return;
		const manifest = createRouteManifest.createRouteManifest({ basePath: incomingUserNextConfigObject.basePath });
		const excludeFilter = userSentryOptions.routeManifestInjection?.exclude;
		return filterRouteManifest(manifest, excludeFilter);
	}
	function filterRouteManifest(manifest, excludeFilter) {
		if (!excludeFilter) return manifest;
		const shouldExclude = (route) => {
			if (typeof excludeFilter === "function") return excludeFilter(route);
			return excludeFilter.some((pattern) => core.isMatchingPattern(route, pattern));
		};
		return {
			staticRoutes: manifest.staticRoutes.filter((r) => !shouldExclude(r.path)),
			dynamicRoutes: manifest.dynamicRoutes.filter((r) => !shouldExclude(r.path)),
			isrRoutes: manifest.isrRoutes.filter((r) => !shouldExclude(r))
		};
	}
	function maybeSetClientTraceMetadataOption(incomingUserNextConfigObject, nextJsVersion) {
		if (nextJsVersion) {
			const { major, minor } = core.parseSemver(nextJsVersion);
			if (major !== void 0 && minor !== void 0 && (major >= 15 || major === 14 && minor >= 3)) {
				incomingUserNextConfigObject.experimental = incomingUserNextConfigObject.experimental || {};
				incomingUserNextConfigObject.experimental.clientTraceMetadata = [
					"baggage",
					"sentry-trace",
					...incomingUserNextConfigObject.experimental?.clientTraceMetadata || []
				];
			}
		} else console.log("[@sentry/nextjs] The Sentry SDK was not able to determine your Next.js version. If you are using Next.js version 15 or greater, please add `experimental.clientTraceMetadata: ['sentry-trace', 'baggage']` to your Next.js config to enable pageload tracing for App Router.");
	}
	function maybeSetInstrumentationHookOption(incomingUserNextConfigObject, nextJsVersion) {
		if (nextJsVersion && util.requiresInstrumentationHook(nextJsVersion)) {
			if (incomingUserNextConfigObject.experimental?.instrumentationHook === false) console.warn("[@sentry/nextjs] You turned off the `experimental.instrumentationHook` option. Note that Sentry will not be initialized if you did not set it up inside `instrumentation.(js|ts)`.");
			incomingUserNextConfigObject.experimental = {
				instrumentationHook: true,
				...incomingUserNextConfigObject.experimental
			};
			return;
		}
		if (nextJsVersion) return;
		if (incomingUserNextConfigObject.experimental && "instrumentationHook" in incomingUserNextConfigObject.experimental) {
			if (incomingUserNextConfigObject.experimental.instrumentationHook === false) console.warn("[@sentry/nextjs] You set `experimental.instrumentationHook` to `false`. If you are using Next.js version 15 or greater, you can remove that option. If you are using Next.js version 14 or lower, you need to set `experimental.instrumentationHook` in your `next.config.(js|mjs)` to `true` for the SDK to be properly initialized in combination with `instrumentation.(js|ts)`.");
		} else {
			console.log("[@sentry/nextjs] The Sentry SDK was not able to determine your Next.js version. If you are using Next.js version 15 or greater, Next.js will probably show you a warning about the `experimental.instrumentationHook` being set. To silence Next.js' warning, explicitly set the `experimental.instrumentationHook` option in your `next.config.(js|mjs|ts)` to `undefined`. If you are on Next.js version 14 or lower, you can silence this particular warning by explicitly setting the `experimental.instrumentationHook` option in your `next.config.(js|mjs)` to `true`.");
			incomingUserNextConfigObject.experimental = {
				instrumentationHook: true,
				...incomingUserNextConfigObject.experimental
			};
		}
	}
	function warnIfMissingOnRouterTransitionStartHook(userSentryOptions) {
		const instrumentationClientFileContents = buildTime.getInstrumentationClientFileContents();
		if (instrumentationClientFileContents !== void 0 && !instrumentationClientFileContents.includes("onRouterTransitionStart") && !userSentryOptions.suppressOnRouterTransitionStartWarning) console.warn("[@sentry/nextjs] ACTION REQUIRED: To instrument navigations, the Sentry SDK requires you to export an `onRouterTransitionStart` hook from your `instrumentation-client.(js|ts)` file. You can do so by adding `export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;` to the file.");
	}
	function getNextMajor(nextJsVersion) {
		if (!nextJsVersion) return;
		const { major } = core.parseSemver(nextJsVersion);
		return major;
	}
	function readVercelCronsConfig() {
		try {
			const vercelJsonPath = path.join(process.cwd(), "vercel.json");
			const vercelJsonContents = fs.readFileSync(vercelJsonPath, "utf8");
			const cronsConfig = JSON.parse(vercelJsonContents).crons;
			if (cronsConfig && Array.isArray(cronsConfig) && cronsConfig.length > 0) return cronsConfig;
			return;
		} catch (e) {
			if (e.code === "ENOENT") return;
			core.debug.error("[@sentry/nextjs] Failed to read vercel.json for automatic cron job monitoring instrumentation", e);
			return;
		}
	}
	function maybeGetVercelCronsConfig(userSentryOptions) {
		const result = {
			config: void 0,
			strategy: void 0
		};
		if (!process.env.VERCEL) return result;
		const experimentalEnabled = userSentryOptions._experimental?.vercelCronsMonitoring === true;
		const legacyEnabled = userSentryOptions.webpack?.automaticVercelMonitors === true;
		if (!experimentalEnabled && !legacyEnabled) return result;
		const config = readVercelCronsConfig();
		if (!config) return result;
		result.config = config;
		if (experimentalEnabled && legacyEnabled) {
			core.debug.warn("[@sentry/nextjs] Both '_experimental.vercelCronsMonitoring' and 'webpack.automaticVercelMonitors' are enabled. Using the new span-based approach from '_experimental.vercelCronsMonitoring'. You can remove 'webpack.automaticVercelMonitors' from your config.");
			result.strategy = "spans";
		} else if (experimentalEnabled) {
			core.debug.log("[@sentry/nextjs] Creating Sentry cron monitors for your Vercel Cron Jobs using span-based instrumentation.");
			result.strategy = "spans";
		} else {
			core.debug.log("[@sentry/nextjs] Creating Sentry cron monitors for your Vercel Cron Jobs. You can disable this feature by setting the 'automaticVercelMonitors' option to false in your Next.js config.");
			result.strategy = "wrapper";
		}
		return result;
	}
	exports.filterRouteManifest = filterRouteManifest;
	exports.getNextMajor = getNextMajor;
	exports.maybeCreateRouteManifest = maybeCreateRouteManifest;
	exports.maybeGetVercelCronsConfig = maybeGetVercelCronsConfig;
	exports.maybeSetClientTraceMetadataOption = maybeSetClientTraceMetadataOption;
	exports.maybeSetInstrumentationHookOption = maybeSetInstrumentationHookOption;
	exports.maybeSetUpTunnelRouteRewriteRules = maybeSetUpTunnelRouteRewriteRules;
	exports.resolveReleaseName = resolveReleaseName;
	exports.shouldReturnEarlyInExperimentalBuildMode = shouldReturnEarlyInExperimentalBuildMode;
	exports.warnIfMissingOnRouterTransitionStartHook = warnIfMissingOnRouterTransitionStartHook;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/config/withSentryConfig/getFinalConfigObject.js
var require_getFinalConfigObject = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const util = require_util();
	const buildTime = require_buildTime();
	const deprecatedWebpackOptions = require_deprecatedWebpackOptions();
	const getFinalConfigObjectBundlerUtils = require_getFinalConfigObjectBundlerUtils();
	const getFinalConfigObjectUtils = require_getFinalConfigObjectUtils();
	function getFinalConfigObject(incomingUserNextConfigObject, userSentryOptions) {
		deprecatedWebpackOptions.migrateDeprecatedWebpackOptions(userSentryOptions);
		const releaseName = getFinalConfigObjectUtils.resolveReleaseName(userSentryOptions);
		getFinalConfigObjectUtils.maybeSetUpTunnelRouteRewriteRules(incomingUserNextConfigObject, userSentryOptions);
		if (getFinalConfigObjectUtils.shouldReturnEarlyInExperimentalBuildMode()) return incomingUserNextConfigObject;
		const routeManifest = getFinalConfigObjectUtils.maybeCreateRouteManifest(incomingUserNextConfigObject, userSentryOptions);
		const vercelCronsConfigResult = getFinalConfigObjectUtils.maybeGetVercelCronsConfig(userSentryOptions);
		buildTime.setUpBuildTimeVariables(incomingUserNextConfigObject, userSentryOptions, releaseName);
		const nextJsVersion = util.getNextjsVersion();
		const nextMajor = getFinalConfigObjectUtils.getNextMajor(nextJsVersion);
		getFinalConfigObjectUtils.maybeSetClientTraceMetadataOption(incomingUserNextConfigObject, nextJsVersion);
		getFinalConfigObjectUtils.maybeSetInstrumentationHookOption(incomingUserNextConfigObject, nextJsVersion);
		getFinalConfigObjectUtils.warnIfMissingOnRouterTransitionStartHook(userSentryOptions);
		const bundlerInfo = getFinalConfigObjectBundlerUtils.getBundlerInfo(nextJsVersion);
		getFinalConfigObjectBundlerUtils.maybeWarnAboutUnsupportedTurbopack(nextJsVersion, bundlerInfo);
		getFinalConfigObjectBundlerUtils.maybeWarnAboutUnsupportedRunAfterProductionCompileHook(nextJsVersion, userSentryOptions, bundlerInfo);
		const turboPackConfig = getFinalConfigObjectBundlerUtils.maybeConstructTurbopackConfig(incomingUserNextConfigObject, userSentryOptions, routeManifest, nextJsVersion, bundlerInfo, vercelCronsConfigResult);
		const shouldUseRunAfterProductionCompileHook = getFinalConfigObjectBundlerUtils.resolveUseRunAfterProductionCompileHookOption(userSentryOptions, bundlerInfo);
		getFinalConfigObjectBundlerUtils.maybeSetUpRunAfterProductionCompileHook({
			incomingUserNextConfigObject,
			userSentryOptions,
			releaseName,
			nextJsVersion,
			bundlerInfo,
			turboPackConfig,
			shouldUseRunAfterProductionCompileHook
		});
		getFinalConfigObjectBundlerUtils.maybeEnableTurbopackSourcemaps(incomingUserNextConfigObject, userSentryOptions, bundlerInfo);
		return {
			...incomingUserNextConfigObject,
			...getFinalConfigObjectBundlerUtils.getServerExternalPackagesPatch(incomingUserNextConfigObject, nextMajor),
			...getFinalConfigObjectBundlerUtils.getWebpackPatch({
				incomingUserNextConfigObject,
				userSentryOptions,
				releaseName,
				routeManifest,
				nextJsVersion,
				shouldUseRunAfterProductionCompileHook,
				bundlerInfo,
				vercelCronsConfigResult
			}),
			...getFinalConfigObjectBundlerUtils.getTurbopackPatch(bundlerInfo, turboPackConfig)
		};
	}
	exports.getFinalConfigObject = getFinalConfigObject;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/config/withSentryConfig/index.js
var require_withSentryConfig = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const core = require_cjs$4();
	const getFinalConfigObject = require_getFinalConfigObject();
	function withSentryConfig(nextConfig, sentryBuildOptions = {}) {
		const castNextConfig = nextConfig || {};
		if (typeof castNextConfig === "function") return function(...webpackConfigFunctionArgs) {
			const maybePromiseNextConfig = castNextConfig.apply(this, webpackConfigFunctionArgs);
			if (core.isThenable(maybePromiseNextConfig)) return maybePromiseNextConfig.then((promiseResultNextConfig) => {
				return getFinalConfigObject.getFinalConfigObject(promiseResultNextConfig, sentryBuildOptions);
			});
			return getFinalConfigObject.getFinalConfigObject(maybePromiseNextConfig, sentryBuildOptions);
		};
		else return getFinalConfigObject.getFinalConfigObject(castNextConfig, sentryBuildOptions);
	}
	exports.withSentryConfig = withSentryConfig;
}));
//#endregion
//#region node_modules/@sentry/nextjs/build/cjs/index.server.js
var require_index_server = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	const index = require_server();
	const node = require_cjs();
	const captureRequestError = require_captureRequestError();
	const _error = require__error();
	const nextSpan = require_nextSpan();
	const index$1 = require_withSentryConfig();
	const withServerActionInstrumentation = require_withServerActionInstrumentation();
	const wrapApiHandlerWithSentry = require_wrapApiHandlerWithSentry();
	const wrapApiHandlerWithSentryVercelCrons = require_wrapApiHandlerWithSentryVercelCrons();
	const wrapAppGetInitialPropsWithSentry = require_wrapAppGetInitialPropsWithSentry();
	const wrapDocumentGetInitialPropsWithSentry = require_wrapDocumentGetInitialPropsWithSentry();
	const wrapErrorGetInitialPropsWithSentry = require_wrapErrorGetInitialPropsWithSentry();
	const wrapGenerationFunctionWithSentry = require_wrapGenerationFunctionWithSentry();
	const wrapGetInitialPropsWithSentry = require_wrapGetInitialPropsWithSentry();
	const wrapGetServerSidePropsWithSentry = require_wrapGetServerSidePropsWithSentry();
	const wrapGetStaticPropsWithSentry = require_wrapGetStaticPropsWithSentry();
	const wrapMiddlewareWithSentry = require_wrapMiddlewareWithSentry();
	const wrapPageComponentWithSentry = require_wrapPageComponentWithSentry();
	const wrapRouteHandlerWithSentry = require_wrapRouteHandlerWithSentry();
	const wrapServerComponentWithSentry = require_wrapServerComponentWithSentry();
	exports.ErrorBoundary = index.ErrorBoundary;
	exports.createReduxEnhancer = index.createReduxEnhancer;
	exports.init = index.init;
	exports.showReportDialog = index.showReportDialog;
	exports.withErrorBoundary = index.withErrorBoundary;
	exports.pinoIntegration = node.pinoIntegration;
	exports.captureRequestError = captureRequestError.captureRequestError;
	exports.captureUnderscoreErrorException = _error.captureUnderscoreErrorException;
	exports.startInactiveSpan = nextSpan.startInactiveSpan;
	exports.startSpan = nextSpan.startSpan;
	exports.startSpanManual = nextSpan.startSpanManual;
	exports.withSentryConfig = index$1.withSentryConfig;
	exports.withServerActionInstrumentation = withServerActionInstrumentation.withServerActionInstrumentation;
	exports.wrapApiHandlerWithSentry = wrapApiHandlerWithSentry.wrapApiHandlerWithSentry;
	exports.wrapApiHandlerWithSentryVercelCrons = wrapApiHandlerWithSentryVercelCrons.wrapApiHandlerWithSentryVercelCrons;
	exports.wrapAppGetInitialPropsWithSentry = wrapAppGetInitialPropsWithSentry.wrapAppGetInitialPropsWithSentry;
	exports.wrapDocumentGetInitialPropsWithSentry = wrapDocumentGetInitialPropsWithSentry.wrapDocumentGetInitialPropsWithSentry;
	exports.wrapErrorGetInitialPropsWithSentry = wrapErrorGetInitialPropsWithSentry.wrapErrorGetInitialPropsWithSentry;
	exports.wrapGenerationFunctionWithSentry = wrapGenerationFunctionWithSentry.wrapGenerationFunctionWithSentry;
	exports.wrapGetInitialPropsWithSentry = wrapGetInitialPropsWithSentry.wrapGetInitialPropsWithSentry;
	exports.wrapGetServerSidePropsWithSentry = wrapGetServerSidePropsWithSentry.wrapGetServerSidePropsWithSentry;
	exports.wrapGetStaticPropsWithSentry = wrapGetStaticPropsWithSentry.wrapGetStaticPropsWithSentry;
	exports.wrapMiddlewareWithSentry = wrapMiddlewareWithSentry.wrapMiddlewareWithSentry;
	exports.wrapPageComponentWithSentry = wrapPageComponentWithSentry.wrapPageComponentWithSentry;
	exports.wrapRouteHandlerWithSentry = wrapRouteHandlerWithSentry.wrapRouteHandlerWithSentry;
	exports.wrapServerComponentWithSentry = wrapServerComponentWithSentry.wrapServerComponentWithSentry;
	Object.prototype.hasOwnProperty.call(node, "__proto__") && !Object.prototype.hasOwnProperty.call(exports, "__proto__") && Object.defineProperty(exports, "__proto__", {
		enumerable: true,
		value: node["__proto__"]
	});
	Object.keys(node).forEach((k) => {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) exports[k] = node[k];
	});
}));
//#endregion
export { require_index_server as t };
