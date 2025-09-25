const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const prisma = new PrismaClient();

async function debugExpenses() {
  try {
    console.log('🔍 Debugging expense data...');
    
    // Get ALL expenses first
    const allExpenses = await prisma.record.findMany({
      orderBy: { date: 'desc' }
    });
    
    console.log(`📊 Total expenses in database: ${allExpenses.length}`);
    console.log(`💰 Total amount: $${allExpenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}`);
    
    // Show all expenses with dates
    console.log('\n📋 All expenses:');
    allExpenses.forEach((expense, index) => {
      console.log(`${index + 1}. ${expense.text} - $${expense.amount} (${expense.date.toISOString().split('T')[0]})`);
    });
    
    // Filter for September 2025
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    console.log(`\n🗓️ September 2025 filter: ${start.toISOString()} to ${end.toISOString()}`);
    
    const septExpenses = await prisma.record.findMany({
      where: {
        date: {
          gte: start,
          lte: end
        }
      },
      orderBy: { date: 'desc' }
    });
    
    console.log(`\n📊 September expenses found: ${septExpenses.length}`);
    console.log(`💰 September total: $${septExpenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}`);
    
    console.log('\n📋 September expenses:');
    septExpenses.forEach((expense, index) => {
      console.log(`${index + 1}. ${expense.text} - $${expense.amount} (${expense.date.toISOString().split('T')[0]})`);
    });
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugExpenses();