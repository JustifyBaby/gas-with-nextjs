/** schema */
const schema = [
  "product_name",
  "price",
  "stock",
  "sold",
  "sold_prices",
] as const;
/** end schema */

type SheetLabel = (typeof schema)[number];

type HashMap<V = string> = { [key: string]: V };

type SheetMap = Pick<HashMap<string | null>, SheetLabel>;

/** get data */
const root = SpreadsheetApp.getActiveSpreadsheet();

const SHEET_NAME = "Stock";

const getSheetDataAll = (
  sheetName: string,
  margin = { row: 1, col: 1 }
): string[][] => {
  const sheet = root.getSheetByName(sheetName)!;
  const last = { row: sheet.getLastRow(), col: sheet.getLastColumn() };
  return sheet.getRange(margin.row, margin.col, last.row, last.col).getValues();
};

// Sheet to object
const sheetDataToMaps = (sheetName: string): SheetMap[] => {
  const allData = getSheetDataAll(sheetName);

  const labels = allData.shift() as unknown as typeof schema;

  let mapList: SheetMap[] = [];

  for (const data of allData) {
    const map: SheetMap = {
      product_name: null,
      price: null,
      stock: null,
      sold: null,
      sold_prices: null,
    };

    labels?.forEach((label, index) => {
      if (Object.keys(map).includes(label)) map[label] = data[index];
    });
    mapList.push(map);
  }

  return mapList;
};

const toResponse = <T>(data: T[]) => {
  const response = ContentService.createTextOutput();
  response.setMimeType(ContentService.MimeType.JSON);

  let hashes = [];
  for (const map of data) {
    hashes.push(map);
  }

  response.setContent(JSON.stringify(hashes));
  return response;
};

const mapToArrays = (maps: SheetMap[]) => {
  let values: string[][] = [];
  maps.forEach((data) => {
    let rows: string[] = [];
    const keys = Object.keys(data) as unknown as typeof schema;
    keys.forEach((key) => {
      rows.push(data[key]!);
    });

    values.push(rows);
  });

  return values;
};

const sheetValByRes = <T = string>(
  prevData: SheetMap[],
  response: HashMap<T>
): string[][] => {
  const afterData = prevData.map((datum) => {
    const resKey = datum["sold"]!;
    const boughtAmount = parseInt(String(response[resKey]));

    if (boughtAmount && boughtAmount > 0) {
      datum["stock"] = String(parseInt(datum["stock"]!) - boughtAmount);
      datum["sold_prices"] = String(datum["sold"]! + boughtAmount);
      datum["sold_prices"] = String(
        parseInt(datum["sold_prices"]) +
          boughtAmount * parseInt(datum["price"]!)
      );
    }

    return datum;
  });

  const values = mapToArrays(afterData);

  return values;
};

/** HTTPメソッド (main) */
const doGet = (e: GoogleAppsScript.Events.DoGet) => {
  const sheetMaps = sheetDataToMaps(SHEET_NAME);
  const existGoodsList = sheetMaps.filter(
    (container) => parseInt(container["stock"]!) > 0
  );

  return toResponse(existGoodsList);
};

const doPost = (e: GoogleAppsScript.Events.DoPost) => {
  const parsedContents: HashMap = JSON.parse(e.postData.contents);

  const sheet = root.getSheetByName(SHEET_NAME)!;
  const last = { row: sheet.getLastRow(), col: sheet.getLastColumn() };

  const prevData = sheetDataToMaps(SHEET_NAME);

  const labels = [...schema];

  sheet.getRange(1, 2, 1, schema.length).setValues([labels]);

  const currentData = sheetValByRes(prevData, parsedContents);

  sheet.getRange(2, 2, last.row - 1, last.col - 1).setValues(currentData);
};

const debug = () => {
  const allDataMap = sheetDataToMaps(SHEET_NAME);
  const demoData = {
    水: 0,
    お茶: 2,
    お弁当箱: 0,
    ナイフ: 0,
    フォーク: 0,
  };

  const dataList = sheetValByRes<number>(allDataMap, demoData);

  console.log(allDataMap);
  console.log(dataList);
};
