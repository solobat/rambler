import { TextDecoder } from "text-encoding";

export function readFileText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (event) {
      resolve(event.target.result as string);
    };

    reader.onerror = function (event) {
      reject(`File could not be read! Code ${event.target.error.code}`);
    };

    reader.readAsText(file);
  });
}

function readFileAsBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();

    reader.addEventListener("loadend", (e) =>
      resolve(e.target.result as ArrayBuffer)
    );
    reader.addEventListener("error", reject);

    reader.readAsArrayBuffer(file);
  });
}

async function getAsByteArray(file: File) {
  return new Uint8Array(await readFileAsBuffer(file));
}

async function checkGBK(file: File) {
  const text = await file.text();

  return text.indexOf("ï¿?") !== -1;
}

const chapterReg = /(ç¬?.*ç«?)|(chapter)/i;

function notEmpty(str) {
  if (str === "\n" || str === "\r\n" || str.trim() === "") {
    return false;
  } else {
    return true;
  }
}

async function readFile(file: File) {
  const isGBK = await checkGBK(file);
  let text: string;
  if (isGBK) {
    const byteArray = await getAsByteArray(file);
    const decoder = new TextDecoder("gb2312");
    text = decoder.decode(byteArray);
  } else {
    text = await readFileText(file);
  }

  return text;
}

export async function sliceFileToParagraphs(file: File): Promise<string[]> {
  return readFile(file).then((resp: string) => {
    if (resp) {
      const list = resp
        .split("\n")
        .filter((item) => notEmpty(item) && !item.match(chapterReg));

      return list;
    } else {
      return [];
    }
  });
}

export function getFileShortName(name: string) {
  const arr = name.split('.')
  arr.pop();

  return arr.join('.')
}