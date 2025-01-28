const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { Api } = require("telegram");
const { Telegraf } = require("telegraf");
const input = require("input"); 

const botToken = '';
const bot = new Telegraf(botToken);

const apiId = "your API ID"; 
const apiHash = "your API Hash"; 
let stringSession = new StringSession(""); 

const adminUsername = '"AdminUSername';
const botUsername = '@BotUsername'; 

const userData = {};

let client;

async function loginClient() {
  if (!stringSession.session) {
    await client.start({
      phoneNumber: async () => await input.text("Please enter your number: "),
      password: async () => await input.text("Please enter your password: "),
      phoneCode: async () => await input.text("Please enter the code you received: "),
      onError: (err) => console.log(err),
    });
    console.log("You should now be connected.");
    console.log("Save this string for future logins:", client.session.save());
    stringSession = new StringSession(client.session.save());
  } else {
    client = new TelegramClient(stringSession, apiId, apiHash, {
      connectionRetries: 5,
    });
  }
}

(async () => {
  console.log("Loading interactive example...");

  client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await loginClient();

  bot.start((ctx) => {
    console.log('Bot started');
    
    if (!ctx.from) {
      ctx.reply('Sorry, I cannot retrieve your user information.');
      return;
    }

    if (!userData[ctx.from.id]) {
      userData[ctx.from.id] = { state: 'CHOOSING' };
    }

    ctx.reply(
      'Welcome! Please choose an option:\n\n1. Create Escrow Group\n2. Create Fund Management\n3. Create New Transaction\n4. Staking Management',
      { 
        reply_markup: {
          keyboard: [['Create Escrow', 'Fund Management'], ['Create Transaction', 'Staking']],
          one_time_keyboard: true,
        },
      }
    );
  });

  bot.hears('Create Escrow', (ctx) => {
    userData[ctx.from.id].state = 'ESCROW';
    ctx.reply('You have selected Escrow. Please provide the username of the other party (buyer/seller).');
  });

  bot.hears('Fund Management', (ctx) => {
    userData[ctx.from.id].state = 'FUND_MANAGEMENT';
    ctx.reply('You have selected Fund Management. Please specify the action (deposit, transfer, etc.).');
  });

  bot.hears('Create Transaction', (ctx) => {
    userData[ctx.from.id].state = 'CREATE_TRANSACTION';
    ctx.reply('You have selected Create Transaction. Please choose the type of transaction:\n1. Token Transfer\n2. Staking/Unstaking');
  });

  bot.hears('Staking', (ctx) => {
    userData[ctx.from.id].state = 'STAKING';
    ctx.reply('You have selected Staking. Please choose an option:\n1. Stake Tokens\n2. Unstake Tokens\n3. Claim Rewards');
  });

  bot.on('text', async (ctx) => {
    if (!ctx.from) {
      ctx.reply('Sorry, I cannot retrieve your user information.');
      return;
    }

    const userId = ctx.from.id;
    const state = userData[userId]?.state;

    if (!state) return;

    if (state === 'ESCROW') {
      const otherPartyUsername = ctx.message.text.trim();
      console.log(`User ${ctx.from.id} provided the other party username: ${otherPartyUsername}`);

      if (otherPartyUsername && otherPartyUsername.startsWith('@')) {
        userData[userId].otherParty = otherPartyUsername;

        ctx.reply('Please provide your wallet address (e.g., Ethereum address)');
        userData[userId].state = 'PROVIDE_WALLET';
      } else {
        ctx.reply('Invalid username. Please provide a valid username starting with "@".');
      }
    }

    if (state === 'PROVIDE_WALLET') {
      const walletAddress = ctx.message.text.trim();
      console.log(`User ${ctx.from.id} provided wallet address: ${walletAddress}`);

      if (!userData[userId].walletAddress) {
        userData[userId].walletAddress = walletAddress; 
        ctx.reply(`Your wallet address has been saved: ${walletAddress}`);
        
        const otherPartyUsername = userData[userId].otherParty;
        const groupName = `Escrow-Group_${ctx.from.id}-${otherPartyUsername}`;
        
        try {
          const result = await client.invoke(
            new Api.messages.CreateChat({
              title: groupName,
              users: [ctx.from.id, otherPartyUsername, adminUsername, botUsername], 
            })
          );

          console.log(`Group "${groupName}" created successfully!`);
          ctx.reply(`Group "${groupName}" has been created. Members:\n1. ${ctx.from.username}\n2. ${otherPartyUsername}\n3. ${adminUsername}\n4. ${botUsername}`);
          ctx.reply(`Here is the invite link to your group: https://t.me/${groupName}`);
          
          delete userData[userId];
        } catch (error) {
          console.error("Error creating group:", error);
          ctx.reply('There was an issue creating the group. Please try again.');
        }
      } else {
        ctx.reply('Your wallet address is already stored.');
      }
    }
    
    if (state === 'FUND_MANAGEMENT') {
      const action = ctx.message.text.trim().toLowerCase();

      if (action === 'deposit') {
        ctx.reply('Please provide the amount to deposit.');
        userData[userId].state = 'DEPOSIT';
      } else if (action === 'transfer') {
        ctx.reply('Please provide the recipient address and amount.');
        userData[userId].state = 'TRANSFER';
      }
    }

    if (state === 'CREATE_TRANSACTION') {
      const action = ctx.message.text.trim().toLowerCase();

      if (action === 'token transfer') {
        ctx.reply('Please provide the recipient address and amount for the token transfer.');
        userData[userId].state = 'TOKEN_TRANSFER';
      } else if (action === 'staking/unstaking') {
        ctx.reply('Please choose an option:\n1. Stake Tokens\n2. Unstake Tokens');
        userData[userId].state = 'STAKE_UNSTAKE';
      }
    }

    if (state === 'STAKING') {
      const action = ctx.message.text.trim().toLowerCase();

      if (action === 'stake tokens') {
        ctx.reply('Please provide the amount to stake.');
        userData[userId].state = 'STAKE';
      } else if (action === 'unstake tokens') {
        ctx.reply('Please provide the amount to unstake.');
        userData[userId].state = 'UNSTAKE';
      } else if (action === 'claim rewards') {
        ctx.reply('Claiming rewards...');
       
      }
    }
  });

  bot.command('cancel', (ctx) => {
    console.log(`User ${ctx.from.id} canceled the operation.`);
    
    if (!ctx.from) {
      ctx.reply('Sorry, I cannot retrieve your user information.');
      return;
    }

    delete userData[ctx.from.id];
    ctx.reply('Operation canceled.');
  });

  // Start the bot
  bot.launch().then(() => {
    console.log('Bot is running...');
  });

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
})();
