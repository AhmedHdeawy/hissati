/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(settings)` | `/(settings)/` | `/(settings)/manage` | `/(settings)/subject` | `/_sitemap` | `/focus` | `/manage` | `/subject`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
