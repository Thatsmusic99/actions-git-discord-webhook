const discord = require("discord.js");
const core = require("@actions/core");
const MAX_MESSAGE_LENGTH = 128;

module.exports.send = (
  payload,
  runNumber,
  runUrl,
  webhookUrl,
  status,
  hideLinks,
  censorUsername,
  color
) => {
  const commits = payload.commits;
  const branch = payload.ref.split("/")[payload.ref.split("/").length - 1];
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

  let embed = new discord.MessageEmbed()
    .setColor(color)
    .setTitle(payload.repository.full_name)
    .setDescription(
      `**Branch:** [${branch}](${repoUrl}/tree/${branch})` +
      `**Run:** [${runNumber}](${runUrl})` +
      `**Status:** ${status.toLowerCase()}` +
      `**[Changes](${compareUrl}):**` +
      getChangeLog(payload, hideLinks, censorUsername)
    )
    .setTimestamp(Date.parse(latest.timestamp));

  if (!hideLinks) {
    embed.setURL(repoUrl);
  }

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
        embeds: [embed]
      })
      .then((result) => {
        core.info("Successfully sent the message!");
        resolve(result);
      })
      .catch((error) => reject(error));
  });
};

function getChangeLog(payload, hideLinks, censorUsername) {
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
    const username = censorUsernameIfNeeded(commit, censorUsername);
    const repository = payload.repository;

    if (commit.message.includes(repository.full_name) && hideLinks) {
      const firstRepository = repository.full_name[0];
      const lastRepository =
        repository.full_name[repository.full_name.length - 1];
      commit.message = commit.message.replaceAll(repository.full_name, `${firstRepository}...${lastRepository}`);
    }

    let sha = commit.id.substring(0, 6);
    let message =
      commit.message.length > MAX_MESSAGE_LENGTH
        ? commit.message.substring(0, MAX_MESSAGE_LENGTH) + "..."
        : commit.message;
    changelog += !hideLinks
      ? `[\`${sha}\`](${commit.url}) ${message} by _@${username}_\n`
      : `\`${sha}\` ${message}  by _@${username}_\n`;
  }

  return changelog;
}

function censorUsernameIfNeeded(commit, censorUsername) {
  const username = commit.author.username;
  if (!censorUsername) return username;

  const firstUsernameChar = username[0];
  const lastUsernameChar = username[username.length - 1];
  return `${firstUsernameChar}...${lastUsernameChar}`;
}
