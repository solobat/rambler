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

export async function readFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const encoding = await checkEncoding(buffer);
  const decoder = new TextDecoder(encoding);
  return decoder.decode(buffer);
}

export function getFileShortName(name: string): string {
  const arr = name.split(".");
  arr.pop();
  return arr.join(".");
}
