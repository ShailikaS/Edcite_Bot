import { ParsedEvent } from 'eventsource-parser';

interface ToolCallGenerationStartedEvent extends BaseModelCallStartedEvent {
    functionType: "generate-tool-call";
}
type ToolCallGenerationFinishedEventResult = {
    status: "success";
    rawResponse: unknown;
    value: unknown;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
} | {
    status: "error";
    error: unknown;
} | {
    status: "abort";
};
type ToolCallGenerationFinishedEvent = BaseModelCallFinishedEvent & {
    functionType: "generate-tool-call";
    result: ToolCallGenerationFinishedEventResult;
};

interface ToolCallsGenerationStartedEvent extends BaseModelCallStartedEvent {
    functionType: "generate-tool-calls";
}
type ToolCallsGenerationFinishedEventResult = {
    status: "success";
    rawResponse: unknown;
    value: unknown;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
} | {
    status: "error";
    error: unknown;
} | {
    status: "abort";
};
type ToolCallsGenerationFinishedEvent = BaseModelCallFinishedEvent & {
    functionType: "generate-tool-calls";
    result: ToolCallsGenerationFinishedEventResult;
};

type ModelInformation = {
    provider: string;
    modelName: string | null;
};

interface ClassifyStartedEvent extends BaseModelCallStartedEvent {
    functionType: "classify";
    input: unknown | Array<unknown>;
}
type ClassifyFinishedEventResult = {
    status: "success";
    rawResponse: unknown;
    value: unknown;
} | {
    status: "error";
    error: unknown;
} | {
    status: "abort";
};
interface ClassifyFinishedEvent extends BaseModelCallFinishedEvent {
    functionType: "classify";
    input: unknown;
    result: ClassifyFinishedEventResult;
}

/**
 * A vector is an array of numbers.
 * It is e.g. used to represent a text as a vector of word embeddings.
 */
type Vector = Array<number>;

interface EmbeddingStartedEvent extends BaseModelCallStartedEvent {
    functionType: "embed";
    input: unknown | Array<unknown>;
}
type EmbeddingFinishedEventResult = {
    status: "success";
    rawResponse: unknown;
    value: Vector | Array<Vector>;
} | {
    status: "error";
    error: unknown;
} | {
    status: "abort";
};
interface EmbeddingFinishedEvent extends BaseModelCallFinishedEvent {
    functionType: "embed";
    input: unknown | Array<unknown>;
    result: EmbeddingFinishedEventResult;
}

interface ImageGenerationStartedEvent extends BaseModelCallStartedEvent {
    functionType: "generate-image";
}
type ImageGenerationFinishedEventResult = {
    status: "success";
    rawResponse: unknown;
    value: string;
} | {
    status: "error";
    error: unknown;
} | {
    status: "abort";
};
interface ImageGenerationFinishedEvent extends BaseModelCallFinishedEvent {
    functionType: "generate-image";
    result: ImageGenerationFinishedEventResult;
}

interface SpeechGenerationStartedEvent extends BaseModelCallStartedEvent {
    functionType: "generate-speech";
    input: string;
}
type SpeechGenerationFinishedEventResult = {
    status: "success";
    rawResponse: unknown;
    value: Uint8Array;
} | {
    status: "error";
    error: unknown;
} | {
    status: "abort";
};
interface SpeechGenerationFinishedEvent extends BaseModelCallFinishedEvent {
    functionType: "generate-speech";
    input: string;
    result: SpeechGenerationFinishedEventResult;
}
interface SpeechStreamingStartedEvent extends BaseModelCallStartedEvent {
    functionType: "stream-speech";
}
interface SpeechStreamingFinishedEvent extends BaseModelCallFinishedEvent {
    functionType: "stream-speech";
}

interface ObjectGenerationStartedEvent extends BaseModelCallStartedEvent {
    functionType: "generate-object";
}
type ObjectGenerationFinishedEventResult = {
    status: "success";
    rawResponse: unknown;
    value: unknown;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
} | {
    status: "error";
    error: unknown;
} | {
    status: "abort";
};
type ObjectGenerationFinishedEvent = BaseModelCallFinishedEvent & {
    functionType: "generate-object";
    result: ObjectGenerationFinishedEventResult;
};

