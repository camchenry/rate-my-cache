import { CacheInformation, parseCacheHeaders } from "./cache";

it("detects the presence of caching header", () => {
  expect(
    parseCacheHeaders(
      new Headers({
        "CaChe-CONTrol": "public",
      })
    )
  ).toMatchObject<Partial<CacheInformation>>({
    hasCachingDirective: true,
  });
  expect(
    parseCacheHeaders(
      new Headers({
        "X-Some-Header": "false",
      })
    )
  ).toMatchObject<Partial<CacheInformation>>({
    hasCachingDirective: false,
  });
});

it("determines whether a response will be cached or not", () => {
  expect(
    parseCacheHeaders(
      new Headers({
        "cache-control": "no-store",
      })
    )
  ).toMatchObject<Partial<CacheInformation>>({
    willCache: false,
  });
  expect(
    parseCacheHeaders(
      new Headers({
        "cache-control": "no-cache",
      })
    )
  ).toMatchObject<Partial<CacheInformation>>({
    willCache: true,
  });
  expect(
    parseCacheHeaders(
      new Headers({
        "cache-control": "private",
      })
    )
  ).toMatchObject<Partial<CacheInformation>>({
    willCache: true,
  });
  expect(
    parseCacheHeaders(
      new Headers({
        "cache-control": "public",
      })
    )
  ).toMatchObject<Partial<CacheInformation>>({
    willCache: true,
  });
  expect(
    parseCacheHeaders(
      new Headers({
        "cache-control": "max-age=31536000",
      })
    )
  ).toMatchObject<Partial<CacheInformation>>({
    willCache: true,
  });
  expect(
    parseCacheHeaders(
      new Headers({
        "cache-control": "must-revalidate",
      })
    )
  ).toMatchObject<Partial<CacheInformation>>({
    willCache: true,
  });
  expect(
    parseCacheHeaders(
      new Headers({
        "cache-control": "must-revalidate",
      })
    )
  ).toMatchObject<Partial<CacheInformation>>({
    willCache: true,
  });
});
