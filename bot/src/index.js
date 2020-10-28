require('dotenv').config()
const Telegraf = require('telegraf')

const bot = new Telegraf(process.env.TELEGRAM_TOKEN)

// Middleware per mettere in minuscolo i messaggi testuali
bot.use((ctx, next) => {
	if (Boolean(ctx.update.message.text)) {
		ctx.originalMessage = ctx.update.message.text
		ctx.update.message.text = ctx.update.message.text.toLowerCase()
		ctx.textMessage = ctx.update.message.text
	}

	next()
})

bot.start((ctx) => {
	ctx.reply('Buongiornissimo, servizio echo attivato')
})

bot.help(ctx => {
	ctx.reply('Mandami uno sticker stronzo')
})

bot.command('ciao', ctx => {
	ctx.reply('Ciao zio')
})

bot.on('text', ctx => {
	ctx.reply(`Hai scritto: ${ctx.originalMessage}`)
})

bot.on('sticker', ctx => {
	ctx.reply(`👍`)
})


bot.launch()