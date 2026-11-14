import { data } from "react-router";

// Any unknown address: a real 404 status, rendered by the root error page
export function loader() {
  throw data({ message: "Not found" }, { status: 404 });
}

export default function NotFound() {
  return null;
}
