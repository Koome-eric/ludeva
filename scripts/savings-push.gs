/**
 * Savings Account — Excel/Sheets → database push script.
 *
 * Companion to the existing MMF/Investments push script, run against a
 * separate "Savings Data" tab in the same workbook, using a
 * running-balance formula instead of the per-transaction MMF formula:
 * each entry carries the previous closing balance forward, adds a
 * deposit, subtracts a withdrawal, then applies interest to the
 * running balance.
 *
 * SETUP
 * 1. In the workbook, add a "Savings Data" tab with a header row (row 4,
 *    matching the existing sheet's convention of a couple of instruction
 *    rows above the header) containing at least:
 *      memberEmail, accountNo, memberName, date, openingBalance, deposit,
 *      withdrawal, monthlyRate, interestEarned, closingBalance,
 *      periodLabel, notes, memberPhone, _pushStatus, _pushedAt
 *
 *    memberPhone is a second identifier: a row needs an email OR a phone
 *    number. The app matches by email first and falls back to phone, so
 *    a member who signed up by phone only (or whose email on the sheet
 *    is missing/mistyped) is still found.
 * 2. Add a "Push Log" tab for the success/failure log.
 * 3. File > Project properties > Script properties, set:
 *      SAVINGS_API_URL = https://<your-app-domain>/api/savings
 *      SAVINGS_API_KEY = <same value as the app's SHEETS_API_SECRET /
 *                          SAVINGS_SHEETS_API_SECRET env var>
 * 4. Run pushSavingsRows() manually, or wrap it in a time-driven trigger
 *    (Triggers > Add Trigger) to sync automatically.
 *
 * Re-pushing a row is safe: the API upserts on memberEmail + date +
 * accountNo (or memberPhone + date + accountNo when the row has no
 * email), so it updates the existing entry rather than duplicating it.
 */
function pushSavingsRows() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Savings Data');
  const logSheet = ss.getSheetByName('Push Log');
  const apiUrl = PropertiesService.getScriptProperties().getProperty('SAVINGS_API_URL');
  const apiKey = PropertiesService.getScriptProperties().getProperty('SAVINGS_API_KEY');

  if (!apiUrl) throw new Error('SAVINGS_API_URL is missing from Script Properties.');
  if (!apiKey) throw new Error('SAVINGS_API_KEY is missing from Script Properties.');

  const data = sheet.getDataRange().getValues();
  const headers = data[3]; // header row
  const rows = data.slice(5); // skip header + instructions

  const col = (name) => headers.indexOf(name);
  const emailCol = col('memberEmail');
  const phoneCol = col('memberPhone');
  const statusCol = col('_pushStatus');
  const pushedAtCol = col('_pushedAt');

  rows.forEach((row, i) => {
    const rowIndex = i + 6;
    if (row[statusCol] === '✅ Pushed') return;
    // A row needs an email OR a phone number to be matched to a member.
    if (!row[emailCol] && (phoneCol === -1 || !row[phoneCol])) return;

    const payload = {
      memberEmail: row[emailCol],
      memberPhone: phoneCol === -1 ? '' : row[phoneCol],
      accountNo: row[col('accountNo')],
      memberName: row[col('memberName')],
      date: formatCell(row[col('date')]),
      openingBalance: row[col('openingBalance')],
      deposit: row[col('deposit')],
      withdrawal: row[col('withdrawal')],
      monthlyRate: row[col('monthlyRate')],
      interestEarned: row[col('interestEarned')],
      closingBalance: row[col('closingBalance')],
      periodLabel: row[col('periodLabel')],
      notes: row[col('notes')],
    };
    const who = payload.memberEmail || payload.memberPhone;

    try {
      const response = UrlFetchApp.fetch(apiUrl, {
        method: 'post',
        contentType: 'application/json',
        headers: { 'x-sheets-secret': apiKey },
        payload: JSON.stringify(payload), // single row object — the API also accepts an array
        muteHttpExceptions: true,
      });

      const statusCode = response.getResponseCode();
      const responseText = response.getContentText();

      // muteHttpExceptions means a 4xx/5xx never throws — check the code
      // before marking the row "Pushed".
      if (statusCode >= 200 && statusCode < 300) {
        sheet.getRange(rowIndex, statusCol + 1).setValue('✅ Pushed');
        sheet.getRange(rowIndex, pushedAtCol + 1).setValue(new Date());
        logSheet.appendRow([new Date(), who, '✅ Success', responseText]);
      } else {
        sheet.getRange(rowIndex, statusCol + 1).setValue('❌ Failed');
        logSheet.appendRow([new Date(), who, '❌ HTTP ' + statusCode, responseText]);
      }
    } catch (err) {
      sheet.getRange(rowIndex, statusCol + 1).setValue('❌ Failed');
      logSheet.appendRow([new Date(), who, '❌ Network error', err.message]);
    }
  });
}

// Dates come back from Sheets as JS Date objects when the cell is
// date-formatted — send a clean YYYY-MM-DD instead of a full timestamp.
function formatCell(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return value;
}
