import React, { useState } from 'react';

const ComplexityButton = ({ cppCode }) => {
  const [showComplexity, setShowComplexity] = useState(false);
  const [complexity, setComplexity] = useState('');
  const [loading, setLoading] = useState(false);

  const analyzeComplexity = async () => {
    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      if (!apiKey) {
        throw new Error('API key not found');
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert in algorithm complexity analysis. Answer very briefly with just the complexity.'
            },
            {
              role: 'user',
              content: `What is the time complexity for this algorithm? Please only respond with the complexity notation (e.g. O(n), O(n²), O(log n), etc.) and nothing else.\n\n${cppCode}`
            }
          ],
          temperature: 0.3,
          max_tokens: 50
        })
      });

      const data = await response.json();
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        // Extract just the complexity notation (O(...)) from the response
        const complexityRegex = /O\([^)]+\)/i;
        const match = data.choices[0].message.content.match(complexityRegex);
        
        if (match) {
          setComplexity(match[0]);
        } else {
          // Use the whole response if we can't extract just the notation
          setComplexity(data.choices[0].message.content.trim());
        }
      } else {
        throw new Error('Unexpected API response');
      }
    } catch (error) {
      console.error('Error analyzing complexity:', error);
      setComplexity('Nu am putut determina complexitatea');
    } finally {
      setLoading(false);
    }
  };

  const toggleComplexity = () => {
    if (!showComplexity && !complexity) {
      analyzeComplexity();
    }
    setShowComplexity(!showComplexity);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleComplexity}
        className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-5 rounded-2xl hover:cursor-pointer transition-colors duration-300"
      >
        Arata Complexitate
      </button>
      
      {showComplexity && (
        <div className="absolute top-full right-0 mt-2 bg-gray-800 text-white p-3 rounded shadow-lg z-50 min-w-[200px]">
          <h3 className="font-bold mb-1 border-b border-gray-600 pb-1">Complexitate algoritm:</h3>
          {loading ? (
            <p className="text-gray-300">Se analizează...</p>
          ) : (
            <p className="text-lg">{complexity}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ComplexityButton;
