"use client";

import { useMemo, useState } from "react";

const ANNUAL_RATE = 0.14;

export default function MoneyMarketCalculator() {
  const [amount, setAmount] = useState(100000);
  const [months, setMonths] = useState(6);
  const [compound, setCompound] = useState(true);

  const result = useMemo(() => {
    const monthlyRate = ANNUAL_RATE / 12;

    let finalAmount = amount;

    if (compound) {
      finalAmount = amount * Math.pow(1 + monthlyRate, months);
    } else {
      finalAmount = amount * (1 + ANNUAL_RATE * (months / 12));
    }

    return {
      final: finalAmount,
      profit: finalAmount - amount,
    };
  }, [amount, months, compound]);

  return (
    <section className="my-16 px-4">
      <div className="w-full max-w-3xl mx-auto rounded-2xl border border-gray-200 bg-white p-8 shadow-xl shadow-black/5 dark:border-gray-800 dark:bg-gray-900 md:p-10">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-dark dark:text-white">
            Money Market Fund Calculator
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Estimate potential earnings with Ludeva’s targeted 14% gross annual return.
          </p>
        </div>

        {/* Inputs */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-dark dark:text-white">
              Investment Amount (KES)
            </label>
            <input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-2 w-full rounded-md border border-gray-300 bg-transparent px-4 py-3 text-dark outline-none focus:border-primary dark:border-gray-700 dark:text-white"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-dark dark:text-white">
              Investment Duration
            </label>
            <select
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              className="mt-2 w-full rounded-md border border-gray-300 bg-transparent px-4 py-3 text-dark outline-none focus:border-primary dark:border-gray-700 dark:text-white"
            >
              <option value={1}>1 Month</option>
              <option value={3}>3 Months</option>
              <option value={6}>6 Months</option>
              <option value={12}>12 Months</option>
            </select>
          </div>
        </div>

        {/* Toggle */}
        <div className="mt-8 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-800">
          <span className="text-sm font-medium text-dark dark:text-white">
            Interest Calculation
          </span>

          <button
            onClick={() => setCompound(!compound)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              compound
                ? "bg-primary text-white"
                : "bg-gray-200 text-dark dark:bg-gray-700 dark:text-white"
            }`}
          >
            {compound ? "Monthly Compounding" : "Simple Interest"}
          </button>
        </div>

        {/* Results */}
        <div className="mt-10 rounded-xl bg-primary/5 p-6 dark:bg-primary/10">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Estimated Value
            </span>
            <span className="text-lg font-semibold text-dark dark:text-white">
              KES {result.final.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>

          <div className="mt-3 flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Estimated Gross Earnings
            </span>
            <span className="font-medium text-primary">
              KES {result.profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
          <strong>Risk Disclaimer:</strong> While the Ludeva Money Market Fund seeks
          to deliver a consistent <strong>14% gross return</strong>, actual
          performance may vary depending on prevailing market conditions. The fund
          does not guarantee returns, but aims to preserve capital while maximizing
          income.
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <a
            href="/contact"
            className="inline-block rounded-md bg-primary px-7 py-3 text-sm font-medium text-white transition hover:bg-primary/90"
          >
            Talk to a Customer Relations Manager
          </a>
        </div>
      </div>
    </section>
  );
}
