/**
 * MMF / Investments Account — Excel/Sheets → database push script.
 *
 * Companion to scripts/savings-push.gs, run against the "Member Data" tab,
 * using the per-transaction principal x rate formula instead of Savings'
 * running-balance formula.
 *
 * NOTE: this file wasn't part of what I was given to work from — only the
 * workbook and the /api/member-reports route it posts to. Nothing bound to
 * the live "Member Data" sheet was in the export. This is written to match
 * that route's contract and response shape exactly (mirroring
 * savings-push.gs's structure, which *was* provided) — diff it against
 * whatever's actually live before replacing it.
 *
 * SETUP
 * 1. In the workbook, the "Member Data" tab's header row (row 4) should
 *    contain at least:
 *      memberEmail, accountNo, memberName, date, principal, rate, roi,
 *      withholdingTax, withdrawal, closingBal, quarter, periodLabel,
 *      notes, memberPhone, _pushStatus, _pushedAt
 *
 *    memberPhone is a second identifier: the app matches a row to a
 *    member by email first, and falls back to phone if the email on the
 *    row doesn't resolve to an account (e.g. a phone-only sign-up).
 *    withholdingTax is kept on the sheet for reference but isn't part of
 *    what gets pushed — the MemberReport table this writes to doesn't
 *    have a column for it (same as accountNo isn't part of Savings' push).
 * 2. Add a "Push Log" tab for the success/failure log.
 * 3. File > Project properties > Script properties, set:
 *      MMF_API_URL = https://<your-app-domain>/api/member-reports
 *      MMF_API_KEY = <same value as the app's SHEETS_API_SECRET env var>
 * 4. Run pushMemberReportRows() manually, or wrap it in a time-driven
 *    trigger (Triggers > Add Trigger) to sync automatically.
 *
 * Re-pushing a row is safe: the API upserts on memberEmail + date +
 * accountNo (or memberPhone + date + accountNo when the row has no
 * email), so it updates the existing entry rather than duplicating it.
 */
function pushMemberReportRows() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Member Data');
  const logSheet = ss.getSheetByName('Push Log');
  const apiUrl = PropertiesService.getScriptProperties().getProperty('MMF_API_URL');
  const apiKey = PropertiesService.getScriptProperties().getProperty('MMF_API_KEY');

  const data = sheet.getDataRange().getValues();
  const headers = data[3]; // header row
  const rows = data.slice(5); // skip header + instructions row

  const statusCol = headers.indexOf('_pushStatus');
  const pushedAtCol = headers.indexOf('_pushedAt');

  rows.forEach((row, i) => {
    const rowIndex = i + 6;
    if (row[statusCol] === '✅ Pushed') return;
    if (!row[headers.indexOf('memberEmail')] && !row[headers.indexOf('memberPhone')]) return;

    const payload = {
      memberEmail: row[headers.indexOf('memberEmail')],
      memberPhone: row[headers.indexOf('memberPhone')],
      accountNo: row[headers.indexOf('accountNo')],
      memberName: row[headers.indexOf('memberName')],
      date: row[headers.indexOf('date')],
      principal: row[headers.indexOf('principal')],
      rate: row[headers.indexOf('rate')],
      roi: row[headers.indexOf('roi')],
      withdrawal: row[headers.indexOf('withdrawal')],
      closingBal: row[headers.indexOf('closingBal')],
      quarter: row[headers.indexOf('quarter')],
      periodLabel: row[headers.indexOf('periodLabel')],
      notes: row[headers.indexOf('notes')],
    };

    try {
      const response = UrlFetchApp.fetch(apiUrl, {
        method: 'post',
        contentType: 'application/json',
        headers: { 'x-sheets-secret': apiKey },
        payload: JSON.stringify(payload), // single row object — the API also accepts an array
        muteHttpExceptions: true,
      });

      sheet.getRange(rowIndex, statusCol + 1).setValue('✅ Pushed');
      sheet.getRange(rowIndex, pushedAtCol + 1).setValue(new Date());
      logSheet.appendRow([
        new Date(),
        payload.memberEmail || payload.memberPhone,
        '✅ Success',
        response.getContentText(),
      ]);
    } catch (err) {
      sheet.getRange(rowIndex, statusCol + 1).setValue('❌ Failed');
      logSheet.appendRow([new Date(), payload.memberEmail || payload.memberPhone, '❌ Network error', err.message]);
    }
  });
}
