import { useEffect, useState } from 'react'
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

// Pick a random index once at module load so it persists for the session
const randomIndex = Math.floor(Math.random() * KOFI_ITEMS.length)

interface KofiButtonProps {
  onClick: () => void
}

export function KofiButton({ onClick }: KofiButtonProps) {
  const { t } = useI18n()
  const item = KOFI_ITEMS[randomIndex]
  const label = t(`kofi.items.${item.key}`)
  const { emoji } = item
  const [emojiSupported, setEmojiSupported] = useState(false)

  useEffect(() => {
    const supportsEmoji = (e: string) => {
      const canvas = document.createElement('canvas')
      canvas.width = 24
      canvas.height = 24
      const context = canvas.getContext('2d')
      if (!context) return false
      context.fillStyle = '#fff'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.font = '16px sans-serif'
      context.fillStyle = '#000'
      context.fillText(e, 0, 16)
      const { data } = context.getImageData(0, 0, canvas.width, canvas.height)
      return data.some((value, index) => index % 4 !== 3 && value !== 255)
    }

    setEmojiSupported(supportsEmoji('☕️'))
  }, [])

  return (
    <button
      type="button"
      onClick={onClick}
      className="kofi-attention kofi-jiggle relative inline-flex h-9 min-w-0 items-center justify-center gap-2 rounded-md border px-2.5 text-xs font-semibold leading-none shadow-md btn-lift sm:px-3.5 sm:text-xs"
    >
      <span className="relative z-10 flex items-center gap-1 leading-none">
        <span className="font-semibold">{t('kofi.desktopPrefix')} {label}</span>
        {emojiSupported ? (
          <span className="ml-0.5 text-lg" aria-hidden="true">{emoji}</span>
        ) : null}
      </span>
    </button>
  )
}
