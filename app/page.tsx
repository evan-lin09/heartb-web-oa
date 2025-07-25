"use client";

import React, { useState } from "react";

import { FileUpload } from "@/components/file-upload";
import { ChapterList } from "@/components/chapter-list";
import { TextEditor } from "@/components/text-editor";
import { useNovelEditor } from "@/hooks/use-novel-editor";

export default function Home() {
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);

  const {
    project,
    currentChapterId,
    isLoading,
    error,
    importFile,
    selectChapter,
    updateChapterContent,
    insertSplitMarker,
    splitCurrentChapter,
    mergeWithNextChapter,
    deleteChapter,
    getCurrentChapter,
  } = useNovelEditor();

  const currentChapter = getCurrentChapter();

  const handleContentChange = (content: string) => {
    if (currentChapterId) {
      updateChapterContent(currentChapterId, content);
    }
  };

  const toggleLeftPanel = () => {
    setIsLeftPanelCollapsed(!isLeftPanelCollapsed);
  };

  return (
    <div className="h-[calc(100vh-10rem)] bg-background border border-divider rounded-lg flex flex-col overflow-hidden">
      {error && (
        <div className="bg-danger-50 border border-danger-200 text-danger-800 px-4 py-3 rounded mb-4 mx-4 mt-4">
          {error}
        </div>
      )}

      {/* Top Upload Section */}
      <div className="px-6 py-4 border-b border-divider">
        <div className="w-fit">
          <FileUpload isLoading={isLoading} onFileSelect={importFile} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Chapters Only */}
        <div
          className={`${isLeftPanelCollapsed ? "w-0" : "w-96"} ${!isLeftPanelCollapsed ? "border-r border-divider" : ""} transition-all duration-300 overflow-hidden`}
        >
          {!isLeftPanelCollapsed && (
            <div className="w-96 p-6 h-full flex flex-col overflow-hidden">
              {project ? (
                <ChapterList
                  chapters={project.chapters}
                  currentChapterId={currentChapterId || undefined}
                  onChapterSelect={selectChapter}
                  onCombineWithNext={mergeWithNextChapter}
                  onDeleteChapter={deleteChapter}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-default-400">
                  <div className="text-center">
                    <p className="text-sm">Upload a file to see chapters</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel - Text Editor */}
        <div className="flex-1 p-6 overflow-hidden">
          <TextEditor
            chapter={currentChapter || undefined}
            isLeftPanelCollapsed={isLeftPanelCollapsed}
            onContentChange={handleContentChange}
            onInsertSplit={insertSplitMarker}
            onSplitChapter={splitCurrentChapter}
            onToggleLeftPanel={toggleLeftPanel}
          />
        </div>
      </div>
    </div>
  );
}
