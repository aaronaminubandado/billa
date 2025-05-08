"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DownloadIcon,
  FileIcon,
  FileTextIcon,
  Loader2Icon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ExportButtons() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = (format: string) => {
    setIsExporting(true);

    // TODO: Implement actual export logic based on the format
    console.log(`Exporting in ${format} format...`);

    // Simulate export delay
    setTimeout(() => {
      setIsExporting(false);
      console.log(`Export to ${format} completed!`);
    }, 1500);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={isExporting}>
          {isExporting ? (
            <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <DownloadIcon className="h-4 w-4 mr-2" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <FileTextIcon className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("pdf")}>
          <FileIcon className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
