import { ShopItemCard } from "@/components/shop/ShopItem";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

import { useProductSearch } from "@/hooks/useProductSearch";
import { flashMessage_Failed } from "@/lib/flash";
import { useNavigate } from "react-router";
import FilterSortingSelection from "@/components/shop/FilterSortingSelection";
import { sortOptions, type Product } from "@ecom/shared/src/type/product";
import { ProductPagination } from "@/components/ProductPagenition";
import { Loader2 } from "lucide-react";

export default function Shop() {
  const Navigation = useNavigate();
  const { data, search, filters, pagination } = useProductSearch({ limit: 16 });

  if (data.isError) {
    flashMessage_Failed(data.error ?? "Invalid Action");
    Navigation("/", { replace: true });
  }

  return (
    <div className="flex flex-col">
      {/* Search and filter */}
      {!data.isLoading && data.isSuccess && (
        <div className="flex justify-around my-10 flex-col md:flex-row">
          <div className="relative flex-1 md:flex-none md:w-2/5">
            <Input
              onChange={(e) => search.set(e.target.value)}
              value={search.value}
              type="text"
              placeholder="Search"
              className="pl-3 pr-10"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          <FilterSortingSelection
            className="mt-5 md:gap-10 md:mt-0"
            currentSort={filters.sort}
            sortOptions={sortOptions}
            currentFilter={filters.filter}
            updateFilter={filters.updateFilter}
            updateSort={filters.updateSort}
          ></FilterSortingSelection>
        </div>
      )}

      <div className=" grid grid-cols-2 px-3 gap-2 w-12/12 md:grid-cols-4 md:gap-9 md:w-full md:px-40">
        {!data.isLoading &&
          data.isSuccess &&
          data.products.map((product: Product) => {
            const discounted_price = Number(
              parseFloat(product.discounted_price).toFixed(2),
            );
            const originalPrice = Number(parseFloat(product.price).toFixed(2));

            return (
              <ShopItemCard
                key={product.product_id}
                id={product.product_id}
                productName={product.name}
                discountedPrice={discounted_price}
                soldOut={
                  product.total_stock
                    ? parseInt(product.total_stock) === 0
                    : true
                }
                image_url={product.cover_image_url}
                originalPrice={originalPrice}
              />
            );
          })}

        {data.isLoading && (
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
      </div>

      {!data.isLoading && data.isSuccess && pagination.totalPages > 1 && (
        <ProductPagination
          activePage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={(number) => pagination.goToPage(number)}
          className="p-5"
        ></ProductPagination>
      )}
    </div>
  );
}
