const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function sendJSON(res, data, status = 200) {
    // Add CORS headers to response
    const headers = {
        'Content-Type': 'application/json',
        ...corsHeaders
    };

    res.writeHead(status, headers);
    res.end(JSON.stringify(data));
}

function sendError(res, message, status = 400) {
    const headers = {
        'Content-Type': 'application/json',
        ...corsHeaders
    };

    res.writeHead(status, headers);
    res.end(JSON.stringify({ error: message }));
}

function getTodayISO() {
    return new Date().toISOString().split('T')[0];
}

module.exports = {
    corsHeaders,
    sendJSON,
    sendError,
    getTodayISO
};
