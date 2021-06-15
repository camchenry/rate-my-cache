export type WillCache = Readonly<
  | {
      willCache: true;
      willCacheReason: "etag" | "cache-control";
    }
  | {
      willCache: false;
      willCacheReason: "no-caching-enabled" | "no-store";
    }
>;

export type CacheControlDirectives = Readonly<{
  public?: boolean;
  private?: boolean;
  noCache?: boolean;
  noStore?: boolean;
  maxAge?: number;
  sharedMaxAge?: number;
  maxStale?: number;
  minFresh?: number;
  staleWhileRevalidate?: number;
  staleIfError?: number;
  mustRevalidate?: boolean;
  proxyRevalidate?: boolean;
  immutable?: boolean;
  noTransform?: boolean;
  onlyIfCached?: boolean;
}>;

export type CacheInformation = Readonly<
  | {
      hasCacheControl: boolean;
      cacheControlHeader?: string | null;
      cacheControlDirectives?: CacheControlDirectives;
      hasEntityTag: boolean;
      entityTag?: string | null;
    } & WillCache
>;

export const getWillCache = (headers: Headers): WillCache => {
  const cacheControl = headers.get("cache-control");

  const directives = getCacheControlDirectives(headers);

  if (cacheControl !== null) {
    if (directives.noStore) {
      return {
        willCache: false,
        willCacheReason: "no-store",
      };
    }

    if (
      [
        directives.immutable,
        directives.public,
        directives.private,
        directives.maxAge,
        directives.maxStale,
        directives.minFresh,
        directives.mustRevalidate,
        directives.noCache,
        directives.onlyIfCached,
        directives.proxyRevalidate,
        directives.sharedMaxAge,
        directives.staleIfError,
        directives.staleWhileRevalidate,
      ].some(Boolean)
    ) {
      return {
        willCache: true,
        willCacheReason: "cache-control",
      };
    }
  }

  const entityTag = headers.get("etag");

  if (entityTag !== null) {
    return {
      willCache: true,
      willCacheReason: "etag",
    };
  }

  return {
    willCache: false,
    willCacheReason: "no-caching-enabled",
  };
};

export const getCacheControlDirectives = (
  headers: Headers
): CacheControlDirectives => {
  const cacheControl = headers.get("cache-control") ?? "";
  const directives =
    cacheControl
      ?.split(",")
      .map((directive) => directive.toLowerCase().trim()) ?? [];
  const cacheControlDirectives: CacheControlDirectives = {
    public: directives.includes("public"),
    private: directives.includes("private"),
    immutable: directives.includes("immutable"),
    noCache: directives.includes("no-cache"),
    noStore: directives.includes("no-store"),
    noTransform: directives.includes("no-transform"),
    mustRevalidate: directives.includes("must-revalidate"),
    proxyRevalidate: directives.includes("proxy-revalidate"),
    onlyIfCached: directives.includes("only-if-cached"),
    maxAge: directives
      .find((directive) => directive.includes("max-age"))
      ?.split("=")
      ?.map((x) => parseInt(x))?.[1],
    sharedMaxAge: directives
      .find((directive) => directive.includes("s-maxage"))
      ?.split("=")
      ?.map((x) => parseInt(x))?.[1],
    maxStale: directives
      .find((directive) => directive.includes("max-stale"))
      ?.split("=")
      ?.map((x) => parseInt(x))?.[1],
    minFresh: directives
      .find((directive) => directive.includes("min-fresh"))
      ?.split("=")
      ?.map((x) => parseInt(x))?.[1],
    staleIfError: directives
      .find((directive) => directive.includes("stale-if-error"))
      ?.split("=")
      ?.map((x) => parseInt(x))?.[1],
    staleWhileRevalidate: directives
      .find((directive) => directive.includes("stale-while-revalidate"))
      ?.split("=")
      ?.map((x) => parseInt(x))?.[1],
  };
  return cacheControlDirectives;
};

export const parseCacheHeaders = (headers: Headers): CacheInformation => {
  const { ...willCache } = getWillCache(headers);
  const cacheControl = headers.get("cache-control");
  const hasCacheControl = cacheControl !== null;
  const entityTag = headers.get("etag");
  const hasEntityTag = entityTag !== null;

  const cacheControlDirectives = getCacheControlDirectives(headers);

  return {
    hasCacheControl,
    cacheControlHeader: cacheControl,
    cacheControlDirectives,
    hasEntityTag,
    entityTag,
    ...willCache,
  };
};
