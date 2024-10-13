const fs = require('fs');
const path = require('path');

const AMOUNT = 25 * 1e18;
const INPUT_PATH = path.join(__dirname, '/target/input.json');

const whitelist = [
    '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
];

async function main() {
    const inputJson = createJson(whitelist, AMOUNT);
    
    fs.writeFileSync(INPUT_PATH, JSON.stringify(inputJson, null, 2));
    console.log(`DONE: The output is found at ${INPUT_PATH}`);
}

function createJson(whitelist, amount) {
    const types = ['address', 'uint'];
    const count = whitelist.length;
    
    const values = {};
    
    whitelist.forEach((address, index) => {
        values[index.toString()] = {
            '0': address,
            '1': amount.toString()
        };
    });

    return {
        types,
        count,
        values
    };
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});