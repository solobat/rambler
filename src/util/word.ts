let db;

async function getDB() {
  if (db) {
    return db;
  } else {
    await createDB();

    return db;
  }
}

function createDB() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open("dicts_db", 1);

    request.onupgradeneeded = function (event: any) {
      db = event.target.result;
      let objectStore;

      if (!db.objectStoreNames.contains("word")) {
        objectStore = db.createObjectStore("word", { autoIncrement: true });
        objectStore.createIndex("name", "name", { unique: true });
        objectStore.createIndex("info", "info", { unique: false });
      }

      event.target.transaction.oncomplete = () => {
        resolve(true);
      };
    };

    request.onsuccess = function (event: any) {
      if (!db) {
        db = event.target.result;
        resolve(true);
      }
    };

    request.onerror = function (event) {
      console.log("create db failed...", event);
      reject();
    };
  });
}

export async function addWord(word: string, info: string) {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const request = db
      .transaction(["word"], "readwrite")
      .objectStore("word")
      .add({ name: word, info });

    request.onsuccess = function (event) {
      resolve(true);
    };

    request.onerror = function (event) {
      console.log("add word failed...", event);
      reject("failed..");
    };
  });
}
