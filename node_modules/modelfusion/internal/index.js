var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src/core/api/retryNever.ts
var retryNever = () => async (f) => f();

// src/core/api/throttleOff.ts
var throttleOff = () => (fn) => fn();

// src/core/api/callWithRetryAndThrottle.ts
var callWithRetryAndThrottle = async ({
  retry = retryNever(),
  throttle = throttleOff(),
  call
}) => retry(async () => throttle(call));

// src/core/api/LoadAPIKeyError.ts
var LoadAPIKeyError = class extends Error {
  constructor({ message }) {
    super(message);
    this.name = "LoadAPIKeyError";
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message
    };
  }
};

// src/core/api/loadApiKey.ts
function loadApiKey({
  apiKey,
  environmentVariableName,
  apiKeyParameterName = "apiKey",
  description
}) {
  if (apiKey != null) {
    return apiKey;
  }
  if (typeof process === "undefined") {
    throw new LoadAPIKeyError({
      message: `${description} API key is missing. Pass it using the '${apiKeyParameterName}' parameter into the API configuration. Environment variables is not supported in this environment.`
    });
  }
  apiKey = process.env[environmentVariableName];
  if (apiKey == null) {
    throw new LoadAPIKeyError({
      message: `${description} API key is missing. Pass it using the '${apiKeyParameterName}' parameter into the API configuration or set it as an environment variable named ${environmentVariableName}.`
    });
  }
  return apiKey;
}

// src/util/format/UInt8Utils.ts
function base64ToUint8Array(base64String) {
  return Uint8Array.from(
    globalThis.atob(base64UrlToBase64(base64String)),
    (x) => x.codePointAt(0)
  );
}
function base64UrlToBase64(base64url) {
  return base64url.replaceAll("-", "+").replaceAll("_", "/");
}

// src/util/format/DataContent.ts
function convertDataContentToUint8Array(content) {
  if (content instanceof Uint8Array) {
    return content;
  }
  if (typeof content === "string") {
    return base64ToUint8Array(content);
  }
  if (content instanceof ArrayBuffer) {
    return new Uint8Array(content);
  }
  throw new Error(
    `Invalid data content. Expected a string, Uint8Array, ArrayBuffer, or Buffer, but got ${typeof content}.`
  );
}

// src/core/schema/parseJSON.ts
import SecureJSON from "secure-json-parse";

// src/util/getErrorMessage.ts
function getErrorMessage(error) {
  if (error == null) {
    return "unknown error";
  }
  if (typeof error === "string") {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return JSON.stringify(error);
}

// src/core/schema/JSONParseError.ts
var JSONParseError = class extends Error {
  // note: property order determines debugging output
  text;
  cause;
  constructor({ text, cause }) {
    super(
      `JSON parsing failed: Text: ${text}.
Error message: ${getErrorMessage(cause)}`
    );
    this.name = "JSONParseError";
    this.cause = cause;
    this.text = text;
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      cause: this.cause,
      stack: this.stack,
      valueText: this.text
    };
  }
};

// src/core/schema/TypeValidationError.ts
var TypeValidationError = class extends Error {
  value;
  cause;
  constructor({ value, cause }) {
    super(
      `Type validation failed: Value: ${JSON.stringify(value)}.
Error message: ${getErrorMessage(cause)}`
    );
    this.name = "TypeValidationError";
    this.cause = cause;
    this.value = value;
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      cause: this.cause,
      stack: this.stack,
      value: this.value
    };
  }
};

// src/core/schema/validateTypes.ts
function validateTypes({
  value,
  schema
}) {
  try {
    const validationResult = schema.validate(value);
    if (!validationResult.success) {
      throw new TypeValidationError({
        value,
        cause: validationResult.error
      });
    }
    return validationResult.value;
  } catch (error) {
    if (error instanceof TypeValidationError) {
      throw error;
    }
    throw new TypeValidationError({ value, cause: error });
  }
}
function safeValidateTypes({
  value,
  schema
}) {
  try {
    const validationResult = schema.validate(value);
    if (validationResult.success) {
      return validationResult;
    }
    return {
      success: false,
      error: new TypeValidationError({
        value,
        cause: validationResult.error
      })
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof TypeValidationError ? error : new TypeValidationError({ value, cause: error })
    };
  }
}

