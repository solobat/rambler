import { TextDecoder } from "text-encoding";

export function readFileText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (event) {
      resolve(event.target.result as string);
    };

    reader.onerror = function (event) {
      reject(`无法读取文件: ${event.target.error.code}`);
    };

    reader.readAsText(file);
  });
}

function readFileAsBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();

    reader.addEventListener("loadend", (e) => {
      resolve(e.target.result as ArrayBuffer);
    });
    reader.addEventListener("error", reject);

    reader.readAsArrayBuffer(file);
  });
}

async function getAsByteArray(file: File) {
  return new Uint8Array(await readFileAsBuffer(file));
}

async function checkEncoding(buffer: ArrayBuffer): Promise<string> {
  const uint8Array = new Uint8Array(buffer);

  if (
    uint8Array[0] === 0xef &&
    uint8Array[1] === 0xbb &&
    uint8Array[2] === 0xbf
  ) {
    return "UTF-8";
  }

  const gbkDecoder = new TextDecoder("gbk", { fatal: true });
  try {
    gbkDecoder.decode(uint8Array);
    return "GBK";
  } catch (e) {}

  const iso88591Decoder = new TextDecoder("iso-8859-1", { fatal: true });
  try {
    const text = iso88591Decoder.decode(uint8Array);
    if (/^[\x00-\xFF]*$/.test(text)) {
      return "ISO-8859-1";
    }
  } catch (e) {}

  return "UTF-8";
}

const chapterReg = /^(第.*?[章节]|chapter|\d+\.|\d+、|\d+\s+).*$/i;
const contentStartReg = /^(目录|序|前言|引言|contents)/i;
const authorReg = /^作者|译者|著|译/;

function notEmpty(str: string): boolean {
  return str.trim() !== "";
}

async function readFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const encoding = await checkEncoding(buffer);
  const decoder = new TextDecoder(encoding);
  return decoder.decode(buffer);
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

  return result;
}

export function getFileShortName(name: string): string {
  const arr = name.split(".");
  arr.pop();
  return arr.join(".");
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
