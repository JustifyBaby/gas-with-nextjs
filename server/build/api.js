"use strict";
/** types */
const properties = [
    "商品名",
    "単価",
    "在庫数",
    "売れた個数",
    "売り上げ",
];
/** get data */
const root = SpreadsheetApp.getActiveSpreadsheet();
const SHEET_NAME = "在庫";
const getSheetDataAll = (sheetName) => root
    .getSheetByName(sheetName)
    .getDataRange()
    .getValues()
    .map((values) => values.filter((value) => value !== ""));
const sheetDataToMaps = (sheetName) => {
    const allData = getSheetDataAll(sheetName);
    const labels = allData.shift();
    let mapList = [];
    for (const data of allData) {
        const map = {};
        labels?.forEach((label, index) => {
            map[label] = data[index];
        });
        mapList = [...mapList, map];
    }
    return mapList;
};
const toResponse = (data) => {
    const response = ContentService.createTextOutput();
    response.setMimeType(ContentService.MimeType.JSON);
    response.setContent(JSON.stringify(data));
    return response;
};
const mapToArrays = (maps) => {
    let values = [];
    maps.forEach((data) => {
        let rows = [];
        Object.keys(data).forEach((key) => {
            rows.push(data[key]);
        });
        values.push(rows);
    });
    return values;
};
const sheetValByRes = (prevData, response) => {
    const afterData = prevData.map((datum) => {
        const resKey = datum["商品名"];
        const boughtAmount = parseInt(String(response[resKey]));
        if (boughtAmount && boughtAmount > 0) {
            datum["在庫数"] = String(parseInt(datum["在庫数"]) - boughtAmount);
            datum["売れた個数"] = String(datum["売れた個数"] + boughtAmount);
            datum["売り上げ"] = String(parseInt(datum["売り上げ"]) + boughtAmount * parseInt(datum["単価"]));
        }
        return datum;
    });
    const values = mapToArrays(afterData);
    return values;
};
/** HTTPメソッド (main) */
const doGet = (e) => {
    const existGoodsList = sheetDataToMaps(SHEET_NAME).filter((container) => parseInt(container["在庫数"]) > 0);
    return toResponse(existGoodsList);
};
const printLog = (log) => {
    const logger = root.getSheetByName("Logging");
    logger?.getRange(logger.getLastRow() + 1, 1).setValue(JSON.stringify(log));
};
const doPost = (e) => {
    const parsedContents = JSON.parse(e.postData.contents);
    Logger.log(parsedContents);
    const sheet = root.getSheetByName(SHEET_NAME);
    const last = { row: sheet.getLastRow(), col: sheet.getLastColumn() };
    const prevData = sheetDataToMaps(SHEET_NAME);
    const labels = [...properties];
    printLog(parsedContents);
    sheet.getRange(1, 2, 1, properties.length).setValues([labels]);
    const currentData = sheetValByRes(prevData, parsedContents);
    sheet.getRange(2, 2, last.row - 1, last.col - 1).setValues(currentData);
};
const debug = () => {
    const allDataMap = sheetDataToMaps(SHEET_NAME);
    const dataList = sheetValByRes(allDataMap, {
        水: 0,
        お茶: 2,
        お弁当箱: 0,
        ナイフ: 0,
        フォーク: 0,
    });
    console.log(allDataMap);
    console.log(dataList);
    doPost({
        postData: {
            contents: JSON.stringify({
                水: 0,
                お茶: 2,
                お弁当箱: 0,
                ナイフ: 0,
                フォーク: 0,
            }),
        },
    });
};
