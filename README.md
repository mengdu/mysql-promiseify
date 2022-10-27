# mysql-promiseify

```sh
npm install myqsl mysql-promiseify
```

## Example

```js
const mysql = require('./')

const p = mysql({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '123456',
  database: 'test'
}, function (sql, ts) {
  console.log(`[SQL]: ${sql} - ${ts}ms`)
})

async function main() {
  const dbs = await p.exec('show databases')
  console.log(dbs)
  const tables = await p.exec('show tables')
  console.log(tables)

  await p.exec(`CREATE TABLE t_test (
    id int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
      count int(11) NULL DEFAULT 0,
      PRIMARY KEY (id)
    )`)
  await p.exec('insert into t_test(count) values(100),(200),(300)')
  const list = await p.findAll('select * from t_test')
  console.log(list)
  const data = await p.findOne('select * from t_test limit 1')
  console.log(data)

  const result = await p.begin(async (c, { rollback }) => {
    await c.exec('update t_test set count = count - 100 where id = ?', [1])
    await c.exec('update t_test set count = count + 100 where id = ?', [2])
    // await rollback()
    return { ok: 1 }
  })
  console.log(result)
  const arr = await p.findAll('select * from t_test')
  console.log(arr)
  await p.exec('drop table t_test')
  p.pool.end()
}

main()
```
