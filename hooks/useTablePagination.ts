import { useState, useEffect } from 'react';

interface PaginationState {
  page: number;
  per_page: number;
}

interface UsePaginationProps {
  initialPage?: number;
  initialPerPage?: number;
  searchValue?: string;
}

export const usePagination = ({
  initialPage = 1,
  initialPerPage = 5,
  searchValue = '',
}: UsePaginationProps = {}) => {
  const [pagination, setPagination] = useState<PaginationState>({
    page: initialPage,
    per_page: initialPerPage,
  });

  // Reset to first page when search changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [searchValue]);

  const handlePageChange = (event: any) => {
    const newPage = Math.floor(event.first / event.rows) + 1;
    setPagination({
      page: newPage,
      per_page: event.rows,
    });
  };

  const getFirstRowIndex = () => (pagination.page - 1) * pagination.per_page;

  return {
    pagination,
    handlePageChange,
    getFirstRowIndex,
    setPagination,
  };
};