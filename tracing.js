const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { trace } = require("@opentelemetry/api");
const { ExpressInstrumentation } = require("opentelemetry-instrumentation-express");
const { MongoDBInstrumentation } = require("@opentelemetry/instrumentation-mongodb");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');

module.exports = (serviceName) => {
    // 配置 Jaeger Exporter
    const exporter = new JaegerExporter({
        endpoint: 'http://localhost:14268/api/traces', // Jaeger 的 HTTP 端点
        serviceName: serviceName,
    });

    // 创建 Tracer Provider 并配置 Exporter
    const provider = new NodeTracerProvider({
        resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        }),
    });

    // 添加 Span Processor
    provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
    provider.register();

    // 注册 Instrumentations
    registerInstrumentations({
        instrumentations: [
            new HttpInstrumentation(),
            new ExpressInstrumentation(),
            new MongoDBInstrumentation(),
        ],
        tracerProvider: provider,
    });

    // 返回 Tracer
    return trace.getTracer(serviceName);
};
