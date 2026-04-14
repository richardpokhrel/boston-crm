const User = require('../models/User')
const { ApiResponse, ApiError, paginate, paginationMeta } = require('../utils/apiHelpers')

// GET /api/users  (admin)
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, isActive, search } = req.query
    const { skip, limit: lim } = paginate(page, limit)

    const filter = {}
    if (role) filter.role = role
    if (isActive !== undefined) filter.isActive = isActive === 'true'
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim).lean(),
      User.countDocuments(filter),
    ])

    return ApiResponse.paginated(res, users, paginationMeta(total, page, lim))
  } catch (err) {
    next(err)
  }
}

// GET /api/users/:id
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).lean()
    if (!user) throw ApiError.notFound('User not found')
    return ApiResponse.success(res, { user })
  } catch (err) {
    next(err)
  }
}

// PATCH /api/users/:id  (admin)
const updateUser = async (req, res, next) => {
  try {
    const allowed = ['fullName', 'phone', 'role', 'isActive', 'timezone', 'profilePictureUrl']
    const updates = {}
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f] })

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
    if (!user) throw ApiError.notFound('User not found')

    return ApiResponse.success(res, { user: user.toSafeObject() }, 'User updated')
  } catch (err) {
    next(err)
  }
}

// DELETE /api/users/:id  (admin — soft delete)
const deactivateUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      throw ApiError.badRequest('You cannot deactivate your own account')
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    )
    if (!user) throw ApiError.notFound('User not found')
    return ApiResponse.success(res, {}, 'User deactivated')
  } catch (err) {
    next(err)
  }
}

module.exports = { getUsers, getUserById, updateUser, deactivateUser }
