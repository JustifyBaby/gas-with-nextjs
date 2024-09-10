const fs = require("node:fs");

const FILE_PATH = "./build/server/src/api.js";

const removeImport = (data = [""]) => {
  let trimmed = "";
  let startImportIndex = 0;
  let endImportIndex = 0;
  for (const index in data) {
    const ni = Number(index);
    const datum = data[ni];
    if (datum.includes("import")) {
      startImportIndex = ni;
      endImportIndex = data.findIndex((code) => code.includes("}"));
    }

    if (startImportIndex <= ni && ni <= endImportIndex) {
      continue;
    }

    trimmed += datum + "\n";
  }

  return trimmed;
};

fs.readFile(FILE_PATH, (err, buffer) => {
  try {
    if (err) throw new Error(JSON.stringify(err));
    const data = buffer.toString("utf-8").split("\n");
    console.log("Writing...");

    const trimmedData = removeImport(data);

    fs.writeFile(
      FILE_PATH,
      trimmedData,
      {
        encoding: "utf-8",
      },
      (err) => {
        if (err) throw new Error(err);
      }
    );
  } catch (err) {
    console.error(err);
  }
});
