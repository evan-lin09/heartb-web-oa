"use client";

import React, { useCallback } from "react";
import { Button } from "@nextui-org/button";
import { Icon } from "@iconify/react";

interface FileUploadProps {
  onFileSelect: (content: string, filename: string) => void;
  isLoading?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  isLoading,
}) => {
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) return;

      if (!file.name.toLowerCase().endsWith(".txt")) {
        alert("请选择 .txt 文件");

        return;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target?.result as string;

        onFileSelect(content, file.name);
      };
      reader.readAsText(file, "UTF-8");

      // Reset input
      event.target.value = "";
    },
    [onFileSelect],
  );

  return (
    <div className="w-full">
      <input
        accept=".txt"
        className="hidden"
        disabled={isLoading}
        id="file-upload"
        type="file"
        onChange={handleFileChange}
      />
      <label htmlFor="file-upload">
        <Button
          as="span"
          className="w-full cursor-pointer"
          color="primary"
          isDisabled={isLoading}
          startContent={
            <Icon
              icon={isLoading ? "line-md:loading-loop" : "solar:import-bold"}
              width={20}
            />
          }
          variant="flat"
        >
          {isLoading ? "处理中..." : "Import txt"}
        </Button>
      </label>
    </div>
  );
};
