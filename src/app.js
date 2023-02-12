const core = require("@actions/core");
const github = require("@actions/github");
const webhooks = require("./webhooks.js");

async function run(): Promise<void> {
  let webhookUrl = core.getInput("webhook_url");
  const status = core.getInput("status");
  const hideLinks = core.getInput("hide_links");
  const censorUsername = core.getInput("censor_username");

  let payload = github.context.payload;
  let runNumber = github.context.runNumber;
  let runUrl = `${payload.repository.html_url}/actions/runs/${github.context.runId}`;

  let color = statusColor(status);

  await webhooks.send(
    payload,
    runNumber,
    runUrl,
    webhookUrl,
    status,
    hideLinks,
    censorUsername,
    color
  );
}

function statusColor(status) {
  switch (status) {
    case "success":
      return "DARK_GREEN";
    case "failure":
      return "DARK_RED";
    default:
      return "GREY";
  }
}

run()
  .catch((error) => {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  });
