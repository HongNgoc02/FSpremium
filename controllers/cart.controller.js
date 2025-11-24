import { Cart, MenuItem, sequelize } from "../models/index.js"
import TryCatch from "../utils/trycatch.js"

// Lấy giỏ hàng của user
export const getCart = TryCatch(async (req, res) => {
    const { userId } = req.params

    let cart = await Cart.findOne({
        where: { user_id: userId, status: 'active' }
    })

    if (!cart) {
        cart = await Cart.create({
            user_id: userId,
            items: [],
            total: 0,
        })
    }

    const cartItems = cart.items || []
    const menuItemIds = cartItems.map(item => item.menu_item_id)

    const menuItems = await MenuItem.findAll({
        where: { id: menuItemIds },
        attributes: ['id', 'name', 'img', 'price']
    })

    const itemsWithDetails = cartItems.map(item => {
        const menuItem = menuItems.find(m => m.id === item.menu_item_id)
        return {
            menu_item_id: item.menu_item_id,
            name: menuItem?.name || 'Unknown Product',
            price: item.price,
            quantity: item.quantity,
            image: menuItem?.img || null,
            MenuItem: menuItem?.toJSON() || null
        }
    })

    const cartData = cart.toJSON()
    cartData.items = itemsWithDetails
    cartData.total = Number(cartData.total)

    res.json(cartData)
})

// Thêm sản phẩm vào giỏ hàng
export const addToCart = TryCatch(async (req, res) => {
    const { userId } = req.params
    const { menuItemId, quantity } = req.body

    if (!userId || !menuItemId || !quantity) {
        return res.status(400).json({ message: "Thiếu thông tin cần thiết!" })
    }

    const transaction = await sequelize.transaction()

    try {
        let cart = await Cart.findOne({
            where: { user_id: userId, status: 'active' },
            transaction
        })

        if (!cart) {
            cart = await Cart.create({
                user_id: userId,
                items: [],
                total: 0,
                status: 'active'
            }, { transaction })
        }

        const menuItem = await MenuItem.findByPk(menuItemId, { transaction })
        if (!menuItem) {
            await transaction.rollback()
            return res.status(404).json({ message: "Sản phẩm không tồn tại!" })
        }

        const items = cart.items || []
        const index = items.findIndex(item => item.menu_item_id === menuItemId)

        if (index >= 0) {
            items[index].quantity += Number(quantity)
        } else {
            items.push({
                menu_item_id: menuItemId,
                quantity: Number(quantity),
                price: Number(menuItem.price)
            })
        }

        await cart.update({ items }, { transaction })
        await transaction.commit()

        const updatedCart = await Cart.findOne({ where: { id: cart.id } })
        const updatedItems = updatedCart.items || []
        const menuItemIds = updatedItems.map(item => item.menu_item_id)
        const menuItems = await MenuItem.findAll({
            where: { id: menuItemIds },
            attributes: ['id', 'name', 'img', 'price']
        })

        const itemsWithDetails = updatedItems.map(item => {
            const menuItem = menuItems.find(m => m.id === item.menu_item_id)
            return {
                id: item.menu_item_id,
                name: menuItem?.name || 'Unknown Product',
                price: item.price,
                quantity: item.quantity,
                image: menuItem?.img || null
            }
        })

        const cartData = updatedCart.toJSON()
        cartData.items = itemsWithDetails
        cartData.total = Number(cartData.total)

        res.json(cartData)
    } catch (error) {
        await transaction.rollback()
        throw error
    }
})

