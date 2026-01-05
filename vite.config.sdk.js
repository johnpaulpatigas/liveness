// vite.config.sdk.js
import { defineConfig } from "vite";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/sdk/LivenessSDK.js"),
      name: "LivenessSDK",
      fileName: "liveness-sdk",
      formats: ["es", "umd"], // ESM for modern bundlers, UMD for script tags
    },
    outDir: "dist-sdk",
    rollupOptions: {
      // Externalize dependencies to keep the bundle small
      // Users must install these themselves or use a CDN
      external: [
        "@mediapipe/face_mesh",
        "@tensorflow/tfjs",
      ],
      output: {
        globals: {
          "@mediapipe/face_mesh": "FaceMesh",
          "@tensorflow/tfjs": "tf",
        },
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
});
