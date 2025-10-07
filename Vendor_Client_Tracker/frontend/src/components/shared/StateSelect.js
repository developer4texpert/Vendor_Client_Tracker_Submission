import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useStates } from "../../context/StatesContext";

const StateSelect = ({ value, onChange, label = "State" }) => {
  const { states, loading } = useStates();

  return (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select value={value || ""} onChange={onChange}>
        {loading ? (
          <MenuItem disabled>Loading...</MenuItem>
        ) : (
          states.map((s) => (
            <MenuItem key={s.abbr} value={s.abbr}>
              {s.name} ({s.abbr})
            </MenuItem>
          ))
        )}
      </Select>
    </FormControl>
  );
};

export default StateSelect;
