import { fileURLToPath as __eveFileURLToPath } from "node:url";
import { dirname as __eveDirname } from "node:path";
__eveDirname(__eveFileURLToPath(import.meta.url));
import { t as __commonJSMin } from "../_runtime.mjs";
//#region node_modules/@sentry/conventions/dist/attributes.cjs
var require_attributes = /* @__PURE__ */ __commonJSMin(((exports) => {
	const AI_CITATIONS = "ai.citations", AI_COMPLETION_TOKENS_USED = "ai.completion_tokens.used", AI_DOCUMENTS = "ai.documents", AI_FINISH_REASON = "ai.finish_reason", AI_FREQUENCY_PENALTY = "ai.frequency_penalty", AI_FUNCTION_CALL = "ai.function_call", AI_GENERATION_ID = "ai.generation_id", AI_INPUT_MESSAGES = "ai.input_messages", AI_IS_SEARCH_REQUIRED = "ai.is_search_required", AI_METADATA = "ai.metadata", AI_MODEL_ID = "ai.model_id", AI_MODEL_PROVIDER = "ai.model.provider", AI_PIPELINE_NAME = "ai.pipeline.name", AI_PREAMBLE = "ai.preamble", AI_PRESENCE_PENALTY = "ai.presence_penalty", AI_PROMPT_TOKENS_USED = "ai.prompt_tokens.used", AI_RAW_PROMPTING = "ai.raw_prompting", AI_RESPONSES = "ai.responses", AI_RESPONSE_FORMAT = "ai.response_format", AI_SEARCH_QUERIES = "ai.search_queries", AI_SEARCH_RESULTS = "ai.search_results", AI_SEED = "ai.seed", AI_STREAMING = "ai.streaming", AI_TAGS = "ai.tags", AI_TEMPERATURE = "ai.temperature", AI_TEXTS = "ai.texts", AI_TOOLS = "ai.tools", AI_TOOL_CALLS = "ai.tool_calls", AI_TOP_K = "ai.top_k", AI_TOP_P = "ai.top_p", AI_TOTAL_COST = "ai.total_cost", AI_TOTAL_TOKENS_USED = "ai.total_tokens.used", AI_WARNINGS = "ai.warnings", ANGULAR_VERSION = "angular.version", APP_APP_BUILD = "app.app_build", APP_APP_IDENTIFIER = "app.app_identifier", APP_APP_NAME = "app.app_name", APP_APP_START_TIME = "app.app_start_time", APP_APP_VERSION = "app.app_version", APP_BUILD = "app.build", APP_IDENTIFIER = "app.identifier", APP_IN_FOREGROUND = "app.in_foreground", APP_NAME = "app.name", APP_START_COLD = "app_start_cold", APP_START_TIME = "app.start_time", APP_START_TYPE = "app_start_type", APP_START_WARM = "app_start_warm", APP_VERSION = "app.version", APP_VITALS_FRAMES_DELAY_VALUE = "app.vitals.frames.delay.value", APP_VITALS_FRAMES_FROZEN_COUNT = "app.vitals.frames.frozen.count", APP_VITALS_FRAMES_SLOW_COUNT = "app.vitals.frames.slow.count", APP_VITALS_FRAMES_TOTAL_COUNT = "app.vitals.frames.total.count", APP_VITALS_START_COLD_VALUE = "app.vitals.start.cold.value", APP_VITALS_START_PREWARMED = "app.vitals.start.prewarmed", APP_VITALS_START_REASON = "app.vitals.start.reason", APP_VITALS_START_SCREEN = "app.vitals.start.screen", APP_VITALS_START_TYPE = "app.vitals.start.type", APP_VITALS_START_WARM_VALUE = "app.vitals.start.warm.value", APP_VITALS_TTFD_VALUE = "app.vitals.ttfd.value", APP_VITALS_TTID_VALUE = "app.vitals.ttid.value", ART_GC_BLOCKING_COUNT = "art.gc.blocking_count", ART_GC_BLOCKING_TIME = "art.gc.blocking_time", ART_GC_PRE_OOME_COUNT = "art.gc.pre_oome_count", ART_GC_TOTAL_COUNT = "art.gc.total_count", ART_GC_TOTAL_TIME = "art.gc.total_time", ART_GC_WAITING_TIME = "art.gc.waiting_time", ART_MEMORY_FREE = "art.memory.free", ART_MEMORY_FREE_UNTIL_GC = "art.memory.free_until_gc", ART_MEMORY_FREE_UNTIL_OOME = "art.memory.free_until_oome", ART_MEMORY_MAX = "art.memory.max", ART_MEMORY_TOTAL = "art.memory.total", AWS_CLOUDWATCH_LOGS_LOG_GROUP = "aws.cloudwatch.logs.log_group", AWS_CLOUDWATCH_LOGS_LOG_STREAM = "aws.cloudwatch.logs.log_stream", AWS_CLOUDWATCH_LOGS_URL = "aws.cloudwatch.logs.url", AWS_LAMBDA_AWS_REQUEST_ID = "aws.lambda.aws_request_id", AWS_LAMBDA_EXECUTION_DURATION_IN_MILLIS = "aws.lambda.execution_duration_in_millis", AWS_LAMBDA_FUNCTION_NAME = "aws.lambda.function_name", AWS_LAMBDA_FUNCTION_VERSION = "aws.lambda.function_version", AWS_LAMBDA_INVOKED_ARN = "aws.lambda.invoked_arn", AWS_LAMBDA_INVOKED_FUNCTION_ARN = "aws.lambda.invoked_function_arn", AWS_LAMBDA_REMAINING_TIME_IN_MILLIS = "aws.lambda.remaining_time_in_millis", AWS_LOG_GROUP_NAMES = "aws.log.group.names", AWS_LOG_STREAM_NAMES = "aws.log.stream.names", BLOCKED_MAIN_THREAD = "blocked_main_thread", BROWSER_NAME = "browser.name", BROWSER_PERFORMANCE_NAVIGATION_ACTIVATION_START = "browser.performance.navigation.activation_start", BROWSER_PERFORMANCE_TIME_ORIGIN = "browser.performance.time_origin", BROWSER_REPORT_TYPE = "browser.report.type", BROWSER_SCRIPT_INVOKER = "browser.script.invoker", BROWSER_SCRIPT_INVOKER_TYPE = "browser.script.invoker_type", BROWSER_SCRIPT_SOURCE_CHAR_POSITION = "browser.script.source_char_position", BROWSER_VERSION = "browser.version", BROWSER_WEB_VITAL_CLS_REPORT_EVENT = "browser.web_vital.cls.report_event", BROWSER_WEB_VITAL_CLS_SOURCE_KEY = "browser.web_vital.cls.source.<key>", BROWSER_WEB_VITAL_CLS_VALUE = "browser.web_vital.cls.value", BROWSER_WEB_VITAL_FCP_VALUE = "browser.web_vital.fcp.value", BROWSER_WEB_VITAL_FP_VALUE = "browser.web_vital.fp.value", BROWSER_WEB_VITAL_INP_VALUE = "browser.web_vital.inp.value", BROWSER_WEB_VITAL_LCP_ELEMENT = "browser.web_vital.lcp.element", BROWSER_WEB_VITAL_LCP_ID = "browser.web_vital.lcp.id", BROWSER_WEB_VITAL_LCP_LOAD_TIME = "browser.web_vital.lcp.load_time", BROWSER_WEB_VITAL_LCP_RENDER_TIME = "browser.web_vital.lcp.render_time", BROWSER_WEB_VITAL_LCP_REPORT_EVENT = "browser.web_vital.lcp.report_event", BROWSER_WEB_VITAL_LCP_SIZE = "browser.web_vital.lcp.size", BROWSER_WEB_VITAL_LCP_URL = "browser.web_vital.lcp.url", BROWSER_WEB_VITAL_LCP_VALUE = "browser.web_vital.lcp.value", BROWSER_WEB_VITAL_TTFB_REQUEST_TIME = "browser.web_vital.ttfb.request_time", BROWSER_WEB_VITAL_TTFB_VALUE = "browser.web_vital.ttfb.value", CACHE_HIT = "cache.hit", CACHE_ITEM_SIZE = "cache.item_size", CACHE_KEY = "cache.key", CACHE_OPERATION = "cache.operation", CACHE_TTL = "cache.ttl", CACHE_WRITE = "cache.write", CHANNEL = "channel", CLIENT_ADDRESS = "client.address", CLIENT_PORT = "client.port", CLOUDFLARE_D1_DURATION = "cloudflare.d1.duration", CLOUDFLARE_D1_QUERY_TYPE = "cloudflare.d1.query_type", CLOUDFLARE_D1_ROWS_READ = "cloudflare.d1.rows_read", CLOUDFLARE_D1_ROWS_WRITTEN = "cloudflare.d1.rows_written", CLOUDFLARE_R2_BUCKET = "cloudflare.r2.bucket", CLOUDFLARE_R2_OPERATION = "cloudflare.r2.operation", CLOUDFLARE_R2_REQUEST_DELIMITER = "cloudflare.r2.request.delimiter", CLOUDFLARE_R2_REQUEST_KEY = "cloudflare.r2.request.key", CLOUDFLARE_R2_REQUEST_PART_NUMBER = "cloudflare.r2.request.part_number", CLOUDFLARE_R2_REQUEST_PREFIX = "cloudflare.r2.request.prefix", CLOUDFLARE_WORKFLOW_ATTEMPT = "cloudflare.workflow.attempt", CLOUDFLARE_WORKFLOW_RETRIES_BACKOFF = "cloudflare.workflow.retries.backoff", CLOUDFLARE_WORKFLOW_RETRIES_DELAY = "cloudflare.workflow.retries.delay", CLOUDFLARE_WORKFLOW_RETRIES_LIMIT = "cloudflare.workflow.retries.limit", CLOUDFLARE_WORKFLOW_TIMEOUT = "cloudflare.workflow.timeout", CLOUD_ACCOUNT_ID = "cloud.account.id", CLOUD_AVAILABILITY_ZONE = "cloud.availability_zone", CLOUD_PLATFORM = "cloud.platform", CLOUD_PROVIDER = "cloud.provider", CLOUD_REGION = "cloud.region", CLOUD_RESOURCE_ID = "cloud.resource_id", CLS = "cls", CLS_SOURCE_KEY = "cls.source.<key>", CODE_FILEPATH = "code.filepath", CODE_FILE_PATH = "code.file.path", CODE_FUNCTION = "code.function", CODE_FUNCTION_NAME = "code.function.name", CODE_LINENO = "code.lineno", CODE_LINE_NUMBER = "code.line.number", CODE_NAMESPACE = "code.namespace", CONNECTIONTYPE = "connectionType", CONNECTION_RTT = "connection.rtt", CULTURE_CALENDAR = "culture.calendar", CULTURE_DISPLAY_NAME = "culture.display_name", CULTURE_IS_24_HOUR_FORMAT = "culture.is_24_hour_format", CULTURE_LOCALE = "culture.locale", CULTURE_TIMEZONE = "culture.timezone", DB_COLLECTION_NAME = "db.collection.name", DB_DRIVER_NAME = "db.driver.name", DB_NAME = "db.name", DB_NAMESPACE = "db.namespace", DB_OPERATION = "db.operation", DB_OPERATION_BATCH_SIZE = "db.operation.batch.size", DB_OPERATION_NAME = "db.operation.name", DB_QUERY_PARAMETER_KEY = "db.query.parameter.<key>", DB_QUERY_SUMMARY = "db.query.summary", DB_QUERY_TEXT = "db.query.text", DB_REDIS_CONNECTION = "db.redis.connection", DB_REDIS_KEY = "db.redis.key", DB_REDIS_PARAMETERS = "db.redis.parameters", DB_SQL_BINDINGS = "db.sql.bindings", DB_STATEMENT = "db.statement", DB_STORED_PROCEDURE_NAME = "db.stored_procedure.name", DB_SYSTEM = "db.system", DB_SYSTEM_NAME = "db.system.name", DB_USER = "db.user", DEVICEMEMORY = "deviceMemory", DEVICE_ARCHS = "device.archs", DEVICE_BATTERY_LEVEL = "device.battery_level", DEVICE_BATTERY_TEMPERATURE = "device.battery_temperature", DEVICE_BOOT_TIME = "device.boot_time", DEVICE_BRAND = "device.brand", DEVICE_CHARGING = "device.charging", DEVICE_CHIPSET = "device.chipset", DEVICE_CLASS = "device.class", DEVICE_CONNECTION_TYPE = "device.connection_type", DEVICE_CPU_DESCRIPTION = "device.cpu_description", DEVICE_EXTERNAL_FREE_STORAGE = "device.external_free_storage", DEVICE_EXTERNAL_STORAGE_SIZE = "device.external_storage_size", DEVICE_FAMILY = "device.family", DEVICE_FREE_MEMORY = "device.free_memory", DEVICE_FREE_STORAGE = "device.free_storage", DEVICE_ID = "device.id", DEVICE_LOCALE = "device.locale", DEVICE_LOW_MEMORY = "device.low_memory", DEVICE_LOW_POWER_MODE = "device.low_power_mode", DEVICE_MANUFACTURER = "device.manufacturer", DEVICE_MEMORY_ESTIMATED_CAPACITY = "device.memory.estimated_capacity", DEVICE_MEMORY_SIZE = "device.memory_size", DEVICE_MODEL = "device.model", DEVICE_MODEL_ID = "device.model_id", DEVICE_NAME = "device.name", DEVICE_ONLINE = "device.online", DEVICE_ORIENTATION = "device.orientation", DEVICE_PROCESSOR_COUNT = "device.processor_count", DEVICE_PROCESSOR_FREQUENCY = "device.processor_frequency", DEVICE_SCREEN_DENSITY = "device.screen_density", DEVICE_SCREEN_DPI = "device.screen_dpi", DEVICE_SCREEN_HEIGHT_PIXELS = "device.screen_height_pixels", DEVICE_SCREEN_WIDTH_PIXELS = "device.screen_width_pixels", DEVICE_SIMULATOR = "device.simulator", DEVICE_STORAGE_SIZE = "device.storage_size", DEVICE_THERMAL_STATE = "device.thermal_state", DEVICE_TIMEZONE = "device.timezone", DEVICE_USABLE_MEMORY = "device.usable_memory", EFFECTIVECONNECTIONTYPE = "effectiveConnectionType", ENVIRONMENT = "environment", ERROR_TYPE = "error.type", EVENT_ID = "event.id", EVENT_NAME = "event.name", EXCEPTION_ESCAPED = "exception.escaped", EXCEPTION_MESSAGE = "exception.message", EXCEPTION_STACKTRACE = "exception.stacktrace", EXCEPTION_TYPE = "exception.type", FAAS_COLDSTART = "faas.coldstart", FAAS_CRON = "faas.cron", FAAS_DURATION_IN_MS = "faas.duration_in_ms", FAAS_ENTRY_POINT = "faas.entry_point", FAAS_IDENTITY = "faas.identity", FAAS_INVOCATION_ID = "faas.invocation_id", FAAS_NAME = "faas.name", FAAS_TIME = "faas.time", FAAS_TRIGGER = "faas.trigger", FAAS_VERSION = "faas.version", FCP = "fcp", FLAG_EVALUATION_KEY = "flag.evaluation.<key>", FP = "fp", FRAMES_DELAY = "frames.delay", FRAMES_FROZEN = "frames.frozen", FRAMES_FROZEN_RATE = "frames_frozen_rate", FRAMES_SLOW = "frames.slow", FRAMES_SLOW_RATE = "frames_slow_rate", FRAMES_TOTAL = "frames.total", FS_ERROR = "fs_error", GCP_FUNCTION_CONTEXT_EVENT_ID = "gcp.function.context.event_id", GCP_FUNCTION_CONTEXT_EVENT_TYPE = "gcp.function.context.event_type", GCP_FUNCTION_CONTEXT_ID = "gcp.function.context.id", GCP_FUNCTION_CONTEXT_RESOURCE = "gcp.function.context.resource", GCP_FUNCTION_CONTEXT_SOURCE = "gcp.function.context.source", GCP_FUNCTION_CONTEXT_SPECVERSION = "gcp.function.context.specversion", GCP_FUNCTION_CONTEXT_TIME = "gcp.function.context.time", GCP_FUNCTION_CONTEXT_TIMESTAMP = "gcp.function.context.timestamp", GCP_FUNCTION_CONTEXT_TYPE = "gcp.function.context.type", GCP_PROJECT_ID = "gcp.project.id", GEN_AI_AGENT_NAME = "gen_ai.agent.name", GEN_AI_CONTEXT_UTILIZATION = "gen_ai.context.utilization", GEN_AI_CONTEXT_WINDOW_SIZE = "gen_ai.context.window_size", GEN_AI_CONVERSATION_ID = "gen_ai.conversation.id", GEN_AI_COST_INPUT_TOKENS = "gen_ai.cost.input_tokens", GEN_AI_COST_OUTPUT_TOKENS = "gen_ai.cost.output_tokens", GEN_AI_COST_TOTAL_TOKENS = "gen_ai.cost.total_tokens", GEN_AI_EMBEDDINGS_INPUT = "gen_ai.embeddings.input", GEN_AI_FUNCTION_ID = "gen_ai.function_id", GEN_AI_INPUT_MESSAGES = "gen_ai.input.messages", GEN_AI_OPERATION_NAME = "gen_ai.operation.name", GEN_AI_OPERATION_TYPE = "gen_ai.operation.type", GEN_AI_OUTPUT_MESSAGES = "gen_ai.output.messages", GEN_AI_PIPELINE_NAME = "gen_ai.pipeline.name", GEN_AI_PROMPT = "gen_ai.prompt", GEN_AI_PROMPT_NAME = "gen_ai.prompt.name", GEN_AI_PROVIDER_NAME = "gen_ai.provider.name", GEN_AI_REQUEST_AVAILABLE_TOOLS = "gen_ai.request.available_tools", GEN_AI_REQUEST_FREQUENCY_PENALTY = "gen_ai.request.frequency_penalty", GEN_AI_REQUEST_MAX_TOKENS = "gen_ai.request.max_tokens", GEN_AI_REQUEST_MESSAGES = "gen_ai.request.messages", GEN_AI_REQUEST_MODEL = "gen_ai.request.model", GEN_AI_REQUEST_PRESENCE_PENALTY = "gen_ai.request.presence_penalty", GEN_AI_REQUEST_SEED = "gen_ai.request.seed", GEN_AI_REQUEST_TEMPERATURE = "gen_ai.request.temperature", GEN_AI_REQUEST_TOP_K = "gen_ai.request.top_k", GEN_AI_REQUEST_TOP_P = "gen_ai.request.top_p", GEN_AI_RESPONSE_FINISH_REASONS = "gen_ai.response.finish_reasons", GEN_AI_RESPONSE_ID = "gen_ai.response.id", GEN_AI_RESPONSE_MODEL = "gen_ai.response.model", GEN_AI_RESPONSE_STREAMING = "gen_ai.response.streaming", GEN_AI_RESPONSE_TEXT = "gen_ai.response.text", GEN_AI_RESPONSE_TIME_TO_FIRST_CHUNK = "gen_ai.response.time_to_first_chunk", GEN_AI_RESPONSE_TIME_TO_FIRST_TOKEN = "gen_ai.response.time_to_first_token", GEN_AI_RESPONSE_TOKENS_PER_SECOND = "gen_ai.response.tokens_per_second", GEN_AI_RESPONSE_TOOL_CALLS = "gen_ai.response.tool_calls", GEN_AI_SYSTEM = "gen_ai.system", GEN_AI_SYSTEM_INSTRUCTIONS = "gen_ai.system_instructions", GEN_AI_SYSTEM_MESSAGE = "gen_ai.system.message", GEN_AI_TOOL_CALL_ARGUMENTS = "gen_ai.tool.call.arguments", GEN_AI_TOOL_CALL_RESULT = "gen_ai.tool.call.result", GEN_AI_TOOL_DEFINITIONS = "gen_ai.tool.definitions", GEN_AI_TOOL_DESCRIPTION = "gen_ai.tool.description", GEN_AI_TOOL_INPUT = "gen_ai.tool.input", GEN_AI_TOOL_MESSAGE = "gen_ai.tool.message", GEN_AI_TOOL_NAME = "gen_ai.tool.name", GEN_AI_TOOL_OUTPUT = "gen_ai.tool.output", GEN_AI_TOOL_TYPE = "gen_ai.tool.type", GEN_AI_USAGE_CACHE_CREATION_INPUT_TOKENS = "gen_ai.usage.cache_creation.input_tokens", GEN_AI_USAGE_CACHE_READ_INPUT_TOKENS = "gen_ai.usage.cache_read.input_tokens", GEN_AI_USAGE_COMPLETION_TOKENS = "gen_ai.usage.completion_tokens", GEN_AI_USAGE_INPUT_TOKENS = "gen_ai.usage.input_tokens", GEN_AI_USAGE_INPUT_TOKENS_CACHED = "gen_ai.usage.input_tokens.cached", GEN_AI_USAGE_INPUT_TOKENS_CACHE_WRITE = "gen_ai.usage.input_tokens.cache_write", GEN_AI_USAGE_OUTPUT_TOKENS = "gen_ai.usage.output_tokens", GEN_AI_USAGE_OUTPUT_TOKENS_REASONING = "gen_ai.usage.output_tokens.reasoning", GEN_AI_USAGE_PROMPT_TOKENS = "gen_ai.usage.prompt_tokens", GEN_AI_USAGE_REASONING_OUTPUT_TOKENS = "gen_ai.usage.reasoning.output_tokens", GEN_AI_USAGE_TOTAL_TOKENS = "gen_ai.usage.total_tokens", GRAPHQL_DOCUMENT = "graphql.document", GRAPHQL_OPERATION_NAME = "graphql.operation.name", GRAPHQL_OPERATION_TYPE = "graphql.operation.type", HARDWARECONCURRENCY = "hardwareConcurrency", HTTP_CLIENT_IP = "http.client_ip", HTTP_DECODED_RESPONSE_CONTENT_LENGTH = "http.decoded_response_content_length", HTTP_FLAVOR = "http.flavor", HTTP_FRAGMENT = "http.fragment", HTTP_HOST = "http.host", HTTP_METHOD = "http.method", HTTP_QUERY = "http.query", HTTP_REQUEST_BODY_DATA = "http.request.body.data", HTTP_REQUEST_CONNECTION_END = "http.request.connection_end", HTTP_REQUEST_CONNECT_START = "http.request.connect_start", HTTP_REQUEST_DOMAIN_LOOKUP_END = "http.request.domain_lookup_end", HTTP_REQUEST_DOMAIN_LOOKUP_START = "http.request.domain_lookup_start", HTTP_REQUEST_FETCH_START = "http.request.fetch_start", HTTP_REQUEST_HEADER_KEY = "http.request.header.<key>", HTTP_REQUEST_METHOD = "http.request.method", _HTTP_REQUEST_METHOD = "http.request_method", HTTP_REQUEST_REDIRECT_END = "http.request.redirect_end", HTTP_REQUEST_REDIRECT_START = "http.request.redirect_start", HTTP_REQUEST_REQUEST_START = "http.request.request_start", HTTP_REQUEST_RESEND_COUNT = "http.request.resend_count", HTTP_REQUEST_RESPONSE_END = "http.request.response_end", HTTP_REQUEST_RESPONSE_START = "http.request.response_start", HTTP_REQUEST_SECURE_CONNECTION_START = "http.request.secure_connection_start", HTTP_REQUEST_TIME_TO_FIRST_BYTE = "http.request.time_to_first_byte", HTTP_REQUEST_WORKER_START = "http.request.worker_start", HTTP_RESPONSE_BODY_SIZE = "http.response.body.size", HTTP_RESPONSE_CONTENT_LENGTH = "http.response_content_length", HTTP_RESPONSE_HEADER_CONTENT_LENGTH = "http.response.header.content-length", HTTP_RESPONSE_HEADER_KEY = "http.response.header.<key>", HTTP_RESPONSE_SIZE = "http.response.size", HTTP_RESPONSE_STATUS_CODE = "http.response.status_code", HTTP_RESPONSE_TRANSFER_SIZE = "http.response_transfer_size", HTTP_ROUTE = "http.route", HTTP_SCHEME = "http.scheme", HTTP_SERVER_NAME = "http.server_name", HTTP_SERVER_REQUEST_TIME_IN_QUEUE = "http.server.request.time_in_queue", HTTP_STATUS_CODE = "http.status_code", HTTP_TARGET = "http.target", HTTP_URL = "http.url", HTTP_USER_AGENT = "http.user_agent", ID = "id", INP = "inp", JSONRPC_PROTOCOL_VERSION = "jsonrpc.protocol.version", JSONRPC_REQUEST_ID = "jsonrpc.request.id", JVM_GC_ACTION = "jvm.gc.action", JVM_GC_NAME = "jvm.gc.name", JVM_MEMORY_POOL_NAME = "jvm.memory.pool.name", JVM_MEMORY_TYPE = "jvm.memory.type", JVM_THREAD_DAEMON = "jvm.thread.daemon", JVM_THREAD_STATE = "jvm.thread.state", LCP = "lcp", LCP_ELEMENT = "lcp.element", LCP_ID = "lcp.id", LCP_LOADTIME = "lcp.loadTime", LCP_RENDERTIME = "lcp.renderTime", LCP_SIZE = "lcp.size", LCP_URL = "lcp.url", LOGGER_NAME = "logger.name", MCP_CANCELLED_REASON = "mcp.cancelled.reason", MCP_CANCELLED_REQUEST_ID = "mcp.cancelled.request_id", MCP_CLIENT_NAME = "mcp.client.name", MCP_CLIENT_TITLE = "mcp.client.title", MCP_CLIENT_VERSION = "mcp.client.version", MCP_LIFECYCLE_PHASE = "mcp.lifecycle.phase", MCP_LOGGING_DATA_TYPE = "mcp.logging.data_type", MCP_LOGGING_LEVEL = "mcp.logging.level", MCP_LOGGING_LOGGER = "mcp.logging.logger", MCP_LOGGING_MESSAGE = "mcp.logging.message", MCP_METHOD_NAME = "mcp.method.name", MCP_PROGRESS_CURRENT = "mcp.progress.current", MCP_PROGRESS_MESSAGE = "mcp.progress.message", MCP_PROGRESS_PERCENTAGE = "mcp.progress.percentage", MCP_PROGRESS_TOKEN = "mcp.progress.token", MCP_PROGRESS_TOTAL = "mcp.progress.total", MCP_PROMPT_NAME = "mcp.prompt.name", MCP_PROMPT_RESULT_DESCRIPTION = "mcp.prompt.result.description", MCP_PROMPT_RESULT_MESSAGE_CONTENT = "mcp.prompt.result.message_content", MCP_PROMPT_RESULT_MESSAGE_COUNT = "mcp.prompt.result.message_count", MCP_PROMPT_RESULT_MESSAGE_ROLE = "mcp.prompt.result.message_role", MCP_PROTOCOL_READY = "mcp.protocol.ready", MCP_PROTOCOL_VERSION = "mcp.protocol.version", MCP_REQUEST_ARGUMENT_KEY = "mcp.request.argument.<key>", MCP_REQUEST_ARGUMENT_NAME = "mcp.request.argument.name", MCP_REQUEST_ARGUMENT_URI = "mcp.request.argument.uri", MCP_REQUEST_ID = "mcp.request.id", MCP_RESOURCE_PROTOCOL = "mcp.resource.protocol", MCP_RESOURCE_URI = "mcp.resource.uri", MCP_SERVER_NAME = "mcp.server.name", MCP_SERVER_TITLE = "mcp.server.title", MCP_SERVER_VERSION = "mcp.server.version", MCP_SESSION_ID = "mcp.session.id", MCP_TOOL_NAME = "mcp.tool.name", MCP_TOOL_RESULT_CONTENT = "mcp.tool.result.content", MCP_TOOL_RESULT_CONTENT_COUNT = "mcp.tool.result.content_count", MCP_TOOL_RESULT_IS_ERROR = "mcp.tool.result.is_error", MCP_TRANSPORT = "mcp.transport", MDC_KEY = "mdc.<key>", MESSAGING_BATCH_MESSAGE_COUNT = "messaging.batch.message_count", MESSAGING_DESTINATION_CONNECTION = "messaging.destination.connection", MESSAGING_DESTINATION_NAME = "messaging.destination.name", MESSAGING_MESSAGE_BODY_SIZE = "messaging.message.body.size", MESSAGING_MESSAGE_ENVELOPE_SIZE = "messaging.message.envelope.size", MESSAGING_MESSAGE_ID = "messaging.message.id", MESSAGING_MESSAGE_RECEIVE_LATENCY = "messaging.message.receive.latency", MESSAGING_MESSAGE_RETRY_COUNT = "messaging.message.retry.count", MESSAGING_OPERATION_NAME = "messaging.operation.name", MESSAGING_OPERATION_TYPE = "messaging.operation.type", MESSAGING_SYSTEM = "messaging.system", METHOD = "method", MIDDLEWARE_NAME = "middleware.name", NAVIGATION_TYPE = "navigation.type", NEL_ELAPSED_TIME = "nel.elapsed_time", NEL_PHASE = "nel.phase", NEL_REFERRER = "nel.referrer", NEL_SAMPLING_FUNCTION = "nel.sampling_function", NEL_TYPE = "nel.type", NETWORK_CONNECTION_EFFECTIVE_TYPE = "network.connection.effective_type", NETWORK_CONNECTION_RTT = "network.connection.rtt", NETWORK_CONNECTION_TYPE = "network.connection.type", NETWORK_LOCAL_ADDRESS = "network.local.address", NETWORK_LOCAL_PORT = "network.local.port", NETWORK_PEER_ADDRESS = "network.peer.address", NETWORK_PEER_PORT = "network.peer.port", NETWORK_PROTOCOL_NAME = "network.protocol.name", NETWORK_PROTOCOL_VERSION = "network.protocol.version", NETWORK_TRANSPORT = "network.transport", NETWORK_TYPE = "network.type", NET_HOST_IP = "net.host.ip", NET_HOST_NAME = "net.host.name", NET_HOST_PORT = "net.host.port", NET_PEER_IP = "net.peer.ip", NET_PEER_NAME = "net.peer.name", NET_PEER_PORT = "net.peer.port", NET_PROTOCOL_NAME = "net.protocol.name", NET_PROTOCOL_VERSION = "net.protocol.version", NET_SOCK_FAMILY = "net.sock.family", NET_SOCK_HOST_ADDR = "net.sock.host.addr", NET_SOCK_HOST_PORT = "net.sock.host.port", NET_SOCK_PEER_ADDR = "net.sock.peer.addr", NET_SOCK_PEER_NAME = "net.sock.peer.name", NET_SOCK_PEER_PORT = "net.sock.peer.port", NET_TRANSPORT = "net.transport", OS_BUILD = "os.build", OS_BUILD_ID = "os.build_id", OS_DESCRIPTION = "os.description", OS_KERNEL_VERSION = "os.kernel_version", OS_NAME = "os.name", OS_RAW_DESCRIPTION = "os.raw_description", OS_ROOTED = "os.rooted", OS_THEME = "os.theme", OS_TYPE = "os.type", OS_VERSION = "os.version", OTEL_SCOPE_NAME = "otel.scope.name", OTEL_SCOPE_VERSION = "otel.scope.version", OTEL_STATUS_CODE = "otel.status_code", OTEL_STATUS_DESCRIPTION = "otel.status_description", PARAMS_KEY = "params.<key>", PERFORMANCE_ACTIVATIONSTART = "performance.activationStart", PERFORMANCE_TIMEORIGIN = "performance.timeOrigin", PREVIOUS_ROUTE = "previous_route", PROCESS_COMMAND_ARGS = "process.command_args", PROCESS_EXECUTABLE_NAME = "process.executable.name", PROCESS_PID = "process.pid", PROCESS_RUNTIME_DESCRIPTION = "process.runtime.description", PROCESS_RUNTIME_ENGINE_NAME = "process.runtime.engine.name", PROCESS_RUNTIME_ENGINE_VERSION = "process.runtime.engine.version", PROCESS_RUNTIME_NAME = "process.runtime.name", PROCESS_RUNTIME_VERSION = "process.runtime.version", QUERY_KEY = "query.<key>", REACT_VERSION = "react.version", RELEASE = "release", REMIX_ACTION_FORM_DATA_KEY = "remix.action_form_data.<key>", REPLAY_ID = "replay_id", RESOURCE_DEPLOYMENT_ENVIRONMENT = "resource.deployment.environment", RESOURCE_DEPLOYMENT_ENVIRONMENT_NAME = "resource.deployment.environment.name", RESOURCE_RENDER_BLOCKING_STATUS = "resource.render_blocking_status", ROUTE = "route", RPC_GRPC_STATUS_CODE = "rpc.grpc.status_code", RPC_METHOD = "rpc.method", RPC_RESPONSE_STATUS_CODE = "rpc.response.status_code", RPC_SERVICE = "rpc.service", RUNTIME_BUILD = "runtime.build", RUNTIME_NAME = "runtime.name", RUNTIME_RAW_DESCRIPTION = "runtime.raw_description", RUNTIME_VERSION = "runtime.version", SCORE_KEY = "score.<key>", SCORE_RATIO_KEY = "score.ratio.<key>", SCORE_TOTAL = "score.total", SCORE_WEIGHT_KEY = "score.weight.<key>", SENTRY_ACTION = "sentry.action", SENTRY_BROWSER_NAME = "sentry.browser.name", SENTRY_BROWSER_VERSION = "sentry.browser.version", SENTRY_CANCELLATION_REASON = "sentry.cancellation_reason", SENTRY_CATEGORY = "sentry.category", SENTRY_CLIENT_SAMPLE_RATE = "sentry.client_sample_rate", SENTRY_DESCRIPTION = "sentry.description", SENTRY_DIST = "sentry.dist", SENTRY_DOMAIN = "sentry.domain", SENTRY_DSC_ENVIRONMENT = "sentry.dsc.environment", SENTRY_DSC_PROJECT_ID = "sentry.dsc.project_id", SENTRY_DSC_PUBLIC_KEY = "sentry.dsc.public_key", SENTRY_DSC_RELEASE = "sentry.dsc.release", SENTRY_DSC_SAMPLED = "sentry.dsc.sampled", SENTRY_DSC_SAMPLE_RATE = "sentry.dsc.sample_rate", SENTRY_DSC_TRACE_ID = "sentry.dsc.trace_id", SENTRY_DSC_TRANSACTION = "sentry.dsc.transaction", SENTRY_ENVIRONMENT = "sentry.environment", SENTRY_EXCLUSIVE_TIME = "sentry.exclusive_time", SENTRY_GRAPHQL_OPERATION = "sentry.graphql.operation", SENTRY_GROUP = "sentry.group", SENTRY_HTTP_PREFETCH = "sentry.http.prefetch", SENTRY_IDLE_SPAN_FINISH_REASON = "sentry.idle_span_finish_reason", SENTRY_IS_REMOTE = "sentry.is_remote", SENTRY_KIND = "sentry.kind", SENTRY_MAIN_THREAD = "sentry.main_thread", SENTRY_MESSAGE_PARAMETER_KEY = "sentry.message.parameter.<key>", SENTRY_MESSAGE_TEMPLATE = "sentry.message.template", SENTRY_MOBILE = "sentry.mobile", SENTRY_MODULE_KEY = "sentry.module.<key>", SENTRY_NEXTJS_SSR_FUNCTION_ROUTE = "sentry.nextjs.ssr.function.route", SENTRY_NEXTJS_SSR_FUNCTION_TYPE = "sentry.nextjs.ssr.function.type", SENTRY_NORMALIZED_DB_QUERY = "sentry.normalized_db_query", SENTRY_NORMALIZED_DB_QUERY_HASH = "sentry.normalized_db_query.hash", SENTRY_NORMALIZED_DESCRIPTION = "sentry.normalized_description", SENTRY_OBSERVED_TIMESTAMP_NANOS = "sentry.observed_timestamp_nanos", SENTRY_OP = "sentry.op", SENTRY_ORIGIN = "sentry.origin", SENTRY_PLATFORM = "sentry.platform", SENTRY_PROFILER_ID = "sentry.profiler_id", SENTRY_PROFILE_ID = "sentry.profile_id", SENTRY_RELEASE = "sentry.release", SENTRY_REPLAY_ID = "sentry.replay_id", SENTRY_REPLAY_IS_BUFFERING = "sentry.replay_is_buffering", SENTRY_REPORT_EVENT = "sentry.report_event", SENTRY_SDK_INTEGRATIONS = "sentry.sdk.integrations", SENTRY_SDK_NAME = "sentry.sdk.name", SENTRY_SDK_VERSION = "sentry.sdk.version", SENTRY_SEGMENT_ID = "sentry.segment.id", _SENTRY_SEGMENT_ID = "sentry.segment_id", SENTRY_SEGMENT_NAME = "sentry.segment.name", SENTRY_SERVER_SAMPLE_RATE = "sentry.server_sample_rate", SENTRY_SOURCE = "sentry.source", SENTRY_SPAN_SOURCE = "sentry.span.source", SENTRY_STATUS_CODE = "sentry.status_code", SENTRY_STATUS_MESSAGE = "sentry.status.message", SENTRY_TIMESTAMP_SEQUENCE = "sentry.timestamp.sequence", SENTRY_TRACE_PARENT_SPAN_ID = "sentry.trace.parent_span_id", SENTRY_TRANSACTION = "sentry.transaction", SENTRY_USER_EMAIL = "sentry.user.email", SENTRY_USER_GEO_CITY = "sentry.user.geo.city", SENTRY_USER_GEO_COUNTRY_CODE = "sentry.user.geo.country_code", SENTRY_USER_GEO_REGION = "sentry.user.geo.region", SENTRY_USER_GEO_SUBDIVISION = "sentry.user.geo.subdivision", SENTRY_USER_ID = "sentry.user.id", SENTRY_USER_IP = "sentry.user.ip", SENTRY_USER_USERNAME = "sentry.user.username", SERVER_ADDRESS = "server.address", SERVER_PORT = "server.port", SERVICE_NAME = "service.name", SERVICE_VERSION = "service.version", SESSION_ID = "session.id", STALL_PERCENTAGE = "stall_percentage", STALL_TOTAL_TIME = "stall_total_time", STATE_TYPE = "state.type", THREAD_ID = "thread.id", THREAD_NAME = "thread.name", TIMBER_TAG = "timber.tag", TIME_TO_FULL_DISPLAY = "time_to_full_display", TIME_TO_INITIAL_DISPLAY = "time_to_initial_display", TRANSACTION = "transaction", TRPC_PROCEDURE_PATH = "trpc.procedure_path", TRPC_PROCEDURE_TYPE = "trpc.procedure_type", TTFB = "ttfb", TTFB_REQUESTTIME = "ttfb.requestTime", TYPE = "type", UI_COMPONENT_NAME = "ui.component_name", UI_CONTRIBUTES_TO_TTFD = "ui.contributes_to_ttfd", UI_CONTRIBUTES_TO_TTID = "ui.contributes_to_ttid", UI_ELEMENT_HEIGHT = "ui.element.height", UI_ELEMENT_ID = "ui.element.id", UI_ELEMENT_IDENTIFIER = "ui.element.identifier", UI_ELEMENT_LOAD_TIME = "ui.element.load_time", UI_ELEMENT_PAINT_TYPE = "ui.element.paint_type", UI_ELEMENT_RENDER_TIME = "ui.element.render_time", UI_ELEMENT_TYPE = "ui.element.type", UI_ELEMENT_URL = "ui.element.url", UI_ELEMENT_WIDTH = "ui.element.width", URL = "url", URL_DOMAIN = "url.domain", URL_FRAGMENT = "url.fragment", URL_FULL = "url.full", URL_PATH = "url.path", URL_PATH_PARAMETER_KEY = "url.path.parameter.<key>", URL_PORT = "url.port", URL_QUERY = "url.query", URL_SCHEME = "url.scheme", URL_TEMPLATE = "url.template", USER_AGENT_ORIGINAL = "user_agent.original", USER_EMAIL = "user.email", USER_FULL_NAME = "user.full_name", USER_GEO_CITY = "user.geo.city", USER_GEO_COUNTRY_CODE = "user.geo.country_code", USER_GEO_REGION = "user.geo.region", USER_GEO_SUBDIVISION = "user.geo.subdivision", USER_HASH = "user.hash", USER_ID = "user.id", USER_IP_ADDRESS = "user.ip_address", USER_NAME = "user.name", USER_ROLES = "user.roles", VERCEL_BRANCH = "vercel.branch", VERCEL_BUILD_ID = "vercel.build_id", VERCEL_DEPLOYMENT_ID = "vercel.deployment_id", VERCEL_DESTINATION = "vercel.destination", VERCEL_EDGE_TYPE = "vercel.edge_type", VERCEL_ENTRYPOINT = "vercel.entrypoint", VERCEL_EXECUTION_REGION = "vercel.execution_region", VERCEL_ID = "vercel.id", VERCEL_JA3_DIGEST = "vercel.ja3_digest", VERCEL_JA4_DIGEST = "vercel.ja4_digest", VERCEL_LOG_TYPE = "vercel.log_type", VERCEL_PATH = "vercel.path", VERCEL_PROJECT_ID = "vercel.project_id", VERCEL_PROJECT_NAME = "vercel.project_name", VERCEL_PROXY_CACHE_ID = "vercel.proxy.cache_id", VERCEL_PROXY_CLIENT_IP = "vercel.proxy.client_ip", VERCEL_PROXY_HOST = "vercel.proxy.host", VERCEL_PROXY_LAMBDA_REGION = "vercel.proxy.lambda_region", VERCEL_PROXY_METHOD = "vercel.proxy.method", VERCEL_PROXY_PATH = "vercel.proxy.path", VERCEL_PROXY_PATH_TYPE = "vercel.proxy.path_type", VERCEL_PROXY_PATH_TYPE_VARIANT = "vercel.proxy.path_type_variant", VERCEL_PROXY_REFERER = "vercel.proxy.referer", VERCEL_PROXY_REGION = "vercel.proxy.region", VERCEL_PROXY_RESPONSE_BYTE_SIZE = "vercel.proxy.response_byte_size", VERCEL_PROXY_SCHEME = "vercel.proxy.scheme", VERCEL_PROXY_STATUS_CODE = "vercel.proxy.status_code", VERCEL_PROXY_TIMESTAMP = "vercel.proxy.timestamp", VERCEL_PROXY_USER_AGENT = "vercel.proxy.user_agent", VERCEL_PROXY_VERCEL_CACHE = "vercel.proxy.vercel_cache", VERCEL_PROXY_VERCEL_ID = "vercel.proxy.vercel_id", VERCEL_PROXY_WAF_ACTION = "vercel.proxy.waf_action", VERCEL_PROXY_WAF_RULE_ID = "vercel.proxy.waf_rule_id", VERCEL_REQUEST_ID = "vercel.request_id", VERCEL_SOURCE = "vercel.source", VERCEL_STATUS_CODE = "vercel.status_code", ATTRIBUTE_TYPE = {
		[AI_CITATIONS]: "string[]",
		[AI_COMPLETION_TOKENS_USED]: "integer",
		[AI_DOCUMENTS]: "string[]",
		[AI_FINISH_REASON]: "string",
		[AI_FREQUENCY_PENALTY]: "double",
		[AI_FUNCTION_CALL]: "string",
		[AI_GENERATION_ID]: "string",
		[AI_INPUT_MESSAGES]: "string",
		[AI_IS_SEARCH_REQUIRED]: "boolean",
		[AI_METADATA]: "string",
		[AI_MODEL_ID]: "string",
		[AI_MODEL_PROVIDER]: "string",
		[AI_PIPELINE_NAME]: "string",
		[AI_PREAMBLE]: "string",
		[AI_PRESENCE_PENALTY]: "double",
		[AI_PROMPT_TOKENS_USED]: "integer",
		[AI_RAW_PROMPTING]: "boolean",
		[AI_RESPONSES]: "string[]",
		[AI_RESPONSE_FORMAT]: "string",
		[AI_SEARCH_QUERIES]: "string[]",
		[AI_SEARCH_RESULTS]: "string[]",
		[AI_SEED]: "string",
		[AI_STREAMING]: "boolean",
		[AI_TAGS]: "string",
		[AI_TEMPERATURE]: "double",
		[AI_TEXTS]: "string[]",
		[AI_TOOLS]: "string[]",
		[AI_TOOL_CALLS]: "string[]",
		[AI_TOP_K]: "integer",
		[AI_TOP_P]: "double",
		[AI_TOTAL_COST]: "double",
		[AI_TOTAL_TOKENS_USED]: "integer",
		[AI_WARNINGS]: "string[]",
		[ANGULAR_VERSION]: "string",
		[APP_APP_BUILD]: "string",
		[APP_APP_IDENTIFIER]: "string",
		[APP_APP_NAME]: "string",
		[APP_APP_START_TIME]: "string",
		[APP_APP_VERSION]: "string",
		[APP_BUILD]: "string",
		[APP_IDENTIFIER]: "string",
		[APP_IN_FOREGROUND]: "boolean",
		[APP_NAME]: "string",
		[APP_START_COLD]: "double",
		[APP_START_TIME]: "string",
		[APP_START_TYPE]: "string",
		[APP_START_WARM]: "double",
		[APP_VERSION]: "string",
		[APP_VITALS_FRAMES_DELAY_VALUE]: "integer",
		[APP_VITALS_FRAMES_FROZEN_COUNT]: "integer",
		[APP_VITALS_FRAMES_SLOW_COUNT]: "integer",
		[APP_VITALS_FRAMES_TOTAL_COUNT]: "integer",
		[APP_VITALS_START_COLD_VALUE]: "double",
		[APP_VITALS_START_PREWARMED]: "boolean",
		[APP_VITALS_START_REASON]: "string",
		[APP_VITALS_START_SCREEN]: "string",
		[APP_VITALS_START_TYPE]: "string",
		[APP_VITALS_START_WARM_VALUE]: "double",
		[APP_VITALS_TTFD_VALUE]: "double",
		[APP_VITALS_TTID_VALUE]: "double",
		[ART_GC_BLOCKING_COUNT]: "integer",
		[ART_GC_BLOCKING_TIME]: "double",
		[ART_GC_PRE_OOME_COUNT]: "integer",
		[ART_GC_TOTAL_COUNT]: "integer",
		[ART_GC_TOTAL_TIME]: "double",
		[ART_GC_WAITING_TIME]: "double",
		[ART_MEMORY_FREE]: "integer",
		[ART_MEMORY_FREE_UNTIL_GC]: "integer",
		[ART_MEMORY_FREE_UNTIL_OOME]: "integer",
		[ART_MEMORY_MAX]: "integer",
		[ART_MEMORY_TOTAL]: "integer",
		[AWS_CLOUDWATCH_LOGS_LOG_GROUP]: "string",
		[AWS_CLOUDWATCH_LOGS_LOG_STREAM]: "string",
		[AWS_CLOUDWATCH_LOGS_URL]: "string",
		[AWS_LAMBDA_AWS_REQUEST_ID]: "string",
		[AWS_LAMBDA_EXECUTION_DURATION_IN_MILLIS]: "double",
		[AWS_LAMBDA_FUNCTION_NAME]: "string",
		[AWS_LAMBDA_FUNCTION_VERSION]: "string",
		[AWS_LAMBDA_INVOKED_ARN]: "string",
		[AWS_LAMBDA_INVOKED_FUNCTION_ARN]: "string",
		[AWS_LAMBDA_REMAINING_TIME_IN_MILLIS]: "double",
		[AWS_LOG_GROUP_NAMES]: "string[]",
		[AWS_LOG_STREAM_NAMES]: "string[]",
		[BLOCKED_MAIN_THREAD]: "boolean",
		[BROWSER_NAME]: "string",
		[BROWSER_PERFORMANCE_NAVIGATION_ACTIVATION_START]: "double",
		[BROWSER_PERFORMANCE_TIME_ORIGIN]: "double",
		[BROWSER_REPORT_TYPE]: "string",
		[BROWSER_SCRIPT_INVOKER]: "string",
		[BROWSER_SCRIPT_INVOKER_TYPE]: "string",
		[BROWSER_SCRIPT_SOURCE_CHAR_POSITION]: "integer",
		[BROWSER_VERSION]: "string",
		[BROWSER_WEB_VITAL_CLS_REPORT_EVENT]: "string",
		[BROWSER_WEB_VITAL_CLS_SOURCE_KEY]: "string",
		[BROWSER_WEB_VITAL_CLS_VALUE]: "double",
		[BROWSER_WEB_VITAL_FCP_VALUE]: "double",
		[BROWSER_WEB_VITAL_FP_VALUE]: "double",
		[BROWSER_WEB_VITAL_INP_VALUE]: "double",
		[BROWSER_WEB_VITAL_LCP_ELEMENT]: "string",
		[BROWSER_WEB_VITAL_LCP_ID]: "string",
		[BROWSER_WEB_VITAL_LCP_LOAD_TIME]: "integer",
		[BROWSER_WEB_VITAL_LCP_RENDER_TIME]: "integer",
		[BROWSER_WEB_VITAL_LCP_REPORT_EVENT]: "string",
		[BROWSER_WEB_VITAL_LCP_SIZE]: "integer",
		[BROWSER_WEB_VITAL_LCP_URL]: "string",
		[BROWSER_WEB_VITAL_LCP_VALUE]: "double",
		[BROWSER_WEB_VITAL_TTFB_REQUEST_TIME]: "double",
		[BROWSER_WEB_VITAL_TTFB_VALUE]: "double",
		[CACHE_HIT]: "boolean",
		[CACHE_ITEM_SIZE]: "integer",
		[CACHE_KEY]: "string[]",
		[CACHE_OPERATION]: "string",
		[CACHE_TTL]: "integer",
		[CACHE_WRITE]: "boolean",
		[CHANNEL]: "string",
		[CLIENT_ADDRESS]: "string",
		[CLIENT_PORT]: "integer",
		[CLOUDFLARE_D1_DURATION]: "integer",
		[CLOUDFLARE_D1_QUERY_TYPE]: "string",
		[CLOUDFLARE_D1_ROWS_READ]: "integer",
		[CLOUDFLARE_D1_ROWS_WRITTEN]: "integer",
		[CLOUDFLARE_R2_BUCKET]: "string",
		[CLOUDFLARE_R2_OPERATION]: "string",
		[CLOUDFLARE_R2_REQUEST_DELIMITER]: "string",
		[CLOUDFLARE_R2_REQUEST_KEY]: "string",
		[CLOUDFLARE_R2_REQUEST_PART_NUMBER]: "integer",
		[CLOUDFLARE_R2_REQUEST_PREFIX]: "string",
		[CLOUDFLARE_WORKFLOW_ATTEMPT]: "integer",
		[CLOUDFLARE_WORKFLOW_RETRIES_BACKOFF]: "string",
		[CLOUDFLARE_WORKFLOW_RETRIES_DELAY]: "string",
		[CLOUDFLARE_WORKFLOW_RETRIES_LIMIT]: "integer",
		[CLOUDFLARE_WORKFLOW_TIMEOUT]: "string",
		[CLOUD_ACCOUNT_ID]: "string",
		[CLOUD_AVAILABILITY_ZONE]: "string",
		[CLOUD_PLATFORM]: "string",
		[CLOUD_PROVIDER]: "string",
		[CLOUD_REGION]: "string",
		[CLOUD_RESOURCE_ID]: "string",
		[CLS]: "double",
		[CLS_SOURCE_KEY]: "string",
		[CODE_FILEPATH]: "string",
		[CODE_FILE_PATH]: "string",
		[CODE_FUNCTION]: "string",
		[CODE_FUNCTION_NAME]: "string",
		[CODE_LINENO]: "integer",
		[CODE_LINE_NUMBER]: "integer",
		[CODE_NAMESPACE]: "string",
		[CONNECTIONTYPE]: "string",
		[CONNECTION_RTT]: "integer",
		[CULTURE_CALENDAR]: "string",
		[CULTURE_DISPLAY_NAME]: "string",
		[CULTURE_IS_24_HOUR_FORMAT]: "boolean",
		[CULTURE_LOCALE]: "string",
		[CULTURE_TIMEZONE]: "string",
		[DB_COLLECTION_NAME]: "string",
		[DB_DRIVER_NAME]: "string",
		[DB_NAME]: "string",
		[DB_NAMESPACE]: "string",
		[DB_OPERATION]: "string",
		[DB_OPERATION_BATCH_SIZE]: "integer",
		[DB_OPERATION_NAME]: "string",
		[DB_QUERY_PARAMETER_KEY]: "string",
		[DB_QUERY_SUMMARY]: "string",
		[DB_QUERY_TEXT]: "string",
		[DB_REDIS_CONNECTION]: "string",
		[DB_REDIS_KEY]: "string",
		[DB_REDIS_PARAMETERS]: "string[]",
		[DB_SQL_BINDINGS]: "string[]",
		[DB_STATEMENT]: "string",
		[DB_STORED_PROCEDURE_NAME]: "string",
		[DB_SYSTEM]: "string",
		[DB_SYSTEM_NAME]: "string",
		[DB_USER]: "string",
		[DEVICEMEMORY]: "string",
		[DEVICE_ARCHS]: "string[]",
		[DEVICE_BATTERY_LEVEL]: "double",
		[DEVICE_BATTERY_TEMPERATURE]: "double",
		[DEVICE_BOOT_TIME]: "string",
		[DEVICE_BRAND]: "string",
		[DEVICE_CHARGING]: "boolean",
		[DEVICE_CHIPSET]: "string",
		[DEVICE_CLASS]: "string",
		[DEVICE_CONNECTION_TYPE]: "string",
		[DEVICE_CPU_DESCRIPTION]: "string",
		[DEVICE_EXTERNAL_FREE_STORAGE]: "integer",
		[DEVICE_EXTERNAL_STORAGE_SIZE]: "integer",
		[DEVICE_FAMILY]: "string",
		[DEVICE_FREE_MEMORY]: "integer",
		[DEVICE_FREE_STORAGE]: "integer",
		[DEVICE_ID]: "string",
		[DEVICE_LOCALE]: "string",
		[DEVICE_LOW_MEMORY]: "boolean",
		[DEVICE_LOW_POWER_MODE]: "boolean",
		[DEVICE_MANUFACTURER]: "string",
		[DEVICE_MEMORY_ESTIMATED_CAPACITY]: "integer",
		[DEVICE_MEMORY_SIZE]: "integer",
		[DEVICE_MODEL]: "string",
		[DEVICE_MODEL_ID]: "string",
		[DEVICE_NAME]: "string",
		[DEVICE_ONLINE]: "boolean",
		[DEVICE_ORIENTATION]: "string",
		[DEVICE_PROCESSOR_COUNT]: "integer",
		[DEVICE_PROCESSOR_FREQUENCY]: "double",
		[DEVICE_SCREEN_DENSITY]: "double",
		[DEVICE_SCREEN_DPI]: "integer",
		[DEVICE_SCREEN_HEIGHT_PIXELS]: "integer",
		[DEVICE_SCREEN_WIDTH_PIXELS]: "integer",
		[DEVICE_SIMULATOR]: "boolean",
		[DEVICE_STORAGE_SIZE]: "integer",
		[DEVICE_THERMAL_STATE]: "string",
		[DEVICE_TIMEZONE]: "string",
		[DEVICE_USABLE_MEMORY]: "integer",
		[EFFECTIVECONNECTIONTYPE]: "string",
		[ENVIRONMENT]: "string",
		[ERROR_TYPE]: "string",
		[EVENT_ID]: "integer",
		[EVENT_NAME]: "string",
		[EXCEPTION_ESCAPED]: "boolean",
		[EXCEPTION_MESSAGE]: "string",
		[EXCEPTION_STACKTRACE]: "string",
		[EXCEPTION_TYPE]: "string",
		[FAAS_COLDSTART]: "boolean",
		[FAAS_CRON]: "string",
		[FAAS_DURATION_IN_MS]: "integer",
		[FAAS_ENTRY_POINT]: "string",
		[FAAS_IDENTITY]: "string",
		[FAAS_INVOCATION_ID]: "string",
		[FAAS_NAME]: "string",
		[FAAS_TIME]: "string",
		[FAAS_TRIGGER]: "string",
		[FAAS_VERSION]: "string",
		[FCP]: "double",
		[FLAG_EVALUATION_KEY]: "boolean",
		[FP]: "double",
		[FRAMES_DELAY]: "integer",
		[FRAMES_FROZEN]: "integer",
		[FRAMES_FROZEN_RATE]: "double",
		[FRAMES_SLOW]: "integer",
		[FRAMES_SLOW_RATE]: "double",
		[FRAMES_TOTAL]: "integer",
		[FS_ERROR]: "string",
		[GCP_FUNCTION_CONTEXT_EVENT_ID]: "string",
		[GCP_FUNCTION_CONTEXT_EVENT_TYPE]: "string",
		[GCP_FUNCTION_CONTEXT_ID]: "string",
		[GCP_FUNCTION_CONTEXT_RESOURCE]: "string",
		[GCP_FUNCTION_CONTEXT_SOURCE]: "string",
		[GCP_FUNCTION_CONTEXT_SPECVERSION]: "string",
		[GCP_FUNCTION_CONTEXT_TIME]: "string",
		[GCP_FUNCTION_CONTEXT_TIMESTAMP]: "string",
		[GCP_FUNCTION_CONTEXT_TYPE]: "string",
		[GCP_PROJECT_ID]: "string",
		[GEN_AI_AGENT_NAME]: "string",
		[GEN_AI_CONTEXT_UTILIZATION]: "double",
		[GEN_AI_CONTEXT_WINDOW_SIZE]: "integer",
		[GEN_AI_CONVERSATION_ID]: "string",
		[GEN_AI_COST_INPUT_TOKENS]: "double",
		[GEN_AI_COST_OUTPUT_TOKENS]: "double",
		[GEN_AI_COST_TOTAL_TOKENS]: "double",
		[GEN_AI_EMBEDDINGS_INPUT]: "string",
		[GEN_AI_FUNCTION_ID]: "string",
		[GEN_AI_INPUT_MESSAGES]: "string",
		[GEN_AI_OPERATION_NAME]: "string",
		[GEN_AI_OPERATION_TYPE]: "string",
		[GEN_AI_OUTPUT_MESSAGES]: "string",
		[GEN_AI_PIPELINE_NAME]: "string",
		[GEN_AI_PROMPT]: "string",
		[GEN_AI_PROMPT_NAME]: "string",
		[GEN_AI_PROVIDER_NAME]: "string",
		[GEN_AI_REQUEST_AVAILABLE_TOOLS]: "string",
		[GEN_AI_REQUEST_FREQUENCY_PENALTY]: "double",
		[GEN_AI_REQUEST_MAX_TOKENS]: "integer",
		[GEN_AI_REQUEST_MESSAGES]: "string",
		[GEN_AI_REQUEST_MODEL]: "string",
		[GEN_AI_REQUEST_PRESENCE_PENALTY]: "double",
		[GEN_AI_REQUEST_SEED]: "string",
		[GEN_AI_REQUEST_TEMPERATURE]: "double",
		[GEN_AI_REQUEST_TOP_K]: "integer",
		[GEN_AI_REQUEST_TOP_P]: "double",
		[GEN_AI_RESPONSE_FINISH_REASONS]: "string",
		[GEN_AI_RESPONSE_ID]: "string",
		[GEN_AI_RESPONSE_MODEL]: "string",
		[GEN_AI_RESPONSE_STREAMING]: "boolean",
		[GEN_AI_RESPONSE_TEXT]: "string",
		[GEN_AI_RESPONSE_TIME_TO_FIRST_CHUNK]: "double",
		[GEN_AI_RESPONSE_TIME_TO_FIRST_TOKEN]: "double",
		[GEN_AI_RESPONSE_TOKENS_PER_SECOND]: "double",
		[GEN_AI_RESPONSE_TOOL_CALLS]: "string",
		[GEN_AI_SYSTEM]: "string",
		[GEN_AI_SYSTEM_INSTRUCTIONS]: "string",
		[GEN_AI_SYSTEM_MESSAGE]: "string",
		[GEN_AI_TOOL_CALL_ARGUMENTS]: "string",
		[GEN_AI_TOOL_CALL_RESULT]: "string",
		[GEN_AI_TOOL_DEFINITIONS]: "string",
		[GEN_AI_TOOL_DESCRIPTION]: "string",
		[GEN_AI_TOOL_INPUT]: "string",
		[GEN_AI_TOOL_MESSAGE]: "string",
		[GEN_AI_TOOL_NAME]: "string",
		[GEN_AI_TOOL_OUTPUT]: "string",
		[GEN_AI_TOOL_TYPE]: "string",
		[GEN_AI_USAGE_CACHE_CREATION_INPUT_TOKENS]: "integer",
		[GEN_AI_USAGE_CACHE_READ_INPUT_TOKENS]: "integer",
		[GEN_AI_USAGE_COMPLETION_TOKENS]: "integer",
		[GEN_AI_USAGE_INPUT_TOKENS]: "integer",
		[GEN_AI_USAGE_INPUT_TOKENS_CACHED]: "integer",
		[GEN_AI_USAGE_INPUT_TOKENS_CACHE_WRITE]: "integer",
		[GEN_AI_USAGE_OUTPUT_TOKENS]: "integer",
		[GEN_AI_USAGE_OUTPUT_TOKENS_REASONING]: "integer",
		[GEN_AI_USAGE_PROMPT_TOKENS]: "integer",
		[GEN_AI_USAGE_REASONING_OUTPUT_TOKENS]: "integer",
		[GEN_AI_USAGE_TOTAL_TOKENS]: "integer",
		[GRAPHQL_DOCUMENT]: "string",
		[GRAPHQL_OPERATION_NAME]: "string",
		[GRAPHQL_OPERATION_TYPE]: "string",
		[HARDWARECONCURRENCY]: "string",
		[HTTP_CLIENT_IP]: "string",
		[HTTP_DECODED_RESPONSE_CONTENT_LENGTH]: "integer",
		[HTTP_FLAVOR]: "string",
		[HTTP_FRAGMENT]: "string",
		[HTTP_HOST]: "string",
		[HTTP_METHOD]: "string",
		[HTTP_QUERY]: "string",
		[HTTP_REQUEST_BODY_DATA]: "string",
		[HTTP_REQUEST_CONNECTION_END]: "double",
		[HTTP_REQUEST_CONNECT_START]: "double",
		[HTTP_REQUEST_DOMAIN_LOOKUP_END]: "double",
		[HTTP_REQUEST_DOMAIN_LOOKUP_START]: "double",
		[HTTP_REQUEST_FETCH_START]: "double",
		[HTTP_REQUEST_HEADER_KEY]: "string[]",
		[HTTP_REQUEST_METHOD]: "string",
		[_HTTP_REQUEST_METHOD]: "string",
		[HTTP_REQUEST_REDIRECT_END]: "double",
		[HTTP_REQUEST_REDIRECT_START]: "double",
		[HTTP_REQUEST_REQUEST_START]: "double",
		[HTTP_REQUEST_RESEND_COUNT]: "integer",
		[HTTP_REQUEST_RESPONSE_END]: "double",
		[HTTP_REQUEST_RESPONSE_START]: "double",
		[HTTP_REQUEST_SECURE_CONNECTION_START]: "double",
		[HTTP_REQUEST_TIME_TO_FIRST_BYTE]: "double",
		[HTTP_REQUEST_WORKER_START]: "double",
		[HTTP_RESPONSE_BODY_SIZE]: "integer",
		[HTTP_RESPONSE_CONTENT_LENGTH]: "integer",
		[HTTP_RESPONSE_HEADER_CONTENT_LENGTH]: "string",
		[HTTP_RESPONSE_HEADER_KEY]: "string[]",
		[HTTP_RESPONSE_SIZE]: "integer",
		[HTTP_RESPONSE_STATUS_CODE]: "integer",
		[HTTP_RESPONSE_TRANSFER_SIZE]: "integer",
		[HTTP_ROUTE]: "string",
		[HTTP_SCHEME]: "string",
		[HTTP_SERVER_NAME]: "string",
		[HTTP_SERVER_REQUEST_TIME_IN_QUEUE]: "double",
		[HTTP_STATUS_CODE]: "integer",
		[HTTP_TARGET]: "string",
		[HTTP_URL]: "string",
		[HTTP_USER_AGENT]: "string",
		[ID]: "string",
		[INP]: "double",
		[JSONRPC_PROTOCOL_VERSION]: "string",
		[JSONRPC_REQUEST_ID]: "string",
		[JVM_GC_ACTION]: "string",
		[JVM_GC_NAME]: "string",
		[JVM_MEMORY_POOL_NAME]: "string",
		[JVM_MEMORY_TYPE]: "string",
		[JVM_THREAD_DAEMON]: "boolean",
		[JVM_THREAD_STATE]: "string",
		[LCP]: "double",
		[LCP_ELEMENT]: "string",
		[LCP_ID]: "string",
		[LCP_LOADTIME]: "integer",
		[LCP_RENDERTIME]: "integer",
		[LCP_SIZE]: "integer",
		[LCP_URL]: "string",
		[LOGGER_NAME]: "string",
		[MCP_CANCELLED_REASON]: "string",
		[MCP_CANCELLED_REQUEST_ID]: "string",
		[MCP_CLIENT_NAME]: "string",
		[MCP_CLIENT_TITLE]: "string",
		[MCP_CLIENT_VERSION]: "string",
		[MCP_LIFECYCLE_PHASE]: "string",
		[MCP_LOGGING_DATA_TYPE]: "string",
		[MCP_LOGGING_LEVEL]: "string",
		[MCP_LOGGING_LOGGER]: "string",
		[MCP_LOGGING_MESSAGE]: "string",
		[MCP_METHOD_NAME]: "string",
		[MCP_PROGRESS_CURRENT]: "integer",
		[MCP_PROGRESS_MESSAGE]: "string",
		[MCP_PROGRESS_PERCENTAGE]: "double",
		[MCP_PROGRESS_TOKEN]: "string",
		[MCP_PROGRESS_TOTAL]: "integer",
		[MCP_PROMPT_NAME]: "string",
		[MCP_PROMPT_RESULT_DESCRIPTION]: "string",
		[MCP_PROMPT_RESULT_MESSAGE_CONTENT]: "string",
		[MCP_PROMPT_RESULT_MESSAGE_COUNT]: "integer",
		[MCP_PROMPT_RESULT_MESSAGE_ROLE]: "string",
		[MCP_PROTOCOL_READY]: "integer",
		[MCP_PROTOCOL_VERSION]: "string",
		[MCP_REQUEST_ARGUMENT_KEY]: "string",
		[MCP_REQUEST_ARGUMENT_NAME]: "string",
		[MCP_REQUEST_ARGUMENT_URI]: "string",
		[MCP_REQUEST_ID]: "string",
		[MCP_RESOURCE_PROTOCOL]: "string",
		[MCP_RESOURCE_URI]: "string",
		[MCP_SERVER_NAME]: "string",
		[MCP_SERVER_TITLE]: "string",
		[MCP_SERVER_VERSION]: "string",
		[MCP_SESSION_ID]: "string",
		[MCP_TOOL_NAME]: "string",
		[MCP_TOOL_RESULT_CONTENT]: "string",
		[MCP_TOOL_RESULT_CONTENT_COUNT]: "integer",
		[MCP_TOOL_RESULT_IS_ERROR]: "boolean",
		[MCP_TRANSPORT]: "string",
		[MDC_KEY]: "string",
		[MESSAGING_BATCH_MESSAGE_COUNT]: "integer",
		[MESSAGING_DESTINATION_CONNECTION]: "string",
		[MESSAGING_DESTINATION_NAME]: "string",
		[MESSAGING_MESSAGE_BODY_SIZE]: "integer",
		[MESSAGING_MESSAGE_ENVELOPE_SIZE]: "integer",
		[MESSAGING_MESSAGE_ID]: "string",
		[MESSAGING_MESSAGE_RECEIVE_LATENCY]: "integer",
		[MESSAGING_MESSAGE_RETRY_COUNT]: "integer",
		[MESSAGING_OPERATION_NAME]: "string",
		[MESSAGING_OPERATION_TYPE]: "string",
		[MESSAGING_SYSTEM]: "string",
		[METHOD]: "string",
		[MIDDLEWARE_NAME]: "string",
		[NAVIGATION_TYPE]: "string",
		[NEL_ELAPSED_TIME]: "integer",
		[NEL_PHASE]: "string",
		[NEL_REFERRER]: "string",
		[NEL_SAMPLING_FUNCTION]: "double",
		[NEL_TYPE]: "string",
		[NETWORK_CONNECTION_EFFECTIVE_TYPE]: "string",
		[NETWORK_CONNECTION_RTT]: "integer",
		[NETWORK_CONNECTION_TYPE]: "string",
		[NETWORK_LOCAL_ADDRESS]: "string",
		[NETWORK_LOCAL_PORT]: "integer",
		[NETWORK_PEER_ADDRESS]: "string",
		[NETWORK_PEER_PORT]: "integer",
		[NETWORK_PROTOCOL_NAME]: "string",
		[NETWORK_PROTOCOL_VERSION]: "string",
		[NETWORK_TRANSPORT]: "string",
		[NETWORK_TYPE]: "string",
		[NET_HOST_IP]: "string",
		[NET_HOST_NAME]: "string",
		[NET_HOST_PORT]: "integer",
		[NET_PEER_IP]: "string",
		[NET_PEER_NAME]: "string",
		[NET_PEER_PORT]: "integer",
		[NET_PROTOCOL_NAME]: "string",
		[NET_PROTOCOL_VERSION]: "string",
		[NET_SOCK_FAMILY]: "string",
		[NET_SOCK_HOST_ADDR]: "string",
		[NET_SOCK_HOST_PORT]: "integer",
		[NET_SOCK_PEER_ADDR]: "string",
		[NET_SOCK_PEER_NAME]: "string",
		[NET_SOCK_PEER_PORT]: "integer",
		[NET_TRANSPORT]: "string",
		[OS_BUILD]: "string",
		[OS_BUILD_ID]: "string",
		[OS_DESCRIPTION]: "string",
		[OS_KERNEL_VERSION]: "string",
		[OS_NAME]: "string",
		[OS_RAW_DESCRIPTION]: "string",
		[OS_ROOTED]: "boolean",
		[OS_THEME]: "string",
		[OS_TYPE]: "string",
		[OS_VERSION]: "string",
		[OTEL_SCOPE_NAME]: "string",
		[OTEL_SCOPE_VERSION]: "string",
		[OTEL_STATUS_CODE]: "string",
		[OTEL_STATUS_DESCRIPTION]: "string",
		[PARAMS_KEY]: "string",
		[PERFORMANCE_ACTIVATIONSTART]: "double",
		[PERFORMANCE_TIMEORIGIN]: "double",
		[PREVIOUS_ROUTE]: "string",
		[PROCESS_COMMAND_ARGS]: "string[]",
		[PROCESS_EXECUTABLE_NAME]: "string",
		[PROCESS_PID]: "integer",
		[PROCESS_RUNTIME_DESCRIPTION]: "string",
		[PROCESS_RUNTIME_ENGINE_NAME]: "string",
		[PROCESS_RUNTIME_ENGINE_VERSION]: "string",
		[PROCESS_RUNTIME_NAME]: "string",
		[PROCESS_RUNTIME_VERSION]: "string",
		[QUERY_KEY]: "string",
		[REACT_VERSION]: "string",
		[RELEASE]: "string",
		[REMIX_ACTION_FORM_DATA_KEY]: "string",
		[REPLAY_ID]: "string",
		[RESOURCE_DEPLOYMENT_ENVIRONMENT]: "string",
		[RESOURCE_DEPLOYMENT_ENVIRONMENT_NAME]: "string",
		[RESOURCE_RENDER_BLOCKING_STATUS]: "string",
		[ROUTE]: "string",
		[RPC_GRPC_STATUS_CODE]: "integer",
		[RPC_METHOD]: "string",
		[RPC_RESPONSE_STATUS_CODE]: "string",
		[RPC_SERVICE]: "string",
		[RUNTIME_BUILD]: "string",
		[RUNTIME_NAME]: "string",
		[RUNTIME_RAW_DESCRIPTION]: "string",
		[RUNTIME_VERSION]: "string",
		[SCORE_KEY]: "double",
		[SCORE_RATIO_KEY]: "double",
		[SCORE_TOTAL]: "double",
		[SCORE_WEIGHT_KEY]: "double",
		[SENTRY_ACTION]: "string",
		[SENTRY_BROWSER_NAME]: "string",
		[SENTRY_BROWSER_VERSION]: "string",
		[SENTRY_CANCELLATION_REASON]: "string",
		[SENTRY_CATEGORY]: "string",
		[SENTRY_CLIENT_SAMPLE_RATE]: "double",
		[SENTRY_DESCRIPTION]: "string",
		[SENTRY_DIST]: "string",
		[SENTRY_DOMAIN]: "string",
		[SENTRY_DSC_ENVIRONMENT]: "string",
		[SENTRY_DSC_PROJECT_ID]: "string",
		[SENTRY_DSC_PUBLIC_KEY]: "string",
		[SENTRY_DSC_RELEASE]: "string",
		[SENTRY_DSC_SAMPLED]: "boolean",
		[SENTRY_DSC_SAMPLE_RATE]: "string",
		[SENTRY_DSC_TRACE_ID]: "string",
		[SENTRY_DSC_TRANSACTION]: "string",
		[SENTRY_ENVIRONMENT]: "string",
		[SENTRY_EXCLUSIVE_TIME]: "double",
		[SENTRY_GRAPHQL_OPERATION]: "string",
		[SENTRY_GROUP]: "string",
		[SENTRY_HTTP_PREFETCH]: "boolean",
		[SENTRY_IDLE_SPAN_FINISH_REASON]: "string",
		[SENTRY_IS_REMOTE]: "boolean",
		[SENTRY_KIND]: "string",
		[SENTRY_MAIN_THREAD]: "boolean",
		[SENTRY_MESSAGE_PARAMETER_KEY]: "string",
		[SENTRY_MESSAGE_TEMPLATE]: "string",
		[SENTRY_MOBILE]: "boolean",
		[SENTRY_MODULE_KEY]: "string",
		[SENTRY_NEXTJS_SSR_FUNCTION_ROUTE]: "string",
		[SENTRY_NEXTJS_SSR_FUNCTION_TYPE]: "string",
		[SENTRY_NORMALIZED_DB_QUERY]: "string",
		[SENTRY_NORMALIZED_DB_QUERY_HASH]: "string",
		[SENTRY_NORMALIZED_DESCRIPTION]: "string",
		[SENTRY_OBSERVED_TIMESTAMP_NANOS]: "string",
		[SENTRY_OP]: "string",
		[SENTRY_ORIGIN]: "string",
		[SENTRY_PLATFORM]: "string",
		[SENTRY_PROFILER_ID]: "string",
		[SENTRY_PROFILE_ID]: "string",
		[SENTRY_RELEASE]: "string",
		[SENTRY_REPLAY_ID]: "string",
		[SENTRY_REPLAY_IS_BUFFERING]: "boolean",
		[SENTRY_REPORT_EVENT]: "string",
		[SENTRY_SDK_INTEGRATIONS]: "string[]",
		[SENTRY_SDK_NAME]: "string",
		[SENTRY_SDK_VERSION]: "string",
		[SENTRY_SEGMENT_ID]: "string",
		[_SENTRY_SEGMENT_ID]: "string",
		[SENTRY_SEGMENT_NAME]: "string",
		[SENTRY_SERVER_SAMPLE_RATE]: "double",
		[SENTRY_SOURCE]: "string",
		[SENTRY_SPAN_SOURCE]: "string",
		[SENTRY_STATUS_CODE]: "integer",
		[SENTRY_STATUS_MESSAGE]: "string",
		[SENTRY_TIMESTAMP_SEQUENCE]: "integer",
		[SENTRY_TRACE_PARENT_SPAN_ID]: "string",
		[SENTRY_TRANSACTION]: "string",
		[SENTRY_USER_EMAIL]: "string",
		[SENTRY_USER_GEO_CITY]: "string",
		[SENTRY_USER_GEO_COUNTRY_CODE]: "string",
		[SENTRY_USER_GEO_REGION]: "string",
		[SENTRY_USER_GEO_SUBDIVISION]: "string",
		[SENTRY_USER_ID]: "string",
		[SENTRY_USER_IP]: "string",
		[SENTRY_USER_USERNAME]: "string",
		[SERVER_ADDRESS]: "string",
		[SERVER_PORT]: "integer",
		[SERVICE_NAME]: "string",
		[SERVICE_VERSION]: "string",
		[SESSION_ID]: "string",
		[STALL_PERCENTAGE]: "double",
		[STALL_TOTAL_TIME]: "double",
		[STATE_TYPE]: "string",
		[THREAD_ID]: "integer",
		[THREAD_NAME]: "string",
		[TIMBER_TAG]: "string",
		[TIME_TO_FULL_DISPLAY]: "double",
		[TIME_TO_INITIAL_DISPLAY]: "double",
		[TRANSACTION]: "string",
		[TRPC_PROCEDURE_PATH]: "string",
		[TRPC_PROCEDURE_TYPE]: "string",
		[TTFB]: "double",
		[TTFB_REQUESTTIME]: "double",
		[TYPE]: "string",
		[UI_COMPONENT_NAME]: "string",
		[UI_CONTRIBUTES_TO_TTFD]: "boolean",
		[UI_CONTRIBUTES_TO_TTID]: "boolean",
		[UI_ELEMENT_HEIGHT]: "integer",
		[UI_ELEMENT_ID]: "string",
		[UI_ELEMENT_IDENTIFIER]: "string",
		[UI_ELEMENT_LOAD_TIME]: "double",
		[UI_ELEMENT_PAINT_TYPE]: "string",
		[UI_ELEMENT_RENDER_TIME]: "double",
		[UI_ELEMENT_TYPE]: "string",
		[UI_ELEMENT_URL]: "string",
		[UI_ELEMENT_WIDTH]: "integer",
		[URL]: "string",
		[URL_DOMAIN]: "string",
		[URL_FRAGMENT]: "string",
		[URL_FULL]: "string",
		[URL_PATH]: "string",
		[URL_PATH_PARAMETER_KEY]: "string",
		[URL_PORT]: "integer",
		[URL_QUERY]: "string",
		[URL_SCHEME]: "string",
		[URL_TEMPLATE]: "string",
		[USER_AGENT_ORIGINAL]: "string",
		[USER_EMAIL]: "string",
		[USER_FULL_NAME]: "string",
		[USER_GEO_CITY]: "string",
		[USER_GEO_COUNTRY_CODE]: "string",
		[USER_GEO_REGION]: "string",
		[USER_GEO_SUBDIVISION]: "string",
		[USER_HASH]: "string",
		[USER_ID]: "string",
		[USER_IP_ADDRESS]: "string",
		[USER_NAME]: "string",
		[USER_ROLES]: "string[]",
		[VERCEL_BRANCH]: "string",
		[VERCEL_BUILD_ID]: "string",
		[VERCEL_DEPLOYMENT_ID]: "string",
		[VERCEL_DESTINATION]: "string",
		[VERCEL_EDGE_TYPE]: "string",
		[VERCEL_ENTRYPOINT]: "string",
		[VERCEL_EXECUTION_REGION]: "string",
		[VERCEL_ID]: "string",
		[VERCEL_JA3_DIGEST]: "string",
		[VERCEL_JA4_DIGEST]: "string",
		[VERCEL_LOG_TYPE]: "string",
		[VERCEL_PATH]: "string",
		[VERCEL_PROJECT_ID]: "string",
		[VERCEL_PROJECT_NAME]: "string",
		[VERCEL_PROXY_CACHE_ID]: "string",
		[VERCEL_PROXY_CLIENT_IP]: "string",
		[VERCEL_PROXY_HOST]: "string",
		[VERCEL_PROXY_LAMBDA_REGION]: "string",
		[VERCEL_PROXY_METHOD]: "string",
		[VERCEL_PROXY_PATH]: "string",
		[VERCEL_PROXY_PATH_TYPE]: "string",
		[VERCEL_PROXY_PATH_TYPE_VARIANT]: "string",
		[VERCEL_PROXY_REFERER]: "string",
		[VERCEL_PROXY_REGION]: "string",
		[VERCEL_PROXY_RESPONSE_BYTE_SIZE]: "integer",
		[VERCEL_PROXY_SCHEME]: "string",
		[VERCEL_PROXY_STATUS_CODE]: "integer",
		[VERCEL_PROXY_TIMESTAMP]: "integer",
		[VERCEL_PROXY_USER_AGENT]: "string[]",
		[VERCEL_PROXY_VERCEL_CACHE]: "string",
		[VERCEL_PROXY_VERCEL_ID]: "string",
		[VERCEL_PROXY_WAF_ACTION]: "string",
		[VERCEL_PROXY_WAF_RULE_ID]: "string",
		[VERCEL_REQUEST_ID]: "string",
		[VERCEL_SOURCE]: "string",
		[VERCEL_STATUS_CODE]: "integer"
	}, ATTRIBUTE_METADATA = {
		[AI_CITATIONS]: {
			brief: "References or sources cited by the AI model in its response.",
			type: "string[]",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			example: ["Citation 1", "Citation 2"],
			deprecation: {},
			changelog: [{
				version: "0.5.0",
				prs: [264]
			}, {
				version: "0.1.0",
				prs: [55]
			}]
		},
		[AI_COMPLETION_TOKENS_USED]: {
			brief: "The number of tokens used to respond to the message.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 10,
			deprecation: { replacement: "gen_ai.usage.output_tokens" },
			aliases: [GEN_AI_USAGE_OUTPUT_TOKENS, GEN_AI_USAGE_COMPLETION_TOKENS],
			changelog: [
				{
					version: "0.4.0",
					prs: [228]
				},
				{
					version: "0.1.0",
					prs: [57, 61]
				},
				{ version: "0.0.0" }
			]
		},
		[AI_DOCUMENTS]: {
			brief: "Documents or content chunks used as context for the AI model.",
			type: "string[]",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			example: ["document1.txt", "document2.pdf"],
			deprecation: {},
			changelog: [{
				version: "0.5.0",
				prs: [264]
			}, {
				version: "0.1.0",
				prs: [55]
			}]
		},
		[AI_FINISH_REASON]: {
			brief: "The reason why the model stopped generating.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "COMPLETE",
			deprecation: { replacement: "gen_ai.response.finish_reasons" },
			aliases: [GEN_AI_RESPONSE_FINISH_REASONS],
			changelog: [{
				version: "0.1.0",
				prs: [
					55,
					57,
					61,
					108,
					127
				]
			}]
		},
		[AI_FREQUENCY_PENALTY]: {
			brief: "Used to reduce repetitiveness of generated tokens. The higher the value, the stronger a penalty is applied to previously present tokens, proportional to how many times they have already appeared in the prompt or prior generation.",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: .5,
			deprecation: { replacement: "gen_ai.request.frequency_penalty" },
			aliases: [GEN_AI_REQUEST_FREQUENCY_PENALTY],
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, {
				version: "0.1.0",
				prs: [
					55,
					57,
					61,
					108
				]
			}]
		},
		[AI_FUNCTION_CALL]: {
			brief: "For an AI model call, the function that was called. This is deprecated for OpenAI, and replaced by tool_calls",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			example: "function_name",
			deprecation: { replacement: "gen_ai.tool.name" },
			aliases: [GEN_AI_TOOL_NAME, MCP_TOOL_NAME],
			changelog: [{
				version: "0.1.0",
				prs: [
					55,
					57,
					61,
					108
				]
			}]
		},
		[AI_GENERATION_ID]: {
			brief: "Unique identifier for the completion.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "gen_123abc",
			deprecation: { replacement: "gen_ai.response.id" },
			aliases: [GEN_AI_RESPONSE_ID],
			changelog: [{
				version: "0.1.0",
				prs: [
					55,
					57,
					61,
					108,
					127
				]
			}]
		},
		[AI_INPUT_MESSAGES]: {
			brief: "The input messages sent to the model",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "[{\"role\": \"user\", \"message\": \"hello\"}]",
			deprecation: { replacement: "gen_ai.input.messages" },
			aliases: [GEN_AI_REQUEST_MESSAGES],
			changelog: [{
				version: "0.1.0",
				prs: [65, 119]
			}, { version: "0.0.0" }]
		},
		[AI_IS_SEARCH_REQUIRED]: {
			brief: "Boolean indicating if the model needs to perform a search.",
			type: "boolean",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: !1,
			deprecation: {},
			changelog: [{
				version: "0.5.0",
				prs: [264]
			}, {
				version: "0.1.0",
				prs: [55]
			}]
		},
		[AI_METADATA]: {
			brief: "Extra metadata passed to an AI pipeline step.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "{\"user_id\": 123, \"session_id\": \"abc123\"}",
			deprecation: {},
			changelog: [{
				version: "0.5.0",
				prs: [264]
			}, {
				version: "0.1.0",
				prs: [55, 127]
			}]
		},
		[AI_MODEL_ID]: {
			brief: "The vendor-specific ID of the model used.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "gpt-4",
			deprecation: { replacement: "gen_ai.response.model" },
			aliases: [GEN_AI_RESPONSE_MODEL],
			changelog: [{
				version: "0.1.0",
				prs: [
					57,
					61,
					127
				]
			}, { version: "0.0.0" }]
		},
		[AI_MODEL_PROVIDER]: {
			brief: "The provider of the model.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "openai",
			deprecation: { replacement: "gen_ai.provider.name" },
			aliases: [GEN_AI_PROVIDER_NAME, GEN_AI_SYSTEM],
			changelog: [{
				version: "0.4.0",
				prs: [253]
			}, {
				version: "0.1.0",
				prs: [
					57,
					61,
					108,
					127
				]
			}]
		},
		[AI_PIPELINE_NAME]: {
			brief: "The name of the AI pipeline.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "Autofix Pipeline",
			deprecation: { replacement: "gen_ai.pipeline.name" },
			aliases: [GEN_AI_PIPELINE_NAME],
			changelog: [{
				version: "0.1.0",
				prs: [
					53,
					76,
					108,
					127
				]
			}]
		},
		[AI_PREAMBLE]: {
			brief: "For an AI model call, the preamble parameter. Preambles are a part of the prompt used to adjust the model's overall behavior and conversation style.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			example: "You are now a clown.",
			deprecation: { replacement: "gen_ai.system_instructions" },
			aliases: [GEN_AI_SYSTEM_INSTRUCTIONS],
			changelog: [{
				version: "0.5.0",
				prs: [264]
			}, {
				version: "0.1.0",
				prs: [55]
			}]
		},
		[AI_PRESENCE_PENALTY]: {
			brief: "Used to reduce repetitiveness of generated tokens. Similar to frequency_penalty, except that this penalty is applied equally to all tokens that have already appeared, regardless of their exact frequencies.",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: .5,
			deprecation: { replacement: "gen_ai.request.presence_penalty" },
			aliases: [GEN_AI_REQUEST_PRESENCE_PENALTY],
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, {
				version: "0.1.0",
				prs: [
					55,
					57,
					61,
					108
				]
			}]
		},
		[AI_PROMPT_TOKENS_USED]: {
			brief: "The number of tokens used to process just the prompt.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 20,
			deprecation: { replacement: "gen_ai.usage.input_tokens" },
			aliases: [GEN_AI_USAGE_PROMPT_TOKENS, GEN_AI_USAGE_INPUT_TOKENS],
			changelog: [
				{
					version: "0.4.0",
					prs: [228]
				},
				{
					version: "0.1.0",
					prs: [57, 61]
				},
				{ version: "0.0.0" }
			]
		},
		[AI_RAW_PROMPTING]: {
			brief: "When enabled, the user’s prompt will be sent to the model without any pre-processing.",
			type: "boolean",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: !0,
			deprecation: {},
			changelog: [{
				version: "0.5.0",
				prs: [264]
			}, {
				version: "0.1.0",
				prs: [55]
			}]
		},
		[AI_RESPONSES]: {
			brief: "The response messages sent back by the AI model.",
			type: "string[]",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: ["hello", "world"],
			deprecation: { replacement: "gen_ai.output.messages" },
			changelog: [{
				version: "0.1.0",
				prs: [65, 127]
			}, { version: "0.0.0" }]
		},
		[AI_RESPONSE_FORMAT]: {
			brief: "For an AI model call, the format of the response",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "json_object",
			deprecation: {},
			changelog: [{
				version: "0.5.0",
				prs: [264]
			}, {
				version: "0.1.0",
				prs: [55, 127]
			}]
		},
		[AI_SEARCH_QUERIES]: {
			brief: "Queries used to search for relevant context or documents.",
			type: "string[]",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			example: ["climate change effects", "renewable energy"],
			deprecation: {},
			changelog: [{
				version: "0.5.0",
				prs: [264]
			}, {
				version: "0.1.0",
				prs: [55]
			}]
		},
		[AI_SEARCH_RESULTS]: {
			brief: "Results returned from search queries for context.",
			type: "string[]",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			example: ["search_result_1, search_result_2"],
			deprecation: {},
			changelog: [{
				version: "0.5.0",
				prs: [264]
			}, {
				version: "0.1.0",
				prs: [55]
			}]
		},
		[AI_SEED]: {
			brief: "The seed, ideally models given the same seed and same other parameters will produce the exact same output.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "1234567890",
			deprecation: { replacement: "gen_ai.request.seed" },
			aliases: [GEN_AI_REQUEST_SEED],
			changelog: [{
				version: "0.1.0",
				prs: [
					55,
					57,
					61,
					108,
					127
				]
			}]
		},
		[AI_STREAMING]: {
			brief: "Whether the request was streamed back.",
			type: "boolean",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: !0,
			deprecation: { replacement: "gen_ai.response.streaming" },
			aliases: [GEN_AI_RESPONSE_STREAMING],
			changelog: [{
				version: "0.1.0",
				prs: [76, 108]
			}, { version: "0.0.0" }]
		},
		[AI_TAGS]: {
			brief: "Tags that describe an AI pipeline step.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "{\"executed_function\": \"add_integers\"}",
			deprecation: {},
			changelog: [{
				version: "0.5.0",
				prs: [264]
			}, {
				version: "0.1.0",
				prs: [55, 127]
			}]
		},
		[AI_TEMPERATURE]: {
			brief: "For an AI model call, the temperature parameter. Temperature essentially means how random the output will be.",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: .1,
			deprecation: { replacement: "gen_ai.request.temperature" },
			aliases: [GEN_AI_REQUEST_TEMPERATURE],
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, {
				version: "0.1.0",
				prs: [
					55,
					57,
					61,
					108
				]
			}]
		},
		[AI_TEXTS]: {
			brief: "Raw text inputs provided to the model.",
			type: "string[]",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			example: ["Hello, how are you?", "What is the capital of France?"],
			deprecation: { replacement: "gen_ai.input.messages" },
			aliases: [GEN_AI_INPUT_MESSAGES],
			changelog: [{
				version: "0.5.0",
				prs: [264]
			}, {
				version: "0.1.0",
				prs: [55]
			}]
		},
		[AI_TOOLS]: {
			brief: "For an AI model call, the functions that are available",
			type: "string[]",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: ["function_1", "function_2"],
			deprecation: { replacement: "gen_ai.tool.definitions" },
			changelog: [{
				version: "0.1.0",
				prs: [
					55,
					65,
					127
				]
			}]
		},
		[AI_TOOL_CALLS]: {
			brief: "For an AI model call, the tool calls that were made.",
			type: "string[]",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			example: ["tool_call_1", "tool_call_2"],
			deprecation: { replacement: "gen_ai.output.messages" },
			changelog: [{
				version: "0.1.0",
				prs: [55, 65]
			}]
		},
		[AI_TOP_K]: {
			brief: "Limits the model to only consider the K most likely next tokens, where K is an integer (e.g., top_k=20 means only the 20 highest probability tokens are considered).",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 35,
			deprecation: { replacement: "gen_ai.request.top_k" },
			aliases: [GEN_AI_REQUEST_TOP_K],
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, {
				version: "0.1.0",
				prs: [
					55,
					57,
					61,
					108
				]
			}]
		},
		[AI_TOP_P]: {
			brief: "Limits the model to only consider tokens whose cumulative probability mass adds up to p, where p is a float between 0 and 1 (e.g., top_p=0.7 means only tokens that sum up to 70% of the probability mass are considered).",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: .7,
			deprecation: { replacement: "gen_ai.request.top_p" },
			aliases: [GEN_AI_REQUEST_TOP_P],
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, {
				version: "0.1.0",
				prs: [
					55,
					57,
					61,
					108
				]
			}]
		},
		[AI_TOTAL_COST]: {
			brief: "The total cost for the tokens used.",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 12.34,
			deprecation: { replacement: "gen_ai.cost.total_tokens" },
			aliases: [GEN_AI_COST_TOTAL_TOKENS],
			changelog: [
				{
					version: "0.5.0",
					prs: [264]
				},
				{
					version: "0.4.0",
					prs: [228]
				},
				{
					version: "0.1.0",
					prs: [53]
				}
			]
		},
		[AI_TOTAL_TOKENS_USED]: {
			brief: "The total number of tokens used to process the prompt.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 30,
			deprecation: { replacement: "gen_ai.usage.total_tokens" },
			aliases: [GEN_AI_USAGE_TOTAL_TOKENS],
			changelog: [
				{
					version: "0.4.0",
					prs: [228]
				},
				{
					version: "0.1.0",
					prs: [
						57,
						61,
						108
					]
				},
				{ version: "0.0.0" }
			]
		},
		[AI_WARNINGS]: {
			brief: "Warning messages generated during model execution.",
			type: "string[]",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			example: ["Token limit exceeded"],
			deprecation: {},
			changelog: [{
				version: "0.5.0",
				prs: [264]
			}, {
				version: "0.1.0",
				prs: [55]
			}]
		},
		[ANGULAR_VERSION]: {
			brief: "The version of the Angular framework",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "17.1.0",
			changelog: [{
				version: "0.7.0",
				prs: [367],
				description: "Added angular.version attribute"
			}]
		},
		[APP_APP_BUILD]: {
			brief: "Internal build identifier, as it appears on the platform.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "1",
			deprecation: {
				replacement: "app.build",
				reason: "Deprecated in favor of app.build"
			},
			aliases: [APP_BUILD],
			changelog: [{
				version: "0.5.0",
				prs: [296],
				description: "Added and deprecated app.app_build in favor of app.build"
			}]
		},
		[APP_APP_IDENTIFIER]: {
			brief: "Version-independent application identifier, often a dotted bundle ID.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "com.example.myapp",
			deprecation: {
				replacement: "app.identifier",
				reason: "Deprecated in favor of app.identifier"
			},
			aliases: [APP_IDENTIFIER],
			changelog: [{
				version: "0.5.0",
				prs: [296],
				description: "Added and deprecated app.app_identifier in favor of app.identifier"
			}]
		},
		[APP_APP_NAME]: {
			brief: "Human readable application name, as it appears on the platform.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "My App",
			deprecation: {
				replacement: "app.name",
				reason: "Deprecated in favor of app.name"
			},
			aliases: [APP_NAME],
			changelog: [{
				version: "0.5.0",
				prs: [296],
				description: "Added and deprecated app.app_name in favor of app.name"
			}]
		},
		[APP_APP_START_TIME]: {
			brief: "Formatted UTC timestamp when the user started the application.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "2025-01-01T00:00:00.000Z",
			deprecation: {
				replacement: "app.start_time",
				reason: "Deprecated in favor of app.start_time"
			},
			aliases: [APP_START_TIME],
			changelog: [{
				version: "0.5.0",
				prs: [296],
				description: "Added and deprecated app.app_start_time in favor of app.start_time"
			}]
		},
		[APP_APP_VERSION]: {
			brief: "Human readable application version, as it appears on the platform.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "1.0.0",
			deprecation: {
				replacement: "app.version",
				reason: "Deprecated in favor of app.version"
			},
			aliases: [APP_VERSION],
			changelog: [{
				version: "0.5.0",
				prs: [296],
				description: "Added and deprecated app.app_version in favor of app.version"
			}]
		},
		[APP_BUILD]: {
			brief: "Internal build identifier, as it appears on the platform.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "1",
			aliases: [APP_APP_BUILD],
			changelog: [{
				version: "0.5.0",
				prs: [296],
				description: "Added app.build attribute"
			}]
		},
		[APP_IDENTIFIER]: {
			brief: "Version-independent application identifier, often a dotted bundle ID.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "com.example.myapp",
			aliases: [APP_APP_IDENTIFIER],
			changelog: [{
				version: "0.5.0",
				prs: [296],
				description: "Added app.identifier attribute"
			}]
		},
		[APP_IN_FOREGROUND]: {
			brief: "Whether the application is currently in the foreground.",
			type: "boolean",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: !0,
			changelog: [{
				version: "0.5.0",
				prs: [296],
				description: "Added app.in_foreground attribute"
			}]
		},
		[APP_NAME]: {
			brief: "Human readable application name, as it appears on the platform.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "My App",
			aliases: [APP_APP_NAME],
			changelog: [{
				version: "0.5.0",
				prs: [296],
				description: "Added app.name attribute"
			}]
		},
		[APP_START_COLD]: {
			brief: "The duration of a cold app start in milliseconds",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1234.56,
			deprecation: {
				replacement: "app.vitals.start.cold.value",
				reason: "Replaced by app.vitals.start.cold.value to align with the app.vitals.* namespace for mobile performance attributes"
			},
			aliases: [APP_VITALS_START_COLD_VALUE],
			changelog: [{
				version: "0.5.0",
				prs: [323],
				description: "Added and deprecated in favor of app.vitals.start.cold.value"
			}]
		},
		[APP_START_TIME]: {
			brief: "Formatted UTC timestamp when the user started the application.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "2025-01-01T00:00:00.000Z",
			aliases: [APP_APP_START_TIME],
			changelog: [{
				version: "0.5.0",
				prs: [296],
				description: "Added app.start_time attribute"
			}]
		},
		[APP_START_TYPE]: {
			brief: "Mobile app start variant. Either cold or warm.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "cold",
			deprecation: {
				replacement: "app.vitals.start.type",
				reason: "Replaced by app.vitals.start.type to align with the app.vitals.* namespace for mobile performance attributes"
			},
			aliases: [APP_VITALS_START_TYPE],
			changelog: [
				{
					version: "0.5.0",
					prs: [313],
					description: "Deprecated in favor of app.vitals.start.type"
				},
				{
					version: "0.1.0",
					prs: [127]
				},
				{ version: "0.0.0" }
			]
		},
		[APP_START_WARM]: {
			brief: "The duration of a warm app start in milliseconds",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1234.56,
			deprecation: {
				replacement: "app.vitals.start.warm.value",
				reason: "Replaced by app.vitals.start.warm.value to align with the app.vitals.* namespace for mobile performance attributes"
			},
			aliases: [APP_VITALS_START_WARM_VALUE],
			changelog: [{
				version: "0.5.0",
				prs: [323],
				description: "Added and deprecated in favor of app.vitals.start.warm.value"
			}]
		},
		[APP_VERSION]: {
			brief: "Human readable application version, as it appears on the platform.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "1.0.0",
			aliases: [APP_APP_VERSION],
			changelog: [{
				version: "0.5.0",
				prs: [296],
				description: "Added app.version attribute"
			}]
		},
		[APP_VITALS_FRAMES_DELAY_VALUE]: {
			brief: "The sum of all delayed frame durations in seconds during the lifetime of the span. For more information see [frames delay](https://develop.sentry.dev/sdk/performance/frames-delay/).",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 5,
			aliases: [FRAMES_DELAY],
			changelog: [{
				version: "0.5.0",
				prs: [313],
				description: "Added app.vitals.frames.delay.value to replace frames.delay"
			}]
		},
		[APP_VITALS_FRAMES_FROZEN_COUNT]: {
			brief: "The number of frozen frames rendered during the lifetime of the span.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 3,
			aliases: [FRAMES_FROZEN],
			changelog: [{
				version: "0.5.0",
				prs: [313],
				description: "Added app.vitals.frames.frozen.count to replace frames.frozen"
			}]
		},
		[APP_VITALS_FRAMES_SLOW_COUNT]: {
			brief: "The number of slow frames rendered during the lifetime of the span.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1,
			aliases: [FRAMES_SLOW],
			changelog: [{
				version: "0.5.0",
				prs: [313],
				description: "Added app.vitals.frames.slow.count to replace frames.slow"
			}]
		},
		[APP_VITALS_FRAMES_TOTAL_COUNT]: {
			brief: "The number of total frames rendered during the lifetime of the span.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 60,
			aliases: [FRAMES_TOTAL],
			changelog: [{
				version: "0.5.0",
				prs: [313],
				description: "Added app.vitals.frames.total.count to replace frames.total"
			}]
		},
		[APP_VITALS_START_COLD_VALUE]: {
			brief: "The duration of a cold app start in milliseconds",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1234.56,
			aliases: [APP_START_COLD],
			changelog: [{
				version: "0.5.0",
				prs: [313],
				description: "Added app.vitals.start.cold.value attribute"
			}]
		},
		[APP_VITALS_START_PREWARMED]: {
			brief: "Whether the app start was prewarmed.",
			type: "boolean",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: !0,
			changelog: [{
				version: "0.11.0",
				prs: [379],
				description: "Added app.vitals.start.prewarmed attribute"
			}]
		},
		[APP_VITALS_START_REASON]: {
			brief: "The reason that triggered the app start.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "push",
			changelog: [{
				version: "0.7.0",
				prs: [353],
				description: "Added app.vitals.start.reason attribute"
			}]
		},
		[APP_VITALS_START_SCREEN]: {
			brief: "The screen that is rendered when the app start is complete. This is the screen the user first sees and can interact with after launch. The absence of this attribute on the app start span indicates a background app start where no UI was rendered.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "MainActivity",
			changelog: [{
				version: "0.7.0",
				prs: [353],
				description: "Added app.vitals.start.screen attribute"
			}]
		},
		[APP_VITALS_START_TYPE]: {
			brief: "The type of app start, for example `cold` or `warm`",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "cold",
			aliases: [APP_START_TYPE],
			changelog: [{
				version: "0.5.0",
				prs: [313],
				description: "Added app.vitals.start.type attribute"
			}]
		},
		[APP_VITALS_START_WARM_VALUE]: {
			brief: "The duration of a warm app start in milliseconds",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1234.56,
			aliases: [APP_START_WARM],
			changelog: [{
				version: "0.5.0",
				prs: [313],
				description: "Added app.vitals.start.warm.value attribute"
			}]
		},
		[APP_VITALS_TTFD_VALUE]: {
			brief: "The duration of time to full display in milliseconds",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1234.56,
			aliases: [TIME_TO_FULL_DISPLAY],
			changelog: [{
				version: "0.5.0",
				prs: [313],
				description: "Added app.vitals.ttfd.value attribute"
			}]
		},
		[APP_VITALS_TTID_VALUE]: {
			brief: "The duration of time to initial display in milliseconds",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1234.56,
			aliases: [TIME_TO_INITIAL_DISPLAY],
			changelog: [{
				version: "0.5.0",
				prs: [313],
				description: "Added app.vitals.ttid.value attribute"
			}]
		},
		[ART_GC_BLOCKING_COUNT]: {
			brief: "Total number of blocking (stop-the-world) garbage collections performed by the Android Runtime",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1,
			changelog: [{
				version: "0.11.0",
				prs: [382],
				description: "Added art.gc.blocking_count attribute"
			}]
		},
		[ART_GC_BLOCKING_TIME]: {
			brief: "Total time spent in blocking (stop-the-world) garbage collections by the Android Runtime, in milliseconds",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 11.873,
			changelog: [{
				version: "0.11.0",
				prs: [382],
				description: "Added art.gc.blocking_time attribute"
			}]
		},
		[ART_GC_PRE_OOME_COUNT]: {
			brief: "Total number of garbage collections triggered as a last resort before an OutOfMemoryError by the Android Runtime",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 0,
			changelog: [{
				version: "0.11.0",
				prs: [382],
				description: "Added art.gc.pre_oome_count attribute"
			}]
		},
		[ART_GC_TOTAL_COUNT]: {
			brief: "Total number of garbage collections performed by the Android Runtime",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1,
			changelog: [{
				version: "0.11.0",
				prs: [382],
				description: "Added art.gc.total_count attribute"
			}]
		},
		[ART_GC_TOTAL_TIME]: {
			brief: "Total time spent in garbage collection by the Android Runtime, in milliseconds",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 11.807,
			changelog: [{
				version: "0.11.0",
				prs: [382],
				description: "Added art.gc.total_time attribute"
			}]
		},
		[ART_GC_WAITING_TIME]: {
			brief: "Total time threads spent waiting for garbage collection to complete in the Android Runtime, in milliseconds",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 8.054,
			changelog: [{
				version: "0.11.0",
				prs: [382],
				description: "Added art.gc.waiting_time attribute"
			}]
		},
		[ART_MEMORY_FREE]: {
			brief: "Free memory available to the process as reported by the Android Runtime, in bytes",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 3181568,
			changelog: [{
				version: "0.11.0",
				prs: [382],
				description: "Added art.memory.free attribute"
			}]
		},
		[ART_MEMORY_FREE_UNTIL_GC]: {
			brief: "Free memory available before a garbage collection would be triggered by the Android Runtime, in bytes",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 3181568,
			changelog: [{
				version: "0.11.0",
				prs: [382],
				description: "Added art.memory.free_until_gc attribute"
			}]
		},
		[ART_MEMORY_FREE_UNTIL_OOME]: {
			brief: "Free memory available before an OutOfMemoryError would be thrown by the Android Runtime, in bytes",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 196083712,
			changelog: [{
				version: "0.11.0",
				prs: [382],
				description: "Added art.memory.free_until_oome attribute"
			}]
		},
		[ART_MEMORY_MAX]: {
			brief: "Maximum memory the process is allowed to use as reported by the Android Runtime, in bytes",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 201326592,
			changelog: [{
				version: "0.11.0",
				prs: [382],
				description: "Added art.memory.max attribute"
			}]
		},
		[ART_MEMORY_TOTAL]: {
			brief: "Total memory currently allocated to the process by the Android Runtime, in bytes",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 7774208,
			changelog: [{
				version: "0.11.0",
				prs: [382],
				description: "Added art.memory.total attribute"
			}]
		},
		[AWS_CLOUDWATCH_LOGS_LOG_GROUP]: {
			brief: "The name of the CloudWatch Logs log group",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "/aws/lambda/my-function",
			changelog: [{
				version: "0.7.0",
				prs: [369],
				description: "Added aws.cloudwatch.logs.log_group attribute"
			}]
		},
		[AWS_CLOUDWATCH_LOGS_LOG_STREAM]: {
			brief: "The name of the CloudWatch Logs log stream",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "2024/01/01/[$LATEST]abcdef1234567890",
			changelog: [{
				version: "0.7.0",
				prs: [369],
				description: "Added aws.cloudwatch.logs.log_stream attribute"
			}]
		},
		[AWS_CLOUDWATCH_LOGS_URL]: {
			brief: "The URL to the CloudWatch Logs log group",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/my-log-group",
			changelog: [{
				version: "0.7.0",
				prs: [369],
				description: "Added aws.cloudwatch.logs.url attribute"
			}]
		},
		[AWS_LAMBDA_AWS_REQUEST_ID]: {
			brief: "The AWS request ID as received by the Lambda function runtime",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "8476a536-e9f4-11e8-9739-2dfe598c3fcd",
			deprecation: {
				replacement: "faas.invocation_id",
				reason: "This attribute is being deprecated in favor of faas.invocation_id"
			},
			aliases: [FAAS_INVOCATION_ID],
			changelog: [{
				version: "0.11.1",
				prs: [414, 424],
				description: "Deprecated aws.lambda.aws_request_id in favor of faas.invocation_id"
			}, {
				version: "0.7.0",
				prs: [369],
				description: "Added aws.lambda.aws_request_id attribute"
			}]
		},
		[AWS_LAMBDA_EXECUTION_DURATION_IN_MILLIS]: {
			brief: "The execution duration of the Lambda function invocation in milliseconds",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1234.56,
			changelog: [{
				version: "0.7.0",
				prs: [369],
				description: "Added aws.lambda.execution_duration_in_millis attribute"
			}]
		},
		[AWS_LAMBDA_FUNCTION_NAME]: {
			brief: "The name of the Lambda function",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "my-function",
			deprecation: {
				replacement: "faas.name",
				reason: "Use the OTel-aligned faas.name attribute instead"
			},
			aliases: [FAAS_NAME],
			changelog: [{
				version: "0.11.1",
				prs: [414],
				description: "Deprecated aws.lambda.function_name in favor of faas.name"
			}, {
				version: "0.7.0",
				prs: [369],
				description: "Added aws.lambda.function_name attribute"
			}]
		},
		[AWS_LAMBDA_FUNCTION_VERSION]: {
			brief: "The version of the Lambda function",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "$LATEST",
			deprecation: {
				replacement: "faas.version",
				reason: "Use the OTel-aligned faas.version attribute instead"
			},
			aliases: [FAAS_VERSION],
			changelog: [{
				version: "0.11.1",
				prs: [414, 424],
				description: "Deprecated aws.lambda.function_version in favor of faas.version"
			}, {
				version: "0.7.0",
				prs: [369],
				description: "Added aws.lambda.function_version attribute"
			}]
		},
		[AWS_LAMBDA_INVOKED_ARN]: {
			brief: "The full ARN of the Lambda function that was invoked",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "arn:aws:lambda:us-east-1:123456789012:function:my-function",
			aliases: [AWS_LAMBDA_INVOKED_FUNCTION_ARN],
			changelog: [{
				version: "0.11.1",
				prs: [414]
			}]
		},
		[AWS_LAMBDA_INVOKED_FUNCTION_ARN]: {
			brief: "The full ARN of the Lambda function that was invoked",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "arn:aws:lambda:us-east-1:123456789012:function:my-function",
			deprecation: {
				replacement: "aws.lambda.invoked_arn",
				reason: "This attribute is being deprecated in favor of aws.lambda.invoked_arn"
			},
			aliases: [AWS_LAMBDA_INVOKED_ARN],
			changelog: [{
				version: "0.11.1",
				prs: [414],
				description: "Deprecated aws.lambda.invoked_function_arn in favor of aws.lambda.invoked_arn"
			}, {
				version: "0.7.0",
				prs: [369],
				description: "Added aws.lambda.invoked_function_arn attribute"
			}]
		},
		[AWS_LAMBDA_REMAINING_TIME_IN_MILLIS]: {
			brief: "The remaining time in milliseconds before the Lambda function times out",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 5e3,
			changelog: [{
				version: "0.7.0",
				prs: [369],
				description: "Added aws.lambda.remaining_time_in_millis attribute"
			}]
		},
		[AWS_LOG_GROUP_NAMES]: {
			brief: "The name(s) of the AWS log group(s) an application is writing to.",
			type: "string[]",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: ["/aws/lambda/my-function", "opentelemetry-service"],
			changelog: [{
				version: "0.11.1",
				prs: [414]
			}]
		},
		[AWS_LOG_STREAM_NAMES]: {
			brief: "The name(s) of the AWS log stream(s) an application is writing to.",
			type: "string[]",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: ["logs/main/10838bed-421f-43ef-870a-f43feacbbb5b"],
			changelog: [{
				version: "0.11.1",
				prs: [414]
			}]
		},
		[BLOCKED_MAIN_THREAD]: {
			brief: "Whether the main thread was blocked by the span.",
			type: "boolean",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: !0,
			changelog: [{ version: "0.0.0" }]
		},
		[BROWSER_NAME]: {
			brief: "The name of the browser.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "Chrome",
			aliases: [SENTRY_BROWSER_NAME],
			changelog: [{
				version: "0.1.0",
				prs: [127, 139]
			}, { version: "0.0.0" }]
		},
		[BROWSER_PERFORMANCE_NAVIGATION_ACTIVATION_START]: {
			brief: "The time between initiating a navigation to a page and the browser activating the page",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1.983,
			aliases: [PERFORMANCE_ACTIVATIONSTART],
			changelog: [{
				version: "0.5.0",
				prs: [321],
				description: "Added browser.performance.navigation.activation_start attribute"
			}]
		},
		[BROWSER_PERFORMANCE_TIME_ORIGIN]: {
			brief: "The browser's performance.timeOrigin timestamp representing the time when the pageload was initiated",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1776185678.886,
			aliases: [PERFORMANCE_TIMEORIGIN],
			changelog: [{
				version: "0.5.0",
				prs: [321],
				description: "Added browser.performance.time_origin attribute attribute"
			}]
		},
		[BROWSER_REPORT_TYPE]: {
			brief: "A browser report sent via reporting API..",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "network-error",
			changelog: [{
				version: "0.1.0",
				prs: [68, 127]
			}]
		},
		[BROWSER_SCRIPT_INVOKER]: {
			brief: "How a script was called in the browser.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "Window.requestAnimationFrame",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[BROWSER_SCRIPT_INVOKER_TYPE]: {
			brief: "Browser script entry point type.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "event-listener",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[BROWSER_SCRIPT_SOURCE_CHAR_POSITION]: {
			brief: "A number representing the script character position of the script.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 678,
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, { version: "0.0.0" }]
		},
		[BROWSER_VERSION]: {
			brief: "The version of the browser.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "120.0.6099.130",
			aliases: [SENTRY_BROWSER_VERSION],
			changelog: [{
				version: "0.1.0",
				prs: [
					59,
					127,
					139
				]
			}]
		},
		[BROWSER_WEB_VITAL_CLS_REPORT_EVENT]: {
			brief: "The event that caused the SDK to report CLS (pagehide or navigation)",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "navigation",
			changelog: [{
				version: "0.5.0",
				prs: [319],
				description: "Added browser.web_vital.cls.report_event attribute"
			}]
		},
		[BROWSER_WEB_VITAL_CLS_SOURCE_KEY]: {
			brief: "The HTML elements or components responsible for the layout shift. <key> is a numeric index from 1 to N",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			hasDynamicSuffix: !0,
			example: "body > div#app",
			aliases: [CLS_SOURCE_KEY],
			changelog: [{
				version: "0.5.0",
				prs: [234]
			}]
		},
		[BROWSER_WEB_VITAL_CLS_VALUE]: {
			brief: "The value of the recorded Cumulative Layout Shift (CLS) web vital",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: .2361,
			aliases: [CLS],
			changelog: [{
				version: "0.5.0",
				prs: [229],
				description: "Added browser.web_vital.cls.value attribute"
			}]
		},
		[BROWSER_WEB_VITAL_FCP_VALUE]: {
			brief: "The time it takes for the browser to render the first piece of meaningful content on the screen",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 547.6951,
			aliases: [FCP],
			changelog: [{
				version: "0.5.0",
				prs: [235]
			}]
		},
		[BROWSER_WEB_VITAL_FP_VALUE]: {
			brief: "The time in milliseconds it takes for the browser to render the first pixel on the screen",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 477.1926,
			aliases: [FP],
			changelog: [{
				version: "0.5.0",
				prs: [235]
			}]
		},
		[BROWSER_WEB_VITAL_INP_VALUE]: {
			brief: "The value of the recorded Interaction to Next Paint (INP) web vital",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 200,
			aliases: [INP],
			changelog: [{
				version: "0.5.0",
				prs: [229],
				description: "Added browser.web_vital.inp.value attribute"
			}]
		},
		[BROWSER_WEB_VITAL_LCP_ELEMENT]: {
			brief: "The HTML element selector or component name for which LCP was reported",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "body > div#app > div#container > div",
			aliases: [LCP_ELEMENT],
			changelog: [{
				version: "0.5.0",
				prs: [233]
			}]
		},
		[BROWSER_WEB_VITAL_LCP_ID]: {
			brief: "The id of the dom element responsible for the largest contentful paint",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "#gero",
			aliases: [LCP_ID],
			changelog: [{
				version: "0.5.0",
				prs: [233]
			}]
		},
		[BROWSER_WEB_VITAL_LCP_LOAD_TIME]: {
			brief: "The time it took for the LCP element to be loaded",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1402,
			aliases: [LCP_LOADTIME],
			changelog: [{
				version: "0.5.0",
				prs: [233]
			}]
		},
		[BROWSER_WEB_VITAL_LCP_RENDER_TIME]: {
			brief: "The time it took for the LCP element to be rendered",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1685,
			aliases: [LCP_RENDERTIME],
			changelog: [{
				version: "0.5.0",
				prs: [233]
			}]
		},
		[BROWSER_WEB_VITAL_LCP_REPORT_EVENT]: {
			brief: "The event that caused the SDK to report LCP (pagehide or navigation)",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "pagehide",
			changelog: [{
				version: "0.5.0",
				prs: [319],
				description: "Added browser.web_vital.lcp.report_event attribute"
			}]
		},
		[BROWSER_WEB_VITAL_LCP_SIZE]: {
			brief: "The size of the largest contentful paint element",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1024,
			aliases: [LCP_SIZE],
			changelog: [{
				version: "0.5.0",
				prs: [233]
			}]
		},
		[BROWSER_WEB_VITAL_LCP_URL]: {
			brief: "The url of the dom element responsible for the largest contentful paint",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			example: "https://example.com/static/img.png",
			aliases: [LCP_URL],
			changelog: [{
				version: "0.5.0",
				prs: [233]
			}]
		},
		[BROWSER_WEB_VITAL_LCP_VALUE]: {
			brief: "The value of the recorded Largest Contentful Paint (LCP) web vital",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 2500,
			aliases: [LCP],
			changelog: [{
				version: "0.5.0",
				prs: [229],
				description: "Added browser.web_vital.lcp.value attribute"
			}]
		},
		[BROWSER_WEB_VITAL_TTFB_REQUEST_TIME]: {
			brief: "The time it takes for the server to process the initial request and send the first byte of a response to the user's browser",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1554.5814,
			aliases: [TTFB_REQUESTTIME],
			changelog: [{
				version: "0.5.0",
				prs: [235]
			}]
		},
		[BROWSER_WEB_VITAL_TTFB_VALUE]: {
			brief: "The value of the recorded Time To First Byte (TTFB) web vital in Milliseconds",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 194.3322,
			aliases: [TTFB],
			changelog: [{
				version: "0.5.0",
				prs: [235]
			}]
		},
		[CACHE_HIT]: {
			brief: "If the cache was hit during this span.",
			type: "boolean",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: !0,
			changelog: [{ version: "0.0.0" }]
		},
		[CACHE_ITEM_SIZE]: {
			brief: "The size of the requested item in the cache. In bytes.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 58,
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, { version: "0.0.0" }]
		},
		[CACHE_KEY]: {
			brief: "The key of the cache accessed.",
			type: "string[]",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: ["my-cache-key", "my-other-cache-key"],
			changelog: [{ version: "0.0.0" }]
		},
		[CACHE_OPERATION]: {
			brief: "The operation being performed on the cache.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "get",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[CACHE_TTL]: {
			brief: "The ttl of the cache in seconds",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 120,
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, { version: "0.0.0" }]
		},
		[CACHE_WRITE]: {
			brief: "If the cache operation resulted in a write to the cache.",
			type: "boolean",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: !0,
			changelog: [{ version: "0.5.0" }]
		},
		[CHANNEL]: {
			brief: "The channel name that is being used.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "mail",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[CLIENT_ADDRESS]: {
			brief: "Client address - domain name if available without reverse DNS lookup; otherwise, IP address or Unix domain socket name.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !0,
			visibility: "public",
			example: "example.com",
			aliases: [HTTP_CLIENT_IP],
			changelog: [{
				version: "0.1.0",
				prs: [106, 127]
			}, { version: "0.0.0" }]
		},
		[CLIENT_PORT]: {
			brief: "Client port number.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: 5432,
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, { version: "0.0.0" }]
		},
		[CLOUDFLARE_D1_DURATION]: {
			brief: "The duration of a Cloudflare D1 operation.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 543,
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, { version: "0.0.0" }]
		},
		[CLOUDFLARE_D1_QUERY_TYPE]: {
			brief: "The type of query executed in a Cloudflare D1 operation",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "run",
			deprecation: { replacement: "db.operation.name" },
			aliases: [DB_OPERATION_NAME, DB_OPERATION],
			changelog: [{
				version: "0.11.0",
				prs: [392],
				description: "Added cloudflare.d1.query_type attribute"
			}]
		},
		[CLOUDFLARE_D1_ROWS_READ]: {
			brief: "The number of rows read in a Cloudflare D1 operation.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 12,
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, { version: "0.0.0" }]
		},
		[CLOUDFLARE_D1_ROWS_WRITTEN]: {
			brief: "The number of rows written in a Cloudflare D1 operation.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 12,
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, { version: "0.0.0" }]
		},
		[CLOUDFLARE_R2_BUCKET]: {
			brief: "The name of the Cloudflare R2 bucket binding",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "MY_BUCKET",
			changelog: [{
				version: "0.11.1",
				prs: [413],
				description: "Added cloudflare.r2.bucket attribute"
			}]
		},
		[CLOUDFLARE_R2_OPERATION]: {
			brief: "The R2 API operation being performed",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "GetObject",
			changelog: [{
				version: "0.11.1",
				prs: [413],
				description: "Added cloudflare.r2.operation attribute"
			}]
		},
		[CLOUDFLARE_R2_REQUEST_DELIMITER]: {
			brief: "The delimiter used to group objects in an R2 list operation",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "/",
			changelog: [{
				version: "0.11.1",
				prs: [413],
				description: "Added cloudflare.r2.request.delimiter attribute"
			}]
		},
		[CLOUDFLARE_R2_REQUEST_KEY]: {
			brief: "The object key used in the R2 operation",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "my-file.txt",
			changelog: [{
				version: "0.11.1",
				prs: [413],
				description: "Added cloudflare.r2.request.key attribute"
			}]
		},
		[CLOUDFLARE_R2_REQUEST_PART_NUMBER]: {
			brief: "The part number in a multipart upload operation",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1,
			changelog: [{
				version: "0.11.1",
				prs: [413],
				description: "Added cloudflare.r2.request.part_number attribute"
			}]
		},
		[CLOUDFLARE_R2_REQUEST_PREFIX]: {
			brief: "The prefix used to filter objects in an R2 list operation",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "images/",
			changelog: [{
				version: "0.11.1",
				prs: [413],
				description: "Added cloudflare.r2.request.prefix attribute"
			}]
		},
		[CLOUDFLARE_WORKFLOW_ATTEMPT]: {
			brief: "The current attempt number for a Cloudflare Workflow step",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1,
			changelog: [{
				version: "0.11.0",
				prs: [392],
				description: "Added cloudflare.workflow.attempt attribute"
			}]
		},
		[CLOUDFLARE_WORKFLOW_RETRIES_BACKOFF]: {
			brief: "The backoff strategy for Cloudflare Workflow step retries",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "exponential",
			changelog: [{
				version: "0.11.0",
				prs: [392],
				description: "Added cloudflare.workflow.retries.backoff attribute"
			}]
		},
		[CLOUDFLARE_WORKFLOW_RETRIES_DELAY]: {
			brief: "The delay between Cloudflare Workflow step retries",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "5 seconds",
			changelog: [{
				version: "0.11.0",
				prs: [392],
				description: "Added cloudflare.workflow.retries.delay attribute"
			}]
		},
		[CLOUDFLARE_WORKFLOW_RETRIES_LIMIT]: {
			brief: "The maximum number of retries for a Cloudflare Workflow step",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 3,
			changelog: [{
				version: "0.11.0",
				prs: [392],
				description: "Added cloudflare.workflow.retries.limit attribute"
			}]
		},
		[CLOUDFLARE_WORKFLOW_TIMEOUT]: {
			brief: "The timeout duration for a Cloudflare Workflow step",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "1 minute",
			changelog: [{
				version: "0.11.0",
				prs: [392],
				description: "Added cloudflare.workflow.timeout attribute"
			}]
		},
		[CLOUD_ACCOUNT_ID]: {
			brief: "The cloud account ID the resource is assigned to",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "123456789012",
			changelog: [{
				version: "0.7.0",
				prs: [364],
				description: "Added cloud.account.id attribute"
			}]
		},
		[CLOUD_AVAILABILITY_ZONE]: {
			brief: "Cloud regions often have multiple, isolated locations known as zones to increase availability",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "us-east-1c",
			changelog: [{
				version: "0.7.0",
				prs: [364],
				description: "Added cloud.availability_zone attribute"
			}]
		},
		[CLOUD_PLATFORM]: {
			brief: "The cloud platform in use",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "aws_lambda",
			changelog: [{
				version: "0.7.0",
				prs: [364],
				description: "Added cloud.platform attribute"
			}]
		},
		[CLOUD_PROVIDER]: {
			brief: "Name of the cloud provider",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "aws",
			changelog: [{
				version: "0.7.0",
				prs: [364],
				description: "Added cloud.provider attribute"
			}]
		},
		[CLOUD_REGION]: {
			brief: "The geographical region the resource is running",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "us-east-1",
			changelog: [{
				version: "0.7.0",
				prs: [364],
				description: "Added cloud.region attribute"
			}]
		},
		[CLOUD_RESOURCE_ID]: {
			brief: "Cloud provider-specific native identifier of the monitored cloud resource",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "arn:aws:lambda:REGION:ACCOUNT_ID:function:my-function",
			changelog: [{
				version: "0.11.1",
				prs: [414]
			}],
			additionalContext: ["This can be an identifier for a resource in AWS, GCP, or Azure. There may be some overlap in values found here with other attributes. For instance, an AWS lambda ARN may be found here as well as in `aws.lambda.invoked_arn`. OTEL recommends setting them alongside each other."]
		},
		[CLS]: {
			brief: "The value of the recorded Cumulative Layout Shift (CLS) web vital",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: .2361,
			deprecation: {
				replacement: "browser.web_vital.cls.value",
				reason: "The CLS web vital is now recorded as a browser.web_vital.cls.value attribute."
			},
			aliases: [BROWSER_WEB_VITAL_CLS_VALUE],
			changelog: [{
				version: "0.5.0",
				prs: [229],
				description: "Added and deprecated attribute to document JS SDK's current behaviour"
			}]
		},
		[CLS_SOURCE_KEY]: {
			brief: "The HTML elements or components responsible for the layout shift. <key> is a numeric index from 1 to N",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			hasDynamicSuffix: !0,
			example: "body > div#app",
			deprecation: {
				replacement: "browser.web_vital.cls.source.<key>",
				reason: "The CLS source is now recorded as a browser.web_vital.cls.source.<key> attribute."
			},
			aliases: [BROWSER_WEB_VITAL_CLS_SOURCE_KEY],
			changelog: [{
				version: "0.5.0",
				prs: [234]
			}]
		},
		[CODE_FILEPATH]: {
			brief: "The source code file name that identifies the code unit as uniquely as possible (preferably an absolute file path).",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "/app/myapplication/http/handler/server.py",
			deprecation: { replacement: "code.file.path" },
			aliases: [CODE_FILE_PATH],
			changelog: [{
				version: "0.1.0",
				prs: [61]
			}, { version: "0.0.0" }]
		},
		[CODE_FILE_PATH]: {
			brief: "The source code file name that identifies the code unit as uniquely as possible (preferably an absolute file path).",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "/app/myapplication/http/handler/server.py",
			aliases: [CODE_FILEPATH],
			changelog: [{ version: "0.0.0" }]
		},
		[CODE_FUNCTION]: {
			brief: "The method or function name, or equivalent (usually rightmost part of the code unit's name).",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "server_request",
			aliases: [CODE_FUNCTION_NAME],
			changelog: [{
				version: "0.1.0",
				prs: [61, 74]
			}, { version: "0.0.0" }]
		},
		[CODE_FUNCTION_NAME]: {
			brief: "The method or function fully-qualified name without arguments.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "server_request",
			aliases: [CODE_FUNCTION],
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[CODE_LINENO]: {
			brief: "The line number in code.filepath best representing the operation. It SHOULD point within the code unit named in code.function",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: 42,
			deprecation: { replacement: "code.line.number" },
			aliases: [CODE_LINE_NUMBER],
			changelog: [
				{
					version: "0.4.0",
					prs: [228]
				},
				{
					version: "0.1.0",
					prs: [61, 108]
				},
				{ version: "0.0.0" }
			]
		},
		[CODE_LINE_NUMBER]: {
			brief: "The line number in code.filepath best representing the operation. It SHOULD point within the code unit named in code.function",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: 42,
			aliases: [CODE_LINENO],
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, { version: "0.0.0" }]
		},
		[CODE_NAMESPACE]: {
			brief: "The 'namespace' within which code.function is defined. Usually the qualified class or module name, such that code.namespace + some separator + code.function form a unique identifier for the code unit.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "http.handler",
			changelog: [{
				version: "0.1.0",
				prs: [61, 74]
			}, { version: "0.0.0" }]
		},
		[CONNECTIONTYPE]: {
			brief: "Specifies the type of the current connection (e.g. wifi, ethernet, cellular , etc).",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "wifi",
			deprecation: {
				replacement: "network.connection.type",
				reason: "Old namespace-less attribute, to be replaced with network.connection.type for span-first future"
			},
			aliases: [NETWORK_CONNECTION_TYPE, DEVICE_CONNECTION_TYPE],
			changelog: [{
				version: "0.5.0",
				prs: [279],
				description: "Added and deprecated attribute to document JS SDK's current behaviour"
			}]
		},
		[CONNECTION_RTT]: {
			brief: "Specifies the estimated effective round-trip time of the current connection, in milliseconds.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 100,
			deprecation: {
				replacement: "network.connection.rtt",
				reason: "Old attribute name (no official namespace), to be replaced with network.connection.rtt for span-first future"
			},
			aliases: [NETWORK_CONNECTION_RTT],
			changelog: [{
				version: "0.5.0",
				prs: [279],
				description: "Added and deprecated attribute to document JS SDK's current behaviour"
			}]
		},
		[CULTURE_CALENDAR]: {
			brief: "The calendar system used by the culture.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "GregorianCalendar",
			changelog: [{
				version: "0.4.0",
				prs: [243]
			}]
		},
		[CULTURE_DISPLAY_NAME]: {
			brief: "Human readable name of the culture.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "English (United States)",
			changelog: [{
				version: "0.4.0",
				prs: [243]
			}]
		},
		[CULTURE_IS_24_HOUR_FORMAT]: {
			brief: "Whether the culture uses 24-hour time format.",
			type: "boolean",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: !0,
			changelog: [{
				version: "0.4.0",
				prs: [243]
			}]
		},
		[CULTURE_LOCALE]: {
			brief: "The locale identifier following RFC 4646.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "en-US",
			changelog: [{
				version: "0.4.0",
				prs: [243]
			}]
		},
		[CULTURE_TIMEZONE]: {
			brief: "The timezone of the culture, as a geographic timezone identifier.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "Europe/Vienna",
			changelog: [{
				version: "0.4.0",
				prs: [243]
			}]
		},
		[DB_COLLECTION_NAME]: {
			brief: "The name of a collection (table, container) within the database.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "users",
			changelog: [{
				version: "0.1.0",
				prs: [106, 127]
			}, { version: "0.0.0" }]
		},
		[DB_DRIVER_NAME]: {
			brief: "The name of the driver used for the database connection.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "psycopg2",
			changelog: [{
				version: "0.5.0",
				prs: [297],
				description: "Added db.driver.name attribute"
			}]
		},
		[DB_NAME]: {
			brief: "The name of the database being accessed.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "customers",
			deprecation: { replacement: "db.namespace" },
			aliases: [DB_NAMESPACE],
			changelog: [{
				version: "0.1.0",
				prs: [61, 127]
			}, { version: "0.0.0" }]
		},
		[DB_NAMESPACE]: {
			brief: "The name of the database being accessed.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "customers",
			aliases: [DB_NAME],
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[DB_OPERATION]: {
			brief: "The name of the operation being executed.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "SELECT",
			deprecation: { replacement: "db.operation.name" },
			aliases: [DB_OPERATION_NAME, CLOUDFLARE_D1_QUERY_TYPE],
			changelog: [
				{
					version: "0.4.0",
					prs: [199]
				},
				{
					version: "0.1.0",
					prs: [61, 127]
				},
				{ version: "0.0.0" }
			]
		},
		[DB_OPERATION_BATCH_SIZE]: {
			brief: "The number of queries included in a batch operation. Operations are only considered batches when they contain two or more operations, and so db.operation.batch.size SHOULD never be 1.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: 3,
			changelog: [{
				version: "0.11.0",
				prs: [407],
				description: "Added db.operation.batch.size attribute"
			}]
		},
		[DB_OPERATION_NAME]: {
			brief: "The name of the operation being executed.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "SELECT",
			aliases: [DB_OPERATION, CLOUDFLARE_D1_QUERY_TYPE],
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[DB_QUERY_PARAMETER_KEY]: {
			brief: "A query parameter used in db.query.text, with <key> being the parameter name, and the attribute value being a string representation of the parameter value.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !0,
			visibility: "public",
			hasDynamicSuffix: !0,
			example: "db.query.parameter.foo='123'",
			changelog: [{
				version: "0.1.0",
				prs: [103, 127]
			}]
		},
		[DB_QUERY_SUMMARY]: {
			brief: "A shortened representation of operation(s) in the full query. This attribute must be low-cardinality and should only contain the operation table names.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "SELECT users;",
			changelog: [
				{
					version: "0.4.0",
					prs: [208]
				},
				{
					version: "0.1.0",
					prs: [127]
				},
				{ version: "0.0.0" }
			]
		},
		[DB_QUERY_TEXT]: {
			brief: "The database parameterized query being executed. Any parameter values (filters, insertion values, etc) should be replaced with parameter placeholders. If applicable, use `db.query.parameter.<key>` to add the parameter value.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "SELECT * FROM users WHERE id = $1",
			aliases: [DB_STATEMENT],
			changelog: [
				{
					version: "0.4.0",
					prs: [208]
				},
				{
					version: "0.1.0",
					prs: [127]
				},
				{ version: "0.0.0" }
			]
		},
		[DB_REDIS_CONNECTION]: {
			brief: "The redis connection name.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "my-redis-instance",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[DB_REDIS_KEY]: {
			brief: "The key the Redis command is operating on.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "user:2047:city",
			changelog: [{
				version: "0.6.0",
				prs: [326],
				description: "Added db.redis.key attribute"
			}]
		},
		[DB_REDIS_PARAMETERS]: {
			brief: "The array of command parameters given to a redis command.",
			type: "string[]",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			example: ["test", "*"],
			changelog: [{ version: "0.0.0" }]
		},
		[DB_SQL_BINDINGS]: {
			brief: "The array of query bindings.",
			type: "string[]",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			example: ["1", "foo"],
			deprecation: {
				replacement: "db.query.parameter.<key>",
				reason: "Instead of adding every binding in the db.sql.bindings attribute, add them as individual entires with db.query.parameter.<key>."
			},
			changelog: [{
				version: "0.1.0",
				prs: [61]
			}, { version: "0.0.0" }]
		},
		[DB_STATEMENT]: {
			brief: "The database statement being executed.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !0,
			visibility: "public",
			example: "SELECT * FROM users",
			deprecation: { replacement: "db.query.text" },
			aliases: [DB_QUERY_TEXT],
			changelog: [
				{
					version: "0.4.0",
					prs: [199]
				},
				{
					version: "0.1.0",
					prs: [61, 127]
				},
				{ version: "0.0.0" }
			]
		},
		[DB_STORED_PROCEDURE_NAME]: {
			brief: "The name of a stored procedure being called.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "GetUserById",
			changelog: [{
				version: "0.11.0",
				prs: [398]
			}]
		},
		[DB_SYSTEM]: {
			brief: "An identifier for the database management system (DBMS) product being used. See [OpenTelemetry docs](https://github.com/open-telemetry/semantic-conventions/blob/main/docs/database/database-spans.md#notes-and-well-known-identifiers-for-dbsystem) for a list of well-known identifiers.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "postgresql",
			deprecation: { replacement: "db.system.name" },
			aliases: [DB_SYSTEM_NAME],
			changelog: [
				{
					version: "0.4.0",
					prs: [199, 224]
				},
				{
					version: "0.1.0",
					prs: [61, 127]
				},
				{ version: "0.0.0" }
			]
		},
		[DB_SYSTEM_NAME]: {
			brief: "An identifier for the database management system (DBMS) product being used. See [OpenTelemetry docs](https://github.com/open-telemetry/semantic-conventions/blob/main/docs/database/database-spans.md#notes-and-well-known-identifiers-for-dbsystem) for a list of well-known identifiers.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "postgresql",
			aliases: [DB_SYSTEM],
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[DB_USER]: {
			brief: "The database user.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "fancy_user",
			changelog: [{ version: "0.0.0" }]
		},
		[DEVICEMEMORY]: {
			brief: "The estimated total memory capacity of the device, only a rough estimation in gigabytes.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "8 GB",
			deprecation: {
				replacement: "device.memory.estimated_capacity",
				reason: "Old namespace-less attribute, to be replaced with device.memory.estimated_capacity for span-first future"
			},
			aliases: [DEVICE_MEMORY_ESTIMATED_CAPACITY],
			changelog: [{
				version: "0.5.0",
				prs: [281],
				description: "Added and deprecated attribute to document JS SDK's current behaviour"
			}]
		},
		[DEVICE_ARCHS]: {
			brief: "The CPU architectures of the device.",
			type: "string[]",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: [
				"arm64-v8a",
				"armeabi-v7a",
				"armeabi"
			],
			changelog: [{
				version: "0.5.0",
				prs: [303],
				description: "Added device.archs attribute"
			}]
		},
		[DEVICE_BATTERY_LEVEL]: {
			brief: "The battery level of the device as a percentage (0-100).",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 100,
			changelog: [{
				version: "0.5.0",
				prs: [303],
				description: "Added device.battery_level attribute"
			}]
		},
		[DEVICE_BATTERY_TEMPERATURE]: {
			brief: "The battery temperature of the device in Celsius.",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 25,
			changelog: [{
				version: "0.5.0",
				prs: [303],
				description: "Added device.battery_temperature attribute"
			}]
		},
		[DEVICE_BOOT_TIME]: {
			brief: "A formatted UTC timestamp when the system was booted.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "2018-02-08T12:52:12Z",
			changelog: [{
				version: "0.5.0",
				prs: [303],
				description: "Added device.boot_time attribute"
			}]
		},
		[DEVICE_BRAND]: {
			brief: "The brand of the device.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "Apple",
			changelog: [{
				version: "0.1.0",
				prs: [116, 127]
			}]
		},
		[DEVICE_CHARGING]: {
			brief: "Whether the device was charging or not.",
			type: "boolean",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: !1,
			changelog: [{
				version: "0.5.0",
				prs: [303],
				description: "Added device.charging attribute"
			}]
		},
		[DEVICE_CHIPSET]: {
			brief: "The chipset of the device.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "Qualcomm SM8550",
			changelog: [{
				version: "0.5.0",
				prs: [303],
				description: "Added device.chipset attribute"
			}]
		},
		[DEVICE_CLASS]: {
			brief: "The classification of the device. For example, `low`, `medium`, or `high`. Typically inferred by Relay - SDKs generally do not need to set this directly.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "medium",
			changelog: [{
				version: "0.5.0",
				prs: [300],
				description: "Added device.class attribute"
			}]
		},
		[DEVICE_CONNECTION_TYPE]: {
			brief: "The internet connection type currently being used by the device.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "wifi",
			deprecation: {
				replacement: "network.connection.type",
				reason: "This attribute is being deprecated in favor of network.connection.type"
			},
			aliases: [NETWORK_CONNECTION_TYPE, CONNECTIONTYPE],
			changelog: [{
				version: "0.5.0",
				prs: [303],
				description: "Added and deprecated device.connection_type in favor of network.connection.type"
			}]
		},
		[DEVICE_CPU_DESCRIPTION]: {
			brief: "A description of the CPU of the device.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "Intel(R) Core(TM)2 Quad CPU Q6600 @ 2.40GHz",
			changelog: [{
				version: "0.5.0",
				prs: [303],
				description: "Added device.cpu_description attribute"
			}]
		},
		[DEVICE_EXTERNAL_FREE_STORAGE]: {
			brief: "External storage free size in bytes.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 67108864e3,
			changelog: [{
				version: "0.5.0",
				prs: [303],
				description: "Added device.external_free_storage attribute"
			}]
		},
		[DEVICE_EXTERNAL_STORAGE_SIZE]: {
			brief: "External storage total size in bytes.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 134217728e3,
			changelog: [{
				version: "0.5.0",
				prs: [303],
				description: "Added device.external_storage_size attribute"
			}]
		},
		[DEVICE_FAMILY]: {
			brief: "The family of the device.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "iPhone",
			changelog: [{
				version: "0.1.0",
				prs: [116, 127]
			}]
		},
		[DEVICE_FREE_MEMORY]: {
			brief: "Free system memory in bytes.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 2147483648,
			changelog: [{
				version: "0.5.0",
				prs: [300],
				description: "Added device.free_memory attribute"
			}]
		},
		[DEVICE_FREE_STORAGE]: {
			brief: "Free device storage in bytes.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 107374182400,
			changelog: [{
				version: "0.5.0",
				prs: [303],
				description: "Added device.free_storage attribute"
			}]
		},
		[DEVICE_ID]: {
			brief: "Unique device identifier.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
			changelog: [{
				version: "0.5.0",
				prs: [303],
				description: "Added device.id attribute"
			}]
		},
		[DEVICE_LOCALE]: {
			brief: "The locale of the device.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "en-US",
			changelog: [{
				version: "0.5.0",
				prs: [303],
				description: "Added device.locale attribute"
			}]
		},
		[DEVICE_LOW_MEMORY]: {
			brief: "Whether the device was low on memory.",
			type: "boolean",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: !1,
			changelog: [{
				version: "0.5.0",
				prs: [303],
				description: "Added device.low_memory attribute"
			}]
		},
		[DEVICE_LOW_POWER_MODE]: {
			brief: "Whether the device is in Low Power Mode.",
			type: "boolean",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: !0,
			changelog: [{
				version: "0.6.0",
				prs: [314],
				description: "Added device.low_power_mode attribute"
			}]
		},
		[DEVICE_MANUFACTURER]: {
			brief: "The manufacturer of the device.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "Google",
			changelog: [{
				version: "0.5.0",
				prs: [303],
				description: "Added device.manufacturer attribute"
			}]
		},
		[DEVICE_MEMORY_ESTIMATED_CAPACITY]: {
			brief: "The estimated total memory capacity of the device, only a rough estimation in gigabytes. Browsers report estimations in buckets of powers of 2, mostly capped at 8 GB",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 8,
			aliases: [DEVICEMEMORY],
			changelog: [{
				version: "0.5.0",
				prs: [281],
				description: "Added attribute device.memory.estimated_capacity to be used instead of deviceMemory"
			}]
		},
		[DEVICE_MEMORY_SIZE]: {
			brief: "Total system memory available in bytes.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 17179869184,
			changelog: [{
				version: "0.5.0",
				prs: [300],
				description: "Added device.memory_size attribute"
			}]
		},
		[DEVICE_MODEL]: {
			brief: "The model of the device.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "iPhone 15 Pro Max",
			changelog: [{
				version: "0.1.0",
				prs: [116, 127]
			}]
		},
		[DEVICE_MODEL_ID]: {
			brief: "An internal hardware revision to identify the device exactly.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "N861AP",
			changelog: [{
				version: "0.5.0",
				prs: [300],
				description: "Added device.model_id attribute"
			}]
		},
		[DEVICE_NAME]: {
			brief: "The name of the device. On mobile, this is the user-assigned device name. On servers and desktops, this is typically the hostname.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			example: "localhost",
			changelog: [{
				version: "0.5.0",
				prs: [303],
				description: "Added device.name attribute"
			}]
		},
		[DEVICE_ONLINE]: {
			brief: "Whether the device was online or not.",
			type: "boolean",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: !0,
			changelog: [{
				version: "0.5.0",
				prs: [303],
				description: "Added device.online attribute"
			}]
		},
		[DEVICE_ORIENTATION]: {
			brief: "The orientation of the device, either \"portrait\" or \"landscape\".",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "portrait",
			changelog: [{
				version: "0.5.0",
				prs: [303],
				description: "Added device.orientation attribute"
			}]
		},
		[DEVICE_PROCESSOR_COUNT]: {
			brief: "Number of \"logical processors\".",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 8,
			aliases: [HARDWARECONCURRENCY],
			changelog: [{
				version: "0.5.0",
				prs: [300],
				description: "Added and deprecated attribute device.processor_count in favor of device.cpu.logical_core_count"
			}]
		},
		[DEVICE_PROCESSOR_FREQUENCY]: {
			brief: "Processor frequency in MHz.",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 2400,
			changelog: [{
				version: "0.5.0",
				prs: [303],
				description: "Added device.processor_frequency attribute"
			}]
		},
		[DEVICE_SCREEN_DENSITY]: {
			brief: "The screen density of the device.",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 2.625,
			changelog: [{
				version: "0.5.0",
				prs: [303],
				description: "Added device.screen_density attribute"
			}]
		},
		[DEVICE_SCREEN_DPI]: {
			brief: "The screen density in dots-per-inch (DPI) of the device.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 420,
			changelog: [{
				version: "0.5.0",
				prs: [303],
				description: "Added device.screen_dpi attribute"
			}]
		},
		[DEVICE_SCREEN_HEIGHT_PIXELS]: {
			brief: "The height of the device screen in pixels.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 2400,
			changelog: [{
				version: "0.5.0",
				prs: [303],
				description: "Added device.screen_height_pixels attribute"
			}]
		},
		[DEVICE_SCREEN_WIDTH_PIXELS]: {
			brief: "The width of the device screen in pixels.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1080,
			changelog: [{
				version: "0.5.0",
				prs: [303],
				description: "Added device.screen_width_pixels attribute"
			}]
		},
		[DEVICE_SIMULATOR]: {
			brief: "Whether the device is a simulator or an actual device.",
			type: "boolean",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: !1,
			changelog: [{
				version: "0.5.0",
				prs: [300],
				description: "Added device.simulator attribute"
			}]
		},
		[DEVICE_STORAGE_SIZE]: {
			brief: "Total device storage in bytes.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 274877906944,
			changelog: [{
				version: "0.5.0",
				prs: [303],
				description: "Added device.storage_size attribute"
			}]
		},
		[DEVICE_THERMAL_STATE]: {
			brief: "The thermal state of the device. Based on Apple's `ProcessInfo.ThermalState` enum: `nominal`, `fair`, `serious`, or `critical`.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "nominal",
			changelog: [{
				version: "0.5.0",
				prs: [303],
				description: "Added device.thermal_state attribute"
			}]
		},
		[DEVICE_TIMEZONE]: {
			brief: "The timezone of the device.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "Europe/Vienna",
			changelog: [{
				version: "0.5.0",
				prs: [303],
				description: "Added device.timezone attribute"
			}]
		},
		[DEVICE_USABLE_MEMORY]: {
			brief: "Memory usable for the app in bytes.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 2147483648,
			changelog: [{
				version: "0.5.0",
				prs: [303],
				description: "Added device.usable_memory attribute"
			}]
		},
		[EFFECTIVECONNECTIONTYPE]: {
			brief: "Specifies the estimated effective type of the current connection (e.g. slow-2g, 2g, 3g, 4g).",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "4g",
			deprecation: {
				replacement: "network.connection.effective_type",
				reason: "Old namespace-less attribute, to be replaced with network.connection.effective_type for span-first future"
			},
			aliases: [NETWORK_CONNECTION_EFFECTIVE_TYPE],
			changelog: [{
				version: "0.5.0",
				prs: [279],
				description: "Added and deprecated attribute to document JS SDK's current behaviour"
			}]
		},
		[ENVIRONMENT]: {
			brief: "The sentry environment.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "production",
			deprecation: { replacement: "sentry.environment" },
			aliases: [SENTRY_ENVIRONMENT],
			changelog: [{
				version: "0.1.0",
				prs: [61, 127]
			}, { version: "0.0.0" }]
		},
		[ERROR_TYPE]: {
			brief: "Describes a class of error the operation ended with.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "timeout",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[EVENT_ID]: {
			brief: "The unique identifier for this event (log record)",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1234567890,
			changelog: [{
				version: "0.1.0",
				prs: [101]
			}]
		},
		[EVENT_NAME]: {
			brief: "The name that uniquely identifies this event (log record)",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "Process Payload",
			changelog: [{
				version: "0.1.0",
				prs: [101, 127]
			}]
		},
		[EXCEPTION_ESCAPED]: {
			brief: "SHOULD be set to true if the exception event is recorded at a point where it is known that the exception is escaping the scope of the span.",
			type: "boolean",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: !0,
			changelog: [{ version: "0.0.0" }]
		},
		[EXCEPTION_MESSAGE]: {
			brief: "The error message.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !0,
			visibility: "public",
			example: "ENOENT: no such file or directory",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[EXCEPTION_STACKTRACE]: {
			brief: "A stacktrace as a string in the natural representation for the language runtime. The representation is to be determined and documented by each language SIG.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !0,
			visibility: "public",
			example: `Exception in thread "main" java.lang.RuntimeException: Test exception
 at com.example.GenerateTrace.methodB(GenerateTrace.java:13)
 at com.example.GenerateTrace.methodA(GenerateTrace.java:9)
 at com.example.GenerateTrace.main(GenerateTrace.java:5)`,
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[EXCEPTION_TYPE]: {
			brief: "The type of the exception (its fully-qualified class name, if applicable). The dynamic type of the exception should be preferred over the static type in languages that support it.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "OSError",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[FAAS_COLDSTART]: {
			brief: "A boolean that is true if the serverless function is executed for the first time (aka cold-start).",
			type: "boolean",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: !0,
			changelog: [{ version: "0.0.0" }]
		},
		[FAAS_CRON]: {
			brief: "A string containing the schedule period as Cron Expression.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "0/5 * * * ? *",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[FAAS_DURATION_IN_MS]: {
			brief: "The duration a function took to run, in milliseconds.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 120,
			changelog: [{
				version: "0.11.0",
				prs: [403]
			}]
		},
		[FAAS_ENTRY_POINT]: {
			brief: "The code that's run when the cloud provider invokes your function.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "my_main_function",
			changelog: [{
				version: "0.11.0",
				prs: [403, 415]
			}]
		},
		[FAAS_IDENTITY]: {
			brief: "The Service Account (GCP), IAM Execution Role (AWS), or Managed Identity (Azure) used by the serverless function when interacting with other cloud services",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "name@project.iam.gserviceaccount.com (GCP), arn:aws:iam::123456789012:role/role-name (AWS), 00000000-0000-0000-0000-000000000000 (Azure)",
			changelog: [{
				version: "0.11.0",
				prs: [403]
			}]
		},
		[FAAS_INVOCATION_ID]: {
			brief: "The invocation ID of the current function invocation.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "af9d5aa4-a685-4c5f-a22b-444f80b3cc28",
			aliases: [AWS_LAMBDA_AWS_REQUEST_ID],
			changelog: [{
				version: "0.11.1",
				prs: [414, 424]
			}]
		},
		[FAAS_NAME]: {
			brief: "The name of the serverless function",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "my_function",
			aliases: [AWS_LAMBDA_FUNCTION_NAME],
			changelog: [{
				version: "0.11.0",
				prs: [403, 415]
			}]
		},
		[FAAS_TIME]: {
			brief: "A string containing the function invocation time in the ISO 8601 format expressed in UTC.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "2020-01-23T13:47:06Z",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[FAAS_TRIGGER]: {
			brief: "Type of the trigger which caused this function invocation.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "timer",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[FAAS_VERSION]: {
			brief: "The version of the function that was invoked",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "$LATEST",
			aliases: [AWS_LAMBDA_FUNCTION_VERSION],
			changelog: [{
				version: "0.11.1",
				prs: [414, 424]
			}]
		},
		[FCP]: {
			brief: "The time it takes for the browser to render the first piece of meaningful content on the screen",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 547.6951,
			deprecation: {
				replacement: "browser.web_vital.fcp.value",
				reason: "This attribute is being deprecated in favor of browser.web_vital.fcp.value"
			},
			aliases: [BROWSER_WEB_VITAL_FCP_VALUE],
			changelog: [{
				version: "0.5.0",
				prs: [235]
			}]
		},
		[FLAG_EVALUATION_KEY]: {
			brief: "An instance of a feature flag evaluation. The value of this attribute is the boolean representing the evaluation result. The <key> suffix is the name of the feature flag.",
			type: "boolean",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			hasDynamicSuffix: !0,
			example: "flag.evaluation.is_new_ui=true",
			changelog: [{
				version: "0.1.0",
				prs: [103]
			}]
		},
		[FP]: {
			brief: "The time it takes for the browser to render the first pixel on the screen",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 477.1926,
			deprecation: {
				replacement: "browser.web_vital.fp.value",
				reason: "This attribute is being deprecated in favor of browser.web_vital.fp.value"
			},
			aliases: [BROWSER_WEB_VITAL_FP_VALUE],
			changelog: [{
				version: "0.5.0",
				prs: [235]
			}]
		},
		[FRAMES_DELAY]: {
			brief: "The sum of all delayed frame durations in seconds during the lifetime of the span. For more information see [frames delay](https://develop.sentry.dev/sdk/performance/frames-delay/).",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 5,
			deprecation: {
				replacement: "app.vitals.frames.delay.value",
				reason: "Replaced by app.vitals.frames.delay.value to align with the app.vitals.* namespace for mobile performance attributes"
			},
			aliases: [APP_VITALS_FRAMES_DELAY_VALUE],
			changelog: [
				{
					version: "0.5.0",
					prs: [313],
					description: "Deprecated in favor of app.vitals.frames.delay.value"
				},
				{
					version: "0.4.0",
					prs: [228]
				},
				{ version: "0.0.0" }
			]
		},
		[FRAMES_FROZEN]: {
			brief: "The number of frozen frames rendered during the lifetime of the span.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 3,
			deprecation: {
				replacement: "app.vitals.frames.frozen.count",
				reason: "Replaced by app.vitals.frames.frozen.count to align with the app.vitals.* namespace for mobile performance attributes"
			},
			aliases: [APP_VITALS_FRAMES_FROZEN_COUNT],
			changelog: [
				{
					version: "0.5.0",
					prs: [313],
					description: "Deprecated in favor of app.vitals.frames.frozen.count"
				},
				{
					version: "0.4.0",
					prs: [228]
				},
				{ version: "0.0.0" }
			]
		},
		[FRAMES_FROZEN_RATE]: {
			brief: "The rate of frozen frames, or `app_vitals.frames.frozen.count` divided by `app_vitals.frames.total.count`. This is computed by Relay.",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			changelog: [{
				version: "0.7.0",
				prs: [362],
				description: "Added frames_frozen_rate attribute"
			}]
		},
		[FRAMES_SLOW]: {
			brief: "The number of slow frames rendered during the lifetime of the span.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1,
			deprecation: {
				replacement: "app.vitals.frames.slow.count",
				reason: "Replaced by app.vitals.frames.slow.count to align with the app.vitals.* namespace for mobile performance attributes"
			},
			aliases: [APP_VITALS_FRAMES_SLOW_COUNT],
			changelog: [
				{
					version: "0.5.0",
					prs: [313],
					description: "Deprecated in favor of app.vitals.frames.slow.count"
				},
				{
					version: "0.4.0",
					prs: [228]
				},
				{ version: "0.0.0" }
			]
		},
		[FRAMES_SLOW_RATE]: {
			brief: "The rate of slow frames, or `app_vitals.frames.slow.count` divided by `app_vitals.frames.total.count`. This is computed by Relay.",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			changelog: [{
				version: "0.7.0",
				prs: [362],
				description: "Added frames_slow_rate attribute"
			}]
		},
		[FRAMES_TOTAL]: {
			brief: "The number of total frames rendered during the lifetime of the span.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 60,
			deprecation: {
				replacement: "app.vitals.frames.total.count",
				reason: "Replaced by app.vitals.frames.total.count to align with the app.vitals.* namespace for mobile performance attributes"
			},
			aliases: [APP_VITALS_FRAMES_TOTAL_COUNT],
			changelog: [
				{
					version: "0.5.0",
					prs: [313],
					description: "Deprecated in favor of app.vitals.frames.total.count"
				},
				{
					version: "0.4.0",
					prs: [228]
				},
				{ version: "0.0.0" }
			]
		},
		[FS_ERROR]: {
			brief: "The error message of a file system error.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "ENOENT: no such file or directory",
			deprecation: {
				replacement: "error.type",
				reason: "This attribute is not part of the OpenTelemetry specification and error.type fits much better."
			},
			changelog: [{
				version: "0.1.0",
				prs: [61, 127]
			}, { version: "0.0.0" }]
		},
		[GCP_FUNCTION_CONTEXT_EVENT_ID]: {
			brief: "The event ID from the legacy GCP Cloud Function context (1st gen)",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "1234567890",
			changelog: [{
				version: "0.7.0",
				prs: [371],
				description: "Added gcp.function.context.event_id attribute"
			}]
		},
		[GCP_FUNCTION_CONTEXT_EVENT_TYPE]: {
			brief: "The type of the GCP Cloud Function event",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "google.pubsub.topic.publish",
			changelog: [{
				version: "0.7.0",
				prs: [371],
				description: "Added gcp.function.context.event_type attribute"
			}]
		},
		[GCP_FUNCTION_CONTEXT_ID]: {
			brief: "The unique event ID from the GCP CloudEvents context (2nd gen Cloud Functions)",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "1234567890",
			changelog: [{
				version: "0.7.0",
				prs: [371],
				description: "Added gcp.function.context.id attribute"
			}]
		},
		[GCP_FUNCTION_CONTEXT_RESOURCE]: {
			brief: "The resource that triggered the GCP Cloud Function event",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "projects/my-project/topics/my-topic",
			changelog: [{
				version: "0.7.0",
				prs: [371],
				description: "Added gcp.function.context.resource attribute"
			}]
		},
		[GCP_FUNCTION_CONTEXT_SOURCE]: {
			brief: "The source of the GCP Cloud Function event",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "//pubsub.googleapis.com/projects/my-project/topics/my-topic",
			changelog: [{
				version: "0.7.0",
				prs: [371],
				description: "Added gcp.function.context.source attribute"
			}]
		},
		[GCP_FUNCTION_CONTEXT_SPECVERSION]: {
			brief: "The CloudEvents specification version of the GCP Cloud Function event",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "1.0",
			changelog: [{
				version: "0.7.0",
				prs: [371],
				description: "Added gcp.function.context.specversion attribute"
			}]
		},
		[GCP_FUNCTION_CONTEXT_TIME]: {
			brief: "The timestamp of the GCP Cloud Function event",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "2024-01-01T00:00:00.000Z",
			changelog: [{
				version: "0.7.0",
				prs: [371],
				description: "Added gcp.function.context.time attribute"
			}]
		},
		[GCP_FUNCTION_CONTEXT_TIMESTAMP]: {
			brief: "The legacy timestamp of the GCP Cloud Function event",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "2024-01-01T00:00:00.000Z",
			changelog: [{
				version: "0.7.0",
				prs: [371],
				description: "Added gcp.function.context.timestamp attribute"
			}]
		},
		[GCP_FUNCTION_CONTEXT_TYPE]: {
			brief: "The type of the GCP Cloud Function event context",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "cloud_functions.context",
			changelog: [{
				version: "0.7.0",
				prs: [371],
				description: "Added gcp.function.context.type attribute"
			}]
		},
		[GCP_PROJECT_ID]: {
			brief: "The ID of the project in GCP that this resource is associated with",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "my-project-123",
			changelog: [{
				version: "0.11.0",
				prs: [403]
			}]
		},
		[GEN_AI_AGENT_NAME]: {
			brief: "The name of the agent being used.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "ResearchAssistant",
			changelog: [{
				version: "0.1.0",
				prs: [62, 127]
			}]
		},
		[GEN_AI_CONTEXT_UTILIZATION]: {
			brief: "The fraction of the model context window utilized by this generation.",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: .75,
			changelog: [{
				version: "0.5.0",
				prs: [315],
				description: "Added gen_ai.context.utilization attribute"
			}]
		},
		[GEN_AI_CONTEXT_WINDOW_SIZE]: {
			brief: "The maximum context window size supported by the model for this generation.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 128e3,
			changelog: [{
				version: "0.5.0",
				prs: [315],
				description: "Added gen_ai.context.window_size attribute"
			}]
		},
		[GEN_AI_CONVERSATION_ID]: {
			brief: "The unique identifier for a conversation (session, thread), used to store and correlate messages within this conversation.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "conv_5j66UpCpwteGg4YSxUnt7lPY",
			changelog: [{
				version: "0.4.0",
				prs: [250]
			}]
		},
		[GEN_AI_COST_INPUT_TOKENS]: {
			brief: "The cost of tokens used to process the AI input (prompt) in USD (without cached input tokens).",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 123.45,
			changelog: [
				{
					version: "0.9.0",
					prs: [397],
					description: "Add additional_context"
				},
				{
					version: "0.4.0",
					prs: [228]
				},
				{
					version: "0.1.0",
					prs: [112]
				}
			],
			additionalContext: [
				"This attribute appears on both agent parent spans (aggregated totals) and LLM child spans (per-call values). When using sum() to calculate total cost, filter to gen_ai.operation.type:ai_client to avoid double-counting hierarchical spans.",
				"Despite the name 'cost.input_tokens', this value is cost in USD, not a token count. For token counts, use gen_ai.usage.input_tokens.",
				"This is the cost of non-cached input tokens only. The cost of cached tokens is excluded from this value."
			]
		},
		[GEN_AI_COST_OUTPUT_TOKENS]: {
			brief: "The cost of tokens used for creating the AI output in USD (without reasoning tokens).",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 123.45,
			changelog: [
				{
					version: "0.9.0",
					prs: [397],
					description: "Add additional_context"
				},
				{
					version: "0.4.0",
					prs: [228]
				},
				{
					version: "0.1.0",
					prs: [112]
				}
			],
			additionalContext: [
				"This attribute appears on both agent parent spans (aggregated totals) and LLM child spans (per-call values). When using sum() to calculate total cost, filter to gen_ai.operation.type:ai_client to avoid double-counting hierarchical spans.",
				"Despite the name 'cost.output_tokens', this value is cost in USD, not a token count. For token counts, use gen_ai.usage.output_tokens.",
				"This is the cost of non-reasoning output tokens only. The cost of reasoning tokens is excluded from this value."
			]
		},
		[GEN_AI_COST_TOTAL_TOKENS]: {
			brief: "The total cost for the tokens used.",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 12.34,
			aliases: [AI_TOTAL_COST],
			changelog: [
				{
					version: "0.9.0",
					prs: [397],
					description: "Add additional_context"
				},
				{
					version: "0.5.0",
					prs: [264]
				},
				{
					version: "0.4.0",
					prs: [228]
				},
				{
					version: "0.1.0",
					prs: [126]
				}
			],
			additionalContext: ["This attribute appears on both agent parent spans (aggregated totals) and LLM child spans (per-call values). When using sum() to calculate total cost, filter to gen_ai.operation.type:ai_client to avoid double-counting hierarchical spans.", "Despite the name 'cost.total_tokens', this value is cost in USD, not a token count. For token counts, use gen_ai.usage.total_tokens."]
		},
		[GEN_AI_EMBEDDINGS_INPUT]: {
			brief: "The input to the embeddings model.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "What's the weather in Paris?",
			changelog: [{
				version: "0.3.1",
				prs: [195]
			}]
		},
		[GEN_AI_FUNCTION_ID]: {
			brief: "Framework-specific tracing label for the execution of a function or other unit of execution in a generative AI system.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "my-awesome-function",
			changelog: [{
				version: "0.5.0",
				prs: [308],
				description: "Added gen_ai.function_id attribute"
			}]
		},
		[GEN_AI_INPUT_MESSAGES]: {
			brief: "The messages passed to the model. It has to be a stringified version of an array of objects. The `role` attribute of each object must be `\"user\"`, `\"assistant\"`, `\"tool\"`, or `\"system\"`. For messages of the role `\"tool\"`, the `content` can be a string or an arbitrary object with information about the tool call. For other messages the `content` can be either a string or a list of objects in the format `{type: \"text\", text:\"...\"}`.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "[{\"role\": \"user\", \"parts\": [{\"type\": \"text\", \"content\": \"Weather in Paris?\"}]}, {\"role\": \"assistant\", \"parts\": [{\"type\": \"tool_call\", \"id\": \"call_VSPygqKTWdrhaFErNvMV18Yl\", \"name\": \"get_weather\", \"arguments\": {\"location\": \"Paris\"}}]}, {\"role\": \"tool\", \"parts\": [{\"type\": \"tool_call_response\", \"id\": \"call_VSPygqKTWdrhaFErNvMV18Yl\", \"result\": \"rainy, 57°F\"}]}]",
			aliases: [AI_TEXTS],
			changelog: [{
				version: "0.5.0",
				prs: [264]
			}, {
				version: "0.4.0",
				prs: [221]
			}]
		},
		[GEN_AI_OPERATION_NAME]: {
			brief: "The name of the operation being performed. It has the following list of well-known values: 'chat', 'create_agent', 'embeddings', 'execute_tool', 'generate_content', 'invoke_agent', 'text_completion'. If one of them applies, then that value MUST be used. Otherwise a custom value MAY be used.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "chat",
			changelog: [{
				version: "0.4.0",
				prs: [225]
			}, {
				version: "0.1.0",
				prs: [62, 127]
			}]
		},
		[GEN_AI_OPERATION_TYPE]: {
			brief: "The type of AI operation. Must be one of 'agent' (invoke_agent and create_agent spans), 'ai_client' (any LLM call), 'tool' (execute_tool spans), 'handoff' (handoff spans), 'other' (input and output processors, skill loading, guardrails etc.) . Added during ingestion based on span.op and gen_ai.operation.type. Used to filter and aggregate data in the UI",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "tool",
			changelog: [{
				version: "0.4.0",
				prs: [257]
			}, {
				version: "0.1.0",
				prs: [113, 127]
			}]
		},
		[GEN_AI_OUTPUT_MESSAGES]: {
			brief: "The model's response messages. It has to be a stringified version of an array of message objects, which can include text responses and tool calls.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "[{\"role\": \"assistant\", \"parts\": [{\"type\": \"text\", \"content\": \"The weather in Paris is currently rainy with a temperature of 57°F.\"}], \"finish_reason\": \"stop\"}]",
			changelog: [{
				version: "0.4.0",
				prs: [221]
			}]
		},
		[GEN_AI_PIPELINE_NAME]: {
			brief: "Name of the AI pipeline or chain being executed.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "Autofix Pipeline",
			aliases: [AI_PIPELINE_NAME],
			changelog: [{
				version: "0.1.0",
				prs: [76, 127]
			}]
		},
		[GEN_AI_PROMPT]: {
			brief: "The input messages sent to the model",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "[{\"role\": \"user\", \"message\": \"hello\"}]",
			deprecation: { reason: "Deprecated from OTEL, use gen_ai.input.messages with the new format instead." },
			changelog: [{
				version: "0.1.0",
				prs: [
					74,
					108,
					119
				]
			}, { version: "0.0.0" }]
		},
		[GEN_AI_PROMPT_NAME]: {
			brief: "The name of the prompt that uniquely identifies it.",
			type: "string",
			pii: {
				isPii: "maybe",
				reason: "Prompt names may reveal user behavior patterns or sensitive operations"
			},
			isInOtel: !0,
			visibility: "public",
			example: "summarize_text",
			aliases: [MCP_PROMPT_NAME],
			changelog: [{
				version: "0.12.0",
				prs: [420],
				description: "Added gen_ai.prompt.name attribute"
			}]
		},
		[GEN_AI_PROVIDER_NAME]: {
			brief: "The Generative AI provider as identified by the client or server instrumentation.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "openai",
			aliases: [AI_MODEL_PROVIDER, GEN_AI_SYSTEM],
			changelog: [{
				version: "0.4.0",
				prs: [253]
			}]
		},
		[GEN_AI_REQUEST_AVAILABLE_TOOLS]: {
			brief: "The available tools for the model. It has to be a stringified version of an array of objects.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "[{\"name\": \"get_weather\", \"description\": \"Get the weather for a given location\"}, {\"name\": \"get_news\", \"description\": \"Get the news for a given topic\"}]",
			deprecation: { replacement: "gen_ai.tool.definitions" },
			changelog: [{
				version: "0.4.0",
				prs: [221]
			}, {
				version: "0.1.0",
				prs: [63, 127]
			}]
		},
		[GEN_AI_REQUEST_FREQUENCY_PENALTY]: {
			brief: "Used to reduce repetitiveness of generated tokens. The higher the value, the stronger a penalty is applied to previously present tokens, proportional to how many times they have already appeared in the prompt or prior generation.",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: .5,
			aliases: [AI_FREQUENCY_PENALTY],
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, {
				version: "0.1.0",
				prs: [57]
			}]
		},
		[GEN_AI_REQUEST_MAX_TOKENS]: {
			brief: "The maximum number of tokens to generate in the response.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: 2048,
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, {
				version: "0.1.0",
				prs: [62]
			}]
		},
		[GEN_AI_REQUEST_MESSAGES]: {
			brief: "The messages passed to the model. It has to be a stringified version of an array of objects. The `role` attribute of each object must be `\"user\"`, `\"assistant\"`, `\"tool\"`, or `\"system\"`. For messages of the role `\"tool\"`, the `content` can be a string or an arbitrary object with information about the tool call. For other messages the `content` can be either a string or a list of objects in the format `{type: \"text\", text:\"...\"}`.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "[{\"role\": \"system\", \"content\": \"Generate a random number.\"}, {\"role\": \"user\", \"content\": [{\"text\": \"Generate a random number between 0 and 10.\", \"type\": \"text\"}]}, {\"role\": \"tool\", \"content\": {\"toolCallId\": \"1\", \"toolName\": \"Weather\", \"output\": \"rainy\"}}]",
			deprecation: { replacement: "gen_ai.input.messages" },
			aliases: [AI_INPUT_MESSAGES],
			changelog: [{
				version: "0.4.0",
				prs: [221]
			}, {
				version: "0.1.0",
				prs: [
					63,
					74,
					108,
					119,
					122
				]
			}]
		},
		[GEN_AI_REQUEST_MODEL]: {
			brief: "The model identifier being used for the request.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "gpt-4-turbo-preview",
			changelog: [{
				version: "0.1.0",
				prs: [62, 127]
			}]
		},
		[GEN_AI_REQUEST_PRESENCE_PENALTY]: {
			brief: "Used to reduce repetitiveness of generated tokens. Similar to frequency_penalty, except that this penalty is applied equally to all tokens that have already appeared, regardless of their exact frequencies.",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: .5,
			aliases: [AI_PRESENCE_PENALTY],
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, {
				version: "0.1.0",
				prs: [57]
			}]
		},
		[GEN_AI_REQUEST_SEED]: {
			brief: "The seed, ideally models given the same seed and same other parameters will produce the exact same output.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "1234567890",
			aliases: [AI_SEED],
			changelog: [{
				version: "0.1.0",
				prs: [57, 127]
			}]
		},
		[GEN_AI_REQUEST_TEMPERATURE]: {
			brief: "For an AI model call, the temperature parameter. Temperature essentially means how random the output will be.",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: .1,
			aliases: [AI_TEMPERATURE],
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, {
				version: "0.1.0",
				prs: [57]
			}]
		},
		[GEN_AI_REQUEST_TOP_K]: {
			brief: "Limits the model to only consider the K most likely next tokens, where K is an integer (e.g., top_k=20 means only the 20 highest probability tokens are considered).",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: 35,
			aliases: [AI_TOP_K],
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, {
				version: "0.1.0",
				prs: [57]
			}]
		},
		[GEN_AI_REQUEST_TOP_P]: {
			brief: "Limits the model to only consider tokens whose cumulative probability mass adds up to p, where p is a float between 0 and 1 (e.g., top_p=0.7 means only tokens that sum up to 70% of the probability mass are considered).",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: .7,
			aliases: [AI_TOP_P],
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, {
				version: "0.1.0",
				prs: [57]
			}]
		},
		[GEN_AI_RESPONSE_FINISH_REASONS]: {
			brief: "The reason why the model stopped generating.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "COMPLETE",
			aliases: [AI_FINISH_REASON],
			changelog: [{
				version: "0.1.0",
				prs: [57, 127]
			}]
		},
		[GEN_AI_RESPONSE_ID]: {
			brief: "Unique identifier for the completion.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "gen_123abc",
			aliases: [AI_GENERATION_ID],
			changelog: [{
				version: "0.1.0",
				prs: [57, 127]
			}]
		},
		[GEN_AI_RESPONSE_MODEL]: {
			brief: "The vendor-specific ID of the model used.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "gpt-4",
			aliases: [AI_MODEL_ID],
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[GEN_AI_RESPONSE_STREAMING]: {
			brief: "Whether or not the AI model call's response was streamed back asynchronously",
			type: "boolean",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: !0,
			aliases: [AI_STREAMING],
			changelog: [{
				version: "0.1.0",
				prs: [76]
			}]
		},
		[GEN_AI_RESPONSE_TEXT]: {
			brief: "The model's response text messages. It has to be a stringified version of an array of response text messages.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "[\"The weather in Paris is rainy and overcast, with temperatures around 57°F\", \"The weather in London is sunny and warm, with temperatures around 65°F\"]",
			deprecation: { replacement: "gen_ai.output.messages" },
			changelog: [{
				version: "0.4.0",
				prs: [221]
			}, {
				version: "0.1.0",
				prs: [63, 74]
			}]
		},
		[GEN_AI_RESPONSE_TIME_TO_FIRST_CHUNK]: {
			brief: "Time in seconds when the first response content chunk arrived in streaming responses.",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: .6853435,
			aliases: [GEN_AI_RESPONSE_TIME_TO_FIRST_TOKEN],
			changelog: [{
				version: "0.11.0",
				prs: [418],
				description: "Added gen_ai.response.time_to_first_chunk attribute"
			}]
		},
		[GEN_AI_RESPONSE_TIME_TO_FIRST_TOKEN]: {
			brief: "Time in seconds when the first response content chunk arrived in streaming responses.",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: .6853435,
			deprecation: { replacement: "gen_ai.response.time_to_first_chunk" },
			aliases: [GEN_AI_RESPONSE_TIME_TO_FIRST_CHUNK],
			changelog: [{
				version: "0.11.0",
				prs: [418],
				description: "Deprecate in favor of gen_ai.response.time_to_first_chunk"
			}, {
				version: "0.4.0",
				prs: [227]
			}]
		},
		[GEN_AI_RESPONSE_TOKENS_PER_SECOND]: {
			brief: "The total output tokens per seconds throughput",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 12345.67,
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, {
				version: "0.1.0",
				prs: [66]
			}]
		},
		[GEN_AI_RESPONSE_TOOL_CALLS]: {
			brief: "The tool calls in the model's response. It has to be a stringified version of an array of objects.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "[{\"name\": \"get_weather\", \"arguments\": {\"location\": \"Paris\"}}]",
			deprecation: { replacement: "gen_ai.output.messages" },
			changelog: [{
				version: "0.4.0",
				prs: [221]
			}, {
				version: "0.1.0",
				prs: [63, 74]
			}]
		},
		[GEN_AI_SYSTEM]: {
			brief: "The provider of the model.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "openai",
			deprecation: { replacement: "gen_ai.provider.name" },
			aliases: [AI_MODEL_PROVIDER, GEN_AI_PROVIDER_NAME],
			changelog: [{
				version: "0.4.0",
				prs: [253]
			}, {
				version: "0.1.0",
				prs: [57, 127]
			}]
		},
		[GEN_AI_SYSTEM_INSTRUCTIONS]: {
			brief: "The system instructions passed to the model.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "You are a helpful assistant",
			aliases: [AI_PREAMBLE],
			changelog: [{
				version: "0.5.0",
				prs: [264]
			}, {
				version: "0.4.0",
				prs: [221]
			}]
		},
		[GEN_AI_SYSTEM_MESSAGE]: {
			brief: "The system instructions passed to the model.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			example: "You are a helpful assistant",
			deprecation: { replacement: "gen_ai.system_instructions" },
			changelog: [{
				version: "0.4.0",
				prs: [221]
			}, {
				version: "0.1.0",
				prs: [62]
			}]
		},
		[GEN_AI_TOOL_CALL_ARGUMENTS]: {
			brief: "The arguments of the tool call. It has to be a stringified version of the arguments to the tool.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "{\"location\": \"Paris\"}",
			aliases: [GEN_AI_TOOL_INPUT],
			changelog: [{
				version: "0.5.0",
				prs: [265]
			}, {
				version: "0.4.0",
				prs: [221]
			}]
		},
		[GEN_AI_TOOL_CALL_RESULT]: {
			brief: "The result of the tool call. It has to be a stringified version of the result of the tool.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "rainy, 57°F",
			aliases: [
				GEN_AI_TOOL_OUTPUT,
				GEN_AI_TOOL_MESSAGE,
				MCP_TOOL_RESULT_CONTENT
			],
			changelog: [{
				version: "0.5.0",
				prs: [265]
			}, {
				version: "0.4.0",
				prs: [221]
			}]
		},
		[GEN_AI_TOOL_DEFINITIONS]: {
			brief: "The list of source system tool definitions available to the GenAI agent or model.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "[{\"type\": \"function\", \"name\": \"get_current_weather\", \"description\": \"Get the current weather in a given location\", \"parameters\": {\"type\": \"object\", \"properties\": {\"location\": {\"type\": \"string\", \"description\": \"The city and state, e.g. San Francisco, CA\"}, \"unit\": {\"type\": \"string\", \"enum\": [\"celsius\", \"fahrenheit\"]}}, \"required\": [\"location\", \"unit\"]}}]",
			changelog: [{
				version: "0.4.0",
				prs: [221]
			}]
		},
		[GEN_AI_TOOL_DESCRIPTION]: {
			brief: "The description of the tool being used.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "Searches the web for current information about a topic",
			changelog: [{
				version: "0.1.0",
				prs: [62, 127]
			}]
		},
		[GEN_AI_TOOL_INPUT]: {
			brief: "The input of the tool being used. It has to be a stringified version of the input to the tool.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "{\"location\": \"Paris\"}",
			deprecation: { replacement: "gen_ai.tool.call.arguments" },
			aliases: [GEN_AI_TOOL_CALL_ARGUMENTS],
			changelog: [{
				version: "0.5.0",
				prs: [265]
			}, {
				version: "0.1.0",
				prs: [63, 74]
			}]
		},
		[GEN_AI_TOOL_MESSAGE]: {
			brief: "The response from a tool or function call passed to the model.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			example: "rainy, 57°F",
			deprecation: { replacement: "gen_ai.tool.call.result" },
			aliases: [
				GEN_AI_TOOL_CALL_RESULT,
				GEN_AI_TOOL_OUTPUT,
				MCP_TOOL_RESULT_CONTENT
			],
			changelog: [{
				version: "0.5.0",
				prs: [265]
			}, {
				version: "0.1.0",
				prs: [62]
			}]
		},
		[GEN_AI_TOOL_NAME]: {
			brief: "Name of the tool utilized by the agent.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "Flights",
			aliases: [AI_FUNCTION_CALL, MCP_TOOL_NAME],
			changelog: [{
				version: "0.1.0",
				prs: [57, 127]
			}]
		},
		[GEN_AI_TOOL_OUTPUT]: {
			brief: "The output of the tool being used. It has to be a stringified version of the output of the tool.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "rainy, 57°F",
			deprecation: { replacement: "gen_ai.tool.call.result" },
			aliases: [
				GEN_AI_TOOL_CALL_RESULT,
				GEN_AI_TOOL_MESSAGE,
				MCP_TOOL_RESULT_CONTENT
			],
			changelog: [{
				version: "0.5.0",
				prs: [265]
			}, {
				version: "0.1.0",
				prs: [63, 74]
			}]
		},
		[GEN_AI_TOOL_TYPE]: {
			brief: "The type of tool being used.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "function",
			deprecation: { reason: "The gen_ai.tool.type attribute is deprecated and should no longer be set." },
			changelog: [{
				version: "0.1.0",
				prs: [62, 127]
			}]
		},
		[GEN_AI_USAGE_CACHE_CREATION_INPUT_TOKENS]: {
			brief: "The number of tokens written to the cache when processing the AI input (prompt).",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: 100,
			aliases: [GEN_AI_USAGE_INPUT_TOKENS_CACHE_WRITE],
			changelog: [{
				version: "0.11.0",
				prs: [418],
				description: "Added gen_ai.usage.cache_creation.input_tokens attribute"
			}],
			additionalContext: ["This attribute appears on both agent parent spans (aggregated totals) and LLM child spans (per-call values). When using sum() to count tokens, filter to gen_ai.operation.type:ai_client to avoid double-counting hierarchical spans."]
		},
		[GEN_AI_USAGE_CACHE_READ_INPUT_TOKENS]: {
			brief: "The number of cached tokens used to process the AI input (prompt).",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: 50,
			aliases: [GEN_AI_USAGE_INPUT_TOKENS_CACHED],
			changelog: [{
				version: "0.11.0",
				prs: [418],
				description: "Added gen_ai.usage.cache_read.input_tokens attribute"
			}],
			additionalContext: ["This attribute appears on both agent parent spans (aggregated totals) and LLM child spans (per-call values). When using sum() to count tokens, filter to gen_ai.operation.type:ai_client to avoid double-counting hierarchical spans.", "This is a subset of gen_ai.usage.input_tokens, not an independent count. Do not sum this with gen_ai.usage.input_tokens — it is already included."]
		},
		[GEN_AI_USAGE_COMPLETION_TOKENS]: {
			brief: "The number of tokens used in the GenAI response (completion).",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: 10,
			deprecation: { replacement: "gen_ai.usage.output_tokens" },
			aliases: [AI_COMPLETION_TOKENS_USED, GEN_AI_USAGE_OUTPUT_TOKENS],
			changelog: [
				{
					version: "0.9.0",
					prs: [397],
					description: "Add additional_context"
				},
				{
					version: "0.4.0",
					prs: [228]
				},
				{
					version: "0.1.0",
					prs: [61]
				},
				{ version: "0.0.0" }
			],
			additionalContext: ["This attribute appears on both agent parent spans (aggregated totals) and LLM child spans (per-call values). When using sum() to count tokens, filter to gen_ai.operation.type:ai_client to avoid double-counting hierarchical spans."]
		},
		[GEN_AI_USAGE_INPUT_TOKENS]: {
			brief: "The number of tokens used to process the AI input (prompt) including cached input tokens.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: 10,
			aliases: [AI_PROMPT_TOKENS_USED, GEN_AI_USAGE_PROMPT_TOKENS],
			changelog: [
				{
					version: "0.11.0",
					prs: [418],
					description: "Update additional_context to reference gen_ai.usage.cache_read.input_tokens"
				},
				{
					version: "0.9.0",
					prs: [397],
					description: "Add additional_context"
				},
				{
					version: "0.5.0",
					prs: [261]
				},
				{
					version: "0.4.0",
					prs: [228]
				},
				{
					version: "0.1.0",
					prs: [112]
				},
				{ version: "0.0.0" }
			],
			additionalContext: ["This attribute appears on both agent parent spans (aggregated totals) and LLM child spans (per-call values). When using sum() to count tokens, filter to gen_ai.operation.type:ai_client to avoid double-counting hierarchical spans.", "This count includes cached input tokens. gen_ai.usage.cache_read.input_tokens is a subset of this value, not an independent count — do not sum them together."]
		},
		[GEN_AI_USAGE_INPUT_TOKENS_CACHED]: {
			brief: "The number of cached tokens used to process the AI input (prompt).",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 50,
			deprecation: { replacement: "gen_ai.usage.cache_read.input_tokens" },
			aliases: [GEN_AI_USAGE_CACHE_READ_INPUT_TOKENS],
			changelog: [
				{
					version: "0.11.0",
					prs: [418],
					description: "Deprecate in favor of gen_ai.usage.cache_read.input_tokens"
				},
				{
					version: "0.9.0",
					prs: [397],
					description: "Add additional_context"
				},
				{
					version: "0.4.0",
					prs: [228]
				},
				{
					version: "0.1.0",
					prs: [62, 112]
				}
			],
			additionalContext: ["This attribute appears on both agent parent spans (aggregated totals) and LLM child spans (per-call values). When using sum() to count tokens, filter to gen_ai.operation.type:ai_client to avoid double-counting hierarchical spans.", "This is a subset of gen_ai.usage.input_tokens, not an independent count. Do not sum this with gen_ai.usage.input_tokens — it is already included."]
		},
		[GEN_AI_USAGE_INPUT_TOKENS_CACHE_WRITE]: {
			brief: "The number of tokens written to the cache when processing the AI input (prompt).",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 100,
			deprecation: { replacement: "gen_ai.usage.cache_creation.input_tokens" },
			aliases: [GEN_AI_USAGE_CACHE_CREATION_INPUT_TOKENS],
			changelog: [
				{
					version: "0.11.0",
					prs: [418],
					description: "Deprecate in favor of gen_ai.usage.cache_creation.input_tokens"
				},
				{
					version: "0.9.0",
					prs: [397],
					description: "Add additional_context"
				},
				{
					version: "0.4.0",
					prs: [217, 228]
				}
			],
			additionalContext: ["This attribute appears on both agent parent spans (aggregated totals) and LLM child spans (per-call values). When using sum() to count tokens, filter to gen_ai.operation.type:ai_client to avoid double-counting hierarchical spans."]
		},
		[GEN_AI_USAGE_OUTPUT_TOKENS]: {
			brief: "The number of tokens used for creating the AI output (including reasoning tokens).",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: 10,
			aliases: [AI_COMPLETION_TOKENS_USED, GEN_AI_USAGE_COMPLETION_TOKENS],
			changelog: [
				{
					version: "0.11.0",
					prs: [418],
					description: "Update additional_context to reference gen_ai.usage.reasoning.output_tokens"
				},
				{
					version: "0.9.0",
					prs: [397],
					description: "Add additional_context"
				},
				{
					version: "0.5.0",
					prs: [261]
				},
				{
					version: "0.4.0",
					prs: [228]
				},
				{
					version: "0.1.0",
					prs: [112]
				},
				{ version: "0.0.0" }
			],
			additionalContext: ["This attribute appears on both agent parent spans (aggregated totals) and LLM child spans (per-call values). When using sum() to count tokens, filter to gen_ai.operation.type:ai_client to avoid double-counting hierarchical spans.", "This count includes reasoning tokens. gen_ai.usage.reasoning.output_tokens is a subset of this value, not an independent count — do not sum them together."]
		},
		[GEN_AI_USAGE_OUTPUT_TOKENS_REASONING]: {
			brief: "The number of tokens used for reasoning to create the AI output.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 75,
			deprecation: { replacement: "gen_ai.usage.reasoning.output_tokens" },
			aliases: [GEN_AI_USAGE_REASONING_OUTPUT_TOKENS],
			changelog: [
				{
					version: "0.11.0",
					prs: [418],
					description: "Deprecate in favor of gen_ai.usage.reasoning.output_tokens"
				},
				{
					version: "0.9.0",
					prs: [397],
					description: "Add additional_context"
				},
				{
					version: "0.4.0",
					prs: [228]
				},
				{
					version: "0.1.0",
					prs: [62, 112]
				}
			],
			additionalContext: ["This attribute appears on both agent parent spans (aggregated totals) and LLM child spans (per-call values). When using sum() to count tokens, filter to gen_ai.operation.type:ai_client to avoid double-counting hierarchical spans.", "This is a subset of gen_ai.usage.output_tokens, not an independent count. Do not sum this with gen_ai.usage.output_tokens — it is already included."]
		},
		[GEN_AI_USAGE_PROMPT_TOKENS]: {
			brief: "The number of tokens used in the GenAI input (prompt).",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: 20,
			deprecation: { replacement: "gen_ai.usage.input_tokens" },
			aliases: [AI_PROMPT_TOKENS_USED, GEN_AI_USAGE_INPUT_TOKENS],
			changelog: [
				{
					version: "0.9.0",
					prs: [397],
					description: "Add additional_context"
				},
				{
					version: "0.4.0",
					prs: [228]
				},
				{
					version: "0.1.0",
					prs: [61]
				},
				{ version: "0.0.0" }
			],
			additionalContext: ["This attribute appears on both agent parent spans (aggregated totals) and LLM child spans (per-call values). When using sum() to count tokens, filter to gen_ai.operation.type:ai_client to avoid double-counting hierarchical spans."]
		},
		[GEN_AI_USAGE_REASONING_OUTPUT_TOKENS]: {
			brief: "The number of tokens used for reasoning to create the AI output.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: 75,
			aliases: [GEN_AI_USAGE_OUTPUT_TOKENS_REASONING],
			changelog: [{
				version: "0.11.0",
				prs: [418],
				description: "Added gen_ai.usage.reasoning.output_tokens attribute"
			}],
			additionalContext: ["This attribute appears on both agent parent spans (aggregated totals) and LLM child spans (per-call values). When using sum() to count tokens, filter to gen_ai.operation.type:ai_client to avoid double-counting hierarchical spans.", "This is a subset of gen_ai.usage.output_tokens, not an independent count. Do not sum this with gen_ai.usage.output_tokens — it is already included."]
		},
		[GEN_AI_USAGE_TOTAL_TOKENS]: {
			brief: "The total number of tokens used to process the prompt. (input tokens plus output todkens)",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 20,
			aliases: [AI_TOTAL_TOKENS_USED],
			changelog: [
				{
					version: "0.9.0",
					prs: [397],
					description: "Add additional_context"
				},
				{
					version: "0.4.0",
					prs: [228]
				},
				{
					version: "0.1.0",
					prs: [57]
				}
			],
			additionalContext: ["This attribute appears on both agent parent spans (aggregated totals) and LLM child spans (per-call values). When using sum() to count tokens, filter to gen_ai.operation.type:ai_client to avoid double-counting hierarchical spans.", "This is the sum of gen_ai.usage.input_tokens and gen_ai.usage.output_tokens. Do not sum this with either of them — they are already included."]
		},
		[GRAPHQL_DOCUMENT]: {
			brief: "The GraphQL document being executed.",
			type: "string",
			pii: {
				isPii: "true",
				reason: "The document may contain sensitive information in arguments or variables. Instrumentation should redact sensitive information when possible."
			},
			isInOtel: !0,
			visibility: "public",
			example: "query findBookById { bookById(id: ?) { name } }",
			changelog: [{
				version: "0.7.0",
				description: "Adds the `graphql.document` attribute to track the GraphQL document being executed."
			}]
		},
		[GRAPHQL_OPERATION_NAME]: {
			brief: "The name of the operation being executed.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "findBookById",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[GRAPHQL_OPERATION_TYPE]: {
			brief: "The type of the operation being executed.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "query",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[HARDWARECONCURRENCY]: {
			brief: "The number of logical CPU cores available.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "14",
			deprecation: {
				replacement: "device.processor_count",
				reason: "Old namespace-less attribute, to be replaced with device.processor_count for span-first future"
			},
			aliases: [DEVICE_PROCESSOR_COUNT],
			changelog: [{
				version: "0.5.0",
				prs: [281, 300],
				description: "Added and deprecated attribute to document JS SDK's current behaviour"
			}]
		},
		[HTTP_CLIENT_IP]: {
			brief: "Client address - domain name if available without reverse DNS lookup; otherwise, IP address or Unix domain socket name.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !0,
			visibility: "public",
			example: "example.com",
			deprecation: { replacement: "client.address" },
			aliases: [CLIENT_ADDRESS],
			changelog: [{
				version: "0.1.0",
				prs: [
					61,
					106,
					127
				]
			}, { version: "0.0.0" }]
		},
		[HTTP_DECODED_RESPONSE_CONTENT_LENGTH]: {
			brief: "The decoded body size of the response (in bytes).",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 456,
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, { version: "0.0.0" }]
		},
		[HTTP_FLAVOR]: {
			brief: "The actual version of the protocol used for network communication.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "1.1",
			deprecation: { replacement: "network.protocol.version" },
			aliases: [NETWORK_PROTOCOL_VERSION, NET_PROTOCOL_VERSION],
			changelog: [{
				version: "0.1.0",
				prs: [
					61,
					108,
					127
				]
			}, { version: "0.0.0" }]
		},
		[HTTP_FRAGMENT]: {
			brief: "The fragments present in the URI. Note that this contains the leading # character, while the `url.fragment` attribute does not.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			example: "#details",
			changelog: [{ version: "0.0.0" }]
		},
		[HTTP_HOST]: {
			brief: "The domain name.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "example.com",
			deprecation: {
				replacement: "server.address",
				reason: "Deprecated, use one of `server.address` or `client.address`, depending on the usage"
			},
			aliases: [
				SERVER_ADDRESS,
				CLIENT_ADDRESS,
				HTTP_SERVER_NAME,
				NET_HOST_NAME
			],
			changelog: [{
				version: "0.1.0",
				prs: [
					61,
					108,
					127
				]
			}, { version: "0.0.0" }]
		},
		[HTTP_METHOD]: {
			brief: "The HTTP method used.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "GET",
			deprecation: { replacement: "http.request.method" },
			aliases: [
				HTTP_REQUEST_METHOD,
				_HTTP_REQUEST_METHOD,
				METHOD
			],
			changelog: [{
				version: "0.1.0",
				prs: [61, 127]
			}, { version: "0.0.0" }]
		},
		[HTTP_QUERY]: {
			brief: "The query string present in the URL. Note that this contains the leading ? character, while the `url.query` attribute does not.",
			type: "string",
			pii: {
				isPii: "true",
				reason: "Query string values can contain sensitive information. Clients should attempt to scrub parameters that might contain sensitive information."
			},
			isInOtel: !1,
			visibility: "public",
			example: "?foo=bar&bar=baz",
			changelog: [{ version: "0.0.0" }]
		},
		[HTTP_REQUEST_BODY_DATA]: {
			brief: "HTTP request body data. Can be given as string or structural data of any format.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			example: "[{\"role\": \"user\", \"message\": \"hello\"}]",
			changelog: [{
				version: "0.6.0",
				prs: [336],
				description: "Added http.request.body.data attribute"
			}]
		},
		[HTTP_REQUEST_CONNECTION_END]: {
			brief: "The UNIX timestamp representing the time immediately after the browser finishes establishing the connection to the server to retrieve the resource. The timestamp value includes the time interval to establish the transport connection, as well as other time intervals such as TLS handshake and SOCKS authentication.",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1732829555.15,
			changelog: [
				{
					version: "0.4.0",
					prs: [228]
				},
				{
					version: "0.1.0",
					prs: [134]
				},
				{ version: "0.0.0" }
			]
		},
		[HTTP_REQUEST_CONNECT_START]: {
			brief: "The UNIX timestamp representing the time immediately before the user agent starts establishing the connection to the server to retrieve the resource.",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1732829555.111,
			changelog: [
				{
					version: "0.4.0",
					prs: [228]
				},
				{
					version: "0.1.0",
					prs: [134]
				},
				{ version: "0.0.0" }
			]
		},
		[HTTP_REQUEST_DOMAIN_LOOKUP_END]: {
			brief: "The UNIX timestamp representing the time immediately after the browser finishes the domain-name lookup for the resource.",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1732829555.201,
			changelog: [
				{
					version: "0.4.0",
					prs: [228]
				},
				{
					version: "0.1.0",
					prs: [134]
				},
				{ version: "0.0.0" }
			]
		},
		[HTTP_REQUEST_DOMAIN_LOOKUP_START]: {
			brief: "The UNIX timestamp representing the time immediately before the browser starts the domain name lookup for the resource.",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1732829555.322,
			changelog: [
				{
					version: "0.4.0",
					prs: [228]
				},
				{
					version: "0.1.0",
					prs: [134]
				},
				{ version: "0.0.0" }
			]
		},
		[HTTP_REQUEST_FETCH_START]: {
			brief: "The UNIX timestamp representing the time immediately before the browser starts to fetch the resource.",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1732829555.389,
			changelog: [
				{
					version: "0.4.0",
					prs: [228]
				},
				{
					version: "0.1.0",
					prs: [134]
				},
				{ version: "0.0.0" }
			]
		},
		[HTTP_REQUEST_HEADER_KEY]: {
			brief: "HTTP request headers, <key> being the normalized HTTP Header name (lowercase), the value being the header values.",
			type: "string[]",
			pii: { isPii: "true" },
			isInOtel: !0,
			visibility: "public",
			hasDynamicSuffix: !0,
			example: "http.request.header.custom-header=['foo', 'bar']",
			changelog: [{
				version: "0.4.0",
				prs: [201, 204]
			}, {
				version: "0.1.0",
				prs: [103]
			}]
		},
		[HTTP_REQUEST_METHOD]: {
			brief: "The HTTP method used.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "GET",
			aliases: [
				METHOD,
				HTTP_METHOD,
				_HTTP_REQUEST_METHOD
			],
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[_HTTP_REQUEST_METHOD]: {
			brief: "The HTTP method used.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "GET",
			deprecation: { replacement: "http.request.method" },
			aliases: [
				METHOD,
				HTTP_METHOD,
				HTTP_REQUEST_METHOD
			],
			changelog: [{
				version: "0.6.0",
				prs: [343],
				description: "Added http.request_method attribute"
			}]
		},
		[HTTP_REQUEST_REDIRECT_END]: {
			brief: "The UNIX timestamp representing the timestamp immediately after receiving the last byte of the response of the last redirect",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1732829558.502,
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, {
				version: "0.1.0",
				prs: [130, 134]
			}]
		},
		[HTTP_REQUEST_REDIRECT_START]: {
			brief: "The UNIX timestamp representing the start time of the fetch which that initiates the redirect.",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1732829555.495,
			changelog: [
				{
					version: "0.4.0",
					prs: [228]
				},
				{
					version: "0.1.0",
					prs: [134]
				},
				{ version: "0.0.0" }
			]
		},
		[HTTP_REQUEST_REQUEST_START]: {
			brief: "The UNIX timestamp representing the time immediately before the browser starts requesting the resource from the server, cache, or local resource. If the transport connection fails and the browser retires the request, the value returned will be the start of the retry request.",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1732829555.51,
			changelog: [
				{
					version: "0.4.0",
					prs: [228]
				},
				{
					version: "0.1.0",
					prs: [134]
				},
				{ version: "0.0.0" }
			]
		},
		[HTTP_REQUEST_RESEND_COUNT]: {
			brief: "The ordinal number of request resending attempt (for any reason, including redirects).",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 2,
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, { version: "0.0.0" }]
		},
		[HTTP_REQUEST_RESPONSE_END]: {
			brief: "The UNIX timestamp representing the time immediately after the browser receives the last byte of the resource or immediately before the transport connection is closed, whichever comes first.",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1732829555.89,
			changelog: [
				{
					version: "0.4.0",
					prs: [228]
				},
				{
					version: "0.1.0",
					prs: [134]
				},
				{ version: "0.0.0" }
			]
		},
		[HTTP_REQUEST_RESPONSE_START]: {
			brief: "The UNIX timestamp representing the time immediately before the browser starts requesting the resource from the server, cache, or local resource. If the transport connection fails and the browser retires the request, the value returned will be the start of the retry request.",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1732829555.7,
			changelog: [
				{
					version: "0.4.0",
					prs: [228]
				},
				{
					version: "0.1.0",
					prs: [134]
				},
				{ version: "0.0.0" }
			]
		},
		[HTTP_REQUEST_SECURE_CONNECTION_START]: {
			brief: "The UNIX timestamp representing the time immediately before the browser starts the handshake process to secure the current connection. If a secure connection is not used, the property returns zero.",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1732829555.73,
			changelog: [
				{
					version: "0.4.0",
					prs: [228]
				},
				{
					version: "0.1.0",
					prs: [134]
				},
				{ version: "0.0.0" }
			]
		},
		[HTTP_REQUEST_TIME_TO_FIRST_BYTE]: {
			brief: "The time in seconds from the browser's timeorigin to when the first byte of the request's response was received. See https://web.dev/articles/ttfb#measure-resource-requests",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1.032,
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, {
				version: "0.1.0",
				prs: [131]
			}]
		},
		[HTTP_REQUEST_WORKER_START]: {
			brief: "The UNIX timestamp representing the timestamp immediately before dispatching the FetchEvent if a Service Worker thread is already running, or immediately before starting the Service Worker thread if it is not already running.",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1732829553.68,
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, {
				version: "0.1.0",
				prs: [130, 134]
			}]
		},
		[HTTP_RESPONSE_BODY_SIZE]: {
			brief: "The encoded body size of the response (in bytes).",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: 123,
			aliases: [HTTP_RESPONSE_CONTENT_LENGTH, HTTP_RESPONSE_HEADER_CONTENT_LENGTH],
			changelog: [
				{
					version: "0.4.0",
					prs: [228]
				},
				{
					version: "0.1.0",
					prs: [106]
				},
				{ version: "0.0.0" }
			]
		},
		[HTTP_RESPONSE_CONTENT_LENGTH]: {
			brief: "The encoded body size of the response (in bytes).",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: 123,
			deprecation: { replacement: "http.response.body.size" },
			aliases: [HTTP_RESPONSE_BODY_SIZE, HTTP_RESPONSE_HEADER_CONTENT_LENGTH],
			changelog: [
				{
					version: "0.4.0",
					prs: [228]
				},
				{
					version: "0.1.0",
					prs: [61, 106]
				},
				{ version: "0.0.0" }
			]
		},
		[HTTP_RESPONSE_HEADER_CONTENT_LENGTH]: {
			brief: "The size of the message body sent to the recipient (in bytes)",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "http.response.header.custom-header=['foo', 'bar']",
			aliases: [HTTP_RESPONSE_CONTENT_LENGTH, HTTP_RESPONSE_BODY_SIZE],
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[HTTP_RESPONSE_HEADER_KEY]: {
			brief: "HTTP response headers, <key> being the normalized HTTP Header name (lowercase), the value being the header values.",
			type: "string[]",
			pii: { isPii: "true" },
			isInOtel: !0,
			visibility: "public",
			hasDynamicSuffix: !0,
			example: "http.response.header.custom-header=['foo', 'bar']",
			changelog: [{
				version: "0.4.0",
				prs: [201, 204]
			}, {
				version: "0.1.0",
				prs: [103]
			}]
		},
		[HTTP_RESPONSE_SIZE]: {
			brief: "The transfer size of the response (in bytes).",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: 456,
			aliases: [HTTP_RESPONSE_TRANSFER_SIZE],
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, { version: "0.0.0" }]
		},
		[HTTP_RESPONSE_STATUS_CODE]: {
			brief: "The status code of the HTTP response.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: 404,
			aliases: [HTTP_STATUS_CODE],
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, { version: "0.0.0" }]
		},
		[HTTP_RESPONSE_TRANSFER_SIZE]: {
			brief: "The transfer size of the response (in bytes).",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 456,
			deprecation: { replacement: "http.response.size" },
			aliases: [HTTP_RESPONSE_SIZE],
			changelog: [
				{
					version: "0.4.0",
					prs: [228]
				},
				{
					version: "0.1.0",
					prs: [61]
				},
				{ version: "0.0.0" }
			]
		},
		[HTTP_ROUTE]: {
			brief: "The matched route, that is, the path template in the format used by the respective server framework.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "/users/:id",
			aliases: [URL_TEMPLATE],
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[HTTP_SCHEME]: {
			brief: "The URI scheme component identifying the used protocol.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "https",
			deprecation: { replacement: "url.scheme" },
			aliases: [URL_SCHEME],
			changelog: [{
				version: "0.1.0",
				prs: [61, 127]
			}, { version: "0.0.0" }]
		},
		[HTTP_SERVER_NAME]: {
			brief: "The server domain name",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "example.com",
			deprecation: { replacement: "server.address" },
			aliases: [
				SERVER_ADDRESS,
				NET_HOST_NAME,
				HTTP_HOST
			],
			changelog: [{
				version: "0.1.0",
				prs: [
					61,
					108,
					127
				]
			}, { version: "0.0.0" }]
		},
		[HTTP_SERVER_REQUEST_TIME_IN_QUEUE]: {
			brief: "The time in milliseconds the request spent in the server queue before processing began. Measured from the X-Request-Start header set by reverse proxies (e.g., Nginx, HAProxy, Heroku) to when the application started handling the request.",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 50,
			changelog: [{
				version: "0.5.0",
				prs: [267]
			}]
		},
		[HTTP_STATUS_CODE]: {
			brief: "The status code of the HTTP response.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: 404,
			deprecation: { replacement: "http.response.status_code" },
			aliases: [HTTP_RESPONSE_STATUS_CODE],
			changelog: [
				{
					version: "0.4.0",
					prs: [228]
				},
				{
					version: "0.1.0",
					prs: [61]
				},
				{ version: "0.0.0" }
			]
		},
		[HTTP_TARGET]: {
			brief: "The pathname and query string of the URL.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !0,
			visibility: "public",
			example: "/test?foo=bar#buzz",
			deprecation: {
				replacement: "url.path",
				reason: "This attribute is being deprecated in favor of url.path and url.query"
			},
			changelog: [{
				version: "0.1.0",
				prs: [61]
			}, { version: "0.0.0" }]
		},
		[HTTP_URL]: {
			brief: "The URL of the resource that was fetched.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !0,
			visibility: "public",
			example: "https://example.com/test?foo=bar#buzz",
			deprecation: { replacement: "url.full" },
			aliases: [URL_FULL, URL],
			changelog: [{
				version: "0.1.0",
				prs: [61, 108]
			}, { version: "0.0.0" }]
		},
		[HTTP_USER_AGENT]: {
			brief: "Value of the HTTP User-Agent header sent by the client.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1",
			deprecation: { replacement: "user_agent.original" },
			aliases: [USER_AGENT_ORIGINAL],
			changelog: [{
				version: "0.1.0",
				prs: [61, 127]
			}, { version: "0.0.0" }]
		},
		[ID]: {
			brief: "A unique identifier for the span.",
			type: "string",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "public",
			example: "f47ac10b58cc4372a5670e02b2c3d479",
			changelog: [{ version: "0.0.0" }]
		},
		[INP]: {
			brief: "The value of the recorded Interaction to Next Paint (INP) web vital",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 200,
			deprecation: {
				replacement: "browser.web_vital.inp.value",
				reason: "The INP web vital is now recorded as a browser.web_vital.inp.value attribute."
			},
			aliases: [BROWSER_WEB_VITAL_INP_VALUE],
			changelog: [{
				version: "0.5.0",
				prs: [229],
				description: "Added and deprecated attribute to document JS SDK's current behaviour"
			}]
		},
		[JSONRPC_PROTOCOL_VERSION]: {
			brief: "The version of the JSON-RPC protocol used.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "2.0",
			changelog: [{
				version: "0.12.0",
				prs: [420],
				description: "Added jsonrpc.protocol.version attribute"
			}]
		},
		[JSONRPC_REQUEST_ID]: {
			brief: "The JSON-RPC request identifier. Unique within the session.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "1",
			aliases: [MCP_REQUEST_ID],
			changelog: [{
				version: "0.12.0",
				prs: [420],
				description: "Added jsonrpc.request.id attribute"
			}]
		},
		[JVM_GC_ACTION]: {
			brief: "Name of the garbage collector action.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "end of minor GC",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[JVM_GC_NAME]: {
			brief: "Name of the garbage collector.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "G1 Young Generation",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[JVM_MEMORY_POOL_NAME]: {
			brief: "Name of the memory pool.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "G1 Old Gen",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[JVM_MEMORY_TYPE]: {
			brief: "Name of the memory pool.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "G1 Old Gen",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[JVM_THREAD_DAEMON]: {
			brief: "Whether the thread is daemon or not.",
			type: "boolean",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: !0,
			changelog: [{ version: "0.0.0" }]
		},
		[JVM_THREAD_STATE]: {
			brief: "State of the thread.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "blocked",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[LCP]: {
			brief: "The value of the recorded Largest Contentful Paint (LCP) web vital",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 2500,
			deprecation: {
				replacement: "browser.web_vital.lcp.value",
				reason: "The LCP web vital is now recorded as a browser.web_vital.lcp.value attribute."
			},
			aliases: [BROWSER_WEB_VITAL_LCP_VALUE],
			changelog: [{
				version: "0.5.0",
				prs: [229],
				description: "Added and deprecated attribute to document JS SDK's current behaviour"
			}]
		},
		[LCP_ELEMENT]: {
			brief: "The dom element responsible for the largest contentful paint.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "img",
			deprecation: {
				replacement: "browser.web_vital.lcp.element",
				reason: "The LCP element is now recorded as a browser.web_vital.lcp.element attribute."
			},
			aliases: [BROWSER_WEB_VITAL_LCP_ELEMENT],
			changelog: [
				{
					version: "0.5.0",
					prs: [233]
				},
				{
					version: "0.1.0",
					prs: [127]
				},
				{ version: "0.0.0" }
			]
		},
		[LCP_ID]: {
			brief: "The id of the dom element responsible for the largest contentful paint.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "#hero",
			deprecation: {
				replacement: "browser.web_vital.lcp.id",
				reason: "The LCP id is now recorded as a browser.web_vital.lcp.id attribute."
			},
			aliases: [BROWSER_WEB_VITAL_LCP_ID],
			changelog: [
				{
					version: "0.5.0",
					prs: [233]
				},
				{
					version: "0.1.0",
					prs: [127]
				},
				{ version: "0.0.0" }
			]
		},
		[LCP_LOADTIME]: {
			brief: "The time it took for the LCP element to be loaded",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1402,
			deprecation: {
				replacement: "browser.web_vital.lcp.load_time",
				reason: "The LCP load time is now recorded as a browser.web_vital.lcp.load_time attribute."
			},
			aliases: [BROWSER_WEB_VITAL_LCP_LOAD_TIME],
			changelog: [{
				version: "0.5.0",
				prs: [233]
			}]
		},
		[LCP_RENDERTIME]: {
			brief: "The time it took for the LCP element to be rendered",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1685,
			deprecation: {
				replacement: "browser.web_vital.lcp.render_time",
				reason: "The LCP render time is now recorded as a browser.web_vital.lcp.render_time attribute."
			},
			aliases: [BROWSER_WEB_VITAL_LCP_RENDER_TIME],
			changelog: [{
				version: "0.5.0",
				prs: [233]
			}]
		},
		[LCP_SIZE]: {
			brief: "The size of the largest contentful paint element.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1234,
			deprecation: {
				replacement: "browser.web_vital.lcp.size",
				reason: "The LCP size is now recorded as a browser.web_vital.lcp.size attribute."
			},
			aliases: [BROWSER_WEB_VITAL_LCP_SIZE],
			changelog: [
				{
					version: "0.5.0",
					prs: [233]
				},
				{
					version: "0.4.0",
					prs: [228]
				},
				{ version: "0.0.0" }
			]
		},
		[LCP_URL]: {
			brief: "The url of the dom element responsible for the largest contentful paint.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			example: "https://example.com",
			deprecation: {
				replacement: "browser.web_vital.lcp.url",
				reason: "The LCP url is now recorded as a browser.web_vital.lcp.url attribute."
			},
			aliases: [BROWSER_WEB_VITAL_LCP_URL],
			changelog: [
				{
					version: "0.5.0",
					prs: [233]
				},
				{
					version: "0.1.0",
					prs: [127]
				},
				{ version: "0.0.0" }
			]
		},
		[LOGGER_NAME]: {
			brief: "The name of the logger that generated this event.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "myLogger",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[MCP_CANCELLED_REASON]: {
			brief: "Reason for the cancellation of an MCP operation.",
			type: "string",
			pii: {
				isPii: "maybe",
				reason: "Cancellation reasons may contain user-specific or sensitive information"
			},
			isInOtel: !1,
			visibility: "public",
			example: "User cancelled the request",
			changelog: [{
				version: "0.3.0",
				prs: [171]
			}]
		},
		[MCP_CANCELLED_REQUEST_ID]: {
			brief: "Request ID of the cancelled MCP operation.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "123",
			changelog: [{
				version: "0.3.0",
				prs: [171]
			}]
		},
		[MCP_CLIENT_NAME]: {
			brief: "Name of the MCP client application.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "claude-desktop",
			changelog: [{
				version: "0.3.0",
				prs: [171]
			}]
		},
		[MCP_CLIENT_TITLE]: {
			brief: "Display title of the MCP client application.",
			type: "string",
			pii: {
				isPii: "maybe",
				reason: "Client titles may reveal user-specific application configurations or custom setups"
			},
			isInOtel: !1,
			visibility: "public",
			example: "Claude Desktop",
			changelog: [{
				version: "0.3.0",
				prs: [171]
			}]
		},
		[MCP_CLIENT_VERSION]: {
			brief: "Version of the MCP client application.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "1.0.0",
			changelog: [{
				version: "0.3.0",
				prs: [171]
			}]
		},
		[MCP_LIFECYCLE_PHASE]: {
			brief: "Lifecycle phase indicator for MCP operations.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "initialization_complete",
			changelog: [{
				version: "0.3.0",
				prs: [171]
			}]
		},
		[MCP_LOGGING_DATA_TYPE]: {
			brief: "Data type of the logged message content.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "string",
			changelog: [{
				version: "0.3.0",
				prs: [171]
			}]
		},
		[MCP_LOGGING_LEVEL]: {
			brief: "Log level for MCP logging operations.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "info",
			changelog: [{
				version: "0.3.0",
				prs: [171]
			}]
		},
		[MCP_LOGGING_LOGGER]: {
			brief: "Logger name for MCP logging operations.",
			type: "string",
			pii: {
				isPii: "maybe",
				reason: "Logger names may be user-defined and could contain sensitive information"
			},
			isInOtel: !1,
			visibility: "public",
			example: "mcp_server",
			changelog: [{
				version: "0.3.0",
				prs: [171]
			}]
		},
		[MCP_LOGGING_MESSAGE]: {
			brief: "Log message content from MCP logging operations.",
			type: "string",
			pii: {
				isPii: "true",
				reason: "Log messages can contain user data"
			},
			isInOtel: !1,
			visibility: "public",
			example: "Tool execution completed successfully",
			changelog: [{
				version: "0.3.0",
				prs: [171]
			}]
		},
		[MCP_METHOD_NAME]: {
			brief: "The name of the MCP request or notification method being called.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "tools/call",
			changelog: [{
				version: "0.12.0",
				prs: [420],
				description: "Set is_in_otel=true, attribute exists in OTel MCP registry"
			}, {
				version: "0.3.0",
				prs: [171]
			}]
		},
		[MCP_PROGRESS_CURRENT]: {
			brief: "Current progress value of an MCP operation.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 50,
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, {
				version: "0.3.0",
				prs: [171]
			}]
		},
		[MCP_PROGRESS_MESSAGE]: {
			brief: "Progress message describing the current state of an MCP operation.",
			type: "string",
			pii: {
				isPii: "maybe",
				reason: "Progress messages may contain user-specific or sensitive information"
			},
			isInOtel: !1,
			visibility: "public",
			example: "Processing 50 of 100 items",
			changelog: [{
				version: "0.3.0",
				prs: [171]
			}]
		},
		[MCP_PROGRESS_PERCENTAGE]: {
			brief: "Calculated progress percentage of an MCP operation. Computed from current/total * 100.",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 50,
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, {
				version: "0.3.0",
				prs: [171]
			}]
		},
		[MCP_PROGRESS_TOKEN]: {
			brief: "Token for tracking progress of an MCP operation.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "progress-token-123",
			changelog: [{
				version: "0.3.0",
				prs: [171]
			}]
		},
		[MCP_PROGRESS_TOTAL]: {
			brief: "Total progress target value of an MCP operation.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 100,
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, {
				version: "0.3.0",
				prs: [171]
			}]
		},
		[MCP_PROMPT_NAME]: {
			brief: "Name of the MCP prompt template being used.",
			type: "string",
			pii: {
				isPii: "maybe",
				reason: "Prompt names may reveal user behavior patterns or sensitive operations"
			},
			isInOtel: !1,
			visibility: "public",
			example: "summarize",
			deprecation: {
				replacement: "gen_ai.prompt.name",
				reason: "OTel uses gen_ai.prompt.name for MCP prompt names"
			},
			aliases: [GEN_AI_PROMPT_NAME],
			changelog: [{
				version: "0.12.0",
				prs: [420],
				description: "Deprecated in favor of gen_ai.prompt.name"
			}, {
				version: "0.3.0",
				prs: [171]
			}]
		},
		[MCP_PROMPT_RESULT_DESCRIPTION]: {
			brief: "Description of the prompt result.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			example: "A summary of the requested information",
			changelog: [{
				version: "0.3.0",
				prs: [171]
			}]
		},
		[MCP_PROMPT_RESULT_MESSAGE_CONTENT]: {
			brief: "Content of the message in the prompt result. Used for single message results only.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			example: "Please provide a summary of the document",
			changelog: [{
				version: "0.3.0",
				prs: [171]
			}]
		},
		[MCP_PROMPT_RESULT_MESSAGE_COUNT]: {
			brief: "Number of messages in the prompt result.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 3,
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, {
				version: "0.3.0",
				prs: [171]
			}]
		},
		[MCP_PROMPT_RESULT_MESSAGE_ROLE]: {
			brief: "Role of the message in the prompt result. Used for single message results only.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "user",
			changelog: [{
				version: "0.3.0",
				prs: [171]
			}]
		},
		[MCP_PROTOCOL_READY]: {
			brief: "Protocol readiness indicator for MCP session. Non-zero value indicates the protocol is ready.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1,
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, {
				version: "0.3.0",
				prs: [171]
			}]
		},
		[MCP_PROTOCOL_VERSION]: {
			brief: "MCP protocol version used in the session.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "2024-11-05",
			changelog: [{
				version: "0.12.0",
				prs: [420],
				description: "Set is_in_otel=true, attribute exists in OTel MCP registry"
			}, {
				version: "0.3.0",
				prs: [171]
			}]
		},
		[MCP_REQUEST_ARGUMENT_KEY]: {
			brief: "MCP request argument with dynamic key suffix. The <key> is replaced with the actual argument name. The value is a JSON-stringified representation of the argument value.",
			type: "string",
			pii: {
				isPii: "true",
				reason: "Arguments contain user input"
			},
			isInOtel: !1,
			visibility: "public",
			hasDynamicSuffix: !0,
			example: "mcp.request.argument.query='weather in Paris'",
			changelog: [{
				version: "0.3.0",
				prs: [176]
			}]
		},
		[MCP_REQUEST_ARGUMENT_NAME]: {
			brief: "Name argument from prompts/get MCP request.",
			type: "string",
			pii: {
				isPii: "true",
				reason: "Prompt names can contain user input"
			},
			isInOtel: !1,
			visibility: "public",
			example: "summarize",
			changelog: [{
				version: "0.3.0",
				prs: [171]
			}]
		},
		[MCP_REQUEST_ARGUMENT_URI]: {
			brief: "URI argument from resources/read MCP request.",
			type: "string",
			pii: {
				isPii: "true",
				reason: "URIs can contain user file paths"
			},
			isInOtel: !1,
			visibility: "public",
			example: "file:///path/to/resource",
			changelog: [{
				version: "0.3.0",
				prs: [171]
			}]
		},
		[MCP_REQUEST_ID]: {
			brief: "JSON-RPC request identifier for the MCP request. Unique within the MCP session.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "1",
			deprecation: {
				replacement: "jsonrpc.request.id",
				reason: "OTel models MCP as JSON-RPC, uses jsonrpc.request.id"
			},
			aliases: [JSONRPC_REQUEST_ID],
			changelog: [{
				version: "0.12.0",
				prs: [420],
				description: "Deprecated in favor of jsonrpc.request.id"
			}, {
				version: "0.3.0",
				prs: [171]
			}]
		},
		[MCP_RESOURCE_PROTOCOL]: {
			brief: "Protocol of the resource URI being accessed, extracted from the URI.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "file",
			deprecation: {
				replacement: "network.protocol.name",
				reason: "OTel uses the generic network.protocol.name attribute"
			},
			aliases: [NETWORK_PROTOCOL_NAME, NET_PROTOCOL_NAME],
			changelog: [{
				version: "0.12.0",
				prs: [420],
				description: "Deprecated in favor of network.protocol.name"
			}, {
				version: "0.3.0",
				prs: [171]
			}]
		},
		[MCP_RESOURCE_URI]: {
			brief: "The resource URI being accessed in an MCP operation.",
			type: "string",
			pii: {
				isPii: "true",
				reason: "URIs can contain sensitive file paths"
			},
			isInOtel: !0,
			visibility: "public",
			example: "file:///path/to/file.txt",
			changelog: [{
				version: "0.12.0",
				prs: [420],
				description: "Set is_in_otel=true, attribute exists in OTel MCP registry"
			}, {
				version: "0.3.0",
				prs: [171]
			}]
		},
		[MCP_SERVER_NAME]: {
			brief: "Name of the MCP server application.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "sentry-mcp-server",
			changelog: [{
				version: "0.3.0",
				prs: [171]
			}]
		},
		[MCP_SERVER_TITLE]: {
			brief: "Display title of the MCP server application.",
			type: "string",
			pii: {
				isPii: "maybe",
				reason: "Server titles may reveal user-specific application configurations or custom setups"
			},
			isInOtel: !1,
			visibility: "public",
			example: "Sentry MCP Server",
			changelog: [{
				version: "0.3.0",
				prs: [171]
			}]
		},
		[MCP_SERVER_VERSION]: {
			brief: "Version of the MCP server application.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "0.1.0",
			changelog: [{
				version: "0.3.0",
				prs: [171]
			}]
		},
		[MCP_SESSION_ID]: {
			brief: "Identifier for the MCP session.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "550e8400-e29b-41d4-a716-446655440000",
			changelog: [{
				version: "0.12.0",
				prs: [420],
				description: "Set is_in_otel=true, attribute exists in OTel MCP registry"
			}, {
				version: "0.3.0",
				prs: [171]
			}]
		},
		[MCP_TOOL_NAME]: {
			brief: "Name of the MCP tool being called.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "calculator",
			deprecation: {
				replacement: "gen_ai.tool.name",
				reason: "OTel uses gen_ai.tool.name for MCP tool names"
			},
			aliases: [GEN_AI_TOOL_NAME, AI_FUNCTION_CALL],
			changelog: [{
				version: "0.12.0",
				prs: [420],
				description: "Deprecated in favor of gen_ai.tool.name"
			}, {
				version: "0.3.0",
				prs: [171]
			}]
		},
		[MCP_TOOL_RESULT_CONTENT]: {
			brief: "The content of the tool result.",
			type: "string",
			pii: {
				isPii: "true",
				reason: "Tool results can contain user data"
			},
			isInOtel: !1,
			visibility: "public",
			example: "{\"output\": \"rainy\", \"toolCallId\": \"1\"}",
			deprecation: {
				replacement: "gen_ai.tool.call.result",
				reason: "OTel uses gen_ai.tool.call.result for MCP tool results"
			},
			aliases: [
				GEN_AI_TOOL_CALL_RESULT,
				GEN_AI_TOOL_MESSAGE,
				GEN_AI_TOOL_OUTPUT
			],
			changelog: [
				{
					version: "0.12.0",
					prs: [420],
					description: "Deprecated in favor of gen_ai.tool.call.result"
				},
				{
					version: "0.3.0",
					prs: [171]
				},
				{
					version: "0.2.0",
					prs: [164]
				}
			]
		},
		[MCP_TOOL_RESULT_CONTENT_COUNT]: {
			brief: "Number of content items in the tool result.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1,
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, {
				version: "0.3.0",
				prs: [171]
			}]
		},
		[MCP_TOOL_RESULT_IS_ERROR]: {
			brief: "Whether a tool execution resulted in an error.",
			type: "boolean",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: !1,
			deprecation: {
				replacement: "error.type",
				reason: "OTel uses error.type set to 'tool_error' when isError is true. Cannot be automatically backfilled due to type mismatch (boolean vs string)."
			},
			changelog: [{
				version: "0.12.0",
				prs: [420],
				description: "Deprecated in favor of error.type"
			}, {
				version: "0.3.0",
				prs: [171]
			}]
		},
		[MCP_TRANSPORT]: {
			brief: "Transport method used for MCP communication.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "stdio",
			deprecation: {
				replacement: "network.transport",
				reason: "OTel uses the generic network.transport attribute"
			},
			aliases: [NETWORK_TRANSPORT, NET_TRANSPORT],
			changelog: [{
				version: "0.12.0",
				prs: [420],
				description: "Deprecated in favor of network.transport"
			}, {
				version: "0.3.0",
				prs: [171]
			}]
		},
		[MDC_KEY]: {
			brief: "Attributes from the Mapped Diagnostic Context (MDC) present at the moment the log record was created. The MDC is supported by all the most popular logging solutions in the Java ecosystem, and it's usually implemented as a thread-local map that stores context for e.g. a specific request.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			hasDynamicSuffix: !0,
			example: "mdc.some_key='some_value'",
			changelog: [{
				version: "0.3.0",
				prs: [176]
			}]
		},
		[MESSAGING_BATCH_MESSAGE_COUNT]: {
			brief: "The number of messages sent, received, or processed in the scope of the batching operation.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: 10,
			changelog: [{
				version: "0.6.0",
				prs: [341],
				description: "Added messaging.batch.message_count attribute"
			}]
		},
		[MESSAGING_DESTINATION_CONNECTION]: {
			brief: "The message destination connection.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "BestTopic",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[MESSAGING_DESTINATION_NAME]: {
			brief: "The message destination name.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "BestTopic",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[MESSAGING_MESSAGE_BODY_SIZE]: {
			brief: "The size of the message body in bytes.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: 839,
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, { version: "0.0.0" }]
		},
		[MESSAGING_MESSAGE_ENVELOPE_SIZE]: {
			brief: "The size of the message body and metadata in bytes.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: 1045,
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, { version: "0.0.0" }]
		},
		[MESSAGING_MESSAGE_ID]: {
			brief: "A value used by the messaging system as an identifier for the message, represented as a string.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "f47ac10b58cc4372a5670e02b2c3d479",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[MESSAGING_MESSAGE_RECEIVE_LATENCY]: {
			brief: "The latency between when the message was published and received.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1732847252,
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, { version: "0.0.0" }]
		},
		[MESSAGING_MESSAGE_RETRY_COUNT]: {
			brief: "The amount of attempts to send the message.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 2,
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, { version: "0.0.0" }]
		},
		[MESSAGING_OPERATION_NAME]: {
			brief: "The name of the messaging operation being performed",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "send",
			changelog: [{
				version: "0.11.0",
				prs: [392],
				description: "Added messaging.operation.name attribute"
			}]
		},
		[MESSAGING_OPERATION_TYPE]: {
			brief: "A string identifying the type of the messaging operation",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "create",
			changelog: [{
				version: "0.1.0",
				prs: [51, 127]
			}]
		},
		[MESSAGING_SYSTEM]: {
			brief: "The messaging system as identified by the client instrumentation.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "activemq",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[METHOD]: {
			brief: "The HTTP method used.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "GET",
			deprecation: { replacement: "http.request.method" },
			aliases: [
				HTTP_REQUEST_METHOD,
				_HTTP_REQUEST_METHOD,
				HTTP_METHOD
			],
			changelog: [{
				version: "0.1.0",
				prs: [61, 127]
			}, { version: "0.0.0" }]
		},
		[MIDDLEWARE_NAME]: {
			brief: "The name of the middleware.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "AuthenticationMiddleware",
			changelog: [{
				version: "0.6.0",
				prs: [336],
				description: "Added middleware.name attribute"
			}]
		},
		[NAVIGATION_TYPE]: {
			brief: "The type of navigation done by a client-side router.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "router.push",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[NEL_ELAPSED_TIME]: {
			brief: "The elapsed number of milliseconds between the start of the resource fetch and when it was completed or aborted by the user agent.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 100,
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, {
				version: "0.1.0",
				prs: [68]
			}]
		},
		[NEL_PHASE]: {
			brief: "If request failed, the phase of its network error. If request succeeded, \"application\".",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "application",
			changelog: [{
				version: "0.1.0",
				prs: [68, 127]
			}]
		},
		[NEL_REFERRER]: {
			brief: "request's referrer, as determined by the referrer policy associated with its client.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			example: "https://example.com/foo?bar=baz",
			changelog: [{
				version: "0.1.0",
				prs: [68, 127]
			}]
		},
		[NEL_SAMPLING_FUNCTION]: {
			brief: "The sampling function used to determine if the request should be sampled.",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: .5,
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, {
				version: "0.1.0",
				prs: [68]
			}]
		},
		[NEL_TYPE]: {
			brief: "If request failed, the type of its network error. If request succeeded, \"ok\".",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "dns.unreachable",
			changelog: [{
				version: "0.1.0",
				prs: [68, 127]
			}]
		},
		[NETWORK_CONNECTION_EFFECTIVE_TYPE]: {
			brief: "Specifies the effective type of the current connection (e.g. slow-2g, 2g, 3g, 4g).",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "4g",
			aliases: [EFFECTIVECONNECTIONTYPE],
			changelog: [{
				version: "0.5.0",
				prs: [279],
				description: "Added attribute network.connection.effective_type to be used instead of effectiveConnectionType"
			}]
		},
		[NETWORK_CONNECTION_RTT]: {
			brief: "Specifies the estimated effective round-trip time of the current connection, in milliseconds.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 100,
			aliases: [CONNECTION_RTT],
			changelog: [{
				version: "0.5.0",
				prs: [279],
				description: "Added attribute network.connection.rtt to be used instead of connection.rtt"
			}]
		},
		[NETWORK_CONNECTION_TYPE]: {
			brief: "Specifies the type of the current connection (e.g. wifi, ethernet, cellular , etc).",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "wifi",
			aliases: [DEVICE_CONNECTION_TYPE, CONNECTIONTYPE],
			changelog: [{
				version: "0.5.0",
				prs: [279],
				description: "Added attribute network.connection.type to be used instead of connectionType"
			}]
		},
		[NETWORK_LOCAL_ADDRESS]: {
			brief: "Local address of the network connection - IP address or Unix domain socket name.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "10.1.2.80",
			aliases: [NET_HOST_IP, NET_SOCK_HOST_ADDR],
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[NETWORK_LOCAL_PORT]: {
			brief: "Local port number of the network connection.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: 65400,
			aliases: [NET_SOCK_HOST_PORT],
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, { version: "0.0.0" }]
		},
		[NETWORK_PEER_ADDRESS]: {
			brief: "Peer address of the network connection - IP address or Unix domain socket name.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !0,
			visibility: "public",
			example: "10.1.2.80",
			aliases: [NET_PEER_IP, NET_SOCK_PEER_ADDR],
			changelog: [{
				version: "0.1.0",
				prs: [108, 127]
			}, { version: "0.0.0" }]
		},
		[NETWORK_PEER_PORT]: {
			brief: "Peer port number of the network connection.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: 65400,
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, { version: "0.0.0" }]
		},
		[NETWORK_PROTOCOL_NAME]: {
			brief: "OSI application layer or non-OSI equivalent.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "http",
			aliases: [NET_PROTOCOL_NAME, MCP_RESOURCE_PROTOCOL],
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[NETWORK_PROTOCOL_VERSION]: {
			brief: "The actual version of the protocol used for network communication.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "1.1",
			aliases: [HTTP_FLAVOR, NET_PROTOCOL_VERSION],
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[NETWORK_TRANSPORT]: {
			brief: "OSI transport layer or inter-process communication method.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "tcp",
			aliases: [NET_TRANSPORT, MCP_TRANSPORT],
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[NETWORK_TYPE]: {
			brief: "OSI network layer or non-OSI equivalent.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "ipv4",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[NET_HOST_IP]: {
			brief: "Local address of the network connection - IP address or Unix domain socket name.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "192.168.0.1",
			deprecation: { replacement: "network.local.address" },
			aliases: [NETWORK_LOCAL_ADDRESS, NET_SOCK_HOST_ADDR],
			changelog: [{
				version: "0.1.0",
				prs: [
					61,
					108,
					127
				]
			}, { version: "0.0.0" }]
		},
		[NET_HOST_NAME]: {
			brief: "Server domain name if available without reverse DNS lookup; otherwise, IP address or Unix domain socket name.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "example.com",
			deprecation: { replacement: "server.address" },
			aliases: [
				SERVER_ADDRESS,
				HTTP_SERVER_NAME,
				HTTP_HOST
			],
			changelog: [{
				version: "0.1.0",
				prs: [
					61,
					108,
					127
				]
			}, { version: "0.0.0" }]
		},
		[NET_HOST_PORT]: {
			brief: "Server port number.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: 1337,
			deprecation: { replacement: "server.port" },
			aliases: [SERVER_PORT],
			changelog: [
				{
					version: "0.4.0",
					prs: [228]
				},
				{
					version: "0.1.0",
					prs: [61]
				},
				{ version: "0.0.0" }
			]
		},
		[NET_PEER_IP]: {
			brief: "Peer address of the network connection - IP address or Unix domain socket name.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !0,
			visibility: "public",
			example: "192.168.0.1",
			deprecation: { replacement: "network.peer.address" },
			aliases: [NETWORK_PEER_ADDRESS, NET_SOCK_PEER_ADDR],
			changelog: [{
				version: "0.1.0",
				prs: [
					61,
					108,
					127
				]
			}, { version: "0.0.0" }]
		},
		[NET_PEER_NAME]: {
			brief: "Server domain name if available without reverse DNS lookup; otherwise, IP address or Unix domain socket name.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !0,
			visibility: "public",
			example: "example.com",
			deprecation: {
				replacement: "server.address",
				reason: "Deprecated, use server.address on client spans and client.address on server spans."
			},
			changelog: [{
				version: "0.1.0",
				prs: [61, 127]
			}, { version: "0.0.0" }]
		},
		[NET_PEER_PORT]: {
			brief: "Peer port number.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: 1337,
			deprecation: {
				replacement: "server.port",
				reason: "Deprecated, use server.port on client spans and client.port on server spans."
			},
			changelog: [
				{
					version: "0.4.0",
					prs: [228]
				},
				{
					version: "0.1.0",
					prs: [61]
				},
				{ version: "0.0.0" }
			]
		},
		[NET_PROTOCOL_NAME]: {
			brief: "OSI application layer or non-OSI equivalent.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "http",
			deprecation: { replacement: "network.protocol.name" },
			aliases: [NETWORK_PROTOCOL_NAME, MCP_RESOURCE_PROTOCOL],
			changelog: [{
				version: "0.1.0",
				prs: [61, 127]
			}, { version: "0.0.0" }]
		},
		[NET_PROTOCOL_VERSION]: {
			brief: "The actual version of the protocol used for network communication.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "1.1",
			deprecation: { replacement: "network.protocol.version" },
			aliases: [NETWORK_PROTOCOL_VERSION, HTTP_FLAVOR],
			changelog: [{
				version: "0.1.0",
				prs: [
					61,
					108,
					127
				]
			}, { version: "0.0.0" }]
		},
		[NET_SOCK_FAMILY]: {
			brief: "OSI transport and network layer",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "inet",
			deprecation: {
				replacement: "network.transport",
				reason: "Deprecated, use network.transport and network.type."
			},
			changelog: [{
				version: "0.1.0",
				prs: [61, 127]
			}, { version: "0.0.0" }]
		},
		[NET_SOCK_HOST_ADDR]: {
			brief: "Local address of the network connection mapping to Unix domain socket name.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "/var/my.sock",
			deprecation: { replacement: "network.local.address" },
			aliases: [NETWORK_LOCAL_ADDRESS, NET_HOST_IP],
			changelog: [{
				version: "0.1.0",
				prs: [
					61,
					108,
					127
				]
			}, { version: "0.0.0" }]
		},
		[NET_SOCK_HOST_PORT]: {
			brief: "Local port number of the network connection.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: 8080,
			deprecation: { replacement: "network.local.port" },
			aliases: [NETWORK_LOCAL_PORT],
			changelog: [
				{
					version: "0.4.0",
					prs: [228]
				},
				{
					version: "0.1.0",
					prs: [61]
				},
				{ version: "0.0.0" }
			]
		},
		[NET_SOCK_PEER_ADDR]: {
			brief: "Peer address of the network connection - IP address",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !0,
			visibility: "public",
			example: "192.168.0.1",
			deprecation: { replacement: "network.peer.address" },
			aliases: [NETWORK_PEER_ADDRESS, NET_PEER_IP],
			changelog: [{
				version: "0.1.0",
				prs: [
					61,
					108,
					127
				]
			}, { version: "0.0.0" }]
		},
		[NET_SOCK_PEER_NAME]: {
			brief: "Peer address of the network connection - Unix domain socket name",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !0,
			visibility: "public",
			example: "/var/my.sock",
			deprecation: { reason: "Deprecated from OTEL, no replacement at this time" },
			changelog: [{
				version: "0.1.0",
				prs: [
					61,
					119,
					127
				]
			}, { version: "0.0.0" }]
		},
		[NET_SOCK_PEER_PORT]: {
			brief: "Peer port number of the network connection.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: 8080,
			deprecation: { replacement: "network.peer.port" },
			changelog: [
				{
					version: "0.4.0",
					prs: [228]
				},
				{
					version: "0.1.0",
					prs: [61]
				},
				{ version: "0.0.0" }
			]
		},
		[NET_TRANSPORT]: {
			brief: "OSI transport layer or inter-process communication method.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "tcp",
			deprecation: { replacement: "network.transport" },
			aliases: [NETWORK_TRANSPORT, MCP_TRANSPORT],
			changelog: [{
				version: "0.1.0",
				prs: [61, 127]
			}, { version: "0.0.0" }]
		},
		[OS_BUILD]: {
			brief: "The build ID of the operating system.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "1234567890",
			deprecation: { replacement: "os.build_id" },
			aliases: [OS_BUILD_ID],
			changelog: [{
				version: "0.5.0",
				prs: [301],
				description: "Added os.build attribute, deprecated in favor of os.build_id"
			}]
		},
		[OS_BUILD_ID]: {
			brief: "The build ID of the operating system.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "1234567890",
			aliases: [OS_BUILD],
			changelog: [
				{
					version: "0.5.0",
					prs: [301],
					description: "Added os.build as alias"
				},
				{
					version: "0.1.0",
					prs: [127]
				},
				{ version: "0.0.0" }
			]
		},
		[OS_DESCRIPTION]: {
			brief: "Human readable (not intended to be parsed) OS version information, like e.g. reported by ver or lsb_release -a commands.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "Ubuntu 18.04.1 LTS",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[OS_KERNEL_VERSION]: {
			brief: "An independent kernel version string. Typically the entire output of the `uname` syscall.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "20.2.0",
			changelog: [{
				version: "0.5.0",
				prs: [301],
				description: "Added os.kernel_version attribute"
			}]
		},
		[OS_NAME]: {
			brief: "Human readable operating system name.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "Ubuntu",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[OS_RAW_DESCRIPTION]: {
			brief: "An unprocessed description string obtained by the operating system. For some well-known runtimes, Sentry will attempt to parse `name` and `version` from this string, if they are not explicitly given.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "Ubuntu 22.04.4 LTS (Jammy Jellyfish)",
			changelog: [{
				version: "0.5.0",
				prs: [301],
				description: "Added os.raw_description attribute"
			}]
		},
		[OS_ROOTED]: {
			brief: "Whether the operating system has been jailbroken or rooted.",
			type: "boolean",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: !0,
			changelog: [{
				version: "0.5.0",
				prs: [301],
				description: "Added os.rooted attribute"
			}]
		},
		[OS_THEME]: {
			brief: "Whether the OS runs in dark mode or light mode.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "dark",
			changelog: [{
				version: "0.5.0",
				prs: [301],
				description: "Added os.theme attribute"
			}]
		},
		[OS_TYPE]: {
			brief: "The operating system type.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "linux",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[OS_VERSION]: {
			brief: "The version of the operating system.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "18.04.2",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[OTEL_SCOPE_NAME]: {
			brief: "The name of the instrumentation scope - (InstrumentationScope.Name in OTLP).",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "io.opentelemetry.contrib.mongodb",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[OTEL_SCOPE_VERSION]: {
			brief: "The version of the instrumentation scope - (InstrumentationScope.Version in OTLP).",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "2.4.5",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[OTEL_STATUS_CODE]: {
			brief: "Name of the code, either “OK” or “ERROR”. MUST NOT be set if the status code is UNSET.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "OK",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[OTEL_STATUS_DESCRIPTION]: {
			brief: "Description of the Status if it has a value, otherwise not set.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !0,
			visibility: "public",
			example: "resource not found",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[PARAMS_KEY]: {
			brief: "Decoded parameters extracted from a URL path. Usually added by client-side routing frameworks like vue-router.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			hasDynamicSuffix: !0,
			example: "params.id='123'",
			aliases: [URL_PATH_PARAMETER_KEY],
			changelog: [{
				version: "0.1.0",
				prs: [103]
			}]
		},
		[PERFORMANCE_ACTIVATIONSTART]: {
			brief: "The time between initiating a navigation to a page and the browser activating the page",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1.983,
			deprecation: {
				replacement: "browser.performance.navigation.activation_start",
				reason: "The activationStart is now recorded as the browser.performance.navigation.activation_start attribute."
			},
			aliases: [BROWSER_PERFORMANCE_NAVIGATION_ACTIVATION_START],
			changelog: [{
				version: "0.5.0",
				prs: [321],
				description: "Added performance.activationStart attribute"
			}]
		},
		[PERFORMANCE_TIMEORIGIN]: {
			brief: "The browser's performance.timeOrigin timestamp representing the time when the pageload was initiated",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1776185678.886,
			deprecation: {
				replacement: "browser.performance.time_origin",
				reason: "The timeOrigin is now recorded as the browser.performance.time_origin attribute."
			},
			aliases: [BROWSER_PERFORMANCE_TIME_ORIGIN],
			changelog: [{
				version: "0.5.0",
				prs: [321],
				description: "Added performance.timeOrigin attribute"
			}]
		},
		[PREVIOUS_ROUTE]: {
			brief: "Also used by mobile SDKs to indicate the previous route in the application.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "HomeScreen",
			changelog: [{
				version: "0.1.0",
				prs: [74]
			}, { version: "0.0.0" }]
		},
		[PROCESS_COMMAND_ARGS]: {
			brief: "All the command arguments (including the command/executable itself) as received by the process.",
			type: "string[]",
			pii: { isPii: "true" },
			isInOtel: !0,
			visibility: "public",
			example: ["cmd/otecol", "--config=config.yaml"],
			changelog: [{
				version: "0.6.0",
				prs: [327],
				description: "Added process.command_args attribute"
			}]
		},
		[PROCESS_EXECUTABLE_NAME]: {
			brief: "The name of the executable that started the process.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "getsentry",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[PROCESS_PID]: {
			brief: "The process ID of the running process.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: 12345,
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, { version: "0.0.0" }]
		},
		[PROCESS_RUNTIME_DESCRIPTION]: {
			brief: "An additional description about the runtime of the process, for example a specific vendor customization of the runtime environment. Equivalent to `raw_description` in the Sentry runtime context.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "Eclipse OpenJ9 VM openj9-0.21.0",
			aliases: [RUNTIME_RAW_DESCRIPTION],
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[PROCESS_RUNTIME_ENGINE_NAME]: {
			brief: "The name of the runtime engine.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "v8",
			changelog: [{ version: "0.0.0" }]
		},
		[PROCESS_RUNTIME_ENGINE_VERSION]: {
			brief: "The version of the runtime engine.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "12.9.202.13-rusty",
			changelog: [{ version: "0.0.0" }]
		},
		[PROCESS_RUNTIME_NAME]: {
			brief: "The name of the runtime. Equivalent to `name` in the Sentry runtime context.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "node",
			aliases: [RUNTIME_NAME],
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[PROCESS_RUNTIME_VERSION]: {
			brief: "The version of the runtime of this process, as returned by the runtime without modification. Equivalent to `version` in the Sentry runtime context.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "18.04.2",
			aliases: [RUNTIME_VERSION],
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[QUERY_KEY]: {
			brief: "An item in a query string. Usually added by client-side routing frameworks like vue-router.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			hasDynamicSuffix: !0,
			example: "query.id='123'",
			deprecation: {
				replacement: "url.query",
				reason: "Instead of sending items individually in query.<key>, they should be sent all together with url.query."
			},
			changelog: [{
				version: "0.1.0",
				prs: [103]
			}]
		},
		[REACT_VERSION]: {
			brief: "The version of the React framework",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "18.2.0",
			changelog: [{
				version: "0.7.0",
				prs: [368],
				description: "Added react.version attribute"
			}]
		},
		[RELEASE]: {
			brief: "The sentry release.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "production",
			deprecation: { replacement: "sentry.release" },
			aliases: [SENTRY_RELEASE],
			changelog: [{
				version: "0.1.0",
				prs: [61, 127]
			}, { version: "0.0.0" }]
		},
		[REMIX_ACTION_FORM_DATA_KEY]: {
			brief: "Remix form data, <key> being the form data key, the value being the form data value.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			hasDynamicSuffix: !0,
			example: "http.response.header.text='test'",
			changelog: [{
				version: "0.1.0",
				prs: [103]
			}]
		},
		[REPLAY_ID]: {
			brief: "The id of the sentry replay.",
			type: "string",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "public",
			example: "123e4567e89b12d3a456426614174000",
			deprecation: { replacement: "sentry.replay_id" },
			aliases: [SENTRY_REPLAY_ID],
			changelog: [{
				version: "0.1.0",
				prs: [61]
			}, { version: "0.0.0" }]
		},
		[RESOURCE_DEPLOYMENT_ENVIRONMENT]: {
			brief: "The software deployment environment name.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "production",
			deprecation: { replacement: "sentry.environment" },
			changelog: [{
				version: "0.5.0",
				prs: [266]
			}]
		},
		[RESOURCE_DEPLOYMENT_ENVIRONMENT_NAME]: {
			brief: "The software deployment environment name.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "production",
			deprecation: { replacement: "sentry.environment" },
			changelog: [{
				version: "0.3.1",
				prs: [196]
			}]
		},
		[RESOURCE_RENDER_BLOCKING_STATUS]: {
			brief: "The render blocking status of the resource.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "non-blocking",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[ROUTE]: {
			brief: "The matched route, that is, the path template in the format used by the respective server framework. Also used by mobile SDKs to indicate the current route in the application.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "App\\Controller::indexAction",
			deprecation: { replacement: "http.route" },
			aliases: [HTTP_ROUTE],
			changelog: [{
				version: "0.1.0",
				prs: [61, 74]
			}, { version: "0.0.0" }]
		},
		[RPC_GRPC_STATUS_CODE]: {
			brief: "The numeric status code of the gRPC request.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: 2,
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, { version: "0.0.0" }]
		},
		[RPC_METHOD]: {
			brief: "The fully-qualified logical name of the method from the RPC interface perspective.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "com.example.ExampleService/exampleMethod",
			changelog: [{
				version: "0.7.0",
				prs: [351],
				description: "Added rpc.method attribute"
			}]
		},
		[RPC_RESPONSE_STATUS_CODE]: {
			brief: "Status code of the RPC returned by the RPC server or generated by the client.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "DEADLINE_EXCEEDED",
			changelog: [{
				version: "0.7.0",
				prs: [352],
				description: "Added rpc.response.status_code attribute"
			}]
		},
		[RPC_SERVICE]: {
			brief: "The full (logical) name of the service being called, including its package name, if applicable.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "myService.BestService",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[RUNTIME_BUILD]: {
			brief: "The application build string, when it is separate from the version.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "stable",
			deprecation: { reason: "The runtime.* namespace is deprecated in favor of process.runtime.*. No direct OTel equivalent exists for this attribute." },
			changelog: [{
				version: "0.11.0",
				prs: [383],
				description: "Added and deprecated runtime.build attribute"
			}]
		},
		[RUNTIME_NAME]: {
			brief: "The name of the runtime. For example node, CPython, or rustc.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "node",
			deprecation: {
				replacement: "process.runtime.name",
				reason: "Prefer OTel-aligned process.runtime.name"
			},
			aliases: [PROCESS_RUNTIME_NAME],
			changelog: [{
				version: "0.11.0",
				prs: [383],
				description: "Added and deprecated runtime.name attribute in favor of process.runtime.name"
			}]
		},
		[RUNTIME_RAW_DESCRIPTION]: {
			brief: "Unprocessed description string as obtained from the runtime. Used to extract name and version for well-known runtimes.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "Eclipse OpenJ9 VM openj9-0.21.0",
			deprecation: {
				replacement: "process.runtime.description",
				reason: "Prefer OTel-aligned process.runtime.description"
			},
			aliases: [PROCESS_RUNTIME_DESCRIPTION],
			changelog: [{
				version: "0.11.0",
				prs: [383],
				description: "Added and deprecated runtime.raw_description attribute in favor of process.runtime.description"
			}]
		},
		[RUNTIME_VERSION]: {
			brief: "The version of the runtime.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "18.04.2",
			deprecation: {
				replacement: "process.runtime.version",
				reason: "Prefer OTel-aligned process.runtime.version"
			},
			aliases: [PROCESS_RUNTIME_VERSION],
			changelog: [{
				version: "0.11.0",
				prs: [383],
				description: "Added and deprecated runtime.version attribute in favor of process.runtime.version"
			}]
		},
		[SCORE_KEY]: {
			brief: "The weighted performance score for a web vital. This is defined as `score.weight.<key>` * `score.ratio.<key>`.",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			hasDynamicSuffix: !0,
			example: "score.cls=0.1723",
			changelog: [{
				version: "0.7.0",
				prs: [355],
				description: "Added score.<key> attribute"
			}]
		},
		[SCORE_RATIO_KEY]: {
			brief: "The score for a web vital, normalized to a number between 0 and 1.",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			hasDynamicSuffix: !0,
			example: "score.ratio.inp=0.7748",
			changelog: [{
				version: "0.7.0",
				prs: [355],
				description: "Added score.ratio.<key> attribute"
			}]
		},
		[SCORE_TOTAL]: {
			brief: "The total performance score of a span. This is the sum of individual weighted web vital scores (see `score.<key>`).",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			changelog: [{
				version: "0.7.0",
				prs: [355],
				description: "Added score.total attribute"
			}]
		},
		[SCORE_WEIGHT_KEY]: {
			brief: "The relative weight of a web vital in a span's performance score.",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			hasDynamicSuffix: !0,
			example: "score.weight.fcp=0.25",
			changelog: [{
				version: "0.7.0",
				prs: [355],
				description: "Added score.weight.<key> attribute"
			}]
		},
		[SENTRY_ACTION]: {
			brief: "Used as a generic attribute representing the action depending on the type of span. For instance, this is the database query operation for DB spans, and the request method for HTTP spans.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "SELECT",
			changelog: [{
				version: "0.4.0",
				prs: [212]
			}]
		},
		[SENTRY_BROWSER_NAME]: {
			brief: "The name of the browser.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "Chrome",
			deprecation: { replacement: "browser.name" },
			aliases: [BROWSER_NAME],
			changelog: [{
				version: "0.1.0",
				prs: [139]
			}]
		},
		[SENTRY_BROWSER_VERSION]: {
			brief: "The version of the browser.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "120.0.6099.130",
			deprecation: { replacement: "browser.version" },
			aliases: [BROWSER_VERSION],
			changelog: [{
				version: "0.1.0",
				prs: [139]
			}]
		},
		[SENTRY_CANCELLATION_REASON]: {
			brief: "The reason why a span ended early.",
			type: "string",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "public",
			example: "document.hidden",
			changelog: [{ version: "0.0.0" }]
		},
		[SENTRY_CATEGORY]: {
			brief: "The high-level category of a span, derived from the span operation or span attributes. This categorizes spans by their general purpose (e.g., database, HTTP, UI). Known values include: 'ai', 'ai.pipeline', 'app', 'browser', 'cache', 'console', 'db', 'event', 'file', 'function.aws', 'function.azure', 'function.gcp', 'function.nextjs', 'function.remix', 'graphql', 'grpc', 'http', 'measure', 'middleware', 'navigation', 'pageload', 'queue', 'resource', 'rpc', 'serialize', 'subprocess', 'template', 'topic', 'ui', 'ui.angular', 'ui.ember', 'ui.react', 'ui.svelte', 'ui.vue', 'view', 'websocket'.",
			type: "string",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "public",
			example: "db",
			changelog: [{
				version: "0.4.0",
				prs: [218]
			}]
		},
		[SENTRY_CLIENT_SAMPLE_RATE]: {
			brief: "Rate at which a span was sampled in the SDK.",
			type: "double",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "public",
			example: .5,
			changelog: [{
				version: "0.1.0",
				prs: [102]
			}]
		},
		[SENTRY_DESCRIPTION]: {
			brief: "The human-readable description of a span.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			example: "index view query",
			changelog: [{
				version: "0.1.0",
				prs: [135]
			}]
		},
		[SENTRY_DIST]: {
			brief: "The sentry dist.",
			type: "string",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "public",
			example: "1.0",
			changelog: [{ version: "0.0.0" }]
		},
		[SENTRY_DOMAIN]: {
			brief: "Used as a generic attribute representing the domain depending on the type of span. For instance, this is the collection/table name for database spans, and the server address for HTTP spans.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "example.com",
			changelog: [{
				version: "0.4.0",
				prs: [212]
			}]
		},
		[SENTRY_DSC_ENVIRONMENT]: {
			brief: "The environment from the dynamic sampling context.",
			type: "string",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "internal",
			example: "prod",
			changelog: [{
				version: "0.3.0",
				prs: [185]
			}]
		},
		[SENTRY_DSC_PROJECT_ID]: {
			brief: "The ID of the project where the trace originated (i.e. the project of the SDK that started the trace). Propagated through the dynamic sampling context and set by Relay during ingestion.",
			type: "string",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "internal",
			example: "12345",
			changelog: [{
				version: "0.7.0",
				prs: [358],
				description: "Add sentry.dsc.project_id as an attribute"
			}]
		},
		[SENTRY_DSC_PUBLIC_KEY]: {
			brief: "The public key from the dynamic sampling context.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "internal",
			example: "c51734c603c4430eb57cb0a5728a479d",
			changelog: [{
				version: "0.3.0",
				prs: [185]
			}]
		},
		[SENTRY_DSC_RELEASE]: {
			brief: "The release identifier from the dynamic sampling context.",
			type: "string",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "internal",
			example: "frontend@e8211be71b214afab5b85de4b4c54be3714952bb",
			changelog: [{
				version: "0.3.0",
				prs: [185]
			}]
		},
		[SENTRY_DSC_SAMPLED]: {
			brief: "Whether the event was sampled according to the dynamic sampling context.",
			type: "boolean",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "internal",
			example: !0,
			changelog: [{
				version: "0.3.0",
				prs: [185]
			}]
		},
		[SENTRY_DSC_SAMPLE_RATE]: {
			brief: "The sample rate from the dynamic sampling context.",
			type: "string",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "internal",
			example: "1.0",
			changelog: [{
				version: "0.3.0",
				prs: [185]
			}]
		},
		[SENTRY_DSC_TRACE_ID]: {
			brief: "The trace ID from the dynamic sampling context.",
			type: "string",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "internal",
			example: "047372980460430cbc78d9779df33a46",
			changelog: [{
				version: "0.3.0",
				prs: [185]
			}]
		},
		[SENTRY_DSC_TRANSACTION]: {
			brief: "The transaction name from the dynamic sampling context.",
			type: "string",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "internal",
			example: "/issues/errors-outages/",
			changelog: [{
				version: "0.3.0",
				prs: [185]
			}]
		},
		[SENTRY_ENVIRONMENT]: {
			brief: "The sentry environment.",
			type: "string",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "public",
			example: "production",
			aliases: [ENVIRONMENT],
			changelog: [{ version: "0.0.0" }]
		},
		[SENTRY_EXCLUSIVE_TIME]: {
			brief: "The exclusive time duration of the span in milliseconds.",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1234,
			changelog: [
				{
					version: "0.4.0",
					prs: [228]
				},
				{
					version: "0.3.0",
					prs: [160]
				},
				{ version: "0.0.0" }
			]
		},
		[SENTRY_GRAPHQL_OPERATION]: {
			brief: "Indicates the type of graphql operation, emitted by the Javascript SDK.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "getUserById",
			changelog: [{
				version: "0.3.1",
				prs: [190]
			}]
		},
		[SENTRY_GROUP]: {
			brief: "Stores the hash of `sentry.normalized_description`. This is primarily used for grouping spans in the product end.",
			type: "string",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "public",
			changelog: [{
				version: "0.4.0",
				prs: [212]
			}]
		},
		[SENTRY_HTTP_PREFETCH]: {
			brief: "If an http request was a prefetch request.",
			type: "boolean",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "public",
			example: !0,
			changelog: [{ version: "0.0.0" }]
		},
		[SENTRY_IDLE_SPAN_FINISH_REASON]: {
			brief: "The reason why an idle span ended early.",
			type: "string",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "public",
			example: "idleTimeout",
			changelog: [{ version: "0.0.0" }]
		},
		[SENTRY_IS_REMOTE]: {
			brief: "Indicates whether a span's parent is remote.",
			type: "boolean",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "public",
			example: !0,
			changelog: [{
				version: "0.3.1",
				prs: [190]
			}]
		},
		[SENTRY_KIND]: {
			brief: "Used to clarify the relationship between parents and children, or to distinguish between spans, e.g. a `server` and `client` span with the same name.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "server",
			changelog: [{
				version: "0.3.1",
				prs: [190]
			}]
		},
		[SENTRY_MAIN_THREAD]: {
			brief: "Whether the span or event occurred on the main thread. Computed by Relay and should not be set by SDKs.",
			type: "boolean",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "public",
			example: !0,
			changelog: [{ version: "0.5.0" }]
		},
		[SENTRY_MESSAGE_PARAMETER_KEY]: {
			brief: "A parameter used in the message template. <key> can either be the number that represent the parameter's position in the template string (sentry.message.parameter.0, sentry.message.parameter.1, etc) or the parameter's name (sentry.message.parameter.item_id, sentry.message.parameter.user_id, etc)",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			example: "sentry.message.parameter.0='123'",
			changelog: [{
				version: "0.1.0",
				prs: [116]
			}]
		},
		[SENTRY_MESSAGE_TEMPLATE]: {
			brief: "The parameterized template string.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "Hello, {name}!",
			changelog: [{
				version: "0.1.0",
				prs: [116]
			}]
		},
		[SENTRY_MOBILE]: {
			brief: "Whether the application is using a mobile SDK. Computed by Relay and should not be set by SDKs.",
			type: "boolean",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "public",
			example: !0,
			changelog: [{ version: "0.5.0" }]
		},
		[SENTRY_MODULE_KEY]: {
			brief: "A module that was loaded in the process. The key is the name of the module.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			hasDynamicSuffix: !0,
			example: "sentry.module.brianium/paratest='v7.7.0'",
			changelog: [{
				version: "0.1.0",
				prs: [103]
			}]
		},
		[SENTRY_NEXTJS_SSR_FUNCTION_ROUTE]: {
			brief: "A parameterized route for a function in Next.js that contributes to Server-Side Rendering. Should be present on spans that track such functions when the file location of the function is known.",
			type: "string",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "public",
			example: "/posts/[id]/layout",
			changelog: [{
				version: "0.1.0",
				prs: [54, 106]
			}]
		},
		[SENTRY_NEXTJS_SSR_FUNCTION_TYPE]: {
			brief: "A descriptor for a for a function in Next.js that contributes to Server-Side Rendering. Should be present on spans that track such functions.",
			type: "string",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "public",
			example: "generateMetadata",
			changelog: [{
				version: "0.1.0",
				prs: [54, 106]
			}]
		},
		[SENTRY_NORMALIZED_DB_QUERY]: {
			brief: "The normalized version of `db.query.text`.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "SELECT .. FROM sentry_project WHERE (project_id = %s)",
			changelog: [{
				version: "0.3.1",
				prs: [194]
			}]
		},
		[SENTRY_NORMALIZED_DB_QUERY_HASH]: {
			brief: "The hash of `sentry.normalized_db_query`.",
			type: "string",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "public",
			changelog: [{
				version: "0.4.0",
				prs: [200]
			}]
		},
		[SENTRY_NORMALIZED_DESCRIPTION]: {
			brief: "Used as a generic attribute representing the normalized `sentry.description`. This refers to the legacy use case of `sentry.description` where it holds relevant data depending on the type of span (e.g. database query, resource url, http request description, etc).",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			example: "SELECT .. FROM sentry_project WHERE (project_id = %s)",
			changelog: [{
				version: "0.4.0",
				prs: [212]
			}]
		},
		[SENTRY_OBSERVED_TIMESTAMP_NANOS]: {
			brief: "The timestamp at which an envelope was received by Relay, in nanoseconds.",
			type: "string",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "public",
			example: "1544712660300000000",
			changelog: [{
				version: "0.3.0",
				prs: [174]
			}, {
				version: "0.2.0",
				prs: [137]
			}]
		},
		[SENTRY_OP]: {
			brief: "The operation of a span.",
			type: "string",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "public",
			example: "http.client",
			changelog: [{ version: "0.0.0" }]
		},
		[SENTRY_ORIGIN]: {
			brief: "The origin of the instrumentation (e.g. span, log, etc.)",
			type: "string",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "public",
			example: "auto.http.otel.fastify",
			changelog: [{
				version: "0.1.0",
				prs: [68]
			}, { version: "0.0.0" }]
		},
		[SENTRY_PLATFORM]: {
			brief: "The sdk platform that generated the event.",
			type: "string",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "public",
			example: "php",
			changelog: [{ version: "0.0.0" }]
		},
		[SENTRY_PROFILER_ID]: {
			brief: "The id of the currently running profiler (continuous profiling)",
			type: "string",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "public",
			example: "18779b64dd35d1a538e7ce2dd2d3fad3",
			changelog: [{
				version: "0.4.0",
				prs: [242]
			}]
		},
		[SENTRY_PROFILE_ID]: {
			brief: "The ID of the Sentry profile the span is associated with. This is only meaningful for transaction-based profiling.",
			type: "string",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "public",
			example: "123e4567e89b12d3a456426614174000",
			changelog: [{
				version: "0.6.0",
				prs: [344],
				description: "Added sentry.profile_id attribute"
			}]
		},
		[SENTRY_RELEASE]: {
			brief: "The sentry release.",
			type: "string",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "public",
			example: "7.0.0",
			aliases: [SERVICE_VERSION, RELEASE],
			changelog: [{ version: "0.0.0" }]
		},
		[SENTRY_REPLAY_ID]: {
			brief: "The id of the sentry replay.",
			type: "string",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "public",
			example: "123e4567e89b12d3a456426614174000",
			aliases: [REPLAY_ID],
			changelog: [{ version: "0.0.0" }]
		},
		[SENTRY_REPLAY_IS_BUFFERING]: {
			brief: "A sentinel attribute on log events indicating whether the current Session Replay is being buffered (onErrorSampleRate).",
			type: "boolean",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "public",
			example: !0,
			changelog: [{
				version: "0.3.0",
				prs: [185]
			}]
		},
		[SENTRY_REPORT_EVENT]: {
			brief: "(Deprecated) The event that caused the SDK to report CLS or LCP (pagehide or navigation)",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "pagehide",
			deprecation: { reason: "The report event is now recorded as a browser.web_vital.lcp.report_event or browser.web_vital.cls.report_event attribute. No backfill required." },
			changelog: [{
				version: "0.5.0",
				prs: [320],
				description: "Added sentry.report_event attribute"
			}]
		},
		[SENTRY_SDK_INTEGRATIONS]: {
			brief: "A list of names identifying enabled integrations. The list shouldhave all enabled integrations, including default integrations. Defaultintegrations are included because different SDK releases may contain differentdefault integrations.",
			type: "string[]",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "public",
			example: [
				"InboundFilters",
				"FunctionToString",
				"BrowserApiErrors",
				"Breadcrumbs"
			],
			changelog: [{
				version: "0.0.0",
				prs: [42]
			}]
		},
		[SENTRY_SDK_NAME]: {
			brief: "The sentry sdk name.",
			type: "string",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "public",
			example: "@sentry/react",
			changelog: [{ version: "0.0.0" }]
		},
		[SENTRY_SDK_VERSION]: {
			brief: "The sentry sdk version.",
			type: "string",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "public",
			example: "7.0.0",
			changelog: [{ version: "0.0.0" }]
		},
		[SENTRY_SEGMENT_ID]: {
			brief: "The segment ID of a span",
			type: "string",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "public",
			example: "051581bf3cb55c13",
			aliases: [_SENTRY_SEGMENT_ID],
			changelog: [{
				version: "0.1.0",
				prs: [107, 124]
			}]
		},
		[_SENTRY_SEGMENT_ID]: {
			brief: "The segment ID of a span",
			type: "string",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "public",
			example: "051581bf3cb55c13",
			deprecation: { replacement: "sentry.segment.id" },
			aliases: [SENTRY_SEGMENT_ID],
			changelog: [{
				version: "0.1.0",
				prs: [124]
			}]
		},
		[SENTRY_SEGMENT_NAME]: {
			brief: "The segment name of a span",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "GET /user",
			aliases: [SENTRY_TRANSACTION, TRANSACTION],
			changelog: [{
				version: "0.6.0",
				prs: [345],
				description: "Added sentry.transaction and transaction aliases"
			}, {
				version: "0.1.0",
				prs: [104]
			}]
		},
		[SENTRY_SERVER_SAMPLE_RATE]: {
			brief: "Rate at which a span was sampled in Relay.",
			type: "double",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "public",
			example: .5,
			changelog: [{
				version: "0.1.0",
				prs: [102]
			}]
		},
		[SENTRY_SOURCE]: {
			brief: "The source of a span, also referred to as transaction source. Known values are:  `'custom'`, `'url'`, `'route'`, `'component'`, `'view'`, `'task'`. '`source`' describes a parametrized route, while `'url'` describes the full URL, potentially containing identifiers.",
			type: "string",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "public",
			example: "route",
			deprecation: {
				replacement: "sentry.span.source",
				reason: "This attribute is being deprecated in favor of sentry.span.source"
			},
			changelog: [{ version: "0.5.0" }]
		},
		[SENTRY_SPAN_SOURCE]: {
			brief: "The source of a span, also referred to as transaction source. Known values are:  `'custom'`, `'url'`, `'route'`, `'component'`, `'view'`, `'task'`. '`source`' describes a parametrized route, while `'url'` describes the full URL, potentially containing identifiers.",
			type: "string",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "public",
			example: "route",
			changelog: [{
				version: "0.4.0",
				prs: [214]
			}, { version: "0.0.0" }]
		},
		[SENTRY_STATUS_CODE]: {
			brief: "The HTTP status code used in Sentry Insights. Typically set by Sentry during ingestion, rather than by clients.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 200,
			changelog: [{
				version: "0.4.0",
				prs: [223, 228]
			}]
		},
		[SENTRY_STATUS_MESSAGE]: {
			brief: "The from OTLP extracted status message.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "foobar",
			changelog: [{
				version: "0.3.1",
				prs: [190]
			}]
		},
		[SENTRY_TIMESTAMP_SEQUENCE]: {
			brief: "A sequencing counter for deterministic ordering of logs or metrics when timestamps share the same integer millisecond. Starts at 0 on SDK initialization, increments by 1 for each captured item, and resets to 0 when the integer millisecond of the current item differs from the previous one.",
			type: "integer",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "public",
			example: 0,
			changelog: [{
				version: "0.5.0",
				prs: [262]
			}]
		},
		[SENTRY_TRACE_PARENT_SPAN_ID]: {
			brief: "The span id of the span that was active when the log was collected. This should not be set if there was no active span.",
			type: "string",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "public",
			example: "b0e6f15b45c36b12",
			deprecation: {},
			changelog: [{
				version: "0.5.0",
				prs: [287],
				description: "Deprecate `sentry.trace.parent_span_id`"
			}, {
				version: "0.1.0",
				prs: [116]
			}]
		},
		[SENTRY_TRANSACTION]: {
			brief: "The sentry transaction (segment name).",
			type: "string",
			pii: { isPii: "false" },
			isInOtel: !1,
			visibility: "public",
			example: "GET /",
			deprecation: {
				replacement: "sentry.segment.name",
				reason: "This attribute is being deprecated in favor of sentry.segment.name"
			},
			aliases: [SENTRY_SEGMENT_NAME, TRANSACTION],
			changelog: [{
				version: "0.6.0",
				prs: [345],
				description: "Deprecated sentry.transaction in favor of sentry.segment.name"
			}, { version: "0.0.0" }]
		},
		[SENTRY_USER_EMAIL]: {
			brief: "User email address.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			deprecation: { replacement: "user.email" },
			aliases: [USER_EMAIL],
			changelog: [{
				version: "0.10.0",
				prs: [406]
			}]
		},
		[SENTRY_USER_GEO_CITY]: {
			brief: "Human readable city name.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			deprecation: { replacement: "user.geo.city" },
			aliases: [USER_GEO_CITY],
			changelog: [{
				version: "0.10.0",
				prs: [406]
			}]
		},
		[SENTRY_USER_GEO_COUNTRY_CODE]: {
			brief: "Two-letter country code (ISO 3166-1 alpha-2).",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			deprecation: { replacement: "user.geo.country_code" },
			aliases: [USER_GEO_COUNTRY_CODE],
			changelog: [{
				version: "0.10.0",
				prs: [406]
			}]
		},
		[SENTRY_USER_GEO_REGION]: {
			brief: "Human readable region name or code.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			deprecation: { replacement: "user.geo.region" },
			aliases: [USER_GEO_REGION],
			changelog: [{
				version: "0.10.0",
				prs: [406]
			}]
		},
		[SENTRY_USER_GEO_SUBDIVISION]: {
			brief: "Human readable subdivision name.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			deprecation: { replacement: "user.geo.subdivision" },
			aliases: [USER_GEO_SUBDIVISION],
			changelog: [{
				version: "0.10.0",
				prs: [406]
			}]
		},
		[SENTRY_USER_ID]: {
			brief: "Unique identifier of the user.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			deprecation: { replacement: "user.id" },
			aliases: [USER_ID],
			changelog: [{
				version: "0.10.0",
				prs: [406]
			}]
		},
		[SENTRY_USER_IP]: {
			brief: "The IP address of the user.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			deprecation: { replacement: "user.ip_address" },
			aliases: [USER_IP_ADDRESS],
			changelog: [{
				version: "0.10.0",
				prs: [406]
			}]
		},
		[SENTRY_USER_USERNAME]: {
			brief: "Short name or login/username of the user.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			deprecation: { replacement: "user.name" },
			aliases: [USER_NAME],
			changelog: [{
				version: "0.10.0",
				prs: [406]
			}]
		},
		[SERVER_ADDRESS]: {
			brief: "Server domain name if available without reverse DNS lookup; otherwise, IP address or Unix domain socket name.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "example.com",
			aliases: [
				HTTP_SERVER_NAME,
				NET_HOST_NAME,
				HTTP_HOST
			],
			changelog: [{
				version: "0.1.0",
				prs: [108, 127]
			}, { version: "0.0.0" }]
		},
		[SERVER_PORT]: {
			brief: "Server port number.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: 1337,
			aliases: [NET_HOST_PORT],
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, { version: "0.0.0" }]
		},
		[SERVICE_NAME]: {
			brief: "Logical name of the service.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "omegastar",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[SERVICE_VERSION]: {
			brief: "The version string of the service API or implementation. The format is not defined by these conventions.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "5.0.0",
			aliases: [SENTRY_RELEASE],
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[SESSION_ID]: {
			brief: "A unique id identifying the active session at the time of setting this attribute",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "00112233-4455-6677-8899-aabbccddeeff",
			changelog: [{
				version: "0.11.0",
				prs: [412],
				description: "Added session.id attribute"
			}]
		},
		[STALL_PERCENTAGE]: {
			brief: "The fraction of time the app was stalled. Only applies to React Native. This is computed by Relay.",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			changelog: [{
				version: "0.7.0",
				prs: [362],
				description: "Added stall_percentage attribute"
			}]
		},
		[STALL_TOTAL_TIME]: {
			brief: "The combined duration of all stalls in milliseconds. Only applies to React Native. This is computed by Relay.",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			changelog: [{
				version: "0.7.0",
				prs: [362],
				description: "Added stall_total_time attribute"
			}]
		},
		[STATE_TYPE]: {
			brief: "The type of state management library",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "redux",
			changelog: [{
				version: "0.7.0",
				prs: [365],
				description: "Added state.type attribute"
			}]
		},
		[THREAD_ID]: {
			brief: "Current “managed” thread ID.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: 56,
			changelog: [{ version: "0.0.0" }]
		},
		[THREAD_NAME]: {
			brief: "Current thread name.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "main",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[TIMBER_TAG]: {
			brief: "The log tag provided by the timber logging framework.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "MyTag",
			changelog: [{
				version: "0.3.0",
				prs: [183]
			}]
		},
		[TIME_TO_FULL_DISPLAY]: {
			brief: "The duration of time to full display in milliseconds",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1234.56,
			deprecation: {
				replacement: "app.vitals.ttfd.value",
				reason: "Replaced by app.vitals.ttfd.value to align with the app.vitals.* namespace for mobile performance attributes"
			},
			aliases: [APP_VITALS_TTFD_VALUE],
			changelog: [{
				version: "0.5.0",
				prs: [313],
				description: "Added and deprecated in favor of app.vitals.ttfd.value"
			}]
		},
		[TIME_TO_INITIAL_DISPLAY]: {
			brief: "The duration of time to initial display in milliseconds",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1234.56,
			deprecation: {
				replacement: "app.vitals.ttid.value",
				reason: "Replaced by app.vitals.ttid.value to align with the app.vitals.* namespace for mobile performance attributes"
			},
			aliases: [APP_VITALS_TTID_VALUE],
			changelog: [{
				version: "0.5.0",
				prs: [313],
				description: "Added and deprecated in favor of app.vitals.ttid.value"
			}]
		},
		[TRANSACTION]: {
			brief: "The sentry transaction (segment name).",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "GET /",
			deprecation: { replacement: "sentry.segment.name" },
			aliases: [SENTRY_SEGMENT_NAME, SENTRY_TRANSACTION],
			changelog: [
				{
					version: "0.6.0",
					prs: [345],
					description: "Updated transaction deprecation replacement to sentry.segment.name"
				},
				{
					version: "0.1.0",
					prs: [61, 127]
				},
				{ version: "0.0.0" }
			]
		},
		[TRPC_PROCEDURE_PATH]: {
			brief: "The path of the tRPC procedure being called",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "user.getById",
			changelog: [{
				version: "0.7.0",
				prs: [370],
				description: "Added trpc.procedure_path attribute"
			}]
		},
		[TRPC_PROCEDURE_TYPE]: {
			brief: "The type of the tRPC procedure",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "query",
			changelog: [{
				version: "0.7.0",
				prs: [370],
				description: "Added trpc.procedure_type attribute"
			}]
		},
		[TTFB]: {
			brief: "The value of the recorded Time To First Byte (TTFB) web vital in milliseconds",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 194,
			deprecation: {
				replacement: "browser.web_vital.ttfb.value",
				reason: "This attribute is being deprecated in favor of browser.web_vital.ttfb.value"
			},
			aliases: [BROWSER_WEB_VITAL_TTFB_VALUE],
			changelog: [{
				version: "0.5.0",
				prs: [235]
			}]
		},
		[TTFB_REQUESTTIME]: {
			brief: "The time it takes for the server to process the initial request and send the first byte of a response to the user's browser",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1554.5814,
			deprecation: {
				replacement: "browser.web_vital.ttfb.request_time",
				reason: "This attribute is being deprecated in favor of browser.web_vital.ttfb.request_time"
			},
			aliases: [BROWSER_WEB_VITAL_TTFB_REQUEST_TIME],
			changelog: [{
				version: "0.5.0",
				prs: [235]
			}]
		},
		[TYPE]: {
			brief: "More granular type of the operation happening.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "fetch",
			changelog: [{ version: "0.0.0" }]
		},
		[UI_COMPONENT_NAME]: {
			brief: "The name of the associated component.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "HomeButton",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[UI_CONTRIBUTES_TO_TTFD]: {
			brief: "Whether the span execution contributed to the TTFD (time to fully drawn) metric.",
			type: "boolean",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: !0,
			changelog: [{ version: "0.0.0" }]
		},
		[UI_CONTRIBUTES_TO_TTID]: {
			brief: "Whether the span execution contributed to the TTID (time to initial display) metric.",
			type: "boolean",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: !0,
			changelog: [{ version: "0.0.0" }]
		},
		[UI_ELEMENT_HEIGHT]: {
			brief: "The height of the UI element (for Html in pixels)",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 256,
			changelog: [{
				version: "0.5.0",
				prs: [284],
				description: "Added ui.element.height attribute"
			}]
		},
		[UI_ELEMENT_ID]: {
			brief: "The id of the UI element",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "btn-login",
			changelog: [{
				version: "0.5.0",
				prs: [284],
				description: "Added ui.element.id attribute"
			}]
		},
		[UI_ELEMENT_IDENTIFIER]: {
			brief: "The identifier used to measure the UI element timing",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "heroImage",
			changelog: [{
				version: "0.5.0",
				prs: [284],
				description: "Added ui.element.identifier attribute"
			}]
		},
		[UI_ELEMENT_LOAD_TIME]: {
			brief: "The loading time of a UI element (from time origin to finished loading)",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 998.2234,
			changelog: [{
				version: "0.5.0",
				prs: [284],
				description: "Added ui.element.load_time attribute"
			}]
		},
		[UI_ELEMENT_PAINT_TYPE]: {
			brief: "The type of element paint. Can either be 'image-paint' or 'text-paint'",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "image-paint",
			changelog: [{
				version: "0.5.0",
				prs: [284],
				description: "Added ui.element.paint_type attribute"
			}]
		},
		[UI_ELEMENT_RENDER_TIME]: {
			brief: "The rendering time of the UI element (from time origin to finished rendering)",
			type: "double",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1023.1124,
			changelog: [{
				version: "0.5.0",
				prs: [284],
				description: "Added ui.element.render_time attribute"
			}]
		},
		[UI_ELEMENT_TYPE]: {
			brief: "type of the UI element",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "img",
			changelog: [{
				version: "0.5.0",
				prs: [284],
				description: "Added ui.element.type attribute"
			}]
		},
		[UI_ELEMENT_URL]: {
			brief: "The URL of the UI element (e.g. an img src)",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			example: "https://assets.myapp.com/hero.png",
			changelog: [{
				version: "0.5.0",
				prs: [284],
				description: "Added ui.element.url attribute"
			}]
		},
		[UI_ELEMENT_WIDTH]: {
			brief: "The width of the UI element (for HTML in pixels)",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 512,
			changelog: [{
				version: "0.5.0",
				prs: [284],
				description: "Added ui.element.width attribute"
			}]
		},
		[URL]: {
			brief: "The URL of the resource that was fetched.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			example: "https://example.com/test?foo=bar#buzz",
			deprecation: { replacement: "url.full" },
			aliases: [URL_FULL, HTTP_URL],
			changelog: [{
				version: "0.1.0",
				prs: [61]
			}, { version: "0.0.0" }]
		},
		[URL_DOMAIN]: {
			brief: "Server domain name if available without reverse DNS lookup; otherwise, IP address or Unix domain socket name.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "example.com",
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[URL_FRAGMENT]: {
			brief: "The fragments present in the URI. Note that this does not contain the leading # character, while the `http.fragment` attribute does.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !0,
			visibility: "public",
			example: "details",
			changelog: [{ version: "0.0.0" }]
		},
		[URL_FULL]: {
			brief: "The URL of the resource that was fetched.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !0,
			visibility: "public",
			example: "https://example.com/test?foo=bar#buzz",
			aliases: [HTTP_URL, URL],
			changelog: [{
				version: "0.1.0",
				prs: [108]
			}, { version: "0.0.0" }]
		},
		[URL_PATH]: {
			brief: "The URI path component.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !0,
			visibility: "public",
			example: "/foo",
			changelog: [{ version: "0.0.0" }]
		},
		[URL_PATH_PARAMETER_KEY]: {
			brief: "Decoded parameters extracted from a URL path. Usually added by client-side routing frameworks like vue-router.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			hasDynamicSuffix: !0,
			example: "url.path.parameter.id='123'",
			aliases: [PARAMS_KEY],
			changelog: [{
				version: "0.1.0",
				prs: [103]
			}]
		},
		[URL_PORT]: {
			brief: "Server port number.",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: 1337,
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, { version: "0.0.0" }]
		},
		[URL_QUERY]: {
			brief: "The query string present in the URL. Note that this does not contain the leading ? character, while the `http.query` attribute does.",
			type: "string",
			pii: {
				isPii: "true",
				reason: "Query string values can contain sensitive information. Clients should attempt to scrub parameters that might contain sensitive information."
			},
			isInOtel: !0,
			visibility: "public",
			example: "foo=bar&bar=baz",
			changelog: [{ version: "0.0.0" }]
		},
		[URL_SCHEME]: {
			brief: "The URI scheme component identifying the used protocol.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "https",
			aliases: [HTTP_SCHEME],
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[URL_TEMPLATE]: {
			brief: "The low-cardinality template of an absolute path reference.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "/users/:id",
			aliases: [HTTP_ROUTE],
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[USER_AGENT_ORIGINAL]: {
			brief: "Value of the HTTP User-Agent header sent by the client.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !0,
			visibility: "public",
			example: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1",
			aliases: [HTTP_USER_AGENT],
			changelog: [{
				version: "0.1.0",
				prs: [127]
			}, { version: "0.0.0" }]
		},
		[USER_EMAIL]: {
			brief: "User email address.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !0,
			visibility: "public",
			example: "test@example.com",
			aliases: [SENTRY_USER_EMAIL],
			changelog: [{ version: "0.0.0" }]
		},
		[USER_FULL_NAME]: {
			brief: "User's full name.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !0,
			visibility: "public",
			example: "John Smith",
			changelog: [{ version: "0.0.0" }]
		},
		[USER_GEO_CITY]: {
			brief: "Human readable city name.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "Toronto",
			aliases: [SENTRY_USER_GEO_CITY],
			changelog: [{ version: "0.0.0" }]
		},
		[USER_GEO_COUNTRY_CODE]: {
			brief: "Two-letter country code (ISO 3166-1 alpha-2).",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "CA",
			aliases: [SENTRY_USER_GEO_COUNTRY_CODE],
			changelog: [{ version: "0.0.0" }]
		},
		[USER_GEO_REGION]: {
			brief: "Human readable region name or code.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "Canada",
			aliases: [SENTRY_USER_GEO_REGION],
			changelog: [{ version: "0.0.0" }]
		},
		[USER_GEO_SUBDIVISION]: {
			brief: "Human readable subdivision name.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "Ontario",
			aliases: [SENTRY_USER_GEO_SUBDIVISION],
			changelog: [{ version: "0.0.0" }]
		},
		[USER_HASH]: {
			brief: "Unique user hash to correlate information for a user in anonymized form.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !0,
			visibility: "public",
			example: "8ae4c2993e0f4f3b8b2d1b1f3b5e8f4d",
			changelog: [{ version: "0.0.0" }]
		},
		[USER_ID]: {
			brief: "Unique identifier of the user.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !0,
			visibility: "public",
			example: "S-1-5-21-202424912787-2692429404-2351956786-1000",
			aliases: [SENTRY_USER_ID],
			changelog: [{ version: "0.0.0" }]
		},
		[USER_IP_ADDRESS]: {
			brief: "The IP address of the user.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			example: "192.168.1.1",
			aliases: [SENTRY_USER_IP],
			changelog: [{
				version: "0.1.0",
				prs: [75]
			}]
		},
		[USER_NAME]: {
			brief: "Short name or login/username of the user.",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !0,
			visibility: "public",
			example: "j.smith",
			aliases: [SENTRY_USER_USERNAME],
			changelog: [{ version: "0.0.0" }]
		},
		[USER_ROLES]: {
			brief: "Array of user roles at the time of the event.",
			type: "string[]",
			pii: { isPii: "true" },
			isInOtel: !0,
			visibility: "public",
			example: ["admin", "editor"],
			changelog: [{ version: "0.0.0" }]
		},
		[VERCEL_BRANCH]: {
			brief: "Git branch name for Vercel project",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "main",
			changelog: [{
				version: "0.2.0",
				prs: [163]
			}]
		},
		[VERCEL_BUILD_ID]: {
			brief: "Identifier for the Vercel build (only present on build logs)",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "bld_cotnkcr76",
			changelog: [{
				version: "0.2.0",
				prs: [163]
			}]
		},
		[VERCEL_DEPLOYMENT_ID]: {
			brief: "Identifier for the Vercel deployment",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "dpl_233NRGRjVZX1caZrXWtz5g1TAksD",
			changelog: [{
				version: "0.2.0",
				prs: [163]
			}]
		},
		[VERCEL_DESTINATION]: {
			brief: "Origin of the external content in Vercel (only on external logs)",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "https://vitals.vercel-insights.com/v1",
			changelog: [{
				version: "0.2.0",
				prs: [163]
			}]
		},
		[VERCEL_EDGE_TYPE]: {
			brief: "Type of edge runtime in Vercel",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "edge-function",
			changelog: [{
				version: "0.2.0",
				prs: [163]
			}]
		},
		[VERCEL_ENTRYPOINT]: {
			brief: "Entrypoint for the request in Vercel",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "api/index.js",
			changelog: [{
				version: "0.2.0",
				prs: [163]
			}]
		},
		[VERCEL_EXECUTION_REGION]: {
			brief: "Region where the request is executed",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "sfo1",
			changelog: [{
				version: "0.2.0",
				prs: [163]
			}]
		},
		[VERCEL_ID]: {
			brief: "Unique identifier for the log entry in Vercel",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "1573817187330377061717300000",
			changelog: [{
				version: "0.2.0",
				prs: [163]
			}]
		},
		[VERCEL_JA3_DIGEST]: {
			brief: "JA3 fingerprint digest of Vercel request",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			example: "769,47-53-5-10-49161-49162-49171-49172-50-56-19-4,0-10-11,23-24-25,0",
			changelog: [{
				version: "0.2.0",
				prs: [163]
			}]
		},
		[VERCEL_JA4_DIGEST]: {
			brief: "JA4 fingerprint digest",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			example: "t13d1516h2_8daaf6152771_02713d6af862",
			changelog: [{
				version: "0.2.0",
				prs: [163]
			}]
		},
		[VERCEL_LOG_TYPE]: {
			brief: "Vercel log output type",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "stdout",
			changelog: [{
				version: "0.2.0",
				prs: [163]
			}]
		},
		[VERCEL_PATH]: {
			brief: "Function or dynamic path of the request in Vercel.",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "/dynamic/[route].json",
			changelog: [{
				version: "0.6.0",
				prs: [349],
				description: "Added vercel.path attribute"
			}]
		},
		[VERCEL_PROJECT_ID]: {
			brief: "Identifier for the Vercel project",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "gdufoJxB6b9b1fEqr1jUtFkyavUU",
			changelog: [{
				version: "0.2.0",
				prs: [163]
			}]
		},
		[VERCEL_PROJECT_NAME]: {
			brief: "Name of the Vercel project",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "my-app",
			changelog: [{
				version: "0.2.0",
				prs: [163]
			}]
		},
		[VERCEL_PROXY_CACHE_ID]: {
			brief: "Original request ID when request is served from cache",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "pdx1::v8g4b-1744143786684-93dafbc0f70d",
			changelog: [{
				version: "0.2.0",
				prs: [163]
			}]
		},
		[VERCEL_PROXY_CLIENT_IP]: {
			brief: "Client IP address",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			example: "120.75.16.101",
			changelog: [{
				version: "0.2.0",
				prs: [163]
			}]
		},
		[VERCEL_PROXY_HOST]: {
			brief: "Hostname of the request",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "test.vercel.app",
			changelog: [{
				version: "0.2.0",
				prs: [163]
			}]
		},
		[VERCEL_PROXY_LAMBDA_REGION]: {
			brief: "Region where lambda function executed",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "sfo1",
			changelog: [{
				version: "0.2.0",
				prs: [163]
			}]
		},
		[VERCEL_PROXY_METHOD]: {
			brief: "HTTP method of the request",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "GET",
			changelog: [{
				version: "0.2.0",
				prs: [163]
			}]
		},
		[VERCEL_PROXY_PATH]: {
			brief: "Request path with query parameters",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			example: "/dynamic/some-value.json?route=some-value",
			changelog: [{
				version: "0.2.0",
				prs: [163]
			}]
		},
		[VERCEL_PROXY_PATH_TYPE]: {
			brief: "How the request was served based on its path and project configuration",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "func",
			changelog: [{
				version: "0.2.0",
				prs: [163]
			}]
		},
		[VERCEL_PROXY_PATH_TYPE_VARIANT]: {
			brief: "Variant of the path type",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "api",
			changelog: [{
				version: "0.2.0",
				prs: [163]
			}]
		},
		[VERCEL_PROXY_REFERER]: {
			brief: "Referer of the request",
			type: "string",
			pii: { isPii: "true" },
			isInOtel: !1,
			visibility: "public",
			example: "*.vercel.app",
			changelog: [{
				version: "0.2.0",
				prs: [163]
			}]
		},
		[VERCEL_PROXY_REGION]: {
			brief: "Region where the request is processed",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "sfo1",
			changelog: [{
				version: "0.2.0",
				prs: [163]
			}]
		},
		[VERCEL_PROXY_RESPONSE_BYTE_SIZE]: {
			brief: "Size of the response in bytes",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1024,
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, {
				version: "0.2.0",
				prs: [163]
			}]
		},
		[VERCEL_PROXY_SCHEME]: {
			brief: "Protocol of the request",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "https",
			changelog: [{
				version: "0.2.0",
				prs: [163]
			}]
		},
		[VERCEL_PROXY_STATUS_CODE]: {
			brief: "HTTP status code of the proxy request",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 200,
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, {
				version: "0.2.0",
				prs: [163]
			}]
		},
		[VERCEL_PROXY_TIMESTAMP]: {
			brief: "Unix timestamp when the proxy request was made",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 1573817250172,
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, {
				version: "0.2.0",
				prs: [163]
			}]
		},
		[VERCEL_PROXY_USER_AGENT]: {
			brief: "User agent strings of the request",
			type: "string[]",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: ["Mozilla/5.0..."],
			changelog: [{
				version: "0.2.0",
				prs: [163]
			}]
		},
		[VERCEL_PROXY_VERCEL_CACHE]: {
			brief: "Cache status sent to the browser",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "REVALIDATED",
			changelog: [{
				version: "0.2.0",
				prs: [163]
			}]
		},
		[VERCEL_PROXY_VERCEL_ID]: {
			brief: "Vercel-specific identifier",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "sfo1::abc123",
			changelog: [{
				version: "0.2.0",
				prs: [163]
			}]
		},
		[VERCEL_PROXY_WAF_ACTION]: {
			brief: "Action taken by firewall rules",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "deny",
			changelog: [{
				version: "0.2.0",
				prs: [163]
			}]
		},
		[VERCEL_PROXY_WAF_RULE_ID]: {
			brief: "ID of the firewall rule that matched",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "rule_gAHz8jtSB1Gy",
			changelog: [{
				version: "0.2.0",
				prs: [163]
			}]
		},
		[VERCEL_REQUEST_ID]: {
			brief: "Identifier of the Vercel request",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "643af4e3-975a-4cc7-9e7a-1eda11539d90",
			changelog: [{
				version: "0.2.0",
				prs: [163]
			}]
		},
		[VERCEL_SOURCE]: {
			brief: "Origin of the Vercel log (build, edge, lambda, static, external, or firewall)",
			type: "string",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: "build",
			changelog: [{
				version: "0.2.0",
				prs: [163]
			}]
		},
		[VERCEL_STATUS_CODE]: {
			brief: "HTTP status code of the request (-1 means no response returned and the lambda crashed)",
			type: "integer",
			pii: { isPii: "maybe" },
			isInOtel: !1,
			visibility: "public",
			example: 200,
			changelog: [{
				version: "0.4.0",
				prs: [228]
			}, {
				version: "0.2.0",
				prs: [163]
			}]
		}
	};
	exports.AI_CITATIONS = AI_CITATIONS, exports.AI_COMPLETION_TOKENS_USED = AI_COMPLETION_TOKENS_USED, exports.AI_DOCUMENTS = AI_DOCUMENTS, exports.AI_FINISH_REASON = AI_FINISH_REASON, exports.AI_FREQUENCY_PENALTY = AI_FREQUENCY_PENALTY, exports.AI_FUNCTION_CALL = AI_FUNCTION_CALL, exports.AI_GENERATION_ID = AI_GENERATION_ID, exports.AI_INPUT_MESSAGES = AI_INPUT_MESSAGES, exports.AI_IS_SEARCH_REQUIRED = AI_IS_SEARCH_REQUIRED, exports.AI_METADATA = AI_METADATA, exports.AI_MODEL_ID = AI_MODEL_ID, exports.AI_MODEL_PROVIDER = AI_MODEL_PROVIDER, exports.AI_PIPELINE_NAME = AI_PIPELINE_NAME, exports.AI_PREAMBLE = AI_PREAMBLE, exports.AI_PRESENCE_PENALTY = AI_PRESENCE_PENALTY, exports.AI_PROMPT_TOKENS_USED = AI_PROMPT_TOKENS_USED, exports.AI_RAW_PROMPTING = AI_RAW_PROMPTING, exports.AI_RESPONSES = AI_RESPONSES, exports.AI_RESPONSE_FORMAT = AI_RESPONSE_FORMAT, exports.AI_SEARCH_QUERIES = AI_SEARCH_QUERIES, exports.AI_SEARCH_RESULTS = AI_SEARCH_RESULTS, exports.AI_SEED = AI_SEED, exports.AI_STREAMING = AI_STREAMING, exports.AI_TAGS = AI_TAGS, exports.AI_TEMPERATURE = AI_TEMPERATURE, exports.AI_TEXTS = AI_TEXTS, exports.AI_TOOLS = AI_TOOLS, exports.AI_TOOL_CALLS = AI_TOOL_CALLS, exports.AI_TOP_K = AI_TOP_K, exports.AI_TOP_P = AI_TOP_P, exports.AI_TOTAL_COST = AI_TOTAL_COST, exports.AI_TOTAL_TOKENS_USED = AI_TOTAL_TOKENS_USED, exports.AI_WARNINGS = AI_WARNINGS, exports.ANGULAR_VERSION = ANGULAR_VERSION, exports.APP_APP_BUILD = APP_APP_BUILD, exports.APP_APP_IDENTIFIER = APP_APP_IDENTIFIER, exports.APP_APP_NAME = APP_APP_NAME, exports.APP_APP_START_TIME = APP_APP_START_TIME, exports.APP_APP_VERSION = APP_APP_VERSION, exports.APP_BUILD = APP_BUILD, exports.APP_IDENTIFIER = APP_IDENTIFIER, exports.APP_IN_FOREGROUND = APP_IN_FOREGROUND, exports.APP_NAME = APP_NAME, exports.APP_START_COLD = APP_START_COLD, exports.APP_START_TIME = APP_START_TIME, exports.APP_START_TYPE = APP_START_TYPE, exports.APP_START_WARM = APP_START_WARM, exports.APP_VERSION = APP_VERSION, exports.APP_VITALS_FRAMES_DELAY_VALUE = APP_VITALS_FRAMES_DELAY_VALUE, exports.APP_VITALS_FRAMES_FROZEN_COUNT = APP_VITALS_FRAMES_FROZEN_COUNT, exports.APP_VITALS_FRAMES_SLOW_COUNT = APP_VITALS_FRAMES_SLOW_COUNT, exports.APP_VITALS_FRAMES_TOTAL_COUNT = APP_VITALS_FRAMES_TOTAL_COUNT, exports.APP_VITALS_START_COLD_VALUE = APP_VITALS_START_COLD_VALUE, exports.APP_VITALS_START_PREWARMED = APP_VITALS_START_PREWARMED, exports.APP_VITALS_START_REASON = APP_VITALS_START_REASON, exports.APP_VITALS_START_SCREEN = APP_VITALS_START_SCREEN, exports.APP_VITALS_START_TYPE = APP_VITALS_START_TYPE, exports.APP_VITALS_START_WARM_VALUE = APP_VITALS_START_WARM_VALUE, exports.APP_VITALS_TTFD_VALUE = APP_VITALS_TTFD_VALUE, exports.APP_VITALS_TTID_VALUE = APP_VITALS_TTID_VALUE, exports.ART_GC_BLOCKING_COUNT = ART_GC_BLOCKING_COUNT, exports.ART_GC_BLOCKING_TIME = ART_GC_BLOCKING_TIME, exports.ART_GC_PRE_OOME_COUNT = ART_GC_PRE_OOME_COUNT, exports.ART_GC_TOTAL_COUNT = ART_GC_TOTAL_COUNT, exports.ART_GC_TOTAL_TIME = ART_GC_TOTAL_TIME, exports.ART_GC_WAITING_TIME = ART_GC_WAITING_TIME, exports.ART_MEMORY_FREE = ART_MEMORY_FREE, exports.ART_MEMORY_FREE_UNTIL_GC = ART_MEMORY_FREE_UNTIL_GC, exports.ART_MEMORY_FREE_UNTIL_OOME = ART_MEMORY_FREE_UNTIL_OOME, exports.ART_MEMORY_MAX = ART_MEMORY_MAX, exports.ART_MEMORY_TOTAL = ART_MEMORY_TOTAL, exports.ATTRIBUTE_METADATA = ATTRIBUTE_METADATA, exports.ATTRIBUTE_TYPE = ATTRIBUTE_TYPE, exports.AWS_CLOUDWATCH_LOGS_LOG_GROUP = AWS_CLOUDWATCH_LOGS_LOG_GROUP, exports.AWS_CLOUDWATCH_LOGS_LOG_STREAM = AWS_CLOUDWATCH_LOGS_LOG_STREAM, exports.AWS_CLOUDWATCH_LOGS_URL = AWS_CLOUDWATCH_LOGS_URL, exports.AWS_LAMBDA_AWS_REQUEST_ID = AWS_LAMBDA_AWS_REQUEST_ID, exports.AWS_LAMBDA_EXECUTION_DURATION_IN_MILLIS = AWS_LAMBDA_EXECUTION_DURATION_IN_MILLIS, exports.AWS_LAMBDA_FUNCTION_NAME = AWS_LAMBDA_FUNCTION_NAME, exports.AWS_LAMBDA_FUNCTION_VERSION = AWS_LAMBDA_FUNCTION_VERSION, exports.AWS_LAMBDA_INVOKED_ARN = AWS_LAMBDA_INVOKED_ARN, exports.AWS_LAMBDA_INVOKED_FUNCTION_ARN = AWS_LAMBDA_INVOKED_FUNCTION_ARN, exports.AWS_LAMBDA_REMAINING_TIME_IN_MILLIS = AWS_LAMBDA_REMAINING_TIME_IN_MILLIS, exports.AWS_LOG_GROUP_NAMES = AWS_LOG_GROUP_NAMES, exports.AWS_LOG_STREAM_NAMES = AWS_LOG_STREAM_NAMES, exports.BLOCKED_MAIN_THREAD = BLOCKED_MAIN_THREAD, exports.BROWSER_NAME = BROWSER_NAME, exports.BROWSER_PERFORMANCE_NAVIGATION_ACTIVATION_START = BROWSER_PERFORMANCE_NAVIGATION_ACTIVATION_START, exports.BROWSER_PERFORMANCE_TIME_ORIGIN = BROWSER_PERFORMANCE_TIME_ORIGIN, exports.BROWSER_REPORT_TYPE = BROWSER_REPORT_TYPE, exports.BROWSER_SCRIPT_INVOKER = BROWSER_SCRIPT_INVOKER, exports.BROWSER_SCRIPT_INVOKER_TYPE = BROWSER_SCRIPT_INVOKER_TYPE, exports.BROWSER_SCRIPT_SOURCE_CHAR_POSITION = BROWSER_SCRIPT_SOURCE_CHAR_POSITION, exports.BROWSER_VERSION = BROWSER_VERSION, exports.BROWSER_WEB_VITAL_CLS_REPORT_EVENT = BROWSER_WEB_VITAL_CLS_REPORT_EVENT, exports.BROWSER_WEB_VITAL_CLS_SOURCE_KEY = BROWSER_WEB_VITAL_CLS_SOURCE_KEY, exports.BROWSER_WEB_VITAL_CLS_VALUE = BROWSER_WEB_VITAL_CLS_VALUE, exports.BROWSER_WEB_VITAL_FCP_VALUE = BROWSER_WEB_VITAL_FCP_VALUE, exports.BROWSER_WEB_VITAL_FP_VALUE = BROWSER_WEB_VITAL_FP_VALUE, exports.BROWSER_WEB_VITAL_INP_VALUE = BROWSER_WEB_VITAL_INP_VALUE, exports.BROWSER_WEB_VITAL_LCP_ELEMENT = BROWSER_WEB_VITAL_LCP_ELEMENT, exports.BROWSER_WEB_VITAL_LCP_ID = BROWSER_WEB_VITAL_LCP_ID, exports.BROWSER_WEB_VITAL_LCP_LOAD_TIME = BROWSER_WEB_VITAL_LCP_LOAD_TIME, exports.BROWSER_WEB_VITAL_LCP_RENDER_TIME = BROWSER_WEB_VITAL_LCP_RENDER_TIME, exports.BROWSER_WEB_VITAL_LCP_REPORT_EVENT = BROWSER_WEB_VITAL_LCP_REPORT_EVENT, exports.BROWSER_WEB_VITAL_LCP_SIZE = BROWSER_WEB_VITAL_LCP_SIZE, exports.BROWSER_WEB_VITAL_LCP_URL = BROWSER_WEB_VITAL_LCP_URL, exports.BROWSER_WEB_VITAL_LCP_VALUE = BROWSER_WEB_VITAL_LCP_VALUE, exports.BROWSER_WEB_VITAL_TTFB_REQUEST_TIME = BROWSER_WEB_VITAL_TTFB_REQUEST_TIME, exports.BROWSER_WEB_VITAL_TTFB_VALUE = BROWSER_WEB_VITAL_TTFB_VALUE, exports.CACHE_HIT = CACHE_HIT, exports.CACHE_ITEM_SIZE = CACHE_ITEM_SIZE, exports.CACHE_KEY = CACHE_KEY, exports.CACHE_OPERATION = CACHE_OPERATION, exports.CACHE_TTL = CACHE_TTL, exports.CACHE_WRITE = CACHE_WRITE, exports.CHANNEL = CHANNEL, exports.CLIENT_ADDRESS = CLIENT_ADDRESS, exports.CLIENT_PORT = CLIENT_PORT, exports.CLOUDFLARE_D1_DURATION = CLOUDFLARE_D1_DURATION, exports.CLOUDFLARE_D1_QUERY_TYPE = CLOUDFLARE_D1_QUERY_TYPE, exports.CLOUDFLARE_D1_ROWS_READ = CLOUDFLARE_D1_ROWS_READ, exports.CLOUDFLARE_D1_ROWS_WRITTEN = CLOUDFLARE_D1_ROWS_WRITTEN, exports.CLOUDFLARE_R2_BUCKET = CLOUDFLARE_R2_BUCKET, exports.CLOUDFLARE_R2_OPERATION = CLOUDFLARE_R2_OPERATION, exports.CLOUDFLARE_R2_REQUEST_DELIMITER = CLOUDFLARE_R2_REQUEST_DELIMITER, exports.CLOUDFLARE_R2_REQUEST_KEY = CLOUDFLARE_R2_REQUEST_KEY, exports.CLOUDFLARE_R2_REQUEST_PART_NUMBER = CLOUDFLARE_R2_REQUEST_PART_NUMBER, exports.CLOUDFLARE_R2_REQUEST_PREFIX = CLOUDFLARE_R2_REQUEST_PREFIX, exports.CLOUDFLARE_WORKFLOW_ATTEMPT = CLOUDFLARE_WORKFLOW_ATTEMPT, exports.CLOUDFLARE_WORKFLOW_RETRIES_BACKOFF = CLOUDFLARE_WORKFLOW_RETRIES_BACKOFF, exports.CLOUDFLARE_WORKFLOW_RETRIES_DELAY = CLOUDFLARE_WORKFLOW_RETRIES_DELAY, exports.CLOUDFLARE_WORKFLOW_RETRIES_LIMIT = CLOUDFLARE_WORKFLOW_RETRIES_LIMIT, exports.CLOUDFLARE_WORKFLOW_TIMEOUT = CLOUDFLARE_WORKFLOW_TIMEOUT, exports.CLOUD_ACCOUNT_ID = CLOUD_ACCOUNT_ID, exports.CLOUD_AVAILABILITY_ZONE = CLOUD_AVAILABILITY_ZONE, exports.CLOUD_PLATFORM = CLOUD_PLATFORM, exports.CLOUD_PROVIDER = CLOUD_PROVIDER, exports.CLOUD_REGION = CLOUD_REGION, exports.CLOUD_RESOURCE_ID = CLOUD_RESOURCE_ID, exports.CLS = CLS, exports.CLS_SOURCE_KEY = CLS_SOURCE_KEY, exports.CODE_FILEPATH = CODE_FILEPATH, exports.CODE_FILE_PATH = CODE_FILE_PATH, exports.CODE_FUNCTION = CODE_FUNCTION, exports.CODE_FUNCTION_NAME = CODE_FUNCTION_NAME, exports.CODE_LINENO = CODE_LINENO, exports.CODE_LINE_NUMBER = CODE_LINE_NUMBER, exports.CODE_NAMESPACE = CODE_NAMESPACE, exports.CONNECTIONTYPE = CONNECTIONTYPE, exports.CONNECTION_RTT = CONNECTION_RTT, exports.CULTURE_CALENDAR = CULTURE_CALENDAR, exports.CULTURE_DISPLAY_NAME = CULTURE_DISPLAY_NAME, exports.CULTURE_IS_24_HOUR_FORMAT = CULTURE_IS_24_HOUR_FORMAT, exports.CULTURE_LOCALE = CULTURE_LOCALE, exports.CULTURE_TIMEZONE = CULTURE_TIMEZONE, exports.DB_COLLECTION_NAME = DB_COLLECTION_NAME, exports.DB_DRIVER_NAME = DB_DRIVER_NAME, exports.DB_NAME = DB_NAME, exports.DB_NAMESPACE = DB_NAMESPACE, exports.DB_OPERATION = DB_OPERATION, exports.DB_OPERATION_BATCH_SIZE = DB_OPERATION_BATCH_SIZE, exports.DB_OPERATION_NAME = DB_OPERATION_NAME, exports.DB_QUERY_PARAMETER_KEY = DB_QUERY_PARAMETER_KEY, exports.DB_QUERY_SUMMARY = DB_QUERY_SUMMARY, exports.DB_QUERY_TEXT = DB_QUERY_TEXT, exports.DB_REDIS_CONNECTION = DB_REDIS_CONNECTION, exports.DB_REDIS_KEY = DB_REDIS_KEY, exports.DB_REDIS_PARAMETERS = DB_REDIS_PARAMETERS, exports.DB_SQL_BINDINGS = DB_SQL_BINDINGS, exports.DB_STATEMENT = DB_STATEMENT, exports.DB_STORED_PROCEDURE_NAME = DB_STORED_PROCEDURE_NAME, exports.DB_SYSTEM = DB_SYSTEM, exports.DB_SYSTEM_NAME = DB_SYSTEM_NAME, exports.DB_USER = DB_USER, exports.DEVICEMEMORY = DEVICEMEMORY, exports.DEVICE_ARCHS = DEVICE_ARCHS, exports.DEVICE_BATTERY_LEVEL = DEVICE_BATTERY_LEVEL, exports.DEVICE_BATTERY_TEMPERATURE = DEVICE_BATTERY_TEMPERATURE, exports.DEVICE_BOOT_TIME = DEVICE_BOOT_TIME, exports.DEVICE_BRAND = DEVICE_BRAND, exports.DEVICE_CHARGING = DEVICE_CHARGING, exports.DEVICE_CHIPSET = DEVICE_CHIPSET, exports.DEVICE_CLASS = DEVICE_CLASS, exports.DEVICE_CONNECTION_TYPE = DEVICE_CONNECTION_TYPE, exports.DEVICE_CPU_DESCRIPTION = DEVICE_CPU_DESCRIPTION, exports.DEVICE_EXTERNAL_FREE_STORAGE = DEVICE_EXTERNAL_FREE_STORAGE, exports.DEVICE_EXTERNAL_STORAGE_SIZE = DEVICE_EXTERNAL_STORAGE_SIZE, exports.DEVICE_FAMILY = DEVICE_FAMILY, exports.DEVICE_FREE_MEMORY = DEVICE_FREE_MEMORY, exports.DEVICE_FREE_STORAGE = DEVICE_FREE_STORAGE, exports.DEVICE_ID = DEVICE_ID, exports.DEVICE_LOCALE = DEVICE_LOCALE, exports.DEVICE_LOW_MEMORY = DEVICE_LOW_MEMORY, exports.DEVICE_LOW_POWER_MODE = DEVICE_LOW_POWER_MODE, exports.DEVICE_MANUFACTURER = DEVICE_MANUFACTURER, exports.DEVICE_MEMORY_ESTIMATED_CAPACITY = DEVICE_MEMORY_ESTIMATED_CAPACITY, exports.DEVICE_MEMORY_SIZE = DEVICE_MEMORY_SIZE, exports.DEVICE_MODEL = DEVICE_MODEL, exports.DEVICE_MODEL_ID = DEVICE_MODEL_ID, exports.DEVICE_NAME = DEVICE_NAME, exports.DEVICE_ONLINE = DEVICE_ONLINE, exports.DEVICE_ORIENTATION = DEVICE_ORIENTATION, exports.DEVICE_PROCESSOR_COUNT = DEVICE_PROCESSOR_COUNT, exports.DEVICE_PROCESSOR_FREQUENCY = DEVICE_PROCESSOR_FREQUENCY, exports.DEVICE_SCREEN_DENSITY = DEVICE_SCREEN_DENSITY, exports.DEVICE_SCREEN_DPI = DEVICE_SCREEN_DPI, exports.DEVICE_SCREEN_HEIGHT_PIXELS = DEVICE_SCREEN_HEIGHT_PIXELS, exports.DEVICE_SCREEN_WIDTH_PIXELS = DEVICE_SCREEN_WIDTH_PIXELS, exports.DEVICE_SIMULATOR = DEVICE_SIMULATOR, exports.DEVICE_STORAGE_SIZE = DEVICE_STORAGE_SIZE, exports.DEVICE_THERMAL_STATE = DEVICE_THERMAL_STATE, exports.DEVICE_TIMEZONE = DEVICE_TIMEZONE, exports.DEVICE_USABLE_MEMORY = DEVICE_USABLE_MEMORY, exports.EFFECTIVECONNECTIONTYPE = EFFECTIVECONNECTIONTYPE, exports.ENVIRONMENT = ENVIRONMENT, exports.ERROR_TYPE = ERROR_TYPE, exports.EVENT_ID = EVENT_ID, exports.EVENT_NAME = EVENT_NAME, exports.EXCEPTION_ESCAPED = EXCEPTION_ESCAPED, exports.EXCEPTION_MESSAGE = EXCEPTION_MESSAGE, exports.EXCEPTION_STACKTRACE = EXCEPTION_STACKTRACE, exports.EXCEPTION_TYPE = EXCEPTION_TYPE, exports.FAAS_COLDSTART = FAAS_COLDSTART, exports.FAAS_CRON = FAAS_CRON, exports.FAAS_DURATION_IN_MS = FAAS_DURATION_IN_MS, exports.FAAS_ENTRY_POINT = FAAS_ENTRY_POINT, exports.FAAS_IDENTITY = FAAS_IDENTITY, exports.FAAS_INVOCATION_ID = FAAS_INVOCATION_ID, exports.FAAS_NAME = FAAS_NAME, exports.FAAS_TIME = FAAS_TIME, exports.FAAS_TRIGGER = FAAS_TRIGGER, exports.FAAS_VERSION = FAAS_VERSION, exports.FCP = FCP, exports.FLAG_EVALUATION_KEY = FLAG_EVALUATION_KEY, exports.FP = FP, exports.FRAMES_DELAY = FRAMES_DELAY, exports.FRAMES_FROZEN = FRAMES_FROZEN, exports.FRAMES_FROZEN_RATE = FRAMES_FROZEN_RATE, exports.FRAMES_SLOW = FRAMES_SLOW, exports.FRAMES_SLOW_RATE = FRAMES_SLOW_RATE, exports.FRAMES_TOTAL = FRAMES_TOTAL, exports.FS_ERROR = FS_ERROR, exports.GCP_FUNCTION_CONTEXT_EVENT_ID = GCP_FUNCTION_CONTEXT_EVENT_ID, exports.GCP_FUNCTION_CONTEXT_EVENT_TYPE = GCP_FUNCTION_CONTEXT_EVENT_TYPE, exports.GCP_FUNCTION_CONTEXT_ID = GCP_FUNCTION_CONTEXT_ID, exports.GCP_FUNCTION_CONTEXT_RESOURCE = GCP_FUNCTION_CONTEXT_RESOURCE, exports.GCP_FUNCTION_CONTEXT_SOURCE = GCP_FUNCTION_CONTEXT_SOURCE, exports.GCP_FUNCTION_CONTEXT_SPECVERSION = GCP_FUNCTION_CONTEXT_SPECVERSION, exports.GCP_FUNCTION_CONTEXT_TIME = GCP_FUNCTION_CONTEXT_TIME, exports.GCP_FUNCTION_CONTEXT_TIMESTAMP = GCP_FUNCTION_CONTEXT_TIMESTAMP, exports.GCP_FUNCTION_CONTEXT_TYPE = GCP_FUNCTION_CONTEXT_TYPE, exports.GCP_PROJECT_ID = GCP_PROJECT_ID, exports.GEN_AI_AGENT_NAME = GEN_AI_AGENT_NAME, exports.GEN_AI_CONTEXT_UTILIZATION = GEN_AI_CONTEXT_UTILIZATION, exports.GEN_AI_CONTEXT_WINDOW_SIZE = GEN_AI_CONTEXT_WINDOW_SIZE, exports.GEN_AI_CONVERSATION_ID = GEN_AI_CONVERSATION_ID, exports.GEN_AI_COST_INPUT_TOKENS = GEN_AI_COST_INPUT_TOKENS, exports.GEN_AI_COST_OUTPUT_TOKENS = GEN_AI_COST_OUTPUT_TOKENS, exports.GEN_AI_COST_TOTAL_TOKENS = GEN_AI_COST_TOTAL_TOKENS, exports.GEN_AI_EMBEDDINGS_INPUT = GEN_AI_EMBEDDINGS_INPUT, exports.GEN_AI_FUNCTION_ID = GEN_AI_FUNCTION_ID, exports.GEN_AI_INPUT_MESSAGES = GEN_AI_INPUT_MESSAGES, exports.GEN_AI_OPERATION_NAME = GEN_AI_OPERATION_NAME, exports.GEN_AI_OPERATION_TYPE = GEN_AI_OPERATION_TYPE, exports.GEN_AI_OUTPUT_MESSAGES = GEN_AI_OUTPUT_MESSAGES, exports.GEN_AI_PIPELINE_NAME = GEN_AI_PIPELINE_NAME, exports.GEN_AI_PROMPT = GEN_AI_PROMPT, exports.GEN_AI_PROMPT_NAME = GEN_AI_PROMPT_NAME, exports.GEN_AI_PROVIDER_NAME = GEN_AI_PROVIDER_NAME, exports.GEN_AI_REQUEST_AVAILABLE_TOOLS = GEN_AI_REQUEST_AVAILABLE_TOOLS, exports.GEN_AI_REQUEST_FREQUENCY_PENALTY = GEN_AI_REQUEST_FREQUENCY_PENALTY, exports.GEN_AI_REQUEST_MAX_TOKENS = GEN_AI_REQUEST_MAX_TOKENS, exports.GEN_AI_REQUEST_MESSAGES = GEN_AI_REQUEST_MESSAGES, exports.GEN_AI_REQUEST_MODEL = GEN_AI_REQUEST_MODEL, exports.GEN_AI_REQUEST_PRESENCE_PENALTY = GEN_AI_REQUEST_PRESENCE_PENALTY, exports.GEN_AI_REQUEST_SEED = GEN_AI_REQUEST_SEED, exports.GEN_AI_REQUEST_TEMPERATURE = GEN_AI_REQUEST_TEMPERATURE, exports.GEN_AI_REQUEST_TOP_K = GEN_AI_REQUEST_TOP_K, exports.GEN_AI_REQUEST_TOP_P = GEN_AI_REQUEST_TOP_P, exports.GEN_AI_RESPONSE_FINISH_REASONS = GEN_AI_RESPONSE_FINISH_REASONS, exports.GEN_AI_RESPONSE_ID = GEN_AI_RESPONSE_ID, exports.GEN_AI_RESPONSE_MODEL = GEN_AI_RESPONSE_MODEL, exports.GEN_AI_RESPONSE_STREAMING = GEN_AI_RESPONSE_STREAMING, exports.GEN_AI_RESPONSE_TEXT = GEN_AI_RESPONSE_TEXT, exports.GEN_AI_RESPONSE_TIME_TO_FIRST_CHUNK = GEN_AI_RESPONSE_TIME_TO_FIRST_CHUNK, exports.GEN_AI_RESPONSE_TIME_TO_FIRST_TOKEN = GEN_AI_RESPONSE_TIME_TO_FIRST_TOKEN, exports.GEN_AI_RESPONSE_TOKENS_PER_SECOND = GEN_AI_RESPONSE_TOKENS_PER_SECOND, exports.GEN_AI_RESPONSE_TOOL_CALLS = GEN_AI_RESPONSE_TOOL_CALLS, exports.GEN_AI_SYSTEM = GEN_AI_SYSTEM, exports.GEN_AI_SYSTEM_INSTRUCTIONS = GEN_AI_SYSTEM_INSTRUCTIONS, exports.GEN_AI_SYSTEM_MESSAGE = GEN_AI_SYSTEM_MESSAGE, exports.GEN_AI_TOOL_CALL_ARGUMENTS = GEN_AI_TOOL_CALL_ARGUMENTS, exports.GEN_AI_TOOL_CALL_RESULT = GEN_AI_TOOL_CALL_RESULT, exports.GEN_AI_TOOL_DEFINITIONS = GEN_AI_TOOL_DEFINITIONS, exports.GEN_AI_TOOL_DESCRIPTION = GEN_AI_TOOL_DESCRIPTION, exports.GEN_AI_TOOL_INPUT = GEN_AI_TOOL_INPUT, exports.GEN_AI_TOOL_MESSAGE = GEN_AI_TOOL_MESSAGE, exports.GEN_AI_TOOL_NAME = GEN_AI_TOOL_NAME, exports.GEN_AI_TOOL_OUTPUT = GEN_AI_TOOL_OUTPUT, exports.GEN_AI_TOOL_TYPE = GEN_AI_TOOL_TYPE, exports.GEN_AI_USAGE_CACHE_CREATION_INPUT_TOKENS = GEN_AI_USAGE_CACHE_CREATION_INPUT_TOKENS, exports.GEN_AI_USAGE_CACHE_READ_INPUT_TOKENS = GEN_AI_USAGE_CACHE_READ_INPUT_TOKENS, exports.GEN_AI_USAGE_COMPLETION_TOKENS = GEN_AI_USAGE_COMPLETION_TOKENS, exports.GEN_AI_USAGE_INPUT_TOKENS = GEN_AI_USAGE_INPUT_TOKENS, exports.GEN_AI_USAGE_INPUT_TOKENS_CACHED = GEN_AI_USAGE_INPUT_TOKENS_CACHED, exports.GEN_AI_USAGE_INPUT_TOKENS_CACHE_WRITE = GEN_AI_USAGE_INPUT_TOKENS_CACHE_WRITE, exports.GEN_AI_USAGE_OUTPUT_TOKENS = GEN_AI_USAGE_OUTPUT_TOKENS, exports.GEN_AI_USAGE_OUTPUT_TOKENS_REASONING = GEN_AI_USAGE_OUTPUT_TOKENS_REASONING, exports.GEN_AI_USAGE_PROMPT_TOKENS = GEN_AI_USAGE_PROMPT_TOKENS, exports.GEN_AI_USAGE_REASONING_OUTPUT_TOKENS = GEN_AI_USAGE_REASONING_OUTPUT_TOKENS, exports.GEN_AI_USAGE_TOTAL_TOKENS = GEN_AI_USAGE_TOTAL_TOKENS, exports.GRAPHQL_DOCUMENT = GRAPHQL_DOCUMENT, exports.GRAPHQL_OPERATION_NAME = GRAPHQL_OPERATION_NAME, exports.GRAPHQL_OPERATION_TYPE = GRAPHQL_OPERATION_TYPE, exports.HARDWARECONCURRENCY = HARDWARECONCURRENCY, exports.HTTP_CLIENT_IP = HTTP_CLIENT_IP, exports.HTTP_DECODED_RESPONSE_CONTENT_LENGTH = HTTP_DECODED_RESPONSE_CONTENT_LENGTH, exports.HTTP_FLAVOR = HTTP_FLAVOR, exports.HTTP_FRAGMENT = HTTP_FRAGMENT, exports.HTTP_HOST = HTTP_HOST, exports.HTTP_METHOD = HTTP_METHOD, exports.HTTP_QUERY = HTTP_QUERY, exports.HTTP_REQUEST_BODY_DATA = HTTP_REQUEST_BODY_DATA, exports.HTTP_REQUEST_CONNECTION_END = HTTP_REQUEST_CONNECTION_END, exports.HTTP_REQUEST_CONNECT_START = HTTP_REQUEST_CONNECT_START, exports.HTTP_REQUEST_DOMAIN_LOOKUP_END = HTTP_REQUEST_DOMAIN_LOOKUP_END, exports.HTTP_REQUEST_DOMAIN_LOOKUP_START = HTTP_REQUEST_DOMAIN_LOOKUP_START, exports.HTTP_REQUEST_FETCH_START = HTTP_REQUEST_FETCH_START, exports.HTTP_REQUEST_HEADER_KEY = HTTP_REQUEST_HEADER_KEY, exports.HTTP_REQUEST_METHOD = HTTP_REQUEST_METHOD, exports.HTTP_REQUEST_REDIRECT_END = HTTP_REQUEST_REDIRECT_END, exports.HTTP_REQUEST_REDIRECT_START = HTTP_REQUEST_REDIRECT_START, exports.HTTP_REQUEST_REQUEST_START = HTTP_REQUEST_REQUEST_START, exports.HTTP_REQUEST_RESEND_COUNT = HTTP_REQUEST_RESEND_COUNT, exports.HTTP_REQUEST_RESPONSE_END = HTTP_REQUEST_RESPONSE_END, exports.HTTP_REQUEST_RESPONSE_START = HTTP_REQUEST_RESPONSE_START, exports.HTTP_REQUEST_SECURE_CONNECTION_START = HTTP_REQUEST_SECURE_CONNECTION_START, exports.HTTP_REQUEST_TIME_TO_FIRST_BYTE = HTTP_REQUEST_TIME_TO_FIRST_BYTE, exports.HTTP_REQUEST_WORKER_START = HTTP_REQUEST_WORKER_START, exports.HTTP_RESPONSE_BODY_SIZE = HTTP_RESPONSE_BODY_SIZE, exports.HTTP_RESPONSE_CONTENT_LENGTH = HTTP_RESPONSE_CONTENT_LENGTH, exports.HTTP_RESPONSE_HEADER_CONTENT_LENGTH = HTTP_RESPONSE_HEADER_CONTENT_LENGTH, exports.HTTP_RESPONSE_HEADER_KEY = HTTP_RESPONSE_HEADER_KEY, exports.HTTP_RESPONSE_SIZE = HTTP_RESPONSE_SIZE, exports.HTTP_RESPONSE_STATUS_CODE = HTTP_RESPONSE_STATUS_CODE, exports.HTTP_RESPONSE_TRANSFER_SIZE = HTTP_RESPONSE_TRANSFER_SIZE, exports.HTTP_ROUTE = HTTP_ROUTE, exports.HTTP_SCHEME = HTTP_SCHEME, exports.HTTP_SERVER_NAME = HTTP_SERVER_NAME, exports.HTTP_SERVER_REQUEST_TIME_IN_QUEUE = HTTP_SERVER_REQUEST_TIME_IN_QUEUE, exports.HTTP_STATUS_CODE = HTTP_STATUS_CODE, exports.HTTP_TARGET = HTTP_TARGET, exports.HTTP_URL = HTTP_URL, exports.HTTP_USER_AGENT = HTTP_USER_AGENT, exports.ID = ID, exports.INP = INP, exports.JSONRPC_PROTOCOL_VERSION = JSONRPC_PROTOCOL_VERSION, exports.JSONRPC_REQUEST_ID = JSONRPC_REQUEST_ID, exports.JVM_GC_ACTION = JVM_GC_ACTION, exports.JVM_GC_NAME = JVM_GC_NAME, exports.JVM_MEMORY_POOL_NAME = JVM_MEMORY_POOL_NAME, exports.JVM_MEMORY_TYPE = JVM_MEMORY_TYPE, exports.JVM_THREAD_DAEMON = JVM_THREAD_DAEMON, exports.JVM_THREAD_STATE = JVM_THREAD_STATE, exports.LCP = LCP, exports.LCP_ELEMENT = LCP_ELEMENT, exports.LCP_ID = LCP_ID, exports.LCP_LOADTIME = LCP_LOADTIME, exports.LCP_RENDERTIME = LCP_RENDERTIME, exports.LCP_SIZE = LCP_SIZE, exports.LCP_URL = LCP_URL, exports.LOGGER_NAME = LOGGER_NAME, exports.MCP_CANCELLED_REASON = MCP_CANCELLED_REASON, exports.MCP_CANCELLED_REQUEST_ID = MCP_CANCELLED_REQUEST_ID, exports.MCP_CLIENT_NAME = MCP_CLIENT_NAME, exports.MCP_CLIENT_TITLE = MCP_CLIENT_TITLE, exports.MCP_CLIENT_VERSION = MCP_CLIENT_VERSION, exports.MCP_LIFECYCLE_PHASE = MCP_LIFECYCLE_PHASE, exports.MCP_LOGGING_DATA_TYPE = MCP_LOGGING_DATA_TYPE, exports.MCP_LOGGING_LEVEL = MCP_LOGGING_LEVEL, exports.MCP_LOGGING_LOGGER = MCP_LOGGING_LOGGER, exports.MCP_LOGGING_MESSAGE = MCP_LOGGING_MESSAGE, exports.MCP_METHOD_NAME = MCP_METHOD_NAME, exports.MCP_PROGRESS_CURRENT = MCP_PROGRESS_CURRENT, exports.MCP_PROGRESS_MESSAGE = MCP_PROGRESS_MESSAGE, exports.MCP_PROGRESS_PERCENTAGE = MCP_PROGRESS_PERCENTAGE, exports.MCP_PROGRESS_TOKEN = MCP_PROGRESS_TOKEN, exports.MCP_PROGRESS_TOTAL = MCP_PROGRESS_TOTAL, exports.MCP_PROMPT_NAME = MCP_PROMPT_NAME, exports.MCP_PROMPT_RESULT_DESCRIPTION = MCP_PROMPT_RESULT_DESCRIPTION, exports.MCP_PROMPT_RESULT_MESSAGE_CONTENT = MCP_PROMPT_RESULT_MESSAGE_CONTENT, exports.MCP_PROMPT_RESULT_MESSAGE_COUNT = MCP_PROMPT_RESULT_MESSAGE_COUNT, exports.MCP_PROMPT_RESULT_MESSAGE_ROLE = MCP_PROMPT_RESULT_MESSAGE_ROLE, exports.MCP_PROTOCOL_READY = MCP_PROTOCOL_READY, exports.MCP_PROTOCOL_VERSION = MCP_PROTOCOL_VERSION, exports.MCP_REQUEST_ARGUMENT_KEY = MCP_REQUEST_ARGUMENT_KEY, exports.MCP_REQUEST_ARGUMENT_NAME = MCP_REQUEST_ARGUMENT_NAME, exports.MCP_REQUEST_ARGUMENT_URI = MCP_REQUEST_ARGUMENT_URI, exports.MCP_REQUEST_ID = MCP_REQUEST_ID, exports.MCP_RESOURCE_PROTOCOL = MCP_RESOURCE_PROTOCOL, exports.MCP_RESOURCE_URI = MCP_RESOURCE_URI, exports.MCP_SERVER_NAME = MCP_SERVER_NAME, exports.MCP_SERVER_TITLE = MCP_SERVER_TITLE, exports.MCP_SERVER_VERSION = MCP_SERVER_VERSION, exports.MCP_SESSION_ID = MCP_SESSION_ID, exports.MCP_TOOL_NAME = MCP_TOOL_NAME, exports.MCP_TOOL_RESULT_CONTENT = MCP_TOOL_RESULT_CONTENT, exports.MCP_TOOL_RESULT_CONTENT_COUNT = MCP_TOOL_RESULT_CONTENT_COUNT, exports.MCP_TOOL_RESULT_IS_ERROR = MCP_TOOL_RESULT_IS_ERROR, exports.MCP_TRANSPORT = MCP_TRANSPORT, exports.MDC_KEY = MDC_KEY, exports.MESSAGING_BATCH_MESSAGE_COUNT = MESSAGING_BATCH_MESSAGE_COUNT, exports.MESSAGING_DESTINATION_CONNECTION = MESSAGING_DESTINATION_CONNECTION, exports.MESSAGING_DESTINATION_NAME = MESSAGING_DESTINATION_NAME, exports.MESSAGING_MESSAGE_BODY_SIZE = MESSAGING_MESSAGE_BODY_SIZE, exports.MESSAGING_MESSAGE_ENVELOPE_SIZE = MESSAGING_MESSAGE_ENVELOPE_SIZE, exports.MESSAGING_MESSAGE_ID = MESSAGING_MESSAGE_ID, exports.MESSAGING_MESSAGE_RECEIVE_LATENCY = MESSAGING_MESSAGE_RECEIVE_LATENCY, exports.MESSAGING_MESSAGE_RETRY_COUNT = MESSAGING_MESSAGE_RETRY_COUNT, exports.MESSAGING_OPERATION_NAME = MESSAGING_OPERATION_NAME, exports.MESSAGING_OPERATION_TYPE = MESSAGING_OPERATION_TYPE, exports.MESSAGING_SYSTEM = MESSAGING_SYSTEM, exports.METHOD = METHOD, exports.MIDDLEWARE_NAME = MIDDLEWARE_NAME, exports.NAVIGATION_TYPE = NAVIGATION_TYPE, exports.NEL_ELAPSED_TIME = NEL_ELAPSED_TIME, exports.NEL_PHASE = NEL_PHASE, exports.NEL_REFERRER = NEL_REFERRER, exports.NEL_SAMPLING_FUNCTION = NEL_SAMPLING_FUNCTION, exports.NEL_TYPE = NEL_TYPE, exports.NETWORK_CONNECTION_EFFECTIVE_TYPE = NETWORK_CONNECTION_EFFECTIVE_TYPE, exports.NETWORK_CONNECTION_RTT = NETWORK_CONNECTION_RTT, exports.NETWORK_CONNECTION_TYPE = NETWORK_CONNECTION_TYPE, exports.NETWORK_LOCAL_ADDRESS = NETWORK_LOCAL_ADDRESS, exports.NETWORK_LOCAL_PORT = NETWORK_LOCAL_PORT, exports.NETWORK_PEER_ADDRESS = NETWORK_PEER_ADDRESS, exports.NETWORK_PEER_PORT = NETWORK_PEER_PORT, exports.NETWORK_PROTOCOL_NAME = NETWORK_PROTOCOL_NAME, exports.NETWORK_PROTOCOL_VERSION = NETWORK_PROTOCOL_VERSION, exports.NETWORK_TRANSPORT = NETWORK_TRANSPORT, exports.NETWORK_TYPE = NETWORK_TYPE, exports.NET_HOST_IP = NET_HOST_IP, exports.NET_HOST_NAME = NET_HOST_NAME, exports.NET_HOST_PORT = NET_HOST_PORT, exports.NET_PEER_IP = NET_PEER_IP, exports.NET_PEER_NAME = NET_PEER_NAME, exports.NET_PEER_PORT = NET_PEER_PORT, exports.NET_PROTOCOL_NAME = NET_PROTOCOL_NAME, exports.NET_PROTOCOL_VERSION = NET_PROTOCOL_VERSION, exports.NET_SOCK_FAMILY = NET_SOCK_FAMILY, exports.NET_SOCK_HOST_ADDR = NET_SOCK_HOST_ADDR, exports.NET_SOCK_HOST_PORT = NET_SOCK_HOST_PORT, exports.NET_SOCK_PEER_ADDR = NET_SOCK_PEER_ADDR, exports.NET_SOCK_PEER_NAME = NET_SOCK_PEER_NAME, exports.NET_SOCK_PEER_PORT = NET_SOCK_PEER_PORT, exports.NET_TRANSPORT = NET_TRANSPORT, exports.OS_BUILD = OS_BUILD, exports.OS_BUILD_ID = OS_BUILD_ID, exports.OS_DESCRIPTION = OS_DESCRIPTION, exports.OS_KERNEL_VERSION = OS_KERNEL_VERSION, exports.OS_NAME = OS_NAME, exports.OS_RAW_DESCRIPTION = OS_RAW_DESCRIPTION, exports.OS_ROOTED = OS_ROOTED, exports.OS_THEME = OS_THEME, exports.OS_TYPE = OS_TYPE, exports.OS_VERSION = OS_VERSION, exports.OTEL_SCOPE_NAME = OTEL_SCOPE_NAME, exports.OTEL_SCOPE_VERSION = OTEL_SCOPE_VERSION, exports.OTEL_STATUS_CODE = OTEL_STATUS_CODE, exports.OTEL_STATUS_DESCRIPTION = OTEL_STATUS_DESCRIPTION, exports.PARAMS_KEY = PARAMS_KEY, exports.PERFORMANCE_ACTIVATIONSTART = PERFORMANCE_ACTIVATIONSTART, exports.PERFORMANCE_TIMEORIGIN = PERFORMANCE_TIMEORIGIN, exports.PREVIOUS_ROUTE = PREVIOUS_ROUTE, exports.PROCESS_COMMAND_ARGS = PROCESS_COMMAND_ARGS, exports.PROCESS_EXECUTABLE_NAME = PROCESS_EXECUTABLE_NAME, exports.PROCESS_PID = PROCESS_PID, exports.PROCESS_RUNTIME_DESCRIPTION = PROCESS_RUNTIME_DESCRIPTION, exports.PROCESS_RUNTIME_ENGINE_NAME = PROCESS_RUNTIME_ENGINE_NAME, exports.PROCESS_RUNTIME_ENGINE_VERSION = PROCESS_RUNTIME_ENGINE_VERSION, exports.PROCESS_RUNTIME_NAME = PROCESS_RUNTIME_NAME, exports.PROCESS_RUNTIME_VERSION = PROCESS_RUNTIME_VERSION, exports.QUERY_KEY = QUERY_KEY, exports.REACT_VERSION = REACT_VERSION, exports.RELEASE = RELEASE, exports.REMIX_ACTION_FORM_DATA_KEY = REMIX_ACTION_FORM_DATA_KEY, exports.REPLAY_ID = REPLAY_ID, exports.RESOURCE_DEPLOYMENT_ENVIRONMENT = RESOURCE_DEPLOYMENT_ENVIRONMENT, exports.RESOURCE_DEPLOYMENT_ENVIRONMENT_NAME = RESOURCE_DEPLOYMENT_ENVIRONMENT_NAME, exports.RESOURCE_RENDER_BLOCKING_STATUS = RESOURCE_RENDER_BLOCKING_STATUS, exports.ROUTE = ROUTE, exports.RPC_GRPC_STATUS_CODE = RPC_GRPC_STATUS_CODE, exports.RPC_METHOD = RPC_METHOD, exports.RPC_RESPONSE_STATUS_CODE = RPC_RESPONSE_STATUS_CODE, exports.RPC_SERVICE = RPC_SERVICE, exports.RUNTIME_BUILD = RUNTIME_BUILD, exports.RUNTIME_NAME = RUNTIME_NAME, exports.RUNTIME_RAW_DESCRIPTION = RUNTIME_RAW_DESCRIPTION, exports.RUNTIME_VERSION = RUNTIME_VERSION, exports.SCORE_KEY = SCORE_KEY, exports.SCORE_RATIO_KEY = SCORE_RATIO_KEY, exports.SCORE_TOTAL = SCORE_TOTAL, exports.SCORE_WEIGHT_KEY = SCORE_WEIGHT_KEY, exports.SENTRY_ACTION = SENTRY_ACTION, exports.SENTRY_BROWSER_NAME = SENTRY_BROWSER_NAME, exports.SENTRY_BROWSER_VERSION = SENTRY_BROWSER_VERSION, exports.SENTRY_CANCELLATION_REASON = SENTRY_CANCELLATION_REASON, exports.SENTRY_CATEGORY = SENTRY_CATEGORY, exports.SENTRY_CLIENT_SAMPLE_RATE = SENTRY_CLIENT_SAMPLE_RATE, exports.SENTRY_DESCRIPTION = SENTRY_DESCRIPTION, exports.SENTRY_DIST = SENTRY_DIST, exports.SENTRY_DOMAIN = SENTRY_DOMAIN, exports.SENTRY_DSC_ENVIRONMENT = SENTRY_DSC_ENVIRONMENT, exports.SENTRY_DSC_PROJECT_ID = SENTRY_DSC_PROJECT_ID, exports.SENTRY_DSC_PUBLIC_KEY = SENTRY_DSC_PUBLIC_KEY, exports.SENTRY_DSC_RELEASE = SENTRY_DSC_RELEASE, exports.SENTRY_DSC_SAMPLED = SENTRY_DSC_SAMPLED, exports.SENTRY_DSC_SAMPLE_RATE = SENTRY_DSC_SAMPLE_RATE, exports.SENTRY_DSC_TRACE_ID = SENTRY_DSC_TRACE_ID, exports.SENTRY_DSC_TRANSACTION = SENTRY_DSC_TRANSACTION, exports.SENTRY_ENVIRONMENT = SENTRY_ENVIRONMENT, exports.SENTRY_EXCLUSIVE_TIME = SENTRY_EXCLUSIVE_TIME, exports.SENTRY_GRAPHQL_OPERATION = SENTRY_GRAPHQL_OPERATION, exports.SENTRY_GROUP = SENTRY_GROUP, exports.SENTRY_HTTP_PREFETCH = SENTRY_HTTP_PREFETCH, exports.SENTRY_IDLE_SPAN_FINISH_REASON = SENTRY_IDLE_SPAN_FINISH_REASON, exports.SENTRY_IS_REMOTE = SENTRY_IS_REMOTE, exports.SENTRY_KIND = SENTRY_KIND, exports.SENTRY_MAIN_THREAD = SENTRY_MAIN_THREAD, exports.SENTRY_MESSAGE_PARAMETER_KEY = SENTRY_MESSAGE_PARAMETER_KEY, exports.SENTRY_MESSAGE_TEMPLATE = SENTRY_MESSAGE_TEMPLATE, exports.SENTRY_MOBILE = SENTRY_MOBILE, exports.SENTRY_MODULE_KEY = SENTRY_MODULE_KEY, exports.SENTRY_NEXTJS_SSR_FUNCTION_ROUTE = SENTRY_NEXTJS_SSR_FUNCTION_ROUTE, exports.SENTRY_NEXTJS_SSR_FUNCTION_TYPE = SENTRY_NEXTJS_SSR_FUNCTION_TYPE, exports.SENTRY_NORMALIZED_DB_QUERY = SENTRY_NORMALIZED_DB_QUERY, exports.SENTRY_NORMALIZED_DB_QUERY_HASH = SENTRY_NORMALIZED_DB_QUERY_HASH, exports.SENTRY_NORMALIZED_DESCRIPTION = SENTRY_NORMALIZED_DESCRIPTION, exports.SENTRY_OBSERVED_TIMESTAMP_NANOS = SENTRY_OBSERVED_TIMESTAMP_NANOS, exports.SENTRY_OP = SENTRY_OP, exports.SENTRY_ORIGIN = SENTRY_ORIGIN, exports.SENTRY_PLATFORM = SENTRY_PLATFORM, exports.SENTRY_PROFILER_ID = SENTRY_PROFILER_ID, exports.SENTRY_PROFILE_ID = SENTRY_PROFILE_ID, exports.SENTRY_RELEASE = SENTRY_RELEASE, exports.SENTRY_REPLAY_ID = SENTRY_REPLAY_ID, exports.SENTRY_REPLAY_IS_BUFFERING = SENTRY_REPLAY_IS_BUFFERING, exports.SENTRY_REPORT_EVENT = SENTRY_REPORT_EVENT, exports.SENTRY_SDK_INTEGRATIONS = SENTRY_SDK_INTEGRATIONS, exports.SENTRY_SDK_NAME = SENTRY_SDK_NAME, exports.SENTRY_SDK_VERSION = SENTRY_SDK_VERSION, exports.SENTRY_SEGMENT_ID = SENTRY_SEGMENT_ID, exports.SENTRY_SEGMENT_NAME = SENTRY_SEGMENT_NAME, exports.SENTRY_SERVER_SAMPLE_RATE = SENTRY_SERVER_SAMPLE_RATE, exports.SENTRY_SOURCE = SENTRY_SOURCE, exports.SENTRY_SPAN_SOURCE = SENTRY_SPAN_SOURCE, exports.SENTRY_STATUS_CODE = SENTRY_STATUS_CODE, exports.SENTRY_STATUS_MESSAGE = SENTRY_STATUS_MESSAGE, exports.SENTRY_TIMESTAMP_SEQUENCE = SENTRY_TIMESTAMP_SEQUENCE, exports.SENTRY_TRACE_PARENT_SPAN_ID = SENTRY_TRACE_PARENT_SPAN_ID, exports.SENTRY_TRANSACTION = SENTRY_TRANSACTION, exports.SENTRY_USER_EMAIL = SENTRY_USER_EMAIL, exports.SENTRY_USER_GEO_CITY = SENTRY_USER_GEO_CITY, exports.SENTRY_USER_GEO_COUNTRY_CODE = SENTRY_USER_GEO_COUNTRY_CODE, exports.SENTRY_USER_GEO_REGION = SENTRY_USER_GEO_REGION, exports.SENTRY_USER_GEO_SUBDIVISION = SENTRY_USER_GEO_SUBDIVISION, exports.SENTRY_USER_ID = SENTRY_USER_ID, exports.SENTRY_USER_IP = SENTRY_USER_IP, exports.SENTRY_USER_USERNAME = SENTRY_USER_USERNAME, exports.SERVER_ADDRESS = SERVER_ADDRESS, exports.SERVER_PORT = SERVER_PORT, exports.SERVICE_NAME = SERVICE_NAME, exports.SERVICE_VERSION = SERVICE_VERSION, exports.SESSION_ID = SESSION_ID, exports.STALL_PERCENTAGE = STALL_PERCENTAGE, exports.STALL_TOTAL_TIME = STALL_TOTAL_TIME, exports.STATE_TYPE = STATE_TYPE, exports.THREAD_ID = THREAD_ID, exports.THREAD_NAME = THREAD_NAME, exports.TIMBER_TAG = TIMBER_TAG, exports.TIME_TO_FULL_DISPLAY = TIME_TO_FULL_DISPLAY, exports.TIME_TO_INITIAL_DISPLAY = TIME_TO_INITIAL_DISPLAY, exports.TRANSACTION = TRANSACTION, exports.TRPC_PROCEDURE_PATH = TRPC_PROCEDURE_PATH, exports.TRPC_PROCEDURE_TYPE = TRPC_PROCEDURE_TYPE, exports.TTFB = TTFB, exports.TTFB_REQUESTTIME = TTFB_REQUESTTIME, exports.TYPE = TYPE, exports.UI_COMPONENT_NAME = UI_COMPONENT_NAME, exports.UI_CONTRIBUTES_TO_TTFD = UI_CONTRIBUTES_TO_TTFD, exports.UI_CONTRIBUTES_TO_TTID = UI_CONTRIBUTES_TO_TTID, exports.UI_ELEMENT_HEIGHT = UI_ELEMENT_HEIGHT, exports.UI_ELEMENT_ID = UI_ELEMENT_ID, exports.UI_ELEMENT_IDENTIFIER = UI_ELEMENT_IDENTIFIER, exports.UI_ELEMENT_LOAD_TIME = UI_ELEMENT_LOAD_TIME, exports.UI_ELEMENT_PAINT_TYPE = UI_ELEMENT_PAINT_TYPE, exports.UI_ELEMENT_RENDER_TIME = UI_ELEMENT_RENDER_TIME, exports.UI_ELEMENT_TYPE = UI_ELEMENT_TYPE, exports.UI_ELEMENT_URL = UI_ELEMENT_URL, exports.UI_ELEMENT_WIDTH = UI_ELEMENT_WIDTH, exports.URL = URL, exports.URL_DOMAIN = URL_DOMAIN, exports.URL_FRAGMENT = URL_FRAGMENT, exports.URL_FULL = URL_FULL, exports.URL_PATH = URL_PATH, exports.URL_PATH_PARAMETER_KEY = URL_PATH_PARAMETER_KEY, exports.URL_PORT = URL_PORT, exports.URL_QUERY = URL_QUERY, exports.URL_SCHEME = URL_SCHEME, exports.URL_TEMPLATE = URL_TEMPLATE, exports.USER_AGENT_ORIGINAL = USER_AGENT_ORIGINAL, exports.USER_EMAIL = USER_EMAIL, exports.USER_FULL_NAME = USER_FULL_NAME, exports.USER_GEO_CITY = USER_GEO_CITY, exports.USER_GEO_COUNTRY_CODE = USER_GEO_COUNTRY_CODE, exports.USER_GEO_REGION = USER_GEO_REGION, exports.USER_GEO_SUBDIVISION = USER_GEO_SUBDIVISION, exports.USER_HASH = USER_HASH, exports.USER_ID = USER_ID, exports.USER_IP_ADDRESS = USER_IP_ADDRESS, exports.USER_NAME = USER_NAME, exports.USER_ROLES = USER_ROLES, exports.VERCEL_BRANCH = VERCEL_BRANCH, exports.VERCEL_BUILD_ID = VERCEL_BUILD_ID, exports.VERCEL_DEPLOYMENT_ID = VERCEL_DEPLOYMENT_ID, exports.VERCEL_DESTINATION = VERCEL_DESTINATION, exports.VERCEL_EDGE_TYPE = VERCEL_EDGE_TYPE, exports.VERCEL_ENTRYPOINT = VERCEL_ENTRYPOINT, exports.VERCEL_EXECUTION_REGION = VERCEL_EXECUTION_REGION, exports.VERCEL_ID = VERCEL_ID, exports.VERCEL_JA3_DIGEST = VERCEL_JA3_DIGEST, exports.VERCEL_JA4_DIGEST = VERCEL_JA4_DIGEST, exports.VERCEL_LOG_TYPE = VERCEL_LOG_TYPE, exports.VERCEL_PATH = VERCEL_PATH, exports.VERCEL_PROJECT_ID = VERCEL_PROJECT_ID, exports.VERCEL_PROJECT_NAME = VERCEL_PROJECT_NAME, exports.VERCEL_PROXY_CACHE_ID = VERCEL_PROXY_CACHE_ID, exports.VERCEL_PROXY_CLIENT_IP = VERCEL_PROXY_CLIENT_IP, exports.VERCEL_PROXY_HOST = VERCEL_PROXY_HOST, exports.VERCEL_PROXY_LAMBDA_REGION = VERCEL_PROXY_LAMBDA_REGION, exports.VERCEL_PROXY_METHOD = VERCEL_PROXY_METHOD, exports.VERCEL_PROXY_PATH = VERCEL_PROXY_PATH, exports.VERCEL_PROXY_PATH_TYPE = VERCEL_PROXY_PATH_TYPE, exports.VERCEL_PROXY_PATH_TYPE_VARIANT = VERCEL_PROXY_PATH_TYPE_VARIANT, exports.VERCEL_PROXY_REFERER = VERCEL_PROXY_REFERER, exports.VERCEL_PROXY_REGION = VERCEL_PROXY_REGION, exports.VERCEL_PROXY_RESPONSE_BYTE_SIZE = VERCEL_PROXY_RESPONSE_BYTE_SIZE, exports.VERCEL_PROXY_SCHEME = VERCEL_PROXY_SCHEME, exports.VERCEL_PROXY_STATUS_CODE = VERCEL_PROXY_STATUS_CODE, exports.VERCEL_PROXY_TIMESTAMP = VERCEL_PROXY_TIMESTAMP, exports.VERCEL_PROXY_USER_AGENT = VERCEL_PROXY_USER_AGENT, exports.VERCEL_PROXY_VERCEL_CACHE = VERCEL_PROXY_VERCEL_CACHE, exports.VERCEL_PROXY_VERCEL_ID = VERCEL_PROXY_VERCEL_ID, exports.VERCEL_PROXY_WAF_ACTION = VERCEL_PROXY_WAF_ACTION, exports.VERCEL_PROXY_WAF_RULE_ID = VERCEL_PROXY_WAF_RULE_ID, exports.VERCEL_REQUEST_ID = VERCEL_REQUEST_ID, exports.VERCEL_SOURCE = VERCEL_SOURCE, exports.VERCEL_STATUS_CODE = VERCEL_STATUS_CODE, exports._HTTP_REQUEST_METHOD = _HTTP_REQUEST_METHOD, exports._SENTRY_SEGMENT_ID = _SENTRY_SEGMENT_ID;
}));
//#endregion
//#region node_modules/@sentry/conventions/dist/op.cjs
var require_op = /* @__PURE__ */ __commonJSMin(((exports) => {
	exports.BROWSER_BROWSER_PAINT_SPAN_OP = "browser.paint", exports.BROWSER_BROWSER_SPAN_OP = "browser", exports.BROWSER_NAVIGATION_SPAN_OP = "navigation", exports.BROWSER_PAGELOAD_SPAN_OP = "pageload", exports.BROWSER_RESOURCE_CSS_SPAN_OP = "resource.css", exports.BROWSER_RESOURCE_IMG_SPAN_OP = "resource.img", exports.BROWSER_RESOURCE_LINK_SPAN_OP = "resource.link", exports.BROWSER_RESOURCE_OTHER_SPAN_OP = "resource.other", exports.BROWSER_RESOURCE_SCRIPT_SPAN_OP = "resource.script", exports.BROWSER_RESOURCE_SPAN_OP = "resource", exports.BROWSER_UI_ACTION_CLICK_SPAN_OP = "ui.action.click", exports.BROWSER_UI_ACTION_SPAN_OP = "ui.action", exports.BROWSER_UI_ANGULAR_SPAN_OP = "ui.angular", exports.BROWSER_UI_EMBER_SPAN_OP = "ui.ember", exports.BROWSER_UI_LIVEWIRE_SPAN_OP = "ui.livewire", exports.BROWSER_UI_REACT_MOUNT_SPAN_OP = "ui.react.mount", exports.BROWSER_UI_REACT_RENDER_SPAN_OP = "ui.react.render", exports.BROWSER_UI_REACT_SPAN_OP = "ui.react", exports.BROWSER_UI_REACT_UPDATE_SPAN_OP = "ui.react.update", exports.BROWSER_UI_RENDER_SPAN_OP = "ui.render", exports.BROWSER_UI_SPAN_OP = "ui", exports.BROWSER_UI_SVELTE_SPAN_OP = "ui.svelte", exports.BROWSER_UI_TASK_SPAN_OP = "ui.task", exports.BROWSER_UI_VUE_SPAN_OP = "ui.vue", exports.DATABASE_CACHE_SPAN_OP = "cache", exports.DATABASE_DB_QUERY_SPAN_OP = "db.query", exports.DATABASE_DB_SPAN_OP = "db", exports.FAAS_FUNCTION_AWS_SPAN_OP = "function.aws", exports.FAAS_FUNCTION_AZURE_SPAN_OP = "function.azure", exports.FAAS_FUNCTION_GCP_SPAN_OP = "function.gcp", exports.FAAS_GRPC_SPAN_OP = "grpc", exports.FAAS_HTTP_SPAN_OP = "http", exports.GENERAL_FUNCTION_SPAN_OP = "function", exports.GENERAL_MARK_SPAN_OP = "mark", exports.GEN_AI_CHAT_SPAN_OP = "chat", exports.GEN_AI_EXECUTE_TOOL_SPAN_OP = "execute_tool", exports.GEN_AI_HANDOFF_SPAN_OP = "handoff", exports.GEN_AI_INVOKE_AGENT_SPAN_OP = "invoke_agent", exports.MOBILE_APP_SPAN_OP = "app", exports.MOBILE_FILE_SPAN_OP = "file", exports.MOBILE_HTTP_SPAN_OP = "http", exports.MOBILE_NAVIGATION_SPAN_OP = "navigation", exports.MOBILE_SERIALIZE_SPAN_OP = "serialize", exports.MOBILE_UI_SPAN_OP = "ui", exports.WEB_SERVER_APP_SPAN_OP = "app", exports.WEB_SERVER_CONSOLE_SPAN_OP = "console", exports.WEB_SERVER_FILE_SPAN_OP = "file", exports.WEB_SERVER_FUNCTION_NEXTJS_SPAN_OP = "function.nextjs", exports.WEB_SERVER_FUNCTION_REMIX_SPAN_OP = "function.remix", exports.WEB_SERVER_FUNCTION_SPAN_OP = "function", exports.WEB_SERVER_GRAPHQL_SPAN_OP = "graphql", exports.WEB_SERVER_GRPC_SPAN_OP = "grpc", exports.WEB_SERVER_HTTP_CLIENT_SPAN_OP = "http.client", exports.WEB_SERVER_HTTP_SERVER_SPAN_OP = "http.server", exports.WEB_SERVER_HTTP_SPAN_OP = "http", exports.WEB_SERVER_MIDDLEWARE_SPAN_OP = "middleware", exports.WEB_SERVER_RPC_SPAN_OP = "rpc", exports.WEB_SERVER_SERIALIZE_SPAN_OP = "serialize", exports.WEB_SERVER_SUBPROCESS_SPAN_OP = "subprocess", exports.WEB_SERVER_TEMPLATE_SPAN_OP = "template", exports.WEB_SERVER_VIEW_SPAN_OP = "view", exports.WEB_SERVER_WEBSOCKET_SPAN_OP = "websocket";
}));
//#endregion
export { require_attributes as n, require_op as t };
