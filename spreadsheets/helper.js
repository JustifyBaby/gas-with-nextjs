const fs = require("node:fs");
const BASE_PATH = "./src/",
  TYPE_PATH = "../client/src/types/types.ts",
  DIRECTIVE = { start: "/** schema */\r", end: "/** end schema */\r" };

const intoDirFilesAll = fs.readdirSync(BASE_PATH);
const paths = intoDirFilesAll.filter((path) => path.split(".").at(-1) === "ts");

for (const path of paths) {
  const file = fs.readFileSync(BASE_PATH + path);
  const contents = file.toString("utf-8").split("\n");

  const startSchema = contents.findIndex((c) => c === DIRECTIVE.start);
  const endSchema = contents.findIndex((c) => c === DIRECTIVE.end);

  const schema = contents.slice(startSchema, endSchema + 1);
  const includeNameIndex = schema.findIndex((c) => c.includes("const "));
  if (includeNameIndex === -1) return;

  schema.forEach((row, index) => {
    if (index === 0 || index === schema.length - 1) {
      row = row.replace(",", "");
    } else if (
      row.includes("const ") ||
      row.includes("type ") ||
      row.includes("interface ")
    ) {
      row = "export " + row;
    }
    fs.appendFileSync(TYPE_PATH, "\n" + row);
  });

  const types = fs.readFileSync(TYPE_PATH, { encoding: "utf-8" }).split("\n");

  const prevSchemaIndex = {
    start: types.findIndex((c) => c === DIRECTIVE.start),
    end: types.findIndex((c) => c === DIRECTIVE.end),
  };

  const typename = (includeNameIndex, schema[includeNameIndex].split(" ")[1]);

  fs.appendFileSync(
    TYPE_PATH,
    "\n" + `export type SheetLabel = (typeof ${typename})[number]`
  );

  console.log("OK");
}
