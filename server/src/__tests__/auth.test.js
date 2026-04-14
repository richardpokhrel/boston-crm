const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const User = require('../models/User')

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/boston_crm_test')
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
})

beforeEach(async () => {
  await User.deleteMany({})
})

describe('Auth Routes', () => {
  const adminUser = {
    fullName: 'Test Admin',
    email: 'admin@test.com',
    password: 'Admin@123!',
    role: 'admin',
  }

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      await User.create(adminUser)

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: adminUser.email, password: adminUser.password })

      expect(res.statusCode).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.accessToken).toBeDefined()
      expect(res.body.data.user.email).toBe(adminUser.email)
      expect(res.body.data.user.password).toBeUndefined()
    })

    it('should reject invalid password', async () => {
      await User.create(adminUser)

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: adminUser.email, password: 'WrongPassword1!' })

      expect(res.statusCode).toBe(401)
      expect(res.body.success).toBe(false)
    })

    it('should reject non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@test.com', password: 'Admin@123!' })

      expect(res.statusCode).toBe(401)
    })

    it('should return 400 for missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@test.com' })

      expect(res.statusCode).toBe(400)
    })
  })

  describe('GET /api/auth/me', () => {
    it('should return current user when authenticated', async () => {
      await User.create(adminUser)

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: adminUser.email, password: adminUser.password })

      const token = loginRes.body.data.accessToken

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)

      expect(res.statusCode).toBe(200)
      expect(res.body.data.user.email).toBe(adminUser.email)
    })

    it('should reject unauthenticated requests', async () => {
      const res = await request(app).get('/api/auth/me')
      expect(res.statusCode).toBe(401)
    })
  })
})
