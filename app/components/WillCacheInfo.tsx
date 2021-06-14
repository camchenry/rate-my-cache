import { CacheInformation } from "../services/cache";
import Result from "./Result";

export default function WillCacheInfo({
  cacheInformation,
}: {
  cacheInformation: CacheInformation;
}) {
  return (
    <Result
      icon={cacheInformation.willCache ? "✅" : "❌"}
      header={
        cacheInformation.willCache
          ? "This resource can be cached."
          : "This resource cannot be cached."
      }
    >
      {cacheInformation.willCache &&
      cacheInformation.willCacheReason === "cache-control" ? (
        <p>
          This response can be cached because of a directive in the{" "}
          <code>Cache-Control</code> header.
        </p>
      ) : null}
      {cacheInformation.willCache &&
      cacheInformation.willCacheReason === "etag" ? (
        <p>
          This response can be cached because the server responded with an{" "}
          <code>ETag</code> header.
        </p>
      ) : null}
      {!cacheInformation.willCache &&
      cacheInformation.willCacheReason === "no-store" ? (
        <p>
          This response cannot be cached because the server responded with{" "}
          <code>no-store</code> in the <code>Cache-Control</code> header.
        </p>
      ) : null}
      {!cacheInformation.willCache &&
      cacheInformation.willCacheReason === "no-caching-enabled" ? (
        <p>
          This response cannot be cached because the server did not respond with
          any valid caching headers such as <code>Cache-Control</code> or{" "}
          <code>ETag</code>.
        </p>
      ) : null}
    </Result>
  );
}
