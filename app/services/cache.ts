export type CacheInformation = Readonly<{
  hasCachingDirective: boolean;
  willCache: boolean;
}>;

export const parseCacheHeaders = (headers: Headers): CacheInformation => {
  const cacheDirective = headers.get("cache-control");
  const hasCachingDirective = cacheDirective !== null;

  const cacheOptions = cacheDirective?.split(",") ?? [];
  const willCache = !cacheOptions.includes("no-store");

  return {
    hasCachingDirective,
    willCache,
  };
};
