"""
DataForge API endpoints for database connections, queries, and job execution.
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
import uuid
from datetime import datetime
import json
import logging

from ..core.auth import get_current_user, get_user_organization
from ..services.database_engines import (
    DatabaseEngine, DatabaseType, QueryResult, QueryStatus,
    create_engine
)
from ..core.supabase import get_supabase_client

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/dataforge", tags=["dataforge"])


# Pydantic models
class DatabaseConnectionCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    type: DatabaseType
    connection_config: Dict[str, Any]
    description: Optional[str] = None


class DatabaseConnectionUpdate(BaseModel):
    name: Optional[str] = None
    connection_config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    description: Optional[str] = None


class DatabaseConnectionResponse(BaseModel):
    id: str
    name: str
    type: str
    is_active: bool
    description: Optional[str]
    created_at: datetime
    updated_at: datetime
    # connection_config is excluded for security


class QueryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    sql_content: str = Field(..., min_length=1)
    database_type: DatabaseType
    tags: List[str] = []
    is_template: bool = False
    template_category: Optional[str] = None
    template_variables: Dict[str, Any] = {}
    dependencies: List[str] = []


class QueryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    sql_content: Optional[str] = None
    tags: Optional[List[str]] = None
    template_variables: Optional[Dict[str, Any]] = None
    dependencies: Optional[List[str]] = None


class QueryResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    sql_content: str
    database_type: str
    tags: List[str]
    is_template: bool
    template_category: Optional[str]
    template_variables: Dict[str, Any]
    dependencies: List[str]
    created_at: datetime
    updated_at: datetime


class QueryExecuteRequest(BaseModel):
    query_id: str
    connection_id: str
    parameters: Dict[str, Any] = {}


class JobExecutionResponse(BaseModel):
    id: str
    query_id: str
    connection_id: str
    external_job_id: Optional[str]
    status: str
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    execution_time_ms: Optional[int]
    rows_affected: Optional[int]
    bytes_processed: Optional[int]
    cost_estimate_usd: Optional[float]
    error_message: Optional[str]
    created_at: datetime


# Database Connections endpoints
@router.post("/connections", response_model=DatabaseConnectionResponse)
async def create_connection(
    connection: DatabaseConnectionCreate,
    current_user = Depends(get_current_user),
    org_id = Depends(get_user_organization)
):
    """Create a new database connection."""
    supabase = get_supabase_client()

    try:
        # Test the connection before saving
        engine = create_engine(connection.type, connection.connection_config)
        is_valid = await engine.test_connection()

        if not is_valid:
            raise HTTPException(
                status_code=400,
                detail="Failed to connect to database with provided credentials"
            )

        # Encrypt connection config (in production, use proper encryption)
        encrypted_config = json.dumps(connection.connection_config)

        # Insert into database
        result = supabase.table("database_connections").insert({
            "organization_id": org_id,
            "name": connection.name,
            "type": connection.type.value,
            "connection_config": encrypted_config,
            "created_by": current_user["id"]
        }).execute()

        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to create connection")

        return result.data[0]

    except Exception as e:
        logger.error(f"Failed to create connection: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/connections", response_model=List[DatabaseConnectionResponse])
async def list_connections(
    org_id = Depends(get_user_organization)
):
    """List all database connections for the organization."""
    supabase = get_supabase_client()

    result = supabase.table("database_connections").select(
        "id, name, type, is_active, description, created_at, updated_at"
    ).eq("organization_id", org_id).eq("is_active", True).execute()

    return result.data


@router.get("/connections/{connection_id}", response_model=DatabaseConnectionResponse)
async def get_connection(
    connection_id: str,
    org_id = Depends(get_user_organization)
):
    """Get a specific database connection."""
    supabase = get_supabase_client()

    result = supabase.table("database_connections").select(
        "id, name, type, is_active, description, created_at, updated_at"
    ).eq("id", connection_id).eq("organization_id", org_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Connection not found")

    return result.data[0]


@router.put("/connections/{connection_id}", response_model=DatabaseConnectionResponse)
async def update_connection(
    connection_id: str,
    update_data: DatabaseConnectionUpdate,
    org_id = Depends(get_user_organization)
):
    """Update a database connection."""
    supabase = get_supabase_client()

    # Build update dict
    update_dict = {}
    if update_data.name is not None:
        update_dict["name"] = update_data.name
    if update_data.is_active is not None:
        update_dict["is_active"] = update_data.is_active
    if update_data.connection_config is not None:
        # Test connection if config changed
        # In production, you'd want to validate the new config
        update_dict["connection_config"] = json.dumps(update_data.connection_config)

    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = supabase.table("database_connections").update(update_dict).eq(
        "id", connection_id
    ).eq("organization_id", org_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Connection not found")

    return result.data[0]


@router.delete("/connections/{connection_id}")
async def delete_connection(
    connection_id: str,
    org_id = Depends(get_user_organization)
):
    """Delete a database connection."""
    supabase = get_supabase_client()

    # Soft delete by setting is_active = false
    result = supabase.table("database_connections").update({
        "is_active": False
    }).eq("id", connection_id).eq("organization_id", org_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Connection not found")

    return {"message": "Connection deleted successfully"}


@router.post("/connections/{connection_id}/test")
async def test_connection(
    connection_id: str,
    org_id = Depends(get_user_organization)
):
    """Test a database connection."""
    supabase = get_supabase_client()

    # Get connection config
    result = supabase.table("database_connections").select(
        "type, connection_config"
    ).eq("id", connection_id).eq("organization_id", org_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Connection not found")

    connection_data = result.data[0]

    try:
        # Create engine and test
        engine = create_engine(
            DatabaseType(connection_data["type"]),
            json.loads(connection_data["connection_config"])
        )
        is_valid = await engine.test_connection()

        return {
            "success": is_valid,
            "message": "Connection successful" if is_valid else "Connection failed"
        }

    except Exception as e:
        return {
            "success": False,
            "message": f"Connection test failed: {str(e)}"
        }


# Queries endpoints
@router.post("/queries", response_model=QueryResponse)
async def create_query(
    query: QueryCreate,
    current_user = Depends(get_current_user),
    org_id = Depends(get_user_organization)
):
    """Create a new query."""
    supabase = get_supabase_client()

    try:
        result = supabase.table("queries").insert({
            "organization_id": org_id,
            "name": query.name,
            "description": query.description,
            "sql_content": query.sql_content,
            "database_type": query.database_type.value,
            "tags": query.tags,
            "is_template": query.is_template,
            "template_category": query.template_category,
            "template_variables": query.template_variables,
            "dependencies": query.dependencies,
            "created_by": current_user["id"]
        }).execute()

        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to create query")

        return result.data[0]

    except Exception as e:
        logger.error(f"Failed to create query: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/queries", response_model=List[QueryResponse])
async def list_queries(
    is_template: Optional[bool] = None,
    database_type: Optional[DatabaseType] = None,
    org_id = Depends(get_user_organization)
):
    """List queries for the organization."""
    supabase = get_supabase_client()

    query_builder = supabase.table("queries").select("*").eq("organization_id", org_id)

    if is_template is not None:
        query_builder = query_builder.eq("is_template", is_template)

    if database_type is not None:
        query_builder = query_builder.eq("database_type", database_type.value)

    result = query_builder.order("created_at", desc=True).execute()
    return result.data


@router.get("/queries/{query_id}", response_model=QueryResponse)
async def get_query(
    query_id: str,
    org_id = Depends(get_user_organization)
):
    """Get a specific query."""
    supabase = get_supabase_client()

    result = supabase.table("queries").select("*").eq(
        "id", query_id
    ).eq("organization_id", org_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Query not found")

    return result.data[0]


@router.put("/queries/{query_id}", response_model=QueryResponse)
async def update_query(
    query_id: str,
    update_data: QueryUpdate,
    org_id = Depends(get_user_organization)
):
    """Update a query."""
    supabase = get_supabase_client()

    # Build update dict
    update_dict = {}
    for field, value in update_data.dict(exclude_unset=True).items():
        if value is not None:
            update_dict[field] = value

    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = supabase.table("queries").update(update_dict).eq(
        "id", query_id
    ).eq("organization_id", org_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Query not found")

    return result.data[0]


@router.delete("/queries/{query_id}")
async def delete_query(
    query_id: str,
    org_id = Depends(get_user_organization)
):
    """Delete a query."""
    supabase = get_supabase_client()

    result = supabase.table("queries").delete().eq(
        "id", query_id
    ).eq("organization_id", org_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Query not found")

    return {"message": "Query deleted successfully"}


# Query execution endpoints
@router.post("/execute", response_model=JobExecutionResponse)
async def execute_query(
    request: QueryExecuteRequest,
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_user),
    org_id = Depends(get_user_organization)
):
    """Execute a query."""
    supabase = get_supabase_client()

    # Get query and connection
    query_result = supabase.table("queries").select("*").eq(
        "id", request.query_id
    ).eq("organization_id", org_id).execute()

    connection_result = supabase.table("database_connections").select("*").eq(
        "id", request.connection_id
    ).eq("organization_id", org_id).execute()

    if not query_result.data:
        raise HTTPException(status_code=404, detail="Query not found")
    if not connection_result.data:
        raise HTTPException(status_code=404, detail="Connection not found")

    query_data = query_result.data[0]
    connection_data = connection_result.data[0]

    # Validate database types match
    if query_data["database_type"] != connection_data["type"]:
        raise HTTPException(
            status_code=400,
            detail="Query database type doesn't match connection type"
        )

    try:
        # Create job execution record
        job_data = {
            "query_id": request.query_id,
            "connection_id": request.connection_id,
            "organization_id": org_id,
            "status": "pending",
            "triggered_by": "manual",
            "triggered_by_user": current_user["id"]
        }

        job_result = supabase.table("job_executions").insert(job_data).execute()
        if not job_result.data:
            raise HTTPException(status_code=400, detail="Failed to create job")

        job_id = job_result.data[0]["id"]

        # Execute query in background
        background_tasks.add_task(
            execute_query_background,
            job_id,
            query_data,
            connection_data,
            request.parameters
        )

        return job_result.data[0]

    except Exception as e:
        logger.error(f"Failed to execute query: {e}")
        raise HTTPException(status_code=400, detail=str(e))


async def execute_query_background(
    job_id: str,
    query_data: Dict,
    connection_data: Dict,
    parameters: Dict
):
    """Background task to execute query."""
    supabase = get_supabase_client()

    try:
        # Update job status to running
        supabase.table("job_executions").update({
            "status": "running",
            "started_at": datetime.utcnow().isoformat()
        }).eq("id", job_id).execute()

        # Create database engine
        engine = create_engine(
            DatabaseType(connection_data["type"]),
            json.loads(connection_data["connection_config"])
        )

        # Substitute parameters in SQL
        sql_content = query_data["sql_content"]
        for key, value in parameters.items():
            sql_content = sql_content.replace(f"{{{key}}}", str(value))

        # Execute query
        result = await engine.execute_query(sql_content)

        # Update job with results
        update_data = {
            "status": result.status.value,
            "completed_at": datetime.utcnow().isoformat(),
            "execution_time_ms": result.execution_time_ms,
            "rows_affected": result.rows_affected,
            "external_job_id": result.query_id
        }

        if result.error_message:
            update_data["error_message"] = result.error_message
        if result.result_data:
            update_data["result_preview"] = result.result_data

        supabase.table("job_executions").update(update_data).eq("id", job_id).execute()

    except Exception as e:
        logger.error(f"Query execution failed: {e}")
        supabase.table("job_executions").update({
            "status": "failed",
            "completed_at": datetime.utcnow().isoformat(),
            "error_message": str(e)
        }).eq("id", job_id).execute()


@router.get("/jobs", response_model=List[JobExecutionResponse])
async def list_jobs(
    status: Optional[QueryStatus] = None,
    limit: int = 50,
    org_id = Depends(get_user_organization)
):
    """List job executions."""
    supabase = get_supabase_client()

    query_builder = supabase.table("job_executions").select("*").eq(
        "organization_id", org_id
    )

    if status:
        query_builder = query_builder.eq("status", status.value)

    result = query_builder.order("created_at", desc=True).limit(limit).execute()
    return result.data


@router.get("/jobs/{job_id}", response_model=JobExecutionResponse)
async def get_job(
    job_id: str,
    org_id = Depends(get_user_organization)
):
    """Get job execution details."""
    supabase = get_supabase_client()

    result = supabase.table("job_executions").select("*").eq(
        "id", job_id
    ).eq("organization_id", org_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Job not found")

    return result.data[0]


@router.post("/jobs/{job_id}/cancel")
async def cancel_job(
    job_id: str,
    org_id = Depends(get_user_organization)
):
    """Cancel a running job."""
    supabase = get_supabase_client()

    # Get job details
    result = supabase.table("job_executions").select("*").eq(
        "id", job_id
    ).eq("organization_id", org_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Job not found")

    job_data = result.data[0]

    if job_data["status"] not in ["pending", "running"]:
        raise HTTPException(status_code=400, detail="Job cannot be cancelled")

    try:
        # Cancel external job if exists
        if job_data["external_job_id"]:
            # Get connection and create engine
            conn_result = supabase.table("database_connections").select("*").eq(
                "id", job_data["connection_id"]
            ).execute()

            if conn_result.data:
                connection_data = conn_result.data[0]
                engine = create_engine(
                    DatabaseType(connection_data["type"]),
                    json.loads(connection_data["connection_config"])
                )
                await engine.cancel_job(job_data["external_job_id"])

        # Update job status
        supabase.table("job_executions").update({
            "status": "cancelled",
            "completed_at": datetime.utcnow().isoformat()
        }).eq("id", job_id).execute()

        return {"message": "Job cancelled successfully"}

    except Exception as e:
        logger.error(f"Failed to cancel job: {e}")
        raise HTTPException(status_code=400, detail=str(e))