import autoprefixer from 'autoprefixer';
import cssLoader from 'bun-css-loader';
import tailwindcss from 'tailwindcss';

await Bun.build({
  entrypoints: ['./client/main.tsx'], 
  outdir: './dist',
  minify: false, 
  plugins: [
    cssLoader({
      // 🟢 PERBAIKAN DI SINI: Jangan panggil sebagai fungsi tailwindcss(), 
      // tetapi langsung masukkan nama modulnya saja ke dalam array.
      postCssPlugins: [tailwindcss, autoprefixer],
    }),
  ],
});

console.log("🎉 Build completed successfully with Tailwind CSS integrated!");
