import { useCallback } from "react";

import { Chapter } from "@/types";

export const useChapterParser = () => {
  const parseChapters = useCallback(
    (content: string, filename: string): Chapter[] => {
      const chapters: Chapter[] = [];

      // Multiple chapter patterns to support different formats
      const chapterPatterns = [
        // Pattern 1: "Chapter 1", "Chapter 2", etc.
        /^Chapter\s+(\d+)(?:\s*[-:]\s*(.+))?$/gim,
        // Pattern 2: "Chapter One", "Chapter Two", etc.
        /^Chapter\s+(One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Eleven|Twelve)(?:\s*[-:]\s*(.+))?$/gim,
        // Pattern 3: Roman numerals "Chapter I", "Chapter II", etc.
        /^Chapter\s+([IVX]+)(?:\s*[-:]\s*(.+))?$/gim,
        // Pattern 4: Just numbers "1.", "2.", etc.
        /^(\d+)\.(?:\s*(.+))?$/gim,
        // Pattern 5: Chinese format "第一章", "第二章", etc.
        /^第[一二三四五六七八九十百千万]+章(?:\s*[-:]\s*(.+))?$/gim,
      ];

      let matches: RegExpMatchArray[] = [];

      // Try each pattern to find chapter divisions
      for (const pattern of chapterPatterns) {
        pattern.lastIndex = 0; // Reset regex
        const patternMatches = Array.from(content.matchAll(pattern));

        if (patternMatches.length > 0) {
          matches = patternMatches;
          break;
        }
      }

      if (matches.length === 0) {
        // If no chapters found, treat entire content as one chapter
        return [
          {
            id: "chapter-1",
            title: filename.replace(".txt", "") || "Chapter 1",
            content: content.trim(),
            status: "pending",
            order: 1,
          },
        ];
      }

      // Process found chapters
      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const nextMatch = matches[i + 1];

        const startIndex = match.index!;
        const endIndex = nextMatch ? nextMatch.index! : content.length;

        const chapterContent = content.slice(startIndex, endIndex).trim();
        const chapterNumber = match[1];
        const chapterTitle = match[0] || `Chapter ${chapterNumber}`;

        chapters.push({
          id: `chapter-${i + 1}`,
          title: chapterTitle.trim(),
          content: chapterContent,
          status: "pending",
          order: i + 1,
        });
      }

      return chapters;
    },
    [],
  );

  const splitChapter = useCallback(
    (chapter: Chapter, splitMarker = "====SPLIT CHAPTER====") => {
      const parts = chapter.content.split(splitMarker);

      if (parts.length <= 1) {
        return [chapter]; // No splits found
      }

      return parts.map((part, index) => ({
        ...chapter,
        id: `${chapter.id}-${index + 1}`,
        title: index === 0 ? chapter.title : `${chapter.title} - ${index + 1}`,
        content: part.trim(),
        status: index === 0 ? "editing" : "pending",
        order: chapter.order + index * 0.1, // Maintain relative order
      }));
    },
    [],
  );

  const mergeChapters = useCallback(
    (chapter1: Chapter, chapter2: Chapter): Chapter => {
      return {
        ...chapter1,
        content: `${chapter1.content}\n\n${chapter2.content}`,
        title: chapter1.title, // Keep first chapter's title
      };
    },
    [],
  );

  return {
    parseChapters,
    splitChapter,
    mergeChapters,
  };
};
