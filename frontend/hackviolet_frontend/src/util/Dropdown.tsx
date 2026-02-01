import "./Dropdown.css";

type DropdownProps = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

function Dropdown({options, value, onChange }: DropdownProps) {
  return (
    <div className="input-group">

      <select
        className="dropdown"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" disabled>
          Select an option
        </option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Dropdown;