// Cập nhật số lượng sản phẩm
export const updateCartItem = TryCatch(async (req, res) => {
    const { userId, itemId } = req.params
    const { quantity } = req.body

    if (!userId || !itemId || !quantity) {
        return res.status(400).json({ message: "Thiếu thông tin cần thiết!" })
    }

    const transaction = await sequelize.transaction()

    try {
        const cart = await Cart.findOne({
            where: { user_id: userId, status: 'active' },
            transaction
        })

        if (!cart) {
            await transaction.rollback()
            return res.status(404).json({ message: "Giỏ hàng không tồn tại!" })
        }

        const items = cart.items || []
        const index = items.findIndex(item => item.menu_item_id === Number(itemId))

        if (index === -1) {
            await transaction.rollback()
            return res.status(404).json({ message: "Sản phẩm không tồn tại trong giỏ hàng!" })
        }

        items[index].quantity = Number(quantity)
        await cart.update({ items }, { transaction })
        await transaction.commit()

        const updatedCart = await Cart.findOne({ where: { id: cart.id } })
        const updatedItems = updatedCart.items || []
        const menuItemIds = updatedItems.map(item => item.menu_item_id)
        const menuItems = await MenuItem.findAll({
            where: { id: menuItemIds },
            attributes: ['id', 'name', 'img', 'price']
        })

        const itemsWithDetails = updatedItems.map(item => {
            const menuItem = menuItems.find(m => m.id === item.menu_item_id)
            return {
                menu_item_id: item.menu_item_id,
                name: menuItem?.name || 'Unknown Product',
                price: item.price,
                quantity: item.quantity,
                image: menuItem?.img || null,
                MenuItem: menuItem?.toJSON() || null
            }
        })

        const cartData = updatedCart.toJSON()
        cartData.items = itemsWithDetails
        cartData.total = Number(cartData.total)

        res.json({ message: "Cập nhật giỏ hàng thành công!", cart: cartData })
    } catch (error) {
        await transaction.rollback()
        throw error
    }
})

// Xóa sản phẩm khỏi giỏ hàng
export const removeFromCart = TryCatch(async (req, res) => {
    const { userId, itemId } = req.params

    if (!userId || !itemId) {
        return res.status(400).json({ message: "Thiếu thông tin cần thiết!" })
    }

    const transaction = await sequelize.transaction()

    try {
        const cart = await Cart.findOne({
            where: { user_id: userId, status: 'active' },
            transaction
        })

        if (!cart) {
            await transaction.rollback()
            return res.status(404).json({ message: "Giỏ hàng không tồn tại!" })
        }

        const items = cart.items || []
        const updatedItems = items.filter(item => item.menu_item_id !== Number(itemId))

        if (updatedItems.length === items.length) {
            await transaction.rollback()
            return res.status(404).json({ message: "Sản phẩm không tồn tại trong giỏ hàng!" })
        }

        await cart.update({ items: updatedItems }, { transaction })
        await transaction.commit()

        const updatedCart = await Cart.findOne({ where: { id: cart.id } })
        const cartItems = updatedCart.items || []
        const menuItemIds = cartItems.map(item => item.menu_item_id)
        const menuItems = await MenuItem.findAll({
            where: { id: menuItemIds },
            attributes: ['id', 'name', 'img', 'price']
        })

        const itemsWithDetails = cartItems.map(item => {
            const menuItem = menuItems.find(m => m.id === item.menu_item_id)
            return {
                id: item.menu_item_id,
                name: menuItem?.name || 'Unknown Product',
                price: item.price,
                quantity: item.quantity,
                image: menuItem?.img || null
            }
        })

        const cartData = updatedCart.toJSON()
        cartData.items = itemsWithDetails
        cartData.total = Number(cartData.total)

        res.json({ message: "Xóa sản phẩm khỏi giỏ hàng thành công!", cart: cartData })
    } catch (error) {
        await transaction.rollback()
        throw error
    }
})

// Xóa toàn bộ giỏ hàng
export const clearCart = TryCatch(async (req, res) => {
    const { userId } = req.params

    const transaction = await sequelize.transaction()

    try {
        const cart = await Cart.findOne({
            where: { user_id: userId, status: 'active' },
            transaction
        })

        if (!cart) {
            await transaction.rollback()
            return res.status(404).json({ message: "Giỏ hàng không tồn tại!" })
        }

        await cart.update({ items: [], total: 0 }, { transaction })
        await transaction.commit()

        res.json({ message: "Đã xóa giỏ hàng thành công!" })
    } catch (error) {
        await transaction.rollback()
        throw error
    }
})

// Lấy số lượng sản phẩm trong giỏ hàng
export const getCartCount = TryCatch(async (req, res) => {
    const { userId } = req.params

    const cart = await Cart.findOne({
        where: { user_id: userId, status: 'active' }
    })

    const count = cart?.items?.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) || 0

    res.json({ count })
})