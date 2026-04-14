const router = require('express').Router()
const { getUsers, getUserById, updateUser, deactivateUser } = require('../controllers/userController')
const { protect, adminOnly } = require('../middleware/auth')

router.use(protect, adminOnly)

router.get('/', getUsers)
router.get('/:id', getUserById)
router.patch('/:id', updateUser)
router.delete('/:id', deactivateUser)

module.exports = router
