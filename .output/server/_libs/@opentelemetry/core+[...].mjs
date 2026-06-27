import { fileURLToPath as __eveFileURLToPath } from "node:url";
import { dirname as __eveDirname } from "node:path";
__eveDirname(__eveFileURLToPath(import.meta.url));
import { i as __require, t as __commonJSMin } from "../../_runtime.mjs";
import { t as require_src$2 } from "../opentelemetry__api.mjs";
//#region node_modules/@opentelemetry/core/build/src/trace/suppress-tracing.js
var require_suppress_tracing = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isTracingSuppressed = exports.unsuppressTracing = exports.suppressTracing = void 0;
	const SUPPRESS_TRACING_KEY = (0, require_src$2().createContextKey)("OpenTelemetry SDK Context Key SUPPRESS_TRACING");
	function suppressTracing(context) {
		return context.setValue(SUPPRESS_TRACING_KEY, true);
	}
	exports.suppressTracing = suppressTracing;
	function unsuppressTracing(context) {
		return context.deleteValue(SUPPRESS_TRACING_KEY);
	}
	exports.unsuppressTracing = unsuppressTracing;
	function isTracingSuppressed(context) {
		return context.getValue(SUPPRESS_TRACING_KEY) === true;
	}
	exports.isTracingSuppressed = isTracingSuppressed;
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/src/baggage/constants.js
var require_constants = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.BAGGAGE_MAX_TOTAL_LENGTH = exports.BAGGAGE_MAX_PER_NAME_VALUE_PAIRS = exports.BAGGAGE_MAX_NAME_VALUE_PAIRS = exports.BAGGAGE_HEADER = exports.BAGGAGE_ITEMS_SEPARATOR = exports.BAGGAGE_PROPERTIES_SEPARATOR = exports.BAGGAGE_KEY_PAIR_SEPARATOR = void 0;
	exports.BAGGAGE_KEY_PAIR_SEPARATOR = "=";
	exports.BAGGAGE_PROPERTIES_SEPARATOR = ";";
	exports.BAGGAGE_ITEMS_SEPARATOR = ",";
	exports.BAGGAGE_HEADER = "baggage";
	exports.BAGGAGE_MAX_NAME_VALUE_PAIRS = 180;
	exports.BAGGAGE_MAX_PER_NAME_VALUE_PAIRS = 4096;
	exports.BAGGAGE_MAX_TOTAL_LENGTH = 8192;
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/src/baggage/utils.js
var require_utils$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.parseKeyPairsIntoRecord = exports.parseBaggageHeaderString = exports.parsePairKeyValue = exports.getKeyPairs = exports.serializeKeyPairs = void 0;
	const api_1 = require_src$2();
	const constants_1 = require_constants();
	function serializeKeyPairs(keyPairs) {
		return keyPairs.reduce((hValue, current) => {
			const value = `${hValue}${hValue !== "" ? constants_1.BAGGAGE_ITEMS_SEPARATOR : ""}${current}`;
			return value.length > constants_1.BAGGAGE_MAX_TOTAL_LENGTH ? hValue : value;
		}, "");
	}
	exports.serializeKeyPairs = serializeKeyPairs;
	function getKeyPairs(baggage) {
		return baggage.getAllEntries().map(([key, value]) => {
			let entry = `${encodeURIComponent(key)}=${encodeURIComponent(value.value)}`;
			if (value.metadata !== void 0) entry += constants_1.BAGGAGE_PROPERTIES_SEPARATOR + value.metadata.toString();
			return entry;
		});
	}
	exports.getKeyPairs = getKeyPairs;
	function parsePairKeyValue(entry) {
		if (!entry) return;
		const metadataSeparatorIndex = entry.indexOf(constants_1.BAGGAGE_PROPERTIES_SEPARATOR);
		const keyPairPart = metadataSeparatorIndex === -1 ? entry : entry.substring(0, metadataSeparatorIndex);
		const separatorIndex = keyPairPart.indexOf(constants_1.BAGGAGE_KEY_PAIR_SEPARATOR);
		if (separatorIndex <= 0) return;
		const rawKey = keyPairPart.substring(0, separatorIndex).trim();
		const rawValue = keyPairPart.substring(separatorIndex + 1).trim();
		if (!rawKey || !rawValue) return;
		let key;
		let value;
		try {
			key = decodeURIComponent(rawKey);
			value = decodeURIComponent(rawValue);
		} catch {
			return;
		}
		let metadata;
		if (metadataSeparatorIndex !== -1 && metadataSeparatorIndex < entry.length - 1) {
			const metadataString = entry.substring(metadataSeparatorIndex + 1);
			metadata = (0, api_1.baggageEntryMetadataFromString)(metadataString);
		}
		return {
			key,
			value,
			metadata
		};
	}
	exports.parsePairKeyValue = parsePairKeyValue;
	/**
	* Parses a single baggage header string into the provided record, applying limits defined in this package.
	* Uses indexOf/substring in a while loop to avoid allocating a full array of split entries.
	* Returns the updated pair count so callers can track totals across multiple header values.
	*/
	function parseBaggageHeaderString(value, baggage, count, totalSize) {
		let start = 0;
		while (start < value.length && count < constants_1.BAGGAGE_MAX_NAME_VALUE_PAIRS) {
			const end = value.indexOf(constants_1.BAGGAGE_ITEMS_SEPARATOR, start);
			const entryEnd = end === -1 ? value.length : end;
			const entryLength = entryEnd - start;
			if (entryLength <= constants_1.BAGGAGE_MAX_PER_NAME_VALUE_PAIRS) {
				const keyPair = parsePairKeyValue(value.substring(start, entryEnd));
				if (keyPair) {
					const entrySize = (count === 0 ? 0 : 1) + entryLength;
					if (totalSize + entrySize > constants_1.BAGGAGE_MAX_TOTAL_LENGTH) break;
					baggage[keyPair.key] = keyPair.metadata ? {
						value: keyPair.value,
						metadata: keyPair.metadata
					} : { value: keyPair.value };
					count++;
					totalSize += entrySize;
				}
			}
			if (end === -1) break;
			start = end + 1;
		}
		return [count, totalSize];
	}
	exports.parseBaggageHeaderString = parseBaggageHeaderString;
	/**
	* Parse a string serialized in the baggage HTTP Format (without metadata):
	* https://github.com/w3c/baggage/blob/master/baggage/HTTP_HEADER_FORMAT.md
	*/
	function parseKeyPairsIntoRecord(value) {
		const result = {};
		if (typeof value === "string" && value.length > 0) value.split(constants_1.BAGGAGE_ITEMS_SEPARATOR).forEach((entry) => {
			const keyPair = parsePairKeyValue(entry);
			if (keyPair !== void 0 && keyPair.value.length > 0) result[keyPair.key] = keyPair.value;
		});
		return result;
	}
	exports.parseKeyPairsIntoRecord = parseKeyPairsIntoRecord;
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/src/baggage/propagation/W3CBaggagePropagator.js
var require_W3CBaggagePropagator = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.W3CBaggagePropagator = void 0;
	const api_1 = require_src$2();
	const suppress_tracing_1 = require_suppress_tracing();
	const constants_1 = require_constants();
	const utils_1 = require_utils$1();
	/**
	* Propagates {@link Baggage} through Context format propagation.
	*
	* Based on the Baggage specification:
	* https://w3c.github.io/baggage/
	*/
	var W3CBaggagePropagator = class {
		inject(context, carrier, setter) {
			const baggage = api_1.propagation.getBaggage(context);
			if (!baggage || (0, suppress_tracing_1.isTracingSuppressed)(context)) return;
			const keyPairs = (0, utils_1.getKeyPairs)(baggage).filter((pair) => {
				return pair.length <= constants_1.BAGGAGE_MAX_PER_NAME_VALUE_PAIRS;
			}).slice(0, constants_1.BAGGAGE_MAX_NAME_VALUE_PAIRS);
			const headerValue = (0, utils_1.serializeKeyPairs)(keyPairs);
			if (headerValue.length > 0) setter.set(carrier, constants_1.BAGGAGE_HEADER, headerValue);
		}
		extract(context, carrier, getter) {
			const headerValue = getter.get(carrier, constants_1.BAGGAGE_HEADER);
			if (!headerValue) return context;
			const baggage = {};
			let count = 0;
			let totalSize = 0;
			if (Array.isArray(headerValue)) for (let i = 0; i < headerValue.length; i++) [count, totalSize] = (0, utils_1.parseBaggageHeaderString)(headerValue[i], baggage, count, totalSize);
			else [count] = (0, utils_1.parseBaggageHeaderString)(headerValue, baggage, count, totalSize);
			if (count === 0) return context;
			return api_1.propagation.setBaggage(context, api_1.propagation.createBaggage(baggage));
		}
		fields() {
			return [constants_1.BAGGAGE_HEADER];
		}
	};
	exports.W3CBaggagePropagator = W3CBaggagePropagator;
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/src/common/anchored-clock.js
var require_anchored_clock = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.AnchoredClock = void 0;
	/**
	* A utility for returning wall times anchored to a given point in time. Wall time measurements will
	* not be taken from the system, but instead are computed by adding a monotonic clock time
	* to the anchor point.
	*
	* This is needed because the system time can change and result in unexpected situations like
	* spans ending before they are started. Creating an anchored clock for each local root span
	* ensures that span timings and durations are accurate while preventing span times from drifting
	* too far from the system clock.
	*
	* Only creating an anchored clock once per local trace ensures span times are correct relative
	* to each other. For example, a child span will never have a start time before its parent even
	* if the system clock is corrected during the local trace.
	*
	* Heavily inspired by the OTel Java anchored clock
	* https://github.com/open-telemetry/opentelemetry-java/blob/main/sdk/trace/src/main/java/io/opentelemetry/sdk/trace/AnchoredClock.java
	*/
	var AnchoredClock = class {
		_monotonicClock;
		_epochMillis;
		_performanceMillis;
		/**
		* Create a new AnchoredClock anchored to the current time returned by systemClock.
		*
		* @param systemClock should be a clock that returns the number of milliseconds since January 1 1970 such as Date
		* @param monotonicClock should be a clock that counts milliseconds monotonically such as window.performance or perf_hooks.performance
		*/
		constructor(systemClock, monotonicClock) {
			this._monotonicClock = monotonicClock;
			this._epochMillis = systemClock.now();
			this._performanceMillis = monotonicClock.now();
		}
		/**
		* Returns the current time by adding the number of milliseconds since the
		* AnchoredClock was created to the creation epoch time
		*/
		now() {
			const delta = this._monotonicClock.now() - this._performanceMillis;
			return this._epochMillis + delta;
		}
	};
	exports.AnchoredClock = AnchoredClock;
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/src/common/attributes.js
var require_attributes = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isAttributeValue = exports.isAttributeKey = exports.sanitizeAttributes = void 0;
	const api_1 = require_src$2();
	function sanitizeAttributes(attributes) {
		const out = {};
		if (typeof attributes !== "object" || attributes == null) return out;
		for (const key in attributes) {
			if (!Object.prototype.hasOwnProperty.call(attributes, key)) continue;
			if (!isAttributeKey(key)) {
				api_1.diag.warn(`Invalid attribute key: ${key}`);
				continue;
			}
			const val = attributes[key];
			if (!isAttributeValue(val)) {
				api_1.diag.warn(`Invalid attribute value set for key: ${key}`);
				continue;
			}
			if (Array.isArray(val)) out[key] = val.slice();
			else out[key] = val;
		}
		return out;
	}
	exports.sanitizeAttributes = sanitizeAttributes;
	function isAttributeKey(key) {
		return typeof key === "string" && key !== "";
	}
	exports.isAttributeKey = isAttributeKey;
	function isAttributeValue(val) {
		if (val == null) return true;
		if (Array.isArray(val)) return isHomogeneousAttributeValueArray(val);
		return isValidPrimitiveAttributeValueType(typeof val);
	}
	exports.isAttributeValue = isAttributeValue;
	function isHomogeneousAttributeValueArray(arr) {
		let type;
		for (const element of arr) {
			if (element == null) continue;
			const elementType = typeof element;
			if (elementType === type) continue;
			if (!type) {
				if (isValidPrimitiveAttributeValueType(elementType)) {
					type = elementType;
					continue;
				}
				return false;
			}
			return false;
		}
		return true;
	}
	function isValidPrimitiveAttributeValueType(valType) {
		switch (valType) {
			case "number":
			case "boolean":
			case "string": return true;
		}
		return false;
	}
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/src/common/logging-error-handler.js
var require_logging_error_handler = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.loggingErrorHandler = void 0;
	const api_1 = require_src$2();
	/**
	* Returns a function that logs an error using the provided logger, or a
	* console logger if one was not provided.
	*/
	function loggingErrorHandler() {
		return (ex) => {
			api_1.diag.error(stringifyException(ex));
		};
	}
	exports.loggingErrorHandler = loggingErrorHandler;
	/**
	* Converts an exception into a string representation
	* @param {Exception} ex
	*/
	function stringifyException(ex) {
		if (typeof ex === "string") return ex;
		else return JSON.stringify(flattenException(ex));
	}
	/**
	* Flattens an exception into key-value pairs by traversing the prototype chain
	* and coercing values to strings. Duplicate properties will not be overwritten;
	* the first insert wins.
	*/
	function flattenException(ex) {
		const result = {};
		let current = ex;
		while (current !== null) {
			Object.getOwnPropertyNames(current).forEach((propertyName) => {
				if (result[propertyName]) return;
				const value = current[propertyName];
				if (value) result[propertyName] = String(value);
			});
			current = Object.getPrototypeOf(current);
		}
		return result;
	}
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/src/common/global-error-handler.js
var require_global_error_handler = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.globalErrorHandler = exports.setGlobalErrorHandler = void 0;
	/** The global error handler delegate */
	let delegateHandler = (0, require_logging_error_handler().loggingErrorHandler)();
	/**
	* Set the global error handler
	* @param {ErrorHandler} handler
	*/
	function setGlobalErrorHandler(handler) {
		delegateHandler = handler;
	}
	exports.setGlobalErrorHandler = setGlobalErrorHandler;
	/**
	* Return the global error handler
	* @param {Exception} ex
	*/
	function globalErrorHandler(ex) {
		try {
			delegateHandler(ex);
		} catch {}
	}
	exports.globalErrorHandler = globalErrorHandler;
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/src/platform/node/environment.js
var require_environment = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getStringListFromEnv = exports.getBooleanFromEnv = exports.getStringFromEnv = exports.getNumberFromEnv = void 0;
	const api_1 = require_src$2();
	const util_1 = __require("util");
	/**
	* Retrieves a number from an environment variable.
	* - Returns `undefined` if the environment variable is empty, unset, contains only whitespace, or is not a number.
	* - Returns a number in all other cases.
	*
	* @param {string} key - The name of the environment variable to retrieve.
	* @returns {number | undefined} - The number value or `undefined`.
	*/
	function getNumberFromEnv(key) {
		const raw = process.env[key];
		if (raw == null || raw.trim() === "") return;
		const value = Number(raw);
		if (isNaN(value)) {
			api_1.diag.warn(`Unknown value ${(0, util_1.inspect)(raw)} for ${key}, expected a number, using defaults`);
			return;
		}
		return value;
	}
	exports.getNumberFromEnv = getNumberFromEnv;
	/**
	* Retrieves a string from an environment variable.
	* - Returns `undefined` if the environment variable is empty, unset, or contains only whitespace.
	*
	* @param {string} key - The name of the environment variable to retrieve.
	* @returns {string | undefined} - The string value or `undefined`.
	*/
	function getStringFromEnv(key) {
		const raw = process.env[key];
		if (raw == null || raw.trim() === "") return;
		return raw;
	}
	exports.getStringFromEnv = getStringFromEnv;
	/**
	* Retrieves a boolean value from an environment variable.
	* - Trims leading and trailing whitespace and ignores casing.
	* - Returns `false` if the environment variable is empty, unset, or contains only whitespace.
	* - Returns `false` for strings that cannot be mapped to a boolean.
	*
	* @param {string} key - The name of the environment variable to retrieve.
	* @returns {boolean} - The boolean value or `false` if the environment variable is unset empty, unset, or contains only whitespace.
	*/
	function getBooleanFromEnv(key) {
		const raw = process.env[key]?.trim().toLowerCase();
		if (raw == null || raw === "") return false;
		if (raw === "true") return true;
		else if (raw === "false") return false;
		else {
			api_1.diag.warn(`Unknown value ${(0, util_1.inspect)(raw)} for ${key}, expected 'true' or 'false', falling back to 'false' (default)`);
			return false;
		}
	}
	exports.getBooleanFromEnv = getBooleanFromEnv;
	/**
	* Retrieves a list of strings from an environment variable.
	* - Uses ',' as the delimiter.
	* - Trims leading and trailing whitespace from each entry.
	* - Excludes empty entries.
	* - Returns `undefined` if the environment variable is empty or contains only whitespace.
	* - Returns an empty array if all entries are empty or whitespace.
	*
	* @param {string} key - The name of the environment variable to retrieve.
	* @returns {string[] | undefined} - The list of strings or `undefined`.
	*/
	function getStringListFromEnv(key) {
		return getStringFromEnv(key)?.split(",").map((v) => v.trim()).filter((s) => s !== "");
	}
	exports.getStringListFromEnv = getStringListFromEnv;
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/src/common/globalThis.js
var require_globalThis = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports._globalThis = void 0;
	/**
	* @deprecated Use globalThis directly instead.
	*/
	exports._globalThis = globalThis;
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/src/version.js
var require_version = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.VERSION = void 0;
	exports.VERSION = "2.8.0";
}));
//#endregion
//#region node_modules/@opentelemetry/semantic-conventions/build/src/internal/utils.js
var require_utils = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.createConstMap = void 0;
	/**
	* Creates a const map from the given values
	* @param values - An array of values to be used as keys and values in the map.
	* @returns A populated version of the map with the values and keys derived from the values.
	*/
	/*#__NO_SIDE_EFFECTS__*/
	function createConstMap(values) {
		let res = {};
		const len = values.length;
		for (let lp = 0; lp < len; lp++) {
			const val = values[lp];
			if (val) res[String(val).toUpperCase().replace(/[-.]/g, "_")] = val;
		}
		return res;
	}
	exports.createConstMap = createConstMap;
}));
//#endregion
//#region node_modules/@opentelemetry/semantic-conventions/build/src/trace/SemanticAttributes.js
var require_SemanticAttributes = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SEMATTRS_NET_HOST_CARRIER_ICC = exports.SEMATTRS_NET_HOST_CARRIER_MNC = exports.SEMATTRS_NET_HOST_CARRIER_MCC = exports.SEMATTRS_NET_HOST_CARRIER_NAME = exports.SEMATTRS_NET_HOST_CONNECTION_SUBTYPE = exports.SEMATTRS_NET_HOST_CONNECTION_TYPE = exports.SEMATTRS_NET_HOST_NAME = exports.SEMATTRS_NET_HOST_PORT = exports.SEMATTRS_NET_HOST_IP = exports.SEMATTRS_NET_PEER_NAME = exports.SEMATTRS_NET_PEER_PORT = exports.SEMATTRS_NET_PEER_IP = exports.SEMATTRS_NET_TRANSPORT = exports.SEMATTRS_FAAS_INVOKED_REGION = exports.SEMATTRS_FAAS_INVOKED_PROVIDER = exports.SEMATTRS_FAAS_INVOKED_NAME = exports.SEMATTRS_FAAS_COLDSTART = exports.SEMATTRS_FAAS_CRON = exports.SEMATTRS_FAAS_TIME = exports.SEMATTRS_FAAS_DOCUMENT_NAME = exports.SEMATTRS_FAAS_DOCUMENT_TIME = exports.SEMATTRS_FAAS_DOCUMENT_OPERATION = exports.SEMATTRS_FAAS_DOCUMENT_COLLECTION = exports.SEMATTRS_FAAS_EXECUTION = exports.SEMATTRS_FAAS_TRIGGER = exports.SEMATTRS_EXCEPTION_ESCAPED = exports.SEMATTRS_EXCEPTION_STACKTRACE = exports.SEMATTRS_EXCEPTION_MESSAGE = exports.SEMATTRS_EXCEPTION_TYPE = exports.SEMATTRS_DB_SQL_TABLE = exports.SEMATTRS_DB_MONGODB_COLLECTION = exports.SEMATTRS_DB_REDIS_DATABASE_INDEX = exports.SEMATTRS_DB_HBASE_NAMESPACE = exports.SEMATTRS_DB_CASSANDRA_COORDINATOR_DC = exports.SEMATTRS_DB_CASSANDRA_COORDINATOR_ID = exports.SEMATTRS_DB_CASSANDRA_SPECULATIVE_EXECUTION_COUNT = exports.SEMATTRS_DB_CASSANDRA_IDEMPOTENCE = exports.SEMATTRS_DB_CASSANDRA_TABLE = exports.SEMATTRS_DB_CASSANDRA_CONSISTENCY_LEVEL = exports.SEMATTRS_DB_CASSANDRA_PAGE_SIZE = exports.SEMATTRS_DB_CASSANDRA_KEYSPACE = exports.SEMATTRS_DB_MSSQL_INSTANCE_NAME = exports.SEMATTRS_DB_OPERATION = exports.SEMATTRS_DB_STATEMENT = exports.SEMATTRS_DB_NAME = exports.SEMATTRS_DB_JDBC_DRIVER_CLASSNAME = exports.SEMATTRS_DB_USER = exports.SEMATTRS_DB_CONNECTION_STRING = exports.SEMATTRS_DB_SYSTEM = exports.SEMATTRS_AWS_LAMBDA_INVOKED_ARN = void 0;
	exports.SEMATTRS_MESSAGING_DESTINATION_KIND = exports.SEMATTRS_MESSAGING_DESTINATION = exports.SEMATTRS_MESSAGING_SYSTEM = exports.SEMATTRS_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEX_UPDATES = exports.SEMATTRS_AWS_DYNAMODB_ATTRIBUTE_DEFINITIONS = exports.SEMATTRS_AWS_DYNAMODB_SCANNED_COUNT = exports.SEMATTRS_AWS_DYNAMODB_COUNT = exports.SEMATTRS_AWS_DYNAMODB_TOTAL_SEGMENTS = exports.SEMATTRS_AWS_DYNAMODB_SEGMENT = exports.SEMATTRS_AWS_DYNAMODB_SCAN_FORWARD = exports.SEMATTRS_AWS_DYNAMODB_TABLE_COUNT = exports.SEMATTRS_AWS_DYNAMODB_EXCLUSIVE_START_TABLE = exports.SEMATTRS_AWS_DYNAMODB_LOCAL_SECONDARY_INDEXES = exports.SEMATTRS_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEXES = exports.SEMATTRS_AWS_DYNAMODB_SELECT = exports.SEMATTRS_AWS_DYNAMODB_INDEX_NAME = exports.SEMATTRS_AWS_DYNAMODB_ATTRIBUTES_TO_GET = exports.SEMATTRS_AWS_DYNAMODB_LIMIT = exports.SEMATTRS_AWS_DYNAMODB_PROJECTION = exports.SEMATTRS_AWS_DYNAMODB_CONSISTENT_READ = exports.SEMATTRS_AWS_DYNAMODB_PROVISIONED_WRITE_CAPACITY = exports.SEMATTRS_AWS_DYNAMODB_PROVISIONED_READ_CAPACITY = exports.SEMATTRS_AWS_DYNAMODB_ITEM_COLLECTION_METRICS = exports.SEMATTRS_AWS_DYNAMODB_CONSUMED_CAPACITY = exports.SEMATTRS_AWS_DYNAMODB_TABLE_NAMES = exports.SEMATTRS_HTTP_CLIENT_IP = exports.SEMATTRS_HTTP_ROUTE = exports.SEMATTRS_HTTP_SERVER_NAME = exports.SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED = exports.SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH = exports.SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED = exports.SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH = exports.SEMATTRS_HTTP_USER_AGENT = exports.SEMATTRS_HTTP_FLAVOR = exports.SEMATTRS_HTTP_STATUS_CODE = exports.SEMATTRS_HTTP_SCHEME = exports.SEMATTRS_HTTP_HOST = exports.SEMATTRS_HTTP_TARGET = exports.SEMATTRS_HTTP_URL = exports.SEMATTRS_HTTP_METHOD = exports.SEMATTRS_CODE_LINENO = exports.SEMATTRS_CODE_FILEPATH = exports.SEMATTRS_CODE_NAMESPACE = exports.SEMATTRS_CODE_FUNCTION = exports.SEMATTRS_THREAD_NAME = exports.SEMATTRS_THREAD_ID = exports.SEMATTRS_ENDUSER_SCOPE = exports.SEMATTRS_ENDUSER_ROLE = exports.SEMATTRS_ENDUSER_ID = exports.SEMATTRS_PEER_SERVICE = void 0;
	exports.DBSYSTEMVALUES_FILEMAKER = exports.DBSYSTEMVALUES_DERBY = exports.DBSYSTEMVALUES_FIREBIRD = exports.DBSYSTEMVALUES_ADABAS = exports.DBSYSTEMVALUES_CACHE = exports.DBSYSTEMVALUES_EDB = exports.DBSYSTEMVALUES_FIRSTSQL = exports.DBSYSTEMVALUES_INGRES = exports.DBSYSTEMVALUES_HANADB = exports.DBSYSTEMVALUES_MAXDB = exports.DBSYSTEMVALUES_PROGRESS = exports.DBSYSTEMVALUES_HSQLDB = exports.DBSYSTEMVALUES_CLOUDSCAPE = exports.DBSYSTEMVALUES_HIVE = exports.DBSYSTEMVALUES_REDSHIFT = exports.DBSYSTEMVALUES_POSTGRESQL = exports.DBSYSTEMVALUES_DB2 = exports.DBSYSTEMVALUES_ORACLE = exports.DBSYSTEMVALUES_MYSQL = exports.DBSYSTEMVALUES_MSSQL = exports.DBSYSTEMVALUES_OTHER_SQL = exports.SemanticAttributes = exports.SEMATTRS_MESSAGE_UNCOMPRESSED_SIZE = exports.SEMATTRS_MESSAGE_COMPRESSED_SIZE = exports.SEMATTRS_MESSAGE_ID = exports.SEMATTRS_MESSAGE_TYPE = exports.SEMATTRS_RPC_JSONRPC_ERROR_MESSAGE = exports.SEMATTRS_RPC_JSONRPC_ERROR_CODE = exports.SEMATTRS_RPC_JSONRPC_REQUEST_ID = exports.SEMATTRS_RPC_JSONRPC_VERSION = exports.SEMATTRS_RPC_GRPC_STATUS_CODE = exports.SEMATTRS_RPC_METHOD = exports.SEMATTRS_RPC_SERVICE = exports.SEMATTRS_RPC_SYSTEM = exports.SEMATTRS_MESSAGING_KAFKA_TOMBSTONE = exports.SEMATTRS_MESSAGING_KAFKA_PARTITION = exports.SEMATTRS_MESSAGING_KAFKA_CLIENT_ID = exports.SEMATTRS_MESSAGING_KAFKA_CONSUMER_GROUP = exports.SEMATTRS_MESSAGING_KAFKA_MESSAGE_KEY = exports.SEMATTRS_MESSAGING_RABBITMQ_ROUTING_KEY = exports.SEMATTRS_MESSAGING_CONSUMER_ID = exports.SEMATTRS_MESSAGING_OPERATION = exports.SEMATTRS_MESSAGING_MESSAGE_PAYLOAD_COMPRESSED_SIZE_BYTES = exports.SEMATTRS_MESSAGING_MESSAGE_PAYLOAD_SIZE_BYTES = exports.SEMATTRS_MESSAGING_CONVERSATION_ID = exports.SEMATTRS_MESSAGING_MESSAGE_ID = exports.SEMATTRS_MESSAGING_URL = exports.SEMATTRS_MESSAGING_PROTOCOL_VERSION = exports.SEMATTRS_MESSAGING_PROTOCOL = exports.SEMATTRS_MESSAGING_TEMP_DESTINATION = void 0;
	exports.FAASINVOKEDPROVIDERVALUES_ALIBABA_CLOUD = exports.FaasDocumentOperationValues = exports.FAASDOCUMENTOPERATIONVALUES_DELETE = exports.FAASDOCUMENTOPERATIONVALUES_EDIT = exports.FAASDOCUMENTOPERATIONVALUES_INSERT = exports.FaasTriggerValues = exports.FAASTRIGGERVALUES_OTHER = exports.FAASTRIGGERVALUES_TIMER = exports.FAASTRIGGERVALUES_PUBSUB = exports.FAASTRIGGERVALUES_HTTP = exports.FAASTRIGGERVALUES_DATASOURCE = exports.DbCassandraConsistencyLevelValues = exports.DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_SERIAL = exports.DBCASSANDRACONSISTENCYLEVELVALUES_SERIAL = exports.DBCASSANDRACONSISTENCYLEVELVALUES_ANY = exports.DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_ONE = exports.DBCASSANDRACONSISTENCYLEVELVALUES_THREE = exports.DBCASSANDRACONSISTENCYLEVELVALUES_TWO = exports.DBCASSANDRACONSISTENCYLEVELVALUES_ONE = exports.DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_QUORUM = exports.DBCASSANDRACONSISTENCYLEVELVALUES_QUORUM = exports.DBCASSANDRACONSISTENCYLEVELVALUES_EACH_QUORUM = exports.DBCASSANDRACONSISTENCYLEVELVALUES_ALL = exports.DbSystemValues = exports.DBSYSTEMVALUES_COCKROACHDB = exports.DBSYSTEMVALUES_MEMCACHED = exports.DBSYSTEMVALUES_ELASTICSEARCH = exports.DBSYSTEMVALUES_GEODE = exports.DBSYSTEMVALUES_NEO4J = exports.DBSYSTEMVALUES_DYNAMODB = exports.DBSYSTEMVALUES_COSMOSDB = exports.DBSYSTEMVALUES_COUCHDB = exports.DBSYSTEMVALUES_COUCHBASE = exports.DBSYSTEMVALUES_REDIS = exports.DBSYSTEMVALUES_MONGODB = exports.DBSYSTEMVALUES_HBASE = exports.DBSYSTEMVALUES_CASSANDRA = exports.DBSYSTEMVALUES_COLDFUSION = exports.DBSYSTEMVALUES_H2 = exports.DBSYSTEMVALUES_VERTICA = exports.DBSYSTEMVALUES_TERADATA = exports.DBSYSTEMVALUES_SYBASE = exports.DBSYSTEMVALUES_SQLITE = exports.DBSYSTEMVALUES_POINTBASE = exports.DBSYSTEMVALUES_PERVASIVE = exports.DBSYSTEMVALUES_NETEZZA = exports.DBSYSTEMVALUES_MARIADB = exports.DBSYSTEMVALUES_INTERBASE = exports.DBSYSTEMVALUES_INSTANTDB = exports.DBSYSTEMVALUES_INFORMIX = void 0;
	exports.MESSAGINGOPERATIONVALUES_RECEIVE = exports.MessagingDestinationKindValues = exports.MESSAGINGDESTINATIONKINDVALUES_TOPIC = exports.MESSAGINGDESTINATIONKINDVALUES_QUEUE = exports.HttpFlavorValues = exports.HTTPFLAVORVALUES_QUIC = exports.HTTPFLAVORVALUES_SPDY = exports.HTTPFLAVORVALUES_HTTP_2_0 = exports.HTTPFLAVORVALUES_HTTP_1_1 = exports.HTTPFLAVORVALUES_HTTP_1_0 = exports.NetHostConnectionSubtypeValues = exports.NETHOSTCONNECTIONSUBTYPEVALUES_LTE_CA = exports.NETHOSTCONNECTIONSUBTYPEVALUES_NRNSA = exports.NETHOSTCONNECTIONSUBTYPEVALUES_NR = exports.NETHOSTCONNECTIONSUBTYPEVALUES_IWLAN = exports.NETHOSTCONNECTIONSUBTYPEVALUES_TD_SCDMA = exports.NETHOSTCONNECTIONSUBTYPEVALUES_GSM = exports.NETHOSTCONNECTIONSUBTYPEVALUES_HSPAP = exports.NETHOSTCONNECTIONSUBTYPEVALUES_EHRPD = exports.NETHOSTCONNECTIONSUBTYPEVALUES_LTE = exports.NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_B = exports.NETHOSTCONNECTIONSUBTYPEVALUES_IDEN = exports.NETHOSTCONNECTIONSUBTYPEVALUES_HSPA = exports.NETHOSTCONNECTIONSUBTYPEVALUES_HSUPA = exports.NETHOSTCONNECTIONSUBTYPEVALUES_HSDPA = exports.NETHOSTCONNECTIONSUBTYPEVALUES_CDMA2000_1XRTT = exports.NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_A = exports.NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_0 = exports.NETHOSTCONNECTIONSUBTYPEVALUES_CDMA = exports.NETHOSTCONNECTIONSUBTYPEVALUES_UMTS = exports.NETHOSTCONNECTIONSUBTYPEVALUES_EDGE = exports.NETHOSTCONNECTIONSUBTYPEVALUES_GPRS = exports.NetHostConnectionTypeValues = exports.NETHOSTCONNECTIONTYPEVALUES_UNKNOWN = exports.NETHOSTCONNECTIONTYPEVALUES_UNAVAILABLE = exports.NETHOSTCONNECTIONTYPEVALUES_CELL = exports.NETHOSTCONNECTIONTYPEVALUES_WIRED = exports.NETHOSTCONNECTIONTYPEVALUES_WIFI = exports.NetTransportValues = exports.NETTRANSPORTVALUES_OTHER = exports.NETTRANSPORTVALUES_INPROC = exports.NETTRANSPORTVALUES_PIPE = exports.NETTRANSPORTVALUES_UNIX = exports.NETTRANSPORTVALUES_IP = exports.NETTRANSPORTVALUES_IP_UDP = exports.NETTRANSPORTVALUES_IP_TCP = exports.FaasInvokedProviderValues = exports.FAASINVOKEDPROVIDERVALUES_GCP = exports.FAASINVOKEDPROVIDERVALUES_AZURE = exports.FAASINVOKEDPROVIDERVALUES_AWS = void 0;
	exports.MessageTypeValues = exports.MESSAGETYPEVALUES_RECEIVED = exports.MESSAGETYPEVALUES_SENT = exports.RpcGrpcStatusCodeValues = exports.RPCGRPCSTATUSCODEVALUES_UNAUTHENTICATED = exports.RPCGRPCSTATUSCODEVALUES_DATA_LOSS = exports.RPCGRPCSTATUSCODEVALUES_UNAVAILABLE = exports.RPCGRPCSTATUSCODEVALUES_INTERNAL = exports.RPCGRPCSTATUSCODEVALUES_UNIMPLEMENTED = exports.RPCGRPCSTATUSCODEVALUES_OUT_OF_RANGE = exports.RPCGRPCSTATUSCODEVALUES_ABORTED = exports.RPCGRPCSTATUSCODEVALUES_FAILED_PRECONDITION = exports.RPCGRPCSTATUSCODEVALUES_RESOURCE_EXHAUSTED = exports.RPCGRPCSTATUSCODEVALUES_PERMISSION_DENIED = exports.RPCGRPCSTATUSCODEVALUES_ALREADY_EXISTS = exports.RPCGRPCSTATUSCODEVALUES_NOT_FOUND = exports.RPCGRPCSTATUSCODEVALUES_DEADLINE_EXCEEDED = exports.RPCGRPCSTATUSCODEVALUES_INVALID_ARGUMENT = exports.RPCGRPCSTATUSCODEVALUES_UNKNOWN = exports.RPCGRPCSTATUSCODEVALUES_CANCELLED = exports.RPCGRPCSTATUSCODEVALUES_OK = exports.MessagingOperationValues = exports.MESSAGINGOPERATIONVALUES_PROCESS = void 0;
	const utils_1 = require_utils();
	const TMP_AWS_LAMBDA_INVOKED_ARN = "aws.lambda.invoked_arn";
	const TMP_DB_SYSTEM = "db.system";
	const TMP_DB_CONNECTION_STRING = "db.connection_string";
	const TMP_DB_USER = "db.user";
	const TMP_DB_JDBC_DRIVER_CLASSNAME = "db.jdbc.driver_classname";
	const TMP_DB_NAME = "db.name";
	const TMP_DB_STATEMENT = "db.statement";
	const TMP_DB_OPERATION = "db.operation";
	const TMP_DB_MSSQL_INSTANCE_NAME = "db.mssql.instance_name";
	const TMP_DB_CASSANDRA_KEYSPACE = "db.cassandra.keyspace";
	const TMP_DB_CASSANDRA_PAGE_SIZE = "db.cassandra.page_size";
	const TMP_DB_CASSANDRA_CONSISTENCY_LEVEL = "db.cassandra.consistency_level";
	const TMP_DB_CASSANDRA_TABLE = "db.cassandra.table";
	const TMP_DB_CASSANDRA_IDEMPOTENCE = "db.cassandra.idempotence";
	const TMP_DB_CASSANDRA_SPECULATIVE_EXECUTION_COUNT = "db.cassandra.speculative_execution_count";
	const TMP_DB_CASSANDRA_COORDINATOR_ID = "db.cassandra.coordinator.id";
	const TMP_DB_CASSANDRA_COORDINATOR_DC = "db.cassandra.coordinator.dc";
	const TMP_DB_HBASE_NAMESPACE = "db.hbase.namespace";
	const TMP_DB_REDIS_DATABASE_INDEX = "db.redis.database_index";
	const TMP_DB_MONGODB_COLLECTION = "db.mongodb.collection";
	const TMP_DB_SQL_TABLE = "db.sql.table";
	const TMP_EXCEPTION_TYPE = "exception.type";
	const TMP_EXCEPTION_MESSAGE = "exception.message";
	const TMP_EXCEPTION_STACKTRACE = "exception.stacktrace";
	const TMP_EXCEPTION_ESCAPED = "exception.escaped";
	const TMP_FAAS_TRIGGER = "faas.trigger";
	const TMP_FAAS_EXECUTION = "faas.execution";
	const TMP_FAAS_DOCUMENT_COLLECTION = "faas.document.collection";
	const TMP_FAAS_DOCUMENT_OPERATION = "faas.document.operation";
	const TMP_FAAS_DOCUMENT_TIME = "faas.document.time";
	const TMP_FAAS_DOCUMENT_NAME = "faas.document.name";
	const TMP_FAAS_TIME = "faas.time";
	const TMP_FAAS_CRON = "faas.cron";
	const TMP_FAAS_COLDSTART = "faas.coldstart";
	const TMP_FAAS_INVOKED_NAME = "faas.invoked_name";
	const TMP_FAAS_INVOKED_PROVIDER = "faas.invoked_provider";
	const TMP_FAAS_INVOKED_REGION = "faas.invoked_region";
	const TMP_NET_TRANSPORT = "net.transport";
	const TMP_NET_PEER_IP = "net.peer.ip";
	const TMP_NET_PEER_PORT = "net.peer.port";
	const TMP_NET_PEER_NAME = "net.peer.name";
	const TMP_NET_HOST_IP = "net.host.ip";
	const TMP_NET_HOST_PORT = "net.host.port";
	const TMP_NET_HOST_NAME = "net.host.name";
	const TMP_NET_HOST_CONNECTION_TYPE = "net.host.connection.type";
	const TMP_NET_HOST_CONNECTION_SUBTYPE = "net.host.connection.subtype";
	const TMP_NET_HOST_CARRIER_NAME = "net.host.carrier.name";
	const TMP_NET_HOST_CARRIER_MCC = "net.host.carrier.mcc";
	const TMP_NET_HOST_CARRIER_MNC = "net.host.carrier.mnc";
	const TMP_NET_HOST_CARRIER_ICC = "net.host.carrier.icc";
	const TMP_PEER_SERVICE = "peer.service";
	const TMP_ENDUSER_ID = "enduser.id";
	const TMP_ENDUSER_ROLE = "enduser.role";
	const TMP_ENDUSER_SCOPE = "enduser.scope";
	const TMP_THREAD_ID = "thread.id";
	const TMP_THREAD_NAME = "thread.name";
	const TMP_CODE_FUNCTION = "code.function";
	const TMP_CODE_NAMESPACE = "code.namespace";
	const TMP_CODE_FILEPATH = "code.filepath";
	const TMP_CODE_LINENO = "code.lineno";
	const TMP_HTTP_METHOD = "http.method";
	const TMP_HTTP_URL = "http.url";
	const TMP_HTTP_TARGET = "http.target";
	const TMP_HTTP_HOST = "http.host";
	const TMP_HTTP_SCHEME = "http.scheme";
	const TMP_HTTP_STATUS_CODE = "http.status_code";
	const TMP_HTTP_FLAVOR = "http.flavor";
	const TMP_HTTP_USER_AGENT = "http.user_agent";
	const TMP_HTTP_REQUEST_CONTENT_LENGTH = "http.request_content_length";
	const TMP_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED = "http.request_content_length_uncompressed";
	const TMP_HTTP_RESPONSE_CONTENT_LENGTH = "http.response_content_length";
	const TMP_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED = "http.response_content_length_uncompressed";
	const TMP_HTTP_SERVER_NAME = "http.server_name";
	const TMP_HTTP_ROUTE = "http.route";
	const TMP_HTTP_CLIENT_IP = "http.client_ip";
	const TMP_AWS_DYNAMODB_TABLE_NAMES = "aws.dynamodb.table_names";
	const TMP_AWS_DYNAMODB_CONSUMED_CAPACITY = "aws.dynamodb.consumed_capacity";
	const TMP_AWS_DYNAMODB_ITEM_COLLECTION_METRICS = "aws.dynamodb.item_collection_metrics";
	const TMP_AWS_DYNAMODB_PROVISIONED_READ_CAPACITY = "aws.dynamodb.provisioned_read_capacity";
	const TMP_AWS_DYNAMODB_PROVISIONED_WRITE_CAPACITY = "aws.dynamodb.provisioned_write_capacity";
	const TMP_AWS_DYNAMODB_CONSISTENT_READ = "aws.dynamodb.consistent_read";
	const TMP_AWS_DYNAMODB_PROJECTION = "aws.dynamodb.projection";
	const TMP_AWS_DYNAMODB_LIMIT = "aws.dynamodb.limit";
	const TMP_AWS_DYNAMODB_ATTRIBUTES_TO_GET = "aws.dynamodb.attributes_to_get";
	const TMP_AWS_DYNAMODB_INDEX_NAME = "aws.dynamodb.index_name";
	const TMP_AWS_DYNAMODB_SELECT = "aws.dynamodb.select";
	const TMP_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEXES = "aws.dynamodb.global_secondary_indexes";
	const TMP_AWS_DYNAMODB_LOCAL_SECONDARY_INDEXES = "aws.dynamodb.local_secondary_indexes";
	const TMP_AWS_DYNAMODB_EXCLUSIVE_START_TABLE = "aws.dynamodb.exclusive_start_table";
	const TMP_AWS_DYNAMODB_TABLE_COUNT = "aws.dynamodb.table_count";
	const TMP_AWS_DYNAMODB_SCAN_FORWARD = "aws.dynamodb.scan_forward";
	const TMP_AWS_DYNAMODB_SEGMENT = "aws.dynamodb.segment";
	const TMP_AWS_DYNAMODB_TOTAL_SEGMENTS = "aws.dynamodb.total_segments";
	const TMP_AWS_DYNAMODB_COUNT = "aws.dynamodb.count";
	const TMP_AWS_DYNAMODB_SCANNED_COUNT = "aws.dynamodb.scanned_count";
	const TMP_AWS_DYNAMODB_ATTRIBUTE_DEFINITIONS = "aws.dynamodb.attribute_definitions";
	const TMP_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEX_UPDATES = "aws.dynamodb.global_secondary_index_updates";
	const TMP_MESSAGING_SYSTEM = "messaging.system";
	const TMP_MESSAGING_DESTINATION = "messaging.destination";
	const TMP_MESSAGING_DESTINATION_KIND = "messaging.destination_kind";
	const TMP_MESSAGING_TEMP_DESTINATION = "messaging.temp_destination";
	const TMP_MESSAGING_PROTOCOL = "messaging.protocol";
	const TMP_MESSAGING_PROTOCOL_VERSION = "messaging.protocol_version";
	const TMP_MESSAGING_URL = "messaging.url";
	const TMP_MESSAGING_MESSAGE_ID = "messaging.message_id";
	const TMP_MESSAGING_CONVERSATION_ID = "messaging.conversation_id";
	const TMP_MESSAGING_MESSAGE_PAYLOAD_SIZE_BYTES = "messaging.message_payload_size_bytes";
	const TMP_MESSAGING_MESSAGE_PAYLOAD_COMPRESSED_SIZE_BYTES = "messaging.message_payload_compressed_size_bytes";
	const TMP_MESSAGING_OPERATION = "messaging.operation";
	const TMP_MESSAGING_CONSUMER_ID = "messaging.consumer_id";
	const TMP_MESSAGING_RABBITMQ_ROUTING_KEY = "messaging.rabbitmq.routing_key";
	const TMP_MESSAGING_KAFKA_MESSAGE_KEY = "messaging.kafka.message_key";
	const TMP_MESSAGING_KAFKA_CONSUMER_GROUP = "messaging.kafka.consumer_group";
	const TMP_MESSAGING_KAFKA_CLIENT_ID = "messaging.kafka.client_id";
	const TMP_MESSAGING_KAFKA_PARTITION = "messaging.kafka.partition";
	const TMP_MESSAGING_KAFKA_TOMBSTONE = "messaging.kafka.tombstone";
	const TMP_RPC_SYSTEM = "rpc.system";
	const TMP_RPC_SERVICE = "rpc.service";
	const TMP_RPC_METHOD = "rpc.method";
	const TMP_RPC_GRPC_STATUS_CODE = "rpc.grpc.status_code";
	const TMP_RPC_JSONRPC_VERSION = "rpc.jsonrpc.version";
	const TMP_RPC_JSONRPC_REQUEST_ID = "rpc.jsonrpc.request_id";
	const TMP_RPC_JSONRPC_ERROR_CODE = "rpc.jsonrpc.error_code";
	const TMP_RPC_JSONRPC_ERROR_MESSAGE = "rpc.jsonrpc.error_message";
	const TMP_MESSAGE_TYPE = "message.type";
	const TMP_MESSAGE_ID = "message.id";
	const TMP_MESSAGE_COMPRESSED_SIZE = "message.compressed_size";
	const TMP_MESSAGE_UNCOMPRESSED_SIZE = "message.uncompressed_size";
	/**
	* The full invoked ARN as provided on the `Context` passed to the function (`Lambda-Runtime-Invoked-Function-Arn` header on the `/runtime/invocation/next` applicable).
	*
	* Note: This may be different from `faas.id` if an alias is involved.
	*
	* @deprecated Use ATTR_AWS_LAMBDA_INVOKED_ARN in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_LAMBDA_INVOKED_ARN = TMP_AWS_LAMBDA_INVOKED_ARN;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use ATTR_DB_SYSTEM in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_SYSTEM = TMP_DB_SYSTEM;
	/**
	* The connection string used to connect to the database. It is recommended to remove embedded credentials.
	*
	* @deprecated Use ATTR_DB_CONNECTION_STRING in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_CONNECTION_STRING = TMP_DB_CONNECTION_STRING;
	/**
	* Username for accessing the database.
	*
	* @deprecated Use ATTR_DB_USER in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_USER = TMP_DB_USER;
	/**
	* The fully-qualified class name of the [Java Database Connectivity (JDBC)](https://docs.oracle.com/javase/8/docs/technotes/guides/jdbc/) driver used to connect.
	*
	* @deprecated Use ATTR_DB_JDBC_DRIVER_CLASSNAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_JDBC_DRIVER_CLASSNAME = TMP_DB_JDBC_DRIVER_CLASSNAME;
	/**
	* If no [tech-specific attribute](#call-level-attributes-for-specific-technologies) is defined, this attribute is used to report the name of the database being accessed. For commands that switch the database, this should be set to the target database (even if the command fails).
	*
	* Note: In some SQL databases, the database name to be used is called &#34;schema name&#34;.
	*
	* @deprecated Use ATTR_DB_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_NAME = TMP_DB_NAME;
	/**
	* The database statement being executed.
	*
	* Note: The value may be sanitized to exclude sensitive information.
	*
	* @deprecated Use ATTR_DB_STATEMENT in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_STATEMENT = TMP_DB_STATEMENT;
	/**
	* The name of the operation being executed, e.g. the [MongoDB command name](https://docs.mongodb.com/manual/reference/command/#database-operations) such as `findAndModify`, or the SQL keyword.
	*
	* Note: When setting this to an SQL keyword, it is not recommended to attempt any client-side parsing of `db.statement` just to get this property, but it should be set if the operation name is provided by the library being instrumented. If the SQL statement has an ambiguous operation, or performs more than one operation, this value may be omitted.
	*
	* @deprecated Use ATTR_DB_OPERATION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_OPERATION = TMP_DB_OPERATION;
	/**
	* The Microsoft SQL Server [instance name](https://docs.microsoft.com/en-us/sql/connect/jdbc/building-the-connection-url?view=sql-server-ver15) connecting to. This name is used to determine the port of a named instance.
	*
	* Note: If setting a `db.mssql.instance_name`, `net.peer.port` is no longer required (but still recommended if non-standard).
	*
	* @deprecated Use ATTR_DB_MSSQL_INSTANCE_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_MSSQL_INSTANCE_NAME = TMP_DB_MSSQL_INSTANCE_NAME;
	/**
	* The name of the keyspace being accessed. To be used instead of the generic `db.name` attribute.
	*
	* @deprecated Use ATTR_DB_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_CASSANDRA_KEYSPACE = TMP_DB_CASSANDRA_KEYSPACE;
	/**
	* The fetch size used for paging, i.e. how many rows will be returned at once.
	*
	* @deprecated Use ATTR_DB_CASSANDRA_PAGE_SIZE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_CASSANDRA_PAGE_SIZE = TMP_DB_CASSANDRA_PAGE_SIZE;
	/**
	* The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
	*
	* @deprecated Use ATTR_DB_CASSANDRA_CONSISTENCY_LEVEL in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_CASSANDRA_CONSISTENCY_LEVEL = TMP_DB_CASSANDRA_CONSISTENCY_LEVEL;
	/**
	* The name of the primary table that the operation is acting upon, including the schema name (if applicable).
	*
	* Note: This mirrors the db.sql.table attribute but references cassandra rather than sql. It is not recommended to attempt any client-side parsing of `db.statement` just to get this property, but it should be set if it is provided by the library being instrumented. If the operation is acting upon an anonymous table, or more than one table, this value MUST NOT be set.
	*
	* @deprecated Use ATTR_DB_CASSANDRA_TABLE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_CASSANDRA_TABLE = TMP_DB_CASSANDRA_TABLE;
	/**
	* Whether or not the query is idempotent.
	*
	* @deprecated Use ATTR_DB_CASSANDRA_IDEMPOTENCE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_CASSANDRA_IDEMPOTENCE = TMP_DB_CASSANDRA_IDEMPOTENCE;
	/**
	* The number of times a query was speculatively executed. Not set or `0` if the query was not executed speculatively.
	*
	* @deprecated Use ATTR_DB_CASSANDRA_SPECULATIVE_EXECUTION_COUNT in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_CASSANDRA_SPECULATIVE_EXECUTION_COUNT = TMP_DB_CASSANDRA_SPECULATIVE_EXECUTION_COUNT;
	/**
	* The ID of the coordinating node for a query.
	*
	* @deprecated Use ATTR_DB_CASSANDRA_COORDINATOR_ID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_CASSANDRA_COORDINATOR_ID = TMP_DB_CASSANDRA_COORDINATOR_ID;
	/**
	* The data center of the coordinating node for a query.
	*
	* @deprecated Use ATTR_DB_CASSANDRA_COORDINATOR_DC in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_CASSANDRA_COORDINATOR_DC = TMP_DB_CASSANDRA_COORDINATOR_DC;
	/**
	* The [HBase namespace](https://hbase.apache.org/book.html#_namespace) being accessed. To be used instead of the generic `db.name` attribute.
	*
	* @deprecated Use ATTR_DB_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_HBASE_NAMESPACE = TMP_DB_HBASE_NAMESPACE;
	/**
	* The index of the database being accessed as used in the [`SELECT` command](https://redis.io/commands/select), provided as an integer. To be used instead of the generic `db.name` attribute.
	*
	* @deprecated Use ATTR_DB_REDIS_DATABASE_INDEX in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_REDIS_DATABASE_INDEX = TMP_DB_REDIS_DATABASE_INDEX;
	/**
	* The collection being accessed within the database stated in `db.name`.
	*
	* @deprecated Use ATTR_DB_MONGODB_COLLECTION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_MONGODB_COLLECTION = TMP_DB_MONGODB_COLLECTION;
	/**
	* The name of the primary table that the operation is acting upon, including the schema name (if applicable).
	*
	* Note: It is not recommended to attempt any client-side parsing of `db.statement` just to get this property, but it should be set if it is provided by the library being instrumented. If the operation is acting upon an anonymous table, or more than one table, this value MUST NOT be set.
	*
	* @deprecated Use ATTR_DB_SQL_TABLE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_SQL_TABLE = TMP_DB_SQL_TABLE;
	/**
	* The type of the exception (its fully-qualified class name, if applicable). The dynamic type of the exception should be preferred over the static type in languages that support it.
	*
	* @deprecated Use ATTR_EXCEPTION_TYPE.
	*/
	exports.SEMATTRS_EXCEPTION_TYPE = TMP_EXCEPTION_TYPE;
	/**
	* The exception message.
	*
	* @deprecated Use ATTR_EXCEPTION_MESSAGE.
	*/
	exports.SEMATTRS_EXCEPTION_MESSAGE = TMP_EXCEPTION_MESSAGE;
	/**
	* A stacktrace as a string in the natural representation for the language runtime. The representation is to be determined and documented by each language SIG.
	*
	* @deprecated Use ATTR_EXCEPTION_STACKTRACE.
	*/
	exports.SEMATTRS_EXCEPTION_STACKTRACE = TMP_EXCEPTION_STACKTRACE;
	/**
	* SHOULD be set to true if the exception event is recorded at a point where it is known that the exception is escaping the scope of the span.
	*
	* Note: An exception is considered to have escaped (or left) the scope of a span,
	if that span is ended while the exception is still logically &#34;in flight&#34;.
	This may be actually &#34;in flight&#34; in some languages (e.g. if the exception
	is passed to a Context manager&#39;s `__exit__` method in Python) but will
	usually be caught at the point of recording the exception in most languages.
	
	It is usually not possible to determine at the point where an exception is thrown
	whether it will escape the scope of a span.
	However, it is trivial to know that an exception
	will escape, if one checks for an active exception just before ending the span,
	as done in the [example above](#exception-end-example).
	
	It follows that an exception may still escape the scope of the span
	even if the `exception.escaped` attribute was not set or set to false,
	since the event might have been recorded at a time where it was not
	clear whether the exception will escape.
	*
	* @deprecated Use ATTR_EXCEPTION_ESCAPED.
	*/
	exports.SEMATTRS_EXCEPTION_ESCAPED = TMP_EXCEPTION_ESCAPED;
	/**
	* Type of the trigger on which the function is executed.
	*
	* @deprecated Use ATTR_FAAS_TRIGGER in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_FAAS_TRIGGER = TMP_FAAS_TRIGGER;
	/**
	* The execution ID of the current function execution.
	*
	* @deprecated Use ATTR_FAAS_INVOCATION_ID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_FAAS_EXECUTION = TMP_FAAS_EXECUTION;
	/**
	* The name of the source on which the triggering operation was performed. For example, in Cloud Storage or S3 corresponds to the bucket name, and in Cosmos DB to the database name.
	*
	* @deprecated Use ATTR_FAAS_DOCUMENT_COLLECTION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_FAAS_DOCUMENT_COLLECTION = TMP_FAAS_DOCUMENT_COLLECTION;
	/**
	* Describes the type of the operation that was performed on the data.
	*
	* @deprecated Use ATTR_FAAS_DOCUMENT_OPERATION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_FAAS_DOCUMENT_OPERATION = TMP_FAAS_DOCUMENT_OPERATION;
	/**
	* A string containing the time when the data was accessed in the [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format expressed in [UTC](https://www.w3.org/TR/NOTE-datetime).
	*
	* @deprecated Use ATTR_FAAS_DOCUMENT_TIME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_FAAS_DOCUMENT_TIME = TMP_FAAS_DOCUMENT_TIME;
	/**
	* The document name/table subjected to the operation. For example, in Cloud Storage or S3 is the name of the file, and in Cosmos DB the table name.
	*
	* @deprecated Use ATTR_FAAS_DOCUMENT_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_FAAS_DOCUMENT_NAME = TMP_FAAS_DOCUMENT_NAME;
	/**
	* A string containing the function invocation time in the [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format expressed in [UTC](https://www.w3.org/TR/NOTE-datetime).
	*
	* @deprecated Use ATTR_FAAS_TIME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_FAAS_TIME = TMP_FAAS_TIME;
	/**
	* A string containing the schedule period as [Cron Expression](https://docs.oracle.com/cd/E12058_01/doc/doc.1014/e12030/cron_expressions.htm).
	*
	* @deprecated Use ATTR_FAAS_CRON in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_FAAS_CRON = TMP_FAAS_CRON;
	/**
	* A boolean that is true if the serverless function is executed for the first time (aka cold-start).
	*
	* @deprecated Use ATTR_FAAS_COLDSTART in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_FAAS_COLDSTART = TMP_FAAS_COLDSTART;
	/**
	* The name of the invoked function.
	*
	* Note: SHOULD be equal to the `faas.name` resource attribute of the invoked function.
	*
	* @deprecated Use ATTR_FAAS_INVOKED_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_FAAS_INVOKED_NAME = TMP_FAAS_INVOKED_NAME;
	/**
	* The cloud provider of the invoked function.
	*
	* Note: SHOULD be equal to the `cloud.provider` resource attribute of the invoked function.
	*
	* @deprecated Use ATTR_FAAS_INVOKED_PROVIDER in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_FAAS_INVOKED_PROVIDER = TMP_FAAS_INVOKED_PROVIDER;
	/**
	* The cloud region of the invoked function.
	*
	* Note: SHOULD be equal to the `cloud.region` resource attribute of the invoked function.
	*
	* @deprecated Use ATTR_FAAS_INVOKED_REGION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_FAAS_INVOKED_REGION = TMP_FAAS_INVOKED_REGION;
	/**
	* Transport protocol used. See note below.
	*
	* @deprecated Use ATTR_NET_TRANSPORT in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_NET_TRANSPORT = TMP_NET_TRANSPORT;
	/**
	* Remote address of the peer (dotted decimal for IPv4 or [RFC5952](https://tools.ietf.org/html/rfc5952) for IPv6).
	*
	* @deprecated Use ATTR_NET_PEER_IP in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_NET_PEER_IP = TMP_NET_PEER_IP;
	/**
	* Remote port number.
	*
	* @deprecated Use ATTR_NET_PEER_PORT in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_NET_PEER_PORT = TMP_NET_PEER_PORT;
	/**
	* Remote hostname or similar, see note below.
	*
	* @deprecated Use ATTR_NET_PEER_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_NET_PEER_NAME = TMP_NET_PEER_NAME;
	/**
	* Like `net.peer.ip` but for the host IP. Useful in case of a multi-IP host.
	*
	* @deprecated Use ATTR_NET_HOST_IP in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_NET_HOST_IP = TMP_NET_HOST_IP;
	/**
	* Like `net.peer.port` but for the host port.
	*
	* @deprecated Use ATTR_NET_HOST_PORT in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_NET_HOST_PORT = TMP_NET_HOST_PORT;
	/**
	* Local hostname or similar, see note below.
	*
	* @deprecated Use ATTR_NET_HOST_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_NET_HOST_NAME = TMP_NET_HOST_NAME;
	/**
	* The internet connection type currently being used by the host.
	*
	* @deprecated Use ATTR_NETWORK_CONNECTION_TYPE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_NET_HOST_CONNECTION_TYPE = TMP_NET_HOST_CONNECTION_TYPE;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use ATTR_NETWORK_CONNECTION_SUBTYPE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_NET_HOST_CONNECTION_SUBTYPE = TMP_NET_HOST_CONNECTION_SUBTYPE;
	/**
	* The name of the mobile carrier.
	*
	* @deprecated Use ATTR_NETWORK_CARRIER_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_NET_HOST_CARRIER_NAME = TMP_NET_HOST_CARRIER_NAME;
	/**
	* The mobile carrier country code.
	*
	* @deprecated Use ATTR_NETWORK_CARRIER_MCC in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_NET_HOST_CARRIER_MCC = TMP_NET_HOST_CARRIER_MCC;
	/**
	* The mobile carrier network code.
	*
	* @deprecated Use ATTR_NETWORK_CARRIER_MNC in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_NET_HOST_CARRIER_MNC = TMP_NET_HOST_CARRIER_MNC;
	/**
	* The ISO 3166-1 alpha-2 2-character country code associated with the mobile carrier network.
	*
	* @deprecated Use ATTR_NETWORK_CARRIER_ICC in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_NET_HOST_CARRIER_ICC = TMP_NET_HOST_CARRIER_ICC;
	/**
	* The [`service.name`](../../resource/semantic_conventions/README.md#service) of the remote service. SHOULD be equal to the actual `service.name` resource attribute of the remote service if any.
	*
	* @deprecated Use ATTR_PEER_SERVICE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_PEER_SERVICE = TMP_PEER_SERVICE;
	/**
	* Username or client_id extracted from the access token or [Authorization](https://tools.ietf.org/html/rfc7235#section-4.2) header in the inbound request from outside the system.
	*
	* @deprecated Use ATTR_ENDUSER_ID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_ENDUSER_ID = TMP_ENDUSER_ID;
	/**
	* Actual/assumed role the client is making the request under extracted from token or application security context.
	*
	* @deprecated Use ATTR_ENDUSER_ROLE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_ENDUSER_ROLE = TMP_ENDUSER_ROLE;
	/**
	* Scopes or granted authorities the client currently possesses extracted from token or application security context. The value would come from the scope associated with an [OAuth 2.0 Access Token](https://tools.ietf.org/html/rfc6749#section-3.3) or an attribute value in a [SAML 2.0 Assertion](http://docs.oasis-open.org/security/saml/Post2.0/sstc-saml-tech-overview-2.0.html).
	*
	* @deprecated Use ATTR_ENDUSER_SCOPE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_ENDUSER_SCOPE = TMP_ENDUSER_SCOPE;
	/**
	* Current &#34;managed&#34; thread ID (as opposed to OS thread ID).
	*
	* @deprecated Use ATTR_THREAD_ID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_THREAD_ID = TMP_THREAD_ID;
	/**
	* Current thread name.
	*
	* @deprecated Use ATTR_THREAD_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_THREAD_NAME = TMP_THREAD_NAME;
	/**
	* The method or function name, or equivalent (usually rightmost part of the code unit&#39;s name).
	*
	* @deprecated Use ATTR_CODE_FUNCTION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_CODE_FUNCTION = TMP_CODE_FUNCTION;
	/**
	* The &#34;namespace&#34; within which `code.function` is defined. Usually the qualified class or module name, such that `code.namespace` + some separator + `code.function` form a unique identifier for the code unit.
	*
	* @deprecated Use ATTR_CODE_NAMESPACE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_CODE_NAMESPACE = TMP_CODE_NAMESPACE;
	/**
	* The source code file name that identifies the code unit as uniquely as possible (preferably an absolute file path).
	*
	* @deprecated Use ATTR_CODE_FILEPATH in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_CODE_FILEPATH = TMP_CODE_FILEPATH;
	/**
	* The line number in `code.filepath` best representing the operation. It SHOULD point within the code unit named in `code.function`.
	*
	* @deprecated Use ATTR_CODE_LINENO in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_CODE_LINENO = TMP_CODE_LINENO;
	/**
	* HTTP request method.
	*
	* @deprecated Use ATTR_HTTP_METHOD in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_HTTP_METHOD = TMP_HTTP_METHOD;
	/**
	* Full HTTP request URL in the form `scheme://host[:port]/path?query[#fragment]`. Usually the fragment is not transmitted over HTTP, but if it is known, it should be included nevertheless.
	*
	* Note: `http.url` MUST NOT contain credentials passed via URL in form of `https://username:password@www.example.com/`. In such case the attribute&#39;s value should be `https://www.example.com/`.
	*
	* @deprecated Use ATTR_HTTP_URL in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_HTTP_URL = TMP_HTTP_URL;
	/**
	* The full request target as passed in a HTTP request line or equivalent.
	*
	* @deprecated Use ATTR_HTTP_TARGET in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_HTTP_TARGET = TMP_HTTP_TARGET;
	/**
	* The value of the [HTTP host header](https://tools.ietf.org/html/rfc7230#section-5.4). An empty Host header should also be reported, see note.
	*
	* Note: When the header is present but empty the attribute SHOULD be set to the empty string. Note that this is a valid situation that is expected in certain cases, according the aforementioned [section of RFC 7230](https://tools.ietf.org/html/rfc7230#section-5.4). When the header is not set the attribute MUST NOT be set.
	*
	* @deprecated Use ATTR_HTTP_HOST in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_HTTP_HOST = TMP_HTTP_HOST;
	/**
	* The URI scheme identifying the used protocol.
	*
	* @deprecated Use ATTR_HTTP_SCHEME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_HTTP_SCHEME = TMP_HTTP_SCHEME;
	/**
	* [HTTP response status code](https://tools.ietf.org/html/rfc7231#section-6).
	*
	* @deprecated Use ATTR_HTTP_STATUS_CODE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_HTTP_STATUS_CODE = TMP_HTTP_STATUS_CODE;
	/**
	* Kind of HTTP protocol used.
	*
	* Note: If `net.transport` is not specified, it can be assumed to be `IP.TCP` except if `http.flavor` is `QUIC`, in which case `IP.UDP` is assumed.
	*
	* @deprecated Use ATTR_HTTP_FLAVOR in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_HTTP_FLAVOR = TMP_HTTP_FLAVOR;
	/**
	* Value of the [HTTP User-Agent](https://tools.ietf.org/html/rfc7231#section-5.5.3) header sent by the client.
	*
	* @deprecated Use ATTR_HTTP_USER_AGENT in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_HTTP_USER_AGENT = TMP_HTTP_USER_AGENT;
	/**
	* The size of the request payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://tools.ietf.org/html/rfc7230#section-3.3.2) header. For requests using transport encoding, this should be the compressed size.
	*
	* @deprecated Use ATTR_HTTP_REQUEST_CONTENT_LENGTH in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH = TMP_HTTP_REQUEST_CONTENT_LENGTH;
	/**
	* The size of the uncompressed request payload body after transport decoding. Not set if transport encoding not used.
	*
	* @deprecated Use ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED = TMP_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED;
	/**
	* The size of the response payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://tools.ietf.org/html/rfc7230#section-3.3.2) header. For requests using transport encoding, this should be the compressed size.
	*
	* @deprecated Use ATTR_HTTP_RESPONSE_CONTENT_LENGTH in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH = TMP_HTTP_RESPONSE_CONTENT_LENGTH;
	/**
	* The size of the uncompressed response payload body after transport decoding. Not set if transport encoding not used.
	*
	* @deprecated Use ATTR_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED = TMP_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED;
	/**
	* The primary server name of the matched virtual host. This should be obtained via configuration. If no such configuration can be obtained, this attribute MUST NOT be set ( `net.host.name` should be used instead).
	*
	* Note: `http.url` is usually not readily available on the server side but would have to be assembled in a cumbersome and sometimes lossy process from other information (see e.g. open-telemetry/opentelemetry-python/pull/148). It is thus preferred to supply the raw data that is available.
	*
	* @deprecated Use ATTR_HTTP_SERVER_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_HTTP_SERVER_NAME = TMP_HTTP_SERVER_NAME;
	/**
	* The matched route (path template).
	*
	* @deprecated Use ATTR_HTTP_ROUTE.
	*/
	exports.SEMATTRS_HTTP_ROUTE = TMP_HTTP_ROUTE;
	/**
	* The IP address of the original client behind all proxies, if known (e.g. from [X-Forwarded-For](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For)).
	*
	* Note: This is not necessarily the same as `net.peer.ip`, which would
	identify the network-level peer, which may be a proxy.
	
	This attribute should be set when a source of information different
	from the one used for `net.peer.ip`, is available even if that other
	source just confirms the same value as `net.peer.ip`.
	Rationale: For `net.peer.ip`, one typically does not know if it
	comes from a proxy, reverse proxy, or the actual client. Setting
	`http.client_ip` when it&#39;s the same as `net.peer.ip` means that
	one is at least somewhat confident that the address is not that of
	the closest proxy.
	*
	* @deprecated Use ATTR_HTTP_CLIENT_IP in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_HTTP_CLIENT_IP = TMP_HTTP_CLIENT_IP;
	/**
	* The keys in the `RequestItems` object field.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_TABLE_NAMES in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_TABLE_NAMES = TMP_AWS_DYNAMODB_TABLE_NAMES;
	/**
	* The JSON-serialized value of each item in the `ConsumedCapacity` response field.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_CONSUMED_CAPACITY in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_CONSUMED_CAPACITY = TMP_AWS_DYNAMODB_CONSUMED_CAPACITY;
	/**
	* The JSON-serialized value of the `ItemCollectionMetrics` response field.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_ITEM_COLLECTION_METRICS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_ITEM_COLLECTION_METRICS = TMP_AWS_DYNAMODB_ITEM_COLLECTION_METRICS;
	/**
	* The value of the `ProvisionedThroughput.ReadCapacityUnits` request parameter.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_PROVISIONED_READ_CAPACITY in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_PROVISIONED_READ_CAPACITY = TMP_AWS_DYNAMODB_PROVISIONED_READ_CAPACITY;
	/**
	* The value of the `ProvisionedThroughput.WriteCapacityUnits` request parameter.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_PROVISIONED_WRITE_CAPACITY in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_PROVISIONED_WRITE_CAPACITY = TMP_AWS_DYNAMODB_PROVISIONED_WRITE_CAPACITY;
	/**
	* The value of the `ConsistentRead` request parameter.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_CONSISTENT_READ in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_CONSISTENT_READ = TMP_AWS_DYNAMODB_CONSISTENT_READ;
	/**
	* The value of the `ProjectionExpression` request parameter.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_PROJECTION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_PROJECTION = TMP_AWS_DYNAMODB_PROJECTION;
	/**
	* The value of the `Limit` request parameter.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_LIMIT in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_LIMIT = TMP_AWS_DYNAMODB_LIMIT;
	/**
	* The value of the `AttributesToGet` request parameter.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_ATTRIBUTES_TO_GET in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_ATTRIBUTES_TO_GET = TMP_AWS_DYNAMODB_ATTRIBUTES_TO_GET;
	/**
	* The value of the `IndexName` request parameter.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_INDEX_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_INDEX_NAME = TMP_AWS_DYNAMODB_INDEX_NAME;
	/**
	* The value of the `Select` request parameter.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_SELECT in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_SELECT = TMP_AWS_DYNAMODB_SELECT;
	/**
	* The JSON-serialized value of each item of the `GlobalSecondaryIndexes` request field.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEXES in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEXES = TMP_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEXES;
	/**
	* The JSON-serialized value of each item of the `LocalSecondaryIndexes` request field.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_LOCAL_SECONDARY_INDEXES in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_LOCAL_SECONDARY_INDEXES = TMP_AWS_DYNAMODB_LOCAL_SECONDARY_INDEXES;
	/**
	* The value of the `ExclusiveStartTableName` request parameter.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_EXCLUSIVE_START_TABLE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_EXCLUSIVE_START_TABLE = TMP_AWS_DYNAMODB_EXCLUSIVE_START_TABLE;
	/**
	* The the number of items in the `TableNames` response parameter.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_TABLE_COUNT in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_TABLE_COUNT = TMP_AWS_DYNAMODB_TABLE_COUNT;
	/**
	* The value of the `ScanIndexForward` request parameter.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_SCAN_FORWARD in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_SCAN_FORWARD = TMP_AWS_DYNAMODB_SCAN_FORWARD;
	/**
	* The value of the `Segment` request parameter.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_SEGMENT in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_SEGMENT = TMP_AWS_DYNAMODB_SEGMENT;
	/**
	* The value of the `TotalSegments` request parameter.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_TOTAL_SEGMENTS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_TOTAL_SEGMENTS = TMP_AWS_DYNAMODB_TOTAL_SEGMENTS;
	/**
	* The value of the `Count` response parameter.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_COUNT in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_COUNT = TMP_AWS_DYNAMODB_COUNT;
	/**
	* The value of the `ScannedCount` response parameter.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_SCANNED_COUNT in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_SCANNED_COUNT = TMP_AWS_DYNAMODB_SCANNED_COUNT;
	/**
	* The JSON-serialized value of each item in the `AttributeDefinitions` request field.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_ATTRIBUTE_DEFINITIONS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_ATTRIBUTE_DEFINITIONS = TMP_AWS_DYNAMODB_ATTRIBUTE_DEFINITIONS;
	/**
	* The JSON-serialized value of each item in the the `GlobalSecondaryIndexUpdates` request field.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEX_UPDATES in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEX_UPDATES = TMP_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEX_UPDATES;
	/**
	* A string identifying the messaging system.
	*
	* @deprecated Use ATTR_MESSAGING_SYSTEM in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_MESSAGING_SYSTEM = TMP_MESSAGING_SYSTEM;
	/**
	* The message destination name. This might be equal to the span name but is required nevertheless.
	*
	* @deprecated Use ATTR_MESSAGING_DESTINATION_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_MESSAGING_DESTINATION = TMP_MESSAGING_DESTINATION;
	/**
	* The kind of message destination.
	*
	* @deprecated Removed in semconv v1.20.0.
	*/
	exports.SEMATTRS_MESSAGING_DESTINATION_KIND = TMP_MESSAGING_DESTINATION_KIND;
	/**
	* A boolean that is true if the message destination is temporary.
	*
	* @deprecated Use ATTR_MESSAGING_DESTINATION_TEMPORARY in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_MESSAGING_TEMP_DESTINATION = TMP_MESSAGING_TEMP_DESTINATION;
	/**
	* The name of the transport protocol.
	*
	* @deprecated Use ATTR_NETWORK_PROTOCOL_NAME.
	*/
	exports.SEMATTRS_MESSAGING_PROTOCOL = TMP_MESSAGING_PROTOCOL;
	/**
	* The version of the transport protocol.
	*
	* @deprecated Use ATTR_NETWORK_PROTOCOL_VERSION.
	*/
	exports.SEMATTRS_MESSAGING_PROTOCOL_VERSION = TMP_MESSAGING_PROTOCOL_VERSION;
	/**
	* Connection string.
	*
	* @deprecated Removed in semconv v1.17.0.
	*/
	exports.SEMATTRS_MESSAGING_URL = TMP_MESSAGING_URL;
	/**
	* A value used by the messaging system as an identifier for the message, represented as a string.
	*
	* @deprecated Use ATTR_MESSAGING_MESSAGE_ID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_MESSAGING_MESSAGE_ID = TMP_MESSAGING_MESSAGE_ID;
	/**
	* The [conversation ID](#conversations) identifying the conversation to which the message belongs, represented as a string. Sometimes called &#34;Correlation ID&#34;.
	*
	* @deprecated Use ATTR_MESSAGING_MESSAGE_CONVERSATION_ID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_MESSAGING_CONVERSATION_ID = TMP_MESSAGING_CONVERSATION_ID;
	/**
	* The (uncompressed) size of the message payload in bytes. Also use this attribute if it is unknown whether the compressed or uncompressed payload size is reported.
	*
	* @deprecated Use ATTR_MESSAGING_MESSAGE_BODY_SIZE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_MESSAGING_MESSAGE_PAYLOAD_SIZE_BYTES = TMP_MESSAGING_MESSAGE_PAYLOAD_SIZE_BYTES;
	/**
	* The compressed size of the message payload in bytes.
	*
	* @deprecated Removed in semconv v1.22.0.
	*/
	exports.SEMATTRS_MESSAGING_MESSAGE_PAYLOAD_COMPRESSED_SIZE_BYTES = TMP_MESSAGING_MESSAGE_PAYLOAD_COMPRESSED_SIZE_BYTES;
	/**
	* A string identifying the kind of message consumption as defined in the [Operation names](#operation-names) section above. If the operation is &#34;send&#34;, this attribute MUST NOT be set, since the operation can be inferred from the span kind in that case.
	*
	* @deprecated Use ATTR_MESSAGING_OPERATION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_MESSAGING_OPERATION = TMP_MESSAGING_OPERATION;
	/**
	* The identifier for the consumer receiving a message. For Kafka, set it to `{messaging.kafka.consumer_group} - {messaging.kafka.client_id}`, if both are present, or only `messaging.kafka.consumer_group`. For brokers, such as RabbitMQ and Artemis, set it to the `client_id` of the client consuming the message.
	*
	* @deprecated Removed in semconv v1.21.0.
	*/
	exports.SEMATTRS_MESSAGING_CONSUMER_ID = TMP_MESSAGING_CONSUMER_ID;
	/**
	* RabbitMQ message routing key.
	*
	* @deprecated Use ATTR_MESSAGING_RABBITMQ_DESTINATION_ROUTING_KEY in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_MESSAGING_RABBITMQ_ROUTING_KEY = TMP_MESSAGING_RABBITMQ_ROUTING_KEY;
	/**
	* Message keys in Kafka are used for grouping alike messages to ensure they&#39;re processed on the same partition. They differ from `messaging.message_id` in that they&#39;re not unique. If the key is `null`, the attribute MUST NOT be set.
	*
	* Note: If the key type is not string, it&#39;s string representation has to be supplied for the attribute. If the key has no unambiguous, canonical string form, don&#39;t include its value.
	*
	* @deprecated Use ATTR_MESSAGING_KAFKA_MESSAGE_KEY in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_MESSAGING_KAFKA_MESSAGE_KEY = TMP_MESSAGING_KAFKA_MESSAGE_KEY;
	/**
	* Name of the Kafka Consumer Group that is handling the message. Only applies to consumers, not producers.
	*
	* @deprecated Use ATTR_MESSAGING_KAFKA_CONSUMER_GROUP in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_MESSAGING_KAFKA_CONSUMER_GROUP = TMP_MESSAGING_KAFKA_CONSUMER_GROUP;
	/**
	* Client Id for the Consumer or Producer that is handling the message.
	*
	* @deprecated Use ATTR_MESSAGING_CLIENT_ID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_MESSAGING_KAFKA_CLIENT_ID = TMP_MESSAGING_KAFKA_CLIENT_ID;
	/**
	* Partition the message is sent to.
	*
	* @deprecated Use ATTR_MESSAGING_KAFKA_DESTINATION_PARTITION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_MESSAGING_KAFKA_PARTITION = TMP_MESSAGING_KAFKA_PARTITION;
	/**
	* A boolean that is true if the message is a tombstone.
	*
	* @deprecated Use ATTR_MESSAGING_KAFKA_MESSAGE_TOMBSTONE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_MESSAGING_KAFKA_TOMBSTONE = TMP_MESSAGING_KAFKA_TOMBSTONE;
	/**
	* A string identifying the remoting system.
	*
	* @deprecated Use ATTR_RPC_SYSTEM in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_RPC_SYSTEM = TMP_RPC_SYSTEM;
	/**
	* The full (logical) name of the service being called, including its package name, if applicable.
	*
	* Note: This is the logical name of the service from the RPC interface perspective, which can be different from the name of any implementing class. The `code.namespace` attribute may be used to store the latter (despite the attribute name, it may include a class name; e.g., class with method actually executing the call on the server side, RPC client stub class on the client side).
	*
	* @deprecated Use ATTR_RPC_SERVICE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_RPC_SERVICE = TMP_RPC_SERVICE;
	/**
	* The name of the (logical) method being called, must be equal to the $method part in the span name.
	*
	* Note: This is the logical name of the method from the RPC interface perspective, which can be different from the name of any implementing method/function. The `code.function` attribute may be used to store the latter (e.g., method actually executing the call on the server side, RPC client stub method on the client side).
	*
	* @deprecated Use ATTR_RPC_METHOD in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_RPC_METHOD = TMP_RPC_METHOD;
	/**
	* The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
	*
	* @deprecated Use ATTR_RPC_GRPC_STATUS_CODE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_RPC_GRPC_STATUS_CODE = TMP_RPC_GRPC_STATUS_CODE;
	/**
	* Protocol version as in `jsonrpc` property of request/response. Since JSON-RPC 1.0 does not specify this, the value can be omitted.
	*
	* @deprecated Use ATTR_RPC_JSONRPC_VERSION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_RPC_JSONRPC_VERSION = TMP_RPC_JSONRPC_VERSION;
	/**
	* `id` property of request or response. Since protocol allows id to be int, string, `null` or missing (for notifications), value is expected to be cast to string for simplicity. Use empty string in case of `null` value. Omit entirely if this is a notification.
	*
	* @deprecated Use ATTR_RPC_JSONRPC_REQUEST_ID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_RPC_JSONRPC_REQUEST_ID = TMP_RPC_JSONRPC_REQUEST_ID;
	/**
	* `error.code` property of response if it is an error response.
	*
	* @deprecated Use ATTR_RPC_JSONRPC_ERROR_CODE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_RPC_JSONRPC_ERROR_CODE = TMP_RPC_JSONRPC_ERROR_CODE;
	/**
	* `error.message` property of response if it is an error response.
	*
	* @deprecated Use ATTR_RPC_JSONRPC_ERROR_MESSAGE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_RPC_JSONRPC_ERROR_MESSAGE = TMP_RPC_JSONRPC_ERROR_MESSAGE;
	/**
	* Whether this is a received or sent message.
	*
	* @deprecated Use ATTR_MESSAGE_TYPE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_MESSAGE_TYPE = TMP_MESSAGE_TYPE;
	/**
	* MUST be calculated as two different counters starting from `1` one for sent messages and one for received message.
	*
	* Note: This way we guarantee that the values will be consistent between different implementations.
	*
	* @deprecated Use ATTR_MESSAGE_ID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_MESSAGE_ID = TMP_MESSAGE_ID;
	/**
	* Compressed size of the message in bytes.
	*
	* @deprecated Use ATTR_MESSAGE_COMPRESSED_SIZE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_MESSAGE_COMPRESSED_SIZE = TMP_MESSAGE_COMPRESSED_SIZE;
	/**
	* Uncompressed size of the message in bytes.
	*
	* @deprecated Use ATTR_MESSAGE_UNCOMPRESSED_SIZE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_MESSAGE_UNCOMPRESSED_SIZE = TMP_MESSAGE_UNCOMPRESSED_SIZE;
	/**
	* Create exported Value Map for SemanticAttributes values
	* @deprecated Use the SEMATTRS_XXXXX constants rather than the SemanticAttributes.XXXXX for bundle minification
	*/
	exports.SemanticAttributes = /*#__PURE__*/ (0, utils_1.createConstMap)([
		TMP_AWS_LAMBDA_INVOKED_ARN,
		TMP_DB_SYSTEM,
		TMP_DB_CONNECTION_STRING,
		TMP_DB_USER,
		TMP_DB_JDBC_DRIVER_CLASSNAME,
		TMP_DB_NAME,
		TMP_DB_STATEMENT,
		TMP_DB_OPERATION,
		TMP_DB_MSSQL_INSTANCE_NAME,
		TMP_DB_CASSANDRA_KEYSPACE,
		TMP_DB_CASSANDRA_PAGE_SIZE,
		TMP_DB_CASSANDRA_CONSISTENCY_LEVEL,
		TMP_DB_CASSANDRA_TABLE,
		TMP_DB_CASSANDRA_IDEMPOTENCE,
		TMP_DB_CASSANDRA_SPECULATIVE_EXECUTION_COUNT,
		TMP_DB_CASSANDRA_COORDINATOR_ID,
		TMP_DB_CASSANDRA_COORDINATOR_DC,
		TMP_DB_HBASE_NAMESPACE,
		TMP_DB_REDIS_DATABASE_INDEX,
		TMP_DB_MONGODB_COLLECTION,
		TMP_DB_SQL_TABLE,
		TMP_EXCEPTION_TYPE,
		TMP_EXCEPTION_MESSAGE,
		TMP_EXCEPTION_STACKTRACE,
		TMP_EXCEPTION_ESCAPED,
		TMP_FAAS_TRIGGER,
		TMP_FAAS_EXECUTION,
		TMP_FAAS_DOCUMENT_COLLECTION,
		TMP_FAAS_DOCUMENT_OPERATION,
		TMP_FAAS_DOCUMENT_TIME,
		TMP_FAAS_DOCUMENT_NAME,
		TMP_FAAS_TIME,
		TMP_FAAS_CRON,
		TMP_FAAS_COLDSTART,
		TMP_FAAS_INVOKED_NAME,
		TMP_FAAS_INVOKED_PROVIDER,
		TMP_FAAS_INVOKED_REGION,
		TMP_NET_TRANSPORT,
		TMP_NET_PEER_IP,
		TMP_NET_PEER_PORT,
		TMP_NET_PEER_NAME,
		TMP_NET_HOST_IP,
		TMP_NET_HOST_PORT,
		TMP_NET_HOST_NAME,
		TMP_NET_HOST_CONNECTION_TYPE,
		TMP_NET_HOST_CONNECTION_SUBTYPE,
		TMP_NET_HOST_CARRIER_NAME,
		TMP_NET_HOST_CARRIER_MCC,
		TMP_NET_HOST_CARRIER_MNC,
		TMP_NET_HOST_CARRIER_ICC,
		TMP_PEER_SERVICE,
		TMP_ENDUSER_ID,
		TMP_ENDUSER_ROLE,
		TMP_ENDUSER_SCOPE,
		TMP_THREAD_ID,
		TMP_THREAD_NAME,
		TMP_CODE_FUNCTION,
		TMP_CODE_NAMESPACE,
		TMP_CODE_FILEPATH,
		TMP_CODE_LINENO,
		TMP_HTTP_METHOD,
		TMP_HTTP_URL,
		TMP_HTTP_TARGET,
		TMP_HTTP_HOST,
		TMP_HTTP_SCHEME,
		TMP_HTTP_STATUS_CODE,
		TMP_HTTP_FLAVOR,
		TMP_HTTP_USER_AGENT,
		TMP_HTTP_REQUEST_CONTENT_LENGTH,
		TMP_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED,
		TMP_HTTP_RESPONSE_CONTENT_LENGTH,
		TMP_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED,
		TMP_HTTP_SERVER_NAME,
		TMP_HTTP_ROUTE,
		TMP_HTTP_CLIENT_IP,
		TMP_AWS_DYNAMODB_TABLE_NAMES,
		TMP_AWS_DYNAMODB_CONSUMED_CAPACITY,
		TMP_AWS_DYNAMODB_ITEM_COLLECTION_METRICS,
		TMP_AWS_DYNAMODB_PROVISIONED_READ_CAPACITY,
		TMP_AWS_DYNAMODB_PROVISIONED_WRITE_CAPACITY,
		TMP_AWS_DYNAMODB_CONSISTENT_READ,
		TMP_AWS_DYNAMODB_PROJECTION,
		TMP_AWS_DYNAMODB_LIMIT,
		TMP_AWS_DYNAMODB_ATTRIBUTES_TO_GET,
		TMP_AWS_DYNAMODB_INDEX_NAME,
		TMP_AWS_DYNAMODB_SELECT,
		TMP_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEXES,
		TMP_AWS_DYNAMODB_LOCAL_SECONDARY_INDEXES,
		TMP_AWS_DYNAMODB_EXCLUSIVE_START_TABLE,
		TMP_AWS_DYNAMODB_TABLE_COUNT,
		TMP_AWS_DYNAMODB_SCAN_FORWARD,
		TMP_AWS_DYNAMODB_SEGMENT,
		TMP_AWS_DYNAMODB_TOTAL_SEGMENTS,
		TMP_AWS_DYNAMODB_COUNT,
		TMP_AWS_DYNAMODB_SCANNED_COUNT,
		TMP_AWS_DYNAMODB_ATTRIBUTE_DEFINITIONS,
		TMP_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEX_UPDATES,
		TMP_MESSAGING_SYSTEM,
		TMP_MESSAGING_DESTINATION,
		TMP_MESSAGING_DESTINATION_KIND,
		TMP_MESSAGING_TEMP_DESTINATION,
		TMP_MESSAGING_PROTOCOL,
		TMP_MESSAGING_PROTOCOL_VERSION,
		TMP_MESSAGING_URL,
		TMP_MESSAGING_MESSAGE_ID,
		TMP_MESSAGING_CONVERSATION_ID,
		TMP_MESSAGING_MESSAGE_PAYLOAD_SIZE_BYTES,
		TMP_MESSAGING_MESSAGE_PAYLOAD_COMPRESSED_SIZE_BYTES,
		TMP_MESSAGING_OPERATION,
		TMP_MESSAGING_CONSUMER_ID,
		TMP_MESSAGING_RABBITMQ_ROUTING_KEY,
		TMP_MESSAGING_KAFKA_MESSAGE_KEY,
		TMP_MESSAGING_KAFKA_CONSUMER_GROUP,
		TMP_MESSAGING_KAFKA_CLIENT_ID,
		TMP_MESSAGING_KAFKA_PARTITION,
		TMP_MESSAGING_KAFKA_TOMBSTONE,
		TMP_RPC_SYSTEM,
		TMP_RPC_SERVICE,
		TMP_RPC_METHOD,
		TMP_RPC_GRPC_STATUS_CODE,
		TMP_RPC_JSONRPC_VERSION,
		TMP_RPC_JSONRPC_REQUEST_ID,
		TMP_RPC_JSONRPC_ERROR_CODE,
		TMP_RPC_JSONRPC_ERROR_MESSAGE,
		TMP_MESSAGE_TYPE,
		TMP_MESSAGE_ID,
		TMP_MESSAGE_COMPRESSED_SIZE,
		TMP_MESSAGE_UNCOMPRESSED_SIZE
	]);
	const TMP_DBSYSTEMVALUES_OTHER_SQL = "other_sql";
	const TMP_DBSYSTEMVALUES_MSSQL = "mssql";
	const TMP_DBSYSTEMVALUES_MYSQL = "mysql";
	const TMP_DBSYSTEMVALUES_ORACLE = "oracle";
	const TMP_DBSYSTEMVALUES_DB2 = "db2";
	const TMP_DBSYSTEMVALUES_POSTGRESQL = "postgresql";
	const TMP_DBSYSTEMVALUES_REDSHIFT = "redshift";
	const TMP_DBSYSTEMVALUES_HIVE = "hive";
	const TMP_DBSYSTEMVALUES_CLOUDSCAPE = "cloudscape";
	const TMP_DBSYSTEMVALUES_HSQLDB = "hsqldb";
	const TMP_DBSYSTEMVALUES_PROGRESS = "progress";
	const TMP_DBSYSTEMVALUES_MAXDB = "maxdb";
	const TMP_DBSYSTEMVALUES_HANADB = "hanadb";
	const TMP_DBSYSTEMVALUES_INGRES = "ingres";
	const TMP_DBSYSTEMVALUES_FIRSTSQL = "firstsql";
	const TMP_DBSYSTEMVALUES_EDB = "edb";
	const TMP_DBSYSTEMVALUES_CACHE = "cache";
	const TMP_DBSYSTEMVALUES_ADABAS = "adabas";
	const TMP_DBSYSTEMVALUES_FIREBIRD = "firebird";
	const TMP_DBSYSTEMVALUES_DERBY = "derby";
	const TMP_DBSYSTEMVALUES_FILEMAKER = "filemaker";
	const TMP_DBSYSTEMVALUES_INFORMIX = "informix";
	const TMP_DBSYSTEMVALUES_INSTANTDB = "instantdb";
	const TMP_DBSYSTEMVALUES_INTERBASE = "interbase";
	const TMP_DBSYSTEMVALUES_MARIADB = "mariadb";
	const TMP_DBSYSTEMVALUES_NETEZZA = "netezza";
	const TMP_DBSYSTEMVALUES_PERVASIVE = "pervasive";
	const TMP_DBSYSTEMVALUES_POINTBASE = "pointbase";
	const TMP_DBSYSTEMVALUES_SQLITE = "sqlite";
	const TMP_DBSYSTEMVALUES_SYBASE = "sybase";
	const TMP_DBSYSTEMVALUES_TERADATA = "teradata";
	const TMP_DBSYSTEMVALUES_VERTICA = "vertica";
	const TMP_DBSYSTEMVALUES_H2 = "h2";
	const TMP_DBSYSTEMVALUES_COLDFUSION = "coldfusion";
	const TMP_DBSYSTEMVALUES_CASSANDRA = "cassandra";
	const TMP_DBSYSTEMVALUES_HBASE = "hbase";
	const TMP_DBSYSTEMVALUES_MONGODB = "mongodb";
	const TMP_DBSYSTEMVALUES_REDIS = "redis";
	const TMP_DBSYSTEMVALUES_COUCHBASE = "couchbase";
	const TMP_DBSYSTEMVALUES_COUCHDB = "couchdb";
	const TMP_DBSYSTEMVALUES_COSMOSDB = "cosmosdb";
	const TMP_DBSYSTEMVALUES_DYNAMODB = "dynamodb";
	const TMP_DBSYSTEMVALUES_NEO4J = "neo4j";
	const TMP_DBSYSTEMVALUES_GEODE = "geode";
	const TMP_DBSYSTEMVALUES_ELASTICSEARCH = "elasticsearch";
	const TMP_DBSYSTEMVALUES_MEMCACHED = "memcached";
	const TMP_DBSYSTEMVALUES_COCKROACHDB = "cockroachdb";
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_OTHER_SQL in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_OTHER_SQL = TMP_DBSYSTEMVALUES_OTHER_SQL;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_MSSQL in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_MSSQL = TMP_DBSYSTEMVALUES_MSSQL;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_MYSQL in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_MYSQL = TMP_DBSYSTEMVALUES_MYSQL;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_ORACLE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_ORACLE = TMP_DBSYSTEMVALUES_ORACLE;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_DB2 in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_DB2 = TMP_DBSYSTEMVALUES_DB2;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_POSTGRESQL in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_POSTGRESQL = TMP_DBSYSTEMVALUES_POSTGRESQL;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_REDSHIFT in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_REDSHIFT = TMP_DBSYSTEMVALUES_REDSHIFT;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_HIVE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_HIVE = TMP_DBSYSTEMVALUES_HIVE;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_CLOUDSCAPE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_CLOUDSCAPE = TMP_DBSYSTEMVALUES_CLOUDSCAPE;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_HSQLDB in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_HSQLDB = TMP_DBSYSTEMVALUES_HSQLDB;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_PROGRESS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_PROGRESS = TMP_DBSYSTEMVALUES_PROGRESS;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_MAXDB in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_MAXDB = TMP_DBSYSTEMVALUES_MAXDB;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_HANADB in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_HANADB = TMP_DBSYSTEMVALUES_HANADB;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_INGRES in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_INGRES = TMP_DBSYSTEMVALUES_INGRES;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_FIRSTSQL in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_FIRSTSQL = TMP_DBSYSTEMVALUES_FIRSTSQL;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_EDB in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_EDB = TMP_DBSYSTEMVALUES_EDB;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_CACHE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_CACHE = TMP_DBSYSTEMVALUES_CACHE;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_ADABAS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_ADABAS = TMP_DBSYSTEMVALUES_ADABAS;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_FIREBIRD in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_FIREBIRD = TMP_DBSYSTEMVALUES_FIREBIRD;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_DERBY in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_DERBY = TMP_DBSYSTEMVALUES_DERBY;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_FILEMAKER in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_FILEMAKER = TMP_DBSYSTEMVALUES_FILEMAKER;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_INFORMIX in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_INFORMIX = TMP_DBSYSTEMVALUES_INFORMIX;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_INSTANTDB in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_INSTANTDB = TMP_DBSYSTEMVALUES_INSTANTDB;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_INTERBASE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_INTERBASE = TMP_DBSYSTEMVALUES_INTERBASE;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_MARIADB in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_MARIADB = TMP_DBSYSTEMVALUES_MARIADB;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_NETEZZA in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_NETEZZA = TMP_DBSYSTEMVALUES_NETEZZA;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_PERVASIVE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_PERVASIVE = TMP_DBSYSTEMVALUES_PERVASIVE;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_POINTBASE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_POINTBASE = TMP_DBSYSTEMVALUES_POINTBASE;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_SQLITE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_SQLITE = TMP_DBSYSTEMVALUES_SQLITE;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_SYBASE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_SYBASE = TMP_DBSYSTEMVALUES_SYBASE;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_TERADATA in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_TERADATA = TMP_DBSYSTEMVALUES_TERADATA;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_VERTICA in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_VERTICA = TMP_DBSYSTEMVALUES_VERTICA;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_H2 in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_H2 = TMP_DBSYSTEMVALUES_H2;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_COLDFUSION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_COLDFUSION = TMP_DBSYSTEMVALUES_COLDFUSION;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_CASSANDRA in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_CASSANDRA = TMP_DBSYSTEMVALUES_CASSANDRA;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_HBASE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_HBASE = TMP_DBSYSTEMVALUES_HBASE;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_MONGODB in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_MONGODB = TMP_DBSYSTEMVALUES_MONGODB;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_REDIS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_REDIS = TMP_DBSYSTEMVALUES_REDIS;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_COUCHBASE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_COUCHBASE = TMP_DBSYSTEMVALUES_COUCHBASE;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_COUCHDB in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_COUCHDB = TMP_DBSYSTEMVALUES_COUCHDB;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_COSMOSDB in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_COSMOSDB = TMP_DBSYSTEMVALUES_COSMOSDB;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_DYNAMODB in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_DYNAMODB = TMP_DBSYSTEMVALUES_DYNAMODB;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_NEO4J in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_NEO4J = TMP_DBSYSTEMVALUES_NEO4J;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_GEODE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_GEODE = TMP_DBSYSTEMVALUES_GEODE;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_ELASTICSEARCH in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_ELASTICSEARCH = TMP_DBSYSTEMVALUES_ELASTICSEARCH;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_MEMCACHED in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_MEMCACHED = TMP_DBSYSTEMVALUES_MEMCACHED;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_COCKROACHDB in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_COCKROACHDB = TMP_DBSYSTEMVALUES_COCKROACHDB;
	/**
	* The constant map of values for DbSystemValues.
	* @deprecated Use the DBSYSTEMVALUES_XXXXX constants rather than the DbSystemValues.XXXXX for bundle minification.
	*/
	exports.DbSystemValues = /*#__PURE__*/ (0, utils_1.createConstMap)([
		TMP_DBSYSTEMVALUES_OTHER_SQL,
		TMP_DBSYSTEMVALUES_MSSQL,
		TMP_DBSYSTEMVALUES_MYSQL,
		TMP_DBSYSTEMVALUES_ORACLE,
		TMP_DBSYSTEMVALUES_DB2,
		TMP_DBSYSTEMVALUES_POSTGRESQL,
		TMP_DBSYSTEMVALUES_REDSHIFT,
		TMP_DBSYSTEMVALUES_HIVE,
		TMP_DBSYSTEMVALUES_CLOUDSCAPE,
		TMP_DBSYSTEMVALUES_HSQLDB,
		TMP_DBSYSTEMVALUES_PROGRESS,
		TMP_DBSYSTEMVALUES_MAXDB,
		TMP_DBSYSTEMVALUES_HANADB,
		TMP_DBSYSTEMVALUES_INGRES,
		TMP_DBSYSTEMVALUES_FIRSTSQL,
		TMP_DBSYSTEMVALUES_EDB,
		TMP_DBSYSTEMVALUES_CACHE,
		TMP_DBSYSTEMVALUES_ADABAS,
		TMP_DBSYSTEMVALUES_FIREBIRD,
		TMP_DBSYSTEMVALUES_DERBY,
		TMP_DBSYSTEMVALUES_FILEMAKER,
		TMP_DBSYSTEMVALUES_INFORMIX,
		TMP_DBSYSTEMVALUES_INSTANTDB,
		TMP_DBSYSTEMVALUES_INTERBASE,
		TMP_DBSYSTEMVALUES_MARIADB,
		TMP_DBSYSTEMVALUES_NETEZZA,
		TMP_DBSYSTEMVALUES_PERVASIVE,
		TMP_DBSYSTEMVALUES_POINTBASE,
		TMP_DBSYSTEMVALUES_SQLITE,
		TMP_DBSYSTEMVALUES_SYBASE,
		TMP_DBSYSTEMVALUES_TERADATA,
		TMP_DBSYSTEMVALUES_VERTICA,
		TMP_DBSYSTEMVALUES_H2,
		TMP_DBSYSTEMVALUES_COLDFUSION,
		TMP_DBSYSTEMVALUES_CASSANDRA,
		TMP_DBSYSTEMVALUES_HBASE,
		TMP_DBSYSTEMVALUES_MONGODB,
		TMP_DBSYSTEMVALUES_REDIS,
		TMP_DBSYSTEMVALUES_COUCHBASE,
		TMP_DBSYSTEMVALUES_COUCHDB,
		TMP_DBSYSTEMVALUES_COSMOSDB,
		TMP_DBSYSTEMVALUES_DYNAMODB,
		TMP_DBSYSTEMVALUES_NEO4J,
		TMP_DBSYSTEMVALUES_GEODE,
		TMP_DBSYSTEMVALUES_ELASTICSEARCH,
		TMP_DBSYSTEMVALUES_MEMCACHED,
		TMP_DBSYSTEMVALUES_COCKROACHDB
	]);
	const TMP_DBCASSANDRACONSISTENCYLEVELVALUES_ALL = "all";
	const TMP_DBCASSANDRACONSISTENCYLEVELVALUES_EACH_QUORUM = "each_quorum";
	const TMP_DBCASSANDRACONSISTENCYLEVELVALUES_QUORUM = "quorum";
	const TMP_DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_QUORUM = "local_quorum";
	const TMP_DBCASSANDRACONSISTENCYLEVELVALUES_ONE = "one";
	const TMP_DBCASSANDRACONSISTENCYLEVELVALUES_TWO = "two";
	const TMP_DBCASSANDRACONSISTENCYLEVELVALUES_THREE = "three";
	const TMP_DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_ONE = "local_one";
	const TMP_DBCASSANDRACONSISTENCYLEVELVALUES_ANY = "any";
	const TMP_DBCASSANDRACONSISTENCYLEVELVALUES_SERIAL = "serial";
	const TMP_DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_SERIAL = "local_serial";
	/**
	* The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
	*
	* @deprecated Use DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_ALL in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBCASSANDRACONSISTENCYLEVELVALUES_ALL = TMP_DBCASSANDRACONSISTENCYLEVELVALUES_ALL;
	/**
	* The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
	*
	* @deprecated Use DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_EACH_QUORUM in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBCASSANDRACONSISTENCYLEVELVALUES_EACH_QUORUM = TMP_DBCASSANDRACONSISTENCYLEVELVALUES_EACH_QUORUM;
	/**
	* The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
	*
	* @deprecated Use DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_QUORUM in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBCASSANDRACONSISTENCYLEVELVALUES_QUORUM = TMP_DBCASSANDRACONSISTENCYLEVELVALUES_QUORUM;
	/**
	* The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
	*
	* @deprecated Use DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_LOCAL_QUORUM in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_QUORUM = TMP_DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_QUORUM;
	/**
	* The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
	*
	* @deprecated Use DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_ONE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBCASSANDRACONSISTENCYLEVELVALUES_ONE = TMP_DBCASSANDRACONSISTENCYLEVELVALUES_ONE;
	/**
	* The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
	*
	* @deprecated Use DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_TWO in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBCASSANDRACONSISTENCYLEVELVALUES_TWO = TMP_DBCASSANDRACONSISTENCYLEVELVALUES_TWO;
	/**
	* The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
	*
	* @deprecated Use DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_THREE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBCASSANDRACONSISTENCYLEVELVALUES_THREE = TMP_DBCASSANDRACONSISTENCYLEVELVALUES_THREE;
	/**
	* The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
	*
	* @deprecated Use DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_LOCAL_ONE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_ONE = TMP_DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_ONE;
	/**
	* The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
	*
	* @deprecated Use DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_ANY in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBCASSANDRACONSISTENCYLEVELVALUES_ANY = TMP_DBCASSANDRACONSISTENCYLEVELVALUES_ANY;
	/**
	* The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
	*
	* @deprecated Use DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_SERIAL in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBCASSANDRACONSISTENCYLEVELVALUES_SERIAL = TMP_DBCASSANDRACONSISTENCYLEVELVALUES_SERIAL;
	/**
	* The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
	*
	* @deprecated Use DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_LOCAL_SERIAL in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_SERIAL = TMP_DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_SERIAL;
	/**
	* The constant map of values for DbCassandraConsistencyLevelValues.
	* @deprecated Use the DBCASSANDRACONSISTENCYLEVELVALUES_XXXXX constants rather than the DbCassandraConsistencyLevelValues.XXXXX for bundle minification.
	*/
	exports.DbCassandraConsistencyLevelValues = /*#__PURE__*/ (0, utils_1.createConstMap)([
		TMP_DBCASSANDRACONSISTENCYLEVELVALUES_ALL,
		TMP_DBCASSANDRACONSISTENCYLEVELVALUES_EACH_QUORUM,
		TMP_DBCASSANDRACONSISTENCYLEVELVALUES_QUORUM,
		TMP_DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_QUORUM,
		TMP_DBCASSANDRACONSISTENCYLEVELVALUES_ONE,
		TMP_DBCASSANDRACONSISTENCYLEVELVALUES_TWO,
		TMP_DBCASSANDRACONSISTENCYLEVELVALUES_THREE,
		TMP_DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_ONE,
		TMP_DBCASSANDRACONSISTENCYLEVELVALUES_ANY,
		TMP_DBCASSANDRACONSISTENCYLEVELVALUES_SERIAL,
		TMP_DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_SERIAL
	]);
	const TMP_FAASTRIGGERVALUES_DATASOURCE = "datasource";
	const TMP_FAASTRIGGERVALUES_HTTP = "http";
	const TMP_FAASTRIGGERVALUES_PUBSUB = "pubsub";
	const TMP_FAASTRIGGERVALUES_TIMER = "timer";
	const TMP_FAASTRIGGERVALUES_OTHER = "other";
	/**
	* Type of the trigger on which the function is executed.
	*
	* @deprecated Use FAAS_TRIGGER_VALUE_DATASOURCE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.FAASTRIGGERVALUES_DATASOURCE = TMP_FAASTRIGGERVALUES_DATASOURCE;
	/**
	* Type of the trigger on which the function is executed.
	*
	* @deprecated Use FAAS_TRIGGER_VALUE_HTTP in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.FAASTRIGGERVALUES_HTTP = TMP_FAASTRIGGERVALUES_HTTP;
	/**
	* Type of the trigger on which the function is executed.
	*
	* @deprecated Use FAAS_TRIGGER_VALUE_PUBSUB in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.FAASTRIGGERVALUES_PUBSUB = TMP_FAASTRIGGERVALUES_PUBSUB;
	/**
	* Type of the trigger on which the function is executed.
	*
	* @deprecated Use FAAS_TRIGGER_VALUE_TIMER in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.FAASTRIGGERVALUES_TIMER = TMP_FAASTRIGGERVALUES_TIMER;
	/**
	* Type of the trigger on which the function is executed.
	*
	* @deprecated Use FAAS_TRIGGER_VALUE_OTHER in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.FAASTRIGGERVALUES_OTHER = TMP_FAASTRIGGERVALUES_OTHER;
	/**
	* The constant map of values for FaasTriggerValues.
	* @deprecated Use the FAASTRIGGERVALUES_XXXXX constants rather than the FaasTriggerValues.XXXXX for bundle minification.
	*/
	exports.FaasTriggerValues = /*#__PURE__*/ (0, utils_1.createConstMap)([
		TMP_FAASTRIGGERVALUES_DATASOURCE,
		TMP_FAASTRIGGERVALUES_HTTP,
		TMP_FAASTRIGGERVALUES_PUBSUB,
		TMP_FAASTRIGGERVALUES_TIMER,
		TMP_FAASTRIGGERVALUES_OTHER
	]);
	const TMP_FAASDOCUMENTOPERATIONVALUES_INSERT = "insert";
	const TMP_FAASDOCUMENTOPERATIONVALUES_EDIT = "edit";
	const TMP_FAASDOCUMENTOPERATIONVALUES_DELETE = "delete";
	/**
	* Describes the type of the operation that was performed on the data.
	*
	* @deprecated Use FAAS_DOCUMENT_OPERATION_VALUE_INSERT in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.FAASDOCUMENTOPERATIONVALUES_INSERT = TMP_FAASDOCUMENTOPERATIONVALUES_INSERT;
	/**
	* Describes the type of the operation that was performed on the data.
	*
	* @deprecated Use FAAS_DOCUMENT_OPERATION_VALUE_EDIT in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.FAASDOCUMENTOPERATIONVALUES_EDIT = TMP_FAASDOCUMENTOPERATIONVALUES_EDIT;
	/**
	* Describes the type of the operation that was performed on the data.
	*
	* @deprecated Use FAAS_DOCUMENT_OPERATION_VALUE_DELETE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.FAASDOCUMENTOPERATIONVALUES_DELETE = TMP_FAASDOCUMENTOPERATIONVALUES_DELETE;
	/**
	* The constant map of values for FaasDocumentOperationValues.
	* @deprecated Use the FAASDOCUMENTOPERATIONVALUES_XXXXX constants rather than the FaasDocumentOperationValues.XXXXX for bundle minification.
	*/
	exports.FaasDocumentOperationValues = /*#__PURE__*/ (0, utils_1.createConstMap)([
		TMP_FAASDOCUMENTOPERATIONVALUES_INSERT,
		TMP_FAASDOCUMENTOPERATIONVALUES_EDIT,
		TMP_FAASDOCUMENTOPERATIONVALUES_DELETE
	]);
	const TMP_FAASINVOKEDPROVIDERVALUES_ALIBABA_CLOUD = "alibaba_cloud";
	const TMP_FAASINVOKEDPROVIDERVALUES_AWS = "aws";
	const TMP_FAASINVOKEDPROVIDERVALUES_AZURE = "azure";
	const TMP_FAASINVOKEDPROVIDERVALUES_GCP = "gcp";
	/**
	* The cloud provider of the invoked function.
	*
	* Note: SHOULD be equal to the `cloud.provider` resource attribute of the invoked function.
	*
	* @deprecated Use FAAS_INVOKED_PROVIDER_VALUE_ALIBABA_CLOUD in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.FAASINVOKEDPROVIDERVALUES_ALIBABA_CLOUD = TMP_FAASINVOKEDPROVIDERVALUES_ALIBABA_CLOUD;
	/**
	* The cloud provider of the invoked function.
	*
	* Note: SHOULD be equal to the `cloud.provider` resource attribute of the invoked function.
	*
	* @deprecated Use FAAS_INVOKED_PROVIDER_VALUE_AWS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.FAASINVOKEDPROVIDERVALUES_AWS = TMP_FAASINVOKEDPROVIDERVALUES_AWS;
	/**
	* The cloud provider of the invoked function.
	*
	* Note: SHOULD be equal to the `cloud.provider` resource attribute of the invoked function.
	*
	* @deprecated Use FAAS_INVOKED_PROVIDER_VALUE_AZURE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.FAASINVOKEDPROVIDERVALUES_AZURE = TMP_FAASINVOKEDPROVIDERVALUES_AZURE;
	/**
	* The cloud provider of the invoked function.
	*
	* Note: SHOULD be equal to the `cloud.provider` resource attribute of the invoked function.
	*
	* @deprecated Use FAAS_INVOKED_PROVIDER_VALUE_GCP in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.FAASINVOKEDPROVIDERVALUES_GCP = TMP_FAASINVOKEDPROVIDERVALUES_GCP;
	/**
	* The constant map of values for FaasInvokedProviderValues.
	* @deprecated Use the FAASINVOKEDPROVIDERVALUES_XXXXX constants rather than the FaasInvokedProviderValues.XXXXX for bundle minification.
	*/
	exports.FaasInvokedProviderValues = /*#__PURE__*/ (0, utils_1.createConstMap)([
		TMP_FAASINVOKEDPROVIDERVALUES_ALIBABA_CLOUD,
		TMP_FAASINVOKEDPROVIDERVALUES_AWS,
		TMP_FAASINVOKEDPROVIDERVALUES_AZURE,
		TMP_FAASINVOKEDPROVIDERVALUES_GCP
	]);
	const TMP_NETTRANSPORTVALUES_IP_TCP = "ip_tcp";
	const TMP_NETTRANSPORTVALUES_IP_UDP = "ip_udp";
	const TMP_NETTRANSPORTVALUES_IP = "ip";
	const TMP_NETTRANSPORTVALUES_UNIX = "unix";
	const TMP_NETTRANSPORTVALUES_PIPE = "pipe";
	const TMP_NETTRANSPORTVALUES_INPROC = "inproc";
	const TMP_NETTRANSPORTVALUES_OTHER = "other";
	/**
	* Transport protocol used. See note below.
	*
	* @deprecated Use NET_TRANSPORT_VALUE_IP_TCP in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETTRANSPORTVALUES_IP_TCP = TMP_NETTRANSPORTVALUES_IP_TCP;
	/**
	* Transport protocol used. See note below.
	*
	* @deprecated Use NET_TRANSPORT_VALUE_IP_UDP in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETTRANSPORTVALUES_IP_UDP = TMP_NETTRANSPORTVALUES_IP_UDP;
	/**
	* Transport protocol used. See note below.
	*
	* @deprecated Removed in v1.21.0.
	*/
	exports.NETTRANSPORTVALUES_IP = TMP_NETTRANSPORTVALUES_IP;
	/**
	* Transport protocol used. See note below.
	*
	* @deprecated Removed in v1.21.0.
	*/
	exports.NETTRANSPORTVALUES_UNIX = TMP_NETTRANSPORTVALUES_UNIX;
	/**
	* Transport protocol used. See note below.
	*
	* @deprecated Use NET_TRANSPORT_VALUE_PIPE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETTRANSPORTVALUES_PIPE = TMP_NETTRANSPORTVALUES_PIPE;
	/**
	* Transport protocol used. See note below.
	*
	* @deprecated Use NET_TRANSPORT_VALUE_INPROC in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETTRANSPORTVALUES_INPROC = TMP_NETTRANSPORTVALUES_INPROC;
	/**
	* Transport protocol used. See note below.
	*
	* @deprecated Use NET_TRANSPORT_VALUE_OTHER in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETTRANSPORTVALUES_OTHER = TMP_NETTRANSPORTVALUES_OTHER;
	/**
	* The constant map of values for NetTransportValues.
	* @deprecated Use the NETTRANSPORTVALUES_XXXXX constants rather than the NetTransportValues.XXXXX for bundle minification.
	*/
	exports.NetTransportValues = /*#__PURE__*/ (0, utils_1.createConstMap)([
		TMP_NETTRANSPORTVALUES_IP_TCP,
		TMP_NETTRANSPORTVALUES_IP_UDP,
		TMP_NETTRANSPORTVALUES_IP,
		TMP_NETTRANSPORTVALUES_UNIX,
		TMP_NETTRANSPORTVALUES_PIPE,
		TMP_NETTRANSPORTVALUES_INPROC,
		TMP_NETTRANSPORTVALUES_OTHER
	]);
	const TMP_NETHOSTCONNECTIONTYPEVALUES_WIFI = "wifi";
	const TMP_NETHOSTCONNECTIONTYPEVALUES_WIRED = "wired";
	const TMP_NETHOSTCONNECTIONTYPEVALUES_CELL = "cell";
	const TMP_NETHOSTCONNECTIONTYPEVALUES_UNAVAILABLE = "unavailable";
	const TMP_NETHOSTCONNECTIONTYPEVALUES_UNKNOWN = "unknown";
	/**
	* The internet connection type currently being used by the host.
	*
	* @deprecated Use NETWORK_CONNECTION_TYPE_VALUE_WIFI in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONTYPEVALUES_WIFI = TMP_NETHOSTCONNECTIONTYPEVALUES_WIFI;
	/**
	* The internet connection type currently being used by the host.
	*
	* @deprecated Use NETWORK_CONNECTION_TYPE_VALUE_WIRED in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONTYPEVALUES_WIRED = TMP_NETHOSTCONNECTIONTYPEVALUES_WIRED;
	/**
	* The internet connection type currently being used by the host.
	*
	* @deprecated Use NETWORK_CONNECTION_TYPE_VALUE_CELL in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONTYPEVALUES_CELL = TMP_NETHOSTCONNECTIONTYPEVALUES_CELL;
	/**
	* The internet connection type currently being used by the host.
	*
	* @deprecated Use NETWORK_CONNECTION_TYPE_VALUE_UNAVAILABLE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONTYPEVALUES_UNAVAILABLE = TMP_NETHOSTCONNECTIONTYPEVALUES_UNAVAILABLE;
	/**
	* The internet connection type currently being used by the host.
	*
	* @deprecated Use NETWORK_CONNECTION_TYPE_VALUE_UNKNOWN in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONTYPEVALUES_UNKNOWN = TMP_NETHOSTCONNECTIONTYPEVALUES_UNKNOWN;
	/**
	* The constant map of values for NetHostConnectionTypeValues.
	* @deprecated Use the NETHOSTCONNECTIONTYPEVALUES_XXXXX constants rather than the NetHostConnectionTypeValues.XXXXX for bundle minification.
	*/
	exports.NetHostConnectionTypeValues = /*#__PURE__*/ (0, utils_1.createConstMap)([
		TMP_NETHOSTCONNECTIONTYPEVALUES_WIFI,
		TMP_NETHOSTCONNECTIONTYPEVALUES_WIRED,
		TMP_NETHOSTCONNECTIONTYPEVALUES_CELL,
		TMP_NETHOSTCONNECTIONTYPEVALUES_UNAVAILABLE,
		TMP_NETHOSTCONNECTIONTYPEVALUES_UNKNOWN
	]);
	const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_GPRS = "gprs";
	const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EDGE = "edge";
	const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_UMTS = "umts";
	const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_CDMA = "cdma";
	const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_0 = "evdo_0";
	const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_A = "evdo_a";
	const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_CDMA2000_1XRTT = "cdma2000_1xrtt";
	const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSDPA = "hsdpa";
	const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSUPA = "hsupa";
	const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSPA = "hspa";
	const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_IDEN = "iden";
	const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_B = "evdo_b";
	const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_LTE = "lte";
	const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EHRPD = "ehrpd";
	const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSPAP = "hspap";
	const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_GSM = "gsm";
	const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_TD_SCDMA = "td_scdma";
	const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_IWLAN = "iwlan";
	const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_NR = "nr";
	const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_NRNSA = "nrnsa";
	const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_LTE_CA = "lte_ca";
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_GPRS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_GPRS = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_GPRS;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_EDGE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_EDGE = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EDGE;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_UMTS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_UMTS = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_UMTS;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_CDMA in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_CDMA = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_CDMA;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_EVDO_0 in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_0 = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_0;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_EVDO_A in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_A = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_A;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_CDMA2000_1XRTT in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_CDMA2000_1XRTT = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_CDMA2000_1XRTT;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_HSDPA in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_HSDPA = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSDPA;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_HSUPA in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_HSUPA = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSUPA;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_HSPA in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_HSPA = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSPA;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_IDEN in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_IDEN = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_IDEN;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_EVDO_B in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_B = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_B;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_LTE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_LTE = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_LTE;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_EHRPD in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_EHRPD = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EHRPD;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_HSPAP in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_HSPAP = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSPAP;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_GSM in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_GSM = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_GSM;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_TD_SCDMA in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_TD_SCDMA = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_TD_SCDMA;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_IWLAN in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_IWLAN = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_IWLAN;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_NR in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_NR = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_NR;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_NRNSA in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_NRNSA = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_NRNSA;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_LTE_CA in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_LTE_CA = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_LTE_CA;
	/**
	* The constant map of values for NetHostConnectionSubtypeValues.
	* @deprecated Use the NETHOSTCONNECTIONSUBTYPEVALUES_XXXXX constants rather than the NetHostConnectionSubtypeValues.XXXXX for bundle minification.
	*/
	exports.NetHostConnectionSubtypeValues = /*#__PURE__*/ (0, utils_1.createConstMap)([
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_GPRS,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EDGE,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_UMTS,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_CDMA,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_0,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_A,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_CDMA2000_1XRTT,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSDPA,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSUPA,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSPA,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_IDEN,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_B,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_LTE,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EHRPD,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSPAP,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_GSM,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_TD_SCDMA,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_IWLAN,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_NR,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_NRNSA,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_LTE_CA
	]);
	const TMP_HTTPFLAVORVALUES_HTTP_1_0 = "1.0";
	const TMP_HTTPFLAVORVALUES_HTTP_1_1 = "1.1";
	const TMP_HTTPFLAVORVALUES_HTTP_2_0 = "2.0";
	const TMP_HTTPFLAVORVALUES_SPDY = "SPDY";
	const TMP_HTTPFLAVORVALUES_QUIC = "QUIC";
	/**
	* Kind of HTTP protocol used.
	*
	* Note: If `net.transport` is not specified, it can be assumed to be `IP.TCP` except if `http.flavor` is `QUIC`, in which case `IP.UDP` is assumed.
	*
	* @deprecated Use HTTP_FLAVOR_VALUE_HTTP_1_0 in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.HTTPFLAVORVALUES_HTTP_1_0 = TMP_HTTPFLAVORVALUES_HTTP_1_0;
	/**
	* Kind of HTTP protocol used.
	*
	* Note: If `net.transport` is not specified, it can be assumed to be `IP.TCP` except if `http.flavor` is `QUIC`, in which case `IP.UDP` is assumed.
	*
	* @deprecated Use HTTP_FLAVOR_VALUE_HTTP_1_1 in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.HTTPFLAVORVALUES_HTTP_1_1 = TMP_HTTPFLAVORVALUES_HTTP_1_1;
	/**
	* Kind of HTTP protocol used.
	*
	* Note: If `net.transport` is not specified, it can be assumed to be `IP.TCP` except if `http.flavor` is `QUIC`, in which case `IP.UDP` is assumed.
	*
	* @deprecated Use HTTP_FLAVOR_VALUE_HTTP_2_0 in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.HTTPFLAVORVALUES_HTTP_2_0 = TMP_HTTPFLAVORVALUES_HTTP_2_0;
	/**
	* Kind of HTTP protocol used.
	*
	* Note: If `net.transport` is not specified, it can be assumed to be `IP.TCP` except if `http.flavor` is `QUIC`, in which case `IP.UDP` is assumed.
	*
	* @deprecated Use HTTP_FLAVOR_VALUE_SPDY in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.HTTPFLAVORVALUES_SPDY = TMP_HTTPFLAVORVALUES_SPDY;
	/**
	* Kind of HTTP protocol used.
	*
	* Note: If `net.transport` is not specified, it can be assumed to be `IP.TCP` except if `http.flavor` is `QUIC`, in which case `IP.UDP` is assumed.
	*
	* @deprecated Use HTTP_FLAVOR_VALUE_QUIC in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.HTTPFLAVORVALUES_QUIC = TMP_HTTPFLAVORVALUES_QUIC;
	/**
	* The constant map of values for HttpFlavorValues.
	* @deprecated Use the HTTPFLAVORVALUES_XXXXX constants rather than the HttpFlavorValues.XXXXX for bundle minification.
	*/
	exports.HttpFlavorValues = {
		HTTP_1_0: TMP_HTTPFLAVORVALUES_HTTP_1_0,
		HTTP_1_1: TMP_HTTPFLAVORVALUES_HTTP_1_1,
		HTTP_2_0: TMP_HTTPFLAVORVALUES_HTTP_2_0,
		SPDY: TMP_HTTPFLAVORVALUES_SPDY,
		QUIC: TMP_HTTPFLAVORVALUES_QUIC
	};
	const TMP_MESSAGINGDESTINATIONKINDVALUES_QUEUE = "queue";
	const TMP_MESSAGINGDESTINATIONKINDVALUES_TOPIC = "topic";
	/**
	* The kind of message destination.
	*
	* @deprecated Removed in semconv v1.20.0.
	*/
	exports.MESSAGINGDESTINATIONKINDVALUES_QUEUE = TMP_MESSAGINGDESTINATIONKINDVALUES_QUEUE;
	/**
	* The kind of message destination.
	*
	* @deprecated Removed in semconv v1.20.0.
	*/
	exports.MESSAGINGDESTINATIONKINDVALUES_TOPIC = TMP_MESSAGINGDESTINATIONKINDVALUES_TOPIC;
	/**
	* The constant map of values for MessagingDestinationKindValues.
	* @deprecated Use the MESSAGINGDESTINATIONKINDVALUES_XXXXX constants rather than the MessagingDestinationKindValues.XXXXX for bundle minification.
	*/
	exports.MessagingDestinationKindValues = /*#__PURE__*/ (0, utils_1.createConstMap)([TMP_MESSAGINGDESTINATIONKINDVALUES_QUEUE, TMP_MESSAGINGDESTINATIONKINDVALUES_TOPIC]);
	const TMP_MESSAGINGOPERATIONVALUES_RECEIVE = "receive";
	const TMP_MESSAGINGOPERATIONVALUES_PROCESS = "process";
	/**
	* A string identifying the kind of message consumption as defined in the [Operation names](#operation-names) section above. If the operation is &#34;send&#34;, this attribute MUST NOT be set, since the operation can be inferred from the span kind in that case.
	*
	* @deprecated Use MESSAGING_OPERATION_TYPE_VALUE_RECEIVE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.MESSAGINGOPERATIONVALUES_RECEIVE = TMP_MESSAGINGOPERATIONVALUES_RECEIVE;
	/**
	* A string identifying the kind of message consumption as defined in the [Operation names](#operation-names) section above. If the operation is &#34;send&#34;, this attribute MUST NOT be set, since the operation can be inferred from the span kind in that case.
	*
	* @deprecated Use MESSAGING_OPERATION_TYPE_VALUE_PROCESS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.MESSAGINGOPERATIONVALUES_PROCESS = TMP_MESSAGINGOPERATIONVALUES_PROCESS;
	/**
	* The constant map of values for MessagingOperationValues.
	* @deprecated Use the MESSAGINGOPERATIONVALUES_XXXXX constants rather than the MessagingOperationValues.XXXXX for bundle minification.
	*/
	exports.MessagingOperationValues = /*#__PURE__*/ (0, utils_1.createConstMap)([TMP_MESSAGINGOPERATIONVALUES_RECEIVE, TMP_MESSAGINGOPERATIONVALUES_PROCESS]);
	const TMP_RPCGRPCSTATUSCODEVALUES_OK = 0;
	const TMP_RPCGRPCSTATUSCODEVALUES_CANCELLED = 1;
	const TMP_RPCGRPCSTATUSCODEVALUES_UNKNOWN = 2;
	const TMP_RPCGRPCSTATUSCODEVALUES_INVALID_ARGUMENT = 3;
	const TMP_RPCGRPCSTATUSCODEVALUES_DEADLINE_EXCEEDED = 4;
	const TMP_RPCGRPCSTATUSCODEVALUES_NOT_FOUND = 5;
	const TMP_RPCGRPCSTATUSCODEVALUES_ALREADY_EXISTS = 6;
	const TMP_RPCGRPCSTATUSCODEVALUES_PERMISSION_DENIED = 7;
	const TMP_RPCGRPCSTATUSCODEVALUES_RESOURCE_EXHAUSTED = 8;
	const TMP_RPCGRPCSTATUSCODEVALUES_FAILED_PRECONDITION = 9;
	const TMP_RPCGRPCSTATUSCODEVALUES_ABORTED = 10;
	const TMP_RPCGRPCSTATUSCODEVALUES_OUT_OF_RANGE = 11;
	const TMP_RPCGRPCSTATUSCODEVALUES_UNIMPLEMENTED = 12;
	const TMP_RPCGRPCSTATUSCODEVALUES_INTERNAL = 13;
	const TMP_RPCGRPCSTATUSCODEVALUES_UNAVAILABLE = 14;
	const TMP_RPCGRPCSTATUSCODEVALUES_DATA_LOSS = 15;
	const TMP_RPCGRPCSTATUSCODEVALUES_UNAUTHENTICATED = 16;
	/**
	* The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
	*
	* @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_OK in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.RPCGRPCSTATUSCODEVALUES_OK = TMP_RPCGRPCSTATUSCODEVALUES_OK;
	/**
	* The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
	*
	* @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_CANCELLED in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.RPCGRPCSTATUSCODEVALUES_CANCELLED = TMP_RPCGRPCSTATUSCODEVALUES_CANCELLED;
	/**
	* The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
	*
	* @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_UNKNOWN in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.RPCGRPCSTATUSCODEVALUES_UNKNOWN = TMP_RPCGRPCSTATUSCODEVALUES_UNKNOWN;
	/**
	* The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
	*
	* @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_INVALID_ARGUMENT in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.RPCGRPCSTATUSCODEVALUES_INVALID_ARGUMENT = TMP_RPCGRPCSTATUSCODEVALUES_INVALID_ARGUMENT;
	/**
	* The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
	*
	* @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_DEADLINE_EXCEEDED in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.RPCGRPCSTATUSCODEVALUES_DEADLINE_EXCEEDED = TMP_RPCGRPCSTATUSCODEVALUES_DEADLINE_EXCEEDED;
	/**
	* The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
	*
	* @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_NOT_FOUND in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.RPCGRPCSTATUSCODEVALUES_NOT_FOUND = TMP_RPCGRPCSTATUSCODEVALUES_NOT_FOUND;
	/**
	* The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
	*
	* @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_ALREADY_EXISTS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.RPCGRPCSTATUSCODEVALUES_ALREADY_EXISTS = TMP_RPCGRPCSTATUSCODEVALUES_ALREADY_EXISTS;
	/**
	* The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
	*
	* @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_PERMISSION_DENIED in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.RPCGRPCSTATUSCODEVALUES_PERMISSION_DENIED = TMP_RPCGRPCSTATUSCODEVALUES_PERMISSION_DENIED;
	/**
	* The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
	*
	* @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_RESOURCE_EXHAUSTED in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.RPCGRPCSTATUSCODEVALUES_RESOURCE_EXHAUSTED = TMP_RPCGRPCSTATUSCODEVALUES_RESOURCE_EXHAUSTED;
	/**
	* The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
	*
	* @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_FAILED_PRECONDITION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.RPCGRPCSTATUSCODEVALUES_FAILED_PRECONDITION = TMP_RPCGRPCSTATUSCODEVALUES_FAILED_PRECONDITION;
	/**
	* The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
	*
	* @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_ABORTED in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.RPCGRPCSTATUSCODEVALUES_ABORTED = TMP_RPCGRPCSTATUSCODEVALUES_ABORTED;
	/**
	* The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
	*
	* @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_OUT_OF_RANGE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.RPCGRPCSTATUSCODEVALUES_OUT_OF_RANGE = TMP_RPCGRPCSTATUSCODEVALUES_OUT_OF_RANGE;
	/**
	* The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
	*
	* @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_UNIMPLEMENTED in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.RPCGRPCSTATUSCODEVALUES_UNIMPLEMENTED = TMP_RPCGRPCSTATUSCODEVALUES_UNIMPLEMENTED;
	/**
	* The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
	*
	* @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_INTERNAL in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.RPCGRPCSTATUSCODEVALUES_INTERNAL = TMP_RPCGRPCSTATUSCODEVALUES_INTERNAL;
	/**
	* The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
	*
	* @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_UNAVAILABLE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.RPCGRPCSTATUSCODEVALUES_UNAVAILABLE = TMP_RPCGRPCSTATUSCODEVALUES_UNAVAILABLE;
	/**
	* The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
	*
	* @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_DATA_LOSS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.RPCGRPCSTATUSCODEVALUES_DATA_LOSS = TMP_RPCGRPCSTATUSCODEVALUES_DATA_LOSS;
	/**
	* The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
	*
	* @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_UNAUTHENTICATED in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.RPCGRPCSTATUSCODEVALUES_UNAUTHENTICATED = TMP_RPCGRPCSTATUSCODEVALUES_UNAUTHENTICATED;
	/**
	* The constant map of values for RpcGrpcStatusCodeValues.
	* @deprecated Use the RPCGRPCSTATUSCODEVALUES_XXXXX constants rather than the RpcGrpcStatusCodeValues.XXXXX for bundle minification.
	*/
	exports.RpcGrpcStatusCodeValues = {
		OK: TMP_RPCGRPCSTATUSCODEVALUES_OK,
		CANCELLED: TMP_RPCGRPCSTATUSCODEVALUES_CANCELLED,
		UNKNOWN: TMP_RPCGRPCSTATUSCODEVALUES_UNKNOWN,
		INVALID_ARGUMENT: TMP_RPCGRPCSTATUSCODEVALUES_INVALID_ARGUMENT,
		DEADLINE_EXCEEDED: TMP_RPCGRPCSTATUSCODEVALUES_DEADLINE_EXCEEDED,
		NOT_FOUND: TMP_RPCGRPCSTATUSCODEVALUES_NOT_FOUND,
		ALREADY_EXISTS: TMP_RPCGRPCSTATUSCODEVALUES_ALREADY_EXISTS,
		PERMISSION_DENIED: TMP_RPCGRPCSTATUSCODEVALUES_PERMISSION_DENIED,
		RESOURCE_EXHAUSTED: TMP_RPCGRPCSTATUSCODEVALUES_RESOURCE_EXHAUSTED,
		FAILED_PRECONDITION: TMP_RPCGRPCSTATUSCODEVALUES_FAILED_PRECONDITION,
		ABORTED: TMP_RPCGRPCSTATUSCODEVALUES_ABORTED,
		OUT_OF_RANGE: TMP_RPCGRPCSTATUSCODEVALUES_OUT_OF_RANGE,
		UNIMPLEMENTED: TMP_RPCGRPCSTATUSCODEVALUES_UNIMPLEMENTED,
		INTERNAL: TMP_RPCGRPCSTATUSCODEVALUES_INTERNAL,
		UNAVAILABLE: TMP_RPCGRPCSTATUSCODEVALUES_UNAVAILABLE,
		DATA_LOSS: TMP_RPCGRPCSTATUSCODEVALUES_DATA_LOSS,
		UNAUTHENTICATED: TMP_RPCGRPCSTATUSCODEVALUES_UNAUTHENTICATED
	};
	const TMP_MESSAGETYPEVALUES_SENT = "SENT";
	const TMP_MESSAGETYPEVALUES_RECEIVED = "RECEIVED";
	/**
	* Whether this is a received or sent message.
	*
	* @deprecated Use MESSAGE_TYPE_VALUE_SENT in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.MESSAGETYPEVALUES_SENT = TMP_MESSAGETYPEVALUES_SENT;
	/**
	* Whether this is a received or sent message.
	*
	* @deprecated Use MESSAGE_TYPE_VALUE_RECEIVED in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.MESSAGETYPEVALUES_RECEIVED = TMP_MESSAGETYPEVALUES_RECEIVED;
	/**
	* The constant map of values for MessageTypeValues.
	* @deprecated Use the MESSAGETYPEVALUES_XXXXX constants rather than the MessageTypeValues.XXXXX for bundle minification.
	*/
	exports.MessageTypeValues = /*#__PURE__*/ (0, utils_1.createConstMap)([TMP_MESSAGETYPEVALUES_SENT, TMP_MESSAGETYPEVALUES_RECEIVED]);
}));
//#endregion
//#region node_modules/@opentelemetry/semantic-conventions/build/src/trace/index.js
var require_trace = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$3) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$3, p)) __createBinding(exports$3, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(require_SemanticAttributes(), exports);
}));
//#endregion
//#region node_modules/@opentelemetry/semantic-conventions/build/src/resource/SemanticResourceAttributes.js
var require_SemanticResourceAttributes = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SEMRESATTRS_K8S_STATEFULSET_NAME = exports.SEMRESATTRS_K8S_STATEFULSET_UID = exports.SEMRESATTRS_K8S_DEPLOYMENT_NAME = exports.SEMRESATTRS_K8S_DEPLOYMENT_UID = exports.SEMRESATTRS_K8S_REPLICASET_NAME = exports.SEMRESATTRS_K8S_REPLICASET_UID = exports.SEMRESATTRS_K8S_CONTAINER_NAME = exports.SEMRESATTRS_K8S_POD_NAME = exports.SEMRESATTRS_K8S_POD_UID = exports.SEMRESATTRS_K8S_NAMESPACE_NAME = exports.SEMRESATTRS_K8S_NODE_UID = exports.SEMRESATTRS_K8S_NODE_NAME = exports.SEMRESATTRS_K8S_CLUSTER_NAME = exports.SEMRESATTRS_HOST_IMAGE_VERSION = exports.SEMRESATTRS_HOST_IMAGE_ID = exports.SEMRESATTRS_HOST_IMAGE_NAME = exports.SEMRESATTRS_HOST_ARCH = exports.SEMRESATTRS_HOST_TYPE = exports.SEMRESATTRS_HOST_NAME = exports.SEMRESATTRS_HOST_ID = exports.SEMRESATTRS_FAAS_MAX_MEMORY = exports.SEMRESATTRS_FAAS_INSTANCE = exports.SEMRESATTRS_FAAS_VERSION = exports.SEMRESATTRS_FAAS_ID = exports.SEMRESATTRS_FAAS_NAME = exports.SEMRESATTRS_DEVICE_MODEL_NAME = exports.SEMRESATTRS_DEVICE_MODEL_IDENTIFIER = exports.SEMRESATTRS_DEVICE_ID = exports.SEMRESATTRS_DEPLOYMENT_ENVIRONMENT = exports.SEMRESATTRS_CONTAINER_IMAGE_TAG = exports.SEMRESATTRS_CONTAINER_IMAGE_NAME = exports.SEMRESATTRS_CONTAINER_RUNTIME = exports.SEMRESATTRS_CONTAINER_ID = exports.SEMRESATTRS_CONTAINER_NAME = exports.SEMRESATTRS_AWS_LOG_STREAM_ARNS = exports.SEMRESATTRS_AWS_LOG_STREAM_NAMES = exports.SEMRESATTRS_AWS_LOG_GROUP_ARNS = exports.SEMRESATTRS_AWS_LOG_GROUP_NAMES = exports.SEMRESATTRS_AWS_EKS_CLUSTER_ARN = exports.SEMRESATTRS_AWS_ECS_TASK_REVISION = exports.SEMRESATTRS_AWS_ECS_TASK_FAMILY = exports.SEMRESATTRS_AWS_ECS_TASK_ARN = exports.SEMRESATTRS_AWS_ECS_LAUNCHTYPE = exports.SEMRESATTRS_AWS_ECS_CLUSTER_ARN = exports.SEMRESATTRS_AWS_ECS_CONTAINER_ARN = exports.SEMRESATTRS_CLOUD_PLATFORM = exports.SEMRESATTRS_CLOUD_AVAILABILITY_ZONE = exports.SEMRESATTRS_CLOUD_REGION = exports.SEMRESATTRS_CLOUD_ACCOUNT_ID = exports.SEMRESATTRS_CLOUD_PROVIDER = void 0;
	exports.CLOUDPLATFORMVALUES_GCP_COMPUTE_ENGINE = exports.CLOUDPLATFORMVALUES_AZURE_APP_SERVICE = exports.CLOUDPLATFORMVALUES_AZURE_FUNCTIONS = exports.CLOUDPLATFORMVALUES_AZURE_AKS = exports.CLOUDPLATFORMVALUES_AZURE_CONTAINER_INSTANCES = exports.CLOUDPLATFORMVALUES_AZURE_VM = exports.CLOUDPLATFORMVALUES_AWS_ELASTIC_BEANSTALK = exports.CLOUDPLATFORMVALUES_AWS_LAMBDA = exports.CLOUDPLATFORMVALUES_AWS_EKS = exports.CLOUDPLATFORMVALUES_AWS_ECS = exports.CLOUDPLATFORMVALUES_AWS_EC2 = exports.CLOUDPLATFORMVALUES_ALIBABA_CLOUD_FC = exports.CLOUDPLATFORMVALUES_ALIBABA_CLOUD_ECS = exports.CloudProviderValues = exports.CLOUDPROVIDERVALUES_GCP = exports.CLOUDPROVIDERVALUES_AZURE = exports.CLOUDPROVIDERVALUES_AWS = exports.CLOUDPROVIDERVALUES_ALIBABA_CLOUD = exports.SemanticResourceAttributes = exports.SEMRESATTRS_WEBENGINE_DESCRIPTION = exports.SEMRESATTRS_WEBENGINE_VERSION = exports.SEMRESATTRS_WEBENGINE_NAME = exports.SEMRESATTRS_TELEMETRY_AUTO_VERSION = exports.SEMRESATTRS_TELEMETRY_SDK_VERSION = exports.SEMRESATTRS_TELEMETRY_SDK_LANGUAGE = exports.SEMRESATTRS_TELEMETRY_SDK_NAME = exports.SEMRESATTRS_SERVICE_VERSION = exports.SEMRESATTRS_SERVICE_INSTANCE_ID = exports.SEMRESATTRS_SERVICE_NAMESPACE = exports.SEMRESATTRS_SERVICE_NAME = exports.SEMRESATTRS_PROCESS_RUNTIME_DESCRIPTION = exports.SEMRESATTRS_PROCESS_RUNTIME_VERSION = exports.SEMRESATTRS_PROCESS_RUNTIME_NAME = exports.SEMRESATTRS_PROCESS_OWNER = exports.SEMRESATTRS_PROCESS_COMMAND_ARGS = exports.SEMRESATTRS_PROCESS_COMMAND_LINE = exports.SEMRESATTRS_PROCESS_COMMAND = exports.SEMRESATTRS_PROCESS_EXECUTABLE_PATH = exports.SEMRESATTRS_PROCESS_EXECUTABLE_NAME = exports.SEMRESATTRS_PROCESS_PID = exports.SEMRESATTRS_OS_VERSION = exports.SEMRESATTRS_OS_NAME = exports.SEMRESATTRS_OS_DESCRIPTION = exports.SEMRESATTRS_OS_TYPE = exports.SEMRESATTRS_K8S_CRONJOB_NAME = exports.SEMRESATTRS_K8S_CRONJOB_UID = exports.SEMRESATTRS_K8S_JOB_NAME = exports.SEMRESATTRS_K8S_JOB_UID = exports.SEMRESATTRS_K8S_DAEMONSET_NAME = exports.SEMRESATTRS_K8S_DAEMONSET_UID = void 0;
	exports.TelemetrySdkLanguageValues = exports.TELEMETRYSDKLANGUAGEVALUES_WEBJS = exports.TELEMETRYSDKLANGUAGEVALUES_RUBY = exports.TELEMETRYSDKLANGUAGEVALUES_PYTHON = exports.TELEMETRYSDKLANGUAGEVALUES_PHP = exports.TELEMETRYSDKLANGUAGEVALUES_NODEJS = exports.TELEMETRYSDKLANGUAGEVALUES_JAVA = exports.TELEMETRYSDKLANGUAGEVALUES_GO = exports.TELEMETRYSDKLANGUAGEVALUES_ERLANG = exports.TELEMETRYSDKLANGUAGEVALUES_DOTNET = exports.TELEMETRYSDKLANGUAGEVALUES_CPP = exports.OsTypeValues = exports.OSTYPEVALUES_Z_OS = exports.OSTYPEVALUES_SOLARIS = exports.OSTYPEVALUES_AIX = exports.OSTYPEVALUES_HPUX = exports.OSTYPEVALUES_DRAGONFLYBSD = exports.OSTYPEVALUES_OPENBSD = exports.OSTYPEVALUES_NETBSD = exports.OSTYPEVALUES_FREEBSD = exports.OSTYPEVALUES_DARWIN = exports.OSTYPEVALUES_LINUX = exports.OSTYPEVALUES_WINDOWS = exports.HostArchValues = exports.HOSTARCHVALUES_X86 = exports.HOSTARCHVALUES_PPC64 = exports.HOSTARCHVALUES_PPC32 = exports.HOSTARCHVALUES_IA64 = exports.HOSTARCHVALUES_ARM64 = exports.HOSTARCHVALUES_ARM32 = exports.HOSTARCHVALUES_AMD64 = exports.AwsEcsLaunchtypeValues = exports.AWSECSLAUNCHTYPEVALUES_FARGATE = exports.AWSECSLAUNCHTYPEVALUES_EC2 = exports.CloudPlatformValues = exports.CLOUDPLATFORMVALUES_GCP_APP_ENGINE = exports.CLOUDPLATFORMVALUES_GCP_CLOUD_FUNCTIONS = exports.CLOUDPLATFORMVALUES_GCP_KUBERNETES_ENGINE = exports.CLOUDPLATFORMVALUES_GCP_CLOUD_RUN = void 0;
	const utils_1 = require_utils();
	const TMP_CLOUD_PROVIDER = "cloud.provider";
	const TMP_CLOUD_ACCOUNT_ID = "cloud.account.id";
	const TMP_CLOUD_REGION = "cloud.region";
	const TMP_CLOUD_AVAILABILITY_ZONE = "cloud.availability_zone";
	const TMP_CLOUD_PLATFORM = "cloud.platform";
	const TMP_AWS_ECS_CONTAINER_ARN = "aws.ecs.container.arn";
	const TMP_AWS_ECS_CLUSTER_ARN = "aws.ecs.cluster.arn";
	const TMP_AWS_ECS_LAUNCHTYPE = "aws.ecs.launchtype";
	const TMP_AWS_ECS_TASK_ARN = "aws.ecs.task.arn";
	const TMP_AWS_ECS_TASK_FAMILY = "aws.ecs.task.family";
	const TMP_AWS_ECS_TASK_REVISION = "aws.ecs.task.revision";
	const TMP_AWS_EKS_CLUSTER_ARN = "aws.eks.cluster.arn";
	const TMP_AWS_LOG_GROUP_NAMES = "aws.log.group.names";
	const TMP_AWS_LOG_GROUP_ARNS = "aws.log.group.arns";
	const TMP_AWS_LOG_STREAM_NAMES = "aws.log.stream.names";
	const TMP_AWS_LOG_STREAM_ARNS = "aws.log.stream.arns";
	const TMP_CONTAINER_NAME = "container.name";
	const TMP_CONTAINER_ID = "container.id";
	const TMP_CONTAINER_RUNTIME = "container.runtime";
	const TMP_CONTAINER_IMAGE_NAME = "container.image.name";
	const TMP_CONTAINER_IMAGE_TAG = "container.image.tag";
	const TMP_DEPLOYMENT_ENVIRONMENT = "deployment.environment";
	const TMP_DEVICE_ID = "device.id";
	const TMP_DEVICE_MODEL_IDENTIFIER = "device.model.identifier";
	const TMP_DEVICE_MODEL_NAME = "device.model.name";
	const TMP_FAAS_NAME = "faas.name";
	const TMP_FAAS_ID = "faas.id";
	const TMP_FAAS_VERSION = "faas.version";
	const TMP_FAAS_INSTANCE = "faas.instance";
	const TMP_FAAS_MAX_MEMORY = "faas.max_memory";
	const TMP_HOST_ID = "host.id";
	const TMP_HOST_NAME = "host.name";
	const TMP_HOST_TYPE = "host.type";
	const TMP_HOST_ARCH = "host.arch";
	const TMP_HOST_IMAGE_NAME = "host.image.name";
	const TMP_HOST_IMAGE_ID = "host.image.id";
	const TMP_HOST_IMAGE_VERSION = "host.image.version";
	const TMP_K8S_CLUSTER_NAME = "k8s.cluster.name";
	const TMP_K8S_NODE_NAME = "k8s.node.name";
	const TMP_K8S_NODE_UID = "k8s.node.uid";
	const TMP_K8S_NAMESPACE_NAME = "k8s.namespace.name";
	const TMP_K8S_POD_UID = "k8s.pod.uid";
	const TMP_K8S_POD_NAME = "k8s.pod.name";
	const TMP_K8S_CONTAINER_NAME = "k8s.container.name";
	const TMP_K8S_REPLICASET_UID = "k8s.replicaset.uid";
	const TMP_K8S_REPLICASET_NAME = "k8s.replicaset.name";
	const TMP_K8S_DEPLOYMENT_UID = "k8s.deployment.uid";
	const TMP_K8S_DEPLOYMENT_NAME = "k8s.deployment.name";
	const TMP_K8S_STATEFULSET_UID = "k8s.statefulset.uid";
	const TMP_K8S_STATEFULSET_NAME = "k8s.statefulset.name";
	const TMP_K8S_DAEMONSET_UID = "k8s.daemonset.uid";
	const TMP_K8S_DAEMONSET_NAME = "k8s.daemonset.name";
	const TMP_K8S_JOB_UID = "k8s.job.uid";
	const TMP_K8S_JOB_NAME = "k8s.job.name";
	const TMP_K8S_CRONJOB_UID = "k8s.cronjob.uid";
	const TMP_K8S_CRONJOB_NAME = "k8s.cronjob.name";
	const TMP_OS_TYPE = "os.type";
	const TMP_OS_DESCRIPTION = "os.description";
	const TMP_OS_NAME = "os.name";
	const TMP_OS_VERSION = "os.version";
	const TMP_PROCESS_PID = "process.pid";
	const TMP_PROCESS_EXECUTABLE_NAME = "process.executable.name";
	const TMP_PROCESS_EXECUTABLE_PATH = "process.executable.path";
	const TMP_PROCESS_COMMAND = "process.command";
	const TMP_PROCESS_COMMAND_LINE = "process.command_line";
	const TMP_PROCESS_COMMAND_ARGS = "process.command_args";
	const TMP_PROCESS_OWNER = "process.owner";
	const TMP_PROCESS_RUNTIME_NAME = "process.runtime.name";
	const TMP_PROCESS_RUNTIME_VERSION = "process.runtime.version";
	const TMP_PROCESS_RUNTIME_DESCRIPTION = "process.runtime.description";
	const TMP_SERVICE_NAME = "service.name";
	const TMP_SERVICE_NAMESPACE = "service.namespace";
	const TMP_SERVICE_INSTANCE_ID = "service.instance.id";
	const TMP_SERVICE_VERSION = "service.version";
	const TMP_TELEMETRY_SDK_NAME = "telemetry.sdk.name";
	const TMP_TELEMETRY_SDK_LANGUAGE = "telemetry.sdk.language";
	const TMP_TELEMETRY_SDK_VERSION = "telemetry.sdk.version";
	const TMP_TELEMETRY_AUTO_VERSION = "telemetry.auto.version";
	const TMP_WEBENGINE_NAME = "webengine.name";
	const TMP_WEBENGINE_VERSION = "webengine.version";
	const TMP_WEBENGINE_DESCRIPTION = "webengine.description";
	/**
	* Name of the cloud provider.
	*
	* @deprecated Use ATTR_CLOUD_PROVIDER in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_CLOUD_PROVIDER = TMP_CLOUD_PROVIDER;
	/**
	* The cloud account ID the resource is assigned to.
	*
	* @deprecated Use ATTR_CLOUD_ACCOUNT_ID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_CLOUD_ACCOUNT_ID = TMP_CLOUD_ACCOUNT_ID;
	/**
	* The geographical region the resource is running. Refer to your provider&#39;s docs to see the available regions, for example [Alibaba Cloud regions](https://www.alibabacloud.com/help/doc-detail/40654.htm), [AWS regions](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/), [Azure regions](https://azure.microsoft.com/en-us/global-infrastructure/geographies/), or [Google Cloud regions](https://cloud.google.com/about/locations).
	*
	* @deprecated Use ATTR_CLOUD_REGION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_CLOUD_REGION = TMP_CLOUD_REGION;
	/**
	* Cloud regions often have multiple, isolated locations known as zones to increase availability. Availability zone represents the zone where the resource is running.
	*
	* Note: Availability zones are called &#34;zones&#34; on Alibaba Cloud and Google Cloud.
	*
	* @deprecated Use ATTR_CLOUD_AVAILABILITY_ZONE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_CLOUD_AVAILABILITY_ZONE = TMP_CLOUD_AVAILABILITY_ZONE;
	/**
	* The cloud platform in use.
	*
	* Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
	*
	* @deprecated Use ATTR_CLOUD_PLATFORM in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_CLOUD_PLATFORM = TMP_CLOUD_PLATFORM;
	/**
	* The Amazon Resource Name (ARN) of an [ECS container instance](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ECS_instances.html).
	*
	* @deprecated Use ATTR_AWS_ECS_CONTAINER_ARN in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_AWS_ECS_CONTAINER_ARN = TMP_AWS_ECS_CONTAINER_ARN;
	/**
	* The ARN of an [ECS cluster](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/clusters.html).
	*
	* @deprecated Use ATTR_AWS_ECS_CLUSTER_ARN in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_AWS_ECS_CLUSTER_ARN = TMP_AWS_ECS_CLUSTER_ARN;
	/**
	* The [launch type](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/launch_types.html) for an ECS task.
	*
	* @deprecated Use ATTR_AWS_ECS_LAUNCHTYPE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_AWS_ECS_LAUNCHTYPE = TMP_AWS_ECS_LAUNCHTYPE;
	/**
	* The ARN of an [ECS task definition](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definitions.html).
	*
	* @deprecated Use ATTR_AWS_ECS_TASK_ARN in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_AWS_ECS_TASK_ARN = TMP_AWS_ECS_TASK_ARN;
	/**
	* The task definition family this task definition is a member of.
	*
	* @deprecated Use ATTR_AWS_ECS_TASK_FAMILY in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_AWS_ECS_TASK_FAMILY = TMP_AWS_ECS_TASK_FAMILY;
	/**
	* The revision for this task definition.
	*
	* @deprecated Use ATTR_AWS_ECS_TASK_REVISION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_AWS_ECS_TASK_REVISION = TMP_AWS_ECS_TASK_REVISION;
	/**
	* The ARN of an EKS cluster.
	*
	* @deprecated Use ATTR_AWS_EKS_CLUSTER_ARN in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_AWS_EKS_CLUSTER_ARN = TMP_AWS_EKS_CLUSTER_ARN;
	/**
	* The name(s) of the AWS log group(s) an application is writing to.
	*
	* Note: Multiple log groups must be supported for cases like multi-container applications, where a single application has sidecar containers, and each write to their own log group.
	*
	* @deprecated Use ATTR_AWS_LOG_GROUP_NAMES in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_AWS_LOG_GROUP_NAMES = TMP_AWS_LOG_GROUP_NAMES;
	/**
	* The Amazon Resource Name(s) (ARN) of the AWS log group(s).
	*
	* Note: See the [log group ARN format documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/iam-access-control-overview-cwl.html#CWL_ARN_Format).
	*
	* @deprecated Use ATTR_AWS_LOG_GROUP_ARNS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_AWS_LOG_GROUP_ARNS = TMP_AWS_LOG_GROUP_ARNS;
	/**
	* The name(s) of the AWS log stream(s) an application is writing to.
	*
	* @deprecated Use ATTR_AWS_LOG_STREAM_NAMES in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_AWS_LOG_STREAM_NAMES = TMP_AWS_LOG_STREAM_NAMES;
	/**
	* The ARN(s) of the AWS log stream(s).
	*
	* Note: See the [log stream ARN format documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/iam-access-control-overview-cwl.html#CWL_ARN_Format). One log group can contain several log streams, so these ARNs necessarily identify both a log group and a log stream.
	*
	* @deprecated Use ATTR_AWS_LOG_STREAM_ARNS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_AWS_LOG_STREAM_ARNS = TMP_AWS_LOG_STREAM_ARNS;
	/**
	* Container name.
	*
	* @deprecated Use ATTR_CONTAINER_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_CONTAINER_NAME = TMP_CONTAINER_NAME;
	/**
	* Container ID. Usually a UUID, as for example used to [identify Docker containers](https://docs.docker.com/engine/reference/run/#container-identification). The UUID might be abbreviated.
	*
	* @deprecated Use ATTR_CONTAINER_ID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_CONTAINER_ID = TMP_CONTAINER_ID;
	/**
	* The container runtime managing this container.
	*
	* @deprecated Use ATTR_CONTAINER_RUNTIME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_CONTAINER_RUNTIME = TMP_CONTAINER_RUNTIME;
	/**
	* Name of the image the container was built on.
	*
	* @deprecated Use ATTR_CONTAINER_IMAGE_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_CONTAINER_IMAGE_NAME = TMP_CONTAINER_IMAGE_NAME;
	/**
	* Container image tag.
	*
	* @deprecated Use ATTR_CONTAINER_IMAGE_TAGS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_CONTAINER_IMAGE_TAG = TMP_CONTAINER_IMAGE_TAG;
	/**
	* Name of the [deployment environment](https://en.wikipedia.org/wiki/Deployment_environment) (aka deployment tier).
	*
	* @deprecated Use ATTR_DEPLOYMENT_ENVIRONMENT in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_DEPLOYMENT_ENVIRONMENT = TMP_DEPLOYMENT_ENVIRONMENT;
	/**
	* A unique identifier representing the device.
	*
	* Note: The device identifier MUST only be defined using the values outlined below. This value is not an advertising identifier and MUST NOT be used as such. On iOS (Swift or Objective-C), this value MUST be equal to the [vendor identifier](https://developer.apple.com/documentation/uikit/uidevice/1620059-identifierforvendor). On Android (Java or Kotlin), this value MUST be equal to the Firebase Installation ID or a globally unique UUID which is persisted across sessions in your application. More information can be found [here](https://developer.android.com/training/articles/user-data-ids) on best practices and exact implementation details. Caution should be taken when storing personal data or anything which can identify a user. GDPR and data protection laws may apply, ensure you do your own due diligence.
	*
	* @deprecated Use ATTR_DEVICE_ID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_DEVICE_ID = TMP_DEVICE_ID;
	/**
	* The model identifier for the device.
	*
	* Note: It&#39;s recommended this value represents a machine readable version of the model identifier rather than the market or consumer-friendly name of the device.
	*
	* @deprecated Use ATTR_DEVICE_MODEL_IDENTIFIER in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_DEVICE_MODEL_IDENTIFIER = TMP_DEVICE_MODEL_IDENTIFIER;
	/**
	* The marketing name for the device model.
	*
	* Note: It&#39;s recommended this value represents a human readable version of the device model rather than a machine readable alternative.
	*
	* @deprecated Use ATTR_DEVICE_MODEL_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_DEVICE_MODEL_NAME = TMP_DEVICE_MODEL_NAME;
	/**
	* The name of the single function that this runtime instance executes.
	*
	* Note: This is the name of the function as configured/deployed on the FaaS platform and is usually different from the name of the callback function (which may be stored in the [`code.namespace`/`code.function`](../../trace/semantic_conventions/span-general.md#source-code-attributes) span attributes).
	*
	* @deprecated Use ATTR_FAAS_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_FAAS_NAME = TMP_FAAS_NAME;
	/**
	* The unique ID of the single function that this runtime instance executes.
	*
	* Note: Depending on the cloud provider, use:
	
	* **AWS Lambda:** The function [ARN](https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html).
	Take care not to use the &#34;invoked ARN&#34; directly but replace any
	[alias suffix](https://docs.aws.amazon.com/lambda/latest/dg/configuration-aliases.html) with the resolved function version, as the same runtime instance may be invokable with multiple
	different aliases.
	* **GCP:** The [URI of the resource](https://cloud.google.com/iam/docs/full-resource-names)
	* **Azure:** The [Fully Qualified Resource ID](https://docs.microsoft.com/en-us/rest/api/resources/resources/get-by-id).
	
	On some providers, it may not be possible to determine the full ID at startup,
	which is why this field cannot be made required. For example, on AWS the account ID
	part of the ARN is not available without calling another AWS API
	which may be deemed too slow for a short-running lambda function.
	As an alternative, consider setting `faas.id` as a span attribute instead.
	*
	* @deprecated Use ATTR_CLOUD_RESOURCE_ID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_FAAS_ID = TMP_FAAS_ID;
	/**
	* The immutable version of the function being executed.
	*
	* Note: Depending on the cloud provider and platform, use:
	
	* **AWS Lambda:** The [function version](https://docs.aws.amazon.com/lambda/latest/dg/configuration-versions.html)
	(an integer represented as a decimal string).
	* **Google Cloud Run:** The [revision](https://cloud.google.com/run/docs/managing/revisions)
	(i.e., the function name plus the revision suffix).
	* **Google Cloud Functions:** The value of the
	[`K_REVISION` environment variable](https://cloud.google.com/functions/docs/env-var#runtime_environment_variables_set_automatically).
	* **Azure Functions:** Not applicable. Do not set this attribute.
	*
	* @deprecated Use ATTR_FAAS_VERSION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_FAAS_VERSION = TMP_FAAS_VERSION;
	/**
	* The execution environment ID as a string, that will be potentially reused for other invocations to the same function/function version.
	*
	* Note: * **AWS Lambda:** Use the (full) log stream name.
	*
	* @deprecated Use ATTR_FAAS_INSTANCE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_FAAS_INSTANCE = TMP_FAAS_INSTANCE;
	/**
	* The amount of memory available to the serverless function in MiB.
	*
	* Note: It&#39;s recommended to set this attribute since e.g. too little memory can easily stop a Java AWS Lambda function from working correctly. On AWS Lambda, the environment variable `AWS_LAMBDA_FUNCTION_MEMORY_SIZE` provides this information.
	*
	* @deprecated Use ATTR_FAAS_MAX_MEMORY in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_FAAS_MAX_MEMORY = TMP_FAAS_MAX_MEMORY;
	/**
	* Unique host ID. For Cloud, this must be the instance_id assigned by the cloud provider.
	*
	* @deprecated Use ATTR_HOST_ID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_HOST_ID = TMP_HOST_ID;
	/**
	* Name of the host. On Unix systems, it may contain what the hostname command returns, or the fully qualified hostname, or another name specified by the user.
	*
	* @deprecated Use ATTR_HOST_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_HOST_NAME = TMP_HOST_NAME;
	/**
	* Type of host. For Cloud, this must be the machine type.
	*
	* @deprecated Use ATTR_HOST_TYPE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_HOST_TYPE = TMP_HOST_TYPE;
	/**
	* The CPU architecture the host system is running on.
	*
	* @deprecated Use ATTR_HOST_ARCH in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_HOST_ARCH = TMP_HOST_ARCH;
	/**
	* Name of the VM image or OS install the host was instantiated from.
	*
	* @deprecated Use ATTR_HOST_IMAGE_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_HOST_IMAGE_NAME = TMP_HOST_IMAGE_NAME;
	/**
	* VM image ID. For Cloud, this value is from the provider.
	*
	* @deprecated Use ATTR_HOST_IMAGE_ID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_HOST_IMAGE_ID = TMP_HOST_IMAGE_ID;
	/**
	* The version string of the VM image as defined in [Version Attributes](README.md#version-attributes).
	*
	* @deprecated Use ATTR_HOST_IMAGE_VERSION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_HOST_IMAGE_VERSION = TMP_HOST_IMAGE_VERSION;
	/**
	* The name of the cluster.
	*
	* @deprecated Use ATTR_K8S_CLUSTER_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_K8S_CLUSTER_NAME = TMP_K8S_CLUSTER_NAME;
	/**
	* The name of the Node.
	*
	* @deprecated Use ATTR_K8S_NODE_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_K8S_NODE_NAME = TMP_K8S_NODE_NAME;
	/**
	* The UID of the Node.
	*
	* @deprecated Use ATTR_K8S_NODE_UID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_K8S_NODE_UID = TMP_K8S_NODE_UID;
	/**
	* The name of the namespace that the pod is running in.
	*
	* @deprecated Use ATTR_K8S_NAMESPACE_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_K8S_NAMESPACE_NAME = TMP_K8S_NAMESPACE_NAME;
	/**
	* The UID of the Pod.
	*
	* @deprecated Use ATTR_K8S_POD_UID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_K8S_POD_UID = TMP_K8S_POD_UID;
	/**
	* The name of the Pod.
	*
	* @deprecated Use ATTR_K8S_POD_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_K8S_POD_NAME = TMP_K8S_POD_NAME;
	/**
	* The name of the Container in a Pod template.
	*
	* @deprecated Use ATTR_K8S_CONTAINER_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_K8S_CONTAINER_NAME = TMP_K8S_CONTAINER_NAME;
	/**
	* The UID of the ReplicaSet.
	*
	* @deprecated Use ATTR_K8S_REPLICASET_UID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_K8S_REPLICASET_UID = TMP_K8S_REPLICASET_UID;
	/**
	* The name of the ReplicaSet.
	*
	* @deprecated Use ATTR_K8S_REPLICASET_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_K8S_REPLICASET_NAME = TMP_K8S_REPLICASET_NAME;
	/**
	* The UID of the Deployment.
	*
	* @deprecated Use ATTR_K8S_DEPLOYMENT_UID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_K8S_DEPLOYMENT_UID = TMP_K8S_DEPLOYMENT_UID;
	/**
	* The name of the Deployment.
	*
	* @deprecated Use ATTR_K8S_DEPLOYMENT_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_K8S_DEPLOYMENT_NAME = TMP_K8S_DEPLOYMENT_NAME;
	/**
	* The UID of the StatefulSet.
	*
	* @deprecated Use ATTR_K8S_STATEFULSET_UID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_K8S_STATEFULSET_UID = TMP_K8S_STATEFULSET_UID;
	/**
	* The name of the StatefulSet.
	*
	* @deprecated Use ATTR_K8S_STATEFULSET_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_K8S_STATEFULSET_NAME = TMP_K8S_STATEFULSET_NAME;
	/**
	* The UID of the DaemonSet.
	*
	* @deprecated Use ATTR_K8S_DAEMONSET_UID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_K8S_DAEMONSET_UID = TMP_K8S_DAEMONSET_UID;
	/**
	* The name of the DaemonSet.
	*
	* @deprecated Use ATTR_K8S_DAEMONSET_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_K8S_DAEMONSET_NAME = TMP_K8S_DAEMONSET_NAME;
	/**
	* The UID of the Job.
	*
	* @deprecated Use ATTR_K8S_JOB_UID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_K8S_JOB_UID = TMP_K8S_JOB_UID;
	/**
	* The name of the Job.
	*
	* @deprecated Use ATTR_K8S_JOB_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_K8S_JOB_NAME = TMP_K8S_JOB_NAME;
	/**
	* The UID of the CronJob.
	*
	* @deprecated Use ATTR_K8S_CRONJOB_UID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_K8S_CRONJOB_UID = TMP_K8S_CRONJOB_UID;
	/**
	* The name of the CronJob.
	*
	* @deprecated Use ATTR_K8S_CRONJOB_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_K8S_CRONJOB_NAME = TMP_K8S_CRONJOB_NAME;
	/**
	* The operating system type.
	*
	* @deprecated Use ATTR_OS_TYPE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_OS_TYPE = TMP_OS_TYPE;
	/**
	* Human readable (not intended to be parsed) OS version information, like e.g. reported by `ver` or `lsb_release -a` commands.
	*
	* @deprecated Use ATTR_OS_DESCRIPTION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_OS_DESCRIPTION = TMP_OS_DESCRIPTION;
	/**
	* Human readable operating system name.
	*
	* @deprecated Use ATTR_OS_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_OS_NAME = TMP_OS_NAME;
	/**
	* The version string of the operating system as defined in [Version Attributes](../../resource/semantic_conventions/README.md#version-attributes).
	*
	* @deprecated Use ATTR_OS_VERSION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_OS_VERSION = TMP_OS_VERSION;
	/**
	* Process identifier (PID).
	*
	* @deprecated Use ATTR_PROCESS_PID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_PROCESS_PID = TMP_PROCESS_PID;
	/**
	* The name of the process executable. On Linux based systems, can be set to the `Name` in `proc/[pid]/status`. On Windows, can be set to the base name of `GetProcessImageFileNameW`.
	*
	* @deprecated Use ATTR_PROCESS_EXECUTABLE_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_PROCESS_EXECUTABLE_NAME = TMP_PROCESS_EXECUTABLE_NAME;
	/**
	* The full path to the process executable. On Linux based systems, can be set to the target of `proc/[pid]/exe`. On Windows, can be set to the result of `GetProcessImageFileNameW`.
	*
	* @deprecated Use ATTR_PROCESS_EXECUTABLE_PATH in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_PROCESS_EXECUTABLE_PATH = TMP_PROCESS_EXECUTABLE_PATH;
	/**
	* The command used to launch the process (i.e. the command name). On Linux based systems, can be set to the zeroth string in `proc/[pid]/cmdline`. On Windows, can be set to the first parameter extracted from `GetCommandLineW`.
	*
	* @deprecated Use ATTR_PROCESS_COMMAND in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_PROCESS_COMMAND = TMP_PROCESS_COMMAND;
	/**
	* The full command used to launch the process as a single string representing the full command. On Windows, can be set to the result of `GetCommandLineW`. Do not set this if you have to assemble it just for monitoring; use `process.command_args` instead.
	*
	* @deprecated Use ATTR_PROCESS_COMMAND_LINE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_PROCESS_COMMAND_LINE = TMP_PROCESS_COMMAND_LINE;
	/**
	* All the command arguments (including the command/executable itself) as received by the process. On Linux-based systems (and some other Unixoid systems supporting procfs), can be set according to the list of null-delimited strings extracted from `proc/[pid]/cmdline`. For libc-based executables, this would be the full argv vector passed to `main`.
	*
	* @deprecated Use ATTR_PROCESS_COMMAND_ARGS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_PROCESS_COMMAND_ARGS = TMP_PROCESS_COMMAND_ARGS;
	/**
	* The username of the user that owns the process.
	*
	* @deprecated Use ATTR_PROCESS_OWNER in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_PROCESS_OWNER = TMP_PROCESS_OWNER;
	/**
	* The name of the runtime of this process. For compiled native binaries, this SHOULD be the name of the compiler.
	*
	* @deprecated Use ATTR_PROCESS_RUNTIME_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_PROCESS_RUNTIME_NAME = TMP_PROCESS_RUNTIME_NAME;
	/**
	* The version of the runtime of this process, as returned by the runtime without modification.
	*
	* @deprecated Use ATTR_PROCESS_RUNTIME_VERSION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_PROCESS_RUNTIME_VERSION = TMP_PROCESS_RUNTIME_VERSION;
	/**
	* An additional description about the runtime of the process, for example a specific vendor customization of the runtime environment.
	*
	* @deprecated Use ATTR_PROCESS_RUNTIME_DESCRIPTION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_PROCESS_RUNTIME_DESCRIPTION = TMP_PROCESS_RUNTIME_DESCRIPTION;
	/**
	* Logical name of the service.
	*
	* Note: MUST be the same for all instances of horizontally scaled services. If the value was not specified, SDKs MUST fallback to `unknown_service:` concatenated with [`process.executable.name`](process.md#process), e.g. `unknown_service:bash`. If `process.executable.name` is not available, the value MUST be set to `unknown_service`.
	*
	* @deprecated Use ATTR_SERVICE_NAME.
	*/
	exports.SEMRESATTRS_SERVICE_NAME = TMP_SERVICE_NAME;
	/**
	* A namespace for `service.name`.
	*
	* Note: A string value having a meaning that helps to distinguish a group of services, for example the team name that owns a group of services. `service.name` is expected to be unique within the same namespace. If `service.namespace` is not specified in the Resource then `service.name` is expected to be unique for all services that have no explicit namespace defined (so the empty/unspecified namespace is simply one more valid namespace). Zero-length namespace string is assumed equal to unspecified namespace.
	*
	* @deprecated Use ATTR_SERVICE_NAMESPACE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_SERVICE_NAMESPACE = TMP_SERVICE_NAMESPACE;
	/**
	* The string ID of the service instance.
	*
	* Note: MUST be unique for each instance of the same `service.namespace,service.name` pair (in other words `service.namespace,service.name,service.instance.id` triplet MUST be globally unique). The ID helps to distinguish instances of the same service that exist at the same time (e.g. instances of a horizontally scaled service). It is preferable for the ID to be persistent and stay the same for the lifetime of the service instance, however it is acceptable that the ID is ephemeral and changes during important lifetime events for the service (e.g. service restarts). If the service has no inherent unique ID that can be used as the value of this attribute it is recommended to generate a random Version 1 or Version 4 RFC 4122 UUID (services aiming for reproducible UUIDs may also use Version 5, see RFC 4122 for more recommendations).
	*
	* @deprecated Use ATTR_SERVICE_INSTANCE_ID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_SERVICE_INSTANCE_ID = TMP_SERVICE_INSTANCE_ID;
	/**
	* The version string of the service API or implementation.
	*
	* @deprecated Use ATTR_SERVICE_VERSION.
	*/
	exports.SEMRESATTRS_SERVICE_VERSION = TMP_SERVICE_VERSION;
	/**
	* The name of the telemetry SDK as defined above.
	*
	* @deprecated Use ATTR_TELEMETRY_SDK_NAME.
	*/
	exports.SEMRESATTRS_TELEMETRY_SDK_NAME = TMP_TELEMETRY_SDK_NAME;
	/**
	* The language of the telemetry SDK.
	*
	* @deprecated Use ATTR_TELEMETRY_SDK_LANGUAGE.
	*/
	exports.SEMRESATTRS_TELEMETRY_SDK_LANGUAGE = TMP_TELEMETRY_SDK_LANGUAGE;
	/**
	* The version string of the telemetry SDK.
	*
	* @deprecated Use ATTR_TELEMETRY_SDK_VERSION.
	*/
	exports.SEMRESATTRS_TELEMETRY_SDK_VERSION = TMP_TELEMETRY_SDK_VERSION;
	/**
	* The version string of the auto instrumentation agent, if used.
	*
	* @deprecated Use ATTR_TELEMETRY_DISTRO_VERSION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_TELEMETRY_AUTO_VERSION = TMP_TELEMETRY_AUTO_VERSION;
	/**
	* The name of the web engine.
	*
	* @deprecated Use ATTR_WEBENGINE_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_WEBENGINE_NAME = TMP_WEBENGINE_NAME;
	/**
	* The version of the web engine.
	*
	* @deprecated Use ATTR_WEBENGINE_VERSION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_WEBENGINE_VERSION = TMP_WEBENGINE_VERSION;
	/**
	* Additional description of the web engine (e.g. detailed version and edition information).
	*
	* @deprecated Use ATTR_WEBENGINE_DESCRIPTION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_WEBENGINE_DESCRIPTION = TMP_WEBENGINE_DESCRIPTION;
	/**
	* Create exported Value Map for SemanticResourceAttributes values
	* @deprecated Use the SEMRESATTRS_XXXXX constants rather than the SemanticResourceAttributes.XXXXX for bundle minification
	*/
	exports.SemanticResourceAttributes = /*#__PURE__*/ (0, utils_1.createConstMap)([
		TMP_CLOUD_PROVIDER,
		TMP_CLOUD_ACCOUNT_ID,
		TMP_CLOUD_REGION,
		TMP_CLOUD_AVAILABILITY_ZONE,
		TMP_CLOUD_PLATFORM,
		TMP_AWS_ECS_CONTAINER_ARN,
		TMP_AWS_ECS_CLUSTER_ARN,
		TMP_AWS_ECS_LAUNCHTYPE,
		TMP_AWS_ECS_TASK_ARN,
		TMP_AWS_ECS_TASK_FAMILY,
		TMP_AWS_ECS_TASK_REVISION,
		TMP_AWS_EKS_CLUSTER_ARN,
		TMP_AWS_LOG_GROUP_NAMES,
		TMP_AWS_LOG_GROUP_ARNS,
		TMP_AWS_LOG_STREAM_NAMES,
		TMP_AWS_LOG_STREAM_ARNS,
		TMP_CONTAINER_NAME,
		TMP_CONTAINER_ID,
		TMP_CONTAINER_RUNTIME,
		TMP_CONTAINER_IMAGE_NAME,
		TMP_CONTAINER_IMAGE_TAG,
		TMP_DEPLOYMENT_ENVIRONMENT,
		TMP_DEVICE_ID,
		TMP_DEVICE_MODEL_IDENTIFIER,
		TMP_DEVICE_MODEL_NAME,
		TMP_FAAS_NAME,
		TMP_FAAS_ID,
		TMP_FAAS_VERSION,
		TMP_FAAS_INSTANCE,
		TMP_FAAS_MAX_MEMORY,
		TMP_HOST_ID,
		TMP_HOST_NAME,
		TMP_HOST_TYPE,
		TMP_HOST_ARCH,
		TMP_HOST_IMAGE_NAME,
		TMP_HOST_IMAGE_ID,
		TMP_HOST_IMAGE_VERSION,
		TMP_K8S_CLUSTER_NAME,
		TMP_K8S_NODE_NAME,
		TMP_K8S_NODE_UID,
		TMP_K8S_NAMESPACE_NAME,
		TMP_K8S_POD_UID,
		TMP_K8S_POD_NAME,
		TMP_K8S_CONTAINER_NAME,
		TMP_K8S_REPLICASET_UID,
		TMP_K8S_REPLICASET_NAME,
		TMP_K8S_DEPLOYMENT_UID,
		TMP_K8S_DEPLOYMENT_NAME,
		TMP_K8S_STATEFULSET_UID,
		TMP_K8S_STATEFULSET_NAME,
		TMP_K8S_DAEMONSET_UID,
		TMP_K8S_DAEMONSET_NAME,
		TMP_K8S_JOB_UID,
		TMP_K8S_JOB_NAME,
		TMP_K8S_CRONJOB_UID,
		TMP_K8S_CRONJOB_NAME,
		TMP_OS_TYPE,
		TMP_OS_DESCRIPTION,
		TMP_OS_NAME,
		TMP_OS_VERSION,
		TMP_PROCESS_PID,
		TMP_PROCESS_EXECUTABLE_NAME,
		TMP_PROCESS_EXECUTABLE_PATH,
		TMP_PROCESS_COMMAND,
		TMP_PROCESS_COMMAND_LINE,
		TMP_PROCESS_COMMAND_ARGS,
		TMP_PROCESS_OWNER,
		TMP_PROCESS_RUNTIME_NAME,
		TMP_PROCESS_RUNTIME_VERSION,
		TMP_PROCESS_RUNTIME_DESCRIPTION,
		TMP_SERVICE_NAME,
		TMP_SERVICE_NAMESPACE,
		TMP_SERVICE_INSTANCE_ID,
		TMP_SERVICE_VERSION,
		TMP_TELEMETRY_SDK_NAME,
		TMP_TELEMETRY_SDK_LANGUAGE,
		TMP_TELEMETRY_SDK_VERSION,
		TMP_TELEMETRY_AUTO_VERSION,
		TMP_WEBENGINE_NAME,
		TMP_WEBENGINE_VERSION,
		TMP_WEBENGINE_DESCRIPTION
	]);
	const TMP_CLOUDPROVIDERVALUES_ALIBABA_CLOUD = "alibaba_cloud";
	const TMP_CLOUDPROVIDERVALUES_AWS = "aws";
	const TMP_CLOUDPROVIDERVALUES_AZURE = "azure";
	const TMP_CLOUDPROVIDERVALUES_GCP = "gcp";
	/**
	* Name of the cloud provider.
	*
	* @deprecated Use CLOUD_PROVIDER_VALUE_ALIBABA_CLOUD in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPROVIDERVALUES_ALIBABA_CLOUD = TMP_CLOUDPROVIDERVALUES_ALIBABA_CLOUD;
	/**
	* Name of the cloud provider.
	*
	* @deprecated Use CLOUD_PROVIDER_VALUE_AWS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPROVIDERVALUES_AWS = TMP_CLOUDPROVIDERVALUES_AWS;
	/**
	* Name of the cloud provider.
	*
	* @deprecated Use CLOUD_PROVIDER_VALUE_AZURE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPROVIDERVALUES_AZURE = TMP_CLOUDPROVIDERVALUES_AZURE;
	/**
	* Name of the cloud provider.
	*
	* @deprecated Use CLOUD_PROVIDER_VALUE_GCP in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPROVIDERVALUES_GCP = TMP_CLOUDPROVIDERVALUES_GCP;
	/**
	* The constant map of values for CloudProviderValues.
	* @deprecated Use the CLOUDPROVIDERVALUES_XXXXX constants rather than the CloudProviderValues.XXXXX for bundle minification.
	*/
	exports.CloudProviderValues = /*#__PURE__*/ (0, utils_1.createConstMap)([
		TMP_CLOUDPROVIDERVALUES_ALIBABA_CLOUD,
		TMP_CLOUDPROVIDERVALUES_AWS,
		TMP_CLOUDPROVIDERVALUES_AZURE,
		TMP_CLOUDPROVIDERVALUES_GCP
	]);
	const TMP_CLOUDPLATFORMVALUES_ALIBABA_CLOUD_ECS = "alibaba_cloud_ecs";
	const TMP_CLOUDPLATFORMVALUES_ALIBABA_CLOUD_FC = "alibaba_cloud_fc";
	const TMP_CLOUDPLATFORMVALUES_AWS_EC2 = "aws_ec2";
	const TMP_CLOUDPLATFORMVALUES_AWS_ECS = "aws_ecs";
	const TMP_CLOUDPLATFORMVALUES_AWS_EKS = "aws_eks";
	const TMP_CLOUDPLATFORMVALUES_AWS_LAMBDA = "aws_lambda";
	const TMP_CLOUDPLATFORMVALUES_AWS_ELASTIC_BEANSTALK = "aws_elastic_beanstalk";
	const TMP_CLOUDPLATFORMVALUES_AZURE_VM = "azure_vm";
	const TMP_CLOUDPLATFORMVALUES_AZURE_CONTAINER_INSTANCES = "azure_container_instances";
	const TMP_CLOUDPLATFORMVALUES_AZURE_AKS = "azure_aks";
	const TMP_CLOUDPLATFORMVALUES_AZURE_FUNCTIONS = "azure_functions";
	const TMP_CLOUDPLATFORMVALUES_AZURE_APP_SERVICE = "azure_app_service";
	const TMP_CLOUDPLATFORMVALUES_GCP_COMPUTE_ENGINE = "gcp_compute_engine";
	const TMP_CLOUDPLATFORMVALUES_GCP_CLOUD_RUN = "gcp_cloud_run";
	const TMP_CLOUDPLATFORMVALUES_GCP_KUBERNETES_ENGINE = "gcp_kubernetes_engine";
	const TMP_CLOUDPLATFORMVALUES_GCP_CLOUD_FUNCTIONS = "gcp_cloud_functions";
	const TMP_CLOUDPLATFORMVALUES_GCP_APP_ENGINE = "gcp_app_engine";
	/**
	* The cloud platform in use.
	*
	* Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
	*
	* @deprecated Use CLOUD_PLATFORM_VALUE_ALIBABA_CLOUD_ECS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPLATFORMVALUES_ALIBABA_CLOUD_ECS = TMP_CLOUDPLATFORMVALUES_ALIBABA_CLOUD_ECS;
	/**
	* The cloud platform in use.
	*
	* Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
	*
	* @deprecated Use CLOUD_PLATFORM_VALUE_ALIBABA_CLOUD_FC in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPLATFORMVALUES_ALIBABA_CLOUD_FC = TMP_CLOUDPLATFORMVALUES_ALIBABA_CLOUD_FC;
	/**
	* The cloud platform in use.
	*
	* Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
	*
	* @deprecated Use CLOUD_PLATFORM_VALUE_AWS_EC2 in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPLATFORMVALUES_AWS_EC2 = TMP_CLOUDPLATFORMVALUES_AWS_EC2;
	/**
	* The cloud platform in use.
	*
	* Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
	*
	* @deprecated Use CLOUD_PLATFORM_VALUE_AWS_ECS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPLATFORMVALUES_AWS_ECS = TMP_CLOUDPLATFORMVALUES_AWS_ECS;
	/**
	* The cloud platform in use.
	*
	* Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
	*
	* @deprecated Use CLOUD_PLATFORM_VALUE_AWS_EKS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPLATFORMVALUES_AWS_EKS = TMP_CLOUDPLATFORMVALUES_AWS_EKS;
	/**
	* The cloud platform in use.
	*
	* Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
	*
	* @deprecated Use CLOUD_PLATFORM_VALUE_AWS_LAMBDA in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPLATFORMVALUES_AWS_LAMBDA = TMP_CLOUDPLATFORMVALUES_AWS_LAMBDA;
	/**
	* The cloud platform in use.
	*
	* Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
	*
	* @deprecated Use CLOUD_PLATFORM_VALUE_AWS_ELASTIC_BEANSTALK in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPLATFORMVALUES_AWS_ELASTIC_BEANSTALK = TMP_CLOUDPLATFORMVALUES_AWS_ELASTIC_BEANSTALK;
	/**
	* The cloud platform in use.
	*
	* Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
	*
	* @deprecated Use CLOUD_PLATFORM_VALUE_AZURE_VM in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPLATFORMVALUES_AZURE_VM = TMP_CLOUDPLATFORMVALUES_AZURE_VM;
	/**
	* The cloud platform in use.
	*
	* Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
	*
	* @deprecated Use CLOUD_PLATFORM_VALUE_AZURE_CONTAINER_INSTANCES in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPLATFORMVALUES_AZURE_CONTAINER_INSTANCES = TMP_CLOUDPLATFORMVALUES_AZURE_CONTAINER_INSTANCES;
	/**
	* The cloud platform in use.
	*
	* Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
	*
	* @deprecated Use CLOUD_PLATFORM_VALUE_AZURE_AKS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPLATFORMVALUES_AZURE_AKS = TMP_CLOUDPLATFORMVALUES_AZURE_AKS;
	/**
	* The cloud platform in use.
	*
	* Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
	*
	* @deprecated Use CLOUD_PLATFORM_VALUE_AZURE_FUNCTIONS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPLATFORMVALUES_AZURE_FUNCTIONS = TMP_CLOUDPLATFORMVALUES_AZURE_FUNCTIONS;
	/**
	* The cloud platform in use.
	*
	* Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
	*
	* @deprecated Use CLOUD_PLATFORM_VALUE_AZURE_APP_SERVICE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPLATFORMVALUES_AZURE_APP_SERVICE = TMP_CLOUDPLATFORMVALUES_AZURE_APP_SERVICE;
	/**
	* The cloud platform in use.
	*
	* Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
	*
	* @deprecated Use CLOUD_PLATFORM_VALUE_GCP_COMPUTE_ENGINE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPLATFORMVALUES_GCP_COMPUTE_ENGINE = TMP_CLOUDPLATFORMVALUES_GCP_COMPUTE_ENGINE;
	/**
	* The cloud platform in use.
	*
	* Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
	*
	* @deprecated Use CLOUD_PLATFORM_VALUE_GCP_CLOUD_RUN in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPLATFORMVALUES_GCP_CLOUD_RUN = TMP_CLOUDPLATFORMVALUES_GCP_CLOUD_RUN;
	/**
	* The cloud platform in use.
	*
	* Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
	*
	* @deprecated Use CLOUD_PLATFORM_VALUE_GCP_KUBERNETES_ENGINE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPLATFORMVALUES_GCP_KUBERNETES_ENGINE = TMP_CLOUDPLATFORMVALUES_GCP_KUBERNETES_ENGINE;
	/**
	* The cloud platform in use.
	*
	* Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
	*
	* @deprecated Use CLOUD_PLATFORM_VALUE_GCP_CLOUD_FUNCTIONS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPLATFORMVALUES_GCP_CLOUD_FUNCTIONS = TMP_CLOUDPLATFORMVALUES_GCP_CLOUD_FUNCTIONS;
	/**
	* The cloud platform in use.
	*
	* Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
	*
	* @deprecated Use CLOUD_PLATFORM_VALUE_GCP_APP_ENGINE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPLATFORMVALUES_GCP_APP_ENGINE = TMP_CLOUDPLATFORMVALUES_GCP_APP_ENGINE;
	/**
	* The constant map of values for CloudPlatformValues.
	* @deprecated Use the CLOUDPLATFORMVALUES_XXXXX constants rather than the CloudPlatformValues.XXXXX for bundle minification.
	*/
	exports.CloudPlatformValues = /*#__PURE__*/ (0, utils_1.createConstMap)([
		TMP_CLOUDPLATFORMVALUES_ALIBABA_CLOUD_ECS,
		TMP_CLOUDPLATFORMVALUES_ALIBABA_CLOUD_FC,
		TMP_CLOUDPLATFORMVALUES_AWS_EC2,
		TMP_CLOUDPLATFORMVALUES_AWS_ECS,
		TMP_CLOUDPLATFORMVALUES_AWS_EKS,
		TMP_CLOUDPLATFORMVALUES_AWS_LAMBDA,
		TMP_CLOUDPLATFORMVALUES_AWS_ELASTIC_BEANSTALK,
		TMP_CLOUDPLATFORMVALUES_AZURE_VM,
		TMP_CLOUDPLATFORMVALUES_AZURE_CONTAINER_INSTANCES,
		TMP_CLOUDPLATFORMVALUES_AZURE_AKS,
		TMP_CLOUDPLATFORMVALUES_AZURE_FUNCTIONS,
		TMP_CLOUDPLATFORMVALUES_AZURE_APP_SERVICE,
		TMP_CLOUDPLATFORMVALUES_GCP_COMPUTE_ENGINE,
		TMP_CLOUDPLATFORMVALUES_GCP_CLOUD_RUN,
		TMP_CLOUDPLATFORMVALUES_GCP_KUBERNETES_ENGINE,
		TMP_CLOUDPLATFORMVALUES_GCP_CLOUD_FUNCTIONS,
		TMP_CLOUDPLATFORMVALUES_GCP_APP_ENGINE
	]);
	const TMP_AWSECSLAUNCHTYPEVALUES_EC2 = "ec2";
	const TMP_AWSECSLAUNCHTYPEVALUES_FARGATE = "fargate";
	/**
	* The [launch type](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/launch_types.html) for an ECS task.
	*
	* @deprecated Use AWS_ECS_LAUNCHTYPE_VALUE_EC2 in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.AWSECSLAUNCHTYPEVALUES_EC2 = TMP_AWSECSLAUNCHTYPEVALUES_EC2;
	/**
	* The [launch type](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/launch_types.html) for an ECS task.
	*
	* @deprecated Use AWS_ECS_LAUNCHTYPE_VALUE_FARGATE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.AWSECSLAUNCHTYPEVALUES_FARGATE = TMP_AWSECSLAUNCHTYPEVALUES_FARGATE;
	/**
	* The constant map of values for AwsEcsLaunchtypeValues.
	* @deprecated Use the AWSECSLAUNCHTYPEVALUES_XXXXX constants rather than the AwsEcsLaunchtypeValues.XXXXX for bundle minification.
	*/
	exports.AwsEcsLaunchtypeValues = /*#__PURE__*/ (0, utils_1.createConstMap)([TMP_AWSECSLAUNCHTYPEVALUES_EC2, TMP_AWSECSLAUNCHTYPEVALUES_FARGATE]);
	const TMP_HOSTARCHVALUES_AMD64 = "amd64";
	const TMP_HOSTARCHVALUES_ARM32 = "arm32";
	const TMP_HOSTARCHVALUES_ARM64 = "arm64";
	const TMP_HOSTARCHVALUES_IA64 = "ia64";
	const TMP_HOSTARCHVALUES_PPC32 = "ppc32";
	const TMP_HOSTARCHVALUES_PPC64 = "ppc64";
	const TMP_HOSTARCHVALUES_X86 = "x86";
	/**
	* The CPU architecture the host system is running on.
	*
	* @deprecated Use HOST_ARCH_VALUE_AMD64 in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.HOSTARCHVALUES_AMD64 = TMP_HOSTARCHVALUES_AMD64;
	/**
	* The CPU architecture the host system is running on.
	*
	* @deprecated Use HOST_ARCH_VALUE_ARM32 in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.HOSTARCHVALUES_ARM32 = TMP_HOSTARCHVALUES_ARM32;
	/**
	* The CPU architecture the host system is running on.
	*
	* @deprecated Use HOST_ARCH_VALUE_ARM64 in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.HOSTARCHVALUES_ARM64 = TMP_HOSTARCHVALUES_ARM64;
	/**
	* The CPU architecture the host system is running on.
	*
	* @deprecated Use HOST_ARCH_VALUE_IA64 in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.HOSTARCHVALUES_IA64 = TMP_HOSTARCHVALUES_IA64;
	/**
	* The CPU architecture the host system is running on.
	*
	* @deprecated Use HOST_ARCH_VALUE_PPC32 in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.HOSTARCHVALUES_PPC32 = TMP_HOSTARCHVALUES_PPC32;
	/**
	* The CPU architecture the host system is running on.
	*
	* @deprecated Use HOST_ARCH_VALUE_PPC64 in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.HOSTARCHVALUES_PPC64 = TMP_HOSTARCHVALUES_PPC64;
	/**
	* The CPU architecture the host system is running on.
	*
	* @deprecated Use HOST_ARCH_VALUE_X86 in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.HOSTARCHVALUES_X86 = TMP_HOSTARCHVALUES_X86;
	/**
	* The constant map of values for HostArchValues.
	* @deprecated Use the HOSTARCHVALUES_XXXXX constants rather than the HostArchValues.XXXXX for bundle minification.
	*/
	exports.HostArchValues = /*#__PURE__*/ (0, utils_1.createConstMap)([
		TMP_HOSTARCHVALUES_AMD64,
		TMP_HOSTARCHVALUES_ARM32,
		TMP_HOSTARCHVALUES_ARM64,
		TMP_HOSTARCHVALUES_IA64,
		TMP_HOSTARCHVALUES_PPC32,
		TMP_HOSTARCHVALUES_PPC64,
		TMP_HOSTARCHVALUES_X86
	]);
	const TMP_OSTYPEVALUES_WINDOWS = "windows";
	const TMP_OSTYPEVALUES_LINUX = "linux";
	const TMP_OSTYPEVALUES_DARWIN = "darwin";
	const TMP_OSTYPEVALUES_FREEBSD = "freebsd";
	const TMP_OSTYPEVALUES_NETBSD = "netbsd";
	const TMP_OSTYPEVALUES_OPENBSD = "openbsd";
	const TMP_OSTYPEVALUES_DRAGONFLYBSD = "dragonflybsd";
	const TMP_OSTYPEVALUES_HPUX = "hpux";
	const TMP_OSTYPEVALUES_AIX = "aix";
	const TMP_OSTYPEVALUES_SOLARIS = "solaris";
	const TMP_OSTYPEVALUES_Z_OS = "z_os";
	/**
	* The operating system type.
	*
	* @deprecated Use OS_TYPE_VALUE_WINDOWS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.OSTYPEVALUES_WINDOWS = TMP_OSTYPEVALUES_WINDOWS;
	/**
	* The operating system type.
	*
	* @deprecated Use OS_TYPE_VALUE_LINUX in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.OSTYPEVALUES_LINUX = TMP_OSTYPEVALUES_LINUX;
	/**
	* The operating system type.
	*
	* @deprecated Use OS_TYPE_VALUE_DARWIN in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.OSTYPEVALUES_DARWIN = TMP_OSTYPEVALUES_DARWIN;
	/**
	* The operating system type.
	*
	* @deprecated Use OS_TYPE_VALUE_FREEBSD in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.OSTYPEVALUES_FREEBSD = TMP_OSTYPEVALUES_FREEBSD;
	/**
	* The operating system type.
	*
	* @deprecated Use OS_TYPE_VALUE_NETBSD in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.OSTYPEVALUES_NETBSD = TMP_OSTYPEVALUES_NETBSD;
	/**
	* The operating system type.
	*
	* @deprecated Use OS_TYPE_VALUE_OPENBSD in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.OSTYPEVALUES_OPENBSD = TMP_OSTYPEVALUES_OPENBSD;
	/**
	* The operating system type.
	*
	* @deprecated Use OS_TYPE_VALUE_DRAGONFLYBSD in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.OSTYPEVALUES_DRAGONFLYBSD = TMP_OSTYPEVALUES_DRAGONFLYBSD;
	/**
	* The operating system type.
	*
	* @deprecated Use OS_TYPE_VALUE_HPUX in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.OSTYPEVALUES_HPUX = TMP_OSTYPEVALUES_HPUX;
	/**
	* The operating system type.
	*
	* @deprecated Use OS_TYPE_VALUE_AIX in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.OSTYPEVALUES_AIX = TMP_OSTYPEVALUES_AIX;
	/**
	* The operating system type.
	*
	* @deprecated Use OS_TYPE_VALUE_SOLARIS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.OSTYPEVALUES_SOLARIS = TMP_OSTYPEVALUES_SOLARIS;
	/**
	* The operating system type.
	*
	* @deprecated Use OS_TYPE_VALUE_Z_OS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.OSTYPEVALUES_Z_OS = TMP_OSTYPEVALUES_Z_OS;
	/**
	* The constant map of values for OsTypeValues.
	* @deprecated Use the OSTYPEVALUES_XXXXX constants rather than the OsTypeValues.XXXXX for bundle minification.
	*/
	exports.OsTypeValues = /*#__PURE__*/ (0, utils_1.createConstMap)([
		TMP_OSTYPEVALUES_WINDOWS,
		TMP_OSTYPEVALUES_LINUX,
		TMP_OSTYPEVALUES_DARWIN,
		TMP_OSTYPEVALUES_FREEBSD,
		TMP_OSTYPEVALUES_NETBSD,
		TMP_OSTYPEVALUES_OPENBSD,
		TMP_OSTYPEVALUES_DRAGONFLYBSD,
		TMP_OSTYPEVALUES_HPUX,
		TMP_OSTYPEVALUES_AIX,
		TMP_OSTYPEVALUES_SOLARIS,
		TMP_OSTYPEVALUES_Z_OS
	]);
	const TMP_TELEMETRYSDKLANGUAGEVALUES_CPP = "cpp";
	const TMP_TELEMETRYSDKLANGUAGEVALUES_DOTNET = "dotnet";
	const TMP_TELEMETRYSDKLANGUAGEVALUES_ERLANG = "erlang";
	const TMP_TELEMETRYSDKLANGUAGEVALUES_GO = "go";
	const TMP_TELEMETRYSDKLANGUAGEVALUES_JAVA = "java";
	const TMP_TELEMETRYSDKLANGUAGEVALUES_NODEJS = "nodejs";
	const TMP_TELEMETRYSDKLANGUAGEVALUES_PHP = "php";
	const TMP_TELEMETRYSDKLANGUAGEVALUES_PYTHON = "python";
	const TMP_TELEMETRYSDKLANGUAGEVALUES_RUBY = "ruby";
	const TMP_TELEMETRYSDKLANGUAGEVALUES_WEBJS = "webjs";
	/**
	* The language of the telemetry SDK.
	*
	* @deprecated Use TELEMETRY_SDK_LANGUAGE_VALUE_CPP.
	*/
	exports.TELEMETRYSDKLANGUAGEVALUES_CPP = TMP_TELEMETRYSDKLANGUAGEVALUES_CPP;
	/**
	* The language of the telemetry SDK.
	*
	* @deprecated Use TELEMETRY_SDK_LANGUAGE_VALUE_DOTNET.
	*/
	exports.TELEMETRYSDKLANGUAGEVALUES_DOTNET = TMP_TELEMETRYSDKLANGUAGEVALUES_DOTNET;
	/**
	* The language of the telemetry SDK.
	*
	* @deprecated Use TELEMETRY_SDK_LANGUAGE_VALUE_ERLANG.
	*/
	exports.TELEMETRYSDKLANGUAGEVALUES_ERLANG = TMP_TELEMETRYSDKLANGUAGEVALUES_ERLANG;
	/**
	* The language of the telemetry SDK.
	*
	* @deprecated Use TELEMETRY_SDK_LANGUAGE_VALUE_GO.
	*/
	exports.TELEMETRYSDKLANGUAGEVALUES_GO = TMP_TELEMETRYSDKLANGUAGEVALUES_GO;
	/**
	* The language of the telemetry SDK.
	*
	* @deprecated Use TELEMETRY_SDK_LANGUAGE_VALUE_JAVA.
	*/
	exports.TELEMETRYSDKLANGUAGEVALUES_JAVA = TMP_TELEMETRYSDKLANGUAGEVALUES_JAVA;
	/**
	* The language of the telemetry SDK.
	*
	* @deprecated Use TELEMETRY_SDK_LANGUAGE_VALUE_NODEJS.
	*/
	exports.TELEMETRYSDKLANGUAGEVALUES_NODEJS = TMP_TELEMETRYSDKLANGUAGEVALUES_NODEJS;
	/**
	* The language of the telemetry SDK.
	*
	* @deprecated Use TELEMETRY_SDK_LANGUAGE_VALUE_PHP.
	*/
	exports.TELEMETRYSDKLANGUAGEVALUES_PHP = TMP_TELEMETRYSDKLANGUAGEVALUES_PHP;
	/**
	* The language of the telemetry SDK.
	*
	* @deprecated Use TELEMETRY_SDK_LANGUAGE_VALUE_PYTHON.
	*/
	exports.TELEMETRYSDKLANGUAGEVALUES_PYTHON = TMP_TELEMETRYSDKLANGUAGEVALUES_PYTHON;
	/**
	* The language of the telemetry SDK.
	*
	* @deprecated Use TELEMETRY_SDK_LANGUAGE_VALUE_RUBY.
	*/
	exports.TELEMETRYSDKLANGUAGEVALUES_RUBY = TMP_TELEMETRYSDKLANGUAGEVALUES_RUBY;
	/**
	* The language of the telemetry SDK.
	*
	* @deprecated Use TELEMETRY_SDK_LANGUAGE_VALUE_WEBJS.
	*/
	exports.TELEMETRYSDKLANGUAGEVALUES_WEBJS = TMP_TELEMETRYSDKLANGUAGEVALUES_WEBJS;
	/**
	* The constant map of values for TelemetrySdkLanguageValues.
	* @deprecated Use the TELEMETRYSDKLANGUAGEVALUES_XXXXX constants rather than the TelemetrySdkLanguageValues.XXXXX for bundle minification.
	*/
	exports.TelemetrySdkLanguageValues = /*#__PURE__*/ (0, utils_1.createConstMap)([
		TMP_TELEMETRYSDKLANGUAGEVALUES_CPP,
		TMP_TELEMETRYSDKLANGUAGEVALUES_DOTNET,
		TMP_TELEMETRYSDKLANGUAGEVALUES_ERLANG,
		TMP_TELEMETRYSDKLANGUAGEVALUES_GO,
		TMP_TELEMETRYSDKLANGUAGEVALUES_JAVA,
		TMP_TELEMETRYSDKLANGUAGEVALUES_NODEJS,
		TMP_TELEMETRYSDKLANGUAGEVALUES_PHP,
		TMP_TELEMETRYSDKLANGUAGEVALUES_PYTHON,
		TMP_TELEMETRYSDKLANGUAGEVALUES_RUBY,
		TMP_TELEMETRYSDKLANGUAGEVALUES_WEBJS
	]);
}));
//#endregion
//#region node_modules/@opentelemetry/semantic-conventions/build/src/resource/index.js
var require_resource = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$2) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$2, p)) __createBinding(exports$2, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(require_SemanticResourceAttributes(), exports);
}));
//#endregion
//#region node_modules/@opentelemetry/semantic-conventions/build/src/stable_attributes.js
var require_stable_attributes = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ATTR_ERROR_TYPE = exports.DOTNET_GC_HEAP_GENERATION_VALUE_POH = exports.DOTNET_GC_HEAP_GENERATION_VALUE_LOH = exports.DOTNET_GC_HEAP_GENERATION_VALUE_GEN2 = exports.DOTNET_GC_HEAP_GENERATION_VALUE_GEN1 = exports.DOTNET_GC_HEAP_GENERATION_VALUE_GEN0 = exports.ATTR_DOTNET_GC_HEAP_GENERATION = exports.DEPLOYMENT_ENVIRONMENT_NAME_VALUE_TEST = exports.DEPLOYMENT_ENVIRONMENT_NAME_VALUE_STAGING = exports.DEPLOYMENT_ENVIRONMENT_NAME_VALUE_PRODUCTION = exports.DEPLOYMENT_ENVIRONMENT_NAME_VALUE_DEVELOPMENT = exports.ATTR_DEPLOYMENT_ENVIRONMENT_NAME = exports.DB_SYSTEM_NAME_VALUE_POSTGRESQL = exports.DB_SYSTEM_NAME_VALUE_MYSQL = exports.DB_SYSTEM_NAME_VALUE_MICROSOFT_SQL_SERVER = exports.DB_SYSTEM_NAME_VALUE_MARIADB = exports.ATTR_DB_SYSTEM_NAME = exports.ATTR_DB_STORED_PROCEDURE_NAME = exports.ATTR_DB_RESPONSE_STATUS_CODE = exports.ATTR_DB_QUERY_TEXT = exports.ATTR_DB_QUERY_SUMMARY = exports.ATTR_DB_OPERATION_NAME = exports.ATTR_DB_OPERATION_BATCH_SIZE = exports.ATTR_DB_NAMESPACE = exports.ATTR_DB_COLLECTION_NAME = exports.ATTR_CODE_STACKTRACE = exports.ATTR_CODE_LINE_NUMBER = exports.ATTR_CODE_FUNCTION_NAME = exports.ATTR_CODE_FILE_PATH = exports.ATTR_CODE_COLUMN_NUMBER = exports.ATTR_CLIENT_PORT = exports.ATTR_CLIENT_ADDRESS = exports.ATTR_ASPNETCORE_USER_IS_AUTHENTICATED = exports.ASPNETCORE_ROUTING_MATCH_STATUS_VALUE_SUCCESS = exports.ASPNETCORE_ROUTING_MATCH_STATUS_VALUE_FAILURE = exports.ATTR_ASPNETCORE_ROUTING_MATCH_STATUS = exports.ATTR_ASPNETCORE_ROUTING_IS_FALLBACK = exports.ATTR_ASPNETCORE_REQUEST_IS_UNHANDLED = exports.ASPNETCORE_RATE_LIMITING_RESULT_VALUE_REQUEST_CANCELED = exports.ASPNETCORE_RATE_LIMITING_RESULT_VALUE_GLOBAL_LIMITER = exports.ASPNETCORE_RATE_LIMITING_RESULT_VALUE_ENDPOINT_LIMITER = exports.ASPNETCORE_RATE_LIMITING_RESULT_VALUE_ACQUIRED = exports.ATTR_ASPNETCORE_RATE_LIMITING_RESULT = exports.ATTR_ASPNETCORE_RATE_LIMITING_POLICY = exports.ATTR_ASPNETCORE_DIAGNOSTICS_HANDLER_TYPE = exports.ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_UNHANDLED = exports.ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_SKIPPED = exports.ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_HANDLED = exports.ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_ABORTED = exports.ATTR_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT = void 0;
	exports.NETWORK_TYPE_VALUE_IPV4 = exports.ATTR_NETWORK_TYPE = exports.NETWORK_TRANSPORT_VALUE_UNIX = exports.NETWORK_TRANSPORT_VALUE_UDP = exports.NETWORK_TRANSPORT_VALUE_TCP = exports.NETWORK_TRANSPORT_VALUE_QUIC = exports.NETWORK_TRANSPORT_VALUE_PIPE = exports.ATTR_NETWORK_TRANSPORT = exports.ATTR_NETWORK_PROTOCOL_VERSION = exports.ATTR_NETWORK_PROTOCOL_NAME = exports.ATTR_NETWORK_PEER_PORT = exports.ATTR_NETWORK_PEER_ADDRESS = exports.ATTR_NETWORK_LOCAL_PORT = exports.ATTR_NETWORK_LOCAL_ADDRESS = exports.JVM_THREAD_STATE_VALUE_WAITING = exports.JVM_THREAD_STATE_VALUE_TIMED_WAITING = exports.JVM_THREAD_STATE_VALUE_TERMINATED = exports.JVM_THREAD_STATE_VALUE_RUNNABLE = exports.JVM_THREAD_STATE_VALUE_NEW = exports.JVM_THREAD_STATE_VALUE_BLOCKED = exports.ATTR_JVM_THREAD_STATE = exports.ATTR_JVM_THREAD_DAEMON = exports.JVM_MEMORY_TYPE_VALUE_NON_HEAP = exports.JVM_MEMORY_TYPE_VALUE_HEAP = exports.ATTR_JVM_MEMORY_TYPE = exports.ATTR_JVM_MEMORY_POOL_NAME = exports.ATTR_JVM_GC_NAME = exports.ATTR_JVM_GC_ACTION = exports.ATTR_HTTP_ROUTE = exports.ATTR_HTTP_RESPONSE_STATUS_CODE = exports.ATTR_HTTP_RESPONSE_HEADER = exports.ATTR_HTTP_REQUEST_RESEND_COUNT = exports.ATTR_HTTP_REQUEST_METHOD_ORIGINAL = exports.HTTP_REQUEST_METHOD_VALUE_TRACE = exports.HTTP_REQUEST_METHOD_VALUE_PUT = exports.HTTP_REQUEST_METHOD_VALUE_POST = exports.HTTP_REQUEST_METHOD_VALUE_PATCH = exports.HTTP_REQUEST_METHOD_VALUE_OPTIONS = exports.HTTP_REQUEST_METHOD_VALUE_HEAD = exports.HTTP_REQUEST_METHOD_VALUE_GET = exports.HTTP_REQUEST_METHOD_VALUE_DELETE = exports.HTTP_REQUEST_METHOD_VALUE_CONNECT = exports.HTTP_REQUEST_METHOD_VALUE_OTHER = exports.ATTR_HTTP_REQUEST_METHOD = exports.ATTR_HTTP_REQUEST_HEADER = exports.ATTR_EXCEPTION_TYPE = exports.ATTR_EXCEPTION_STACKTRACE = exports.ATTR_EXCEPTION_MESSAGE = exports.ATTR_EXCEPTION_ESCAPED = exports.ERROR_TYPE_VALUE_OTHER = void 0;
	exports.ATTR_USER_AGENT_ORIGINAL = exports.ATTR_URL_SCHEME = exports.ATTR_URL_QUERY = exports.ATTR_URL_PATH = exports.ATTR_URL_FULL = exports.ATTR_URL_FRAGMENT = exports.ATTR_TELEMETRY_SDK_VERSION = exports.ATTR_TELEMETRY_SDK_NAME = exports.TELEMETRY_SDK_LANGUAGE_VALUE_WEBJS = exports.TELEMETRY_SDK_LANGUAGE_VALUE_SWIFT = exports.TELEMETRY_SDK_LANGUAGE_VALUE_RUST = exports.TELEMETRY_SDK_LANGUAGE_VALUE_RUBY = exports.TELEMETRY_SDK_LANGUAGE_VALUE_PYTHON = exports.TELEMETRY_SDK_LANGUAGE_VALUE_PHP = exports.TELEMETRY_SDK_LANGUAGE_VALUE_NODEJS = exports.TELEMETRY_SDK_LANGUAGE_VALUE_JAVA = exports.TELEMETRY_SDK_LANGUAGE_VALUE_GO = exports.TELEMETRY_SDK_LANGUAGE_VALUE_ERLANG = exports.TELEMETRY_SDK_LANGUAGE_VALUE_DOTNET = exports.TELEMETRY_SDK_LANGUAGE_VALUE_CPP = exports.ATTR_TELEMETRY_SDK_LANGUAGE = exports.ATTR_TELEMETRY_DISTRO_VERSION = exports.ATTR_TELEMETRY_DISTRO_NAME = exports.SIGNALR_TRANSPORT_VALUE_WEB_SOCKETS = exports.SIGNALR_TRANSPORT_VALUE_SERVER_SENT_EVENTS = exports.SIGNALR_TRANSPORT_VALUE_LONG_POLLING = exports.ATTR_SIGNALR_TRANSPORT = exports.SIGNALR_CONNECTION_STATUS_VALUE_TIMEOUT = exports.SIGNALR_CONNECTION_STATUS_VALUE_NORMAL_CLOSURE = exports.SIGNALR_CONNECTION_STATUS_VALUE_APP_SHUTDOWN = exports.ATTR_SIGNALR_CONNECTION_STATUS = exports.ATTR_SERVICE_VERSION = exports.ATTR_SERVICE_NAMESPACE = exports.ATTR_SERVICE_NAME = exports.ATTR_SERVICE_INSTANCE_ID = exports.ATTR_SERVER_PORT = exports.ATTR_SERVER_ADDRESS = exports.ATTR_OTEL_STATUS_DESCRIPTION = exports.OTEL_STATUS_CODE_VALUE_OK = exports.OTEL_STATUS_CODE_VALUE_ERROR = exports.ATTR_OTEL_STATUS_CODE = exports.ATTR_OTEL_SCOPE_VERSION = exports.ATTR_OTEL_SCOPE_NAME = exports.ATTR_OTEL_EVENT_NAME = exports.NETWORK_TYPE_VALUE_IPV6 = void 0;
	/**
	* ASP.NET Core exception middleware handling result.
	*
	* @example handled
	* @example unhandled
	*/
	exports.ATTR_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT = "aspnetcore.diagnostics.exception.result";
	/**
	* Enum value "aborted" for attribute {@link ATTR_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT}.
	*
	* Exception handling didn't run because the request was aborted.
	*/
	exports.ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_ABORTED = "aborted";
	/**
	* Enum value "handled" for attribute {@link ATTR_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT}.
	*
	* Exception was handled by the exception handling middleware.
	*/
	exports.ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_HANDLED = "handled";
	/**
	* Enum value "skipped" for attribute {@link ATTR_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT}.
	*
	* Exception handling was skipped because the response had started.
	*/
	exports.ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_SKIPPED = "skipped";
	/**
	* Enum value "unhandled" for attribute {@link ATTR_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT}.
	*
	* Exception was not handled by the exception handling middleware.
	*/
	exports.ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_UNHANDLED = "unhandled";
	/**
	* Full type name of the [`IExceptionHandler`](https://learn.microsoft.com/dotnet/api/microsoft.aspnetcore.diagnostics.iexceptionhandler) implementation that handled the exception.
	*
	* @example Contoso.MyHandler
	*/
	exports.ATTR_ASPNETCORE_DIAGNOSTICS_HANDLER_TYPE = "aspnetcore.diagnostics.handler.type";
	/**
	* Rate limiting policy name.
	*
	* @example fixed
	* @example sliding
	* @example token
	*/
	exports.ATTR_ASPNETCORE_RATE_LIMITING_POLICY = "aspnetcore.rate_limiting.policy";
	/**
	* Rate-limiting result, shows whether the lease was acquired or contains a rejection reason
	*
	* @example acquired
	* @example request_canceled
	*/
	exports.ATTR_ASPNETCORE_RATE_LIMITING_RESULT = "aspnetcore.rate_limiting.result";
	/**
	* Enum value "acquired" for attribute {@link ATTR_ASPNETCORE_RATE_LIMITING_RESULT}.
	*
	* Lease was acquired
	*/
	exports.ASPNETCORE_RATE_LIMITING_RESULT_VALUE_ACQUIRED = "acquired";
	/**
	* Enum value "endpoint_limiter" for attribute {@link ATTR_ASPNETCORE_RATE_LIMITING_RESULT}.
	*
	* Lease request was rejected by the endpoint limiter
	*/
	exports.ASPNETCORE_RATE_LIMITING_RESULT_VALUE_ENDPOINT_LIMITER = "endpoint_limiter";
	/**
	* Enum value "global_limiter" for attribute {@link ATTR_ASPNETCORE_RATE_LIMITING_RESULT}.
	*
	* Lease request was rejected by the global limiter
	*/
	exports.ASPNETCORE_RATE_LIMITING_RESULT_VALUE_GLOBAL_LIMITER = "global_limiter";
	/**
	* Enum value "request_canceled" for attribute {@link ATTR_ASPNETCORE_RATE_LIMITING_RESULT}.
	*
	* Lease request was canceled
	*/
	exports.ASPNETCORE_RATE_LIMITING_RESULT_VALUE_REQUEST_CANCELED = "request_canceled";
	/**
	* Flag indicating if request was handled by the application pipeline.
	*
	* @example true
	*/
	exports.ATTR_ASPNETCORE_REQUEST_IS_UNHANDLED = "aspnetcore.request.is_unhandled";
	/**
	* A value that indicates whether the matched route is a fallback route.
	*
	* @example true
	*/
	exports.ATTR_ASPNETCORE_ROUTING_IS_FALLBACK = "aspnetcore.routing.is_fallback";
	/**
	* Match result - success or failure
	*
	* @example success
	* @example failure
	*/
	exports.ATTR_ASPNETCORE_ROUTING_MATCH_STATUS = "aspnetcore.routing.match_status";
	/**
	* Enum value "failure" for attribute {@link ATTR_ASPNETCORE_ROUTING_MATCH_STATUS}.
	*
	* Match failed
	*/
	exports.ASPNETCORE_ROUTING_MATCH_STATUS_VALUE_FAILURE = "failure";
	/**
	* Enum value "success" for attribute {@link ATTR_ASPNETCORE_ROUTING_MATCH_STATUS}.
	*
	* Match succeeded
	*/
	exports.ASPNETCORE_ROUTING_MATCH_STATUS_VALUE_SUCCESS = "success";
	/**
	* A value that indicates whether the user is authenticated.
	*
	* @example true
	*/
	exports.ATTR_ASPNETCORE_USER_IS_AUTHENTICATED = "aspnetcore.user.is_authenticated";
	/**
	* Client address - domain name if available without reverse DNS lookup; otherwise, IP address or Unix domain socket name.
	*
	* @example client.example.com
	* @example 10.1.2.80
	* @example /tmp/my.sock
	*
	* @note When observed from the server side, and when communicating through an intermediary, `client.address` **SHOULD** represent the client address behind any intermediaries,  for example proxies, if it's available.
	*/
	exports.ATTR_CLIENT_ADDRESS = "client.address";
	/**
	* Client port number.
	*
	* @example 65123
	*
	* @note When observed from the server side, and when communicating through an intermediary, `client.port` **SHOULD** represent the client port behind any intermediaries,  for example proxies, if it's available.
	*/
	exports.ATTR_CLIENT_PORT = "client.port";
	/**
	* The column number in `code.file.path` best representing the operation. It **SHOULD** point within the code unit named in `code.function.name`. This attribute **MUST NOT** be used on the Profile signal since the data is already captured in 'message Line'. This constraint is imposed to prevent redundancy and maintain data integrity.
	*
	* @example 16
	*/
	exports.ATTR_CODE_COLUMN_NUMBER = "code.column.number";
	/**
	* The source code file name that identifies the code unit as uniquely as possible (preferably an absolute file path). This attribute **MUST NOT** be used on the Profile signal since the data is already captured in 'message Function'. This constraint is imposed to prevent redundancy and maintain data integrity.
	*
	* @example "/usr/local/MyApplication/content_root/app/index.php"
	*/
	exports.ATTR_CODE_FILE_PATH = "code.file.path";
	/**
	* The method or function fully-qualified name without arguments. The value should fit the natural representation of the language runtime, which is also likely the same used within `code.stacktrace` attribute value. This attribute **MUST NOT** be used on the Profile signal since the data is already captured in 'message Function'. This constraint is imposed to prevent redundancy and maintain data integrity.
	*
	* @example com.example.MyHttpService.serveRequest
	* @example GuzzleHttp\\Client::transfer
	* @example fopen
	*
	* @note Values and format depends on each language runtime, thus it is impossible to provide an exhaustive list of examples.
	* The values are usually the same (or prefixes of) the ones found in native stack trace representation stored in
	* `code.stacktrace` without information on arguments.
	*
	* Examples:
	*
	*   - Java method: `com.example.MyHttpService.serveRequest`
	*   - Java anonymous class method: `com.mycompany.Main$1.myMethod`
	*   - Java lambda method: `com.mycompany.Main$$Lambda/0x0000748ae4149c00.myMethod`
	*   - PHP function: `GuzzleHttp\Client::transfer`
	*   - Go function: `github.com/my/repo/pkg.foo.func5`
	*   - Elixir: `OpenTelemetry.Ctx.new`
	*   - Erlang: `opentelemetry_ctx:new`
	*   - Rust: `playground::my_module::my_cool_func`
	*   - C function: `fopen`
	*/
	exports.ATTR_CODE_FUNCTION_NAME = "code.function.name";
	/**
	* The line number in `code.file.path` best representing the operation. It **SHOULD** point within the code unit named in `code.function.name`. This attribute **MUST NOT** be used on the Profile signal since the data is already captured in 'message Line'. This constraint is imposed to prevent redundancy and maintain data integrity.
	*
	* @example 42
	*/
	exports.ATTR_CODE_LINE_NUMBER = "code.line.number";
	/**
	* A stacktrace as a string in the natural representation for the language runtime. The representation is identical to [`exception.stacktrace`](/docs/exceptions/exceptions-spans.md#stacktrace-representation). This attribute **MUST NOT** be used on the Profile signal since the data is already captured in 'message Location'. This constraint is imposed to prevent redundancy and maintain data integrity.
	*
	* @example "at com.example.GenerateTrace.methodB(GenerateTrace.java:13)\\n at com.example.GenerateTrace.methodA(GenerateTrace.java:9)\\n at com.example.GenerateTrace.main(GenerateTrace.java:5)\\n"
	*/
	exports.ATTR_CODE_STACKTRACE = "code.stacktrace";
	/**
	* The name of a collection (table, container) within the database.
	*
	* @example public.users
	* @example customers
	*
	* @note It is **RECOMMENDED** to capture the value as provided by the application
	* without attempting to do any case normalization.
	*
	* The collection name **SHOULD NOT** be extracted from `db.query.text`,
	* when the database system supports query text with multiple collections
	* in non-batch operations.
	*
	* For batch operations, if the individual operations are known to have the same
	* collection name then that collection name **SHOULD** be used.
	*/
	exports.ATTR_DB_COLLECTION_NAME = "db.collection.name";
	/**
	* The name of the database, fully qualified within the server address and port.
	*
	* @example customers
	* @example test.users
	*
	* @note If a database system has multiple namespace components, they **SHOULD** be concatenated from the most general to the most specific namespace component, using `|` as a separator between the components. Any missing components (and their associated separators) **SHOULD** be omitted.
	* Semantic conventions for individual database systems **SHOULD** document what `db.namespace` means in the context of that system.
	* It is **RECOMMENDED** to capture the value as provided by the application without attempting to do any case normalization.
	*/
	exports.ATTR_DB_NAMESPACE = "db.namespace";
	/**
	* The number of queries included in a batch operation.
	*
	* @example 2
	* @example 3
	* @example 4
	*
	* @note Operations are only considered batches when they contain two or more operations, and so `db.operation.batch.size` **SHOULD** never be `1`.
	*/
	exports.ATTR_DB_OPERATION_BATCH_SIZE = "db.operation.batch.size";
	/**
	* The name of the operation or command being executed.
	*
	* @example findAndModify
	* @example HMSET
	* @example SELECT
	*
	* @note It is **RECOMMENDED** to capture the value as provided by the application
	* without attempting to do any case normalization.
	*
	* The operation name **SHOULD NOT** be extracted from `db.query.text`,
	* when the database system supports query text with multiple operations
	* in non-batch operations.
	*
	* If spaces can occur in the operation name, multiple consecutive spaces
	* **SHOULD** be normalized to a single space.
	*
	* For batch operations, if the individual operations are known to have the same operation name
	* then that operation name **SHOULD** be used prepended by `BATCH `,
	* otherwise `db.operation.name` **SHOULD** be `BATCH` or some other database
	* system specific term if more applicable.
	*/
	exports.ATTR_DB_OPERATION_NAME = "db.operation.name";
	/**
	* Low cardinality summary of a database query.
	*
	* @example SELECT wuser_table
	* @example INSERT shipping_details SELECT orders
	* @example get user by id
	*
	* @note The query summary describes a class of database queries and is useful
	* as a grouping key, especially when analyzing telemetry for database
	* calls involving complex queries.
	*
	* Summary may be available to the instrumentation through
	* instrumentation hooks or other means. If it is not available, instrumentations
	* that support query parsing **SHOULD** generate a summary following
	* [Generating query summary](/docs/db/database-spans.md#generating-a-summary-of-the-query)
	* section.
	*
	* For batch operations, if the individual operations are known to have the same query summary
	* then that query summary **SHOULD** be used prepended by `BATCH `,
	* otherwise `db.query.summary` **SHOULD** be `BATCH` or some other database
	* system specific term if more applicable.
	*/
	exports.ATTR_DB_QUERY_SUMMARY = "db.query.summary";
	/**
	* The database query being executed.
	*
	* @example SELECT * FROM wuser_table where username = ?
	* @example SET mykey ?
	*
	* @note For sanitization see [Sanitization of `db.query.text`](/docs/db/database-spans.md#sanitization-of-dbquerytext).
	* For batch operations, if the individual operations are known to have the same query text then that query text **SHOULD** be used, otherwise all of the individual query texts **SHOULD** be concatenated with separator `; ` or some other database system specific separator if more applicable.
	* Parameterized query text **SHOULD NOT** be sanitized. Even though parameterized query text can potentially have sensitive data, by using a parameterized query the user is giving a strong signal that any sensitive data will be passed as parameter values, and the benefit to observability of capturing the static part of the query text by default outweighs the risk.
	*/
	exports.ATTR_DB_QUERY_TEXT = "db.query.text";
	/**
	* Database response status code.
	*
	* @example 102
	* @example ORA-17002
	* @example 08P01
	* @example 404
	*
	* @note The status code returned by the database. Usually it represents an error code, but may also represent partial success, warning, or differentiate between various types of successful outcomes.
	* Semantic conventions for individual database systems **SHOULD** document what `db.response.status_code` means in the context of that system.
	*/
	exports.ATTR_DB_RESPONSE_STATUS_CODE = "db.response.status_code";
	/**
	* The name of a stored procedure within the database.
	*
	* @example GetCustomer
	*
	* @note It is **RECOMMENDED** to capture the value as provided by the application
	* without attempting to do any case normalization.
	*
	* For batch operations, if the individual operations are known to have the same
	* stored procedure name then that stored procedure name **SHOULD** be used.
	*/
	exports.ATTR_DB_STORED_PROCEDURE_NAME = "db.stored_procedure.name";
	/**
	* The database management system (DBMS) product as identified by the client instrumentation.
	*
	* @note The actual DBMS may differ from the one identified by the client. For example, when using PostgreSQL client libraries to connect to a CockroachDB, the `db.system.name` is set to `postgresql` based on the instrumentation's best knowledge.
	*/
	exports.ATTR_DB_SYSTEM_NAME = "db.system.name";
	/**
	* Enum value "mariadb" for attribute {@link ATTR_DB_SYSTEM_NAME}.
	*
	* [MariaDB](https://mariadb.org/)
	*/
	exports.DB_SYSTEM_NAME_VALUE_MARIADB = "mariadb";
	/**
	* Enum value "microsoft.sql_server" for attribute {@link ATTR_DB_SYSTEM_NAME}.
	*
	* [Microsoft SQL Server](https://www.microsoft.com/sql-server)
	*/
	exports.DB_SYSTEM_NAME_VALUE_MICROSOFT_SQL_SERVER = "microsoft.sql_server";
	/**
	* Enum value "mysql" for attribute {@link ATTR_DB_SYSTEM_NAME}.
	*
	* [MySQL](https://www.mysql.com/)
	*/
	exports.DB_SYSTEM_NAME_VALUE_MYSQL = "mysql";
	/**
	* Enum value "postgresql" for attribute {@link ATTR_DB_SYSTEM_NAME}.
	*
	* [PostgreSQL](https://www.postgresql.org/)
	*/
	exports.DB_SYSTEM_NAME_VALUE_POSTGRESQL = "postgresql";
	/**
	* Name of the [deployment environment](https://wikipedia.org/wiki/Deployment_environment) (aka deployment tier).
	*
	* @example staging
	* @example production
	*
	* @note `deployment.environment.name` does not affect the uniqueness constraints defined through
	* the `service.namespace`, `service.name` and `service.instance.id` resource attributes.
	* This implies that resources carrying the following attribute combinations **MUST** be
	* considered to be identifying the same service:
	*
	*   - `service.name=frontend`, `deployment.environment.name=production`
	*   - `service.name=frontend`, `deployment.environment.name=staging`.
	*/
	exports.ATTR_DEPLOYMENT_ENVIRONMENT_NAME = "deployment.environment.name";
	/**
	* Enum value "development" for attribute {@link ATTR_DEPLOYMENT_ENVIRONMENT_NAME}.
	*
	* Development environment
	*/
	exports.DEPLOYMENT_ENVIRONMENT_NAME_VALUE_DEVELOPMENT = "development";
	/**
	* Enum value "production" for attribute {@link ATTR_DEPLOYMENT_ENVIRONMENT_NAME}.
	*
	* Production environment
	*/
	exports.DEPLOYMENT_ENVIRONMENT_NAME_VALUE_PRODUCTION = "production";
	/**
	* Enum value "staging" for attribute {@link ATTR_DEPLOYMENT_ENVIRONMENT_NAME}.
	*
	* Staging environment
	*/
	exports.DEPLOYMENT_ENVIRONMENT_NAME_VALUE_STAGING = "staging";
	/**
	* Enum value "test" for attribute {@link ATTR_DEPLOYMENT_ENVIRONMENT_NAME}.
	*
	* Testing environment
	*/
	exports.DEPLOYMENT_ENVIRONMENT_NAME_VALUE_TEST = "test";
	/**
	* Name of the garbage collector managed heap generation.
	*
	* @example gen0
	* @example gen1
	* @example gen2
	*/
	exports.ATTR_DOTNET_GC_HEAP_GENERATION = "dotnet.gc.heap.generation";
	/**
	* Enum value "gen0" for attribute {@link ATTR_DOTNET_GC_HEAP_GENERATION}.
	*
	* Generation 0
	*/
	exports.DOTNET_GC_HEAP_GENERATION_VALUE_GEN0 = "gen0";
	/**
	* Enum value "gen1" for attribute {@link ATTR_DOTNET_GC_HEAP_GENERATION}.
	*
	* Generation 1
	*/
	exports.DOTNET_GC_HEAP_GENERATION_VALUE_GEN1 = "gen1";
	/**
	* Enum value "gen2" for attribute {@link ATTR_DOTNET_GC_HEAP_GENERATION}.
	*
	* Generation 2
	*/
	exports.DOTNET_GC_HEAP_GENERATION_VALUE_GEN2 = "gen2";
	/**
	* Enum value "loh" for attribute {@link ATTR_DOTNET_GC_HEAP_GENERATION}.
	*
	* Large Object Heap
	*/
	exports.DOTNET_GC_HEAP_GENERATION_VALUE_LOH = "loh";
	/**
	* Enum value "poh" for attribute {@link ATTR_DOTNET_GC_HEAP_GENERATION}.
	*
	* Pinned Object Heap
	*/
	exports.DOTNET_GC_HEAP_GENERATION_VALUE_POH = "poh";
	/**
	* Describes a class of error the operation ended with.
	*
	* @example timeout
	* @example java.net.UnknownHostException
	* @example server_certificate_invalid
	* @example 500
	*
	* @note The `error.type` **SHOULD** be predictable, and **SHOULD** have low cardinality.
	*
	* When `error.type` is set to a type (e.g., an exception type), its
	* canonical class name identifying the type within the artifact **SHOULD** be used.
	*
	* If the recorded error type is a wrapper that is not meaningful for
	* failure classification, instrumentation **MAY** use the type of the inner
	* error instead. For example, in Go, errors created with `fmt.Errorf`
	* using `%w` **MAY** be unwrapped when the wrapper type does not help
	* classify the failure.
	*
	* Instrumentations **SHOULD** document the list of errors they report.
	*
	* The cardinality of `error.type` within one instrumentation library **SHOULD** be low.
	* Telemetry consumers that aggregate data from multiple instrumentation libraries and applications
	* should be prepared for `error.type` to have high cardinality at query time when no
	* additional filters are applied.
	*
	* If the operation has completed successfully, instrumentations **SHOULD NOT** set `error.type`.
	*
	* If a specific domain defines its own set of error identifiers (such as HTTP or RPC status codes),
	* it's **RECOMMENDED** to:
	*
	*   - Use a domain-specific attribute
	*   - Set `error.type` to capture all errors, regardless of whether they are defined within the domain-specific set or not.
	*/
	exports.ATTR_ERROR_TYPE = "error.type";
	/**
	* Enum value "_OTHER" for attribute {@link ATTR_ERROR_TYPE}.
	*
	* A fallback error value to be used when the instrumentation doesn't define a custom value.
	*/
	exports.ERROR_TYPE_VALUE_OTHER = "_OTHER";
	/**
	* Indicates that the exception is escaping the scope of the span.
	*
	* @deprecated It's no longer recommended to record exceptions that are handled and do not escape the scope of a span.
	*/
	exports.ATTR_EXCEPTION_ESCAPED = "exception.escaped";
	/**
	* The exception message.
	*
	* @example Division by zero
	* @example Can't convert 'int' object to str implicitly
	*
	* @note > [!WARNING]
	*
	* > This attribute may contain sensitive information.
	*/
	exports.ATTR_EXCEPTION_MESSAGE = "exception.message";
	/**
	* A stacktrace as a string in the natural representation for the language runtime. The representation is to be determined and documented by each language SIG.
	*
	* @example "Exception in thread "main" java.lang.RuntimeException: Test exception\\n at com.example.GenerateTrace.methodB(GenerateTrace.java:13)\\n at com.example.GenerateTrace.methodA(GenerateTrace.java:9)\\n at com.example.GenerateTrace.main(GenerateTrace.java:5)\\n"
	*/
	exports.ATTR_EXCEPTION_STACKTRACE = "exception.stacktrace";
	/**
	* The type of the exception (its fully-qualified class name, if applicable). The dynamic type of the exception should be preferred over the static type in languages that support it.
	*
	* @example java.net.ConnectException
	* @example OSError
	*
	* @note If the recorded exception type is a wrapper that is not meaningful for
	* failure classification, instrumentation **MAY** use the type of the inner
	* exception instead. For example, in Go, errors created with `fmt.Errorf`
	* using `%w` **MAY** be unwrapped when the wrapper type does not help
	* classify the failure.
	*/
	exports.ATTR_EXCEPTION_TYPE = "exception.type";
	/**
	* HTTP request headers, `<key>` being the normalized HTTP Header name (lowercase), the value being the header values.
	*
	* @example ["application/json"]
	* @example ["1.2.3.4", "1.2.3.5"]
	*
	* @note Instrumentations **SHOULD** require an explicit configuration of which headers are to be captured.
	* Including all request headers can be a security risk - explicit configuration helps avoid leaking sensitive information.
	*
	* The `User-Agent` header is already captured in the `user_agent.original` attribute.
	* Users **MAY** explicitly configure instrumentations to capture them even though it is not recommended.
	*
	* The attribute value **MUST** consist of either multiple header values as an array of strings
	* or a single-item array containing a possibly comma-concatenated string, depending on the way
	* the HTTP library provides access to headers.
	*
	* Examples:
	*
	*   - A header `Content-Type: application/json` **SHOULD** be recorded as the `http.request.header.content-type`
	*     attribute with value `["application/json"]`.
	*   - A header `X-Forwarded-For: 1.2.3.4, 1.2.3.5` **SHOULD** be recorded as the `http.request.header.x-forwarded-for`
	*     attribute with value `["1.2.3.4", "1.2.3.5"]` or `["1.2.3.4, 1.2.3.5"]` depending on the HTTP library.
	*/
	const ATTR_HTTP_REQUEST_HEADER = (key) => `http.request.header.${key}`;
	exports.ATTR_HTTP_REQUEST_HEADER = ATTR_HTTP_REQUEST_HEADER;
	/**
	* HTTP request method.
	*
	* @example GET
	* @example POST
	* @example HEAD
	*
	* @note HTTP request method value **SHOULD** be "known" to the instrumentation.
	* By default, this convention defines "known" methods as the ones listed in [RFC9110](https://www.rfc-editor.org/rfc/rfc9110.html#name-methods),
	* the PATCH method defined in [RFC5789](https://www.rfc-editor.org/rfc/rfc5789.html)
	* and the QUERY method defined in [httpbis-safe-method-w-body](https://datatracker.ietf.org/doc/draft-ietf-httpbis-safe-method-w-body/?include_text=1).
	*
	* If the HTTP request method is not known to instrumentation, it **MUST** set the `http.request.method` attribute to `_OTHER`.
	*
	* If the HTTP instrumentation could end up converting valid HTTP request methods to `_OTHER`, then it **MUST** provide a way to override
	* the list of known HTTP methods. If this override is done via environment variable, then the environment variable **MUST** be named
	* OTEL_INSTRUMENTATION_HTTP_KNOWN_METHODS and support a comma-separated list of case-sensitive known HTTP methods.
	*
	*
	* If this override is done via declarative configuration, then the list **MUST** be configurable via the `known_methods` property
	* (an array of case-sensitive strings with minimum items 0) under `.instrumentation/development.general.http.client` and/or
	* `.instrumentation/development.general.http.server`.
	*
	* In either case, this list **MUST** be a full override of the default known methods,
	* it is not a list of known methods in addition to the defaults.
	*
	* HTTP method names are case-sensitive and `http.request.method` attribute value **MUST** match a known HTTP method name exactly.
	* Instrumentations for specific web frameworks that consider HTTP methods to be case insensitive, **SHOULD** populate a canonical equivalent.
	* Tracing instrumentations that do so, **MUST** also set `http.request.method_original` to the original value.
	*/
	exports.ATTR_HTTP_REQUEST_METHOD = "http.request.method";
	/**
	* Enum value "_OTHER" for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
	*
	* Any HTTP method that the instrumentation has no prior knowledge of.
	*/
	exports.HTTP_REQUEST_METHOD_VALUE_OTHER = "_OTHER";
	/**
	* Enum value "CONNECT" for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
	*
	* CONNECT method.
	*/
	exports.HTTP_REQUEST_METHOD_VALUE_CONNECT = "CONNECT";
	/**
	* Enum value "DELETE" for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
	*
	* DELETE method.
	*/
	exports.HTTP_REQUEST_METHOD_VALUE_DELETE = "DELETE";
	/**
	* Enum value "GET" for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
	*
	* GET method.
	*/
	exports.HTTP_REQUEST_METHOD_VALUE_GET = "GET";
	/**
	* Enum value "HEAD" for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
	*
	* HEAD method.
	*/
	exports.HTTP_REQUEST_METHOD_VALUE_HEAD = "HEAD";
	/**
	* Enum value "OPTIONS" for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
	*
	* OPTIONS method.
	*/
	exports.HTTP_REQUEST_METHOD_VALUE_OPTIONS = "OPTIONS";
	/**
	* Enum value "PATCH" for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
	*
	* PATCH method.
	*/
	exports.HTTP_REQUEST_METHOD_VALUE_PATCH = "PATCH";
	/**
	* Enum value "POST" for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
	*
	* POST method.
	*/
	exports.HTTP_REQUEST_METHOD_VALUE_POST = "POST";
	/**
	* Enum value "PUT" for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
	*
	* PUT method.
	*/
	exports.HTTP_REQUEST_METHOD_VALUE_PUT = "PUT";
	/**
	* Enum value "TRACE" for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
	*
	* TRACE method.
	*/
	exports.HTTP_REQUEST_METHOD_VALUE_TRACE = "TRACE";
	/**
	* Original HTTP method sent by the client in the request line.
	*
	* @example GeT
	* @example ACL
	* @example foo
	*/
	exports.ATTR_HTTP_REQUEST_METHOD_ORIGINAL = "http.request.method_original";
	/**
	* The ordinal number of request resending attempt (for any reason, including redirects).
	*
	* @example 3
	*
	* @note The resend count **SHOULD** be updated each time an HTTP request gets resent by the client, regardless of what was the cause of the resending (e.g. redirection, authorization failure, 503 Server Unavailable, network issues, or any other).
	*/
	exports.ATTR_HTTP_REQUEST_RESEND_COUNT = "http.request.resend_count";
	/**
	* HTTP response headers, `<key>` being the normalized HTTP Header name (lowercase), the value being the header values.
	*
	* @example ["application/json"]
	* @example ["abc", "def"]
	*
	* @note Instrumentations **SHOULD** require an explicit configuration of which headers are to be captured.
	* Including all response headers can be a security risk - explicit configuration helps avoid leaking sensitive information.
	*
	* Users **MAY** explicitly configure instrumentations to capture them even though it is not recommended.
	*
	* The attribute value **MUST** consist of either multiple header values as an array of strings
	* or a single-item array containing a possibly comma-concatenated string, depending on the way
	* the HTTP library provides access to headers.
	*
	* Examples:
	*
	*   - A header `Content-Type: application/json` header **SHOULD** be recorded as the `http.request.response.content-type`
	*     attribute with value `["application/json"]`.
	*   - A header `My-custom-header: abc, def` header **SHOULD** be recorded as the `http.response.header.my-custom-header`
	*     attribute with value `["abc", "def"]` or `["abc, def"]` depending on the HTTP library.
	*/
	const ATTR_HTTP_RESPONSE_HEADER = (key) => `http.response.header.${key}`;
	exports.ATTR_HTTP_RESPONSE_HEADER = ATTR_HTTP_RESPONSE_HEADER;
	/**
	* [HTTP response status code](https://tools.ietf.org/html/rfc7231#section-6).
	*
	* @example 200
	*/
	exports.ATTR_HTTP_RESPONSE_STATUS_CODE = "http.response.status_code";
	/**
	* The matched route template for the request. This **MUST** be low-cardinality and include all static path segments, with dynamic path segments represented with placeholders.
	*
	* @example /users/:userID?
	* @example my-controller/my-action/{id?}
	*
	* @note **MUST NOT** be populated when this is not supported by the HTTP server framework as the route attribute should have low-cardinality and the URI path can NOT substitute it.
	* **SHOULD** include the [application root](/docs/http/http-spans.md#http-server-definitions) if there is one.
	*
	* A static path segment is a part of the route template with a fixed, low-cardinality value. This includes literal strings like `/users/` and placeholders that
	* are constrained to a finite, predefined set of values, e.g. `{controller}` or `{action}`.
	*
	* A dynamic path segment is a placeholder for a value that can have high cardinality and is not constrained to a predefined list like static path segments.
	*
	* Instrumentations **SHOULD** use routing information provided by the corresponding web framework. They **SHOULD** pick the most precise source of routing information and **MAY**
	* support custom route formatting. Instrumentations **SHOULD** document the format and the API used to obtain the route string.
	*/
	exports.ATTR_HTTP_ROUTE = "http.route";
	/**
	* Name of the garbage collector action.
	*
	* @example end of minor GC
	* @example end of major GC
	*
	* @note Garbage collector action is generally obtained via [GarbageCollectionNotificationInfo#getGcAction()](https://docs.oracle.com/en/java/javase/11/docs/api/jdk.management/com/sun/management/GarbageCollectionNotificationInfo.html#getGcAction()).
	*/
	exports.ATTR_JVM_GC_ACTION = "jvm.gc.action";
	/**
	* Name of the garbage collector.
	*
	* @example G1 Young Generation
	* @example G1 Old Generation
	*
	* @note Garbage collector name is generally obtained via [GarbageCollectionNotificationInfo#getGcName()](https://docs.oracle.com/en/java/javase/11/docs/api/jdk.management/com/sun/management/GarbageCollectionNotificationInfo.html#getGcName()).
	*/
	exports.ATTR_JVM_GC_NAME = "jvm.gc.name";
	/**
	* Name of the memory pool.
	*
	* @example G1 Old Gen
	* @example G1 Eden space
	* @example G1 Survivor Space
	*
	* @note Pool names are generally obtained via [MemoryPoolMXBean#getName()](https://docs.oracle.com/en/java/javase/11/docs/api/java.management/java/lang/management/MemoryPoolMXBean.html#getName()).
	*/
	exports.ATTR_JVM_MEMORY_POOL_NAME = "jvm.memory.pool.name";
	/**
	* The type of memory.
	*
	* @example heap
	* @example non_heap
	*/
	exports.ATTR_JVM_MEMORY_TYPE = "jvm.memory.type";
	/**
	* Enum value "heap" for attribute {@link ATTR_JVM_MEMORY_TYPE}.
	*
	* Heap memory.
	*/
	exports.JVM_MEMORY_TYPE_VALUE_HEAP = "heap";
	/**
	* Enum value "non_heap" for attribute {@link ATTR_JVM_MEMORY_TYPE}.
	*
	* Non-heap memory
	*/
	exports.JVM_MEMORY_TYPE_VALUE_NON_HEAP = "non_heap";
	/**
	* Whether the thread is daemon or not.
	*/
	exports.ATTR_JVM_THREAD_DAEMON = "jvm.thread.daemon";
	/**
	* State of the thread.
	*
	* @example runnable
	* @example blocked
	*/
	exports.ATTR_JVM_THREAD_STATE = "jvm.thread.state";
	/**
	* Enum value "blocked" for attribute {@link ATTR_JVM_THREAD_STATE}.
	*
	* A thread that is blocked waiting for a monitor lock is in this state.
	*/
	exports.JVM_THREAD_STATE_VALUE_BLOCKED = "blocked";
	/**
	* Enum value "new" for attribute {@link ATTR_JVM_THREAD_STATE}.
	*
	* A thread that has not yet started is in this state.
	*/
	exports.JVM_THREAD_STATE_VALUE_NEW = "new";
	/**
	* Enum value "runnable" for attribute {@link ATTR_JVM_THREAD_STATE}.
	*
	* A thread executing in the Java virtual machine is in this state.
	*/
	exports.JVM_THREAD_STATE_VALUE_RUNNABLE = "runnable";
	/**
	* Enum value "terminated" for attribute {@link ATTR_JVM_THREAD_STATE}.
	*
	* A thread that has exited is in this state.
	*/
	exports.JVM_THREAD_STATE_VALUE_TERMINATED = "terminated";
	/**
	* Enum value "timed_waiting" for attribute {@link ATTR_JVM_THREAD_STATE}.
	*
	* A thread that is waiting for another thread to perform an action for up to a specified waiting time is in this state.
	*/
	exports.JVM_THREAD_STATE_VALUE_TIMED_WAITING = "timed_waiting";
	/**
	* Enum value "waiting" for attribute {@link ATTR_JVM_THREAD_STATE}.
	*
	* A thread that is waiting indefinitely for another thread to perform a particular action is in this state.
	*/
	exports.JVM_THREAD_STATE_VALUE_WAITING = "waiting";
	/**
	* Local address of the network connection - IP address or Unix domain socket name.
	*
	* @example 10.1.2.80
	* @example /tmp/my.sock
	*/
	exports.ATTR_NETWORK_LOCAL_ADDRESS = "network.local.address";
	/**
	* Local port number of the network connection.
	*
	* @example 65123
	*/
	exports.ATTR_NETWORK_LOCAL_PORT = "network.local.port";
	/**
	* Peer address of the network connection - IP address or Unix domain socket name.
	*
	* @example 10.1.2.80
	* @example /tmp/my.sock
	*/
	exports.ATTR_NETWORK_PEER_ADDRESS = "network.peer.address";
	/**
	* Peer port number of the network connection.
	*
	* @example 65123
	*/
	exports.ATTR_NETWORK_PEER_PORT = "network.peer.port";
	/**
	* [OSI application layer](https://wikipedia.org/wiki/Application_layer) or non-OSI equivalent.
	*
	* @example amqp
	* @example http
	* @example mqtt
	*
	* @note The value **SHOULD** be normalized to lowercase.
	*/
	exports.ATTR_NETWORK_PROTOCOL_NAME = "network.protocol.name";
	/**
	* The actual version of the protocol used for network communication.
	*
	* @example 1.1
	* @example 2
	*
	* @note If protocol version is subject to negotiation (for example using [ALPN](https://www.rfc-editor.org/rfc/rfc7301.html)), this attribute **SHOULD** be set to the negotiated version. If the actual protocol version is not known, this attribute **SHOULD NOT** be set.
	*/
	exports.ATTR_NETWORK_PROTOCOL_VERSION = "network.protocol.version";
	/**
	* [OSI transport layer](https://wikipedia.org/wiki/Transport_layer) or [inter-process communication method](https://wikipedia.org/wiki/Inter-process_communication).
	*
	* @example tcp
	* @example udp
	*
	* @note The value **SHOULD** be normalized to lowercase.
	*
	* Consider always setting the transport when setting a port number, since
	* a port number is ambiguous without knowing the transport. For example
	* different processes could be listening on TCP port 12345 and UDP port 12345.
	*/
	exports.ATTR_NETWORK_TRANSPORT = "network.transport";
	/**
	* Enum value "pipe" for attribute {@link ATTR_NETWORK_TRANSPORT}.
	*
	* Named or anonymous pipe.
	*/
	exports.NETWORK_TRANSPORT_VALUE_PIPE = "pipe";
	/**
	* Enum value "quic" for attribute {@link ATTR_NETWORK_TRANSPORT}.
	*
	* QUIC
	*/
	exports.NETWORK_TRANSPORT_VALUE_QUIC = "quic";
	/**
	* Enum value "tcp" for attribute {@link ATTR_NETWORK_TRANSPORT}.
	*
	* TCP
	*/
	exports.NETWORK_TRANSPORT_VALUE_TCP = "tcp";
	/**
	* Enum value "udp" for attribute {@link ATTR_NETWORK_TRANSPORT}.
	*
	* UDP
	*/
	exports.NETWORK_TRANSPORT_VALUE_UDP = "udp";
	/**
	* Enum value "unix" for attribute {@link ATTR_NETWORK_TRANSPORT}.
	*
	* Unix domain socket
	*/
	exports.NETWORK_TRANSPORT_VALUE_UNIX = "unix";
	/**
	* [OSI network layer](https://wikipedia.org/wiki/Network_layer) or non-OSI equivalent.
	*
	* @example ipv4
	* @example ipv6
	*
	* @note The value **SHOULD** be normalized to lowercase.
	*/
	exports.ATTR_NETWORK_TYPE = "network.type";
	/**
	* Enum value "ipv4" for attribute {@link ATTR_NETWORK_TYPE}.
	*
	* IPv4
	*/
	exports.NETWORK_TYPE_VALUE_IPV4 = "ipv4";
	/**
	* Enum value "ipv6" for attribute {@link ATTR_NETWORK_TYPE}.
	*
	* IPv6
	*/
	exports.NETWORK_TYPE_VALUE_IPV6 = "ipv6";
	/**
	* Identifies the class / type of event.
	*
	* @example browser.mouse.click
	* @example device.app.lifecycle
	*
	* @note This attribute **SHOULD** be used by non-OTLP exporters when destination does not support `EventName` or equivalent field. This attribute **MAY** be used by applications using existing logging libraries so that it can be used to set the `EventName` field by Collector or SDK components.
	*/
	exports.ATTR_OTEL_EVENT_NAME = "otel.event.name";
	/**
	* The name of the instrumentation scope - (`InstrumentationScope.Name` in OTLP).
	*
	* @example io.opentelemetry.contrib.mongodb
	*/
	exports.ATTR_OTEL_SCOPE_NAME = "otel.scope.name";
	/**
	* The version of the instrumentation scope - (`InstrumentationScope.Version` in OTLP).
	*
	* @example 1.0.0
	*/
	exports.ATTR_OTEL_SCOPE_VERSION = "otel.scope.version";
	/**
	* Name of the code, either "OK" or "ERROR". **MUST NOT** be set if the status code is UNSET.
	*/
	exports.ATTR_OTEL_STATUS_CODE = "otel.status_code";
	/**
	* Enum value "ERROR" for attribute {@link ATTR_OTEL_STATUS_CODE}.
	*
	* The operation contains an error.
	*/
	exports.OTEL_STATUS_CODE_VALUE_ERROR = "ERROR";
	/**
	* Enum value "OK" for attribute {@link ATTR_OTEL_STATUS_CODE}.
	*
	* The operation has been validated by an Application developer or Operator to have completed successfully.
	*/
	exports.OTEL_STATUS_CODE_VALUE_OK = "OK";
	/**
	* Description of the Status if it has a value, otherwise not set.
	*
	* @example resource not found
	*/
	exports.ATTR_OTEL_STATUS_DESCRIPTION = "otel.status_description";
	/**
	* Server domain name if available without reverse DNS lookup; otherwise, IP address or Unix domain socket name.
	*
	* @example example.com
	* @example 10.1.2.80
	* @example /tmp/my.sock
	*
	* @note When observed from the client side, and when communicating through an intermediary, `server.address` **SHOULD** represent the server address behind any intermediaries, for example proxies, if it's available.
	*/
	exports.ATTR_SERVER_ADDRESS = "server.address";
	/**
	* Server port number.
	*
	* @example 80
	* @example 8080
	* @example 443
	*
	* @note When observed from the client side, and when communicating through an intermediary, `server.port` **SHOULD** represent the server port behind any intermediaries, for example proxies, if it's available.
	*/
	exports.ATTR_SERVER_PORT = "server.port";
	/**
	* The string ID of the service instance.
	*
	* @example 627cc493-f310-47de-96bd-71410b7dec09
	*
	* @note **MUST** be unique for each instance of the same `service.namespace,service.name` pair (in other words
	* `service.namespace,service.name,service.instance.id` triplet **MUST** be globally unique). The ID helps to
	* distinguish instances of the same service that exist at the same time (e.g. instances of a horizontally scaled
	* service).
	*
	* Implementations, such as SDKs, are recommended to generate a random Version 1 or Version 4 [RFC
	* 4122](https://www.ietf.org/rfc/rfc4122.txt) UUID, but are free to use an inherent unique ID as the source of
	* this value if stability is desirable. In that case, the ID **SHOULD** be used as source of a UUID Version 5 and
	* **SHOULD** use the following UUID as the namespace: `4d63009a-8d0f-11ee-aad7-4c796ed8e320`.
	*
	* UUIDs are typically recommended, as only an opaque value for the purposes of identifying a service instance is
	* needed. Similar to what can be seen in the man page for the
	* [`/etc/machine-id`](https://www.freedesktop.org/software/systemd/man/latest/machine-id.html) file, the underlying
	* data, such as pod name and namespace should be treated as confidential, being the user's choice to expose it
	* or not via another resource attribute.
	*
	* For applications running behind an application server (like unicorn), we do not recommend using one identifier
	* for all processes participating in the application. Instead, it's recommended each division (e.g. a worker
	* thread in unicorn) to have its own instance.id.
	*
	* It's not recommended for a Collector to set `service.instance.id` if it can't unambiguously determine the
	* service instance that is generating that telemetry. For instance, creating an UUID based on `pod.name` will
	* likely be wrong, as the Collector might not know from which container within that pod the telemetry originated.
	* However, Collectors can set the `service.instance.id` if they can unambiguously determine the service instance
	* for that telemetry. This is typically the case for scraping receivers, as they know the target address and
	* port.
	*/
	exports.ATTR_SERVICE_INSTANCE_ID = "service.instance.id";
	/**
	* Logical name of the service.
	*
	* @example shoppingcart
	*
	* @note **MUST** be the same for all instances of horizontally scaled services. If the value was not specified, SDKs **MUST** fallback to `unknown_service:` concatenated with the process executable name, e.g. `unknown_service:bash`. If the process executable name is not available, the value **MUST** be set to `unknown_service`.
	* The process executable name is the name of the process executable, the same value as described by the [`process.executable.name`](process.md) resource attribute.
	*/
	exports.ATTR_SERVICE_NAME = "service.name";
	/**
	* A namespace for `service.name`.
	*
	* @example Shop
	*
	* @note A string value having a meaning that helps to distinguish a group of services, for example the team name that owns a group of services. `service.name` is expected to be unique within the same namespace. If `service.namespace` is not specified in the Resource then `service.name` is expected to be unique for all services that have no explicit namespace defined (so the empty/unspecified namespace is simply one more valid namespace). Zero-length namespace string is assumed equal to unspecified namespace.
	*/
	exports.ATTR_SERVICE_NAMESPACE = "service.namespace";
	/**
	* The version string of the service component. The format is not defined by these conventions.
	*
	* @example 2.0.0
	* @example a01dbef8a
	*/
	exports.ATTR_SERVICE_VERSION = "service.version";
	/**
	* SignalR HTTP connection closure status.
	*
	* @example app_shutdown
	* @example timeout
	*/
	exports.ATTR_SIGNALR_CONNECTION_STATUS = "signalr.connection.status";
	/**
	* Enum value "app_shutdown" for attribute {@link ATTR_SIGNALR_CONNECTION_STATUS}.
	*
	* The connection was closed because the app is shutting down.
	*/
	exports.SIGNALR_CONNECTION_STATUS_VALUE_APP_SHUTDOWN = "app_shutdown";
	/**
	* Enum value "normal_closure" for attribute {@link ATTR_SIGNALR_CONNECTION_STATUS}.
	*
	* The connection was closed normally.
	*/
	exports.SIGNALR_CONNECTION_STATUS_VALUE_NORMAL_CLOSURE = "normal_closure";
	/**
	* Enum value "timeout" for attribute {@link ATTR_SIGNALR_CONNECTION_STATUS}.
	*
	* The connection was closed due to a timeout.
	*/
	exports.SIGNALR_CONNECTION_STATUS_VALUE_TIMEOUT = "timeout";
	/**
	* [SignalR transport type](https://github.com/dotnet/aspnetcore/blob/main/src/SignalR/docs/specs/TransportProtocols.md)
	*
	* @example web_sockets
	* @example long_polling
	*/
	exports.ATTR_SIGNALR_TRANSPORT = "signalr.transport";
	/**
	* Enum value "long_polling" for attribute {@link ATTR_SIGNALR_TRANSPORT}.
	*
	* LongPolling protocol
	*/
	exports.SIGNALR_TRANSPORT_VALUE_LONG_POLLING = "long_polling";
	/**
	* Enum value "server_sent_events" for attribute {@link ATTR_SIGNALR_TRANSPORT}.
	*
	* ServerSentEvents protocol
	*/
	exports.SIGNALR_TRANSPORT_VALUE_SERVER_SENT_EVENTS = "server_sent_events";
	/**
	* Enum value "web_sockets" for attribute {@link ATTR_SIGNALR_TRANSPORT}.
	*
	* WebSockets protocol
	*/
	exports.SIGNALR_TRANSPORT_VALUE_WEB_SOCKETS = "web_sockets";
	/**
	* The name of the auto instrumentation agent or distribution, if used.
	*
	* @example parts-unlimited-java
	*
	* @note Official auto instrumentation agents and distributions **SHOULD** set the `telemetry.distro.name` attribute to
	* a string starting with `opentelemetry-`, e.g. `opentelemetry-java-instrumentation`.
	*/
	exports.ATTR_TELEMETRY_DISTRO_NAME = "telemetry.distro.name";
	/**
	* The version string of the auto instrumentation agent or distribution, if used.
	*
	* @example 1.2.3
	*/
	exports.ATTR_TELEMETRY_DISTRO_VERSION = "telemetry.distro.version";
	/**
	* The language of the telemetry SDK.
	*/
	exports.ATTR_TELEMETRY_SDK_LANGUAGE = "telemetry.sdk.language";
	/**
	* Enum value "cpp" for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
	*/
	exports.TELEMETRY_SDK_LANGUAGE_VALUE_CPP = "cpp";
	/**
	* Enum value "dotnet" for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
	*/
	exports.TELEMETRY_SDK_LANGUAGE_VALUE_DOTNET = "dotnet";
	/**
	* Enum value "erlang" for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
	*/
	exports.TELEMETRY_SDK_LANGUAGE_VALUE_ERLANG = "erlang";
	/**
	* Enum value "go" for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
	*/
	exports.TELEMETRY_SDK_LANGUAGE_VALUE_GO = "go";
	/**
	* Enum value "java" for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
	*/
	exports.TELEMETRY_SDK_LANGUAGE_VALUE_JAVA = "java";
	/**
	* Enum value "nodejs" for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
	*/
	exports.TELEMETRY_SDK_LANGUAGE_VALUE_NODEJS = "nodejs";
	/**
	* Enum value "php" for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
	*/
	exports.TELEMETRY_SDK_LANGUAGE_VALUE_PHP = "php";
	/**
	* Enum value "python" for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
	*/
	exports.TELEMETRY_SDK_LANGUAGE_VALUE_PYTHON = "python";
	/**
	* Enum value "ruby" for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
	*/
	exports.TELEMETRY_SDK_LANGUAGE_VALUE_RUBY = "ruby";
	/**
	* Enum value "rust" for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
	*/
	exports.TELEMETRY_SDK_LANGUAGE_VALUE_RUST = "rust";
	/**
	* Enum value "swift" for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
	*/
	exports.TELEMETRY_SDK_LANGUAGE_VALUE_SWIFT = "swift";
	/**
	* Enum value "webjs" for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
	*/
	exports.TELEMETRY_SDK_LANGUAGE_VALUE_WEBJS = "webjs";
	/**
	* The name of the telemetry SDK as defined above.
	*
	* @example opentelemetry
	*
	* @note The OpenTelemetry SDK **MUST** set the `telemetry.sdk.name` attribute to `opentelemetry`.
	* If another SDK, like a fork or a vendor-provided implementation, is used, this SDK **MUST** set the
	* `telemetry.sdk.name` attribute to the fully-qualified class or module name of this SDK's main entry point
	* or another suitable identifier depending on the language.
	* The identifier `opentelemetry` is reserved and **MUST NOT** be used in this case.
	* All custom identifiers **SHOULD** be stable across different versions of an implementation.
	*/
	exports.ATTR_TELEMETRY_SDK_NAME = "telemetry.sdk.name";
	/**
	* The version string of the telemetry SDK.
	*
	* @example 1.2.3
	*/
	exports.ATTR_TELEMETRY_SDK_VERSION = "telemetry.sdk.version";
	/**
	* The [URI fragment](https://www.rfc-editor.org/rfc/rfc3986#section-3.5) component
	*
	* @example SemConv
	*/
	exports.ATTR_URL_FRAGMENT = "url.fragment";
	/**
	* Absolute URL describing a network resource according to [RFC3986](https://www.rfc-editor.org/rfc/rfc3986)
	*
	* @example https://www.foo.bar/search?q=OpenTelemetry#SemConv
	* @example //localhost
	*
	* @note For network calls, URL usually has `scheme://host[:port][path][?query][#fragment]` format, where the fragment
	* is not transmitted over HTTP, but if it is known, it **SHOULD** be included nevertheless.
	*
	* `url.full` **MUST NOT** contain credentials passed via URL in form of `https://username:password@www.example.com/`.
	* In such case username and password **SHOULD** be redacted and attribute's value **SHOULD** be `https://REDACTED:REDACTED@www.example.com/`.
	*
	* `url.full` **SHOULD** capture the absolute URL when it is available (or can be reconstructed).
	*
	* Sensitive content provided in `url.full` **SHOULD** be scrubbed when instrumentations can identify it.
	*
	*
	* Query string values for the following keys **SHOULD** be redacted by default and replaced by the
	* value `REDACTED`:
	*
	*   - [`AWSAccessKeyId`](https://docs.aws.amazon.com/AmazonS3/latest/userguide/RESTAuthentication.html#RESTAuthenticationQueryStringAuth)
	*   - [`Signature`](https://docs.aws.amazon.com/AmazonS3/latest/userguide/RESTAuthentication.html#RESTAuthenticationQueryStringAuth)
	*   - [`sig`](https://learn.microsoft.com/azure/storage/common/storage-sas-overview#sas-token)
	*   - [`X-Goog-Signature`](https://cloud.google.com/storage/docs/access-control/signed-urls)
	*
	* This list is subject to change over time.
	*
	* Matching of query parameter keys against the sensitive list **SHOULD** be case-sensitive.
	*
	*
	* Instrumentation **MAY** provide a way to override this list via declarative configuration.
	* If so, it **SHOULD** use the `sensitive_query_parameters` property
	* (an array of case-sensitive strings with minimum items 0) under
	* `.instrumentation/development.general.sanitization.url`.
	* This list is a full override of the default sensitive query parameter keys,
	* it is not a list of keys in addition to the defaults.
	*
	* When a query string value is redacted, the query string key **SHOULD** still be preserved, e.g.
	* `https://www.example.com/path?color=blue&sig=REDACTED`.
	*/
	exports.ATTR_URL_FULL = "url.full";
	/**
	* The [URI path](https://www.rfc-editor.org/rfc/rfc3986#section-3.3) component
	*
	* @example /search
	*
	* @note Sensitive content provided in `url.path` **SHOULD** be scrubbed when instrumentations can identify it.
	*/
	exports.ATTR_URL_PATH = "url.path";
	/**
	* The [URI query](https://www.rfc-editor.org/rfc/rfc3986#section-3.4) component
	*
	* @example q=OpenTelemetry
	*
	* @note Sensitive content provided in `url.query` **SHOULD** be scrubbed when instrumentations can identify it.
	*
	*
	* Query string values for the following keys **SHOULD** be redacted by default and replaced by the value `REDACTED`:
	*
	*   - [`AWSAccessKeyId`](https://docs.aws.amazon.com/AmazonS3/latest/userguide/RESTAuthentication.html#RESTAuthenticationQueryStringAuth)
	*   - [`Signature`](https://docs.aws.amazon.com/AmazonS3/latest/userguide/RESTAuthentication.html#RESTAuthenticationQueryStringAuth)
	*   - [`sig`](https://learn.microsoft.com/azure/storage/common/storage-sas-overview#sas-token)
	*   - [`X-Goog-Signature`](https://cloud.google.com/storage/docs/access-control/signed-urls)
	*
	* This list is subject to change over time.
	*
	* Matching of query parameter keys against the sensitive list **SHOULD** be case-sensitive.
	*
	* Instrumentation **MAY** provide a way to override this list via declarative configuration.
	* If so, it **SHOULD** use the `sensitive_query_parameters` property
	* (an array of case-sensitive strings with minimum items 0) under
	* `.instrumentation/development.general.sanitization.url`.
	* This list is a full override of the default sensitive query parameter keys,
	* it is not a list of keys in addition to the defaults.
	*
	* When a query string value is redacted, the query string key **SHOULD** still be preserved, e.g.
	* `q=OpenTelemetry&sig=REDACTED`.
	*/
	exports.ATTR_URL_QUERY = "url.query";
	/**
	* The [URI scheme](https://www.rfc-editor.org/rfc/rfc3986#section-3.1) component identifying the used protocol.
	*
	* @example https
	* @example ftp
	* @example telnet
	*/
	exports.ATTR_URL_SCHEME = "url.scheme";
	/**
	* Value of the [HTTP User-Agent](https://www.rfc-editor.org/rfc/rfc9110.html#field.user-agent) header sent by the client.
	*
	* @example CERN-LineMode/2.15 libwww/2.17b3
	* @example Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1
	* @example YourApp/1.0.0 grpc-java-okhttp/1.27.2
	*/
	exports.ATTR_USER_AGENT_ORIGINAL = "user_agent.original";
}));
//#endregion
//#region node_modules/@opentelemetry/semantic-conventions/build/src/stable_metrics.js
var require_stable_metrics = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.METRIC_SIGNALR_SERVER_ACTIVE_CONNECTIONS = exports.METRIC_KESTREL_UPGRADED_CONNECTIONS = exports.METRIC_KESTREL_TLS_HANDSHAKE_DURATION = exports.METRIC_KESTREL_REJECTED_CONNECTIONS = exports.METRIC_KESTREL_QUEUED_REQUESTS = exports.METRIC_KESTREL_QUEUED_CONNECTIONS = exports.METRIC_KESTREL_CONNECTION_DURATION = exports.METRIC_KESTREL_ACTIVE_TLS_HANDSHAKES = exports.METRIC_KESTREL_ACTIVE_CONNECTIONS = exports.METRIC_JVM_THREAD_COUNT = exports.METRIC_JVM_MEMORY_USED_AFTER_LAST_GC = exports.METRIC_JVM_MEMORY_USED = exports.METRIC_JVM_MEMORY_LIMIT = exports.METRIC_JVM_MEMORY_COMMITTED = exports.METRIC_JVM_GC_DURATION = exports.METRIC_JVM_CPU_TIME = exports.METRIC_JVM_CPU_RECENT_UTILIZATION = exports.METRIC_JVM_CPU_COUNT = exports.METRIC_JVM_CLASS_UNLOADED = exports.METRIC_JVM_CLASS_LOADED = exports.METRIC_JVM_CLASS_COUNT = exports.METRIC_HTTP_SERVER_REQUEST_DURATION = exports.METRIC_HTTP_CLIENT_REQUEST_DURATION = exports.METRIC_DOTNET_TIMER_COUNT = exports.METRIC_DOTNET_THREAD_POOL_WORK_ITEM_COUNT = exports.METRIC_DOTNET_THREAD_POOL_THREAD_COUNT = exports.METRIC_DOTNET_THREAD_POOL_QUEUE_LENGTH = exports.METRIC_DOTNET_PROCESS_MEMORY_WORKING_SET = exports.METRIC_DOTNET_PROCESS_CPU_TIME = exports.METRIC_DOTNET_PROCESS_CPU_COUNT = exports.METRIC_DOTNET_MONITOR_LOCK_CONTENTIONS = exports.METRIC_DOTNET_JIT_COMPILED_METHODS = exports.METRIC_DOTNET_JIT_COMPILED_IL_SIZE = exports.METRIC_DOTNET_JIT_COMPILATION_TIME = exports.METRIC_DOTNET_GC_PAUSE_TIME = exports.METRIC_DOTNET_GC_LAST_COLLECTION_MEMORY_COMMITTED_SIZE = exports.METRIC_DOTNET_GC_LAST_COLLECTION_HEAP_SIZE = exports.METRIC_DOTNET_GC_LAST_COLLECTION_HEAP_FRAGMENTATION_SIZE = exports.METRIC_DOTNET_GC_HEAP_TOTAL_ALLOCATED = exports.METRIC_DOTNET_GC_COLLECTIONS = exports.METRIC_DOTNET_EXCEPTIONS = exports.METRIC_DOTNET_ASSEMBLY_COUNT = exports.METRIC_DB_CLIENT_OPERATION_DURATION = exports.METRIC_ASPNETCORE_ROUTING_MATCH_ATTEMPTS = exports.METRIC_ASPNETCORE_RATE_LIMITING_REQUESTS = exports.METRIC_ASPNETCORE_RATE_LIMITING_REQUEST_LEASE_DURATION = exports.METRIC_ASPNETCORE_RATE_LIMITING_REQUEST_TIME_IN_QUEUE = exports.METRIC_ASPNETCORE_RATE_LIMITING_QUEUED_REQUESTS = exports.METRIC_ASPNETCORE_RATE_LIMITING_ACTIVE_REQUEST_LEASES = exports.METRIC_ASPNETCORE_DIAGNOSTICS_EXCEPTIONS = void 0;
	exports.METRIC_SIGNALR_SERVER_CONNECTION_DURATION = void 0;
	/**
	* Number of exceptions caught by exception handling middleware.
	*
	* @note Meter name: `Microsoft.AspNetCore.Diagnostics`; Added in: ASP.NET Core 8.0
	*/
	exports.METRIC_ASPNETCORE_DIAGNOSTICS_EXCEPTIONS = "aspnetcore.diagnostics.exceptions";
	/**
	* Number of requests that are currently active on the server that hold a rate limiting lease.
	*
	* @note Meter name: `Microsoft.AspNetCore.RateLimiting`; Added in: ASP.NET Core 8.0
	*/
	exports.METRIC_ASPNETCORE_RATE_LIMITING_ACTIVE_REQUEST_LEASES = "aspnetcore.rate_limiting.active_request_leases";
	/**
	* Number of requests that are currently queued, waiting to acquire a rate limiting lease.
	*
	* @note Meter name: `Microsoft.AspNetCore.RateLimiting`; Added in: ASP.NET Core 8.0
	*/
	exports.METRIC_ASPNETCORE_RATE_LIMITING_QUEUED_REQUESTS = "aspnetcore.rate_limiting.queued_requests";
	/**
	* The time the request spent in a queue waiting to acquire a rate limiting lease.
	*
	* @note Meter name: `Microsoft.AspNetCore.RateLimiting`; Added in: ASP.NET Core 8.0
	*/
	exports.METRIC_ASPNETCORE_RATE_LIMITING_REQUEST_TIME_IN_QUEUE = "aspnetcore.rate_limiting.request.time_in_queue";
	/**
	* The duration of rate limiting lease held by requests on the server.
	*
	* @note Meter name: `Microsoft.AspNetCore.RateLimiting`; Added in: ASP.NET Core 8.0
	*/
	exports.METRIC_ASPNETCORE_RATE_LIMITING_REQUEST_LEASE_DURATION = "aspnetcore.rate_limiting.request_lease.duration";
	/**
	* Number of requests that tried to acquire a rate limiting lease.
	*
	* @note Requests could be:
	*
	*   - Rejected by global or endpoint rate limiting policies
	*   - Canceled while waiting for the lease.
	*
	* Meter name: `Microsoft.AspNetCore.RateLimiting`; Added in: ASP.NET Core 8.0
	*/
	exports.METRIC_ASPNETCORE_RATE_LIMITING_REQUESTS = "aspnetcore.rate_limiting.requests";
	/**
	* Number of requests that were attempted to be matched to an endpoint.
	*
	* @note Meter name: `Microsoft.AspNetCore.Routing`; Added in: ASP.NET Core 8.0
	*/
	exports.METRIC_ASPNETCORE_ROUTING_MATCH_ATTEMPTS = "aspnetcore.routing.match_attempts";
	/**
	* Duration of database client operations.
	*
	* @note Batch operations **SHOULD** be recorded as a single operation.
	*/
	exports.METRIC_DB_CLIENT_OPERATION_DURATION = "db.client.operation.duration";
	/**
	* The number of .NET assemblies that are currently loaded.
	*
	* @note Meter name: `System.Runtime`; Added in: .NET 9.0.
	* This metric reports the same values as calling [`AppDomain.CurrentDomain.GetAssemblies().Length`](https://learn.microsoft.com/dotnet/api/system.appdomain.getassemblies).
	*/
	exports.METRIC_DOTNET_ASSEMBLY_COUNT = "dotnet.assembly.count";
	/**
	* The number of exceptions that have been thrown in managed code.
	*
	* @note Meter name: `System.Runtime`; Added in: .NET 9.0.
	* This metric reports the same values as counting calls to [`AppDomain.CurrentDomain.FirstChanceException`](https://learn.microsoft.com/dotnet/api/system.appdomain.firstchanceexception).
	*/
	exports.METRIC_DOTNET_EXCEPTIONS = "dotnet.exceptions";
	/**
	* The number of garbage collections that have occurred since the process has started.
	*
	* @note Meter name: `System.Runtime`; Added in: .NET 9.0.
	* This metric uses the [`GC.CollectionCount(int generation)`](https://learn.microsoft.com/dotnet/api/system.gc.collectioncount) API to calculate exclusive collections per generation.
	*/
	exports.METRIC_DOTNET_GC_COLLECTIONS = "dotnet.gc.collections";
	/**
	* The *approximate* number of bytes allocated on the managed GC heap since the process has started. The returned value does not include any native allocations.
	*
	* @note Meter name: `System.Runtime`; Added in: .NET 9.0.
	* This metric reports the same values as calling [`GC.GetTotalAllocatedBytes()`](https://learn.microsoft.com/dotnet/api/system.gc.gettotalallocatedbytes).
	*/
	exports.METRIC_DOTNET_GC_HEAP_TOTAL_ALLOCATED = "dotnet.gc.heap.total_allocated";
	/**
	* The heap fragmentation, as observed during the latest garbage collection.
	*
	* @note Meter name: `System.Runtime`; Added in: .NET 9.0.
	* This metric reports the same values as calling [`GC.GetGCMemoryInfo().GenerationInfo.FragmentationAfterBytes`](https://learn.microsoft.com/dotnet/api/system.gcgenerationinfo.fragmentationafterbytes).
	*/
	exports.METRIC_DOTNET_GC_LAST_COLLECTION_HEAP_FRAGMENTATION_SIZE = "dotnet.gc.last_collection.heap.fragmentation.size";
	/**
	* The managed GC heap size (including fragmentation), as observed during the latest garbage collection.
	*
	* @note Meter name: `System.Runtime`; Added in: .NET 9.0.
	* This metric reports the same values as calling [`GC.GetGCMemoryInfo().GenerationInfo.SizeAfterBytes`](https://learn.microsoft.com/dotnet/api/system.gcgenerationinfo.sizeafterbytes).
	*/
	exports.METRIC_DOTNET_GC_LAST_COLLECTION_HEAP_SIZE = "dotnet.gc.last_collection.heap.size";
	/**
	* The amount of committed virtual memory in use by the .NET GC, as observed during the latest garbage collection.
	*
	* @note Meter name: `System.Runtime`; Added in: .NET 9.0.
	* This metric reports the same values as calling [`GC.GetGCMemoryInfo().TotalCommittedBytes`](https://learn.microsoft.com/dotnet/api/system.gcmemoryinfo.totalcommittedbytes). Committed virtual memory may be larger than the heap size because it includes both memory for storing existing objects (the heap size) and some extra memory that is ready to handle newly allocated objects in the future.
	*/
	exports.METRIC_DOTNET_GC_LAST_COLLECTION_MEMORY_COMMITTED_SIZE = "dotnet.gc.last_collection.memory.committed_size";
	/**
	* The total amount of time paused in GC since the process has started.
	*
	* @note Meter name: `System.Runtime`; Added in: .NET 9.0.
	* This metric reports the same values as calling [`GC.GetTotalPauseDuration()`](https://learn.microsoft.com/dotnet/api/system.gc.gettotalpauseduration).
	*/
	exports.METRIC_DOTNET_GC_PAUSE_TIME = "dotnet.gc.pause.time";
	/**
	* The amount of time the JIT compiler has spent compiling methods since the process has started.
	*
	* @note Meter name: `System.Runtime`; Added in: .NET 9.0.
	* This metric reports the same values as calling [`JitInfo.GetCompilationTime()`](https://learn.microsoft.com/dotnet/api/system.runtime.jitinfo.getcompilationtime).
	*/
	exports.METRIC_DOTNET_JIT_COMPILATION_TIME = "dotnet.jit.compilation.time";
	/**
	* Count of bytes of intermediate language that have been compiled since the process has started.
	*
	* @note Meter name: `System.Runtime`; Added in: .NET 9.0.
	* This metric reports the same values as calling [`JitInfo.GetCompiledILBytes()`](https://learn.microsoft.com/dotnet/api/system.runtime.jitinfo.getcompiledilbytes).
	*/
	exports.METRIC_DOTNET_JIT_COMPILED_IL_SIZE = "dotnet.jit.compiled_il.size";
	/**
	* The number of times the JIT compiler (re)compiled methods since the process has started.
	*
	* @note Meter name: `System.Runtime`; Added in: .NET 9.0.
	* This metric reports the same values as calling [`JitInfo.GetCompiledMethodCount()`](https://learn.microsoft.com/dotnet/api/system.runtime.jitinfo.getcompiledmethodcount).
	*/
	exports.METRIC_DOTNET_JIT_COMPILED_METHODS = "dotnet.jit.compiled_methods";
	/**
	* The number of times there was contention when trying to acquire a monitor lock since the process has started.
	*
	* @note Meter name: `System.Runtime`; Added in: .NET 9.0.
	* This metric reports the same values as calling [`Monitor.LockContentionCount`](https://learn.microsoft.com/dotnet/api/system.threading.monitor.lockcontentioncount).
	*/
	exports.METRIC_DOTNET_MONITOR_LOCK_CONTENTIONS = "dotnet.monitor.lock_contentions";
	/**
	* The number of processors available to the process.
	*
	* @note Meter name: `System.Runtime`; Added in: .NET 9.0.
	* This metric reports the same values as accessing [`Environment.ProcessorCount`](https://learn.microsoft.com/dotnet/api/system.environment.processorcount).
	*/
	exports.METRIC_DOTNET_PROCESS_CPU_COUNT = "dotnet.process.cpu.count";
	/**
	* CPU time used by the process.
	*
	* @note Meter name: `System.Runtime`; Added in: .NET 9.0.
	* This metric reports the same values as accessing the corresponding processor time properties on [`System.Diagnostics.Process`](https://learn.microsoft.com/dotnet/api/system.diagnostics.process).
	*/
	exports.METRIC_DOTNET_PROCESS_CPU_TIME = "dotnet.process.cpu.time";
	/**
	* The number of bytes of physical memory mapped to the process context.
	*
	* @note Meter name: `System.Runtime`; Added in: .NET 9.0.
	* This metric reports the same values as calling [`Environment.WorkingSet`](https://learn.microsoft.com/dotnet/api/system.environment.workingset).
	*/
	exports.METRIC_DOTNET_PROCESS_MEMORY_WORKING_SET = "dotnet.process.memory.working_set";
	/**
	* The number of work items that are currently queued to be processed by the thread pool.
	*
	* @note Meter name: `System.Runtime`; Added in: .NET 9.0.
	* This metric reports the same values as calling [`ThreadPool.PendingWorkItemCount`](https://learn.microsoft.com/dotnet/api/system.threading.threadpool.pendingworkitemcount).
	*/
	exports.METRIC_DOTNET_THREAD_POOL_QUEUE_LENGTH = "dotnet.thread_pool.queue.length";
	/**
	* The number of thread pool threads that currently exist.
	*
	* @note Meter name: `System.Runtime`; Added in: .NET 9.0.
	* This metric reports the same values as calling [`ThreadPool.ThreadCount`](https://learn.microsoft.com/dotnet/api/system.threading.threadpool.threadcount).
	*/
	exports.METRIC_DOTNET_THREAD_POOL_THREAD_COUNT = "dotnet.thread_pool.thread.count";
	/**
	* The number of work items that the thread pool has completed since the process has started.
	*
	* @note Meter name: `System.Runtime`; Added in: .NET 9.0.
	* This metric reports the same values as calling [`ThreadPool.CompletedWorkItemCount`](https://learn.microsoft.com/dotnet/api/system.threading.threadpool.completedworkitemcount).
	*/
	exports.METRIC_DOTNET_THREAD_POOL_WORK_ITEM_COUNT = "dotnet.thread_pool.work_item.count";
	/**
	* The number of timer instances that are currently active.
	*
	* @note Meter name: `System.Runtime`; Added in: .NET 9.0.
	* This metric reports the same values as calling [`Timer.ActiveCount`](https://learn.microsoft.com/dotnet/api/system.threading.timer.activecount).
	*/
	exports.METRIC_DOTNET_TIMER_COUNT = "dotnet.timer.count";
	/**
	* Duration of HTTP client requests.
	*/
	exports.METRIC_HTTP_CLIENT_REQUEST_DURATION = "http.client.request.duration";
	/**
	* Duration of HTTP server requests.
	*/
	exports.METRIC_HTTP_SERVER_REQUEST_DURATION = "http.server.request.duration";
	/**
	* Number of classes currently loaded.
	*/
	exports.METRIC_JVM_CLASS_COUNT = "jvm.class.count";
	/**
	* Number of classes loaded since JVM start.
	*/
	exports.METRIC_JVM_CLASS_LOADED = "jvm.class.loaded";
	/**
	* Number of classes unloaded since JVM start.
	*/
	exports.METRIC_JVM_CLASS_UNLOADED = "jvm.class.unloaded";
	/**
	* Number of processors available to the Java virtual machine.
	*/
	exports.METRIC_JVM_CPU_COUNT = "jvm.cpu.count";
	/**
	* Recent CPU utilization for the process as reported by the JVM.
	*
	* @note The value range is [0.0,1.0]. This utilization is not defined as being for the specific interval since last measurement (unlike `system.cpu.utilization`). [Reference](https://docs.oracle.com/en/java/javase/17/docs/api/jdk.management/com/sun/management/OperatingSystemMXBean.html#getProcessCpuLoad()).
	*/
	exports.METRIC_JVM_CPU_RECENT_UTILIZATION = "jvm.cpu.recent_utilization";
	/**
	* CPU time used by the process as reported by the JVM.
	*/
	exports.METRIC_JVM_CPU_TIME = "jvm.cpu.time";
	/**
	* Duration of JVM garbage collection actions.
	*/
	exports.METRIC_JVM_GC_DURATION = "jvm.gc.duration";
	/**
	* Measure of memory committed.
	*/
	exports.METRIC_JVM_MEMORY_COMMITTED = "jvm.memory.committed";
	/**
	* Measure of max obtainable memory.
	*/
	exports.METRIC_JVM_MEMORY_LIMIT = "jvm.memory.limit";
	/**
	* Measure of memory used.
	*/
	exports.METRIC_JVM_MEMORY_USED = "jvm.memory.used";
	/**
	* Measure of memory used, as measured after the most recent garbage collection event on this pool.
	*/
	exports.METRIC_JVM_MEMORY_USED_AFTER_LAST_GC = "jvm.memory.used_after_last_gc";
	/**
	* Number of executing platform threads.
	*/
	exports.METRIC_JVM_THREAD_COUNT = "jvm.thread.count";
	/**
	* Number of connections that are currently active on the server.
	*
	* @note Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0
	*/
	exports.METRIC_KESTREL_ACTIVE_CONNECTIONS = "kestrel.active_connections";
	/**
	* Number of TLS handshakes that are currently in progress on the server.
	*
	* @note Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0
	*/
	exports.METRIC_KESTREL_ACTIVE_TLS_HANDSHAKES = "kestrel.active_tls_handshakes";
	/**
	* The duration of connections on the server.
	*
	* @note Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0
	*/
	exports.METRIC_KESTREL_CONNECTION_DURATION = "kestrel.connection.duration";
	/**
	* Number of connections that are currently queued and are waiting to start.
	*
	* @note Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0
	*/
	exports.METRIC_KESTREL_QUEUED_CONNECTIONS = "kestrel.queued_connections";
	/**
	* Number of HTTP requests on multiplexed connections (HTTP/2 and HTTP/3) that are currently queued and are waiting to start.
	*
	* @note Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0
	*/
	exports.METRIC_KESTREL_QUEUED_REQUESTS = "kestrel.queued_requests";
	/**
	* Number of connections rejected by the server.
	*
	* @note Connections are rejected when the currently active count exceeds the value configured with `MaxConcurrentConnections`.
	* Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0
	*/
	exports.METRIC_KESTREL_REJECTED_CONNECTIONS = "kestrel.rejected_connections";
	/**
	* The duration of TLS handshakes on the server.
	*
	* @note Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0
	*/
	exports.METRIC_KESTREL_TLS_HANDSHAKE_DURATION = "kestrel.tls_handshake.duration";
	/**
	* Number of connections that are currently upgraded (WebSockets). .
	*
	* @note The counter only tracks HTTP/1.1 connections.
	*
	* Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0
	*/
	exports.METRIC_KESTREL_UPGRADED_CONNECTIONS = "kestrel.upgraded_connections";
	/**
	* Number of connections that are currently active on the server.
	*
	* @note Meter name: `Microsoft.AspNetCore.Http.Connections`; Added in: ASP.NET Core 8.0
	*/
	exports.METRIC_SIGNALR_SERVER_ACTIVE_CONNECTIONS = "signalr.server.active_connections";
	/**
	* The duration of connections on the server.
	*
	* @note Meter name: `Microsoft.AspNetCore.Http.Connections`; Added in: ASP.NET Core 8.0
	*/
	exports.METRIC_SIGNALR_SERVER_CONNECTION_DURATION = "signalr.server.connection.duration";
}));
//#endregion
//#region node_modules/@opentelemetry/semantic-conventions/build/src/stable_events.js
var require_stable_events = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.EVENT_EXCEPTION = void 0;
	/**
	* This event describes a single exception.
	*/
	exports.EVENT_EXCEPTION = "exception";
}));
//#endregion
//#region node_modules/@opentelemetry/semantic-conventions/build/src/index.js
var require_src$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$1) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$1, p)) __createBinding(exports$1, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(require_trace(), exports);
	__exportStar(require_resource(), exports);
	__exportStar(require_stable_attributes(), exports);
	__exportStar(require_stable_metrics(), exports);
	__exportStar(require_stable_events(), exports);
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/src/semconv.js
var require_semconv = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ATTR_PROCESS_RUNTIME_NAME = void 0;
	/**
	* The name of the runtime of this process.
	*
	* @example OpenJDK Runtime Environment
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_PROCESS_RUNTIME_NAME = "process.runtime.name";
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/src/platform/node/sdk-info.js
var require_sdk_info = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SDK_INFO = void 0;
	const version_1 = require_version();
	const semantic_conventions_1 = require_src$1();
	const semconv_1 = require_semconv();
	/** Constants describing the SDK in use */
	exports.SDK_INFO = {
		[semantic_conventions_1.ATTR_TELEMETRY_SDK_NAME]: "opentelemetry",
		[semconv_1.ATTR_PROCESS_RUNTIME_NAME]: "node",
		[semantic_conventions_1.ATTR_TELEMETRY_SDK_LANGUAGE]: semantic_conventions_1.TELEMETRY_SDK_LANGUAGE_VALUE_NODEJS,
		[semantic_conventions_1.ATTR_TELEMETRY_SDK_VERSION]: version_1.VERSION
	};
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/src/platform/node/index.js
var require_node = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.otperformance = exports.SDK_INFO = exports._globalThis = exports.getStringListFromEnv = exports.getNumberFromEnv = exports.getBooleanFromEnv = exports.getStringFromEnv = void 0;
	var environment_1 = require_environment();
	Object.defineProperty(exports, "getStringFromEnv", {
		enumerable: true,
		get: function() {
			return environment_1.getStringFromEnv;
		}
	});
	Object.defineProperty(exports, "getBooleanFromEnv", {
		enumerable: true,
		get: function() {
			return environment_1.getBooleanFromEnv;
		}
	});
	Object.defineProperty(exports, "getNumberFromEnv", {
		enumerable: true,
		get: function() {
			return environment_1.getNumberFromEnv;
		}
	});
	Object.defineProperty(exports, "getStringListFromEnv", {
		enumerable: true,
		get: function() {
			return environment_1.getStringListFromEnv;
		}
	});
	var globalThis_1 = require_globalThis();
	Object.defineProperty(exports, "_globalThis", {
		enumerable: true,
		get: function() {
			return globalThis_1._globalThis;
		}
	});
	var sdk_info_1 = require_sdk_info();
	Object.defineProperty(exports, "SDK_INFO", {
		enumerable: true,
		get: function() {
			return sdk_info_1.SDK_INFO;
		}
	});
	/**
	* @deprecated Use performance directly.
	*/
	exports.otperformance = performance;
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/src/platform/index.js
var require_platform = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getStringListFromEnv = exports.getNumberFromEnv = exports.getStringFromEnv = exports.getBooleanFromEnv = exports.otperformance = exports._globalThis = exports.SDK_INFO = void 0;
	var node_1 = require_node();
	Object.defineProperty(exports, "SDK_INFO", {
		enumerable: true,
		get: function() {
			return node_1.SDK_INFO;
		}
	});
	Object.defineProperty(exports, "_globalThis", {
		enumerable: true,
		get: function() {
			return node_1._globalThis;
		}
	});
	Object.defineProperty(exports, "otperformance", {
		enumerable: true,
		get: function() {
			return node_1.otperformance;
		}
	});
	Object.defineProperty(exports, "getBooleanFromEnv", {
		enumerable: true,
		get: function() {
			return node_1.getBooleanFromEnv;
		}
	});
	Object.defineProperty(exports, "getStringFromEnv", {
		enumerable: true,
		get: function() {
			return node_1.getStringFromEnv;
		}
	});
	Object.defineProperty(exports, "getNumberFromEnv", {
		enumerable: true,
		get: function() {
			return node_1.getNumberFromEnv;
		}
	});
	Object.defineProperty(exports, "getStringListFromEnv", {
		enumerable: true,
		get: function() {
			return node_1.getStringListFromEnv;
		}
	});
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/src/common/time.js
var require_time = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.addHrTimes = exports.isTimeInput = exports.isTimeInputHrTime = exports.hrTimeToSeconds = exports.hrTimeToMilliseconds = exports.hrTimeToMicroseconds = exports.hrTimeToNanoseconds = exports.hrTimeToTimeStamp = exports.hrTimeDuration = exports.timeInputToHrTime = exports.hrTime = exports.getTimeOrigin = exports.millisToHrTime = void 0;
	const platform_1 = require_platform();
	const NANOSECOND_DIGITS = 9;
	const MILLISECONDS_TO_NANOSECONDS = Math.pow(10, 6);
	const SECOND_TO_NANOSECONDS = Math.pow(10, NANOSECOND_DIGITS);
	/**
	* Converts a number of milliseconds from epoch to HrTime([seconds, remainder in nanoseconds]).
	* @param epochMillis
	*/
	function millisToHrTime(epochMillis) {
		const epochSeconds = epochMillis / 1e3;
		return [Math.trunc(epochSeconds), Math.round(epochMillis % 1e3 * MILLISECONDS_TO_NANOSECONDS)];
	}
	exports.millisToHrTime = millisToHrTime;
	/**
	* @deprecated Use `performance.timeOrigin` directly.
	*/
	function getTimeOrigin() {
		return platform_1.otperformance.timeOrigin;
	}
	exports.getTimeOrigin = getTimeOrigin;
	/**
	* Returns an hrtime calculated via performance component.
	* @param performanceNow
	*/
	function hrTime(performanceNow) {
		return addHrTimes(millisToHrTime(platform_1.otperformance.timeOrigin), millisToHrTime(typeof performanceNow === "number" ? performanceNow : platform_1.otperformance.now()));
	}
	exports.hrTime = hrTime;
	/**
	*
	* Converts a TimeInput to an HrTime, defaults to _hrtime().
	* @param time
	*/
	function timeInputToHrTime(time) {
		if (isTimeInputHrTime(time)) return time;
		else if (typeof time === "number") if (time < platform_1.otperformance.timeOrigin) return hrTime(time);
		else return millisToHrTime(time);
		else if (time instanceof Date) return millisToHrTime(time.getTime());
		else throw TypeError("Invalid input type");
	}
	exports.timeInputToHrTime = timeInputToHrTime;
	/**
	* Returns a duration of two hrTime.
	* @param startTime
	* @param endTime
	*/
	function hrTimeDuration(startTime, endTime) {
		let seconds = endTime[0] - startTime[0];
		let nanos = endTime[1] - startTime[1];
		if (nanos < 0) {
			seconds -= 1;
			nanos += SECOND_TO_NANOSECONDS;
		}
		return [seconds, nanos];
	}
	exports.hrTimeDuration = hrTimeDuration;
	/**
	* Convert hrTime to timestamp, for example "2019-05-14T17:00:00.000123456Z"
	* @param time
	*/
	function hrTimeToTimeStamp(time) {
		const precision = NANOSECOND_DIGITS;
		const tmp = `${"0".repeat(precision)}${time[1]}Z`;
		const nanoString = tmp.substring(tmp.length - precision - 1);
		return (/* @__PURE__ */ new Date(time[0] * 1e3)).toISOString().replace("000Z", nanoString);
	}
	exports.hrTimeToTimeStamp = hrTimeToTimeStamp;
	/**
	* Convert hrTime to nanoseconds.
	* @param time
	*/
	function hrTimeToNanoseconds(time) {
		return time[0] * SECOND_TO_NANOSECONDS + time[1];
	}
	exports.hrTimeToNanoseconds = hrTimeToNanoseconds;
	/**
	* Convert hrTime to microseconds.
	* @param time
	*/
	function hrTimeToMicroseconds(time) {
		return time[0] * 1e6 + time[1] / 1e3;
	}
	exports.hrTimeToMicroseconds = hrTimeToMicroseconds;
	/**
	* Convert hrTime to milliseconds.
	* @param time
	*/
	function hrTimeToMilliseconds(time) {
		return time[0] * 1e3 + time[1] / 1e6;
	}
	exports.hrTimeToMilliseconds = hrTimeToMilliseconds;
	/**
	* Convert hrTime to seconds.
	* @param time
	*/
	function hrTimeToSeconds(time) {
		return time[0] + time[1] / SECOND_TO_NANOSECONDS;
	}
	exports.hrTimeToSeconds = hrTimeToSeconds;
	/**
	* check if time is HrTime
	* @param value
	*/
	function isTimeInputHrTime(value) {
		return Array.isArray(value) && value.length === 2 && typeof value[0] === "number" && typeof value[1] === "number";
	}
	exports.isTimeInputHrTime = isTimeInputHrTime;
	/**
	* check if input value is a correct types.TimeInput
	* @param value
	*/
	function isTimeInput(value) {
		return isTimeInputHrTime(value) || typeof value === "number" || value instanceof Date;
	}
	exports.isTimeInput = isTimeInput;
	/**
	* Given 2 HrTime formatted times, return their sum as an HrTime.
	*/
	function addHrTimes(time1, time2) {
		const out = [time1[0] + time2[0], time1[1] + time2[1]];
		if (out[1] >= SECOND_TO_NANOSECONDS) {
			out[1] -= SECOND_TO_NANOSECONDS;
			out[0] += 1;
		}
		return out;
	}
	exports.addHrTimes = addHrTimes;
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/src/common/timer-util.js
var require_timer_util = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.unrefTimer = void 0;
	/**
	* @deprecated please copy this code to your implementation instead, this function will be removed in the next major version of this package.
	* @param timer
	*/
	function unrefTimer(timer) {
		if (typeof timer !== "number") timer.unref();
	}
	exports.unrefTimer = unrefTimer;
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/src/ExportResult.js
var require_ExportResult = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ExportResultCode = void 0;
	(function(ExportResultCode) {
		ExportResultCode[ExportResultCode["SUCCESS"] = 0] = "SUCCESS";
		ExportResultCode[ExportResultCode["FAILED"] = 1] = "FAILED";
	})(exports.ExportResultCode || (exports.ExportResultCode = {}));
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/src/propagation/composite.js
var require_composite = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.CompositePropagator = void 0;
	const api_1 = require_src$2();
	/** Combines multiple propagators into a single propagator. */
	var CompositePropagator = class {
		_propagators;
		_fields;
		/**
		* Construct a composite propagator from a list of propagators.
		*
		* @param [config] Configuration object for composite propagator
		*/
		constructor(config = {}) {
			this._propagators = config.propagators ?? [];
			const fields = /* @__PURE__ */ new Set();
			for (const propagator of this._propagators) {
				const propagatorFields = typeof propagator.fields === "function" ? propagator.fields() : [];
				for (const field of propagatorFields) fields.add(field);
			}
			this._fields = Array.from(fields);
		}
		/**
		* Run each of the configured propagators with the given context and carrier.
		* Propagators are run in the order they are configured, so if multiple
		* propagators write the same carrier key, the propagator later in the list
		* will "win".
		*
		* @param context Context to inject
		* @param carrier Carrier into which context will be injected
		*/
		inject(context, carrier, setter) {
			for (const propagator of this._propagators) try {
				propagator.inject(context, carrier, setter);
			} catch (err) {
				api_1.diag.warn(`Failed to inject with ${propagator.constructor.name}. Err: ${err.message}`);
			}
		}
		/**
		* Run each of the configured propagators with the given context and carrier.
		* Propagators are run in the order they are configured, so if multiple
		* propagators write the same context key, the propagator later in the list
		* will "win".
		*
		* @param context Context to add values to
		* @param carrier Carrier from which to extract context
		*/
		extract(context, carrier, getter) {
			return this._propagators.reduce((ctx, propagator) => {
				try {
					return propagator.extract(ctx, carrier, getter);
				} catch (err) {
					api_1.diag.warn(`Failed to extract with ${propagator.constructor.name}. Err: ${err.message}`);
				}
				return ctx;
			}, context);
		}
		fields() {
			return this._fields.slice();
		}
	};
	exports.CompositePropagator = CompositePropagator;
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/src/internal/validators.js
var require_validators = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.validateValue = exports.validateKey = void 0;
	const VALID_KEY_CHAR_RANGE = "[_0-9a-z-*/]";
	const VALID_KEY_REGEX = new RegExp(`^(?:${`[a-z]${VALID_KEY_CHAR_RANGE}{0,255}`}|${`[a-z0-9]${VALID_KEY_CHAR_RANGE}{0,240}@[a-z]${VALID_KEY_CHAR_RANGE}{0,13}`})$`);
	const VALID_VALUE_BASE_REGEX = /^[ -~]{0,255}[!-~]$/;
	const INVALID_VALUE_COMMA_EQUAL_REGEX = /,|=/;
	/**
	* Key is opaque string up to 256 characters printable. It MUST begin with a
	* lowercase letter, and can only contain lowercase letters a-z, digits 0-9,
	* underscores _, dashes -, asterisks *, and forward slashes /.
	* For multi-tenant vendor scenarios, an at sign (@) can be used to prefix the
	* vendor name. Vendors SHOULD set the tenant ID at the beginning of the key.
	* see https://www.w3.org/TR/trace-context/#key
	*/
	function validateKey(key) {
		return VALID_KEY_REGEX.test(key);
	}
	exports.validateKey = validateKey;
	/**
	* Value is opaque string up to 256 characters printable ASCII RFC0020
	* characters (i.e., the range 0x20 to 0x7E) except comma , and =.
	*/
	function validateValue(value) {
		return VALID_VALUE_BASE_REGEX.test(value) && !INVALID_VALUE_COMMA_EQUAL_REGEX.test(value);
	}
	exports.validateValue = validateValue;
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/src/trace/TraceState.js
var require_TraceState = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.TraceState = void 0;
	const validators_1 = require_validators();
	const MAX_TRACE_STATE_ITEMS = 32;
	const MAX_TRACE_STATE_LEN = 512;
	const LIST_MEMBERS_SEPARATOR = ",";
	const LIST_MEMBER_KEY_VALUE_SPLITTER = "=";
	exports.TraceState = class TraceState {
		_length;
		_rawTraceState;
		_internalState;
		constructor(rawTraceState) {
			this._rawTraceState = typeof rawTraceState === "string" ? rawTraceState : "";
			this._length = this._rawTraceState.length;
		}
		set(key, value) {
			if (!(0, validators_1.validateKey)(key) || !(0, validators_1.validateValue)(value)) return this;
			const currState = this._getState();
			const currValue = currState.get(key);
			let newLength = this._length;
			if (typeof currValue === "string") newLength += value.length - currValue.length;
			else newLength += key.length + value.length + (currState.size > 0 ? 2 : 1);
			if (newLength > MAX_TRACE_STATE_LEN) return this;
			const newState = new Map(currState);
			newState.delete(key);
			newState.set(key, value);
			return this._fromState(newState, newLength);
		}
		unset(key) {
			const currState = this._getState();
			const currValue = currState.get(key);
			if (typeof currValue !== "string") return this;
			let newLength = this._length - (key.length + currValue.length + 1);
			if (currState.size > 1) newLength = newLength - 1;
			const newState = new Map(currState);
			newState.delete(key);
			return this._fromState(newState, newLength);
		}
		get(key) {
			return this._getState().get(key);
		}
		serialize() {
			let serialized = "";
			let index = 0;
			for (const entry of this._getState()) {
				if (index > 0) serialized = LIST_MEMBERS_SEPARATOR + serialized;
				serialized = `${entry[0]}${LIST_MEMBER_KEY_VALUE_SPLITTER}${entry[1]}` + serialized;
				index++;
			}
			return serialized;
		}
		_getState() {
			if (this._internalState) return this._internalState;
			const vendorMembers = this._rawTraceState.split(LIST_MEMBERS_SEPARATOR);
			const vendorEntries = /* @__PURE__ */ new Map();
			let currentLength = 0;
			for (const member of vendorMembers) {
				const m = member.trim();
				const idx = m.indexOf(LIST_MEMBER_KEY_VALUE_SPLITTER);
				if (idx === -1) continue;
				const key = m.slice(0, idx);
				const value = m.slice(idx + 1);
				if (!(0, validators_1.validateKey)(key) || !(0, validators_1.validateValue)(value)) continue;
				const futureLength = currentLength + m.length + (vendorEntries.size > 0 ? 1 : 0);
				if (futureLength > MAX_TRACE_STATE_LEN) continue;
				vendorEntries.set(key, value);
				currentLength = futureLength;
				if (vendorEntries.size >= MAX_TRACE_STATE_ITEMS) break;
			}
			this._length = currentLength;
			this._internalState = new Map(Array.from(vendorEntries.entries()).reverse());
			return this._internalState;
		}
		_fromState(state, length) {
			const traceState = Object.create(TraceState.prototype);
			traceState._internalState = state;
			traceState._length = length;
			return traceState;
		}
	};
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/src/trace/W3CTraceContextPropagator.js
var require_W3CTraceContextPropagator = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.W3CTraceContextPropagator = exports.parseTraceParent = exports.TRACE_STATE_HEADER = exports.TRACE_PARENT_HEADER = void 0;
	const api_1 = require_src$2();
	const suppress_tracing_1 = require_suppress_tracing();
	const TraceState_1 = require_TraceState();
	exports.TRACE_PARENT_HEADER = "traceparent";
	exports.TRACE_STATE_HEADER = "tracestate";
	const VERSION = "00";
	const TRACE_PARENT_REGEX = new RegExp(`^\\s?((?!ff)[\\da-f]{2})-((?![0]{32})[\\da-f]{32})-((?![0]{16})[\\da-f]{16})-([\\da-f]{2})(-.*)?\\s?$`);
	/**
	* Parses information from the [traceparent] span tag and converts it into {@link SpanContext}
	* @param traceParent - A meta property that comes from server.
	*     It should be dynamically generated server side to have the server's request trace Id,
	*     a parent span Id that was set on the server's request span,
	*     and the trace flags to indicate the server's sampling decision
	*     (01 = sampled, 00 = not sampled).
	*     for example: '{version}-{traceId}-{spanId}-{sampleDecision}'
	*     For more information see {@link https://www.w3.org/TR/trace-context/}
	*/
	function parseTraceParent(traceParent) {
		const match = TRACE_PARENT_REGEX.exec(traceParent);
		if (!match) return null;
		if (match[1] === "00" && match[5]) return null;
		return {
			traceId: match[2],
			spanId: match[3],
			traceFlags: parseInt(match[4], 16)
		};
	}
	exports.parseTraceParent = parseTraceParent;
	/**
	* Propagates {@link SpanContext} through Trace Context format propagation.
	*
	* Based on the Trace Context specification:
	* https://www.w3.org/TR/trace-context/
	*/
	var W3CTraceContextPropagator = class {
		inject(context, carrier, setter) {
			const spanContext = api_1.trace.getSpanContext(context);
			if (!spanContext || (0, suppress_tracing_1.isTracingSuppressed)(context) || !(0, api_1.isSpanContextValid)(spanContext)) return;
			const traceParent = `${VERSION}-${spanContext.traceId}-${spanContext.spanId}-0${Number(spanContext.traceFlags || api_1.TraceFlags.NONE).toString(16)}`;
			setter.set(carrier, exports.TRACE_PARENT_HEADER, traceParent);
			if (spanContext.traceState) setter.set(carrier, exports.TRACE_STATE_HEADER, spanContext.traceState.serialize());
		}
		extract(context, carrier, getter) {
			const traceParentHeader = getter.get(carrier, exports.TRACE_PARENT_HEADER);
			if (!traceParentHeader) return context;
			const traceParent = Array.isArray(traceParentHeader) ? traceParentHeader[0] : traceParentHeader;
			if (typeof traceParent !== "string") return context;
			const spanContext = parseTraceParent(traceParent);
			if (!spanContext) return context;
			spanContext.isRemote = true;
			const traceStateHeader = getter.get(carrier, exports.TRACE_STATE_HEADER);
			if (traceStateHeader) {
				const state = Array.isArray(traceStateHeader) ? traceStateHeader.join(",") : traceStateHeader;
				spanContext.traceState = new TraceState_1.TraceState(typeof state === "string" ? state : void 0);
			}
			return api_1.trace.setSpanContext(context, spanContext);
		}
		fields() {
			return [exports.TRACE_PARENT_HEADER, exports.TRACE_STATE_HEADER];
		}
	};
	exports.W3CTraceContextPropagator = W3CTraceContextPropagator;
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/src/trace/rpc-metadata.js
var require_rpc_metadata = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getRPCMetadata = exports.deleteRPCMetadata = exports.setRPCMetadata = exports.RPCType = void 0;
	const RPC_METADATA_KEY = (0, require_src$2().createContextKey)("OpenTelemetry SDK Context Key RPC_METADATA");
	(function(RPCType) {
		RPCType["HTTP"] = "http";
	})(exports.RPCType || (exports.RPCType = {}));
	function setRPCMetadata(context, meta) {
		return context.setValue(RPC_METADATA_KEY, meta);
	}
	exports.setRPCMetadata = setRPCMetadata;
	function deleteRPCMetadata(context) {
		return context.deleteValue(RPC_METADATA_KEY);
	}
	exports.deleteRPCMetadata = deleteRPCMetadata;
	function getRPCMetadata(context) {
		return context.getValue(RPC_METADATA_KEY);
	}
	exports.getRPCMetadata = getRPCMetadata;
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/src/utils/lodash.merge.js
var require_lodash_merge = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isPlainObject = void 0;
	/**
	* based on lodash in order to support esm builds without esModuleInterop.
	* lodash is using MIT License.
	**/
	const objectTag = "[object Object]";
	const nullTag = "[object Null]";
	const undefinedTag = "[object Undefined]";
	const funcToString = Function.prototype.toString;
	const objectCtorString = funcToString.call(Object);
	const getPrototypeOf = Object.getPrototypeOf;
	const objectProto = Object.prototype;
	const hasOwnProperty = objectProto.hasOwnProperty;
	const symToStringTag = Symbol ? Symbol.toStringTag : void 0;
	const nativeObjectToString = objectProto.toString;
	/**
	* Checks if `value` is a plain object, that is, an object created by the
	* `Object` constructor or one with a `[[Prototype]]` of `null`.
	*
	* @static
	* @memberOf _
	* @since 0.8.0
	* @category Lang
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
	* @example
	*
	* function Foo() {
	*   this.a = 1;
	* }
	*
	* _.isPlainObject(new Foo);
	* // => false
	*
	* _.isPlainObject([1, 2, 3]);
	* // => false
	*
	* _.isPlainObject({ 'x': 0, 'y': 0 });
	* // => true
	*
	* _.isPlainObject(Object.create(null));
	* // => true
	*/
	function isPlainObject(value) {
		if (!isObjectLike(value) || baseGetTag(value) !== objectTag) return false;
		const proto = getPrototypeOf(value);
		if (proto === null) return true;
		const Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
		return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) === objectCtorString;
	}
	exports.isPlainObject = isPlainObject;
	/**
	* Checks if `value` is object-like. A value is object-like if it's not `null`
	* and has a `typeof` result of "object".
	*
	* @static
	* @memberOf _
	* @since 4.0.0
	* @category Lang
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	* @example
	*
	* _.isObjectLike({});
	* // => true
	*
	* _.isObjectLike([1, 2, 3]);
	* // => true
	*
	* _.isObjectLike(_.noop);
	* // => false
	*
	* _.isObjectLike(null);
	* // => false
	*/
	function isObjectLike(value) {
		return value != null && typeof value == "object";
	}
	/**
	* The base implementation of `getTag` without fallbacks for buggy environments.
	*
	* @private
	* @param {*} value The value to query.
	* @returns {string} Returns the `toStringTag`.
	*/
	function baseGetTag(value) {
		if (value == null) return value === void 0 ? undefinedTag : nullTag;
		return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
	}
	/**
	* A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
	*
	* @private
	* @param {*} value The value to query.
	* @returns {string} Returns the raw `toStringTag`.
	*/
	function getRawTag(value) {
		const isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
		let unmasked = false;
		try {
			value[symToStringTag] = void 0;
			unmasked = true;
		} catch {}
		const result = nativeObjectToString.call(value);
		if (unmasked) if (isOwn) value[symToStringTag] = tag;
		else delete value[symToStringTag];
		return result;
	}
	/**
	* Converts `value` to a string using `Object.prototype.toString`.
	*
	* @private
	* @param {*} value The value to convert.
	* @returns {string} Returns the converted string.
	*/
	function objectToString(value) {
		return nativeObjectToString.call(value);
	}
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/src/utils/merge.js
var require_merge = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.merge = void 0;
	const lodash_merge_1 = require_lodash_merge();
	const MAX_LEVEL = 20;
	/**
	* Merges objects together
	* @param args - objects / values to be merged
	*/
	function merge(...args) {
		let result = args.shift();
		const objects = /* @__PURE__ */ new WeakMap();
		while (args.length > 0) result = mergeTwoObjects(result, args.shift(), 0, objects);
		return result;
	}
	exports.merge = merge;
	function takeValue(value) {
		if (isArray(value)) return value.slice();
		return value;
	}
	/**
	* Merges two objects
	* @param one - first object
	* @param two - second object
	* @param level - current deep level
	* @param objects - objects holder that has been already referenced - to prevent
	* cyclic dependency
	*/
	function mergeTwoObjects(one, two, level = 0, objects) {
		let result;
		if (level > MAX_LEVEL) return;
		level++;
		if (isPrimitive(one) || isPrimitive(two) || isFunction(two)) result = takeValue(two);
		else if (isArray(one)) {
			result = one.slice();
			if (isArray(two)) for (let i = 0, j = two.length; i < j; i++) result.push(takeValue(two[i]));
			else if (isObject(two)) {
				const keys = Object.keys(two);
				for (let i = 0, j = keys.length; i < j; i++) {
					const key = keys[i];
					if (key === "__proto__" || key === "constructor" || key === "prototype") continue;
					result[key] = takeValue(two[key]);
				}
			}
		} else if (isObject(one)) if (isObject(two)) {
			if (!shouldMerge(one, two)) return two;
			result = Object.assign({}, one);
			const keys = Object.keys(two);
			for (let i = 0, j = keys.length; i < j; i++) {
				const key = keys[i];
				if (key === "__proto__" || key === "constructor" || key === "prototype") continue;
				const twoValue = two[key];
				if (isPrimitive(twoValue)) if (typeof twoValue === "undefined") delete result[key];
				else result[key] = twoValue;
				else {
					const obj1 = result[key];
					const obj2 = twoValue;
					if (wasObjectReferenced(one, key, objects) || wasObjectReferenced(two, key, objects)) delete result[key];
					else {
						if (isObject(obj1) && isObject(obj2)) {
							const arr1 = objects.get(obj1) || [];
							const arr2 = objects.get(obj2) || [];
							arr1.push({
								obj: one,
								key
							});
							arr2.push({
								obj: two,
								key
							});
							objects.set(obj1, arr1);
							objects.set(obj2, arr2);
						}
						result[key] = mergeTwoObjects(result[key], twoValue, level, objects);
					}
				}
			}
		} else result = two;
		return result;
	}
	/**
	* Function to check if object has been already reference
	* @param obj
	* @param key
	* @param objects
	*/
	function wasObjectReferenced(obj, key, objects) {
		const arr = objects.get(obj[key]) || [];
		for (let i = 0, j = arr.length; i < j; i++) {
			const info = arr[i];
			if (info.key === key && info.obj === obj) return true;
		}
		return false;
	}
	function isArray(value) {
		return Array.isArray(value);
	}
	function isFunction(value) {
		return typeof value === "function";
	}
	function isObject(value) {
		return !isPrimitive(value) && !isArray(value) && !isFunction(value) && typeof value === "object";
	}
	function isPrimitive(value) {
		return typeof value === "string" || typeof value === "number" || typeof value === "boolean" || typeof value === "undefined" || value instanceof Date || value instanceof RegExp || value === null;
	}
	function shouldMerge(one, two) {
		if (!(0, lodash_merge_1.isPlainObject)(one) || !(0, lodash_merge_1.isPlainObject)(two)) return false;
		return true;
	}
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/src/utils/timeout.js
var require_timeout = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.callWithTimeout = exports.TimeoutError = void 0;
	/**
	* Error that is thrown on timeouts.
	*/
	var TimeoutError = class TimeoutError extends Error {
		constructor(message) {
			super(message);
			Object.setPrototypeOf(this, TimeoutError.prototype);
		}
	};
	exports.TimeoutError = TimeoutError;
	/**
	* Adds a timeout to a promise and rejects if the specified timeout has elapsed. Also rejects if the specified promise
	* rejects, and resolves if the specified promise resolves.
	*
	* <p> NOTE: this operation will continue even after it throws a {@link TimeoutError}.
	*
	* @param promise promise to use with timeout.
	* @param timeout the timeout in milliseconds until the returned promise is rejected.
	*/
	function callWithTimeout(promise, timeout) {
		let timeoutHandle;
		const timeoutPromise = new Promise(function timeoutFunction(_resolve, reject) {
			timeoutHandle = setTimeout(function timeoutHandler() {
				reject(new TimeoutError("Operation timed out."));
			}, timeout);
		});
		return Promise.race([promise, timeoutPromise]).then((result) => {
			clearTimeout(timeoutHandle);
			return result;
		}, (reason) => {
			clearTimeout(timeoutHandle);
			throw reason;
		});
	}
	exports.callWithTimeout = callWithTimeout;
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/src/utils/url.js
var require_url = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isUrlIgnored = exports.urlMatches = void 0;
	function urlMatches(url, urlToMatch) {
		if (typeof urlToMatch === "string") return url === urlToMatch;
		else return !!url.match(urlToMatch);
	}
	exports.urlMatches = urlMatches;
	/**
	* Check if {@param url} should be ignored when comparing against {@param ignoredUrls}
	* @param url
	* @param ignoredUrls
	*/
	function isUrlIgnored(url, ignoredUrls) {
		if (!ignoredUrls) return false;
		for (const ignoreUrl of ignoredUrls) if (urlMatches(url, ignoreUrl)) return true;
		return false;
	}
	exports.isUrlIgnored = isUrlIgnored;
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/src/utils/promise.js
var require_promise = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Deferred = void 0;
	var Deferred = class {
		_promise;
		_resolve;
		_reject;
		constructor() {
			this._promise = new Promise((resolve, reject) => {
				this._resolve = resolve;
				this._reject = reject;
			});
		}
		get promise() {
			return this._promise;
		}
		resolve(val) {
			this._resolve(val);
		}
		reject(err) {
			this._reject(err);
		}
	};
	exports.Deferred = Deferred;
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/src/utils/callback.js
var require_callback = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.BindOnceFuture = void 0;
	const promise_1 = require_promise();
	/**
	* Bind the callback and only invoke the callback once regardless how many times `BindOnceFuture.call` is invoked.
	*/
	var BindOnceFuture = class {
		_isCalled = false;
		_deferred = new promise_1.Deferred();
		_callback;
		_that;
		constructor(callback, that) {
			this._callback = callback;
			this._that = that;
		}
		get isCalled() {
			return this._isCalled;
		}
		get promise() {
			return this._deferred.promise;
		}
		call(...args) {
			if (!this._isCalled) {
				this._isCalled = true;
				try {
					Promise.resolve(this._callback.call(this._that, ...args)).then((val) => this._deferred.resolve(val), (err) => this._deferred.reject(err));
				} catch (err) {
					this._deferred.reject(err);
				}
			}
			return this._deferred.promise;
		}
	};
	exports.BindOnceFuture = BindOnceFuture;
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/src/utils/configuration.js
var require_configuration = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.diagLogLevelFromString = void 0;
	const api_1 = require_src$2();
	const logLevelMap = {
		ALL: api_1.DiagLogLevel.ALL,
		VERBOSE: api_1.DiagLogLevel.VERBOSE,
		DEBUG: api_1.DiagLogLevel.DEBUG,
		INFO: api_1.DiagLogLevel.INFO,
		WARN: api_1.DiagLogLevel.WARN,
		ERROR: api_1.DiagLogLevel.ERROR,
		NONE: api_1.DiagLogLevel.NONE
	};
	/**
	* Convert a string to a {@link DiagLogLevel}, defaults to {@link DiagLogLevel} if the log level does not exist or undefined if the input is undefined.
	* @param value
	*/
	function diagLogLevelFromString(value) {
		if (value == null) return;
		const resolvedLogLevel = logLevelMap[value.toUpperCase()];
		if (resolvedLogLevel == null) {
			api_1.diag.warn(`Unknown log level "${value}", expected one of ${Object.keys(logLevelMap)}, using default`);
			return api_1.DiagLogLevel.INFO;
		}
		return resolvedLogLevel;
	}
	exports.diagLogLevelFromString = diagLogLevelFromString;
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/src/internal/exporter.js
var require_exporter = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports._export = void 0;
	const api_1 = require_src$2();
	const suppress_tracing_1 = require_suppress_tracing();
	/**
	* @internal
	* Shared functionality used by Exporters while exporting data, including suppression of Traces.
	*/
	function _export(exporter, arg) {
		return new Promise((resolve) => {
			api_1.context.with((0, suppress_tracing_1.suppressTracing)(api_1.context.active()), () => {
				exporter.export(arg, resolve);
			});
		});
	}
	exports._export = _export;
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/src/index.js
var require_src = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.diagLogLevelFromString = exports.BindOnceFuture = exports.urlMatches = exports.isUrlIgnored = exports.callWithTimeout = exports.TimeoutError = exports.merge = exports.TraceState = exports.unsuppressTracing = exports.suppressTracing = exports.isTracingSuppressed = exports.setRPCMetadata = exports.getRPCMetadata = exports.deleteRPCMetadata = exports.RPCType = exports.parseTraceParent = exports.W3CTraceContextPropagator = exports.TRACE_STATE_HEADER = exports.TRACE_PARENT_HEADER = exports.CompositePropagator = exports.otperformance = exports.getStringListFromEnv = exports.getNumberFromEnv = exports.getBooleanFromEnv = exports.getStringFromEnv = exports._globalThis = exports.SDK_INFO = exports.parseKeyPairsIntoRecord = exports.ExportResultCode = exports.unrefTimer = exports.timeInputToHrTime = exports.millisToHrTime = exports.isTimeInputHrTime = exports.isTimeInput = exports.hrTimeToTimeStamp = exports.hrTimeToSeconds = exports.hrTimeToNanoseconds = exports.hrTimeToMilliseconds = exports.hrTimeToMicroseconds = exports.hrTimeDuration = exports.hrTime = exports.getTimeOrigin = exports.addHrTimes = exports.loggingErrorHandler = exports.setGlobalErrorHandler = exports.globalErrorHandler = exports.sanitizeAttributes = exports.isAttributeValue = exports.AnchoredClock = exports.W3CBaggagePropagator = void 0;
	exports.internal = void 0;
	var W3CBaggagePropagator_1 = require_W3CBaggagePropagator();
	Object.defineProperty(exports, "W3CBaggagePropagator", {
		enumerable: true,
		get: function() {
			return W3CBaggagePropagator_1.W3CBaggagePropagator;
		}
	});
	var anchored_clock_1 = require_anchored_clock();
	Object.defineProperty(exports, "AnchoredClock", {
		enumerable: true,
		get: function() {
			return anchored_clock_1.AnchoredClock;
		}
	});
	var attributes_1 = require_attributes();
	Object.defineProperty(exports, "isAttributeValue", {
		enumerable: true,
		get: function() {
			return attributes_1.isAttributeValue;
		}
	});
	Object.defineProperty(exports, "sanitizeAttributes", {
		enumerable: true,
		get: function() {
			return attributes_1.sanitizeAttributes;
		}
	});
	var global_error_handler_1 = require_global_error_handler();
	Object.defineProperty(exports, "globalErrorHandler", {
		enumerable: true,
		get: function() {
			return global_error_handler_1.globalErrorHandler;
		}
	});
	Object.defineProperty(exports, "setGlobalErrorHandler", {
		enumerable: true,
		get: function() {
			return global_error_handler_1.setGlobalErrorHandler;
		}
	});
	var logging_error_handler_1 = require_logging_error_handler();
	Object.defineProperty(exports, "loggingErrorHandler", {
		enumerable: true,
		get: function() {
			return logging_error_handler_1.loggingErrorHandler;
		}
	});
	var time_1 = require_time();
	Object.defineProperty(exports, "addHrTimes", {
		enumerable: true,
		get: function() {
			return time_1.addHrTimes;
		}
	});
	Object.defineProperty(exports, "getTimeOrigin", {
		enumerable: true,
		get: function() {
			return time_1.getTimeOrigin;
		}
	});
	Object.defineProperty(exports, "hrTime", {
		enumerable: true,
		get: function() {
			return time_1.hrTime;
		}
	});
	Object.defineProperty(exports, "hrTimeDuration", {
		enumerable: true,
		get: function() {
			return time_1.hrTimeDuration;
		}
	});
	Object.defineProperty(exports, "hrTimeToMicroseconds", {
		enumerable: true,
		get: function() {
			return time_1.hrTimeToMicroseconds;
		}
	});
	Object.defineProperty(exports, "hrTimeToMilliseconds", {
		enumerable: true,
		get: function() {
			return time_1.hrTimeToMilliseconds;
		}
	});
	Object.defineProperty(exports, "hrTimeToNanoseconds", {
		enumerable: true,
		get: function() {
			return time_1.hrTimeToNanoseconds;
		}
	});
	Object.defineProperty(exports, "hrTimeToSeconds", {
		enumerable: true,
		get: function() {
			return time_1.hrTimeToSeconds;
		}
	});
	Object.defineProperty(exports, "hrTimeToTimeStamp", {
		enumerable: true,
		get: function() {
			return time_1.hrTimeToTimeStamp;
		}
	});
	Object.defineProperty(exports, "isTimeInput", {
		enumerable: true,
		get: function() {
			return time_1.isTimeInput;
		}
	});
	Object.defineProperty(exports, "isTimeInputHrTime", {
		enumerable: true,
		get: function() {
			return time_1.isTimeInputHrTime;
		}
	});
	Object.defineProperty(exports, "millisToHrTime", {
		enumerable: true,
		get: function() {
			return time_1.millisToHrTime;
		}
	});
	Object.defineProperty(exports, "timeInputToHrTime", {
		enumerable: true,
		get: function() {
			return time_1.timeInputToHrTime;
		}
	});
	var timer_util_1 = require_timer_util();
	Object.defineProperty(exports, "unrefTimer", {
		enumerable: true,
		get: function() {
			return timer_util_1.unrefTimer;
		}
	});
	var ExportResult_1 = require_ExportResult();
	Object.defineProperty(exports, "ExportResultCode", {
		enumerable: true,
		get: function() {
			return ExportResult_1.ExportResultCode;
		}
	});
	var utils_1 = require_utils$1();
	Object.defineProperty(exports, "parseKeyPairsIntoRecord", {
		enumerable: true,
		get: function() {
			return utils_1.parseKeyPairsIntoRecord;
		}
	});
	var platform_1 = require_platform();
	Object.defineProperty(exports, "SDK_INFO", {
		enumerable: true,
		get: function() {
			return platform_1.SDK_INFO;
		}
	});
	Object.defineProperty(exports, "_globalThis", {
		enumerable: true,
		get: function() {
			return platform_1._globalThis;
		}
	});
	Object.defineProperty(exports, "getStringFromEnv", {
		enumerable: true,
		get: function() {
			return platform_1.getStringFromEnv;
		}
	});
	Object.defineProperty(exports, "getBooleanFromEnv", {
		enumerable: true,
		get: function() {
			return platform_1.getBooleanFromEnv;
		}
	});
	Object.defineProperty(exports, "getNumberFromEnv", {
		enumerable: true,
		get: function() {
			return platform_1.getNumberFromEnv;
		}
	});
	Object.defineProperty(exports, "getStringListFromEnv", {
		enumerable: true,
		get: function() {
			return platform_1.getStringListFromEnv;
		}
	});
	Object.defineProperty(exports, "otperformance", {
		enumerable: true,
		get: function() {
			return platform_1.otperformance;
		}
	});
	var composite_1 = require_composite();
	Object.defineProperty(exports, "CompositePropagator", {
		enumerable: true,
		get: function() {
			return composite_1.CompositePropagator;
		}
	});
	var W3CTraceContextPropagator_1 = require_W3CTraceContextPropagator();
	Object.defineProperty(exports, "TRACE_PARENT_HEADER", {
		enumerable: true,
		get: function() {
			return W3CTraceContextPropagator_1.TRACE_PARENT_HEADER;
		}
	});
	Object.defineProperty(exports, "TRACE_STATE_HEADER", {
		enumerable: true,
		get: function() {
			return W3CTraceContextPropagator_1.TRACE_STATE_HEADER;
		}
	});
	Object.defineProperty(exports, "W3CTraceContextPropagator", {
		enumerable: true,
		get: function() {
			return W3CTraceContextPropagator_1.W3CTraceContextPropagator;
		}
	});
	Object.defineProperty(exports, "parseTraceParent", {
		enumerable: true,
		get: function() {
			return W3CTraceContextPropagator_1.parseTraceParent;
		}
	});
	var rpc_metadata_1 = require_rpc_metadata();
	Object.defineProperty(exports, "RPCType", {
		enumerable: true,
		get: function() {
			return rpc_metadata_1.RPCType;
		}
	});
	Object.defineProperty(exports, "deleteRPCMetadata", {
		enumerable: true,
		get: function() {
			return rpc_metadata_1.deleteRPCMetadata;
		}
	});
	Object.defineProperty(exports, "getRPCMetadata", {
		enumerable: true,
		get: function() {
			return rpc_metadata_1.getRPCMetadata;
		}
	});
	Object.defineProperty(exports, "setRPCMetadata", {
		enumerable: true,
		get: function() {
			return rpc_metadata_1.setRPCMetadata;
		}
	});
	var suppress_tracing_1 = require_suppress_tracing();
	Object.defineProperty(exports, "isTracingSuppressed", {
		enumerable: true,
		get: function() {
			return suppress_tracing_1.isTracingSuppressed;
		}
	});
	Object.defineProperty(exports, "suppressTracing", {
		enumerable: true,
		get: function() {
			return suppress_tracing_1.suppressTracing;
		}
	});
	Object.defineProperty(exports, "unsuppressTracing", {
		enumerable: true,
		get: function() {
			return suppress_tracing_1.unsuppressTracing;
		}
	});
	var TraceState_1 = require_TraceState();
	Object.defineProperty(exports, "TraceState", {
		enumerable: true,
		get: function() {
			return TraceState_1.TraceState;
		}
	});
	var merge_1 = require_merge();
	Object.defineProperty(exports, "merge", {
		enumerable: true,
		get: function() {
			return merge_1.merge;
		}
	});
	var timeout_1 = require_timeout();
	Object.defineProperty(exports, "TimeoutError", {
		enumerable: true,
		get: function() {
			return timeout_1.TimeoutError;
		}
	});
	Object.defineProperty(exports, "callWithTimeout", {
		enumerable: true,
		get: function() {
			return timeout_1.callWithTimeout;
		}
	});
	var url_1 = require_url();
	Object.defineProperty(exports, "isUrlIgnored", {
		enumerable: true,
		get: function() {
			return url_1.isUrlIgnored;
		}
	});
	Object.defineProperty(exports, "urlMatches", {
		enumerable: true,
		get: function() {
			return url_1.urlMatches;
		}
	});
	var callback_1 = require_callback();
	Object.defineProperty(exports, "BindOnceFuture", {
		enumerable: true,
		get: function() {
			return callback_1.BindOnceFuture;
		}
	});
	var configuration_1 = require_configuration();
	Object.defineProperty(exports, "diagLogLevelFromString", {
		enumerable: true,
		get: function() {
			return configuration_1.diagLogLevelFromString;
		}
	});
	exports.internal = { _export: require_exporter()._export };
}));
//#endregion
export { require_src$1 as n, require_src as t };
