"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Plus,
  Database,
  MoreHorizontal,
  Edit,
  Trash2,
  TestTube,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface DatabaseConnection {
  id: string;
  name: string;
  type: "bigquery" | "snowflake" | "databricks" | "redshift" | "postgresql";
  is_active: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
  last_tested?: string;
  test_status?: "success" | "failed" | "testing";
}

interface ConnectionConfig {
  // BigQuery
  project_id?: string;
  credentials_json?: string;

  // Snowflake
  account?: string;
  user?: string;
  password?: string;
  warehouse?: string;
  database?: string;
  schema?: string;
  role?: string;

  // Databricks
  server_hostname?: string;
  http_path?: string;
  access_token?: string;

  // Redshift
  host?: string;
  port?: string;
  dbname?: string;
  username?: string;

  // PostgreSQL
  host_pg?: string;
  port_pg?: string;
  database_pg?: string;
  username_pg?: string;
  password_pg?: string;
}

interface ConnectionManagerProps {
  connections: DatabaseConnection[];
  onCreateConnection: (connection: { name: string; type: string; connection_config: ConnectionConfig; description?: string }) => Promise<void>;
  onUpdateConnection: (id: string, updates: Partial<DatabaseConnection>) => Promise<void>;
  onDeleteConnection: (id: string) => Promise<void>;
  onTestConnection: (id: string) => Promise<{ success: boolean; message: string }>;
  selectedConnectionId?: string;
  onSelectConnection?: (connectionId: string) => void;
  isLoading?: boolean;
}

