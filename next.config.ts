import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
import createNextIntlPlugin from "next-intl/plugin";
import path from "path";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Host público del bucket S3/MinIO desde donde se sirven imágenes y PDFs.
const bucket = process.env.S3_PUBLIC_URL ? new URL(process.env.S3_PUBLIC_URL) : null;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  turbopack: { root: path.resolve(dirname) },
  images: {
    localPatterns: [{ pathname: "/api/media/file/**" }],
    remotePatterns: bucket
      ? [
          {
            protocol: bucket.protocol.replace(":", "") as "http" | "https",
            hostname: bucket.hostname,
            port: bucket.port,
            pathname: `${bucket.pathname.replace(/\/$/, "")}/**`,
          },
        ]
      : [],
  },
};

export default withNextIntl(withPayload(nextConfig, { devBundleServerPackages: false }));
