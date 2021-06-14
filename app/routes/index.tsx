import type { MetaFunction, LinksFunction, LoaderFunction } from "remix";
import { useRouteData } from "remix";
import { CacheInformation, parseCacheHeaders } from "../services/cache";
import WillCacheInfo from "../components/WillCacheInfo";

import stylesUrl from "../styles/index.css";
import Result from "../components/Result";
import Directive from "../components/Directive";

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
          size={50}
        />
      </form>
      {data.state !== "no-url" && (
        <div className="results">
          {data.state === "success" ? (
            <div>
              <h2>Results for {data.url}</h2>

              <WillCacheInfo cacheInformation={data.cacheInformation} />
              <Result
                icon={data.cacheInformation.hasCacheControl ? "✅" : "❌"}
                header={
                  data.cacheInformation.hasCacheControl
                    ? "This resource has a cache control header."
                    : "This resource does not have a cache control header."
                }
              >
                {data.cacheInformation.cacheControlHeader && (
                  <pre>
                    Cache-Control: {data.cacheInformation.cacheControlHeader}
                  </pre>
                )}
                {data.cacheInformation.cacheControlDirectives && (
                  <ul className="directive-list">
                    {data.cacheInformation.cacheControlDirectives.public && (
                      <Directive icon={"🌐"} name="Public">
                        The <code>public</code> directive indicates that any
                        cache may cache the response, even if it would not
                        typically be cacheable.
                        <div className="links">
                          <a href="https://datatracker.ietf.org/doc/html/rfc7234#section-5.2.2.5">
                            RFC
                          </a>
                        </div>
                      </Directive>
                    )}
                    {data.cacheInformation.cacheControlDirectives.private && (
                      <Directive icon={"🔒"} name="Private">
                        The <code>private</code> directive indicates that the
                        response is intended only for a single user and must not
                        be stored in any shared cache. Typically, this means
                        that the response will only be stored in the browser
                        cache.
                        <div className="links">
                          <a href="https://datatracker.ietf.org/doc/html/rfc7234#section-5.2.2.6">
                            RFC
                          </a>
                        </div>
                      </Directive>
                    )}
                    {data.cacheInformation.cacheControlDirectives.maxAge !==
                      undefined && (
                      <Directive icon={"⏳"} name="Max Age">
                        The <code>max-age</code> directive indicates the
                        response should be considered stale after{" "}
                        <strong>
                          {data.cacheInformation.cacheControlDirectives.maxAge}
                        </strong>{" "}
                        seconds.
                        <div className="links">
                          <a href="https://datatracker.ietf.org/doc/html/rfc7234#section-5.2.2.6">
                            RFC
                          </a>
                        </div>
                      </Directive>
                    )}
                    {data.cacheInformation.cacheControlDirectives
                      .sharedMaxAge !== undefined && (
                      <Directive icon={"⌛"} name="Shared Max Age">
                        The <code>s-maxage</code> directive indicates the
                        response should be considered stale by <em>shared</em>{" "}
                        caches (such as a CDN) after{" "}
                        <strong>
                          {
                            data.cacheInformation.cacheControlDirectives
                              .sharedMaxAge
                          }
                        </strong>{" "}
                        seconds.
                        <div className="links">
                          <a href="https://datatracker.ietf.org/doc/html/rfc7234#section-5.2.2.9">
                            RFC
                          </a>
                        </div>
                      </Directive>
                    )}
                    {data.cacheInformation.cacheControlDirectives.immutable && (
                      <Directive icon={"🧊"} name="Immutable">
                        The <code>immutable</code> directive indicates the
                        response will not change during the freshness lifetime.
                        <div className="links">
                          <a href="https://datatracker.ietf.org/doc/html/rfc8246">
                            RFC
                          </a>
                        </div>
                      </Directive>
                    )}
                    {data.cacheInformation.cacheControlDirectives.maxStale !==
                      undefined && <p>😑 Max Stale</p>}
                    {data.cacheInformation.cacheControlDirectives.minFresh !==
                      undefined && <p>😎 Min Fresh</p>}
                    {data.cacheInformation.cacheControlDirectives.noCache && (
                      <Directive icon={"💾"} name="No Cache">
                        The <code>no-cache</code> directive indicates that this
                        response may be cached, but any cached response must be
                        validated with the origin server before it can be used.
                        <div className="links">
                          <a href="https://datatracker.ietf.org/doc/html/rfc7234#section-5.2.2.2">
                            RFC
                          </a>
                        </div>
                      </Directive>
                    )}
                    {data.cacheInformation.cacheControlDirectives.noStore && (
                      <Directive icon={"⛔"} name="No Store">
                        The <code>no-store</code> directive indicates that this
                        response must not be stored in any cache.
                        <div className="links">
                          <a href="https://datatracker.ietf.org/doc/html/rfc7234#section-5.2.2.3">
                            RFC
                          </a>
                        </div>
                      </Directive>
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
                  </ul>
                )}
              </Result>
              <Result
                icon={data.cacheInformation.hasEntityTag ? "✅" : "❌"}
                header={
                  data.cacheInformation.hasEntityTag
                    ? "This resource has an entity tag."
                    : "This resource does not have an entity tag."
                }
              >
                {data.cacheInformation.entityTag && (
                  <pre>ETag: {data.cacheInformation.entityTag}</pre>
                )}
              </Result>
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
