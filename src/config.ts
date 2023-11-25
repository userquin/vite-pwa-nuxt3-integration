import type { Nuxt } from '@nuxt/schema'
import { resolve } from 'pathe'
import type { NitroConfig } from 'nitropack'
import type { PwaModuleOptions } from './types'

export function configurePWAOptions(
  nuxt3_8: boolean,
  options: PwaModuleOptions,
  nuxt: Nuxt,
  nitroConfig: NitroConfig,
) {
  if (!options.outDir) {
    const publicDir = nitroConfig.output?.publicDir ?? nuxt.options.nitro?.output?.publicDir
    options.outDir = publicDir ? resolve(publicDir) : resolve(nuxt.options.buildDir, '../.output/public')
  }

  // generate dev sw in .nuxt folder: we don't need to remove it
  if (options.devOptions?.enabled)
    options.devOptions.resolveTempFolder = () => resolve(nuxt.options.buildDir, 'dev-sw-dist')

  let config: Partial<
    import('workbox-build').BasePartial
    & import('workbox-build').GlobPartial
    & import('workbox-build').RequiredGlobDirectoryPartial
  >

  if (options.strategies === 'injectManifest') {
    options.injectManifest = options.injectManifest ?? {}
    config = options.injectManifest
  }
  else {
    options.workbox = options.workbox ?? {}
    if (options.registerType === 'autoUpdate' && (options.client?.registerPlugin || options.injectRegister === 'script' || options.injectRegister === 'inline')) {
      options.workbox.clientsClaim = true
      options.workbox.skipWaiting = true
    }
    if (nuxt.options.dev) {
      // on dev force always to use the root
      options.workbox.navigateFallback = options.workbox.navigateFallback ?? nuxt.options.app.baseURL ?? '/'
      if (options.devOptions?.enabled && !options.devOptions.navigateFallbackAllowlist)
        options.devOptions.navigateFallbackAllowlist = [nuxt.options.app.baseURL ? new RegExp(nuxt.options.app.baseURL) : /\//]
    }
    // the user may want to disable offline support
    if (!('navigateFallback' in options.workbox))
      options.workbox.navigateFallback = nuxt.options.app.baseURL ?? '/'

    config = options.workbox
  }
  // handle payload extraction
  if (nuxt.options.experimental.payloadExtraction) {
    config.globPatterns = config.globPatterns ?? []
    config.globPatterns.push('**/_payload.json')
  }
  let appManifestFolder: string | undefined
  // check for Nuxt App Manifest
  if (nuxt3_8 && nuxt.options.experimental.appManifest) {
    config.globPatterns = config.globPatterns ?? []
    appManifestFolder = nuxt.options.app.buildAssetsDir ?? '_nuxt/'
    if (appManifestFolder[0] === '/')
      appManifestFolder = appManifestFolder.slice(1)

    if (appManifestFolder[appManifestFolder.length - 1] !== '/')
      appManifestFolder += '/'

    appManifestFolder += 'builds/'

    config.globPatterns.push(`${appManifestFolder}**/*.json`)
  }
  // allow override manifestTransforms
  if (!nuxt.options.dev && !config.manifestTransforms)
    config.manifestTransforms = [createManifestTransform(nuxt.options.app.baseURL ?? '/', appManifestFolder)]
}

function createManifestTransform(base: string, appManifestFolder?: string): import('workbox-build').ManifestTransform {
  return async (entries) => {
    entries.filter(e => e && e.url.endsWith('.html')).forEach((e) => {
      const url = e.url.startsWith('/') ? e.url.slice(1) : e.url
      if (url === 'index.html') {
        e.url = base
      }
      else {
        const parts = url.split('/')
        parts[parts.length - 1] = parts[parts.length - 1].replace(/\.html$/, '')
        e.url = parts.length > 1 ? parts.slice(0, parts.length - 1).join('/') : parts[0]
      }
    })

    if (appManifestFolder) {
      const regExp = /\/[0-9a-f]{8}\b-[0-9a-f]{4}\b-[0-9a-f]{4}\b-[0-9a-f]{4}\b-[0-9a-f]{12}\.json$/gi
      // we need to remove the revision from the sw prechaing manifest, UUID is enough:
      // we don't use dontCacheBustURLsMatching, single regex
      entries.filter(e => e && e.url.startsWith(appManifestFolder) && regExp.test(e.url)).forEach((e) => {
        e.revision = null
      })
    }

    return { manifest: entries, warnings: [] }
  }
}
