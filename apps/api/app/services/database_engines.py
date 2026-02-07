"""
Database engine abstraction layer for DataForge.
Provides unified interface for BigQuery, Snowflake, Databricks, etc.
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any
from enum import Enum
import asyncio
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class DatabaseType(str, Enum):
    BIGQUERY = "bigquery"
    SNOWFLAKE = "snowflake"
    DATABRICKS = "databricks"
    REDSHIFT = "redshift"
    POSTGRESQL = "postgresql"


class QueryStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class QueryResult:
    def __init__(
        self,
        query_id: str,
        status: QueryStatus,
        rows_affected: Optional[int] = None,
        execution_time_ms: Optional[int] = None,
        error_message: Optional[str] = None,
        result_data: Optional[List[Dict]] = None,
    ):
        self.query_id = query_id
        self.status = status
        self.rows_affected = rows_affected
        self.execution_time_ms = execution_time_ms
        self.error_message = error_message
        self.result_data = result_data
        self.created_at = datetime.utcnow()


class DatabaseEngine(ABC):
    """Abstract base class for all database engines."""

    def __init__(self, connection_config: Dict[str, Any]):
        self.connection_config = connection_config
        self.engine_type = self._get_engine_type()

    @abstractmethod
    def _get_engine_type(self) -> DatabaseType:
        """Return the database type for this engine."""
        pass

    @abstractmethod
    async def test_connection(self) -> bool:
        """Test if the connection is valid."""
        pass

    @abstractmethod
    async def execute_query(self, sql: str, params: Optional[Dict] = None) -> QueryResult:
        """Execute a SQL query and return results."""
        pass

    @abstractmethod
    async def get_job_status(self, job_id: str) -> QueryStatus:
        """Get the status of a running job."""
        pass

    @abstractmethod
    async def cancel_job(self, job_id: str) -> bool:
        """Cancel a running job."""
        pass

    @abstractmethod
    def validate_sql(self, sql: str) -> Dict[str, Any]:
        """Validate SQL syntax for this database."""
        pass

    @abstractmethod
    async def get_schema_info(self, database: str) -> Dict[str, Any]:
        """Get schema information for a database."""
        pass


class BigQueryEngine(DatabaseEngine):
    """BigQuery implementation using the bqm2 engine."""

    def __init__(self, connection_config: Dict[str, Any]):
        super().__init__(connection_config)
        self._client = None
        self._setup_client()

    def _get_engine_type(self) -> DatabaseType:
        return DatabaseType.BIGQUERY

    def _setup_client(self):
        """Initialize BigQuery client with bqm2 integration."""
        try:
            from google.cloud import bigquery

            # Extract credentials from connection config
            project_id = self.connection_config.get("project_id")
            credentials_json = self.connection_config.get("credentials_json")

            if credentials_json:
                # Use service account JSON
                import json
                from google.oauth2 import service_account
                credentials_info = json.loads(credentials_json)
                credentials = service_account.Credentials.from_service_account_info(credentials_info)
                self._client = bigquery.Client(project=project_id, credentials=credentials)
            else:
                # Use default credentials
                self._client = bigquery.Client(project=project_id)

        except Exception as e:
            logger.error(f"Failed to initialize BigQuery client: {e}")
            raise

    async def test_connection(self) -> bool:
        """Test BigQuery connection."""
        try:
            # Simple query to test connection
            query = "SELECT 1 as test"
            job = self._client.query(query)
            result = job.result()
            return True
        except Exception as e:
            logger.error(f"BigQuery connection test failed: {e}")
            return False

    async def execute_query(self, sql: str, params: Optional[Dict] = None) -> QueryResult:
        """Execute BigQuery SQL using bqm2 patterns."""
        try:
            import uuid
            query_id = str(uuid.uuid4())

            # Configure job
            job_config = bigquery.QueryJobConfig()
            if params:
                # Handle query parameters
                job_config.query_parameters = self._format_parameters(params)

            # Execute query
            start_time = datetime.utcnow()
            job = self._client.query(sql, job_config=job_config, job_id=query_id)

            # Wait for completion (async in production)
            result = job.result()
            end_time = datetime.utcnow()

            execution_time_ms = int((end_time - start_time).total_seconds() * 1000)

            # Convert results to list of dicts
            result_data = []
            for row in result:
                result_data.append(dict(row))

            return QueryResult(
                query_id=query_id,
                status=QueryStatus.COMPLETED,
                rows_affected=result.total_rows,
                execution_time_ms=execution_time_ms,
                result_data=result_data[:100]  # Limit for API response
            )

        except Exception as e:
            logger.error(f"BigQuery execution failed: {e}")
            return QueryResult(
                query_id=query_id if 'query_id' in locals() else "unknown",
                status=QueryStatus.FAILED,
                error_message=str(e)
            )

    async def get_job_status(self, job_id: str) -> QueryStatus:
        """Get BigQuery job status."""
        try:
            job = self._client.get_job(job_id)

            if job.state == "PENDING":
                return QueryStatus.PENDING
            elif job.state == "RUNNING":
                return QueryStatus.RUNNING
            elif job.state == "DONE":
                if job.error_result:
                    return QueryStatus.FAILED
                return QueryStatus.COMPLETED
            else:
                return QueryStatus.FAILED

        except Exception as e:
            logger.error(f"Failed to get job status: {e}")
            return QueryStatus.FAILED

    async def cancel_job(self, job_id: str) -> bool:
        """Cancel BigQuery job."""
        try:
            job = self._client.get_job(job_id)
            job.cancel()
            return True
        except Exception as e:
            logger.error(f"Failed to cancel job: {e}")
            return False

    def validate_sql(self, sql: str) -> Dict[str, Any]:
        """Validate BigQuery SQL syntax."""
        try:
            # Use dry run to validate
            job_config = bigquery.QueryJobConfig(dry_run=True, use_query_cache=False)
            job = self._client.query(sql, job_config=job_config)

            return {
                "valid": True,
                "estimated_bytes": job.total_bytes_processed,
                "estimated_cost_usd": self._estimate_cost(job.total_bytes_processed)
            }
        except Exception as e:
            return {
                "valid": False,
                "error": str(e)
            }

    async def get_schema_info(self, database: str) -> Dict[str, Any]:
        """Get BigQuery dataset/table schema info."""
        try:
            dataset = self._client.get_dataset(database)
            tables = list(self._client.list_tables(dataset))

            schema_info = {
                "database": database,
                "tables": []
            }

            for table in tables:
                table_info = {
                    "name": table.table_id,
                    "type": table.table_type,
                    "schema": []
                }

                # Get table schema
                full_table = self._client.get_table(table.reference)
                for field in full_table.schema:
                    table_info["schema"].append({
                        "name": field.name,
                        "type": field.field_type,
                        "mode": field.mode
                    })

                schema_info["tables"].append(table_info)

            return schema_info

        except Exception as e:
            logger.error(f"Failed to get schema info: {e}")
            return {"error": str(e)}

    def _format_parameters(self, params: Dict) -> List:
        """Format parameters for BigQuery."""
        # Convert dict params to BigQuery parameter format
        from google.cloud import bigquery

        formatted_params = []
        for key, value in params.items():
            param_type = self._get_bigquery_type(value)
            formatted_params.append(
                bigquery.ScalarQueryParameter(key, param_type, value)
            )
        return formatted_params

    def _get_bigquery_type(self, value) -> str:
        """Determine BigQuery type from Python value."""
        if isinstance(value, str):
            return "STRING"
        elif isinstance(value, int):
            return "INT64"
        elif isinstance(value, float):
            return "FLOAT64"
        elif isinstance(value, bool):
            return "BOOL"
        else:
            return "STRING"

    def _estimate_cost(self, bytes_processed: int) -> float:
        """Estimate query cost in USD."""
        # BigQuery pricing: $5 per TB processed
        tb_processed = bytes_processed / (1024 ** 4)
        return tb_processed * 5.0


class SnowflakeEngine(DatabaseEngine):
    """Snowflake implementation - to be implemented."""

    def _get_engine_type(self) -> DatabaseType:
        return DatabaseType.SNOWFLAKE

    async def test_connection(self) -> bool:
        # TODO: Implement Snowflake connection test
        return False

    async def execute_query(self, sql: str, params: Optional[Dict] = None) -> QueryResult:
        # TODO: Implement Snowflake query execution
        raise NotImplementedError("Snowflake engine not yet implemented")

    async def get_job_status(self, job_id: str) -> QueryStatus:
        raise NotImplementedError("Snowflake engine not yet implemented")

    async def cancel_job(self, job_id: str) -> bool:
        raise NotImplementedError("Snowflake engine not yet implemented")

    def validate_sql(self, sql: str) -> Dict[str, Any]:
        raise NotImplementedError("Snowflake engine not yet implemented")

    async def get_schema_info(self, database: str) -> Dict[str, Any]:
        raise NotImplementedError("Snowflake engine not yet implemented")


# Engine factory
def create_engine(engine_type: DatabaseType, connection_config: Dict[str, Any]) -> DatabaseEngine:
    """Factory function to create database engines."""

    if engine_type == DatabaseType.BIGQUERY:
        return BigQueryEngine(connection_config)
    elif engine_type == DatabaseType.SNOWFLAKE:
        return SnowflakeEngine(connection_config)
    else:
        raise ValueError(f"Unsupported database type: {engine_type}")