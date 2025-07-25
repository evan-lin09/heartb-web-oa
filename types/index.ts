import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface Chapter {
  id: string;
  title: string;
  content: string;
  status: "pending" | "editing" | "completed";
  order: number;
}

export interface ChapterSplit {
  position: number;
  marker: string;
}

export interface NovelProject {
  id: string;
  title: string;
  chapters: Chapter[];
  currentChapterId?: string;
  lastModified: Date;
}

export interface EditorState {
  selectedChapterId: string | null;
  splitMarkers: ChapterSplit[];
  isLoading: boolean;
  error?: string;
}
