const discord = require("discord.js");
const core = require("@actions/core");
const MAX_MESSAGE_LENGTH = 128;

module.exports.send = (
  payload,
  runNumber,
  runUrl,
  webhookUrl,
  status,
  color
) => {
  const commits = payload.commits;
  const branch = payload.ref_name;
  const repoUrl = payload.repository.html_url;
  const compareUrl = payload.compare;

  if (commits.length === 0) {
    core.warning(`Aborting analysis, found no commits.`);
    return Promise.resolve();
  }

  core.debug(`Received payload: ${JSON.stringify(payload, null, 2)}`);
  core.debug(`Received ${commits.length} commits...`);
  core.info("Constructing Embed...");

  let latest = commits[0];

  // the avatar of the GitHub Actions user
  const avatarUrl = "https://avatars.githubusercontent.com/u/44036562";

  let embed = new discord.MessageEmbed()
    .setURL(repoUrl)
    .setColor(color)
    .setTitle(payload.repository.full_name)
    .setDescription(
      `**Branch:** [${branch}](${repoUrl}/tree/${branch})\n` +
      `**Run:** [${runNumber}](${runUrl})\n` +
      `**Status:** ${status.toLowerCase()}\n` +
      `**[Changes](${compareUrl}):**\n` +
      getChangeLog(payload)
    )
    .setTimestamp(Date.parse(latest.timestamp));

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
    if (i > 5) {
      changelog += `+ ${commits.length - i} more...\n`;
      break;
    }

    let commit = commits[i];
    const username = commit.author.username;

    let sha = commit.id.substring(0, 6);
    let message =
      commit.message.length > MAX_MESSAGE_LENGTH
        ? commit.message.substring(0, MAX_MESSAGE_LENGTH) + "..."
        : commit.message;
    changelog += `[\`${sha}\`](${commit.url}) ${message} by _@${username}_\n`;
  }

  return changelog;
}
