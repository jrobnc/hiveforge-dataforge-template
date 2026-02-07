"use client";

import React, { useState, useEffect } from "react";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Save,
  Play,
  Database,
  Table,
  Columns,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Copy,
  FileText,
  Tag,
  Clock,
  Sparkles,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SQLEditor } from "./sql-editor";

interface QueryBuilderProps {
  connections: Array<{
    id: string;
    name: string;
    type: string;
  }>;
  selectedConnectionId?: string;
  onConnectionChange?: (connectionId: string) => void;
  onExecuteQuery?: (sql: string, connectionId: string) => void;
  onSaveQuery?: (queryData: QueryData) => void;
  isExecuting?: boolean;
  schemas?: SchemaInfo;
  templates?: QueryTemplate[];
}

interface QueryData {
  name: string;
  description?: string;
  sql_content: string;
  database_type: string;
  tags: string[];
  is_template: boolean;
  template_category?: string;
  template_variables: Record<string, any>;
}

interface SchemaInfo {
  databases: Array<{
    name: string;
    tables: Array<{
      name: string;
      columns: Array<{
        name: string;
        type: string;
        nullable?: boolean;
      }>;
    }>;
  }>;
}

interface QueryTemplate {
  id: string;
  name: string;
  description?: string;
  sql_content: string;
  database_type: string;
  template_category?: string;
  template_variables: Record<string, any>;
  tags: string[];
}

