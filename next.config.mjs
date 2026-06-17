/** @type {import('next').NextConfig} */
const nextConfig = {
  // @hello-pangea/dnd no arrastra bien con StrictMode en desarrollo
  // (doble montaje). Lo desactivamos para que el drag & drop funcione.
  reactStrictMode: false,
};

export default nextConfig;
