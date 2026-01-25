import { useEffect, useState } from 'react'

const KOFI_ITEMS = [
  { label: 'a tiny plant', emoji: '🪴' },
  { label: 'an ice cream', emoji: '🍦' },
  { label: 'a coffee', emoji: '☕️' },
  { label: 'a donut', emoji: '🍩' },
  { label: 'a mango', emoji: '🥭' },
  { label: 'some sushi', emoji: '🍣' },
  { label: 'dim sum', emoji: '🥟' },
  { label: 'an IKEA flatpack', emoji: '📦' },
  { label: 'an energy drink', emoji: '🥤' },
  { label: 'a potato', emoji: '🥔' },
  { label: 'a pair of socks', emoji: '🧦' },
  { label: 'some yarn', emoji: '🧶' },
  { label: 'a filament roll', emoji: '🧵' },
  { label: 'a game', emoji: '🎮' },
  { label: 'a taco', emoji: '🌮' },
  { label: 'some ramen', emoji: '🍜' },
  { label: 'a beer', emoji: '🍺' },
  { label: 'a full charge', emoji: '🔋' },
  { label: 'a beard trim', emoji: '🧔' },
]

interface KofiButtonProps {
  onClick: () => void
}

const shuffleItems = (items: typeof KOFI_ITEMS) => {
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function KofiButton({ onClick }: KofiButtonProps) {
  const [kofiItems] = useState(() => shuffleItems(KOFI_ITEMS))
  const [kofiIndex, setKofiIndex] = useState(0)
  const [emojiSupported, setEmojiSupported] = useState(false)
  const [kofiAnimate, setKofiAnimate] = useState(false)

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
      className={`kofi-attention kofi-jiggle relative inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold leading-none shadow-md btn-lift ${kofiAnimate ? 'kofi-resize' : ''}`}
    >
      <span className="kofi-glare-secondary" aria-hidden="true" />
      <span className="relative z-10 flex items-center gap-1 leading-none">
        <span>Buy me</span>
        <span key={`word-${kofiIndex}`} className="kofi-flip font-semibold">
          {kofiItems[kofiIndex]?.label ?? KOFI_ITEMS[0].label}
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
