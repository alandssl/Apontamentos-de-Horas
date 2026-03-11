"use client";
import { useEffect, useState } from "react";

type ListType = {
  value: string;
  label: string;
}[];

export function useDebounce(
  value: string,
  list: ListType,
  delay: number | undefined = 400,
): ListType {
  const [debouncedValue, setDebouncedValue] = useState(list);

  useEffect(() => {
    if (value == "") {
      setDebouncedValue(list);
      return;
    }

    if (value.length < 3) {
      return;
    }

    const handler = setTimeout(() => {
      setDebouncedValue(list.filter((item) => item.label.includes(value)));
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
