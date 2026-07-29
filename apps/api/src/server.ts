// if we are running in development, we can access .env anywhere

import app from "./app"


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Listening on port 3000");
});

