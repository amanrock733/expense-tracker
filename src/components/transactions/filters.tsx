'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import {
  ALL_CATEGORIES,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from '@/lib/validations'
import type { Filters } from '@/store/app-store'
import type { DateFilter } from '@/lib/format'

interface FiltersBarProps {
  filters: Filters
  onChange: (f: Partial<Filters>) => void
  onReset: () => void
  searchTerm: string
  onSearchChange: (s: string) => void
}

const dateFilters: Array<{ value: DateFilter; label: string }> = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' },
]

export function FiltersBar({
  filters,
  onChange,
  onReset,
  searchTerm,
  onSearchChange,
}: FiltersBarProps) {
  const hasActive =
    filters.dateFilter !== 'all' ||
    filters.category !== 'all' ||
    filters.type !== 'all' ||
    searchTerm !== ''

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search title, category, description..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-9"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Select
          value={filters.dateFilter}
          onValueChange={(v) => onChange({ dateFilter: v as DateFilter })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Date" />
          </SelectTrigger>
          <SelectContent>
            {dateFilters.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {filters.dateFilter === 'custom' && (
          <>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-[140px] justify-start text-left font-normal',
                    !filters.startDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.startDate ? format(new Date(filters.startDate), 'PP') : 'Start'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.startDate ? new Date(filters.startDate) : undefined}
                  onSelect={(d) =>
                    onChange({ startDate: d ? format(d, 'yyyy-MM-dd') : undefined })
                  }
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-[140px] justify-start text-left font-normal',
                    !filters.endDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.endDate ? format(new Date(filters.endDate), 'PP') : 'End'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.endDate ? new Date(filters.endDate) : undefined}
                  onSelect={(d) =>
                    onChange({ endDate: d ? format(d, 'yyyy-MM-dd') : undefined })
                  }
                />
              </PopoverContent>
            </Popover>
          </>
        )}

        <Select
          value={filters.category}
          onValueChange={(v) => onChange({ category: v })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="income" disabled className="font-semibold text-muted-foreground">
              ─ Income ─
            </SelectItem>
            {INCOME_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
            <SelectItem value="expense" disabled className="font-semibold text-muted-foreground">
              ─ Expense ─
            </SelectItem>
            {EXPENSE_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.type}
          onValueChange={(v) => onChange({ type: v })}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>

        {hasActive && (
          <Button variant="ghost" onClick={onReset} size="sm">
            <X className="mr-1 h-4 w-4" />
            Reset
          </Button>
        )}
      </div>
    </div>
  )
}

export { ALL_CATEGORIES }
