import type { MetaObject } from '@nuxt/schema'
import { defineComponent, ref } from 'vue'
import { pwaInfo } from 'virtual:pwa-info'
import { pwaAssetsHead } from 'virtual:pwa-assets/head'
import { useHead, useLocalePath } from '#imports'

export default defineComponent({
  setup() {
    const meta = ref<MetaObject>({ link: [] })
    const localePath = useLocalePath()
    useHead(meta)
    if (pwaAssetsHead.themeColor)
      meta.value.meta = [{ name: 'theme-color', content: pwaAssetsHead.themeColor.content }]

    if (pwaAssetsHead.links.length)
      // @ts-expect-error: links are fine
      meta.value.link!.push(...pwaAssetsHead.links)

    if (pwaInfo) {
      const { webManifest } = pwaInfo
      if (webManifest) {
        const { href, useCredentials } = webManifest
        const prefix = localePath("/").replace("^/$","")
        if (useCredentials) {
          meta.value.link!.push({
            rel: 'manifest',
            href: prefix+href,
            crossorigin: 'use-credentials',
          })
        }
        else {
          meta.value.link!.push({
            rel: 'manifest',
            href: prefix+href,
          })
        }
      }
    }

    return () => null
  },
})
