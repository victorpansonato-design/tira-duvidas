import { useEffect, useState } from "react";
export function useMedia(query: string) {
  const [value, setValue] = useState(() => matchMedia(query).matches);
  useEffect(() => {
    const media = matchMedia(query);
    const update = () => setValue(media.matches);
    media.addEventListener("change", update);
    update();
    return () => media.removeEventListener("change", update);
  }, [query]);
  return value;
}
