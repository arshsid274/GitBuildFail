require("dotenv").config();
const express = require("express");
const axios = require("axios").default;

const app = express();
const port = 3000;

app.use(express.json());

app.get("/", (req, res) => res.send(`
  <html>
    <head><title>Success!</title></head>
    <body>
      <h1>You did it!</h1>
      <img src="https://media.giphy.com/media/XreQmk7ETCak0/giphy.gif" alt="Cool kid doing thumbs up" />
    </body>
  </html>
`));

app.post("/github", (req, res) => {
  const content = ":wave: Hi mom!";
  const avatarUrl = req.body.deployment_status.creator.avatar_url;
  const state = req.body.deployment_status.state;
  const repoName = req.body.repository.name;
  const environment = req.body.deployment_status.environment;
  const description = req.body.deployment_status.description;
  
  // Set color based on deployment state
  let color = 0x00ff00; // Green for success
  if (state === 'failure') {
    color = 0xff0000; // Red for failure
  } else if (state === 'pending') {
    color = 0xffff00; // Yellow for pending
  }
  
  axios
    .post(process.env.DISCORD_WEBHOOK_URL, {
      content: content,
      embeds: [
        {
          title: `Deployment ${state.toUpperCase()} - ${repoName}`,
          description: `**Environment:** ${environment}\n**Status:** ${state}\n**Description:** ${description}`,
          color: color,
          thumbnail: {
            url: avatarUrl,
          },
          url: req.body.deployment_status.target_url,
        },
      ],
    })
    .then((discordResponse) => {
      console.log("Success!");
      res.status(204).send();
    })
    .catch((err) => console.error(`Error sending to Discord: ${err}`));
});

app.use((error, req, res, next) => {
  res.status(500)
  res.send({error: error})
  console.error(error.stack)
  next(error)
})

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
