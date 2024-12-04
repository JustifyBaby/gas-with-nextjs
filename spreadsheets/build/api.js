"use strict";
/** types */
const properties = [
    "product_name",
    "price",
    "stock",
    "sold",
    "sold_prices",
];
/** get data */
const root = SpreadsheetApp.getActiveSpreadsheet();
const SHEET_NAME = "Stock";
const getSheetDataAll = (sheetName, margin = { row: 1, col: 1 }) => {
    const sheet = root.getSheetByName(sheetName);
    const last = { row: sheet.getLastRow(), col: sheet.getLastColumn() };
    return sheet.getRange(margin.row, margin.col, last.row, last.col).getValues();
};
// Sheet to object
const sheetDataToMaps = (sheetName) => {
    const allData = getSheetDataAll(sheetName);
    const labels = allData.shift();
    let mapList = [];
    for (const data of allData) {
        const map = {
            product_name: null,
            price: null,
            stock: null,
            sold: null,
            sold_prices: null,
        };
        labels?.forEach((label, index) => {
            if (Object.keys(map).includes(label))
                map[label] = data[index];
        });
        mapList.push(map);
    }
    return mapList;
};
const toResponse = (data) => {
    const response = ContentService.createTextOutput();
    response.setMimeType(ContentService.MimeType.JSON);
    let hashes = [];
    for (const map of data) {
        hashes.push(map);
    }
    response.setContent(JSON.stringify(hashes));
    return response;
};
const mapToArrays = (maps) => {
    let values = [];
    maps.forEach((data) => {
        let rows = [];
        const keys = Object.keys(data);
        keys.forEach((key) => {
            rows.push(data[key]);
        });
        values.push(rows);
    });
    return values;
};
const sheetValByRes = (prevData, response) => {
    const afterData = prevData.map((datum) => {
        const resKey = datum["sold"];
        const boughtAmount = parseInt(String(response[resKey]));
        if (boughtAmount && boughtAmount > 0) {
            datum["stock"] = String(parseInt(datum["stock"]) - boughtAmount);
            datum["sold_prices"] = String(datum["sold"] + boughtAmount);
            datum["sold_prices"] = String(parseInt(datum["sold_prices"]) +
                boughtAmount * parseInt(datum["price"]));
        }
        return datum;
    });
    const values = mapToArrays(afterData);
    return values;
};
/** HTTPメソッド (main) */
const doGet = (e) => {
    const sheetMaps = sheetDataToMaps(SHEET_NAME);
    const existGoodsList = sheetMaps.filter((container) => parseInt(container["stock"]) > 0);
    return toResponse(existGoodsList);
};
const doPost = (e) => {
    const parsedContents = JSON.parse(e.postData.contents);
    const sheet = root.getSheetByName(SHEET_NAME);
    const last = { row: sheet.getLastRow(), col: sheet.getLastColumn() };
    const prevData = sheetDataToMaps(SHEET_NAME);
    const labels = [...properties];
    sheet.getRange(1, 2, 1, properties.length).setValues([labels]);
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
    const dataList = sheetValByRes(allDataMap, demoData);
    console.log(allDataMap);
    console.log(dataList);
};