interface ObjectStreamingStartedEvent extends BaseModelCallStartedEvent {
    functionType: "stream-object";
}
interface ObjectStreamingFinishedEvent extends BaseModelCallFinishedEvent {
    functionType: "stream-object";
}

interface TextGenerationStartedEvent extends BaseModelCallStartedEvent {
    functionType: "generate-text";
}
type TextGenerationFinishedEventResult = {
    status: "success";
    rawResponse: unknown;
    value: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
} | {
    status: "error";
    error: unknown;
} | {
    status: "abort";
};
interface TextGenerationFinishedEvent extends BaseModelCallFinishedEvent {
    functionType: "generate-text";
    result: TextGenerationFinishedEventResult;
}
interface TextStreamingStartedEvent extends BaseModelCallStartedEvent {
    functionType: "stream-text";
}
interface TextStreamingFinishedEvent extends BaseModelCallFinishedEvent {
    functionType: "stream-text";
}

interface TranscriptionStartedEvent extends BaseModelCallStartedEvent {
    functionType: "generate-transcription";
}
type TranscriptionFinishedEventResult = {
    status: "success";
    rawResponse: unknown;
    value: string;
} | {
    status: "error";
    error: unknown;
} | {
    status: "abort";
};
interface TranscriptionFinishedEvent extends BaseModelCallFinishedEvent {
    functionType: "generate-transcription";
    result: TranscriptionFinishedEventResult;
}

interface BaseModelCallStartedEvent extends BaseFunctionStartedEvent {
    model: ModelInformation;
    /**
     * The main input to the model call. The type depends on the call type or model.
     */
    input: unknown;
    /**
     * The model settings used for the call. The type depends on the model.
     */
    settings: unknown;
}
type BaseModelCallFinishedEventResult = {
    status: "success";
    /**
     * The original model response.
     */
    rawResponse: unknown;
    value: unknown;
    /**
     * Optional usage information for the model call. The type depends on the call type.
     */
    usage?: unknown;
} | {
    status: "error";
    error: unknown;
} | {
    status: "abort";
};
interface BaseModelCallFinishedEvent extends BaseFunctionFinishedEvent {
    model: ModelInformation;
    /**
     * The main input to the model call. The type depends on the call type or model.
     */
    input: unknown;
    /**
     * The model settings used for the call. The type depends on the model.
     */
    settings: unknown;
    /**
     * The result of the model call. Can be "success", "error", or "abort". Additional information is provided depending on the status.
     */
    result: BaseModelCallFinishedEventResult;
}
type ModelCallStartedEvent = ClassifyStartedEvent | EmbeddingStartedEvent | ImageGenerationStartedEvent | SpeechGenerationStartedEvent | SpeechStreamingStartedEvent | ObjectGenerationStartedEvent | ObjectStreamingStartedEvent | TextGenerationStartedEvent | TextStreamingStartedEvent | ToolCallGenerationStartedEvent | ToolCallsGenerationStartedEvent | TranscriptionStartedEvent;
type ModelCallFinishedEvent = ClassifyFinishedEvent | EmbeddingFinishedEvent | ImageGenerationFinishedEvent | SpeechGenerationFinishedEvent | SpeechStreamingFinishedEvent | ObjectGenerationFinishedEvent | ObjectStreamingFinishedEvent | TextGenerationFinishedEvent | TextStreamingFinishedEvent | ToolCallGenerationFinishedEvent | ToolCallsGenerationFinishedEvent | TranscriptionFinishedEvent;

interface RetrieveStartedEvent extends BaseFunctionStartedEvent {
    functionType: "retrieve";
    query: unknown;
}
interface RetrieveFinishedEvent extends BaseFunctionFinishedEvent {
    functionType: "retrieve";
    query: unknown;
    results: unknown;
}

interface ExecuteToolStartedEvent extends BaseFunctionStartedEvent {
    functionType: "execute-tool";
    toolName: string;
    input: unknown;
}
interface ExecuteToolFinishedEvent extends BaseFunctionFinishedEvent {
    functionType: "execute-tool";
    toolName: string;
    input: unknown;
}

interface runToolStartedEvent extends BaseFunctionStartedEvent {
    functionType: "run-tool";
}
interface runToolFinishedEvent extends BaseFunctionFinishedEvent {
    functionType: "run-tool";
}

