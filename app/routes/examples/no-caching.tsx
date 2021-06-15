import type { HeadersFunction } from "remix";

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": "no-transform",
  };
};

export default function NoCaching() {
  return (
    <div>
      <h1>No caching</h1>
    </div>
  );
}
