import  "dotenv/config"
import { BuildApp } from "./app.js"

const app = await BuildApp()
const port = 3333

try {
  await app.listen({
    port,
    host: '0.0.0.0'
  })

  app.log.info(`Nex Running on ${port}`)
} catch(error) {
  app.log.error(error)
  process.exit(1)
} 