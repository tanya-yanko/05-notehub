import {type Note} from "../../types/note";
import css from "./NoteList.module.css";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeNote } from "../../services/noteService";
import iziToast from "izitoast";

interface NoteListProps {
  notes: Note[];
}

export default function NoteList({ notes }: NoteListProps) {
  const queryClient = useQueryClient();
  const deleteNote = useMutation({
    mutationFn: (id: number) => removeNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["Notes"],
      });
    },
    onError: () => {
      iziToast.error({
        message: "Error deleting note, please try again",
        position: "topCenter",
      });
    },
  });
  return (
    <ul className={css.list}>
      {notes.map((note) => {
        return (
          <li key={note.id} className={css.listItem}>
            <h2 className={css.title}>{note.title}</h2>
            <p className={css.content}>{note.content}</p>
            <div className={css.footer}>
              <span className={css.tag}>{note.tag}</span>
              <button
                onClick={() => deleteNote.mutate(note.id)}
                className={css.button}
              >
                Delete
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}