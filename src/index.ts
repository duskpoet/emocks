import * as path from "node:path";
import { readdirSync, statSync, readFileSync } from "node:fs";
import express from "express";

const HEADERS_EXT = ".headers";

export type EmocksOptions = {
  headers?: Record<string, string>;
  delay?: number;
  404?: express.RequestHandler;
};

export default function emocks(root: string, options: EmocksOptions = {}) {
  const router = express.Router();

  if (options.headers) {
    router.use((_req, res, next) => {
      res.set(options.headers);
      next();
    });
  }

  if (options.delay) {
    router.use((_req, _res, next) => {
      setTimeout(next, options.delay);
    });
  }

  const parseFName = (fname: string) => {
    const arr = fname.split(".");
    return {
      verb: arr[0].toLowerCase(),
      status: Number(arr[1]),
    };
  };

  const bindProcessors = (paths: string[]) => {
    const currentPath = path.join(root, paths.join("/"));
    readdirSync(currentPath).forEach((dir) => {
      const currentPathFile = path.join(currentPath, dir);
      const stat = statSync(currentPathFile);
      if (stat.isDirectory()) {
        bindProcessors(paths.concat([dir]));
      } else {
        const parsed = path.parse(dir);

        switch (parsed.ext) {
          case ".json": {
            const headersFile = path.join(
              currentPath,
              parsed.name + HEADERS_EXT
            );
            const headers = (() => {
              try {
                return JSON.parse(readFileSync(headersFile, "utf-8"));
              } catch {}
            })();

            const parsedName = parseFName(parsed.name);

            const respCb = function emocksHandle(
              _req: express.Request,
              res: express.Response
            ) {
              if (headers) {
                res.set(headers);
              }
              if (parsedName.status) {
                res.status(parsedName.status);
              }
              res.sendFile(currentPathFile);
            };
            const route = paths.join("/");
            const routes = [route + parsed.ext];
            if (parsed.ext === ".json") {
              routes.push(route);
            }
            if ((router as any)[parsedName.verb]) {
              (router as any)[parsedName.verb](routes, respCb);
            }
            break;
          }
          case ".js": {
            const cb = function emocksHandle() {
              delete require.cache[require.resolve(currentPathFile)];
              require(currentPathFile).apply(this, arguments);
            };
            const route = paths.join("/");
            const routes = [route, route + ".json"];
            const name = parsed.name.toLowerCase();
            if ((router as any)[name]) {
              (router as any)[name](routes, cb);
            }
            break;
          }
        }
      }
    });
  };

  function bindAll() {
    bindProcessors([""]);
    const cb404 =
      options["404"] ||
      function (_req: express.Request, res: express.Response) {
        res.status(404).json({ error: "Mock not found" });
      };
    router.use(cb404);
  }

  bindAll();

  return router;
}
