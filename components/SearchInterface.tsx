import React, { useState, useEffect } from "react";

const SearchInterface = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const navItems = [
    { key: "taleem", href: "Taleemat", color: "#0b2d52" },
    { key: "mehfils", href: "Mehfils", color: "#efc54f" },
    { key: "naat", href: "Naat-Shareef", color: "#f29d65" },
  ];

  const fetchSearchResults = async (query, type) => {
    if (!query || !type) return;

    setIsLoading(true);
    setError(null);

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/search?query=${query}&type=${type.toLowerCase()}`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch results: ${response.statusText}`);
      }
      const data = await response.json();

      setSearchResults(data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error fetching results.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (searchQuery && selectedCategory) {
        fetchSearchResults(searchQuery, selectedCategory);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, selectedCategory]);

  const handleResultClick = (result) => {
    if (selectedCategory === "taleem") {
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="w-full px-4 py-6" style={{ backgroundColor: "#fcf8f5" }}>
        <div className="max-w-4xl mx-auto relative">
          <input
            type="text"
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            placeholder="Search in English or Urdu"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="max-w-4xl mx-auto flex flex-wrap justify-between mt-3">
        <div className="flex flex-wrap gap-4 p-4">
      {navItems.map((item: any, index: number) => (
        <button
          key={index}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:ring focus:ring-blue-300 transition text-black"
        >
          {item.label}
        </button>
      ))}
    </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg my-4">
              {error}
            </div>
          )}

          {searchResults.length > 0 && searchQuery && (
            <ul className="absolute w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-2 max-h-60 overflow-y-auto z-10">
              {searchResults.map((result: any, index: number) => (
                <li
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleResultClick(result)}
                >
                  <h3 className="text-xl font-semibold text-gray-900">
                    {result.title_en}
                  </h3>
                  {result.track && (
                    <p className="text-gray-600 mt-2">{result.track}</p>
                  )}
                </li>
              ))}
            </ul>
          )}

          {!isLoading &&
            !error &&
            selectedCategory &&
            searchResults.length === 0 &&
            searchQuery && (
              <div className="text-center py-8 bg-white rounded-lg">
                <p className="text-gray-500">
                  No results found for "{searchQuery}" in {selectedCategory}.
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SearchInterface;