// src/core/schema/parseJSON.ts
function parseJSON({
  text,
  schema
}) {
  try {
    const value = SecureJSON.parse(text);
    if (schema == null) {
      return value;
    }
    return validateTypes({ value, schema });
  } catch (error) {
    if (error instanceof JSONParseError || error instanceof TypeValidationError) {
      throw error;
    }
    throw new JSONParseError({ text, cause: error });
  }
}
function safeParseJSON({
  text,
  schema
}) {
  try {
    const value = SecureJSON.parse(text);
    if (schema == null) {
      return {
        success: true,
        value
      };
    }
    return safeValidateTypes({ value, schema });
  } catch (error) {
    return {
      success: false,
      error: error instanceof JSONParseError ? error : new JSONParseError({ text, cause: error })
    };
  }
}

// src/core/api/ApiCallError.ts
var ApiCallError = class extends Error {
  url;
  requestBodyValues;
  statusCode;
  responseBody;
  cause;
  isRetryable;
  data;
  constructor({
    message,
    url,
    requestBodyValues,
    statusCode,
    responseBody,
    cause,
    isRetryable = statusCode != null && (statusCode === 429 || statusCode >= 500),
    data
  }) {
    super(message);
    this.name = "ApiCallError";
    this.url = url;
    this.requestBodyValues = requestBodyValues;
    this.statusCode = statusCode;
    this.responseBody = responseBody;
    this.cause = cause;
    this.isRetryable = isRetryable;
    this.data = data;
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      url: this.url,
      requestBodyValues: this.requestBodyValues,
      statusCode: this.statusCode,
      responseBody: this.responseBody,
      cause: this.cause,
      isRetryable: this.isRetryable,
      data: this.data
    };
  }
};

