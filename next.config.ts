import type { NextConfig } from "next";
const storageHost="kufsqjyzoskxfmphjbwc.supabase.co";
const securityHeaders=[
  {key:"X-Content-Type-Options",value:"nosniff"},
  {key:"X-Frame-Options",value:"DENY"},
  {key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},
  {key:"Permissions-Policy",value:"camera=(), microphone=(), geolocation=(), payment=(), usb=()"},
  {key:"Content-Security-Policy",value:`default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://${storageHost} https://images.unsplash.com; media-src 'self' https://${storageHost}; font-src 'self' data:; connect-src 'self' https://${storageHost} wss://${storageHost}; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests`},
];
const nextConfig:NextConfig={
  poweredByHeader:false,
  images:{
    remotePatterns:[{protocol:"https",hostname:storageHost,pathname:"/storage/v1/object/public/product-images/**"},{protocol:"https",hostname:"images.unsplash.com",pathname:"/**"}],
    dangerouslyAllowSVG:false,
    dangerouslyAllowLocalIP:false,
    maximumRedirects:0,
  },
  async headers(){return [
    {source:"/:path*",headers:securityHeaders},
    {source:"/admin/:path*",headers:[{key:"Cache-Control",value:"private, no-store"},{key:"X-Robots-Tag",value:"noindex, nofollow"}]},
  ];},
};
export default nextConfig;
