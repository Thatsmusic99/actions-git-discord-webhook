const core = require("@actions/core");
const github = require("@actions/github");
const webhooks = require("./webhooks.js");

async function run() {
  let webhookUrl = core.getInput("webhook_url");
  const status = core.getInput("status");

  let payload = github.context.payload;
  let runNumber = github.context.runNumber;
  let runUrl = `${payload.repository.html_url}/actions/runs/${github.context.runId}`;

  if (!payload.ref.startsWith("refs/heads/")) {
    throw Error("I only know how to notify Discord on push")
  }
  let branchName = payload.ref.substring("refs/heads/".length)

  let color = statusColor(status);

  await webhooks.send(
    payload,
    branchName,
    runNumber,
    runUrl,
    webhookUrl,
    status,
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
