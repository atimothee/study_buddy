import { fileURLToPath as __eveFileURLToPath } from "node:url";
import { dirname as __eveDirname } from "node:path";
__eveDirname(__eveFileURLToPath(import.meta.url));
import { a as __toESM, i as __require, t as __commonJSMin } from "../_runtime.mjs";
import { t as require_src$1 } from "./opentelemetry__api.mjs";
import { n as require_src$3, t as require_src$2 } from "./@opentelemetry/core+[...].mjs";
//#region node_modules/@opentelemetry/resources/build/src/default-service-name.js
var require_default_service_name = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports._clearDefaultServiceNameCache = exports.defaultServiceName = void 0;
	let serviceName;
	/**
	* Returns the default service name for OpenTelemetry resources.
	* In Node.js environments, returns "unknown_service:<process.argv0>".
	* In browser/edge environments, returns "unknown_service".
	*/
	function defaultServiceName() {
		if (serviceName === void 0) try {
			const argv0 = globalThis.process.argv0;
			serviceName = argv0 ? `unknown_service:${argv0}` : "unknown_service";
		} catch {
			serviceName = "unknown_service";
		}
		return serviceName;
	}
	exports.defaultServiceName = defaultServiceName;
	/** @internal For testing purposes only */
	function _clearDefaultServiceNameCache() {
		serviceName = void 0;
	}
	exports._clearDefaultServiceNameCache = _clearDefaultServiceNameCache;
}));
//#endregion
//#region node_modules/@opentelemetry/resources/build/src/utils.js
var require_utils$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isPromiseLike = void 0;
	const isPromiseLike = (val) => {
		return val !== null && typeof val === "object" && typeof val.then === "function";
	};
	exports.isPromiseLike = isPromiseLike;
}));
//#endregion
//#region node_modules/@opentelemetry/resources/build/src/ResourceImpl.js
var require_ResourceImpl = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.defaultResource = exports.emptyResource = exports.resourceFromDetectedResource = exports.resourceFromAttributes = void 0;
	const api_1 = require_src$1();
	const core_1 = require_src$2();
	const semantic_conventions_1 = require_src$3();
	const default_service_name_1 = require_default_service_name();
	const utils_1 = require_utils$1();
	var ResourceImpl = class ResourceImpl {
		_rawAttributes;
		_asyncAttributesPending = false;
		_schemaUrl;
		_memoizedAttributes;
		static FromAttributeList(attributes, options) {
			const res = new ResourceImpl({}, options);
			res._rawAttributes = guardedRawAttributes(attributes);
			res._asyncAttributesPending = attributes.filter(([_, val]) => (0, utils_1.isPromiseLike)(val)).length > 0;
			return res;
		}
		constructor(resource, options) {
			const attributes = resource.attributes ?? {};
			this._rawAttributes = Object.entries(attributes).map(([k, v]) => {
				if ((0, utils_1.isPromiseLike)(v)) this._asyncAttributesPending = true;
				return [k, v];
			});
			this._rawAttributes = guardedRawAttributes(this._rawAttributes);
			this._schemaUrl = validateSchemaUrl(options?.schemaUrl);
		}
		get asyncAttributesPending() {
			return this._asyncAttributesPending;
		}
		async waitForAsyncAttributes() {
			if (!this.asyncAttributesPending) return;
			for (let i = 0; i < this._rawAttributes.length; i++) {
				const [k, v] = this._rawAttributes[i];
				this._rawAttributes[i] = [k, (0, utils_1.isPromiseLike)(v) ? await v : v];
			}
			this._asyncAttributesPending = false;
		}
		get attributes() {
			if (this.asyncAttributesPending) api_1.diag.error("Accessing resource attributes before async attributes settled");
			if (this._memoizedAttributes) return this._memoizedAttributes;
			const attrs = {};
			for (const [k, v] of this._rawAttributes) {
				if ((0, utils_1.isPromiseLike)(v)) {
					api_1.diag.debug(`Unsettled resource attribute ${k} skipped`);
					continue;
				}
				if (v != null) attrs[k] ??= v;
			}
			if (!this._asyncAttributesPending) this._memoizedAttributes = attrs;
			return attrs;
		}
		getRawAttributes() {
			return this._rawAttributes;
		}
		get schemaUrl() {
			return this._schemaUrl;
		}
		merge(resource) {
			if (resource == null) return this;
			const mergedSchemaUrl = mergeSchemaUrl(this, resource);
			const mergedOptions = mergedSchemaUrl ? { schemaUrl: mergedSchemaUrl } : void 0;
			return ResourceImpl.FromAttributeList([...resource.getRawAttributes(), ...this.getRawAttributes()], mergedOptions);
		}
	};
	function resourceFromAttributes(attributes, options) {
		return ResourceImpl.FromAttributeList(Object.entries(attributes), options);
	}
	exports.resourceFromAttributes = resourceFromAttributes;
	function resourceFromDetectedResource(detectedResource, options) {
		return new ResourceImpl(detectedResource, options);
	}
	exports.resourceFromDetectedResource = resourceFromDetectedResource;
	function emptyResource() {
		return resourceFromAttributes({});
	}
	exports.emptyResource = emptyResource;
	function defaultResource() {
		return resourceFromAttributes({
			[semantic_conventions_1.ATTR_SERVICE_NAME]: (0, default_service_name_1.defaultServiceName)(),
			[semantic_conventions_1.ATTR_TELEMETRY_SDK_LANGUAGE]: core_1.SDK_INFO[semantic_conventions_1.ATTR_TELEMETRY_SDK_LANGUAGE],
			[semantic_conventions_1.ATTR_TELEMETRY_SDK_NAME]: core_1.SDK_INFO[semantic_conventions_1.ATTR_TELEMETRY_SDK_NAME],
			[semantic_conventions_1.ATTR_TELEMETRY_SDK_VERSION]: core_1.SDK_INFO[semantic_conventions_1.ATTR_TELEMETRY_SDK_VERSION]
		});
	}
	exports.defaultResource = defaultResource;
	function guardedRawAttributes(attributes) {
		return attributes.map(([k, v]) => {
			if ((0, utils_1.isPromiseLike)(v)) return [k, v.catch((err) => {
				api_1.diag.debug("promise rejection for resource attribute: %s - %s", k, err);
			})];
			return [k, v];
		});
	}
	function validateSchemaUrl(schemaUrl) {
		if (typeof schemaUrl === "string" || schemaUrl === void 0) return schemaUrl;
		api_1.diag.warn("Schema URL must be string or undefined, got %s. Schema URL will be ignored.", schemaUrl);
	}
	function mergeSchemaUrl(old, updating) {
		const oldSchemaUrl = old?.schemaUrl;
		const updatingSchemaUrl = updating?.schemaUrl;
		const isOldEmpty = oldSchemaUrl === void 0 || oldSchemaUrl === "";
		const isUpdatingEmpty = updatingSchemaUrl === void 0 || updatingSchemaUrl === "";
		if (isOldEmpty) return updatingSchemaUrl;
		if (isUpdatingEmpty) return oldSchemaUrl;
		if (oldSchemaUrl === updatingSchemaUrl) return oldSchemaUrl;
		api_1.diag.warn("Schema URL merge conflict: old resource has \"%s\", updating resource has \"%s\". Resulting resource will have undefined Schema URL.", oldSchemaUrl, updatingSchemaUrl);
	}
}));
//#endregion
//#region node_modules/@opentelemetry/resources/build/src/detect-resources.js
var require_detect_resources = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.detectResources = void 0;
	const api_1 = require_src$1();
	const ResourceImpl_1 = require_ResourceImpl();
	/**
	* Runs all resource detectors and returns the results merged into a single Resource.
	*
	* @param config Configuration for resource detection
	*/
	const detectResources = (config = {}) => {
		return (config.detectors || []).map((d) => {
			try {
				const resource = (0, ResourceImpl_1.resourceFromDetectedResource)(d.detect(config));
				api_1.diag.debug(`${d.constructor.name} found resource.`, resource);
				return resource;
			} catch (e) {
				api_1.diag.debug(`${d.constructor.name} failed: ${e.message}`);
				return (0, ResourceImpl_1.emptyResource)();
			}
		}).reduce((acc, resource) => acc.merge(resource), (0, ResourceImpl_1.emptyResource)());
	};
	exports.detectResources = detectResources;
}));
//#endregion
//#region node_modules/@opentelemetry/resources/build/src/detectors/EnvDetector.js
var require_EnvDetector = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.envDetector = void 0;
	const api_1 = require_src$1();
	const semantic_conventions_1 = require_src$3();
	const core_1 = require_src$2();
	/**
	* EnvDetector can be used to detect the presence of and create a Resource
	* from the OTEL_RESOURCE_ATTRIBUTES environment variable.
	*/
	var EnvDetector = class {
		_MAX_LENGTH = 255;
		_COMMA_SEPARATOR = ",";
		_LABEL_KEY_VALUE_SPLITTER = "=";
		/**
		* Returns a {@link Resource} populated with attributes from the
		* OTEL_RESOURCE_ATTRIBUTES environment variable. Note this is an async
		* function to conform to the Detector interface.
		*
		* @param config The resource detection config
		*/
		detect(_config) {
			const attributes = {};
			const rawAttributes = (0, core_1.getStringFromEnv)("OTEL_RESOURCE_ATTRIBUTES");
			const serviceName = (0, core_1.getStringFromEnv)("OTEL_SERVICE_NAME");
			if (rawAttributes) try {
				const parsedAttributes = this._parseResourceAttributes(rawAttributes);
				Object.assign(attributes, parsedAttributes);
			} catch (e) {
				api_1.diag.debug(`EnvDetector failed: ${e instanceof Error ? e.message : e}`);
			}
			if (serviceName) attributes[semantic_conventions_1.ATTR_SERVICE_NAME] = serviceName;
			return { attributes };
		}
		/**
		* Creates an attribute map from the OTEL_RESOURCE_ATTRIBUTES environment
		* variable.
		*
		* OTEL_RESOURCE_ATTRIBUTES: A comma-separated list of attributes in the
		* format "key1=value1,key2=value2". The ',' and '=' characters in keys
		* and values MUST be percent-encoded. Other characters MAY be percent-encoded.
		*
		* Per the spec, on any error (e.g., decoding failure), the entire environment
		* variable value is discarded.
		*
		* @param rawEnvAttributes The resource attributes as a comma-separated list
		* of key/value pairs.
		* @returns The parsed resource attributes.
		* @throws Error if parsing fails (caller handles by discarding all attributes)
		*/
		_parseResourceAttributes(rawEnvAttributes) {
			if (!rawEnvAttributes) return {};
			const attributes = {};
			const rawAttributes = rawEnvAttributes.split(this._COMMA_SEPARATOR).filter((attr) => attr.trim() !== "");
			for (const rawAttribute of rawAttributes) {
				const keyValuePair = rawAttribute.split(this._LABEL_KEY_VALUE_SPLITTER);
				if (keyValuePair.length !== 2) throw new Error(`Invalid format for OTEL_RESOURCE_ATTRIBUTES: "${rawAttribute}". Expected format: key=value. The ',' and '=' characters must be percent-encoded in keys and values.`);
				const [rawKey, rawValue] = keyValuePair;
				const key = rawKey.trim();
				const value = rawValue.trim();
				if (key.length === 0) throw new Error(`Invalid OTEL_RESOURCE_ATTRIBUTES: empty attribute key in "${rawAttribute}".`);
				let decodedKey;
				let decodedValue;
				try {
					decodedKey = decodeURIComponent(key);
					decodedValue = decodeURIComponent(value);
				} catch (e) {
					throw new Error(`Failed to percent-decode OTEL_RESOURCE_ATTRIBUTES entry "${rawAttribute}": ${e instanceof Error ? e.message : e}`, { cause: e });
				}
				if (decodedKey.length > this._MAX_LENGTH) throw new Error(`Attribute key exceeds the maximum length of ${this._MAX_LENGTH} characters: "${decodedKey}".`);
				if (decodedValue.length > this._MAX_LENGTH) throw new Error(`Attribute value exceeds the maximum length of ${this._MAX_LENGTH} characters for key "${decodedKey}".`);
				attributes[decodedKey] = decodedValue;
			}
			return attributes;
		}
	};
	exports.envDetector = new EnvDetector();
}));
//#endregion
//#region node_modules/@opentelemetry/resources/build/src/semconv.js
var require_semconv = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ATTR_WEBENGINE_VERSION = exports.ATTR_WEBENGINE_NAME = exports.ATTR_WEBENGINE_DESCRIPTION = exports.ATTR_SERVICE_NAMESPACE = exports.ATTR_SERVICE_INSTANCE_ID = exports.ATTR_PROCESS_RUNTIME_VERSION = exports.ATTR_PROCESS_RUNTIME_NAME = exports.ATTR_PROCESS_RUNTIME_DESCRIPTION = exports.ATTR_PROCESS_PID = exports.ATTR_PROCESS_OWNER = exports.ATTR_PROCESS_EXECUTABLE_PATH = exports.ATTR_PROCESS_EXECUTABLE_NAME = exports.ATTR_PROCESS_COMMAND_ARGS = exports.ATTR_PROCESS_COMMAND = exports.ATTR_OS_VERSION = exports.ATTR_OS_TYPE = exports.ATTR_K8S_POD_NAME = exports.ATTR_K8S_NAMESPACE_NAME = exports.ATTR_K8S_DEPLOYMENT_NAME = exports.ATTR_K8S_CLUSTER_NAME = exports.ATTR_HOST_TYPE = exports.ATTR_HOST_NAME = exports.ATTR_HOST_IMAGE_VERSION = exports.ATTR_HOST_IMAGE_NAME = exports.ATTR_HOST_IMAGE_ID = exports.ATTR_HOST_ID = exports.ATTR_HOST_ARCH = exports.ATTR_CONTAINER_NAME = exports.ATTR_CONTAINER_IMAGE_TAGS = exports.ATTR_CONTAINER_IMAGE_NAME = exports.ATTR_CONTAINER_ID = exports.ATTR_CLOUD_REGION = exports.ATTR_CLOUD_PROVIDER = exports.ATTR_CLOUD_AVAILABILITY_ZONE = exports.ATTR_CLOUD_ACCOUNT_ID = void 0;
	/**
	* The cloud account ID the resource is assigned to.
	*
	* @example 111111111111
	* @example opentelemetry
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_CLOUD_ACCOUNT_ID = "cloud.account.id";
	/**
	* Cloud regions often have multiple, isolated locations known as zones to increase availability. Availability zone represents the zone where the resource is running.
	*
	* @example us-east-1c
	*
	* @note Availability zones are called "zones" on Alibaba Cloud and Google Cloud.
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_CLOUD_AVAILABILITY_ZONE = "cloud.availability_zone";
	/**
	* Name of the cloud provider.
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_CLOUD_PROVIDER = "cloud.provider";
	/**
	* The geographical region the resource is running.
	*
	* @example us-central1
	* @example us-east-1
	*
	* @note Refer to your provider's docs to see the available regions, for example [Alibaba Cloud regions](https://www.alibabacloud.com/help/doc-detail/40654.htm), [AWS regions](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/), [Azure regions](https://azure.microsoft.com/global-infrastructure/geographies/), [Google Cloud regions](https://cloud.google.com/about/locations), or [Tencent Cloud regions](https://www.tencentcloud.com/document/product/213/6091).
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_CLOUD_REGION = "cloud.region";
	/**
	* Container ID. Usually a UUID, as for example used to [identify Docker containers](https://docs.docker.com/engine/containers/run/#container-identification). The UUID might be abbreviated.
	*
	* @example a3bf90e006b2
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_CONTAINER_ID = "container.id";
	/**
	* Name of the image the container was built on.
	*
	* @example gcr.io/opentelemetry/operator
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_CONTAINER_IMAGE_NAME = "container.image.name";
	/**
	* Container image tags. An example can be found in [Docker Image Inspect](https://docs.docker.com/engine/api/v1.43/#tag/Image/operation/ImageInspect). Should be only the `<tag>` section of the full name for example from `registry.example.com/my-org/my-image:<tag>`.
	*
	* @example ["v1.27.1", "3.5.7-0"]
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_CONTAINER_IMAGE_TAGS = "container.image.tags";
	/**
	* Container name used by container runtime.
	*
	* @example opentelemetry-autoconf
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_CONTAINER_NAME = "container.name";
	/**
	* The CPU architecture the host system is running on.
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_HOST_ARCH = "host.arch";
	/**
	* Unique host ID. For Cloud, this must be the instance_id assigned by the cloud provider. For non-containerized systems, this should be the `machine-id`. See the table below for the sources to use to determine the `machine-id` based on operating system.
	*
	* @example fdbf79e8af94cb7f9e8df36789187052
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_HOST_ID = "host.id";
	/**
	* VM image ID or host OS image ID. For Cloud, this value is from the provider.
	*
	* @example ami-07b06b442921831e5
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_HOST_IMAGE_ID = "host.image.id";
	/**
	* Name of the VM image or OS install the host was instantiated from.
	*
	* @example infra-ami-eks-worker-node-7d4ec78312
	* @example CentOS-8-x86_64-1905
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_HOST_IMAGE_NAME = "host.image.name";
	/**
	* The version string of the VM image or host OS as defined in [Version Attributes](/docs/resource/README.md#version-attributes).
	*
	* @example 0.1
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_HOST_IMAGE_VERSION = "host.image.version";
	/**
	* Name of the host. On Unix systems, it may contain what the hostname command returns, or the fully qualified hostname, or another name specified by the user.
	*
	* @example opentelemetry-test
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_HOST_NAME = "host.name";
	/**
	* Type of host. For Cloud, this must be the machine type.
	*
	* @example n1-standard-1
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_HOST_TYPE = "host.type";
	/**
	* The name of the cluster.
	*
	* @example opentelemetry-cluster
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_K8S_CLUSTER_NAME = "k8s.cluster.name";
	/**
	* The name of the Deployment.
	*
	* @example opentelemetry
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_K8S_DEPLOYMENT_NAME = "k8s.deployment.name";
	/**
	* The name of the namespace that the pod is running in.
	*
	* @example default
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_K8S_NAMESPACE_NAME = "k8s.namespace.name";
	/**
	* The name of the Pod.
	*
	* @example opentelemetry-pod-autoconf
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_K8S_POD_NAME = "k8s.pod.name";
	/**
	* The operating system type.
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_OS_TYPE = "os.type";
	/**
	* The version string of the operating system as defined in [Version Attributes](/docs/resource/README.md#version-attributes).
	*
	* @example 14.2.1
	* @example 18.04.1
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_OS_VERSION = "os.version";
	/**
	* The command used to launch the process (i.e. the command name). On Linux based systems, can be set to the zeroth string in `proc/[pid]/cmdline`. On Windows, can be set to the first parameter extracted from `GetCommandLineW`.
	*
	* @example cmd/otelcol
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_PROCESS_COMMAND = "process.command";
	/**
	* All the command arguments (including the command/executable itself) as received by the process. On Linux-based systems (and some other Unixoid systems supporting procfs), can be set according to the list of null-delimited strings extracted from `proc/[pid]/cmdline`. For libc-based executables, this would be the full argv vector passed to `main`.
	*
	* @example ["cmd/otecol", "--config=config.yaml"]
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_PROCESS_COMMAND_ARGS = "process.command_args";
	/**
	* The name of the process executable. On Linux based systems, this **SHOULD** be set to the base name of the target of `/proc/[pid]/exe`. On Windows, this **SHOULD** be set to the base name of `GetProcessImageFileNameW`.
	*
	* @example otelcol
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_PROCESS_EXECUTABLE_NAME = "process.executable.name";
	/**
	* The full path to the process executable. On Linux based systems, can be set to the target of `proc/[pid]/exe`. On Windows, can be set to the result of `GetProcessImageFileNameW`.
	*
	* @example /usr/bin/cmd/otelcol
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_PROCESS_EXECUTABLE_PATH = "process.executable.path";
	/**
	* The username of the user that owns the process.
	*
	* @example root
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_PROCESS_OWNER = "process.owner";
	/**
	* Process identifier (PID).
	*
	* @example 1234
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_PROCESS_PID = "process.pid";
	/**
	* An additional description about the runtime of the process, for example a specific vendor customization of the runtime environment.
	*
	* @example "Eclipse OpenJ9 Eclipse OpenJ9 VM openj9-0.21.0"
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_PROCESS_RUNTIME_DESCRIPTION = "process.runtime.description";
	/**
	* The name of the runtime of this process.
	*
	* @example OpenJDK Runtime Environment
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_PROCESS_RUNTIME_NAME = "process.runtime.name";
	/**
	* The version of the runtime of this process, as returned by the runtime without modification.
	*
	* @example "14.0.2"
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_PROCESS_RUNTIME_VERSION = "process.runtime.version";
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
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_SERVICE_INSTANCE_ID = "service.instance.id";
	/**
	* A namespace for `service.name`.
	*
	* @example Shop
	*
	* @note A string value having a meaning that helps to distinguish a group of services, for example the team name that owns a group of services. `service.name` is expected to be unique within the same namespace. If `service.namespace` is not specified in the Resource then `service.name` is expected to be unique for all services that have no explicit namespace defined (so the empty/unspecified namespace is simply one more valid namespace). Zero-length namespace string is assumed equal to unspecified namespace.
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_SERVICE_NAMESPACE = "service.namespace";
	/**
	* Additional description of the web engine (e.g. detailed version and edition information).
	*
	* @example WildFly Full 21.0.0.Final (WildFly Core 13.0.1.Final) - 2.2.2.Final
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_WEBENGINE_DESCRIPTION = "webengine.description";
	/**
	* The name of the web engine.
	*
	* @example WildFly
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_WEBENGINE_NAME = "webengine.name";
	/**
	* The version of the web engine.
	*
	* @example 21.0.0
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_WEBENGINE_VERSION = "webengine.version";
}));
//#endregion
//#region node_modules/@opentelemetry/resources/build/src/detectors/platform/node/machine-id/getMachineId.js
var require_getMachineId = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getMachineId = void 0;
	const process$2 = __require("process");
	let getMachineIdImpl;
	async function getMachineId() {
		if (!getMachineIdImpl) switch (process$2.platform) {
			case "darwin":
				getMachineIdImpl = (await Promise.resolve().then(() => /* @__PURE__ */ __toESM(require_getMachineId_darwin()))).getMachineId;
				break;
			case "linux":
				getMachineIdImpl = (await Promise.resolve().then(() => /* @__PURE__ */ __toESM(require_getMachineId_linux()))).getMachineId;
				break;
			case "freebsd":
				getMachineIdImpl = (await Promise.resolve().then(() => /* @__PURE__ */ __toESM(require_getMachineId_bsd()))).getMachineId;
				break;
			case "win32":
				getMachineIdImpl = (await Promise.resolve().then(() => /* @__PURE__ */ __toESM(require_getMachineId_win()))).getMachineId;
				break;
			default:
				getMachineIdImpl = (await Promise.resolve().then(() => /* @__PURE__ */ __toESM(require_getMachineId_unsupported()))).getMachineId;
				break;
		}
		return getMachineIdImpl();
	}
	exports.getMachineId = getMachineId;
}));
//#endregion
//#region node_modules/@opentelemetry/resources/build/src/detectors/platform/node/utils.js
var require_utils = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.normalizeType = exports.normalizeArch = void 0;
	const normalizeArch = (nodeArchString) => {
		switch (nodeArchString) {
			case "arm": return "arm32";
			case "ppc": return "ppc32";
			case "x64": return "amd64";
			default: return nodeArchString;
		}
	};
	exports.normalizeArch = normalizeArch;
	const normalizeType = (nodePlatform) => {
		switch (nodePlatform) {
			case "sunos": return "solaris";
			case "win32": return "windows";
			default: return nodePlatform;
		}
	};
	exports.normalizeType = normalizeType;
}));
//#endregion
//#region node_modules/@opentelemetry/resources/build/src/detectors/platform/node/HostDetector.js
var require_HostDetector = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.hostDetector = void 0;
	const semconv_1 = require_semconv();
	const os_1$1 = __require("os");
	const getMachineId_1 = require_getMachineId();
	const utils_1 = require_utils();
	/**
	* HostDetector detects the resources related to the host current process is
	* running on. Currently only non-cloud-based attributes are included.
	*/
	var HostDetector = class {
		detect(_config) {
			return { attributes: {
				[semconv_1.ATTR_HOST_NAME]: (0, os_1$1.hostname)(),
				[semconv_1.ATTR_HOST_ARCH]: (0, utils_1.normalizeArch)((0, os_1$1.arch)()),
				[semconv_1.ATTR_HOST_ID]: (0, getMachineId_1.getMachineId)()
			} };
		}
	};
	exports.hostDetector = new HostDetector();
}));
//#endregion
//#region node_modules/@opentelemetry/resources/build/src/detectors/platform/node/OSDetector.js
var require_OSDetector = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.osDetector = void 0;
	const semconv_1 = require_semconv();
	const os_1 = __require("os");
	const utils_1 = require_utils();
	/**
	* OSDetector detects the resources related to the operating system (OS) on
	* which the process represented by this resource is running.
	*/
	var OSDetector = class {
		detect(_config) {
			return { attributes: {
				[semconv_1.ATTR_OS_TYPE]: (0, utils_1.normalizeType)((0, os_1.platform)()),
				[semconv_1.ATTR_OS_VERSION]: (0, os_1.release)()
			} };
		}
	};
	exports.osDetector = new OSDetector();
}));
//#endregion
//#region node_modules/@opentelemetry/resources/build/src/detectors/platform/node/ProcessDetector.js
var require_ProcessDetector = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.processDetector = void 0;
	const api_1 = require_src$1();
	const semconv_1 = require_semconv();
	const os = __require("os");
	/**
	* ProcessDetector will be used to detect the resources related current process running
	* and being instrumented from the NodeJS Process module.
	*/
	var ProcessDetector = class {
		detect(_config) {
			const attributes = {
				[semconv_1.ATTR_PROCESS_PID]: process.pid,
				[semconv_1.ATTR_PROCESS_EXECUTABLE_NAME]: process.title,
				[semconv_1.ATTR_PROCESS_EXECUTABLE_PATH]: process.execPath,
				[semconv_1.ATTR_PROCESS_COMMAND_ARGS]: [
					process.argv[0],
					...process.execArgv,
					...process.argv.slice(1)
				],
				[semconv_1.ATTR_PROCESS_RUNTIME_VERSION]: process.versions.node,
				[semconv_1.ATTR_PROCESS_RUNTIME_NAME]: "nodejs",
				[semconv_1.ATTR_PROCESS_RUNTIME_DESCRIPTION]: "Node.js"
			};
			if (process.argv.length > 1) attributes[semconv_1.ATTR_PROCESS_COMMAND] = process.argv[1];
			try {
				const userInfo = os.userInfo();
				attributes[semconv_1.ATTR_PROCESS_OWNER] = userInfo.username;
			} catch (e) {
				api_1.diag.debug(`error obtaining process owner: ${e}`);
			}
			return { attributes };
		}
	};
	exports.processDetector = new ProcessDetector();
}));
//#endregion
//#region node_modules/@opentelemetry/resources/build/src/detectors/platform/node/ServiceInstanceIdDetector.js
var require_ServiceInstanceIdDetector = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.serviceInstanceIdDetector = void 0;
	const semconv_1 = require_semconv();
	const crypto_1 = __require("crypto");
	/**
	* ServiceInstanceIdDetector detects the resources related to the service instance ID.
	*/
	var ServiceInstanceIdDetector = class {
		detect(_config) {
			return { attributes: { [semconv_1.ATTR_SERVICE_INSTANCE_ID]: (0, crypto_1.randomUUID)() } };
		}
	};
	/**
	* @experimental
	*/
	exports.serviceInstanceIdDetector = new ServiceInstanceIdDetector();
}));
//#endregion
//#region node_modules/@opentelemetry/resources/build/src/detectors/platform/node/index.js
var require_node = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.serviceInstanceIdDetector = exports.processDetector = exports.osDetector = exports.hostDetector = void 0;
	var HostDetector_1 = require_HostDetector();
	Object.defineProperty(exports, "hostDetector", {
		enumerable: true,
		get: function() {
			return HostDetector_1.hostDetector;
		}
	});
	var OSDetector_1 = require_OSDetector();
	Object.defineProperty(exports, "osDetector", {
		enumerable: true,
		get: function() {
			return OSDetector_1.osDetector;
		}
	});
	var ProcessDetector_1 = require_ProcessDetector();
	Object.defineProperty(exports, "processDetector", {
		enumerable: true,
		get: function() {
			return ProcessDetector_1.processDetector;
		}
	});
	var ServiceInstanceIdDetector_1 = require_ServiceInstanceIdDetector();
	Object.defineProperty(exports, "serviceInstanceIdDetector", {
		enumerable: true,
		get: function() {
			return ServiceInstanceIdDetector_1.serviceInstanceIdDetector;
		}
	});
}));
//#endregion
//#region node_modules/@opentelemetry/resources/build/src/detectors/platform/index.js
var require_platform = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.serviceInstanceIdDetector = exports.processDetector = exports.osDetector = exports.hostDetector = void 0;
	var node_1 = require_node();
	Object.defineProperty(exports, "hostDetector", {
		enumerable: true,
		get: function() {
			return node_1.hostDetector;
		}
	});
	Object.defineProperty(exports, "osDetector", {
		enumerable: true,
		get: function() {
			return node_1.osDetector;
		}
	});
	Object.defineProperty(exports, "processDetector", {
		enumerable: true,
		get: function() {
			return node_1.processDetector;
		}
	});
	Object.defineProperty(exports, "serviceInstanceIdDetector", {
		enumerable: true,
		get: function() {
			return node_1.serviceInstanceIdDetector;
		}
	});
}));
//#endregion
//#region node_modules/@opentelemetry/resources/build/src/detectors/NoopDetector.js
var require_NoopDetector = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.noopDetector = exports.NoopDetector = void 0;
	var NoopDetector = class {
		detect() {
			return { attributes: {} };
		}
	};
	exports.NoopDetector = NoopDetector;
	exports.noopDetector = new NoopDetector();
}));
//#endregion
//#region node_modules/@opentelemetry/resources/build/src/detectors/index.js
var require_detectors = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.noopDetector = exports.serviceInstanceIdDetector = exports.processDetector = exports.osDetector = exports.hostDetector = exports.envDetector = void 0;
	var EnvDetector_1 = require_EnvDetector();
	Object.defineProperty(exports, "envDetector", {
		enumerable: true,
		get: function() {
			return EnvDetector_1.envDetector;
		}
	});
	var platform_1 = require_platform();
	Object.defineProperty(exports, "hostDetector", {
		enumerable: true,
		get: function() {
			return platform_1.hostDetector;
		}
	});
	Object.defineProperty(exports, "osDetector", {
		enumerable: true,
		get: function() {
			return platform_1.osDetector;
		}
	});
	Object.defineProperty(exports, "processDetector", {
		enumerable: true,
		get: function() {
			return platform_1.processDetector;
		}
	});
	Object.defineProperty(exports, "serviceInstanceIdDetector", {
		enumerable: true,
		get: function() {
			return platform_1.serviceInstanceIdDetector;
		}
	});
	var NoopDetector_1 = require_NoopDetector();
	Object.defineProperty(exports, "noopDetector", {
		enumerable: true,
		get: function() {
			return NoopDetector_1.noopDetector;
		}
	});
}));
//#endregion
//#region node_modules/@opentelemetry/resources/build/src/index.js
var require_src = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.defaultServiceName = exports.emptyResource = exports.defaultResource = exports.resourceFromAttributes = exports.serviceInstanceIdDetector = exports.processDetector = exports.osDetector = exports.hostDetector = exports.envDetector = exports.detectResources = void 0;
	var detect_resources_1 = require_detect_resources();
	Object.defineProperty(exports, "detectResources", {
		enumerable: true,
		get: function() {
			return detect_resources_1.detectResources;
		}
	});
	var detectors_1 = require_detectors();
	Object.defineProperty(exports, "envDetector", {
		enumerable: true,
		get: function() {
			return detectors_1.envDetector;
		}
	});
	Object.defineProperty(exports, "hostDetector", {
		enumerable: true,
		get: function() {
			return detectors_1.hostDetector;
		}
	});
	Object.defineProperty(exports, "osDetector", {
		enumerable: true,
		get: function() {
			return detectors_1.osDetector;
		}
	});
	Object.defineProperty(exports, "processDetector", {
		enumerable: true,
		get: function() {
			return detectors_1.processDetector;
		}
	});
	Object.defineProperty(exports, "serviceInstanceIdDetector", {
		enumerable: true,
		get: function() {
			return detectors_1.serviceInstanceIdDetector;
		}
	});
	var ResourceImpl_1 = require_ResourceImpl();
	Object.defineProperty(exports, "resourceFromAttributes", {
		enumerable: true,
		get: function() {
			return ResourceImpl_1.resourceFromAttributes;
		}
	});
	Object.defineProperty(exports, "defaultResource", {
		enumerable: true,
		get: function() {
			return ResourceImpl_1.defaultResource;
		}
	});
	Object.defineProperty(exports, "emptyResource", {
		enumerable: true,
		get: function() {
			return ResourceImpl_1.emptyResource;
		}
	});
	var default_service_name_1 = require_default_service_name();
	Object.defineProperty(exports, "defaultServiceName", {
		enumerable: true,
		get: function() {
			return default_service_name_1.defaultServiceName;
		}
	});
}));
//#endregion
//#region node_modules/@opentelemetry/resources/build/src/detectors/platform/node/machine-id/execAsync.js
var require_execAsync = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.execAsync = void 0;
	const child_process = __require("child_process");
	exports.execAsync = __require("util").promisify(child_process.exec);
}));
//#endregion
//#region node_modules/@opentelemetry/resources/build/src/detectors/platform/node/machine-id/getMachineId-bsd.js
var require_getMachineId_bsd = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getMachineId = void 0;
	const fs_1$1 = __require("fs");
	const execAsync_1 = require_execAsync();
	const api_1 = require_src$1();
	async function getMachineId() {
		try {
			return (await fs_1$1.promises.readFile("/etc/hostid", { encoding: "utf8" })).trim();
		} catch (e) {
			api_1.diag.debug(`error reading machine id: ${e}`);
		}
		try {
			return (await (0, execAsync_1.execAsync)("kenv -q smbios.system.uuid")).stdout.trim();
		} catch (e) {
			api_1.diag.debug(`error reading machine id: ${e}`);
		}
	}
	exports.getMachineId = getMachineId;
}));
//#endregion
//#region node_modules/@opentelemetry/resources/build/src/detectors/platform/node/machine-id/getMachineId-darwin.js
var require_getMachineId_darwin = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getMachineId = void 0;
	const execAsync_1 = require_execAsync();
	const api_1 = require_src$1();
	async function getMachineId() {
		try {
			const idLine = (await (0, execAsync_1.execAsync)("ioreg -rd1 -c \"IOPlatformExpertDevice\"")).stdout.split("\n").find((line) => line.includes("IOPlatformUUID"));
			if (!idLine) return;
			const parts = idLine.split("\" = \"");
			if (parts.length === 2) return parts[1].slice(0, -1);
		} catch (e) {
			api_1.diag.debug(`error reading machine id: ${e}`);
		}
	}
	exports.getMachineId = getMachineId;
}));
//#endregion
//#region node_modules/@opentelemetry/resources/build/src/detectors/platform/node/machine-id/getMachineId-linux.js
var require_getMachineId_linux = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getMachineId = void 0;
	const fs_1 = __require("fs");
	const api_1 = require_src$1();
	async function getMachineId() {
		for (const path of ["/etc/machine-id", "/var/lib/dbus/machine-id"]) try {
			return (await fs_1.promises.readFile(path, { encoding: "utf8" })).trim();
		} catch (e) {
			api_1.diag.debug(`error reading machine id: ${e}`);
		}
	}
	exports.getMachineId = getMachineId;
}));
//#endregion
//#region node_modules/@opentelemetry/resources/build/src/detectors/platform/node/machine-id/getMachineId-unsupported.js
var require_getMachineId_unsupported = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getMachineId = void 0;
	const api_1 = require_src$1();
	async function getMachineId() {
		api_1.diag.debug("could not read machine-id: unsupported platform");
	}
	exports.getMachineId = getMachineId;
}));
//#endregion
//#region node_modules/@opentelemetry/resources/build/src/detectors/platform/node/machine-id/getMachineId-win.js
var require_getMachineId_win = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getMachineId = void 0;
	const process$1 = __require("process");
	const execAsync_1 = require_execAsync();
	const api_1 = require_src$1();
	async function getMachineId() {
		const args = "QUERY HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography /v MachineGuid";
		let command = "%windir%\\System32\\REG.exe";
		if (process$1.arch === "ia32" && "PROCESSOR_ARCHITEW6432" in process$1.env) command = "%windir%\\sysnative\\cmd.exe /c " + command;
		try {
			const parts = (await (0, execAsync_1.execAsync)(`${command} ${args}`)).stdout.split("REG_SZ");
			if (parts.length === 2) return parts[1].trim();
		} catch (e) {
			api_1.diag.debug(`error reading machine id: ${e}`);
		}
	}
	exports.getMachineId = getMachineId;
}));
//#endregion
export { require_src as t };
