import * as React from 'react'

import { createSimpleProvider } from '../helpers/createSimpleProvider'
import { cn } from './utils'

const TableControl = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} {...props} className={cn('flex flex-wrap items-center justify-end gap-3 py-4', className)} />
  )
)
TableControl.displayName = 'TableControl'

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => <table ref={ref} className={cn('w-full caption-bottom', className)} {...props} />
)
Table.displayName = 'Table'

const TableHeaderSection = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />
)
TableHeaderSection.displayName = 'TableHeaderSection'

const TableBodySection = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
  )
)
TableBodySection.displayName = 'TableBodySection'

const TableFooterSection = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot ref={ref} className={cn('bg-primary text-primary-foreground font-medium', className)} {...props} />
  )
)
TableFooterSection.displayName = 'TableFooterSection'

type TableRowHoverable = boolean | (() => void)
const TableRowHoverableProvider = createSimpleProvider<TableRowHoverable>('TableRowHoverable')

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & { hoverable?: TableRowHoverable }
>(({ hoverable = false, className, ...props }, ref) => (
  <TableRowHoverableProvider memoizedProvided={hoverable}>
    <tr
      ref={ref}
      className={cn(
        'data-[state=selected]:bg-muted border-b transition-colors',
        hoverable && 'hover:bg-muted/50',
        className
      )}
      {...props}
    />
  </TableRowHoverableProvider>
))
TableRow.displayName = 'TableRow'

const TableHeaderCell = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'text-muted-foreground h-12 px-4 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  )
)
TableHeaderCell.displayName = 'TableHeaderCell'

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & { interactive?: boolean }
>(({ interactive, onClick, className, children, ...props }, ref) => {
  const rowHoverable = TableRowHoverableProvider.useProvided()
  const onRowClick = typeof rowHoverable === 'function' ? rowHoverable : undefined

  return (
    <td
      ref={ref}
      className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', onRowClick && 'cursor-pointer', className)}
      onClick={event => {
        onClick?.(event)
        if (!interactive || event.target === event.currentTarget) {
          onRowClick?.()
        }
      }}
      {...props}
    >
      {children}
    </td>
  )
})
TableCell.displayName = 'TableCell'

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => (
    <caption ref={ref} className={cn('text-muted-foreground mt-4 text-sm', className)} {...props} />
  )
)
TableCaption.displayName = 'TableCaption'

export {
  Table,
  TableBodySection,
  TableCaption,
  TableCell,
  TableControl,
  TableFooterSection,
  TableHeaderCell,
  TableHeaderSection,
  TableRow,
}
