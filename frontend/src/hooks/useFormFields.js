// hooks/useFormFields.js
import { useState } from "react";

export function useFormFields(initial) {
  const [formData, setFormData] = useState(initial);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  return [formData, handleChange, setFormData];
}