const fetchPortfolioData = async () => {
  const API_URL = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(/\/+$/, "");
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
        console.log(`[Portfolio Fetch] Attempt ${attempt}/${MAX_RETRIES}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        const res = await fetch(`${API_URL}/getPortfolio`, {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const result = await res.json();
        console.log("Fetched data:", result);

        // Check for error in response
        if (result.error) {
            console.error("Backend error:", result.message);
            // Return empty data structure to prevent frontend crash
            return [{ Data: [], error: true, message: result.message }];
        }

        if (Array.isArray(result)) {
            return result;  // Return the array if valid
        } else {
            console.warn("Fetched data is not an array, wrapping in array.");
            return [result];  // Wrap in array if it's a single object
        }
    } catch (error) {
        console.error(`[Portfolio Fetch] Attempt ${attempt} failed:`, error.message);
        if (attempt < MAX_RETRIES) {
            console.log(`[Portfolio Fetch] Retrying in ${RETRY_DELAY}ms...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        } else {
            console.error("[Portfolio Fetch] All retries failed");
            // Return empty data structure to prevent frontend crash
            return [{ Data: [], error: true, message: error.message }];
        }
    }
  }
};

export default fetchPortfolioData;
