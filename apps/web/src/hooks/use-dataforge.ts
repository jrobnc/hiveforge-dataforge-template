"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// Types
interface DatabaseConnection {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface Query {
  id: string;
  name: string;
  description?: string;
  sql_content: string;
  database_type: string;
  tags: string[];
  is_template: boolean;
  template_category?: string;
  template_variables: Record<string, any>;
  dependencies: string[];
  created_at: string;
  updated_at: string;
}

interface JobExecution {
  id: string;
  query_id: string;
  connection_id: string;
  external_job_id?: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  started_at?: string;
  completed_at?: string;
  execution_time_ms?: number;
  rows_affected?: number;
  bytes_processed?: number;
  cost_estimate_usd?: number;
  error_message?: string;
  triggered_by: string;
  created_at: string;
}

interface CreateConnectionData {
  name: string;
  type: string;
  connection_config: Record<string, any>;
  description?: string;
}

interface CreateQueryData {
  name: string;
  description?: string;
  sql_content: string;
  database_type: string;
  tags: string[];
  is_template: boolean;
  template_category?: string;
  template_variables: Record<string, any>;
  dependencies: string[];
}

interface ExecuteQueryData {
  query_id: string;
  connection_id: string;
  parameters: Record<string, any>;
}

// API Base URL - should be from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Generic API function
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Database Connections Hook
export function useConnections() {
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchConnections = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiCall<DatabaseConnection[]>("/dataforge/connections");
      setConnections(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch connections";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createConnection = async (connectionData: CreateConnectionData) => {
    try {
      const newConnection = await apiCall<DatabaseConnection>("/dataforge/connections", {
        method: "POST",
        body: JSON.stringify(connectionData),
      });
      setConnections(prev => [...prev, newConnection]);
      toast({
        title: "Success",
        description: "Connection created successfully",
      });
      return newConnection;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create connection";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateConnection = async (id: string, updates: Partial<DatabaseConnection>) => {
    try {
      const updatedConnection = await apiCall<DatabaseConnection>(
        `/dataforge/connections/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(updates),
        }
      );
      setConnections(prev =>
        prev.map(conn => (conn.id === id ? updatedConnection : conn))
      );
      toast({
        title: "Success",
        description: "Connection updated successfully",
      });
      return updatedConnection;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update connection";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteConnection = async (id: string) => {
    try {
      await apiCall(`/dataforge/connections/${id}`, {
        method: "DELETE",
      });
      setConnections(prev => prev.filter(conn => conn.id !== id));
      toast({
        title: "Success",
        description: "Connection deleted successfully",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete connection";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const testConnection = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await apiCall<{ success: boolean; message: string }>(
        `/dataforge/connections/${id}/test`,
        { method: "POST" }
      );
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to test connection";
      return { success: false, message: errorMessage };
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  return {
    connections,
    isLoading,
    error,
    refetch: fetchConnections,
    createConnection,
    updateConnection,
    deleteConnection,
    testConnection,
  };
}

// Queries Hook
export function useQueries() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchQueries = async (filters?: { is_template?: boolean; database_type?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters?.is_template !== undefined) {
        params.append("is_template", filters.is_template.toString());
      }
      if (filters?.database_type) {
        params.append("database_type", filters.database_type);
      }

      const url = `/dataforge/queries${params.toString() ? `?${params.toString()}` : ""}`;
      const data = await apiCall<Query[]>(url);
      setQueries(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch queries";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createQuery = async (queryData: CreateQueryData) => {
    try {
      const newQuery = await apiCall<Query>("/dataforge/queries", {
        method: "POST",
        body: JSON.stringify(queryData),
      });
      setQueries(prev => [...prev, newQuery]);
      toast({
        title: "Success",
        description: "Query saved successfully",
      });
      return newQuery;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create query";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateQuery = async (id: string, updates: Partial<Query>) => {
    try {
      const updatedQuery = await apiCall<Query>(`/dataforge/queries/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      setQueries(prev =>
        prev.map(query => (query.id === id ? updatedQuery : query))
      );
      toast({
        title: "Success",
        description: "Query updated successfully",
      });
      return updatedQuery;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update query";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteQuery = async (id: string) => {
    try {
      await apiCall(`/dataforge/queries/${id}`, {
        method: "DELETE",
      });
      setQueries(prev => prev.filter(query => query.id !== id));
      toast({
        title: "Success",
        description: "Query deleted successfully",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete query";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  return {
    queries,
    isLoading,
    error,
    refetch: fetchQueries,
    createQuery,
    updateQuery,
    deleteQuery,
  };
}

// Job Executions Hook
export function useJobExecutions() {
  const [jobs, setJobs] = useState<JobExecution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchJobs = async (filters?: { status?: string; limit?: number }) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters?.status) {
        params.append("status", filters.status);
      }
      if (filters?.limit) {
        params.append("limit", filters.limit.toString());
      }

      const url = `/dataforge/jobs${params.toString() ? `?${params.toString()}` : ""}`;
      const data = await apiCall<JobExecution[]>(url);
      setJobs(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch jobs";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const executeQuery = async (executeData: ExecuteQueryData) => {
    try {
      const job = await apiCall<JobExecution>("/dataforge/execute", {
        method: "POST",
        body: JSON.stringify(executeData),
      });
      setJobs(prev => [job, ...prev]);
      toast({
        title: "Success",
        description: "Query execution started",
      });
      return job;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to execute query";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const cancelJob = async (jobId: string) => {
    try {
      await apiCall(`/dataforge/jobs/${jobId}/cancel`, {
        method: "POST",
      });
      setJobs(prev =>
        prev.map(job =>
          job.id === jobId ? { ...job, status: "cancelled" as const } : job
        )
      );
      toast({
        title: "Success",
        description: "Job cancelled successfully",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to cancel job";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const getJob = async (jobId: string) => {
    try {
      const job = await apiCall<JobExecution>(`/dataforge/jobs/${jobId}`);
      return job;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch job";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return {
    jobs,
    isLoading,
    error,
    refetch: fetchJobs,
    executeQuery,
    cancelJob,
    getJob,
  };
}

// Combined DataForge Hook
export function useDataForge() {
  const connections = useConnections();
  const queries = useQueries();
  const jobs = useJobExecutions();

  return {
    connections,
    queries,
    jobs,
  };
}