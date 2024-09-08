"use strict";
/** get data */
const root = SpreadsheetApp.getActiveSpreadsheet();
const allData = (sheetName) => root
    .getSheetByName(sheetName)
    .getDataRange()
    .getValues()
    .map((values) => values.filter((value) => value !== ""));
const sheetDataToMap = (sheetName) => {
    const sheet = root.getSheetByName(sheetName);
    const allData = sheet
        .getDataRange()
        .getValues()
        .map((values) => values.filter((value) => value !== ""));
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
/** HTTPメソッド (main) */
const doGet = (e) => {
    const existGoodsList = sheetDataToMap("在庫").filter((container) => parseInt(container["在庫数"]) > 0);
    return toResponse(existGoodsList);
};
const doPost = (e) => {
    const { contents } = e.postData;
    const { getLastRow, getLastColumn, getRange } = root.getSheetByName("在庫");
    const last = { row: getLastRow(), col: getLastColumn() };
    const currentStock = sheetDataToMap("在庫");
    // currentStock.map((stock) => stock[contents[""]])
    // getRange(`B${last.row}:D${last.row}`).setValues();
};
const debug = () => {
    console.log(sheetDataToMap("在庫"));
};
