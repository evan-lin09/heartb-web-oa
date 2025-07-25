"use client";

import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  ScrollShadow,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Button,
  Divider,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";

import { Chapter } from "@/types";

interface ChapterListProps {
  chapters: Chapter[];
  currentChapterId?: string;
  onChapterSelect: (chapterId: string) => void;
  onCombineWithNext?: (chapterId: string) => void;
  onDeleteChapter?: (chapterId: string) => void;
}

export const ChapterList: React.FC<ChapterListProps> = ({
  chapters,
  currentChapterId,
  onChapterSelect,
  onCombineWithNext,
  onDeleteChapter,
}) => {
  const getStatusText = (status: Chapter["status"]) => {
    switch (status) {
      case "editing":
        return "Editing";
      case "completed":
        return "Completed";
      default:
        return "Pending";
    }
  };

  const canCombineWithNext = (chapterIndex: number) => {
    return chapterIndex < chapters.length - 1;
  };

  const handleMenuAction = (key: string, chapterId: string) => {
    switch (key) {
      case "combine":
        onCombineWithNext?.(chapterId);
        break;
      case "delete":
        onDeleteChapter?.(chapterId);
        break;
    }
  };

  const handleCardClick = (chapterId: string, e: React.MouseEvent) => {
    // Check if the click came from the dropdown trigger or any of its children
    const target = e.target as HTMLElement;

    if (target.closest("[data-dropdown-trigger]")) {
      return; // Don't select chapter if clicking on dropdown
    }
    onChapterSelect(chapterId);
  };

  const handleKeyDown = (chapterId: string, e: React.KeyboardEvent) => {
    // Handle Enter and Space key presses
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onChapterSelect(chapterId);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <header className="flex items-center text-lg font-medium text-default-700 mb-4">
        <Icon
          className="text-default-500 mr-2"
          icon="solar:clipboard-text-outline"
          width={24}
        />
        Chapters
      </header>

      <ScrollShadow className="flex-1 -mr-4 pr-4">
        <div className="flex flex-col gap-3">
          {chapters.map((chapter, index) => (
            <div
              key={chapter.id}
              aria-label={`Select chapter: ${chapter.title}`}
              className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
              role="button"
              tabIndex={0}
              onClick={(e) => handleCardClick(chapter.id, e)}
              onKeyDown={(e) => handleKeyDown(chapter.id, e)}
            >
              <Card
                className={`border-1 border-divider/15 ${
                  currentChapterId === chapter.id
                    ? "bg-primary/20 border-primary/30"
                    : "hover:bg-default-50"
                }`}
                shadow="none"
              >
                <CardHeader className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {chapter.status === "editing" && (
                      <Chip
                        className="text-primary bg-primary/20"
                        radius="sm"
                        size="sm"
                        variant="flat"
                      >
                        {getStatusText(chapter.status)}
                      </Chip>
                    )}
                    <p className="text-sm font-medium truncate">
                      {chapter.title}
                    </p>
                  </div>

                  <div data-dropdown-trigger>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          isIconOnly
                          className="min-w-6 w-6 h-6"
                          size="sm"
                          variant="light"
                        >
                          <Icon
                            className="text-default-400"
                            icon="solar:menu-dots-bold"
                            width={16}
                          />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label="Chapter actions"
                        onAction={(key) =>
                          handleMenuAction(key as string, chapter.id)
                        }
                      >
                        {canCombineWithNext(index) ? (
                          <>
                            <DropdownSection showDivider title="Action">
                              <DropdownItem
                                key="combine"
                                startContent={
                                  <Icon
                                    icon="iconoir:vertical-merge"
                                    width={16}
                                  />
                                }
                                textValue="Combine with next chapter"
                              >
                                <div>
                                  <p>Combine with next chapter</p>
                                  <p className="text-xs text-default-400">
                                    Combine this chapter with the next one
                                  </p>
                                </div>
                              </DropdownItem>
                            </DropdownSection>
                            <DropdownSection title="Danger Zone">
                              <DropdownItem
                                key="delete"
                                className="text-danger"
                                color="danger"
                                startContent={
                                  <Icon
                                    icon="solar:trash-bin-minimalistic-bold"
                                    width={16}
                                  />
                                }
                                textValue="Delete this chapter"
                              >
                                Delete this chapter
                              </DropdownItem>
                            </DropdownSection>
                          </>
                        ) : (
                          <DropdownSection title="Danger Zone">
                            <DropdownItem
                              key="delete"
                              className="text-danger"
                              color="danger"
                              startContent={
                                <Icon
                                  icon="solar:trash-bin-minimalistic-bold"
                                  width={16}
                                />
                              }
                              textValue="Delete this chapter"
                            >
                              Delete this chapter
                            </DropdownItem>
                          </DropdownSection>
                        )}
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </CardHeader>

                {/* Divider between header and body */}
                <Divider />

                <CardBody className="pt-3">
                  <p className="line-clamp-2 text-xs text-default-600">
                    {chapter.brief}
                  </p>
                </CardBody>
              </Card>
            </div>
          ))}
        </div>
      </ScrollShadow>
    </div>
  );
};
