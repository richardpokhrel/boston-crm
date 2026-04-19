require('dotenv').config()
const mongoose = require('mongoose')
const User = require('../models/User')
const Lead = require('../models/Lead')

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB')

    // Clear existing data
    await User.deleteMany({})
    await Lead.deleteMany({})
    console.log('Cleared existing data')

    // ── Create Users ──────────────────────────────────────────────────────
    const admin = await User.create({
      fullName: 'System Administrator',
      email: 'admin@bostoncrm.com',
      password: 'Admin@123!',
      role: 'admin',
      isActive: true,
    })

    const counsellor1 = await User.create({
      fullName: 'Sarah Johnson',
      email: 'sarah@bostoncrm.com',
      password: 'Staff@123!',
      role: 'counsellor',
      phone: '+9779800000001',
      isActive: true,
      createdBy: admin._id,
    })

    const student1 = await User.create({
      fullName: 'Meera Lama',
      email: 'meera@example.com',
      password: 'Student@123!',
      role: 'student',
      phone: '+9779800000001',
      isActive: true,
      createdBy: admin._id,
    })

    const student2 = await User.create({
      fullName: 'Kolmal Oli',
      email: 'kolmal@example.com',
      password: 'Student@123!',
      role: 'student',
      phone: '+9779800000001',
      isActive: true,
      createdBy: admin._id,
    })

    const counsellor2 = await User.create({
      fullName: 'Ram Thapa',
      email: 'ram@bostoncrm.com',
      password: 'Staff@123!',
      role: 'counsellor',
      phone: '+9779800000002',
      isActive: true,
      createdBy: admin._id,
    })

    await User.create({
      fullName: 'Docs Team Member',
      email: 'docs@bostoncrm.com',
      password: 'Staff@123!',
      role: 'docs_team',
      isActive: true,
      createdBy: admin._id,
    })

    await User.create({
      fullName: 'App Team Member',
      email: 'appteam@bostoncrm.com',
      password: 'Staff@123!',
      role: 'app_team',
      isActive: true,
      createdBy: admin._id,
    })

    console.log('✅  Users created')

    // ── Create Sample Leads ───────────────────────────────────────────────
    const leads = [
      {
        fullName: 'Priya Sharma',
        email: 'priya@example.com',
        phone: '+9779811111001',
        status: 'new',
        source: 'facebook',
        programInterest: 'MBA',
        destinationCountry: 'UK',
        assignedCounsellor: counsellor1._id,
        createdBy: admin._id,
      },
      {
        fullName: 'Rajan Karki',
        email: 'rajan@example.com',
        phone: '+9779811111002',
        status: 'contacted',
        source: 'instagram',
        programInterest: 'Computer Science',
        destinationCountry: 'Canada',
        assignedCounsellor: counsellor1._id,
        attemptCount: 2,
        createdBy: admin._id,
      },
      {
        fullName: 'Sunita Rai',
        email: 'sunita@example.com',
        phone: '+9779811111003',
        status: 'interested',
        source: 'website',
        programInterest: 'Nursing',
        destinationCountry: 'Australia',
        assignedCounsellor: counsellor2._id,
        createdBy: admin._id,
      },
      {
        fullName: 'Bikram Shrestha',
        email: 'bikram@example.com',
        phone: '+9779811111004',
        status: 'docs_received',
        source: 'referral',
        programInterest: 'Engineering',
        destinationCountry: 'USA',
        assignedCounsellor: counsellor2._id,
        createdBy: admin._id,
      },
      {
        fullName: 'Anita Gurung',
        email: 'anita@example.com',
        phone: '+9779811111005',
        status: 'enrolled',
        source: 'facebook',
        programInterest: 'Business Administration',
        destinationCountry: 'UK',
        assignedCounsellor: counsellor1._id,
        enrolledAt: new Date(),
        createdBy: admin._id,
      },
      {
        fullName: 'Dipesh Tamang',
        email: 'dipesh@example.com',
        phone: '+9779811111006',
        status: 'lost',
        source: 'instagram',
        programInterest: 'Medicine',
        destinationCountry: 'Ireland',
        assignedCounsellor: counsellor2._id,
        lostReason: 'Could not afford tuition fees',
        lostReasonCategory: 'financial',
        lostAt: new Date(),
        createdBy: admin._id,
      },
    ]

    await Lead.insertMany(leads)
    console.log('✅  Leads created')

    console.log('\n🎉  Seed complete!\n')
    console.log('─────────────────────────────────────')
    console.log('📋 Admin & Staff Accounts:')
    console.log('  admin@bostoncrm.com       Admin@123!')
    console.log('  sarah@bostoncrm.com       Staff@123!')
    console.log('  ram@bostoncrm.com         Staff@123!')
    console.log('  docs@bostoncrm.com        Staff@123!')
    console.log('  appteam@bostoncrm.com     Staff@123!')
    console.log('─────────────────────────────────────')
    console.log('👤 Student Accounts:')
    console.log('  meera@example.com         Student@123!')
    console.log('  kolmal@example.com        Student@123!')
    console.log('─────────────────────────────────────')

    process.exit(0)
  } catch (err) {
    console.error('Seed error:', err)
    process.exit(1)
  }
}

seed()
