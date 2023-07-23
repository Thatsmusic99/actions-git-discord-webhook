const discord = require("discord.js");
const core = require("@actions/core");
const MAX_SUBJECT_LENGTH = 72;

module.exports.send = (
  payload,
  branchName,
  runNumber,
  runUrl,
  webhookUrl,
  status,
  color
) => {
  const commits = payload.commits;
  const compareUrl = payload.compare;

  if (commits.length === 0) {
    core.warning(`Aborting analysis, found no commits.`);
    return Promise.resolve();
  }

  core.debug(`Received payload: ${JSON.stringify(payload, null, 2)}`);
  core.debug(`Received ${commits.length} commits...`);
  core.info("Constructing Embed...");
  core.info(`Color chosen: ${color}`)

  // the avatar of the GitHub Actions user
  const avatarUrl = "https://avatars.githubusercontent.com/u/9919";

  let embed = new discord.EmbedBuilder()
    .setURL(runUrl)
    .setColor(color)
    .setTitle(`${payload.repository.name} #${runNumber}`)
    .setDescription(
      `**Build:** [${runNumber}](${runUrl})\n` +
      `**Status:** ${status.toLowerCase()}\n` +
      `**[Changes](${compareUrl}):**\n` +
      getChangeLog(payload)
    );

  return new Promise((resolve, reject) => {
    let client;
    core.info("Preparing Discord webhook client...");

    try {
      client = new discord.WebhookClient({ url: webhookUrl });
    } catch (error) {
      reject(error);
    }

    core.info("Sending webhook message...");

    return client
      .send({
        avatarURL: avatarUrl,
        embeds: [embed],
      })
      .then((result) => {
        core.info("Successfully sent the message!");
        resolve(result);
      })
      .catch((error) => reject(error));
  });
};

function getChangeLog(payload) {
  core.info("Constructing Changelog...");
  const commits = payload.commits;

  if (commits.length === 0) {
    return "_No changes._";
  }

  let changelog = "";

  for (let i in commits) {
    if (i > 10) {
      changelog += `+ ${commits.length - i} more...\n`;
      break;
    }

    let commit = commits[i];
    const username = commit.author.username;

    let sha = commit.id.substring(0, 6);

    // only keep the first line, the commit message subject
    let message = commit.message.match(/^.*$/m)[0];
    if (message.length > MAX_SUBJECT_LENGTH) {
      message = message.substring(0, MAX_SUBJECT_LENGTH) + "...";
    }

    changelog += `- [\`${sha}\`](${commit.url}) ${message} - ${username}\n`;
  }

  return changelog;
}
