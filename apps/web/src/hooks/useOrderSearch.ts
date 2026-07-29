
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from './useDebounce';
import { useAdminOrdersQuery, useCustomerOrdersQuery } from './useOrder';

interface orderSearchProps {
  limit?: number;
  defaultSort?: string;
  defaultFilter?: string;
  mode?: 'admin' | 'customer';
}

export function useOrderSearch(options: orderSearchProps = {}) {
  const {
    limit = 20,
    defaultSort = 'created_at:desc',
    defaultFilter = 'all',
    mode = 'customer',
  } = options;

  // 1. URL State - Simple and readable
  const [searchParams, setSearchParams] = useSearchParams();
  
  const pageIndex = Number(searchParams.get('page') ?? 0);
  const sort = searchParams.get('sort') ?? defaultSort;
  const filter = searchParams.get('filter') ?? defaultFilter;
  const urlSearch = searchParams.get('search') ?? '';

  // 2. Search State with Debounce
  const [searchInput, setSearchInput] = useState(urlSearch);
  const debouncedSearch = useDebounce(searchInput, 700);

  // 3. Sync search to URL
  useEffect(() => {
    if (debouncedSearch === urlSearch) return;
    
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (debouncedSearch) {
        next.set('search', debouncedSearch);
      } else {
        next.delete('search');
      }
      next.delete('page'); // Reset to first page on new search
      return next;
    });
  }, [debouncedSearch, urlSearch, setSearchParams]);

  // 4. Fetch Data
 const adminQuery = useAdminOrdersQuery({
    limit,
    offset: pageIndex * limit,
    sortBy: sort,
    filterBy: filter,
    search: debouncedSearch,
    enabled: mode === 'admin'
  });

  const customerQuery = useCustomerOrdersQuery({
    limit,
    offset: pageIndex * limit,
    sortBy: sort,
    filterBy: filter,
    search: debouncedSearch,
    enabled: mode === 'customer'
  });

  const activeQuery = mode === 'admin' ? adminQuery : customerQuery;
  const { data, isLoading, isError, isSuccess, error, refetch } = activeQuery;

  // 5. Helper Functions
  const updateFilter = (key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      next.delete('page'); // Reset pagination on filter change
      return next;
    });
  };

  const goToPage = (newPageIndex: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(newPageIndex));
      return next;
    });
  };

  const resetAll = () => {
    setSearchParams(new URLSearchParams());
    setSearchInput('');
  };

  // 6. Computed Values - No useMemo needed
  const totalCount = data?.orderCount ?? 0;
  const totalPages = isLoading ? 0 : Math.ceil(totalCount / limit);
  const orders = data?.orders ?? [];

  // 7. Return Grouped Values - Clean and intuitive
  return {
    data: {
       orders,
      totalCount,
      isLoading,
      isSuccess,
      isError,
      error: error?.message,
      refetch,
    },

    search: {
      value: searchInput,
      debounced: debouncedSearch,
      set: setSearchInput,
      clear: () => setSearchInput(''),
    },

    filters: {
      sort,
      filter,
      updateSort: (value: string) => updateFilter('sort', value),
      updateFilter: (value: string) => updateFilter('filter', value),
      updateAny: updateFilter,
      reset: resetAll,
    },

  
    pagination: {
      currentPage: pageIndex,
      totalPages,
      totalCount,
      limit,
      goToPage,
    },
  };
}