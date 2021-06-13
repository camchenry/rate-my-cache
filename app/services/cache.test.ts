import {
  CacheInformation,
  parseCacheHeaders,
  getWillCache,
  WillCache,
  getCacheControlDirectives,
  CacheControlDirectives,
} from "./cache";

it("detects the presence of caching header", () => {
  expect(
    parseCacheHeaders(
      new Headers({
        "CaChe-CONTrol": "public",
      })
    )
  ).toMatchObject<Partial<CacheInformation>>({
    hasCacheControl: true,
  });
  expect(
    parseCacheHeaders(
      new Headers({
        "X-Some-Header": "false",
      })
    )
  ).toMatchObject<Partial<CacheInformation>>({
    hasCacheControl: false,
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
  it("returns false when there are no actual cache directives", () => {
    expect(
      getWillCache(
        new Headers({
          "cache-control":
            "foo, bar, ok google cache this, figure it out, whatever",
        })
      )
    ).toEqual<WillCache>({
      willCache: false,
      willCacheReason: "no-caching-enabled",
    });
  });
});

describe("getCacheControlDirectives", () => {
  it("detects public directive", () => {
    expect(
      getCacheControlDirectives(
        new Headers({
          "cache-control": "other, public, test, foo, bar",
        })
      )
    ).toMatchObject<CacheControlDirectives>({
      public: true,
    });
  });
  it("detects private directive", () => {
    expect(
      getCacheControlDirectives(
        new Headers({
          "cache-control": "other, PRIVATE, test, foo, bar",
        })
      )
    ).toMatchObject<CacheControlDirectives>({
      private: true,
    });
  });
  it("detects immutable directive", () => {
    expect(
      getCacheControlDirectives(
        new Headers({
          "cache-control": "other,    IMMUtable , test, foo, bar",
        })
      )
    ).toMatchObject<CacheControlDirectives>({
      immutable: true,
    });
  });
  it("detects no-cache directive", () => {
    expect(
      getCacheControlDirectives(
        new Headers({
          "cache-control": "other,    no-cache , test, foo, bar",
        })
      )
    ).toMatchObject<CacheControlDirectives>({
      noCache: true,
    });
  });
  it("detects no-store directive", () => {
    expect(
      getCacheControlDirectives(
        new Headers({
          "cache-control": "other,    no-store , test, foo, bar",
        })
      )
    ).toMatchObject<CacheControlDirectives>({
      noStore: true,
    });
  });
  it("detects no-transform directive", () => {
    expect(
      getCacheControlDirectives(
        new Headers({
          "cache-control": "other,    no-transform , test, foo, bar",
        })
      )
    ).toMatchObject<CacheControlDirectives>({
      noTransform: true,
    });
  });
  it("detects max-age directive", () => {
    expect(
      getCacheControlDirectives(
        new Headers({
          "cache-control": "other,    max-age=360 , test, foo, bar",
        })
      )
    ).toMatchObject<CacheControlDirectives>({
      maxAge: 360,
    });
  });
  it("detects shared max-age directive", () => {
    expect(
      getCacheControlDirectives(
        new Headers({
          "cache-control": "other,    s-maxage=0 , test, foo, bar",
        })
      )
    ).toMatchObject<CacheControlDirectives>({
      sharedMaxAge: 0,
    });
  });
  it("detects must-revalidate directive", () => {
    expect(
      getCacheControlDirectives(
        new Headers({
          "cache-control": "other,    must-revalidate , test, foo, bar",
        })
      )
    ).toMatchObject<CacheControlDirectives>({
      mustRevalidate: true,
    });
  });
  it("detects proxy-revalidate directive", () => {
    expect(
      getCacheControlDirectives(
        new Headers({
          "cache-control": "other,    proxy-revalidate , test, foo, bar",
        })
      )
    ).toMatchObject<CacheControlDirectives>({
      proxyRevalidate: true,
    });
  });
  it("detects only-if-cached directive", () => {
    expect(
      getCacheControlDirectives(
        new Headers({
          "cache-control": "other,    only-if-cached , test, foo, bar",
        })
      )
    ).toMatchObject<CacheControlDirectives>({
      onlyIfCached: true,
    });
  });
  it("detects max-stale directive", () => {
    expect(
      getCacheControlDirectives(
        new Headers({
          "cache-control": "other,    max-stale=1234567 , test, foo, bar",
        })
      )
    ).toMatchObject<CacheControlDirectives>({
      maxStale: 1234567,
    });
  });
  it("detects min-fresh directive", () => {
    expect(
      getCacheControlDirectives(
        new Headers({
          "cache-control": "other,    min-fresh=39992183 , test, foo, bar",
        })
      )
    ).toMatchObject<CacheControlDirectives>({
      minFresh: 39992183,
    });
  });
  it("detects stale-if-error directive", () => {
    expect(
      getCacheControlDirectives(
        new Headers({
          "cache-control": "other,    stale-if-error=39992183 , test, foo, bar",
        })
      )
    ).toMatchObject<CacheControlDirectives>({
      staleIfError: 39992183,
    });
  });
  it("detects stale-while-revalidate directive", () => {
    expect(
      getCacheControlDirectives(
        new Headers({
          "cache-control":
            "other,    stale-while-revalidate=3600 , test, foo, bar",
        })
      )
    ).toMatchObject<CacheControlDirectives>({
      staleWhileRevalidate: 3600,
    });
  });
});
