// ================================================
// PDF LAW PROCESSOR - SAUDI LEGAL AI SYSTEM
// ================================================
// This script processes PDF files from C:\Users\User\Desktop\law
// and loads them into the MongoDB database for AI consultation

const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const mongoose = require('mongoose');

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://aalwabel:RvdRFdgsd7GSQBcA@cluster0.qih14yv.mongodb.net/saudi-legal-ai?retryWrites=true&w=majority&appName=Cluster0';

// Path to law PDFs
const LAW_DIRECTORY = 'C:\\Users\\User\\Desktop\\law';

// ================================================
// LEGAL DOCUMENT SCHEMA
// ================================================
const LegalDocumentSchema = new mongoose.Schema({
  fileName: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  titleAr: String,
  category: { 
    type: String, 
    enum: ['labor', 'commercial', 'family', 'criminal', 'civil', 'administrative', 'other'],
    default: 'other'
  },
  fullText: { type: String, required: true },
  extractedDate: { type: Date, default: Date.now },
  fileSize: Number,
  pageCount: Number,
  searchableText: String, // Processed text for better search
  keywords: [String],
  articles: [{
    number: String,
    title: String,
    content: String
  }],
  metadata: {
    source: { type: String, default: 'C:\\Users\\User\\Desktop\\law' },
    processingDate: { type: Date, default: Date.now },
    version: String
  }
});

// Create text index for search
LegalDocumentSchema.index({ fullText: 'text', searchableText: 'text', title: 'text' });

const LegalDocument = mongoose.model('LegalDocument', LegalDocumentSchema);

// ================================================
// PDF PROCESSING FUNCTIONS
// ================================================

/**
 * Detect category from filename
 */
function detectCategory(fileName) {
  const name = fileName.toLowerCase();
  
  if (name.includes('عمل') || name.includes('labor')) return 'labor';
  if (name.includes('تجار') || name.includes('شركات') || name.includes('commercial')) return 'commercial';
  if (name.includes('أحوال') || name.includes('أسر') || name.includes('family')) return 'family';
  if (name.includes('جزائ') || name.includes('جنائ') || name.includes('criminal')) return 'criminal';
  if (name.includes('مدن') || name.includes('civil')) return 'civil';
  if (name.includes('إدار') || name.includes('admin')) return 'administrative';
  
  return 'other';
}

/**
 * Extract keywords from text
 */
function extractKeywords(text) {
  const keywords = new Set();
  
  // Common legal terms in Arabic
  const legalTerms = [
    'نظام', 'قانون', 'مادة', 'فصل', 'باب', 'لائحة', 'قرار', 'مرسوم',
    'حق', 'واجب', 'التزام', 'عقد', 'عقوبة', 'غرامة', 'تعويض',
    'محكمة', 'قاض', 'دعوى', 'حكم', 'استئناف', 'نقض'
  ];
  
  legalTerms.forEach(term => {
    if (text.includes(term)) {
      keywords.add(term);
    }
  });
  
  return Array.from(keywords);
}

/**
 * Extract articles from text
 */
function extractArticles(text) {
  const articles = [];
  
  // Pattern to match articles: المادة (رقم) or Article (number)
  const articlePatterns = [
    /المادة\s+(\d+)[:\s]+([\s\S]*?)(?=المادة\s+\d+|$)/g,
    /المادة\s+\((\d+)\)[:\s]+([\s\S]*?)(?=المادة\s+\(|$)/g
  ];
  
  articlePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const articleNumber = match[1];
      let content = match[2].trim();
      
      // Limit content length to avoid very long articles
      if (content.length > 2000) {
        content = content.substring(0, 2000) + '...';
      }
      
      articles.push({
        number: articleNumber,
        title: `المادة ${articleNumber}`,
        content: content
      });
    }
  });
  
  return articles;
}

/**
 * Process a single PDF file
 */
async function processPDFFile(filePath) {
  try {
    console.log(`\n📄 Processing: ${path.basename(filePath)}`);
    
    // Read PDF file
    const dataBuffer = fs.readFileSync(filePath);
    const stats = fs.statSync(filePath);
    
    // Parse PDF
    const data = await pdf(dataBuffer);
    
    const fileName = path.basename(filePath);
    const fullText = data.text;
    const pageCount = data.numpages;
    
    // Process text
    const category = detectCategory(fileName);
    const keywords = extractKeywords(fullText);
    const articles = extractArticles(fullText);
    
    // Create searchable text (remove extra whitespace)
    const searchableText = fullText.replace(/\s+/g, ' ').trim();
    
    // Prepare document
    const legalDoc = {
      fileName: fileName,
      title: fileName.replace('.pdf', ''),
      titleAr: fileName.replace('.pdf', ''),
      category: category,
      fullText: fullText,
      searchableText: searchableText,
      fileSize: stats.size,
      pageCount: pageCount,
      keywords: keywords,
      articles: articles,
      metadata: {
        source: LAW_DIRECTORY,
        processingDate: new Date(),
        version: '1.0'
      }
    };
    
    // Save to database (upsert)
    await LegalDocument.findOneAndUpdate(
      { fileName: fileName },
      legalDoc,
      { upsert: true, new: true }
    );
    
    console.log(`✅ Processed: ${fileName}`);
    console.log(`   Category: ${category}`);
    console.log(`   Pages: ${pageCount}`);
    console.log(`   Articles extracted: ${articles.length}`);
    console.log(`   Keywords: ${keywords.length}`);
    console.log(`   Text length: ${fullText.length} characters`);
    
    return {
      success: true,
      fileName: fileName,
      category: category,
      pageCount: pageCount,
      articlesCount: articles.length
    };
    
  } catch (error) {
    console.error(`❌ Error processing ${path.basename(filePath)}:`, error.message);
    return {
      success: false,
      fileName: path.basename(filePath),
      error: error.message
    };
  }
}

