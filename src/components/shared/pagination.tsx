import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";

interface Props {
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  page: number;
  pageSize: number;
  total: number;
}

const ROWS_PER_PAGE = ["10", "15", "20", "25", "30"];

export const Pagination = ({ onPageChange, onPageSizeChange, page, pageSize, total }: Props) => {
  const totalPages = Math.ceil(total / pageSize);
  const start = page * pageSize + 1;
  const end = Math.min((page + 1) * pageSize, total);

  const canPreviousPage = page > 0;
  const canNextPage = page < totalPages - 1;

  return (
    <div className="flex h-13 w-full items-center justify-between px-4 text-sm">
      <p className="text-gray-500">
        {start}-{end} of {total} rows
      </p>
      <div className="flex items-center gap-x-8">
        <div className="flex items-center gap-x-3">
          <p className="text-gray-500">Rows per page</p>
          <Select onValueChange={(value) => onPageSizeChange(Number(value))} value={pageSize.toString()}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROWS_PER_PAGE.map((row) => (
                <SelectItem key={row} value={row}>
                  {row}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-x-4">
          <p className="text-gray-500">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex items-center gap-x-1">
            <Button variant="outline" size="icon-sm" onClick={() => onPageChange(0)} disabled={!canPreviousPage}>
              <ChevronsLeft className="size-4" />
            </Button>
            <Button variant="outline" size="icon-sm" onClick={() => onPageChange(page - 1)} disabled={!canPreviousPage}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="icon-sm" onClick={() => onPageChange(page + 1)} disabled={!canNextPage}>
              <ChevronRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => onPageChange(totalPages - 1)}
              disabled={!canNextPage}
            >
              <ChevronsRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
