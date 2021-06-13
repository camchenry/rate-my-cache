import type { MetaFunction, LinksFunction, LoaderFunction } from "remix";
import { useRouteData } from "remix";
import { CacheInformation, parseCacheHeaders } from "../services/cache";
import WillCacheInfo from "../components/WillCacheInfo";

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
        <label htmlFor="url">URL</label>
        <input
          type="url"
          id="url"
          name="url"
          placeholder="Enter a URL"
          defaultValue={data.state === "success" ? data.url : undefined}
          size={60}
        />
      </form>
      {data.state !== "no-url" && (
        <div className="results">
          {data.state === "success" ? (
            <div>
              <h2>Results for {data.url}</h2>

              <WillCacheInfo cacheInformation={data.cacheInformation} />
              <div className="result">
                {data.cacheInformation.hasCacheControl
                  ? "✅ This resource has a cache control header."
                  : "❌ This resource does not have a cache control header."}
                {data.cacheInformation.cacheControlHeader && (
                  <pre>
                    Cache-Control: {data.cacheInformation.cacheControlHeader}
                  </pre>
                )}
                {data.cacheInformation.cacheControlDirectives && (
                  <div>
                    {data.cacheInformation.cacheControlDirectives.public && (
                      <p>🌐 Public</p>
                    )}
                    {data.cacheInformation.cacheControlDirectives.private && (
                      <p>🔒 Private</p>
                    )}
                    {data.cacheInformation.cacheControlDirectives.maxAge !==
                      undefined && <p>⏳ Max Age</p>}
                    {data.cacheInformation.cacheControlDirectives
                      .sharedMaxAge !== undefined && <p>⌛ Shared Max Age</p>}
                    {data.cacheInformation.cacheControlDirectives.immutable && (
                      <p>🧊 Immutable</p>
                    )}
                    {data.cacheInformation.cacheControlDirectives.maxStale !==
                      undefined && <p>😑 Max Stale</p>}
                    {data.cacheInformation.cacheControlDirectives.minFresh !==
                      undefined && <p>😎 Min Fresh</p>}
                    {data.cacheInformation.cacheControlDirectives.noCache && (
                      <p>💾 No Cache</p>
                    )}
                    {data.cacheInformation.cacheControlDirectives.noStore && (
                      <p>⛔ No Store</p>
                    )}
                    {data.cacheInformation.cacheControlDirectives
                      .noTransform && <p>✨ No Transform</p>}
                    {data.cacheInformation.cacheControlDirectives
                      .onlyIfCached && <p>❓ Only If Cached</p>}
                    {data.cacheInformation.cacheControlDirectives
                      .mustRevalidate && <p>❗ Must Revalidate</p>}
                    {data.cacheInformation.cacheControlDirectives
                      .proxyRevalidate && <p>⁉ Proxy Revalidate</p>}
                    {data.cacheInformation.cacheControlDirectives
                      .staleIfError !== undefined && <p>🆘 Stale If Error</p>}
                    {data.cacheInformation.cacheControlDirectives
                      .staleWhileRevalidate !== undefined && (
                      <p>🔁 Stale While Revalidate</p>
                    )}
                  </div>
                )}
              </div>
              <div className="result">
                {data.cacheInformation.hasEntityTag
                  ? "✅ This resource has an entity tag."
                  : "❌ This resource does not have an entity tag."}
                {data.cacheInformation.entityTag && (
                  <pre>ETag: {data.cacheInformation.entityTag}</pre>
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
