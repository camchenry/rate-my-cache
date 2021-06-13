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

export type CacheInformation = Readonly<
  | {
      hasCachingDirective: boolean;
      cachingDirective?: string | null;
    } & WillCache
>;

export const getWillCache = (headers: Headers): WillCache => {
  const cacheControl = headers.get("cache-control");

  if (cacheControl !== null) {
    const directives = cacheControl.split(",");
    if (directives.includes("no-store")) {
      return {
        willCache: false,
        willCacheReason: "no-store",
      };
    }
    return {
      willCache: true,
      willCacheReason: "cache-control",
    };
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

export const parseCacheHeaders = (headers: Headers): CacheInformation => {
  const { ...willCache } = getWillCache(headers);
  const cachingDirective = headers.get("cache-control");
  const hasCachingDirective = cachingDirective !== null;

  return {
    hasCachingDirective,
    cachingDirective,
    ...willCache,
  };
};
