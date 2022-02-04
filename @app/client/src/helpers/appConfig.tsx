import * as _appConfig from "@app/config";

export const appConfig =
  "default" in _appConfig
    ? // @ts-ignore
      (_appConfig.default as typeof _appConfig)
    : _appConfig;
