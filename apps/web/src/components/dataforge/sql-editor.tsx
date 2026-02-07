"use client";

import React, { useRef, useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Square,
  Save,
  Download,
  Upload,
  Maximize2,
  Minimize2,
  Settings,
  Database,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "sql-formatter";

interface SQLEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  onExecute?: (sql: string) => void;
  onSave?: (sql: string) => void;
  language?: "sql" | "bigquery" | "snowflake" | "databricks";
  isExecuting?: boolean;
  canExecute?: boolean;
  className?: string;
  readOnly?: boolean;
  height?: string;
  connectionName?: string;
  executionTime?: number;
  rowCount?: number;
}

export function SQLEditor({
  value = "",
  onChange,
  onExecute,
  onSave,
  language = "sql",
  isExecuting = false,
  canExecute = true,
  className,
  readOnly = false,
  height = "400px",
  connectionName,
  executionTime,
  rowCount
}: SQLEditorProps) {
  const editorRef = useRef<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedText, setSelectedText] = useState("");

  // Monaco editor mount handler
  function handleEditorDidMount(editor: any, monaco: any) {
    editorRef.current = editor;

    // Configure SQL autocompletion
    monaco.languages.registerCompletionItemProvider("sql", {
      provideCompletionItems: (model: any, position: any) => {
        const suggestions = getSQLSuggestions(language, monaco);
        return { suggestions };
      },
    });

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleExecute();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave();
    });

    // Track selected text
    editor.onDidChangeCursorSelection((e: any) => {
      const selectedText = editor.getModel()?.getValueInRange(e.selection);
      setSelectedText(selectedText || "");
    });
  }

  const handleExecute = () => {
    if (!canExecute || isExecuting) return;

    const sqlToExecute = selectedText.trim() || value.trim();
    if (sqlToExecute && onExecute) {
      onExecute(sqlToExecute);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(value);
    }
  };

  const handleFormat = () => {
    try {
      const formatted = format(value, {
        language: getFormatterLanguage(language),
        uppercase: true,
        linesBetweenQueries: 2,
      });
      onChange?.(formatted);
    } catch (error) {
      console.warn("Failed to format SQL:", error);
    }
  };

  const handleExport = () => {
    const blob = new Blob([value], { type: "text/sql" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `query-${new Date().toISOString().split("T")[0]}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onChange?.(content);
      };
      reader.readAsText(file);
    }
  };

  const getEditorTheme = () => {
    return "vs-dark"; // Could be made configurable
  };

  const getLanguageMode = (lang: string) => {
    switch (lang) {
      case "bigquery":
      case "snowflake":
      case "databricks":
        return "sql";
      default:
        return "sql";
    }
  };

  return (
    <Card className={cn("flex flex-col", className, {
      "fixed inset-4 z-50": isFullscreen,
    })}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">SQL Editor</CardTitle>
            {connectionName && (
              <Badge variant="secondary" className="gap-1">
                <Database className="h-3 w-3" />
                {connectionName}
              </Badge>
            )}
            {language !== "sql" && (
              <Badge variant="outline">{language.toUpperCase()}</Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Execution stats */}
            {executionTime && (
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                {executionTime}ms
              </Badge>
            )}
            {rowCount !== undefined && (
              <Badge variant="secondary">
                {rowCount.toLocaleString()} rows
              </Badge>
            )}

            {/* Action buttons */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleFormat}
              disabled={!value.trim()}
            >
              Format
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleExecute}
              disabled={!canExecute || isExecuting || !value.trim()}
              size="sm"
              className="gap-2"
            >
              {isExecuting ? (
                <Square className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isExecuting ? "Running..." : selectedText ? "Run Selection" : "Run Query"}
            </Button>

            <Button
              variant="outline"
              onClick={handleSave}
              disabled={!value.trim()}
              size="sm"
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={handleExport}
              disabled={!value.trim()}
              size="sm"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>

            <label className="cursor-pointer">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                asChild
              >
                <span>
                  <Upload className="h-4 w-4" />
                  Import
                </span>
              </Button>
              <input
                type="file"
                accept=".sql,.txt"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <Editor
          height={isFullscreen ? "calc(100vh - 200px)" : height}
          language={getLanguageMode(language)}
          theme={getEditorTheme()}
          value={value}
          onChange={(newValue) => onChange?.(newValue || "")}
          onMount={handleEditorDidMount}
          options={{
            readOnly,
            minimap: { enabled: isFullscreen },
            wordWrap: "on",
            fontSize: 14,
            lineNumbers: "on",
            renderLineHighlight: "all",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            formatOnPaste: true,
            formatOnType: true,
            tabSize: 2,
            insertSpaces: true,
            // SQL-specific options
            suggest: {
              snippetsPreventQuickSuggestions: false,
            },
            quickSuggestions: {
              other: true,
              comments: false,
              strings: false,
            },
          }}
        />
      </CardContent>
    </Card>
  );
}

// Helper functions
function getSQLSuggestions(language: string, monaco: any) {
  const commonKeywords = [
    "SELECT", "FROM", "WHERE", "JOIN", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN",
    "GROUP BY", "ORDER BY", "HAVING", "LIMIT", "OFFSET", "UNION", "INSERT",
    "UPDATE", "DELETE", "CREATE", "ALTER", "DROP", "TABLE", "DATABASE",
    "INDEX", "VIEW", "PROCEDURE", "FUNCTION", "TRIGGER", "IF", "ELSE",
    "CASE", "WHEN", "THEN", "END", "AS", "AND", "OR", "NOT", "IN", "EXISTS",
    "BETWEEN", "LIKE", "IS", "NULL", "DISTINCT", "COUNT", "SUM", "AVG",
    "MIN", "MAX", "SUBSTRING", "CONCAT", "UPPER", "LOWER", "TRIM"
  ];

  const databaseSpecific: Record<string, string[]> = {
    bigquery: [
      "UNNEST", "ARRAY", "STRUCT", "SAFE_CAST", "EXTRACT", "TIMESTAMP",
      "DATE", "DATETIME", "TIME", "GENERATE_ARRAY", "GENERATE_DATE_ARRAY",
      "PARSE_DATE", "FORMAT_DATE", "STRING_AGG", "APPROX_COUNT_DISTINCT",
      "PERCENTILE_CONT", "PERCENTILE_DISC", "LAG", "LEAD", "ROW_NUMBER",
      "RANK", "DENSE_RANK", "NTILE", "FIRST_VALUE", "LAST_VALUE"
    ],
    snowflake: [
      "QUALIFY", "LATERAL", "FLATTEN", "TRY_CAST", "PARSE_JSON", "GET",
      "GET_PATH", "ARRAY_CONSTRUCT", "OBJECT_CONSTRUCT", "IFF", "ZEROIFNULL",
      "NULLIFZERO", "DATEDIFF", "DATEADD", "TIME_SLICE", "CONDITIONAL_TRUE_EVENT",
      "CONDITIONAL_CHANGE_EVENT", "LISTAGG", "MEDIAN", "MODE", "STDDEV"
    ],
    databricks: [
      "DELTA", "MERGE", "OPTIMIZE", "VACUUM", "DESCRIBE", "MSCK", "REPAIR",
      "CACHE", "UNCACHE", "REFRESH", "EXPLAIN", "ANALYZE", "COLLECT_LIST",
      "COLLECT_SET", "EXPLODE", "POSEXPLODE", "INLINE", "STACK", "JSON_EXTRACT",
      "FROM_JSON", "TO_JSON", "SCHEMA_OF_JSON", "MAP_FROM_ARRAYS"
    ]
  };

  const keywords = [
    ...commonKeywords,
    ...(databaseSpecific[language] || [])
  ];

  return keywords.map((keyword) => ({
    label: keyword,
    kind: monaco.languages.CompletionItemKind.Keyword,
    insertText: keyword,
    detail: `${language.toUpperCase()} keyword`,
  }));
}

function getFormatterLanguage(language: string): string {
  switch (language) {
    case "bigquery":
      return "bigquery";
    case "snowflake":
      return "snowflake";
    case "databricks":
      return "spark";
    default:
      return "sql";
  }
}