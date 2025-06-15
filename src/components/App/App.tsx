import css from "./App.module.css";
import NoteList from "../NoteList/NoteList.tsx";
import NoteModal from "../NoteModal/NoteModal.tsx";
import SearchBox from "../SearchBox/SearchBox.tsx";
import Pagination from "../Pagination/Pagination.tsx";

import Loader from "../Loader/Loader.tsx";
import ErrorMessage from "../ErrorMessage/ErrorMessage.tsx";
import { type PaginatedNotesResponse } from "../../services/noteService.ts";
import { fetchNotes } from "../../services/noteService.ts";
import { type Note } from "../../types/note.ts";

import { useDebounce } from "use-debounce";
import { useState, useEffect } from "react";
import {
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";

export default function App() {
  const queryClient = useQueryClient();
  const [currentSearchQuery, setCurrentSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(currentSearchQuery, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data, isLoading, isError, isFetching } = useQuery<
    PaginatedNotesResponse,
    Error
  >({
    queryKey: ["notes", currentPage, debouncedSearchQuery],
    queryFn: () => fetchNotes(currentPage, 12, debouncedSearchQuery),
    enabled: true,
    placeholderData: keepPreviousData,
  });

  const notifyNoNotesFound = () =>
    toast.error("No notes found for your request.", {
      style: { background: "rgba(125, 183, 255, 0.8)" },
      icon: "ℹ️",
    });

  useEffect(() => {
    if (data?.notes.length === 0) {
      notifyNoNotesFound();
    }
  }, [data]);

  const handleSearch = (newQuery: string) => {
    setCurrentSearchQuery(newQuery);
    setCurrentPage(1);
    setErrorMessage(null);
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setErrorMessage(null);
  };

  const openCreateNoteModal = () => setIsNoteModalOpen(true);
  const closeCreateNoteModal = () => setIsNoteModalOpen(false);

  const handleCloseErrorMessage = () => {
    setErrorMessage(null);
    queryClient.resetQueries({ queryKey: ["notes"], exact: false });
    queryClient.invalidateQueries({ queryKey: ["notes"] });
  };

  const notesToDisplay: Note[] = data?.notes || [];
  const totalPagesToDisplay: number = data?.totalPages ?? 0;

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox value={currentSearchQuery} onChange={handleSearch} />
        {notesToDisplay.length > 0 && (
          <Pagination
            pageCount={totalPagesToDisplay}
            currentPage={currentPage}
            onPageChange={handlePageClick}
          />
        )}

        <button className={css.createNoteButton} onClick={openCreateNoteModal}>
          Create note +
        </button>
      </header>

      {(isLoading || isFetching) && <Loader />}
      {errorMessage && (
        <ErrorMessage message={errorMessage} onClose={handleCloseErrorMessage} />
      )}
      {notesToDisplay.length > 0 && <NoteList notes={notesToDisplay} />}

      {!isLoading &&
        !isFetching &&
        !isError &&
        notesToDisplay.length === 0 &&
        !currentSearchQuery && (
          <p className={css.initialMessage}>
            Start by searching for notes or create a new one!
          </p>
        )}

      {!isLoading &&
        !isFetching &&
        !isError &&
        notesToDisplay.length === 0 &&
        currentSearchQuery && (
          <p className={css.noResultsMessage}>
            No notes found for "{currentSearchQuery}".
          </p>
        )}
      <Toaster />
      {isNoteModalOpen && <NoteModal onClose={closeCreateNoteModal} />}
    </div>
  );
}
