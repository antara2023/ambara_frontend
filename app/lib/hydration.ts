import { useState } from "react";

// True once the first page has hydrated. Elements rendered by the server keep their content visible
// (no "start at opacity 0"), so text is readable before JavaScript loads and for search engines;
// elements that appear later (client navigation) get the entrance animation.
let hydrated = false;

export const markHydrated = () => {
  hydrated = true;
};

/** Whether this component first mounted after hydration (captured once, at mount). */
export const useMountedAfterHydration = () => useState(() => hydrated)[0];
