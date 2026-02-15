import { neon } from '@neondatabase/serverless';
const sql = neon(import.meta.env.VITE_DATABASE_URL);

export interface Product {
  id: number
  name: string
  description: string | null
  buy_price: number
  sell_price: number
  image_url: string | null
  category: string | null
  stock: number
}

export interface Order {
  id: number
  product_id: number
  product_name: string
  buy_price: number
  sell_price: number
  quantity: number
  customer_name: string
  customer_phone: string
  customer_location: string
  status: string
  order_date: string
}

export async function getProducts(): Promise<Product[]> {
  const result = await sql`SELECT * FROM products ORDER BY created_at DESC`;
  return result as Product[];
}

export async function createOrder(
  productId: number, 
  productName: string,
  buyPrice: number,
  sellPrice: number,
  customerName: string, 
  customerPhone: string, 
  customerLocation: string,
  quantity: number = 1
): Promise<Order> {
  const result = await sql`
    INSERT INTO orders (product_id, product_name, buy_price, sell_price, quantity, customer_name, customer_phone, customer_location, status)
    VALUES (${productId}, ${productName}, ${buyPrice}, ${sellPrice}, ${quantity}, ${customerName}, ${customerPhone}, ${customerLocation}, 'pending')
    RETURNING *
  `;
  return result[0] as Order;
}