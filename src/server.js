const { PORT } = require('./config')
const app = require('./app')

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})