interface runToolsStartedEvent extends BaseFunctionStartedEvent {
    functionType: "run-tools";
}
interface runToolsFinishedEvent extends BaseFunctionFinishedEvent {
    functionType: "run-tools";
}

interface UpsertIntoVectorIndexStartedEvent extends BaseFunctionStartedEvent {
    functionType: "upsert-into-vector-index";
    objects: unknown[];
}
interface UpsertIntoVectorIndexFinishedEvent extends BaseFunctionFinishedEvent {
    functionType: "upsert-into-vector-index";
    objects: unknown[];
}

interface ExecuteFunctionStartedEvent extends BaseFunctionStartedEvent {
    functionType: "execute-function";
}
interface ExecuteFunctionFinishedEvent extends BaseFunctionFinishedEvent {
    functionType: "execute-function";
}

interface BaseFunctionEvent {
    /**
     * Unique identifier for the function call.
     */
    callId: string | undefined;
    /**
     * Unique identifier of the call id of the parent function.
     */
    parentCallId?: string | undefined;
    /**
     * Optional unique identifier for the function.
     */
    functionId?: string | undefined;
    /**
     * Unique identifier for the run.
     * Only available if the function is part of a run.
     */
    runId?: string | undefined;
    /**
     * Unique identifier for the session.
     * Only available if the function is part of a run with a session.
     */
    sessionId?: string | undefined;
    /**
     * Unique identifier for the user.
     * Only available if the function is part of a run with a user.
     */
    userId?: string | undefined;
    /**
     * Timestamp of the event.
     */
    timestamp: Date;
    /**
     * Type of the event. Defined in the subclasses.
     */
    eventType: "started" | "finished";
    /**
     * Type of the function. Defined in the subclasses.
     */
    functionType: string;
}
interface BaseFunctionStartedEvent extends BaseFunctionEvent {
    eventType: "started";
    /**
     * Timestamp when the function call started.
     */
    startTimestamp: Date;
}
type BaseFunctionFinishedEventResult = {
    status: "success";
    value: unknown;
} | {
    status: "error";
    error: unknown;
} | {
    status: "abort";
};
interface BaseFunctionFinishedEvent extends BaseFunctionEvent {
    eventType: "finished";
    /**
     * Timestamp when the function call started.
     */
    startTimestamp: Date;
    /**
     * Timestamp when the function call finished.
     */
    finishTimestamp: Date;
    /**
     * Duration of the function call in milliseconds.
     */
    durationInMs: number;
    /**
     * Result of the function call.
     */
    result: BaseFunctionFinishedEventResult;
}
type FunctionEvent = ExecuteFunctionStartedEvent | ExecuteFunctionFinishedEvent | ExecuteToolStartedEvent | ExecuteToolFinishedEvent | ExtensionFunctionStartedEvent | ExtensionFunctionFinishedEvent | ModelCallStartedEvent | ModelCallFinishedEvent | RetrieveStartedEvent | RetrieveFinishedEvent | UpsertIntoVectorIndexStartedEvent | UpsertIntoVectorIndexFinishedEvent | runToolStartedEvent | runToolFinishedEvent | runToolsStartedEvent | runToolsFinishedEvent;

interface ExtensionFunctionStartedEvent extends BaseFunctionStartedEvent {
    functionType: "extension";
    extension: string;
    data: unknown;
}
interface ExtensionFunctionFinishedEvent extends BaseFunctionFinishedEvent {
    functionType: "extension";
    extension: string;
    data: unknown;
}

type RetryFunction = <OUTPUT>(fn: () => PromiseLike<OUTPUT>) => PromiseLike<OUTPUT>;

type ThrottleFunction = <OUTPUT>(fn: () => PromiseLike<OUTPUT>) => PromiseLike<OUTPUT>;

declare const callWithRetryAndThrottle: <OUTPUT>({ retry, throttle, call, }: {
    retry?: RetryFunction | undefined;
    throttle?: ThrottleFunction | undefined;
    call: () => PromiseLike<OUTPUT>;
}) => Promise<OUTPUT>;

declare function loadApiKey({ apiKey, environmentVariableName, apiKeyParameterName, description, }: {
    apiKey: string | undefined;
    environmentVariableName: string;
    apiKeyParameterName?: string;
    description: string;
}): string;

/**
 * Validates that the structure of a value matches this schema.
 */
