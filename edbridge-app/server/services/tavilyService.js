const axios = require('axios');

/**
 * Service for interacting with the Tavily API for search functionality
 */
class TavilyService {
  constructor() {
    this.apiKey = process.env.TAVILY_API_KEY;
    this.baseURL = 'https://api.tavily.com/v1';
  }

  /**
   * Initialize the API client with authentication
   */
  getClient() {
    return axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Search for educational resources based on topic and filters
   */
  async searchResources(params) {
    const { topic, resourceType, maxResults } = params;
    
    // Construct search query based on parameters
    let searchQuery = topic;
    if (resourceType && resourceType !== 'all') {
      searchQuery += ` ${resourceType}`;
    }
    
    try {
      const client = this.getClient();
      const response = await client.post('/search', {
        query: searchQuery,
        search_depth: 'advanced',
        include_domains: [
          'khanacademy.org',
          'teacherspayteachers.com',
          'edutopia.org',
          'education.com',
          'pbslearningmedia.org',
          'lessonplanet.com',
          'teachingchannel.org',
          'readwritethink.org',
          'commonlit.org',
          'youtube.com',
          'ted.com',
          'nationalgeographic.com',
          'nasa.gov',
          'brainpop.com',
          'scholastic.com',
          'discoveryeducation.com'
        ],
        max_results: maxResults || 5
      });
      
      if (response.data && response.data.results) {
        return this.formatSearchResults(response.data.results, resourceType);
      }
      
      return [];
    } catch (error) {
      console.error('Error calling Tavily API for resource search:', error);
      throw new Error('Failed to search for educational resources');
    }
  }

  /**
   * Format search results into a consistent structure
   */
  formatSearchResults(results, resourceType) {
    return results.map(result => {
      // Determine resource type based on URL or content
      let type = 'article';
      
      if (result.url.includes('youtube.com') || 
          result.url.includes('vimeo.com') || 
          result.url.includes('ted.com/talks')) {
        type = 'video';
      } else if (result.url.includes('.pdf')) {
        type = 'document';
      } else if (result.url.includes('interactive') || 
                result.url.includes('game') || 
                result.url.includes('quiz') || 
                result.url.includes('activity')) {
        type = 'interactive';
      } else if (result.url.includes('image') || 
                result.url.includes('photo') || 
                result.url.includes('infographic')) {
        type = 'image';
      } else if (resourceType && resourceType !== 'all') {
        type = resourceType;
      }
      
      // Clean up and format the title
      let title = result.title;
      if (title.length > 100) {
        title = title.substring(0, 97) + '...';
      }
      
      // Clean up and format the description
      let description = result.content;
      if (description.length > 200) {
        // Try to find a sentence break near 200 characters
        const sentenceBreak = description.substring(150, 250).search(/[.!?]/);
        if (sentenceBreak !== -1) {
          description = description.substring(0, 150 + sentenceBreak + 1);
        } else {
          description = description.substring(0, 197) + '...';
        }
      }
      
      return {
        title: title,
        description: description,
        url: result.url,
        source: new URL(result.url).hostname.replace('www.', ''),
        type: type
      };
    });
  }
}

module.exports = new TavilyService();
