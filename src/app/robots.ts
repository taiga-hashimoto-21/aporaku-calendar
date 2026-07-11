import type { MetadataRoute } from "next";

/** アプリ全体を検索エンジンのインデックス・クロール対象外にする */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
