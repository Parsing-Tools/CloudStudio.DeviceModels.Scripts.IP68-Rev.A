//Test: 462000015C4F0000F74A

function parseUplink(device, payload) {

    var payloadb = payload.asBytes();
    var decoded = Decoder(payloadb, payload.port)
    env.log(decoded);

   
    // Store Channel A
    if (decoded.channelA != null) {
        var sensor2 = device.endpoints.byAddress("1");

        if (sensor2 != null)
            sensor2.updateGenericSensorStatus(decoded.channelA);
    };
  // Store Channel B
    if (decoded.channelB != null) {
        var sensor3 = device.endpoints.byAddress("2");

        if (sensor3 != null)
            sensor3.updateGenericSensorStatus(decoded.channelB);
    };
}

function Decoder(bytes, fport) {
    var decoded = {};
    if (fport === 1) { 
        if (bytes[0] === 0x46) { 
            decoded.frameCode = bytes[0];
            decoded.status = bytes[1];
            decoded.channelA = ((bytes[2] << 24) | (bytes[3] << 16) | (bytes[4] << 8) | bytes[5]) >>> 0;
            decoded.channelB = ((bytes[6] << 24) | (bytes[7] << 16) | (bytes[8] << 8) | bytes[9]) >>> 0;

            // Timestamp 
            if (bytes.length >= 14) {
                decoded.timestamp = ((bytes[10] << 24) | (bytes[11] << 16) | (bytes[12] << 8) | bytes[13]) >>> 0;
            }

            return decoded;
        }
    }
    return decoded;
}

function bcdtonumber(bytes) {
    var num = 0;
    var m = 1;
    var i;
    for (i = 0; i < bytes.length; i++) {
        num += (bytes[bytes.length - 1 - i] & 0x0F) * m;
        num += ((bytes[bytes.length - 1 - i] >> 4) & 0x0F) * m * 10;
        m *= 100;
    }
    return num;
}

function bytestofloat16(bytes) {
    var sign = (bytes & 0x8000) ? -1 : 1;
    var exponent = ((bytes >> 7) & 0xFF) - 127;
    var significand = (bytes & ~(-1 << 7));

    if (exponent == 128)
        return 0.0;

    if (exponent == -127) {
        if (significand == 0) return sign * 0.0;
        exponent = -126;
        significand /= (1 << 6);
    } else significand = (significand | (1 << 7)) / (1 << 7);

    return sign * significand * Math.pow(2, exponent);
}
