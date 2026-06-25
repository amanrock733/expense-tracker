'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileDown, FileSpreadsheet, TrendingUp, TrendingDown, PiggyBank, Trophy } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PieChart } from '@/components/charts/pie-chart'
import { BarChart } from '@/components/charts/bar-chart'
import { LineChart } from '@/components/charts/line-chart'
import { reportApi } from '@/services/api'
import { formatCurrency, formatDate, monthName } from '@/lib/format'
import { toast } from 'sonner'

export function ReportsView() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null)

  const monthlyQuery = useQuery({
    queryKey: ['reports', 'monthly', year, month],
    queryFn: () => reportApi.monthly(year, month),
  })

  const yearlyQuery = useQuery({
    queryKey: ['reports', 'yearly', year],
    queryFn: () => reportApi.yearly(year),
  })

  const pieData = useMemo(() => {
    const breakdown = monthlyQuery.data?.categoryBreakdown || {}
    return Object.entries(breakdown)
      .map(([name, value]) => ({ name, value: value as number }))
      .sort((a, b) => b.value - a.value)
  }, [monthlyQuery.data])

  const barData = useMemo(() => {
    return (yearlyQuery.data?.monthly || []).map((m) => ({
      month: m.month,
      expense: m.expense,
    }))
  }, [yearlyQuery.data])

  const lineData = useMemo(() => {
    return (yearlyQuery.data?.monthly || []).map((m) => ({
      month: m.month,
      savings: m.savings,
    }))
  }, [yearlyQuery.data])

  const ms = monthlyQuery.data?.summary
  const ys = yearlyQuery.data?.summary

  async function exportPDF() {
    setExporting('pdf')
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ unit: 'pt', format: 'a4' })
      const pageW = doc.internal.pageSize.getWidth()

      // Header
      doc.setFillColor(16, 185, 129)
      doc.rect(0, 0, pageW, 80, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text('Smart Expense Tracker', 40, 40)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.text(`Monthly Report — ${monthName(month)} ${year}`, 40, 60)

      // Summary section
      let y = 110
      doc.setTextColor(20, 20, 20)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Summary', 40, y)
      y += 22

      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      const rows: Array<[string, string]> = [
        ['Total Income', formatCurrency(ms?.totalIncome || 0)],
        ['Total Expense', formatCurrency(ms?.totalExpense || 0)],
        ['Net Savings', formatCurrency(ms?.netSavings || 0)],
        ['Savings %', `${(ms?.savingsPercent || 0).toFixed(2)}%`],
        ['Total Transactions', String(ms?.totalTransactions || 0)],
        [
          'Highest Expense Category',
          ms?.highestExpenseCategory
            ? `${ms.highestExpenseCategory.category} (${formatCurrency(ms.highestExpenseCategory.amount)})`
            : '—',
        ],
      ]
      for (const [label, value] of rows) {
        doc.setTextColor(100)
        doc.text(label, 40, y)
        doc.setTextColor(20, 20, 20)
        doc.setFont('helvetica', 'bold')
        doc.text(value, pageW - 40, y, { align: 'right' })
        doc.setFont('helvetica', 'normal')
        y += 22
      }

      // Category breakdown
      y += 12
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Expense Breakdown by Category', 40, y)
      y += 22
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      const breakdown = monthlyQuery.data?.categoryBreakdown || {}
      const entries = Object.entries(breakdown).sort((a, b) => b[1] - a[1])
      if (entries.length === 0) {
        doc.setTextColor(120)
        doc.text('No expense data for this month.', 40, y)
        y += 22
      } else {
        for (const [cat, amt] of entries) {
          doc.setTextColor(100)
          doc.text(cat, 40, y)
          doc.setTextColor(20, 20, 20)
          doc.setFont('helvetica', 'bold')
          doc.text(formatCurrency(amt), pageW - 40, y, { align: 'right' })
          doc.setFont('helvetica', 'normal')
          y += 20
        }
      }

      // Transactions table
      y += 12
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Transactions', 40, y)
      y += 18
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(120)
      doc.text('Date', 40, y)
      doc.text('Title', 130, y)
      doc.text('Category', 300, y)
      doc.text('Type', 380, y)
      doc.text('Amount', pageW - 40, y, { align: 'right' })
      y += 4
      doc.setDrawColor(220)
      doc.line(40, y, pageW - 40, y)
      y += 14
      doc.setFont('helvetica', 'normal')
      const txs = monthlyQuery.data?.transactions || []
      for (const t of txs) {
        if (y > 770) {
          doc.addPage()
          y = 50
        }
        doc.setTextColor(60)
        doc.text(formatDate(t.date), 40, y)
        doc.text((t.title || '').slice(0, 28), 130, y)
        doc.text(t.category, 300, y)
        doc.text(t.type, 380, y)
        const amt = (t.type === 'income' ? '+' : '-') + formatCurrency(t.amount)
        doc.text(amt, pageW - 40, y, { align: 'right' })
        y += 14
      }

      // Footer
      const pageH = doc.internal.pageSize.getHeight()
      doc.setDrawColor(220)
      doc.line(40, pageH - 50, pageW - 40, pageH - 50)
      doc.setFontSize(9)
      doc.setTextColor(140)
      doc.text(
        `Generated on ${new Date().toLocaleString('en-IN')}`,
        40,
        pageH - 30
      )

      const filename = `expense-report-${monthName(month).toLowerCase()}-${year}.pdf`
      doc.save(filename)
      toast.success(`PDF exported: ${filename}`)
    } catch (err: any) {
      console.error(err)
      toast.error('Failed to export PDF')
    } finally {
      setExporting(null)
    }
  }

  async function exportExcel() {
    setExporting('excel')
    try {
      const XLSX = await import('xlsx')
      const txs = monthlyQuery.data?.transactions || []

      // Sheet 1: Summary
      const summaryRows = [
        ['Smart Expense Tracker — Monthly Report'],
        [`Month: ${monthName(month)} ${year}`],
        ['Generated', new Date().toLocaleString('en-IN')],
        [],
        ['Metric', 'Value'],
        ['Total Income', ms?.totalIncome || 0],
        ['Total Expense', ms?.totalExpense || 0],
        ['Net Savings', ms?.netSavings || 0],
        ['Savings %', (ms?.savingsPercent || 0).toFixed(2) + '%'],
        ['Total Transactions', ms?.totalTransactions || 0],
        [
          'Highest Expense Category',
          ms?.highestExpenseCategory?.category || '—',
        ],
        [
          'Highest Category Amount',
          ms?.highestExpenseCategory?.amount || 0,
        ],
        [],
        ['Category Breakdown'],
        ['Category', 'Amount'],
        ...Object.entries(monthlyQuery.data?.categoryBreakdown || {}).sort(
          (a, b) => b[1] - a[1]
        ),
      ]
      const ws1 = XLSX.utils.aoa_to_sheet(summaryRows)
      ws1['!cols'] = [{ wch: 30 }, { wch: 20 }]

      // Sheet 2: Transactions
      const txRows: any[][] = [
        ['Date', 'Title', 'Category', 'Type', 'Amount', 'Description'],
      ]
      for (const t of txs) {
        txRows.push([
          formatDate(t.date),
          t.title,
          t.category,
          t.type,
          t.amount,
          t.description || '',
        ])
      }
      const ws2 = XLSX.utils.aoa_to_sheet(txRows)
      ws2['!cols'] = [
        { wch: 12 },
        { wch: 30 },
        { wch: 14 },
        { wch: 10 },
        { wch: 12 },
        { wch: 30 },
      ]

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws1, 'Summary')
      XLSX.utils.book_append_sheet(wb, ws2, 'Transactions')

      const filename = `expense-report-${monthName(month).toLowerCase()}-${year}.xlsx`
      // Use Blob + anchor download (more reliable in browsers than XLSX.writeFile)
      const arrayBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
      const blob = new Blob([arrayBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      toast.success(`Excel exported: ${filename}`)
    } catch (err: any) {
      console.error(err)
      toast.error('Failed to export Excel')
    } finally {
      setExporting(null)
    }
  }

  const loading = monthlyQuery.isLoading || yearlyQuery.isLoading

  const years = useMemo(() => {
    const arr: number[] = []
    for (let y = now.getFullYear(); y >= now.getFullYear() - 5; y--) arr.push(y)
    return arr
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground">
            Monthly &amp; yearly financial reports with PDF / Excel export.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={String(month)} onValueChange={(v) => setMonth(parseInt(v, 10))}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i} value={String(i)}>
                  {monthName(i)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={String(year)} onValueChange={(v) => setYear(parseInt(v, 10))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={exportPDF}
            disabled={!!exporting || loading}
          >
            <FileDown className="mr-2 h-4 w-4" />
            {exporting === 'pdf' ? 'Exporting...' : 'PDF'}
          </Button>
          <Button
            variant="outline"
            onClick={exportExcel}
            disabled={!!exporting || loading}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            {exporting === 'excel' ? 'Exporting...' : 'Excel'}
          </Button>
        </div>
      </div>

      {/* Monthly Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))
        ) : (
          <>
            <StatCard
              label="Income"
              value={formatCurrency(ms?.totalIncome || 0)}
              icon={TrendingUp}
              color="text-emerald-600 dark:text-emerald-400"
              bg="bg-emerald-50 dark:bg-emerald-950/50"
            />
            <StatCard
              label="Expense"
              value={formatCurrency(ms?.totalExpense || 0)}
              icon={TrendingDown}
              color="text-red-600 dark:text-red-400"
              bg="bg-red-50 dark:bg-red-950/50"
            />
            <StatCard
              label="Net Savings"
              value={formatCurrency(ms?.netSavings || 0)}
              icon={PiggyBank}
              color="text-purple-600 dark:text-purple-400"
              bg="bg-purple-50 dark:bg-purple-950/50"
            />
            <StatCard
              label="Transactions"
              value={String(ms?.totalTransactions || 0)}
              icon={Trophy}
              color="text-blue-600 dark:text-blue-400"
              bg="bg-blue-50 dark:bg-blue-950/50"
            />
          </>
        )}
      </div>

      {/* Highest category banner */}
      {ms?.highestExpenseCategory && (
        <Card className="border-emerald-200 dark:border-emerald-900">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-lg bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Highest Expense Category</p>
              <p className="font-semibold">
                {ms.highestExpenseCategory.category} —{' '}
                {formatCurrency(ms.highestExpenseCategory.amount)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Yearly charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Expense Distribution — {monthName(month)} {year}
            </CardTitle>
            <CardDescription>By category</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <PieChart data={pieData} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Expense — {year}</CardTitle>
            <CardDescription>Year overview</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <BarChart data={barData} />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Savings Trend — {year}</CardTitle>
            <CardDescription>Monthly net savings</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <LineChart data={lineData} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string
  value: string
  icon: typeof TrendingUp
  color: string
  bg: string
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
          </div>
          <div className={`rounded-lg p-2.5 ${bg}`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
