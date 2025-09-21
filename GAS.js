function doGet(e) { 
Logger.log( JSON.stringify(e) );
var result = 'Ok';
if (e.parameter == 'undefined') {
result = 'No Parameters';
}
else {
var sheet_id = '1VsjGi5JTW9DNh6je2eubWJb0R_toq4KLyYKxOowoIgA'; // Spreadsheet ID
var sheet = SpreadsheetApp.openById(sheet_id).getActiveSheet();
var newRow = sheet.getLastRow() + 1; 
var rowData = [];
var Curr_Date = new Date();
rowData[0] = Curr_Date; // Date in column A
var Curr_Time = Utilities.formatDate(Curr_Date, "Asia/Bangkok", 'HH:mm:ss');
rowData[1] = Curr_Time; // Time in column B
for (var param in e.parameter) {
Logger.log('In for loop, param=' + param);
var value = stripQuotes(e.parameter[param]);
Logger.log(param + ':' + e.parameter[param]);
switch (param) {

case 'Volt':
rowData[2] = value; 
result = 'OK'; 
break;

case 'Current':
rowData[3] = value; 
result += ', OK'; 
break; 

case 'Power':
rowData[4] = value; 
result += ', OK'; 
break; 

case 'Energy':
rowData[5] = value; 
result += ', OK'; 
break;

case 'KWhPerDay':
rowData[6] = value; 
result += ', OK'; 
break;
  
default:
result = "unsupported parameter";
}
}
Logger.log(JSON.stringify(rowData));
var newRange = sheet.getRange(newRow, 1, 1, rowData.length);
newRange.setValues([rowData]);
}
return ContentService.createTextOutput(result);
}
function stripQuotes( value ) {
return value.replace(/^["']|['"]$/g, "");
}

//ChatGPT
//function doGet(e) {
 // var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  //var Volt = e.parameter.Volt;
  //var Current = e.parameter.Current;
  //var Power = e.parameter.Power;
  //var Pf = e.parameter.Pf;
  //var Energy = e.parameter.Energy;
  //var DailyEnergy = e.parameter.DailyEnergy;  // << เพิ่มตัวนี้

  //sheet.appendRow([new Date(), Volt, Current, Power, Pf, Energy, DailyEnergy]);
  //return ContentService.createTextOutput("OK");
//}


