import type { HeadersFunction } from "remix";

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control":
      "no-transform, max-age=3600, s-maxage=7200, stale-while-revalidate=36000",
  };
};

export default function StaleWhileRevalidate() {
  return (
    <div>
      <h1>Max Age + Shared Max Age + Stale While Revalidate</h1>
    </div>
  );
}
