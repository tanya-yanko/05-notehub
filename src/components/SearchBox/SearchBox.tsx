import css from "./SearchBox.module.css"; 

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void; 
}

export default function SearchBox({ value, onChange }: SearchBoxProps) {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value); 
  };

  return (
    <input
      value={value}
      onChange={handleInputChange} 
      className={css.input}
      type="text"
      placeholder="Search notes"
    />
  );
}