//modulos externos
const inquirer = require('inquirer');
const chalk = require('chalk');

//modulos internos
const fs = require('fs');

function operation() {

    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'O que você deseja fazer?',
            choices: [
                'Criar conta',
                'Consultar saldo',
                'Depositar',
                'Sacar',
                'Sair'
            ]
        }
    ]).then((answer) => {

        const action = answer['action'];

        switch (action) {
            case "Criar conta":
                createAccount();
                break;
            case "Consultar saldo":
                getAccountBalance();
                break;
            case "Depositar":
                deposit();
                break;
            case "Sacar":
                withdraw();
                break;
            case "Sair":
                console.log(chalk.bgBlue.black('Obrigado por usar o Accounts!'));
                process.exit();
                break;
            default:
                console.log('Operação inválida');
                break;
        }
    }).catch(e => console.log(e));

}

function createAccount() {
    console.log(chalk.bgGreen.black(`Parabéns por escolher o nosso banco!`));
    console.log(chalk.green('Defina as opções da sua conta a seguir:'));

    buildAccount();
}

function buildAccount() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Digite um nome para a conta!'
        }
    ]).then((answer) => {
        const accountName = answer['accountName'];

        if (!fs.existsSync('accounts')) {
            fs.mkdirSync('accounts');
        }

        if (fs.existsSync(`accounts/${accountName}.json`)) {
            console.log(chalk.bgRed.black('Esta conta já existe, escolha outro nome!'));
            buildAccount();
            return;
        }

        fs.writeFileSync(`accounts/${accountName}.json`, '{"balance": 0}', function (e) {
            console.log(e);
        });

        console.log(chalk.green('Parabéns, a sua conta foi criada!'));
        operation();

    }).catch(e => console.log(e));
}

function deposit() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        }
    ]).then((answer) => {
        const accountName = answer['accountName'];

        if (!checkIfExists(accountName)) {
            return deposit();
        }

        inquirer.prompt([
            {
                name: 'amount',
                message: 'Quanto você deseja depositar?'
            }
        ]).then((answer) => {

            const amount = answer['amount'];

            addAmount(accountName, amount);

        }).catch(e => console.log(e));

    }).catch(e => console.log(e));
}

function checkIfExists(accountName) {
    if (!fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(chalk.bgRed.black('Esta conta não existe, tente novamente!'));
        return false;
    }

    return true;
}

function getAccount(accountName) {
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf8',
        flag: 'r'
    });

    return JSON.parse(accountJSON);
}

function addAmount(accountName, amount) {

    const accountData = getAccount(accountName);

    if (!amount) {
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'));
        return deposit();
    }

    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance);

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function (e) {
            console.log(e);
        }
    )

    console.log(chalk.green(`Foi depositado o valor de R$${amount}. Seu saldo atual é de R$${accountData.balance}`));
    return operation();
}

function getAccountBalance() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da conta?'
        }
    ]).then((answer) => {

        const accountName = answer['accountName'];

        if (!checkIfExists(accountName)) {
            return getAccountBalance();
        }

        const accountData = getAccount(accountName);
        const balance = accountData.balance;

        console.log(chalk.bgBlue.black(`Olá, seu saldo é de R$${balance}`));
        return operation();
    }).catch(e => console.log(e));
}

function withdraw() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        }
    ]).then((answer)=>{
        const accountName = answer['accountName'];

        if(!checkIfExists(accountName)){
            return withdraw();
        }

        inquirer.prompt([
            {
                name: 'amount',
                message: 'Quanto você deseja sacar?'
            }
        ]).then((answer) => {
            const amount = answer['amount'];

            removeAmount(accountName, amount);
        }).catch((e) => console.log(e));

    }).catch(e => console.log(e))
}

function removeAmount(accountName, amount){
    const accountData = getAccount(accountName);

    if(!amount){
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'));
        return withdraw();
    }   

    if(+accountData.balance < +amount){
        console.log(chalk.bgRed.black('Valor indisponível!'));
        return withdraw();
    }

    accountData.balance = +accountData.balance - +amount;

    fs.writeFileSync(`accounts/${accountName}.json`, 
        JSON.stringify(accountData),
        function(e){
            console.log(e);
        }
    )

    console.log(chalk.green(`Foi realizado um saque de R$${amount}. Seu saldo atual é de R$${accountData.balance}.`));
    return operation();
}

operation();