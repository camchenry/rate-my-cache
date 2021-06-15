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
                          <a href="https://datatracker.ietf.org/doc/html/rfc7234#section-5.2.2.8">
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
                      <Directive icon={"♻️"} name="No Cache">
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
                      <Directive icon={"🚫"} name="No Store">
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
                      .noTransform && (
                      <Directive icon={"✨"} name="No Transform">
                        The <code>no-transform</code> directive indicates that
                        any intermediate cache must not be transform this
                        response (for example, change content type, compress
                        data, filter responses, etc.)
                        <div className="links">
                          <a href="https://datatracker.ietf.org/doc/html/rfc7234#section-5.2.1.6">
                            RFC
                          </a>
                        </div>
                      </Directive>
                    )}
                    {data.cacheInformation.cacheControlDirectives
                      .onlyIfCached && (
                      <Directive icon={"❓"} name="Only If Cached">
                        The <code>only-if-cached</code> directive indicates that
                        only a cached version of the response should be
                        returned, rather than a fresh response.
                        <div className="links">
                          <a href="https://datatracker.ietf.org/doc/html/rfc7234#section-5.2.1.7">
                            RFC
                          </a>
                        </div>
                      </Directive>
                    )}
                    {data.cacheInformation.cacheControlDirectives
                      .mustRevalidate && (
                      <Directive icon={"❗"} name="Must Revalidate">
                        The <code>must-revalidate</code> directive indicates
                        that when the response becomes stale, the cache must
                        revalidate the cached response before it can be used
                        again.
                        <div className="links">
                          <a href="https://datatracker.ietf.org/doc/html/rfc7234#section-5.2.2.1">
                            RFC
                          </a>
                        </div>
                      </Directive>
                    )}
                    {data.cacheInformation.cacheControlDirectives
                      .proxyRevalidate && (
                      <Directive icon={"⁉️"} name="Proxy Revalidate">
                        The <code>proxy-revalidate</code> directive indicates
                        that when the response becomes stale, the non-private
                        cache (such as a CDN) must revalidate the cached
                        response before it can be used again. (This has the same
                        meaning as <code>must-revalidate</code>, but does not
                        apply to private caches like browser caches.)
                        <div className="links">
                          <a href="https://datatracker.ietf.org/doc/html/rfc7234#section-5.2.2.7">
                            RFC
                          </a>
                        </div>
                      </Directive>
                    )}
                    {data.cacheInformation.cacheControlDirectives
                      .staleIfError !== undefined && (
                      <Directive icon={"🆘"} name="Stale If Error">
                        The <code>stale-if-error</code> directive indicates that
                        if an error occurs, then a stale version of the response
                        may be used, despite any other freshness constraints.
                        <div className="links">
                          <a href="https://datatracker.ietf.org/doc/html/rfc5861#section-4">
                            RFC
                          </a>
                        </div>
                      </Directive>
                    )}
                    {data.cacheInformation.cacheControlDirectives
                      .staleWhileRevalidate !== undefined && (
                      <Directive icon={"🔁"} name="Stale While Revalidate">
                        The <code>stale-while-revalidate</code> directive
                        indicates that after a response becomes stale, the cache
                        may continue to serve it for up to{" "}
                        <strong>
                          {
                            data.cacheInformation.cacheControlDirectives
                              .staleWhileRevalidate
                          }
                        </strong>{" "}
                        seconds while it is revalidated in the background.
                        <div className="links">
                          <a href="https://datatracker.ietf.org/doc/html/rfc5861#section-3">
                            RFC
                          </a>
                        </div>
                      </Directive>
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