/**
 * Process all PDF files in directory
 */
async function processAllLawPDFs() {
  try {
    console.log('🚀 Starting PDF Law Processing...');
    console.log(`📁 Source Directory: ${LAW_DIRECTORY}`);
    
    // Connect to MongoDB
    console.log('\n🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check if directory exists
    if (!fs.existsSync(LAW_DIRECTORY)) {
      throw new Error(`Directory not found: ${LAW_DIRECTORY}`);
    }
    
    // Get all PDF files
    const files = fs.readdirSync(LAW_DIRECTORY)
      .filter(file => file.toLowerCase().endsWith('.pdf'))
      .map(file => path.join(LAW_DIRECTORY, file));
    
    console.log(`\n📚 Found ${files.length} PDF files`);
    
    if (files.length === 0) {
      console.log('⚠️ No PDF files found in directory');
      return;
    }
    
    // Process each file
    const results = [];
    for (let i = 0; i < files.length; i++) {
      console.log(`\n[${i + 1}/${files.length}]`);
      const result = await processPDFFile(files[i]);
      results.push(result);
      
      // Small delay to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 PROCESSING SUMMARY');
    console.log('='.repeat(60));
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`✅ Successfully processed: ${successful} files`);
    console.log(`❌ Failed: ${failed} files`);
    
    // Category breakdown
    const categories = {};
    results.filter(r => r.success).forEach(r => {
      categories[r.category] = (categories[r.category] || 0) + 1;
    });
    
    console.log('\n📂 Documents by Category:');
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} documents`);
    });
    
    // Total articles
    const totalArticles = results
      .filter(r => r.success)
      .reduce((sum, r) => sum + (r.articlesCount || 0), 0);
    console.log(`\n📜 Total Articles Extracted: ${totalArticles}`);
    
    // Database stats
    const totalDocs = await LegalDocument.countDocuments();
    console.log(`\n💾 Total Documents in Database: ${totalDocs}`);
    
    console.log('\n✅ Processing Complete!');
    console.log('🎯 Your AI system can now use these laws for consultations');
    
  } catch (error) {
    console.error('\n❌ Fatal Error:', error.message);
    console.error(error.stack);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// ================================================
// SEARCH FUNCTION (for testing)
// ================================================
async function searchLaws(query, category = null) {
  try {
    await mongoose.connect(MONGODB_URI);
    
    const searchQuery = {
      $text: { $search: query }
    };
    
    if (category) {
      searchQuery.category = category;
    }
    
    const results = await LegalDocument.find(searchQuery)
      .select('fileName title category pageCount articles')
      .limit(5);
    
    console.log(`\n🔍 Search Results for: "${query}"`);
    console.log(`Found ${results.length} documents\n`);
    
    results.forEach((doc, i) => {
      console.log(`${i + 1}. ${doc.title}`);
      console.log(`   Category: ${doc.category}`);
      console.log(`   Pages: ${doc.pageCount}`);
      console.log(`   Articles: ${doc.articles.length}`);
      console.log('');
    });
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('Search error:', error.message);
  }
}

// ================================================
// CLI INTERFACE
// ================================================
const args = process.argv.slice(2);
const command = args[0];

if (command === 'process') {
  processAllLawPDFs();
} else if (command === 'search') {
  const query = args[1];
  const category = args[2];
  if (!query) {
    console.log('Usage: node pdf-law-processor.js search "query" [category]');
  } else {
    searchLaws(query, category);
  }
} else {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║         PDF LAW PROCESSOR - SAUDI LEGAL AI SYSTEM          ║
╚════════════════════════════════════════════════════════════╝

This tool processes PDF law files and loads them into MongoDB
for use by the AI consultation system.

📁 Source: C:\\Users\\User\\Desktop\\law
💾 Database: MongoDB Atlas (saudi-legal-ai)

USAGE:
------
1. Process all PDFs:
   node pdf-law-processor.js process

2. Search laws:
   node pdf-law-processor.js search "query" [category]

EXAMPLES:
---------
node pdf-law-processor.js process
node pdf-law-processor.js search "عمل إضافي"
node pdf-law-processor.js search "overtime" labor

CATEGORIES:
-----------
- labor (قانون العمل)
- commercial (القانون التجاري)
- family (قانون الأحوال الشخصية)
- criminal (القانون الجنائي)
- civil (القانون المدني)
- administrative (القانون الإداري)
- other (أخرى)

NOTE: Make sure MongoDB is accessible and pdf-parse is installed:
npm install pdf-parse
  `);
}

module.exports = {
  processAllLawPDFs,
  searchLaws,
  LegalDocument
};
