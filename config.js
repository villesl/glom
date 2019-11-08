var config = {}

config.endpoint = "https://glom.documents.azure.com:443/";
config.key = "==";

config.database = {
    id: 'GlomDatabase'
}

config.container = {
    id: 'GlomContainer'
}

config.items = {
    BasicDeck: {
        id: 'BasicDeck',
        zero:
        {
            count: 6,
            text: '0'
        },
        plus1:
        {
            count: 5,
            text: '1'
        },
        minus1:
        {
            count: 5,
            text: '-1'
        },
        minus2:
        {
            count: 1,
            text: '-2'
        },
        plus2:
        {
            count: 1,
            text: '2'
        },
        miss:
        {
            count: 1,
            text: 'Miss'
        },
        crit:
        {
            count: 1,
            text: 'Crit'
        }
    }
}

module.exports = config