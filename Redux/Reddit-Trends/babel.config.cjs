module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    ["@babel/preset-react", { runtime: "automatic" }]
  ],
  // Lets Jest handle `import.meta.env.*` (a Vite-only feature) by rewriting it to process.env.*
  plugins: ["babel-plugin-transform-vite-meta-env"]
};