interface Schema<OBJECT> {
    /**
     * Validates that the structure of a value matches this schema,
     * and returns a typed version of the value if it does.
     */
    validate(value: unknown): {
        success: true;
        value: OBJECT;
    } | {
        success: false;
        error: unknown;
    };
    /**
     * Only used for type inference.
     */
    readonly _type: OBJECT;
}

declare class ApiCallError extends Error {
    readonly url: string;
    readonly requestBodyValues: unknown;
    readonly statusCode?: number;
    readonly responseBody?: string;
    readonly cause?: unknown;
    readonly isRetryable: boolean;
    readonly data?: unknown;
    constructor({ message, url, requestBodyValues, statusCode, responseBody, cause, isRetryable, data, }: {
        message: string;
        url: string;
        requestBodyValues: unknown;
        statusCode?: number;
        responseBody?: string;
        cause?: unknown;
        isRetryable?: boolean;
        data?: unknown;
    });
    toJSON(): {
        name: string;
        message: string;
        url: string;
        requestBodyValues: unknown;
        statusCode: number | undefined;
        responseBody: string | undefined;
        cause: unknown;
        isRetryable: boolean;
        data: unknown;
    };
}

type ResponseHandler<T> = (options: {
    url: string;
    requestBodyValues: unknown;
    response: Response;
}) => PromiseLike<T>;
declare const createJsonErrorResponseHandler: <T>({ errorSchema, errorToMessage, isRetryable, }: {
    errorSchema: Schema<T>;
    errorToMessage: (error: T) => string;
    isRetryable?: ((response: Response, error?: T | undefined) => boolean) | undefined;
}) => ResponseHandler<ApiCallError>;
declare const createTextErrorResponseHandler: ({ isRetryable, }?: {
    isRetryable?: ((response: Response) => boolean) | undefined;
}) => ResponseHandler<ApiCallError>;
declare const createJsonResponseHandler: <T>(responseSchema: Schema<T>) => ResponseHandler<T>;
declare const createTextResponseHandler: () => ResponseHandler<string>;
declare const createAudioMpegResponseHandler: () => ResponseHandler<Uint8Array>;
declare const postJsonToApi: <T>({ url, headers, body, failedResponseHandler, successfulResponseHandler, abortSignal, }: {
    url: string;
    headers?: Record<string, string> | undefined;
    body: unknown;
    failedResponseHandler: ResponseHandler<ApiCallError>;
    successfulResponseHandler: ResponseHandler<T>;
    abortSignal?: AbortSignal | undefined;
}) => Promise<T>;
declare const postToApi: <T>({ url, headers, body, successfulResponseHandler, failedResponseHandler, abortSignal, }: {
    url: string;
    headers?: Record<string, string> | undefined;
    body: {
        content: string | FormData | Uint8Array;
        values: unknown;
    };
    failedResponseHandler: ResponseHandler<Error>;
    successfulResponseHandler: ResponseHandler<T>;
    abortSignal?: AbortSignal | undefined;
}) => Promise<T>;

interface FunctionObserver {
    /**
     * Called when a function event occurs.
     */
    onFunctionEvent(event: FunctionEvent): void;
}

/**
 * The logging output format to use, e.g. for functions. Logs are sent to the console.
 *
 * - `off` or undefined: No logging.
 * - `basic-text`: Log the timestamp and the type of event as a single line of text.
 * - `detailed-object`: Log everything except the original response as an object to the console.
 * - `detailed-json`: Log everything except the original response as a JSON string to the console.
 */
type LogFormat = undefined | "off" | "basic-text" | "detailed-object" | "detailed-json";

type ErrorHandler = (error: unknown) => void;

interface Run {
    /**
     * Unique identifier for a specific run. Primarily utilized for efficient referencing
     * and tracking within logs.
     */
    runId?: string;
    /**
     * Unique identifier for a session. A session can contain multiple runs. For example, in
     * a chatbot where each message is processed as a separate run, all those runs could be
     * part of a single session. Useful for tracking and logging.
     */
    sessionId?: string;
    /**
     * The user ID of the individual who initiates the call. Useful for logging and can be
     * configured to be forwarded to the model provider (like OpenAI).
     */
    userId?: string;
    /**
     * An AbortSignal that can be used to cancel any ongoing asynchronous operations tied
     * to the run.
     */
    abortSignal?: AbortSignal;
    /**
     * Optional field that represents the run as a function observer. When it is defined,
     * the run will be notified of all function events.
     */
    functionObserver?: FunctionObserver;
    errorHandler?: ErrorHandler;
}

