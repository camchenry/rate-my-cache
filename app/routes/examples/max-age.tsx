import type { HeadersFunction } from "remix";

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": "no-transform, max-age=3600, s-maxage=7200",
  };
};

export default function MaxAge() {
  return (
    <div>
      <h1>Max Age + Shared Max Age</h1>
    </div>
  );
}