// src/core/api/postToApi.ts
var createJsonErrorResponseHandler = ({
  errorSchema,
  errorToMessage,
  isRetryable
}) => async ({ response, url, requestBodyValues }) => {
  const responseBody = await response.text();
  if (responseBody.trim() === "") {
    return new ApiCallError({
      message: response.statusText,
      url,
      requestBodyValues,
      statusCode: response.status,
      responseBody,
      isRetryable: isRetryable?.(response)
    });
  }
  try {
    const parsedError = parseJSON({
      text: responseBody,
      schema: errorSchema
    });
    return new ApiCallError({
      message: errorToMessage(parsedError),
      url,
      requestBodyValues,
      statusCode: response.status,
      responseBody,
      data: parsedError,
      isRetryable: isRetryable?.(response, parsedError)
    });
  } catch (parseError) {
    return new ApiCallError({
      message: response.statusText,
      url,
      requestBodyValues,
      statusCode: response.status,
      responseBody,
      isRetryable: isRetryable?.(response)
    });
  }
};
var createTextErrorResponseHandler = ({
  isRetryable
} = {}) => async ({ response, url, requestBodyValues }) => {
  const responseBody = await response.text();
  return new ApiCallError({
    message: responseBody.trim() !== "" ? responseBody : response.statusText,
    url,
    requestBodyValues,
    statusCode: response.status,
    responseBody,
    isRetryable: isRetryable?.(response)
  });
};
var createJsonResponseHandler = (responseSchema) => async ({ response, url, requestBodyValues }) => {
  const responseBody = await response.text();
  const parsedResult = safeParseJSON({
    text: responseBody,
    schema: responseSchema
  });
  if (!parsedResult.success) {
    throw new ApiCallError({
      message: "Invalid JSON response",
      cause: parsedResult.error,
      statusCode: response.status,
      responseBody,
      url,
      requestBodyValues
    });
  }
  return parsedResult.value;
};
var createTextResponseHandler = () => async ({ response }) => response.text();
var createAudioMpegResponseHandler = () => async ({ response, url, requestBodyValues }) => {
  if (response.headers.get("Content-Type") !== "audio/mpeg") {
    throw new ApiCallError({
      message: "Invalid Content-Type (must be audio/mpeg)",
      statusCode: response.status,
      url,
      requestBodyValues
    });
  }
  return convertDataContentToUint8Array(await response.arrayBuffer());
};
var postJsonToApi = async ({
  url,
  headers,
  body,
  failedResponseHandler,
  successfulResponseHandler,
  abortSignal
}) => postToApi({
  url,
  headers: {
    ...headers,
    "Content-Type": "application/json"
  },
  body: {
    content: JSON.stringify(body),
    values: body
  },
  failedResponseHandler,
  successfulResponseHandler,
  abortSignal
});
var postToApi = async ({
  url,
  headers = {},
  body,
  successfulResponseHandler,
  failedResponseHandler,
  abortSignal
}) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: body.content,
      signal: abortSignal
    });
    if (!response.ok) {
      try {
        throw await failedResponseHandler({
          response,
          url,
          requestBodyValues: body.values
        });
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === "AbortError" || error instanceof ApiCallError) {
            throw error;
          }
        }
        throw new ApiCallError({
          message: "Failed to process error response",
          cause: error,
          statusCode: response.status,
          url,
          requestBodyValues: body.values
        });
      }
    }
    try {
      return await successfulResponseHandler({
        response,
        url,
        requestBodyValues: body.values
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError" || error instanceof ApiCallError) {
          throw error;
        }
      }
      throw new ApiCallError({
        message: "Failed to process successful response",
        cause: error,
        statusCode: response.status,
        url,
        requestBodyValues: body.values
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw error;
      }
    }
    if (error instanceof TypeError && error.message === "fetch failed") {
      const cause = error.cause;
      if (cause != null) {
        throw new ApiCallError({
          message: `Cannot connect to API: ${cause.message}`,
          cause,
          url,
          requestBodyValues: body.values,
          isRetryable: true
        });
      }
    }
    throw error;
  }
};

// src/core/executeFunctionCall.ts
import { nanoid as createId } from "nanoid";

// src/core/FunctionEventSource.ts
var FunctionEventSource = class {
  observers;
  errorHandler;
  constructor({
    observers,
    errorHandler
  }) {
    this.observers = observers;
    this.errorHandler = errorHandler ?? ((error) => console.error(error));
  }
  notify(event) {
    for (const observer of this.observers) {
      try {
        observer.onFunctionEvent(event);
      } catch (error) {
        this.errorHandler(error);
      }
    }
  }
};

// src/core/ModelFusionConfiguration.ts
var globalLogFormat = void 0;
var globalFunctionObservers = [];
function getFunctionObservers() {
  return globalFunctionObservers;
}
function getLogFormat() {
  return globalLogFormat;
}

// src/core/api/AbortError.ts
var AbortError = class extends Error {
  constructor(message = "Aborted") {
    super(message);
  }
};

