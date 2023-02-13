require('dotenv').config();
const path = require('path');
// ----------- DISCORD -------------

const { Client, GatewayIntentBits, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, EmbedBuilder } = require("discord.js");
const fs = require('fs')
const client = exports.client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ],
  allowedMentions: {
    parse: ["everyone", "roles", "users"],
    repliedUser: true,
  },
  partials: ["CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION", "USER"],
});

client.on("ready", () => {
  console.log("Discord Running...")
})

// BUTTON
client.on(Events.InteractionCreate, interaction => {
  if (!interaction.isButton()) return;
  if (interaction.customId === "yes") {
    const create_image = require('./image.js')
    create_image(interaction.message.embeds[0].fields[0].value, interaction.message.embeds[0].fields[3].value, async (image_name) => {
      const file = new AttachmentBuilder(`./assets/${image_name}.jpeg`);
      const embed = new EmbedBuilder()
        .addFields(
          { name: "<:chat:1009786002509938768> 內容", value: `${interaction.message.embeds[0].fields[0].value}` },
          { name: "<:announce:1009786006070890496> 狀態", value: `<:verify:1009786010365866028>` },
          { name: "<:ip:976043724691886081> IP", value: `${interaction.message.embeds[0].fields[2].value}`},
          { name: "<:clock:973788380053798986> 時間", value: `${interaction.message.embeds[0].fields[3].value}` },)
        .setColor('#2f3136')
      await interaction.message.edit({ embeds: [embed], components: [], files: [file] })
      await interaction.reply({ content: "已審核該匿名文章", ephemeral: true })

      fs.readFile('./comments.json', (err, data) => {
        if (err) {
          console.error(err)
        } else {
          var jdata = JSON.parse(data)
          jdata[image_name] = interaction.message.embeds[0].fields[0].value

          jdata = JSON.stringify(jdata)
          fs.writeFileSync('./comments.json', jdata)
        }
      })
    });
  } else if (interaction.customId === "no") {
    const embed = new EmbedBuilder()
      .addFields(
        { name: "<:chat:1009786002509938768> 內容", value: `${interaction.message.embeds[0].fields[0].value}` },
        { name: "<:announce:1009786006070890496> 狀態", value: `<a:no:1071068997363179611>` },
        { name: "<:ip:976043724691886081> IP", value: `${interaction.message.embeds[0].fields[2].value}`},
        { name: "<:clock:973788380053798986> 時間", value: `${interaction.message.embeds[0].fields[3].value}` },)
      .setColor('#2f3136')
    interaction.message.edit({ embeds: [embed], components: [] })
    interaction.reply({ content: "已審核該匿名文章", ephemeral: true })
  }
});

client.login(process.env.TOKEN)

// ----------- AUTO POST -------------

setInterval(() => {
  fs.readdir('./assets', (error, files) => {
    if (error) {
      console.error(error);
    } else if (files.length >= 8) {
      for (var i = 0; i < 2; i++) {
        fs.readdir('./assets', (error, tempfiles) => {
          if (error) {
            console.error(error);
          } else {
            const targetfiles = tempfiles.filter(file => {
              return path.extname(file).toLowerCase() === '.jpeg';
            });

            var comment_1, comment_2, comment_3, comment_4

            fs.readFile('./comments.json', async (err, file) => {
              if (err) {
                console.log(err)
              } else {
                const data = JSON.parse(file);
                comment_1 = data[path.parse(`${targetfiles[0]}`).name]
                comment_2 = data[path.parse(`${targetfiles[1]}`).name]
                comment_3 = data[path.parse(`${targetfiles[2]}`).name]
                comment_4 = data[path.parse(`${targetfiles[3]}`).name]

                var { loginAndUploadImage } = require('./upload')
                await loginAndUploadImage(`${process.env.USERNAME}`, `${process.env.PASSWORD}`, [`${__dirname}/assets/${targetfiles[0]}`, `${__dirname}/assets/${targetfiles[1]}`, `${__dirname}/assets/${targetfiles[2]}`, `${__dirname}/assets/${files[3]}`], `[匿名測試版]\n${comment_1}\n-----\n${comment_2}\n-----\n${comment_3}\n-----\n${comment_4}`)
                .then(() => {
                  try {
                    for (var k = 0; k < 4; k++) {
                      fs.unlinkSync(`./assets/${targetfiles[k]}`);
                    }
                    //file removed
                  } catch (err) {
                    console.error(err)
                  }
                })
              }
            });
          }
        })
      }
    }
  })
}, 15000)

// ----------- EXPRESS ------------

// 引入 library
const express = require('express');
const bodyParser = require('body-parser');
var multer = require('multer');
// express 引入的是一個 function
const app = express();
// 建立一個不易產生衝突的 port 用來測試
const port = 20002;

app.use(multer().array())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 如何處理不同的 request，參數分別為 url 和要執行的 function
app.post('/', (req, res) => {
  const message = req.body.message
  const date = new Date().toLocaleString('zh-TW', {
    timeZone: 'Asia/Taipei'
  });
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  console.log(message)
  res.sendStatus(200)
  // 發送至 DISCORD 
  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('yes')
        .setLabel('通過')
        .setEmoji('✅')
        .setStyle(ButtonStyle.Success),)
    .addComponents(
      new ButtonBuilder()
        .setCustomId('no')
        .setLabel('不通過')
        .setEmoji('❕')
        .setStyle(ButtonStyle.Danger),);

  const embed = new EmbedBuilder()
    .addFields(
      { name: "<:chat:1009786002509938768> 內容", value: `${message}` },
      { name: "<:announce:1009786006070890496> 狀態", value: "<a:loading:1009786009287938088>"},
      { name: "<:ip:976043724691886081> IP", value: `${ip}`},
      { name: "<:clock:973788380053798986>  時間", value: `${date}` },)
    .setColor('#2f3136')

  client.channels.cache.get('1053496390044635226').send({ embeds: [embed], components: [row] })
})

// 運行這個 port，參數分別為 port 和要執行的 function
app.listen(port, () => {
  console.log(`API Running...`)
})