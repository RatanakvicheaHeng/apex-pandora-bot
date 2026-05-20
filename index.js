require('dotenv').config();

const {
  Client,
  GatewayIntentBits
} = require('discord.js');

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource
} = require('@discordjs/voice');

const googleTTS = require('google-tts-api');
const https = require('https');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent
  ]
});

let lastSpeech = '';
let personality = 'normal';

client.once('ready', () => {
  console.log('Apex Pandora Bot បានដំណើរការ​ហើយ');
});

// 🔊 function និយាយភាសាខ្មែរ
function speakKhmer(message, text) {

  const voiceChannel = message.member.voice.channel;

  if (!voiceChannel) {
    return message.reply('សូមចូល voice channel សិន។');
  }

  // personality
  if (personality === 'funny') text = 'ហាហា 😂 ' + text;
  if (personality === 'cute') text = '🥺 ' + text;
  if (personality === 'angry') text = '😡 ' + text.toUpperCase();
  if (personality === 'robot') text = '🤖 ' + text;
  if (personality === 'khmer-uncle') text = 'អាហ្នឹងណា... ' + text;

  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: message.guild.id,
    adapterCreator: message.guild.voiceAdapterCreator
  });

  const url = googleTTS.getAudioUrl(text, {
    lang: 'km',
    slow: false,
    host: 'https://translate.google.com',
  });

  const player = createAudioPlayer();

  https.get(url, (res) => {
    const resource = createAudioResource(res);
    player.play(resource);
    connection.subscribe(player);
  });
}

// 🔊 sound effect
function playSound(message, fileName) {

  const voiceChannel = message.member.voice.channel;

  if (!voiceChannel) {
    return message.reply('សូមចូល voice channel សិន។');
  }

  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: message.guild.id,
    adapterCreator: message.guild.voiceAdapterCreator
  });

  const player = createAudioPlayer();

  const resource = createAudioResource(`./sounds/${fileName}`);

  player.play(resource);
  connection.subscribe(player);
}

client.on('messageCreate', async (message) => {

  if (message.author.bot) return;

  // 🗣️ speak command
  if (message.content.startsWith('!speak ')) {

    const text = message.content.replace('!speak ', '');

    lastSpeech = text;

    speakKhmer(message, text);

    message.reply('ខ្ញុំកំពុងនិយាយភាសាខ្មែរ...');
  }

  // 🔁 repeat
  if (message.content === '!repeat') {

    if (!lastSpeech) {
      return message.reply('មិនទាន់មានអ្វីឲ្យ repeat ទេ។');
    }

    speakKhmer(message, lastSpeech);

    message.reply('ខ្ញុំកំពុងនិយាយម្ដងទៀត...');
  }

  // 🎭 mode
  if (message.content.startsWith('!mode ')) {

    personality = message.content.replace('!mode ', '');

    message.reply(`បានប្ដូរ personality ទៅជា: ${personality}`);
  }

  // 😂 sound effects
  if (message.content === '!laugh') {
    playSound(message, 'laugh.mp3');
  }

  if (message.content === '!bruh') {
    playSound(message, 'bruh.mp3');
  }

  if (message.content === '!boom') {
    playSound(message, 'boom.mp3');
  }

  // ❓ help
  if (message.content === '!help') {

    message.reply(`
📌 ពាក្យបញ្ជា:

!speak <អត្ថបទខ្មែរ>
!repeat
!mode normal / funny / cute / angry / robot / khmer-uncle

🔊 sound effects:
!laugh
!bruh
!boom
    `);
  }

});

client.login(process.env.TOKEN);