const mysql = require('mysql')

class PoolPormiseify {
  constructor(pool, logger) {
    this.pool = pool
    this.logger = logger
  }

  exec(sql, args) {
    return new Promise((resolve, reject) => {
      const logable = typeof this.logger === 'function'
      const start = logable ? Date.now() : 0

      if (logable) {
        sql = mysql.format(sql, args)
        args = []
      }

      this.pool.query(sql, args, (err, res) => {
        if (logable) {
          this.logger(sql, Date.now() - start, res)
        }

        if (err) return reject(err)
        resolve(res)
      })
    })
  }

  async findAll(sql, args) {
    return await this.exec(sql, args)
  }

  async findOne(sql, args) {
    const arr = await this.findAll(sql, args)
    return arr[0] || null
  }

  async begin(fn) {
    return new Promise(async (resolve, reject) => {
      if (typeof fn !== 'function') reject(new Error('Params must be function'))

      const connect = await new Promise((resolve, reject) => {
        this.pool.getConnection((err, connect) => {
          if (err) return reject(err)
          resolve(connect)
        })
      })

      connect.beginTransaction(async err => {
        if (err) return reject(err)
        let commited = false
        let rollbacked = false
        function commit() {
          return new Promise((resolve, reject) => {
            connect.commit((err) => {
              if (err) return reject(err)
              commited = true
              resolve()
            })
          })
        }

        function rollback() {
          return new Promise((resolve) => {
            connect.rollback(() => {
              rollbacked = true
              resolve()
            })
          })
        }

        try {
          const c = new PoolPormiseify(connect, this.logger)
          delete c.begin
          const result = await fn(c, { commit, rollback })
          if (!commited && !rollbacked) await commit()
          resolve(result)
        } catch (err) {
          connect.rollback(() => {
            reject(err)
          })
        }
      })
    })
  }
}

module.exports = function createPool (config, logger) {
  return new PoolPormiseify(mysql.createPool(config), logger)
}
