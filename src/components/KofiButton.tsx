import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '../i18n/useI18n'

const KOFI_ITEMS = [
  { key: 'tinyPlant', emoji: '🪴' },
  { key: 'iceCream', emoji: '🍦' },
  { key: 'coffee', emoji: '☕️' },
  { key: 'donut', emoji: '🍩' },
  { key: 'mango', emoji: '🥭' },
  { key: 'sushi', emoji: '🍣' },
  { key: 'dimSum', emoji: '🥟' },
  { key: 'ikeaFlatpack', emoji: '📦' },
  { key: 'energyDrink', emoji: '🥤' },
  { key: 'potato', emoji: '🥔' },
  { key: 'socks', emoji: '🧦' },
  { key: 'yarn', emoji: '🧶' },
  { key: 'filamentRoll', emoji: '🧵' },
  { key: 'game', emoji: '🎮' },
  { key: 'taco', emoji: '🌮' },
  { key: 'ramen', emoji: '🍜' },
  { key: 'beer', emoji: '🍺' },
  { key: 'fullCharge', emoji: '🔋' },
  { key: 'beardTrim', emoji: '🧔' },
]

interface KofiButtonProps {
  onClick: () => void
}

const shuffleItems = <T,>(items: T[]) => {
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function KofiButton({ onClick }: KofiButtonProps) {
  const { language, t } = useI18n()
  const kofiItems = useMemo(
    () =>
      shuffleItems(
        KOFI_ITEMS.map((item) => ({
          label: t(`kofi.items.${item.key}`),
          emoji: item.emoji,
        })),
      ),
    [language],
  )
  const [kofiIndex, setKofiIndex] = useState(0)
  const [emojiSupported, setEmojiSupported] = useState(false)
  const [kofiAnimate, setKofiAnimate] = useState(false)

  useEffect(() => {
    setKofiIndex(0)
  }, [language])

  useEffect(() => {
    if (kofiItems.length === 0) return
    const interval = window.setInterval(() => {
      setKofiIndex((prev) => (prev + 1) % kofiItems.length)
    }, 10000)
    return () => window.clearInterval(interval)
  }, [kofiItems.length])

  useEffect(() => {
    setKofiAnimate(true)
    const timeout = window.setTimeout(() => setKofiAnimate(false), 220)
    return () => window.clearTimeout(timeout)
  }, [kofiIndex])

  useEffect(() => {
    const supportsEmoji = (emoji: string) => {
      const canvas = document.createElement('canvas')
      canvas.width = 24
      canvas.height = 24
      const context = canvas.getContext('2d')
      if (!context) return false
      context.fillStyle = '#fff'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.font = '16px sans-serif'
      context.fillStyle = '#000'
      context.fillText(emoji, 0, 16)
      const { data } = context.getImageData(0, 0, canvas.width, canvas.height)
      const hasNonWhite = data.some((value, index) => index % 4 !== 3 && value !== 255)
      return hasNonWhite
    }

    setEmojiSupported(supportsEmoji('☕️'))
  }, [])

  return (
    <button
      type="button"
      onClick={onClick}
      className={`kofi-attention kofi-jiggle relative inline-flex h-9 w-full min-w-0 items-center justify-center gap-2 rounded-md border px-2.5 text-xs font-semibold leading-none shadow-md btn-lift sm:w-auto sm:px-3.5 sm:text-sm ${kofiAnimate ? 'kofi-resize' : ''}`}
    >
      <span className="relative z-10 flex items-center gap-1 leading-none sm:hidden">
        <span>{t('kofi.mobilePrefix')}</span>
        {emojiSupported ? (
          <span key={`emoji-mobile-${kofiIndex}`} className="kofi-emoji-pop text-base" aria-hidden="true">
            {kofiItems[kofiIndex]?.emoji ?? KOFI_ITEMS[0].emoji}
          </span>
        ) : null}
      </span>
      <span className="relative z-10 hidden items-center gap-1 leading-none sm:flex">
        <span>{t('kofi.desktopPrefix')}</span>
        <span key={`word-${kofiIndex}`} className="kofi-flip font-semibold">
          {kofiItems[kofiIndex]?.label ?? t('kofi.items.coffee')}
        </span>
        {emojiSupported ? (
          <span key={`emoji-${kofiIndex}`} className="kofi-emoji-pop ml-1.5 text-lg" aria-hidden="true">
            {kofiItems[kofiIndex]?.emoji ?? KOFI_ITEMS[0].emoji}
          </span>
        ) : null}
      </span>
    </button>
  )
}
