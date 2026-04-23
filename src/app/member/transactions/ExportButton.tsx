"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { format } from "date-fns"

export function ExportButton({ data }: { data: any[] }) {
  const handleExport = () => {
    if (!data.length) return

    const headers = ["Date", "Description", "Amount", "Status"]
    const csvContent = [
      headers.join(","),
      ...data.map((row) => [
        format(new Date(row.createdAt), "yyyy-MM-dd"),
        `"${row.description || ""}"`,
        row.amount,
        row.status,
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `transactions_${format(new Date(), "yyyy-MM-dd")}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={data.length === 0}>
      <Download className="h-4 w-4 mr-2" />
      Export CSV
    </Button>
  )
}