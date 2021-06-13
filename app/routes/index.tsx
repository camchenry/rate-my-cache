import type { MetaFunction, LinksFunction, LoaderFunction } from "remix";
import { useRouteData } from "remix";
import { CacheInformation, parseCacheHeaders } from "../services/cache";

import stylesUrl from "../styles/index.css";

export const meta: MetaFunction = () => {
  return {
    title: "Rate My Cache",
  };
};

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

export type LoaderData = Readonly<
  | {
      state: "no-url";
    }
  | {
      state: "success";
      cacheInformation: CacheInformation;
      url: string;
    }
  | {
      state: "error";
    }
>;

export const loader: LoaderFunction = async ({
  request,
}): Promise<LoaderData> => {
  try {
    const url = new URL(request.url).searchParams.get("url");
    if (!url) {
      return {
        state: "no-url",
      };
    }
    const response = await fetch(url, {
      method: "GET",
    });
    const ok = response.ok;
    if (!ok) {
      return {
        state: "error",
      };
    }
    const cacheInformation = parseCacheHeaders(response.headers);
    return {
      state: "success",
      cacheInformation,
      url,
    };
  } catch (error: unknown) {
    return {
      state: "error",
    };
  }
};

export default function Index() {
  const data = useRouteData<LoaderData>();
  return (
    <div className="container">
      <h1>Rate My Cache</h1>
      <form action="" method="get">
        <input type="url" name="url" placeholder="Enter a URL" size={60} />
      </form>
      {data.state !== "no-url" && (
        <div className="results">
          {data.state === "success" ? (
            <div>
              <h2>Results for {data.url}</h2>

              <div className="result">
                <p>
                  {data.cacheInformation.willCache
                    ? "✅ This resource can be cached."
                    : "❌ This resource cannot be cached."}
                </p>
                {data.cacheInformation.willCache &&
                data.cacheInformation.willCacheReason === "cache-control" ? (
                  <p>
                    This response can be cached because of a directive in the{" "}
                    <code>Cache-Control</code> header.
                  </p>
                ) : null}
                {data.cacheInformation.willCache &&
                data.cacheInformation.willCacheReason === "etag" ? (
                  <p>
                    This response can be cached because the server responded
                    with an <code>ETag</code> header.
                  </p>
                ) : null}
                {!data.cacheInformation.willCache &&
                data.cacheInformation.willCacheReason === "no-store" ? (
                  <p>
                    This response cannot be cached because the server responded
                    with <code>no-store</code> in the <code>Cache-Control</code>{" "}
                    header.
                  </p>
                ) : null}
                {!data.cacheInformation.willCache &&
                data.cacheInformation.willCacheReason ===
                  "no-caching-enabled" ? (
                  <p>
                    This response cannot be cached because the server did not
                    respond with any caching headers such as{" "}
                    <code>Cache-Control</code> or <code>ETag</code>.
                  </p>
                ) : null}
              </div>
              <div className="result">
                {data.cacheInformation.hasCachingDirective
                  ? "✅ This resource has a caching directive."
                  : "❌ This resource does not have a caching directive."}
                {data.cacheInformation.cachingDirective && (
                  <pre>
                    Cache-Control: {data.cacheInformation.cachingDirective}
                  </pre>
                )}
              </div>
            </div>
          ) : (
            <div>
              There was an error getting results for this web page. Please try
              again.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
