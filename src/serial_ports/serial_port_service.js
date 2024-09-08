'use strict';

const { SerialPort } = require('serialport');
const { getCRCcode, verifyCrc4 } = require("../utils/CRC-4");
const { BUFFER_LENGTH, BUFFER_OFFSET } = require("../utils/constants");

var com2Port = null;

try {
    com2Port = new SerialPort({
        path: "COM2",
        baudRate: 9600,
        autoOpen: true,
    });
} catch (err) {
    console.log(err);
    throw new Error("Failed to initialize serial port.");
}

function handleData(data) {
    let bNumStr = data.reduce((s, byte) => {
        return s + byte.toString(16).padStart(2, '0') + ' ';
    }, '').substring(0, BUFFER_LENGTH * 8);
    console.log(`service received data: ${bNumStr}`);

    const op = data.readUInt8(BUFFER_OFFSET.OP_OFFSET);
    const content = data.readInt16BE(BUFFER_OFFSET.CONTENT_OFFSET);
    const crcCode = data.readInt8(BUFFER_OFFSET.CRC_OFFSET);

    // console.log(op, content, crcCode);
    const isMatched = verifyCrc4(data.readUIntBE(0, 3), crcCode);
    // console.log("verify CRC-4: " + isMatched);

    if (isMatched) {
        if (op > 4) {
            console.log("Invaild operation");
        }

        let n = 0;
        switch (op) {
            case 0:
                n += content;
                break;

            case 1:
                n -= content;
                break;

            case 2:
                n *= content;
                break;

            case 3:
                if (content !== 0)
                    n /= content;
                break;

            case 4:
                break;
        }
        return n;
    } else {
        console.log("CRC-4 is not matched");
    }
}

function createBuffer(op, content) {
    const BUFFER_LENGTH = 18;
    const buff = Buffer.alloc(BUFFER_LENGTH);

    // const op = 3;
    // const content = content;
    buff.writeUint8(op, 0); //op num:2b
    buff.writeInt16BE(content, 1); //content:14b
    const data = buff.readUIntBE(0, 3);

    const crcCode = getCRCcode(data);
    buff.writeInt8(crcCode, 17);

    return buff;
}

function send(buffer) {
    com2Port.write(buffer, 'binary', err => {
        if (err) {
            console.log(err);
        }
    });
}

com2Port.on("data", (data) => {
    try {
        const num = handleData(data);
        const buffer = createBuffer(4, num);

        send(buffer);
    } catch (err) {
        console.log(err);
    }
});