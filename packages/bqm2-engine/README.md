# BQM2 Engine

BigQuery Materializer 2 - A powerful SQL orchestration engine that allows you to:

- Write SQL queries as templates
- Execute them in dependency order
- Track state changes and only re-run what's needed
- Support multiple BigQuery resource types (tables, views, external tables, etc.)

## Features

- **Template-driven**: Write SQL with variable substitution
- **Dependency management**: Automatic execution ordering
- **State tracking**: Hash-based change detection
- **Async execution**: Parallel job processing
- **Multiple resource types**: Support for various BigQuery objects

## Integration with DataForge

This engine is integrated into DataForge as the core BigQuery execution layer, providing:

- Multi-tenant query execution
- Real-time job monitoring
- Template library management
- Cost tracking and optimization

## Original Documentation

See the original bqm2 README for detailed usage instructions and examples.