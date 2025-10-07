// ================================================
// ENHANCED AI CONSULTATION WITH PDF LAWS
// ================================================
// This module integrates the PDF law database with AI consultation

const mongoose = require('mongoose');

// Import the LegalDocument model
const LegalDocumentSchema = new mongoose.Schema({
  fileName: String,
  title: String,
  titleAr: String,
  category: String,
  fullText: String,
  searchableText: String,
  fileSize: Number,
  pageCount: Number,
  keywords: [String],
  articles: [{
    number: String,
    title: String,
    content: String
  }],
  metadata: Object,
  extractedDate: Date
});

LegalDocumentSchema.index({ fullText: 'text', searchableText: 'text', title: 'text' });

const LegalDocument = mongoose.model('LegalDocument', LegalDocumentSchema);

/**
 * Search relevant laws from PDF database
 */
async function searchRelevantLaws(question, caseType, limit = 3) {
  try {
    // Build search query
    const searchQuery = {
      $text: { $search: question }
    };
    
    // Filter by category if specified
    if (caseType && caseType !== 'general') {
      searchQuery.category = caseType;
    }
    
    // Search with text score
    const results = await LegalDocument.find(searchQuery, {
      score: { $meta: 'textScore' }
    })
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .select('fileName title category articles fullText');
    
    return results;
    
  } catch (error) {
    console.error('Error searching laws:', error.message);
    return [];
  }
}

/**
 * Find specific articles matching the query
 */
async function findRelevantArticles(question, caseType, limit = 5) {
  try {
    const laws = await searchRelevantLaws(question, caseType, 3);
    
    const relevantArticles = [];
    
    for (const law of laws) {
      if (law.articles && law.articles.length > 0) {
        // Search within articles
        const matchingArticles = law.articles.filter(article => {
          const content = (article.content || '').toLowerCase();
          const questionLower = question.toLowerCase();
          
          // Simple relevance check
          const words = questionLower.split(' ').filter(w => w.length > 3);
          const matches = words.filter(word => content.includes(word));
          
          return matches.length > 0;
        });
        
        matchingArticles.forEach(article => {
          relevantArticles.push({
            lawTitle: law.title,
            category: law.category,
            articleNumber: article.number,
            articleTitle: article.title,
            content: article.content,
            source: law.fileName
          });
        });
      }
    }
    
    return relevantArticles.slice(0, limit);
    
  } catch (error) {
    console.error('Error finding articles:', error.message);
    return [];
  }
}

/**
 * Generate AI response using PDF law database
 */
async function generateAIResponseWithPDFLaws(question, language, caseType) {
  try {
    const isArabic = language === 'ar';
    
    // Search for relevant laws
    const relevantLaws = await searchRelevantLaws(question, caseType, 3);
    const relevantArticles = await findRelevantArticles(question, caseType, 5);
    
    // Check if we found relevant content
    if (relevantLaws.length === 0 && relevantArticles.length === 0) {
      return {
        answer: isArabic ? 
          'لم يتم العثور على معلومات قانونية محددة في قاعدة البيانات. يرجى إعادة صياغة السؤال أو تقديم المزيد من التفاصيل.' :
          'No specific legal information found in the database. Please rephrase your question or provide more details.',
        references: [],
        confidence: 0.3,
        source: 'pdf_database',
        lawsFound: 0
      };
    }
    
    // Build comprehensive answer
    let answer = '';
    const references = [];
    
    if (isArabic) {
      answer = `بناءً على الأنظمة السعودية المتوفرة في قاعدة البيانات:\n\n`;
      
      // Add relevant articles
      if (relevantArticles.length > 0) {
        answer += `📜 المواد القانونية ذات الصلة:\n\n`;
        relevantArticles.forEach((article, i) => {
          answer += `${i + 1}. ${article.articleTitle} - ${article.lawTitle}\n`;
          answer += `   ${article.content.substring(0, 300)}${article.content.length > 300 ? '...' : ''}\n\n`;
          
          references.push({
            title: article.lawTitle,
            article: article.articleTitle,
            relevance: 'high',
            source: article.source
          });
        });
      }
      
      // Add law summaries
      if (relevantLaws.length > 0) {
        answer += `\n📚 الأنظمة المرجعية:\n`;
        relevantLaws.forEach((law, i) => {
          answer += `${i + 1}. ${law.title} (${law.category})\n`;
          answer += `   عدد الصفحات: ${law.pageCount || 'غير محدد'}\n`;
          answer += `   عدد المواد: ${law.articles.length}\n\n`;
          
          if (!references.find(r => r.title === law.title)) {
            references.push({
              title: law.title,
              relevance: 'medium',
              source: law.fileName
            });
          }
        });
      }
      
      answer += `\n💡 ملاحظة: هذه المعلومات مستخرجة من الأنظمة السعودية الرسمية المحملة في قاعدة البيانات.`;
      
    } else {
      answer = `Based on Saudi laws available in the database:\n\n`;
      
      // Add relevant articles
      if (relevantArticles.length > 0) {
        answer += `📜 Relevant Legal Articles:\n\n`;
        relevantArticles.forEach((article, i) => {
          answer += `${i + 1}. ${article.articleTitle} - ${article.lawTitle}\n`;
          answer += `   ${article.content.substring(0, 300)}${article.content.length > 300 ? '...' : ''}\n\n`;
          
          references.push({
            title: article.lawTitle,
            article: article.articleTitle,
            relevance: 'high',
            source: article.source
          });
        });
      }
      
      // Add law summaries
      if (relevantLaws.length > 0) {
        answer += `\n📚 Reference Laws:\n`;
        relevantLaws.forEach((law, i) => {
          answer += `${i + 1}. ${law.title} (${law.category})\n`;
          answer += `   Pages: ${law.pageCount || 'N/A'}\n`;
          answer += `   Articles: ${law.articles.length}\n\n`;
          
          if (!references.find(r => r.title === law.title)) {
            references.push({
              title: law.title,
              relevance: 'medium',
              source: law.fileName
            });
          }
        });
      }
      
      answer += `\n💡 Note: This information is extracted from official Saudi laws loaded in the database.`;
    }
    
    // Calculate confidence based on findings
    const confidence = Math.min(0.95, 0.6 + (relevantArticles.length * 0.1) + (relevantLaws.length * 0.05));
    
    return {
      answer: answer,
      references: references,
      confidence: confidence,
      source: 'pdf_database',
      lawsFound: relevantLaws.length,
      articlesFound: relevantArticles.length,
      processingTime: Date.now()
    };
    
  } catch (error) {
    console.error('Error generating AI response:', error.message);
    
    return {
      answer: language === 'ar' ? 
        'حدث خطأ في معالجة الاستفسار. يرجى المحاولة مرة أخرى.' :
        'An error occurred processing your query. Please try again.',
      references: [],
      confidence: 0.0,
      error: error.message
    };
  }
}

/**
 * Get statistics about loaded laws
 */
async function getLawDatabaseStats() {
  try {
    const totalDocs = await LegalDocument.countDocuments();
    
    const categories = await LegalDocument.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalPages: { $sum: '$pageCount' },
          totalArticles: { $sum: { $size: '$articles' } }
        }
      }
    ]);
    
    return {
      totalDocuments: totalDocs,
      categories: categories,
      lastUpdate: new Date()
    };
    
  } catch (error) {
    console.error('Error getting stats:', error.message);
    return null;
  }
}

module.exports = {
  searchRelevantLaws,
  findRelevantArticles,
  generateAIResponseWithPDFLaws,
  getLawDatabaseStats,
  LegalDocument
};
