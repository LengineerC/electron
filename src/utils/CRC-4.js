const CRC_MODEL = 0b0011;

function getCRCcode(data){
    let crc = 0;
    for (let i = 15; i >= 0; i--) {
        let bit = ((data >> i) & 1) ^ ((crc >> 3) & 1);
        crc = ((crc << 1) & 0xF) | bit;
        if (bit) {
            crc ^= CRC_MODEL;
        }
    }
    return crc & 0xF;
}

function verifyCrc4(data, crc){
    return getCRCcode(data) === crc;
}

exports.getCRCcode=getCRCcode;
exports.verifyCrc4=verifyCrc4;