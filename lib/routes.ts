import type { Route } from "next";

export const homeRoute = "/" as Route;
export const compareRoute = "/compare" as Route;

export function tickerRoute(symbol: string) {
  return `/ticker/${symbol}` as Route;
}

export function compareRouteWithQuery(query: string) {
  return `/compare?${query}` as Route;
}
