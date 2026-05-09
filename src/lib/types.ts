export type Photo = {
  name: string
  url: string
}

export type WindowData = {
  id: string
  typeIdx: number
  width: number
  height: number
  photo: Photo | null
  price: number
  valid: boolean
}