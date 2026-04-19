/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.valorant-api.com",
        pathname: "/**",
      },
      { protocol: "https", hostname: "www.vlr.gg", pathname: "/**" },
      { protocol: "https", hostname: "vlr.gg", pathname: "/**" },
      { protocol: "https", hostname: "img.vlr.gg", pathname: "/**" },
      { protocol: "https", hostname: "i.imgur.com", pathname: "/**" },
      { protocol: "https", hostname: "owcdn.net", pathname: "/**" },
      { protocol: "https", hostname: "**.owcdn.net", pathname: "/**" },
      { protocol: "https", hostname: "cdn.discordapp.com", pathname: "/**" },
      { protocol: "https", hostname: "static.wikia.nocookie.net", pathname: "/**" },
    ],
  },
};

export default nextConfig;
