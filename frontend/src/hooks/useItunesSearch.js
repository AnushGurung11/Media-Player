import { useState, useEffect, useRef } from "react";
import api from "../services/api";

export function useItunesSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

     if (!query.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing derived results when query is emptied, not a fetch-driven update
      setResults([]);
      setError("");
      return;
    }

    // Debounce so we don't hit iTunes on every keystroke
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/itunes/search", { params: { q: query } });
        setResults(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Search failed. Try again."
        );
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  return { query, setQuery, results, loading, error };
}