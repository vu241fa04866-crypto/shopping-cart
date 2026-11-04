const User = require('../models/user')

const getProduct = async (id) => {
    const productId = Number(id)
    if (!Number.isSafeInteger(productId) || productId < 1) {
        const error = new Error('Invalid product.')
        error.status = 400
        throw error
    }

    const response = await fetch(`https://dummyjson.com/products/${productId}`)
    if (response.status === 404) {
        const error = new Error('Product not found.')
        error.status = 404
        throw error
    }
    if (!response.ok) {
        throw new Error('The product catalog is temporarily unavailable.')
    }

    const product = await response.json()
    if (!product.id || !Number.isFinite(product.price) || product.price < 0) {
        throw new Error('The product catalog returned invalid product data.')
    }
    return product
}

const getAuthenticatedUser = async (userId) => {
    const user = await User.findById(userId)
    if (!user) {
        const error = new Error('User not found.')
        error.status = 401
        throw error
    }
    return user
}

const handleError = (res, error) => {
    console.error(error)
    return res.status(error.status || 500).json({
        success: false,
        message: error.status ? error.message : 'Unable to complete the cart request.'
    })
}

const addToCart = async (req, res) => {
    try {
        const product = await getProduct(req.body?.id)
        const user = await getAuthenticatedUser(req.id)
        const existingProduct = user.cart.find((item) => item.id === String(product.id))
        if (existingProduct) {
            return res.status(409).json({ success: false, message: 'Already in cart.' })
        }

        user.cart.push({
            id: String(product.id),
            title: product.title,
            description: product.description,
            image: product.thumbnail,
            price: product.price,
            category: product.category,
            quantity: 1
        })
        await user.save()
        return res.status(201).json({ success: true, message: 'Added to cart.' })
    } catch (error) {
        return handleError(res, error)
    }
}

const removeFromCart = async (req, res) => {
    try {
        const user = await getAuthenticatedUser(req.id)
        const productIndex = user.cart.findIndex((item) => item.id === req.params.id)
        if (productIndex === -1) {
            return res.status(404).json({ success: false, message: 'Item not found.' })
        }

        user.cart.splice(productIndex, 1)
        await user.save()
        return res.status(200).json({ success: true, message: 'Item removed from cart.' })
    } catch (error) {
        return handleError(res, error)
    }
}

const updateQuantity = async (req, res, direction) => {
    try {
        const user = await getAuthenticatedUser(req.id)
        const item = user.cart.find((cartItem) => cartItem.id === req.params.id)
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found.' })
        }

        if (direction < 0 && item.quantity <= 1) {
            return res.status(400).json({ success: false, message: 'Quantity cannot be less than one.' })
        }
        if (direction > 0 && item.quantity >= 99) {
            return res.status(400).json({ success: false, message: 'Maximum quantity is 99.' })
        }

        item.quantity += direction
        await user.save()
        return res.status(200).json({ success: true, message: 'Quantity updated.' })
    } catch (error) {
        return handleError(res, error)
    }
}

const incrementQuantity = (req, res) => updateQuantity(req, res, 1)
const decrementQuantity = (req, res) => updateQuantity(req, res, -1)

const checkOut = async (req, res) => {
    try {
        if (!process.env.STRIPE_KEY) {
            return res.status(503).json({
                success: false,
                message: 'Checkout is not configured. Add STRIPE_KEY to the server environment.'
            })
        }
        if (!process.env.ORIGIN) {
            return res.status(503).json({
                success: false,
                message: 'Checkout is not configured. Add ORIGIN to the server environment.'
            })
        }

        const user = await getAuthenticatedUser(req.id)
        if (user.cart.length === 0) {
            return res.status(400).json({ success: false, message: 'Your cart is empty.' })
        }
        if (user.cart.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99)) {
            return res.status(400).json({ success: false, message: 'Your cart contains an invalid quantity.' })
        }

        const products = await Promise.all(user.cart.map((item) => getProduct(item.id)))
        const lineItems = products.map((product, index) => ({
            price_data: {
                currency: 'usd',
                product_data: { name: product.title },
                unit_amount: Math.round(product.price * 100)
            },
            quantity: user.cart[index].quantity
        }))

        const Stripe = require('stripe')
        const stripe = new Stripe(process.env.STRIPE_KEY)
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            line_items: lineItems,
            success_url: `${process.env.ORIGIN.split(',')[0].trim()}/success`,
            cancel_url: `${process.env.ORIGIN.split(',')[0].trim()}/cancel`
        })
        return res.status(200).json({ success: true, url: session.url })
    } catch (error) {
        return handleError(res, error)
    }
}

const clearCart = async (req, res) => {
    try {
        const user = await getAuthenticatedUser(req.id)
        user.cart = []
        await user.save()
        return res.status(200).json({ success: true, message: 'Cart cleared.' })
    } catch (error) {
        return handleError(res, error)
    }
}

module.exports = {
    addToCart,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    checkOut,
    clearCart
}