// src/core/getFunctionCallLogger.ts
function getFunctionCallLogger(logging) {
  switch (logging) {
    case "basic-text":
      return [basicTextObserver];
    case "detailed-object":
      return [detailedObjectObserver];
    case "detailed-json":
      return [detailedJsonObserver];
    case "off":
    default:
      return [];
  }
}
var basicTextObserver = {
  onFunctionEvent(event) {
    const text = `[${event.timestamp.toISOString()}] ${event.callId}${event.functionId != null ? ` (${event.functionId})` : ""} - ${event.functionType} ${event.eventType}`;
    switch (event.eventType) {
      case "started": {
        console.log(text);
        break;
      }
      case "finished": {
        console.log(`${text} in ${event.durationInMs}ms`);
        break;
      }
    }
  }
};
var detailedObjectObserver = {
  onFunctionEvent(event) {
    if (event.eventType === "finished" && event.result != null && "rawResponse" in event.result && event.result?.rawResponse != null) {
      event = {
        ...event,
        result: Object.fromEntries(
          Object.entries(event.result).filter(([k]) => k !== "rawResponse")
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        )
      };
    }
    function cleanObject(obj) {
      if (obj instanceof Date || typeof obj === "string") {
        return obj;
      }
      if (Array.isArray(obj)) {
        return obj.map((item) => cleanObject(item));
      }
      if (obj !== null && typeof obj === "object") {
        return Object.fromEntries(
          Object.entries(obj).map(([k, v]) => {
            if (v === void 0) {
              return [k, void 0];
            } else if (v instanceof Uint8Array) {
              return [k, "omitted<Uint8Array>"];
            } else if (Array.isArray(v) && v.length > 20 && v.every((v2) => typeof v2 === "number")) {
              return [k, "omitted<Array<number>>"];
            } else {
              return [k, cleanObject(v)];
            }
          }).filter(([_, v]) => v !== void 0)
        );
      }
      return obj;
    }
    const cleanedEvent = cleanObject(event);
    console.log(cleanedEvent);
  }
};
var detailedJsonObserver = {
  onFunctionEvent(event) {
    if (event.eventType === "finished" && event.result != null && "rawResponse" in event.result && event.result?.rawResponse != null) {
      event = {
        ...event,
        result: Object.fromEntries(
          Object.entries(event.result).filter(([k]) => k !== "rawResponse")
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        )
      };
    }
    event = Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(event).filter(([_, v]) => v !== void 0)
    );
    console.log(JSON.stringify(event));
  }
};

// src/util/detectRuntime.ts
function detectRuntime() {
  const globalThisAny = globalThis;
  if (globalThisAny.EdgeRuntime) {
    return "vercel-edge";
  }
  if (globalThis.navigator?.userAgent === "Cloudflare-Workers") {
    return "cloudflare-workers";
  }
  if (globalThis.process?.release?.name === "node") {
    return "node";
  }
  if (globalThis.window) {
    return "browser";
  }
  return null;
}

// src/core/getRun.ts
var runStorage;
async function ensureLoaded() {
  if (detectRuntime() === "node" && !runStorage) {
    let AsyncLocalStorage;
    try {
      AsyncLocalStorage = (await import("async_hooks")).AsyncLocalStorage;
    } catch (error) {
      try {
        AsyncLocalStorage = __require("async_hooks").AsyncLocalStorage;
      } catch (error2) {
        throw new Error(`Failed to load 'async_hooks' module dynamically.`);
      }
    }
    runStorage = new AsyncLocalStorage();
  }
  return Promise.resolve();
}
async function getRun(run) {
  await ensureLoaded();
  return run ?? runStorage?.getStore();
}

// src/util/DurationMeasurement.ts
function startDurationMeasurement() {
  return globalThis.performance != null ? new PerformanceNowDurationMeasurement() : new DateDurationMeasurement();
}
var PerformanceNowDurationMeasurement = class {
  startTime = globalThis.performance.now();
  get startEpochSeconds() {
    return Math.floor(
      (globalThis.performance.timeOrigin + this.startTime) / 1e3
    );
  }
  get startDate() {
    return new Date(this.startEpochSeconds * 1e3);
  }
  get durationInMs() {
    return Math.ceil(globalThis.performance.now() - this.startTime);
  }
};
var DateDurationMeasurement = class {
  startTime = Date.now();
  get startEpochSeconds() {
    return Math.floor(this.startTime / 1e3);
  }
  get startDate() {
    return new Date(this.startTime);
  }
  get durationInMs() {
    return Date.now() - this.startTime;
  }
};

