"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Play,
  Square,
  RefreshCw,
  MoreHorizontal,
  Eye,
  Copy,
  Trash2,
  Clock,
  Database,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Download,
  Filter,
  Search,
  Calendar,
  DollarSign,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

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
  triggered_by: "manual" | "schedule" | "dependency" | "webhook";
  created_at: string;

  // Joined data
  query_name?: string;
  connection_name?: string;
  connection_type?: string;
}

interface JobMonitorProps {
  jobs: JobExecution[];
  onRefresh: () => void;
  onCancelJob: (jobId: string) => Promise<void>;
  onRetryJob: (jobId: string) => Promise<void>;
  onViewJob: (job: JobExecution) => void;
  isLoading?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function JobMonitor({
  jobs,
  onRefresh,
  onCancelJob,
  onRetryJob,
  onViewJob,
  isLoading = false,
  autoRefresh = true,
  refreshInterval = 5000
}: JobMonitorProps) {
  const [filters, setFilters] = useState({
    status: "all",
    connection: "all",
    dateRange: "all",
    search: ""
  });
  const [selectedJob, setSelectedJob] = useState<JobExecution | null>(null);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      onRefresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, onRefresh]);

  const filteredJobs = jobs.filter(job => {
    if (filters.status !== "all" && job.status !== filters.status) return false;
    if (filters.connection !== "all" && job.connection_id !== filters.connection) return false;
    if (filters.search && !job.query_name?.toLowerCase().includes(filters.search.toLowerCase())) return false;

    // Date range filtering
    if (filters.dateRange !== "all") {
      const jobDate = new Date(job.created_at);
      const now = new Date();
      const diffHours = (now.getTime() - jobDate.getTime()) / (1000 * 60 * 60);

      switch (filters.dateRange) {
        case "1h":
          if (diffHours > 1) return false;
          break;
        case "24h":
          if (diffHours > 24) return false;
          break;
        case "7d":
          if (diffHours > 168) return false;
          break;
      }
    }

    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "running":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "cancelled":
        return <Square className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "completed":
        return "default";
      case "running":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return "-";
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "-";
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatCost = (cost?: number) => {
    if (!cost) return "-";
    return `$${cost.toFixed(4)}`;
  };

  const getUniqueConnections = () => {
    const connections = new Map();
    jobs.forEach(job => {
      if (job.connection_id && job.connection_name) {
        connections.set(job.connection_id, job.connection_name);
      }
    });
    return Array.from(connections.entries());
  };

  const getExecutionStats = () => {
    const stats = filteredJobs.reduce(
      (acc, job) => {
        acc.total++;
        acc[job.status]++;
        if (job.execution_time_ms) acc.totalTime += job.execution_time_ms;
        if (job.cost_estimate_usd) acc.totalCost += job.cost_estimate_usd;
        return acc;
      },
      {
        total: 0,
        pending: 0,
        running: 0,
        completed: 0,
        failed: 0,
        cancelled: 0,
        totalTime: 0,
        totalCost: 0
      }
    );

    return stats;
  };

  const stats = getExecutionStats();

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Job Monitor</h2>
          <p className="text-muted-foreground">
            Track and manage query execution jobs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running</CardTitle>
            <Loader2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.running}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCost(stats.totalCost)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(stats.completed > 0 ? stats.totalTime / stats.completed : 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Connection</label>
              <Select
                value={filters.connection}
                onValueChange={(value) => setFilters({ ...filters, connection: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Connections</SelectItem>
                  {getUniqueConnections().map(([id, name]) => (
                    <SelectItem key={id} value={id}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Time Range</label>
              <Select
                value={filters.dateRange}
                onValueChange={(value) => setFilters({ ...filters, dateRange: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search queries..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Execution History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Query</TableHead>
                  <TableHead>Connection</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Rows</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading jobs...
                        </div>
                      ) : (
                        "No jobs found"
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredJobs.map((job) => (
                    <TableRow key={job.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(job.status)}
                          <Badge variant={getStatusVariant(job.status)}>
                            {job.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{job.query_name || "Unnamed Query"}</p>
                          <p className="text-sm text-muted-foreground">
                            {job.triggered_by}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          <div>
                            <p className="font-medium">{job.connection_name}</p>
                            <Badge variant="outline" className="text-xs">
                              {job.connection_type?.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatDuration(job.execution_time_ms)}</TableCell>
                      <TableCell>
                        {job.rows_affected ? job.rows_affected.toLocaleString() : "-"}
                      </TableCell>
                      <TableCell>{formatCost(job.cost_estimate_usd)}</TableCell>
                      <TableCell>
                        {job.started_at ? format(new Date(job.started_at), "MMM d, HH:mm") : "-"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onViewJob(job)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>

                            {(job.status === "pending" || job.status === "running") && (
                              <DropdownMenuItem
                                onClick={() => onCancelJob(job.id)}
                                className="text-destructive"
                              >
                                <Square className="h-4 w-4 mr-2" />
                                Cancel
                              </DropdownMenuItem>
                            )}

                            {job.status === "failed" && (
                              <DropdownMenuItem onClick={() => onRetryJob(job.id)}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Retry
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Job ID
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Job Details Dialog */}
      {selectedJob && (
        <JobDetailsDialog
          job={selectedJob}
          open={!!selectedJob}
          onOpenChange={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
}

// Job Details Dialog Component
interface JobDetailsDialogProps {
  job: JobExecution;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function JobDetailsDialog({ job, open, onOpenChange }: JobDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Job Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Job Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Job ID:</span>
                  <span className="font-mono text-sm">{job.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={getStatusVariant(job.status)}>
                    {job.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Triggered By:</span>
                  <span>{job.triggered_by}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{format(new Date(job.created_at), "MMM d, yyyy HH:mm:ss")}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Execution Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span>{formatDuration(job.execution_time_ms)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rows Affected:</span>
                  <span>{job.rows_affected?.toLocaleString() || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bytes Processed:</span>
                  <span>{formatBytes(job.bytes_processed)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Cost:</span>
                  <span>{formatCost(job.cost_estimate_usd)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Error Message */}
          {job.error_message && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-destructive">Error Details</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-muted p-4 rounded-md overflow-auto">
                  {job.error_message}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* External Job Info */}
          {job.external_job_id && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">External Job</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">External Job ID:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{job.external_job_id}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(job.external_job_id!)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to get status variant (defined outside component to avoid redefinition)
function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "completed":
      return "default";
    case "running":
      return "secondary";
    case "failed":
      return "destructive";
    default:
      return "outline";
  }
}