import { Pool, PoolConfig } from 'mysql'

declare class PoolPormiseify {
  readonly pool: Pool
  
  exec (sql: string, args?: any[]): Promise<any>
  findAll (sql: string, args?: any[]): Promise<any[]>
  findOne (sql: string, args?: any[]): Promise<object | null>
  begin <T extends any>(fn: (c: Omit<PoolPormiseify, 'begin'>, util: { rollback: () => Promise<void> }) => Promise<T>): Promise<T>
}

export default function createPool (config: PoolConfig | string, logger?: (sql: string, ts: number, res: any) => void): PoolPormiseify
export {}
