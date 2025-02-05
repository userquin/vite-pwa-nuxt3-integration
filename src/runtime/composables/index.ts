import { computed, toValue } from 'vue'
import type { MaybeRef, UnwrapNestedRefs } from 'vue'
import type { PwaInjection } from '../plugins/types'
import { useNuxtApp } from '#imports'
import type { PwaTransparentImageProps } from '#build/pwa-icons/PwaTransparentImage'
import type { PwaMaskableImageProps } from '#build/pwa-icons/PwaMaskableImage'
import type { PwaFaviconImageProps } from '#build/pwa-icons/PwaFaviconImage'
import type { PwaAppleImageProps } from '#build/pwa-icons/PwaAppleImage'
import type { PwaAppleSplashScreenImageProps } from '#build/pwa-icons/PwaAppleSplashScreenImage'

export interface PWAImage {
  image: string
  alt?: string
  width?: number
  height?: number
  crossorigin?: '' | 'anonymous' | 'use-credentials'
  loading?: 'lazy' | 'eager'
  decoding?: 'async' | 'auto' | 'sync'
  nonce?: string
  [key: string]: any
}

export interface PWAIcon {
  src: string
  key: any
  alt?: string
  width?: number
  height?: number
  crossorigin?: '' | 'anonymous' | 'use-credentials'
  loading?: 'lazy' | 'eager'
  decoding?: 'async' | 'auto' | 'sync'
  nonce?: string
  [key: string]: any
}

type PWAImageType<T> = T extends 'transparent'
  ? PwaTransparentImageProps['image'] | (Omit<PWAImage, 'image'> & { image: PwaTransparentImageProps['image'] })
  : T extends 'maskable'
    ? PwaMaskableImageProps['image'] | Omit<PWAImage, 'image'> & { image: PwaMaskableImageProps['image'] }
    : T extends 'favicon'
      ? PwaFaviconImageProps['image'] | Omit<PWAImage, 'image'> & { image: PwaFaviconImageProps['image'] }
      : T extends 'apple'
        ? PwaAppleImageProps['image'] | Omit<PWAImage, 'image'> & { image: PwaAppleImageProps['image'] }
        : T extends 'appleSplashScreen'
          ? PwaAppleSplashScreenImageProps['image'] | Omit<PWAImage, 'image'> & { image: PwaAppleSplashScreenImageProps['image'] }
          : never

export type TransparentImageType = MaybeRef<PWAImageType<'transparent'>>
export type MaskableImageType = MaybeRef<PWAImageType<'maskable'>>
export type FaviconImageType = MaybeRef<PWAImageType<'favicon'>>
export type AppleImageType = MaybeRef<PWAImageType<'apple'>>
export type AppleSplashScreenImageType = MaybeRef<PWAImageType<'appleSplashScreen'>>

export function useTransparentPwaIcon(image: TransparentImageType) {
  return usePWAIcon('transparent', image)
}
export function useMaskablePwaIcon(image: MaskableImageType) {
  return usePWAIcon('maskable', image)
}
export function useFaviconPwaIcon(image: FaviconImageType) {
  return usePWAIcon('favicon', image)
}
export function useApplePwaIcon(image: AppleImageType) {
  return usePWAIcon('apple', image)
}
export function useAppleSplashScreenPwaIcon(image: AppleSplashScreenImageType) {
  return usePWAIcon('appleSplashScreen', image)
}
export function usePWA(): UnwrapNestedRefs<PwaInjection> | undefined {
  return useNuxtApp().$pwa
}

function usePWAIcon(
  type: 'transparent' | 'maskable' | 'favicon' | 'apple' | 'appleSplashScreen',
  pwaImage: MaybeRef<string | PWAImage>,
) {
  const pwaIcons = useNuxtApp().$pwaIcons
  const icon = computed(() => {
    const pwaIcon = toValue(pwaImage)
    const iconName = typeof pwaIcon === 'object' ? pwaIcon.image : pwaIcon
    const image = pwaIcons?.[type]?.[iconName]?.asImage
    if (!image)
      return

    if (typeof pwaIcon === 'string') {
      return <PWAIcon>{
        width: image.width,
        height: image.height,
        key: image.key,
        src: image.src,
      }
    }

    const {
      alt,
      width,
      height,
      crossorigin,
      loading,
      decoding,
      nonce,
      image: _image,
      ...rest
    } = pwaIcon

    return <PWAIcon>{
      alt,
      width: width ?? image.width,
      height: height ?? image.height,
      crossorigin,
      loading,
      decoding,
      nonce,
      ...rest,
      key: image.key,
      src: image.src,
    }
  })

  return { icon }
}
