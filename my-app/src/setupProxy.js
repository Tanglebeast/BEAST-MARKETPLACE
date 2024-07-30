const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/ext',
    createProxyMiddleware({
      target: 'http://www.liveupdt.com',
      changeOrigin: true,
      pathRewrite: {
        '^/ext': '',  // Remove '/ext' from the path
      },
    })
  );
};
