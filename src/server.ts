import app from "./app"
import config from "./config/dotenv"
import { initDB } from "./database"

const port = config.port

const main = () => {
    initDB()
    app.listen(port, () => {
    console.log(`DEVPULSE app listening on port ${port}`)
})
}

main()