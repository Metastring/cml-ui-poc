import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SmartSearchCell } from "@/types/api/smartSearch.types";

/** Rows returned for a Smart Search question, shared by Quick and Deep mode. */
export function SmartSearchResultTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: SmartSearchCell[][];
}) {
  return (
    <div className="overflow-auto rounded-xl border border-primary/10 bg-card/60 backdrop-blur-sm">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column}>{column}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <TableCell key={cellIndex}>
                  {cell === null || cell === undefined ? "—" : String(cell)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
