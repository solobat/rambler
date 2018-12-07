
export function readFile(file: File) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function(event) {
            resolve(event.target.result);
        };

        reader.onerror = function(event) {
            reject(`File could not be read! Code ${event.target.error.code}`);
        };

        reader.readAsText(file);
    })
}


const chapterReg = /(第.*章)|(chapter)/i;

function notEmpty(str) {
    if (str === '\n' || str === '\r\n' || str.trim() === '') {
        return false;
    } else {
        return true;
    }
}

export function sliceFileToParagraphs(file: File): Promise<string[]> {
    return readFile(file).then((resp: string) => {
        if (resp) {
            const list = resp.split('\n').filter(item => notEmpty(item) && !item.match(chapterReg));

            return list;
        } else {
            return [];
        }
    });
}