const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;
              style-src 'self' 'unsafe-inline';
              frame-src https://js.stripe.com https://hooks.stripe.com;
              connect-src 'self'
                https://api.stripe.com
                https://*.supabase.co;
              img-src 'self' data:;
            `.replace(/\n/g, "")
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig