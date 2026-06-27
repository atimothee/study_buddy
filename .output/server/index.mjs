globalThis.__nitro_main__ = import.meta.url;
import { fileURLToPath as __eveFileURLToPath } from "node:url";
import { dirname as __eveDirname } from "node:path";
__eveDirname(__eveFileURLToPath(import.meta.url));
import { a as toEventHandler, i as handleCors, n as HTTPError, o as NodeResponse, r as defineHandler, s as serve, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { t as HookableCore } from "./_libs/hookable.mjs";
import { i as withoutTrailingSlash, n as joinURL, r as withLeadingSlash, t as decodePath } from "./_libs/ufo.mjs";
import { a as health_default$2, i as handleAgentInfoRequest, n as installCompiledArtifactsPlugin, o as handleHomePageRequest, r as dispatchChannelRequest, t as POST } from "./_libs/eve.mjs";
import { promises } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
//#region #eve-route-handler/GET /
var GET__default = handleHomePageRequest;
//#endregion
//#region #eve-route-handler/GET /eve/v1/health
var health_default$1 = health_default$2;
//#endregion
//#region #eve-route-handler/HEAD /eve/v1/health
var health_default = health_default$2;
//#endregion
//#region #eve-route/eve/v1/info
var info_default = async (event) => handleAgentInfoRequest({
	"appRoot": "/Users/timothy/dev/study_buddy",
	"dev": false,
	"mode": "production"
}, event.req);
//#endregion
//#region #nitro/virtual/eve-channel/GET /eve/v1/connections/:name/callback/:token
const config$5 = {
	"appRoot": "/Users/timothy/dev/study_buddy",
	"dev": false
};
var _token_default$2 = (event) => dispatchChannelRequest(event, "GET /eve/v1/connections/:name/callback/:token", config$5);
//#endregion
//#region #nitro/virtual/eve-channel/POST /eve/v1/connections/:name/callback/:token
const config$4 = {
	"appRoot": "/Users/timothy/dev/study_buddy",
	"dev": false
};
var _token_default$1 = (event) => dispatchChannelRequest(event, "POST /eve/v1/connections/:name/callback/:token", config$4);
//#endregion
//#region #nitro/virtual/eve-channel/POST /eve/v1/callback/:token
const config$3 = {
	"appRoot": "/Users/timothy/dev/study_buddy",
	"dev": false
};
var _token_default = (event) => dispatchChannelRequest(event, "POST /eve/v1/callback/:token", config$3);
//#endregion
//#region #nitro/virtual/eve-channel/POST /eve/v1/session
const cors$5 = {};
const config$2 = {
	"appRoot": "/Users/timothy/dev/study_buddy",
	"dev": false
};
var session_default$1 = (event) => {
	const corsResponse = handleCors(event, cors$5);
	if (corsResponse !== false) return corsResponse;
	return dispatchChannelRequest(event, "POST /eve/v1/session", config$2);
};
//#endregion
//#region #nitro/virtual/eve-channel/OPTIONS /eve/v1/session
const cors$4 = {};
var session_default = (event) => {
	const corsResponse = handleCors(event, cors$4);
	if (corsResponse !== false) return corsResponse;
	return new Response(null, { status: 204 });
};
//#endregion
//#region #nitro/virtual/eve-channel/POST /eve/v1/session/:sessionId
const cors$3 = {};
const config$1 = {
	"appRoot": "/Users/timothy/dev/study_buddy",
	"dev": false
};
var _sessionId_default$1 = (event) => {
	const corsResponse = handleCors(event, cors$3);
	if (corsResponse !== false) return corsResponse;
	return dispatchChannelRequest(event, "POST /eve/v1/session/:sessionId", config$1);
};
//#endregion
//#region #nitro/virtual/eve-channel/OPTIONS /eve/v1/session/:sessionId
const cors$2 = {};
var _sessionId_default = (event) => {
	const corsResponse = handleCors(event, cors$2);
	if (corsResponse !== false) return corsResponse;
	return new Response(null, { status: 204 });
};
//#endregion
//#region #nitro/virtual/eve-channel/GET /eve/v1/session/:sessionId/stream
const cors$1 = {};
const config = {
	"appRoot": "/Users/timothy/dev/study_buddy",
	"dev": false
};
var stream_default$1 = (event) => {
	const corsResponse = handleCors(event, cors$1);
	if (corsResponse !== false) return corsResponse;
	return dispatchChannelRequest(event, "GET /eve/v1/session/:sessionId/stream", config);
};
//#endregion
//#region #nitro/virtual/eve-channel/OPTIONS /eve/v1/session/:sessionId/stream
const cors = {};
var stream_default = (event) => {
	const corsResponse = handleCors(event, cors);
	if (corsResponse !== false) return corsResponse;
	return new Response(null, { status: 204 });
};
//#endregion
//#region .eve/nitro/workflow/workflows-handler.mjs
var workflows_handler_default = async ({ req }) => {
	return await POST(req);
};
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/next.svg": {
		"type": "image/svg+xml",
		"etag": "\"55f-Pz6VYiYSuYnFvWoDKZowjG88fms\"",
		"mtime": "2026-06-27T18:29:16.682Z",
		"size": 1375,
		"path": "../public/next.svg"
	},
	"/vercel.svg": {
		"type": "image/svg+xml",
		"etag": "\"80-zruIUtWMiIa+PpBRomlX9Cu4Lxo\"",
		"mtime": "2026-06-27T18:29:16.682Z",
		"size": 128,
		"path": "../public/vercel.svg"
	},
	"/window.svg": {
		"type": "image/svg+xml",
		"etag": "\"181-VMSODapsqjF/4bTEGQB/2T6Ujbk\"",
		"mtime": "2026-06-27T18:29:16.682Z",
		"size": 385,
		"path": "../public/window.svg"
	},
	"/file.svg": {
		"type": "image/svg+xml",
		"etag": "\"187-+zgO7/6H1QtZc4NmTAKYKWTQ0ow\"",
		"mtime": "2026-06-27T18:29:16.682Z",
		"size": 391,
		"path": "../public/file.svg"
	},
	"/globe.svg": {
		"type": "image/svg+xml",
		"etag": "\"40b-LrojsBpGczu4Qj5tOOv19+lavsU\"",
		"mtime": "2026-06-27T18:29:16.682Z",
		"size": 1035,
		"path": "../public/globe.svg"
	}
};
//#endregion
//#region #nitro/virtual/public-assets-node
function readAsset(id) {
	const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__));
	return promises.readFile(resolve(serverDir, public_assets_data_default[id].path));
}
//#endregion
//#region #nitro/virtual/public-assets
const publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
function getAsset(id) {
	return public_assets_data_default[id];
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/static.mjs
const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = {
	gzip: ".gz",
	br: ".br",
	zstd: ".zst"
};
var static_default = defineHandler((event) => {
	if (event.req.method && !METHODS.has(event.req.method)) return;
	let id = decodePath(withLeadingSlash(withoutTrailingSlash(event.url.pathname)));
	let asset;
	const encodings = [...(event.req.headers.get("accept-encoding") || "").split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(), ""];
	for (const encoding of encodings) for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
		const _asset = getAsset(_id);
		if (_asset) {
			asset = _asset;
			id = _id;
			break;
		}
	}
	if (!asset) {
		if (isPublicAssetURL(id)) {
			event.res.headers.delete("Cache-Control");
			throw new HTTPError({ status: 404 });
		}
		return;
	}
	if (encodings.length > 1) event.res.headers.append("Vary", "Accept-Encoding");
	if (event.req.headers.get("if-none-match") === asset.etag) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	const ifModifiedSinceH = event.req.headers.get("if-modified-since");
	const mtimeDate = new Date(asset.mtime);
	if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	if (asset.type) event.res.headers.set("Content-Type", asset.type);
	if (asset.etag && !event.res.headers.has("ETag")) event.res.headers.set("ETag", asset.etag);
	if (asset.mtime && !event.res.headers.has("Last-Modified")) event.res.headers.set("Last-Modified", mtimeDate.toUTCString());
	if (asset.encoding && !event.res.headers.has("Content-Encoding")) event.res.headers.set("Content-Encoding", asset.encoding);
	if (asset.size > 0 && !event.res.headers.has("Content-Length")) event.res.headers.set("Content-Length", asset.size.toString());
	return readAsset(id);
});
//#endregion
//#region #nitro/virtual/routing
const findRoute = /* @__PURE__ */ (() => {
	const $0 = {
		route: "/",
		method: "GET",
		handler: toEventHandler(GET__default)
	}, $1 = {
		route: "/eve/v1/health",
		method: "GET",
		handler: toEventHandler(health_default$1)
	}, $2 = {
		route: "/eve/v1/health",
		method: "HEAD",
		handler: toEventHandler(health_default)
	}, $3 = {
		route: "/eve/v1/info",
		method: "GET",
		handler: toEventHandler(info_default)
	}, $4 = {
		route: "/eve/v1/session",
		method: "POST",
		handler: toEventHandler(session_default$1)
	}, $5 = {
		route: "/eve/v1/session",
		method: "OPTIONS",
		handler: toEventHandler(session_default)
	}, $6 = {
		route: "/.well-known/workflow/v1/flow",
		handler: toEventHandler(workflows_handler_default)
	}, $7 = {
		route: "/eve/v1/connections/:name/callback/:token",
		method: "GET",
		handler: toEventHandler(_token_default$2)
	}, $8 = {
		route: "/eve/v1/connections/:name/callback/:token",
		method: "POST",
		handler: toEventHandler(_token_default$1)
	}, $9 = {
		route: "/eve/v1/callback/:token",
		method: "POST",
		handler: toEventHandler(_token_default)
	}, $10 = {
		route: "/eve/v1/session/:sessionId",
		method: "POST",
		handler: toEventHandler(_sessionId_default$1)
	}, $11 = {
		route: "/eve/v1/session/:sessionId",
		method: "OPTIONS",
		handler: toEventHandler(_sessionId_default)
	}, $12 = {
		route: "/eve/v1/session/:sessionId/stream",
		method: "GET",
		handler: toEventHandler(stream_default$1)
	}, $13 = {
		route: "/eve/v1/session/:sessionId/stream",
		method: "OPTIONS",
		handler: toEventHandler(stream_default)
	};
	return (m, p) => {
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		if (p === "/") {
			if (m === "GET") return { data: $0 };
		} else if (p === "/eve/v1/health") {
			if (m === "GET") return { data: $1 };
			if (m === "HEAD") return { data: $2 };
		} else if (p === "/eve/v1/info") {
			if (m === "GET") return { data: $3 };
		} else if (p === "/eve/v1/session") {
			if (m === "POST") return { data: $4 };
			if (m === "OPTIONS") return { data: $5 };
		} else if (p === "/.well-known/workflow/v1/flow") return { data: $6 };
		let s = p.split("/"), l = s.length;
		if (l > 1) {
			if (s[1] === "eve") {
				if (l > 2) {
					if (s[2] === "v1") {
						if (l > 3) {
							if (s[3] === "connections") {
								if (l > 5) {
									if (s[5] === "callback") {
										if (l === 7 || l === 6) {
											if (m === "GET") {
												if (l > 6) return {
													data: $7,
													params: {
														"name": s[4],
														"token": s[6]
													}
												};
											}
											if (m === "POST") {
												if (l > 6) return {
													data: $8,
													params: {
														"name": s[4],
														"token": s[6]
													}
												};
											}
										}
									}
								}
							} else if (s[3] === "callback") {
								if (l === 5 || l === 4) {
									if (m === "POST") {
										if (l > 4) return {
											data: $9,
											params: { "token": s[4] }
										};
									}
								}
							} else if (s[3] === "session") {
								if (l === 5 || l === 4) {
									if (m === "POST") {
										if (l > 4) return {
											data: $10,
											params: { "sessionId": s[4] }
										};
									}
									if (m === "OPTIONS") {
										if (l > 4) return {
											data: $11,
											params: { "sessionId": s[4] }
										};
									}
								} else if (s[5] === "stream") {
									if (l === 6) {
										if (m === "GET") return {
											data: $12,
											params: { "sessionId": s[4] }
										};
										if (m === "OPTIONS") return {
											data: $13,
											params: { "sessionId": s[4] }
										};
									}
								}
							}
						}
					}
				}
			}
		}
	};
})();
const globalMiddleware = [toEventHandler(static_default)].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
const errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new NodeResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
const errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/plugins
const plugins = [installCompiledArtifactsPlugin];
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const hooks = new HookableCore();
	const captureError = (error, errorCtx) => {
		const promise = hooks.callHook("error", error, errorCtx)?.catch?.((hookError) => {
			console.error("Error while capturing another error", hookError);
		});
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
			if (promise && typeof errorCtx.event.req.waitUntil === "function") errorCtx.event.req.waitUntil(promise);
		}
	};
	const h3App = createH3App({ onError(error, event) {
		captureError(error, { event });
		return error_handler_default(error, event);
	} });
	h3App.config.onRequest = (event) => {
		return hooks.callHook("request", event)?.catch?.((error) => {
			captureError(error, {
				event,
				tags: ["request"]
			});
		});
	};
	h3App.config.onResponse = (res, event) => {
		return hooks.callHook("response", res, event)?.catch?.((error) => {
			captureError(error, {
				event,
				tags: ["response"]
			});
		});
	};
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks,
		captureError
	};
}
function initNitroPlugins(app) {
	for (const plugin of plugins) try {
		plugin(app);
	} catch (error) {
		app.captureError?.(error, { tags: ["plugin"] });
		throw error;
	}
	return app;
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~middleware"].push(...globalMiddleware);
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
const APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	initNitroPlugins(instance);
	return instance;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/hooks.mjs
function _captureError(error, type) {
	console.error(`[${type}]`, error);
	useNitroApp().captureError?.(error, { tags: [type] });
}
function trapUnhandledErrors() {
	process.on("unhandledRejection", (error) => _captureError(error, "unhandledRejection"));
	process.on("uncaughtException", (error) => _captureError(error, "uncaughtException"));
}
//#endregion
//#region #nitro/virtual/tracing
const tracingSrvxPlugins = [];
//#endregion
//#region node_modules/nitro/dist/presets/node/runtime/node-server.mjs
const _parsedPort = Number.parseInt(process.env.NITRO_PORT ?? process.env.PORT ?? "");
const port = Number.isNaN(_parsedPort) ? 3e3 : _parsedPort;
const host = process.env.NITRO_HOST || process.env.HOST;
const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const nitroApp = useNitroApp();
serve({
	port,
	hostname: host,
	tls: cert && key ? {
		cert,
		key
	} : void 0,
	fetch: nitroApp.fetch,
	plugins: [...tracingSrvxPlugins]
});
trapUnhandledErrors();
var node_server_default = {};
//#endregion
export { node_server_default as default };
