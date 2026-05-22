import { Button } from "./Button";

interface TablePaginationProps {
    page: number;
    totalPages: number;
    hasNextPage: boolean;
    onPrevious: () => void;
    onNext: () => void;
}

export function TablePagination({ page, totalPages, hasNextPage, onPrevious, onNext }: TablePaginationProps) {
    return (
        <>
            <Button variant="secondary" disabled={page <= 1} onClick={onPrevious}>
                Anterior
            </Button>
            <span className="px-2 text-sm text-slate-500 dark:text-slate-400">
                Pagina {page} de {totalPages}
            </span>
            <Button variant="secondary" disabled={!hasNextPage} onClick={onNext}>
                Proxima
            </Button>
        </>
    );
}
