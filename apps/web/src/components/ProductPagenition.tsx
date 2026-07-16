import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Fragment } from "react/jsx-runtime";

type PaginationProps = {
  activePage: number;      
  totalPages: number;       
  onPageChange: (page: number) => void;
  className?: string
};

export function ProductPagination({
  activePage,
  totalPages,
  onPageChange,
  className
}: PaginationProps) {

  // generate which page numbers to show
  const getPageNumbers = () => {
    // show all pages if 7 or fewer
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    // always show first, last, current, and neighbours
    const pages = new Set<number>();
    pages.add(0);                           // first page
    pages.add(totalPages - 1);              // last page
    pages.add(activePage);                  // current page
    pages.add(activePage - 1);             // neighbour before
    pages.add(activePage + 1);             // neighbour after

    // filter out invalid page numbers
    // sort the order, ensure order was correct
    return Array.from(pages)
      .filter((p) => p >= 0 && p < totalPages)
      .sort((a, b) => a - b);
  };

  const pageNumbers = getPageNumbers();

  return (
    <Pagination className={className}>
      <PaginationContent>
        {/* Previous button */}
        
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(Math.max(0, activePage - 1))}
            className={activePage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>

        {/* Page numbers with ellipsis */}
        {pageNumbers.map((page, index) => {
          // show ellipsis if there's a gap between this and previous page number
          const showEllipsisBefore = index > 0 && page - pageNumbers[index - 1] > 1;

          return (
            <Fragment key={page}>
              {showEllipsisBefore && (
                <PaginationItem key={`ellipsis-${page}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem key={page}>
                <PaginationLink 
                  isActive={page === activePage}
                  onClick={() => onPageChange(page)}
                  className="cursor-pointer"
                >
                  {page + 1} {/* display 1-based */}
                </PaginationLink>
              </PaginationItem>
            </Fragment>
          );
        })}

        {/* Next button */}
        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(Math.min(totalPages - 1, activePage + 1))}
            className={activePage === totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}