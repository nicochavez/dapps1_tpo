module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    /* ... tus configuraciones anteriores si las hay ... */
  },
  // ESTO ES LO QUE SOLUCIONA EL REFRESH EN WINDOWS
  watchFolders: [],
  server: {
    enhanceMiddleware: (middleware) => {
      return middleware;
    },
  },
  resetCache: true,
};