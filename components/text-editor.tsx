"use client";

import React, { useCallback, useRef, useState } from "react";
import { Button } from "@nextui-org/button";
import { ScrollShadow } from "@nextui-org/react";
import { Icon } from "@iconify/react";

import { Chapter } from "@/types";

interface TextEditorProps {
  chapter?: Chapter;
  onContentChange: (content: string) => void;
  onInsertSplit: () => void;
  onSplitChapter: () => void;
  onToggleLeftPanel?: () => void;
  isLeftPanelCollapsed?: boolean;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  chapter,
  onContentChange,
  onInsertSplit,
  onSplitChapter,
  onToggleLeftPanel,
  isLeftPanelCollapsed = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [content, setContent] = useState(chapter?.content || "");

  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;

      setContent(newContent);
      onContentChange(newContent);
    },
    [onContentChange],
  );

  const handleInsertSplit = useCallback(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const cursorPosition = textarea.selectionStart;
      const before = content.substring(0, cursorPosition);
      const after = content.substring(cursorPosition);
      const newContent = `${before}\n\n====SPLIT CHAPTER====\n${after}`;

      setContent(newContent);
      onContentChange(newContent);

      // Reset cursor position after the split marker
      setTimeout(() => {
        const newPosition =
          cursorPosition + "\n\n====SPLIT CHAPTER====\n".length;

        textarea.setSelectionRange(newPosition, newPosition);
        textarea.focus();
      }, 0);
    }
    onInsertSplit();
  }, [content, onContentChange, onInsertSplit]);

  // Update content when chapter changes
  React.useEffect(() => {
    setContent(chapter?.content || "");
  }, [chapter]);

  if (!chapter) {
    return (
      <div className="w-full h-full flex items-center justify-center text-default-400">
        <div className="text-center">
          <Icon
            className="mx-auto mb-4"
            icon="solar:document-text-outline"
            width={48}
          />
          <p>Select a chapter to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header with Chapter Title */}
      <header className="flex items-center justify-between pb-4 border-b border-divider">
        <div className="flex items-center gap-3">
          <Button
            isIconOnly
            className="text-default-500"
            size="sm"
            variant="light"
            onPress={onToggleLeftPanel}
          >
            <Icon
              height={24}
              icon={
                isLeftPanelCollapsed
                  ? "solar:sidebar-minimalistic-outline"
                  : "solar:sidebar-minimalistic-outline"
              }
              width={24}
            />
          </Button>
          <h4 className="text-lg font-medium">{chapter.title}</h4>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-2">
          <Button
            color="primary"
            size="sm"
            startContent={<Icon icon="solar:check-circle-outline" width={16} />}
            variant="flat"
          >
            Finish import
          </Button>
        </div>
      </header>

      {/* Editor Area */}
      <div className="flex-1 mt-4">
        <div className="relative h-full bg-default-50 dark:bg-default-100 rounded-lg">
          {/* Left side toolbar */}
          <div className="absolute left-4 top-4 z-10 flex gap-2">
            <Button
              className="bg-background/80 backdrop-blur-sm"
              size="sm"
              startContent={
                <Icon icon="fluent:split-horizontal-12-filled" width={16} />
              }
              variant="flat"
              onPress={handleInsertSplit}
            >
              Insert chapter split
            </Button>

            <Button
              className="bg-background/80 backdrop-blur-sm"
              size="sm"
              startContent={
                <Icon
                  className="text-default-500"
                  icon="solar:undo-left-round-bold"
                  width={16}
                />
              }
              variant="flat"
            >
              Undo
            </Button>
          </div>
          <div className="absolute right-4 top-4 z-10">
            <Button
              className="bg-background/80 backdrop-blur-sm"
              size="sm"
              startContent={<Icon icon="iconoir:vertical-split" width={16} />}
              variant="flat"
              onPress={onSplitChapter}
            >
              Split
            </Button>
          </div>

          {/* Text Editor */}
          <ScrollShadow className="absolute left-2 right-2 bottom-4 top-16">
            <div className="h-full bg-background rounded-lg p-2">
              <textarea
                ref={textareaRef}
                className="w-full h-full p-4 resize-none rounded-md border-none bg-transparent text-foreground focus:outline-none"
                placeholder="Start writing your chapter..."
                style={{ minHeight: "400px" }}
                value={content}
                onChange={handleContentChange}
              />
            </div>
          </ScrollShadow>
        </div>
      </div>
    </div>
  );
};