interface Cache {
    lookupValue(key: {
        functionType: string;
        functionId?: string | undefined;
        input: unknown;
    }): Promise<object | null>;
    storeValue(key: {
        functionType: string;
        functionId?: string | undefined;
        input: unknown;
    }, value: unknown): Promise<void>;
}

/**
 * Additional settings for ModelFusion functions.
 */
type FunctionOptions = {
    /**
     * Optional function identifier. Used in events and logging.
     */
    functionId?: string;
    /**
     * Optional logging to use for the function. Logs are sent to the console.
     * Overrides the global function logging setting.
     */
    logging?: LogFormat;
    /**
     * Optional observers that are called when the function is invoked.
     */
    observers?: Array<FunctionObserver>;
    /**
     * Optional cache that can be used by the function to store and retrieve cached values.
     * Not supported by all functions.
     */
    cache?: Cache;
    /**
     * Optional run as part of which this function is called. Used in events and logging.
     * Run callbacks are invoked when it is provided.
     */
    run?: Run;
    /**
     * Unique identifier of the call id of the parent function. Used in events and logging.
     *
     * It has the same name as the `callId` in `FunctionCallOptions` to allow for easy
     * propagation of the call id.
     *
     * However, in the `FunctionOptions`, it is the call ID for the parent call, and it is optional.
     */
    callId?: string | undefined;
};
/**
 * Extended options that are passed to models when functions are called. They are passed
 * into e.g. API providers to create custom headers.
 */
type FunctionCallOptions = Omit<FunctionOptions, "callId"> & {
    functionType: string;
    callId: string;
};

declare function executeFunctionCall<VALUE>({ options, input, functionType, execute, inputPropertyName, outputPropertyName, }: {
    options?: FunctionOptions;
    input: unknown;
    functionType: FunctionEvent["functionType"];
    execute: (options: FunctionCallOptions) => PromiseLike<VALUE>;
    inputPropertyName?: string;
    outputPropertyName?: string;
}): Promise<VALUE>;

interface ModelSettings {
    /**
     * Observers that are called when the model is used in run functions.
     */
    observers?: Array<FunctionObserver>;
}
interface Model<SETTINGS extends ModelSettings> {
    modelInformation: ModelInformation;
    readonly settings: SETTINGS;
    /**
     * Returns settings that should be recorded in observability events.
     * Security-related settings (e.g. API keys) should not be included here.
     */
    get settingsForEvent(): Partial<SETTINGS>;
    /**
     * The `withSettings` method creates a new model with the same configuration as the original model, but with the specified settings changed.
     *
     * @example
     * const model = new OpenAICompletionModel({
     *   model: "gpt-3.5-turbo-instruct",
     *   maxGenerationTokens: 500,
     * });
     *
     * const modelWithMoreTokens = model.withSettings({
     *   maxGenerationTokens: 1000,
     * });
     */
    withSettings(additionalSettings: Partial<SETTINGS>): this;
}

declare abstract class AbstractModel<SETTINGS extends ModelSettings> implements Model<SETTINGS> {
    readonly settings: SETTINGS;
    constructor({ settings }: {
        settings: SETTINGS;
    });
    abstract readonly provider: string;
    abstract readonly modelName: string | null;
    get modelInformation(): ModelInformation;
    abstract get settingsForEvent(): Partial<SETTINGS>;
    abstract withSettings(additionalSettings: Partial<SETTINGS>): this;
}

declare function parseEventSourceStream({ stream, }: {
    stream: ReadableStream<Uint8Array>;
}): Promise<AsyncIterable<ParsedEvent>>;

export { AbstractModel, type ErrorHandler, type ExtensionFunctionFinishedEvent, type ExtensionFunctionStartedEvent, type ResponseHandler, callWithRetryAndThrottle, createAudioMpegResponseHandler, createJsonErrorResponseHandler, createJsonResponseHandler, createTextErrorResponseHandler, createTextResponseHandler, executeFunctionCall, loadApiKey, parseEventSourceStream, postJsonToApi, postToApi };
