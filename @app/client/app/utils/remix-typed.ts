import type { LoaderContext } from "@app/lib";
import { json, redirect } from "@remix-run/node";
import { useActionData, useFetcher, useLoaderData } from "@remix-run/react";
import type { DataFunctionArgs } from "@remix-run/server-runtime";

// https://gist.github.com/fnimick/479bbfeb1d0649dc63603d478797cf2e

type MaybePromise<Value> = Value | PromiseLike<Value>;

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [Key in string]?: JsonValue }
  | JsonValue[]
  | undefined;

export type TypedResponse<Data extends JsonValue> = Omit<Response, "json"> & {
  json(): Promise<Data>;
};

// prettier-ignore
export type DataFunctionTyped<Data extends JsonValue> = (args: DataFunctionArgs) =>
  MaybePromise<Data | TypedResponse<Data>>

export type InferLoaderData<DataFunction> =
  DataFunction extends DataFunctionTyped<infer Data> ? Data : never;

export function responseTyped(
  body?: BodyInit | null,
  init?: ResponseInit | number
) {
  return new Response(
    body,
    typeof init === "number" ? { status: init } : init
  ) as TypedResponse<never>;
}

export function jsonTyped<Data extends JsonValue>(
  data: Data,
  init?: ResponseInit | number
) {
  return json(data, init) as TypedResponse<Data>;
}

export function redirectTyped(url: string, init?: ResponseInit | number) {
  return redirect(url, init) as TypedResponse<never>;
}

export function useLoaderDataTyped<
  DataFunction extends DataFunctionTyped<JsonValue>
>() {
  return useLoaderData<InferLoaderData<DataFunction>>();
}

export function useActionDataTyped<
  DataFunction extends DataFunctionTyped<JsonValue>
>() {
  return useActionData<InferLoaderData<DataFunction>>();
}

export function useFetcherTyped<
  DataFunction extends DataFunctionTyped<JsonValue>
>() {
  return useFetcher<InferLoaderData<DataFunction>>();
}

// -- below are app-specific customizations

export interface TypedDataFunctionArgs extends DataFunctionArgs {
  context: LoaderContext;
}
