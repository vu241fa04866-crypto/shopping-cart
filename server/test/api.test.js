const { after, before, test } = require('node:test')
const assert = require('node:assert/strict')

process.env.JWT_SECRET = 'test-secret-that-is-long-enough'
const { app } = require('../index')

let server
let baseUrl

before(async () => {
    server = app.listen(0)
    await new Promise((resolve) => server.once('listening', resolve))
    baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
    await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve())
    })
})

test('health endpoint reports that the API is running', async () => {
    const response = await fetch(baseUrl)
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), {
        success: true,
        message: 'Shopping Cart API is running.'
    })
})

test('protected cart routes require an authenticated session', async () => {
    const response = await fetch(`${baseUrl}/api/cart/clear`)
    assert.equal(response.status, 401)
    assert.equal((await response.json()).success, false)
})

test('Google sign-in rejects a missing credential', async () => {
    const response = await fetch(`${baseUrl}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    })
    assert.equal(response.status, 400)
    assert.equal((await response.json()).success, false)
})

test('malformed JSON receives a client error', async () => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{invalid'
    })
    assert.equal(response.status, 400)
    assert.equal((await response.json()).message, 'Request body must contain valid JSON.')
})

test('unapproved browser origins are rejected', async () => {
    const response = await fetch(`${baseUrl}/`, {
        headers: { Origin: 'https://not-allowed.example' }
    })
    assert.equal(response.status, 403)
})

test('unknown routes return a JSON not-found response', async () => {
    const response = await fetch(`${baseUrl}/api/not-a-route`)
    assert.equal(response.status, 404)
    assert.deepEqual(await response.json(), {
        success: false,
        message: 'Route not found.'
    })
})
