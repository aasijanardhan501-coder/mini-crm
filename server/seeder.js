const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Lead = require('./models/Lead');
const Activity = require('./models/Activity');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

const seedData = async () => {
  try {
    // Clear existing collections
    await User.deleteMany();
    await Lead.deleteMany();
    await Activity.deleteMany();

    console.log('Database cleared...');

    // Create 3 Users
    const users = await User.create([
      {
        name: 'Sarah Jenkins',
        email: 'admin@crm.com',
        password: 'password123',
        role: 'admin',
      },
      {
        name: 'Michael Chen',
        email: 'manager@crm.com',
        password: 'password123',
        role: 'manager',
      },
      {
        name: 'David Miller',
        email: 'viewer@crm.com',
        password: 'password123',
        role: 'viewer',
      },
    ]);

    console.log('Mock users created successfully.');
    const adminId = users[0]._id;
    const managerId = users[1]._id;

    // Helper: subtract days from today
    const daysAgo = (d) => { const dt = new Date(); dt.setDate(dt.getDate() - d); return dt; };

    // Create Mock Leads — spread across the last ~90 days
    const leadsData = [
      {
        name: 'John Doe',
        email: 'john.doe@acme.com',
        phone: '+1 555-0199',
        company: 'Acme Corporation',
        status: 'new',
        source: 'website',
        value: 5000,
        assignedTo: adminId,
        createdAt: daysAgo(2),
        notes: [
          {
            content: 'Lead filled out website contact form expressing interest in enterprise plans.',
            createdBy: adminId,
          },
        ],
      },
      {
        name: 'Alice Smith',
        email: 'alice.smith@techflow.io',
        phone: '+1 555-0144',
        company: 'TechFlow Solutions',
        status: 'contacted',
        source: 'referral',
        value: 12500,
        assignedTo: managerId,
        createdAt: daysAgo(7),
        notes: [
          {
            content: 'Initial call completed. Requested a custom feature demo next Tuesday.',
            createdBy: managerId,
          },
        ],
      },
      {
        name: 'Robert Johnson',
        email: 'rjohnson@apex.org',
        phone: '+1 555-0182',
        company: 'Apex Global',
        status: 'qualified',
        source: 'social',
        value: 8000,
        assignedTo: adminId,
        createdAt: daysAgo(14),
        notes: [
          {
            content: 'Budget and timing verified. Lead qualifies as an enterprise prospect.',
            createdBy: adminId,
          },
        ],
      },
      {
        name: 'Emma Watson',
        email: 'emma@innovate.co',
        phone: '+1 555-0155',
        company: 'Innovate LLC',
        status: 'converted',
        source: 'advertisement',
        value: 25000,
        assignedTo: managerId,
        createdAt: daysAgo(21),
        notes: [
          {
            content: 'Contract signed! Onboarding scheduled for next month.',
            createdBy: managerId,
          },
        ],
      },
      {
        name: 'James Cooper',
        email: 'jcooper@lostcorp.com',
        phone: '+1 555-0121',
        company: 'Lost Solutions Inc',
        status: 'lost',
        source: 'other',
        value: 3000,
        assignedTo: adminId,
        createdAt: daysAgo(30),
        notes: [
          {
            content: 'Prospect chose competitor due to lower pricing models.',
            createdBy: adminId,
          },
        ],
      },
      {
        name: 'Olivia Brown',
        email: 'olivia.brown@retailtech.com',
        phone: '+1 555-0177',
        company: 'Retail Tech Group',
        status: 'new',
        source: 'website',
        value: 4500,
        assignedTo: managerId,
        createdAt: daysAgo(38),
        notes: [],
      },
      {
        name: 'William Davis',
        email: 'wdavis@cyberguard.net',
        phone: '+1 555-0163',
        company: 'CyberGuard Systems',
        status: 'contacted',
        source: 'referral',
        value: 18000,
        assignedTo: adminId,
        createdAt: daysAgo(47),
        notes: [
          {
            content: 'Sent detailed API documentation and compliance sheets.',
            createdBy: adminId,
          },
        ],
      },
      {
        name: 'Sophia Martinez',
        email: 'sophia@marketpulse.com',
        phone: '+1 555-0105',
        company: 'MarketPulse Agency',
        status: 'qualified',
        source: 'social',
        value: 9500,
        assignedTo: managerId,
        createdAt: daysAgo(60),
        notes: [
          {
            content: 'Completed requirement mapping session. Decision-maker is CEO.',
            createdBy: managerId,
          },
        ],
      },
      {
        name: 'Liam Wilson',
        email: 'liam@wilsonlogistics.com',
        phone: '+1 555-0130',
        company: 'Wilson Logistics',
        status: 'converted',
        source: 'website',
        value: 15000,
        assignedTo: adminId,
        createdAt: daysAgo(75),
        notes: [
          {
            content: 'Closed deal. First payment invoice processed.',
            createdBy: adminId,
          },
        ],
      },
      {
        name: 'Mia Anderson',
        email: 'mia.a@pixelperfect.design',
        phone: '+1 555-0111',
        company: 'PixelPerfect Design',
        status: 'new',
        source: 'advertisement',
        value: 6200,
        assignedTo: managerId,
        createdAt: daysAgo(90),
        notes: [],
      },
    ];

    const leads = await Lead.insertMany(leadsData, { timestamps: false });
    console.log(`${leads.length} mock leads created successfully.`);

    // Create Activity Logs
    const activitiesData = [
      {
        leadId: leads[0]._id,
        userId: adminId,
        action: 'created',
        description: `Lead '${leads[0].name}' created from web contact form submission.`,
      },
      {
        leadId: leads[1]._id,
        userId: managerId,
        action: 'created',
        description: `Lead '${leads[1].name}' created via admin referral.`,
      },
      {
        leadId: leads[1]._id,
        userId: managerId,
        action: 'note_added',
        description: `Note added to Lead '${leads[1].name}' by Michael Chen`,
      },
      {
        leadId: leads[3]._id,
        userId: managerId,
        action: 'status_changed',
        description: `Lead status updated from 'qualified' to 'converted' by Michael Chen`,
        changes: {
          status: { old: 'qualified', new: 'converted' },
        },
      },
      {
        leadId: leads[4]._id,
        userId: adminId,
        action: 'status_changed',
        description: `Lead status updated from 'contacted' to 'lost' by Sarah Jenkins`,
        changes: {
          status: { old: 'contacted', new: 'lost' },
        },
      },
    ];

    await Activity.create(activitiesData);
    console.log('Mock activities logged successfully.');

    console.log('Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedData();