// src/util/runSafe.ts
var runSafe = async (f) => {
  try {
    return { ok: true, value: await f() };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { ok: false, isAborted: true };
    }
    return { ok: false, error };
  }
};

// src/core/executeFunctionCall.ts
async function executeFunctionCall({
  options,
  input,
  functionType,
  execute,
  inputPropertyName = "input",
  outputPropertyName = "value"
}) {
  const run = await getRun(options?.run);
  const eventSource = new FunctionEventSource({
    observers: [
      ...getFunctionCallLogger(options?.logging ?? getLogFormat()),
      ...getFunctionObservers(),
      ...run?.functionObserver != null ? [run.functionObserver] : [],
      ...options?.observers ?? []
    ],
    errorHandler: run?.errorHandler
  });
  const durationMeasurement = startDurationMeasurement();
  const startMetadata = {
    functionType,
    callId: `call-${createId()}`,
    parentCallId: options?.callId,
    runId: run?.runId,
    sessionId: run?.sessionId,
    userId: run?.userId,
    functionId: options?.functionId,
    [inputPropertyName]: input,
    timestamp: durationMeasurement.startDate,
    startTimestamp: durationMeasurement.startDate
  };
  eventSource.notify({
    eventType: "started",
    ...startMetadata
  });
  const result = await runSafe(
    () => execute({
      functionType,
      functionId: options?.functionId,
      callId: startMetadata.callId,
      logging: options?.logging,
      observers: options?.observers,
      run
    })
  );
  const finishMetadata = {
    eventType: "finished",
    ...startMetadata,
    finishTimestamp: /* @__PURE__ */ new Date(),
    durationInMs: durationMeasurement.durationInMs
  };
  if (!result.ok) {
    if (result.isAborted) {
      eventSource.notify({
        ...finishMetadata,
        eventType: "finished",
        result: {
          status: "abort"
        }
      });
      throw new AbortError();
    }
    eventSource.notify({
      ...finishMetadata,
      eventType: "finished",
      result: {
        status: "error",
        error: result.error
      }
    });
    throw result.error;
  }
  eventSource.notify({
    ...finishMetadata,
    eventType: "finished",
    result: {
      status: "success",
      [outputPropertyName]: result.value
    }
  });
  return result.value;
}

// src/model-function/AbstractModel.ts
var AbstractModel = class {
  settings;
  constructor({ settings }) {
    this.settings = settings;
  }
  // implemented as a separate accessor to remove all other properties from the model
  get modelInformation() {
    return {
      provider: this.provider,
      modelName: this.modelName
    };
  }
};

// src/util/streaming/convertReadableStreamToAsyncIterable.ts
async function* convertReadableStreamToAsyncIterable(stream) {
  const reader = stream.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        return;
      }
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}

// src/util/streaming/EventSourceParserStream.ts
import {
  createParser
} from "eventsource-parser";
var EventSourceParserStream = class extends TransformStream {
  constructor() {
    let parser;
    super({
      start(controller) {
        parser = createParser((event) => {
          if (event.type === "event") {
            controller.enqueue(event);
          }
        });
      },
      transform(chunk) {
        parser.feed(chunk);
      }
    });
  }
};

// src/util/streaming/parseEventSourceStream.ts
async function parseEventSourceStream({
  stream
}) {
  const eventStream = stream.pipeThrough(new TextDecoderStream()).pipeThrough(new EventSourceParserStream());
  return convertReadableStreamToAsyncIterable(eventStream);
}
export {
  AbstractModel,
  callWithRetryAndThrottle,
  createAudioMpegResponseHandler,
  createJsonErrorResponseHandler,
  createJsonResponseHandler,
  createTextErrorResponseHandler,
  createTextResponseHandler,
  executeFunctionCall,
  loadApiKey,
  parseEventSourceStream,
  postJsonToApi,
  postToApi
};
//# sourceMappingURL=index.js.map