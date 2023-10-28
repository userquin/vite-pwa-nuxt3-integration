import type { VitePWAOptions } from 'vite-plugin-pwa'
import { type Ref, type UnwrapNestedRefs } from 'vue'

export interface PwaInjection {
  isInstalled: boolean
  showInstallPrompt: Ref<boolean>
  cancelInstall: () => void
  install: () => Promise<void>
  swActivated: Ref<boolean>
  registrationError: Ref<boolean>
  offlineReady: Ref<boolean>
  needRefresh: Ref<boolean>
  updateServiceWorker: (reloadPage?: boolean | undefined) => Promise<void>
  cancelPrompt: () => Promise<void>
  getSWRegistration: () => ServiceWorkerRegistration | undefined
}

// TODO: fix this issue upstream in nuxt/module-builder
declare module '#app' {
  interface NuxtApp {
    $pwa: UnwrapNestedRefs<PwaInjection>
  }
}

export interface ClientOptions {
  /**
   * Exposes the plugin: defaults to true.
   */
  registerPlugin?: boolean
  /**
   * Registers a periodic sync for updates interval: value in seconds.
   */
  periodicSyncForUpdates?: number
  /**
   * Will prevent showing native PWA install prompt: defaults to false.
   *
   * When set to true or no empty string, the native PWA install prompt will be prevented.
   *
   * When set to a string, it will be used as the key in `localStorage` to prevent show the PWA install prompt widget.
   *
   * When set to true, the key used will be `vite-pwa:hide-install`.
   */
  installPrompt?: boolean | string
}

export interface ModuleOptions extends Partial<VitePWAOptions> {
  /**
   * If SSR is enabled and this option is enabled, the plugin will inject a custom runtime caching to allow
   * SSR pages to work with NetworkOnly or NetworkFirst strategy.
   *
   * This option is only available when using `generateSW` strategy.
   *
   * Beware, your application should handle offline.
   *
   * @default undefined
   */
  enableSSR?: {
    /**
     * Should cache SSR pages?
     *
     * Dynamic routes will be automatically excluded.
     *
     * @default false
     */
    cache?: boolean
    /**
     * When cache is enabled, the name of the cache.
     *
     * @default 'ssr-pages'
     */
    cacheName?: string
    /**
     * When offline, the page fallback.
     *
     * @default <basePath>error?offline
     */
    offlinePage?: string
  }
  registerWebManifestInRouteRules?: boolean
  /**
   * Writes the plugin to disk: defaults to false (debug).
   */
  writePlugin?: boolean
  /**
   * Options for plugin.
   */
  client?: ClientOptions
}
