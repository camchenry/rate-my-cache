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
