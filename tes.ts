import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { prisma } from '../../lib/db'

const product = new Hono()

// ==============================
// Schema validasi
// ==============================
const productSelect = {
  id: true,
  name: true,
  description: true,
  imageUrl: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
})

// ==============================
// GET /products
// ==============================
product.get('/', async (c) => {
  const user = c.get('user')

  const products = await prisma.product.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    select: productSelect,
  })

  return c.json(products)
})

// ==============================
// GET /products/:id
// ==============================
product.get('/:id', async (c) => {
  const user = c.get('user')
  const id = parseInt(c.req.param('id'))

  const found = await prisma.product.findFirst({
    where: { id, userId: user.id },
    select: productSelect,
  })

  if (!found) return c.json({ error: 'Product not found' }, 404)

  return c.json(found)
})

// ==============================
// POST /products
// ==============================
product.post('/', zValidator('json', productSchema), async (c) => {
  const user = c.get('user')
  const { name, description, imageUrl } = c.req.valid('json')

  const existing = await prisma.product.findFirst({
    where: { name, userId: user.id },
    select: { id: true },
  })

  if (existing) return c.json({ error: 'Product already exists' }, 409)

  const created = await prisma.product.create({
    data: { name, description, imageUrl, userId: user.id },
    select: productSelect,
  })

  return c.json(created, 201)
})

// ==============================
// PUT /products/:id
// ==============================
product.put('/:id', zValidator('json', productSchema), async (c) => {
  const user = c.get('user')
  const id = parseInt(c.req.param('id'))
  const { name, description, imageUrl } = c.req.valid('json')

  const existing = await prisma.product.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  })

  if (!existing) return c.json({ error: 'Product not found' }, 404)

  const updated = await prisma.product.update({
    where: { id },
    data: { name, description, imageUrl },
    select: productSelect,
  })

  return c.json(updated)
})

// ==============================
// DELETE /products/:id
// ==============================
product.delete('/:id', async (c) => {
  const user = c.get('user')
  const id = parseInt(c.req.param('id'))

  const existing = await prisma.product.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  })

  if (!existing) return c.json({ error: 'Product not found' }, 404)

  await prisma.product.delete({ where: { id } })

  return c.json({ message: 'Product deleted successfully' })
})

export default product