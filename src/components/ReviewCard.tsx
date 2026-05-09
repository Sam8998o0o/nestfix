'use client'

import { IconStarFilled, IconStar } from '@tabler/icons-react'

type Review = {
  initials: string
  name: string
  rating: number
  date: string
  text: string
  tags: string[]
  avatarColor: { bg: string; text: string; border: string }
}

type Props = {
  review: Review
}

export default function ReviewCard({ review }: Props) {
  return (
    <div className="bg-bg-card rounded-[14px] border border-border p-4">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border-2"
          style={{
            backgroundColor: review.avatarColor.bg,
            color: review.avatarColor.text,
            borderColor: review.avatarColor.border,
          }}
        >
          {review.initials}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-sm text-ink">{review.name}</span>
            <span className="text-xs text-ink-3 shrink-0">{review.date}</span>
          </div>

          {/* Stars */}
          <div className="flex gap-0.5 mt-0.5">
            {Array.from({ length: 5 }).map((_, i) =>
              i < review.rating ? (
                <IconStarFilled key={i} size={12} className="text-accent" />
              ) : (
                <IconStar key={i} size={12} className="text-border-2" />
              )
            )}
          </div>

          <p className="text-sm text-ink-2 mt-2 leading-relaxed">{review.text}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {review.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] bg-bg-2 text-ink-2 px-2.5 py-0.5 rounded-full border border-border"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
