import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import Transaction from '@/models/Transaction';
import Job from '@/models/Job';
import Invoice from '@/models/Invoice';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in .env.local');
    process.exit(1);
}

const DATA_DIR = path.join(process.cwd(), 'public', 'data');

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI as string);
        console.log('Connected to MongoDB.');

        // Clear existing data
        console.log('Clearing existing data...');
        try { await Transaction.deleteMany({}); } catch (e) { console.log('Transaction collection might not exist yet'); }
        try { await Job.deleteMany({}); } catch (e) { console.log('Job collection might not exist yet'); }
        try { await Invoice.deleteMany({}); } catch (e) { console.log('Invoice collection might not exist yet'); }
        console.log('Cleared existing data.');

        // Read and seed Transactions
        const transactionsPath = path.join(DATA_DIR, 'setu_account_response_v3.json');
        if (fs.existsSync(transactionsPath)) {
            const transactionsData = JSON.parse(fs.readFileSync(transactionsPath, 'utf-8'));
            console.log(`Seeding ${transactionsData.length} transactions...`);
            await Transaction.insertMany(transactionsData);
        } else {
            console.warn(`Warning: ${transactionsPath} not found.`);
        }

        // Read and seed Jobs
        const jobsPath = path.join(DATA_DIR, 'dummy_job_feed_v3.json');
        if (fs.existsSync(jobsPath)) {
            const jobsDataRaw = JSON.parse(fs.readFileSync(jobsPath, 'utf-8'));
            const jobsData = jobsDataRaw.map((job: any) => ({
                ...job,
                client_payment_verified: job.client_payment_verified === 'True' || job.client_payment_verified === true,
                deadline: job.deadline ? new Date(job.deadline) : undefined,
                // Ensure status matches enum if needed, or let it be flexible if schema allows
                status: job.job_status === "Assigned" ? "InProgress" : (job.job_status === "Completed" ? "Completed" : "Open"),
                clientId: job.client_id, // Mapping for our schema
                clientName: job.company_name
            }));
            console.log(`Seeding ${jobsData.length} jobs...`);
            await Job.insertMany(jobsData);
        } else {
            console.warn(`Warning: ${jobsPath} not found.`);
        }

        // Read and seed Invoices
        const invoicesPath = path.join(DATA_DIR, 'overdue_invoices_v3.json');
        if (fs.existsSync(invoicesPath)) {
            const invoicesData = JSON.parse(fs.readFileSync(invoicesPath, 'utf-8'));
            console.log(`Seeding ${invoicesData.length} invoices...`);
            await Invoice.insertMany(invoicesData);
        } else {
            console.warn(`Warning: ${invoicesPath} not found.`);
        }

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error: any) {
        console.error('Error seeding database:', error.message);
        if (error.cause) console.error('Cause:', error.cause);
        process.exit(1);
    }
}

seed();