export function QueryBuilder({
  connections,
  selectedConnectionId,
  onConnectionChange,
  onExecuteQuery,
  onSaveQuery,
  isExecuting = false,
  schemas,
  templates = []
}: QueryBuilderProps) {
  const [sqlContent, setSqlContent] = useState("");
  const [queryData, setQueryData] = useState<Partial<QueryData>>({
    name: "",
    description: "",
    tags: [],
    is_template: false,
    template_variables: {}
  });
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [expandedDatabases, setExpandedDatabases] = useState<Set<string>>(new Set());
  const [selectedTemplate, setSelectedTemplate] = useState<QueryTemplate | null>(null);

  const selectedConnection = connections.find(c => c.id === selectedConnectionId);

  useEffect(() => {
    if (selectedConnection) {
      setQueryData(prev => ({
        ...prev,
        database_type: selectedConnection.type
      }));
    }
  }, [selectedConnection]);

  const handleExecute = () => {
    if (sqlContent.trim() && selectedConnectionId) {
      onExecuteQuery?.(sqlContent, selectedConnectionId);
    }
  };

  const handleSave = () => {
    if (queryData.name && sqlContent.trim()) {
      const fullQueryData: QueryData = {
        name: queryData.name!,
        description: queryData.description,
        sql_content: sqlContent,
        database_type: queryData.database_type || selectedConnection?.type || "",
        tags: queryData.tags || [],
        is_template: queryData.is_template || false,
        template_category: queryData.template_category,
        template_variables: queryData.template_variables || {}
      };

      onSaveQuery?.(fullQueryData);
      setIsSaveDialogOpen(false);
    }
  };

  const handleTemplateSelect = (template: QueryTemplate) => {
    setSqlContent(template.sql_content);
    setQueryData({
      name: `Copy of ${template.name}`,
      description: template.description,
      database_type: template.database_type,
      tags: [...template.tags],
      is_template: false,
      template_category: template.template_category,
      template_variables: { ...template.template_variables }
    });
    setSelectedTemplate(template);
  };

  const handleInsertTableName = (databaseName: string, tableName: string) => {
    const fullTableName = selectedConnection?.type === "bigquery"
      ? `\`${databaseName}.${tableName}\``
      : `${databaseName}.${tableName}`;

    // Insert at cursor position - this is simplified
    setSqlContent(prev => prev + (prev ? "\n" : "") + `SELECT * FROM ${fullTableName} LIMIT 10;`);
  };

  const handleGenerateWithAI = async (prompt: string) => {
    // TODO: Implement AI query generation
    console.log("Generate SQL with AI:", prompt);
  };

  const toggleDatabaseExpansion = (databaseName: string) => {
    const newExpanded = new Set(expandedDatabases);
    if (newExpanded.has(databaseName)) {
      newExpanded.delete(databaseName);
    } else {
      newExpanded.add(databaseName);
    }
    setExpandedDatabases(newExpanded);
  };

  return (
    <div className="flex h-full gap-6">
      {/* Left Sidebar - Schema & Templates */}
      <div className="w-80 space-y-4">
        {/* Connection Selector */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Database Connection</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedConnectionId} onValueChange={onConnectionChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a connection..." />
              </SelectTrigger>
              <SelectContent>
                {connections.map((connection) => (
                  <SelectItem key={connection.id} value={connection.id}>
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      <span>{connection.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {connection.type.toUpperCase()}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Schema Explorer */}
        {selectedConnectionId && (
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Table className="h-4 w-4" />
                Schema Explorer
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-auto">
                {schemas?.databases.map((database) => (
                  <div key={database.name} className="border-b last:border-b-0">
                    <Collapsible
                      open={expandedDatabases.has(database.name)}
                      onOpenChange={() => toggleDatabaseExpansion(database.name)}
                    >
                      <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 hover:bg-muted/50">
                        {expandedDatabases.has(database.name) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <Database className="h-4 w-4" />
                        <span className="font-medium">{database.name}</span>
                        <Badge variant="outline" className="ml-auto text-xs">
                          {database.tables.length} tables
                        </Badge>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="pl-6">
                          {database.tables.map((table) => (
                            <Collapsible key={table.name}>
                              <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 hover:bg-muted/30 text-sm">
                                <Table className="h-3 w-3" />
                                <span>{table.name}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="ml-auto h-6 px-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleInsertTableName(database.name, table.name);
                                  }}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="pl-6 py-2">
                                  {table.columns.map((column) => (
                                    <div
                                      key={column.name}
                                      className="flex items-center gap-2 py-1 text-xs text-muted-foreground"
                                    >
                                      <Columns className="h-3 w-3" />
                                      <span>{column.name}</span>
                                      <Badge variant="outline" className="text-xs">
                                        {column.type}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Templates */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Quick Templates
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-64 overflow-auto">
              {templates
                .filter(t => !selectedConnection || t.database_type === selectedConnection.type)
                .slice(0, 10)
                .map((template) => (
                  <div
                    key={template.id}
                    className="p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{template.name}</p>
                        {template.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {template.description}
                          </p>
                        )}
                        <div className="flex gap-1 mt-2">
                          {template.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - SQL Editor */}
      <div className="flex-1 space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Query Builder</h2>
            {selectedTemplate && (
              <Badge variant="outline" className="gap-1">
                <FileText className="h-3 w-3" />
                From: {selectedTemplate.name}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <AIQueryGenerator onGenerate={handleGenerateWithAI} />

            <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Query
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Query</DialogTitle>
                </DialogHeader>
                <SaveQueryForm
                  queryData={queryData}
                  onQueryDataChange={setQueryData}
                  onSave={handleSave}
                />
              </DialogContent>
            </Dialog>

            <Button
              onClick={handleExecute}
              disabled={!sqlContent.trim() || !selectedConnectionId || isExecuting}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              {isExecuting ? "Running..." : "Execute"}
            </Button>
          </div>
        </div>

        {/* SQL Editor */}
        <SQLEditor
          value={sqlContent}
          onChange={setSqlContent}
          onExecute={handleExecute}
          onSave={() => setIsSaveDialogOpen(true)}
          language={selectedConnection?.type || "sql"}
          isExecuting={isExecuting}
          canExecute={!!selectedConnectionId}
          connectionName={selectedConnection?.name}
          height="600px"
        />
      </div>
    </div>
  );
}

// AI Query Generator Component
interface AIQueryGeneratorProps {
  onGenerate: (prompt: string) => void;
}

function AIQueryGenerator({ onGenerate }: AIQueryGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleGenerate = () => {
    if (prompt.trim()) {
      onGenerate(prompt);
      setPrompt("");
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          AI Generate
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate SQL with AI</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="ai-prompt">Describe what you want to query</Label>
            <Textarea
              id="ai-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'Show me the top 10 customers by revenue in the last 30 days'"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={!prompt.trim()}>
              Generate SQL
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Save Query Form Component
interface SaveQueryFormProps {
  queryData: Partial<QueryData>;
  onQueryDataChange: (data: Partial<QueryData>) => void;
  onSave: () => void;
}

function SaveQueryForm({ queryData, onQueryDataChange, onSave }: SaveQueryFormProps) {
  const [newTag, setNewTag] = useState("");

  const addTag = () => {
    if (newTag.trim() && !queryData.tags?.includes(newTag.trim())) {
      onQueryDataChange({
        ...queryData,
        tags: [...(queryData.tags || []), newTag.trim()]
      });
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onQueryDataChange({
      ...queryData,
      tags: queryData.tags?.filter(tag => tag !== tagToRemove) || []
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="query-name">Query Name</Label>
        <Input
          id="query-name"
          value={queryData.name || ""}
          onChange={(e) => onQueryDataChange({ ...queryData, name: e.target.value })}
          placeholder="My Query"
          required
        />
      </div>

      <div>
        <Label htmlFor="query-description">Description (Optional)</Label>
        <Textarea
          id="query-description"
          value={queryData.description || ""}
          onChange={(e) => onQueryDataChange({ ...queryData, description: e.target.value })}
          placeholder="Brief description of what this query does"
        />
      </div>

      <div>
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {queryData.tags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              <Tag className="h-3 w-3" />
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add tag"
            onKeyPress={(e) => e.key === "Enter" && addTag()}
          />
          <Button type="button" variant="outline" onClick={addTag}>
            Add
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is-template"
          checked={queryData.is_template || false}
          onChange={(e) => onQueryDataChange({ ...queryData, is_template: e.target.checked })}
        />
        <Label htmlFor="is-template">Save as template for reuse</Label>
      </div>

      {queryData.is_template && (
        <div>
          <Label htmlFor="template-category">Template Category</Label>
          <Select
            value={queryData.template_category}
            onValueChange={(value) => onQueryDataChange({ ...queryData, template_category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Analytics">Analytics</SelectItem>
              <SelectItem value="Business Intelligence">Business Intelligence</SelectItem>
              <SelectItem value="Data Quality">Data Quality</SelectItem>
              <SelectItem value="ETL">ETL</SelectItem>
              <SelectItem value="Reporting">Reporting</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={!queryData.name?.trim()}>
          Save Query
        </Button>
      </div>
    </div>
  );
}