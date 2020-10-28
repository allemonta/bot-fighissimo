const Telegraf = require('telegraf')
const pool = require("./db/postgres")

const bot = new Telegraf(process.env.TELEGRAM_TOKEN)

// Middleware per mettere in minuscolo i messaggi testuali
bot.use(async (ctx, next) => {
	if (Boolean(ctx.update.message) && Boolean(ctx.update.message.text)) {
		ctx.originalMessage = ctx.update.message.text
		ctx.update.message.text = ctx.update.message.text.toLowerCase()
		ctx.textMessage = ctx.update.message.text
	}

	const { id: chatId, username } = await ctx.getChat()
	ctx.username = username

	let { rows: [data] } = await pool.query(`SELECT * FROM balances WHERE telegramAccountId = '${chatId}' `)

	if (!data) {
		await pool.query(`
			INSERT INTO balances(id, telegramAccountId, balance)
			VALUES(DEFAULT, '${chatId}', 0)
			RETURNING *
		`)

		ctx.reply("NUOVO CONTO CREATO!")
		data = (await pool.query(`SELECT * FROM balances WHERE telegramAccountId = '${chatId}'`)).rows[0]
	}

	ctx.balance = data

	next()
})

bot.start((ctx) => {
	ctx.reply(`Buongiornissimo ${ctx.username}, servizio balance attivato. Usa il comando /help per avere maggiori informazioni`)
})

bot.help(ctx => {
	ctx.reply(`
		COMANDI DISPONIBILI
		\t/withdraw VALORE
		\t/deposit VALORE
		\t/balance
	`)
})

bot.command('deposit', async ctx => {
	try {
		if (ctx.originalMessage.split(" ").length != 2)
			throw new Error("Devi passare un solo parametro, ossia il valore da depositare")

		let [, value] = ctx.originalMessage.split(" ")

		if (isNaN(value))
			throw new Error("Il parametro passato deve essere un valore numerico positivo")

		value = parseInt(value)

		if (value < 0)
			throw new Error("Il parametro passato deve essere un valore numerico positivo")

		const { rows: [data] } = await pool.query(`
			UPDATE balances
			SET balance = balance + ${value}
			WHERE telegramAccountId = '${ctx.balance.telegramaccountid}'
			RETURNING *
		`)

		ctx.reply(`Hai depositato ${value}. Saldo attuale: ${data.balance}`)
	} catch (e) {
		ctx.reply(e.message)
	}
})

bot.command('withdraw', async ctx => {
	try {
		if (ctx.originalMessage.split(" ").length != 2)
			throw new Error("Devi passare un solo parametro, ossia il valore da depositare")

		let [, value] = ctx.originalMessage.split(" ")

		if (isNaN(value))
			throw new Error("Il parametro passato deve essere un valore numerico")

		value = parseInt(value)

		if (value < 0)
			throw new Error("Il parametro passato deve essere un valore numerico positivo")

		const { rows: [data] } = await pool.query(`
			UPDATE balances
			SET balance = balance - ${value}
			WHERE telegramAccountId = '${ctx.balance.telegramaccountid}'
			RETURNING *
		`)

		ctx.reply(`Hai ritirato ${value}. Saldo attuale: ${data.balance}`)
	} catch (e) {
		ctx.reply(e.message)
	}
})

bot.command('balance', async ctx => {
	try {
		ctx.reply(`Saldo attuale: ${ctx.balance.balance}`)
	} catch (e) {
		ctx.reply(e.message)
	}
})

bot.on('text', ctx => {
	ctx.reply(`NON TI RISPONDO, OK?`)
})

bot.on('sticker', ctx => {
	ctx.reply(`👍`)
})


bot.launch()