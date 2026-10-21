import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMonthlySeries,
  buildTopInvestors,
  eatMonthStart,
  parseReportYearMonth,
  pctChange,
  type CoreReportRow,
} from '../src/lib/admin-analytics-core.ts';

const row = (over: Partial<CoreReportRow>): CoreReportRow => ({
  key: 'a@x.com',
  name: 'A',
  accountNo: null,
  principal: null,
  roi: null,
  withdrawal: null,
  dateText: null,
  uploadedAt: new Date('2026-10-05T09:00:00Z'),
  ...over,
});

describe('parseReportYearMonth', () => {
  it('reads ISO dates', () => {
    assert.deepEqual(parseReportYearMonth('2026-03-14'), { y: 2026, m: 3 });
  });
  it('treats ambiguous slash dates as MM/DD/YYYY', () => {
    assert.deepEqual(parseReportYearMonth('03/04/2026'), { y: 2026, m: 3 });
  });
  it('switches to DD/MM when the first part can only be a day', () => {
    assert.deepEqual(parseReportYearMonth('25/12/2025'), { y: 2025, m: 12 });
  });
  it('reads textual dates that include a year', () => {
    assert.deepEqual(parseReportYearMonth('Nov 3, 2025'), { y: 2025, m: 11 });
  });
  it('refuses labels and blanks instead of guessing', () => {
    assert.equal(parseReportYearMonth('Q1'), null);
    assert.equal(parseReportYearMonth('Week 3'), null);
    assert.equal(parseReportYearMonth(''), null);
    assert.equal(parseReportYearMonth(null), null);
  });
});

describe('eatMonthStart', () => {
  it('uses Nairobi month boundaries, not UTC', () => {
    // 22:00 UTC on 30 Sep is already 1 Oct in Nairobi.
    const now = new Date('2026-09-30T22:00:00Z');
    assert.equal(eatMonthStart(now, 0).toISOString(), '2026-09-30T21:00:00.000Z');
    assert.equal(eatMonthStart(now, -1).toISOString(), '2026-08-31T21:00:00.000Z');
  });
});

describe('buildMonthlySeries', () => {
  const now = new Date('2026-10-21T10:00:00Z');

  it('returns 12 months ending with the current one, zero-filled', () => {
    const s = buildMonthlySeries([], now, 12);
    assert.equal(s.length, 12);
    assert.equal(s[0].key, '2025-11');
    assert.equal(s[11].key, '2026-10');
    assert.ok(s.every((p) => p.deposits === 0 && p.cumulativeAum === 0));
  });

  it('buckets by report date and builds the running AUM curve', () => {
    const s = buildMonthlySeries(
      [
        row({ principal: 100, dateText: '2026-08-02' }),
        row({ principal: 50, roi: 5, dateText: '2026-09-10' }),
        row({ withdrawal: 20, dateText: '2026-09-11' }),
      ],
      now,
    );
    const aug = s.find((p) => p.key === '2026-08')!;
    const sep = s.find((p) => p.key === '2026-09')!;
    assert.equal(aug.deposits, 100);
    assert.equal(sep.deposits, 50);
    assert.equal(sep.roi, 5);
    assert.equal(sep.withdrawals, 20);
    assert.equal(s[11].cumulativeAum, 150);
  });

  it('falls back to the upload month when the date is unreadable', () => {
    const s = buildMonthlySeries([row({ principal: 70, dateText: 'Q1' })], now);
    assert.equal(s.find((p) => p.key === '2026-10')!.deposits, 70);
  });

  it('folds pre-window rows into opening AUM and ignores future-dated rows', () => {
    const s = buildMonthlySeries(
      [
        row({ principal: 1000, dateText: '2023-01-01' }),
        row({ principal: 999, dateText: '2027-05-01' }),
      ],
      now,
    );
    assert.equal(s[0].cumulativeAum, 1000);
    assert.equal(s[11].cumulativeAum, 1000);
  });
});

describe('buildTopInvestors', () => {
  it('aggregates per member, ranks by principal and computes AUM share', () => {
    const rows = [
      row({ key: 'a', name: 'Alice', principal: 300, roi: 30 }),
      row({ key: 'a', name: 'Alice', principal: 100, withdrawal: 40 }),
      row({ key: 'b', name: 'Bob', principal: 100 }),
      row({ key: '', name: 'No identity', principal: 500 }),
    ];
    const top = buildTopInvestors(rows, 500, 5);
    assert.equal(top.length, 2);
    assert.equal(top[0].name, 'Alice');
    assert.equal(top[0].principal, 400);
    assert.equal(top[0].net, 400 + 30 - 40);
    assert.equal(top[0].sharePct, 80);
    assert.equal(top[1].name, 'Bob');
  });
});

describe('pctChange', () => {
  it('computes change and refuses a zero base', () => {
    assert.equal(pctChange(150, 100), 50);
    assert.equal(pctChange(50, 100), -50);
    assert.equal(pctChange(10, 0), null);
  });
});
