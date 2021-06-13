import {
  CacheInformation,
  parseCacheHeaders,
  getWillCache,
  WillCache,
} from "./cache";

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
    willCacheReason: "cache-control",
  });
  expect(
    parseCacheHeaders(
      new Headers({
        "cache-control": "private",
      })
    )
  ).toMatchObject<Partial<CacheInformation>>({
    willCache: true,
    willCacheReason: "cache-control",
  });
  expect(
    parseCacheHeaders(
      new Headers({
        "cache-control": "public",
      })
    )
  ).toMatchObject<Partial<CacheInformation>>({
    willCache: true,
    willCacheReason: "cache-control",
  });
  expect(
    parseCacheHeaders(
      new Headers({
        "cache-control": "max-age=31536000",
      })
    )
  ).toMatchObject<Partial<CacheInformation>>({
    willCache: true,
    willCacheReason: "cache-control",
  });
  expect(
    parseCacheHeaders(
      new Headers({
        "cache-control": "must-revalidate",
      })
    )
  ).toMatchObject<Partial<CacheInformation>>({
    willCache: true,
    willCacheReason: "cache-control",
  });
});

it("detects the presence of an entity tag", () => {
  expect(
    parseCacheHeaders(
      new Headers({
        eTAG: "abc132",
      })
    )
  ).toMatchObject<Partial<CacheInformation>>({
    hasEntityTag: true,
  });
  expect(
    parseCacheHeaders(
      new Headers({
        "Cache-Control": "something",
      })
    )
  ).toMatchObject<Partial<CacheInformation>>({
    hasEntityTag: false,
  });
});

describe("getWillCache", () => {
  it("returns false when no caching is enabled", () => {
    expect(getWillCache(new Headers())).toEqual<WillCache>({
      willCache: false,
      willCacheReason: "no-caching-enabled",
    });
  });
  it("returns true cache-control is returned", () => {
    expect(
      getWillCache(
        new Headers({
          "Cache-Control": "public, max-age=0",
        })
      )
    ).toEqual<WillCache>({
      willCache: true,
      willCacheReason: "cache-control",
    });
  });
  it("returns false cache-control: no-store is returned", () => {
    expect(
      getWillCache(
        new Headers({
          "Cache-Control": "no-store",
        })
      )
    ).toEqual<WillCache>({
      willCache: false,
      willCacheReason: "no-store",
    });
  });
  it("returns true when an entity tag is returned", () => {
    expect(
      getWillCache(
        new Headers({
          ETag: "abc123",
        })
      )
    ).toEqual<WillCache>({
      willCache: true,
      willCacheReason: "etag",
    });
  });
});
