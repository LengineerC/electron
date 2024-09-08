'use strict';

const { SerialPort } = require('serialport');
const { getCRCcode, verifyCrc4 } = require("../utils/CRC-4");
const { BUFFER_LENGTH, BUFFER_OFFSET } = require("../utils/constants");

class SerialPortClient {
    #num = 0;
    #buffer = null;
    #dataPromiseResolve = null;

    constructor() {
        try {
            this.port = new SerialPort({
                path: "COM1",
                baudRate: 9600,
                autoOpen: true,
            });
        } catch (err) {
            console.log(err);
            throw new Error("Failed to initialize serial port.");
        }
    }

    getNum() {
        console.log("Num in getter:", this.#num);

        return this.#num;
    }

    createBuffer(op, content) {
        const buff = Buffer.alloc(BUFFER_LENGTH);

        // const op = 3;
        // const content = content;
        buff.writeUint8(op, BUFFER_OFFSET.OP_OFFSET); //op num:2b
        buff.writeInt16BE(content, BUFFER_OFFSET.CONTENT_OFFSET); //content:14b
        const data = buff.readUIntBE(0, 3);

        const crcCode = getCRCcode(data);
        buff.writeInt8(crcCode, BUFFER_OFFSET.CRC_OFFSET);

        this.#buffer = buff;
    }

    handleData(data) {
        let bNumStr = data.reduce((s, byte) => {
            return s + byte.toString(16).padStart(2, '0') + ' ';
        }, '').substring(0, BUFFER_LENGTH * 8);
        console.log(`received data: ${bNumStr}`);

        const op = data.readUInt8(BUFFER_OFFSET.OP_OFFSET);
        const content = data.readInt16BE(BUFFER_OFFSET.CONTENT_OFFSET);
        const crcCode = data.readInt8(BUFFER_OFFSET.CRC_OFFSET);

        // console.log(op, content, crcCode);
        console.log("verify CRC-4: " + verifyCrc4(data.readUIntBE(0, 3), crcCode));

        if (op > 4) {
            console.error("Invaild operation");
        }

        let oldValue = this.#num;
        switch (op) {
            case 0:
                oldValue += content;
                break;

            case 1:
                oldValue -= content;
                break;

            case 2:
                oldValue *= content;
                break;

            case 3:
                if (content !== 0)
                    oldValue /= content;
                break;

            case 4:
                oldValue = content;
                break;
        }
        this.#num = oldValue;
        if (this.#dataPromiseResolve) {
            this.#dataPromiseResolve(this.#num);
            this.#dataPromiseResolve = null;
        }
    }

    async sendBuffer(op, content) {
        // const BUFFER_LENGTH = 18;
        // const buff = Buffer.alloc(BUFFER_LENGTH);

        // const op = 3;
        // const content = 8191;
        // buff.writeUint8(op, 0); //op num:2b
        // buff.writeInt16BE(content, 1); //content:14b
        // const data = buff.readUIntBE(0, 3);

        // const crcCode = getCRCcode(data);
        // buff.writeInt8(crcCode, 17);
        this.createBuffer(op, content)
        return new Promise((resolve, reject) => {
            this.#dataPromiseResolve = resolve;

            this.port.write(this.#buffer, 'binary', err => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
            });

            this.#buffer = null;
        });
    }

    openClientPort() {
        try {
            this.port.on("data", (data) => {
                this.handleData(data);
            });
        } catch (err) {
            console.log(err);
        }
    }

}

module.exports = SerialPortClient;