"use client";

import { useState, useCallback } from "react";

import { useChapterParser } from "./use-chapter-parser";

import { NovelProject } from "@/types";

export const useNovelEditor = () => {
  const [project, setProject] = useState<NovelProject | null>(null);
  const [currentChapterId, setCurrentChapterId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { parseChapters, splitChapter, mergeChapters } = useChapterParser();

  const importFile = useCallback(
    async (content: string, filename: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const chapters = parseChapters(content, filename);

        if (chapters.length === 0) {
          throw new Error("No chapters found in the file");
        }

        const newProject: NovelProject = {
          id: `project-${Date.now()}`,
          title: filename.replace(".txt", ""),
          chapters,
          currentChapterId: chapters[0].id,
          lastModified: new Date(),
        };

        setProject(newProject);
        // Ensure we select the first chapter and mark it as editing
        setCurrentChapterId(chapters[0].id);

        // Update the first chapter status to editing
        setTimeout(() => {
          setProject((prev) => {
            if (!prev) return prev;

            return {
              ...prev,
              chapters: prev.chapters.map((chapter, index) => ({
                ...chapter,
                status: index === 0 ? "editing" : "pending",
              })),
            };
          });
        }, 0);
      } catch (err) {
        setError(
          "Failed to parse the file. Please check the format and try again.",
        );
        console.error("File import error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [parseChapters],
  );

  const selectChapter = useCallback(
    (chapterId: string) => {
      setCurrentChapterId(chapterId);

      // Update chapter status to editing
      if (project) {
        setProject((prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            chapters: prev.chapters.map((chapter) => ({
              ...chapter,
              status:
                chapter.id === chapterId
                  ? "editing"
                  : chapter.status === "editing"
                    ? "pending"
                    : chapter.status,
            })),
            currentChapterId: chapterId,
            lastModified: new Date(),
          };
        });
      }
    },
    [project],
  );

  const updateChapterContent = useCallback(
    (chapterId: string, content: string) => {
      setProject((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          chapters: prev.chapters.map((chapter) =>
            chapter.id === chapterId ? { ...chapter, content } : chapter,
          ),
          lastModified: new Date(),
        };
      });
    },
    [],
  );

  const insertSplitMarker = useCallback(() => {
    // This is handled in the TextEditor component
    console.log("Split marker inserted");
  }, []);

  const splitCurrentChapter = useCallback(() => {
    if (!project || !currentChapterId) return;

    const currentChapter = project.chapters.find(
      (c) => c.id === currentChapterId,
    );

    if (!currentChapter) return;

    const splitChapters = splitChapter(currentChapter);

    if (splitChapters.length > 1) {
      setProject((prev) => {
        if (!prev) return prev;

        const otherChapters = prev.chapters.filter(
          (c) => c.id !== currentChapterId,
        );
        
        const updatedChapters = [
          ...otherChapters.filter((c) => c.order < currentChapter.order),
          ...splitChapters,
          ...otherChapters.filter((c) => c.order > currentChapter.order),
        ].sort((a, b) => a.order - b.order);

        return {
          ...prev,
          chapters: updatedChapters,
          lastModified: new Date(),
        };
      });

      // Select the first split chapter
      setCurrentChapterId(splitChapters[0].id);
    }
  }, [project, currentChapterId, splitChapter]);

  const mergeWithNextChapter = useCallback(
    (chapterId?: string) => {
      if (!project) return;

      const targetChapterId = chapterId || currentChapterId;

      if (!targetChapterId) return;

      const currentIndex = project.chapters.findIndex(
        (c) => c.id === targetChapterId,
      );
      const currentChapter = project.chapters[currentIndex];
      const nextChapter = project.chapters[currentIndex + 1];

      if (!currentChapter || !nextChapter) return;

      const mergedChapter = mergeChapters(currentChapter, nextChapter);

      setProject((prev) => {
        if (!prev) return prev;

        const updatedChapters = prev.chapters.filter(
          (c) => c.id !== nextChapter.id,
        );
        const chapterIndex = updatedChapters.findIndex(
          (c) => c.id === targetChapterId,
        );

        updatedChapters[chapterIndex] = mergedChapter;

        return {
          ...prev,
          chapters: updatedChapters,
          lastModified: new Date(),
        };
      });

      // If we merged the current chapter, keep it selected
      if (targetChapterId === currentChapterId) {
        setCurrentChapterId(mergedChapter.id);
      }
    },
    [project, currentChapterId, mergeChapters],
  );

  const deleteChapter = useCallback(
    (chapterId: string) => {
      if (!project) return;

      // Don't allow deleting if it's the last chapter
      if (project.chapters.length <= 1) {
        setError("Cannot delete the last remaining chapter.");
        setTimeout(() => setError(null), 3000); // Auto clear error after 3 seconds

        return;
      }

      setProject((prev) => {
        if (!prev) return prev;

        const updatedChapters = prev.chapters.filter((c) => c.id !== chapterId);

        return {
          ...prev,
          chapters: updatedChapters,
          lastModified: new Date(),
        };
      });

      // If we deleted the current chapter, select another one
      if (chapterId === currentChapterId) {
        const remainingChapters = project.chapters.filter(
          (c) => c.id !== chapterId,
        );

        setCurrentChapterId(remainingChapters[0]?.id || null);
      }
    },
    [project, currentChapterId],
  );

  const getCurrentChapter = useCallback(() => {
    if (!project || !currentChapterId) return null;

    return project.chapters.find((c) => c.id === currentChapterId) || null;
  }, [project, currentChapterId]);

  const canMergeWithNext = useCallback(() => {
    if (!project || !currentChapterId) return false;
    const currentIndex = project.chapters.findIndex(
      (c) => c.id === currentChapterId,
    );

    return currentIndex < project.chapters.length - 1;
  }, [project, currentChapterId]);

  const exportProject = useCallback(() => {
    if (!project) return null;

    const exportContent = project.chapters
      .sort((a, b) => a.order - b.order)
      .map((chapter) => `${chapter.title}\n\n${chapter.content}`)
      .join("\n\n\n");

    return {
      content: exportContent,
      filename: `${project.title}_edited.txt`,
    };
  }, [project]);

  return {
    // State
    project,
    currentChapterId,
    isLoading,
    error,

    // Actions
    importFile,
    selectChapter,
    updateChapterContent,
    insertSplitMarker,
    splitCurrentChapter,
    mergeWithNextChapter,
    deleteChapter,
    exportProject,

    // Computed
    getCurrentChapter,
    canMergeWithNext,
  };
};
