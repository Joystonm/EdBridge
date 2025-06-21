const axios = require('axios');

/**
 * Service for interacting with the Tavily API for search functionality
 */
class TavilyService {
  constructor() {
    this.apiKey = process.env.TAVILY_API_KEY;
    this.baseURL = 'https://api.tavily.com/v1';
    
    if (!this.apiKey) {
      console.error('TAVILY_API_KEY is not set in environment variables');
    }
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
    
    console.log(`Searching Tavily for: "${searchQuery}"`);
    
    try {
      const response = await axios.post(`${this.baseURL}/search`, {
        api_key: this.apiKey,
        query: searchQuery,
        search_depth: "advanced",
        include_domains: [
          "khanacademy.org",
          "teacherspayteachers.com",
          "edutopia.org",
          "education.com",
          "pbslearningmedia.org",
          "lessonplanet.com",
          "teachingchannel.org",
          "readwritethink.org",
          "commonlit.org",
          "youtube.com",
          "ted.com",
          "nationalgeographic.com",
          "nasa.gov",
          "brainpop.com",
          "scholastic.com",
          "discoveryeducation.com"
        ],
        max_results: maxResults || 5
      });
      
      console.log('Tavily API response received:', response.status);
      
      if (response.data && response.data.results) {
        const formattedResults = this.formatSearchResults(response.data.results, resourceType);
        console.log(`Found ${formattedResults.length} resources`);
        return formattedResults;
      }
      
      console.log('No results found from Tavily');
      // Return some default resources if Tavily doesn't return any
      return this.getDefaultResources(topic);
    } catch (error) {
      console.error('Error calling Tavily API:', error.response ? error.response.data : error.message);
      
      // Return default resources instead of empty array
      console.log('Returning default resources due to Tavily API error');
      return this.getDefaultResources(topic);
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
        // Make sure we only use valid enum values
        if (['video', 'article', 'interactive', 'image', 'document', 'other'].includes(resourceType)) {
          type = resourceType;
        } else {
          type = 'other';
        }
      }
      
      // Clean up and format the title
      let title = result.title || 'Resource';
      if (title.length > 100) {
        title = title.substring(0, 97) + '...';
      }
      
      // Clean up and format the description
      let description = result.content || 'No description available';
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

  /**
   * Get default resources when Tavily API fails or returns no results
   */
  getDefaultResources(topic) {
    const cleanTopic = encodeURIComponent(topic);
    return [
      {
        title: `Khan Academy: ${topic}`,
        description: `Learn about ${topic} with Khan Academy's comprehensive lessons and practice exercises.`,
        url: `https://www.khanacademy.org/search?page_search_query=${cleanTopic}`,
        source: 'khanacademy.org',
        type: 'interactive'
      },
      {
        title: `YouTube Educational Videos on ${topic}`,
        description: `Watch educational videos about ${topic} from various creators and educational channels.`,
        url: `https://www.youtube.com/results?search_query=${cleanTopic}+educational`,
        source: 'youtube.com',
        type: 'video'
      },
      {
        title: `National Geographic: ${topic}`,
        description: `Explore ${topic} through National Geographic's educational resources and articles.`,
        url: `https://www.nationalgeographic.com/search?q=${cleanTopic}`,
        source: 'nationalgeographic.com',
        type: 'article'
      },
      {
        title: `PBS Learning Media: ${topic}`,
        description: `Access PBS Learning Media's collection of educational resources about ${topic}.`,
        url: `https://www.pbslearningmedia.org/search/?q=${cleanTopic}`,
        source: 'pbslearningmedia.org',
        type: 'video'
      },
      {
        title: `Teachers Pay Teachers: ${topic} Resources`,
        description: `Find teacher-created resources, worksheets, and activities for teaching ${topic}.`,
        url: `https://www.teacherspayteachers.com/Browse/Search:${cleanTopic}`,
        source: 'teacherspayteachers.com',
        type: 'document'
      }
    ];
  }
}

module.exports = new TavilyService();
