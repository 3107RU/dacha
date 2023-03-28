export default {
    // socket.io
    ERROR: 'error',                         // Error in connection
    PING: 'ping',                           // Got ping packet from server
    RECONNECT: 'reconnect',                 // Successfully reconnected
    RECONNECT_ATTEMPT: 'reconnect_attempt', // Starting to reconnect
    RECONNECT_ERROR: 'reconnect_error',     // Error while reconnect
    RECONNECT_FAILED: 'reconnect_failed',   // Give up reconnecting
    
    // dacha
    HELLO: 'hello',                             // First message
    BYE: 'bye',                                 // Last message
    ONVIF_DISCOVERY: 'onvif-discovery',          // Onvif discovery
    ONVIF_DEVICE_CONFIG: 'onvif-device-config',   // Onvif device config
}

