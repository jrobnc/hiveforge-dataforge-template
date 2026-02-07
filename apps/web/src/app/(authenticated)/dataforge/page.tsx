"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Database,
  FileText,
  Activity,
  Plus,
  TrendingUp,
  Clock,
  DollarSign,
  Zap
} from "lucide-react";

import { ConnectionManager } from "@/components/dataforge/connection-manager";
import { QueryBuilder } from "@/components/dataforge/query-builder";
import { JobMonitor } from "@/components/dataforge/job-monitor";
import { useDataForge } from "@/hooks/use-dataforge";

export default function DataForgePage() {
  const { connections, queries, jobs } = useDataForge();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>();

  // Dashboard stats
  const stats = {
    totalConnections: connections.connections.length,
    activeConnections: connections.connections.filter(c => c.is_active).length,
    totalQueries: queries.queries.length,
    templatesCount: queries.queries.filter(q => q.is_template).length,
    runningJobs: jobs.jobs.filter(j => j.status === "running").length,
    completedToday: jobs.jobs.filter(j => {
      const today = new Date().toDateString();
      return j.status === "completed" && new Date(j.created_at).toDateString() === today;
    }).length,
    totalCostToday: jobs.jobs
      .filter(j => {
        const today = new Date().toDateString();
        return new Date(j.created_at).toDateString() === today;
      })
      .reduce((sum, j) => sum + (j.cost_estimate_usd || 0), 0),
    avgExecutionTime: (() => {
      const completedJobs = jobs.jobs.filter(j => j.status === "completed" && j.execution_time_ms);
      if (completedJobs.length === 0) return 0;
      return completedJobs.reduce((sum, j) => sum + (j.execution_time_ms || 0), 0) / completedJobs.length;
    })()
  };

  const handleExecuteQuery = async (sql: string, connectionId: string) => {
    try {
      // Create a temporary query for execution
      const tempQuery = await queries.createQuery({
        name: `Quick Query ${new Date().toLocaleTimeString()}`,
        sql_content: sql,
        database_type: connections.connections.find(c => c.id === connectionId)?.type || "sql",
        tags: ["quick-query"],
        is_template: false,
        template_variables: {},
        dependencies: []
      });

      // Execute the query
      await jobs.executeQuery({
        query_id: tempQuery.id,
        connection_id: connectionId,
        parameters: {}
      });

      // Switch to jobs tab to show execution
      setActiveTab("jobs");
    } catch (error) {
      console.error("Failed to execute query:", error);
    }
  };

  const handleRetryJob = async (jobId: string) => {
    try {
      const job = await jobs.getJob(jobId);
      await jobs.executeQuery({
        query_id: job.query_id,
        connection_id: job.connection_id,
        parameters: {}
      });
    } catch (error) {
      console.error("Failed to retry job:", error);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">DataForge</h1>
          <p className="text-muted-foreground">
            Multi-database orchestration and query execution platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Zap className="h-3 w-3" />
            {stats.activeConnections} Active
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="connections" className="gap-2">
            <Database className="h-4 w-4" />
            Connections
          </TabsTrigger>
          <TabsTrigger value="query-builder" className="gap-2">
            <FileText className="h-4 w-4" />
            Query Builder
          </TabsTrigger>
          <TabsTrigger value="jobs" className="gap-2">
            <Activity className="h-4 w-4" />
            Jobs
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeConnections}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalConnections} total configured
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Queries</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalQueries}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.templatesCount} templates
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Running Jobs</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.runningJobs}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.completedToday} completed today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cost Today</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${stats.totalCostToday.toFixed(4)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Avg: {(stats.avgExecutionTime / 1000).toFixed(1)}s per query
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Jobs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {jobs.jobs.slice(0, 5).map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-3 rounded-md border">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          job.status === "completed" ? "bg-green-500" :
                          job.status === "running" ? "bg-blue-500" :
                          job.status === "failed" ? "bg-red-500" :
                          "bg-yellow-500"
                        }`} />
                        <div>
                          <p className="font-medium text-sm">Job {job.id.slice(0, 8)}...</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(job.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        job.status === "completed" ? "default" :
                        job.status === "running" ? "secondary" :
                        job.status === "failed" ? "destructive" :
                        "outline"
                      }>
                        {job.status}
                      </Badge>
                    </div>
                  ))}
                  {jobs.jobs.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No jobs executed yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    className="w-full justify-start gap-2"
                    onClick={() => setActiveTab("connections")}
                  >
                    <Database className="h-4 w-4" />
                    Add Database Connection
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => setActiveTab("query-builder")}
                  >
                    <FileText className="h-4 w-4" />
                    Create New Query
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => setActiveTab("jobs")}
                  >
                    <Activity className="h-4 w-4" />
                    View Job History
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Connection Status */}
          {stats.totalConnections > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Connection Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {connections.connections.slice(0, 6).map((connection) => (
                    <div key={connection.id} className="flex items-center gap-3 p-3 rounded-md border">
                      <div className={`w-3 h-3 rounded-full ${
                        connection.is_active ? "bg-green-500" : "bg-gray-400"
                      }`} />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{connection.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {connection.type.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Connections Tab */}
        <TabsContent value="connections">
          <ConnectionManager
            connections={connections.connections}
            onCreateConnection={connections.createConnection}
            onUpdateConnection={connections.updateConnection}
            onDeleteConnection={connections.deleteConnection}
            onTestConnection={connections.testConnection}
            selectedConnectionId={selectedConnectionId}
            onSelectConnection={setSelectedConnectionId}
            isLoading={connections.isLoading}
          />
        </TabsContent>

        {/* Query Builder Tab */}
        <TabsContent value="query-builder">
          <QueryBuilder
            connections={connections.connections.map(c => ({
              id: c.id,
              name: c.name,
              type: c.type
            }))}
            selectedConnectionId={selectedConnectionId}
            onConnectionChange={setSelectedConnectionId}
            onExecuteQuery={handleExecuteQuery}
            onSaveQuery={queries.createQuery}
            isExecuting={jobs.isLoading}
            templates={queries.queries.filter(q => q.is_template)}
          />
        </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value="jobs">
          <JobMonitor
            jobs={jobs.jobs.map(job => ({
              ...job,
              // Add joined data from connections
              connection_name: connections.connections.find(c => c.id === job.connection_id)?.name,
              connection_type: connections.connections.find(c => c.id === job.connection_id)?.type,
              // Add query name if available
              query_name: queries.queries.find(q => q.id === job.query_id)?.name
            }))}
            onRefresh={jobs.refetch}
            onCancelJob={jobs.cancelJob}
            onRetryJob={handleRetryJob}
            onViewJob={(job) => {
              // TODO: Implement job details view
              console.log("View job:", job);
            }}
            isLoading={jobs.isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}