export function ConnectionManager({
  connections,
  onCreateConnection,
  onUpdateConnection,
  onDeleteConnection,
  onTestConnection,
  selectedConnectionId,
  onSelectConnection,
  isLoading = false
}: ConnectionManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<DatabaseConnection | null>(null);
  const [testingConnectionId, setTestingConnectionId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCreateConnection = async (connectionData: any) => {
    try {
      await onCreateConnection(connectionData);
      setIsCreateDialogOpen(false);
      toast({
        title: "Connection created",
        description: "Database connection has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to create connection",
        description: "There was an error creating the database connection.",
        variant: "destructive",
      });
    }
  };

  const handleTestConnection = async (connectionId: string) => {
    setTestingConnectionId(connectionId);
    try {
      const result = await onTestConnection(connectionId);

      toast({
        title: result.success ? "Connection successful" : "Connection failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Test failed",
        description: "Unable to test the connection.",
        variant: "destructive",
      });
    } finally {
      setTestingConnectionId(null);
    }
  };

  const handleDeleteConnection = async (connectionId: string) => {
    if (confirm("Are you sure you want to delete this connection?")) {
      try {
        await onDeleteConnection(connectionId);
        toast({
          title: "Connection deleted",
          description: "Database connection has been deleted successfully.",
        });
      } catch (error) {
        toast({
          title: "Failed to delete connection",
          description: "There was an error deleting the connection.",
          variant: "destructive",
        });
      }
    }
  };

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case "bigquery": return "🔵";
      case "snowflake": return "❄️";
      case "databricks": return "🧱";
      case "redshift": return "🔴";
      case "postgresql": return "🐘";
      default: return "🗄️";
    }
  };

  const getStatusColor = (connection: DatabaseConnection) => {
    if (!connection.is_active) return "bg-gray-500";
    if (connection.test_status === "success") return "bg-green-500";
    if (connection.test_status === "failed") return "bg-red-500";
    return "bg-yellow-500";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Database Connections</h2>
          <p className="text-muted-foreground">
            Manage your database connections for query execution
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Connection
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Database Connection</DialogTitle>
            </DialogHeader>
            <ConnectionForm onSubmit={handleCreateConnection} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Connections Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : connections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32">
            <Database className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No database connections configured</p>
            <p className="text-sm text-muted-foreground">Add your first connection to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {connections.map((connection) => (
            <Card
              key={connection.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                selectedConnectionId === connection.id && "ring-2 ring-primary"
              )}
              onClick={() => onSelectConnection?.(connection.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getConnectionIcon(connection.type)}</span>
                    <div>
                      <CardTitle className="text-base">{connection.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {connection.type.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        getStatusColor(connection)
                      )}
                    />

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTestConnection(connection.id);
                          }}
                          disabled={testingConnectionId === connection.id}
                        >
                          {testingConnectionId === connection.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <TestTube className="h-4 w-4 mr-2" />
                          )}
                          Test Connection
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingConnection(connection);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConnection(connection.id);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {connection.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {connection.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Created {new Date(connection.created_at).toLocaleDateString()}</span>
                  {connection.test_status && (
                    <div className="flex items-center gap-1">
                      {connection.test_status === "success" && (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      )}
                      {connection.test_status === "failed" && (
                        <XCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span className="capitalize">{connection.test_status}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      {editingConnection && (
        <Dialog open={!!editingConnection} onOpenChange={() => setEditingConnection(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Connection: {editingConnection.name}</DialogTitle>
            </DialogHeader>
            <ConnectionForm
              initialData={editingConnection}
              onSubmit={async (data) => {
                await onUpdateConnection(editingConnection.id, data);
                setEditingConnection(null);
                toast({
                  title: "Connection updated",
                  description: "Database connection has been updated successfully.",
                });
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Connection Form Component
interface ConnectionFormProps {
  initialData?: Partial<DatabaseConnection>;
  onSubmit: (data: any) => Promise<void>;
}

function ConnectionForm({ initialData, onSubmit }: ConnectionFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    type: initialData?.type || "bigquery",
    description: initialData?.description || "",
    config: {} as ConnectionConfig
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({
        name: formData.name,
        type: formData.type,
        description: formData.description,
        connection_config: formData.config
      });
    } catch (error) {
      console.error("Failed to submit form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderConfigFields = () => {
    switch (formData.type) {
      case "bigquery":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="project_id">Project ID</Label>
              <Input
                id="project_id"
                value={formData.config.project_id || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  config: { ...formData.config, project_id: e.target.value }
                })}
                placeholder="your-gcp-project-id"
              />
            </div>
            <div>
              <Label htmlFor="credentials_json">Service Account JSON</Label>
              <Textarea
                id="credentials_json"
                value={formData.config.credentials_json || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  config: { ...formData.config, credentials_json: e.target.value }
                })}
                placeholder="Paste your service account JSON here..."
                rows={6}
              />
            </div>
          </div>
        );

      case "snowflake":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="account">Account</Label>
                <Input
                  id="account"
                  value={formData.config.account || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    config: { ...formData.config, account: e.target.value }
                  })}
                  placeholder="xy12345.us-east-1"
                />
              </div>
              <div>
                <Label htmlFor="user">User</Label>
                <Input
                  id="user"
                  value={formData.config.user || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    config: { ...formData.config, user: e.target.value }
                  })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.config.password || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  config: { ...formData.config, password: e.target.value }
                })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="warehouse">Warehouse</Label>
                <Input
                  id="warehouse"
                  value={formData.config.warehouse || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    config: { ...formData.config, warehouse: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="database">Database</Label>
                <Input
                  id="database"
                  value={formData.config.database || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    config: { ...formData.config, database: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>
        );

      case "databricks":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="server_hostname">Server Hostname</Label>
              <Input
                id="server_hostname"
                value={formData.config.server_hostname || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  config: { ...formData.config, server_hostname: e.target.value }
                })}
                placeholder="adb-1234567890123456.7.azuredatabricks.net"
              />
            </div>
            <div>
              <Label htmlFor="http_path">HTTP Path</Label>
              <Input
                id="http_path"
                value={formData.config.http_path || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  config: { ...formData.config, http_path: e.target.value }
                })}
                placeholder="/sql/1.0/warehouses/abc123"
              />
            </div>
            <div>
              <Label htmlFor="access_token">Access Token</Label>
              <Input
                id="access_token"
                type="password"
                value={formData.config.access_token || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  config: { ...formData.config, access_token: e.target.value }
                })}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            Select a database type to configure connection settings
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Connection Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="My Production Database"
            required
          />
        </div>

        <div>
          <Label htmlFor="type">Database Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value as any, config: {} })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bigquery">🔵 BigQuery</SelectItem>
              <SelectItem value="snowflake">❄️ Snowflake</SelectItem>
              <SelectItem value="databricks">🧱 Databricks</SelectItem>
              <SelectItem value="redshift">🔴 Redshift</SelectItem>
              <SelectItem value="postgresql">🐘 PostgreSQL</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="description">Description (Optional)</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of this connection"
          />
        </div>
      </div>

      {/* Database-specific configuration */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Connection Configuration</h3>
        {renderConfigFields()}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {initialData ? "Update Connection" : "Create Connection"}
        </Button>
      </div>
    </form>
  );
}