import { resolve as pathResolve } from "path";
import { Express } from "express";
import { createPageRenderer } from 'vite-plugin-ssr'


if (!process.env.NODE_ENV) {
  throw new Error("No NODE_ENV envvar! Try `export NODE_ENV=development`");
}

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITE_TEST_BUILD;

export default async function installSSR(app: Express) {
  const resolve = (p: string) => pathResolve(__dirname+'/../../../client', p);

  /**
   * @type {import('vite').ViteDevServer}
   */
  let viteDevServer: any;
  const root = resolve('.');

  // Setup middleware
  if (isProduction) {
    // or app.use(express.static(`${root}/dist/client`))
    app.use(
      require('serve-static')(resolve('dist/client'), {
        index: false
      })
    )
  } else {
    viteDevServer = await require('vite').createServer({
      root,
      logLevel: isTest ? 'error' : 'info',
      server: { middlewareMode: true}, // Could also be 'ssr'
    });
    app.use(viteDevServer.middlewares);
  }

  const renderPage = createPageRenderer({ viteDevServer, isProduction, root });
  app.get('*', async (req, res, next) => {
    const url = req.originalUrl;
    const pageContextInit = {
      url,
    };
    const pageContext = await renderPage(pageContextInit);
    const { httpResponse } = pageContext;
    if (!httpResponse) return next();
    const { body, statusCode, contentType } = httpResponse;
    res.status(statusCode).type(contentType).send(body);
  })
}
