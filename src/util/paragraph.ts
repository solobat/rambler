import { readFile } from "./file";

const chapterReg =
  /^(第.*?[章节]|chapter|\d+\.|\d+、|\d+\s+|第.*?部分|part|section|卷|篇).*$/i;
const contentStartReg = /^(目录|序|前言|引言|contents)/i;
const authorReg = /^作者|译者|著|译/;

function notEmpty(str: string): boolean {
  return str.trim() !== "";
}

function isLikelyChapterTitle(line: string): boolean {
  if (line.length > 30) {
    return false;
  }

  if (line.includes("章") || line.includes("节") || line.includes("篇")) {
    return true;
  }

  if (/^\d+/.test(line)) {
    return true;
  }

  return false;
}

export interface ParagraphData {
  type: "chapter" | "content" | "author" | "preContent";
  text: string;
}

export async function sliceFileToParagraphs(
  file: File
): Promise<ParagraphData[]> {
  const text = await readFile(file);

  if (!text) {
    return [];
  }

  const lines = text.split("\n").filter(notEmpty);
  const result = await complexSlicing(lines);

  if (result.length < lines.length * 0.5) {
    return simpleSlicing(lines);
  }

  return result;
}

async function complexSlicing(lines: string[]): Promise<ParagraphData[]> {
  const result: ParagraphData[] = [];
  let section: "preContent" | "contents" | "mainContent" = "preContent";
  let currentChapter = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (section === "preContent") {
      if (contentStartReg.test(line)) {
        section = "contents";
      } else if (authorReg.test(line)) {
        result.push({ type: "author", text: line });
      } else {
        result.push({ type: "preContent", text: line });
      }
    } else if (section === "contents") {
      if (chapterReg.test(line) || isLikelyChapterTitle(line)) {
        section = "mainContent";
        currentChapter = line;
      }
    } else if (section === "mainContent") {
      if (chapterReg.test(line) || isLikelyChapterTitle(line)) {
        if (currentChapter) {
          result.push({ type: "chapter", text: currentChapter });
        }
        currentChapter = line;
      } else {
        if (currentChapter) {
          result.push({ type: "chapter", text: currentChapter });
          currentChapter = "";
        }
        result.push({ type: "content", text: line });
      }
    }
  }

  if (currentChapter) {
    result.push({ type: "chapter", text: currentChapter });
  }

  return processConsecutiveChapters(result);
}

function processConsecutiveChapters(result: ParagraphData[]): ParagraphData[] {
  let consecutiveChapters = 0;
  let chapterStartIndex = -1;

  for (let i = 0; i < result.length; i++) {
    if (result[i].type === "chapter") {
      if (consecutiveChapters === 0) {
        chapterStartIndex = i;
      }
      consecutiveChapters++;
    } else {
      if (consecutiveChapters > 0 && consecutiveChapters <= 2) {
        consecutiveChapters = 0;
        chapterStartIndex = -1;
      } else if (consecutiveChapters >= 3) {
        for (let j = chapterStartIndex; j < i; j++) {
          result[j].type = "content";
        }
      }
      consecutiveChapters = 0;
      chapterStartIndex = -1;
    }
  }

  if (consecutiveChapters >= 3) {
    for (let j = chapterStartIndex; j < result.length; j++) {
      result[j].type = "content";
    }
  }

  return result;
}

function simpleSlicing(lines: string[]): ParagraphData[] {
  return lines.map(line => {
    if (chapterReg.test(line) || isLikelyChapterTitle(line)) {
      return { type: "chapter", text: line };
    } else if (authorReg.test(line)) {
      return { type: "author", text: line };
    } else {
      return { type: "content", text: line };
    }
  });
}
